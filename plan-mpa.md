# Roy's Ploy - Multi-Page Application (MPA) Plan

**Version**: MPA v1.0  
**Date**: October 29, 2025  
**Status**: Planning & Feasibility Review  
**Replaces**: plan-v1.md (SPA approach)

---

## 1. Executive Summary

**Goal**: Refactor Roy's Ploy from a Single-Page Application (SPA) with ES modules to a Multi-Page Application (MPA) with CommonJS-style patterns, maintaining all features while improving debuggability and developer familiarity.

**Key Changes**:
- SPA router → Traditional page navigation
- ES modules → CommonJS/IIFE pattern for browser
- Hash routing → Query parameters
- Single app entry → Page-specific initialization
- EventEmitter pub/sub → Direct function calls

**What Stays the Same**:
- All features (projects, ideas, logs, wins, reviews)
- Data model and localStorage strategy
- Export/import functionality (JSON, CSV, ICS)
- Mobile-first Bulma CSS design
- GitHub Pages deployment
- S.P.A.R.K. framework philosophy

---

## 2. Architecture Overview

### 2.1 File Structure

```
roys-ploy/
├── index.html              # Dashboard (landing page)
├── focus.html              # Project detail view
├── garden.html             # Ideas management
├── log.html                # Learning log chronological view
├── settings.html           # Settings, backup, import
├── .nojekyll               # GitHub Pages config
├── README.md               # Documentation
├── TESTING.md              # Test guide
├── DEPLOYMENT.md           # Deployment guide
├── plan-mpa.md             # This file
├── styles/
│   ├── main.css            # Core styles (shared across pages)
│   └── mobile.css          # Mobile-specific styles
└── scripts/
    ├── shared/
    │   ├── storage.js      # localStorage with migrations (CommonJS)
    │   ├── models.js       # Data models & CRUD (CommonJS)
    │   ├── utils.js        # Utility functions (CommonJS)
    │   ├── export.js       # Export JSON/CSV/ICS (CommonJS)
    │   ├── import.js       # Import & validation (CommonJS)
    │   └── nav.js          # Active nav highlighting (CommonJS)
    └── pages/
        ├── dashboard.js    # Dashboard page logic
        ├── focus.js        # Focus page logic
        ├── garden.js       # Garden page logic
        ├── log.js          # Log page logic
        └── settings.js     # Settings page logic
```

### 2.2 CommonJS/IIFE Pattern

Since browsers don't support Node.js `require()`, we'll use the IIFE (Immediately Invoked Function Expression) pattern to simulate modules:

```javascript
// scripts/shared/storage.js
(function(global) {
  'use strict';
  
  const STORAGE_KEY = 'rp:v1:doc';
  const TEMP_KEY = 'rp:v1:temp';
  
  function loadState() {
    // ... implementation
  }
  
  function saveState(state) {
    // ... implementation
  }
  
  // Export to global window object
  global.Storage = {
    loadState,
    saveState,
    // ... more exports
  };
})(window);
```

**Usage in HTML:**
```html
<!-- Load dependencies in order -->
<script src="./scripts/shared/utils.js"></script>
<script src="./scripts/shared/storage.js"></script>
<script src="./scripts/shared/models.js"></script>
<script src="./scripts/pages/dashboard.js"></script>
```

**Usage in other scripts:**
```javascript
// In dashboard.js, after storage.js is loaded
const state = Storage.loadState();
const project = Models.createProject({ title: 'Test' });
```

### 2.3 Navigation Strategy

**Bottom Navigation** (shared across all pages):
```html
<nav class="bottom-nav">
  <a href="index.html" class="bottom-nav-item" data-page="dashboard">
    <i class="fas fa-home"></i>
    <span>Dashboard</span>
  </a>
  <a href="garden.html" class="bottom-nav-item" data-page="garden">
    <i class="fas fa-lightbulb"></i>
    <span>Garden</span>
  </a>
  <a href="log.html" class="bottom-nav-item" data-page="log">
    <i class="fas fa-book"></i>
    <span>Log</span>
  </a>
  <a href="settings.html" class="bottom-nav-item" data-page="settings">
    <i class="fas fa-cog"></i>
    <span>Settings</span>
  </a>
</nav>
```

