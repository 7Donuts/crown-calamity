import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as Growth from '../dist/growth.js';
import { bootWithSave } from './shop-ui-harness.mjs';

// Tempering (design 50, "Post-story gear: Tempering"). No real waits and no random rolls in this file.

const TEMPER_SLOT_LIST = ['weapon', 'offhand', 'head', 'body', 'hands', 'feet'];
const KIT_IDS = { weapon: 'ironsword', offhand: 'buttonShield', head: 'paradeBonnet', body: 'captainJacket', hands: 'woollyWristguards', feet: 'stargazerShoes' };

function hero({ realness = 1, level = 1, coins = 5_000_000, bag = Object.values(KIT_IDS), kit = 'breaker' } = {}) {
  const s = G.createCharacter({ name: 'Temper Test', race: 'wolf', kit });
  s.realness = realness;
  s.level = level;
  s.coins = coins;
  for (const id of bag) if (!s.bag.includes(id)) s.bag.push(id);
  return s;
}

const roundTrip = state => {
  const loaded = G.loadSave(JSON.stringify(state));
  assert.ok(loaded, 'save loads');
  return loaded;
};
const incomePerWin = E => Math.round(1.1 * E);
const weaponsIn = channel => Object.values(G.ITEMS).filter(i => i.slot === 'weapon' && i.channel === channel);

test('tempering is refused at Realness 0 and allowed at Realness 1', () => {
  const s0 = hero({ realness: 0, level: 50 });
  const p0 = G.temperPreview(s0, 'ironsword');
  assert.equal(p0.allowed, false);
  assert.match(p0.reason, /Realness 1/);
  const coins = s0.coins;
  assert.equal(G.temperItem(s0, 'ironsword'), false);
  assert.equal(s0.coins, coins, 'a refused temper spends nothing');
  assert.equal(s0.itemMods.ironsword, undefined);
  assert.equal(G.temperMaxTier(s0), 0);

  const s1 = hero({ realness: 1, level: 1 });
  const p1 = G.temperPreview(s1, 'ironsword');
  assert.equal(p1.allowed, true, p1.reason);
  assert.equal(p1.target, 26);
  const receipt = G.temperItem(s1, 'ironsword');
  assert.equal(receipt.temper, 26);
  assert.equal(s1.itemMods.ironsword.temper, 26);
});

test('max tier follows effective level: one tier per four levels, T26 at E51', () => {
  const cases = [[1, 1, 26], [1, 4, 26], [1, 5, 27], [1, 50, 38], [2, 17, 42], [3, 1, 51], [10, 1, 25 + Math.floor((501 - 47) / 4)]];
  for (const [r, l, tier] of cases) {
    const s = hero({ realness: r, level: l });
    assert.equal(G.temperMaxTier(s), tier, `R${r} L${l}`);
    assert.equal(G.temperMaxTier(s), Growth.postStoryWeaponTier(G.effectiveLevel(s)));
    assert.equal(Growth.temperReferenceLevel(tier) <= G.effectiveLevel(s), true, 'the tier is open at this effective level');
    assert.equal(Growth.temperReferenceLevel(tier + 1) > G.effectiveLevel(s), true, 'the next tier is not');
  }
  const s = hero({ realness: 1, level: 1 });
  const early = G.temperPreview(s, 'ironsword', 27);
  assert.equal(early.allowed, false);
  assert.match(early.reason, /up to Real T26/);
  assert.match(early.reason, /effective level 55/);
  assert.equal(G.temperItem(s, 'ironsword', 27), false);
  assert.equal(G.temperItem(s, 'ironsword', 25), false, 'the first tier is 26');
  assert.equal(G.temperPreview(s, 'ironsword', 26.5).allowed, false);
  assert.equal(G.temperPreview(s, 'ironsword', 1e300).allowed, false);
});

test('one action may raise straight to any allowed tier and a lower tier is refused', () => {
  const s = hero({ realness: 1, level: 30 }); // E80, T 25 + floor(33/4) = 33
  assert.equal(G.temperMaxTier(s), 33);
  const receipt = G.temperItem(s, 'ironsword', 30);
  assert.equal(receipt.temper, 30);
  assert.equal(G.effectiveItem(s, 'ironsword').temper, 30);
  assert.equal(G.temperPreview(s, 'ironsword', 29).allowed, false);
  assert.match(G.temperPreview(s, 'ironsword', 30).reason, /Already tempered/);
  assert.equal(G.temperItem(s, 'ironsword').temper, 33, 'default target is the highest allowed tier');
  const done = G.temperPreview(s, 'ironsword');
  assert.equal(done.allowed, false);
  assert.match(done.reason, /up to Real T33/);
});

