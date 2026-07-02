import { prisma } from "@/lib/prisma";

const SLIDING_WINDOW_SIZE = 7;

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

function getNextBusinessDay(date: Date): Date {
  const next = new Date(date);
  if (isWeekend(next)) {
    while (isWeekend(next)) {
      next.setDate(next.getDate() + 1);
    }
  }
  return next;
}

export async function GET() {
  try {
    const allEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "asc" },
    });

    const lastData = allEntries.length > 0 ? allEntries[allEntries.length - 1] : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const predictedCount = await prisma.dailyNutrition.count({
      where: { isPredicted: true },
    });

    const actualCount = await prisma.dailyNutrition.count({
      where: { isPredicted: false },
    });

    let nextPredictDate: Date;
    if (lastData) {
      const tomorrow = new Date(lastData.date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextPredictDate = getNextBusinessDay(tomorrow);
    } else {
      nextPredictDate = new Date();
      nextPredictDate = getNextBusinessDay(nextPredictDate);
    }

    let daysToSync = 0;
    if (lastData) {
      let checkDate = new Date(lastData.date);
      checkDate.setDate(checkDate.getDate() + 1);
      while (checkDate <= today) {
        if (!isWeekend(checkDate)) {
          daysToSync++;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      lastDataDate: lastData?.date || null,
      lastDate: lastData?.date || null,
      nextPredictDate: nextPredictDate.toISOString().split("T")[0],
      today: today.toISOString().split("T")[0],
      daysToSync: daysToSync > 0 ? daysToSync : 0,
      needsSync: daysToSync > 0,
      totalRecords: actualCount + predictedCount,
      actualDataCount: actualCount,
      predictedDataCount: predictedCount,
      canPredict: allEntries.length >= SLIDING_WINDOW_SIZE,
      hasEnoughData: allEntries.length >= SLIDING_WINDOW_SIZE,
      message: daysToSync > 0
        ? `${daysToSync} hari perlu disinkronkan`
        : allEntries.length >= SLIDING_WINDOW_SIZE
          ? "Data sudah up-to-date"
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
