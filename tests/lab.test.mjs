import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as Lab from '../dist/lab.js';

{
  assert.equal(Lab.LAB_SCENARIOS.length,10);
  for(const id of ['fresh_intro_goal','routine_repetition','heavy_telegraph','build_equipment','return_orientation','longer_level_pacing','night_shift','level_cap_progress','bounty_board','two_hands'])assert.ok(Lab.LAB_SCENARIOS.some(s=>s.id===id));
  assert.equal(Lab.createLabSession({scenarioId:'missing'}),null);
  const a=Lab.createLabSession({scenarioId:'fresh_intro_goal',seed:'same'});
  const b=Lab.createLabSession({scenarioId:'fresh_intro_goal',seed:'same'});
  assert.ok(a.character&&b.character);
  assert.notEqual(a.character,b.character);
  assert.equal(a.character.name,'Playtest Character');
  const rng1=Lab.seededRng('fixed'),rng2=Lab.seededRng('fixed');
  assert.deepEqual([...Array(5)].map(()=>rng1()),[...Array(5)].map(()=>rng2()));
}

{
  for(const scenario of Lab.LAB_SCENARIOS){
    const s=Lab.createLabSession({scenarioId:scenario.id,seed:7});
    assert.ok(s,scenario.id);
    assert.equal(s.character.level,scenario.level);
    assert.equal('part' in s.character,false);
    if(scenario.id==='longer_level_pacing')assert.equal(s.character.xp,150);
    assert.equal(s.character.points,0,'fixture progression points are allocated into its build');
    assert.equal(Object.values(s.character.stats).reduce((a,b)=>a+b,0),G.pointBudget(s.character),scenario.id);
    assert.equal(s.character.hp,G.totals(s.character).hp,`${scenario.id} fixture starts at full health`);
    assert.equal(s.character.mp,G.totals(s.character).mp,`${scenario.id} fixture starts at full mana`);
    assert.equal(s.character.sp,G.totals(s.character).sp,`${scenario.id} fixture starts at full stamina`);
    if(scenario.id==='build_equipment'){
      assert.equal(G.storyState(s.character).campaign.current,2);
      assert.match(scenario.description,/synthetic claimed Chapter 1 finale/);
    }
    if(scenario.id==='level_cap_progress'){
      const progress=G.progression(s.character);
      assert.equal(G.storyState(s.character).campaign.current,5);
      assert.equal(progress.level,50);assert.equal(progress.levelXP,0);assert.equal(progress.levelRequired,0);assert.equal(progress.capped,true);
      assert.equal('part' in s.character,false);assert.equal(progress.totalEarned,196);
      assert.equal(Lab.labSummary(s).starting.xp,0);assert.equal(Lab.labSummary(s).starting.levelRequired,0);
    }
  }
}

{
  const s=Lab.createLabSession({scenarioId:'fresh_intro_goal',seed:9});
  assert.equal(Lab.startLabHunt(s,'rats',100),true);
  assert.equal(Lab.labAction(s,'guard',100).ok,true);
  const blocked=Lab.labAction(s,'attack',749);
  assert.equal(blocked.ok,false);
  assert.equal(blocked.retryAfterMs,1);
  assert.equal(s.character.fight.round,1,'a denied tap does not advance or queue an exchange');
  assert.equal(Lab.labAction(s,'cast',750).ok,true);
  assert.equal(s.character.fight.round,2);
  assert.equal(s.rounds,2);
  assert.equal(s.playerInputs,4,'hunt start and all three combat taps are recorded');
  assert.equal(s.deniedInputs,1);
  assert.equal(s.encountersStarted,1);
  assert.equal(s.hpLost>0,true);
  assert.equal(s.damageAttempted>0,true);
  const report=Lab.labSummary(s);
  assert.equal(report.counters.playerInputs,4);
  assert.equal(report.counters.deniedInputs,1);
  assert.equal(report.counters.rounds,2);
  assert.equal(report.counters.manaSpent,16);
  assert.equal(report.counters.damageAttempted,s.damageAttempted);
  assert.equal(report.counters.hpLost,s.hpLost);
  assert.equal(report.telemetryNotes.hpLost.includes('not incoming enemy damage'),true);
  assert.equal(report.counters.staminaSpent,0);
  assert.equal(report.startTimestamp,100);
}

{
  const a=Lab.createLabSession({scenarioId:'routine_repetition',seed:123});
  const b=Lab.createLabSession({scenarioId:'routine_repetition',seed:123});
  for(const s of [a,b]){
    Lab.startLabHunt(s,'rats',0);
    Lab.labAction(s,'guard',0);
    Lab.labAction(s,'guard',650);
    Lab.labAction(s,'attack',1300);
  }
  assert.deepEqual(Lab.labSummary(a),Lab.labSummary(b),'same seed and inputs replay the same synthetic encounter');
}

