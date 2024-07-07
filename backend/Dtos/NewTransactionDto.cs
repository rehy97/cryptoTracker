using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos
{ 
    public class NewTransactionDto
    {
        public string CryptocurrencyId { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.Now;
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal UnitPrice { get; set; }
    }
}