**Active state** managed by `nav.js`:
```javascript
// nav.js auto-highlights active page based on filename
(function(global) {
  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const pageMap = {
      'index': 'dashboard',
      'focus': 'dashboard', // Focus is a sub-page of dashboard
      'garden': 'garden',
      'log': 'log',
      'settings': 'settings'
    };
    
    const activePage = pageMap[currentPage] || 'dashboard';
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === activePage);
    });
  }
  
  global.Nav = { setActiveNav };
  
  // Auto-run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setActiveNav);
  } else {
    setActiveNav();
  }
})(window);
```

### 2.4 Page-Specific Routing

**Static pages**: `index.html`, `garden.html`, `log.html`, `settings.html`

**Dynamic pages**: `focus.html` uses URL parameters
```javascript
// Link to project: <a href="focus.html?id=abc123">View Project</a>

// In focus.js:
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

if (!projectId) {
  window.location.href = 'index.html';
}

const state = Storage.loadState();
const project = Models.getProjectById(state, projectId);

if (!project) {
  alert('Project not found');
  window.location.href = 'index.html';
}
```

---

## 3. Page Specifications

### 3.1 Dashboard (index.html)

**Purpose**: Landing page, project overview, re-entry prompts

**Scripts loaded** (in order):
1. `shared/utils.js`
2. `shared/storage.js`
3. `shared/models.js`
4. `shared/nav.js`
5. `pages/dashboard.js`

