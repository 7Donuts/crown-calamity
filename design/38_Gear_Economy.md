# Gear economy

The outfitter sells a complete base catalog of 80 items: ten weapons, ten offhands, ten each of head, body, hands, feet, and relic items, plus ten accessories shared by both accessory slots. The 25 original base IDs remain stable for saves, recipes, drops, and story references. The relic IDs are `signet`, `seal`, `threadSpool`, `patchworkHeart`, `luckyButton`, `dreamBell`, `thimbleGuard`, `amberMarble`, `ribbonKnot`, and `stuffingSatchel`.

Items carry a content tier for sorting and loot presentation. Tier never blocks buying, equipping, selecting a slot, or buying and equipping in one action. Prices scale by category base × 2.4^(tier − 1), rounded to a whole coin. Display the tier as “Tier N,” never as a required level.

| Category | Base price | Tier 1 | Tier 6 | Tier 8 |
| --- | ---: | ---: | ---: | ---: |
| Weapon | 30 | 30 | 2,389 | 13,759 |
| Offhand | 28 | 28 | 2,230 | 12,842 |
| Head | 25 | 25 | 1,991 | 11,466 |
| Body | 32 | 32 | 2,548 | 14,677 |
| Hands | 25 | 25 | 1,991 | 11,466 |
| Feet | 25 | 25 | 1,991 | 11,466 |
| Accessory | 35 | 35 | 2,787 | 16,053 |
| Relic | 90 | 90 | 7,166 | 41,278 |

The catalog contains 10 items in each category (80 items total). Prices shown are the rounded formula results; they reflect each item’s content tier.

The catalog keeps combat bonuses modest: later weapons rise in base damage by small steps and armor pieces gain restrained armor, ward, and attribute bonuses. The established combat reductions and PvP prevention ceiling remain responsible for bounding their effect. The three weapon styles remain heavy physical, precision physical, and focus-tagged caster; `pike` is the single two-handed weapon. Offhands include shield, focus, and ward roles.

Every catalog ID maps to a frame from the existing generated item atlas in `dist/item-art.js`; no new icon art is drawn in code. Relics carry their mechanic key in `relicEffect` so the relic rules can present and resolve them. The Signet retains its +Will and ward stats and adds two mana to Recover; the Seal keeps its established once-per-fight barrier. Existing recipes and upgrade/affix systems keep their material keys and operations. Resale stays below the purchase price, and crafted outputs cap their sale value at their recipe’s coin cost (one coin for the fragment-forged relics), so crafting and selling cannot turn recipe inputs into a coin profit.
