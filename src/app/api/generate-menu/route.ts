/**
 * API route for generating menu recommendations
 * MBG (Makan Bergizi Gratis) app
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMenuCombinations } from '@/lib/generate-menu';
import { FoodItem, NutritionValues } from '@/types/menu';

const REQUIRED_CATEGORIES = ['makanan_pokok', 'lauk_pauk', 'lauk_nabati', 'sayur', 'buah'];

function toFoodItem(food: any): FoodItem {
  return {
    id: food.id,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    category: food.category || 'lainnya',
    portionSize: food.portionSize,
    portionUnit: food.portionUnit,
  };
}

function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    const targetDate = dateParam || new Date().toISOString().split('T')[0];

    if (dateParam && !isValidDateFormat(dateParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Query DailyNutrition by date — must be a full ISO-8601 datetime for Prisma DateTime @db.Date
    const dailyNutrition = await prisma.dailyNutrition.findUnique({
      where: { date: new Date(targetDate + 'T00:00:00.000Z') },
    });

    if (!dailyNutrition) {
      return NextResponse.json(
        { success: false, error: `No DailyNutrition data found for date: ${targetDate}` },
        { status: 404 }
      );
    }

    // Query all foods
    const foods = await prisma.food.findMany({
      orderBy: { name: 'asc' },
    });

    // Validate all required categories exist
    const availableCategories = new Set(foods.map(f => f.category));
    const missingCategories = REQUIRED_CATEGORIES.filter(cat => !availableCategories.has(cat));

    if (missingCategories.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required food categories',
          missingCategories
        },
        { status: 400 }
      );
    }

    // Prepare daily needs for besar and kecil
    const dailyNeeds: Record<string, NutritionValues> = {
      besar: {
        energi: dailyNutrition.energyBesar,
        protein: dailyNutrition.proteinBesar,
        karbohidrat: dailyNutrition.carbsBesar,
        lemak: dailyNutrition.fatBesar,
        serat: dailyNutrition.fiberBesar,
      },
      kecil: {
        energi: dailyNutrition.energyKecil,
        protein: dailyNutrition.proteinKecil,
        karbohidrat: dailyNutrition.carbsKecil,
        lemak: dailyNutrition.fatKecil,
        serat: dailyNutrition.fiberKecil,
      },
    };

    // Convert foods to FoodItem format
    const foodItems = foods.map(toFoodItem);

    // Generate menu combinations for both portions
    const [besarCombinations, kecilCombinations] = await Promise.all([
      generateMenuCombinations(foodItems, dailyNeeds.besar, { maxResults: 3 }),
      generateMenuCombinations(foodItems, dailyNeeds.kecil, { maxResults: 3 }),
    ]);

    return NextResponse.json({
      success: true,
      date: targetDate,
      dailyNeeds,
      recommendations: {
        besar: besarCombinations,
        kecil: kecilCombinations,
      },
    });

  } catch (error) {
    console.error('Error in generate-menu API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
