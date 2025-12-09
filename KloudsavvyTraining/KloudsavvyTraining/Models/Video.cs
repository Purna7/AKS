using System;

namespace KloudsavvyTraining.Models
{
    public class Video
    {
        public int VideoId { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string VideoUrl { get; set; }
        public string Thumbnail { get; set; }
        public int DurationSeconds { get; set; }
        public int OrderIndex { get; set; }
        public bool IsFree { get; set; } // Preview videos
        public DateTime UploadedDate { get; set; }
        public int ViewCount { get; set; }

        public Video()
        {
            UploadedDate = DateTime.Now;
            IsFree = false;
            ViewCount = 0;
        }

        public string GetFormattedDuration()
        {
            var minutes = DurationSeconds / 60;
            var seconds = DurationSeconds % 60;
            return $"{minutes:D2}:{seconds:D2}";
        }
    }
}
