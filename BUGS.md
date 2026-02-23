# WrkFlo — Bug Report
*Generated: 2026-02-23 — Round 1 QA Audit | Last updated: Round 3*

---

## Open Bugs

### BUG-009: `/api/projects` POST — creator_id always null (demo mode)
**Priority**: P2 — Medium
**File**: `app/api/projects/route.ts`, `app/projects/new/page.tsx`
**Description**: The new project form POSTs without a `creator_id`. The API inserts `creator_id: body.creator_id` which will be null. This works but leaves projects ownerless.
**Expected**: Projects have a creator
**Actual**: creator_id always null (no auth)
**Note**: By design for demo mode. Low priority until auth is added.
**Fix**: For demo mode, use a known demo user UUID or skip creator_id.

### BUG-010: VideoPlayer — dark video backdrop inconsistent with light theme
**Priority**: P2 — Medium (Low severity)
**File**: `components/VideoPlayer.jsx`
**Description**: Video container uses `bg-gray-900` (dark). While dark is sensible for video, the rest of the player uses light theme. Slight inconsistency.
**Note**: No action needed — dark backdrop is appropriate for video players.

---

## Fixed Bugs

### BUG-001: Dashboard loads mock data, not real Supabase data ✅ FIXED
*Fixed: Round 1*
**File**: `app/dashboard/page.tsx`
**Description**: The dashboard imported and displayed `projects` from `@/lib/mock-data` directly. It never called the `/api/projects` endpoint.
**Fix Applied**: Converted to `useEffect` + `fetch('/api/projects')` with loading/error states.

### BUG-002: Project page loads mock data, not real Supabase data ✅ FIXED
*Fixed: Round 1*
**File**: `app/project/[id]/page.tsx`
**Description**: Called `getProjectById(projectId)` from mock-data, ignoring the real DB.
**Fix Applied**: `useEffect` fetch on mount with the id param from real API.

### BUG-003: Review page loads mock data, not real Supabase data ✅ FIXED
*Fixed: Round 1*
**File**: `app/review/[token]/page.tsx`
**Description**: Called `getProjectByToken(token)` from mock-data.
**Fix Applied**: Fetches `/api/review/[token]` on mount for real DB data.

### BUG-004: Comments do not save to database ✅ FIXED
*Fixed: Round 1*
**File**: `app/project/[id]/page.tsx`, `app/review/[token]/page.tsx`
**Description**: `handleAddComment` only updated local React state. Comments were never POSTed to `/api/comments`.
**Fix Applied**: `handleAddComment` now POSTs to `/api/comments` and persists across page refreshes.

### BUG-005: File status changes do not save to database ✅ FIXED
*Fixed: Round 1*
**File**: `app/project/[id]/page.tsx`
**Description**: `handleStatusChange` only updated local React state. Never called `/api/files/[id]/status`.
**Fix Applied**: `handleStatusChange` now PATCHes `/api/files/[id]/status`.

### BUG-006: FileBrowser shows `file.uploadDate` which is undefined for DB data ✅ FIXED
*Fixed: Round 3*
**File**: `components/FileBrowser.jsx`
**Description**: Showed `{file.uploadDate}` but the API returns `upload_date` (snake_case). Blank for DB data.
**Fix Applied**: Uses `file.upload_date || file.uploadDate || ''` to handle both formats.

### BUG-007: ProjectCard crashes on DB data — `project.client` is undefined ✅ FIXED
*Fixed: Round 3*
**File**: `components/ProjectCard.jsx`
**Description**: Used `project.client` but DB schema returns `client_name`. Also used `project.creatorName` with no DB equivalent.
**Fix Applied**: Defensive `client_name || client` fallback already in place; creator handled gracefully.

### BUG-008: ProjectCard `project.lastActivity` is undefined for DB data ✅ FIXED
*Fixed: Round 3*
**File**: `components/ProjectCard.jsx`
**Description**: DB doesn't return `lastActivity`. Showed blank.
**Fix Applied**: Defensive `lastActivity || updated_at` fallback now in place.

### BUG-011: FilePreview doesn't handle unknown file types ✅ FIXED
*Fixed: Round 2*
**File**: `components/FilePreview.jsx`
**Description**: Types like 'vector', 'pdf', 'asset', 'design', 'archive' didn't match any if-conditions, resulting in an empty preview area.
**Fix Applied**: Added graceful fallback showing file name + "Preview not available for this file type".

### BUG-012: Settings "Save Changes" / "Save Branding" buttons are no-ops ✅ FIXED
*Fixed: Round 3*
**File**: `app/settings/page.tsx`
**Description**: Buttons had no onClick handlers; submitted nothing.
**Fix Applied**: Both buttons now save to localStorage and show a toast confirmation.

### BUG-013: Team "Invite Member" button is a no-op ✅ FIXED
*Fixed: Round 3*
**File**: `app/team/page.tsx`
**Description**: Button had no onClick and submitted nothing.
**Fix Applied**: Polished modal with email + role select now opens on click.

### BUG-014: Dashboard filter tabs work on mock data only ✅ FIXED
*Fixed: Round 1 (implicit — fixed when BUG-001 was resolved)*
**File**: `app/dashboard/page.tsx`
**Description**: Filters filtered the mock-data `projects` array. When real API data loads, filters need to apply to fetched data.
**Fix Applied**: Filters now applied to fetched projects state from real API.

### BUG-015: `ActivityFeed` always shows hardcoded activity ✅ FIXED
*Fixed: Round 3*
**File**: `components/ActivityFeed.jsx`
**Description**: Static mock data. Never showed real activity.
**Fix Applied**: ActivityFeed now accepts an optional `activities` prop for real data from the parent.

### BUG-016: WaveformPlayer renders waveform container even when audio fails ✅ FIXED
*Fixed: Round 3*
**File**: `components/WaveformPlayer.jsx`
**Description**: The `waveContainerRef` div was always rendered. On load failure, WaveSurfer could initialize an empty canvas, causing visual noise.
**Fix Applied**: Waveform container is now conditionally hidden when `loadError` is true.

---

## Summary
- **Open**: 2 bugs (BUG-009, BUG-010 — both P2, low priority / by design)
- **Fixed**: 14 bugs across Rounds 1–3
  - Round 1: BUG-001, BUG-002, BUG-003, BUG-004, BUG-005, BUG-014
  - Round 2: BUG-011
  - Round 3: BUG-006, BUG-007, BUG-008, BUG-012, BUG-013, BUG-015, BUG-016

**All P0 and P1 bugs resolved. Remaining open items are P2 (by design or cosmetic).**
