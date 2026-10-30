# Orchestrator handoff 2: the complex builds (milestones G1, G2, G3)

Prepared 30 October 2026 for an orchestrating agent that builds the complex systems through subagents. Repository: https://github.com/7Donuts/crown-calamity (dependency-free browser RPG; `dist/` is source, not build output). Facts below were checked against `main` at commit `b42c729`, where `npm test` passes 361 tests.

The first handoff (`handoffs/ORCHESTRATOR.md`, tasks T1 to T5) is complete and merged: chapter-scaled affix costs, Sewing Kit region grouping, weapon family tags (data only), the phone-width audit (`handoffs/reports/phone-audit.md`) and the README test count.

## What this handoff covers

Milestones **G1** (finish the story balance), **G2** (combat identity) and **G3** (growth past level 50) from `ROADMAP.md`, built from the approved specs:

| Spec | System | Milestone |
| --- | --- | --- |
| IMPLEMENTATION-STATUS.md | Story balance, Chapter 3 to 5 prices, regional workshop economy | G1 |
| `design/46_Spec_Two_Hands.md` | Two hands, one verb; menders | G2 |
| `design/47_Spec_Weapon_Families.md` | Family traits and weapon-type mastery (the data slice is already done) | G2 |
| `design/48_Spec_Race_Identity.md` | Race identity | G2 |
| `design/49_Spec_Relic_Engine_v2.md` | Echo rule, older relic hooks, scaling rule, relic ranks, third relic slot | G2 and G3 |
| `design/50_Spec_Growth_and_Becoming_Real.md` | Effective level, post-story curves, Realness trials and choices | G3 |

**Out of scope:** milestones G4 and later (world and exploration, Hideaways, shared play), all online platform work (blocked by open decisions D9 and D10), and any new generated art (see "Art debt").

## How these differ from the first handoff

These tasks change combat, balance and saves. A wrong number or a weak test here costs far more than in the first batch. So:

- **Every task uses two subagents:** a **builder**, and an independent **reviewer** that sees only the spec, the diff and the test output, never the builder's summary (so it is not anchored on the builder's view).
- **Balance work uses a third role,** a **balance analyst** subagent that runs simulations and writes the evidence report. Builders do not tune numbers on instinct.
- **Four owner checkpoints** (CP1 to CP4) pause a dependency chain until the owner answers. Independent work continues meanwhile.
- **Specs are the contract.** If the build needs a different *number*, update the spec in the same PR and explain why with evidence. If it needs a different *rule*, stop and raise it at the next checkpoint.

## Your job as orchestrator

1. Run the tasks in the wave order below. Branch every task from the latest `main`; name branches `build/<task-id>` (for example `build/g2-1-two-hands-lab`).
2. For each task: give the builder its brief plus the shared rules and known traps; run the review gate; give the reviewer subagent the spec section, `git diff main...<branch>` and the test output; fix what the reviewer finds; then land it.
3. Land each task as its own PR with a merge commit, and merge before starting a task that depends on it. Never force-push `main`.
4. At a checkpoint, send the owner the checkpoint package and pause only the tasks that depend on it.
5. Stop a task and report if it fails the review gate twice, if a rule (not a number) must change, or if a save could lose data.
6. Keep `handoffs/reports/` current: one report per balance task, the art debt list, and a running `handoffs/reports/progress.md` with each task's status and PR link.

## Waves, dependencies and checkpoints

| Wave | Tasks | Notes |
| --- | --- | --- |
| 0 | C0 export cleanup, B0 balance harness (parallel) | Foundations for everything after |
| 1 | G1-A walkthrough and survivability, G1-C regional workshop economy, G1-B price analysis (parallel); then **CP1**; then G1-B implementation | G1-B changes a price rule in AGENTS.md, so it needs the owner |
| 2 | G2-1 two-hands lab prototype, then **CP2**; while waiting, G2-5 relic engine v2; after CP2, G2-2 two hands in the campaign, G2-3 family traits and mastery, G2-4 race identity, G2-6 integrated balance and **CP3** | Every G2 task edits `exchange` in `dist/engine.js`; run them one at a time in this order to avoid conflicts |
| 3 | G3-1 effective level and curves, G3-2 Becoming Real (trials, choices, third relic slot, interim hunting), G3-3 post-story balance fit and **CP4** | G3-2's interim hunting needs owner approval at CP3 |

