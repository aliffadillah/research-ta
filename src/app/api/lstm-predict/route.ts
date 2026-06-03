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

export async function GET() {
  try {
    const lastData = await prisma.dailyNutrition.findFirst({
      orderBy: { date: "desc" },
    });

    const predictedCount = await prisma.dailyNutrition.count({
      where: { isPredicted: true },
    });

    const actualCount = await prisma.dailyNutrition.count({
      where: { isPredicted: false },
    });

    return NextResponse.json({
      lastDate: lastData?.date,
      totalRecords: actualCount + predictedCount,
      actualDataCount: actualCount,
      predictedDataCount: predictedCount,
      needsSync: lastData ? isWeekend(lastData.date) : true,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}

export async function POST() {
  try {
    // 1. Ambil SEMUA data dari database, urut dari lama ke baru
    const allEntries = await prisma.dailyNutrition.findMany({
      orderBy: { date: "asc" },
    });

    if (allEntries.length < SLIDING_WINDOW_SIZE) {
      return NextResponse.json({
        error: `Need at least ${SLIDING_WINDOW_SIZE} data entries. Current: ${allEntries.length}`,
      }, { status: 400 });
    }

    // 2. Tentukan tanggal mulai prediksi (hari setelah data terakhir)
    const lastDate = new Date(allEntries[allEntries.length - 1].date);

    // Hitung tanggal mulai: hari setelah data terakhir
    const startDate = new Date(lastDate);
    startDate.setDate(startDate.getDate() + 1);

    // Skip weekend untuk tanggal mulai
    let nextDate = getNextBusinessDay(startDate);

    // Dapatkan tanggal hari ini di UTC, lalu konversi ke WIB (UTC+7)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const wibHours = utcHours + 7;

    // Buat tanggal today berdasarkan UTC date, tapi dengan jam WIB
    const today = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    // Jika WIB sudah melewati tengah malam UTC, adjust tanggal
    if (wibHours >= 24) {
      today.setUTCDate(today.getUTCDate() + 1);
    }

    console.log(`[LSTM] ============= DEBUG INFO =============`);
    console.log(`[LSTM] UTC time: ${now.toISOString()}`);
    console.log(`[LSTM] UTC hours: ${utcHours}, WIB hours: ${wibHours}`);
    console.log(`[LSTM] Last data date (from DB): ${lastDate.toISOString()}`);
    console.log(`[LSTM] Last date (local): ${lastDate.toLocaleDateString("id-ID")}`);
    console.log(`[LSTM] Start date (next day): ${startDate.toLocaleDateString("id-ID")}`);
    console.log(`[LSTM] Next date (after weekend skip): ${nextDate.toLocaleDateString("id-ID")}`);
    console.log(`[LSTM] Today (WIB, adjusted): ${today.toLocaleDateString("id-ID")}`);
    console.log(`[LSTM] Next date time (ms): ${nextDate.getTime()}`);
    console.log(`[LSTM] Today time (ms): ${today.getTime()}`);
    console.log(`[LSTM] Comparison: ${nextDate.getTime()} > ${today.getTime()} = ${nextDate.getTime() > today.getTime()}`);
    console.log(`[LSTM] ============= DEBUG END =============`);

    // Jika tanggal mulai sudah lebih dari hari ini, berarti sudah up-to-date
    // nextDate > today = up-to-date (tidak bisa prediksi tanggal yang belum datang)
    // nextDate <= today = BISA prediksi (tanggal sudah reachable)
    if (nextDate.getTime() > today.getTime()) {
      console.log(`[LSTM] RETURN: up-to-date (nextDate > today)`);
      return NextResponse.json({
        success: true,
        message: "Data sudah up-to-date. Tidak ada tanggal yang perlu diprediksi.",
        synced: 0,
        debug: {
          lastDate: lastDate.toISOString(),
          nextDate: nextDate.toISOString(),
          today: today.toISOString(),
          reason: "nextDate is in the future"
        }
      });
    }

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