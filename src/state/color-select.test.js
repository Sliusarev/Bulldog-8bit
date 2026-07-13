// Unit tests for the pure color-select rules. These map directly to the
// acceptance criteria in specs/color-select.md — the cycle order, the tint
// mapping, and the default/invalid fallbacks from Section 4.
import { describe, expect, it } from "vitest";
import {
  COLORS,
  DEFAULT_COLOR,
  COLOR_TINTS,
  nextColor,
  colorToTint,
} from "./color-select.js";

describe("nextColor", () => {
  it("cycles white -> black", () => {
    expect(nextColor("white")).toBe("black");
  });

  it("cycles black -> red", () => {
    expect(nextColor("black")).toBe("red");
  });

  it("wraps red -> white", () => {
    expect(nextColor("red")).toBe("white");
  });

  it("falls back to the default from an unknown/unset value", () => {
    expect(nextColor("green")).toBe(DEFAULT_COLOR);
    expect(nextColor(undefined)).toBe(DEFAULT_COLOR);
  });
});

describe("colorToTint", () => {
  it("maps each color to its tint hex", () => {
    expect(colorToTint("white")).toBe(COLOR_TINTS.white);
    expect(colorToTint("black")).toBe(COLOR_TINTS.black);
    expect(colorToTint("red")).toBe(COLOR_TINTS.red);
  });

  it("falls back to the default color's tint for an unknown/unset value", () => {
    expect(colorToTint("green")).toBe(COLOR_TINTS[DEFAULT_COLOR]);
    expect(colorToTint(undefined)).toBe(COLOR_TINTS[DEFAULT_COLOR]);
  });
});

describe("color definitions", () => {
  it("has exactly the three designed colors, default first", () => {
    expect(COLORS).toEqual(["white", "black", "red"]);
    expect(COLORS[0]).toBe(DEFAULT_COLOR);
  });

  it("red is a warm foxy tone, not a pure primary red", () => {
    // A ginger/fox red has a strong green channel; pure red (0xff0000) has none.
    const green = (COLOR_TINTS.red >> 8) & 0xff;
    expect(green).toBeGreaterThan(0x30);
  });

  it("black is a dark grey, not pure black (keeps sprite detail visible)", () => {
    expect(COLOR_TINTS.black).toBeGreaterThan(0x000000);
  });
});
