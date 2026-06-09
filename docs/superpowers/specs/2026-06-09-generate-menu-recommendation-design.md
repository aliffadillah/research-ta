# Design Spec: Generate Menu Rekomendasi

## Overview

Fitur untuk generate kombinasi menu harian (5 komponen) dari daftar makanan yang ada di database, berdasarkan target nutrisi dari tabel DailyNutrition.

## Problem Statement

Aplikasi MBG saat ini memiliki:
- Daftar makanan (`Foods` table) dengan data nutrisi
- Target nutrisi harian (`DailyNutrition` table) per tanggal
- Kebutuhan untuk menghasilkan menu kombinasi yang memenuhi 5 komponen nutrisi

Fitur ini akan secara otomatis membuat kombinasi makanan dari 5 kategori yang total nutrisinya sesuai target.

## Requirements

### Core Features

1. **Generate Menu Kombinasi**
   - Input: Tanggal (date picker)
   - Output: 3 kombinasi menu terbaik untuk Porsi Besar dan Porsi Kecil
   - Setiap menu terdiri dari 5 komponen: Makanan Pokok, Lauk Pauk, Lauk Nabati, Sayur, Buah

2. **Target Nutrisi**
   - Sumber: Tabel `DailyNutrition` berdasarkan tanggal
   - 5 komponen: Energi (kkal), Protein (g), Karbohidrat (g), Lemak (g), Serat (g)
   - Proporsi per komponen dalam satu menu:
     - Makanan Pokok: ~30% kalori target
     - Lauk Pauk: ~35% protein target
     - Lauk Nabati: ~15% protein target
     - Sayur: ~40% serat target
     - Buah: ~25% serat target

3. **Match Score Calculation**
   - Score 0-100% berdasarkan kedekatan total nutrisi kombinasi dengan target
   - Weighted average: Kalori(40%), Protein(25%), Karbo(15%), Lemak(10%), Serat(10%)

4. **Output Display**
   - Tampilkan 3 kombinasi terbaik
   - 2 versi: Porsi Besar dan Porsi Kecil
   - Detail per komponen (nama makanan, porsi, nutrisi)
   - Total nutrisi dan match score per kombinasi

## Data Model

### Food Categories (from `Foods` table)

| Category Key | Display Name | Examples |
|--------------|--------------|----------|
| makanan_pokok | Makanan Pokok | Nasi Putih, Nasi Merah, Kentang, Roti |
| lauk_pauk | Lauk Pauk | Ayam Goreng, Ikan Bakar, Telur, Daging |
| lauk_nabati | Lauk Nabati | Tahu Goreng, Tempe Goreng, Edamame |
| sayur | Sayur | Sayur Bening, Capcay, Tumis Kangkung |
| buah | Buah | Pisang, Apel, Jeruk, Pepaya, Mango |

### DailyNutrition Target (from `DailyNutrition` table)

```typescript
interface DailyNutrition {
  date: Date;
  carbsBesar: number; proteinBesar: number; fatBesar: number;
  fiberBesar: number; energyBesar: number;
  carbsKecil: number; proteinKecil: number; fatKecil: number;
  fiberKecil: number; energyKecil: number;
}
```

## API Design

### Endpoint: `GET /api/generate-menu`

**Query Parameters:**
- `date` (optional): YYYY-MM-DD format, default = today

**Response:**
```typescript
interface GenerateMenuResponse {
  success: boolean;
  date: string;
  dailyNeeds: {
    besar: NutritionTarget;
    kecil: NutritionTarget;
  };
  recommendations: {
    besar: MenuCombination[];
    kecil: MenuCombination[];
  };
}

interface MenuCombination {
  score: number; // 0-100
  totalNutrition: NutritionValues;
  components: {
    category: string;
    categoryLabel: string;
    food: FoodItem;
    nutrition: NutritionValues;
  }[];
}

interface NutritionValues {
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
}
```

## Algorithm

### Step 1: Fetch Target Nutrition
- Query `DailyNutrition` by date
- If not found, return error "Data nutrisi untuk tanggal ini tidak ditemukan"

### Step 2: Fetch Foods by Category
- Query `Foods` table, group by category
- Filter foods that have valid nutrition values

### Step 3: Calculate Optimal Combination
For each category, select food that best matches the allocated portion:
```
allocatedCalories = targetCalories * categoryRatio
bestMatch = foods.filter(f => f.calories <= allocatedCalories * 1.3)
                .sort((a,b) => Math.abs(a.calories - allocatedCalories) - Math.abs(b.calories - allocatedCalories))
                [0]
```

### Step 4: Calculate Match Score
```
score = Σ(weight_n * closeness(target_n, actual_n))
where closeness = max(0, 1 - |1 - (actual / target)|)
weights: {energi: 0.4, protein: 0.25, karbohidrat: 0.15, lemak: 0.1, serat: 0.1}
```

### Step 5: Generate Alternatives
- Use different food combinations for variety
- Rank by total match score
- Return top 3 for each portion size

## User Interface

### Page: `/dashboard/generate-menu`

```
┌─────────────────────────────────────────────────────────────────┐
│ [📅 Date Picker] [Generate Button]                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 Target Nutrisi Harian                                        │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Energi: 700 kkal │ Protein: 20g │ Karbo: 100g │ ...      │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ 🍽️ Porsi Besar (3 Menu Rekomendasi)                            │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Menu #1 — Match Score: 92% ✅                            │   │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │   │
│ │ │Pokok│ │Lauk │ │Nabati│ │Sayur│ │Buah │               │   │
│ │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘               │   │
│ │ Total: 695 kkal | 19.5g protein | 98g karbo            │   │
│ └──────────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Menu #2 — Match Score: 88%                              │   │
│ │ [Detail...]                                              │   │
│ └──────────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Menu #3 — Match Score: 85%                              │   │
│ │ [Detail...]                                              │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ 🍽️ Porsi Kecil (3 Menu Rekomendasi)                           │
│ [Same structure...]                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-menu/
│   │       └── route.ts          # API handler
│   └── dashboard/
│       └── generate-menu/
│           └── page.tsx          # UI page
├── components/
│   └── ui/
│       ├── MenuCombinationCard.tsx  # Card for single menu combo
│       └── MenuComponentItem.tsx    # Single food item in menu
└── lib/
    ├── generate-menu.ts         # Core algorithm
    └── prisma.ts                # DB connection
```

## Error Handling

1. **No DailyNutrition data** → "Data nutrisi untuk tanggal {date} tidak ditemukan"
2. **No Foods in category** → Skip category, show warning
3. **Algorithm can't find valid combo** → Show closest match available with warning
4. **Database error** → Return 500 with error message

## Acceptance Criteria

1. ✅ User dapat memilih tanggal dan generate menu kombinasi
2. ✅ Hasil menampilkan 3 kombinasi terbaik untuk Porsi Besar dan Kecil
3. ✅ Setiap menu memiliki 5 komponen dengan nutrisi yang sesuai
4. ✅ Match score ditampilkan untuk setiap kombinasi
5. ✅ Total nutrisi kombinasi ditampilkan
6. ✅ Error handling untuk data tidak ditemukan
7. ✅ Responsive UI yang mudah dipahami