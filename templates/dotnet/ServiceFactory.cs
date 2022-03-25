public static class ServiceFactory
{
    public static WebApplication Build(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var app = builder.Build();
        app.MapGet("/", () => Results.Json(new { service = "__NAME__" }));
        app.MapGet("/health", () => Results.Json(new { status = "ok", service = "__NAME__" }));
        app.MapGet("/ready", () => Environment.GetEnvironmentVariable("READY") == "false" ? Results.Json(new { status = "unavailable" }, statusCode: 503) : Results.Json(new { status = "ready" }));
        return app;
    }
}
