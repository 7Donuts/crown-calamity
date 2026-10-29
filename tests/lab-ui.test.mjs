import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as G from '../dist/engine.js';
import * as L from '../dist/lab.js';
import * as B from '../dist/balance.js';

async function bootLab(){
  const elements=new Map(),downloads=[],copied=[];
  const element=()=>({innerHTML:'',textContent:'',value:'',dataset:{},classList:{add(){},remove(){},toggle(){}},listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},click(){}});
  const get=selector=>{if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);};
  const context={__G:G,__L:L,__B:B,document:{querySelector:get,createElement:element},window:{scrollTo(){}},navigator:{clipboard:{async writeText(text){copied.push(text);}}},Blob,URL:{createObjectURL(blob){downloads.push(blob);return 'blob:lab-report';},revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},console};
  Object.defineProperty(context,'localStorage',{get(){throw new Error('Lab must never access campaign storage');}});
  let source=await readFile(new URL('../dist/lab-ui.js',import.meta.url),'utf8');
  for(const [name,file] of [['G','engine'],['L','lab'],['B','balance']])source=source.replace(`import * as ${name} from './${file}.js';`,`const ${name}=globalThis.__${name};`);
  vm.runInNewContext(source+'\nglobalThis.__test={handleAction,render,buildReport,getSession:()=>session};',context,{filename:'lab-ui.js'});
  return {ui:context.__test,get,downloads,copied};
}

test('the disposable UI opens all six scenarios, shows the correct goals, and never accesses campaign storage',async()=>{
  const {ui,get}=await bootLab();
  assert.match(get('#lab-app').innerHTML,/provisional balance/);
  for(const scenario of L.LAB_SCENARIOS){
    get('#scenario-select').value=scenario.id;get('#kit-select').value=scenario.kit;get('#seed-input').value='test';
    ui.handleAction('start-session');
    assert.equal(ui.getSession().scenarioId,scenario.id);
    assert.equal(/\b(?:undefined|NaN)\b/.test(get('#lab-app').innerHTML),false,scenario.id);
    if(scenario.id==='return_orientation')assert.match(get('#lab-app').innerHTML,/Drainage Inspection/);
    ui.handleAction('start-hunt');
    assert.equal(ui.getSession().character.fight.enemy,scenario.enemy);
    assert.match(get('#lab-app').innerHTML,/data-action="lab-action:attack"/);
  }
});

test('the real lab handlers discard rapid combat attempts and exports contain only the disposable report',async()=>{
  const {ui,get,downloads,copied}=await bootLab();
  get('#scenario-select').value='routine_repetition';get('#kit-select').value='breaker';get('#seed-input').value='input-test';
  ui.handleAction('start-session');ui.handleAction('start-hunt');
  const s=ui.getSession();
  ui.handleAction('lab-action:guard');
  assert.equal(s.rounds,1);
  assert.ok(G.actionDelayRemaining(s.character)>0);
  ui.handleAction('lab-action:attack');
  assert.equal(s.rounds,1,'a second handler call during the shared lock does not queue combat');
  const hp=s.character.hp;
  ui.handleAction('rest');assert.equal(s.character.hp,hp,'rest is refused during the encounter');
  get('#session-notes').value='<script>test reflection</script>';
  ui.handleAction('export-report');
  assert.equal(downloads.length,1);
  const report=JSON.parse(await downloads[0].text());
  assert.equal(report.report.scenarioId,'routine_repetition');
  assert.equal(report.report.counters.rounds,1);
  assert.equal(report.reflection.notes,'<script>test reflection</script>');
  assert.equal('roster' in report.report,false);
  ui.render();assert.match(get('#lab-app').innerHTML,/&lt;script&gt;test reflection&lt;\/script&gt;/);
  await ui.handleAction('copy-report');
  assert.equal(copied.length,1);
  ui.handleAction('reset-session');
  assert.notEqual(ui.getSession(),s);
  assert.equal(ui.getSession().rounds,0);
  assert.equal(ui.getSession().character.fight,null);
});

test('lab shop and equip controls use the same affordability and ownership rules as the game',async()=>{
  const {ui,get}=await bootLab();
  get('#scenario-select').value='build_equipment';get('#kit-select').value='caster';get('#seed-input').value='shop';
  ui.handleAction('start-session');
  const s=ui.getSession(),price=G.buyPreview(s.character,'oilskin').price;
  ui.handleAction('lab-buy:oilskin');
  assert.equal(s.character.coins,120-price);
  assert.ok(s.character.bag.includes('oilskin'));
  ui.handleAction('lab-equip:oilskin:body');
  assert.equal(s.character.gear.body,'oilskin');
  assert.equal(/\b(?:undefined|NaN)\b/.test(get('#lab-app').innerHTML),false);
});
