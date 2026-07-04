import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSV, normalizeNutritionData, validateCSVColumns, parseCSVLine } from "@/lib/utils/csv-parser";

// GET - Health check
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Nutrition file API is running" });
}

// POST - Preview atau Import dari file JSON/CSV
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("API received:", { action: body.action, fileType: body.fileType, dataLength: body.data?.length });

    // Handle file upload untuk preview atau import
    if (body.action === "preview") {
      return previewFile(body.data, body.fileType);
    }

    if (body.action === "import") {
      return importData(body.data, body.fileType);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Nutrition file handler error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}

async function previewFile(data: unknown, fileType: "json" | "csv") {
  try {
    console.log("Preview function started, fileType:", fileType);

    let parsedData: Record<string, string | number>[] = [];

    // For CSV files, validate columns first
    if (fileType === "csv") {
      const csvContent = data as string;
      const lines = csvContent.trim().split("\n");
      if (lines.length === 0) {
        return NextResponse.json({ error: "File CSV kosong" }, { status: 400 });
      }

      // Parse header row
      const headers = parseCSVLine(lines[0]);
      console.log("CSV Headers:", headers);

      // Validate columns
      const columnValidation = validateCSVColumns(headers);
      console.log("Column validation result:", columnValidation);

      if (!columnValidation.isValid) {
        // Create human-readable column names for the missing columns
        const columnNames: Record<string, string> = {
          date: "Tanggal",
          carbsBesar: "Karbohidrat Besar",
          proteinBesar: "Protein Besar",
          fatBesar: "Lemak Besar",
          fiberBesar: "Serat Besar",
          energyBesar: "Energi Besar",
          carbsKecil: "Karbohidrat Kecil",
          proteinKecil: "Protein Kecil",
          fatKecil: "Lemak Kecil",
          fiberKecil: "Serat Kecil",
          energyKecil: "Energi Kecil",
        };
        const missingLabels = columnValidation.missingColumns.map(col => columnNames[col] || col);

        return NextResponse.json({
          success: false,
          error: "Kolom CSV tidak lengkap",
          columnValidation,
          message: `File CSV tidak memiliki kolom yang diperlukan:\n\n• ${missingLabels.join("\n• ")}\n\nPastikan file CSV memiliki 11 kolom: Tanggal, Karbohidrat Besar, Protein Besar, Lemak Besar, Serat Besar, Energi Besar, Karbohidrat Kecil, Protein Kecil, Lemak Kecil, Serat Kecil, Energi Kecil.`,
        }, { status: 400 });
      }

      // Parse CSV data
      parsedData = parseCSV(data as string);
    } else {
      // Parse JSON data - handle both array and object with data property
      const jsonData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("JSON parsed, isArray:", Array.isArray(jsonData));
      if (Array.isArray(jsonData)) {
        parsedData = jsonData;
      } else if (jsonData.data) {
        parsedData = jsonData.data;
      } else {
        return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
      }
    }

    console.log("Parsed data count:", parsedData.length);

    // Normalize and validate data
    const normalizedData = normalizeNutritionData(parsedData as Record<string, string | number>[], fileType);
    console.log("Normalized data count:", normalizedData.length);

    // Count statistics
    const validCount = normalizedData.filter(d => d.isValid).length;
    const invalidCount = normalizedData.length - validCount;

    // Get date range
    const validRows = normalizedData.filter(d => d.isValid);
    const dates = validRows.map(d => d.date).sort();

    console.log("Preview complete, valid:", validCount, "invalid:", invalidCount);

    return NextResponse.json({
      success: true,
      preview: normalizedData.slice(0, 10), // First 10 rows for preview
      totalRows: normalizedData.length,
      validRows: validCount,
      invalidRows: invalidCount,
      dateRange: dates.length > 0 ? {
        start: dates[0],
        end: dates[dates.length - 1],
      } : null,
    });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json({ error: "Failed to preview file" }, { status: 500 });
  }
}

async function importData(data: unknown, fileType: "json" | "csv") {
  try {
    let parsedData: Record<string, string | number>[] = [];

    // Parse data sama seperti preview
    if (fileType === "csv") {
      parsedData = parseCSV(data as string);
    } else {
      const jsonData = typeof data === "string" ? JSON.parse(data) : data;
      if (Array.isArray(jsonData)) {
        parsedData = jsonData;
      } else if (jsonData.data) {
        parsedData = jsonData.data;
      }
    }

    const normalizedData = normalizeNutritionData(parsedData as Record<string, string>[], fileType);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const item of normalizedData) {
      if (!item.isValid) {
        errors++;
        continue;
      }

      try {
        const date = new Date(item.date);

        // Check if data already exists
        const existing = await prisma.dailyNutrition.findUnique({
          where: { date },
        });

        const nutritionData = {
          carbsBesar: item.carbsBesar,
          proteinBesar: item.proteinBesar,
          fatBesar: item.fatBesar,
          fiberBesar: item.fiberBesar,
          energyBesar: item.energyBesar,
          carbsKecil: item.carbsKecil,
          proteinKecil: item.proteinKecil,
          fatKecil: item.fatKecil,
          fiberKecil: item.fiberKecil,
          energyKecil: item.energyKecil,
        };

        if (existing) {
          // Update existing record
          await prisma.dailyNutrition.update({
            where: { date },
            data: nutritionData,
          });
          updated++;
        } else {
          // Create new record
          await prisma.dailyNutrition.create({
            data: {
              date,
              ...nutritionData,
            },
          });
          created++;
        }
      } catch (itemError) {
        console.error(`Error processing date ${item.date}:`, itemError);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import selesai: ${created} dibuat, ${updated} diperbarui, ${errors} error`,
      created,
      updated,
      errors,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import data" }, { status: 500 });
  }
}
