// Unit tests for the pure score rules. These map directly to the acceptance
// criteria in specs/small-bones.md — each `it` below is one checkbox from
// Section 4 of that spec (the ones marked 🧪 in its test plan).
import { describe, expect, it } from "vitest";
import {
  INITIAL_SCORE,
  POINTS_PER_SMALL_BONE,
  addBone,
  resetScore,
  formatScore,
} from "./score.js";

describe("INITIAL_SCORE", () => {
  it("starts at 0 before any bone is collected", () => {
    expect(INITIAL_SCORE).toBe(0);
  });
});

describe("addBone", () => {
  it("collecting the first bone makes the score 1", () => {
    expect(addBone(INITIAL_SCORE)).toBe(1);
  });

  it("collecting both bones makes the score 2", () => {
    expect(addBone(addBone(INITIAL_SCORE))).toBe(2);
  });

  it("adds one point from any starting count", () => {
    expect(addBone(5)).toBe(6);
    expect(addBone(41)).toBe(42);
  });

  it("each Small Bone is worth exactly one point", () => {
    expect(POINTS_PER_SMALL_BONE).toBe(1);
    expect(addBone(0) - 0).toBe(POINTS_PER_SMALL_BONE);
  });

  it("does not mutate the score it was given (stays a pure rule)", () => {
    const score = 3;
    addBone(score);
    expect(score).toBe(3);
  });
});

describe("resetScore", () => {
  it("goes back to 0 (used by the refresh dev key)", () => {
    expect(resetScore()).toBe(INITIAL_SCORE);
    expect(resetScore()).toBe(0);
  });
});

describe("formatScore", () => {
  it("reads as BONES: <count> for the debug counter", () => {
    expect(formatScore(0)).toBe("BONES: 0");
    expect(formatScore(2)).toBe("BONES: 2");
  });
});
