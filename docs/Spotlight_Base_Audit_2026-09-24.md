# Spotlight Base EXP audit — 24 September 2026

ตรวจค่า Normal EXP ของ GGT ใน Spotlight 11 ชุด รวม 537 แถว เทียบกับมอนสเตอร์ที่เว็บแสดง 136 แมพ โดยใช้กฎจับคู่เดียวกับเครื่องคำนวณ พบแถวที่จับคู่ได้ครบ 537 แถว ครอบคลุมรายการมอนสเตอร์รายแมพ 343 รายการ

กติกา: ถ้า GGT ทุกประกาศที่จับคู่กับมอนตัวนั้นให้ Normal EXP ค่าเดียวกัน เว็บใช้ค่านั้นก่อนฐานจากแหล่งอื่น แล้วคำนวณค่าเฉลี่ยแมพใหม่ โดยคงค่าเดิมในข้อมูลดิบไว้เป็นฐานสำรอง ถ้าประกาศ GGT ให้หลายค่า จะคงฐานที่เลือกไว้เดิมซึ่งตรงกับหนึ่งในประกาศ และแสดงความต่างตามรอบ

## ข้อสรุปที่บันทึกไว้

- กฎ Unicorn ของ Charge Basilisk Lv148 / Normal EXP 12,815 จำกัดการจับคู่ที่ `lasa_dun03`; ตัว Lv140 / 10,679 ใน `lasa_dun02` เป็นอีกแถวรายแมพ จึงไม่นับเป็นประกาศ GGT ขัดกัน
- กรณี GGT ให้ Normal EXP ต่างรอบจริงเหลือ 10 ตัว: 8 ตัวใน `ra_pol01`/`mjo_wst01` ที่ค่ารอบหลังเพิ่มเป็น 2 เท่า, Diligent Andre และ White Porcellio
- `No event` คงค่าต่ำที่ GGT เคยประกาศและตรงกับแหล่งฐานอื่น; เมื่อเลือกกิจกรรมให้ใช้ `Event EXP` ของประกาศรอบนั้นตรง ๆ ไม่คูณจากฐาน `No event` อีกครั้ง
- Divine Pride ค่าเริ่มต้นตรงกับค่าต่ำทั้ง 10 ตัว; iRO มีเลขยืนยันค่าต่ำได้ 2 ตัว ส่วน 8 ตัว EP20 ไม่ลง EXP การเทียบนี้ไม่พิสูจน์ว่าค่าสูงในประกาศ GGT ผิดหรือเป็นการปรับฐานถาวร
## ค่าที่แก้ตาม GGT (20 ตัว)

| แมพ | มอนสเตอร์ | ฐานสำรองเดิม | Normal EXP จาก GGT |
|---|---|---:|---:|
| mag_dun03 | Rigid Lava Golem | 139060 | 111248 |
| mag_dun03 | Rigid Blazer | 138416 | 110733 |
| amicitia1 | Amitera | 459681 | 297411 |
| amicitia1 | Litus | 465590 | 294168 |
| amicitia1 | Fillia | 476341 | 293478 |
| amicitia1 | Vanilaqus | 480454 | 296635 |
| amicitia2 | Lavaeter | 617108 | 317899 |
| amicitia2 | Fulgor | 627091 | 314774 |
| amicitia2 | Napeo | 615343 | 315666 |
| amicitia2 | Galensis | 626446 | 316687 |
| jor_ab02 | Hallucigenia | 706645 | 707510 |
| nif_dun02 | Grote | 735932 | 346622 |
| nif_dun02 | Disguiser | 743161 | 335956 |
| nif_dun02 | Blue Moon Loli Ruri | 756330 | 339785 |
| nif_dun02 | Pierrotzoist | 761273 | 339451 |
| ice_d03_i | Angry Gazeti | 9652 | 6755 |
| ice_d03_i | Angry Snowier | 9486 | 7106 |
| ice_d03_i | Angry Ice Titan | 9785 | 7519 |
| odin_tem02 | Skogul | 0 | 3639 |
| odin_tem02 | Frus | 0 | 3689 |

## ประกาศ GGT ต่างรอบ (10 ตัว)

ค่าที่เว็บใช้ยังตรงกับประกาศ GGT อย่างน้อยหนึ่งรอบ แต่ไม่ควรเลือกค่าที่สูงกว่าหรือล่าสุดอัตโนมัติโดยไม่มีหลักฐานว่าเป็นการปรับฐานถาวร

