# Incremental Leveling and Character Creation

Each completed level grants four attribute points. XP accumulates continuously within the current level; partial progress grants no points. The level cap is 10; reaching level 10 awards 36 progression points from the nine completed levels, and no further XP or points are awarded.

## XP curve

The per-level requirement remains:

`XP required at level L = 3 × (100 + 40 × (L − 1) + 8 × (L − 1)²)`

Level 1 therefore takes 300 XP. The XP curve is unchanged.

| Current level | XP for full level |
|---:|---:|
| 1 | 300 |
| 2 | 444 |
| 3 | 636 |
| 4 | 876 |
| 5 | 1,164 |
| 6 | 1,500 |
| 7 | 1,884 |
| 8 | 2,316 |
| 9 | 2,796 |

XP remains cumulative within the current level. A single reward can cross several level boundaries; each completed level grants four points and leftover XP carries forward. Any leftover XP at the level 10 cap is discarded. The exported `progression(state)` helper reports current level, XP within the level, required XP, next reward, total points earned from progression, and cap state.

## Early pacing with minor and major contracts

The authored introduction puts a short minor contract before the first major contract, then advances the rescue through encounters and explicit objectives. At level 1, Ledger Rat victories award 32 XP each. Completing the three-rat minor contract adds 32 XP, for 128 total: the player has 128 of the 300 XP needed for level 2. The three additional rats for the major contract add 96 XP; its 88 XP receipt brings the opening sequence to 312 XP. That reaches level 2 and awards all four level-1 points. The passage and rescue objectives are player actions and award no extra combat XP.

This gives the first major chapter a meaningful short-term reward before the full level arrives. Side contracts can add additional XP and materials, while each encounter still requires an explicit tap. These figures should be checked against playtests if encounter rewards, contract objectives, or the XP curve change.

## Attribute budget

The level 1 character budget remains 68: 56 baseline points across seven attributes and 12 points distributed in the selected starter build. Each full level adds four points. At level L, the total invested budget is `68 + 4 × (L − 1)`, plus any legacy partial-level points already awarded. A free reset returns this entire budget to the player while leaving the earned progression and gear untouched. Gear bonuses remain outside the invested budget.

Abilities continue to check full character level. Equipment tiers do not impose a character-level requirement. Arc Bolt remains available to every character from level 1. Driving Strike is also learnable at level 1 and has no quest requirement, so physical starter kits can begin with a relevant active ability.

## Migration from versions 1–4

Migration preserves the character's current level, XP, invested attributes, and unspent points. Versions 1–3 map the fraction of the old within-level XP requirement to the same fraction of the three-times requirement, then preserve points already paid by crossed legacy thresholds. Version 4 XP is already normalized and remains unchanged. A hidden `levelPointsPaid` value tracks the 0–3 legacy points already awarded in the current level; reaching the next full level grants only the remainder needed to reach four, then clears that value. This prevents loss of earned points without granting duplicate lifetime points. Migration runs once and removes the old part marker; level 10 remains capped.

## Character creation and starter equipment

`createCharacter({name, race, origin, kit, stats?})` validates a new level 1 character and returns `null` for invalid options. Names may contain 1–32 characters after trimming; origins may contain 1–70. The five plush types use the same attribute budget and ability access; see `30_Races_and_Identity.md` for their base spreads and passives. The kit distributions below are historical custom-build examples; choosing a kit does not replace the selected plush type’s base attributes. The four starter kits are:

| Kit | Weapon and offhand | Starting distribution | Starting active |
|---|---|---|---|
| Bulwark | Inspector's Rod and Salvaged Buckler | 8 Might, 8 Finesse, 12 Intellect, 12 Vitality, 12 Will, 8 Insight, 8 Luck | Arc Bolt |
| Caster | Inspector's Rod and Chalkbound Focus | 8 Might, 8 Finesse, 16 Intellect, 8 Vitality, 12 Will, 8 Insight, 8 Luck | Arc Bolt |
| Duelist | Surveyor's Blade and Canalstone Charm | 8 Might, 16 Finesse, 8 Intellect, 8 Vitality, 8 Will, 12 Insight, 8 Luck | Driving Strike |
| Breaker | Canal-Iron Sword and Salvaged Buckler | 16 Might, 8 Finesse, 8 Intellect, 12 Vitality, 8 Will, 8 Insight, 8 Luck | Driving Strike |

Each character also starts with a Patched Workcoat, Prepared, and 20 coins. The satchel contains only the selected weapon, offhand, and coat; a character cannot sell a starter item and recreate it through a free practice preset. Practice changes a loadout only when the character owns both selected pieces. A custom `stats` option must contain exactly the seven known attributes, each at least 8, summing to 68.

## Physical and spell actions

The familiar primary actions follow the weapon and equipped abilities. A focused spell weapon with equipped Arc Bolt uses Arc Bolt and Wardcast. A physical weapon with equipped Driving Strike uses Driving Strike and Guardstrike, except that a precision weapon (a blade) with no shield uses Driving Strike and Sidestep. Otherwise, the bar falls back to Attack and Defend.

Driving Strike costs 10 stamina and deals 1.15× damage through the equipped weapon's channel. Sword strikes scale with Might, blades with Finesse, and a rod uses its existing spell channel. Guardstrike costs 12 stamina and combines a 0.80× physical weapon strike with Guard in one exchange; it requires a shield and Driving Strike equipped. It does not require a focus or mana. Sidestep costs 12 stamina and combines a 0.80× precision weapon strike with Guard in one exchange; it requires a precision weapon, no shield and Driving Strike equipped, and uses Driving Strike mastery. Guarding a declared heavy attack prevents 65% of it and grants Opening (design 14, "Reading the telegraph"). These are single accepted actions and share the 650 ms pacing rule. A physical character may learn and equip Arc Bolt too, then use it when they obtain a focus.
