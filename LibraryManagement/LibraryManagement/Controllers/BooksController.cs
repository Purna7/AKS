using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using LibraryManagement.Models;

namespace LibraryManagement.Controllers
{
    public class BooksController : Controller
    {
        // In-memory data storage (replace with database in production)
        private static List<Book> books = new List<Book>
        {
            new Book
            {
                BookId = 1,
                ISBN = "9780132350884",
                Title = "Clean Code: A Handbook of Agile Software Craftsmanship",
                Author = "Robert C. Martin",
                Publisher = "Prentice Hall",
                PublicationYear = 2008,
                Category = "Software Development",
                Description = "A guide to writing clean, maintainable code with practical examples.",
                TotalCopies = 5,
                AvailableCopies = 3,
                Language = "English",
                Pages = 464,
                ShelfLocation = "A-101"
            },
            new Book
            {
                BookId = 2,
                ISBN = "9780201633610",
                Title = "Design Patterns: Elements of Reusable Object-Oriented Software",
                Author = "Gang of Four",
                Publisher = "Addison-Wesley",
                PublicationYear = 1994,
                Category = "Software Development",
                Description = "The classic book on design patterns in object-oriented programming.",
                TotalCopies = 4,
                AvailableCopies = 2,
                Language = "English",
                Pages = 416,
                ShelfLocation = "A-102"
            },
            new Book
            {
                BookId = 3,
                ISBN = "9780134685991",
                Title = "Effective Java",
                Author = "Joshua Bloch",
                Publisher = "Addison-Wesley",
                PublicationYear = 2017,
                Category = "Programming",
                Description = "Best practices for Java programming language.",
                TotalCopies = 6,
                AvailableCopies = 4,
                Language = "English",
                Pages = 416,
                ShelfLocation = "B-201"
            },
            new Book
            {
                BookId = 4,
                ISBN = "9781449355739",
                Title = "Learning Python",
                Author = "Mark Lutz",
                Publisher = "O'Reilly Media",
                PublicationYear = 2013,
                Category = "Programming",
                Description = "Comprehensive introduction to Python programming.",
                TotalCopies = 8,
                AvailableCopies = 5,
                Language = "English",
                Pages = 1648,
                ShelfLocation = "B-202"
            },
            new Book
            {
                BookId = 5,
                ISBN = "9781491950296",
                Title = "Building Microservices",
                Author = "Sam Newman",
                Publisher = "O'Reilly Media",
                PublicationYear = 2015,
                Category = "Architecture",
                Description = "Designing fine-grained systems with microservices architecture.",
                TotalCopies = 3,
                AvailableCopies = 1,
                Language = "English",
                Pages = 280,
                ShelfLocation = "C-301"
            },
            // eBooks
            new Book
            {
                BookId = 6,
                ISBN = "EBOOK-001",
                Title = "Introduction to Algorithms (eBook)",
                Author = "Thomas H. Cormen, Charles E. Leiserson",
                Publisher = "MIT Press",
                PublicationYear = 2022,
                Category = "Computer Science",
                Description = "Comprehensive introduction to the modern study of computer algorithms. Digital edition available for instant access.",
                TotalCopies = 0,
                AvailableCopies = 0,
                Language = "English",
                Pages = 1312,
                ShelfLocation = "Digital Library",
                IsEbook = true,
                EbookFileUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                FileFormat = "PDF",
                FileSizeInMB = 8.5m,
                DownloadCount = 45
            },
            new Book
            {
                BookId = 7,
                ISBN = "EBOOK-002",
                Title = "The Pragmatic Programmer (eBook)",
                Author = "David Thomas, Andrew Hunt",
                Publisher = "Addison-Wesley",
                PublicationYear = 2023,
                Category = "Software Development",
                Description = "Your journey to mastery. Digital edition with enhanced navigation and search capabilities.",
                TotalCopies = 0,
                AvailableCopies = 0,
                Language = "English",
                Pages = 352,
                ShelfLocation = "Digital Library",
                IsEbook = true,
                EbookFileUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                FileFormat = "PDF",
                FileSizeInMB = 5.2m,
                DownloadCount = 67
            },
            new Book
            {
                BookId = 8,
                ISBN = "EBOOK-003",
                Title = "You Don't Know JS (eBook Series)",
                Author = "Kyle Simpson",
                Publisher = "O'Reilly Media",
                PublicationYear = 2024,
                Category = "Web Development",
                Description = "Deep dive into the core mechanisms of JavaScript. Complete series in digital format.",
                TotalCopies = 0,
                AvailableCopies = 0,
                Language = "English",
                Pages = 278,
                ShelfLocation = "Digital Library",
                IsEbook = true,
                EbookFileUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                FileFormat = "EPUB",
                FileSizeInMB = 3.8m,
                DownloadCount = 92
            },
            new Book
            {
                BookId = 9,
                ISBN = "EBOOK-004",
                Title = "Python Data Science Handbook (eBook)",
                Author = "Jake VanderPlas",
                Publisher = "O'Reilly Media",
                PublicationYear = 2023,
                Category = "Data Science",
                Description = "Essential tools for working with data in Python. Includes code examples and interactive notebooks.",
                TotalCopies = 0,
                AvailableCopies = 0,
                Language = "English",
                Pages = 541,
                ShelfLocation = "Digital Library",
                IsEbook = true,
                EbookFileUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                FileFormat = "PDF",
                FileSizeInMB = 12.3m,
                DownloadCount = 128
            },
            new Book
            {
                BookId = 10,
                ISBN = "EBOOK-005",
                Title = "Designing Data-Intensive Applications (eBook)",
                Author = "Martin Kleppmann",
                Publisher = "O'Reilly Media",
                PublicationYear = 2024,
                Category = "Architecture",
                Description = "The big ideas behind reliable, scalable, and maintainable systems. Digital edition with searchable content.",
                TotalCopies = 0,
                AvailableCopies = 0,
                Language = "English",
                Pages = 616,
                ShelfLocation = "Digital Library",
                IsEbook = true,
                EbookFileUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                FileFormat = "PDF",
                FileSizeInMB = 9.7m,
                DownloadCount = 83
            }
        };

