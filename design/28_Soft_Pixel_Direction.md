# Soft pixel art direction

The user feedback is that the earlier ornate, highly detailed images felt generic and too high-resolution. This prototype tests a gentler, simpler pixel look: rounded forms, chunky color clusters, a compact muted palette, warm lantern light, and a friendly rather than grim creature. These two generated images are exploratory references, not finished production assets.

## Prototype files

- [Ledger Rat idle sheet](soft-pixel/ledger-rat-idle.png) — transparent RGBA PNG, 1254 × 1254. The sheet has a clear 2 × 2 arrangement of the same centered character at matching scale: neutral, slight bob, ear/tail variation, and return toward neutral. The pose differences are subtle and the generated canvas is larger than requested; treat these as a visual animation proposal, not pixel-perfect authored frames.
- [Bracken Quay stall scene](soft-pixel/bracken-stall.png) — opaque RGB PNG, 1536 × 1024. Rounded canal architecture, bridge, reeds, simple stall shapes, and amber lights use a softer, more approachable scene treatment.

Both files are preserved unchanged from image generation. No resize, crop, repaint, or other pixel editing was applied.

## Suggested production rules

Use a logical sprite grid around 32 × 32 pixels for small creatures and a roughly 96 × 64 logical canvas for scene backdrops. The PNG dimensions are storage dimensions, not a mandate to render every source pixel: display sprites with nearest-neighbor scaling at whole-number multiples of their logical size. Favor about 12–16 colors per asset, broad readable silhouettes, and large color groups. Keep slate blue-gray, dusty teal, soft moss, parchment, and amber as a shared palette; use warm light as a small focal accent.

If the rat frames are used, keep the loop slow and decorative: a small idle bob and ear or tail twitch, with no gameplay timing or action implied. Disable the animation when `prefers-reduced-motion: reduce` is set; the neutral pose remains visible. Production sprite frames should be authored or reviewed on the intended logical grid before treating this generated sheet as a precise animation source.

Generated for a visual direction prototype on 2026-10-29. The images were inspected and copied unchanged from the image-generation output.

## Interactive review

The independent source preview is [soft-pixel/index.html](soft-pixel/index.html). Run `python3 scripts-soft-pixel-preview.py` to produce an offline HTML with both unchanged PNGs embedded. CSS displays the 2×2 atlas as four held frames; Pause and sprite-size controls change presentation only. The page imports no game modules and reads no campaign storage. It respects reduced-motion preferences and does not animate text or advance gameplay.
