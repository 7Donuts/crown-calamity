import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES, actionInfo, actionProfile, exchange, fresh, recoverProfile, startFight, totals } from '../dist/engine.js';
import { RELIC_EFFECTS, relicBonuses } from '../dist/relics.js';
import { ITEMS } from '../dist/gear.js';
import { SHIELD_IDS, isShield, sidestepEligible } from '../dist/telegraph.js';

test('all ten catalog relics expose a named unique effect and core plus echo strength diminishes', () => {
  const ids = ['signet','seal','threadSpool','patchworkHeart','luckyButton','dreamBell','thimbleGuard','amberMarble','ribbonKnot','stuffingSatchel'];
  for (const id of ids) {
    assert.ok(RELIC_EFFECTS[id]?.desc, id + ' has an authored effect');
    assert.equal(ITEMS[id].relicEffect,id);
    assert.match(ITEMS[id].desc,new RegExp(RELIC_EFFECTS[id].desc.split(/[.!]/)[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
  }
  const s = { bag: ids, coins: 1e9, gear: { relic: 'amberMarble' },
    relicSockets: [{ unlocked:true },{unlocked:true},{unlocked:true}] };
  s.relicSockets[0].relicId='amberMarble';s.relicSockets[0].copiesPaid={amberMarble:1};
  s.relicSockets[1].relicId='amberMarble';s.relicSockets[1].copiesPaid={amberMarble:1};
  s.relicSockets[2].relicId='amberMarble';s.relicSockets[2].copiesPaid={amberMarble:1};
  assert.equal(relicBonuses(s).effects.amberMarble,1.875);
});

test('Amber Marble adds its bounded bonus to only the first damaging action in a fight', () => {
  const s=fresh();s.gear.relic='amberMarble';s.bag.push('amberMarble');
  assert.equal(startFight(s,'rats'),true);
  s.gear.weapon='sword';s.gear.offhand='shield';
  const invalid=exchange(s,'cast',()=>0,900);
  assert.equal(invalid.ok,false);
  assert.equal(s.fight.amberMarbleUsed,undefined);
  const firstProfile=actionProfile(s,'attack');
  const first=exchange(s,'attack',()=>0,1000);
  assert.equal(first.damage,firstProfile.critical);
  const nextProfile=actionProfile(s,'attack');
  const next=exchange(s,'attack',()=>0,2000);
  assert.equal(next.damage,nextProfile.critical);
  assert.equal(firstProfile.normal-nextProfile.normal,3);
});

test('recovery and Mend previews include their relic effects and live results use those shared profiles', () => {
  const s=fresh();s.gear.relic='signet';s.gear.weapon='sword';s.bag.push('signet');
  assert.deepEqual(recoverProfile(s),{mana:10,stamina:10,passiveMana:2});
  assert.match(actionInfo(s,'recover').desc,/10 Sparkle .* 10 Bounce .* 12 total/);
  s.passive=null;s.mp=0;s.sp=0;assert.equal(startFight(s,'rats'),true);
  const recover=exchange(s,'recover',()=>0,1000);
  assert.equal(recover.manaRegenerated,2);
  assert.equal(s.mp,12);

  const m=fresh();m.gear.relic='stuffingSatchel';m.bag.push('stuffingSatchel');
  const plain=totals({...m,gear:{...m.gear,relic:null}}).mendHealing;
  const expected=Math.floor((40+1.4*totals(m).int+.8*totals(m).wil+5)*1.1);
  assert.equal(totals(m).mendHealing,expected);
  m.learnedAbilities.push('mend');m.equippedAbilities.push('mend');m.hp=totals(m).hp-250;
  assert.equal(startFight(m,'rats'),true);
  assert.equal(exchange(m,'mend',()=>0,1000).healed,expected);
  assert.ok(expected>plain);
});

test('Seal echoes increase one useful-Guard barrier grant without granting another proc', () => {
  const s=fresh();s.gear.relic='seal';s.bag.push('seal');
  s.relicSockets=Array.from({length:3},()=>({unlocked:true,relicId:'seal',copiesPaid:{seal:1}}));
  assert.equal(relicBonuses(s).effects.seal,1.875);
  assert.equal(startFight(s,'rats'),true);s.fight.round=2;s.sp=0;
  exchange(s,'guard',()=>0,1000);
  assert.ok(s.log.some(x=>x.text.includes(`${ITEMS.seal.name} grants 28 barrier`)));
  s.fight.round=2;exchange(s,'guard',()=>0,2000);
  assert.equal(s.log.filter(x=>x.text.includes(`${ITEMS.seal.name} grants`)).length,1);
  assert.equal(s.fight.sealUsed,true);
});

test('Thread Spool and Thimble Guard trigger once on a useful Guard and respect resource and barrier caps',()=>{
  const s=fresh();s.passive=null;s.gear.relic='threadSpool';s.bag.push('threadSpool');
  assert.equal(startFight(s,'rats'),true);s.fight.round=2;s.sp=0;
  exchange(s,'guard',()=>0,1000);assert.equal(s.sp,4,'2 relic Bounce and 2 Guard Bounce');
  s.sp=0;s.fight.round=2;exchange(s,'guard',()=>0,2000);assert.equal(s.sp,2,'the relic effect is once per fight');

  const t=fresh();t.passive=null;t.gear.relic='thimbleGuard';t.bag.push('thimbleGuard');
  t.relicSockets=Array.from({length:3},()=>({unlocked:true,relicId:'thimbleGuard',copiesPaid:{thimbleGuard:1}}));
  assert.equal(startFight(t,'rats'),true);t.fight.round=2;
  exchange(t,'guard',()=>0,1000);
  assert.ok(t.log.some(x=>x.text.includes('Thimble Guard added 7 barrier')));
  t.fight.round=2;exchange(t,'guard',()=>0,2000);
  assert.equal(t.log.filter(x=>x.text.includes('Thimble Guard added')).length,1);
});

test('victory relics heal only missing resources and Lucky Button has a bounded minimum',()=>{
  const win=(id,enemy='rats')=>{const s=fresh();s.passive=null;s.gear.relic=id;s.bag.push(id);assert.equal(startFight(s,enemy),true);s.fight.hp=1;return s;};
  const heart=win('patchworkHeart'),heartCap=totals(heart).hp;heart.hp=heartCap-100;
  exchange(heart,'attack',()=>0,1000);assert.equal(heart.hp,heartCap-95,'heart restores 5% of the missing health');
  const heartCapCase=win('patchworkHeart'),healthMax=totals(heartCapCase).hp;heartCapCase.hp=healthMax-2;
  exchange(heartCapCase,'attack',()=>0,1000);assert.equal(heartCapCase.hp,healthMax-2,'a tiny missing-health deficit cannot produce an oversized heal');

  const lucky=win('luckyButton');exchange(lucky,'attack',()=>0,1000);
  const ratsCoins=ENEMIES.find(enemy=>enemy.id==='rats').coins;
  const ratBonus=Math.min(Math.max(1,Math.floor(ratsCoins*.25)),Math.max(1,Math.floor(ratsCoins*.05)));
  assert.equal(lucky.last.coins,ratsCoins+ratBonus,'the live rat reward and floored 25% cap determine its coin receipt');
  assert.equal(ratBonus,1,'a small rat payout still receives the one coin minimum');
  assert.equal(lucky.last.coins<=ratsCoins+Math.max(1,Math.floor(ratsCoins*.25)),true,'the small-reward bonus stays within its rounded 25% cap');

  const bell=win('dreamBell'),manaCap=totals(bell).mp;bell.mp=manaCap-10;
  exchange(bell,'attack',()=>0,1000);assert.equal(bell.mp,manaCap-6,'two action-regeneration mana plus two victory mana');
  const bellCapCase=win('dreamBell'),cap=totals(bellCapCase).mp;bellCapCase.mp=cap-1;
  exchange(bellCapCase,'attack',()=>0,1000);assert.equal(bellCapCase.mp,cap,'victory mana cannot exceed its cap');
});

test('Ribbon Knot restores mana on free physical strikes',()=>{
  const s=fresh();s.passive=null;s.gear.weapon='sword';s.gear.relic='ribbonKnot';s.bag.push('ribbonKnot');s.mp=0;
  assert.equal(startFight(s,'rats'),true);
  exchange(s,'attack',()=>0,1000);
  assert.equal(s.mp,3,'one from Ribbon Knot and two from normal action regeneration');
});

test('every catalog shield enables shield actions and prevents Sidestep eligibility', () => {
  assert.deepEqual(SHIELD_IDS,['shield','gateShield','quiltBuckler','buttonShield']);
  for(const id of SHIELD_IDS){
    assert.equal(isShield(id),true);
    const s=fresh();s.gear.weapon='rod';s.gear.offhand=id;s.bag.push(id);
    assert.equal(startFight(s,'rats'),true);
    assert.equal(actionInfo(s,'combo').reason,null,id+' enables Wardcast');
    s.gear.weapon='sword';s.learnedAbilities.push('driving');s.equippedAbilities.push('driving');
    assert.equal(actionInfo(s,'guardstrike').reason,null,id+' enables Guardstrike');
    assert.equal(sidestepEligible('precision',id),false,id+' disables Sidestep');
  }
});
