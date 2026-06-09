# Generate Menu Rekomendasi - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fitur generate kombinasi menu harian dari 5 komponen makanan yang total nutrisinya sesuai target dari DailyNutrition.

**Architecture:** Backend API handle generate kombinasi dengan algoritma weighted matching. Frontend page dengan date picker dan display 3 kombinasi terbaik untuk Porsi Besar dan Kecil.

**Tech Stack:** Next.js App Router, Prisma, TypeScript, Tailwind CSS

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-menu/
│   │       └── route.ts
│   └── dashboard/
│       └── generate-menu/
│           └── page.tsx
├── components/
│   └── ui/
│       ├── MenuCombinationCard.tsx
│       └── NutritionSummaryBox.tsx
└── lib/
    └── generate-menu.ts
```

---

## Task 1: Core Algorithm - `lib/generate-menu.ts`

**Files:**
- Create: `src/lib/generate-menu.ts`

- [ ] **Step 1: Write core algorithm**

```typescript
// src/lib/generate-menu.ts

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string;
  portionSize: number;
  portionUnit: string;
}

export interface NutritionValues {
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
}

export interface MenuComponent {
  category: string;
  categoryLabel: string;
  food: FoodItem;
  nutrition: NutritionValues;
}

export interface MenuCombination {
  score: number;
  totalNutrition: NutritionValues;
  components: MenuComponent[];
}

export interface GenerateMenuOptions {
  maxResults?: number;
  minScoreThreshold?: number;
}

const CATEGORY_RATIOS = {
  makanan_pokok: { energi: 0.30, protein: 0.20, karbohidrat: 0.40, lemak: 0.15, serat: 0.10 },
  lauk_pauk: { energi: 0.25, protein: 0.40, karbohidrat: 0.10, lemak: 0.35, serat: 0.05 },
  lauk_nabati: { energi: 0.10, protein: 0.25, karbohidrat: 0.10, lemak: 0.20, serat: 0.15 },
  sayur: { energi: 0.05, protein: 0.05, karbohidrat: 0.15, lemak: 0.05, serat: 0.40 },
  buah: { energi: 0.10, protein: 0.05, karbohidrat: 0.15, lemak: 0.05, serat: 0.25 },
};

export const CATEGORY_LABELS: Record<string, string> = {
  makanan_pokok: 'Makanan Pokok',
  lauk_pauk: 'Lauk Pauk',
  lauk_nabati: 'Lauk Nabati',
  sayur: 'Sayur',
  buah: 'Buah',
};

const CATEGORY_ORDER = ['makanan_pokok', 'lauk_pauk', 'lauk_nabati', 'sayur', 'buah'];

function calculateMatchScore(totalNutrition: NutritionValues, target: NutritionValues): number {
  const weights = { energi: 0.4, protein: 0.25, karbohidrat: 0.15, lemak: 0.1, serat: 0.1 };
  const closeness = (t: number, a: number): number => {
    if (t === 0) return 0.5;
    const ratio = a / t;
    return Math.max(0, 1 - Math.abs(1 - ratio));
  };
  const score =
    weights.energi * closeness(target.energi, totalNutrition.energi) +
    weights.protein * closeness(target.protein, totalNutrition.protein) +
    weights.karbohidrat * closeness(target.karbohidrat, totalNutrition.karbohidrat) +
    weights.lemak * closeness(target.lemak, totalNutrition.lemak) +
    weights.serat * closeness(target.serat, totalNutrition.serat);
  return Math.round(score * 100);
}

function calculateTotalNutrition(components: MenuComponent[]): NutritionValues {
  return components.reduce((acc, comp) => ({
    energi: acc.energi + comp.food.calories,
    protein: acc.protein + comp.food.protein,
    karbohidrat: acc.karbohidrat + comp.food.carbs,
    lemak: acc.lemak + comp.food.fat,
    serat: acc.serat + comp.food.fiber,
  }), { energi: 0, protein: 0, karbohidrat: 0, lemak: 0, serat: 0 });
}

