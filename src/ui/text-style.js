// The game's typography, in one place.
//
// Every text object in the game spreads one of the styles below, so the HUD,
// the GAME OVER screen and (later) the start screen and results window can't
// drift into three different looks. See specs/hud-and-font.md (UI-3) and
// CLAUDE.md's "Look and feel > Typography" for the decision behind it.
//
// The font is Press Start 2P — the free arcade/NES pixel face, SIL OFL 1.1 —
// vendored into src/assets/fonts/ with its licence. It is loaded by the
// browser's own FontFace API below rather than by a loader package: Phaser has
// no web-font loading of its own (its preload() fills the texture cache and
// knows nothing about DOM fonts), and the usual answer, `webfontloader`, is a
// dependency this needs two lines to avoid (CLAUDE.md, "no tech zoo").

import fontUrl from "../assets/fonts/PressStart2P-Regular.ttf";

// The family name the browser will know the face by.
export const PIXEL_FONT = "Press Start 2P";

// Monospace is listed as the fallback ON PURPOSE: if the face never loads, the
// browser silently uses it and every screen still renders. That one string is
// the whole of the "the game must survive a missing font" requirement.
const FONT_STACK = `"${PIXEL_FONT}", monospace`;

// Sizes are multiples of 8 because 8px is the font's native cell — a character
// is exactly 8x8 pixels there, which lands on the 320x240 canvas's pixel grid.
// Anything in between (10px, 12px) renders off-grid and looks soft.
export const TEXT_STYLE = {
  fontFamily: FONT_STACK,
  fontSize: "8px",
  color: "#ffffff",
};

// Headings — GAME OVER now, UI-5's results heading later.
export const TITLE_TEXT_STYLE = {
  ...TEXT_STYLE,
  fontSize: "16px",
};

// Loads the vendored font and registers it with the document.
//
// Resolves TRUE when the face is ready and FALSE when it could not be loaded —
// it NEVER rejects. That is deliberate: the caller boots the game either way,
// so a missing font can only ever mean "fall back to monospace", never "no
// game at all".
export async function loadPixelFont() {
  // Not every environment has the Font Loading API (and jsdom in tests has no
  // document at all), so treat its absence as "just use the fallback".
  if (typeof document === "undefined" || !document.fonts) return false;

  try {
    const face = new FontFace(PIXEL_FONT, `url(${fontUrl})`);
    await face.load();
    document.fonts.add(face);
    return true;
  } catch (error) {
    // Warn rather than throw: the game is about to start regardless.
    console.warn("Pixel font failed to load; falling back to monospace.", error);
    return false;
  }
}
