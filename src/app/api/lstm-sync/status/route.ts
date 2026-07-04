import { prisma } from "@/lib/prisma";
import {
  isWeekend,
  getTodayWIB,
  formatDateUTC,
  addDaysUTC,
} from "@/lib/utils/date-utils";

const SLIDING_WINDOW_SIZE = 7;

export async function GET() {
  try {
    const allEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "asc" },
    });

    const lastData = allEntries.length > 0 ? allEntries[allEntries.length - 1] : null;

    const predictedCount = await prisma.dailyNutrition.count({
      where: { isPredicted: true },
    });

    const actualCount = await prisma.dailyNutrition.count({
      where: { isPredicted: false },
    });

    // Build set of existing date strings
    const existingDates = new Set<string>();
    for (const entry of allEntries) {
      existingDates.add(formatDateUTC(new Date(entry.date)));
    }

    // Count how many of the next 7 weekdays are missing (starting from day after last data)
    const lastDate = lastData ? new Date(lastData.date) : new Date();
    let daysToSync = 0;
    let current = addDaysUTC(lastDate, 1);
    let found = 0;

    for (let i = 0; i < 30 && found < 7; i++) {
      if (!isWeekend(current)) {
        const dateStr = formatDateUTC(current);
        if (!existingDates.has(dateStr)) {
          daysToSync++;
          found++;
        }
      }
      current = addDaysUTC(current, 1);
    }

    // Calculate next predict date (next weekday without data)
    let nextPredictDate = addDaysUTC(lastDate, 1);
    while (isWeekend(nextPredictDate) || existingDates.has(formatDateUTC(nextPredictDate))) {
      nextPredictDate = addDaysUTC(nextPredictDate, 1);
    }

    return new Response(JSON.stringify({
      success: true,
      lastDataDate: lastData?.date || null,
      lastDate: lastData?.date || null,
      today: formatDateUTC(getTodayWIB()),
      nextPredictDate: formatDateUTC(nextPredictDate),
      daysToSync,
      needsSync: daysToSync > 0,
      totalRecords: actualCount + predictedCount,
      actualDataCount: actualCount,
      predictedDataCount: predictedCount,
      canPredict: allEntries.length >= SLIDING_WINDOW_SIZE,
      hasEnoughData: allEntries.length >= SLIDING_WINDOW_SIZE,
      message: daysToSync > 0
        ? `${daysToSync} hari ke depan belum terisi`
        : allEntries.length >= SLIDING_WINDOW_SIZE
          ? "7 hari ke depan sudah terisi semua"
          : `Butuh minimal ${SLIDING_WINDOW_SIZE} data. Saat ini: ${allEntries.length}`,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET error:", error);
    return new Response(JSON.stringify({ error: "Failed to get status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
