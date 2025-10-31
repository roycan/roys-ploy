# Plan: Quarterly Prompts, Strengths, and Support Needs

## Goals
- Help you translate long-term intent into steady progress with fast, on-demand prompts.
- Make strengths intentional per project and clarify partner needs (formerly “weaknesses”).
- Keep it optional, lightweight, and fully under your control (no cadence, no reminders).

## Scope (MVP)
- Global Quarterly Reflection(s), one marked current.
- Settings: up to 10 strengths and up to 10 support needs, plus an accountability partner (name + optional contact).
- Per-project selections (optional): up to 3 Practice Strengths and up to 3 Partner Needs chosen from Settings lists.
- Prompts available on demand from Dashboard, Focus, and Log.
- Export/import support for all new data.

Non-goals (for now):
- No reminders, notifications, or automated cadences.
- No per-project reflection wizard (only selections). The Global reflection is the primary reflection artifact.
- No partner-matching or sharing integrations beyond simple copy-to-clipboard.

## Terminology
- Strengths: up to 10 personal strengths you want to use intentionally.
- Support Needs (recommended name): up to 10 areas where partner support accelerates progress (alternative labels: “Growth areas” or “Constraints”).
- Practice Strengths (per-project): selected subset of strengths to consciously practice for a given project (≤3).
- Partner Needs (per-project): selected subset of support needs that a collaborator should complement (≤3).

## Data Model
Additions are designed to remain backward compatible and export/import friendly.

Top-level state (new fields shown):
```jsonc
{
  "version": 1,
  "projects": [
    {
      "id": "p_123",
      "title": "Project X",
      "practiceStrengths": ["Learner", "Strategic"],          // optional, ≤3
      "partnerNeeds": ["Focus", "Delegation"],                // optional, ≤3
      // ...existing project fields
    }
  ],
  "settings": {
    // existing settings...
    "strengths": ["Learner", "Strategic", "Relator"],         // ≤10
    "supportNeeds": ["Focus", "Finisher", "Delegation"],       // ≤10
    "accountability": { "name": "Alex", "contact": "@alex" } // optional contact
  },
  "quarterlyReflections": [
    {
      "id": "qr_2025q4",
      "periodLabel": "2025 Q4", // freeform e.g. “SY25 Term 2”
      "primaryGoal": "Ship portfolio v2 and collect 3 case studies",
      "strengthsUsed": ["Learner", "Strategic"],
      "obstacles": "Context switching, perfectionism",
      "strategies": "Batch work, timeboxing, good-enough standards",
      "environmentSchedulePlan": "AM focus blocks + no Slack until noon",
      "accountabilitySnapshot": { "name": "Alex", "contact": "@alex" },
      "isCurrent": true,
      "createdAt": "2025-10-01T12:00:00.000Z",
      "updatedAt": "2025-10-01T12:00:00.000Z"
    }
  ]
}
```

Notes:
- Per-project selections are simple arrays of strings; they reference Settings strings by value (for resilience if Settings change later).
- `quarterlyReflections` is a top-level array so it can be used across all projects.

## UX Integration
- Dashboard
  - If a current Quarterly Reflection exists: show a small card with the Primary Goal and 1–2 Practice Strength chips; button: “Open Prompts”.
  - If none: a subtle “Set quarterly plan” link (non-sticky; ignorable).
- Focus page
  - In header/actions area: small inline chips: “Practice strengths: […] • Partner needs: […]” with an Edit link.
  - Tiny link: “Prompts” to open the reflection wizard on-demand.
  - Optional: “Copy partner brief” link.
- Log page
  - In header near filters: “Prompts” button (on-demand) and optional “Partner brief” link.
- Settings
  - “Strengths & Support Needs” section: manage up to 10 of each.
  - “Quarterly Planning” section: create/edit reflections, mark one as current, view history.

## Prompts Wizard (on-demand, no cadence)
Single lightweight modal (1–2 screens):
- Period label (freeform), toggle “Mark as current”.
- Primary development goal (textarea; a sentence or two).
- Which strengths I’ll use (multi-select from Settings; allow freeform add).
- Obstacles and Strategies (one textarea is fine for MVP).
- Accountability (prefilled from Settings; editable snapshot).
- Environment & schedule plan (textarea).
- Actions: Save Plan, Copy Summary, Close.

Copy Summary format (example):
```
Period: 2025 Q4
Primary goal: Ship portfolio v2 and collect 3 case studies
Practice strengths: Learner, Strategic
Obstacles → Strategies: Context switching → Batch work & timeboxing
Environment & schedule: Morning deep work; no Slack before noon
Accountability: Alex (@alex)
```

## Import/Export Considerations
- Export: current Export JSON already serializes the full state, so new fields will be included automatically.
- Import (merge): 
  - Settings merge already handles new keys (strengths, supportNeeds, accountability) via spread.
  - Projects merge will carry per-project selections naturally.
  - Add one small update to `Storage.mergeDocuments` to merge `quarterlyReflections` (by `id`, newest wins). Otherwise, they’d be lost in ‘newest’ merge. Overwrite strategy already preserves them.
- Import preview: optional enhancement to show `quarterlyReflections` count; not required for MVP.

## Performance & Storage
- Negligible footprint (strings only, tiny arrays). Well within localStorage limits.
- No timers/reminders; zero background work.

## Rollout Steps
1. Data layer: add settings fields, per-project selections, and `quarterlyReflections` to default state and merge logic.
2. Settings UI: manage strengths, support needs, accountability.
3. Prompts wizard modal: create/edit reflections, mark current, copy summary.
4. Surfacing: add on-demand links/buttons to Dashboard, Focus, Log.
5. Optional niceties: chips, partner brief copy, import preview count.

## Acceptance Criteria
- I can save up to 10 strengths and up to 10 support needs in Settings.
- I can set an accountability partner (name + optional contact).
- I can create a quarterly reflection with a custom period label and mark it current.
- I can open prompts from Dashboard/Focus/Log on demand.
- I can select up to 3 practice strengths and up to 3 partner needs on a project and see them on Focus.
- JSON export includes all new data; import with ‘overwrite’ preserves it; import with ‘newest’ preserves it after merge update.
- No reminders or cadence anywhere.

## Risks and Mitigations
- Risk: Import merge drops `quarterlyReflections` in ‘newest’ mode → Mitigate: add merge for that array.
- Risk: Prompt fatigue if over-surfaced → Keep access on-demand and subtle.
- Risk: Confusion around terms → Use “Support needs” in Settings; “Partner needs” on projects.

## Feasibility
- Effort: Low. Estimated 4–6 hours total for MVP wiring (data additions, simple modals, and small UI affordances).
- Compatibility: Backward compatible; current validation will not break when new fields are present.
- Required technical changes:
  - Add `quarterlyReflections` to default state and to merge logic.
  - Wire small Settings section and a modal; add light links in pages.
  - Optional: partner brief compose helper and import preview count.
- Confidence: 95%+.

## Future (optional)
- Per-project reflection notes (one short field) referencing the current plan.
- Soft suggestions in weekly review if no current plan is set (still non-blocking).
- Tagging/filters for strengths across projects.
- Export CSV for reflections.
