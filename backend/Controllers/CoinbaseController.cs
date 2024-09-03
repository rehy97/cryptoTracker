using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

[ApiController]
[Route("api")]
public class CoinbaseController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<CoinbaseController> _logger;

    public CoinbaseController(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<CoinbaseController> logger)
    {
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
    }

    [HttpPost("exchange-token")]
    public async Task<IActionResult> ExchangeToken([FromBody] CodeExchangeRequest request)
    {
        var clientId = _configuration["Coinbase:ClientId"];
        var clientSecret = _configuration["Coinbase:ClientSecret"];
        var redirectUri = _configuration["Coinbase:RedirectUri"];
        _logger.LogInformation($"ClientId: {clientId}, RedirectUri: {redirectUri}");

        var tokenRequest = new
        {
            grant_type = "authorization_code",
            code = request.Code,
            client_id = clientId,
            client_secret = clientSecret,
            redirect_uri = redirectUri
        };

        var response = await _httpClient.PostAsJsonAsync("https://api.coinbase.com/oauth/token", tokenRequest);
        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError($"Failed to exchange token. Status: {response.StatusCode}, Content: {content}");
            return BadRequest($"Failed to exchange code for token: {content}");
        }

        return Ok(content);
    }

    [HttpGet("fetch-accounts")]
    public async Task<IActionResult> FetchAccounts()
    {
        var accessToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.GetAsync("https://api.coinbase.com/v2/accounts");
        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError($"Failed to fetch accounts. Status: {response.StatusCode}, Content: {content}");
            return BadRequest($"Failed to fetch accounts: {content}");
        }

        _logger.LogInformation($"Accounts fetched successfully: {content}");
        return Ok(content);
    }

    [HttpGet("fetch-transactions")]
    public async Task<IActionResult> FetchTransactions([FromQuery] string accountId)
    {
        if (string.IsNullOrEmpty(accountId))
        {
            return BadRequest("Account ID is required");
        }

        var accessToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.GetAsync($"https://api.coinbase.com/v2/accounts/{accountId}/transactions");
        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError($"Failed to fetch transactions. Status: {response.StatusCode}, Content: {content}");
            return BadRequest($"Failed to fetch transactions: {content}");
        }

        _logger.LogInformation($"Transactions fetched successfully for account {accountId}");
        return Ok(content);
    }
}

public class CodeExchangeRequest
{
    public string Code { get; set; }
}