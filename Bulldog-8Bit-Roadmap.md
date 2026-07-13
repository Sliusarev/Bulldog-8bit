# Bulldog 8-Bit — Build Roadmap (learn by doing)

A practice-first plan to build a Super Mario–style platformer with a bulldog hero, 3 levels, in the browser — using Claude Code. Written for a PM with no hands-on coding yet. You'll learn the concepts as you hit them, not before.

> **Note (design updated):** the game is now the fuller "Bulldog Adventure"
> design — hearts + Energy resources, Crawl / Fart Attack / Bulldog Rush /
> High Jump moves, Angry Pomeranian / Cat / Robot Vacuum enemies, a Giant Cat
> boss, and three distinct narrative endings. This roadmap is the *learn-by-
> doing narrative*; `CLAUDE.md` (design) and `Bulldog-8Bit-WBS.md`
> (requirements) are the source of truth, and `Bulldog-8Bit-Checklist.md` is
> the detailed build tracker.

---

## What you're building (the vision, made concrete)

- **Type:** 2D side-scrolling platformer (run, jump, avoid enemies, reach the flag).
- **Hero:** a bulldog that runs, jumps, takes damage.
- **Levels:** 3 stages of rising difficulty, each ending at a goal.
- **Style:** 8-bit pixel art (chunky sprites, limited palette, chiptune-ish feel).
- **Runs:** in any web browser, no install.

## The tech stack (chosen to be beginner-friendly)

| Piece | Choice | Why |
|---|---|---|
| Language | JavaScript | Runs in every browser, most tutorials/help exist |
| Game engine | **Phaser 3** | Free, made for exactly this (2D platformers), huge docs |
| Editor / assistant | **Claude Code** (VS Code + terminal) | Your pair-programmer that writes and explains code |
| Pixel art | **Aseprite** (paid ~$20) or **Piskel** (free, browser) | Draw the bulldog + tiles |
| Runtime | A local dev server | See changes live in the browser |
| Version control | **Git + GitHub** | Save your work, undo mistakes |

You don't need to master any of these first. You'll pick them up as the build demands.

---

## Phase 0 — Set up (about 1–2 hours)

Goal: get the tools installed and prove "hello world" runs. Do each step **with Claude Code** — ask it to guide you and paste any errors back to it.

**Progress tracker:**