Charge Basilisk Lv148 / 12,815 ในประกาศ Unicorn เป็นตัวที่ lasa_dun03; เว็บเคยจับคู่ข้ามไป Combat Basilisk Lv140 / 10,679 ที่ lasa_dun02 เพราะชื่อเหมือนกัน จึงจำกัดกฎ Unicorn ให้ตรง Lv148 แล้ว ไม่ใช่กรณี GGT ขัดกันในแมพเดียว

| แมพ | มอนสเตอร์ | ฐานที่เว็บใช้ | Normal EXP ที่ GGT เคยระบุ |
|---|---|---:|---|
| ant_d02_i | Diligent Andre | 80476 | 80476, 96141 |
| ra_pol01 | Burning Night | 1065428 | 1065428, 2130856 |
| ra_pol01 | Deadween | 1054194 | 1054194, 2108388 |
| ra_pol01 | Deadsera | 995893 | 995893, 1991786 |
| ra_pol01 | Hardrock Titan | 1023843 | 1023843, 2047686 |
| mjo_wst01 | Aferde | 1027707 | 1027707, 2055414 |
| mjo_wst01 | Dispol | 1039283 | 1039283, 2078566 |
| mjo_wst01 | Punch Bug | 999230 | 999230, 1998460 |
| mjo_wst01 | Timbers | 1043994 | 1043994, 2087988 |
| ein_dun03 | White Porcellio | 171666 | 171666, 171935 |

## เทียบกับ Divine Pride และฐานข้อมูล iRO

Divine Pride ในคอลัมน์นี้คือหน้า monster ค่าเริ่มต้น (`dpRO`) ไม่ใช่ branch ไทย; EXP ที่แสดงในตาราง level adjustment ใช้แถว 100% เท่านั้น. iRO ที่มีเลขเป็นข้อมูลจาก RagnaPlace หน้า iRO; 8 ตัว EP20 ในหน้า iRO ระบุ EXP เป็น `-` จึงใช้ยืนยันเลขไม่ได้. แหล่งนอก GGT ใช้ตรวจความสมเหตุสมผล ไม่ใช้ตัดสินแทนประกาศ GGT.

