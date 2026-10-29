export const PARTS_PER_LEVEL=4;
export const LEVEL_CAP=10;

export function xpNeeded(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return (100+40*(l-1)+8*(l-1)**2)*3;
}

export function partThresholds(level){
  const need=xpNeeded(level);
  return [1,2,3,4].map(n=>Math.ceil(need*n/PARTS_PER_LEVEL));
}

export function partForXP(level,xp){
  if(level>=LEVEL_CAP)return 1;
  const value=Math.max(0,Number.isFinite(xp)?xp:0);
  return 1+partThresholds(level).slice(0,3).filter(mark=>value>=mark).length;
}

export function progression(s){
  const level=Math.max(1,Math.min(LEVEL_CAP,Math.floor(Number(s?.level)||1)));
  const xp=level>=LEVEL_CAP?0:Math.max(0,Math.min(xpNeeded(level)-1,Math.floor(Number(s?.xp)||0)));
  const part=partForXP(level,xp),thresholds=partThresholds(level);
  const partStart=part===1?0:thresholds[part-2],partEnd=thresholds[part-1];
  return {
    level,part,parts:PARTS_PER_LEVEL,
    partXP:level>=LEVEL_CAP?0:Math.max(0,xp-partStart),partRequired:level>=LEVEL_CAP?0:partEnd-partStart,
    levelXP:xp,levelRequired:level>=LEVEL_CAP?0:xpNeeded(level),
    nextReward:level>=LEVEL_CAP?null:'1 attribute point',
    totalEarned:4*(level-1)+(part-1),capped:level>=LEVEL_CAP
  };
}

export function pointBudget(s){
  const p=progression(s);
  return 68+4*(p.level-1)+(p.part-1);
}

export function advanceXP(s,amount){
  let remaining=Math.max(0,Math.floor(Number.isFinite(amount)?amount:0)),parts=0,levels=0;
  if(s.level>=LEVEL_CAP||remaining===0)return {parts,levels};
  s.xp=Math.max(0,Math.floor(Number.isFinite(s.xp)?s.xp:0));
  s.part=partForXP(s.level,s.xp);
  while(remaining>0&&s.level<LEVEL_CAP){
    const thresholds=partThresholds(s.level),target=thresholds[s.part-1],needed=Math.max(0,target-s.xp);
    if(remaining<needed){s.xp+=remaining;remaining=0;break;}
    remaining-=needed;s.xp=target;s.points=(Number.isInteger(s.points)?s.points:0)+1;parts++;
    if(s.part===PARTS_PER_LEVEL){s.level++;levels++;s.xp=0;s.part=1;}
    else s.part++;
  }
  if(s.level>=LEVEL_CAP){s.xp=0;s.part=1;}
  return {parts,levels};
}

export function migrateLegacyProgression(s){
  if(!s||s.version>=4)return s;
  const oldLevelXP=100+40*(s.level-1)+8*(s.level-1)**2;
  const oldXP=Math.max(0,Number.isFinite(s.xp)?s.xp:0);
  if(s.level>=LEVEL_CAP){s.xp=0;s.part=1;return s;}
  const fraction=Math.max(0,Math.min(1,oldXP/oldLevelXP));
  s.xp=Math.min(xpNeeded(s.level)-1,Math.round(fraction*xpNeeded(s.level)));
  s.part=partForXP(s.level,s.xp);
  s.points=(Number.isInteger(s.points)?s.points:0)+(s.part-1);
  return s;
}
