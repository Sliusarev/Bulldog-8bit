# Bulldog 8-Bit — Work Breakdown Structure (Epic > Feature)

A requirements breakdown for the whole game, structured **Epic > Feature (user
story)**. This is a **draft** — nothing here is built or committed to until
you approve it feature by feature.

**Revision note:** this WBS was rewritten to match the "Bulldog Adventure"
game design update (health/energy resources, Crawl/Fart Attack/Bulldog Rush,
new enemies, redesigned levels and ending). Superseded features from the
original Mario-generic draft are marked **✂️ Cut** rather than deleted, so the
decision is traceable. A second pass resolved all 4 open questions from the
first draft (damage rule, XP terminology, invulnerability, pause menu) — see
each feature for the confirmed rule. Chihuahua was removed outright (not
kept as Cut) per explicit request.

**How this relates to the other planning docs:**
- `Bulldog-8Bit-Roadmap.md` — the narrative, learn-as-you-go build plan (why/how to approach each phase). **Updated for this redesign** — reworked to the hearts/Energy, Crawl/Fart/Rush, Pomeranian/Cat/Vacuum, Giant Cat, narrative-ending design.
- `Bulldog-8Bit-Checklist.md` — the phase-by-phase build-order tracker. **Updated for this redesign** — phases now reference these WBS IDs, and it carries the SDLC mini-loop + basic test checklist.
- **This file** — the requirements catalog those two pull from: every feature
  that could exist, grouped by Epic, with a status. When you approve a
  feature here, it gets its own file in `specs/` (using `specs/_TEMPLATE.md`)
  and enters the Checklist's build order.

**Status legend:**
- ✅ **Done** — built and tested.
- 📝 **Spec written** — a full spec exists in `specs/`, not yet built.
- 🔲 **Backlog** — agreed to be in scope, not yet spec'd or built.
- ❓ **Needs decision** — a genuine open question, flagged so it's a conscious choice, not a default.
- ✂️ **Cut** — was in scope, superseded or removed by the design update. Kept visible with a reason, not deleted.

**How to review:** go Epic by Epic, and for each feature reply with
**Approve** / **Defer** (keep in backlog, not now) / **Cut** (drop entirely)
/ **Modify** (tell me what changes). Approved features get spec'd one at a
time via the existing spec-driven loop.

---

## Epic 1 — MOVE: Core Movement & Physics

- **MOVE-1 — Left/right movement** ✅ Done
  As a player, I want to walk left/right with the arrow keys, so that I can navigate the level.
  Spec: `specs/player-physics.md`

- **MOVE-2 — Single jump** ✅ Done
  As a player, I want to jump with spacebar, so that I can reach platforms and clear obstacles.
  Spec: `specs/player-physics.md`

- **MOVE-3 — Ground collision** ✅ Done
  As a player, I want to land and stand on solid ground, so that I don't fall through the floor.
  Spec: `specs/player-physics.md`

- **MOVE-4 — Variable jump height** 🔲 Backlog
  As a player, I want holding jump longer to jump higher, so that I have finer control over platforming. Distinct from the new High Jump special ability (ABILITY-3) — this is about the *standard* jump's feel, not a resource-costing move.

- **MOVE-5 — Fall-into-pit death** ✂️ Cut
  Was: lose a life falling into a pit, needed for the old "Sewer Scramble" level. The new level design (Street/House, no underground/pit level) doesn't call for it. Re-open if a future level wants pits.

- **MOVE-6 — Crawl** 🔲 Backlog *(new)*
  As a player, I want to lower my body and crawl, so that Cats can't detect me, and so I can duck under the Giant Cat boss's fish projectiles. One input, two uses — worth spec'ing both at once.

---

## Epic 2 — CHAR: Player Character & Customization

- **CHAR-1 — Placeholder player rectangle** ✅ Done
  As a developer, I want a simple placeholder shape with the right physics body, so that movement can be built and tested before real art exists.

- **CHAR-2 — Bulldog sprite + animations** 🔲 Backlog *(scope expanded)*
  As a player, I want to see an animated bulldog instead of a rectangle, so that the game looks and feels real. Now needs idle, run, jump, **crawl**, **fart-attack**, and **rush** frames, in addition to the original idle/run/jump.

- **CHAR-3 — Hurt animation frame** 🔲 Backlog

- **CHAR-4 — Bulldog color select (white/black/red)** 🔲 Backlog
  Unaffected by the redesign — still a planned meta feature.

- **CHAR-5 — Brief invulnerability after damage** ✂️ Cut *(resolved: not needed)*
  Confirmed that every hit — regular enemy or the Giant Cat's fish projectile — costs a heart and restarts the level (ENEMY-3). Since a hit always removes the player from danger (restart), there's no window where a second hit could land right after the first; i-frames would have nothing to protect against. Revisit only if a future damage source is added that *doesn't* restart the level.

