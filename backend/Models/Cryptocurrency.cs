using System;

namespace backend.models
{
    public class Cryptocurrency
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Symbol { get; set; }
        public decimal Price { get; set; }
        public decimal Volume24h { get; set; }
        public decimal MarketCap { get; set; }
        public ICollection<Watchlist> Watchlists { get; set; }
        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<CryptocurrencyCategory> CryptocurrencyCategories { get; set; }
    }
}