{
  const s=Lab.createLabSession({scenarioId:'build_equipment',seed:3});
  assert.equal(s.character.coins,1000);
  const sidegrade=Object.keys(G.ITEMS).find(id=>G.buyPreview(s.character,id).allowed&&G.buyPreview(s.character,id).chapterRequired===2&&G.ITEMS[id].slot==='body');
  assert.ok(sidegrade,'the documented Chapter 2 fixture has an available body-slot sidegrade');
  const catalogName=G.ITEMS[sidegrade].name;
  const chapterLocked=Object.keys(G.ITEMS).find(id=>G.buyPreview(s.character,id).chapterRequired===3);
  assert.ok(chapterLocked);assert.equal(G.buyPreview(s.character,chapterLocked).allowed,false);
  assert.equal(Lab.labUse(s,'buy',chapterLocked),false,'lab purchases keep the production chapter gate');
  assert.equal(s.character.coins,1000);
  assert.equal(Lab.labUse(s,'buy',sidegrade),true,catalogName);
  const resale=G.sellPreview(s.character,sidegrade).price;
  assert.equal(Lab.labUse(s,'sell',sidegrade).coins,resale,catalogName);
  assert.deepEqual(s.shopActions,{attempted:3,completed:2});
  assert.equal(Lab.labRest(s),true);
  assert.ok(s.events.some(e=>e.type==='rest'));
  Lab.setLabNotes(s,'The price was easy to compare.');
  const report=Lab.labSummary(s);
  assert.equal(report.comments,'The price was easy to compare.');
  assert.equal(report.counters.shopActions.completed,2);
  assert.equal('name' in report.ending,false);
  assert.equal('roster' in report,false);
}

{
  const s=Lab.createLabSession({scenarioId:'level_cap_progress',seed:50});
  const p=G.progression(s.character),report=Lab.labSummary(s);
  assert.equal(p.capped,true);assert.equal(p.level,50);assert.equal(p.levelXP,0);assert.equal(p.levelRequired,0);
  assert.equal(report.counters.earnedAttributePoints,0,'the capped level grants no partial or additional attribute points');
  assert.equal('part' in s.character,false);
}

{
  const report=Lab.compareBuilds({enemyId:'rats',level:1,seed:'inspect'});
  assert.equal(report.kind,'inspector-prediction');
  assert.equal(report.simulationOnly,true);
  assert.equal(report.autocombat,false);
  assert.equal(report.builds.length,4);
  assert.ok(report.builds.some(b=>b.actions.skill==='cast'));
  assert.ok(report.builds.some(b=>b.actions.skill==='driving'));
  assert.ok(report.builds.every(b=>Number.isFinite(b.skill.averageDamage)));
  assert.deepEqual(report,Lab.compareBuilds({enemyId:'rats',level:1,seed:'inspect'}));
  assert.equal(Lab.compareBuilds({enemyId:'unknown'}),null);
}

{
  const s=Lab.createLabSession({scenarioId:'fresh_intro_goal'});
  assert.equal(Lab.startLabHunt(s,'rats'),true);
  const summary=Lab.labSummary(s);
  assert.equal('startTimestamp' in summary,false);
  assert.equal('at' in summary.events[0],false);
  assert.equal(JSON.stringify(summary).includes('Playtest Character'),false);
}


{
  const s=Lab.createLabSession({scenarioId:'return_orientation',seed:2});
  const story=G.storyState(s.character),handoff=story.active.find(c=>c.id==='drainage_inspection');
  assert.ok(story.completed.includes('proof_of_trouble'));
  assert.equal(s.scenario.enemy,'rats');
  assert.ok(handoff);
  assert.equal(handoff.objectives[0].current,1);
}

{
  const s=Lab.createLabSession({scenarioId:'heavy_telegraph',seed:4});
  assert.equal(Lab.startLabHunt(s,'crab',0),true);
  assert.equal(G.intent(s.character).heavy,true);
  assert.equal(G.intent(s.character).name,'Slow grab');
  assert.equal(s.rounds,0,'scenario setup does not resolve an exchange');
  assert.equal(Lab.labAction(s,'guardstrike',0).ok,true);
  const report=Lab.labSummary(s);
  assert.equal(report.counters.staminaSpent,12);
  assert.equal(report.counters.manaSpent,0);
}


