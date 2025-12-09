# Kloudsavvy Training Platform

A comprehensive EdTech platform for technology courses similar to KodeKloud.com. Built with ASP.NET MVC 5 and AngularJS.

## Features

### Student Features
- Browse courses by category (DevOps, Cloud, Kubernetes, CI/CD, Linux, Programming)
- Filter courses by level (Beginner, Intermediate, Advanced)
- Search courses
- View course details with curriculum
- Watch video lectures
- Track learning progress
- Earn certificates upon completion
- Enrollment dashboard

### Instructor Features
- Instructor dashboard with analytics
- Create and manage courses
- Upload video content
- Track student enrollments
- View revenue statistics

### Admin Features
- Admin dashboard with platform statistics
- Approve/reject courses
- Manage all courses
- View total enrollments and revenue

## Technology Stack

- **Backend**: ASP.NET MVC 5 (.NET Framework 4.8)
- **Frontend**: AngularJS 1.8.2, HTML5, CSS3
- **Styling**: Custom CSS with modern gradients and animations
- **Data**: In-memory storage (can be extended to SQL Server)

## Project Structure

```
KloudsavvyTraining/
├── Controllers/
│   ├── HomeController.cs          # Landing page
│   ├── CoursesController.cs       # Course catalog
│   ├── VideosController.cs        # Video player
│   ├── EnrollmentController.cs    # Student enrollments
│   ├── InstructorController.cs    # Instructor dashboard
│   ├── AdminController.cs         # Admin panel
│   └── AccountController.cs       # Authentication
├── Models/
│   ├── Course.cs                  # Course entity
│   ├── Video.cs                   # Video entity
│   ├── Enrollment.cs              # Student enrollment
│   ├── User.cs                    # User entity
│   ├── Payment.cs                 # Payment records
│   └── Category.cs                # Course categories
├── Views/
│   ├── Home/Index.cshtml          # Homepage
│   ├── Courses/                   # Course views
│   ├── Videos/Player.cshtml       # Video player
│   ├── Enrollment/                # Student dashboard
│   ├── Instructor/                # Instructor views
│   ├── Admin/                     # Admin views
│   └── Account/                   # Login/Register
├── Content/
│   └── Site.css                   # Styles
└── Scripts/
    └── app.js                     # AngularJS app
```

## Sample Courses Included

1. **Docker for Absolute Beginners** ($49.99)
   - 45 videos, 6 hours
   - Beginner level
   - 15,420 students enrolled

2. **Kubernetes for Beginners** ($79.99)
   - 58 videos, 8 hours
   - Intermediate level
   - 12,350 students enrolled

3. **AWS Solutions Architect** ($99.99)
   - 85 videos, 12 hours
   - Advanced level
   - 18,700 students enrolled

4. **Jenkins CI/CD Pipeline** ($59.99)
   - 42 videos, 5 hours
   - Intermediate level

5. **Linux Administration Bootcamp** ($69.99)
   - 67 videos, 9 hours
   - Beginner level

6. **Terraform Infrastructure as Code** ($79.99)
   - 52 videos, 7 hours
   - Intermediate level

## Getting Started

### Prerequisites
- Visual Studio 2022
- .NET Framework 4.8
- IIS Express (included with Visual Studio)

### Installation

1. Open the solution in Visual Studio:
   ```
   KloudsavvyTraining.sln
   ```

2. Restore NuGet packages:
   - Right-click solution → "Restore NuGet Packages"
   - Or use Package Manager Console:
   ```
   Update-Package -reinstall
   ```

3. Build the solution:
   ```
   Build → Build Solution (Ctrl+Shift+B)
   ```

4. Run the application:
   ```
   Debug → Start Debugging (F5)
   ```

The application will open at: `http://localhost:5002/`

### Using Command Line

```powershell
# Navigate to project directory
cd KloudsavvyTraining\KloudsavvyTraining

# Restore packages
nuget restore

# Build project
msbuild KloudsavvyTraining.csproj /t:Build /p:Configuration=Debug

# Run with IIS Express
"C:\Program Files\IIS Express\iisexpress.exe" /path:"%CD%" /port:5002
```

## Key Features Walkthrough

### Homepage
- Stunning hero banner with platform statistics
- Featured courses section
- Category cards with visual backgrounds
- Feature highlights (Expert instructors, Hands-on labs, Certificates, Lifetime access)

### Course Catalog
- Filter by category and level
- Search functionality
- Course cards showing price, rating, instructor, duration
- Enrollment count

### Course Details
- Complete course information
- Learning outcomes
- Prerequisites
- Video curriculum with locked/unlocked indicators
- Free preview videos
- Enroll button with pricing

### Video Player
- Full video player interface
- Course playlist sidebar
- Previous/Next navigation
- Progress tracking
- Course context information

### Student Dashboard (My Courses)
- Enrolled courses with progress bars
- Continue learning buttons
- Certificate download (for completed courses)
- Completion status

### Instructor Dashboard
- Course management
- Create new courses
- Upload videos
- Analytics (total courses, students, revenue)
- Edit/delete courses

### Admin Dashboard
- Platform statistics
- Approve/publish courses
- Manage all courses
- View enrollments and revenue
- Delete courses

## Customization

### Adding New Categories
Edit `HomeController.cs` and `CoursesController.cs`:
```csharp
new Category { 
    CategoryId = 7, 
    Name = "Security", 
    Description = "Cybersecurity courses",
    Icon = "🔒",
    CourseCount = 5 
}
```

### Adding New Courses
Use the Instructor Dashboard or edit `CoursesController.cs`:
```csharp
new Course {
    CourseId = 7,
    Title = "Your Course Title",
    Description = "Course description",
    Price = 89.99m,
    Level = "Intermediate",
    // ... other properties
}
```

### Styling
Modify `Content/Site.css` to customize colors, fonts, and layouts.

### Adding Real Video Support
Replace the video placeholder in `Views/Videos/Player.cshtml` with:
```html
<video controls>
    <source src="@Model.VideoUrl" type="video/mp4">
</video>
```

## Database Integration (Optional)

The application currently uses in-memory storage. To add SQL Server:

1. Create database tables (see Database/Schema.sql)
2. Install Entity Framework:
   ```
   Install-Package EntityFramework
   ```
3. Create DbContext and connect models
4. Update controllers to use EF instead of static lists

## Security Notes

⚠️ **For Production Use:**
- Implement proper authentication (ASP.NET Identity)
- Add authorization attributes to controllers
- Hash passwords (never store plain text)
- Add CSRF protection
- Implement payment gateway (Stripe/PayPal)
- Add SSL/TLS
- Validate all user inputs
- Add rate limiting

## Future Enhancements

- [ ] SQL Server database integration
- [ ] Real video hosting (Azure Media Services, AWS S3)
- [ ] Payment processing (Stripe integration)
- [ ] User authentication (ASP.NET Identity)
- [ ] Email notifications
- [ ] Course reviews and ratings
- [ ] Discussion forums
- [ ] Quiz and assessments
- [ ] Mobile app
- [ ] API for third-party integrations

## License

This project is created for educational purposes.

## Support

For questions or issues, contact: support@kloudsavvy.com

## Screenshots

### Homepage
Modern hero banner with platform stats, featured courses, and category cards

### Course Catalog
Filterable course grid with search functionality

### Course Details
Complete course information with video curriculum

### Video Player
Full-screen video player with playlist sidebar

### Student Dashboard
Track progress and continue learning

### Instructor Dashboard
Manage courses and view analytics

### Admin Panel
Platform management and course approval

---

**Built with ❤️ for technology education**
