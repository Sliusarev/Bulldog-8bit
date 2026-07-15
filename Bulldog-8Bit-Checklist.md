# Bulldog 8-Bit — Progress Checklist

Tick each box as you go. Current status: **Phase 1 complete → building the Alpha slice.**

> This checklist and `Bulldog-8Bit-Roadmap.md` are the **build-order** view.
> The requirements catalog they pull from is `Bulldog-8Bit-WBS.md` (Epic >
> Feature, with `[Alpha]`/`[Beta]` scope tags), and the design source of truth
> is `CLAUDE.md` (see "Project phases: Alpha & Beta"). Feature IDs below
> (e.g. `SCORE-1`, `STATE-1`) point back to the WBS.

> **Scope is split into two milestones:**
> - **Alpha** — a thin, playable vertical slice: one level that proves the core
>   loop end-to-end. Build this first.
> - **Beta** — everything else (expected to be trimmed further later).
>
> Removed from the earlier plan for Alpha: **pause menu** and the **online
> scoreboard** (both `[Beta]` now). Alpha shows a simple **local results
> window** at the end instead.

## Working method: spec-driven (SDLC mini-loop)

For each feature marked 📄, run this mini-loop:

1. **Spec** — copy `specs/_TEMPLATE.md`, fill it out for the feature (pull the requirement from the matching WBS ID, and set its `Scope:` tag).
2. **Plan** — give the spec to Claude Code, ask for a plan + task list (no code yet).
3. **Review** — check the plan against the spec (your PM step).
4. **Implement** — build task by task, pulling pure logic into `src/physics/` (or similar) so it stays testable.
5. **Test** — add/extend unit tests for that pure logic (use the `story-unit-tests` skill), and run the basic test checklist below. CI must stay green.
6. **Verify** — tick every acceptance criterion in the spec, and confirm the dev server still runs and the canvas renders with no console errors, before marking the feature done.

Small features (a placeholder square, tuning a jump) don't need a spec — just build them. Save specs in the `specs/` folder. `specs/scoreboard.md` is a worked example; `specs/alpha-scope.md` defines the Alpha slice as a whole.

### Basic test checklist (run at each feature's Test step)

Testing strategy (from `CLAUDE.md`): unit tests cover **pure logic only** — movement/jump rules, score/bone math, resource (HP) math, collision math — not Phaser rendering or scene lifecycle. Feel (jump height, walk speed) is decided by manual playtesting, not tests.

- [ ] Pure logic for the feature lives in a plain module (e.g. `src/physics/*.js`), not buried in a Phaser `create()`/`update()` callback.
- [ ] A matching test file exists (e.g. `specs/<feature>.md` → `src/physics/<feature>.test.js`), with **one test per acceptance criterion** in the spec.
- [ ] Edge cases covered: boundaries (0 HP, double-jump used up, bone count) and the "does nothing" cases (e.g. second air-jump blocked until landing).
- [ ] `npm run lint` passes.
- [ ] `npm run test` passes (all green).
- [ ] `npm run build` succeeds.
- [ ] Manual playtest done for anything feel-dependent (movement, jump, timing).

---

## Phase 0 — Set up ✅ COMPLETE

- [x] Install Node.js (LTS)
- [x] Install VS Code
- [x] Install Git + link GitHub account
- [x] Scaffold Phaser 3 + Vite project (package.json, CLAUDE.md, src/, index.html)
- [x] Dev server runs, canvas opens in browser
- [x] Create GitHub repo + first push (personal token set up)

---

## Phase 1 — Move a bulldog on screen ✅ COMPLETE

- [x] Add a placeholder square as the player
- [x] Add ground/platform the player stands on
- [x] Add left/right arrow movement
- [x] Add jump (spacebar), tuned to feel right
- [x] Player can't fall through the floor
- [x] Commit + push this working version

**Done when:** the square runs, jumps, and lands on the ground.

Physics behavior + tuned values are documented in `specs/player-physics.md`.

---

# 🅰️ MILESTONE ALPHA — the thin vertical slice ⬅ YOU ARE HERE

