/**
 * Data Menu SPPG (Satuan Pendidikan Pemangku Gizi)
 * Berisi 10 set menu lengkap dengan informasi nutrisi
 */

export interface SppgNutrition {
  energi: string;
  lemak: string;
  protein: string;
  karbohidrat: string;
  serat: string;
}

export interface SppgMenu {
  no: number;
  daftar_menu: string[];
  kandungan_gizi_porsi_besar: SppgNutrition;
  kandungan_gizi_porsi_kecil: SppgNutrition;
}

export const SPPG_MENUS: SppgMenu[] = [
  {
    no: 1,
    daftar_menu: ["Apel", "Tempe Goreng", "Ayam Goreng", "Gudeg", "Nasi"],
    kandungan_gizi_porsi_besar: {
      energi: "625 kkal",
      lemak: "26 g",
      protein: "18 g",
      karbohidrat: "81 g",
      serat: "5 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "520 kkal",
      lemak: "25 g",
      protein: "17 g",
      karbohidrat: "65 g",
      serat: "5,2 g",
    },
  },
  {
    no: 2,
    daftar_menu: ["Telur Semur isi Pepaya", "Pisang", "Tahu", "Lontong"],
    kandungan_gizi_porsi_besar: {
      energi: "570 kkal",
      lemak: "19 g",
      protein: "20 g",
      karbohidrat: "85 g",
      serat: "3 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "480 kkal",
      lemak: "18 g",
      protein: "19 g",
      karbohidrat: "65 g",
      serat: "2,9 g",
    },
  },
  {
    no: 3,
    daftar_menu: ["Mie", "Sawi", "Ayam Semur Kecap", "Tempe Sagu", "Pisang"],
    kandungan_gizi_porsi_besar: {
      energi: "645 kkal",
      lemak: "25 g",
      protein: "15 g",
      karbohidrat: "95 g",
      serat: "6 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "525 kkal",
      lemak: "22 g",
      protein: "13 g",
      karbohidrat: "75 g",
      serat: "5 g",
    },
  },
  {
    no: 4,
    daftar_menu: ["Apel", "Kacang Merah", "Telur", "Fla Susu", "Jagung"],
    kandungan_gizi_porsi_besar: {
      energi: "560 kkal",
      lemak: "19 g",
      protein: "21 g",
      karbohidrat: "90 g",
      serat: "8 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "425 kkal",
      lemak: "19 g",
      protein: "19 g",
      karbohidrat: "70 g",
      serat: "6 g",
    },
  },
  {
    no: 5,
    daftar_menu: ["Tahu", "Tumis Koll Wortel", "Telur Semur", "Kelengkeng", "Nasi"],
    kandungan_gizi_porsi_besar: {
      energi: "630 kkal",
      lemak: "19 g",
      protein: "20 g",
      karbohidrat: "95 g",
      serat: "2,3 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "522 kkal",
      lemak: "18 g",
      protein: "19 g",
      karbohidrat: "75 g",
      serat: "2,2 g",
    },
  },
  {
    no: 6,
    daftar_menu: ["Salad Buah", "Tempe Goreng", "Rolade Asam Manis", "Capcay", "Nasi"],
    kandungan_gizi_porsi_besar: {
      energi: "673 kkal",
      lemak: "22 g",
      protein: "20 g",
      karbohidrat: "101 g",
      serat: "3,2 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "583 kkal",
      lemak: "21 g",
      protein: "19 g",
      karbohidrat: "81 g",
      serat: "3,1 g",
    },
  },
  {
    no: 7,
    daftar_menu: ["Nasi", "Anggur", "Tumis Keciwis", "Tahu", "Lele Crispiy"],
    kandungan_gizi_porsi_besar: {
      energi: "556 kkal",
      lemak: "15 g",
      protein: "18 g",
      karbohidrat: "85 g",
      serat: "7 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "445 kkal",
      lemak: "15 g",
      protein: "17 g",
      karbohidrat: "64 g",
      serat: "5 g",
    },
  },
  {
    no: 8,
    daftar_menu: ["Ketimun dan Selada", "Anggur", "Chicken Katsu", "Keju", "Roti"],
    kandungan_gizi_porsi_besar: {
      energi: "554 kkal",
      lemak: "26 g",
      protein: "19 g",
      karbohidrat: "60 g",
      serat: "4 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "254 kkal",
      lemak: "26 g",
      protein: "16 g",
      karbohidrat: "40 g",
      serat: "3 g",
    },
  },
  {
    no: 9,
    daftar_menu: ["Nasi Daun Jeruk", "Ketimun dan Selada", "Ayam Serundeng", "Pepes Tahu", "Pisang Lampung"],
    kandungan_gizi_porsi_besar: {
      energi: "587 kkal",
      lemak: "24 g",
      protein: "18 g",
      karbohidrat: "78 g",
      serat: "5 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "474 kkal",
      lemak: "22 g",
      protein: "15 g",
      karbohidrat: "60 g",
      serat: "4 g",
    },
  },
  {
    no: 10,
    daftar_menu: ["Jeruk", "Tahu Crispy", "Bakso Saus BBQ", "Acar Timun Wortel", "Kwetiaw"],
    kandungan_gizi_porsi_besar: {
      energi: "595 kkal",
      lemak: "30 g",
      protein: "20 g",
      karbohidrat: "65 g",
      serat: "4 g",
    },
    kandungan_gizi_porsi_kecil: {
      energi: "495 kkal",
      lemak: "25 g",
      protein: "17 g",
      karbohidrat: "55 g",
      serat: "3 g",
    },
  },
];

