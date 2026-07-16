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
kept as Cut) per explicit request. **A third pass (this one) split the scope
into `[Alpha]` and `[Beta]` milestones** — see the Scope legend below and
`CLAUDE.md` → "Project phases: Alpha & Beta" for the authoritative Alpha slice.

**How this relates to the other planning docs:**
- `Bulldog-8Bit-Roadmap.md` — the narrative, learn-as-you-go build plan (why/how to approach each phase). Reframed around Alpha-first, then Beta.
- `Bulldog-8Bit-Checklist.md` — the phase-by-phase build-order tracker. Restructured into an Alpha block and a Beta block; phases reference these WBS IDs and carry the SDLC mini-loop + basic test checklist.
- **This file** — the requirements catalog those two pull from: every feature
  that could exist, grouped by Epic, with a status **and a scope tag**. When you
  approve a feature here, it gets its own file in `specs/` (using
  `specs/_TEMPLATE.md`) and enters the Checklist's build order.

**Status legend:**
- ✅ **Done** — built and tested.
- 📝 **Spec written** — a full spec exists in `specs/`, not yet built.
- 🔲 **Backlog** — agreed to be in scope, not yet spec'd or built.
- ❓ **Needs decision** — a genuine open question, flagged so it's a conscious choice, not a default.
- ✂️ **Cut** — was in scope, superseded or removed by the design update. Kept visible with a reason, not deleted.

**Scope legend (new):**
- `[Alpha]` — part of the thin vertical slice that ships first (one level proving
  the core loop). See `CLAUDE.md` → "Project phases".
- `[Beta]` — deferred until after Alpha ships (the user expects to trim Beta
  further later).
- `✂️ Cut` items carry no scope tag — they're out of scope entirely, orthogonal
  to the Alpha/Beta split.

**How to review:** go Epic by Epic, and for each feature reply with
**Approve** / **Defer** (keep in backlog, not now) / **Cut** (drop entirely)
/ **Modify** (tell me what changes). Approved features get spec'd one at a
time via the existing spec-driven loop.

---

## Epic 1 — MOVE: Core Movement & Physics

- **MOVE-1 — Left/right movement** ✅ Done `[Alpha]`
  As a player, I want to walk left/right with the arrow keys, so that I can navigate the level.
  Spec: `specs/player-physics.md`

- **MOVE-2 — Single jump** ✅ Done `[Alpha]`
  As a player, I want to jump with spacebar, so that I can reach platforms and clear obstacles.
  Spec: `specs/player-physics.md`

- **MOVE-3 — Ground collision** ✅ Done `[Alpha]`
  As a player, I want to land and stand on solid ground, so that I don't fall through the floor.
  Spec: `specs/player-physics.md`

- **MOVE-4 — Variable jump height** 🔲 Backlog `[Beta]`
  As a player, I want holding jump longer to jump higher, so that I have finer control over platforming. Distinct from the new High Jump special ability (ABILITY-3) and from Double Jump (MOVE-7) — this is about the *standard* jump's feel, not a resource-costing move or an extra air jump.

- **MOVE-5 — Fall-into-pit death** ✂️ Cut
  Was: lose a life falling into a pit, needed for the old "Sewer Scramble" level. The new level design (Street/House, no underground/pit level) doesn't call for it. Re-open if a future level wants pits.

- **MOVE-6 — Crawl** 🔲 Backlog `[Beta]` *(new)*
  As a player, I want to lower my body and crawl, so that Cats can't detect me, and so I can duck under the Giant Cat boss's fish projectiles. One input, two uses — worth spec'ing both at once.

