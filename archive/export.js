// Export functionality for Roy's Ploy
import { generateShortId, slugify, escapeCsv, formatDateShort, getNextReviewDate, supportsWebShare } from './utils.js';
import { exportDocument } from './storage.js';

// Generate filename with timestamp
function getExportFilename(prefix, extension) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);
    const shortId = generateShortId();
    return `${prefix}-${dateStr}-${timeStr}-${shortId}.${extension}`;
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// JSON Export
export async function exportJSON(state) {
    const json = exportDocument(state);
    const filename = getExportFilename('roys-ploy', 'json');
    downloadFile(json, filename, 'application/json');
    return filename;
}

// Copy JSON to clipboard
export async function copyJSON(state) {
    const json = exportDocument(state);
    
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(json);
        return true;
    }
    
    return false;
}

// Web Share API (mobile)
export async function shareJSON(state) {
    if (!supportsWebShare()) {
        throw new Error('Web Share API not supported');
    }
    
    const json = exportDocument(state);
    const filename = getExportFilename('roys-ploy', 'json');
    const file = new File([json], filename, { type: 'application/json' });
    
    try {
        await navigator.share({
            files: [file],
            title: 'Roy\'s Ploy Backup',
            text: 'Backup of my projects and progress'
        });
        return true;
    } catch (error) {
        if (error.name === 'AbortError') {
            // User cancelled
            return false;
        }
        throw error;
    }
}

// CSV Exports
export async function exportProjectsCSV(state) {
    const headers = ['ID', 'Title', 'Status', 'Purpose', 'Values', 'Beneficiaries', 'Created At', 'Updated At', 'Cadence', 'Last Review'];
    
    const rows = state.projects.map(p => [
        p.id,
        p.title,
        p.status,
        p.purpose,
        (p.values || []).join('; '),
        (p.beneficiaries || []).join('; '),
        formatDateShort(p.createdAt),
        formatDateShort(p.updatedAt),
        p.cadence?.type || 'weekly',
        p.lastReviewAt ? formatDateShort(p.lastReviewAt) : 'Never'
    ]);
    
    const csv = generateCSV(headers, rows);
    const filename = getExportFilename('projects', 'csv');
    downloadFile('\uFEFF' + csv, filename, 'text/csv;charset=utf-8');
    return filename;
}

export async function exportLogsCSV(state) {
    const headers = ['ID', 'Project ID', 'Project Title', 'Learned', 'Next Excited', 'Impact Note', 'Created At'];
    
    const rows = state.logs.map(l => {
        const project = state.projects.find(p => p.id === l.projectId);
        return [
            l.id,
            l.projectId,
            project?.title || 'Unknown Project',
            l.learned,
            l.nextExcited || '',
            l.impactNote || '',
            formatDateShort(l.createdAt)
        ];
    });
    
    const csv = generateCSV(headers, rows);
    const filename = getExportFilename('learning_log', 'csv');
    downloadFile('\uFEFF' + csv, filename, 'text/csv;charset=utf-8');
    return filename;
}

export async function exportWinsCSV(state) {
    const headers = ['ID', 'Project ID', 'Project Title', 'Kind', 'Note', 'Created At'];
    
    const rows = state.wins.map(w => {
        const project = state.projects.find(p => p.id === w.projectId);
        return [
            w.id,
            w.projectId,
            project?.title || 'Unknown Project',
            w.kind,
            w.note,
            formatDateShort(w.createdAt)
        ];
    });
    
    const csv = generateCSV(headers, rows);
    const filename = getExportFilename('wins', 'csv');
    downloadFile('\uFEFF' + csv, filename, 'text/csv;charset=utf-8');
    return filename;
}

export async function exportIdeasCSV(state) {
    const headers = ['ID', 'Project ID', 'Project Title', 'Text', 'Archived At', 'Promoted To Project ID', 'Created At'];
    
    const rows = state.ideas.map(i => {
        const project = state.projects.find(p => p.id === i.projectId);
        return [
            i.id,
            i.projectId || '',
            project?.title || (i.projectId ? 'Unknown Project' : 'Unassigned'),
            i.text,
            i.archivedAt ? formatDateShort(i.archivedAt) : '',
            i.promotedToProjectId || '',
            formatDateShort(i.createdAt)
        ];
    });
    
    const csv = generateCSV(headers, rows);
    const filename = getExportFilename('ideas', 'csv');
    downloadFile('\uFEFF' + csv, filename, 'text/csv;charset=utf-8');
    return filename;
}

// Helper to generate CSV string
function generateCSV(headers, rows) {
    const headerRow = headers.map(escapeCsv).join(',');
    const dataRows = rows.map(row => row.map(escapeCsv).join(',')).join('\n');
    return `${headerRow}\n${dataRows}`;
}

// ICS (iCalendar) Export
export async function exportProjectICS(project) {
    const ics = generateICS([project]);
    const slug = slugify(project.title);
    const filename = `review-${slug}.ics`;
    downloadFile(ics, filename, 'text/calendar;charset=utf-8');
    return filename;
}

export async function exportAllActiveReviewsICS(state) {
    const activeProjects = state.projects.filter(p => p.status === 'active');
    const ics = generateICS(activeProjects);
    const filename = getExportFilename('roys-ploy-reviews-all', 'ics');
    downloadFile(ics, filename, 'text/calendar;charset=utf-8');
    return filename;
}

// Generate ICS content
function generateICS(projects) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const events = projects.map(project => {
        const nextReview = getNextReviewDate(project.cadence);
        const dtstart = nextReview.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const dayAbbr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][project.cadence.dayOfWeek || 0];
        
        const description = [
            `Purpose: ${project.purpose || 'Not set'}`,
            '',
            `Next Step: ${project.nextStep || 'Not set'}`,
            '',
            'Reflect on what you learned this week.'
        ].join('\\n');
        
        return `BEGIN:VEVENT
UID:rp-review-${project.id}@roysploy.local
DTSTAMP:${timestamp}
DTSTART:${dtstart}
RRULE:FREQ=WEEKLY;BYDAY=${dayAbbr}
SUMMARY:Weekly Review: ${project.title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT`;
    }).join('\n');
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Roy's Ploy//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}
END:VCALENDAR`;
}

// Google Calendar Add URL
export function getGoogleCalendarURL(project) {
    const nextReview = getNextReviewDate(project.cadence);
    const start = nextReview.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // End time is 1 hour later
    const endDate = new Date(nextReview);
    endDate.setUTCHours(endDate.getUTCHours() + 1);
    const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const title = encodeURIComponent(`Weekly Review: ${project.title}`);
    const description = encodeURIComponent([
        `Purpose: ${project.purpose || 'Not set'}`,
        '',
        `Next Step: ${project.nextStep || 'Not set'}`,
        '',
        'Reflect on what you learned this week.'
    ].join('\n'));
    
    const recur = encodeURIComponent(`RRULE:FREQ=WEEKLY;BYDAY=${['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][project.cadence.dayOfWeek || 0]}`);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&recur=${recur}`;
}
