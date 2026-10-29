# Relic Resonance: three optional echo sockets

This implementation extends the existing nine-slot equipment system with three separately tracked sockets for relic echoes. It takes RWK's broader itemization as inspiration for letting a character combine multiple relic effects, while retaining C&C's own item names, currencies, and balance rules. The original `gear.relic` remains the core slot and always contributes its normal full effect. Echo sockets are optional progression, not replacement gear slots.

## Unlocks and attunement

The sockets unlock in order for 250, 1,250, and 6,250 coins. Each is a one-time payment recorded as `unlocked` in `s.relicSockets`. Unlock and attunement previews expose the full coin cost, eligibility, and next cost before a mutation spends anything.

An echo is a paid attunement of an already-owned base relic ID, not another bag item and not a fabricated copy. Only items whose catalog slot is `relic` can be attuned; accessories such as the Floodglass Band remain accessories. The two current relic IDs are the Superintendent's Seal and Stamped Brass Signet, but a relic is eligible only when its effective item has a positive flat stat, armor, or ward bonus. A bare Superintendent's Seal has only its unique core proc, so it cannot be licensed for an echo until an upgrade or reforge adds a flat bonus. Existing item upgrades and affixes contribute through `effectiveItem`, so an echo follows its owned base relic's investment.

Each socket permanently licenses one echo of a relic. Its first license costs `max(150, base item price)` coins; licenses for the same relic in additional sockets cost four times the previous cost (150, 600, 2,400, and so on for the current catalog). A license can be re-equipped in its original socket for free after clearing it. The preview includes duplicate count and the next cumulative price. Clearing never refunds coins or resets license history, so moving an echo to a new socket cannot discount a later attunement.

## Power budget and proc rule

Echoes contribute only the base relic's flat stats, armor, and ward. When the core slot holds that relic, its first, second, and third echoes contribute 50%, 25%, and 12.5% of those flat values. When the core slot holds a different relic, the first echo of a type contributes 100%, followed by 50% and 25% for additional echoes of that same type. These scales apply by active echo order. The core relic always contributes its full normal effect.

The Superintendent's Seal's once-per-fight barrier is a unique core-slot proc. Echoes never trigger or duplicate it, even when an upgraded or reforged Seal is licensed for its flat bonuses. This preserves its existing encounter behavior and prevents repeated sockets from multiplying an automatic combat trigger. Percentages, chance effects, damage, healing, and other procs are outside the echo budget.

For PvP evaluation, the same core-relative diminishing schedule applies. Echoes of the core relic together add at most 87.5% of that item's flat values (50% + 25% + 12.5%), while echoes of a different relic can add up to 175% of that item's flat values (100% + 50% + 25%). Echoes make no proc attempts. Review total build stats and effective ward/armor against the current PvP budget before enabling online play; saves and combat are currently client-controlled.

## State and safety

`gear.relic` is unchanged. New state uses `s.relicSockets`, an array of three entries shaped as `{ unlocked, relicId, copiesPaid }`; `copiesPaid` maps each relic ID to its permanent license in that socket. Normalization drops unknown relic IDs and malformed counters, removes active echo power when a socket is locked or has no matching paid license, and never grants an echo to a character who does not own its base item. The array is bounded to three entries.

Unlock, attune, and clear reject fights, delves, pending rests (`restReadyAt > 0`), and future wounds (`woundedUntil > now`). A failed preview or mutation spends no coins. Previews do not mutate saves. Save normalization preserves ordered unlocks and paid-license history, while corrupt or unknown active IDs are discarded; a later socket cannot remain unlocked when an earlier one is locked. The effects are exposed as flat `relicBonuses` totals for engine integration; they do not change the nine ordinary gear slots or the bag's one-ID uniqueness rule.

## RWK reference

The inspiration is the general idea that several relics can form a build and that an authored set of effects needs explicit stacking rules. The existing [RWK relic research](27_RWK_Relics_and_Itemization.md) documents its diverse effect families and itemization; this design does not copy RWK relic names, lore, effects, values, or acquisition systems. C&C uses three paid echo sockets, deterministic coin prices, and a narrowly scoped diminishing flat-stat budget.
