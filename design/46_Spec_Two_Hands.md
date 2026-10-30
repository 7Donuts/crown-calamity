# Spec: two hands, one verb

Status: approved spec, 30 October 2026. The owner approved option B of decision **D1** ([ROADMAP.md](../ROADMAP.md)): two hands, one verb, prototyped in the Playtest Lab first. Background and the options considered: [design 44](44_Direction_and_Roadmap.md), "Two hands: discussion". Families that define what each hand does: [design 47](47_Spec_Weapon_Families.md).

## Goal

Give every character RWK's most recognizable build choice (what is in each hand) and a built-in way to heal while fighting, without losing the telegraph decision made on every click.

## Player rules

1. A character has a **main hand** and a **second hand**. They are the existing `weapon` and `offhand` slots, renamed in the interface only.
2. The main hand holds a weapon, as today. The second hand holds one of: a one-handed weapon, a shield, a focus, a charm, or a **mender** (new). A two-handed weapon fills both hands, as today.
3. Each exchange the player still chooses **one verb** (Attack, Driving Strike, Arc Bolt, Guard, Disrupt, Recover, Expose and the other existing actions). One tap is still one exchange, and the shared 650 ms delay is unchanged.
4. The second hand **contributes to the chosen verb** according to its kind:

| Second hand | On a Strike verb (Attack, Driving Strike, Disrupt) | On a Guard verb (Guard, Brace, Guardstrike, Sidestep, Wardcast) | On Recover | Always |
| --- | --- | --- | --- | --- |
| One-handed weapon | An **off-hand hit** at a share of that weapon's own damage, rolled separately | Its family's guard behavior, if any (design 47) | Nothing | Its stats |
| Shield | Nothing | Enables Guardstrike and Wardcast; its armor applies | Nothing | Armor |
| Focus | Nothing on physical strikes | Enables Wardcast | Nothing | Spell base; enables Arc Bolt |
| Charm | Nothing | Nothing | Nothing | Its stats and ward |
| Mender | **Mend on strike**: restores Stuffing after your action | Half the mend on a useful Guard | Adds the full mend to Recover | Its stats |

5. Arc Bolt still needs a focus-tagged item in either hand. Disrupt interrupts with the main hand only; the off-hand hit never interrupts.
6. The existing combined actions keep their names and become what certain pairs do: Guardstrike (any weapon plus shield), Wardcast (focus-tagged weapon or focus plus shield), Sidestep (precision main hand, no shield).

## Numbers (starting values, tunable)

| Rule | Value | Why |
| --- | --- | --- |
| Off-hand hit share, physical weapon | 35% of that weapon's normal damage profile | Two weapons should beat weapon and shield on damage, not on total value |
| Off-hand hit share, spell weapon | 30%, costs no Sparkle | Free damage, so slightly lower |
| Off-hand hit glance and crit | Rolled separately with the normal formulas | Keeps variance honest; the server owns both rolls |
| Mend on strike | Mender's `mend` value + 0.5 × Will | Will becomes the healing hand's stat |
| Mend cap | 6% of maximum Stuffing per exchange, and never above missing Stuffing | Below the Felt Vampire Fang's 10% cap, so relics stay the bigger engine |
| Mend on useful Guard | 50% of mend on strike | Rewards guarding with a mender |
| Mend on Recover | 100% of mend on strike, added to Recover | Makes Recover a real heal with a mender |

**Menders (new items).** Ten menders, two per chapter, in the offhand category with its price rule. Starting values: `mend` 6 at the first Chapter 1 mender, rising by 4 per mender tier, plus small Will or Vitality stats. Suggested names: Thread-and-Thimble Kit, Bandage Roll, Patch Satchel, Darning Egg, Sewing Tin, Button Pouch, Spool of Second Chances (not the relic), Felt Patch Book, Mending Hoop, Golden Needle Case. Every mender is a stuffie-scale sewing or first-aid object.

**Sizing check.** A level 1 character with 12 Will and the first mender heals about 12 Stuffing per strike, about 3% of maximum, roughly 15% of maximum over a five-exchange fight. That is meaningful on its own and smaller than a planned relic pair (design 43), so the two stack into a sustain build without either being mandatory.

