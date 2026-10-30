# Relic engine: two relic slots, Pluck, finale keepsakes and in-fight sustain

Prepared 30 October 2026. Implemented in `dist/relic-engine.js` (rules), `dist/gear.js` (items, slots and prices), `dist/relics.js` (echo registry) and `dist/engine.js` (hooks). This document supersedes the relic prices and single core slot in design 31 and the relic price ladder in design 38. The echo socket rules in design 31 otherwise still apply.

## Owner direction

- Start every character with two relic slots.
- Reprice the existing relics.
- Build the unique relic effects, including a vampiric (lifesteal) effect.
- Make relics an engine-building system that rewards planning and preparation heavily. Relics define a build; gear solidifies it with stats.
- Address the constant need to rest. RWK let players heal while fighting through its two-hand system; Crown & Calamity had no equivalent.

## What was wrong before

Relics were shop purchases with small flat effects that did not scale with the chapter, priced on a ladder from 500 to 1,800,000 coins. Amber Marble cost 300,000 coins for +3 damage on the first action of a fight, about 0.15% of a Chapter 4 enemy's health and roughly 11,500 wins at 26 coins each. Thimble Guard cost 125,000 coins for +4 barrier against hits of 149 to 180.

Resting was constant. Using the repository's seeded simulator (`tests/sim-helpers.mjs`, `respond` policy, Chapter 1 gear), a character lost about 20 to 30% of maximum Stuffing per fight against the first Chapter 1 enemies and 53 to 62% against Chewster at level 9.

## Rules

### Two relic slots

`gear.relic` and `gear.relic2` both hold a relic at full strength from character creation. A relic fits either slot but never both (the one-copy bag rule). Echo sockets are unchanged: an echo that matches either core relic adds 50%, 25% then 12.5% strength. Shop comparisons and Buy & Equip offer either relic slot.

### Pluck

Pluck is a per-fight charge from 0 to 8. Generator relics turn a combat verb into Pluck; payoff relics turn Pluck into healing, damage or a head start. It only exists, and the HUD only shows it, when an engine relic is equipped or echoed. Pluck starts at 0 each fight unless the Picnic Tin carries some in.

Every effect follows the design 27 rule: one named trigger, a stated limit and a stated ceiling. Every effect resolves inside the exchange the player chose. Nothing adds an exchange, acts while the player is away, or rolls a random number. Echo strength scales each effect; Pluck gains round to whole numbers, so a half-strength echo of a 1-Pluck trigger still gains 1.

### The relics

| Relic | Role | Source | Effect | Limit and ceiling |
| --- | --- | --- | --- | --- |
| Felt Vampire Fang | Payoff (lifesteal) | Shop, Chapter 1, 60 coins | Hits restore 20% of the damage that landed, plus 3% per Pluck held | Overkill never heals; at most 10% of maximum Stuffing per exchange |
| Darned-Elbow Patch | Generator | Shop, Chapter 1, 90 coins | Each enemy attack that hurts you gains 1 Pluck, 2 from a heavy | Once per enemy response |
| Hot-Cocoa Thimble | Payoff (sustain) | Shop, Chapter 2, 450 coins | On victory, each Pluck held restores 4% of maximum Stuffing | Once per fight; 32% at 8 Pluck |
| Picnic-Tin Keepsake | Payoff (preparation) | Shop, Chapter 2, 550 coins | On victory, up to 3 Pluck carry into the next fight | Rest, defeat or Go still empties it |
| Lint-Trap Locket | Generator | Chapter 1 finale | Useful Guard gains 2 Pluck, 3 against a heavy; the first guarded heavy each fight sends 25% of prevented damage back | Send-back once per fight and cannot finish the enemy |
| Last-Token Charm | Generator | Chapter 2 finale | A successful Disrupt gains 3 Pluck and Rattles the enemy: its next attack deals 30% less | One Rattle at a time; shown in the telegraph |
| Seed-Packet Heart | Keystone | Chapter 3 finale | Shake it off gains 2 Pluck; if the enemy's response is not a heavy, also restores 6% of maximum Stuffing | Every Recover |
| Keepsake Music Box | Keystone | Chapter 4 finale | Expose gains 2 Pluck; its bonus waits up to two exchanges and that hit cannot glance | One exposed action |
| Encore Ribbon | Keystone | Chapter 5 finale | Repeating a damaging action of the same kind gains 1 Pluck; damaging actions deal 3% more per Pluck held | +24% damage at 8 Pluck |

