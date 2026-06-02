"use client";

import { TrendingUp, Flame, Drumstick, Wheat, Apple, Scale, Loader2, RefreshCw } from "lucide-react";
import { getNutritionStandards, getRecommendedPortion } from "@/lib/nutrition-standards";

interface PredictionCardProps {
  className?: string;
}

export default function PredictionCard({ className = "" }: PredictionCardProps) {
  const standards = getNutritionStandards();
  const recommendedPortion = getRecommendedPortion(standards.daily.energi);

  const portion = recommendedPortion === "besar" ? standards.portion.besar : standards.portion.kecil;

  // Format today's date
  const today = new Date();
  const formatDisplayDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Kebutuhan Gizi Harian</h3>
            <p className="text-xs text-text-muted">
              {formatDisplayDate(today)} • Standar Gizi Indonesia
            </p>
          </div>
        </div>
        <button
          className="p-2 hover:bg-bg rounded-lg transition-colors opacity-50 cursor-not-allowed"
          title="Standar statis - tidak perlu refresh"
          disabled
        >
          <RefreshCw className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {/* Date Info */}
      <div className="bg-bg rounded-lg p-3 mb-4">
        <p className="text-sm">
          <span className="text-text-muted">Standar Gizi Harian: </span>
          <span className="font-semibold">AKG 2100 kkal</span>
        </p>
        <p className="text-sm text-text-muted mt-1">
          Berdasarkan Angka Kecukupan Gizi (AKG) Indonesia
        </p>
      </div>

      {/* Daily Needs Grid */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="text-center p-3 bg-orange-50 rounded-xl">
          <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
          <p className="nutrition-value text-lg text-orange-700">
            {standards.daily.energi}
          </p>
          <p className="text-xs text-text-muted">kkal</p>
        </div>
        <div className="text-center p-3 bg-primary/10 rounded-xl">
          <Drumstick className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="nutrition-value text-lg">
            {standards.daily.protein}
          </p>
          <p className="text-xs text-text-muted">protein</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <Wheat className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <p className="nutrition-value text-lg text-amber-700">
            {standards.daily.karbohidrat}
          </p>
          <p className="text-xs text-text-muted">karbo</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-xl">
          <Apple className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <p className="nutrition-value text-lg text-red-700">
            {standards.daily.lemak}
          </p>
          <p className="text-xs text-text-muted">lemak</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <Scale className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="nutrition-value text-lg text-green-700">
            {standards.daily.serat}
          </p>
          <p className="text-xs text-text-muted">serat</p>
        </div>
      </div>

      {/* Recommended Portion */}
      <div className={`p-3 rounded-xl ${
        recommendedPortion === "besar" ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${recommendedPortion === "besar" ? "text-green-600" : "text-blue-600"}`} />
            <span className={`font-semibold ${recommendedPortion === "besar" ? "text-green-700" : "text-blue-700"}`}>
              {recommendedPortion === "besar" ? "Porsi Besar Direkomendasikan" : "Porsi Kecil Direkomendasikan"}
            </span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            recommendedPortion === "besar" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
          }`}>
            {recommendedPortion === "besar" ? ">1700 kkal" : "≤1700 kkal"}
          </span>
        </div>
      </div>
    </div>
  );
}
