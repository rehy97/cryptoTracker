using System;

namespace backend.models
{
    public class Transaction
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public int? CryptocurrencyId { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public User? User { get; set; }
        public Cryptocurrency? Cryptocurrency { get; set; }
    }
}