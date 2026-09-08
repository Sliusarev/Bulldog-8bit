# Feature Spec: Health system — 3 hearts + damage rule (`STATE-1` + `ENEMY-3`, minimal `STATE-3`)

> **Scope:** `[Alpha]`. WBS: `STATE-1` (3 HP hearts), `ENEMY-3` (contact damage
> rule — 1 heart + level restart), plus a **minimal placeholder** `STATE-3`
> (Game Over). Related: `specs/simple-enemy-stomp.md` (produces the
> `CONTACT.HIT` signal this story consumes), `CHAR-3` (hurt frame — separate
> story), `UI-3` (full HUD), `UI-5` (results window — replaces the placeholder
> Game Over screen), `CHAR-5` (i-frames — deliberately cut, not built).

> **Status:** v2 — implemented and playtested (all acceptance criteria pass).
>
> *(Was: draft for review, workflow step 1.)* Three questions were
> answered by Artem up front and are baked in: scope includes a minimal Game
> Over screen; hearts are drawn at **16x16**, top-left; a hit shows a
> **~500 ms flash + the heart going out** before the level restarts. Revised
> after the first review: the Game Over screen restarts on **ENTER**, and the
> dev key **R** deliberately does **not** touch the heart count. Revised again
> after the first playtest: the hearts are drawn at their **native 32x32** —
> the 16x16 downscale was too small and lost too much of the art.

---

## 1. Summary
Give Buldog **3 hearts** shown in the HUD, and make enemy contact actually
cost something: a hit **removes one heart and restarts the level from the
beginning**, with the reduced heart count carrying over (hearts never refill).
At **0 hearts** the run ends on a simple **GAME OVER** screen that starts a
fresh run. This replaces the temporary red-flash-and-log stub left behind by
`specs/simple-enemy-stomp.md`.

## 2. User story
As a **player**, I want three hearts and a real consequence for touching an
enemy, so that **the level has stakes** — I can survive a couple of mistakes,
but not forever.

## 3. Scope

**In scope**
- **3 hearts**, drawn as a row of heart icons in the HUD (top-left), using
  Artem's supplied **full** and **empty** heart art.
- **The confirmed damage rule (`ENEMY-3`):** any enemy contact classified as
  `CONTACT.HIT` costs **exactly 1 heart** and then **restarts the level from
  the beginning**.
- **Hearts carry over** a restart — they do **not** refill. The heart count is
  the one piece of state that survives the level restart.
- **Hit feedback before the restart:** a short **~500 ms** beat in which the
  player flashes red, the lost heart visibly switches from full to empty, and
  the player loses control; then the level restarts.
- **Game Over (`STATE-3`, placeholder):** when the last heart is lost, instead
  of restarting the level the game shows a plain **GAME OVER** screen. Pressing
  **ENTER** starts a completely new run — hearts back to 3, score back to 0.
- **Bones and score are left exactly as they are** — no change to `SCORE-1`'s
  logic. Restarting the scene already rebuilds the bones and re-runs
  `this.score = INITIAL_SCORE`, so the level naturally comes back with every
  bone in place and a score of 0. Hearts are the *only* thing this story makes
  survive the restart.
- **The pure rules** — how many hearts remain after a hit, whether the run is
  over, which heart icons render full vs. empty — in a unit-tested
  `src/state/health.js`, mirroring `src/state/score.js`.
- **Heart art:** the two supplied PNGs used **as they are, at 32x32** — see
  the playtest note in §5.

**Out of scope**
- **Invulnerability / i-frames** (`CHAR-5`) — deliberately not built: the
  restart already removes the player from danger. See `CHAR-5` in the WBS.
- **The hurt frame** (`CHAR-3`) — the flash is a stand-in; the squashed hurt
  sprite is its own story.
- **The real results window** (`UI-5`) with nickname / bone count / elapsed
  time — the GAME OVER screen here is a knowingly temporary placeholder.
- **The full HUD** (`UI-3`) and the level timer (`SCORE-7`).
- **Healing** — no Large Bone (`SCORE-2`), no refills of any kind in Alpha.
- **Avocado** half-heart damage (`SCORE-4`, `[Beta]`), the Energy system
  (`STATE-2`), death by falling out of the world, and hazards other than
  enemy contact — nothing else can currently damage the player.
- Any damage/game-over **SFX** (`AUDIO-*`, `[Beta]`).

