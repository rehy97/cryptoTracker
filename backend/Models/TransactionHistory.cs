using System;

namespace backend.models
{
    public class TransactionHistory
    {
        public int Id { get; set; }
        public int TransactionId { get; set; }
        public string Status { get; set; }
        public DateTime ChangeDate { get; set; }
        public string Comment { get; set; }
        public Transaction Transaction { get; set; }
    }
}