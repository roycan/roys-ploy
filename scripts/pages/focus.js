// Focus page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models, ExportModule
(function() {
    'use strict';
    
    let currentProjectId = null;
    let currentProject = null;
    
    function init() {
        // Get project ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        currentProjectId = urlParams.get('id');
        
        if (!currentProjectId) {
            window.location.href = 'index.html';
            return;
        }
        
        const state = Storage.loadState();
        currentProject = Models.getProjectById(state, currentProjectId);
        
        if (!currentProject) {
            alert('Project not found');
            window.location.href = 'index.html';
            return;
        }
        
        renderFocusPage(state);
        attachHandlers();
    }
    
    function renderFocusPage(state) {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="view-container">
                <div class="breadcrumb-nav">
                    <a href="index.html" class="breadcrumb-link">
                        <i class="fas fa-arrow-left"></i> Back to Dashboard
                    </a>
                </div>
                
                <div class="project-focus-header">
                    <h1 class="title">${Utils.escapeHtml(currentProject.title)}</h1>
                    <span class="badge is-${currentProject.status}">${currentProject.status}</span>
                </div>
                
                <div class="purpose-section">
                    <h2 class="subtitle">Why This Matters</h2>
                    <p>${Utils.escapeHtml(currentProject.purpose || 'No purpose set')}</p>
                </div>
                
                <div class="next-step-section">
                    <h3>Next Step</h3>
                    <p>${Utils.escapeHtml(currentProject.nextStep || 'No next step set')}</p>
                </div>
                
                <div class="stats-section">
                    <p>Logs: ${Models.getProjectLogs(state, currentProjectId).length}</p>
                    <p>Wins: ${Models.getProjectWins(state, currentProjectId).length}</p>
                </div>
                
                <div class="has-text-centered mt-5">
                    <p class="subtitle">Full focus page coming soon!</p>
                    <p>For now, you can navigate back to dashboard.</p>
                </div>
            </div>
        `;
    }
    
    function attachHandlers() {
        // FAB click - celebrate win
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', () => {
                Utils.showToast('Celebrate win feature coming soon!', 'info');
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
