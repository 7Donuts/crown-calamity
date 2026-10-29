// Special Edition rendering (design 37, R4): the hunting-list offer card, the encounter banner and the victory note.
// Presentation only. Every number is read from the same shared data the engine uses (applyVariant, variantReward).
import * as G from './engine.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const heavyRaw=e=>Math.floor(e.damage*2.15*(e.heavyMult||1));
const change=(label,now,was)=>now===was?`<li><span>${label}</span><strong>${now}</strong></li>`:`<li><span>${label}</span><strong>${now}</strong><small>regular ${was}</small></li>`;

/** The offer card shown under the regular hunt row. Disclosure and consent: the affix, its effect and the reward come before any exchange. */
export function renderVariantOffer(state,enemy,{disabled=false}={}){
 const ref=G.pendingOffer(state,enemy.id),affix=ref&&G.affixById(ref.id);if(!affix)return '';
 const fought=G.applyVariant(enemy,ref);
 return `<section class="variant-offer" aria-label="${G.VARIANT_LABEL} ${esc(enemy.name)}, optional hunt">
  <div class="variant-offer__head"><span class="variant-offer__eyebrow">${G.VARIANT_LABEL.toUpperCase()} · OPTIONAL</span><strong>${esc(affix.name)} ${esc(enemy.name)}</strong></div>
  <p class="variant-offer__effect">${esc(affix.effect)} <span>${esc(affix.flavor)}</span></p>
  <ul class="variant-offer__stats" aria-label="Stats compared with the regular hunt">${change('Health',fought.hp,enemy.hp)}${change('Armor',fought.armor,enemy.armor)}${change('Ward',fought.ward,enemy.ward)}${change('Heavy attack (raw)',heavyRaw(fought),heavyRaw(enemy))}</ul>
  <p class="variant-offer__rule"><strong>When:</strong> ${esc(affix.trigger)} <strong>Limit:</strong> ${esc(affix.bound)}</p>
  <p class="variant-offer__reward"><strong>Reward:</strong> ${esc(G.rewardSummary(enemy,G.materialLabel(enemy.material)))}</p>
  <p class="care-label">${esc(G.VARIANT_TEXT.notice)}</p>
  <p class="variant-offer__optional">${esc(G.VARIANT_TEXT.optional)}</p>
  <button type="button" class="primary variant-offer__start" data-action="hunt-special:${esc(enemy.id)}" ${disabled?'disabled':''}>Start the ${G.VARIANT_LABEL} hunt →</button>
  <small class="variant-offer__source">${esc(G.VARIANT_TEXT.footer)}</small>
 </section>`;
}

/** Meter progress for enemies that have started one and have no offer pending. Plain text so nothing is hidden. */
export function renderVariantProgress(state,enemies){
 const rows=enemies.filter(e=>G.isVariantEnemy(e.id)).map(e=>({e,p:G.variantProgress(state,e.id)})).filter(({p})=>!p.offer&&p.meter>0);
 const intro=`${G.VARIANT_LABEL} offers come after ${G.VARIANT_THRESHOLD} victories over the same enemy. Nothing is random, and declining an offer never rerolls it.`;
 if(!rows.length)return `<p class="variant-progress">${esc(intro)}</p>`;
 return `<p class="variant-progress">${esc(intro)} Progress: ${rows.map(({e,p})=>`${esc(e.name)} ${p.meter}/${p.threshold}`).join(' · ')}.</p>`;
}

/** Banner for the encounter header, driven only by the stored fight.variant. */
export function renderVariantBanner(fight,enemy){
 const affix=fight?.variant&&G.affixById(fight.variant.id);if(!affix)return '';
 const barrier=fight.variantState?.barrier||0,charged=fight.variantState?.charged;
 return `<div class="variant-banner" role="note" aria-label="${G.VARIANT_LABEL}: ${esc(affix.name)}"><strong>${G.VARIANT_LABEL.toUpperCase()} · ${esc(affix.name)}</strong><span>${esc(affix.effect)} Reward adjusted: XP ×${G.VARIANT_REWARDS.xp}, coins ×${G.VARIANT_REWARDS.coins}, +${G.VARIANT_REWARDS.materials} extra ${esc(G.materialLabel(enemy.material))}.</span>${fight.variant.id==='static'?`<span class="variant-banner__state">${barrier>0?`Static barrier: ${barrier} left.`:charged?'Static barrier used up.':'Static barrier: not charged yet.'}</span>`:''}</div>`;
}

/** Result note: what a Special Edition victory added, and a reminder whenever an offer for this enemy is still waiting (after a regular win, a defeat or a withdrawal). */
export function renderVariantReceipt(state,receipt,enemy){
 if(!receipt)return '';
 const parts=[];
 const affix=receipt.variant&&G.affixById(receipt.variant.id);
 if(receipt.type==='victory'&&affix&&receipt.bonus)parts.push(`<p class="variant-receipt"><strong>${G.VARIANT_LABEL.toUpperCase()} · ${esc(affix.name)}</strong> Reward adjusted accordingly: +${receipt.bonus.xp} bonus XP, +${receipt.bonus.coins} bonus coins, +${receipt.bonus.materials} extra ${esc(G.materialLabel(receipt.material))}. The offer is cleared and its meter starts over at 0/${G.VARIANT_THRESHOLD}.</p>`);
 if(enemy&&G.pendingOffer(state,enemy.id)&&!affix)parts.push(`<p class="variant-receipt">${esc(G.VARIANT_TEXT.pending(enemy.name))}${receipt.variantOffer?' It was just added.':''}</p>`);
 return parts.join('');
}
