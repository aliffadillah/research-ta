"use client";

import { Brain, Flame, Drumstick, Wheat, Apple, Scale } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface NutritionValues {
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
}

interface NutritionSummaryBoxProps {
  target: NutritionValues;
  portionType: "besar" | "kecil";
}

export default function NutritionSummaryBox({
  target,
  portionType,
}: NutritionSummaryBoxProps) {
  return (
    <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">Target Nutrisi {portionType === "besar" ? "Porsi Besar" : "Porsi Kecil"}</h3>
            <p className="text-[10px] sm:text-xs text-text-muted hidden sm:block">
              Kebutuhan gizi per porsi makan
            </p>
          </div>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0",
            portionType === "besar"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          )}
        >
          {portionType === "besar" ? "Porsi Besar" : "Porsi Kecil"}
        </span>
      </div>

      {/* Nutrition Grid - 5 columns compact */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {/* Energi */}
        <div className="text-center py-1.5 px-0.5 sm:py-2 sm:px-1 bg-white/60 rounded-lg sm:rounded-xl">
          <Flame className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-600 mx-auto mb-0.5" />
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-lg font-bold text-orange-600 leading-tight">
            {Math.round(target.energi)}
          </p>
          <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-text-muted leading-tight">kkal</p>
        </div>
        {/* Protein */}
        <div className="text-center py-1.5 px-0.5 sm:py-2 sm:px-1 bg-white/60 rounded-lg sm:rounded-xl">
          <Drumstick className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary mx-auto mb-0.5" />
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-lg font-bold leading-tight">
            {target.protein.toFixed(1)}
          </p>
          <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-text-muted leading-tight">Prot</p>
        </div>
        {/* Karbo */}
        <div className="text-center py-1.5 px-0.5 sm:py-2 sm:px-1 bg-white/60 rounded-lg sm:rounded-xl">
          <Wheat className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-600 mx-auto mb-0.5" />
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-lg font-bold text-amber-600 leading-tight">
            {target.karbohidrat.toFixed(1)}
          </p>
          <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-text-muted leading-tight">Karbo</p>
        </div>
        {/* Lemak */}
        <div className="text-center py-1.5 px-0.5 sm:py-2 sm:px-1 bg-white/60 rounded-lg sm:rounded-xl">
          <Apple className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600 mx-auto mb-0.5" />
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-lg font-bold text-red-600 leading-tight">
            {target.lemak.toFixed(1)}
          </p>
          <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-text-muted leading-tight">Lemak</p>
        </div>
        {/* Serat */}
        <div className="text-center py-1.5 px-0.5 sm:py-2 sm:px-1 bg-white/60 rounded-lg sm:rounded-xl">
          <Scale className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 mx-auto mb-0.5" />
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-lg font-bold text-green-600 leading-tight">
            {target.serat.toFixed(1)}
          </p>
          <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-text-muted leading-tight">Serat</p>
        </div>
      </div>
    </div>
  );
}
