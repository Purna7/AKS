-- Kloudsavvy Training Platform Database Schema
-- SQL Server Database

-- Create Database
CREATE DATABASE KloudsavvyTraining;
GO

USE KloudsavvyTraining;
GO

-- Users Table
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'Student', -- Student, Instructor, Admin
    ProfilePicture NVARCHAR(500),
    Bio NVARCHAR(MAX),
    RegisteredDate DATETIME NOT NULL DEFAULT GETDATE(),
    LastLoginDate DATETIME,
    IsActive BIT NOT NULL DEFAULT 1,
    TotalCoursesEnrolled INT NOT NULL DEFAULT 0,
    TotalCoursesCompleted INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Categories Table
CREATE TABLE Categories (
    CategoryId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    Icon NVARCHAR(10),
    CourseCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Courses Table
CREATE TABLE Courses (
    CourseId INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    ShortDescription NVARCHAR(500),
    Description NVARCHAR(MAX),
    Thumbnail NVARCHAR(500),
    InstructorId INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    DurationMinutes INT NOT NULL DEFAULT 0,
    Level NVARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced
    CategoryId INT NOT NULL,
    IsPublished BIT NOT NULL DEFAULT 0,
    EnrollmentCount INT NOT NULL DEFAULT 0,
    AverageRating DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    TotalVideos INT NOT NULL DEFAULT 0,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (InstructorId) REFERENCES Users(UserId),
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
);

-- Course Learning Outcomes
CREATE TABLE CourseLearningOutcomes (
    OutcomeId INT PRIMARY KEY IDENTITY(1,1),
    CourseId INT NOT NULL,
    Outcome NVARCHAR(500) NOT NULL,
    OrderIndex INT NOT NULL DEFAULT 0,
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE
);

-- Course Prerequisites
CREATE TABLE CoursePrerequisites (
    PrerequisiteId INT PRIMARY KEY IDENTITY(1,1),
    CourseId INT NOT NULL,
    Prerequisite NVARCHAR(500) NOT NULL,
    OrderIndex INT NOT NULL DEFAULT 0,
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE
);

-- Videos Table
CREATE TABLE Videos (
    VideoId INT PRIMARY KEY IDENTITY(1,1),
    CourseId INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    VideoUrl NVARCHAR(500) NOT NULL,
    Thumbnail NVARCHAR(500),
    DurationSeconds INT NOT NULL,
    OrderIndex INT NOT NULL,
    IsFree BIT NOT NULL DEFAULT 0, -- Free preview videos
    UploadedDate DATETIME NOT NULL DEFAULT GETDATE(),
    ViewCount INT NOT NULL DEFAULT 0,
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE
);

-- Enrollments Table
CREATE TABLE Enrollments (
    EnrollmentId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    CourseId INT NOT NULL,
    EnrollmentDate DATETIME NOT NULL DEFAULT GETDATE(),
    CompletionDate DATETIME,
    ProgressPercentage INT NOT NULL DEFAULT 0,
    CompletedVideos INT NOT NULL DEFAULT 0,
    IsCertificateIssued BIT NOT NULL DEFAULT 0,
    Rating INT,
    Review NVARCHAR(MAX),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId),
    UNIQUE (UserId, CourseId)
);

-- Video Progress Tracking
CREATE TABLE VideoProgress (
    ProgressId INT PRIMARY KEY IDENTITY(1,1),
    EnrollmentId INT NOT NULL,
    VideoId INT NOT NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    WatchedSeconds INT NOT NULL DEFAULT 0,
    LastWatchedDate DATETIME,
    FOREIGN KEY (EnrollmentId) REFERENCES Enrollments(EnrollmentId) ON DELETE CASCADE,
    FOREIGN KEY (VideoId) REFERENCES Videos(VideoId),
    UNIQUE (EnrollmentId, VideoId)
);

