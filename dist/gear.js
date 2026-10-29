// Pure equipment and crafting rules. Item ids are save-format identifiers.
export const SLOTS = Object.freeze({
  weapon: 'Weapon', offhand: 'Offhand', head: 'Head', body: 'Body', hands: 'Hands',
  feet: 'Feet', accessory: 'Accessory', accessory2: 'Accessory 2', relic: 'Relic'
});
const ACCESSORY_SLOTS = ['accessory', 'accessory2'];
const SLOT_KEYS = Object.keys(SLOTS);

export const ITEMS = Object.freeze({
  rod:{id:'rod',name:"Inspector’s Rod",slot:'weapon',base:14,channel:'spell',focus:true,level:1,price:18,desc:'A focus-tagged rod. Strike scales with Intellect; supports a shield.'},
  sword:{id:'sword',name:'Canal-Iron Sword',slot:'weapon',base:14,channel:'heavy',level:1,price:18,desc:'An honest length of iron. Strike scales with Might.'},
  blade:{id:'blade',name:'Surveyor’s Blade',slot:'weapon',base:14,channel:'precision',level:1,price:20,desc:'For precise measurements and less precise disputes. Scales with Finesse.'},
  shield:{id:'shield',name:'Salvaged Buckler',slot:'offhand',armor:10,level:1,price:12,desc:'Enough shield to make a point. Enables Wardcast with a rod.'},
  focus:{id:'focus',name:'Chalkbound Focus',slot:'offhand',spellBase:3,focus:true,level:1,price:15,desc:'+3 spell base. Trades shield protection for spell output.'},
  charm:{id:'charm',name:'Canalstone Charm',slot:'offhand',ward:8,stats:{ins:2},level:1,price:16,desc:'+2 Insight, +8 ward. A small stone with good intentions.'},
  coat:{id:'coat',name:'Patched Workcoat',slot:'body',armor:8,ward:4,level:1,price:20,desc:'+8 armor, +4 ward. Dry is a relative term.'},
  gateShield:{id:'gateShield',name:'Riveted Gate Shield',slot:'offhand',armor:28,level:3,price:45,desc:'+28 armor. A retired piece of infrastructure.'},
  oilskin:{id:'oilskin',name:'Oilskin Coat',slot:'body',armor:20,ward:12,level:3,price:50,desc:'+20 armor, +12 ward. Finally, an actual waterproof layer.'},
  grips:{id:'grips',name:'Chainback Grips',slot:'hands',armor:6,stats:{mig:2},level:5,price:65,desc:'+2 Might, +6 armor. Reclaimed from a reluctant donor.'},
  lantern:{id:'lantern',name:'Lantern-Eye Charm',slot:'accessory',stats:{ins:2},ward:8,level:6,price:75,desc:'+2 Insight, +8 ward. Lets you see the problem more clearly.'},
  floodrod:{id:'floodrod',name:'Floodglass Conductor',slot:'weapon',base:26,channel:'spell',focus:true,stats:{int:2},level:6,price:95,desc:'26 weapon base, +2 Intellect. Focus-tagged; works with a shield.'},
  ironsword:{id:'ironsword',name:'Lockwarden’s Sword',slot:'weapon',base:30,channel:'heavy',stats:{mig:2},level:6,price:95,desc:'30 weapon base, +2 Might. A persuasive argument.'},
  glassblade:{id:'glassblade',name:'Floodglass Needle',slot:'weapon',base:30,channel:'precision',stats:{fin:2},level:6,price:95,desc:'30 weapon base, +2 Finesse. Precision has its rewards.'},
  seal:{id:'seal',name:'Superintendent’s Seal',slot:'relic',level:8,desc:'First useful Guard each encounter grants 15 barrier. Once per fight.'},
  penny:{id:'penny',name:'Copper-Thread Charm',slot:'accessory',stats:{lck:4},level:1,price:25,desc:'+4 Luck. A little fortune, worn on purpose. Improves critical and equipment-drop chances.'},
  band:{id:'band',name:'Floodglass Band',slot:'accessory',ward:8,stats:{int:2},level:8,desc:'+2 Intellect, +8 ward. Quietly, reliably magical.'},
  cap:{id:'cap',name:'Ledger-Keeper’s Cap',slot:'head',armor:4,stats:{ins:1},level:1,price:22,desc:'+1 Insight, +4 armor. Keeps the paperwork out of your eyes.'},
  boots:{id:'boots',name:'Sluicewalker Boots',slot:'feet',armor:3,stats:{fin:1},level:2,price:24,desc:'+1 Finesse, +3 armor. Grip tested on wet stone.'},
  workgloves:{id:'workgloves',name:'Dockhand Workgloves',slot:'hands',armor:2,stats:{fin:1},level:1,price:16,desc:'+1 Finesse, +2 armor. Worn smooth by honest municipal labor.'},
  wornboots:{id:'wornboots',name:'Canal-Walking Boots',slot:'feet',armor:1,stats:{fin:1},level:1,price:16,desc:'+1 Finesse, +1 armor. Better than bare feet on wet stone.'},
  rivethelm:{id:'rivethelm',name:'Chainback Rivet Helm',slot:'head',armor:11,stats:{vit:1},level:5,price:68,desc:'+1 Vitality, +11 armor. A hard answer to a hard shell.'},
  waders:{id:'waders',name:'Floodgate Waders',slot:'feet',armor:7,ward:5,stats:{wil:1},level:6,price:78,desc:'+1 Will, +7 armor, +5 ward. Rated for municipal flooding.'},
  signet:{id:'signet',name:'Stamped Brass Signet',slot:'relic',stats:{wil:1},ward:8,level:4,price:58,desc:'+1 Will, +8 ward. An official seal with unofficial uses.'},
  pike:{id:'pike',name:'Lockwarden’s Breach Pike',slot:'weapon',base:34,channel:'heavy',twoHanded:true,stats:{mig:2},level:7,price:125,desc:'Two-handed, 34 weapon base and +2 Might. Leaves no room for an offhand.'}
});

