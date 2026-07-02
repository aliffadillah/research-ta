import { prisma } from "@/lib/prisma";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

const COLUMN_MAP: Record<string, string> = {
  "Karbohidrat Besar": "carbsBesar",
  "Protein Besar": "proteinBesar",
  "Lemak Besar": "fatBesar",
  "Serat Besar": "fiberBesar",
  "Energi Besar": "energyBesar",
  "Karbohidrat Kecil": "carbsKecil",
  "Protein Kecil": "proteinKecil",
  "Lemak Kecil": "fatKecil",
  "Serat Kecil": "fiberKecil",
  "Energi Kecil": "energyKecil",
};

const SLIDING_WINDOW_SIZE = 7;

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

function toFlaskData(nutritions: any[]): number[][] {
  return nutritions.map((n) => [
    n.carbsBesar,
    n.proteinBesar,
    n.fatBesar,
    n.fiberBesar,
    n.energyBesar,
    n.carbsKecil,
    n.proteinKecil,
    n.fatKecil,
    n.fiberKecil,
    n.energyKecil,
  ]);
}

function fromFlaskResponse(flaskData: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [flaskKey, prismaKey] of Object.entries(COLUMN_MAP)) {
    result[prismaKey] = Math.round(flaskData[flaskKey] * 100) / 100;
  }
  return result;
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

async function runSync(sendEvent: (data: object) => void) {
  const allEntries = await prisma.dailyNutrition.findMany({
    orderBy: { date: "asc" },
  });

  if (allEntries.length < SLIDING_WINDOW_SIZE) {
    sendEvent({
      type: "error",
      message: `Butuh minimal ${SLIDING_WINDOW_SIZE} data. Saat ini: ${allEntries.length}`,
    });
    return;
  }

  const lastDataDate = new Date(allEntries[allEntries.length - 1].date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const datesToSync: Date[] = [];
  let currentDate = new Date(lastDataDate);
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate <= today) {
    datesToSync.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const businessDates = datesToSync.filter(d => !isWeekend(d));

  if (businessDates.length === 0) {
    sendEvent({ type: "complete", message: "Tidak ada hari kerja untuk sync.", synced: 0 });
    return;
  }

  sendEvent({
    type: "start",
    message: `Sync dari ${lastDataDate.toISOString().split("T")[0]} ke ${today.toISOString().split("T")[0]}`,
    total: businessDates.length,
    startDate: lastDataDate.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  });

  const existingDates = new Set<string>();
  for (const entry of allEntries) {
    existingDates.add(new Date(entry.date).toISOString().split("T")[0]);
  }

  const datesNeedingPrediction = businessDates.filter(
    d => !existingDates.has(d.toISOString().split("T")[0])
  );

  if (datesNeedingPrediction.length === 0) {
    sendEvent({ type: "complete", message: "Semua data sudah terbaru.", synced: 0 });
    return;
  }

  let synced = 0;
  let errors = 0;
  const results: { date: string; status: string; energy?: number }[] = [];

  for (let i = 0; i < datesNeedingPrediction.length; i++) {
    const targetDate = datesNeedingPrediction[i];
    const dateStr = targetDate.toISOString().split("T")[0];

    sendEvent({
      type: "progress",
      current: i + 1,
      total: datesNeedingPrediction.length,
      date: dateStr,
      message: `Memprediksi ${dateStr}...`,
      percentage: Math.round(((i + 1) / datesNeedingPrediction.length) * 100),
    });

    try {
      const recentEntries = await prisma.dailyNutrition.findMany({
        orderBy: { date: "desc" },
        take: SLIDING_WINDOW_SIZE,
      });

      const inputEntries = recentEntries.reverse();
      const currentWindow = toFlaskData(inputEntries);

      const flaskResponse = await fetch(`${FLASK_API_URL}/predict_custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: currentWindow }),
      });

      if (!flaskResponse.ok) {
        const errorText = await flaskResponse.text();
        console.error(`Flask error for ${dateStr}:`, errorText);
        errors++;
        results.push({ date: dateStr, status: "error", energy: 0 });

        sendEvent({
          type: "error_day",
          date: dateStr,
          message: `Error: ${errorText.substring(0, 100)}`,
          current: i + 1,
          total: datesNeedingPrediction.length,
        });
        continue;
      }

      const flaskResult = await flaskResponse.json();
      const prediction = flaskResult.prediksi_nutrisi;
      const nutritionData = fromFlaskResponse(prediction);

      await prisma.dailyNutrition.create({
        data: {
          date: new Date(targetDate),
          carbsBesar: nutritionData.carbsBesar,
          proteinBesar: nutritionData.proteinBesar,
          fatBesar: nutritionData.fatBesar,
          fiberBesar: nutritionData.fiberBesar,
          energyBesar: nutritionData.energyBesar,
          carbsKecil: nutritionData.carbsKecil,
          proteinKecil: nutritionData.proteinKecil,
          fatKecil: nutritionData.fatKecil,
          fiberKecil: nutritionData.fiberKecil,
          energyKecil: nutritionData.energyKecil,
          isPredicted: true,
          syncedAt: new Date(),
        },
      });

      synced++;
      results.push({ date: dateStr, status: "success", energy: nutritionData.energyBesar });

      sendEvent({
        type: "synced",
        date: dateStr,
        energy: nutritionData.energyBesar,
        current: i + 1,
        total: datesNeedingPrediction.length,
        percentage: Math.round(((i + 1) / datesNeedingPrediction.length) * 100),
      });

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error syncing ${dateStr}:`, error);
      errors++;
      results.push({ date: dateStr, status: "error", energy: 0 });

      sendEvent({
        type: "error_day",
        date: dateStr,
        message: "Error tidak diketahui",
        current: i + 1,
        total: datesNeedingPrediction.length,
      });
    }
  }

  sendEvent({
    type: "complete",
    message: `Selesai: ${synced} diprediksi, ${errors} error`,
    synced,
    errors,
    results: results.slice(-10),
  });
}

function createSSEStream(handler: (sendEvent: (data: object) => void) => Promise<void>) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          console.error("Error sending event:", e);
        }
      };

      try {
        await handler(sendEvent);
      } catch (error) {
        console.error("SSE handler error:", error);
        sendEvent({ type: "error", message: "Internal server error" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function GET() {
  return createSSEStream(runSync);
}

export async function POST() {
  return createSSEStream(runSync);
}
