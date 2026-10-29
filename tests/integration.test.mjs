import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, rm, mkdir, copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFile as readJSON} from 'node:fs/promises';
import * as G from '../dist/engine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredGear = ['SLOTS','EXCHANGES','PREFIXES','SUFFIXES','resolveItem','slotChoices','exchangeMaterials','upgradePreview','upgradeItem','affixPreview','applyAffix','effectiveItem'];
const exchange = (s, action, now) => G.exchange(s, action, () => .5, now);

function bootPackagedScript(script) {
  const elements=new Map(), errors=[],listeners={};
  const element=()=>({innerHTML:'',textContent:'',value:'',files:[],open:false,style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelector(){return element();},querySelectorAll(){return [];},showModal(){this.open=true;},close(){this.open=false;},focus(){},click(){},getBoundingClientRect(){return {left:0,right:0,top:0,bottom:0};}});
  const document={querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);},createElement(){return element();},addEventListener(type,fn){(listeners[type]??=[]).push(fn);}};
  const context={document,localStorage:{getItem(){return null;},setItem(){}},window:{scrollTo(){}},console:{...console,error:(...args)=>errors.push(args)},Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){}};
  vm.runInNewContext(script,context,{filename:'packaged-app.js'});
  return {elements,errors,listeners,click(action){const event={target:{closest(){return {disabled:false,dataset:{action}};}}};for(const fn of listeners.click||[])fn(event);}};
}

test('a new character can follow rescue into a legal level-two, three-active Reservoir build', () => {
  const s = G.fresh();
  assert.equal(G.startFight(s, 'rats'), true);
  s.fight.hp = 1;
  const win = exchange(s, 'attack', 1000);
  assert.equal(win.victory, true);
  assert.equal(s.pending, 0);
  assert.equal(s.materials['Ledger scraps'], 1, 'the completed hunt pays its authored material');
  assert.deepEqual(G.completeQuest(s, 'materials'), {leveled: 1});
  assert.equal(s.level, 2);
  assert.equal(s.points, 4);
  assert.equal(s.quest, 1);

  for (const id of ['brace', 'mend', 'reservoir']) assert.equal(G.learnAbility(s, id), true, id);
  for (const id of ['brace', 'mend']) assert.equal(G.equipAbility(s, id), true, id);
  assert.equal(G.equipAbility(s, 'reservoir'), true);
  assert.deepEqual(s.equippedAbilities, ['arc', 'brace', 'mend']);
  assert.equal(s.equippedAbilities.length, 3);
  assert.equal(G.attunementUsed(s), 6);
  assert.equal(s.passive, 'reservoir');
  assert.equal(G.ACTION_DELAY_MS, 650);
});

test('gear mutations share real combat totals and damage profiles, then recipe costs stay atomic', () => {
  for (const name of requiredGear) assert.ok(G[name] !== undefined, `engine export ${name}`);
  const s = G.fresh();
  s.level = 10;
  s.coins = 1000;
  s.materials = {'Runic residue': 3, 'Canal iron': 3, 'Repair fittings': 3, 'Ledger scraps': 2, 'Salvaged fittings': 1};
  const baseTotal = G.totals(s), baseProfile = G.actionProfile(s, 'cast', 'rats');
  assert.equal(G.upgradeItem(s, 'rod').upgrade, 1);
  assert.equal(G.applyAffix(s, 'rod', 'prefix', 'keen').affixId, 'keen');
  const modified = G.resolveItem(s, 'rod');
  assert.equal(modified.base, 17, 'one upgrade point and the Keen bonus reach the shared item resolver');
  assert.ok(G.totals(s).spellBase >= baseTotal.spellBase);
  const upgradedProfile = G.actionProfile(s, 'cast', 'rats');
  assert.ok(upgradedProfile.normal > baseProfile.normal, 'the changed rod affects the same profile used by combat');
  s.bag.push('penny');
  assert.equal(G.equip(s, 'penny', 'accessory'), true);
  assert.ok(G.totals(s).lck > baseTotal.lck);

  const before = structuredClone(s);
  const crafted = G.exchangeMaterials(s, 'craft_cap');
  assert.deepEqual(crafted.gainedItems, ['cap']);
  assert.ok(s.bag.includes('cap'));
  assert.equal(s.materials['Ledger scraps'], before.materials['Ledger scraps'] - 2);
  assert.equal(s.materials['Salvaged fittings'], before.materials['Salvaged fittings'] - 1);
  assert.equal(s.coins, before.coins - 8);
  const afterFirst = structuredClone(s);
  assert.equal(G.exchangeMaterials(s, 'craft_cap'), false, 'a unique recipe cannot award a second copy');
  assert.deepEqual(s, afterFirst, 'a rejected repeat spends nothing');
  for (const amount of Object.values(s.materials)) assert.ok(amount >= 0, 'crafting never creates negative stock');
});

