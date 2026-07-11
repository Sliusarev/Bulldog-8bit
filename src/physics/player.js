// Pure movement/jump rules for the player, pulled out of the Phaser Scene so
// they can be unit tested without a browser or canvas. See
// specs/player-physics.md for the acceptance criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file
// exists separately from main.js.

// Tuned values — the single source of truth for these numbers. Change them
// here, not in main.js.
export const WALK_SPEED = 100; // px/s
export const JUMP_VELOCITY = -300; // px/s, negative = upward

// Given which arrow keys are held, returns the horizontal velocity to apply.
// Left and right cancel out to a stop, matching "instant stop, no sliding".
export function getWalkVelocityX({ leftDown, rightDown }, speed = WALK_SPEED) {
  if (leftDown && !rightDown) return -speed;
  if (rightDown && !leftDown) return speed;
  return 0;
}

// A jump happens only when the jump key was just pressed AND the player is
// currently resting on solid ground — this is what blocks mid-air/double
// jumps.
export function canJump({ jumpPressed, isGrounded }) {
  return jumpPressed && isGrounded;
}
