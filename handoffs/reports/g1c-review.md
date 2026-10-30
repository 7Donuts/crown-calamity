# G1-C independent review

**Result: PASS.** The regional workshop implementation is within the brief and meets the reviewed supply/no-profit gate. This does not approve the separate spec 49 one-to-three-hour rank-cost balance gate.

## Findings

No blocking findings.

## Review evidence

- The production-code diff is limited to `dist/gear.js`; test diffs are limited to the two expected test files. Chapter 2–5 upgrade and affix costs resolve to materials whose `MATERIAL_CHAPTER` matches the item chapter; Chapter 1 retains the prior material keys, including the general-material fallback. The chapter multipliers, coin costs, quantities and all existing catalog entries remain unchanged. The four affix families map to the intended physical, spell, armor and ward materials.
- Each new regional exchange has a `chapter` gate in the shared `exchangeMaterials` API. The tests attempt every new recipe with ample resources but no receipt and verify it is rejected without mutation, then verify it succeeds after the preceding finale receipt. Each later chapter has exactly three regional exchanges, including one repeatable rank-supply output for its boss material; no such recipe consumes the boss material. The existing Chapter 1 conversions and crafts remain intact.
- The captured fixture is a static v6 save labeled as generated with `main` b27c9a9 and contains pre-existing upgrades and affixes. I independently extracted it and loaded it using `loadSave` from an archive of b27c9a9: the baseline accepts it and preserves the asserted state. The importer adds a default `lintLocket` bag entry; the test correctly checks that all captured bag entries remain rather than requiring the bag to be byte-identical. The branch test also confirms loading and previewing the next upgrade does not charge or rewrite the saved paid mods/materials until the player confirms that upgrade.
- The no-profit test assigns positive potential to every material, coin and item state (item value is the capped resale receipt), checks every one of the 26 exchanges, and executes exchanges through `exchangeMaterials`. It also covers buy/sell transitions, all catalog items' upgrade levels, direct application of all affix families across chapters, sampled replacement transitions, and sale of upgraded items through production functions. Each transition is non-increasing under the same potential, so a closed workshop cycle cannot create value.
- UI behavior is preserved: existing item-selection/preview coverage remains. The changed grouping test verifies the actual new recipes are hidden before their receipts; the existing Chapter 2 synthetic-recipe UI test covers the shared locked/unlocked regional display path, while the real recipes are separately checked to have the expected `recipeRegion`.
- No item IDs, art assets, catalog counts, save schema, weapon/armor prices, combat stats or price formulas changed. New recipes are the intended G1-C workshop behavior. No dependencies changed.

## Verification

- `node tests/gear.test.mjs`: 36 passed.
- `node tests/workshop-ui.test.mjs`: 3 passed.
- `node --check` passed for `dist/gear.js` and both changed test files; `git diff --check` passed.
- Supplied full-suite log reports 43/43 passing; supplied package log reports `Packaged v0.14.1`.

## Orchestrator review

PASS. Independently read the full gear and test diff, reviewed the material source/count analysis and positive resource potential certificate, and checked that Chapter 1 costs, paid modifications, gear ownership, prices and art stay intact. Root full suite passes 43/43 test files; changed-file syntax, diff checks and isolated standalone packaging pass (v0.14.1). There is no interface layout change. This approves regional material routing and repeatable supply, not future relic-rank affordability.
