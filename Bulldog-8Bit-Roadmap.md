# Bulldog 8-Bit — Build Roadmap (learn by doing)

A practice-first plan to build a Super Mario–style platformer with a bulldog hero, 3 levels, in the browser — using Claude Code. Written for a PM with no hands-on coding yet. You'll learn the concepts as you hit them, not before.

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
2. ⬜ Install **VS Code** — your editor. *Optional but recommended.* You already have a canvas running from the terminal, so this isn't blocking — but VS Code makes reading/editing files and running Claude Code much easier. Install it before Phase 1 if you can.
3. ⬜ Install **Git** + create a free **GitHub** account. *Do this before Phase 1.* Git is your undo/save system — you'll want it the moment you start changing code. GitHub is only needed later (Phase 5, deploy), but set up both now.
4. ✅ Scaffold the Phaser 3 + Vite project (package.json, CLAUDE.md, src/, index.html). **Done** — you ran this in a separate chat.
5. ✅ Run it and see a canvas in the browser. **Done** — the dev URL opens in Chrome.

So Phase 0 is *functionally complete* — the game runs. The only remaining to-dos are **VS Code** (convenience) and **Git/GitHub** (safety net). Knock out Git before you write real code in Phase 1.

**Prompt to give Claude Code (for the Git step):**
> "I'm new to coding. Help me install Git, initialize a git repo in my project folder, make a first commit, and explain what each command does in plain language."

✅ Done when: the canvas runs (✔) AND your project is under git version control.

---

## Phase 1 — Move a bulldog on screen (a few hours)

Goal: get a controllable character with gravity — the heart of any platformer.

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
- Optional: **hurt** (1 frame)

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

## Phase 3 — Build one full level (the biggest learning jump)

Goal: a complete, winnable Level 1 with platforms, one enemy type, coins, and a goal flag.

Concepts: **tilemaps** (levels built from a grid of tiles), **enemies & simple AI**, **collectibles**, **win/lose conditions**.

Steps:
1. Design the level layout. Easiest method: use **Tiled** (free map editor, mapeditor.org) to paint a level, or start with a simple hardcoded platform layout and graduate to Tiled.
2. Add **bones** to collect (score counter) — these are your collectible, not coins.
3. Add enemies that patrol — a **Cat** and a **Chihuahua**; bulldog dies on side-contact, defeats them by jumping on top (classic Mario rule).
4. Add the **level-complete reward**: the bulldog jumps up and lands asleep on a **sofa** (this replaces the plain goal flag).

**Prompt:**
> "Add bones as collectibles with a score counter. Add two patrolling enemies — a Cat and a fast little Chihuahua — that kill the player on side contact and die if the player lands on top. End the level with a sofa the bulldog jumps onto and falls asleep on, triggering a 'Level Complete' state."

✅ Done when: you can play Level 1 start to finish — collect bones, stomp a cat and a chihuahua, and finish asleep on the sofa.

---

## Phase 4 — Turn it into a real game (3 levels + polish)

Goal: multiple levels, a start screen, lives, and sound.

Concepts: **scenes/state management** (menu → level 1 → 2 → 3 → win screen), **level progression**, **audio**.

Steps:
1. Refactor so a level is data-driven — you load Level 2 and 3 by swapping map data, not rewriting code. Ask Claude Code to help you generalize.
2. Build 3 levels of rising difficulty (more gaps, more enemies, longer).
3. Add the **Big Cat boss** at the end of Level 3 — a large cat that takes multiple stomps to defeat before the level can be completed.
4. Build the **arcade start screen**: player types a **nickname** and picks a **bulldog color** (white / black / red) before playing. No login.
5. Add a **scoreboard** at the end: nicknames + scores, sorted high to low, saved in the browser with `localStorage` (survives refresh, no server).
6. Add lives and a score that carries across levels.
7. Add chiptune music + jump/bone sound effects (free packs below).

**Prompts (do these one at a time):**
> "Refactor my single level into a reusable Level scene that loads different tilemaps, so I can add level 2 and 3 by only changing map data. Then add a scene flow: Title → Level1 → Level2 → Level3 → Victory."

> "Build a title scene where the player types a short nickname and picks a bulldog color (white, black, red) before starting. Pass both into the game."

> "At the end of Level 3, add a Big Cat boss that takes 3 stomps to defeat before the level completes."

> "After the game ends, show a scoreboard of nicknames and scores sorted high to low, saved in localStorage so it persists between sessions."

✅ Done when: someone can enter a nickname, pick a color, play all 3 levels, beat the Big Cat, and see their score on the board.

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
