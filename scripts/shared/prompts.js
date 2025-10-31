// Prompts & quarterly reflections UI (CommonJS/IIFE pattern)
// Depends on: Utils, Storage, Models
(function(global) {
    'use strict';
    
    // Show quarterly prompts modal for creating/editing
    function showPromptsModal(reflection = null) {
        const state = Storage.loadState();
        const isEditing = reflection !== null;
        const formData = reflection || { quarterLabel: '', goals: '', successDefinition: '', risks: '', supportPlan: '', isCurrent: false };
        
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">${isEditing ? 'Edit' : 'Create'} Quarterly Plan</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        <form id="prompts-form">
                            <div class="field">
                                <label class="label is-small">Quarter Label</label>
                                <div class="control">
                                    <input class="input is-small" id="quarter-label" type="text" placeholder="e.g., Q4 2025" value="${global.Utils.escapeHtml(formData.quarterLabel)}" required>
                                </div>
                                <p class="help">A label to identify this plan.</p>
                            </div>

                            <div class="field">
                                <label class="label is-small">What do you want to achieve this quarter?</label>
                                <div class="control">
                                    <textarea class="textarea is-small" id="goals-input" rows="3" placeholder="Your goals for this quarter...">${global.Utils.escapeHtml(formData.goals)}</textarea>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label is-small">What does success look like?</label>
                                <div class="control">
                                    <textarea class="textarea is-small" id="success-input" rows="3" placeholder="How will you know you've succeeded?">${global.Utils.escapeHtml(formData.successDefinition)}</textarea>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label is-small">What might get in the way?</label>
                                <div class="control">
                                    <textarea class="textarea is-small" id="risks-input" rows="3" placeholder="Risks, challenges, or obstacles...">${global.Utils.escapeHtml(formData.risks)}</textarea>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label is-small">How will you support yourself?</label>
                                <div class="control">
                                    <textarea class="textarea is-small" id="support-input" rows="3" placeholder="Resources, people, habits, or structures that help...">${global.Utils.escapeHtml(formData.supportPlan)}</textarea>
                                </div>
                            </div>

                            <div class="field">
                                <div class="control">
                                    <label class="checkbox">
                                        <input type="checkbox" id="is-current-check" ${formData.isCurrent ? 'checked' : ''}>
                                        Mark as current quarter
                                    </label>
                                </div>
                            </div>
                        </form>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="save-prompts-btn">Save</button>
                        <button class="button" id="copy-prompts-btn">Copy Summary</button>
                        <button class="button" id="cancel-prompts-btn">Cancel</button>
                    </footer>
                </div>
            </div>
        `;
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        document.getElementById('save-prompts-btn').addEventListener('click', () => {
            const quarterLabel = document.getElementById('quarter-label').value.trim();
            const goals = document.getElementById('goals-input').value.trim();
            const successDefinition = document.getElementById('success-input').value.trim();
            const risks = document.getElementById('risks-input').value.trim();
            const supportPlan = document.getElementById('support-input').value.trim();
            const isCurrent = document.getElementById('is-current-check').checked;
            
            if (!quarterLabel) {
                alert('Please provide a quarter label.');
                return;
            }
            
            const item = isEditing
                ? { ...reflection, quarterLabel, goals, successDefinition, risks, supportPlan, isCurrent }
                : Models.createQuarterlyReflection({ quarterLabel, goals, successDefinition, risks, supportPlan, isCurrent });
            
            let updatedState = Models.upsertQuarterlyReflection(state, item);
            if (isCurrent) {
                updatedState = Models.setCurrentQuarterlyReflection(updatedState, item.id);
            }
            Storage.saveState(updatedState);
            closeModal();
            global.Utils.showToast('Quarterly plan saved!');
            
            // Reload the page if available; otherwise caller handles
            if (window.renderPromptsAccess) {
                window.renderPromptsAccess();
            }
        });
        
        document.getElementById('copy-prompts-btn').addEventListener('click', () => {
            const quarterLabel = document.getElementById('quarter-label').value.trim();
            const goals = document.getElementById('goals-input').value.trim();
            const successDefinition = document.getElementById('success-input').value.trim();
            const risks = document.getElementById('risks-input').value.trim();
            const supportPlan = document.getElementById('support-input').value.trim();
            
            const summary = `Quarter: ${quarterLabel}\n\nGoals:\n${goals}\n\nSuccess Looks Like:\n${successDefinition}\n\nRisks:\n${risks}\n\nSupport Plan:\n${supportPlan}`;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(summary).then(() => {
                    global.Utils.showToast('Summary copied to clipboard!');
                }).catch(() => {
                    global.Utils.showToast('Failed to copy', 'danger');
                });
            } else {
                global.Utils.showToast('Clipboard not supported', 'warning');
            }
        });
        
        document.getElementById('cancel-prompts-btn').addEventListener('click', closeModal);
        modal.querySelector('.delete').addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    // Show list of quarterly reflections with option to create/edit
    function showPromptsListModal() {
        const state = Storage.loadState();
        const reflections = Array.isArray(state.quarterlyReflections) ? state.quarterlyReflections : [];
        reflections.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Quarterly Plans</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        ${reflections.length === 0 ? `
                            <p class="has-text-grey">No quarterly plans yet. Create one to guide your work!</p>
                        ` : `
                            <div class="list">
                                ${reflections.map(r => `
                                    <div class="list-item" style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                                        <div style="display: flex; justify-content: space-between; align-items: start;">
                                            <div style="flex: 1;">
                                                <strong>${global.Utils.escapeHtml(r.quarterLabel)}</strong>
                                                ${r.isCurrent ? `<span class="tag is-success is-light is-small" style="margin-left: 0.5rem;">Current</span>` : ''}
                                                <p class="is-size-7 has-text-grey" style="margin-top: 0.25rem;">${global.Utils.truncate(r.goals, 80)}</p>
                                            </div>
                                            <div class="buttons are-small" style="margin-left: 0.5rem;">
                                                <button class="button is-small is-text" data-view-prompts="${r.id}" title="View">
                                                    <span class="icon"><i class="fas fa-eye"></i></span>
                                                </button>
                                                <button class="button is-small is-text" data-edit-prompts="${r.id}" title="Edit">
                                                    <span class="icon"><i class="fas fa-edit"></i></span>
                                                </button>
                                                ${!r.isCurrent ? `
                                                    <button class="button is-small is-text" data-set-current="${r.id}" title="Mark current">
                                                        <span class="icon"><i class="fas fa-check"></i></span>
                                                    </button>
                                                ` : ''}
                                                <button class="button is-small is-text has-text-danger" data-delete-prompts="${r.id}" title="Delete">
                                                    <span class="icon"><i class="fas fa-trash"></i></span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="new-prompts-btn">New Plan</button>
                        <button class="button" id="close-prompts-list-btn">Close</button>
                    </footer>
                </div>
            </div>
        `;
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        document.getElementById('new-prompts-btn').addEventListener('click', () => {
            closeModal();
            showPromptsModal();
        });
        
        document.getElementById('close-prompts-list-btn').addEventListener('click', closeModal);
        modal.querySelector('.delete').addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
        
        // Attach item action handlers via delegation
        modal.querySelector('.modal-card-body').addEventListener('click', (e) => {
            const viewBtn = e.target.closest('[data-view-prompts]');
            if (viewBtn) {
                const id = viewBtn.getAttribute('data-view-prompts');
                const item = reflections.find(r => r.id === id);
                if (item) {
                    closeModal();
                    showPromptsViewModal(item);
                }
                return;
            }
            
            const editBtn = e.target.closest('[data-edit-prompts]');
            if (editBtn) {
                const id = editBtn.getAttribute('data-edit-prompts');
                const item = reflections.find(r => r.id === id);
                if (item) {
                    closeModal();
                    showPromptsModal(item);
                }
                return;
            }
            
            const setCurrentBtn = e.target.closest('[data-set-current]');
            if (setCurrentBtn) {
                const id = setCurrentBtn.getAttribute('data-set-current');
                const updatedState = Models.setCurrentQuarterlyReflection(state, id);
                Storage.saveState(updatedState);
                global.Utils.showToast('Marked as current');
                closeModal();
                showPromptsListModal();
                return;
            }
            
            const deleteBtn = e.target.closest('[data-delete-prompts]');
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-delete-prompts');
                if (confirm('Delete this quarterly plan?')) {
                    const updatedState = Models.deleteQuarterlyReflection(state, id);
                    Storage.saveState(updatedState);
                    global.Utils.showToast('Deleted');
                    closeModal();
                    showPromptsListModal();
                }
                return;
            }
        });
    }
    
    // Show detailed view of a reflection
    function showPromptsViewModal(reflection) {
        const modal = document.getElementById('modal-root');
        modal.innerHTML = `
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">${global.Utils.escapeHtml(reflection.quarterLabel)}</p>
                        <button class="delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body">
                        ${reflection.isCurrent ? `<span class="tag is-success is-light" style="margin-bottom: 1rem;">Current Quarter</span>` : ''}
                        
                        <div class="content">
                            <h3 class="subtitle is-6">What do you want to achieve this quarter?</h3>
                            <p class="is-size-7">${global.Utils.escapeHtml(reflection.goals) || '<em>Not specified</em>'}</p>
                            
                            <h3 class="subtitle is-6" style="margin-top: 1rem;">What does success look like?</h3>
                            <p class="is-size-7">${global.Utils.escapeHtml(reflection.successDefinition) || '<em>Not specified</em>'}</p>
                            
                            <h3 class="subtitle is-6" style="margin-top: 1rem;">What might get in the way?</h3>
                            <p class="is-size-7">${global.Utils.escapeHtml(reflection.risks) || '<em>Not specified</em>'}</p>
                            
                            <h3 class="subtitle is-6" style="margin-top: 1rem;">How will you support yourself?</h3>
                            <p class="is-size-7">${global.Utils.escapeHtml(reflection.supportPlan) || '<em>Not specified</em>'}</p>
                        </div>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" id="edit-from-view-btn">Edit</button>
                        <button class="button" id="copy-from-view-btn">Copy Summary</button>
                        <button class="button" id="close-view-btn">Close</button>
                    </footer>
                </div>
            </div>
        `;
        
        const closeModal = () => {
            modal.innerHTML = '';
        };
        
        document.getElementById('edit-from-view-btn').addEventListener('click', () => {
            closeModal();
            showPromptsModal(reflection);
        });
        
        document.getElementById('copy-from-view-btn').addEventListener('click', () => {
            const summary = `Quarter: ${reflection.quarterLabel}\n\nGoals:\n${reflection.goals}\n\nSuccess Looks Like:\n${reflection.successDefinition}\n\nRisks:\n${reflection.risks}\n\nSupport Plan:\n${reflection.supportPlan}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(summary).then(() => {
                    global.Utils.showToast('Summary copied to clipboard!');
                }).catch(() => {
                    global.Utils.showToast('Failed to copy', 'danger');
                });
            } else {
                global.Utils.showToast('Clipboard not supported', 'warning');
            }
        });
        
        document.getElementById('close-view-btn').addEventListener('click', closeModal);
        modal.querySelector('.delete').addEventListener('click', closeModal);
        modal.querySelector('.modal-background').addEventListener('click', closeModal);
    }
    
    // Export to global scope
    global.PromptsModule = {
        showPromptsModal,
        showPromptsListModal,
        showPromptsViewModal
    };
})(window);
