# Relic Resonance

The original Relic equipment slot remains the core relic slot. Three optional echo sockets let a character build around several authored relic effects while retaining the existing nine equipment slots, one-ID bag rule, and save IDs. The ten relic IDs are `signet`, `seal`, `threadSpool`, `patchworkHeart`, `luckyButton`, `dreamBell`, `thimbleGuard`, `amberMarble`, `ribbonKnot`, and `stuffingSatchel`.

## Attunement and cost

Two relics become available in each chapter, in this order: Signet and Seal; Thread Spool and Patchwork Heart; Lucky Button and Dream Bell; Thimble Guard and Amber Marble; Ribbon Knot and Stuffing Satchel. Their purchase prices are 500, 1,200, 3,500, 8,000, 20,000, 50,000, 125,000, 300,000, 750,000, and 1,800,000 coins. These are authored relic costs, separate from the normal armor and weapon price curves. A low-chapter relic remains useful later because its unique effect does not depend on a numerical tier ladder.

Sockets unlock in order for 5,000, 25,000, and 125,000 coins, with new unlocks requiring Chapters 2, 3, and 4. Previously paid sockets remain open. Unlock and attunement previews show the full price and benefit before spending. Echo attunement requires ownership of the base relic. Every socket keeps its paid license after clearing, and clearing does not refund coins. A paid license can be reattuned in its original socket without paying again. Duplicate licenses for the same relic cost four times the previous license; the first license for a relic uses its listed purchase price. Mutations reject fights, delves, pending rests, and future wounds, and failed mutations spend nothing.

## Effects

Each relic has one distinct, conditional effect. Signet restores 2 additional Sparkle when using Recover. The Seal grants barrier after the first useful Guard in a fight. Thread Spool restores Bounce after the first useful Guard. Patchwork Heart restores 5% of maximum missing Stuffing after victory. Lucky Button adds 5% coins to victory rewards. Dream Bell restores 2 Sparkle after victory. Thimble Guard adds barrier after the first useful Guard. Amber Marble adds damage to the first damaging action in a fight. Ribbon Knot restores Sparkle after a free physical strike. Stuffing Satchel improves Mend healing by 10%.

The effects consume no new actions or turns. Recover and Mend retain their current exchange behavior. Victory effects are capped by resource maximums. Seal, Thread Spool, Thimble Guard, and Amber Marble each trigger once per fight at most. In particular, echoes can increase Seal's single barrier grant, but never reset it or create extra Guard triggers.

## Echo strength and balance

Echoes strengthen the relevant effect without creating repeated triggers. For a relic matching the core, active echoes add 50%, 25%, and 12.5% effect strength. For another relic type, the first echo adds 100%, followed by 50% and 25%. The engine aggregates this strength before applying the conditional benefit. A once-per-fight effect stays once per fight at any strength.

Echoes also contribute flat stats, armor, and ward from the effective relic item, using the same core-relative diminishing schedule. They do not copy new turns, actions, or chance-based proc loops. This is a PvP-relevant balance cap; before enabling online PvP, review the combined effects and defensive totals against the intended combat budget.

## Save state and implementation

Echo state is stored in `s.relicSockets` as three bounded entries shaped like `{ unlocked, relicId, copiesPaid }`. Normalization removes unknown IDs, malformed counters, active power without a paid license, and invalid later unlocks. It does not grant relic ownership or alter `gear.relic`. The core and echo effects aggregate in the relic bonus API; the engine applies them only at their named combat or victory conditions.

The design takes broad inspiration from RWK's range of item effects, while using original C&C names, effects, values, and progression. It does not copy RWK relic names, lore, acquisition systems, or effect text.