/**
 * Parse nutrition string like "625 kkal" or "26 g" to number
 */
export function parseNutritionValue(value: string): number {
  const match = value.match(/[\d,]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(",", "."));
}

/**
 * Match detected food items with SPPG menus
 * Returns match info sorted by match percentage (descending)
 */
export function matchWithSppgMenus(
  detectedItems: string[],
  topN: number = 3
): Array<{
  menu: SppgMenu;
  matchCount: number;
  matchPercentage: number;
  matchedItems: string[];
  unmatchedItems: string[];
}> {
  if (!detectedItems.length) return [];

  const normalizedDetected = detectedItems.map((item) =>
    item.toLowerCase().trim()
  );

  const results = SPPG_MENUS.map((menu) => {
    const normalizedMenuItems = menu.daftar_menu.map((item) =>
      item.toLowerCase().trim()
    );

    const matchedItems: string[] = [];
    const unmatchedItems: string[] = [];

    for (const detected of detectedItems) {
      const normalizedDetected = detected.toLowerCase().trim();
      const found = normalizedMenuItems.some((menuItem) => {
        // Exact match
        if (normalizedDetected === menuItem) return true;
        // Contains match (detected contains menu item or vice versa)
        if (normalizedDetected.includes(menuItem) || menuItem.includes(normalizedDetected))
          return true;
        // Word-based match
        const detectedWords = normalizedDetected.split(/\s+/);
        const menuWords = menuItem.split(/\s+/);
        return detectedWords.some((dw) =>
          menuWords.some((mw) => dw.length > 2 && mw.includes(dw))
        );
      });

      if (found) {
        matchedItems.push(detected);
      } else {
        unmatchedItems.push(detected);
      }
    }

    const matchPercentage =
      normalizedMenuItems.length > 0
        ? Math.round((matchedItems.length / normalizedMenuItems.length) * 100)
        : 0;

    return {
      menu,
      matchCount: matchedItems.length,
      matchPercentage,
      matchedItems,
      unmatchedItems,
    };
  });

  // Sort by match percentage (descending), then by match count
  results.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return b.matchCount - a.matchCount;
  });

  return results.slice(0, topN);
}

// ============================================
// NUTRITION STATUS CHECK
// ============================================

export interface NutritionTarget {
  energi: number;    // kcal
  protein: number;   // gram
  karbohidrat: number; // gram
  lemak: number;     // gram
  serat: number;     // gram
}

export type NutritionStatus = "terpenuhi" | "hampir" | "kurang" | "berlebihan" | "tidak_ada_data";

