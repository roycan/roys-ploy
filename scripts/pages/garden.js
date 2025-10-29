// Garden page logic for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models
(function() {
    'use strict';
    
    let currentFilter = 'all';
    
    function init() {
        renderGardenPage();
        
        // FAB action - capture idea
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', () => {
                showCaptureIdeaModal();
            });
        }
    }
    
    function renderGardenPage() {
        const state = Storage.loadState();
        let ideas = [];
        
        if (currentFilter === 'all') {
            ideas = Models.getAllActiveIdeas(state);
        } else if (currentFilter === 'unassigned') {
            ideas = Models.getUnassignedIdeas(state);
        } else if (currentFilter === 'archived') {
            ideas = Models.getArchivedIdeas(state);
        }
        
        // Sort by created date (newest first)
        const sortedIdeas = [...ideas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        document.getElementById('app').innerHTML = `
            <div class="container" style="padding: 1rem 1rem 5rem 1rem;">
                <div style="margin-bottom: 1.5rem;">
                    <h1 class="title is-4">Idea Garden 💡</h1>
                    <p class="subtitle is-6">Capture ideas freely. Promote the best ones. Archive the rest.</p>
                    
                    <!-- Filters -->
                    <div class="tabs is-toggle is-small">
                        <ul>
                            <li class="${currentFilter === 'all' ? 'is-active' : ''}" data-filter="all">
                                <a>All Active</a>
                            </li>
                            <li class="${currentFilter === 'unassigned' ? 'is-active' : ''}" data-filter="unassigned">
                                <a>Unassigned</a>
                            </li>
                            <li class="${currentFilter === 'archived' ? 'is-active' : ''}" data-filter="archived">
                                <a>Archived</a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- Ideas Container -->
                <div id="ideas-container">
                    ${sortedIdeas.length === 0 ? renderEmptyState() : sortedIdeas.map(idea => renderIdeaCard(state, idea)).join('')}
                </div>
            </div>
        `;
        
        attachHandlers();
    }
    
    function renderEmptyState() {
        return `
            <div class="has-text-centered" style="padding: 3rem 1rem;">
                <p class="subtitle has-text-grey">No ${currentFilter} ideas yet.</p>
                <p class="has-text-grey">Click the + button below to capture your first idea!</p>
            </div>
        `;
    }
    
    function renderIdeaCard(state, idea) {
        const project = idea.projectId ? Models.getProjectById(state, idea.projectId) : null;
        const isArchived = idea.archivedAt !== null;
        
        return `
            <div class="box" style="margin-bottom: 1rem; ${isArchived ? 'opacity: 0.6;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                    <div style="flex: 1;">
                        ${project ? `
                            <span class="tag is-info is-light" style="margin-bottom: 0.5rem;">${Utils.escapeHtml(project.title)}</span>
                        ` : ''}
                        <p style="margin-bottom: 0.5rem;">${Utils.escapeHtml(idea.text)}</p>
                        <p class="is-size-7 has-text-grey">${Utils.formatDate(idea.createdAt)}</p>
                        ${isArchived ? `<p class="is-size-7 has-text-grey">Archived ${Utils.formatDate(idea.archivedAt)}</p>` : ''}
                        ${idea.promotedToProjectId ? `<p class="is-size-7 has-text-success"><i class="fas fa-check"></i> Promoted to project</p>` : ''}
                    </div>
                    <div class="dropdown is-hoverable is-right" style="flex-shrink: 0;">
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
                                    <a class="dropdown-item" data-promote-idea="${idea.id}">
                                        <span class="icon"><i class="fas fa-arrow-up"></i></span>
                                        <span>Promote to Project</span>
                                    </a>
                                    ${!idea.projectId ? `
                                        <a class="dropdown-item" data-assign-idea="${idea.id}">
                                            <span class="icon"><i class="fas fa-link"></i></span>
                                            <span>Assign to Project</span>
                                        </a>
                                    ` : ''}
                                    <hr class="dropdown-divider">
                                    <a class="dropdown-item" data-archive-idea="${idea.id}">
                                        <span class="icon"><i class="fas fa-archive"></i></span>
                                        <span>Archive</span>
                                    </a>
                                    <a class="dropdown-item has-text-danger" data-delete-idea="${idea.id}">
                                        <span class="icon"><i class="fas fa-trash"></i></span>
                                        <span>Delete</span>
                                    </a>
                                ` : ''}
                                ${isArchived ? `
                                    <a class="dropdown-item" data-unarchive-idea="${idea.id}">
                                        <span class="icon"><i class="fas fa-undo"></i></span>
                                        <span>Unarchive</span>
                                    </a>
                                    <a class="dropdown-item has-text-danger" data-delete-idea="${idea.id}">
                                        <span class="icon"><i class="fas fa-trash"></i></span>
                                        <span>Delete</span>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function attachHandlers() {
        // Filter tabs
        document.querySelectorAll('.tabs li[data-filter]').forEach(tab => {
            tab.addEventListener('click', () => {
                currentFilter = tab.getAttribute('data-filter');
                renderGardenPage();
            });
        });
        
        // Promote idea
        document.querySelectorAll('[data-promote-idea]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const ideaId = btn.getAttribute('data-promote-idea');
                const state = Storage.loadState();
                const idea = state.ideas.find(i => i.id === ideaId);
                if (idea) showPromoteIdeaModal(idea);
            });
        });
        
        // Assign idea
        document.querySelectorAll('[data-assign-idea]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const ideaId = btn.getAttribute('data-assign-idea');
                const state = Storage.loadState();
                const idea = state.ideas.find(i => i.id === ideaId);
                if (idea) showAssignIdeaModal(idea);
            });
        });
        
        // Archive idea
        document.querySelectorAll('[data-archive-idea]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const ideaId = btn.getAttribute('data-archive-idea');
                const state = Storage.loadState();
                const idea = state.ideas.find(i => i.id === ideaId);
                if (idea && confirm('Archive this idea?')) {
                    const archived = Models.archiveIdea(idea);
                    Storage.saveState({
                        ...state,
                        ideas: state.ideas.map(i => i.id === ideaId ? archived : i)
                    });
                    Utils.showToast('Idea archived');
                    renderGardenPage();
                }
            });
        });
        
        // Unarchive idea
        document.querySelectorAll('[data-unarchive-idea]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const ideaId = btn.getAttribute('data-unarchive-idea');
                const state = Storage.loadState();
                const idea = state.ideas.find(i => i.id === ideaId);
                if (idea) {
                    const unarchived = { ...idea, archivedAt: null };
                    Storage.saveState({
                        ...state,
                        ideas: state.ideas.map(i => i.id === ideaId ? unarchived : i)
                    });
                    Utils.showToast('Idea unarchived');
                    renderGardenPage();
                }
            });
        });
        
        // Delete idea
        document.querySelectorAll('[data-delete-idea]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const ideaId = btn.getAttribute('data-delete-idea');
                if (confirm('Delete this idea? This cannot be undone.')) {
                    const state = Storage.loadState();
                    const updatedIdeas = Models.deleteIdea(state, ideaId);
                    Storage.saveState({
                        ...state,
                        ideas: updatedIdeas
                    });
                    Utils.showToast('Idea deleted');
                    renderGardenPage();
                }
            });
        });
    }
    
    function showCaptureIdeaModal() {
        const state = Storage.loadState();
        const activeProjects = Models.getActiveProjects(state);
        
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Capture Idea</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <form id="capture-idea-form">
                            <div class="field">
                                <label class="label">Your Idea <span class="has-text-danger">*</span></label>
                                <div class="control">
                                    <textarea 
                                        class="textarea" 
                                        id="idea-text" 
                                        required 
                                        placeholder="Describe your idea, connection, or possibility..."
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label">Assign to Project (optional)</label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select id="idea-project">
                                            <option value="">Unassigned</option>
                                            ${activeProjects.map(p => 
                                                `<option value="${p.id}">${Utils.escapeHtml(p.title)}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="submit-idea-btn">Capture</button>
                        <button class="button" id="cancel-idea-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const form = document.getElementById('capture-idea-form');
        const submitBtn = document.getElementById('submit-idea-btn');
        const cancelBtn = document.getElementById('cancel-idea-btn');
        const closeBtn = modal.querySelector('.delete');
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        const handleSubmit = (e) => {
            if (e) e.preventDefault();
            
            const text = document.getElementById('idea-text').value.trim();
            const projectId = document.getElementById('idea-project').value || null;
            
            if (!text) {
                alert('Please describe your idea.');
                return;
            }
            
            const newIdea = Models.createIdea({ text, projectId });
            
            Storage.saveState({
                ...state,
                ideas: [...state.ideas, newIdea]
            });
            
            closeModal();
            Utils.showToast('Idea captured!');
            renderGardenPage();
        };
        
        form.addEventListener('submit', handleSubmit);
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    function showPromoteIdeaModal(idea) {
        const modal = document.getElementById('modal-root');
        const ideaPreview = idea.text.length > 100 ? idea.text.substring(0, 100) + '...' : idea.text;
        const titleSuggestion = idea.text.length > 60 ? idea.text.substring(0, 60) : idea.text;
        
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Promote Idea to Project</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="notification is-info is-light">
                            <p class="is-size-7">"${Utils.escapeHtml(ideaPreview)}"</p>
                        </div>
                        
                        <form id="promote-idea-form">
                            <div class="field">
                                <label class="label">Project Title <span class="has-text-danger">*</span></label>
                                <div class="control">
                                    <input 
                                        class="input" 
                                        type="text" 
                                        id="project-title" 
                                        required 
                                        maxlength="100"
                                        value="${Utils.escapeHtml(titleSuggestion)}"
                                    >
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label">Purpose (Why does this matter?) <span class="has-text-danger">*</span></label>
                                <div class="control">
                                    <textarea 
                                        class="textarea" 
                                        id="project-why" 
                                        required 
                                        placeholder="Connect this to your values and the bigger picture..."
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label">Who will benefit? <span class="has-text-danger">*</span></label>
                                <div class="control">
                                    <input 
                                        class="input" 
                                        type="text" 
                                        id="project-beneficiaries" 
                                        required
                                        placeholder="me, my team, future users..."
                                    >
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label">What's the most exciting next step?</label>
                                <div class="control">
                                    <input 
                                        class="input" 
                                        type="text" 
                                        id="project-next-step" 
                                        placeholder="The one thing to focus on next..."
                                    >
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="submit-promote-btn">Promote to Project</button>
                        <button class="button" id="cancel-promote-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const form = document.getElementById('promote-idea-form');
        const submitBtn = document.getElementById('submit-promote-btn');
        const cancelBtn = document.getElementById('cancel-promote-btn');
        const closeBtn = modal.querySelector('.delete');
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        const handleSubmit = (e) => {
            if (e) e.preventDefault();
            
            const title = document.getElementById('project-title').value.trim();
            const why = document.getElementById('project-why').value.trim();
            const beneficiaries = document.getElementById('project-beneficiaries').value.trim();
            const nextStep = document.getElementById('project-next-step').value.trim();
            
            if (!title || !why || !beneficiaries) {
                alert('Please fill in all required fields.');
                return;
            }
            
            const state = Storage.loadState();
            const { project, updatedIdea } = Models.promoteIdeaToProject(idea, {
                title,
                why,
                beneficiaries,
                nextStep: nextStep || undefined
            });
            
            Storage.saveState({
                ...state,
                projects: [...state.projects, project],
                ideas: state.ideas.map(i => i.id === idea.id ? updatedIdea : i)
            });
            
            closeModal();
            Utils.showToast('Idea promoted to project!');
            // Navigate to the new project
            window.location.href = `focus.html?id=${project.id}`;
        };
        
        form.addEventListener('submit', handleSubmit);
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    function showAssignIdeaModal(idea) {
        const state = Storage.loadState();
        const activeProjects = Models.getActiveProjects(state);
        const ideaPreview = idea.text.length > 100 ? idea.text.substring(0, 100) + '...' : idea.text;
        
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Assign Idea to Project</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="notification is-info is-light">
                            <p class="is-size-7">"${Utils.escapeHtml(ideaPreview)}"</p>
                        </div>
                        
                        <form id="assign-idea-form">
                            <div class="field">
                                <label class="label">Select Project <span class="has-text-danger">*</span></label>
                                <div class="control">
                                    <div class="select is-fullwidth">
                                        <select id="assign-project" required>
                                            <option value="">-- Choose a project --</option>
                                            ${activeProjects.map(p => 
                                                `<option value="${p.id}">${Utils.escapeHtml(p.title)}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="submit-assign-btn">Assign</button>
                        <button class="button" id="cancel-assign-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const form = document.getElementById('assign-idea-form');
        const submitBtn = document.getElementById('submit-assign-btn');
        const cancelBtn = document.getElementById('cancel-assign-btn');
        const closeBtn = modal.querySelector('.delete');
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        const handleSubmit = (e) => {
            if (e) e.preventDefault();
            
            const projectId = document.getElementById('assign-project').value;
            if (!projectId) {
                alert('Please select a project.');
                return;
            }
            
            const assigned = Models.assignIdeaToProject(idea, projectId);
            
            Storage.saveState({
                ...state,
                ideas: state.ideas.map(i => i.id === idea.id ? assigned : i)
            });
            
            closeModal();
            Utils.showToast('Idea assigned to project!');
            renderGardenPage();
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
