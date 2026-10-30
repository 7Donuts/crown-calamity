# Unique equipment and material art

The v0.14.1 art pass replaces shared equipment-family images with a distinct generated illustration for every current item: **154 equipment items and 32 materials**. This includes all nineteen relics, the five chapter keepsakes and every regional workshop material. Item IDs, material save keys, statistics, prices and progression rules are unchanged by the art update.

[ART-DIRECTION.md](../ART-DIRECTION.md) remains the canonical guide. Every generation used its exact positive and negative headers and both approved references, the Ledger Rat and Bracken stall. Objects are stuffie-sized found objects, sewing supplies, toy parts and soft clothing. Distinct silhouettes and material cues carry identity; a recolor of a shared icon is not a substitute for new item art.

## Installed sheets

| Atlas | Content | Count | Source size |
| --- | --- | ---: | --- |
| `might-weapons.png` | Might weapons | 25 | 1254 × 1254 |
| `finesse-weapons.png` | Finesse weapons | 25 | 1254 × 1254 |
| `magic-weapons.png` | Magic weapons | 25 | 1254 × 1254 |
| `head-body-gear.png` | Head and body equipment | 20 | 1402 × 1122 |
| `hands-feet-gear.png` | Hand and foot equipment | 20 | 1402 × 1122 |
| `offhands-accessories.png` | Offhands and accessories | 20 | 1402 × 1122 |
| `relic-collection.png` | Unique relics and chapter keepsakes | 19 | 1402 × 1122 |
| `workshop-materials.png` | Original and early regional materials | 16 | 1254 × 1254 |
| `regional-materials.png` | Later regional materials | 16 | 1254 × 1254 |

All sheets live in `dist/assets/items/`. Their original generated RGBA pixels are retained unchanged. The final relic cell is deliberately unmapped; its generated transparent background has alpha-1 residue and no visible item. The older `item-atlas.png` is retained for the generic materials-bag and toolkit service illustrations.

## Crop and rendering rules

Source spacing is not reliably an equal grid. The production pass measured individual alpha-connected silhouettes, including paired gloves, shoes and detached item parts, then added a small safe margin. Early crops that cut shield handles or included neighboring pixels were rejected and corrected through crop metadata.

`dist/item-art-data.js` maps each stable ID to one unique source rectangle. `dist/item-art.js` renders a square SVG viewport containing an aspect-fitted inner SVG crop and one generated PNG image. The inner viewport clips every source edge, including letterboxed areas. No paths, vector-drawn item shapes, programmatically painted pixels or runtime recolored substitutes contribute to these icons. Unknown IDs render no art.

The manifest records actual dimensions, RGBA alpha extrema, file SHA-256, individual source bounds and measured high-alpha content bounds. Equipment and material mappings are checked against their complete catalogs. Every one of the 186 crop pixel payloads was independently checked for uniqueness; no source rectangles overlap or extend outside their sheets.

## Review and use

Root reviewed all crops at 24 and 48 pixels, followed by renders from the actual nested-SVG runtime function at those same sizes. This review checked full outlines, paired parts, neighboring-image leaks, material identity and legibility. It does not claim a new mobile-browser layout audit.

Material art accompanies readable amounts and labels in the Satchel, battle receipts and Sewing Kit inputs/outputs. Equipment art appears through the existing shared renderer in shops, comparisons, equipment slots, rewards and relic selection. Generic navigation and service icons remain semantic generated artwork; a text-only system such as Pluck does not acquire an unrelated placeholder illustration.

Open [the illustrated catalog](../dist/art-catalog.html) through the local server or the deployed site to compare all icons at 24 and 48 pixels. The gallery is a review aid, not a new gameplay menu.

For future catalog additions, generate a new illustration using the canonical references and headers, measure its source bounds, add its unique mapping and manifest record, and inspect its runtime render. Do not temporarily point new item IDs at an existing item's illustration. `npm test` checks catalog coverage, generated source integrity, crop bounds, separation and offline embedding.
