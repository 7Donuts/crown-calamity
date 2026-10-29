# Historical Arcane HUD direction (superseded)

This document preserves the earlier ornate BURSAR sigil and HUD image treatment. Its visual treatment is superseded by the approved soft-pixel style in the canonical [ART-DIRECTION.md](../ART-DIRECTION.md); the new emblem, favicon, and UI glyph set should follow that guide. Readability, touch target, one-action-per-tap, timing, and reduced-motion constraints below remain product requirements.

The interface should feel like a well-kept municipal instrument with a magical intelligence behind it: practical, calm, and a little uncanny. BURSAR is the bureau's arcane control system, represented by one brass rune-ring sigil with a geometric crown at its center and restrained teal runelight. Its language joins old canal-city craft to precise system feedback without making the play surface look like a software dashboard.

The original transparent PNG is `dist/assets/hud/bursar-sigil.png` (1265 × 1243 RGBA). Use the full mark for the BURSAR identity, and reuse it at low opacity as a restrained watermark where it does not compete with reading. Do not add a second texture or duplicate HUD emblem; the Bracken Quay environment image and enemy atlas remain the main scene art.

## Interface constraints

- Keep the battle log, labels, prices, action results, and progression text readable on dark surfaces. Body text should be at least 15 px; secondary text can be smaller only when it remains comfortable to read on a phone.
- Make primary action targets at least 48 × 48 px, with clear spacing and visible focus/disabled states.
- Use brass for emphasis and earned value, teal for arcane/system state, and pale warm text for ordinary reading. Keep teal light restrained; color must not be the only way to communicate status.
- Preserve one-action-per-tap combat, including the shared 650 ms pacing. The HUD may clarify state and timing but must not suggest queued or automatic actions.
- Keep BURSAR's explanatory messages concise and attached to the current choice or result. Never cover the enemy intent, required action, reward, or player's next decision with decorative detail.
- Respect reduced-motion preferences. No pulsing watermark, animated rune, flashing resource, or essential information conveyed only by motion.

The sigil is a brand and atmosphere asset. The game remains a readable, mobile-first text RPG, with the interface and decisions carrying the experience.
