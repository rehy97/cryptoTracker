using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.models;
using System.Text.Json;
using System.Net;

namespace backend.Services
{
    public class CoinService
    {
        private readonly HttpClient _httpClient;
        private const string _baseUrl = "https://api.coingecko.com/api/v3/";

        public CoinService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<Coin>> GetList(string currency = "usd")
        {
                var URL = new Uri($"{_baseUrl}coins/markets?vs_currency={currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d&locale=en");
                var client = new WebClient();
                client.Headers.Add("Accepts", "application/json");
                client.Headers.Add("User-Agent: Other");
                var js = client.DownloadString(URL.ToString());
                var coins = JsonSerializer.Deserialize<List<Coin>>(js);
                return coins ?? new List<Coin>();
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
