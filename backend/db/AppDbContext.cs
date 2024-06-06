using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore.SqlServer;
using backend.models;

namespace backend.db
{
    public class AppDbContext : DbContext
    {
        protected readonly IConfiguration _config;

        public AppDbContext(IConfiguration config)
        {
            _config = config;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // configure the database connection
            optionsBuilder.UseSqlServer(_config.GetConnectionString("WebApiDatabase"));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // define the relationships between the tables
            modelBuilder.Entity<Watchlist>()
                .HasOne(w => w.User)
                .WithMany(u => u.Watchlists)
                .HasForeignKey(w => w.UserId);

            modelBuilder.Entity<Watchlist>()
                .HasOne(w => w.Cryptocurrency)
                .WithMany(c => c.Watchlists)
                .HasForeignKey(w => w.CryptocurrencyId);

            modelBuilder.Entity<CryptocurrencyCategory>()
                .HasOne(cc => cc.Cryptocurrency)
                .WithMany(c => c.CryptocurrencyCategories)
                .HasForeignKey(cc => cc.CryptocurrencyId);

            modelBuilder.Entity<CryptocurrencyCategory>()
                .HasOne(cc => cc.Category)
                .WithMany(c => c.CryptocurrencyCategories)
                .HasForeignKey(cc => cc.CategoryId);
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Watchlist> Watchlists { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Cryptocurrency> Cryptocurrencies { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<CryptocurrencyCategory> CryptocurrencyCategories { get; set; }
    }
}