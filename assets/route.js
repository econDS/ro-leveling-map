// Leveling route: per level band and damage, the best map by EXP per kill (3 hits or fewer)
// plus a one-hit alternative. Reuses row() from calculator.js and the page settings from ui.js.
const ROUTE_KEY = 'ro-general-map-exp-tool-route-v1';
const ROUTE_MAX_HITS = 3;
const ROUTE_DEFAULT = [[1,1e6],[100,10e6],[170,20e6],[200,100e6],[240,300e6],[250,500e6]];
let routeBands = loadRouteBands(), routeTimer = 0;

function loadRouteBands() {
  try {
    const saved = JSON.parse(localStorage.getItem(ROUTE_KEY));
    if (Array.isArray(saved) && saved.length && saved.every(b => Array.isArray(b) && b.length === 2 && b.every(Number.isFinite))) return cleanRouteBands(saved);
  } catch (_) {}
  return ROUTE_DEFAULT.map(b => [...b]);
}
function cleanRouteBands(bands) {
  const clean = bands.map(([from, damage]) => [Math.min(260, Math.max(1, Math.floor(from))), Math.min(1e12, Math.max(1, Math.floor(damage)))])
    .sort((a, b) => a[0] - b[0]).filter((b, i, all) => i === 0 || b[0] !== all[i - 1][0]);
  clean[0][0] = 1;
  return clean;
}
function saveRouteBands() {
  try { localStorage.setItem(ROUTE_KEY, JSON.stringify(routeBands)); } catch (_) {}
}
function parseDamage(text) {
  const m = String(text).replace(/,/g, '').trim().match(/^(\d+(?:\.\d+)?)\s*([kmb])?$/i);
  if (!m) return NaN;
  return Math.round(Number(m[1]) * ({k:1e3, m:1e6, b:1e9}[(m[2] || '').toLowerCase()] || 1));
}
function routeDamageText(n) {
  return n >= 1e9 && n % 1e9 === 0 ? n / 1e9 + 'B' : n >= 1e6 && n % 1e5 === 0 ? n / 1e6 + 'M' : n >= 1e3 && n % 1e3 === 0 ? n / 1e3 + 'K' : String(n);
}
// One level: main pick among maps killed in 3 hits or fewer, and the best one-hit map.
// The same weighted sums as row(), with everything that does not depend on level precomputed:
// a full row() per map and level is too slow to rerun on every settings change.
function routeMaps(c) {
  return MAPS.filter(m => includesArchivedMap(m, c.dailyDungeonMode) && m.monsters?.length).map(map => {
    const amounts = map.monsters.map(m => monsterEventAmount(map, m, c.event)), total = amounts.reduce((s, a) => s + a, 0);
    return {code:map.code, name:map.name, map, min:typeof minimumEntryLevel === 'function' ? minimumEntryLevel(map) : map.min,
      mobs:map.monsters.map((m, i) => ({share:amounts[i] / total, level:m.level, hp:m.hp,
        exp:monsterEventExp(map, m, c.event) * c.partyShare * monsterFactor(map, m, c)}))};
  }).filter(r => r.mobs.every(m => Number.isFinite(m.share)));
}
function routePick(maps, c) {
  let main = null, any = null, oneHit = null;
  for (const r of maps) {
    if (c.lock && c.level < r.min) continue;
    let finalPerKill = 0, hitsPerKill = 0;
    for (const m of r.mobs) {
      finalPerKill += m.share * m.exp * mapLevelYield(r.map, c.level, m.level);
      hitsPerKill += m.share * hitsToKill(m.hp, c.damage);
    }
    const pick = {code:r.code, name:r.name, finalPerKill, hitsPerKill};
    if (!any || finalPerKill > any.finalPerKill) any = pick;
    if (hitsPerKill <= ROUTE_MAX_HITS && (!main || finalPerKill > main.finalPerKill)) main = pick;
    if (hitsPerKill <= 1 && (!oneHit || finalPerKill > oneHit.finalPerKill)) oneHit = pick;
  }
  return {main:main || any, overHits:!main, oneHit};
}
function buildRoute(c) {
  const maps = routeMaps(c);
  return routeBands.map(([from, damage], i) => {
    const to = i + 1 < routeBands.length ? routeBands[i + 1][0] - 1 : 260, steps = [];
    for (let level = from; level <= to; level++) {
      const pick = routePick(maps, {...c, level, damage});
      const last = steps.at(-1);
      if (last && last.main?.code === pick.main?.code && last.oneHit?.code === pick.oneHit?.code && last.overHits === pick.overHits) {
        last.to = level; last.mainEnd = pick.main?.finalPerKill; last.oneHitEnd = pick.oneHit?.finalPerKill;
      } else steps.push({...pick, first:level === from, from:level, to:level, mainEnd:pick.main?.finalPerKill, oneHitEnd:pick.oneHit?.finalPerKill});
    }
    return {from, to, damage, steps};
  });
}
function routeMapButton(r) {
  return `<button type="button" class="map-btn" data-route-map="${r.code}">${escapeHtml(r.name)}</button>`;
}
function routeExp(start, end) {
  return start === undefined ? '' : Math.round(start) === Math.round(end) ? compact(start) : compact(start) + '–' + compact(end);
}
function routeStepHtml(s) {
  const lv = s.from === s.to ? `Lv ${s.from}` : `Lv ${s.from}–${s.to}`;
  if (!s.main) return `<li><span class="route-lv">${lv}</span><span class="route-main">ไม่มีแมพที่เข้าได้</span></li>`;
  const main = `${routeMapButton(s.main)} <span class="cell-note">EXP/ตัว ${routeExp(s.main.finalPerKill, s.mainEnd)} · ตี ${fmt(s.main.hitsPerKill, 1)} ครั้ง${s.overHits ? ' · ⚠ ไม่มีแมพที่ตีไม่เกิน 3 ครั้ง' : ''}</span>`;
  const alt = s.oneHit && s.oneHit.code !== s.main.code
    ? `<span class="route-alt">ทางเลือกตีครั้งเดียว: ${routeMapButton(s.oneHit)} <span class="cell-note">EXP/ตัว ${routeExp(s.oneHit.finalPerKill, s.oneHitEnd)}</span></span>` : '';
  const split = s.first ? '' : `<button type="button" class="text-btn route-split-here" data-route-split="${s.from}" title="เริ่มช่วงใหม่ที่ Lv ${s.from} เพื่อใส่ดาเมจแยก">แยกช่วงที่นี่</button>`;
  return `<li><span class="route-lv">${lv}${split}</span><span class="route-main">${main}</span>${alt}</li>`;
}
function renderRoute() {
  const box = document.getElementById('levelRoute');
  if (!box || typeof config !== 'function') return;
  const c = config(), route = buildRoute(c);
  box.querySelector('.route-bands').innerHTML = route.map((band, i) => `<div class="route-band">
    <div class="route-band-head"><label>เริ่ม Lv <input type="number" min="1" max="260" value="${band.from}" data-route-from="${i}"${i === 0 ? ' disabled' : ''}></label>
      <span>ถึง Lv ${band.to}</span>
      <label>ดาเมจ / ครั้ง <input type="text" inputmode="decimal" value="${routeDamageText(band.damage)}" data-route-damage="${i}" aria-label="ดาเมจช่วง Lv ${band.from}–${band.to}"></label>
      ${band.to > band.from ? `<button type="button" class="text-btn route-split" data-route-split="${band.from + Math.ceil((band.to - band.from + 1) / 2)}">+ แทรกช่วงที่ Lv ${band.from + Math.ceil((band.to - band.from + 1) / 2)}</button>` : ''}
      ${routeBands.length > 1 ? `<button type="button" class="route-remove" data-route-remove="${i}" aria-label="ลบช่วง Lv ${band.from}–${band.to}">×</button>` : ''}</div>
    <ol class="route-steps">${band.steps.map(routeStepHtml).join('')}</ol></div>`).join('');
  box.querySelector('.route-context').textContent = `ใช้ปาร์ตี้ ${c.party} คน · บัฟ ×${fmt(c.external, 2)} · ${c.event ? c.event.name : 'ไม่มีกิจกรรม'}${c.lock ? ' · ซ่อนแมพที่เลเวลยังไม่ถึง' : ''} ตามที่ตั้งด้านบน`;
}
function scheduleRoute() {
  clearTimeout(routeTimer);
  routeTimer = setTimeout(renderRoute, 120);
}
function initRoute() {
  const results = document.getElementById('results');
  if (!results || document.getElementById('levelRoute')) return;
  const box = document.createElement('details');
  box.id = 'levelRoute'; box.className = 'level-route panel'; box.open = true;
  box.innerHTML = `<summary>เส้นทางเก็บเลเวล 1–260</summary>
    <p class="field-help">แต่ละช่วงเลเวลใส่ดาเมจต่อการตีได้ · แนะนำแมพ EXP / ตัว สูงสุดที่ตีไม่เกิน ${ROUTE_MAX_HITS} ครั้ง (เฉลี่ยถ่วงตามจำนวนมอน) และทางเลือกที่ตีครั้งเดียวตาย · <span class="route-context"></span></p>
    <div class="route-bands"></div>
    <div class="route-actions"><button type="button" class="text-btn" data-route-add>+ เพิ่มช่วง</button><button type="button" class="text-btn" data-route-reset>คืนค่าช่วงเริ่มต้น</button></div>`;
  const anchor = results.querySelector('.planning-help');
  (anchor || results.lastElementChild).after(box);
  box.addEventListener('change', e => {
    const from = e.target.dataset.routeFrom, damage = e.target.dataset.routeDamage;
    if (from !== undefined) routeBands[from][0] = Number(e.target.value) || routeBands[from][0];
    if (damage !== undefined) { const n = parseDamage(e.target.value); if (Number.isFinite(n) && n > 0) routeBands[damage][1] = n; }
    routeBands = cleanRouteBands(routeBands); saveRouteBands(); renderRoute();
  });
  box.addEventListener('click', e => {
    const map = e.target.closest('[data-route-map]');
    if (map) { selectedCode = map.dataset.routeMap; renderDetail(currentRows, currentConfig); openModal(); return; }
    const remove = e.target.closest('[data-route-remove]'), split = e.target.closest('[data-route-split]');
    if (split) {
      // Insert a band at this level; it starts with the damage of the band it splits.
      const level = Number(split.dataset.routeSplit), owner = [...routeBands].reverse().find(b => b[0] <= level);
      routeBands.push([level, owner[1]]);
    } else if (remove) { routeBands.splice(Number(remove.dataset.routeRemove), 1); routeBands = cleanRouteBands(routeBands); }
    else if (e.target.closest('[data-route-add]')) {
      const last = routeBands.at(-1);
      if (last[0] < 260) routeBands.push([Math.min(260, last[0] + 10), last[1]]);
    } else if (e.target.closest('[data-route-reset]')) routeBands = ROUTE_DEFAULT.map(b => [...b]);
    else return;
    routeBands = cleanRouteBands(routeBands); saveRouteBands(); renderRoute();
  });
  // Re-run after every page render so settings, event and level lock changes apply.
  const pageRender = render;
  render = function () { const result = pageRender.apply(this, arguments); scheduleRoute(); return result; };
  renderRoute();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRoute);
else initRoute();