## Data and saves

- No slot renames in saves: `weapon` and `offhand` stay the save keys. Display labels change to Main hand and Second hand.
- `offhand` now also accepts one-handed weapons and menders. Existing saves load unchanged; nothing moves.
- New item fields: `kind: 'mender'` and `mend` on menders. New item IDs for menders; existing IDs untouched.
- Exchange results gain `offhandDamage`, `offhandDamageApplied` and `mendHealed`. Existing fields keep their meaning (`damage` is still the main-hand attempted damage).
- No save-format bump is needed.

## Modules and integration

- **Gear rules** (`dist/gear.js`): slot fitting allows one-handed weapons and menders in the second hand; Buy & Equip offers main or second hand for one-handed weapons, as it offers either accessory slot today.
- **Hands rules** (new pure module, for example `dist/hands.js`): second-hand contribution per verb, off-hand hit profile and mend amount. No DOM, no storage, injected random source.
- **Engine** (`dist/engine.js`): `actionProfile` returns the off-hand hit profile and mend preview with the main-hand profile, so combat and the inspector share one calculation. The exchange resolves the main hand, then the second hand, then relic hooks, then the enemy response, all inside one exchange.
- **Relics**: the Felt Vampire Fang heals from the total damage that landed across both hands, under its existing per-exchange cap. Encore Ribbon streaks follow the main hand's channel. Pluck rules are otherwise unchanged.

## Interface

- Equipment diagram: "Main hand" and "Second hand" labels; a two-handed weapon shows "Fills both hands".
- Action buttons show the second hand's contribution in their subtitle, for example "Attack · + off-hand jab" or "Guard · + mend".
- Exchange feedback and the battle report list the off-hand hit and any mend as their own lines.
- The build inspector shows expected main-hand damage, off-hand damage and mend per exchange.
- Phone check at 360 and 390 px: subtitles wrap without overflow; buttons stay 48 × 48 px or larger.

## Constraint check

One input, one exchange: yes, both hands act inside the chosen exchange. No timers or queued actions. No new randomness beyond one extra hit roll, owned by the server online. Repetition is never penalized. Overkill never heals: mend is a flat heal, and lifesteal uses damage that landed.

## Build order

1. **Playtest Lab prototype.** A `two_hands` lab scenario with four fixtures (weapon and shield, two weapons, weapon and mender, two-handed weapon). Lab questions: is the second hand's contribution clear before the tap, and does play stay as fast on a phone?
2. **Campaign.** Ship only if the lab and the balance gates pass.

## Acceptance tests

- Each second-hand kind contributes exactly as in the table for each verb, and contributes nothing it should not (a shield adds no damage to Attack; an off-hand weapon never interrupts).
- Arc Bolt is refused without a focus-tagged item in either hand.
- A two-handed weapon empties the second hand; equipping a second-hand item with a two-handed weapon is refused.
- Mend never exceeds 6% of maximum or missing Stuffing; mend on Guard only follows a useful Guard (20 or more prevented).
- One tap advances exactly one exchange with all contributions; the 650 ms delay still refuses an early tap.
- `actionProfile` and the exchange agree on off-hand damage and mend.
- Old saves load with the same loadout and stats.

## Balance gates

Seeded simulations (the design 43 method) for weapon and shield, two weapons, weapon and mender, and two-handed, per channel, at levels 1, 9, 20, 35 and 50:
- Two weapons deal at most 10% more expected damage per exchange than a two-handed weapon of the same tier, and lose more Stuffing per fight than weapon and shield.
- Weapon and mender loses the least net Stuffing per fight without relics, and wins no faster than weapon and shield.
- No pairing changes average exchanges per fight by more than 15% against today's equivalent build.

## Documents to update when shipped

Design 14 (actions), design 30 (if races gain hand affinities), design 38 (catalog counts and mender prices), design 43 (Fang across both hands), AGENTS.md (slot description and catalog counts), README.md.
