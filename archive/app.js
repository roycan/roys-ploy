// Main application entry point for Roy's Ploy
import { loadState, saveState, debouncedSave } from './storage.js';
import { EventEmitter } from './utils.js';
import { renderDashboard } from './views/dashboard.js';
import { renderFocus } from './views/focus.js';
import { renderGarden } from './views/garden.js';
import { renderLog } from './views/log.js';
import { renderSettings } from './views/settings.js';

// Global app state
let appState = null;
const eventBus = new EventEmitter();

// Get current state
export function getState() {
    return appState;
}

// Update state
export function setState(newState) {
    appState = newState;
    eventBus.emit('state-changed', appState);
    debouncedSave(appState);
}

// Subscribe to state changes
export function onStateChange(callback) {
    eventBus.on('state-changed', callback);
}

// Router
class Router {
    constructor() {
        this.routes = {
            '/': renderDashboard,
            '/dashboard': renderDashboard,
            '/project/:id': renderFocus,
            '/garden': renderGarden,
            '/log': renderLog,
            '/settings': renderSettings
        };
        
        this.currentRoute = null;
        this.currentParams = {};
    }
    
    init() {
        window.addEventListener('hashchange', () => this.route());
        this.route(); // Initial route on app start
    }
    
    route() {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.matchRoute(hash);
        
        if (route) {
            this.currentRoute = route.handler;
            this.currentParams = route.params;
            this.render();
            this.updateNav(hash);
            this.hideLoading();
        } else {
            // Default to dashboard
            window.location.hash = '#/dashboard';
        }
    }
    
    hideLoading() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
    
    matchRoute(path) {
        for (const [pattern, handler] of Object.entries(this.routes)) {
            const params = this.extractParams(pattern, path);
            if (params !== null) {
                return { handler, params };
            }
        }
        return null;
    }
    
    extractParams(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        
        if (patternParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];
            
            if (patternPart.startsWith(':')) {
                params[patternPart.slice(1)] = pathPart;
            } else if (patternPart !== pathPart) {
                return null;
            }
        }
        
        return params;
    }
    
    render() {
        if (this.currentRoute) {
            this.currentRoute(this.currentParams);
        }
    }
    
    updateNav(path) {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const route = item.getAttribute('data-route');
            if (path.startsWith(`/${route}`)) {
                item.classList.add('active');
            }
        });
    }
    
    navigate(path) {
        window.location.hash = `#${path}`;
    }
}

// FAB handler
class FABController {
    constructor() {
        this.fab = document.getElementById('fab');
        this.actions = {
            'dashboard': () => this.createProject(),
            'garden': () => this.captureIdea(),
            'log': () => this.addLearning(),
            'focus': () => this.celebrateWin()
        };
    }
    
    init() {
        this.fab.addEventListener('click', () => {
            const hash = window.location.hash.slice(1) || '/';
            const context = this.getContext(hash);
            const action = this.actions[context];
            if (action) action();
        });
    }
    
    getContext(path) {
        if (path.startsWith('/dashboard') || path === '/') return 'dashboard';
        if (path.startsWith('/garden')) return 'garden';
        if (path.startsWith('/log')) return 'log';
        if (path.startsWith('/project')) return 'focus';
        return 'dashboard';
    }
    
    updateIcon(context) {
        const icons = {
            'dashboard': 'fa-plus',
            'garden': 'fa-lightbulb',
            'log': 'fa-book',
            'focus': 'fa-trophy'
        };
        
        const icon = this.fab.querySelector('i');
        icon.className = `fas ${icons[context] || 'fa-plus'}`;
    }
    
    createProject() {
        eventBus.emit('show-create-project');
    }
    
    captureIdea() {
        eventBus.emit('show-capture-idea');
    }
    
    addLearning() {
        eventBus.emit('show-add-learning');
    }
    
    celebrateWin() {
        eventBus.emit('show-celebrate-win');
    }
}

// Initialize app
async function init() {
    console.log('Initializing Roy\'s Ploy...');
    
    try {
        // Load state
        appState = loadState();
        console.log('State loaded:', appState);
        
        // Show nav and FAB
        document.getElementById('bottom-nav').style.display = 'flex';
        document.getElementById('fab').style.display = 'flex';
        
        // Initialize router
        const router = new Router();
        router.init();
        
        // Initialize FAB
        const fab = new FABController();
        fab.init();
        
        // Update FAB on route change
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || '/';
            const context = fab.getContext(hash);
            fab.updateIcon(context);
        });
        
        // Expose router to window for easy navigation
        window.router = router;
        
        // Expose global functions
        window.appState = getState;
        window.setState = setState;
        window.eventBus = eventBus;
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.getElementById('app').innerHTML = `
            <div class="notification is-danger">
                <p class="title">Failed to load app</p>
                <p>${error.message}</p>
                <button class="button is-danger mt-2" onclick="localStorage.clear(); location.reload()">
                    Reset and Reload
                </button>
            </div>
        `;
    }
}

// Start the app
init();

// Export for use in views
export { eventBus };