test('all nine equipped slots contribute once and a two-handed weapon reserves offhand everywhere', () => {
  const s=G.fresh(); s.level=10;
  for (const id of ['floodrod','cap','oilskin','grips','boots','penny','lantern','signet','pike']) s.bag.push(id);
  for (const [id,slot] of [['floodrod','weapon'],['cap','head'],['oilskin','body'],['grips','hands'],['boots','feet'],['penny','accessory'],['lantern','accessory2'],['signet','relic']]) assert.equal(G.equip(s,id,slot),true,`${id} fits ${slot}`);
  assert.deepEqual(Object.keys(G.SLOTS),['weapon','offhand','head','body','hands','feet','accessory','accessory2','relic']);
  assert.equal(s.gear.accessory,'penny'); assert.equal(s.gear.accessory2,'lantern');
  assert.equal(G.totals(s).armor,43);
  assert.equal(G.totals(s).ward,28);
  assert.deepEqual(G.totals(s).gearBonuses,{mig:2,fin:1,int:2,vit:0,wil:1,ins:3,lck:4});
  const rodDamage=G.actionProfile(s,'cast','rats').normal;
  assert.equal(G.equip(s,'pike','weapon'),true);
  assert.equal(s.gear.offhand,null);
  assert.equal(G.hasFocus(s),false);
  assert.notEqual(G.actionProfile(s,'attack','rats').normal,rodDamage);
  assert.equal(G.slotChoices(s,'shield').includes('offhand'),false);
  assert.equal(G.equip(s,'shield','offhand'),false);
  assert.equal(G.equip(s,'floodrod','weapon'),true);
  assert.equal(s.gear.offhand,null,'changing back to a one-handed weapon does not silently restore removed gear');
  assert.equal(G.equip(s,'shield','offhand'),true);
  assert.equal(G.hasFocus(s),true);
});

test('all character, equipment, and workbench mutations stay locked during an encounter and a delve', () => {
  for (const mode of ['fight', 'delve']) {
    const s = G.fresh();
    s.level = 10; s.quest = 5; s.points = 4; s.coins = 1000;
    s.materials = {'Runic residue': 4, 'Canal iron': 4, 'Salvaged fittings': 4, 'Repair fittings': 4};
    s.learnedAbilities.push('brace', 'mend');
    if (mode === 'fight') assert.equal(G.startFight(s, 'rats'), true);
    else { assert.equal(G.startDelve(s), true); }
    const before = structuredClone(s);
    const attempts = [
      () => G.allocate(s, 'vit'), () => G.resetStats(s), () => G.practice(s, 'breaker'),
      () => G.learnAbility(s, 'brace'), () => G.equipAbility(s, 'brace'), () => G.unequipAbility(s, 'arc'),
      () => G.equip(s, 'sword', 'weapon'), () => G.unequip(s, 'body'),
      () => G.buy(s, 'cap'), () => G.exchangeMaterials(s, 'repair_parts'),
      () => G.upgradeItem(s, 'rod'), () => G.applyAffix(s, 'rod', 'prefix', 'keen'),
      () => G.restore(s)
    ];
    for (const attempt of attempts) assert.equal(attempt(), false, `${mode}: mutation rejected`);
    assert.deepEqual(s, before, `${mode}: rejected operations leave the save untouched`);
  }
});

test('old saves migrate to v3 and v3 preserves live encounter state and item modifications', () => {
  for (const version of [1, 2]) {
    const old = G.fresh(); old.version = version;
    if (version === 1) delete old.stats.lck;
    old.level = 4; old.coins = 73; old.points = 3;
    old.itemMods = {rod: {upgrade: 2, prefix: 'keen', suffix: 'of_might'}};
    old.fight = {enemy:'crab',hp:123,round:2,startLevel:4,charge:1,used:['arc'],cooldowns:{brace:3},barrier:19,barrierTurns:1,exposed:true,exposedRound:3,healDeficit:7,sealUsed:false,source:'delve',dropChance:.24,channel:'arcane',streak:2,interruptImmune:0,vented:false};
    old.delve = {node:2,path:'records',campUsed:false}; old.nextActionAt = 1800;
    const loaded = G.loadSave(JSON.stringify(old));
    assert.equal(loaded.version, 3);
    assert.equal(loaded.stats.lck, 8);
    assert.equal(loaded.coins, 73); assert.equal(loaded.points, 3);
    assert.equal(loaded.fight.barrier, 19); assert.equal(loaded.fight.exposed, true);
    assert.equal(loaded.fight.exposedRound, 3); assert.deepEqual(loaded.itemMods.rod,{upgrade:2,prefix:'keen',suffix:'of_might'});
    assert.equal(loaded.nextActionAt, 1800);
  }
  const live = G.fresh(); live.level=8; live.quest=4; live.learnedAbilities.push('brace','mend'); live.equippedAbilities=['arc','brace','mend'];
  live.itemMods={rod:{upgrade:2,prefix:'keen',suffix:'of_might'}};
  assert.equal(G.startFight(live,'crab','delve'),true);
  Object.assign(live.fight,{barrier:23,barrierTurns:1,exposed:true,exposedRound:2,charge:1,healDeficit:14});
  live.delve={node:2,path:'records',campUsed:false}; live.nextActionAt=2100;
  const loaded = G.loadSave(JSON.stringify(live));
  assert.ok(loaded);
  for (const key of ['barrier','barrierTurns','exposed','exposedRound','charge','healDeficit']) assert.equal(loaded.fight[key], live.fight[key]);
  assert.deepEqual(loaded.itemMods.rod,{upgrade:2,prefix:'keen',suffix:'of_might'});
  assert.deepEqual(loaded.delve,live.delve); assert.equal(loaded.nextActionAt,2100);
});