test('only weapons and armor can be tempered; fights lock it; ownership is required', () => {
  const s = hero({ bag: [...Object.values(KIT_IDS), 'penny', 'seal', 'ironsword'] });
  for (const id of ['penny', 'seal']) {
    const p = G.temperPreview(s, id);
    assert.equal(p.allowed, false);
    assert.match(p.reason, /weapons and armor/);
  }
  assert.equal(G.temperPreview(s, 'plushMaul').allowed, false, 'not owned');
  assert.match(G.temperPreview(s, 'plushMaul').reason, /do not own/);
  s.fight = { enemy: 'rats' };
  assert.match(G.temperPreview(s, 'ironsword').reason, /fight/);
  assert.equal(G.temperItem(s, 'ironsword'), false);
  assert.equal(G.temperPreview(s, 'nope').allowed, false);
});

test('weapon stats at tiers 26, 30, 38 and 51 follow the reference model', () => {
  const rows = [[26, 76.5, 10, 51], [30, 86.5, 12, 67], [38, 106.5, 15, 99], [51, 139, 20, 151]];
  for (const [tier, base, primary, E] of rows) {
    assert.equal(Growth.temperReferenceLevel(tier), E);
    assert.equal(Growth.postStoryWeaponBase(tier), base);
    const s = hero({ realness: 1, level: 1 });
    s.itemMods = { ironsword: { temper: tier } };
    const w = G.effectiveItem(s, 'ironsword');
    assert.equal(w.base, base, `T${tier} base`);
    assert.equal(w.stats.mig, primary, `T${tier} primary attribute is round(T x 0.4)`);
    assert.equal(w.temper, tier);
    assert.match(w.name, new RegExp(`Real T${tier}$`));
  }
});

test('armor, ward and slot stats at tier 26 use the fixture totals 20 + 3.4E and 16 + 2.8E', () => {
  const totals = Growth.temperDefenseTotals(51);
  assert.deepEqual(totals, { armor: 193, ward: 159 });
  const s = hero({ realness: 1, level: 1 });
  s.itemMods = Object.fromEntries(Object.values(KIT_IDS).map(id => [id, { temper: 26 }]));
  const expected = {
    offhand: { armor: Math.round(193 * 0.30), ward: Math.round(159 * 0.25), vit: Math.max(2, Math.round(51 * 0.08)) },
    body: { armor: Math.round(193 * 0.40), ward: Math.round(159 * 0.40), vit: Math.max(2, Math.round(51 * 0.12)), wil: Math.max(1, Math.round(51 * 0.06)) },
    head: { armor: Math.round(193 * 0.15), ward: Math.round(159 * 0.15), ins: Math.max(1, Math.round(51 * 0.06)) },
    hands: { armor: Math.round(193 * 0.08), ward: Math.round(159 * 0.10), mig: Math.max(1, Math.round(51 * 0.06)) },
    feet: { armor: Math.round(193 * 0.07), ward: Math.round(159 * 0.10), fin: Math.max(1, Math.round(51 * 0.05)) }
  };
  assert.equal(expected.body.armor, 77);
  for (const slot of ['offhand', 'body', 'head', 'hands', 'feet']) {
    const item = G.effectiveItem(s, KIT_IDS[slot]), own = G.ITEMS[KIT_IDS[slot]];
    const { armor, ward, ...stats } = expected[slot];
    // Reference share, except where the catalog item is already higher (T10 gloves and boots out-armor the E51 reference).
    assert.equal(item.armor, Math.max(armor, own.armor || 0), `${slot} armor`);
    assert.equal(item.ward, Math.max(ward, own.ward || 0), `${slot} ward`);
    for (const [k, v] of Object.entries(stats)) assert.equal(item.stats[k], v, `${slot} ${k}`);
  }
  // The six shares add up to the reference totals (to within rounding of each slot).
  const sum = key => ['offhand', 'body', 'head', 'hands', 'feet'].reduce((a, slot) => a + G.effectiveItem(s, KIT_IDS[slot])[key], 0);
  assert.ok(sum('armor') >= 191 && sum('armor') <= 193 + 8, `armor sum ${sum('armor')}`);
  assert.ok(sum('ward') >= 157 && sum('ward') <= 159 + 8, `ward sum ${sum('ward')}`);
  // From effective level 67 (tier 30) every slot is on the reference share, with no catalog item above it.
  const s30 = hero({ realness: 1, level: 17 });
  s30.itemMods = Object.fromEntries(Object.values(KIT_IDS).map(id => [id, { temper: 30 }]));
  const t30 = Growth.temperDefenseTotals(67);
  const sum30 = key => ['offhand', 'body', 'head', 'hands', 'feet'].reduce((a, slot) => a + G.effectiveItem(s30, KIT_IDS[slot])[key], 0);
  assert.ok(Math.abs(sum30('armor') - t30.armor) <= 2);
  assert.ok(Math.abs(sum30('ward') - t30.ward) <= 2);
});

