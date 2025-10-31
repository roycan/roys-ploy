// Storage layer for Roy's Ploy (CommonJS/IIFE pattern)
// Depends on: Utils
(function(global) {
    'use strict';
    
    const STORAGE_KEY = 'rp:v1:doc';
    const TEMP_KEY = 'rp:v1:temp';
    const BACKUP_KEY = 'rp:v1:backup';
    const DEVICE_ID_KEY = 'rp:device:id';
    
    // Get or create device ID
    function getDeviceId() {
        let deviceId = localStorage.getItem(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = global.Utils.generateId();
            localStorage.setItem(DEVICE_ID_KEY, deviceId);
        }
        return deviceId;
    }
    
    // Default app state
    function getDefaultState() {
        return {
            version: 1,
            exportedAt: new Date().toISOString(),
            deviceId: getDeviceId(),
            projects: [],
            ideas: [],
            logs: [],
            wins: [],
            quarterlyReflections: [],
            settings: {
                defaultReviewDay: 0, // Sunday
                defaultReviewTimeUTC: '20:00',
                lastBackupAt: null,
                backupReminderDays: 14,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                strengths: [],
                supportNeeds: [],
                accountability: { name: '', contact: '' }
            }
        };
    }
    
    // Schema migrations
    function migrate(doc) {
        if (!doc.version) {
            // Migrate from pre-versioned to v1
            doc.version = 1;
        }
        
        // Future migrations go here
        // if (doc.version === 1) {
        //     doc.version = 2;
        //     // migration logic
        // }
        
        return doc;
    }
    
    // Validate document structure
    function validate(doc) {
        if (!doc || typeof doc !== 'object') {
            throw new Error('Invalid document: must be an object');
        }
        
        if (!doc.version) {
            throw new Error('Invalid document: missing version');
        }
        
        if (!Array.isArray(doc.projects)) {
            throw new Error('Invalid document: projects must be an array');
        }
        
        if (!Array.isArray(doc.ideas)) {
            throw new Error('Invalid document: ideas must be an array');
        }
        
        if (!Array.isArray(doc.logs)) {
            throw new Error('Invalid document: logs must be an array');
        }
        
        if (!Array.isArray(doc.wins)) {
            throw new Error('Invalid document: wins must be an array');
        }
        
        if (!doc.settings || typeof doc.settings !== 'object') {
            throw new Error('Invalid document: invalid settings');
        }
        
        return true;
    }
    
    // Load state from localStorage
    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            
            if (!raw) {
                // First time use
                const defaultState = getDefaultState();
                saveState(defaultState);
                return defaultState;
            }
            
            const doc = JSON.parse(raw);
            validate(doc);
            const migrated = migrate(doc);
            
            // Update deviceId
            migrated.deviceId = getDeviceId();
            
            return migrated;
        } catch (error) {
            console.error('Failed to load state:', error);
            
            // Try to recover from backup
            try {
                const backup = localStorage.getItem(BACKUP_KEY);
                if (backup) {
                    console.log('Attempting recovery from backup...');
                    const doc = JSON.parse(backup);
                    validate(doc);
                    const migrated = migrate(doc);
                    migrated.deviceId = getDeviceId();
                    saveState(migrated); // Save recovered state
                    return migrated;
                }
            } catch (backupError) {
                console.error('Backup recovery failed:', backupError);
            }
            
            // Last resort: return default state
            console.warn('Returning default state due to corruption');
            return getDefaultState();
        }
    }
    
    // Save state to localStorage with atomic writes
    function saveState(state) {
        try {
            // Create backup of current state before overwriting
            const current = localStorage.getItem(STORAGE_KEY);
            if (current) {
                localStorage.setItem(BACKUP_KEY, current);
            }
            
            // Update timestamp
            state.exportedAt = new Date().toISOString();
            
            const serialized = JSON.stringify(state);
            
            // Atomic write: save to temp key first
            localStorage.setItem(TEMP_KEY, serialized);
            
            // Then move to main key
            localStorage.setItem(STORAGE_KEY, serialized);
            
            // Clean up temp
            localStorage.removeItem(TEMP_KEY);
            
            return true;
        } catch (error) {
            console.error('Failed to save state:', error);
            
            // Check if it's a quota error
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please export a backup and clear old data.');
            }
            
            throw error;
        }
    }
    
    // Debounced save (use for frequent updates)
    const debouncedSave = global.Utils.debounce(saveState, 300);
    
    // Export full document for backup
    function exportDocument(state) {
        const doc = {
            ...state,
            exportedAt: new Date().toISOString(),
            deviceId: getDeviceId()
        };
        return JSON.stringify(doc, null, 2);
    }
    
    // Import document from JSON
    function importDocument(jsonString, mergeStrategy = 'newest') {
        try {
            const imported = JSON.parse(jsonString);
            validate(imported);
            const migrated = migrate(imported);
            
            if (mergeStrategy === 'overwrite') {
                return migrated;
            }
            
            // Merge with current state
            const current = loadState();
            const merged = mergeDocuments(current, migrated, mergeStrategy);
            
            return merged;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON: ${error.message}`);
            }
            throw error;
        }
    }
    
    // Merge two documents
    function mergeDocuments(current, imported, strategy = 'newest') {
        const result = {
            ...current,
            version: Math.max(current.version, imported.version)
        };
        
        // Merge projects
        result.projects = mergeArrays(
            current.projects,
            imported.projects,
            'id',
            strategy
        );
        
        // Merge ideas
        result.ideas = mergeArrays(
            current.ideas,
            imported.ideas,
            'id',
            strategy
        );
        
        // Merge logs
        result.logs = mergeArrays(
            current.logs,
            imported.logs,
            'id',
            strategy
        );
        
        // Merge wins
        result.wins = mergeArrays(
            current.wins,
            imported.wins,
            'id',
            strategy
        );
        
        // Merge quarterly reflections (by id)
        if (Array.isArray(current.quarterlyReflections) || Array.isArray(imported.quarterlyReflections)) {
            const cur = Array.isArray(current.quarterlyReflections) ? current.quarterlyReflections : [];
            const imp = Array.isArray(imported.quarterlyReflections) ? imported.quarterlyReflections : [];
            result.quarterlyReflections = mergeArrays(cur, imp, 'id', strategy);
        } else {
            result.quarterlyReflections = [];
        }
        
        // Settings: prefer imported if different
        result.settings = {
            ...current.settings,
            ...imported.settings
        };
        
        return result;
    }
    
    // Merge arrays of objects by ID
    function mergeArrays(current, imported, idField, strategy) {
        const map = new Map();
        
        // Add current items
        current.forEach(item => {
            map.set(item[idField], item);
        });
        
        // Merge imported items
        imported.forEach(item => {
            const existing = map.get(item[idField]);
            
            if (!existing) {
                // New item
                map.set(item[idField], item);
            } else if (strategy === 'newest') {
                // Keep newest by updatedAt
                const existingDate = new Date(existing.updatedAt || existing.createdAt);
                const importedDate = new Date(item.updatedAt || item.createdAt);
                
                if (importedDate > existingDate) {
                    map.set(item[idField], item);
                }
            }
            // If strategy is 'keep', we don't overwrite
        });
        
        return Array.from(map.values());
    }
    
    // Get import preview
    function getImportPreview(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            validate(imported);
            
            const current = loadState();
            
            // Count items
            const preview = {
                valid: true,
                version: imported.version,
                exportedAt: imported.exportedAt,
                counts: {
                    projects: imported.projects.length,
                    ideas: imported.ideas.length,
                    logs: imported.logs.length,
                    wins: imported.wins.length
                },
                conflicts: {
                    projects: 0,
                    ideas: 0,
                    logs: 0,
                    wins: 0
                }
            };
            
            // Detect conflicts
            const currentProjectIds = new Set(current.projects.map(p => p.id));
            const currentIdeaIds = new Set(current.ideas.map(i => i.id));
            const currentLogIds = new Set(current.logs.map(l => l.id));
            const currentWinIds = new Set(current.wins.map(w => w.id));
            
            preview.conflicts.projects = imported.projects.filter(p => currentProjectIds.has(p.id)).length;
            preview.conflicts.ideas = imported.ideas.filter(i => currentIdeaIds.has(i.id)).length;
            preview.conflicts.logs = imported.logs.filter(l => currentLogIds.has(l.id)).length;
            preview.conflicts.wins = imported.wins.filter(w => currentWinIds.has(w.id)).length;
            
            return preview;
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }
    
    // Clear all data (with confirmation)
    function clearAllData() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TEMP_KEY);
        localStorage.removeItem(BACKUP_KEY);
        return getDefaultState();
    }
    
    // Get storage statistics
    function getStorageStats() {
        const doc = localStorage.getItem(STORAGE_KEY);
        const backup = localStorage.getItem(BACKUP_KEY);
        
        return {
            totalSize: (doc?.length || 0) + (backup?.length || 0),
            docSize: doc?.length || 0,
            backupSize: backup?.length || 0,
            limit: 5 * 1024 * 1024, // ~5MB typical limit
            percentUsed: ((doc?.length || 0) / (5 * 1024 * 1024)) * 100
        };
    }
    
    // Export to global scope
    global.Storage = {
        loadState,
        saveState,
        debouncedSave,
        getDefaultState,
        exportDocument,
        importDocument,
        getImportPreview,
        clearAllData,
        getStorageStats
    };
})(window);
