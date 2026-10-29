import {loadSave,createCharacter} from './engine.js';

export const ROSTER_VERSION=1;
export const MAX_CHARACTERS=6;
const copy=value=>JSON.parse(JSON.stringify(value));
const locked=state=>!!(state?.fight||state?.delve);
export function emptyRoster(){return {version:ROSTER_VERSION,activeId:null,nextId:1,characters:[]};}
export function activeCharacter(roster){return roster?.characters?.find(entry=>entry.id===roster.activeId)?.state||null;}
export function rosterCanChange(roster,currentState=activeCharacter(roster)){
 return !locked(currentState);
}
export function saveActiveCharacter(roster,state){
 const entry=roster?.characters?.find(entry=>entry.id===roster.activeId);
 if(!entry||!state)return false;
 entry.state=copy(state);return true;
}
function addState(roster,state,currentState){
 if(!roster||!Array.isArray(roster.characters)||roster.characters.length>=MAX_CHARACTERS||locked(currentState)||!state)return null;
 if(roster.activeId&&currentState)saveActiveCharacter(roster,currentState);
 let id;do{id='character-'+roster.nextId++;}while(roster.characters.some(entry=>entry.id===id));
 roster.characters.push({id,state:copy(state)});roster.activeId=id;
 return {id,state:copy(state)};
}
export function createRosterCharacter(roster,options,currentState=activeCharacter(roster)){
 if(!rosterCanChange(roster,currentState)||roster.characters.length>=MAX_CHARACTERS)return null;
 return addState(roster,createCharacter(options),currentState);
}
export function importRosterCharacter(roster,raw,currentState=activeCharacter(roster)){
 if(!rosterCanChange(roster,currentState)||roster.characters.length>=MAX_CHARACTERS)return null;
 const state=loadSave(typeof raw==='string'?raw:JSON.stringify(raw));
 return addState(roster,state,currentState);
}
export function switchCharacter(roster,id,currentState=activeCharacter(roster)){
 const entry=roster?.characters?.find(value=>value.id===id);
 if(!entry||id===roster.activeId||locked(currentState))return null;
 if(roster.activeId&&currentState)saveActiveCharacter(roster,currentState);
 roster.activeId=id;return copy(entry.state);
}
export function loadRoster(raw,legacyRaw=null){
 if(raw){
  try{
   const source=JSON.parse(raw);
   if(source?.version!==ROSTER_VERSION||!Array.isArray(source.characters)||source.characters.length>MAX_CHARACTERS)return null;
   const characters=[],ids=new Set();
   for(const entry of source.characters){
    if(!entry||typeof entry.id!=='string'||!entry.id||ids.has(entry.id))return null;
    const state=loadSave(JSON.stringify(entry.state));if(!state)return null;
    ids.add(entry.id);characters.push({id:entry.id,state});
   }
   if(characters.length&&!ids.has(source.activeId))return null;
   return {version:ROSTER_VERSION,activeId:characters.length?source.activeId:null,nextId:Number.isInteger(source.nextId)&&source.nextId>0?source.nextId:characters.length+1,characters};
  }catch{return null;}
 }
 const roster=emptyRoster();
 if(legacyRaw){const state=loadSave(legacyRaw);if(state)addState(roster,state,null);}
 return roster;
}
