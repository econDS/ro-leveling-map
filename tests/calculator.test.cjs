const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const context = vm.createContext({URLSearchParams});
for (const file of ['assets/data/ep20.js','assets/data/spotlight-maps.js','assets/data/spotlight-2026.js','assets/data/spotlight-2025.js','assets/data/monster-races.js','assets/settings.js','assets/data/map-geometry.js','assets/data/planning-context.js','assets/calculator.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'), context);
}
const inline = html.match(/<script>\s*(const MAPS =[\s\S]*?)<\/script>/)[1];
vm.runInContext(inline + '\nthis.api={MAPS,EP20_MAPS,SPOTLIGHT_EVENTS,row,levelYield,spotlightRule,eventSpawnRule,monsterEventAmount,monsterEventExp,monsterRace,monsterFactor,RACES,DEFAULT_SETTINGS,cleanSettings,activeSpotlight,sortedEvents};',context);
const {MAPS,EP20_MAPS,SPOTLIGHT_EVENTS,row,levelYield,spotlightRule,eventSpawnRule,monsterEventAmount,monsterEventExp,monsterRace,monsterFactor,RACES,DEFAULT_SETTINGS,cleanSettings,activeSpotlight,sortedEvents}=context.api;
const map = code=>MAPS.find(m=>m.code===code);
const event = index=>SPOTLIGHT_EVENTS[index];
const config = (e=null,level=240)=>({event:e,level,lock:false,partyShare:1/3,external:7.72});
const approx=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1,Math.abs(b))*1e-10,`${a} != ${b}`);
const includesArchivedMap=vm.runInContext('includesArchivedMap',context);
const {matchesMapSearch,spotlightCoverage,sharedSettings}=vm.runInContext('({matchesMapSearch,spotlightCoverage,sharedSettings})',context);

test('Confirmed outdoor warp access changes filtering without changing EXP or other dungeons',()=>{
  const before=JSON.stringify(MAPS);
  const c={...config(null,100),lock:true};
  for(const code of ['jor_back1','jor_back2','jor_back3']){
    const result=row(map(code),c);
    assert.equal(result.min,1);assert.equal(result.locked,false);
    approx(result.finalPerKill,row(map(code),{...c,lock:false}).finalPerKill);
  }
  for(const code of ['jor_ab01','jor_ab02','ant_d02_i'])assert.equal(row(map(code),c).locked,true);
  assert.equal(JSON.stringify(MAPS),before);
});
test('Search finds English names and aliases while preserving Thai names and map codes',()=>{
  for(const [code,query] of [['mag_dun02','magma'],['mag_dun03','MAGMA'],['oz_dun01','Oz Labyrinth'],['ba_pw03','Magic Power Plant 2'],['jor_back2','Frozen Scale'],['oz_dun01','oz_dun01']])assert.equal(matchesMapSearch(map(code),query),true);
  assert.equal(matchesMapSearch(map('jor_back2'),'magma'),false);
});
test('Public map and monster names contain no Korean locale text',()=>{
  const names=[];
  for(const m of MAPS){names.push(m.name,...(m.monsters||[]).map(mon=>mon.name),...(m.excludedBosses||[]));}
  for(const e of SPOTLIGHT_EVENTS)for(const r of e.rules)names.push(r.name);
  assert.ok(names.every(name=>!/[\uAC00-\uD7AF]/.test(name)),names.find(name=>/[\uAC00-\uD7AF]/.test(name)));
});
test('Catalog expiry follows the Thai maintenance boundary without treating an earlier gap as expired',()=>{
  const events=[{start:'2026-08-26',end:'2026-09-23'}];
  assert.equal(spotlightCoverage(events,new Date('2026-09-22T22:59:59Z')).expired,false);
  assert.equal(spotlightCoverage(events,new Date('2026-09-22T23:00:00Z')).expired,true);
  assert.equal(spotlightCoverage(events,new Date('2026-06-01T00:00:00Z')).expired,false);
});
test('Shared links validate version, clamp values and preserve event/archive/race choices',()=>{
  const hash=settings=>'#'+new URLSearchParams({settings:JSON.stringify({version:1,settings})});
  const saved=sharedSettings(hash({...DEFAULT_SETTINGS,partySize:4,gearBonus:164,racePlant:9,spotlightEvent:'none',dailyDungeonMode:'compare'}),SPOTLIGHT_EVENTS);
  assert.equal(saved.partySize,4);assert.equal(saved.racePlant,9);assert.equal(saved.spotlightEvent,'none');assert.equal(saved.dailyDungeonMode,'compare');
  assert.equal(sharedSettings(hash({partySize:999,playerLevel:-1}),SPOTLIGHT_EVENTS).partySize,12);
  assert.equal(sharedSettings(hash({playerLevel:-1}),SPOTLIGHT_EVENTS).playerLevel,1);
  assert.equal(sharedSettings('#map=oz_dun01',SPOTLIGHT_EVENTS),null);
  for(const value of ['{bad',JSON.stringify({version:2,settings:{}}),JSON.stringify({version:1,settings:[]}), 'x'.repeat(12001)])assert.throws(()=>sharedSettings('#'+new URLSearchParams({settings:value}),SPOTLIGHT_EVENTS));
});

