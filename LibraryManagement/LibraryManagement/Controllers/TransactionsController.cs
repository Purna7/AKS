using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using LibraryManagement.Models;

namespace LibraryManagement.Controllers
{
    public class TransactionsController : Controller
    {
        private static List<BorrowTransaction> transactions = new List<BorrowTransaction>();

        public IActionResult Index(string status)
        {
            var filteredTransactions = transactions.ToList();

            if (!string.IsNullOrEmpty(status))
            {
                filteredTransactions = filteredTransactions.Where(t => t.Status == status).ToList();
            }

            // Update overdue status
            foreach (var transaction in filteredTransactions.Where(t => t.Status == "Borrowed"))
            {
                if (transaction.IsOverdue())
                {
                    transaction.Status = "Overdue";
                    transaction.FineAmount = transaction.CalculateFine();
                }
            }

            ViewBag.Statuses = new[] { "Borrowed", "Returned", "Overdue", "Lost" };
            return View(filteredTransactions);
        }

        public IActionResult Borrow()
        {
            ViewBag.Books = BooksController.GetAllBooks().Where(b => b.IsAvailable()).ToList();
            ViewBag.Visitors = VisitorsController.GetAllVisitors().Where(v => v.IsMembershipValid()).ToList();
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Borrow(int bookId, int visitorId, int loanDays = 14)
        {
            var book = BooksController.GetBookById(bookId);
            var visitor = VisitorsController.GetVisitorById(visitorId);

            if (book == null || visitor == null)
            {
                TempData["Error"] = "Invalid book or visitor selection.";
                return RedirectToAction(nameof(Borrow));
            }

            if (!book.IsAvailable())
            {
                TempData["Error"] = "Book is not available for borrowing.";
                return RedirectToAction(nameof(Borrow));
            }

            if (!visitor.IsMembershipValid())
            {
                TempData["Error"] = "Visitor membership has expired.";
                return RedirectToAction(nameof(Borrow));
            }

            var transaction = new BorrowTransaction
            {
                TransactionId = transactions.Any() ? transactions.Max(t => t.TransactionId) + 1 : 1,
                BookId = bookId,
                VisitorId = visitorId,
                BorrowDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(loanDays),
                Status = "Borrowed",
                IssuedBy = "Admin"
            };

            transactions.Add(transaction);
            book.AvailableCopies--;
            visitor.BooksBorrowed++;

            TempData["Success"] = $"Book borrowed successfully! Due date: {transaction.DueDate:d}";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Return(int id)
        {
            var transaction = transactions.FirstOrDefault(t => t.TransactionId == id);
            if (transaction == null || transaction.ReturnDate.HasValue)
            {
                return NotFound();
            }

            transaction.Book = BooksController.GetBookById(transaction.BookId);
            transaction.Visitor = VisitorsController.GetVisitorById(transaction.VisitorId);
            
            // Calculate potential fine
            if (transaction.IsOverdue())
            {
                transaction.FineAmount = transaction.CalculateFine();
            }

            return View(transaction);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Return(int id, string condition, bool finePaid)
        {
            var transaction = transactions.FirstOrDefault(t => t.TransactionId == id);
            if (transaction == null)
            {
                return NotFound();
            }

            var book = BooksController.GetBookById(transaction.BookId);
            var visitor = VisitorsController.GetVisitorById(transaction.VisitorId);

            transaction.ReturnDate = DateTime.Now;
            transaction.Status = "Returned";
            transaction.ReceivedBy = "Admin";
            transaction.Notes = $"Book condition: {condition}";

            if (transaction.IsOverdue())
            {
                transaction.FineAmount = transaction.CalculateFine();
                transaction.FinePaid = finePaid;
                
                if (!finePaid)
                {
                    visitor.FineAmount += transaction.FineAmount ?? 0;
                }
            }

            book.AvailableCopies++;
            visitor.BooksReturned++;

            TempData["Success"] = "Book returned successfully!";
            if (transaction.FineAmount > 0 && !finePaid)
            {
                TempData["Warning"] = $"Fine of ${transaction.FineAmount:F2} added to visitor account.";
            }

            return RedirectToAction(nameof(Index));
        }

        public IActionResult Details(int id)
        {
            var transaction = transactions.FirstOrDefault(t => t.TransactionId == id);
            if (transaction == null)
            {
                return NotFound();
            }

            transaction.Book = BooksController.GetBookById(transaction.BookId);
            transaction.Visitor = VisitorsController.GetVisitorById(transaction.VisitorId);

            return View(transaction);
        }
    }
}
