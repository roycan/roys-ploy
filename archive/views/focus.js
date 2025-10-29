// Project Focus view for Roy's Ploy
import { getState, setState, eventBus } from '../app.js';
import { getProjectById, getLatestLog, getProjectLogs, getProjectWins, updateProject, changeProjectStatus, markReviewComplete, createLog, createWin } from '../models.js';
import { formatDate, escapeHtml, isReviewDue } from '../utils.js';
import { exportProjectICS, getGoogleCalendarURL } from '../export.js';

export function renderFocus(params) {
    const state = getState();
    const project = getProjectById(state, params.id);
    
    if (!project) {
        document.getElementById('app').innerHTML = `
            <div class="notification is-warning">
                <p>Project not found.</p>
                <a href="#/dashboard" class="button is-light mt-2">Back to Dashboard</a>
            </div>
        `;
        return;
    }
    
    const latestLog = getLatestLog(state, project.id);
    const reviewDue = isReviewDue(project);
    
    document.getElementById('app').innerHTML = `
        <div class="view-container">
            ${renderHeader(project)}
            ${renderWhySection(project)}
            ${renderProgress(project, latestLog, reviewDue)}
            ${renderActions(project)}
            ${renderTabs(state, project)}
        </div>
    `;
    
    attachHandlers(project);
}

function renderHeader(project) {
    return `
        <div class="level mb-2">
            <div class="level-left">
                <div class="level-item">
                    <button class="button" onclick="window.router.navigate('/dashboard')">
                        <span class="icon"><i class="fas fa-arrow-left"></i></span>
                        <span>Back</span>
                    </button>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <span class="badge is-${project.status}">${project.status}</span>
                </div>
            </div>
        </div>
        
        <h1 class="title">${escapeHtml(project.title)}</h1>
    `;
}

