// Unit tests for the pure enemy patrol/stomp rules. These map directly to the
// acceptance criteria in specs/simple-enemy-stomp.md — each `it` below is one
// checkbox from Section 4 of that spec.
import { describe, expect, it } from "vitest";
import { WALK_SPEED, JUMP_VELOCITY } from "./player.js";
import {
  PATROL_SPEED,
  PATROL_SPEED_FACTOR,
  PATROL_HALF_RANGE,
  CONTACT,
  nextPatrolDirection,
  getPatrolVelocityX,
  classifyContact,
  getStompBounceVelocity,
  getDeathPopVelocity,
  isOffScreenBelow,
} from "./enemy.js";

// The enemy's spawn x is arbitrary in these tests — using a non-zero one makes
// sure the range is measured relative to the spawn point, not to x = 0.
const ORIGIN_X = 200;

describe("PATROL_SPEED", () => {
  // Confirmed tuning: the enemy walks at 30% of the player's speed.
  it("is 30% of the player's walk speed", () => {
    expect(PATROL_SPEED).toBe(WALK_SPEED * PATROL_SPEED_FACTOR);
    expect(PATROL_SPEED_FACTOR).toBe(0.3);
  });

  it("is slower than the player, so he can always get away", () => {
    expect(PATROL_SPEED).toBeLessThan(WALK_SPEED);
  });
});

describe("nextPatrolDirection (AC2 — reverses at the ends of its range)", () => {
  it("keeps walking right while inside the range", () => {
    const x = ORIGIN_X + PATROL_HALF_RANGE - 1;
    expect(nextPatrolDirection({ x, patrolOriginX: ORIGIN_X, direction: 1 })).toBe(1);
  });

  it("turns left when it reaches the right end", () => {
    const x = ORIGIN_X + PATROL_HALF_RANGE;
    expect(nextPatrolDirection({ x, patrolOriginX: ORIGIN_X, direction: 1 })).toBe(-1);
  });

  it("turns right when it reaches the left end", () => {
    const x = ORIGIN_X - PATROL_HALF_RANGE;
    expect(nextPatrolDirection({ x, patrolOriginX: ORIGIN_X, direction: -1 })).toBe(1);
  });

  it("keeps walking left while inside the range", () => {
    const x = ORIGIN_X - PATROL_HALF_RANGE + 1;
    expect(nextPatrolDirection({ x, patrolOriginX: ORIGIN_X, direction: -1 })).toBe(-1);
  });

  it("does not turn again on the frame after turning (no stutter at the edge)", () => {
    // Just turned to -1 while still standing past the right edge: the rule must
    // leave it alone, or the enemy would flip every frame and go nowhere.
    const x = ORIGIN_X + PATROL_HALF_RANGE + 2;
    expect(nextPatrolDirection({ x, patrolOriginX: ORIGIN_X, direction: -1 })).toBe(-1);
  });

  it("patrols indefinitely — a full lap returns to the starting direction", () => {
    let direction = 1;
    direction = nextPatrolDirection({ x: ORIGIN_X + PATROL_HALF_RANGE, patrolOriginX: ORIGIN_X, direction });
    direction = nextPatrolDirection({ x: ORIGIN_X - PATROL_HALF_RANGE, patrolOriginX: ORIGIN_X, direction });
    expect(direction).toBe(1);
  });

  // Regression test for the bug that made the enemy not patrol at all: the
  // spawn x was stored as `originX`, which Phaser overwrites with its own
  // origin value (0.5). The rule then saw the enemy as permanently past its
  // right edge, sent it left, and never sent it back. This case fails loudly
  // if the spawn x is ever lost again.
  it("keeps walking left when it is far past its range and already heading back", () => {
    const x = ORIGIN_X + 300; // way outside the range, walking home
    expect(nextPatrolDirection({ x, patrolOriginX: ORIGIN_X, direction: -1 })).toBe(-1);
  });
});

describe("nextPatrolDirection (turning on obstacles)", () => {
  it("turns around when it walks into something on its right", () => {
    const at = { x: ORIGIN_X, patrolOriginX: ORIGIN_X, direction: 1, blockedRight: true };
    expect(nextPatrolDirection(at)).toBe(-1);
  });

  it("turns around when it walks into something on its left", () => {
    const at = { x: ORIGIN_X, patrolOriginX: ORIGIN_X, direction: -1, blockedLeft: true };
    expect(nextPatrolDirection(at)).toBe(1);
  });

  it("ignores a block behind it (touching a wall it is already walking away from)", () => {
    const at = { x: ORIGIN_X, patrolOriginX: ORIGIN_X, direction: 1, blockedLeft: true };
    expect(nextPatrolDirection(at)).toBe(1);
  });

  it("turns on an obstacle even in the middle of its range", () => {
    // An obstacle wins over the range: the enemy physically cannot continue.
    const at = { x: ORIGIN_X + 10, patrolOriginX: ORIGIN_X, direction: 1, blockedRight: true };
    expect(nextPatrolDirection(at)).toBe(-1);
  });

  it("does not treat the player as an obstacle (only solid blocks count)", () => {
    // The Scene passes Phaser's `blocked` flags, never `touching` — `touching`
    // is set by overlaps too, so the player brushing past would otherwise flip
    // the enemy every frame and leave it tapping in place. Nothing but a solid
    // block reaches this rule, so an untouched-by-anything-solid enemy walks on.
    const at = { x: ORIGIN_X, patrolOriginX: ORIGIN_X, direction: 1 };
    expect(nextPatrolDirection(at)).toBe(1);
  });

  it("does not flip twice when blocked on both sides (walled in)", () => {
    // Boxed in: it should pick one direction per frame, never oscillate within
    // a single call.
    const at = { x: ORIGIN_X, patrolOriginX: ORIGIN_X, direction: 1, blockedLeft: true, blockedRight: true };
    expect(nextPatrolDirection(at)).toBe(-1);
  });
});

