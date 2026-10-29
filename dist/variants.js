// Special Edition variants (design 37, R4 "Flagged elites"). One place for the authored affixes, the variant meter, the
// offer rules and the reward multipliers, read by the engine, the hunting list, the encounter header and the tests.
// PvE only, ordinary hunts only (never the boss or a delve fight). No Luck influence, no named rare spawns, no new
// currency: those wait for server-owned rolls (FUTURE-DEVELOPMENT.md, Phase 2). This module imports nothing, so the
// engine can use it without a cycle.
export const VARIANT_VERSION=1;
export const VARIANT_THRESHOLD=6;        // Accepted hunt victories against one enemy before a Special Edition offer is pending.
export const VARIANT_LABEL='Special Edition';
export const VARIANT_REWARDS=Object.freeze({xp:1.25,coins:1.4,materials:1}); // Bounded multipliers on the base reward, plus 1 extra material.
export const STATIC_BARRIER=20;
// Authored, versioned affixes. Each states its trigger and its bound. Numeric fields are read by applyVariant, intent
// (heavyMult) and variantResponse so the displayed text and the combat math come from the same entry.
export const AFFIXES=Object.freeze({
 reinforced:Object.freeze({id:'reinforced',version:1,name:'Reinforced packaging',armor:1.25,ward:1.25,
  effect:'+25% armor and ward.',trigger:'Always active for the whole fight.',bound:'Armor and ward are each raised once and rounded; the 65% mitigation cap still applies.',
  flavor:'Extra cardboard. Extra attitude.'}),
 stuffed:Object.freeze({id:'stuffed',version:1,name:'Extra stuffed',hp:1.2,
  effect:'+20% maximum health.',trigger:'Set when the fight starts.',bound:'Maximum health is raised once and rounded down; nothing heals it during the fight.',
  flavor:'Stuffed a little past the recommended line.'}),
 squeaky:Object.freeze({id:'squeaky',version:1,name:'Squeaky',heavyMult:1.15,
  effect:'Its heavy attacks deal 15% more damage.',trigger:'Applies to its declared heavy attack only; normal attacks are unchanged.',bound:'The heavy is still announced a full exchange ahead, with the same Guard, Disrupt and Opening rules.',
  flavor:'Loud on purpose.'}),
 static:Object.freeze({id:'static',version:1,name:'Static-charged',
  effect:`After it completes its first heavy attack, it gains a ${STATIC_BARRIER}-point barrier.`,trigger:'Once per fight, when its first heavy attack resolves. A heavy you interrupt does not count.',bound:`One ${STATIC_BARRIER}-point barrier that soaks your damage until it is used up; it never renews.`,
  flavor:'Your fur is now standing up for itself, and so is theirs.'})
});
export const AFFIX_ORDER=Object.freeze(['reinforced','stuffed','squeaky','static']);
// Which affixes each ordinary hunt enemy may carry. Reinforced packaging skips the two enemies whose armor and ward are
// too low for +25% to show, and Extra stuffed skips the Clawback Crab, whose armor already makes a longer fight too punishing.
export const VARIANT_AFFIXES=Object.freeze({
 rats:Object.freeze(['stuffed','squeaky','static']),
 scavenger:Object.freeze(['stuffed','squeaky','static']),
 wisp:AFFIX_ORDER,
 crab:Object.freeze(['reinforced','squeaky','static']),
 inspector:AFFIX_ORDER,
 hound:AFFIX_ORDER
});
export const VARIANT_ENEMIES=Object.freeze(Object.keys(VARIANT_AFFIXES));
export const VARIANT_TEXT=Object.freeze({
 notice:'NOTICE · This one came with extra packaging. Reward adjusted accordingly.',
 optional:'Optional. The regular hunt stays available, and this offer keeps until you fight it.',
 pending:enemyName=>`A ${VARIANT_LABEL} ${enemyName} hunt is waiting. It is optional and keeps.`,
 footer:'B.U.R.S.A.R. · STUFFIE SERVICES'
});

