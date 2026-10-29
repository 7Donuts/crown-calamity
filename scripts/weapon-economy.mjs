// Offline balance simulation only; never imported by the game. Uses an injected clock, not live input.
import * as G from '../dist/engine.js';
import {seededRng} from '../dist/lab.js';

const configs={breaker:['wolf','mig'],duelist:['bunny','fin'],caster:['unicorn','int']};
const runs=[];
for(const [kit,[race,stat]] of Object.entries(configs))for(const sell of [false,true])for(let seed=1;seed<=12;seed++){
 const s=G.createCharacter({name:'Economy fixture',race,kit}),rng=seededRng(`economy-${seed}`);
 let now=1000000,wins=0,defeats=0,actions=0,rests=0,sales=0,saleGold=0,failedLevel=0;
 while(s.coins<10000&&wins+defeats<2000){
  if(s.points)while(s.points>0)G.allocate(s,stat);
  if(G.beginRest(s,now)){now=s.restReadyAt;if(!G.finishRest(s,now))throw Error('Rest failed');rests++;}
  const levelLimit=s.level-(failedLevel===s.level?2:0);
  const enemy=G.ENEMIES.filter(e=>e.id!=='boss'&&e.level<=Math.max(1,levelLimit)).at(-1);
  if(!G.startFight(s,enemy.id,'hunt',now))throw Error('Start failed');
  let guard=0;
  while(s.fight&&guard++<100){
   const primary=G.primaryActions(s),strike=G.actionInfo(s,primary.skill).reason?'attack':primary.skill;
   const finish=G.actionProfile(s,strike)?.normal>=s.fight.hp;
   const key=G.intent(s).heavy&&!finish?(G.actionInfo(s,primary.combined).reason?'guard':primary.combined):strike;
   now+=1500;actions++;
   const result=G.exchange(s,key,rng,now);if(!result.ok)throw Error(result.reason);
   if(result.victory)wins++;
   if(result.defeat){defeats++;failedLevel=s.level;}
  }
  if(s.fight)throw Error('Unfinished hunt');
  now+=2000;
  if(sell)for(const id of [...s.bag]){
   if(Object.values(s.gear).includes(id))continue;
   const receipt=G.sell(s,id);if(receipt){saleGold+=receipt.coins;sales++;now+=1500;}
  }
 }
 if(s.coins<10000)throw Error(`Target not reached: ${kit}/${sell}/${seed}`);
 runs.push({kit,sell,seed,minutes:(now-1000000)/60000,wins,defeats,actions,rests,sales,saleGold,level:s.level,coins:s.coins});
}
const median=arr=>arr.sort((a,b)=>a-b)[Math.floor(arr.length/2)];
const summary=[];
for(const kit of Object.keys(configs))for(const sell of [false,true]){
 const subset=runs.filter(r=>r.kit===kit&&r.sell===sell);
 summary.push({kit,sell,minutes:median(subset.map(r=>r.minutes)),min:Math.min(...subset.map(r=>r.minutes)),max:Math.max(...subset.map(r=>r.minutes)),wins:median(subset.map(r=>r.wins)),defeats:median(subset.map(r=>r.defeats)),actions:median(subset.map(r=>r.actions)),saleGold:median(subset.map(r=>r.saleGold)),finalLevel:median(subset.map(r=>r.level))});
}
console.log(JSON.stringify({assumptions:'Fresh level1; starting20coins; no purchases/contracts/specials; no equip drops; all points primary; highest ordinary hunt at or below level, fall back two levels after defeat; react to heavies; 1.5s per action,2s hunt/results overhead,actual4s rest or12s wound,1.5s per sale; one rest between hunts.',summary,runs},null,2));
