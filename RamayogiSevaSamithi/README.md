# Ramayogi Seva Samithi - Non-Profit Trust Website

A modern, responsive, and lightweight static website for Ramayogi Seva Samithi, a non-profit trust organization dedicated to serving the elderly, orphans, underprivileged children, and protecting the environment.

## 🌟 Features

- **Fully Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Lightweight & Fast** - Pure HTML, CSS, and JavaScript (no frameworks required)
- **Modern UI/UX** - Clean, professional design with smooth animations
- **Easy to Deploy** - Can run on any web server, Wix, or small Linux VM
- **Accessibility** - WCAG compliant with keyboard navigation support
- **SEO Optimized** - Semantic HTML and meta tags for better search visibility

## 📋 Sections

1. **Home** - Hero section with mission statement
2. **About** - Organization mission, vision, and values
3. **Our Causes** - Six main areas of service:
   - Elderly Care
   - Orphan Support
   - Education for All
   - Low-Income Support
   - Environment Protection
   - Student Scholarships
4. **Impact** - Statistics showcasing the organization's achievements
5. **Get Involved** - Volunteer and partnership opportunities
6. **Donate** - Donation options with impact breakdown
7. **Contact** - Contact information and inquiry form

## 🚀 Deployment Options

### Option 1: Local Testing
Simply open `index.html` in any modern web browser.

### Option 2: Linux VM (Nginx)
```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Copy files to web root
sudo cp -r * /var/www/html/

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Option 3: Linux VM (Apache)
```bash
# Install Apache
sudo apt update
sudo apt install apache2

# Copy files to web root
sudo cp -r * /var/www/html/

# Start Apache
sudo systemctl start apache2
sudo systemctl enable apache2
```

### Option 4: Python HTTP Server (Development)
```bash
# Navigate to project directory
cd RamayogiSevaSamithi

# Start Python server
python3 -m http.server 8000

# Access at http://localhost:8000
```

### Option 5: Node.js HTTP Server (Development)
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project directory
cd RamayogiSevaSamithi

# Start server
http-server -p 8000

# Access at http://localhost:8000
```

### Option 6: Wix Website
1. Log in to your Wix account
2. Create a new site or edit existing
3. Use Wix's HTML iframe or embed code feature
4. Copy the HTML, CSS, and JavaScript code
5. Paste into Wix's custom code sections

## 📁 File Structure

```
RamayogiSevaSamithi/
│
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #ff6b35;     /* Orange */
    --secondary-color: #f7931e;   /* Light Orange */
    --dark-color: #2c3e50;        /* Dark Blue */
    --light-color: #ecf0f1;       /* Light Gray */
}
```

### Content
- Edit text directly in `index.html`
- Update contact information in the Contact section
- Modify statistics in the Impact section

### Images
To add real images instead of gradient backgrounds:
1. Create an `images/` folder
2. Add your images
3. Update the hero section background in `styles.css`:
```css
.hero {
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                url('images/hero-background.jpg');
}
```

## 🔧 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚡ Performance

- **Page Load**: < 1 second
- **Total Size**: < 50KB (without images)
- **No external dependencies** (except Google Fonts)
- **Optimized for slow connections**

## 📱 Mobile-First Design

The website is built with a mobile-first approach:
- Touch-friendly buttons and navigation
- Responsive grid layouts
- Optimized font sizes
- Collapsible mobile menu

## 🛡️ Security Features

- No backend dependencies
- No user data storage
- HTTPS ready
- XSS protection through content policies

## 🌐 SEO Features

- Semantic HTML5 markup
- Meta descriptions
- Proper heading hierarchy
- Alt text for accessibility
- Fast loading times

## 📝 Integration Points

### Payment Gateway (Future Enhancement)
In `script.js`, update the `processDonation()` function to integrate with:
- Razorpay
- PayPal
- Stripe
- Other payment gateways

### Email Service (Future Enhancement)
In `script.js`, update the `submitContactForm()` function to integrate with:
- EmailJS
- SendGrid
- Mailgun
- Contact form services

### Analytics (Future Enhancement)
Add Google Analytics or similar by inserting tracking code in `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🤝 Contributing

To improve this website:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For technical support or questions:
- Email: tech@ramayogisevasamithi.org
- Website: www.ramayogisevasamithi.org

## 📄 License

This website is created for Ramayogi Seva Samithi. All rights reserved.

## 🙏 Acknowledgments

- Google Fonts (Poppins)
- Modern CSS techniques
- Web accessibility guidelines
- Community feedback

---

**Built with ❤️ for Ramayogi Seva Samithi**

*Serving Humanity with Compassion*