- **CHAR-6 — Idle personality animation (snore loop)** 🔲 Backlog *(new)*
  As a player, I want the Bulldog to start snoring if left idle long enough, so that his "loves sleeping" personality shows even outside cutscenes.

- **CHAR-7 — Fart Attack animation + VFX/SFX** 🔲 Backlog *(new)*
  As a player, I want a visible/audible fart-attack (turn-around animation, ~1s delay, effect, sound), so that the attack reads clearly and feels characterful, not just as a hitbox appearing.

- **CHAR-8 — Bulldog Rush "out of control" visual** 🔲 Backlog *(new)*
  As a player, I want the Bulldog to visibly wobble/blur during a Rush, so that "hard to steer" is communicated visually, not just mechanically.

---

## Epic 3 — ABILITY: Special Abilities & Resources *(new epic)*

Resource-costing moves layered on top of core movement. Owns the *moves*;
Epic 6 (STATE) owns the underlying HP/Energy pools they draw from.

- **ABILITY-1 — Fart Attack** 🔲 Backlog
  As a player, I want an unlimited-use fart attack (turn around first, ~1s delay) that neutralizes Cats and Angry Pomeranians in range, so that I have a free ranged option against most enemies. Does not work on the Robot Vacuum Cleaner.

- **ABILITY-2 — Bulldog Rush** 🔲 Backlog
  As a player, I want to spend 3 Energy to launch into an uncontrolled high-speed sprint that destroys everything in my path, so that I can clear large enemy groups. Hard to steer by design. Unlocked partway through Level 2 (see LEVEL-2).

- **ABILITY-3 — High Jump** 🔲 Backlog
  As a player, I want to spend 1 Energy on a high jump, so that I can reach secret areas and bonus collectibles.

---

## Epic 4 — ENEMY: Enemies & Combat

- **ENEMY-1 — Angry Pomeranian** 🔲 Backlog *(new)*
  As a player, I want a patrolling Angry Pomeranian that costs me a heart (and restarts the level) on contact but can be defeated by Stomp, Fart Attack, or Bulldog Rush, so that I have a fast, punishing enemy to respect.

- **ENEMY-2 — Cat** 🔲 Backlog *(behavior redefined)*
  As a player, I want Cats that move in short hops with pauses, appearing on platforms/ground/elevated spots, costing me a heart (and restarting the level) on contact but defeatable by Stomp, Fart Attack, or Bulldog Rush, so that positioning and timing matter. Can't detect me while I'm crawling (MOVE-6).

