# Bulldog 8-Bit — Progress Checklist

Tick each box as you go. Current status: **Phase 1 complete → starting Phase 2.**

> This checklist and `Bulldog-8Bit-Roadmap.md` are the **build-order** view.
> The requirements catalog they pull from is `Bulldog-8Bit-WBS.md` (Epic >
> Feature), and the design source of truth is `CLAUDE.md`. Feature IDs below
> (e.g. `ENEMY-1`, `ABILITY-2`) point back to the WBS.

## Working method: spec-driven (SDLC mini-loop)

From Phase 2 onward, build each feature the spec-driven way. For every feature marked 📄, run this mini-loop:

1. **Spec** — copy `specs/_TEMPLATE.md`, fill it out for the feature (pull the requirement from the matching WBS ID).
2. **Plan** — give the spec to Claude Code, ask for a plan + task list (no code yet).
3. **Review** — check the plan against the spec (your PM step).
4. **Implement** — build task by task, pulling pure logic into `src/physics/` (or similar) so it stays testable.
5. **Test** — add/extend unit tests for that pure logic (use the `story-unit-tests` skill), and run the basic test checklist below. CI must stay green.
6. **Verify** — tick every acceptance criterion in the spec, and confirm the dev server still runs and the canvas renders with no console errors, before marking the feature done.

Small features (a placeholder square, tuning a jump) don't need a spec — just build them. Save specs in the `specs/` folder. `specs/scoreboard.md` is a worked example.

### Basic test checklist (run at each feature's Test step)

Testing strategy (from `CLAUDE.md`): unit tests cover **pure logic only** — movement/jump rules, score math, resource (HP/Energy) math, collision math — not Phaser rendering or scene lifecycle. Feel (jump height, walk speed) is decided by manual playtesting, not tests.

- [ ] Pure logic for the feature lives in a plain module (e.g. `src/physics/*.js`), not buried in a Phaser `create()`/`update()` callback.
- [ ] A matching test file exists (e.g. `specs/<feature>.md` → `src/physics/<feature>.test.js`), with **one test per acceptance criterion** in the spec.
- [ ] Edge cases covered: boundaries (0 HP, full Energy, score at cap), and the "does nothing" cases (e.g. Fart Attack vs. Robot Vacuum — no effect).
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

Physics behavior + tuned values are now documented in `specs/player-physics.md`.

---

## Phase 2 — Custom bulldog art ⬅ YOU ARE HERE

Covers WBS `CHAR-2` (sprite + animations), `CHAR-3` (hurt frame), `CHAR-4`
(color select), and lays the art groundwork for later ability animations
(`CHAR-6/7/8`).

- [ ] Decide sprite size (16×16 per `CLAUDE.md`, or 32×32) and palette
- [ ] Draw sprite sheet in Piskel/Aseprite. Core now (needed for this phase): **idle, run, jump, hurt**. Draw in a neutral/light palette so it can be **tinted** for color select.
- [ ] (Optional, can defer) rough frames for the personality/ability animations — **crawl, fart-attack, rush, snore** — so the sheet is ready when those mechanics land in Phases 3–4.
- [ ] Export as PNG sprite sheet into `src/assets/`
- [ ] Load sprite + define animations in Phaser
- [ ] Swap placeholder square for the animated bulldog (idle/run/jump driven by movement state)
- [ ] 📄 Spec the **color select** feature (white/black/red — `CHAR-4`), then build via the spec loop (add a temporary key to cycle colors for testing)
- [ ] Test: sprite-state selection logic (which animation for a given movement state) is a pure function with unit tests; run the basic test checklist
- [ ] Commit + push

**Done when:** the bulldog runs and jumps with animation, in each of the three colors.

---

## Phase 3 — Build Level 1 end-to-end ("The Walk")

Builds the core gameplay loop on top of the art, then wraps it into a
playable Level 1. Covers WBS `SCORE-1/2`, `ENEMY-1/2/4`, `ENEMY-3` +
`STATE-1/2/3` (HP/Energy), `MOVE-6` (Crawl), `ABILITY-1` (Fart Attack),
`LEVEL-1`, and `UI-3` (HUD).

