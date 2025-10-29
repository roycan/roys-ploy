// Utility functions for Roy's Ploy (CommonJS/IIFE pattern)
(function(global) {
    'use strict';
    
    // UUID generation
    function generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback UUID v4 implementation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Short ID for filenames
    function generateShortId() {
        return Math.random().toString(36).substring(2, 8);
    }
    
    // Date helpers
    function formatDate(isoString) {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    }
    
    function formatDateTime(isoString) {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        return date.toLocaleString();
    }
    
    function formatDateShort(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    function getDaysSince(isoString) {
        if (!isoString) return Infinity;
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
    
    function getNextReviewDate(cadence) {
        const now = new Date();
        const dayOfWeek = cadence.dayOfWeek || 0; // 0 = Sunday
        const [hours, minutes] = (cadence.timeUTC || '20:00').split(':').map(Number);
        
        // Find next occurrence of the specified day
        const daysUntilNext = (dayOfWeek - now.getUTCDay() + 7) % 7 || 7;
        const nextDate = new Date(now);
        nextDate.setUTCDate(now.getUTCDate() + daysUntilNext);
        nextDate.setUTCHours(hours, minutes, 0, 0);
        
        // If we're past the time today and it's the same day, add 7 days
        if (daysUntilNext === 0 && now > nextDate) {
            nextDate.setUTCDate(nextDate.getUTCDate() + 7);
        }
        
        return nextDate;
    }
    
    function isReviewDue(project) {
        if (!project || project.status !== 'active') return false;
        
        const lastReview = project.lastReviewAt ? new Date(project.lastReviewAt) : null;
        const now = new Date();
        
        if (!lastReview) return true; // Never reviewed
        
        const daysSinceReview = Math.floor((now - lastReview) / (1000 * 60 * 60 * 24));
        const cadenceType = project.cadence?.type || 'weekly';
        
        if (cadenceType === 'weekly') return daysSinceReview >= 7;
        if (cadenceType === 'biweekly') return daysSinceReview >= 14;
        return daysSinceReview >= 7; // Default to weekly
    }
    
    // Debounce function
    function debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function
    function throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Sanitize for use in attributes
    function escapeAttr(text) {
        return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    
    // CSV escaping
    function escapeCsv(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
    
    // Truncate text
    function truncate(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Slugify for filenames
    function slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Validation helpers
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Array helpers
    function sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = typeof key === 'function' ? key(a) : a[key];
            const bVal = typeof key === 'function' ? key(b) : b[key];
            
            if (aVal === bVal) return 0;
            if (order === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });
    }
    
    function groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = typeof key === 'function' ? key(item) : item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    }
    
    // Local storage size estimation
    function getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
    
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
    
    // Device detection
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    // Feature detection
    function supportsWebShare() {
        return navigator.share !== undefined;
    }
    
    function supportsFileSystemAccess() {
        return 'showSaveFilePicker' in window;
    }
    
    // Clipboard helpers
    async function copyToClipboard(text) {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.error('Failed to copy:', err);
                return false;
            }
        }
        
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (err) {
            document.body.removeChild(textarea);
            return false;
        }
    }
    
    // Toast notification helper
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `notification is-${type} toast-notification`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 250px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }
    
    // Export all utilities to global scope
    global.Utils = {
        generateId,
        generateShortId,
        formatDate,
        formatDateTime,
        formatDateShort,
        getDaysSince,
        getNextReviewDate,
        isReviewDue,
        debounce,
        throttle,
        escapeHtml,
        escapeAttr,
        escapeCsv,
        truncate,
        slugify,
        isValidEmail,
        isValidUrl,
        sortBy,
        groupBy,
        getLocalStorageSize,
        formatBytes,
        isMobile,
        isIOS,
        supportsWebShare,
        supportsFileSystemAccess,
        copyToClipboard,
        showToast
    };
})(window);
