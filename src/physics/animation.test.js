// Unit tests for the pure animation/facing rules. These map directly to the
// acceptance criteria in specs/character-sprite.md — each `it` below is one
// checkbox from Section 4 of that spec.
import { describe, expect, it } from "vitest";
import {
  ANIMATIONS,
  DEFAULT_FACING,
  getAnimationKey,
  getHurtTint,
  nextFacing,
  HURT_TINT,
  HURT_FLASH_INTERVAL_MS,
} from "./animation.js";

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

// The hurt frame + damage blink (CHAR-3). These map to Section 4 of
// specs/hurt-frame.md.
describe("hurt frame (specs/hurt-frame.md)", () => {
  it("AC2/AC3: hurt wins over every other state, grounded or airborne", () => {
    expect(getAnimationKey({ isGrounded: true, velocityX: 0, isHurt: true })).toBe("hurt");
    expect(getAnimationKey({ isGrounded: true, velocityX: 100, isHurt: true })).toBe("hurt");
    expect(getAnimationKey({ isGrounded: false, velocityX: -100, isHurt: true })).toBe("hurt");
  });

  it("AC7: the existing three states are unchanged when not hurt (or omitted)", () => {
    expect(getAnimationKey({ isGrounded: true, velocityX: 0, isHurt: false })).toBe("idle");
    expect(getAnimationKey({ isGrounded: true, velocityX: 100, isHurt: false })).toBe("run");
    expect(getAnimationKey({ isGrounded: false, velocityX: 0, isHurt: false })).toBe("jump");
    // Omitting isHurt entirely must behave exactly like isHurt: false, since
    // that is how the Scene's update() calls it.
    expect(getAnimationKey({ isGrounded: true, velocityX: 0 })).toBe("idle");
  });

  it("AC1: hurt is frame 33 and the idle/run/jump ranges did not shift", () => {
    expect(ANIMATIONS.hurt).toMatchObject({ start: 33, end: 33 });
    expect(ANIMATIONS.idle).toMatchObject({ start: 0, end: 4 });
    expect(ANIMATIONS.run).toMatchObject({ start: 11, end: 18 });
    expect(ANIMATIONS.jump).toMatchObject({ start: 22, end: 32 });
  });

  it("AC4: the tint alternates red / hero color / red across the beat", () => {
    const base = 0x555555; // the black bulldog's tint
    expect(getHurtTint(0, base)).toBe(HURT_TINT);
    expect(getHurtTint(HURT_FLASH_INTERVAL_MS, base)).toBe(base);
    expect(getHurtTint(HURT_FLASH_INTERVAL_MS * 2, base)).toBe(HURT_TINT);
    // Mid-interval, not just on the boundaries.
    expect(getHurtTint(HURT_FLASH_INTERVAL_MS * 1.5, base)).toBe(base);
  });

  it("AC6: still blinks on the red bulldog, whose tint is close to the damage red", () => {
    const red = 0xc46a2f; // colorToTint("red")
    expect(getHurtTint(0, red)).toBe(HURT_TINT);
    expect(getHurtTint(HURT_FLASH_INTERVAL_MS, red)).toBe(red);
  });
});
