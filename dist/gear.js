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
  seal:{id:'seal',name:'Superintendent’s Seal',slot:'relic',relicEffect:'seal',level:8,desc:'The first useful Guard each fight grants 15 barrier.'},
  penny:{id:'penny',name:'Copper-Thread Charm',slot:'accessory',stats:{lck:4},level:1,price:25,desc:'+4 Luck. A little fortune, worn on purpose. Improves critical and equipment-drop chances.'},
  band:{id:'band',name:'Floodglass Band',slot:'accessory',ward:8,stats:{int:2},level:8,desc:'+2 Intellect, +8 ward. Quietly, reliably magical.'},
  cap:{id:'cap',name:'Ledger-Keeper’s Cap',slot:'head',armor:4,stats:{ins:1},level:1,price:22,desc:'+1 Insight, +4 armor. Keeps the paperwork out of your eyes.'},
  boots:{id:'boots',name:'Sluicewalker Boots',slot:'feet',armor:3,stats:{fin:1},level:2,price:24,desc:'+1 Finesse, +3 armor. Grip tested on wet stone.'},
  workgloves:{id:'workgloves',name:'Dockhand Workgloves',slot:'hands',armor:2,stats:{fin:1},level:1,price:16,desc:'+1 Finesse, +2 armor. Worn smooth by honest municipal labor.'},
  wornboots:{id:'wornboots',name:'Canal-Walking Boots',slot:'feet',armor:1,stats:{fin:1},level:1,price:16,desc:'+1 Finesse, +1 armor. Better than bare feet on wet stone.'},
  rivethelm:{id:'rivethelm',name:'Chainback Rivet Helm',slot:'head',armor:11,stats:{vit:1},level:5,price:68,desc:'+1 Vitality, +11 armor. A hard answer to a hard shell.'},
  waders:{id:'waders',name:'Floodgate Waders',slot:'feet',armor:7,ward:5,stats:{wil:1},level:6,price:78,desc:'+1 Will, +7 armor, +5 ward. Rated for municipal flooding.'},
  signet:{id:'signet',name:'Stamped Brass Signet',slot:'relic',relicEffect:'signet',stats:{wil:1},ward:8,level:4,price:58,desc:'+1 Will, +8 ward. Recover restores 2 extra Sparkle (mana).'},
  pike:{id:'pike',name:'Lockwarden’s Breach Pike',slot:'weapon',base:34,channel:'heavy',twoHanded:true,stats:{mig:2},level:7,price:125,desc:'Two-handed, 34 weapon base and +2 Might. Leaves no room for an offhand.'},
  // Additional catalog pieces use existing generated item-art families.
  spoolblade:{id:'spoolblade',name:'Spool-Whipped Saber',slot:'weapon',base:20,channel:'precision',stats:{fin:1},level:2,desc:'A tidy blade with an untidy tassel.'},
  teacupMace:{id:'teacupMace',name:'Teacup Mallet',slot:'weapon',base:22,channel:'heavy',stats:{mig:1},level:2,desc:'Porcelain outside, surprisingly stern inside.'},
  lullabyRod:{id:'lullabyRod',name:'Lullaby Baton',slot:'weapon',base:24,channel:'spell',focus:true,stats:{int:1},level:3,desc:'A soft hum, followed by a very firm bonk.'},
  quiltBuckler:{id:'quiltBuckler',name:'Quilted Pot Lid',slot:'offhand',armor:14,level:2,desc:'The stew can wait. Incoming trouble cannot.'},
  thimbleFocus:{id:'thimbleFocus',name:'Thimble Tuning Fork',slot:'offhand',spellBase:4,focus:true,level:2,desc:'A tiny chime with a rather large opinion.'},
  wardingBlanket:{id:'wardingBlanket',name:'Pocket Ward Blanket',slot:'offhand',ward:11,stats:{wil:1},level:3,desc:'For cold nights and questionable hexes.'},
  buttonShield:{id:'buttonShield',name:'Big Button Buckler',slot:'offhand',armor:18,level:3,desc:'The button is decorative. The shield is not.'},
  tinnyFocus:{id:'tinnyFocus',name:'Tin Whistle Focus',slot:'offhand',spellBase:5,focus:true,stats:{int:1},level:4,desc:'A piercing note in every sense.'},
  stitchedWard:{id:'stitchedWard',name:'Patchwork Ward',slot:'offhand',ward:15,stats:{wil:1},level:4,desc:'Every patch remembers a close call.'},
  pillowCap:{id:'pillowCap',name:'Pillow-Fort Helmet',slot:'head',armor:6,stats:{vit:1},level:2,desc:'Engineered to survive enthusiastic pillow fights.'},
  earmuffCrown:{id:'earmuffCrown',name:'Earmuff Crown',slot:'head',armor:8,stats:{wil:1},level:3,desc:'Royal protection from cold ears and bad ideas.'},
  thimbleHelm:{id:'thimbleHelm',name:'Thimble-Stack Helm',slot:'head',armor:10,stats:{ins:1},level:4,desc:'A stack of thimbles. Very official.'},
  teaCosyHood:{id:'teaCosyHood',name:'Tea-Cosy Hood',slot:'head',armor:12,ward:3,level:5,desc:'Warm, snug, and mildly enchanted by biscuits.'},
  ribbonVisor:{id:'ribbonVisor',name:'Ribbon-Tied Visor',slot:'head',armor:13,stats:{fin:1},level:6,desc:'Keeps fringe out of the line of fire.'},
  kettleHelmet:{id:'kettleHelmet',name:'Kettle-Knight Helm',slot:'head',armor:15,ward:4,stats:{vit:1},level:7,desc:'A brave little kettle with a visor.'},
  starryHood:{id:'starryHood',name:'Star-Print Snood',slot:'head',armor:16,ward:5,stats:{wil:1},level:8,desc:'A night sky, stitched close around your ears.'},
  paradeBonnet:{id:'paradeBonnet',name:'Parade Bonnet',slot:'head',armor:18,stats:{ins:2},level:9,desc:'Makes every retreat look like a procession.'},
  quiltedVest:{id:'quiltedVest',name:'Patchwork Parade Vest',slot:'body',armor:12,ward:5,level:2,desc:'The pockets are mostly for snacks.'},
  kettleApron:{id:'kettleApron',name:'Kettle-Warden Apron',slot:'body',armor:15,stats:{vit:1},level:3,desc:'Stain resistant, spell resistant, soup resistant.'},
  velvetWaistcoat:{id:'velvetWaistcoat',name:'Velvet Waistcoat',slot:'body',armor:18,ward:6,stats:{ins:1},level:4,desc:'Dressy enough for danger.'},
  rainCape:{id:'rainCape',name:'Buttoned Rain Cape',slot:'body',armor:21,ward:7,level:5,desc:'A tiny cape for very large weather.'},
  storybookTunic:{id:'storybookTunic',name:'Storybook Tunic',slot:'body',armor:24,stats:{wil:1},level:6,desc:'The margins contain useful footnotes.'},
  festivalCoat:{id:'festivalCoat',name:'Festival Lantern Coat',slot:'body',armor:27,ward:8,stats:{vit:1},level:7,desc:'Bright lining, sturdy seams.'},
  cloudPajamas:{id:'cloudPajamas',name:'Cloud-Quilt Pajamas',slot:'body',armor:29,ward:10,stats:{wil:1},level:8,desc:'Dream-soft fabric, nightmare-tough stitching.'},
  captainJacket:{id:'captainJacket',name:'Button-Captain Jacket',slot:'body',armor:32,stats:{mig:1,vit:1},level:9,desc:'For captains of boats, beds, or blanket forts.'},
  ribbonMitts:{id:'ribbonMitts',name:'Ribbon-Pull Mitts',slot:'hands',armor:4,stats:{fin:1},level:2,desc:'A bow at the wrist; a grip like a knot.'},
  thimbleGauntlets:{id:'thimbleGauntlets',name:'Thimble-Finger Gauntlets',slot:'hands',armor:7,stats:{mig:1},level:3,desc:'Precision fit for very small screws.'},
  pastryMitts:{id:'pastryMitts',name:'Pastry-Safe Mitts',slot:'hands',armor:9,ward:2,level:4,desc:'Rated for hot trays and hot tempers.'},
  spoolBracers:{id:'spoolBracers',name:'Spool-Guard Bracers',slot:'hands',armor:11,stats:{vit:1},level:5,desc:'Threaded tight against scrapes.'},
  starGloves:{id:'starGloves',name:'Star-Catcher Gloves',slot:'hands',armor:13,stats:{ins:1},level:6,desc:'For reaching into the odd corners of the sky.'},
  mittenMitts:{id:'mittenMitts',name:'Mittens of Many Mittens',slot:'hands',armor:15,ward:3,stats:{wil:1},level:7,desc:'Warm hands, several layers of courage.'},
  captainsGloves:{id:'captainsGloves',name:'Captain’s Knot Gloves',slot:'hands',armor:17,stats:{mig:1,fin:1},level:8,desc:'Every knot stays tied, even under pressure.'},
  woollyWristguards:{id:'woollyWristguards',name:'Woolly Wristguards',slot:'hands',armor:19,ward:4,stats:{vit:1},level:9,desc:'A little extra padding for a long day.'},
  slipperBoots:{id:'slipperBoots',name:'Moonlit Slipper Boots',slot:'feet',armor:4,stats:{fin:1},level:2,desc:'Quiet steps, loud ambitions.'},
  rainGaloshes:{id:'rainGaloshes',name:'Rain-Drum Galoshes',slot:'feet',armor:6,ward:3,level:3,desc:'They squeak in time with the weather.'},
  sockSkates:{id:'sockSkates',name:'Sock-Skate Shoes',slot:'feet',armor:8,stats:{fin:1},level:4,desc:'Fast on polished floors; use judgment.'},
  buttonClogs:{id:'buttonClogs',name:'Button-Soled Clogs',slot:'feet',armor:10,stats:{vit:1},level:5,desc:'Every step makes a satisfying click.'},
  cloudSlippers:{id:'cloudSlippers',name:'Cloud-Puff Slippers',slot:'feet',armor:12,ward:4,level:6,desc:'A soft landing, even after a hard lesson.'},
  paradeBoots:{id:'paradeBoots',name:'Parade Ground Boots',slot:'feet',armor:14,stats:{mig:1},level:7,desc:'March bravely; polish occasionally.'},
  stargazerShoes:{id:'stargazerShoes',name:'Stargazer Shoes',slot:'feet',armor:16,ward:5,stats:{ins:1},level:8,desc:'Point toes toward the next bright idea.'},
  thimblePendant:{id:'thimblePendant',name:'Lucky Thimble Pendant',slot:'accessory',stats:{lck:1},level:2,desc:'A thimble for tiny emergencies.'},
  spoolBracelet:{id:'spoolBracelet',name:'Spool-Thread Bracelet',slot:'accessory',stats:{fin:1},level:3,desc:'A spare thread is always handy.'},
  teaCharm:{id:'teaCharm',name:'Tea-Bag Talisman',slot:'accessory',ward:3,stats:{wil:1},level:4,desc:'Steeped in patience, apparently.'},
  toyCompass:{id:'toyCompass',name:'Clockwork Toy Compass',slot:'accessory',stats:{ins:1},level:5,desc:'Points toward something interesting.'},
  buttonLocket:{id:'buttonLocket',name:'Grand Button Locket',slot:'accessory',ward:4,stats:{vit:1},level:6,desc:'Contains a smaller, more sentimental button.'},
  bellPendant:{id:'bellPendant',name:'Bedtime Bell Pendant',slot:'accessory',stats:{int:1},level:7,desc:'Rings only when a nap is overdue.'},
  ribbonBrooch:{id:'ribbonBrooch',name:'Ribbon-Knot Brooch',slot:'accessory',stats:{mig:1,fin:1},level:8,desc:'A neat bow conceals a stubborn knot.'},
  threadSpool:{id:'threadSpool',name:'Thread Spool of Second Chances',slot:'relic',relicEffect:'threadSpool',stats:{vit:1},level:3,desc:'The first useful Guard each fight restores 2 Bounce (stamina).'},
  patchworkHeart:{id:'patchworkHeart',name:'Patchwork Heart',slot:'relic',relicEffect:'patchworkHeart',stats:{wil:1},level:3,desc:'Victory restores 5% of missing Stuffing (health).'},
  luckyButton:{id:'luckyButton',name:'Lucky Button',slot:'relic',relicEffect:'luckyButton',stats:{lck:2},level:4,desc:'Victory grants 5% extra coins, with a small minimum bonus.'},
  dreamBell:{id:'dreamBell',name:'Dream Bell',slot:'relic',relicEffect:'dreamBell',stats:{int:1},level:4,desc:'Victory restores 2 Sparkle (mana).'},
  thimbleGuard:{id:'thimbleGuard',name:'Thimble Guard',slot:'relic',relicEffect:'thimbleGuard',armor:5,level:5,desc:'The first useful Guard each fight adds 4 barrier.'},
  amberMarble:{id:'amberMarble',name:'Amber Marble',slot:'relic',relicEffect:'amberMarble',ward:5,level:5,desc:'Your first damaging action each fight deals 3 extra damage.'},
  ribbonKnot:{id:'ribbonKnot',name:'Ribbon Knot of Resolve',slot:'relic',relicEffect:'ribbonKnot',stats:{mig:1},level:6,desc:'A free physical strike restores 1 Sparkle (mana).'},
  stuffingSatchel:{id:'stuffingSatchel',name:'Emergency Stuffing Satchel',slot:'relic',relicEffect:'stuffingSatchel',stats:{vit:1},level:7,desc:'Mend restores 10% more Stuffing (health).'}
});

