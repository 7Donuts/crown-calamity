import * as G from './engine.js';
import { UI_ICONS } from './ui-icons.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,cls='',disabled=false)=>`<button data-action="${esc(action)}" class="${cls}" ${disabled?'disabled':''}>${label}</button>`;
const safe=s=>!s.fight&&!s.delve;
const marker=name=>`<svg class="pixel-glyph story-marker" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${UI_ICONS[name]||UI_ICONS.journal}</svg>`;
function rewardText(reward){return [`${reward.xp} XP`,`${reward.coins} coins`,...Object.entries(reward.materials||{}).map(([m,n])=>`${n} ${G.materialLabel(m)}`)].join(' · ');}
function objectives(contract){return `<ul class="story-objectives">${contract.objectives.map(o=>`<li class="${o.done?'done':''}"><span>${marker(o.done?'check':'questPending')} ${esc(o.label)}</span><strong>${o.current} / ${o.target}</strong></li>`).join('')}</ul>`;}
function bossReady(s,c){
 const meta=G.STORY_CONTRACTS[c.id],chapter=G.storyState(s).campaign.chapters.find(v=>v.id===c.chapterId);
 if(!chapter||chapter.finale!==c.id||!c.active)return false;
 const rows=c.objectives,defs=meta.objectives,index=defs.findIndex(o=>o.source==='victories'&&o.enemy===chapter.bossId);
 return index>=0&&!rows[index].done&&rows.slice(0,index).every(o=>o.done);
}
function contractCard(s,c){
 const actions=c.ready?`<div class="story-buttons">${button(`story-claim:${c.id}:coins`,`Report to ${esc(c.employer)} · collect reward`,'primary',!safe(s))}${c.id==='drainage_inspection'?button(`story-claim:${c.id}:materials`,'Help repairs · 10 coins + 3 Patches','subtle',!safe(s)):''}</div>`:c.available?button('story-accept:'+c.id,'Accept this '+c.kind+' contract','primary',!safe(s)):'';
 const hunts=c.active&&!c.ready?[...new Set(G.STORY_CONTRACTS[c.id].objectives.filter(o=>o.source==='victories').map(o=>o.enemy))].filter(id=>!id.endsWith('_boss')&&id!=='boss').map(id=>{const e=G.ENEMIES.find(v=>v.id===id)||G.trialEnemy?.(s,id);return e?button('hunt:'+id,`Hunt ${esc(e.name)} →`,'subtle',!!s.fight||!!s.delve||(!e.trial&&e.level>G.effectiveLevel(s)+2)||s.hp<=0):'';}).join(''):'';
 return `<article class="panel story-contract ${c.kind}"><div class="panel-label"><span>${c.kind==='major'?'MAJOR STORY MILESTONE':c.kind==='trial'?'BECOMING REAL TRIAL':'MINOR CONTRACT'}</span><span>${c.ready?'READY TO REPORT':c.active?'IN PROGRESS':'AVAILABLE'}</span></div><h3>${esc(c.title)}</h3><p class="story-employer">${esc(c.employer)} · ${esc(c.chapter)}</p><p>${esc(c.text)}</p>${objectives(c)}<div class="story-reward">Reward: ${esc(rewardText(c.reward))}</div>${c.available?'<p class="story-hint">Progress counts after you accept. Completed hunts pay their own rewards as well.</p>':''}${actions}${hunts?`<div class="story-buttons">${hunts}</div>`:''}${c.id==='municipal_works'&&c.active?button('story-delve','Prepare a descent →','subtle',!safe(s)):''}${bossReady(s,c)?button(`story-boss:${c.chapterId}`,'Face the chapter finale →','primary',!safe(s)):''}</article>`;
}
export function renderStorySummary(s){
 const story=G.storyState(s),active=story.active,next=active.find(c=>c.kind==='major')||active[0]||story.available[0]||story.nextMajor;
 const fresh=story.campaign.chapters.find(c=>c.unlocked&&!c.completed&&c.id>1),allDone=story.campaign.chapters.every(c=>c.completed);
 return `<section class="panel quest-panel"><div class="panel-label">CHAPTER ${story.campaign.current} OF 5 · ${story.majorCompleted} / ${story.majorTotal} MILESTONES</div>${fresh?`<p class="story-earned">NEW CHAPTER EARNED · ${esc(fresh.name)}</p>`:''}${allDone?'<p class="story-earned">THE FIVE CHAPTERS ARE COMPLETE</p>':''}<h3>${esc(next?.title||story.title)}</h3><p>${esc(next?.text||story.subtitle||'Continue the story and help the stuffies find their way home.')}</p>${next?.active?objectives(next):`<div class="quest-goal">${esc(story.stageLabel)}</div>`}${button('nav:story',active.some(c=>c.ready)?'Report a completed contract →':'Open story & contracts →','text-button full-width')}</section>`;
}
export function renderStory(s){
 const state=G.storyState(s),catalog=Object.values(G.STORY_CONTRACTS),actions=G.availableStoryActions(s),active=state.active,available=state.available;
 const chapters=state.campaign.chapters;
 const realReady=G.canBecomeReal?.(s);
 const realPanel=realReady?`<section class="panel story-contact"><div class="eyebrow">BECOMING REAL · RANK ${(s.realness||0)+1} READY</div><h3>All three Realness trials are complete.</h3><p>You have reached Level 50 and proven your seams, your memory, and your heart. Choose a permanent Becoming Real benefit to ascend to Realness ${(s.realness||0)+1} (Effective Level ${50*((s.realness||0)+1)+1}).</p><div class="story-buttons">${button('become-real-open','Review Becoming Real ascension →','primary',!safe(s))}</div></section>`:'';
 return `<section class="panel story-intro"><div class="eyebrow">CHAPTER ${state.campaign.current} OF 5 · A SLOWER STORY</div><h2>${esc(state.chapter)}: ${esc(state.title)}</h2><p>${esc(state.subtitle)}. Meet the stuffies who need a paw, take small jobs alongside the main story, and report each contract when its listed work is done.</p><p class="muted">Accepting a contract sets its progress baseline. Only later victories count, and every reward needs an explicit report.</p><div class="story-chapter-progress">${chapters.map(c=>`<span class="${c.completed?'complete':c.unlocked?'current':'locked'}">${c.completed?marker('check'):c.unlocked?'OPEN':'LOCKED'} · ${c.id}. ${esc(c.name)}</span>`).join('')}</div>${chapters.find(c=>c.unlocked&&!c.completed&&c.id>1)?`<p class="story-earned">A new chapter is yours: ${esc(chapters.find(c=>c.unlocked&&!c.completed&&c.id>1).name)}.</p>`:''}${chapters.every(c=>c.completed)?'<p class="story-earned">Every chapter is complete. The stuffies have found their way home.</p>':''}</section>${!safe(s)?'<div class="point-notice">Your current encounter or expedition is still active. You can review objectives here; return to town before accepting or reporting contracts.</div>':''}${realPanel}${actions.length?`<section class="panel story-contact"><div class="eyebrow">STORY CONTACT · ${esc(actions[0].id==='meet_mara'?'MARA PURL':active.find(c=>G.STORY_CONTRACTS[c.id].objectives.some(o=>o.action===actions[0].id))?.employer||'YOUR CURRENT CONTACT')}</div><h3>${esc(actions[0].label)}</h3><p>${esc(actions[0].text)}</p><div class="story-buttons">${actions.map(a=>`<div>${button('story-action:'+a.id,esc(a.label),'primary',!safe(s)||!a.enabled)}${a.reason?`<p class="story-hint">${esc(a.reason)}</p>`:''}</div>`).join('')}</div></section>`:''}<div class="story-columns"><section><div class="section-row"><h2>Accepted contracts</h2><small>${active.length} active</small></div>${active.length?active.map(c=>contractCard(s,c)).join(''):'<p class="empty-state">No active contract. Choose an available job to begin this chapter.</p>'}</section><section><div class="section-row"><h2>Work you can take</h2><small>Clear goals · no timers</small></div>${available.length?available.map(c=>contractCard(s,c)).join(''):'<p class="empty-state">Complete the current story step to open more work. Ordinary hunts remain available.</p>'}<details class="panel story-future"><summary>Later milestones & completed work</summary>${catalog.map(c=>{const v=G.contractStatus(s,c.id);if(v.active||v.available)return '';return `<div class="story-future-row"><strong>${v.completed?marker('check'):''}${esc(v.title)}</strong><span>${c.kind==='major'?'Chapter '+v.chapterId+' milestone':c.kind==='trial'?'Becoming Real trial':'Minor contract'}</span>${v.completed?'<p>Completed. Rewards remain claimed.</p>':`<p>${v.requirements.filter(r=>!r.met).map(r=>esc(r.label)).join(' · ')||'Available now'}</p>`}</div>`;}).join('')}</details></section></div>`;
}

