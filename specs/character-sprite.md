# Feature Spec: Bulldog Sprite + Animations (Idle / Run / Jump)

> **Scope:** `[Alpha]`. WBS: `CHAR-2`. Related: `CHAR-3` (hurt animation frame —
> explicitly **out of scope** here, see §3), `CHAR-4` (color select — the sprite
> this spec adds is what gets tinted), `MOVE-7` (double jump — jump animation
> plays for either jump), `specs/player-physics.md` (physics body this sprite
> replaces the visual for).

> Source: ClickUp task `CHAR-2 — Bulldog sprite + animations`
> (https://app.clickup.com/t/869e4tfwc), status "spec ready" as of 2026-07-15.
> This file mirrors that ticket's acceptance criteria so the spec and the
> tracked story stay in sync; update both if either changes.

---

## 1. Summary
Replace the placeholder rectangle with a real animated 8-bit French bulldog
sprite. Alpha needs exactly three animations — **idle, run, jump** — driven by
the player's current movement/grounded state, plus left/right facing.

## 2. User story
As a **player**, I want to see an animated bulldog instead of a rectangle, so
that the game looks and feels real.

## 3. Scope

**In scope**
- Loading a real sprite sheet and replacing the placeholder rectangle
  (`CHAR-1`) with an animated `Phaser.Physics.Arcade.Sprite`.
- Three animations: **idle**, **run**, **jump**.
- Automatic transitions between them based on existing movement state
  (grounded/airborne, moving/still) — no new input, reuses
  `src/physics/player.js`.
- Left/right sprite flipping so the bulldog faces its direction of travel.
- Keeping the existing color-tint mechanism (`CHAR-4`,
  `src/state/color-select.js`) working on the new sprite (tint replaces the
  rectangle's `fillColor`).

**Out of scope** (per the ClickUp ticket's "Out of Scope (Alpha)" list)
- **Hurt/damage reaction frame** — that's `CHAR-3`, a separate story (Alpha
  needs it before the 3-hearts damage rule ships, but not as part of this one).
- Crawl, Fart Attack, Sleep/snore-loop, Rush/Dash animations — all `[Beta]`
  (`CHAR-6`/`CHAR-7`/`CHAR-8`, `MOVE-6`, `ABILITY-1`/`ABILITY-2`).
- Death animation, special emotes/interactions.
- Any change to the physics/movement rules themselves — this spec is visuals
  only, layered on top of the frozen behavior in `specs/player-physics.md`.

## 4. Acceptance criteria
Numbered to match the ClickUp ticket 1:1.

- [ ] **AC1 — Bulldog sprite displayed.** Given the game is loaded, when the
      player enters the game world, then the main character is displayed as an
      8-bit French bulldog sprite, and the rectangle placeholder is no longer
      visible.
- [ ] **AC2 — Idle animation.** Given the bulldog is standing on the ground,
      when no movement or jump input is provided, then the idle animation
      plays continuously and loops seamlessly.
- [ ] **AC3 — Run animation.** Given the bulldog is on the ground, when the
      player holds left or right, then the run animation plays and continues
      while moving.
- [ ] **AC4 — Run → idle transition.** Given the bulldog is running, when the
      player releases all movement keys, then the run animation stops and the
      idle animation starts within 0.2 seconds. *(Implementation note: since
      the animation is re-derived from state every frame at 60fps and
      `anims.play` is idempotent, this transition is effectively immediate —
      well under the 0.2s budget.)*
- [ ] **AC5 — Jump animation.** Given the bulldog is on the ground, when the
      player presses jump, then the jump animation triggers and stays active
      while airborne (covers both the first jump and the `MOVE-7` double
      jump — both are just "airborne", no separate animation).
- [ ] **AC6 — Landing transition.** Given the bulldog is airborne, when it
      lands, then the jump animation ends and idle or run starts depending on
      whether movement input is currently held.
- [ ] **AC7 — Character direction.** Given the bulldog is moving horizontally,
      when the player changes direction, then the sprite faces the new
      direction (flip) and the current animation keeps playing (no restart/pop).
- [ ] **AC8 — Animation performance.** Given normal play, then no visible
      glitches, flickering, or frame skips occur, and controls stay responsive.

## 5. UX / behaviour details

### Source art
- File: `frenchbulldogasset-grid.png` (provided by the user), a contact sheet
  with labeled rows (JUMP, IDLE1, IDLE2, SIT, WALK, RUN, SNIFF, SNIFF&WALK),
  each frame in a 64×64 cell.
- **Alpha uses only three rows**: `IDLE1` (5 frames), `RUN` (8 frames), `JUMP`
  (11 frames). `IDLE2`, `SIT`, `WALK`, `SNIFF`, `SNIFF&WALK` are not used —
  per the user's instruction, they're not relevant to Alpha.
- Processed into `src/assets/buldog.png`: a clean 528×144 spritesheet, 3 rows ×
  11 columns of 48×48 cells (downsized from the source 64×64 cells; unused
  trailing cells in the idle/run rows are transparent padding so the grid stays
  uniform for Phaser's spritesheet loader), background flattened to
  transparent. **Every frame is shifted by one uniform offset** so the dog is
  **centred horizontally** and its **feet sit on the frame's bottom edge** —
  one shift for all frames, so the animation's relative motion is preserved.
  That framing is what lets a centred physics body line up whether or not the
  sprite is flipped (see §5 Rendering). Frame index layout (row-major, as
  Phaser reads it with `frameWidth: 48, frameHeight: 48`):
  - **idle**: frames 0–4
  - **run**: frames 11–18
  - **jump**: frames 22–32
- The source art faces **right** by default — `flipX` is used to face left,
  not the other way around.

### Animation → state mapping
Pure, unit-tested logic (no Phaser needed) decides which animation and facing
apply each frame, given the same inputs `src/physics/player.js` already reads:

| State | Animation | Loops? |
|---|---|---|
| Grounded, no horizontal input | `idle` | yes |
| Grounded, moving left/right | `run` | yes |
| Airborne (jump or double jump) | `jump` | yes, for the duration airborne |

Facing: tracks the last non-zero horizontal velocity; holds its last value
while velocity is 0 (so the bulldog doesn't snap to a default facing every
time it stops or jumps straight up).

### Rendering
- Sprite is drawn at its **native 48×48 size** (no `setScale`). **The art is
  exported at the size we want on screen** — combining `setScale` with a custom
  body size was tried first and rejected, because Arcade Physics's body-offset
  math assumes scale 1 and the two together misaligned the hitbox badly. To
  resize the hero, re-export the sheet at the new cell size rather than
  scaling at runtime.
  - *(Sized up from 32×32 to 48×48 on 2026-07-16 — at 32×32 the dog read too
    small next to the Small Bones.)*
- **Physics body: 24×24** — the 16×16 baseline (`specs/player-physics.md`)
  scaled by the same 1.5×, so the visual/hitbox relationship is unchanged, as
  is jump/gravity feel. Set explicitly:
  `body.setSize(24, 24, false)` + `body.setOffset(12, 24)`.
  - `offset.x = 12` centres the body in the 48-wide frame. This matters
    because **`flipX` mirrors the art but not the body** — with the art
    centred in the frame (see §5 Source art) and the body centred on the same
    axis, the hitbox stays on the dog in both facing directions. An
    off-centre body would sit completely off the dog when facing left.
  - `offset.y = 24` puts the body's **bottom on the dog's feet** (the art is
    exported feet-on-the-frame's-bottom-edge), so he stands *on* the ground
    instead of sinking into or floating above it.
- Color tint (`CHAR-4`) is applied via `sprite.setTint(...)`, replacing the
  rectangle's `setFillStyle(...)` call — same hex values, no changes to
  `src/state/color-select.js`.

## 6. Data & persistence
None. Frame indices/animation keys are constants in code; no save data.

## 7. Edge cases & error handling
- **Changing direction while airborne** (e.g. jump forward, hold the opposite
  arrow mid-air): facing updates immediately per §5, jump animation keeps
  playing — direction and animation are independent state.
- **Tapping a direction and releasing within one frame:** since animation is
  re-derived from live state every `update()`, a single-frame tap still
  produces a single-frame run pose, not a stuck animation — consistent with
  "instant on/off" movement (no acceleration) already established in
  `player-physics.md`.
- **Very short hops** (landing before the jump animation completes a full
  loop): animation switches to idle/run immediately on landing
  (`body.blocked.down`), same as any other state re-evaluation — no minimum
  play-through time.
- **Double jump mid-air:** no separate animation — still just `jump` for the
  whole airborne duration, so triggering the second jump doesn't cause a
  visible restart/glitch (satisfies AC8).
- **Stray floating dots in jump frames (fixed):** two independent causes, both
  surfaced during manual playtest:
  1. A small dark hip/tail marking in the source art is fully attached at
     native resolution, but its connecting pixels are thin enough that
     downsampling to 32×32 visually detaches it.
  2. Lanczos resampling itself introduces faint ringing artifacts right at
     the frame's edge (most visible in jump frames 7–8), independent of any
     source-art content.
  Fixed generally rather than per-frame: after the 64→32 resize, alpha is
  hard-snapped (no soft/antialiased edges — matches the crisp pixel-art look
  anyway) and any remaining small connected component that's disconnected
  from the main silhouette (a handful of px, vs. 100+ for the real body) is
  stripped. This cleans up both causes across all frames without needing to
  hand-pick a mask region per frame.
- **Hitbox-to-art alignment (improved at the 48×48 re-export):** the source
  art isn't registered to a consistent pivot — the dog sits at a different
  spot within each source cell depending on pose, and originally sat in the
  *left* half of the frame. A centred body therefore lined up poorly, and
  would have sat completely **off** the dog once `flipX` mirrored the art.
  Fixed at export: one uniform shift centres the dog horizontally and drops
  its feet to the frame's bottom edge, so the centred 24×24 body lines up in
  both facing directions and rests exactly on the ground. Per-frame pose
  differences still mean it isn't pixel-perfect on every frame — that's fine
  (no AC requires pixel-exact collision, and per `CLAUDE.md`'s testing
  strategy hitbox feel is a playtest question). Revisit only if playtesting
  says it feels wrong.

## 8. Dependencies
- **Depends on `CHAR-1`** (placeholder rectangle + physics body being
  replaced) and `specs/player-physics.md` (the movement/grounded state this
  reads).
- **Depends on `CHAR-4`** (`src/state/color-select.js`) staying compatible —
  tint must keep working on the new sprite.
- **Feeds `CHAR-3`** (hurt frame) and the `[Beta]` personality animations
  (`CHAR-6/7/8`) — they'll extend the same spritesheet/animation-key pattern
  established here.
- **Feeds `MOVE-7`** (double jump) — the jump animation must already cover a
  second mid-air jump without a visual glitch (see edge cases above).

## 9. Definition of done
All Section 4 acceptance criteria pass (manual playtest in the browser, no
console errors); the animation/facing selection logic is unit-tested
(`src/physics/animation.test.js`); CI green (`lint` + `test` + `build`); the
rectangle placeholder is fully removed from the running game.