describe("getPatrolVelocityX (AC3 — velocity matches the facing direction)", () => {
  it("walks right at patrol speed", () => {
    expect(getPatrolVelocityX(1)).toBe(PATROL_SPEED);
  });

  it("walks left at patrol speed", () => {
    expect(getPatrolVelocityX(-1)).toBe(-PATROL_SPEED);
  });
});

describe("classifyContact", () => {
  // The player is 24px tall (see main.js); these numbers just need to put his
  // feet clearly above or below the enemy's middle.
  const enemyMidY = 200;

  it("AC4 — landing on top from above is a stomp", () => {
    const contact = classifyContact({ playerVelocityY: 120, playerBottom: 190, enemyMidY });
    expect(contact).toBe(CONTACT.STOMP);
  });

  it("AC4 — a stomp still counts while moving sideways (only the vertical relation matters)", () => {
    // Horizontal motion isn't part of the rule at all, so a running jump-in
    // from the side that still lands on the head is a stomp.
    const contact = classifyContact({ playerVelocityY: 200, playerBottom: 195, enemyMidY });
    expect(contact).toBe(CONTACT.STOMP);
  });

  it("AC6 — walking into it from the side is a hit, not a stomp", () => {
    // Grounded and level with the enemy: not falling, feet below its middle.
    const contact = classifyContact({ playerVelocityY: 0, playerBottom: 212, enemyMidY });
    expect(contact).toBe(CONTACT.HIT);
  });

  it("AC6 — rising into it from below is a hit", () => {
    const contact = classifyContact({ playerVelocityY: -250, playerBottom: 190, enemyMidY });
    expect(contact).toBe(CONTACT.HIT);
  });

  it("AC6 — falling but with feet BELOW the enemy's middle is a hit, not a stomp", () => {
    // Brushing down its side, e.g. dropping past it off a ledge.
    const contact = classifyContact({ playerVelocityY: 150, playerBottom: 215, enemyMidY });
    expect(contact).toBe(CONTACT.HIT);
  });

  it("AC7 — a dead enemy is inert: a stomp on it does nothing", () => {
    const contact = classifyContact({ playerVelocityY: 120, playerBottom: 190, enemyMidY, isDead: true });
    expect(contact).toBe(CONTACT.NONE);
  });

  it("AC7 — a dead enemy can't hurt the player either while it falls away", () => {
    const contact = classifyContact({ playerVelocityY: 0, playerBottom: 212, enemyMidY, isDead: true });
    expect(contact).toBe(CONTACT.NONE);
  });
});

describe("getStompBounceVelocity (AC5 — a small hop, not a free jump)", () => {
  it("is 20% of a normal jump", () => {
    expect(getStompBounceVelocity(JUMP_VELOCITY)).toBe(JUMP_VELOCITY * 0.2);
  });

  it("points upward but is much weaker than a real jump", () => {
    const bounce = getStompBounceVelocity(JUMP_VELOCITY);
    expect(bounce).toBeLessThan(0); // negative y = upward
    expect(Math.abs(bounce)).toBeLessThan(Math.abs(JUMP_VELOCITY));
  });

  it("stays in tune with the jump if the jump is retuned", () => {
    expect(getStompBounceVelocity(-500)).toBe(-100);
  });
});

describe("getDeathPopVelocity (AC5b — the Mario-style knock-away)", () => {
  it("is 15% of a normal jump", () => {
    expect(getDeathPopVelocity(JUMP_VELOCITY)).toBe(JUMP_VELOCITY * 0.15);
  });

  it("pops the enemy up more gently than the player's own bounce", () => {
    const pop = Math.abs(getDeathPopVelocity(JUMP_VELOCITY));
    const bounce = Math.abs(getStompBounceVelocity(JUMP_VELOCITY));
    expect(pop).toBeGreaterThan(0);
    expect(pop).toBeLessThan(bounce);
  });
});

describe("isOffScreenBelow (AC5b — the corpse is cleaned up after it falls through)", () => {
  const WORLD_HEIGHT = 240;

  it("is not off-screen while still falling through the level", () => {
    expect(isOffScreenBelow(200, WORLD_HEIGHT)).toBe(false);
  });

  it("is not off-screen exactly at the bottom edge", () => {
    expect(isOffScreenBelow(WORLD_HEIGHT, WORLD_HEIGHT)).toBe(false);
  });

  it("is off-screen once past the bottom edge", () => {
    expect(isOffScreenBelow(WORLD_HEIGHT + 1, WORLD_HEIGHT)).toBe(true);
  });
});
