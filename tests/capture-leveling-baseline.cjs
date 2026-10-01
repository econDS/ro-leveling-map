// QA only: capture the original calculation and serializer before integration.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ URLSearchParams });
for (const file of ['assets/data/ep20.js', 'assets/data/spotlight-maps.js', 'assets/data/spotlight-2026.js', 'assets/data/spotlight-2025.js', 'assets/data/monster-races.js', 'assets/settings.js', 'assets/data/map-geometry.js', 'assets/data/planning-context.js', 'assets/calculator.js', 'assets/data/maps.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}
const result = vm.runInContext(`(() => {
  const cases = [
    {name: 'normal-level-100', map: 'mag_dun02', input: {spotlightEvent: 'none'}},
    {name: 'custom-party-race', map: 'jor_back6', input: {playerLevel: 215, partySize: 4, playerDamage: 234567, serverBonus: 100, gearBonus: 164, customBonus: 37, racePlant: 9, spotlightEvent: 'none', enforceLevelLock: false}},
    {name: 'explicit-historical-event', map: 'lasa_dun03', input: {playerLevel: 160, partySize: 3, playerDamage: 432100, manualBonus: 200, spotlightEvent: '2025-12-03_unicorn', dailyDungeonMode: 'compare'}}
  ];
  return cases.map(testCase => {
    const settings = cleanSettings(testCase.input, SPOTLIGHT_EVENTS);
    const h = 1 + (settings.serverBonus + settings.kafraBonus + settings.malangdoBonus + settings.premiumBonus + settings.staffBonus + settings.customBonus) / 100;
    const i = 1 + (settings.gearBonus + settings.richManBonus) / 100;
    const config = {level: settings.playerLevel, party: settings.partySize, damage: settings.playerDamage, lock: settings.enforceLevelLock, event: SPOTLIGHT_EVENTS.find(e => e.id === settings.spotlightEvent) || null, raceBonuses: Object.fromEntries(RACES.map(r => [r, settings['race' + r]])), partyShare: (.8 + .2 * settings.partySize) / settings.partySize, h, i, manual: settings.manualBonus / 100, external: h * i + settings.manualBonus / 100};
    const output = row(MAPS.find(map => map.code === testCase.map), config);
    const hash = '#' + new URLSearchParams({settings: JSON.stringify({version: 1, settings})});
    return {name: testCase.name, map: testCase.map, input: settings, storageJSON: JSON.stringify(settings), shareHash: hash, reopenedSettings: sharedSettings(hash, SPOTLIGHT_EVENTS), output: Object.fromEntries(Object.entries(output).filter(([key, value]) => typeof value === 'number' || typeof value === 'boolean' || key === 'code'))};
  });
})()`, context);
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
