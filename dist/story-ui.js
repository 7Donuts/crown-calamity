import * as G from './engine.js';
import { UI_ICONS } from './ui-icons.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,cls='',disabled=false)=>`<button data-action="${esc(action)}" class="${cls}" ${disabled?'disabled':''}>${label}</button>`;
const safe=s=>!s.fight&&!s.delve;
const marker=name=>`<svg class="pixel-glyph story-marker" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${UI_ICONS[name]||UI_ICONS.journal}</svg>`;
function rewardText(reward){return [`${reward.xp} XP`,`${reward.coins} coins`,...Object.entries(reward.materials||{}).map(([m,n])=>`${n} ${m}`)].join(' · ');}
function objectives(contract){return `<ul class="story-objectives">${contract.objectives.map(o=>`<li class="${o.done?'done':''}"><span>${marker(o.done?'check':'questPending')} ${esc(o.label)}</span><strong>${o.current} / ${o.target}</strong></li>`).join('')}</ul>`;}
function contractCard(s,c){
 const actions=c.ready?`<div class="story-buttons">${button(`story-claim:${c.id}:coins`,'Report to Mara · collect reward','primary',!safe(s))}${c.id==='drainage_inspection'?button(`story-claim:${c.id}:materials`,'Help repairs · 10 coins + 3 fittings','subtle',!safe(s)):''}</div>`:c.available?button('story-accept:'+c.id,'Accept this '+c.kind+' contract','primary',!safe(s)):'';
 const hunts=c.active&&!c.ready?[...new Set(G.STORY_CONTRACTS[c.id].objectives.filter(o=>o.source==='victories').map(o=>o.enemy))].filter(id=>id!=='boss').map(id=>{const e=G.ENEMIES.find(v=>v.id===id);return button('hunt:'+id,`Hunt ${esc(e.name)} →`,'subtle',!!s.fight||!!s.delve||e.level>s.level+2||s.hp<=0);}).join(''):'';
 return `<article class="panel story-contract ${c.kind}"><div class="panel-label"><span>${c.kind==='major'?'MAJOR STORY MILESTONE':'MINOR CONTRACT'}</span><span>${c.ready?'READY TO REPORT':c.active?'IN PROGRESS':'AVAILABLE'}</span></div><h3>${esc(c.title)}</h3><p class="story-employer">${esc(c.employer)} · ${esc(c.chapter)}</p><p>${esc(c.text)}</p>${objectives(c)}<div class="story-reward">Reward: ${esc(rewardText(c.reward))}</div>${c.available?'<p class="story-hint">Progress counts after you accept. Completed hunts pay their own rewards as well.</p>':''}${actions}${hunts?`<div class="story-buttons">${hunts}</div>`:''}${c.id==='municipal_works'&&c.active?button('story-delve','Prepare a descent →','subtle',!safe(s)):''}</article>`;
}
export function renderStorySummary(s){
 const story=G.storyState(s),active=story.active,next=active.find(c=>c.kind==='major')||active[0]||story.available[0]||story.nextMajor;
 return `<section class="panel quest-panel"><div class="panel-label">YOUR STORY · ${story.majorCompleted} / ${story.majorTotal} MILESTONES</div><h3>${esc(next?.title||story.title)}</h3><p>${esc(next?.text||'Meet Mara at the lower stair. Learn why the canal crews have stopped reporting for work.')}</p>${next?.active?objectives(next):`<div class="quest-goal">${esc(story.stageLabel)}</div>`}${button('nav:story',active.some(c=>c.ready)?'Report a completed contract →':'Open story & contracts →','text-button full-width')}</section>`;
}
export function renderStory(s){
 const state=G.storyState(s),catalog=Object.values(G.STORY_CONTRACTS),actions=G.availableStoryActions(s),active=state.active,available=state.available;
 return `<section class="panel story-intro"><div class="eyebrow">BELOW THE WATERLINE · A SLOWER STORY</div><h2>${esc(state.title)}</h2><p>Bracken Quay is mostly dry. The crew’s boots are not. Mara needs a hand with ambitious rats, contrary machinery, and paperwork that occasionally bites. Earn the town’s trust one useful job at a time.</p><p class="muted">Minor contracts establish what is happening and fund your preparations. Major contracts change the chapter. Accept a job, work toward its listed objectives, and report back for its reward.</p><div class="story-chapter-progress">${catalog.filter(c=>c.kind==='major').map(c=>{const v=G.contractStatus(s,c.id);return `<span class="${v.completed?'complete':v.active?'current':''}">${v.completed?marker('check'):(c.majorIndex+1)} ${esc(c.title)}</span>`;}).join('')}</div></section>${!safe(s)?'<div class="point-notice">Your current encounter or expedition is still active. You can review objectives here; return to town before accepting or reporting contracts.</div>':''}${actions.length?`<section class="panel story-contact"><div class="eyebrow">AT THE LOWER STAIR · MARA PELL</div><h3>A person, not a noticeboard.</h3><p>${esc(actions[0].text)}</p><div class="story-buttons">${actions.map(a=>`<div>${button('story-action:'+a.id,esc(a.label),'primary',!safe(s)||!a.enabled)}${a.reason?`<p class="story-hint">${esc(a.reason)}</p>`:''}</div>`).join('')}</div></section>`:''}<div class="story-columns"><section><div class="section-row"><h2>Accepted contracts</h2><small>${active.length} active</small></div>${active.length?active.map(c=>contractCard(s,c)).join(''):'<p class="empty-state">No active contract. Speak with Mara, then accept an available job.</p>'}</section><section><div class="section-row"><h2>Work you can take</h2><small>Clear goals · no timers</small></div>${available.length?available.map(c=>contractCard(s,c)).join(''):'<p class="empty-state">Finish the current story step to open the next job. Ordinary hunts remain available.</p>'}<details class="panel story-future"><summary>Later milestones & completed work</summary>${catalog.map(c=>{const v=G.contractStatus(s,c.id);if(v.active||v.available)return '';return `<div class="story-future-row"><strong>${v.completed?marker('check'):''}${esc(c.title)}</strong><span>${c.kind==='major'?'Major story milestone':'Minor contract'}</span>${v.completed?'<p>Completed. Rewards remain claimed.</p>':`<p>${v.requirements.filter(r=>!r.met).map(r=>esc(r.label)).join(' · ')}</p>`}</div>`;}).join('')}</details></section></div>`;
}

