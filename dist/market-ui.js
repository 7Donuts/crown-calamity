import * as G from './engine.js';
import {familyLabel} from './gear.js';
import {VENDORS,vendorStock,baseVendorItem,classifyVendor} from './vendors.js';
import {menuIcon} from './menu-icons.js';
import {renderItemArt} from './item-art.js';
export {VENDORS,classifyVendor};

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const vendorIcons={weaponsmith:'weapons',armorer:'armor',curio:'curios'};
const slotLabel=slot=>slot==='accessory2'?'Second accessory':slot==='relic2'?'Second relic':slot==='relic3'?'Third relic':G.SLOTS[slot]||slot;
const button=(action,label,disabled=false,cls='subtle')=>`<button data-action="${esc(action)}" class="${cls}" ${disabled?'disabled':''}>${label}</button>`;
const filterButton=(action,label,active=false)=>`<button data-action="${esc(action)}" class="${active?'active':'subtle'}" aria-pressed="${active}">${esc(label)}</button>`;
const itemFields=[['base','Weapon base'],['armor','Armor'],['ward','Ward'],['spellBase','Spell base']];
function itemValues(item){
  if(!item)return [];
  return [...itemFields.filter(([key])=>item[key]).map(([key,label])=>`${item[key]} ${label.toLowerCase()}`),...Object.entries(item.stats||{}).map(([key,n])=>`+${n} ${G.ATTRS[key]?.[0]||key}`)];
}