test('a tempered piece is never a downgrade of the catalog item', () => {
  for (const item of Object.values(G.ITEMS)) {
    if (!Growth.isTemperSlot(item.slot) || item.keepsake) continue;
    const s = hero({ bag: [item.id] });
    s.itemMods = { [item.id]: { temper: 26 } };
    const t = G.effectiveItem(s, item.id);
    for (const key of ['base', 'armor', 'ward', 'spellBase']) assert.ok((t[key] || 0) >= (item[key] || 0), `${item.id} ${key}`);
    for (const [k, v] of Object.entries(item.stats || {})) assert.ok((t.stats[k] || 0) >= v, `${item.id} ${k}`);
    for (const key of ['channel', 'family', 'twoHanded', 'focus', 'kind', 'mend', 'slot', 'id', 'chapter', 'tier']) assert.equal(t[key], item[key], `${item.id} keeps ${key}`);
  }
});

test('identity: focus keeps its spell base role, menders keep mend, tempered non-shields do not become shields', () => {
  const s = hero({ bag: ['focus', 'charm', 'goldenNeedleCase', 'buttonShield', 'rod'], kit: 'caster' });
  for (const id of ['focus', 'charm', 'goldenNeedleCase', 'buttonShield', 'rod']) s.itemMods = { ...(s.itemMods || {}), [id]: { temper: 26 } };
  const focus = G.effectiveItem(s, 'focus');
  assert.equal(focus.focus, true);
  assert.equal(focus.spellBase, Math.round(Growth.postStoryWeaponBase(26) * 0.15), 'focus uses the fixture spell share');
  assert.ok(focus.armor > 0 && focus.ward > 0, 'offhand defensive share');
  assert.equal(G.effectiveItem(s, 'goldenNeedleCase').mend, G.ITEMS.goldenNeedleCase.mend, 'mender keeps its mend');
  assert.ok(G.effectiveItem(s, 'goldenNeedleCase').armor > 0);
  assert.equal(G.classifySecondHand(G.effectiveItem(s, 'goldenNeedleCase')), 'mender');
  assert.equal(G.classifySecondHand(G.effectiveItem(s, 'buttonShield')), 'shield');
  assert.notEqual(G.classifySecondHand(G.effectiveItem(s, 'focus')), 'shield', 'a tempered focus is not a shield');
  assert.notEqual(G.classifySecondHand(G.effectiveItem(s, 'charm')), 'shield', 'a tempered charm is not a shield');
  assert.equal(G.classifySecondHand(G.ITEMS.focus), G.classifySecondHand(G.ITEMS.focus), 'catalog classification is unchanged');
  const rod = G.effectiveItem(s, 'rod');
  assert.equal(rod.channel, 'spell');
  assert.equal(rod.focus, true);
  assert.equal(rod.stats.int, 10);
});

