# Feature Spec: Start screen + arcade nickname entry (`UI-1` / `UI-2`)

> **Scope:** `[Alpha]`. WBS: `UI-1` (minimal start screen), `UI-2` (nickname
> entry). Related: `CHAR-4` (`specs/color-select.md` — the color select this
> screen finally gives a real UI to, replacing its temporary `C` dev key),
> `UI-3` (`specs/hud-and-font.md` — the typography this screen inherits rather
> than choosing its own), `STATE-3` (the placeholder GAME OVER screen, which
> now returns here), `UI-5` (results window — it reads the nickname this screen
> stores), `LEVEL-6` (the single Alpha level this screen starts).
>
> The fuller, art-directed arcade title screen is `[Beta]`; this is the
> minimal version Alpha needs.

> **Status:** draft for review — workflow step 1 (requirements) and step 3
> (technical design) presented together. No code written yet.
>
> Decisions already made with Artem before drafting: nickname is **typed
> normally on the keyboard** (not an arcade letter-wheel), **max 8 characters,
> A-Z 0-9**, nothing is **persisted between browser sessions**, GAME OVER
> returns **to this screen**, and the screen lives in **its own Phaser Scene**.

---

## 1. Summary

A minimal screen shown before the level where the player types a short
nickname and picks the bulldog's color, then presses ENTER to play. It is the
Alpha front door of the game: the only place a run is configured, and the place
GAME OVER sends the player back to.

## 2. User story

As a **player**, I want a short setup screen before the level where I type my
name and pick my bulldog, so that the run feels like mine and my result is
labelled with my name.

## 3. Scope

**In scope**
- A `StartScene` shown first when the game loads.
- **Nickname entry** (`UI-2`): typed on the keyboard, up to 8 characters,
  `A-Z 0-9` only, auto-uppercased, `Backspace` deletes, blinking cursor.
