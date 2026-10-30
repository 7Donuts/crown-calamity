# G1-C regional workshop economy preflight

Read-only preparation from `/workspace/sites/crown-and-calamity` at `abfa97e`. No game source or tests were changed. This document preserves the read-only preparation notes in the repository. This is recipe-routing and audit preparation only; it makes no balance conclusions before B0 is approved.

## Current rules and constraints

`upgradeCost(item, level)` charges one material family based on the item shape: physical weapon → Canal iron, spell weapon → Runic residue, armor item → Salvaged fittings, ward item → Repair fittings, other gear → Runic residue. The material amount is 1 for upgrade levels 0 and 1, then 2 for the third upgrade. Chapter coin multipliers are 1/1/4/16/64/256, applied to 35/70/120 coins. `affixCost` multiplies the affix's current coin cost by the item's chapter multiplier but keeps the affix's static Chapter 1 material. Reapplying the same affix is rejected; replacing it charges for the new affix. Existing itemMods already encode paid upgrades/affixes, so changing future previews should not retroactively charge anything.

There are 9 material-only Chapter 1 conversions (`ledger_fittings`, `iron_fittings`, `repair_parts`, `residue_parts`, `shell_parts`, `brass_parts`, `fragment_glass`, `salvage_glass`, `fittings_repair`) plus 5 craft recipes (`craft_cap`, `craft_boots`, `craft_gate_shield`, `fragment_seal`, `fragment_band`). Chapter 1 is already much denser than the proposed 2–3 regional recipes per later chapter. Avoid adding generic C1 conversions; preserve existing recipe IDs and test their compatibility.

Spec 49 needs two regional materials at 3 each plus 1 boss material for rank 2, then 6 each plus 3 boss material for rank 3; it charges coins equal to the relic price, then twice that amount. Boss materials are Floodglass Fragment / “Drum fragment”, Golden token, Garden medallion, Keepsake key, and Velvet star. The Chapter 1 delve can be repeated after a clear. Later chapter bosses are tied to an active finale objective and cannot be started again after that objective is complete or claimed, so the current story route supplies one guaranteed boss material per later chapter unless another source is added. Rank 3 therefore needs a deliberate supply path; don’t make the one story drop a consumable exchange input by default.

## Conservative chapter-to-material routing

Use four *nonboss regional materials* as the recipe families for each item's own chapter. Keep upgrade costs at one family and the same 1/1/2 quantity pattern. Apply the same routing to affixes by intent: Keen and Might use the physical family; Focused and Insight use the spell family; Sturdy and Vigor use the armor family; Warded and Tide use the ward family. For gear without a clear armor/ward field, retain the existing Runic-family fallback. Chapter 1 is the historical exception in quantity of exchange recipes; it can use this mapping without adding more recipe surface.

| Chapter | Physical weapon / Keen / Might | Spell / Focused / Insight | Armor / Sturdy / Vigor | Ward / Warded / Tide | Boss material |
| --- | --- | --- | --- | --- | --- |
| 1 | Canal iron | Runic residue | Ledger scraps | Floodglass | Floodglass Fragment |
| 2 | Prize gears | Arcade lint | Glass marbles | Tin wheels | Golden token |
| 3 | Sprinkler brass | Bright feathers | Garden seeds | Silvershell | Garden medallion |
| 4 | Clock springs | Moth velvet | Packing twine | Soft buttons | Keepsake key |
| 5 | Carousel brass | Painted papier-mâché | Ringmaster ribbon | Velvet tickets | Velvet star |

This uses one item-chapter lookup and `MATERIAL_CHAPTER` validation, so a recipe-material mismatch is easy to detect. It also keeps boss materials out of ordinary upgrade/affix costs. Other local materials remain useful as exchange inputs or story rewards rather than being assigned to every cost family.

## Regional exchange footprint

