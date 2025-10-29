# Testing Guide for Roy's Ploy

## Pre-Launch Checklist

### 1. Initial Load
- [ ] App loads without errors
- [ ] Welcome screen appears on first visit
- [ ] "Create Your First Project" button is visible
- [ ] Bottom navigation is hidden on desktop, visible on mobile
- [ ] FAB (+ button) appears in bottom right

### 2. Create First Project
- [ ] Click "Create Your First Project" or FAB
- [ ] Modal opens with form
- [ ] Fill in: Title, Purpose (required), Beneficiaries (optional), Next Step (optional)
- [ ] Click "Create Project"
- [ ] Redirects to Project Focus view
- [ ] Project appears on Dashboard when returning

### 3. Dashboard Features
- [ ] Project cards display correctly
- [ ] Status badges show (active/paused/done)
- [ ] Filters work (Active, Paused, Done, All)
- [ ] Click project card navigates to Focus view
- [ ] Re-entry card appears after simulating time gap (check localStorage date)

### 4. Project Focus View
- [ ] Back button returns to Dashboard
- [ ] "Why This Matters" section displays purpose and beneficiaries
- [ ] "Last Learned" shows empty or most recent log
- [ ] "Next Step" field is editable and auto-saves on blur
- [ ] "Add Learning" button opens modal
- [ ] "Celebrate a Win" button opens modal
- [ ] "Export to Calendar" downloads .ics file
- [ ] "Change Status" dropdown shows options
- [ ] Tabs switch between Learning Log and Wins

### 5. Learning Log
- [ ] Add Learning modal validates required fields
- [ ] Learning entry is created and appears in list
- [ ] Entries group by month
- [ ] Filter by project works
- [ ] Weekly review card appears for overdue projects
- [ ] FAB on Log view opens Add Learning modal

### 6. Idea Garden
- [ ] Capture idea via FAB or modal
- [ ] Ideas display with project tags (if assigned)
- [ ] "Promote to Project" creates new project
- [ ] "Assign to Project" moves idea to project
- [ ] "Archive" hides idea from active view
- [ ] Archived filter shows archived ideas
- [ ] Unarchive restores idea

### 7. Settings & Backup
- [ ] "Download Backup (JSON)" triggers file download
- [ ] "Copy Backup" copies JSON to clipboard
- [ ] "Share Backup" works on mobile (if Web Share supported)
- [ ] Import from file works (choose .json file)
- [ ] Import from paste works (paste JSON text)
- [ ] Import preview shows counts and conflicts
- [ ] CSV exports download (Projects, Logs, Wins, Ideas)
- [ ] "Download All Active Reviews (.ics)" downloads calendar file
- [ ] Settings changes persist (review day, time, backup reminder)

### 8. Calendar Integration
- [ ] Per-project .ics exports from Focus view
- [ ] All active reviews .ics exports from Settings
- [ ] .ics files import into Google Calendar/Apple Calendar correctly
- [ ] Recurrence (weekly) is set properly
- [ ] Event times are in UTC (check if local display is correct)

### 9. Status Changes
- [ ] Changing status to Paused prompts for reflection note
- [ ] Changing status to Done prompts for reflection note
- [ ] Paused projects don't show review reminders
- [ ] Done projects are filtered correctly
- [ ] Reactivating project works

### 10. Mobile Responsiveness
- [ ] Bottom nav is visible and functional
- [ ] FAB is accessible (not blocked by nav)
- [ ] All tap targets are ≥44px
- [ ] Forms are usable (inputs don't zoom on iOS)
- [ ] Modals fit on small screens
- [ ] Horizontal scrolling is avoided

### 11. Data Persistence
- [ ] Refresh page - data persists
- [ ] Close tab, reopen - data persists
- [ ] localStorage shows `rp:v1:doc` key
- [ ] Export → clear data → import → data restored

### 12. Error Handling
- [ ] Invalid JSON import shows error message
- [ ] Required fields show validation
- [ ] Storage quota warnings (if testable)
- [ ] Missing project (bad URL) shows friendly error

### 13. Keyboard Navigation
- [ ] Tab through buttons and inputs
- [ ] Enter submits forms
- [ ] Escape closes modals
- [ ] Focus indicators are visible

### 14. Accessibility
- [ ] Screen reader friendly (ARIA labels on custom components)
- [ ] Color contrast passes WCAG AA
- [ ] All icons have text labels or aria-labels
- [ ] Modals trap focus properly

## Known Limitations (MVP)

- No keyboard shortcuts (g+d, etc.) - Phase 2
- No dark mode - Phase 2
- No PWA offline support - Phase 2
- No Google Calendar API sync - Phase 2
- No encryption on backups - Phase 3
- Time zone handling: UTC only, no VTIMEZONE - will show time shifts around DST

## Browser-Specific Tests

### Desktop Chrome/Edge
- [ ] File System Access API for Quick Backup (if implemented)
- [ ] All core features work

### Desktop Safari
- [ ] All core features work
- [ ] File picker works for import

### Desktop Firefox
- [ ] All core features work

### Mobile Safari (iOS)
- [ ] Bottom nav works
- [ ] FAB accessible
- [ ] Web Share API works for backup
- [ ] Paste JSON import works (file picker is awkward)

### Mobile Chrome (Android)
- [ ] Bottom nav works
- [ ] FAB accessible
- [ ] Web Share API works
- [ ] File System Access may work on some devices

## Performance Checks

- [ ] Initial load < 2s on 3G
- [ ] Interaction latency < 100ms
- [ ] Dashboard renders 50 projects smoothly
- [ ] Learning Log renders 500 entries smoothly (with pagination/virtual scroll if needed)

## Smoke Test Script (Quick Validation)

1. Open app → See welcome screen
2. Create project "Test Project" with purpose "Testing the app"
3. Add learning: "Learned that the app works"
4. Celebrate win: "First project created"
5. Go to Garden → Capture idea "Future feature idea"
6. Promote idea to new project
7. Go to Settings → Download backup
8. Clear localStorage (Dev Tools)
9. Import backup → Verify all data restored
10. Export Projects CSV → Open in Excel/Sheets

If all steps complete without errors, **MVP is ready to ship!** 🚀

## Deployment Steps

1. Push to GitHub
2. Enable GitHub Pages (Settings → Pages → Deploy from main, root /)
3. Wait ~2 minutes for build
4. Visit `https://<username>.github.io/roys-ploy`
5. Test on mobile device (use actual phone, not just DevTools)
6. Share with friends for beta feedback!

## Post-Launch Monitoring

- Watch for localStorage quota issues (unlikely with current data model)
- Gather feedback on UX pain points
- Track feature requests for Phase 2
- Monitor browser console for unexpected errors

---

**Happy Testing!** 🎉
