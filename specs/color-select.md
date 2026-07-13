# Feature Spec: Bulldog Color Select (white / black / red)

> **How to use this in a spec-driven flow:**
> 1. Fill this out *before* writing any code.
> 2. Give it to Claude Code and ask it to produce a **plan + task list** from the spec — no code yet.
> 3. Review/approve the plan (your PM step).
> 4. Have it implement task by task.
> 5. Verify every item in "Acceptance criteria" before marking the feature done.
> Keep this file as the source of truth. If the code needs to differ, update the spec first.

WBS: `CHAR-4`. Related: `CHAR-2` (bulldog sprite + animations), `UI-2`
(nickname entry — shares the future title screen), `UI-1` (title screen).

---

## 1. Summary
Let the player choose the bulldog's color — **white, black, or red** — and use
that color for the hero everywhere in the game. It's a bit of cheap, characterful
personalization with no gameplay effect.

## 2. User story
As a **player**, I want to pick my bulldog's color before I start, so that the
hero feels like *mine* for the whole run.

## 3. Scope

**In scope**
- Three selectable colors: **white, black, red**.
- The chosen color is applied to the player sprite in every scene/level for the
  whole run.
- A **temporary developer key** (e.g. `C`) to cycle colors at runtime, so the
  feature can be built and tested **before** the real title screen exists
  (title-screen wiring is Phase 4 / `UI-2`).
- Implementation via **Phaser tint** on a single neutral/light sprite sheet
  (per `CLAUDE.md`, the art is drawn light so it can be tinted). Swapping to
  three separate sheets is the fallback if tinting looks bad.
- The pure "which color is selected / what tint value does it map to" logic
  lives in a plain, unit-tested module (e.g. `src/physics/color-select.js` or
  `src/state/color-select.js`).

**Out of scope**
- The actual **title screen UI** and nickname entry (Phase 4, `UI-1/UI-2`) —
  this spec only needs the *mechanism* + a temp key to prove it works.
- More than three colors, custom color pickers, or per-part recoloring.
- Persisting the choice across browser sessions (see §6 — decided as a run-only
  choice unless flagged).
- Any gameplay effect (color is purely cosmetic).

## 4. Acceptance criteria
- [ ] Given the game starts, when no color has been chosen, then the bulldog
      shows a sensible **default** color (decision: **white**).
- [ ] Given the temporary dev key is pressed, when it cycles, then the player
      sprite's color changes **white → black → red → white …** and is visibly
      different for each.
- [ ] Given a color is chosen, when the player moves between scenes/levels, then
      the sprite keeps that color (no reset on scene change).
- [ ] Given the sprite is animated (idle/run/jump/hurt), when a color is active,
      then **every** animation frame shows that color (tint isn't lost on
      animation change).
- [ ] Given the color-select logic module, when asked to advance from any color,
      then it returns the correct next color, and maps each color to the correct
      tint value — covered by unit tests (one per color transition + each
      mapping).

## 5. UX / behaviour details
- **Now (Phase 2):** no menu. Press the temp key `C` to cycle color; the sprite
  updates immediately. This is a dev affordance, removed or hidden once the
  title screen exists.
- **Later (Phase 4):** the title screen shows three bulldog swatches/previews;
  the player highlights one with arrows and confirms; the chosen color is passed
  into the game. This spec's module is what that screen will call — the UI just
  drives it.
- Colors are represented internally as a small enum/list, e.g.
  `['white', 'black', 'red']`, each with a tint hex.
- **"Red" reads as a warm, foxy reddish-brown** (a fox/ginger tone), not a
  fire-engine primary red — pick the tint hex to land there so the bulldog
  looks like a ginger/red dog, not a cartoon-red one.

## 6. Data & persistence
- Selected color is held in a small shared game state (e.g. a registry value or
  a `GameState` object passed between scenes) as one of `'white' | 'black' |
  'red'`.
- **No cross-session persistence for now** — the choice lasts one run and resets
  on reload. *Assumption — flag if the color should be remembered in
  `localStorage` between visits.* (If yes, it would pair naturally with the
  nickname in `UI-2`.)

## 7. Edge cases & error handling
- **Unset / invalid color** → fall back to the default (white), never crash.
- **Tint value that washes out an animation** → if a color reads badly as a
  tint over the light sheet, fall back to a dedicated sprite sheet for that
  color (documented in §3 as the fallback path).
- **Key spam** → cycling is idempotent per press; holding the key shouldn't
  strobe (advance once per keydown, not per frame).

## 8. Dependencies
- **Depends on `CHAR-2`** — needs the real bulldog sprite sheet (or at least a
  tint-friendly placeholder) to show color on. Can be built against the
  placeholder if art isn't ready (matches the "placeholder now, art later"
  decision for Phase 2).
- **Feeds `UI-1/UI-2`** — the future title screen will drive this module instead
  of the temp key.
- Must not interfere with movement/physics input (`specs/player-physics.md`) —
  the temp key must not clash with existing controls.

## 9. Definition of done
All acceptance criteria pass; the color-select logic is unit-tested and CI is
green (`lint` + `test` + `build`); the bulldog can be cycled through white,
black, and red at runtime with the color persisting across scenes; committed and
pushed; no console errors.
