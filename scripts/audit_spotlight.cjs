const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),c=vm.createContext({});
for(const f of ['ep20','spotlight-maps','spotlight-2026','spotlight-2025'])
  vm.runInContext(fs.readFileSync(path.join(root,'assets/data',f+'.js'),'utf8'),c);
vm.runInContext(fs.readFileSync(path.join(root,'assets/calculator.js'),'utf8'),c);
vm.runInContext(fs.readFileSync(path.join(root,'index.html'),'utf8').match(/<script>\s*(const MAPS =[\s\S]*?)<\/script>/)[1],c);
const report=vm.runInContext(`({
  mapCount:MAPS.length,
  addedMapCount:SPOTLIGHT_MAPS.length,
  events:SPOTLIGHT_EVENTS.map(e=>{
    const spawns=e.spawnCounts||[];
    return {
      id:e.id,sourceUrl:e.sourceUrl,ruleCount:e.rules.length,spawnCount:spawns.length,
      missingMaps:[...new Set([...e.rules,...spawns].flatMap(r=>[r.map,...(r.additionalMaps||[])]))]
        .filter(code=>code!=='*'&&!MAPS.some(m=>m.code===code)),
      unmatched:e.rules.flatMap(r=>[r.map,...(r.additionalMaps||[])].filter(code=>!MAPS.some(m=>(code==='*'||code===m.code)&&
        m.monsters.some(b=>spotlightRule(m,b,e)===r))).map(code=>({map:code,name:r.name}))),
      unmatchedSpawns:spawns.filter(r=>!MAPS.some(m=>r.map===m.code&&
        m.monsters.some(b=>eventSpawnRule(m,b,e)===r))).map(r=>({map:r.map,name:r.name}))
    };
  })
})`,c);
const exceptions=JSON.parse(fs.readFileSync(path.join(root,'assets/data/spotlight-coverage-exceptions.json'),'utf8'));
const keys=new Set(exceptions.map(r=>r.eventId+':'+r.map+':'+r.name));
const actual=new Set(report.events.flatMap(e=>e.unmatched.map(r=>e.id+':'+r.map+':'+r.name)));
if(report.events.some(e=>e.missingMaps.length||e.unmatchedSpawns.length)||
  actual.size!==keys.size||[...actual].some(k=>!keys.has(k)))
  throw new Error('Unexpected event coverage gap: '+JSON.stringify(report));
report.checkedOn='2026-09-24';report.exceptions=exceptions;
fs.writeFileSync(path.join(root,'assets/data/spotlight-coverage.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(root,'assets/data/spotlight-coverage.js'),
  '// Known conflicts between official event rows and reference map populations.\nconst SPOTLIGHT_COVERAGE_EXCEPTIONS = '+JSON.stringify(exceptions,null,2)+';\n');
console.log(JSON.stringify({maps:report.mapCount,added:report.addedMapCount,
  rules:report.events.reduce((n,e)=>n+e.ruleCount,0),
  spawns:report.events.reduce((n,e)=>n+e.spawnCount,0),
  missingMaps:0,knownConflicts:keys.size}));
