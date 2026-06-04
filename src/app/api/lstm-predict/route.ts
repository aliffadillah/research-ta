import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================================
// CONFIG
// ============================================================
const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

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
  // Cek apakah tanggal yang diberikan adalah weekend, jika ya skip ke Senin
  if (isWeekend(date)) {
    const next = new Date(date);
    while (isWeekend(next)) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
  return date;
}

// ============================================================
// API ENDPOINTS
// ============================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetDate = searchParams.get("date"); // Optional: check specific date

    // Get all entries for count and data check
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

    // Calculate next predict date
    let nextPredictDate: Date;
    if (lastData) {
      const tomorrow = new Date(lastData.date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextPredictDate = getNextBusinessDay(tomorrow);
    } else {
      nextPredictDate = new Date();
      nextPredictDate = getNextBusinessDay(nextPredictDate);
    }

    // Check if data exists for next predict date
    let hasDataForNext = false;
    if (lastData) {
      const existing = await prisma.dailyNutrition.findUnique({
        where: { date: nextPredictDate },
      });
      hasDataForNext = !!existing;
    }

    return NextResponse.json({
      success: true,
      lastDataDate: lastData?.date || null,
      nextPredictDate: nextPredictDate.toISOString().split("T")[0],
      hasDataForNext,
      totalRecords: actualCount + predictedCount,
      actualDataCount: actualCount,
      predictedDataCount: predictedCount,
      canPredict: allEntries.length >= SLIDING_WINDOW_SIZE,
      hasEnoughData: allEntries.length >= SLIDING_WINDOW_SIZE,
      message: hasDataForNext
        ? "Data untuk besok sudah ada"
        : allEntries.length >= SLIDING_WINDOW_SIZE
          ? "Siap memprediksi nutrisi untuk besok"
          : `Butuh minimal ${SLIDING_WINDOW_SIZE} data. Saat ini: ${allEntries.length}`,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body for optional date parameter
    const body = await request.json().catch(() => ({}));
    const targetDate = body.date; // Optional: specific date to predict for

    // 1. Ambil SEMUA data dari database, urut dari lama ke baru
    const allEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "asc" },
    });

    if (allEntries.length < SLIDING_WINDOW_SIZE) {
      return NextResponse.json({
        error: `Need at least ${SLIDING_WINDOW_SIZE} data entries. Current: ${allEntries.length}`,
      }, { status: 400 });
    }

    // 2. Tentukan tanggal target prediksi
    let nextDate: Date;

    if (targetDate) {
      // Jika user specify tanggal tertentu
      nextDate = new Date(targetDate);
      nextDate.setHours(0, 0, 0, 0);
    } else {
      // Default: prediksi untuk HARI ESOK ( besok )
      const lastDate = new Date(allEntries[allEntries.length - 1].date);
      const tomorrow = new Date(lastDate);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Skip weekend
      nextDate = getNextBusinessDay(tomorrow);
    }

    console.log(`[LSTM] ============= PREDICTION REQUEST =============`);
    console.log(`[LSTM] Target date: ${nextDate.toISOString().split("T")[0]}`);
    console.log(`[LSTM] Total entries in DB: ${allEntries.length}`);

    // 3. CEK: Jika data sudah ada untuk tanggal ini, skip
    const existing = await prisma.dailyNutrition.findUnique({
      where: { date: nextDate },
    });

    if (existing) {
      console.log(`[LSTM] Data untuk ${nextDate.toISOString().split("T")[0]} sudah ada, skip.`);
      return NextResponse.json({
        success: true,
        message: "Data sudah ada untuk tanggal ini.",
        synced: 0,
        date: nextDate.toISOString().split("T")[0],
        existingData: {
          isPredicted: existing.isPredicted,
          energyBesar: existing.energyBesar,
          carbsBesar: existing.carbsBesar,
          proteinBesar: existing.proteinBesar,
        },
      });
    }

    // 4. Ambil 7 data terakhir dari database untuk sliding window
    const recentEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "desc" },
      take: SLIDING_WINDOW_SIZE,
    });

    // Balik urutan (dari lama ke baru) untuk input LSTM
    const inputEntries = recentEntries.reverse();
    const currentWindow = toFlaskData(inputEntries);

    console.log(`[LSTM] Input window (${inputEntries.length} days):`);
    inputEntries.forEach((entry, i) => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0];
      console.log(`  [${i}] ${entryDate} => [${currentWindow[i].join(", ")}]`);
    });

    // 5. Call Flask API untuk prediction (1 hari saja)
    // Menggunakan endpoint /predict_custom yang menerima array 2D JSON
    const flaskResponse = await fetch(`${FLASK_API_URL}/predict_custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: currentWindow }),
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error(`[LSTM] Flask error:`, errorText);
      return NextResponse.json({ error: "Flask API error: " + errorText }, { status: 500 });
    }

    const flaskResult = await flaskResponse.json();
    const prediction = flaskResult.prediksi_nutrisi;

    console.log(`[LSTM] Prediction result:`, prediction);

    // 6. Convert ke format Prisma
    const nutritionData = fromFlaskResponse(prediction);
    const dateStr = nextDate.toISOString().split("T")[0];

    // 7. Simpan prediksi (hanya CREATE, tidak UPDATE)
    await prisma.dailyNutrition.create({
      data: {
        date: new Date(nextDate),
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

    console.log(`[LSTM] Created prediction for ${dateStr}:`, nutritionData);

    return NextResponse.json({
      success: true,
      message: `Berhasil memprediksi nutrisi untuk ${dateStr}`,
      synced: 1,
      date: dateStr,
      prediction: nutritionData,
    });

  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Failed to predict" }, { status: 500 });
  }
}