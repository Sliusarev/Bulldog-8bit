# Feature Spec: Small Bones + bone-count score (`SCORE-1`)

> **Scope:** `[Alpha]`. WBS: `SCORE-1`. ClickUp: `869e4tg13`. Related:
> `SCORE-7` (level timer — the other metric shown beside the score),
> `UI-3` (in-game HUD — displays the score live), `UI-5` (results window),
> `LEVEL-6` (the Alpha level — final bone placement).
> `SCORE-2` (Large Bone) and `SCORE-6` (cross-level persistence) are `[Beta]`.

> **Status:** draft v2 for review (workflow step 1). Revised per Artem's
> feedback: real bone art, debug counter, bone refresh, 2 bones (left+right),
> basic pickup SFX. **Two things still need your call — see §3 "Needs your
> confirmation".**

---

## 1. Summary
Place **Small Bone** collectibles in the level. When the bulldog touches one,
it's collected (with a small pickup sound) and the **score** goes up. In Alpha
the score is simply the **count of Small Bones collected**.

## 2. User story
As a **player**, I want to collect Small Bones that raise my score, so that
**exploring the level is rewarded**.

## 3. Scope

**In scope**
- **Two** Small Bones placed in the level for now: **one to the left, one to
  the right** of the player's spawn point (final layout comes with `LEVEL-6`).
- **Animated bone art** — the supplied `Bone.png` (see §5), looping idle
  animation.
- Automatic collection when the player's body overlaps a bone (no button).
- A **score** = the number of Small Bones collected, starting at 0.
- A collected bone disappears and can't be collected again.
- **Basic pickup SFX** — a short chiptune blip on collect (`[Alpha]`, see §5
  and the asset note).
