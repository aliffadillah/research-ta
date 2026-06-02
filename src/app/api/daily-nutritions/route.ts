import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIndonesianDate } from "@/lib/utils/date-parser";
import fs from "fs";
import path from "path";

// Tipe data sesuai JSON
interface NutritionJSON {
  Tanggal: string;
  "Karbohidrat Besar": number;
  "Protein Besar": number;
  "Lemak Besar": number;
  "Serat Besar": number;
  "Energi Besar": number;
  "Karbohidrat Kecil": number;
  "Protein Kecil": number;
  "Lemak Kecil": number;
  "Serat Kecil": number;
  "Energi Kecil": number;
}

// GET - Ambil semua data daily nutrition
export async function GET() {
  try {
    const nutritions = await prisma.dailyNutrition.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json(nutritions);
  } catch (error) {
    console.error("Get daily nutrition error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST - Tambah data manual atau import dari JSON
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check jika ini request untuk import dari JSON
    if (body.type === "import") {
      return importFromJSON();
    }

    // Manual create
    const {
      date,
      carbsBesar,
      proteinBesar,
      fatBesar,
      fiberBesar,
      energyBesar,
      carbsKecil,
      proteinKecil,
      fatKecil,
      fiberKecil,
      energyKecil,
    } = body;

    const nutrition = await prisma.dailyNutrition.create({
      data: {
        date: new Date(date),
        carbsBesar: carbsBesar || 0,
        proteinBesar: proteinBesar || 0,
        fatBesar: fatBesar || 0,
        fiberBesar: fiberBesar || 0,
        energyBesar: energyBesar || 0,
        carbsKecil: carbsKecil || 0,
        proteinKecil: proteinKecil || 0,
        fatKecil: fatKecil || 0,
        fiberKecil: fiberKecil || 0,
        energyKecil: energyKecil || 0,
      },
    });

    return NextResponse.json(nutrition, { status: 201 });
  } catch (error) {
    console.error("Create daily nutrition error:", error);
    return NextResponse.json({ error: "Failed to create data" }, { status: 500 });
  }
}

// PUT - Update data
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Convert date string to Date if present
    if (data.date) {
      data.date = new Date(data.date);
    }

    const nutrition = await prisma.dailyNutrition.update({
      where: { id },
      data,
    });

    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("Update daily nutrition error:", error);
    return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
  }
}

// DELETE - Hapus data
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.dailyNutrition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete daily nutrition error:", error);
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
  }
}

// Helper function untuk import dari JSON file
async function importFromJSON() {
  try {
    // Path ke file JSON
    const jsonPath = path.join(process.cwd(), "data", "MBG_Historis_Latest_2.json");

    // Read file
    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    const jsonData: NutritionJSON[] = JSON.parse(fileContent);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const item of jsonData) {
      try {
        const date = parseIndonesianDate(item.Tanggal);

        // Check jika data sudah ada
        const existing = await prisma.dailyNutrition.findUnique({
          where: { date },
        });

        const data = {
          carbsBesar: item["Karbohidrat Besar"] || 0,
          proteinBesar: item["Protein Besar"] || 0,
          fatBesar: item["Lemak Besar"] || 0,
          fiberBesar: item["Serat Besar"] || 0,
          energyBesar: item["Energi Besar"] || 0,
          carbsKecil: item["Karbohidrat Kecil"] || 0,
          proteinKecil: item["Protein Kecil"] || 0,
          fatKecil: item["Lemak Kecil"] || 0,
          fiberKecil: item["Serat Kecil"] || 0,
          energyKecil: item["Energi Kecil"] || 0,
        };

        if (existing) {
          // Update existing record
          await prisma.dailyNutrition.update({
            where: { date },
            data,
          });
          updated++;
        } else {
          // Create new record
          await prisma.dailyNutrition.create({
            data: {
              date,
              ...data,
            },
          });
          created++;
        }
      } catch (itemError) {
        console.error(`Error processing date ${item.Tanggal}:`, itemError);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${created} created, ${updated} updated, ${errors} errors`,
      created,
      updated,
      errors,
    });
  } catch (error) {
    console.error("Import from JSON error:", error);
    return NextResponse.json({ error: "Failed to import data" }, { status: 500 });
  }
}