test('Archived Daily Dungeon is opt-in, preserves the old edition and stays separate from Spotlight',()=>{
  const before=JSON.stringify(MAPS);
  const archived=MAPS.filter(m=>m.archivedEvent);
  assert.equal(archived.length,6);
  assert.equal(DEFAULT_SETTINGS.dailyDungeonMode,'hide');
  assert.equal(cleanSettings({playerLevel:240},SPOTLIGHT_EVENTS).dailyDungeonMode,'hide');
  assert.equal(cleanSettings({dailyDungeonMode:'invalid'},SPOTLIGHT_EVENTS).dailyDungeonMode,'hide');
  for(const mode of ['hide','compare','only']){
    const saved=cleanSettings(JSON.parse(JSON.stringify({...DEFAULT_SETTINGS,dailyDungeonMode:mode})),SPOTLIGHT_EVENTS);
    assert.equal(saved.dailyDungeonMode,mode);
    for(const e of [null,...SPOTLIGHT_EVENTS]){
      const visible=MAPS.filter(m=>includesArchivedMap(m,saved.dailyDungeonMode)).map(m=>row(m,config(e)));
      assert.equal(visible.length,mode==='hide'?MAPS.length-6:mode==='compare'?MAPS.length:6);
      assert.equal(visible.filter(m=>m.archivedEvent).length,mode==='hide'?0:6);
      if(mode==='hide')assert.ok(!visible.sort((a,b)=>b.finalPerKill-a.finalPerKill)[0].archivedEvent);
    }
  }
  // A future edition is not hidden just because its code contains "daily".
  assert.equal(includesArchivedMap({code:'daily_future'}),true);
  for(const m of archived){
    assert.ok(m.sourceUrl.includes('6th-anniversary'));
    assert.equal(m.monsters.length,3);
    assert.equal(m.amount,300);
    assert.ok(fs.existsSync(path.join(root,'assets/maps',m.mapImage+'.png')));
  }
  assert.equal(JSON.stringify(MAPS),before);
});

