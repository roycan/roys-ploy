// Dashboard page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models
(function() {
    'use strict';
    
    let currentFilter = 'active';
    
    function init() {
        const state = Storage.loadState();
        
        // Check if this is first visit
        const isFirstVisit = state.projects.length === 0;
        
        if (isFirstVisit) {
            renderWelcomeScreen();
        } else {
            renderDashboard(state);
        }
        
        attachHandlers();
    }
    
    function renderWelcomeScreen() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="welcome-screen">
                <div class="icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <h1 class="title">Welcome to Roy's Ploy</h1>
                <p class="subtitle">
                    A strengths-driven companion for sustainable long-term projects.
                    <br><br>
                    This tool helps you stay connected to your purpose, celebrate learning,
                    and make re-entry after life's interruptions effortless.
                </p>
                <button class="button is-primary is-large" id="create-first-project">
                    <span class="icon">
                        <i class="fas fa-plus"></i>
                    </span>
                    <span>Create Your First Project</span>
                </button>
            </div>
        `;
    }
    
    function renderDashboard(state) {
        const app = document.getElementById('app');
        const daysSince = getDaysSinceLastVisit(state);
        const showReentry = daysSince > 1;
        
        app.innerHTML = `
            <div class="view-container">
                ${renderBackupReminder(state)}
                ${showReentry ? renderReentryCard(state, daysSince) : ''}
                
                <div class="section-header">
                    <h1 class="title">Your Projects</h1>
                    ${renderFilters()}
                </div>
                
                <p class="is-size-7 has-text-grey" style="text-align: center; margin-bottom: 1rem;">
                    <a id="view-quarterly-prompts-link" style="cursor: pointer; text-decoration: underline;">View quarterly plan</a> to reflect on your goals.
                </p>
                
                <div id="projects-container">
                    ${renderProjects(state)}
                </div>
            </div>
        `;
    }
    
    function renderBackupReminder(state) {
        if (!Models.shouldShowBackupReminder(state)) return '';
        
        const lastBackup = state.settings.lastBackupAt;
        const message = lastBackup
            ? `It's been ${Utils.getDaysSince(lastBackup)} days since your last backup.`
            : 'You haven\'t backed up your data yet.';
        
        return `
            <div class="notification is-warning mb-2">
                <button class="delete" onclick="this.parentElement.remove()"></button>
                <strong>Backup Reminder</strong>
                <p>${message} <a href="settings.html">Back up now →</a></p>
            </div>
        `;
    }
    
    function renderReentryCard(state, daysSince) {
        const activeProjects = Models.getActiveProjects(state);
        const lastLog = state.logs.length > 0
            ? state.logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
            : null;
        
        const lastProject = lastLog ? state.projects.find(p => p.id === lastLog.projectId) : null;
        
        return `
            <div class="reentry-card">
                <h2 class="subtitle is-4">Welcome back! 👋</h2>
                <p>It's been ${daysSince} day${daysSince !== 1 ? 's' : ''} since you were last here.</p>
                
                <div class="reentry-actions">
                    ${activeProjects.length > 0 ? `
                        <a href="focus.html?id=${activeProjects[0].id}" class="button">
                            <span class="icon"><i class="fas fa-compass"></i></span>
                            <span>Remind me of the Why</span>
                        </a>
                    ` : ''}
                    
                    ${lastLog ? `
                        <a href="log.html" class="button">
                            <span class="icon"><i class="fas fa-book"></i></span>
                            <span>Last Learned: ${Utils.escapeHtml(lastLog.learned.substring(0, 30))}...</span>
                        </a>
                    ` : ''}
                    
                    ${lastProject && lastProject.nextStep ? `
                        <a href="focus.html?id=${lastProject.id}" class="button">
                            <span class="icon"><i class="fas fa-arrow-right"></i></span>
                            <span>Next: ${Utils.escapeHtml(lastProject.nextStep.substring(0, 30))}...</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    function renderFilters() {
        return `
            <div class="filters">
                <button class="filter-btn ${currentFilter === 'active' ? 'active' : ''}" data-filter="active">
                    Active
                </button>
                <button class="filter-btn ${currentFilter === 'paused' ? 'active' : ''}" data-filter="paused">
                    Paused
                </button>
                <button class="filter-btn ${currentFilter === 'done' ? 'active' : ''}" data-filter="done">
                    Done
                </button>
                <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                    All
                </button>
            </div>
        `;
    }
    
    function renderProjects(state) {
        const projects = Models.getProjectsByStatus(state, currentFilter);
        
        if (projects.length === 0) {
            return `
                <div class="has-text-centered text-muted" style="padding: 3rem 1rem;">
                    <p class="subtitle">No ${currentFilter} projects yet.</p>
                    ${currentFilter === 'active' ? '<p>Click the + button below to create your first project!</p>' : ''}
                </div>
            `;
        }
        
        return projects.map(project => renderProjectCard(state, project)).join('');
    }
    
    function renderProjectCard(state, project) {
        const latestLog = Models.getLatestLog(state, project.id);
        const reviewDue = Utils.isReviewDue(project);
        const reviewBadge = getReviewBadge(project, reviewDue);
        
        return `
            <a href="focus.html?id=${project.id}" class="project-card status-${project.status}" data-project-id="${project.id}">
                <div class="project-card-header">
                    <h3 class="project-card-title">${Utils.escapeHtml(project.title)}</h3>
                    <span class="badge is-${project.status}">${project.status}</span>
                </div>
                
                ${project.purpose ? `
                    <p class="project-card-purpose">${Utils.escapeHtml(project.purpose)}</p>
                ` : ''}
                
                ${project.nextStep ? `
                    <p class="text-small mt-2">
                        <strong>Next:</strong> ${Utils.escapeHtml(project.nextStep)}
                    </p>
                ` : ''}
                
                <div class="project-card-meta">
                    ${latestLog ? `
                        <div class="project-card-meta-item">
                            <i class="fas fa-book"></i>
                            <span>Last learned ${Utils.formatDate(latestLog.createdAt)}</span>
                        </div>
                    ` : ''}
                    
                    ${reviewBadge ? `
                        <div class="project-card-meta-item">
                            ${reviewBadge}
                        </div>
                    ` : ''}
                    
                    ${project.beneficiaries && project.beneficiaries.length > 0 ? `
                        <div class="project-card-meta-item">
                            <i class="fas fa-users"></i>
                            <span>${project.beneficiaries.length} beneficiar${project.beneficiaries.length !== 1 ? 'ies' : 'y'}</span>
                        </div>
                    ` : ''}
                </div>
            </a>
        `;
    }
    
    function getReviewBadge(project, isDue) {
        if (project.status !== 'active') return '';
        
        if (!project.lastReviewAt) {
            return '<span class="badge is-due">Never reviewed</span>';
        }
        
        const daysSince = Utils.getDaysSince(project.lastReviewAt);
        
        if (isDue) {
            return '<span class="badge is-due">Review due</span>';
        } else if (daysSince < 3) {
            return '<span class="badge is-upcoming">Reviewed recently</span>';
        }
        
        return '';
    }
    
    function getDaysSinceLastVisit(state) {
        const lastLog = state.logs.length > 0
            ? Math.max(...state.logs.map(l => new Date(l.createdAt).getTime()))
            : 0;
        
        const lastProjectUpdate = state.projects.length > 0
            ? Math.max(...state.projects.map(p => new Date(p.updatedAt).getTime()))
            : 0;
        
        const lastActivity = Math.max(lastLog, lastProjectUpdate);
        
        if (!lastActivity) return 0;
        
        return Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
    }
    
    function attachHandlers() {
        // Quarterly prompts link
        const quarterlyLink = document.getElementById('view-quarterly-prompts-link');
        if (quarterlyLink) {
            quarterlyLink.addEventListener('click', () => {
                PromptsModule.showPromptsListModal();
            });
        }
        
        // FAB click handler
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', showCreateProjectModal);
        }
        
        // Create first project button (on welcome screen)
        const createFirstBtn = document.getElementById('create-first-project');
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', showCreateProjectModal);
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentFilter = e.target.getAttribute('data-filter');
                const state = Storage.loadState();
                renderDashboard(state);
                attachHandlers(); // Re-attach after re-render
            });
        });
    }
    
    function showCreateProjectModal() {
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Create New Project</p>
                        <button class="delete modal-close" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <form id="create-project-form">
                            <div class="field">
                                <label class="label" for="project-title">Project Title *</label>
                                <div class="control">
                                    <input class="input" type="text" id="project-title" placeholder="What are you building?" required maxlength="100">
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label" for="project-purpose">Purpose (Why does this matter?) *</label>
                                <div class="control">
                                    <textarea class="textarea" id="project-purpose" placeholder="Connect this to your values and the bigger picture..." required></textarea>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label" for="project-beneficiaries">Who will benefit?</label>
                                <div class="control">
                                    <input class="input" type="text" id="project-beneficiaries" placeholder="Separate names with commas">
                                </div>
                                <p class="help">Enter names or groups separated by commas</p>
                            </div>
                            
                            <div class="field">
                                <label class="label" for="project-next-step">What's the most exciting next step?</label>
                                <div class="control">
                                    <input class="input" type="text" id="project-next-step" placeholder="The one thing to focus on next...">
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button type="submit" form="create-project-form" class="button is-primary">Create Project</button>
                        <button type="button" class="button modal-cancel">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        // Attach form submit handler
        const form = document.getElementById('create-project-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('project-title').value.trim();
            const purpose = document.getElementById('project-purpose').value.trim();
            const beneficiariesRaw = document.getElementById('project-beneficiaries').value.trim();
            const nextStep = document.getElementById('project-next-step').value.trim();
            
            const beneficiaries = beneficiariesRaw
                ? beneficiariesRaw.split(',').map(b => b.trim()).filter(b => b)
                : [];
            
            const newProject = Models.createProject({
                title,
                purpose,
                beneficiaries,
                nextStep
            });
            
            const state = Storage.loadState();
            state.projects.push(newProject);
            Storage.saveState(state);
            
            // Navigate to the new project
            window.location.href = `focus.html?id=${newProject.id}`;
        });
        
        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    function closeModal() {
        document.getElementById('modal-root').innerHTML = '';
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