const own=(object,key)=>!!object&&typeof object==='object'&&Object.hasOwn(object,key);
export const isVariantEnemy=id=>typeof id==='string'&&Object.hasOwn(VARIANT_AFFIXES,id);
export const affixAllowed=(enemyId,affixId)=>isVariantEnemy(enemyId)&&VARIANT_AFFIXES[enemyId].includes(affixId);
export const affixById=id=>typeof id==='string'&&own(AFFIXES,id)?AFFIXES[id]:null;
export const variantRef=id=>{const a=affixById(id);return a?{id:a.id,version:a.version}:null;};
/** The enemy as it fights: base stats with a stored variant applied. Returns the same object for a regular fight. */
export function applyVariant(enemy,ref){
 const a=affixById(ref?.id);if(!enemy||!a||!affixAllowed(enemy.id,a.id))return enemy;
 return {...enemy,hp:Math.floor(enemy.hp*(a.hp||1)),armor:Math.round(enemy.armor*(a.armor||1)),ward:Math.round(enemy.ward*(a.ward||1)),heavyMult:a.heavyMult||1,variant:a};
}
/** Reward for a victory: the base reward with the bounded Special Edition multipliers. A regular fight returns the base unchanged. */
export function variantReward(ref,base){
 if(!affixById(ref?.id))return {...base,bonus:null};
 const xp=Math.floor(base.xp*VARIANT_REWARDS.xp),coins=Math.floor(base.coins*VARIANT_REWARDS.coins),materials=base.materials+VARIANT_REWARDS.materials;
 return {xp,coins,materials,bonus:{xp:xp-base.xp,coins:coins-base.coins,materials:VARIANT_REWARDS.materials}};
}
export const rewardSummary=(enemy,materialName)=>`XP ×${VARIANT_REWARDS.xp} · coins ×${VARIANT_REWARDS.coins} (${Math.floor(enemy.coins*VARIANT_REWARDS.coins)} instead of ${enemy.coins}) · +${VARIANT_REWARDS.materials} extra ${materialName}. Equipment drop chance is unchanged.`;

// ---- Save state: variantMeters {enemyId: integer 0..threshold} and variantOffers {enemyId: {id, version}} ----
function cleanRef(value,enemyId){
 const a=affixById(value?.id);if(!a||!affixAllowed(enemyId,a.id))return null;
 return {id:a.id,version:Number.isInteger(value.version)&&value.version>0?value.version:a.version};
}
/** Default and normalize the additive fields. Unknown enemies, unknown affixes and non-integer meters are dropped. */
export function normalizeVariants(s){
 const meters={},offers={};
 if(s.variantOffers&&typeof s.variantOffers==='object'&&!Array.isArray(s.variantOffers))for(const [id,value] of Object.entries(s.variantOffers)){const ref=isVariantEnemy(id)?cleanRef(value,id):null;if(ref)offers[id]=ref;}
 if(s.variantMeters&&typeof s.variantMeters==='object'&&!Array.isArray(s.variantMeters))for(const [id,value] of Object.entries(s.variantMeters)){if(isVariantEnemy(id)&&Number.isInteger(value)&&value>=0)meters[id]=Math.min(value,VARIANT_THRESHOLD);}
 // A pending offer holds its meter at the threshold; a full meter with no offer would be an unreachable state.
 for(const id of Object.keys(offers))meters[id]=VARIANT_THRESHOLD;
 for(const id of Object.keys(meters))if(meters[id]>=VARIANT_THRESHOLD&&!offers[id])meters[id]=VARIANT_THRESHOLD-1;
 s.variantMeters=meters;s.variantOffers=offers;return s;
}
export const variantMeter=(s,id)=>Number.isInteger(s?.variantMeters?.[id])?s.variantMeters[id]:0;
export const pendingOffer=(s,id)=>isVariantEnemy(id)?cleanRef(s?.variantOffers?.[id],id):null;
/** The offer a Special Edition hunt starts from, or null when none is pending. Reads only; the offer stays pending until won. */
export const startVariant=(s,id)=>pendingOffer(s,id);
/** Deterministic affix for the next offer: cycles through the authored list, offset per enemy, advancing once per threshold's worth of victories. */
export function chooseAffix(enemyId,kills){
 const list=VARIANT_AFFIXES[enemyId],slot=Math.max(0,VARIANT_ENEMIES.indexOf(enemyId))+Math.floor(Math.max(0,kills||0)/VARIANT_THRESHOLD);
 return list[slot%list.length];
}
/**
 * Called once from the engine for every accepted victory. Only hunt-source fights count (never a delve, never the boss).
 * - A Special Edition win clears that offer and resets that meter.
 * - While an offer is pending the meter stays full; a regular win does not advance it or re-roll anything.
 * - Otherwise the meter advances by one, and reaching the threshold stores the offer (affix chosen now, from the saved kill count).
 */
