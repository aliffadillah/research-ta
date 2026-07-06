/**
 * API route for generating menu recommendations for a week (7 days)
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function formatIndonesianDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('id-ID', options);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (!startDateParam || !isValidDateFormat(startDateParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing startDate. Use YYYY-MM-DD format.' },
        { status: 400 }
      );
    }

    // Validate days parameter
    if (days < 1 || days > 14) {
      return NextResponse.json(
        { success: false, error: 'Days must be between 1 and 14.' },
        { status: 400 }
      );
    }

    // Get all foods first (reused for all days)
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

    const foodItems = foods.map(toFoodItem);

    // Generate menus for each day
    const weekMenus = [];
    let hasMissingData = false;
    const missingDates: string[] = [];

    for (let i = 0; i < days; i++) {
      const targetDate = addDays(startDateParam, i);
      const dateISO = new Date(targetDate + 'T00:00:00.000Z');

      // Get DailyNutrition for this date
      const dailyNutrition = await prisma.dailyNutrition.findUnique({
        where: { date: dateISO },
      });

      if (!dailyNutrition) {
        hasMissingData = true;
        missingDates.push(formatIndonesianDate(targetDate));
        weekMenus.push({
          date: targetDate,
          dateFormatted: formatIndonesianDate(targetDate),
          hasData: false,
          error: 'Data nutrisi harian tidak ditemukan',
        });
        continue;
      }

      // Prepare daily needs
      const dailyNeeds: Record<string, NutritionValues> = {
        besar: {
          energi: dailyNutrition.energyBesar,
          protein: dailyNutrition.proteinBesar,
          karbohidrat: dailyNutrition.carbsBesar,
          lemak: dailyNutrition.fatBesar,
          serat: dailyNutrition.fiberBesar,
        },
      };

      // Generate only besar combinations (kecil is derived from besar)
      const besarCombinations = await generateMenuCombinations(foodItems, dailyNeeds.besar, { maxResults: 3 });

      weekMenus.push({
        date: targetDate,
        dateFormatted: formatIndonesianDate(targetDate),
        hasData: true,
        dailyNeeds,
        recommendations: {
          besar: besarCombinations,
        },
      });
    }

    return NextResponse.json({
      success: true,
      startDate: startDateParam,
      days,
      hasMissingData,
      missingDates: hasMissingData ? missingDates : undefined,
      weekMenus,
    });

  } catch (error) {
    console.error('Error in generate-menu-week API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
