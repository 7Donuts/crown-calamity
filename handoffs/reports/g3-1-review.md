# Independent Review: G3-1 Effective Level and Post-Story Curves

- **Branch**: `build/g3-1-effective-level`
- **Spec**: `design/50_Spec_Growth_and_Becoming_Real.md` ("Curves" and "Data and saves")
- **Verdict**: **PASS**

## Review Checklist

1. **Pure Growth Module (`dist/growth.js`)**:
   - `effectiveLevel(s)` computes `50 * R + level` and is never stored as a mutable save field.
   - `xpNeeded(level, realness)` preserves exact story XP values at `realness === 0` (`l <= 50`) and applies `(100 + 10 * R) * (20 + 12 * E)` for `realness >= 1`.
   - `postStoryEnemyStats`, `postStoryRewards`, `postStoryGearPrice` (1,100 wins entry / 2,000 wins best per CP1/D12), `postStoryWeaponTier`, and `postStoryWeaponBase` match Spec 50.
2. **Audit of `s.level` → `effectiveLevel(s)` Conversions (Trap 10)**:
   - Every combat, progression, mitigation, off-hand, weapon-family, ability-unlock, enemy-access, delve, and contract-unlock check uses `effectiveLevel(s)`.
   - `s.fight.startLevel` stores `effectiveLevel(s)` so post-story XP scaling and mastery eligibility work without underflow.
3. **Save Validation & Compatibility**:
   - `loadSave()` keeps `s.level` validated in `1..50` (`LEVEL_CAP`), validates optional `realness` and `realnessChoices`, and normalizes legacy v1–v6 saves to `realness: 0, realnessChoices: []`.
   - Bundler compatibility (`scripts-package.py`) verified: all new exports use `import { ... } from ...; export { ... };`.
4. **Tests**:
   - `tests/growth.test.mjs` and the full regression suite pass.
