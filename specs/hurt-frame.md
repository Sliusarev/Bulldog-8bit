# Feature Spec: Hurt Animation Frame

> **Scope:** `[Alpha]`. WBS: `CHAR-3`. Related: `CHAR-2`
> (`specs/character-sprite.md` — the spritesheet and animation pattern this
> extends), `STATE-1` (`specs/health-hearts.md` — the damage rule that triggers
> this, and whose red-tint stand-in this replaces), `CHAR-4`
> (`specs/color-select.md` — the hero tint the flash has to restore),
> `ENEMY-3` (enemy contact — the only damage source in Alpha).

---

## 1. Summary
When the bulldog takes a hit, show a squashed **hurt** pose for the ~500ms beat
between the hit and the level restart (or the Game Over overlay), instead of
today's placeholder flat red tint. This is the last unbuilt piece of the Alpha
character art.

## 2. User story
As a **player**, I want a squashed "hurt" frame shown when I take a hit, so
that damage reads clearly and I understand why the level just restarted.

## 3. Scope

**In scope**
- One new **hurt frame** added to `src/assets/buldog.png`, produced by a
  small, committed, re-runnable export script (no new hand-drawn art exists —
  the source contact sheet has no damage pose).
- Playing that frame for the whole hurt beat (`HIT_PAUSE_MS`, currently 500ms)
  — on **every** hit, whether it leads to a level restart or to Game Over.
- A **blinking flash** over the hurt frame during that beat, alternating
  between the hero's selected `CHAR-4` tint and a damage red.
- Restoring the hero's selected color cleanly when the beat ends.

**Out of scope**
- Any change to the damage rule itself (1 heart + level restart, no i-frames)
  — this story is visuals only, layered on `specs/health-hearts.md`.
- A death/Game Over animation beyond holding the hurt frame — the GAME OVER
  overlay stays as-is (its real replacement is `UI-5`).
- Knockback, hit SFX, screen shake, or particles. Alpha's only audio is the
  bone blip (`AUDIO-3`).
- Hurt poses for anything else (enemies keep the existing stomp pop, `ENEMY-4`).
- The `[Beta]` personality frames — crawl, snore, fart, rush (`CHAR-6/7/8`).

## 4. Acceptance criteria

- [x] **AC1 — Hurt frame exists in the sheet.** Given the game loads
      `src/assets/buldog.png`, then it contains a distinct squashed hurt pose
      at a known frame index, and the existing idle/run/jump frame indices are
      **unchanged**.
- [x] **AC2 — Hurt frame on a hit.** Given the bulldog is in play, when he
      touches an enemy from the side, then the hurt frame is displayed for the
      whole hurt beat and no idle/run/jump animation plays over it.
- [x] **AC3 — Same on the last heart.** Given the bulldog has 1 heart, when he
      is hit, then the same hurt frame plays for the same beat, and only then
      does the GAME OVER overlay appear.
- [x] **AC4 — Blinking flash.** Given the bulldog is in the hurt beat, then his
      tint alternates between the damage red and his selected color at a fixed
      interval (a visible blink, not a single static tint).
- [x] **AC5 — Color restored.** Given the hurt beat ends, when the level
      restarts, then the bulldog is drawn in the player's selected `CHAR-4`
      color (white / black / red) with no leftover red.
- [x] **AC6 — Red still reads on a red dog.** Given the player picked the red
      bulldog, when he is hit, then the damage state is still visually obvious
      (the blink, not the hue alone, carries the signal).
- [x] **AC7 — Nothing else regresses.** Given normal play, then movement,
      double jump, bone pickup, stomp, hearts and the level restart all behave
      exactly as before, and there are no console errors.

## 5. UX / behaviour details

### The frame
No hurt pose exists in the source art (`frenchbulldogasset-grid.png` rows:
JUMP, IDLE1, IDLE2, SIT, WALK, RUN, SNIFF, SNIFF&WALK). **Decision:** derive it
from an existing frame with a small offline script rather than commissioning
art — the result is committed as pixels, so nothing is generated at runtime.

- Source: an **idle** frame (0–4) from the current sheet.
- Transform: **vertical squash** (dog compressed toward the ground, classic
  "flattened" damage read), keeping the feet on the frame's bottom edge and the
  dog centred horizontally — the same registration every other frame uses
  (`specs/character-sprite.md` §5), so the 24×24 body still lines up.
- Alpha crispness: hard-snapped alpha, no soft edges, matching how the sheet
  was cleaned in `CHAR-2`.
- The script lives in the repo (`tools/`) with a comment on how to re-run it,
  so the sheet is reproducible instead of a mystery binary.

### Sheet layout
The sheet grows by **one row**: 528×144 → 528×192 (4 rows × 11 columns of
48×48). The hurt frame is the first cell of the new row; the rest of the row is
transparent padding so the grid stays uniform for Phaser's spritesheet loader.
Existing frame indices (idle 0–4, run 11–18, jump 22–32) are untouched — the
new frame is index **33**.

