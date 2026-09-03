# Feature Spec: Simple enemy + stomp (`ENEMY-1` trimmed + `ENEMY-4`)

> **Scope:** `[Alpha]`. WBS: `ENEMY-1` (trimmed), `ENEMY-4`. Related:
> `ENEMY-3` / `STATE-1` (the damage rule — 1 heart + level restart, its **own
> next story**), `LEVEL-6` (final enemy placement), `CHAR-3` (hurt frame),
> `UI-3` (HUD).
> Fart Attack (`ABILITY-1`), Bulldog Rush (`ABILITY-2`), Cat (`ENEMY-2`) and
> Robot Vacuum (`ENEMY-5`) kill paths are `[Beta]`.

> **Status:** v3 — implemented, in playtest. Revised after the first playtest:
> the sprite is **halved** to a 25x25 cell, the enemy now **also turns when it
> bumps into something**, and the patrol-state field was renamed off Phaser's
> reserved `originX` (see "Playtest fixes" at the end).
>
> *(Earlier: draft v2 for review (workflow step 1). Revised per Artem's
> feedback: **enemy death is a Mario-style knock-away** (§5), and the enemy
> sprite sheet is supplied and analysed — **walk only, no idle state** (§5).
> No open items left.)*

---

## 1. Summary
Add one **patrolling enemy** to the level that the player defeats by **landing
on its head** (classic Mario stomp), bouncing slightly afterwards. Touching it
from the side or below is a **hit** on the player — this story detects and
signals the hit; the actual heart loss + level restart is `ENEMY-3`, the next
story.

## 2. User story
As a **player**, I want an enemy that walks back and forth and dies when I jump
on it, so that **the level has something to overcome, not just collect**.

## 3. Scope

**In scope**
- **One enemy instance** placed in the level (provisional position — final
  layout with `LEVEL-6`), spawned via a small `spawnEnemies()` helper so more
  can be added later without redesign.
- **Patrol behaviour:** walks horizontally at a constant speed and **turns
  around** when it either (a) **bumps into something solid** — a wall, an
  obstacle, or the edge of the screen — or (b) reaches the end of its patrol
  range on open ground; the sprite flips to face its direction of travel.
- **Stomp kill (`ENEMY-4`):** when the player lands on the enemy from above,
  the enemy is defeated and the player gets a **small upward bounce**.
- **Mario-style death animation:** on death the enemy is **knocked upward at
  15% of a normal jump**, then falls **straight down through the ground** and
  off the bottom of the screen (its collisions are switched off, so it passes
  through the floor), after which it is removed.
- **Hit detection (side / below):** any non-stomp contact is classified as a
  **hit** on the player. In this story a hit only logs + triggers a temporary
  visible reaction (see §5); no hearts exist yet.
- **The pure "stomp vs. side-hit" decision** and the **patrol turn rule** in a
  unit-tested module `src/physics/enemy.js` (mirroring `player.js` /
  `animation.js`), so the Scene stays a thin adapter.
- **Temporary dev key:** the existing **R** refresh key also respawns the
  enemy, so stomping can be re-tested without reloading.
- **Enemy art:** a free animated cat sprite sheet supplied by Artem (see §5) —
  a **placeholder stand-in for the Angry Pomeranian**, swappable later. It has
  **one state only — walk** (it patrols non-stop, so there is no idle state and
  none is needed).

**Out of scope**
- **The damage rule itself** (`ENEMY-3` / `STATE-1`): hearts, HP loss, level
  restart, Game Over. Next story.
- **The hurt frame** (`CHAR-3`) and any hurt/death SFX (`AUDIO-*`, `[Beta]`
  apart from the bone blip already shipped).
- Fart Attack / Bulldog Rush kill paths, multiple enemy types, chasing or
  player-detection AI, enemy–enemy collisions.
- A squash/flattened death *frame* for the enemy — the sheet has no such art,
  so death is conveyed by the knock-away motion alone (the walk frames keep
  playing as it flies off).
- An **idle** enemy state — deliberately none; it always walks.
- More than one enemy, and final placement (`LEVEL-6`).

