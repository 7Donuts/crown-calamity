# Crown & Calamity — playable solo prototype v0.3.0

Canonical source: [7Donuts/crown-calamity](https://github.com/7Donuts/crown-calamity).

An original, mobile-first, text-first LitRPG set below Bracken Quay. One explicit action resolves one combat exchange. There is no idle or offline advancement. Characters have no portraits; enemies have original illustrations.

## Run and package

The editable HTML, CSS, JavaScript, and artwork live in `dist/`. There are no runtime package dependencies. With Python 3 installed:

```sh
npm start
```

Open http://localhost:4173. For the test runner, use Node 22.8 or newer:

```sh
npm test
```

Create the standalone offline game and complete source ZIP:

```sh
python scripts-package.py
```

Then open `Crown-and-Calamity.html` directly in a modern browser. The package embeds the game modules, styling, environment, enemy atlas, and favicon. The versioned downloads are generated locally and ignored by Git.

Progress is browser-local. Export a save from the Field Guide before clearing browser data, changing devices, or opening a new downloaded file. File-based storage varies by browser; export/import is the reliable backup and transfer route.

## Implemented in v0.3

- Seven attributes including Luck, levels 1–10, four points per level, free early respecs, exact per-point previews, equipment comparisons, and a target-specific combat inspector.
- Earned ability learning: Arc Bolt, Brace, Disrupt, Mend, Driving Strike, Aegis, and Expose; Prepared, Sure Footing, and Reservoir passives. Three active slots, one passive, six shared attunement. Learn and prepare outside fights and expeditions.
- Useful-contribution mastery with rank improvements and rank-3 choices for Arc Bolt, Brace, Disrupt, and Mend. Universal Attack, Defend, Recover, Withdraw, and encounter-specific Vent remain available without an ability slot.
- Six repeatable ordinary enemies and the three-phase Acting Superintendent; readable intents and a shared 650 ms action delay. Extra inputs during the pause are discarded, never queued. Timers only re-enable controls.
- Five story contracts, worker rescue callbacks, a branching solo delve, a single camp recovery, first-boss reward selection, event-driven achievements, and authored B.U.R.S.A.R. commentary.
- Character Overview/Attributes/Abilities tabs, all nine equipment slots, an outfit comparison, material-source hints, and explicit workbench cost/benefit confirmations. Higher-contrast text and system fonts preserve the readability fixes.
- Original generated environmental art and a new seven-enemy atlas. The UI crops the shared atlas directly; it does not rely on external image references inside SVG files.

## Equipment, materials, and modifiers

The nine slots are weapon, offhand, head, body, hands, feet, two accessories, and relic. Accessories may use either accessory slot; a single owned item cannot occupy both. Two-handed weapons reserve the offhand. Replace a weapon rather than leaving universal Attack without one.

Workbench recipes use the existing guaranteed encounter materials. Early recipes assemble a cap, boots, or gate shield. Five boss fragments can buy a selected Seal or Band that you do not already own; every boss victory grants a fragment. Conversions provide fittings and repair materials without waiting or passive gains.

Owned gear supports three upgrades and one prefix plus one suffix. Modifiers are deterministic, slot-compatible, modest flat bonuses with visible costs. A new prefix replaces the old prefix; a new suffix replaces the old suffix. The same modifier cannot be paid for twice. Upgraded and reforged values flow through the same resolver used by combat, stat previews, and equipment comparisons. Duplicate base-item loot becomes salvage.

The current bag owns one copy of each base item ID. This version does not generate random affixed duplicates, rarity tiers, or item trading. See the [dynamic gear assessment](design/16_Dynamic_Gear_Systems.md) for that next step and its prerequisites.

## Saves and compatibility

Save format v3 imports v1, v2, and v3. Old saves retain their invested attributes, unspent points, resources, equipment, progress, and valid mastery. Version-1 characters gain baseline Luck 8. Legacy core actions/passives stay learned; migration equips a legal trio and preserves the passive, and the remaining learned actions can be re-equipped outside encounters. New characters start with Arc Bolt and Prepared and earn the rest.

The level-1 attribute budget is 68: seven baseline values of 8 plus 12 starter investment. Luck improves critical and equipment-drop chances with diminishing returns. It does not alter guaranteed XP, coins, materials, boss choices, or the action delay.

## Design and future work

The original modular pack remains under `design/Crown-and-Calamity-Design-v0.1/`. Later user direction and these implementation notes supersede older provisional rules:

- [Attributes and Luck](design/12_Attributes_and_Luck_v0.2.md)
- [Equipment and Workbench](design/13_Equipment_Workbench.md)
- [Ability progression and loadouts](design/14_Ability_Progression.md)
- [Enemy art direction](design/15_Art_Direction.md)
- [Dynamic gear assessment](design/16_Dynamic_Gear_Systems.md)
- [Online development roadmap](FUTURE-DEVELOPMENT.md)

This is still a local solo prototype. Login, server-authoritative actions/randomness/rewards, account persistence, guilds, and multiplayer are future work. Local saves, clocks, and code remain editable. The shared delay limits rapid input; it is not production anti-cheat.

## Verification

`npm test` passes 56 test cases, including the original combat checks, ability progression assertions, slot/ownership/cost rules, upgrades and affixes, old-save migration, live encounter round-trips, and UI action flows. The generated standalone is syntax-checked, booted in a JavaScript VM, and navigated through all five sections. The source archive is checked for all required modules and artwork.

The VM uses a minimal DOM stub and does not verify browser layout. Real-device visual and accessibility testing remains outstanding; the current execution environment has not supported browser rendering.
