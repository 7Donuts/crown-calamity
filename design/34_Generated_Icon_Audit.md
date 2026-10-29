# Generated runtime icon audit

This audit records the code-drawn runtime icon sources found in the current application and sets the migration contract. The canonical requirements are in [`ART-DIRECTION.md`](../ART-DIRECTION.md); [`AGENTS.md`](../AGENTS.md) makes them repository-wide requirements. The table records the sources found before migration; the completion record below describes the installed replacements. The manifest contains the measured dimensions and crop bounds.

## Sources audited before migration

| Runtime use | Current source | Finding |
| --- | --- | --- |
| Shared status, resource, combat, gear, and service symbols | `dist/ui-icons.js` (path table and SVG path construction) | Icons are hand-built as SVG path strings. `dist/app.js`, `dist/character-sheet.js`, and `dist/battle-report.js` render them. Replace the art source with generated raster assets while preserving surrounding labels and state behavior. |
| Navigation and menu props | `dist/menu-icons.js:3-36`, `dist/pixel-menu-art.js:1-6` | Menu symbols are composed from hand-authored path/grid data and wrapped in SVG. All navigation props need generated raster sources. |
| Character gear overview | `dist/app.js:41` (`gearDiagram`) and `.gear-figure` rules in `dist/style.css` / `dist/hud.css` | The generic central body outline is an inline SVG path, with slot cards placed around it. Replace the drawn body outline with generated art while retaining the accessible slot controls and their labels. The slot cards themselves are controls; any standalone symbol inside them is also an icon. |
| Victory chest and lid motion | `dist/battle-report.js:126` and `dist/battle-report.css` | Chest body/lid are inline vector paths with CSS animation. Use generated chest imagery; animation may move or composite generated pixels, but must not redraw the chest. Preserve reduced-motion behavior. |
| Battle report symbols | `dist/battle-report.js:22-24` | `glyph()` emits SVG containing the shared path data. The report, toggle, event, and reward marks all need generated sources. |
| Story objective completion | `dist/story-ui.js:6` | Completed/unfinished states are rendered as standalone `✓` and `○` glyphs. Use generated assets for these marks, retaining the objective text and completion state. |
| Attribute increment controls | `dist/app.js:80` | The standalone `+` is the entire visible control mark. Replace it with generated art and preserve the existing accessible “Add one point to [attribute]” name and button behavior. |
| Favicon | `dist/assets/crown.svg`; referenced by `dist/index.html` and `dist/lab.html` | The favicon is a hand-authored SVG crown/rune. Replace with generated raster art; update references to the delivered asset after its actual path is known. |
| Lab controls and symbols | `dist/lab-ui.js:4-9,25` and `dist/lab.css` | The lab uses the shared `UI_ICONS` SVG path source for its controls. Switch these to generated art along with the main UI; retain semantic button text and accessible names. |
| CSS-generated marks | `dist/style.css:182` (`content: '•'`) | This is punctuation used as a readable list marker, not a standalone pictorial icon. Ordinary punctuation and arrows inside readable labels or prose remain text. Revisit only if it is repurposed as an icon. |

The list is scoped to runtime artwork and standalone pictograms. Text arrows such as `→` in a readable action label and punctuation inside prose are not icons. Unicode checks or symbols used alone to convey state are icons and require generated assets. Standard HTML list markers can remain typographic markers.

## Required contract for all future runtime icons

- Generate icon art with the same approved visual references and shared positive/negative prompts in `ART-DIRECTION.md` as other game illustrations. This includes status and resource icons, controls, navigation, diagrams, feedback, animation props, lab surfaces, and browser/app identity marks.
- Do not create runtime icon artwork with SVG paths/primitives, custom path data, code-built pixel grids, CSS-drawn shapes or illustrations, emoji, or standalone Unicode pictograms. SVG may only define a crop/viewport or composite existing generated raster pixels. Icon rendering must not add filters, tints, masks, palette edits, or other effects that alter the generated art. Character-portrait customization follows its separate allowance in `ART-DIRECTION.md`.
- Keep the generated source raster and its RGBA pixel values unchanged. Do not silently modify, paint over, or regenerate existing delivered art to make it fit. Review the actual output at the display size and confirm its silhouette and contrast.
- Update `dist/art-manifest.json` from the delivered files: record actual dimensions, file mode, alpha presence, measured transparency/crop bounds, relevant frame/cell dimensions, display size, provenance, and SHA-256. Preserve existing manifest measurements and hashes for unchanged art. Never guess replacement paths or measurements.
- Icons support the interface; they do not replace readable meaning. Keep semantic text labels for controls, provide an accessible name for icon-only controls, and mark decorative imagery `aria-hidden`. Keep state understandable without color alone, maintain at least 4.5:1 contrast for ordinary text, and retain a minimum 48 × 48 px primary touch target.
- For the equipment overview, generated body art is decorative; the adjacent named slot controls remain the accessible, keyboard- and screen-reader-operable equipment map. For animation, animate only generated imagery and honor reduced-motion preferences.

## Completion record

Completed in v0.10.4: `dist/generated-icon-art.js` now supplies 65 generated icon families plus semantic aliases. Four original 1254 × 1254 RGBA atlases live under `dist/assets/icons/`: `adventure-atlas.png`, `status-atlas.png`, `utility-atlas.png` and `community-atlas.png`. Existing generated journal map art is reused. A generated `adventurer-outline.png` replaces the equipment SVG drawing, and the generated BURSAR emblem is reused unchanged as `crown-favicon.png`. The old vector favicon and path/grid icon drawings are removed.

Shared UI/menu, stats, actions, vendors, story markers, increment buttons, world placeholders and the playtest lab now use these PNG-backed crop fragments. Victory crossfades generated closed/open chests and tosses generated coin sprites, preserving explicit rewards and reduced motion. The manifest records measured file/cell/crop/alpha metadata and SHA-256 hashes; source PNG pixels remain unchanged.

Root reviewed the actual icon compositor at 24px and 48px and the outline/favicon at their display sizes. Automated checks cover source bounds, metadata, public keys, removal of runtime drawn glyphs, and standalone asset embedding. Browser layout verification is unavailable in this sandbox.
