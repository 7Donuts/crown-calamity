// ARCHIVED PROVISIONAL TOOL: not approved for balance decisions; see handoffs/reports/g1a-partial-handoff.md.
// One-off G1-A report aggregation for G1-B. Reads completed earned walkthroughs only.
// Usage: node /tmp/crown-g1b-aggregate-g1a.mjs <raw-g1a-json> <output-measured-inputs.json> [raw-tier10-json]
import fs from 'node:fs';
const [src, dest, t10src] = process.argv.slice(2);
if (!src || !dest) throw new Error('Usage: node /tmp/crown-g1b-aggregate-g1a.mjs <raw-g1a-json> <output-measured-inputs.json> [raw-tier10-json]');
const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
const runs = Array.isArray(raw) ? raw : raw.campaignWalkthroughs || raw.walkthroughs || raw.runs;
if (!Array.isArray(runs)) throw new Error('Input needs an array of per-run campaignWalkthroughs, walkthroughs, or runs');
const complete = runs.filter(row => row.status !== 'incomplete' && row.receipts?.length === 5 && row.receiptGear?.length === 5);
if (!runs.length) throw new Error('No campaign runs found');
const median = xs => { const a=[...xs].sort((x,y)=>x-y); return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2; };
const rateByChapter = {}, rate25ByChapter = {}, rate4ByChapter = {}, ordinaryRateByChapter = {}, ordinaryRate25ByChapter = {}, ordinaryRate4ByChapter = {}, recurring = {}, chapterStats = {}, chapterStatsByKit = {};
for (const chapter of [2,3,4,5]) {
  const rates=[], rates25=[], rates4=[], ordinaryRates=[], ordinaryRates25=[], ordinaryRates4=[], recurringByRun=[], ordinaryCoins=[], encounterCoins=[], contractCoins=[], wins=[], finite=[];
  for (const run of runs) {
    const row=run.receiptGear?.find(x=>x.chapter===chapter);
    if (!row) continue;
    const activeHours=(row.intervalMinutes ?? 0)/60;
    const activeHours25=(row.intervalMinutesAt2_5sInput ?? row.intervalMinutes ?? 0)/60;
    const activeHours4=(row.intervalMinutesAt4sInput ?? row.intervalMinutes ?? 0)/60;
    const netCoins=(row.intervalEncounterCoins ?? 0)+(row.intervalContractCoinsAwarded ?? 0)-(row.chapterDefeatCoinsLost ?? 0);
    if (activeHours>0) rates.push(netCoins/activeHours);
    if (activeHours25>0) rates25.push(netCoins/activeHours25);
    if (activeHours4>0) rates4.push(netCoins/activeHours4);
    if (activeHours>0) ordinaryRates.push((row.ordinaryEncounterCoins ?? 0)/activeHours);
    if (activeHours25>0) ordinaryRates25.push((row.ordinaryEncounterCoins ?? 0)/activeHours25);
    if (activeHours4>0) ordinaryRates4.push((row.ordinaryEncounterCoins ?? 0)/activeHours4);
    if ((row.ordinaryWins ?? 0)>0) recurringByRun.push((row.ordinaryEncounterCoins ?? 0)/row.ordinaryWins);
    ordinaryCoins.push(row.ordinaryEncounterCoins ?? 0);
    encounterCoins.push(row.intervalEncounterCoins ?? 0);
    contractCoins.push(row.intervalContractCoinsAwarded ?? 0);
    wins.push(row.ordinaryWins ?? 0);
    finite.push(row.finiteSalePreviewCoins ?? 0);
  }
  if (!rates.length || !recurringByRun.length) throw new Error(`Missing complete-run income evidence in chapter ${chapter}`);
  rateByChapter[chapter]=median(rates);
  rate25ByChapter[chapter]=median(rates25);
  rate4ByChapter[chapter]=median(rates4);
  ordinaryRateByChapter[chapter]=median(ordinaryRates);
  ordinaryRate25ByChapter[chapter]=median(ordinaryRates25);
  ordinaryRate4ByChapter[chapter]=median(ordinaryRates4);
  recurring[chapter]=median(recurringByRun);
  chapterStats[chapter]={ sampleRunCount:rates.length, medianCampaignNetCoinsPerActiveHour:rateByChapter[chapter], medianCampaignNetCoinsPerActiveHourAt2_5s:rate25ByChapter[chapter], medianCampaignNetCoinsPerActiveHourAt4s:rate4ByChapter[chapter], medianOrdinaryOnlyCoinsPerActiveHour:ordinaryRateByChapter[chapter], medianOrdinaryOnlyCoinsPerActiveHourAt2_5s:ordinaryRate25ByChapter[chapter], medianOrdinaryOnlyCoinsPerActiveHourAt4s:ordinaryRate4ByChapter[chapter], medianOrdinaryCoinsPerOnLevelWin:recurring[chapter], medianOrdinaryWins:wins.length?median(wins):null, medianOrdinaryEncounterCoins:median(ordinaryCoins), medianIntervalEncounterCoins:median(encounterCoins), medianIntervalContractCoinAwards:median(contractCoins), medianCumulativeUnsoldSaleValueAtReceipt:median(finite) };
  chapterStatsByKit[chapter]={};
  for (const kit of ['breaker','duelist','caster']) {
    const rows=runs.filter(run=>run.kit===kit).map(run=>({run,row:run.receiptGear?.find(x=>x.chapter===chapter)})).filter(x=>x.row);
    const ordinaryPerWin=rows.filter(x=>x.row.ordinaryWins>0).map(x=>x.row.ordinaryEncounterCoins/x.row.ordinaryWins);
    const activeRates=rows.filter(x=>x.row.intervalMinutes>0).map(x=>x.row.ordinaryEncounterCoins/(x.row.intervalMinutes/60));
    const active25=rows.filter(x=>(x.row.intervalMinutesAt2_5sInput??0)>0).map(x=>x.row.ordinaryEncounterCoins/(x.row.intervalMinutesAt2_5sInput/60));
    const active4=rows.filter(x=>(x.row.intervalMinutesAt4sInput??0)>0).map(x=>x.row.ordinaryEncounterCoins/(x.row.intervalMinutesAt4sInput/60));
    chapterStatsByKit[chapter][kit]={receiptRuns:rows.length,medianOrdinaryCoinsPerOnLevelWin:ordinaryPerWin.length?median(ordinaryPerWin):null,medianOrdinaryOnlyCoinsPerActiveHour:activeRates.length?median(activeRates):null,medianOrdinaryOnlyCoinsPerActiveHourAt2_5s:active25.length?median(active25):null,medianOrdinaryOnlyCoinsPerActiveHourAt4s:active4.length?median(active4):null};
  }
}
const actualT10 = runs.flatMap(run => (run.purchases || []).filter(p => p.slot === 'weapon' && p.tier === 10).map(p => p.minute/60));
let t10Stats={};
if (t10src) {
  const rows=JSON.parse(fs.readFileSync(t10src,'utf8'));
  const completeT10=rows.filter(row=>row.status==='completed'&&Number.isFinite(row.totalMinutesAt2_5sInput));
  const medianField=(xs,key)=>xs.length?median(xs.map(row=>row[key]).filter(Number.isFinite).map(Number).filter(x=>x>=0)):null;
  for (const sell of [false,true]) { const subset=completeT10.filter(row=>row.sellDrops===sell); t10Stats[sell?'repeatSales':'noSales']={completedRows:subset.length,totalHoursAt2_5s:medianField(subset,'totalMinutesAt2_5sInput')/60,totalHoursAt4s:medianField(subset,'totalMinutesAt4sInput')/60,postC2HoursAt2_5s:medianField(subset,'minutesAfterC2ReceiptAt2_5sInput')/60,medianWins:medianField(subset,'wins'),medianEncounterCoins:medianField(subset,'encounterCoins'),medianActualSaleReceipts:medianField(subset,'saleCoins')}; }
}
const out={
  chapter5RecurringCoinsPerOnLevelWin:recurring[5],
  coinsPerActiveHourByChapter:ordinaryRateByChapter,
  coinsPerActiveHourAt2_5sByChapter:ordinaryRate25ByChapter,
  coinsPerActiveHourAt4sByChapter:ordinaryRate4ByChapter,
  campaignNetCoinsPerActiveHourByChapter:rateByChapter,
  campaignNetCoinsPerActiveHourAt2_5sByChapter:rate25ByChapter,
  campaignNetCoinsPerActiveHourAt4sByChapter:rate4ByChapter,
  chapter2Tier10WeaponHours: t10Stats.noSales?.totalHoursAt2_5s ?? (actualT10.length ? median(actualT10) : null),
  chapter2Tier10ObservedPurchases: t10Stats.noSales?.completedRows ?? actualT10.length,
  chapter2Tier10At2_5s: t10Stats,
  evidence:`${complete.length}/${runs.length} runs reached all five receipts; chapter rates use all runs that reached that chapter's earned receipt`,
  completeRunCount:complete.length, totalRunCount:runs.length,
  sourceCommit:raw.sourceCommit || raw.commit || '2f04f24fb03cf524d25f70921c42900dc11f21e',
  tier10ToolSHA:t10src?'fd71920f42bdcb3f991f98cb7e3c167ada2720add786d29dd2c34e4815dc1cb7':null,
  seedCount:raw.seedCount || '40 seeds (1–40) per kit; 120 rows total; buyUpgrades=true only',
  command:raw.command || "cd /workspace/worktrees/crown-g1a; timeout 600s node --input-type=module; import runCampaignWalkthrough; for kit in breaker/duelist/caster and seed 1–40, buyUpgrades:true; JSON output to /tmp/crown-g1a-analysis/g1a-earned-primary-40.json",
  chapterStats,
  chapterStatsByKit,
  limits:'Only completed five-receipt earned walkthroughs are summarized. Pricing coins/hour uses only ordinary hunt payouts divided by the full measured chapter active interval (a conservative recurring-only rate; time includes story/contract actions). A separate campaign net rate includes boss/delve encounter payouts and contract awards, subtracts chapter defeat coin loss, and excludes sales. Sustainable per-win rate uses only ordinary hunt payouts; scripted bosses/delves/contracts are excluded. Unsold inventory is reported separately as finite incremental resale preview value.'
};
fs.writeFileSync(dest,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
