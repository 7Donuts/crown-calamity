# Races and identity

The release introduces four playable peoples of Bracken Quay. Race sets the character's starting attribute spread and one modest static passive. The player may freely reassign the twelve points above the seven-attribute minimum of eight, so every starting spread totals 68 and remains respec-able. A starter kit continues to control starting equipment and its ability; it does not overwrite race stats.

| ID | Display name | Might | Finesse | Intellect | Vitality | Will | Insight | Luck | Passive |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `quayfolk` | Quayfolk | 10 | 10 | 10 | 10 | 10 | 9 | 9 | Well Provisioned: +4 maximum Health, +4 maximum Mana, +4 maximum Stamina |
| `cobblekin` | Cobblekin | 12 | 8 | 8 | 13 | 10 | 9 | 8 | Cobblehide: +12 maximum Health, +1 Armor |
| `reedling` | Reedlings | 8 | 12 | 10 | 8 | 9 | 13 | 8 | Springstep: +8 maximum Stamina, +2 Evasion |
| `emberling` | Emberlings | 8 | 9 | 13 | 8 | 12 | 9 | 9 | Pocket Hearth: +8 maximum Mana, +1 Ward |

All spreads have a total of 68. Passives are static additions, distinct from the level-one attribute totals. Flavor traits are descriptive only and grant no hidden mechanical benefit. Legacy race names remain resolvable: `Human` maps to Quayfolk and `Stonekin` maps to Cobblekin. Migration should retain imported stats rather than replacing them with a race's starter spread.

## Appearance

`dist/races.js` owns the appearance vocabulary; `dist/character-art.js` renders the original layered SVG pixel art. Appearance is cosmetic and stored as enumerated IDs: presentation (`female`, `male`; legacy `feminine` and `masculine` inputs normalize to these), hair style (`crop`, `tousled`, `braid`, `ponytail`, `shaved`), hair color (`ink`, `chestnut`, `copper`, `wheat`, `moss`), eye color (`slate`, `teal`, `hazel`, `amber`), and skin tone (`cream`, `sand`, `copper`, `umber`, `slate`). The options export includes readable labels and palette colors for selector UI. `normalizeAppearance` replaces unknown values with safe defaults; the renderer only inserts colors from its internal enumerated palette and accepts no raw SVG or CSS from saved appearance data.

Portrait silhouettes distinguish the four peoples with compact build, long ears, or swept horns. Presentation changes proportions subtly; all variants share the same clothing and pose. Hair and eye selectors visibly change the artwork. Keep the portrait rendered at its supplied integer sizes (64, 96, or 128 pixels wide), beside readable identity text, with useful alt text. This requested player identity art is the approved exception to the earlier no-portrait rule.

## Runtime API

- `RACES`: frozen records keyed by stable ID. Each record exposes `stats`, `passive`, `passiveName`, `passiveDescription`, and non-mechanical `trait`.
- `resolveRace(idOrAlias)`: returns a race record or `null`.
- `APPEARANCE_OPTIONS` and `normalizeAppearance(raceId, value)` are exported by `dist/races.js` as frozen selector metadata and a frozen, validated appearance object. `dist/character-art.js` re-exports both for compatibility.
- `renderCharacterArt(raceId, appearance, { size = 'medium' } = {})` from `dist/character-art.js` returns an accessible inline SVG portrait fragment.

## Legacy adoption and balance scope

Older characters keep their invested attributes and existing identity. They receive no automatic racial bonus until explicitly adopting one heritage in Edit identity. This one-time choice adds the chosen passive but never resets stats or grants current resources. New characters receive their chosen race spread directly; the simple starting kit only controls equipment and the first equipped action. Appearance can be changed later outside combat, while the mechanical heritage stays fixed.

Equal budgets and bounded static passives are starting constraints, not proof of PvP balance. The integration test covers all four peoples with the three visible kits and the preserved legacy Bulwark kit against the initial rat encounter, using explicit exchanges and fixed rolls. All combinations win in 3–6 exchanges; longer-run and PvP matchup testing remains future balancing work.
