using System;

namespace KloudsavvyTraining.Models
{
    public class Enrollment
    {
        public int EnrollmentId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        public int ProgressPercentage { get; set; }
        public int CompletedVideos { get; set; }
        public int TotalVideos { get; set; }
        public bool IsCertificateIssued { get; set; }
        public int? Rating { get; set; }
        public string Review { get; set; }

        public Enrollment()
        {
            EnrollmentDate = DateTime.Now;
            ProgressPercentage = 0;
            CompletedVideos = 0;
            IsCertificateIssued = false;
        }

        public bool IsCompleted()
        {
            return CompletionDate.HasValue;
        }

        public void UpdateProgress()
        {
            if (TotalVideos > 0)
            {
                ProgressPercentage = (CompletedVideos * 100) / TotalVideos;
                if (ProgressPercentage >= 100 && !CompletionDate.HasValue)
                {
                    CompletionDate = DateTime.Now;
                    IsCertificateIssued = true;
                }
            }
        }
    }
}
