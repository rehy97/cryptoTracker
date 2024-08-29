using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.models
{
using System;
using System.Text.Json.Serialization;

public class Roi
{
    public double? Times { get; set; }
    public string Currency { get; set; }
    public double? Percentage { get; set; }
}

public class Coin
{
    public string Id { get; set; }
    public string Symbol { get; set; }
    public string Name { get; set; }
    public string Image { get; set; }

    [JsonPropertyName("current_price")]
    public decimal CurrentPrice { get; set; }

    [JsonPropertyName("market_cap")]
    public decimal MarketCap { get; set; }

    [JsonPropertyName("market_cap_rank")]
    public int MarketCapRank { get; set; }

    [JsonPropertyName("fully_diluted_valuation")]
    public decimal? FullyDilutedValuation { get; set; }

    [JsonPropertyName("total_volume")]
    public decimal TotalVolume { get; set; }

    [JsonPropertyName("high_24h")]
    public decimal High24h { get; set; }

    [JsonPropertyName("low_24h")]
    public decimal Low24h { get; set; }

    [JsonPropertyName("price_change_24h")]
    public decimal PriceChange24h { get; set; }

    [JsonPropertyName("price_change_percentage_24h")]
    public double PriceChangePercentage24h { get; set; }

    [JsonPropertyName("market_cap_change_24h")]
    public decimal MarketCapChange24h { get; set; }

    [JsonPropertyName("market_cap_change_percentage_24h")]
    public double MarketCapChangePercentage24h { get; set; }

    [JsonPropertyName("circulating_supply")]
    public decimal CirculatingSupply { get; set; }

    [JsonPropertyName("total_supply")]
    public decimal? TotalSupply { get; set; }

    [JsonPropertyName("max_supply")]
    public decimal? MaxSupply { get; set; }

    public decimal Ath { get; set; }

    [JsonPropertyName("ath_change_percentage")]
    public double AthChangePercentage { get; set; }

    [JsonPropertyName("ath_date")]
    public DateTime AthDate { get; set; }

    public decimal Atl { get; set; }

    [JsonPropertyName("atl_change_percentage")]
    public double AtlChangePercentage { get; set; }

    [JsonPropertyName("atl_date")]
    public DateTime AtlDate { get; set; }

    public Roi Roi { get; set; }

    [JsonPropertyName("last_updated")]
    public DateTime LastUpdated { get; set; }

    [JsonPropertyName("price_change_percentage_1h_in_currency")]
    public double? PriceChangePercentage1hInCurrency { get; set; }

    [JsonPropertyName("price_change_percentage_24h_in_currency")]
    public double? PriceChangePercentage24hInCurrency { get; set; }

    [JsonPropertyName("price_change_percentage_7d_in_currency")]
    public double? PriceChangePercentage7dInCurrency { get; set; }
}
}