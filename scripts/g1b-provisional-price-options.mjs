// ARCHIVED PROVISIONAL TOOL: not approved for balance decisions; see handoffs/reports/g1a-partial-handoff.md.
// One-off CP1 curve table generator; run with a measured-input JSON path.
// It generates candidate tables only. It does not read or edit game source.
import fs from 'node:fs';

const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: node /tmp/crown-g1b-price-options.mjs /tmp/g1b-measured-inputs.json');
const d = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const required = ['chapter5RecurringCoinsPerOnLevelWin', 'coinsPerActiveHourByChapter'];
for (const key of required) if (!(Number.isFinite(d[key]) || (d[key] && typeof d[key] === 'object'))) throw new Error(`Missing measured input: ${key}`);
const i5 = d.chapter5RecurringCoinsPerOnLevelWin;
const postE = d.postStoryEntryE || 54;
const postCoins = Math.round(1.1 * postE);
const postEntryPrice = 300 * postCoins;
const e51Coins = Math.round(1.1 * 51);
const e51EntryPrice = 300 * e51Coins;
const rates = d.coinsPerActiveHourByChapter;
const rates25 = d.coinsPerActiveHourAt2_5sByChapter || rates;
const rates4 = d.coinsPerActiveHourAt4sByChapter || rates;
const campaignRates = d.campaignNetCoinsPerActiveHourByChapter || {};
const campaignRates25 = d.campaignNetCoinsPerActiveHourAt2_5sByChapter || campaignRates;
const campaignRates4 = d.campaignNetCoinsPerActiveHourAt4sByChapter || campaignRates;
if (!(i5 > 0)) throw new Error('Chapter 5 recurring income per win must be positive');
for (const c of [2, 3, 4, 5]) if (!(rates[c] > 0 && rates25[c] > 0 && rates4[c] > 0)) throw new Error(`Missing positive measured active coins/hour for chapter ${c}`);
const c2t10Hours = d.chapter2Tier10WeaponHours;
const c2t10SellHours = d.chapter2Tier10At2_5s?.repeatSales?.totalHoursAt2_5s;
const categories = { offhand: 16, head: 18, body: 24, hands: 14, feet: 14, accessory: 22 };
const currentTier4Multiplier = 3.2 ** 3;
const fmt = n => Math.round(n).toLocaleString('en-US');
const hfmt = n => Number(n.toFixed(2)).toString();
const c2t10Label = c2t10Hours > 0 ? `${hfmt(c2t10Hours)} h at 2.5s measured with no sales${c2t10SellHours > 0 ? `; ${hfmt(c2t10SellHours)} h with a repeat-drop sale loop` : ''}` : 'no completed earned run bought a tier-10 weapon; the 8–12h aspiration remains unverified';