test('family spread stays within 8% inside every channel at the same tier, in base and in expected damage', () => {
  for (const channel of ['heavy', 'precision', 'spell']) {
    const weapons = weaponsIn(channel);
    assert.ok(weapons.length === 25);
    for (const tier of [26, 30, 38, 51]) {
      const bases = [], damages = [];
      for (const w of weapons) {
        const s = hero({ bag: [w.id], kit: channel === 'spell' ? 'caster' : 'breaker' });
        s.itemMods = { [w.id]: { temper: tier } };
        s.gear.weapon = w.id;
        s.gear.offhand = null;
        bases.push(G.effectiveItem(s, w.id).base);
        // Unconditional damage: the shared formula without any family trait (traits are separate, conditional rules).
        const t = G.totals(s), power = channel === 'spell' ? t.spellPower : channel === 'precision' ? t.precisionPower : t.heavyPower;
        damages.push(G.effectiveItem(s, w.id).base + 0.9 * power + 4);
      }
      const spread = arr => Math.max(...arr) / Math.min(...arr);
      assert.ok(spread(bases) <= 1.08, `${channel} T${tier} base spread ${spread(bases).toFixed(3)}`);
      assert.ok(spread(damages) <= 1.08, `${channel} T${tier} damage spread ${spread(damages).toFixed(3)}`);
      const avg = damages.reduce((a, b) => a + b, 0) / damages.length;
      for (const d of damages) assert.ok(Math.abs(d / avg - 1) <= 0.08, `${channel} T${tier} each weapon is within 8% of the channel average`);
    }
  }
  const families = new Set(Object.values(G.ITEMS).filter(i => i.slot === 'weapon').map(i => i.family));
  assert.equal(families.size, 9);
});

test('two-handed weapons keep a bounded premium over one-handed weapons of the same channel and tier', () => {
  const twoHanded = Object.values(G.ITEMS).filter(i => i.slot === 'weapon' && i.twoHanded);
  assert.ok(twoHanded.length >= 7);
  for (const tier of [26, 30, 38, 51]) {
    const oneHanded = G.effectiveItem((() => { const s = hero({ bag: ['velvetBumper'] }); s.itemMods = { velvetBumper: { temper: tier } }; return s; })(), 'velvetBumper');
    for (const w of twoHanded) {
      const s = hero({ bag: [w.id] });
      s.itemMods = { [w.id]: { temper: tier } };
      const t = G.effectiveItem(s, w.id);
      assert.equal(t.twoHanded, true);
      assert.equal(t.channel, oneHanded.channel);
      assert.ok(t.base > oneHanded.base, `T${tier} ${w.id} keeps a premium`);
      assert.ok(t.base / oneHanded.base <= 1.041, 'the premium is bounded at 4% (plus one-decimal rounding)');
      assert.equal(t.base, Math.round(Growth.postStoryWeaponBase(tier) * 1.04 * 10) / 10);
    }
  }
  assert.equal(Growth.temperWeaponFactor({ twoHanded: false }), 1);
  assert.equal(Growth.temperWeaponFactor({ twoHanded: true }), 1.04);
  assert.ok(Growth.TEMPER_FACTOR_BOUNDS[1] <= 1.08);
});

test('workbench upgrades and affixes stack on top of tempered values', () => {
  const s = hero({ bag: ['ironsword', 'thimbleMaul', 'captainJacket'], realness: 1, level: 1 });
  s.materials = { ...s.materials, 'Canal iron': 99, 'Salvaged fittings': 99 };
  for (const id of ['ironsword', 'thimbleMaul', 'captainJacket']) assert.ok(G.temperItem(s, id));
  const baseline = Object.fromEntries(['ironsword', 'thimbleMaul', 'captainJacket'].map(id => [id, G.effectiveItem(s, id)]));
  s.itemMods.ironsword.upgrade = 3;
  s.itemMods.thimbleMaul.upgrade = 3;
  s.itemMods.captainJacket.upgrade = 2;
  assert.equal(G.effectiveItem(s, 'ironsword').base, baseline.ironsword.base + 3);
  assert.equal(G.effectiveItem(s, 'thimbleMaul').base, baseline.thimbleMaul.base + 6, 'two-handed upgrades keep their doubled step');
  assert.equal(G.effectiveItem(s, 'captainJacket').armor, baseline.captainJacket.armor + 2);
  assert.match(G.effectiveItem(s, 'ironsword').name, /\+3 · Real T26$/);
  // The upgrade preview goes through the same effectiveItem path, so its before and after include the tempering.
  s.itemMods.ironsword.upgrade = 1;
  const up = G.upgradePreview(s, 'ironsword');
  assert.equal(up.before.temper, 26);
  assert.equal(up.after.base, up.before.base + 1);
  s.itemMods.ironsword.prefix = 'keen';
  const keen = G.PREFIXES.keen.bonus;
  const withAffix = G.effectiveItem(s, 'ironsword');
  assert.equal(withAffix.base, baseline.ironsword.base + 1 + (keen.base || 0));
  assert.equal(withAffix.temper, 26);
  // A tempering preview taken after upgrades keeps them.
  const s2 = hero({ bag: ['ironsword'], level: 5 });
  s2.itemMods = { ironsword: { upgrade: 2 } };
  const pre = G.temperPreview(s2, 'ironsword', 27);
  assert.equal(pre.before.base, 30 + 2);
  assert.equal(pre.after.base, Growth.postStoryWeaponBase(27) + 2);
  assert.match(pre.after.name, /\+2 · Real T27/);
});