## 4. Acceptance criteria

- [x] **AC1** Given the level starts, then one enemy is visible on the ground,
      playing its walk animation.
- [x] **AC2** Given the enemy is patrolling, when it reaches the end of its
      patrol range, then it reverses direction and keeps walking (indefinitely).
- [x] **AC2b** Given the enemy is patrolling, when it walks into a solid object
      or the edge of the screen, then it reverses direction and patrols the
      other way — whether or not it has reached the end of its range.
- [x] **AC3** Given the enemy is walking, then its sprite faces the direction
      it is moving.
- [x] **AC4** Given the player is falling onto the enemy's top, when they
      touch, then the enemy is defeated and removed from the level.
- [x] **AC5** Given a successful stomp, then the player is given a small upward
      bounce (less than a full jump).
- [x] **AC5b** Given the enemy is defeated, then it is launched upward at
      **15% of the normal jump velocity**, stops colliding with the ground and
      the player, falls **through** the ground, and is removed once it is below
      the bottom of the screen.
- [x] **AC6** Given the player touches the enemy from the **side** (or from
      below, moving upward), then it is classified as a **hit on the player**,
      not a stomp — the enemy survives.
- [x] **AC7** Given the enemy has been defeated, then it can no longer be
      stomped or hit (no repeat triggers on following frames) — including while
      it is still visibly falling off-screen.
- [x] **AC8** Given a defeated enemy, when **R** is pressed, then the enemy
      respawns at its start position and resumes patrolling.
- [x] **AC9** While **alive**, the enemy does not fall through the ground and
      does not walk off the world bounds. (Falling through the ground is the
      *dead* state's behaviour only.)
- [x] **AC10** No console errors during patrol, stomp, or hit.

## 5. UX / behaviour details

**Art (placeholder).** Artem supplied a free animated **cat/octopus** sheet
(`github-octopuss.png`) that stands in for the enemy for now. It is committed
as `src/assets/enemy-cat.png` and loaded exactly like `bone.png` /
`buldog.png`.

Sheet layout (read off the file, resolved — no open questions):

| Property | Value |
|---|---|
| Image size | **50 x 50 px** (halved from the supplied 100x100 after playtest) |
| Grid | 2 x 2 |
| **Cell size** | **25 x 25 px** (`frameWidth: 25, frameHeight: 25`) |
| **Walk frames** | **0-3** (all four; frames 1 and 3 are identical — an A-B-C-B bob loop, so the cycle reads smoothly) |
| Drawn content | inset ~2 px each side; feet near the cell's bottom edge |
| Other states | **none** — walk is the only state (by design, see §3) |

Frame rate ~6-8 fps, `repeat: -1`, tuned by eye. Drawn at its native cell size
with **no `setScale`** — the sheet itself was resized 2x instead (nearest
neighbour, keeping the pixels crisp), because `CLAUDE.md` warns that combining
`setScale` with a custom physics body size breaks Arcade Physics' offset math,
the same trap already avoided on the bulldog. At 25x25 the enemy reads as
noticeably smaller than the 48x48 bulldog, as intended. The physics body is
inset inside the cell to match the drawn body, the same way the bulldog's 24x24
body is inset in its 48x48 frame.

**Patrol.** Constant horizontal speed (30% of the player's walk, so it's always
beatable). Two independent reasons to turn around, both decided by the same
pure rule:

1. **An obstacle** — the body is pressed against something **solid** on the
   side it's walking towards (Phaser's `blocked` flags: a wall, a platform
   edge, the world bounds). Deliberately **not** `touching`, which Arcade
   Physics also sets for overlaps — the player is not an obstacle (see
   "Playtest fixes round 2").
2. **The end of its range** — its spawn x ± a half-width, which is what makes it
   patrol on **open ground**, where there is nothing to bump into.

The obstacle check wins: whatever the range says, the enemy physically can't
walk through a wall. Both are checked **against the direction of travel**, so
touching something it's already walking away from doesn't flip it, and it can
never oscillate on the spot.

**Stomp.** On overlap, the decision is made from the two bodies' state:
- the player is **moving downward**, and
- the player's feet are **above the enemy's midpoint**

