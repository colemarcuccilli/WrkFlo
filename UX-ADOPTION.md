# WrkFlo — UX Adoption Strategy

## The Challenge: From Email Chains to WrkFlo

## The 5 Adoption Moments

### Moment 1: The First Upload
- Mental model: Creator thinks "I just want to send this file"
- Remove friction: drag-and-drop on landing, progress bar, instant preview
- Copy: "Your file is ready to share in seconds" not "Upload complete"
- Offer: suggest adding a project name from filename

### Moment 2: The Review Link Share
- This is THE differentiator vs. WeTransfer/Google Drive
- Show the link immediately with a one-click copy button
- Pre-written shareable message: "Hey [name], I've shared your files for review at this link. Click to view, comment, and approve — no account needed."
- Mobile share sheet
- Copy the review URL, not the full project URL
- Make it feel like "magic" — they're used to attaching files

### Moment 3: The Client First-View
- Client lands on /review/[token] — has never used WrkFlo
- Must understand in 5 seconds: this is a file to review, I can click to comment
- No account required, no install
- First interactive element should be obvious: "Click anywhere on the image/video to leave a comment"
- Animated hint/tooltip on first load

### Moment 4: The Approval Notification
- Creator gets notified (email stub + in-app banner)
- "🎉 [Client Name] approved [File Name]" — make it celebratory
- "⚠️ [Client Name] requested changes on [File Name] — 3 comments to review"
- Link directly to the file/comments

### Moment 5: The Retention Hook
- After first approval: show project "sealed" with green badge
- "Start your next project →" CTA in context
- Project archive becomes portfolio: "Your approved work lives here"

## Copy & Tone Guidelines
- Tone: direct, human, creative professional (not startup-speak)
- Use "creator" not "user"
- Use "your client" not "collaborator" or "stakeholder"
- Avoid: "workspace", "collaboration hub", "streamline your workflow"
- Use: "share your work", "get feedback", "approved"
- Example button copy: "Share with client" (not "Initiate review")

## Three Anti-Patterns to Avoid
1. Forcing client account creation (Frame.io does this on some plans)
2. Burying the review link behind project settings
3. Making the first upload feel like "setting up software" (too many fields, too many steps)

## Recommended Onboarding Flow (Step by Step)
1. Creator lands on dashboard: single CTA "Start a new project"
2. Name the project (just a text field, no more)
3. Upload files (drag-drop zone, multiple files OK)
4. Files preview instantly
5. Copy review link (large, prominent)
6. Done — "Share this link with your client"

## Mobile Considerations
- Share button uses native share sheet (navigator.share)
- Review link page fully responsive
- Comment input accessible on mobile (no hover required)
- Video/audio controls work with touch
