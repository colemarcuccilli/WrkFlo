# WrkFlo — Feature Ideas
*Last Updated: 2026-02-23 — Round 2 Sprint*

---

## ✅ Built in Round 1+2

| Feature | Status | Notes |
|---------|--------|-------|
| No-Account Client Review | ✅ Built | `/review/[token]` — zero auth |
| Review Link Share Modal | ✅ Built | ShareModal with clipboard + pre-written message |
| File Upload (Drag-and-Drop) | ✅ Built | FileUploader component → `/api/upload` → Supabase Storage |
| Project Completion Celebration | ✅ Built | Confetti + summary card, auto-triggers when all files approved |
| AI Comment Summarizer | ✅ Built | `/api/summarize` → OpenRouter/Claude or rule-based fallback |
| Version Upload | ✅ Built | VersionUpload modal → `/api/files/[id]/version` |
| Mobile Bottom-Sheet Comments | ✅ Built | MobileCommentSheet on review page |
| Video Keyboard Shortcuts | ✅ Built | Space/K=play, J/←=back 5s, L/→=fwd 5s, M=mute, F=fullscreen |
| Video Fullscreen Button | ✅ Built | Native requestFullscreen() |
| Approval Badge Download | ✅ Built | SVG badge via `/api/badge` endpoint |
| Dashboard Search | ✅ Built | Search by project name or client name |
| Activity Feed (Real API) | ✅ Built | Fetches from `/api/activity`, links to projects |
| Team Invite Modal | ✅ Built | Full modal with email + role, "Coming Soon" email note |
| Settings Save Buttons | ✅ Built | Toast notifications, photo preview, all forms wired |
| FilePreview for All Types | ✅ Built | vector/design/archive/other all show proper fallback |

---

## 🔄 In Progress / Next Sprint

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Email Notifications (Resend) | 🔥🔥🔥 | Medium | Need Resend API key in env |
| Schema Migration (description/due_date) | 🔥🔥 | Low | Add columns to projects table |
| Creator name storage | 🔥 | Low | Denormalize creator_name on project |
| PDF Viewer (iframe embed) | 🔥🔥 | Low | Use Google Docs viewer or pdf.js |
| Version Comparison Side-by-Side | 🔥🔥 | High | Image slider for V1 vs V2 |

---

## 💡 New Ideas Discovered in Round 2

### Idea 11: Project Archive/Completed Section on Dashboard
**What**: Separate "Completed" tab on dashboard showing sealed projects with green badge.
**Why**: Frame.io buries completed work. WrkFlo should celebrate it.
**Complexity**: Low (just a filter + visual badge)

### Idea 12: Real-time Comment Notifications (Supabase Realtime)
**What**: When client leaves a comment, creator sees a notification bubble without refreshing.
**Why**: The "check back" workflow is broken. Realtime keeps creators engaged.
**Complexity**: Medium (Supabase `subscribe()` on comments table)

### Idea 13: Comment Reply Threading
**What**: Reply to a specific comment. Thread stays collapsed, expands on click.
**Why**: Frame.io has comment replies. Multi-person reviews get confusing without threading.
**Complexity**: Medium (add `parent_id` to comments table)

### Idea 14: Bulk Approve Button
**What**: "Approve all files" button at project level.
**Why**: Clients want to approve everything at once when they're happy. Clicking each file is tedious.
**Complexity**: Low (loop PATCH calls)

### Idea 15: Guest Name Collection on Review Page
**What**: On first load of review page, ask client "What's your name?" — small modal, no account needed.
**Why**: Comments from "Client" are anonymous. "Sarah from Northside Coffee" is much more useful.
**Complexity**: Low (local state + sessionStorage, prepopulate `author_name`)

---

## Priority Matrix (Updated)

| Feature | Impact | Complexity | Next? |
|---------|--------|------------|-------|
| Email Notifications | 🔥🔥🔥 | Medium | **Yes** |
| Guest Name Collection | 🔥🔥🔥 | Low | **Yes** |
| Bulk Approve | 🔥🔥 | Low | **Yes** |
| Realtime Comments | 🔥🔥 | Medium | Next sprint |
| PDF Viewer | 🔥🔥 | Low | Next sprint |
| Comment Threading | 🔥🔥 | Medium | Backlog |
| Version Compare | 🔥🔥 | High | Backlog |
