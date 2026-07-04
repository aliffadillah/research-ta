import { prisma } from "@/lib/prisma";
import {
  isWeekend,
  getTodayWIB,
  formatDateUTC,
  addDaysUTC,
} from "@/lib/utils/date-utils";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

// Model Error Metrics for Monte Carlo Simulation
const MODEL_METRICS = {
  RMSE: 22.12,      // Root Mean Square Error for energi (kkal)
  MAPE: 34.27,      // Mean Absolute Percentage Error (%)
};

const MONTE_CARLO_ITERATIONS = 50;  // Number of simulations

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

// RMSE ratios for each nutrient (relative to energy RMSE)
const RMSE_RATIOS: Record<string, number> = {
  energyBesar: 1.0,
  energyKecil: 0.65,
  carbsBesar: 0.68,
  carbsKecil: 0.45,
  proteinBesar: 0.23,
  proteinKecil: 0.16,
  fatBesar: 0.23,
  fatKecil: 0.16,
  fiberBesar: 0.09,
  fiberKecil: 0.07,
};

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

// Box-Muller transform for normal distribution
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// Apply Monte Carlo noise to prediction
function applyMonteCarloNoise(
  basePrediction: Record<string, number>,
  iterations: number
): Record<string, number> {
  const result: Record<string, number> = {};
  const nutritionKeys = Object.keys(basePrediction);

  for (const key of nutritionKeys) {
    const baseValue = basePrediction[key];
    const stdDev = MODEL_METRICS.RMSE * (RMSE_RATIOS[key] || 0.3);
    const maxVariation = MODEL_METRICS.MAPE;

    const values: number[] = [];
    for (let i = 0; i < iterations; i++) {
      let noisyValue = randomNormal(baseValue, stdDev);

      const maxNoise = baseValue * (maxVariation / 100);
      noisyValue = Math.max(baseValue - maxNoise, Math.min(baseValue + maxNoise, noisyValue));

      values.push(Math.max(0, Math.round(noisyValue * 100) / 100));
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    result[key] = Math.round(mean * 100) / 100;
  }

  return result;
}

/**
 * Get exactly 7 future weekdays starting from the day after last data
 * Respects existing data - only predicts dates that don't exist yet
 */
function getNext7FutureWeekdays(
  existingDates: Set<string>,
  lastDate: Date,
  maxDaysToCheck: number = 30
): Date[] {
  const result: Date[] = [];
  let current = addDaysUTC(lastDate, 1); // Start from day after last data
  let found = 0;

  for (let i = 0; i < maxDaysToCheck && found < 7; i++) {
    const dateStr = formatDateUTC(current);
    // Only add if: not a weekend AND not already in database
    if (!isWeekend(current) && !existingDates.has(dateStr)) {
      result.push(new Date(current));
      found++;
    }
    current = addDaysUTC(current, 1);
  }

  return result;
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

  // Build set of existing date strings (to avoid overwriting existing data)
  const existingDates = new Set<string>();
  for (const entry of allEntries) {
    existingDates.add(formatDateUTC(new Date(entry.date)));
  }

  // Get last data date
  const lastEntry = allEntries[allEntries.length - 1];
  const lastDate = new Date(lastEntry.date);

  // Get exactly 7 future weekdays that don't have data yet
  const datesToPredict = getNext7FutureWeekdays(existingDates, lastDate, 30);

  if (datesToPredict.length === 0) {
    sendEvent({ type: "complete", message: "7 hari ke depan sudah terisi semua.", synced: 0 });
    return;
  }

  sendEvent({
    type: "start",
    message: `Prediksi 7 hari ke depan dari ${formatDateUTC(lastDate)}`,
    total: datesToPredict.length,
    startDate: formatDateUTC(lastDate),
    endDate: formatDateUTC(datesToPredict[datesToPredict.length - 1]),
    monteCarloEnabled: true,
  });

  let synced = 0;
  let skipped = 0;
  let errors = 0;
  const results: { date: string; status: string; energy?: number; monteCarlo?: boolean }[] = [];

  for (let i = 0; i < datesToPredict.length; i++) {
    const targetDate = datesToPredict[i];
    const dateStr = formatDateUTC(targetDate);

    sendEvent({
      type: "progress",
      current: i + 1,
      total: datesToPredict.length,
      date: dateStr,
      message: `Memprediksi ${dateStr}...`,
      percentage: Math.round(((i + 1) / datesToPredict.length) * 100),
    });

    try {
      // Get recent entries for sliding window (always use the latest data)
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
        results.push({ date: dateStr, status: "error", energy: 0, monteCarlo: false });

        sendEvent({
          type: "error_day",
          date: dateStr,
          message: `Error: ${errorText.substring(0, 100)}`,
          current: i + 1,
          total: datesToPredict.length,
        });
        continue;
      }

      const flaskResult = await flaskResponse.json();
      const basePrediction = fromFlaskResponse(flaskResult.prediksi_nutrisi);

      const nutritionData = applyMonteCarloNoise(basePrediction, MONTE_CARLO_ITERATIONS);

      // Create new prediction (data lama tidak di-modifikasi)
      await prisma.dailyNutrition.create({
        data: {
          date: targetDate,
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
      results.push({ date: dateStr, status: "success", energy: nutritionData.energyBesar, monteCarlo: true });

      sendEvent({
        type: "synced",
        date: dateStr,
        energy: nutritionData.energyBesar,
        current: i + 1,
        total: datesToPredict.length,
        percentage: Math.round(((i + 1) / datesToPredict.length) * 100),
        monteCarlo: true,
      });

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error syncing ${dateStr}:`, error);
      errors++;
      results.push({ date: dateStr, status: "error", energy: 0, monteCarlo: false });

      sendEvent({
        type: "error_day",
        date: dateStr,
        message: "Error tidak diketahui",
        current: i + 1,
        total: datesToPredict.length,
      });
    }
  }

  sendEvent({
    type: "complete",
    message: `Selesai: ${synced} diprediksi${skipped > 0 ? `, ${skipped} dilewati (sudah ada)` : ''}, ${errors} error`,
    synced,
    errors,
    skipped,
    results: results.slice(-10),
    monteCarloIterations: MONTE_CARLO_ITERATIONS,
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
