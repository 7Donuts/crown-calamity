import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as G from '../dist/engine.js';
import * as L from '../dist/lab.js';
import * as B from '../dist/balance.js';
import * as S from '../dist/shifts.js';
import {UI_ICONS} from '../dist/ui-icons.js';

async function bootLab(){
  const elements=new Map(),downloads=[],copied=[];
  const element=()=>({innerHTML:'',textContent:'',value:'',dataset:{},classList:{add(){},remove(){},toggle(){}},listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},click(){}});
  const get=selector=>{if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);};
  const context={__G:G,__L:L,__B:B,__S:S,__UI_ICONS__:UI_ICONS,document:{querySelector:get,createElement:element},window:{scrollTo(){}},navigator:{clipboard:{async writeText(text){copied.push(text);}}},Blob,URL:{createObjectURL(blob){downloads.push(blob);return 'blob:lab-report';},revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},console};
  Object.defineProperty(context,'localStorage',{get(){throw new Error('Lab must never access campaign storage');}});
  let source=await readFile(new URL('../dist/lab-ui.js',import.meta.url),'utf8');
  for(const [name,file] of [['G','engine'],['L','lab'],['B','balance'],['S','shifts']])source=source.replace(`import * as ${name} from './${file}.js';`,`const ${name}=globalThis.__${name};`);
  source=source.replace("import {UI_ICONS} from './ui-icons.js';",'const UI_ICONS=globalThis.__UI_ICONS__;');
  vm.runInNewContext(source+'\nglobalThis.__test={handleAction,render,buildReport,getSession:()=>session};',context,{filename:'lab-ui.js'});
  return {ui:context.__test,get,downloads,copied};
}

test('the Notice Board panel accepts, hunts, counts and refuses early claims through the real handlers',async()=>{
  const {ui,get}=await bootLab();
  get('#scenario-select').value='bounty_board';get('#kit-select').value='duelist';get('#seed-input').value='board';
  ui.handleAction('start-session');
  const s=ui.getSession(),html=()=>get('#lab-app').innerHTML;
  assert.match(html(),/NOTICE BOARD/);assert.match(html(),/data-action="bounty-accept:xp"/);assert.match(html(),/data-action="bounty-accept:materials"/);
  ui.handleAction('bounty-accept:coins');
  const bounty=s.bountyBoard.active;assert.equal(bounty.profile,'coins');
  assert.match(html(),new RegExp(`data-action="lab-hunt:${bounty.enemy}"`));
  ui.handleAction('bounty-claim');assert.equal(s.bountyBoard.active,bounty,'an early claim is refused');
  ui.handleAction(`lab-hunt:${bounty.enemy}`);assert.equal(s.character.fight.enemy,bounty.enemy);
  assert.match(html(),/wait until this fight ends/);
  s.character.fight.hp=1;ui.handleAction('lab-action:attack');
  assert.equal(s.character.fight,null);assert.equal(bounty.progress,1);
  ui.handleAction('bounty-abandon');assert.equal(s.bountyBoard.active,null);
  assert.equal(/\b(?:undefined|NaN)\b/.test(html()),false);
});