        public IActionResult Index(string search, string category)
        {
            var filteredBooks = books.Where(b => b.IsActive).ToList();

            if (!string.IsNullOrEmpty(search))
            {
                filteredBooks = filteredBooks.Where(b =>
                    b.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    b.Author.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    b.ISBN.Contains(search, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }

            if (!string.IsNullOrEmpty(category))
            {
                filteredBooks = filteredBooks.Where(b => b.Category == category).ToList();
            }

            ViewBag.Categories = books.Select(b => b.Category).Distinct().OrderBy(c => c).ToList();
            return View(filteredBooks);
        }

        public IActionResult Details(int id)
        {
            var book = books.FirstOrDefault(b => b.BookId == id);
            if (book == null)
            {
                return NotFound();
            }
            return View(book);
        }

        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Book book)
        {
            if (ModelState.IsValid)
            {
                book.BookId = books.Any() ? books.Max(b => b.BookId) + 1 : 1;
                book.AvailableCopies = book.TotalCopies;
                books.Add(book);
                TempData["Success"] = "Book added successfully!";
                return RedirectToAction(nameof(Index));
            }
            return View(book);
        }

        public IActionResult Edit(int id)
        {
            var book = books.FirstOrDefault(b => b.BookId == id);
            if (book == null)
            {
                return NotFound();
            }
            return View(book);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Book updatedBook)
        {
            if (ModelState.IsValid)
            {
                var book = books.FirstOrDefault(b => b.BookId == id);
                if (book == null)
                {
                    return NotFound();
                }

                book.ISBN = updatedBook.ISBN;
                book.Title = updatedBook.Title;
                book.Author = updatedBook.Author;
                book.Publisher = updatedBook.Publisher;
                book.PublicationYear = updatedBook.PublicationYear;
                book.Category = updatedBook.Category;
                book.Description = updatedBook.Description;
                book.TotalCopies = updatedBook.TotalCopies;
                book.Language = updatedBook.Language;
                book.Pages = updatedBook.Pages;
                book.ShelfLocation = updatedBook.ShelfLocation;

                TempData["Success"] = "Book updated successfully!";
                return RedirectToAction(nameof(Index));
            }
            return View(updatedBook);
        }

        public IActionResult Delete(int id)
        {
            var book = books.FirstOrDefault(b => b.BookId == id);
            if (book == null)
            {
                return NotFound();
            }
            return View(book);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteConfirmed(int id)
        {
            var book = books.FirstOrDefault(b => b.BookId == id);
            if (book != null)
            {
                book.IsActive = false;
                TempData["Success"] = "Book removed successfully!";
            }
            return RedirectToAction(nameof(Index));
        }

        // Read eBook in browser
        public IActionResult ReadEbook(int id)
        {
            var book = books.FirstOrDefault(b => b.BookId == id && b.IsEbook);
            if (book == null || string.IsNullOrEmpty(book.EbookFileUrl))
            {
                TempData["Error"] = "eBook not found or unavailable for reading.";
                return RedirectToAction(nameof(Index));
            }

            return View(book);
        }

        // Download eBook
        public IActionResult DownloadEbook(int id)
        {
            var book = books.FirstOrDefault(b => b.BookId == id && b.IsEbook);
            if (book == null || string.IsNullOrEmpty(book.EbookFileUrl))
            {
                TempData["Error"] = "eBook not found or unavailable for download.";
                return RedirectToAction(nameof(Index));
            }

            // Increment download count
            book.DownloadCount++;

            TempData["Success"] = $"Downloading '{book.Title}'. The download will start shortly.";
            
            // Redirect to the file URL (in production, this would serve the actual file)
            return Redirect(book.EbookFileUrl);
        }

        public static Book GetBookById(int id)
        {
            return books.FirstOrDefault(b => b.BookId == id);
        }

        public static List<Book> GetAllBooks()
        {
            return books.Where(b => b.IsActive).ToList();
        }

        public static void AddBook(Book book)
        {
            books.Add(book);
        }

        public static int GetEbookCount()
        {
            return books.Count(b => b.IsEbook && b.IsActive);
        }

        public static int GetTotalEbookDownloads()
        {
            return books.Where(b => b.IsEbook && b.IsActive).Sum(b => b.DownloadCount);
        }
    }
}
