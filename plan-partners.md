# Plan: Per-Project Support Partners

## Objective
Enable each project to have up to 3 named support partners, each optionally linked to one or more of your support needs. This makes your support network actionable and visible per project, helping you address weaknesses and leverage complementary strengths.

## Data Model
- **Project field:**
  - `supportPartners: [
      { name: string, contact?: string, helpsWith?: string[], notes?: string }
    ]` (max 3 per project)
- **Settings:**
  - Global support needs list remains in Settings
- **No changes to global accountability partner (remains optional, for general use)**

## UX Integration
- **Focus Page:**
  - Show chips/cards for each support partner, displaying name, optional contact, and any linked support needs (as chips)
  - "Edit Partners" button/modal allows adding, editing, or removing up to 3 partners per project
  - In modal: For each partner, enter name (required), contact (optional), select 0+ support needs (from your global list), and add notes (optional)
  - Remove partner at any time
- **Prompts Modal:**
  - Optionally show current project's partners in a "Who can help?" section for reference
- **No reminders or notifications**
- **No invite/notify feature**

## Export/Import
- Partners are included in project data for backup/export/import
- No changes needed to merge logic (partners are per-project, merged with project)

## Acceptance Criteria
- Can add up to 3 support partners per project
- Can edit or remove any partner at any time
- Can link each partner to 0 or more support needs (from Settings)
- All fields optional except name
- Partners are visible on Focus page and in prompts modal
- All data persists and is included in backup/export/import
- No reminders, notifications, or sharing/invite features

## Feasibility Check
- **Storage:**
  - Add `supportPartners` array to project model (default empty array)
  - No migration needed; new projects get empty array, old projects tolerate missing field
- **Models:**
  - Add CRUD helpers for partners (add, edit, remove)
  - Update project update logic to handle partners
- **UI:**
  - Focus page: Add section for partners, chips/cards display, and edit modal
  - Modal: Add/edit/remove partners, select support needs, notes
  - Prompts modal: Optionally display partners for current project
- **Import/Export:**
  - Already handled as part of project object
- **Validation:**
  - Enforce max 3 partners per project
  - Name required, other fields optional
- **Risks:**
  - Minimal; fits existing architecture and UI patterns
  - No impact on existing data or workflows

**Feasibility: HIGH**
- No major technical or UX blockers
- All requirements fit current codebase and design
- Can be implemented incrementally

---

## Next Steps
- [ ] Update project model and storage
- [ ] Add CRUD helpers for partners
- [ ] Build Focus page UI (chips/cards, edit modal)
- [ ] Integrate with prompts modal (optional)
- [ ] Test export/import
