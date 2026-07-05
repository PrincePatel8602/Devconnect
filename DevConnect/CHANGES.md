# What's new in this build

## 1. Reels (new, Instagram-style)
- New `/reels` page: vertical, swipeable/scrollable full-screen video feed (tap to play/pause, tap the speaker icon to mute/unmute).
- Like, comment, share and follow are all live and hit the API.
- Floating "+" button opens an upload dialog (pick a video + write a caption).
- Your own reels get a delete option in the action rail.
- Backend: new `Reel` model, `reelController.js`, `reelRoutes.js`, mounted at `/api/reels`.
  Videos upload to Cloudinary (`resource_type: "video"`), so make sure `server/.env` has valid Cloudinary keys.
- `Comment` model now supports comments on either a `post` or a `reel`.

## 2. Every icon now does something
- **Post card**: heart = like/unlike, speech bubble = opens a real comment thread (add/delete comments), paper‑plane = share (native share sheet or copy link), bookmark = save/unsave, "•••" menu = bookmark, copy link, and delete (if it's your post).
- **Navbar**: added a Reels icon; Home/Search/Reels/Messages/Notifications all route correctly; profile dropdown and logout work as before.
- **Home sidebar**: the left "Home / Search / Reels / Messages / Notifications / Profile" buttons are now real links; the right "Suggestions" panel is wired to `/users/suggested` with a working Follow button.
- **Chat**: the ✏️ compose icon focuses the new-conversation search box. No phone or video-call icons were added — chat stays text/image/voice-note only, like the original.
- **Notifications**: shows the correct message per type (like / comment / follow), marks everything read on open, and each item has a working delete button.

## 3. Profile page is now Instagram-style
- Header with avatar, name, bio, and stats.
- Followers / Following counts are clickable and open a scrollable list modal.
- Tabs: **Posts**, **Reels**, and (on your own profile) **Saved**, each shown as a photo/video grid.
- Tapping any grid tile opens that post or reel in a focused overlay (with comments), instead of just linking away.

## Setup notes
- `node_modules` were stripped out of this download to keep it small — run `npm install` inside both `client/` and `server/` again.
- No new environment variables are required beyond what the project already used (Mongo URI, JWT secret, Cloudinary keys) — Reels reuse the same Cloudinary config, just with `resource_type: "video"`.
