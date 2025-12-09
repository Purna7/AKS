// Kloudsavvy Training Platform - Angular App

var app = angular.module('kloudsavvyApp', ['ngAnimate']);

// Courses Controller
app.controller('CoursesController', ['$scope', '$http', function($scope, $http) {
    $scope.courses = [];
    $scope.loading = true;
    $scope.selectedCategory = '';
    $scope.selectedLevel = '';
    
    $scope.loadCourses = function() {
        $scope.loading = true;
        // In a real app, this would be an AJAX call
        setTimeout(function() {
            $scope.loading = false;
            $scope.$apply();
        }, 500);
    };
    
    $scope.filterByCategory = function(category) {
        $scope.selectedCategory = category;
        window.location.href = '/Courses/Index?category=' + category;
    };
    
    $scope.filterByLevel = function(level) {
        $scope.selectedLevel = level;
        window.location.href = '/Courses/Index?level=' + level;
    };
    
    $scope.loadCourses();
}]);

// Enrollment Controller
app.controller('EnrollmentController', ['$scope', function($scope) {
    $scope.enrollments = [];
    
    $scope.continueLesson = function(courseId) {
        window.location.href = '/Courses/Details/' + courseId;
    };
    
    $scope.downloadCertificate = function(enrollmentId) {
        alert('Certificate download would be triggered here');
    };
}]);

// Video Player Controller
app.controller('VideoPlayerController', ['$scope', function($scope) {
    $scope.isPlaying = false;
    $scope.currentTime = 0;
    $scope.duration = 0;
    
    $scope.togglePlay = function() {
        $scope.isPlaying = !$scope.isPlaying;
    };
    
    $scope.markComplete = function() {
        alert('Video marked as complete');
    };
    
    $scope.nextVideo = function() {
        // Navigate to next video
        console.log('Next video');
    };
}]);

// Instructor Controller
app.controller('InstructorController', ['$scope', function($scope) {
    $scope.newCourse = {
        title: '',
        description: '',
        price: 0,
        level: 'Beginner'
    };
    
    $scope.createCourse = function() {
        console.log('Creating course:', $scope.newCourse);
    };
    
    $scope.uploadVideo = function(courseId) {
        console.log('Upload video for course:', courseId);
    };
}]);

// Admin Controller
app.controller('AdminController', ['$scope', function($scope) {
    $scope.approveCourse = function(courseId) {
        if (confirm('Approve this course?')) {
            console.log('Approving course:', courseId);
        }
    };
    
    $scope.deleteCourse = function(courseId) {
        if (confirm('Delete this course? This action cannot be undone.')) {
            console.log('Deleting course:', courseId);
        }
    };
}]);

// Loading Spinner Directive
app.directive('loadingSpinner', function() {
    return {
        restrict: 'E',
        template: '<div class="spinner" ng-show="loading"><div class="spinner-inner"></div></div>',
        scope: {
            loading: '='
        }
    };
});

// Star Rating Directive
app.directive('starRating', function() {
    return {
        restrict: 'E',
        scope: {
            rating: '=',
            maxRating: '='
        },
        template: '<span class="star-rating">' +
                  '<span ng-repeat="star in stars" class="star" ng-class="{filled: star <= rating}">★</span>' +
                  '</span>',
        link: function(scope) {
            scope.maxRating = scope.maxRating || 5;
            scope.stars = [];
            for (var i = 1; i <= scope.maxRating; i++) {
                scope.stars.push(i);
            }
        }
    };
});

// Price Filter
app.filter('currency', function() {
    return function(input) {
        if (input === 0 || input === '0') {
            return 'Free';
        }
        return '$' + parseFloat(input).toFixed(2);
    };
});

// Duration Filter
app.filter('duration', function() {
    return function(minutes) {
        var hours = Math.floor(minutes / 60);
        var mins = minutes % 60;
        if (hours > 0) {
            return hours + 'h ' + mins + 'm';
        }
        return mins + 'm';
    };
});

// Smooth Scroll Utility
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Initialize tooltips and other UI enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            alert.style.transition = 'opacity 0.5s';
            alert.style.opacity = '0';
            setTimeout(function() {
                alert.remove();
            }, 500);
        });
    }, 5000);
    
    // Add animation to course cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.course-card, .feature-card-modern, .category-card-large').forEach(function(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});

// Search functionality
function searchCourses(query) {
    if (query.length > 2) {
        window.location.href = '/Courses/Index?search=' + encodeURIComponent(query);
    }
}

// Enrollment confirmation
function confirmEnrollment(courseTitle, price) {
    var message = 'Enroll in "' + courseTitle + '" for ' + (price === 0 ? 'Free' : '$' + price) + '?';
    return confirm(message);
}

// Progress tracking
function updateProgress(enrollmentId, completedVideos) {
    // In a real app, this would be an AJAX call
    console.log('Updating progress:', enrollmentId, completedVideos);
}

// Video progress tracking
let videoWatchTime = 0;
let videoTimer = null;

function startVideoTracking(videoId) {
    videoTimer = setInterval(function() {
        videoWatchTime++;
        if (videoWatchTime > 30) { // Mark as watched after 30 seconds
            markVideoAsWatched(videoId);
            clearInterval(videoTimer);
        }
    }, 1000);
}

function markVideoAsWatched(videoId) {
    console.log('Video ' + videoId + ' marked as watched');
    // Update backend
}
