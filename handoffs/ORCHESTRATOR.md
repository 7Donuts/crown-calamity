# Orchestrator handoff: five small tasks for subagents

Prepared 30 October 2026 for an orchestrating agent that delegates each task to a subagent, reviews the result, and lands it. Repository: https://github.com/7Donuts/crown-calamity (a dependency-free browser RPG; `dist/` is source, not build output). Every fact below was checked against `main` at commit `de45d1e`.

## Your job as orchestrator

1. Run the five tasks below in the wave order given, one subagent per task.
2. Give each subagent its brief exactly as written in "Subagent briefs", plus the shared rules.
3. Review each result against the review gate before it lands. You own correctness; do not trust a subagent's report without checking.
4. Land each task as its own pull request and merge it before starting any task that depends on it.
5. Stop and report to the owner if a task fails the review gate twice, or if a subagent wants to change anything outside its scope.
6. Finish with the report described at the end.

## Waves and dependencies

| Wave | Tasks | Why this order |
| --- | --- | --- |
| 1 | T1 affix costs, T2 Sewing Kit grouping (in parallel) | T1 changes `dist/gear.js` rules and tests; T2 changes the Sewing Kit view in `dist/app.js` and its CSS. They do not overlap. |
| 2 | T3 weapon family tags | Touches `dist/gear.js`, `dist/market-ui.js` and `dist/app.js`; start it only after T1 and T2 are merged, from the new `main` |
| 3 | T4 phone-width audit | Audits the interface after T1 to T3 have landed |
| 4 | T5 README test count | Needs the final test count after everything else has merged; small enough to do yourself |

Before each wave, update local `main` and branch from it.

## Shared rules for every subagent (include these in every brief)

- Read `AGENTS.md` first and obey it. Highlights that apply here:
  - Item, enemy, contract and ability IDs and material save keys never change.
  - Preserve save compatibility: existing local saves must load with nothing reset. Do not change the save format version.
  - Keep calculations shared between the engine and the build inspector; do not duplicate a formula in the interface.
  - Mobile first: semantic text labels, touch targets at least 48 × 48 px, light text on dark surfaces.
  - Never draw icons with SVG paths, CSS shapes, emoji or Unicode pictograms. Only generated raster art.
  - Buy and sell cycles must never create profit.
- Change only what your brief says. No balance numbers, prices, damage, XP or rewards change unless the brief names them.
- Do not add dependencies to `package.json`. Any helper script (for example a browser check) lives outside the repository.
- Write the test first where the brief asks for a new rule. Run it, confirm it fails, then implement and confirm it passes.
- Run `npm test` (Node 22.8 or newer) and `node --check` on every JavaScript file you changed. Both must be clean before you hand back.
- Tests use an injected clock. Never add real waits.
- Hand back: the branch name, the list of changed files, the `npm test` summary lines (`# tests`, `# pass`, `# fail`), and anything you were unsure about.

## Review gate (you run this for every task)

1. **Scope.** `git diff --stat main...<branch>` touches only the files the brief allows. Anything else is a fail unless you agree it is necessary.
2. **No hidden balance changes.** Search the diff for changed numbers in `dist/` outside the brief's scope.
3. **Saves.** No change to the `VERSION` constant in `dist/engine.js`, no renamed IDs or material keys.
4. **Tests.** Run `npm test` yourself on the branch. All pass, and the count went up by the new tests the brief asked for.
5. **Syntax.** `node --check` on each changed `.js` and `.mjs` file.
6. **Packaging** (T2 and T3, which may add imports). In a temporary copy outside the repository (copy `dist/`, `scripts-package.py` and `package.json`), run `python3 scripts-package.py`. It must print `Packaged v...`. Delete the temporary copy. Never commit generated `Crown-and-Calamity*.html` or `.zip` files.
7. **Docs.** The documents the brief names were updated.
8. **Phone check** (T2, T3, T4), if a browser is available: no horizontal scroll at 360 and 390 px on the changed screens.

If any step fails, send the subagent the exact failure and let it fix it once. A second failure on the same task means stop and report.

## Landing each task

