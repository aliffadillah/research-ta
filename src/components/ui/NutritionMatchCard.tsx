"use client";

import { useState } from "react";
import { Utensils, Apple, ChevronDown, ChevronUp, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

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

interface NutritionMatchCardProps {
  food: Food;
  matchScore: number;
  nutritionComparison: NutritionComparison;
  recommendedPortion: "besar" | "kecil";
  category: string;
  onAddToLog?: (food: Food) => void;
  isAdded?: boolean;
}

export default function NutritionMatchCard({
  food,
  matchScore,
  nutritionComparison,
  recommendedPortion,
  category,
  onAddToLog,
  isAdded = false,
}: NutritionMatchCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Determine color based on match score
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500 text-white";
    if (score >= 50) return "bg-amber-500 text-white";
    return "bg-gray-500 text-white";
  };

  // Calculate percentage filled for progress bars
  const getFillPercentage = (actual: number, target: number) => {
    if (target === 0) return 0;
    const percentage = (actual / target) * 100;
    return Math.min(100, percentage);
  };

  // Determine if value is within target range (80-120%)
  const isInRange = (actual: number, target: number) => {
    const ratio = actual / target;
    return ratio >= 0.8 && ratio <= 1.2;
  };

  return (
    <div
      className={cn(
        "card group relative transition-all",
        matchScore >= 70 && "border-green-200 bg-green-50/30",
        "hover:shadow-card-hover"
      )}
    >
      {/* Match Score Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-bold shadow-sm",
            getScoreColor(matchScore)
          )}
        >
          {matchScore}% Match
        </span>
      </div>

      {/* Food Image Placeholder */}
      <div className="relative h-32 -mx-6 -mt-6 mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Utensils className="w-10 h-10 text-primary/30" />
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/80 text-text-muted">
            {category}
          </span>
        </div>
      </div>

      {/* Food Info */}
      <h3 className="font-semibold text-lg mb-1 pr-16">{food.name}</h3>
      <p className="text-sm text-text-muted mb-3">
        {food.portionSize}
        {food.portionUnit}
      </p>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <div className="text-center">
          <p className="nutrition-value text-sm text-orange-600 font-bold">
            {Math.round(food.calories)}
          </p>
          <p className="text-xs text-text-muted">kkal</p>
        </div>
        <div className="text-center">
          <p className="nutrition-value text-sm font-bold">
            {food.protein.toFixed(1)}g
          </p>
          <p className="text-xs text-text-muted">Prot</p>
        </div>
        <div className="text-center">
          <p className="nutrition-value text-sm text-amber-600 font-bold">
            {food.carbs.toFixed(1)}g
          </p>
          <p className="text-xs text-text-muted">Karbo</p>
        </div>
        <div className="text-center">
          <p className="nutrition-value text-sm text-red-600 font-bold">
            {food.fat.toFixed(1)}g
          </p>
          <p className="text-xs text-text-muted">Lemak</p>
        </div>
        <div className="text-center">
          <p className="nutrition-value text-sm text-green-600 font-bold">
            {food.fiber.toFixed(1)}g
          </p>
          <p className="text-xs text-text-muted">Serat</p>
        </div>
      </div>

      {/* Expandable Nutrition Comparison */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 text-sm text-text-muted hover:text-primary transition-colors"
      >
        <span>Detail Perbandingan</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 mb-4 p-3 bg-bg rounded-xl">
          {/* Calories */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-muted">Kalori</span>
              <span className={cn(isInRange(nutritionComparison.actualCalories, nutritionComparison.targetCalories) ? "text-green-600" : "text-amber-600")}>
                {Math.round(nutritionComparison.actualCalories)} / {Math.round(nutritionComparison.targetCalories)} kkal
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isInRange(nutritionComparison.actualCalories, nutritionComparison.targetCalories)
                    ? "bg-green-500"
                    : "bg-amber-500"
                )}
                style={{
                  width: `${getFillPercentage(nutritionComparison.actualCalories, nutritionComparison.targetCalories)}%`,
                }}
              />
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-muted">Protein</span>
              <span className={cn(isInRange(nutritionComparison.actualProtein, nutritionComparison.targetProtein) ? "text-green-600" : "text-amber-600")}>
                {nutritionComparison.actualProtein.toFixed(1)} / {nutritionComparison.targetProtein.toFixed(1)} g
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isInRange(nutritionComparison.actualProtein, nutritionComparison.targetProtein)
                    ? "bg-green-500"
                    : "bg-amber-500"
                )}
                style={{
                  width: `${getFillPercentage(nutritionComparison.actualProtein, nutritionComparison.targetProtein)}%`,
                }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-muted">Karbohidrat</span>
              <span className={cn(isInRange(nutritionComparison.actualCarbs, nutritionComparison.targetCarbs) ? "text-green-600" : "text-amber-600")}>
                {nutritionComparison.actualCarbs.toFixed(1)} / {nutritionComparison.targetCarbs.toFixed(1)} g
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isInRange(nutritionComparison.actualCarbs, nutritionComparison.targetCarbs)
                    ? "bg-green-500"
                    : "bg-amber-500"
                )}
                style={{
                  width: `${getFillPercentage(nutritionComparison.actualCarbs, nutritionComparison.targetCarbs)}%`,
                }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-muted">Lemak</span>
              <span className={cn(isInRange(nutritionComparison.actualFat, nutritionComparison.targetFat) ? "text-green-600" : "text-amber-600")}>
                {nutritionComparison.actualFat.toFixed(1)} / {nutritionComparison.targetFat.toFixed(1)} g
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isInRange(nutritionComparison.actualFat, nutritionComparison.targetFat)
                    ? "bg-green-500"
                    : "bg-amber-500"
                )}
                style={{
                  width: `${getFillPercentage(nutritionComparison.actualFat, nutritionComparison.targetFat)}%`,
                }}
              />
            </div>
          </div>

          {/* Fiber */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-muted">Serat</span>
              <span className={cn(isInRange(nutritionComparison.actualFiber, nutritionComparison.targetFiber) ? "text-green-600" : "text-amber-600")}>
                {nutritionComparison.actualFiber.toFixed(1)} / {nutritionComparison.targetFiber.toFixed(1)} g
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isInRange(nutritionComparison.actualFiber, nutritionComparison.targetFiber)
                    ? "bg-green-500"
                    : "bg-amber-500"
                )}
                style={{
                  width: `${getFillPercentage(nutritionComparison.actualFiber, nutritionComparison.targetFiber)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {onAddToLog && (
        <button
          onClick={() => onAddToLog(food)}
          disabled={isAdded}
          className={cn(
            "w-full mt-2 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            isAdded
              ? "bg-green-500 text-white"
              : "bg-primary text-white hover:bg-primary/90"
          )}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Ditambahkan
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Tambah ke Log Harian
            </>
          )}
        </button>
      )}
    </div>
  );
}
