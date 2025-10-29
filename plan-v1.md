# Roy's Ploy: Technical Implementation Plan v1

**Project**: Strengths-driven project companion for sustainable long-term achievement  
**Date**: October 29, 2025  
**Status**: Pre-implementation planning phase

---

## Executive Summary

A static web application that helps track multiple long-term projects through a strengths-based S.P.A.R.K. framework (Strategize, Personalize, Act, Reflect, Keep Connected). Built for mobile-first use with offline capability, local-first data storage, and easy backup/restore workflows.

**Core Philosophy**: Manage meaning and momentum, not tasks. Make re-entry after interruptions effortless.

---

## 1. Technology Stack

### Platform & Deployment
- **Hosting**: GitHub Pages (static site, HTTPS)
- **Build**: None—pure HTML/CSS/JS for zero-friction deployment
- **Domain**: `<username>.github.io/roys-ploy` or custom domain

### Frontend
- **HTML5**: Semantic markup, accessibility (ARIA, keyboard nav)
- **CSS**: Bulma 0.9.4+ via CDN (jsDelivr or cdnjs)
- **JavaScript**: Vanilla ES modules (no transpilation)
  - Targeting modern browsers: Chrome/Edge 90+, Safari 14+, Firefox 90+
  - Feature detection for progressive enhancement
- **Icons**: Bulma icons or Font Awesome via CDN

### Storage & Data
- **Primary**: localStorage (5–10 MB limit, synchronous API)
- **Backup**: JSON export/import, CSV exports
- **Future**: IndexedDB for resilience (Phase 2)

### APIs & Progressive Features
- **Calendar**: .ics generation (RFC 5545), Google Calendar prefill URLs
- **File I/O**: File System Access API (Chrome/Edge), Web Share API (mobile)
- **PWA** (Phase 2): Service Worker, Web App Manifest

---

## 2. Data Model

### Storage Keys
- `rp:v1:doc` — Single top-level document containing all data

### Schema v1

```json
{
  "version": 1,
  "exportedAt": "2025-10-29T20:00:00.000Z",
  "deviceId": "uuid-generated-once",
  "projects": [
    {
      "id": "uuid",
      "title": "string",
      "purpose": "string (why this matters)",
      "values": ["string"],
      "beneficiaries": ["string (people helped)"],
      "status": "active | paused | done",
      "cadence": {
        "type": "weekly | biweekly | custom",
        "dayOfWeek": 0-6,
        "timeUTC": "20:00"
      },
      "nextStep": "string",
      "lastReviewAt": "ISO 8601 | null",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ],
  "ideas": [
    {
      "id": "uuid",
      "projectId": "uuid | null",
      "text": "string",
      "createdAt": "ISO 8601",
      "archivedAt": "ISO 8601 | null",
      "promotedToProjectId": "uuid | null"
    }
  ],
  "logs": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "learned": "string",
      "nextExcited": "string",
      "impactNote": "string (who/what benefited)",
      "createdAt": "ISO 8601"
    }
  ],
  "wins": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "kind": "small | milestone | gratitude",
      "note": "string",
      "createdAt": "ISO 8601"
    }
  ],
  "settings": {
    "defaultReviewDay": 0,
    "defaultReviewTimeUTC": "20:00",
    "lastBackupAt": "ISO 8601 | null",
    "backupReminderDays": 14,
    "timezone": "auto-detected IANA"
  }
}
```

### Derived Data (not stored)
- **Momentum score**: weighted sum of recent logs + wins + review completions
- **Streak count**: consecutive weekly reviews completed
- **Review status**: overdue, due soon, completed this week

### Migration Strategy
- Check `doc.version` on load
- Run `migrate(doc)` to upgrade schema incrementally
- Keep migrations simple, tested, and reversible via backup

---

## 3. User Experience & Views

### Navigation (Mobile-First)

**Bottom Nav Bar** (always visible):
1. **Dashboard** (home icon)
2. **Garden** (lightbulb icon)
3. **Log** (book icon)
4. **Settings** (gear icon)

**Contextual FAB** (floating action button):
- Dashboard → New Project
- Garden → Capture Idea
- Log → Add Learning
- Project Focus → Celebrate Win

### View: Dashboard

**Purpose**: Re-entry ramp and project overview.

**Layout**:
- **Re-Entry Card** (if returning after >1 day):
  - "Welcome back! Last active: 2 days ago"
  - Quick links: "Remind me of the Why," "Last Learned," "Most Exciting Next Step"
