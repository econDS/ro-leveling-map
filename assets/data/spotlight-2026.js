// Official event snapshots; EXP and spawn rows are kept in spotlight-2026.json.
const SPOTLIGHT_EVENTS = [
  {
    "id": "2025-12-03_unicorn",
    "name": "Spotlight · Year of Unicorn",
    "start": "2025-12-03",
    "end": "2026-01-07",
    "sourceUrl": "https://ro.gnjoy.in.th/monster-spotlight-year-of-unicorn-edition-3-dec-2025/",
    "image": "assets/spotlight/2025-12-03_unicorn.jpg",
    "rules": [
      {
        "map": "*",
        "name": "Charge Basilisk",
        "normalExp": 12815,
        "eventExp": 51260
      },
      {
        "map": "*",
        "name": "Fruit Pom Spider",
        "normalExp": 8809,
        "eventExp": 35236
      },
      {
        "map": "*",
        "name": "Diligent Andre",
        "normalExp": 96141,
        "eventExp": 384564
      },
      {
        "map": "*",
        "name": "Diligent Deniro",
        "normalExp": 81114,
        "eventExp": 324456
      },
      {
        "map": "*",
        "name": "Chaotic Stem Worm",
        "normalExp": 93370,
        "eventExp": 373480
      },
      {
        "map": "*",
        "name": "Chaos Hunter Fly",
        "normalExp": 95008,
        "eventExp": 380032
      },
      {
        "map": "*",
        "name": "Limacina",
        "normalExp": 302265,
        "eventExp": 906795
      },
      {
        "map": "*",
        "name": "Cave Calmaring",
        "normalExp": 495027,
        "eventExp": 1485081
      },
      {
        "map": "*",
        "name": "Cave Flower",
        "normalExp": 511759,
        "eventExp": 1535277
      },
      {
        "map": "*",
        "name": "Discarded Primitive Rgan",
        "normalExp": 525915,
        "eventExp": 1577745
      },
      {
        "map": "*",
        "name": "Hallucigenia Baby",
        "normalExp": 513505,
        "eventExp": 1540515
      },
      {
        "map": "*",
        "name": "Renovated Superior Rgan",
        "normalExp": 518457,
        "eventExp": 1555371
      },
      {
        "map": "*",
        "name": "One Eye Dollocaris",
        "normalExp": 707510,
        "eventExp": 2122530
      },
      {
        "map": "*",
        "name": "Hallucigenia",
        "normalExp": 707510,
        "eventExp": 2122530
      },
      {
        "map": "*",
        "name": "Entangled Intermediate Rgan",
        "normalExp": 723723,
        "eventExp": 2171169
      },
      {
        "map": "*",
        "name": "Discarded Intermediate Rgan",
        "normalExp": 729743,
        "eventExp": 2189229
      },
      {
        "map": "*",
        "name": "Two Eyes Dollocaris",
        "normalExp": 729743,
        "eventExp": 2189229
      },
      {
        "map": "*",
        "name": "Plain Pinguicula",
        "normalExp": 1308495,
        "eventExp": 3925485
      },
      {
        "map": "*",
        "name": "Plain Savage",
        "normalExp": 1336711,
        "eventExp": 4010133
      },
      {
        "map": "*",
        "name": "Plain Hill Wind",
        "normalExp": 1327922,
        "eventExp": 3983766
      },
      {
        "map": "*",
        "name": "Plain Rocker",
        "normalExp": 1347253,
        "eventExp": 4041759
      },
      {
        "map": "*",
        "name": "Plain Cornus",
        "normalExp": 1380517,
        "eventExp": 4141551
      },
      {
        "map": "*",
        "name": "Plain Flora",
        "normalExp": 1352885,
        "eventExp": 4058655
      },
      {
        "map": "*",
        "name": "Plain Hunter Fly",
        "normalExp": 1373213,
        "eventExp": 4119639
      },
      {
        "map": "*",
        "name": "Rocker",
        "normalExp": 174,
        "eventExp": 696
      },
      {
        "map": "*",
        "name": "Poporing",
        "normalExp": 229,
        "eventExp": 916
      },
      {
        "map": "*",
        "name": "Orc Warrior",
        "normalExp": 361,
        "eventExp": 1444
      },
      {
        "map": "*",
        "name": "Orc Lady",
        "normalExp": 369,
        "eventExp": 1476
      },
      {
        "map": "*",
        "name": "Hode",
        "normalExp": 617,
        "eventExp": 2468
      },
      {
        "map": "*",
        "name": "Sandman",
        "normalExp": 592,
        "eventExp": 2368
      },
      {
        "map": "*",
        "name": "Sleeper",
        "normalExp": 1001,
        "eventExp": 4004
      },
      {
        "map": "*",
        "name": "Harpy",
        "normalExp": 986,
        "eventExp": 3944
      },
      {
        "map": "*",
        "name": "Stapo",
        "normalExp": 1356,
        "eventExp": 5424
      },
      {
        "map": "*",
        "name": "Luciola Vespa",
        "normalExp": 1887,
        "eventExp": 7548
      },
      {
        "map": "*",
        "name": "Naga",
        "normalExp": 2712,
        "eventExp": 10848
      },
      {
        "map": "*",
        "name": "Cornus",
        "normalExp": 2652,
        "eventExp": 10608
      },
      {
        "map": "*",
        "name": "Gold Acidus",
        "normalExp": 3739,
        "eventExp": 14956
      },
      {
        "map": "*",
        "name": "Blue Acidus",
        "normalExp": 3739,
        "eventExp": 14956
      },
      {
        "map": "*",
        "name": "Contaminated Raydric Archer",
        "normalExp": 168266,
        "eventExp": 673064
      },
      {
        "map": "*",
        "name": "Flame Ghost",
        "normalExp": 172163,
        "eventExp": 688652
      },
      {
        "map": "*",
        "name": "Bone Ferus",
        "normalExp": 248173,
        "eventExp": 744519
      },
      {
        "map": "*",
        "name": "Bone Acidus",
        "normalExp": 249407,
        "eventExp": 748221
      },
      {
        "map": "*",
        "name": "Ice Straw",
        "normalExp": 293285,
        "eventExp": 879855
      },
      {
        "map": "*",
        "name": "Unfrost Flower",
        "normalExp": 295309,
        "eventExp": 885927
      }
    ],
    "amountMaps": [],
    "notes": "ประกาศ Unicorn ระบุชื่อมอนสเตอร์โดยไม่แยกแมพ"
  },
  {
    "id": "2026-01-14_flame",
    "name": "Spotlight · Flame",
    "start": "2026-01-14",
    "end": "2026-02-18",
    "sourceUrl": "https://ro.gnjoy.in.th/monster-spotlight-flame-edition-14-jan-2025/",
    "image": "assets/spotlight/2026-01-14_flame.jpg",
    "rules": [
      {
        "map": "tur_d04_i",
        "name": "Ominous Solider",
        "normalExp": 59190,
        "eventExp": 236760
      },
      {
        "map": "tur_d04_i",
        "name": "Ominous Heater",
        "normalExp": 52699,
        "eventExp": 210796
      },
      {
        "map": "oz_dun01",
        "name": "Ash Toad",
        "normalExp": 109122,
        "eventExp": 436488
      },
      {
        "map": "oz_dun01",
        "name": "Spark",
        "normalExp": 154226,
        "eventExp": 616904
      },
      {
        "map": "jor_dun01",
        "name": "Primitive Rgan",
        "normalExp": 318751,
        "eventExp": 956253
      },
      {
        "map": "jor_dun01",
        "name": "Heart Hunter AT",
        "normalExp": 319499,
        "eventExp": 958497
      },
      {
        "map": "jor_dun01",
        "name": "Lowest Rgan",
        "normalExp": 333500,
        "eventExp": 1000500
      },
      {
        "map": "jor_dun01",
        "name": "Junior Rgan",
        "normalExp": 346392,
        "eventExp": 1039176
      },
      {
        "map": "amicitia1",
        "name": "Amitera",
        "normalExp": 297411,
        "eventExp": 892233
      },
      {
        "map": "amicitia1",
        "name": "Fillia",
        "normalExp": 293478,
        "eventExp": 880434
      },
      {
        "map": "amicitia1",
        "name": "Vanilaqus",
        "normalExp": 296635,
        "eventExp": 889905
      },
      {
        "map": "amicitia1",
        "name": "Litus",
        "normalExp": 294168,
        "eventExp": 882504
      },
      {
        "map": "amicitia1",
        "name": "Lavaeter",
        "normalExp": 317899,
        "eventExp": 953697
      },
      {
        "map": "amicitia2",
        "name": "Galensis",
        "normalExp": 316687,
        "eventExp": 950061
      },
      {
        "map": "amicitia2",
        "name": "Napeo",
        "normalExp": 315666,
        "eventExp": 946998
      },
      {
        "map": "amicitia2",
        "name": "Fulgor",
        "normalExp": 314774,
        "eventExp": 944322
      },
      {
        "map": "bl_lava",
        "name": "Inferno Explosion",
        "normalExp": 1332273,
        "eventExp": 3996819
      },
      {
        "map": "bl_lava",
        "name": "Inferno Deleter",
        "normalExp": 1340379,
        "eventExp": 4021137
      },
      {
        "map": "bl_lava",
        "name": "Inferno Jakk",
        "normalExp": 1322755,
        "eventExp": 3968265
      },
      {
        "map": "bl_lava",
        "name": "Inferno Lava Golem",
        "normalExp": 1376698,
        "eventExp": 4130094
      },
      {
        "map": "bl_lava",
        "name": "Inferno Majoruros",
        "normalExp": 1356696,
        "eventExp": 4070088
      },
      {
        "map": "bl_lava",
        "name": "Inferno Hydrolancer",
        "normalExp": 1414382,
        "eventExp": 4243146
      },
      {
        "map": "bl_lava",
        "name": "Inferno Acidus of Fire",
        "normalExp": 1393537,
        "eventExp": 4180611
      },
      {
        "map": "moc_fild11",
        "name": "Scorpion",
        "normalExp": 169,
        "eventExp": 676
      },
      {
        "map": "prt_fild10",
        "name": "Elder Willow",
        "normalExp": 259,
        "eventExp": 1036
      },
      {
        "map": "um_fild02",
        "name": "Choco",
        "normalExp": 379,
        "eventExp": 1516
      },
      {
        "map": "um_fild02",
        "name": "Stone Shooter",
        "normalExp": 600,
        "eventExp": 2400
      },
      {
        "map": "yuno_fild08",
        "name": "Grand Peco",
        "normalExp": 794,
        "eventExp": 3176
      },
      {
        "map": "yuno_fild08",
        "name": "Goat",
        "normalExp": 869,
        "eventExp": 3476
      },
      {
        "map": "gon_dun03",
        "name": "Hermit Plant",
        "normalExp": 1103,
        "eventExp": 4412
      },
      {
        "map": "gon_dun03",
        "name": "Taoist Hermit",
        "normalExp": 1311,
        "eventExp": 5244
      },
      {
        "map": "mag_dun02",
        "name": "Deleter",
        "normalExp": 1625,
        "eventExp": 6500
      },
      {
        "map": "moc_prydn1",
        "name": "Mummy (Nightmare)",
        "normalExp": 2841,
        "eventExp": 11364
      },
      {
        "map": "moc_prydn1",
        "name": "Minorous (Nightmare)",
        "normalExp": 3047,
        "eventExp": 12188
      },
      {
        "map": "lhz_dun02",
        "name": "Armeyer Dinze",
        "normalExp": 3182,
        "eventExp": 12728
      },
      {
        "map": "lhz_dun02",
        "name": "Egnigem Cenia",
        "normalExp": 3699,
        "eventExp": 14796
      },
      {
        "map": "iz_d04_i",
        "name": "Abysmal Sropho",
        "normalExp": 30314,
        "eventExp": 121256
      },
      {
        "map": "iz_d04_i",
        "name": "Abysmal Marse",
        "normalExp": 30163,
        "eventExp": 120652
      },
      {
        "map": "iz_d05_i",
        "name": "Abysmal Sedora",
        "normalExp": 191676,
        "eventExp": 766704
      },
      {
        "map": "iz_d05_i",
        "name": "Abysmal Swordfish",
        "normalExp": 199827,
        "eventExp": 799308
      },
      {
        "map": "iz_d05_i",
        "name": "Abysmal Phen",
        "normalExp": 193144,
        "eventExp": 772576
      },
      {
        "map": "iz_d05_i",
        "name": "Abysmal Strouf",
        "normalExp": 197828,
        "eventExp": 791312
      },
      {
        "map": "clock_01",
        "name": "Sieglouse",
        "normalExp": 742800,
        "eventExp": 2228400
      },
      {
        "map": "clock_01",
        "name": "Erzsebet",
        "normalExp": 748788,
        "eventExp": 2246364
      },
      {
        "map": "clock_01",
        "name": "Jennifer",
        "normalExp": 755552,
        "eventExp": 2266656
      },
      {
        "map": "clock_01",
        "name": "General Orc",
        "normalExp": 767150,
        "eventExp": 2301450
      },
      {
        "map": "clock_01",
        "name": "Extra Joker",
        "normalExp": 755552,
        "eventExp": 2266656
      }
    ],
    "amountMaps": [],
    "notes": "ยึดแมพในภาพ Flame: Junior Rgan ที่ jor_dun01 และ Lavaeter ที่ amicitia1"
  },
  {
    "id": "2026-02-25_new_specimen",
    "name": "Spotlight · New Specimen",
    "start": "2026-02-25",
    "end": "2026-03-18",
    "sourceUrl": "https://ro.gnjoy.in.th/monster-spotlight-varmundts-biosphere-new-specimen/",
    "image": "assets/spotlight/2026-02-25_new_specimen.jpg",
    "rules": [
      {
        "map": "bl_temple",
        "name": "Temple Rudo",
        "normalExp": 1360016,
        "eventExp": 4080048
      },
      {
        "map": "bl_temple",
        "name": "Temple Arc Angeling",
        "normalExp": 1357745,
        "eventExp": 4073235
      },
      {
        "map": "bl_temple",
        "name": "Temple False Angel",
        "normalExp": 1360833,
        "eventExp": 4082499
      },
      {
        "map": "bl_temple",
        "name": "Temple Plasma",
        "normalExp": 1374116,
        "eventExp": 4122348
      },
      {
        "map": "bl_temple",
        "name": "Temple Solace",
        "normalExp": 1384784,
        "eventExp": 4154352
      },
      {
        "map": "bl_temple",
        "name": "Temple Anopheles",
        "normalExp": 1348511,
        "eventExp": 4045533
      },
      {
        "map": "bl_temple",
        "name": "Temple Gryphon",
        "normalExp": 1405103,
        "eventExp": 4215309
      },
      {
        "map": "bl_venom",
        "name": "Venom Comodo",
        "normalExp": 1361942,
        "eventExp": 4085826
      },
      {
        "map": "bl_venom",
        "name": "Venom Poison Toad",
        "normalExp": 1369807,
        "eventExp": 4109421
      },
      {
        "map": "bl_venom",
        "name": "Venom Side Winder",
        "normalExp": 1360016,
        "eventExp": 4080048
      },
      {
        "map": "bl_venom",
        "name": "Venom Cramp",
        "normalExp": 1384784,
        "eventExp": 4154352
      },
      {
        "map": "bl_venom",
        "name": "Venom Kukre",
        "normalExp": 1362287,
        "eventExp": 4086861
      },
      {
        "map": "bl_venom",
        "name": "Venom Nephentes",
        "normalExp": 1359286,
        "eventExp": 4077858
      },
      {
        "map": "bl_venom",
        "name": "Venom Angra Mantis",
        "normalExp": 1375335,
        "eventExp": 4126005
      },
      {
        "map": "bl_soul",
        "name": "Soul Nightmare",
        "normalExp": 1359262,
        "eventExp": 4077786
      },
      {
        "map": "bl_soul",
        "name": "Soul Whisper",
        "normalExp": 1350324,
        "eventExp": 4050972
      },
      {
        "map": "bl_soul",
        "name": "Soul Marionette",
        "normalExp": 1349481,
        "eventExp": 4048443
      },
      {
        "map": "bl_soul",
        "name": "Soul Noxious",
        "normalExp": 1359180,
        "eventExp": 4077540
      },
      {
        "map": "bl_soul",
        "name": "Soul The Paper",
        "normalExp": 1363447,
        "eventExp": 4090341
      },
      {
        "map": "bl_soul",
        "name": "Soul Gajomart",
        "normalExp": 1366759,
        "eventExp": 4100277
      },
      {
        "map": "bl_soul",
        "name": "Soul Odium of Thanatos",
        "normalExp": 1386181,
        "eventExp": 4158543
      }
    ],
    "amountMaps": [],
    "notes": "เพิ่ม EXP เฉพาะมอนสเตอร์และแมพที่ระบุในประกาศ"
  },
  {
    "id": "2026-03-25_summer",
    "name": "Spotlight · Summer",
    "start": "2026-03-25",
    "end": "2026-04-29",
    "sourceUrl": "https://ro.gnjoy.in.th/monster-spotlight-summer-edition-25-mar-2025/",
    "image": "assets/spotlight/2026-03-25_summer.jpg",
    "rules": [
      {
        "map": "ein_d02_i",
        "name": "Blue Teddy Bear",
        "normalExp": 18300,
        "eventExp": 73200
      },
      {
        "map": "ein_d02_i",
        "name": "Red Teddy Bear",
        "normalExp": 19972,
        "eventExp": 79888
      },
      {
        "map": "prt_mz03_i",
        "name": "Chaos Poporing",
        "normalExp": 93876,
        "eventExp": 375504
      },
      {
        "map": "prt_mz03_i",
        "name": "Chaos Baphomet Jr",
        "normalExp": 96161,
        "eventExp": 384644
      },
      {
        "map": "prt_mz03_i",
        "name": "Chaos Killer Mantis",
        "normalExp": 96197,
        "eventExp": 384788
      },
      {
        "map": "jor_back3",
        "name": "Ice Gangu",
        "normalExp": 269913,
        "eventExp": 1079652
      },
      {
        "map": "jor_back3",
        "name": "Calmaring",
        "normalExp": 275888,
        "eventExp": 1103552
      },
      {
        "map": "jor_back3",
        "name": "Primitive Rgan",
        "normalExp": 318751,
        "eventExp": 1275004
      },
      {
        "map": "jor_back3",
        "name": "Lowest Rgan",
        "normalExp": 333500,
        "eventExp": 1334000
      },
      {
        "map": "jor_back3",
        "name": "Limacina",
        "normalExp": 302265,
        "eventExp": 1209060
      },
      {
        "map": "jor_ab01",
        "name": "Cave Calmaring",
        "normalExp": 495027,
        "eventExp": 1485081
      },
      {
        "map": "jor_ab01",
        "name": "Cave Flower",
        "normalExp": 511759,
        "eventExp": 1535277
      },
      {
        "map": "jor_ab01",
        "name": "Discarded Primitive Rgan",
        "normalExp": 525915,
        "eventExp": 1577745
      },
      {
        "map": "jor_ab01",
        "name": "Hallucigenia Baby",
        "normalExp": 513505,
        "eventExp": 1540515
      },
      {
        "map": "jor_ab02",
        "name": "One Eye Dolocaris",
        "normalExp": 707510,
        "eventExp": 2122530
      },
      {
        "map": "jor_ab02",
        "name": "Hallucigenia",
        "normalExp": 707510,
        "eventExp": 2122530
      },
      {
        "map": "jor_ab02",
        "name": "Two Eyes Dolocaris",
        "normalExp": 729743,
        "eventExp": 2189229
      },
      {
        "map": "jor_ab02",
        "name": "Discarded Intermediate Rgan",
        "normalExp": 729743,
        "eventExp": 2189229
      },
      {
        "map": "bl_grass",
        "name": "Plain Pinguicula",
        "normalExp": 1308495,
        "eventExp": 3925485
      },
      {
        "map": "bl_grass",
        "name": "Plain Savage",
        "normalExp": 1336711,
        "eventExp": 4010133
      },
      {
        "map": "bl_grass",
        "name": "Plain Hill Wind",
        "normalExp": 1327922,
        "eventExp": 3983766
      },
      {
        "map": "bl_grass",
        "name": "Plain Rocker",
        "normalExp": 1347253,
        "eventExp": 4041759
      },
      {
        "map": "bl_grass",
        "name": "Plain Cornus",
        "normalExp": 1380517,
        "eventExp": 4141551
      },
      {
        "map": "bl_grass",
        "name": "Plain Flora",
        "normalExp": 1352885,
        "eventExp": 4058655
      },
      {
        "map": "bl_grass",
        "name": "Plain Hunter Fly",
        "normalExp": 1373213,
        "eventExp": 4119639
      },
      {
        "map": "cmd_fild04",
        "name": "Galapago",
        "normalExp": 369,
        "eventExp": 1476
      },
      {
        "map": "cmd_fild04",
        "name": "Sea Otter",
        "normalExp": 379,
        "eventExp": 1516
      },
      {
        "map": "ayo_dun01",
        "name": "Leaf Cat",
        "normalExp": 630,
        "eventExp": 2520
      },
      {
        "map": "ayo_dun02",
        "name": "Kraben",
        "normalExp": 610,
        "eventExp": 2440
      },
      {
        "map": "lhz_fild01",
        "name": "Rafflesia",
        "normalExp": 1086,
        "eventExp": 4344
      },
      {
        "map": "lhz_fild03",
        "name": "Breeze",
        "normalExp": 1238,
        "eventExp": 4952
      },
      {
        "map": "ice_dun03",
        "name": "Gazeti",
        "normalExp": 1824,
        "eventExp": 7296
      },
      {
        "map": "ice_dun03",
        "name": "Ice Titan",
        "normalExp": 1908,
        "eventExp": 7632
      },
      {
        "map": "abyss_03",
        "name": "Green Ferus",
        "normalExp": 3820,
        "eventExp": 15280
      },
      {
        "map": "abyss_03",
        "name": "Gold Acidus",
        "normalExp": 3739,
        "eventExp": 14956
      },
      {
        "map": "odin_past",
        "name": "Angelgolt",
        "normalExp": 179216,
        "eventExp": 716864
      },
      {
        "map": "odin_past",
        "name": "Holy Frus",
        "normalExp": 183728,
        "eventExp": 734912
      },
      {
        "map": "odin_past",
        "name": "Holy Skogul",
        "normalExp": 184690,
        "eventExp": 738760
      },
      {
        "map": "odin_past",
        "name": "Angelgolt",
        "normalExp": 179251,
        "eventExp": 717004
      },
      {
        "map": "nif_dun02",
        "name": "Grote",
        "normalExp": 346622,
        "eventExp": 1039866
      },
      {
        "map": "nif_dun02",
        "name": "Disguiser",
        "normalExp": 335956,
        "eventExp": 1007868
      },
      {
        "map": "nif_dun02",
        "name": "Blue Moon Loli Ruri",
        "normalExp": 339785,
        "eventExp": 1019355
      },
      {
        "map": "nif_dun02",
        "name": "Pierrotzoist",
        "normalExp": 339451,
        "eventExp": 1018353
      },
      {
        "map": "clock_01",
        "name": "Sieglouse",
        "normalExp": 742800,
        "eventExp": 2228400
      },
      {
        "map": "clock_01",
        "name": "Erzsebet",
        "normalExp": 748788,
        "eventExp": 2246364
      },
      {
        "map": "clock_01",
        "name": "Jennifer",
        "normalExp": 755552,
        "eventExp": 2266656
      },
      {
        "map": "clock_01",
        "name": "General Orc",
        "normalExp": 767150,
        "eventExp": 2301450
      },
      {
        "map": "clock_01",
        "name": "Extra Joker",
        "normalExp": 755552,
        "eventExp": 2266656
      }
    ],
    "amountMaps": [],
    "notes": "เพิ่ม EXP เฉพาะมอนสเตอร์และแมพที่ระบุในประกาศ"
  },
  {
    "id": "2026-04-29_rainy",
    "name": "Spotlight · Rainy Season",
    "start": "2026-04-29",
    "end": "2026-05-27",
    "sourceUrl": "https://ro.gnjoy.in.th/monster-spotlight-rainy-season-29-apr-2025/",
    "image": "assets/spotlight/2026-04-29_rainy.jpg",
    "rules": [
      {
        "map": "ba_lost",
        "name": "Red Pitaya",
        "normalExp": 54002,
        "eventExp": 216008
      },
      {
        "map": "ba_lost",
        "name": "Yellow Pitaya",
        "normalExp": 54884,
        "eventExp": 219536
      },
      {
        "map": "ba_lost",
        "name": "Blue Pitaya",
        "normalExp": 47351,
        "eventExp": 189404
      },
      {
        "map": "ba_lost",
        "name": "Violet Pitaya",
        "normalExp": 47536,
        "eventExp": 190144
      },
      {
        "map": "ba_lost",
        "name": "Green Pitaya",
        "normalExp": 44559,
        "eventExp": 178236
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Explosion",
        "normalExp": 106026,
        "eventExp": 424104
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Earth Deleter",
        "normalExp": 107518,
        "eventExp": 430072
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Kaho",
        "normalExp": 107162,
        "eventExp": 428648
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Sky Deleter",
        "normalExp": 108139,
        "eventExp": 432556
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Nightmare Terror",
        "normalExp": 110791,
        "eventExp": 443164
      },
      {
        "map": "ba_pw03",
        "name": "Spell Addicted Plaga",
        "normalExp": 196446,
        "eventExp": 785784
      },
      {
        "map": "ba_pw03",
        "name": "Powerful Spell",
        "normalExp": 197418,
        "eventExp": 789672
      },
      {
        "map": "ba_pw03",
        "name": "Sharp Spell",
        "normalExp": 197350,
        "eventExp": 789400
      },
      {
        "map": "ba_pw03",
        "name": "Spell Addicted Sanare",
        "normalExp": 198605,
        "eventExp": 794420
      },
      {
        "map": "nif_dun01",
        "name": "Ghost Cube",
        "normalExp": 261542,
        "eventExp": 784626
      },
      {
        "map": "nif_dun01",
        "name": "Lude Gal",
        "normalExp": 259877,
        "eventExp": 779631
      },
      {
        "map": "nif_dun01",
        "name": "Brutal Murderer",
        "normalExp": 269952,
        "eventExp": 809856
      },
      {
        "map": "nif_dun01",
        "name": "Gan Ceann",
        "normalExp": 267854,
        "eventExp": 803562
      },
      {
        "map": "amicitia1",
        "name": "Amitera",
        "normalExp": 297411,
        "eventExp": 892233
      },
      {
        "map": "amicitia1",
        "name": "Litus",
        "normalExp": 294168,
        "eventExp": 882504
      },
      {
        "map": "amicitia1",
        "name": "Fillia",
        "normalExp": 293478,
        "eventExp": 880434
      },
      {
        "map": "amicitia1",
        "name": "Vanilaqus",
        "normalExp": 296635,
        "eventExp": 889905
      },
      {
        "map": "amicitia2",
        "name": "Lavaeter",
        "normalExp": 317899,
        "eventExp": 953697
      },
      {
        "map": "amicitia2",
        "name": "Fulgor",
        "normalExp": 314774,
        "eventExp": 944322
      },
      {
        "map": "amicitia2",
        "name": "Napeo",
        "normalExp": 315666,
        "eventExp": 946998
      },
      {
        "map": "amicitia2",
        "name": "Galensis",
        "normalExp": 316687,
        "eventExp": 950061
      },
      {
        "map": "nif_dun02",
        "name": "Grote",
        "normalExp": 346622,
        "eventExp": 1039866
      },
      {
        "map": "nif_dun02",
        "name": "Disguiser",
        "normalExp": 335956,
        "eventExp": 1007868
      },
      {
        "map": "nif_dun02",
        "name": "Blue Moon Loli Ruri",
        "normalExp": 339785,
        "eventExp": 1019355
      },
      {
        "map": "nif_dun02",
        "name": "Pierrotzoist",
        "normalExp": 339451,
        "eventExp": 1018353
      },
      {
        "map": "bl_temple",
        "name": "Temple Rudo",
        "normalExp": 1360016,
        "eventExp": 4080048
      },
      {
        "map": "bl_temple",
        "name": "Temple Arc Angeling",
        "normalExp": 1357745,
        "eventExp": 4073235
      },
      {
        "map": "bl_temple",
        "name": "Temple False Angel",
        "normalExp": 1360833,
        "eventExp": 4082499
      },
      {
        "map": "bl_temple",
        "name": "Temple Plasma",
        "normalExp": 1374116,
        "eventExp": 4122348
      },
      {
        "map": "bl_temple",
        "name": "Temple Solace",
        "normalExp": 1384784,
        "eventExp": 4154352
      },
      {
        "map": "bl_temple",
        "name": "Temple Anopheles",
        "normalExp": 1348511,
        "eventExp": 4045533
      },
      {
        "map": "bl_temple",
        "name": "Temple Gryphon",
        "normalExp": 1405103,
        "eventExp": 4215309
      },
      {
        "map": "anthell01",
        "name": "Ant Egg",
        "normalExp": 219,
        "eventExp": 876
      },
      {
        "map": "anthell01",
        "name": "Deniro",
        "normalExp": 253,
        "eventExp": 1012
      },
      {
        "map": "anthell01",
        "name": "Piere",
        "normalExp": 259,
        "eventExp": 1036
      },
      {
        "map": "iz_dun03",
        "name": "Phen",
        "normalExp": 436,
        "eventExp": 1744
      },
      {
        "map": "iz_dun03",
        "name": "Marc",
        "normalExp": 477,
        "eventExp": 1908
      },
      {
        "map": "iz_dun03",
        "name": "Swordfish",
        "normalExp": 488,
        "eventExp": 1952
      },
      {
        "map": "bra_fild01",
        "name": "Curupira",
        "normalExp": 683,
        "eventExp": 2732
      },
      {
        "map": "bra_fild01",
        "name": "Toucan",
        "normalExp": 677,
        "eventExp": 2708
      },
      {
        "map": "bra_fild01",
        "name": "Jaguar",
        "normalExp": 774,
        "eventExp": 3096
      },
      {
        "map": "lhz_fild02",
        "name": "Metaling",
        "normalExp": 954,
        "eventExp": 3816
      },
      {
        "map": "lhz_fild02",
        "name": "Stem Worm",
        "normalExp": 1002,
        "eventExp": 4008
      },
      {
        "map": "lhz_fild02",
        "name": "Breeze",
        "normalExp": 1238,
        "eventExp": 4952
      },
      {
        "map": "ma_fild02",
        "name": "Mangkukulam",
        "normalExp": 1908,
        "eventExp": 7632
      },
      {
        "map": "ma_fild02",
        "name": "Bungisngis",
        "normalExp": 3199,
        "eventExp": 12796
      },
      {
        "map": "ma_fild02",
        "name": "Engkanto",
        "normalExp": 3143,
        "eventExp": 12572
      },
      {
        "map": "ice_d03_i",
        "name": "Angry Gazeti",
        "normalExp": 6755,
        "eventExp": 27020
      },
      {
        "map": "ice_d03_i",
        "name": "Angry Snowier",
        "normalExp": 7106,
        "eventExp": 28424
      },
      {
        "map": "ice_d03_i",
        "name": "Angry Ice Titan",
        "normalExp": 7519,
        "eventExp": 30076
      },
      {
        "map": "ecl_fild01",
        "name": "Petal",
        "normalExp": 4058,
        "eventExp": 16232
      },
      {
        "map": "ecl_fild01",
        "name": "Menblatt",
        "normalExp": 4150,
        "eventExp": 16600
      }
    ],
    "amountMaps": [],
    "notes": "เพิ่ม EXP เฉพาะมอนสเตอร์และแมพที่ระบุในประกาศ"
  },
  {
    "id": "2026-06-24_varmundx2",
    "name": "Spotlight · June + Varmundt x2",
    "start": "2026-06-24",
    "end": "2026-07-15",
    "sourceUrl": "https://ro.gnjoy.in.th/monster-spotlight-varmundx2-event/",
    "image": "assets/spotlight/2026-06-24_varmundx2.jpg",
    "rules": [
      {
        "map": "lasa_dun03",
        "name": "Charge Basilisk",
        "normalExp": 12815,
        "eventExp": 51260
      },
      {
        "map": "lasa_dun03",
        "name": "Fruit Pom Spider",
        "normalExp": 8809,
        "eventExp": 35236
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Andre",
        "normalExp": 96141,
        "eventExp": 384564
      },
      {
        "map": "clock_01",
        "name": "Extra Joker",
        "normalExp": 755552,
        "eventExp": 2266656
      },
      {
        "map": "ra_pol01",
        "name": "Burning Night",
        "normalExp": 1065428,
        "eventExp": 2130856
      },
      {
        "map": "ra_pol01",
        "name": "Deadween",
        "normalExp": 1054194,
        "eventExp": 2108388
      },
      {
        "map": "ra_pol01",
        "name": "Deadsera",
        "normalExp": 995893,
        "eventExp": 1991786
      },
      {
        "map": "ra_pol01",
        "name": "Hardrock Titan",
        "normalExp": 1023843,
        "eventExp": 2047686
      },
      {
        "map": "mjo_wst01",
        "name": "Aferde",
        "normalExp": 1027707,
        "eventExp": 2055414
      },
      {
        "map": "mjo_wst01",
        "name": "Dispol",
        "normalExp": 1039283,
        "eventExp": 2078566
      },
      {
        "map": "mjo_wst01",
        "name": "Punch Bug",
        "normalExp": 999230,
        "eventExp": 1998460
      },
      {
        "map": "mjo_wst01",
        "name": "Timbers",
        "normalExp": 1043994,
        "eventExp": 2087988
      },
      {
        "map": "prt_fild07",
        "name": "Rocker",
        "normalExp": 174,
        "eventExp": 696
      },
      {
        "map": "pay_fild04",
        "name": "Poporing",
        "normalExp": 229,
        "eventExp": 916
      },
      {
        "map": "gef_fild10",
        "name": "Orc Warrior",
        "normalExp": 361,
        "eventExp": 1444
      },
      {
        "map": "gef_fild10",
        "name": "Orc Lady",
        "normalExp": 369,
        "eventExp": 1476
      },
      {
        "map": "moc_fild17",
        "name": "Hode",
        "normalExp": 617,
        "eventExp": 2468
      },
      {
        "map": "moc_fild17",
        "name": "Sandman",
        "normalExp": 592,
        "eventExp": 2368
      },
      {
        "map": "yuno_fild03",
        "name": "Sleeper",
        "normalExp": 1001,
        "eventExp": 4004
      },
      {
        "map": "yuno_fild03",
        "name": "Harpy",
        "normalExp": 986,
        "eventExp": 3944
      },
      {
        "map": "ve_fild07",
        "name": "Stapo",
        "normalExp": 1356,
        "eventExp": 5424
      },
      {
        "map": "spl_fild03",
        "name": "Luciola Vespa",
        "normalExp": 1887,
        "eventExp": 7548
      },
      {
        "map": "spl_fild03",
        "name": "Naga",
        "normalExp": 2712,
        "eventExp": 10848
      },
      {
        "map": "spl_fild03",
        "name": "Cornus",
        "normalExp": 2652,
        "eventExp": 10608
      },
      {
        "map": "abyss_03",
        "name": "Gold Acidus",
        "normalExp": 3739,
        "eventExp": 14956
      },
      {
        "map": "abyss_03",
        "name": "Blue Acidus",
        "normalExp": 3739,
        "eventExp": 14956
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Deniro",
        "normalExp": 81114,
        "eventExp": 324456
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Piere",
        "normalExp": 82688,
        "eventExp": 330752
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Soldier Andre",
        "normalExp": 83348,
        "eventExp": 333392
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Vitata",
        "normalExp": 83348,
        "eventExp": 333392
      },
      {
        "map": "ant_d02_i",
        "name": "Intrepid Giearth",
        "normalExp": 81566,
        "eventExp": 326264
      },
      {
        "map": "abyss_04",
        "name": "Bone Ferus",
        "normalExp": 248173,
        "eventExp": 744519
      },
      {
        "map": "abyss_04",
        "name": "Bone Acidus",
        "normalExp": 249407,
        "eventExp": 748221
      },
      {
        "map": "abyss_04",
        "name": "Purple Ferus",
        "normalExp": 243162,
        "eventExp": 729486
      },
      {
        "map": "abyss_04",
        "name": "Black Acidus",
        "normalExp": 246822,
        "eventExp": 740466
      },
      {
        "map": "abyss_04",
        "name": "Silver Acidus",
        "normalExp": 246822,
        "eventExp": 740466
      },
      {
        "map": "ein_dun03",
        "name": "Green Mineral",
        "normalExp": 173979,
        "eventExp": 521937
      },
      {
        "map": "ein_dun03",
        "name": "Purple Mineral",
        "normalExp": 173967,
        "eventExp": 521901
      },
      {
        "map": "ein_dun03",
        "name": "Red Mineral",
        "normalExp": 173979,
        "eventExp": 521937
      },
      {
        "map": "ein_dun03",
        "name": "White Mineral",
        "normalExp": 174013,
        "eventExp": 522039
      },
      {
        "map": "ein_dun03",
        "name": "Poisonous",
        "normalExp": 171935,
        "eventExp": 515805
      },
      {
        "map": "ein_dun03",
        "name": "White Porcellio",
        "normalExp": 171666,
        "eventExp": 514998
      },
      {
        "map": "ein_dun03",
        "name": "Toxious",
        "normalExp": 171968,
        "eventExp": 515904
      },
      {
        "map": "clock_01",
        "name": "Sieglouse",
        "normalExp": 742800,
        "eventExp": 2228400
      },
      {
        "map": "clock_01",
        "name": "Erzsebet",
        "normalExp": 748788,
        "eventExp": 2246364
      },
      {
        "map": "clock_01",
        "name": "Jennifer",
        "normalExp": 755552,
        "eventExp": 2266656
      },
      {
        "map": "clock_01",
        "name": "General Orc",
        "normalExp": 767150,
        "eventExp": 2301450
      }
    ],
    "amountMaps": [
      "bl_lava",
      "bl_grass",
      "bl_ice",
      "bl_death",
      "bl_temple",
      "bl_venom",
      "bl_soul"
    ],
    "notes": "Varmundt 7 แมพเพิ่มจำนวนมอน x2; EXP เพิ่มเฉพาะมอนในตาราง Spotlight"
  },
  {
    "id": "2026-07-15_spotlight",
    "name": "Spotlight · July",
    "start": "2026-07-15",
    "end": "2026-08-05",
    "sourceUrl": "https://ro.gnjoy.in.th/monster-spotlight-event-15-july-2026/",
    "image": "assets/spotlight/2026-07-15_spotlight.jpg",
    "rules": [
      {
        "map": "tur_d04_i",
        "name": "Ominous Assaulter",
        "normalExp": 54213,
        "eventExp": 216852
      },
      {
        "map": "tur_d04_i",
        "name": "Ominous Solider",
        "normalExp": 59190,
        "eventExp": 236760
      },
      {
        "map": "tur_d04_i",
        "name": "Ominous Heater",
        "normalExp": 52699,
        "eventExp": 210796
      },
      {
        "map": "prt_mz03_i",
        "name": "Chaos Hunter Fly",
        "normalExp": 95008,
        "eventExp": 380032
      },
      {
        "map": "prt_mz03_i",
        "name": "Chaos Side Winder",
        "normalExp": 95635,
        "eventExp": 382540
      },
      {
        "map": "prt_mz03_i",
        "name": "Chaos Baphomet Jr",
        "normalExp": 96161,
        "eventExp": 384644
      },
      {
        "map": "prt_mz03_i",
        "name": "Chaos Killer Mantis",
        "normalExp": 96197,
        "eventExp": 384788
      },
      {
        "map": "jor_dun01",
        "name": "Primitive Rgan",
        "normalExp": 318751,
        "eventExp": 956253
      },
      {
        "map": "jor_dun01",
        "name": "Lowest Rgan",
        "normalExp": 333500,
        "eventExp": 1000500
      },
      {
        "map": "jor_dun02",
        "name": "Junior Rgan",
        "normalExp": 346392,
        "eventExp": 1039176
      },
      {
        "map": "jor_dun02",
        "name": "Intermediate Rgan",
        "normalExp": 353963,
        "eventExp": 1061889
      },
      {
        "map": "prt_fild05",
        "name": "Hornet",
        "normalExp": 158,
        "eventExp": 632
      },
      {
        "map": "pay_fild09",
        "name": "Horn",
        "normalExp": 259,
        "eventExp": 1036
      },
      {
        "map": "gef_fild11",
        "name": "Goblin",
        "normalExp": 379,
        "eventExp": 1516
      },
      {
        "map": "mjolnir_12",
        "name": "Dustiness",
        "normalExp": 576,
        "eventExp": 2304
      },
      {
        "map": "mjolnir_12",
        "name": "Hunter Fly",
        "normalExp": 588,
        "eventExp": 2352
      },
      {
        "map": "bra_fild01",
        "name": "Toucan",
        "normalExp": 677,
        "eventExp": 2708
      },
      {
        "map": "bra_fild01",
        "name": "Headless Mule",
        "normalExp": 869,
        "eventExp": 3476
      },
      {
        "map": "hu_fild01",
        "name": "Novus",
        "normalExp": 1103,
        "eventExp": 4412
      },
      {
        "map": "gl_dun01",
        "name": "Sting",
        "normalExp": 1685,
        "eventExp": 6740
      },
      {
        "map": "gl_dun01",
        "name": "Arclouze",
        "normalExp": 1937,
        "eventExp": 7748
      },
      {
        "map": "gl_knt02",
        "name": "Raydric",
        "normalExp": 2246,
        "eventExp": 8984
      },
      {
        "map": "gl_knt02",
        "name": "Khalitzburg",
        "normalExp": 2866,
        "eventExp": 11464
      },
      {
        "map": "ra_san03",
        "name": "Hodremlin",
        "normalExp": 3071,
        "eventExp": 12284
      },
      {
        "map": "ra_san04",
        "name": "Echio",
        "normalExp": 3639,
        "eventExp": 14556
      },
      {
        "map": "ra_san05",
        "name": "Agav",
        "normalExp": 3689,
        "eventExp": 14756
      },
      {
        "map": "lhz_dun04",
        "name": "Randel Lawrence",
        "normalExp": 32367,
        "eventExp": 129468
      },
      {
        "map": "lhz_dun04",
        "name": "Flamel Emure",
        "normalExp": 26397,
        "eventExp": 105588
      },
      {
        "map": "lhz_dun04",
        "name": "Celia Alde",
        "normalExp": 22107,
        "eventExp": 88428
      },
      {
        "map": "lhz_dun04",
        "name": "Chen Liu",
        "normalExp": 25684,
        "eventExp": 102736
      },
      {
        "map": "lhz_dun04",
        "name": "Gertie",
        "normalExp": 24267,
        "eventExp": 97068
      },
      {
        "map": "lhz_dun04",
        "name": "Alphoccio",
        "normalExp": 22192,
        "eventExp": 88768
      },
      {
        "map": "lhz_dun04",
        "name": "Trentini",
        "normalExp": 15995,
        "eventExp": 63980
      },
      {
        "map": "iz_d04_i",
        "name": "Abysmal Merman",
        "normalExp": 30378,
        "eventExp": 121512
      },
      {
        "map": "iz_d04_i",
        "name": "Abysmal Obeaune",
        "normalExp": 30621,
        "eventExp": 122484
      },
      {
        "map": "iz_d04_i",
        "name": "Abysmal Deviace",
        "normalExp": 31352,
        "eventExp": 125408
      },
      {
        "map": "gef_fild11",
        "name": "Goblin",
        "normalExp": 344,
        "eventExp": 1376
      },
      {
        "map": "hu_fild01",
        "name": "Novus",
        "normalExp": 1002,
        "eventExp": 4008
      },
      {
        "map": "iz_d05_i",
        "name": "Abysmal Swordfish",
        "normalExp": 199827,
        "eventExp": 599481
      },
      {
        "map": "iz_d05_i",
        "name": "Abysmal Phen",
        "normalExp": 193144,
        "eventExp": 579432
      },
      {
        "map": "iz_d05_i",
        "name": "Abysmal Strouf",
        "normalExp": 197828,
        "eventExp": 593484
      },
      {
        "map": "iz_d05_i",
        "name": "Abysmal King Dramoh",
        "normalExp": 207713,
        "eventExp": 623139
      },
      {
        "map": "amicitia2",
        "name": "Lavaeter",
        "normalExp": 317899,
        "eventExp": 953697
      },
      {
        "map": "amicitia2",
        "name": "Fulgor",
        "normalExp": 314774,
        "eventExp": 944322
      },
      {
        "map": "amicitia2",
        "name": "Napeo",
        "normalExp": 315666,
        "eventExp": 946998
      },
      {
        "map": "amicitia2",
        "name": "Galensis",
        "normalExp": 316687,
        "eventExp": 950061
      },
      {
        "map": "nif_dun02",
        "name": "Grote",
        "normalExp": 346622,
        "eventExp": 1039866
      },
      {
        "map": "nif_dun02",
        "name": "Disguiser",
        "normalExp": 335956,
        "eventExp": 1007868
      },
      {
        "map": "nif_dun02",
        "name": "Blue Moon Loli Ruri",
        "normalExp": 339785,
        "eventExp": 1019355
      },
      {
        "map": "nif_dun02",
        "name": "Pierrotzoist",
        "normalExp": 339451,
        "eventExp": 1018353
      },
      {
        "map": "ra_pol01",
        "name": "Burning Night",
        "normalExp": 1065428,
        "eventExp": 2130856
      },
      {
        "map": "ra_pol01",
        "name": "Deadween",
        "normalExp": 1054194,
        "eventExp": 2108388
      },
      {
        "map": "ra_pol01",
        "name": "Deadsera",
        "normalExp": 995893,
        "eventExp": 1991786
      },
      {
        "map": "ra_pol01",
        "name": "Hardrock Titan",
        "normalExp": 1023843,
        "eventExp": 2047686
      },
      {
        "map": "mjo_wst01",
        "name": "Aferde",
        "normalExp": 1027707,
        "eventExp": 2055414
      },
      {
        "map": "mjo_wst01",
        "name": "Dispol",
        "normalExp": 1039283,
        "eventExp": 2078566
      },
      {
        "map": "mjo_wst01",
        "name": "Punch Bug",
        "normalExp": 999230,
        "eventExp": 1998460
      },
      {
        "map": "mjo_wst01",
        "name": "Timbers",
        "normalExp": 1043994,
        "eventExp": 2087988
      }
    ],
    "amountMaps": [],
    "notes": "เพิ่ม EXP เฉพาะมอนสเตอร์และแมพที่ระบุในประกาศ"
  },
  {
    "id": "2026-08-26_spotlight",
    "name": "Spotlight · August",
    "start": "2026-08-26",
    "end": "2026-09-23",
    "sourceUrl": "https://ro.gnjoy.in.th/monster-spotlight-event-26-august-2026/",
    "image": "assets/spotlight/2026-08-26_spotlight.jpg",
    "rules": [
      {
        "map": "oz_dun01",
        "name": "Rakehand",
        "normalExp": 108187,
        "eventExp": 324561
      },
      {
        "map": "oz_dun01",
        "name": "Ash Toad",
        "normalExp": 109122,
        "eventExp": 327366
      },
      {
        "map": "oz_dun01",
        "name": "Spark",
        "normalExp": 154226,
        "eventExp": 462678
      },
      {
        "map": "tha_t11",
        "name": "Empathizer",
        "normalExp": 252562,
        "eventExp": 757686
      },
      {
        "map": "tha_t11",
        "name": "Smile Giver",
        "normalExp": 253895,
        "eventExp": 761685
      },
      {
        "map": "tha_t11",
        "name": "Pray Giver",
        "normalExp": 256381,
        "eventExp": 769143
      },
      {
        "map": "bl_temple",
        "name": "Temple Rudo",
        "normalExp": 1360016,
        "eventExp": 2720032
      },
      {
        "map": "bl_temple",
        "name": "Temple Arc Angeling",
        "normalExp": 1357745,
        "eventExp": 2715490
      },
      {
        "map": "bl_temple",
        "name": "Temple False Angel",
        "normalExp": 1360833,
        "eventExp": 2721666
      },
      {
        "map": "bl_temple",
        "name": "Temple Plasma",
        "normalExp": 1374116,
        "eventExp": 2748232
      },
      {
        "map": "bl_temple",
        "name": "Temple Solace",
        "normalExp": 1384784,
        "eventExp": 2769568
      },
      {
        "map": "bl_temple",
        "name": "Temple Anopheles",
        "normalExp": 1348511,
        "eventExp": 2697022
      },
      {
        "map": "bl_temple",
        "name": "Temple Gryphon",
        "normalExp": 1405103,
        "eventExp": 2810206
      },
      {
        "map": "mjo_wst01",
        "name": "Punch Bug",
        "normalExp": 1998460,
        "eventExp": 3996920
      },
      {
        "map": "mjo_wst01",
        "name": "Dispol",
        "normalExp": 2078566,
        "eventExp": 4157132
      },
      {
        "map": "mjo_wst01",
        "name": "Aferde",
        "normalExp": 2055414,
        "eventExp": 4110828
      },
      {
        "map": "mjo_wst01",
        "name": "Timbers",
        "normalExp": 2087988,
        "eventExp": 4175976
      },
      {
        "map": "gef_fild04",
        "name": "Mandragora",
        "normalExp": 170,
        "eventExp": 680
      },
      {
        "map": "moc_fild02",
        "name": "Peco Peco",
        "normalExp": 204,
        "eventExp": 816
      },
      {
        "map": "gef_fild10",
        "name": "Orc Baby",
        "normalExp": 352,
        "eventExp": 1408
      },
      {
        "map": "gef_fild10",
        "name": "Orc Warrior",
        "normalExp": 361,
        "eventExp": 1444
      },
      {
        "map": "moc_pryd03",
        "name": "Mummy",
        "normalExp": 512,
        "eventExp": 2048
      },
      {
        "map": "moc_pryd03",
        "name": "Verit",
        "normalExp": 479,
        "eventExp": 1916
      },
      {
        "map": "gl_church",
        "name": "Evil Druid",
        "normalExp": 955,
        "eventExp": 3820
      },
      {
        "map": "gl_church",
        "name": "Wraith",
        "normalExp": 906,
        "eventExp": 3624
      },
      {
        "map": "slabw01",
        "name": "Human Chimera",
        "normalExp": 3798,
        "eventExp": 15192
      },
      {
        "map": "slabw01",
        "name": "Material Chimera",
        "normalExp": 3798,
        "eventExp": 15192
      },
      {
        "map": "odin_tem02",
        "name": "Skogul",
        "normalExp": 3639,
        "eventExp": 14556
      },
      {
        "map": "odin_tem02",
        "name": "Frus",
        "normalExp": 3689,
        "eventExp": 14756
      },
      {
        "map": "lasa_dun03",
        "name": "Charge Basilisk",
        "normalExp": 12815,
        "eventExp": 51260
      },
      {
        "map": "lasa_dun03",
        "name": "Fruit Pom Spider",
        "normalExp": 8809,
        "eventExp": 35236
      },
      {
        "map": "com_d02_i",
        "name": "Ancient Wootan Shooter",
        "normalExp": 76669,
        "eventExp": 306676
      },
      {
        "map": "com_d02_i",
        "name": "Ancient Stone Shooter",
        "normalExp": 75621,
        "eventExp": 302484
      },
      {
        "map": "com_d02_i",
        "name": "Ancient Wootan Fighter",
        "normalExp": 79225,
        "eventExp": 316900
      },
      {
        "map": "jor_back3",
        "name": "Calmaring",
        "normalExp": 275888,
        "eventExp": 827664
      },
      {
        "map": "jor_back3",
        "name": "Limacina",
        "normalExp": 302265,
        "eventExp": 906795
      },
      {
        "map": "jor_back2",
        "name": "Unfrost Flower",
        "normalExp": 295309,
        "eventExp": 885927
      },
      {
        "map": "jor_back6",
        "name": "Susp. Awin Sp. Private",
        "normalExp": 421114,
        "eventExp": 1263342
      },
      {
        "map": "jor_back6",
        "name": "Bear Bug",
        "normalExp": 586912,
        "eventExp": 1760736
      },
      {
        "map": "jor_back6",
        "name": "Armored Copo",
        "normalExp": 593294,
        "eventExp": 1779882
      },
      {
        "map": "jor_back6",
        "name": "Icewind",
        "normalExp": 604691,
        "eventExp": 1814073
      },
      {
        "map": "jor_root3",
        "name": "Melibe Slug",
        "normalExp": 619701,
        "eventExp": 1859103
      },
      {
        "map": "jor_root3",
        "name": "Jormungandr Sanctuary Cleaner",
        "normalExp": 625452,
        "eventExp": 1876356
      }
    ],
    "amountMaps": [],
    "notes": "mjo_wst01 ใช้ Event EXP ตามประกาศ August ซึ่งลงฐานสูงกว่า June/July"
  },
  {
    "id": "2026-09-23_triple_exp_double_monster",
    "name": "Triple EXP & Double Monster · Sep 2026",
    "start": "2026-09-23",
    "end": "2026-10-21",
    "sourceUrl": "https://ro.gnjoy.in.th/triple-exp-double-monster-event-23-sep-2026/",
    "sourceImageUrl": "https://img.gnjoy.in.th/2026/09/60b2bf6244-scaled.jpg",
    "image": "assets/spotlight/2026-09-23_triple_exp.jpg",
    "notes": "EXP ตามตารางภาพประกาศ: มอนที่ระบุได้ 3x หรือ 2x ตามแถว; จำนวนเกิดช่วงกิจกรรมใช้ค่ารายมอนใน 5 แมพจากตาราง HTML ไม่ใช่ x2 ทั้งแมพ",
    "rules": [
      {
        "map": "prt_fild05",
        "name": "Hornet",
        "normalExp": 158,
        "eventExp": 474
      },
      {
        "map": "prt_sewb2",
        "name": "Tarou",
        "normalExp": 192,
        "eventExp": 576
      },
      {
        "map": "pay_dun01",
        "name": "Soldier Skeleton",
        "normalExp": 284,
        "eventExp": 852
      },
      {
        "map": "mjo_dun03",
        "name": "Skeleton Worker",
        "normalExp": 378,
        "eventExp": 1134
      },
      {
        "map": "cmd_fild01",
        "name": "Grove",
        "normalExp": 489,
        "eventExp": 1467
      },
      {
        "map": "mjolnir_04",
        "name": "Driller",
        "normalExp": 642,
        "eventExp": 1926
      },
      {
        "map": "mjolnir_05",
        "name": "Argiope",
        "normalExp": 794,
        "eventExp": 2382
      },
      {
        "map": "gl_prison",
        "name": "Zombie Prisoner",
        "normalExp": 1194,
        "eventExp": 3582
      },
      {
        "map": "gl_prison",
        "name": "Skeleton Prisoner",
        "normalExp": 1342,
        "eventExp": 4026
      },
      {
        "map": "ra_fild05",
        "name": "Mace Kobold",
        "normalExp": 1545,
        "eventExp": 4635
      },
      {
        "map": "ra_fild05",
        "name": "Hammer Kobold",
        "normalExp": 1565,
        "eventExp": 4695
      },
      {
        "map": "ra_fild05",
        "name": "Axe Kobold",
        "normalExp": 1845,
        "eventExp": 5535
      },
      {
        "map": "moc_prydn1",
        "name": "Verit (Nightmare)",
        "normalExp": 2470,
        "eventExp": 7410
      },
      {
        "map": "moc_prydn1",
        "name": "Minorous (Nightmare)",
        "normalExp": 3047,
        "eventExp": 9141
      },
      {
        "map": "abyss_02",
        "name": "Red Ferus",
        "normalExp": 3639,
        "eventExp": 10917
      },
      {
        "map": "abyss_02",
        "name": "Blue Acidus",
        "normalExp": 3739,
        "eventExp": 11217
      },
      {
        "map": "abyss_02",
        "name": "Gold Acidus",
        "normalExp": 3739,
        "eventExp": 11217
      },
      {
        "map": "lasa_dun02",
        "name": "Charge Basilisk",
        "normalExp": 10679,
        "eventExp": 32037
      },
      {
        "map": "lasa_dun02",
        "name": "Jungle Mandragora",
        "normalExp": 11100,
        "eventExp": 33300
      },
      {
        "map": "iz_d04_i",
        "name": "Abyssmal Sropho",
        "normalExp": 30314,
        "eventExp": 90942
      },
      {
        "map": "iz_d04_i",
        "name": "Abyssmal Merman",
        "normalExp": 30378,
        "eventExp": 91134
      },
      {
        "map": "iz_d04_i",
        "name": "Abyssmal Marse",
        "normalExp": 30163,
        "eventExp": 90489
      },
      {
        "map": "iz_d04_i",
        "name": "Abyssmal Obeaune",
        "normalExp": 30621,
        "eventExp": 91863
      },
      {
        "map": "iz_d04_i",
        "name": "Abyssmal Deviace",
        "normalExp": 31352,
        "eventExp": 94056
      },
      {
        "map": "tur_d04_i",
        "name": "Ominous Permeter",
        "normalExp": 50806,
        "eventExp": 152418
      },
      {
        "map": "tur_d04_i",
        "name": "Ominous Freezer",
        "normalExp": 54892,
        "eventExp": 164676
      },
      {
        "map": "tur_d04_i",
        "name": "Ominous Assaulter",
        "normalExp": 54213,
        "eventExp": 162639
      },
      {
        "map": "tur_d04_i",
        "name": "Ominous Solider",
        "normalExp": 59190,
        "eventExp": 177570
      },
      {
        "map": "tur_d04_i",
        "name": "Ominous Heater",
        "normalExp": 52699,
        "eventExp": 158097
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Andre Larva",
        "normalExp": 64798,
        "eventExp": 194394
      },
      {
        "map": "ant_d02_i",
        "name": "Intrepid Familiar",
        "normalExp": 79844,
        "eventExp": 239532
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Andre",
        "normalExp": 96141,
        "eventExp": 288423
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Deniro",
        "normalExp": 81114,
        "eventExp": 243342
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Piere",
        "normalExp": 82688,
        "eventExp": 248064
      },
      {
        "map": "ant_d02_i",
        "name": "Intrepid Giearth",
        "normalExp": 81566,
        "eventExp": 244698
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Soldier Andre",
        "normalExp": 83348,
        "eventExp": 250044
      },
      {
        "map": "ant_d02_i",
        "name": "Diligent Vitata",
        "normalExp": 83348,
        "eventExp": 250044
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Explosion",
        "normalExp": 106026,
        "eventExp": 318078
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Earth Deleter",
        "normalExp": 107518,
        "eventExp": 322554
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Kaho",
        "normalExp": 107162,
        "eventExp": 321486
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Sky Deleter",
        "normalExp": 108139,
        "eventExp": 324417
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Lava Golem",
        "normalExp": 111248,
        "eventExp": 333744
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Blazer",
        "normalExp": 110733,
        "eventExp": 332199
      },
      {
        "map": "mag_dun03",
        "name": "Rigid Nightmare Terror",
        "normalExp": 110791,
        "eventExp": 332373
      },
      {
        "map": "ein_dun03",
        "name": "Poisonous",
        "normalExp": 171935,
        "eventExp": 515805
      },
      {
        "map": "ein_dun03",
        "name": "Toxious",
        "normalExp": 171968,
        "eventExp": 515904
      },
      {
        "map": "ein_dun03",
        "name": "White Porcellio",
        "normalExp": 171935,
        "eventExp": 515805
      },
      {
        "map": "ein_dun03",
        "name": "Abyssman",
        "normalExp": 173470,
        "eventExp": 520410
      },
      {
        "map": "ein_dun03",
        "name": "Green Mineral",
        "normalExp": 173979,
        "eventExp": 521937
      },
      {
        "map": "ein_dun03",
        "name": "Purple Mineral",
        "normalExp": 173967,
        "eventExp": 521901
      },
      {
        "map": "ein_dun03",
        "name": "Red Mineral",
        "normalExp": 173979,
        "eventExp": 521937
      },
      {
        "map": "ein_dun03",
        "name": "White Mineral",
        "normalExp": 174013,
        "eventExp": 522039
      },
      {
        "map": "ein_dun03",
        "name": "Jeweliant",
        "normalExp": 174690,
        "eventExp": 524070
      },
      {
        "map": "odin_past",
        "name": "Angelgolt",
        "normalExp": 179251,
        "eventExp": 537753
      },
      {
        "map": "odin_past",
        "name": "Angelgolt",
        "normalExp": 179216,
        "eventExp": 537648
      },
      {
        "map": "odin_past",
        "name": "Spectral Plasma",
        "normalExp": 593192,
        "eventExp": 1779576
      },
      {
        "map": "odin_past",
        "name": "Arch Plasma",
        "normalExp": 596255,
        "eventExp": 1788765
      },
      {
        "map": "odin_past",
        "name": "Holy Frus",
        "normalExp": 183728,
        "eventExp": 551184
      },
      {
        "map": "odin_past",
        "name": "Holy Skogul",
        "normalExp": 184690,
        "eventExp": 554070
      },
      {
        "map": "tha_t12",
        "name": "Horror of Thanatos",
        "normalExp": 253825,
        "eventExp": 761475
      },
      {
        "map": "tha_t12",
        "name": "Regret of Thanatos",
        "normalExp": 255441,
        "eventExp": 766323
      },
      {
        "map": "tha_t12",
        "name": "Anger of Thanatos",
        "normalExp": 256360,
        "eventExp": 769080
      },
      {
        "map": "tha_t12",
        "name": "Book of Death",
        "normalExp": 257633,
        "eventExp": 772899
      },
      {
        "map": "tha_t12",
        "name": "Resentment of Thanatos",
        "normalExp": 258927,
        "eventExp": 776781
      },
      {
        "map": "jor_back1",
        "name": "Ice Gangu",
        "normalExp": 269913,
        "eventExp": 809739
      },
      {
        "map": "jor_back1",
        "name": "Shining Seaweed",
        "normalExp": 282625,
        "eventExp": 847875
      },
      {
        "map": "jor_back1",
        "name": "Ice Straw",
        "normalExp": 293285,
        "eventExp": 879855
      },
      {
        "map": "jor_back4",
        "name": "Snow Rabbit Slug",
        "normalExp": 380041,
        "eventExp": 760082
      },
      {
        "map": "jor_back4",
        "name": "Angel Iceslug",
        "normalExp": 401573,
        "eventExp": 803146
      },
      {
        "map": "jor_back4",
        "name": "Susp. Awin Pvt. 1st Class",
        "normalExp": 402725,
        "eventExp": 805450
      },
      {
        "map": "jor_back4",
        "name": "Susp. Awin Corporal",
        "normalExp": 410942,
        "eventExp": 821884
      },
      {
        "map": "jor_back4",
        "name": "Susp. Awin Sp. Private",
        "normalExp": 421114,
        "eventExp": 842228
      },
      {
        "map": "jor_back6",
        "name": "Armored Copo",
        "normalExp": 593294,
        "eventExp": 1186588
      },
      {
        "map": "jor_back6",
        "name": "Bear Bug",
        "normalExp": 586912,
        "eventExp": 1173824
      },
      {
        "map": "jor_back6",
        "name": "Icewind",
        "normalExp": 604691,
        "eventExp": 1209382
      },
      {
        "map": "ra_pol01",
        "name": "Deadsera",
        "normalExp": 1991786,
        "eventExp": 3983572
      },
      {
        "map": "ra_pol01",
        "name": "Hardrock Titan",
        "normalExp": 2047686,
        "eventExp": 4095372
      },
      {
        "map": "ra_pol01",
        "name": "Deadween",
        "normalExp": 2108388,
        "eventExp": 4216776
      },
      {
        "map": "ra_pol01",
        "name": "Burning Night",
        "normalExp": 2130856,
        "eventExp": 4261712
      },
      {
        "map": "mjo_wst01",
        "name": "Punch Bug",
        "normalExp": 1998460,
        "eventExp": 3996920
      },
      {
        "map": "mjo_wst01",
        "name": "Dispol",
        "normalExp": 2078566,
        "eventExp": 4157132
      },
      {
        "map": "mjo_wst01",
        "name": "Aferde",
        "normalExp": 2055414,
        "eventExp": 4110828
      },
      {
        "map": "mjo_wst01",
        "name": "Timbers",
        "normalExp": 2087988,
        "eventExp": 4175976
      }
    ],
    "amountMaps": [],
    "spawnCounts": [
      {
        "map": "nif_dun01",
        "name": "Gan Ceann",
        "amount": 90
      },
      {
        "map": "nif_dun01",
        "name": "Brutal Murderer",
        "amount": 90
      },
      {
        "map": "nif_dun01",
        "name": "Ghost Cube",
        "amount": 90
      },
      {
        "map": "nif_dun01",
        "name": "Lude Gal",
        "amount": 90
      },
      {
        "map": "amicitia2",
        "name": "Lavaeter",
        "amount": 110
      },
      {
        "map": "amicitia2",
        "name": "Fulgor",
        "amount": 110
      },
      {
        "map": "amicitia2",
        "name": "Napeo",
        "amount": 110
      },
      {
        "map": "amicitia2",
        "name": "Galensis",
        "amount": 110
      },
      {
        "map": "bl_death",
        "name": "Ancient Mummy of Death",
        "amount": 60
      },
      {
        "map": "bl_death",
        "name": "Lude of Death",
        "amount": 70
      },
      {
        "map": "bl_death",
        "name": "Ragged Zombie of Death",
        "amount": 60
      },
      {
        "map": "bl_death",
        "name": "Wraith of Death",
        "amount": 70
      },
      {
        "map": "bl_death",
        "name": "Flame Skull of Fire",
        "amount": 70
      },
      {
        "map": "bl_death",
        "name": "Banshee of Death",
        "amount": 90
      },
      {
        "map": "bl_death",
        "name": "Knight of Abyss in Death",
        "amount": 30
      },
      {
        "map": "bl_temple",
        "name": "Temple Rudo",
        "amount": 70
      },
      {
        "map": "bl_temple",
        "name": "Temple Arc Angeling",
        "amount": 80
      },
      {
        "map": "bl_temple",
        "name": "Temple False Angel",
        "amount": 80
      },
      {
        "map": "bl_temple",
        "name": "Temple Plasma",
        "amount": 50
      },
      {
        "map": "bl_temple",
        "name": "Temple Solace",
        "amount": 80
      },
      {
        "map": "bl_temple",
        "name": "Temple Anopheles",
        "amount": 20
      },
      {
        "map": "bl_temple",
        "name": "Temple Gryphon",
        "amount": 40
      },
      {
        "map": "bl_lava",
        "name": "Explosion of Fire",
        "amount": 80
      },
      {
        "map": "bl_lava",
        "name": "Deleter of Fire(Sky)",
        "amount": 80
      },
      {
        "map": "bl_lava",
        "name": "Jakk of Fire",
        "amount": 60
      },
      {
        "map": "bl_lava",
        "name": "Lava Golem of Fire",
        "amount": 70
      },
      {
        "map": "bl_lava",
        "name": "Majoruros of Fire",
        "amount": 60
      },
      {
        "map": "bl_lava",
        "name": "Hydrolancer of Fire",
        "amount": 30
      },
      {
        "map": "bl_lava",
        "name": "Acidus of Fire",
        "amount": 70
      }
    ],
    "label": "EXP Event"
  }
];
