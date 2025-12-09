using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using KloudsavvyTraining.Models;

namespace KloudsavvyTraining.Controllers
{
    public class CoursesController : Controller
    {
        private static List<Course> courses = InitializeCourses();

        public static List<Course> GetAllCourses()
        {
            return courses;
        }

        private static List<Course> InitializeCourses()
        {
            return new List<Course>
            {
                new Course
                {
                    CourseId = 1,
                    Title = "Docker for Absolute Beginners",
                    ShortDescription = "Learn Docker from scratch with hands-on labs",
                    Description = "Master Docker containers, images, volumes, and networking. Perfect for DevOps beginners.",
                    InstructorName = "John DevOps",
                    InstructorId = 1,
                    Price = 49.99m,
                    DurationMinutes = 360,
                    Level = "Beginner",
                    CategoryId = 1,
                    CategoryName = "DevOps",
                    IsPublished = true,
                    EnrollmentCount = 15420,
                    AverageRating = 4.8,
                    TotalVideos = 45,
                    LearningOutcomes = new List<string> { "Understand Docker architecture", "Create and manage containers", "Build custom Docker images", "Use Docker Compose" },
                    Prerequisites = new List<string> { "Basic Linux knowledge", "Command line familiarity" }
                },
                new Course
                {
                    CourseId = 2,
                    Title = "Kubernetes for Beginners",
                    ShortDescription = "Complete guide to Kubernetes orchestration",
                    Description = "Learn Kubernetes fundamentals, deployments, services, and advanced features.",
                    InstructorName = "Sarah Cloud",
                    InstructorId = 2,
                    Price = 79.99m,
                    DurationMinutes = 480,
                    Level = "Intermediate",
                    CategoryId = 3,
                    CategoryName = "Kubernetes",
                    IsPublished = true,
                    EnrollmentCount = 12350,
                    AverageRating = 4.9,
                    TotalVideos = 58,
                    LearningOutcomes = new List<string> { "Deploy applications on Kubernetes", "Understand Pods and Services", "Configure networking", "Manage storage" },
                    Prerequisites = new List<string> { "Docker knowledge", "Basic networking" }
                },
                new Course
                {
                    CourseId = 3,
                    Title = "AWS Solutions Architect",
                    ShortDescription = "Prepare for AWS certification",
                    Description = "Comprehensive AWS course covering EC2, S3, VPC, IAM, and more.",
                    InstructorName = "Mike Cloud",
                    InstructorId = 3,
                    Price = 99.99m,
                    DurationMinutes = 720,
                    Level = "Advanced",
                    CategoryId = 2,
                    CategoryName = "Cloud Computing",
                    IsPublished = true,
                    EnrollmentCount = 18700,
                    AverageRating = 4.7,
                    TotalVideos = 85,
                    LearningOutcomes = new List<string> { "Design scalable AWS architectures", "Implement security best practices", "Optimize costs", "Pass AWS certification" },
                    Prerequisites = new List<string> { "Cloud computing basics", "Networking fundamentals" }
                },
                new Course
                {
                    CourseId = 4,
                    Title = "Jenkins CI/CD Pipeline",
                    ShortDescription = "Build automated CI/CD pipelines",
                    Description = "Master Jenkins for continuous integration and continuous deployment.",
                    InstructorName = "Alex DevOps",
                    InstructorId = 4,
                    Price = 59.99m,
                    DurationMinutes = 300,
                    Level = "Intermediate",
                    CategoryId = 4,
                    CategoryName = "CI/CD",
                    IsPublished = true,
                    EnrollmentCount = 9800,
                    AverageRating = 4.6,
                    TotalVideos = 42,
                    LearningOutcomes = new List<string> { "Create Jenkins pipelines", "Integrate with Git", "Automate testing", "Deploy to production" },
                    Prerequisites = new List<string> { "Basic Git knowledge", "Software development experience" }
                },
                new Course
                {
                    CourseId = 5,
                    Title = "Linux Administration Bootcamp",
                    ShortDescription = "Complete Linux sysadmin course",
                    Description = "From basics to advanced Linux administration and shell scripting.",
                    InstructorName = "Tom Linux",
                    InstructorId = 5,
                    Price = 69.99m,
                    DurationMinutes = 540,
                    Level = "Beginner",
                    CategoryId = 5,
                    CategoryName = "Linux",
                    IsPublished = true,
                    EnrollmentCount = 14200,
                    AverageRating = 4.8,
                    TotalVideos = 67,
                    LearningOutcomes = new List<string> { "Navigate Linux filesystem", "Manage users and permissions", "Write shell scripts", "Configure services" },
                    Prerequisites = new List<string> { "No prerequisites" }
                },
                new Course
                {
                    CourseId = 6,
                    Title = "Terraform Infrastructure as Code",
                    ShortDescription = "Automate infrastructure with Terraform",
                    Description = "Learn to provision and manage cloud infrastructure using Terraform.",
                    InstructorName = "Emma Cloud",
                    InstructorId = 6,
                    Price = 79.99m,
                    DurationMinutes = 420,
                    Level = "Intermediate",
                    CategoryId = 1,
                    CategoryName = "DevOps",
                    IsPublished = true,
                    EnrollmentCount = 11500,
                    AverageRating = 4.7,
                    TotalVideos = 52,
                    LearningOutcomes = new List<string> { "Write Terraform configurations", "Manage state files", "Work with modules", "Multi-cloud deployments" },
                    Prerequisites = new List<string> { "Cloud platform experience", "Basic scripting" }
                }
            };
        }

