import { NutritionInfo } from "@/types";

// Default nutrition for unknown foods
export const DEFAULT_NUTRITION: NutritionInfo = {
  calories: 100,
  protein: 3,
  carbs: 15,
  fat: 3,
  fiber: 1,
};

// Local food nutrition database as fallback
export const FOOD_NUTRITION_DB: Record<string, NutritionInfo> = {
  "nasi putih": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  "nasi": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  "nasi goreng": { calories: 200, protein: 5.1, carbs: 32, fat: 6.2, fiber: 1.2 },
  "ayam": { calories: 170, protein: 25, carbs: 0, fat: 7, fiber: 0 },
  "ayam goreng": { calories: 260, protein: 25, carbs: 8, fat: 14, fiber: 0.2 },
  "ayam bakar": { calories: 180, protein: 28, carbs: 2, fat: 7, fiber: 0 },
  "telur": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  "telur rebus": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  "telur goreng": { calories: 196, protein: 14, carbs: 1.4, fat: 15, fiber: 0 },
  "ikan": { calories: 200, protein: 22, carbs: 0, fat: 12, fiber: 0 },
  "ikan goreng": { calories: 220, protein: 22, carbs: 5, fat: 13, fiber: 0 },
  "tempe": { calories: 195, protein: 15, carbs: 12, fat: 12, fiber: 4 },
  "tahu": { calories: 130, protein: 10, carbs: 6, fat: 8, fiber: 1 },
  "sayur": { calories: 50, protein: 3, carbs: 6, fat: 2, fiber: 2 },
  "kangkung": { calories: 35, protein: 3, carbs: 3, fat: 0.5, fiber: 2.2 },
  "bayam": { calories: 35, protein: 4, carbs: 3, fat: 0.5, fiber: 2.2 },
  "pisang": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  "apel": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  "jeruk": { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  "lontong": { calories: 120, protein: 2.2, carbs: 26, fat: 0.2, fiber: 1.0 },
  "soto": { calories: 180, protein: 15, carbs: 20, fat: 5, fiber: 2 },
  "sate": { calories: 250, protein: 20, carbs: 10, fat: 15, fiber: 1 },
  "rendang": { calories: 300, protein: 18, carbs: 8, fat: 22, fiber: 2 },
  "gudeg": { calories: 200, protein: 8, carbs: 30, fat: 6, fiber: 4 },
};

/**
 * Get nutrition from local database
 * Fallback when external API unavailable
 */
export function getNutritionForFood(foodName: string): NutritionInfo {
  // Normalize food name
  const normalized = foodName.toLowerCase().trim();

  // Direct match
  if (FOOD_NUTRITION_DB[normalized]) {
    return FOOD_NUTRITION_DB[normalized];
  }

  // Partial match - check if any key is contained in food name
  for (const [key, value] of Object.entries(FOOD_NUTRITION_DB)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return DEFAULT_NUTRITION;
}

/**
 * Fetch nutrition data from external API
 */
export async function fetchNutritionFromAPI(foodClass: string): Promise<NutritionInfo | null> {
  try {
    const response = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodClass }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.nutrition || null;
  } catch (error) {
    console.error("Failed to fetch nutrition from API:", error);
    return null;
  }
}