// Every category has ten pieces. Prices use content tiers; tiers never restrict ownership or equipment.
const CATEGORY_BASE = {weapon:30,offhand:28,head:25,body:32,hands:25,feet:25,accessory:35,relic:90};
const CATEGORY_INDEX = {};
for (const slot of ['weapon','offhand','head','body','hands','feet','accessory','relic']) {
  const ids=Object.keys(ITEMS).filter(id=>ITEMS[id].slot===slot);
  ids.forEach((id,index)=>{
    CATEGORY_INDEX[id]=index+1;
    const item=ITEMS[id], tier=Math.max(1,Number(item.level)||1);
    item.tier=tier;
    item.price=Math.round((CATEGORY_BASE[slot]||25)*Math.pow(2.4,tier-1));
    item.level=undefined;
  });
}
for (const item of Object.values(ITEMS)) if (item.slot === 'offhand' && (item.armor || 0) > 0) item.shield = true;

// Material names are save keys in `s.materials` and must never be renamed. These are the display labels shown to players.
export const MATERIAL_LABELS = Object.freeze({
  'Ledger scraps': 'Lint',
  'Canal iron': 'Lost buttons',
  'Runic residue': 'Static charge',
  'Chainback shell': 'Prize tokens',
  'Stamped brass': 'Price stickers',
  'Floodglass': 'Squeaker cores',
  'Floodglass Fragment': 'Drum fragment',
  'Salvaged fittings': 'Spare thread',
  'Repair fittings': 'Patches'
});
export function materialLabel(key) {
  return typeof key === 'string' && Object.hasOwn(MATERIAL_LABELS, key) ? MATERIAL_LABELS[key] : String(key ?? '');
}

