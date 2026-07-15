# Buldog 8-Bit

An 8-bit, Mario-style 2D platformer built with **Phaser 3** and **Vite**. The hero
is a stubby, determined bulldog who runs, jumps, and stomps his way through three
levels. This file describes the game so any future coding session has the full
picture before writing code.

## Concept

You play as **Buldog**, a small pixel-art bulldog making his way home across
town and into his house. The feel is classic NES platforming — tight jumps,
enemies you defeat by bouncing on them — layered with a few personality-driven
moves of his own (crawling to sneak past cats, a fart attack, an
uncontrollable high-speed rush) and simple RPG-lite resources (hearts, energy,
score). Art is chunky 8-bit pixel art with a limited retro color palette;
music and sound effects are simple chiptune bleeps.

## Project phases: Alpha & Beta

The full design below is the **north star**, but it is **not** built all at
once. The scope is split into two milestones so a playable slice ships first:

- **Alpha** — a thin, playable vertical slice: one level that proves the core
  loop end-to-end.
- **Beta** — everything else (the user expects to trim Beta further later).

Throughout this doc and the planning docs, features are tagged **`[Alpha]`** or
**`[Beta]`** so scope is greppable. When the two conflict, this section wins for
what ships in Alpha.

**In Alpha:**
- Start screen: **nickname entry** + **bulldog color select** (white/black/red).
- **One level**, platforming.
- Movement: run left/right, turn, single jump, and **double jump** (see Core
  mechanics — a stand-in to test the future High Jump feel).
