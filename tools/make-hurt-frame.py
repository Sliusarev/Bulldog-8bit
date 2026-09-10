#!/usr/bin/env python3
"""Add (or rebuild) the CHAR-3 "hurt" frame in src/assets/buldog.png.

The source contact sheet the bulldog art came from has no damage pose
(rows: JUMP, IDLE1, IDLE2, SIT, WALK, RUN, SNIFF, SNIFF&WALK), so the hurt
frame is *derived*: an idle frame squashed toward the ground, the classic
8-bit "he got flattened" read. See specs/hurt-frame.md.

This is a DEV-ONLY authoring tool. It is not part of the game's runtime, the
Vite build, or CI — nothing in package.json depends on it. Its output (the
regenerated PNG) is what ships, committed as pixels.

Run from the repo root:

    python3 tools/make-hurt-frame.py

It is idempotent: row 3 is always rebuilt from rows 0-2, so running it twice
produces the same 4-row sheet rather than appending a 5th row.
"""

from pathlib import Path

from PIL import Image

SHEET = Path(__file__).resolve().parent.parent / "src" / "assets" / "buldog.png"

CELL = 48          # one frame is 48x48 (specs/character-sprite.md)
COLUMNS = 11       # keep this fixed — Phaser numbers frames row-major, so
                   # changing it would shift every existing frame index
ANIM_ROWS = 3      # idle / run / jump: the rows the hurt frame is derived from
SOURCE_FRAME = 0   # idle frame 0 — a neutral standing pose

# How the squash deforms the dog. Squashing to ~62% height while widening to
# ~120% keeps his volume looking roughly constant, so it reads as "squashed",
# not "shrunk".
SQUASH_Y = 0.62
STRETCH_X = 1.20

# Anything at least this opaque becomes fully opaque, everything else fully
# transparent. Pixel art has no soft edges, and the CHAR-2 export cleaned the
# sheet the same way.
ALPHA_CUTOFF = 128


def snap_alpha(image):
    """Hard-snap alpha so the resize can't leave semi-transparent fringes."""
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            pixels[x, y] = (r, g, b, 255 if a >= ALPHA_CUTOFF else 0)
    return image


def make_hurt_cell(sheet):
    """Build the 48x48 hurt cell from one idle frame."""
    frame = sheet.crop((SOURCE_FRAME * CELL, 0, SOURCE_FRAME * CELL + CELL, CELL))

    # Work on the dog itself, not the transparent padding around him, so the
    # squash percentages apply to his actual silhouette.
    box = frame.getbbox()
    dog = frame.crop(box)

    # NEAREST keeps the pixels chunky — a smooth resample would blur the art
    # and defeat the 8-bit look.
    squashed = dog.resize(
        (max(1, round(dog.width * STRETCH_X)), max(1, round(dog.height * SQUASH_Y))),
        Image.NEAREST,
    )
    squashed = snap_alpha(squashed)

    # Re-register the frame the way every other frame in the sheet is
    # registered (specs/character-sprite.md §5): feet on the cell's bottom
    # edge, and the same horizontal centre as the source frame, so the
    # centred 24x24 physics body still lines up — flipped or not.
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    source_centre_x = (box[0] + box[2]) // 2
    cell.paste(squashed, (source_centre_x - squashed.width // 2, CELL - squashed.height))
    return cell


def main():
    sheet = Image.open(SHEET).convert("RGBA")

    # Always rebuild from the three animation rows, so re-running this script
    # replaces the hurt row instead of stacking another one below it.
    animations = sheet.crop((0, 0, COLUMNS * CELL, ANIM_ROWS * CELL))

    out = Image.new("RGBA", (COLUMNS * CELL, (ANIM_ROWS + 1) * CELL), (0, 0, 0, 0))
    out.paste(animations, (0, 0))
    # First cell of the new row = frame index 33. The rest of the row stays
    # transparent padding so the grid Phaser's spritesheet loader reads stays
    # uniform.
    out.paste(make_hurt_cell(sheet), (0, ANIM_ROWS * CELL))

    out.save(SHEET)
    print(f"wrote {SHEET} ({out.width}x{out.height}), hurt frame at index {ANIM_ROWS * COLUMNS}")


if __name__ == "__main__":
    main()