function chapterRows(state){
  const status=G.campaignStatus?.(state),chapters=status?.chapters||G.CHAPTERS||[];
  const current=status?.current??G.currentChapter?.(state)??1;
  const rank=value=>{if(value==null)return 1;const found=chapters.findIndex(ch=>String(ch.id??ch.number)===String(value)||String(ch.name).toLowerCase()===String(value).toLowerCase());return found>=0?found+1:Number(value)||1;};
  return {chapters,current,rank};
}
const chapterKeyFor=chapter=>chapter.id??chapter.number;
function isFutureCollection(item,state){if(item.chapter==null&&!item.chapterRequired)return false;const {rank,current}=chapterRows(state),required=item.chapterRequired??item.chapter;return rank(required)>rank(current);}
function statsVector(item){const out={},ignored=new Set(['tier','gearTier','level','price','chapter','slot']);for(const [key,value] of Object.entries(item||{}))if(!ignored.has(key)&&typeof value==='number'&&Number.isFinite(value))out[key]=value;for(const [key,value] of Object.entries(item?.stats||{}))if(typeof value==='number'&&Number.isFinite(value))out['stats.'+key]=value;return out;}
export function strictlyDominatesWeapon(state,better,worse){
  const a=G.resolveItem(state,better),b=G.resolveItem(state,worse);if(!a||!b||a.slot!=='weapon'||b.slot!=='weapon')return false;
  if(a.channel!==b.channel||!!a.twoHanded!==!!b.twoHanded||!!a.focus!==!!b.focus)return false;
  if(Object.keys(a).some(key=>/effect|passive|trait/i.test(key)&&a[key])||Object.keys(b).some(key=>/effect|passive|trait/i.test(key)&&b[key]))return false;
  const av=statsVector(a),bv=statsVector(b),keys=new Set([...Object.keys(av),...Object.keys(bv)]);let strict=false;
  for(const key of keys){const x=av[key]||0,y=bv[key]||0;if(x<y)return false;if(x>y)strict=true;}
  return strict;
}
function shopFilters(state,vendor,filters,stock){
  const weapon=state.gear?.weapon?G.resolveItem(state,state.gear.weapon):null,channel=filters.weaponChannel||weapon?.channel||'heavy',weaponTier=weapon?.tier||weapon?.level||1;
  const chapterData=chapterRows(state),chapterFilter=filters.chapter??null,familyFilter=filters.family||'all';
  const familyButtons=G.WEAPON_FAMILY_IDS?[['all','All families'],...G.WEAPON_FAMILY_IDS.map(fam=>[fam,G.WEAPON_FAMILY_TRAITS[fam]?.name?.split(' ')[0]||fam])].map(([key,label])=>filterButton('shop-filter:family:'+key,label,familyFilter===key)).join(' '):'';
  const controls=vendor.id==='weaponsmith'?`<fieldset class="shop-filters"><legend>Weapon stock</legend><div class="shop-filter-row" role="group" aria-label="Weapon scaling style">${[['heavy','Might'],['spell','Magic'],['precision','Finesse'],['all','All styles']].map(([key,label])=>filterButton('shop-filter:weapons:'+key,label,(key==='all'?filters.showOtherStyles:channel===key&&!filters.showOtherStyles))).join('')}</div><div class="shop-filter-row" role="group" aria-label="Weapon family">${familyButtons}</div><div class="shop-filter-row">${filterButton('shop-filter:other','Show other styles',filters.showOtherStyles)} ${filterButton('shop-filter:tiers',filters.showLowerTiers?'Hide lower grades':'Show lower grades',filters.showLowerTiers)}</div><p>Default: ${channel==='heavy'?'Might':channel==='spell'?'Magic':'Finesse'} weapons at or above your equipped weapon’s grade (${weaponTier}). Other weapon styles and lower grades stay one tap away.</p></fieldset>`:vendor.id==='armorer'?`<fieldset class="shop-filters"><legend>Armor and shields</legend><div class="shop-filter-row">${['all','head','body','hands','feet','offhand'].map(slot=>filterButton('shop-filter:slot:'+slot,slot==='all'?'All slots':slot==='offhand'?'Shield/offhand':slot[0].toUpperCase()+slot.slice(1),filters.slot===slot)).join('')}</div><div class="shop-filter-row">${filterButton('shop-filter:collection:all','All open collections',chapterFilter===null)}${chapterData.chapters.filter(ch=>ch.unlocked).map(ch=>filterButton('shop-filter:collection:'+chapterKeyFor(ch),`Chapter ${ch.id}`,String(chapterFilter)===String(ch.id))).join('')}</div></fieldset>`:'';
  let visible=stock.filter(({item})=>!isFutureCollection(item,state));
  if(vendor.id==='weaponsmith'&&filters.mode!=='sell'){
    visible=visible.filter(({id,item})=>{
      if(filters.family&&filters.family!=='all'&&item.family!==filters.family)return false;
      if(!filters.showOtherStyles&&item.channel!==channel)return false;
      if(!filters.showLowerTiers&&(item.tier||item.level||1)<weaponTier)return false;
      const equipped=state.gear?.weapon;if(equipped&&strictlyDominatesWeapon(state,equipped,id))return false;
      return true;
    });
  }
  if(vendor.id==='armorer'&&filters.slot&&filters.slot!=='all')visible=visible.filter(({item})=>item.slot===filters.slot);
  if(vendor.id==='armorer'&&chapterFilter!==null)visible=visible.filter(({item})=>String(item.chapter??'')===String(chapterFilter));
  return {controls,visible};
}
export function renderMarket(state,{vendorId='weaponsmith',mode='buy',filters={}}={}){
  const vendor=VENDORS[vendorId]||VENDORS.weaponsmith,selectedMode=mode==='sell'?'sell':'buy';
  const stock=vendorStock(state,vendor.id,selectedMode,{showOwned:!!filters.showOwned}),locked=!!state.fight||!!state.delve;
  const {controls,visible}=shopFilters(state,vendor,{...filters,mode:selectedMode},stock);
  const future=stock.filter(({item})=>isFutureCollection(item,state));
  const chapters=chapterRows(state).chapters,groups=[...new Set(future.map(({item})=>item.chapterRequired??item.chapter))];
  const lockedCollections=groups.map(key=>{const ch=chapters.find(x=>String(x.id??x.number)===String(key)||String(x.name).toLowerCase()===String(key).toLowerCase());const count=future.filter(({item})=>String(item.chapterRequired??item.chapter)===String(key)).length;return `<li><strong>${esc(ch?.name||`Chapter ${key}`)}</strong><span>${count} collection item${count===1?'':'s'} · complete the current story goal to unlock</span></li>`;}).join('');
  const rows=visible.map(({id,item,preview})=>{
    const shown=selectedMode==='sell'?G.resolveItem(state,id):item;
    const numeric=itemValues(shown).join(' · '),special=shown.relicEffect||shown.slot==='relic'||!numeric?shown.desc:'';
    const fam=familyLabel(shown);
    const famTrait=shown.family&&G.familyTraitSummary?G.familyTraitSummary(shown.family,G.weaponMasteryRank(state,shown.family)):'';
    return `<article class="vendor-card vendor-row" data-stock-id="${esc(id)}"><span class="item-symbol">${renderItemArt(id,{size:'medium'})}</span><div class="vendor-item-copy"><h3>${esc(shown.name)}</h3><small>${esc(slotLabel(shown.slot))}${shown.tier||shown.gearTier||shown.level?` · Grade ${shown.tier||shown.gearTier||shown.level}`:''}${shown.twoHanded?' · Two-handed':''}</small>${fam?`<small class="vendor-item-family">${esc(fam)}${famTrait?` · ${esc(famTrait)}`:''}</small>`:''}<span class="vendor-item-stats">${esc(numeric||'')}</span>${special?`<span class="vendor-item-special" title="${esc(special)}">${esc(special)}</span>`:''}</div><div class="vendor-controls"><strong class="vendor-price">${selectedMode==='sell'?'+':''}${preview.price}<small>coins</small></strong><div class="vendor-actions"><button data-action="${esc(selectedMode==='buy'?'market-compare:'+id:'compare:'+id)}" class="subtle vendor-compare-action" aria-label="Compare ${esc(shown.name)}">${menuIcon('compare')}<span>Compare</span></button>${button((selectedMode==='buy'?'buy-preview:':'sell-preview:')+id,menuIcon(selectedMode)+(selectedMode==='buy'?'Buy':'Sell'),!preview.allowed||locked,selectedMode==='buy'?'primary':'subtle')}</div></div>${preview.reason?`<p class="shop-reason">${esc(preview.reason)}</p>`:''}</article>`;
  }).join('');
  const ownedControl=selectedMode==='buy'?button('shop-filter:owned',filters.showOwned?'Hide owned stock':'Show owned stock',false,'subtle'):'';
  return `<div class="market-page"><nav class="tabs vendor-tabs" aria-label="Choose a vendor">${Object.values(VENDORS).map(v=>`<button data-action="vendor:${v.id}" class="${vendor.id===v.id?'active':''}" aria-pressed="${vendor.id===v.id}">${menuIcon(vendorIcons[v.id])}<span class="vendor-tab-name">${esc(v.name)}<small>${esc(v.kind)}</small></span></button>`).join('')}</nav><section class="vendor-header"><div><h2>${menuIcon(vendorIcons[vendor.id])}${esc(vendor.name)} <small class="vendor-kind">(${esc(vendor.kind)})</small></h2><p>${esc(vendor.description)}</p></div><div class="tabs shop-mode-tabs" aria-label="Buy or sell">${['buy','sell'].map(key=>`<button data-action="shop-tab:${key}" class="${key===selectedMode?'active':''}" aria-pressed="${key===selectedMode}">${menuIcon(key)}${key==='buy'?'Buy':'Sell'}</button>`).join('')}</div></section>${controls}<div class="inventory-summary"><span>${visible.length} ${selectedMode==='buy'?'matching items for sale · owned stock hidden':'unequipped items to sell'}</span><span>${selectedMode==='buy'?'Compare before buying':'Equipped gear stays with you'} ${ownedControl}</span></div>${locked?'<p class="ability-reason">Purchases and sales are locked until the encounter or expedition ends. Comparisons remain available.</p>':''}${lockedCollections?`<details class="locked-collections"><summary>Future collections · ${future.length} items locked</summary><ul>${lockedCollections}</ul></details>`:''}${visible.length?`<div class="vendor-stock">${rows}</div>`:`<section class="panel empty-state"><h3>${selectedMode==='buy'?'No stock matches these filters.':'Nothing spare to sell here.'}</h3><p>${selectedMode==='buy'?'Try another weapon style or grade, show owned stock, or browse another collection.':'Only unequipped items accepted by this vendor appear here.'}</p>${selectedMode==='buy'?filterButton('shop-filter:other','Show other styles',filters.showOtherStyles)+filterButton('shop-filter:tiers','Show lower grades',filters.showLowerTiers)+filterButton('shop-filter:owned','Show owned stock',filters.showOwned):button('open-gear','Review equipped slots')}</section>`}</div>`;
}
const percentage=n=>(n*100).toFixed(2)+'%';
const totalFields=[['hp','Max Stuffing (Health)'],['mp','Max Sparkle (Mana)'],['sp','Max Bounce (Stamina)'],['armor','Armor'],['ward','Ward'],['heavyPower','Heavy power'],['precisionPower','Precision power'],['spellPower','Spell power'],['physicalAcc','Physical accuracy'],['spellAcc','Spell accuracy'],['evasion','Evasion'],['critChance','Critical chance'],['equipmentDropChance','Equipment drops']];
const format=(key,n)=>key==='critChance'||key==='equipmentDropChance'?percentage(n):String(n);

