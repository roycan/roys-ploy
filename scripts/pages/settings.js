// Settings page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models, ExportModule, ImportModule
(function() {
    'use strict';
    
    let currentImportTab = 'file'; // 'file' or 'paste'
    
    function init() {
        renderSettingsPage();
        
        // FAB action - download backup
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', async () => {
                const state = Storage.loadState();
                await ExportModule.exportJSON(state);
                Utils.showToast('Backup downloaded!', 'success');
                
                // Update last backup time
                const updatedState = Models.recordBackup(state);
                Storage.saveState(updatedState);
            });
        }
    }
    
    function renderSettingsPage() {
        const state = Storage.loadState();
        const stats = Storage.getStorageStats();
        const reviewCadence = state.settings?.reviewCadenceDays || 7;
        const backupReminder = state.settings?.backupReminderDays || 30;
        
        document.getElementById('app').innerHTML = `
            <div class="container" style="padding: 1rem 1rem 5rem 1rem;">
                <h1 class="title is-4">Settings</h1>
                
                <!-- Storage Stats -->
                <div class="box" style="margin-bottom: 1.5rem;">
                    <h2 class="subtitle is-5">Storage</h2>
                    <p class="is-size-7">Using ${Utils.formatBytes(stats.docSize)} of ${Utils.formatBytes(stats.limit)}</p>
                    <progress class="progress is-small ${stats.percentUsed > 80 ? 'is-danger' : 'is-primary'}" value="${stats.percentUsed}" max="100">${stats.percentUsed}%</progress>
                    <p class="is-size-7 has-text-grey">
                        Projects: ${state.projects.length} | 
                        Ideas: ${state.ideas.length} | 
                        Logs: ${state.logs.length} | 
                        Wins: ${state.wins.length}
                    </p>
                </div>
                
                <!-- Backup & Export -->
                <div class="box" style="margin-bottom: 1.5rem;">
                    <h2 class="subtitle is-5">Backup & Export</h2>
                    
                    <div class="buttons" style="margin-bottom: 1rem; flex-wrap: wrap;">
                        <button class="button is-primary is-small" id="export-json-btn">
                            <span class="icon"><i class="fas fa-download"></i></span>
                            <span>Download JSON</span>
                        </button>
                        <button class="button is-small" id="copy-json-btn">
                            <span class="icon"><i class="fas fa-copy"></i></span>
                            <span>Copy to Clipboard</span>
                        </button>
                        ${Utils.supportsWebShare() ? `
                            <button class="button is-small" id="share-json-btn">
                                <span class="icon"><i class="fas fa-share"></i></span>
                                <span>Share</span>
                            </button>
                        ` : ''}
                    </div>
                    
                    <h3 class="subtitle is-6">Export CSVs</h3>
                    <div class="buttons" style="flex-wrap: wrap;">
                        <button class="button is-info is-small" id="export-projects-csv-btn">
                            <span class="icon"><i class="fas fa-file-csv"></i></span>
                            <span>Projects CSV</span>
                        </button>
                        <button class="button is-info is-small" id="export-logs-csv-btn">
                            <span class="icon"><i class="fas fa-file-csv"></i></span>
                            <span>Learning Logs CSV</span>
                        </button>
                        <button class="button is-info is-small" id="export-wins-csv-btn">
                            <span class="icon"><i class="fas fa-file-csv"></i></span>
                            <span>Wins CSV</span>
                        </button>
                        <button class="button is-info is-small" id="export-ideas-csv-btn">
                            <span class="icon"><i class="fas fa-file-csv"></i></span>
                            <span>Ideas CSV</span>
                        </button>
                    </div>
                    
                    <h3 class="subtitle is-6" style="margin-top: 1rem;">Export Calendars</h3>
                    <div class="buttons" style="flex-wrap: wrap;">
                        <button class="button is-success is-small" id="export-all-ics-btn">
                            <span class="icon"><i class="fas fa-calendar"></i></span>
                            <span>All Active Reviews (.ics)</span>
                        </button>
                    </div>
                </div>
                
                <!-- Import -->
                <div class="box" style="margin-bottom: 1.5rem;">
                    <h2 class="subtitle is-5">Import Data</h2>
                    <p class="is-size-7 has-text-grey" style="margin-bottom: 1rem;">
                        Restore a backup or merge data from another device.
                    </p>
                    
                    <div class="tabs is-small is-toggle">
                        <ul>
                            <li class="${currentImportTab === 'file' ? 'is-active' : ''}" data-import-tab="file">
                                <a>Upload File</a>
                            </li>
                            <li class="${currentImportTab === 'paste' ? 'is-active' : ''}" data-import-tab="paste">
                                <a>Paste JSON</a>
                            </li>
                        </ul>
                    </div>
                    
                    <div id="import-tab-content">
                        ${currentImportTab === 'file' ? renderFileImportTab() : renderPasteImportTab()}
                    </div>
                </div>
                
                <!-- Preferences -->
                <div class="box" style="margin-bottom: 1.5rem;">
                    <h2 class="subtitle is-5">Preferences</h2>
                    
                    <div class="field">
                        <label class="label is-small">Weekly Review Cadence (days)</label>
                        <div class="control">
                            <input 
                                class="input is-small" 
                                type="number" 
                                id="review-cadence-input" 
                                min="1" 
                                max="30" 
                                value="${reviewCadence}"
                            >
                        </div>
                        <p class="help">How often to remind you to review active projects.</p>
                    </div>
                    
                    <div class="field">
                        <label class="label is-small">Backup Reminder (days)</label>
                        <div class="control">
                            <input 
                                class="input is-small" 
                                type="number" 
                                id="backup-reminder-input" 
                                min="1" 
                                max="90" 
                                value="${backupReminder}"
                            >
                        </div>
                        <p class="help">How often to remind you to download a backup.</p>
                    </div>
                    
                    <button class="button is-primary is-small" id="save-preferences-btn">Save Preferences</button>
                </div>
                
                <!-- Danger Zone -->
                <div class="box has-background-danger-light" style="margin-bottom: 1.5rem;">
                    <h2 class="subtitle is-5 has-text-danger">Danger Zone</h2>
                    <p class="is-size-7" style="margin-bottom: 1rem;">
                        These actions cannot be undone. Make sure you have a backup first!
                    </p>
                    <button class="button is-danger is-small" id="clear-all-data-btn">
                        <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
                        <span>Clear All Data</span>
                    </button>
                </div>
            </div>
        `;
        
        attachHandlers();
    }
    
    function renderFileImportTab() {
        return `
            <div class="field">
                <div class="file has-name is-fullwidth">
                    <label class="file-label">
                        <input class="file-input" type="file" id="import-file-input" accept=".json,application/json">
                        <span class="file-cta">
                            <span class="file-icon">
                                <i class="fas fa-upload"></i>
                            </span>
                            <span class="file-label">
                                Choose a file…
                            </span>
                        </span>
                        <span class="file-name" id="import-file-name">
                            No file chosen
                        </span>
                    </label>
                </div>
            </div>
            <button class="button is-primary is-small" id="preview-import-file-btn" disabled>
                Preview Import
            </button>
        `;
    }
    
    function renderPasteImportTab() {
        return `
            <div class="field">
                <div class="control">
                    <textarea 
                        class="textarea is-small" 
                        id="import-paste-textarea" 
                        placeholder="Paste your JSON backup here..."
                        rows="4"
                    ></textarea>
                </div>
            </div>
            <button class="button is-primary is-small" id="preview-import-paste-btn">
                Preview Import
            </button>
        `;
    }
    
    function attachHandlers() {
        const state = Storage.loadState();
        
        // Export JSON
        document.getElementById('export-json-btn')?.addEventListener('click', async () => {
            const filename = await ExportModule.exportJSON(state);
            Utils.showToast(`Backup downloaded: ${filename}`);
            const updatedState = Models.recordBackup(state);
            Storage.saveState(updatedState);
        });
        
        // Copy JSON
        document.getElementById('copy-json-btn')?.addEventListener('click', async () => {
            const success = await ExportModule.copyJSON(state);
            if (success) {
                Utils.showToast('Backup copied to clipboard!');
                const updatedState = Models.recordBackup(state);
                Storage.saveState(updatedState);
            } else {
                Utils.showToast('Failed to copy to clipboard', 'danger');
            }
        });
        
        // Share JSON
        document.getElementById('share-json-btn')?.addEventListener('click', async () => {
            const success = await ExportModule.shareJSON(state);
            if (success) {
                Utils.showToast('Shared successfully!');
            }
        });
        
        // CSV Exports
        document.getElementById('export-projects-csv-btn')?.addEventListener('click', () => {
            ExportModule.exportProjectsCSV(state);
            Utils.showToast('Projects CSV downloaded!');
        });
        
        document.getElementById('export-logs-csv-btn')?.addEventListener('click', () => {
            ExportModule.exportLogsCSV(state);
            Utils.showToast('Learning logs CSV downloaded!');
        });
        
        document.getElementById('export-wins-csv-btn')?.addEventListener('click', () => {
            ExportModule.exportWinsCSV(state);
            Utils.showToast('Wins CSV downloaded!');
        });
        
        document.getElementById('export-ideas-csv-btn')?.addEventListener('click', () => {
            ExportModule.exportIdeasCSV(state);
            Utils.showToast('Ideas CSV downloaded!');
        });
        
        // ICS Export
        document.getElementById('export-all-ics-btn')?.addEventListener('click', () => {
            ExportModule.exportAllActiveReviewsICS(state);
            Utils.showToast('Calendar file downloaded!');
        });
        
        // Import tabs
        document.querySelectorAll('[data-import-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                currentImportTab = tab.getAttribute('data-import-tab');
                renderSettingsPage();
            });
        });
        
        // File import
        const fileInput = document.getElementById('import-file-input');
        const fileNameSpan = document.getElementById('import-file-name');
        const previewFileBtn = document.getElementById('preview-import-file-btn');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileNameSpan.textContent = file.name;
                    previewFileBtn.disabled = false;
                } else {
                    fileNameSpan.textContent = 'No file chosen';
                    previewFileBtn.disabled = true;
                }
            });
        }
        
        if (previewFileBtn) {
            previewFileBtn.addEventListener('click', async () => {
                const file = fileInput.files[0];
                if (file) {
                    try {
                        const importData = await ImportModule.importFromFile(file);
                        showImportPreviewModal(importData);
                    } catch (error) {
                        alert('Error reading file: ' + error.message);
                    }
                }
            });
        }
        
        // Paste import
        const previewPasteBtn = document.getElementById('preview-import-paste-btn');
        if (previewPasteBtn) {
            previewPasteBtn.addEventListener('click', () => {
                const textarea = document.getElementById('import-paste-textarea');
                const text = textarea.value.trim();
                
                if (!text) {
                    alert('Please paste your JSON backup first.');
                    return;
                }
                
                try {
                    const importData = ImportModule.importFromText(text);
                    showImportPreviewModal(importData);
                } catch (error) {
                    alert('Error parsing JSON: ' + error.message);
                }
            });
        }
        
        // Save preferences
        document.getElementById('save-preferences-btn')?.addEventListener('click', () => {
            const reviewCadence = parseInt(document.getElementById('review-cadence-input').value, 10);
            const backupReminder = parseInt(document.getElementById('backup-reminder-input').value, 10);
            
            if (reviewCadence < 1 || reviewCadence > 30) {
                alert('Review cadence must be between 1 and 30 days.');
                return;
            }
            
            if (backupReminder < 1 || backupReminder > 90) {
                alert('Backup reminder must be between 1 and 90 days.');
                return;
            }
            
            const updatedState = {
                ...state,
                settings: {
                    ...state.settings,
                    reviewCadenceDays: reviewCadence,
                    backupReminderDays: backupReminder
                }
            };
            
            Storage.saveState(updatedState);
            Utils.showToast('Preferences saved!');
        });
        
        // Clear all data
        document.getElementById('clear-all-data-btn')?.addEventListener('click', () => {
            const confirmed = confirm('Are you ABSOLUTELY SURE you want to delete ALL your data? This cannot be undone!\n\nType "DELETE" in the next prompt to confirm.');
            
            if (confirmed) {
                const doubleConfirm = prompt('Type DELETE to confirm:');
                if (doubleConfirm === 'DELETE') {
                    localStorage.clear();
                    alert('All data has been cleared. The app will now reload.');
                    window.location.href = 'index.html';
                }
            }
        });
    }
    
    function showImportPreviewModal(importData) {
        const state = Storage.loadState();
        const preview = Storage.getImportPreview(state, importData);
        const summary = Storage.getImportSummary(preview);
        
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Import Preview</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="notification is-info is-light">
                            <p class="is-size-7"><strong>Summary:</strong></p>
                            <p class="is-size-7">${summary}</p>
                        </div>
                        
                        ${preview.conflicts.length > 0 ? `
                            <div class="notification is-warning is-light">
                                <p class="is-size-7"><strong>Conflicts detected:</strong> ${preview.conflicts.length} item(s) exist in both backups.</p>
                                <p class="is-size-7">Choose a merge strategy:</p>
                            </div>
                        ` : ''}
                        
                        <form id="import-form">
                            <div class="field">
                                <label class="label is-small">Merge Strategy</label>
                                <div class="control">
                                    <label class="radio">
                                        <input type="radio" name="mergeStrategy" value="newest" checked>
                                        Keep newest (recommended)
                                    </label>
                                    <label class="radio">
                                        <input type="radio" name="mergeStrategy" value="incoming">
                                        Overwrite with imported
                                    </label>
                                    <label class="radio">
                                        <input type="radio" name="mergeStrategy" value="existing">
                                        Keep existing
                                    </label>
                                </div>
                                <p class="help">How to handle items that exist in both backups.</p>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="confirm-import-btn">Import Now</button>
                        <button class="button" id="cancel-import-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        document.getElementById('confirm-import-btn').addEventListener('click', () => {
            const mergeStrategy = document.querySelector('input[name="mergeStrategy"]:checked').value;
            
            try {
                ImportModule.executeImport(importData, { mergeStrategy });
                closeModal();
                Utils.showToast('Import successful!');
                renderSettingsPage();
            } catch (error) {
                alert('Import failed: ' + error.message);
            }
        });
        
        document.getElementById('cancel-import-btn').addEventListener('click', closeModal);
        modal.querySelector('.delete').addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