- **Color select** (`CHAR-4`'s UI): left/right arrows cycle white → black →
  red, shown live on a tinted bulldog preview sprite.
- **ENTER starts the run**: stores the nickname and color, resets hearts and
  score, and starts the level scene.
- **GAME OVER → ENTER returns here** instead of restarting the level directly,
  with the previous nickname and color still filled in.
- Removal of the temporary `C` dev key that cycled the color inside the level —
  this screen is now the real owner of that choice (`specs/color-select.md` §5
  always planned for it to be "removed or hidden once the title screen exists").
- Pure nickname rules in a unit-tested module (`src/state/nickname.js`).

**Out of scope**
- Any art beyond text and the existing bulldog sprite: no logo image, no
  background art, no animated title. That is the `[Beta]` title screen.
- Music or sound on this screen (`AUDIO-1/2` are `[Beta]`; `AUDIO-3` is the
  bone blip only).
- A menu with more than one action — no options, no credits, no level select.
- **Persisting** the nickname or color across page reloads (see §6).
- Showing "how to play" instructions on the canvas. Those belong to the
  **surrounding web page**, a future story (see §8).
- The results window (`UI-5`) that will display the nickname at the end.
- A pause menu or an in-level "back to menu" key (`UI-4`, `[Beta]`).

## 4. Acceptance criteria

**Nickname rules (unit-tested, `src/state/nickname.js`)**
- [ ] Given an empty nickname, when the player types `a`, then the nickname is
      `A` — input is uppercased.
- [ ] Given any nickname, when the player types a character that is not
      `A-Z`/`a-z`/`0-9` (space, `-`, `!`, `Ж`), then the nickname is unchanged.
- [ ] Given a nickname of 8 characters, when the player types another
      character, then the nickname is unchanged — 8 is the hard cap.
- [ ] Given a nickname of at least one character, when `Backspace` is pressed,
      then the last character is removed.
- [ ] Given an empty nickname, when `Backspace` is pressed, then it stays empty
      (no error, no underflow).
- [ ] Given an empty nickname, when the run is finalized, then the stored
      nickname is `PLAYER` — the fallback.
- [ ] Given a non-empty nickname, when the run is finalized, then it is stored
      as typed (already uppercase, already within 8 characters).

**Start screen behaviour (manual playtest)**
- [ ] Given the game is loaded, when the page first opens, then the start
      screen is the first thing shown — the level does not run behind it.
- [ ] Given the start screen, when the player types, then the typed characters
      appear immediately with a blinking cursor after them.
- [ ] Given the start screen, when the player presses left/right arrows, then
      the bulldog preview visibly changes color white → black → red → white,
      and the color label matches the preview.
- [ ] Given a typed nickname and a chosen color, when ENTER is pressed, then
      the level starts with the bulldog in that color, 3 full hearts and
      `SCORE 000000`.
- [ ] Given a run that reached 0 hearts, when ENTER is pressed on GAME OVER,
      then the start screen appears again with the previous nickname and color
      still shown, and pressing ENTER again starts a fresh run with 3 hearts
      and score 0.
- [ ] Given the start screen, when `F` is pressed, then fullscreen toggles
      exactly as it does in the level (`NFR-11`), and the layout stays centered
      and readable.
- [ ] Given the start screen is open, when the player uses the keys the level
      uses (arrows, space), then nothing from the level happens — the level
      scene is not running.

## 5. UX / behaviour details

Layout on the 320x240 canvas, using the shared styles from
`src/ui/text-style.js` (`TITLE_TEXT_STYLE` = 16px, `TEXT_STYLE` = 8px):

```
                                          y
            B U L D O G                   40    TITLE_TEXT_STYLE

          ENTER YOUR NAME                 88    TEXT_STYLE
              ARTEM_                     104    16px, cursor blinks

               COLOR                     136    TEXT_STYLE
            <  [dog]  >                  156    live tinted sprite

            PRESS ENTER                  200    TEXT_STYLE, blinks
```

Everything is horizontally centered on x=160 (`setOrigin(0.5)`), matching how
the GAME OVER overlay is already drawn.

**Controls**

| Key | Effect |
|---|---|
| `A-Z`, `0-9` | Append the character to the nickname (uppercased) |
| `Backspace` | Delete the last character |
| `←` / `→` | Previous / next bulldog color |
| `Enter` | Start the run |
| `F` | Toggle fullscreen (`NFR-11`, same as in the level) |

There is no mouse interaction — keyboard only, like the rest of the game.

**Blinking.** The cursor after the nickname and the `PRESS ENTER` line both
blink on a ~500 ms Phaser timer. Two separate visual hints, one timer.

**The bulldog preview** is a normal sprite using the existing `buldog` idle
animation, tinted with `colorToTint()` — the same call the level makes, so the
color the player sees on this screen is the color they get in the level by
construction.

**Arrow keys cycle both ways.** `→` is `nextColor()`; `←` is the same cycle
walked backwards, so the player can step back without wrapping all the way
around three colors.

## 6. Data & persistence

Nothing is written to `localStorage` or any other browser storage. Decided
deliberately:

- Alpha has no need for it — a run is set up in two keystrokes.
- The game currently writes **nothing** to the browser, which keeps the
  cookie-consent story (a future page-level story, see §8) trivially simple.
  The first thing that will need consent is the `[Beta]` scoreboard's
  `localStorage` cache (`BOARD`), and remembering the nickname belongs with it.

Within a session, the run's setup lives in **Phaser's registry** — the same
place `hearts`, `score` and `color` already live, chosen because the registry
outlives `scene.restart()` and `scene.start()`:

| Registry key | Written by | Read by | Value |
|---|---|---|---|
| `nickname` | `StartScene` on ENTER | `UI-5` (later) | `"ARTEM"`, `"PLAYER"` |
| `color` | `StartScene` on ENTER | `BootScene` (already) | `"white"` / `"black"` / `"red"` |
| `hearts` | `StartScene` on ENTER (reset) | `BootScene` (already) | `3` |
| `score` | `StartScene` on ENTER (reset) | `BootScene` (already) | `0` |

Resetting `hearts` and `score` **on this screen** rather than in the level is
what makes "start screen = new run" true in one place: the level keeps its
existing rule of reading whatever the registry holds.

## 7. Edge cases & error handling

- **Empty nickname + ENTER** — allowed; stored as `PLAYER`. The player is never
  blocked from starting.
- **Keys that are not characters** (Shift, Tab, arrows, F-keys) never leak into
  the nickname: the module filters by allowed character, it does not blacklist
  keys.
- **Held-down key auto-repeat** is accepted as normal typing — the 8-character
  cap stops it from running away.
- **Non-Latin input** (Cyrillic, accents) is silently ignored, because
  Press Start 2P has no glyphs for it and would render blank boxes. An
  on-screen label spelling out `A-Z 0-9` is not needed — a keypress that
  produces no character is feedback enough at this size.
- **Browser shortcuts.** `Backspace` on a canvas does not navigate back in any
  currently supported browser, so no `preventDefault` gymnastics are needed;
  if a browser is found where it does, the key handler calls `preventDefault()`.
- **Font not loaded.** Already handled globally: `loadPixelFont()` resolves
  `false` and everything renders in the monospace fallback (`UI-3`).
- **ENTER held from the GAME OVER screen** must not skip straight through the
  start screen into a new run. The scene only reacts to a fresh `Enter`
  keypress after it has been created (`JustDown`, checked from `update()`),
  never to a key already down at creation time.

## 8. Dependencies

**Depends on (already built):**
- `UI-3` — `src/ui/text-style.js` (`TEXT_STYLE`, `TITLE_TEXT_STYLE`,
  `loadPixelFont()`). This screen adds no typography of its own.
- `CHAR-4` — `src/state/color-select.js` (`COLORS`, `DEFAULT_COLOR`,
  `nextColor()`, `colorToTint()`), reused as-is.
- `CHAR-2` — the bulldog sprite sheet and its idle animation, for the preview.
- `STATE-1` — `resetHearts()` from `src/state/health.js`.

**Must not break:**
- The level (`BootScene`) keeps working exactly as it does today, minus the `C`
  dev key. Hearts/score/color still carry across a level restart after a hit.
- `NFR-11` fullscreen (F key and the on-screen button) on both scenes.

**Blocks / feeds:**
- `UI-5` (results window) reads `nickname` from the registry.
- `STATE-3` closes only once GAME OVER routes through the real results window;
  this spec changes where its ENTER goes, not that placeholder's status.

**Future surroundings (not this spec, no WBS rows yet).** The finished game is
planned to sit inside a web page: a header with the game's name, a
"how to play" section, the game canvas itself, a footer with a privacy-policy
link, licence/copyright text and a contact e-mail, plus a cookie-consent
banner. Those are separate stories under a page/legal epic to be added to the
WBS in its own PR. Two consequences are already respected here: this screen
carries **no instructions** (they belong to the page's how-to-play section),
and the game stores **nothing** in the browser (nothing for a consent banner to
gate yet).

## 9. Definition of done

All acceptance criteria pass, `npm run lint` / `npm run test` / `npm run build`
are green with the output shown, the start screen is playtested by Artem, and
no console errors appear on either scene.

---

## Technical design

Approach chosen (of three considered): **a separate `StartScene` in its own
file, with the level scene left where it is.** The alternative of also moving
`BootScene` out of `main.js` into `src/scenes/level-scene.js` — which
`CLAUDE.md`'s project structure wants eventually — is deliberately **not** done
here: it is ~600 lines of pure movement that no unit test covers, and mixing it
into a feature diff makes both harder to review. It should be its own
"Small change" PR afterwards. Drawing the start screen as another overlay
inside `BootScene` (the way GAME OVER is drawn) was rejected: `main.js` is
already 634 lines, and an overlay cannot cleanly be re-shown after GAME OVER
without carrying the finished level's state underneath it.

### Files touched / created

| File | Change |
|---|---|
| `src/state/nickname.js` | **New.** Pure nickname rules. |
| `src/state/nickname.test.js` | **New.** Written first, from §4. |
| `src/scenes/start-scene.js` | **New.** The `StartScene` Phaser scene. |
| `src/main.js` | Register both scenes; drop the `C` dev key and its handler; GAME OVER's ENTER starts `StartScene` instead of restarting. |
| `Bulldog-8Bit-WBS.md` | `UI-1`/`UI-2` → Done, counts updated (same PR). |
| `Bulldog-8Bit-Checklist.md` | Tick the start-screen items (same PR). |

`src/scenes/` is created by this change — it is the directory `CLAUDE.md`
already plans for, not a new pattern.

### Module design — `src/state/nickname.js`

Pure, no Phaser import, unit-tested:

```js
export const MAX_NICKNAME_LENGTH = 8;
export const DEFAULT_NICKNAME = "PLAYER";

export function isAllowedChar(char)          // true for A-Z, a-z, 0-9 (single char)
export function typeChar(nickname, char)     // -> nickname + uppercase char,
                                             //    unchanged if disallowed or full
export function backspace(nickname)          // -> nickname without last char
export function finalizeNickname(nickname)   // -> trimmed, or DEFAULT_NICKNAME if empty
```

Every rule that could be got wrong (the cap, the filter, the uppercasing, the
fallback) lives here where a test can disagree with it. The scene holds only
the current string and paints it.

`src/state/` is the right home: it sits beside `color-select.js`, `health.js`
and `score.js`, which are the same shape of thing — run state rules, not
physics.

### Module design — `src/scenes/start-scene.js`

A thin Phaser adapter, in the shape the rest of the code already uses:

- `create()` — builds the five text objects and the preview sprite; reads
  `nickname` and `color` back out of the registry so a return from GAME OVER
  shows the previous run's setup; registers the key handlers; starts one
  ~500 ms blink timer.
- Keyboard: one `keydown` listener for characters and `Backspace` (calling
  `typeChar()` / `backspace()` and re-rendering the nickname text), plus
  `left`/`right`/`ENTER`/`F` handled the same way the level handles keys.
- `startRun()` — on ENTER: writes `nickname`, `color`, `hearts`, `score` into
  the registry, then `this.scene.start("BootScene")`.

No game logic lives here beyond wiring — the rules are in `nickname.js` and
`color-select.js`.

### Data flow / state

```
StartScene           registry                    BootScene (level)
  typing  ── nickname.js ──► local string
  arrows  ── color-select.js ─► local color ──► preview tint
  ENTER ─────────────────────► nickname
                               color      ──────► hero tint (already reads this)
                               hearts = 3 ──────► HUD hearts (already reads this)
                               score  = 0 ──────► HUD score  (already reads this)

GAME OVER + ENTER ◄──────────────────────────────  scene.start("StartScene")
```

The registry is the only channel between the scenes. No new global, no module
holding mutable state.

### Reuse

- Typography: `TEXT_STYLE` / `TITLE_TEXT_STYLE` (`UI-3`) — unchanged.
- Color: `nextColor()` / `colorToTint()` / `DEFAULT_COLOR` (`CHAR-4`) —
  unchanged; this screen is the UI those functions were written for. `←` needs
  a *previous* color: added as a `previousColor()` sibling in
  `color-select.js` (with its own unit test), rather than a second cycle
  implementation in the scene.
- Hearts: `resetHearts()` (`STATE-1`) — unchanged.
- Sprite + idle animation: `CHAR-2`'s existing texture and animation key.
- Nothing new joins the stack: no dependency, no tool, no asset.

### Test plan

**Unit (Vitest, written first, from §4):** `src/state/nickname.test.js` —
uppercasing, disallowed characters, the 8-character cap, backspace including on
empty, and both `finalizeNickname()` branches. Plus one added case in
`src/state/color-select.test.js` for `previousColor()` (each transition and the
unknown-value fallback).

**Manual playtest (the scene half of §4):** first-load order, live typing and
blink, color preview matching the level's hero, ENTER starting a clean run,
GAME OVER returning here with the previous setup, fullscreen on both scenes,
and level keys doing nothing on the start screen.

### Open questions / assumptions + risk

**Risk: Low** — two assumptions, both cheap to reverse:

1. The title is the word `BULDOG` set in the game's font, not a logo image —
   art-directed title screens are `[Beta]`.
2. Resetting `hearts` and `score` is the start screen's job, not the level's,
   so "new run" has exactly one definition.
