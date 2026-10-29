# Incremental Leveling and Character Creation

This prototype uses four rewarded parts for each full level. Part 1 is the starting state. Crossing a part threshold grants one attribute point, including the part 4 threshold that wraps to the next level's part 1. Wrapping a level grants no additional points. The level cap is 10; reaching level 10 part 1 has awarded 36 progression points from the nine completed levels, and no further XP or points are awarded.

## XP curve and part thresholds

The old per-level requirement is multiplied by three:

`XP required at level L = 3 × (100 + 40 × (L − 1) + 8 × (L − 1)²)`

Level 1 therefore takes 300 XP. The four cumulative thresholds use `ceil(levelXP × part / 4)`, so no XP is discarded when a level requirement is not divisible by four.

| Current level | XP for full level | Part 2 at | Part 3 at | Part 4 at | Wrap at |
|---:|---:|---:|---:|---:|---:|
| 1 | 300 | 75 | 150 | 225 | 300 |
| 2 | 444 | 111 | 222 | 333 | 444 |
| 3 | 636 | 159 | 318 | 477 | 636 |
| 4 | 876 | 219 | 438 | 657 | 876 |
| 5 | 1,164 | 291 | 582 | 873 | 1,164 |
| 6 | 1,500 | 375 | 750 | 1,125 | 1,500 |
| 7 | 1,884 | 471 | 942 | 1,413 | 1,884 |
| 8 | 2,316 | 579 | 1,158 | 1,737 | 2,316 |
| 9 | 2,796 | 699 | 1,398 | 2,097 | 2,796 |

XP remains cumulative within the current level. A single reward can cross several part and level boundaries; every crossed part is awarded once and leftover XP carries forward. Any leftover XP at the level 10 cap is discarded. The exported `progression(state)` helper reports current level and part, XP within the part and level, the next part reward, total points earned from progression, and the cap state. A compact growth entry records multi-part gains.

## Early pacing with minor and major contracts

The authored introduction puts a short minor contract before the first major contract, then advances the rescue through encounters and explicit objectives. At level 1, Ledger Rat victories award 32 XP each. Completing the three-rat minor contract adds 32 XP, for 128 total: the player crosses Part 2 at 75 XP and has 53 XP toward Part 3. The three additional rats for the major contract add 96 XP; its 88 XP receipt brings the opening sequence to 312 XP. That reaches level 2 part 1 and awards all four level-1 points. The passage and rescue objectives are player actions and award no extra combat XP.

This gives the first major chapter a meaningful short-term reward before the full level arrives. Side contracts can add additional XP and materials, while each encounter still requires an explicit tap. These figures should be checked against playtests if encounter rewards, contract objectives, or the XP curve change.

## Attribute budget

The level 1 character budget remains 68: 56 baseline points across seven attributes and 12 points distributed in the selected starter build. Every progression part adds one point. At level L, part P, the total invested budget is `68 + 4 × (L − 1) + (P − 1)`. A free reset returns this entire budget to the player while leaving the earned progression and gear untouched. Gear bonuses remain outside the invested budget.

Abilities and equipment continue to check full character level. Part progress does not satisfy a level requirement. Arc Bolt remains available to every character from level 1. Driving Strike is also learnable at level 1 and has no quest requirement, so physical starter kits can begin with a relevant active ability.

## Migration from versions 1–3

Migration preserves the character's current level, invested attributes, and unspent points. The fraction of the old within-level XP requirement is mapped to the same fraction of the new three-times requirement. Each new part threshold already crossed at that mapped fraction grants one attribute point. Version 4 saves record the mapped XP and part, so loading the migrated save again does not repeat those awards. Level 10 remains capped and gains no migration points.

## Character creation and starter equipment

`createCharacter({name, race, origin, kit, stats?})` validates a new level 1 character and returns `null` for invalid options. Names may contain 1–32 characters after trimming; origins may contain 1–70. Race is Human or Stonekin. Both races use the same attribute budget and ability access. The four starter kits are:

| Kit | Weapon and offhand | Starting distribution | Starting active |
|---|---|---|---|
| Bulwark | Inspector's Rod and Salvaged Buckler | 8 Might, 8 Finesse, 12 Intellect, 12 Vitality, 12 Will, 8 Insight, 8 Luck | Arc Bolt |
| Caster | Inspector's Rod and Chalkbound Focus | 8 Might, 8 Finesse, 16 Intellect, 8 Vitality, 12 Will, 8 Insight, 8 Luck | Arc Bolt |
| Duelist | Surveyor's Blade and Canalstone Charm | 8 Might, 16 Finesse, 8 Intellect, 8 Vitality, 8 Will, 12 Insight, 8 Luck | Driving Strike |
| Breaker | Canal-Iron Sword and Salvaged Buckler | 16 Might, 8 Finesse, 8 Intellect, 12 Vitality, 8 Will, 8 Insight, 8 Luck | Driving Strike |

Each character also starts with a Patched Workcoat, Prepared, and 20 coins. The satchel contains only the selected weapon, offhand, and coat; a character cannot sell a starter item and recreate it through a free practice preset. Practice changes a loadout only when the character owns both selected pieces. A custom `stats` option must contain exactly the seven known attributes, each at least 8, summing to 68.

## Physical and spell actions

The familiar primary actions follow the weapon and equipped abilities. A focused spell weapon with equipped Arc Bolt uses Arc Bolt and Wardcast. A physical weapon with equipped Driving Strike uses Driving Strike and Guardstrike. Otherwise, the bar falls back to Attack and Defend.

Driving Strike costs 8 stamina and deals 1.15× damage through the equipped weapon's channel. Sword strikes scale with Might, blades with Finesse, and a rod uses its existing spell channel. Guardstrike costs 10 stamina and combines a 0.80× physical weapon strike with Guard in one exchange; it requires a shield and Driving Strike equipped. It does not require a focus or mana. Both are single accepted actions and share the 650 ms pacing rule. A physical character may learn and equip Arc Bolt too, then use it when they obtain a focus.
