namespace KloudsavvyTraining.Models
{
    public class Category
    {
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public int CourseCount { get; set; }

        public Category()
        {
            CourseCount = 0;
        }
    }
}
