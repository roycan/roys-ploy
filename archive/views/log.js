// Learning Log view for Roy's Ploy
import { getState, setState, eventBus } from '../app.js';
import { getRecentLogs, getActiveProjects, createLog, getProjectById } from '../models.js';
import { formatDate, escapeHtml } from '../utils.js';

let selectedProjectId = null; // null = all projects

export function renderLog() {
    const state = getState();
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="view-container">
            <div class="section-header">
                <h1 class="title">Learning Log 📖</h1>
                <p class="subtitle">Track your journey from ignorance to competence.</p>
                ${renderProjectFilter(state)}
            </div>
            
            ${renderWeeklyReviewCard(state)}
            
            <div id="logs-container">
                ${renderLogs(state)}
            </div>
        </div>
    `;
    
    attachHandlers();
}

function renderProjectFilter(state) {
    const activeProjects = getActiveProjects(state);
    
    return `
        <div class="field">
            <label class="label">Filter by Project</label>
            <div class="control">
                <div class="select">
                    <select id="project-filter">
                        <option value="">All Projects</option>
                        ${activeProjects.map(p => 
                            `<option value="${p.id}" ${selectedProjectId === p.id ? 'selected' : ''}>
                                ${escapeHtml(p.title)}
                            </option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;
}

function renderWeeklyReviewCard(state) {
    const activeProjects = getActiveProjects(state);
    const projectsNeedingReview = activeProjects.filter(p => {
        if (!p.lastReviewAt) return true;
        const daysSince = Math.floor((Date.now() - new Date(p.lastReviewAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= 7;
    });
    
    if (projectsNeedingReview.length === 0) return '';
    
    return `
        <div class="notification is-info mb-2">
            <h3 class="subtitle is-5">
                <i class="fas fa-calendar-check"></i> Weekly Review Time!
            </h3>
            <p class="mb-2">
                ${projectsNeedingReview.length} project${projectsNeedingReview.length !== 1 ? 's' : ''} 
                ${projectsNeedingReview.length !== 1 ? 'are' : 'is'} due for review.
            </p>
            <div class="buttons">
                ${projectsNeedingReview.slice(0, 3).map(p => `
                    <button class="button is-info is-light is-small" onclick="window.router.navigate('/project/${p.id}')">
                        Review: ${escapeHtml(p.title)}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderLogs(state) {
    let logs = selectedProjectId
        ? state.logs.filter(l => l.projectId === selectedProjectId)
        : state.logs;
    
    if (logs.length === 0) {
        return `
            <div class="has-text-centered text-muted" style="padding: 3rem 1rem;">
                <p class="subtitle">No learning logged yet.</p>
                <p>Click the + button below to add your first learning entry!</p>
            </div>
        `;
    }
    
    // Sort by date (newest first)
    const sorted = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Group by month
    const grouped = {};
    sorted.forEach(log => {
        const date = new Date(log.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        grouped[monthKey].push(log);
    });
    
    let html = '';
    for (const [monthKey, monthLogs] of Object.entries(grouped)) {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        
        html += `
            <h3 class="subtitle is-5 mt-2 mb-2">${monthName}</h3>
            ${monthLogs.map(log => renderLogEntry(state, log)).join('')}
        `;
    }
    
    return html;
}

function renderLogEntry(state, log) {
    const project = getProjectById(state, log.projectId);
    
    return `
        <div class="box">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <span class="tag is-info is-light">${escapeHtml(project?.title || 'Unknown Project')}</span>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <p class="text-small text-muted">${formatDate(log.createdAt)}</p>
                    </div>
                </div>
            </div>
            
            <div class="content">
                <p><strong>What I learned:</strong></p>
                <p>${escapeHtml(log.learned)}</p>
                
                ${log.nextExcited ? `
                    <p class="mt-2"><strong>What I'm excited to learn next:</strong></p>
                    <p>${escapeHtml(log.nextExcited)}</p>
                ` : ''}
                
                ${log.impactNote ? `
                    <p class="mt-2"><strong>Impact:</strong></p>
                    <p>${escapeHtml(log.impactNote)}</p>
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
            renderLog();
        });
    }
}

function showAddLearningModal(preselectedProjectId = null) {
    const state = getState();
    const activeProjects = getActiveProjects(state);
    
    if (activeProjects.length === 0) {
        alert('You need to create a project first!');
        return;
    }
    
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">Add Learning</h2>
                
                <form id="add-learning-form">
                    <div class="form-field">
                        <label for="log-project">Project *</label>
                        <select id="log-project" required>
                            <option value="">-- Select a project --</option>
                            ${activeProjects.map(p => 
                                `<option value="${p.id}" ${preselectedProjectId === p.id ? 'selected' : ''}>
                                    ${escapeHtml(p.title)}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-field">
                        <label for="learned">What did you learn? *</label>
                        <textarea id="learned" required placeholder="Describe your discovery, insight, or new skill..."></textarea>
                    </div>
                    
                    <div class="form-field">
                        <label for="next-excited">What are you excited to learn next?</label>
                        <input type="text" id="next-excited" placeholder="The next thing you're curious about...">
                    </div>
                    
                    <div class="form-field">
                        <label for="impact-note">Who or what benefited?</label>
                        <input type="text" id="impact-note" placeholder="Note the impact or progress...">
                    </div>
                    
                    <div class="buttons">
                        <button type="submit" class="button is-primary">Add Learning</button>
                        <button type="button" class="button" onclick="document.getElementById('modal-root').innerHTML = ''">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const form = document.getElementById('add-learning-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectId = document.getElementById('log-project').value;
        const learned = document.getElementById('learned').value.trim();
        const nextExcited = document.getElementById('next-excited').value.trim();
        const impactNote = document.getElementById('impact-note').value.trim();
        
        if (!projectId) return;
        
        const newLog = createLog({
            projectId,
            learned,
            nextExcited,
            impactNote
        });
        
        setState({
            ...state,
            logs: [...state.logs, newLog]
        });
        
        document.getElementById('modal-root').innerHTML = '';
        renderLog();
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}

// Listen for FAB add learning event
eventBus.on('show-add-learning', () => showAddLearningModal(selectedProjectId));