        public ActionResult Index(string category, string level, string search)
        {
            var filteredCourses = courses.Where(c => c.IsPublished).ToList();

            if (!string.IsNullOrEmpty(category))
            {
                filteredCourses = filteredCourses.Where(c => c.CategoryName.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(level))
            {
                filteredCourses = filteredCourses.Where(c => c.Level.Equals(level, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(search))
            {
                filteredCourses = filteredCourses.Where(c => 
                    c.Title.IndexOf(search, StringComparison.OrdinalIgnoreCase) >= 0 ||
                    c.Description.IndexOf(search, StringComparison.OrdinalIgnoreCase) >= 0
                ).ToList();
            }

            ViewBag.Categories = courses.Select(c => c.CategoryName).Distinct().ToList();
            ViewBag.CurrentCategory = category;
            ViewBag.CurrentLevel = level;
            ViewBag.SearchTerm = search;

            return View(filteredCourses);
        }

        public ActionResult Details(int id)
        {
            var course = courses.FirstOrDefault(c => c.CourseId == id);
            if (course == null)
            {
                return HttpNotFound();
            }

            // Generate sample videos for the course
            course.Videos = GenerateVideosForCourse(course);

            return View(course);
        }

        private List<Video> GenerateVideosForCourse(Course course)
        {
            var videos = new List<Video>();
            // Using publicly available sample video URLs for demonstration
            var sampleVideoUrls = new[]
            {
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
            };

            for (int i = 1; i <= course.TotalVideos; i++)
            {
                videos.Add(new Video
                {
                    VideoId = course.CourseId * 100 + i,
                    CourseId = course.CourseId,
                    Title = $"Lecture {i}: {course.Title} - Part {i}",
                    Description = $"Learn about {course.Title} in this comprehensive lecture.",
                    VideoUrl = sampleVideoUrls[(i - 1) % sampleVideoUrls.Length], // Cycle through sample videos
                    DurationSeconds = 600 + (i * 30),
                    OrderIndex = i,
                    IsFree = i <= 2 // First 2 videos are free preview
                });
            }
            return videos;
        }

        public static Course GetCourseById(int id)
        {
            return courses.FirstOrDefault(c => c.CourseId == id);
        }

        public static void AddCourse(Course course)
        {
            course.CourseId = courses.Max(c => c.CourseId) + 1;
            courses.Add(course);
        }

        public static void UpdateCourse(Course updatedCourse)
        {
            var course = courses.FirstOrDefault(c => c.CourseId == updatedCourse.CourseId);
            if (course != null)
            {
                course.Title = updatedCourse.Title;
                course.Description = updatedCourse.Description;
                course.Price = updatedCourse.Price;
                course.Level = updatedCourse.Level;
                course.IsPublished = updatedCourse.IsPublished;
                course.UpdatedDate = DateTime.Now;
            }
        }

        public static void DeleteCourse(int id)
        {
            var course = courses.FirstOrDefault(c => c.CourseId == id);
            if (course != null)
            {
                courses.Remove(course);
            }
        }
    }
}
