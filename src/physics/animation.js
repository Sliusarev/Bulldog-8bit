// Pure animation/facing rules for the bulldog sprite, pulled out of the
// Phaser Scene so they can be unit tested without a browser or canvas. See
// specs/character-sprite.md for the acceptance criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file
// exists separately from main.js.

// Frame ranges into src/assets/buldog.png (a 4-row x 11-col, 48x48-cell
// sheet). Loaded with Phaser's `generateFrameNumbers`, which wants inclusive
// start/end frame indices.
//
// `hurt` is a single frame on the fourth row (specs/hurt-frame.md). It sits
// AFTER the existing three rows on purpose: Phaser numbers frames row-major,
// so appending a row leaves every idle/run/jump index untouched.
export const ANIMATIONS = {
  idle: { key: "idle", start: 0, end: 4, frameRate: 6 },
  run: { key: "run", start: 11, end: 18, frameRate: 12 },
  jump: { key: "jump", start: 22, end: 32, frameRate: 14 },
  hurt: { key: "hurt", start: 33, end: 33, frameRate: 1 },
};

// The damage red the hero flashes while he's hurt.
export const HURT_TINT = 0xff0000;

// How long each half of the hurt blink lasts. ~83ms against the 500ms hit
// pause (HIT_PAUSE_MS) gives roughly three red pulses — enough to read as a
// blink rather than a single static tint. Tuned by playtest, see
// specs/hurt-frame.md section 10.
export const HURT_FLASH_INTERVAL_MS = 83;

// The source art faces right by default (see specs/character-sprite.md §5),
// so "right" needs no flip.
export const DEFAULT_FACING = "right";

// Which animation should be playing right now, given the same grounded/
// movement state src/physics/player.js already computes. Taking a hit wins
// over everything (the player is out of play for the whole hurt beat), then
// airborne (covers both the first jump and the MOVE-7 double jump — there's
// only one jump animation, see spec edge cases).
export function getAnimationKey({ isGrounded, velocityX, isHurt = false }) {
  if (isHurt) return "hurt";
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

// Which tint to paint the hero with during the hurt beat, `elapsedMs` after
// the hit. Alternates between the damage red and the hero's OWN selected
// color (CHAR-4) — passed in rather than imported, so this module keeps
// knowing nothing about game state. Blinking back to his own color is what
// makes the hit readable even on the red bulldog, where the red tint alone
// would barely show (specs/hurt-frame.md AC6).
export function getHurtTint(elapsedMs, baseTint) {
  const interval = Math.floor(elapsedMs / HURT_FLASH_INTERVAL_MS);
  return interval % 2 === 0 ? HURT_TINT : baseTint;
}
