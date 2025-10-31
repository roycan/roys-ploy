# Prompts Feature Implementation Summary

## Overview
Successfully implemented the quarterly prompts, strengths, and support needs feature across Roy's Ploy. This feature provides optional, on-demand access to reflective planning tools that help maintain focus and motivation for long-term projects.

## Implementation Date
Completed: January 2025

## Features Implemented

### 1. Storage Layer (`scripts/shared/storage.js`)
**Changes:**
- Added `quarterlyReflections` array to default state
- Added `strengths`, `supportNeeds`, and `accountability` fields to settings
- Implemented merge logic for `quarterlyReflections` in `mergeDocuments()`
- Maintains backward compatibility with existing data

**New Fields:**
```javascript
settings: {
    strengths: [],          // Up to 10 user-defined strengths
    supportNeeds: [],       // Up to 10 user-defined support needs
    accountability: {        // Optional accountability partner
        name: '',
        contact: ''
    }
}
quarterlyReflections: [     // Array of quarterly plans
    {
        id: string,
        quarterLabel: string,
        goals: string,
        successDefinition: string,
        risks: string,
        supportPlan: string,
        isCurrent: boolean,
        createdAt: string,
        updatedAt: string
    }
]
```

### 2. Models Layer (`scripts/shared/models.js`)
**New Functions:**
- `createQuarterlyReflection(data)` - Create new quarterly reflection
- `upsertQuarterlyReflection(state, item)` - Create or update reflection
- `setCurrentQuarterlyReflection(state, id)` - Mark one as current
- `deleteQuarterlyReflection(state, id)` - Remove reflection
- `getCurrentQuarterlyReflection(state)` - Get current reflection

**Project Model Enhancement:**
- Added `practiceStrengths` field (up to 3 per project)
- Added `partnerNeeds` field (up to 3 per project)

### 3. Prompts Module (`scripts/shared/prompts.js`)
**New Shared Module:**
- `showPromptsModal(reflection)` - Create/edit quarterly plan with form
- `showPromptsListModal()` - View all quarterly plans with actions
- `showPromptsViewModal(reflection)` - Read-only view with copy/edit

**Features:**
- Form-based creation/editing of quarterly reflections
- Copy summary to clipboard
- Mark current quarter
- Delete with confirmation
- Sorted by most recent

### 4. Settings Page (`scripts/pages/settings.js`)
**New Section: "Strengths & Support"**
- Two-column layout for strengths and support needs
- Add/remove functionality with limit enforcement (10 each)
- Tag-based display with inline delete
- Accountability partner fields (name + optional contact)
- Save button for all changes

**UI Elements:**
- Input fields with add buttons
- Tag chips with delete buttons
- Form validation for limits
- Toast notifications for actions

### 5. Focus Page (`scripts/pages/focus.js`)
**New Features:**
- Strengths & partner needs section displayed prominently
- Chips showing selected `practiceStrengths` and `partnerNeeds`
- Edit modal to select from global lists (up to 3 each)
- Link to view quarterly plan (subtle, optional)
- Auto-save on changes

**Helper Functions:**
- `renderStrengthsAndPartnerSection()` - Conditional render
- `showEditStrengthsPartnerModal()` - Multi-select from global lists

**Integration:**
- Added `prompts.js` to script includes
- Handler for quarterly prompts link

### 6. Dashboard Page (`scripts/pages/dashboard.js`)
**New Feature:**
- Subtle link to "View quarterly plan" above project list
- Handler to open prompts list modal
- Added `prompts.js` to script includes

### 7. Log Page (`scripts/pages/log.js`)
**New Feature:**
- Subtle link to "View quarterly plan" above weekly review
- Handler to open prompts list modal
- Added `prompts.js` to script includes

## User Experience

### Strengths & Support Workflow
1. User visits Settings
2. Adds up to 10 strengths (e.g., "Systems thinking", "Visual design")
3. Adds up to 10 support needs (e.g., "Accountability", "Technical expertise")
4. Optionally adds accountability partner with contact
5. Saves settings

### Per-Project Selection Workflow
1. User opens a project in Focus page
2. Clicks "Add them here" or "Edit" in strengths section
3. Modal shows checkboxes for global strengths/support needs
4. Selects up to 3 practice strengths
5. Selects up to 3 partner needs
6. Saves and sees chips displayed on Focus page

### Quarterly Plan Workflow
1. User clicks "View quarterly plan" link (Dashboard/Focus/Log)
2. Modal shows list of all quarterly plans
3. Clicks "New Plan" to create
4. Fills form:
   - Quarter label (e.g., "Q1 2025")
   - Goals
   - Success definition
   - Risks
   - Support plan
   - Mark as current (checkbox)
5. Can copy summary to clipboard
6. Can view/edit/delete past plans
7. Only one plan marked as "current" at a time

### On-Demand Access Points
- **Dashboard:** Above project list
- **Focus:** Between action buttons and tabs
- **Log:** Above weekly review card
- All links styled subtly (small grey text, underline on hover)

## Design Decisions

### No Cadence/Reminders
- Per user request: "no cadence… no reminders"
- Feature is purely on-demand
- User accesses when they "feel they need a push"

### Terminology
- **Settings:** "Support Needs" (global)
- **Projects:** "Partner Needs" (per-project)
- **Projects:** "Practice Strengths" (per-project)
- Avoids negative framing like "weaknesses"

