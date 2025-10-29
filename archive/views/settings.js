// Settings view for Roy's Ploy
import { getState, setState } from '../app.js';
import { recordBackup, getOverallStats, updateSettings } from '../models.js';
import { exportJSON, copyJSON, shareJSON, exportProjectsCSV, exportLogsCSV, exportWinsCSV, exportIdeasCSV, exportAllActiveReviewsICS } from '../export.js';
import { importFromFile, importFromText, executeImport, getImportSummary } from '../import.js';
import { getStorageStats } from '../storage.js';
import { formatBytes, formatDateTime, supportsWebShare, supportsFileSystemAccess, escapeHtml } from '../utils.js';

export function renderSettings() {
    const state = getState();
    const stats = getOverallStats(state);
    const storageStats = getStorageStats();
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="view-container">
            <h1 class="title">Settings ⚙️</h1>
            
            ${renderBackupSection(state, storageStats)}
            ${renderCalendarSection(state)}
            ${renderPreferences(state)}
            ${renderStats(stats, storageStats)}
            ${renderAbout()}
        </div>
    `;
    
    attachHandlers();
}

function renderBackupSection(state, storageStats) {
    const lastBackup = state.settings.lastBackupAt;
    
    return `
        <div class="box">
            <h2 class="subtitle">Backup & Sync</h2>
            
            <p class="mb-2">
                <strong>Last Backup:</strong> ${lastBackup ? formatDateTime(lastBackup) : 'Never'}
            </p>
            
            <p class="text-small text-muted mb-2">
                Storage used: ${formatBytes(storageStats.docSize)} 
                (${storageStats.percentUsed.toFixed(1)}% of ~5 MB)
            </p>
            
            <div class="buttons">
                <button class="button is-primary" id="export-json-btn">
                    <span class="icon"><i class="fas fa-download"></i></span>
                    <span>Download Backup (JSON)</span>
                </button>
                
                <button class="button" id="copy-json-btn">
                    <span class="icon"><i class="fas fa-copy"></i></span>
                    <span>Copy Backup</span>
                </button>
                
                ${supportsWebShare() ? `
                    <button class="button" id="share-json-btn">
                        <span class="icon"><i class="fas fa-share"></i></span>
                        <span>Share Backup</span>
                    </button>
                ` : ''}
            </div>
            
            <hr>
            
            <h3 class="subtitle is-6">Import Backup</h3>
            
            <div class="tabs is-small">
                <ul>
                    <li class="is-active" data-import-tab="file"><a>Choose File</a></li>
                    <li data-import-tab="paste"><a>Paste JSON</a></li>
                </ul>
            </div>
            
            <div id="import-file-panel">
                <div class="file has-name is-fullwidth">
                    <label class="file-label">
                        <input class="file-input" type="file" id="import-file" accept=".json,application/json">
                        <span class="file-cta">
                            <span class="file-icon">
                                <i class="fas fa-upload"></i>
                            </span>
                            <span class="file-label">
                                Choose file…
                            </span>
                        </span>
                        <span class="file-name" id="file-name">
                            No file selected
                        </span>
                    </label>
                </div>
            </div>
            
            <div id="import-paste-panel" style="display: none;">
                <div class="field">
                    <div class="control">
                        <textarea class="textarea" id="import-paste" placeholder="Paste your backup JSON here..." rows="6"></textarea>
                    </div>
                </div>
                <button class="button is-primary" id="import-from-paste-btn">
                    <span class="icon"><i class="fas fa-check"></i></span>
                    <span>Import from Pasted JSON</span>
                </button>
            </div>
            
            <hr>
            
            <h3 class="subtitle is-6">Export CSVs</h3>
            <p class="text-small text-muted mb-2">Download spreadsheet files for sharing or external analysis.</p>
            
            <div class="buttons">
                <button class="button is-small" id="export-projects-csv-btn">
                    <span class="icon"><i class="fas fa-file-csv"></i></span>
                    <span>Projects</span>
                </button>
                <button class="button is-small" id="export-logs-csv-btn">
                    <span class="icon"><i class="fas fa-file-csv"></i></span>
                    <span>Learning Logs</span>
                </button>
                <button class="button is-small" id="export-wins-csv-btn">
                    <span class="icon"><i class="fas fa-file-csv"></i></span>
                    <span>Wins</span>
                </button>
                <button class="button is-small" id="export-ideas-csv-btn">
                    <span class="icon"><i class="fas fa-file-csv"></i></span>
                    <span>Ideas</span>
                </button>
            </div>
        </div>
    `;
}

function renderCalendarSection(state) {
    return `
        <div class="box">
            <h2 class="subtitle">Calendar Integration</h2>
            
            <div class="field">
                <label class="label">Default Review Day</label>
                <div class="control">
                    <div class="select">
                        <select id="review-day">
                            <option value="0" ${state.settings.defaultReviewDay === 0 ? 'selected' : ''}>Sunday</option>
                            <option value="1" ${state.settings.defaultReviewDay === 1 ? 'selected' : ''}>Monday</option>
                            <option value="2" ${state.settings.defaultReviewDay === 2 ? 'selected' : ''}>Tuesday</option>
                            <option value="3" ${state.settings.defaultReviewDay === 3 ? 'selected' : ''}>Wednesday</option>
                            <option value="4" ${state.settings.defaultReviewDay === 4 ? 'selected' : ''}>Thursday</option>
                            <option value="5" ${state.settings.defaultReviewDay === 5 ? 'selected' : ''}>Friday</option>
                            <option value="6" ${state.settings.defaultReviewDay === 6 ? 'selected' : ''}>Saturday</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="field">
                <label class="label">Default Review Time (UTC)</label>
                <div class="control">
                    <input type="time" class="input" id="review-time" value="${state.settings.defaultReviewTimeUTC || '20:00'}">
                </div>
                <p class="help">Time is stored in UTC. Your local timezone: ${state.settings.timezone}</p>
            </div>
            
            <div class="buttons mt-2">
                <button class="button is-info" id="export-all-reviews-btn">
                    <span class="icon"><i class="fas fa-calendar-alt"></i></span>
                    <span>Download All Active Reviews (.ics)</span>
                </button>
            </div>
            
            <p class="help mt-2">
                Individual project reviews can be exported from the Project Focus view.
            </p>
        </div>
    `;
}

function renderPreferences(state) {
    return `
        <div class="box">
            <h2 class="subtitle">Preferences</h2>
            
            <div class="field">
                <label class="label">Backup Reminder (days)</label>
                <div class="control">
                    <input type="number" class="input" id="backup-reminder-days" 
                        value="${state.settings.backupReminderDays || 14}" min="1" max="90">
                </div>
                <p class="help">Remind me to backup after this many days.</p>
            </div>
        </div>
    `;
}

function renderStats(stats, storageStats) {
    return `
        <div class="box">
            <h2 class="subtitle">Statistics</h2>
            
            <div class="columns">
                <div class="column">
                    <p class="heading">Total Projects</p>
                    <p class="title is-4">${stats.totalProjects}</p>
                </div>
                <div class="column">
                    <p class="heading">Active Projects</p>
                    <p class="title is-4">${stats.activeProjects}</p>
                </div>
                <div class="column">
                    <p class="heading">Learning Logs</p>
                    <p class="title is-4">${stats.totalLogs}</p>
                </div>
                <div class="column">
                    <p class="heading">Wins Celebrated</p>
                    <p class="title is-4">${stats.totalWins}</p>
                </div>
            </div>
        </div>
    `;
}

function renderAbout() {
    return `
        <div class="box">
            <h2 class="subtitle">About Roy's Ploy</h2>
            <p class="mb-2">
                Version 1.0.0 (MVP)
            </p>
            <p class="text-small mb-2">
                A strengths-driven companion for sustainable long-term projects.
                Built with vanilla JavaScript, Bulma CSS, and localStorage.
            </p>
            <p class="text-small text-muted">
                Your data stays on your device. No tracking, no servers.
            </p>
        </div>
    `;
}

function attachHandlers() {
    // Export JSON
    document.getElementById('export-json-btn').addEventListener('click', async () => {
        const state = getState();
        const filename = await exportJSON(state);
        const updated = recordBackup(state);
        setState(updated);
        alert(`Backup downloaded: ${filename}`);
    });
    
    // Copy JSON
    document.getElementById('copy-json-btn').addEventListener('click', async () => {
        const state = getState();
        const success = await copyJSON(state);
        if (success) {
            alert('Backup copied to clipboard!');
        } else {
            alert('Failed to copy. Please try download instead.');
        }
    });
    
    // Share JSON (if supported)
    const shareBtn = document.getElementById('share-json-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const state = getState();
            try {
                await shareJSON(state);
                const updated = recordBackup(state);
                setState(updated);
            } catch (error) {
                if (error.message !== 'User cancelled') {
                    alert('Failed to share: ' + error.message);
                }
            }
        });
    }
    
    // Import tabs
    document.querySelectorAll('[data-import-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('[data-import-tab]').forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            
            const panel = tab.getAttribute('data-import-tab');
            document.getElementById('import-file-panel').style.display = panel === 'file' ? 'block' : 'none';
            document.getElementById('import-paste-panel').style.display = panel === 'paste' ? 'block' : 'none';
        });
    });
    
    // Import from file
    document.getElementById('import-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        document.getElementById('file-name').textContent = file.name;
        
        try {
            const { jsonString, preview } = await importFromFile(file);
            showImportPreviewModal(jsonString, preview);
        } catch (error) {
            alert('Failed to read file: ' + error.message);
        }
    });
    
    // Import from paste
    document.getElementById('import-from-paste-btn').addEventListener('click', () => {
        const text = document.getElementById('import-paste').value.trim();
        if (!text) {
            alert('Please paste your backup JSON first.');
            return;
        }
        
        try {
            const { jsonString, preview } = importFromText(text);
            showImportPreviewModal(jsonString, preview);
        } catch (error) {
            alert('Invalid JSON: ' + error.message);
        }
    });
    
    // Export CSVs
    document.getElementById('export-projects-csv-btn').addEventListener('click', async () => {
        const state = getState();
        const filename = await exportProjectsCSV(state);
        alert(`Exported: ${filename}`);
    });
    
    document.getElementById('export-logs-csv-btn').addEventListener('click', async () => {
        const state = getState();
        const filename = await exportLogsCSV(state);
        alert(`Exported: ${filename}`);
    });
    
    document.getElementById('export-wins-csv-btn').addEventListener('click', async () => {
        const state = getState();
        const filename = await exportWinsCSV(state);
        alert(`Exported: ${filename}`);
    });
    
    document.getElementById('export-ideas-csv-btn').addEventListener('click', async () => {
        const state = getState();
        const filename = await exportIdeasCSV(state);
        alert(`Exported: ${filename}`);
    });
    
    // Export all reviews ICS
    document.getElementById('export-all-reviews-btn').addEventListener('click', async () => {
        const state = getState();
        const filename = await exportAllActiveReviewsICS(state);
        alert(`Calendar file downloaded: ${filename}`);
    });
    
    // Settings changes
    document.getElementById('review-day').addEventListener('change', (e) => {
        const state = getState();
        const updated = updateSettings(state, {
            defaultReviewDay: parseInt(e.target.value, 10)
        });
        setState(updated);
    });
    
    document.getElementById('review-time').addEventListener('change', (e) => {
        const state = getState();
        const updated = updateSettings(state, {
            defaultReviewTimeUTC: e.target.value
        });
        setState(updated);
    });
    
    document.getElementById('backup-reminder-days').addEventListener('change', (e) => {
        const state = getState();
        const updated = updateSettings(state, {
            backupReminderDays: parseInt(e.target.value, 10)
        });
        setState(updated);
    });
}

function showImportPreviewModal(jsonString, preview) {
    const summary = getImportSummary(preview);
    
    if (!preview.valid) {
        alert(summary.message);
        return;
    }
    
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">${summary.title}</h2>
                
                <div class="notification is-${summary.type}">
                    <pre style="white-space: pre-wrap; font-family: inherit;">${summary.message}</pre>
                </div>
                
                <div class="field">
                    <label class="label">Merge Strategy</label>
                    <div class="control">
                        <label class="radio">
                            <input type="radio" name="merge-strategy" value="newest" checked>
                            Keep newest by date (recommended)
                        </label>
                        <br>
                        <label class="radio">
                            <input type="radio" name="merge-strategy" value="overwrite">
                            Overwrite all with imported data
                        </label>
                    </div>
                </div>
                
                <div class="buttons">
                    <button class="button is-primary" id="confirm-import-btn">Import</button>
                    <button class="button" onclick="document.getElementById('modal-root').innerHTML = ''">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('confirm-import-btn').addEventListener('click', () => {
        const strategy = document.querySelector('input[name="merge-strategy"]:checked').value;
        
        const result = executeImport(jsonString, strategy);
        
        if (result.success) {
            setState(result.data);
            document.getElementById('modal-root').innerHTML = '';
            alert('Import successful!');
            renderSettings();
        } else {
            alert('Import failed: ' + result.error);
        }
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}