## Shared rules for every subagent

- Read `AGENTS.md` first and obey it. Most relevant here:
  - IDs (items, enemies, contracts, abilities) and material save keys never change.
  - Existing local saves must load with nothing reset; invested stats, gear, relic licenses and roster characters are preserved. Change the save `VERSION` only if a field cannot be defaulted, and then import every earlier version.
  - One explicit input is one exchange. The shared 650 ms delay is untouched. Nothing is queued, timed or earned while away. Repetition is never penalized. Overkill never heals.
  - Rules live in pure modules with an injected clock and random source and no DOM or storage. Combat and the build inspector share one calculation (put formulas in `actionProfile` or a shared helper, never in UI code).
  - Interface: semantic text labels, touch targets of at least 48 × 48 px, light text on dark surfaces, phone check at 360 and 390 px.
  - No icons drawn with SVG paths, CSS shapes, emoji or Unicode pictograms; new items reuse existing generated atlas crops until art is generated (see "Art debt").
  - Buy and sell cycles never produce profit.
- Write tests first for every new rule; confirm they fail, then implement.
- Never weaken or delete an existing assertion to make a test pass. If a spec change makes an old assertion wrong, replace it with one asserting the new rule, and say so in the PR.
- No new dependencies in `package.json`. Simulation and browser scripts that are not part of the game live in `scripts/` (if they are repo tools) or outside the repository (if they are one-off).
- Hand back: branch, changed files, `npm test` summary, any spec numbers changed and why, and open questions.

## Known traps (read before writing code)

