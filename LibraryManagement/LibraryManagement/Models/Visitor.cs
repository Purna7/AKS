using System;
using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.Models
{
    public class Visitor
    {
        public int VisitorId { get; set; }

        [Required]
        [StringLength(20)]
        public string MembershipId { get; set; }

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(100)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [Phone]
        [StringLength(15)]
        public string Phone { get; set; }

        [StringLength(200)]
        public string Address { get; set; }

        [StringLength(50)]
        public string City { get; set; }

        [StringLength(10)]
        public string ZipCode { get; set; }

        [Required]
        [StringLength(20)]
        public string MembershipType { get; set; } // Standard, Premium, Student

        public DateTime RegistrationDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public bool IsActive { get; set; }

        public int BooksBorrowed { get; set; }

        public int BooksReturned { get; set; }

        public decimal FineAmount { get; set; }

        public Visitor()
        {
            RegistrationDate = DateTime.Now;
            IsActive = true;
            BooksBorrowed = 0;
            BooksReturned = 0;
            FineAmount = 0;
        }

        public string GetFullName()
        {
            return $"{FirstName} {LastName}";
        }

        public bool IsMembershipValid()
        {
            return IsActive && ExpiryDate.HasValue && ExpiryDate.Value > DateTime.Now;
        }

        public int CurrentBorrowedBooks()
        {
            return BooksBorrowed - BooksReturned;
        }
    }
}