function renderWhySection(project) {
    return `
        <div class="box" style="background: linear-gradient(135deg, #b794f6 0%, #90cdf4 100%); color: white;">
            <h2 class="subtitle is-5" style="color: white; margin-bottom: 1rem;">
                <i class="fas fa-heart"></i> Why This Matters
            </h2>
            <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 1rem;">
                ${escapeHtml(project.purpose || 'No purpose set yet.')}
            </p>
            
            ${project.beneficiaries && project.beneficiaries.length > 0 ? `
                <div class="mt-2">
                    <strong>Who benefits:</strong>
                    ${project.beneficiaries.map(b => `<span class="tag is-light is-medium ml-1">${escapeHtml(b)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderProgress(project, latestLog, reviewDue) {
    return `
        <div class="columns">
            <div class="column">
                <div class="box">
                    <h3 class="subtitle is-6">Last Learned</h3>
                    ${latestLog ? `
                        <p class="text-small text-muted">${formatDate(latestLog.createdAt)}</p>
                        <p class="mt-2">${escapeHtml(latestLog.learned)}</p>
                    ` : `
                        <p class="text-muted">No learning logged yet.</p>
                    `}
                </div>
            </div>
            
            <div class="column">
                <div class="box">
                    <h3 class="subtitle is-6">Next Step</h3>
                    <div class="field">
                        <div class="control">
                            <input type="text" class="input" id="next-step-input" 
                                value="${escapeHtml(project.nextStep || '')}" 
                                placeholder="What's the most exciting next step?">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        ${reviewDue && project.status === 'active' ? `
            <div class="notification is-warning">
                <strong>Weekly Review Due</strong>
                <p>Time to reflect on your progress!</p>
                <button class="button is-warning mt-2" id="mark-review-complete">
                    <span class="icon"><i class="fas fa-check"></i></span>
                    <span>Mark Review Complete</span>
                </button>
            </div>
        ` : ''}
    `;
}

function renderActions(project) {
    return `
        <div class="buttons">
            <button class="button is-primary" id="add-learning-btn">
                <span class="icon"><i class="fas fa-book"></i></span>
                <span>Add Learning</span>
            </button>
            
            <button class="button is-success" id="celebrate-win-btn">
                <span class="icon"><i class="fas fa-trophy"></i></span>
                <span>Celebrate a Win</span>
            </button>
            
            <button class="button" id="export-calendar-btn">
                <span class="icon"><i class="fas fa-calendar"></i></span>
                <span>Export to Calendar</span>
            </button>
            
            <div class="dropdown" id="status-dropdown">
                <div class="dropdown-trigger">
                    <button class="button" aria-haspopup="true" aria-controls="status-menu">
                        <span class="icon"><i class="fas fa-ellipsis-v"></i></span>
                        <span>Change Status</span>
                    </button>
                </div>
                <div class="dropdown-menu" id="status-menu" role="menu">
                    <div class="dropdown-content">
                        ${project.status !== 'active' ? '<a class="dropdown-item" data-status="active">Set as Active</a>' : ''}
                        ${project.status !== 'paused' ? '<a class="dropdown-item" data-status="paused">Pause Project</a>' : ''}
                        ${project.status !== 'done' ? '<a class="dropdown-item" data-status="done">Mark as Done</a>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTabs(state, project) {
    const logs = getProjectLogs(state, project.id);
    const wins = getProjectWins(state, project.id);
    
    return `
        <div class="tabs mt-2">
            <ul>
                <li class="is-active" data-tab="logs"><a>Learning Log (${logs.length})</a></li>
                <li data-tab="wins"><a>Wins (${wins.length})</a></li>
            </ul>
        </div>
        
        <div id="tab-content">
            ${renderLogsTab(logs, project)}
        </div>
    `;
}

function renderLogsTab(logs, project) {
    if (logs.length === 0) {
        return `
            <div class="has-text-centered text-muted" style="padding: 2rem;">
                <p>No learning logged yet for this project.</p>
            </div>
        `;
    }
    
    const sorted = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return `
        <div class="log-entries">
            ${sorted.map(log => `
                <div class="box">
                    <p class="text-small text-muted">${formatDate(log.createdAt)}</p>
                    <p class="mt-2"><strong>Learned:</strong> ${escapeHtml(log.learned)}</p>
                    ${log.nextExcited ? `<p class="mt-2"><strong>Next excited about:</strong> ${escapeHtml(log.nextExcited)}</p>` : ''}
                    ${log.impactNote ? `<p class="mt-2"><strong>Impact:</strong> ${escapeHtml(log.impactNote)}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function renderWinsTab(wins) {
    if (wins.length === 0) {
        return `
            <div class="has-text-centered text-muted" style="padding: 2rem;">
                <p>No wins celebrated yet.</p>
            </div>
        `;
    }
    
    const sorted = wins.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return `
        <div class="win-entries">
            ${sorted.map(win => `
                <div class="box">
                    <span class="tag is-${win.kind === 'milestone' ? 'success' : 'info'}">${win.kind}</span>
                    <p class="text-small text-muted">${formatDate(win.createdAt)}</p>
                    <p class="mt-2">${escapeHtml(win.note)}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function attachHandlers(project) {
    // Next step auto-save
    const nextStepInput = document.getElementById('next-step-input');
    if (nextStepInput) {
        nextStepInput.addEventListener('blur', () => {
            const state = getState();
            const updatedProject = updateProject(project, {
                nextStep: nextStepInput.value.trim()
            });
            setState({
                ...state,
                projects: state.projects.map(p => p.id === project.id ? updatedProject : p)
            });
        });
    }
    
    // Mark review complete
    const reviewBtn = document.getElementById('mark-review-complete');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            const state = getState();
            const updatedProject = markReviewComplete(project);
            setState({
                ...state,
                projects: state.projects.map(p => p.id === project.id ? updatedProject : p)
            });
            renderFocus({ id: project.id });
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
    document.getElementById('export-calendar-btn').addEventListener('click', async () => {
        await exportProjectICS(project);
        alert('Calendar file downloaded!');
    });
    
    // Status dropdown
    document.querySelectorAll('#status-dropdown .dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const newStatus = e.target.getAttribute('data-status');
            showStatusChangeModal(project, newStatus);
        });
    });
    
    // Tabs
    document.querySelectorAll('.tabs li').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tabs li').forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            
            const tabName = tab.getAttribute('data-tab');
            const state = getState();
            const content = document.getElementById('tab-content');
            
            if (tabName === 'logs') {
                const logs = getProjectLogs(state, project.id);
                content.innerHTML = renderLogsTab(logs, project);
            } else if (tabName === 'wins') {
                const wins = getProjectWins(state, project.id);
                content.innerHTML = renderWinsTab(wins);
            }
        });
    });
}

function showAddLearningModal(project) {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">Add Learning</h2>
                <p class="subtitle">${escapeHtml(project.title)}</p>
                
                <form id="add-learning-form">
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
        
        const learned = document.getElementById('learned').value.trim();
        const nextExcited = document.getElementById('next-excited').value.trim();
        const impactNote = document.getElementById('impact-note').value.trim();
        
        const newLog = createLog({
            projectId: project.id,
            learned,
            nextExcited,
            impactNote
        });
        
        const state = getState();
        setState({
            ...state,
            logs: [...state.logs, newLog]
        });
        
        document.getElementById('modal-root').innerHTML = '';
        renderFocus({ id: project.id });
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}

function showCelebrateWinModal(project) {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">Celebrate a Win 🎉</h2>
                <p class="subtitle">${escapeHtml(project.title)}</p>
                
                <form id="celebrate-win-form">
                    <div class="form-field">
                        <label for="win-kind">Type of Win</label>
                        <select id="win-kind">
                            <option value="small">Small Win</option>
                            <option value="milestone">Milestone</option>
                            <option value="gratitude">Gratitude</option>
                        </select>
                    </div>
                    
                    <div class="form-field">
                        <label for="win-note">What happened? *</label>
                        <textarea id="win-note" required placeholder="Describe your win..."></textarea>
                    </div>
                    
                    <div class="buttons">
                        <button type="submit" class="button is-success">Celebrate!</button>
                        <button type="button" class="button" onclick="document.getElementById('modal-root').innerHTML = ''">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const form = document.getElementById('celebrate-win-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const kind = document.getElementById('win-kind').value;
        const note = document.getElementById('win-note').value.trim();
        
        const newWin = createWin({
            projectId: project.id,
            kind,
            note
        });
        
        const state = getState();
        setState({
            ...state,
            wins: [...state.wins, newWin]
        });
        
        document.getElementById('modal-root').innerHTML = '';
        renderFocus({ id: project.id });
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}

function showStatusChangeModal(project, newStatus) {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">Change Status to "${newStatus}"</h2>
                <p class="subtitle">${escapeHtml(project.title)}</p>
                
                <form id="status-change-form">
                    <div class="form-field">
                        <label for="reflection-note">Reflection Note</label>
                        <textarea id="reflection-note" placeholder="Optional: note why you're ${newStatus === 'done' ? 'completing' : newStatus === 'paused' ? 'pausing' : 'reactivating'} this project..."></textarea>
                    </div>
                    
                    <div class="buttons">
                        <button type="submit" class="button is-primary">Confirm</button>
                        <button type="button" class="button" onclick="document.getElementById('modal-root').innerHTML = ''">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const form = document.getElementById('status-change-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const reflectionNote = document.getElementById('reflection-note').value.trim();
        const updatedProject = changeProjectStatus(project, newStatus, reflectionNote);
        
        const state = getState();
        setState({
            ...state,
            projects: state.projects.map(p => p.id === project.id ? updatedProject : p)
        });
        
        document.getElementById('modal-root').innerHTML = '';
        renderFocus({ id: project.id });
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}

// Listen for FAB celebrate win event
eventBus.on('show-celebrate-win', () => {
    const hash = window.location.hash;
    const match = hash.match(/#\/project\/(.+)/);
    if (match) {
        const state = getState();
        const project = getProjectById(state, match[1]);
        if (project) {
            showCelebrateWinModal(project);
        }
    }
});
