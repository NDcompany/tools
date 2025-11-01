// ===================================
// APP INITIALIZATION
// ===================================
let allTools = [];
let filteredTools = [];
let fuse = null;
let displayedTools = 0;
const TOOLS_PER_LOAD = 9;

// Expanded color palette for unique card colors
const cardColors = [
    '#84994F', // Primary green
    '#FCB53B', // Accent orange
    '#A72703', // Danger red
    '#FFE797', // Secondary yellow
    '#6B7F3A', // Dark green
    '#D89B2A', // Dark orange
    '#8B1E02', // Dark red
    '#E6D078', // Dark yellow
    '#9FB464', // Light green
    '#FDCA6B', // Light orange
    '#C93F1F', // Medium red
    '#FFF0B3', // Pale yellow
    '#708542', // Olive green
    '#EAA83D', // Golden orange
    '#B83310', // Brick red
    '#F5E599'  // Cream yellow
];

// Function to generate consistent color for a tool based on its name
function getColorForTool(toolName, index) {
    // Use both name hash and index for unique distribution
    let hash = 0;
    for (let i = 0; i < toolName.length; i++) {
        hash = toolName.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Combine hash with index to ensure uniqueness
    const colorIndex = (Math.abs(hash) + index) % cardColors.length;
    return cardColors[colorIndex];
}

// ===================================
// PRELOADER
// ===================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
        initializeApp();
    }, 1500);
});

// ===================================
// INITIALIZE APP
// ===================================
function initializeApp() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 50,
        easing: 'ease-out-cubic'
    });
    
    // Setup navbar
    setupNavbar();
    
    // Setup typewriter effect
    setupTypewriter();
    
    // Setup scroll button
    setupScrollButton();
    
    // Load tools
    loadTools();
    
    // Setup search and filters
    setupSearch();
    
    // Setup infinite scroll
    setupInfiniteScroll();
}

// ===================================
// NAVBAR FUNCTIONALITY
// ===================================
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Sticky navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Theme toggle
    setupThemeToggle();
}

// ===================================
// THEME TOGGLE FUNCTIONALITY
// ===================================
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    updateLogos(currentTheme);
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Add transition class
        html.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // Update theme
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        updateLogos(newTheme);
        
        // Animate icon
        themeIcon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeIcon.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

function updateLogos(theme) {
    const logoDark = document.getElementById('navbar-logo-dark');
    const logoLight = document.getElementById('navbar-logo-light');
    
    if (!logoDark || !logoLight) return;
    
    if (theme === 'dark') {
        logoDark.style.display = 'none';
        logoLight.style.display = 'block';
    } else {
        logoDark.style.display = 'block';
        logoLight.style.display = 'none';
    }
}

// ===================================
// TYPEWRITER EFFECT
// ===================================
function setupTypewriter() {
    const typewriterElement = document.getElementById('typewriter');
    const text = 'Smart, Powerful, and Built for Everyone.';
    let index = 0;
    
    function type() {
        if (index < text.length) {
            typewriterElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 80);
        }
    }
    
    setTimeout(type, 500);
}

