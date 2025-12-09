using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using KloudsavvyTraining.Models;

namespace KloudsavvyTraining.Controllers
{
    public class AdminController : Controller
    {
        public ActionResult Dashboard()
        {
            var courses = CoursesController.GetAllCourses();
            
            ViewBag.TotalCourses = courses.Count;
            ViewBag.PublishedCourses = courses.Count(c => c.IsPublished);
            ViewBag.TotalEnrollments = courses.Sum(c => c.EnrollmentCount);
            ViewBag.TotalRevenue = courses.Sum(c => c.EnrollmentCount * c.Price);
            ViewBag.Courses = courses;

            return View();
        }

        [HttpPost]
        public ActionResult ApproveCourse(int id)
        {
            var course = CoursesController.GetCourseById(id);
            if (course != null)
            {
                course.IsPublished = true;
                CoursesController.UpdateCourse(course);
                TempData["Success"] = "Course approved and published!";
            }

            return RedirectToAction("Dashboard");
        }

        [HttpPost]
        public ActionResult DeleteCourse(int id)
        {
            CoursesController.DeleteCourse(id);
            TempData["Success"] = "Course deleted successfully!";
            return RedirectToAction("Dashboard");
        }
    }
}
