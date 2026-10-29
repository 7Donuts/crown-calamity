import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import { ITEMS } from '../dist/gear.js';
import { renderMarket, renderStockComparison, stockComparison } from '../dist/market-ui.js';

const copy = value => structuredClone(value);
const noBrokenValues = html => assert.equal(/\b(?:undefined|NaN)\b/.test(html), false);

test('equal-base weapons expose their different scaling and expected attack before purchase',()=>{
  const s=G.createCharacter({race:'emberling',kit:'caster'}),before=copy(s);
  const data=stockComparison(s,'sword');
  assert.deepEqual(data.rows[0],{label:'Attack scaling',before:'Intellect',after:'Might'});
  assert.ok(data.attack.before>data.attack.after,'a caster loses free Attack output by switching equal-base rod to Might sword');
  const projected=copy(s);projected.bag.push('sword');assert.equal(G.equip(projected,'sword','weapon'),true);
  assert.equal(data.attack.after,G.actionProfile(projected,'attack','rats').average);
  assert.deepEqual(s,before);
  const rendered=renderStockComparison(s,'sword');
  assert.match(rendered.body,/Expected free Attack/);
  assert.match(rendered.body,/Intellect/);assert.match(rendered.body,/Might/);
});

test('market rendering hides owned buy stock and does not expose a gear sidebar', () => {
  const s = G.fresh();
  const before = copy(s);
  const html = renderMarket(s, { vendorId: 'weaponsmith', mode: 'buy' });
  assert.match(html, /market-page/);
  assert.match(html, /owned items hidden/);
  assert.doesNotMatch(html, /Inspector’s Rod/);
  assert.doesNotMatch(html, /Current gear|current equipment|build sidebar|side-column/i);
  assert.match(html, /data-action="market-compare:floodrod"/);
  assert.doesNotMatch(html, /data-stock-id="sword"/);
  assert.deepEqual(s, before, 'rendering is a pure inspection');
  noBrokenValues(html);
});

test('comparison shows base unmodified stock and never changes the save', () => {
  const s = G.fresh();
  s.level = 10;
  s.itemMods.sword = { upgrade: 3, prefix: 'keen', suffix: 'of_might' };
  const before = copy(s);
  const data = stockComparison(s, 'sword');
  assert.equal(data.item, ITEMS.sword);
  assert.equal(data.item.name, ITEMS.sword.name);
  assert.deepEqual(data.old, G.resolveItem(s, 'rod'));
  assert.deepEqual(s, before);
  const rendered = renderStockComparison(s, 'sword');
  assert.equal(rendered.title, ITEMS.sword.name);
  assert.match(rendered.body, /Canal-Iron Sword/);
  assert.doesNotMatch(rendered.body, /Keen Canal-Iron|of Might \+3/);
  noBrokenValues(rendered.body);
});

test('accessory comparisons can target either slot and default around an equipped accessory', () => {
  const s = G.fresh();
  s.level = 10;
  s.gear.accessory = 'lantern';
  s.bag.push('lantern');
  const defaultCompare = stockComparison(s, 'penny');
  assert.deepEqual(defaultCompare.slots, ['accessory', 'accessory2']);
  assert.equal(defaultCompare.selected, 'accessory2');
  assert.equal(defaultCompare.old, null);
  const chosenFirst = stockComparison(s, 'penny', 'accessory');
  assert.equal(chosenFirst.selected, 'accessory');
  assert.equal(chosenFirst.old.id, 'lantern');
  const modal = renderStockComparison(s, 'penny');
  assert.match(modal.body, /data-action="market-compare:penny:accessory"/);
  assert.match(modal.body, /data-action="market-compare:penny:accessory2"/);
  assert.match(modal.body, /aria-pressed="true" class="selected">.*Second accessory/s);
  noBrokenValues(modal.body);
});

test('two-handed weapon comparison includes the current offhand loss in exact engine totals', () => {
  const s = G.fresh();
  s.level = 10;
  s.bag.push('sword', 'shield', 'pike');
  s.gear.weapon = 'sword';
  s.gear.offhand = 'shield';
  const data = stockComparison(s, 'pike');
  assert.equal(data.removesOffhand, true);
  assert.equal(data.blockedOffhand, false);
  const projected = copy(s);
  projected.gear.weapon = 'pike';
  projected.gear.offhand = null;
  const before = G.totals(s), after = G.totals(projected);
  for (const change of data.changes) {
    assert.equal(change.before, before[change.key]);
    assert.equal(change.after, after[change.key]);
  }
  assert.ok(data.changes.some(change => change.key === 'armor' && change.after < change.before));
  const modal = renderStockComparison(s, 'pike');
  assert.match(modal.body, /removes your offhand/);
  assert.match(modal.body, /Projected totals with this item/);
  noBrokenValues(modal.body);
});

test('offhand comparison while wielding a pike is blocked without illegal total projections', () => {
  const s = G.fresh();
  s.level = 10;
  s.gear.weapon = 'pike';
  s.bag.push('pike');
  const data = stockComparison(s, 'focus');
  assert.equal(data.blockedOffhand, true);
  assert.deepEqual(data.changes, []);
  const modal = renderStockComparison(s, 'focus');
  assert.match(modal.body, /reserves this slot/);
  assert.doesNotMatch(modal.body, /Projected totals with this item/);
  noBrokenValues(modal.body);
});

test('high-level stock remains comparable when the shared buy rule blocks purchase', () => {
  const s = G.fresh();
  s.level = 1;
  const data = stockComparison(s, 'ironsword');
  assert.ok(data);
  assert.equal(data.preview.allowed, false);
  assert.match(data.preview.reason, /Requires level 6/);
  assert.ok(data.changes.length > 0, 'the item still has an inspectable build projection');
  const modal = renderStockComparison(s, 'ironsword');
  assert.match(modal.body, /Lockwarden’s Sword/);
  assert.match(modal.body, /Requires level 6/);
  assert.match(modal.body, /Review purchase · 95 coins/);
  assert.match(modal.body, /disabled/);
  noBrokenValues(modal.body);
});
