using LibraryManagement.Models;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.Controllers
{
    public class DonationsController : Controller
    {
        private static List<Donation> donations = new List<Donation>
        {
            new Donation
            {
                DonationId = 1,
                DonorName = "Sarah Johnson",
                DonorEmail = "sarah.johnson@email.com",
                DonorPhone = "555-0101",
                DonorAddress = "123 Oak Street, Seattle, WA 98101",
                BookTitle = "The Pragmatic Programmer",
                BookAuthor = "Andrew Hunt, David Thomas",
                BookISBN = "978-0201616224",
                BookPublisher = "Addison-Wesley",
                PublicationYear = 1999,
                Category = "Programming",
                BookCondition = "Good",
                Copies = 2,
                DonationDate = DateTime.Now.AddDays(-15),
                AcceptanceStatus = "Accepted",
                ReviewedBy = "Librarian",
                ReviewDate = DateTime.Now.AddDays(-14),
                AddedToInventory = true,
                Notes = "Excellent addition to our programming section"
            },
            new Donation
            {
                DonationId = 2,
                DonorName = "Michael Chen",
                DonorEmail = "michael.chen@email.com",
                DonorPhone = "555-0102",
                DonorAddress = "456 Maple Avenue, Portland, OR 97201",
                BookTitle = "Introduction to Algorithms",
                BookAuthor = "Thomas H. Cormen",
                BookISBN = "978-0262033848",
                BookPublisher = "MIT Press",
                PublicationYear = 2009,
                Category = "Computer Science",
                BookCondition = "Excellent",
                Copies = 1,
                DonationDate = DateTime.Now.AddDays(-5),
                AcceptanceStatus = "Pending",
                Notes = "Classic algorithms textbook"
            },
            new Donation
            {
                DonationId = 3,
                DonorName = "Emily Rodriguez",
                DonorEmail = "emily.r@email.com",
                DonorPhone = "555-0103",
                DonorAddress = "789 Pine Road, San Francisco, CA 94102",
                BookTitle = "The Art of Computer Programming",
                BookAuthor = "Donald Knuth",
                BookISBN = "978-0201896831",
                BookPublisher = "Addison-Wesley",
                PublicationYear = 1997,
                Category = "Computer Science",
                BookCondition = "Fair",
                Copies = 3,
                DonationDate = DateTime.Now.AddDays(-2),
                AcceptanceStatus = "Pending",
                Notes = "Some wear on covers but content is intact"
            }
        };

        private static int nextDonationId = 4;

        // GET: Donations
        public IActionResult Index(string status = "")
        {
            var filteredDonations = donations.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                filteredDonations = filteredDonations.Where(d => d.AcceptanceStatus == status);
            }

            ViewBag.Statuses = new List<string> { "Pending", "Accepted", "Rejected" };
            ViewBag.TotalDonations = donations.Count;
            ViewBag.PendingDonations = donations.Count(d => d.AcceptanceStatus == "Pending");
            ViewBag.AcceptedDonations = donations.Count(d => d.AcceptanceStatus == "Accepted");
            ViewBag.TotalDonors = donations.Select(d => d.DonorEmail).Distinct().Count();

            return View(filteredDonations.OrderByDescending(d => d.DonationDate).ToList());
        }

        // GET: Donations/Create
        public IActionResult Create()
        {
            ViewBag.Conditions = new List<string> { "Excellent", "Good", "Fair", "Poor" };
            ViewBag.Categories = new List<string> 
            { 
                "Programming", 
                "Computer Science", 
                "Web Development", 
                "Data Science", 
                "Software Engineering",
                "Fiction",
                "Non-Fiction",
                "Science",
                "History",
                "Other"
            };
            return View();
        }

        // POST: Donations/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Donation donation)
        {
            if (ModelState.IsValid)
            {
                donation.DonationId = nextDonationId++;
                donation.DonationDate = DateTime.Now;
                donation.AcceptanceStatus = "Pending";
                donations.Add(donation);

                TempData["Success"] = $"Thank you, {donation.DonorName}! Your book donation has been submitted successfully.";
                return RedirectToAction(nameof(Index));
            }

            ViewBag.Conditions = new List<string> { "Excellent", "Good", "Fair", "Poor" };
            ViewBag.Categories = new List<string> 
            { 
                "Programming", 
                "Computer Science", 
                "Web Development", 
                "Data Science", 
                "Software Engineering",
                "Fiction",
                "Non-Fiction",
                "Science",
                "History",
                "Other"
            };
            return View(donation);
        }

        // GET: Donations/Details/5
        public IActionResult Details(int id)
        {
            var donation = donations.FirstOrDefault(d => d.DonationId == id);
            if (donation == null)
            {
                return NotFound();
            }
            return View(donation);
        }

        // POST: Donations/Accept/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Accept(int id, string reviewerName, string notes)
        {
            var donation = donations.FirstOrDefault(d => d.DonationId == id);
            if (donation == null)
            {
                return NotFound();
            }

            // Create new book entry
            var newBook = new Book
            {
                BookId = BooksController.GetAllBooks().Any() ? BooksController.GetAllBooks().Max(b => b.BookId) + 1 : 1,
                ISBN = donation.BookISBN ?? $"DONATED-{donation.DonationId}",
                Title = donation.BookTitle,
                Author = donation.BookAuthor,
                Publisher = donation.BookPublisher ?? "Unknown",
                PublicationYear = donation.PublicationYear ?? DateTime.Now.Year,
                Category = donation.Category ?? "General",
                Description = $"Donated by {donation.DonorName}. {donation.Notes}",
                TotalCopies = donation.Copies,
                AvailableCopies = donation.Copies,
                Language = "English",
                ShelfLocation = "Donations Section",
                AddedDate = DateTime.Now,
                IsActive = true
            };

            // Add book to inventory (you'll need to expose this method in BooksController)
            BooksController.AddBook(newBook);

            // Update donation status
            donation.AcceptanceStatus = "Accepted";
            donation.ReviewedBy = reviewerName ?? "Librarian";
            donation.ReviewDate = DateTime.Now;
            donation.AddedToInventory = true;
            donation.BookId = newBook.BookId;
            donation.Notes = notes ?? donation.Notes;

            TempData["Success"] = $"Donation accepted! Book '{donation.BookTitle}' has been added to the library inventory.";
            return RedirectToAction(nameof(Index));
        }

        // POST: Donations/Reject/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Reject(int id, string reviewerName, string notes)
        {
            var donation = donations.FirstOrDefault(d => d.DonationId == id);
            if (donation == null)
            {
                return NotFound();
            }

            donation.AcceptanceStatus = "Rejected";
            donation.ReviewedBy = reviewerName ?? "Librarian";
            donation.ReviewDate = DateTime.Now;
            donation.Notes = notes ?? donation.Notes;

            TempData["Success"] = $"Donation from {donation.DonorName} has been marked as rejected.";
            return RedirectToAction(nameof(Index));
        }

        // GET: Donations/DonorReport
        public IActionResult DonorReport(string search = "")
        {
            var donorGroups = donations
                .GroupBy(d => new { d.DonorName, d.DonorEmail, d.DonorPhone, d.DonorAddress })
                .Select(g => new
                {
                    DonorName = g.Key.DonorName,
                    DonorEmail = g.Key.DonorEmail,
                    DonorPhone = g.Key.DonorPhone,
                    DonorAddress = g.Key.DonorAddress,
                    TotalDonations = g.Count(),
                    TotalBooks = g.Sum(d => d.Copies),
                    AcceptedDonations = g.Count(d => d.AcceptanceStatus == "Accepted"),
                    PendingDonations = g.Count(d => d.AcceptanceStatus == "Pending"),
                    FirstDonation = g.Min(d => d.DonationDate),
                    LastDonation = g.Max(d => d.DonationDate),
                    Donations = g.OrderByDescending(d => d.DonationDate).ToList()
                })
                .OrderByDescending(g => g.TotalBooks)
                .ToList();

            if (!string.IsNullOrEmpty(search))
            {
                donorGroups = donorGroups
                    .Where(d => d.DonorName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                               d.DonorEmail.Contains(search, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            ViewBag.TotalDonors = donorGroups.Count;
            ViewBag.TotalBooksDonated = donorGroups.Sum(g => g.TotalBooks);
            ViewBag.TotalAcceptedBooks = donations.Where(d => d.AcceptanceStatus == "Accepted").Sum(d => d.Copies);

            return View(donorGroups);
        }

        // Static helper methods
        public static List<Donation> GetAllDonations()
        {
            return donations;
        }

        public static Donation? GetDonationById(int id)
        {
            return donations.FirstOrDefault(d => d.DonationId == id);
        }
    }
}
