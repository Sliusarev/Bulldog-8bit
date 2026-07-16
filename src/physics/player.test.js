// Unit tests for the pure player physics rules. These map directly to the
// acceptance criteria in specs/player-physics.md — each `it` below is one
// checkbox from Section 4 of that spec.
import { describe, expect, it } from "vitest";
import {
  WALK_SPEED,
  JUMP_VELOCITY,
  MAX_AIR_JUMPS,
  getWalkVelocityX,
  canJump,
  nextAirJumpsUsed,
} from "./player.js";

describe("getWalkVelocityX", () => {
  it("moves left when only left is held", () => {
    expect(getWalkVelocityX({ leftDown: true, rightDown: false })).toBe(-WALK_SPEED);
  });

  it("moves right when only right is held", () => {
    expect(getWalkVelocityX({ leftDown: false, rightDown: true })).toBe(WALK_SPEED);
  });

  it("stops immediately when neither key is held", () => {
    expect(getWalkVelocityX({ leftDown: false, rightDown: false })).toBe(0);
  });

  it("stops when both keys are held (no sliding, no undefined behavior)", () => {
    expect(getWalkVelocityX({ leftDown: true, rightDown: true })).toBe(0);
  });

  it("uses a custom speed when one is provided", () => {
    expect(getWalkVelocityX({ leftDown: true, rightDown: false }, 250)).toBe(-250);
  });
});

describe("canJump", () => {
  it("allows a jump when grounded and the key was just pressed", () => {
    expect(canJump({ jumpPressed: true, isGrounded: true })).toBe(true);
  });

  it("does nothing when grounded but the key wasn't pressed", () => {
    expect(canJump({ jumpPressed: false, isGrounded: true })).toBe(false);
  });

  // MOVE-7 (double jump) — see specs/double-jump.md. Amends the old "no mid-air
  // jump" rule from specs/player-physics.md.
  it("allows one mid-air jump when none has been used yet (AC2)", () => {
    expect(canJump({ jumpPressed: true, isGrounded: false, airJumpsUsed: 0 })).toBe(true);
  });

  it("blocks a second mid-air jump once the air jump is used up (AC3)", () => {
    expect(canJump({ jumpPressed: true, isGrounded: false, airJumpsUsed: MAX_AIR_JUMPS })).toBe(
      false,
    );
  });

  it("does nothing mid-air when the key wasn't pressed (no auto-jump / bunny-hop, AC5)", () => {
    expect(canJump({ jumpPressed: false, isGrounded: false, airJumpsUsed: 0 })).toBe(false);
  });
});

describe("nextAirJumpsUsed", () => {
  it("resets to 0 while grounded, so the air jump is available again (AC4)", () => {
    expect(nextAirJumpsUsed(1, { isGrounded: true, didJump: false })).toBe(0);
  });

  it("increments when a mid-air jump is spent", () => {
    expect(nextAirJumpsUsed(0, { isGrounded: false, didJump: true })).toBe(1);
  });

  it("stays unchanged while airborne with no jump this frame", () => {
    expect(nextAirJumpsUsed(1, { isGrounded: false, didJump: false })).toBe(1);
  });

  it("keeps the count at 0 for a grounded jump (a ground jump isn't an air jump)", () => {
    expect(nextAirJumpsUsed(0, { isGrounded: true, didJump: true })).toBe(0);
  });

  it("full sequence: ground jump -> air jump -> blocked -> land re-enables", () => {
    // Grounded jump this frame: counter stays 0.
    let used = nextAirJumpsUsed(0, { isGrounded: true, didJump: true });
    expect(used).toBe(0);
    // Airborne, spend the one mid-air jump.
    const airJump = canJump({ jumpPressed: true, isGrounded: false, airJumpsUsed: used });
    expect(airJump).toBe(true);
    used = nextAirJumpsUsed(used, { isGrounded: false, didJump: airJump });
    expect(used).toBe(1);
    // Still airborne, a further press is blocked.
    expect(canJump({ jumpPressed: true, isGrounded: false, airJumpsUsed: used })).toBe(false);
    // Land: counter resets and the air jump is available again.
    used = nextAirJumpsUsed(used, { isGrounded: true, didJump: false });
    expect(used).toBe(0);
    expect(canJump({ jumpPressed: true, isGrounded: false, airJumpsUsed: used })).toBe(true);
  });
});

describe("tuned values", () => {
  it("jump velocity is upward (negative)", () => {
    expect(JUMP_VELOCITY).toBeLessThan(0);
  });
});
