## /dashboard
- ✅ Dashboard link (in the top nav) — Navigates to `/dashboard`
- ⚠️ Team link (in the top nav) — Navigates to `/team`
- ⚠️ Settings link (in the top nav) — Navigates to `/settings`
- ⚠️ "New Project" button — links to `/projects/new`
- ✅ Filter tabs (All/In Review/Changes Requested/Approved/Draft) — client-side filter works
- ⚠️ Quick Review Links (in Activity feed) — links to `/review/[token]`

## /project/[id]
- ✅ Back to Dashboard Link (logo area) — Navigates to `/dashboard`
- ✅ Dashboard breadcrumb Link — Navigates to `/dashboard`
- ⚠️ Client Review Link — links to `/review/[reviewToken]` (opens in new tab)
- ✅ File Browser (File selection) - Selects different files for preview via `onSelectFile={handleFileSelect}`
- ⚠️ Version History (in file toolbar) - Toggles version history - Component exists
- ⚠️ FilePreview component - Functionality depends on the file type and associated comments. No direct interactive elements here.
- ⚠️ ApprovalBar component - Contains status change buttons (Approve, Request Changes) via `onStatusChange={handleStatusChange}`
- ⚠️ CommentFeed component - Renders existing comments.  Comment list entries with timestamps may be interactive (depending on `onSeekToTimestamp={handleSeekToTimestamp}`)
- ⚠️ CommentInput component - Allows adding comments via `onSubmit={handleAddComment}`. Disabled when `selectedFile?.status === 'locked'`

## /review/[token]
- ✅ File Browser (File selection) - Selects different files for preview via `onSelectFile={handleFileSelect}`
- ⚠️ Version History (in file toolbar) - Toggles version history - Component exists
- ⚠️ FilePreview component - Functionality depends on the file type and associated comments. No direct interactive elements here.
- ⚠️ ApprovalBar component - Contains status change buttons (Approve, Request Changes) via `onStatusChange={handleStatusChange}`.  These may conditionally update the `allApproved` state and display the "All approved celebration" banner.
- ⚠️ CommentFeed component - Renders existing comments.  Comment list entries with timestamps may be interactive (depending on `onSeekToTimestamp={handleSeekToTimestamp}`)
- ⚠️ CommentInput component - Allows adding comments via `onSubmit={handleAddComment}`. Disabled when `selectedFile?.status === 'locked'`

## /team
- ✅ Dashboard link (in the top nav) — Navigates to `/dashboard`
- ✅ Team link (in the top nav) — Navigates to `/team`
- ⚠️ Settings link (in the top nav) — Navigates to `/settings`
- ⚠️ "New Project" button — links to `/projects/new`
- ⚠️ "Invite Member" Button (bottom of the page) - Exists

## /settings
- ✅ Dashboard link (in the top nav) — Navigates to `/dashboard`
- ✅ Team link (in the top nav) — Navigates to `/team`
- ✅ Settings link (in the top nav) — Navigates to `/settings`
- ⚠️ "New Project" button — links to `/projects/new`
- ⚠️ "Change photo" button (Profile settings) - Exists
- ✅ Full Name input (Profile settings) - Text input
- ✅ Email input (Profile settings) - Email input
- ✅ Role select (Profile settings) - Select dropdown
- ✅ Time Zone select (Profile settings) - Select dropdown
- ⚠️ "Save Changes" button (Profile settings) - Exists
- ✅ Notification toggles (New Comments, File Approvals, Changes Requested, New Uploads, Weekly Digest) - Toggles work
- ⚠️ Upload logo area (Workspace branding) - Clickable, but functionality uncertain (likely a placeholder)
- ✅ Workspace Name input (Workspace branding) - Text input
- ✅ Accent Color input (Workspace branding) - Color input
- ✅ Accent Color text input (Workspace branding) - Text input
- ⚠️ "Save Branding" button (Workspace branding) - Exists

## /projects/new
- ✅ Dashboard link (in the top nav) — Navigates to `/dashboard`
- ✅ Team link (in the top nav) — Navigates to `/team`
- ✅ Settings link (in the top nav) — Navigates to `/settings`
- ✅ Dashboard breadcrumb Link — Navigates to `/dashboard`
- ✅ Project Name input - Text input, updates `form.name`
- ✅ Client Name input - Text input, updates `form.client_name`
- ✅ Initial Status select - Select dropdown, updates `form.status`
- ✅ Cancel button - Navigates to `/dashboard`
- ✅ Create Project button - Submits form, creates project, redirects to `/dashboard`

## FileBrowser.jsx
- ✅ File list - Each file is a button that calls `onSelectFile(file)`

## ProjectCard.jsx
- ✅ Entire card is a Link to `/project/${project.id}`