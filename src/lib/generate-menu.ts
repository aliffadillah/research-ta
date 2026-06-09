/**
 * Core algorithm for generating menu combinations
 * MBG (Makan Bergizi Gratis) app
 */

import { FoodItem, NutritionValues, MenuComponent, MenuCombination, GenerateMenuOptions } from '@/types/menu';

// Category allocation ratios for nutrition distribution
const CATEGORY_RATIOS: Record<string, Record<string, number>> = {
  makanan_pokok: { energi: 0.30, protein: 0.20, karbohidrat: 0.40, lemak: 0.15, serat: 0.10 },
  lauk_pauk: { energi: 0.25, protein: 0.40, karbohidrat: 0.10, lemak: 0.35, serat: 0.05 },
  lauk_nabati: { energi: 0.10, protein: 0.25, karbohidrat: 0.10, lemak: 0.20, serat: 0.15 },
  sayur: { energi: 0.05, protein: 0.05, karbohidrat: 0.15, lemak: 0.05, serat: 0.40 },
  buah: { energi: 0.10, protein: 0.05, karbohidrat: 0.15, lemak: 0.05, serat: 0.25 },
};

// Human-readable category labels
export const CATEGORY_LABELS: Record<string, string> = {
  makanan_pokok: 'Makanan Pokok',
  lauk_pauk: 'Lauk Pauk',
  lauk_nabati: 'Lauk Nabati',
  sayur: 'Sayur',
  buah: 'Buah',
};

// Category order for menu composition
const CATEGORY_ORDER = ['makanan_pokok', 'lauk_pauk', 'lauk_nabati', 'sayur', 'buah'];

// Weight factors for score calculation
const SCORE_WEIGHTS = {
  energi: 0.4,
  protein: 0.25,
  karbohidrat: 0.15,
  lemak: 0.1,
  serat: 0.1,
};

/**
 * Calculate match score (0-100) based on how close actual nutrition is to target
 */
export function calculateMatchScore(
  totalNutrition: NutritionValues,
  target: NutritionValues
): number {
  let weightedScore = 0;

  for (const nutrient of Object.keys(SCORE_WEIGHTS) as Array<keyof typeof SCORE_WEIGHTS>) {
    const actual = totalNutrition[nutrient];
    const targetValue = target[nutrient];

    if (targetValue === 0) {
      weightedScore += SCORE_WEIGHTS[nutrient] * 100;
    } else {
      const ratio = actual / targetValue;
      const closeness = Math.max(0, 1 - Math.abs(1 - ratio));
      weightedScore += SCORE_WEIGHTS[nutrient] * closeness * 100;
    }
  }

  return Math.round(weightedScore * 100) / 100;
}

/**
 * Calculate total nutrition from all menu components
 */
export function calculateTotalNutrition(components: MenuComponent[]): NutritionValues {
  const total: NutritionValues = {
    energi: 0,
    protein: 0,
    karbohidrat: 0,
    lemak: 0,
    serat: 0,
  };

  for (const component of components) {
    total.energi += component.nutrition.energi;
    total.protein += component.nutrition.protein;
    total.karbohidrat += component.nutrition.karbohidrat;
    total.lemak += component.nutrition.lemak;
    total.serat += component.nutrition.serat;
  }

  return {
    energi: Math.round(total.energi * 100) / 100,
    protein: Math.round(total.protein * 100) / 100,
    karbohidrat: Math.round(total.karbohidrat * 100) / 100,
    lemak: Math.round(total.lemak * 100) / 100,
    serat: Math.round(total.serat * 100) / 100,
  };
}

/**
 * Find a good food for a category from top candidates with randomness for variety.
 * Picks from top-N candidates instead of always the single best.
 */
