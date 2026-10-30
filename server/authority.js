import * as G from '../dist/engine.js';

// Reference request gate for FUTURE-DEVELOPMENT.md, Phase 2 (design/40, item 1). It is NOT deployed, NOT imported by
// the browser game or the lab, and NOT a secure online system by itself: there is no network, account provider or
// database here. It fixes the order of checks a real server must run around the shared engine, so that order can be
// tested now. The in-memory Maps stand in for a transactional database; a real deployment replaces each commit below
// with one database transaction and each Set of claim keys with a uniqueness constraint.
//
// Check order for every request: shape -> ownership -> action-ID replay -> version -> hold -> pacing -> engine run on a
// draft -> once-only reward keys -> commit. Each step either rejects with a code or passes; nothing is queued.

export const AUTHORITY_RULES_VERSION=1;
export const MAX_RECEIPTS_PER_CHARACTER=500;
export const MAX_LOG=1000;

const ID=/^[A-Za-z0-9_-]{1,64}$/;
const CHOICE=/^[a-z_]{1,32}$/;
const NAME=/^[\p{L}\p{N} '’.-]{1,40}$/u;
const REQUEST_KEYS=new Set(['accountId','characterId','actionId','expectedVersion','action','args']);
// Combat keys the engine's actionInfo recognises. tests/authority.test.mjs pins this list to the engine.
export const EXCHANGE_KEYS=Object.freeze(['attack','cast','combo','guard','recover','brace','disrupt','mend','driving','guardstrike','sidestep','aegis','expose','withdraw','vent']);
function deepFreeze(obj){for(const v of Object.values(obj))if(v&&typeof v==='object')deepFreeze(v);return Object.freeze(obj);}
const own=(obj,key)=>typeof key==='string'&&Object.prototype.hasOwnProperty.call(obj,key);
const TYPES={
  enemy:v=>typeof v==='string'&&G.ENEMIES.some(e=>e.id===v),
  actionKey:v=>EXCHANGE_KEYS.includes(v),
  attribute:v=>own(G.ATTRS,v),
  item:v=>own(G.ITEMS,v),
  slot:v=>own(G.SLOTS,v),
  contract:v=>own(G.STORY_CONTRACTS,v),
  choice:v=>typeof v==='string'&&CHOICE.test(v),
  boolean:v=>typeof v==='boolean'
};
// Every action the gate accepts. `economy` actions move coins and are frozen by an account hold (Shimlar's "checked"
// flag); `once` names the once-only reward key the action may grant; `paced` actions use the shared 650 ms delay.
export const ACTIONS=deepFreeze({
  startHunt:{args:{enemyId:'enemy',special:'boolean?'},run:(s,a,ctx)=>G.startFight(s,a.enemyId,'hunt',ctx.now,{special:a.special===true})},
  exchange:{args:{key:'actionKey'},paced:true,run:(s,a,ctx)=>G.exchange(s,a.key,ctx.rng,ctx.now)},
  allocate:{args:{attribute:'attribute'},run:(s,a)=>G.allocate(s,a.attribute)},
  buy:{args:{itemId:'item'},economy:true,run:(s,a)=>G.buy(s,a.itemId)},
  sell:{args:{itemId:'item'},economy:true,run:(s,a)=>G.sell(s,a.itemId)},
  equip:{args:{itemId:'item',slot:'slot'},run:(s,a)=>G.equip(s,a.itemId,a.slot)},
  storyAction:{args:{key:'choice'},run:(s,a)=>G.storyAction(s,a.key)},
  acceptContract:{args:{contractId:'contract'},run:(s,a)=>G.acceptContract(s,a.contractId)},
  claimContract:{args:{contractId:'contract',choice:'choice?'},economy:true,once:a=>`contract:${a.contractId}`,run:(s,a)=>G.claimContract(s,a.contractId,a.choice)},
  beginRest:{args:{},run:(s,a,ctx)=>G.beginRest(s,ctx.now)},
  finishRest:{args:{},run:(s,a,ctx)=>G.finishRest(s,ctx.now)}
});

function cryptoRng(){const buf=new Uint32Array(1);return ()=>{globalThis.crypto.getRandomValues(buf);return buf[0]/4294967296;};}
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const jsonSafe=v=>v===undefined?null:JSON.parse(JSON.stringify(v));
const accepted=r=>r!==false&&r!==null&&r!==undefined&&!(typeof r==='object'&&r.ok===false);

// Returns a field-level problem code, or null. Values are never echoed into logs: only field names and codes are kept.
function shapeProblem(req,actions){
  if(!plain(req))return 'request:not_object';
  for(const key of Object.keys(req))if(!REQUEST_KEYS.has(key))return `request:unknown_field:${key.slice(0,24).replace(/[^A-Za-z0-9_]/g,'?')}`;
  for(const key of ['accountId','characterId','actionId'])if(typeof req[key]!=='string'||!ID.test(req[key]))return `${key}:invalid`;
  if(!Number.isSafeInteger(req.expectedVersion)||req.expectedVersion<0)return 'expectedVersion:invalid';
  if(!own(actions,req.action))return 'action:unknown';
  const spec=actions[req.action].args,args=req.args??{};
  if(!plain(args))return 'args:not_object';
  for(const key of Object.keys(args))if(!own(spec,key))return `args:unknown_field:${key.slice(0,24).replace(/[^A-Za-z0-9_]/g,'?')}`;
  for(const [key,type] of Object.entries(spec)){
    const optional=type.endsWith('?'),check=TYPES[type.replace('?','')];
    if(args[key]===undefined){if(!optional)return `args.${key}:missing`;continue;}
    if(!check(args[key]))return `args.${key}:invalid`;
  }
  return null;
}
const fingerprint=req=>JSON.stringify([req.action,req.expectedVersion,Object.entries(req.args??{}).sort(([a],[b])=>a<b?-1:a>b?1:0)]);

// `actions` exists so tests can inject a faulty rule and prove the commit is refused; production passes nothing.
export function createAuthority({now=()=>Date.now(),rng=cryptoRng(),newId=null,actions=ACTIONS}={}){
  const characters=new Map(),holds=new Map(),audit=[],anomalies=[];let serial=0;
  const nextId=newId||(()=>`ch-${++serial}`);
  const push=(list,entry)=>{list.push(entry);if(list.length>MAX_LOG)list.shift();};
  // Anomalies are requests a correct client never sends. Too-early taps, stale versions and engine refusals are not
  // anomalies: fast or repeated clicking is normal play (AGENTS.md) and two open tabs legitimately race.
  const anomaly=(at,code,accountId,characterId)=>push(anomalies,{at,code,accountId:typeof accountId==='string'&&ID.test(accountId)?accountId:null,characterId:typeof characterId==='string'&&ID.test(characterId)?characterId:null});
  const reject=(code,extra={})=>({ok:false,code,...extra});
  const view=rec=>({version:rec.version,snapshot:structuredClone(rec.state)});

  function createCharacter(accountId,{name,race,kit}={}){
    if(typeof accountId!=='string'||!ID.test(accountId))return reject('malformed',{problem:'accountId:invalid'});
    if(name!==undefined&&(typeof name!=='string'||!NAME.test(name)))return reject('malformed',{problem:'name:invalid'});
    if(race!==undefined&&!G.RACES.some(r=>r.id===race))return reject('malformed',{problem:'race:invalid'});
    if(kit!==undefined&&!own(G.STARTER_KITS,kit))return reject('malformed',{problem:'kit:invalid'});
    const state=G.createCharacter({...(name?{name}:{}),...(race?{race}:{}),...(kit?{kit}:{})});if(!state)return reject('rejected');
    const characterId=nextId(),rec={characterId,ownerId:accountId,state,version:0,receipts:new Map(),claims:new Set(),encounterSeq:0,encounterId:null};
    characters.set(characterId,rec);push(audit,{at:now(),type:'create',accountId,characterId,version:0});
    return {ok:true,characterId,...view(rec)};
  }

  function read(accountId,characterId){
    const rec=characters.get(characterId);
    if(!rec||rec.ownerId!==accountId){anomaly(now(),'ownership',accountId,characterId);return reject('not_found');}
    return {ok:true,...view(rec)};
  }

  function submit(req){
    const at=now(),problem=shapeProblem(req,actions);
    if(problem){anomaly(at,`malformed:${problem}`,req?.accountId,req?.characterId);return reject('malformed',{problem});}
    const rec=characters.get(req.characterId);
    // A character owned by someone else is reported exactly like a missing one, so IDs cannot be probed.
    if(!rec||rec.ownerId!==req.accountId){anomaly(at,'ownership',req.accountId,req.characterId);return reject('not_found');}
    const print=fingerprint(req),prior=rec.receipts.get(req.actionId);
    if(prior){
      if(prior.fingerprint===print)return {...structuredClone(prior.receipt),replayed:true,...view(rec)};
      anomaly(at,'action_id_reused',req.accountId,req.characterId);return reject('action_id_reused',view(rec));
    }
    if(req.expectedVersion!==rec.version)return reject('stale',view(rec));
    const spec=actions[req.action],args=req.args??{};
    if(spec.economy&&holds.has(req.accountId))return reject('on_hold',{reason:'Coin-moving actions are paused on this account pending review.'});
    if(spec.paced){const retryAfterMs=G.actionDelayRemaining(rec.state,at);if(retryAfterMs)return reject('too_early',{retryAfterMs});}
    // The engine mutates the character it is given, so it runs on a draft. A refusal or an invariant failure discards it.
    const draft=structuredClone(rec.state);let result;
    try{result=spec.run(draft,args,{now:at,rng});}catch{anomaly(at,'engine_error',req.accountId,req.characterId);return reject('engine_error',view(rec));}
    if(!accepted(result))return reject('rejected',{reason:typeof result==='object'&&result?.reason||null,...(result?.retryAfterMs?{retryAfterMs:result.retryAfterMs}:{}),...view(rec)});
    let encounterId=rec.encounterId,encounterSeq=rec.encounterSeq;
    if(req.action==='startHunt'){encounterSeq++;encounterId=`${rec.characterId}:enc-${encounterSeq}`;}
    const claims=[];if(spec.once)claims.push(spec.once(args));
    if(req.action==='exchange'&&result.victory)claims.push(`victory:${encounterId}`);
    // Defence in depth: the engine already pays once, but a second grant for the same key aborts the whole commit.
    const dup=claims.find(k=>rec.claims.has(k));
    if(dup){anomaly(at,'duplicate_reward',req.accountId,req.characterId);return reject('duplicate_reward',view(rec));}
    if(req.action==='exchange'&&!draft.fight)encounterId=null;
    // Commit. In a database this block is one transaction guarded by `WHERE version = expectedVersion`.
    rec.state=draft;rec.version++;rec.encounterSeq=encounterSeq;rec.encounterId=encounterId;for(const k of claims)rec.claims.add(k);
    const receipt={ok:true,code:'accepted',actionId:req.actionId,action:req.action,version:rec.version,at,rulesVersion:AUTHORITY_RULES_VERSION,engineVersion:G.VERSION,result:jsonSafe(result),...(claims.length?{claims}:{})};
    rec.receipts.set(req.actionId,{fingerprint:print,receipt});
    // Eviction is safe: an evicted retry carries an old expectedVersion and is refused as stale, never applied twice.
    if(rec.receipts.size>MAX_RECEIPTS_PER_CHARACTER)rec.receipts.delete(rec.receipts.keys().next().value);
    push(audit,{at,type:'action',accountId:req.accountId,characterId:req.characterId,actionId:req.actionId,action:req.action,version:rec.version,engineVersion:G.VERSION,...(claims.length?{claims}:{})});
    return {...structuredClone(receipt),replayed:false,...view(rec)};
  }

  // Moderator hold (Shimlar's "checked" flag): freezes coin-moving actions, leaves play and reading untouched, and is audited.
  function setHold(accountId,on,{by,reason}={}){
    if(typeof accountId!=='string'||!ID.test(accountId)||typeof by!=='string'||!ID.test(by))return reject('malformed');
    if(on)holds.set(accountId,{since:now(),by,reason:typeof reason==='string'?reason.slice(0,200):''});else holds.delete(accountId);
    push(audit,{at:now(),type:on?'hold':'release',accountId,by});return {ok:true};
  }

  return {createCharacter,read,submit,setHold,
    auditTrail:()=>structuredClone(audit),anomalies:()=>structuredClone(anomalies),holdFor:id=>holds.has(id)?{...holds.get(id)}:null};
}