### The beat
Unchanged in length and structure from `specs/health-hearts.md`: hit →
`isHurt = true` → heart removed and repainted → **hurt frame + blink** for
`HIT_PAUSE_MS` → level restart, or GAME OVER if that was the last heart. The
player is already out of play for this window (`update()` returns early), so
the hurt frame cannot be overwritten by the normal animation rules.

### The blink
- Alternates between `0xff0000` (damage red) and `colorToTint(currentColor)`
  every **~83ms** — roughly 3 red pulses across the 500ms beat.
- Alternating *to the hero's own color* is what makes the red readable on the
  red bulldog (AC6): the eye catches the change, not the hue.
- On restart the scene is rebuilt from `create()`, which already applies
  `setTint(colorToTint(...))` — the flash cannot leak into the next life. On
  the Game Over path the tint is explicitly restored so the dog isn't frozen
  mid-blink under the overlay.

## 6. Data & persistence
None. The frame index, blink interval and damage red are constants in code.

## 7. Edge cases & error handling
- **Hit while airborne:** the hurt frame replaces the jump animation
  immediately; the player keeps falling (existing behaviour — only X velocity
  is zeroed).
- **Second overlap during the beat:** already guarded by `isHurt` in
  `hurtPlayer()`; the frame and blink are started once.
- **Blink timing vs. the beat:** the blink is driven by the scene clock and
  torn down with the scene on restart, so it can never tick into the new
  level.
- **Game Over path:** the blink stops and the selected color is restored before
  the overlay draws, so the last thing seen is a hurt-but-correctly-coloured
  dog.

## 8. Dependencies
- **Depends on** `CHAR-2` (spritesheet + `src/physics/animation.js` pattern),
  `STATE-1` (`hurtPlayer()` and `HIT_PAUSE_MS`), `CHAR-4` (`colorToTint`).
- **Must not break:** `MOVE-1/2/3/7`, `SCORE-1/8`, `ENEMY-1/4`, `STATE-1/3`,
  `UI-3` (HUD), `NFR-11` (fullscreen scaling).
- **Unblocks:** nothing else in Alpha — this is the last `CHAR` item in the
  slice.

## 9. Definition of done
All acceptance criteria pass, the pure rules unit-tested in
`src/physics/animation.test.js`, `npm run lint` / `test` / `build` green,
playtested with no console errors, merged to `main` via PR.

## 10. Manual playtest checklist
Things unit tests can't judge — verified by Artem on the dev server before the
PR. Each is a **tuning** question: a "no" means adjust a constant / re-export
the frame, not redesign the feature.

- [x] **Blink interval** (`HURT_FLASH_INTERVAL_MS`, starting at ~83ms → 3 red
      pulses per beat): does the blink read as a clear damage signal without
      being seizure-fast or sluggish? Try the value on all three hero colors —
      **red especially**, since that's where the hue alone carries least.
- [x] **Squash readability**: does the derived (script-squashed) hurt pose
      actually read as "he got hit"? If not, that's the trigger for
      commissioning a hand-drawn frame — the plumbing stays the same, only the
      pixels in frame 33 change.
- [x] **Beat length** (`HIT_PAUSE_MS = 500`): with a real pose on screen instead
      of a flat tint, does 500ms still feel right — long enough to register the
      hit, short enough not to stall the restart?
- [x] **Hit while airborne**: the hurt frame takes over mid-fall and looks
      intentional, not like a glitched jump.
- [x] **Last heart**: the hurt beat plays fully, then GAME OVER — and the dog
      under the overlay is in his selected color, not frozen mid-red.

## Technical design

### Files touched / created
| File | Change |
|---|---|
| `tools/make-hurt-frame.py` | **new** — dev-only export script (Python + Pillow). Reads `src/assets/buldog.png`, derives the squashed pose, rewrites the sheet with a 4th row. Idempotent: it always rebuilds row 3 from rows 0–2, so re-running never appends a 5th row. |
| `src/assets/buldog.png` | **regenerated** — 528×144 → 528×192, hurt pose at frame 33, rows 0–2 byte-identical in layout (indices unchanged). |
| `src/physics/animation.js` | edited — add `ANIMATIONS.hurt`, an `isHurt` input to `getAnimationKey`, and the blink rule + its constants. |
| `src/physics/animation.test.js` | edited — one test per testable AC (see Test plan). |
| `src/main.js` | edited — `hurtPlayer()` plays the hurt animation and starts the blink timer; the Game Over branch stops it and restores the hero tint. |

Nothing is added to `package.json`: Pillow is a one-off authoring tool, not a
runtime or CI dependency (the "no tech zoo" flag Artem signed off on).

### Module design (pure, testable)
In `src/physics/animation.js` — extending the existing module rather than
adding a parallel one:

