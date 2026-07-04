import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isWeekend,
  getNextBusinessDay,
  getTodayWIB,
  formatDateUTC,
  parseDateUTC,
  addDaysUTC,
} from "@/lib/utils/date-utils";

// ============================================================
// CONFIG
// ============================================================
const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

// Model Error Metrics for Monte Carlo Simulation
const MODEL_METRICS = {
  RMSE: 22.12,      // Root Mean Square Error for energi (kkal)
  MAPE: 34.27,      // Mean Absolute Percentage Error (%)
};

// Monte Carlo settings
const MONTE_CARLO_ITERATIONS = 50;  // Number of simulations

// Column mapping dari Flask (spasi) ke camelCase (Prisma)
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

// Sliding window size (harus sama dengan training)
const SLIDING_WINDOW_SIZE = 7;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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

// RMSE ratios for each nutrient (relative to energy RMSE)
const RMSE_RATIOS: Record<string, number> = {
  energyBesar: 1.0,        // Base RMSE
  energyKecil: 0.65,       // Smaller portion
  carbsBesar: 0.68,         // ~15g typical
  carbsKecil: 0.45,         // Smaller portion
  proteinBesar: 0.23,       // ~5g typical
  proteinKecil: 0.16,        // Smaller portion
  fatBesar: 0.23,          // ~5g typical
  fatKecil: 0.16,          // Smaller portion
  fiberBesar: 0.09,        // ~2g typical
  fiberKecil: 0.07,         // Smaller portion
};

// Apply Monte Carlo noise to prediction
function applyMonteCarloNoise(
  basePrediction: Record<string, number>,
  iterations: number
): {
  meanPrediction: Record<string, number>;
  minPrediction: Record<string, number>;
  maxPrediction: Record<string, number>;
  stdPrediction: Record<string, number>;
  monteCarloResults: Record<string, number[]>;
} {
  const nutritionKeys = Object.keys(basePrediction);
  const monteCarloResults: Record<string, number[]> = {};

  // Run Monte Carlo simulations
  for (const key of nutritionKeys) {
    const baseValue = basePrediction[key];
    const stdDev = MODEL_METRICS.RMSE * (RMSE_RATIOS[key] || 0.3);
    const maxVariation = MODEL_METRICS.MAPE;

    monteCarloResults[key] = [];
    for (let i = 0; i < iterations; i++) {
      // Generate random noise using normal distribution
      let noisyValue = randomNormal(baseValue, stdDev);

      // Clamp to max variation percentage
      const maxNoise = baseValue * (maxVariation / 100);
      noisyValue = Math.max(baseValue - maxNoise, Math.min(baseValue + maxNoise, noisyValue));

      // Ensure non-negative
      monteCarloResults[key].push(Math.max(0, Math.round(noisyValue * 100) / 100));
    }
  }

  // Calculate statistics
  const meanPrediction: Record<string, number> = {};
  const minPrediction: Record<string, number> = {};
  const maxPrediction: Record<string, number> = {};
  const stdPrediction: Record<string, number> = {};

  for (const key of nutritionKeys) {
    const values = monteCarloResults[key];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;

    meanPrediction[key] = Math.round(mean * 100) / 100;
    minPrediction[key] = Math.round(Math.min(...values) * 100) / 100;
    maxPrediction[key] = Math.round(Math.max(...values) * 100) / 100;
    stdPrediction[key] = Math.round(Math.sqrt(variance) * 100) / 100;
  }

  return { meanPrediction, minPrediction, maxPrediction, stdPrediction, monteCarloResults };
}

// ============================================================
// API ENDPOINTS
// ============================================================