The ten existing relics keep their effects and stay outside the Pluck engine for now (standalone trinkets). The Encore Ribbon's damage and the Music Box's no-glance rule live in `actionProfile`, so combat and the build inspector share one calculation.

### Finale keepsakes

Each chapter's finale claim grants that chapter's keepsake once, records it in `s.signatureRelics`, and writes a journal entry. Keepsakes are never stocked and cannot be sold. Older saves that already hold a finale receipt receive the matching keepsakes on load, exactly once; reloading never duplicates them. Their `echoPrice` (200, 600, 1,500, 3,500 and 7,000) sets the echo license base, since they have no shop price.

### Prices

Shop relics are priced from chapter income, not the weapon curve: about one chapter's worth of contract coins, or roughly a hundred of that chapter's wins (average win: about 2, 4.5, 11, 24 and 49 coins by chapter). A relic's tier equals its chapter. The economy audit checks that stocked relic prices rise chapter by chapter and that each chapter has exactly one unstocked keepsake.

| Chapter | Relics and prices (coins) |
| --- | --- |
| 1 | Felt Vampire Fang 60, Darned-Elbow Patch 90, Brass-Stamp Ring 120, Keeper's Brass Button 180 |
| 2 | Thread Spool 300, Patchwork Heart 400, Hot-Cocoa Thimble 450, Picnic-Tin Keepsake 550 |
| 3 | Lucky Button 1,000, Dream Bell 1,200 |
| 4 | Thimble Guard 2,400, Amber Marble 3,000 |
| 5 | Ribbon Knot 5,000, Emergency Stuffing Satchel 6,000 |

Resale stays capped by chapter (3 to 38 coins), so buying and selling relics cannot make a profit.

## Measured sustain

Method: the seeded simulator from `tests/sim-helpers.mjs` (`hero` fixture, `respond` policy), 40 seeds per cell, each run chaining fights against one enemy from full Stuffing. The table reports net Stuffing lost per won fight as a share of maximum. These are synthetic fixtures with Chapter 1 gear, not measured player sessions.

| Enemy and kit | No relics | Fang | Fang + Patch | Fang + Locket | Patch + Cocoa |
| --- | --- | --- | --- | --- | --- |
| Rat Swarm, Breaker | 25% | 18% | 16% | 16% | 7% |
| Rat Swarm, Caster | 26% | 19% | 17% | 17% | 12% |
| Clawback Crab, Breaker | 48% | 43% | 36% | 33% | 26% |
| Chewster, Breaker | 55% | 40% | 33% | 30% | 34% |
| Chewster, Duelist | 61% | 41% | 35% | 26% | 39% |
| Chewster, Caster | 63% | 44% | 39% | 31% | 40% |

A single relic cuts net damage per fight by about a quarter. A planned pair roughly halves it, which about doubles the fights between rests, and the best pairing depends on the enemy. Long, low-damage fights favor Patch and Cocoa; fights against heavies favor the guard-driven Locket. A character without relics still needs to rest, so Rest stays meaningful.

An earlier draft (Fang 15% plus 2% per Pluck, Cocoa 3%) cut damage by only 20 to 40% for planned pairs. The current values were raised to reward planning more heavily, as directed.

## Save compatibility

No save-format bump. `gear.relic2`, `pluckCarry` and `signatureRelics` load with safe defaults from any v1 to v6 save. Saved fights gain `pluck`, `rattled` and `locketUsed` fields, normalized on load. Item IDs, material keys and echo licenses are unchanged.

## Not done, and open questions

1. **Relic ranks.** Delivering a chapter's regional materials and boss keepsake to upgrade a relic (design 27, design 40) is not built. It would also give later regional materials their missing workshop use (IMPLEMENTATION-STATUS.md).
2. **Art.** The nine new relics reuse existing atlas crops. Distinct relic art must be generated under ART-DIRECTION.md.
3. **PvP budget.** Lifesteal, Rattle and the Encore bonus are new numeric sources. They need the design 23 audit before any PvP.
4. **Echo strength.** The first echo of a relic that is not in a core slot already counts at full strength (design 31). With two core slots and three loops, a late character can run five full-strength relics. Review whether that stays.
5. **The ten older relics.** They could join the engine (for example, the Seal as a generator) in a later pass.
6. **Balance coverage.** The simulation covers the Fang, Patch, Locket and Cocoa in Chapter 1. Last-Token, Seed-Packet, Music Box and Encore are covered by behavior tests but have no sustain or damage simulation yet. Re-run `npm run economy` with relic purchases before calling chapter pacing balanced.
