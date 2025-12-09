using System.Diagnostics;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using LibraryManagement.Models;

namespace LibraryManagement.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        // Dashboard statistics
        var books = BooksController.GetAllBooks();
        var visitors = VisitorsController.GetAllVisitors();
        var donations = DonationsController.GetAllDonations();

        ViewBag.TotalBooks = books.Count;
        ViewBag.AvailableBooks = books.Sum(b => b.AvailableCopies);
        ViewBag.BorrowedBooks = books.Sum(b => b.BorrowedCopies());
        ViewBag.TotalVisitors = visitors.Count;
        ViewBag.ActiveMembers = visitors.Count(v => v.IsMembershipValid());
        ViewBag.TotalDonations = donations.Count;
        ViewBag.PendingDonations = donations.Count(d => d.IsPending());
        ViewBag.TotalEbooks = BooksController.GetEbookCount();
        ViewBag.TotalEbookDownloads = BooksController.GetTotalEbookDownloads();

        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
