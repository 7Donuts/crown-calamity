> Historical v0.10.1 production record. Superseded by [the v0.13 stuffie production record](39_Stuffie_Art_Production.md). Old runtime atlases are retired; their originals remain in Git history.

# Generated character art — v0.10.1

[ART-DIRECTION.md](../ART-DIRECTION.md) is mandatory for all new and revised game art. There is no separate character style. Every atlas below was generated with its shared positive/negative prompt headers and the approved runtime Ledger Rat and Bracken Quay reference images. Final generated PNGs are copied unchanged into production; intermediate studies remain outside the game.

## Four peoples, four cosmetic vocabularies

- Quayfolk: approachable canal-town humans; Crop, Tousled, Braid, Ponytail, Shaved.
- Cobblekin: broad squat pebblefolk with stone heads, cheek plates, masonry hands and rounded stone feet; Riverworn, Pebble crown, Crystal cluster, Moss ridge, Polished.
- Reedlings: slender amphibious newtfolk with broad muzzles, wide-set eyes, gills, webbed hands and splayed toes; Smooth crest, Reed fan, Ribbon gills, Swept sail, Low fins.
- Emberlings: small soot-furred hearthfolk with short muzzles, tufted ears, tiny secondary horn nubs and fluffy tails; Sleek coat, Fluffy coat, Cheek tufts, Hearth ruff, Short coat.

Both presentation rows use the same species anatomy and cosmetic forms. Nonhuman races have no human hair. Internal `hairStyle`, `hairColor` and `skinTone` save keys remain for compatibility; visible labels and palettes are race-specific. Polished Cobblekin and shaved Quayfolk do not show an irrelevant accent-color control. Existing saved appearance IDs are retained, and no combat values change.

## Runtime and source geometry

Each delivered atlas is 1983 × 793 RGBA, with five columns of 396.6 pixels. The female row precedes the male row. Quayfolk split at y=414; other peoples split at y=396. Runtime crops use the source image directly and register visible feet at y=409–410 in a 396.6 × 420 viewport. The [manifest](../dist/art-manifest.json) records measured source bounds and per-frame visible alpha bounds. Transparent trailing source margins can extend beyond the viewport; visible toes remain inside it.

`character-art.js` composes the generated raster artwork with source-alpha-preserving SVG palette filters and species-specific masks. It does not draw a replacement character. Filters retain source luminance and outlines; clipped regions keep tinting away from equipment and empty margins. Eye and surface colors are cosmetic. Palette changes apply to the generated shading rather than flat opaque paint. The standalone packager embeds all four exact PNGs so portraits also work offline.

## Review evidence and limits

Root reviewed the actual runtime SVG rendered at 128px, including all races, both presentations and contrasting palette/form examples. Smaller 64px views were also inspected. Automated checks cover all 4000 saved appearance combinations, exact PNG metadata and embedded bytes, hostile inputs, source crops and measured foot alignment. Browser-based layout verification is unavailable in this sandbox; raster review does not substitute for a future device/browser check. These checks establish presentation and save compatibility, not PvP or long-term gameplay balance.
