// Garden page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models
(function() {
    'use strict';
    
    function init() {
        renderGardenPage();
        attachHandlers();
    }
    
    function renderGardenPage() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="view-container">
                <h1 class="title">Idea Garden</h1>
                <div class="has-text-centered mt-5">
                    <i class="fas fa-seedling fa-3x mb-3"></i>
                    <p class="subtitle">Garden page coming soon!</p>
                    <p>This is where you'll capture and nurture your ideas.</p>
                </div>
            </div>
        `;
    }
    
    function attachHandlers() {
        // FAB click - capture idea
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', () => {
                Utils.showToast('Capture idea feature coming soon!', 'info');
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