// Inspect a hypothetical purchase; never equips, spends coins, or mutates the save.
export function stockComparison(state,id,targetSlot=null){
  const item=baseVendorItem(id);if(!item||!item.price)return null;
  const slots=item.slot==='accessory'?['accessory','accessory2']:item.slot==='relic'?(G.relic3Unlocked?.(state)?['relic','relic2','relic3']:['relic','relic2']):[item.slot];
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
  const target=(state.fight&&G.fightEnemy(state.fight))||G.ENEMIES.find(e=>e.id===state.settings?.inspectTarget)||G.ENEMIES[0];
  const attack=after?{target:target.name,before:G.actionProfile(state,'attack',target.id).average,after:G.actionProfile(trial,'attack',target.id).average}:null;
  return {item,old,selected,slots,blockedOffhand,changes,rows,attack,preview:G.buyPreview(state,id),removesOffhand:!!(item.twoHanded&&state.gear.offhand)};
}

export function renderStockComparison(state,id,targetSlot=null){
  const data=stockComparison(state,id,targetSlot);if(!data)return null;
  const {item,old,selected,slots,blockedOffhand,changes,rows,attack,preview,removesOffhand}=data;
  const currentName=blockedOffhand?'Reserved by your two-handed weapon':old?.name||'Empty slot';
  return {title:item.name,body:`${slots.length>1?`<div class="comparison-slots" aria-label="Compare accessory slot">${slots.map(slot=>`<button data-action="market-compare:${id}:${slot}" aria-pressed="${slot===selected}" class="${slot===selected?'selected':''}">${menuIcon('compare')}${esc(slotLabel(slot))}</button>`).join('')}</div>`:''}<div class="vendor-compare"><div><span class="eyebrow">YOUR GEAR · ${esc(slotLabel(selected))}</span>${old?renderItemArt(old.id,{size:'large'}):''}<h3>${esc(currentName)}</h3>${old?.upgrade?`<p>Upgrade +${old.upgrade}</p>`:''}</div><div><span class="eyebrow">VENDOR ITEM · GRADE ${item.tier||item.level}</span>${renderItemArt(item.id,{size:'large'})}<h3>${esc(item.name)}</h3><p>${preview.price} coins</p></div></div><table class="comparison-table"><caption>Item values · your gear / vendor stock</caption><thead><tr><th scope="col">Property</th><th scope="col">Your gear</th><th scope="col">Vendor item</th></tr></thead><tbody>${rows.map(row=>`<tr><th scope="row">${esc(row.label)}</th><td>${esc(row.before)}</td><td>${esc(row.after)}</td></tr>`).join('')}</tbody></table><p>${esc(item.desc)}</p>${old?.desc?`<details class="comparison-traits"><summary>Current item traits</summary><p>${esc(old.desc)}</p></details>`:''}${blockedOffhand?'<p class="ability-reason">A two-handed weapon reserves this slot. Equip a one-handed weapon before using an offhand; no build totals are projected for an illegal combination.</p>':''}${removesOffhand?'<p class="ability-reason">This two-handed weapon removes your offhand. The build comparison includes that loss.</p>':''}${item.channel?`<p class="modal-help">Weapon scaling: ${esc(item.channel==='heavy'?'Might':item.channel==='precision'?'Finesse':'Intellect')}. ${item.focus?'Enables focus-dependent spells.':'Physical weapon skills need no focus.'}</p>`:''}${changes.length?`<h3>What changes for your build</h3><table class="comparison-table"><caption>Projected totals with this item · no purchase or equipment change</caption><thead><tr><th scope="col">Total</th><th scope="col">Current</th><th scope="col">With item</th></tr></thead><tbody>${changes.map(row=>`<tr><th scope="row">${esc(row.label)}</th><td>${format(row.key,row.before)}</td><td>${format(row.key,row.after)}</td></tr>`).join('')}</tbody></table>`:afterUnchanged(blockedOffhand)}${attack?`<table class="comparison-table"><caption>Expected free Attack vs ${esc(attack.target)} · same target and combat rules</caption><thead><tr><th scope="col">Action</th><th scope="col">Current</th><th scope="col">With item</th></tr></thead><tbody><tr><th scope="row">Attack damage</th><td>${attack.before.toFixed(1)}</td><td>${attack.after.toFixed(1)}</td></tr></tbody></table>`:''}${preview.reason?`<p class="ability-reason">${esc(preview.reason)}</p>`:''}<p class="modal-help">Comparison only. The purchase review lets you place base gear in your satchel or equip it now.</p><div class="modal-actions">${button('buy-preview:'+id,menuIcon('buy')+'Review purchase · '+preview.price+' coins',!preview.allowed,'primary')}${button('close','Back to vendor')}</div>`};
}
function afterUnchanged(blocked){return blocked?'':'<p class="modal-help">No numeric build totals change. Check scaling and equipment traits before deciding.</p>';}
