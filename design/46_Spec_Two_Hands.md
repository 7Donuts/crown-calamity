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
| Focus | Nothing on physical strikes | Enables a **weaker** Wardcast (D24, below); Hunker down, Brace and Guardstrike gain nothing | Nothing | Spell base; enables Arc Bolt |
| Charm | Nothing | Nothing | Nothing | Its stats and ward |
| Mender | **Mend on strike**: restores Stuffing after your action | Half the mend on a useful Guard | Adds the full mend to Recover | Its stats |

5. Arc Bolt still needs a focus-tagged item in either hand. Disrupt interrupts with the main hand only; the off-hand hit never interrupts.
6. The existing combined actions keep their names and become what certain pairs do: Guardstrike (any weapon plus shield), Wardcast (a focus-tagged item plus a shield, or plus a focus in the second hand for a weaker Guard, D24), Sidestep (precision main hand, no shield).

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

## Caster block (D24, G3-6)

Status: approved by the owner on 31 October 2026 (decision D24: "casters cannot block: a focus or spell weapon in the second hand offers a defensive Guard option; shields keep their premium"), implemented in G3-6. This section is the build contract.

**The problem.** A focus is a second-hand item (`slot: offhand`, `focus: true`, such as the Crayon-Star Focus) or a spell weapon held in the second hand. Neither is a shield, so Wardcast (0.85 times spell damage and a Guard in one exchange) was refused for every Caster that kept a focus: its only answer to a declared heavy was Hunker down, a whole exchange spent on no damage. A Caster with a shield could Wardcast, but gave up the focus's spell base and its second-hand slot.

**The option chosen: a focus enables a weaker Wardcast.** `wardGuardSource(s)` (`dist/hands.js`) names where Wardcast's Guard comes from: `'shield'` when a shield is in the second hand, `'focus'` when a focus-tagged item or a spell weapon is there and there is no shield, otherwise `null` (a charm, a mender, nothing, or a two-handed weapon, which fills both hands). Wardcast is available when the source is not `null`.

| Guard source | Wardcast prevents a normal hit | Wardcast prevents a declared heavy | Opening on a guarded heavy | Other |
| --- | --- | --- | --- | --- |
| Shield | 35% | 65% | Yes | Armor applies; Guardstrike is available |
| Focus (new) | 25% | 50% | Yes | No armor; Guardstrike stays refused |
| Neither | not available | not available | n/a | Hunker down (35% and 65%, free) still works |

The two rates are `TELEGRAPH.focusGuardNormal = 0.25` and `focusGuardHeavy = 0.5` (`dist/telegraph.js`, `guardRate(heavy, source)`). Everything else about Wardcast is unchanged: the same Sparkle and Bounce cost (16 Sparkle and 10 Bounce), 0.85 times spell damage, the same Reservoir, Opening, useful-Guard (20 or more prevented), Seal, Thimble Guard and scepter rules. Steady (clubs) and Warding (scepters) bonuses add to either source, and the total stays inside the 85% ceiling (`TELEGRAPH.preventionCeiling`) through the same `guardRateFor(s, key, heavy)` function that the exchange, `actionProfile` and the build inspector all call. One input is still one exchange: the block adds no extra roll, no extra exchange and no timer.

**Why this option and these numbers.**