test('No event preserves the original per-monster calculation at multiple levels',()=>{
  for(const m of MAPS)for(const level of [1,100,200,260]){
    const c=config(null,level), total=m.monsters.reduce((s,x)=>s+x.amount,0);
    const expected=m.monsters.reduce((s,x)=>s+x.amount/total*x.baseExp*levelYield(level,x.level),0);
    const result=row(m,c);
    approx(result.finalPerKill,expected*c.partyShare*c.external);
    assert.equal(result.shownAmount,m.amount);
    assert.equal(result.affectedMonsters,0);
  }
});
test('Mixed map boosts only listed normal Orcs; plants, Orc Baby and Furious Orc stay unchanged in June',()=>{
  const m=map('gef_fild10'), e=event(5);
  assert.equal(monsterEventExp(m,m.monsters.find(x=>x.name==='Orc Warrior'),e),1444);
  for(const name of ['Blue Plant','Orc Baby','Furious Orc Warrior']){
    const mob=m.monsters.find(x=>x.name===name);
    assert.equal(monsterEventExp(m,mob,e),mob.baseExp);
  }
  const c=config(e,44),total=m.monsters.reduce((s,x)=>s+x.amount,0);
  const expected=m.monsters.reduce((s,x)=>s+x.amount/total*(x.name==='Orc Warrior'?1444:x.name==='Orc Lady'?1476:x.baseExp)*levelYield(44,x.level),0);
  approx(row(m,c).baseAfterPenalty,expected);
});
test('Event snapshots use exact published EXP and switching back does not mutate normal data',()=>{
  const m=map('ant_d02_i'),andre=m.monsters.find(x=>x.name==='Diligent Andre');
  const original=andre.baseExp;
  assert.equal(monsterEventExp(m,andre,event(5)),384564);
  assert.equal(monsterEventExp(m,andre,null),original);
  const cave=map('mjo_wst01'),punch=cave.monsters.find(x=>x.name==='Punch Bug');
  assert.equal(monsterEventExp(cave,punch,event(6)),1998460);
  assert.equal(monsterEventExp(cave,punch,event(7)),3996920);
  assert.equal(punch.baseExp,999230);
});
test('Spotlight aliases resolve Varmundt, Chaos and Charge Basilisk without boosting unrelated variants',()=>{
  for(const [code,index] of [['bl_lava',1],['bl_grass',3],['bl_temple',2],['bl_soul',2],['bl_venom',2]]){
    assert.ok(map(code).monsters.every(m=>spotlightRule(map(code),m,event(index))),code);
  }
  assert.equal(row(map('prt_mz03_i'),config(event(3))).affectedMonsters,3);
  assert.equal(row(map('lasa_dun03'),config(event(7))).affectedMonsters,2);
  assert.equal(row(map('lasa_dun02'),config(event(7))).affectedMonsters,0);
  const dragons=map('abyss_03');
  assert.equal(row(dragons,config(event(3))).affectedMonsters,2);
  assert.equal(spotlightRule(dragons,dragons.monsters.find(m=>m.name==='Solid Acidus'),event(3)),null);
});
test('June doubles Varmundt density and area score, not EXP per kill',()=>{
  for(const code of event(5).amountMaps){
    const normal=row(map(code),config()),june=row(map(code),config(event(5)));
    approx(june.finalPerKill,normal.finalPerKill);
    approx(june.monsterDensity,normal.monsterDensity*2);
    approx(june.finalAreaScore,normal.finalAreaScore*2);
    assert.equal(june.shownAmount,normal.shownAmount*2);
  }
});
test('EP20 has nine complete maps with normal official counts, weighted stats and local images',()=>{
  assert.equal(EP20_MAPS.length,9);
  assert.equal(MAPS.length,135);
  assert.equal(new Set(MAPS.map(m=>m.code)).size,MAPS.length);
  for(const m of EP20_MAPS){
    assert.equal(m.amount,m.monsters.reduce((s,x)=>s+x.amount,0));
    approx(m.baseExp,m.monsters.reduce((s,x)=>s+x.baseExp*x.amount,0)/m.amount);
    approx(m.hp,m.monsters.reduce((s,x)=>s+x.hp*x.amount,0)/m.amount);
    assert.ok(m.monsters.every(x=>!['Snowstorm Angel','Sanctuary Cleaning Chief'].includes(x.name)));
    if(m.code==='jor_twig'){
      assert.equal(m.walkablePx,null);
      assert.ok(m.densityNote);
    }else assert.ok(m.walkablePx>0 && m.walkablePct>0 && m.walkablePct<1);
    assert.equal(m.min,200);
    for(const image of [`assets/maps/${m.code}.png`,...m.monsters.map(x=>x.image)])assert.ok(fs.existsSync(path.join(root,image)),image);
  }
  assert.equal(map('jor_back6').amount,260);
  assert.equal(map('jor_root3').amount,270);
  assert.equal(map('jor_back5').monsters.find(m=>m.name==='Icewind Egg'&&m.level===215).baseExp,0);
});
test('August applies EP20 rules by map, leaving identical monsters in other maps at normal EXP',()=>{
  assert.equal(row(map('jor_back6'),config(event(7))).affectedMonsters,4);
  assert.equal(row(map('jor_root3'),config(event(7))).affectedMonsters,2);
  const root3=map('jor_root3'),bear=root3.monsters.find(m=>m.name==='Bear Bug');
  assert.equal(monsterEventExp(root3,bear,event(7)),586912);
  assert.equal(row(map('jor_back4'),config(event(7))).affectedMonsters,0);
});
test('Unknown walkable area remains unavailable instead of creating a misleading density',()=>{
  const result=row({...map('daily_mon_fire'),walkablePx:99999},config());
  assert.equal(result.hasWalk,false);
  assert.equal(result.walkableCells,null);
  assert.equal(result.finalAreaScore,0);
  assert.ok(result.finalPerKill>0);
});
test('All event/level combinations produce finite values and retain source data',()=>{
  const before=JSON.stringify(MAPS);
  for(const e of [null,...SPOTLIGHT_EVENTS])for(const level of [100,200,260])for(const m of MAPS){
    const result=row(m,config(e,level));
    for(const key of ['eventBaseExp','baseAfterPenalty','finalPerKill','yieldPct','finalAreaScore'])assert.ok(Number.isFinite(result[key]),`${e?.name}/${m.code}/${key}`);
  }
  assert.equal(JSON.stringify(MAPS),before);
  assert.equal(SPOTLIGHT_EVENTS.length,11);
  for(const e of SPOTLIGHT_EVENTS)assert.ok(fs.existsSync(path.join(root,e.image)));
});
test('September 2026 event uses published EXP rows and exact per-monster spawn totals',()=>{
  const e=SPOTLIGHT_EVENTS.find(x=>x.id==='2026-09-23_triple_exp_double_monster');
  assert.ok(e);
  assert.equal(e.rules.length,83);
  assert.equal(e.spawnCounts.length,29);
  assert.equal(e.rules.filter(r=>r.eventExp===r.normalExp*3).length,67);
  assert.equal(e.rules.filter(r=>r.eventExp===r.normalExp*2).length,16);
  assert.ok(fs.existsSync(path.join(root,e.image)));
  for(const r of e.rules){
    const m=map(r.map);
    assert.ok(m,m?.code||r.map);
    assert.ok(m.monsters.some(b=>spotlightRule(m,b,e)===r),r.map+'/'+r.name);
  }
  for(const r of e.spawnCounts){
    const m=map(r.map);
    assert.ok(m?.monsters.some(b=>eventSpawnRule(m,b,e)===r),r.map+'/'+r.name);
  }
  const hornet=map('prt_fild05').monsters.find(b=>b.name==='Hornet');
  assert.equal(monsterEventExp(map('prt_fild05'),hornet,e),474);
  const deadsera=map('ra_pol01').monsters.find(b=>b.name==='Deadsera');
  assert.equal(monsterEventExp(map('ra_pol01'),deadsera,e),3983572);
  assert.equal(monsterEventExp(map('ra_pol01'),deadsera,null),995893);
  for(const [code,expected] of [['nif_dun01',360],['amicitia2',440],['bl_death',450],['bl_temple',420],['bl_lava',450]]){
    const m=map(code),result=row(m,config(e));
    assert.equal(result.shownAmount,expected,code);
    assert.equal(result.shownAmount,e.spawnCounts.filter(r=>r.map===code).reduce((sum,r)=>sum+r.amount,0),code);
    assert.ok(result.spawnChangedMonsters>0,code);
  }
  const fire=map('bl_lava');
  assert.equal(row(fire,config(e)).affectedMonsters,0);
  approx(row(fire,config(e)).finalPerKill,row(fire,config(null)).finalPerKill);
  assert.equal(row(map('nif_dun02'),config(e)).shownAmount,map('nif_dun02').amount);
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-09-22T16:59:59Z')).id,'2026-08-26_spotlight');
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-09-22T17:00:00Z')).id,'2026-08-26_spotlight');
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-09-22T23:00:00Z')),null);
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-09-23T04:59:59Z')),null);
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-09-23T05:00:00Z')).id,e.id);
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-10-20T22:59:59Z')).id,e.id);
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-10-20T23:00:00Z')),null);
});

