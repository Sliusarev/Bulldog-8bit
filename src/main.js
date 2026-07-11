// main.js — the entry point for our game.
// This file boots up Phaser and shows a blank game canvas.

import Phaser from "phaser";

// A "Scene" is one screen of the game (a menu, a level, a game-over screen).
// For now we make one empty scene just to prove everything works.
class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  // preload() runs first and is where we'll load images and sounds later.
  preload() {}

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

    // Draw a red rectangle to stand in for Buldog (16x16, per the design doc)
    // starting a bit above the ground so he visibly falls into place.
    this.player = this.add.rectangle(160, 180, 16, 16, 0xcc3333);

    // Turn the player into a physics body too. No second argument means it's
    // a DYNAMIC body: gravity pulls it down and it can move via velocity.
    this.physics.add.existing(this.player);

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
  }

  // update() runs ~60 times per second. This is where we react to input
  // and move the player each frame.
  update() {
    // How fast the player walks, in pixels per second.
    const walkSpeed = 100;

    if (this.cursors.left.isDown) {
      // Left arrow held: move left (negative x velocity).
      this.player.body.setVelocityX(-walkSpeed);
    } else if (this.cursors.right.isDown) {
      // Right arrow held: move right (positive x velocity).
      this.player.body.setVelocityX(walkSpeed);
    } else {
      // No arrow held: stop horizontal movement immediately (no sliding).
      this.player.body.setVelocityX(0);
    }

    // JustDown is true for exactly one frame — the moment the key is first
    // pressed — so holding spacebar doesn't trigger repeated jumps.
    // body.blocked.down is true only when the player is resting on
    // something solid (like the ground), so this also blocks mid-air jumps.
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.blocked.down) {
      // Negative y velocity means "upward" in screen coordinates. Gravity
      // (set in the config below) will pull the player back down.
      this.player.body.setVelocityY(-300);
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
    mode: Phaser.Scale.FIT,       // Scale the game up to fit the window.
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 2,                      // Draw everything at 2x so it's easier to see.
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
new Phaser.Game(config);
