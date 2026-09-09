// Unit tests for the pure score rules. These map directly to the acceptance
// criteria in specs/points-score.md — each `it` below is one checkbox from
// Section 4 of that spec (the ones marked 🧪 in its test plan).
import { describe, expect, it } from "vitest";
import {
  INITIAL_SCORE,
  POINTS_SMALL_BONE,
  POINTS_ENEMY_STOMP,
  addPoints,
  resetScore,
  formatScore,
} from "./score.js";

describe("INITIAL_SCORE", () => {
  // AC1 — a run starts at zero.
  it("starts at 0 before anything has been scored", () => {
    expect(INITIAL_SCORE).toBe(0);
  });
});

describe("point values", () => {
  // AC2 — a Small Bone is worth exactly 100.
  it("a Small Bone is worth 100", () => {
    expect(POINTS_SMALL_BONE).toBe(100);
  });

  // AC3 — a stomped enemy is worth exactly 200.
  it("a stomped enemy is worth 200", () => {
    expect(POINTS_ENEMY_STOMP).toBe(200);
  });

  // The 2:1 ratio is the design, not a coincidence: risk should pay better
  // than collecting. This test is what would catch a retune that breaks it.
  it("an enemy is worth exactly two bones", () => {
    expect(POINTS_ENEMY_STOMP).toBe(POINTS_SMALL_BONE * 2);
  });
});

describe("addPoints", () => {
  // AC2 — collecting the first bone.
  it("collecting one bone scores 100", () => {
    expect(addPoints(INITIAL_SCORE, POINTS_SMALL_BONE)).toBe(100);
  });

  // AC3 — the first stomp.
  it("stomping one enemy scores 200", () => {
    expect(addPoints(INITIAL_SCORE, POINTS_ENEMY_STOMP)).toBe(200);
  });

  // AC4 — the two sources add into ONE number, which is the whole point of
  // SCORE-8: both bones plus the enemy is 400, not "2 bones and 1 kill".
  it("bones and stomps add into a single total", () => {
    let score = INITIAL_SCORE;
    score = addPoints(score, POINTS_SMALL_BONE);
    score = addPoints(score, POINTS_SMALL_BONE);
    score = addPoints(score, POINTS_ENEMY_STOMP);
    expect(score).toBe(400);
  });

  it("adds from any starting total", () => {
    expect(addPoints(500, POINTS_SMALL_BONE)).toBe(600);
    expect(addPoints(1000, POINTS_ENEMY_STOMP)).toBe(1200);
  });

  it("does not mutate the score it was given (stays a pure rule)", () => {
    const score = 300;
    addPoints(score, POINTS_SMALL_BONE);
    expect(score).toBe(300);
  });
});

describe("resetScore", () => {
  // AC5 — a level restart (and the R dev key) puts the score back to zero.
  it("goes back to the starting score", () => {
    expect(resetScore()).toBe(INITIAL_SCORE);
  });
});

describe("formatScore", () => {
  // AC1 / AC8 — one score on screen, no bone count and no timer.
  it("reads SCORE: 0 at the start of a run", () => {
    expect(formatScore(INITIAL_SCORE)).toBe("SCORE: 0");
  });

  it("shows the points total, not a count of anything", () => {
    expect(formatScore(400)).toBe("SCORE: 400");
  });

  // AC8 — the old bone-count label must be gone.
  it("never says BONES", () => {
    expect(formatScore(100)).not.toContain("BONES");
  });
});
