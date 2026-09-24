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
function numericValue(value) { return Number(String(value ?? '').replace(/,/g,'')) || 0; }
function formatDamageInput(input) {
  const digits=String(input.value ?? '').replace(/[^0-9]/g,'');
  input.value=digits ? Number(digits).toLocaleString('en-US') : '';
}
function get(id) { const el=document.getElementById(id); return el.type==='checkbox' ? el.checked : numericValue(el.value); }
function config() {
  const party = Math.max(1, Math.min(12, get('partySize')));
  const h = 1 + (get('serverBonus')+get('kafraBonus')+get('malangdoBonus')+get('premiumBonus')+get('staffBonus')+get('customBonus'))/100;
  const i = 1 + (get('gearBonus')+get('richManBonus'))/100;
  return {level:Math.max(1,Math.min(260,get('playerLevel'))), party, damage:Math.max(1,Math.min(1e12,get('playerDamage')||DEFAULT_SETTINGS.playerDamage)),
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
const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function thaiDate(iso) {
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
  return m ? `${Number(m[3])} ${THAI_MONTHS[Number(m[2])-1]} ${m[1]}` : String(iso||'');
}
// Level multipliers are whole percentages except the 1.15-style steps; hide float noise.
const yieldFmt = v => pct(v,Math.abs(v-Math.round(v))<0.05?0:1);
const thaiRange = (start,end) => `${thaiDate(start)} – ${thaiDate(end)}`;
function planningLabels(monster=false) {
  return {
    name:monster?'มอน':'แมพ',
    finalPerKill:'EXP ที่ได้ / ตัว',
    hp:'HP / ตัว',
    expPerMillionHp:'EXP ต่อ HP 1 ล้าน',
    shownAmount:monster?'จำนวนมอน':'จำนวนมอนทั้งแมพ',
    finalAreaScore:'คะแนนพื้นที่'
  };
}
// Short labels for the stacked mobile cards; full labels stay in headers and tooltips.
const MOBILE_LABELS = {finalPerKill:'EXP / ตัว',hp:'HP / ตัว',expPerMillionHp:'EXP / HP 1M',shownAmount:'จำนวนมอน',finalAreaScore:'คะแนนพื้นที่'};
function headerHelp(key,monster) {
  return {
    name:monster?'กดชื่อมอนเพื่อดูขั้นตอนคำนวณ':'กดชื่อแมพเพื่อดูรายมอน ภาพแมพ และวิธีเข้า',
    finalPerKill:'EXP หลังรวมกิจกรรม ตัวคูณเลเวล ส่วนแบ่งปาร์ตี้ และบัฟ'+(monster?'':' · ค่าเฉลี่ยถ่วงตามจำนวนมอนในแมพ'),
    hp:'HP ของมอน'+(monster?'':'เฉลี่ยทั้งแมพ')+' · ใต้ตัวเลขคือจำนวนครั้งที่ต้องตีจากดาเมจที่กรอก',
    expPerMillionHp:'EXP ที่ได้ ÷ HP × 1,000,000 · ใช้เทียบความคุ้มต่อเลือดที่ต้องตี ไม่ใช่ความเร็วฆ่าจริง',
    shownAmount:monster?'จำนวนมอนชนิดนี้ช่วงกิจกรรม และสัดส่วนในแมพ':'จำนวนมอนทั้งแมพช่วงกิจกรรม · ใต้ตัวเลขคือจำนวนมอนต่อ 10,000 ช่องเดิน',
    finalAreaScore:monster?'ส่วนของมอนชนิดนี้ในคะแนนพื้นที่ของแมพ':'EXP ที่ได้ / ตัว × ความหนาแน่นมอน · ใช้จัดอันดับความคุ้มของพื้นที่ ไม่ใช่ EXP ต่อชั่วโมง'
  }[key];
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
  return Object.entries(planningLabels(monster)).map(([key,label])=>
    `<th scope="col" data-${monster?'monster-sort':'sort'}="${key}" aria-sort="none" title="${escapeHtml(headerHelp(key,monster))}"><button type="button" class="sort-button"><span class="sort-heading-main">${label}<span class="sort-arrow" aria-hidden="true"></span></span></button></th>`
  ).join('');
}
// Relative bar against the best value in the current list, for quick visual scanning.
const bar = (value,max) => max>0 && value>0 ? `<span class="bar" aria-hidden="true"><i style="--w:${Math.max(2,Math.min(100,value/max*100)).toFixed(1)}%"></i></span>` : '';
function listScale(rows) {
  return {exp:Math.max(0,...rows.map(r=>r.finalPerKill||0)),area:Math.max(0,...rows.filter(r=>r.hasWalk).map(r=>r.finalAreaScore||0))};
}
const mapImageSrc = map => `assets/maps/${escapeHtml(map.mapImage||map.code)}.png`;
const mapThumb = (map,cls='map-thumb') => `<img class="${cls}" src="${mapImageSrc(map)}" alt="" loading="lazy" onerror="this.remove()">`;
function spriteStrip(map,limit=4) {
  const seen=new Set();
  const monsters=[...(map.monsters||[])].filter(m=>m.image&&m.amount>0).sort((a,b)=>b.amount-a.amount).filter(m=>!seen.has(m.image)&&seen.add(m.image));
  if(!monsters.length)return '';
  const more=monsters.length-limit;
  return `<div class="sprites">${monsters.slice(0,limit).map(m=>`<img src="${escapeHtml(m.image)}" alt="" title="${escapeHtml(m.name)} · Lv ${m.level} · ${fmt(m.amount)} ตัว" loading="lazy">`).join('')}${more>0?`<span class="more">+${more}</span>`:''}</div>`;
}
function planningCells(r,identity,monster=false,scale=null) {
  const hits=monster?`ตี ${fmt(r.hitsPerKill)} ครั้ง`:`ตี ~${fmt(r.hitsPerKill,1)} ครั้ง/ตัว`;
  return `<td class="identity-cell">${identity}</td>
    <td data-label="${MOBILE_LABELS.finalPerKill}" class="final-col"><span title="${monster?'EXP ของมอนชนิดนี้':'EXP เฉลี่ยถ่วงตามจำนวนมอนในแมพ'} ก่อนปัดเศษ">${fullExp(r.finalPerKill)}</span>${scale?bar(r.finalPerKill,scale.exp):''}<span class="cell-note ${r.yieldPct<100?'yield-low':''}" title="ตัวคูณจากความต่างเลเวลของมอนกับผู้เล่น">ตัวคูณเลเวล ${yieldFmt(r.yieldPct)}</span></td>
    <td data-label="${MOBILE_LABELS.hp}">${numberCell(r.hp)}<span class="cell-note${r.damageWarning?' hits-bad':''}">${hits}</span></td>
    <td data-label="${MOBILE_LABELS.expPerMillionHp}">${numberCell(r.expPerMillionHp)}</td>
    <td data-label="${MOBILE_LABELS.shownAmount}">${fmt(r.shownAmount)}<span class="cell-note">${monster?pct(r.sharePct)+' ของแมพ':r.hasWalk?fmt(r.monsterDensity,1)+' / 10k ช่อง':'ไม่มีข้อมูลพื้นที่'}</span></td>
    <td data-label="${MOBILE_LABELS.finalAreaScore}" class="density-col">${r.hasWalk?numberCell(r.finalAreaScore):'−'}${r.hasWalk&&scale?bar(r.finalAreaScore,scale.area):''}${r.hasWalk?'':'<span class="cell-note">ไม่มี GAT</span>'}</td>`;
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
  if (!monsters.length) return '<tr><td colspan="6">ไม่มีรายละเอียดมอนในแมพนี้</td></tr>';
  const rows=monsters.map((m,index)=>{
    const rule=spotlightRule(map,m,c.event), eventExp=monsterEventExp(map,m,c.event);
    const y=levelYield(c.level,m.level), afterPenalty=eventExp*y, afterParty=afterPenalty*c.partyShare;
    const finalPerKill=afterParty*monsterFactor(map,m,c), shownAmount=monsterEventAmount(map,m,c.event);
    const hitsPerKill=hitsToKill(m.hp,c.damage);
    return {...m,index,rule,eventExp,afterPenalty,afterParty,finalPerKill,shownAmount,hitsPerKill,damageWarning:hitsPerKill>HIT_WARNING_THRESHOLD,yieldPct:y*100,
      expPerMillionHp:m.hp>0?finalPerKill/m.hp*1e6:0,hasWalk:map.hasWalk,
      sharePct:total?shownAmount/total*100:0,
      finalAreaScore:map.hasWalk?finalPerKill*shownAmount/map.walkableCells*10000:0};
  }).sort((a,b)=>(typeof a[monsterSortKey]==='string'?a[monsterSortKey].localeCompare(b[monsterSortKey]):a[monsterSortKey]-b[monsterSortKey])*monsterSortDir);
  const scale=listScale(rows);
  return rows.map(m=>{
    const alt=escapeHtml(m.name), race=monsterRace(map,m)||'ไม่ทราบ', sourceChanged=m.rule&&m.rule.normalExp!==m.baseExp;
    const sourceChangedLabel=(m.baseExpSource?.startsWith('GGT Spotlight')||map.source?.startsWith('GGT Spotlight'))?'ฐาน GGT ต่างรอบ':'ฐานประกาศต่าง';
    const image=m.image?`<img class="mob-img" src="${escapeHtml(m.image)}" alt="" loading="lazy">`:'';
    const identity=`<div class="monster-identity">${image}<div><button type="button" class="map-btn monster-detail-btn" data-monster-detail="${m.index}" aria-expanded="false" aria-controls="monster-calculation-${m.index}">${alt}</button><span class="cell-note">Lv ${m.level} · ${escapeHtml(race)}${raceBonus(map,m,c)?' · EXP เผ่า +'+pct(raceBonus(map,m,c),0):''}</span>${m.rule?'<span class="tag spotlight-tag">★ '+escapeHtml(c.event?.label||'Spotlight')+' ×'+fmt(m.rule.eventExp/m.rule.normalExp)+'</span>':''}${monsterSpawnBadge(m)}${m.damageWarning?'<span class="tag bad">⚠ ตีเกิน 5 ครั้ง</span>':''}${sourceChanged?'<span class="tag warn">'+sourceChangedLabel+'</span>':''}</div></div>`;
    const details=calculationGrid([['EXP ปกติ',fmt(m.baseExp)],['แหล่งข้อมูล EXP ปกติ',m.baseExpSource||map.source||'ไม่ระบุ'],['EXP กิจกรรมที่ใช้',fmt(m.eventExp)],['EXP ปกติในประกาศ',m.rule?fmt(m.rule.normalExp):'−'],['หลังปรับตามเลเวล',expFmt(m.afterPenalty)],['หลังแบ่งปาร์ตี้',expFmt(m.afterParty)],['ตัวคูณบัฟรวมเผ่า',fmt(monsterFactor(map,m,c),4)+'×'],['EXP ที่ได้ / ตัว',expFmt(m.finalPerKill)],['HP / ตัว',fmt(m.hp)],['ดาเมจต่อครั้ง',fmt(c.damage)],['ตีจนมอนตาย',fmt(m.hitsPerKill)+' ครั้ง'],['EXP ต่อ HP 1 ล้าน',expFmt(m.expPerMillionHp)],['จำนวนปกติ → ช่วงกิจกรรม',fmt(m.amount)+' → '+fmt(m.shownAmount)],['มอน / 10,000 ช่อง',map.hasWalk?fmt(m.shownAmount/map.walkableCells*10000,1):'−'],['คะแนนพื้นที่ของมอนชนิดนี้',map.hasWalk?fmt(m.finalAreaScore,1):'−']]);
    const baseSourceLink=m.baseExpSourceUrl?'<p class="field-help"><a href="'+escapeHtml(m.baseExpSourceUrl)+'" target="_blank" rel="noopener">ประกาศ GGT ที่ยืนยัน EXP ปกติ</a></p>':'';
    return `<tr class="monster-planning-row${m.damageWarning?' damage-warning':''}">${planningCells(m,identity,true,scale)}</tr><tr id="monster-calculation-${m.index}" class="calculation-row" hidden><td colspan="6"><strong>${alt} · รายละเอียดการคำนวณ</strong>${details}${baseSourceLink}</td></tr>`;
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
  return `<div class="geometry-views" role="group" aria-label="มุมมองแมพ">${views.map(([key,label,src])=>`<button type="button" data-geometry-view="${key}" data-image="${escapeHtml(src)}" aria-pressed="${key==='original'}">${label}</button>`).join('')}</div>
    <div class="map-preview"><img id="geometryImage" src="${original}" alt="${escapeHtml(selected.code)} ภาพเดิมสำหรับดูตำแหน่ง"></div>
    <p id="geometryCaption" class="geometry-caption" aria-live="polite">ภาพเดิมสำหรับดูตำแหน่ง · ไม่ใช้วัดพื้นที่</p>
    <div class="geometry-stats"><div>ช่องเดิน<strong>${fmt(g.walkableCells)}</strong></div><div>สัดส่วนของทั้งแมพ<strong>${pct(selected.walkablePct)}</strong></div></div>
    <details class="geometry-source"><summary>วิธีนับและแหล่งข้อมูล · GAT</summary><p>นับชนิดช่องเดินจากข้อมูล GAT โดยตรง ไม่ใช้ความสว่างของภาพ · ขนาด ${g.width} × ${g.height} ช่อง</p><p>พื้นที่เชื่อมต่อ ${fmt(g.components)} กลุ่ม · กลุ่มใหญ่สุด ${pct(g.largestComponentCells/g.walkableCells*100)} ของช่องเดิน<br>เก็บทุกกลุ่มไว้ เพราะห้องแยกอาจเข้าผ่านวาร์ปได้ ไม่ตัดทางแคบหรือเติมช่องว่าง · ไม่นับช่องขอบนอกสุดด้าน X/Y ตามกติกาอ้างอิง ${fmt(g.excludedBoundaryCells)} ช่อง</p><p>ข้อมูลอ้างอิง Divine Pride ตรวจ ${g.checkedOn} · ยังไม่ยืนยันกับเซิร์ฟเวอร์ไทยหรือขอบเขตเกิดมอนจริง จึงเป็นคะแนนความหนาแน่นเฉลี่ยทั้งแมพ ไม่ใช่ EXP ต่อชั่วโมง</p><a href="${escapeHtml(g.sourceUrl)}" target="_blank" rel="noopener">แหล่งแผนที่ / GAT</a> · <a href="${escapeHtml(g.maskImage)}" target="_blank" rel="noopener">เปิดภาพช่องเดิน</a></details>`;
}
function bindGeometryViews() {
  const captions={overlay:'สีเขียว = ช่องเดินที่นับจาก GAT',raw:'ภาพแมพต้นฉบับ · สีภาพไม่ถูกใช้ตัดสินว่าช่องเดินได้',mask:'ขาว = ช่องเดินที่นับ · ดำ = ช่องที่ไม่นับ · 1 พิกเซล = 1 ช่อง GAT',original:'ภาพเดิมสำหรับดูตำแหน่ง · ไม่ใช้วัดพื้นที่'};
  document.querySelectorAll('[data-geometry-view]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-geometry-view]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    const caption=captions[button.dataset.geometryView], image=document.getElementById('geometryImage');
    image.src=button.dataset.image;image.alt=selectedCode+' '+caption;
    document.getElementById('geometryCaption').textContent=caption;
  }));
}
// Detail modal state: the tab persists while stepping between maps.
let detailTab='overview', currentRows=[], currentConfig=null;
const DETAIL_TABS=[['overview','ภาพรวม'],['monsters','มอน'],['access','วิธีเข้า'],['calc','วิธีคำนวณ']];
function detailTabsHtml(counts) {
  return `<div class="detail-tabs" role="tablist" aria-label="ส่วนรายละเอียดแมพ">${DETAIL_TABS.map(([key,label])=>`<button type="button" role="tab" id="detail-tab-${key}" data-detail-tab="${key}" aria-controls="detail-panel-${key}" aria-selected="${key===detailTab}" tabindex="${key===detailTab?0:-1}">${label}${counts[key]?` <span class="tab-count">${counts[key]}</span>`:''}</button>`).join('')}</div>`;
}
const detailPanel = (key,html) => `<section class="detail-panel" role="tabpanel" id="detail-panel-${key}" aria-labelledby="detail-tab-${key}" tabindex="-1"${key===detailTab?'':' hidden'}>${html}</section>`;
function selectDetailTab(key,focus=false) {
  detailTab=key;
  document.querySelectorAll('[data-detail-tab]').forEach(tab=>{
    const on=tab.dataset.detailTab===key;
    tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;
    if(on&&focus)tab.focus();
  });
  document.querySelectorAll('.detail-panel').forEach(panel=>panel.hidden=panel.id!=='detail-panel-'+key);
  document.getElementById('mapModalBody').scrollTop=0;
}
function bindDetailTabs() {
  const tabs=[...document.querySelectorAll('[data-detail-tab]')];
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectDetailTab(tab.dataset.detailTab));
    tab.addEventListener('keydown',e=>{
      const target={ArrowRight:index+1,ArrowLeft:index-1,Home:0,End:tabs.length-1}[e.key];
      if(target===undefined)return;
      e.preventDefault();e.stopPropagation();
      selectDetailTab(tabs[(target+tabs.length)%tabs.length].dataset.detailTab,true);
    });
  });
  document.querySelectorAll('[data-goto-tab]').forEach(button=>button.addEventListener('click',()=>selectDetailTab(button.dataset.gotoTab,true)));
}
function updateModalNav(code) {
  const index=currentRows.findIndex(r=>r.code===code), nav=document.getElementById('modalNav');
  nav.hidden=index<0;
  if(index<0)return;
  document.getElementById('mapPosition').textContent=`อันดับ ${index+1} / ${currentRows.length}`;
  document.getElementById('prevMap').disabled=index===0;
  document.getElementById('nextMap').disabled=index===currentRows.length-1;
}
function stepMap(delta) {
  if(document.getElementById('mapModal').dataset.mode!=='detail')return;
  const index=currentRows.findIndex(r=>r.code===selectedCode), next=currentRows[index+delta];
  if(index<0||!next)return;
  selectedCode=next.code;
  renderDetail(currentRows,currentConfig);
}
function renderDetail(rows,c) {
  const modal=document.getElementById('mapModal');
  const selected=rows.find(r=>r.code===selectedCode)||row(MAPS.find(m=>m.code===selectedCode)||rows[0]||MAPS[0],c);
  selectedCode=selected.code;
  const body=document.getElementById('mapModalBody');
  const preserve=modal.classList.contains('open') && modal.dataset.mode==='detail' && body.dataset.code===selected.code;
  const state=preserve?{scroll:body.scrollTop,details:[...body.querySelectorAll('details')].map(el=>el.open),expanded:[...body.querySelectorAll('[data-monster-detail][aria-expanded="true"]')].map(el=>el.dataset.monsterDetail),view:body.querySelector('[data-geometry-view][aria-pressed="true"]')?.dataset.geometryView}:null;
  modal.dataset.mode='detail';
  body.dataset.code=selected.code;
  const image=geometryPreview(selected);
  document.getElementById('mapModalTitle').innerHTML=`${mapThumb(selected,'modal-thumb')}<h2>${escapeHtml(selected.name)}</h2><span class="tag">${selected.code}</span>${selected.group==='ep20'?'<span class="tag">EP20</span>':''}${selected.archivedEvent?'<span class="tag warn">ย้อนหลัง 2026 · จบแล้ว</span>':''}`;
  const overviewNotes=[selected.archivedEvent?`${selected.archivedEvent} · กิจกรรมจบแล้ว ผลนี้จำลองด้วย EXP / HP / จำนวนมอนรอบเดิม และเลเวล / ปาร์ตี้ / บัฟที่ตั้งอยู่ เพื่อเปรียบเทียบหรือวางแผนซ้อมหากเปิดใหม่`:null,selected.dataNote,selected.excludedBosses?.length?`ค่าเฉลี่ยไม่รวมบอส: ${selected.excludedBosses.join(', ')}`:''].filter(Boolean);
  const mapCalc=calculationGrid([['เลเวลขั้นต่ำเข้าแมพ',selected.entryRequirementVerified===false?'ยังไม่ตรวจ':selected.min>1?fmt(selected.min):'ไม่มี'],['เลเวลมอน (เฉลี่ยทั้งแมพ)',fmt(selected.level,1)],['EXP ปกติ (เฉลี่ยทั้งแมพ)',expFmt(selected.baseExp)],['EXP กิจกรรม (เฉลี่ยทั้งแมพ)',expFmt(selected.eventBaseExp)],['หลังปรับตามเลเวล (เฉลี่ยทั้งแมพ)',expFmt(selected.baseAfterPenalty)],['หลังแบ่งปาร์ตี้ (เฉลี่ยทั้งแมพ)',expFmt(selected.baseAfterParty)],['EXP ที่ได้ / ตัว (เฉลี่ยทั้งแมพ)',expFmt(selected.finalPerKill)],['HP / ตัว (เฉลี่ยทั้งแมพ)',fmt(selected.hp,1)],['ดาเมจต่อครั้ง',fmt(c.damage)],['ตีเฉลี่ย / ตัว (ถ่วงตามจำนวนมอน)',fmt(selected.hitsPerKill,1)+' ครั้ง'],['มอนที่ต้องตีเกิน 5 ครั้ง',fmt(selected.damageWarningCount)+' ชนิด'],['สัดส่วนจำนวนมอนที่ต้องตีเกิน 5 ครั้ง',pct(selected.damageWarningRatio*100,1)],['EXP ต่อ HP 1 ล้าน (เฉลี่ยทั้งแมพ)',expFmt(selected.expPerMillionHp)],['จำนวนมอนปกติ → ช่วงกิจกรรม',fmt(selected.amount)+' → '+fmt(selected.shownAmount)],['มอน / 10,000 ช่อง',selected.hasWalk?fmt(selected.monsterDensity,1):'−'],['คะแนนพื้นที่',selected.hasWalk?fmt(selected.finalAreaScore,1):'−']]);
  const context=planningContext(selected),access=context.access;
  const ggtBaseCount=selected.ggtBaseCount||0;
  const sourceNote=ggtBaseCount?'EXP ปกติจาก GGT '+fmt(ggtBaseCount)+'/'+fmt(selected.monsters?.length||0)+' ตัว'+(ggtBaseCount<(selected.monsters?.length||0)?' · ที่เหลือใช้ '+(selected.source||'ข้อมูลอ้างอิงเดิม'):'')+' · ประกาศต่างรอบอาจลงฐานไม่เท่ากัน':selected.source==='Main'?'เอกสารหลักของโครงการ · ตรวจได้ต่างกันในแต่ละมอน ไม่ใช่การยืนยันในเกมครบทั้งแมพ':selected.source?.startsWith('RO Thailand EP20')?'ประกาศ RO Thailand EP20 สำหรับข้อมูลมอนปกติ':'ข้อมูลฐานอ้างอิง '+(selected.source||'ไม่ระบุ')+' · ควรเทียบ EXP ในเกมก่อนใช้ตัดสินใจ';
  const info=[access?`วิธีเข้า: ${access.label} · ${access.note}`:'เลเวลขั้นต่ำเป็นตัวกรองเบื้องต้น ยังต้องตรวจเควสและวิธีเข้าของแมพนี้',selected.accessNote,access?.method.startsWith('ticket')?PLANNING_CONTEXT.ticketNote:null,selected.accessSourceUrl?'เงื่อนไขเข้าอ้างอิง: '+selected.accessSourceUrl:null,`แหล่ง EXP ปกติ: ${sourceNote}`,c.event?'EXP กิจกรรมและจำนวนมอนใช้ตามประกาศรอบที่เลือก แยกจาก EXP ปกติ':null].filter(Boolean);
  const monsterCount=selected.monsters?.length||0;
  const eventLine=c.event?`${escapeHtml(c.event.name)} · ${selected.affectedMonsters?`ได้ EXP กิจกรรม ${selected.affectedMonsters} จาก ${monsterCount} ชนิด`:'ไม่มีมอนในรายการกิจกรรม'}`:'ไม่มีกิจกรรม · ใช้ EXP ปกติ';
  const overview=`<div class="detail planning-detail"><div>${image}</div><div><div class="detail-meta">${[['EXP ที่ได้ / ตัว (เฉลี่ยทั้งแมพ)',fullExp(selected.finalPerKill)],['ตีเฉลี่ย / ตัว',fmt(selected.hitsPerKill,1)+' ครั้ง'],['จำนวนมอนทั้งแมพ',fmt(selected.shownAmount)],['คะแนนพื้นที่',selected.hasWalk?compact(selected.finalAreaScore):'−']].map(([k,v])=>`<div class="mini"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div><p class="hint">${eventLine}${selected.spawnChangedMonsters?' · จำนวนมอน '+fmt(selected.amount)+' → '+fmt(selected.shownAmount):''}<br>ตัวเลขด้านบนเป็นค่าเฉลี่ยทั้งแมพ · ถ้าจะเทียบกับ EXP ในเกม ให้ดูแถวของมอนชนิดนั้นในแท็บ มอน</p>${overviewNotes.map(n=>`<p class="hint">${escapeHtml(n)}</p>`).join('')}${monsterCount?`<div class="overview-monsters">${spriteStrip(selected,8)}<button type="button" class="text-btn" data-goto-tab="monsters">ดูมอนทั้ง ${fmt(monsterCount)} ชนิด →</button></div>`:''}</div></div>`;
  const monsters=`<div class="table-caption"><strong>มอนในแมพ</strong><span>กดหัวคอลัมน์เพื่อเรียง · กดชื่อมอนเพื่อดูขั้นตอนคำนวณ</span></div>${planningSortControls(true)}<div class="table-wrap planning-wrap"><table class="monster-table planning-table"><thead><tr>${planningHeaders(true)}</tr></thead><tbody>${monsterRows(selected,c)}</tbody></table></div><p class="field-help">คะแนนพื้นที่รายมอนรวมกันเป็นคะแนนพื้นที่ของแมพ · ชี้หัวคอลัมน์เพื่อดูคำอธิบาย</p>`;
  const accessHtml=`<ul class="access-list">${info.map(note=>`<li>${escapeHtml(note)}</li>`).join('')}</ul>${selected.sourceUrl?`<p class="field-help"><a href="${escapeHtml(selected.sourceUrl)}" target="_blank" rel="noopener">${selected.source?.startsWith('GGT Spotlight')?'แหล่งข้อมูล EXP ปกติ (GGT)':'แหล่งข้อมูลแมพและมอน'} ↗</a></p>`:''}`;
  const calc=`<p class="field-help">ค่าเฉลี่ยทั้งแมพ ถ่วงตามจำนวนมอน · ขั้นตอนรายมอนดูได้ในแท็บ มอน (กดชื่อมอน)</p>${mapCalc}`;
  body.innerHTML=detailTabsHtml({monsters:monsterCount})+detailPanel('overview',overview)+detailPanel('monsters',monsters)+detailPanel('access',accessHtml)+detailPanel('calc',calc);
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
  bindDetailTabs();
  updateModalNav(selected.code);
  if(state){
    body.querySelectorAll('details').forEach((el,index)=>el.open=state.details[index]||false);
    state.expanded.forEach(index=>body.querySelector(`[data-monster-detail="${index}"]`)?.click());
    if(state.view)body.querySelector(`[data-geometry-view="${state.view}"]`)?.click();
    body.scrollTop=state.scroll;
  } else body.scrollTop=0;
}

// Compare up to three maps side by side; the selection survives filtering.
const compareSet=new Set(), COMPARE_MAX=3;
function updateCompareUI() {
  const tray=document.getElementById('compareTray');
  tray.hidden=!compareSet.size;
  document.body.classList.toggle('has-compare',compareSet.size>0);
  document.getElementById('compareCount').textContent=`เลือกแล้ว ${compareSet.size} / ${COMPARE_MAX}`;
  document.getElementById('compareThumbs').innerHTML=[...compareSet].map(code=>{
    const map=MAPS.find(m=>m.code===code);
    return map?`<span class="compare-chip" title="${escapeHtml(map.name)}">${mapThumb(map,'compare-chip-thumb')}<span>${escapeHtml(map.name)}</span></span>`:'';
  }).join('');
  const open=document.getElementById('openCompare');
  open.disabled=compareSet.size<2;
  open.textContent=compareSet.size<2?'เลือกอีกอย่างน้อย 1 แมพ':`เทียบ ${compareSet.size} แมพ`;
  document.querySelectorAll('[data-compare]').forEach(box=>{
    box.checked=compareSet.has(box.dataset.compare);
    box.disabled=!box.checked&&compareSet.size>=COMPARE_MAX;
  });
}
function renderCompare(c) {
  const modal=document.getElementById('mapModal'), body=document.getElementById('mapModalBody');
  const maps=[...compareSet].map(code=>MAPS.find(m=>m.code===code)).filter(Boolean).map(m=>row(m,c));
  if(maps.length<2){closeModal();return;}
  modal.dataset.mode='compare';body.dataset.code='';
  document.getElementById('modalNav').hidden=true;
  document.getElementById('mapModalTitle').innerHTML=`<h2>เทียบแมพ</h2><span class="tag">${maps.length} แมพ</span>`;
  const finite=v=>Number.isFinite(v);
  const metrics=[
    ['EXP ที่ได้ / ตัว',r=>r.finalPerKill,fullExp,1],
    ['ตัวคูณเลเวล',r=>r.yieldPct,yieldFmt,0],
    ['HP / ตัว',r=>r.hp,compact,-1],
    ['ตีเฉลี่ย / ตัว',r=>r.hitsPerKill,v=>fmt(v,1)+' ครั้ง',-1],
    ['มอนที่ต้องตีเกิน 5 ครั้ง',r=>r.damageWarningRatio*100,v=>pct(v,0),-1],
    ['EXP ต่อ HP 1 ล้าน',r=>r.expPerMillionHp,compact,1],
    ['จำนวนมอนทั้งแมพ',r=>r.shownAmount,v=>fmt(v),1],
    ['มอน / 10k ช่อง',r=>r.hasWalk?r.monsterDensity:NaN,v=>finite(v)?fmt(v,1):'−',1],
    ['คะแนนพื้นที่',r=>r.hasWalk?r.finalAreaScore:NaN,v=>finite(v)?compact(v):'−',1],
    ['มอนเฉลี่ย Lv',r=>r.level,v=>fmt(v,1),0]
  ];
  const metricRows=metrics.map(([label,value,format,direction])=>{
    const values=maps.map(value), usable=values.filter(finite);
    const best=direction&&usable.length>1&&new Set(usable).size>1?(direction>0?Math.max(...usable):Math.min(...usable)):null;
    return `<tr><th scope="row">${label}</th>${values.map(v=>`<td class="${best!==null&&v===best?'best':''}">${format(v)}${best!==null&&v===best?' <span class="best-mark" aria-label="ดีที่สุด">★</span>':''}</td>`).join('')}</tr>`;
  }).join('');
  const textRows=[
    ['กิจกรรม',r=>r.affectedMonsters?`★ EXP กิจกรรม ${r.affectedMonsters}/${r.monsters?.length||0} ชนิด`:'−'],
    ['วิธีเข้า',r=>planningContext(r).access?.label||(r.entryRequirementVerified===false?'ยังไม่ตรวจ':'−')],
    ['มอนในแมพ',r=>null]
  ].map(([label,value])=>`<tr><th scope="row">${label}</th>${maps.map(r=>`<td>${label==='มอนในแมพ'?spriteStrip(r,6):escapeHtml(value(r))}</td>`).join('')}</tr>`).join('');
  body.innerHTML=`<p class="field-help">★ = ดีที่สุดในกลุ่ม · ค่าเฉลี่ยทั้งแมพ ใช้เลเวล ปาร์ตี้ ดาเมจ บัฟ และกิจกรรมที่ตั้งอยู่</p><div class="table-wrap compare-wrap"><table class="compare-table"><thead><tr><th scope="col"><span class="visually-hidden">ค่า</span></th>${maps.map(r=>`<th scope="col"><div class="compare-head">${mapThumb(r,'compare-thumb')}<button type="button" class="map-btn" data-open-map="${r.code}">${escapeHtml(r.name)}</button><span class="cell-note">${escapeHtml(r.code)}</span><button type="button" class="text-btn" data-remove-compare="${r.code}">นำออก</button></div></th>`).join('')}</tr></thead><tbody>${metricRows}${textRows}</tbody></table></div>`;
  body.querySelectorAll('[data-open-map]').forEach(button=>button.addEventListener('click',()=>{selectedCode=button.dataset.openMap;renderDetail(currentRows,c);}));
  body.querySelectorAll('[data-remove-compare]').forEach(button=>button.addEventListener('click',()=>{compareSet.delete(button.dataset.removeCompare);updateCompareUI();renderCompare(c);}));
  body.scrollTop=0;
}

// Buff chips drive the original selects, which remain the stored settings.
const BUFF_SELECTS=['manualBonus','kafraBonus','malangdoBonus','premiumBonus','staffBonus','richManBonus'];
const BUFF_SHORT={manualBonus:{100:'+100% HE / Booster',200:'+200% BM200 / Advanced'},malangdoBonus:{20:'+20% Upgraded'}};
function buildBuffChips() {
  document.getElementById('buffChips').innerHTML=BUFF_SELECTS.map(id=>{
    const select=document.getElementById(id), label=document.querySelector(`label[for="${id}"]`);
    const icon=label.querySelector('img')?.getAttribute('src'), name=label.textContent.trim();
    const options=[...select.options].filter(o=>Number(o.value)>0);
    return `<div class="buff-item"><div class="buff-name">${icon?`<img src="${escapeHtml(icon)}" alt="">`:''}<span>${escapeHtml(name)}</span></div><div class="buff-options" role="group" aria-label="${escapeHtml(name)}">${options.map(o=>`<button type="button" class="buff-chip" data-buff="${id}" data-value="${o.value}" aria-pressed="false" title="${escapeHtml(o.text)}">${escapeHtml(BUFF_SHORT[id]?.[o.value]||o.text.match(/\+\d+%/)?.[0]||o.text)}</button>`).join('')}</div></div>`;
  }).join('');
  document.querySelectorAll('.buff-chip').forEach(chip=>chip.addEventListener('click',()=>{
    const select=document.getElementById(chip.dataset.buff);
    select.value=select.value===chip.dataset.value?'0':chip.dataset.value;
    select.dispatchEvent(new Event('input'));
  }));
  const setAll=pick=>{BUFF_SELECTS.forEach(id=>{const select=document.getElementById(id);select.value=pick(select);});saveSettings();render();};
  document.getElementById('buffPresetMax').addEventListener('click',()=>setAll(select=>[...select.options].at(-1).value));
  document.getElementById('buffPresetClear').addEventListener('click',()=>setAll(()=>'0'));
}
function syncBuffChips() {
  document.querySelectorAll('.buff-chip').forEach(chip=>chip.setAttribute('aria-pressed',String(document.getElementById(chip.dataset.buff).value===chip.dataset.value)));
}
function updateStickyBar(c) {
  document.getElementById('stickySummary').innerHTML=[`<b>Lv ${c.level}</b>`,`ปาร์ตี้ ${c.party}`,`ดาเมจ ${compact(c.damage)}`,`บัฟ ×${fmt(c.external,2)}`,c.event?`<span class="sticky-event">★ ${escapeHtml(c.event.label||c.event.name)}</span>`:'ไม่มีกิจกรรม'].map(item=>`<span>${item}</span>`).join('');
}
const QUICK_FILTERS={
  filterEvent:r=>r.affectedMonsters>0,
  filterSpawn:r=>r.shownAmount!==r.amount||r.spawnChangedMonsters>0,
  filterEp20:r=>r.group==='ep20',
  filterHits:r=>!r.damageWarning
};
function render() {
  lastEventState=currentEventState();
  const c=config();
  const serverBonus=get('serverBonus');
  document.getElementById('serverExpTotal').textContent=`Server EXP รวม: 100% + ${fmt(serverBonus)}% = ${fmt(100+serverBonus)}%`;
  const included=MAPS.filter(m=>includesArchivedMap(m,c.dailyDungeonMode));
  const baseRows=included.map(m=>row(m,c)).filter(r=>!r.locked&&matchesMapSearch(r,c.query));
  const activeFilters=Object.keys(QUICK_FILTERS).filter(id=>get(id));
  Object.entries(QUICK_FILTERS).forEach(([id,test])=>{document.getElementById(id+'Count').textContent=fmt(baseRows.filter(test).length);});
  const rows=baseRows.filter(r=>activeFilters.every(id=>QUICK_FILTERS[id](r))).sort((a,b)=>{
    if(sortKey==='finalAreaScore' && a.hasWalk!==b.hasWalk)return a.hasWalk?-1:1;
    const av=a[sortKey],bv=b[sortKey]; return (typeof av==='string'?av.localeCompare(String(bv)):av-bv)*sortDir;
  });
  currentRows=rows;currentConfig=c;
  const best=[...rows].sort((a,b)=>b.finalPerKill-a.finalPerKill)[0];
  const bestArea=[...rows].filter(r=>r.hasWalk).sort((a,b)=>b.finalAreaScore-a.finalAreaScore)[0];
  document.getElementById('archiveInfo').textContent=c.dailyDungeonMode==='hide'
    ? 'ตอนนี้ซ่อน 6 แมพย้อนหลังจากตารางและอันดับ'
    : 'กำลังแสดงข้อมูลรอบเก่า: เข้าอันดับ EXP / ตัว แต่ไม่มี GAT จึงไม่เข้าอันดับพื้นที่ · ใช้เลเวล ปาร์ตี้ บัฟ และตัวกรองที่ตั้งอยู่ (ต้อง Lv 200+)';
  const buffFormula=`Server/บัฟ ×${fmt(c.h,2)} × ของสวมใส่/ถุงทอง ×${fmt(c.i,2)} + Battle Manual ${fmt(c.manual,2)} · โบนัสเผ่าคิดแยกรายมอน`;
  const hero=best?`<div class="metric hero-metric" data-code="${best.code}" role="button" tabindex="0" aria-label="ดูรายละเอียด ${escapeHtml(best.name)}">${mapThumb(best,'hero-thumb')}<div class="hero-body"><div class="label">★ แมพ EXP / ตัว สูงสุด</div><div class="value">${escapeHtml(best.name)}</div><div class="hero-exp">${fullExp(best.finalPerKill)}<small>EXP / ตัว${best.archivedEvent?' · ย้อนหลัง 2026':''}</small></div>${spriteStrip(best,4)}</div></div>`:'<div class="metric"><div class="label">แมพ EXP / ตัว สูงสุด</div><div class="value">-</div></div>';
  document.getElementById('summary').innerHTML=hero+[['accent-area','คะแนนพื้นที่สูงสุด',bestArea?.name||'-',bestArea?compact(bestArea.finalAreaScore)+' คะแนน':'ไม่มีข้อมูลช่องเดิน',''],['accent-buff','EXP รวมจากบัฟ',`×${fmt(c.external,2)}`,c.external>1?'ไม่รวมโบนัสเผ่า':'ยังไม่ใส่บัฟ',buffFormula],['','แมพที่แสดง',fmt(rows.length),`จาก ${included.length} แมพ`,`คลังทั้งหมด ${MAPS.length} แมพ (รวมแมพที่ซ่อน)`]].map(([cls,l,v,sub,t])=>`<div class="metric ${cls}"${t?` title="${escapeHtml(t)}"`:''}><div class="label">${l}</div><div class="value">${escapeHtml(v)}</div><div class="sub">${escapeHtml(sub)}</div></div>`).join('');
  document.getElementById('eventInfo').innerHTML=c.event ? `<strong>${escapeHtml(c.event.name)}</strong><br>${thaiRange(c.event.start,c.event.end)}<br>${escapeHtml(c.event.notes)}<br><a href="${c.event.image}" target="_blank" rel="noopener">ดูตารางกิจกรรม</a> · <a href="${c.event.sourceUrl}" target="_blank" rel="noopener">ประกาศทางการ</a>` : 'ไม่มีกิจกรรม · ใช้ EXP และจำนวนมอนปกติ<br>Server EXP และบัฟด้านล่างตั้งแยกจากกิจกรรม';
  const conflicts=SPOTLIGHT_COVERAGE_EXCEPTIONS.filter(item=>item.eventId===c.event?.id);
  if(conflicts.length)document.getElementById('eventInfo').insertAdjacentHTML('beforeend','<details><summary>ข้อมูลประกาศที่ยังจับคู่ไม่ได้ ('+conflicts.length+')</summary>'+conflicts.map(item=>'<p class="field-help">'+escapeHtml(item.reason)+'</p>').join('')+'</details>');
  const auto=document.getElementById('spotlightEvent').value==='auto';
  const coverage=spotlightCoverage(SPOTLIGHT_EVENTS);
  document.getElementById('eventInfo').insertAdjacentHTML('afterbegin',`<span class="event-status">${auto?'อัตโนมัติ · '+(c.event?'อยู่ในช่วงกิจกรรม':'ไม่พบกิจกรรมในข้อมูลที่บันทึก'):'เลือกกิจกรรมเอง'}</span>`);
  document.getElementById('eventCoverage').innerHTML=`ข้อมูลกิจกรรมตรวจล่าสุด ${thaiDate('2026-09-24')} · รอบล่าสุดถึง ${thaiDate(coverage.lastEnd)}${coverage.expired?'<br><strong>กิจกรรมล่าสุดในคลังจบแล้ว ยังไม่ยืนยันรอบใหม่ — ใช้ EXP ปกติคำนวณ</strong>':''}`;
  if(auto)document.getElementById('eventInfo').insertAdjacentHTML('beforeend','<br><small>เวลาไทย: เริ่มนับวันแรก 12:00 ถึงวันสุดท้าย 06:00 · ถ้าเซิร์ฟเปิดเวลาอื่น ให้เลือกกิจกรรมเอง</small>');
  const buffs=IDS.filter(id=>id.endsWith('Bonus') && get(id)>0).length;
  const racialCount=RACES.filter(r=>get('race'+r)>0).length;
  document.getElementById('buffCount').textContent=buffs?`${buffs} รายการ`:'ยังไม่ใส่';
  document.getElementById('raceCount').textContent=racialCount?`${racialCount} เผ่า`:'ยังไม่ใส่';
  document.getElementById('buffReminder').hidden=buffs+racialCount>0;
  const autoOption=document.querySelector('#spotlightEvent option[value="auto"]');
  autoOption.textContent='อัตโนมัติ · '+(activeSpotlight(SPOTLIGHT_EVENTS)?.name||(coverage.expired?'ไม่มีกิจกรรม (รอข้อมูลใหม่)':'ไม่มีกิจกรรม'));
  document.getElementById('advancedStatus').textContent=(c.event?.name||'ไม่มีกิจกรรม')+' · '+(buffs?`บัฟ ${buffs} รายการ`:'ยังไม่ใส่บัฟ')+(racialCount?` · เผ่า ${racialCount}`:'');
  const scale=listScale(rows);
  document.querySelector('#mapTable tbody').innerHTML=rows.length ? rows.map((r,i)=>{
    const context=planningContext(r);
    const english=context.englishName&&context.englishName!==r.name?`<span class="cell-note">${escapeHtml(context.englishName)}</span>`:'';
    const entry=r.entryRequirementVerified===false?'เงื่อนไขเข้า: ยังไม่ตรวจ':r.min>1?`เข้าได้ Lv ${r.min}+`:'';
    const meta=[escapeHtml(r.code),entry,`มอนเฉลี่ย Lv ${fmt(r.level,1)}`].filter(Boolean).join(' · ');
    const warning=r.damageWarning?`<span class="tag bad" title="${fmt(r.damageWarningRatio*100,1)}% ของมอนที่เกิดต้องตีเกิน 5 ครั้งด้วยดาเมจที่กรอก">⚠ ตีเกิน 5 ครั้ง ${fmt(r.damageWarningRatio*100,0)}% ของมอน</span>`:'';
    const identity=`<div class="map-identity"><div class="rank-col"><span class="rank${i<3?' r'+(i+1):''}">${i+1}</span><label class="compare-toggle" title="เลือกเทียบ (สูงสุด ${COMPARE_MAX} แมพ)"><input type="checkbox" data-compare="${r.code}" aria-label="เลือก ${escapeHtml(r.name)} เพื่อเทียบ"><span aria-hidden="true">เทียบ</span></label></div>${mapThumb(r)}<div><button class="map-btn" type="button" data-code="${r.code}">${escapeHtml(r.name)}</button>${english}<span class="cell-note">${meta}</span>${context.access?`<span class="tag" title="${escapeHtml(context.access.note)}">${escapeHtml(context.access.label)}</span>`:''}${r.archivedEvent?'<span class="tag warn">ย้อนหลัง 2026</span>':''}${r.affectedMonsters?'<span class="tag spotlight-tag">★ '+escapeHtml(c.event?.label||'Spotlight')+'</span>':''}${mapSpawnBadge(r,c.event)}${warning}${spriteStrip(r)}</div></div>`;
    return `<tr class="map-row${r.damageWarning?' damage-warning':''}" data-code="${r.code}">${planningCells(r,identity,false,scale)}</tr>`;
  }).join('') : `<tr><td colspan="6" class="empty-row">ไม่พบแมพที่ตรงกับคำค้นหรือตัวกรอง${activeFilters.length?' · ลองเอาตัวกรองด่วนออก':''}</td></tr>`;
  updateSortLabels(document.getElementById('mapTable'),sortKey,sortDir,'data-sort');
  document.querySelectorAll('.map-row').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('.compare-toggle'))return;selectedCode=el.dataset.code;renderDetail(rows,c);openModal();}));
  document.querySelectorAll('[data-compare]').forEach(box=>box.addEventListener('change',()=>{
    if(box.checked&&compareSet.size<COMPARE_MAX)compareSet.add(box.dataset.compare);else compareSet.delete(box.dataset.compare);
    updateCompareUI();
  }));
  syncBuffChips();updateStickyBar(c);updateCompareUI();
  const heroCard=document.querySelector('.hero-metric');
  if(heroCard){
    const open=()=>{selectedCode=heroCard.dataset.code;renderDetail(rows,c);openModal();};
    heroCard.addEventListener('click',open);
    heroCard.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  }
  const modal=document.getElementById('mapModal');
  if(modal.classList.contains('open')){
    if(modal.dataset.mode==='compare')renderCompare(c);
    else if(rows.length||MAPS.some(m=>m.code===selectedCode))renderDetail(rows,c);
    else closeModal();
  }
}
function readInputs() {
  return cleanSettings(Object.fromEntries(IDS.map(id=>{const el=document.getElementById(id);return [id,el.type==='checkbox'?el.checked:id==='playerDamage'?(el.value===''?DEFAULT_SETTINGS.playerDamage:numericValue(el.value)):el.type==='number'||id.endsWith('Bonus')?numericValue(el.value):el.value];})),SPOTLIGHT_EVENTS);
}
function applySettings(settings) {
  const clean=cleanSettings(settings,SPOTLIGHT_EVENTS);
  IDS.forEach(id=>{const el=document.getElementById(id);if(el.type==='checkbox')el.checked=clean[id];else {el.value=clean[id];if(id==='playerDamage')formatDamageInput(el);}});
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
  sortedEvents(SPOTLIGHT_EVENTS).forEach(e=>select.add(new Option(`${e.name} (${thaiRange(e.start,e.end)})`,e.id)));
  restoreSettings();
  loadSharedSettings();
  window.addEventListener('hashchange',()=>{loadSharedSettings();render();});
  document.getElementById('shareSettings').addEventListener('click',copySettingsLink);
  buildBuffChips();
  const stickyBar=document.getElementById('stickyBar'), controls=document.querySelector('.controls');
  if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{
    const show=!entry.isIntersecting&&entry.boundingClientRect.top<0;
    stickyBar.classList.toggle('show',show);stickyBar.setAttribute('aria-hidden',String(!show));
    document.getElementById('stickyEdit').tabIndex=show?0:-1;
  }).observe(controls);
  document.getElementById('stickyEdit').addEventListener('click',()=>{
    controls.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>document.getElementById('playerLevel').focus({preventScroll:true}),400);
  });
  document.getElementById('prevMap').addEventListener('click',()=>stepMap(-1));
  document.getElementById('nextMap').addEventListener('click',()=>stepMap(1));
  let touch=null;
  const modalBody=document.getElementById('mapModalBody');
  modalBody.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
  modalBody.addEventListener('touchend',e=>{
    if(!touch)return;
    const dx=e.changedTouches[0].clientX-touch.x, dy=e.changedTouches[0].clientY-touch.y;touch=null;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*2&&!(e.target instanceof Element&&e.target.closest('.table-wrap,.formula-math-frame')))stepMap(dx<0?1:-1);
  });
  document.getElementById('openCompare').addEventListener('click',()=>{renderCompare(config());openModal();});
  document.getElementById('clearCompare').addEventListener('click',()=>{compareSet.clear();updateCompareUI();});
  // Collapse only on initial mobile load; do not overwrite the user's open/closed choice on render.
  if(matchMedia('(max-width:1100px)').matches)document.getElementById('advancedSettings').open=false;
  IDS.forEach(id=>{const el=document.getElementById(id);el.addEventListener('input',()=>{if(id==='playerDamage')formatDamageInput(el);saveSettings();render();});el.addEventListener('change',()=>{
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
    if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&!(e.target instanceof Element&&e.target.closest('input,select,textarea,[role="tab"]'))){e.preventDefault();stepMap(e.key==='ArrowRight'?1:-1);}
    if(e.key==='Tab'){
      const nodes=[...document.querySelectorAll('#mapModal button:not(:disabled), #mapModal select, #mapModal a, #mapModal summary, #mapModal [tabindex="0"]')].filter(el=>el.getClientRects().length);
      const first=nodes[0],last=nodes[nodes.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  render();
}
init();
