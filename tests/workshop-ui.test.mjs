import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import {bootWithSave} from './shop-ui-harness.mjs';

const confirmAction=html=>html.match(/data-action="(upgrade-confirm:[^"]+)"/)?.[1];
const affixAction=html=>html.match(/data-action="(affix-confirm:[^"]+)"/)?.[1];

test('upgrade and reforge keep the chosen Sewing Kit item open with a fresh preview',async()=>{
  const save=G.createCharacter({name:'Mender',kit:'bulwark'});save.coins=1500;save.materials['Salvaged fittings']=12;save.materials['Runic residue']=12;save.materials['Canal iron']=12;save.materials['Ledger scraps']=2;
  const {ui}=await bootWithSave(save);
  await ui.act('nav:bag');await ui.act('bag-tab:workbench');
  await ui.act('upgrade:rod');
  const first=confirmAction(ui.getModal().innerHTML);assert.ok(first,'upgrade preview offers a confirmation');
  await ui.act(first);
  assert.equal(ui.getState().itemMods.rod.upgrade,1);
  assert.equal(ui.getModal().open,true,'the refreshed inspector remains open');
  assert.match(ui.getModal().innerHTML,/AFTER/);
  assert.match(ui.getApp().innerHTML,/class="workbench-section bench-group" open/);
  assert.match(ui.getApp().innerHTML,/workbench-item selected" data-workbench-item="rod"/);
  const coins=ui.getState().coins,materials=ui.getState().materials['Salvaged fittings'];
  await ui.act(first);
  assert.equal(ui.getState().itemMods.rod.upgrade,1,'a stale confirmation cannot buy another upgrade');
  assert.equal(ui.getState().coins,coins,'the stale confirmation does not withdraw coins');
  assert.equal(ui.getState().materials['Salvaged fittings'],materials);

  await ui.act('affix-menu:rod:prefix');await ui.act('affix-preview:rod:prefix:keen');
  const reforge=affixAction(ui.getModal().innerHTML);assert.ok(reforge,'reforge preview offers a confirmation');
  await ui.act(reforge);
  assert.equal(ui.getState().itemMods.rod.prefix,'keen');
  assert.equal(ui.getModal().open,true,'the updated reforge choices remain open');
  assert.match(ui.getApp().innerHTML,/workbench-item selected" data-workbench-item="rod"/);
  const coinsAfter=ui.getState().coins,modsAfter=structuredClone(ui.getState().itemMods.rod);
  await ui.act(reforge);
  assert.deepEqual(ui.getState().itemMods.rod,modsAfter,'a stale reforge confirmation is rejected');
  assert.equal(ui.getState().coins,coinsAfter);

  await ui.act('exchange:craft_cap');await ui.act('exchange-confirm:craft_cap');
  assert.ok(ui.getState().bag.includes('cap'));
  assert.equal(ui.getModal().open,true,'a crafted item opens its fresh comparison inspector');
  assert.ok(ui.getModal().innerHTML.includes(G.ITEMS.cap.name));
  assert.match(ui.getApp().innerHTML,/workbench-item selected" data-workbench-item="cap"/);
});