Chapter 1 already has 9 conversions and 5 crafts, so add none. It already has one boss-fragment material exchange (`fragment_glass`); keep it as the sole boss-material conversion and test it alongside rank costs and the two fragment crafts. Chapters 2–5 can start with two one-way common-material routes each, plus at most one rank-supply recipe keyed to that chapter's boss material:

| Chapter | Regional conversion A | Regional conversion B | Optional third recipe for rank supply |
| --- | --- | --- | --- |
| 2 | Arcade tokens → Prize gears | Tin wheels → Glass marbles | Local regional materials + coins → 1 Golden token |
| 3 | Garden twine → Garden seeds | Silvershell → Sprinkler brass | Local regional materials + coins → 1 Garden medallion |
| 4 | Attic ribbon → Packing twine | Soft buttons → Clock springs | Local regional materials + coins → 1 Keepsake key |
| 5 | Velvet tickets → Ringmaster ribbon | Painted papier-mâché → Carousel brass | Local regional materials + coins → 1 Velvet star |

The table indicates direction and grouping, not approved costs or balance. Choose only materials that are actually earned in the region; keep the input and output in the same `MATERIAL_CHAPTER` so `recipeRegion` places the recipe correctly. Regional-to-boss recipes should be optional, one recipe per boss material, and should consume enough local resources and coins to be an intentional rank-supply choice. The guaranteed finale drop remains available for rank 2; additional rank-3 supply comes from the costly regional route instead of requiring an unavailable boss replay. If B0/G1A income data says the local supply cannot support the rank gate, revise costs from that evidence.

A boss material can be spent by the rank system and by at most one exchange definition. Avoid boss-material-to-common-material recipes in Chapters 2–5: they would compete directly with relic progression and would not solve the one-time boss availability. Chapter 1's legacy conversion/crafts are the exception to account for explicitly.

## Mixed material/item/coin no-profit proof

A regression test that checks only exchange input and output material counts is insufficient. Model each repeatable workbench action as a resource transition, including:

- `EXCHANGES`: coins, every input material, and any crafted item output;
- market purchases and capped item resale;
- item upgrade states 0→1→2→3, including resale bonus caps;
- affix application and replacement on the same item;
- relic rank upgrades and sale (rank loss does not create value).

Hunts, contracts, and boss claims are outside the workbench graph as resource sources; they are not actions in a loop. For the finite material/item catalog, assign nonnegative potential values to each material and each item state, with coin value fixed at 1. Require every workbench transition to have input potential at least output potential. If one feasible assignment exists, every closed loop is non-increasing in total potential, which proves no recipe/craft/upgrade/affix/sell cycle can return a net-positive bundle of coins and materials. The sale transition must use the actual `CHAPTER_SALVAGE` and craft caps, not item sticker prices. Include item ownership as a state dimension for crafted items; selling one removes ownership and can make its recipe repeatable.

If the potential constraints are infeasible, search for a concrete positive cycle and report the exact recipe/buy/sell/upgrade sequence; do not weaken the test to a short fixed-depth recipe enumeration. Separately assert each individual direct buy/sell cycle loses value and each upgrade/re-affix sale return is lower than its coin and material inputs. Keep gameplay drops outside the loop proof so guaranteed drops do not accidentally count as a workshop-created resource.

## Recipe gate and UI/API mismatch

`recipeRegion` groups a recipe by the highest chapter among its *input* materials. The Sewing Kit UI hides later chapter groups until their receipt is unlocked, but `exchangeMaterials` in `dist/gear.js` does not check `recipeRegion` or `chapterUnlocked`; a direct shared-API call can exchange a later recipe early. Existing `level` fields on C1 craft recipes (1, 2, 3, 8) are not enforced by the engine or the UI. Before adding recipes, decide whether these are real requirements; if so, enforce them in the shared action API as well as the UI, with direct tests for locked chapter/level cases. If they are informational metadata, remove or document them rather than implying a gate. Duplicate crafted-item ownership is checked in the API, but selling an item reopens the craft recipe, so resale must be part of the loop audit.
