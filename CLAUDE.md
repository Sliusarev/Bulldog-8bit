# Buldog 8-Bit

An 8-bit, Mario-style 2D platformer built with **Phaser 3** and **Vite**. The hero
is a stubby, determined bulldog who runs, jumps, and stomps his way through three
levels. This file describes the game so any future coding session has the full
picture before writing code.

## Concept

You play as **Buldog**, a small pixel-art bulldog. The feel is classic NES
platforming: tight jumps, enemies you defeat by bouncing on them, coins to
collect, and a flag at the end of each level. Art is chunky 8-bit pixel art with a
limited retro color palette; music and sound effects are simple chiptune bleeps.

## Look and feel

- Internal resolution: 320x240, scaled up 2x, with crisp (non-blurry) pixels.
- Palette: classic NES sky blue (#5c94fc) background, warm browns and greens for
  ground, bright accents for coins and the hero.
- Physics: Phaser Arcade physics with downward gravity. Simple AABB collisions.

## Core mechanics

- **Move**: left/right arrow keys.
- **Jump**: up arrow or spacebar. Variable jump height (hold longer = jump higher).
- **Stomp**: land on an enemy's head to defeat it and bounce.
- **Take damage**: touching an enemy from the side costs a life; 3 lives total.
- **Coins**: collectibles that raise the score. 100 coins = 1 extra life.
- **Goal flag**: reaching the flag at the far right ends the level.

## The hero — Buldog

- A short, muscular bulldog with an underbite, sized about 16x16 pixels.
- Animations: idle, run, jump/fall, and a squashed "hurt" frame.
- Personality: brave, a little grumpy, loves his bone (the collectible theme could
  be bones instead of coins if desired).

## Levels

Three hand-designed levels of rising difficulty. Each ends with a goal flag.

1. **Backyard Bounce** — a gentle intro. Flat ground, a few floating platforms,
   slow-walking enemies (call them "Grumbler" beetles). Teaches move, jump, stomp,
   and coins.
2. **Sewer Scramble** — underground theme. Gaps to jump, moving platforms, and
   pipes. Adds a flying enemy and pits you can fall into.
3. **Rooftop Rush** — a fast, vertical finale. Tall jumps, crumbling platforms,
   more enemies, and a mini-boss (a big cat) guarding the final flag.

## Enemies

- **Grumbler** — walks back and forth on platforms; defeated by a stomp.
- **Flapper** — flies in a wave pattern; defeated by a stomp.
- **Big Cat (boss)** — appears in level 3; takes multiple stomps to defeat.

## Product ideas / feature backlog

These are confirmed design decisions to build toward. They refine the generic
concept above; where they conflict, these win.

- **Collectibles are bones, not coins.** During each level the bulldog grabs
  small bones scattered around. Bones raise the score (and can still grant an
  extra life at a milestone, e.g. 100 bones).
- **Enemies are cats and chihuahuas.** Replace the generic "Grumbler"/"Flapper"
  with: a **Cat** (walks/patrols, defeated by a stomp) and a **Chihuahua**
  (small, fast, yappy; defeated by a stomp). Both cost a life on side contact.
- **Level 3 boss — Big Cat.** Level 3 ends with a boss fight against a large
  cat that takes multiple stomps to defeat before the goal is reached.
- **Bulldog color select on start.** Before playing, the player picks the
  bulldog's color: **white, black, or red.** Chosen color is used for the
  hero sprite throughout (tint the sprite or swap sprite sheets per color).
- **Arcade-style nickname entry.** On the start screen the player types a short
  nickname (like a classic arcade cabinet). No account or login is required.
- **End-of-level reward animation.** When a level is completed, the bulldog
  jumps up and lands asleep on a **sofa** as the level-complete celebration
  (replaces / dresses up the plain goal flag).
- **Scoreboard.** At the end, show a high-score board listing nicknames and
  their scores, sorted high to low. Persist scores locally in the browser
  (e.g. localStorage) — no server or login needed.

## Tech setup

- **Framework**: Phaser 3 (arcade physics).
- **Build tool**: Vite (dev server + bundler).
- **Language**: plain JavaScript (ES modules), no TypeScript, to stay beginner-friendly.
- **Entry point**: `src/main.js` creates the `Phaser.Game` and lists the scenes.

### Project structure (current + planned)

```
Buldog_8bit/
├─ index.html          # Page that hosts the game canvas
├─ package.json        # Dependencies and npm scripts
├─ vite.config.js      # (optional) Vite settings — added only if needed
├─ src/
│  ├─ main.js          # Boots Phaser, holds the game config
│  ├─ scenes/          # (planned) one file per scene: Boot, Menu, Level1-3, GameOver
│  ├─ sprites/         # (planned) Buldog and enemy classes
│  └─ assets/          # (planned) images, tilemaps, audio
└─ CLAUDE.md           # This file
```

### Commands

- `npm install` — install dependencies (run once, and after editing package.json).
- `npm run dev` — start the local dev server with hot reload.
- `npm run build` — bundle the game for release into `dist/`.
- `npm run preview` — preview the built release locally.

## Conventions for future work

- Keep the code beginner-friendly: clear names, generous comments explaining *why*.
- One scene per file under `src/scenes/`; keep `main.js` focused on config.
- Prefer small, testable steps. After adding a feature, confirm the dev server
  still runs and the canvas renders without console errors.

## Roadmap (suggested build order)

1. Blank canvas running in the browser. ✅ (done)
2. Draw a placeholder ground and the Buldog sprite; make him move and jump.
3. Add coins and a score counter.
4. Add the Grumbler enemy and stomp mechanic.
5. Build Level 1 as a tilemap; add the goal flag and level-complete flow.
6. Add Levels 2 and 3, new enemies, and the Big Cat boss.
7. Add a title screen, lives/HUD, sound effects, and music.
