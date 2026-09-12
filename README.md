# RO General Map EXP Tool

เปิด `index.html` ได้โดยตรง หรือเสิร์ฟโฟลเดอร์นี้เป็น static site ไม่มีระบบรหัสผ่านและไม่มีขั้นตอน build ที่จำเป็นต่อการเปิดใช้งาน

## Spotlight / No event

- ค่าเริ่มต้น **Auto** เลือก Spotlight ที่อยู่ในช่วงกิจกรรมตามเวลาไทย; หากไม่มีรอบที่ตรงช่วงจะใช้ **No event** และเรียงตัวเลือก Spotlight ใหม่สุดก่อน
- ขอบเขต Auto เป็นประมาณการตามวันที่ประกาศ: วันเริ่ม 00:00 ถึงวันสิ้นสุด 06:00 (เวลาไทย) เพราะวันเปิดหลัง maintenance ไม่มีเวลาตายตัว; เลือกกิจกรรมเองได้ในวันปิดปรับปรุง ตรวจใหม่ทุกนาทีและเมื่อกลับมาที่หน้าเว็บ
- เลือก Spotlight ได้ 10 รอบที่ไม่ซ้ำกัน: ปี 2025 มี Return, Halloween, Unicorn และปี 2026 ต่อจากนั้นอีก 7 รอบถึง August จากประกาศที่ตรวจถึง 12 กันยายน 2026
- ใช้ Event EXP ตามตัวเลขประกาศกับมอนที่ชื่อและแมพตรงกัน แล้วคำนวณ level penalty รายมอนก่อนถ่วงน้ำหนักตามจำนวน
- มอนที่ไม่อยู่ในรายการ รวมถึง Furious / Ringleader ใช้ฐานปกติ ไม่เหมารวมตัวคูณทั้งแมพ
- June เพิ่มจำนวน Varmundt 7 แมพ x2 ทำให้ density และ area score เปลี่ยน แต่ไม่คูณ EXP ต่อ kill ซ้ำ
- Normal EXP เก็บแยกจาก Event EXP และไม่มีการแก้ค่าฐานเมื่อสลับกิจกรรม

ข้อมูลกิจกรรม: `assets/data/spotlight-2026.json` / `spotlight-2026.js` มี URL ประกาศรายกิจกรรมและภาพตารางอ้างอิงใน `assets/spotlight/`

ปี 2025 ใช้ `assets/data/spotlight-2025.json` / `spotlight-2025.js` ถอดครบ 133 แถวจาก 3 รอบ รวม Lv, Base / Job EXP ปกติและระหว่างกิจกรรม Unicorn ซ้ำช่วงปี 2026 จึงใช้ id เดียวและไม่ลงทะเบียนซ้ำ Return และ Halloween ใช้ตัวเลข Event EXP x5/x6 ตามประกาศ ไม่คูณจากฐาน No event ปัจจุบัน ในกรณีฐานต่างกันรายละเอียดรายมอนมีป้ายกำกับ

รูปต้นฉบับ 2025 ทั้ง 6 รูปและ SHA-256 เก็บใน workspace หลัก `reference/assets/spotlight/2025/` ส่วนเว็บไซต์ใช้ภาพตาราง 3 รูป อ่านขอบเขตการค้นครบปีได้จาก `reference/mechanics/Monster_Spotlight_2025_Index.md` สร้างข้อมูลปี 2025 ซ้ำด้วย `python tools/prepare_spotlight_2025.py` จาก workspace หลัก

## การตั้งค่าและ EXP ตามเผ่า

