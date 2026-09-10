// Unit tests for the pure nickname rules. These map directly to the nickname
// acceptance criteria in specs/start-screen.md Section 4 (UI-2) — the allowed
// characters, the uppercasing, the 8-character cap, backspace, and the
// PLAYER fallback.
import { describe, expect, it } from "vitest";
import {
  MAX_NICKNAME_LENGTH,
  DEFAULT_NICKNAME,
  isAllowedChar,
  typeChar,
  backspace,
  finalizeNickname,
} from "./nickname.js";

describe("isAllowedChar", () => {
  it("accepts letters in both cases and digits", () => {
    expect(isAllowedChar("A")).toBe(true);
    expect(isAllowedChar("z")).toBe(true);
    expect(isAllowedChar("7")).toBe(true);
  });

  it("rejects punctuation, spaces and non-Latin letters", () => {
    // Press Start 2P has no glyphs for these — they would render as blanks.
    expect(isAllowedChar(" ")).toBe(false);
    expect(isAllowedChar("-")).toBe(false);
    expect(isAllowedChar("!")).toBe(false);
    expect(isAllowedChar("Ж")).toBe(false);
  });

  it("rejects anything that is not a single character", () => {
    // Phaser reports named keys ("Backspace", "Shift") through the same event
    // as characters, so the filter has to reject them by length too.
    expect(isAllowedChar("Backspace")).toBe(false);
    expect(isAllowedChar("")).toBe(false);
    expect(isAllowedChar(undefined)).toBe(false);
  });
});

describe("typeChar", () => {
  it("uppercases what the player types", () => {
    expect(typeChar("", "a")).toBe("A");
  });

  it("appends to what is already there", () => {
    expect(typeChar("ARTE", "M")).toBe("ARTEM");
  });

  it("ignores a disallowed character", () => {
    expect(typeChar("ARTEM", " ")).toBe("ARTEM");
    expect(typeChar("ARTEM", "Ж")).toBe("ARTEM");
  });

  it("ignores anything typed past the maximum length", () => {
    const full = "A".repeat(MAX_NICKNAME_LENGTH);
    expect(typeChar(full, "B")).toBe(full);
  });

  it("still accepts the character that fills the last slot", () => {
    const nearlyFull = "A".repeat(MAX_NICKNAME_LENGTH - 1);
    expect(typeChar(nearlyFull, "b")).toHaveLength(MAX_NICKNAME_LENGTH);
  });
});

describe("backspace", () => {
  it("removes the last character", () => {
    expect(backspace("ARTEM")).toBe("ARTE");
  });

  it("leaves an empty nickname empty", () => {
    expect(backspace("")).toBe("");
  });
});

describe("finalizeNickname", () => {
  it("keeps a typed nickname as it is", () => {
    expect(finalizeNickname("ARTEM")).toBe("ARTEM");
  });

  it("falls back to PLAYER when nothing was typed", () => {
    expect(finalizeNickname("")).toBe(DEFAULT_NICKNAME);
  });

  it("falls back to PLAYER for an unset value", () => {
    // The registry can hand back undefined on the very first run.
    expect(finalizeNickname(undefined)).toBe(DEFAULT_NICKNAME);
  });
});
