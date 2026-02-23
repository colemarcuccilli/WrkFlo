# WrkFlo — Competitor Research & Gap Analysis
*Last Updated: 2026-02-23 — Round 2 Sprint*

---

## Executive Summary

WrkFlo is a Frame.io-style creative review platform targeting indie creators and small studios.
Frame.io and Wipster are the dominant players. WrkFlo wins on: zero-auth client review, fire/light theme,
indie-first pricing, and a more human/celebratory UX.

---

## Frame.io Analysis

### Core Strengths
- Industry standard for video production teams
- Deep Adobe Creative Cloud integration (import directly from Premiere/After Effects)
- Enterprise-grade: review links, granular permissions, version comparison

### Core Complaints (User Research)
- $15–$29/month per user — prohibitive for solos
- Requires client account creation on some plans → major friction
- Overwhelming UI for simple "get client approval" use cases
- Notifications are generic, not celebratory
- No "project completion" milestone moment
- Mobile experience is an afterthought

### What Frame.io Has That We Don't (Yet)
| Feature | Frame.io | WrkFlo Status |
|---------|----------|---------------|
| Adobe CC integration | ✅ | ❌ (not relevant for indie tier) |
| Granular permissions | ✅ | ❌ TODO |
| Side-by-side version compare | ✅ | ❌ PLANNED |
| Custom review link passwords | ✅ | ❌ PLANNED |
| Watermarking (forensic) | ✅ | ❌ Not planned |
| Frame-level annotations | ✅ | ⚠️ Image pins only |
| Download controls per reviewer | ✅ | ❌ TODO |
| Presentation mode (full-screen) | ✅ | ⚠️ Video fullscreen only |
| In-app notifications | ✅ | 🔄 Realtime built |
| Email notifications | ✅ | 🔄 Pending Resend key |
| Team workspaces | ✅ | ⚠️ Basic team page |

### What WrkFlo Does BETTER Than Frame.io
| Feature | Frame.io | WrkFlo |
|---------|----------|--------|
| Zero-auth client review | ❌ (sometimes requires account) | ✅ Pure link access |
| Guest name collection | ❌ | ✅ BUILT |
| Project completion celebration | ❌ | ✅ Confetti + summary |
| AI feedback summarizer | ❌ (no lower-tier AI) | ✅ BUILT |
| Approval badge download | ❌ | ✅ BUILT |
| Price for solos | $15/mo/user | Free/indie pricing |
| Invite friction | Account required | ✅ Send a link |

---

## Wipster Analysis

### Core Strengths
- Clean, intuitive video review UX
- Strong timestamped comment UX
- Nonprofit/education discounts

### Core Complaints
- No support beyond video (audio clunky, images basic)
- No mobile app (website only)
- No AI features
- Limited version history

### WrkFlo vs Wipster Gaps
| Feature | Wipster | WrkFlo |
|---------|---------|--------|
| Audio waveform player | ❌ | ✅ WaveformPlayer |
| Image pin annotations | ❌ | ✅ ImageViewer |
| Mobile comment sheet | ❌ | ✅ BUILT |
| AI summarizer | ❌ | ✅ BUILT |
| Multi-type file support | ⚠️ | ✅ video/audio/image/pdf/design/vector/archive |

---

## New Gaps Discovered in Round 2 Sprint

### Gap 1: Password-Protected Review Links
**What**: Add optional password to `/review/[token]` — not required but available.
**Why**: Agencies and studios need this for NDA-protected work.
**Build**: Add `review_password` to projects table, check on review page load.

### Gap 2: Comment Reply Threading
**What**: Reply to a specific comment. Thread collapses/expands.
**Why**: Multi-stakeholder reviews get chaotic without threading.
**Build**: Add `parent_id` to comments table, CommentFeed handles nested render.

### Gap 3: Figma/Design Tool Preview
**What**: For `.fig` files, show a Figma embed or thumbnail.
**Why**: Designers always share Figma links. WrkFlo should handle them natively.
**Build**: Accept Figma URLs, embed via `?embed=1` parameter.

### Gap 4: Global Search
**What**: Search across ALL projects, ALL files, ALL comments.
**Why**: "Where was that comment about the logo color?" is a real problem.
**Build**: `/api/search?q=...` endpoint, Supabase full-text search on comments.content + files.name.

### Gap 5: Download All Approved Files (ZIP)
**What**: "Download all approved files as ZIP" button on completed projects.
**Why**: Client wants everything in one place after approval.
**Build**: `/api/projects/[id]/download` → server-side ZIP from Supabase Storage paths.

### Gap 6: Email Notifications (Critical)
**What**: Resend API integration for comment/approval notifications.
**Why**: Async workflows need email. No creator is watching the app 24/7.
**Build**: POST to Resend in `/api/comments` and `/api/files/[id]/status` handlers.

---

## Priority Build Queue (Post Round 2)

| Item | Impact | Build Effort |
|------|--------|-------------|
| Email Notifications (Resend) | 🔥🔥🔥 | 2h — just need API key |
| Password-Protected Links | 🔥🔥 | 2h |
| Global Search | 🔥🔥 | 3h |
| Comment Threading | 🔥🔥 | 4h |
| Download All as ZIP | 🔥 | 4h |
| Figma Embed | 🔥 | 2h |
