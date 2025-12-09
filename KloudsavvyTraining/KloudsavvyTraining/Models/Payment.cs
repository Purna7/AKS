using System;

namespace KloudsavvyTraining.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } // CreditCard, PayPal, Stripe
        public string TransactionId { get; set; }
        public string Status { get; set; } // Pending, Completed, Failed, Refunded
        public DateTime PaymentDate { get; set; }
        public string Currency { get; set; }

        public Payment()
        {
            PaymentDate = DateTime.Now;
            Status = "Pending";
            Currency = "USD";
        }

        public bool IsSuccessful()
        {
            return Status == "Completed";
        }
    }
}
