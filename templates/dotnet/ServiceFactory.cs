public static class ServiceFactory
{
    public static WebApplication Build(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var app = builder.Build();
        app.MapGet("/", () => Results.Json(new { service = "__NAME__" }));
        return app;
    }
}
