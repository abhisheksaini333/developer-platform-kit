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
    using var correlated = new HttpRequestMessage(HttpMethod.Get, "/health");
    correlated.Headers.Add("X-Request-Id", "request-42");
    Check((await client.SendAsync(correlated)).Headers.GetValues("X-Request-Id").Single() == "request-42", "Correlation ID");
    var concurrent = await Task.WhenAll(Enumerable.Range(0, 12).Select(i => client.PostAsJsonAsync("/items", new { title = "Concurrent " + i })));
    Check(concurrent.All(r => r.StatusCode == HttpStatusCode.Created), "Concurrent creation status");
    var created = await Task.WhenAll(concurrent.Select(r => r.Content.ReadFromJsonAsync<WorkItem>()));
    Check(created.Select(item => item!.Id).Distinct().Count() == 12, "Concurrent IDs are unique");
    Check((int)(await client.PostAsync("/items", new StringContent("{broken", System.Text.Encoding.UTF8, "application/json"))).StatusCode == 400, "Malformed JSON");
    Check((int)(await client.PostAsJsonAsync("/items", new { title = new string('x', 70000) })).StatusCode == 413, "Bounded request body");
    Check((int)(await client.PostAsync("/items", new StringContent("plain"))).StatusCode == 415, "Unsupported content type");
    Environment.SetEnvironmentVariable("READY", "false");
    try { Check((int)(await client.GetAsync("/ready")).StatusCode == 503, "Unavailable readiness"); Check((await client.GetAsync("/health")).StatusCode == HttpStatusCode.OK, "Liveness during dependency failure"); }
    finally { Environment.SetEnvironmentVariable("READY", null); }
    Console.WriteLine("ASP.NET HTTP acceptance passed: health, readiness, validation, OpenAPI, correlation and concurrency");
}
finally { await app.StopAsync(); await app.DisposeAsync(); }