test('entry price for the first temper, step price for every tier gained after it', () => {
  assert.equal(Growth.temperEntryPrice('weapon', 26), 61_600, 'continuous with the approved T25 = 60,000');
  assert.equal(Growth.temperEntryPrice('weapon', 26), Growth.postStoryGearPrice(51, 'entry'));
  assert.equal(Growth.temperEntryPrice('weapon', 27), 1100 * incomePerWin(55));
  const s = hero({ realness: 1, level: 30 });
  const before = s.coins;
  const p = G.temperPreview(s, 'ironsword', 26);
  assert.equal(p.firstTemper, true);
  assert.equal(p.cost.coins, 61_600);
  assert.deepEqual(p.cost.materials, {}, 'tempering costs coins only');
  assert.ok(G.temperItem(s, 'ironsword', 26));
  assert.equal(before - s.coins, 61_600);
  const step27 = Growth.TEMPER_STEP_K * incomePerWin(55);
  assert.equal(Growth.temperStepPrice('weapon', 27), step27);
  const next = G.temperPreview(s, 'ironsword', 27);
  assert.equal(next.firstTemper, false);
  assert.equal(next.cost.coins, step27, 'the second tier costs the step price, not the entry price');
  assert.ok(step27 < Growth.temperEntryPrice('weapon', 27) / 5);
  // Steps are summed tier by tier, so one big raise equals the same raises one at a time, and entry never undercuts it.
  const sum = (slot, from, to) => { let c = 0; for (let t = from + 1; t <= to; t++) c += Growth.temperStepPrice(slot, t); return c; };
  for (const slot of TEMPER_SLOT_LIST) {
    assert.equal(Growth.temperCost(slot, 26, 33), sum(slot, 26, 33));
    assert.ok(Growth.temperCost(slot, 26, 33) < Growth.temperEntryPrice(slot, 33), 'upkeep is cheaper than a fresh entry');
    assert.ok(Growth.temperEntryPrice(slot, 26) + Growth.temperCost(slot, 26, 33) > Growth.temperEntryPrice(slot, 33), 'two actions never beat one');
  }
  const coinsMid = s.coins;
  assert.ok(G.temperItem(s, 'ironsword', 33));
  assert.equal(coinsMid - s.coins, sum('weapon', 26, 33), 'the raise from 26 to 33 costs seven steps');
});

test('armor and second-hand entry prices keep the campaign ratio to the chapter-best weapon', () => {
  const best = 60_000; // tier 25 weapon
  const tier10 = { offhand: 'stitchedWard', head: 'paradeBonnet', body: 'captainJacket', hands: 'woollyWristguards', feet: 'stargazerShoes' };
  for (const [slot, id] of Object.entries(tier10)) {
    assert.equal(G.ITEMS[id].tier, 10);
    const campaignRatio = G.ITEMS[id].price / best;
    assert.ok(Math.abs(Growth.TEMPER_PRICE_RATIO[slot] - campaignRatio) < 1e-9, `${slot} ratio`);
    assert.equal(Growth.temperEntryPrice(slot, 26), Math.round(61_600 * campaignRatio));
  }
  assert.equal(Growth.temperEntryPrice('body', 26), 15_400, 'body is 25% of the weapon');
  assert.equal(Growth.temperEntryPrice('weapon', 26), 61_600);
});

