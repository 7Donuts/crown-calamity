# C0: Gear helper export cleanup

Moved `familyLabel`, `MATERIAL_CHAPTER`, `recipeRegion` and `WEAPON_FAMILIES` to direct named exports on the engine namespace. Removed the properties from `materialLabel` and updated app call sites to use direct engine exports.

The new engine test was run first and failed because `G.familyLabel` was absent. After the implementation, the targeted engine tests pass. The save and roster fixture embedded in `tests/engine.test.mjs` was serialized using the unchanged main engine at `/workspace/sites/crown-and-calamity`, source SHA `cbc14b9f0f35901c3b549c590da9afe5a36b6e03`. It checks progress, stats, equipment, item mods, materials, abilities, the paid relic license and active/spare roster characters against the branch importer. The newer default relic socket is added while the captured license remains intact.

Validation:

- `node tests/engine.test.mjs`: 39 passed, 0 failed.
- `npm test`: 42 test files passed, 0 failed.
- `node --check dist/engine.js && node --check dist/gear.js && node --check dist/app.js && node --check tests/engine.test.mjs`: passed.
- In a temporary copy of `dist/`, `scripts-package.py` and `package.json`, `python3 scripts-package.py`: `Packaged v0.14.1`.
- Red and green test output: `/tmp/c0-export-cleanup-red.log` and `/tmp/c0-export-cleanup-main-fixture.log`; full suite output: `/tmp/c0-export-cleanup-npm-test.log`.

Scope stayed within C0. Catalog counts remain 154 items, the pinned material sprite count remains 32, and no spec or gameplay numbers changed. There was no UI layout change, so the phone layout check does not apply.
