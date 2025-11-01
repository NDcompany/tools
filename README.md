# 🚀 N&D Co. Tools Portal

A **production-quality Progressive Web App (PWA)** showcasing all tools built by N&D Co. Built with pure HTML, CSS, and JavaScript, featuring mesmerizing animations and a Neo-brutalism design aesthetic.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

- 🎨 **Neo-brutalism Design** - Bold, layered UI with strong contrasts and soft shadows
- 🔍 **Fuzzy Search** - Intelligent search powered by Fuse.js
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Lightning Fast** - Optimized performance with lazy loading
- 🎭 **Mesmerizing Animations** - GSAP, AOS, and custom animations
- 📦 **PWA Ready** - Installable with offline support
- 🎯 **SEO Optimized** - Structured data and meta tags
- ♿ **Accessible** - WCAG compliant design
- 🔄 **Dynamic Content** - Tools loaded from JSON, no code changes needed

## 🎨 Color Palette

```css
Primary:   #84994F (Green)
Secondary: #FFE797 (Yellow)
Accent:    #FCB53B (Orange)
Danger:    #A72703 (Red)
```

## 📁 Project Structure

```
/tools
├── index.html          # Main HTML file
├── style.css           # All styling (Neo-brutalism theme)
├── script.js           # JavaScript functionality
├── tools.json          # Dynamic tools data
├── manifest.json       # PWA configuration
├── service-worker.js   # Service worker for offline support
├── README.md           # This file
└── /assets
    ├── /icons          # PWA icons (72x72 to 512x512)
    └── /images         # Screenshots and images
```

## 🚀 Quick Start

### 1. Clone or Download

```bash
git clone https://github.com/NDcompany/tools.git
cd tools
```

### 2. Serve Locally

Use any local server. For example:

**Python:**
```bash
python -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**VS Code Live Server:**
- Install "Live Server" extension
- Right-click `index.html` > "Open with Live Server"

### 3. Open in Browser

Navigate to `http://localhost:8000`

## 📝 Adding New Tools

Simply edit `tools.json`:

```json
{
  "name": "Your Tool Name",
  "description": "Brief description of your tool",
  "icon": "/path/to/icon.svg",
  "link": "/tools/your-tool",
  "category": "SEO"
}
```

The portal will automatically:
- Render the new tool card
- Add it to search index
- Update category filters
- Apply animations

## 🎯 Categories

- **SEO** - Search engine optimization tools
- **Finance** - Invoice, budget, and financial tools
- **Converter** - File conversion utilities
- **Productivity** - Task and workflow tools
- **Design** - Creative and design tools
- **Development** - Developer utilities
- **Analytics** - Data and analytics tools
- **Marketing** - Marketing automation tools

## 🔧 Technologies Used

### Core
- **HTML5** - Semantic markup with SEO optimization
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Vanilla JS, no frameworks

### Libraries (CDN)
- **GSAP** - Professional-grade animations
- **AOS.js** - Scroll animations
- **Vanilla Tilt** - 3D card tilt effects
- **Fuse.js** - Fuzzy search functionality
- **Font Awesome** - Icon library
- **Google Fonts** - Poppins font family

## 🎭 Animation Features

- **Preloader** - Animated loader with N&D Co. branding
- **Typewriter Effect** - Hero subtitle animation
- **Scroll Reveal** - Cards fade in on scroll
- **Hover Effects** - 3D tilt and shadow animations
- **Background Shapes** - Floating animated shapes
- **Smooth Transitions** - Fluid page interactions

## 📱 PWA Features

- ✅ Installable on mobile and desktop
- ✅ Offline functionality
- ✅ Fast loading with service worker caching
- ✅ Add to home screen prompt
- ✅ App-like experience

## 🔍 SEO Optimization

- ✅ Semantic HTML structure
- ✅ Meta tags (Open Graph, Twitter Cards)
- ✅ JSON-LD structured data
- ✅ Optimized images
- ✅ Fast load times
- ✅ Mobile-friendly
- ✅ Accessible (WCAG AA)

## 🎨 Customization

### Colors

Edit CSS variables in `style.css`:

```css
:root {
    --color-primary: #84994F;
    --color-secondary: #FFE797;
    --color-accent: #FCB53B;
    --color-danger: #A72703;
}
```

### Fonts

Change Google Font import in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap" rel="stylesheet">
```

### Icons

Replace icons in `/assets/icons/` with your own branded icons.

## 📊 Performance

Target Lighthouse Scores:
- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 100

## 🌐 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

**Crafted by:**
- **Nakshatra Ranjan Saha**
- **Dipro Ghosh**

**N&D Co.** - Building Tools for Tomorrow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues or questions:
- 📧 Email: support@ndcompany.in
- 🌐 Website: https://ndcompany.in
- 💼 LinkedIn: [N&D Co.](https://linkedin.com/company/nd-co)

## 🎉 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- GSAP for animation library
- All open-source contributors

---

**© 2025 N&D Co. | All Rights Reserved**

Made with ❤️ by Nakshatra Ranjan Saha & Dipro Ghosh
