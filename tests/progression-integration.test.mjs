import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as C from '../dist/characters.js';
import {sellItem as gearSellItem} from '../dist/gear.js';

const oldLevelXP=level=>100+40*(level-1)+8*(level-1)**2;
const invested=stats=>Object.values(stats).reduce((sum,n)=>sum+n,0);

test('a completed level grants four points and keeps the existing XP curve',()=>{
  const s=G.fresh();assert.equal(G.VERSION,5);assert.equal(G.xpNeeded(1),oldLevelXP(1)*3);
  assert.equal(G.progression(s).levelRequired,300);assert.equal('part' in s,false);
  G.awardXP(s,299);assert.equal(s.points,0);assert.equal(s.level,1);
  G.awardXP(s,1);assert.equal(s.level,2);assert.equal(s.points,4);assert.equal(s.xp,0);
  assert.equal(G.progression(s).totalEarned,4);
});

test('one XP award crosses several full levels and stops at the cap',()=>{
  const s=G.fresh();G.awardXP(s,600);assert.equal(s.level,2);assert.equal(s.xp,300);assert.equal(s.points,4);
  G.awardXP(s,100000);assert.equal(s.level,10);assert.equal(s.xp,0);assert.equal(s.points,36);
  assert.equal(G.progression(s).totalEarned,36);G.awardXP(s,100000);assert.equal(s.points,36);
});

test('progression reads and explicit recovery do not grant points or hidden XP',()=>{
  const s=G.fresh();G.awardXP(s,121);
  s.hp=Math.max(1,s.hp-20);const before={xp:s.xp,points:s.points,level:s.level};
  for(let i=0;i<100;i++)G.progression(s);assert.equal(G.restore(s),true);
  for(let i=0;i<100;i++)G.progression(s);
  assert.deepEqual({xp:s.xp,points:s.points,level:s.level},before);assert.equal(s.totalExchanges,0);
});

test('v1–3 XP normalization and v4 part awards migrate once without loss or duplicate credit',()=>{
  for(const version of [1,2,3]){
    const s=G.fresh();s.version=version;s.level=3;s.stats.mig+=8;s.points=0;
    if(version===1)delete s.stats.lck;
    const oldXP=Math.floor(oldLevelXP(s.level)/2);s.xp=oldXP;
    const loaded=G.loadSave(JSON.stringify(s));assert.ok(loaded,`v${version} migrates`);
    assert.equal(loaded.version,5);assert.equal(loaded.xp,Math.round(oldXP/oldLevelXP(loaded.level)*G.xpNeeded(loaded.level)));
    assert.equal(loaded.levelPointsPaid,2);assert.equal(loaded.points,2);
    assert.equal(invested(loaded.stats)+loaded.points,68+4*(loaded.level-1)+2);
    assert.equal('part' in loaded,false);
    const roundtrip=G.loadSave(JSON.stringify(loaded));assert.equal(roundtrip.points,loaded.points);assert.equal(roundtrip.levelPointsPaid,2);
  }
  const v4=G.fresh();v4.version=4;v4.xp=150;v4.part=3;v4.points=1;v4.stats.mig++;
  const loaded=G.loadSave(JSON.stringify(v4));assert.ok(loaded);assert.equal(loaded.xp,150);assert.equal(loaded.points,1);assert.equal(loaded.levelPointsPaid,2);
  G.awardXP(loaded,G.xpNeeded(1)-loaded.xp);assert.equal(loaded.points,3);assert.equal(loaded.levelPointsPaid,0);
});

test('level-cap migration and later XP cannot exceed earned points',()=>{
  const s=G.fresh();s.version=3;s.level=10;s.stats.mig+=36;s.points=0;s.xp=oldLevelXP(10)-1;delete s.part;
  const loaded=G.loadSave(JSON.stringify(s));assert.ok(loaded);assert.equal(loaded.level,10);assert.equal(loaded.xp,0);assert.equal(loaded.points,0);
  G.awardXP(loaded,1_000_000);assert.equal(loaded.points,0);assert.equal(loaded.xp,0);assert.equal(G.progression(loaded).totalEarned,36);
});

