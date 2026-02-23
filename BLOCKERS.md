# WrkFlo MVP — Build Status & Blockers
> Built overnight by Marcus (Sweet Dreams Media Engineering)
> Date: 2026-02-23

## ✅ SHIPPED — What's Working

### Pages
- **`/dashboard`** — Full project grid with 6 projects, stats row, filter tabs, activity feed, quick review links
- **`/project/[id]`** — 3-panel workspace (file browser, preview, feedback panel) with live state
- **`/review/[token]`** — Client-facing review page with invite banner, same workspace tools, no navigation

### Components (All Built)
- `ProjectCard` — status badges, progress bar, file count, last activity
- `FileBrowser` — clickable file list, type icons, version badges, status dots, lock icon
- `FilePreview` — orchestrates correct player based on file type
- `VideoPlayer` — HTML5 video, custom controls, timestamped comment markers on timeline, click-to-comment
- `WaveformPlayer` — wavesurfer.js waveform, custom timeline bar with comment markers, click-to-comment (dynamic import, SSR-safe)
- `ImageViewer` — numbered pin annotations, click-to-annotate, pin tooltip popups
- `CommentFeed` — timestamp jump buttons, pin number badges, author role colors
- `CommentInput` — keyboard shortcut (⌘↩), disabled state for locked files
- `ApprovalBar` — Approve/Request Changes buttons, status workflow indicator, locked state
- `VersionHistory` — dropdown showing full version history with dates and notes
- `ActivityFeed` — recent activity list

### Features Working
- File status changes persist in React state (Approve / Request Changes)
- New comments added live (timestamp, image pin, or general)
- Video timeline comment markers (orange=client, indigo=creator)
- Audio waveform with comment markers on custom timeline
- Image pin annotations with numbered circles and tooltip popups
- Version history dropdown per file
- Status filter tabs on dashboard
- Client review link from project workspace
- "All files approved" celebration banner on review page
- Lock detection — locked files disable comment input and approval buttons
- Full dark theme throughout (slate-900/800/700, indigo accents)

### Build Status
```
npm run build — ✅ PASSES (0 errors, 0 warnings)
```

### Routes
| Route | Status |
|-------|--------|
| `/` | ✅ Redirects to /dashboard |
| `/dashboard` | ✅ Static |
| `/project/[id]` | ✅ Dynamic (proj-001 through proj-006) |
| `/review/[token]` | ✅ Dynamic (review-abc123 through review-pqr678) |

---

## ⚠️ KNOWN LIMITATIONS (Not Blockers)

### Audio/Video Files
- No real media files included — videos use `https://www.w3schools.com/html/mov_bbb.mp4` (Big Buck Bunny sample)
- Audio uses `https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3` — may fail CORS in some environments; WaveformPlayer handles this gracefully with an error state
- WaveSurfer loads correctly but may show "Audio unavailable (demo mode)" if the sample URL is unreachable

### Image Previews
- Using `https://placehold.co/` placeholder images — replace with real assets when ready
- PDF/document type shows a skeleton placeholder (no actual PDF renderer)

### State Persistence
- All state is local React state — refreshing the page resets to mock data
- No backend/database integration (by design for MVP prototype)

### Authentication
- No auth — review token links are unprotected (by design for prototype)
- Dashboard shows all projects (no user scoping)

### TypeScript
- create-next-app installed TypeScript despite `--no-typescript` flag
- Pages are `.tsx` but components are `.jsx` — mixed but works fine
- Some `any` type assertions used to keep it simple

---

## 🔜 NEXT STEPS (For Cole to Prioritize)

1. **Supabase backend** — projects, files, comments tables + real-time updates
2. **File storage** — Supabase Storage for actual video/audio/image uploads
3. **Auth** — Supabase Auth for creator accounts, magic link for client review
4. **Real review tokens** — generate UUID tokens stored in DB
5. **PDF viewer** — consider `react-pdf` or iframe embed
6. **Notifications** — email/webhook when client approves or requests changes
7. **Mobile responsive** — 3-panel layout needs responsive breakpoints for tablet/phone
8. **Vercel deploy** — ready to deploy, just needs env vars and Supabase connection
9. **Figma handoff** — design system is established, ready for Figma component library

---

## 📁 File Structure

```
wrkflo/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (redirect)
│   ├── globals.css
│   ├── dashboard/page.tsx
│   ├── project/[id]/page.tsx
│   └── review/[token]/page.tsx
├── components/
│   ├── ActivityFeed.jsx
│   ├── ApprovalBar.jsx
│   ├── CommentFeed.jsx
│   ├── CommentInput.jsx
│   ├── FileBrowser.jsx
│   ├── FilePreview.jsx
│   ├── ImageViewer.jsx
│   ├── ProjectCard.jsx
│   ├── VersionHistory.jsx
│   ├── VideoPlayer.jsx
│   └── WaveformPlayer.jsx
└── lib/
    └── mock-data.js (6 projects, 18 files, 35+ comments)
```

**To run locally:**
```bash
cd wrkflo
npm install
npm run dev
# → http://localhost:3000
```

**Test review link:** http://localhost:3000/review/review-abc123
