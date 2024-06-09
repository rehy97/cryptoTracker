using System;

namespace backend.models
{
    public class Cryptocurrency
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal Volume24h { get; set; }
        public decimal MarketCap { get; set; }
        public List<Watchlist> Watchlists { get; set; } = new List<Watchlist>();
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
        public List<CryptocurrencyCategory> CryptocurrencyCategories { get; set; } = new List<CryptocurrencyCategory>();
    }
}