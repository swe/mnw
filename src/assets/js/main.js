// Main JavaScript file for the site
document.addEventListener('DOMContentLoaded', function() {

    // Mobile navigation toggle (if needed later)
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Create a single tooltip element
    const flagTooltip = document.createElement('div');
    flagTooltip.className = 'flag-tooltip';
    document.body.appendChild(flagTooltip);

    // Get all city flag elements
    const cityFlags = document.querySelectorAll('.city-flag');

    cityFlags.forEach(cityFlag => {
        cityFlag.addEventListener('mouseenter', function(e) {
            const flag = this.getAttribute('data-flag');
            flagTooltip.textContent = flag;
            flagTooltip.style.opacity = '1';
            flagTooltip.style.visibility = 'visible';
        });

        cityFlag.addEventListener('mousemove', function(e) {
            flagTooltip.style.left = e.clientX + 'px';
            flagTooltip.style.top = e.clientY + 'px';
        });

        cityFlag.addEventListener('mouseleave', function() {
            flagTooltip.style.opacity = '0';
            flagTooltip.style.visibility = 'hidden';
        });
    });

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav-menu--open');
            navToggle.classList.toggle('nav-toggle--active');
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add current year to footer if needed
    const currentYearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    currentYearElements.forEach(element => {
        element.textContent = currentYear;
    });

    // Simple image lazy loading (for future use)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Console message (optional)
    console.log('🚀 Site loaded successfully!');
});

// Live Vancouver Clock with Blinking Colon
// Add this to your main.js file

function updateVancouverTime() {
    const now = new Date();

    // Convert to Vancouver time (Pacific Time)
    const vancouverTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Vancouver"}));

    // Format hours and minutes
    const hours = vancouverTime.getHours().toString().padStart(2, '0');
    const minutes = vancouverTime.getMinutes().toString().padStart(2, '0');

    // Find the clock element and update it
    const clockElement = document.querySelector('.vancouver-clock');
    if (clockElement) {
        clockElement.innerHTML = `${hours}<span class="clock-colon">:</span>${minutes}`;
    }
}

// Initialize clock when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update immediately
    updateVancouverTime();

    // Update every second
    setInterval(updateVancouverTime, 1000);

    // Your existing code...
    console.log('🚀 Site loaded successfully!');
});