import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

// Applied damage versus overkill (design/40, item 3). Injected clock and fixed rolls only.
const rng=()=>.2;
const step=(s,key)=>G.exchange(s,key,rng,Math.max(1000,s.nextActionAt||0));

test('a finishing blow reports the attempted damage, the HP it actually removed, and the overkill',()=>{
  const s=G.fresh();assert.ok(G.startFight(s,'rats'));s.fight.hp=4;
  const r=step(s,'attack');
  assert.ok(r.victory);assert.ok(r.damage>4,'fixture hit must exceed the remaining HP');
  assert.equal(r.damageApplied,4);assert.equal(r.overkill,r.damage-4);
  const line=s.log.find(row=>row.kind==='attack').text;
  assert.match(line,new RegExp(`: ${r.damage} physical damage · only 4 needed\\.$`));
});

test('an ordinary hit applies all of its damage and adds no overkill note',()=>{
  const s=G.fresh();assert.ok(G.startFight(s,'rats'));
  const before=s.fight.hp,r=step(s,'attack');
  assert.ok(r.ok&&!r.victory);assert.equal(r.damageApplied,r.damage);assert.equal(before-s.fight.hp,r.damage);
  assert.doesNotMatch(s.log.find(row=>row.kind==='attack').text,/needed/);
});

test('a killing enemy blow reports what it actually removed from the player',()=>{
  const s=G.fresh();assert.ok(G.startFight(s,'rats'));s.hp=3;
  const r=step(s,'attack');
  assert.ok(r.defeat);assert.ok(r.incoming>3);
  assert.equal(r.incomingApplied,3);assert.equal(r.incomingOverkill,r.incoming-3);
  assert.match(s.log.find(row=>row.kind==='enemy').text,/ · only 3 needed\.$/);
});

test('lab telemetry still sums attempted damage, overkill included',async()=>{
  const L=await import('../dist/lab.js');
  const session=L.createLabSession({scenarioId:'routine_repetition',seed:'overkill'});
  assert.ok(L.startLabHunt(session,'rats',1000));session.character.fight.hp=1;
  const r=L.labAction(session,'attack',2000);
  assert.ok(r.victory);assert.equal(session.damageAttempted,r.damage);assert.equal(r.damageApplied,1);
});
