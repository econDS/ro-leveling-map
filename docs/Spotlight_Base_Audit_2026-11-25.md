# Spotlight audit — Triple EXP & Double Monster 25 พ.ย. 2026 (ตรวจ 25 พ.ย. 2026)

ประกาศ: [Triple EXP & Double Monster Event (25 November 2026)](https://ro.gnjoy.in.th/triple-exp-double-monster-event-25-november-2026/) · 25/11/2026–16/12/2026 (ก่อนปิดปรับปรุง) · [ภาพต้นฉบับ 918×2623](https://img.gnjoy.in.th/2026/11/03-45-50,%2024-11-26,%204530%204550%202%20Tuepm26.png) เก็บที่ [assets/spotlight/2026-11-25_triple_exp.png](../assets/spotlight/2026-11-25_triple_exp.png)

ถอดจากภาพ 53 แถว: Event Base/Job = Normal ×3 (39 แถว, Lv23–211) หรือ ×2 (14 แถว, Lv243–265) ตรงทุกแถว ข้อมูลต้นฉบับอยู่ใน `reference/assets/spotlight/2026/2026-11-25_triple_exp_double_monster/source_rows.json` ของคลังโปรเจกต์หลัก

## ผลเทียบ

| รายการ | แถว |
|---|---:|
| ชื่อ, Lv, แมพ และ Base EXP ตรงฐานเว็บก่อนนำเข้า | 37 |
| แมพยังไม่มีในเว็บ (6 แมพ นำเข้าแล้ว) | 12 |
| Normal ต่างจากฐาน (`ra_pol01`) | 4 |

Divine Pride thRO และ iRO (cookie `dp_region`): Base/Job ตรง 47 แถว ต่าง 6 แถวตามด้านล่าง GGT รอบก่อน Normal Base ต่างเฉพาะ `ra_pol01` (มิ.ย./ก.ค.) และ Shining Seaweed

`audit_spotlight.cjs`: 149 แมพ, 670 กฎ, ไม่มีแมพขาด · `audit_spotlight_base.cjs`: singleMismatch 1 (Shining Seaweed ตามที่ตั้งใจ), override 20 และ GGT ต่างรอบ 10 เท่าเดิม

## การตัดสินใจ (ผู้ใช้อนุมัติทั้ง 5 ข้อ 25 พ.ย. 2026)

### 1. jor_tail Shining Seaweed

| แหล่ง | Lv | Normal Base / Job | Event Base / Job |
|---|---:|---:|---:|
| ภาพรอบนี้ | 211 | 293,285 / 198,205 | 879,855 / 594,615 |
| [GGT 23 ก.ย. 2026](https://ro.gnjoy.in.th/triple-exp-double-monster-event-23-sep-2026/) (`jor_back1`) | – | 282,625 / – | 847,875 / – |
| [Divine Pride thRO/iRO](https://www.divine-pride.net/database/monster/21524) | 210 | 282,625 / 198,038 | – |
| Ice Straw ใน [GGT Unicorn](https://ro.gnjoy.in.th/monster-spotlight-year-of-unicorn-edition-3-dec-2025/) | 211 | 293,285 / 198,205 | 879,855 / 594,615 |

Lv และค่าทั้งแถวตรงกับ Ice Straw แต่ `jor_tail` ใน Divine Pride มีเพียง Ice Gangu และ Shining Seaweed ใช้ Event ตามภาพ คงฐาน 282,625 ด้วย `keepBase: true` ในกฎ (กฎที่มี flag นี้ไม่ถูกนำไปตั้งฐาน No event)

### 2. ra_pol01

Normal ในภาพเป็น 2 เท่าของฐานเหมือนรอบ ก.ย./ต.ค. ใช้ Event ตามภาพ คงฐานเดิม

| มอน | ฐาน / Divine Pride / GGT มิ.ย.–ก.ค. | Normal ในภาพ | Event ในภาพ |
|---|---:|---:|---:|
| [Deadsera](https://www.divine-pride.net/database/monster/21947) | 995,893 | 1,991,786 | 3,983,572 |
| [Hardrock Titan](https://www.divine-pride.net/database/monster/21948) | 1,023,843 | 2,047,686 | 4,095,372 |
| [Deadween](https://www.divine-pride.net/database/monster/21949) | 1,054,194 | 2,108,388 | 4,216,776 |
| [Burning Night](https://www.divine-pride.net/database/monster/21946) | 1,065,428 | 2,130,856 | 4,261,712 |

### 3. ba_lost Purple Pitaya Job EXP

เก็บ 332 (Event 996) ตามภาพและ [GGT ส.ค. 2025](https://ro.gnjoy.in.th/monster-spotlight-return-2025/); [Divine Pride thRO/iRO](https://www.divine-pride.net/database/monster/20652) เป็น 33,276 เว็บคำนวณ Base EXP จึงไม่กระทบ

### 4. แมพใหม่

`spl_fild01`, `abbey01`, `bif_fild01`, `bif_fild02`, `ba_lib`, `jor_tail` จาก Divine Pride thRO (31 แถวมอน) พร้อมรูปและ geometry จาก GAT ชื่อ South/North of Bifrost และ Frozen Tail มาจากมุม iRO; `ba_lib` แสดงเป็นเกาหลีทั้งสองมุม จึงแปลเป็น Hall of Memories เงื่อนไขเข้าแมพยังไม่ตรวจ

### 5. Double Monster

`jor_ab01`, `jor_ab02`, `clock_01`, `jor_back3`: ประกาศมีหัวข้อ x2 และภาพในเกม ไม่มีจำนวนรายมอน จึงคูณ 2 ทุกมอนปกติผ่าน `amountMaps`

## ข้อแตกต่างที่ยังเปิดอยู่

- Shining Seaweed: Event และฐานใน `jor_tail` ยังไม่ยืนยันในเกม
- `ra_pol01`: ฐาน No event ถาวรยังไม่ยืนยัน ควรล่าซ้ำเมื่อไม่มีกิจกรรม
- Purple Pitaya: Job EXP 332 เทียบ 33,276
- จำนวนเกิดจริงรายมอนช่วงกิจกรรมใน 4 แมพ x2 และชื่อ GGT ของ `ba_lib`