1. ✅ Install **Node.js** (LTS version) — runs your dev tools. **Done.**
2. ✅ Install **VS Code** — your editor. **Done** (you're running Claude Code inside it).
3. ✅ Install **Git** + create a free **GitHub** account. **Done** — the repo is under version control and pushed to GitHub (see the commit history + CI).
4. ✅ Scaffold the Phaser 3 + Vite project (package.json, CLAUDE.md, src/, index.html). **Done**.
5. ✅ Run it and see a canvas in the browser. **Done** — the dev URL opens in Chrome.

Phase 0 is **complete** — plus CI, linting, and a Vitest test suite are now wired up (see `.github/workflows/ci.yml`).

✅ Done when: the canvas runs AND your project is under git version control. **(Both done.)**

---

## Phase 1 — Move a bulldog on screen (a few hours) ✅ DONE

Goal: get a controllable character with gravity — the heart of any platformer. **Done** — the placeholder square moves, jumps, and lands; physics is documented and unit-tested in `specs/player-physics.md` + `src/physics/`.

Concepts you'll meet (learn as you go): **sprite**, **game loop**, **physics/gravity**, **collision**, **keyboard input**.

Steps:
1. Use a temporary placeholder square for the bulldog (art comes later).
2. Add ground the character stands on.
3. Add arrow-key movement + a jump.
4. Tune gravity and jump height until it *feels* right.

**Prompt:**
> "In my Phaser project, add a player rectangle with arcade physics: gravity, left/right arrow movement, and spacebar to jump onto a ground platform. Comment every line so I understand it."

✅ Done when: your square runs and jumps on a floor and can't fall through it.

---

## Phase 2 — Make the bulldog (custom pixel art)

Goal: replace the placeholder with your real 8-bit bulldog. You chose custom art — here's the practical path.

What you need to draw (a **sprite sheet** = one image holding several frames):
- **Idle** (1–2 frames)
- **Run** (3–4 frames)
- **Jump** (1 frame)
- **Hurt** (1 frame — now in scope, `CHAR-3`)

> The bulldog also has personality/ability animations coming later — **crawl,
> fart-attack, rush (wobble/blur), and an idle snore-loop** (`CHAR-6/7/8`).
> You can rough them into the same sheet now or add them when those mechanics
> land in Phases 3–4. Don't let them block shipping idle/run/jump/hurt.

Recommended sprite size: **32×32 px** (or 16×16 for a more retro, easier start). Keep a **limited palette** (8–16 colors) for the authentic 8-bit look.

How to make it:
- **Fastest to learn:** open **Piskel** (piskelapp.com, free, in-browser) and draw frame by frame. Export as a PNG sprite sheet.
- **More powerful:** buy **Aseprite** — the industry-standard pixel/animation tool.
- **Bootstrap it with AI:** you can generate a first-draft bulldog sprite with an image generator, then clean it up pixel-by-pixel in Piskel/Aseprite so it tiles and animates cleanly. (Raw AI images usually aren't game-ready without touch-up.)

Then wire it in — **Prompt:**
> "I have a 32×32 bulldog sprite sheet at assets/bulldog.png with idle, run, and jump frames. Load it, define animations, and swap my placeholder rectangle for it so animations play based on movement."

**Feature — color select (white / black / red):** design the bulldog art in a neutral/light palette so it can be **tinted** in code (easiest), or draw three sheets. You'll hook the chosen color to the sprite here or in Phase 4's title screen.
> "Make the bulldog sprite support three player-chosen colors — white, black, red — using Phaser tint (or swappable sheets). Add a temporary key to cycle colors so I can test it."

✅ Done when: your bulldog visibly runs and jumps with animation (and can appear in each color).

> Tip: if drawing feels slow, ship Phase 1–4 with a placeholder and return to art later. Don't let art block the fun of a working game.

---

## Phase 3 — Build Level 1 end-to-end (the biggest learning jump)

Goal: a complete, winnable **Level 1 — "The Walk"** (Street, daytime) with platforms, bones, two enemy types, the Health/Energy system, Crawl + Fart Attack, and the water-bowl ending.

Concepts: **tilemaps** (levels built from a grid of tiles), **enemies & simple AI**, **collectibles**, **resource systems** (HP/Energy), **win/lose conditions**.

Steps:
1. Design the level layout. Easiest method: use **Tiled** (free map editor, mapeditor.org) to paint a level, or start with a simple hardcoded platform layout and graduate to Tiled.
2. Add **Small/Large Bones** to collect (score counter). Large Bone is worth double and heals +1 HP (capped at 3).
3. Add patrolling enemies — an **Angry Pomeranian** (patrol) and a **Cat** (short hops with pauses). Defeat them by landing on top (stomp) or Fart Attack. *(Chihuahua was cut from the design.)*
4. Add the **Health & Energy system**: 3 HP hearts, 3 Energy segments in a HUD. **Damage rule:** any enemy contact costs 1 heart and **restarts the level from the beginning** (hearts carry over, don't refill); 0 hearts = Game Over. No i-frames.
5. Add **Crawl** (Cats can't detect you while crawling) and the **Fart Attack** (turn around, ~1s delay, neutralizes Cats/Pomeranians).
6. Add the **level ending**: the bulldog reaches a **water bowl and drinks** (replaces the old sofa/flag ending; each level now has its own narrative ending).

**Prompt:**
> "Add Small and Large Bone collectibles with a score counter (Large Bone = double score + heal 1 heart, max 3). Add two enemies — a patrolling Angry Pomeranian and a hopping Cat — that cost 1 heart and restart the level on contact, and are defeated by a stomp from above or a Fart Attack. Give the player 3 HP hearts and 3 Energy segments shown in a HUD. End the level when the bulldog reaches a water bowl and drinks. Pull the score/HP/Energy rules into a plain module and unit-test them."

✅ Done when: you can play Level 1 start to finish — collect bones, stomp/fart the Pomeranian and Cat, lose hearts (level restarts), and finish by drinking at the water bowl.

---

## Phase 4 — Turn it into a real game (3 levels + polish)

Goal: multiple levels, a start screen, lives, and sound.

Concepts: **scenes/state management** (menu → level 1 → 2 → 3 → win screen), **level progression**, **audio**.

Steps:
1. Refactor so a level is data-driven — you load Level 2 and 3 by swapping map data, not rewriting code. Ask Claude Code to help you generalize.
2. Build **Level 2 — "The Journey Home"** (Street, sunset): **Bulldog Rush** (3 Energy) unlocks here, plus **Dog Toy** (+1 Energy) and **Avocado** (−0.5 HP hazard) pickups and large enemy groups. Ends with the bulldog drinking water and entering the house.
3. Build **Level 3 — "Home Sweet Home"** (House, night): **Robot Vacuum Cleaner** enemies (chase you; only stomp-from-above or Rush defeats them — *not* Fart) and Cat+Vacuum combos.
4. Add the **Giant Cat boss** at the end of Level 3 — **6 health segments**, throws fish projectiles you crawl under; Bulldog Rush deals 2, Fart Attack deals 1 (no stomp). A fish hit costs 1 heart and restarts Level 3.
5. Add the **ending scene**: defeat the boss → walk to the bedroom → climb into bed beside the humans → snore → **end credits** (replaces a generic win screen).
6. Build the **arcade start screen**: player types a **nickname** and picks a **bulldog color** (white / black / red) before playing. No login. Add a **pause menu**.
7. Add the **online scoreboard** (the full spec already exists at `specs/scoreboard.md`): nicknames + scores in a shared online table (Supabase/Firebase) so rankings are global across devices, with a `localStorage` cache as offline fallback. No login. *(This is now online, not localStorage-only.)*
8. Make **Score carry across levels**; keep the HP/Energy systems working across the whole run.
9. Add chiptune music + sound effects (jump, high jump, fart, rush, stomp, hurt, pickups, snore, endings, boss, victory jingle).

**Prompts (do these one at a time):**
> "Refactor my single level into a reusable Level scene that loads different tilemaps, so I can add level 2 and 3 by only changing map data. Then add a scene flow: Title → Level1 → Level2 → Level3 → Ending/Credits."

> "Add Bulldog Rush (costs 3 Energy, uncontrolled high-speed sprint that destroys enemies in its path, unlocked in Level 2), High Jump (costs 1 Energy), and Dog Toy (+1 Energy) / Avocado (−0.5 HP) pickups."

> "Build a title scene where the player types a short nickname and picks a bulldog color (white, black, red) before starting. Pass both into the game. Add a pause menu."

> "At the end of Level 3, add a Giant Cat boss with 6 health segments that throws fish projectiles the player crawls under. Bulldog Rush deals 2 damage, Fart Attack deals 1, stomping does nothing. A fish hit costs a heart and restarts the level."

> "Build the online scoreboard from specs/scoreboard.md — submit nickname + score to a shared Supabase table, show it sorted high to low, with a localStorage cache as offline fallback."

✅ Done when: someone can enter a nickname, pick a color, play all 3 levels, beat the Giant Cat, see the ending/credits, and see their score on the global board.

---

## Phase 5 — Ship it

Goal: put it on the internet so you can share a link.

- Push your code to **GitHub** (Claude Code can walk you through git).
- Deploy free with **Netlify**, **Vercel**, or **GitHub Pages** — drag-and-drop or connect the repo.

**Prompt:**
> "Help me deploy this Vite + Phaser game to Netlify for free, step by step."

✅ Done when: you have a public URL that plays your game.

---

## How to work with Claude Code (this matters most)

You're the PM; treat Claude Code like a strong engineer on your team.

- **Small tasks, one at a time.** "Add jumping," not "build the whole game."
- **Always ask it to explain.** End prompts with *"explain what this does and why."* That's how you learn by practice.
- **Paste errors back verbatim.** Red text in the terminal? Copy it to Claude Code and ask it to fix and explain.
- **Commit often.** After each working feature, commit to Git so you can always roll back.
- **Test the rules, playtest the feel.** Pull pure logic (score/HP/Energy math, movement rules, who-defeats-what) into plain modules and cover them with Vitest unit tests (the `story-unit-tests` skill helps). Keep CI green (`npm run lint && npm run test && npm run build`). Tests check the *rules*; manual playtesting decides whether it *feels* right. See the "Basic test checklist" in `Bulldog-8Bit-Checklist.md`.
- **Keep a running note** (a `NOTES.md`) of things you learned — Claude Code can maintain it for you.
- **Use a `CLAUDE.md`** in your project describing the game and stack, so Claude Code stays consistent. Ask it to generate one.

---

## Resources (practice-first, only when you need them)

**Core, in order of usefulness:**
- Phaser 3 official examples — labs.phaser.io (copy-run-tweak; the best way to learn)
- Phaser "Making your first game" tutorial — phaser.io/tutorials/making-your-first-game
- MDN "2D breakout / platform game" guides — developer.mozilla.org (gentle JS + game basics)

**Pixel art:**
- Piskel — piskelapp.com (free, browser, start here)
- Aseprite — aseprite.org (paid, best-in-class)
- Free asset packs if you ever want them: itch.io (search "8-bit platformer"), Kenney.nl (free, high quality)

**Level design & audio:**
- Tiled map editor — mapeditor.org
- Free 8-bit sound/music: freesound.org, opengameart.org, Kenney.nl

**JavaScript, only as much as you need:**
- javascript.info (reference when a concept confuses you — don't pre-read it cover to cover)

---

## Realistic timeline

Working evenings/weekends, no prior coding:
- Phase 0–1: weekend 1 (moving character)
- Phase 2–3: weekends 2–3 (art + one real level)
- Phase 4: weekends 4–5 (three levels + polish)
- Phase 5: an evening (deploy)

Your PM instinct — scope tightly, ship a slice, iterate — is exactly right here. Get a moving bulldog first; everything else builds on that.

---

## Suggested first move

Open Claude Code in an empty folder and paste:
> "I want to build a 2D platformer in Phaser 3 with Vite. I'm new to coding. Start by setting up the project and getting a blank game canvas running in my browser, explaining each step in plain language. Then create a CLAUDE.md describing the game: an 8-bit Mario-style platformer with a bulldog hero and 3 levels."
