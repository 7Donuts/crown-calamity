# Crown & Calamity — playable solo prototype v0.10.0

Canonical source: [7Donuts/crown-calamity](https://github.com/7Donuts/crown-calamity).

An original, mobile-first, text-first LitRPG set below Bracken Quay. One explicit action resolves one combat exchange. There is no idle or offline advancement. Characters now have customizable pixel portraits alongside the illustrated enemies and equipment.

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

Then open `Crown-and-Calamity.html` directly in a modern browser. The package embeds the game modules, styling, environment, enemy sprites, item atlas, emblem, and favicon. It also produces `Crown-and-Calamity-Playtest-Lab.html`; keep both unversioned HTML files together to use the Records → Field Guide link offline. The source ZIP contains both standalone pages. The versioned downloads are generated locally and ignored by Git.

Progress is browser-local. Export a save from Records → Field Guide before clearing browser data, changing devices, or opening a new downloaded file. File-based storage varies by browser; export/import is the reliable backup and transfer route.

## New in v0.10.0 — heritage, relic echoes, and deliberate recovery

Create a **Quayfolk**, **Cobblekin**, **Reedling**, or **Emberling** adventurer. Each race supplies a 68-point starting spread, a named passive, and a descriptive quirk; all attributes remain at least 8. Choose a simple Sword & shield, Blade & charm, or Rod & focus kit independently. Male/Female presentation, five hairstyles, and hair/eye/skin palettes update a real layered pixel portrait and persist with the character. Appearance has no combat effect. See [race and identity rules](design/30_Races_and_Identity.md).

Older saves keep their invested attributes and all progress. Edit identity offers a **one-time heritage adoption** to add a racial passive without rebaking those attributes; cosmetic appearance stays editable. Free early respecs still reclaim the twelve points above the seven-attribute minimum.

The nine core gear slots remain, with **three optional relic echo sockets** beneath the equipment map. Socket unlocks cost 250 / 1,250 / 6,250 coins. For current relics, new licenses of the same type cost 150 / 600 / 2,400 coins across sockets; clearing never refunds or discounts another socket. Reattuning an already licensed relic in the same socket is free. Echoes copy diminishing flat bonuses and share the base item's upgrades; they do not repeat the Seal barrier trigger. A bare Seal needs an upgrade/reforge that adds flat bonuses before an echo can be licensed. All costs and effect strengths are reviewed before spending. See [relic resonance](design/31_Relic_Resonance.md).

Early mana and stamina reserves are smaller, expensive actions cost more, and exchanges no longer refill both resources for free. Basic Attack stays free; guarded responses restore 2 stamina. Recover spends an exchange for 8 mana / 10 stamina while the enemy responds. Prepared grants only 3 mana / 3 stamina on encounter entry. Attribute and gear changes raise capacity without granting current resources, preventing free-heal respec loops.

Town rest now takes **8 seconds**, has no coin fee, and requires a final tap to finish. There is no automatic healing while waiting or loading a save. Defeat costs **5% of carried coins, capped at 50**, plus a **12-second recovery window**; levels and gear are safe. A rest started during recovery shares the longer deadline instead of stacking waits. Encounters and delves cannot begin during pending rest or wounds. See [resources and recovery](design/32_Resources_and_Recovery.md).

Starting a desktop encounter scrolls the combat actions into view, respecting reduced motion. Mobile keeps its existing combat layout. Tests cover all four races with every supported starter kit against the opening rats, appearance combinations, recovery timing, relic costs and stacking, save compatibility, and actual UI flows. Equal budgets and these starter checks are a foundation for balance; full PvP tuning remains future work.

## New in v0.9.0 — clearer goals and a livelier Quay

- The hunt shortcut remembers the character's last local opponent. With no previous choice, it names the toughest unlocked opponent. The introduction still points new adventurers to Mara.
- Mobile navigation has a direct **World** destination. Community chat, friends, guilds, and holdings are accessible there; Chronicle and Field Guide remain in its records tabs. Online features remain clearly marked, disabled placeholders.
- All menu and navigation glyphs now use original colored pixel props. Combat has brief critical, impact, healing, guard, interrupt, and recovery feedback; victory opens the chest and tosses decorative coins. These effects do not resolve turns or grant rewards. Reduced motion uses still feedback.
- Story milestones appear on hunt rewards. A newly completed objective opens the next report or interaction, and a claimed contract offers the next explicit story decision. Contracts and interactions still need a player click; no automatic acceptance or claiming is introduced.
- Coins and one material remain guaranteed per victory. Equipment keeps its Luck-based natural drop roll; after five consecutive victories without equipment or duplicate salvage, the sixth guarantees an equipment reward. A natural drop or duplicate salvage resets the saved counter. Existing saves begin with zero misses; defeats and withdrawals do not advance it. Duplicate equipment becomes Salvaged fittings.
- The workbench shows held materials, missing quantities, material sources, and a guided first-cap project. Every craft, upgrade and reforge still previews its cost and requires confirmation. Reward receipts link straight to materials, the workbench, and equipment comparison.

The tone is lighter municipal fantasy: helpful goals, recoverable mishaps, and occasional paperwork jokes. Enemy critical hits are not a combat mechanic; incoming reactions reflect actual normal/heavy damage.

## New in v0.8.2 — field HUD and illustrated spoils

Health, Mana, Stamina, and Rest share one open status strip instead of four cards. Original colored pixel sprites match the world's moss, teal, cream, and amber palette; the existing resource-bar colors stay in place. The character sheet uses the same resource sprites.

Victory now shows a treasure chest and an illustrated “Spoils of the hunt” list with the actual XP, coins, materials, equipment, and salvage earned. The redundant completion badge and equipment-roll percentage panel are removed. Defeat and withdrawal use recovery/map props. Reward calculations, Luck effects, saved receipts, combat pacing, and action routes are unchanged.

## Fixed in v0.8.1 — mobile layout

The encounter log now uses its own explicitly placed icon, text, and exchange areas; it no longer inherits the old log's bullet marker, which squeezed mobile text into the icon column. Mobile navigation sits outside the page shell with six equal-width targets, a fixed safe-area-aware height, and viewport width bounds. The mobile shell uses the stable small viewport height to avoid relayout when the browser toolbar collapses.

## New in v0.8.0 — the adventurer’s field record

The character overview is a parchment TTRPG sheet with seven attribute scores, icon-led resources and defenses, equipment illustrations, multipart progression, and a collapsible build inspector. The adventure sidebar lists occupied gear in compact rows; the full nine-slot equipment diagram and accessible slot editor remain on Character → Gear.

Combat recovery now sits above the action buttons with a prominent progress bar and explicit ready/countdown state. It preserves the shared 650 ms delay and never queues a later action. After encounters, an illustrated field report separates actual rewards, equipment-roll details, and the next action. New journal props follow the canonical soft-pixel direction.

World & community reserves space for regional movement, guilds, friends, and land holdings. Community opens a compact drawer with planned chat channels and a disabled composer. On mobile, World lives under Records to preserve the six main navigation targets. These are clearly marked UI placeholders: login, networking, chat delivery, guild membership, ownership, and server authority remain future work. No fake players or messages are displayed.

## New in v0.7.0 — the approved soft pixel world

All live illustration paths now use the approved soft pixel direction: the canal scene, all seven enemies, equipment families, B.U.R.S.A.R. emblem, favicon, and filled pixel menu glyphs. The interface uses quieter slate-blue panels, cream/amber highlights, dusty teal, and moss accents. Text stays normal readable type.

- The rat uses its four-pose sheet during encounters; the other six enemies share one transparent atlas with a small decorative idle bob. Hunting-list art stays still, and reduced-motion preferences stop both types of motion. Animation never resolves a combat action or changes the shared 650 ms pacing.
- The item atlas has fourteen equipment families covering all 25 catalog IDs, plus material and toolkit illustrations. Higher-tier items can share a family silhouette; their names, stats, upgrade state, and comparisons distinguish them. New art appears in vendors, the satchel, gear slots, purchase/sale reviews, and upgrade comparisons.
- [ART-DIRECTION.md](ART-DIRECTION.md) is the canonical guide: palette, shape language, scale, registration, animation, UI, accessibility, export requirements, checklist, and prompt templates. [The asset manifest](dist/art-manifest.json) records measured dimensions, crop grids, transparency, content bounds, and hashes. Art helpers remain separate from combat rules and saves.

The original [soft pixel study](design/28_Soft_Pixel_Direction.md) and its independent animation preview remain reference material. Generate that preview with `python3 scripts-soft-pixel-preview.py`. Earlier rejected boards remain in `design/art-proposals/` as historical exploration and are never loaded by the live game.

## New in v0.6.0 — a clearer market and menu structure

- **Dedicated Quay market:** three vendors have separate weapon, armor, and curio stock. Buy lists hide items already owned; sell lists show only eligible unequipped gear. Compare a vendor item beside the gear in its target slot before buying, including either accessory slot, the offhand reserved by two-handed weapons, and projected build totals. Buying still adds base gear to the Satchel without equipping it.
- **Satchel and equipment have distinct jobs:** the Satchel contains spare gear, materials, and the Workbench. Character → Gear is the equipment view, with the accessible nine-slot diagram and equipped-item controls.
- **Records gathers the Journal and Field Guide:** both are tabs under Records and remain reachable from the six-item mobile navigation. Guide topics and Workbench sections can be expanded as needed. Rest stays in the shared resource area.
- **Consistent menu icons and denser layouts:** 24 original, small stroke icons accompany their text labels. Menu spacing, alignment, wrapping, touch targets, and narrow-screen comparison dialogs have been refined without hiding actions or explanatory copy.
- **Art direction proposals:** five original styles are available for comparison in [design 26](design/26_Art_Directions.md), with an offline gallery generated by `python scripts-art-gallery.py`. They are proposals, not selected production art.
- **Bounded itemization research:** [design 27](design/27_RWK_Relics_and_Itemization.md) reviews RWK relic/itemization ideas and proposes a bounded relic effect budget and at most two typed imprints for future evaluation. The proposed system is not implemented; current gear rules remain in effect.

## Fixed in v0.5.1 — mobile layout and Rest

Rest at the Quay is visible beneath the resource bars on mobile and restores all three resources. It remains unavailable during fights and delves. The hero's district label now occupies normal layout space so enlarged text cannot collide with the welcome heading. Equipment rows place slot selection and Unequip explicitly, wrap long item names, and stack the removal control below the item on phones. The compact sidebar equipment summary uses the same corrected row structure.

## New in v0.5 — an arcane HUD and a disposable playtest lab

- **Fantasy system interface:** an original B.U.R.S.A.R. rune sigil, brass instrument frames, teal system readouts, segmented vitals, encounter intent framing, and an equipment projection. The UI keeps explicit text, readable dark surfaces, touch controls, and reduced-motion support.
- **Six isolated loop tests:** `/lab.html` when served, or `Crown-and-Calamity-Playtest-Lab.html` offline. Choose a scenario, kit, and repeatable random seed; take hunts and exchanges manually. Test the opening goal, comfortable repetition, a heavy wind-up, buying/equipping a sidegrade, returning to a contract, and multipart pacing.
- **Reviewable session reports:** explicit inputs, accepted exchanges, outcomes, costs, part points, shop choices, and self-reported reflections export as JSON. Damage attempts include overkill and omit final attacks the engine does not report; HP loss/restoration are net changes per exchange, not exact incoming damage or healing. The report documents these limits.
- **Provisional stat audit:** equal-budget projections at levels 1/5/10 and one-point effects use shared formulas. Luck currently favors acquisition over direct combat. These are neutral-target estimates, not PvP match results; no stat retuning or PvP mode is included.
- **Text RPG research:** niche comparisons and a small-session plan separate observed mechanics from hypotheses. They do not claim market demand, retention results, or player-tested satisfaction.

The lab never reads or writes campaign saves or the character roster. It has no auto-combat, account connection, or background progression. Closing or resetting it discards the attempt; export a report first if you want to retain it. Use the campaign for full story/delve playtests; the lab is a focused fixture bench, not an additional persistent adventure.

## New in v0.4 — incremental growth and an authored opening

- **Create and keep multiple characters:** first-run identity/kit creation, up to six separate local adventures, and safe character switching. Save imports add a character instead of replacing an existing one. Each new character starts with 20 coins and only the selected kit's gear.
- **Spend early gold:** the Quay outfitter has reviewed buy/sell flows, affordable level-1 stock, comparisons, and clear sale values. Sell unequipped gear outside encounters; selling removes its upgrades/affixes, and buying it again gives clean base gear. Practice kits require owned gear and cannot recreate sold items.
- **See equipped slots:** Character → Gear shows the clickable nine-slot equipment map around a generic body outline, plus an accessible text list. The Satchel holds spare gear, materials, and Workbench services. This is a slot diagram, not a player portrait.
- **Longer levels, smaller steps:** four parts per full level, one attribute point for each completed part, and no extra four-point award at the level boundary. The full-level XP curve is three times the earlier prototype. Both part and level progress are visible; the total discretionary points remain four per full level.
- **A longer story introduction:** meet Mara, accept the minor Proof of Trouble job, report three completed rat encounters, then take the major Drainage Inspection contract. Clear three more encounters, secure the passage, explicitly rescue Mara, and report back. Later major contracts require specific accepted objectives, explicit story actions, and a recorded delve route. Minor jobs give nearer goals while the major story develops.
- **Working physical skills:** sword/shield and blade starters learn Driving Strike immediately. Guardstrike combines a weaker physical hit with Guard for stamina. Physical skills require no focus; Arc Bolt and Wardcast still do. The main action bar follows the equipped loadout.

The first minor contract yields 128 total XP after its three hunts and reward: level 1 part 2. The rescue chain reaches 312 total XP: level 2 part 1 with four earned attributes, before optional hunts or drops. These are provisional pacing numbers for playtesting, not a promised session duration.

## Existing foundations

- Seven attributes including Luck, levels 1–10, one point per progression part, free early respecs, exact per-point previews, equipment comparisons, and a target-specific combat inspector.
- Earned ability learning: Arc Bolt, Brace, Disrupt, Mend, Driving Strike, Aegis, and Expose; Prepared, Sure Footing, and Reservoir passives. Three active slots, one passive, six shared attunement. Learn and prepare outside fights and expeditions.
- Useful-contribution mastery with rank improvements and rank-3 choices for Arc Bolt, Brace, Disrupt, and Mend. Universal Attack, Defend, Recover, Withdraw, and encounter-specific Vent remain available without an ability slot.
- Six repeatable ordinary enemies and the three-phase Acting Superintendent; readable intents and a shared 650 ms action delay. Extra inputs during the pause are discarded, never queued. Timers only re-enable controls.
- Minor and major story contracts, worker rescue callbacks, a branching solo delve, a single camp recovery, first-boss reward selection, event-driven achievements, and authored B.U.R.S.A.R. commentary.
- Character Overview/Attributes/Abilities tabs, all nine equipment slots, an outfit comparison, material-source hints, and explicit workbench cost/benefit confirmations. Higher-contrast text and system fonts preserve the readability fixes.
- Soft pixel environment, six-enemy atlas, four-pose rat sheet, equipment atlas, and matching identity/glyph art. Runtime renderers share measured crop metadata; offline packaging embeds the required illustrations.

## Equipment, materials, and modifiers

The nine slots are weapon, offhand, head, body, hands, feet, two accessories, and relic. Accessories may use either accessory slot; a single owned item cannot occupy both. Two-handed weapons reserve the offhand. Replace a weapon rather than leaving universal Attack without one.

Workbench recipes use the existing guaranteed encounter materials. Early recipes assemble a cap, boots, or gate shield. Five boss fragments can buy a selected Seal or Band that you do not already own; every boss victory grants a fragment. Conversions provide fittings and repair materials without waiting or passive gains.

Owned gear supports three upgrades and one prefix plus one suffix. Modifiers are deterministic, slot-compatible, modest flat bonuses with visible costs. A new prefix replaces the old prefix; a new suffix replaces the old suffix. The same modifier cannot be paid for twice. Upgraded and reforged values flow through the same resolver used by combat, stat previews, and equipment comparisons. Duplicate base-item loot becomes salvage.

The current bag owns one copy of each base item ID. This version does not generate random affixed duplicates, rarity tiers, or item trading. See the [dynamic gear assessment](design/16_Dynamic_Gear_Systems.md) for that next step and its prerequisites.

## Saves and compatibility

Save format v4 imports v1–v4. Existing characters retain their full level, invested attributes, gear, skills, currency, and story progress. Older within-level XP is mapped proportionally to the slower curve; newly recognized completed parts grant their points once, and reimporting the migrated v4 save does not grant them again. Completed and pending legacy story milestones are retained without replaying a completed rescue.

The local roster is stored separately from the active-character save. A legacy single-character save is adopted into the roster. Export the active character from Records → Field Guide before changing browser/device or opening a new download; repeat for other characters you want to back up. Online account sync is not implemented.

The level-1 attribute budget is 68: seven baseline values of 8 plus 12 starter investment. At level L, part P, the budget is 68 + 4×(L−1) + (P−1). Luck improves critical and equipment-drop chances with diminishing returns. It does not alter guaranteed rewards or the 650 ms action delay.

## Design and future work

The original modular pack remains under `design/Crown-and-Calamity-Design-v0.1/`. Later user direction and these implementation notes supersede older provisional rules:

- [Attributes and Luck](design/12_Attributes_and_Luck_v0.2.md)
- [Equipment and Workbench](design/13_Equipment_Workbench.md)
- [Ability progression and loadouts](design/14_Ability_Progression.md)
- [Enemy art direction](design/15_Art_Direction.md)
- [Dynamic gear assessment](design/16_Dynamic_Gear_Systems.md)
- [Incremental leveling and migration](design/17_Incremental_Leveling.md)
- [Shop and trading](design/18_Shop_and_Trading.md)
- [Research: progression, successes, and struggles](design/19_Research_Progression_and_Retention.md)
- [Story contracts](design/20_Story_Contracts.md)
- [Text RPG comparisons](design/21_Text_RPG_Comparisons.md)
- [Niche playtest plan](design/22_Niche_Playtest_Plan.md)
- [Stat and PvP audit](design/23_Stat_and_PvP_Audit.md)
- [Arcane HUD direction](design/24_Arcane_HUD_Direction.md)
- [Menu and navigation review](design/25_Menu_Review.md)
- [Art direction proposals](design/26_Art_Directions.md)
- [RWK relic and itemization research](design/27_RWK_Relics_and_Itemization.md)
- [Online development roadmap](FUTURE-DEVELOPMENT.md)

This is still a local solo prototype. Login, server-authoritative actions/randomness/rewards, account persistence, guilds, and multiplayer are future work. Local saves, clocks, and code remain editable. The shared delay limits rapid input; it is not production anti-cheat.

## Verification

The automated suite covers combat, mastery/loadout rules, multipart XP and migration, all nine gear slots, shop prices and atomic spending, upgrade/affix removal on sale, roster creation/switch/import isolation, authored contract objectives/reward idempotency, physical skills without a focus, and live save round-trips. It also packages the complete offline HTML, syntax-checks it, and boots/navigates its UI using a minimal DOM test harness.

The test harness does not verify browser layout. Real-device visual and accessibility testing remains outstanding because this execution environment has not supported browser rendering. The current release passes 112 test cases, including lab storage isolation, seeded replay, timing, telemetry limits, vendor comparisons, complete art coverage/crops, metadata integrity, and both standalone game pages. Gallery and art-preview embedding are checked separately.
