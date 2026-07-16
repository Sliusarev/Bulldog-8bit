// Pure score rules for the bone-count score, pulled out of the Phaser Scene so
// they can be unit tested without a browser or canvas. See
// specs/small-bones.md for the acceptance criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file lives
// separately from main.js.
//
// In Alpha the score is simply "how many Small Bones have I collected" — the
// Scene holds the current number and calls these functions to advance, reset,
// and display it. Keeping the rules here means the future HUD (UI-3) and
// results window (UI-5) can share the exact same logic.

// What the score is before the player has collected anything.
export const INITIAL_SCORE = 0;

// What one Small Bone is worth. Named rather than a bare `1` so the Large Bone
// (SCORE-2, [Beta], worth double) has an obvious thing to build on later.
export const POINTS_PER_SMALL_BONE = 1;

// Collecting one Small Bone. Returns the new score rather than mutating, so the
// rule stays pure and trivially testable.
export function addBone(score) {
  return score + POINTS_PER_SMALL_BONE;
}

// Back to the starting score. Used by the temporary "refresh bones" dev key so
// each test run starts clean, and by any future level restart.
export function resetScore() {
  return INITIAL_SCORE;
}

// How the score reads on screen. Lives here (not inline in the Scene) so the
// text rule is unit-tested too, and so the real HUD (UI-3) can reuse or replace
// this one function instead of re-deriving the format.
export function formatScore(score) {
  return `BONES: ${score}`;
}
