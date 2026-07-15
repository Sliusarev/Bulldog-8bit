# Feature Spec: [Feature Name]

> **Scope:** [Alpha | Beta] — which milestone this feature belongs to (see
> `CLAUDE.md` → "Project phases: Alpha & Beta"). Delete the option that doesn't apply.
> **WBS:** [`ID`] — the matching feature ID in `Bulldog-8Bit-WBS.md`.

> **How to use this in a spec-driven flow:**
> 1. Fill this out *before* writing any code.
> 2. Give it to Claude Code and ask it to produce a **plan + task list** from the spec — no code yet.
> 3. Review/approve the plan (your PM step).
> 4. Have it implement task by task.
> 5. Verify every item in "Acceptance criteria" before marking the feature done.
> Keep this file as the source of truth. If the code needs to differ, update the spec first.

---

## 1. Summary
One or two sentences: what this feature is and why it exists.

## 2. User story
As a **[type of player]**, I want **[goal]**, so that **[benefit]**.

## 3. Scope

**In scope**
- What this feature *will* do.

**Out of scope**
- What it deliberately will *not* do (prevents scope creep).

## 4. Acceptance criteria
Testable, checkable statements. Use "Given / When / Then" where helpful. Each becomes a checkbox to verify at the end.

- [ ] Given …, when …, then …
- [ ] …

## 5. UX / behaviour details
Screens, states, what the player sees and does, transitions. Rough sketches or text layout are fine.

## 6. Data & persistence
What data is stored, its shape, and where it lives (e.g. localStorage key + JSON structure).

## 7. Edge cases & error handling
Empty states, invalid input, limits, ties, first-run, etc.

## 8. Dependencies
Other features, scenes, or data this relies on or must not break.

## 9. Definition of done
The single line that means "ship it": all acceptance criteria pass, committed and pushed, no console errors.