/** The next explicit story decision, shared by rewards, prompts and navigation. */
export function getStoryNudge(s) {
 if(!s||s.fight||s.delve)return null;
 const state=G.storyState(s),ready=state.active.find(c=>c.ready),step=G.availableStoryActions(s).find(a=>a.enabled);
 if(ready)return {key:'report:'+ready.id,kind:'report',title:ready.title,text:'The objectives are complete. Mara is ready to hear your report.',label:'Report to Mara →',contract:ready};
 if(step)return {key:'action:'+step.id,kind:'action',title:step.label,text:step.text,label:step.label+' →',step};
 const next=state.available.find(c=>c.kind==='major')||state.available[0];
 if(next)return {key:'accept:'+next.id,kind:'accept',title:next.title,text:next.text,label:'Take the next story contract →',contract:next};
 const active=state.active.find(c=>c.kind==='major')||state.active[0];
 if(active){const objective=active.objectives.find(o=>!o.done),source=G.STORY_CONTRACTS[active.id].objectives.find(o=>o.id===objective?.id),enemy=source?.source==='victories'?G.ENEMIES.find(e=>e.id===source.enemy&&e.id!=='boss'&&e.level<=s.level+2):null;return {key:'progress:'+active.id,kind:'progress',title:active.title,text:objective?`${objective.label}: ${objective.current} / ${objective.target}.`:active.text,contract:active,hunt:enemy};}
 return null;
}
export function renderStoryNudge(s) {
 if(s?.pending==='bossLoot')return '';
 const next=getStoryNudge(s);if(!next)return '';
 const label=next.kind==='report'?'CONTRACT READY TO REPORT':next.kind==='progress'?'YOUR STORY OBJECTIVE':'NEXT STORY STEP';
 return `<aside class="reward-story-step" aria-label="Story progression"><span class="eyebrow">${label}</span><h3>${esc(next.title)}</h3><p>${esc(next.kind==='action'?'The way forward is open. Continue with Mara; no more hunts are needed for this step.':next.text)}</p>${next.kind!=='progress'?button('story-next',esc(next.label),'primary'):next.hunt?button('hunt:'+next.hunt.id,'Hunt '+esc(next.hunt.name)+' →','subtle',s.hp<=0):button('nav:story','Review this objective →','text-button')}</aside>`;
}
