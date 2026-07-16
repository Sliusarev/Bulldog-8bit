# Feature Spec: Double Jump (`MOVE-7`)

> **Scope:** `[Alpha]`. WBS: `MOVE-7`. **Amends** `specs/player-physics.md`
> (which currently forbids any mid-air jump — see its "Amendment — Double jump"
> section, now a pointer here). Related: `CHAR-2` /
> `specs/character-sprite.md` (the jump animation this reuses), `ABILITY-3` (the
> `[Beta]` Energy-costing High Jump this is a stand-in for), `MOVE-4` (variable
> jump height — a separate, still-unbuilt idea).

> **Status:** draft requirements for review (workflow step 1). One decision is
> still open — see the flagged item in §4 and §7.

---

## 1. Summary
Add a single mid-air jump: while airborne, pressing spacebar again performs one
more jump. It's the Alpha stand-in for testing the future High Jump feel
(reaching higher platforms) before the Energy-costing High Jump ability exists.

## 2. User story
As a **player**, I want to trigger exactly one extra jump while already airborne
(spacebar again), so that **I can reach higher platforms**.

## 3. Scope

**In scope**
- One extra mid-air jump, triggered by spacebar while airborne.
- After that second jump, the player must **land** before jumping again (no
  triple jump, no infinite hover from holding/tapping).
- Reuses the existing jump impulse (`JUMP_VELOCITY`) and the existing `jump`
  animation — no new input, no new art.

**Out of scope**
- Variable jump height / hold-to-jump-higher (`MOVE-4`, `[Beta]`).
- Energy-costing High Jump (`ABILITY-3`, `[Beta]`).
- Any triple jump, air-hover, or special double-jump animation/VFX — the second
  jump reuses the same `jump` animation as the first, no special-casing.

## 4. Acceptance criteria
- [x] Given the player is grounded, when spacebar is pressed, then the player
      jumps (unchanged from the current single jump). *(Verified: rest y=200 →
      apex y≈128.)*
- [x] Given the player is airborne after the first jump, when spacebar is
      pressed once, then the player performs exactly one more upward jump.
      *(Verified: 2nd jump re-applied ≈−300 velocity, apex y≈68 — ~2× a single
      jump's height.)*
- [x] Given the mid-air jump has already been used, when spacebar is pressed
      again while still airborne, then nothing happens (no third jump).
      *(Verified: `airJumpsUsed` stays 1, no new upward velocity.)*
- [x] Given the player lands (`body.blocked.down`), then the mid-air jump
      becomes available again. *(Verified: counter resets to 0 on landing;
      unit-tested.)*
- [x] Given spacebar is held down, then it does **not** auto-trigger jumps —
      one jump per physical press (`JustDown`), so a single hold can't burn
      both jumps and there's no bunny-hop. *(Unchanged `JustDown` gate; unit-tested.)*
- [x] The `jump` animation plays for the whole airborne duration, including
      after the second jump — no visual restart/glitch (already handled by
      `CHAR-2`).
- [x] No console errors during any of the above.

> **Open decision (ledge behaviour) — see §7.** How a ledge-walk-off should
> behave affects criterion 2/4 and needs Artem's call before build.

## 5. UX / behaviour details

### The jump-count rule
- **First jump:** unchanged — an immediate upward impulse, `jump` animation
  plays right away (as today).
- **Second jump:** allowed only while airborne and only once; after it, the
  player must land before any jump works again. Same impulse, same `jump`
  animation as the first — no special handling.

### Controls
- Unchanged: **spacebar** = jump (now also the mid-air jump). No new keys.

## 6. Data & persistence
None. This is runtime state (a jump counter) and tuning constants in code —
nothing saved or loaded.

## 7. Edge cases & error handling
- **Walking off a ledge without jumping first (OPEN DECISION):** with the
  simple counter below (`airJumpsUsed` only resets on landing), walking off a
  ledge leaves the player airborne with `airJumpsUsed = 0`, so the first
  spacebar press in the air spends the mid-air jump — i.e. a ledge-walk-off
  gives **one** jump, not two. The common alternative is **coyote time**: a
  brief grace window after leaving the ledge where a full ground jump still
  counts, preserving both jumps. Coyote time feels more forgiving but is more
  logic/tests. **Assumption: simple counter, no coyote time — flag if you want
  coyote time instead.**
- **Holding spacebar:** `JustDown` fires once per physical press, so a hold
  can't chain jumps or burn both at once.
- **Double jump doesn't restart/glitch the visual:** the `jump` animation
  already covers the whole airborne duration (`CHAR-2`, AC8), so triggering the
  second jump doesn't cause a visible restart.

## 8. Dependencies
- **Amends `specs/player-physics.md`** — flips its "no mid-air jump" rule and
  the acceptance criterion / edge case it marks as "amended". That file points
  here for the full spec.
- **Builds on `src/physics/player.js`** — the pure jump rule (`canJump`) is
  extended here; reuse it, don't fork it.
- **Reuses `CHAR-2` / `src/physics/animation.js`** — the existing `jump`
  animation already covers the whole airborne duration, so no animation changes
  are needed for the second jump.

## 9. Definition of done
All Section 4 acceptance criteria pass — the jump-count decision logic via unit
tests in `src/physics/player.js` (one test per rule: grounded jump, one air
jump, second air jump blocked, landing re-enables), the feel via manual
playtest — CI green (`lint` + `test` + `build`), no console errors, and
`specs/player-physics.md`'s amendment section updated to reference this spec.
Committed on a feature branch and merged via PR per the delivery flow in
`CLAUDE.md`.

---

## Implementation shape (suggested, not binding)
Keep the logic pure and tested (per `CLAUDE.md` → Testing strategy). Extend the
jump rule in `src/physics/player.js`: track an `airJumpsUsed` counter, reset to
0 on landing (`body.blocked.down`); allow a jump when grounded **or**
`airJumpsUsed < 1`; increment on each mid-air jump. The second jump reuses
`JUMP_VELOCITY` unless playtest says otherwise. No animation changes — the Scene
keeps playing `jump` while airborne, exactly as it does today.

## Assumptions this rests on (risk preview)
1. The second jump reuses the same `JUMP_VELOCITY` as the first (feel tuned by
   playtest).
2. Ledge-walk-off grants one mid-air jump (simple counter, **no** coyote time)
   — the open decision in §7.

≈ 2 assumptions → **Low risk**. Resolving the §7 ledge decision leaves it there.