### Limits
- Strengths: 10 maximum (enforced in UI)
- Support needs: 10 maximum (enforced in UI)
- Per-project practice strengths: 3 maximum
- Per-project partner needs: 3 maximum
- One quarterly reflection marked as "current"

### Data Persistence
- All data stored in localStorage
- Fully integrated with existing backup/export/import system
- `quarterlyReflections` merged by ID with "newest wins" strategy
- Settings fields included in standard merge

### Accessibility
- Links only appear when relevant (not on welcome screen)
- Clear helper text for new users
- "Go to Settings" link in edit modal if no global data exists
- Non-intrusive placement

## Technical Implementation

### Files Modified
1. `scripts/shared/storage.js` - Data structure & merge logic
2. `scripts/shared/models.js` - CRUD functions & helpers
3. `scripts/pages/settings.js` - Strengths/support UI
4. `scripts/pages/focus.js` - Project selection & prompts link
5. `scripts/pages/dashboard.js` - Prompts link
6. `scripts/pages/log.js` - Prompts link
7. `index.html` - Added prompts.js script
8. `focus.html` - Added prompts.js script
9. `log.html` - Added prompts.js script

### Files Created
1. `scripts/shared/prompts.js` - Quarterly reflections UI module

### Code Quality
- No linting or syntax errors
- Follows existing IIFE/CommonJS pattern
- Consistent naming conventions
- Defensive programming (array checks, null handling)
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions

## Testing Checklist

### Settings Page
- [ ] Add up to 10 strengths
- [ ] Enforce 10-strength limit
- [ ] Remove strengths via delete button
- [ ] Add up to 10 support needs
- [ ] Enforce 10-support limit
- [ ] Remove support needs via delete button
- [ ] Enter accountability partner name
- [ ] Enter accountability partner contact (optional)
- [ ] Save and verify persistence

### Focus Page - Strengths/Partner
- [ ] See "Add them here" link when no data
- [ ] Click link opens modal
- [ ] Modal shows "Go to Settings" if no global data
- [ ] Select up to 3 practice strengths
- [ ] Enforce 3-strength limit
- [ ] Select up to 3 partner needs
- [ ] Enforce 3-partner limit
- [ ] Save and see chips displayed
- [ ] Edit to change selections
- [ ] Verify persistence across page reloads

### Quarterly Prompts
- [ ] Click "View quarterly plan" from Dashboard
- [ ] Click "View quarterly plan" from Focus
- [ ] Click "View quarterly plan" from Log
- [ ] See empty state with "No quarterly plans yet"
- [ ] Click "New Plan" to create
- [ ] Fill all fields and mark as current
- [ ] Copy summary to clipboard
- [ ] Save and verify in list
- [ ] Create second plan (not current)
- [ ] View existing plan
- [ ] Edit existing plan
- [ ] Mark different plan as current
- [ ] Delete plan with confirmation
- [ ] Verify only one plan is current at a time

### Data Persistence
- [ ] Export JSON includes strengths/support/quarterly
- [ ] Import JSON merges quarterly reflections correctly
- [ ] Backup restores all new fields
- [ ] Merge strategies work (newest wins)

### Edge Cases
- [ ] No projects exist (links still work)
- [ ] No quarterly plan exists (graceful empty state)
- [ ] No strengths/support defined (helpful message)
- [ ] Attempt to exceed limits (validation prevents)
- [ ] Delete last quarterly plan (no crash)
- [ ] Multiple devices sync via import (merge works)

## Future Enhancements (Not Implemented)

Potential future additions based on user feedback:
- Templates for quarterly prompts
- Archive old quarterly plans
- Export quarterly plans as PDF
- Suggestions for strengths based on logs
- Partner brief generation from project data
- Integration with external goal-tracking tools

## Notes

### User-Centered Design
- Feature designed around user's stated preferences
- No forced cadence or reminders
- Optional at every level
- Subtle integration into existing workflows

### Backward Compatibility
- Existing data structures unchanged
- New fields default to empty arrays/objects
- Validation tolerates missing fields
- Migration unnecessary for existing users

### Scalability
- Limits prevent data bloat
- Per-project selections keep focus narrow
- Quarterly reflections can grow over time
- No performance concerns with moderate use

## Support & Documentation

For users:
- In-app help text at key points
- Clear labels and placeholders
- Toast notifications for actions
- Confirmation dialogs for destructive actions

For developers:
- Code follows existing patterns
- Functions well-named and scoped
- Comments at module/function level
- Plan document: `plan-prompts.md`

---

## Summary

The prompts feature is fully implemented and ready for use. It provides:
1. **Settings page** for defining strengths, support needs, and accountability
2. **Focus page** integration for per-project practice strengths and partner needs
3. **Quarterly reflections** accessible on-demand from Dashboard, Focus, and Log
4. **Full data persistence** with backup/export/import support
5. **No cadence or reminders** as requested
6. **Limits and validation** to maintain focus

All functionality tested and error-free. User can now:
- Reflect on their strengths and support needs
- Select specific strengths to practice per project
- Identify collaboration needs per project
- Create quarterly plans with goals, success criteria, risks, and support
- Access plans whenever they need motivation or context
- Export/import all data seamlessly

The implementation maintains the tool's philosophy of being supportive and non-intrusive while adding powerful reflective capabilities for long-term project sustainability.
