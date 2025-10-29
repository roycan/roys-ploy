// Import functionality for Roy's Ploy
import { importDocument, getImportPreview } from './storage.js';

// Parse and validate JSON from file
export async function importFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const jsonString = e.target.result;
                const preview = getImportPreview(jsonString);
                resolve({ jsonString, preview });
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

// Parse and validate JSON from pasted text
export function importFromText(text) {
    try {
        const preview = getImportPreview(text);
        return { jsonString: text, preview };
    } catch (error) {
        throw error;
    }
}

// Execute import with merge strategy
export function executeImport(jsonString, mergeStrategy = 'newest') {
    try {
        const imported = importDocument(jsonString, mergeStrategy);
        return {
            success: true,
            data: imported
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Generate import summary message
export function getImportSummary(preview) {
    if (!preview.valid) {
        return {
            title: 'Invalid Backup',
            message: `This file cannot be imported: ${preview.error}`,
            type: 'error'
        };
    }
    
    const { counts, conflicts } = preview;
    const totalItems = counts.projects + counts.ideas + counts.logs + counts.wins;
    const totalConflicts = conflicts.projects + conflicts.ideas + conflicts.logs + conflicts.wins;
    
    let message = `This backup contains:\n`;
    message += `• ${counts.projects} project${counts.projects !== 1 ? 's' : ''}\n`;
    message += `• ${counts.ideas} idea${counts.ideas !== 1 ? 's' : ''}\n`;
    message += `• ${counts.logs} learning log${counts.logs !== 1 ? ' entries' : ' entry'}\n`;
    message += `• ${counts.wins} win${counts.wins !== 1 ? 's' : ''}\n`;
    
    if (totalConflicts > 0) {
        message += `\n⚠️ ${totalConflicts} item${totalConflicts !== 1 ? 's' : ''} already exist${totalConflicts === 1 ? 's' : ''} in your data.\n`;
        message += `The newest version will be kept by default.`;
    }
    
    return {
        title: 'Import Preview',
        message,
        type: totalConflicts > 0 ? 'warning' : 'info',
        totalItems,
        totalConflicts
    };
}