export interface NutritionCheckResult {
  status: NutritionStatus;
  actual: number;
  target: number;
  percentage: number;
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Default nutrition targets (based on AKG Indonesia)
 * Used as fallback when user-specific data is not available
 * Target makan siang = 33% dari kebutuhan harian
 */
export const DEFAULT_NUTRITION_TARGET: NutritionTarget = {
  energi: 700,       // 2100 × 33%
  protein: 20,        // 60 × 33%
  karbohidrat: 100,   // 300 × 33%
  lemak: 23,          // 70 × 33%
  serat: 10,          // 30 × 33%
};

/**
 * Tolerance ranges for nutrition status
 * - Terpenuhi: actual >= target
 * - Hampir: actual >= 70% of target
 * - Kurang: actual < 70% of target
 */
const TOLERANCE = {
  hampir: 0.70,
};

/**
 * Check single nutrition value against target
 */
export function checkSingleNutrition(
  actual: number,
  target: number
): NutritionCheckResult {
  // Handle zero or missing data
  if (actual === 0 || target === 0) {
    return {
      status: "tidak_ada_data",
      actual,
      target,
      percentage: 0,
      label: "Data tidak tersedia",
      color: "text-gray-400",
      bgColor: "bg-gray-100",
    };
  }

  const percentage = Math.round((actual / target) * 100);

  // Terpenuhi: actual >= target
  if (actual >= target) {
    return {
      status: "terpenuhi",
      actual,
      target,
      percentage,
      label: "Terpenuhi",
      color: "text-green-600",
      bgColor: "bg-green-100",
    };
  }

  // Hampir: actual >= 70% of target
  if (percentage >= TOLERANCE.hampir * 100) {
    return {
      status: "hampir",
      actual,
      target,
      percentage,
      label: "Hampir Terpenuhi",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    };
  }

  // Kurang: actual < 70% of target
  if (percentage < TOLERANCE.hampir * 100) {
    return {
      status: "kurang",
      actual,
      target,
      percentage,
      label: "Kurang",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };
  }

  // Fallback
  return {
    status: "kurang",
    actual,
    target,
    percentage,
    label: "Kurang",
    color: "text-red-600",
    bgColor: "bg-red-100",
  };
}

/**
 * Get status badge configuration
 */
export function getStatusBadge(status: NutritionStatus): {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
} {
  const badges: Record<NutritionStatus, { icon: string; label: string; color: string; bgColor: string }> = {
    terpenuhi: { icon: "✅", label: "Terpenuhi", color: "text-green-600", bgColor: "bg-green-100" },
    hampir: { icon: "⚠️", label: "Hampir", color: "text-amber-600", bgColor: "bg-amber-100" },
    kurang: { icon: "❌", label: "Kurang", color: "text-red-600", bgColor: "bg-red-100" },
    tidak_ada_data: { icon: "❓", label: "Data tidak ada", color: "text-gray-400", bgColor: "bg-gray-100" },
  };
  return badges[status];
}

/**
 * Check all nutrition values for a menu portion
 */
export function checkMenuNutrition(
  nutrition: SppgNutrition,
  target: NutritionTarget = DEFAULT_NUTRITION_TARGET
): {
  energi: NutritionCheckResult;
  protein: NutritionCheckResult;
  karbohidrat: NutritionCheckResult;
  lemak: NutritionCheckResult;
  serat: NutritionCheckResult;
  overallStatus: NutritionStatus;
  terpenuhiCount: number;
  totalCount: number;
} {
  const energiActual = parseNutritionValue(nutrition.energi);
  const proteinActual = parseNutritionValue(nutrition.protein);
  const karbohidratActual = parseNutritionValue(nutrition.karbohidrat);
  const lemakActual = parseNutritionValue(nutrition.lemak);
  const seratActual = parseNutritionValue(nutrition.serat);

  const energi = checkSingleNutrition(energiActual, target.energi);
  const protein = checkSingleNutrition(proteinActual, target.protein);
  const karbohidrat = checkSingleNutrition(karbohidratActual, target.karbohidrat);
  const lemak = checkSingleNutrition(lemakActual, target.lemak);
  const serat = checkSingleNutrition(seratActual, target.serat);

  // Calculate overall status based on most common status
  const statuses = [energi.status, protein.status, karbohidrat.status, lemak.status, serat.status].filter(
    (s) => s !== "tidak_ada_data"
  );

  let overallStatus: NutritionStatus = "tidak_ada_data";
  if (statuses.length > 0) {
    // Count occurrences
    const counts = statuses.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<NutritionStatus, number>);

    // Priority: terpenuhi > hampir > kurang > berlebihan
    if (counts["terpenuhi"]) overallStatus = "terpenuhi";
    else if (counts["hampir"]) overallStatus = "hampir";
    else if (counts["kurang"]) overallStatus = "kurang";
    else if (counts["berlebihan"]) overallStatus = "berlebihan";
  }

  const terpenuhiCount = statuses.filter((s) => s === "terpenuhi").length;
  const totalCount = statuses.length;

  return {
    energi,
    protein,
    karbohidrat,
    lemak,
    serat,
    overallStatus,
    terpenuhiCount,
    totalCount,
  };
}
