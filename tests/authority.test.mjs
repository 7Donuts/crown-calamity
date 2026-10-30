import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import {createAuthority,ACTIONS,EXCHANGE_KEYS} from '../server/authority.js';

// Reference Phase 2 request gate (design/40 item 1; FUTURE-DEVELOPMENT.md Phase 2). Injected clock and fixed rolls only.

function harness(extra={}){
  const clock={t:10_000},auth=createAuthority({now:()=>clock.t,rng:()=>.2,...extra});
  const made=auth.createCharacter('acct-a',{name:'Gate Tester',kit:'breaker'});assert.equal(made.ok,true);
  let n=0,version=0;
  const send=(action,args={},over={})=>{const r=auth.submit({accountId:'acct-a',characterId:made.characterId,actionId:`act-${++n}`,expectedVersion:version,action,args,...over});if(r.ok)version=r.version;return r;};
  const tick=(ms=G.ACTION_DELAY_MS)=>{clock.t+=ms;};
  // Fight one rat swarm to a real victory through the gate, then rest through the gate if needed.
  const win=(enemyId='rats')=>{
    assert.equal(send('startHunt',{enemyId}).ok,true);let r;
    for(let i=0;i<40;i++){tick();r=send('exchange',{key:'attack'});assert.equal(r.ok,true,r.code);if(r.result.victory||r.result.defeat)break;}
    assert.equal(r.result.victory,true,'fixture wins');
    if(r.snapshot.hp<200){assert.equal(send('beginRest').ok,true);tick(G.REST_DURATION_MS);assert.equal(send('finishRest').ok,true);}
    return r;
  };
  return {auth,clock,made,send,tick,win,get version(){return version;},nextId:()=>`act-${n+1}`};
}

test('every allowlisted exchange key is one the engine recognises',()=>{
  const s=G.fresh();assert.ok(G.startFight(s,'rats','hunt',1000));
  for(const key of EXCHANGE_KEYS)assert.ok(G.actionInfo(s,key),key);
  assert.ok(!G.actionInfo(s,'bogus'));
  assert.ok(Object.isFrozen(ACTIONS)&&Object.isFrozen(ACTIONS.exchange),'the production action table cannot be patched at runtime');
});

test('an accepted action commits once, bumps the version, and returns a receipt with the server time',()=>{
  const h=harness();
  const r=h.send('startHunt',{enemyId:'rats'});
  assert.equal(r.ok,true);assert.equal(r.code,'accepted');assert.equal(r.version,1);assert.equal(r.at,10_000);assert.equal(r.replayed,false);
  assert.equal(r.snapshot.fight.enemy,'rats');assert.equal(r.engineVersion,G.VERSION);
  const audit=h.auth.auditTrail();assert.deepEqual(audit.map(a=>a.type),['create','action']);
});

test('a retried action ID returns the original receipt without a second exchange; a different payload is refused',()=>{
  const h=harness();h.send('startHunt',{enemyId:'rats'});h.tick();
  const id=h.nextId(),req={accountId:'acct-a',characterId:h.made.characterId,actionId:id,expectedVersion:1,action:'exchange',args:{key:'attack'}};
  const first=h.auth.submit(req);assert.equal(first.ok,true);
  h.tick(5_000);
  const again=h.auth.submit(structuredClone(req));
  assert.equal(again.replayed,true);assert.equal(again.version,first.version);assert.equal(again.at,first.at);assert.deepEqual(again.result,first.result);
  assert.equal(again.snapshot.fight.round,1,'the retry resolved no second exchange');
  const reused=h.auth.submit({...req,args:{key:'guard'}});
  assert.equal(reused.code,'action_id_reused');assert.equal(h.auth.anomalies().at(-1).code,'action_id_reused');
});

test('stale versions are refused with the current snapshot and are not treated as abuse',()=>{
  const h=harness();h.send('startHunt',{enemyId:'rats'});
  const r=h.auth.submit({accountId:'acct-a',characterId:h.made.characterId,actionId:'other-tab',expectedVersion:0,action:'exchange',args:{key:'attack'}});
  assert.equal(r.code,'stale');assert.equal(r.version,1);assert.equal(r.snapshot.fight.round,0);
  assert.equal(h.auth.anomalies().length,0);
});

test('the shared delay uses server time, is never queued, and survives a new encounter',()=>{
  const h=harness();h.send('startHunt',{enemyId:'rats'});
  assert.equal(h.send('exchange',{key:'attack'}).ok,true);
  h.tick(100);
  const early=h.send('exchange',{key:'guard'});
  assert.equal(early.code,'too_early');assert.equal(early.retryAfterMs,G.ACTION_DELAY_MS-100);
  assert.equal(h.auth.read('acct-a',h.made.characterId).snapshot.fight.round,1,'nothing was queued');
  const forged=h.send('exchange',{key:'attack'},{at:0});assert.equal(forged.code,'malformed','a client timestamp is not a field');
  h.tick(G.ACTION_DELAY_MS);assert.equal(h.send('exchange',{key:'withdraw'}).ok,true);
  assert.equal(h.send('startHunt',{enemyId:'rats'}).ok,true);
  assert.equal(h.send('exchange',{key:'attack'}).code,'too_early','starting another encounter does not reset the delay');
  assert.equal(h.auth.anomalies().filter(a=>a.code!=='malformed:request:unknown_field:at').length,0,'early taps are not anomalies');
});

