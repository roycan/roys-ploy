// Idea Garden view for Roy's Ploy
import { getState, setState, eventBus } from '../app.js';
import { getAllActiveIdeas, getUnassignedIdeas, getArchivedIdeas, createIdea, archiveIdea, assignIdeaToProject, promoteIdeaToProject, createProject } from '../models.js';
import { formatDate, escapeHtml } from '../utils.js';

let currentFilter = 'all';

export function renderGarden() {
    const state = getState();
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="view-container">
            <div class="section-header">
                <h1 class="title">Idea Garden 💡</h1>
                <p class="subtitle">Capture ideas freely. Promote the best ones. Archive the rest.</p>
                ${renderFilters()}
            </div>
            
            <div id="ideas-container">
                ${renderIdeas(state)}
            </div>
        </div>
    `;
    
    attachHandlers();
}

function renderFilters() {
    return `
        <div class="filters">
            <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                All Active
            </button>
            <button class="filter-btn ${currentFilter === 'unassigned' ? 'active' : ''}" data-filter="unassigned">
                Unassigned
            </button>
            <button class="filter-btn ${currentFilter === 'archived' ? 'active' : ''}" data-filter="archived">
                Archived
            </button>
        </div>
    `;
}

function renderIdeas(state) {
    let ideas = [];
    
    if (currentFilter === 'all') {
        ideas = getAllActiveIdeas(state);
    } else if (currentFilter === 'unassigned') {
        ideas = getUnassignedIdeas(state);
    } else if (currentFilter === 'archived') {
        ideas = getArchivedIdeas(state);
    }
    
    if (ideas.length === 0) {
        return `
            <div class="has-text-centered text-muted" style="padding: 3rem 1rem;">
                <p class="subtitle">No ${currentFilter} ideas yet.</p>
                <p>Click the + button below to capture your first idea!</p>
            </div>
        `;
    }
    
    // Sort by created date (newest first)
    const sorted = ideas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return sorted.map(idea => renderIdeaCard(state, idea)).join('');
}

function renderIdeaCard(state, idea) {
    const project = idea.projectId ? state.projects.find(p => p.id === idea.projectId) : null;
    const isArchived = idea.archivedAt !== null;
    
    return `
        <div class="box idea-card" data-idea-id="${idea.id}" style="${isArchived ? 'opacity: 0.6;' : ''}">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <div>
                            ${project ? `
                                <span class="tag is-info is-light mb-2">${escapeHtml(project.title)}</span>
                            ` : ''}
                            <p>${escapeHtml(idea.text)}</p>
                            <p class="text-small text-muted mt-2">${formatDate(idea.createdAt)}</p>
                            ${isArchived ? `<p class="text-small text-muted">Archived ${formatDate(idea.archivedAt)}</p>` : ''}
                            ${idea.promotedToProjectId ? `<p class="text-small has-text-success"><i class="fas fa-check"></i> Promoted to project</p>` : ''}
                        </div>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <div class="dropdown is-hoverable is-right">
                            <div class="dropdown-trigger">
                                <button class="button is-small" aria-haspopup="true">
                                    <span class="icon">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </span>
                                </button>
                            </div>
                            <div class="dropdown-menu" role="menu">
                                <div class="dropdown-content">
                                    ${!isArchived && !idea.promotedToProjectId ? `
                                        <a class="dropdown-item promote-idea" data-idea-id="${idea.id}">
                                            <i class="fas fa-arrow-up"></i> Promote to Project
                                        </a>
                                        ${!idea.projectId ? `
                                            <a class="dropdown-item assign-idea" data-idea-id="${idea.id}">
                                                <i class="fas fa-link"></i> Assign to Project
                                            </a>
                                        ` : ''}
                                        <hr class="dropdown-divider">
                                        <a class="dropdown-item archive-idea" data-idea-id="${idea.id}">
                                            <i class="fas fa-archive"></i> Archive
                                        </a>
                                    ` : ''}
                                    ${isArchived ? `
                                        <a class="dropdown-item unarchive-idea" data-idea-id="${idea.id}">
                                            <i class="fas fa-undo"></i> Unarchive
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function attachHandlers() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.getAttribute('data-filter');
            renderGarden();
        });
    });
    
    // Promote idea
    document.querySelectorAll('.promote-idea').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ideaId = e.target.closest('[data-idea-id]').getAttribute('data-idea-id');
            const state = getState();
            const idea = state.ideas.find(i => i.id === ideaId);
            if (idea) showPromoteIdeaModal(idea);
        });
    });
    
    // Assign idea
    document.querySelectorAll('.assign-idea').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ideaId = e.target.closest('[data-idea-id]').getAttribute('data-idea-id');
            const state = getState();
            const idea = state.ideas.find(i => i.id === ideaId);
            if (idea) showAssignIdeaModal(idea);
        });
    });
    
    // Archive idea
    document.querySelectorAll('.archive-idea').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ideaId = e.target.closest('[data-idea-id]').getAttribute('data-idea-id');
            const state = getState();
            const idea = state.ideas.find(i => i.id === ideaId);
            if (idea) {
                const archived = archiveIdea(idea);
                setState({
                    ...state,
                    ideas: state.ideas.map(i => i.id === ideaId ? archived : i)
                });
                renderGarden();
            }
        });
    });
    
    // Unarchive idea
    document.querySelectorAll('.unarchive-idea').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ideaId = e.target.closest('[data-idea-id]').getAttribute('data-idea-id');
            const state = getState();
            const idea = state.ideas.find(i => i.id === ideaId);
            if (idea) {
                const unarchived = { ...idea, archivedAt: null };
                setState({
                    ...state,
                    ideas: state.ideas.map(i => i.id === ideaId ? unarchived : i)
                });
                renderGarden();
            }
        });
    });
}

function showCaptureIdeaModal() {
    const state = getState();
    const modal = document.getElementById('modal-root');
    
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">Capture Idea</h2>
                
                <form id="capture-idea-form">
                    <div class="form-field">
                        <label for="idea-text">Your Idea *</label>
                        <textarea id="idea-text" required placeholder="Describe your idea, connection, or possibility..." rows="4"></textarea>
                    </div>
                    
                    <div class="form-field">
                        <label for="idea-project">Assign to Project (optional)</label>
                        <select id="idea-project">
                            <option value="">Unassigned</option>
                            ${state.projects.filter(p => p.status === 'active').map(p => 
                                `<option value="${p.id}">${escapeHtml(p.title)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="buttons">
                        <button type="submit" class="button is-primary">Capture</button>
                        <button type="button" class="button" onclick="document.getElementById('modal-root').innerHTML = ''">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const form = document.getElementById('capture-idea-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const text = document.getElementById('idea-text').value.trim();
        const projectId = document.getElementById('idea-project').value || null;
        
        const newIdea = createIdea({ text, projectId });
        
        setState({
            ...state,
            ideas: [...state.ideas, newIdea]
        });
        
        document.getElementById('modal-root').innerHTML = '';
        renderGarden();
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}

function showPromoteIdeaModal(idea) {
    const modal = document.getElementById('modal-root');
    
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">Promote Idea to Project</h2>
                <p class="subtitle">"${escapeHtml(idea.text.substring(0, 100))}${idea.text.length > 100 ? '...' : ''}"</p>
                
                <form id="promote-idea-form">
                    <div class="form-field">
                        <label for="project-title">Project Title *</label>
                        <input type="text" id="project-title" required maxlength="100" value="${escapeHtml(idea.text.substring(0, 60))}">
                    </div>
                    
                    <div class="form-field">
                        <label for="project-purpose">Purpose (Why does this matter?) *</label>
                        <textarea id="project-purpose" required placeholder="Connect this to your values and the bigger picture..."></textarea>
                    </div>
                    
                    <div class="form-field">
                        <label for="project-beneficiaries">Who will benefit?</label>
                        <input type="text" id="project-beneficiaries" placeholder="Separate names with commas">
                    </div>
                    
                    <div class="form-field">
                        <label for="project-next-step">What's the most exciting next step?</label>
                        <input type="text" id="project-next-step" placeholder="The one thing to focus on next...">
                    </div>
                    
                    <div class="buttons">
                        <button type="submit" class="button is-primary">Promote to Project</button>
                        <button type="button" class="button" onclick="document.getElementById('modal-root').innerHTML = ''">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const form = document.getElementById('promote-idea-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('project-title').value.trim();
        const purpose = document.getElementById('project-purpose').value.trim();
        const beneficiariesRaw = document.getElementById('project-beneficiaries').value.trim();
        const nextStep = document.getElementById('project-next-step').value.trim();
        
        const beneficiaries = beneficiariesRaw
            ? beneficiariesRaw.split(',').map(b => b.trim()).filter(b => b)
            : [];
        
        const { project, updatedIdea } = promoteIdeaToProject(idea, {
            title,
            purpose,
            beneficiaries,
            nextStep
        });
        
        const state = getState();
        setState({
            ...state,
            projects: [...state.projects, project],
            ideas: state.ideas.map(i => i.id === idea.id ? updatedIdea : i)
        });
        
        document.getElementById('modal-root').innerHTML = '';
        window.router.navigate(`/project/${project.id}`);
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}

function showAssignIdeaModal(idea) {
    const state = getState();
    const modal = document.getElementById('modal-root');
    
    modal.innerHTML = `
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="close">×</button>
                <h2 class="title">Assign Idea to Project</h2>
                <p class="subtitle">"${escapeHtml(idea.text.substring(0, 100))}${idea.text.length > 100 ? '...' : ''}"</p>
                
                <form id="assign-idea-form">
                    <div class="form-field">
                        <label for="assign-project">Select Project *</label>
                        <select id="assign-project" required>
                            <option value="">-- Choose a project --</option>
                            ${state.projects.filter(p => p.status === 'active').map(p => 
                                `<option value="${p.id}">${escapeHtml(p.title)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="buttons">
                        <button type="submit" class="button is-primary">Assign</button>
                        <button type="button" class="button" onclick="document.getElementById('modal-root').innerHTML = ''">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const form = document.getElementById('assign-idea-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectId = document.getElementById('assign-project').value;
        if (!projectId) return;
        
        const assigned = assignIdeaToProject(idea, projectId);
        
        setState({
            ...state,
            ideas: state.ideas.map(i => i.id === idea.id ? assigned : i)
        });
        
        document.getElementById('modal-root').innerHTML = '';
        renderGarden();
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('modal-root').innerHTML = '';
    });
}

// Listen for FAB capture idea event
eventBus.on('show-capture-idea', showCaptureIdeaModal);