// Exchanges use guaranteed drops and quest materials; boss fragments always have a sink.
export const EXCHANGES = Object.freeze({
  ledger_fittings:{id:'ledger_fittings',name:'Sort ledger scraps',cost:{'Ledger scraps':3},gain:{'Salvaged fittings':1},coins:5},
  iron_fittings:{id:'iron_fittings',name:'Shape canal iron',cost:{'Canal iron':2},gain:{'Salvaged fittings':1},coins:8},
  repair_parts:{id:'repair_parts',name:'Repair with spare fittings',cost:{'Repair fittings':2},gain:{'Salvaged fittings':1},coins:0},
  residue_parts:{id:'residue_parts',name:'Set runic residue',cost:{'Runic residue':2},gain:{'Floodglass':1},coins:12},
  shell_parts:{id:'shell_parts',name:'Break down chainback shell',cost:{'Chainback shell':2},gain:{'Repair fittings':2},coins:15},
  brass_parts:{id:'brass_parts',name:'Rework stamped brass',cost:{'Stamped brass':2},gain:{'Repair fittings':3},coins:20},
  fragment_glass:{id:'fragment_glass',name:'Stabilize a boss fragment',cost:{'Floodglass Fragment':1},gain:{'Floodglass':3,'Repair fittings':2},coins:0},
  salvage_glass:{id:'salvage_glass',name:'Recover floodgate fittings',cost:{'Floodglass':2},gain:{'Salvaged fittings':2},coins:15},
  fittings_repair:{id:'fittings_repair',name:'Turn fittings into repairs',cost:{'Salvaged fittings':2},gain:{'Repair fittings':2},coins:0},
  craft_cap:{id:'craft_cap',name:'Assemble a ledger-keeper’s cap',cost:{'Ledger scraps':2,'Salvaged fittings':1},gain:{},gainItems:['cap'],coins:8,level:1},
  craft_boots:{id:'craft_boots',name:'Assemble sluicewalker boots',cost:{'Canal iron':3,'Ledger scraps':2},gain:{},gainItems:['boots'],coins:18,level:2},
  craft_gate_shield:{id:'craft_gate_shield',name:'Rivet a gate shield',cost:{'Canal iron':3,'Salvaged fittings':2},gain:{},gainItems:['gateShield'],coins:24,level:3},
  fragment_seal:{id:'fragment_seal',name:'Forge the Superintendent’s Seal',cost:{'Floodglass Fragment':5},gain:{},gainItems:['seal'],coins:0,level:8},
  fragment_band:{id:'fragment_band',name:'Forge a Floodglass Band',cost:{'Floodglass Fragment':5},gain:{},gainItems:['band'],coins:0,level:8}
});

