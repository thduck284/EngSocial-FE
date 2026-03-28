/**
 * Bảng XP / level (dữ liệu tĩnh — gamification).
 * Đặt trong `data/` cùng họ với mock từ vựng; import: `../data/levelXp` hoặc `@/data/levelXp`.
 *
 * Khi exp hiện tại >= LEVEL_[levelTiếpTheo] thì: level += 1, exp = exp - LEVEL_[levelMới].
 * VD: user level 1, exp 250. 250 >= LEVEL_2 (100) → level = 2, exp = 150.
 *     150 >= LEVEL_3 (150) → level = 3, exp = 0.
 */
export const LEVEL_1 = 0
export const LEVEL_2 = 100
export const LEVEL_3 = 150
export const LEVEL_4 = 200
export const LEVEL_5 = 250
export const LEVEL_6 = 300
export const LEVEL_7 = 350
export const LEVEL_8 = 400
export const LEVEL_9 = 450
export const LEVEL_10 = 500
export const LEVEL_11 = 550
export const LEVEL_12 = 600
export const LEVEL_13 = 650
export const LEVEL_14 = 700
export const LEVEL_15 = 750
export const LEVEL_16 = 800
export const LEVEL_17 = 850
export const LEVEL_18 = 900
export const LEVEL_19 = 950
export const LEVEL_20 = 1000
export const LEVEL_21 = 1050
export const LEVEL_22 = 1100
export const LEVEL_23 = 1150
export const LEVEL_24 = 1200
export const LEVEL_25 = 1250
export const LEVEL_26 = 1300
export const LEVEL_27 = 1350
export const LEVEL_28 = 1400
export const LEVEL_29 = 1450
export const LEVEL_30 = 1500
export const LEVEL_31 = 1550
export const LEVEL_32 = 1600
export const LEVEL_33 = 1650
export const LEVEL_34 = 1700
export const LEVEL_35 = 1750
export const LEVEL_36 = 1800
export const LEVEL_37 = 1850
export const LEVEL_38 = 1900
export const LEVEL_39 = 1950
export const LEVEL_40 = 2000
export const LEVEL_41 = 2050
export const LEVEL_42 = 2100
export const LEVEL_43 = 2150
export const LEVEL_44 = 2200
export const LEVEL_45 = 2250
export const LEVEL_46 = 2300
export const LEVEL_47 = 2350
export const LEVEL_48 = 2400
export const LEVEL_49 = 2450
export const LEVEL_50 = 2500
export const LEVEL_51 = 2550
export const LEVEL_52 = 2600
export const LEVEL_53 = 2650
export const LEVEL_54 = 2700
export const LEVEL_55 = 2750
export const LEVEL_56 = 2800
export const LEVEL_57 = 2850
export const LEVEL_58 = 2900
export const LEVEL_59 = 2950
export const LEVEL_60 = 3000
export const LEVEL_61 = 3050
export const LEVEL_62 = 3100
export const LEVEL_63 = 3150
export const LEVEL_64 = 3200
export const LEVEL_65 = 3250
export const LEVEL_66 = 3300
export const LEVEL_67 = 3350
export const LEVEL_68 = 3400
export const LEVEL_69 = 3450
export const LEVEL_70 = 3500
export const LEVEL_71 = 3550
export const LEVEL_72 = 3600
export const LEVEL_73 = 3650
export const LEVEL_74 = 3700
export const LEVEL_75 = 3750
export const LEVEL_76 = 3800
export const LEVEL_77 = 3850
export const LEVEL_78 = 3900
export const LEVEL_79 = 3950
export const LEVEL_80 = 4000
export const LEVEL_81 = 4050
export const LEVEL_82 = 4100
export const LEVEL_83 = 4150
export const LEVEL_84 = 4200
export const LEVEL_85 = 4250
export const LEVEL_86 = 4300
export const LEVEL_87 = 4350
export const LEVEL_88 = 4400
export const LEVEL_89 = 4450
export const LEVEL_90 = 4500
export const LEVEL_91 = 4550
export const LEVEL_92 = 4600
export const LEVEL_93 = 4650
export const LEVEL_94 = 4700
export const LEVEL_95 = 4750
export const LEVEL_96 = 4800
export const LEVEL_97 = 4850
export const LEVEL_98 = 4900
export const LEVEL_99 = 4950
export const LEVEL_100 = 5000

