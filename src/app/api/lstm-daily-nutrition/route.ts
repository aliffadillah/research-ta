import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTodayWIB, formatDateUTC } from "@/lib/utils/date-utils";

// Get today's date in WIB timezone (using UTC utilities for consistency)
function getTodayWIBDate(): Date {
  return getTodayWIB();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date in WIB
    const today = getTodayWIBDate();
    const todayStr = formatDateUTC(today);

    // Find data for today specifically
    let dailyNutrition = await prisma.dailyNutrition.findFirst({
      where: {
        date: today,
      },
    });

    // If no data for today, try to get the most recent data
    if (!dailyNutrition) {
      dailyNutrition = await prisma.dailyNutrition.findFirst({
        orderBy: {
          date: "desc",
        },
      });
    }

    // If still no data, try to get from user daily goal as fallback
    if (!dailyNutrition && session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { dailyGoal: true },
      });

      if (user?.dailyGoal) {
        const goal = user.dailyGoal as Record<string, number>;
        return NextResponse.json({
          success: true,
          data: {
            date: new Date().toISOString().split("T")[0],
            source: "user_goal",
            isToday: false,
            besar: {
              energi: goal.calories || 2100,
              protein: goal.protein || 60,
              karbohidrat: goal.carbs || 300,
              lemak: goal.fat || 70,
              serat: goal.fiber || 30,
            },
            kecil: {
              energi: Math.round((goal.calories || 2100) * 0.65),
              protein: Math.round((goal.protein || 60) * 0.65),
              karbohidrat: Math.round((goal.carbs || 300) * 0.65),
              lemak: Math.round((goal.fat || 70) * 0.65),
              serat: Math.round((goal.fiber || 30) * 0.65),
            },
          },
        });
      }
    }

    if (!dailyNutrition) {
      return NextResponse.json({
        success: false,
        error: "No daily nutrition data found",
        data: null,
      });
    }

    // Check if this data is for today
    const dataDate = dailyNutrition.date instanceof Date
      ? dailyNutrition.date.toISOString().split("T")[0]
      : String(dailyNutrition.date).split("T")[0];
    const isToday = dataDate === todayStr;

    return NextResponse.json({
      success: true,
      data: {
        date: dataDate,
        isPredicted: dailyNutrition.isPredicted,
        source: isToday ? "today" : (dailyNutrition.isPredicted ? "lstm" : "manual"),
        isToday,
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
      },
    });
  } catch (error) {
    console.error("[LSTM Daily Nutrition API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily nutrition" },
      { status: 500 }
    );
  }
}
