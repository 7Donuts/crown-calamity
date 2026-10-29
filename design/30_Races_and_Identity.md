# Races and identity

> v0.11.0 note: the four races now display as toy brands (Cuddleworth Classics, Sturdy Stitch Workwear, Floppables by Pellet & Pip and Lullabrite Nightlight Pals) with new passive names. Race IDs, attribute spreads, passive numbers and saves are unchanged, and the display names, passive names and wording in the tables below are historical. See [design 35](35_Stuffies_Theme.md) for the current names and the implementation status.

The release introduces four playable peoples of Bracken Quay. Race sets the character's starting attribute spread and one modest static passive. The player may freely reassign the twelve points above the seven-attribute minimum of eight, so every starting spread totals 68 and remains respec-able. A starter kit continues to control starting equipment and its ability; it does not overwrite race stats.

| ID | Display name | Might | Finesse | Intellect | Vitality | Will | Insight | Luck | Passive |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `quayfolk` | Quayfolk | 10 | 10 | 10 | 10 | 10 | 9 | 9 | Well Provisioned: +4 maximum Health, +4 maximum Mana, +4 maximum Stamina |
| `cobblekin` | Cobblekin | 12 | 8 | 8 | 13 | 10 | 9 | 8 | Cobblehide: +12 maximum Health, +1 Armor |
| `reedling` | Reedlings | 8 | 12 | 10 | 8 | 9 | 13 | 8 | Springstep: +8 maximum Stamina, +2 Evasion |
| `emberling` | Emberlings | 8 | 9 | 13 | 8 | 12 | 9 | 9 | Pocket Hearth: +8 maximum Mana, +1 Ward |

All spreads have a total of 68. Passives are static additions, distinct from the level-one attribute totals. Flavor traits are descriptive only and grant no hidden mechanical benefit. Legacy race names remain resolvable: `Human` maps to Quayfolk and `Stonekin` maps to Cobblekin. Migration should retain imported stats rather than replacing them with a race's starter spread.

## Appearance

`dist/races.js` owns the appearance vocabulary; generated portrait atlases are customized at runtime. All new and revised character illustrations follow the shared prompts and approved visual references in [ART-DIRECTION.md](../ART-DIRECTION.md), using the same image-generation tool and visual direction as other game art. Appearance remains cosmetic and stored as enumerated IDs. Retain the existing internal selector IDs for save compatibility, but map them by race to species-specific display labels and atlas frames; the old shared hairstyle names do not imply that every people has human hair. Presentation (`female`, `male`; legacy `feminine` and `masculine` inputs normalize to these), palette choices, and one of five species-specific grooming/crest/coat forms are available to both presentations. Keep eyes and the relevant surface palette customizable: human hair for Quayfolk, mineral accents and stone tones for Cobblekin, fin colors and skin tones for Reedlings, and fur accents and basecoat tones for Emberlings. The options export includes readable labels and palette colors for selector UI. `normalizeAppearance` replaces unknown values with safe defaults; runtime composition uses enumerated colors and appearance data rather than raw user-supplied markup.

## Visual identity

The four peoples must look genuinely different in anatomy, silhouette, and surface material, not like humans with a single feature added. Keep them unified through the canonical soft-pixel treatment, shared palette roles, approachable expressions, simple adventurer clothing, and restrained detail. Their signature bodies and faces should remain legible at actual portrait display sizes:

- **Quayfolk:** familiar canal-town humans with human proportions and ordinary human ears, faces, hands, and feet. Their five forms are human hairstyles: Crop, Tousled, Braid, Ponytail, and Shaved.
- **Cobblekin:** squat, smooth pebblefolk. Give them broad stone heads and cheeks, mittenlike masonry hands, and rounded stone feet. Their base surface is warm sandstone; they should read as stone people even where clothing and pose resemble the others. Their five forms are head crests: Riverworn, Pebble crown, Crystal cluster, Moss ridge, and Polished stone. Use mineral accents and stone-tone palettes, never human hair.
- **Reedlings:** slender frog/newt amphibious humanoids with wide-set eyes, a flattened muzzle, outward fin gills, webbed fingers, and broad splayed toes. Their base skin is muted slate-teal. Keep the amphibian anatomy clear rather than adding long ears to a human face. Their five forms are Smooth crest, Reed fan, Ribbon gills, Swept sail, and Low fins; use fin colors and skin tones.
- **Emberlings:** small sooty fox/redpanda hearthfolk with a short muzzle, huge tufted ears, and a fluffy side tail. Use amber cheeks and tailtip; tiny amber horn nubs are secondary and must not replace the mammalian silhouette. Their five coat forms are Sleek coat, Fluffy coat, Cheek tufts, Hearth ruff, and Short coat. Use fur accent colors and basecoat tones; Emberlings have no human hair.

Each generated race atlas has ten presentation/style variants: female and male presentation crossed with that race's five species-specific forms. Internal canonical selector IDs remain stable for save compatibility and resolve to race-specific labels and atlas frames. Eyes and each race's appropriate grooming, crest, or coat form and color palette remain runtime customization. Presentation changes proportions subtly but never mechanics. Keep all selections and details visible at supplied integer sizes (64, 96, or 128 pixels wide), beside readable identity text, with useful alt text. Review the actual creation preview and character-sheet display sizes.

## Runtime API

- `RACES`: frozen records keyed by stable ID. Each record exposes `stats`, `passive`, `passiveName`, `passiveDescription`, and non-mechanical `trait`.
- `resolveRace(idOrAlias)`: returns a race record or `null`.
- `APPEARANCE_OPTIONS` and `normalizeAppearance(raceId, value)` are exported by `dist/races.js` as frozen selector metadata and a frozen, validated appearance object. `dist/character-art.js` re-exports both for compatibility.
- The character-art runtime selects and composes the generated portrait atlas with validated race and appearance options, returning an accessible portrait for the UI.

## Legacy adoption and balance scope

Older characters keep their invested attributes and existing identity. They receive no automatic racial bonus until explicitly adopting one heritage in Edit identity. This one-time choice adds the chosen passive but never resets stats or grants current resources. New characters receive their chosen race spread directly; the simple starting kit only controls equipment and the first equipped action. Appearance can be changed later outside combat, while the mechanical heritage stays fixed.

Equal budgets and bounded static passives are starting constraints, not proof of PvP balance. The integration test covers all four peoples with the three visible kits and the preserved legacy Bulwark kit against the initial rat encounter, using explicit exchanges and fixed rolls. All combinations win in 3–6 exchanges; longer-run and PvP matchup testing remains future balancing work.
