import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

test('mana regenerates after accepted non-mana exchanges while stamina remains action-specific', () => {
  const s = G.fresh();
  assert.equal(G.totals(s).mp, 66);
  assert.equal(G.totals(s).sp, 65);
  s.mp = 0; s.sp = 0;
  assert.ok(G.startFight(s, 'rats'));
  assert.equal(s.mp, 3); assert.equal(s.sp, 3);
  const guard = G.exchange(s, 'guard', () => .2, 1000);
  assert.equal(guard.manaRegenerated, 2);
  assert.equal(s.mp, 5); assert.equal(s.sp, 5);
  const recover = G.exchange(s, 'recover', () => .2, 1650);
  assert.equal(recover.manaRegenerated, 2);
  assert.equal(s.mp, 15); assert.equal(s.sp, 15);
  assert.ok(s.log.some(entry => entry.text === 'Caught your breath · +2 Sparkle (mana).'));
});

test('free and stamina actions regenerate mana, mana spells do not, and actual gains respect the cap', () => {
  const attack = G.fresh(); G.startFight(attack, 'rats'); attack.mp = 0;
  assert.equal(G.exchange(attack, 'attack', () => .2, 1000).manaRegenerated, 2);
  assert.equal(attack.mp, 2);

  const physical = G.createCharacter({kit:'breaker'}); G.startFight(physical, 'rats');
  physical.mp = 0; physical.sp = 50;
  assert.equal(G.exchange(physical, 'guardstrike', () => .2, 1000).manaRegenerated, 2);
  assert.equal(physical.mp, 2);

  for (const action of ['cast','combo','mend']) {
    const caster=G.fresh();caster.learnedAbilities.push('mend');caster.equippedAbilities.push('mend');
    G.startFight(caster,'rats');caster.mp=G.actionInfo(caster,action).mp;
    const spell=G.exchange(caster,action,()=>.2,1000);
    assert.equal(spell.ok,true,action);
    assert.equal(spell.manaRegenerated,0,action);
    assert.equal(caster.mp,0,action);
    assert.ok(!caster.log.some(entry=>entry.text.startsWith('Caught your breath')),action);
  }

  const capped = G.fresh(); G.startFight(capped, 'rats');
  const max = G.totals(capped).mp; capped.mp = max - 1;
  const receipt = G.exchange(capped, 'guard', () => .2, 1000);
  assert.equal(receipt.manaRegenerated, 1);
  assert.equal(capped.mp, max);
  const full=G.exchange(capped,'guard',()=>.2,1650);
  assert.equal(full.manaRegenerated,0,'full mana gains nothing');
  assert.equal(capped.mp,max);
  capped.mp=max-1;capped.sp=G.totals(capped).sp;
  const almostFull=G.exchange(capped,'recover',()=>.2,2300);
  assert.equal(almostFull.manaRegenerated,0,'explicit recovery reaches the cap first');
  assert.equal(capped.mp,max);
  assert.ok(capped.log.some(entry=>entry.text==='Shake it off · recovered 1 Sparkle (mana) and 0 Bounce (stamina).'));
});

test('rejected and delay-blocked actions do not regenerate; a finishing exchange does and persists', () => {
  const s = G.fresh(); G.startFight(s, 'rats'); s.mp = 0;
  assert.equal(G.exchange(s, 'cast', () => .2, 1000).ok, false);
  assert.equal(s.mp, 0);
  assert.equal(G.exchange(s, 'attack', () => .2, 1000).manaRegenerated, 2);
  assert.equal(G.exchange(s, 'guard', () => .2, 1200).ok, false);
  assert.equal(s.mp, 2);

  const finisher = G.fresh(); G.startFight(finisher, 'rats'); finisher.mp = 0; finisher.fight.hp = 1;
  const last = G.exchange(finisher, 'attack', () => .2, 1000);
  assert.equal(last.victory, true);
  assert.equal(last.manaRegenerated, 2);
  assert.equal(finisher.mp, 2);
  assert.equal(G.loadSave(JSON.stringify(finisher)).mp, 2);
  assert.equal(G.exchange(finisher, 'attack', () => .2, 1650).ok, false);
});

test('every accepted zero-mana action regenerates once while clock time alone never does', () => {
  const actions = ['attack','guard','recover','brace','disrupt','driving','guardstrike','aegis','expose','withdraw','vent'];
  for (const key of actions) {
    const s = G.fresh();
    s.learnedAbilities = ['brace','disrupt','driving','aegis','expose'];
    s.equippedAbilities = ['arc','brace','disrupt','driving','aegis','expose'];
    if (key === 'vent') { s.delve={node:4,path:'records',campUsed:true};G.startFight(s, 'boss', 'delve'); s.fight.hp = 400; }
    else G.startFight(s, 'rats');
    s.mp = 0;
    const info = G.actionInfo(s, key);
    assert.equal(info.reason, null, `${key} is available in this setup`);
    const receipt = G.exchange(s, key, () => .2, 1000);
    assert.equal(receipt.ok, true, key);
    assert.equal(receipt.manaRegenerated, 2, key);
    assert.equal(s.mp, key === 'recover' ? 10 : 2, key);
  }

  const idle = G.fresh(); G.startFight(idle, 'rats'); idle.mp = 0;
  G.restStatus(idle, 1000 + 60 * 60 * 1000);
  assert.equal(idle.mp, 0, 'elapsed time and status reads do not regenerate mana');
});

