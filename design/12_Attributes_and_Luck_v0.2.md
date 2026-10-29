# Attributes and Luck — playable v0.2

Current implementation decisions following the user's request to build out stats and add Luck. Numbers remain prototype balance choices. This update supersedes the original six-attribute budget; the original design documents remain available as historical source.

## Seven shared attributes

| Attribute | Effects |
| --- | --- |
| Might (MIG) | Heavy weapon power: 2×MIG + level |
| Finesse (FIN) | Precision power, physical accuracy, stamina, evasion, critical chance |
| Intellect (INT) | Spell power, mana, Mend healing |
| Vitality (VIT) | Maximum health and stamina |
| Will (WIL) | Mana, health, spell accuracy, Mend healing |
| Insight (INS) | Physical/spell accuracy and evasion |
| Luck (LCK) | Critical chance and equipment-drop chance, with diminishing returns |

Minimum invested value: 8 each. Starting budget: 68 = 7×8 baseline + 12 starter investment. Total budget at level E: 68 + 4×(E−1). Free respec returns all discretionary points and leaves the seven baseline values at 8. Gear bonuses are separate. Attribute and equipment changes remain unavailable inside encounters and expeditions.

## Resource and rating rules

- Health: 200 + 12×level + 10×VIT + 4×WIL.
- Stamina: 60 + 2×VIT + 2×FIN.
- Mana: 60 + 3×WIL + 2×INT.
- Physical accuracy: 2×FIN + INS + 2×level.
- Spell accuracy: 2×INS + WIL + 2×level.
- Evasion: FIN + 2×INS + 2×level, plus 8 with Sure Footing.
- Spell power: 2×INT + level. Precision power: 2×FIN + level.
- Mend: floor(40 + 1.4×INT + 0.8×WIL + 5×mastery).
- Damage mitigation: defense / (defense + 100 + 8×attacker level), capped at 65%.
- Solid-hit chance: clamp(85% + 30%×(accuracy−evasion)/(accuracy+evasion+40), 65%, 98%). Failed solid hits glance for 55% damage. Critical rolls occur on solid hits only.

All attribute effects use invested stats plus equipment. Attribute previews calculate the complete before/after totals. Damage previews use the same calculation as submitted combat actions. Selected enemy level affects mitigation. Enemy armor/ward and live stances affect damage. A neutral target preview excludes transient encounter effects.

## Luck

Define bonus Luck B = max(0, total LCK−8), and fortune F = B/(B+40).

- Equipment-drop chance = 20% + 15%×F, approaching 35%.
- Critical chance = clamp(5% + 15%×FIN/(FIN+208) + 10%×F, 5%, 25%).
- Critical damage remains 1.25×. No random critical rewards or extra critical turns.

| Total Luck | Equipment-drop chance | Extra critical chance from Luck |
| --- | --- | --- |
| 8 | 20.00% | +0.00 percentage points |
| 12 | 21.36% | +0.91 percentage points |
| 28 | 25.00% | +3.33 percentage points |
| 48 | 27.50% | +5.00 percentage points |

Luck never changes guaranteed encounter XP, coins, materials, quest completion, or the guaranteed first-clear boss choice. It does not alter combat timing, bypass the shared 650 ms delay, add exchanges, or create offline progress. There is no rarity tier system in this prototype, so Luck does not claim to improve rarity.

Equipment-drop chance is captured at encounter entry and shown on victory. Eligible item selection remains uniform within the level-appropriate pool; an owned duplicate becomes one salvaged fitting. A Copper-Thread Charm (+4 LCK, accessory) costs 25 coins and is in the level-1 pool. Its gear bonus does not increase the invested budget.

## Compatibility and future authority

Version-1 saves migrate to version 2 by adding invested Luck 8 while preserving all existing six-stat allocations and unspent points. Reimporting a migrated save never adds another grant. The original build's health, resources, and baseline combat formulas are preserved; critical chance no longer decreases as Insight increases.

These are local prototype rules. The future server must validate allocation budgets, equipment ownership, critical/loot rolls, and reward claims. When moving online, the server must capture Luck and the loot chance at encounter start, rather than trusting browser-supplied statistics or roll outcomes.
