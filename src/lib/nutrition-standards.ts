/**
 * Simple Nutrition Standards Service
 * Returns Indonesian nutrition standards without external service dependency
 */

export interface NutritionStandards {
  daily: {
    energi: number;    // kcal
    protein: number;   // gram
    karbohidrat: number; // gram
    lemak: number;     // gram
    serat: number;     // gram
  };
  portion: {
    besar: {
      energi: number;
      protein: number;
      karbohidrat: number;
      lemak: number;
      serat: number;
    };
    kecil: {
      energi: number;
      protein: number;
      karbohidrat: number;
      lemak: number;
      serat: number;
    };
  };
}

/**
 * Get Indonesian nutrition standards based on recommended daily intake
 */
export function getNutritionStandards(): NutritionStandards {
  return {
    daily: {
      energi: 2100,      // 2100 kcal recommended daily
      protein: 60,       // 60g protein
      karbohidrat: 300,   // 300g carbs
      lemak: 70,         // 70g fat
      serat: 30,         // 30g fiber
    },
    portion: {
      besar: {
        energi: 700,      // ~1/3 of daily
        protein: 20,
        karbohidrat: 100,
        lemak: 23,
        serat: 10,
      },
      kecil: {
        energi: 450,     // ~1/5 of daily
        protein: 13,
        karbohidrat: 65,
        lemak: 15,
        serat: 6,
      },
    },
  };
}

/**
 * Determine recommended portion based on calorie needs
 */
export function getRecommendedPortion(dailyCalories: number): "besar" | "kecil" {
  return dailyCalories > 1700 ? "besar" : "kecil";
}