- **Temporary debug counter** on screen, so collection is visible while
  testing (removed once `UI-3`'s real HUD lands).
- **Temporary "refresh bones" dev key**, so the pickup can be re-tested
  without reloading the page.
- The pure "score math" (start at 0, +1 per bone) in a small, unit-tested
  module (`src/state/score.js`, mirroring `color-select.js`), and the score
  value held in shared game state so `UI-3` / `UI-5` can read it.

**Not in this story — but still `[Alpha]`, owned by their own stories**
> Correcting the previous draft, which wrongly implied these were Beta:
- **`UI-3` — in-game HUD** (`[Alpha]`): the real on-screen HUD showing hearts,
  bone count and timer. This story only exposes the score value + a throwaway
  debug counter.
- **`UI-5` — results window** (`[Alpha]`): the end-of-level summary showing
  nickname, bones collected and elapsed time — shown **both** on Game Over
  (0 hearts) **and** on finishing the level with ≥1 heart.

**Out of scope (genuinely `[Beta]`)**
- **Large Bone** (`SCORE-2`) and any point-weighting — every Small Bone is +1.
- **Score persisting across levels** (`SCORE-6`) — Alpha is a single level.
- Dog Toy / Avocado pickups.
- Final bone placement / level layout (`LEVEL-6`).

### Resolved decisions
1. **Pickup SFX is `[Alpha]`** (approved). This is a **planning change** —
   the AUDIO epic is currently all `[Beta]` in the WBS, so the WBS and
   `CLAUDE.md`'s Alpha list get an Alpha-tagged "basic pickup SFX" entry as
   part of this story. Phaser's built-in audio covers it — **no new library**.
   *(⚠️ The audio file itself is still outstanding — see the Technical design
   "Open items".)*
2. **Refresh resets bones + score** (approved). The dev key respawns **both**
   bones **and** resets the score to 0, so each test run starts clean.

## 4. Acceptance criteria
- [x] Given the level loads, then **two** Small Bones are visible — one left,
      one right of the player's spawn — each playing a looping idle animation.
      *(Verified: bones at x=60 / x=260, both running `bone-idle`.)*
- [x] Given the score starts, then it is **0** before any bone is collected.
      *(Verified + 🧪 unit.)*
- [x] Given the player's body overlaps a Small Bone, then that bone is
      collected: it disappears, a pickup sound plays, and the score increases
      by exactly **1**. *(Verified: score 0→1, bone deactivated. SFX wiring in
      place — audible check is Artem's playtest, headless has no audio.)*
- [x] Given a bone has already been collected, then it cannot be collected
      again (no double-count, no lingering sprite). *(Verified: lingering on a
      collected bone for 0.6s kept the score at 1.)*
- [x] Given both bones are collected, then the score equals **2**.
      *(Verified + 🧪 unit.)*
- [x] Given the debug counter is on screen, then it always reflects the current
      score. *(Verified: text tracked 0→1→2→0. 🧪 `formatScore` unit-tested.)*
- [x] Given the refresh dev key is pressed, then both bones reappear and can be
      collected again, with the score reset to 0. *(Verified: R restored both
      bones active+visible, score→0, re-collect worked.)*
- [x] Given the pure score module, when a bone is added from any starting
      count, then it returns the correct new count — covered by unit tests.
- [x] The bone idle animation loops cleanly with no blank/flicker frame.
      *(Animation capped at `end: 2`; visually confirmed.)*
- [x] No console errors during collection or refresh. *(Verified: none.)*

## 5. UX / behaviour details

### Bone art (supplied — verified)
- Source: `Bone.png` (Piskel export), to be added as `src/assets/bone.png`.
- **64×64 sheet, 32×32 cells, 3 frames** at indices **0, 1, 2**. The 4th cell
  (index 3) is **empty** — the animation must run `start: 0, end: 2` so no
  blank frame flickers in.
- Transparent background; 3-colour palette (off-white `#f3efe9`, grey
  `#bdb6b6`, black outline) — consistent with the game's retro look.
- The 3 frames carry subtle 1px offsets → a gentle idle bob. Loop them
  continuously (`repeat: -1`) at a slow-ish frame rate (~4–6 fps, tuned by
  eye).

### Placement
- **Two bones**, resting on the ground: one **left** of spawn, one **right**
  (player spawns centre, x≈160). Exact x/y tuned by playtest; the real layout
  is `LEVEL-6`'s job.

### Collection
- Touch-to-collect via a Phaser overlap between the player and the bones — no
  input. On overlap the bone is disabled/hidden, the SFX plays, and the count
  ticks up by 1.
- **Score model:** each Small Bone is worth **+1** (score = raw count), per
  `CLAUDE.md`. No point values in Alpha.

### Pickup SFX
- A short blip on collect (see §3 confirmation #1 for the asset). Keep it
  quiet/short so repeated pickups don't get annoying.

### Temporary dev affordances (removed later)
- **Debug counter:** small on-screen text (e.g. `BONES: 1`) so collection is
  visible before `UI-3` exists. Same "temporary until the real UI" pattern as
  the `C` colour key.
- **Refresh key:** a dev key (e.g. **R** — doesn't clash with arrows/space/`C`/
  `F`) that respawns both bones for repeat testing.

## 6. Data & persistence
- Score is an in-memory integer starting at 0, held in shared game state (a
  Phaser registry value or small state object) so `UI-3`/`UI-5` can read it.
- No `localStorage`, no cross-session or cross-level persistence in Alpha.

## 7. Edge cases & error handling
- **Overlapping both bones on the same frame:** each is collected once; score
  reflects both.
- **Same bone, multiple overlap frames:** the bone is disabled on first
  contact, so it counts exactly once (no rapid double-count).
- **Walking back over where a bone was:** nothing happens (it's gone).
- **Refresh pressed while bones are still uncollected:** they simply stay/reset
  — no duplicate bones spawned.
- **Zero bones collected:** score stays 0 (a valid end state).
- **Audio blocked before user interaction:** browsers block autoplay until the
  page is interacted with. Since the SFX only fires after a keypress-driven
  pickup, this shouldn't bite — but the game must not error if audio fails to
  play.

## 8. Dependencies
- **Builds on** the player physics body (`specs/player-physics.md`) — the
  overlap is player-vs-bones.
- **Feeds `UI-3`** (HUD shows the live score), **`UI-5`** (results window shows
  the final score on both Game Over and level-complete), and pairs with
  **`SCORE-7`** (timer) as Alpha's two metrics.
- **Placement finalized by `LEVEL-6`**.
- **Planning-doc change:** moving *basic pickup SFX* into Alpha means updating
  the WBS (AUDIO epic is currently all `[Beta]`) and `CLAUDE.md`'s Alpha list —
  pending confirmation #1.
- Reuses the existing state pattern (`src/state/color-select.js`), the existing
  spritesheet/animation approach (`src/physics/animation.js`, `CHAR-2`), and
  Phaser's built-in overlap + audio — **no new libraries or tools**.

## 9. Definition of done
All Section 4 acceptance criteria pass — the score math via unit tests in
`src/state/score.js`, the collection/animation/SFX/refresh behaviour via manual
playtest — CI green (`lint` + `test` + `build`), no console errors. Spec kept in
sync. Committed on a feature branch and merged via PR per the delivery flow in
`CLAUDE.md`.

---

## Technical design

> Workflow step 3 — **awaiting Artem's approval before implementation starts.**

### Files touched / created

| File | Change |
|---|---|
| `src/assets/bone.png` | **New** — the supplied `Bone.png`, copied in as-is (64×64, 32×32 cells). |
| `src/assets/bone-pickup.<wav\|ogg>` | **New** — the pickup SFX (see Open items). |
| `src/state/score.js` | **New** — pure score logic. |
| `src/state/score.test.js` | **New** — unit tests for the score logic. |
| `src/main.js` | **Edit** — load bone sheet + SFX, define the bone animation, spawn 2 bones, overlap→collect, debug counter, `R` refresh key. |
| `Bulldog-8Bit-WBS.md`, `CLAUDE.md` | **Edit** — record "basic pickup SFX" as `[Alpha]` (resolved decision #1). |

### Module design — `src/state/score.js` (pure, testable)

Mirrors `src/state/color-select.js` exactly (same folder, same style: exported
constants + tiny pure functions, no Phaser import), so there's one consistent
way state rules are written.

```js
export const INITIAL_SCORE = 0;
export const POINTS_PER_SMALL_BONE = 1;   // named, not a magic 1
export function addBone(score) { ... }    // score + POINTS_PER_SMALL_BONE
export function resetScore() { ... }      // -> INITIAL_SCORE  (used by refresh)
export function formatScore(score) { ... } // "BONES: 2" for the debug counter
```

`formatScore` is included so the debug counter's text rule is also unit-tested
rather than string-built inline in the Scene — and `UI-3` can reuse or replace
it later.

**The Scene stays a thin adapter:** it owns the sprites/timers/input and calls
these functions; no counting rule lives in `update()`/`create()`.

### Scene wiring (`src/main.js`)

1. **preload:** `this.load.spritesheet("bone", boneSheet, { frameWidth: 32, frameHeight: 32 })`
   and `this.load.audio("bone-pickup", pickupSfx)`.
2. **create:**
   - Animation `bone-idle`: `generateFrameNumbers("bone", { start: 0, end: 2 })`,
     `frameRate ≈ 5`, `repeat: -1`. **`end: 2` is deliberate** — cell 3 of the
     sheet is empty and would flicker a blank frame.
   - `this.bones = this.physics.add.staticGroup()`, then a small
     `spawnBones()` helper creating the two bones at fixed positions —
     **left ≈ x 60, right ≈ x 260**, resting on the ground (y ≈ 196, tuned by
     eye), each playing `bone-idle`.
   - `this.score = INITIAL_SCORE`; debug text via `this.add.text(...)` showing
     `formatScore(this.score)`.
   - `this.physics.add.overlap(this.player, this.bones, this.collectBone, null, this)`.
   - `this.refreshKey = this.input.keyboard.addKey(KeyCodes.R)` (R is free —
     doesn't clash with arrows / space / `C` / `F`).
3. **collectBone(player, bone):**
   - `bone.disableBody(true, true)` — removes it from the world **and** hides
     it, so it can't re-trigger the overlap (this is what guarantees the
     "counts exactly once" criterion).
   - `this.sound.play("bone-pickup")`.
   - `this.score = addBone(this.score)`; update the debug text.
4. **update:** on `JustDown(this.refreshKey)` → `this.score = resetScore()`,
   refresh the debug text, and re-enable both bones (`spawnBones()` /
   `bone.enableBody(true, x, y, true, true)`).

### Data flow / state

- `score` is a plain integer on the Scene, seeded from `INITIAL_SCORE`.
- It's mirrored into the Phaser **registry** (`this.registry.set("score", …)`)
  on every change, so `UI-3` (HUD) and `UI-5` (results window) can read it
  across scenes without this story guessing their design. Registry is Phaser
  built-in — no new state library.
- Nothing persisted (no `localStorage`); resets on reload — matches §6.

### Reuse

- **Reused:** `src/state/` pattern + folder (`color-select.js`); the
  spritesheet/animation approach from `CHAR-2` (`animation.js` conventions);
  Phaser's built-in `staticGroup`, `overlap`, `sound`, and `registry`; the
  existing temporary-dev-key pattern (the `C` colour key) for `R`.
- **Genuinely new:** only the bone asset, the SFX asset, and `score.js`.
- **No new dependencies, libraries, or tools.**

### Test plan

| Acceptance criterion | Covered by |
|---|---|
| Score starts at 0 | 🧪 unit (`INITIAL_SCORE`) |
| Collecting a bone → +1 | 🧪 unit (`addBone` from 0, 1, n) |
| Both collected → score 2 | 🧪 unit (`addBone` applied twice) |
| Refresh resets score to 0 | 🧪 unit (`resetScore`) |
| Debug counter reflects score | 🧪 unit (`formatScore`) |
| Bones visible / idle animation loops, no blank frame | 👁 playtest |
| Bone disappears on touch, counts once, SFX plays | 👁 playtest |
| Refresh respawns both bones | 👁 playtest |
| No console errors | 👁 playtest |

Per `CLAUDE.md`'s testing strategy: pure logic is unit-tested; Phaser
rendering/overlap/audio is verified by playtest, not unit tests.

### Open items

1. **⚠️ The SFX audio file is not in the project yet.** Implementation needs
   either (a) Artem drops a short `.wav`/`.ogg` blip somewhere I can copy from
   (e.g. `~/Downloads`, like `Bone.png`), or (b) a go-ahead for me to
   synthesise a simple chiptune blip. Everything else can be built regardless;
   this only gates the SFX criterion.
2. Bone x/y are rough starting values, tuned by eye in playtest; the real
   layout lands with `LEVEL-6`.

### Risk

**Low.** Both spec decisions are resolved; the design reuses existing patterns
end-to-end and adds no new tooling. Remaining assumptions:
1. Score = raw count (+1 per Small Bone), no point weighting in Alpha.
2. Collection is automatic on overlap.
3. Bone positions are provisional (finalised in `LEVEL-6`).

The only true blocker is the SFX asset (Open item 1).