- Branch names: `handoff/t1-affix-costs`, `handoff/t2-sewing-kit-regions`, `handoff/t3-weapon-family-tags`, `handoff/t4-phone-audit`, `handoff/t5-readme-count`.
- One pull request per task into `main`. Use a merge commit, which matches the repository's history. Never force-push `main`.
- PR body: what changed, why (quote the brief's goal), the files changed, the `npm test` summary, and the phone check result where relevant.

## Subagent briefs

### T1: Scale workshop affix coin costs by chapter

**Goal.** `IMPLEMENTATION-STATUS.md` lists "Scale affix coin costs with equipment chapter; preserve already-paid modifications" as unfinished. Affixes (prefixes and suffixes applied in the Sewing Kit) cost a flat 24 to 34 coins at every chapter, while item upgrades already scale by chapter. Late-game affixes are therefore almost free. Make affix coin costs scale the same way upgrades do.

**Allowed files.** `dist/gear.js`, `tests/gear.test.mjs` (or a new `tests/affix-costs.test.mjs`), `IMPLEMENTATION-STATUS.md`, `design/13_Equipment_Workbench.md`, `design/38_Gear_Economy.md`.

**Read first.**
- `dist/gear.js`: `PREFIXES` and `SUFFIXES` (each affix has `cost:{coins, materials}` and a `slots` list), `makeCost`, `noCost`, `affixPreviewBase` (builds `cost` with `makeCost(affix.cost.coins, affix.cost.materials)`), `affixPreview`, `applyAffix` (spends `p.cost` from the preview), `UPGRADE_CHAPTER_MULTIPLIERS` (`[1,1,4,16,64,256]`, indexed by `item.chapter`) and `upgradeCost`, and `resaleValue` (resale ignores affixes, so there is no profit loop).
- `dist/app.js` around its two `affixPreview` uses: confirm the interface shows the preview's `cost`, not the raw table.
- `tests/gear.test.mjs` tests named "affixes are slot-limited, deterministic, replace per kind and never double-spend" and "upgrades, affixes, and crafts have no character-level gate" as patterns.

**Steps.**
1. Write the tests below first and confirm the scaling test fails.
2. In `dist/gear.js`, add one small helper that returns an affix's cost for a given item: coins = `affix.cost.coins × (UPGRADE_CHAPTER_MULTIPLIERS[item.chapter] || 1)`; materials unchanged.
3. Use that helper in `affixPreviewBase` in place of the direct `makeCost(...)`. `applyAffix` already spends the preview's cost; do not add a second calculation.
4. Do not change any value in `PREFIXES` or `SUFFIXES`.
5. Update the docs listed below.

**Resulting multipliers.** Chapter 1 ×1, Chapter 2 ×4, Chapter 3 ×16, Chapter 4 ×64, Chapter 5 ×256, the same as upgrades. Relics have `chapter` set from `RELIC_CATALOG` (1 to 5), and three affixes allow the relic slot, so relic affixes scale too. That is intended.

**Tests to add.**
- An affix on a Chapter 1 item costs its table coins; the same affix on a Chapter 3 item in the same slot costs 16 times as much; materials are identical.
- `affixPreview(...).cost` equals what `applyAffix` actually deducts (compare coins before and after).
- A save that already has an affix (set `itemMods[id].prefix` before loading through the engine's `loadSave`) keeps it after loading, and no coins are deducted.
- Selling an item with an affix returns the same coins as selling it without one (no profit).

**Docs.** Remove or mark done the affix bullet in `IMPLEMENTATION-STATUS.md`. Add one sentence to `design/13_Equipment_Workbench.md` and `design/38_Gear_Economy.md` stating that affix coin costs use the upgrade chapter multipliers.

**Pitfalls.** Every item currently has a `chapter`, but keep the `|| 1` fallback as a defensive default. Existing tests use Chapter 1 items (`rod`, `seal`), so their coin totals should not change; if any existing test fails, read it before changing it, and never weaken an assertion just to pass.

### T2: Group Sewing Kit recipes by region

**Goal.** `IMPLEMENTATION-STATUS.md` lists "Filter or group those recipes by unlocked region in the Sewing Kit". As regional materials gain recipes, a single flat list becomes hard to use. Group recipes by the region their materials come from, show only unlocked regions, and keep the selected workshop item open after any action. This is an interface change: no recipe cost or output changes.

**Allowed files.** `dist/gear.js` (one data table and one pure helper only), `dist/app.js` (Sewing Kit view only), `dist/style.css` and `dist/menu.css` (the stylesheets that style `.workbench-section`), `tests/workshop-ui.test.mjs`, `tests/gear.test.mjs`, `IMPLEMENTATION-STATUS.md`.

**Read first.**
- `dist/gear.js`: `EXCHANGES` (recipes; each has `cost` as material counts, optional `gain`, `gainItems`, `coins`) and `MATERIAL_LABELS` (material save keys and display labels).
- `dist/campaign.js`: `CHAPTERS` (id, name, `enemyIds`, `bossId`), `chapterUnlocked(state, id)`.
- `dist/app.js`: `workbenchView`, `workbenchStock`, `exchangeOutput`, `exchangeBlock`, `exchangeCanAfford`, `MATERIAL_SOURCES`, and the `workshopItem` selection state. The Sewing Kit opens with actions `nav:bag` then `bag-tab:workbench`. Sections render as `<details class="workbench-section bench-group" ...>`.
- `tests/workshop-ui.test.mjs`: it boots the real app with `bootWithSave(save)` from `tests/shop-ui-harness.mjs`, drives it with `ui.act('nav:bag')` and `ui.act('bag-tab:workbench')`, and asserts `class="workbench-section bench-group" open` and `workbench-item selected" data-workbench-item="rod"`. Those assertions must keep passing.

**Steps.**
1. In `dist/gear.js`, add an exported table `MATERIAL_CHAPTER` mapping every key of `MATERIAL_LABELS` to a chapter number or the string `'general'`:
   - Chapter 1: Ledger scraps, Canal iron, Runic residue, Chainback shell, Stamped brass, Floodglass, Floodglass Fragment.
   - Chapter 2: Arcade lint, Prize gears, Glass marbles, Tin wheels, Golden token, Arcade tokens.
   - Chapter 3: Garden seeds, Silvershell, Sprinkler brass, Bright feathers, Garden medallion, Garden twine.
   - Chapter 4: Moth velvet, Packing twine, Clock springs, Soft buttons, Keepsake key, Attic ribbon.
   - Chapter 5: Painted papier-mâché, Carousel brass, Velvet tickets, Ringmaster ribbon, Velvet star.
   - General: Salvaged fittings, Repair fittings.
   This list was verified on 30 October 2026: every enemy's material matches its chapter, and every contract-reward material matches its contract's chapter (Repair fittings is a Chapter 1 contract reward but stays general because exchanges also produce it). Re-verify before relying on it: each enemy's `material` (in `dist/engine.js` `ENEMIES`, which includes `dist/campaign-enemies.js`) must map to that enemy's chapter (`enemyChapter` in `dist/campaign.js`). Contract-reward materials (Arcade tokens, Garden twine, Attic ribbon, Velvet tickets) belong to the chapter whose contracts grant them; check `dist/story.js`. Report any key you had to place differently.
2. Add an exported pure helper `recipeRegion(recipe)`: the highest chapter among the recipe's `cost` materials, or `'general'` if all of them are general.
3. In `workbenchView`, render the exchange recipes grouped under headings: "General" first, then "Chapter N · <chapter name>" for each unlocked chapter that has recipes. A locked chapter that has recipes shows one non-interactive line, "Opens after the Chapter N−1 finale", and no recipe buttons. Keep the existing upgrade and affix sections exactly as they are.
4. Keep every existing class name the tests rely on. Headings are text, not icons.
5. Today every recipe uses Chapter 1 or general materials, so the visible result is a "General" and a "Chapter 1" group. That is expected; later regional recipes will appear under their own chapters automatically.

**Tests to add.**
- `MATERIAL_CHAPTER` has an entry for every `MATERIAL_LABELS` key, and every enemy material maps to that enemy's chapter.
- `recipeRegion` returns 1 for `ledger_fittings`, `'general'` for `fittings_repair`, and 2 for a synthetic recipe object whose cost includes `'Prize gears'`.
- In the workshop UI test: the Sewing Kit shows the "General" and "Chapter 1" headings; every existing recipe still appears exactly once; the selected item stays open after an upgrade (the existing assertions).
- A save with no Chapter 2 receipt shows no Chapter 2 recipe buttons. Use a synthetic setup if no Chapter 2 recipe exists yet, or assert on the helper output.

**Docs.** Mark the grouping bullet done in `IMPLEMENTATION-STATUS.md`.

**Pitfalls.** Do not move recipes between sections in a way that changes `data-action` values; tests and saved selection rely on them. Material keys like `'Painted papier-mâché'` contain non-ASCII characters; copy them exactly from `MATERIAL_LABELS`.

### T3: Tag every weapon with its family (data only)

**Goal.** First, data-only slice of `design/47_Spec_Weapon_Families.md`. Every weapon gets a `family` field from a single table, the catalog refuses to load if a weapon lacks one, and the family name is shown on item cards, shop rows and the build inspector. The owner approved doing this slice ahead of the normal `ROADMAP.md` milestone order on 30 October 2026, because it changes no gameplay. Do not refuse on the milestone-order rule in `AGENTS.md`.

**Out of scope.** Family traits, weapon-type mastery, second-hand behavior, any damage, price, base or stat change, any save field.

**Allowed files.** `dist/gear.js`, `dist/market-ui.js`, `dist/app.js` (display only), `scripts/weapon-economy.mjs`, `tests/gear.test.mjs`, `tests/economy-scaling.test.mjs`, `design/47_Spec_Weapon_Families.md`, `design/38_Gear_Economy.md`, `README.md`.

**The family table** (verified against the catalog: 9 families, all 75 weapons, each exactly once):

| Family ID | Display name | Weapon IDs |
| --- | --- | --- |
| clubs | Clubs and bonkers | sword, buttonBaton, ironsword, blanketClub, buttonBashers, bobbinClub, patchworkRam, thimbleKnocker, carouselClub, ticketPuncher |
| mauls | Mauls and hammers | teacupMace, pillowMallet, spoonSledge, kettleHammer, plushMaul, thimbleMaul, pincushionPounder, kettleDrumHammer, quiltedSledge, fairgroundMaul, ringmasterDrum, velvetBumper |
| spears | Spears and pikes | pike, thimblePike, spoolSpear |
| needles | Needles and needleblades | blade, spoolblade, ribbonRapier, thimbleSabre, satinNeedle, starlingEdge, moonlitStiletto, moonThreadNeedle, ticketNeedle |
| foils | Foils, rapiers and lances | pinFoil, spoolfoil, pinwheelRapier, needleFoil, safetyPinLance, carouselLance |
| stilettos | Stilettos, pins and darts | glassblade, ribbonStiletto, glassBeadDart, embroideryStiletto, satinSeamRipper, clockworkBodkin, starButtonStiletto, cometPin, velvetSeamRipper, ringmasterPin |
| wands | Wands | rod, starWand, lanternWand, thimbleChime, buttonStarWand, moonKiteWand, velvetNightWand, fairgroundFirefly, ticketStarWand |
| scepters | Scepters and rods | singalongScepter, floodrod, lullabyScepter, ribbonLoomRod, bedtimeBobbin, plushCometScepter, carouselMoon, velvetCometRod |
| batons | Batons, staves and flutes | lullabyRod, cloudFlute, velvetConductor, bedtimeStar, starryPincushion, thimbleOrchestraRod, lanternThreadStaff, midnightCarousel |

Some IDs do not match their display names (for example `ribbonRapier` is the Ribbon-Tail Needleblade, and `moonlitStiletto` is the Moonlit Thread Needle). The table follows display names on purpose. Copy it exactly.

**Steps.**
1. Write the tests first and confirm they fail.
2. In `dist/gear.js`, add an exported frozen table `WEAPON_FAMILIES` (family ID to `{ name, ids }`) and assign `item.family` in the same section that already assigns weapon tiers from `WEAPON_TIERS`. Follow the existing fail-fast pattern used for relics (`throw new Error('Every relic needs a RELIC_CATALOG row')`): throw if any weapon has no family, if an ID appears twice, or if a family lists an unknown ID.
3. Export a tiny helper `familyLabel(item)` that returns the display name, or an empty string for non-weapons.
4. Keep the table in `dist/gear.js`. Do not create a new module for this slice. That avoids two known traps: the package script (`scripts-package.py`) bundles modules with regular expressions and does not support `export { x } from './y.js'`, and the test harnesses rewrite import lines by exact string.
5. Show `familyLabel` in one short line on weapon item cards and the inspector in `dist/app.js`, and on weapon shop rows in `dist/market-ui.js`. Text only.
6. In `scripts/weapon-economy.mjs`, inside `catalogAudit`, push an error for any weapon without a known family.

**Tests to add.**
- Every weapon has exactly one family; the nine families cover all 75 weapons with no duplicates.
- The audit (`catalogAudit()` in `tests/economy-scaling.test.mjs`) still reports `errors: []`.
- No weapon's `price`, `base`, `tier`, `chapter`, `stats`, `twoHanded` or `focus` changed: snapshot these fields in the test from a hard-coded expectation for at least one weapon per family, or compare the whole catalog against values captured before your change.
- The rendered shop or item card for `ironsword` contains "Clubs and bonkers".

**Docs.** In `design/47_Spec_Weapon_Families.md`, add a status line that the data slice is implemented and that traits and mastery are not. Mention family tags in the catalog section of `design/38_Gear_Economy.md` and in `README.md`'s current-version notes.

**Pitfalls.** Weapons are frozen inside `ITEMS` only at the top level; the existing code already mutates item objects to set `tier` and `price`, so setting `family` there is consistent. Run the packaging check in the review gate.

### T4: Phone-width interface audit

**Goal.** `AGENTS.md` asks for narrow mobile layouts to be tested when a browser is available, and real-device checks are listed as outstanding in `IMPLEMENTATION-STATUS.md`. Check every main screen at 360 × 740 and 390 × 844, record problems, and fix only small, obvious layout bugs.

**Allowed files.** A report at `handoffs/reports/phone-audit.md`. CSS files in `dist/` for small fixes only (overflow, wrapping, touch-target size). No JavaScript changes unless a fix is impossible in CSS; ask the orchestrator first.

**How.**
1. Serve the game with `npm start` (Python serves `dist/` on port 4173). The Playtest Lab is at `lab.html`.
2. Use Playwright or any browser automation available, from a script outside the repository. Do not add it to `package.json`. If no browser is available, stop and report that.
3. Seed a character through the browser console or `page.evaluate`: import `./engine.js` and `./characters.js`, create a roster with `emptyRoster()` and `createRosterCharacter(roster, { name, race, kit })`, then edit `roster.characters[0].state` (level, coins, gear, relics) and save it to `localStorage` under the key `crown-calamity-roster-v1`, then reload. `createRosterCharacter` builds its own character from the options and ignores any state object you pass, so edit the stored state after creating it.
4. The page has duplicate navigation buttons (desktop and mobile). Click only visible ones (for example Playwright's `:visible` selector), or clicks time out.
5. Visit: the first-run character creator (empty `localStorage`); Adventure (`nav:hunt`), then a combat exchange (`hunt:rats`, then an action button such as `combat:attack`); Story (`nav:story`); Character (`nav:character`, including the gear diagram and the relic page with both relic slots); Satchel (`nav:bag`, then `bag-tab:gear`, `bag-tab:materials` and `bag-tab:workbench`); Market (`nav:market`, buy and sell); World (`nav:world`); Journal (`nav:journal`); Field Guide (`nav:guide`); and the Playtest Lab with at least the `bounty_board` scenario.
6. On each screen, at both widths, record: horizontal overflow (`document.documentElement.scrollWidth - window.innerWidth > 0`), interactive elements (`button`, `[data-action]`, links) smaller than 48 × 48 px, text overflowing its container, and console errors.
7. The "Skip to adventure" link that appears at the top left when it has keyboard focus is expected.

**Fix rule.** Fix only CSS issues with an obvious, local fix (for example `overflow-wrap`, `min-width: 0`, or `min-height: 48px` on a control). List everything else in the report with screen, width, element and a suggested fix. Do not redesign anything. Do not commit screenshots; describe what you saw.

**Report format.** One table per width with screen, check, result and any fix applied, then a list of open issues.

### T5: README test count (do this yourself, last)

`README.md`'s "Verification" section says the release "passes 270 test cases"; the count has since grown. After T1 to T4 have merged, run `npm test` on `main`, take the `# tests` number, and replace "passes 270 test cases" with "passes <N> test cases (30 October 2026)". Change nothing else. Open and merge it like the others.

## Final report to the owner

When all waves are done (or you stopped), report:
- each task: merged PR link, or why it stopped;
- the final `npm test` summary on `main`;
- the phone audit's open issues, copied from the report;
- anything a subagent flagged as unsure, and how you resolved it.
