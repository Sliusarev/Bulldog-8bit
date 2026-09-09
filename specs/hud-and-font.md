# Feature Spec: In-game HUD + the game's pixel font (`UI-3`)

> **Scope:** `[Alpha]`. WBS: `UI-3`. Related: `STATE-1`
> (`specs/health-hearts.md` — the hearts this HUD takes over), `SCORE-8`
> (`specs/points-score.md` — the score it displays), `STATE-3` (the placeholder
> GAME OVER screen, restyled here), `UI-1/2` and `UI-5` (start screen and
> results window — they inherit this typography instead of choosing their own).
> `SCORE-7` (timer) and `STATE-2` (Energy) are `[Beta]` and are **not** in this
> HUD.

> **Status:** v2 — implemented and playtested (all acceptance criteria pass;
> 8px confirmed readable, so the size stands).
>
> *(Was: draft for review, workflow step 1.)* Three decisions were made
> up front and are baked in: the font is **Press Start 2P** (vendored, SIL OFL,
> no npm package and no CDN — recorded in `CLAUDE.md` → "Look and feel"); the
> HUD is **hearts top-left, score top-right**; the score is **zero-padded**.

---

## 1. Summary
Turn the temporary debug HUD into the real one, and give the whole game its
typeface. Hearts sit in the top-left, a zero-padded `SCORE` in the top-right,
and **every piece of text in the game** — HUD, GAME OVER, and later the start
screen and results window — is rendered in **Press Start 2P**, the free arcade
pixel font, loaded from a file inside the repo.

## 2. User story
As a **player**, I want a HUD that looks like an arcade game rather than
debug text, so that **the game reads as a finished 8-bit game** instead of a
prototype.

## 3. Scope

**In scope**
- **The font, once, everywhere.** Press Start 2P vendored into
  `src/assets/fonts/` with its `OFL.txt` licence, declared with a plain
  `@font-face` in `index.html`, and used by every text object in the game.
- **Waiting for the font before the first draw** — the game boots only once the
  browser reports the face is ready, so no text is ever painted in the fallback
  font and then visibly swapped.
- **A fallback that still works** — if the font fails to load, text falls back
  to monospace and the game runs normally.
- **HUD layout:** hearts in the **top-left** (as today), `SCORE` in the
  **top-right**, both on the same top line.
- **Zero-padded score:** `SCORE 000400` — six digits, so the text never changes
  width and the HUD can't twitch as the number grows.
- **The GAME OVER placeholder restyled** in the new font (it is still a
  placeholder that `UI-5` replaces — this only stops it being the odd one out).
- **Any text style shared in one place**, so `UI-1/2/5` reuse it instead of
  re-declaring a font stack per screen.

**Out of scope**
- **The level timer** (`SCORE-7`) and the **Energy segments** (`STATE-2`) —
  both `[Beta]`; the Alpha HUD is hearts + score only.
- **The results window** (`UI-5`), the **start screen / nickname** (`UI-1/2`)
  and the **pause menu** (`UI-4`, `[Beta]`) — they consume this story's
  typography but are their own stories.
- **The hurt frame** (`CHAR-3`) and any change to how hearts empty or how
  points are awarded — this story moves and restyles what exists, it does not
  change any rule.
- **A HUD frame/panel, icons other than the hearts, or score-pop animations.**
- **Removing the dev keys** (`C`, `R`). They go when the start screen (`UI-2`)
  makes them redundant, not here.

## 4. Acceptance criteria

- [x] **AC1** Given the game loads, then **all** in-game text (HUD and the
      GAME OVER screen) is rendered in Press Start 2P — no monospace anywhere.
- [x] **AC2** Given a normal load, then text is **never** drawn in the fallback
      font first and then swapped — the first frame already has the right font.
- [x] **AC3** Given the font file cannot be loaded, then the game still starts
      and remains playable with fallback text (no crash, no invisible text).
- [x] **AC4** Given the level is running, then the hearts are in the top-left
      and the score is in the **top-right**, aligned on the same top line.
- [x] **AC5** Given any score, then it reads zero-padded to six digits —
      `SCORE 000000` at the start, `SCORE 000400` after two bones and a stomp.
- [x] **AC6** Given the score rises, then the text's **width and position do
      not change** (it is right-aligned and fixed-width by construction).
- [x] **AC7** Given the GAME OVER screen, then its text uses the same font and
      stays readable and centred.
- [x] **AC8** Given the game is scaled up (a large window, or fullscreen), then
      the text stays crisp — no blurring, in line with `NFR-11`.
- [x] **AC9** Given the repo, then the font file ships with its **`OFL.txt`**
      licence alongside it.
- [x] **AC10** No console errors, and no new runtime dependency (no npm
      package, no CDN request) is introduced.

## 5. UX / behaviour details

