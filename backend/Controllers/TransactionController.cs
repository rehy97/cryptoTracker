using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.db;
using backend.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.Extensions;
using backend.Services;
using backend.Dtos;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
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
}

}