**Goal:** one playable level that proves the whole core loop: start screen
(nickname + color) → run/jump/double-jump through a level → collect Small Bones
→ stomp a simple enemy → survive on 3 hearts → reach the goal marker → see a
results window with your nickname, bones collected, and elapsed time.

Covers WBS `[Alpha]` features: `CHAR-2/3` (core art + hurt), `MOVE-7` (double
jump), `SCORE-1` (Small Bone) + `SCORE-7` (timer), `ENEMY-1/3/4` (simple enemy +
stomp + damage rule), `STATE-1/3` (3 hearts, Game Over), `UI-1/2/3/5` (start
screen, nickname, HUD, results window), and `LEVEL-6` (the Alpha level).
`CHAR-4` (color select) is already done.

**Alpha health rule (the game's confirmed rule, used as-is):** a hit costs 1
heart **and restarts the level from the beginning** (hearts carry over, don't
refill); no i-frames; 0 hearts → Game Over.

### Alpha build order

- [x] 📄 **Bulldog art** (`CHAR-2` idle/run/jump — spec `specs/character-sprite.md`; `CHAR-3` hurt frame is separate, still **not** started): sprite sheet exported to `src/assets/buldog.png`, animations defined in Phaser, placeholder square swapped for the animated bulldog (idle/run/jump driven by movement state, unit-tested in `src/physics/animation.js`). Also landed alongside: **full-screen responsive scaling + centering** (`NFR-11`, F key / on-screen toggle). *(`CHAR-3` hurt frame still open.)*
- [x] 📄 **Color select** (`CHAR-4`, white/black/red) — spec `specs/color-select.md`; logic + tests in `src/state/color-select.js`; temp `C` key cycles colors (merged in PR #2). *(Already done — wire it into the start screen at the UI step.)*
- [ ] 📄 **Double jump** (`MOVE-7`): amend `specs/player-physics.md`, then allow exactly one extra mid-air jump (blocked again until landing). Unit-test the jump-count rule.
- [ ] 📄 **Small Bones + bone-count score** (`SCORE-1`): collectible bones; score = number collected. Pure score math unit-tested.
- [ ] 📄 **Simple enemy + stomp** (`ENEMY-1` trimmed + `ENEMY-4`): a patrolling enemy defeated by a stomp from above (with a small bounce); side contact triggers the damage rule below. Unit-test the "stomp vs. side-hit" decision.
- [ ] 📄 **3 hearts + level restart + Game Over** (`STATE-1`, `ENEMY-3`, `STATE-3`): 3 HP; a hit costs 1 heart **and restarts the level from the beginning** (hearts carry over, no i-frames); 0 hearts → Game Over → results window. Unit-test the HP math and the "hit → restart vs. Game Over" decision.
- [ ] 📄 **Level timer** (`SCORE-7`): track elapsed time for the level; show it live and pass it to the results window. Unit-test the formatting/accumulation logic.
- [ ] 📄 **Start screen + nickname entry** (`UI-1` minimal + `UI-2`): a simple pre-level screen to type a nickname and pick a color (drives the existing `CHAR-4` module), then start.
- [ ] **HUD** (`UI-3` Alpha subset): show HP hearts, bone count, and the timer during play. (No Energy display in Alpha.)
- [ ] 📄 **Goal marker + results window** (`LEVEL-6` end + `UI-5`): a goal marker ends the level and opens a simple window showing nickname, bones collected, and elapsed time (same window on Game Over).
- [ ] **Assemble the Alpha level** (`LEVEL-6`): lay out one platforming level (hardcoded first, or Tiled) populated with bones, the simple enemy, and the goal marker. Minimal flow: start screen → level → results window.
- [ ] Test: win the level (reach goal → results) AND lose it (take a hit → level restart, 0 hearts → Game Over → results) both work; unit-test bone/HP/timer math and the stomp-vs-hit rule; run the basic test checklist.
- [ ] Commit + push; deploy the Alpha slice (`NFR-8`).

**Alpha done when:** enter a nickname → pick a color → play the one level —
run, jump, double-jump, collect bones, stomp the enemy, lose hearts (each hit
restarts the level), reach the goal — and see the results window with your
nickname, bones collected, and elapsed time. See `specs/alpha-scope.md`.

---

# 🅱️ MILESTONE BETA — the full game (deferred; may be trimmed further)

Everything past the Alpha slice. Build only after Alpha ships, and expect to
re-scope this list. All items are WBS `[Beta]`.

### Combat & abilities depth
- [ ] 📄 **Crawl** (`MOVE-6`) — Cats can't detect the Bulldog while crawling (also the duck-under-fish input).
- [ ] 📄 **Fart Attack** (`ABILITY-1`) — unlimited use, turn around + ~1s delay; neutralizes Cats & Pomeranians (not the Vacuum).
- [ ] 📄 **Bulldog Rush** (`ABILITY-2`, 3 Energy) and **High Jump** (`ABILITY-3`, 1 Energy) — replaces Alpha's stand-in double jump for reaching secrets.
- [ ] 📄 **Energy system** (`STATE-2`) — 3 segments, spent by Rush/High Jump, refilled by Dog Toy; add the Energy HUD (`UI-3` remainder).

### More collectibles & enemies
- [ ] 📄 **Large Bone** (`SCORE-2`, double score + heal 1 HP, cap 3), **Dog Toy** (`SCORE-3`, +1 Energy), **Avocado** (`SCORE-4`, −0.5 HP hazard).
- [ ] 📄 **Cat** (`ENEMY-2`, short hops, multiple kill paths) and **Robot Vacuum Cleaner** (`ENEMY-5`, chases; only stomp-from-above or Rush — not Fart).
- [ ] 📄 **Giant Cat boss** (`ENEMY-6` — 6 segments; Rush = 2, Fart = 1, no stomp; fish projectiles you crawl under; a hit = −1 heart + Level 3 restart).

### Full levels & flow
- [ ] Refactor into a reusable, data-driven Level scene; full scene flow Title → L1 → L2 → L3 → Ending (`LEVEL-5`).
- [ ] Build **Level 1 — The Walk** (`LEVEL-1`, fuller form: Energy pickups, High Jump secrets, water-bowl ending).
- [ ] Build **Level 2 — The Journey Home** (`LEVEL-2`, Rush unlocks; large enemy groups; drink + enter the house).
- [ ] Build **Level 3 — Home Sweet Home** (`LEVEL-3`, Vacuums + Cat/Vacuum combos; boss).
- [ ] 📄 **Victory / ending scene** (`STATE-4` — defeat boss → bedroom → into bed with humans → snore → end credits).
- [ ] **Score carries across levels** (`SCORE-6`); HP/Energy persist across the full run.

### Meta UI, audio, scoreboard, polish
- [ ] Full arcade **title screen** (`UI-1` fuller form) and **pause menu** (`UI-4`).
- [ ] **Personality/ability animations** (`CHAR-6` snore loop, `CHAR-7` fart VFX/SFX, `CHAR-8` rush wobble/blur).
- [ ] Set up the online backend (Supabase/Firebase project + highscores table) — mind `NFR-7` (anon/public keys only).
- [ ] 📄 Build the **online scoreboard** from `specs/scoreboard.md` (`BOARD-1/2`).
- [ ] Add **music + sound effects** (`AUDIO-1/2`: jump, high jump, fart, rush, stomp, hurt, pickups, snore, endings, boss, victory jingle).

**Beta done when:** enter nickname → pick color → play all 3 levels → beat the
Giant Cat → see the ending/credits and your score on the online board.

---

## Phase 5 — Ship it (applies to whichever milestone you're releasing)

- [ ] Final push to GitHub
- [ ] Deploy free (Netlify / Vercel / GitHub Pages)
- [ ] Test the public URL on another device
- [ ] Share the link 🎉

**Done when:** you have a public URL that plays your game. (Ship the Alpha slice
this way first, then re-deploy as Beta features land.)
