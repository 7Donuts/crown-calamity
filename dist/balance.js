import * as G from './engine.js';

const ATTRIBUTES=['mig','fin','int','vit','wil','ins','lck'];
const BUILDS={
  might:{label:'Physical offense · Might',primary:'mig'},
  precision:{label:'Precision offense · Finesse',primary:'fin'},
  durableCaster:{label:'Durable caster',allocation:'durable'},
  glassCaster:{label:'Glass caster · Intellect',primary:'int'},
  luck:{label:'Luck focused',primary:'lck'}
};
const LEVELS=[1,5,10];
const WEAPON_BASE=14;

function budget(level){return 68+4*(level-1);}
function buildStats(level,key){
  const def=BUILDS[key];if(!def)throw new RangeError(`Unknown build: ${key}`);
  const stats=Object.fromEntries(ATTRIBUTES.map(id=>[id,8])),extra=budget(level)-56;
  if(def.primary)stats[def.primary]+=extra;
  else for(let point=0;point<extra;point++)stats[['int','vit','wil'][point%3]]++;
  return stats;
}
function totals(level,stats){
  // Remove equipment from the shared totals helper so this audit isolates attribute allocation.
  return G.totals({level,stats,gear:{},passive:null,mastery:{}});
}
function critChance(stats){
  return totals(1,stats).critChance;
}
function expectedDamage({level,power,accuracy,stats,coefficient=1}){
  const raw=(WEAPON_BASE+.9*power+4)*coefficient;
  const normal=Math.max(1,Math.floor(raw)),critical=Math.max(1,Math.floor(raw*1.25)),glance=Math.max(1,Math.floor(raw*.55));
  const referenceEvasion=24+2*level,hit=G.hitChance(accuracy,referenceEvasion),crit=critChance(stats);
  return {raw,hitChance:hit,critChance:crit,normal,critical,glance,expected:hit*((1-crit)*normal+crit*critical)+(1-hit)*glance};
}
function profile(level,stats,t){
  const might=expectedDamage({level,power:t.heavyPower,accuracy:t.physicalAcc,stats});
  const precision=expectedDamage({level,power:t.precisionPower,accuracy:t.physicalAcc,stats});
  const arcBolt=expectedDamage({level,power:t.spellPower,accuracy:t.spellAcc,stats,coefficient:1.25});
  return {might,precision,arcBolt};
}
function buildRow(level,key){
  const stats=buildStats(level,key),t=totals(level,stats);
  return {key,label:BUILDS[key].label,level,budget:budget(level),stats,totals:{hp:t.hp,mp:t.mp,sp:t.sp,physicalAcc:t.physicalAcc,spellAcc:t.spellAcc,evasion:t.evasion,heavyPower:t.heavyPower,precisionPower:t.precisionPower,spellPower:t.spellPower,mendHealing:t.mendHealing,critChance:t.critChance,equipmentDropChance:t.equipmentDropChance},referenceExpectedDamage:profile(level,stats,t)};
}

/** Reproducible stat-allocation and neutral-target estimates, not a PvP simulator. */
export function buildAudit(){
  return {schema:1,scope:'ESTIMATE · formula projection only; no PvP match, player-defense resolver, action economy, cooldown, resource, gear, or matchup simulation.',assumptions:{levels:LEVELS,builds:Object.keys(BUILDS),budget:'68 + 4 × (level − 1)',baseline:8,weaponBase:WEAPON_BASE,gearBonuses:0,masteryRank:1,referenceTarget:{armor:0,ward:0,evasion:'24 + 2 × level (all attributes at 8, no passive)'},damage:'floor(base + 0.9 × relevant power + 4), Arc Bolt ×1.25; glance 0.55×; critical 1.25× on solid hits only'},rows:LEVELS.flatMap(level=>Object.keys(BUILDS).map(key=>buildRow(level,key)))};
}

/** Exact one-point total deltas from the shared game formulas, plus isolated damage-score deltas. */
export function marginalAudit({level=1,stats=null}={}){
  if(!Number.isInteger(level)||level<1||level>10)throw new RangeError('Level must be an integer from 1 to 10');
  const base=stats?{...stats}:Object.fromEntries(ATTRIBUTES.map(id=>[id,8]));
  if(ATTRIBUTES.some(id=>!Number.isInteger(base[id])||base[id]<8))throw new TypeError('Stats must contain all seven integer values at least 8');
  const before=totals(level,base),baseProfile=profile(level,base,before);
  return Object.fromEntries(ATTRIBUTES.map(id=>{
    const next={...base,[id]:base[id]+1},after=totals(level,next),nextProfile=profile(level,next,after);
    return [id,{totals:Object.fromEntries(['hp','mp','sp','physicalAcc','spellAcc','evasion','heavyPower','precisionPower','spellPower','mendHealing'].map(key=>[key,after[key]-before[key]])),critChance:after.critChance-before.critChance,equipmentDropChance:after.equipmentDropChance-before.equipmentDropChance,referenceExpectedDamage:Object.fromEntries(['might','precision','arcBolt'].map(key=>[key,nextProfile[key].expected-baseProfile[key].expected]))}];
  }));
}

export const AUDIT_LEVELS=LEVELS;
export const AUDIT_BUILDS=Object.freeze(Object.fromEntries(Object.entries(BUILDS).map(([id,v])=>[id,v.label])));