-- Payments Table
CREATE TABLE Payments (
    PaymentId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    CourseId INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL, -- CreditCard, PayPal, Stripe
    TransactionId NVARCHAR(255) NOT NULL UNIQUE,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Completed, Failed, Refunded
    PaymentDate DATETIME NOT NULL DEFAULT GETDATE(),
    Currency NVARCHAR(10) NOT NULL DEFAULT 'USD',
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId)
);

-- Course Reviews/Ratings
CREATE TABLE CourseReviews (
    ReviewId INT PRIMARY KEY IDENTITY(1,1),
    CourseId INT NOT NULL,
    UserId INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    Review NVARCHAR(MAX),
    ReviewDate DATETIME NOT NULL DEFAULT GETDATE(),
    IsApproved BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    UNIQUE (CourseId, UserId)
);

-- Certificates Table
CREATE TABLE Certificates (
    CertificateId INT PRIMARY KEY IDENTITY(1,1),
    EnrollmentId INT NOT NULL UNIQUE,
    CertificateNumber NVARCHAR(100) NOT NULL UNIQUE,
    IssueDate DATETIME NOT NULL DEFAULT GETDATE(),
    CertificateUrl NVARCHAR(500),
    FOREIGN KEY (EnrollmentId) REFERENCES Enrollments(EnrollmentId)
);

-- Indexes for Performance
CREATE INDEX IX_Courses_CategoryId ON Courses(CategoryId);
CREATE INDEX IX_Courses_InstructorId ON Courses(InstructorId);
CREATE INDEX IX_Courses_IsPublished ON Courses(IsPublished);
CREATE INDEX IX_Videos_CourseId ON Videos(CourseId);
CREATE INDEX IX_Enrollments_UserId ON Enrollments(UserId);
CREATE INDEX IX_Enrollments_CourseId ON Enrollments(CourseId);
CREATE INDEX IX_Payments_UserId ON Payments(UserId);
CREATE INDEX IX_CourseReviews_CourseId ON CourseReviews(CourseId);

-- Insert Sample Categories
INSERT INTO Categories (Name, Description, Icon, CourseCount) VALUES
('DevOps', 'Master DevOps tools and practices', '⚙️', 15),
('Cloud Computing', 'AWS, Azure, GCP', '☁️', 12),
('Kubernetes', 'Container orchestration', '🚢', 8),
('CI/CD', 'Continuous Integration & Deployment', '🔄', 10),
('Linux', 'Linux administration', '🐧', 7),
('Programming', 'Python, Go, JavaScript', '💻', 20);

-- Insert Sample Admin User
INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Role) VALUES
('admin@kloudsavvy.com', 'HASHED_PASSWORD_HERE', 'Admin', 'User', 'Admin');

-- Insert Sample Instructor
INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Role, Bio) VALUES
('instructor@kloudsavvy.com', 'HASHED_PASSWORD_HERE', 'John', 'DevOps', 'Instructor', 
 'DevOps expert with 10+ years of experience in cloud technologies and containerization.');

-- Insert Sample Courses
INSERT INTO Courses (Title, ShortDescription, Description, Thumbnail, InstructorId, Price, DurationMinutes, Level, CategoryId, IsPublished, EnrollmentCount, AverageRating, TotalVideos) VALUES
('Docker for Absolute Beginners', 'Learn Docker from scratch with hands-on labs', 
 'Master Docker containers, images, volumes, and networking. Perfect for DevOps beginners.',
 '🐳', 2, 49.99, 360, 'Beginner', 1, 1, 15420, 4.8, 45),
 
('Kubernetes for Beginners', 'Complete guide to Kubernetes orchestration',
 'Learn Kubernetes fundamentals, deployments, services, and advanced features.',
 '☸️', 2, 79.99, 480, 'Intermediate', 3, 1, 12350, 4.9, 58),
 
('AWS Solutions Architect', 'Prepare for AWS certification',
 'Comprehensive AWS course covering EC2, S3, VPC, IAM, and more.',
 '☁️', 2, 99.99, 720, 'Advanced', 2, 1, 18700, 4.7, 85);

-- Stored Procedures

