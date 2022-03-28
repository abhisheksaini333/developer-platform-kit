using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
var app = ServiceFactory.Build(Array.Empty<string>());
app.Urls.Add("http://127.0.0.1:0");
await app.StartAsync();
try
{
    var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();
    using var client = new HttpClient { BaseAddress = new Uri(address) };
    void Check(bool condition, string message) { if (!condition) throw new Exception(message); }
    Check((await client.GetAsync("/health")).StatusCode == HttpStatusCode.OK, "Liveness");
    Check((await client.GetAsync("/ready")).StatusCode == HttpStatusCode.OK, "Readiness");
    Check((int)(await client.PostAsJsonAsync("/items", new { title = "" })).StatusCode == 422, "Reject blank title");
    Check((await client.PostAsJsonAsync("/items", new { title = "Review deployment" })).StatusCode == HttpStatusCode.Created, "Create item");
    Check((await client.GetFromJsonAsync<WorkItem[]>("/items"))!.Length == 1, "Read items");
    Check((await client.GetAsync("/missing")).StatusCode == HttpStatusCode.NotFound, "Unknown route");
    Check((await client.GetStringAsync("/openapi.json")).Contains("openapi"), "OpenAPI document");
    Console.WriteLine("7 actual ASP.NET HTTP assertions passed");
}
finally { await app.StopAsync(); await app.DisposeAsync(); }
