// Pure animation/facing rules for the bulldog sprite, pulled out of the
// Phaser Scene so they can be unit tested without a browser or canvas. See
// specs/character-sprite.md for the acceptance criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file
// exists separately from main.js.

// Frame ranges into src/assets/buldog.png (a 3-row x 11-col, 64x64-cell
// sheet). Loaded with Phaser's `generateFrameNumbers`, which wants inclusive
// start/end frame indices.
export const ANIMATIONS = {
  idle: { key: "idle", start: 0, end: 4, frameRate: 6 },
  run: { key: "run", start: 11, end: 18, frameRate: 12 },
  jump: { key: "jump", start: 22, end: 32, frameRate: 14 },
};

// The source art faces right by default (see specs/character-sprite.md §5),
// so "right" needs no flip.
export const DEFAULT_FACING = "right";

// Which animation should be playing right now, given the same grounded/
// movement state src/physics/player.js already computes. Airborne always
// wins (covers both the first jump and the MOVE-7 double jump — there's only
// one jump animation, see spec edge cases).
export function getAnimationKey({ isGrounded, velocityX }) {
  if (!isGrounded) return "jump";
  if (velocityX !== 0) return "run";
  return "idle";
}

// Which way the sprite should face. Holds the last non-zero direction while
// velocity is 0, so stopping or jumping straight up doesn't snap the bulldog
// back to a default facing.
export function nextFacing(currentFacing, velocityX) {
  if (velocityX > 0) return "right";
  if (velocityX < 0) return "left";
  return currentFacing;
}