- **Active Projects** (cards):
  - Title, purpose snippet, status badge
  - "Last learned: X days ago"
  - Next step (one-liner)
  - Review nudge: "Review due Sunday 8 PM" (color-coded)
  - Tap → Project Focus view
- **Filters**: Active (default) | Paused | Done
- **Search**: fuzzy match on title/purpose

**Actions**:
- Tap project → Focus view
- FAB → New Project
- Settings icon → Settings view

### View: Project Focus

**Purpose**: Single-project immersion; removes all distractions.

**Layout**:
- **Header**: Project title, status badge, back button
- **Why Section**: Purpose, values, beneficiaries (collapsible on scroll)
- **Last Learned**: Most recent log entry
- **Next Step**: Editable inline
- **Quick Actions**:
  - Celebrate a Win
  - Add Learning
  - Mark Review Complete
- **Tabs** (secondary):
  - Ideas (project-scoped)
  - Logs (chronological)
  - Wins (chronological)
- **Bottom actions**:
  - Pause/Resume
  - Export Review .ics
  - Edit Project

### View: Idea Garden

**Purpose**: Free-form capture and ideation.

**Layout**:
- **Filter**: All | Unassigned | By Project
- **Idea Cards**:
  - Text, timestamp, project tag (if any)
  - Actions: Archive, Promote to Project, Assign to Project
- **FAB**: Capture Idea (opens inline textarea or modal)

**Interaction**:
- Tap idea → Expand with actions
- Long-press (mobile) or right-click (desktop) → Quick menu

### View: Learning Log

**Purpose**: Chronicle discovery and impact across all projects.

**Layout**:
- **Filter**: All Projects | Select Project
- **Log Entries** (reverse chronological):
  - Date, project tag
  - "What I learned"
  - "What's next (excited about)"
  - "Impact note"
- **FAB**: Add Learning (form: project picker, three fields)

**Weekly Review Card** (if due):
- "Time for your Sunday review!"
- Tap → guided review flow (per project or all active)

### View: Settings

**Sections**:
1. **Backup & Sync**:
   - Last backup: timestamp or "Never"
   - Download Backup JSON
   - Copy Backup JSON
   - Share Backup (Web Share API, if supported)
   - Import Backup: Choose File | Paste JSON
   - Quick Backup to Folder (File System Access API, if supported)
   - Export CSVs: Projects, Logs, Wins, Ideas
2. **Calendar Integration**:
   - Default Review Day: Sunday
   - Default Review Time: 8:00 PM
   - Download All Active Reviews .ics
   - "Add to Google Calendar" link (template)
3. **Preferences**:
   - Theme (future): light, dark, auto
   - Backup reminder: days (default 14)
   - Timezone: auto-detected, display only
4. **About**:
   - Version, GitHub link, philosophy summary

---

## 4. Import/Export Flows

### Export JSON Backup

**Trigger**: Settings → "Download Backup JSON"

**Flow**:
1. Serialize `rp:v1:doc` from localStorage.
2. Add `exportedAt` timestamp.
3. Generate filename: `roys-ploy-YYYYMMDD-HHMM-[shortid].json`
4. Offer actions:
   - **Download**: triggers browser download
   - **Copy**: copies JSON to clipboard
   - **Share**: Web Share API (mobile) to Files, pCloud, email, etc.

**Output**: Single JSON file, human-readable (pretty-printed).

### Import JSON Backup

**Trigger**: Settings → "Import Backup"

**Flow**:
1. User selects method: **Choose File** or **Paste JSON**
2. Parse JSON; validate schema version.
3. **Preview**:
   - Show counts: X projects, Y ideas, Z logs, W wins
   - Detect conflicts: projects with same ID but different `updatedAt`
   - Default strategy: "Keep newer by updatedAt"
   - Option: "Overwrite all" or "Merge intelligently"
4. **Confirm**: "Import X items?"
5. **Execute**:
   - Create rollback snapshot (store old doc in temp key).
   - Merge data per strategy.
   - Write to `rp:v1:doc`.
   - Reload app state.
6. **Result**: "Imported successfully" or error with details.

**Edge Cases**:
- Invalid JSON: show parse error with line/col.
- Version mismatch: attempt migration; warn if unsupported.
- Duplicate IDs: prefer newer `updatedAt`; log collision.
- Storage full: fail gracefully, offer to retry after cleanup.

### Export CSV

**Trigger**: Settings → "Export CSVs"

