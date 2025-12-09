using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using LibraryManagement.Models;

namespace LibraryManagement.Controllers
{
    public class VisitorsController : Controller
    {
        // In-memory data storage
        private static List<Visitor> visitors = new List<Visitor>
        {
            new Visitor
            {
                VisitorId = 1,
                MembershipId = "LM2025001",
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@email.com",
                Phone = "555-0101",
                Address = "123 Main St",
                City = "New York",
                ZipCode = "10001",
                MembershipType = "Premium",
                RegistrationDate = DateTime.Now.AddMonths(-6),
                ExpiryDate = DateTime.Now.AddMonths(6),
                BooksBorrowed = 12,
                BooksReturned = 10
            },
            new Visitor
            {
                VisitorId = 2,
                MembershipId = "LM2025002",
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@email.com",
                Phone = "555-0102",
                Address = "456 Oak Ave",
                City = "Los Angeles",
                ZipCode = "90001",
                MembershipType = "Standard",
                RegistrationDate = DateTime.Now.AddMonths(-3),
                ExpiryDate = DateTime.Now.AddMonths(9),
                BooksBorrowed = 5,
                BooksReturned = 5
            },
            new Visitor
            {
                VisitorId = 3,
                MembershipId = "LM2025003",
                FirstName = "Robert",
                LastName = "Johnson",
                Email = "robert.j@email.com",
                Phone = "555-0103",
                Address = "789 Pine Rd",
                City = "Chicago",
                ZipCode = "60601",
                MembershipType = "Student",
                RegistrationDate = DateTime.Now.AddMonths(-1),
                ExpiryDate = DateTime.Now.AddYears(1),
                BooksBorrowed = 3,
                BooksReturned = 2
            }
        };

        public IActionResult Index(string search, string membershipType)
        {
            var filteredVisitors = visitors.Where(v => v.IsActive).ToList();

            if (!string.IsNullOrEmpty(search))
            {
                filteredVisitors = filteredVisitors.Where(v =>
                    v.FirstName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    v.LastName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    v.MembershipId.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    v.Email.Contains(search, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }

            if (!string.IsNullOrEmpty(membershipType))
            {
                filteredVisitors = filteredVisitors.Where(v => v.MembershipType == membershipType).ToList();
            }

            ViewBag.MembershipTypes = new[] { "Standard", "Premium", "Student" };
            return View(filteredVisitors);
        }

        public IActionResult Details(int id)
        {
            var visitor = visitors.FirstOrDefault(v => v.VisitorId == id);
            if (visitor == null)
            {
                return NotFound();
            }
            return View(visitor);
        }

        public IActionResult Create()
        {
            ViewBag.MembershipTypes = new[] { "Standard", "Premium", "Student" };
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Visitor visitor)
        {
            if (ModelState.IsValid)
            {
                visitor.VisitorId = visitors.Any() ? visitors.Max(v => v.VisitorId) + 1 : 1;
                visitor.MembershipId = $"LM{DateTime.Now.Year}{visitor.VisitorId:D4}";
                
                // Set expiry based on membership type
                visitor.ExpiryDate = visitor.MembershipType switch
                {
                    "Student" => DateTime.Now.AddYears(1),
                    "Premium" => DateTime.Now.AddYears(2),
                    _ => DateTime.Now.AddYears(1)
                };

                visitors.Add(visitor);
                TempData["Success"] = "Visitor registered successfully!";
                return RedirectToAction(nameof(Index));
            }
            ViewBag.MembershipTypes = new[] { "Standard", "Premium", "Student" };
            return View(visitor);
        }

        public IActionResult Edit(int id)
        {
            var visitor = visitors.FirstOrDefault(v => v.VisitorId == id);
            if (visitor == null)
            {
                return NotFound();
            }
            ViewBag.MembershipTypes = new[] { "Standard", "Premium", "Student" };
            return View(visitor);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Visitor updatedVisitor)
        {
            if (ModelState.IsValid)
            {
                var visitor = visitors.FirstOrDefault(v => v.VisitorId == id);
                if (visitor == null)
                {
                    return NotFound();
                }

                visitor.FirstName = updatedVisitor.FirstName;
                visitor.LastName = updatedVisitor.LastName;
                visitor.Email = updatedVisitor.Email;
                visitor.Phone = updatedVisitor.Phone;
                visitor.Address = updatedVisitor.Address;
                visitor.City = updatedVisitor.City;
                visitor.ZipCode = updatedVisitor.ZipCode;
                visitor.MembershipType = updatedVisitor.MembershipType;
                visitor.ExpiryDate = updatedVisitor.ExpiryDate;
                visitor.IsActive = updatedVisitor.IsActive;

                TempData["Success"] = "Visitor updated successfully!";
                return RedirectToAction(nameof(Index));
            }
            ViewBag.MembershipTypes = new[] { "Standard", "Premium", "Student" };
            return View(updatedVisitor);
        }

        public IActionResult Delete(int id)
        {
            var visitor = visitors.FirstOrDefault(v => v.VisitorId == id);
            if (visitor == null)
            {
                return NotFound();
            }
            return View(visitor);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteConfirmed(int id)
        {
            var visitor = visitors.FirstOrDefault(v => v.VisitorId == id);
            if (visitor != null)
            {
                visitor.IsActive = false;
                TempData["Success"] = "Visitor removed successfully!";
            }
            return RedirectToAction(nameof(Index));
        }

        public static Visitor GetVisitorById(int id)
        {
            return visitors.FirstOrDefault(v => v.VisitorId == id);
        }

        public static List<Visitor> GetAllVisitors()
        {
            return visitors.Where(v => v.IsActive).ToList();
        }
    }
}
