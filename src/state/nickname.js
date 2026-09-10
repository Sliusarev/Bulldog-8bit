// Pure nickname rules for the arcade-style name entry on the start screen,
// pulled out of the Phaser Scene so they can be unit tested without a browser.
// See specs/start-screen.md (UI-2) for the acceptance criteria these implement.
//
// The Scene holds the string the player is typing and calls these to change it;
// every rule that could be got wrong — the cap, the character filter, the
// uppercasing, the empty-name fallback — lives here where a test can disagree
// with it.

// A name is REQUIRED, not optional: three characters is the classic arcade
// minimum, and the run cannot start below it (specs/start-screen.md v2).
export const MIN_NICKNAME_LENGTH = 3;

// Ten characters still fits the 320px-wide screen in the 8px font, and later a
// scoreboard row (BOARD, [Beta]).
export const MAX_NICKNAME_LENGTH = 10;

// Only A-Z and 0-9 are accepted, because Press Start 2P has glyphs for nothing
// else — a Cyrillic or accented letter would render as a blank box.
//
// The length check matters as much as the pattern: Phaser reports named keys
// ("Backspace", "Shift", "ArrowLeft") through the same `key` property as real
// characters, and "Shift" must not become five letters of nickname.
export function isAllowedChar(char) {
  return typeof char === "string" && char.length === 1 && /[a-z0-9]/i.test(char);
}

// Append one typed character. Returns the nickname UNCHANGED when the
// character isn't allowed or the name is already full, so the Scene can call
// this on every keypress without checking anything itself.
export function typeChar(nickname, char) {
  if (!isAllowedChar(char)) return nickname;
  if (nickname.length >= MAX_NICKNAME_LENGTH) return nickname;
  return nickname + char.toUpperCase();
}

// Delete the last character. An empty nickname stays empty rather than
// underflowing into undefined.
export function backspace(nickname) {
  return nickname.slice(0, -1);
}

// Is this name long enough to start a run with? The start screen asks before
// letting ENTER through, and shows the reason when the answer is no.
//
// There is no upper check here: typeChar() already makes a too-long name
// impossible, so re-testing it would guard against nothing.
export function isNicknameValid(nickname) {
  return typeof nickname === "string" && nickname.length >= MIN_NICKNAME_LENGTH;
}