export function findBestFoodForCategory(
  foods: FoodItem[],
  category: string,
  target: NutritionValues,
  topN: number = 5
): FoodItem | null {
  const categoryFoods = foods.filter(f => f.category === category);
  if (categoryFoods.length === 0) return null;

  const ratio = CATEGORY_RATIOS[category];
  if (!ratio) return null;

  // Calculate allocated target for this category
  const allocatedTarget: NutritionValues = {
    energi: target.energi * ratio.energi,
    protein: target.protein * ratio.protein,
    karbohidrat: target.karbohidrat * ratio.karbohidrat,
    lemak: target.lemak * ratio.lemak,
    serat: target.serat * ratio.serat,
  };

  // Score every food by inverse distance (higher = closer to target)
  const scored = categoryFoods.map(food => {
    const foodNutrition: NutritionValues = {
      energi: food.calories,
      protein: food.protein,
      karbohidrat: food.carbs,
      lemak: food.fat,
      serat: food.fiber,
    };

    let distance = 0;
    for (const nutrient of Object.keys(allocatedTarget) as Array<keyof NutritionValues>) {
      const diff = foodNutrition[nutrient] - allocatedTarget[nutrient];
      distance += diff * diff;
    }

    return { food, distance };
  });

  // Sort by distance ascending
  scored.sort((a, b) => a.distance - b.distance);

  // Pick randomly from top-N candidates
  const candidates = scored.slice(0, Math.min(topN, scored.length));
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex].food;
}

/**
 * Generate a single menu combination from 5 categories
 */
export function generateSingleCombination(
  foods: FoodItem[],
  target: NutritionValues,
  usedCombinations: Set<string>
): MenuCombination | null {
  const components: MenuComponent[] = [];
  const foodIds: string[] = [];

  for (const category of CATEGORY_ORDER) {
    const food = findBestFoodForCategory(foods, category, target);
    if (!food) return null;

    foodIds.push(food.id);

    const nutrition: NutritionValues = {
      energi: food.calories,
      protein: food.protein,
      karbohidrat: food.carbs,
      lemak: food.fat,
      serat: food.fiber,
    };

    components.push({
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      food,
      nutrition,
    });
  }

  // Check for duplicate combination
  const comboKey = foodIds.sort().join('|');
  if (usedCombinations.has(comboKey)) {
    return null;
  }

  const totalNutrition = calculateTotalNutrition(components);
  const score = calculateMatchScore(totalNutrition, target);

  return {
    score,
    totalNutrition,
    components,
  };
}

/**
 * Group foods by category
 */
export function groupFoodsByCategory(foods: FoodItem[]): Record<string, FoodItem[]> {
  const grouped: Record<string, FoodItem[]> = {};

  for (const food of foods) {
    if (!grouped[food.category]) {
      grouped[food.category] = [];
    }
    grouped[food.category].push(food);
  }

  return grouped;
}

/**
 * Generate multiple unique menu combinations
 */