test('ability eligibility is classless across supported identities', () => {
  const status = [];
  for (const race of ['Human','Stonekin']) {
    const s=G.fresh(); s.race=race; s.level=5; s.quest=5; s.usefulGuards=3;
    status.push(['brace','mend','driving','aegis','expose','reservoir','footing'].map(id=>G.abilityStatus(s,id).eligible));
  }
  assert.deepEqual(status[0],status[1]);
  assert.deepEqual(status[0],[true,true,true,true,true,true,true]);
  assert.ok(Object.values(G.ABILITIES).every(a=>!a.requires?.class));
});

test('the package generator produces standalone code with all module exports and the enemy atlas embedded', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'c-and-c-package-'));
  try {
    // Run against an isolated source copy so generated deliverables never overwrite the working tree.
    const copy = path.join(temp,'repo');
    await mkdir(copy,{recursive:true});
    const cp = spawnSync('cp',['-a',path.join(root,'dist'),copy],{encoding:'utf8'});
    assert.equal(cp.status,0,cp.stderr);
    await copyFile(path.join(root,'scripts-package.py'),path.join(copy,'scripts-package.py'));
    await copyFile(path.join(root,'package.json'),path.join(copy,'package.json'));
    const run = spawnSync('python3',['scripts-package.py'],{cwd:copy,encoding:'utf8'});
    assert.equal(run.status,0,run.stderr || run.stdout);
    const copiedPackage = JSON.parse(await readJSON(path.join(copy,'package.json'),'utf8'));
    const html = await readFile(path.join(copy,`Crown-and-Calamity-v${copiedPackage.version}.html`),'utf8');
    assert.match(html,/data:image\/png;base64,/,'source art is embedded into the standalone');
    assert.equal(html.includes('const G=__crownModules["engine.js"];'),true,'bundled app binds to the inlined game engine');
    assert.equal(/^\s*import\s+[^\n]+\s+from\s+['"]\./m.test(html),false,'standalone has no unresolved local ES module imports');
    assert.equal(/^\s*export\s+(?:const|function)\b/m.test(html),false,'bundled browser script has no unresolved exports');
    assert.equal(html.includes('assets/enemies/enemy-atlas.png'),false,'enemy atlas references are embedded in the standalone');
    const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
    assert.ok(style,'standalone has embedded CSS');
    assert.equal(/^(?:450|500|550|600|650|700);/m.test(style),false,'embedded font-import cleanup does not leave URL fragments in the stylesheet');
    assert.match(html,/exchangeMaterials/); assert.match(html,/attunementUsed/);
    const embedded = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(embedded);
    const syntax = spawnSync('node',['--check','--input-type=module'],{input:embedded,encoding:'utf8'});
    assert.equal(syntax.status,0,syntax.stderr);
    const packaged=bootPackagedScript(embedded);
    const app=()=>packaged.elements.get('#app').innerHTML;
    assert.equal(/\b(?:undefined|NaN)\b/.test(app()),false,'packaged landing view renders without missing data');
    for (const [action,label] of [['nav:character','Character record'],['char-tab:attributes','YOUR ATTRIBUTES'],['char-tab:abilities','Active abilities'],['nav:bag','Personal effects'],['bag-tab:shop','Quay Outfitter'],['bag-tab:materials','Materials on hand'],['bag-tab:workbench','MUNICIPAL WORKBENCH'],['nav:journal','Adventure chronicle'],['nav:guide','FIELD GUIDE · RULES & SAVES']]) {
      packaged.click(action);
      assert.equal(app().includes(label),true,`packaged UI renders ${label}`);
      assert.equal(/\b(?:undefined|NaN)\b/.test(app()),false,`packaged ${label} has no missing values`);
    }
    assert.deepEqual(packaged.errors,[],'packaged screens run without caught application errors');
    const zip = spawnSync('unzip',['-Z1',`Crown-and-Calamity-v${copiedPackage.version}.zip`],{cwd:copy,encoding:'utf8'});
    assert.equal(zip.status,0,zip.stderr);
    for (const entry of ['dist/engine.js','dist/gear.js','dist/abilities.js','dist/assets/enemies/enemy-atlas.png']) assert.ok(zip.stdout.split('\n').includes(entry),`source archive contains ${entry}`);
  } finally { await rm(temp,{recursive:true,force:true}); }
});
