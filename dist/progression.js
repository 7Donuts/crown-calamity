export const LEVEL_CAP=10;

export function xpNeeded(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return (100+40*(l-1)+8*(l-1)**2)*3;
}

export function progression(s){
  const level=Math.max(1,Math.min(LEVEL_CAP,Math.floor(Number(s?.level)||1)));
  const xp=level>=LEVEL_CAP?0:Math.max(0,Math.min(xpNeeded(level)-1,Math.floor(Number(s?.xp)||0)));
  const levelPointsPaid=level>=LEVEL_CAP?0:Math.max(0,Math.min(3,Math.floor(Number(s?.levelPointsPaid)||0)));
  return {
    level,levelXP:xp,levelRequired:level>=LEVEL_CAP?0:xpNeeded(level),
    nextReward:level>=LEVEL_CAP?null:`${4-levelPointsPaid} attribute point${4-levelPointsPaid===1?'':'s'}`,
    totalEarned:4*(level-1)+levelPointsPaid,capped:level>=LEVEL_CAP
  };
}

export function pointBudget(s){
  const p=progression(s);
  return 68+4*(p.level-1)+(p.capped?0:Math.max(0,Math.min(3,Math.floor(Number(s?.levelPointsPaid)||0))));
}

export function advanceXP(s,amount){
  let remaining=Math.max(0,Math.floor(Number.isFinite(amount)?amount:0)),levels=0,points=0;
  if(s.level>=LEVEL_CAP||remaining===0)return {levels,points};
  s.xp=Math.max(0,Math.floor(Number.isFinite(s.xp)?s.xp:0));
  s.levelPointsPaid=Math.max(0,Math.min(3,Math.floor(Number(s.levelPointsPaid)||0)));
  while(remaining>0&&s.level<LEVEL_CAP){
    const needed=Math.max(0,xpNeeded(s.level)-s.xp);
    if(remaining<needed){s.xp+=remaining;remaining=0;break;}
    remaining-=needed;s.points=(Number.isInteger(s.points)?s.points:0)+(4-s.levelPointsPaid);
    points+=4-s.levelPointsPaid;s.level++;levels++;s.xp=0;s.levelPointsPaid=0;
  }
  if(s.level>=LEVEL_CAP)s.xp=0;
  return {levels,points};
}

export function migrateLegacyProgression(s){
  if(!s||s.version>=5)return s;
  const sourceVersion=Math.max(1,Math.floor(Number(s.version)||1));
  let paid=0;
  if(sourceVersion<4){
    const oldLevelXP=100+40*(s.level-1)+8*(s.level-1)**2;
    const oldXP=Math.max(0,Number.isFinite(s.xp)?s.xp:0);
    if(s.level>=LEVEL_CAP){s.xp=0;}
    else{
      const fraction=Math.max(0,Math.min(1,oldXP/oldLevelXP));
      s.xp=Math.min(xpNeeded(s.level)-1,Math.round(fraction*xpNeeded(s.level)));
      paid=Math.min(3,Math.floor(s.xp*4/xpNeeded(s.level)));
      s.points=(Number.isInteger(s.points)?s.points:0)+paid;
    }
  }else{
    paid=s.level>=LEVEL_CAP?0:Math.max(0,Math.min(3,Math.floor(Number(s.part)||1)-1));
  }
  s.levelPointsPaid=paid;
  delete s.part;
  return s;
}