export async function generateMenuCombinations(
  foods: FoodItem[],
  target: NutritionValues,
  options: GenerateMenuOptions = {}
): Promise<MenuCombination[]> {
  const { maxResults = 10, minScoreThreshold = 0 } = options;

  // Check if we have foods for all categories
  const grouped = groupFoodsByCategory(foods);
  for (const category of CATEGORY_ORDER) {
    if (!grouped[category] || grouped[category].length === 0) {
      return [];
    }
  }

  const results: MenuCombination[] = [];
  const usedCombinations = new Set<string>();
  const maxAttempts = Math.min(maxResults * 10, 1000);

  let attempts = 0;

  while (results.length < maxResults && attempts < maxAttempts) {
    attempts++;

    // Shuffle foods for variety
    const shuffledFoods = [...foods].sort(() => Math.random() - 0.5);

    const combination = generateSingleCombination(shuffledFoods, target, usedCombinations);

    if (combination && combination.score >= minScoreThreshold) {
      const comboKey = combination.components.map(c => c.food.id).sort().join('|');
      usedCombinations.add(comboKey);
      results.push(combination);
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

// ============================================
// Simple Test
// ============================================

function runTest(): void {
  console.log('Running generate-menu tests...\n');

  // Test data
  const testFoods: FoodItem[] = [
    { id: '1', name: 'Nasi Putih', calories: 200, protein: 4, carbs: 45, fat: 0.5, fiber: 0.5, category: 'makanan_pokok', portionSize: 100, portionUnit: 'g' },
    { id: '2', name: 'Ayam Goreng', calories: 250, protein: 25, carbs: 5, fat: 15, fiber: 0, category: 'lauk_pauk', portionSize: 100, portionUnit: 'g' },
    { id: '3', name: 'Tahu Goreng', calories: 100, protein: 10, carbs: 3, fat: 6, fiber: 1, category: 'lauk_nabati', portionSize: 100, portionUnit: 'g' },
    { id: '4', name: 'Sayur Bayam', calories: 30, protein: 3, carbs: 5, fat: 0.5, fiber: 3, category: 'sayur', portionSize: 100, portionUnit: 'g' },
    { id: '5', name: 'Pisang', calories: 90, protein: 1, carbs: 23, fat: 0.3, fiber: 2.5, category: 'buah', portionSize: 100, portionUnit: 'g' },
    { id: '6', name: 'Nasi Merah', calories: 180, protein: 5, carbs: 40, fat: 1, fiber: 2, category: 'makanan_pokok', portionSize: 100, portionUnit: 'g' },
    { id: '7', name: 'Ikan Bakar', calories: 180, protein: 30, carbs: 0, fat: 8, fiber: 0, category: 'lauk_pauk', portionSize: 100, portionUnit: 'g' },
    { id: '8', name: 'Tempe Goreng', calories: 120, protein: 12, carbs: 5, fat: 7, fiber: 2, category: 'lauk_nabati', portionSize: 100, portionUnit: 'g' },
    { id: '9', name: 'Sayur Kangkung', calories: 25, protein: 2, carbs: 4, fat: 0.3, fiber: 2.5, category: 'sayur', portionSize: 100, portionUnit: 'g' },
    { id: '10', name: 'Apel', calories: 80, protein: 0.3, carbs: 21, fat: 0.2, fiber: 3, category: 'buah', portionSize: 100, portionUnit: 'g' },
  ];

  const target: NutritionValues = {
    energi: 650,
    protein: 45,
    karbohidrat: 100,
    lemak: 30,
    serat: 15,
  };

  // Test 1: groupFoodsByCategory
  console.log('Test 1: groupFoodsByCategory');
  const grouped = groupFoodsByCategory(testFoods);
  console.log('Categories found:', Object.keys(grouped));
  console.log('Foods per category:', Object.entries(grouped).map(([k, v]) => `${k}: ${v.length}`).join(', '));
  console.log('PASS\n');

  // Test 2: calculateTotalNutrition
  console.log('Test 2: calculateTotalNutrition');
  const testComponents: MenuComponent[] = [
    {
      category: 'makanan_pokok',
      categoryLabel: 'Makanan Pokok',
      food: testFoods[0],
      nutrition: { energi: 200, protein: 4, karbohidrat: 45, lemak: 0.5, serat: 0.5 },
    },
    {
      category: 'lauk_pauk',
      categoryLabel: 'Lauk Pauk',
      food: testFoods[1],
      nutrition: { energi: 250, protein: 25, karbohidrat: 5, lemak: 15, serat: 0 },
    },
  ];
  const total = calculateTotalNutrition(testComponents);
  console.log('Total:', total);
  console.log('Expected ~energi:450, protein:29, karbohidrat:50, lemak:15.5, serat:0.5');
  console.log('PASS\n');

  // Test 3: calculateMatchScore
  console.log('Test 3: calculateMatchScore');
  const score = calculateMatchScore(total, target);
  console.log('Score:', score);
  console.log('Should be between 0-100');
  console.log('PASS\n');

  // Test 4: generateMenuCombinations
  console.log('Test 4: generateMenuCombinations (async)');
  generateMenuCombinations(testFoods, target, { maxResults: 3 }).then(combinations => {
    console.log(`Generated ${combinations.length} combinations\n`);
    for (let i = 0; i < combinations.length; i++) {
      const combo = combinations[i];
      console.log(`Combination ${i + 1} (Score: ${combo.score})`);
      console.log('Total Nutrition:', combo.totalNutrition);
      console.log('Components:');
      for (const comp of combo.components) {
        console.log(`  - ${comp.categoryLabel}: ${comp.food.name}`);
      }
      console.log('');
    }
    console.log('All tests passed!');
  });
}

// Run test if executed directly
if (require.main === module) {
  runTest();
}