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

  // create() runs once when the scene starts. We add a bit of text so the
  // canvas isn't completely blank and you know it's alive.
  create() {
    this.add.text(160, 120, "Buldog 8-Bit\nready to build!", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);
  }

  // update() runs ~60 times per second and is where game logic will go.
  update() {}
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