**Files**:
1. `projects.csv`: id, title, status, purpose, values (semicolon-joined), beneficiaries (semicolon-joined), createdAt, updatedAt, cadence, lastReviewAt
2. `learning_log.csv`: id, projectId, projectTitle, learned, nextExcited, impactNote, createdAt
3. `wins.csv`: id, projectId, projectTitle, kind, note, createdAt
4. `ideas.csv`: id, projectId, projectTitle, text, archivedAt, promotedToProjectId, createdAt

**Format**: RFC 4180 CSV; UTF-8 BOM for Excel compatibility; escape quotes/commas.

**Use Case**: Share progress with collaborators, import into spreadsheets, external analysis.

### Calendar Export (.ics)

**Trigger**:
- Per-project: Project Focus → "Export Review .ics"
- All active: Settings → "Download All Active Reviews .ics"

**ICS Format** (RFC 5545):
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Roy's Ploy//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH

BEGIN:VEVENT
UID:rp-review-{projectId}@roysploy.local
DTSTAMP:20251029T200000Z
DTSTART:20251103T200000Z
RRULE:FREQ=WEEKLY;BYDAY=SU
SUMMARY:Weekly Review: {Project Title}
DESCRIPTION:Purpose: {purpose}\n\nNext Step: {nextStep}\n\nReflect on what you learned this week.
LOCATION:
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT

END:VCALENDAR
```

**Fields**:
- `UID`: stable per project (`rp-review-{projectId}`)
- `DTSTART`: next occurrence of review day/time in UTC
- `RRULE`: weekly recurrence on specified day
- `SUMMARY`: "Weekly Review: {Project Title}"
- `DESCRIPTION`: purpose, next step, reflection prompt

**Filename**:
- Per-project: `review-{project-slug}.ics`
- All active: `roys-ploy-reviews-all.ics`

**Add to Google Calendar**:
- Template URL: `https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start}/{end}&details={description}&recur=RRULE:FREQ=WEEKLY;BYDAY=SU`
- Open in new tab; user confirms in Google UI.

---

## 5. Application Architecture

### File Structure

```
roys-ploy/
├── index.html              # App shell, minimal inline CSS/JS
├── styles/
│   ├── main.css            # Utilities, overrides, custom components
│   └── mobile.css          # Mobile-specific adjustments
├── scripts/
│   ├── app.js              # Entry point, router, app state
│   ├── storage.js          # localStorage abstraction, migrations
│   ├── models.js           # Data helpers (create, update, delete)
│   ├── views/
│   │   ├── dashboard.js
│   │   ├── focus.js
│   │   ├── garden.js
│   │   ├── log.js
│   │   └── settings.js
│   ├── components/
│   │   ├── project-card.js
│   │   ├── idea-card.js
│   │   ├── log-entry.js
│   │   └── fab.js
│   ├── export.js           # JSON, CSV, ICS generation
│   ├── import.js           # JSON parsing, validation, merge
│   ├── calendar.js         # ICS generation
│   └── utils.js            # UUID, date helpers, debounce
├── assets/
│   ├── icons/              # Local fallback icons (optional)
│   └── manifest.json       # PWA manifest (Phase 2)
├── README.md
└── .nojekyll               # For GitHub Pages (bypasses Jekyll)
```

### Routing

**Hash-based routing** (no server required):
- `#/` or `#/dashboard` → Dashboard
- `#/project/:id` → Project Focus
- `#/garden` → Idea Garden
- `#/log` → Learning Log
- `#/settings` → Settings

**Implementation**:
- Listen to `hashchange` event.
- Parse hash, match route, render view.
- Update bottom nav active state.
- Store last route in localStorage for re-entry.

### State Management

**In-memory state**:
- Single `AppState` object hydrated from localStorage on load.
- Modules subscribe to state changes via tiny pub/sub (30 lines).
- Optimistic UI: update state immediately, debounce persist (300ms).

**Persistence**:
- `saveState()` writes to `rp:v1:doc`.
- `loadState()` reads, validates, migrates on app init.
- Atomic writes: write to temp key, then swap to avoid corruption.

### Error Handling

- **Storage full**: catch `QuotaExceededError`, prompt to backup and clear old data.
- **Parse errors**: show user-friendly message with line/col.
- **Network (CDN) failures**: inline critical CSS/JS; degrade gracefully.
- **Corrupted data**: validate on load; rollback to last snapshot or reset with warning.

---

## 6. Mobile-First Considerations