**Page logic** (`dashboard.js`):
```javascript
(function() {
  'use strict';
  
  function init() {
    const state = Storage.loadState();
    
    if (state.projects.length === 0) {
      renderWelcomeScreen();
    } else {
      renderReentryCard(state);
      renderProjects(state);
    }
    
    setupEventListeners();
  }
  
  function renderProjects(state) {
    // Filter, sort, render project cards
  }
  
  function renderReentryCard(state) {
    // Show "Welcome back", days since last visit, latest log
  }
  
  function showCreateProjectModal() {
    // Modal with form
  }
  
  function setupEventListeners() {
    document.getElementById('create-project-btn')?.addEventListener('click', showCreateProjectModal);
    // FAB click, filter changes, etc.
  }
  
  // Auto-run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

**FAB action**: Create new project

### 3.2 Focus (focus.html)

**Purpose**: Single project deep dive

**URL**: `focus.html?id={projectId}`

**Scripts loaded**:
1. `shared/utils.js`
2. `shared/storage.js`
3. `shared/models.js`
4. `shared/export.js`
5. `shared/nav.js`
6. `pages/focus.js`

**Page logic** (`focus.js`):
```javascript
(function() {
  'use strict';
  
  let currentProjectId = null;
  let currentState = null;
  
  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    currentProjectId = urlParams.get('id');
    
    if (!currentProjectId) {
      window.location.href = 'index.html';
      return;
    }
    
    currentState = Storage.loadState();
    const project = Models.getProjectById(currentState, currentProjectId);
    
    if (!project) {
      alert('Project not found');
      window.location.href = 'index.html';
      return;
    }
    
    renderProject(project);
    setupEventListeners();
  }
  
  function renderProject(project) {
    // Render Why section, tabs, logs, wins
  }
  
  function showAddLearningModal() {
    // Pre-fill project selector with current project
  }
  
  // ... more functions
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

**FAB action**: Celebrate win for current project

### 3.3 Garden (garden.html)

**Purpose**: Idea capture and management

**Scripts loaded**:
1. `shared/utils.js`
2. `shared/storage.js`
3. `shared/models.js`
4. `shared/nav.js`
5. `pages/garden.js`

**Page logic** (`garden.js`):
```javascript
(function() {
  'use strict';
  
  let currentFilter = 'all'; // all, unassigned, archived
  
  function init() {
    const state = Storage.loadState();
    renderIdeas(state);
    setupEventListeners();
  }
  
  function renderIdeas(state) {
    const ideas = Models.getIdeas(state, currentFilter);
    // Render idea cards with actions
  }
  
  function showCaptureIdeaModal() {
    // Modal with textarea + optional project assignment
  }
  
  // ... more functions
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

**FAB action**: Capture new idea

### 3.4 Log (log.html)

**Purpose**: Chronological learning log

**Scripts loaded**:
1. `shared/utils.js`
2. `shared/storage.js`
3. `shared/models.js`
4. `shared/nav.js`
5. `pages/log.js`

**Page logic** (`log.js`):
```javascript
(function() {
  'use strict';
  
  let selectedProjectId = null; // null = all projects
  
  function init() {
    const state = Storage.loadState();
    renderLogs(state);
    renderWeeklyReviewCard(state);
    setupEventListeners();
  }
  
  function renderLogs(state) {
    const logs = selectedProjectId 
      ? Models.getLogsByProject(state, selectedProjectId)
      : state.logs;
    
    // Group by month, render
  }
  
  // ... more functions
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

**FAB action**: Add learning entry

### 3.5 Settings (settings.html)

**Purpose**: Backup, import, preferences, calendar integration

**Scripts loaded**:
1. `shared/utils.js`
2. `shared/storage.js`
3. `shared/models.js`
4. `shared/export.js`
5. `shared/import.js`
6. `shared/nav.js`
7. `pages/settings.js`

**Page logic** (`settings.js`):
```javascript
(function() {
  'use strict';
  
  function init() {
    const state = Storage.loadState();
    renderBackupSection(state);
    renderCalendarSection(state);
    renderPreferences(state);
    setupEventListeners();
  }
  
  function handleExportJSON() {
    const state = Storage.loadState();
    ExportModule.exportJSON(state);
  }
  
  function handleImportFile(file) {
    ImportModule.importFromFile(file, (importedDoc) => {
      showImportPreviewModal(importedDoc);
    });
  }
  
  // ... more functions
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

**No FAB** on settings page (or reuse for "Download Backup")

---

## 4. Shared Modules Conversion

### 4.1 storage.js (CommonJS → IIFE)

**Exports**:
- `loadState()`
- `saveState(state)`
- `debouncedSave(state)`
- `getDefaultState()`
- `importDocument(doc, strategy)`
- `getImportPreview(doc)`

**Dependencies**: `Utils` (for `generateId`, `debounce`)

**Pattern**:
```javascript
(function(global) {
  'use strict';
  
  // All existing functions stay the same
  
  global.Storage = {
    loadState,
    saveState,
    debouncedSave,
    getDefaultState,
    importDocument,
    getImportPreview
  };
})(window);
```

### 4.2 models.js (CommonJS → IIFE)

**Exports**:
- Project CRUD: `createProject`, `updateProject`, `deleteProject`, `getProjectById`, etc.
- Idea CRUD: `createIdea`, `promoteIdeaToProject`, etc.
- Log CRUD: `createLog`, `getLogsByProject`, etc.
- Win CRUD: `createWin`, etc.
- Stats: `getProjectStats`, `getOverallStats`

**Dependencies**: `Utils` (for `generateId`)

**Pattern**:
```javascript
(function(global) {
  'use strict';
  
  // All existing functions
  
  global.Models = {
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    // ... all 40+ functions
  };
})(window);
```

### 4.3 utils.js (CommonJS → IIFE)

**Exports**:
- `generateId()`
- `formatDate(timestamp)`
- `debounce(fn, delay)`
- `throttle(fn, delay)`
- `escapeHtml(str)`
- `escapeCsv(str)`
- `showToast(message, type)`
- Feature detection: `supportsWebShare()`, etc.
- Clipboard helpers
- (Remove `EventEmitter` - not needed in MPA)

**Dependencies**: None

**Pattern**:
```javascript
(function(global) {
  'use strict';
  
  // All utility functions
  
  global.Utils = {
    generateId,
    formatDate,
    debounce,
    // ... all utilities
  };
})(window);
```

### 4.4 export.js (CommonJS → IIFE)

**Exports**:
- `exportJSON(state)`
- `copyJSON(state)`
- `shareJSON(state)`
- `exportProjectsCSV(state)`
- `exportLogsCSV(state)`
- `exportWinsCSV(state)`
- `exportIdeasCSV(state)`
- `exportProjectICS(state, projectId)`
- `exportAllActiveReviewsICS(state)`
- `getGoogleCalendarURL(project)`

**Dependencies**: `Utils`, `Storage`

**Pattern**:
```javascript
(function(global) {
  'use strict';
  
  // All export functions
  
  global.ExportModule = {
    exportJSON,
    copyJSON,
    shareJSON,
    exportProjectsCSV,
    exportLogsCSV,
    exportWinsCSV,
    exportIdeasCSV,
    exportProjectICS,
    exportAllActiveReviewsICS,
    getGoogleCalendarURL
  };
})(window);
```

### 4.5 import.js (CommonJS → IIFE)

**Exports**:
- `importFromFile(file, callback)`
- `importFromText(text, callback)`
- `executeImport(doc, strategy)`
- `getImportSummary(preview)`

**Dependencies**: `Storage`

**Pattern**:
```javascript
(function(global) {
  'use strict';
  
  // All import functions
  
  global.ImportModule = {
    importFromFile,
    importFromText,
    executeImport,
    getImportSummary
  };
})(window);
```

### 4.6 nav.js (New module)

**Purpose**: Highlight active navigation item

**Exports**:
- `setActiveNav()`

**Dependencies**: None

**Auto-runs**: On page load via event listener

---

## 5. HTML Page Templates

### 5.1 Shared Structure

Each page follows this template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAGE_TITLE - Roy's Ploy</title>
    
    <!-- Bulma CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
    
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom Styles -->
    <link rel="stylesheet" href="./styles/main.css">
    <link rel="stylesheet" href="./styles/mobile.css">
</head>
<body>
    <div id="app">
        <!-- Page-specific content -->
    </div>

    <!-- Bottom Navigation (shared) -->
    <nav class="bottom-nav">
        <a href="index.html" class="bottom-nav-item" data-page="dashboard">
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
        </a>
        <a href="garden.html" class="bottom-nav-item" data-page="garden">
            <i class="fas fa-lightbulb"></i>
            <span>Garden</span>
        </a>
        <a href="log.html" class="bottom-nav-item" data-page="log">
            <i class="fas fa-book"></i>
            <span>Log</span>
        </a>
        <a href="settings.html" class="bottom-nav-item" data-page="settings">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
        </a>
    </nav>

    <!-- Floating Action Button (if applicable) -->
    <button id="fab" class="fab" title="PAGE_FAB_ACTION">
        <i class="fas fa-PAGE_FAB_ICON"></i>
    </button>

    <!-- Modal Container -->
    <div id="modal-root"></div>

    <!-- Scripts (in dependency order) -->
    <script src="./scripts/shared/utils.js"></script>
    <script src="./scripts/shared/storage.js"></script>
    <script src="./scripts/shared/models.js"></script>
    <!-- PAGE_SPECIFIC_SCRIPTS -->
    <script src="./scripts/shared/nav.js"></script>
    <script src="./scripts/pages/PAGE_NAME.js"></script>
</body>
</html>
```

### 5.2 Script Loading Order

**Critical**: Scripts must load in dependency order since we're not using a module bundler.

**Standard order for all pages**:
1. `utils.js` (no dependencies)
2. `storage.js` (depends on Utils)
3. `models.js` (depends on Utils)
4. `export.js` (depends on Utils, Storage) - if needed
5. `import.js` (depends on Storage) - if needed
6. `nav.js` (no dependencies, auto-runs)
7. `pages/PAGE_NAME.js` (depends on all above)

---

## 6. Modal System

### 6.1 Modal HTML Structure

Modals are created dynamically and injected into `#modal-root`:

```javascript
function showModal(title, content, actions) {
  const modal = document.createElement('div');
  modal.className = 'modal is-active';
  modal.innerHTML = `
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">${Utils.escapeHtml(title)}</p>
        <button class="delete" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        ${content}
      </section>
      <footer class="modal-card-foot">
        ${actions}
      </footer>
    </div>
  `;
  
  document.getElementById('modal-root').appendChild(modal);
  
  // Close on background click or X button
  modal.querySelector('.modal-background').addEventListener('click', () => closeModal(modal));
  modal.querySelector('.delete').addEventListener('click', () => closeModal(modal));
  
  return modal;
}

function closeModal(modal) {
  modal.classList.remove('is-active');
  setTimeout(() => modal.remove(), 300);
}
```

### 6.2 Shared Modal Functions

These functions exist in each page's script (or could be extracted to a `shared/modals.js`):

- `showModal(title, content, actions)` - Generic modal
- `showConfirm(message, onConfirm)` - Confirmation dialog
- `showCreateProjectModal()` - New project form
- `showCaptureIdeaModal()` - New idea form
- `showAddLearningModal(preselectedProjectId)` - Learning entry form
- `showCelebrateWinModal(projectId)` - Win entry form
- `showStatusChangeModal(project)` - Status change with reflection
- `showImportPreviewModal(preview)` - Import merge UI

---

## 7. Data Flow

### 7.1 Page Load Sequence

1. **HTML loads** → Browser parses DOM
2. **CSS loads** → Bulma + custom styles applied
3. **Scripts load in order** → Global objects created (`Utils`, `Storage`, `Models`, etc.)
4. **nav.js runs** → Active nav item highlighted
5. **Page script runs** → `init()` function called
6. **init() loads state** → `Storage.loadState()`
7. **init() renders UI** → DOM manipulation
8. **Event listeners attached** → User interaction ready

### 7.2 User Action Flow

**Example: Creating a new project from dashboard**

1. User clicks FAB or "Create Project" button
2. `showCreateProjectModal()` called
3. Modal renders with form
4. User fills form and clicks "Create"
5. Event handler calls `Models.createProject(state, formData)`
6. Updated state saved via `Storage.saveState(state)`
7. Modal closes
8. Page re-renders: `renderProjects(Storage.loadState())`

**Example: Navigating to project focus**

1. User clicks project card: `<a href="focus.html?id=abc123">`
2. Browser navigates to `focus.html`
3. Page loads, scripts execute
4. `focus.js` reads `?id=abc123` from URL
5. Loads state, fetches project
6. Renders project details

### 7.3 State Persistence

**Every mutation**:
1. Get current state: `const state = Storage.loadState()`
2. Mutate via Models: `Models.updateProject(state, projectId, updates)`
3. Save: `Storage.saveState(state)`
4. Re-render if needed: `renderProjects(state)`

**No global state variable** - always read from localStorage via `loadState()` to ensure consistency across page navigations.

---

## 8. Migration from SPA to MPA

### 8.1 Code Reuse Strategy

| SPA File | MPA Destination | Changes Needed |
|----------|-----------------|----------------|
| `scripts/utils.js` | `scripts/shared/utils.js` | Convert to IIFE, remove EventEmitter |
| `scripts/storage.js` | `scripts/shared/storage.js` | Convert to IIFE |
| `scripts/models.js` | `scripts/shared/models.js` | Convert to IIFE |
| `scripts/export.js` | `scripts/shared/export.js` | Convert to IIFE |
| `scripts/import.js` | `scripts/shared/import.js` | Convert to IIFE |
| `scripts/views/dashboard.js` | `scripts/pages/dashboard.js` | Remove exports, add IIFE wrapper, add init() |
| `scripts/views/focus.js` | `scripts/pages/focus.js` | Same + add URL param parsing |
| `scripts/views/garden.js` | `scripts/pages/garden.js` | Same |
| `scripts/views/log.js` | `scripts/pages/log.js` | Same |
| `scripts/views/settings.js` | `scripts/pages/settings.js` | Same |
| `scripts/app.js` | **DELETE** | Replaced by nav.js + page scripts |
| `index.html` | `index.html` | Remove router, add nav, load dashboard.js |
| `styles/*.css` | `styles/*.css` | Keep as-is |

### 8.2 What to Delete

- `scripts/app.js` - Router no longer needed
- ES module `import/export` statements
- `EventEmitter` class
- Hash routing logic
- FAB context switching (FAB is now page-specific)

### 8.3 What to Add

- `scripts/shared/nav.js` - New file for nav highlighting
- 4 new HTML files: `focus.html`, `garden.html`, `log.html`, `settings.html`
- URL parameter parsing in `focus.js`
- IIFE wrappers for all scripts

---

## 9. Browser Compatibility

### 9.1 Supported Browsers

Same as SPA version:
- Chrome/Edge 90+ (April 2021)
- Safari 14+ (September 2020)
- Firefox 90+ (July 2021)

### 9.2 Required Features

- `URLSearchParams` (for `focus.html?id=...`)
- `localStorage`
- `Blob` and `FileReader` (for import/export)
- Modern CSS (Flexbox, Grid)
- ES6 features: arrow functions, template literals, destructuring, `const`/`let`

**Note**: IIFE pattern is compatible with older browsers than ES modules, so this actually improves compatibility slightly.

---

## 10. Performance Considerations

### 10.1 Page Load Times

**Estimated load time** (3G connection):
- HTML: ~1 KB = 10ms
- Bulma CSS (CDN, cached): ~200 KB gzipped = 500ms first load, <50ms cached
- Font Awesome (CDN, cached): ~80 KB gzipped = 200ms first load, <20ms cached
- Custom CSS: ~10 KB = 30ms
- Scripts: ~50-70 KB total = 150-200ms
- **Total first load**: ~1 second
- **Total cached**: ~300ms

**Page transitions**:
- Navigate between pages: ~300ms (HTML + scripts re-parse, CSS cached)
- SPA would be ~0ms, but 300ms is acceptable per user's stated preference

### 10.2 localStorage Performance

Same as SPA:
- Read: <1ms
- Write: <5ms
- Debounced saves reduce write frequency

### 10.3 Script Size

| File | Lines | Est. Size |
|------|-------|-----------|
| `shared/utils.js` | ~250 | 8 KB |
| `shared/storage.js` | ~240 | 8 KB |
| `shared/models.js` | ~340 | 12 KB |
| `shared/export.js` | ~240 | 8 KB |
| `shared/import.js` | ~80 | 3 KB |
| `shared/nav.js` | ~30 | 1 KB |
| `pages/dashboard.js` | ~350 | 12 KB |
| `pages/focus.js` | ~420 | 14 KB |
| `pages/garden.js` | ~330 | 11 KB |
| `pages/log.js` | ~240 | 8 KB |
| `pages/settings.js` | ~350 | 12 KB |
| **Total** | ~2,870 | **97 KB** |

**Gzipped**: ~25-30 KB

**Per-page load** (example: Dashboard):
- `utils.js` + `storage.js` + `models.js` + `nav.js` + `dashboard.js`
- = 8 + 8 + 12 + 1 + 12 = 41 KB (~12 KB gzipped)

---

## 11. Testing Strategy

### 11.1 Page-by-Page Testing

Each page can be tested in isolation:

1. **index.html** (Dashboard)
   - First-time user: Should show welcome screen
   - Returning user: Should show re-entry card
   - Create project flow
   - Filter projects
   - Navigate to focus

2. **focus.html** (requires `?id=...`)
   - Direct URL with invalid ID → redirect to index
   - Valid ID → render project
   - Add learning entry
   - Celebrate win
   - Change status (with reflection note)
   - Edit next step

3. **garden.html**
   - Capture idea
   - Promote idea to project
   - Assign idea to project
   - Archive idea
   - Filter ideas

4. **log.html**
   - View all logs
   - Filter by project
   - Add learning entry
   - Weekly review card

5. **settings.html**
   - Export JSON
   - Copy JSON
   - Share JSON (if supported)
   - Import from file
   - Import from paste
   - Export CSVs
   - Export ICS files
   - Change preferences

### 11.2 Integration Testing

Test navigation flows:
1. Dashboard → Focus → Add learning → Back to dashboard
2. Garden → Promote idea → Navigate to new project
3. Settings → Import backup → View imported projects

### 11.3 localStorage Testing

Same as SPA:
1. Clear localStorage → Should see welcome screen
2. Create data → Reload → Data persists
3. Import/export → Data matches

### 11.4 Browser DevTools

Easier debugging with MPA:
- Open `focus.html` directly in DevTools
- Inspect only the scripts loaded for that page
- Console errors clearly show which page/script failed
- No router state to debug

---

## 12. Deployment

### 12.1 GitHub Pages

**No changes** from SPA deployment:
1. Push files to repo
2. Enable GitHub Pages
3. Access via `https://{username}.github.io/{repo}/`

**Multi-page support**: GitHub Pages serves static HTML files natively. No configuration needed.

### 12.2 File Organization

GitHub Pages serves files as-is:
- `index.html` → `/` (root)
- `focus.html` → `/focus.html`
- `garden.html` → `/garden.html`
- `log.html` → `/log.html`
- `settings.html` → `/settings.html`

All relative paths (`./styles/`, `./scripts/`) work correctly.

### 12.3 .htaccess (Optional)

Not needed for GitHub Pages, but if deploying elsewhere:
```apache
# Optional: Redirect missing pages to index
ErrorDocument 404 /index.html

# Optional: Remove .html extension
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^([^\.]+)$ $1.html [NC,L]
```

---

## 13. Future Enhancements (Phase 2+)

Same as SPA plan:

### Phase 2: Enhanced Experience
- PWA manifest (multi-page PWAs are fully supported)
- Service worker for offline (cache all 5 HTML files + assets)
- Browser notifications
- Dark mode
- Keyboard shortcuts (still work in MPA with global event listeners)

### Phase 3: Advanced Features
- Google Calendar OAuth
- Encrypted backups
- Search and filters
- Visual timeline

**Note**: All Phase 2+ features are compatible with MPA architecture. Some (like service workers) are actually simpler with explicit file lists.

---

## 14. Risks & Mitigations

### 14.1 Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Script load order errors | High | Medium | Strict ordering in HTML, test thoroughly |
| Code duplication (nav in each HTML) | Low | High | Accept as trade-off, or use template in Phase 2 |
| Page reload feels slow | Medium | Low | User stated acceptance, optimize load times |
| Global namespace pollution | Medium | Low | Use namespaced objects (`Storage`, `Models`), avoid conflicts |
| Missing module benefits | Low | Medium | IIFE provides encapsulation, good enough for this scale |

### 14.2 Mitigations Detail

**Script load order**:
- Document required order clearly in each HTML file
- Test each page in isolation
- Use browser console to verify objects are available

**Code duplication**:
- Nav HTML is ~15 lines, acceptable to repeat 5 times
- Phase 2 could add templating or server-side includes

**Page reload performance**:
- Aggressive caching headers
- Minimize script size
- Consider Phase 2 service worker

**Global namespace**:
- All exports go into namespaced objects: `window.Storage`, `window.Models`, etc.
- Avoid adding variables to global scope
- Use IIFEs to create private scope

---

## 15. Success Criteria

Same as SPA, plus:

### Technical Success
- ✅ All 5 pages load without errors
- ✅ Navigation works between all pages
- ✅ `focus.html?id=...` correctly loads projects
- ✅ localStorage works across page transitions
- ✅ All CRUD operations functional
- ✅ Export/import preserves data
- ✅ Mobile responsive on all pages
- ✅ Active nav highlighting works

### Developer Experience Success
- ✅ Each page can be tested in isolation
- ✅ Console errors clearly identify source page
- ✅ Code is readable and maintainable
- ✅ No unfamiliar patterns (CommonJS/IIFE vs ES modules)
- ✅ Debugging is straightforward

### User Experience Success
- ✅ Page transitions feel fast (<300ms)
- ✅ No data loss between navigations
- ✅ Back button works predictably
- ✅ All features from SPA version work identically

---

## 16. Implementation Phases

### Phase 1: Foundation (Shared Modules)
1. Convert `utils.js` to IIFE
2. Convert `storage.js` to IIFE
3. Convert `models.js` to IIFE
4. Convert `export.js` to IIFE
5. Convert `import.js` to IIFE
6. Create `nav.js`
7. Test each module in console

### Phase 2: Pages (HTML + Scripts)
1. Create `index.html` (dashboard)
2. Create `pages/dashboard.js`
3. Test dashboard page
4. Create `focus.html`
5. Create `pages/focus.js`
6. Test focus page with URL params
7. Create `garden.html` + `pages/garden.js`
8. Test garden page
9. Create `log.html` + `pages/log.js`
10. Test log page
11. Create `settings.html` + `pages/settings.js`
12. Test settings page

### Phase 3: Integration & Polish
1. Test navigation between all pages
2. Test data persistence across navigation
3. Test all CRUD flows end-to-end
4. Mobile testing
5. Cross-browser testing
6. Performance optimization
7. Update documentation

**Estimated time**: 4-6 hours (vs 8-10 hours for SPA from scratch)

---

## 17. Open Questions

1. **Modal code duplication**: Should modal helper functions be extracted to `shared/modals.js`, or kept in each page script?
   - **Recommendation**: Keep in each page for now (simpler), extract if duplication becomes painful

2. **FAB on settings page**: Should settings have a FAB? If so, what action?
   - **Recommendation**: Either no FAB, or FAB = "Download Backup"

3. **Focus page breadcrumbs**: Should `focus.html` have a "← Back to Dashboard" link?
   - **Recommendation**: Yes, helpful for UX. Add to top of page.

4. **URL handling**: Should we use hash fragments (`focus.html#abc123`) or query params (`focus.html?id=abc123`)?
   - **Recommendation**: Query params (already specified above), more semantic

5. **Script minification**: Should we minify scripts for production?
   - **Recommendation**: Phase 2 enhancement, not MVP. Total size is small enough.

---

## 18. Feasibility Assessment

### 18.1 Technical Feasibility: ✅ **95% Confident**

**Proven patterns**:
- Multi-page apps: Used since the web began, well-understood
- IIFE pattern: Standard JavaScript pattern, works in all browsers
- Query parameters: Native browser API, no issues
- localStorage across pages: Same origin, fully supported

**Known challenges**:
- Script load order (mitigated by documentation and testing)
- Code duplication (accepted trade-off)

**Unknowns**:
- None. All techniques are standard and well-documented.

### 18.2 Timeline Feasibility: ✅ **90% Confident**

**Reusable code**: ~70% of existing SPA code can be reused with IIFE wrapping

**New work**:
- 4 new HTML files (templates, ~1 hour)
- Convert 6 modules to IIFE (~1 hour)
- Adapt 5 view scripts to page scripts (~2 hours)
- Testing and debugging (~2-3 hours)

**Total**: 6-7 hours estimated

**Risk buffer**: Could take up to 10 hours if unexpected issues arise

### 18.3 Maintenance Feasibility: ✅ **100% Confident**

**Easier than SPA**:
- No router to debug
- Page-specific issues isolated to single files
- Familiar patterns for developer
- Browser DevTools work naturally

**Trade-offs accepted**:
- Code duplication (nav HTML, modal functions)
- Page reloads (user stated acceptance)

### 18.4 User Experience Feasibility: ✅ **90% Confident**

**Identical features**: All SPA features work in MPA

**Performance**: Page loads ~300ms, acceptable per user preference

**Mobile**: All mobile features (Web Share, bottom nav, FAB) work identically

**Unknown**: Real-world usage may reveal preference for SPA snappiness, but user stated acceptance of page transitions.

---

## 19. Recommendation

### ✅ **Proceed with MPA Refactor**

**Reasoning**:
1. **Developer comfort**: User values understanding and familiarity over cleverness
2. **Debuggability**: Page-specific errors are easier to isolate and fix
3. **Proven patterns**: Multi-page + IIFE is time-tested, no experimental tech
4. **Reusable code**: 70% of existing work can be salvaged
5. **Acceptable trade-offs**: Code duplication and page reloads are minor compared to improved maintainability

**Confidence**: 95% technical feasibility, 90% timeline feasibility, 100% maintenance feasibility

**Next steps** (if approved):
1. Create `plan-mpa.md` ✅ (this document)
2. Feasibility review ✅
3. User approval ⏳
4. Begin Phase 1: Convert shared modules to IIFE
5. Phase 2: Create pages and page scripts
6. Phase 3: Integration testing and deployment

---

## 20. Appendix: IIFE Pattern Examples

### Example 1: Simple Module

```javascript
// Before (ES module):
export function add(a, b) {
  return a + b;
}

// After (IIFE):
(function(global) {
  'use strict';
  
  function add(a, b) {
    return a + b;
  }
  
  global.MathUtils = { add };
})(window);

// Usage:
const result = MathUtils.add(2, 3);
```

### Example 2: Module with Dependencies

```javascript
// Before (ES module):
import { formatDate } from './utils.js';

export function createLog(text) {
  return {
    id: generateId(),
    text,
    createdAt: formatDate(Date.now())
  };
}

// After (IIFE - assumes Utils is already loaded):
(function(global) {
  'use strict';
  
  function createLog(text) {
    return {
      id: Utils.generateId(),
      text,
      createdAt: Utils.formatDate(Date.now())
    };
  }
  
  global.LogFactory = { createLog };
})(window);

// Usage:
const log = LogFactory.createLog('Learned something');
```

### Example 3: Private Variables

```javascript
(function(global) {
  'use strict';
  
  // Private variables (not exported)
  const STORAGE_KEY = 'rp:v1:doc';
  let cache = null;
  
  // Public functions
  function loadState() {
    if (cache) return cache;
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : getDefaultState();
    return cache;
  }
  
  function saveState(state) {
    cache = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  
  // Only export what's needed
  global.Storage = {
    loadState,
    saveState
  };
})(window);
```

---

**End of Plan**
