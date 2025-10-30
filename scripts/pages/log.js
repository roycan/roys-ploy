// Log page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models
(function() {
    'use strict';
    
    let selectedProjectId = null; // null = all projects
    
    function init() {
        renderLogPage();
        
        // FAB action - add learning entry
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', () => {
                showAddLearningModal();
            });
        }
    }
    
    function renderLogPage() {
        const state = Storage.loadState();
        const activeProjects = Models.getActiveProjects(state);
        
        // Filter logs by selected project
        let logs = selectedProjectId
            ? state.logs.filter(l => l.projectId === selectedProjectId)
            : state.logs;
        
        // Sort by date (newest first)
        const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Group by month
        const grouped = {};
        sortedLogs.forEach(log => {
            const date = new Date(log.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(log);
        });
        
        // Find projects needing review
        const reviewCadenceDays = state.settings?.reviewCadenceDays || 7;
        const projectsNeedingReview = activeProjects.filter(p => {
            const daysSince = Utils.getDaysSince(p.lastReviewedAt || p.createdAt);
            return daysSince >= reviewCadenceDays;
        });
        
        document.getElementById('app').innerHTML = `
            <div class="container" style="padding: 1rem 1rem 5rem 1rem;">
                <div style="margin-bottom: 1.5rem;">
                    <h1 class="title is-4">Learning Log 📖</h1>
                    <p class="subtitle is-6">Track your journey from ignorance to competence.</p>
                    
                    <!-- Project Filter -->
                    <div class="field">
                        <label class="label is-small">Filter by Project</label>
                        <div class="control">
                            <div class="select is-small is-fullwidth">
                                <select id="project-filter">
                                    <option value="">All Projects</option>
                                    ${activeProjects.map(p => 
                                        `<option value="${p.id}" ${selectedProjectId === p.id ? 'selected' : ''}>
                                            ${Utils.escapeHtml(p.title)}
                                        </option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Weekly Review Card -->
                ${projectsNeedingReview.length > 0 ? `
                    <div class="notification is-info is-light" style="margin-bottom: 1.5rem;">
                        <h3 class="subtitle is-6">
                            <span class="icon"><i class="fas fa-calendar-check"></i></span>
                            Weekly Review Time!
                        </h3>
                        <p class="is-size-7" style="margin-bottom: 0.75rem;">
                            ${projectsNeedingReview.length} project${projectsNeedingReview.length !== 1 ? 's' : ''} 
                            ${projectsNeedingReview.length !== 1 ? 'are' : 'is'} due for review.
                        </p>
                        <div class="buttons">
                            ${projectsNeedingReview.slice(0, 3).map(p => `
                                <a href="focus.html?id=${p.id}" class="button is-info is-small">
                                    Review: ${Utils.escapeHtml(p.title)}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Logs Container -->
                <div id="logs-container">
                    ${sortedLogs.length === 0 ? renderEmptyState() : renderGroupedLogs(state, grouped)}
                </div>
            </div>
        `;
        
        attachHandlers();
    }
    
    function renderEmptyState() {
        return `
            <div class="has-text-centered" style="padding: 3rem 1rem;">
                <p class="subtitle has-text-grey">No learning logged yet.</p>
                <p class="has-text-grey">Click the + button below to add your first learning entry!</p>
            </div>
        `;
    }
    
    function renderGroupedLogs(state, grouped) {
        let html = '';
        
        for (const [monthKey, monthLogs] of Object.entries(grouped)) {
            const [year, month] = monthKey.split('-');
            const monthName = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
            
            html += `
                <h3 class="subtitle is-5" style="margin-top: 1rem; margin-bottom: 0.75rem;">${monthName}</h3>
                ${monthLogs.map(log => renderLogEntry(state, log)).join('')}
            `;
        }
        
        return html;
    }
    
    function renderLogEntry(state, log) {
        const project = Models.getProjectById(state, log.projectId);
        
        return `
            <div class="box" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <span class="tag is-info is-light">${Utils.escapeHtml(project?.title || 'Unknown Project')}</span>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="is-size-7 has-text-grey">${Utils.formatDate(log.createdAt)}</span>
                        <button class="button is-small is-danger is-light" data-delete-log="${log.id}">
                            <span class="icon"><i class="fas fa-trash"></i></span>
                        </button>
                    </div>
                </div>
                
                <div>
                    <p style="margin-bottom: 0.5rem;"><strong>What I learned:</strong></p>
                    <p style="margin-bottom: 0.75rem;">${Utils.escapeHtml(log.learned)}</p>
                    
                    ${log.nextExcited ? `
                        <p style="margin-bottom: 0.5rem;" class="has-text-info"><strong>What I'm excited to learn next:</strong></p>
                        <p style="margin-bottom: 0.75rem;" class="has-text-info">${Utils.escapeHtml(log.nextExcited)}</p>
                    ` : ''}
                    
                    ${log.impactNote ? `
                        <p style="margin-bottom: 0.5rem;" class="has-text-success"><strong>Impact:</strong></p>
                        <p style="margin-bottom: 0;" class="has-text-success">${Utils.escapeHtml(log.impactNote)}</p>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    function attachHandlers() {
        // Project filter
        const filter = document.getElementById('project-filter');
        if (filter) {
            filter.addEventListener('change', (e) => {
                selectedProjectId = e.target.value || null;
                renderLogPage();
            });
        }
        
        // Delete log buttons
        document.querySelectorAll('[data-delete-log]').forEach(btn => {
            btn.addEventListener('click', () => {
                const logId = btn.getAttribute('data-delete-log');
                if (confirm('Delete this learning entry? This cannot be undone.')) {
                    const state = Storage.loadState();
                    const updatedState = Models.deleteLog(state, logId);
                    Storage.saveState(updatedState);
                    Utils.showToast('Learning entry deleted');
                    renderLogPage();
                }
            });
        });
    }
    
    function showAddLearningModal() {
        const state = Storage.loadState();
        const activeProjects = Models.getActiveProjects(state);
        
        if (activeProjects.length === 0) {
            alert('You need to create a project first!');
            return;
        }
        
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Add Learning</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <form id="add-learning-form">
                            <div class="field">
                                <label class="label">Project <span class="has-text-danger">*</span></label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select id="log-project" required>
                                            <option value="">-- Select a project --</option>
                                            ${activeProjects.map(p => 
                                                `<option value="${p.id}" ${selectedProjectId === p.id ? 'selected' : ''}>
                                                    ${Utils.escapeHtml(p.title)}
                                                </option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label">What did you learn? <span class="has-text-danger">*</span></label>
                                <div class="control">
                                    <textarea 
                                        class="textarea" 
                                        id="learned" 
                                        required 
                                        placeholder="Describe your discovery, insight, or new skill..."
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label">What are you excited to learn next?</label>
                                <div class="control">
                                    <input 
                                        class="input" 
                                        type="text" 
                                        id="next-excited" 
                                        placeholder="The next thing you're curious about..."
                                    >
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label">Who or what benefited?</label>
                                <div class="control">
                                    <input 
                                        class="input" 
                                        type="text" 
                                        id="impact-note" 
                                        placeholder="Note the impact or progress..."
                                    >
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="submit-learning-btn">Add Learning</button>
                        <button class="button" id="cancel-learning-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const form = document.getElementById('add-learning-form');
        const submitBtn = document.getElementById('submit-learning-btn');
        const cancelBtn = document.getElementById('cancel-learning-btn');
        const closeBtn = modal.querySelector('.delete');
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        const handleSubmit = (e) => {
            if (e) e.preventDefault();
            
            const projectId = document.getElementById('log-project').value;
            const learned = document.getElementById('learned').value.trim();
            const nextExcited = document.getElementById('next-excited').value.trim();
            const impactNote = document.getElementById('impact-note').value.trim();
            
            if (!projectId) {
                alert('Please select a project.');
                return;
            }
            
            if (!learned) {
                alert('Please describe what you learned.');
                return;
            }
            
            const newLog = Models.createLog({
                projectId,
                learned,
                nextExcited: nextExcited || undefined,
                impactNote: impactNote || undefined
            });
            
            Storage.saveState({
                ...state,
                logs: [...state.logs, newLog]
            });
            
            closeModal();
            Utils.showToast('Learning added!');
            renderLogPage();
        };
        
        form.addEventListener('submit', handleSubmit);
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
