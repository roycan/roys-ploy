// Data models and CRUD operations for Roy's Ploy
import { generateId } from './utils.js';

// Project CRUD
export function createProject(data) {
    const now = new Date().toISOString();
    
    return {
        id: generateId(),
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
        lastReviewAt: null,
        createdAt: now,
        updatedAt: now
    };
}

export function updateProject(project, updates) {
    return {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString()
    };
}

export function deleteProject(state, projectId) {
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

export function changeProjectStatus(project, newStatus, reflectionNote = '') {
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

export function markReviewComplete(project) {
    return {
        ...project,
        lastReviewAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

// Idea CRUD
export function createIdea(data) {
    const now = new Date().toISOString();
    
    return {
        id: generateId(),
        projectId: data.projectId || null,
        text: data.text || '',
        createdAt: now,
        archivedAt: null,
        promotedToProjectId: null
    };
}

export function updateIdea(idea, updates) {
    return {
        ...idea,
        ...updates
    };
}

export function archiveIdea(idea) {
    return {
        ...idea,
        archivedAt: new Date().toISOString()
    };
}

export function unarchiveIdea(idea) {
    return {
        ...idea,
        archivedAt: null
    };
}

export function promoteIdeaToProject(idea, projectData) {
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

export function assignIdeaToProject(idea, projectId) {
    return {
        ...idea,
        projectId
    };
}

export function deleteIdea(state, ideaId) {
    return {
        ...state,
        ideas: state.ideas.filter(i => i.id !== ideaId)
    };
}

// Learning Log CRUD
export function createLog(data) {
    const now = new Date().toISOString();
    
    return {
        id: generateId(),
        projectId: data.projectId,
        learned: data.learned || '',
        nextExcited: data.nextExcited || '',
        impactNote: data.impactNote || '',
        createdAt: now
    };
}

export function updateLog(log, updates) {
    return {
        ...log,
        ...updates
    };
}

export function deleteLog(state, logId) {
    return {
        ...state,
        logs: state.logs.filter(l => l.id !== logId)
    };
}

// Win CRUD
export function createWin(data) {
    const now = new Date().toISOString();
    
    return {
        id: generateId(),
        projectId: data.projectId,
        kind: data.kind || 'small', // small | milestone | gratitude
        note: data.note || '',
        createdAt: now
    };
}

export function updateWin(win, updates) {
    return {
        ...win,
        ...updates
    };
}

export function deleteWin(state, winId) {
    return {
        ...state,
        wins: state.wins.filter(w => w.id !== winId)
    };
}

// Query helpers
export function getProjectById(state, projectId) {
    return state.projects.find(p => p.id === projectId);
}

export function getActiveProjects(state) {
    return state.projects.filter(p => p.status === 'active');
}

export function getPausedProjects(state) {
    return state.projects.filter(p => p.status === 'paused');
}

export function getDoneProjects(state) {
    return state.projects.filter(p => p.status === 'done');
}

export function getProjectsByStatus(state, status) {
    if (status === 'all') return state.projects;
    return state.projects.filter(p => p.status === status);
}

export function getProjectLogs(state, projectId) {
    return state.logs.filter(l => l.projectId === projectId);
}

export function getProjectWins(state, projectId) {
    return state.wins.filter(w => w.projectId === projectId);
}

export function getProjectIdeas(state, projectId) {
    return state.ideas.filter(i => i.projectId === projectId && !i.archivedAt);
}

export function getLatestLog(state, projectId) {
    const logs = getProjectLogs(state, projectId);
    if (logs.length === 0) return null;
    return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

export function getUnassignedIdeas(state) {
    return state.ideas.filter(i => !i.projectId && !i.archivedAt);
}

export function getArchivedIdeas(state) {
    return state.ideas.filter(i => i.archivedAt !== null);
}

export function getAllActiveIdeas(state) {
    return state.ideas.filter(i => !i.archivedAt);
}

export function getRecentLogs(state, limit = 10) {
    return state.logs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

export function getRecentWins(state, limit = 10) {
    return state.wins
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

// Settings helpers
export function updateSettings(state, updates) {
    return {
        ...state,
        settings: {
            ...state.settings,
            ...updates
        }
    };
}

export function recordBackup(state) {
    return updateSettings(state, {
        lastBackupAt: new Date().toISOString()
    });
}

export function shouldShowBackupReminder(state) {
    const { lastBackupAt, backupReminderDays } = state.settings;
    
    if (!lastBackupAt) return true;
    
    const daysSince = Math.floor(
        (new Date() - new Date(lastBackupAt)) / (1000 * 60 * 60 * 24)
    );
    
    return daysSince >= backupReminderDays;
}

// Statistics
export function getProjectStats(state, projectId) {
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

export function getOverallStats(state) {
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
