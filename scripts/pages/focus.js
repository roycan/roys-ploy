// Focus page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models, ExportModule
(function() {
    'use strict';
    
    let currentProjectId = null;
    let currentTab = 'logs';
    
    function init() {
        // Get project ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        currentProjectId = urlParams.get('id');
        
        if (!currentProjectId) {
            window.location.href = 'index.html';
            return;
        }
        
        renderFocusPage();
        
        // FAB action - celebrate win
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', () => {
                const state = Storage.loadState();
                const project = Models.getProjectById(state, currentProjectId);
                if (project) {
                    showCelebrateWinModal(project);
                }
            });
        }
    }
    
    function renderStrengthsAndPartnerSection(project, state) {
        const practiceStrengths = Array.isArray(project.practiceStrengths) ? project.practiceStrengths : [];
        const partnerNeeds = Array.isArray(project.partnerNeeds) ? project.partnerNeeds : [];
        const hasData = practiceStrengths.length > 0 || partnerNeeds.length > 0;
        
        if (!hasData) {
            return `
                <div class="box" style="margin-bottom: 1rem; padding: 0.75rem;">
                    <p class="is-size-7 has-text-grey">
                        Want to practice specific strengths or collaborate? 
                        <a id="edit-strengths-partner-link" style="cursor: pointer; text-decoration: underline;">Add them here</a>.
                    </p>
                </div>
            `;
        }
        
        return `
            <div class="box" style="margin-bottom: 1rem; padding: 0.75rem;">
                ${practiceStrengths.length > 0 ? `
                    <div style="margin-bottom: 0.5rem;">
                        <label class="label is-size-7" style="margin-bottom: 0.25rem;">Practice Strengths:</label>
                        <div class="tags are-small" style="margin-bottom: 0;">
                            ${practiceStrengths.map(s => `<span class="tag is-info is-light">${Utils.escapeHtml(s)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                ${partnerNeeds.length > 0 ? `
                    <div>
                        <label class="label is-size-7" style="margin-bottom: 0.25rem;">Partner Needs:</label>
                        <div class="tags are-small" style="margin-bottom: 0;">
                            ${partnerNeeds.map(s => `<span class="tag is-warning is-light">${Utils.escapeHtml(s)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                <button class="button is-text is-small" id="edit-strengths-partner-btn" style="margin-top: 0.25rem;">
                    <span class="icon is-small"><i class="fas fa-edit"></i></span>
                    <span>Edit</span>
                </button>
            </div>
        `;
    }
    
    function renderFocusPage() {
        const state = Storage.loadState();
        const project = Models.getProjectById(state, currentProjectId);
        
        if (!project) {
            document.getElementById('app').innerHTML = `
                <div class="container" style="padding: 2rem;">
                    <div class="notification is-warning">
                        <p>Project not found. <a href="index.html">Return to Dashboard</a></p>
                    </div>
                </div>
            `;
            return;
        }
        
        const logs = Models.getProjectLogs(state, currentProjectId);
        const wins = Models.getProjectWins(state, currentProjectId);
        const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
        
        // Check if review is due
        const daysSinceReview = Utils.getDaysSince(project.lastReviewedAt || project.createdAt);
        const isReviewDue = daysSinceReview >= (state.settings?.reviewCadenceDays || 7);
        
        document.getElementById('app').innerHTML = `
            <div class="container" style="padding: 1rem 1rem 5rem 1rem;">
                <!-- Breadcrumb -->
                <nav class="breadcrumb" style="margin-bottom: 1rem;">
                    <ul>
                        <li><a href="index.html">Dashboard</a></li>
                        <li class="is-active"><a>${Utils.escapeHtml(project.title)}</a></li>
                    </ul>
                </nav>
                
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h1 class="title is-4" style="margin-bottom: 0;">${Utils.escapeHtml(project.title)}</h1>
                    <span class="tag is-${getStatusColor(project.status)}">${project.status}</span>
                </div>
                
                <!-- Why Section (Gradient Box) -->
                <div class="box" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-bottom: 1rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>Why:</strong> ${Utils.escapeHtml(project.why)}</p>
                    <p style="margin-bottom: 0;"><strong>Who benefits:</strong> ${Utils.escapeHtml(project.beneficiaries)}</p>
                </div>
                
                <!-- Progress Section -->
                <div class="box" style="margin-bottom: 1rem;">
                    ${latestLog ? `
                        <p class="is-size-7 has-text-grey" style="margin-bottom: 0.5rem;">
                            <strong>Last learned:</strong> ${Utils.escapeHtml(latestLog.learned)} 
                            <span class="has-text-grey-light">(${Utils.formatDate(latestLog.createdAt)})</span>
                        </p>
                    ` : '<p class="has-text-grey is-size-7">No learning logged yet.</p>'}
                    
                    <div style="margin-top: 0.5rem;">
                        <label class="label is-size-7">Next Step:</label>
                        <input 
                            type="text" 
                            class="input is-small" 
                            id="next-step-input" 
                            value="${Utils.escapeHtml(project.nextStep || '')}"
                            placeholder="What's the next smallest step?"
                        >
                    </div>
                    
                    ${isReviewDue ? `
                        <div class="notification is-warning is-light" style="margin-top: 1rem; padding: 0.75rem;">
                            <p class="is-size-7">
                                <strong>Weekly review due!</strong> It's been ${daysSinceReview} days since your last check-in.
                                <button class="button is-small is-warning" id="mark-review-complete-btn" style="margin-left: 0.5rem;">
                                    Mark Complete
                                </button>
                            </p>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Strengths & Partner Needs -->
                ${renderStrengthsAndPartnerSection(project, state)}
                
                <!-- Action Buttons -->
                <div class="buttons" style="margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <button class="button is-primary is-small" id="add-learning-btn">
                        <span class="icon"><i class="fas fa-lightbulb"></i></span>
                        <span>Add Learning</span>
                    </button>
                    <button class="button is-success is-small" id="celebrate-win-btn">
                        <span class="icon"><i class="fas fa-trophy"></i></span>
                        <span>Celebrate Win</span>
                    </button>
                    <button class="button is-info is-small" id="export-calendar-btn">
                        <span class="icon"><i class="fas fa-calendar"></i></span>
                        <span>Export to Calendar</span>
                    </button>
                    <div class="dropdown" id="status-dropdown">
                        <div class="dropdown-trigger">
                            <button class="button is-small" aria-haspopup="true" aria-controls="status-dropdown-menu">
                                <span>Change Status</span>
                                <span class="icon is-small"><i class="fas fa-angle-down"></i></span>
                            </button>
                        </div>
                        <div class="dropdown-menu" id="status-dropdown-menu" role="menu">
                            <div class="dropdown-content">
                                ${project.status !== 'active' ? '<a class="dropdown-item" data-status="active">Active</a>' : ''}
                                ${project.status !== 'paused' ? '<a class="dropdown-item" data-status="paused">Paused</a>' : ''}
                                ${project.status !== 'done' ? '<a class="dropdown-item" data-status="done">Done</a>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quarterly Prompts Access -->
                <p class="is-size-7 has-text-grey" style="text-align: center; margin-bottom: 1rem;">
                    <a id="view-quarterly-prompts-link" style="cursor: pointer; text-decoration: underline;">View quarterly plan</a> for context and motivation.
                </p>
                
                <!-- Tabs -->
                <div class="tabs">
                    <ul>
                        <li class="${currentTab === 'logs' ? 'is-active' : ''}" data-tab="logs">
                            <a>Learning Log (${logs.length})</a>
                        </li>
                        <li class="${currentTab === 'wins' ? 'is-active' : ''}" data-tab="wins">
                            <a>Wins (${wins.length})</a>
                        </li>
                    </ul>
                </div>
                
                <!-- Tab Content -->
                <div id="tab-content">
                    ${currentTab === 'logs' ? renderLogsTab(logs) : renderWinsTab(wins)}
                </div>
            </div>
        `;
        
        attachHandlers(project);
    }
    
    function renderLogsTab(logs) {
        if (logs.length === 0) {
            return '<p class="has-text-grey has-text-centered" style="padding: 2rem;">No learning logged yet. Click "Add Learning" to get started!</p>';
        }
        
        // Sort logs descending (newest first)
        const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return sortedLogs.map(log => `
            <div class="box" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <p class="is-size-7 has-text-grey" style="margin-bottom: 0.5rem;">${Utils.formatDate(log.createdAt)}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Learned:</strong> ${Utils.escapeHtml(log.learned)}</p>
                        ${log.nextExcited ? `<p style="margin-bottom: 0.5rem;" class="has-text-info"><strong>Next excited:</strong> ${Utils.escapeHtml(log.nextExcited)}</p>` : ''}
                        ${log.impactNote ? `<p style="margin-bottom: 0;" class="has-text-success"><strong>Impact:</strong> ${Utils.escapeHtml(log.impactNote)}</p>` : ''}
                    </div>
                    <button class="button is-small is-danger is-light" data-delete-log="${log.id}">
                        <span class="icon"><i class="fas fa-trash"></i></span>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function renderWinsTab(wins) {
        if (wins.length === 0) {
            return '<p class="has-text-grey has-text-centered" style="padding: 2rem;">No wins yet. Click "Celebrate Win" to record your first one!</p>';
        }
        
        // Sort wins descending (newest first)
        const sortedWins = [...wins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return sortedWins.map(win => `
            <div class="box" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                            <span class="tag is-${getWinColor(win.kind)}">${win.kind}</span>
                            <span class="is-size-7 has-text-grey">${Utils.formatDate(win.createdAt)}</span>
                        </div>
                        <p>${Utils.escapeHtml(win.note)}</p>
                    </div>
                    <button class="button is-small is-danger is-light" data-delete-win="${win.id}">
                        <span class="icon"><i class="fas fa-trash"></i></span>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function attachHandlers(project) {
        // Quarterly prompts link
        const quarterlyLink = document.getElementById('view-quarterly-prompts-link');
        if (quarterlyLink) {
            quarterlyLink.addEventListener('click', () => {
                PromptsModule.showPromptsListModal();
            });
        }
        
        // Edit strengths & partner needs
        const editLink = document.getElementById('edit-strengths-partner-link');
        const editBtn = document.getElementById('edit-strengths-partner-btn');
        if (editLink) {
            editLink.addEventListener('click', () => {
                showEditStrengthsPartnerModal(project);
            });
        }
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                showEditStrengthsPartnerModal(project);
            });
        }
        
        // Next step auto-save on blur
        const nextStepInput = document.getElementById('next-step-input');
        if (nextStepInput) {
            nextStepInput.addEventListener('blur', () => {
                const newNextStep = nextStepInput.value.trim();
                if (newNextStep !== project.nextStep) {
                    const state = Storage.loadState();
                    const updatedProject = Models.updateProject(state, project.id, { nextStep: newNextStep });
                    Storage.saveState({
                        ...state,
                        projects: state.projects.map(p => p.id === project.id ? updatedProject : p)
                    });
                    Utils.showToast('Next step updated!');
                }
            });
        }
        
        // Mark review complete
        const reviewBtn = document.getElementById('mark-review-complete-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                const state = Storage.loadState();
                const updatedProject = Models.markReviewComplete(project);
                Storage.saveState({
                    ...state,
                    projects: state.projects.map(p => p.id === project.id ? updatedProject : p)
                });
                Utils.showToast('Review marked complete!');
                renderFocusPage();
            });
        }
        
        // Add learning
        document.getElementById('add-learning-btn').addEventListener('click', () => {
            showAddLearningModal(project);
        });
        
        // Celebrate win
        document.getElementById('celebrate-win-btn').addEventListener('click', () => {
            showCelebrateWinModal(project);
        });
        
        // Export calendar
        document.getElementById('export-calendar-btn').addEventListener('click', () => {
            ExportModule.exportProjectICS(project);
            Utils.showToast('Calendar file downloaded!');
        });
        
        // Status dropdown toggle
        const dropdown = document.getElementById('status-dropdown');
        const dropdownTrigger = dropdown.querySelector('.dropdown-trigger button');
        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('is-active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('is-active');
        });
        
        // Status dropdown items
        document.querySelectorAll('#status-dropdown .dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const newStatus = e.target.getAttribute('data-status');
                dropdown.classList.remove('is-active');
                showStatusChangeModal(project, newStatus);
            });
        });
        
        // Tab switching
        document.querySelectorAll('.tabs li').forEach(tab => {
            tab.addEventListener('click', () => {
                currentTab = tab.getAttribute('data-tab');
                renderFocusPage();
            });
        });
        
        // Delete log buttons
        document.querySelectorAll('[data-delete-log]').forEach(btn => {
            btn.addEventListener('click', () => {
                const logId = btn.getAttribute('data-delete-log');
                if (confirm('Delete this learning entry? This cannot be undone.')) {
                    const state = Storage.loadState();
                    const updatedState = Models.deleteLog(state, logId);
                    Storage.saveState(updatedState);
                    Utils.showToast('Learning entry deleted');
                    renderFocusPage();
                }
            });
        });
        
        // Delete win buttons
        document.querySelectorAll('[data-delete-win]').forEach(btn => {
            btn.addEventListener('click', () => {
                const winId = btn.getAttribute('data-delete-win');
                if (confirm('Delete this win? This cannot be undone.')) {
                    const state = Storage.loadState();
                    const updatedState = Models.deleteWin(state, winId);
                    Storage.saveState(updatedState);
                    Utils.showToast('Win deleted');
                    renderFocusPage();
                }
            });
        });
    }
    
    function showEditStrengthsPartnerModal(project) {
        const state = Storage.loadState();
        const globalStrengths = state.settings?.strengths || [];
        const globalPartner = state.settings?.supportNeeds || [];
        const currentPractice = Array.isArray(project.practiceStrengths) ? project.practiceStrengths : [];
        const currentPartner = Array.isArray(project.partnerNeeds) ? project.partnerNeeds : [];
        
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Strengths & Partner Needs</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="notification is-info is-light">
                            <p class="is-size-7">Select up to 3 strengths you want to practice and up to 3 needs for a partner.</p>
                            ${globalStrengths.length === 0 && globalPartner.length === 0 ? `
                                <p class="is-size-7" style="margin-top: 0.5rem;">
                                    <a href="settings.html">Go to Settings</a> to define your strengths and support needs first.
                                </p>
                            ` : ''}
                        </div>
                        
                        ${globalStrengths.length > 0 ? `
                            <div class="field">
                                <label class="label is-small">Practice Strengths (select up to 3)</label>
                                <div id="practice-strengths-list">
                                    ${globalStrengths.map(s => `
                                        <label class="checkbox is-block">
                                            <input type="checkbox" name="practice-strength" value="${Utils.escapeHtml(s)}" ${currentPractice.includes(s) ? 'checked' : ''}>
                                            ${Utils.escapeHtml(s)}
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${globalPartner.length > 0 ? `
                            <div class="field">
                                <label class="label is-small">Partner Needs (select up to 3)</label>
                                <div id="partner-needs-list">
                                    ${globalPartner.map(s => `
                                        <label class="checkbox is-block">
                                            <input type="checkbox" name="partner-need" value="${Utils.escapeHtml(s)}" ${currentPartner.includes(s) ? 'checked' : ''}>
                                            ${Utils.escapeHtml(s)}
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="save-strengths-partner-btn">Save</button>
                        <button class="button" id="cancel-strengths-partner-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        document.getElementById('save-strengths-partner-btn')?.addEventListener('click', () => {
            const practiceChecked = Array.from(document.querySelectorAll('input[name="practice-strength"]:checked')).map(cb => cb.value);
            const partnerChecked = Array.from(document.querySelectorAll('input[name="partner-need"]:checked')).map(cb => cb.value);
            
            if (practiceChecked.length > 3) {
                alert('Please select up to 3 practice strengths.');
                return;
            }
            if (partnerChecked.length > 3) {
                alert('Please select up to 3 partner needs.');
                return;
            }
            
            const updatedProject = Models.updateProject(project, { practiceStrengths: practiceChecked, partnerNeeds: partnerChecked });
            const state = Storage.loadState();
            Storage.saveState({
                ...state,
                projects: state.projects.map(p => p.id === project.id ? updatedProject : p)
            });
            Utils.showToast('Strengths and partner needs updated!');
            closeModal();
            renderFocusPage();
        });
        
        document.getElementById('cancel-strengths-partner-btn')?.addEventListener('click', closeModal);
        modal.querySelector('.delete')?.addEventListener('click', closeModal);
        modal.querySelector('.modal-background')?.addEventListener('click', closeModal);
    }
    
    function showAddLearningModal(project) {
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
                        <div class="notification is-info is-light">
                            <p class="is-size-7"><strong>Project:</strong> ${Utils.escapeHtml(project.title)} (locked)</p>
                        </div>
                        
                        <form id="add-learning-form">
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
            
            const learned = document.getElementById('learned').value.trim();
            const nextExcited = document.getElementById('next-excited').value.trim();
            const impactNote = document.getElementById('impact-note').value.trim();
            
            if (!learned) {
                alert('Please describe what you learned.');
                return;
            }
            
            const state = Storage.loadState();
            const newLog = Models.createLog({
                projectId: project.id,
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
            renderFocusPage();
        };
        
        form.addEventListener('submit', handleSubmit);
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    function showCelebrateWinModal(project) {
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Celebrate a Win 🎉</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="notification is-info is-light">
                            <p class="is-size-7"><strong>Project:</strong> ${Utils.escapeHtml(project.title)} (locked)</p>
                        </div>
                        
                        <form id="celebrate-win-form">
                            <div class="field">
                                <label class="label">Type of Win</label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select id="win-kind">
                                            <option value="small">Small Win</option>
                                            <option value="milestone">Milestone</option>
                                            <option value="gratitude">Gratitude</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label">What happened? <span class="has-text-danger">*</span></label>
                                <div class="control">
                                    <textarea 
                                        class="textarea" 
                                        id="win-note" 
                                        required 
                                        placeholder="Describe your win..."
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" id="submit-win-btn">Celebrate!</button>
                        <button class="button" id="cancel-win-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const form = document.getElementById('celebrate-win-form');
        const submitBtn = document.getElementById('submit-win-btn');
        const cancelBtn = document.getElementById('cancel-win-btn');
        const closeBtn = modal.querySelector('.delete');
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        const handleSubmit = (e) => {
            if (e) e.preventDefault();
            
            const kind = document.getElementById('win-kind').value;
            const note = document.getElementById('win-note').value.trim();
            
            if (!note) {
                alert('Please describe your win.');
                return;
            }
            
            const state = Storage.loadState();
            const newWin = Models.createWin({
                projectId: project.id,
                kind,
                note
            });
            
            Storage.saveState({
                ...state,
                wins: [...state.wins, newWin]
            });
            
            closeModal();
            Utils.showToast('Win celebrated! 🎉');
            renderFocusPage();
        };
        
        form.addEventListener('submit', handleSubmit);
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    function showStatusChangeModal(project, newStatus) {
        const statusVerbs = {
            'active': 'reactivating',
            'paused': 'pausing',
            'done': 'completing'
        };
        
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Change Status to "${newStatus}"</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="notification is-info is-light">
                            <p class="is-size-7"><strong>Project:</strong> ${Utils.escapeHtml(project.title)}</p>
                        </div>
                        
                        <form id="status-change-form">
                            <div class="field">
                                <label class="label">Reflection Note (Optional)</label>
                                <div class="control">
                                    <textarea 
                                        class="textarea" 
                                        id="reflection-note" 
                                        placeholder="Taking a moment to reflect helps build awareness. Why are you ${statusVerbs[newStatus]} this project?"
                                        rows="3"
                                    ></textarea>
                                </div>
                                <p class="help">Not required, but encouraged for your future self!</p>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="submit-status-btn">Confirm</button>
                        <button class="button" id="cancel-status-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const form = document.getElementById('status-change-form');
        const submitBtn = document.getElementById('submit-status-btn');
        const cancelBtn = document.getElementById('cancel-status-btn');
        const closeBtn = modal.querySelector('.delete');
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        const handleSubmit = (e) => {
            if (e) e.preventDefault();
            
            const reflectionNote = document.getElementById('reflection-note').value.trim() || undefined;
            
            const state = Storage.loadState();
            const updatedProject = Models.changeProjectStatus(project, newStatus, reflectionNote);
            
            Storage.saveState({
                ...state,
                projects: state.projects.map(p => p.id === project.id ? updatedProject : p)
            });
            
            closeModal();
            Utils.showToast(`Status changed to ${newStatus}!`);
            renderFocusPage();
        };
        
        form.addEventListener('submit', handleSubmit);
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    function getStatusColor(status) {
        switch (status) {
            case 'active': return 'success';
            case 'paused': return 'warning';
            case 'done': return 'info';
            default: return 'light';
        }
    }
    
    function getWinColor(kind) {
        switch (kind) {
            case 'small': return 'info';
            case 'milestone': return 'success';
            case 'gratitude': return 'warning';
            default: return 'light';
        }
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
