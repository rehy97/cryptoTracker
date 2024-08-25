using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using backend.models;

namespace backend.db
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Portfolio> Portfolios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ensure the Id column in Transactions is auto-incrementing
            modelBuilder.Entity<Transaction>()
                .Property(t => t.Id)
                .ValueGeneratedOnAdd();

            // Define primary key for Transaction
            modelBuilder.Entity<Transaction>()
                .HasKey(t => t.Id);

            // Define relationships for Transaction
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.User)
                .WithMany(u => u.Transactions)
                .HasForeignKey(t => t.UserId);

            // Configure Portfolio entity
            modelBuilder.Entity<Portfolio>()
                .Property(p => p.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Portfolio>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<Portfolio>()
                .HasOne(p => p.User)
                .WithMany(u => u.Portfolios)
                .HasForeignKey(p => p.UserId);

            // Seed roles
            List<IdentityRole> roles = new List<IdentityRole>
            {
                new IdentityRole { Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole { Name = "User", NormalizedName = "USER" }
            };

            modelBuilder.Entity<IdentityRole>().HasData(roles);
        }
    }
}