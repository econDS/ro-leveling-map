const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const context = vm.createContext({});
for (const file of [
  'assets/data/ep20.js',
  'assets/data/spotlight-maps.js',
  'assets/data/spotlight-2026.js',
  'assets/data/spotlight-2025.js',
  'assets/calculator.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
}
const inline = html.match(/<script>\s*(const MAPS =[\s\S]*?)<\/script>/);
if (!inline) throw new Error('MAPS inline script not found');
vm.runInContext(inline[1] + '\nthis.auditApi={MAPS,SPOTLIGHT_EVENTS,spotlightRule,spotlightName,normalizeMonsterName};', context);
const api = context.auditApi;
const byMonster = new Map();
const ambiguous = [];
const unmatchedRules = [];
let matchedRuleRows = 0;
for (const event of api.SPOTLIGHT_EVENTS) {
  for (const rule of event.rules) {
    const matchingMaps = api.MAPS.filter(map => rule.map === '*' || map.code === rule.map || rule.additionalMaps?.includes(map.code));
    const matches = [];
    for (const map of matchingMaps) {
      for (const [index, monster] of (map.monsters || []).entries()) {
        if (api.normalizeMonsterName(api.spotlightName(map, monster)) !== api.normalizeMonsterName(rule.name)) continue;
        const selected = api.spotlightRule(map, monster, event);
        if (selected === rule) matches.push({map, monster, index});
        else ambiguous.push({event:event.id, map:map.code, monster:monster.name, baseExp:monster.baseExp, rule:rule.name, normalExp:rule.normalExp});
      }
    }
    if (!matches.length) {
      unmatchedRules.push({event:event.id, map:rule.map, name:rule.name, normalExp:rule.normalExp});
      continue;
    }
    matchedRuleRows++;
    for (const {map, monster, index} of matches) {
      const key = api.MAPS.indexOf(map) + ':' + index;
      let item = byMonster.get(key);
      if (!item) {
        item = {map:map.code, monster:monster.name, source:map.source, baseExp:monster.baseExp, snapshots:[]};
        byMonster.set(key, item);
      }
      item.snapshots.push({event:event.id, normalExp:rule.normalExp, eventExp:rule.eventExp});
    }
  }
}
const records = [...byMonster.values()];
for (const record of records) {
  record.ggtNormals = [...new Set(record.snapshots.map(s => s.normalExp))].sort((a,b)=>a-b);
}
const singleMismatch = records.filter(r => r.ggtNormals.length === 1 && r.ggtNormals[0] !== r.baseExp);
const conflicts = records.filter(r => r.ggtNormals.length > 1);
const baseNotInGgt = records.filter(r => !r.ggtNormals.includes(r.baseExp));
const affectedMapStats = [...new Set(singleMismatch.map(r => r.map))].map(code => {
  const map = api.MAPS.find(m => m.code === code);
  const total = map.monsters.reduce((sum, m) => sum + m.amount, 0);
  const weighted = selectExp => map.monsters.reduce((sum, m) => sum + m.amount * selectExp(m), 0) / total;
  const oldWeighted = weighted(m => m.baseExp);
  const newWeighted = weighted(m => {
    const fix = singleMismatch.find(r => r.map === code && r.monster === m.name);
    return fix ? fix.ggtNormals[0] : m.baseExp;
  });
  return {code, source:map.source, monsters:map.monsters.length, ggtCovered:records.filter(r => r.map === code).length,
    oldMapBase:map.baseExp, oldWeighted, newWeighted};
});const appliedOverrides = api.MAPS.flatMap(map => (map.monsters || [])
  .filter(monster => monster.fallbackBaseExp !== undefined)
  .map(monster => ({map:map.code, monster:monster.name,
    fallbackBaseExp:monster.fallbackBaseExp, ggtBaseExp:monster.baseExp})));const summary = {
  events:api.SPOTLIGHT_EVENTS.length,
  appliedOverrides:appliedOverrides.length,
  eventRuleRows:api.SPOTLIGHT_EVENTS.reduce((n,e)=>n+e.rules.length,0),
  matchedRuleRows,
  unmatchedRuleRows:unmatchedRules.length,
  siteMonsterRecords:records.length,
  singleMismatch:singleMismatch.length,
  conflictingGgtBases:conflicts.length,
  baseNotInGgt:baseNotInGgt.length,
  ambiguousMatches:ambiguous.length,
  maps:api.MAPS.length
};
process.stdout.write(JSON.stringify({summary,appliedOverrides,affectedMapStats,singleMismatch,conflicts,baseNotInGgt,ambiguous,unmatchedRules}, null, 2) + '\n');