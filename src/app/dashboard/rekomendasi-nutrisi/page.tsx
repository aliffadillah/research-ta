"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Utensils,
  Loader2,
  AlertCircle,
  Flame,
  Drumstick,
  Wheat,
  Apple,
  Scale,
  Brain,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import NutritionMatchCard from "@/components/ui/NutritionMatchCard";

interface NutritionComparison {
  targetCalories: number;
  actualCalories: number;
  targetProtein: number;
  actualProtein: number;
  targetCarbs: number;
  actualCarbs: number;
  targetFat: number;
  actualFat: number;
  targetFiber: number;
  actualFiber: number;
}

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  portionSize: number;
  portionUnit: string;
  category: string | null;
}

interface FoodRecommendation {
  food: Food;
  matchScore: number;
  nutritionComparison: NutritionComparison;
  recommendedPortion: "besar" | "kecil";
  category: string;
}

interface DailyNeeds {
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
}

interface ApiResponse {
  success: boolean;
  date: string;
  dailyNeeds: DailyNeeds;
  portionType: "besar" | "kecil";
  portionNeeds: DailyNeeds;
  hasDailyData: boolean;
  totalFoods: number;
  foods: FoodRecommendation[];
}

const CATEGORIES = [
  { value: "all", label: "Semua" },
  { value: "makanan pokok", label: "Makanan Pokok" },
  { value: "lauk", label: "Lauk" },
  { value: "sayur", label: "Sayur" },
  { value: "buah", label: "Buah" },
  { value: "minuman", label: "Minuman" },
  { value: "lainnya", label: "Lainnya" },
];

const NUTRITION_FOCUS = [
  { value: "all", label: "Semua" },
  { value: "calories", label: "Kalori" },
  { value: "protein", label: "Protein" },
  { value: "carbs", label: "Karbohidrat" },
  { value: "fat", label: "Lemak" },
  { value: "fiber", label: "Serat" },
];

export default function RekomendasiNutrisiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFocus, setSelectedFocus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCategory, selectedFocus]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      if (selectedFocus !== "all") {
        params.set("focus", selectedFocus);
      }

      const res = await fetch(`/api/food-recommendations?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Gagal memuat rekomendasi");
      }
    } catch (err) {
      console.error("Fetch recommendations error:", err);
      setError("Gagal memuat rekomendasi makanan");
    } finally {
      setLoading(false);
    }
  };

  // Format today's date
  const getFormattedDate = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const wibHours = utcHours + 7;
    let wibDate = new Date(now);
    if (wibHours >= 24) {
      wibDate.setUTCDate(wibDate.getUTCDate() + 1);
    }
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${days[wibDate.getUTCDay()]}, ${wibDate.getUTCDate()} ${months[wibDate.getUTCMonth()]} ${wibDate.getUTCFullYear()}`;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans mb-2">Rekomendasi Makanan</h1>
        <p className="text-text-muted">
          Rekomendasi makanan dari Daftar Makanan sesuai kebutuhan gizi harian -
          {getFormattedDate()}
</p>
      </div>

      {/* Today's Nutrition Summary */}
      {data && (
        <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Kebutuhan Nutrisi Harian</h3>
                <p className="text-xs text-text-muted">
                  {data.hasDailyData
                    ? `Data nutrisi harian - Porsi ${data.portionType === "besar" ? "Besar" : "Kecil"}`
                    : "Standar AKG Indonesia"}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                data.portionType === "besar"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              )}
            >
              {data.portionType === "besar" ? "Porsi Besar" : "Porsi Kecil"}
            </span>
          </div>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-5 gap-3">
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="nutrition-value text-xl text-orange-600 font-bold">
                {Math.round(data.dailyNeeds.energi)}
              </p>
              <p className="text-xs text-text-muted">kkal</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Drumstick className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="nutrition-value text-xl font-bold">
                {data.dailyNeeds.protein.toFixed(1)}g
              </p>
              <p className="text-xs text-text-muted">Protein</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Wheat className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="nutrition-value text-xl text-amber-600 font-bold">
                {data.dailyNeeds.karbohidrat.toFixed(1)}g
              </p>
              <p className="text-xs text-text-muted">Karbo</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Apple className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="nutrition-value text-xl text-red-600 font-bold">
                {data.dailyNeeds.lemak.toFixed(1)}g
              </p>
              <p className="text-xs text-text-muted">Lemak</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Scale className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="nutrition-value text-xl text-green-600 font-bold">
                {data.dailyNeeds.serat.toFixed(1)}g
              </p>
              <p className="text-xs text-text-muted">Serat</p>
            </div>
          </div>

          {/* Per-Meal Target */}
          <div className="mt-4 p-3 bg-white/40 rounded-xl">
            <p className="text-sm text-text-muted">
              Target per porsi makan:{" "}
              <span className="font-semibold text-primary">
                {Math.round(data.portionNeeds.energi)} kkal
              </span>{" "}
              (
              {data.portionNeeds.protein.toFixed(1)}g protein,{" "}
              {data.portionNeeds.karbohidrat.toFixed(1)}g karbo,{" "}
              {data.portionNeeds.lemak.toFixed(1)}g lemak,{" "}
              {data.portionNeeds.serat.toFixed(1)}g serat)
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Error</p>
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="card">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <span className="font-semibold">Filter & Urutan</span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-text-muted transition-transform",
              showFilters && "rotate-180"
            )}
          />
        </button>

        {showFilters && (
          <div className="mt-4 space-y-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">
                Kategori Makanan
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      selectedCategory === cat.value
                        ? "bg-primary text-white"
                        : "bg-bg text-text-muted hover:bg-border"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition Focus Filter */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">
                Fokus Nutrisi
              </label>
              <div className="flex flex-wrap gap-2">
                {NUTRITION_FOCUS.map((focus) => (
                  <button
                    key={focus.value}
                    onClick={() => setSelectedFocus(focus.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      selectedFocus === focus.value
                        ? "bg-accent text-white"
                        : "bg-bg text-text-muted hover:bg-border"
                    )}
                  >
                    {focus.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Menampilkan{" "}
            <span className="font-semibold text-primary">{data.totalFoods}</span>{" "}
            makanan
            {selectedCategory !== "all" && (
              <span>
                {" "}
                dalam kategori{" "}
                <span className="font-semibold">
                  {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
                </span>
              </span>
            )}
            {selectedFocus !== "all" && (
              <span>
                {" "}
                dengan fokus{" "}
                <span className="font-semibold">
                  {NUTRITION_FOCUS.find((f) => f.value === selectedFocus)?.label}
                </span>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Foods Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : data && data.foods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.foods.map((recommendation) => (
            <NutritionMatchCard
              key={recommendation.food.id}
              food={recommendation.food}
              matchScore={recommendation.matchScore}
              nutritionComparison={recommendation.nutritionComparison}
              recommendedPortion={recommendation.recommendedPortion}
              category={recommendation.category}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Utensils className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-muted">Tidak ada makanan yang ditemukan</p>
          <p className="text-sm text-text-muted mt-1">
            Coba ubah filter atau tambahkan makanan di Daftar Makanan
          </p>
        </div>
      )}
    </div>
  );
}
