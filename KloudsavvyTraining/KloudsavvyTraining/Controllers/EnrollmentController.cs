using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using KloudsavvyTraining.Models;

namespace KloudsavvyTraining.Controllers
{
    public class EnrollmentController : Controller
    {
        private static List<Enrollment> enrollments = new List<Enrollment>();

        [HttpPost]
        public ActionResult Enroll(int courseId)
        {
            var course = CoursesController.GetCourseById(courseId);
            if (course == null)
            {
                return HttpNotFound();
            }

            // Simplified - in real app, get from authenticated user
            int userId = Session["UserId"] != null ? (int)Session["UserId"] : 1;
            string userEmail = Session["UserEmail"]?.ToString() ?? "student@example.com";

            // Check if already enrolled
            var existingEnrollment = enrollments.FirstOrDefault(e => e.UserId == userId && e.CourseId == courseId);
            if (existingEnrollment != null)
            {
                TempData["Info"] = "You are already enrolled in this course.";
                return RedirectToAction("MyCourses");
            }

            // Create payment record
            var payment = new Payment
            {
                PaymentId = new Random().Next(10000, 99999),
                UserId = userId,
                CourseId = courseId,
                Amount = course.Price,
                PaymentMethod = "CreditCard",
                TransactionId = Guid.NewGuid().ToString(),
                Status = "Completed"
            };

            // Create enrollment
            var enrollment = new Enrollment
            {
                EnrollmentId = enrollments.Count + 1,
                UserId = userId,
                UserEmail = userEmail,
                CourseId = courseId,
                CourseTitle = course.Title,
                TotalVideos = course.TotalVideos
            };

            enrollments.Add(enrollment);
            course.EnrollmentCount++;

            // Store enrolled courses in session
            var enrolledCourses = Session["EnrolledCourses"]?.ToString() ?? "";
            Session["EnrolledCourses"] = enrolledCourses + courseId.ToString() + ",";

            TempData["Success"] = $"Successfully enrolled in {course.Title}!";
            return RedirectToAction("MyCourses");
        }

        public ActionResult MyCourses()
        {
            // Simplified - in real app, get from authenticated user
            int userId = Session["UserId"] != null ? (int)Session["UserId"] : 1;

            var userEnrollments = enrollments.Where(e => e.UserId == userId).ToList();
            
            // Load course details for each enrollment
            foreach (var enrollment in userEnrollments)
            {
                var course = CoursesController.GetCourseById(enrollment.CourseId);
                if (course != null)
                {
                    ViewBag.Courses = ViewBag.Courses ?? new Dictionary<int, Course>();
                    ((Dictionary<int, Course>)ViewBag.Courses)[enrollment.CourseId] = course;
                }
            }

            return View(userEnrollments);
        }

        [HttpPost]
        public ActionResult UpdateProgress(int enrollmentId, int completedVideos)
        {
            var enrollment = enrollments.FirstOrDefault(e => e.EnrollmentId == enrollmentId);
            if (enrollment != null)
            {
                enrollment.CompletedVideos = completedVideos;
                enrollment.UpdateProgress();
            }

            return Json(new { success = true, progress = enrollment?.ProgressPercentage ?? 0 });
        }
    }
}
