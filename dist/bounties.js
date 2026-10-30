import * as G from './engine.js';

// Notice Board bounty prototype, Playtest Lab only. See design/40, item 2, and design/37, R5a ("Bounties").
// Pure rules: no DOM, no storage, no clock, no random draw. The lab owns the board and passes the character.
// A bounty is its own record type: it never reuses story contract IDs or majorIndex and never feeds ability unlocks.
// These are prototype rules on a client-controlled fixture. They are not a secure online system (FUTURE-DEVELOPMENT.md).

export const BOUNTY_RULES_VERSION=1;
// The bonus budget is a share of what the bounty's wins already pay; the profile splits it 60/30/10 across XP, coins and materials.
// 35% keeps every repeatable bounty below the authored minor contract for the same target and count (tests pin this).
export const BONUS_BUDGET_PCT=35;
export const PROFILE_SHARES=Object.freeze([60,30,10]);
// Targets stay within two levels of the character, so every qualifying win earns full victory XP (engine victory factor 1).
export const LEVEL_WINDOW=2;
export const PROFILES=Object.freeze({
  xp:Object.freeze({id:'xp',name:'Experience-led',order:Object.freeze(['xp','coins','materials'])}),
  coins:Object.freeze({id:'coins',name:'Coin-led',order:Object.freeze(['coins','xp','materials'])}),
  materials:Object.freeze({id:'materials',name:'Material-led',order:Object.freeze(['materials','coins','xp'])})
});
export const PROFILE_ORDER=Object.freeze(['xp','coins','materials']);
// Authored rotation. Each profile reads it from its own position; a claim moves that profile past the claimed entry.
export const ROTATION=Object.freeze([['rats',4],['scavenger',3],['wisp',3],['crab',3],['rats',5],['scavenger',4],['inspector',2],['wisp',4],['crab',4],['hound',2],['inspector',3],['hound',3]].map(([enemy,count])=>Object.freeze({enemy,count})));
const START_INDEX=Object.freeze({xp:0,coins:1,materials:2});
const MAX_HISTORY=50;

const enemyById=id=>G.ENEMIES.find(e=>e.id===id)||null;
const locked=c=>!!(c?.fight||c?.delve);
// Mirrors the nominal (factor 1) victory XP in engine.js victory(); tests pin the two together.
export const nominalVictoryXP=enemy=>20+12*enemy.level;

export function freshBoard(){return {rulesVersion:BOUNTY_RULES_VERSION,next:{...START_INDEX},active:null,serial:0,claimed:[],history:[]};}
export function eligibleTarget(level,enemyId){const e=enemyById(enemyId);return !!e&&e.id!=='boss'&&Math.abs(e.level-level)<=LEVEL_WINDOW;}

export function bountyReward(enemyId,count,profileId){
  const e=enemyById(enemyId),profile=PROFILES[profileId];if(!e||!profile||!Number.isInteger(count)||count<1)return null;
  const base={xp:nominalVictoryXP(e)*count,coins:e.coins*count,materials:count},out={xp:0,coins:0,materials:0};
  profile.order.forEach((channel,i)=>{out[channel]=Math.floor(base[channel]*BONUS_BUDGET_PCT*PROFILE_SHARES[i]/10000);});
  if(profileId==='materials')out.materials=Math.max(1,out.materials);
  return {xp:out.xp,coins:out.coins,materials:out.materials?{[e.material]:out.materials}:{}};
}

// Profiles are resolved in PROFILE_ORDER. Each takes the first in-window entry from its own position that an earlier
// profile has not already shown, so the board offers different targets where it can. Only the board positions and the
// level decide the result: reading, declining or abandoning never changes it.
function scan(board,profileId,level,taken){
  const start=board.next[profileId];let fallback=null;
  for(let step=0;step<ROTATION.length;step++){
    const rotationIndex=(start+step)%ROTATION.length;
    if(!eligibleTarget(level,ROTATION[rotationIndex].enemy))continue;
    if(!taken.has(rotationIndex))return rotationIndex;
    fallback??=rotationIndex;
  }
  return fallback;
}
function makeOffer(profileId,rotationIndex){
  const entry=ROTATION[rotationIndex];
  return {profile:profileId,profileName:PROFILES[profileId].name,rotationIndex,enemy:entry.enemy,enemyName:enemyById(entry.enemy).name,count:entry.count,reward:bountyReward(entry.enemy,entry.count,profileId),rulesVersion:BOUNTY_RULES_VERSION};
}
export function boardOffers(board,level){
  if(!board)return [];const taken=new Set(),offers=[];
  for(const id of PROFILE_ORDER){const index=scan(board,id,level,taken);if(index===null)continue;taken.add(index);offers.push(makeOffer(id,index));}
  return offers;
}
export function offerFor(board,profileId,level){return PROFILES[profileId]?boardOffers(board,level).find(o=>o.profile===profileId)||null:null;}
export function bountyReady(board){const a=board?.active;return !!a&&a.progress>=a.count;}

