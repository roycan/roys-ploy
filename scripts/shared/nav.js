// Navigation helper for Roy's Ploy (CommonJS/IIFE pattern)
// Auto-highlights the active nav item based on current page
(function(global) {
    'use strict';
    
    function setActiveNav() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        
        // Map HTML filenames to nav item data-page values
        const pageMap = {
            'index': 'dashboard',
            'focus': 'dashboard', // Focus is a sub-page of dashboard
            'garden': 'garden',
            'log': 'log',
            'settings': 'settings'
        };
        
        const activePage = pageMap[currentPage] || 'dashboard';
        
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => {
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Export to global scope
    global.Nav = {
        setActiveNav
    };
    
    // Auto-run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setActiveNav);
    } else {
        setActiveNav();
    }
})(window);