**The font.** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
by CodeMan38 — the de-facto NES/arcade pixel face, released under the **SIL
Open Font License 1.1**, which permits shipping it inside this (public) repo as
long as the licence travels with it. The `.ttf` is copied from Google's fonts
repository into `src/assets/fonts/`, next to `OFL.txt`.

It is drawn at **8px**, its native design size, on the 320x240 canvas — so a
character cell is exactly 8x8 pixels and lands on the pixel grid. `SCORE 000000`
is 12 characters ≈ 96px, which fits the top-right comfortably.

**Why a plain `@font-face` and not a loader library.** Phaser has no built-in
web-font loader and the usual answer is the `webfontloader` package — a
dependency this project doesn't need: the browser's own
`document.fonts.load()` / `document.fonts.ready` does the same job in two
lines. Nothing joins the stack (`CLAUDE.md` → "no tech zoo").

**The boot gate.** The game is created only after the font is reported ready,
so `create()` can never paint text in the fallback face (AC2). If that wait
fails or times out, the game boots anyway with the fallback (AC3) — a missing
font must never mean a missing game.

**Score alignment.** The score text is **anchored by its right edge** to a fixed
x near the right margin. Combined with the zero-padding, the number stays
rock-steady as it grows (AC6) — the padding is what makes it look deliberate
rather than merely fixed-width.

**Hearts.** Unchanged in art, size and behaviour — only their role changes from
"the health story's own HUD" to "part of the HUD". They stay in the top-left.

**One text style.** The font family, size and colour live in **one exported
style object** that every text object spreads, so `UI-1`, `UI-2` and `UI-5`
inherit the look for free and the game cannot drift into three typographies.

## 6. Data & persistence
Nothing persisted, no new state. The HUD reads exactly what it reads today: the
scene's score value and heart count (both already mirrored into the registry).

## 7. Edge cases & error handling
- **Font still loading on a cold cache** — handled by the boot gate; the canvas
  simply appears a moment later rather than flashing the wrong font.
- **Font blocked or missing** (offline build, corrupted file) — fallback to
  monospace, game unaffected (AC3).
- **A score above 999999** — the padding is a *minimum* width, so a seventh
  digit widens the number leftwards rather than being truncated. Unreachable in
  Alpha (two bones and one enemy = 400), but it degrades honestly.
- **Fullscreen / heavy upscaling** — the text is rendered into the 320x240
  canvas and scaled with the same nearest-neighbour path as every sprite, so it
  stays crisp (AC8).
- **Very long text on other screens later** — not this story's problem, but the
  shared style object is where a smaller size would be set.

## 8. Dependencies
- **Builds on:** the heart row and its icons (`specs/health-hearts.md`), the
  score text and `formatScore` (`specs/points-score.md`), the existing
  `index.html` and the Phaser scale config (`NFR-11`).
- **Must not break:** heart rendering and the damage rule, score awarding,
  fullscreen scaling, the dev keys.
- **Unblocks:** `UI-1`/`UI-2` (start screen + nickname) and `UI-5` (results
  window) — all three then inherit a finished typography instead of inventing
  one each.