→ **stomp**:
1. The enemy is marked **dead** immediately and stops counting as a target —
   its overlap/collision handling is switched off, which is what guarantees
   the "triggers exactly once" criterion (the bones use the same idea via
   `disableBody`; here the body stays *active* so the corpse can still fly, so
   the flag/collider is what's removed instead).
2. The **player** gets an upward bounce — `velocityY` set to a fraction of
   `JUMP_VELOCITY` (~40-50%, tuned by feel).
3. The **enemy** gets knocked upward at **15% of `JUMP_VELOCITY`**, keeps
   gravity, and loses its ground collider — so it pops up, arcs over, and
   sinks **through** the floor and off the bottom of the screen (Mario's
   knocked-away enemy). Once its y is past the world's bottom edge it is
   destroyed/disabled to free the sprite.

Otherwise → **hit**. In this story, a hit produces a **temporary visible
reaction only**: a short red flash/tint on the player plus a console log, so
the classification is testable by playtest. `ENEMY-3` replaces that with the
real heart loss + level restart.

**Input.** No new keys. **R** (existing dev key) additionally respawns the
enemy alongside the bones.

## 6. Data & persistence
Nothing persisted. Enemy state (position, direction, alive/dead) lives on the
Scene for the session only and resets on reload — same as bones. No new
registry keys in this story; the heart count that `ENEMY-3` introduces will be
mirrored into the registry the way `score` already is.

## 7. Edge cases & error handling
- **Stomping while moving sideways** — still a stomp, as long as the player is
  descending onto the top (AC4 is about vertical relation, not horizontal).
- **Landing on the very edge** of the enemy — resolved by the same rule; a
  glancing edge touch while descending counts as a stomp (kept deliberately
  forgiving, classic-Mario style).
- **Rising into the enemy from below** — a hit, never a stomp.
- **Player and enemy overlapping at spawn** — avoided by placing the enemy away
  from the spawn point; noted for `LEVEL-6`.
- **Double trigger on one stomp** — prevented by the dead flag being set in the
  same frame as the stomp, before any further overlap can fire (AC7). A dead
  enemy is inert even though it is still on screen falling.
- **Stomping a corpse mid-fall** — impossible: the dead enemy no longer
  participates in the overlap check.
- **Dead enemy never leaving the screen** — its collider with the ground and
  the world bounds is removed on death, so nothing can catch it; a y-past-the-
  bottom check cleans it up regardless.
- **Enemy reaching world bounds** — the patrol range is set inside the world,
  and `setCollideWorldBounds(true)` is a backstop (AC9).

## 8. Dependencies
- **Builds on:** `src/physics/player.js` (`JUMP_VELOCITY` — the basis for both
  the player's bounce and the enemy's 15% death pop),
  the ground collider and spritesheet/animation pattern already in
  `src/main.js`, the bones' `staticGroup` + `disableBody` + **R**-refresh
  pattern (`specs/small-bones.md`).
- **Must not break:** movement/double jump (`MOVE-7`), bone collection
  (`SCORE-1`), fullscreen scaling (`NFR-11`).
- **Unblocks:** `ENEMY-3` / `STATE-1` (hearts + level restart) consume the
  "hit" signal this story produces.

## 9. Definition of done
All acceptance criteria pass, pure logic unit-tested in
`src/physics/enemy.test.js` (one test per testable AC), `npm run lint` /
`test` / `build` green, playtested with no console errors, merged to `main`
via PR.

---

## Technical design

> Workflow step 3 (see `CLAUDE.md` → "The agreed delivery flow"). Approved by
> Artem before implementation starts.

### Files touched / created

| File | Change |
|---|---|
| `src/assets/enemy-cat.png` | **new** — copied from `~/Downloads/github-octopuss.png` (100x100, 2x2 grid of 50x50 cells) |
| `src/physics/enemy.js` | **new** — the pure patrol / stomp-vs-hit / cleanup rules |
| `src/physics/enemy.test.js` | **new** — one test per testable acceptance criterion |
| `src/main.js` | edited — preload the sheet, `enemy-walk` animation, `spawnEnemies()`, ground collider, patrol in `update()`, the player↔enemy overlap, and **R** also respawning the enemy |
| `Bulldog-8Bit-Checklist.md`, `Bulldog-8Bit-WBS.md` | edited at the end — tick `ENEMY-1`/`ENEMY-4` (via the `update-checklist` skill) |

No new dependencies, libraries or tools — Phaser's built-in groups, overlap,
colliders and animations cover all of it.

### Module design — `src/physics/enemy.js` (pure, testable)

Same shape and house style as `player.js` / `animation.js` / `score.js`:
exported tuning constants plus tiny pure functions, **no Phaser import**.

```js
// Tuned values — the single source of truth for these numbers.
export const PATROL_SPEED_FACTOR = 0.3;  // of the player's WALK_SPEED
export const PATROL_SPEED = WALK_SPEED * PATROL_SPEED_FACTOR; // = 30 px/s
export const PATROL_HALF_RANGE = 60;     // px each side of the spawn x
export const STOMP_BOUNCE_FACTOR = 0.2;  // of JUMP_VELOCITY -> the *player's* hop
export const DEATH_POP_FACTOR = 0.15;    // of JUMP_VELOCITY -> the *enemy's* knock-away

export const CONTACT = { STOMP: "stomp", HIT: "hit", NONE: "none" };

// Which way the enemy should be walking this frame: flips at the ends of its
// patrol range. Pure — takes positions/direction, returns the new direction.
export function nextPatrolDirection({ x, patrolOriginX, direction, blockedLeft, blockedRight }, halfRange = PATROL_HALF_RANGE)

// The velocity that direction implies (mirrors getWalkVelocityX's role).
export function getPatrolVelocityX(direction, speed = PATROL_SPEED)

// Classifies a player<->enemy touch. Returns CONTACT.STOMP / HIT / NONE.
//   dead                                        -> NONE
//   player descending AND player's feet above
//     the enemy's midpoint                      -> STOMP
//   anything else (side, or rising from below)   -> HIT
export function classifyContact({ playerVelocityY, playerBottom, enemyMidY, isDead })

// The two impulses a stomp produces, derived from the player's JUMP_VELOCITY
// so the numbers can never drift apart from the jump tuning.
export function getStompBounceVelocity(jumpVelocity)   // player: 20% of the jump
export function getDeathPopVelocity(jumpVelocity)      // enemy:  15% of the jump

// Corpse cleanup: has the knocked-away enemy fallen past the bottom edge?
export function isOffScreenBelow(y, worldHeight)
```

`classifyContact` returning a **three-value enum** rather than a boolean is
deliberate: `NONE` is what makes "a dead enemy is inert" (AC7) a *tested rule*
instead of an `if` buried in the Scene, and `HIT` is the exact signal
`ENEMY-3` will consume next story — it won't need to re-derive anything.

**The Scene stays a thin adapter:** it owns sprites, groups, colliders and
input, and calls these functions; no patrol or stomp rule lives in
`update()`/`create()`.

### Scene wiring (`src/main.js`)

1. **preload:** `this.load.spritesheet("enemy", enemySheet, { frameWidth: 50, frameHeight: 50 })`.
2. **create:**
   - Animation `enemy-walk`: `generateFrameNumbers("enemy", { start: 0, end: 3 })`,
     `frameRate: 7`, `repeat: -1`. All four cells are used — frames 1 and 3 are
     identical, which is what makes it an A-B-C-B bob rather than a jitter.
   - `this.enemies = this.physics.add.group()` — a **dynamic** group (not the
     bones' `staticGroup`): these move and are affected by gravity.
   - `spawnEnemies()` helper (mirrors `spawnBones()`), one enemy for now at a
     provisional x well clear of the player's spawn.
   - `this.physics.add.collider(this.enemies, ground)`.
   - `this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this)`.
3. **spawnEnemies():** creates (or revives) the sprite, sets
   `body.setSize(32, 36)` + a centred/bottom-aligned offset inside the 50x50
   cell (same inset reasoning as the bulldog's 24x24 body), stores
   `enemy.patrolOriginX` and `enemy.direction = 1`, `enemy.isDead = false`,
   `setCollideWorldBounds(true)`, and plays `enemy-walk`.
4. **update() — patrol:** for each alive enemy,
   `enemy.direction = nextPatrolDirection(enemy)` then
   `body.setVelocityX(getPatrolVelocityX(enemy.direction))` and
   `setFlipX(enemy.direction < 0)`.
5. **update() — corpse cleanup:** for each dead enemy,
   `isOffScreenBelow(enemy.y, this.scale.height)` → `enemy.destroy()`.
6. **hitEnemy(player, enemy):** calls `classifyContact({...})` and switches:
   - **STOMP** → `enemy.isDead = true`;
     set `enemy.body.checkCollision.none = true` and clear
     `collideWorldBounds` so nothing can catch it on the way down. This is done
     **per body**, not by disabling the shared group collider — otherwise
     killing one enemy would drop every other enemy through the floor once the
     level has more than one; `enemy.body.setVelocityX(0)` and
     `setVelocityY(getDeathPopVelocity(JUMP_VELOCITY))` (gravity does the rest);
     then the player's `setVelocityY(getStompBounceVelocity(JUMP_VELOCITY))`.
     Setting `isDead` **first**, in the same frame, is what prevents a second
     trigger — the next overlap call classifies `NONE`.
   - **HIT** → **temporary** reaction only: a short red tint on the player plus
     a `console.log`. Replaced wholesale by `ENEMY-3`'s heart loss + level
     restart next story; nothing else depends on it.
   - **NONE** → do nothing.

### Data flow / state

- Per-enemy state (`patrolOriginX`, `direction`, `isDead`) lives on the sprite
  instance — Phaser game objects take arbitrary properties, and keeping it on
  the sprite means adding a second enemy later needs no extra bookkeeping.
- No registry keys and nothing persisted in this story. `ENEMY-3` will mirror
  the heart count into the registry the way `score` already is.
- Every enemy number is *derived* from the player's tuning: `PATROL_SPEED`
  from `WALK_SPEED`, and both impulses from `JUMP_VELOCITY` (both imported
  from `player.js`). Retuning the player's walk or jump therefore retunes the
  enemy with it, and the two can never silently drift apart.

### Reuse

- **Reused:** the `src/physics/` pure-rule pattern and file/comment style
  (`player.js`, `animation.js`); `WALK_SPEED` and `JUMP_VELOCITY` as the single
  movement-tuning source, with every enemy value expressed as a fraction of
  them; the spritesheet + `anims.create` + `generateFrameNumbers` approach
  from `CHAR-2`; the inset-physics-body technique from the bulldog; the
  `spawnBones()` / **R**-refresh dev pattern from `SCORE-1`; the existing
  `ground` static body and its collider.
- **Genuinely new:** the enemy asset, `enemy.js`, and a **dynamic** physics
  group (the bones' group is static because bones don't move — an enemy that
  walks and falls needs a dynamic body, so this can't reuse that group type).
- **No new dependencies, libraries or tools.**

### Test plan

| Acceptance criterion | Covered by |
|---|---|
| AC1 enemy visible, walk animation playing | 👁 playtest |
| AC2 reverses at the ends of its patrol range | 🧪 unit (`nextPatrolDirection` at both ends, and mid-range = unchanged) |
| AC2b reverses when it bumps into an object or the screen edge | 🧪 unit (blocked left/right, a block behind it ignored, blocked mid-range, walled in on both sides, and the player not counting as an obstacle) |
| Patrol speed is 30% of the player's walk | 🧪 unit (`PATROL_SPEED` vs `WALK_SPEED`) |
| AC3 sprite faces direction of travel | 🧪 unit (`getPatrolVelocityX` sign) + 👁 playtest for the flip |
| AC4 stomp from above defeats the enemy | 🧪 unit (`classifyContact` → `STOMP`) |
| AC5 player gets a small bounce (< full jump) | 🧪 unit (`getStompBounceVelocity` = 20% of, and well under, `JUMP_VELOCITY`) |
| AC5b enemy popped at 15%, falls through the ground, removed off-screen | 🧪 unit (`getDeathPopVelocity`, `isOffScreenBelow`) + 👁 playtest for the fall |
| AC6 side / from-below contact = hit, enemy survives | 🧪 unit (`classifyContact` → `HIT`, both cases) |
| AC7 dead enemy is inert | 🧪 unit (`classifyContact` with `isDead: true` → `NONE`) |
| AC8 **R** respawns the enemy | 👁 playtest |
| **R** mid-patrol doesn't leave two live enemies | 👁 playtest (the group is cleared before respawning — enemies are *destroyed* on death, unlike bones, which are only disabled and revived) |
| AC9 alive enemy doesn't fall through the ground / leave world bounds | 👁 playtest |
| AC10 no console errors | 👁 playtest |

Per `CLAUDE.md`'s testing strategy: every decision *rule* is unit-tested; the
Phaser rendering, overlap plumbing and the feel of the fall are playtested.

### Open questions / assumptions + risk

**Risk: Low.** No open questions — asset, death behaviour and all tuning
numbers but one are confirmed by Artem. The one remaining assumption is a
named constant in one file, changed in one line:

1. `PATROL_HALF_RANGE = 60` px. (Patrol **speed** is confirmed: 30% of the
   player's `WALK_SPEED`.)
2. — resolved: the player's hop is **20%** of `JUMP_VELOCITY` and the enemy's
   death pop **15%**, both confirmed by Artem.
3. — resolved: enemy physics body **32x36** inside the 50x50 cell, confirmed.

Deliberately deferred, not overlooked: the **hit** branch is a throwaway
tint + log because hearts don't exist until `ENEMY-3` — keeping this PR to one
logical change.

---

## Playtest fixes (round 1)

What the first playtest found, and what changed.

### 🐞 The enemy didn't patrol at all — a reserved-name collision

The spawn x was stored as `enemy.originX`. **`originX` is a built-in Phaser
Game Object property** (the sprite's anchor point, normalised 0-1, default
0.5), so Phaser overwrote it. The patrol rule then read `0.5` as the patrol
centre, concluded the enemy was permanently past its right-hand edge, sent it
left — and never sent it back, because `x <= 0.5 - 60` can never be true. The
enemy slid to the left wall and parked there.

**Fix:** renamed to `patrolOriginX`, in the rule and the Scene, so no code
passes anything called `originX` around.

**Why the unit tests didn't catch it, and what now would:** the *rule* was
correct all along — what broke was the data being handed to it, which is
exactly the seam unit tests don't see. A regression test was added for the
resulting symptom (an enemy far outside its range, already walking home, must
keep walking home rather than freeze), which fails if the spawn x is ever lost
again.

### ✅ Confirmed working

The stomp, the 15% death pop, and the fall through the ground off the bottom of
the screen all behaved as specified.

### ✏️ Changes requested

- **Half the size** (Artem: 2x, not the 2.5x first discussed) — the sheet was
  resized 100x100 → 50x50, cell 25x25, hitbox 32x36 → **16x18** at offset 4,5.
- **Turn on obstacles** — new `AC2b`: the enemy now also reverses when it walks
  into a solid object or the edge of the screen, not only at the ends of its
  patrol range.

## Playtest fixes (round 2)

### 🐞 The enemy tapped in place while the player touched it

Introduced by round 1's obstacle-turning: the Scene passed
`blocked.left || touching.left` into the rule. **Arcade Physics sets `touching`
for overlaps as well as collisions**, and the player/enemy contact is an
overlap — so the enemy read the player as a wall and reversed direction on
every frame of contact, walking nowhere.

**Fix:** the Scene now passes only the `blocked` flags, which are set by solid
collisions (static ground, walls, world bounds). Turning on real obstacles is
unaffected; the player is no longer an obstacle. Covered by a unit test.

*(Low impact either way — once `ENEMY-3` lands, touching an enemy restarts the
level immediately — but the behaviour was unintended, so it was fixed rather
than written up as a feature.)*
