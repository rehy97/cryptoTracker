using System;

namespace backend.models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool IsAdmin { get; set; } = false;
        public DateTime RegistrationDate { get; set; } = DateTime.Now;
        public DateTime? LastLogin { get; set; }
        public List<Watchlist> Watchlists { get; set; } = new List<Watchlist>();
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}