test('another account cannot read or act on a character, and gets the same answer as for a missing one',()=>{
  const h=harness(),id=h.made.characterId;
  const theirs=h.auth.submit({accountId:'acct-b',characterId:id,actionId:'x1',expectedVersion:0,action:'startHunt',args:{enemyId:'rats'}});
  const missing=h.auth.submit({accountId:'acct-b',characterId:'ch-404',actionId:'x2',expectedVersion:0,action:'startHunt',args:{enemyId:'rats'}});
  assert.deepEqual(theirs,{ok:false,code:'not_found'});assert.deepEqual(missing,theirs);
  assert.deepEqual(h.auth.read('acct-b',id),{ok:false,code:'not_found'});
  assert.equal(h.auth.read('acct-a',id).version,0);
  assert.equal(h.auth.anomalies().filter(a=>a.code==='ownership').length,3);
});

test('malformed requests are refused and logged by field name, never by the submitted value',()=>{
  const h=harness(),base={accountId:'acct-a',characterId:h.made.characterId,actionId:'m1',expectedVersion:0};
  const cases=[
    [{...base,action:'grantCoins',args:{}},'action:unknown'],
    [{...base,action:'startHunt',args:{enemyId:'dragon'}},'args.enemyId:invalid'],
    [{...base,action:'startHunt',args:{enemyId:'boss',special:'yes'}},'args.special:invalid'],
    [{...base,action:'exchange',args:{key:'attack',damage:999999}},'args:unknown_field:damage'],
    [{...base,action:'exchange',args:{}},'args.key:missing'],
    [{...base,expectedVersion:0.5,action:'exchange',args:{key:'attack'}},'expectedVersion:invalid'],
    [{...base,actionId:'<script>alert(1)</script>',action:'exchange',args:{key:'attack'}},'actionId:invalid'],
    [{...base,action:'buy',args:{itemId:'__proto__'}},'args.itemId:invalid'],
    [{...base,action:'exchange',args:[]},'args:not_object'],
    [null,'request:not_object']
  ];
  for(const [req,problem] of cases){const r=h.auth.submit(req);assert.equal(r.code,'malformed',problem);assert.equal(r.problem,problem);}
  const logged=JSON.stringify(h.auth.anomalies());
  for(const value of ['999999','<script>','dragon','grantCoins'])assert.equal(logged.includes(value),false,value);
  assert.equal(h.auth.read('acct-a',h.made.characterId).version,0);
  assert.equal(h.auth.createCharacter('acct-c',{name:'<b>Bold</b>'}).code,'malformed');
});

test('an engine refusal leaves the character and version untouched',()=>{
  const h=harness(),before=h.auth.read('acct-a',h.made.characterId);
  const r=h.send('buy',{itemId:'floodrod'});
  assert.equal(r.code,'rejected');assert.equal(r.version,0);assert.deepEqual(r.snapshot,before.snapshot);
  assert.equal(h.send('exchange',{key:'attack'}).code,'rejected','no fight to act in');
});

test('a moderator hold freezes coin-moving actions only, and is audited',()=>{
  const h=harness();
  assert.equal(h.auth.setHold('acct-a',true,{by:'mod-1',reason:'Unusual transfer pattern'}).ok,true);
  assert.equal(h.send('buy',{itemId:'floodrod'}).code,'on_hold');
  assert.equal(h.send('startHunt',{enemyId:'rats'}).ok,true,'play continues during a hold');
  assert.equal(h.send('exchange',{key:'withdraw'}).ok,true);
  assert.equal(h.auth.setHold('acct-a',false,{by:'mod-1'}).ok,true);
  assert.notEqual(h.send('buy',{itemId:'floodrod'}).code,'on_hold');
  assert.deepEqual(h.auth.auditTrail().filter(a=>a.type==='hold'||a.type==='release').map(a=>[a.type,a.by]),[['hold','mod-1'],['release','mod-1']]);
});

test('victories and contract claims record once-only reward keys across a full story step',()=>{
  const h=harness();
  assert.equal(h.send('storyAction',{key:'meet_mara'}).ok,true);
  assert.equal(h.send('acceptContract',{contractId:'proof_of_trouble'}).ok,true);
  const keys=[];for(let n=0;n<3;n++)keys.push(...h.win().claims);
  assert.deepEqual(keys,['victory:ch-1:enc-1','victory:ch-1:enc-2','victory:ch-1:enc-3']);
  const claim=h.send('claimContract',{contractId:'proof_of_trouble',choice:'coins'});
  assert.equal(claim.ok,true);assert.deepEqual(claim.claims,['contract:proof_of_trouble']);
  const coins=claim.snapshot.coins,second=h.send('claimContract',{contractId:'proof_of_trouble',choice:'coins'});
  assert.equal(second.code,'rejected');assert.equal(second.snapshot.coins,coins);
});

test('a faulty rule that grants a once-only reward twice, or throws, cannot commit',()=>{
  const leaky={...ACTIONS,claimContract:{...ACTIONS.claimContract,run:s=>{s.coins+=500;return true;}},exchange:{...ACTIONS.exchange,run:()=>{throw new Error('boom');}}};
  const h=harness({actions:leaky});
  const first=h.send('claimContract',{contractId:'proof_of_trouble'});assert.equal(first.ok,true);
  const coins=first.snapshot.coins,again=h.send('claimContract',{contractId:'proof_of_trouble'});
  assert.equal(again.code,'duplicate_reward');assert.equal(again.snapshot.coins,coins);assert.equal(again.version,first.version);
  h.send('startHunt',{enemyId:'rats'});h.tick();
  const crashed=h.send('exchange',{key:'attack'});assert.equal(crashed.code,'engine_error');assert.equal(crashed.snapshot.fight.round,0);
  assert.deepEqual(h.auth.anomalies().map(a=>a.code),['duplicate_reward','engine_error']);
});