## 4. Acceptance criteria

- [x] **AC1** Given the level starts, then **3 full hearts** are visible in the
      HUD.
- [x] **AC2** Given the player touches an enemy from the side or from below
      (a `CONTACT.HIT`), then **exactly one** heart is lost — never two, no
      matter how many frames the bodies overlap for.
- [x] **AC3** Given a heart was just lost, then the player briefly flashes,
      the lost heart shows as **empty**, and after ~500 ms the **level
      restarts from the beginning**.
- [x] **AC4** Given the level restarted after a hit, then the player is back at
      the spawn point, all bones are back, the enemy patrols again, and the
      **score is 0**.
- [x] **AC5** Given the level restarted after a hit, then the heart count is
      the **reduced** one (e.g. 2 of 3 shown full) — hearts do **not** refill.
- [x] **AC6** Given the player has 1 heart left, when they are hit, then the
      level does **not** restart; the **GAME OVER** screen appears instead.
- [x] **AC7** Given the GAME OVER screen, when **ENTER** is pressed, then a new
      run starts with **3 full hearts** and a score of 0.
- [x] **AC8** Given the player **stomps** an enemy (`CONTACT.STOMP`), then **no
      heart is lost** and the level does not restart.
- [x] **AC9** Given the ~500 ms hit pause, then a second hit during it cannot
      cost another heart (the player is out of play until the restart).
- [x] **AC10** Given the player collects bones and is then hit, then the bones
      are back and the score is 0 after the restart — no leftover score.
- [x] **AC11** No console errors on hit, restart, or Game Over.

## 5. UX / behaviour details

**Heart art.** The two supplied PNGs (`Heart full .png`, `Heart empty.png`,
32x32 RGBA) are committed **unchanged** as `src/assets/heart-full.png` and
`src/assets/heart-empty.png`, and drawn at their **native 32x32** — no
`setScale`, the same rule the bulldog and the enemy already follow (the art is
exported at the size it should appear on screen).

They are drawn as **three separate images** tucked into the very top-left
corner, with about **one character's gap** between them, and the temporary
`BONES: n` text sits **to their right**, vertically centred on the row — so the
whole HUD is one line and no space is wasted above it.

The placement numbers come from where the heart is actually **painted**, not
from its cell: the drawn heart occupies only x 10-22, y 13-22 of the 32x32
image, the rest being transparent padding. Cell centres of 14/33/52 at y 9 put
the visible hearts at **x 8-58, y 6-15**, and the score text starts at x 66.

*(First playtest: they were originally downscaled to 16x16, which read as too
small and visibly degraded the art. Native size it is — a third of the screen
width is acceptable for a placeholder HUD, and `UI-3` can re-lay-out the row
later.)*

Two separate files rather than a 2-cell spritesheet because that is how the art
arrived, and swapping an image's texture (`setTexture("heart-empty")`) is the
simplest possible "this heart is gone" — no animation, no frame bookkeeping.

**The hit beat (~500 ms).** On `CONTACT.HIT`:
1. The heart count drops by one **immediately** (the rule runs once), and the
   HUD swaps that heart's texture to the empty one — so the player *sees*
   which heart they lost, before the screen resets.
2. The player is put out of play: input ignored, a red tint flashing on the
   sprite. This is what makes AC9 true — no second heart can be lost, and it's
   also why no i-frames are needed.
3. After ~500 ms: **level restart** (hearts > 0), or the **GAME OVER** screen
   (hearts == 0).

**The restart.** The whole scene restarts — player back at spawn, bones back,
enemy back on patrol, score 0. Hearts survive because they are kept in Phaser's
**registry** (which outlives a scene restart), not in a scene field. That is
the same registry `score` is already mirrored into.

**GAME OVER screen (placeholder).** A dark overlay with `GAME OVER` and
`PRESS SPACE` in the existing monospace HUD font. No score, no nickname, no
time — `UI-5` replaces this wholesale once those exist. ENTER clears the
registry's heart count, so the fresh run starts from 3.

**Input.** No new gameplay keys, and **spacebar keeps meaning "jump" only**.
**ENTER** starts a new run, and works on the GAME OVER screen only. The dev key
**R** is untouched by this story: it still respawns the bones and the enemy and
resets the score, and deliberately **does not** change the heart count —
hearts are only ever lost by a hit and only ever restored by starting a new
run.