### Performance
- **Lazy load**: render only visible items; virtual scroll for logs (if >100 entries).
- **Debounce**: saves, searches, filters.
- **Minimal DOM**: prefer `innerHTML` over framework overhead for simple views.

### Touch & Gestures
- **Tap targets**: ≥44px (Apple HIG, Material).
- **Swipe**: optional left/right swipe on cards (archive, complete).
- **Pull-to-refresh**: Phase 2 (requires service worker or custom gesture).

### Responsive Layout
- **Breakpoints**:
  - Mobile: <768px (single column, bottom nav, FAB)
  - Tablet: 768–1024px (two columns, side nav optional)
  - Desktop: >1024px (sidebar nav, multi-column dashboard)
- **Bulma columns**: use `is-mobile`, `is-tablet`, `is-desktop` helpers.

### Offline & PWA (Phase 2)
- Service Worker caches app shell and assets.
- Web App Manifest for "Add to Home Screen."
- IndexedDB for background sync (advanced).

---

## 7. Security & Privacy

### Data Privacy
- **Local-first**: no data leaves the device unless user exports.
- **No analytics**: no tracking scripts, cookies, or third-party embeds (except CDN for Bulma).
- **Transparent exports**: JSON is human-readable; CSVs are plain text.

### XSS Prevention
- Sanitize user input before rendering (use `textContent` not `innerHTML` for user data).
- Escape CSV fields (quotes, commas, newlines).

### Backup Security
- **Warning**: JSON backups contain all data in plaintext; advise users to store securely (pCloud with encryption, password-protected zip, etc.).
- **Future**: optional AES-GCM encryption with user-provided passphrase (Phase 3).

---

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| localStorage cleared by browser | High | Medium | Weekly backup reminders; auto-backup to File System API (desktop). |
| Storage quota exceeded | Medium | Low | Monitor size on save; warn at 80%; offer CSV export to trim logs. |
| Browser incompatibility (iOS Safari) | Medium | Low | Feature detection; graceful degradation (no File System API, use download). |
| Data corruption | High | Low | Atomic writes; validate on load; rollback to last snapshot. |
| Time zone confusion (DST) | Low | Medium | Store UTC; display local with DST awareness; note in calendar exports. |
| User loses device | High | Low | Backup reminder; encourage pCloud/cloud storage; recovery via JSON import. |
| Merge conflicts (multi-device) | Medium | Medium | Default to "newest by updatedAt"; show conflicts; manual resolution. |

---

## 9. MVP Scope

### Must-Have (Launch Blockers)
- [x] Dashboard with project cards and re-entry prompts
- [x] Project Focus view (Why, Last Learned, Next Step)
- [x] Idea Garden (capture, archive, promote)
- [x] Learning Log (entries, weekly review card)
- [x] Settings (backup, import, calendar export)
- [x] JSON export/import (download, paste, preview, merge)
- [x] CSV exports (projects, logs, wins, ideas)
- [x] .ics export (per-project and all active, Sunday 8 PM UTC)
- [x] Mobile-first layout (bottom nav, FAB, responsive)
- [x] localStorage persistence with atomic writes
- [x] Basic keyboard navigation (tab, enter, esc)

### Nice-to-Have (Post-Launch)
- [ ] Web Share API for backups (mobile)
- [ ] File System Access API for Quick Backup (desktop/Android)
- [ ] Google Calendar "Add to Calendar" prefill links
- [ ] Swipe gestures on cards
- [ ] Dark mode
- [ ] Search/filter in Dashboard

### Phase 2 (After Validation)
- [ ] PWA (manifest, service worker, offline)
- [ ] Browser notifications (weekly review reminders)
- [ ] Google Calendar API (OAuth, true sync)
- [ ] Export to Apple Reminders (.ics with VTODO)
- [ ] Streaks and insights dashboard
- [ ] IndexedDB for resilience

### Phase 3 (Advanced)
- [ ] Encrypted backups (AES-GCM with passphrase)
- [ ] Collaborative features (share projects via link)
- [ ] Voice input (Web Speech API)
- [ ] Calendar view (visual timeline of reviews)

---

## 10. Success Criteria

### Quantitative Metrics
- **Re-entry rate**: ≥70% of active projects accessed within 7 days of last session.
- **Learning cadence**: ≥2 log entries per week per active project.
- **Review completion**: ≥80% of weekly reviews completed within 48 hours of due date.
- **Streaks**: ≥3 consecutive weeks of reviews (within first 6 weeks of use).
- **Data integrity**: 0 data loss incidents in routine use and import/export cycles.

