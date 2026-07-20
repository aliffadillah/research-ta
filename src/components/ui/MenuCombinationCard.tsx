"use client";

import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

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

interface MenuCombinationCardProps {
  combination: MenuComponent[];
  index: number;
  isBest?: boolean;
  totalNutrition: NutritionValues;
  matchScore: number;
}

export default function MenuCombinationCard({
  combination,
  index,
  isBest = false,
  totalNutrition,
  matchScore,
}: MenuCombinationCardProps) {
  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500 text-white";
    if (score >= 70) return "bg-amber-500 text-white";
    return "bg-orange-500 text-white";
  };

  return (
    <div
      className={cn(
        "card transition-all hover:shadow-card-hover",
        isBest && "border-green-300 bg-green-50/30"
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 md:mb-4">
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          {/* Index Badge */}
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
            #{index + 1}
          </span>
          {/* Best Recommendation Badge */}
          {isBest && (
            <span className="px-2 py-1 rounded-full text-[10px] md:text-xs font-bold bg-green-500 text-white flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Rekomendasi Terbaik</span>
              <span className="sm:hidden">Best</span>
            </span>
          )}
        </div>
        {/* Match Score Badge */}
        <span
          className={cn(
            "px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-sm",
            getScoreColor(matchScore)
          )}
        >
          {matchScore}% Match
        </span>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3 md:mb-4">
        {combination.map((component, idx) => (
          <div
            key={idx}
            className="text-center p-2 bg-bg rounded-lg border border-border/50"
          >
            <p className="text-[10px] md:text-xs text-text-muted mb-0.5 md:mb-1 truncate">
              {component.categoryLabel}
            </p>
            <p className="text-xs md:text-sm font-semibold truncate" title={component.food.name}>
              {component.food.name}
            </p>
            <p className="text-[10px] md:text-xs text-text-muted">
              {component.food.portionSize}
              {component.food.portionUnit}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border/50 my-3 md:my-4" />

      {/* Total Nutrition Footer */}
      <div className="grid grid-cols-5 gap-1 md:gap-2">
        <div className="text-center">
          <p className="nutrition-value text-xs md:text-sm text-orange-600 font-bold">
            {Math.round(totalNutrition.energi)}
          </p>
          <p className="text-[9px] md:text-xs text-text-muted">kkal</p>
        </div>
        <div className="text-center">
          <p className="nutrition-value text-xs md:text-sm font-bold">
            {totalNutrition.protein.toFixed(1)}g
          </p>
          <p className="text-[9px] md:text-xs text-text-muted">Protein</p>
        </div>
        <div className="text-center">
          <p className="nutrition-value text-xs md:text-sm text-amber-600 font-bold">
            {totalNutrition.karbohidrat.toFixed(1)}g
          </p>
          <p className="text-[9px] md:text-xs text-text-muted">Karbo</p>
        </div>
        <div className="text-center">
          <p className="nutrition-value text-xs md:text-sm text-red-600 font-bold">
            {totalNutrition.lemak.toFixed(1)}g
          </p>
          <p className="text-[9px] md:text-xs text-text-muted">Lemak</p>
        </div>
        <div className="text-center">
          <p className="nutrition-value text-xs md:text-sm text-green-600 font-bold">
            {totalNutrition.serat.toFixed(1)}g
          </p>
          <p className="text-[9px] md:text-xs text-text-muted">Serat</p>
        </div>
      </div>
    </div>
  );
}
