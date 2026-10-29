# Ability Progression and Loadouts

The shared ability library supports classless builds. Players learn abilities individually, equip a small active loadout, and choose one passive. Every character can still Attack, Guard, Recover, Withdraw, or use the encounter-specific Vent action without learning or equipping an ability. One submitted action resolves one exchange; ability effects never submit a later action.

## Learning and equipping

Fresh characters know Arc Bolt and Prepared. Arc Bolt is equipped in the first active slot; Prepared occupies the passive slot. Learning is an explicit out-of-encounter action. Eligibility comes from level, completed quests, and qualifying encounter use. Learning an ability does not equip it. All abilities are shared rather than class-exclusive, and stat choices do not remove the re-equip path.

A loadout has three active slots, one passive slot, and six total attunement. Active and passive costs use one shared budget. Replacing a passive or adding an ability is atomic: a change that would exceed a slot or the budget leaves the existing loadout intact. The starter Arc Bolt plus Prepared costs two attunement.

| Ability | Type | Cost | Learning eligibility | Effect |
|---|---:|---:|---|---|
| Arc Bolt | Active | 1 | Starting ability | 1.25× spell damage, 12 mana, focus required |
| Brace | Active | 1 | Complete the first quest | Guard and a 20-point barrier, 2-round cooldown |
| Disrupt | Active | 2 | Level 3 and complete two quests | 0.65× weapon damage; interrupt a telegraphed heavy attack on hit, 3-round cooldown |
| Mend | Active | 2 | Level 2 and complete the first quest | Heal missing health from encounter damage, 18 mana, 2-round cooldown |
| Driving Strike | Active | 1 | Level 3 and complete the first quest | 1.15× physical weapon damage, 8 stamina |
| Aegis | Active | 2 | Level 5 and complete two quests | Barrier for two enemy responses, capped at 30% maximum health, 12 stamina |
| Expose | Active | 1 | Level 4 and complete the first quest | The next damaging action gains 20% damage, 8 stamina |
| Prepared | Passive | 1 | Starting ability | Begin an encounter with 10 extra mana and stamina |
| Sure Footing | Passive | 1 | Level 2 and complete the first quest | +8 evasion |
| Reservoir | Passive | 2 | Level 2 and either complete the first quest or make two useful Guards | A Guard that prevents at least 20 damage charges the next Arc Bolt for +10% raw damage |

Arc Bolt and the combined Wardcast action use the same learned and equipped ability. Wardcast applies Arc Bolt at 0.85× damage and Guard in the same exchange; it still needs a focus and shield. It consumes one Arc Bolt slot and one player action.

## Combat actions and timing

The engine exposes action descriptions and a current reason when an action is unavailable: no encounter, an unlearned or unequipped ability, insufficient resources, cooldown, missing focus or shield, or an unavailable encounter mechanic. The UI can show that reason without changing the encounter.

Brace and Disrupt cooldowns use the encounter round counter. Their normal values leave two and three full player exchanges unavailable, respectively. Aegis has a three-round cooldown. Barrier from Aegis lasts through two enemy responses. Applying a barrier respects the 30%-of-maximum-health cap and keeps the larger existing barrier rather than stacking it; a smaller Brace does not shorten a longer barrier already in place. Expose applies to one damaging action in the immediately following exchange. If that exchange is Guard, Recover, or another nondamaging action, Expose expires at the end of the exchange. A consumed Expose expires whether the strike hits or glances. Reservoir charge cannot stack and expires after the next exchange.

Aegis currently costs 12 stamina, raises a fixed 55 + 8 per mastery rank barrier, and has a three-round cooldown. It does not require focus equipment. This is a prototype departure from the historical combat-math proposal, which used 16 mana, an Intellect/Will-scaled barrier, and a two-round cooldown; the stamina cost keeps the defensive action available to non-casters and the current barrier formula stays easy to preview. Expose also uses a simple damage multiplier rather than the historical proposal's partial armor/ward bypass.

Useful contribution is recorded only when an ability changes the encounter: damage to the enemy, a real interrupt, healing damage taken from the enemy, an absorbed barrier, or Expose amplifying a later damaging action. Mastery is awarded only on qualifying victory, with at most three distinct ability marks per encounter. No mark is earned for an ineffective heal, unused barrier, missed interrupt, or a victory below the encounter qualification threshold. One tap remains one exchange; action delay and recovery rules apply uniformly.

## Mastery

Newly learned abilities begin at rank 1. A useful victory grants one mark to each contributing equipped ability, up to three marks per encounter. Rank 1→2 costs 5 marks and rank 2→3 costs 7. Mastery stops at rank 3 in this slice.

- Arc Bolt adds 4 spell damage per rank. At rank 3, choose a 9-mana cast or 15% more damage.
- Brace adds 5 barrier per rank. At rank 3, choose 15 more barrier or a cooldown one exchange shorter.
- Disrupt increases its weapon coefficient by 0.05 per rank. At rank 3, choose 15% more damage or reduce interrupt immunity by one exchange.
- Mend adds 5 healing per rank. At rank 3, choose 15% more healing or a cooldown one exchange shorter.
- Driving Strike adds 0.05 to its weapon coefficient per rank. Aegis adds 8 barrier per rank. Expose gains 5 percentage points of damage per rank.

Rank-3 choices are made outside encounters, shown with their descriptions, and persist in the save. They modify the ability without creating another action or resource loop.

## Save compatibility

Version 1 and version 2 saves retain all previously usable core actives and passives as learned abilities. Migration equips Arc Bolt, Brace, and Disrupt, then preserves a valid existing passive; this loadout fits the six-point budget. Any learned ability can be equipped again outside an encounter. New version 3 state is normalized and checked for valid ability IDs, slot limits, passive type, mastery ranks, and attunement before use.
