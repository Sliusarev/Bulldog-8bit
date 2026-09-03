// Pure patrol / stomp rules for the simple enemy, pulled out of the Phaser
// Scene so they can be unit tested without a browser or canvas. See
// specs/simple-enemy-stomp.md for the acceptance criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file lives
// separately from main.js.
//
// The Alpha enemy is deliberately simple: it walks back and forth forever and
// dies only to a stomp from above (ENEMY-1 trimmed + ENEMY-4). Everything the
// Scene needs to *decide* lives here; the Scene only applies the results.

import { WALK_SPEED, JUMP_VELOCITY } from "./player.js";

// --- Tuned values -----------------------------------------------------------
// Every number here is a FRACTION of the player's own tuning rather than a
// standalone value, so retuning the player's walk or jump retunes the enemy
// with it and the two can never silently drift apart.

// The enemy walks at 30% of the player's speed — slow enough that he can always
// out-run it or line up a jump.
export const PATROL_SPEED_FACTOR = 0.3;
export const PATROL_SPEED = WALK_SPEED * PATROL_SPEED_FACTOR; // 30 px/s

// How far each way from its spawn point the enemy walks before turning. The
// turn is decided from this range, NOT from bumping into a wall, so patrolling
// works on open ground where there's nothing to bump into.
export const PATROL_HALF_RANGE = 60; // px

// The little hop the PLAYER gets for a successful stomp — a fifth of a real
// jump, so it reads as a bounce and never as a free extra jump.
export const STOMP_BOUNCE_FACTOR = 0.2;

// The knock-away the ENEMY gets when it dies: it pops up slightly, then gravity
// takes it back down and (with its collider removed) straight through the floor
// and off the bottom of the screen — the classic Mario defeated-enemy arc.
export const DEATH_POP_FACTOR = 0.15;

// The three possible outcomes of the player touching the enemy. An enum rather
// than a boolean because "nothing happens" is a real, testable case (a dead
// enemy is inert while it's still visibly falling), and because HIT is the
// exact signal the hearts/level-restart story (ENEMY-3) will consume next.
export const CONTACT = {
  STOMP: "stomp",
  HIT: "hit",
  NONE: "none",
};

// Directions are +1 (right) / -1 (left), matching the sign of the velocity they
// produce — same idea as getWalkVelocityX in player.js.
export const INITIAL_DIRECTION = 1;

// --- Rules ------------------------------------------------------------------

// Which way the enemy should be walking this frame. It turns around when it
// either (a) bumps into something solid — a wall, a platform edge, the edge of
// the screen — or (b) reaches the end of its patrol range on open ground.
// Returns the new direction rather than mutating, so the rule stays pure.
//
// NOTE the field name: `patrolOriginX`, NOT `originX`. `originX` is a built-in
// Phaser Game Object property (the sprite's anchor point, 0-1), so storing the
// spawn x under that name silently gets clobbered — which is exactly the bug
// that made the first version walk into the left wall and stop.
export function nextPatrolDirection(
  { x, patrolOriginX, direction, blockedLeft = false, blockedRight = false },
  halfRange = PATROL_HALF_RANGE,
) {
  // Hitting something wins over the patrol range: whatever the range says, the
  // enemy physically can't keep going that way.
  if (direction > 0 && blockedRight) return -1;
  if (direction < 0 && blockedLeft) return 1;

  // Otherwise turn at the ends of the range. Checked against the direction of
  // travel so an enemy that starts (or is knocked) outside its range still
  // walks back in instead of flipping every frame.
  if (direction > 0 && x >= patrolOriginX + halfRange) return -1;
  if (direction < 0 && x <= patrolOriginX - halfRange) return 1;

  return direction;
}

// The horizontal velocity a direction implies (mirrors getWalkVelocityX's role
// for the player).
export function getPatrolVelocityX(direction, speed = PATROL_SPEED) {
  return direction * speed;
}

// Classifies a player/enemy touch into one of the CONTACT outcomes:
//   - the enemy is already dead                        -> NONE  (inert corpse)
//   - the player is falling AND his feet are above the
//     enemy's middle                                   -> STOMP
//   - anything else (side contact, or rising into it
//     from below)                                      -> HIT
// Using the enemy's MIDPOINT (not its top edge) keeps the stomp deliberately
// forgiving, classic-Mario style: a glancing landing on the edge of its head
// still counts as long as the player is on his way down.
export function classifyContact({ playerVelocityY, playerBottom, enemyMidY, isDead = false }) {
  if (isDead) return CONTACT.NONE;

  const isFalling = playerVelocityY > 0; // positive y = downward on screen
  const isAbove = playerBottom <= enemyMidY;

  if (isFalling && isAbove) return CONTACT.STOMP;
  return CONTACT.HIT;
}

// The upward velocity to give the PLAYER after a stomp. Derived from the jump
// so it can't drift out of tune with it.
export function getStompBounceVelocity(jumpVelocity = JUMP_VELOCITY) {
  return jumpVelocity * STOMP_BOUNCE_FACTOR;
}

// The upward velocity to give the ENEMY when it dies. Gravity does the rest.
export function getDeathPopVelocity(jumpVelocity = JUMP_VELOCITY) {
  return jumpVelocity * DEATH_POP_FACTOR;
}

// Has a knocked-away enemy fallen past the bottom of the screen? Once it has,
// the Scene destroys the sprite — the corpse has served its purpose and there's
// no reason to keep simulating it.
export function isOffScreenBelow(y, worldHeight) {
  return y > worldHeight;
}