-- Get All Published Courses
CREATE PROCEDURE sp_GetPublishedCourses
AS
BEGIN
    SELECT c.*, cat.Name AS CategoryName, u.FirstName + ' ' + u.LastName AS InstructorName
    FROM Courses c
    INNER JOIN Categories cat ON c.CategoryId = cat.CategoryId
    INNER JOIN Users u ON c.InstructorId = u.UserId
    WHERE c.IsPublished = 1
    ORDER BY c.EnrollmentCount DESC;
END;
GO

-- Get Course Details with Videos
CREATE PROCEDURE sp_GetCourseDetails
    @CourseId INT
AS
BEGIN
    SELECT c.*, cat.Name AS CategoryName, u.FirstName + ' ' + u.LastName AS InstructorName
    FROM Courses c
    INNER JOIN Categories cat ON c.CategoryId = cat.CategoryId
    INNER JOIN Users u ON c.InstructorId = u.UserId
    WHERE c.CourseId = @CourseId;
    
    SELECT * FROM Videos WHERE CourseId = @CourseId ORDER BY OrderIndex;
    
    SELECT * FROM CourseLearningOutcomes WHERE CourseId = @CourseId ORDER BY OrderIndex;
    
    SELECT * FROM CoursePrerequisites WHERE CourseId = @CourseId ORDER BY OrderIndex;
END;
GO

-- Enroll Student in Course
CREATE PROCEDURE sp_EnrollStudent
    @UserId INT,
    @CourseId INT
AS
BEGIN
    DECLARE @TotalVideos INT;
    
    SELECT @TotalVideos = TotalVideos FROM Courses WHERE CourseId = @CourseId;
    
    INSERT INTO Enrollments (UserId, CourseId, EnrollmentDate, CompletedVideos)
    VALUES (@UserId, @CourseId, GETDATE(), 0);
    
    UPDATE Courses SET EnrollmentCount = EnrollmentCount + 1 WHERE CourseId = @CourseId;
    UPDATE Users SET TotalCoursesEnrolled = TotalCoursesEnrolled + 1 WHERE UserId = @UserId;
    
    SELECT SCOPE_IDENTITY() AS EnrollmentId;
END;
GO

-- Update Video Progress
CREATE PROCEDURE sp_UpdateVideoProgress
    @EnrollmentId INT,
    @VideoId INT,
    @IsCompleted BIT,
    @WatchedSeconds INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM VideoProgress WHERE EnrollmentId = @EnrollmentId AND VideoId = @VideoId)
    BEGIN
        UPDATE VideoProgress 
        SET IsCompleted = @IsCompleted, 
            WatchedSeconds = @WatchedSeconds,
            LastWatchedDate = GETDATE()
        WHERE EnrollmentId = @EnrollmentId AND VideoId = @VideoId;
    END
    ELSE
    BEGIN
        INSERT INTO VideoProgress (EnrollmentId, VideoId, IsCompleted, WatchedSeconds, LastWatchedDate)
        VALUES (@EnrollmentId, @VideoId, @IsCompleted, @WatchedSeconds, GETDATE());
    END
    
    -- Update enrollment progress
    DECLARE @CompletedVideos INT, @TotalVideos INT, @CourseId INT;
    
    SELECT @CourseId = CourseId FROM Enrollments WHERE EnrollmentId = @EnrollmentId;
    SELECT @TotalVideos = COUNT(*) FROM Videos WHERE CourseId = @CourseId;
    SELECT @CompletedVideos = COUNT(*) FROM VideoProgress 
    WHERE EnrollmentId = @EnrollmentId AND IsCompleted = 1;
    
    DECLARE @ProgressPercentage INT = (@CompletedVideos * 100) / @TotalVideos;
    
    UPDATE Enrollments 
    SET CompletedVideos = @CompletedVideos,
        ProgressPercentage = @ProgressPercentage,
        CompletionDate = CASE WHEN @ProgressPercentage >= 100 THEN GETDATE() ELSE NULL END,
        IsCertificateIssued = CASE WHEN @ProgressPercentage >= 100 THEN 1 ELSE 0 END
    WHERE EnrollmentId = @EnrollmentId;
    
    IF @ProgressPercentage >= 100
    BEGIN
        UPDATE Users 
        SET TotalCoursesCompleted = TotalCoursesCompleted + 1
        WHERE UserId = (SELECT UserId FROM Enrollments WHERE EnrollmentId = @EnrollmentId);
    END