test('character creation grants the selected kit without legacy progress fields',()=>{
  for(const [kit,starter] of Object.entries(G.STARTER_KITS)){
    const s=G.createCharacter({name:`${kit} runner`,race:'Stonekin',origin:'Canal clerk',kit});
    assert.ok(s,kit);assert.equal(s.version,5);assert.equal(s.levelPointsPaid,0);assert.equal('part' in s,false);assert.equal(s.coins,20);
    assert.deepEqual(s.bag,[...starter.gear,'coat']);assert.equal(s.gear.weapon,starter.gear[0]);assert.equal(s.gear.offhand,starter.gear[1]);assert.equal(s.gear.body,'coat');
    assert.equal(invested(s.stats),68);assert.equal(s.points,0);assert.equal(G.progression(s).totalEarned,0);
  }
  for(const invalid of [{name:''},{race:'Canalborn'},{origin:''},{kit:'not-a-kit'}])assert.equal(G.createCharacter(invalid),null);
});

test('characters keep coins, gear, materials, and progression isolated across create, switch, and roster reload',()=>{
  const roster=C.emptyRoster();
  const first=C.createRosterCharacter(roster,{name:'Ada',race:'Human',kit:'caster'},null);
  assert.ok(first);assert.equal(roster.activeId,first.id);
  first.state.coins=7;first.state.materials['Ledger scraps']=4;first.state.bag.push('cap');first.state.xp=93;
  const second=C.createRosterCharacter(roster,{name:'Bram',race:'Stonekin',kit:'breaker'},first.state);
  assert.ok(second);assert.equal(roster.characters.length,2);assert.equal(roster.activeId,second.id);
  assert.equal(second.state.coins,20);assert.deepEqual(second.state.materials,{});assert.deepEqual(second.state.bag,['sword','shield','coat']);
  second.state.coins=3;second.state.materials['Canal iron']=2;second.state.xp=21;
  const restored=C.switchCharacter(roster,first.id,second.state);
  assert.equal(restored.name,'Ada');assert.equal(restored.coins,7);assert.equal(restored.materials['Ledger scraps'],4);assert.equal(restored.xp,93);assert.equal('part' in restored,false);
  assert.equal(restored.bag.includes('cap'),true);assert.equal(roster.activeId,first.id);
  const serialized=JSON.stringify(roster),loaded=C.loadRoster(serialized);
  assert.equal(loaded.activeId,first.id);assert.equal(loaded.characters.length,2);
  const storedSecond=loaded.characters.find(entry=>entry.id===second.id).state;
  assert.equal(storedSecond.coins,3);assert.deepEqual(storedSecond.materials,{'Canal iron':2});assert.equal(storedSecond.xp,21);
  assert.equal(C.MAX_CHARACTERS,6);
});

test('starter practice cannot conjure a previously sold kit item back into the character',()=>{
  const s=G.createCharacter({name:'Tavi',kit:'caster'});
  assert.equal(s.coins,20);assert.equal(s.bag.includes('sword'),false);s.coins=100;
  assert.equal(G.buy(s,'sword'),true);assert.equal(s.coins,100-G.ITEMS.sword.price);
  assert.ok(gearSellItem(s,'sword'));assert.equal(s.bag.includes('sword'),false);
  const before=structuredClone(s);
  assert.equal(G.practice(s,'breaker'),false);
  assert.deepEqual(s,before);
  assert.equal(s.gear.weapon,'rod');assert.equal(s.gear.offhand,'focus');
});

test('roster switching is rejected during an encounter or delve without changing either character',()=>{
  const roster=C.emptyRoster(),a=C.createRosterCharacter(roster,{name:'A',kit:'bulwark'},null),b=C.createRosterCharacter(roster,{name:'B',kit:'duelist'},a.state);
  assert.ok(a&&b);
  for(const locked of [{...b.state,fight:{enemy:'rats'}},{...b.state,delve:{node:1}}]){
    const before=structuredClone(roster),activeId=roster.activeId;
    assert.equal(C.switchCharacter(roster,a.id,locked),null);
    assert.equal(C.createRosterCharacter(roster,{name:'C',kit:'caster'},locked),null);
    assert.deepEqual(roster,before);assert.equal(roster.activeId,activeId);
  }
});
