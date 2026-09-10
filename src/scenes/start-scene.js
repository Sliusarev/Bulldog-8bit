// The start screen: the first thing the player sees, and the only place a run
// is set up. See specs/start-screen.md (UI-1 / UI-2).
//
// Like the level scene, this is a THIN ADAPTER: it draws text and forwards
// keypresses to the pure rules in src/state/nickname.js and
// src/state/color-select.js. No rule about what a nickname may contain, or
// which color comes next, is decided here.

import Phaser from "phaser";
import { ANIMATIONS } from "../physics/animation.js";
import { DEFAULT_COLOR, colorToTint, nextColor, previousColor } from "../state/color-select.js";
import {
  MIN_NICKNAME_LENGTH,
  backspace,
  isNicknameValid,
  typeChar,
} from "../state/nickname.js";
import { resetHearts } from "../state/health.js";
import { resetScore } from "../state/score.js";
import { NICKNAME_TEXT_STYLE, TEXT_STYLE, TITLE_TEXT_STYLE } from "../ui/text-style.js";
import buldogSheet from "../assets/buldog.png";

// How often the cursor and the PRESS ENTER prompt swap between shown and
// hidden. ~500ms is the classic arcade blink: noticeable without being busy.
const BLINK_INTERVAL_MS = 500;

// The bottom line doubles as the validation message: it says what is missing
// while the name is too short, and how to start once it isn't. The player
// therefore never presses ENTER and gets silence.
const PROMPT_READY = "PRESS ENTER";
// Built from the rule's own constant, so the screen can never tell the player
// to type a length that ENTER would then reject.
const PROMPT_TOO_SHORT = `MIN ${MIN_NICKNAME_LENGTH} LETTERS`;

export class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    // Guarded because this scene can be re-entered from GAME OVER, by which
    // point the level has already loaded the same sheet — reloading a key
    // that's in use warns to the console for no benefit.
    if (!this.textures.exists("buldog")) {
      this.load.spritesheet("buldog", buldogSheet, { frameWidth: 48, frameHeight: 48 });
    }
  }

  create() {
    // Both values come back out of the registry so returning here from GAME
    // OVER shows the previous run's setup instead of an empty screen. On the
    // very first run there is nothing stored, hence the fallbacks.
    // A stored name is always exactly what the player typed (it had to be
    // valid to get stored at all), so showing it again on a return from GAME
    // OVER can't surprise them with a name they never entered.
    this.nickname = this.registry.get("nickname") ?? "";
    this.color = this.registry.get("color") ?? DEFAULT_COLOR;
    this.blinkOn = true;

    this.add.text(160, 40, "BULDOG", TITLE_TEXT_STYLE).setOrigin(0.5);
    this.add.text(160, 88, "ENTER YOUR NAME", TEXT_STYLE).setOrigin(0.5);
    this.nicknameText = this.add.text(160, 104, "", NICKNAME_TEXT_STYLE).setOrigin(0.5);

    this.add.text(160, 136, "COLOR", TEXT_STYLE).setOrigin(0.5);
    this.add.text(112, 156, "<", TEXT_STYLE).setOrigin(0.5);
    this.add.text(208, 156, ">", TEXT_STYLE).setOrigin(0.5);

    // The animations are global to the game, so whichever scene gets here
    // first defines them and the other reuses them.
    if (!this.anims.exists(ANIMATIONS.idle.key)) {
      const { key, start, end, frameRate } = ANIMATIONS.idle;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers("buldog", { start, end }),
        frameRate,
        repeat: -1,
      });
    }
    // The preview uses the same texture, animation and tint call as the hero in
    // the level, so what the player picks here is what they get there.
    this.preview = this.add.sprite(160, 152, "buldog", 0).setOrigin(0.5);
    this.preview.play(ANIMATIONS.idle.key);

    this.promptText = this.add.text(160, 200, PROMPT_READY, TEXT_STYLE).setOrigin(0.5);

    this.renderNickname();
    this.renderColor();

    this.time.addEvent({
      delay: BLINK_INTERVAL_MS,
      loop: true,
      callback: () => {
        this.blinkOn = !this.blinkOn;
        this.renderNickname();
        this.promptText.setVisible(this.blinkOn);
      },
    });

    // One listener for the whole screen. The nickname is event-driven by
    // nature (a keypress either adds a character or it doesn't), so polling
    // Key objects in update() the way the level does would mean two input
    // styles on one screen.
    this.input.keyboard.on("keydown", this.handleKey, this);
  }

  handleKey(event) {
    // Shortcuts belong to the browser, not to the nickname: without this,
    // Cmd+V / Ctrl+A / Cmd+Shift+3 each typed their letter into the name.
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === "Enter") {
      // Ignore auto-repeat: ENTER on the GAME OVER screen is what brought the
      // player here, and if it's still held its repeats must not shoot
      // straight through this screen into a new run.
      if (event.repeat) return;
      this.startRun();
      return;
    }

    if (event.key === "Backspace") {
      this.nickname = backspace(this.nickname);
      this.renderNickname();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      this.color =
        event.key === "ArrowRight" ? nextColor(this.color) : previousColor(this.color);
      this.renderColor();
      return;
    }

    // Everything else is offered to the nickname rules, which keep only what
    // is allowed — named keys like "Shift" and "F5" fall out there, not here.
    this.nickname = typeChar(this.nickname, event.key);
    this.renderNickname();
  }

  // Draws the name plus a blinking cursor. The cursor alternates with a SPACE
  // rather than with nothing, so the centered line keeps its width and the
  // name doesn't twitch left and right twice a second.
  renderNickname() {
    this.nicknameText.setText(this.nickname + (this.blinkOn ? "_" : " "));
    // Re-derived from the name every time it changes, so the line is right
    // after a keystroke AND after a backspace, with no separate bookkeeping.
    this.promptText.setText(isNicknameValid(this.nickname) ? PROMPT_READY : PROMPT_TOO_SHORT);
  }

  renderColor() {
    this.preview.setTint(colorToTint(this.color));
  }

  // The single definition of "a new run": the setup the player chose, plus a
  // full set of hearts and a score of zero. Doing it here rather than in the
  // level is what lets the level keep its rule of trusting whatever the
  // registry holds (which is how hearts survive a mid-level restart).
  startRun() {
    // The name is required. Refusing here — the single place a run can begin —
    // rather than in the key handler means no other path can skip the check.
    // The prompt line is already saying why nothing happened.
    if (!isNicknameValid(this.nickname)) return;

    this.registry.set("nickname", this.nickname);
    this.registry.set("color", this.color);
    this.registry.set("hearts", resetHearts());
    this.registry.set("score", resetScore());
    this.scene.start("BootScene");
  }
}
