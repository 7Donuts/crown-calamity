# Crown & Calamity — playable solo prototype v0.2.0

Canonical source: [7Donuts/crown-calamity](https://github.com/7Donuts/crown-calamity).

This repository stores the editable game, artwork, tests, original design pack, and development roadmap. Generated HTML downloads and ZIP files are created locally instead of committed.

To create the self-contained game, run `python scripts-package.py`, then open `Crown-and-Calamity.html` in a modern browser. It includes the artwork, styling, and JavaScript and needs no installation. Progress is saved in that browser; export a save from the Field Guide before changing devices or clearing browser data. File-based browser storage support varies, so use Export Save for backups.

For local development with Node 20+ and Python 3:

```sh
npm start
```

Open http://localhost:4173. There are no runtime package dependencies. Edit files in `dist/` directly. Run `node tests/engine.test.mjs` for the 33 combat and progression checks. Run `python scripts-package.py` to regenerate the standalone game and source ZIP.

## Implemented

- Mobile-first, text-first active combat, with exactly one exchange per explicit action and no offline or idle progression.
- Six regular enemies, their readable intents, and the three-phase Acting Superintendent boss.
- Attack, Arc Bolt, Wardcast, Defend, Recover, Brace, Disrupt, Mend, Withdraw, and a boss vent action.
- Seven classless attributes including Luck, levels 1–10, four allocatable points per level, and free early respecs.
- Equipment comparisons, free starter practice loadouts, purchases, mastery, materials, event-driven achievements, and authored B.U.R.S.A.R. commentary.
- Five story contracts, a rescued worker callback, a five-checkpoint solo delve, one camp recovery, a recorded route choice, and guaranteed first-boss loot selection.
- Local autosave, JSON save export/import, identity editing, reduced-motion support, and keyboard-accessible controls.
- Original generated environmental illustration and original vector enemy emblems. No player portraits.

## v0.2.0 — attributes, Luck, and the build inspector

The seven attributes are Might, Finesse, Intellect, Vitality, Will, Insight, and Luck. Each has base 8. The starting investment is now 68 (56 baseline plus the existing 12 starter points); level-ups still grant four allocatable points. Original six-stat builds keep their exact investments and receive base Luck 8. Save format v2 imports both v1 and v2; migration does not reset progress, gear, mastery, current encounters, delay timestamps, or unspent points.

Luck above 8 increases critical-hit chance and equipment-drop chance with diminishing returns. If F = max(0, Luck−8) / (max(0, Luck−8)+40), then the drop chance is 20% + 15%×F, and critical chance is 5% + 15%×Finesse/(Finesse+208) + 10%×F, capped at 25%. Critical damage stays at 125%. Insight no longer reduces critical chance. Luck does not alter guaranteed XP/coins/materials, first-clear rewards, action authorization, or the 650 ms delay.

The Copper-Thread Charm grants +4 Luck, is sold for 25 coins, and joins the ordinary drop pool from level 1. Duplicates become salvaged fittings. The drop chance is fixed at encounter entry and included in victory receipts.

The sheet shows invested stats, gear contributions, exact per-point effects, and a target-specific inspector with powers, accuracy, critical chance, healing, mitigation, and normal/critical/glancing damage. The inspector and combat use the same damage calculations, including live enemy stances, Reservoir, adaptation, and boss openings. Equipment comparisons preview changed derived stats, including Luck's reward effects.

See [the attribute and Luck design notes](design/12_Attributes_and_Luck_v0.2.md) for the current rules. These additions supersede the older six-attribute budget in the retained source design.

## v0.1.1 — action pacing and readability

Combat actions share a 650 ms delay, enforced by the local engine as well as disabled controls. Switching actions, starting another hunt, or reloading the saved state does not bypass the accepted action’s timestamp. Inputs during the delay are discarded; no timer advances combat or queues an action. This limits accidental and rapid repeated inputs in the prototype, but client code and clocks remain editable. Server enforcement and abuse monitoring are required for online macro resistance.

The interface uses system fonts, larger mobile text, brighter secondary text, explicit dialog foreground/background colors, CSS variable fallbacks, and scrollable dialogs. These address the reported black-on-dark reward dialog and avoid relying on root-level styling being preserved by an embedded HTML viewer.

Existing version-1 saves remain compatible and migrate to version 2. Export a save before replacing your downloaded HTML file; some browsers keep separate storage for each file URL.

## Prototype choices

The supplied documents are a design foundation, not runnable source. Their latest agreed direction takes precedence. The original modular design is retained in `design/`.

Wardcast is a new provisional combined action: 0.85× spell damage plus Guard for 12 mana and 8 stamina, with a focus and shield required. Reservoir is available from the start to test durable casting; a Guard preventing 20 damage charges the next spell by 10%. All starter passives and core actions are available early. Accuracy failures become 55% glancing hits instead of empty actions. Enemy evasion uses a bounded accuracy check. Ordinary equipment rolls use a simplified level-eligible pool. These decisions need playtesting and are not final balance promises.

## Remaining work

The user's future direction includes login, online play, server-stored progression protected against client edits, and guilds. See [the online development roadmap](FUTURE-DEVELOPMENT.md) for phased delivery, server-authority requirements, and acceptance checks.

This is a local solo prototype, not a production service. Saves and rewards are client-controlled. Before shared-world features, implement server-authoritative exchanges, authenticated durable character records, reward idempotency, and account-scoped first-clear tracking. Other future work includes broader ability/gear content, material exchanges, economy balancing, accessibility testing with assistive technology, multiplayer, and prestige. The guide states the currently implemented behavior.

## Verification

33 engine tests pass, including action legality, single exchange authorization, reward idempotency, cooldown timing, Reservoir expiry, allocation, combat preparation locks, withdrawal, defeat, mastery, equipment purchases, the complete delve route, the prototype cap, shared action-delay enforcement, ignored spam, delay persistence, Luck's actual critical/drop rolls, stat and equipment effects, version-1 migration, seven-stat respec budgets, and inspector/combat agreement across all targets. Browser QA depends on the environment's browser launch support; test on real phones before calling the interface production-ready.
