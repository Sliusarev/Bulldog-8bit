# Feature Spec: Player Physics (Core Movement & Jump)

> **Scope:** `[Alpha]`. WBS: `MOVE-1` / `MOVE-2` / `MOVE-3` (built), plus the
> `MOVE-7` **Double jump** amendment below (Alpha, planned).

> **Retroactive spec.** Unlike the other specs in this folder, this one documents
> behavior that's *already built and tested* (Phase 1), rather than planning
> something new. Its job is to freeze the current tuned values and rules as the
> baseline that later features — enemies, moving platforms, Level 2 pits — build
> on top of. If those values change, update this file first, same as any other spec.

---

## 1. Summary
The player (currently a placeholder red 16×16 rectangle) falls under gravity, stands
on a placeholder ground platform, walks left/right with the arrow keys, and jumps
with spacebar. This is the minimum physics loop the rest of the game is built on.

## 2. User story
As a **player**, I want **my character to fall naturally, walk left/right, and jump
onto solid ground**, so that **movement feels responsive and predictable before any
real art or levels exist.**

## 3. Scope

**In scope**
- Global gravity pulling the player down.
- A static ground body the player collides with (lands on top, doesn't fall through).
- Left/right arrow movement, instant start/stop (no acceleration or sliding).
- Spacebar jump, only usable while grounded.
- Keeping the player inside the visible world (can't walk/fall off-screen).

**Out of scope** (future specs/work)
- Variable jump height (hold-to-jump-higher, mentioned in `CLAUDE.md`, WBS
  `MOVE-4`, `[Beta]`) — current jump is a fixed impulse. Distinct from the
  Double jump amendment below.
- Acceleration/deceleration or friction curves — movement is instant on/off.
- Real sprite + animations (idle/run/jump/hurt) — still a plain rectangle.
- Enemy physics, stomp bounce, moving platforms, pits/death zones (Alpha level +).

### Amendment — Double jump (`MOVE-7`, `[Alpha]`, planned)

The original build (below) forbids any mid-air jump. Alpha **adds a double jump**
as a stand-in to test the future High Jump feel, which amends the rule frozen
here (and the acceptance criterion + edge case marked "amended" below).

**The full MOVE-7 requirements now live in `specs/double-jump.md`** — the rule
(exactly one mid-air jump, must land before jumping again, reusing the existing
`jump` animation) and the open ledge/coyote-time decision. This section is a
pointer to avoid duplicating the jump rules in two places; when double jump
ships, update the "amended" criterion/edge case below to match
`specs/double-jump.md`.

## 4. Acceptance criteria
All verified working as of this spec (tested 2026-07-11). Items marked 🧪 are
also covered by an automated unit test in `src/physics/player.test.js`; the
rest require a real Phaser/browser environment and stay manual playtest checks
(see `CLAUDE.md` → Architecture notes → Testing strategy for why).

- [x] Given the scene starts, when nothing is pressed, then the player falls due to
      gravity and comes to rest on top of the ground (doesn't clip through it).
- [x] 🧪 Given the player is grounded, when left/right arrow is held, then the player
      moves at a constant walking speed in that direction.
- [x] 🧪 Given no arrow is held, then horizontal velocity stops immediately.
- [x] 🧪 Given the player is grounded, when spacebar is pressed, then the player jumps
      upward and gravity brings it back down.
- [x] 🧪 Given the player is airborne, when spacebar is pressed, then **exactly
      one** mid-air (double) jump is allowed; a further mid-air press does
      nothing until the player lands. *(Amended by `MOVE-7` — built. Full spec
      and tests: `specs/double-jump.md` / `src/physics/player.test.js`.)*
- [x] Given the player reaches a world edge, then it stops at the edge instead of
      leaving the visible screen.
- [x] No errors appear in the browser console during any of the above.

## 5. UX / behaviour details
- World: 320×240 internal resolution, rendered at 2x zoom.
- Ground: a static rectangle, 320×32, centered at (160, 224) — flush with the bottom
  of the screen. Color `#8b5a2b` (placeholder brown).
- Player: a dynamic rectangle, 16×16, spawns at (160, 180) and immediately falls
  onto the ground. Color `#cc3333` (placeholder red, stands in for Buldog).
- Controls: **arrow left/right** = walk, **spacebar** = jump. (Up-arrow is
  intentionally *not* wired to jump, to leave room for a future "look up" or
  camera action if needed.)

## 6. Data & persistence
None. All values below live as constants/config in `src/main.js` — nothing is
persisted or loaded at runtime.

**Current tuned values:**

| Value | Where | Amount |
|---|---|---|
| Gravity | `config.physics.arcade.gravity.y` | `600` px/s² |
| Walk speed | `walkSpeed` in `update()` | `100` px/s |
| Jump velocity | `setVelocityY(...)` in `update()` | `-300` px/s (upward) |
| Player size | player rectangle | 16×16 px |
| Ground size | ground rectangle | 320×32 px |

## 7. Edge cases & error handling
- **Holding spacebar:** uses `JustDown`, so it fires once per physical press, not
  once per frame — no auto-bunny-hop from holding the key down.
- **Jumping while airborne:** allows exactly one mid-air (double) jump via an
  `airJumpsUsed` counter (reset on landing) — see `MOVE-7` /
  `specs/double-jump.md`. Walking off a ledge counts as that one air jump (no
  coyote time — a deliberate decision, flagged in `double-jump.md` §7).
- **Running off the sides:** `setCollideWorldBounds(true)` stops the player at the
  screen edge. Note this means there's currently no way to *fall into a pit* — that
  behavior is deliberately deferred to Level 2 ("Sewer Scramble"), which will need
  its own spec for pits/death zones since it changes what world bounds should do.

## 8. Dependencies
- None yet — this is the foundation. Future specs that will build on these values:
  - **Enemies** (Phase 3): stomp detection will likely compare player Y-velocity
    and position against the enemy, using this same physics body.
  - **Level 2 pits**: will need to change or override world-bounds behavior on the
    Y axis (falling off should cost a life, not stop at the edge).
  - **Sprite swap** (Phase 2): replaces the rectangle's visual but should keep the
    same physics body size (16×16) and behavior described here.

## 9. Definition of done
This feature is already done: all Section 4 acceptance criteria pass — the 🧪
items via `npm run test` (see `src/physics/player.test.js`), the rest via
manual playtest in the browser — no console errors, and committed. This spec
exists so later features have a documented baseline to build on rather than
re-deriving it from `src/main.js`. It's also the worked example referenced by
the `story-unit-tests` skill (`.claude/skills/story-unit-tests/SKILL.md`).
