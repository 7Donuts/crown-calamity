# Gear economy

The outfitter sells a complete base catalog of 100 items: ten Might/heavy weapons, ten magic/spell weapons, ten Finesse/precision weapons, ten offhands, ten each of head, body, hands, feet, and relic items, plus ten accessories shared by both accessory slots. The 25 original base IDs remain stable for saves, recipes, drops, and story references. The relic IDs are `signet`, `seal`, `threadSpool`, `patchworkHeart`, `luckyButton`, `dreamBell`, `thimbleGuard`, `amberMarble`, `ribbonKnot`, and `stuffingSatchel`.

Items carry a content tier for sorting and loot presentation. Tier never blocks buying, equipping, selecting a slot, or buying and equipping in one action. Nonweapon prices scale by category base × 2.4^(tier − 1), rounded to a whole coin. Every weapon channel has tiers 1–10 and uses `round(100 × 100^((tier − 1) / 9))`, from 100 coins at tier 1 to 10,000 at tier 10. Display the tier as “Tier N,” never as a required level.

| Weapon tier | Price |
| ---: | ---: |
| 1 | 100 |
| 2 | 167 |
| 3 | 278 |
| 4 | 464 |
| 5 | 774 |
| 6 | 1,292 |
| 7 | 2,154 |
| 8 | 3,594 |
| 9 | 5,995 |
| 10 | 10,000 |

| Category | Base price | Tier 1 | Tier 6 | Tier 8 |
| --- | ---: | ---: | ---: | ---: |
| Weapon | tier curve above | 100 | 1,292 | 3,594 |
| Offhand | 28 | 28 | 2,230 | 12,842 |
| Head | 25 | 25 | 1,991 | 11,466 |
| Body | 32 | 32 | 2,548 | 14,677 |
| Hands | 25 | 25 | 1,991 | 11,466 |
| Feet | 25 | 25 | 1,991 | 11,466 |
| Accessory | 35 | 35 | 2,787 | 16,053 |
| Relic | 90 | 90 | 7,166 | 41,278 |

The catalog contains 10 items in each nonweapon category and 10 weapons in each of the three channels (100 items total). Prices shown are the rounded formula results; they reflect each item’s content tier.

The catalog keeps combat bonuses modest: later weapons rise in base damage by small steps and armor pieces gain restrained armor, ward, and attribute bonuses. The established combat reductions and PvP prevention ceiling remain responsible for bounding their effect. The three weapon styles remain heavy physical, precision physical, and focus-tagged caster; `pike` is the single two-handed weapon. Offhands include shield, focus, and ward roles.

Every catalog ID maps to a frame from the existing generated item atlas in `dist/item-art.js`; no new icon art is drawn in code. Relics carry their mechanic key in `relicEffect` so the relic rules can present and resolve them. The Signet retains its +Will and ward stats and adds two mana to Recover; the Seal keeps its established once-per-fight barrier. Existing recipes and upgrade/affix systems keep their material keys and operations. Resale stays below the purchase price, and crafted outputs cap their sale value at their recipe’s coin cost (one coin for the fragment-forged relics), so crafting and selling cannot turn recipe inputs into a coin profit.

## Saving for a 10,000-coin weapon

Run `npm run economy`. This seeded offline simulation calls the production engine and is never imported into gameplay. Twelve seeds each for Breaker/Wolf, Duelist/Bunny, and Caster/Unicorn, with two selling policies, give 72 campaign runs. Characters start at level 1 with the normal 20 coins and their selected starter equipment, spend no gold, equip no dropped gear, allocate earned points to their primary attack attribute, and choose the highest ordinary hunt at or below their current level. After a defeat they fall back two levels until the next level-up. The policy responds to declared heavies unless the skill's normal hit would finish the enemy. Unavailable skills fall back to Attack. Mastery, drops, duplicate salvage, XP, coin rewards and rest all use their actual rules.

The time model allows 1.5 seconds per combat input, 2 seconds per hunt for opening/results, the actual four-second rest between fights (or the longer wound deadline), and 1.5 seconds per item sold. Starting equipment is retained. Contracts, Special Edition bonuses, material sales, purchases, upgrades, navigation time, reading and breaks are excluded. Lower sample endpoints are not a universal minimum.

| Policy | Median across each of the three builds | Range across all 36 runs | Typical wins |
| --- | --- | --- | --- |
| Save encounter coins; keep drops | 58–60 minutes | 58–61 minutes | 276 |
| Also sell every unequipped drop | 31–33 minutes | 27–38 minutes | 148–152 |

At 2.5 seconds per combat input, those same runs would add roughly 21 minutes without sales or 11 minutes with sales. Early contracts can help; spending gold extends the savings period. Reading and navigation are not measured here. These are estimates for focused active play, not promises of human completion time. The current six-item equipment drop pool has saleable items with high nonweapon tier prices, so selling gear can provide more than half of this savings target. The 10,000 price alone does not make a weapon a multi-day goal.

For a character who already has the relevant hunt unlocked and starts with 20 coins, base encounter rewards alone require 1,109 rat wins (9 coins each), 713 raccoon wins (14), 555 wisp wins (18), 384 crab wins (26), 286 appraiser wins (35), or 222 dog wins (45). This excludes bonuses and sales and does not include unlocking those enemies. Boss rewards are excluded because it is not an ordinary repeatable hunt.