| แมพ | มอนสเตอร์ | GGT ค่าต่ำ | GGT ค่าสูง | Divine Pride ค่าเริ่มต้น | iRO |
|---|---|---:|---:|---:|---:|
| ant_d02_i | [Diligent Andre](https://www.divine-pride.net/database/monster/21386/diligent-andre) | 80,476 | 96,141 | 80,476 | [80,476](https://ragnaplace.com/en/iro/mob/21386/diligent-andre) |
| ein_dun03 | [White Porcellio](https://www.divine-pride.net/database/monster/20602/white-porcellio) | 171,666 | 171,935 | 171,666 | [171,666](https://ragnaplace.com/en/iro/map/ein_dun03/einbech-mine-floor-3) |
| ra_pol01 | [Deadsera](https://www.divine-pride.net/database/monster/21947/deadsera) | 995,893 | 1,991,786 | 995,893 | ไม่ลง EXP |
| ra_pol01 | [Hardrock Titan](https://www.divine-pride.net/database/monster/21948/hardrock-titan) | 1,023,843 | 2,047,686 | 1,023,843 | ไม่ลง EXP |
| ra_pol01 | [Deadween](https://www.divine-pride.net/database/monster/21949/deadween) | 1,054,194 | 2,108,388 | 1,054,194 | ไม่ลง EXP |
| ra_pol01 | [Burning Night](https://www.divine-pride.net/database/monster/21946/burning-night) | 1,065,428 | 2,130,856 | 1,065,428 | ไม่ลง EXP |
| mjo_wst01 | [Punch Bug](https://www.divine-pride.net/database/monster/21951/punch-bug) | 999,230 | 1,998,460 | 999,230 | ไม่ลง EXP |
| mjo_wst01 | [Dispol](https://www.divine-pride.net/database/monster/21953/dispol) | 1,039,283 | 2,078,566 | 1,039,283 | ไม่ลง EXP |
| mjo_wst01 | [Aferde](https://www.divine-pride.net/database/monster/21952/aferde) | 1,027,707 | 2,055,414 | 1,027,707 | ไม่ลง EXP |
| mjo_wst01 | [Timbers](https://www.divine-pride.net/database/monster/21954/timbers) | 1,043,994 | 2,087,988 | 1,043,994 | ไม่ลง EXP |

[GGT หน้าแมพ ra_pol01](https://ro.gnjoy.in.th/new-map-update-power-twisted-plains/) และ [GGT หน้าแมพ mjo_wst01](https://ro.gnjoy.in.th/new-map-update-mjolnir-underground-caverns/) ลงค่าต่ำครบ 8 ตัวตรงกับ Divine Pride; [ฐานข้อมูล iRO ของ ra_pol01](https://ragnaplace.com/en/iro/map/ra_pol01) และ [mjo_wst01](https://ragnaplace.com/en/iro/map/mjo_wst01/mjolnir-underground-caverns) ไม่มีเลข EXP. ค่า GGT รอบหลังที่สูงขึ้น 2 เท่าทั้ง 8 ตัวอยู่ใน [ประกาศ September](https://ro.gnjoy.in.th/triple-exp-double-monster-event-23-sep-2026/) และบางตัวใน August; ยังไม่มีหลักฐานพอว่าปรับฐานถาวร. เว็บจึงคงค่าต่ำสำหรับ No event และใช้ Event EXP จากประกาศตรง ๆ เมื่อเลือกกิจกรรม.

Charge Basilisk Lv148 ใน [Divine Pride](https://www.divine-pride.net/database/monster/3504/combat-basilisk) มีฐาน 12,815 ตรงกับ GGT Unicorn และแมพ lasa_dun03. แถว GGT September ระบุ Charge Basilisk Lv140 / 10,679 ที่ lasa_dun02 จึงเป็นคนละรายการรายแมพ ไม่ใช่ความขัดแย้งของประกาศ.

## แมพในภาพประกาศต่างจากแมพที่ใช้จับคู่ในเว็บ (2 แถว)

- [Return 2025](https://ro.gnjoy.in.th/monster-spotlight-return-2025/): ภาพ GGT พิมพ์ Peco Peco ที่ `lasa_dun01` จึงคงค่านี้ใน `sourceMap`; ตามจุดเกิดที่ผู้ใช้ยืนยันและข้อมูลแมพ [`moc_fild01`](https://www.divine-pride.net/database/map/moc_fild01) / [`moc_fild02`](https://www.divine-pride.net/database/map/moc_fild02) เว็บจับคู่กิจกรรมกับ Peco Peco ทั้งสองแมพ โดยใช้ Normal EXP 204 และ Event EXP 1,224 จาก GGT
- [Halloween 2025](https://ro.gnjoy.in.th/monster-spotlight-halloween-edition-15-oct-2025/): ภาพ GGT พิมพ์ Jakk ที่ `gef_dun02` จึงคงค่านี้ใน `sourceMap`; ตามจุดเกิดที่ผู้ใช้ยืนยันและข้อมูลแมพ [`gef_dun01`](https://www.divine-pride.net/database/map/gef_dun01) เว็บจับคู่กิจกรรมกับ Jakk ที่แมพนี้ โดยใช้ Normal EXP 588 และ Event EXP 3,528 จาก GGT

การจับคู่แมพข้างต้นเป็นการตีความเพื่อให้เครื่องคำนวณใช้กับจุดเกิดที่มีมอนจริง ไม่ได้แก้ข้อความในภาพประกาศ GGT; ตรวจ coverage รายแมพแล้ว ไม่เหลือกฎที่จับคู่ไม่ได้

กฎ Flame 2026 ของ Chimera Lavaeter เดิมอยู่ amicitia1 ผิด; ภาพตาราง GGT ระบุ amicitia2 จึงแก้กฎและลบข้อยกเว้นเดิม

ขอบเขตการตรวจ: เปรียบเทียบข้อมูล Spotlight ที่เว็บโหลดกับฐานมอนทุกตัว และเปิดภาพต้นฉบับ GGT ตรวจกรณี Flame, August และ September ที่เกี่ยวข้อง ไม่ได้อ่านข้อความจากภาพต้นฉบับครบทั้ง 537 แถวซ้ำทีละแถว

รันซ้ำ: node scripts/audit_spotlight_base.cjs
