// Shared telegraph rules (design 37, R1 "Reading the telegraph pays"). One place for the numbers that the engine,
// the build inspector, the action hints and the lab all read. PvE only: everything here keys off the enemy's declared
// heavy intent, never off attributes or the shared hit formula. Opening is transient in-fight state (fight.opening).
import { ITEMS } from './gear.js';
export const TELEGRAPH=Object.freeze({
 guardNormal:.35,      // Share of a normal hit prevented by any guarding action.
 guardHeavy:.65,       // Share of a declared heavy hit prevented by the same action.
 openingDamage:.25,    // Raw damage bonus of Opening (a heavy guarded, then your next damaging action).
 sidestepCoefficient:.8, // Sidestep is the blade-and-charm combined action; same power as Guardstrike.
 preventionCeiling:.85 // Armor or ward, guard and barrier together never prevent more than this share of one hit.
});
export const GUARD_ACTIONS=Object.freeze(['guard','brace','combo','guardstrike','sidestep']);
export const DAMAGING_ACTIONS=Object.freeze(['attack','disrupt','driving','guardstrike','sidestep','cast','combo']);
export const SHIELD_IDS=Object.freeze(Object.keys(ITEMS).filter(id=>ITEMS[id].shield===true));
export const isShield=id=>ITEMS[id]?.shield===true;
export const guardRate=heavy=>heavy?TELEGRAPH.guardHeavy:TELEGRAPH.guardNormal;
export const exposeBonus=rank=>.15+.05*(rank||1);
const pct=v=>Math.round(v*100)+'%';
export const guardPercent=heavy=>pct(guardRate(heavy));
export const openingPercent=()=>'+'+pct(TELEGRAPH.openingDamage);
// Sidestep replaces Guardstrike for a precision weapon with no shield, as Wardcast and Guardstrike follow weapon and offhand.
export const sidestepEligible=(weaponChannel,offhand)=>weaponChannel==='precision'&&!isShield(offhand);
// Expose and Opening both amplify the next damaging action. The larger bonus applies, never both. A tie goes to Expose.
export function strikeBonus({exposed=false,exposeRank=1,opening=false}={}){
 const expose=exposed?exposeBonus(exposeRank):0,open=opening?TELEGRAPH.openingDamage:0;
 return {bonus:Math.max(expose,open),source:expose>0&&expose>=open?'expose':open>0?'opening':null,noGlance:!!opening};
}
// Resolve one enemy hit in this order: armor or ward (already applied by the caller), guard, barrier, then the ceiling.
// `declared` is the telegraphed hit after any glancing roll and before armor; `afterArmor` is what armor leaves.
// An interrupted response passes afterArmor 0 and is the only way a response is fully prevented.
export function resolveHit({declared,afterArmor,guardRate:rate=0,withdraw=false,barrier=0}){
 let prevented=Math.ceil(afterArmor*rate),incoming=afterArmor-prevented;
 if(withdraw)incoming=Math.floor(incoming*.5);
 let absorbed=Math.min(incoming,Math.max(0,barrier));incoming-=absorbed;
 const base=Math.floor(declared*(withdraw?.5:1)),minimum=afterArmor>0?Math.max(1,base-Math.floor(base*TELEGRAPH.preventionCeiling)):0;
 let capped=false;
 if(incoming<minimum){
  let back=minimum-incoming;capped=true;
  const fromBarrier=Math.min(back,absorbed);absorbed-=fromBarrier;incoming+=fromBarrier;back-=fromBarrier;
  const fromGuard=Math.min(back,prevented);prevented-=fromGuard;incoming+=fromGuard;
 }
 return {prevented,absorbed,incoming,capped,minimum};
}
// Badge text for the intent area; the larger of Opening and a live Expose is the bonus the next damaging action receives.
export function openingLabel(fight,exposeRank){if(!fight?.opening)return null;const b=strikeBonus({exposed:fight.exposed,exposeRank,opening:true});return `OPENING +${Math.round(b.bonus*100)}%`;}
// Display text read by the intent hint, action hints, inspector and rules dialog.
export const telegraphText=Object.freeze({
 heavyGuard:()=>`Guarding a declared heavy attack prevents ${guardPercent(true)} of it (${guardPercent(false)} of a normal hit) and grants Opening: your next damaging action cannot glance and deals ${openingPercent()} damage.`,
 guardNote:()=>`Prevents ${guardPercent(false)} of a hit, or ${guardPercent(true)} of a declared heavy attack, which also grants Opening (${openingPercent()} damage on your next damaging action, which cannot glance).`,
 heavyHint:()=>`Heavy attack · Guard prevents ${guardPercent(true)} and opens the enemy; Disrupt can cancel it.`,
 openingShort:()=>`Guard prevents ${guardPercent(true)} of a heavy and opens the enemy (${openingPercent()} next strike).`,
 ceiling:()=>`Armor or ward, guard and barrier together never prevent more than ${pct(TELEGRAPH.preventionCeiling)} of one hit; only a successful interrupt cancels a response entirely.`
});
