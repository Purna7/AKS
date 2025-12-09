using System.Web.Mvc;
using KloudsavvyTraining.Models;

namespace KloudsavvyTraining.Controllers
{
    public class AccountController : Controller
    {
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Login(string email, string password)
        {
            // Simplified authentication - in real app use proper auth
            if (!string.IsNullOrEmpty(email) && !string.IsNullOrEmpty(password))
            {
                Session["UserId"] = 1;
                Session["UserEmail"] = email;
                Session["UserName"] = "Student User";
                Session["UserRole"] = "Student";

                TempData["Success"] = "Login successful!";
                return RedirectToAction("Index", "Home");
            }

            TempData["Error"] = "Invalid credentials";
            return View();
        }

        public ActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Register(string email, string password, string firstName, string lastName)
        {
            // Simplified registration
            if (!string.IsNullOrEmpty(email) && !string.IsNullOrEmpty(password))
            {
                var user = new User
                {
                    Email = email,
                    Password = password,
                    FirstName = firstName,
                    LastName = lastName,
                    Role = "Student"
                };

                Session["UserId"] = user.UserId;
                Session["UserEmail"] = user.Email;
                Session["UserName"] = user.GetFullName();
                Session["UserRole"] = user.Role;

                TempData["Success"] = "Registration successful!";
                return RedirectToAction("Index", "Home");
            }

            TempData["Error"] = "Please fill all fields";
            return View();
        }

        public ActionResult Logout()
        {
            Session.Clear();
            TempData["Success"] = "Logged out successfully!";
            return RedirectToAction("Index", "Home");
        }
    }
}
