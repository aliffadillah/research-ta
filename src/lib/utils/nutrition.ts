import { NutritionInfo, DailyGoal } from "@/types";

export function calculateNutrition(
  baseNutrition: NutritionInfo,
  portionSize: number,
  basePortionSize: number = 100
): NutritionInfo {
  const multiplier = portionSize / basePortionSize;
  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
    fiber: Math.round(baseNutrition.fiber * multiplier * 10) / 10,
  };
}

export function calculateProgress(
  current: NutritionInfo,
  goal: DailyGoal
): NutritionInfo {
  return {
    calories: Math.min((current.calories / goal.calories) * 100, 100),
    protein: Math.min((current.protein / goal.protein) * 100, 100),
    carbs: Math.min((current.carbs / goal.carbs) * 100, 100),
    fat: Math.min((current.fat / goal.fat) * 100, 100),
    fiber: Math.min((current.fiber / goal.fiber) * 100, 100),
  };
}

export function formatNutritionValue(value: number, unit: string = "g"): string {
  if (unit === "kcal") {
    return `${Math.round(value)} kcal`;
  }
  return `${Math.round(value * 10) / 10}${unit}`;
}

export function sumNutrition(items: NutritionInfo[]): NutritionInfo {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      fiber: acc.fiber + item.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function getMealCategory(): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 18) return "snack";
  return "dinner";
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export function getWeekDates(startDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay()); // Sunday

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }

  return dates;
}
