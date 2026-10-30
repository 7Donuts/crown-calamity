# G1-C: Regional workshop economy

Chapter 2–5 upgrades and affixes now use same-region materials, checked through `MATERIAL_CHAPTER`. Chapter 1 inputs remain as before, including `Salvaged fittings` and `Repair fittings`. Existing exchange IDs and paid `itemMods` remain intact. Each later chapter adds two 2:1 common-material conversions and one repeatable exchange for one boss material; all new regional exchanges require that chapter's receipt in the shared gear API.

The selected Chapter 2–5 routes are:

| Chapter | Common conversions | Repeatable boss-material supply |
| --- | --- | --- |
| 2 | 2 Arcade tokens → 1 Prize gears; 2 Tin wheels → 1 Glass marbles | 4 Arcade lint + 4 Prize gears + 100 coins → 1 Golden token |
| 3 | 2 Garden twine → 1 Garden seeds; 2 Silvershell → 1 Sprinkler brass | 4 Garden seeds + 4 Bright feathers + 150 coins → 1 Garden medallion |
| 4 | 2 Attic ribbon → 1 Packing twine; 2 Soft buttons → 1 Clock springs | 4 Moth velvet + 4 Soft buttons + 300 coins → 1 Keepsake key |
| 5 | 2 Velvet tickets → 1 Ringmaster ribbon; 2 Painted papier-mâché → 1 Carousel brass | 4 Painted papier-mâché + 4 Ringmaster ribbon + 500 coins → 1 Velvet star |

The repeatable supply exchange provides one boss material per use. Together with the one-time finale material, three uses cover the four boss materials required to take one relic through rank 2 and rank 3 in spec 49. This supplies a path; the cost is not a claim that either rank takes the spec's one-to-three-hour target. G1A material/hour and rank affordability remain to be measured.

## Evidence

- The independent analyst sampled all 22 ordinary campaign enemy material sources on main `b27c9a9`, with 40 seeded synthetic fights per enemy (seeds 501–540). The sample recorded 853 wins and 27 defeats across 880 attempts; every win awarded exactly one material of that enemy's listed key. It verifies source existence and yield per win, not materials or coins per hour. Raw sample: `/tmp/crown-g1a-analysis/g1c-material-samples-40.json`.
- Source-count estimate for the repeatable boss-material routes: farming the eight named local inputs yields about 28/88/192/400 coins in Chapters 2/3/4/5; after the recipe fees, the route is about 24/13.6/12.5/10.1 average-coin-equivalent wins per boss material, respectively. Three extra materials therefore correspond to about 72/41/38/31 such wins. This arithmetic excludes input time, material contention with upgrades/ranks, and player policy; it is not a rank-duration result.
- The analyst checked the recipe draft against a positive potential assignment: coin = 1, ordinary material = 1, boss material = 5, item state = its capped sale receipt. There were no violations across the 26 exchange definitions, all item craft outputs, 149 priced-item resale caps, 462 upgrade transitions and compatible affix applications/replacements. Since each transaction is non-increasing in potential, any sequence of exchange, craft, purchase, upgrade, affix and sale actions is also non-increasing. The repo test independently enforces this certificate and applies every exchange through the production API.
- The v6 save fixture in `tests/gear.test.mjs` is a synthetic upgraded-and-affixed save captured from unchanged main at `b27c9a9412c072368dfd70bb80e4b4cc516e46e5`. It verifies import preserves item modifications, stats, points, gear, inventory, materials and currency without recharging; it also verifies the next upgrade charges only its new regional cost.

Validation:

- Red first: `node tests/gear.test.mjs` failed on missing regional mappings, unpreserved next-upgrade material routing and absent receipt-gated regional recipes. Log: `/tmp/g1c-gear-red.log`.
- `node tests/gear.test.mjs`: 36 passed, 0 failed.
- `node tests/workshop-ui.test.mjs`: 3 passed, 0 failed; the harness now expects future chapter recipes to be hidden until their receipt.
- `npm test`: 43 test files passed, 0 failed.
- `node --check dist/gear.js && node --check tests/gear.test.mjs && node --check tests/workshop-ui.test.mjs && git diff --check`: passed.
- Standalone packaging in a temporary copy: `Packaged v0.14.1`.

No item, art, catalog price, combat or spec numbers changed. The only new numeric values are the G1-C exchange inputs and coin costs listed above; they pass the no-profit proof. Catalog remains at 154 items and 32 material art entries. No interface layout changed, so a phone layout check did not apply.
