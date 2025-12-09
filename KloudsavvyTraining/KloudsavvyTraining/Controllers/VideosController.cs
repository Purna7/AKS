using System.Linq;
using System.Web.Mvc;
using KloudsavvyTraining.Models;

namespace KloudsavvyTraining.Controllers
{
    public class VideosController : Controller
    {
        public ActionResult Player(int courseId, int videoId)
        {
            var course = CoursesController.GetCourseById(courseId);
            if (course == null)
            {
                return HttpNotFound();
            }

            // Check if user is enrolled (simplified - in real app check session/auth)
            bool isEnrolled = Session["EnrolledCourses"] != null && 
                            Session["EnrolledCourses"].ToString().Contains(courseId.ToString());

            var video = course.Videos.FirstOrDefault(v => v.VideoId == videoId);
            if (video == null)
            {
                return HttpNotFound();
            }

            // Check access - free preview or enrolled
            if (!video.IsFree && !isEnrolled)
            {
                TempData["Error"] = "Please enroll in this course to watch this video.";
                return RedirectToAction("Details", "Courses", new { id = courseId });
            }

            ViewBag.Course = course;
            ViewBag.NextVideo = course.Videos.FirstOrDefault(v => v.OrderIndex == video.OrderIndex + 1);
            ViewBag.PrevVideo = course.Videos.FirstOrDefault(v => v.OrderIndex == video.OrderIndex - 1);

            return View(video);
        }
    }
}