export function acceptBounty(board,character,profileId){
  if(!board||!character)return {ok:false,reason:'No Notice Board.'};
  if(board.active)return {ok:false,reason:'Finish or abandon your current bounty first.'};
  if(locked(character))return {ok:false,reason:'Choose a bounty between fights.'};
  const offer=offerFor(board,profileId,character.level);if(!offer)return {ok:false,reason:'That bounty is not available.'};
  board.serial++;board.active={id:`bounty-${board.serial}`,...offer,reward:structuredClone(offer.reward),progress:0};
  return {ok:true,bounty:board.active};
}
// Called once per accepted victory. Only wins after acceptance count, and progress stops at the target.
export function recordVictory(board,enemyId){
  const a=board?.active;if(!a||a.enemy!==enemyId||a.progress>=a.count)return false;
  a.progress++;return true;
}
// Abandoning forfeits progress but leaves the board exactly as it was: declining never rerolls an offer.
export function abandonBounty(board,character){
  if(!board?.active)return {ok:false,reason:'No bounty is active.'};
  if(locked(character))return {ok:false,reason:'Abandon a bounty between fights.'};
  const bounty=board.active;board.active=null;
  board.history.unshift({id:bounty.id,profile:bounty.profile,enemy:bounty.enemy,count:bounty.count,progress:bounty.progress,outcome:'abandoned'});board.history=board.history.slice(0,MAX_HISTORY);
  return {ok:true,bounty};
}
export function claimBounty(board,character){
  const a=board?.active;if(!a)return {ok:false,reason:'No bounty is active.'};
  if(locked(character))return {ok:false,reason:'Claim a bounty between fights.'};
  if(a.progress<a.count)return {ok:false,reason:`${a.count-a.progress} more win${a.count-a.progress===1?'':'s'} needed.`};
  if(board.claimed.includes(a.id))return {ok:false,reason:'This bounty has already been paid.',duplicate:true};
  const levelBefore=character.level;G.awardXP(character,a.reward.xp);character.coins+=a.reward.coins;
  for(const [key,n] of Object.entries(a.reward.materials))character.materials[key]=(character.materials[key]||0)+n;
  board.claimed.push(a.id);board.next[a.profile]=(a.rotationIndex+1)%ROTATION.length;
  board.history.unshift({id:a.id,profile:a.profile,enemy:a.enemy,count:a.count,progress:a.progress,outcome:'claimed',reward:structuredClone(a.reward)});board.history=board.history.slice(0,MAX_HISTORY);
  board.active=null;
  return {ok:true,id:a.id,reward:structuredClone(a.reward),leveled:character.level-levelBefore};
}

export function rewardText(reward){
  if(!reward)return 'nothing';
  const parts=[];if(reward.xp)parts.push(`+${reward.xp} XP`);if(reward.coins)parts.push(`+${reward.coins} coins`);
  for(const [key,n] of Object.entries(reward.materials||{}))parts.push(`${n} × ${G.materialLabel(key)}`);
  return parts.join(' · ')||'nothing';
}
export function bountySummary(board){
  if(!board)return null;const sum={xp:0,coins:0,materials:{}};
  for(const h of board.history)if(h.outcome==='claimed'){sum.xp+=h.reward.xp;sum.coins+=h.reward.coins;for(const [k,v] of Object.entries(h.reward.materials))sum.materials[k]=(sum.materials[k]||0)+v;}
  return {format:1,rulesVersion:BOUNTY_RULES_VERSION,prototype:true,accepted:board.serial,claimed:board.claimed.length,abandoned:board.history.filter(h=>h.outcome==='abandoned').length,bonusPaid:sum,active:board.active?{id:board.active.id,profile:board.active.profile,enemy:board.active.enemy,progress:board.active.progress,count:board.active.count}:null,history:structuredClone(board.history),
    notes:'Prototype rules on a disposable fixture. Bounties never expire, refill only by completion from an authored rotation, count only wins after acceptance, and pay their bonus once. Abandoning forfeits progress and never rerolls an offer.'};
}