test('keeping a full kit on-level costs about half of on-level income at Realness 1', () => {
  assert.equal(G.xpNeeded(1, 1) / G.postStoryRewards(51).xp, 105, 'wins per level at R1');
  const shares = [];
  for (let tier = 26; tier <= 37; tier++) {
    const E = Growth.temperReferenceLevel(tier);
    // The step to tier + 1 is priced at E + 4; income is the coins won over the four levels before it.
    let income = 0;
    for (let e = E; e < E + 4; e++) income += 105 * incomePerWin(e);
    const kit = TEMPER_SLOT_LIST.reduce((a, slot) => a + Growth.temperStepPrice(slot, tier + 1), 0);
    shares.push(kit / income);
  }
  for (const share of shares) assert.ok(share > 0.45 && share < 0.55, `kit upkeep share ${share.toFixed(3)}`);
  const mean = shares.reduce((a, b) => a + b, 0) / shares.length;
  assert.ok(Math.abs(mean - 0.5) < 0.03, `mean share ${mean.toFixed(3)}`);
  // The share only falls as Realness rises (wins per level grow from 105 to 150).
  const kitAt = tier => TEMPER_SLOT_LIST.reduce((a, slot) => a + Growth.temperStepPrice(slot, tier), 0);
  const shareAt = (tier, r) => kitAt(tier + 1) / (G.xpNeeded(1, r) / G.postStoryRewards(50 * r + 1).xp * 4 * incomePerWin(Growth.temperReferenceLevel(tier) + 2));
  assert.ok(shareAt(80, 5) < shareAt(30, 1));
  // The 2,000-win best-gear target stays reserved for each layer's best weapon (G4): entry here is the 1,100-win price.
  assert.equal(Growth.temperEntryPrice('weapon', 30), 1100 * incomePerWin(67));
});

test('buy, temper and sell never makes a profit', () => {
  for (const id of ['ironsword', 'thimbleMaul', 'moonThreadNeedle', 'captainJacket', 'stitchedWard', 'goldenNeedleCase', 'paradeBonnet']) {
    const item = G.ITEMS[id];
    const s = hero({ realness: 1, level: 1, bag: [], coins: 10_000_000 });
    s.bag = s.bag.filter(b => b !== 'sword' && b !== 'shield');
    s.gear = Object.fromEntries(Object.keys(s.gear).map(k => [k, null]));
    s.gear.weapon = 'sword';
    s.bag.push('sword');
    const start = s.coins;
    s.chapter = 5;
    s.story.completed = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale'];
    assert.ok(G.buy(s, id), `buys ${id} (${G.buyPreview(s, id).reason})`);
    const untemperedSale = G.sellPreview(s, id).price;
    assert.ok(G.temperItem(s, id), `tempers ${id}`);
    const tempered = G.sellPreview(s, id);
    assert.equal(tempered.allowed, true);
    assert.equal(tempered.price, untemperedSale, 'resale ignores temper');
    assert.ok(tempered.price <= 38 + 3, 'resale stays a small salvage value');
    const sold = G.sell(s, id);
    assert.ok(sold);
    assert.ok(s.coins < start, `${id}: buy, temper, sell loses coins`);
    assert.ok(start - s.coins >= item.price + G.temperCost(item.slot, 0, 26) - tempered.price);
    assert.equal(s.itemMods[id], undefined, 'selling removes the tempering');
    assert.equal(s.bag.includes(id), false);
  }
  // Rebuying gives a plain item: the temper is gone, so a sale loop cannot launder it.
  const s = hero({ bag: [], coins: 10_000_000 });
  s.bag = [...s.bag, 'cap'];
  s.gear.head = null;
  G.temperItem(s, 'cap');
  assert.equal(G.effectiveItem(s, 'cap').temper, 26);
  assert.ok(G.sell(s, 'cap'));
  assert.ok(G.buy(s, 'cap'));
  assert.equal(G.effectiveItem(s, 'cap').temper, undefined);
  // No catalog item resells for more than it costs to buy, tempered or not, and tempering adds nothing to resale.
  for (const item of Object.values(G.ITEMS)) {
    if (!Growth.isTemperSlot(item.slot) || item.keepsake) continue;
    const t = hero({ bag: [item.id] });
    t.gear = Object.fromEntries(Object.keys(t.gear).map(k => [k, null]));
    t.gear.weapon = 'sword';
    const plain = G.sellPreview(t, item.id).price;
    t.itemMods = { [item.id]: { temper: 30 } };
    assert.equal(G.sellPreview(t, item.id).price, plain, item.id);
    if (item.price) assert.ok(plain <= item.price || item.price < 5, `${item.id} resale below price`);
  }
});

