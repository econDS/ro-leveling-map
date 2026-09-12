// Access facts confirmed by the user on 2026-09-12; this is not EXP verification.
const PLANNING_CONTEXT = {
  checkedOn: '2026-09-12',
  ticketNote: '[Not For Sale] World Moving Ticket แจกผ่านกิจกรรมและหน้าเว็บเป็นระยะ ผู้เล่นประจำอาจมีสะสม ผู้เล่นใหม่ซื้อ World Moving Ticket แบบปกติจาก Cash Shop ได้',
  maps: {
    oz_dun01: {englishName:'Oz Labyrinth 1F',access:{method:'ticket',label:'World Moving Ticket',note:'ใช้ตั๋วเดินทางเข้าแมพ ตามเส้นทางที่ผู้เล่นใช้'}},
    oz_dun02: {englishName:'Oz Labyrinth 2F',access:{method:'ticket-walk',label:'ตั๋ว / ทางเชื่อม',note:'เข้าโซน Oz ด้วยตั๋ว แล้วใช้ทางเชื่อมจาก oz_dun01 ไป oz_dun02; ปลายทางตรงให้ตรวจในเมนูตั๋ว'}},
    jor_back1: {englishName:'Frozen Scales Hill',access:{method:'warp',label:'Warp Portal',min:1,note:'พื้นที่ภายนอกโซน EP19 memo ได้ ต้องมีผู้เปิด Warp Portal ที่บันทึกจุดไว้ — ผู้เล่นยืนยัน 12 ก.ย. 2026'}},
    jor_back2: {englishName:'Frozen Scale Plains',access:{method:'warp',label:'Warp Portal',min:1,note:'พื้นที่ภายนอกโซน EP19 memo ได้ ต้องมีผู้เปิด Warp Portal ที่บันทึกจุดไว้ — ผู้เล่นยืนยัน 12 ก.ย. 2026'}},
    jor_back3: {englishName:'Frozen Scale Glacier',access:{method:'warp',label:'Warp Portal',min:1,note:'พื้นที่ภายนอกโซน EP19 memo ได้ ต้องมีผู้เปิด Warp Portal ที่บันทึกจุดไว้ — ผู้เล่นยืนยัน 12 ก.ย. 2026'}},
    jor_dun01: {englishName:'Warmth of the Snake God 1F',access:{method:'warp-walk',label:'วาร์ป + ทางเชื่อม',note:'Warp Portal ไป jor_back3 แล้วเข้าวาร์ปด้านบนเพื่อไป jor_dun01 ตามบันทึกซ้อม; เตรียมบัฟป้องกันก่อนเข้า'}},
    ba_pw03: {englishName:'Magic Power Plant 2',access:{method:'warp-walk',label:'วาร์ป + เดิน',note:'ใช้เส้นทางลัดจากแมพข้างเคียงแล้วเดินเข้า ต้องเตรียมการป้องกันระหว่างเดินทาง; ไม่ใช่การยืนยันว่า memo ภายในดันได้'}},
    jor_ab01: {englishName:'Abandoned Pit 1F',access:{method:'quest',label:'เควส EP19',note:'ต้องผ่านเควส Episode ที่เกี่ยวข้องและ EP19 side quest ตามบันทึกทีม ถึงเลเวลแล้วไม่ได้แปลว่าปลดล็อกเควสครบ'}},
    jor_ab02: {englishName:'Abandoned Pit 2F',access:{method:'quest',label:'เควส EP19',note:'ต้องผ่านเควส Episode ที่เกี่ยวข้องและ EP19 side quest ตามบันทึกทีม ถึงเลเวลแล้วไม่ได้แปลว่าปลดล็อกเควสครบ'}},
    mag_dun02: {englishName:'Magma Dungeon 2F',aliases:['Magma','Nogg Road','แมกม่า']},
    mag_dun03: {englishName:'Magma Dungeon 3F',aliases:['Magma','Nogg Road','แมกม่า']},
    clock_01: {englishName:'Clock Tower Unknown Basement',aliases:['นากา','นาฬิกา']}
  }
};
function planningContext(map) { return PLANNING_CONTEXT.maps[map.code] || {}; }
function minimumEntryLevel(map) { return planningContext(map).access?.min ?? map.min; }
function matchesMapSearch(map, query) {
  const context=planningContext(map);
  const text=[map.name,map.code,map.aliases,context.englishName,context.aliases].flat().filter(Boolean).join(' ').normalize('NFKC').toLowerCase();
  return query.trim().normalize('NFKC').toLowerCase().split(/\s+/).every(word=>text.includes(word));
}
