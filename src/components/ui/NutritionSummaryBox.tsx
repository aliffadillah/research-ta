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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Target Nutrisi Porsi {portionType === "besar" ? "Besar" : "Kecil"}</h3>
            <p className="text-xs text-text-muted">
              Kebutuhan gizi per porsi makan
            </p>
          </div>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            portionType === "besar"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          )}
        >
          Porsi {portionType === "besar" ? "Besar" : "Kecil"}
        </span>
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-5 gap-3">
        <div className="text-center p-3 bg-white/60 rounded-xl">
          <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
          <p className="nutrition-value text-xl text-orange-600 font-bold">
            {Math.round(target.energi)}
</p>
          <p className="text-xs text-text-muted">kkal</p>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-xl">
          <Drumstick className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="nutrition-value text-xl font-bold">
            {target.protein.toFixed(1)}g
          </p>
          <p className="text-xs text-text-muted">Protein</p>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-xl">
          <Wheat className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <p className="nutrition-value text-xl text-amber-600 font-bold">
            {target.karbohidrat.toFixed(1)}g
          </p>
          <p className="text-xs text-text-muted">Karbo</p>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-xl">
          <Apple className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <p className="nutrition-value text-xl text-red-600 font-bold">
            {target.lemak.toFixed(1)}g
          </p>
          <p className="text-xs text-text-muted">Lemak</p>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-xl">
          <Scale className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="nutrition-value text-xl text-green-600 font-bold">
            {target.serat.toFixed(1)}g
          </p>
          <p className="text-xs text-text-muted">Serat</p>
        </div>
      </div>
    </div>
  );
}
