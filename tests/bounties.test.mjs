import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as Lab from '../dist/lab.js';
import * as B from '../dist/bounties.js';

// Notice Board bounty prototype (design/40 item 2; design/37 R5a). Injected clock and seeded RNG only; no real waits.

const STEP=G.ACTION_DELAY_MS;
const board=()=>B.freshBoard();
const fixture=()=>Lab.createLabSession({scenarioId:'bounty_board',seed:'unit'}).character;
// Win one hunt by taking the enemy to 1 HP, then explicit attacks. Returns the next unused clock value.
function labWin(s,enemy,t){
  assert.equal(Lab.startLabHunt(s,enemy,t),true,'hunt starts');s.character.fight.hp=1;
  for(let i=0;i<5&&s.character.fight;i++){t+=STEP;Lab.labAction(s,'attack',t);}
  assert.equal(s.character.fight,null,'fight ended');G.restore(s.character);return t;
}

test('nominal bounty XP matches the engine victory XP for an in-window target',()=>{
  for(const [level,enemy] of [[1,'rats'],[3,'wisp'],[5,'crab']]){
    const s=Lab.createLabSession({scenarioId:'bounty_board',seed:`xp-${enemy}`}).character;
    while(s.level<level)G.awardXP(s,G.xpNeeded(s.level)-s.xp);
    G.restore(s);assert.ok(G.startFight(s,enemy,'hunt',1000));s.fight.hp=1;
    const r=G.exchange(s,'attack',()=>.2,2000);
    assert.ok(r.victory);assert.equal(s.last.xp,B.nominalVictoryXP(G.ENEMIES.find(e=>e.id===enemy)),enemy);
  }
});

test('rewards split a 35% bonus budget 60/30/10 by profile, with a material-led floor of one',()=>{
  // Four rat wins pay 128 XP, 36 coins and 4 Ledger scraps on their own.
  assert.equal(B.BONUS_BUDGET_PCT,35);assert.deepEqual([...B.PROFILE_SHARES],[60,30,10]);
  assert.deepEqual(B.bountyReward('rats',4,'xp'),{xp:26,coins:3,materials:{}});
  assert.deepEqual(B.bountyReward('rats',4,'coins'),{xp:13,coins:7,materials:{}});
  assert.deepEqual(B.bountyReward('rats',4,'materials'),{xp:4,coins:3,materials:{'Ledger scraps':1}});
  assert.equal(B.bountyReward('boss',1,'xp').xp>0,true,'pricing is pure; eligibility is enforced separately');
  assert.equal(B.bountyReward('rats',0,'xp'),null);assert.equal(B.bountyReward('rats',2,'gold'),null);
});

test('a repeatable bounty never outpays the authored minor contract for the same target and count',()=>{
  const minors=Object.values(G.STORY_CONTRACTS).filter(c=>c.kind==='minor'&&c.objectives.length===1&&c.objectives[0].source==='victories');
  assert.ok(minors.length>=4);
  for(const c of minors){const {enemy,target}=c.objectives[0];
    for(const profile of B.PROFILE_ORDER){const r=B.bountyReward(enemy,target,profile);
      assert.ok(r.xp<=c.reward.xp,`${c.id} ${profile} XP`);assert.ok(r.coins<=c.reward.coins,`${c.id} ${profile} coins`);}}
});

test('where the rotation allows, the three profiles offer three different entries',()=>{
  const b=board();
  for(let level=1;level<=9;level++){const idx=B.boardOffers(b,level).map(o=>o.rotationIndex);assert.equal(new Set(idx).size,3,`level ${level}: ${idx}`);}
  assert.equal(B.boardOffers(b,10).every(o=>o.enemy==='hound'),true,'only Chewster is in window at level 10, so a repeat is allowed');
});

test('offers are deterministic, stay within two levels, never include the boss, and do not reroll',()=>{
  const b=board();
  for(let level=1;level<=10;level++){
    const offers=B.boardOffers(b,level);assert.equal(offers.length,3,`three offers at level ${level}`);
    for(const o of offers){const e=G.ENEMIES.find(x=>x.id===o.enemy);assert.notEqual(o.enemy,'boss');assert.ok(Math.abs(e.level-level)<=B.LEVEL_WINDOW);}
    assert.deepEqual(B.boardOffers(b,level),offers,'reading the board twice gives the same offers');
  }
  const c=fixture(),before=JSON.stringify(B.boardOffers(b,c.level));
  assert.equal(B.acceptBounty(b,c,'coins').ok,true);B.recordVictory(b,b.active.enemy);
  assert.equal(B.abandonBounty(b,c).ok,true);
  assert.equal(JSON.stringify(B.boardOffers(b,c.level)),before,'abandoning leaves the board exactly as it was');
});