export function variantVictory(s,enemyId,fight){
 const out={special:false,granted:null};
 if(!isVariantEnemy(enemyId)||fight?.source!=='hunt')return out;
 const meters=s.variantMeters&&typeof s.variantMeters==='object'?s.variantMeters:(s.variantMeters={}),offers=s.variantOffers&&typeof s.variantOffers==='object'?s.variantOffers:(s.variantOffers={});
 if(fight.variant){delete offers[enemyId];meters[enemyId]=0;out.special=true;return out;}
 if(offers[enemyId]){meters[enemyId]=VARIANT_THRESHOLD;return out;}
 const next=variantMeter(s,enemyId)+1;
 if(next>=VARIANT_THRESHOLD){meters[enemyId]=VARIANT_THRESHOLD;offers[enemyId]=variantRef(chooseAffix(enemyId,s.kills?.[enemyId]));out.granted=offers[enemyId];}
 else meters[enemyId]=next;
 return out;
}
export function variantProgress(s,id){
 const offer=pendingOffer(s,id),meter=offer?VARIANT_THRESHOLD:Math.min(variantMeter(s,id),VARIANT_THRESHOLD);
 return {meter,threshold:VARIANT_THRESHOLD,offer,remaining:VARIANT_THRESHOLD-meter};
}

// ---- Fight state: fight.variant {id, version}; fight.variantState exists only for Static-charged ----
export const initialVariantState=ref=>ref?.id==='static'?{barrier:0,charged:false}:undefined;
/** Drop an unusable stored variant; keep a valid one. Old fights without a variant stay valid and untouched. */
export function normalizeFightVariant(f){
 if(!f||typeof f!=='object')return f;
 if(f.variant===undefined||f.variant===null){delete f.variant;delete f.variantState;return f;}
 const ref=f.source==='hunt'?cleanRef(f.variant,f.enemy):null;
 if(!ref){delete f.variant;delete f.variantState;return f;}
 f.variant=ref;
 if(ref.id==='static'){const st=f.variantState&&typeof f.variantState==='object'?f.variantState:{};f.variantState={barrier:Number.isInteger(st.barrier)?Math.max(0,Math.min(STATIC_BARRIER,st.barrier)):0,charged:st.charged===true};}
 else delete f.variantState;
 return f;
}
/** Static-charged barrier soaks player damage. Returns how much it took; mutates the barrier. */
export function variantSoak(f,damage){
 const st=f?.variantState;if(!st||!(st.barrier>0)||!(damage>0))return 0;
 const soaked=Math.min(st.barrier,damage);st.barrier-=soaked;return soaked;
}
/** Called after the enemy's response resolves. Returns a log line when an affix trigger fired, otherwise null. */
export function variantResponse(f,intent,interrupted){
 if(f?.variant?.id!=='static'||!f.variantState||f.variantState.charged||!intent?.heavy||interrupted)return null;
 f.variantState.charged=true;f.variantState.barrier=STATIC_BARRIER;
 return `Static-charged: ${intent.name} left a ${STATIC_BARRIER}-point barrier on it. It will soak your damage until it is used up.`;
}