// ===================================
// SCROLL BUTTON
// ===================================
function setupScrollButton() {
    const scrollBtn = document.getElementById('scrollBtn');
    scrollBtn.addEventListener('click', () => {
        document.getElementById('searchSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
}

// ===================================
// LOAD TOOLS FROM JSON
// ===================================
async function loadTools() {
    try {
        const response = await fetch('tools.json');
        if (!response.ok) throw new Error('Failed to load tools');
        
        allTools = await response.json();
        filteredTools = [...allTools];
        
        // Initialize Fuse.js for fuzzy search
        const fuseOptions = {
            keys: ['name', 'description', 'category'],
            threshold: 0.3,
            distance: 100
        };
        fuse = new Fuse(allTools, fuseOptions);
        
        // Render initial tools
        displayedTools = 0;
        renderTools();
        
    } catch (error) {
        console.error('Error loading tools:', error);
        showError('Failed to load tools. Please refresh the page.');
    }
}

// ===================================
// RENDER TOOLS
// ===================================
function renderTools(append = false) {
    const toolsGrid = document.getElementById('toolsGrid');
    const noResults = document.getElementById('noResults');
    
    if (!append) {
        toolsGrid.innerHTML = '';
        displayedTools = 0;
    }
    
    if (filteredTools.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    const toolsToDisplay = filteredTools.slice(displayedTools, displayedTools + TOOLS_PER_LOAD);
    
    toolsToDisplay.forEach((tool, index) => {
        const card = createToolCard(tool, displayedTools + index);
        toolsGrid.appendChild(card);
    });
    
    displayedTools += toolsToDisplay.length;
    
    // Initialize Vanilla Tilt on new cards
    setTimeout(() => {
        VanillaTilt.init(document.querySelectorAll('.tool-card'), {
            max: 5,
            speed: 400,
            glare: true,
            'max-glare': 0.2
        });
    }, 100);
}

// ===================================
// CREATE TOOL CARD
// ===================================
function createToolCard(tool, index) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index % 3) * 100);
    
    // Assign unique color based on tool name and index
    const color = getColorForTool(tool.name, index);
    card.style.setProperty('--card-color', color);
    
    // Get icon
    const icon = getToolIcon(tool);
    
    card.innerHTML = `
        <div class="tool-icon">
            ${icon}
        </div>
        <span class="tool-category">${tool.category || 'General'}</span>
        <h3 class="tool-name">${tool.name}</h3>
        <p class="tool-description">${tool.description}</p>
        <a href="${tool.link}" class="tool-btn">
            Use Tool
            <i class="fas fa-arrow-right"></i>
        </a>
    `;
    
    return card;
}

// ===================================
// GET TOOL ICON
// ===================================
function getToolIcon(tool) {
    // If tool has a custom icon, use it
    if (tool.icon) {
        return `<img src="${tool.icon}" alt="${tool.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
    }
    
    // Otherwise, use Font Awesome icons based on category or name
    const iconMap = {
        'SEO': '<i class="fas fa-chart-line"></i>',
        'Finance': '<i class="fas fa-file-invoice-dollar"></i>',
        'Converter': '<i class="fas fa-file-image"></i>',
        'Productivity': '<i class="fas fa-tasks"></i>',
        'Design': '<i class="fas fa-paint-brush"></i>',
        'Development': '<i class="fas fa-code"></i>',
        'Analytics': '<i class="fas fa-chart-pie"></i>',
        'Marketing': '<i class="fas fa-bullhorn"></i>',
        'Communication': '<i class="fas fa-comments"></i>',
        'Security': '<i class="fas fa-shield-alt"></i>'
    };
    
    // Try to match by category
    if (tool.category && iconMap[tool.category]) {
        return iconMap[tool.category];
    }
    
    // Try to match by keywords in name
    const name = tool.name.toLowerCase();
    if (name.includes('invoice') || name.includes('finance')) {
        return iconMap['Finance'];
    } else if (name.includes('image') || name.includes('pdf') || name.includes('convert')) {
        return iconMap['Converter'];
    } else if (name.includes('seo') || name.includes('rank')) {
        return iconMap['SEO'];
    }
    
    // Default icon
    return '<i class="fas fa-tools"></i>';
}

// ===================================
// SEARCH AND FILTER
// ===================================
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    // Search input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
    
    // Category filter
    categoryFilter.addEventListener('change', () => {
        performSearch(searchInput.value);
    });
    
    // Sort filter
    sortFilter.addEventListener('change', () => {
        performSearch(searchInput.value);
    });
}

// ===================================
// PERFORM SEARCH
// ===================================
function performSearch(query) {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    // Start with all tools
    let results = allTools;
    
    // Apply fuzzy search if query exists
    if (query.trim() !== '' && fuse) {
        const fuseResults = fuse.search(query);
        results = fuseResults.map(result => result.item);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        results = results.filter(tool => tool.category === categoryFilter);
    }
    
    // Apply sorting
    switch (sortFilter) {
        case 'az':
            results.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'za':
            results.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'latest':
            // Assuming tools are already in latest order by default
            results.reverse();
            break;
    }
    
    filteredTools = results;
    renderTools(false);
    
    // Reinitialize AOS for new elements
    setTimeout(() => {
        AOS.refresh();
    }, 100);
}

// ===================================
// INFINITE SCROLL
// ===================================
function setupInfiniteScroll() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && displayedTools < filteredTools.length) {
                loadingIndicator.style.display = 'block';
                
                setTimeout(() => {
                    renderTools(true);
                    loadingIndicator.style.display = 'none';
                    AOS.refresh();
                }, 500);
            }
        });
    }, {
        rootMargin: '200px'
    });
    
    observer.observe(loadingIndicator);
}

// ===================================
// ERROR HANDLING
// ===================================
function showError(message) {
    const toolsGrid = document.getElementById('toolsGrid');
    toolsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--color-danger); margin-bottom: 1rem;"></i>
            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${message}</h3>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.8rem 2rem; background: var(--color-primary); color: white; border: 3px solid black; cursor: pointer; font-weight: 600;">
                Reload Page
            </button>
        </div>
    `;
}

// ===================================
// PWA REGISTRATION
// ===================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// ===================================
// GSAP ANIMATIONS
// ===================================
gsap.from('.shape-1', {
    duration: 2,
    y: -50,
    rotation: -45,
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top center',
        toggleActions: 'play none none reverse'
    }
});

gsap.from('.shape-2', {
    duration: 2,
    y: 50,
    scale: 0.5,
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top center',
        toggleActions: 'play none none reverse'
    }
});

gsap.from('.shape-3', {
    duration: 2,
    x: 50,
    rotation: 45,
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top center',
        toggleActions: 'play none none reverse'
    }
});

// ===================================
// DYNAMIC CATEGORY POPULATION
// ===================================
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = new Set(allTools.map(tool => tool.category).filter(Boolean));
    
    categories.forEach(category => {
        if (!Array.from(categoryFilter.options).some(opt => opt.value === category)) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
}

// Call after tools are loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (allTools.length > 0) {
            populateCategoryFilter();
        }
    }, 2000);
});
