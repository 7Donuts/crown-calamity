# Combat mathematics — prototype candidate

Status: deliberately small, unbalanced first model. These equations make the draft testable. They are not a claim that six stats or the proposed coefficients are optimal.

## Combat experience first

Use a shared RWK-style interaction throughout: one combat tap resolves one player action and one enemy response. A simple action can trigger several equipped effects, but it never authorizes a later exchange. Ordinary enemies should support comfortable repetition; stronger enemies offer more reason to change actions. Choosing faster grants no extra effects within an exchange. Do not add a separate initiative system.

Candidate internal fight lengths remain roughly 5–9 rounds for an ordinary foe, 8–12 for an elite and 10–16 for the first boss. Each exchange requires a separate input, but need not require a fresh strategic decision. Marked tactical challenges should contain useful responses to intent. A reliable repeat action against familiar prey is acceptable.

## Notation

E = effective level. Attributes are nonnegative combat values after gear. m = equipped ability mastery rank, 1–5 long term, capped at 3 in the first slice. A = matching attack accuracy; D = defender evasion. All percentages below are decimal fractions in code. Clamp(x, lo, hi) bounds a value inclusively.

## Resource and rating equations

| Quantity | Candidate equation |
|---|---|
| HP maximum | 200 + 12E + 10VIT + 4WIL |
| Stamina maximum | 60 + 2VIT + 2FIN |
| Mana maximum | 60 + 3WIL + 2INT |
| Physical accuracy | 2FIN + INS + 2E + gear accuracy |
| Spell accuracy | 2INS + WIL + 2E + gear accuracy |
| Evasion | FIN + 2INS + 2E + gear evasion; plate multiplies final evasion by 0.85 |
| Heavy weapon power | 2MIG + E |
| Precision weapon power | 2FIN + E |
| Spell power | 2INT + E |

The weapon or ability selects one power channel. A heavy weapon does not automatically receive both Might and Finesse. A hybrid ability must specify a weighted average, such as half weapon power plus half spell power, rather than adding two full scaling budgets.

Hit chance = clamp(0.85 + 0.30 × (A − D)/(A + D + 40), 0.65, 0.98).

This intentionally limits accuracy advantage. Test whether misses feel worthwhile in a click RPG. If they mainly waste time, replace misses with glancing damage before adding more accuracy complexity.

Critical chance = clamp(0.05 + 0.15 × FIN/(FIN + INS + 200), 0.05, 0.20). A critical multiplies damage by 1.25. Healing and barriers do not crit in this draft.

## Damage pipeline

1. Check requirements, resources, cooldown and action legality on the server.
2. Determine hit and critical outcome once per action. Multi-hit prose does not create extra independent critical rolls.
3. Raw damage = coefficient × (item base + 0.9 × selected power + 4m).
4. Armor mitigates physical damage; ward mitigates elemental/arcane damage. No unmitigated damage channel in the first slice.
5. Mitigation = clamp(defense/(defense + 100 + 8 × attacker E), 0, 0.65).
6. Add conditional increased-damage modifiers together, capped at +50% for this prototype. Apply one combined multiplier, rather than multiplying several bonuses.
7. Apply critical, mitigation and Guard. Guard multiplies incoming hostile damage by 0.65 for this round.
8. Barriers absorb damage before HP. Round down once at the end; a successful damaging action does at least 1 damage before barriers. A fully absorbed action deals 0 HP damage.

For an action split between elements, split raw damage first and apply the relevant defense to each portion. Add the portions before rounding. The prototype needs only physical and arcane channels; more elements can wait.

## Universal actions

| Action | Effect | Cost / limitation |
|---|---|---|
| Basic Strike | Coefficient 1.0 using equipped weapon power | Free; no cooldown |
| Guard | 35% damage reduction for the current round | Free; no mastery farming |
| Recover | Restore 20 stamina and 15 mana | Uses the action; enemy still acts |
| Withdraw | Exit an ordinary encounter, forfeiting its provisional rewards | After one enemy response at 50% damage; unavailable in specified boss lock-in phases, disclosed before entry |

At the end of a completed round, restore 4 stamina and 3 mana, up to maximum. This happens only inside an explicitly initiated encounter, with a fresh explicit input for each exchange. No timer restores resources. Mana is combat endurance, not a daily permission to play.

## Initial learnable abilities

