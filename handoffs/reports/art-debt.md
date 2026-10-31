# Art debt

No new art debt from C0. Existing unique equipment and material art is preserved. Future handoff tasks must record any approved temporary reuse here.

## G2-2 Campaign Menders (Design 46, Decision D1)

Ten campaign menders have been added to the catalog (`dist/gear.js`) with placeholder art registered in `dist/item-art-data.js` under the `"menders"` group pointing to `assets/items/relic-collection.png`. Dedicated bespoke raster art must be generated following `ART-DIRECTION.md` and added to a future equipment sprite atlas:

| Item ID | Display Name | Category | Tier | Chapter | Placeholder Atlas Crop | Borrowed Visual |
|---|---|---|---|---|---|---|
| `threadThimbleKit` | Thread-and-Thimble Kit | Offhand (Mender) | 1 | 1 | `relic-collection.png` [36, 60, 219, 219] | Seal |
| `bandageRoll` | Bandage Roll | Offhand (Mender) | 2 | 1 | `relic-collection.png` [310, 78, 242, 200] | Signet |
| `patchSatchel` | Patch Satchel | Offhand (Mender) | 3 | 2 | `relic-collection.png` [615, 59, 250, 221] | Thread Spool |
| `darningEgg` | Darning Egg | Offhand (Mender) | 4 | 2 | `relic-collection.png` [887, 68, 254, 212] | Patchwork Heart |
| `sewingTin` | Sewing Tin | Offhand (Mender) | 5 | 3 | `relic-collection.png` [1186, 116, 201, 154] | Lucky Button |
| `buttonPouch` | Button Pouch | Offhand (Mender) | 6 | 3 | `relic-collection.png` [63, 325, 261, 236] | Dream Bell |
| `secondChancesSpool` | Spool of Second Chances | Offhand (Mender) | 7 | 4 | `relic-collection.png` [332, 344, 218, 212] | Thimble Guard |
| `feltPatchBook` | Felt Patch Book | Offhand (Mender) | 8 | 4 | `relic-collection.png` [88, 607, 166, 225] | Felt Fang |
| `mendingHoop` | Mending Hoop | Offhand (Mender) | 9 | 5 | `relic-collection.png` [316, 614, 233, 213] | Darned Patch |
| `goldenNeedleCase` | Golden Needle Case | Offhand (Mender) | 10 | 5 | `relic-collection.png` [1143, 313, 233, 248] | Stuffing Satchel |

## G3-2 Becoming Real Trial Enemies (Design 50, Decision D6)

Three dynamic trial enemies (`trial_stitch`, `trial_memory`, `trial_real`, built by `trialEnemy` in `dist/growth.js`) reuse existing enemy illustrations through each enemy's `art` key until bespoke trial guardian portraits are generated following `ART-DIRECTION.md`. They set no `portraitId`:

| Trial Enemy ID | Display Name | Stage | Borrowed Art (`art`) |
|---|---|---|---|
| `trial_stitch` | The Heavy Seam-Tester | 1 (The Stitch-Test) | `crab` |
| `trial_memory` | Unclaimed Memory Keeper | 2 (The Memory-Test) | `attic_hugger` |
| `trial_real` | The Realness Examiner | 3 (The Real-Test) | `fair_boss` |

## Replacement art request: campaign menders (owner, 31 October 2026)

Status: open. The owner will have these illustrated separately. Leave the placeholder crops in place until the new art is delivered; do not draw, recolor or substitute art in code.

Why: each mender currently shows the exact same pixels as a relic (for example, the Thread-and-Thimble Kit is identical to the Seal). That breaks the AGENTS.md and design 54 rule that every equipment ID has its own generated illustration, and it makes a mender and a relic look like the same item in the satchel and shop.

What to produce: one new illustration per mender, following the canonical positive and negative prompts and approved references in `ART-DIRECTION.md` (soft-pixel stuffie style), reviewed at actual rendered size in `dist/art-catalog.html`. Each is a small handheld sewing or repair object a plush could carry in the second hand. None may resemble an existing relic.

| Item ID | Name | Tier | Subject (from the item description) | Must not resemble |
| --- | --- | --- | --- | --- |
| `threadThimbleKit` | Thread-and-Thimble Kit | 1 | A stuffie-scale sewing kit: thimble, short thread | Seal |
| `bandageRoll` | Bandage Roll | 2 | A roll of clean linen bandage | Signet |
| `patchSatchel` | Patch Satchel | 3 | A snug felt pouch packed with patches | Thread Spool |
| `darningEgg` | Darning Egg | 4 | A smooth polished wooden darning egg | Patchwork Heart |
| `sewingTin` | Sewing Tin | 5 | A painted tin with needles and strong thread | Lucky Button |
| `buttonPouch` | Button Pouch | 6 | A velvet drawstring pouch of buttons | Dream Bell |
| `secondChancesSpool` | Spool of Second Chances | 7 | A large spool of high-tensile thread | Thimble Guard |
| `feltPatchBook` | Felt Patch Book | 8 | A bound book of wool felt swatches | Felt Fang |
| `mendingHoop` | Mending Hoop | 9 | An embroidery hoop holding taut fabric | Darned Patch |
| `goldenNeedleCase` | Golden Needle Case | 10 | A fine golden needle case | Stuffing Satchel |

Visual progression: tiers 1 to 10 should read as a clear quality ladder (plain cloth and wood at tier 1; velvet, brass and gold by tiers 8 to 10), matching how the weapon and armor art escalates by chapter.

Integration checklist (per AGENTS.md "Unique item art"):
1. Keep the generated source RGBA pixels; add them to an equipment sprite atlas, not `relic-collection.png`.
2. Replace each mender's crop in `dist/item-art-data.js` (currently the `"menders"` group) with its own measured region.
3. Record measured dimensions, alpha/crop bounds and hashes in `dist/art-manifest.json`; never guess.
4. Keep readable text labels; offline PNG embedding must still work (`python scripts-package.py`).
5. Add a test that no mender crop equals any relic crop (a pixel or region comparison), so the reuse cannot come back.

The lab-only menders `mender_kit` and `bandage_roll` (Playtest Lab only, not sold in the campaign) have no crop; include them if the lab should show art.
