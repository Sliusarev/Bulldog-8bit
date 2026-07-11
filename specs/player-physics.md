# Feature Spec: Player Physics (Core Movement & Jump)

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
- Variable jump height (hold-to-jump-higher, mentioned in `CLAUDE.md`) — current
  jump is a fixed impulse.
- Acceleration/deceleration or friction curves — movement is instant on/off.
- Real sprite + animations (idle/run/jump/hurt) — still a plain rectangle.
- Enemy physics, stomp bounce, moving platforms, pits/death zones (Phase 3+).

## 4. Acceptance criteria
All verified working as of this spec (tested 2026-07-11):

- [x] Given the scene starts, when nothing is pressed, then the player falls due to
      gravity and comes to rest on top of the ground (doesn't clip through it).
- [x] Given the player is grounded, when left/right arrow is held, then the player
      moves at a constant walking speed in that direction.
- [x] Given no arrow is held, then horizontal velocity stops immediately.
- [x] Given the player is grounded, when spacebar is pressed, then the player jumps
      upward and gravity brings it back down.
- [x] Given the player is airborne (mid-jump or mid-fall), when spacebar is pressed,
      then nothing happens (no mid-air/double jump).
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
- **Jumping while airborne:** blocked via `body.blocked.down` check — prevents
  mid-air/double jumps.
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
This feature is already done: all Section 4 acceptance criteria pass, verified by
manual playtest in the browser, no console errors, and committed. This spec exists
so later features have a documented baseline to build on rather than re-deriving it
from `src/main.js`.
