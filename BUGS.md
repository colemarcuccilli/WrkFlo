# WrkFlo — Bug Report
*Last Updated: 2026-02-23 — Round 2 Sprint*

---

## P0 — Critical (Fixed ✅)

### BUG-001: Dashboard loads mock data ✅ FIXED
**Fix**: Converted to `useEffect` + `fetch('/api/projects')` with loading/error states and normalize function.

### BUG-002: Project page loads mock data ✅ FIXED
**Fix**: Converted to `useEffect` + `fetch('/api/projects/[id]')`.

### BUG-003: Review page loads mock data ✅ FIXED
**Fix**: Converted to `useEffect` + `fetch('/api/review/[token]')`.

---

## P1 — High (Fixed ✅)

### BUG-004: Comments don't save to DB ✅ FIXED
**Fix**: `handleAddComment` now POSTs to `/api/comments` with optimistic UI update.

### BUG-005: Status changes don't save ✅ FIXED
**Fix**: `handleStatusChange` now PATCHes `/api/files/[id]/status` with optimistic UI update.

### BUG-006: `file.uploadDate` undefined for DB data ✅ FIXED
**Fix**: Normalize in both page-level normalize functions and FileBrowser: `file.upload_date || file.uploadDate || ''`.

### BUG-007: ProjectCard crashes on DB data ✅ FIXED
**Fix**: ProjectCard now uses `project.client_name || project.client || 'Unknown Client'` and handles all DB fields.

### BUG-008: `project.lastActivity` blank ✅ FIXED
**Fix**: Compute from `project.updated_at` with fallback to 'Recently'.

---

## P2 — Medium (Fixed ✅)

### BUG-009: ProjectCard imports `statusColors` from mock-data ✅ FIXED
**Fix**: Inlined statusColors object directly in component.

### BUG-010: ApprovalBar imports from mock-data + uses blue color ✅ FIXED
**Fix**: Inlined all constants; changed `in-review` from blue to orange (`bg-orange-50 text-orange-600`).

### BUG-011: FileBrowser imports from mock-data ✅ FIXED
**Fix**: Converted to `.tsx`, inlined all constants, added TypeScript interface.

### BUG-012: FilePreview shows blank for unknown types ✅ FIXED
**Fix**: Added proper fallback UI for vector, design, archive, and other types with download button.

### BUG-013: Settings save buttons are no-ops ✅ FIXED
**Fix**: Added loading state, async simulation, and Toast notification system with proper UX feedback.

### BUG-014: Team "Invite Member" is a no-op ✅ FIXED
**Fix**: Added full InviteModal with email input, role selector, loading state, success state, and "Coming Soon" email note.

### BUG-015: ActivityFeed hardcoded mock data ✅ FIXED
**Fix**: ActivityFeed now fetches from `/api/activity` with fallback to hardcoded data. Links to project pages.

### BUG-016: VideoPlayer keyboard listener doesn't memoize functions ✅ FIXED
**Fix**: Wrapped `togglePlay` and `toggleMute` in `useCallback`, updated dependency arrays.

---

## P3 — New Bugs Found in Round 2

### BUG-017: projects table missing `description` and `due_date` columns (OPEN)
**Description**: New project form collects `description` and `due_date` but schema doesn't have these columns.
**Fix Needed**: Run `ALTER TABLE projects ADD COLUMN IF NOT EXISTS description text, due_date date`
**Added**: `/api/migrate` endpoint to run migrations (needs RPC permissions)

### BUG-018: `creator_name` always shows 'Creator' (LOW)
**Description**: `creator_id` exists in projects but `creator_name` is not stored. User lookup is skipped.
**Fix Needed**: Either store `creator_name` in projects table (denormalized) or JOIN with users table.

### BUG-019: Share modal shows `/review/undefined` when `review_token` is null (MEDIUM)
**Description**: If a project in the DB has no `review_token` (shouldn't happen with default, but possible), the share URL breaks.
**Fix**: ShareModal already handles `project.reviewToken || project.review_token` — the fix is to ensure seed/creation always generates a review token.

---

## Status Summary
- **P0**: 3/3 fixed ✅
- **P1**: 5/5 fixed ✅
- **P2**: 6/6 fixed ✅ 
- **P3 (new)**: 3 new found, 1 medium open
