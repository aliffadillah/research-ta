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

    // Get all available daily nutrition data
    const allDailyNutrition = await prisma.dailyNutrition.findMany({
      orderBy: {
        date: "asc",
      },
    });

    // If no data at all, return empty state
    if (allDailyNutrition.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Belum terdapat data terbaru",
        data: null,
      });
    }

    // Find the first available data starting from today onwards
    let dailyNutrition = null;
    let searchDate = new Date(today);

    // Try to find data from today or future
    for (let i = 0; i < 365; i++) { // Max 1 year search
      const searchDateStr = formatDateUTC(searchDate);
      const found = allDailyNutrition.find((d) => {
        const dDate = d.date instanceof Date
          ? d.date.toISOString().split("T")[0]
          : String(d.date).split("T")[0];
        return dDate === searchDateStr;
      });

      if (found) {
        dailyNutrition = found;
        break;
      }

      // Move to next day
      searchDate.setDate(searchDate.getDate() + 1);
    }

    // If still no data found, use the latest available data
    if (!dailyNutrition) {
      dailyNutrition = allDailyNutrition[allDailyNutrition.length - 1];
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