### Qualitative Signals
- **Energy after re-entry**: Self-reported 1–3 scale trend improving over 4 weeks.
- **Purpose clarity**: Users can articulate project purpose from memory after 2+ weeks away.
- **Momentum perception**: Users report feeling progress (vs. task completion).

### Technical Health
- **Performance**: Initial load <2s on 3G; interaction latency <100ms.
- **Accessibility**: WCAG 2.1 AA compliance (keyboard nav, ARIA, contrast).
- **Browser support**: Works on Safari iOS 14+, Chrome Android 90+, desktop evergreens.

---

## 11. Implementation Phases

### Phase 0: Setup (1 day)
- [ ] Create GitHub repo `roys-ploy`
- [ ] Enable GitHub Pages (branch: `main`, root: `/`)
- [ ] Create file structure (HTML, CSS, JS stubs)
- [ ] Add Bulma via CDN, test responsive layout
- [ ] Commit and verify live at `<username>.github.io/roys-ploy`

### Phase 1: Core Data & Views (3–5 days)
- [ ] Implement `storage.js` (localStorage, migrations, atomic writes)
- [ ] Implement `models.js` (CRUD for projects, ideas, logs, wins)
- [ ] Build Dashboard view (project cards, filters, re-entry)
- [ ] Build Project Focus view (Why, Last Learned, Next Step, actions)
- [ ] Build Idea Garden view (capture, archive, promote)
- [ ] Build Learning Log view (entries, weekly review card)
- [ ] Implement hash routing and bottom nav

### Phase 2: Export & Calendar (2–3 days)
- [ ] JSON export (download, copy, Web Share if supported)
- [ ] JSON import (file picker, paste, preview, merge)
- [ ] CSV exports (4 files, RFC 4180 compliant)
- [ ] ICS generation (per-project, all active, Sunday 8 PM UTC)
- [ ] Google Calendar prefill link

### Phase 3: Polish & Testing (2–3 days)
- [ ] Keyboard shortcuts (/, n, g+d, ?)
- [ ] Mobile touch refinements (tap targets, swipe hints)
- [ ] Error handling (storage full, parse errors, validation)
- [ ] Backup reminders (last backup >14 days)
- [ ] Accessibility audit (ARIA, focus management, contrast)
- [ ] Cross-browser testing (Chrome, Safari, Firefox on mobile/desktop)

### Phase 4: Documentation & Launch (1 day)
- [ ] Write README (philosophy, quick start, backup strategy)
- [ ] Add inline help tooltips (?, info icons)
- [ ] Create demo/onboarding flow (optional)
- [ ] Announce and gather feedback

---

## 12. Open Questions & Decisions Locked

### Locked Decisions ✅
- Review default: Sunday 8:00 PM
- Time zone: store/export UTC; display local
- Calendar: .ics snapshots (re-export if cadence changes)
- Navigation: bottom nav + contextual FAB
- Import: file picker + paste JSON (first-class)
- ICS scope: per-project + all active
- Merge strategy: newest by updatedAt (default)

### Remaining Questions ❓
- [ ] Project title character limit? (Recommendation: 60 chars)
- [ ] Max active projects warning? (Recommendation: soft cap at 5, warn at 3+)
- [ ] Archive threshold for ideas/logs? (Recommendation: auto-archive ideas >90 days unused)
- [ ] Momentum algorithm weights? (Recommendation: logs=2, wins=1, reviews=3; decay=0.9/week)
- [ ] Dark mode in MVP? (Recommendation: defer to Phase 2; Bulma supports easily)

---

## 13. Technical Constraints & Validation

### Constraint: No Build Step
- ✅ **Feasible**: ES modules work natively in modern browsers; Bulma via CDN; no JSX/TS.
- ⚠️ **Trade-off**: No minification or tree-shaking; mitigated by keeping code small (<50 KB total JS).

### Constraint: GitHub Pages (Static Hosting)
- ✅ **Feasible**: Pure client-side app; hash routing works; HTTPS enabled.
- ⚠️ **Trade-off**: No server-side logic; all data processing in-browser.

### Constraint: localStorage Only (MVP)
- ✅ **Feasible**: 5–10 MB is sufficient for 50+ projects, 1000+ logs.
- ⚠️ **Trade-off**: Synchronous API; mitigated by debouncing and atomic writes.
- 📊 **Estimated size**: 1 project ~500 bytes, 1 log ~300 bytes → 50 projects + 500 logs ≈ 175 KB.