1. **Exporting through the engine.** UI and tests import the engine as a namespace (`import * as G from './engine.js'`). New shared helpers must be exported from `dist/engine.js` with an `import {...} from './x.js';` line followed by an `export {...};` line, which is how engine.js already re-exports gear, relic and telegraph helpers. Do not attach helpers as properties of other functions. Task C0 removes the one place this happened.
2. **Bundler.** `scripts-package.py` bundles modules with regular expressions. It does not support `export { x } from './y.js'` or `export default`. Use the import-then-export pattern.
3. **Test harnesses rewrite imports by exact string.** `tests/ui-smoke.test.mjs`, `tests/lab-ui.test.mjs` and `tests/shop-ui-harness.mjs` replace specific import lines in `dist/app.js` and `dist/lab-ui.js` with globals. A new import in those UI files needs a matching replacement in the harness.
4. **Pinned counts.** `tests/gear.test.mjs` and `tests/art.test.mjs` pin the catalog at 154 items; `tests/economy-scaling.test.mjs` pins `catalogCount` at 154; `tests/lab.test.mjs` pins 9 lab scenarios. Adding items or scenarios means updating these with the new rule, not deleting them.
5. **Every item needs art and a catalog row.** `tests/art.test.mjs` requires an `ITEM_ART` crop in `dist/item-art.js` for every item ID. Every relic needs a `RELIC_CATALOG` row in `dist/gear.js`, and every weapon a `WEAPON_FAMILIES` entry; both fail fast at load.
6. **The economy audit expects exactly ten items per nonweapon category** (`catalogAudit` in `scripts/weapon-economy.mjs`, loop over `['offhand', 'head', 'body', 'hands', 'feet', 'accessory']`). Menders are offhand items, so give them their own audit group (by a `kind: 'mender'` field) instead of breaking the offhand rule.
7. **`loadSave` keeps unknown fields** (`out = {...base, ...s}`). Any lab-only or preview flag on a character must be explicitly deleted in `loadSave`, with a test proving a campaign save cannot enable it.
8. **`exchange` in `dist/engine.js` is long and densely written.** Make small, surgical edits; add hook calls at the existing phases (after the player's action, the victory check, the enemy response, defeat, withdraw) the way the relic engine already does (`RE.afterPlayerAction`, `RE.afterEnemyResponse`, `RE.onVictory`). Re-run `tests/engine.test.mjs` and `tests/relic-engine.test.mjs` after every edit.
9. **The 85% prevention ceiling** (`TELEGRAPH.preventionCeiling` in `dist/telegraph.js`, applied in `resolveHit`) must hold for every new guard bonus (Steady, Warding, mender guard).
10. **`level` is used for scaling in many places** (resource totals, accuracy, powers, enemy access, victory XP factor, mastery qualification). G3-1 must list and convert every one.

## Review gate (run for every task)

1. **Scope:** the diff touches only what the brief allows.
2. **Numbers:** no number in `dist/` changed outside the brief; changed spec numbers carry evidence.
3. **Saves:** a test loads a save captured from current `main` (before the change) and checks that nothing is lost. Build the fixture with the engine and store it in the test, not in a file of player data.
4. **Tests:** run `npm test` yourself; all pass, and the new tests exist and assert the spec's acceptance criteria.
5. **Syntax:** `node --check` every changed `.js` and `.mjs` file.
6. **Packaging:** in a temporary copy outside the repository (copy `dist/`, `scripts-package.py`, `package.json`), `python3 scripts-package.py` prints `Packaged v...`; delete the copy; never commit generated downloads.
7. **Balance evidence** (balance tasks): the report in `handoffs/reports/` covers every gate named in the spec, with seeds, sample sizes and the command to reproduce.
8. **Phone check** (interface changes): no horizontal scroll and no touch target under 48 × 48 px at 360 and 390 px on the changed screens.
9. **Independent review:** the reviewer subagent's findings are fixed or answered in the PR.
10. **Docs:** the spec's "Documents to update when shipped" list is done.

## Balance evidence standard

- Use the shared harness from task B0. Every simulation states its seeds (at least 40 per cell), fixtures, policy and the exact command.
- A policy that ignores an available tool (Mend, Guard against a heavy, a relic) is not evidence a fight is unfair (IMPLEMENTATION-STATUS.md). Fix the policy before tuning numbers.
- Report the before and after for every gate. Commit reports as Markdown in `handoffs/reports/`; do not commit raw logs.

## Owner checkpoints

Each package is a short Markdown file in `handoffs/reports/` plus a summary in your message to the owner.

| Checkpoint | When | The owner decides | Package contents |
| --- | --- | --- | --- |
| **CP1** | After G1-B analysis | The Chapter 3 to 5 weapon and armor price curves (a new decision, D12), because the weapon formula is written in AGENTS.md | Two or three curve options with tier tables, hours of play per purchase, and continuity with the spec 50 post-story rule |
| **CP2** | After G2-1 | Whether two hands goes to the campaign as built, changes, or falls back to option C (design 44) | A packaged Playtest Lab build, the scenario to play on a phone, the lab questions, and simulation results |
| **CP3** | After G2-6 | Approval of the combined G2 balance, and of the interim post-story hunting proposal in G3-2 | The integrated balance report and the interim hunting proposal |
| **CP4** | After G3-3 | Final values for the D7 post-story curves | The fitted curves, gate results, and the Realness trial content for review |

Record each answer in the `ROADMAP.md` decision register in the same PR that acts on it.

## Art debt

Several tasks add items or encounters that need generated art (menders, ranked relic visuals, trial bosses). Generating art requires the `ART-DIRECTION.md` pipeline, which these subagents may not have. Until art exists, reuse existing atlas crops or enemy sprites, label nothing as final art, and add a line per placeholder to `handoffs/reports/art-debt.md` (item or enemy ID, placeholder used, what the final art should show).

## Task briefs

### C0: Clean up helper exports

**Goal.** Task T3 made `familyLabel`, `MATERIAL_CHAPTER`, `recipeRegion` and `WEAPON_FAMILIES` reachable by attaching them as properties of `materialLabel` in `dist/gear.js` (lines starting `materialLabel.MATERIAL_CHAPTER =` and so on), and `dist/app.js` reads `G.familyLabel || G.materialLabel?.familyLabel`. Replace that with proper exports before more helpers arrive.

**Steps.** Export the four helpers from `dist/engine.js` using the import-then-export pattern next to the existing gear re-exports; remove the `materialLabel.*` assignments; make `dist/app.js` use `G.familyLabel`, `G.recipeRegion` and the others directly; update any harness replacement this affects (trap 3).

**Tests.** A test that `G.familyLabel`, `G.recipeRegion`, `G.MATERIAL_CHAPTER` and `G.WEAPON_FAMILIES` exist on the engine namespace and that `materialLabel` has no extra properties. Full suite and packaging check.

### B0: Shared balance simulation harness

**Goal.** Every balance gate in specs 46 to 50 needs the same kinds of measurement. Build them once.

**Build** `scripts/balance-sim.mjs` (a repository tool, not part of the game), reusing `tests/sim-helpers.mjs` (`hero`, `mulberry`, `POLICIES`, `simulate`) and `scripts/weapon-economy.mjs` where possible. It must report, per fixture and enemy:
- win rate and defeats;
- net Stuffing lost per won fight, as a share of maximum (the design 43 method: chain fights from full Stuffing);
- exchanges per fight;
- expected damage per exchange (from `actionProfile`) and realized damage;
- healing by source (Mend, relics, menders, traits).

Fixtures must be configurable by kit, level, race, gear (including both hands), relics, ranks and mastery. Policies: the existing `strike`, `respond` and `disrupt`, plus a `sustain` policy that uses Mend and Recover sensibly. Output Markdown tables. Add a `npm run balance` script entry (no dependencies).

**Tests.** A small test that the harness runs one seeded cell and returns stable numbers for a fixed seed. Keep it fast.

### G1-A: Earned walkthrough and survivability

**Goal.** IMPLEMENTATION-STATUS.md items 1, 2, 3 and 5: a new character must be able to finish Chapters 1 to 5 by earning their way, with sensible choices, and the time to key purchases must be measured. `design/42_Campaign_Economy_Playtest.md` reports that seeded earned walkthroughs lose twice to the Chapter 1 delve boss and stop.

**Steps.**
1. Analyst: run `runCampaignWalkthrough` (in `scripts/weapon-economy.mjs`) for breaker, duelist and caster across 3 or more seeds. Improve the walkthrough policy first: buy and equip relics now that they are cheap (for example the Felt Vampire Fang at 60 coins), learn and use Mend, allocate some Vitality, guard heavies. Report where runs fail.
2. Builder: tune story values only where the improved policy still fails: enemy numbers in `dist/engine.js` and `dist/campaign-enemies.js`, contract rewards in `dist/story.js`, and resource formulas only if necessary. Do not change levels 1 to 9 XP requirements, the 68-point budget, four points per level, death or rest rules, or weapon prices (that is G1-B).
3. Measure first useful purchase, each chapter completion and the tier-10 weapon, with encounter-only and loot-selling income, using the documented input pace.

**Gates.** All three builds complete all five chapters on at least 2 of 3 seeds without their chapter's most expensive equipment; chapter completion times are reported (the owner's targets: Chapter 1 in 1 to 2 hours, the Chapter 2 tier-10 weapon in 8 to 12 active hours).