test('A changed spawn mix reweights map EXP, HP and monster share without mutating normal data',()=>{
  const m={code:'synthetic',min:1,amount:4,level:100,hp:175,baseExp:175,monsters:[
    {name:'A',level:100,amount:1,hp:100,baseExp:100},
    {name:'B',level:100,amount:3,hp:200,baseExp:200}]};
  const e={rules:[],amountMaps:[],spawnCounts:[{map:'synthetic',name:'A',amount:3},{map:'synthetic',name:'B',amount:1}]};
  const c={event:e,level:100,lock:false,partyShare:1,external:1};
  assert.equal(monsterEventAmount(m,m.monsters[0],e),3);
  assert.equal(row(m,c).shownAmount,4);
  assert.equal(row(m,c).eventBaseExp,125);
  assert.equal(row(m,c).hp,125);
  assert.equal(row(m,{...c,event:null}).eventBaseExp,175);
  assert.equal(m.monsters[0].amount,1);
});

test('Public entry point contains no encryption or login form and all scripts exist',()=>{
  assert.ok(!/PBKDF2|AES-GCM|id="password"|id="gate"|const payload=/.test(html));
  assert.ok(html.includes('<option value="auto" selected>'));
  for(const [,src] of html.matchAll(/<script src="([^"]+)"/g))assert.ok(fs.existsSync(path.join(root,src)),src);
});
test('Every map monster has a supported race, including EP20 and daily variants',()=>{
  for(const m of MAPS)for(const mob of m.monsters)assert.ok(RACES.includes(monsterRace(m,mob)),`${m.code}/${mob.name}: ${monsterRace(m,mob)}`);
  assert.equal(monsterRace(map('moc_fild01'),map('moc_fild01').monsters.find(m=>m.name==='Muka')),'Plant');
});
test('Race EXP weights each monster after its own Spotlight and level penalty',()=>{
  const m={code:'test',min:1,hp:100,baseExp:100,amount:4,monsters:[
    {name:'plant',race:'Plant',level:100,baseExp:100,amount:1},
    {name:'fish',race:'Fish',level:110,baseExp:200,amount:3}]};
  const e={rules:[{map:'test',name:'plant',normalExp:100,eventExp:300}],amountMaps:[]};
  const c={...config(e,100),h:2,external:5,partyShare:.5,raceBonuses:{Plant:20,Fish:50,Demon:1000}};
  approx(row(m,c).finalPerKill,.25*300*.5*5.4+.75*200*1.4*.5*6);
  approx(monsterFactor(m,m.monsters[0],c),5.4);
  approx(row(m,{...c,raceBonuses:{}}).finalPerKill,row(m,{...c,raceBonuses:undefined}).finalPerKill);
});
test('Auto uses Thai schedule boundaries, newest active event and gaps',()=>{
  const events=[{id:'old',start:'2026-01-01',end:'2026-01-15'},{id:'new',start:'2026-01-15',end:'2026-01-20'}];
  assert.equal(activeSpotlight(events,new Date('2025-12-31T16:59:59Z')),null);
  assert.equal(activeSpotlight(events,new Date('2025-12-31T17:00:00Z')),null);
  assert.equal(activeSpotlight(events,new Date('2026-01-01T04:59:59Z')),null);
  assert.equal(activeSpotlight(events,new Date('2026-01-01T05:00:00Z')).id,'old');
  assert.equal(activeSpotlight(events,new Date('2026-01-14T17:00:00Z')).id,'old');
  assert.equal(activeSpotlight(events,new Date('2026-01-14T23:00:00Z')),null);
  assert.equal(activeSpotlight(events,new Date('2026-01-15T04:59:59Z')),null);
  assert.equal(activeSpotlight(events,new Date('2026-01-15T05:00:00Z')).id,'new');
  assert.equal(activeSpotlight(events,new Date('2026-01-19T22:59:59Z')).id,'new');
  assert.equal(activeSpotlight(events,new Date('2026-01-19T23:00:00Z')),null);
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-09-12T00:00:00Z')).id,'2026-08-26_spotlight');
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2026-06-01T00:00:00Z')),null);
  assert.equal(sortedEvents(events)[0].id,'new');assert.equal(events[0].id,'old');
});
test('Defaults have no buffs, settings survive JSON and malformed values are rejected',()=>{
  for(const [key,value] of Object.entries(DEFAULT_SETTINGS))if(key.endsWith('Bonus')||key.startsWith('race'))assert.equal(value,0,key);
  assert.equal(DEFAULT_SETTINGS.spotlightEvent,'auto');
  assert.equal(DEFAULT_SETTINGS.partySize,1);
  assert.equal(cleanSettings(null,SPOTLIGHT_EVENTS).partySize,1);
  assert.equal(cleanSettings({partySize:6},SPOTLIGHT_EVENTS).partySize,6);
  const saved={...DEFAULT_SETTINGS,gearBonus:164,racePlant:9,spotlightEvent:'none',enforceLevelLock:false};
  assert.deepEqual({...cleanSettings(JSON.parse(JSON.stringify(saved)),SPOTLIGHT_EVENTS)},saved);
  const clean=cleanSettings({playerLevel:999,partySize:-1,manualBonus:123,gearBonus:Infinity,racePlant:-4,spotlightEvent:'missing',enforceLevelLock:'false'},SPOTLIGHT_EVENTS);
  assert.equal(clean.playerLevel,260);assert.equal(clean.partySize,1);assert.equal(clean.manualBonus,0);assert.equal(clean.racePlant,0);assert.equal(clean.spotlightEvent,'auto');assert.equal(clean.enforceLevelLock,true);
  assert.deepEqual(cleanSettings(null,SPOTLIGHT_EVENTS),DEFAULT_SETTINGS);
});