test('rest requires explicit completion after four seconds and does not advance on load or status reads', () => {
  const s = G.fresh(); s.hp -= 20; s.mp -= 10;
  const begun = G.beginRest(s, 1000);
  assert.deepEqual(begun, { readyAt: 5000 });
  assert.equal(G.startFight(s, 'rats', 'hunt', 1000), false);
  assert.equal(G.finishRest(s, 4999), false);
  const raw = JSON.stringify(s);
  assert.equal(G.restStatus(s, 4000).remainingMs, 1000);
  const loaded = G.loadSave(raw);
  assert.equal(loaded.restReadyAt, 5000);
  assert.equal(loaded.hp, s.hp);
  assert.equal(G.finishRest(loaded, 5000), true);
  assert.equal(loaded.hp, G.totals(loaded).hp);
  assert.equal(loaded.restReadyAt, 0);
});

test('rest blocks while full, fighting, or delving; cancel grants no recovery', () => {
  const s = G.fresh();
  assert.equal(G.beginRest(s, 1000), false);
  s.mp -= 1; assert.ok(G.startFight(s, 'rats'));
  assert.equal(G.beginRest(s, 1000), false);
  s.fight = null; s.mp -= 5;
  assert.ok(G.beginRest(s, 1000));
  const before = [s.hp, s.mp, s.sp];
  assert.equal(G.cancelRest(s), true);
  assert.equal(G.cancelRest(s), false);
  assert.deepEqual([s.hp, s.mp, s.sp], before);
});

test('defeat charges five percent of carried coins up to fifty and persists one wound timestamp', () => {
  const s = G.fresh(); s.coins = 400; s.hp = 1;
  assert.ok(G.startFight(s, 'rats'));
  const receipt = G.exchange(s, 'guard', () => .2, 1000);
  assert.equal(receipt.defeat, true);
  assert.equal(receipt.coinsLost, 20);
  assert.equal(receipt.recoveryReadyAt, 13000);
  assert.equal(s.coins, 380);
  const loaded = G.loadSave(JSON.stringify(s));
  assert.equal(G.startFight(loaded, 'rats', 'hunt', 2000), false);
  assert.equal(G.beginRest(loaded, 2000).readyAt, 13000);
  assert.equal(G.finishRest(loaded, 12999), false);
  assert.equal(G.finishRest(loaded, 13000), true);
  assert.equal(loaded.woundedUntil, 0);
  assert.equal(loaded.coins, 380);
});

test('death penalty caps at fifty coins, is zero for an empty purse, and repeated actions do not repeat it', () => {
  for (const [coins, lost] of [[5000, 50], [0, 0]]) {
    const s = G.fresh(); s.coins = coins; s.hp = 1;
    G.startFight(s, 'rats');
    const receipt = G.exchange(s, 'guard', () => .2, 1000);
    assert.equal(receipt.coinsLost, lost);
    assert.equal(s.coins, coins - lost);
    assert.equal(G.exchange(s, 'guard', () => .2, 2000).ok, false);
    assert.equal(s.coins, coins - lost);
  }
});

test('a rest begun during wounds shares the wound deadline and full heal helpers preserve wounds', () => {
  const s = G.fresh(); s.hp -= 10; s.woundedUntil = 15000;
  assert.deepEqual(G.beginRest(s, 5000), { readyAt: 15000 });
  assert.equal(G.finishRest(s, 14999), false);
  assert.equal(G.finishRest(s, 15000), true);
  s.woundedUntil = 17000; s.hp -= 1;
  assert.equal(G.restore(s), true);
  assert.equal(s.woundedUntil, 17000);
  assert.equal(G.startFight(s, 'rats', 'hunt', 16000), false);
});

test('repeated allocate and respec cycles cannot refill current resources', () => {
  const s = G.fresh();
  s.points = 30;
  s.hp -= 80; s.mp -= 20; s.sp -= 20;
  const current = [s.hp, s.mp, s.sp];
  for (const key of ['vit', 'vit', 'wil', 'int', 'fin']) {
    assert.equal(G.allocate(s, key), true);
    assert.deepEqual([s.hp, s.mp, s.sp], current);
  }
  for (let n = 0; n < 5; n++) {
    assert.equal(G.resetStats(s), true);
    for (const key of ['vit', 'wil', 'int', 'fin']) assert.equal(G.allocate(s, key), true);
    assert.deepEqual([s.hp, s.mp, s.sp], current);
  }
});

test('delve entry is blocked by pending rest, a wound, or zero health', () => {
  const s = G.fresh(); s.level = 6; s.clears = 1;
  s.mp -= 1; assert.ok(G.beginRest(s, 1000));
  assert.equal(G.startDelve(s), false);
  G.cancelRest(s); s.woundedUntil = Date.now() + 12_000;
  assert.equal(G.startDelve(s), false);
  s.woundedUntil = 0; s.hp = 0;
  assert.equal(G.startDelve(s), false);
  s.hp = 1;
  assert.equal(G.startDelve(s), true);
});
