using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using backend.models;
using System.Text.Json;
using System.Net.Http;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services
{
    public class CoinService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private const string _baseUrl = "https://api.coingecko.com/api/v3/";
        private const string CacheKey = "CoinList";

        public CoinService(HttpClient httpClient, IMemoryCache memoryCache)
        {
            _httpClient = httpClient;
            _cache = memoryCache;
        }
        public async Task<List<Coin>> GetList(string currency = "usd")
        {
            
            if (!_cache.TryGetValue(CacheKey, out List<Coin> cachedCoins))
            {
                Console.WriteLine("Cache miss");
                cachedCoins = await FetchAndCacheCoins(currency);
            }
            return cachedCoins;
        }

        public async Task<List<Coin>> FetchAndCacheCoins(string currency)
        {
            try
            {
                var url = $"{_baseUrl}coins/markets?vs_currency={currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d&locale=en";

                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Add("Accept", "application/json");
                request.Headers.Add("User-Agent", "MyAppName/1.0");

                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    var js = await response.Content.ReadAsStringAsync();
                    Console.WriteLine("Fetching new data from API");

                    var coins = JsonSerializer.Deserialize<List<Coin>>(js, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (coins != null && coins.Any())
                    {
                        Console.WriteLine("Caching new data");
                        _cache.Set(CacheKey, coins);
                    }

                    return coins ?? new List<Coin>();
                }
                else
                {
                    Console.WriteLine($"Error fetching coin list: {response.StatusCode} - {response.ReasonPhrase}");
                    return new List<Coin>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching coin list: {ex.Message}");
                return new List<Coin>();
            }
        }

        public async Task<Coin> GetCryptoById(string cryptocurrencyId)
        {
            var cachedCoins = await GetList(); 

            var cachedCoin = cachedCoins.FirstOrDefault(c => c.Id == cryptocurrencyId);
            if (cachedCoin != null)
            {
                Console.WriteLine("Cached coin found");
                return cachedCoin;
            }

            return cachedCoin;
        }

        public async Task<bool> CheckCryptoExists(string cryptocurrencyId)
        {
            var cachedCoins = await GetList();

            if (cachedCoins.Any(c => c.Id == cryptocurrencyId))
            {
                return true;
            }

            return false;
        }
    }
}
