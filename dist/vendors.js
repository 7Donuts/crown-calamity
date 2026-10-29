// Vendor ownership is presentation data; purchase and sale rules remain in gear.js.
import { ITEMS, buyPreview, sellPreview } from './gear.js';

export const VENDORS = Object.freeze({
  weaponsmith: Object.freeze({ id: 'weaponsmith', name: 'Pins & Needles', kind: 'Weaponsmith', description: 'A toy armory run by Tuffet, a pincushion hedgehog. “Pointy end goes toward the problem.” Weapons and fighting tools.' }),
  armorer: Object.freeze({ id: 'armorer', name: 'Second Stitch Outfitters', kind: 'Armorer', description: 'Raincoats and reinforcements. “Waterproofing is not a fashion choice. It’s a lifestyle.” Armor and shields.' }),
  curio: Object.freeze({ id: 'curio', name: 'The Odds & Ends Drawer', kind: 'Curio dealer', description: 'Kept by an old bear who has seen things. Magical focuses, accessories, and relics.' })
});

const ARMOR_SLOTS = new Set(['head', 'body', 'hands', 'feet']);

export function classifyVendor(itemOrId) {
  const item = typeof itemOrId === 'string' ? ITEMS[itemOrId] : itemOrId;
  if (!item) return null;
  if (item.slot === 'weapon') return 'weaponsmith';
  if (ARMOR_SLOTS.has(item.slot) || (item.slot === 'offhand' && (item.armor || 0) > 0)) return 'armorer';
  if (item.slot === 'offhand' || item.slot === 'accessory' || item.slot === 'relic') return 'curio';
  return null;
}

export function baseVendorItem(id) {
  return ITEMS[id] || null;
}

// Rows retain unavailable previews so the UI can explain price, level, or lock reasons.
export function vendorStock(state, vendorId, mode = 'buy') {
  if (!VENDORS[vendorId] || !['buy', 'sell'].includes(mode)) return [];
  const ids = mode === 'buy'
    ? Object.keys(ITEMS).filter(id => ITEMS[id].price && !(state?.bag || []).includes(id))
    : [...new Set(state?.bag || [])].filter(id => {
      const item = ITEMS[id];
      return item && classifyVendor(item) === vendorId && !Object.values(state?.gear || {}).includes(id);
    });
  return ids.filter(id => classifyVendor(ITEMS[id]) === vendorId).map(id => ({
    id,
    item: ITEMS[id],
    preview: mode === 'buy' ? buyPreview(state, id) : sellPreview(state, id)
  }));
}
