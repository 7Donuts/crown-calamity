# Characters, sheet and classless specialization

Status: rough draft. Six attributes, slot counts and respec costs are candidates to validate, not locked decisions. Only a subset of the example builds needs to exist in the first prototype.

## Identity and creation

A character has a name, optional pronouns, race, home city, background, public biography, private journal, visible titles and a chronological adventure record. Player identity has no image field. Monster and gear art are separate content types.

All races receive the same starting attribute budget. A background gives a story contact, a small introductory quest and a choice of equivalent starter equipment. It never grants permanent exclusive combat skills. The game can suggest practice loadouts, but selecting one does not create a class, stat restriction or permanent label.

## Six attributes

| Attribute | Main combat purpose | Outside combat |
|---|---|---|
| Might (MIG) | Heavy and force weapon output | Breaking, hauling, intimidation options |
| Finesse (FIN) | Precision weapon output, physical accuracy, evasion | Devices, careful extraction, stealth options |
| Intellect (INT) | Spell output, healing and barriers | Runes, research, mechanism options |
| Vitality (VIT) | Health and stamina capacity | Endurance and hazardous environment options |
| Will (WIL) | Mana, spell accuracy and secondary durability | Concentration, negotiation under pressure |
| Insight (INS) | Evasion, accuracy and recognizing intent | Investigation, tracking and hidden routes |

No attribute generates passive coins or XP. No stat grants extra turns. Every archetype needs defenses and access to a counterplay action.

At effective level E, invested attributes total 60 + 4 × (E − 1). Start each attribute at 8; distribute 12 more points at creation. Gain four allocatable points per effective level after the first. Minimum invested attribute is 8. Gear bonuses are displayed separately and do not satisfy learning prerequisites.

Starter attribute respecs are free through E10. Later respecs use a fixed, modest coin/material cost outside encounters, with a preview and confirmation. Respecs do not erase mastered skills. A learned ability becomes unavailable to equip if its minimum invested-stat requirement is no longer met; show this before confirmation.

## The sheet page

| Section | Visible content and interactions |
|---|---|
| Identity header | Name, race, city, biography, title, Ascension rank and local level; no portrait placeholder |
| Progress | Current XP, next threshold, effective level, next trial and unlocked story chapters |
| Resources | Current/max HP, stamina, mana; barriers and persistent expedition conditions |
| Attributes | Invested points + gear + temporary effects = combat value; allocate or preview respec |
| Defense | Armor, ward, mitigation versus selected enemy level, evasion and control immunity state |
| Equipment | Weapon/offhand, armor slots, accessories, relic; comparison panel and requirements |
| Abilities | Six active slots, three passive slots, shared attunement budget and learned library |
| Mastery | Ranks, encounter-earned marks, next upgrade, usage tags and unlocked interactions |
| Public record | Achievements, explored regions, story milestones; future social fields are deferred |
| Build inspector | Estimated damage range, hit chance, resource cost and exact modifier sources |

Equipment presentation uses phone-first item cards and a slot list, never a silhouette of the player. Mobile is the primary layout, with active resources pinned and large touch controls. Desktop adapts from that layout. Saved loadouts are allowed only outside an encounter or expedition lock.

## Abilities without classes

All learning paths exist in the same catalog: weapons, force, flame, storm, binding, restoration, alchemy, fieldcraft and warding. These are searchable tags, not mutually exclusive trees.

Learning a basic skill requires a short relevant contract or a trainer lesson. Learning advanced abilities requires moderate invested-stat thresholds and mastery evidence in relevant tags. Always provide a solo route. No prerequisite should require playing the exact ability that it unlocks.

Long-term candidate: equip at most six active abilities and three passives. Their combined attunement cost cannot exceed 12. For the first E1–10 prototype, use three active slots, one passive slot and six attunement; introduce further slots only after testing the smaller set. Basic Strike, Guard, Recover and Withdraw are universal actions and cost no slot or attunement. Powerful flexibility consumes more attunement.

Example: four 1-point actives, two 2-point actives, two 1-point passives and one 2-point passive use 12. A deck full of expensive abilities must leave slots empty or choose cheaper support.

## Build examples — descriptive labels only

Ordinary hunts use the equipped build through a compact action bar. Every tap resolves one exchange. Harder fights use the same controls but reward more changes of action. A casual player does not need to program a rotation or select a fresh combo every exchange.

| Player-created style | Investments | Interaction | Weakness |
|---|---|---|---|
| Furnace bulwark | VIT, INT, WIL; shield and focus-tagged rod | Useful Guard stores a bounded charge for a following spell | Lower steady pressure and reduced evasion |
| Needle duelist | FIN, INS; light weapon and charm | Read a wind-up, expose a target, spend precision on a strike | Limited sustain; vulnerable to persistent hazards |
| Chainbreaker | MIG, VIT; heavy weapon and light ward | Interrupt a wind-up, then exploit its recovery | Poor spell accuracy and high stamina demands |
| Debt medic | WIL, INT; restorative focus | Choose healing or a short barrier using the same reserve | Resource pressure and limited burst |
| Mire engineer | INT, INS; alchemy kit and spear | Change a hazard into a debuff opportunity | Setup turns; cleanse and reposition counter it |
| Spellknife | FIN, INT; blade and focus | Alternate damage channels to exploit a defense gap | Split investment and weaker mitigation |

These styles should emerge from the library. Do not sell them as six selectable pseudo-classes.

## Equipment and ability rules that prevent universal builds

Two-handed weapons occupy both hands. A dedicated focus occupies the offhand; a shield and that focus cannot occupy the same slot. Some one-handed main-hand tools, including the starter rod, carry a focus tag. Such a rod can be used with a shield, at the cost of the offensive offhand bonus. Plate grants armor but reduces evasion rating by 15%; it never disables all casting. Most spells need a focus tag rather than a staff specifically.

In-combat gear swapping is unavailable in v0.1. Switching a sword for a staff is a preparation decision. Six active slots, resources and attunement supply the meaningful constraints; there is no need for separate class walls.

## Example E10 sheet

Sera Vale — Human, Bracken Quay; former canal surveyor; Ascension 0, level 10, effective level 10. Invested stats: MIG18, FIN13, INT14, VIT22, WIL18, INS11; total 96. Before gear, HP612, stamina130, mana142. Her biography says she is trying to locate her missing work crew. Her contract journal supplies evidence, while the player's prose remains their own.

Her mixed defenses are a viable starting point rather than an optimized claim. Actual build viability must be tested against encounters and PvP, not inferred from a fictional sheet alone.
