using System;
using Microsoft.AspNetCore.Identity;

namespace backend.models
{
    public class User : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; } = DateTime.Now;
        public bool EmailConfirmed { get; set; } = false;
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
        public List<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    }
}