END;
GO

-- Get Student Enrollments
CREATE PROCEDURE sp_GetStudentEnrollments
    @UserId INT
AS
BEGIN
    SELECT e.*, c.Title AS CourseTitle, c.Thumbnail, c.TotalVideos,
           u.FirstName + ' ' + u.LastName AS InstructorName
    FROM Enrollments e
    INNER JOIN Courses c ON e.CourseId = c.CourseId
    INNER JOIN Users u ON c.InstructorId = u.UserId
    WHERE e.UserId = @UserId
    ORDER BY e.EnrollmentDate DESC;
END;
GO

-- Get Instructor Statistics
CREATE PROCEDURE sp_GetInstructorStats
    @InstructorId INT
AS
BEGIN
    SELECT 
        COUNT(DISTINCT c.CourseId) AS TotalCourses,
        SUM(c.EnrollmentCount) AS TotalStudents,
        SUM(c.EnrollmentCount * c.Price) AS TotalRevenue,
        AVG(c.AverageRating) AS AverageRating
    FROM Courses c
    WHERE c.InstructorId = @InstructorId;
END;
GO

-- Search Courses
CREATE PROCEDURE sp_SearchCourses
    @SearchTerm NVARCHAR(255) = NULL,
    @CategoryId INT = NULL,
    @Level NVARCHAR(50) = NULL
AS
BEGIN
    SELECT c.*, cat.Name AS CategoryName, u.FirstName + ' ' + u.LastName AS InstructorName
    FROM Courses c
    INNER JOIN Categories cat ON c.CategoryId = cat.CategoryId
    INNER JOIN Users u ON c.InstructorId = u.UserId
    WHERE c.IsPublished = 1
    AND (@SearchTerm IS NULL OR c.Title LIKE '%' + @SearchTerm + '%' OR c.Description LIKE '%' + @SearchTerm + '%')
    AND (@CategoryId IS NULL OR c.CategoryId = @CategoryId)
    AND (@Level IS NULL OR c.Level = @Level)
    ORDER BY c.EnrollmentCount DESC;
END;
GO

-- Update Course Rating
CREATE PROCEDURE sp_UpdateCourseRating
    @CourseId INT
AS
BEGIN
    UPDATE Courses
    SET AverageRating = (
        SELECT AVG(CAST(Rating AS DECIMAL(3,2)))
        FROM CourseReviews
        WHERE CourseId = @CourseId AND IsApproved = 1
    )
    WHERE CourseId = @CourseId;
END;
GO

-- Views

-- View: Popular Courses
CREATE VIEW vw_PopularCourses AS
SELECT TOP 10 c.*, cat.Name AS CategoryName, u.FirstName + ' ' + u.LastName AS InstructorName
FROM Courses c
INNER JOIN Categories cat ON c.CategoryId = cat.CategoryId
INNER JOIN Users u ON c.InstructorId = u.UserId
WHERE c.IsPublished = 1
ORDER BY c.EnrollmentCount DESC;
GO

-- View: Platform Statistics
CREATE VIEW vw_PlatformStats AS
SELECT 
    (SELECT COUNT(*) FROM Courses WHERE IsPublished = 1) AS TotalCourses,
    (SELECT COUNT(*) FROM Users WHERE Role = 'Student') AS TotalStudents,
    (SELECT COUNT(*) FROM Users WHERE Role = 'Instructor') AS TotalInstructors,
    (SELECT SUM(EnrollmentCount) FROM Courses) AS TotalEnrollments,
    (SELECT SUM(c.EnrollmentCount * c.Price) FROM Courses c) AS TotalRevenue;
GO

PRINT 'Database schema created successfully!';