test('Complete 2025 editions are registered once, sorted by start date, and retain all EXP columns',()=>{
  const data=JSON.parse(fs.readFileSync(path.join(root,'assets/data/spotlight-2025.json'),'utf8'));
  assert.deepEqual(data.events.map(e=>e.rules.length),[36,53,44]);
  assert.equal(new Set(SPOTLIGHT_EVENTS.map(e=>e.id)).size,11);
  assert.equal(SPOTLIGHT_EVENTS.filter(e=>e.id==='2025-12-03_unicorn').length,1);
  assert.equal(sortedEvents(SPOTLIGHT_EVENTS)[0].id,'2026-09-23_triple_exp_double_monster');
  assert.equal(sortedEvents(SPOTLIGHT_EVENTS).at(-1).id,'2025-08-27_return');
  for(const e of data.events){
    assert.ok(fs.existsSync(path.join(root,e.image)));
    assert.equal(cleanSettings({spotlightEvent:e.id},SPOTLIGHT_EVENTS).spotlightEvent,e.id);
    for(const r of e.rules){
      const factor=r.eventExp/r.normalExp;
      assert.ok([3,4,5,6].includes(factor));
      assert.equal(r.eventJobExp,r.normalJobExp*factor);
      assert.ok(r.level>0 && r.sourceMap && r.sourceName);
    }
  }
  const unicorn=data.events[2],registered=SPOTLIGHT_EVENTS.find(e=>e.id===unicorn.id);
  for(const r of unicorn.rules){
    const previous=registered.rules.find(p=>p.name===r.name);
    assert.ok(previous,r.name);
    assert.equal(previous.normalExp,r.normalExp);assert.equal(previous.eventExp,r.eventExp);
  }
});
test('GGT Normal EXP takes priority when every official snapshot agrees',()=>{
  let changed=0;
  for(const source of MAPS){
    for(const monster of source.monsters||[]){
      if(monster.fallbackBaseExp!==undefined)changed++;
      const normals=[...new Set(SPOTLIGHT_EVENTS.map(e=>spotlightRule(source,monster,e)?.normalExp).filter(Number.isFinite))];
      if(normals.length===1)assert.equal(monster.baseExp,normals[0],source.code+'/'+monster.name);
      if(normals.length>1)assert.ok(normals.includes(monster.baseExp),source.code+'/'+monster.name);
    }
    if(source.fallbackBaseExp!==undefined){
      const total=source.monsters.reduce((sum,m)=>sum+m.amount,0);
      const weighted=source.monsters.reduce((sum,m)=>sum+m.amount*m.baseExp,0)/total;
      assert.ok(Math.abs(source.baseExp-weighted)<=0.5,source.code);
    }
  }
  assert.equal(changed,20);
  assert.equal(map('amicitia1').monsters.find(m=>m.name==='Amitera').baseExp,297411);
  assert.equal(map('odin_tem02').monsters.find(m=>m.name==='Skogul').baseExp,3639);
});
test('Return and Halloween apply exact historic EXP only to listed monsters and maps',()=>{
  const ret=SPOTLIGHT_EVENTS.find(e=>e.id==='2025-08-27_return');
  const halloween=SPOTLIGHT_EVENTS.find(e=>e.id==='2025-10-15_halloween');
  const oz=map('oz_dun01');
  const rake=oz.monsters.find(m=>m.name==='Rakehand');
  assert.equal(monsterEventExp(oz,rake,ret),649122);
  const amicitia=map('amicitia1'),amitera=amicitia.monsters.find(m=>m.name==='Amitera');
  assert.equal(amitera.baseExp,297411);
  assert.equal(monsterEventExp(amicitia,amitera,ret),1487055);
  assert.equal(monsterEventExp(amicitia,amicitia.monsters.find(m=>m.name==='Litus'),ret),294168);
  assert.equal(monsterEventExp(amicitia,amicitia.monsters.find(m=>m.name==='Litus'),halloween),1470840);
  const ant=map('ant_d02_i');
  assert.equal(monsterEventExp(ant,ant.monsters.find(m=>m.name==='Diligent Andre'),halloween),482856);
  const thana=map('tha_t12');
  assert.equal(row(thana,config(halloween)).affectedMonsters,4);
  const book=thana.monsters.find(m=>m.name==='Book of Death');
  assert.equal(monsterEventExp(thana,book,halloween),book.baseExp);
  const orc=map('orcsdun01'),skeleton=orc.monsters.find(m=>m.name==='Orc Skeleton');
  assert.equal(monsterEventExp(orc,skeleton,halloween),skeleton.baseExp);
  assert.equal(row(map('bl_death'),config(halloween)).affectedMonsters,6);
  assert.equal(ret.end,'2025-10-15');
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2025-10-10T12:00:00Z')).id,ret.id);
  assert.equal(activeSpotlight(SPOTLIGHT_EVENTS,new Date('2025-11-20T12:00:00Z')),null);
});


