using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.Models
{
    public class Donation
    {
        public int DonationId { get; set; }

        [Required(ErrorMessage = "Donor name is required")]
        [StringLength(100)]
        [Display(Name = "Donor Name")]
        public string DonorName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        [Display(Name = "Email Address")]
        public string DonorEmail { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        [Phone]
        [Display(Name = "Phone Number")]
        public string DonorPhone { get; set; }

        [StringLength(200)]
        [Display(Name = "Address")]
        public string? DonorAddress { get; set; }

        [Required(ErrorMessage = "Book title is required")]
        [StringLength(200)]
        [Display(Name = "Book Title")]
        public string BookTitle { get; set; }

        [Required(ErrorMessage = "Author name is required")]
        [StringLength(100)]
        [Display(Name = "Author Name")]
        public string BookAuthor { get; set; }

        [StringLength(20)]
        [Display(Name = "ISBN (Optional)")]
        public string? BookISBN { get; set; }

        [StringLength(100)]
        [Display(Name = "Publisher (Optional)")]
        public string? BookPublisher { get; set; }

        [Display(Name = "Publication Year")]
        public int? PublicationYear { get; set; }

        [StringLength(50)]
        [Display(Name = "Category")]
        public string? Category { get; set; }

        [Required]
        [StringLength(20)]
        [Display(Name = "Book Condition")]
        public string BookCondition { get; set; } // Excellent, Good, Fair, Poor

        [Display(Name = "Number of Copies")]
        [Range(1, 100)]
        public int Copies { get; set; } = 1;

        [Display(Name = "Donation Date")]
        public DateTime DonationDate { get; set; } = DateTime.Now;

        [Required]
        [StringLength(20)]
        [Display(Name = "Status")]
        public string AcceptanceStatus { get; set; } = "Pending"; // Pending, Accepted, Rejected

        [StringLength(500)]
        [Display(Name = "Additional Notes")]
        public string? Notes { get; set; }

        [Display(Name = "Reviewed By")]
        public string? ReviewedBy { get; set; }

        [Display(Name = "Review Date")]
        public DateTime? ReviewDate { get; set; }

        [Display(Name = "Added to Inventory")]
        public bool AddedToInventory { get; set; } = false;

        [Display(Name = "Book ID (if added)")]
        public int? BookId { get; set; }

        // Helper methods
        public string GetDonorInfo()
        {
            return $"{DonorName} ({DonorEmail})";
        }

        public string GetBookInfo()
        {
            return $"{BookTitle} by {BookAuthor}";
        }

        public bool IsPending()
        {
            return AcceptanceStatus == "Pending";
        }

        public bool IsAccepted()
        {
            return AcceptanceStatus == "Accepted";
        }
    }
}
