using System;
using System.Collections.Concurrent;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly ConcurrentDictionary<string, DateTime> _lastRequestTimes = new ConcurrentDictionary<string, DateTime>();

    public RateLimitingMiddleware(RequestDelegate next, IMemoryCache cache)
    {
        _next = next;
        _cache = cache;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var key = GetRequestKey(context);
        var limit = GetRateLimit(context);

        if (IsRateLimited(key, limit))
        {
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            await context.Response.WriteAsync("Rate limit exceeded. Try again later.");
            return;
        }

        await _next(context);
    }

    private string GetRequestKey(HttpContext context)
    {
        return $"{context.Request.Path}_{context.Connection.RemoteIpAddress}";
    }

    private (int Limit, TimeSpan Window) GetRateLimit(HttpContext context)
    {
        // You can customize rate limits based on the route or user role
        return (Limit: 5, Window: TimeSpan.FromMinutes(1));
    }

    private bool IsRateLimited(string key, (int Limit, TimeSpan Window) limit)
    {
        var now = DateTime.UtcNow;

        if (!_cache.TryGetValue(key, out int requestCount))
        {
            requestCount = 0;
        }

        if (_lastRequestTimes.TryGetValue(key, out DateTime lastRequestTime))
        {
            if (now - lastRequestTime > limit.Window)
            {
                requestCount = 0;
            }
        }

        requestCount++;
        _cache.Set(key, requestCount, limit.Window);
        _lastRequestTimes[key] = now;

        return requestCount > limit.Limit;
    }
}