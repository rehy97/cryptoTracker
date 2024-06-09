using System;

namespace backend.models
{
    public class TransactionHistory
    {
        public int Id { get; set; }
        public int? TransactionId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime ChangeDate { get; set; } = DateTime.Now;
        public string Comment { get; set; } = string.Empty;
        public Transaction? Transaction { get; set; }
    }
}