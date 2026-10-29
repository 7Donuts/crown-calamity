import * as G from './engine.js';
import {VENDORS,vendorStock,baseVendorItem,classifyVendor} from './vendors.js';
import {menuIcon} from './menu-icons.js';
import {renderItemArt} from './item-art.js';
export {VENDORS,classifyVendor};

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const vendorIcons={weaponsmith:'weapons',armorer:'armor',curio:'curios'};
const slotLabel=slot=>slot==='accessory2'?'Second accessory':G.SLOTS[slot]||slot;
const button=(action,label,disabled=false,cls='subtle')=>`<button data-action="${esc(action)}" class="${cls}" ${disabled?'disabled':''}>${label}</button>`;
const itemFields=[['base','Weapon base'],['armor','Armor'],['ward','Ward'],['spellBase','Spell base']];
function itemValues(item){
  if(!item)return [];
  return [...itemFields.filter(([key])=>item[key]).map(([key,label])=>`${item[key]} ${label.toLowerCase()}`),...Object.entries(item.stats||{}).map(([key,n])=>`+${n} ${G.ATTRS[key]?.[0]||key}`)];
}

export function renderMarket(state,{vendorId='weaponsmith',mode='buy'}={}){
  const vendor=VENDORS[vendorId]||VENDORS.weaponsmith,selectedMode=mode==='sell'?'sell':'buy';
  const stock=vendorStock(state,vendor.id,selectedMode),locked=!!state.fight||!!state.delve;
  return `<div class="market-page"><nav class="tabs vendor-tabs" aria-label="Choose a vendor">${Object.values(VENDORS).map(v=>`<button data-action="vendor:${v.id}" class="${vendor.id===v.id?'active':''}" aria-pressed="${vendor.id===v.id}">${menuIcon(vendorIcons[v.id])}<span class="vendor-tab-name">${esc(v.name)}<small>${esc(v.kind)}</small></span></button>`).join('')}</nav><section class="vendor-header"><div><h2>${menuIcon(vendorIcons[vendor.id])}${esc(vendor.name)} <small class="vendor-kind">(${esc(vendor.kind)})</small></h2><p>${esc(vendor.description)}</p></div><div class="tabs shop-mode-tabs" aria-label="Buy or sell">${['buy','sell'].map(key=>`<button data-action="shop-tab:${key}" class="${key===selectedMode?'active':''}" aria-pressed="${key===selectedMode}">${menuIcon(key)}${key==='buy'?'Buy':'Sell'}</button>`).join('')}</div></section><div class="inventory-summary"><span>${stock.length} ${selectedMode==='buy'?'items for sale · owned items hidden':'unequipped items to sell'}</span><span>${selectedMode==='buy'?'Compare before buying':'Equipped gear stays with you'}</span></div>${locked?'<p class="ability-reason">Purchases and sales are locked until the encounter or expedition ends. Comparisons remain available.</p>':''}${stock.length?`<div class="vendor-stock">${stock.map(({id,item,preview})=>{
    const shown=selectedMode==='sell'?G.resolveItem(state,id):item;
    return `<article class="vendor-card" data-stock-id="${esc(id)}"><div class="vendor-card-heading"><span class="item-symbol">${renderItemArt(id,{size:'medium'})}</span><div><h3>${esc(shown.name)}</h3><small>${esc(slotLabel(shown.slot))} · Level ${shown.level}${shown.twoHanded?' · Two-handed':''}</small></div></div><div class="item-stats">${itemValues(shown).map(text=>`<span>${esc(text)}</span>`).join('')||'<span>Signature equipment trait</span>'}</div><details class="item-lore"><summary>Details</summary><p>${esc(shown.desc)}</p></details><div class="vendor-price">${selectedMode==='sell'?'+':''}${preview.price} coins</div>${preview.reason?`<p class="shop-reason">${esc(preview.reason)}</p>`:''}<div class="vendor-actions">${button(selectedMode==='buy'?'market-compare:'+id:'compare:'+id,menuIcon('compare')+'Compare')}${button((selectedMode==='buy'?'buy-preview:':'sell-preview:')+id,menuIcon(selectedMode)+(selectedMode==='buy'?'Buy':'Sell'),!preview.allowed||locked,selectedMode==='buy'?'primary':'subtle')}</div></article>`;
  }).join('')}</div>`:`<section class="panel empty-state"><h3>${selectedMode==='buy'?'No new stock in this stall.':'Nothing spare to sell here.'}</h3><p>${selectedMode==='buy'?'You own this vendor’s stocked items. Browse another vendor or return to your satchel.':'Only unequipped items accepted by this vendor appear here. Equipped items can be reviewed on the Gear page.'}</p>${button(selectedMode==='buy'?'nav:bag':'open-gear',menuIcon(selectedMode==='buy'?'materials':'gear')+(selectedMode==='buy'?'Open satchel':'Review equipped slots'))}</section>`}</div>`;
}