test('GAT geometry replaces brightness for all normal maps including EP20',()=>{
  for(const m of MAPS.filter(m=>!m.archivedEvent)){
    const r=row(m,config());
    assert.equal(r.hasWalk,true,m.code);
    approx(r.monsterDensity,r.amount/r.walkableCells*10000);
    approx(r.walkablePct,r.walkableCells/r.geometry.totalCells*100);
    for(const key of ['maskImage','rawImage','overlayImage'])assert.ok(fs.existsSync(path.join(root,r.geometry[key])));
    const stale=row({...m,walkablePx:1,walkablePct:1},config());
    approx(stale.finalAreaScore,r.finalAreaScore);
  }
  assert.equal(row(map('jor_twig'),config()).walkableCells,10320);
  assert.equal(row(map('bl_death'),config()).walkableCells,34688);
  assert.equal(row(map('oz_dun01'),config()).walkableCells,14184);
  assert.equal(row(map('moc_fild01'),config()).walkableCells,103675);
  assert.equal(row({...map('oz_dun01'),code:'missing-gat'},config()).hasWalk,false);
});


test('Planning efficiency uses final EXP including party, level and race bonuses',()=>{
  const m=map('oz_dun01'),c={...config(null,160),h:2,external:3,raceBonuses:{Fish:25}};
  const normal=row(m,c);
  approx(normal.expPerMillionHp,normal.finalPerKill/m.hp*1e6);
  approx(row({...m,monsters:m.monsters.map(b=>({...b,hp:b.hp*2}))},c).expPerMillionHp,normal.expPerMillionHp/2);
  approx(row(m,{...c,partyShare:c.partyShare/2}).expPerMillionHp,normal.expPerMillionHp/2);
  assert.equal(row({...m,hp:0},c).expPerMillionHp,normal.expPerMillionHp);
  for(const source of MAPS){
    const r=row(source,c);
    if(!r.hasWalk)continue;
    const contributions=r.monsters.reduce((sum,mob)=>sum+
      monsterEventExp(source,mob,c.event)*levelYield(c.level,mob.level)*c.partyShare*monsterFactor(source,mob,c)*mob.amount*r.amountFactor/r.walkableCells*10000,0);
    approx(contributions,r.finalAreaScore);
  }
});