- [ ] Design Level 1 layout (Street, daytime — hardcoded first, or Tiled map editor)
- [ ] 📄 Spec **Small/Large Bone collectibles + score** (`SCORE-1/2`; Large Bone also heals +1 HP, capped at 3), then build via the spec loop
- [ ] 📄 Spec the **enemies** — Angry Pomeranian (patrol) + Cat (short hops) — with **stomp-to-defeat + bounce** (`ENEMY-1/2/4`), then build
- [ ] 📄 Spec the **Health & Energy system** (`STATE-1/2`): 3 HP hearts, 3 Energy segments. **Damage rule:** any enemy contact costs 1 heart and **restarts the level from the beginning** (hearts carry over, don't refill); 0 hearts → Game Over (`STATE-3`). No i-frames (see `CHAR-5`).
- [ ] 📄 Spec **Crawl** (`MOVE-6`) — Cats can't detect the Bulldog while crawling (also the future duck-under-fish input)
- [ ] 📄 Spec **Fart Attack** (`ABILITY-1`) — unlimited use, turn around first + ~1s delay, neutralizes Cats & Pomeranians (not the Vacuum)
- [ ] Add the **HUD** (`UI-3`): HP hearts, Energy segments, Score
- [ ] 📄 Spec the **water-bowl ending** (`LEVEL-1` — Bulldog reaches the bowl and drinks; replaces the old sofa ending), then build
- [ ] Test: win the level AND lose it (heart loss → level restart, 0 hearts → Game Over) both work; unit-test the score/HP/Energy math and the "who-defeats-what" rules; run the basic test checklist
- [ ] Commit + push

**Done when:** Level 1 is playable start to finish — collect bones, stomp/fart enemies, lose hearts (level restarts), and finish by drinking at the water bowl.

---

## Phase 4 — Full game (3 levels + polish)

Covers WBS `LEVEL-2/3`, `ABILITY-2/3` (Bulldog Rush, High Jump),
`SCORE-3/4` (Dog Toy, Avocado), `ENEMY-5/6` (Robot Vacuum, Giant Cat boss),
`STATE-4` (ending), `SCORE-6` (score persists), `UI-1/2/4`, `AUDIO-1/2`,
and `BOARD-1/2`.

- [ ] Refactor into a reusable, data-driven Level scene (`LEVEL-5` scene flow: Title → L1 → L2 → L3 → Ending)
- [ ] 📄 Spec **Bulldog Rush** (`ABILITY-2`, 3 Energy, unlocked mid-Level 2) and **High Jump** (`ABILITY-3`, 1 Energy), then build
- [ ] 📄 Spec **Dog Toy** (`SCORE-3`, +1 Energy) and **Avocado** (`SCORE-4`, −0.5 HP hazard pickup), then build
- [ ] Build **Level 2 — The Journey Home** (Street, sunset; Rush unlocks here; large enemy groups; ends drinking water + entering the house) (`LEVEL-2`)
- [ ] 📄 Spec the **Robot Vacuum Cleaner** (`ENEMY-5` — chases; only stomp-from-above or Rush defeats it, **not** Fart), then build
- [ ] 📄 Spec the **Giant Cat boss** (`ENEMY-6` — 6 health segments; Rush = 2, Fart = 1, no stomp; throws fish projectiles you crawl under; a hit = −1 heart + Level 3 restart), then build
- [ ] Build **Level 3 — Home Sweet Home** (House, night; Vacuums + Cat/Vacuum combos; boss) (`LEVEL-3`)
- [ ] 📄 Spec the **victory / ending scene** (`STATE-4` — defeat boss → bedroom → into bed with humans → snore → end credits), then build
- [ ] 📄 Spec the **title screen** — nickname entry (`UI-2`) + color pick (`CHAR-4`) — then build; add **pause menu** (`UI-4`)
- [ ] Score carries across levels (`SCORE-6`); HP/Energy systems work across the full run
- [ ] Set up the online backend (Supabase/Firebase project + highscores table) — one-time prep for the scoreboard (mind `NFR-7`: anon/public keys only)
- [ ] 📄 Build the **online scoreboard** from `specs/scoreboard.md` (already written) via the spec loop (`BOARD-1/2`)
- [ ] Add music + sound effects (`AUDIO-1/2`: jump, high jump, fart, rush, stomp, hurt, pickups, snore, endings, boss, victory jingle)
- [ ] Add Game Over and victory screens
- [ ] Commit + push

**Done when:** enter nickname → pick color → play all 3 levels → beat the Giant Cat → see the ending/credits and your score on the board.

---

## Phase 5 — Ship it

- [ ] Final push to GitHub
- [ ] Deploy free (Netlify / Vercel / GitHub Pages)
- [ ] Test the public URL on another device
- [ ] Share the link 🎉

**Done when:** you have a public URL that plays your game.
