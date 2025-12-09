using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using KloudsavvyTraining.Models;

namespace KloudsavvyTraining.Controllers
{
    public class HomeController : Controller
    {
        private static List<Course> GetFeaturedCourses()
        {
            return CoursesController.GetAllCourses()
                .Where(c => c.IsPublished)
                .OrderByDescending(c => c.EnrollmentCount)
                .Take(6)
                .ToList();
        }

        private static List<Category> GetCategories()
        {
            return new List<Category>
            {
                new Category { CategoryId = 1, Name = "DevOps", Description = "Master DevOps tools and practices", Icon = "⚙️", CourseCount = 15 },
                new Category { CategoryId = 2, Name = "Cloud Computing", Description = "AWS, Azure, GCP", Icon = "☁️", CourseCount = 12 },
                new Category { CategoryId = 3, Name = "Kubernetes", Description = "Container orchestration", Icon = "🚢", CourseCount = 8 },
                new Category { CategoryId = 4, Name = "CI/CD", Description = "Continuous Integration & Deployment", Icon = "🔄", CourseCount = 10 },
                new Category { CategoryId = 5, Name = "Linux", Description = "Linux administration", Icon = "🐧", CourseCount = 7 },
                new Category { CategoryId = 6, Name = "Programming", Description = "Python, Go, JavaScript", Icon = "💻", CourseCount = 20 }
            };
        }

        public ActionResult Index()
        {
            ViewBag.FeaturedCourses = GetFeaturedCourses();
            ViewBag.Categories = GetCategories();
            ViewBag.TotalStudents = 50000;
            ViewBag.TotalCourses = CoursesController.GetAllCourses().Count;
            ViewBag.TotalInstructors = 25;
            return View();
        }
    }
}