test('the disposable UI opens every scenario, shows the correct goals, and never accesses campaign storage',async()=>{
  const {ui,get}=await bootLab();
  assert.match(get('#lab-app').innerHTML,/provisional balance/);
  for(const scenario of L.LAB_SCENARIOS){
    get('#scenario-select').value=scenario.id;get('#kit-select').value=scenario.kit;get('#seed-input').value='test';
    ui.handleAction('start-session');
    assert.equal(ui.getSession().scenarioId,scenario.id);
    assert.equal(/\b(?:undefined|NaN)\b/.test(get('#lab-app').innerHTML),false,scenario.id);
    if(scenario.id==='return_orientation')assert.match(get('#lab-app').innerHTML,/Lint Trap Rescue/);
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
  const s=ui.getSession();s.character.coins=5000;const price=G.buyPreview(s.character,'oilskin').price;
  ui.handleAction('lab-buy:oilskin');
  assert.equal(s.character.coins,5000-price);
  assert.ok(s.character.bag.includes('oilskin'));
  ui.handleAction('lab-equip:oilskin:body');
  assert.equal(s.character.gear.body,'oilskin');
  assert.equal(/\b(?:undefined|NaN)\b/.test(get('#lab-app').innerHTML),false);
});

test('the disposable recovery hint includes the equipped signet benefit',async()=>{
  const {ui,get}=await bootLab();get('#scenario-select').value='fresh_intro_goal';get('#kit-select').value='bulwark';get('#seed-input').value='recover';ui.handleAction('start-session');ui.handleAction('start-hunt');
  const c=ui.getSession().character;c.bag.push('signet');c.gear.relic='signet';ui.render();
  assert.equal(G.recoverProfile(c).mana+G.recoverProfile(c).passiveMana,12);
  assert.match(get('#lab-app').innerHTML,/Shake it off \(Recover\) restores 12 Sparkle \(mana\) total and 10 Bounce \(stamina\)/);
});

test('the Night Shift scenario clocks in, shows the risk, offers a stored boon check-in, locks shopping and clocks out once',async()=>{
  const {ui,get,downloads}=await bootLab();
  get('#scenario-select').value='night_shift';get('#kit-select').value='bulwark';get('#seed-input').value='ui-shift';
  ui.handleAction('start-session');
  const html=()=>get('#lab-app').innerHTML;
  assert.match(html(),/Clock in \(start Night Shift\)/);
  assert.match(html(),/Nothing is timed and nothing accrues while you are away/);
  assert.equal(/\bundefined\b|\bNaN\b/.test(html()),false);
  assert.equal(/\bbank\b|guild|circle|holdings|Care Instructions|toy box/i.test(html()),false,'reserved vocabulary stays out of the Shift text');
  ui.handleAction('shift-start');
  const s=ui.getSession();
  assert.equal(s.shift.status,'open');
  assert.match(html(),/Unfiled receipts at risk before the next fight: nothing yet/);
  assert.match(html(),/Take your one Break \(heals 35% of each resource\)/);
  assert.match(html(),/Locked during a Night Shift/);
  assert.match(html(),/data-action="lab-buy:sword" class="subtle" disabled/);
  const win=()=>{ui.handleAction('shift-fight:rats');assert.ok(s.character.fight);assert.match(html(),/Go still \(Withdraw\) ends this fight and resets the streak, and keeps your unfiled receipts/);s.character.fight.hp=1;s.character.nextActionAt=0;ui.handleAction('lab-action:attack');assert.equal(s.character.fight,null);};
  win();
  assert.match(html(),/Unfiled receipts at risk before the next fight: nothing yet/,'the first win adds no Overtime');
  win();
  assert.match(html(),/Unfiled receipts at risk before the next fight: /);assert.match(html(),/Overtime adds \+20% of its coins/);
  win();
  assert.match(html(),/MIDNIGHT SNACK CHECK-IN · 3 WINS/);
  const picks=[...html().matchAll(/data-action="shift-pick:3:([a-z_]+)"/g)].map(m=>m[1]);
  assert.equal(picks.length,3);assert.equal(new Set(picks).size,3);
  assert.match(html(),/data-action="shift-fight:rats" class="target-button" disabled/,'the next hunt waits for the check-in');
  ui.render();ui.render();
  assert.deepEqual([...html().matchAll(/data-action="shift-pick:3:([a-z_]+)"/g)].map(m=>m[1]),picks,'re-rendering cannot reroll the offer');
  ui.handleAction('shift-fight:rats');assert.equal(s.character.fight,null,'a hunt cannot start while the check-in is open');
  ui.handleAction(`shift-pick:3:${picks[0]}`);
  assert.deepEqual(S.activeBoonIds(s.shift),[picks[0]]);
  assert.match(html(),/Boons this Shift:/);
  assert.equal(/MIDNIGHT SNACK CHECK-IN/.test(html()),false);
  const coins=s.character.coins,unfiled=S.unfiledReceipts(s.shift);
  ui.handleAction('shift-clockout');
  assert.equal(s.shift.status,'clocked_out');assert.equal(s.character.coins,coins+unfiled.coins);
  assert.match(html(),/Last Night Shift: clocked out after 3 wins/);
  ui.handleAction('shift-clockout');assert.equal(s.character.coins,coins+unfiled.coins,'a second clock-out pays nothing');
  get('#session-notes').value='n';ui.handleAction('export-report');
  const report=JSON.parse(await downloads[0].text());
  assert.equal(report.report.shifts.records[0].endReason,'clock_out');assert.equal(report.report.shifts.records[0].wins,3);
  assert.equal(/\bundefined\b|\bNaN\b/.test(html()),false);
});

test('a Night Shift defeat in the UI explains what was and was not lost',async()=>{
  const {ui,get}=await bootLab();
  get('#scenario-select').value='night_shift';get('#kit-select').value='bulwark';get('#seed-input').value='ui-defeat';
  ui.handleAction('start-session');ui.handleAction('shift-start');
  const s=ui.getSession();s.character.hp=1;
  ui.handleAction('shift-fight:rats');s.character.nextActionAt=0;ui.handleAction('lab-action:attack');
  assert.equal(s.shift.status,'ended');
  assert.match(get('#lab-app').innerHTML,/ended in defeat/);assert.match(get('#lab-app').innerHTML,/no XP or gear was lost/);
  assert.match(get('#lab-app').innerHTML,/Cannot clock in yet: You are still wounded/);
  assert.match(get('#lab-app').innerHTML,/nothing updates by itself/);
});
