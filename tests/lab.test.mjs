import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as Lab from '../dist/lab.js';

{
  assert.equal(Lab.LAB_SCENARIOS.length,6);
  for(const id of ['fresh_intro_goal','routine_repetition','heavy_telegraph','build_equipment','return_orientation','longer_level_pacing'])assert.ok(Lab.LAB_SCENARIOS.some(s=>s.id===id));
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
    assert.equal(s.character.part,scenario.part);
    assert.equal(s.character.points,0,'fixture progression points are allocated into its build');
    assert.equal(Object.values(s.character.stats).reduce((a,b)=>a+b,0),G.pointBudget(s.character),scenario.id);
    assert.equal(s.character.hp,G.totals(s.character).hp,`${scenario.id} fixture starts at full health`);
    assert.equal(s.character.mp,G.totals(s.character).mp,`${scenario.id} fixture starts at full mana`);
    assert.equal(s.character.sp,G.totals(s.character).sp,`${scenario.id} fixture starts at full stamina`);
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
  assert.equal(report.counters.manaSpent,12);
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
  assert.equal(s.character.coins,120);
  assert.equal(Lab.labUse(s,'buy','oilskin'),true);
  const resale=G.sellPreview(s.character,'oilskin').price;
  assert.equal(Lab.labUse(s,'sell','oilskin').coins,resale);
  assert.deepEqual(s.shopActions,{attempted:2,completed:2});
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
  assert.equal(G.intent(s.character).name,'Slow clamp');
  assert.equal(s.rounds,0,'scenario setup does not resolve an exchange');
  assert.equal(Lab.labAction(s,'guardstrike',0).ok,true);
  const report=Lab.labSummary(s);
  assert.equal(report.counters.staminaSpent,10);
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

console.log('playtest lab tests passed');
