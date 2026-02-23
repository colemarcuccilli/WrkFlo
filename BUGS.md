# WrkFlo — Bug Report
*Generated: 2026-02-23 — Round 1 QA Audit*

---

## P0 — Critical (Breaks Core Flow)

### BUG-001: Dashboard loads mock data, not real Supabase data
**File**: `app/dashboard/page.tsx`
**Description**: The dashboard imports and displays `projects` from `@/lib/mock-data` directly. It never calls the `/api/projects` endpoint. Supabase data is completely ignored on the main dashboard.
**Expected**: Dashboard fetches `/api/projects` on mount, displays real projects from DB
**Actual**: Always shows hardcoded mock data
**Fix**: Convert to `useEffect` + `fetch('/api/projects')` with loading/error states. Or use React Server Component with `async/await`.

### BUG-002: Project page loads mock data, not real Supabase data
**File**: `app/project/[id]/page.tsx`
**Description**: Calls `getProjectById(projectId)` from mock-data, ignoring the real DB.
**Expected**: Fetches `/api/projects/[id]` for real project data
**Actual**: Always shows hardcoded mock-data project
**Fix**: `useEffect` fetch on mount with the id param, or RSC.

### BUG-003: Review page loads mock data, not real Supabase data
**File**: `app/review/[token]/page.tsx`  
**Description**: Calls `getProjectByToken(token)` from mock-data.
**Expected**: Fetches `/api/review/[token]` for real DB data
**Actual**: Hardcoded mock data
**Fix**: Fetch `/api/review/[token]` on mount.

---

## P1 — High (Significant UX Broken)

### BUG-004: Comments do not save to database
**File**: `app/project/[id]/page.tsx`, `app/review/[token]/page.tsx`
**Description**: `handleAddComment` only updates local React state. Comments are never POSTed to `/api/comments`.
**Expected**: New comments POST to `/api/comments` and persist across page refreshes
**Actual**: Comments lost on refresh
**Fix**: In `handleAddComment`, after state update, also `fetch('/api/comments', { method: 'POST', body: ... })`.

### BUG-005: File status changes do not save to database
**File**: `app/project/[id]/page.tsx`
**Description**: `handleStatusChange` only updates local React state. Never calls `/api/files/[id]/status`.
**Expected**: Status changes PATCH `/api/files/[id]/status` and persist
**Actual**: Status resets on refresh
**Fix**: In `handleStatusChange`, also PATCH `/api/files/[id]/status`.

### BUG-006: FileBrowser shows `file.uploadDate` which is undefined for DB data
**File**: `components/FileBrowser.jsx` line ~75
**Description**: Shows `{file.uploadDate}` but the API returns `upload_date` (snake_case). Will be blank for DB data.
**Expected**: Shows the upload date
**Actual**: Blank/undefined for real DB data
**Fix**: Use `file.upload_date || file.uploadDate` or normalize in API response.

### BUG-007: ProjectCard crashes on DB data — `project.client` is undefined
**File**: `components/ProjectCard.jsx`
**Description**: Uses `project.client` but DB schema returns `client_name`. Also uses `project.creatorName` but DB returns no creator name (creator_id is null in seed).
**Expected**: Shows client name
**Actual**: Blank/crash
**Fix**: Use `project.client_name || project.client` and handle missing creator gracefully.

### BUG-008: ProjectCard `project.lastActivity` is undefined for DB data
**File**: `components/ProjectCard.jsx`
**Description**: DB doesn't return `lastActivity`. Shows blank.
**Expected**: Shows relative time of last activity
**Actual**: Blank
**Fix**: Compute from `project.updated_at` using a date library or simple relative time function.

---

## P2 — Medium (Degraded Experience)

### BUG-009: `/api/projects` POST requires `creator_id` but we have no auth
**File**: `app/api/projects/route.ts`, `app/projects/new/page.tsx`
**Description**: The new project form POSTs without a `creator_id`. The API inserts `creator_id: body.creator_id` which will be null. This works but leaves projects ownerless.
**Expected**: Projects have a creator
**Actual**: creator_id always null (no auth)
**Fix**: For demo mode, use a known demo user UUID or skip creator_id. Already partially fixed in seed.

### BUG-010: VideoPlayer — dark video backdrop is inconsistent with light theme
**File**: `components/VideoPlayer.jsx`
**Description**: Video container uses `bg-gray-900` (dark). While dark is sensible for video, the rest of the player uses light theme. Slight inconsistency.
**Severity**: Low — this is actually fine for video players.
**Fix**: No action needed.

### BUG-011: FilePreview doesn't handle unknown file types
**File**: `components/FilePreview.jsx`
**Description**: Types from DB seed include 'vector', 'pdf', 'asset', 'design', 'archive' — none of these match the if-conditions (video/audio/image/document). Falls through with no preview.
**Expected**: Graceful fallback for unknown types
**Actual**: Empty preview area
**Fix**: Add a default fallback that shows file name + "Preview not available for this file type".

### BUG-012: Settings page "Save Changes" / "Save Branding" buttons are no-ops
**File**: `app/settings/page.tsx`
**Description**: Buttons have no onClick handlers, they submit nothing.
**Expected**: Save profile/settings
**Actual**: No action
**Fix**: Add form submission or mark as "Coming Soon" explicitly.

### BUG-013: Team page "Invite Member" button is a no-op
**File**: `app/team/page.tsx`
**Description**: Button has no onClick, submits nothing.
**Expected**: Opens invite flow
**Actual**: No action
**Fix**: Add placeholder modal or mark coming soon.

---

## P3 — Low (Polish)

### BUG-014: Dashboard filter tabs work on mock data only
**File**: `app/dashboard/page.tsx`
**Description**: Filters filter `projects` array from mock-data. When real API data loads, filters need to be applied to fetched data.
**Fix**: Apply filters to fetched projects state, not imported mock array.

### BUG-015: `ActivityFeed` always shows hardcoded activity
**File**: `components/ActivityFeed.jsx`
**Description**: Static mock data. Never shows real activity.
**Expected**: Real-time activity from DB
**Actual**: Always same 5 hardcoded items
**Fix**: Fetch recent comments/status changes from API. Medium complexity.

### BUG-016: WaveformPlayer renders waveform container even when audio fails
**File**: `components/WaveformPlayer.jsx`
**Description**: The `waveContainerRef` div is always rendered. When WaveSurfer fails to load, WaveSurfer may have initialized an empty canvas there, causing visual noise.
**Fix**: Conditionally render waveform container only when `!loadError`. Already mostly handled but could be cleaner.

---

## Summary
- **P0**: 3 critical bugs (dashboard/project/review all using mock data)
- **P1**: 5 high bugs (comments/status not persisting, data field mismatches)
- **P2**: 4 medium bugs (missing fallbacks, dead buttons)
- **P3**: 3 low bugs (hardcoded activity feed, filter state)

**Top priority**: Fix BUG-001, BUG-002, BUG-003 (replace mock-data with real API calls in all pages)
