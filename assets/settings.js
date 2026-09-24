const RACES = ['Formless','Undead','Brute','Plant','Insect','Fish','Demon','Demi-Human','Angel','Dragon'];
const SETTINGS_KEY = 'ro-general-map-exp-tool-settings-v1';
const DEFAULT_SETTINGS = Object.freeze({playerLevel:100,partySize:1,playerDamage:1000000,searchBox:'',enforceLevelLock:true,filterEvent:false,filterSpawn:false,filterEp20:false,filterHits:false,
  spotlightEvent:'auto',dailyDungeonMode:'hide',serverBonus:0,manualBonus:0,kafraBonus:0,malangdoBonus:0,premiumBonus:0,
  staffBonus:0,gearBonus:0,richManBonus:0,customBonus:0,
  ...Object.fromEntries(RACES.map(r=>['race'+r,0]))});
function sortedEvents(events) { return [...events].sort((a,b)=>b.start.localeCompare(a.start)); }
function activeSpotlight(events, now=new Date()) {
  // Apply from 12:00 Thailand time on the start date and stop at 06:00 on the final date.
  const time=now.getTime();
  return sortedEvents(events).find(e=>time>=Date.parse(e.start+'T12:00:00+07:00') &&
    time<Date.parse(e.end+'T06:00:00+07:00'))||null;
}
function spotlightCoverage(events, now=new Date()) {
  const lastEnd=events.reduce((last,event)=>event.end>last?event.end:last,'');
  return {lastEnd,expired:!lastEnd || now.getTime()>=Date.parse(lastEnd+'T06:00:00+07:00')};
}
function sharedSettings(hash, events) {
  const value=new URLSearchParams(hash.replace(/^#/, '')).get('settings');
  if(!value)return null;
  if(value.length>12000)throw new Error('Shared settings too long');
  const data=JSON.parse(value);
  if(data.version!==1 || !data.settings || typeof data.settings!=='object' || Array.isArray(data.settings))throw new Error('Invalid shared settings');
  return cleanSettings(data.settings,events);
}
function cleanSettings(raw, events) {
  const clean={...DEFAULT_SETTINGS};
  if(!raw || typeof raw!=='object' || Array.isArray(raw))return clean;
  const choices={manualBonus:[0,50,100,200],kafraBonus:[0,50],malangdoBonus:[0,10,20],premiumBonus:[0,20],staffBonus:[0,30],richManBonus:[0,60]};
  for(const key of Object.keys(clean)){
    const value=raw[key];
    if(key==='spotlightEvent'){
      if(['auto','none',...events.map(e=>e.id)].includes(value))clean[key]=value;
    }else if(key==='dailyDungeonMode'){
      if(['hide','compare','only'].includes(value))clean[key]=value;
    }else if(key==='searchBox'){
      if(typeof value==='string')clean[key]=value.slice(0,200);
    }else if(key==='enforceLevelLock'||key.startsWith('filter')){
      if(typeof value==='boolean')clean[key]=value;
    }else if(typeof value==='number' && Number.isFinite(value)){
      if(choices[key]){if(choices[key].includes(value))clean[key]=value;}
      else clean[key]=Math.min(key==='playerLevel'?260:key==='partySize'?12:key==='playerDamage'?1e12:10000,Math.max(key==='playerLevel'||key==='partySize'||key==='playerDamage'?1:0,Math.floor(value)));
    }
  }
  return clean;
}
