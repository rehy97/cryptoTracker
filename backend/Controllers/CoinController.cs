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
    }
}
