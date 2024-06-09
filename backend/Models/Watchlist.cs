using System;

namespace backend.models
{
    public class Watchlist
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public int? CryptocurrencyId { get; set; }
        public DateTime AddedDate { get; set; } = DateTime.Now;
        public User? User { get; set; }
        public Cryptocurrency? Cryptocurrency { get; set; }
    }
}