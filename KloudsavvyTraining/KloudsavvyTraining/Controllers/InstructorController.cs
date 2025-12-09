using System;
using System.Collections.Generic;
using System.Web.Mvc;
using KloudsavvyTraining.Models;

namespace KloudsavvyTraining.Controllers
{
    public class InstructorController : Controller
    {
        public ActionResult Dashboard()
        {
            // Simplified - in real app, check authentication
            ViewBag.InstructorName = "John Instructor";
            ViewBag.TotalCourses = 8;
            ViewBag.TotalStudents = 15420;
            ViewBag.TotalRevenue = 125680.50m;
            ViewBag.MyCourses = CoursesController.GetAllCourses();

            return View();
        }

        public ActionResult CreateCourse()
        {
            return View(new Course());
        }

        [HttpPost]
        public ActionResult CreateCourse(Course course)
        {
            if (ModelState.IsValid)
            {
                course.InstructorId = 1; // Simplified - get from session
                course.InstructorName = "John Instructor";
                CoursesController.AddCourse(course);

                TempData["Success"] = "Course created successfully!";
                return RedirectToAction("Dashboard");
            }

            return View(course);
        }

        public ActionResult EditCourse(int id)
        {
            var course = CoursesController.GetCourseById(id);
            if (course == null)
            {
                return HttpNotFound();
            }

            return View(course);
        }

        [HttpPost]
        public ActionResult EditCourse(Course course)
        {
            if (ModelState.IsValid)
            {
                CoursesController.UpdateCourse(course);
                TempData["Success"] = "Course updated successfully!";
                return RedirectToAction("Dashboard");
            }

            return View(course);
        }

        [HttpPost]
        public ActionResult UploadVideo(int courseId, string title, string videoUrl, int durationSeconds)
        {
            var course = CoursesController.GetCourseById(courseId);
            if (course == null)
            {
                return Json(new { success = false, message = "Course not found" });
            }

            var video = new Video
            {
                VideoId = new Random().Next(1000, 9999),
                CourseId = courseId,
                Title = title,
                VideoUrl = videoUrl,
                DurationSeconds = durationSeconds,
                OrderIndex = course.Videos.Count + 1
            };

            course.Videos.Add(video);
            course.TotalVideos++;
            course.DurationMinutes += durationSeconds / 60;

            return Json(new { success = true, message = "Video uploaded successfully" });
        }
    }
}