test('temper survives a loadSave round trip with no version bump and no charges', () => {
  const s = hero({ realness: 1, level: 30 });
  for (const id of Object.values(KIT_IDS)) assert.ok(G.temperItem(s, id, 30), id);
  s.itemMods.ironsword.upgrade = 2;
  s.itemMods.ironsword.prefix = 'keen';
  const coins = s.coins;
  const loaded = roundTrip(s);
  assert.equal(loaded.coins, coins);
  assert.equal(loaded.version, G.fresh().version, 'no save-format bump');
  for (const id of Object.values(KIT_IDS)) {
    assert.equal(loaded.itemMods[id].temper, 30, id);
    assert.deepEqual(G.effectiveItem(loaded, id), G.effectiveItem(s, id), `${id} is identical after the round trip`);
  }
  assert.equal(loaded.itemMods.ironsword.upgrade, 2);
  assert.equal(loaded.itemMods.ironsword.prefix, 'keen');
  assert.deepEqual(G.totals(loaded), G.totals(s));
  const untempered = roundTrip(hero());
  assert.equal(Object.hasOwn(untempered.itemMods.ironsword || {}, 'temper'), false);
});

test('loading normalizes temper: integer of 26 or more, never lowered, dropped on non-temperable items', () => {
  const s = hero({ realness: 1, level: 1, bag: ['ironsword', 'captainJacket', 'penny', 'seal', 'cap', 'boots', 'plushMaul', 'rod'] });
  s.itemMods = {
    ironsword: { temper: 40 },      // above this character's maximum of 26: kept, never lowered
    captainJacket: { temper: 25 },  // below the first post-story tier: removed
    penny: { temper: 30 },          // accessory: removed
    seal: { temper: 30 },           // relic: removed
    cap: { temper: 26.5 },          // not an integer: removed
    boots: { temper: '30' },        // not a number: removed
    plushMaul: { temper: 1e30 },    // not a safe integer: removed
    rod: { temper: null },
    ghostItem: { temper: 30 }       // not in the bag: removed with the rest
  };
  const loaded = roundTrip(s);
  assert.equal(loaded.itemMods.ironsword.temper, 40);
  assert.equal(G.effectiveItem(loaded, 'ironsword').temper, 40);
  for (const id of ['captainJacket', 'penny', 'seal', 'cap', 'boots', 'plushMaul']) assert.equal(Object.hasOwn(loaded.itemMods[id] || {}, 'temper'), false, id);
  assert.equal(Object.hasOwn(loaded.itemMods.rod || {}, 'temper'), false);
  assert.equal(loaded.itemMods.ghostItem, undefined);
  assert.equal(G.temperMaxTier(loaded), 26, 'the character maximum is unchanged');
  // An above-maximum temper is also kept by a second round trip and is shown at its stored tier.
  assert.equal(roundTrip(loaded).itemMods.ironsword.temper, 40);
  assert.equal(G.temperPreview(loaded, 'ironsword').allowed, false);
});

test('saves from before tempering load with no temper regardless of fresh() defaults', () => {
  const s = hero({ realness: 1, level: 10 });
  s.itemMods = { ironsword: { upgrade: 1 } };
  const raw = JSON.parse(JSON.stringify(s));
  delete raw.realness; // loadSave builds {...fresh(), ...s}: absent fields come from fresh(), never from temper rules
  const loaded = G.loadSave(JSON.stringify(raw));
  assert.ok(loaded);
  assert.equal(loaded.realness, 0);
  assert.equal(Object.hasOwn(loaded.itemMods.ironsword, 'temper'), false);
  assert.equal(loaded.itemMods.ironsword.upgrade, 1);
  assert.equal(G.effectiveItem(loaded, 'ironsword').temper, undefined);
  assert.equal(G.effectiveItem(loaded, 'ironsword').base, G.ITEMS.ironsword.base + 1);
});

