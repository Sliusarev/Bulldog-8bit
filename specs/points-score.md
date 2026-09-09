# Feature Spec: One arcade score, in points (`SCORE-8`)

> **Scope:** `[Alpha]`. WBS: `SCORE-8`. Supersedes the "score = count of bones"
> rule in `specs/small-bones.md` (`SCORE-1`) — everything else in that spec
> stands. Related: `specs/simple-enemy-stomp.md` (`ENEMY-4`, the stomp that now
> pays out), `specs/health-hearts.md` (the level restart the score resets with),
> `UI-3` (HUD), `UI-5` (results window), `BOARD-1` (`[Beta]` scoreboard, which
> ranks by exactly this number).

> **Status:** v2 — implemented and playtested (all acceptance criteria pass).
>
> *(Was: draft for review, workflow step 1.)*
>
> **Why this exists.** Alpha was specified with **two** player-facing metrics —
> bones collected and elapsed time. Reviewing the timer spec, Artem judged that
> confusing: the player can't tell which number is "their result", and a
> scoreboard cannot sort by two keys. The fix is the classic arcade answer —
> **one SCORE in points**, which everything feeds. The **level timer
> (`SCORE-7`) is therefore cut from Alpha** and moved to `[Beta]`, where it can
> return as a *speed bonus* to this same number rather than as a rival metric.

---

## 1. Summary
Replace the bone-count score with a single **points** score: a Small Bone is
worth **+100**, stomping an enemy **+200**. The HUD shows one number,
`SCORE: 700`, and that number is what the results window (`UI-5`) reports and
what a future scoreboard ranks by.

## 2. User story
As a **player**, I want one score that goes up when I do anything well, so that
**I know exactly what my result is** and can compare it against other players.

## 3. Scope

**In scope**
- **Points, not counts.** The score is a points total; nothing on screen says
  how many bones were collected.
- **Point values:** Small Bone **+100**, enemy defeated by stomp **+200**.
- **Stomping now scores** — previously it rewarded nothing but survival. This
  is the change that makes "one number for everything I do well" true rather
  than just a rename.
- **HUD:** `SCORE: n` beside the hearts, replacing `BONES: n` in the same spot
  and style.
- **Reset on a level restart** (a hit): the score returns to 0, because the
  bones respawn and would otherwise be scored twice. Hearts still carry over —
  they remain the only thing that survives a restart.
- **The pure rules** in the existing `src/state/score.js`, extended rather than
  replaced: point constants, an "add points" rule per event, and the display
  format. Its unit tests are updated in place.

**Out of scope**
- **The level timer** (`SCORE-7`) — cut from Alpha by this decision, and any
  speed bonus with it (`[Beta]`).
- **Beta point sources** — Large Bone (+200), Dog Toy, Avocado, Bulldog Rush /
  Fart Attack kills. They plug into the same rule when they're built.
- **The results window** (`UI-5`) and the full HUD (`UI-3`) — this story only
  produces the number and leaves it where they can read it.
- **Score persisting across levels** (`SCORE-6`, `[Beta]` — Alpha has one level).
- **A high-score / personal best** of any kind, local or online (`BOARD-1`).
- Changing how bones are placed, animated, collected, or how the pickup blip
  sounds — all of `specs/small-bones.md` except the scoring rule stays as is.

## 4. Acceptance criteria

- [x] **AC1** Given a new run starts, then the HUD shows `SCORE: 0`.
- [x] **AC2** Given the player collects a Small Bone, then the score rises by
      **exactly 100** (and the pickup blip still plays).
- [x] **AC3** Given the player stomps an enemy, then the score rises by
      **exactly 200**.
- [x] **AC4** Given the player collects both bones and stomps the enemy, then
      the score reads **400** — the sources add into one number.
- [x] **AC5** Given a side/below hit costs a heart and restarts the level, then
      the score is back to **0** while the heart count is not.
- [x] **AC6** Given the run ends, then the final score is available to a later
      results window (`UI-5`) without it re-deriving anything — as the score
      already is today via the registry.
- [x] **AC7** Given a stomped enemy is still falling off-screen, then it cannot
      score again — one stomp pays out exactly once.
