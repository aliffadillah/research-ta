import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================================
// CONFIG
// ============================================================
const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

// Error metrics from model evaluation
const MODEL_METRICS = {
  RMSE: 22.12,      // Root Mean Square Error for energi (kkal)
  MAPE: 34.27,      // Mean Absolute Percentage Error (%)
};

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

// Monte Carlo settings
const MONTE_CARLO_ITERATIONS = 100;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

function getNextBusinessDay(date: Date): Date {
  if (isWeekend(date)) {
    const next = new Date(date);
    while (isWeekend(next)) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
  return date;
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

// Box-Muller transform to generate normal distribution
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// Apply Monte Carlo noise based on RMSE
function applyMonteCarloNoise(baseValue: number, stdDev: number, maxVariationPercent: number): number {
  // Use normal distribution for more realistic variation
  let noisyValue = randomNormal(baseValue, stdDev);

  // Clamp to max variation percentage
  const maxVariation = baseValue * (maxVariationPercent / 100);
  noisyValue = Math.max(baseValue - maxVariation, Math.min(baseValue + maxVariation, noisyValue));

  // Ensure non-negative
  return Math.max(0, Math.round(noisyValue * 100) / 100);
}

// Calculate statistics from array of values
function calculateStats(values: number[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
  ci95: { lower: number; upper: number };
} {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const std = Math.sqrt(variance);

  // 95% Confidence Interval
  const ci95Lower = mean - 1.96 * std / Math.sqrt(n);
  const ci95Upper = mean + 1.96 * std / Math.sqrt(n);

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: Math.round(Math.min(...values) * 100) / 100,
    max: Math.round(Math.max(...values) * 100) / 100,
    std: Math.round(std * 100) / 100,
    ci95: {
      lower: Math.round(ci95Lower * 100) / 100,
      upper: Math.round(ci95Upper * 100) / 100,
    },
  };
}

// ============================================================
// API ENDPOINT
// ============================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const iterations = parseInt(searchParams.get("iterations") || String(MONTE_CARLO_ITERATIONS));

    // Get all entries
    const allEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "asc" },
    });

    if (allEntries.length < SLIDING_WINDOW_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Need at least ${SLIDING_WINDOW_SIZE} data entries. Current: ${allEntries.length}`,
      }, { status: 400 });
    }

    // Get today's date in WIB
    const getTodayWIB = () => {
      const now = new Date();
      const utcHours = now.getUTCHours();
      const wibHours = utcHours + 7;
      const today = new Date(now);
      if (wibHours >= 24) {
        today.setUTCDate(today.getUTCDate() + 1);
      }
      today.setUTCHours(0, 0, 0, 0);
      return today;
    };

    const today = getTodayWIB();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const nextDate = getNextBusinessDay(tomorrow);
    const targetDateStr = nextDate.toISOString().split("T")[0];

    // Check if data already exists
    const existing = await prisma.dailyNutrition.findUnique({
      where: { date: new Date(targetDateStr + "T00:00:00.000Z") },
    });

    // Get recent entries for sliding window
    const recentEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "desc" },
      take: SLIDING_WINDOW_SIZE,
    });
    const inputEntries = recentEntries.reverse();
    const currentWindow = toFlaskData(inputEntries);

    // Call Flask API for base prediction
    const flaskResponse = await fetch(`${FLASK_API_URL}/predict_custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: currentWindow }),
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error(`[Monte Carlo] Flask error:`, errorText);
      return NextResponse.json({ error: "Flask API error: " + errorText }, { status: 500 });
    }

    const flaskResult = await flaskResponse.json();
    const basePrediction = fromFlaskResponse(flaskResult.prediksi_nutrisi);

    console.log(`[Monte Carlo] Base prediction:`, basePrediction);
    console.log(`[Monte Carlo] Running ${iterations} simulations with RMSE=${MODEL_METRICS.RMSE}, MAPE=${MODEL_METRICS.MAPE}%`);

    // Run Monte Carlo simulation
    // RMSE is primarily for energi (energy), we estimate std for other nutrients proportionally
    const nutritionKeys = Object.keys(basePrediction);

    // Calculate RMSE for each nutrient based on typical proportions
    // Energi RMSE: 22.12 kkal (given)
    // Other nutrients: estimate based on typical variance ratios
    const rmseRatios: Record<string, number> = {
      energyBesar: 1.0,        // Base RMSE
      energyKecil: 0.65,       // Smaller portion
      carbsBesar: 15,           // ~15g typical RMSE
      carbsKecil: 10,          // Smaller portion
      proteinBesar: 5,         // ~5g typical RMSE
      proteinKecil: 3.5,       // Smaller portion
      fatBesar: 5,             // ~5g typical RMSE
      fatKecil: 3.5,          // Smaller portion
      fiberBesar: 2,          // ~2g typical RMSE
      fiberKecil: 1.5,         // Smaller portion
    };

    // Run simulations
    const simulations: Record<string, number[]> = {};
    const results: Record<string, ReturnType<typeof calculateStats>> = {};

    for (const key of nutritionKeys) {
      const baseValue = basePrediction[key];
      const stdDev = rmseRatios[key] || MODEL_METRICS.RMSE * 0.3;
      const maxVariation = MODEL_METRICS.MAPE;

      simulations[key] = [];
      for (let i = 0; i < iterations; i++) {
        const noisyValue = applyMonteCarloNoise(baseValue, stdDev, maxVariation);
        simulations[key].push(noisyValue);
      }

      results[key] = calculateStats(simulations[key]);
    }

    // Get a sample of simulations for visualization (10 samples)
    const sampleIndices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
    const simulationSamples: Record<string, number[]> = {};
    for (const key of nutritionKeys) {
      simulationSamples[key] = sampleIndices.map(i => simulations[key][i] || simulations[key][0]);
    }

    return NextResponse.json({
      success: true,
      date: targetDateStr,
      basePrediction,
      metrics: MODEL_METRICS,
      iterations,
      statistics: results,
      samples: simulationSamples,
      hasExistingData: !!existing,
      existingData: existing ? {
        energyBesar: existing.energyBesar,
        energyKecil: existing.energyKecil,
        carbsBesar: existing.carbsBesar,
        proteinBesar: existing.proteinBesar,
        fatBesar: existing.fatBesar,
      } : null,
    });

  } catch (error) {
    console.error("[Monte Carlo] Error:", error);
    return NextResponse.json({ error: "Failed to run Monte Carlo simulation" }, { status: 500 });
  }
}
