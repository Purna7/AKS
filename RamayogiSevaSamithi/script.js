// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.remove('active');
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
    }
    
    lastScroll = currentScroll;
});

// Counter Animation for Impact Stats
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60 FPS
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Intersection Observer for Stats Animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                if (!stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    animateCounter(stat);
                }
            });
        }
    });
}, observerOptions);

// Observe the impact section
const impactSection = document.querySelector('.impact');
if (impactSection) {
    observer.observe(impactSection);
}

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Donation Amount Selection
let selectedAmount = 0;

function selectAmount(amount) {
    selectedAmount = amount;
    document.getElementById('customAmount').value = amount;
    
    // Update button styles
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Process Donation (Demo)
function processDonation() {
    const amount = document.getElementById('customAmount').value || selectedAmount;
    
    if (amount <= 0) {
        alert('Please select or enter a donation amount.');
        return;
    }
    
    // In a real application, this would integrate with a payment gateway
    alert(`Thank you for your generous donation of ₹${amount}!\n\nIn a production environment, you would be redirected to a secure payment gateway.\n\nYour contribution will make a real difference in the lives of those we serve.`);
    
    // Reset form
    document.getElementById('customAmount').value = '';
    selectedAmount = 0;
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Volunteer Form (Demo)
function showVolunteerForm() {
    alert('Volunteer Registration\n\nThank you for your interest in volunteering with Ramayogi Seva Samithi!\n\nIn a production environment, this would open a detailed registration form where you can:\n\n• Share your personal details\n• Select areas of interest\n• Indicate your availability\n• Upload necessary documents\n\nFor now, please contact us at volunteer@ramayogisevasamithi.org');
}

// Partner Form (Demo)
function showPartnerForm() {
    alert('Partnership Inquiry\n\nThank you for your interest in partnering with Ramayogi Seva Samithi!\n\nIn a production environment, this would open a partnership proposal form where you can:\n\n• Describe your organization\n• Propose collaboration ideas\n• Share resources you can contribute\n• Discuss mutual goals\n\nFor now, please contact us at info@ramayogisevasamithi.org');
}

// Social Share (Demo)
function shareOnSocial() {
    const shareText = 'Support Ramayogi Seva Samithi - A non-profit trust serving the elderly, orphans, underprivileged children, and protecting our environment. Join us in making a difference!';
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Ramayogi Seva Samithi',
            text: shareText,
            url: shareUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback for browsers that don't support Web Share API
        const message = `${shareText}\n\nVisit: ${shareUrl}\n\nShare this on your social media platforms to help us reach more people!`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            alert('Message copied to clipboard! You can now paste and share it on your social media platforms.');
        }).catch(() => {
            alert(message);
        });
    }
}

// Contact Form Submission (Demo)
function submitContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // In a real application, this would send the form data to a server
    console.log('Form Data:', { name, email, phone, subject, message });
    
    alert(`Thank you for contacting us, ${name}!\n\nWe have received your message and will get back to you within 24-48 hours.\n\nIn a production environment, this form would send an email to our team and store your inquiry in our database.`);
    
    // Reset form
    document.getElementById('contactForm').reset();
}

// Add Animation on Scroll for Cards
const observeCards = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'all 0.6s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);
        }
    });
}, {
    threshold: 0.1
});

// Observe all cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cause-card, .volunteer-card, .mission-box, .vision-box');
    cards.forEach(card => observeCards.observe(card));
});

// Custom Amount Input Handler
document.addEventListener('DOMContentLoaded', () => {
    const customAmountInput = document.getElementById('customAmount');
    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            selectedAmount = parseInt(customAmountInput.value) || 0;
            // Remove active class from preset buttons when custom amount is entered
            if (customAmountInput.value) {
                document.querySelectorAll('.amount-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
        });
    }
});

// Add keyboard accessibility
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// Lazy Loading for Background Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                if (element.dataset.bg) {
                    element.style.backgroundImage = `url(${element.dataset.bg})`;
                    imageObserver.unobserve(element);
                }
            }
        });
    });

    document.querySelectorAll('[data-bg]').forEach(element => {
        imageObserver.observe(element);
    });
}

// Performance: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll handler
const debouncedScroll = debounce(() => {
    // Any expensive scroll operations go here
}, 100);

window.addEventListener('scroll', debouncedScroll);

// Print-friendly version
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});

// Console message for developers
console.log('%cRamayogi Seva Samithi', 'font-size: 24px; color: #ff6b35; font-weight: bold;');
console.log('%cServing Humanity with Compassion', 'font-size: 14px; color: #667eea;');
console.log('Interested in contributing to our cause? Visit our website or contact us at info@ramayogisevasamithi.org');