test('the build inspector inputs pick up tempering through effectiveItem', () => {
  const s = hero({ realness: 1, level: 1 });
  s.gear = { ...s.gear, ...KIT_IDS };
  s.gear.offhand = KIT_IDS.offhand;
  const before = G.totals(s), dmgBefore = G.actionProfile(s, 'attack', 'rats').raw;
  for (const id of Object.values(KIT_IDS)) assert.ok(G.temperItem(s, id), id);
  const after = G.totals(s), dmgAfter = G.actionProfile(s, 'attack', 'rats').raw;
  const sumOf = key => Object.values(KIT_IDS).reduce((a, id) => a + (G.effectiveItem(s, id)[key] || 0), 0);
  assert.equal(after.armor - before.armor, sumOf('armor') - Object.values(KIT_IDS).reduce((a, id) => a + (G.ITEMS[id].armor || 0), 0));
  assert.ok(after.ward > before.ward);
  assert.ok(after.mig > before.mig);
  assert.ok(dmgAfter > dmgBefore);
  // Gear armor at E51 lands on the reference total, plus the few points where T10 gloves and boots out-armor it.
  assert.ok(sumOf('armor') >= 193 && sumOf('armor') <= 193 + 8, `gear armor ${sumOf('armor')}`);
  // The combat profile reads the tempered weapon base.
  const w = G.effectiveItem(s, 'ironsword');
  assert.equal(w.base, 76.5);
});

test('engine exports the tempering functions and journals the action', () => {
  for (const name of ['temperPreview', 'temperItem', 'temperMaxTier', 'temperCost', 'temperEntryPrice', 'temperStepPrice', 'temperFields', 'temperReferenceLevel', 'isTemperSlot', 'TEMPER_STEP_K', 'TEMPER_MIN_REALNESS']) {
    assert.ok(G[name] !== undefined, `${name} exported`);
  }
  const s = hero();
  const journalLength = (s.journal || []).length;
  assert.ok(G.temperItem(s, 'ironsword'));
  assert.ok((s.journal || []).length > journalLength, 'a Real journal entry is written');
});

test('workbench shows the Temper control with cost and reason at Realness 1 and hides it at Realness 0', async () => {
  const r0 = hero({ realness: 0, level: 50, coins: 500 });
  const ui0 = (await bootWithSave(r0)).ui;
  await ui0.act('nav:bag');
  await ui0.act('bag-tab:workbench');
  assert.doesNotMatch(ui0.getApp().innerHTML, /data-action="temper:/);
  assert.doesNotMatch(ui0.getApp().innerHTML, /Temper to Real/);

  const poor = hero({ realness: 1, level: 1, coins: 500 });
  const { ui: uiPoor } = await bootWithSave(poor);
  await uiPoor.act('nav:bag');
  await uiPoor.act('bag-tab:workbench');
  const poorHtml = uiPoor.getApp().innerHTML;
  assert.match(poorHtml, /data-action="temper:ironsword"[^>]*disabled/, 'unaffordable temper is disabled');
  assert.match(poorHtml, /Temper to Real T26 · 61600 coins/, 'the button label states tier and cost');
  assert.match(poorHtml, /You cannot afford this tempering\./, 'the disabled reason is visible text');
  assert.doesNotMatch(poorHtml, /data-action="temper:(penny|seal|ribbonBrooch)/, 'accessories and relics are not offered');

  const rich = hero({ realness: 1, level: 30, coins: 2_000_000 });
  const { ui } = await bootWithSave(rich);
  await ui.act('nav:bag');
  await ui.act('bag-tab:workbench');
  assert.match(ui.getApp().innerHTML, /data-action="temper:ironsword"(?![^>]*disabled)/);
  assert.match(ui.getApp().innerHTML, /data-action="temper:ironsword:26"/, 'a one-tier option is offered when the maximum is higher');
  await ui.act('temper:ironsword:26');
  const modal = ui.getModal().innerHTML;
  assert.match(modal, /Cost to confirm: 61600 coins/);
  assert.match(modal, /BEFORE/);
  assert.match(modal, /AFTER/);
  assert.match(modal, /76\.5 base/);
  assert.match(modal, /Real T26/);
  const confirm = modal.match(/data-action="(temper-confirm:[^"]+)"/)?.[1];
  assert.ok(confirm, 'preview offers a confirmation');
  const coins = ui.getState().coins;
  await ui.act(confirm);
  assert.equal(ui.getState().itemMods.ironsword.temper, 26);
  assert.equal(ui.getState().coins, coins - 61_600);
  assert.match(ui.getApp().innerHTML, /Real T26/, 'the tempered tier shows in the item name');
  await ui.act(confirm);
  assert.equal(ui.getState().coins, coins - 61_600, 'a stale confirmation spends nothing');
  assert.equal(ui.getState().itemMods.ironsword.temper, 26);
});