```js
ANIMATIONS.hurt = { key: "hurt", start: 33, end: 33, frameRate: 1 };

export const HURT_TINT = 0xff0000;
export const HURT_FLASH_INTERVAL_MS = 83;

// Hurt outranks airborne, which outranks moving.
getAnimationKey({ isGrounded, velocityX, isHurt })  // -> "hurt" | "jump" | "run" | "idle"

// Which tint to paint during the hurt beat, given ms elapsed since the hit.
getHurtTint(elapsedMs, baseTint)  // -> HURT_TINT on odd/even interval, else baseTint
```

`getHurtTint` takes the hero's own tint as an argument rather than importing
`colorToTint` — the physics module stays free of state dependencies, and the
Scene passes `colorToTint(this.currentColor)` in.

### Scene adapter (`src/main.js`)
- `create()` needs **no change** for the animation itself: the existing loop
  over `Object.values(ANIMATIONS)` picks up `hurt` automatically.
- `hurtPlayer()`: replace `this.player.setTint(0xff0000)` with
  `this.player.play(ANIMATIONS.hurt.key)` plus a `this.time.addEvent({ loop: true,
  delay: HURT_FLASH_INTERVAL_MS })` whose callback applies
  `getHurtTint(elapsed, colorToTint(this.currentColor))`. The event handle is
  kept on the Scene so the Game Over branch can `remove()` it.
- Game Over branch (inside the existing `delayedCall`): stop the blink and
  `setTint(colorToTint(this.currentColor))` before `showGameOver()`.
- Restart branch: nothing to clean up — `scene.restart()` tears down the clock
  and `create()` re-applies the tint and the idle animation.
- `update()` needs no change: it already returns early while `isHurt`, so the
  normal `getAnimationKey` call can't overwrite the hurt frame, and its call
  site relies on the parameter's `false` default. (Passing `this.isHurt` there
  would be dead code — it can only ever be `false` past that early return.)

### Data flow / state
No new persisted state. Transient, Scene-local only: the existing `isHurt`
flag, plus a blink timer handle and its start time. Nothing enters the
registry — hearts and score keep owning what crosses a restart.

### Reuse
- Extends `src/physics/animation.js` and its `ANIMATIONS` table instead of a
  new module — the frame numbers stay in one place, and `create()`'s generic
  animation loop needs no edit.
- Reuses `colorToTint` (`CHAR-4`), `HIT_PAUSE_MS` and the whole `hurtPlayer()`
  flow (`STATE-1`) unchanged.
- Reuses the sheet's existing registration (dog centred, feet on the bottom
  edge), so the 24×24 body needs no special case.
- Genuinely new: only the Pillow script and the pixels it produces.

### Test plan
Unit (`src/physics/animation.test.js`):
- `getAnimationKey` returns `"hurt"` when `isHurt`, regardless of grounded /
  velocity (covers AC2 + AC3's shared rule).
- `getAnimationKey` is unchanged when `isHurt` is false/omitted (AC7 —
  no regression in the existing three states).
- `getHurtTint` alternates: red in the first interval, base tint in the
  second, red in the third (AC4), and returns the passed base tint for any
  color, so red-on-red still blinks (AC6).
- `ANIMATIONS.hurt` sits at frame 33 and the idle/run/jump ranges are
  unchanged (AC1, guards against a sheet re-export shifting indices).

Manual playtest: §10's checklist (AC1's visual read, AC5's restored color,
AC7's no-regression pass, and the tuning questions).

### Open questions / assumptions + risk
**Medium** — 4 assumptions, all cheap to correct:
1. A vertically squashed idle frame reads as "hurt". If not, only the pixels
   in frame 33 change; the plumbing stands.
2. Appending a 4th row (frame 33) is safe for existing indices — verified
   above: Phaser's row-major numbering only shifts if the column count changes.
3. `HURT_FLASH_INTERVAL_MS = 83` is a starting value, tuned in playtest (§10).
4. `HIT_PAUSE_MS` stays 500ms.

## Playtest fixes (round 1)

- **Hero color reset to white after a hit.** Reported during the CHAR-3
  playtest: picking black or red and then taking a hit brought the bulldog back
  as white. Not a blink bug — the color lived only in a Scene field, and
  `create()` re-assigned `DEFAULT_COLOR` after `scene.restart()`. Fixed the same
  way hearts already survive a restart (`specs/health-hearts.md`): the selected
  color is written to `this.registry` when it changes and read back in
  `create()`. Pre-existing since `CHAR-4` — the restart rule simply had nothing
  worth testing against until now. The start screen (`UI-1`/`UI-2`) will write
  the same `"color"` registry key instead of the temporary `C` dev key.
  *(Color deliberately persists across a Game Over → ENTER new run too: it's a
  player preference, not run state like hearts or score.)*
