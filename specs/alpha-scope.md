# Feature Spec: Alpha Slice (milestone scope)

> **Scope:** `[Alpha]`. WBS: umbrella over `CHAR-2/3/4`, `MOVE-1/2/3/7`,
> `SCORE-1/7`, `ENEMY-1/3/4`, `STATE-1/3`, `UI-1/2/3/5`, `LEVEL-6`.

> **This is a milestone spec, not a single feature.** It defines the Alpha
> vertical slice as a whole so every individual feature spec (Small Bone, simple
> enemy, 3 hearts, nickname, timer, results window, double jump) stays inside one
> agreed boundary. Individual features still get their own spec via the normal
> spec-driven loop; this file is the boundary they must fit within. Source of
> truth for the split: `CLAUDE.md` → "Project phases: Alpha & Beta".

---

## 1. Summary
Ship a thin, playable **vertical slice**: one platforming level that proves the
whole core loop end-to-end — start screen (nickname + color) → run / jump /
double-jump through a level → collect Small Bones → stomp a simple enemy →
survive on 3 hearts → reach a goal marker → see a results window with nickname,
bones collected, and elapsed time. Everything else is Beta.

## 2. User story
As a **new player**, I want to **enter my nickname, pick my bulldog's color, and
play one complete little level**, so that **there's a real, finishable game to
play and share before the full adventure is built.**

## 3. Scope

**In scope (Alpha)**
- **Start screen** (`UI-1` minimal, `UI-2`, `CHAR-4`): type a nickname, pick a
  color (white/black/red — already built), start.
- **Movement** (`MOVE-1/2/3`, built): run left/right, turn, single jump on solid
  ground.
- **Double jump** (`MOVE-7`): exactly one extra mid-air jump — a stand-in to test
  the future High Jump feel.
- **Bulldog art** (`CHAR-2/3`): idle, run, jump, hurt frames (tintable).
- **Small Bones** (`SCORE-1`): collectible; score = count of bones collected.
- **Level timer** (`SCORE-7`): total elapsed time for the level, shown live.
- **Simple enemy** (`ENEMY-1` trimmed) + **stomp** (`ENEMY-4`): one patrolling
  enemy killed **only** by a stomp from above (with a small bounce).
- **Health** (`STATE-1`, `ENEMY-3`): 3 hearts; the confirmed damage rule — a hit
  costs 1 heart **and restarts the level from the beginning** (hearts carry over,
  don't refill); no i-frames; 0 hearts → **Game Over** (`STATE-3`).
- **HUD** (`UI-3` subset): hearts, bone count, timer (no Energy).
- **Goal marker + results window** (`LEVEL-6` end, `UI-5`): reaching the goal
  (or Game Over) opens a simple local window showing nickname, bones, and time.
- **The one level** (`LEVEL-6`): platforms + bones + the simple enemy + goal
  marker. Minimal flow: start screen → level → results window.

**Out of scope (deferred to Beta — may be trimmed further)**
- Levels 2 & 3, narrative / water-bowl endings, full scene flow (`LEVEL-1/2/3/5`,
  `STATE-4`).
- Energy system and all abilities: Crawl, Fart Attack, Bulldog Rush, High Jump
  (`STATE-2`, whole ABILITY epic, `MOVE-6`).
- Large Bone, Dog Toy, Avocado (`SCORE-2/3/4`); score persistence across levels
  (`SCORE-6`).
- Other enemies (Cat, Robot Vacuum) and the Giant Cat boss (`ENEMY-2/5/6`).
  *(The level-restart damage rule, `ENEMY-3`, is already in Alpha — Beta enemies
  just reuse it.)*
- **Pause menu** (`UI-4`) and the **online scoreboard + local cache**
  (`BOARD-1/2`) — explicitly cut from Alpha.
- Music + full SFX (`AUDIO-1/2`); personality/ability animations (`CHAR-6/7/8`).

## 4. Acceptance criteria (Alpha is "done" when all pass)
- [ ] From the start screen, the player can type a nickname and pick a color, then start the level.
- [ ] The bulldog runs left/right, turns, jumps, and can perform **exactly one** extra mid-air (double) jump before landing.
- [ ] Small Bones can be collected; the running score equals the number of bones collected.
- [ ] The level timer counts up during play and is visible in the HUD.
- [ ] The simple enemy patrols; a stomp from above defeats it (with a small bounce); a side/below contact costs 1 heart.
- [ ] Taking a hit costs 1 heart and **restarts the level from the beginning** (remaining hearts carry over, don't refill); there are no i-frames.
- [ ] Reaching 0 hearts ends the run (Game Over) and opens the results window.
- [ ] Reaching the goal marker ends the level and opens the results window.
- [ ] The results window shows the nickname, bones collected, and total elapsed time.
- [ ] `npm run lint`, `npm run test`, and `npm run build` are all green; no console errors during a full playthrough.

## 5. UX / behaviour details
- Start screen → one level → results window. No pause, no level select.
- HUD (top of screen): hearts (3), bone count, elapsed timer.
- Results window: a simple centered panel — "NICKNAME · Bones: N · Time: M:SS" —
  with a way to restart/replay. Same panel for both goal and Game Over (a small
  win/lose label is fine).

## 6. Data & persistence
- Run-scoped state only (nickname, color, bones, elapsed time, hearts) held in
  shared game state / Phaser registry. No backend. If any local caching of the
  last result is added, it must degrade gracefully when `localStorage` is
  unavailable (`NFR-6`).

## 7. Edge cases & error handling
- Empty nickname → allow a sensible default (e.g. "PLAYER") rather than blocking.
- Double jump must not allow a third jump or hover; it re-enables only on landing.
- Simultaneous stomp + side overlap resolves in the player's favour if descending
  onto the enemy's top (stomp wins) — tune during playtest.

## 8. Dependencies
- Builds directly on `specs/player-physics.md` (movement + the double-jump
  amendment) and `specs/color-select.md` (color, already built).
- Does **not** depend on `specs/scoreboard.md` (that's the Beta replacement for
  the Alpha results window).

## 9. Definition of done
All Section 4 criteria pass; each sub-feature's own spec is verified; CI green;
the Alpha slice is committed, pushed, and **deployed** (`NFR-8`) as a shareable
URL. Shipping Alpha is the gate to starting Beta.

## Decisions / flagged assumptions
1. **Health model** *(confirmed by the user)* — Alpha uses the game's confirmed
   damage rule as-is: a hit costs 1 heart **and restarts the level**, no
   i-frames. No Alpha-specific divergence.
2. **Simple enemy** *(confirmed by the user)* — a trimmed Angry Pomeranian:
   patrol + stomp-only kill.
3. **Score** — a plain Small-Bone count; Large Bone and its HP heal are Beta.
4. **Results window** — the same local window handles both goal and Game Over.

> **Note on level restart + score/timer:** since a hit restarts the level, the
> individual `SCORE-1`/`SCORE-7` specs must decide what happens to the bone count
> and the timer on restart (e.g. reset with the level, or carry over). Resolve
> this when those features are spec'd.
