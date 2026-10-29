# Approved soft-pixel references (prototype)

The style and these two references are approved starting points for production. The canonical rules, palette, scale guidance, accessibility requirements, and prompt templates now live in [ART-DIRECTION.md](../ART-DIRECTION.md). This document records the studies and should not override that guide.

The earlier ornate, highly detailed images felt generic and too high-resolution. These studies establish a gentler look: rounded forms, chunky color clusters, a compact muted palette, warm lantern light, and friendly rather than grim creatures. They are approved visual references, not precision production assets.

## Prototype files

- [Ledger Rat idle sheet](soft-pixel/ledger-rat-idle.png) — transparent RGBA PNG, 1254 × 1254. The sheet has a clear 2 × 2 arrangement of the same centered character at matching scale: neutral, slight bob, ear/tail variation, and return toward neutral. The pose differences are subtle and the generated canvas is larger than requested; treat these as a visual animation proposal, not pixel-perfect authored frames.
- [Bracken Quay stall scene](soft-pixel/bracken-stall.png) — opaque RGB PNG, 1536 × 1024. Rounded canal architecture, bridge, reeds, simple stall shapes, and amber lights use a softer, more approachable scene treatment.

Both files are preserved unchanged from image generation. No resize, crop, repaint, or other pixel editing was applied.

## Prototype observations

The original suggestions of a 32 × 32 creature grid and 96 × 64 backdrop canvas were rough study targets, not fixed production dimensions. Follow the scale budgets and sixteen-color role palette in the canonical guide; treat source PNG dimensions as container size rather than display size. Favor readable silhouettes, broad color groups, and warm light as a small focal accent.

The rat sheet's poses suggest a decorative idle bob and ear or tail twitch, with no gameplay timing or action implied. Disable animation when `prefers-reduced-motion: reduce` is set; keep the neutral pose visible. Production sprite frames need stable scale and foot registration before they are used as an animation atlas.

Generated for a visual direction prototype on 2026-10-29. The images were inspected and copied unchanged from the image-generation output.

## Interactive review

The independent source preview is [soft-pixel/index.html](soft-pixel/index.html). Run `python3 scripts-soft-pixel-preview.py` to produce an offline HTML with both unchanged PNGs embedded. CSS displays the 2×2 atlas as four held frames; Pause and sprite-size controls change presentation only. The page imports no game modules and reads no campaign storage. It respects reduced-motion preferences and does not animate text or advance gameplay.
