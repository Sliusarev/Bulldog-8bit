---
name: story-unit-tests
description: Add Vitest unit test coverage for a feature spec in specs/. Extracts testable pure logic out of Phaser scene code into a plain module, then writes one test per acceptance criterion. Use after implementing a story from specs/, or when asked to "add tests for this feature."
---

# Adding unit tests for a user story

This project's testing strategy (see `CLAUDE.md` → "Architecture notes >
Testing strategy") is: **unit test pure logic, not Phaser itself.** Phaser
rendering, scene lifecycle, and animations aren't practically unit-testable
outside a real browser/canvas — don't try. What's testable is the game
*rules* underneath: movement, jump conditions, scoring math, collision math,
thresholds.

Worked example to pattern-match against: `specs/player-physics.md` →
`src/physics/player.js` (pure functions) → `src/physics/player.test.js`
(tests) → `src/main.js` (thin Phaser adapter that just calls the functions).

## Process

1. **Read the spec.** Open the relevant file in `specs/`. Section 4
   ("Acceptance criteria") is the list of behaviors to cover — each checkbox
   becomes roughly one test.

2. **Sort criteria into testable vs. not.** For each acceptance criterion,
   ask: "is this a rule (input → deterministic output), or is it about how
   something renders/feels?"
   - Testable: "given grounded=true and jump pressed, velocity becomes -300",
     "given score=95 and +10 bones, extra life is granted".
   - Not testable here: "the jump feels responsive", "the sprite animates
     smoothly" — leave these as manual playtest notes, don't force a unit
     test.

3. **Extract the logic, if it isn't already separate.** Game logic in this
   codebase usually starts inline inside a Scene's `create()`/`update()`.
   Before it can be unit tested, pull it into a plain, exported
   function/module under `src/<domain>/` (e.g. `src/physics/`,
   `src/scoring/`) — no Phaser imports, no `this.scene`, just plain
   JS in and out. The Scene should end up calling these functions and doing
   nothing else with that logic — it becomes a thin adapter, and adapters
   don't get unit tests (there's nothing to assert against without a
   browser).

4. **Write `<module>.test.js` next to the module.** One `it(...)` per
   acceptance criterion where practical; a short comment or the test name
   itself should make clear which criterion it maps to, so the spec and the
   tests stay traceable to each other.

5. **Run the checks:**
   ```bash
   npm run test
   npm run lint
   ```

6. **Update the spec.** Check off the acceptance criteria now covered by
   tests, and add a line noting the test file path (see how
   `specs/player-physics.md` references `src/physics/player.js` under
   Section 8/9 as a model).

## What not to do

- Don't write tests against Phaser `Scene`, `GameObject`, or physics `body`
  objects directly — they require a real Phaser game instance and belong to
  the "not practically unit-testable" bucket.
- Don't invent acceptance criteria that aren't in the spec — if the spec is
  missing something testable, add it to the spec first (spec is the source
  of truth), then write the test.
- Don't force a test onto a "feel" criterion (jump height, walk speed
  tuning) — those stay manual playtests, note that explicitly rather than
  faking a brittle assertion.