export const PREFIXES = Object.freeze({
  sturdy:{id:'sturdy',name:'Sturdy',slots:['head','body','hands','feet','offhand'],bonus:{armor:3},cost:{coins:24,materials:{'Salvaged fittings':1}}},
  warded:{id:'warded',name:'Warded',slots:['head','body','hands','feet','offhand','accessory','relic'],bonus:{ward:3},cost:{coins:28,materials:{'Runic residue':1}}},
  keen:{id:'keen',name:'Keen',slots:['weapon'],bonus:{base:2},cost:{coins:30,materials:{'Canal iron':1}}},
  focused:{id:'focused',name:'Focused',slots:['weapon','offhand'],bonus:{spellBase:1},cost:{coins:30,materials:{'Runic residue':1}}}
});
export const SUFFIXES = Object.freeze({
  of_might:{id:'of_might',name:'of Might',slots:['weapon','hands'],bonus:{stats:{mig:1}},cost:{coins:32,materials:{'Chainback shell':1}}},
  of_insight:{id:'of_insight',name:'of Insight',slots:['head','feet','accessory','relic','offhand'],bonus:{stats:{ins:1}},cost:{coins:30,materials:{'Runic residue':1}}},
  of_vigor:{id:'of_vigor',name:'of Vigor',slots:['body','hands','feet','head'],bonus:{stats:{vit:1}},cost:{coins:34,materials:{'Repair fittings':1}}},
  of_the_tide:{id:'of_the_tide',name:'of the Tide',slots:['body','feet','accessory','relic','offhand'],bonus:{ward:2},cost:{coins:28,materials:{'Floodglass':1}}}
});

const LOCKED = s => !!(s?.fight || s?.delve);
const noCost = () => ({coins:0,materials:{}});
const clone = x => JSON.parse(JSON.stringify(x));
function canFit(item,slot){return item && (item.slot===slot || (ACCESSORY_SLOTS.includes(slot)&&item.slot==='accessory'));}
function owned(s,id){return Array.isArray(s?.bag)&&s.bag.includes(id);}
function costAffordable(s,cost){return (s.coins||0)>=(cost.coins||0)&&Object.entries(cost.materials||{}).every(([m,n])=>(s.materials?.[m]||0)>=n);}
function spend(s,cost){s.coins-=cost.coins||0;for(const [m,n]of Object.entries(cost.materials||{}))s.materials[m]-=n;}
function makeCost(coins=0,materials={}){return {coins,materials:{...materials}};}

export function effectiveItem(s,id){
  const base=ITEMS[id];if(!base)return null;
  const item=clone(base),mod=s?.itemMods?.[id]||{};
  const up=Math.max(0,Math.min(3,Number.isInteger(mod.upgrade)?mod.upgrade:0));
  const inc={base:0,armor:0,ward:0,spellBase:0};
  let upgradeStat=null;
  if(base.base)inc.base=up*(base.twoHanded?2:1);
  else if(base.armor)inc.armor=up;
  else if(base.ward)inc.ward=up;
  else if(base.spellBase)inc.spellBase=up;
  else upgradeStat=Object.keys(base.stats||{})[0]||({head:'ins',body:'vit',hands:'mig',feet:'fin',offhand:'vit',accessory:'ins',relic:'wil'}[base.slot]||'vit');
  for(const key of ['base','armor','ward','spellBase'])item[key]=(item[key]||0)+inc[key];
  if(upgradeStat)item.stats={...item.stats,[upgradeStat]:(item.stats?.[upgradeStat]||0)+up};
  const bonuses=[];
  const affixIds={prefix:null,suffix:null};
  for(const kind of ['prefix','suffix']){const aff=(kind==='prefix'?PREFIXES:SUFFIXES)[mod[kind]];if(aff&&aff.slots.includes(base.slot)){bonuses.push(aff.bonus);affixIds[kind]=mod[kind];}}
  for(const bonus of bonuses){for(const key of ['base','armor','ward','spellBase'])item[key]=(item[key]||0)+(bonus[key]||0);for(const [stat,n]of Object.entries(bonus.stats||{})){item.stats={...item.stats,[stat]:(item.stats?.[stat]||0)+n};}}
  item.upgrade=up;item.prefix=affixIds.prefix;item.suffix=affixIds.suffix;
  item.name=`${affixIds.prefix?`${PREFIXES[affixIds.prefix].name} `:''}${base.name}${affixIds.suffix?` ${SUFFIXES[affixIds.suffix].name}`:''}${up?` +${up}`:''}`;
  return item;
}

