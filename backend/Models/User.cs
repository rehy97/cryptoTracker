using System;

namespace backend.models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime RegistrationDate { get; set; }
        public DateTime? LastLogin { get; set; }
        public ICollection<Watchlist> Watchlists { get; set; }
        public ICollection<Transaction> Transactions { get; set; }
    }
}