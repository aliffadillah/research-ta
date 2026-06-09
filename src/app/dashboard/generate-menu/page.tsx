"use client";

import { useState } from "react";
import {
  Calendar,
  Loader2,
  AlertCircle,
  Utensils,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import MenuCombinationCard from "@/components/ui/MenuCombinationCard";
import NutritionSummaryBox from "@/components/ui/NutritionSummaryBox";

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

interface MenuComponent {
  food: Food;
  categoryLabel: string;
}

interface NutritionValues {
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
}

interface MenuCombination {
  combination: MenuComponent[];
  totalNutrition: NutritionValues;
  matchScore: number;
}

interface GenerateMenuResponse {
  success: boolean;
  date: string;
  dailyNeeds: {
    besar: NutritionValues;
    kecil: NutritionValues;
  };
  recommendations: {
    besar: MenuCombination[];
    kecil: MenuCombination[];
  };
}

export default function GenerateMenuPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<GenerateMenuResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate-menu?date=${selectedDate}`);
      const result = await res.json();

      if (res.ok && result.success) {
        setData(result);
      } else {
        setError(result.error || "Gagal memuat rekomendasi menu");
      }
    } catch (err) {
      console.error("Generate menu error:", err);
      setError("Gagal memuat rekomendasi menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-display">Generate Menu Rekomendasi</h1>
          <p className="text-text-muted">
            Hasilkan kombinasi menu makanan yang sesuai kebutuhan gizi harian
          </p>
        </div>
      </div>

      {/* Date Picker Section */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <label className="text-sm font-medium text-text-muted">
              Tanggal Target:
            </label>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={cn(
              "px-6 py-2 bg-primary text-white rounded-lg font-medium transition-all",
              "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Menu</span>
              </>
            )}
          </button>
        </div>
      </div>

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

      {/* Results Section */}
      {data && (
        <div className="space-y-6">
          {/* Porsi Besar Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold">Porsi Besar</h2>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Target: {Math.round(data.dailyNeeds.besar.energi)} kkal
              </span>
            </div>

            <NutritionSummaryBox target={data.dailyNeeds.besar} portionType="besar" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recommendations.besar.map((combo, idx) => (
                <MenuCombinationCard
                  key={idx}
                  combination={combo.combination}
                  index={idx}
                  isBest={idx === 0}
                  totalNutrition={combo.totalNutrition}
                  matchScore={combo.matchScore}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-border" />

          {/* Porsi Kecil Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Porsi Kecil</h2>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Target: {Math.round(data.dailyNeeds.kecil.energi)} kkal
              </span>
            </div>

            <NutritionSummaryBox target={data.dailyNeeds.kecil} portionType="kecil" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recommendations.kecil.map((combo, idx) => (
                <MenuCombinationCard
                  key={idx}
                  combination={combo.combination}
                  index={idx}
                  isBest={idx === 0}
                  totalNutrition={combo.totalNutrition}
                  matchScore={combo.matchScore}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !error && !loading && (
        <div className="text-center py-12">
          <Utensils className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-muted">Pilih tanggal dan klik Generate Menu</p>
          <p className="text-sm text-text-muted mt-1">
            untuk melihat kombinasi menu rekomendasi
          </p>
        </div>
      )}
    </div>
  );
}