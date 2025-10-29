// Log page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models
(function() {
    'use strict';
    
    function init() {
        renderLogPage();
        attachHandlers();
    }
    
    function renderLogPage() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="view-container">
                <h1 class="title">Learning Log</h1>
                <div class="has-text-centered mt-5">
                    <i class="fas fa-book-open fa-3x mb-3"></i>
                    <p class="subtitle">Log page coming soon!</p>
                    <p>This is where you'll track your learning journey.</p>
                </div>
            </div>
        `;
    }
    
    function attachHandlers() {
        // FAB click - add learning entry
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', () => {
                Utils.showToast('Add learning feature coming soon!', 'info');
            });
        }
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
