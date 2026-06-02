import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const parseNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const clean = value.replace(/[^\d,.-]/g, "").replace(",", ".");
    return Number.parseFloat(clean) || 0;
  }
  return 0;
};

const readJson = <T>(...segments: string[]): T => {
  const filePath = path.resolve(process.cwd(), ...segments);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
};

async function seedFoods() {
  console.log("Seeding foods from JSON...");

  const jsonData = readJson<Array<Record<string, unknown>>>(
    "data",
    "Data-Gizi-Jenis-Makanan.json"
  );

  const foods = jsonData
    .map((item) => {
      const name = item["Nama Jenis Makanan"] as string;
      const gizi = (item["Kandungan Gizi"] || {}) as Record<string, unknown>;

      return {
        name,
        calories: parseNumber(gizi["Energi"]),
        fat: parseNumber(gizi["Lemak"]),
        protein: parseNumber(gizi["Protein"]),
        carbs: parseNumber(gizi["Karbohidrat"]),
        fiber: parseNumber(gizi["Serat"]),
        portionSize: 100,
        portionUnit: "g",
      };
    })
    .filter((food) => food.name.length > 0);

  await prisma.food.deleteMany();
  const created = await prisma.food.createMany({ data: foods });

  console.log(`✅ Inserted ${created.count} foods`);
}

async function seedNutritionStandards() {
  console.log("Seeding nutrition standards from JSON...");

  const akgData = readJson<Record<string, Array<Record<string, unknown>>>>(
    "data",
    "AKG_dan_Data_GIZI_MBG_Grouped.json"
  );

  const genderMap: Record<string, string> = {
    "Bayi/Anak": "bayi_anak",
    "Laki-Laki": "laki_laki",
    Perempuan: "perempuan",
  };

  const standards = Object.entries(akgData).flatMap(([group, entries]) => {
    const gender = genderMap[group] || group;
    return entries.map((entry) => ({
      gender,
      ageGroup: entry["Kelompok Umur"] as string,
      bodyWeight: parseNumber(entry["Berat Badan (Kg)"]),
      bodyHeight: parseNumber(entry["Tinggi Badan (cm)"]),
      energy: parseNumber(entry["Energi"]),
      fat: parseNumber(entry["Lemak"]),
      protein: parseNumber(entry["Protein"]),
      carbs: parseNumber(entry["Karbohidrat"]),
      fiber: parseNumber(entry["Serat"]),
    }));
  });

  await prisma.nutritionStandard.deleteMany();
  const created = await prisma.nutritionStandard.createMany({ data: standards });

  console.log(`✅ Inserted ${created.count} nutrition standards`);
}

async function seedMenuRecommendations() {
  console.log("Seeding menu recommendations from JSON...");

  const menuData = readJson<Array<Record<string, unknown>>>(
    "data",
    "MBG_Historis_Latest.json"
  );

  const menus = menuData.map((item) => ({
    name: item["Menu"] as string,
    description: (item["Jenis Makanan"] as string) || null,
    tanggal: (item["Tanggal"] as string) || "",
    caloriesBesar: parseNumber(item["Energi Besar"]),
    proteinBesar: parseNumber(item["Protein Besar"]),
    carbsBesar: parseNumber(item["Karbohidrat Besar"]),
    fatBesar: parseNumber(item["Lemak Besar"]),
    fiberBesar: parseNumber(item["Serat Besar"]),
    caloriesKecil: parseNumber(item["Energi Kecil"]),
    proteinKecil: parseNumber(item["Protein Kecil"]),
    carbsKecil: parseNumber(item["Karbohidrat Kecil"]),
    fatKecil: parseNumber(item["Lemak Kecil"]),
    fiberKecil: parseNumber(item["Serat Kecil"]),
    isActive: true,
  }));

  await prisma.menuRecommendation.deleteMany();
  const created = await prisma.menuRecommendation.createMany({ data: menus });

  console.log(`✅ Inserted ${created.count} menu recommendations`);
}

async function main() {
  await seedFoods();
  await seedNutritionStandards();
  await seedMenuRecommendations();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });