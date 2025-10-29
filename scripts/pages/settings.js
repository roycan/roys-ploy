// Settings page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models, ExportModule, ImportModule
(function() {
    'use strict';
    
    function init() {
        renderSettingsPage();
        attachHandlers();
    }
    
    function renderSettingsPage() {
        const app = document.getElementById('app');
        const state = Storage.loadState();
        const stats = Storage.getStorageStats();
        
        app.innerHTML = `
            <div class="view-container">
                <h1 class="title">Settings</h1>
                
                <div class="box">
                    <h2 class="subtitle">Backup & Export</h2>
                    <p class="mb-3">Storage used: ${Utils.formatBytes(stats.docSize)} / ${Utils.formatBytes(stats.limit)}</p>
                    
                    <div class="buttons">
                        <button class="button is-primary" id="export-json-btn">
                            <span class="icon"><i class="fas fa-download"></i></span>
                            <span>Download JSON Backup</span>
                        </button>
                        <button class="button" id="copy-json-btn">
                            <span class="icon"><i class="fas fa-copy"></i></span>
                            <span>Copy to Clipboard</span>
                        </button>
                    </div>
                </div>
                
                <div class="has-text-centered mt-5">
                    <p class="subtitle">Full settings page coming soon!</p>
                    <p>Import, CSV exports, and preferences will be available here.</p>
                </div>
            </div>
        `;
    }
    
    function attachHandlers() {
        // Export JSON button
        document.getElementById('export-json-btn')?.addEventListener('click', async () => {
            const state = Storage.loadState();
            const filename = await ExportModule.exportJSON(state);
            Utils.showToast(`Backup downloaded: ${filename}`, 'success');
            
            // Update last backup time
            const updatedState = Models.recordBackup(state);
            Storage.saveState(updatedState);
        });
        
        // Copy JSON button
        document.getElementById('copy-json-btn')?.addEventListener('click', async () => {
            const state = Storage.loadState();
            const success = await ExportModule.copyJSON(state);
            if (success) {
                Utils.showToast('Backup copied to clipboard!', 'success');
                const updatedState = Models.recordBackup(state);
                Storage.saveState(updatedState);
            } else {
                Utils.showToast('Failed to copy to clipboard', 'danger');
            }
        });
        
        // FAB click - download backup
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', async () => {
                const state = Storage.loadState();
                await ExportModule.exportJSON(state);
                Utils.showToast('Backup downloaded!', 'success');
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
