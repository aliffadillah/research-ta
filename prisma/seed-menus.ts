/**
 * Script to seed menu data from SPPG
 * Run with: npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-menus.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const menuData = [
  {
    no: 1,
    daftar_menu: ["Apel", "Tempe Goreng", "Ayam Goreng", "Gudeg", "Nasi"],
    kandungan_gizi_porsi_besar: { energi: "625 kkal", lemak: "26 g", protein: "18 g", karbohidrat: "81 g", serat: "5 g" },
    kandungan_gizi_porsi_kecil: { energi: "520 kkal", lemak: "25 g", protein: "17 g", karbohidrat: "65 g", serat: "5,2 g" },
  },
  {
    no: 2,
    daftar_menu: ["Telur Semur isi Pepaya", "Pisang", "Tahu", "Lontong"],
    kandungan_gizi_porsi_besar: { energi: "570 kkal", lemak: "19 g", protein: "20 g", karbohidrat: "85 g", serat: "3 g" },
    kandungan_gizi_porsi_kecil: { energi: "480 kkal", lemak: "18 g", protein: "19 g", karbohidrat: "65 g", serat: "2,9 g" },
  },
  {
    no: 3,
    daftar_menu: ["Mie", "Sawi", "Ayam Semur Kecap", "Tempe Sagu", "Pisang"],
    kandungan_gizi_porsi_besar: { energi: "645 kkal", lemak: "25 g", protein: "15 g", karbohidrat: "95 g", serat: "0 g" },
    kandungan_gizi_porsi_kecil: { energi: "525 kkal", lemak: "22 g", protein: "13 g", karbohidrat: "75 g", serat: "0 g" },
  },
  {
    no: 4,
    daftar_menu: ["Apel", "Kacang Merah", "Telur", "Fla Susu", "Jagung"],
    kandungan_gizi_porsi_besar: { energi: "560 kkal", lemak: "19 g", protein: "21 g", karbohidrat: "90 g", serat: "0 g" },
    kandungan_gizi_porsi_kecil: { energi: "425 kkal", lemak: "19 g", protein: "19 g", karbohidrat: "70 g", serat: "0 g" },
  },
  {
    no: 5,
    daftar_menu: ["Tahu", "Tumis Koll Wortel", "Telur Semur", "Kelengkeng", "Nasi"],
    kandungan_gizi_porsi_besar: { energi: "630 kkal", lemak: "19 g", protein: "20 g", karbohidrat: "95 g", serat: "2,3 g" },
    kandungan_gizi_porsi_kecil: { energi: "522 kkal", lemak: "18 g", protein: "19 g", karbohidrat: "75 g", serat: "2,2 g" },
  },
  {
    no: 6,
    daftar_menu: ["Salad Buah", "Tempe Goreng", "Rolade Asam Manis", "Capcay", "Nasi"],
    kandungan_gizi_porsi_besar: { energi: "673 kkal", lemak: "22 g", protein: "20 g", karbohidrat: "101 g", serat: "3,2 g" },
    kandungan_gizi_porsi_kecil: { energi: "583 kkal", lemak: "21 g", protein: "19 g", karbohidrat: "81 g", serat: "3,1 g" },
  },
  {
    no: 7,
    daftar_menu: ["Nasi", "Anggur", "Tumis Keciwis", "Tahu", "Lele Crispiy"],
    kandungan_gizi_porsi_besar: { energi: "556 kkal", lemak: "15 g", protein: "18 g", karbohidrat: "85 g", serat: "0 g" },
    kandungan_gizi_porsi_kecil: { energi: "445 kkal", lemak: "15 g", protein: "17 g", karbohidrat: "64 g", serat: "0 g" },
  },
  {
    no: 8,
    daftar_menu: ["Ketimun dan Selada", "Anggur", "Chicken Katsu", "Keju", "Roti"],
    kandungan_gizi_porsi_besar: { energi: "554 kkal", lemak: "26 g", protein: "19 g", karbohidrat: "60 g", serat: "3 g" },
    kandungan_gizi_porsi_kecil: { energi: "254 kkal", lemak: "26 g", protein: "16 g", karbohidrat: "40 g", serat: "2 g" },
  },
  {
    no: 9,
    daftar_menu: ["Nasi Daun Jeruk", "Ketimun dan Selada", "Ayam Serundeng", "Pepes Tahu", "Pisang Lampung"],
    kandungan_gizi_porsi_besar: { energi: "587 kkal", lemak: "24 g", protein: "18 g", karbohidrat: "78 g", serat: "4 g" },
    kandungan_gizi_porsi_kecil: { energi: "474 kkal", lemak: "22 g", protein: "15 g", karbohidrat: "60 g", serat: "3 g" },
  },
  {
    no: 10,
    daftar_menu: ["Jeruk", "Tahu Crispy", "Bakso Saus BBQ", "Acar Timun Wortel", "Kwetiaw"],
    kandungan_gizi_porsi_besar: { energi: "595 kkal", lemak: "30 g", protein: "20 g", karbohidrat: "65 g", serat: "3 g" },
    kandungan_gizi_porsi_kecil: { energi: "495 kkal", lemak: "25 g", protein: "17 g", karbohidrat: "55 g", serat: "2 g" },
  },
];

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  // Handle values like "625 kkal", "26 g", "5,2 g"
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

async function seedMenuData() {
  console.log("🗑️  Deleting existing menu recommendations...");
  await prisma.menuRecommendation.deleteMany({});

  console.log("📝 Seeding menu data from SPPG...");

  const menus = menuData.map((item) => ({
    name: `Menu ${item.no}`,
    description: item.daftar_menu.join(", "),
    tanggal: "",
    daftarMenu: item.daftar_menu,
    // Porsi Besar
    caloriesBesar: parseNumber(item.kandungan_gizi_porsi_besar.energi),
    proteinBesar: parseNumber(item.kandungan_gizi_porsi_besar.protein),
    carbsBesar: parseNumber(item.kandungan_gizi_porsi_besar.karbohidrat),
    fatBesar: parseNumber(item.kandungan_gizi_porsi_besar.lemak),
    fiberBesar: parseNumber(item.kandungan_gizi_porsi_besar.serat),
    // Porsi Kecil
    caloriesKecil: parseNumber(item.kandungan_gizi_porsi_kecil.energi),
    proteinKecil: parseNumber(item.kandungan_gizi_porsi_kecil.protein),
    carbsKecil: parseNumber(item.kandungan_gizi_porsi_kecil.karbohidrat),
    fatKecil: parseNumber(item.kandungan_gizi_porsi_kecil.lemak),
    fiberKecil: parseNumber(item.kandungan_gizi_porsi_kecil.serat),
    isActive: true,
  }));

  const created = await prisma.menuRecommendation.createMany({ data: menus });

  console.log(`✅ Successfully seeded ${created.count} menu recommendations from SPPG`);
}

seedMenuData()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