function findBestFoodForCategory(foods: FoodItem[], category: string, target: NutritionValues): FoodItem | null {
  const categoryFoods = foods.filter(f => f.category === category);
  if (categoryFoods.length === 0) return null;
  const ratios = CATEGORY_RATIOS[category as keyof typeof CATEGORY_RATIOS];
  const allocatedTarget = {
    energi: target.energi * ratios.energi,
    protein: target.protein * ratios.protein,
    karbohidrat: target.karbohidrat * ratios.karbohidrat,
    lemak: target.lemak * ratios.lemak,
    serat: target.serat * ratios.serat,
  };
  categoryFoods.sort((a, b) => Math.abs(a.calories - allocatedTarget.energi) - Math.abs(b.calories - allocatedTarget.energi));
  return categoryFoods[0];
}

function generateSingleCombination(foods: FoodItem[], target: NutritionValues, usedCombinations: Set<string>): MenuCombination | null {
  const components: MenuComponent[] = [];
  for (const category of CATEGORY_ORDER) {
    const food = findBestFoodForCategory(foods, category, target);
    if (!food) return null;
    components.push({
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      food,
      nutrition: { energi: food.calories, protein: food.protein, karbohidrat: food.carbs, lemak: food.fat, serat: food.fiber },
    });
  }
  const totalNutrition = calculateTotalNutrition(components);
  const score = calculateMatchScore(totalNutrition, target);
  const comboKey = components.map(c => c.food.id).sort().join('-');
  if (usedCombinations.has(comboKey)) return null;
  usedCombinations.add(comboKey);
  return { score, totalNutrition, components };
}