test('Every explicit Spotlight map exists; unmatched rows are limited to documented source conflicts',()=>{
  const exceptions=JSON.parse(fs.readFileSync(path.join(root,'assets/data/spotlight-coverage-exceptions.json'),'utf8'));
  const unmatched=[];
  for(const e of SPOTLIGHT_EVENTS)for(const r of e.rules){
    assert.ok(r.map==='*'||MAPS.some(m=>m.code===r.map),e.id+' missing map '+r.map);
    if(!MAPS.some(m=>(r.map==='*'||r.map===m.code)&&m.monsters.some(b=>spotlightRule(m,b,e)===r)))unmatched.push(e.id+':'+r.map+':'+r.name);
  }
  assert.deepEqual(unmatched.sort(),exceptions.map(r=>r.eventId+':'+r.map+':'+r.name).sort());
});
test('Imported maps preserve complete normal populations, provenance, races, assets and weighted stats',()=>{
  const data=JSON.parse(fs.readFileSync(path.join(root,'assets/data/spotlight-maps.json'),'utf8'));
  assert.equal(data.maps.length,65);
  assert.equal(data.maps.reduce((s,m)=>s+m.monsters.length,0),396);
  for(const m of data.maps){
    assert.equal(MAPS.filter(x=>x.code===m.code).length,1);
    assert.equal(m.amount,m.monsters.reduce((s,b)=>s+b.amount,0));
    for(const k of ['level','hp','baseExp'])approx(m[k],m.monsters.reduce((s,b)=>s+b[k]*b.amount,0)/m.amount);
    assert.ok(fs.existsSync(path.join(root,'assets/maps',m.code+'.png')));
    assert.match(m.sourceSha256,/^[0-9a-f]{64}$/);
    for(const b of m.monsters){
      assert.ok(Number.isInteger(b.id)&&b.id>0);
      assert.ok(Number.isInteger(b.baseExp)&&b.baseExp>=0);
      assert.ok(Number.isInteger(b.jobExp)&&b.jobExp>=0);
      assert.ok(b.hp>0&&b.level>0&&Number.isInteger(b.amount)&&b.amount>0);
      assert.ok(RACES.includes(b.race));
      assert.ok(fs.existsSync(path.join(root,b.image)));
      assert.match(b.sourceSha256,/^[0-9a-f]{64}$/);
      assert.ok(!m.excludedMonsterIds.includes(b.id));
      assert.equal(monsterEventExp(m,b,null),b.baseExp);
    }
  }
});
test('Luanda shows every normal monster without a phase selector and applies Spotlight by name',()=>{
  const m=map('com_d02_i'),before=JSON.stringify(m),aug=SPOTLIGHT_EVENTS.find(e=>e.id==='2026-08-26_spotlight');
  const c={event:null,level:165,lock:false,partyShare:1,external:1,h:1};
  assert.deepEqual(Array.from(m.monsters,x=>x.name),['Ancient Tri Joint','Ancient Wootan Shooter','Ancient Megalith','Ancient Stone Shooter','Ancient Stalactic Golem','Ancient Wootan Fighter']);
  assert.deepEqual(Array.from(m.excludedBosses),['Ancient Tao Gunka','Ancient Wootan Defender']);
  assert.deepEqual(Array.from(m.excludedMonsterIds),[20273,20277]);
  assert.equal('spawnModes' in m,false);
  const expected=[['Ancient Wootan Shooter',76669,306676],['Ancient Stone Shooter',75621,302484],['Ancient Wootan Fighter',79225,316900]];
  for(const [name,normal,eventExp] of expected){const mob=m.monsters.find(x=>x.name===name);assert.equal(mob.baseExp,normal);assert.equal(monsterEventExp(m,mob,aug),eventExp);}
  const normal=row(m,c),spot=row(m,{...c,event:aug});
  assert.equal(normal.amount,300);assert.equal(normal.monsters.length,6);assert.equal(normal.affectedMonsters,0);
  assert.equal(spot.amount,300);assert.equal(spot.monsters.length,6);assert.equal(spot.affectedMonsters,3);
  assert.ok(spot.monsters.filter(b=>b.name.includes('Wootan')||b.name==='Ancient Stone Shooter').every(b=>spotlightRule(m,b,aug)));
  assert.ok(spot.monsters.filter(b=>b.name==='Ancient Tri Joint'||b.name==='Ancient Megalith'||b.name==='Ancient Stalactic Golem').every(b=>!spotlightRule(m,b,aug)));
  const bonus=row(m,{...c,event:aug,raceBonuses:{Plant:9}});
  const stone=m.monsters.find(b=>b.name==='Ancient Stone Shooter');
  approx(bonus.finalPerKill-spot.finalPerKill,302484*levelYield(c.level,stone.level)*0.09/6);
  assert.equal(JSON.stringify(m),before);
  assert.equal(row(m,{...c,level:159,lock:true}).locked,true);
  assert.equal(row(m,{...c,level:160,lock:true}).locked,false);
  assert.equal(Object.hasOwn(cleanSettings({luandaPhase:'megalith'},SPOTLIGHT_EVENTS),'luandaPhase'),false);
  assert.equal(Object.hasOwn(sharedSettings('#'+new URLSearchParams({settings:JSON.stringify({version:1,settings:{luandaPhase:'megalith'}})}),SPOTLIGHT_EVENTS),'luandaPhase'),false);
});
