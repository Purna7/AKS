using System;
using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.Models
{
    public class Book
    {
        public int BookId { get; set; }

        [Required]
        [StringLength(13, MinimumLength = 10)]
        public string ISBN { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        [StringLength(100)]
        public string Author { get; set; }

        [StringLength(100)]
        public string Publisher { get; set; }

        public int? PublicationYear { get; set; }

        [Required]
        [StringLength(50)]
        public string Category { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public int TotalCopies { get; set; }

        public int AvailableCopies { get; set; }

        [StringLength(20)]
        public string Language { get; set; }

        public int? Pages { get; set; }

        [StringLength(50)]
        public string ShelfLocation { get; set; }

        public DateTime AddedDate { get; set; }

        public bool IsActive { get; set; }

        // eBook Properties
        [Display(Name = "Is eBook")]
        public bool IsEbook { get; set; } = false;

        [StringLength(500)]
        [Display(Name = "eBook File URL")]
        public string? EbookFileUrl { get; set; }

        [StringLength(50)]
        [Display(Name = "File Format")]
        public string? FileFormat { get; set; } // PDF, EPUB, MOBI, etc.

        [Display(Name = "File Size (MB)")]
        public decimal? FileSizeInMB { get; set; }

        [Display(Name = "Download Count")]
        public int DownloadCount { get; set; } = 0;

        public Book()
        {
            AddedDate = DateTime.Now;
            IsActive = true;
            Language = "English";
        }

        public bool IsAvailable()
        {
            if (IsEbook)
            {
                return IsActive; // eBooks are always available
            }
            return AvailableCopies > 0 && IsActive;
        }

        public int BorrowedCopies()
        {
            if (IsEbook)
            {
                return 0; // eBooks can't be "borrowed"
            }
            return TotalCopies - AvailableCopies;
        }

        public string GetBookType()
        {
            return IsEbook ? "eBook" : "Physical";
        }
    }
}
