const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const foodData = [
  {
    name: "Acar Timun Wortel",
    calories: 38,
    protein: 0.6,
    carbs: 9,
    fat: 0.3,
    fiber: 0.6,
  },
  {
    name: "Anggur",
    calories: 30,
    protein: 0.5,
    carbs: 6.8,
    fat: 0.2,
    fiber: 1.2,
  },
  {
    name: "Apel",
    calories: 58,
    protein: 0.4,
    carbs: 14.9,
    fat: 0.3,
    fiber: 2.6,
  },
  {
    name: "Ayam Goreng",
    calories: 245,
    protein: 11.4,
    carbs: 0.3,
    fat: 33.1,
    fiber: 0,
  },
  {
    name: "Ayam Serundeng",
    calories: 245,
    protein: 11.4,
    carbs: 0.3,
    fat: 33.1,
    fiber: 0,
  },
  {
    name: "Bakso Saus BBQ",
    calories: 114,
    protein: 5.3,
    carbs: 16.4,
    fat: 3.0,
    fiber: 0.1,
  },
  {
    name: "Capcay",
    calories: 97,
    protein: 5.8,
    carbs: 4.2,
    fat: 6.3,
    fiber: 0.6,
  },
  {
    name: "Chicken Katsu",
    calories: 358,
    protein: 36,
    carbs: 14,
    fat: 16,
    fiber: 0.6,
  },
  {
    name: "Fla Susu",
    calories: 61,
    protein: 3.2,
    carbs: 4.3,
    fat: 3.3,
    fiber: 0,
  },
  {
    name: "Gudeg",
    calories: 160,
    protein: 3.3,
    carbs: 16.0,
    fat: 9.2,
    fiber: 2.3,
  },
  {
    name: "Jagung",
    calories: 142,
    protein: 5,
    carbs: 30.3,
    fat: 0.7,
    fiber: 0,
  },
  {
    name: "Jeruk",
    calories: 45,
    protein: 0.9,
    carbs: 11.2,
    fat: 0.2,
    fiber: 0,
  },
  {
    name: "Kacang Merah",
    calories: 158,
    protein: 10.3,
    carbs: 28.2,
    fat: 0.9,
    fiber: 2.6,
  },
  {
    name: "Keju",
    calories: 326,
    protein: 22.8,
    carbs: 13.1,
    fat: 20.3,
    fiber: 0,
  },
  {
    name: "Kelengkeng",
    calories: 60,
    protein: 1.0,
    carbs: 15,
    fat: 0.1,
    fiber: 1.1,
  },
  {
    name: "Ketimun dan Selada",
    calories: 26,
    protein: 1.4,
    carbs: 4.3,
    fat: 0.4,
    fiber: 2.1,
  },
  {
    name: "Kwetiaw",
    calories: 163,
    protein: 2.5,
    carbs: 37.5,
    fat: 0.3,
    fiber: 0.2,
  },
  {
    name: "Lele Crispy",
    calories: 372,
    protein: 7.8,
    carbs: 3.5,
    fat: 6.3,
    fiber: 0,
  },
  {
    name: "Lontong",
    calories: 216,
    protein: 4.5,
    carbs: 48,
    fat: 0.5,
    fiber: 0.6,
  },
  {
    name: "Mie",
    calories: 102,
    protein: 6.2,
    carbs: 10.5,
    fat: 3.9,
    fiber: 0,
  },
  {
    name: "Nasi",
    calories: 180,
    protein: 3,
    carbs: 39.8,
    fat: 0.3,
    fiber: 0.2,
  },
  {
    name: "Nasi Daun Jeruk",
    calories: 180,
    protein: 3,
    carbs: 39.8,
    fat: 0.3,
    fiber: 0.2,
  },
  {
    name: "Pepes Tahu",
    calories: 76,
    protein: 5.2,
    carbs: 10.6,
    fat: 1.8,
    fiber: 2.2,
  },
  {
    name: "Pisang",
    calories: 127,
    protein: 1.4,
    carbs: 21.0,
    fat: 0.2,
    fiber: 1.3,
  },
  {
    name: "Pisang Lampung",
    calories: 99,
    protein: 1.3,
    carbs: 25.6,
    fat: 0.2,
    fiber: 4.3,
  },
  {
    name: "Rolade Asam Manis",
    calories: 406,
    protein: 30,
    carbs: 16,
    fat: 23,
    fiber: 0.3,
  },
  {
    name: "Roti",
    calories: 248,
    protein: 0.8,
    carbs: 50.0,
    fat: 1.2,
    fiber: 9.1,
  },
  {
    name: "Salad Buah",
    calories: 244,
    protein: 1.3,
    carbs: 29,
    fat: 15.5,
    fiber: 3.5,
  },
  {
    name: "Sawi",
    calories: 28,
    protein: 2.3,
    carbs: 4.0,
    fat: 0.3,
    fiber: 2.5,
  },
  {
    name: "Sayur Isi Pepaya",
    calories: 49,
    protein: 1.7,
    carbs: 9.8,
    fat: 0.3,
    fiber: 2.7,
  },
  {
    name: "Semur Ayam Kecap",
    calories: 336,
    protein: 26.5,
    carbs: 10,
    fat: 20,
    fiber: 0,
  },
  {
    name: "Tahu",
    calories: 115,
    protein: 9.7,
    carbs: 2.5,
    fat: 8.5,
    fiber: 0.1,
  },
  {
    name: "Tahu Crispy",
    calories: 115,
    protein: 9.7,
    carbs: 2.5,
    fat: 8.5,
    fiber: 0.1,
  },
  {
    name: "Telur",
    calories: 251,
    protein: 16.3,
    carbs: 1.4,
    fat: 19.4,
    fiber: 0,
  },
  {
    name: "Telur Semur",
    calories: 251,
    protein: 16.3,
    carbs: 1.4,
    fat: 19.4,
    fiber: 0,
  },
  {
    name: "Tempe Goreng",
    calories: 350,
    protein: 24.5,
    carbs: 10.4,
    fat: 26.6,
    fiber: 4.2,
  },
  {
    name: "Tempe Sagu",
    calories: 350,
    protein: 24.5,
    carbs: 10.4,
    fat: 26.6,
    fiber: 4.2,
  },
  {
    name: "Tumis Keciwis",
    calories: 66,
    protein: 1.7,
    carbs: 3.6,
    fat: 5.2,
    fiber: 1.2,
  },
  {
    name: "Tumis Koll Wortel",
    calories: 92,
    protein: 1.9,
    carbs: 9.3,
    fat: 5.5,
    fiber: 1.7,
  },
];

async function seed() {
  console.log("🌱 Starting seed...");

  // Delete existing data
  console.log("🗑️  Deleting existing foods...");
  await prisma.food.deleteMany();

  // Insert new data
  console.log("📝 Inserting new foods...");
  const created = await prisma.food.createMany({
    data: foodData.map((food) => ({
      name: food.name,
      nameId: food.name.toLowerCase().replace(/\s+/g, "_"),
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      portionSize: 100,
      portionUnit: "g",
    })),
  });

  console.log(`✅ Created ${created.count} food records!`);
  console.log("🌱 Seed completed!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
