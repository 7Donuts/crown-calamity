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
