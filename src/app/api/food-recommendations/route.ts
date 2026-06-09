import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNutritionStandards } from "@/lib/nutrition-standards";

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  portionSize: number;
  portionUnit: string;
  category: string | null;
}

interface DailyNutrition {
  carbsBesar: number;
  proteinBesar: number;
  fatBesar: number;
  fiberBesar: number;
  energyBesar: number;
  carbsKecil: number;
  proteinKecil: number;
  fatKecil: number;
  fiberKecil: number;
  energyKecil: number;
}

interface NutritionNeeds {
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
}

interface NutritionComparison {
  targetCalories: number;
  actualCalories: number;
  targetProtein: number;
  actualProtein: number;
  targetCarbs: number;
  actualCarbs: number;
  targetFat: number;
  actualFat: number;
  targetFiber: number;
  actualFiber: number;
}

interface FoodRecommendation {
  food: Food;
  matchScore: number;
  nutritionComparison: NutritionComparison;
  recommendedPortion: "besar" | "kecil";
  category: string;
}

// Calculate match score for a food against nutritional needs
function calculateMatchScore(
  food: Food,
  portionNeeds: NutritionNeeds
): { score: number; comparison: NutritionComparison } {
  const weights = {
    calories: 0.4,
    protein: 0.25,
    carbs: 0.15,
    fat: 0.1,
    fiber: 0.1,
  };

  // Closeness function: returns 0-1, 1 means perfect match
  const closeness = (target: number, actual: number): number => {
    if (target === 0) return 0.5;
    const ratio = actual / target;
    return Math.max(0, 1 - Math.abs(1 - ratio));
  };

  const score =
    weights.calories * closeness(portionNeeds.energi, food.calories) +
    weights.protein * closeness(portionNeeds.protein, food.protein) +
    weights.carbs * closeness(portionNeeds.karbohidrat, food.carbs) +
    weights.fat * closeness(portionNeeds.lemak, food.fat) +
    weights.fiber * closeness(portionNeeds.serat, food.fiber);

  const comparison: NutritionComparison = {
    targetCalories: portionNeeds.energi,
    actualCalories: food.calories,
    targetProtein: portionNeeds.protein,
    actualProtein: food.protein,
    targetCarbs: portionNeeds.karbohidrat,
    actualCarbs: food.carbs,
    targetFat: portionNeeds.lemak,
    actualFat: food.fat,
    targetFiber: portionNeeds.serat,
    actualFiber: food.fiber,
  };

  return {
    score: Math.round(score * 100),
    comparison,
  };
}

// Determine recommended portion type based on daily calorie needs
function getRecommendedPortion(dailyCalories: number): "besar" | "kecil" {
  // If daily needs > 1700 kcal, recommend Porsi Besar
  return dailyCalories > 1700 ? "besar" : "kecil";
}

// Get nutritional needs based on daily nutrition data or defaults
function getNeedsFromDailyNutrition(dailyNutrition: DailyNutrition): {
  needs: NutritionNeeds;
  portionType: "besar" | "kecil";
} {
  const portionType = getRecommendedPortion(dailyNutrition.energyBesar);

  const needs: NutritionNeeds = {
    energi: portionType === "besar" ? dailyNutrition.energyBesar : dailyNutrition.energyKecil,
    protein: portionType === "besar" ? dailyNutrition.proteinBesar : dailyNutrition.proteinKecil,
    karbohidrat: portionType === "besar" ? dailyNutrition.carbsBesar : dailyNutrition.carbsKecil,
    lemak: portionType === "besar" ? dailyNutrition.fatBesar : dailyNutrition.fatKecil,
    serat: portionType === "besar" ? dailyNutrition.fiberBesar : dailyNutrition.fiberKecil,
  };

  return { needs, portionType };
}