- [x] **AC8** Given the HUD, then no bone count and no timer are displayed —
      hearts and one score, on one line.
- [x] **AC9** No console errors.

## 5. UX / behaviour details

**The display.** `SCORE: 700`, in the same 12px monospace, in the same place
`BONES:` occupied — to the right of the hearts, vertically centred on them. No
zero-padding (`SCORE: 0`, not `SCORE: 000000`) — padding is an arcade flourish
that can come with `UI-3` if it looks better then.

**Why 100 / 200.** Round arcade numbers, and the ratio is the point: an enemy
is worth two bones, so taking a risk beats hoovering up pickups. Both live as
named constants, so retuning is one line.

**Where the points are awarded.** Exactly where the events already are:
collecting a bone (`collectBone`) and the STOMP branch of the enemy contact
(`touchEnemy`). AC7 needs no new work — the enemy is marked dead in the same
frame, so the stomp branch cannot run twice for one enemy.

**Reset.** Nothing new: `create()` already re-initialises the score, and a hit
restarts the scene. This spec only changes the *value* of what's counted.

## 6. Data & persistence
Nothing persisted. The score stays a scene field mirrored into the Phaser
registry under `score` — the same key `UI-3`/`UI-5` were already going to read.
Unlike hearts, it is **not** carried across a restart.

## 7. Edge cases & error handling
- **Stomping the same enemy twice** — impossible; the dead flag is set in the
  same frame (`ENEMY-4`, AC7 there), so it can't score twice.
- **Collecting a bone twice** — impossible; the bone's body is disabled on
  pickup (`SCORE-1`).
- **The R dev key** — keeps resetting the score to 0 along with respawning the
  bones and the enemy, exactly as today. It still does not touch hearts.
- **Score at Game Over** — frozen by definition: the run is over and no more
  events fire. The placeholder GAME OVER screen doesn't show it; `UI-5` will.

## 8. Dependencies
- **Builds on:** `src/state/score.js` (extended, not replaced), `collectBone`
  and the STOMP branch of `touchEnemy` in `src/main.js`, the existing HUD text.
- **Must not break:** bone collection and its blip (`SCORE-1`), the stomp and
  its bounce (`ENEMY-4`), the heart/restart rule (`STATE-1`/`ENEMY-3`).
- **Unblocks:** `UI-5` (its main number now exists and is final), `UI-3`,
  `BOARD-1` (`[Beta]` — one sortable value per run).

## 9. Definition of done
All acceptance criteria pass, `src/state/score.test.js` updated for the points
rules, `npm run lint` / `test` / `build` green, playtested with no console
errors, merged to `main` via PR.

---

## Technical design

> Workflow step 3 (see `CLAUDE.md` → "The agreed delivery flow"). Written after
> the spec above was approved; implementation starts once Artem approves this.

### Files touched / created

| File | Change |
|---|---|
| `src/state/score.js` | edited — points constants and one general `addPoints` rule replace `POINTS_PER_SMALL_BONE`/`addBone`; `formatScore` now prints `SCORE: n` |
| `src/state/score.test.js` | edited — the count-based expectations become point-based, one test per testable acceptance criterion |
| `src/main.js` | edited — `collectBone` awards `POINTS_SMALL_BONE`, the STOMP branch of `touchEnemy` awards `POINTS_ENEMY_STOMP` |
| `CLAUDE.md`, `Bulldog-8Bit-WBS.md`, `Bulldog-8Bit-Checklist.md`, `specs/alpha-scope.md`, `specs/small-bones.md` | **already updated** with this decision (the `## Scoring` section, `SCORE-8`, `SCORE-7` moved to `[Beta]`) |

**No new files, dependencies, libraries or tools.** This is deliberately an
*edit* to the module that already owns scoring, not a new one — the whole point
of the change is that there is one number in one place.

**Not in this story:** the Press Start 2P pixel font. It is decided and written
down (`CLAUDE.md` → "Look and feel", `UI-3` in the WBS) but belongs to `UI-3`,
which changes every piece of text at once rather than leaving the HUD in two
fonts.

### Module design — `src/state/score.js` (pure, testable)

Same file, same house style; the rules become point-based and gain the second
source:

