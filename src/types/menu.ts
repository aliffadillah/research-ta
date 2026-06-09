/**
 * Menu generation types
 */

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string;
  portionSize: number;
  portionUnit: string;
}

export interface NutritionValues {
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
}

export interface MenuComponent {
  category: string;
  categoryLabel: string;
  food: FoodItem;
  nutrition: NutritionValues;
}

export interface MenuCombination {
  score: number;
  totalNutrition: NutritionValues;
  components: MenuComponent[];
}

export interface GenerateMenuOptions {
  maxResults?: number;
  minScoreThreshold?: number;
}
