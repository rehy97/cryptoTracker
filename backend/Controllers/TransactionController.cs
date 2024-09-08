using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.db;
using System.IO;
using backend.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.Extensions;
using backend.Services;
using CsvHelper;
using CsvHelper.Configuration;
using backend.Dtos;
using System.Globalization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private class CsvTransaction
        {
            public string ID { get; set; }
            public DateTime Timestamp { get; set; }
            public string TransactionType { get; set; }
            public string Asset { get; set; }
            public decimal QuantityTransacted { get; set; }
            public string PriceCurrency { get; set; }
            public decimal PriceAtTransaction { get; set; }
            public decimal Subtotal { get; set; }
            public decimal Total { get; set; }
            public decimal FeesAndSpread { get; set; }
            public string Notes { get; set; }
        }

    static string ConvertDateTimeFormat(string originalDateTime)
    {
        // Parse the original date time string
        if (DateTime.TryParseExact(originalDateTime, "yyyy-MM-dd HH:mm:ss 'UTC'", 
                                   CultureInfo.InvariantCulture, 
                                   DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, 
                                   out DateTime parsedDateTime))
        {
            // Convert UTC time to local time
            DateTime localDateTime = parsedDateTime.ToLocalTime();

            // Format the date time to the desired output format
            return localDateTime.ToString("M/d/yyyy h:mm:ss tt", CultureInfo.InvariantCulture);
        }
        else
        {
            return "Invalid date time format";
        }
    }
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;

        private readonly string[] _allowedTypes = { "buy", "sell" };
        private readonly CoinService _coinService;

        private bool IsTypeAllowed(string type)
        {
            return _allowedTypes.Contains(type);
        }

        public TransactionController(AppDbContext context, UserManager<User> userManager, CoinService coinService)
        {
            _context = context;
            _userManager = userManager;
            _coinService = coinService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllUserTransactions()
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

            var transactions = await _context.Transactions
                .Where(x => x.UserId == user.Id)
                .Select(transaction => new
                {
                    transaction.CryptocurrencyId,
                    transaction.Amount,
                    transaction.Date,
                    transaction.CreatedAt,
                    transaction.UpdatedAt,
                    transaction.Type,
                    transaction.UnitPrice,
                    transaction.TotalPrice
                })
                .ToListAsync();

            return Ok(transactions);
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateTransaction([FromBody] NewTransactionDto transactionDto)
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

            bool cryptoExists = await _coinService.CheckCryptoExists(transactionDto.CryptocurrencyId);

            if (!cryptoExists)
            {
                Console.WriteLine(transactionDto.CryptocurrencyId);
                Console.WriteLine("kek1");
                return BadRequest($"Cryptocurrency with Id '{transactionDto.CryptocurrencyId}' does not exist.");
            }

            Console.WriteLine("kek");

            if(transactionDto.Amount <= 0)
            {
                return BadRequest("Amount must be greater than 0.");
            }

            if(transactionDto.UnitPrice <= 0)
            {
                return BadRequest("Unit price must be greater than 0.");
            }

            if(!IsTypeAllowed(transactionDto.Type))
            {
                return BadRequest("Invalid transaction type.");
            }

            var transaction = new Transaction
            {
                UserId = user.Id,
                CryptocurrencyId = transactionDto.CryptocurrencyId,
                Date = transactionDto.Date,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Type = transactionDto.Type,
                Amount = transactionDto.Amount,
                UnitPrice = transactionDto.UnitPrice,
                TotalPrice = transactionDto.Amount * transactionDto.UnitPrice
            };

            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, transaction);
        }

        
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetTransactionById(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] NewTransactionDto transactionDto)
        {

            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return NotFound();
            }

            if (transactionDto.Amount <= 0)
            {
                return BadRequest("Amount must be greater than 0.");
            }

            if (transactionDto.UnitPrice <= 0)
            {
                return BadRequest("Unit price must be greater than 0.");
            }

            if (!IsTypeAllowed(transactionDto.Type))
            {
                return BadRequest("Invalid transaction type.");
            }

            transaction.CryptocurrencyId = transactionDto.CryptocurrencyId;
            transaction.Date = transactionDto.Date;
            transaction.UpdatedAt = DateTime.UtcNow;
            transaction.Type = transactionDto.Type;
            transaction.Amount = transactionDto.Amount;
            transaction.UnitPrice = transactionDto.UnitPrice;
            transaction.TotalPrice = transactionDto.Amount * transactionDto.UnitPrice;

            await _context.SaveChangesAsync();

            return Ok(transaction);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var transaction = await _context.Transactions.FindAsync(id);

        if (transaction == null)
        {
            return NotFound();
        }

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }

[HttpPost("import-csv")]
public async Task<IActionResult> ImportCsv(IFormFile file)
{
    if (file == null || file.Length == 0)
        return BadRequest("File is empty");

    var username = User.GetUsername();
    var user = await _userManager.FindByNameAsync(username);
    if (user == null)
        return NotFound("User not found.");

    try
    {
        using (var reader = new StreamReader(file.OpenReadStream()))
        using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null
        }))
        {
            // Skip the first four lines
            for (int i = 0; i < 4; i++)
            {
                if (!csv.Read())
                {
                    return BadRequest("CSV file format is invalid. Expected at least 4 lines.");
                }
            }

            var transactions = new List<Transaction>();
            var skippedTransactions = new List<string>();

            while (csv.Read())
            {
                if(csv.GetField(2) == "Deposit" || csv.GetField(2) == "Withdrawal" || csv.GetField(2) == "Receive" || csv.GetField(2) == "Send" || csv.GetField(2) == "Staking Income" || csv.GetField(2) == "Convert")
                {
                    continue;
                }
                var coin = await _coinService.GetCryptoBySymbol(csv.GetField(3));

                if (coin == null || coin.Id == null)
                {
                    skippedTransactions.Add($"Transaction for {csv.GetField(3)} skipped: Cryptocurrency not found.");
                    continue;
                }

                if (!DateTime.TryParseExact(csv.GetField(1), "yyyy-MM-dd HH:mm:ss 'UTC'", CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out DateTime date))
                {
                    skippedTransactions.Add($"Transaction for {csv.GetField(3)} skipped: Invalid date format.");
                    continue;
                }
            
                var transaction = new Transaction
                {
                    UserId = user.Id,
                    CryptocurrencyId = coin.Id,
                    Date = date,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Type = MapTransactionType(csv.GetField(2)),
                    Amount = decimal.Parse(csv.GetField(4)),
                    UnitPrice = decimal.Parse(csv.GetField(6).Replace("$", "")),
                    TotalPrice = decimal.Parse(csv.GetField(7).Replace("$", "")),
                };
                await _context.Transactions.AddAsync(transaction);
                await _context.SaveChangesAsync();

                Console.WriteLine(transaction + "Meca");
                // Update portfolio
                var portfolioItem = await _context.Portfolios
                    .FirstOrDefaultAsync(p => p.UserId == user.Id && p.CryptocurrencyId == transaction.CryptocurrencyId);

                if (portfolioItem == null)
                {
                    portfolioItem = new Portfolio
                    {
                        UserId = user.Id,
                        CryptocurrencyId = transaction.CryptocurrencyId,
                        Amount = 0,
                        AverageBuyPrice = 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    await _context.Portfolios.AddAsync(portfolioItem);
                }

                if (transaction.Type == "buy")
                {
                    decimal totalCost = portfolioItem.Amount * portfolioItem.AverageBuyPrice + transaction.Amount * transaction.UnitPrice;
                    portfolioItem.Amount += transaction.Amount;
                    portfolioItem.AverageBuyPrice = totalCost / portfolioItem.Amount;
                }
                else if (transaction.Type == "sell")
                {
                    if (portfolioItem.Amount < transaction.Amount)
                    {
                        skippedTransactions.Add($"Sell transaction for {coin.Symbol} skipped: Insufficient amount in portfolio.");
                        continue;
                    }
                    portfolioItem.Amount -= transaction.Amount;

                    if (portfolioItem.Amount == 0)
                    {
                        _context.Portfolios.Remove(portfolioItem);
                    }
                }

                portfolioItem.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                transactions.Add(transaction);
            }

            return Ok(new { 
                Message = $"Successfully imported {transactions.Count} transactions and updated the portfolio.",
                SkippedTransactions = skippedTransactions
            });
        }
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"An error occurred while importing the CSV: {ex.Message}");
    }
}
private string MapTransactionType(string csvType)
{
    switch (csvType)
    {
        case "Advance Trade Buy":
            return "buy";
        case "Advance Trade Sell":
            return "sell";
        // Add more mappings as needed
        default:
            return csvType.ToLower();
    }
}
}

}