- The alternative considered was a ward-based Guard (prevention that scales with the player's ward). It would add a third defensive formula next to armor or ward mitigation and the guard rates, it cannot be previewed in one sentence ("prevents 25% and 50%" reads at a glance, "prevents a share of your ward" does not), and it would grow with tempered gear and Realness until the 85% ceiling was the only limit. A fixed lower rate is explainable before the tap, bounded by construction, and identical in the story and past it.
- A shield keeps a clear premium in four ways: 10 points more prevention on a normal hit and 15 on a heavy; its armor; Guardstrike (a shield verb for physical builds) stays refused to a focus; and a Caster who picks a shield still keeps Hunker down. Hunker down also stays the strongest pure block (35% and 65% for no Sparkle), so a Caster who wants to be safe rather than to keep casting still has it.
- 25% and 50% were chosen from three measured settings (G3-6, 40 seeds, `handoffs/reports/g3-6-barriers-and-casters.md`): at 20% and 40% the Caster's Patch + Cocoa pair reached 24.3% lost, too close to the 25% ceiling; at 30% and 55% the premium over a shield shrank to 5 and 10 points, and the ordinary Caster lost 37.2% against 38.2% (a gain too small to justify the smaller premium); 25% and 50% keep the pair at 22.5% to 23.7% with a 1.3-point margin.

**What it changes, measured (G3-6).** Through the story the Caster with a wand and a focus loses 1.7 to 13.8 points less Stuffing per won fight and wins 0.7 to 6.9 points more fights (Chapters 1 to 5, `g3-6-story-before.json` against `g3-6-story-after.json`), because a heavy no longer costs it a whole exchange of damage. Past the story the ordinary Caster loses 38.2% to 39.5% per fight (G3-5: 40.6% to 42.2%) and its fights are about half an exchange shorter. The strong Caster gained less, which lowered gate 3 below its threshold; the spell Edge scale was raised from 1 to 1.35 to restore it (design 47, rule 3).

**Interface.** The Wardcast button subtitle reads "+ focus guard 25%/50%" for a focus and "+ shield guard" for a shield (`secondHandActionHint`). Its description says "Requires a focus-tagged item, and a shield or a focus in the second hand" and, for a focus, "a weaker Guard: it prevents 25% of a hit, or 50% of a declared heavy attack (a shield prevents 35% and 65%)". Refused, the reason reads "Equip a shield or a focus in the second hand". `actionProfile(s, 'combo')` returns `guardSource`, `guardNormal` and `guardHeavy`, and the build inspector shows "Guard prevents 25.00% of a hit, 50.00% of a heavy (focus ward)". The Guardstrike reason stays "Equip a shield".

**Acceptance tests** (`tests/barriers-and-casters.test.mjs`): a focus, a spell weapon in the second hand and a shield are guard sources and a charm, a mender and a two-handed weapon are not; Wardcast is available with a focus and refused with nothing; Guardstrike is refused with a focus; the focus rates are 25% and 50%, below the shield's 35% and 65%; Hunker down is the same for everyone; a high-rank scepter at Realness 9 never exceeds the 85% ceiling; the preview rate, the prevented amount, the incoming damage and the damage dealt equal the exchange's, and it is exactly one exchange at the shield Wardcast's Sparkle and Bounce cost; Opening is granted and the useful-Guard count rises on a guarded heavy; the hint and description tell the truth.

## Data and saves

- No slot renames in saves: `weapon` and `offhand` stay the save keys. Display labels change to Main hand and Second hand.
- `offhand` now also accepts one-handed weapons and menders. Existing saves load unchanged; nothing moves.
- New item fields: `kind: 'mender'` and `mend` on menders. New item IDs for menders; existing IDs untouched.
- Exchange results gain `offhandDamage`, `offhandDamageApplied` and `mendHealed`. Existing fields keep their meaning (`damage` is still the main-hand attempted damage).
- No save-format bump is needed.

## Modules and integration

- **Gear rules** (`dist/gear.js`): slot fitting allows one-handed weapons and menders in the second hand; Buy & Equip offers main or second hand for one-handed weapons, as it offers either accessory slot today.
- **Hands rules** (new pure module, for example `dist/hands.js`): second-hand contribution per verb, off-hand hit profile and mend amount. No DOM, no storage, injected random source.
- **Engine** (`dist/engine.js`): `actionProfile` returns the off-hand hit profile and mend preview with the main-hand profile (and, for Guard verbs, the guard source and rates), so combat and the inspector share one calculation. The exchange resolves the main hand, then the second hand, then relic hooks, then the enemy response, all inside one exchange.
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