test('only wins after acceptance count, only against the target, and progress stops at the count',()=>{
  const b=board(),c=fixture();
  assert.equal(B.recordVictory(b,'scavenger'),false,'no bounty yet');
  assert.equal(B.acceptBounty(b,c,'coins').ok,true);assert.equal(b.active.enemy,'scavenger');assert.equal(b.active.progress,0);
  assert.equal(B.recordVictory(b,'rats'),false);
  for(let n=0;n<b.active.count+2;n++)B.recordVictory(b,'scavenger');
  assert.equal(b.active.progress,b.active.count);assert.equal(B.bountyReady(b),true);
});

test('a bounty pays once, advances only its own profile, and locks during fights',()=>{
  const b=board(),c=fixture(),others={xp:b.next.xp,materials:b.next.materials};
  assert.equal(B.acceptBounty(b,c,'coins').ok,true);
  assert.equal(B.acceptBounty(b,c,'xp').ok,false,'one bounty at a time');
  assert.equal(B.claimBounty(b,c).ok,false,'not ready');
  const offer=b.active;for(let n=0;n<offer.count;n++)B.recordVictory(b,offer.enemy);
  assert.ok(G.startFight(c,'rats','hunt',1000));
  assert.equal(B.claimBounty(b,c).ok,false,'cannot claim mid-fight');assert.equal(B.abandonBounty(b,c).ok,false);
  c.fight=null;
  const coins=c.coins,mats={...c.materials},claim=B.claimBounty(b,c);
  assert.equal(claim.ok,true);assert.equal(c.coins,coins+offer.reward.coins);
  for(const [k,v] of Object.entries(offer.reward.materials))assert.equal(c.materials[k],(mats[k]||0)+v);
  const after=JSON.stringify({c,b});
  assert.equal(B.claimBounty(b,c).ok,false);assert.equal(JSON.stringify({c,b}),after,'a second claim changes nothing');
  assert.equal(b.next.coins,offer.rotationIndex+1);assert.deepEqual({xp:b.next.xp,materials:b.next.materials},others);
  assert.notEqual(B.offerFor(b,'coins',c.level).rotationIndex,offer.rotationIndex,'the claimed entry is replaced by a later rotation entry');
});

test('bounty IDs are their own record type and never touch story contracts or the campaign save shape',()=>{
  const b=board(),c=fixture(),story=JSON.stringify(c.story),keys=Object.keys(c).sort();
  assert.ok(B.acceptBounty(b,c,'xp').ok);assert.match(b.active.id,/^bounty-\d+$/);assert.equal(G.STORY_CONTRACTS[b.active.id],undefined);
  for(let n=0;n<b.active.count;n++)B.recordVictory(b,b.active.enemy);assert.ok(B.claimBounty(b,c).ok);
  assert.equal(JSON.stringify(c.story),story);assert.deepEqual(Object.keys(c).sort(),keys,'no bounty field is added to the character');
});

test('the lab scenario records accept, progress and claim as explicit inputs and reports the bonus once',()=>{
  const s=Lab.createLabSession({scenarioId:'bounty_board',seed:'lab'});let t=1000;
  assert.ok(s.bountyBoard);
  const accepted=Lab.labBountyAccept(s,'xp',t);assert.equal(accepted.ok,true);
  const target=s.bountyBoard.active.enemy,count=s.bountyBoard.active.count;
  assert.equal(Lab.labBountyClaim(s,t).ok,false);
  for(let n=0;n<count;n++)t=labWin(s,target,t+STEP);
  const xp=s.character.xp,level=s.character.level,claim=Lab.labBountyClaim(s,t+STEP);
  assert.equal(claim.ok,true);assert.ok(s.character.level>level||s.character.xp>xp);
  assert.equal(Lab.labBountyClaim(s,t+2*STEP).ok,false);
  const report=Lab.labSummary(s);
  assert.equal(report.bounties.claimed,1);assert.equal(report.bounties.bonusPaid.xp,claim.reward.xp);
  assert.deepEqual(report.events.filter(e=>e.type.startsWith('bounty-')).map(e=>[e.type,e.accepted??true]).slice(0,2),[['bounty-accept',true],['bounty-claim',false]]);
  assert.equal(report.events.filter(e=>e.type==='bounty-progress').length,count);
  const other=Lab.createLabSession({scenarioId:'routine_repetition',seed:'lab'});
  assert.equal(Lab.labBountyAccept(other,'xp',1000).ok,false);assert.equal(other.deniedInputs,1);assert.equal(Lab.labSummary(other).bounties,undefined);
});
