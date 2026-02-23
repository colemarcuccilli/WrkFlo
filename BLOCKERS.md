# BLOCKERS.md — WrkFlo MVP Prototype
**Date:** February 23, 2026
**Branch:** feat/wrkflo-mvp-prototype
**Built by:** Grace Hopper (EM) + Marcus (Full-Stack Dev)

---

## ✅ COMPLETED — P0 Features

### 1. Project Dashboard (`/dashboard`)
- ✅ Grid view of 6 mock projects across creative industries
- ✅ Project cards: name, client, status badge (color-coded), file count, last activity, progress bar
- ✅ Stats row: Total Projects, In Review, Changes Requested, Approved
- ✅ Filter tabs by status (All / In Review / Changes Requested / Approved / Draft)
- ✅ Quick Review Links panel (sidebar)
- ✅ Activity Feed (sidebar)

### 2. Project Workspace (`/project/[id]`)
- ✅ 3-panel layout: File Browser (240px) | Preview (flex) | Feedback (320px)
- ✅ File browser with version badge, status dot, upload date
- ✅ Version History dropdown (V1 → V3 → Final chain)
- ✅ Video player (HTML5) with custom controls
- ✅ Audio player (WaveSurfer.js) with waveform visualization
- ✅ Image viewer with zoomable display
- ✅ Document placeholder with visual skeleton
- ✅ Project progress indicator in header

### 3. Timestamped / Annotated Feedback
- ✅ Video/Audio: click timeline to drop comment at timestamp
- ✅ Comment markers visible on timeline as colored bars
- ✅ Clicking a comment in feed seeks player to that timestamp
- ✅ Images: click to drop numbered pin annotations
- ✅ Pin tooltip shows comment on hover/click
- ✅ All state managed locally in React (no API)

### 4. Approval Workflow
- ✅ Per-file: Approve (green) and Request Changes (orange) buttons
- ✅ Status transitions: Draft → In Review → Changes Requested → Approved → Locked
- ✅ Status workflow indicator bar shows current state in pipeline
- ✅ Locked files disable feedback input and show lock UI
- ✅ Project-level progress: "X of Y files approved" in header

### 5. Client Review Page (`/review/[token]`)
- ✅ No dashboard/nav — clean review-focused UI
- ✅ Invite banner: "You've been invited to review [Project] by [Creator]"
- ✅ Full file browser + preview + feedback panel
- ✅ Approve/Request Changes prominently visible
- ✅ All-approved celebration banner
- ✅ No account required (mock token lookup)

### 6. Mock Data (`lib/mock-data.js`)
- ✅ 6 projects: branding, video, podcast, social media, website redesign, music
- ✅ 3-6 files per project with version history
- ✅ Rich comments with timestamps (video/audio) and pin positions (images)
- ✅ Multiple statuses represented across files

---

## ⚠️ MINOR KNOWN ISSUES (non-blocking)

1. **WaveSurfer audio URLs** — Using placeholder audio URLs (soundjay.com). Real audio files will fail CORS in some environments. The waveform UI degrades gracefully with an error message.

2. **Video playback** — Using `w3schools.com/html/mov_bbb.mp4` as placeholder. The comment timeline markers work correctly; seeking by comment click works when video is loaded.

3. **Image placeholders** — Using `placehold.co` placeholder images. All interactive features (pins, annotations) work correctly.

4. **Seek on comment click (video/audio)** — Uses `window.__wrkflo_seek` as a cross-component bridge. Works correctly in browser but is not ideal architecture for production (acceptable for prototype).

5. **TypeScript** — Next.js created with TypeScript by default. Some `any` types used in page files for rapid prototyping. Components are plain `.jsx`.

---

## ❌ NOT BUILT — P1 Features (if time allows)

- [ ] Activity Feed — basic shell exists in `ActivityFeed.jsx`, no real data connected
- [ ] File Organization and Tagging — not implemented
- [ ] Version Comparison (side-by-side) — not implemented

---

## 🚀 HOW TO RUN LOCALLY

```bash
cd WrkFloUSFake/wrkflo
npm install
npm run dev
# Visit http://localhost:3000
```

**Key URLs to test:**
- Dashboard: `http://localhost:3000/dashboard`
- Project Workspace: `http://localhost:3000/project/proj-002` (Summer Campaign Videos — has video)
- Podcast Project: `http://localhost:3000/project/proj-003` (The Deep Cut — has audio waveform)
- Image Project: `http://localhost:3000/project/proj-001` (Brand Identity — has image pins)
- Client Review: `http://localhost:3000/review/review-abc123`

---

## 📋 WHAT COLE CAN DO RIGHT NOW

- ✅ See a dashboard of 6 diverse creative projects
- ✅ Click into a project and browse its files
- ✅ Preview a video file with custom controls
- ✅ Preview audio with WaveSurfer waveform
- ✅ Leave a timestamped comment on video/audio (click timeline)
- ✅ Click a comment and jump to that timestamp
- ✅ Pin an annotation on an image (click image)
- ✅ Approve a file and see the project progress update
- ✅ Open /review/[token] and see the full client experience