```js
export const INITIAL_SCORE = 0;

// What each scoring event is worth. Round arcade numbers, and the 2:1 ratio is
// the design: an enemy is worth two bones, so taking a risk beats hoovering up
// pickups. [Beta] sources (Large Bone +200, ability kills) get a constant here
// rather than a rule of their own.
export const POINTS_SMALL_BONE = 100;
export const POINTS_ENEMY_STOMP = 200;

// One general rule instead of one function per pickup: the Scene says WHAT
// happened by passing the matching constant, and this stays the only place
// score arithmetic lives.
export function addPoints(score, points)

// "SCORE: 700" — replaces "BONES: n". No zero-padding (see §5).
export function formatScore(score)

export function resetScore()   // unchanged
```

`addBone(score)` and `POINTS_PER_SMALL_BONE` are **removed**, not kept as
aliases: two ways to score would be exactly the duplication this change exists
to delete, and the only two call sites are in `main.js`.

### Scene wiring (`src/main.js`)

1. `collectBone()` — `this.score = addPoints(this.score, POINTS_SMALL_BONE)`;
   the rest (disable the body, play the blip, update the text, mirror into the
   registry) is untouched.
2. `touchEnemy()`, **STOMP branch** — after `killEnemy(enemy)` and the player's
   bounce, `this.score = addPoints(this.score, POINTS_ENEMY_STOMP)` and the
   same two lines that refresh the HUD text and the registry. AC7 (one payout
   per stomp) needs nothing new: `enemy.isDead` is already set in that same
   frame, so this branch cannot run twice for one enemy.
3. Because both call sites now do "add points → update text → mirror to
   registry", that trio moves into one small `awardPoints(points)` method, and
   both call it. One place that touches the HUD and the registry, which is what
   `UI-3` will later replace.
4. The HUD text itself needs no move — `formatScore` changes what it says, not
   where it sits.

### Data flow / state

Unchanged from today: `this.score` is a scene field, mirrored into the registry
under `score` on every change, re-initialised by `create()` — which is why a
level restart resets it (AC5) with no extra code. Hearts remain the only value
carried across a restart (they live in the registry and are *read* by
`create()`; the score is *written* by it).

### Reuse

- **Reused:** the whole existing scoring path — module, registry key, HUD text
  object, and the `create()`-resets-it behaviour. Nothing is rebuilt.
- **Consolidated:** `addBone` (bone-specific) becomes `addPoints` (event-
  agnostic), so the Beta pickups extend one rule instead of adding parallel
  ones — the "push reuse back up" note from `CLAUDE.md`.
- **Genuinely new:** only the two constants and the enemy call site.

### Test plan

| Acceptance criterion | Covered by |
|---|---|
| AC1 a run starts at `SCORE: 0` | 🧪 unit (`INITIAL_SCORE`, `formatScore(0)`) |
| AC2 a bone is worth exactly 100 | 🧪 unit (`addPoints(0, POINTS_SMALL_BONE)`) + 👁 playtest (blip still plays) |
| AC3 a stomp is worth exactly 200 | 🧪 unit (`POINTS_ENEMY_STOMP`, and that it is double the bone) + 👁 playtest |
| AC4 sources add into one number (2 bones + 1 stomp = 400) | 🧪 unit (chained `addPoints`) |
| AC5 the score resets on a level restart, hearts don't | 👁 playtest (existing `create()` behaviour) |
| AC6 the final score is readable by `UI-5` | 👁 playtest (registry key, as today) |
| AC7 one stomp pays out once | 👁 playtest (guaranteed by `enemy.isDead`, already unit-tested in `enemy.test.js` via `classifyContact` → `NONE`) |
| AC8 no bone count and no timer in the HUD | 🧪 unit (`formatScore` says `SCORE:`) + 👁 playtest |
| AC9 no console errors | 👁 playtest |

### Open questions / assumptions + risk

**Risk: Low.** The point values and the format are confirmed; the change is
contained to one pure module and two call sites. Two assumptions remain, each
one line:

1. **No zero-padding** on the displayed number (`SCORE: 0`) — revisit in `UI-3`
   if a padded arcade counter looks better with the pixel font.
2. `addBone` is **deleted** rather than deprecated — safe here because the
   project has exactly two call sites and no external consumers.