export async function generateMenuCombinations(foods: FoodItem[], target: NutritionValues, options: GenerateMenuOptions = {}): Promise<MenuCombination[]> {
  const { maxResults = 3, minScoreThreshold = 0 } = options;
  const results: MenuCombination[] = [];
  const usedCombinations = new Set<string>();
  let attempts = 0;
  while (results.length < maxResults && attempts < 50) {
    attempts++;
    const shuffledFoods = [...foods].sort(() => Math.random() - 0.5);
    const combination = generateSingleCombination(shuffledFoods, target, usedCombinations);
    if (combination && combination.score >= minScoreThreshold) results.push(combination);
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

export function groupFoodsByCategory(foods: FoodItem[]): Record<string, FoodItem[]> {
  return foods.reduce((acc, food) => {
    const category = food.category || 'lainnya';
    if (!acc[category]) acc[category] = [];
    acc[category].push(food);
    return acc;
  }, {} as Record<string, FoodItem[]>);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/generate-menu.ts
git commit -m "feat: add generate menu algorithm

- Core algorithm for menu combination generation
- 5-category menu (Makanan Pokok, Lauk Pauk, Lauk Nabati, Sayur, Buah)
- Match score calculation with weighted nutrition closeness
- Support for generating top N combinations

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: API Route - `/api/generate-menu`

**Files:**
- Create: `src/app/api/generate-menu/route.ts`

- [ ] **Step 1: Write API route**

```typescript
// src/app/api/generate-menu/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMenuCombinations, groupFoodsByCategory, FoodItem } from '@/lib/generate-menu';

interface NutritionTarget {
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
}

function toFoodItem(food: any): FoodItem {
  return {
    id: food.id, name: food.name, calories: food.calories, protein: food.protein,
    carbs: food.carbs, fat: food.fat, fiber: food.fiber,
    category: food.category || 'lainnya', portionSize: food.portionSize, portionUnit: food.portionUnit,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    let targetDate = dateParam ? new Date(dateParam) : new Date();
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ success: false, error: 'Format tanggal tidak valid' }, { status: 400 });
    }

    const dailyNutrition = await prisma.dailyNutrition.findUnique({ where: { date: targetDate } });
    if (!dailyNutrition) {
      return NextResponse.json({ success: false, error: `Data nutrisi untuk tanggal ${dateParam || 'hari ini'} tidak ditemukan` }, { status: 404 });
    }

    const targetBesar: NutritionTarget = { energi: dailyNutrition.energyBesar, protein: dailyNutrition.proteinBesar, karbohidrat: dailyNutrition.carbsBesar, lemak: dailyNutrition.fatBesar, serat: dailyNutrition.fiberBesar };
    const targetKecil: NutritionTarget = { energi: dailyNutrition.energyKecil, protein: dailyNutrition.proteinKecil, karbohidrat: dailyNutrition.carbsKecil, lemak: dailyNutrition.fatKecil, serat: dailyNutrition.fiberKecil };

    const foodsRaw = await prisma.food.findMany({ orderBy: { name: 'asc' } });
    if (foodsRaw.length === 0) return NextResponse.json({ success: false, error: 'Tidak ada data makanan' }, { status: 500 });

    const foods = foodsRaw.map(toFoodItem);
    const foodsByCategory = groupFoodsByCategory(foods);
    const requiredCategories = ['makanan_pokok', 'lauk_pauk', 'lauk_nabati', 'sayur', 'buah'];
    const missingCategories = requiredCategories.filter(cat => !foodsByCategory[cat]?.length);
    if (missingCategories.length > 0) {
      return NextResponse.json({ success: false, error: `Kategori tidak lengkap: ${missingCategories.join(', ')}` }, { status: 400 });
    }

    const recommendationsBesar = await generateMenuCombinations(foods, targetBesar, { maxResults: 3 });
    const recommendationsKecil = await generateMenuCombinations(foods, targetKecil, { maxResults: 3 });

    return NextResponse.json({
      success: true, date: targetDate.toISOString().split('T')[0],
      dailyNeeds: { besar: targetBesar, kecil: targetKecil },
      recommendations: { besar: recommendationsBesar, kecil: recommendationsKecil },
    });
  } catch (error) {
    console.error('Generate menu error:', error);
    return NextResponse.json({ success: false, error: 'Gagal generate menu' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/generate-menu/route.ts
git commit -m "feat: add /api/generate-menu endpoint

- Fetch DailyNutrition by date
- Generate 3 menu combinations for Porsi Besar and Kecil
- Validate required food categories
- Return match scores and nutrition details

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: UI Components

**Files:**
- Create: `src/components/ui/MenuCombinationCard.tsx`
- Create: `src/components/ui/NutritionSummaryBox.tsx`

- [ ] **Step 1: Write MenuCombinationCard**

```tsx
// src/components/ui/MenuCombinationCard.tsx
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface MenuCombinationCardProps {
  combination: {
    score: number;
    totalNutrition: { energi: number; protein: number; karbohidrat: number; lemak: number; serat: number; };
    components: { category: string; categoryLabel: string; food: { name: string; portionSize: number; portionUnit: string; calories: number; protein: number; carbs: number; fat: number; fiber: number; }; }[];
  };
  index: number;
  isBest?: boolean;
}

export default function MenuCombinationCard({ combination, index, isBest }: MenuCombinationCardProps) {
  return (
    <div className={cn("card p-5", isBest && "border-2 border-primary")}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">#{index + 1}</span>
          {isBest && <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4" />Rekomendasi Terbaik</span>}
        </div>
        <div className={cn("px-3 py-1 rounded-full text-sm font-semibold", combination.score >= 85 ? "bg-green-100 text-green-700" : combination.score >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-orange-100 text-orange-700")}>
          Match Score: {combination.score}%
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3 mb-4">
        {combination.components.map((comp) => (
          <div key={comp.category} className="p-3 bg-bg rounded-xl text-center">
            <p className="text-xs text-text-muted mb-1">{comp.categoryLabel}</p>
            <p className="font-medium text-sm leading-tight">{comp.food.name}</p>
            <p className="text-xs text-text-muted mt-1">{comp.food.portionSize}{comp.food.portionUnit}</p>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
        <p className="text-sm font-medium mb-2">Total Nutrisi Menu:</p>
        <div className="grid grid-cols-5 gap-2 text-center">
          <div><p className="text-lg font-bold text-orange-600">{Math.round(combination.totalNutrition.energi)}</p><p className="text-xs text-text-muted">kkal</p></div>
          <div><p className="text-lg font-bold">{combination.totalNutrition.protein.toFixed(1)}g</p><p className="text-xs text-text-muted">Protein</p></div>
          <div><p className="text-lg font-bold text-amber-600">{combination.totalNutrition.karbohidrat.toFixed(1)}g</p><p className="text-xs text-text-muted">Karbo</p></div>
          <div><p className="text-lg font-bold text-red-600">{combination.totalNutrition.lemak.toFixed(1)}g</p><p className="text-xs text-text-muted">Lemak</p></div>
          <div><p className="text-lg font-bold text-green-600">{combination.totalNutrition.serat.toFixed(1)}g</p><p className="text-xs text-text-muted">Serat</p></div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write NutritionSummaryBox**

```tsx
// src/components/ui/NutritionSummaryBox.tsx
import { Flame, Drumstick, Wheat, Apple, Scale, Brain } from 'lucide-react';

interface NutritionSummaryBoxProps {
  target: { energi: number; protein: number; karbohidrat: number; lemak: number; serat: number; };
  portionType: 'besar' | 'kecil';
}

export default function NutritionSummaryBox({ target, portionType }: NutritionSummaryBoxProps) {
  return (
    <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center"><Brain className="w-5 h-5 text-primary" /></div>
          <div><h3 className="font-semibold">Target Nutrisi {portionType === 'besar' ? 'Porsi Besar' : 'Porsi Kecil'}</h3><p className="text-xs text-text-muted">Acuan untuk generate menu kombinasi</p></div>
        </div>
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", portionType === 'besar' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>{portionType === 'besar' ? 'Porsi Besar' : 'Porsi Kecil'}</span>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <div className="text-center p-3 bg-white/60 rounded-xl"><Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" /><p className="text-xl text-orange-600 font-bold">{Math.round(target.energi)}</p><p className="text-xs text-text-muted">kkal</p></div>
        <div className="text-center p-3 bg-white/60 rounded-xl"><Drumstick className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-xl font-bold">{target.protein.toFixed(1)}g</p><p className="text-xs text-text-muted">Protein</p></div>
        <div className="text-center p-3 bg-white/60 rounded-xl"><Wheat className="w-5 h-5 text-amber-600 mx-auto mb-1" /><p className="text-xl text-amber-600 font-bold">{target.karbohidrat.toFixed(1)}g</p><p className="text-xs text-text-muted">Karbo</p></div>
        <div className="text-center p-3 bg-white/60 rounded-xl"><Apple className="w-5 h-5 text-red-600 mx-auto mb-1" /><p className="text-xl text-red-600 font-bold">{target.lemak.toFixed(1)}g</p><p className="text-xs text-text-muted">Lemak</p></div>
        <div className="text-center p-3 bg-white/60 rounded-xl"><Scale className="w-5 h-5 text-green-600 mx-auto mb-1" /><p className="text-xl text-green-600 font-bold">{target.serat.toFixed(1)}g</p><p className="text-xs text-text-muted">Serat</p></div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MenuCombinationCard.tsx src/components/ui/NutritionSummaryBox.tsx
git commit -m "feat: add menu recommendation UI components

- MenuCombinationCard: displays single menu with 5 components
- NutritionSummaryBox: displays target nutrition summary

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Dashboard Page

**Files:**
- Create: `src/app/dashboard/generate-menu/page.tsx`

- [ ] **Step 1: Write dashboard page**

```tsx
// src/app/dashboard/generate-menu/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Calendar, Loader2, AlertCircle, Utensils, Sparkles } from 'lucide-react';
import MenuCombinationCard from "@/components/ui/MenuCombinationCard";
import NutritionSummaryBox from "@/components/ui/NutritionSummaryBox";

interface GenerateMenuResponse {
  success: boolean;
  date: string;
  dailyNeeds: {
    besar: { energi: number; protein: number; karbohidrat: number; lemak: number; serat: number; };
    kecil: { energi: number; protein: number; karbohidrat: number; lemak: number; serat: number; };
  };
  recommendations: {
    besar: any[];
    kecil: any[];
  };
}

export default function GenerateMenuPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GenerateMenuResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const handleGenerate = async () => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/generate-menu?date=${selectedDate}`);
      const result = await res.json();
      if (res.ok && result.success) setData(result);
      else { setError(result.error || "Gagal generate menu"); setData(null); }
    } catch (err) { setError("Terjadi kesalahan saat generate menu"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />Generate Menu Rekomendasi
        </h1>
        <p className="text-text-muted">Generate kombinasi menu harian dari 5 komponen makanan sesuai target nutrisi</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Calendar className="w-5 h-5 text-primary" />
            <label className="font-medium">Pilih Tanggal:</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field max-w-[200px]" />
          </div>
          <button onClick={handleGenerate} disabled={!selectedDate || loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Menu
          </button>
        </div>
      </div>

      {error && (
        <div className="card bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div><p className="font-medium text-amber-800">Error</p><p className="text-sm text-amber-700">{error}</p></div>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold">Porsi Besar</h2>
              <span className="text-sm text-text-muted">Target: {Math.round(data.dailyNeeds.besar.energi)} kkal</span>
            </div>
            <NutritionSummaryBox target={data.dailyNeeds.besar} portionType="besar" />
            <div className="space-y-4">
              {data.recommendations.besar.map((combo, i) => <MenuCombinationCard key={i} combination={combo} index={i} isBest={i === 0} />)}
            </div>
          </div>

          <div className="border-t-2 border-border my-8" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Porsi Kecil</h2>
              <span className="text-sm text-text-muted">Target: {Math.round(data.dailyNeeds.kecil.energi)} kkal</span>
            </div>
            <NutritionSummaryBox target={data.dailyNeeds.kecil} portionType="kecil" />
            <div className="space-y-4">
              {data.recommendations.kecil.map((combo, i) => <MenuCombinationCard key={i} combination={combo} index={i} isBest={i === 0} />)}
            </div>
          </div>
        </>
      )}

      {!data && !error && !loading && (
        <div className="text-center py-16">
          <Utensils className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
          <p className="text-lg text-text-muted">Pilih tanggal dan klik "Generate Menu" untuk membuat rekomendasi</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/generate-menu/page.tsx
git commit -m "feat: add generate menu dashboard page

- Date picker for selecting target date
- Display 3 menu combinations for Porsi Besar and Kecil
- Target nutrition summary boxes
- Match score and total nutrition display

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Sidebar Navigation

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add Generate Menu to navItems**

Add to navItems array:
```typescript
{ href: "/dashboard/generate-menu", icon: Sparkles, label: "Generate Menu" },
```

Add import:
```typescript
import { ..., Sparkles } from 'lucide-react';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: add Generate Menu to sidebar navigation

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Core algorithm | `src/lib/generate-menu.ts` |
| 2 | API endpoint | `src/app/api/generate-menu/route.ts` |
| 3 | UI components | `src/components/ui/MenuCombinationCard.tsx`, `NutritionSummaryBox.tsx` |
| 4 | Dashboard page | `src/app/dashboard/generate-menu/page.tsx` |
| 5 | Sidebar nav | `src/components/layout/Sidebar.tsx` |

**Total: ~2 hours**