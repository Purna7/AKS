using System;

namespace KloudsavvyTraining.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; } // Student, Instructor, Admin
        public string Bio { get; set; }
        public DateTime RegisteredDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool IsActive { get; set; }
        public int TotalCoursesEnrolled { get; set; }
        public int TotalCoursesCompleted { get; set; }

        public User()
        {
            RegisteredDate = DateTime.Now;
            IsActive = true;
            Role = "Student";
            TotalCoursesEnrolled = 0;
            TotalCoursesCompleted = 0;
        }

        public string GetFullName()
        {
            return $"{FirstName} {LastName}";
        }

        public bool IsInstructor()
        {
            return Role == "Instructor" || Role == "Admin";
        }

        public bool IsAdmin()
        {
            return Role == "Admin";
        }
    }
}
