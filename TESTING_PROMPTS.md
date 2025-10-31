# Quick Testing Guide: Prompts Feature

## Test Sequence

### 1. Settings: Strengths & Support (5 minutes)
1. Open Roy's Ploy → Go to Settings
2. Scroll to "Strengths & Support" section
3. **Add Strengths:**
   - Type "Systems thinking" → Click +
   - Type "Visual communication" → Click +
   - Type "Technical writing" → Click +
4. **Add Support Needs:**
   - Type "Accountability partner" → Click +
   - Type "Technical mentorship" → Click +
5. **Add Accountability:**
   - Name: "Alex Johnson"
   - Contact: "alex@example.com"
6. Click **Save**
7. ✅ Verify: Toast shows "Saved strengths, support, and accountability"
8. Reload page → ✅ Verify: All data persists

### 2. Focus: Practice Strengths & Partner Needs (5 minutes)
1. Go to Dashboard → Click a project
2. ✅ Verify: See "Want to practice specific strengths..." link
3. Click link or "Edit" button
4. **In modal:**
   - Check "Systems thinking"
   - Check "Visual communication"
   - Under Partner Needs, check "Technical mentorship"
5. Click **Save**
6. ✅ Verify: Chips now show:
   - Practice Strengths: Systems thinking, Visual communication
   - Partner Needs: Technical mentorship
7. Reload page → ✅ Verify: Chips still visible
8. Click **Edit** → Change selections → Save
9. ✅ Verify: Chips update

### 3. Quarterly Plan Creation (5 minutes)
1. From Dashboard, click "**View quarterly plan**" link (small grey text above projects)
2. ✅ Verify: Modal opens with "No quarterly plans yet"
3. Click **New Plan**
4. **Fill form:**
   - Quarter Label: "Q1 2025"
   - Goals: "Launch MVP, onboard 10 beta users, establish feedback loop"
   - Success Looks Like: "5 users actively using daily, positive feedback on core features"
   - Risks: "Scope creep, burnout, competing priorities"
   - Support Plan: "Weekly check-ins with Alex, daily 1-hour focused work block, monthly retrospectives"
   - ✅ Check "Mark as current quarter"
5. Click **Copy Summary** → ✅ Verify: Clipboard has text
6. Click **Save**
7. ✅ Verify: Modal closes, toast shows "Quarterly plan saved!"

### 4. Quarterly Plan Access (3 minutes)
1. **From Focus page:** Click "View quarterly plan" link
   - ✅ Verify: Modal shows Q1 2025 plan with "Current" tag
2. Click **View** (eye icon)
   - ✅ Verify: Read-only view with all fields
3. Click **Close** → Click **Edit** (pencil icon)
   - ✅ Verify: Can modify fields
4. **From Log page:** Click "View quarterly plan" link
   - ✅ Verify: Same modal, same data
5. **From Dashboard:** Click "View quarterly plan" link
   - ✅ Verify: Consistent behavior

### 5. Quarterly Plan Management (3 minutes)
1. In prompts list modal, click **New Plan**
2. Create "Q2 2025" plan (don't mark as current)
3. Click **Save**
4. ✅ Verify: List shows both plans, Q1 marked as current
5. Click **Mark current** (check icon) on Q2 2025
6. ✅ Verify: Q2 now has "Current" tag, Q1 doesn't
7. Click **Delete** (trash icon) on Q1
8. Confirm deletion
9. ✅ Verify: Q1 removed from list

### 6. Backup & Import (3 minutes)
1. Go to Settings → Click **Download JSON**
2. ✅ Verify: File downloads
3. Open file in text editor
4. ✅ Verify: Contains:
   - `"quarterlyReflections"` array
   - `"strengths"` array in settings
   - `"supportNeeds"` array in settings
   - `"accountability"` object in settings
5. Delete all quarterly plans
6. Settings → Import the backup
7. ✅ Verify: Quarterly plans restored
8. ✅ Verify: Strengths/support restored

### 7. Edge Cases (2 minutes)
1. **Test limits:**
   - Settings: Try to add 11th strength → ✅ Toast: "Limit reached"
   - Focus: Try to check 4 practice strengths → ✅ Alert: "Please select up to 3"
2. **Empty states:**
   - Create new project → Go to Focus → ✅ See "Add them here" link
   - Delete all quarterly plans → Click view link → ✅ See "No quarterly plans yet"
3. **No global data:**
   - Settings: Remove all strengths/support
   - Focus: Click edit → ✅ Modal shows "Go to Settings" link

## Expected Behavior Summary

✅ **Settings:**
- Can add/remove up to 10 strengths
- Can add/remove up to 10 support needs
- Can save accountability partner
- All persists across reloads

✅ **Focus Page:**
- Shows chips for selected strengths/needs
- Modal allows up to 3 selections each
- Graceful when no global data exists
- Persists across reloads

✅ **Quarterly Prompts:**
- Accessible from Dashboard, Focus, Log
- Create/edit/view/delete plans
- Copy summary to clipboard
- Only one marked as current
- Sorted by most recent

✅ **Data Persistence:**
- Export includes all new fields
- Import merges correctly
- Backup restores everything

## Quick Validation (30 seconds)
1. Open DevTools Console (F12)
2. Run: `Storage.loadState()`
3. ✅ Verify output includes:
   - `quarterlyReflections: [...]`
   - `settings.strengths: [...]`
   - `settings.supportNeeds: [...]`
   - `settings.accountability: {...}`
4. Check projects array
5. ✅ Verify projects have:
   - `practiceStrengths: [...]`
   - `partnerNeeds: [...]`

## Common Issues & Fixes

**Issue:** Link doesn't appear
- **Fix:** Reload page, check console for errors

**Issue:** Modal doesn't open
- **Fix:** Check `prompts.js` is loaded in HTML file

**Issue:** Data doesn't persist
- **Fix:** Check localStorage, verify `Storage.saveState()` called

**Issue:** Limit not enforced
- **Fix:** Check validation in event handlers

## Success Criteria
- ✅ No console errors
- ✅ All UI elements render
- ✅ All actions trigger appropriate feedback (toasts/alerts)
- ✅ Data persists across reloads
- ✅ Backup/restore works correctly
- ✅ Links accessible from all specified pages

## Time Estimate
- **Full test:** ~25 minutes
- **Quick smoke test:** ~5 minutes (just test one of each feature)
- **Regression:** ~10 minutes (verify existing features still work)

---

**Ready to use!** All features implemented, tested, and documented.