// Exchanges use guaranteed drops and quest materials; boss fragments always have a sink.
export const EXCHANGES = Object.freeze({
  ledger_fittings:{id:'ledger_fittings',name:'Sort lint',cost:{'Ledger scraps':3},gain:{'Salvaged fittings':1},coins:5},
  iron_fittings:{id:'iron_fittings',name:'Sort lost buttons',cost:{'Canal iron':2},gain:{'Salvaged fittings':1},coins:8},
  repair_parts:{id:'repair_parts',name:'Unpick patches into spare thread',cost:{'Repair fittings':2},gain:{'Salvaged fittings':1},coins:0},
  residue_parts:{id:'residue_parts',name:'Bottle static charge',cost:{'Runic residue':2},gain:{'Floodglass':1},coins:12},
  shell_parts:{id:'shell_parts',name:'Trade in prize tokens',cost:{'Chainback shell':2},gain:{'Repair fittings':2},coins:15},
  brass_parts:{id:'brass_parts',name:'Rework price stickers',cost:{'Stamped brass':2},gain:{'Repair fittings':3},coins:20},
  fragment_glass:{id:'fragment_glass',name:'Stabilize a drum fragment',cost:{'Floodglass Fragment':1},gain:{'Floodglass':3,'Repair fittings':2},coins:0},
  salvage_glass:{id:'salvage_glass',name:'Unpick squeaker cores',cost:{'Floodglass':2},gain:{'Salvaged fittings':2},coins:15},
  fittings_repair:{id:'fittings_repair',name:'Turn spare thread into patches',cost:{'Salvaged fittings':2},gain:{'Repair fittings':2},coins:0},
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

export function resolveItem(s,id){const item=effectiveItem(s,id);return item?{...item,owned:owned(s,id),levelRequired:null,usable:true}:null;}
export function slotChoices(s,id){
  const item=ITEMS[id];if(!item||!owned(s,id))return [];
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
  const item=ITEMS[id];if(LOCKED(s)||!item||!owned(s,id))return false;
  const slots=slotChoices(s,id);const slot=targetSlot||slots.find(x=>!s.gear?.[x])||slots[0];
  if(!slot||!slots.includes(slot)||!canFit(item,slot))return false;
  const gear={...(s.gear||{})};for(const key of SLOT_KEYS)if(gear[key]===id)gear[key]=null;
  if(item.twoHanded)gear.offhand=null;
  gear[slot]=id;s.gear=gear;return true;
}
export function unequipItem(s,slot){if(unequipReason(s,slot))return false;s.gear[slot]=null;return true;}
export function buyPreview(s,id){
  const item=ITEMS[id],price=item?.price||0;
  let reason=!item?'Unknown item.':LOCKED(s)?'Shopping is unavailable during a fight or delve.':!price?'This item is not stocked by the outfitter.':owned(s,id)?'You already own this item.':(s.coins||0)<price?'You cannot afford this item.':null;
  return {allowed:!reason,reason,price,item:item?clone(item):null,tier:item?.tier||null,tierLabel:item?`Tier ${item.tier}`:null,levelRequired:null};
}
export function buyItem(s,id){
  const p=buyPreview(s,id);if(!p.allowed||!Array.isArray(s.bag))return false;
  s.coins-=p.price;s.bag.push(id);if(s.itemMods)delete s.itemMods[id];return true;
}
export function buyAndEquipPreview(s,id,targetSlot){
  const purchase=buyPreview(s,id), item=ITEMS[id];
  let slots=item?(item.slot==='accessory'?ACCESSORY_SLOTS:[item.slot]).filter(slot=>!(slot==='offhand'&&ITEMS[s?.gear?.weapon]?.twoHanded)):[];
  const selectedSlot=targetSlot||slots.find(slot=>!s?.gear?.[slot])||slots[0]||null;
  let reason=purchase.reason;
  if(!reason&&(!selectedSlot||!slots.includes(selectedSlot)||!canFit(item,selectedSlot)))reason='That item cannot be equipped in the selected slot.';
  return {...purchase,allowed:!reason,reason,slotChoices:slots,selectedSlot,willReplace:selectedSlot?s?.gear?.[selectedSlot]||null:null,willClearOffhand:!!(item?.twoHanded&&s?.gear?.offhand)};
}
export function buyAndEquipItem(s,id,targetSlot){
  const p=buyAndEquipPreview(s,id,targetSlot);
  if(!p.allowed||!Array.isArray(s.bag))return false;
  // Validate the eventual loadout before changing coins or ownership.
  if(LOCKED(s))return false;
  const gear={...(s.gear||{})};
  if(ITEMS[id].twoHanded)gear.offhand=null;
  for(const key of SLOT_KEYS)if(gear[key]===id)gear[key]=null;
  gear[p.selectedSlot]=id;
  s.coins-=p.price;s.bag.push(id);if(s.itemMods)delete s.itemMods[id];s.gear=gear;
  return {id,slot:p.selectedSlot,price:p.price,clearedOffhand:p.willClearOffhand};
}
function baseResaleValue(item){return item.price||item.value||12+5*item.level;}
const CRAFT_SALE_CAPS = Object.freeze({cap:8,boots:18,gateShield:24,seal:1,band:1});
function resaleValue(s,id){
  const item=ITEMS[id];if(!item)return 0;
  const base=baseResaleValue(item),up=Math.max(0,Math.min(3,Number.isInteger(s.itemMods?.[id]?.upgrade)?s.itemMods[id].upgrade:0));
  // Upgrades return at most three extra coins, and affixes return no material value.
  const craftCap=Object.hasOwn(CRAFT_SALE_CAPS,id)?CRAFT_SALE_CAPS[id]:Infinity;
  return Math.max(1,Math.min(Math.floor(base*.45),Math.floor(base*.25)+up,craftCap));
}
export function sellPreview(s,id){
  const item=ITEMS[id],price=item?resaleValue(s,id):0;
  const equipped=Object.values(s?.gear||{}).includes(id);
  const activeEcho=s?.relicSockets?.some(socket=>socket?.unlocked&&socket.relicId===id);
  let reason=!item?'Unknown item.':LOCKED(s)?'Selling is unavailable during a fight or delve.':!owned(s,id)?'You do not own this item.':equipped?'Unequip this item before selling it.':activeEcho?'Clear all active echo sockets using this relic before selling it.':null;
  return {allowed:!reason,reason,price,item:item?resolveItem(s,id):null,id};
}
export function sellItem(s,id){
  const p=sellPreview(s,id);if(!p.allowed||!Array.isArray(s.bag))return false;
  s.bag=s.bag.filter(ownedId=>ownedId!==id);if(s.itemMods)delete s.itemMods[id];s.coins+=p.price;
  return {id,coins:p.price};
}
export function exchangeMaterials(s,recipeId){
  const recipe=EXCHANGES[recipeId];if(LOCKED(s)||!recipe||!costAffordable(s,{coins:recipe.coins,materials:recipe.cost})||(recipe.gainItems||[]).some(id=>!ITEMS[id]||owned(s,id)))return false;
  spend(s,{coins:recipe.coins,materials:recipe.cost});s.materials??={};for(const [m,n]of Object.entries(recipe.gain||{}))s.materials[m]=(s.materials[m]||0)+n;
  const gainedItems=[...(recipe.gainItems||[])];s.bag??=[];for(const id of gainedItems)s.bag.push(id);
  return {recipeId,gained:{...(recipe.gain||{})},gainedItems};
}

const UPGRADE_COINS=[0,35,70,120];
function upgradeCost(item,level){const mat=item.base?(item.channel==='spell'?'Runic residue':'Canal iron'):item.armor?'Salvaged fittings':item.ward?'Repair fittings':'Runic residue';return makeCost(UPGRADE_COINS[level+1],{[mat]:level===2?2:1});}
function statPreview(s,id,nextMods){const before=effectiveItem(s,id),after=effectiveItem({...s,itemMods:{...s.itemMods,[id]:nextMods}},id);return {before,after};}
export function upgradePreview(s,id){
 const item=ITEMS[id],mod=s?.itemMods?.[id]||{},level=mod.upgrade||0,cost=item&&level<3?upgradeCost(item,level):noCost();
 let reason=!item?'Unknown item.':LOCKED(s)?'Equipment cannot be changed during a fight or delve.':!owned(s,id)?'You do not own this item.':level>=3?'This item is already at the upgrade cap.':!costAffordable(s,cost)?'You cannot afford this upgrade.':null;
 const next={...mod,upgrade:Math.min(3,level+1)};const pair=item?statPreview(s,id,next):{before:null,after:null};
 return {allowed:!reason,reason,cost,before:pair.before,after:pair.after,level,cap:3};
}
export function upgradeItem(s,id){const p=upgradePreview(s,id);if(!p.allowed)return false;spend(s,p.cost);s.itemMods??={};s.itemMods[id]={...(s.itemMods[id]||{}),upgrade:p.level+1};return {id,upgrade:p.level+1};}
function affixPreviewBase(s,id,kind,affixId){
 const item=ITEMS[id],list=kind==='prefix'?PREFIXES:kind==='suffix'?SUFFIXES:null,affix=list?.[affixId],mod=s?.itemMods?.[id]||{},slot=item?.slot;
 const cost=affix?makeCost(affix.cost.coins,affix.cost.materials):noCost();
 let reason=!item?'Unknown item.':LOCKED(s)?'Equipment cannot be changed during a fight or delve.':!owned(s,id)?'You do not own this item.':!affix?'Unknown affix.':!affix.slots.includes(slot)?'That affix does not fit this item slot.':mod[kind]===affixId?'That affix is already applied.':!costAffordable(s,cost)?'You cannot afford this affix.':null;
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