- **MOVE-7 — Double jump** ✅ Done `[Alpha]` *(new)*
  As a player, I want to trigger exactly one extra jump while already airborne (spacebar again), so that I can reach higher platforms. Included in Alpha as a **stand-in to test the High Jump feel** before the Energy-costing High Jump (ABILITY-3) exists. Spec: `specs/double-jump.md` (amends `specs/player-physics.md`). Built: an `airJumpsUsed` counter in `src/physics/player.js` (unit-tested); ledge walk-off spends the one air jump (no coyote time). Merged to `main` (PR #4). Distinct from MOVE-4 (variable height) and ABILITY-3 (Energy-costing High Jump).

---

## Epic 2 — CHAR: Player Character & Customization

- **CHAR-1 — Placeholder player rectangle** ✅ Done `[Alpha]`
  As a developer, I want a simple placeholder shape with the right physics body, so that movement can be built and tested before real art exists.

- **CHAR-2 — Bulldog sprite + animations** ✅ Done `[Alpha]` *(scope split)*
  As a player, I want to see an animated bulldog instead of a rectangle, so that the game looks and feels real. **Alpha needs only idle, run, and jump** — the ClickUp story for this feature (`869e4tfwc`) explicitly puts the **hurt** frame out of scope here; it's owned entirely by `CHAR-3`. The **crawl, fart-attack, and rush** frames are `[Beta]` (see CHAR-6/7/8). Spec: `specs/character-sprite.md`. Built: sprite + idle/run/jump animations, `src/assets/buldog.png`, animation/facing logic unit-tested in `src/physics/animation.js`. Merged to `main`.

- **CHAR-3 — Hurt animation frame** 🔲 Backlog `[Alpha]`
  As a player, I want a squashed "hurt" frame shown when I take a hit, so that damage reads clearly. Needed in Alpha because Alpha has the 3-hearts damage model.

- **CHAR-4 — Bulldog color select (white/black/red)** ✅ Done `[Alpha]`
  Spec: `specs/color-select.md`. Pure cycle/tint rules in
  `src/state/color-select.js` (unit-tested); a temporary `C` key cycles the
  color on the placeholder until the start screen (UI-1/UI-2) drives it. "Red" is
  a warm foxy ginger. Merged in PR #2.

- **CHAR-5 — Brief invulnerability after damage** ✂️ Cut *(resolved: not needed)*
  Confirmed that every hit — regular enemy or the Giant Cat's fish projectile —
  costs a heart and restarts the level (ENEMY-3), **including in Alpha**. Since a
  hit always removes the player from danger (restart), there's no window where a
  second hit could land right after the first; i-frames would have nothing to
  protect against. Revisit only if a future damage source is added that *doesn't*
  restart the level.

- **CHAR-6 — Idle personality animation (snore loop)** 🔲 Backlog `[Beta]` *(new)*
  As a player, I want the Bulldog to start snoring if left idle long enough, so that his "loves sleeping" personality shows even outside cutscenes.

- **CHAR-7 — Fart Attack animation + VFX/SFX** 🔲 Backlog `[Beta]` *(new)*
  As a player, I want a visible/audible fart-attack (turn-around animation, ~1s delay, effect, sound), so that the attack reads clearly and feels characterful, not just as a hitbox appearing.

- **CHAR-8 — Bulldog Rush "out of control" visual** 🔲 Backlog `[Beta]` *(new)*
  As a player, I want the Bulldog to visibly wobble/blur during a Rush, so that "hard to steer" is communicated visually, not just mechanically.

---

## Epic 3 — ABILITY: Special Abilities & Resources *(new epic)* — all `[Beta]`

Resource-costing moves layered on top of core movement. Owns the *moves*;
Epic 6 (STATE) owns the underlying HP/Energy pools they draw from. **The whole
epic is `[Beta]`** — Alpha ships without abilities (its Double Jump lives in
MOVE-7, not here).

- **ABILITY-1 — Fart Attack** 🔲 Backlog `[Beta]`
  As a player, I want an unlimited-use fart attack (turn around first, ~1s delay) that neutralizes Cats and Angry Pomeranians in range, so that I have a free ranged option against most enemies. Does not work on the Robot Vacuum Cleaner.

- **ABILITY-2 — Bulldog Rush** 🔲 Backlog `[Beta]`
  As a player, I want to spend 3 Energy to launch into an uncontrolled high-speed sprint that destroys everything in my path, so that I can clear large enemy groups. Hard to steer by design. Unlocked partway through Level 2 (see LEVEL-2).

- **ABILITY-3 — High Jump** 🔲 Backlog `[Beta]`
  As a player, I want to spend 1 Energy on a high jump, so that I can reach secret areas and bonus collectibles. (Alpha's Double Jump, MOVE-7, is the temporary stand-in used to test this feel.)

---

## Epic 4 — ENEMY: Enemies & Combat

- **ENEMY-1 — Angry Pomeranian** 🔲 Backlog `[Alpha]` *(Alpha uses a trimmed version)*
  As a player, I want a patrolling Angry Pomeranian that costs me a heart (and restarts the level) on contact but can be defeated, so that I have a fast enemy to respect. **Alpha ships a trimmed version as its single "simple enemy":** it patrols and is defeated by **Stomp only** (ENEMY-4); Fart Attack / Bulldog Rush kill paths are `[Beta]`, and contact follows the confirmed damage rule (ENEMY-3 / STATE-1: 1 heart + level restart, no i-frames). The full multi-kill-path version is `[Beta]`.

- **ENEMY-2 — Cat** 🔲 Backlog `[Beta]` *(behavior redefined)*
  As a player, I want Cats that move in short hops with pauses, appearing on platforms/ground/elevated spots, costing me a heart (and restarting the level) on contact but defeatable by Stomp, Fart Attack, or Bulldog Rush, so that positioning and timing matter. Can't detect me while I'm crawling (MOVE-6).

- **ENEMY-3 — Contact damage rule (level restart)** 🔲 Backlog `[Alpha]` *(confirmed: 1 heart + level restart)*
  As a player, when I'm hit by any enemy — Angry Pomeranian, Cat, Robot Vacuum Cleaner, or the Giant Cat boss's fish projectile — I lose 1 heart and the current level restarts from the beginning (heart count carries over, doesn't refill). At 0 hearts, the run ends. Same rule everywhere, no per-enemy or boss exception. **Applies from Alpha** (Alpha's simple enemy uses it); the Beta enemies/boss just reuse the same rule. See STATE-1/STATE-3.

- **ENEMY-4 — Stomp-to-defeat + bounce** 🔲 Backlog `[Alpha]`
  As a player, I want to defeat an enemy by landing on its head and bounce slightly afterward, so that stomping feels responsive. **In Alpha, stomp is the only kill method** (against the ENEMY-1 simple enemy). Full applicability (Angry Pomeranian, Cat, Robot Vacuum from above; not the Giant Cat boss) is `[Beta]`.

- **ENEMY-5 — Robot Vacuum Cleaner** 🔲 Backlog `[Beta]` *(new)*
  As a player, I want a fast robot vacuum in Level 3 that actively chases me and costs me a heart (and restarts the level) on contact, defeatable only by a stomp-from-above or Bulldog Rush (not Fart Attack), so that House levels feel different from Street levels.

- **ENEMY-6 — Boss: Giant Cat** 🔲 Backlog `[Beta]` *(replaces Big Cat, now with real numbers)*
  As a player, I want a boss fight at the end of Level 3 against a Giant Cat with 6 health segments that throws fish projectiles I can duck under, so that the game has a real climax. Bulldog Rush deals 2 segments, Fart Attack deals 1 — no stomp damage. Getting hit by a fish projectile follows ENEMY-3's rule (heart lost, Level 3 restarts).

---

## Epic 5 — SCORE: Collectibles & Scoring

- **SCORE-1 — Small Bone** ✅ Done `[Alpha]`
  As a player, I want to collect Small Bones that raise my score, so that exploring is rewarded. **In Alpha the score is simply the count of Small Bones collected** (shown next to the level timer, SCORE-7, in the results window, UI-5). Spec: `specs/small-bones.md`. Built: animated bone (`src/assets/bone.png`), touch-to-collect via overlap, pickup blip (AUDIO-3), pure score rules in `src/state/score.js` (unit-tested), score mirrored into the Phaser registry for UI-3/UI-5. Two bones placed provisionally (final layout with LEVEL-6); temporary debug counter + `R` refresh key until UI-3 lands.

- **SCORE-2 — Large Bone** 🔲 Backlog `[Beta]` *(updated: "+1 XP" confirmed to mean +1 HP)*
  As a player, I want Large Bones worth double a Small Bone's score and healing +1 HP (one heart), so that finding the rarer pickup feels more valuable. Assumption: healing is capped at the starting max of 3 hearts — flag if it should grant a bonus heart beyond that.

- **SCORE-2-OLD — Extra life at 100 bones** ✂️ Cut
  The new design has no "extra life" milestone or general "lives" concept — replaced by the HP-heart system (STATE-1) and the Score/Energy resources.

- **SCORE-3 — Dog Toy** 🔲 Backlog `[Beta]` *(new)*
  As a player, I want Dog Toy pickups that grant +1 Energy, so that I can refill Energy to use Bulldog Rush / High Jump again. Currently the only known Energy source (see STATE-2).

- **SCORE-4 — Avocado (hazard pickup)** 🔲 Backlog `[Beta]` *(updated: "-0.5 XP" confirmed to mean -0.5 HP)*
  As a player, I want Avocados that reduce my HP by 0.5 (half a heart) if collected — two Avocados cost a full heart — so that not every pickup in the level is purely beneficial. Assumption: this quietly reduces HP without triggering the level-restart rule (ENEMY-3), since it's a pickup mistake, not an enemy hit — flag if it should restart the level too.

- **SCORE-5** ✂️ Cut — *terminology resolved, not a real feature*
  Was "what does XP do?" The design notes' "XP" turned out to mean HP/hearts (a translation artifact), not a separate experience system — see SCORE-2/SCORE-4 above. No separate XP resource exists; nothing left to build here.

- **SCORE-6 — Score persists across levels** 🔲 Backlog `[Beta]`
  As a player, I want my score to carry over from Level 1 to Level 2 to Level 3, so that the whole run feels connected. `[Beta]` — Alpha is a single level, so there's nothing to persist across yet.

- **SCORE-7 — Level timer / elapsed time** 🔲 Backlog `[Alpha]` *(new)*
  As a player, I want to see the total time elapsed for the level, so that I have a second performance metric alongside the bone count. Shown live in the HUD (UI-3) and summarized in the results window (UI-5).

---

## Epic 6 — STATE: Health, Energy & Game State *(renamed from "Lives & Game State")*

- **STATE-1 — Health system (3 HP hearts)** 🔲 Backlog `[Alpha]` *(rule confirmed)*
  As a player, I want 3 HP shown as hearts, so that I have a visible health buffer. **Confirmed damage rule (applies from Alpha):** getting hit by any enemy costs 1 heart and restarts the current level from the beginning — reduced heart count carries over, doesn't refill on restart. 0 hearts → Game Over (STATE-3). No i-frames (see CHAR-5). Classic-Mario-style, not instant game-over on first contact. See ENEMY-3 for the shared rule text.

- **STATE-2 — Energy system (3 segments)** 🔲 Backlog `[Beta]` *(new)*
  As a player, I want a 3-segment Energy pool spent by Bulldog Rush (3) and High Jump (1), refilled only by Dog Toy pickups (SCORE-3), so that those abilities feel like a resource to manage, not a free spam option. Assumption: no passive regen — flag if wrong.

- **STATE-3 — Game Over** 🔲 Backlog `[Alpha]` *(trigger confirmed)*
  As a player, I want a clear Game Over when my hearts reach 0, so that I know the run ended. In Alpha, Game Over routes to the same results window (UI-5) that the goal marker uses.

- **STATE-4 — Victory / Ending** 🔲 Backlog `[Beta]` *(scene redefined)*
  As a player, I want a proper ending after defeating the Giant Cat — walking to the bedroom, climbing into bed beside his humans, falling asleep and snoring, then end credits — so that finishing the game feels like a real story beat, not just a screen. (Alpha's "ending" is just the results window at the goal marker; the narrative ending is `[Beta]`.)

---

## Epic 7 — LEVEL: Levels & Progression

- **LEVEL-1 — Level 1: The Walk** 🔲 Backlog `[Beta]` *(replaces Backyard Bounce)*
  Street, daytime. Angry Pomeranians + Cats. 2 Energy pickups; 2 High Jump secret locations with bonus bones. Ends at a water bowl (Bulldog drinks). This is the *fuller* Level 1 — `[Beta]`. Alpha's single level is the trimmed LEVEL-6.

- **LEVEL-2 — Level 2: The Journey Home** 🔲 Backlog `[Beta]` *(replaces Sewer Scramble)*
  Street, sunset. Angry Pomeranians + Cats. **Bulldog Rush unlocks here.** 3 Energy pickups + 2 more near the finish; 2 High Jump secrets; 1 Large Bone. Large enemy groups near the end. Ends with the Bulldog drinking water and entering the house.

- **LEVEL-3 — Level 3: Home Sweet Home** 🔲 Backlog `[Beta]` *(replaces Rooftop Rush)*
  House, night. Robot Vacuum Cleaners, and Cat+Vacuum combinations. Boss: Giant Cat. Final scene: defeat the boss → walk to the bedroom → climb into bed with his humans → fall asleep, snoring → end credits roll.

- **LEVEL-4 — Generic sofa reward per level** ✂️ Cut
  Was: identical "jump onto a sofa and sleep" animation after every level. Replaced by three distinct, narrative endings (water bowl in L1, entering the house in L2, bedroom + credits in L3) — see LEVEL-1/2/3.

- **LEVEL-5 — Full scene flow / progression** 🔲 Backlog `[Beta]`
  As a player, I want the game to move automatically from Title → Level 1 → Level 2 → Level 3 → Ending/Credits, so that it feels like one continuous experience. The full multi-level flow is `[Beta]`; Alpha's minimal flow (Start screen → the one level → results window) is part of LEVEL-6.

- **LEVEL-6 — Alpha level (single platforming level + goal marker)** 🔲 Backlog `[Alpha]` *(new)*
  As a player, I want one complete platforming level I can play start to finish, so that the core loop is proven end-to-end. Contains platforms, Small Bones (SCORE-1), the simple stompable enemy (ENEMY-1/4), the 3-hearts model (STATE-1), and a plain **goal marker** at the end that opens the results window (UI-5). No narrative ending, no secrets, no Energy/abilities. Minimal scene flow: Start screen (UI-1/UI-2/CHAR-4) → this level → results window.

---

## Epic 8 — UI: Meta UI (Title, HUD, Input)

- **UI-1 — Start / title screen** 🔲 Backlog `[Alpha]` *(Alpha uses a minimal version)*
  As a player, I want a screen before the level where I set up my run. **Alpha needs only a minimal start screen** hosting nickname entry (UI-2) + color select (CHAR-4) + a "start" action. The fuller, art-directed arcade title screen is `[Beta]`.

- **UI-2 — Arcade-style nickname entry** 🔲 Backlog `[Alpha]`
  As a player, I want to type a short nickname before playing (no login), so that my result is labelled as mine. Shown again in the results window (UI-5).

- **UI-3 — In-game HUD** 🔲 Backlog `[Alpha]` *(scope split)*
  As a player, I want to see my status while playing. **Alpha HUD:** HP hearts, bone count (score), and the level timer (SCORE-7). The **Energy segments** display is `[Beta]` (no Energy in Alpha).

- **UI-4 — Pause menu** 🔲 Backlog `[Beta]` *(deferred out of Alpha)*
  As a player, I want to pause and resume the game, so that I can step away mid-level. Explicitly removed from the Alpha slice.

- **UI-5 — End-of-level results window** 🔲 Backlog `[Alpha]` *(new)*
  As a player, I want a simple window at the end of the level showing my **nickname**, the **number of bones collected**, and the **total elapsed time**, so that I get closure on my run. Opened by both the goal marker (LEVEL-6) and Game Over (STATE-3). Local only — no backend. This is Alpha's stand-in for the online scoreboard (BOARD-1).

---

## Epic 9 — BOARD: Scoreboard / High Scores — all `[Beta]`

- **BOARD-1 — Online scoreboard** 📝 Spec written, not yet built `[Beta]`
  Spec: `specs/scoreboard.md`. Submits **Score** (no separate XP resource exists — see SCORE-5). Explicitly removed from the Alpha slice; Alpha shows a local results window (UI-5) instead.

- **BOARD-2 — Local high-score cache fallback** 📝 Covered by BOARD-1's spec `[Beta]`

---

## Epic 10 — AUDIO: Audio — mostly `[Beta]` *(one Alpha exception: AUDIO-3)*

- **AUDIO-1 — Background music** 🔲 Backlog `[Beta]`
  Optionally distinct per level's time-of-day (day / sunset / night) — a nice-to-have, not required.

- **AUDIO-2 — Sound effects (full pass)** 🔲 Backlog `[Beta]` *(list expanded)*
  As a player, I want SFX for: jump, high jump, fart attack, rush start, stomp, hurt, Large Bone pickup, Dog Toy pickup, Avocado ("yuck"), idle snore, water-bowl drink (L1 ending), door open (L2 ending), boss fish throw/hit, and a victory/credits jingle. The full audio pass is a Beta polish step. *(The **Small Bone pickup** blip moved out of this list into AUDIO-3 — it ships in Alpha.)*

- **AUDIO-3 — Basic pickup SFX (Small Bone)** ✅ Done `[Alpha]` *(new — scope change, approved 2026-07-16)*
  As a player, I want a short 8-bit blip when I collect a Small Bone, so that the pickup feels responsive. **Moved into Alpha** (the rest of the AUDIO epic stays `[Beta]`) — a deliberate exception to "Alpha ships silent", because the pickup reads as unfinished without it. Built as part of `SCORE-1`: `src/assets/bone-pickup.wav` played via Phaser's built-in audio (no new library). Spec: `specs/small-bones.md`.

---

## Epic 11 — NFR: Non-Functional Requirements

Cross-cutting; these apply across **both** phases. Each is tagged with the phase
where it first matters (the "already satisfied" ones hold for Alpha).

- **NFR-1 — Performance** 🔲 Backlog `[Alpha]` — smooth 60fps on a typical modern laptop browser.
- **NFR-2 — Browser compatibility** 🔲 Backlog `[Alpha]` — current Chrome/Firefox/Safari/Edge, desktop only for v1.
- **NFR-3 — Crisp pixel-art rendering** ✅ Already satisfied `[Alpha]` — `pixelArt: true` + `Scale.FIT`.
- **NFR-4 — CI must stay green** ✅ Already satisfied `[Alpha]` — see `CLAUDE.md` → Architecture notes.
- **NFR-5 — Unit test coverage for logic, not rendering** ✅ Already satisfied `[Alpha]` — see the `story-unit-tests` skill.
- **NFR-6 — Persistence must degrade gracefully** 🔲 Backlog `[Alpha]` — no crash if `localStorage` is unavailable (applies once the results window caches anything locally).
- **NFR-7 — No secrets in front-end code** 🔲 Backlog `[Beta]` (applies once BOARD-1 is built) — public/anon keys only.
- **NFR-8 — Deployability** 🔲 Backlog `[Alpha]` — static build, deployable to any static host (needed to ship the Alpha slice).
- **NFR-9 — Keyboard-only playability** ✅ Already satisfied `[Alpha]` — arrows + spacebar cover everything today; keep true as new inputs are added.
- **NFR-10 — Trunk-based workflow** ✅ Already satisfied `[Alpha]` — see `CLAUDE.md` → Architecture notes.

- **NFR-11 — Full-screen responsive scaling** ✅ Done `[Alpha]` *(new — raised
  during `CHAR-2` playtest, fixed same-day rather than deferred to Beta)*
  As a player, I want the game to fill my browser window (with a fullscreen
  toggle), like browser Mario clones such as `supermarioplay.com` (user
  reference), instead of staying locked to a small fixed 320×240×2 canvas.
  Fixed by giving `#game` a real size (`100vw`/`100vh` in `index.html`,
  previously unset, which is why `Scale.FIT` had nothing to fit into) and
  dropping the fixed `zoom: 2` so `Scale.FIT` scales the 320×240 canvas up to
  whatever the window's size actually is, letterboxed to preserve the 4:3
  aspect ratio and pixel-art crispness (`NFR-3`). Centering is handled solely
  by Phaser's `autoCenter: CENTER_BOTH` (no CSS flexbox — the two stacked and
  pushed the canvas off-center; and in fullscreen the canvas itself becomes
  the fullscreen element, so only Phaser's own centering applies there).
  Fullscreen toggle: an F key and an on-screen button (`#fullscreen-btn`),
  both calling `game.scale.toggleFullscreen()`, with a `refresh()` on the
  enter/leave events so the canvas re-centers after the transition. Merged to
  `main`.

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
  version of power-ups, just resource-based rather than item-pickup-based (`[Beta]`).
- ~~Secret areas~~ — now explicitly in scope via High Jump secret locations
  (LEVEL-1, LEVEL-2) — `[Beta]`.

---

## Open questions needing your decision

All 4 open questions from the first draft are resolved (damage rule, XP
terminology, invulnerability, pause menu) — none remain open right now.

Decisions/assumptions made during the Alpha/Beta split (flag any if wrong):
- **STATE-1 / ENEMY-3 / CHAR-5** — Alpha uses the **confirmed damage rule
  as-is**: a hit costs 1 heart **and restarts the level**, no i-frames (CHAR-5
  stays cut). *(Confirmed by the user.)*
- **ENEMY-1** — Alpha's "simple enemy" is a trimmed Angry Pomeranian: patrol +
  stomp-only kill. *(Confirmed by the user.)*
- **SCORE-1** — Alpha's score is a plain bone count; Large Bone (and its HP heal)
  is `[Beta]`.
- **UI-5 / STATE-3** — Game Over and reaching the goal both open the same local
  results window (nickname + bones + time).

Carried-over assumptions from the redesign:
- **SCORE-2** — Large Bone's heal is capped at the starting max of 3 hearts (no bonus 4th heart).
- **SCORE-4** — Avocado's HP loss does *not* trigger the level-restart rule (that's for enemy/boss contact only); it just quietly reduces HP.

---

## Summary

**11 Epics, 63 features (58 active + 5 cut):** *(+1: AUDIO-3, new Alpha SFX exception)*
- ✅ 15 done or already satisfied (10 built features — MOVE-1/2/3/7, CHAR-1/2/4, SCORE-1, AUDIO-3, NFR-11 — plus 5 NFRs met by existing config/process)
- 📝 2 spec'd but not yet built (the scoreboard pair, both `[Beta]`)
- 🔲 41 backlog
- ❓ 0 open decisions (all resolved)
- ✂️ 5 cut/superseded (kept visible for traceability, not counted as active): MOVE-5, CHAR-5, SCORE-2-OLD, SCORE-5, LEVEL-4

**Scope split (active features):**
- `[Alpha]` (the vertical slice): MOVE-1/2/3/7, CHAR-1/2/3/4, ENEMY-1/3/4,
  SCORE-1/7, STATE-1/3, LEVEL-6, UI-1/2/3/5, AUDIO-3, and the Alpha-tagged NFRs
  (1/2/3/4/5/6/8/9/10/11). Of these, MOVE-1/2/3/7, CHAR-1/2/4, SCORE-1,
  AUDIO-3, NFR-11, and the other ✅ NFRs are done — the rest (CHAR-3,
  ENEMY-1/3/4, SCORE-7, STATE-1/3, LEVEL-6, UI-1/2/3/5, NFR-1/2/6/8) are the
  Alpha build backlog.
- `[Beta]` (deferred, may be trimmed further): everything else — MOVE-4/6,
  CHAR-6/7/8, the whole ABILITY epic, ENEMY-2/5/6, SCORE-2/3/4/6, STATE-2/4,
  LEVEL-1/2/3/5, UI-4, the BOARD epic, AUDIO-1/2, and NFR-7.

Ready for your Epic-by-Epic review.
