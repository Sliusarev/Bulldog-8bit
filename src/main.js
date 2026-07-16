// main.js — the entry point for our game.
// This file boots up Phaser and shows a blank game canvas.

import Phaser from "phaser";
import { getWalkVelocityX, canJump, nextAirJumpsUsed, JUMP_VELOCITY } from "./physics/player.js";
import { ANIMATIONS, DEFAULT_FACING, getAnimationKey, nextFacing } from "./physics/animation.js";
import { DEFAULT_COLOR, nextColor, colorToTint } from "./state/color-select.js";
import buldogSheet from "./assets/buldog.png";

// A "Scene" is one screen of the game (a menu, a level, a game-over screen).
// For now we make one empty scene just to prove everything works.
class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  // preload() runs first and is where we load images and sounds. The bulldog
  // spritesheet is a 3-row x 11-col grid of 32x32 cells (idle/run/jump rows
  // extracted from the source art — see specs/character-sprite.md §5).
  preload() {
    this.load.spritesheet("buldog", buldogSheet, { frameWidth: 32, frameHeight: 32 });
  }

  // create() runs once when the scene starts. This is where we build the
  // placeholder ground and player so we can test movement and jumping
  // before any real art exists.
  create() {
    // Draw a brown rectangle to stand in for the ground. Arguments are:
    // x, y (center point), width, height, color (hex).
    // Canvas is 320x240, so a 32px-tall strip at y=224 sits flush with the
    // bottom edge (224 + 16 half-height = 240).
    const ground = this.add.rectangle(160, 224, 320, 32, 0x8b5a2b);

    // Turn the ground into a physics body so things can collide with it.
    // The second argument `true` makes it a STATIC body: it won't move and
    // won't be affected by gravity, which is exactly what solid ground needs.
    this.physics.add.existing(ground, true);

    // Define the three Alpha animations (idle/run/jump) from the frame ranges
    // in src/physics/animation.js, so the frame numbers live in one place.
    Object.values(ANIMATIONS).forEach(({ key, start, end, frameRate }) => {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers("buldog", { start, end }),
        frameRate,
        repeat: -1,
      });
    });

    // The real animated bulldog sprite (see specs/character-sprite.md),
    // starting a bit above the ground so he visibly falls into place. Drawn
    // at its native 32x32 size (no setScale) — a bit bigger than the 16x16
    // physics body it sits on, same "visual overhang beyond the hitbox" most
    // platformers use (deliberately NOT trying to make the sprite's display
    // size exactly match the body: combining setScale with a custom body
    // size confuses Arcade Physics's offset math, which assumes scale 1).
    // Color comes from the color-select rules (see specs/color-select.md),
    // applied as a tint — the same mechanism as the rectangle's fillColor.
    this.currentColor = DEFAULT_COLOR;
    this.facing = DEFAULT_FACING;
    // How many mid-air jumps have been used since last landing (MOVE-7 double
    // jump — see specs/double-jump.md). Reset to 0 whenever grounded.
    this.airJumpsUsed = 0;
    this.player = this.physics.add.sprite(160, 180, "buldog", 0);
    // Keep the same 16x16 hitbox the placeholder rectangle used
    // (specs/player-physics.md), centered within the 32x32 sprite frame.
    this.player.body.setSize(16, 16);
    this.player.setTint(colorToTint(this.currentColor));
    this.player.play(ANIMATIONS.idle.key);

    // Stop the player from being pushed off the left/right/top/bottom edges
    // of the game world, so he can't run off-screen and get lost.
    this.player.body.setCollideWorldBounds(true);

    // Make the player and the ground collide, so the player lands ON TOP of
    // the ground instead of falling straight through it.
    this.physics.add.collider(this.player, ground);

    // Ask Phaser for an object that tracks the arrow keys' up/down state.
    // We'll read cursors.left / cursors.right in update() for movement.
    this.cursors = this.input.keyboard.createCursorKeys();

    // Separately track the spacebar, since we're using it (not up-arrow)
    // for jumping.
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // TEMPORARY dev key: press C to cycle the bulldog's color
    // (white -> black -> red). This proves the color-select feature works
    // before the real title screen exists; the title screen (UI-2) will drive
    // the same nextColor()/colorToTint() rules later, and this key gets
    // removed then. C doesn't clash with the arrows or spacebar.
    this.colorKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    // Press F to toggle fullscreen (the on-screen button in index.html does
    // the same thing via game.scale.toggleFullscreen() — this is just the
    // keyboard-only equivalent, matching NFR-9).
    this.fullscreenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
  }

  // update() runs ~60 times per second. This reads Phaser's input/physics
  // state, hands it to the plain (unit-tested) rules in physics/player.js,
  // and applies whatever they decide. The rules themselves live outside
  // Phaser so they can be tested without a browser — see
  // src/physics/player.test.js.
  update() {
    // Cycle the bulldog's color when C is JUST pressed (JustDown is true for
    // one frame only, so holding C doesn't strobe through colors).
    if (Phaser.Input.Keyboard.JustDown(this.colorKey)) {
      this.currentColor = nextColor(this.currentColor);
      this.player.setTint(colorToTint(this.currentColor));
    }

    // Read the current input state.
    const leftDown = this.cursors.left.isDown;
    const rightDown = this.cursors.right.isDown;

    // Ask the rule what horizontal velocity that input implies, and apply it.
    const velocityX = getWalkVelocityX({ leftDown, rightDown });
    this.player.body.setVelocityX(velocityX);

    // Face the direction of travel, holding the last facing while stopped or
    // jumping straight up (see specs/character-sprite.md, AC7).
    this.facing = nextFacing(this.facing, velocityX);
    this.player.setFlipX(this.facing === "left");

    // JustDown is true for exactly one frame — the moment the key is first
    // pressed — so holding spacebar doesn't trigger repeated jumps.
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey);

    // body.blocked.down is true only when the player is resting on
    // something solid (like the ground).
    const isGrounded = this.player.body.blocked.down;

    // Allow a jump when grounded OR when a mid-air (double) jump is still
    // available. The same JUMP_VELOCITY is reused for both (MOVE-7).
    const didJump = canJump({ jumpPressed, isGrounded, airJumpsUsed: this.airJumpsUsed });
    if (didJump) {
      // Negative y velocity means "upward" in screen coordinates. Gravity
      // (set in the config below) will pull the player back down.
      this.player.body.setVelocityY(JUMP_VELOCITY);
    }

    // Update the mid-air jump counter every frame: it resets on landing and
    // ticks up each time a mid-air jump is spent, so the double jump can't
    // repeat until the player touches ground again.
    this.airJumpsUsed = nextAirJumpsUsed(this.airJumpsUsed, { isGrounded, didJump });

    // Play whichever animation the current state calls for. `play`'s second
    // argument (ignoreIfPlaying) skips restarting an animation that's already
    // running, so re-deriving this every frame doesn't glitch/restart loops
    // or delay transitions (specs/character-sprite.md AC4/AC8).
    this.player.play(getAnimationKey({ isGrounded, velocityX }), true);

    if (Phaser.Input.Keyboard.JustDown(this.fullscreenKey)) {
      this.scale.toggleFullscreen();
    }
  }
}