## 6. Data & persistence
Nothing is persisted to disk or a backend. The heart count lives in the Phaser
**registry** under `hearts` for the duration of a run (that's what carries it
across the level restart) and is cleared on Game Over. `score` continues to be
mirrored into the registry as it is today, and is reset on every restart.

## 7. Edge cases & error handling
- **Overlapping for many frames** — the heart is deducted once because the
  player is taken out of play in the same frame as the hit (AC2/AC9); the
  restart follows before control returns.
- **Hit while mid-air / mid-jump** — no special case: the beat and restart run
  the same way.
- **Hit on the exact frame of a stomp** — `classifyContact` already decides
  stomp vs. hit; this story only consumes its answer, so there is one verdict
  per contact by construction.
- **Hit at 1 heart** — the level must *not* restart underneath the Game Over
  screen (AC6); the branch is decided by the pure rule, not by two independent
  `if`s.
- **R pressed during the hit pause** — R doesn't touch hearts, so the heart
  loss stands and the pending restart still fires; harmless either way, and R
  is a dev-only key.
- **A restart leaving stale timers/sprites** — the scene restart rebuilds
  everything; the pending ~500 ms timer belongs to the scene that is being
  restarted, so it must not fire twice into the new scene.

## 8. Dependencies
- **Builds on:** the `CONTACT.HIT` signal from `src/physics/enemy.js` and
  `touchEnemy()` in `src/main.js` (this story replaces that method's temporary
  tint-and-log branch); `src/state/score.js` as the file/comment-style
  model for the new health module (its bone/score behaviour is used as-is,
  unchanged); the registry mirroring pattern already used for `score`;
  the existing HUD text style; the asset-import + `this.load.image` pattern.
- **Must not break:** movement / double jump (`MOVE-7`), bone collection
  (`SCORE-1`), the stomp (`ENEMY-4`), fullscreen scaling (`NFR-11`).
- **Unblocks:** `UI-3` (HUD — hearts are its first element), `UI-5` (results
  window — takes over the Game Over route), `CHAR-3` (hurt frame — replaces
  the red flash), and every `[Beta]` enemy, which reuses this exact rule.

## 9. Definition of done
All acceptance criteria pass, the pure rules unit-tested in
`src/state/health.test.js` (one test per testable AC), `npm run lint` / `test`
/ `build` green, playtested with no console errors, merged to `main` via PR.

---

## Technical design

> Workflow step 3 (see `CLAUDE.md` → "The agreed delivery flow"). Written after
> the spec above was approved; implementation starts once Artem approves this.

### Files touched / created

| File | Change |
|---|---|
| `src/assets/heart-full.png` | **new** — Artem's `Heart full .png`, committed unchanged at 32x32 |
| `src/assets/heart-empty.png` | **new** — Artem's `Heart empty.png`, same |
| `src/state/health.js` | **new** — the pure heart rules (mirrors `state/score.js`) |
| `src/state/health.test.js` | **new** — one test per testable acceptance criterion |
| `src/main.js` | edited — load the two images, draw the heart row, carry hearts in the registry, replace `touchEnemy()`'s temporary tint-and-log HIT branch, add the hurt pause + level restart, add the GAME OVER overlay and its ENTER key |
| `Bulldog-8Bit-Checklist.md`, `Bulldog-8Bit-WBS.md` | edited at the end — tick `STATE-1` / `ENEMY-3` (via the `update-checklist` skill); `STATE-3` noted as *placeholder only*, still open until `UI-5` |

**No new dependencies, libraries or tools.** Phaser's registry, timers, images
and text cover all of it — and after the playtest the art isn't even resized,
it ships exactly as supplied.

### Module design — `src/state/health.js` (pure, testable)

Lives in `src/state/` rather than `src/physics/` because hearts are a **run
resource**, like the score — not a movement/collision rule. Same shape and
house style as `score.js`: exported constants plus tiny pure functions, **no
Phaser import**.