/** XP cần để lên level tiếp theo (level 1→2 = LEVEL_2, 2→3 = LEVEL_3, ...). Dùng getLevelXp(level) khi level = 2..100. */
export const LEVEL_XP = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
  4: LEVEL_4,
  5: LEVEL_5,
  6: LEVEL_6,
  7: LEVEL_7,
  8: LEVEL_8,
  9: LEVEL_9,
  10: LEVEL_10,
  11: LEVEL_11,
  12: LEVEL_12,
  13: LEVEL_13,
  14: LEVEL_14,
  15: LEVEL_15,
  16: LEVEL_16,
  17: LEVEL_17,
  18: LEVEL_18,
  19: LEVEL_19,
  20: LEVEL_20,
  21: LEVEL_21,
  22: LEVEL_22,
  23: LEVEL_23,
  24: LEVEL_24,
  25: LEVEL_25,
  26: LEVEL_26,
  27: LEVEL_27,
  28: LEVEL_28,
  29: LEVEL_29,
  30: LEVEL_30,
  31: LEVEL_31,
  32: LEVEL_32,
  33: LEVEL_33,
  34: LEVEL_34,
  35: LEVEL_35,
  36: LEVEL_36,
  37: LEVEL_37,
  38: LEVEL_38,
  39: LEVEL_39,
  40: LEVEL_40,
  41: LEVEL_41,
  42: LEVEL_42,
  43: LEVEL_43,
  44: LEVEL_44,
  45: LEVEL_45,
  46: LEVEL_46,
  47: LEVEL_47,
  48: LEVEL_48,
  49: LEVEL_49,
  50: LEVEL_50,
  51: LEVEL_51,
  52: LEVEL_52,
  53: LEVEL_53,
  54: LEVEL_54,
  55: LEVEL_55,
  56: LEVEL_56,
  57: LEVEL_57,
  58: LEVEL_58,
  59: LEVEL_59,
  60: LEVEL_60,
  61: LEVEL_61,
  62: LEVEL_62,
  63: LEVEL_63,
  64: LEVEL_64,
  65: LEVEL_65,
  66: LEVEL_66,
  67: LEVEL_67,
  68: LEVEL_68,
  69: LEVEL_69,
  70: LEVEL_70,
  71: LEVEL_71,
  72: LEVEL_72,
  73: LEVEL_73,
  74: LEVEL_74,
  75: LEVEL_75,
  76: LEVEL_76,
  77: LEVEL_77,
  78: LEVEL_78,
  79: LEVEL_79,
  80: LEVEL_80,
  81: LEVEL_81,
  82: LEVEL_82,
  83: LEVEL_83,
  84: LEVEL_84,
  85: LEVEL_85,
  86: LEVEL_86,
  87: LEVEL_87,
  88: LEVEL_88,
  89: LEVEL_89,
  90: LEVEL_90,
  91: LEVEL_91,
  92: LEVEL_92,
  93: LEVEL_93,
  94: LEVEL_94,
  95: LEVEL_95,
  96: LEVEL_96,
  97: LEVEL_97,
  98: LEVEL_98,
  99: LEVEL_99,
  100: LEVEL_100,
}

/**
 * Trả về XP cần để lên từ (level - 1) lên level.
 * VD: getLevelXp(2) = LEVEL_2 = 100 (cần 100 XP để từ level 1 lên 2).
 */
export function getLevelXp(level) {
  return LEVEL_XP[level] ?? 0
}

/**
 * Áp dụng logic lên cấp: nếu exp >= XP của level tiếp theo thì level+1, exp -= XP đó (có thể lặp nhiều cấp).
 * Trả về { level, exp } mới.
 */
export function applyLevelUp(level, exp) {
  let l = Math.max(1, Math.min(100, level))
  let x = Math.max(0, exp)
  while (l < 100) {
    const xpToNext = getLevelXp(l + 1)
    if (xpToNext <= 0 || x < xpToNext) break
    x -= xpToNext
    l += 1
  }
  return { level: l, exp: x }
}
