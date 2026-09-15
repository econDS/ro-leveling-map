// Known conflicts between official event rows and reference map populations.
const SPOTLIGHT_COVERAGE_EXCEPTIONS = [
  {
    "eventId": "2026-01-14_flame",
    "map": "amicitia1",
    "name": "Lavaeter",
    "reason": "ประกาศระบุ amicitia1 แต่ฐานมอนพบ Lavaeter ใน amicitia2; รอหลักฐานก่อนย้ายโบนัส"
  },
  {
    "eventId": "2025-08-27_return",
    "map": "lasa_dun01",
    "name": "Peco Peco",
    "reason": "ประกาศระบุ lasa_dun01 แต่ฐานแมพมี Trance Spore / Scout Basilisk และไม่พบ Peco Peco"
  },
  {
    "eventId": "2025-10-15_halloween",
    "map": "gef_dun02",
    "name": "Jakk",
    "reason": "ประกาศระบุ gef_dun02 แต่ฐานจำนวนมอนแมพนี้ไม่พบ Jakk"
  }
];
