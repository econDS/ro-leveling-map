# Spotlight audit — Triple EXP & Double Monster 21 ต.ค. 2026 (ตรวจ 22 ต.ค. 2026)

ประกาศ: [Triple EXP & Double Monster Event (21 October 2026)](https://ro.gnjoy.in.th/triple-exp-double-monster-21102026/) · ช่วง 21/10/2026–18/11/2026 (ก่อนปิดปรับปรุง) · [ภาพตารางต้นฉบับ 918×3796](https://img.gnjoy.in.th/2026/10/744a41d7c1.jpg) เก็บที่ [assets/spotlight/2026-10-21_triple_exp.jpg](../assets/spotlight/2026-10-21_triple_exp.jpg)

ถอดตัวเลขจากภาพครบ 84 แถว (ชื่อ, Lv, แมพ, Base/Job ปกติ, Event Base/Job) เก็บเป็นข้อมูลต้นฉบับแยกจากการจับคู่ในเว็บ ตรวจทุกแถวแล้ว Event Base และ Event Job = ค่าปกติ ×3 พอดี (54 แถว, Lv17–189) หรือ ×2 พอดี (30 แถว, Lv202–265) จำนวนเกิดช่วงกิจกรรม 30 แถวใน 5 แมพมาจากตาราง HTML ในหน้าประกาศ

## ผลจับคู่

| รายการ | จำนวน |
|---|---:|
| แถวในภาพ | 84 |
| กฎในเว็บ (รวมแถวที่ค่าเหมือนกันทุกช่อง) | 80 |
| แถวที่ Normal EXP ตรงฐาน No event ของเว็บตามชื่อและแมพที่พิมพ์ (ก่อนนำเข้าแมพ) | 59 |
| แถวที่แมพยังไม่มีในเว็บ / ชื่อไม่ตรง / EXP ต่าง (ก่อนแก้) | 16 / 3 / 6 |
| แถวที่ตรงฐานหลังนำเข้าแมพและจับคู่ชื่อตามด้านล่าง | 80 |
| แถวที่ Normal EXP ต่างจากฐาน (ra_pol01) | 4 |
| จำนวนเกิดที่จับคู่ได้ | 30 / 30 |

รัน `node scripts/audit_spotlight.cjs`: 142 แมพ, 617 กฎ, 59 แถวจำนวนเกิด, ไม่มีแมพขาดและไม่มีข้อยกเว้น coverage

รัน `node scripts/audit_spotlight_base.cjs`: singleMismatch 0, ค่าที่แก้ตาม GGT ยังเป็น 20 ตัวเดิม, GGT ต่างรอบยังเป็น 10 ตัวเดิม; ambiguous เพิ่ม 8 รายการจาก Venatu/Dimik หลายสายพันธุ์ชื่อเดียวกัน ซึ่งเลือกกฎตาม Normal EXP ถูกต้องทุกตัว ไม่มีการเปลี่ยนฐาน No event จากกิจกรรมนี้

## การตัดสินใจ

### gl_cas01_ Flame Ghost / Ice Ghost — ภาพพิมพ์ชื่อสลับ (ผู้ใช้ตัดสิน 22 ต.ค. 2026)

| แหล่ง | Flame Ghost | Ice Ghost |
|---|---:|---:|
| ภาพ GGT รอบนี้ | 172,737 / 120,916 | 172,163 / 120,514 |
| [GGT Unicorn 2025](https://ro.gnjoy.in.th/monster-spotlight-year-of-unicorn-edition-3-dec-2025/) | 172,163 / 120,514 | ไม่อยู่ในตาราง |
| [Divine Pride thRO 20380](https://www.divine-pride.net/database/monster/20380) / [20379](https://www.divine-pride.net/database/monster/20379) | 172,163 / 120,514 | 172,737 / 120,916 |
| Divine Pride iRO (region iRO) | 172,163 / 120,514 | 172,737 / 120,916 |

ถือเป็นการพิมพ์ผิดของ GGT รอบนี้: กฎใช้ `name` ตามมอนที่ EXP ตรงกัน และเก็บชื่อในภาพไว้ใน `sourceName` จึงไม่เปลี่ยนฐาน Ice Ghost เป็น 172,163

### ra_pol01 — Normal EXP ในภาพเป็น 2 เท่า, Event EXP ยืนยันในเกม

ภาพพิมพ์ Normal เป็น 2 เท่าของฐานทั้ง Base และ Job เหมือนประกาศ [23 ก.ย. 2026](https://ro.gnjoy.in.th/triple-exp-double-monster-event-23-sep-2026/) ขณะที่ GGT มิ.ย./ก.ค., [หน้าแมพ GGT](https://ro.gnjoy.in.th/new-map-update-power-twisted-plains/) และ Divine Pride thRO/iRO ยังเป็นค่าต่ำ

| มอน | ฐาน No event (DP / GGT มิ.ย.–ก.ค.) | Normal ในภาพ | Event ในภาพ |
|---|---:|---:|---:|
| [Deadsera](https://www.divine-pride.net/database/monster/21947) | 995,893 / 836,550 | 1,991,786 / 1,673,100 | 3,983,572 / 3,346,200 |
| [Hardrock Titan](https://www.divine-pride.net/database/monster/21948) | 1,023,843 / 855,728 | 2,047,686 / 1,711,456 | 4,095,372 / 3,422,912 |
| [Deadween](https://www.divine-pride.net/database/monster/21949) | 1,054,194 / 885,523 | 2,108,388 / 1,771,046 | 4,216,776 / 3,542,092 |
| [Burning Night](https://www.divine-pride.net/database/monster/21946) | 1,065,428 / 890,485 | 2,130,856 / 1,780,970 | 4,261,712 / 3,561,940 |

ทดสอบในเกม 22 ต.ค. 2026 (ผู้ใช้): ล่า Deadsera 1 ตัว, Player Lv259, Server EXP 300% (Basic 100% + Chaos 200%), EXP gear 10%, Premium Service EXP, ได้ Base EXP 14,723,280

`3,983,572 × 1.05 (Lv +3) = 4,182,750 → × 3.2 (1 + 2.00 + 0.20) = 13,384,800 → × 1.10 = 14,723,280` ตรงพอดี ถ้า Event เป็น 1,991,786 จะได้ราว 7.36M จึงใช้ Event EXP ตามภาพ (×4 จากฐาน No event) ส่วน No event คงค่าต่ำตามเดิม เพราะการทดสอบช่วงกิจกรรมแยกไม่ได้ว่าฐานถาวรเป็น 995,893 แล้วกิจกรรมคูณ 4 หรือฐานเป็น 1,991,786 แล้วคูณ 2 (Job EXP ในการทดสอบเป็น 0 จึงยืนยัน Job ไม่ได้)

### ชื่อในภาพต่างจากข้อมูลแมพ (EXP ตรงกัน)

| แมพ | ชื่อในภาพ (`sourceName`) | ชื่อที่ใช้จับคู่ (`name`) | Normal EXP |
|---|---|---|---:|
| gef_fild06 | Earth Petite | Petite | 1,086 |
| gef_fild08 | Sky Petite | Petite | 854 |
| sp_rudus3 | Dolor | Mutant Dolor | 67,500 |
| gl_cas01_ | Warped Sting | Contaminated Sting | 164,136 |

Teddy Bear ใน ein_d02_i จับคู่กับ Teddybear ได้โดยตรง

### แมพใหม่ 6 แมพจาก Divine Pride thRO

นำเข้าด้วยตัวอ่านของ `scripts/import_spotlight_maps.py` เฉพาะแมพใหม่ ไม่แก้แมพเดิม และสร้าง geometry ด้วย `scripts/build_map_geometry.py --only`: `ama_dun03`, `beach_dun3`, `gef_fild08`, `lhz_dun03`, `um_fild03` (16 แถว EXP) และ `tha_t09` (จำนวนเกิด 5 แถว) Normal Base/Job ของ Divine Pride ตรงกับ GGT ทั้ง 16 แถว

### แถวซ้ำ

Venatu 2,202 (juperos_01) และ Dimik 2,560 (jupe_core) พิมพ์ 3 แถวค่าเหมือนกันทุกช่องสำหรับมอนคนละ ID; เว็บรวมเป็นกฎเดียวที่มี `sourceRowCount: 3` เพื่อให้จับคู่ได้ทุกตัว แถวทั้ง 84 แถวยังอยู่ในข้อมูลต้นฉบับ

## ข้อแตกต่างที่ยังเปิดอยู่

- ra_pol01: ฐาน No event ถาวรยังไม่ยืนยัน ควรล่าซ้ำหลังกิจกรรมจบ (หลัง 18 พ.ย. 2026) ด้วยเงื่อนไขเดียวกัน; ถ้าได้ 7,361,640 แปลว่าฐานเป็น 1,991,786
- ein_d02_i: GGT รอบนี้และ Summer 2026 ตรงกับเว็บ (เช่น Blue Teddy Bear 18,300 / 21,235) แต่ Divine Pride thRO/iRO ให้ค่าสูงกว่าเท่ากันทุกตัว Base +37,000 และ Job +26,000 (เช่น [55,300 / 47,235](https://www.divine-pride.net/database/monster/20259)); คงค่า GGT
- ein_d02_i: ภาพพิมพ์ Green Teddy Bear Lv161 แต่ Divine Pride และเว็บเป็น Lv162
- Venatu ได้ EXP กิจกรรมเฉพาะ juperos_01 และ Dimik เฉพาะ jupe_core ตามแมพที่พิมพ์ แม้ทั้งสองชนิดเกิดทั้งสองแมพ
- lhz_dun03: Divine Pride ระบุ 6 บอส Lv160 (Type Boss, จำนวน 1, EXP 0) ซึ่งกฎนำเข้าเดิมตัดเฉพาะ MVP จึงอยู่ในค่าเฉลี่ยถ่วง (~1.9% ของจำนวนเกิด)
- iRO จาก RagnaPlace เปิดไม่ได้ (Cloudflare bot check) จึงใช้ Divine Pride มุม iRO แทน

## แหล่งอ้างอิงเพิ่มเติม

- ข้อมูลถอดจากภาพ, การตัดสินใจ และ SHA-256 ของรูปเก็บในคลังโปรเจกต์หลัก `reference/assets/spotlight/2026/2026-10-21_triple_exp_double_monster/`
- Divine Pride thRO: หน้าแมพ `https://www.divine-pride.net/database/map/<code>` และแถว EXP 100% ของมอนแต่ละตัว (cookie `dp_region=thROG`)