const percentage=n=>(n*100).toFixed(2)+'%';
const totalFields=[['hp','Max Stuffing (Health)'],['mp','Max Sparkle (Mana)'],['sp','Max Bounce (Stamina)'],['armor','Armor'],['ward','Ward'],['heavyPower','Heavy power'],['precisionPower','Precision power'],['spellPower','Spell power'],['physicalAcc','Physical accuracy'],['spellAcc','Spell accuracy'],['evasion','Evasion'],['critChance','Critical chance'],['equipmentDropChance','Equipment drops']];
const format=(key,n)=>key==='critChance'||key==='equipmentDropChance'?percentage(n):String(n);

// Inspect a hypothetical purchase; never equips, spends coins, or mutates the save.
export function stockComparison(state,id,targetSlot=null){
  const item=baseVendorItem(id);if(!item||!item.price)return null;
  const slots=item.slot==='accessory'?['accessory','accessory2']:[item.slot];
  const selected=slots.includes(targetSlot)?targetSlot:slots.find(slot=>!state.gear[slot])||slots[0];
  const oldId=state.gear[selected],old=oldId?G.resolveItem(state,oldId):null;
  const blockedOffhand=selected==='offhand'&&G.ITEMS[state.gear.weapon]?.twoHanded;
  const trial={...state,bag:[...new Set([...state.bag,id])],gear:{...state.gear,[selected]:id},itemMods:{...state.itemMods}};
  delete trial.itemMods[id];
  for(const [slot,ownedId] of Object.entries(trial.gear))if(slot!==selected&&ownedId===id)trial.gear[slot]=null;
  if(item.twoHanded)trial.gear.offhand=null;
  const before=G.totals(state),after=blockedOffhand?null:G.totals(trial);
  const changes=after?totalFields.filter(([key])=>before[key]!==after[key]).map(([key,label])=>({key,label,before:before[key],after:after[key]})):[];
  const rows=[...itemFields.map(([key,label])=>({label,before:old?.[key]||0,after:item[key]||0})),...Object.entries(G.ATTRS).map(([key,[label]])=>({label,before:old?.stats?.[key]||0,after:item.stats?.[key]||0}))].filter(row=>row.before||row.after);
  const scaling=i=>({heavy:'Might',precision:'Finesse',spell:'Intellect'})[i?.channel]||'—';
  if(item.slot==='weapon')rows.unshift({label:'Attack scaling',before:scaling(old),after:scaling(item)});
  const target=G.ENEMIES.find(e=>e.id===(state.fight?.enemy||state.settings?.inspectTarget))||G.ENEMIES[0];
  const attack=after?{target:target.name,before:G.actionProfile(state,'attack',target.id).average,after:G.actionProfile(trial,'attack',target.id).average}:null;
  return {item,old,selected,slots,blockedOffhand,changes,rows,attack,preview:G.buyPreview(state,id),removesOffhand:!!(item.twoHanded&&state.gear.offhand)};
}

