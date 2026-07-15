---
name: update-checklist
description: Update Bulldog-8Bit-Checklist.md (and WBS status) to reflect completed work. Use right after a feature branch / PR merges into main, and after finishing any non-code development task (writing a spec, updating planning docs, research, tooling/setup). Ticks the boxes that are truly done, moves the "YOU ARE HERE" marker, and updates the status line and WBS feature status.
---

# Keeping the checklist in sync with reality

`Bulldog-8Bit-Checklist.md` is the phase-by-phase build tracker. It only helps
if it matches what's actually done. This skill is the routine for updating it so
it never drifts.

**Run this in two situations:**

1. **Right after a merge.** A feature branch / PR has merged into `main` (the
   work is now permanent). Reflect that in the checklist.
2. **After completing a non-code development task.** Spec writing, planning-doc
   edits, research spikes, tooling/CI/setup, a design decision recorded — things
   that finish without necessarily producing a merge. Update the checklist as
   soon as the task is genuinely done.

The related docs and how they relate: `CLAUDE.md` (design, source of truth) ·
`Bulldog-8Bit-WBS.md` (requirements catalog, Epic > Feature with status) ·
`Bulldog-8Bit-Roadmap.md` (narrative learn-by-doing plan) ·
`Bulldog-8Bit-Checklist.md` (this skill's main target).

## Process

1. **Establish what actually landed.** Don't tick from memory or intention.
   - For a merge: check what merged — `git log --oneline main -5`, or the PR's
     merged commits / diff. Only work that is on `main` counts as done.
   - For a non-code task: confirm the deliverable exists (the spec file is
     written, the doc is saved, the decision is recorded).

2. **Open `Bulldog-8Bit-Checklist.md` and tick only what's genuinely complete.**
   - Check the `[ ]` → `[x]` boxes for the items that are truly finished **and**
     (for code) merged. A half-built or unmerged item stays unchecked.
   - Respect each phase's own "Done when:" line and the SDLC mini-loop — an item
     with testable logic isn't done until its tests exist and CI is green
     (see the "Basic test checklist" in the doc).

3. **Move the phase pointer and status line.**
   - Update the top status line (e.g. `Phase 1 complete → starting Phase 2`) when
     a phase's boxes are all checked.
   - Move the `⬅ YOU ARE HERE` marker to the phase now in progress.
   - Mark a fully-finished phase with `✅ COMPLETE` in its heading, matching the
     style of the already-completed phases.

4. **Sync `Bulldog-8Bit-WBS.md` status for any feature whose state changed.**
   The checklist references WBS IDs (e.g. `CHAR-4`, `ENEMY-1`). When a feature is
   completed, update its WBS status legend marker (🔲 Backlog / 📝 Spec written /
   ✅ Done), and update the WBS "Summary" counts at the bottom if they no longer
   add up. Keep the two docs telling the same story.

5. **Don't over-reach.** Only touch status/tracking. This skill does not build
   features, write specs, or edit game code — it records that work already done
   is done. If something is only partly finished, note it (leave the box
   unchecked, optionally add a short parenthetical) rather than ticking it.

6. **State what you changed.** Briefly tell the user which boxes/markers you
   ticked or moved, so they can sanity-check the tracker against their own view.

## Notes

- **Truthfulness first.** If tests failed, an item was skipped, or a merge only
  landed part of a phase, the checklist must reflect that — never tick a box to
  look tidy. An inaccurate tracker is worse than an out-of-date one.
- **For truly automatic local triggers** (optional, not required): a git
  `post-merge` hook could remind you to run this after a local `git merge` /
  `git pull` of `main`. Remote PR merges on GitHub have no local event to hook,
  so those rely on running this skill when you sync `main` or finish the task.
