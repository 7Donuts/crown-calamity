import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, buyPreview, sellItem, slotChoices } from '../dist/gear.js';
import { VENDORS, baseVendorItem, classifyVendor, vendorStock } from '../dist/vendors.js';

function state(overrides = {}) {
  return {
    level: 10, coins: 500, bag: [], gear: { weapon: 'rod' }, itemMods: {},
    ...overrides
  };
}

test('every priced item belongs to exactly one vendor, with offhands classified by function', () => {
  assert.deepEqual(Object.keys(VENDORS), ['weaponsmith', 'armorer', 'curio']);
  for (const [id, item] of Object.entries(ITEMS)) {
    if (item.price) assert.ok(VENDORS[classifyVendor(id)], `${id} has a vendor`);
    assert.ok(classifyVendor(item) === null || VENDORS[classifyVendor(item)], `${id} has at most one vendor`);
  }
  assert.equal(classifyVendor('sword'), 'weaponsmith');
  assert.equal(classifyVendor('gateShield'), 'armorer');
  assert.equal(classifyVendor('focus'), 'curio');
  assert.equal(classifyVendor('charm'), 'curio');
  assert.equal(classifyVendor('seal'), 'curio');
});

test('buy stock hides owned items and provides base item plus canonical affordability previews', () => {
  const s = state({ bag: ['rod', 'cap'], coins: 0 });
  const armorer = vendorStock(s, 'armorer', 'buy');
  assert.ok(!armorer.some(row => row.id === 'cap'));
  assert.ok(armorer.some(row => row.id === 'boots'));
  const row = vendorStock(s, 'weaponsmith', 'buy').find(x => x.id === 'sword');
  assert.equal(row.item, baseVendorItem('sword'));
  assert.equal(row.item, ITEMS.sword);
  assert.equal(row.preview.allowed, buyPreview(s, 'sword').allowed);
  assert.equal(vendorStock(s, 'curio', 'buy').find(x => x.id === 'focus').preview.reason, 'You cannot afford this item.');
});

test('sell stock contains only owned unequipped gear accepted by that vendor and shows lock state', () => {
  const s = state({ bag: ['rod', 'sword', 'cap', 'focus', 'charm'], gear: { weapon: 'rod', accessory: 'charm' } });
  const weapons = vendorStock(s, 'weaponsmith', 'sell');
  assert.deepEqual(weapons.map(x => x.id), ['sword']);
  assert.deepEqual(vendorStock(s, 'armorer', 'sell').map(x => x.id), ['cap']);
  assert.deepEqual(vendorStock(s, 'curio', 'sell').map(x => x.id), ['focus']);
  const locked = vendorStock({ ...s, fight: { enemy: 'rats' } }, 'curio', 'sell')[0];
  assert.equal(locked.preview.allowed, false);
  assert.match(locked.preview.reason, /fight or delve/);
  assert.deepEqual(vendorStock(s, 'weaponsmith', 'sell').filter(x => x.id === 'rod'), []);
});

test('a sold item returns to clean base buy stock and accessories can occupy either slot', () => {
  const s = state({ bag: ['penny'], gear: { weapon: 'rod' }, itemMods: { penny: { upgrade: 3, prefix: 'warded' } } });
  const sale = sellItem(s, 'penny');
  assert.ok(sale);
  const row = vendorStock(s, 'curio', 'buy').find(x => x.id === 'penny');
  assert.equal(row.item, ITEMS.penny);
  assert.equal(row.preview.item.name, ITEMS.penny.name);
  assert.deepEqual(slotChoices({ ...s, bag: ['penny'], gear: { weapon: 'rod', accessory: 'lantern', accessory2: null } }, 'penny'), ['accessory', 'accessory2']);
});

test('combat and delve lock purchases through shared gear previews', () => {
  for (const lock of [{ fight: {} }, { delve: {} }]) {
    const row = vendorStock({ ...state(), ...lock }, 'weaponsmith', 'buy').find(x => x.id === 'sword');
    assert.equal(row.preview.allowed, false);
    assert.match(row.preview.reason, /fight or delve/);
  }
});

test('vendor rows include the full catalog and describe tiers without level requirements',()=>{
  const s=state({level:1,coins:1_000_000});
  const rows=Object.keys(VENDORS).flatMap(vendor=>vendorStock(s,vendor,'buy'));
  assert.equal(rows.length,100);
  const high=rows.find(row=>row.id==='stuffingSatchel');
  assert.equal(high.preview.allowed,true);
  assert.equal(high.preview.levelRequired,null);
  assert.equal(high.preview.tierLabel,`Tier ${ITEMS.stuffingSatchel.tier}`);
});
