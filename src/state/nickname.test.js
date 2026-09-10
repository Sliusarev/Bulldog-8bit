// Unit tests for the pure nickname rules. These map directly to the nickname
// acceptance criteria in specs/start-screen.md Section 4 (UI-2) — the allowed
// characters, the uppercasing, both length bounds, and backspace.
import { describe, expect, it } from "vitest";
import {
  MIN_NICKNAME_LENGTH,
  MAX_NICKNAME_LENGTH,
  isAllowedChar,
  typeChar,
  backspace,
  isNicknameValid,
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

describe("isNicknameValid", () => {
  it("rejects a nickname shorter than the minimum", () => {
    expect(isNicknameValid("")).toBe(false);
    expect(isNicknameValid("A")).toBe(false);
    expect(isNicknameValid("AL")).toBe(false);
  });

  it("accepts a nickname of exactly the minimum length", () => {
    // The boundary itself is legal — 3 is the minimum, not one below it.
    expect(isNicknameValid("A".repeat(MIN_NICKNAME_LENGTH))).toBe(true);
  });

  it("accepts a nickname of exactly the maximum length", () => {
    expect(isNicknameValid("A".repeat(MAX_NICKNAME_LENGTH))).toBe(true);
  });

  it("rejects an unset value", () => {
    // The registry hands back undefined on the very first run.
    expect(isNicknameValid(undefined)).toBe(false);
  });
});

describe("nickname length bounds", () => {
  // The other tests all read these constants, so they would stay green if the
  // bounds were changed by mistake. These two pin the numbers the spec asks
  // for (specs/start-screen.md Section 4).
  it("requires at least 3 characters", () => {
    expect(MIN_NICKNAME_LENGTH).toBe(3);
  });

  it("allows at most 10 characters", () => {
    expect(MAX_NICKNAME_LENGTH).toBe(10);
  });
});
