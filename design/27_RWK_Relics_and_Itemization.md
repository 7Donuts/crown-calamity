# RWK relics and itemization: research and an original direction

This is a bounded design reference based on the public Race War Kingdoms (RWK) Server 2 help pages reviewed on 2026-10-29. The live server identifies itself as Client v1317; linked help pages vary in date and may not exhaustively describe current behavior. Server 1 and Server 2 share much of the relic catalog, while Server 2 lists later additions. This document proposes no copied RWK names, lore, values, or progression.

## What RWK does

RWK groups relics by effect: **Pure Boost**, **Pure Deduction**, **Pure Plundering**, **Special**, **Quest/Drop Only**, and **Eternal** (always active, so not fired or voided). Examples include +40% to one stat, a 10% Confusion chance, and +15% effectiveness to healing/armor or weapons/casts. Effects mix percentages, factors, fixed damage, and explicit caps: Touch of the Damned lowers health by 40% or 40% of the wielder's durability, whichever is lower. The page gives the stacking rule `1 - (1 - p)^n` for chance effects (eight 10% attempts = 56.95%) and describes relics that bundle effects or conditionally strengthen other relics. It is an authored family catalog, not one universal tier ladder. [RWK2 Relics](https://rwk2.racewarkingdoms.com/help/rwkrelics.htm)

**Itemization and progression:** The official guide describes two hand positions, two spell slots, and single mantle, gauntlet, and boot slots; only one item fits a slot. Relics appear as pure items or enchantments. Enchant/disenchant costs one or two runes and requires one's kingdom; high-level crafting uses runes, can fail by skill, and yields items that cannot be resold. Enchanted items cannot be sold, and destroying them produces ash, a secondary currency. A historical community glossary describes blessings/approbations on body parts and a ten-item cap; treat that as historical, not verified current Server 2 behavior. [Getting Started](https://rwk2.racewarkingdoms.com/help/rwkstart.htm), [Actions](https://rwk2.racewarkingdoms.com/actions.htm), [Info](https://rwk2.racewarkingdoms.com/info.htm), [community glossary](https://www.jimcav.com/glossary.html)

