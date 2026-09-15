// Pure calculation functions shared by the table, modal and regression tests.
function includesArchivedMap(map, mode='hide') {
  if(mode==='compare')return true;
  return mode==='only' ? Boolean(map.archivedEvent) : !map.archivedEvent;
}
const SPOTLIGHT_ALIASES = {
  ba_lost: {'Violet Pitaya':'Purple Pitaya'},
  ba_pw03: {'Strong Plasma / Powerful Spell':'Powerful Spell','Mana Addicted Sanare / Spell Addicted Sanare':'Spell Addicted Sanare'},
  bl_ice: {'Ice Titan of Iceberg':'Glacier Ice Titan','Siroma of Iceberg':'Glacier Siroma','Aqua Elemental of Iceberg':'Glacier Aqua Elemental','Snowier of Iceberg':'Glacier Snowier','Rhyncho of Prairie':'Glacier Rhyncho'},
  lasa_dun03: {"Combat Basilisk":"Charge Basilisk"},
  lhz_dun04: {Randel:"Randel Lawrence",Flamel:"Flamel Emure",Celia:"Celia Alde",Chen:"Chen Liu"},
  bl_lava: {
    "Explosion of Fire":"Inferno Explosion", "Deleter of Fire(Sky)":"Inferno Deleter",
    "Jakk of Fire":"Inferno Jakk", "Majoruros of Fire":"Inferno Majoruros",
    "Lava Golem of Fire":"Inferno Lava Golem", "Acidus of Fire":"Inferno Acidus of Fire",
    "Hydrolancer of Fire":"Inferno Hydrolancer"
  },
  bl_grass: {
    "Pinguicula of Prairie":"Plain Pinguicula", "Savage of Prairie":"Plain Savage",
    "Hill Wind of Prairie":"Plain Hill Wind", "Rocker of Prairie":"Plain Rocker",
    "Cornus of Prairie":"Plain Cornus", "Flora of Prairie":"Plain Flora",
    "Hunter Fly of Prairie":"Plain Hunter Fly"
  }
};
function normalizeMonsterName(name) {
  return name.normalize('NFKC').toLowerCase().replace(/^chimera\s+/, '')
    .replace(/^chaotic\s+/, 'chaos ').replace(/violet pitaya/g, 'purple pitaya').replace(/dollocaris/g,'dolocaris')
    .replace(/[^a-z0-9]/g, '');
}
function spotlightName(map, monster) {
  // The legacy dataset uses identical names/images for the two dragon colors.
  // HP/EXP distinguish the existing variants; never boost Solid/Ringleader mobs.
  if (map.code === 'abyss_03') {
    if (monster.name === 'Acidus' && monster.hp === 40950) return 'Gold Acidus';
    if (monster.name === 'Acidus' && monster.hp === 39089) return 'Blue Acidus';
    if (monster.name === 'Ferus' && monster.baseExp === 3820) return 'Green Ferus';
  }
  return SPOTLIGHT_ALIASES[map.code]?.[monster.name] || monster.name;
}
function spotlightRule(map, monster, event) {
  if (!event) return null;
  const name = normalizeMonsterName(spotlightName(map, monster));
  const candidates = event.rules.filter(r => (r.map === '*' || r.map === map.code) && normalizeMonsterName(r.name) === name);
  if (candidates.length === 1) return candidates[0];
  return candidates.find(r => r.normalExp === monster.baseExp) || null;
}
function monsterEventExp(map, monster, event) {
  return spotlightRule(map, monster, event)?.eventExp ?? monster.baseExp;
}
function eventAmountFactor(map, event) {
  return event?.amountMaps.includes(map.code) ? 2 : 1;
}
function levelYield(player, monster) {
  const d = Math.floor(monster - player);
  if(d>=16)return .4;if(d===15)return 1.15;if(d===14)return 1.2;if(d===13)return 1.25;
  if(d===12)return 1.3;if(d===11)return 1.35;if(d===10)return 1.4;if(d===9)return 1.35;
  if(d===8)return 1.3;if(d===7)return 1.25;if(d===6)return 1.2;if(d===5)return 1.15;
  if(d===4)return 1.1;if(d===3)return 1.05;if(d>=-5)return 1;if(d>=-10)return .95;
  if(d>=-15)return .9;if(d>=-20)return .85;if(d>=-25)return .6;if(d>=-30)return .35;return .1;
}
function weightedPenalty(map, c) {
  if (!map.monsters?.length) return null;
  const total = map.monsters.reduce((sum, m) => sum + m.amount, 0);
  if (!total) return 0;
  return map.monsters.reduce((sum, m) => sum + m.amount / total * monsterEventExp(map, m, c.event) * levelYield(c.level, m.level), 0);
}
function monsterRace(map, monster) {
  return monster.race || MONSTER_RACES[map.code+':'+monster.name] || null;
}
function raceBonus(map, monster, c) {
  return c.raceBonuses?.[monsterRace(map,monster)] || 0;
}
function monsterFactor(map, monster, c) {
  // Racial equipment EXP adds to all-race equipment EXP in the existing I bracket.
  return c.external + (c.h ?? 1) * raceBonus(map,monster,c)/100;
}
function row(map, c) {
  const monsters = map.monsters || [];
  const total = monsters.reduce((sum, m) => sum + m.amount, 0);
  const eventBaseExp = total ? monsters.reduce((sum, m) => sum + m.amount / total * monsterEventExp(map, m, c.event), 0) : map.baseExp;
  const affectedMonsters = monsters.filter(m => spotlightRule(map, m, c.event)).length;
  const penaltyBase = weightedPenalty(map, c);
  const baseAfterPenalty = penaltyBase ?? eventBaseExp * levelYield(c.level, map.level);
  const baseAfterParty = baseAfterPenalty * c.partyShare;
  const finalPerKill = total ? monsters.reduce((sum,m)=>sum + m.amount/total *
    monsterEventExp(map,m,c.event)*levelYield(c.level,m.level)*c.partyShare*monsterFactor(map,m,c),0) : baseAfterParty*c.external;
  const amountFactor = eventAmountFactor(map, c.event);
  const shownAmount = map.amount * amountFactor;
  // Legacy walkablePx came from brightness and is deliberately not a fallback.
  const geometry = typeof MAP_GEOMETRY !== 'undefined' ? MAP_GEOMETRY[map.code] : null;
  const hasWalk = geometry?.status === 'verified-gat' && Number.isInteger(geometry.walkableCells)
    && geometry.walkableCells > 0 && geometry.walkableCells <= geometry.totalCells;
  const walkableCells = hasWalk ? geometry.walkableCells : null;
  const monsterDensity = hasWalk ? shownAmount / walkableCells * 10000 : 0;
  const entryMin=typeof minimumEntryLevel==='function'?minimumEntryLevel(map):map.min;
  return {...map, min:entryMin, locked:c.lock && c.level < entryMin, eventBaseExp, affectedMonsters, amountFactor,
    yieldPct:eventBaseExp ? baseAfterPenalty / eventBaseExp * 100 : 0,
    baseAfterPenalty, baseAfterParty, finalPerKill,
    shownAmount, hasWalk, geometry, walkableCells, monsterDensity,
    expPerMillionHp:map.hp>0 ? finalPerKill/map.hp*1e6 : 0,
    baseAreaScore:baseAfterPenalty * monsterDensity, finalAreaScore:finalPerKill * monsterDensity,
    walkablePct:hasWalk ? walkableCells / geometry.totalCells * 100 : 0};
}
