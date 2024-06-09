using System;

namespace backend.models
{
    public class CryptocurrencyCategory
    {
        public int Id { get; set; }
        public int? CryptocurrencyId { get; set; }
        public int? CategoryId { get; set; }
        public Cryptocurrency? Cryptocurrency { get; set; }
        public Category? Category { get; set; }
    }
}