{
  const lethal=Lab.createLabSession({scenarioId:'fresh_intro_goal',seed:13});
  Lab.startLabHunt(lethal,'rats',0);lethal.character.fight.hp=1;
  const finish=Lab.labAction(lethal,'cast',0);
  assert.equal(finish.victory,true);
  assert.equal(lethal.damageAttempted,finish.damage,'lethal overkill is reported as attempted damage, not enemy HP removed');

  const defeat=Lab.createLabSession({scenarioId:'fresh_intro_goal',seed:14});
  defeat.character.hp=1;Lab.startLabHunt(defeat,'rats',0);
  const lost=Lab.labAction(defeat,'attack',0);
  assert.equal(lost.defeat,true);
  assert.equal(defeat.hpLost,1,'HP loss is a net state delta, not the enemy hit size');
  assert.equal(defeat.damageUnreportedActions,1,'engine responses without a damage field are flagged as unknown');
  const report=Lab.labSummary(defeat);
  assert.equal(report.counters.damageAttempted,0);
  assert.equal(report.counters.damageUnreportedActions,1);
}

{
  const s=Lab.createLabSession({scenarioId:'two_hands',seed:42});
  assert.ok(s,'two_hands session created');
  assert.equal(s.character.rulesPreview?.twoHands,true,'rulesPreview.twoHands active in two_hands lab');
  assert.equal(s.activePreset,'weapon_shield');
  assert.equal(s.character.gear.weapon,'sword');
  assert.equal(s.character.gear.offhand,'shield');

  // Verify all four presets switch cleanly
  assert.equal(Lab.labApplyPreset(s,'weapon_weapon').ok,true);
  assert.equal(s.activePreset,'weapon_weapon');
  assert.equal(s.character.gear.offhand,'blade');

  assert.equal(Lab.labApplyPreset(s,'focus_shield').ok,true);
  assert.equal(s.activePreset,'focus_shield');
  assert.equal(s.character.gear.weapon,'rod');
  assert.equal(s.character.gear.offhand,'shield');

  assert.equal(Lab.labApplyPreset(s,'weapon_mender').ok,true);
  assert.equal(s.activePreset,'weapon_mender');
  assert.equal(s.character.gear.weapon,'sword');
  assert.equal(s.character.gear.offhand,'mender_kit');

  // Switch to weapon_weapon and fight
  Lab.labApplyPreset(s,'weapon_weapon');
  assert.equal(Lab.startLabHunt(s,'rats',0),true);
  // Presets cannot switch during an active fight
  assert.equal(Lab.labApplyPreset(s,'weapon_shield').ok,false);

  // Attack with two weapons: main hand hit + second hand hit
  const prof=G.actionProfile(s.character,'attack','rats');
  assert.ok(prof.offhand,'profile includes offhand hit calculation');
  assert.equal(prof.secondHand,'weapon');
  assert.ok(prof.offhand.normal>0);

  const res=Lab.labAction(s,'attack',0);
  assert.equal(res.ok,true);
  assert.ok(Number.isFinite(res.damage),'main hand damage reported');
  assert.ok(Number.isFinite(res.offhandDamage),'second hand damage reported');
  assert.ok(res.offhandDamage>0,'second hand weapon dealt damage');

  // Switch to weapon_mender and test mending
  const sm=Lab.createLabSession({scenarioId:'two_hands',seed:99});
  Lab.labApplyPreset(sm,'weapon_mender');
  const totals=G.totals(sm.character);
  sm.character.hp=totals.hp-50; // set missing health

  Lab.startLabHunt(sm,'rats',0);
  const menderProf=G.actionProfile(sm.character,'attack','rats');
  assert.equal(menderProf.secondHand,'mender');
  assert.ok(menderProf.mend>0,'mend preview is positive');

  const attackRes=Lab.labAction(sm,'attack',0);
  assert.equal(attackRes.ok,true);
  assert.ok(attackRes.mendHealed>0,'mend on strike healed player');
  assert.equal(attackRes.offhandDamage,0,'mender deals no strike damage');

  // Recover with mender: adds full mend to recovery
  sm.character.hp=totals.hp-50;
  const recRes=Lab.labAction(sm,'recover',650);
  assert.equal(recRes.ok,true);
  assert.ok(recRes.mendHealed>0,'recover with mender restored health');

  // Mend cap: cannot heal above missing health or 6% max HP
  sm.character.hp=totals.hp;
  const fullHpRes=Lab.labAction(sm,'attack',1300);
  assert.equal(fullHpRes.mendHealed,0,'full health character receives 0 mend');
}

console.log('playtest lab tests passed');