export async function GET(request: Request) {
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

    // Build set of existing dates
    const existingDates = new Set<string>();
    for (const entry of allEntries) {
      existingDates.add(formatDateUTC(new Date(entry.date)));
    }

    // Calculate next predict date from LAST DATA (not from today)
    let lastDate = lastData ? new Date(lastData.date) : new Date();
    let nextPredictDate = addDaysUTC(lastDate, 1);

    // Find next weekday that doesn't have data
    while (isWeekend(nextPredictDate) || existingDates.has(formatDateUTC(nextPredictDate))) {
      nextPredictDate = addDaysUTC(nextPredictDate, 1);
    }

    const hasDataForNext = existingDates.has(formatDateUTC(nextPredictDate));

    return NextResponse.json({
      success: true,
      lastDataDate: lastData?.date || null,
      nextPredictDate: formatDateUTC(nextPredictDate),
      hasDataForNext,
      totalRecords: actualCount + predictedCount,
      actualDataCount: actualCount,
      predictedDataCount: predictedCount,
      canPredict: allEntries.length >= SLIDING_WINDOW_SIZE,
      hasEnoughData: allEntries.length >= SLIDING_WINDOW_SIZE,
      monteCarloEnabled: true,
      modelMetrics: MODEL_METRICS,
      message: hasDataForNext
        ? "Semua weekday sudah terisi"
        : allEntries.length >= SLIDING_WINDOW_SIZE
          ? `Siap memprediksi: ${formatDateUTC(nextPredictDate)} (Monte Carlo: ${MONTE_CARLO_ITERATIONS} simulasi)`
          : `Butuh minimal ${SLIDING_WINDOW_SIZE} data. Saat ini: ${allEntries.length}`,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetDateParam = body.date;

    const allEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "asc" },
    });

    if (allEntries.length < SLIDING_WINDOW_SIZE) {
      return NextResponse.json({
        error: `Need at least ${SLIDING_WINDOW_SIZE} data entries. Current: ${allEntries.length}`,
      }, { status: 400 });
    }

    const today = getTodayWIB();
    let nextDate: Date;

    if (targetDateParam) {
      nextDate = parseDateUTC(targetDateParam);
      // Skip weekends if target is weekend
      if (isWeekend(nextDate)) {
        nextDate = getNextBusinessDay(nextDate);
      }
    } else {
      const tomorrow = addDaysUTC(today, 1);
      nextDate = getNextBusinessDay(tomorrow);
    }

    // Don't predict for past dates
    if (nextDate <= today) {
      nextDate = getNextBusinessDay(addDaysUTC(today, 1));
    }

    const targetDateStr = formatDateUTC(nextDate);

    console.log(`[LSTM Monte Carlo] ============= PREDICTION REQUEST =============`);
    console.log(`[LSTM Monte Carlo] Today (WIB): ${formatDateUTC(today)}`);
    console.log(`[LSTM Monte Carlo] Target date: ${targetDateStr}`);
    console.log(`[LSTM Monte Carlo] Monte Carlo iterations: ${MONTE_CARLO_ITERATIONS}`);
    console.log(`[LSTM Monte Carlo] Model RMSE: ${MODEL_METRICS.RMSE}, MAPE: ${MODEL_METRICS.MAPE}%`);

    // Check if data already exists
    const existing = await prisma.dailyNutrition.findUnique({
      where: { date: nextDate },
    });

    if (existing) {
      console.log(`[LSTM Monte Carlo] Data untuk ${targetDateStr} sudah ada, skip.`);
      return NextResponse.json({
        success: true,
        message: "Data sudah ada untuk tanggal ini.",
        synced: 0,
        date: targetDateStr,
        existingData: {
          isPredicted: existing.isPredicted,
          energyBesar: existing.energyBesar,
          carbsBesar: existing.carbsBesar,
          proteinBesar: existing.proteinBesar,
          fatBesar: existing.fatBesar,
          fiberBesar: existing.fiberBesar,
          energyKecil: existing.energyKecil,
          carbsKecil: existing.carbsKecil,
          proteinKecil: existing.proteinKecil,
          fatKecil: existing.fatKecil,
          fiberKecil: existing.fiberKecil,
        },
      });
    }

    // Get recent entries for sliding window
    const recentEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "desc" },
      take: SLIDING_WINDOW_SIZE,
    });
    const inputEntries = recentEntries.reverse();
    const currentWindow = toFlaskData(inputEntries);

    console.log(`[LSTM Monte Carlo] Input window (${inputEntries.length} days):`);
    inputEntries.forEach((entry, i) => {
      const entryDate = formatDateUTC(new Date(entry.date));
      console.log(`  [${i}] ${entryDate} => [${currentWindow[i].join(", ")}]`);
    });

    // Call Flask API for base prediction
    const flaskResponse = await fetch(`${FLASK_API_URL}/predict_custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: currentWindow }),
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error(`[LSTM Monte Carlo] Flask error:`, errorText);
      return NextResponse.json({ error: "Flask API error: " + errorText }, { status: 500 });
    }

    const flaskResult = await flaskResponse.json();
    const basePrediction = fromFlaskResponse(flaskResult.prediksi_nutrisi);

    console.log(`[LSTM Monte Carlo] Base prediction:`, basePrediction);

    // Run Monte Carlo simulation
    console.log(`[LSTM Monte Carlo] Running Monte Carlo simulation...`);
    const mcResults = applyMonteCarloNoise(basePrediction, MONTE_CARLO_ITERATIONS);

    console.log(`[LSTM Monte Carlo] Monte Carlo mean:`, mcResults.meanPrediction);
    console.log(`[LSTM Monte Carlo] Monte Carlo range:`, mcResults.minPrediction, "-", mcResults.maxPrediction);

    // Use mean prediction for storage
    const nutritionData = mcResults.meanPrediction;

    // Save prediction to database
    await prisma.dailyNutrition.create({
      data: {
        date: nextDate,
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

    console.log(`[LSTM Monte Carlo] Created prediction for ${targetDateStr}:`, nutritionData);

    // Return results with Monte Carlo statistics
    return NextResponse.json({
      success: true,
      message: `Berhasil memprediksi nutrisi untuk ${targetDateStr} dengan Monte Carlo simulation`,
      synced: 1,
      date: targetDateStr,
      prediction: {
        // The stored value (mean)
        ...nutritionData,
        // Monte Carlo statistics
        monteCarlo: {
          iterations: MONTE_CARLO_ITERATIONS,
          metrics: MODEL_METRICS,
          basePrediction,        // Original LSTM prediction
          min: mcResults.minPrediction,
          max: mcResults.maxPrediction,
          std: mcResults.stdPrediction,
        },
      },
    });

  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Failed to predict" }, { status: 500 });
  }
}
