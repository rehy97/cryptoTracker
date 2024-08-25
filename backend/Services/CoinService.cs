using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.models;
using System.Text.Json;
using System.Net;
using Microsoft.Extensions.Caching.Memory;
using System.Xml.Linq;

namespace backend.Services
{
    public class CoinService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private const string _baseUrl = "https://api.coingecko.com/api/v3/";
        private const string CacheKey = "CoinList";
        private const int CacheExpirationMinutes = 5;

        public CoinService(HttpClient httpClient, IMemoryCache memoryCache)
        {
            _httpClient = httpClient;
            _cache = memoryCache;
        }

        public async Task<List<Coin>> GetList(string currency = "usd")
        {
            if (_cache.TryGetValue(CacheKey, out List<Coin> cachedCoins))
            {
                return cachedCoins;
            }

            try
            {
                var URL = new Uri($"{_baseUrl}coins/markets?vs_currency={currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d&locale=en");
                var client = new WebClient();
                client.Headers.Add("Accepts", "application/json");
                client.Headers.Add("User-Agent", "Other");
                var js = client.DownloadString(URL.ToString());
                var coins = JsonSerializer.Deserialize<List<Coin>>(js);

                if (coins != null && coins.Any())
                {
                    var cacheEntryOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheExpirationMinutes));

                    _cache.Set(CacheKey, coins, cacheEntryOptions);
                }

                return coins ?? new List<Coin>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching coin list: {ex.Message}");
                return _cache.Get<List<Coin>>(CacheKey) ?? new List<Coin>();
            }
        }

        public async Task<Coin> GetCryptoById(string cryptocurrencyId)
        {
            try
            {
                var URL = new Uri($"{_baseUrl}coins/markets?vs_currency=usd&ids={cryptocurrencyId}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d&locale=en");
                using (var client = new WebClient())
                {
                    client.Headers.Add("Accepts", "application/json");
                    client.Headers.Add("User-Agent", "Other");
                    var coinJson = await client.DownloadStringTaskAsync(URL);

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                    var coins = JsonSerializer.Deserialize<List<Coin>>(coinJson, options);

                    if (coins != null && coins.Count > 0)
                    {
                        return coins[0];
                    }
                    else
                    {
                        throw new Exception($"No data found for cryptocurrency with id: {cryptocurrencyId}");
                    }
                }
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"Error fetching coin data: {e.Message}");
                throw;
            }
            catch (JsonException e)
            {
                Console.WriteLine($"Error deserializing JSON: {e.Message}");
                throw;
            }
        }
        public async Task<bool> CheckCryptoExists(string cryptocurrencyId)
        {
            try
            {
                var url = $"{_baseUrl}coins/{cryptocurrencyId}";
                HttpResponseMessage response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking cryptocurrency: {ex.Message}");
                return false;
            }
        }
    }
}
