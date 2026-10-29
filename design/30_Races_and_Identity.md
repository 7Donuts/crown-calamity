# Stuffie kinds and identity

Each new character is an original soft stuffed toy adventurer. Their silhouettes are bipedal and plush, with stitched seams, fabric texture, button or embroidered eyes, and short paws. The names use original toy-brand style labels. The new canonical race IDs are `bear`, `bunny`, `unicorn`, `wolf`, and `cat`; legacy identifiers remain aliases for imported saves.

| ID | Display name | Might | Finesse | Intellect | Vitality | Will | Insight | Luck | Passive |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `bear` | Cuddleworth Bears | 10 | 10 | 10 | 10 | 10 | 9 | 9 | Well Loved: +4 maximum Health, Mana, and Stamina |
| `bunny` | Pellet & Pip Bunnies | 8 | 12 | 10 | 8 | 9 | 13 | 8 | Pellet Shuffle: +8 maximum Stamina and +2 Evasion |
| `unicorn` | Lullabrite Unicorns | 8 | 9 | 13 | 8 | 12 | 9 | 9 | Night-Light: +8 maximum Mana and +1 Ward |
| `wolf` | Sturdy Stitch Wolves | 12 | 8 | 8 | 13 | 10 | 9 | 8 | Reinforced Seams: +12 maximum Health and +1 Armor |
| `cat` | Purrfect Patch Cats | 8 | 12 | 8 | 9 | 9 | 10 | 12 | Soft Landing: +1 Evasion, +4 maximum Mana and Stamina |

Every spread totals 68 and has a minimum of 8 in each attribute. Flavor traits have no hidden mechanical effect. Legacy IDs and names resolve as follows: `quayfolk` / `Cuddleworth Classics` to bear, `reedling` / `Floppables by Pellet & Pip` to bunny, `emberling` / `Lullabrite Nightlight Pals` to unicorn, and `cobblekin` / `Sturdy Stitch Workwear` to wolf. Existing saved stats and current resources are preserved during migration. Older characters without a selected `raceId` gain no passive until they explicitly adopt one.

## Appearance

Appearance is cosmetic and stored as enumerated IDs. The default appearance preserves each generated atlas’s original coat and trim: bears and cats start copper, bunnies sand, unicorns cream, and wolves slate; all kinds start with their original teal trim and brown eyes. Choosing another enumerated color applies a luminance tint to the cropped generated pixels, constrained to their alpha. `female` and `male` presentations, every color palette, and all five forms are available to every presentation. Existing style IDs (`crop`, `tousled`, `braid`, `ponytail`, `shaved`) remain for save compatibility and map to species-specific labels and generated atlas frames.

- Bears use classic, fluffy, patchwork, knit, and short-pile plush finishes.
- Bunnies use floppy, upright, one-fold, long-lop, and tiny ears.
- Unicorns use curled fabric manes, fluffy tufts, braided yarn, cloud ruffs, and short mohair.
- Wolves use soft scruffy coats, neck ruffs, patch faces, long cheek tufts, and tidy coats.
- Cats use tabby, tuxedo, calico, fluffy, and short coats.

Runtime portraits crop the generated RGBA atlases and apply enumerated color masks constrained to existing pixels. Portrait code must not draw replacement character shapes. Follow the positive and negative prompts and approved visual references in [ART-DIRECTION.md](../ART-DIRECTION.md); record measured atlas dimensions, crop bounds, and hashes in the art manifest. Review art at the actual card, creator, and character-sheet display sizes.

## Runtime API and migration

`RACES` is frozen and keyed by the canonical IDs above. `resolveRace(idOrAlias)` returns a race record or `null`. `getAppearanceOptions`, `getAppearanceLabels`, and `normalizeAppearance` expose validated appearance data; `character-art.js` retains its compatibility exports. Existing race aliases remain resolvable. Migration retains invested attributes and current resources, and leaves legacy saves with no chosen race null until explicit adoption.
