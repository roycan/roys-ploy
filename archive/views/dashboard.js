// Dashboard view for Roy's Ploy
import { getState, setState, eventBus } from '../app.js';
import { getActiveProjects, getPausedProjects, getDoneProjects, getProjectsByStatus, getLatestLog, createProject, shouldShowBackupReminder } from '../models.js';
import { formatDate, getDaysSince, isReviewDue, escapeHtml } from '../utils.js';

let currentFilter = 'active';

export function renderDashboard() {
    const state = getState();
    const app = document.getElementById('app');
    
    // Check if this is first visit
    const isFirstVisit = state.projects.length === 0;
    
    if (isFirstVisit) {
        app.innerHTML = renderWelcomeScreen();
        attachWelcomeHandlers();
        return;
    }
    
    const daysSinceLastVisit = getDaysSinceLastVisit(state);
    const showReentry = daysSinceLastVisit > 1;
    
    app.innerHTML = `
        <div class="view-container">
            ${renderBackupReminder(state)}
            ${showReentry ? renderReentryCard(state, daysSinceLastVisit) : ''}
            
            <div class="section-header">
                <h1 class="title">Your Projects</h1>
                ${renderFilters()}
            </div>
            
            <div id="projects-container">
                ${renderProjects(state)}
            </div>
        </div>
    `;
    
    attachHandlers();
}

function renderWelcomeScreen() {
    return `
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

function renderBackupReminder(state) {
    if (!shouldShowBackupReminder(state)) return '';
    
    const lastBackup = state.settings.lastBackupAt;
    const message = lastBackup
        ? `It's been ${getDaysSince(lastBackup)} days since your last backup.`
        : 'You haven\'t backed up your data yet.';
    
    return `
        <div class="notification is-warning mb-2">
            <button class="delete" onclick="this.parentElement.remove()"></button>
            <strong>Backup Reminder</strong>
            <p>${message} <a href="#/settings">Back up now →</a></p>
        </div>
    `;
}

function renderReentryCard(state, daysSince) {
    const activeProjects = getActiveProjects(state);
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
                    <button class="button" onclick="window.router.navigate('/project/${activeProjects[0].id}')">
                        <span class="icon"><i class="fas fa-compass"></i></span>
                        <span>Remind me of the Why</span>
                    </button>
                ` : ''}
                
                ${lastLog ? `
                    <button class="button" onclick="window.router.navigate('/log')">
                        <span class="icon"><i class="fas fa-book"></i></span>
                        <span>Last Learned: ${escapeHtml(lastLog.learned.substring(0, 30))}...</span>
                    </button>
                ` : ''}
                
                ${lastProject && lastProject.nextStep ? `
                    <button class="button" onclick="window.router.navigate('/project/${lastProject.id}')">
                        <span class="icon"><i class="fas fa-arrow-right"></i></span>
                        <span>Next: ${escapeHtml(lastProject.nextStep.substring(0, 30))}...</span>
                    </button>
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
    const projects = getProjectsByStatus(state, currentFilter);
    
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
    const latestLog = getLatestLog(state, project.id);
    const reviewDue = isReviewDue(project);
    const reviewBadge = getReviewBadge(project, reviewDue);
    
    return `
        <div class="project-card status-${project.status}" data-project-id="${project.id}">
            <div class="project-card-header">
                <h3 class="project-card-title">${escapeHtml(project.title)}</h3>
                <span class="badge is-${project.status}">${project.status}</span>
            </div>
            
            ${project.purpose ? `
                <p class="project-card-purpose">${escapeHtml(project.purpose)}</p>
            ` : ''}
            
            ${project.nextStep ? `
                <p class="text-small mt-2">
                    <strong>Next:</strong> ${escapeHtml(project.nextStep)}
                </p>
            ` : ''}
            
            <div class="project-card-meta">
                ${latestLog ? `
                    <div class="project-card-meta-item">
                        <i class="fas fa-book"></i>
                        <span>Last learned ${formatDate(latestLog.createdAt)}</span>
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
        </div>
    `;
}

function getReviewBadge(project, isDue) {
    if (project.status !== 'active') return '';
    
    if (!project.lastReviewAt) {
        return '<span class="badge is-due">Never reviewed</span>';
    }
    
    const daysSince = getDaysSince(project.lastReviewAt);
    
    if (isDue) {
        return '<span class="badge is-due">Review due</span>';
    } else if (daysSince < 3) {
        return '<span class="badge is-upcoming">Reviewed recently</span>';
    }
    
    return '';
}

function getDaysSinceLastVisit(state) {
    // Simple heuristic: check last log or last project update
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

function attachWelcomeHandlers() {
    const btn = document.getElementById('create-first-project');
    if (btn) {
        btn.addEventListener('click', () => showCreateProjectModal());
    }
}

function attachHandlers() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.getAttribute('data-filter');
            renderDashboard();
        });
    });
    
    // Project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-project-id');
            window.router.navigate(`/project/${projectId}`);
        });
    });
}

function showCreateProjectModal() {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">Create New Project</h2>
                
                <form id="create-project-form">
                    <div class="form-field">
                        <label for="project-title">Project Title *</label>
                        <input type="text" id="project-title" placeholder="What are you building?" required maxlength="100">
                    </div>
                    
                    <div class="form-field">
                        <label for="project-purpose">Purpose (Why does this matter?) *</label>
                        <textarea id="project-purpose" placeholder="Connect this to your values and the bigger picture..." required></textarea>
                    </div>
                    
                    <div class="form-field">
                        <label for="project-beneficiaries">Who will benefit?</label>
                        <input type="text" id="project-beneficiaries" placeholder="Separate names with commas">
                        <p class="help">Enter names or groups separated by commas</p>
                    </div>
                    
                    <div class="form-field">
                        <label for="project-next-step">What's the most exciting next step?</label>
                        <input type="text" id="project-next-step" placeholder="The one thing to focus on next...">
                    </div>
                    
                    <div class="buttons">
                        <button type="submit" class="button is-primary">Create Project</button>
                        <button type="button" class="button" onclick="document.getElementById('modal-root').innerHTML = ''">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Attach handlers
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
        
        const newProject = createProject({
            title,
            purpose,
            beneficiaries,
            nextStep
        });
        
        const state = getState();
        setState({
            ...state,
            projects: [...state.projects, newProject]
        });
        
        document.getElementById('modal-root').innerHTML = '';
        window.router.navigate(`/project/${newProject.id}`);
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
    
    document.querySelector('.modal-background').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}

// Listen for FAB create project event
eventBus.on('show-create-project', showCreateProjectModal);