## 9. Definition of done
All acceptance criteria pass, any pure logic (the score's zero-padding) unit
tested, `npm run lint` / `test` / `build` green, playtested windowed **and**
fullscreen with no console errors, merged to `main` via PR.

---

## Technical design

> Workflow step 3 (see `CLAUDE.md` → "The agreed delivery flow"). Written after
> the spec above was approved; implementation starts once Artem approves this.

### Files touched / created

| File | Change |
|---|---|
| `src/assets/fonts/PressStart2P-Regular.ttf` | **new** — the font, copied from Google's official fonts repository |
| `src/assets/fonts/OFL.txt` | **new** — its SIL Open Font License 1.1, shipped beside it (AC9) |
| `src/ui/text-style.js` | **new** — the one text style every screen spreads, plus the font-loading helper |
| `src/state/score.js` | edited — `formatScore` zero-pads to six digits |
| `src/state/score.test.js` | edited — tests for the padded format |
| `src/main.js` | edited — boot behind the font gate, score moved to the top-right and right-anchored, every text object uses the shared style |
| `Bulldog-8Bit-Checklist.md`, `Bulldog-8Bit-WBS.md` | edited at the end — tick `UI-3` (via the `update-checklist` skill) |

**No new dependencies, libraries or tools.** The browser's own `FontFace` API
does the loading; `webfontloader` (the usual Phaser answer) is deliberately not
added.

**One new folder, `src/ui/`** — justified rather than assumed: the existing
homes are wrong for this (`physics/` is movement/collision rules, `state/` is
run resources), and the whole point of the shared style is that `UI-1`, `UI-2`
and `UI-5` — which become separate scene files — import the same object. A
constant parked in `main.js` would have to be imported *from* `main.js` by
those scenes, which inverts the dependency.

### Module design — `src/ui/text-style.js`

```js
// The font's family name as the browser will know it.
export const PIXEL_FONT = "Press Start 2P";

// Every text object in the game spreads one of these, so the game cannot
// drift into three typographies. Sizes are multiples of 8 because that is the
// font's native cell — anything else lands off the pixel grid and blurs.
export const TEXT_STYLE = { fontFamily: `"${PIXEL_FONT}", monospace`, fontSize: "8px", color: "#ffffff" };
export const TITLE_TEXT_STYLE = { ...TEXT_STYLE, fontSize: "16px" };  // GAME OVER, and later UI-5's heading

// Loads the vendored .ttf and registers it with the document. Resolves TRUE if
// the face is ready and FALSE if it could not be loaded — never rejects, so a
// missing font can only ever mean "fall back", not "no game" (AC3).
export async function loadPixelFont()
```

The fallback is expressed in the style itself: `"Press Start 2P", monospace`.
If the face never arrives, the browser uses the second entry and every screen
still renders — AC3 needs no separate code path.

`loadPixelFont()` uses the **`FontFace` API** rather than a `@font-face` rule in
`index.html`'s `<style>`: the font is then imported like every other asset
(`import fontUrl from "../assets/fonts/PressStart2P-Regular.ttf"`), so Vite
fingerprints and bundles it the same way it already does for the sprite sheets,
and the load has an explicit `await` + `catch` — which is exactly what the boot
gate and the fallback need.

### Scene wiring (`src/main.js`)

1. **Boot gate.** Game creation moves into a `startGame()` function, called as
   `loadPixelFont().then(startGame)`. Because `loadPixelFont` never rejects,
   `startGame` always runs — with the real font when it loaded, with the
   fallback when it didn't (AC2/AC3). The fullscreen button and the scale-event
   handlers, which reference `game`, move inside `startGame` with it.
2. **Score text → top-right.**
   `this.add.text(312, 10, formatScore(this.score), TEXT_STYLE).setOrigin(1, 0.5)`
   — anchored by its **right** edge at x 312 (8px margin), vertically centred on
   the heart row's y 10. Right-anchoring plus the zero-padding is what makes
   AC6 true by construction rather than by luck.
3. **Hearts** — untouched: same art, same positions (centres 14/33/52, y 9).
4. **GAME OVER overlay** — `TITLE_TEXT_STYLE` for the heading and `TEXT_STYLE`
   for `PRESS ENTER`, replacing the inline monospace styles. Nothing else about
   it changes; `UI-5` still replaces it wholesale.
5. No other text objects exist today, so after this pass nothing in the game is
   monospace (AC1).

### Data flow / state
Unchanged. The HUD renders the same two values it renders today — the scene's
score (mirrored into the registry) and heart count. This story moves and
restyles; it changes no rule and adds no state.

### Reuse
- **Reused:** the existing score text object and `formatScore` (only its format
  string changes), the heart row exactly as `STATE-1` built it, the asset-import
  pattern (`import … from "./assets/…"`) now extended to a font, and the
  existing `create()` structure.
- **Genuinely new:** the font files, `src/ui/text-style.js`, and the boot gate.
  The gate can't reuse Phaser's loader — Phaser's `preload` loads *game* assets
  into its texture cache and knows nothing about DOM fonts, which is precisely
  why the wait has to happen before the game is constructed.
- **Pushed up to the spec:** making `UI-3` own the typography for the *whole*
  game (not just the HUD) is what stops `UI-1/2/5` each inventing their own —
  already recorded in `CLAUDE.md` and the WBS.

### Test plan

| Acceptance criterion | Covered by |
|---|---|
| AC1 all text in the pixel font | 👁 playtest |
| AC2 no fallback-font flash on a normal load | 👁 playtest (hard reload with a cold cache) |
| AC3 the game still runs if the font fails | 👁 playtest (block/rename the file) + the fallback in the style itself |
| AC4 hearts top-left, score top-right | 👁 playtest |
| AC5 the score is zero-padded to six digits | 🧪 unit (`formatScore(0)`, `(400)`, `(123456)`) |
| AC6 the score's width/position never change | 🧪 unit (every formatted string is the same length) + 👁 playtest |
| AC7 GAME OVER uses the font and stays centred | 👁 playtest |
| AC8 text stays crisp scaled up and in fullscreen | 👁 playtest (windowed **and** fullscreen) |
| AC9 the licence ships with the font | 👁 file present in the repo |
| AC10 no console errors, no npm package, no CDN | 👁 playtest + the diff (`package.json` untouched) |

### Open questions / assumptions + risk

**Risk: Low.** Font, layout and number format are all confirmed. Two
assumptions, both one-liners:

1. **8px text** (the font's native cell) — Artem will judge readability in the
   playtest; the size lives in one style object, so 16px is a one-word change.
2. **Six digits** of padding, and a seventh would widen the number leftwards
   rather than being truncated.