/** The next explicit story decision, shared by rewards, prompts and navigation. */
export function getStoryNudge(s) {
 if(!s||s.fight||s.delve)return null;
 const state=G.storyState(s),ready=state.active.find(c=>c.ready),step=G.availableStoryActions(s).find(a=>a.enabled);
 if(ready)return {key:'report:'+ready.id,kind:'report',title:ready.title,text:'The objectives are complete. Mara is ready to hear your report.',label:'Report to Mara →',contract:ready};
 if(step)return {key:'action:'+step.id,kind:'action',title:step.label,text:step.text,label:step.label+' →',step};
 const finale=state.active.find(c=>bossReady(s,c));
 if(finale)return {key:'boss:'+finale.chapterId,kind:'boss',title:finale.title,text:'The chapter work is done. Begin the finale when you are ready.',label:'Face the chapter finale →',contract:finale};
 const next=state.available.find(c=>c.kind==='major')||state.available[0];
 if(next)return {key:'accept:'+next.id,kind:'accept',title:next.title,text:next.text,label:'Take the next story contract →',contract:next};
 const active=state.active.find(c=>c.kind==='major')||state.active[0];
 if(active){const objective=active.objectives.find(o=>!o.done),source=G.STORY_CONTRACTS[active.id].objectives.find(o=>o.id===objective?.id),enemy=source?.source==='victories'?G.ENEMIES.find(e=>e.id===source.enemy&&e.id!=='boss'&&e.level<=G.effectiveLevel(s)+2):null;return {key:'progress:'+active.id,kind:'progress',title:active.title,text:objective?`${objective.label}: ${objective.current} / ${objective.target}.`:active.text,contract:active,hunt:enemy};}
 return null;
}
export function renderStoryNudge(s) {
 if(s?.pending==='bossLoot')return '';
 const next=getStoryNudge(s);if(!next)return '';
 const label=next.kind==='report'?'CONTRACT READY TO REPORT':next.kind==='progress'?'YOUR STORY OBJECTIVE':next.kind==='boss'?'CHAPTER FINALE READY':'NEXT STORY STEP';
 const action=next.kind==='boss'?button(`story-boss:${next.contract.chapterId}`,esc(next.label),'primary'):next.kind!=='progress'?button('story-next',esc(next.label),'primary'):next.hunt?button('hunt:'+next.hunt.id,'Hunt '+esc(next.hunt.name)+' →','subtle',s.hp<=0):button('nav:story','Review this objective →','text-button');
 return `<aside class="reward-story-step" aria-label="Story progression"><span class="eyebrow">${label}</span><h3>${esc(next.title)}</h3><p>${esc(next.kind==='action'?'The way forward is open. Continue with the current contact; no more hunts are needed for this step.':next.text)}</p>${action}</aside>`;
}