| Ability | Attunement | Cost | Effect at rank m | Cooldown |
|---|---:|---|---|---:|
| Driving Blow | 1 | 12 stamina | Physical coefficient 1.35 | 1 |
| Arc Bolt | 1 | 12 mana | Spell coefficient 1.25; focus required | 0 |
| Brace | 1 | 10 stamina | Guard plus 20 barrier for this round, subject to normal barrier limits | 2 |
| Disrupt | 2 | 14 stamina | Physical coefficient 0.65; on a successful hit, cancel a telegraphed interruptible wind-up | 3 |
| Mend | 2 | 18 mana | Heal 40 + 1.4INT + 0.8WIL + 5m | 2 |
| Aegis | 2 | 16 mana | Barrier of 30 + INT + WIL + 4m for two rounds | 2 |
| Expose | 1 | 8 stamina | Coefficient 0.65; next damaging action ignores 20% of armor or ward | 2 |
| Cinder Mark | 2 | 15 mana | Spell coefficient 0.85; then 10% of post-mitigation initial damage at each of next two round ends | 2 |

Cooldown N means unavailable for the next N complete rounds after use. A cooldown of 1 on round 2 blocks round 3 and permits round 4. Display the exact round it becomes usable.

Expose lasts until consumed or the end of the following round. The Cinder Mark damage-over-time effect cannot crit, refresh itself or trigger another effect. Repeat applications replace remaining ticks only if the new remaining total is larger.

Initial passives: Prepared (+10 starting stamina and mana), Sure Footing (+8 evasion), Reservoir (after Guard actually reduces at least 20 damage, the next Arc Bolt gains +10% raw damage; one charge, expires after the next round). Costs are 1, 1 and 2 attunement respectively. No passive deals autonomous damage or generates resources outside submitted encounter actions.

## Timing and status rules

Guard, barriers, healing and interrupts resolve before enemy damage. A player killed by the enemy response does not lose an already resolved attack. If the player's attack kills the enemy first, its ordinary response is cancelled; a clearly telegraphed death effect can still occur. This is deliberately easier to understand than simultaneous PvP rules, which are deferred.

An enemy has an intent for this round and, after resolution, reveals the next. Disrupt cancels only a tagged wind-up, not every attack. Cancelled foes use a weak fallback or lose their action, explicitly authored per enemy. A successfully interrupted heavy move has a three-round immunity to another interrupt. Avoid player hard-stun in the first slice; use readable penalties with responses instead.

Total barrier cannot exceed 30% maximum HP. Applying another barrier keeps the larger remaining amount, rather than stacking. Mend cannot heal above maximum HP. Neither ability produces mastery when healing or shielding at camp.

## Worked E10 example

Use Sera's invested stats from the character document, item base 30 and rank-2 Driving Blow. Heavy power = 46. Physical accuracy = 57. Against evasion 55, hit chance is about 85.4%.

Raw damage = 1.35 × (30 + 0.9 × 46 + 8) = 107.19. Against armor 70, mitigation is 70/(70+100+80) = 28%. A noncritical hit deals floor(107.19 × 0.72) = 77 damage. If the enemy guards, floor(107.19 × 0.72 × 0.65) = 50.

Sera's rank-2 Mend restores floor(40 + 1.4×14 + 0.8×18 + 5×2) = 84 HP. Her rank-2 Aegis grants 70 barrier, below her 183.6 barrier cap. These are small enough to compare directly against an enemy's previewed attack.

## Balance questions to answer before extending the model

- Does Insight do too much by contributing to both accuracy and evasion?
- Does Might need a secondary use to compare fairly with Finesse?
- Can a durable caster ignore equipment choices or all telegraphs?
- Does Recover create endless safe stalling? Add a soft enemy escalation in boss content if needed; do not punish reading time.
- Can ordinary enemies threaten low-Vitality builds without forcing every build to maximize Vitality?
- Are misses adding tension or empty clicks?
- Can a sensible casual loadout comfortably clear ordinary hunts, while optional challenges reward deeper preparation? Do not require action variety solely to make grinding demanding.
- Do Attack, Cast and combined actions use equipped skills and expose the same arithmetic across routine and difficult fights? Combined-action coefficients, order and resource costs remain a prototype task. Do not add two full-strength actions for a one-action cost without budgeting the result.

Future PvP will need separate resource, healing, damage-spike and control tuning. This solo formula does not promise fair PvP and no PvP implementation is part of the current slice.