- **Small Bones** collectibles → score = count of bones collected.
- **Level timer** → total elapsed time, shown as a second metric.
- **Simple enemy** that patrols and is killed **only by stomp** (jump on top).
- **3 hearts**, using the game's **confirmed damage rule**: enemy contact costs
  1 heart **and restarts the level from the beginning** (hearts carry over,
  don't refill); no i-frames; **0 hearts → Game Over**.
- **Goal marker** at the end → **results window** showing nickname, bones
  collected, and elapsed time.
- Carried over: crisp pixel rendering, CI stays green.

**Deferred to Beta (may be cut further):** Levels 2 & 3 and the narrative /
water-bowl endings · Energy system · Bulldog Rush · High Jump · Fart Attack ·
Crawl · Large Bone · Dog Toy · Avocado · other enemies (Cat hop behavior, Robot
Vacuum) · Giant Cat boss · **pause menu** · **online scoreboard + local cache** ·
music + full SFX · personality/ability animations (snore, fart, rush) · score
persistence across levels.

> **Alpha uses the confirmed damage rule as-is** (1 heart + level restart, no
> i-frames — see Health & Energy below). No Alpha-specific health divergence.

## Look and feel

- Internal resolution: 320x240, rendered crisp (non-blurry) and scaled with
  `Phaser.Scale.FIT` to fill the browser window (letterboxed to keep the 4:3
  ratio), with a fullscreen toggle — F key or on-screen button (`NFR-11`).
- Palette: classic NES sky blue (#5c94fc) daytime background (shifting to
  sunset/night tones for Levels 2–3), warm browns and greens for ground,
  bright accents for bones/collectibles and the hero.
- Physics: Phaser Arcade physics with downward gravity. Simple AABB collisions.

## The hero — Buldog

- A short, muscular bulldog with an underbite, sized about 16x16 pixels.
- Personality (drives animation/audio choices): loves sleeping and snores
  loudly; farts frequently; brave and fearless; always hungry; can run
  extremely fast but loses control while doing so; can perform powerful high
  jumps.
- Animations needed: idle (with an occasional snore-loop if idle too long),
  run, jump, crawl, fart-attack, rush (an "out of control" look — wobble/blur),
  and a squashed "hurt" frame.
- **Out of scope for now — Fatigue System.** Future idea: heavier-breathing
  animation/SFX (tongue out, panting) after intense activity. Purely
  cosmetic, not connected to any gameplay mechanic — don't build until
  explicitly asked.

## Core mechanics

### Standard movement `[Alpha]`
- **Move**: left/right arrow keys.
- **Jump**: single jump, spacebar.

### Double jump `[Alpha]`
- A second jump can be triggered once while already airborne (spacebar again) —
  exactly one extra mid-air jump, then the player must land before jumping again.
- Included in Alpha as a **stand-in to test the High Jump feel** (reaching higher
  platforms) before the Energy-costing High Jump ability exists. Distinct from
  the still-unbuilt "variable jump height" tuning (`MOVE-4`, `[Beta]`).

### Crawl `[Beta]`
- Bulldog lowers his body and crawls (likely a held direction + a key, e.g.
  down arrow — exact input TBD when this is spec'd).
- While crawling, **Cats cannot detect the Bulldog** (stealth vs. Cats).
- Also expected to double as how the player ducks under the Giant Cat boss's
  fish projectiles (see Boss, below) — same input, two uses.

### Enemy Stomp `[Alpha]`
- Landing on top of an enemy neutralizes it (classic Mario rule). Applies to
  Angry Pomeranian, Cat, and Robot Vacuum Cleaner (vacuum only from above).
- **In Alpha**, stomp is the *only* way to defeat the (single, simple) enemy —
  Fart Attack and Bulldog Rush are `[Beta]`.

### Fart Attack `[Beta]`
- Unlimited use — no Energy cost.
- Bulldog must turn around before farting; ~1 second activation delay.
- Neutralizes Cats and Angry Pomeranians within range. **Does not work on the
  Robot Vacuum Cleaner** (needs a stomp-from-above or Bulldog Rush instead).

### Health & Energy
- **Health** `[Alpha]`: 3 HP, shown as hearts.
- **Damage rule (confirmed — applies in Alpha too):** getting hit by any enemy
  — including the Giant Cat boss's fish projectiles — costs **1 heart**, and
  **the current level restarts from the beginning** (the reduced heart count
  carries over; hearts don't refill on restart). Classic-Mario-style, not an
  instant "game over" on the first hit.
- **Game Over** `[Alpha]`: when hearts reach 0, the run ends.
- Because every hit already removes the player from danger (via the level
  restart), there's no invulnerability/i-frame window in this design — see
  `CHAR-5` in the WBS for why that was cut rather than built.
- **Energy** `[Beta]`: 3 segments, spent on Bulldog Rush and High Jump (see
  Special Abilities). Only known refill source is the Dog Toy pickup — no passive
  regen is specified, treat that as the rule unless told otherwise.

## Special Abilities `[Beta]`

### Bulldog Rush — Cost: 3 Energy
- Launches Bulldog into an uncontrolled high-speed sprint.
- Destroys all enemies in his path; difficult to steer during activation.
- Useful against large groups of enemies. Unlocked partway through Level 2.

### High Jump — Cost: 1 Energy
- Reaches hidden areas; used to collect bonus rewards and secret collectibles.
- Distinct from any future "variable jump height" tuning on the standard
  jump (holding jump longer) — that's a separate, still-unbuilt idea, not
  this ability.

## Collectibles

> Note: the original design notes used "XP" for what turns out to mean HP
> (hearts) — a translation artifact, not a separate experience-point system.
> Written here as HP throughout.

- **Small Bone** `[Alpha]` — increases Score. In Alpha the score is simply the
  **count of Small Bones collected** (shown alongside the level timer).
- **Large Bone** `[Beta]` — worth double a Small Bone's score, and heals **+1 HP**
  (one heart), capped at the starting max of 3 — assumption, flag if Large
  Bone should be able to grant a bonus heart beyond 3.
- **Dog Toy** `[Beta]` — grants +1 Energy.
- **Avocado** `[Beta]` — a hazard pickup: **-0.5 HP**. Eating 2 Avocados costs a full
  heart. Assumption: this quietly reduces HP without triggering the
  level-restart rule (that's specifically for enemy/boss contact) — flag if
  Avocado damage should restart the level too.

## Enemies

- **Angry Pomeranian** — patrols a designated area. Contact costs 1 heart and
  restarts the level. Defeated by: Enemy Stomp, Fart Attack, or Bulldog Rush.
  **Alpha uses a trimmed version of this as its single "simple enemy":** it
  patrols and is defeated by **stomp only** (Fart/Rush are `[Beta]`); contact
  follows the confirmed damage rule (1 heart + level restart, no i-frames).
- **Cat** `[Beta]` — moves in short jumps with a brief pause between hops; can appear
  on platforms, ground level, or elevated positions. Contact costs 1 heart
  and restarts the level. Defeated by: Enemy Stomp, Fart Attack, or Bulldog
  Rush. Cannot detect the Bulldog while he's crawling.
- **Robot Vacuum Cleaner** `[Beta]` — moves quickly through the house, detects and
  chases the Bulldog. Contact costs 1 heart and restarts the level. Defeated
  only by: Enemy Stomp from above, or Bulldog Rush (**not** Fart Attack).

### Boss — Giant Cat (end of Level 3) `[Beta]`
- Throws fish projectiles and patrols a large area.
- Player strategy: duck/crawl under fish projectiles, approach carefully,
  use Fart Attack and Bulldog Rush to whittle down its health.
- **Boss health**: 6 segments. Damage: Bulldog Rush = 2 segments, Fart Attack
  = 1 segment (stomp isn't listed as a valid boss-damage method).
- Getting hit by a fish projectile follows the same rule as regular enemies:
  **-1 heart and Level 3 restarts from the beginning** (confirmed — same rule
  everywhere, no special-cased boss damage).

## Locations & Levels

> **Alpha** ships **one** level only: a single platforming level (Street,
> daytime is fine) populated with Small Bones and the simple stompable enemy,
> ending at a plain **goal marker** that opens the results window (nickname +
> bones + elapsed time). It does **not** need the narrative water-bowl ending or
> any of the fuller Level 1–3 content below — those are `[Beta]`.

The full design (below) is `[Beta]`. Two locations: **Street** (Levels 1–2) and
**House** (Level 3). Rising difficulty across 3 levels, each with its own
narrative ending rather than a repeated generic reward.

1. **Level 1 — The Walk** (Street, daytime) `[Beta]`
   - Enemies: Angry Pomeranians, Cats.
   - Collectibles: 2 Energy pickups; 2 High Jump secret locations, each
     containing bonus bones.
   - Ending: Bulldog reaches a water bowl and drinks.
2. **Level 2 — The Journey Home** (Street, sunset) `[Beta]`
   - Enemies: Angry Pomeranians, Cats.
   - New mechanic unlocked here: **Bulldog Rush**.
   - Collectibles: 3 Energy pickups, plus 2 more near the finish; 2 High
     Jump secret locations; 1 Large Bone.
   - Challenge: large groups of Cats and Angry Pomeranians near the end.
   - Ending: Bulldog drinks water and enters the house.
3. **Level 3 — Home Sweet Home** (House, night) `[Beta]`
   - Enemies: Robot Vacuum Cleaners, and Cat + Vacuum combinations.
   - Boss: Giant Cat.
   - Final scene: Bulldog defeats the Giant Cat, walks to the bedroom, climbs
     into bed beside his humans, falls asleep and starts snoring. **End
     credits roll.**

## Product ideas / feature backlog

Meta/UI features not covered by the game-design spec above — still planned,
unaffected by it:

- **Bulldog color select on start.** `[Alpha]` Before playing, the player picks the
  bulldog's color: **white, black, or red.** Chosen color is used for the
  hero sprite throughout (tint the sprite or swap sprite sheets per color).
- **Arcade-style nickname entry.** `[Alpha]` On the start screen the player types a short
  nickname (like a classic arcade cabinet). No account or login is required.
- **End-of-level results window.** `[Alpha]` When the player reaches the goal
  marker (or hits Game Over), show a simple window with the **nickname**, the
  **number of bones collected**, and the **total elapsed time** for the level.
  This is the Alpha stand-in for the fuller scoreboard below — local only, no
  backend.
- **Scoreboard (online).** `[Beta]` At the end, show a high-score board listing
  nicknames and their scores, sorted high to low. Scores are stored **online**
  in a shared table via a Backend-as-a-Service (recommended: Supabase; Firebase
  is an alternative), so all players see the same global rankings across
  devices. A local `localStorage` cache is kept as an offline fallback. Still
  no account or login required. See `specs/scoreboard.md` for the full spec.

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
├─ eslint.config.js    # Lint rules
├─ vite.config.js      # (optional) Vite settings — added only if needed
├─ .github/
│  └─ workflows/ci.yml # Lint + test + build on every push/PR to main
├─ src/
│  ├─ main.js          # Boots Phaser, holds the game config
│  ├─ scenes/          # (planned) one file per scene: Boot, Menu, Level1-3, GameOver
│  ├─ sprites/         # (planned) Buldog and enemy classes
│  ├─ physics/         # Pure, unit-tested game logic (e.g. player.js + player.test.js)
│  └─ assets/          # (planned) images, tilemaps, audio
├─ specs/              # Feature specs (spec-driven workflow); _TEMPLATE.md to start one
├─ .claude/skills/      # Project-specific Claude Code skills, e.g. story-unit-tests
└─ CLAUDE.md           # This file
```

### Commands

- `npm install` — install dependencies (run once, and after editing package.json).
- `npm run dev` — start the local dev server with hot reload.
- `npm run build` — bundle the game for release into `dist/`.
- `npm run preview` — preview the built release locally.
- `npm run lint` — run ESLint.
- `npm run test` — run the Vitest unit test suite.

## Architecture notes

### Branching & workflow
- **Trunk-based development.** Work happens on short-lived feature branches
  (e.g. `phase2-bulldog-art`) opened as a PR into `main`, even as a solo dev —
  the PR is a review checkpoint (a diff to read before it's permanent) and an
  easy revert point, not a process gate. No required external reviewers or
  branch protection rules; that would be more ceremony than a solo hobby
  project needs.
- Prefer small, frequent merges over long-lived branches — matches the
  "small, testable steps" convention below.

#### The agreed delivery flow (per feature)

This is the order every feature follows. **Claude never merges to `main`
directly** — the PR + Artem's approval is the gate.

1. **Approved requirements (spec).** A spec in `specs/` is written and approved
   before implementation starts.
2. **Claude presents a plan + risk level.** Before writing any code, Claude
   lays out the implementation plan and rates its **risk** (see the rubric
   below). This tells Artem whether the requirements are solid and the plan is
   clear enough to proceed.
3. **Claude implements (locally).** Built on a feature branch, with unit tests
   and a green local `lint` / `test` / `build`.
4. **Artem reviews & tests the results.** Artem runs it locally (dev server /
   playtest) and reviews the behavior.
5. **Artem confirms it works as expected.** Explicit go-ahead — not assumed.
6. **Claude creates the PR.** Claude pushes the feature branch and opens the
   PR into `main` (if the `gh` CLI isn't available, Claude pushes the branch
   and provides the compare URL for Artem to open the PR).
7. **Artem approves the PR in GitHub.**
8. **Merge completed** — the PR is merged into `main`.

#### Plan + risk assessment (step 2)

Before implementing a new spec, Claude states the plan and marks a **risk
level**, scored by **how many assumptions** the approach rests on (an
assumption = anything the spec doesn't nail down that Claude has to decide or
guess to proceed):

| Assumptions | Risk | Meaning |
|---|---|---|
| 1–2 | **Low** | Requirements are clear; plan is well-grounded. |
| 3–5 | **Medium** | Some gaps filled by judgment — worth a skim before building. |
| 6–10 | **High** | Many open decisions — the spec likely needs tightening first. |
| 11+ | **Not ready** | Too much is unspecified. Claude says it's **not ready to implement** and asks for clarification instead of proceeding. |

Claude lists the actual assumptions (not just the count) so Artem can confirm
or correct them. The point is to surface shaky requirements *before* code is
written, not after.

### Continuous integration (CI)
- GitHub Actions runs on every push/PR targeting `main`
  (`.github/workflows/ci.yml`).
- Steps: install deps → lint (`npm run lint`) → unit test (`npm run test`) →
  build (`npm run build`). A red run means don't merge.

### Testing strategy
- Unit tests (Vitest) cover **pure logic only** — movement/jump rules, score
  math, collision math — not Phaser rendering or scene lifecycle, which isn't
  practically unit-testable outside a real browser/canvas.
- To keep logic testable, pull it out of Phaser's `update()`/`create()`
  callbacks into plain exported functions (e.g. `src/physics/player.js`), and
  have the Scene call them. The Scene stays a thin adapter between Phaser and
  the tested logic — it doesn't itself get unit tests.
- Each feature spec in `specs/` should get a matching test file once it has
  testable logic — e.g. `specs/player-physics.md` → `src/physics/player.test.js`.
- Manual playtesting still decides whether something *feels* right (jump
  height, walk speed) — tests check the rules, not the feel.

### Code style / linting
- ESLint (flat config, `eslint.config.js`) catches baseline issues (unused
  vars, undefined globals, etc.). Run via `npm run lint`; CI fails on lint
  errors.
- No enforced formatter (Prettier) yet — keep formatting simple by hand; add
  one later only if inconsistent formatting actually becomes a problem.

## Conventions for future work

- Keep the code beginner-friendly: clear names, generous comments explaining *why*.
- One scene per file under `src/scenes/`; keep `main.js` focused on config.
- Prefer small, testable steps. After adding a feature, confirm the dev server
  still runs and the canvas renders without console errors.

### Keep the tech stack consistent — no "tech zoo"

- The stack is deliberately small: **Phaser 3 + Vite + plain JS (ES modules),
  Vitest for tests, ESLint for lint.** Stay within it by default.
- If a story seems to need a **new dependency, tool, or a change to the tech
  stack**, do **not** just add it. **Flag it explicitly and explain why** —
  what it's for, why the existing stack can't do the job, and what it costs to
  support. Get Artem's sign-off before pulling it in. A pile of
  one-off tools makes the project hard to scale and support; every addition
  has to earn its place.
- Prefer solving things with what's already here (Phaser's built-ins, plain
  JS) over reaching for a library.

### Maximum reuse — keep the code clear and consistent

- **Reuse before you build.** Before adding a new module, sprite, helper, or
  pattern, check whether an existing one already does it (or nearly does it)
  and extend/reuse that instead of creating a parallel version. Examples of
  existing shared logic to build on: `src/physics/` (pure, tested rules like
  `player.js`, `animation.js`), `src/state/` (e.g. `color-select.js`).
- **Push reuse back up to the spec/design.** If, while implementing, you see
  that a "new" element in the requirements could be an existing element reused
  or generalized, **say so and suggest it** rather than silently building a
  duplicate. Consolidating beats duplicating.
- Match the surrounding code's style, naming, and structure so the codebase
  reads as one consistent thing, not a patchwork.

## Roadmap (suggested build order)

See `Bulldog-8Bit-WBS.md` for the full Epic/Feature breakdown and
`Bulldog-8Bit-Checklist.md` for the Alpha/Beta build tracker — this is just a
rough suggested order, not the source of truth.

**Alpha — ship the thin slice first:**
1. Blank canvas running in the browser. ✅ (done)
2. Placeholder ground and player rectangle; move and jump. ✅ (done)
3. Bulldog art + color select (idle/run/jump art ✅ done via `CHAR-2`; color select ✅ done; the `CHAR-3` **hurt** frame is still to do).
4. Add **double jump** (stand-in for High Jump testing).
5. Add **Small Bone** collectibles and a bone-count score.
6. Add the **simple stompable enemy** and the stomp mechanic.
7. Add **3 hearts** (confirmed rule: hit = 1 heart + level restart, no i-frames) and Game Over.
8. Add the **level timer** (elapsed time).
9. Add **nickname entry** + a minimal start screen (with color select).
10. Assemble the **single level** with a **goal marker** → **results window**
    (nickname + bones + time).

**Beta — everything after the slice ships:**
11. Add Large Bone / Dog Toy / Avocado pickups and the Energy system.
12. Add Crawl, Fart Attack, Bulldog Rush, and High Jump.
13. Add the Cat and Robot Vacuum enemies (the level-restart damage rule already applies from Alpha).
14. Build the fuller Levels 1–3 with their narrative endings and the Giant Cat boss.
15. Add the pause menu, full HUD, sound effects, and music.
16. Add the online scoreboard.