### Constraint: Mobile-First (Phone + Laptop)
- ✅ **Feasible**: Bulma is responsive; bottom nav and FAB are standard patterns.
- ⚠️ **Trade-off**: Touch/hover duality; mitigated by large tap targets and progressive enhancement.

### Constraint: Web Share API (Mobile)
- ✅ **Feasible**: Supported on mobile Safari/Chrome; feature detection required.
- ⚠️ **Trade-off**: Desktop Chrome/Edge have limited support; fallback to download/copy.

### Constraint: File System Access API
- ✅ **Feasible**: Chrome/Edge desktop, some Android browsers.
- ⚠️ **Trade-off**: Not on iOS Safari; fallback to download.

### Constraint: ICS with Recurrence
- ✅ **Feasible**: RFC 5545 is well-supported; RRULE for weekly recurrence.
- ⚠️ **Trade-off**: VTIMEZONE adds complexity for DST; defer to Phase 2.

---

## 14. Definition of Done

### For MVP Launch
- [ ] All must-have features implemented and tested.
- [ ] Works on Safari iOS 14+, Chrome Android 90+, desktop Chrome/Firefox/Safari.
- [ ] Backup/restore round-trip tested (no data loss).
- [ ] CSV exports open correctly in Excel/Google Sheets.
- [ ] ICS imports successfully into Google Calendar/Apple Calendar.
- [ ] Keyboard navigation works for core flows.
- [ ] README published with quick start and philosophy summary.
- [ ] GitHub Pages live and accessible.

### For Each Feature
- [ ] Code written, tested manually on mobile and desktop.
- [ ] Error cases handled gracefully (user-facing messages).
- [ ] Accessibility checked (keyboard, ARIA, focus management).
- [ ] Performance acceptable (<100ms interaction, <2s load).

---

## Appendix A: Example Data

### Sample Project
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Build Roy's Ploy",
  "purpose": "Create a tool that honors my strengths and helps me sustain long-term projects without draining my energy.",
  "values": ["Connectedness", "Learner", "Developer"],
  "beneficiaries": ["Myself", "Future users with similar profiles"],
  "status": "active",
  "cadence": {
    "type": "weekly",
    "dayOfWeek": 0,
    "timeUTC": "20:00"
  },
  "nextStep": "Finalize the data model and begin implementation of storage.js",
  "lastReviewAt": "2025-10-22T20:00:00.000Z",
  "createdAt": "2025-10-15T14:30:00.000Z",
  "updatedAt": "2025-10-29T18:00:00.000Z"
}
```

### Sample Learning Log Entry
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "projectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "learned": "Web Share API is perfect for mobile backup workflows; it's simpler than I thought.",
  "nextExcited": "Implementing the ICS generation and seeing my reviews show up in Google Calendar.",
  "impactNote": "This insight will make backup/restore effortless on my phone.",
  "createdAt": "2025-10-29T19:45:00.000Z"
}
```

### Sample Win
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "projectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "kind": "milestone",
  "note": "Completed the technical plan and validated feasibility with GitHub Copilot.",
  "createdAt": "2025-10-29T20:00:00.000Z"
}
```

---

## Appendix B: Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `/` | Focus search | Dashboard |
| `n` | New project/idea/log | Context-aware |
| `g` then `d` | Go to Dashboard | Global |
| `g` then `g` | Go to Garden | Global |
| `g` then `l` | Go to Log | Global |
| `g` then `s` | Go to Settings | Global |
| `?` | Show help overlay | Global |
| `Esc` | Close modal/focus | Global |
| `Enter` | Confirm action | Forms/modals |
| `Tab` / `Shift+Tab` | Navigate focusables | Global |

---

## Appendix C: Color & Theme

### Bulma Defaults (Light Mode)
- Primary: `#00d1b2` (teal)
- Link: `#3273dc` (blue)
- Success: `#48c774` (green)
- Warning: `#ffdd57` (yellow)
- Danger: `#f14668` (red)

### Custom Accents
- Purpose/Why: soft purple `#b794f6`
- Learning: soft blue `#90cdf4`
- Momentum: gradient teal-to-green

### Accessibility
- Contrast ratio ≥4.5:1 (WCAG AA)
- Focus indicators: 2px solid outline
- Color not sole indicator (use icons, text)

---

**End of Plan v1**

_Next step: Feasibility review, then proceed to implementation._
