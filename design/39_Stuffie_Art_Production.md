# Stuffie character art — v0.13

[ART-DIRECTION.md](../ART-DIRECTION.md) is mandatory for every illustration and icon. These five production atlases were generated with its exact shared positive and negative style headers and the approved Ledger Rat and Bracken Quay reference images. Each original PNG is copied unchanged; no raster painting, pixel edits or programmatically drawn replacement characters were used. The short bunny-ear form was refined through image generation.

| Type | In-world brand | Five cosmetic forms |
| --- | --- | --- |
| Bear | Cuddleworth Bears | Classic, fluffy, patchwork, knit, short pile |
| Bunny | Pellet & Pip Bunnies | Floppy, upright, one folded, long lop, short upright ears |
| Unicorn | Lullabrite Unicorns | Fabric curls, forelock tuft, yarn braid, cloud ruff, short mohair |
| Wolf | Sturdy Stitch Wolves | Soft scruff, neck ruff, patch face, long cheek tufts, tidy coat |
| Cat | Purrfect Patch Cats | Tabby, tuxedo, calico, fluffy, short coat |

All figures are upright bipedal stuffed animals with fabric seams, soft paws or hoof-feet, embroidered/button eyes, modest toy adventuring accessories and complete visible feet/tails/ears. Presentation is cosmetic; both rows offer all five forms and all palette options.

## Production and display

Each delivered atlas is 1983 × 793 RGBA with ten figures. Individual alpha bounds are measured because ears/tails can extend beyond nominal equal cells. `character-art.js` exports the exact frame bounds, then fits whole poses proportionally into a 396.6 × 420 viewport with feet at y410. The manifest records actual file hashes, alpha extrema, per-frame source/visible bounds, fit scale and offsets. Default choices show the original generated fabric, trim and eyes; optional palettes composite the same cropped pixels through source-alpha/luminance filters. There is no code-drawn portrait. Legacy appearance IDs remain safe serialization keys even though their labels now describe plush forms.

Root reviewed actual runtime renders at 64px and 128px, including every species/form and contrasting palettes. The selected body never loses ears, tails or paws at a grid cut. Focused tests verify all 50 poses, all 5000 appearance combinations, source bounds, asset dimensions, safe inputs, and exact standalone PNG embedding. Chromium cannot launch in this sandbox, so browser layout review remains a separate device check.

## Save and gameplay boundary

Canonical race IDs are bear, bunny, unicorn, wolf and cat. Old quayfolk/cobblekin/reedling/emberling choices resolve to bear/wolf/bunny/unicorn. Their invested attributes and current resources are preserved subject to normal maxima; no race change grants a free refill. The Cat uses the same 68-point budget and a modest passive. All classes, kits and presentation options remain independent.
