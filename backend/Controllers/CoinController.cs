using backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoinController : ControllerBase
    {
        private readonly CoinService _coinService;

        public CoinController(CoinService coinService)
        {
            _coinService = coinService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList(string currency = "usd")
        {
            try
            {
                var coins = await _coinService.GetList(currency);
                return Ok(coins);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{cryptocurrencyId}")]
        public async Task<IActionResult> GetCryptoById(string cryptocurrencyId)
        {
            try
            {
                var coin = await _coinService.GetCryptoById(cryptocurrencyId);
                return Ok(coin);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("symbol/{symbol}")]
        public async Task<IActionResult> GetCryptoBySymbol(string symbol)
        {
            try
            {
                var coin = await _coinService.GetCryptoBySymbol(symbol);
                return Ok(coin);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