const targets = [
  { name: 'A · entry aligned', wins: 300, armorRatio: 0.25 },
  { name: 'B · middle', wins: 1000, armorRatio: 0.5 },
  { name: 'C · best gear aligned', wins: 2000, armorRatio: 1.0 }
];
const lines = [
  '# G1-B candidate price tables (generated)',
  '',
  `Measured input: Chapter 5 sustainable recurring income ${i5} coins/on-level win. Post-story endpoint assumption: E${postE}, round(1.1×E)=${postCoins} coins/win; 300-win T26 entry=${fmt(postEntryPrice)} coins. E51 sensitivity is ${e51Coins} coins/win and ${fmt(e51EntryPrice)} coins for 300 wins. Chapter 2 T10 purchase: ${c2t10Label}.`,
  `Measured active coin rates by chapter: ${[2, 3, 4, 5].map(c => `C${c} ${rates[c]} coins/hour`).join('; ')}.`,
  `Input evidence: ${d.evidence || 'not supplied'}.`,
  '',
  '| Chapter | Ordinary-only coins/hour 1.5s | 2.5s | 4s | Full campaign net coins/hour 1.5s | Ordinary coins/on-level win | Finite unsold value at receipt |',
  '|---:|---:|---:|---:|---:|---:|---:|',
  ...[2,3,4,5].map(c => { const x=d.chapterStats?.[c]||{}; return `| ${c} | ${hfmt(rates[c])} | ${hfmt(rates25[c])} | ${hfmt(rates4[c])} | ${hfmt(campaignRates[c] || 0)} | ${hfmt(x.medianOrdinaryCoinsPerOnLevelWin ?? (c===5 ? i5 : NaN))} | ${fmt(x.medianCumulativeUnsoldSaleValueAtReceipt || 0)} |`; }),
  '',
  'Weapon T1=100 and T10=10,000 are held fixed. T11–25 use geometric interpolation from T10 to a T25 endpoint defined as 300/1,000/2,000 post-story wins × the spec 50 on-level payout at the assumed entry E. Purchase hours use G1-A ordinary-only earned income divided by the full measured active interval. Boss, delve, contract coin awards and sales are shown separately and are not treated as recurring for primary hour estimates.',
  ''
];
for (const option of targets) {
  const p25 = option.wins * postCoins;
  const ratio = p25 / 10000;
  const valid = p25 > 10000;
  const weapon = Object.fromEntries(Array.from({ length: 16 }, (_, j) => {
    const tier = 10 + j;
    return [tier, Math.round(10000 * ratio ** (j / 15))];
  }));
  lines.push(`## ${option.name}`,'',`T25 = ${option.wins.toLocaleString('en-US')} post-story wins at E${postE} = ${fmt(p25)} coins; T26 entry at 300 wins = ${fmt(postEntryPrice)} coins; T25/T26 price ratio ${hfmt(p25 / postEntryPrice)}×. At E51 the corresponding 300-win entry is ${fmt(e51EntryPrice)} coins (T25/entry ${hfmt(p25 / e51EntryPrice)}×). Chapter-best weapon estimates: ${[15,20,25].map((tier, i) => { const c=i+3, p=weapon[tier]; return `T${tier}/C${c} ${fmt(p)} coins / ${hfmt(p/rates[c])}, ${hfmt(p/rates25[c])}, ${hfmt(p/rates4[c])} h at 1.5s/2.5s/4s`; }).join('; ')}. ${valid ? 'Weapon tiers increase from T10.' : 'INVALID: T25 does not exceed the fixed T10 price.'}`,'');
  lines.push('C5 per-kit sensitivity at 2.5s input:');
  lines.push('| Kit | C5 receipt runs | Ordinary coins/win | Ordinary coins/hour | T25 hours |','|---|---:|---:|---:|---:|');
  for (const kit of ['breaker','duelist','caster']) { const k=d.chapterStatsByKit?.[5]?.[kit]||{}; const h=k.medianOrdinaryOnlyCoinsPerActiveHourAt2_5s; lines.push(`| ${kit} | ${k.receiptRuns ?? '—'} | ${hfmt(k.medianOrdinaryCoinsPerOnLevelWin ?? NaN)} | ${hfmt(h ?? NaN)} | ${hfmt(p25 / (h || 1))} |`); }
  lines.push('');
  lines.push('| Tier | Chapter | Price | Equivalent C5 ordinary wins | Ordinary-only hours 1.5s | 2.5s | 4s | 2.5s hours after one-time sales |','|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (let tier = 11; tier <= 25; tier++) {
    const chapter = tier <= 15 ? 3 : tier <= 20 ? 4 : 5;
    const sale = d.chapterStats?.[chapter]?.medianCumulativeUnsoldSaleValueAtReceipt || 0;
    lines.push(`| ${tier} | ${chapter} | ${fmt(weapon[tier])} | ${hfmt(weapon[tier] / i5)} | ${hfmt(weapon[tier] / rates[chapter])} | ${hfmt(weapon[tier] / rates25[chapter])} | ${hfmt(weapon[tier] / rates4[chapter])} | ${hfmt(Math.max(0, weapon[tier] - sale) / rates25[chapter])} |`);
  }
  lines.push('',`Armor target ratio: body tier 6/8/10 is ${option.armorRatio * 100}% of that chapter’s best weapon. All armor categories use their current base and the same tier multiplier; T1–4 remain at the current 3.2 geometric schedule. T5/7/9 are log-interpolated between the prior tier and next chapter-best tier.`, '');
  const targetTier = { 3: 6, 4: 8, 5: 10 };
  const targetWeaponTier = { 3: 15, 4: 20, 5: 25 };
  const multiplier = { 4: currentTier4Multiplier };
  for (const chapter of [3,4,5]) multiplier[targetTier[chapter]] = option.armorRatio * weapon[targetWeaponTier[chapter]] / categories.body;
  for (const tier of [5,7,9]) multiplier[tier] = Math.sqrt(multiplier[tier-1] * multiplier[tier+1]);
  lines.push('| Armor tier | Chapter | Shared multiplier | Body price | Body ordinary-only hours 1.5s / 2.5s / 4s | 2.5s hours after sale preview | Category prices (offhand/head/body/hands/feet/accessory) |','|---:|---:|---:|---:|---:|---:|---|');
  for (const tier of [5,6,7,8,9,10]) {
    const chapter = Math.ceil(tier / 2);
    const bodyPrice = Math.round(categories.body * multiplier[tier]);
    const prices = Object.entries(categories).map(([slot, base]) => `${slot} ${fmt(Math.round(base * multiplier[tier]))}`).join('; ');
    const sale = d.chapterStats?.[chapter]?.medianCumulativeUnsoldSaleValueAtReceipt || 0;
    lines.push(`| ${tier} | ${chapter} | ${hfmt(multiplier[tier])} | ${fmt(bodyPrice)} | ${hfmt(bodyPrice / rates[chapter])} / ${hfmt(bodyPrice / rates25[chapter])} / ${hfmt(bodyPrice / rates4[chapter])} | ${hfmt(Math.max(0, bodyPrice - sale) / rates25[chapter])} | ${prices} |`);
  }
  lines.push('',`Armor-to-weapon ratio choices are proposals for owner review, not approved targets. Chapter 2 T10 reference: ${c2t10Label}.`, '');
}
lines.push('## Inputs and limits','',`Source commit: ${d.sourceCommit || 'not supplied'}. Seeds: ${d.seedCount || 'not supplied'} per relevant cell. Exact measurement command: ${d.command || 'not supplied'}.`,'','The income inputs must come from the earned G1-A walkthrough. A synthetic region-farm or fixed-build B0 result cannot replace campaign-earned income. B0 combat cells provide survivability/action-count context only; they do not measure coins. The price options are not an owner selection and do not implement a curve.');
console.log(lines.join('\n'));
