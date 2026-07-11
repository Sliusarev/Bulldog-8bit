# Feature Spec: Scoreboard (Online High Scores)

> **Worked example for spec-driven development.**
> Next step: hand this to Claude Code with — *"Read specs/scoreboard.md. Produce an implementation plan and a task breakdown from it. Do not write code yet — I want to review the plan first."* Then approve, implement task by task, and verify Section 4 at the end.

> **⚠️ Architecture note (read first).** Storing scores *online* means the game can no longer be a purely front-end app — it needs a hosted place to save data that every player shares. This spec assumes a **Backend-as-a-Service (BaaS)** so you don't run or maintain a server yourself. **Recommended: Supabase** (free tier, hosted Postgres + a simple JS client, no server code needed). Firebase Firestore is an equally valid alternative. The spec is written to be backend-agnostic; pick one before the Plan step.

---

## 1. Summary
After a game ends (victory or game over), submit the player's nickname and score to a shared online high-score table, then show a global scoreboard sorted highest to lowest. Any player, on any device, sees the same rankings. The browser keeps a local copy as an offline fallback. No account or login.

## 2. User story
As a **player finishing a run**, I want to **see my score ranked on a global leaderboard against other players**, so that **I feel real arcade competition and want to beat the top scores.**

## 3. Scope

**In scope**
- Capture the final score + the nickname entered on the title screen.
- **Submit** the run to a shared online table via a BaaS (Supabase/Firebase).
- **Fetch** the global top scores and display them, sorted high → low.
- Highlight the row from the run the player just finished.
- Keep a **local cache** (localStorage) so a scoreboard still shows if the network fails.
- A "Play Again" action that returns to the title screen.
- Loading and error states while talking to the backend.

**Out of scope**
- Accounts, authentication, or login.
- Anti-cheat / server-side score validation (scores are trusted as submitted — acceptable for a hobby game).
- Profanity filtering of nicknames.
- Editing or deleting scores from the UI.
- Regional/per-level boards (single global board only).

## 4. Acceptance criteria
- [ ] Given the game ends and the network is available, when the scoreboard opens, then the run (nickname + score) is written to the online table.
- [ ] Given scores exist online, when the board renders, then it fetches them and shows them sorted by score descending.
- [ ] Given the board renders, then it shows rank, nickname, and score for each entry (top 10).
- [ ] Given a second device/browser opens the game, when it reaches the scoreboard, then it sees the scores submitted from other devices (proving it's shared/online, not local).
- [ ] Given the just-finished run is on the board, then its row is visually highlighted.
- [ ] Given the network request is in progress, then a "Loading…" state is shown (no frozen/blank screen).
- [ ] Given the backend is unreachable, when the board opens, then it shows the local cached scores plus a small "offline — showing saved scores" notice, and does not crash.
- [ ] Given the player clicks "Play Again", then the game returns to the title screen.
- [ ] The Supabase/Firebase keys used are the public/anon client keys only — no secret/admin keys in the front-end code.
- [ ] No errors appear in the browser console.

## 5. UX / behaviour details
- Trigger: shown as its own scene after Victory *and* after Game Over.
- Flow on entry: show "Loading…" → submit run → fetch top scores → render board. (Submit and fetch can be combined if the backend returns the updated list.)
- Layout (top to bottom):
  - Title: "HIGH SCORES" (8-bit font styling).
  - Rows: `#  NICKNAME .......... SCORE`.
  - Current run's row highlighted.
  - Small status line: online / "offline — showing saved scores".
  - "PLAY AGAIN" prompt at the bottom.
- Show the **top 10**. If the current run doesn't rank top 10, still show it as an extra highlighted row below.
- If nickname is missing, default to "AAA".

## 6. Data & persistence

**Online (source of truth) — recommended Supabase:**
- A single table `highscores` with columns: `id` (auto), `name` (text), `score` (int), `created_at` (timestamp, default now).
- Write: insert one row `{ name, score }` on game end.
- Read: select top 10 ordered by `score` desc (tie-break by `created_at`).
- Access via the Supabase JS client using the project URL + **public anon key**. Enable Row Level Security with a policy that allows public insert and select on this table only (this is the standard, safe pattern for an open leaderboard).
- Keep config (URL + anon key) in a single config file / Vite env vars, not scattered in code.

**Local cache (fallback):**
- `localStorage` key `bulldog8bit.highscores`, holding the last successfully fetched top-10 array. Used only when the online fetch fails.

## 7. Edge cases & error handling
- **Network down / backend unreachable:** fall back to local cache, show offline notice, never crash.
- **Submit succeeds but fetch fails (or vice-versa):** still render something sensible (cached list or the single new run); log, don't crash.
- **Slow request:** show the loading state; consider a timeout (e.g. 5s) before falling back to cache.
- **First ever run, empty table:** board shows just the current run.
- **Missing nickname:** default "AAA".
- **Very long nickname:** cap length (e.g. 8 chars) before submitting.
- **Duplicate/rapid submits:** submit once per finished run (guard against double-fire on scene start).
- **localStorage unavailable:** skip the cache silently; online path still works.

## 8. Dependencies
- **BaaS account + project** (Supabase or Firebase) created, table + public-read/insert policy configured. *This is a one-time setup step before implementation — do it in the Plan/setup task.*
- Backend client library added to the project (e.g. `@supabase/supabase-js`).
- Public config (project URL + anon key) available to the front-end via env/config.
- **Title screen** must supply the nickname (Phase 4) — use a placeholder if built first.
- **Score system** must expose the final score at game end.
- Adds a new scene: `Victory / GameOver → Scoreboard → Title`.

## 9. Definition of done
All Section 4 acceptance criteria pass, a score submitted on one device is visible on a second device (proving it's truly online), the offline fallback works when the network is cut, only public keys are in the front-end, the change is committed and pushed, and there are no console errors.