- บันทึกค่าช่องกรอก ตัวเลือกกิจกรรม การค้นหา และตัวกรอง Min Lv ใน localStorage ของ origin นี้ (`ro-general-map-exp-tool-settings-v1`) โดยไม่ส่งออกจากเบราว์เซอร์ โหมด Auto บันทึกเป็น Auto จึงเลือกกิจกรรมใหม่ตามวันเมื่อเปิดหน้าอีกครั้ง
- ค่าเริ่มต้นทุกบัฟ, Server EXP, Gear EXP และโบนัสทั้ง 10 เผ่าเป็น 0% มีปุ่มคืนค่าเริ่มต้น และยังใช้เครื่องมือได้เมื่อเบราว์เซอร์ปิดกั้น storage
- โบนัสเผ่าบวกกับ Gear EXP ในวงเล็บ I ของสูตรเดิม: `I(monster) = 1 + (Gear% + RichMan% + Race%)/100` คำนวณ Final EXP รายมอนก่อนถ่วงตามจำนวน เช่น Gear 164% และ Plant 9% ให้กรอกแยกกัน ไม่รวม 9% ซ้ำใน Gear
- ตารางรายละเอียดแสดงเผ่าและโบนัสที่ใช้กับมอนแต่ละตัว ตัวคูณใน summary เป็นค่าก่อนโบนัสเผ่า
- ข้อมูลเผ่าครบ 352 แถวของมอนใน 70 แมพ ใช้ข้อมูล reference เดิมและ EP20 ทางการก่อน แล้วเสริมจาก [rAthena monster database](https://github.com/rathena/rathena/blob/master/db/re/mob_db.yml) และ Divine Pride มีแหล่งอ้างอิงรายรายการใน `assets/data/monster-races.json` (Human ใน Divine Pride แปลงเป็น Demi-Human)
- การรวมโบนัสเผ่ากับโบนัสทุกเผ่าอ้างอิงพฤติกรรม `pc_calcexp` ใน [rAthena pc.cpp](https://github.com/rathena/rathena/blob/master/src/map/pc.cpp) และคงสูตร H / I / Manual เดิมของเครื่องมือนี้ ไม่ใช้เป็นการยืนยันสูตรเซิร์ฟเวอร์ไทยทุกบัฟ

## Daily Dungeon ย้อนหลัง

Daily Dungeon 6th Anniversary 2026 ทั้ง 6 แมพเป็นกิจกรรมที่จบแล้ว เก็บ EXP / HP / จำนวนมอนและรูปเดิมไว้ พร้อมระบุรุ่นใน `archivedEvent` ค่าเริ่มต้นซ่อนออกจากตารางและอันดับ Best ทั้ง No event และ Spotlight

เลือก “เทียบข้อมูลเก่าร่วมกับแมพอื่น” เพื่อรวมในตารางและจัดอันดับ หรือ “ดูเฉพาะข้อมูลเก่า / วางแผนซ้อม” เพื่อจำลองรอบเดิมด้วยเลเวล ปาร์ตี้ และบัฟที่ตั้งอยู่ มีป้ายย้อนหลังในแถว รายละเอียด และอันดับ Best ที่มาจากดันเก่า ตัวกรอง Min Lv และการค้นหายังมีผล ตัวเลือกนี้จำใน localStorage และคืนเป็นซ่อนเมื่อกดคืนค่าเริ่มต้น

เมื่อมี Daily Dungeon รอบใหม่ ให้เพิ่มข้อมูลเป็นอีกรุ่นพร้อม code ของตัวเอง ไม่เขียนทับฐาน 2026 และกำหนด `archivedEvent` เฉพาะรุ่นที่จบแล้ว เพื่อเทียบเก่ากับใหม่ได้

## EP20 — ฐาน No event

เพิ่ม `jor_back4`, `jor_back5`, `jor_back6`, `jor_root1`, `jor_root2`, `jor_root3`, `jor_maze`, `jor_twice`, `jor_twig` จาก [RO Thailand: Episode 20 Map & Monster](https://ro.gnjoy.in.th/episode-20-the-immortal-map-monster/)

เก็บชื่อ, Lv, HP, EXP, Job EXP และจำนวนจากตารางทางการ รวม 42 แถวของมอนปกติใน 9 แมพ ค่าเฉลี่ยถ่วงน้ำหนักด้วยจำนวนมอน ไม่รวม Snowstorm Angel และ Sanctuary Cleaning Chief ตามรูปแบบเดิมที่แยกบอสออกจากการคำนวณเส้นทาง

รูปมอนมาจากประกาศทางการ ภาพเดิมใน `assets/maps/` ใช้ประกอบการดูแมพ การคำนวณพื้นที่ใช้ข้อมูล GAT แยกต่างหาก รวม `jor_twig` ที่มีช่องเดิน 10,320 ช่องแล้ว

ข้อมูลนำเข้าอยู่ใน `assets/data/ep20.json` และรายการ URL รูปอยู่ใน `ep20-downloads.json`

## ข้อแตกต่างระหว่างประกาศ

- Unicorn ไม่ระบุ Map ในภาพ จึงเทียบชื่อมอนทั่วทั้ง dataset; รอบอื่นจับคู่ตามแมพในประกาศ
- August ลงฐาน `mjo_wst01` สูงกว่า June/July 2 เท่า ใช้ Event EXP ของรอบที่เลือกโดยตรงและแสดงป้าย “ฐานต่าง” ในรายละเอียด
- Diligent Andre ใน Unicorn/June ลงฐาน 96,141 ต่างจากฐาน No event เดิม 80,476; ไม่เขียนทับฐานเดิม
- Flame ลง Lavaeter ที่ `amicitia1` ในภาพ ขณะที่ dataset เดิมมีมอนตัวนี้ใน `amicitia2`; ยึด Map ที่ประกาศและไม่เพิ่มโบนัสให้ `amicitia2` โดยเดาแก้แผนที่เอง
- ชื่อ Charge Basilisk / Combat Basilisk, Chaos / Chaotic และชื่อ Varmundt ใช้ mapping เฉพาะที่ตรวจสอบแล้ว มอนสีต่างกันใน Abyss แยกด้วย HP/EXP เดิม
- ค่า Min Lv ของ EP20 ใช้ 200 ตามหน้า Map & Monster และแสดงข้อกำหนดเควสใน modal; เควสหลัก EP20 เริ่ม Lv 215

## ตรวจสอบ

```sh
node --test tests/calculator.test.cjs
python -m unittest discover -s tests -p "test_map_geometry.py"
python -m http.server 8765 --bind 127.0.0.1
```

การสร้างข้อมูลใหม่จาก workspace หลัก:

1. บันทึก HTML ประกาศ EP20 แล้วเรียก `scripts/import_ep20.py path/to/ro-ep20.html`
2. ดาวน์โหลดรูปตาม `assets/data/ep20-downloads.json`
3. เรียก `tools/prepare_spotlight_tool.py` จาก workspace หลัก เพื่ออ่านคลัง Spotlight และสร้างไฟล์ข้อมูล EXP; geometry สร้างแยกด้วยวิธีด้านล่าง

ภาพและข้อมูลต้นทางเป็นของ Gravity / Gravity Game Tech และผู้จัดทำแหล่งข้อมูล ใช้เป็นเอกสารอ้างอิงในเครื่องมือ


## พื้นที่เดินได้จาก GAT (ตรวจ 12 กันยายน 2026)

เว็บใช้ `assets/data/map-geometry.js` เป็นแหล่งพื้นที่เพียงแหล่งเดียว: 64 แมพปกติรวม EP20 ครบ 9 แมพ ใช้ชนิดช่องเดินใน GAT ของ Divine Pride แทน threshold ความสว่าง ค่า `walkablePx` เดิมใน MAPS / EP20 เป็นข้อมูล legacy ที่สูตรไม่อ่านอีกแล้ว เปลี่ยนรูปหรือสร้าง EXP ใหม่จึงไม่ทำให้พื้นที่กลับไปใช้ threshold

- ตรวจ magic, version 1.2/1.3, ขนาด, byte length และชนิด cell; ถ้าไม่รองรับจะไม่มี area score
- นับ type 0, 2, 3, 4, 6; ไม่รวม 1, 5 ตาม `map_gat2cell` ใน [rAthena map.cpp](https://github.com/rathena/rathena/blob/master/src/map/map.cpp) ล้าง high bit 31 ตาม [Divine Pride GAT parser](https://www.divine-pride.net/js/mapviewer/gat-parser.js)
- ตัด x = width − 1 และ y = height − 1 ตาม `map_getcell` ของ rAthena; metadata บันทึกจำนวนที่ตัด ไม่ตัดขอบอื่นโดยเดา
- GAT เรียงจากล่างขึ้นบน จึงกลับแกน Y ให้ตรง raw PNG ตรวจขนาดภาพให้เท่าจำนวนช่องก่อนสร้าง overlay
- นับทุก connected component แบบ 4 ทิศ ไม่ลบห้องแยกซึ่งอาจเข้าผ่านวาร์ป และไม่ใช้ morphology ที่อาจตัดทางแคบหรือเชื่อมห้องผิด
- Modal เปิดด้วยภาพเดิมเป็นค่าเริ่มต้น สลับพื้นที่สีเขียวทับช่องที่นับ แผนผัง raw และ mask ขาวดำได้ มีจำนวนช่อง สัดส่วน จำนวนกลุ่มพื้นที่ วันที่ตรวจ และแหล่งอ้างอิง
- Density = จำนวนมอน / ช่องเดิน × 10,000; Final area score = Final EXP / kill × Density แมพที่ไม่มี GAT แสดง − อยู่ท้ายการเรียงพื้นที่ทั้งสองทิศ และไม่เข้า Best area
- Daily Dungeon เก่า 6 แมพยังเปรียบเทียบ EXP / kill ได้ แต่ไม่ใช้พื้นที่จากภาพ Biosphere ที่ยืมมา

ข้อมูลนี้ยืนยันการอ่าน **ไฟล์ GAT อ้างอิง** ไม่ใช่การยืนยันแผนที่สดของเซิร์ฟเวอร์ไทย พื้นที่เดินไม่เท่ากับพื้นที่เกิดมอนทุกช่อง คะแนนยังไม่รวม respawn, ผู้เล่นอื่น, เวลาเดิน, วาร์ป และความเร็วฆ่า จึงไม่ใช่ EXP ต่อชั่วโมง

ไฟล์ `assets/data/map-geometry.json` เก็บ URL, SHA-256 ของ response/GAT/raw/mask และสถิติรายแมพ ภาพ raw/mask/overlay ทั้งหมดอยู่ใน `assets/maps/geometry/` พร้อมใช้ offline ไม่มีการเรียก Divine Pride ขณะคำนวณ

สร้างซ้ำจาก cache โดยดาวน์โหลดข้อมูล public viewer ของแต่ละ code (เฉพาะแมพปกติ) เป็น `CODE.gat` จาก `https://www.divine-pride.net/Tools/MapViewerAsset?mapname=CODE&ext=gat`, `CODE.raw` จาก `https://www.divine-pride.net/img/map/raw/CODE` และ `asset-crypto.js` จาก `https://www.divine-pride.net/js/mapviewer/asset-crypto.js` แล้วรันจากโฟลเดอร์เว็บ:

```sh
python scripts/build_map_geometry.py --cache /path/to/cache --checked-on 2026-09-12
```

ตัวอย่างที่แก้แล้ว: oz_dun01 = 14,184 ช่อง, oz_dun02 = 27,045 ช่อง, bl_death = 34,688 ช่อง, jor_twig = 10,320 ช่อง ความนิ่งเมื่อเปลี่ยน threshold ของรูปเดิมไม่ใช่หลักฐานว่าจำแนกพื้นที่ถูกต้อง


## ตารางวางแผนแบบย่อ

ตารางแมพและมอนสเตอร์ใช้ 6 คอลัมน์ร่วมกัน: ชื่อ, Final EXP / ตัว, HP / ตัว, EXP / 1M HP, จำนวนมอน, คะแนนพื้นที่ เรียงได้ทั้งสองตาราง เลเวลเข้าแมพ/เลเวลมอน เผ่า โบนัสเผ่า ผลจาก level penalty และความหนาแน่นแสดงเป็นข้อความรองในช่องที่เกี่ยวข้อง ตัวเลขยาวใช้ K/M/B และเปิดดูค่าละเอียดได้จากชื่อแมพหรือชื่อมอน

EXP / 1M HP = Final EXP / ตัว ÷ HP × 1,000,000 โดยแมพใช้ HP เฉลี่ยถ่วงตามจำนวนจากชุดข้อมูล จึงเป็นตัวเปรียบเทียบ EXP ต่อเลือด ไม่ใช่การทำนายเวลาเก็บเลเวล คะแนนพื้นที่รายชนิด = Final EXP ของชนิดนั้น × จำนวนชนิดนั้น / ช่องเดิน × 10,000 รวมทุกชนิดได้คะแนนพื้นที่ของแมพ

ขั้นตอน Normal/Event EXP, ผลตามเลเวล, แชร์ปาร์ตี้ และบัฟ อยู่ในส่วนเปิดดูเพิ่มเติม ภาพ GAT และข้อมูลพื้นที่อยู่เหนือรายการมอนซึ่งใช้ความกว้างเต็ม บนมือถือข้อมูลแต่ละแถวเป็นบล็อก 2 ช่องพร้อมตัวเลือกเรียง แสดงครบโดยไม่ต้องเลื่อนแนวนอน

Final EXP / ตัว แสดงจำนวนเต็มรูปแบบโดยไม่ย่อ K/M/B และทศนิยมสูงสุด 2 ตำแหน่งก่อนการปัดเศษในเกม ตารางแมพเป็นค่าเฉลี่ยถ่วงน้ำหนัก การเทียบในเกมควรดูแถวของมอนชนิดนั้น ค่าเริ่มต้น Party Size และการคืนค่าเริ่มต้นเป็น 1 คน; ค่าปาร์ตี้ที่เคยบันทึกเองยังโหลดตามเดิม
