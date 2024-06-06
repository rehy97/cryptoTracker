using System;


namespace backend.models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ICollection<CryptocurrencyCategory> CryptocurrencyCategories { get; set; }
    }
}