**Docs.** IMPLEMENTATION-STATUS.md, `design/42_Campaign_Economy_Playtest.md`, README.md.

### G1-B: Chapter 3 to 5 prices (analysis, CP1, then implementation)

**Goal.** IMPLEMENTATION-STATUS.md item 4, and the prerequisite in spec 50: weapon prices reach 129,155 at tier 15, 1.67 million at tier 20 and 21.5 million at tier 25, and armor follows `CATEGORY_BASE × 3.2^(tier − 1)`. Chapter income cannot support this, and spec 50 needs story tier 25 to meet the post-story rule (a layer's best gear costs about 2,000 on-level wins) without a cliff.

**Analysis (before CP1).** Propose two or three curves for weapon tiers 11 to 25 and armor tiers 5 to 10 that keep the tier-1 (100) and tier-10 (10,000) weapon endpoints, price each chapter's best gear at about the Chapter 2 tier-10 aspiration in hours of on-level play, and meet the spec 50 post-story rule at tier 25. Use measured income from G1-A. Show tier tables and hours per purchase.

**CP1.** The owner picks a curve; record it as D12 in `ROADMAP.md`.

**Implementation.** Change the price formulas in `dist/gear.js`, update the `catalogAudit` checks in `scripts/weapon-economy.mjs` that assert the old formula, update `tests/economy-scaling.test.mjs` (`audit.tiers[0].prices` and `audit.tiers[9].prices` stay 100 and 10,000) and rewrite the weapon price rule in AGENTS.md. Resale stays capped (`CHAPTER_SALVAGE`), so no profit loop appears.

### G1-C: Regional workshop economy

**Goal.** IMPLEMENTATION-STATUS.md "regional workshop economy": later upgrades and reforges still use Chapter 1 materials, later materials have no uses, and boss materials need uses.

**Steps.**
1. In `dist/gear.js`, `upgradeCost` picks materials only from `'Runic residue'`, `'Canal iron'`, `'Salvaged fittings'` and `'Repair fittings'`. Map each item's upgrade and affix materials to its own chapter's materials using `MATERIAL_CHAPTER`, keeping the same structure (one material kind; 2 at the third upgrade). Already-applied upgrades and affixes are never charged again.
2. Add a small set of regional exchanges in `EXCHANGES` (two or three per chapter) that turn local materials into the materials that chapter's recipes need. Boss materials: leave enough supply for relic ranks (spec 49 uses them); add at most one exchange per boss material.
3. Test every exchange and crafting loop: no cycle of exchanges, crafting and selling returns more coins or materials than it consumes.

**Tests.** Upgrade and affix materials match the item's chapter; existing upgrades load unchanged; a loop test over all `EXCHANGES` proves no profit cycle; the Sewing Kit groups new recipes by region (T2 behavior).

### G2-1: Two hands, Playtest Lab prototype (then CP2)

**Spec.** `design/46_Spec_Two_Hands.md`, "Build order" step 1, using the rules and numbers in that spec.

**Approach.** Build the real rules once, behind a flag that only lab fixtures can set:
1. A pure module `dist/hands.js`: second-hand kind classification, contribution per verb, off-hand hit profile and mend amount, from the spec tables.
2. In `dist/engine.js`, apply second-hand contributions inside the exchange and in `actionProfile` only when `s.rulesPreview?.twoHands === true`. In `dist/gear.js`, allow one-handed weapons and menders in `offhand` only under the same flag.
3. `loadSave` must delete `rulesPreview` (trap 7). Test that a campaign save with `rulesPreview.twoHands` set loads without it.
4. A `two_hands` lab scenario in `dist/lab.js` with four fixtures (weapon and shield, two weapons, weapon and mender, two-handed), following the Night Shift scenario pattern. Lab-only mender items may be defined in the lab fixture until G2-2 adds them to the catalog. Update the pinned scenario count.
5. Analyst: run the spec's balance gates with B0.

**CP2 package.** A packaged lab build, the questions from the spec ("is the second hand's contribution clear before the tap, and does play stay as fast on a phone?"), and the gate results.

### G2-5: Relic engine v2 (run while CP2 is pending)

**Spec.** `design/49_Spec_Relic_Engine_v2.md`, sections 1 to 4. Section 5 (third relic slot) is in G3-2.

**Notes.**
- Echo rule: in `dist/relics.js`, `relicBonuses` and the echo preview currently give a relic that is not in a core slot full strength on its first echo. Change both to the partial sequence for every relic. Add the one-time free-move flag to existing licenses; read `normalizeRelics` carefully, because it rewrites `copiesPaid` on load.
- Rescale the older relics' flat numbers as the spec's table says. They live in `dist/engine.js` (`recoverProfile` for the signet, `actionProfile` for the Amber Marble, the useful-Guard block for the Seal, Spool and Thimble, and `victory` for the Heart, Bell and Lucky Button) and in `dist/relics.js` `RELIC_EFFECTS` text. Add their Pluck hooks in `dist/relic-engine.js`.
- Ranks: a `relicRanks` field, the rank cost table, a Sewing Kit section for ranks, and the rank multiplier applied through effect strength.
- `tests/relic-effects.test.mjs` asserts the old flat numbers: replace those assertions with the new rule, as the shared rules require.

**Gates.** The spec's three balance gates, using B0.

### G2-2: Two hands in the campaign (after CP2)

Remove the `rulesPreview` flag so two hands applies to everyone, add the ten menders to the catalog (spec 46 "Numbers"), give menders their own audit group (trap 6), add art crops and art debt lines (trap 5), update pinned counts (trap 4), rename the interface labels to Main hand and Second hand, and show second-hand contributions on action buttons, in feedback and in the inspector. If the owner changed anything at CP2, update spec 46 first.

### G2-3: Weapon family traits and mastery

**Spec.** `design/47_Spec_Weapon_Families.md`, traits, second-hand behavior and weapon-type mastery (the data slice is done). Put trait numbers and mastery rules in a pure module (for example `dist/weapon-families.js`) and keep `WEAPON_FAMILIES` in `dist/gear.js` as the single source of membership. Track which families dealt damage during a fight on the fight object, and award marks in `victory` next to the existing ability-mastery loop. Steady and Warding go through `resolveHit` so the 85% ceiling holds (trap 9). Add a weapon mastery panel to the character sheet and a family filter to the shop.

### G2-4: Race identity

**Spec.** `design/48_Spec_Race_Identity.md` (racial growth is not adopted; do not build it). Add `trait`, `pluckHook`, `affinity` and `homeLayer` to `dist/races.js`; new spreads apply to new characters only; existing characters keep their stats. Write traits as hooks beside the relic hooks. Every character now has a Pluck source, so the Pluck HUD shows for everyone: update the relic-engine test that asserts Pluck is hidden without an engine relic so it asserts the new rule. Nine Lives runs before the defeat penalty; test it with Withdraw. Home-layer bonuses do nothing until layers exist (G4); implement the rule and test it with a synthetic layer value. Update the character creator (`dist/character-creator.js`, `tests/creator.test.mjs`) and the character sheet.

### G2-6: Integrated combat balance (then CP3)

Analyst and builder together: run the gates of specs 46 to 49 as one matrix (five races, four hand pairings, the nine families, with and without a planned relic pair) across Chapters 1 to 5, tune only numbers the specs mark as tunable, write the final numbers back into the specs, and produce the CP3 package.

### G3-1: Effective level and post-story curves

**Spec.** `design/50_Spec_Growth_and_Becoming_Real.md`, "Curves" and "Data and saves". Add `realness` and computed effective level; post-story XP need; a pure growth module for enemy, coin and gear curves. Convert every scaling use of `level` to effective level (trap 10); list each one in the PR. Save validation keeps `level` at 1 to 50.

### G3-2: Becoming Real

**Spec.** Spec 50 "Player rules", "Realness trials", "Realness choices", plus spec 49 section 5 (`relic3`, which adds an eleventh equipment slot: update the slot diagram, slot tests and AGENTS.md). Trials are authored contracts with new IDs in `dist/story.js`, following the existing contract rules. Trial enemies reuse existing sprites with curve-based stats (art debt).

**Interim hunting (needs CP3 approval).** After Realness 1 the displayed level returns to 1 but effective level is 51 or more, and the first post-story layer arrives only in G4. Without a bridge, a Realness 1 character has nothing on level to fight. Proposal for the owner at CP3: "Echoes of the Underfoot", existing Underfoot enemies re-fought at curve-based stats for the character's effective level, clearly labeled as temporary until G4. If the owner declines, G3 ships behind a lab flag until G4.

### G3-3: Post-story balance fit (then CP4)

Fit the spec 50 starting curves to its balance gates with B0 at effective levels 60, 100, 200 and 500, write the fitted values back into spec 50, and prepare the CP4 package.

## Final report to the owner

When the waves finish or you stop: each task's PR link or stop reason; every checkpoint's outcome; the final `npm test` summary on `main`; the balance reports' headline results; the art debt list; and any spec number changed, with its evidence.
