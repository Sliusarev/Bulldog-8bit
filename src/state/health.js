// Pure health rules for the 3-heart HP system, pulled out of the Phaser Scene
// so they can be unit tested without a browser or canvas. See
// specs/health-hearts.md for the acceptance criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file lives
// separately from main.js.
//
// This file is a sibling of state/score.js on purpose: hearts are a *run
// resource* like the score (something the player spends a run gaining or
// losing), not a movement/collision rule — those live in src/physics/.
//
// The confirmed damage rule (STATE-1 / ENEMY-3): an enemy hit costs exactly
// one heart and restarts the level from the beginning; the reduced count
// carries over and never refills. At 0 hearts the run is over. There are
// deliberately no invulnerability frames (CHAR-5) — the restart already takes
// the player out of danger.

// How many hearts a run starts with, and the most it can ever have. Alpha has
// no healing at all, so this is only ever the starting value; SCORE-2's Large
// Bone (+1 HP, [Beta]) will need it as the cap.
export const MAX_HEARTS = 3;

// What one enemy hit costs. Named rather than a bare `1` so the Avocado
// (SCORE-4, [Beta], -0.5 heart) has an obvious thing to build on, the same way
// POINTS_PER_SMALL_BONE anticipates the Large Bone.
export const HEART_COST_PER_HIT = 1;

// How long the player is out of play after a hit, before the level restarts
// (or GAME OVER appears). Long enough to see the flash and the heart going
// out; short enough not to drag between attempts.
export const HIT_PAUSE_MS = 500;

// The two heart images (specs/health-hearts.md §5). Kept next to the rule that
// picks between them so the Scene never hardcodes a texture string.
export const HEART_TEXTURE = { full: "heart-full", empty: "heart-empty" };

// One enemy hit. Returns the new count rather than mutating, so the rule stays
// pure and trivially testable. Clamped at 0 so the count can never go negative
// even if this were somehow called on an already-empty run.
export function loseHeart(hearts) {
  return Math.max(0, hearts - HEART_COST_PER_HIT);
}

// Is the run finished? This is the SINGLE place the Game Over branch is
// decided, which is what guarantees "restart the level" and "show GAME OVER"
// can never both happen for one hit.
export function isRunOver(hearts) {
  return hearts <= 0;
}

// Back to a full set of hearts — a brand-new run. Used on the very first load
// and by ENTER on the GAME OVER screen. (Mirrors resetScore.)
export function resetHearts() {
  return MAX_HEARTS;
}

// Which texture each HUD heart shows, left to right:
//   3 -> [full,  full,  full ]
//   1 -> [full,  empty, empty]
//   0 -> [empty, empty, empty]
// Returns texture keys rather than booleans, so the Scene's whole job is one
// setTexture per icon — the display rule itself stays unit-tested, the same
// way formatScore keeps the score's on-screen format out of the Scene.
export function getHeartTextures(hearts, max = MAX_HEARTS) {
  return Array.from({ length: max }, (_, index) =>
    index < hearts ? HEART_TEXTURE.full : HEART_TEXTURE.empty,
  );
}
