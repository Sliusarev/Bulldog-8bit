// Pure score rules, pulled out of the Phaser Scene so they can be unit tested
// without a browser or canvas. See specs/points-score.md (and
// specs/small-bones.md for how bones themselves work) for the acceptance
// criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file lives
// separately from main.js.
//
// Alpha has ONE arcade score, in points (SCORE-8) — never two competing
// metrics. Everything the player does well feeds this single number, which is
// what the results window (UI-5) reports and what a future scoreboard
// (BOARD-1) ranks runs by. The Scene holds the current total and calls these
// functions to advance, reset, and display it.
//
// (It started as a bare count of bones collected, alongside a separate level
// timer. Two numbers made the player's "result" ambiguous and a scoreboard
// unsortable, so the timer moved to [Beta] and the count became points.)

// What the score is before the player has collected anything.
export const INITIAL_SCORE = 0;

// What each scoring event is worth. Round arcade numbers, and the 2:1 ratio is
// the design: an enemy is worth two bones, so taking a risk beats hoovering up
// pickups. [Beta] sources (Large Bone +200, ability kills) get a constant here
// rather than a scoring rule of their own.
export const POINTS_SMALL_BONE = 100;
export const POINTS_ENEMY_STOMP = 200;

// One general rule rather than one function per event: the Scene says WHAT
// happened by passing the matching constant, and this stays the single place
// score arithmetic lives. Returns the new score rather than mutating, so the
// rule stays pure and trivially testable.
export function addPoints(score, points) {
  return score + points;
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
  // Deliberately unpadded — `SCORE: 0`, not `SCORE: 000000`. A padded arcade
  // counter is a typography choice, so it belongs with UI-3 and the pixel font.
  return `SCORE: ${score}`;
}
