/**
 * MAKEPDF - Client-side scripts (Vanilla JavaScript)
 * Phase 1: Core Navigation, Health Checking & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            const isVisible = navLinks.style.display === 'flex';
            navLinks.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#0a0a0e';
                navLinks.style.padding = '1.5rem';
                navLinks.style.borderBottom = '1px solid rgba(255, 107, 0, 0.2)';
            }
        });
    }

    // 2. Smooth scrolling for internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // 3. Optional: Asynchronous Phase 1 Health Ping
    fetch('/api/health')
        .then(res => res.json())
        .then(data => {
            // Log health verification for developers
            console.log('[MAKEPDF Phase 1 System Ready]:', data);
        })
        .catch(err => {
            console.warn('[MAKEPDF Offline/Standalone Mode]');
        });
});
