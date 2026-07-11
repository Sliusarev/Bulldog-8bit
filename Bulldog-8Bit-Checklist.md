# Bulldog 8-Bit — Progress Checklist

Tick each box as you go. Current status: **Phase 0 complete → starting Phase 1.**

## Working method: spec-driven

From Phase 2 onward, build each feature the spec-driven way. For every feature marked 📄, run this mini-loop:

1. **Spec** — copy `specs/_TEMPLATE.md`, fill it out for the feature.
2. **Plan** — give the spec to Claude Code, ask for a plan + task list (no code yet).
3. **Review** — check the plan against the spec (your PM step).
4. **Implement** — build task by task.
5. **Verify** — tick every acceptance criterion in the spec before marking the feature done.

Small features (a placeholder square, tuning a jump) don't need a spec — just build them. Save specs in the `specs/` folder. `specs/scoreboard.md` is a worked example.

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

- [ ] Decide sprite size (16×16 or 32×32) and palette
- [ ] Draw sprite sheet: idle, run, jump (+ optional hurt) in Piskel/Aseprite
- [ ] Export as PNG sprite sheet into the project
- [ ] Load sprite + define animations in Phaser
- [ ] Swap placeholder square for the animated bulldog
- [ ] 📄 Spec the **color select** feature (white/black/red), then build via the spec loop
- [ ] Commit + push

**Done when:** the bulldog runs and jumps with animation, in each color.

---

## Phase 3 — Build one full level (Level 1)

- [ ] Design Level 1 layout (hardcoded first, or Tiled map editor)
- [ ] 📄 Spec the **bones collectible + score** feature, then build via the spec loop
- [ ] 📄 Spec the **enemies** (Cat patrol + fast Chihuahua, stomp-to-defeat, damage on side contact), then build
- [ ] Add lives (bulldog loses a life on side contact)
- [ ] 📄 Spec the **level-complete (sofa sleep)** feature, then build
- [ ] Test: win the level AND lose the level both work (verify against each spec)
- [ ] Commit + push

**Done when:** Level 1 is playable start to finish — collect bones, stomp enemies, finish on the sofa.

---

## Phase 4 — Full game (3 levels + polish)

- [ ] Refactor into a reusable, data-driven Level scene
- [ ] Build Level 2 (rising difficulty)
- [ ] Build Level 3 (hardest)
- [ ] 📄 Spec the **Big Cat boss** (multiple stomps, ends Level 3), then build
- [ ] 📄 Spec the **title screen** (nickname entry + color pick), then build
- [ ] Score carries across levels; lives system works
- [ ] Set up the online backend (Supabase/Firebase project + highscores table) — one-time prep for the scoreboard
- [ ] 📄 Build the **online scoreboard** from `specs/scoreboard.md` (already written) via the spec loop
- [ ] Add music + jump/bone sound effects
- [ ] Add game-over and victory screens
- [ ] Commit + push

**Done when:** enter nickname → pick color → play all 3 levels → beat Big Cat → see score on the board.

---

## Phase 5 — Ship it

- [ ] Final push to GitHub
- [ ] Deploy free (Netlify / Vercel / GitHub Pages)
- [ ] Test the public URL on another device
- [ ] Share the link 🎉

**Done when:** you have a public URL that plays your game.