```js
export const MAX_HEARTS = 3;          // the starting (and maximum) heart count
export const HEART_COST_PER_HIT = 1;  // named, so SCORE-4's half-heart Avocado has something to build on
export const HIT_PAUSE_MS = 500;      // the "you were hit" beat before the restart

// Texture keys for the two supplied images, kept next to the rule that picks
// between them so the Scene never hardcodes a string.
export const HEART_TEXTURE = { full: "heart-full", empty: "heart-empty" };

// One hit. Returns the new count rather than mutating (pure, like addBone).
// Clamped at 0 so the count can never go negative even if called twice.
export function loseHeart(hearts)

// Is the run finished? The single place the Game Over branch is decided, so
// "restart the level" and "show GAME OVER" can never both be true (AC6).
export function isRunOver(hearts)

// Back to a full 3 — a fresh run. Used by create()'s first run and by ENTER
// on the GAME OVER screen. (Mirrors resetScore.)
export function resetHearts()

// Which texture each of the three HUD hearts shows, left to right:
//   3 -> [full, full, full]   1 -> [full, empty, empty]   0 -> [empty x3]
// Returns texture keys, not booleans, so the Scene's job is one setTexture
// per icon — the display rule itself is unit-tested (formatScore's role).
export function getHeartTextures(hearts, max = MAX_HEARTS)
```

The Scene stays a thin adapter: it owns the images, the timer and the restart;
no heart arithmetic or full/empty decision lives in `update()`/`create()`.

### Scene wiring (`src/main.js`)

1. **preload:** `this.load.image("heart-full", heartFull)` and the same for
   `heart-empty` — `load.image`, not `load.spritesheet`: two separate 16x16
   files, no grid.
2. **create():**
   - `this.hearts = this.registry.get("hearts") ?? resetHearts()` — **this one
     line is what makes hearts carry across a restart** (AC5): the registry
     outlives `scene.restart()`, a scene field does not. First ever run finds
     nothing and starts at 3.
   - `this.heartIcons = [0, 1, 2].map((i) => this.add.image(14 + i * 19, 9, HEART_TEXTURE.full))`
     — three images at centres 14/33/52, y 9 (see §5: chosen from the drawn
     heart's bounds, not the cell's),
     then `this.renderHearts()` immediately so a carried-over count shows
     correctly on the restarted level.
   - The temporary `BONES:` text moves to `(66, 10)` with `setOrigin(0, 0.5)` —
     to the right of the hearts, centred on the row.
   - `this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)`.
   - `this.isHurt = false; this.isGameOver = false;`
3. **`renderHearts()`** (new, 2 lines): `getHeartTextures(this.hearts)` →
   `icon.setTexture(key)` per icon. The only place the HUD is touched.
4. **`touchEnemy()` — the HIT branch** replaces the temporary tint + log:
   ```js
   } else if (contact === CONTACT.HIT) {
     this.hurtPlayer();
   }
   ```
5. **`hurtPlayer()`** (new) — the whole damage rule, in one method:
   - `if (this.isHurt || this.isGameOver) return;` — **this guard is what makes
     AC2 and AC9 true**: the very first hit takes the player out of play, so no
     later overlap frame (or a second enemy) can cost a second heart.
   - `this.isHurt = true;`
   - `this.hearts = loseHeart(this.hearts)` → `this.registry.set("hearts", ...)`
     → `this.renderHearts()` — the heart visibly goes out *before* anything
     else happens (AC3).
   - Freeze and flash the player: `body.setVelocityX(0)`, red tint, and a
     tween/`time` toggle for the flash. The red tint is the stand-in for
     `CHAR-3`'s hurt frame.
   - `this.time.delayedCall(HIT_PAUSE_MS, () => { ... })` → inside:
     `isRunOver(this.hearts) ? this.showGameOver() : this.scene.restart()`.
     A scene restart tears down that scene's clock, so the timer cannot fire
     into the new level (§7's stale-timer edge case).
6. **`showGameOver()`** (new) — `this.isGameOver = true`, a semi-transparent
   dark rectangle over the play area plus `GAME OVER` / `PRESS ENTER` in the
   existing monospace HUD style. Rendered **inside `BootScene`** rather than as
   a second Scene on purpose: it is a knowingly throwaway placeholder that
   `UI-5` deletes, and an overlay is a dozen lines against a new scene file,
   its registration in the config, and its own restart plumbing. `UI-5` is
   where a real scene earns its place.
7. **`update()` — one early gate at the top:**
   ```js
   if (this.isGameOver) {
     if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
       this.registry.set("hearts", resetHearts());  // a brand-new run
       this.scene.restart();
     }
     return;                    // no walking, jumping, patrol or dev keys
   }
   if (this.isHurt) return;     // out of play for the ~500 ms beat
   ```
   Everything already in `update()` is untouched below that gate — including
   the **R** key, which keeps doing exactly what it does today and never
   touches `this.hearts`.

**Bones and score:** no code changes at all. `scene.restart()` re-runs
`create()`, which rebuilds the bones and sets `this.score = INITIAL_SCORE`, so
AC4/AC10 hold through existing behaviour rather than new logic.

### Data flow / state

- `hearts` lives in the **Phaser registry** for the life of a run — written on
  every hit and on a new run, read once per `create()`. The registry is
  deliberately the only cross-restart storage; nothing is persisted to disk.
- `score` continues to be mirrored into the registry exactly as today, and
  resets on each restart because `create()` re-initialises it.
- `isHurt` / `isGameOver` are scene-lifetime flags — they must **not** be in
  the registry, since a restart is precisely when they should be gone.
- Every number (`MAX_HEARTS`, `HEART_COST_PER_HIT`, `HIT_PAUSE_MS`) lives in
  `health.js` — one source of truth, the way `player.js` holds the movement
  tuning and the enemy's numbers derive from it.

### Reuse

- **Reused:** `src/state/score.js`'s module shape, comments and naming (the new
  file is its sibling, not a new pattern); the registry-mirroring idea already
  used for `score`; the existing `CONTACT.HIT` verdict from
  `physics/enemy.js` — the classification is *not* re-derived here; the HUD
  text style; the `addKey` + `JustDown` input convention; the asset-import +
  loader pattern; the "draw art at its native size, never `setScale`" rule the
  bulldog and enemy sprites already follow.
