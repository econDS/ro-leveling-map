const IDS = Object.keys(DEFAULT_SETTINGS);
let sortKey = 'finalPerKill', sortDir = -1, selectedCode = 'oz_dun01', modalReturnFocus = null;
let lastEventState = '';
function currentEventState() {
  return JSON.stringify([activeSpotlight(SPOTLIGHT_EVENTS)?.id,spotlightCoverage(SPOTLIGHT_EVENTS).expired]);
}
function refreshEventState() { if(currentEventState()!==lastEventState)render(); }
const fmt = (n,d=0) => Number.isFinite(n) ? n.toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d}) : '-';
const expFmt = n => fmt(n,1);
const pct = (n,d=1) => Number.isFinite(n) ? `${fmt(n,d)}%` : '-';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function get(id) { const el=document.getElementById(id); return el.type==='checkbox' ? el.checked : Number(el.value)||0; }
function config() {
  const party = Math.max(1, Math.min(12, get('partySize')));
  const h = 1 + (get('serverBonus')+get('kafraBonus')+get('malangdoBonus')+get('premiumBonus')+get('staffBonus')+get('customBonus'))/100;
  const i = 1 + (get('gearBonus')+get('richManBonus'))/100;
  return {level:Math.max(1,Math.min(260,get('playerLevel'))), party,
    query:document.getElementById('searchBox').value.trim().toLowerCase(),lock:get('enforceLevelLock'),
    dailyDungeonMode:document.getElementById('dailyDungeonMode').value,
    event:document.getElementById('spotlightEvent').value==='auto' ? activeSpotlight(SPOTLIGHT_EVENTS) : SPOTLIGHT_EVENTS.find(e=>e.id===document.getElementById('spotlightEvent').value)||null,
    raceBonuses:Object.fromEntries(RACES.map(r=>[r,get('race'+r)])),
    partyShare:(.8+.2*party)/party,h,i,manual:get('manualBonus')/100,external:h*i+get('manualBonus')/100};
}
let monsterSortKey='finalPerKill', monsterSortDir=-1;
const compact = n => !Number.isFinite(n) ? '−' : Math.abs(n)>=1e9 ? fmt(n/1e9,1)+'B' : Math.abs(n)>=1e6 ? fmt(n/1e6,1)+'M' : Math.abs(n)>=1e4 ? fmt(n/1e3,1)+'K' : fmt(n,1);
const fullExp = n => fmt(n,1);
const numberCell = n => `<span title="${fmt(n,1)}">${compact(n)}</span>`;
function planningLabels(monster=false) {
  return {
    name:monster?'มอนสเตอร์':'แผนที่',
    finalPerKill:monster?'EXP ที่ได้ / ตัว':'EXP ที่ได้ / ตัว (เฉลี่ยต่อแผนที่)',
    hp:monster?'HP / ตัว':'HP / ตัว (เฉลี่ยต่อแผนที่)',
    expPerMillionHp:monster?'EXP ต่อ HP 1 ล้าน':'EXP ต่อ HP 1 ล้าน (เฉลี่ยต่อแผนที่)',
    shownAmount:monster?'จำนวนมอน':'จำนวนมอนทั้งแมพ',
    finalAreaScore:'คะแนนพื้นที่'
  };
}
function planningSortControls(monster=false) {
  const id=monster?'monsterSort':'mapSort', labels=planningLabels(monster);
  const options=Object.entries(labels);
  return `<div class="mobile-sort"><label for="${id}">เรียงตาม</label><select id="${id}">${options.map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select><button id="${id}Direction" type="button" class="text-btn">มาก → น้อย</button></div>`;
}
function bindPlanningSort(monster,refresh) {
  const id=monster?'monsterSort':'mapSort',select=document.getElementById(id),button=document.getElementById(id+'Direction');
  select.addEventListener('change',()=>{
    if(monster){monsterSortKey=select.value;monsterSortDir=select.value==='name'?1:-1;}
    else{sortKey=select.value;sortDir=select.value==='name'?1:-1;}
    refresh();document.getElementById(id).focus();
  });
  button.addEventListener('click',()=>{
    if(monster)monsterSortDir*=-1;else sortDir*=-1;
    refresh();document.getElementById(id+'Direction').focus();
  });
}
function planningHeaders(monster=false) {
  return Object.entries(planningLabels(monster)).map(([key,label])=>`<th scope="col" data-${monster?'monster-sort':'sort'}="${key}" aria-sort="none"><button type="button" class="sort-button">${label}<span class="sort-arrow" aria-hidden="true"></span></button></th>`).join('');
}
function planningCells(r,identity,monster=false) {
  const labels=planningLabels(monster);
  return `<td data-label="${labels.name}" class="identity-cell">${identity}</td>
    <td data-label="${labels.finalPerKill}" class="final-col"><span title="${monster?'EXP ของมอนชนิดนี้':'EXP เฉลี่ยถ่วงตามจำนวนมอนในแมพ'} ก่อนปัดเศษ">${fullExp(r.finalPerKill)}</span><span class="cell-note ${r.yieldPct<100?'yield-low':''}">เลเวลให้ ${pct(r.yieldPct,1)}</span></td>
    <td data-label="${labels.hp}">${numberCell(r.hp)}<span class="cell-note">${monster?'เลือดต่อตัว':'เฉลี่ยตามจำนวนมอน'}</span></td>
    <td data-label="${labels.expPerMillionHp}">${numberCell(r.expPerMillionHp)}<span class="cell-note">EXP ต่อเลือด 1 ล้าน</span></td>
    <td data-label="${labels.shownAmount}">${fmt(r.shownAmount)}<span class="cell-note">${monster?pct(r.sharePct)+' ของแมพ':r.hasWalk?fmt(r.monsterDensity,1)+' / 10k ช่อง':'ไม่มีข้อมูลพื้นที่'}</span></td>
    <td data-label="${labels.finalAreaScore}" class="density-col">${r.hasWalk?numberCell(r.finalAreaScore):'−'}<span class="cell-note">${r.hasWalk?(monster?'ส่วนของมอนชนิดนี้':'EXP × ความหนาแน่น'):'ไม่มี GAT ยืนยัน'}</span></td>`;
}
function monsterSpawnBadge(monster) {
  if(monster.shownAmount===monster.amount)return '';
  const doubled=monster.amount>0 && monster.shownAmount===monster.amount*2;
  return `<span class="tag good"${doubled?` title="จำนวนมอน ${fmt(monster.amount)} → ${fmt(monster.shownAmount)}"`:''}>${doubled?'จำนวนมอน ×2':'จำนวนมอน '+fmt(monster.amount)+' → '+fmt(monster.shownAmount)}</span>`;
}
function mapSpawnBadge(map,event) {
  if(map.shownAmount===map.amount && !map.spawnChangedMonsters)return '';
  const monsters=map.monsters||[];
  const doubled=monsters.filter(monster=>monster.amount>0 && monsterEventAmount(map,monster,event)===monster.amount*2).length;
  const allDoubled=map.shownAmount===map.amount*2 && (!monsters.length || doubled===monsters.length);
  if(allDoubled)return `<span class="tag good" title="จำนวนมอน ${fmt(map.amount)} → ${fmt(map.shownAmount)}">จำนวนมอน ×2</span>`;
  const partial=doubled?`<span class="tag good">มอน ${fmt(doubled)} ชนิด ×2</span>`:'';
  return partial+(map.shownAmount===map.amount?'':`<span class="tag good">จำนวนมอน ${fmt(map.amount)} → ${fmt(map.shownAmount)}</span>`);
}
function calculationGrid(items) {
  return `<dl class="calculation-grid">${items.map(([label,value])=>`<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`;
}
function monsterRows(map,c) {
  const monsters=map.monsters||[], total=monsters.reduce((sum,m)=>sum+monsterEventAmount(map,m,c.event),0);
  if (!monsters.length) return '<tr><td colspan="6">ไม่มีรายละเอียดมอนสเตอร์ในแมพนี้</td></tr>';
  const rows=monsters.map((m,index)=>{
    const rule=spotlightRule(map,m,c.event), eventExp=monsterEventExp(map,m,c.event);
    const y=levelYield(c.level,m.level), afterPenalty=eventExp*y, afterParty=afterPenalty*c.partyShare;
    const finalPerKill=afterParty*monsterFactor(map,m,c), shownAmount=monsterEventAmount(map,m,c.event);
    return {...m,index,rule,eventExp,afterPenalty,afterParty,finalPerKill,shownAmount,yieldPct:y*100,
      expPerMillionHp:m.hp>0?finalPerKill/m.hp*1e6:0,hasWalk:map.hasWalk,
      sharePct:total?shownAmount/total*100:0,
      finalAreaScore:map.hasWalk?finalPerKill*shownAmount/map.walkableCells*10000:0};
  }).sort((a,b)=>(typeof a[monsterSortKey]==='string'?a[monsterSortKey].localeCompare(b[monsterSortKey]):a[monsterSortKey]-b[monsterSortKey])*monsterSortDir);
  return rows.map(m=>{
    const alt=escapeHtml(m.name), race=monsterRace(map,m)||'ไม่ทราบ', sourceChanged=m.rule&&m.rule.normalExp!==m.baseExp;
    const sourceChangedLabel=(m.baseExpSource?.startsWith('GGT Spotlight')||map.source?.startsWith('GGT Spotlight'))?'ฐาน GGT ต่างรอบ':'ฐานประกาศต่าง';
    const image=m.image?`<img class="mob-img" src="${escapeHtml(m.image)}" alt="" loading="lazy">`:'';
    const identity=`<div class="monster-identity">${image}<div><button type="button" class="map-btn monster-detail-btn" data-monster-detail="${m.index}" aria-expanded="false" aria-controls="monster-calculation-${m.index}">${alt}</button><span class="cell-note">Lv ${m.level} · ${escapeHtml(race)} · EXP เผ่า +${pct(raceBonus(map,m,c),0)}</span>${m.rule?'<span class="tag spotlight-tag">★ '+escapeHtml(c.event?.label||'Spotlight')+' ×'+fmt(m.rule.eventExp/m.rule.normalExp)+'</span>':''}${monsterSpawnBadge(m)}${sourceChanged?'<span class="tag warn">'+sourceChangedLabel+'</span>':''}</div></div>`;
    const details=calculationGrid([['EXP ปกติ',fmt(m.baseExp)],['แหล่งข้อมูล EXP ปกติ',m.baseExpSource||map.source||'ไม่ระบุ'],['EXP กิจกรรมที่ใช้',fmt(m.eventExp)],['EXP ปกติในประกาศ',m.rule?fmt(m.rule.normalExp):'−'],['หลังปรับตามเลเวล',expFmt(m.afterPenalty)],['หลังแบ่งปาร์ตี้',expFmt(m.afterParty)],['ตัวคูณบัฟรวมเผ่า',fmt(monsterFactor(map,m,c),4)+'×'],['EXP ที่ได้ / ตัว',expFmt(m.finalPerKill)],['HP / ตัว',fmt(m.hp)],['EXP ต่อ HP 1 ล้าน',expFmt(m.expPerMillionHp)],['จำนวนปกติ → ช่วงกิจกรรม',fmt(m.amount)+' → '+fmt(m.shownAmount)],['มอน / 10,000 ช่อง',map.hasWalk?fmt(m.shownAmount/map.walkableCells*10000,1):'−'],['คะแนนพื้นที่ของมอนชนิดนี้',map.hasWalk?fmt(m.finalAreaScore,1):'−']]);
    const baseSourceLink=m.baseExpSourceUrl?'<p class="field-help"><a href="'+escapeHtml(m.baseExpSourceUrl)+'" target="_blank" rel="noopener">ประกาศ GGT ที่ยืนยัน EXP ปกติ</a></p>':'';
    return `<tr class="monster-planning-row">${planningCells(m,identity,true)}</tr><tr id="monster-calculation-${m.index}" class="calculation-row" hidden><td colspan="6"><strong>${alt} · รายละเอียดการคำนวณ</strong>${details}${baseSourceLink}</td></tr>`;
  }).join('');
}
function updateSortLabels(table,key,direction,attribute) {
  const id=attribute==='data-sort'?'mapSort':'monsterSort';
  const select=document.getElementById(id);if(select)select.value=key;
  const button=document.getElementById(id+'Direction');if(button)button.textContent=key==='name'?(direction===1?'ก → ฮ':'ฮ → ก'):(direction===1?'น้อย → มาก':'มาก → น้อย');
  table.querySelectorAll('th['+attribute+']').forEach(th=>{
    const active=th.getAttribute(attribute)===key;
    th.setAttribute('aria-sort',active?(direction===1?'ascending':'descending'):'none');
    th.querySelector('.sort-arrow').textContent=active?(direction===1?' ↑':' ↓'):'';
  });
}
function closeModal() {
  document.getElementById('mapModal').classList.remove('open');
  document.getElementById('mapModal').setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  if (modalReturnFocus?.isConnected) modalReturnFocus.focus();
}
function openModal() {
  modalReturnFocus=document.activeElement;
  document.getElementById('mapModal').classList.add('open');
  document.getElementById('mapModal').setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  document.getElementById('closeMapModal').focus();
}
function geometryPreview(selected) {
  const g=selected.geometry, original=`assets/maps/${escapeHtml(selected.mapImage||selected.code)}.png`;
  if(!selected.hasWalk)return `<div class="map-preview"><img src="${original}" alt="ภาพประกอบ ${escapeHtml(selected.code)}"></div><p class="hint geometry-unavailable">ไม่มีข้อมูลช่องเดินที่ยืนยันได้ · ไม่คำนวณความหนาแน่นมอนหรือคะแนนพื้นที่<br>${escapeHtml(g?.reason||'ยังไม่มี GAT ของแมพนี้')}</p>`;
  const views=[['overlay','พื้นที่ที่นับ',g.overlayImage],['raw','แผนผัง',g.rawImage],['mask','ขาว / ดำ',g.maskImage],['original','ภาพเดิม',original]];
  return `<div class="geometry-views" role="group" aria-label="มุมมองแผนที่">${views.map(([key,label,src])=>`<button type="button" data-geometry-view="${key}" data-image="${escapeHtml(src)}" aria-pressed="${key==='original'}">${label}</button>`).join('')}</div>
    <div class="map-preview"><img id="geometryImage" src="${original}" alt="${escapeHtml(selected.code)} ภาพเดิมสำหรับดูตำแหน่ง"></div>
    <p id="geometryCaption" class="geometry-caption" aria-live="polite">ภาพเดิมสำหรับดูตำแหน่ง · ไม่ใช้วัดพื้นที่</p>
    <div class="geometry-stats"><div>ช่องเดิน<strong>${fmt(g.walkableCells)}</strong></div><div>สัดส่วนของทั้งแมพ<strong>${pct(selected.walkablePct)}</strong></div></div>
    <details class="geometry-source"><summary>วิธีนับและแหล่งข้อมูล · GAT</summary><p>นับชนิดช่องเดินจากข้อมูล GAT โดยตรง ไม่ใช้ความสว่างของภาพ · ขนาด ${g.width} × ${g.height} ช่อง</p><p>พื้นที่เชื่อมต่อ ${fmt(g.components)} กลุ่ม · กลุ่มใหญ่สุด ${pct(g.largestComponentCells/g.walkableCells*100)} ของช่องเดิน<br>เก็บทุกกลุ่มไว้ เพราะห้องแยกอาจเข้าผ่านวาร์ปได้ ไม่ตัดทางแคบหรือเติมช่องว่าง · ไม่นับช่องขอบนอกสุดด้าน X/Y ตามกติกาอ้างอิง ${fmt(g.excludedBoundaryCells)} ช่อง</p><p>ข้อมูลอ้างอิง Divine Pride ตรวจ ${g.checkedOn} · ยังไม่ยืนยันกับเซิร์ฟเวอร์ไทยหรือขอบเขตเกิดมอนจริง จึงเป็นคะแนนความหนาแน่นเฉลี่ยทั้งแมพ ไม่ใช่ EXP ต่อชั่วโมง</p><a href="${escapeHtml(g.sourceUrl)}" target="_blank" rel="noopener">แหล่งแผนที่ / GAT</a> · <a href="${escapeHtml(g.maskImage)}" target="_blank" rel="noopener">เปิดภาพช่องเดิน</a></details>`;
}
function bindGeometryViews() {
  const captions={overlay:'สีเขียว = ช่องเดินที่นับจาก GAT',raw:'ภาพแผนที่ต้นฉบับ · สีภาพไม่ถูกใช้ตัดสินว่าช่องเดินได้',mask:'ขาว = ช่องเดินที่นับ · ดำ = ช่องที่ไม่นับ · 1 พิกเซล = 1 ช่อง GAT',original:'ภาพเดิมสำหรับดูตำแหน่ง · ไม่ใช้วัดพื้นที่'};
  document.querySelectorAll('[data-geometry-view]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-geometry-view]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    const caption=captions[button.dataset.geometryView], image=document.getElementById('geometryImage');
    image.src=button.dataset.image;image.alt=selectedCode+' '+caption;
    document.getElementById('geometryCaption').textContent=caption;
  }));
}
function renderDetail(rows,c) {
  const selected=rows.find(r=>r.code===selectedCode)||rows[0]||row(MAPS.find(m=>m.code===selectedCode)||MAPS[0],c);
  selectedCode=selected.code;
  const body=document.getElementById('mapModalBody');
  const preserve=document.getElementById('mapModal').classList.contains('open') && body.dataset.code===selected.code;
  const state=preserve?{scroll:body.scrollTop,details:[...body.querySelectorAll('details')].map(el=>el.open),expanded:[...body.querySelectorAll('[data-monster-detail][aria-expanded="true"]')].map(el=>el.dataset.monsterDetail),view:body.querySelector('[data-geometry-view][aria-pressed="true"]')?.dataset.geometryView}:null;
  body.dataset.code=selected.code;
  const image=geometryPreview(selected);
  document.getElementById('mapModalTitle').innerHTML=`<h2>${escapeHtml(selected.name)}</h2><span class="tag">${selected.code}</span>${selected.group==='ep20'?'<span class="tag">EP20</span>':''}`;
  if(selected.archivedEvent)document.getElementById('mapModalTitle').insertAdjacentHTML('beforeend','<span class="tag warn">ย้อนหลัง 2026 · จบแล้ว</span>');
  const notes=[selected.archivedEvent?`${selected.archivedEvent} · กิจกรรมจบแล้ว ผลนี้จำลองด้วย EXP / HP / จำนวนมอนรอบเดิม และเลเวล / ปาร์ตี้ / บัฟที่ตั้งอยู่ เพื่อเปรียบเทียบหรือวางแผนซ้อมหากเปิดใหม่`:null,selected.accessNote,selected.dataNote,selected.excludedBosses?.length?`ค่าเฉลี่ยไม่รวมบอส: ${selected.excludedBosses.join(', ')}`:''].filter(Boolean);
  const mapCalc=calculationGrid([['เลเวลขั้นต่ำเข้าแมพ',selected.entryRequirementVerified===false?'ยังไม่ยืนยัน':fmt(selected.min)],['เลเวลมอน (เฉลี่ยต่อแผนที่)',fmt(selected.level,1)],['EXP ปกติ (เฉลี่ยต่อแผนที่)',expFmt(selected.baseExp)],['EXP กิจกรรม (เฉลี่ยต่อแผนที่)',expFmt(selected.eventBaseExp)],['หลังปรับตามเลเวล (เฉลี่ยต่อแผนที่)',expFmt(selected.baseAfterPenalty)],['หลังแบ่งปาร์ตี้ (เฉลี่ยต่อแผนที่)',expFmt(selected.baseAfterParty)],['EXP ที่ได้ / ตัว (เฉลี่ยต่อแผนที่)',expFmt(selected.finalPerKill)],['HP / ตัว (เฉลี่ยต่อแผนที่)',fmt(selected.hp,1)],['EXP ต่อ HP 1 ล้าน (เฉลี่ยต่อแผนที่)',expFmt(selected.expPerMillionHp)],['จำนวนมอนปกติ → ช่วงกิจกรรม',fmt(selected.amount)+' → '+fmt(selected.shownAmount)],['มอน / 10,000 ช่อง',selected.hasWalk?fmt(selected.monsterDensity,1):'−'],['คะแนนพื้นที่',selected.hasWalk?fmt(selected.finalAreaScore,1):'−']]);
  document.getElementById('mapModalBody').innerHTML=`<div class="detail planning-detail"><div>${image}</div><div><div class="detail-meta">${[['EXP ที่ได้ / ตัว (เฉลี่ยต่อแผนที่)',fullExp(selected.finalPerKill)],['EXP ต่อ HP 1 ล้าน (เฉลี่ยต่อแผนที่)',compact(selected.expPerMillionHp)],['จำนวนมอนทั้งแมพ',fmt(selected.shownAmount)],['คะแนนพื้นที่',selected.hasWalk?compact(selected.finalAreaScore):'−']].map(([k,v])=>`<div class="mini"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div><p class="hint">${c.event?`${escapeHtml(c.event.name)} · EXP เพิ่ม ${selected.affectedMonsters}/${selected.monsters?.length||0} ชนิด`:'ไม่มีกิจกรรม · ใช้ EXP ปกติ'}${selected.spawnChangedMonsters?' · จำนวนมอน '+fmt(selected.amount)+' → '+fmt(selected.shownAmount):''}<br>EXP ที่ได้แสดงทศนิยม 1 ตำแหน่ง รวมผลเลเวล ปาร์ตี้ และบัฟแล้ว · แมพเป็นค่าเฉลี่ย; เทียบในเกมจากมอนชนิดนั้นในตารางด้านล่าง (ปัดเศษเฉพาะการแสดงผล)</p>${notes.map(n=>`<p class="hint">${escapeHtml(n)}</p>`).join('')}${selected.sourceUrl?`<p class="hint"><a href="${escapeHtml(selected.sourceUrl)}" target="_blank" rel="noopener">${selected.source?.startsWith('GGT Spotlight')?'แหล่งข้อมูล EXP ปกติ (GGT)':'แหล่งข้อมูลแผนที่และมอนสเตอร์'}</a></p>`:''}<details class="map-calculation"><summary>รายละเอียดตัวเลขและขั้นตอนคำนวณของแมพ</summary>${mapCalc}</details></div></div><div class="table-caption"><strong>มอนสเตอร์ในแมพ</strong><span>เรียงได้ทุกคอลัมน์ · คลิกชื่อเพื่อดูวิธีคำนวณ</span></div>${planningSortControls(true)}<div class="table-wrap planning-wrap"><table class="monster-table planning-table"><thead><tr>${planningHeaders(true)}</tr></thead><tbody>${monsterRows(selected,c)}</tbody></table></div><p class="field-help">EXP ต่อ HP 1 ล้าน = EXP ที่ได้ ÷ HP × 1,000,000 · ใช้เทียบ EXP ต่อเลือดที่ต้องตี ไม่ใช่ความเร็วฆ่าจริง<br>คะแนนพื้นที่รายมอนเป็นส่วนของมอนชนิดนั้นในแมพ รวมกันเป็นคะแนนพื้นที่ของแมพ</p>`;
  document.querySelectorAll('[data-monster-detail]').forEach(button=>button.addEventListener('click',()=>{
    const expanded=button.getAttribute('aria-expanded')==='true';
    button.setAttribute('aria-expanded',String(!expanded));
    document.getElementById(button.getAttribute('aria-controls')).hidden=expanded;
  }));
  document.querySelectorAll('th[data-monster-sort]').forEach(th=>th.querySelector('button').addEventListener('click',()=>{
    const key=th.dataset.monsterSort;
    if(monsterSortKey===key)monsterSortDir*=-1;else{monsterSortKey=key;monsterSortDir=key==='name'?1:-1;}
    renderDetail(rows,c);
    document.querySelector(`th[data-monster-sort="${key}"] button`).focus();
  }));
  bindPlanningSort(true,()=>renderDetail(rows,c));
  updateSortLabels(document.querySelector('.monster-table'),monsterSortKey,monsterSortDir,'data-monster-sort');
  bindGeometryViews();
  const context=planningContext(selected),access=context.access;
  const ggtBaseCount=selected.ggtBaseCount||0;
  const sourceNote=ggtBaseCount?'EXP ปกติจาก GGT '+fmt(ggtBaseCount)+'/'+fmt(selected.monsters?.length||0)+' ตัว'+(ggtBaseCount<(selected.monsters?.length||0)?' · ที่เหลือใช้ '+(selected.source||'ข้อมูลอ้างอิงเดิม'):'')+' · ประกาศต่างรอบอาจลงฐานไม่เท่ากัน':selected.source==='Main'?'เอกสารหลักของโครงการ · ตรวจได้ต่างกันในแต่ละมอน ไม่ใช่การยืนยันในเกมครบทั้งแมพ':selected.source?.startsWith('RO Thailand EP20')?'ประกาศ RO Thailand EP20 สำหรับข้อมูลมอนปกติ':'ข้อมูลฐานอ้างอิง '+(selected.source||'ไม่ระบุ')+' · ควรเทียบ EXP ในเกมก่อนใช้ตัดสินใจ';
  const info=[selected.accessSourceUrl?'เงื่อนไขเข้าอ้างอิง: '+selected.accessSourceUrl:null,access?`วิธีเข้า: ${access.label} · ${access.note}`:'เลเวลขั้นต่ำเป็นตัวกรองเบื้องต้น ยังต้องตรวจเควสและวิธีเข้าของแมพนี้',access?.method.startsWith('ticket')?PLANNING_CONTEXT.ticketNote:null,`แหล่ง EXP ปกติ: ${sourceNote}`,c.event?'EXP กิจกรรมและจำนวนมอนใช้ตามประกาศรอบที่เลือก แยกจาก EXP ปกติ':null].filter(Boolean);
  const sourceDetails=document.createElement('details');sourceDetails.className='access-source';
  sourceDetails.innerHTML='<summary>วิธีเข้าและแหล่งข้อมูล</summary>'+info.map(note=>`<p class="field-help">${escapeHtml(note)}</p>`).join('');
  body.querySelector('.map-calculation').before(sourceDetails);
  if(state){
    body.querySelectorAll('details').forEach((el,index)=>el.open=state.details[index]||false);
    state.expanded.forEach(index=>body.querySelector(`[data-monster-detail="${index}"]`)?.click());
    if(state.view)body.querySelector(`[data-geometry-view="${state.view}"]`)?.click();
    body.scrollTop=state.scroll;
  }
}
function render() {
  lastEventState=currentEventState();
  const c=config();
  const serverBonus=get('serverBonus');
  document.getElementById('serverExpTotal').textContent=`EXP เซิร์ฟเวอร์ก่อนบัฟอื่นและกิจกรรม: พื้นฐาน 100% + โบนัส ${fmt(serverBonus)}% = ${fmt(100+serverBonus)}%`;
  const included=MAPS.filter(m=>includesArchivedMap(m,c.dailyDungeonMode));
  const rows=included.map(m=>row(m,c)).filter(r=>!r.locked&&matchesMapSearch(r,c.query)).sort((a,b)=>{
    if(sortKey==='finalAreaScore' && a.hasWalk!==b.hasWalk)return a.hasWalk?-1:1;
    const av=a[sortKey],bv=b[sortKey]; return (typeof av==='string'?av.localeCompare(String(bv)):av-bv)*sortDir;
  });
  const best=[...rows].sort((a,b)=>b.finalPerKill-a.finalPerKill)[0];
  const bestArea=[...rows].filter(r=>r.hasWalk).sort((a,b)=>b.finalAreaScore-a.finalAreaScore)[0];
  document.getElementById('archiveInfo').textContent=c.dailyDungeonMode==='hide'
    ? 'ซ่อน 6 แมพย้อนหลังจากตารางและอันดับทุกโหมดกิจกรรม'
    : 'กำลังจำลองข้อมูลรอบเก่า · รวมอันดับ EXP เฉลี่ย / ตัว; ยังไม่มี GAT จึงไม่เข้าอันดับพื้นที่ · ใช้เลเวล ปาร์ตี้ และบัฟที่ตั้งอยู่ (เลเวลขั้นต่ำ 200 / ตัวกรองค้นหายังมีผล)';
  document.getElementById('summary').innerHTML=[['แมพ EXP เฉลี่ย / ตัวสูงสุด',best?.name||'-',best?fullExp(best.finalPerKill)+(best.archivedEvent?' · ย้อนหลัง 2026':''):''],['แมพคะแนนพื้นที่สูงสุด · GAT',bestArea?.name||'-',bestArea?fullExp(bestArea.finalAreaScore)+' · ช่องเดินจาก GAT':'ไม่มีข้อมูลช่องเดินสำหรับอันดับพื้นที่'],['บัฟรวมก่อนโบนัสเผ่า',`${fmt(c.external,2)}x`,`H ${fmt(c.h,2)} × I ${fmt(c.i,2)} + M ${fmt(c.manual,2)} · เผ่าคิดแยกรายมอน`],['แมพที่แสดง',fmt(rows.length),`จาก ${included.length} แมพในโหมดนี้ · คลังทั้งหมด ${MAPS.length}`]].map(([l,v,s])=>`<div class="metric"><div class="label">${l}</div><div class="value">${escapeHtml(v)}</div><div class="sub">${escapeHtml(s)}</div></div>`).join('');
  document.getElementById('eventInfo').innerHTML=c.event ? `${escapeHtml(c.event.name)}<br>${c.event.start} – ${c.event.end}<br>${escapeHtml(c.event.notes)}<br><a href="${c.event.image}" target="_blank" rel="noopener">ดูตารางกิจกรรม</a> · <a href="${c.event.sourceUrl}" target="_blank" rel="noopener">ประกาศทางการ</a>` : 'ไม่มีกิจกรรม · ใช้ EXP และจำนวนมอนปกติ<br>Server EXP และบัฟด้านล่างตั้งค่าแยกจากกิจกรรม';
  const conflicts=SPOTLIGHT_COVERAGE_EXCEPTIONS.filter(item=>item.eventId===c.event?.id);
  if(conflicts.length)document.getElementById('eventInfo').insertAdjacentHTML('beforeend','<details><summary>ข้อมูลประกาศที่ยังจับคู่ไม่ได้ ('+conflicts.length+')</summary>'+conflicts.map(item=>'<p class="field-help">'+escapeHtml(item.reason)+'</p>').join('')+'</details>');
  const auto=document.getElementById('spotlightEvent').value==='auto';
  const coverage=spotlightCoverage(SPOTLIGHT_EVENTS);
  document.getElementById('eventInfo').insertAdjacentHTML('afterbegin',`<span class="event-status">${auto?'อัตโนมัติ · '+(c.event?'อยู่ในช่วงกิจกรรม':'ไม่พบกิจกรรมในข้อมูลที่บันทึก'):'เลือกกิจกรรมเอง'}</span>`);
  document.getElementById('eventCoverage').innerHTML=`ตรวจคลังกิจกรรมล่าสุด 2026-09-24 · รอบล่าสุดสิ้นสุด ${coverage.lastEnd}${coverage.expired?'<br><strong>กิจกรรมล่าสุดในคลังจบแล้ว ยังไม่ยืนยันรอบใหม่ — ใช้ EXP ปกติคำนวณ</strong>':''}`;
  if(auto)document.getElementById('eventInfo').insertAdjacentHTML('beforeend','<br><small>เวลาไทย · ใช้วันเริ่ม 12:00 ถึงวันสิ้นสุด 06:00 เป็นขอบเขตคำนวณ; วันปิดปรับปรุงเลือกเองได้ตามเวลาเปิดเซิร์ฟเวอร์</small>');
  const buffs=IDS.filter(id=>id.endsWith('Bonus') && get(id)>0).length;
  document.getElementById('buffCount').textContent=buffs?`${buffs} รายการ`:'ไม่ใช้บัฟ';
  document.getElementById('raceCount').textContent=`${RACES.filter(r=>get('race'+r)>0).length} / 10`;
  const autoOption=document.querySelector('#spotlightEvent option[value="auto"]');
  autoOption.textContent='อัตโนมัติ · '+(activeSpotlight(SPOTLIGHT_EVENTS)?.name||(coverage.expired?'ไม่มีกิจกรรม (รอข้อมูลใหม่)':'ไม่มีกิจกรรม'));
  const racialCount=RACES.filter(r=>get('race'+r)>0).length;
  document.getElementById('advancedStatus').textContent=(auto?'อัตโนมัติ · ':'')+(c.event?.name||'ไม่มีกิจกรรม')+' · '+(buffs?buffs+' บัฟ':'บัฟทั่วไป 0')+(racialCount?' · โบนัสเผ่า '+racialCount:'');
  document.querySelector('#mapTable tbody').innerHTML=rows.length ? rows.map((r,i)=>{
    const context=planningContext(r);
    const identity=`<div class="map-identity"><span class="rank">${i+1}</span><div><button class="map-btn" type="button" data-code="${r.code}">${escapeHtml(r.name)}</button>${context.englishName?`<span class="cell-note">${escapeHtml(context.englishName)}</span>`:''}<span class="cell-note">${escapeHtml(r.code)} · ${r.entryRequirementVerified===false?'เลเวลเข้าแมพ: ยังไม่ยืนยัน':'เลเวลขั้นต่ำเข้าแมพ '+r.min+'+'} · เลเวลมอนเฉลี่ย ${fmt(r.level,1)}</span>${context.access?`<span class="tag" title="${escapeHtml(context.access.note)}">${escapeHtml(context.access.label)}</span>`:''}${r.archivedEvent?'<span class="tag warn">ย้อนหลัง 2026</span>':''}${r.affectedMonsters?'<span class="tag spotlight-tag">★ '+escapeHtml(c.event?.label||'Spotlight')+'</span>':''}${mapSpawnBadge(r,c.event)}</div></div>`;
    return `<tr class="map-row" data-code="${r.code}">${planningCells(r,identity)}</tr>`;
  }).join('') : '<tr><td colspan="6">ไม่พบแมพที่ตรงกับคำค้นหรือตัวกรอง</td></tr>';
  updateSortLabels(document.getElementById('mapTable'),sortKey,sortDir,'data-sort');
  document.querySelectorAll('.map-row').forEach(el=>el.addEventListener('click',()=>{selectedCode=el.dataset.code;renderDetail(rows,c);openModal();}));
  if(document.getElementById('mapModal').classList.contains('open')){if(rows.length)renderDetail(rows,c);else closeModal();}
}
function readInputs() {
  return cleanSettings(Object.fromEntries(IDS.map(id=>{const el=document.getElementById(id);return [id,el.type==='checkbox'?el.checked:el.type==='number'||id.endsWith('Bonus')?Number(el.value):el.value];})),SPOTLIGHT_EVENTS);
}
function applySettings(settings) {
  const clean=cleanSettings(settings,SPOTLIGHT_EVENTS);
  IDS.forEach(id=>{const el=document.getElementById(id);if(el.type==='checkbox')el.checked=clean[id];else el.value=clean[id];});
}
function saveSettings() {
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(readInputs()));document.getElementById('storageStatus').textContent='บันทึกแล้ว · ในเบราว์เซอร์นี้';}
  catch(_){document.getElementById('storageStatus').textContent='เบราว์เซอร์ไม่อนุญาตให้บันทึก · ใช้ได้ในหน้านี้';}
}
function restoreSettings() {
  try{applySettings(JSON.parse(localStorage.getItem(SETTINGS_KEY)));}
  catch(_){applySettings(DEFAULT_SETTINGS);document.getElementById('storageStatus').textContent='เริ่มด้วยค่าเริ่มต้น · ไม่สามารถอ่านค่าที่บันทึก';}
}
function loadSharedSettings() {
  try {
    const shared=sharedSettings(location.hash,SPOTLIGHT_EVENTS);
    if(shared){applySettings(shared);saveSettings();document.getElementById('shareStatus').textContent='โหลดค่าจากลิงก์แล้ว';}
  } catch(_){document.getElementById('shareStatus').textContent='ลิงก์การตั้งค่าไม่ถูกต้อง ใช้ค่าที่บันทึกไว้';}
}
async function copySettingsLink() {
  const url=new URL(location.href);
  url.hash=new URLSearchParams({settings:JSON.stringify({version:1,settings:readInputs()})}).toString();
  try {
    await navigator.clipboard.writeText(url.href);
    document.getElementById('shareStatus').textContent='คัดลอกแล้ว';document.getElementById('shareLink').hidden=true;
  } catch(_) {
    const input=document.getElementById('shareLink');input.hidden=false;input.value=url.href;input.focus();input.select();
    document.getElementById('shareStatus').textContent='คัดลอกลิงก์จากช่องด้านล่าง';
  }
}
function init() {
  // Clear the obsolete password saved by the previous gate, if storage is allowed.
  try { localStorage.removeItem('ro-general-map-exp-tool-password'); } catch (_) {}
  const select=document.getElementById('spotlightEvent');
  document.getElementById('raceInputs').innerHTML=RACES.map(r=>`<div><label for="race${r}">${r}</label><div class="percent-input"><input id="race${r}" type="number" min="0" max="10000" step="1" value="0"><span>%</span></div></div>`).join('');
  sortedEvents(SPOTLIGHT_EVENTS).forEach(e=>select.add(new Option(`${e.name} (${e.start} – ${e.end})`,e.id)));
  restoreSettings();
  loadSharedSettings();
  window.addEventListener('hashchange',()=>{loadSharedSettings();render();});
  document.getElementById('shareSettings').addEventListener('click',copySettingsLink);
  // Collapse only on initial mobile load; do not overwrite the user's open/closed choice on render.
  if(matchMedia('(max-width:1100px)').matches)document.getElementById('advancedSettings').open=false;
  IDS.forEach(id=>{const el=document.getElementById(id);el.addEventListener('input',()=>{saveSettings();render();});el.addEventListener('change',()=>{
    // A redundant render on blur removes the map button during pointerdown,
    // swallowing the first click after typing a search. Render only if clamped.
    const before=IDS.map(key=>{const input=document.getElementById(key);return input.type==='checkbox'?input.checked:input.value;});
    applySettings(readInputs());saveSettings();
    const changed=IDS.some((key,index)=>{const input=document.getElementById(key);return before[index] !== (input.type==='checkbox'?input.checked:input.value);});
    if(changed)render();
  });});
  document.getElementById('resetSettings').addEventListener('click',()=>{
    applySettings(DEFAULT_SETTINGS);sortKey='finalPerKill';sortDir=-1;monsterSortKey='finalPerKill';monsterSortDir=-1;
    const url=new URL(location.href);const hash=new URLSearchParams(url.hash.slice(1));hash.delete('settings');url.hash=hash.toString();
    history.replaceState(null,'',url.href);document.getElementById('shareStatus').textContent='';document.getElementById('shareLink').hidden=true;
    saveSettings();render();
  });
  setInterval(refreshEventState,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshEventState();});
  document.getElementById('mapSortControls').innerHTML=planningSortControls();
  bindPlanningSort(false,render);
  document.querySelector('#mapTable thead tr').innerHTML=planningHeaders();
  document.querySelectorAll('th[data-sort]').forEach(th=>th.addEventListener('click',()=>{
    const key=th.dataset.sort;
    if(sortKey===key)sortDir*=-1;else{sortKey=key;sortDir=key==='name'?1:-1;}
    render();
  }));
  document.getElementById('closeMapModal').addEventListener('click',closeModal);
  document.querySelector('[data-close-modal]').addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{
    if(!document.getElementById('mapModal').classList.contains('open'))return;
    if(e.key==='Escape')closeModal();
    if(e.key==='Tab'){
      const nodes=[...document.querySelectorAll('#mapModal button, #mapModal select, #mapModal a, #mapModal summary, #mapModal [tabindex="0"]')].filter(el=>el.getClientRects().length);
      const first=nodes[0],last=nodes[nodes.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  render();
}
init();
