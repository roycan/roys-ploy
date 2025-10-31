// Data models and CRUD operations for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils
(function(global) {
    'use strict';
    
    // Project CRUD
    function createProject(data) {
        const now = new Date().toISOString();
        return {
            id: global.Utils.generateId(),
            title: data.title || 'Untitled Project',
            purpose: data.purpose || '',
            values: data.values || [],
            beneficiaries: data.beneficiaries || [],
            status: 'active',
            cadence: {
                type: data.cadenceType || 'weekly',
                dayOfWeek: data.cadenceDayOfWeek ?? 0,
                timeUTC: data.cadenceTimeUTC || '20:00'
            },
            nextStep: data.nextStep || '',
            practiceStrengths: Array.isArray(data.practiceStrengths) ? data.practiceStrengths : [],
            partnerNeeds: Array.isArray(data.partnerNeeds) ? data.partnerNeeds : [],
            supportPartners: Array.isArray(data.supportPartners) ? data.supportPartners : [], // Up to 3 partners
            lastReviewAt: null,
            createdAt: now,
            updatedAt: now
        };
    }
    
    // Support Partners CRUD (per project)
    function addSupportPartner(project, partner) {
        const partners = Array.isArray(project.supportPartners) ? project.supportPartners : [];
        if (partners.length >= 3) return project; // Enforce max 3
        if (!partner.name || !partner.name.trim()) return project; // Name required
        return {
            ...project,
            supportPartners: [...partners, {
                name: partner.name.trim(),
                contact: partner.contact?.trim() || '',
                helpsWith: Array.isArray(partner.helpsWith) ? partner.helpsWith : [],
                notes: partner.notes?.trim() || ''
            }]
        };
    }
    
    function updateSupportPartner(project, idx, updates) {
        const partners = Array.isArray(project.supportPartners) ? project.supportPartners : [];
        if (idx < 0 || idx >= partners.length) return project;
        const updated = {
            ...partners[idx],
            ...updates,
            name: (updates.name ?? partners[idx].name).trim(),
            contact: ((updates.contact ?? partners[idx].contact) || '').trim(),
            helpsWith: Array.isArray(updates.helpsWith) ? updates.helpsWith : partners[idx].helpsWith,
            notes: ((updates.notes ?? partners[idx].notes) || '').trim()
        };
        const newPartners = partners.slice();
        newPartners[idx] = updated;
        return { ...project, supportPartners: newPartners };
    }
    
    function removeSupportPartner(project, idx) {
        const partners = Array.isArray(project.supportPartners) ? project.supportPartners : [];
        if (idx < 0 || idx >= partners.length) return project;
        const newPartners = partners.filter((_, i) => i !== idx);
        return { ...project, supportPartners: newPartners };
    }
    
    function setSupportPartners(project, partners) {
        // Overwrite all partners (enforce max 3, name required)
        const valid = Array.isArray(partners)
            ? partners.filter(p => p && p.name && p.name.trim()).slice(0, 3)
            : [];
        return { ...project, supportPartners: valid };
    }
    
    function updateProject(project, updates) {
        return {
            ...project,
            ...updates,
            updatedAt: new Date().toISOString()
        };
    }
    
    function deleteProject(state, projectId) {
        return {
            ...state,
            projects: state.projects.filter(p => p.id !== projectId),
            // Also delete related items
            ideas: state.ideas.map(idea => 
                idea.projectId === projectId ? { ...idea, projectId: null } : idea
            ),
            logs: state.logs.filter(l => l.projectId !== projectId),
            wins: state.wins.filter(w => w.projectId !== projectId)
        };
    }
    
    function changeProjectStatus(project, newStatus, reflectionNote = '') {
        const update = {
            status: newStatus,
            updatedAt: new Date().toISOString()
        };
        
        if (reflectionNote) {
            update.reflectionNote = reflectionNote;
        }
        
        if (newStatus === 'done') {
            update.completedAt = new Date().toISOString();
        }
        
        return {
            ...project,
            ...update
        };
    }
    
    function markReviewComplete(project) {
        return {
            ...project,
            lastReviewAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    
    // Idea CRUD
    function createIdea(data) {
        const now = new Date().toISOString();
        
        return {
            id: global.Utils.generateId(),
            projectId: data.projectId || null,
            text: data.text || '',
            createdAt: now,
            archivedAt: null,
            promotedToProjectId: null
        };
    }
    
    function updateIdea(idea, updates) {
        return {
            ...idea,
            ...updates
        };
    }
    
    function archiveIdea(idea) {
        return {
            ...idea,
            archivedAt: new Date().toISOString()
        };
    }
    
    function unarchiveIdea(idea) {
        return {
            ...idea,
            archivedAt: null
        };
    }
    
    function promoteIdeaToProject(idea, projectData) {
        const project = createProject({
            title: projectData.title || idea.text.substring(0, 60),
            purpose: projectData.purpose || '',
            values: projectData.values || [],
            beneficiaries: projectData.beneficiaries || [],
            nextStep: projectData.nextStep || ''
        });
        
        const updatedIdea = {
            ...idea,
            promotedToProjectId: project.id
        };
        
        return { project, updatedIdea };
    }
    
    function assignIdeaToProject(idea, projectId) {
        return {
            ...idea,
            projectId
        };
    }
    
    function deleteIdea(state, ideaId) {
        return {
            ...state,
            ideas: state.ideas.filter(i => i.id !== ideaId)
        };
    }
    
    // Learning Log CRUD
    function createLog(data) {
        const now = new Date().toISOString();
        
        return {
            id: global.Utils.generateId(),
            projectId: data.projectId,
            learned: data.learned || '',
            nextExcited: data.nextExcited || '',
            impactNote: data.impactNote || '',
            createdAt: now
        };
    }
    
    function updateLog(log, updates) {
        return {
            ...log,
            ...updates
        };
    }
    
    function deleteLog(state, logId) {
        return {
            ...state,
            logs: state.logs.filter(l => l.id !== logId)
        };
    }
    
    // Win CRUD
    function createWin(data) {
        const now = new Date().toISOString();
        
        return {
            id: global.Utils.generateId(),
            projectId: data.projectId,
            kind: data.kind || 'small', // small | milestone | gratitude
            note: data.note || '',
            createdAt: now
        };
    }
    
    function updateWin(win, updates) {
        return {
            ...win,
            ...updates
        };
    }
    
    function deleteWin(state, winId) {
        return {
            ...state,
            wins: state.wins.filter(w => w.id !== winId)
        };
    }
    
    // Query helpers
    function getProjectById(state, projectId) {
        return state.projects.find(p => p.id === projectId);
    }
    
    function getActiveProjects(state) {
        return state.projects.filter(p => p.status === 'active');
    }
    
    function getPausedProjects(state) {
        return state.projects.filter(p => p.status === 'paused');
    }
    
    function getDoneProjects(state) {
        return state.projects.filter(p => p.status === 'done');
    }
    
    function getProjectsByStatus(state, status) {
        if (status === 'all') return state.projects;
        return state.projects.filter(p => p.status === status);
    }
    
    function getProjectLogs(state, projectId) {
        return state.logs.filter(l => l.projectId === projectId);
    }
    
    function getProjectWins(state, projectId) {
        return state.wins.filter(w => w.projectId === projectId);
    }
    
    function getProjectIdeas(state, projectId) {
        return state.ideas.filter(i => i.projectId === projectId && !i.archivedAt);
    }
    
    function getLatestLog(state, projectId) {
        const logs = getProjectLogs(state, projectId);
        if (logs.length === 0) return null;
        return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    }
    
    function getUnassignedIdeas(state) {
        return state.ideas.filter(i => !i.projectId && !i.archivedAt);
    }
    
    function getArchivedIdeas(state) {
        return state.ideas.filter(i => i.archivedAt !== null);
    }
    
    function getAllActiveIdeas(state) {
        return state.ideas.filter(i => !i.archivedAt);
    }
    
    function getRecentLogs(state, limit = 10) {
        return state.logs
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
    
    function getRecentWins(state, limit = 10) {
        return state.wins
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
    
    // Settings helpers
    function updateSettings(state, updates) {
        return {
            ...state,
            settings: {
                ...state.settings,
                ...updates
            }
        };
    }
    
    function recordBackup(state) {
        return updateSettings(state, {
            lastBackupAt: new Date().toISOString()
        });
    }
    
    function shouldShowBackupReminder(state) {
        const { lastBackupAt, backupReminderDays } = state.settings;
        
        if (!lastBackupAt) return true;
        
        const daysSince = Math.floor(
            (new Date() - new Date(lastBackupAt)) / (1000 * 60 * 60 * 24)
        );
        
        return daysSince >= backupReminderDays;
    }
    
    // Statistics
    function getProjectStats(state, projectId) {
        const logs = getProjectLogs(state, projectId);
        const wins = getProjectWins(state, projectId);
        const project = getProjectById(state, projectId);
        
        if (!project) return null;
        
        const daysSinceCreated = Math.floor(
            (new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24)
        );
        
        const daysSinceLastReview = project.lastReviewAt
            ? Math.floor((new Date() - new Date(project.lastReviewAt)) / (1000 * 60 * 60 * 24))
            : null;
        
        return {
            totalLogs: logs.length,
            totalWins: wins.length,
            daysSinceCreated,
            daysSinceLastReview,
            lastLog: getLatestLog(state, projectId),
            recentWins: wins.slice(0, 5)
        };
    }
    
    function getOverallStats(state) {
        return {
            totalProjects: state.projects.length,
            activeProjects: getActiveProjects(state).length,
            pausedProjects: getPausedProjects(state).length,
            doneProjects: getDoneProjects(state).length,
            totalIdeas: state.ideas.length,
            activeIdeas: getAllActiveIdeas(state).length,
            totalLogs: state.logs.length,
            totalWins: state.wins.length
        };
    }

    // Quarterly Reflections
    function createQuarterlyReflection(data) {
        const now = new Date().toISOString();
        return {
            id: global.Utils.generateId(),
            quarterLabel: data.quarterLabel || '', // e.g., "Q4 2025"
            goals: data.goals || '',
            successDefinition: data.successDefinition || '',
            risks: data.risks || '',
            supportPlan: data.supportPlan || '',
            isCurrent: !!data.isCurrent,
            createdAt: now,
            updatedAt: now
        };
    }
    function upsertQuarterlyReflection(state, item) {
        const list = Array.isArray(state.quarterlyReflections) ? state.quarterlyReflections : [];
        const idx = list.findIndex(r => r.id === item.id);
        const updatedItem = { ...item, updatedAt: new Date().toISOString() };
        let updatedList;
        if (idx === -1) {
            updatedList = [...list, updatedItem];
        } else {
            updatedList = list.slice();
            updatedList[idx] = updatedItem;
        }
        return { ...state, quarterlyReflections: updatedList };
    }
    function setCurrentQuarterlyReflection(state, id) {
        const list = Array.isArray(state.quarterlyReflections) ? state.quarterlyReflections : [];
        const updatedList = list.map(r => ({
            ...r,
            isCurrent: r.id === id,
            updatedAt: new Date().toISOString()
        }));
        return { ...state, quarterlyReflections: updatedList };
    }
    function deleteQuarterlyReflection(state, id) {
        const list = Array.isArray(state.quarterlyReflections) ? state.quarterlyReflections : [];
        return { ...state, quarterlyReflections: list.filter(r => r.id !== id) };
    }
    function getCurrentQuarterlyReflection(state) {
        const list = Array.isArray(state.quarterlyReflections) ? state.quarterlyReflections : [];
        return list.find(r => r.isCurrent) || null;
    }
    
    // Export to global scope
    global.Models = {
        createProject,
        updateProject,
        deleteProject,
        changeProjectStatus,
        markReviewComplete,
        createIdea,
        updateIdea,
        archiveIdea,
        unarchiveIdea,
        promoteIdeaToProject,
        assignIdeaToProject,
        deleteIdea,
        createLog,
        updateLog,
        deleteLog,
        createWin,
        updateWin,
        deleteWin,
        getProjectById,
        getActiveProjects,
        getPausedProjects,
        getDoneProjects,
        getProjectsByStatus,
        getProjectLogs,
        getProjectWins,
        getProjectIdeas,
        getLatestLog,
        getUnassignedIdeas,
        getArchivedIdeas,
        getAllActiveIdeas,
        getRecentLogs,
        getRecentWins,
        updateSettings,
        recordBackup,
        shouldShowBackupReminder,
        getProjectStats,
        getOverallStats,
        createQuarterlyReflection,
        upsertQuarterlyReflection,
        setCurrentQuarterlyReflection,
        deleteQuarterlyReflection,
        getCurrentQuarterlyReflection,
        addSupportPartner,
        updateSupportPartner,
        removeSupportPartner,
        setSupportPartners
    };
})(window);
