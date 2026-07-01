"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Utensils, Coffee, Sun, Moon, Star, Clock, Loader2, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { getMealCategory } from "@/lib/utils/nutrition";
import { getNutritionStandards, getRecommendedPortion } from "@/lib/nutrition-standards";

interface MenuRecommendationDB {
  id: string;
  name: string;
  description: string | null;
  tanggal: string;
  caloriesBesar: number;
  proteinBesar: number;
  carbsBesar: number;
  fatBesar: number;
  fiberBesar: number;
  caloriesKecil: number;
  proteinKecil: number;
  carbsKecil: number;
  fatKecil: number;
  fiberKecil: number;
}

interface PredictionState {
  predicted_needs: {
    karbohidrat_besar: number;
    protein_besar: number;
    lemak_besar: number;
    serat_besar: number;
    energi_besar: number;
    karbohidrat_kecil: number;
    protein_kecil: number;
    lemak_kecil: number;
    serat_kecil: number;
    energi_kecil: number;
  };
  recommended_portion: "besar" | "kecil";
  confidence: number;
}

export default function RecommendationsPage() {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [menus, setMenus] = useState<MenuRecommendationDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [standardsAvailable, setStandardsAvailable] = useState(true);
  const [prediction, setPrediction] = useState<PredictionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<"besar" | "kecil">("kecil");

  useEffect(() => {
    fetchMenus();
    fetchPrediction();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menu-recommendations");
      if (res.ok) {
        const data = await res.json();
        setMenus(data);
      }
    } catch (err) {
      console.error("Failed to fetch menus:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    setPredictionLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/predict");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPrediction(data.data);
          setStandardsAvailable(true);
        }
      } else {
        setStandardsAvailable(false);
        const errorData = await response.json();
        setError(errorData.message || errorData.error || "Gagal mendapatkan standar gizi");
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setStandardsAvailable(false);
      setError("Gagal mendapatkan standar gizi");
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPrediction();
  };

  // Get current meal category
  const currentMealCategory = getMealCategory();
  const categoryConfig = {
    breakfast: { label: "Sarapan", icon: Coffee, color: "bg-amber-100 text-amber-700" },
    lunch: { label: "Makan Siang", icon: Sun, color: "bg-orange-100 text-orange-700" },
    dinner: { label: "Makan Malam", icon: Moon, color: "bg-indigo-100 text-indigo-700" },
    snack: { label: "Camilan", icon: Star, color: "bg-pink-100 text-pink-700" },
  };

  // Sort menus by match score
  const sortedMenus = [...menus].sort((a, b) => {
    if (!prediction) return 0;

    const scoreA = calculateMatchScore(a, prediction.predicted_needs, selectedPortion);
    const scoreB = calculateMatchScore(b, prediction.predicted_needs, selectedPortion);
    return scoreB - scoreA;
  });

  const getNeedsForPortion = (needs: PredictionState["predicted_needs"], portion: "besar" | "kecil") => ({
    energi: portion === "besar" ? needs.energi_besar : needs.energi_kecil,
    protein: portion === "besar" ? needs.protein_besar : needs.protein_kecil,
    karbohidrat: portion === "besar" ? needs.karbohidrat_besar : needs.karbohidrat_kecil,
    lemak: portion === "besar" ? needs.lemak_besar : needs.lemak_kecil,
    serat: portion === "besar" ? needs.serat_besar : needs.serat_kecil,
  });

  const selectedNeeds = prediction ? getNeedsForPortion(prediction.predicted_needs, selectedPortion) : null;
  const selectedPredictedCalories = selectedNeeds ? selectedNeeds.energi : 0;

  function calculateMatchScore(menu: MenuRecommendationDB, needs: PredictionState["predicted_needs"], portion: "besar" | "kecil"): number {
    const calories = portion === "besar" ? menu.caloriesBesar : menu.caloriesKecil;
    const protein = portion === "besar" ? menu.proteinBesar : menu.proteinKecil;
    const carbs = portion === "besar" ? menu.carbsBesar : menu.carbsKecil;
    const fat = portion === "besar" ? menu.fatBesar : menu.fatKecil;
    const fiber = portion === "besar" ? menu.fiberBesar : menu.fiberKecil;

    const w_calories = 0.4, w_protein = 0.25, w_carbs = 0.15, w_fat = 0.1, w_fiber = 0.1;

    const closeness = (pred: number, actual: number) => {
      if (pred === 0) return 0.5;
      const ratio = actual / pred;
      return Math.max(0, 1 - Math.abs(1 - ratio));
    };

    const target = getNeedsForPortion(needs, portion);

    return w_calories * closeness(target.energi, calories) +
      w_protein * closeness(target.protein, protein) +
      w_carbs * closeness(target.karbohidrat, carbs) +
      w_fat * closeness(target.lemak, fat) +
      w_fiber * closeness(target.serat, fiber);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans mb-2">Rekomendasi Menu</h1>
        <p className="text-text-muted">
          Pilihan menu sehat sesuai kebutuhan nutrisi harian kamu
        </p>
      </div>

      {/* Nutrition Standards Banner */}
      {predictionLoading ? (
        <div className="card">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-text-muted">Memuat standar gizi...</span>
          </div>
        </div>
      ) : standardsAvailable && prediction ? (
        <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Standar Kebutuhan Gizi</h3>
                <p className="text-xs text-text-muted">
                  Based on Indonesian Nutrition Standards (AKG)
                </p>
              </div>
            </div>
            <button onClick={handleRefresh} className="p-2 hover:bg-bg rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Predicted Needs */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <p className="nutrition-value text-xl text-orange-600 font-bold">
                {Math.round(selectedNeeds?.energi || 0)}
              </p>
              <p className="text-xs text-text-muted">kkal</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <p className="nutrition-value text-xl font-bold">
                {selectedNeeds ? selectedNeeds.protein.toFixed(1) : "0.0"}g
              </p>
              <p className="text-xs text-text-muted">Protein</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <p className="nutrition-value text-xl text-amber-600 font-bold">
                {selectedNeeds ? selectedNeeds.karbohidrat.toFixed(1) : "0.0"}g
              </p>
              <p className="text-xs text-text-muted">Karbo</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <p className="nutrition-value text-xl text-red-600 font-bold">
                {selectedNeeds ? selectedNeeds.lemak.toFixed(1) : "0.0"}g
              </p>
              <p className="text-xs text-text-muted">Lemak</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <p className="nutrition-value text-xl text-green-600 font-bold">
                {selectedNeeds ? selectedNeeds.serat.toFixed(1) : "0.0"}g
              </p>
              <p className="text-xs text-text-muted">Serat</p>
            </div>
          </div>

          {/* Recommended Portion */}
          <div className={`p-3 rounded-xl flex items-center justify-between ${
            prediction.recommended_portion === "besar"
              ? "bg-green-100 border border-green-200"
              : "bg-blue-100 border border-blue-200"
          }`}>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                prediction.recommended_portion === "besar" ? "text-green-700" : "text-blue-700"
              }`}>
                {prediction.recommended_portion === "besar" ? "Porsi Besar Direkomendasikan" : "Porsi Kecil Direkomendasikan"}
              </span>
            </div>
            <span className={`text-sm font-medium ${
              prediction.recommended_portion === "besar" ? "text-green-700" : "text-blue-700"
            }`}>
              {prediction.recommended_portion === "besar" ? ">1700 kkal" : "≤1700 kkal"}
            </span>
          </div>
        </div>
      ) : (
        <div className="card bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Standar Gizi Tidak Tersedia</p>
              <p className="text-sm text-amber-700">
                Gagal memuat standar gizi Indonesia
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Portion Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-muted">Tampilkan:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPortion("kecil")}
            className={cn(
              "px-4 py-2 rounded-full font-medium transition-all",
              selectedPortion === "kecil"
                ? "bg-blue-600 text-white"
                : "bg-bg text-text-muted hover:bg-border"
            )}
          >
            Porsi Kecil
          </button>
          <button
            onClick={() => setSelectedPortion("besar")}
            className={cn(
              "px-4 py-2 rounded-full font-medium transition-all",
              selectedPortion === "besar"
                ? "bg-green-600 text-white"
                : "bg-bg text-text-muted hover:bg-border"
            )}
          >
            Porsi Besar
          </button>
        </div>
      </div>

      {/* Recommended for Now */}
      <div className="card bg-gradient-to-br from-primary/5 to-accent/10 border border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Rekomendasi Saat Ini</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            {(() => {
              const Icon = categoryConfig[currentMealCategory].icon;
              return <Icon className="w-6 h-6" />;
            })()}
          </div>
          <div>
            <p className="font-semibold">{categoryConfig[currentMealCategory].label} sekarang</p>
            <p className="text-sm text-text-muted">
              Berikut rekomendasi menu untuk {categoryConfig[currentMealCategory].label.toLowerCase()} kamu
            </p>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMenus.map((menu) => {
          const portionKey = selectedPortion;
          const calories = portionKey === "besar" ? menu.caloriesBesar : menu.caloriesKecil;
          const protein = portionKey === "besar" ? menu.proteinBesar : menu.proteinKecil;
          const carbs = portionKey === "besar" ? menu.carbsBesar : menu.carbsKecil;
          const fat = portionKey === "besar" ? menu.fatBesar : menu.fatKecil;
          const fiber = portionKey === "besar" ? menu.fiberBesar : menu.fiberKecil;

          const matchScore = prediction
            ? calculateMatchScore(menu, prediction.predicted_needs, selectedPortion)
            : 0;

          return (
            <div
              key={menu.id}
              className={cn(
                "card group hover:border-primary/30 transition-all",
                matchScore > 0.7 && "border-green-200 bg-green-50/30"
              )}
            >
              {/* Match Score Badge */}
              {prediction && (
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    matchScore > 0.7 ? "bg-green-500 text-white" :
                    matchScore > 0.5 ? "bg-amber-500 text-white" : "bg-gray-500 text-white"
                  )}>
                    {Math.round(matchScore * 100)}% Match
                  </span>
                </div>
              )}

              {/* Image Placeholder */}
              <div className="relative h-40 -mx-6 -mt-6 mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Utensils className="w-12 h-12 text-primary/30" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    selectedPortion === "besar" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {selectedPortion === "besar" ? "Porsi Besar" : "Porsi Kecil"}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-1">{menu.name}</h3>
              {menu.description && (
                <p className="text-sm text-text-muted mb-2">{menu.description}</p>
              )}
              {menu.tanggal && (
                <p className="text-xs text-text-muted mb-3">{menu.tanggal}</p>
              )}

              {/* Nutrition Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center">
                  <p className="nutrition-value text-sm text-orange-600 font-bold">{calories}</p>
                  <p className="text-xs text-text-muted">kkal</p>
                </div>
                <div className="text-center">
                  <p className="nutrition-value text-sm font-bold">{protein}g</p>
                  <p className="text-xs text-text-muted">Prot</p>
                </div>
                <div className="text-center">
                  <p className="nutrition-value text-sm text-amber-600 font-bold">{carbs}g</p>
                  <p className="text-xs text-text-muted">Karbo</p>
                </div>
                <div className="text-center">
                  <p className="nutrition-value text-sm text-red-600 font-bold">{fat}g</p>
                  <p className="text-xs text-text-muted">Lemak</p>
                </div>
                <div className="text-center">
                  <p className="nutrition-value text-sm text-green-600 font-bold">{fiber}g</p>
                  <p className="text-xs text-text-muted">Serat</p>
                </div>
              </div>

              {/* Comparison Indicator */}
              {prediction && (
                <div className="mb-3 p-2 bg-bg rounded-lg">
                  <p className="text-xs text-text-muted mb-1">Perbandingan dengan standar:</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-text-muted">Kalori:</span>
                    <span className={calories <= selectedPredictedCalories ? "text-green-600" : "text-red-600"}>
                      {calories} vs {Math.round(selectedPredictedCalories)} kkal
                    </span>
                  </div>
                </div>
              )}

              {/* Action */}
              <button className="w-full mt-2 py-2 bg-primary text-white rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Lihat Detail
              </button>
            </div>
          );
        })}
      </div>

      {menus.length === 0 && (
        <div className="text-center py-12">
          <Utensils className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-muted">Tidak ada menu yang ditemukan</p>
          <p className="text-sm text-text-muted mt-1">Tambahkan menu di halaman Menu Harian</p>
        </div>
      )}
    </div>
  );
}