using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.db;
using backend.models;
using backend.Services;
using backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using backend.Extensions;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PortfolioController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly CoinService _coinService;

        public PortfolioController(AppDbContext context, UserManager<User> userManager, CoinService coinService)
        {
            _context = context;
            _userManager = userManager;
            _coinService = coinService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserPortfolio()
        {
            var username = User.GetUsername();
            if (username == null)
            {
                return NotFound("User not found.");
            }

            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var portfolio = await _context.Portfolios
                .Where(p => p.UserId == user.Id)
                .Select(p => new
                {
                    p.CryptocurrencyId,
                    p.Amount,
                    p.AverageBuyPrice,
                })
                .ToListAsync();

            return Ok(portfolio);
        }

        [HttpPost("add-transaction")]
        public async Task<IActionResult> AddTransactionAndUpdatePortfolio([FromBody] NewTransactionDto transactionDto)
        {
            var username = User.GetUsername();
            if (username == null)
            {
                return NotFound("User not found.");
            }

            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            Console.WriteLine(transactionDto.Date);

            try
            {
                var utcDate = transactionDto.Date.ToUniversalTime();
                var isoDate = utcDate.ToString("o"); // "o" format specifier gives ISO 8601 format
                // Add new transaction
                var newTransaction = new Transaction
                {
                    UserId = user.Id,
                    CryptocurrencyId = transactionDto.CryptocurrencyId,
                    Date = utcDate,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Type = transactionDto.Type,
                    Amount = transactionDto.Amount,
                    UnitPrice = transactionDto.UnitPrice,
                    TotalPrice = transactionDto.Amount * transactionDto.UnitPrice
                };

                await _context.Transactions.AddAsync(newTransaction);
                await _context.SaveChangesAsync();

                // Update portfolio
                var portfolioItem = await _context.Portfolios
                    .FirstOrDefaultAsync(p => p.UserId == user.Id && p.CryptocurrencyId == transactionDto.CryptocurrencyId);

                if (portfolioItem == null)
                {
                    portfolioItem = new Portfolio
                    {
                        UserId = user.Id,
                        CryptocurrencyId = transactionDto.CryptocurrencyId,
                        Amount = 0,
                        AverageBuyPrice = 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    await _context.Portfolios.AddAsync(portfolioItem);
                }

                if (transactionDto.Type == "buy")
                {
                    decimal totalCost = portfolioItem.Amount * portfolioItem.AverageBuyPrice + transactionDto.Amount * transactionDto.UnitPrice;
                    portfolioItem.Amount += transactionDto.Amount;
                    portfolioItem.AverageBuyPrice = totalCost / portfolioItem.Amount;
                }
                else if (transactionDto.Type == "sell")
                {
                    if (portfolioItem.Amount < transactionDto.Amount)
                    {
                        throw new InvalidOperationException("Insufficient cryptocurrency amount for selling.");
                    }
                    portfolioItem.Amount -= transactionDto.Amount;

                    if (portfolioItem.Amount == 0)
                    {
                        _context.Portfolios.Remove(portfolioItem);
                    }
                    // Note: AverageBuyPrice remains unchanged for sell transactions
                }

                portfolioItem.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Transaction = newTransaction, Portfolio = portfolioItem });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest($"Error processing transaction: {ex.Message}");
            }
        }
    }
}