- **Genuinely new:** the two heart images, `health.js`, and the Game Over
  overlay. Nothing existing covers "a resource that survives a scene restart",
  which is why the registry read in `create()` is written out explicitly rather
  than hidden in a helper.
- **Pushed back up to the spec:** `HEART_COST_PER_HIT` is named rather than a
  bare `1` so `SCORE-4` (Avocado, −0.5 heart) extends this module instead of
  starting a parallel one — same reasoning as `POINTS_PER_SMALL_BONE`.

### Test plan

| Acceptance criterion | Covered by |
|---|---|
| AC1 three full hearts at level start | 🧪 unit (`getHeartTextures(3)` → three full; `MAX_HEARTS === 3`) + 👁 playtest |
| AC2 a hit costs exactly one heart | 🧪 unit (`loseHeart`) + 👁 playtest for the one-hit-per-contact guard |
| AC3 flash + heart goes out, then restart | 🧪 unit (`getHeartTextures(2)` → full, full, empty; `HIT_PAUSE_MS`) + 👁 playtest |
| AC4 restart puts back player/bones/enemy, score 0 | 👁 playtest (existing `create()` behaviour) |
| AC5 hearts carry over, don't refill | 👁 playtest (registry read) |
| AC6 last heart → GAME OVER, not a restart | 🧪 unit (`isRunOver(0)` true, `isRunOver(1)` false — the single branch point) |
| AC7 ENTER starts a new run at 3 hearts | 🧪 unit (`resetHearts()`) + 👁 playtest |
| AC8 a stomp costs no heart | 👁 playtest (`classifyContact` already unit-tested in `enemy.test.js`) |
| AC9 no second heart lost during the pause | 🧪 unit (`loseHeart(0)` clamps at 0) + 👁 playtest for the `isHurt` guard |
| AC10 no leftover score after a restart | 👁 playtest |
| AC11 no console errors | 👁 playtest |

Per `CLAUDE.md`'s testing strategy: every decision *rule* is unit-tested; the
Phaser plumbing (registry, timers, `scene.restart()`, the overlay) is
playtested.

### Open questions / assumptions + risk

**Risk: Low.** Scope, the damage rule, heart size/placement, the hit beat, the
ENTER restart and R's non-involvement are all confirmed. Three assumptions
remain, each a named constant or a few lines in one file:

1. **`HIT_PAUSE_MS = 500`** — the agreed "~500 ms"; tuned by feel in playtest.
2. — resolved in playtest: the art is **native 32x32**, and the row is laid
   out from the drawn hearts' bounds (centres 14/33/52, y 9) with `BONES:`
   beside it at x 66, both confirmed by Artem.
3. **The GAME OVER screen is an overlay inside `BootScene`**, not a new Scene
   (justified in step 6 above) — it is deleted by `UI-5` either way.
