using System;
using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.Models
{
    public class BorrowTransaction
    {
        public int TransactionId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public int VisitorId { get; set; }

        public DateTime BorrowDate { get; set; }

        public DateTime DueDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [StringLength(20)]
        public string Status { get; set; } // Borrowed, Returned, Overdue, Lost

        public decimal? FineAmount { get; set; }

        public bool FinePaid { get; set; }

        [StringLength(500)]
        public string Notes { get; set; }

        public string IssuedBy { get; set; }

        public string ReceivedBy { get; set; }

        // Navigation properties
        public Book Book { get; set; }
        public Visitor Visitor { get; set; }

        public BorrowTransaction()
        {
            BorrowDate = DateTime.Now;
            DueDate = DateTime.Now.AddDays(14); // Default 14 days loan period
            Status = "Borrowed";
            FineAmount = 0;
            FinePaid = false;
        }

        public bool IsOverdue()
        {
            return !ReturnDate.HasValue && DateTime.Now > DueDate;
        }

        public int DaysOverdue()
        {
            if (ReturnDate.HasValue)
            {
                return (ReturnDate.Value - DueDate).Days > 0 ? (ReturnDate.Value - DueDate).Days : 0;
            }
            return (DateTime.Now - DueDate).Days > 0 ? (DateTime.Now - DueDate).Days : 0;
        }

        public decimal CalculateFine(decimal finePerDay = 1.0m)
        {
            int daysOverdue = DaysOverdue();
            return daysOverdue > 0 ? daysOverdue * finePerDay : 0;
        }
    }
}
