using backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FearAndGreedIndexController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public FearAndGreedIndexController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var response = await _httpClient.GetAsync("https://api.alternative.me/fng/");
                response.EnsureSuccessStatusCode();
                var content = await response.Content.ReadAsStringAsync();
                return Ok(content);
            }
            catch (HttpRequestException e)
            {
                return StatusCode(500, "An error occurred while fetching the Fear and Greed Index.");
            }
        }
    }
}