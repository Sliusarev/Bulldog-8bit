// Unit tests for the pure health rules. These map directly to the acceptance
// criteria in specs/health-hearts.md — each `it` below is one checkbox from
// Section 4 of that spec (the ones marked 🧪 in its test plan).
import { describe, expect, it } from "vitest";
import {
  MAX_HEARTS,
  HEART_COST_PER_HIT,
  HIT_PAUSE_MS,
  HEART_TEXTURE,
  loseHeart,
  isRunOver,
  resetHearts,
  getHeartTextures,
} from "./health.js";

describe("MAX_HEARTS", () => {
  // AC1 — a run starts with three hearts.
  it("a run has three hearts", () => {
    expect(MAX_HEARTS).toBe(3);
  });
});

describe("loseHeart", () => {
  // AC2 — a hit costs exactly one heart, never two.
  it("one hit costs exactly one heart", () => {
    expect(loseHeart(MAX_HEARTS)).toBe(2);
    expect(HEART_COST_PER_HIT).toBe(1);
  });

  it("three hits empty a full run", () => {
    expect(loseHeart(loseHeart(loseHeart(MAX_HEARTS)))).toBe(0);
  });

  // AC9 — nothing can drive the count below zero, however it is called.
  it("clamps at zero rather than going negative", () => {
    expect(loseHeart(0)).toBe(0);
  });
});

describe("isRunOver", () => {
  // AC6 — the last heart ends the run instead of restarting the level.
  it("the run is over at zero hearts", () => {
    expect(isRunOver(0)).toBe(true);
  });

  it("the run continues while at least one heart is left", () => {
    expect(isRunOver(1)).toBe(false);
    expect(isRunOver(2)).toBe(false);
    expect(isRunOver(MAX_HEARTS)).toBe(false);
  });

  // The Game Over branch and the level-restart branch are decided by this one
  // function, so they are mutually exclusive by construction.
  it("losing the last heart is what ends the run", () => {
    expect(isRunOver(loseHeart(1))).toBe(true);
    expect(isRunOver(loseHeart(2))).toBe(false);
  });
});

describe("resetHearts", () => {
  // AC7 — ENTER on the GAME OVER screen starts a fresh, full run.
  it("a new run starts with a full set of hearts", () => {
    expect(resetHearts()).toBe(MAX_HEARTS);
  });
});

describe("getHeartTextures", () => {
  // AC1 — three full hearts on screen at the start.
  it("shows three full hearts at the start of a run", () => {
    expect(getHeartTextures(MAX_HEARTS)).toEqual([
      HEART_TEXTURE.full,
      HEART_TEXTURE.full,
      HEART_TEXTURE.full,
    ]);
  });

  // AC3 — after a hit the lost heart reads as empty, and it is the last one:
  // hearts empty from the right, so the remaining full ones stay put.
  it("empties from the right as hearts are lost", () => {
    expect(getHeartTextures(2)).toEqual([
      HEART_TEXTURE.full,
      HEART_TEXTURE.full,
      HEART_TEXTURE.empty,
    ]);
    expect(getHeartTextures(1)).toEqual([
      HEART_TEXTURE.full,
      HEART_TEXTURE.empty,
      HEART_TEXTURE.empty,
    ]);
  });

  it("shows three empty hearts once the run is over", () => {
    expect(getHeartTextures(0)).toEqual([
      HEART_TEXTURE.empty,
      HEART_TEXTURE.empty,
      HEART_TEXTURE.empty,
    ]);
  });

  it("always returns one texture per heart the run can hold", () => {
    expect(getHeartTextures(MAX_HEARTS)).toHaveLength(MAX_HEARTS);
    expect(getHeartTextures(0)).toHaveLength(MAX_HEARTS);
  });
});

describe("HIT_PAUSE_MS", () => {
  // AC3 — there is a visible beat between the hit and the level restarting.
  it("leaves a short but visible pause before the restart", () => {
    expect(HIT_PAUSE_MS).toBe(500);
  });
});
