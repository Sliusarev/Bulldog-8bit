// Unit tests for the pure player physics rules. These map directly to the
// acceptance criteria in specs/player-physics.md — each `it` below is one
// checkbox from Section 4 of that spec.
import { describe, expect, it } from "vitest";
import { WALK_SPEED, JUMP_VELOCITY, getWalkVelocityX, canJump } from "./player.js";

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

  it("blocks a jump while airborne, even if the key was just pressed", () => {
    expect(canJump({ jumpPressed: true, isGrounded: false })).toBe(false);
  });

  it("does nothing when grounded but the key wasn't pressed", () => {
    expect(canJump({ jumpPressed: false, isGrounded: true })).toBe(false);
  });
});

describe("tuned values", () => {
  it("jump velocity is upward (negative)", () => {
    expect(JUMP_VELOCITY).toBeLessThan(0);
  });
});