- **ENEMY-3 — Contact damage rule** 🔲 Backlog *(confirmed: 1 heart + level restart)*
  As a player, when I'm hit by any enemy — Angry Pomeranian, Cat, Robot Vacuum Cleaner, or the Giant Cat boss's fish projectile — I lose 1 heart and the current level restarts from the beginning (heart count carries over, doesn't refill). At 0 hearts, the run ends. Same rule everywhere, no per-enemy or boss exception. See STATE-1/STATE-3 for the resource side of this rule.

- **ENEMY-4 — Stomp-to-defeat + bounce** 🔲 Backlog
  As a player, I want to defeat an enemy by landing on its head and bounce slightly afterward, so that stomping feels responsive. Applies to Angry Pomeranian, Cat, and Robot Vacuum Cleaner (vacuum: from above only) — not a valid attack against the Giant Cat boss.

- **ENEMY-5 — Robot Vacuum Cleaner** 🔲 Backlog *(new)*
  As a player, I want a fast robot vacuum in Level 3 that actively chases me and costs me a heart (and restarts the level) on contact, defeatable only by a stomp-from-above or Bulldog Rush (not Fart Attack), so that House levels feel different from Street levels.

- **ENEMY-6 — Boss: Giant Cat** 🔲 Backlog *(replaces Big Cat, now with real numbers)*
  As a player, I want a boss fight at the end of Level 3 against a Giant Cat with 6 health segments that throws fish projectiles I can duck under, so that the game has a real climax. Bulldog Rush deals 2 segments, Fart Attack deals 1 — no stomp damage. Getting hit by a fish projectile follows ENEMY-3's rule (heart lost, Level 3 restarts) — confirmed, no boss-specific exception.

---

## Epic 5 — SCORE: Collectibles & Scoring

- **SCORE-1 — Small Bone** 🔲 Backlog
  As a player, I want to collect Small Bones that raise my score, so that exploring is rewarded.

- **SCORE-2 — Large Bone** 🔲 Backlog *(updated: "+1 XP" confirmed to mean +1 HP)*
  As a player, I want Large Bones worth double a Small Bone's score and healing +1 HP (one heart), so that finding the rarer pickup feels more valuable. Assumption: healing is capped at the starting max of 3 hearts — flag if it should grant a bonus heart beyond that.

- **SCORE-2-OLD — Extra life at 100 bones** ✂️ Cut
  The new design has no "extra life" milestone or general "lives" concept — replaced by the HP-heart system (STATE-1) and the Score/Energy resources.

- **SCORE-3 — Dog Toy** 🔲 Backlog *(new)*
  As a player, I want Dog Toy pickups that grant +1 Energy, so that I can refill Energy to use Bulldog Rush / High Jump again. Currently the only known Energy source (see STATE-2).

- **SCORE-4 — Avocado (hazard pickup)** 🔲 Backlog *(updated: "-0.5 XP" confirmed to mean -0.5 HP)*
  As a player, I want Avocados that reduce my HP by 0.5 (half a heart) if collected — two Avocados cost a full heart — so that not every pickup in the level is purely beneficial. Assumption: this quietly reduces HP without triggering the level-restart rule (ENEMY-3), since it's a pickup mistake, not an enemy hit — flag if it should restart the level too.

- **SCORE-5** ✂️ Cut — *terminology resolved, not a real feature*
  Was "what does XP do?" The design notes' "XP" turned out to mean HP/hearts (a translation artifact), not a separate experience system — see SCORE-2/SCORE-4 above. No separate XP resource exists; nothing left to build here.

- **SCORE-6 — Score persists across levels** 🔲 Backlog
  As a player, I want my score to carry over from Level 1 to Level 2 to Level 3, so that the whole run feels connected. Unaffected by the redesign.

---

## Epic 6 — STATE: Health, Energy & Game State *(renamed from "Lives & Game State")*

- **STATE-1 — Health system (3 HP hearts)** 🔲 Backlog *(replaces "3 lives"; rule confirmed)*
  As a player, I want 3 HP shown as hearts, so that I have a visible health buffer. **Confirmed damage rule:** getting hit by any enemy (Angry Pomeranian, Cat, Robot Vacuum Cleaner, or the Giant Cat's fish projectile) costs 1 heart and restarts the current level from the beginning — reduced heart count carries over, doesn't refill on restart. Classic-Mario-style, not instant game-over on first contact. See ENEMY-3 for the shared rule text.

- **STATE-2 — Energy system (3 segments)** 🔲 Backlog *(new)*
  As a player, I want a 3-segment Energy pool spent by Bulldog Rush (3) and High Jump (1), refilled only by Dog Toy pickups (SCORE-3), so that those abilities feel like a resource to manage, not a free spam option. Assumption: no passive regen — flag if wrong.

- **STATE-3 — Game Over** 🔲 Backlog *(trigger confirmed)*
  As a player, I want a clear Game Over screen when my hearts reach 0, so that I know the run ended.

- **STATE-4 — Victory / Ending** 🔲 Backlog *(scene redefined)*
  As a player, I want a proper ending after defeating the Giant Cat — walking to the bedroom, climbing into bed beside his humans, falling asleep and snoring, then end credits — so that finishing the game feels like a real story beat, not just a screen.

---

## Epic 7 — LEVEL: Levels & Progression

- **LEVEL-1 — Level 1: The Walk** 🔲 Backlog *(replaces Backyard Bounce)*
  Street, daytime. Angry Pomeranians + Cats. 2 Energy pickups; 2 High Jump secret locations with bonus bones. Ends at a water bowl (Bulldog drinks).

- **LEVEL-2 — Level 2: The Journey Home** 🔲 Backlog *(replaces Sewer Scramble)*
  Street, sunset. Angry Pomeranians + Cats. **Bulldog Rush unlocks here.** 3 Energy pickups + 2 more near the finish; 2 High Jump secrets; 1 Large Bone. Large enemy groups near the end. Ends with the Bulldog drinking water and entering the house.

- **LEVEL-3 — Level 3: Home Sweet Home** 🔲 Backlog *(replaces Rooftop Rush)*
  House, night. Robot Vacuum Cleaners, and Cat+Vacuum combinations. Boss: Giant Cat. Final scene: defeat the boss → walk to the bedroom → climb into bed with his humans → fall asleep, snoring → end credits roll.

- **LEVEL-4 — Generic sofa reward per level** ✂️ Cut
  Was: identical "jump onto a sofa and sleep" animation after every level. Replaced by three distinct, narrative endings (water bowl in L1, entering the house in L2, bedroom + credits in L3) — see LEVEL-1/2/3.

- **LEVEL-5 — Scene flow / progression** 🔲 Backlog
  As a player, I want the game to move automatically from Title → Level 1 → Level 2 → Level 3 → Ending/Credits, so that it feels like one continuous experience.

---

## Epic 8 — UI: Meta UI (Title, HUD, Input)

- **UI-1 — Title screen** 🔲 Backlog

- **UI-2 — Arcade-style nickname entry** 🔲 Backlog

- **UI-3 — In-game HUD** 🔲 Backlog *(scope expanded)*
  As a player, I want to see my HP hearts, Energy segments, and Score while playing, so that I always know my status. (No separate XP display — see SCORE-5, "XP" turned out to mean HP.)

- **UI-4 — Pause menu** 🔲 Backlog *(approved)*
  As a player, I want to pause and resume the game, so that I can step away mid-level.

---

## Epic 9 — BOARD: Scoreboard / High Scores

- **BOARD-1 — Online scoreboard** 📝 Spec written, not yet built
  Spec: `specs/scoreboard.md`. Unaffected by the redesign. Submits **Score** (no separate XP resource exists — see SCORE-5).

- **BOARD-2 — Local high-score cache fallback** 📝 Covered by BOARD-1's spec

---

## Epic 10 — AUDIO: Audio

- **AUDIO-1 — Background music** 🔲 Backlog
  Optionally distinct per level's time-of-day (day / sunset / night) — a nice-to-have, not required.

- **AUDIO-2 — Sound effects** 🔲 Backlog *(list expanded)*
  As a player, I want SFX for: jump, high jump, fart attack, rush start, stomp, hurt, Small/Large Bone pickup, Dog Toy pickup, Avocado ("yuck"), idle snore, water-bowl drink (L1 ending), door open (L2 ending), boss fish throw/hit, and a victory/credits jingle.

---

## Epic 11 — NFR: Non-Functional Requirements

Unaffected by the gameplay redesign — carried over as-is.

- **NFR-1 — Performance** 🔲 Backlog — smooth 60fps on a typical modern laptop browser.
- **NFR-2 — Browser compatibility** 🔲 Backlog — current Chrome/Firefox/Safari/Edge, desktop only for v1.
- **NFR-3 — Crisp pixel-art rendering** ✅ Already satisfied — `pixelArt: true` + `Scale.FIT`.
- **NFR-4 — CI must stay green** ✅ Already satisfied — see `CLAUDE.md` → Architecture notes.
- **NFR-5 — Unit test coverage for logic, not rendering** ✅ Already satisfied — see the `story-unit-tests` skill.
- **NFR-6 — Persistence must degrade gracefully** 🔲 Backlog — no crash if `localStorage` is unavailable.
- **NFR-7 — No secrets in front-end code** 🔲 Backlog (applies once BOARD-1 is built) — public/anon keys only.
- **NFR-8 — Deployability** 🔲 Backlog — static build, deployable to any static host.
- **NFR-9 — Keyboard-only playability** ✅ Already satisfied — arrows + spacebar cover everything today; keep true as Crawl/Fart/Rush inputs are added.
- **NFR-10 — Trunk-based workflow** ✅ Already satisfied — see `CLAUDE.md` → Architecture notes.

---

## Deliberately out of scope for v1

- Multiplayer / co-op.
- Mobile or touch controls.
- Achievements, save slots, or multiple player profiles.
- Localization (multi-language text).
- Warp pipes, underwater levels.
- A real-time **dynamic** day/night cycle system — note this is different
  from the game's fixed per-level time-of-day (Level 1 = day, Level 2 =
  sunset, Level 3 = night), which *is* in scope as level art, just not a
  live clock.
- Monetization or ads.
- **Fatigue System** *(from the design update)* — heavier-breathing
  animation/SFX after intense activity. Purely cosmetic, not tied to any
  gameplay mechanic; explicitly deferred.

**Reversed from the previous draft** (no longer out of scope, now planned):
- ~~Power-ups~~ — the new Energy/Rush/High Jump/Fart system *is* this game's
  version of power-ups, just resource-based rather than item-pickup-based.
- ~~Secret areas~~ — now explicitly in scope via High Jump secret locations
  (LEVEL-1, LEVEL-2).

---

## Open questions needing your decision

All 4 open questions from the first draft are resolved (damage rule, XP
terminology, invulnerability, pause menu) — none remain open right now.

Two low-stakes assumptions were made along the way instead of re-blocking on
them; flag either if wrong:
- **SCORE-2** — Large Bone's heal is capped at the starting max of 3 hearts (no bonus 4th heart).
- **SCORE-4** — Avocado's HP loss does *not* trigger the level-restart rule (that's for enemy/boss contact only); it just quietly reduces HP.

---

## Summary

**11 Epics, 57 features (52 active + 5 cut):**
- ✅ 9 already done or already satisfied (4 built + 5 NFRs met by existing config/process)
- 📝 2 spec'd but not yet built (the scoreboard pair)
- 🔲 41 backlog
- ❓ 0 open decisions (all resolved this round)
- ✂️ 5 cut/superseded (kept visible for traceability, not counted as active): MOVE-5, CHAR-5, SCORE-2-OLD, SCORE-5, LEVEL-4

Ready for your Epic-by-Epic review.