**Authored quests:** The quest table documents named drops and NPC delivery upgrades. For example, it says Essence of Lava from Fire Lord Alchemar can be delivered with Melee's Rage to the Palace Keeper to receive Melee's Undying Rage, with higher stat bonuses and added resistance. This makes acquisition a discoverable goal with a fixed object and destination; the table also contains noncombat utility items. [RWK2 Quest Items](https://rwk2.racewarkingdoms.com/help/rwkquest.htm)

The relic page also documents counters: enemy debuffs, annulment/voiding, resistance, and an eternal subtype immune to annulment or voiding. `/relics`, `/stats`, and verbose display provide inspection. The public help is insufficient to reconstruct full combat order, every class's exact relic-bearing slots, or current drop rates; examples above are not a complete balance set. [RWK2 Relics](https://rwk2.racewarkingdoms.com/help/rwkrelics.htm), [Actions](https://rwk2.racewarkingdoms.com/actions.htm)

## What is useful for Crown & Calamity

C&C already has nine equipment slots, including one Relic slot, alongside two accessory slots. Gear is currently defined by unique base item IDs: `bag` is deduplicated, equipped slots store base IDs, and `itemMods[baseId]` stores up to three deterministic upgrades plus one prefix and one suffix. The implemented bonuses are flat and previewable; design 16 already recommends a small next layer of authored conditional behavior, but explicitly says duplicate random drops need item instances first. The RWK lesson is therefore **effect grammar and item provenance** more than “add many legendary tiers”: a relic should make a recognizable tactical promise, give the player a reason to choose it over another, and present a known path to attain or deepen that play pattern.

C&C's one Relic slot is the right first prototype constraint, while an item-imprint dimension is worth preserving as a longer-term option because RWK's enchantments make the host item part of the choice. After item instances and balance rules exist, test a **relic core plus at most two typed imprints**: one weapon and one body item, with no new equipment slots and no relic spread across all nine slots. These imprints must be distinct from ordinary flat affixes and compete within the same relic budget. RWK allows multiple relic effects to stack or compose; C&C's equivalent would interact with seven attributes, two accessories, armor, weapons, abilities, and small combat ranges, so constrain the combination count and audit PvP before enabling it.

## C&C proposal (design only)

### Rules of the layer

- Keep the existing one Relic slot. A relic is its own item with one named signature rule and at most one small numerical rider; do not treat it as another general affix.
- Preserve a future itemization choice: a relic core could later carry one weapon imprint and one body-item imprint at most, without adding equipment slots. Prototype that only after instance IDs, compatible host rules, replacement previews, and a combined PvP budget exist; do not allow imprints on every item.
- Make relic families communicate play purpose: **Catalysts** alter follow-up damage, **Wards** alter barrier or incoming damage, and **Disruptors** reward a real enemy interruption or debuff. These are C&C categories, not RWK's exact families. Start with two or three relics, not a universal catalog.
- Limit each effect to one trigger and one charge or one specified action window. State the trigger, duration, replacement behavior, and per-exchange ceiling in the item description and combat record. No recursive procs, free actions, automatic repeats, passive idle rewards, or multiplicative stat scaling.
- Keep a targeted, deterministic route: an authored contract or encounter grants a relic token; a named workbench recipe consumes known materials to make/advance one relic. No hidden drop chance or failure roll for core progression. An optional discovery reward may teach or supply a variant, but should not be required for a functional build.
- Treat relic level as a choice unlock or rule refinement, not an open-ended percentage ladder. A future three-step outline could be: base signature at acquisition; one upgrade that extends its narrow tactical window or changes its response; final upgrade that improves one cap slightly while preserving the same counterplay. Show before/after previews and total budget impact.
- Preserve future server authority: the server validates ownership, slot, item rules version, materials, exchange input, trigger state, and reward idempotency. PvP uses the same capped stat budget and deterministic resolution rules as PvE, with relic effects resolved inside the authorized exchange.

### Proposed original relic examples

These are new C&C concepts and names; all values here are proposals, not RWK data.

| Relic | Signature | Choice and counterplay |
| --- | --- | --- |
| **Siltglass Lens** | After a successful Expose, your next damaging spell in the immediately following authorized exchange gains a small fixed damage bonus. The charge expires at the end of that exchange whether used or not. | Gives a setup-and-cast rhythm across the action boundary. Repeated Expose cannot bank charges; the bonus has a per-exchange cap and does not alter accuracy or crit chance. Competes with a defensive relic. |
| **Tideworn Seal** | The first useful Guard each encounter stores one 3-mana discount for Mend. It is available for the next two authorized exchanges and then expires; using Mend consumes it. | Rewards a defensive setup and then an intentional recovery. Existing Mend cooldown and mana caps remain; test the discount against mana sustain and recovery cadence. It does not grant barrier, distinguishing it from the implemented Superintendent's Seal. |
| **Counterweight Sigil** | A successful interrupt strengthens the next weapon strike by a small fixed amount; a failed interrupt grants nothing. | Rewards reading enemy intent. Cannot proc from an attempted but ineffective interrupt, creates no extra turn, and has no effect against an enemy that cannot be interrupted. |

The signatures should live in rules and combat feedback, not lore words alone. Each offers a sequence to try, a visible outcome, and a reason to choose another relic for a different fight. These retain the current design 16 direction of attributable actions and tightly bounded conditional traits, while making the item itself a more memorable build anchor.

## Implementation slices

1. **Prototype one signature relic on the current single Relic slot.** Use fixed rules and existing unique-by-base-ID saves. Add it to one authored reward and let the inspector describe its trigger, use window, and cap. This tests whether one relic changes action choice without entangling loot.
2. **Add a second/third relic and deterministic advancement.** Give each a contract/material path; make recipe cost and effect delta previewable; log actual triggers and expired/unused charges. Evaluate two distinct builds and a PvP stat budget before expanding the roster.
3. **Only if duplicate item copies become a real requirement, introduce item instances.** Give each instance an immutable ID, base template, explicit relic ID/rule version, upgrades, provenance, and owner; slots reference instance IDs. Migrate current unique base IDs and `itemMods` exactly once each. Do not add random relic-bearing duplicates to the current deduplicated bag. Any online transfer, roll, or trigger must be server-authoritative.

This deliverable is research and design; the game engine remains unchanged. A later prototype can test whether the signature rules are fun and readable.

## Source notes

- The primary references above are the official RWK2 help server (`rwk2.racewarkingdoms.com`). The official RWK1 relic page has the same broad original catalog but does not include all newer RWK2 entries. Use RWK2 when discussing the later relic variants; don't merge the two catalogs as if they were one dated snapshot. [RWK1 Relics](https://rwk1.racewarkingdoms.com/help/rwkrelics.htm), [RWK2 Relics](https://rwk2.racewarkingdoms.com/help/rwkrelics.htm)
- The RWK2 quest table includes late additions beyond its old baseline, while the current announcements page continues to post item and relic-display changes. The announcements page establishes ongoing maintenance, not the exact current behavior of every help-page entry. [RWK2 Announcements](https://rwk2.racewarkingdoms.com/ann.htm)
- Jimcav's guide and glossary are useful historical community explanations (for example, informal terminology around blessings), but this proposal relies on official help for mechanic claims. Those community pages are older and may not reflect current Server 2 rules. [Jimcav's guide](https://www.jimcav.com/getting_started.htm), [Jimcav's glossary](https://www.jimcav.com/glossary.html)