// GET /api/food-recommendations?date=YYYY-MM-DD
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const category = searchParams.get("category"); // Optional: filter by category
    const nutritionFocus = searchParams.get("focus"); // Optional: calories, protein, carbs, fat, fiber

    // Get today's date if not provided
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
    } else {
      const now = new Date();
      const utcHours = now.getUTCHours();
      const wibHours = utcHours + 7;
      targetDate = new Date(now);
      if (wibHours >= 24) {
        targetDate.setUTCDate(targetDate.getUTCDate() + 1);
      }
    }

    const dateStr = targetDate.toISOString().split("T")[0];

    // Get daily nutrition data for the date
    let dailyNutrition: DailyNutrition | null = null;
    let dailyNeeds: NutritionNeeds;
    let portionType: "besar" | "kecil";

    const dailyNutritionData = await prisma.dailyNutrition.findUnique({
      where: { date: targetDate },
    });

    if (dailyNutritionData) {
      dailyNeeds = {
        energi: dailyNutritionData.energyBesar,
        protein: dailyNutritionData.proteinBesar,
        karbohidrat: dailyNutritionData.carbsBesar,
        lemak: dailyNutritionData.fatBesar,
        serat: dailyNutritionData.fiberBesar,
      };
      portionType = getRecommendedPortion(dailyNutritionData.energyBesar);
      dailyNutrition = {
        carbsBesar: dailyNutritionData.carbsBesar,
        proteinBesar: dailyNutritionData.proteinBesar,
        fatBesar: dailyNutritionData.fatBesar,
        fiberBesar: dailyNutritionData.fiberBesar,
        energyBesar: dailyNutritionData.energyBesar,
        carbsKecil: dailyNutritionData.carbsKecil,
        proteinKecil: dailyNutritionData.proteinKecil,
        fatKecil: dailyNutritionData.fatKecil,
        fiberKecil: dailyNutritionData.fiberKecil,
        energyKecil: dailyNutritionData.energyKecil,
      };
    } else {
      // Use default nutrition standards
      const standards = getNutritionStandards();
      dailyNeeds = standards.portion.besar;
      portionType = "besar";
    }

    // Calculate per-meal needs (assuming 3 main meals)
    const portionNeeds: NutritionNeeds = {
      energi: dailyNeeds.energi / 3,
      protein: dailyNeeds.protein / 3,
      karbohidrat: dailyNeeds.karbohidrat / 3,
      lemak: dailyNeeds.lemak / 3,
      serat: dailyNeeds.serat / 3,
    };

    // Get all foods from Daftar Makanan
    let foodQuery = {};
    if (category && category !== "all") {
      foodQuery = { category: category.toLowerCase() };
    }

    const foods = await prisma.food.findMany({
      where: foodQuery,
      orderBy: { name: "asc" },
    });

    // Calculate match scores for each food
    let recommendations: FoodRecommendation[] = foods.map((food) => {
      const { score, comparison } = calculateMatchScore(food, portionNeeds);
      return {
        food: {
          id: food.id,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          portionSize: food.portionSize,
          portionUnit: food.portionUnit,
          category: food.category,
        },
        matchScore: score,
        nutritionComparison: comparison,
        recommendedPortion: portionType,
        category: food.category || "Lainnya",
      };
    });

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // If nutrition focus is specified, boost that component's weight
    if (nutritionFocus && ["calories", "protein", "carbs", "fat", "fiber"].includes(nutritionFocus)) {
      const focusMap: Record<string, keyof NutritionNeeds> = {
        calories: "energi",
        protein: "protein",
        carbs: "karbohidrat",
        fat: "lemak",
        fiber: "serat",
      };
      const focusKey = focusMap[nutritionFocus];

      // Re-sort based on how well food matches the focused nutrient
      recommendations.sort((a, b) => {
        const aRatio = a.nutritionComparison.actualCalories / a.nutritionComparison.targetCalories;
        const bRatio = b.nutritionComparison.actualCalories / b.nutritionComparison.targetCalories;
        const aFocusRatio =
          focusKey === "energi"
            ? aRatio
            : (a.food as any)[focusKey] / (a.nutritionComparison as any)[`target${focusKey.charAt(0).toUpperCase() + focusKey.slice(1)}`];
        const bFocusRatio =
          focusKey === "energi"
            ? bRatio
            : (b.food as any)[focusKey] / (b.nutritionComparison as any)[`target${focusKey.charAt(0).toUpperCase() + focusKey.slice(1)}`];

        // Closeness to target for focused nutrient
        const aCloseness = Math.abs(1 - aFocusRatio);
        const bCloseness = Math.abs(1 - bFocusRatio);
        return aCloseness - bCloseness;
      });
    }

    return NextResponse.json({
      success: true,
      date: dateStr,
      dailyNeeds: dailyNeeds,
      portionType: portionType,
      portionNeeds: portionNeeds,
      hasDailyData: !!dailyNutritionData,
      totalFoods: recommendations.length,
      foods: recommendations,
    });
  } catch (error) {
    console.error("Food recommendations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch food recommendations" },
      { status: 500 }
    );
  }
}