export function resolveItem(s,id){const item=effectiveItem(s,id);return item?{...item,owned:owned(s,id),levelRequired:item.level,usable:(s?.level||1)>=item.level}:null;}
export function slotChoices(s,id){
  const item=ITEMS[id];if(!item||!owned(s,id)||(s.level||1)<item.level)return [];
  return (item.slot==='accessory'?ACCESSORY_SLOTS:[item.slot]).filter(slot=>!(slot==='offhand'&&ITEMS[s.gear?.weapon]?.twoHanded));
}
export function unequipReason(s,slot){
  if(LOCKED(s))return 'Equipment cannot be changed during a fight or delve.';
  if(!SLOTS[slot])return 'Unknown equipment slot.';
  if(!s.gear?.[slot])return 'That slot is already empty.';
  if(slot==='weapon')return 'A weapon is required for the universal Attack action. Equip another weapon first.';
  return null;
}
export function equipItem(s,id,targetSlot){
  const item=ITEMS[id];if(LOCKED(s)||!item||!owned(s,id)||(s.level||1)<item.level)return false;
  const slots=slotChoices(s,id);const slot=targetSlot||slots.find(x=>!s.gear?.[x])||slots[0];
  if(!slot||!slots.includes(slot)||!canFit(item,slot))return false;
  const gear={...(s.gear||{})};for(const key of SLOT_KEYS)if(gear[key]===id)gear[key]=null;
  if(item.twoHanded)gear.offhand=null;
  gear[slot]=id;s.gear=gear;return true;
}
export function unequipItem(s,slot){if(unequipReason(s,slot))return false;s.gear[slot]=null;return true;}
export function buyPreview(s,id){
  const item=ITEMS[id],price=item?.price||0;
  let reason=!item?'Unknown item.':LOCKED(s)?'Shopping is unavailable during a fight or delve.':!price?'This item is not stocked by the outfitter.':(s.level||1)<item.level?`Requires level ${item.level}.`:owned(s,id)?'You already own this item.':(s.coins||0)<price?'You cannot afford this item.':null;
  return {allowed:!reason,reason,price,item:item?clone(item):null};
}
export function buyItem(s,id){
  const p=buyPreview(s,id);if(!p.allowed||!Array.isArray(s.bag))return false;
  s.coins-=p.price;s.bag.push(id);if(s.itemMods)delete s.itemMods[id];return true;
}
function baseResaleValue(item){return item.price||item.value||12+5*item.level;}
function resaleValue(s,id){
  const item=ITEMS[id];if(!item)return 0;
  const base=baseResaleValue(item),up=Math.max(0,Math.min(3,Number.isInteger(s.itemMods?.[id]?.upgrade)?s.itemMods[id].upgrade:0));
  // Upgrades return at most three extra coins, and affixes return no material value.
  return Math.max(1,Math.min(Math.floor(base*.45),Math.floor(base*.25)+up));
}
export function sellPreview(s,id){
  const item=ITEMS[id],price=item?resaleValue(s,id):0;
  const equipped=Object.values(s?.gear||{}).includes(id);
  let reason=!item?'Unknown item.':LOCKED(s)?'Selling is unavailable during a fight or delve.':!owned(s,id)?'You do not own this item.':equipped?'Unequip this item before selling it.':null;
  return {allowed:!reason,reason,price,item:item?resolveItem(s,id):null,id};
}
export function sellItem(s,id){
  const p=sellPreview(s,id);if(!p.allowed||!Array.isArray(s.bag))return false;
  s.bag=s.bag.filter(ownedId=>ownedId!==id);if(s.itemMods)delete s.itemMods[id];s.coins+=p.price;
  return {id,coins:p.price};
}
export function exchangeMaterials(s,recipeId){
  const recipe=EXCHANGES[recipeId];if(LOCKED(s)||!recipe||(s.level||1)<(recipe.level||1)||!costAffordable(s,{coins:recipe.coins,materials:recipe.cost})||(recipe.gainItems||[]).some(id=>!ITEMS[id]||owned(s,id)))return false;
  spend(s,{coins:recipe.coins,materials:recipe.cost});s.materials??={};for(const [m,n]of Object.entries(recipe.gain||{}))s.materials[m]=(s.materials[m]||0)+n;
  const gainedItems=[...(recipe.gainItems||[])];s.bag??=[];for(const id of gainedItems)s.bag.push(id);
  return {recipeId,gained:{...(recipe.gain||{})},gainedItems};
}

