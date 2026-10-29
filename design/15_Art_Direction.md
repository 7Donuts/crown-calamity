# Historical enemy art direction (superseded)

This document preserves the earlier detailed, engraved-gouache visual treatment and atlas notes. Its visual treatment is superseded by the approved soft-pixel style in the canonical [ART-DIRECTION.md](../ART-DIRECTION.md). Existing art and dimensions recorded below describe that earlier production pass; use the canonical guide for new assets and replacements. The no-player-portraits rule remains in force.

The enemy illustrations use a shared dark-fantasy language: engraved ink contours, textured gouache, low canal-side light, muted teal magic, and worn brass. The palette and shadow treatment follow the Bracken Quay environment painting. Each enemy has a distinct silhouette and prop that reads at small sizes: paper-scroll rats, a hooded canal scavenger, a teal paper wisp, a chain-backed crab, a siltbound clipboard inspector, a mossy armored hound, and the mechanical Acting Superintendent.

The original 1774 × 887 PNG atlas lives at `dist/assets/enemies/enemy-atlas.png`. It is arranged as four columns and two rows, separated by clean gutters. The final bottom-right cell holds only a decorative blank municipal seal and is reserved. The seven enemy portraits are cropped directly from the atlas at render time with CSS background positions; this keeps the source image intact and makes the PNG the only required image asset. `dist/enemy-art.js` records each enemy ID, shared atlas path, background position, and pixel frame. The boss enemy ID is `boss`.

No player portraits, branding, or readable text appear in the artwork. Scrolls and the inspector's clipboard carry only indistinct marks.
