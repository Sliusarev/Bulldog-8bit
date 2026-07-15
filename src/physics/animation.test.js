// Unit tests for the pure animation/facing rules. These map directly to the
// acceptance criteria in specs/character-sprite.md — each `it` below is one
// checkbox from Section 4 of that spec.
import { describe, expect, it } from "vitest";
import { DEFAULT_FACING, getAnimationKey, nextFacing } from "./animation.js";

describe("getAnimationKey", () => {
  it("AC2: idle when grounded with no horizontal movement", () => {
    expect(getAnimationKey({ isGrounded: true, velocityX: 0 })).toBe("idle");
  });

  it("AC3: run when grounded and moving right", () => {
    expect(getAnimationKey({ isGrounded: true, velocityX: 100 })).toBe("run");
  });

  it("AC3: run when grounded and moving left", () => {
    expect(getAnimationKey({ isGrounded: true, velocityX: -100 })).toBe("run");
  });

  it("AC4: switches back to idle the instant velocity drops to 0", () => {
    expect(getAnimationKey({ isGrounded: true, velocityX: 0 })).toBe("idle");
  });

  it("AC5: jump while airborne, regardless of horizontal input", () => {
    expect(getAnimationKey({ isGrounded: false, velocityX: 0 })).toBe("jump");
    expect(getAnimationKey({ isGrounded: false, velocityX: 100 })).toBe("jump");
  });

  it("AC6: lands into idle when no movement is held", () => {
    expect(getAnimationKey({ isGrounded: true, velocityX: 0 })).toBe("idle");
  });

  it("AC6: lands into run when movement is held", () => {
    expect(getAnimationKey({ isGrounded: true, velocityX: -100 })).toBe("run");
  });
});

describe("nextFacing", () => {
  it("default facing is right (matches the source art)", () => {
    expect(DEFAULT_FACING).toBe("right");
  });

  it("AC7: faces right when moving right", () => {
    expect(nextFacing("left", 100)).toBe("right");
  });

  it("AC7: faces left when moving left", () => {
    expect(nextFacing("right", -100)).toBe("left");
  });

  it("holds the previous facing when velocity is 0 (e.g. idle or a straight-up jump)", () => {
    expect(nextFacing("left", 0)).toBe("left");
    expect(nextFacing("right", 0)).toBe("right");
  });
});
