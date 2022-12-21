public static class ServiceFactory
{
    public static WebApplication Build(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 65536);
        var app = builder.Build();
        var items = new System.Collections.Concurrent.ConcurrentDictionary<int, WorkItem>();
        int nextId = 0;
        app.Use(async (context, next) => {
            var incoming = context.Request.Headers["X-Request-Id"].ToString();
            var id = System.Text.RegularExpressions.Regex.IsMatch(incoming, "^[A-Za-z0-9._-]{1,100}$") ? incoming : Guid.NewGuid().ToString("N");
            context.TraceIdentifier = id;
            context.Response.Headers["X-Request-Id"] = id;
            using var scope = app.Logger.BeginScope(new Dictionary<string, object> { ["RequestId"] = id });
            await next();
        });
        app.Use(async (context, next) => {
            if (context.Request.Method is not ("POST" or "PUT" or "PATCH")) { await next(); return; }
            var original = context.Request.Body;
            using var bounded = new MemoryStream();
            try {
                var chunk = new byte[8192];
                int count;
                while ((count = await original.ReadAsync(chunk, context.RequestAborted)) > 0) {
                    if (bounded.Length + count > 65536) {
                        context.Response.StatusCode = 413;
                        context.Response.Headers["Connection"] = "close";
                        await context.Response.WriteAsJsonAsync(new { error = "Body exceeds 64 KiB" });
                        return;
                    }
                    bounded.Write(chunk, 0, count);
                }
                bounded.Position = 0;
                context.Request.Body = bounded;
                await next();
            }
            catch (BadHttpRequestException error) when (error.StatusCode == 413) {
                context.Response.StatusCode = 413;
                        context.Response.Headers["Connection"] = "close";
                await context.Response.WriteAsJsonAsync(new { error = "Body exceeds 64 KiB" });
            }
            finally { context.Request.Body = original; }
        });
        app.MapGet("/", () => Results.Json(new { service = "__NAME__" }));
        app.MapGet("/health", () => Results.Json(new { status = "ok", service = "__NAME__" }));
        app.MapGet("/ready", () => Environment.GetEnvironmentVariable("READY") == "false" ? Results.Json(new { status = "unavailable" }, statusCode: 503) : Results.Json(new { status = "ready" }));
        app.MapGet("/items", () => Results.Json(items.Values.OrderBy(x => x.Id)));
        app.MapPost("/items", (NewWorkItem input) => {
            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 200)
                return Results.Json(new { error = "Title must contain 1-200 characters" }, statusCode: 422);
            var item = new WorkItem(Interlocked.Increment(ref nextId), input.Title.Trim());
            items[item.Id] = item;
            return Results.Created($"/items/{item.Id}", item);
        });
        app.MapGet("/openapi.json", () => Results.Content(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "openapi.json")), "application/json"));
        return app;
    }
}