export function renderStockComparison(state,id,targetSlot=null){
  const data=stockComparison(state,id,targetSlot);if(!data)return null;
  const {item,old,selected,slots,blockedOffhand,changes,rows,attack,preview,removesOffhand}=data;
  const currentName=blockedOffhand?'Reserved by your two-handed weapon':old?.name||'Empty slot';
  return {title:item.name,body:`${slots.length>1?`<div class="comparison-slots" aria-label="Compare accessory slot">${slots.map(slot=>`<button data-action="market-compare:${id}:${slot}" aria-pressed="${slot===selected}" class="${slot===selected?'selected':''}">${menuIcon('compare')}${esc(slotLabel(slot))}</button>`).join('')}</div>`:''}<div class="vendor-compare"><div><span class="eyebrow">YOUR GEAR · ${esc(slotLabel(selected))}</span>${old?renderItemArt(old.id,{size:'large'}):''}<h3>${esc(currentName)}</h3>${old?.upgrade?`<p>Upgrade +${old.upgrade}</p>`:''}</div><div><span class="eyebrow">VENDOR ITEM · LEVEL ${item.level}</span>${renderItemArt(item.id,{size:'large'})}<h3>${esc(item.name)}</h3><p>${preview.price} coins</p></div></div><table class="comparison-table"><caption>Item values · your gear / vendor stock</caption><thead><tr><th scope="col">Property</th><th scope="col">Your gear</th><th scope="col">Vendor item</th></tr></thead><tbody>${rows.map(row=>`<tr><th scope="row">${esc(row.label)}</th><td>${esc(row.before)}</td><td>${esc(row.after)}</td></tr>`).join('')}</tbody></table><p>${esc(item.desc)}</p>${old?.desc?`<details class="comparison-traits"><summary>Current item traits</summary><p>${esc(old.desc)}</p></details>`:''}${blockedOffhand?'<p class="ability-reason">A two-handed weapon reserves this slot. Equip a one-handed weapon before using an offhand; no build totals are projected for an illegal combination.</p>':''}${removesOffhand?'<p class="ability-reason">This two-handed weapon removes your offhand. The build comparison includes that loss.</p>':''}${item.channel?`<p class="modal-help">Weapon scaling: ${esc(item.channel==='heavy'?'Might':item.channel==='precision'?'Finesse':'Intellect')}. ${item.focus?'Enables focus-dependent spells.':'Physical weapon skills need no focus.'}</p>`:''}${changes.length?`<h3>What changes for your build</h3><table class="comparison-table"><caption>Projected totals with this item · no purchase or equipment change</caption><thead><tr><th scope="col">Total</th><th scope="col">Current</th><th scope="col">With item</th></tr></thead><tbody>${changes.map(row=>`<tr><th scope="row">${esc(row.label)}</th><td>${format(row.key,row.before)}</td><td>${format(row.key,row.after)}</td></tr>`).join('')}</tbody></table>`:afterUnchanged(blockedOffhand)}${attack?`<table class="comparison-table"><caption>Expected free Attack vs ${esc(attack.target)} · same target and combat rules</caption><thead><tr><th scope="col">Action</th><th scope="col">Current</th><th scope="col">With item</th></tr></thead><tbody><tr><th scope="row">Attack damage</th><td>${attack.before.toFixed(1)}</td><td>${attack.after.toFixed(1)}</td></tr></tbody></table>`:''}${preview.reason?`<p class="ability-reason">${esc(preview.reason)}</p>`:''}<p class="modal-help">Comparison only. Buying places base gear in your satchel; it does not equip it.</p><div class="modal-actions">${button('buy-preview:'+id,menuIcon('buy')+'Review purchase · '+preview.price+' coins',!preview.allowed,'primary')}${button('close','Back to vendor')}</div>`};
}
function afterUnchanged(blocked){return blocked?'':'<p class="modal-help">No numeric build totals change. Check scaling and equipment traits before deciding.</p>';}