const UPGRADE_COINS=[0,35,70,120];
function upgradeCost(item,level){const mat=item.base?(item.channel==='spell'?'Runic residue':'Canal iron'):item.armor?'Salvaged fittings':item.ward?'Repair fittings':'Runic residue';return makeCost(UPGRADE_COINS[level+1],{[mat]:level===2?2:1});}
function statPreview(s,id,nextMods){const before=effectiveItem(s,id),after=effectiveItem({...s,itemMods:{...s.itemMods,[id]:nextMods}},id);return {before,after};}
export function upgradePreview(s,id){
 const item=ITEMS[id],mod=s?.itemMods?.[id]||{},level=mod.upgrade||0,cost=item&&level<3?upgradeCost(item,level):noCost();
 let reason=!item?'Unknown item.':LOCKED(s)?'Equipment cannot be changed during a fight or delve.':!owned(s,id)?'You do not own this item.':(s.level||1)<item.level?'Your level is too low.':level>=3?'This item is already at the upgrade cap.':!costAffordable(s,cost)?'You cannot afford this upgrade.':null;
 const next={...mod,upgrade:Math.min(3,level+1)};const pair=item?statPreview(s,id,next):{before:null,after:null};
 return {allowed:!reason,reason,cost,before:pair.before,after:pair.after,level,cap:3};
}
export function upgradeItem(s,id){const p=upgradePreview(s,id);if(!p.allowed)return false;spend(s,p.cost);s.itemMods??={};s.itemMods[id]={...(s.itemMods[id]||{}),upgrade:p.level+1};return {id,upgrade:p.level+1};}
function affixPreviewBase(s,id,kind,affixId){
 const item=ITEMS[id],list=kind==='prefix'?PREFIXES:kind==='suffix'?SUFFIXES:null,affix=list?.[affixId],mod=s?.itemMods?.[id]||{},slot=item?.slot;
 const cost=affix?makeCost(affix.cost.coins,affix.cost.materials):noCost();
 let reason=!item?'Unknown item.':LOCKED(s)?'Equipment cannot be changed during a fight or delve.':!owned(s,id)?'You do not own this item.':(s.level||1)<item.level?'Your level is too low.':!affix?'Unknown affix.':!affix.slots.includes(slot)?'That affix does not fit this item slot.':mod[kind]===affixId?'That affix is already applied.':!costAffordable(s,cost)?'You cannot afford this affix.':null;
 const next={...mod,[kind]:affixId};const pair=item?statPreview(s,id,next):{before:null,after:null};
 return {allowed:!reason,reason,cost,before:pair.before,after:pair.after,kind,affixId,replacing:mod[kind]||null};
}
export function affixPreview(s,id,kind,affixId){return affixPreviewBase(s,id,kind,affixId);}
export function applyAffix(s,id,kind,affixId){const p=affixPreviewBase(s,id,kind,affixId);if(!p.allowed)return false;spend(s,p.cost);s.itemMods??={};s.itemMods[id]={...(s.itemMods[id]||{}),[kind]:affixId};return {id,kind,affixId,replaced:p.replacing};}

export function normalizeGearState(s){
  if(!s||typeof s!=='object')return s;
  s.bag=Array.isArray(s.bag)?[...new Set(s.bag.filter(id=>ITEMS[id]))]:[];
  const old=s.gear&&typeof s.gear==='object'?s.gear:{};const gear=Object.fromEntries(SLOT_KEYS.map(k=>[k,null]));
  // Preserve legacy equipment absent from the bag, then accept only a single valid slot per id.
  for(const slot of SLOT_KEYS){const id=old[slot];if(ITEMS[id]&&!s.bag.includes(id))s.bag.push(id);}
  for(const slot of SLOT_KEYS){const id=old[slot],item=ITEMS[id];if(!item||!s.bag.includes(id)||!canFit(item,slot)||Object.values(gear).includes(id))continue;if(slot==='offhand'&&ITEMS[old.weapon]?.twoHanded)continue;if(item.twoHanded&&slot==='weapon')gear.offhand=null;gear[slot]=id;}
  s.gear=gear;
  const mods={};for(const id of s.bag){const m=s.itemMods?.[id];if(!m||typeof m!=='object')continue;const next={upgrade:Number.isInteger(m.upgrade)?Math.max(0,Math.min(3,m.upgrade)):0};for(const kind of ['prefix','suffix']){const aff=(kind==='prefix'?PREFIXES:SUFFIXES)[m[kind]];if(aff&&aff.slots.includes(ITEMS[id].slot))next[kind]=m[kind];}mods[id]=next;}
  s.itemMods=mods;return s;
}