// The config object tells Phaser how to set up the game.
const config = {
  type: Phaser.AUTO,        // Use WebGL if available, otherwise Canvas.
  width: 320,               // Game width in pixels (classic 8-bit resolution).
  height: 240,              // Game height in pixels.
  parent: "game",           // Put the canvas inside the <div id="game"> in index.html.
  backgroundColor: "#5c94fc", // Classic Mario sky blue.
  pixelArt: true,           // Keep pixels sharp, not blurry.
  scale: {
    mode: Phaser.Scale.FIT,       // Scale the game up to fill #game (see index.html),
                                  // however big the browser window is — no fixed zoom.
    // Let Phaser center the canvas. This is the SINGLE centering mechanism —
    // #game has no flexbox (index.html), on purpose: in fullscreen the canvas
    // itself becomes the fullscreen element, so a flexbox on #game wouldn't
    // apply and the canvas would sit left-aligned. Phaser's autoCenter works
    // in BOTH windowed and fullscreen, so it's the one that handles both.
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",            // Simple, fast physics — perfect for platformers.
    arcade: {
      gravity: { y: 600 },        // Pulls things downward so the hero can fall/jump.
      debug: false,               // Set to true later to see collision boxes.
    },
  },
  scene: [BootScene],             // The list of scenes in the game.
};

// This line actually creates and starts the game.
const game = new Phaser.Game(config);

// Wire the HTML fullscreen button (index.html) to Phaser's Scale Manager —
// the in-game F key (BootScene.update) does the same thing.
document.getElementById("fullscreen-btn").addEventListener("click", () => {
  game.scale.toggleFullscreen();
});

// The browser's fullscreen transition doesn't always finish before Phaser's
// own resize handling reads the new viewport size, which left the canvas
// sized/centered for the *old* (pre-fullscreen) dimensions — visible as an
// off-center canvas with mismatched margins once fullscreen settled. Forcing
// a refresh once the transition is actually done (this event fires after)
// makes the Scale Manager re-measure #game and re-fit/re-center correctly.
game.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, () => game.scale.refresh());
game.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => game.scale.refresh());
