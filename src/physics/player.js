// Pure movement/jump rules for the player, pulled out of the Phaser Scene so
// they can be unit tested without a browser or canvas. See
// specs/player-physics.md for the acceptance criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file
// exists separately from main.js.

// Tuned values — the single source of truth for these numbers. Change them
// here, not in main.js.
export const WALK_SPEED = 100; // px/s
export const JUMP_VELOCITY = -300; // px/s, negative = upward

// How many *mid-air* jumps are allowed before the player must land again.
// 1 = a single double jump (the MOVE-7 Alpha stand-in for the future High
// Jump — see specs/double-jump.md). Bump this if a triple jump is ever wanted.
export const MAX_AIR_JUMPS = 1;

// Given which arrow keys are held, returns the horizontal velocity to apply.
// Left and right cancel out to a stop, matching "instant stop, no sliding".
export function getWalkVelocityX({ leftDown, rightDown }, speed = WALK_SPEED) {
  if (leftDown && !rightDown) return -speed;
  if (rightDown && !leftDown) return speed;
  return 0;
}

// A jump happens when the jump key was just pressed AND the player is either
// grounded OR still has a mid-air jump available. `airJumpsUsed` is how many
// mid-air jumps have been spent since the last landing (see nextAirJumpsUsed).
// Defaults to 0 so a plain grounded jump works without passing the counter.
export function canJump({ jumpPressed, isGrounded, airJumpsUsed = 0 }) {
  if (!jumpPressed) return false;
  return isGrounded || airJumpsUsed < MAX_AIR_JUMPS;
}

// Tracks how many mid-air jumps have been used since the last landing, so the
// double jump can't repeat until the player touches ground again. Call it every
// frame with the current count:
//   - grounded            -> 0   (landed / resting: the air jump is available again)
//   - airborne + jumped   -> +1  (a mid-air jump was just spent)
//   - airborne, no jump   -> unchanged
// A grounded jump keeps the count at 0 (it isn't a mid-air jump), so the player
// still gets their one air jump on the way up.
export function nextAirJumpsUsed(airJumpsUsed, { isGrounded, didJump }) {
  if (isGrounded) return 0;
  if (didJump) return airJumpsUsed + 1;
  return airJumpsUsed;
}
