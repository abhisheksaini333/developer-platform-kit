var app = ServiceFactory.Build(args);
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_URLS"))) app.Urls.Add("http://0.0.0.0:__PORT__");
app.Run();
