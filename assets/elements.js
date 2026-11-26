// Monster element lookup and physical endow advice. Data: assets/data/monster-elements.js.
const ELEMENT_TH = {Neutral:'ไร้ธาตุ',Water:'น้ำ',Earth:'ดิน',Fire:'ไฟ',Wind:'ลม',Poison:'พิษ',Holy:'ศักดิ์สิทธิ์',Dark:'มืด',Ghost:'วิญญาณ',Undead:'อมตะ'};
// Elements a physical attacker can put on a weapon (converters, Aspersio, Enchant Poison, Cursed Water).
const ENDOW_OPTIONS = ['Neutral','Fire','Water','Wind','Earth','Poison','Holy','Dark'];
const ENDOW_GAIN = 5; // Percentage points an endow must add over no endow to be worth the effort.

function monsterElement(map, monster) {
  const data = typeof MONSTER_ELEMENTS === 'undefined' ? null : MONSTER_ELEMENTS;
  if (!data) return null;
  const id = (monster.image || '').match(/\/(\d+)\.png$/)?.[1] || data.byMapName[map.code + ':' + monster.name];
  const value = id && data.monsters[id];
  return value ? {element:value[0], level:value[1], id:Number(id)} : null;
}
function elementModifier(attack, defense) {
  return ELEMENT_TABLE[defense.level]?.[attack]?.[defense.element] ?? 100;
}
function elementLabel(map, monster) {
  const e = monsterElement(map, monster);
  return e ? `<span class="element-chip element-${e.element.toLowerCase()}">${ELEMENT_TH[e.element]} ${e.level}</span>` : '';
}
// Weighted by the number of monsters shown on the map (event spawn counts when active).
function endowAdvice(map) {
  const mobs = (map.monsters || []).map(m => ({m, e:monsterElement(map, m), w:m.shownAmount ?? m.amount})).filter(x => x.w > 0);
  const known = mobs.filter(x => x.e), total = known.reduce((s, x) => s + x.w, 0);
  if (!total) return null;
  const options = ENDOW_OPTIONS.map(attack => {
    const mods = known.map(x => ({...x, mod:elementModifier(attack, x.e)}));
    return {attack, avg:mods.reduce((s, x) => s + x.mod * x.w, 0) / total, min:Math.min(...mods.map(x => x.mod)), weak:mods.filter(x => x.mod < 100)};
  }).sort((a, b) => b.avg - a.avg || b.min - a.min);
  const none = options.find(o => o.attack === 'Neutral'), best = options[0];
  const pick = best.attack !== 'Neutral' && best.avg - none.avg >= ENDOW_GAIN ? best : none;
  const shares = Object.entries(known.reduce((acc, x) => {
    const key = x.e.element + ' ' + x.e.level; acc[key] = (acc[key] || 0) + x.w; return acc;
  }, {})).sort((a, b) => b[1] - a[1]).map(([key, w]) => ({key, share:w / total}));
  const poison = options.find(o => o.attack === 'Poison');
  return {pick, none, best, options, shares, poison, unknown:mobs.length - known.length,
    mixed: pick === none && options.filter(o => o.attack !== 'Neutral' && o.avg > none.avg).length === 0};
}
function endowAdviceHtml(map) {
  const a = endowAdvice(map);
  if (!a) return '';
  const th = key => key.replace(/^(\w+) (\d)$/, (_, el, lv) => ELEMENT_TH[el] + ' ' + lv);
  const pct = n => Math.round(n) + '%';
  const name = attack => attack === 'Neutral' ? 'ไม่เคลือบ (ไร้ธาตุ)' : 'เคลือบ' + ELEMENT_TH[attack];
  let headline;
  if (a.pick !== a.none) {
    headline = `แนะนำ <strong>${name(a.pick.attack)}</strong> · ดาเมจเฉลี่ย ${pct(a.pick.avg)} (ไม่เคลือบ ${pct(a.none.avg)})`;
  } else if (a.poison.avg >= a.none.avg && a.poison.min >= a.none.min && a.poison.attack !== a.best.attack) {
    headline = `<strong>ไม่ต้องเคลือบ</strong> · ธาตุหลากหลาย ไม่มีธาตุไหนเพิ่มดาเมจเกิน ${ENDOW_GAIN}% · ถ้าจะเคลือบ เคลือบพิษได้ ${pct(a.poison.avg)}`;
  } else {
    headline = `<strong>ไม่ต้องเคลือบ</strong> · ${a.best.attack === 'Neutral' ? 'ไร้ธาตุดีที่สุดแล้ว' : 'ไม่มีธาตุไหนเพิ่มดาเมจเกิน ' + ENDOW_GAIN + '%'} (${pct(a.none.avg)})`;
  }
  const weak = a.pick.weak.map(x => `${escapeHtml(x.m.name)} (${th(x.e.element + ' ' + x.e.level)}) โดน ${pct(x.mod)}`);
  const top = a.options.slice(0, 4).map(o => `${o.attack === 'Neutral' ? 'ไร้ธาตุ' : ELEMENT_TH[o.attack]} ${pct(o.avg)}`).join(' · ');
  return `<div class="endow-advice"><h3>การเคลือบธาตุ (สายกายภาพ)</h3><p>${headline}</p>`
    + `<p class="field-help">ธาตุมอนในแมพ: ${a.shares.map(s => th(s.key) + ' ' + pct(s.share * 100)).join(' · ')}${a.unknown ? ' · ไม่ทราบธาตุ ' + a.unknown + ' ชนิด' : ''}</p>`
    + (weak.length ? `<p class="field-help">ระวัง: ${weak.join(' · ')}</p>` : '')
    + `<p class="field-help">ดาเมจเฉลี่ยถ่วงตามจำนวนมอน: ${top} · ตารางธาตุ Renewal จาก rAthena · ยังไม่รวมการ์ด/บัฟเพิ่มดาเมจตามธาตุ และไม่ได้เปลี่ยนตัวเลขในตารางอันดับ</p></div>`;
}
