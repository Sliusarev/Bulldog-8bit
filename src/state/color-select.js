// Pure color-select rules for the bulldog hero, pulled out of the Phaser Scene
// so they can be unit tested without a browser or canvas. See
// specs/color-select.md for the acceptance criteria these implement, and
// CLAUDE.md's "Architecture notes > Testing strategy" for why this file lives
// separately from main.js.
//
// The Scene holds the *currently selected* color and calls these functions to
// (a) advance to the next color when the player cycles, and (b) turn a color
// into the tint/fill hex to paint the hero with. Keeping both here means the
// future title screen (UI-2) and the temporary dev key can share the exact
// same rules.

// The three selectable colors. This order is the single source of truth for
// both the cycle order (white -> black -> red -> white) and the left-to-right
// order the future title screen should show swatches in.
export const COLORS = ["white", "black", "red"];

// What the hero looks like before the player has chosen anything.
export const DEFAULT_COLOR = "white";

// Each color's tint/fill value, as a Phaser-style hex number.
// - white: full white — with a light-drawn sprite this reads as-is.
// - black: a dark grey, NOT pure 0x000000 — a pure-black tint would crush the
//   sprite into a silhouette with no visible detail.
// - red: a warm, foxy reddish-brown (ginger dog), per the spec — deliberately
//   not a fire-engine primary red.
export const COLOR_TINTS = {
  white: 0xffffff,
  black: 0x555555,
  red: 0xc46a2f,
};

// Advance to the next color in the cycle. Wraps around at the end
// (red -> white). Any unknown/unset value falls back to the default's
// position so the cycle can never get "stuck" on a bad value.
export function nextColor(current) {
  const index = COLORS.indexOf(current);
  if (index === -1) return DEFAULT_COLOR;
  return COLORS[(index + 1) % COLORS.length];
}

// Map a color name to the hex to paint the hero with. Unknown/unset values
// fall back to the default color's tint so we never return undefined (which
// would make the sprite invisible or throw).
export function colorToTint(color) {
  return COLOR_TINTS[color] ?? COLOR_TINTS[DEFAULT_COLOR];
}
