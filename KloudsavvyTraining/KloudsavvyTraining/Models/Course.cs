using System;
using System.Collections.Generic;

namespace KloudsavvyTraining.Models
{
    public class Course
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ShortDescription { get; set; }
        public string Thumbnail { get; set; }
        public string InstructorName { get; set; }
        public int InstructorId { get; set; }
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public string Level { get; set; } // Beginner, Intermediate, Advanced
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsPublished { get; set; }
        public int EnrollmentCount { get; set; }
        public double AverageRating { get; set; }
        public int TotalVideos { get; set; }
        public List<Video> Videos { get; set; }
        public List<string> LearningOutcomes { get; set; }
        public List<string> Prerequisites { get; set; }

        public Course()
        {
            Videos = new List<Video>();
            LearningOutcomes = new List<string>();
            Prerequisites = new List<string>();
            CreatedDate = DateTime.Now;
            UpdatedDate = DateTime.Now;
            IsPublished = false;
            EnrollmentCount = 0;
            AverageRating = 0.0;
        }

        public string GetFormattedDuration()
        {
            var hours = DurationMinutes / 60;
            var minutes = DurationMinutes % 60;
            if (hours > 0)
                return $"{hours}h {minutes}m";
            return $"{minutes}m";
        }

        public string GetFormattedPrice()
        {
            return Price == 0 ? "Free" : $"${Price:F2}";
        }
    }
}
