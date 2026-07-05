"use client";

import React, { useState } from "react";
import { Check, Database, Cpu, HelpCircle, ChevronDown, ChevronUp, CheckCircle2, XCircle, UtensilsCrossed, Info, CheckCircle, AlertTriangle, XCircle as XCircleIcon, Minus, BarChart3, Table2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { SppgMenu, matchWithSppgMenus, checkMenuNutrition, DEFAULT_NUTRITION_TARGET, NutritionCheckResult, NutritionTarget } from "@/data/sppg-menus";

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Prediction {
  class: string;
  confidence: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  source?: string;
  foodId?: string | null;
  bbox?: BoundingBox | number[];
  originalClass?: string;
}

interface DetectionResultProps {
  predictions: Prediction[];
  selectedPrediction: Prediction | null;
  onSelectPrediction: (prediction: Prediction) => void;
  imageWidth?: number;
  imageHeight?: number;
  portionSize?: number;
  sppgMenus?: SppgMenu[];
  nutritionTargetBesar?: NutritionTarget | null;
  nutritionTargetKecil?: NutritionTarget | null;
  targetDate?: string | null;
}

const sourceConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  database: { icon: <Database className="w-3 h-3" />, label: "Database", color: "bg-green-100 text-green-700" },
  database_random: { icon: <Database className="w-3 h-3" />, label: "DB Random", color: "bg-green-50 text-green-600" },
  ml_client: { icon: <Cpu className="w-3 h-3" />, label: "ML Client", color: "bg-blue-100 text-blue-700" },
  ml_client_fallback: { icon: <Cpu className="w-3 h-3" />, label: "ML Fallback", color: "bg-blue-50 text-blue-600" },
  default: { icon: <HelpCircle className="w-3 h-3" />, label: "Default", color: "bg-gray-100 text-gray-600" },
};

// Tab type
type TabType = "summary" | "sppg" | "comparison";

export default function DetectionResult({
  predictions,
  selectedPrediction,
  onSelectPrediction,
  portionSize = 100,
  sppgMenus,
  nutritionTargetBesar,
  nutritionTargetKecil,
  targetDate,
}: DetectionResultProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [portionBesarPercent, setPortionBesarPercent] = useState(32);
  const [portionKecilPercent, setPortionKecilPercent] = useState(22);
  const [expandedPredIndex, setExpandedPredIndex] = useState<number | null>(null);

  // Helper to get non-zero target values
  const getValidTarget = (target: NutritionTarget | null | undefined, fallback: NutritionTarget): NutritionTarget => {
    if (!target) return fallback;
    return {
      energi: target.energi || fallback.energi,
      protein: target.protein || fallback.protein,
      karbohidrat: target.karbohidrat || fallback.karbohidrat,
      lemak: target.lemak || fallback.lemak,
      serat: target.serat || fallback.serat,
    };
  };

  // Default target for full daily nutrition (used as fallback)
  const defaultFullTarget: NutritionTarget = {
    energi: 2100,
    protein: 60,
    karbohidrat: 300,
    lemak: 70,
    serat: 30,
  };

  const activeTargetBesar = getValidTarget(nutritionTargetBesar, defaultFullTarget);
  const activeTargetKecil = getValidTarget(nutritionTargetKecil, defaultFullTarget);

  if (predictions.length === 0) {
    return null;
  }

  // Calculate total nutrition from all detections
  const totalNutrition = predictions.reduce((acc, p) => ({
    calories: acc.calories + (p.nutrition?.calories || 0),
    protein: acc.protein + (p.nutrition?.protein || 0),
    carbs: acc.carbs + (p.nutrition?.carbs || 0),
    fat: acc.fat + (p.nutrition?.fat || 0),
    fiber: acc.fiber + (p.nutrition?.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  // Match with SPPG menus
  const detectedFoodNames = predictions.map((p) => p.class);
  const sppgMatches = sppgMenus ? matchWithSppgMenus(detectedFoodNames, 3) : matchWithSppgMenus(detectedFoodNames, 3);
  const bestMatch = sppgMatches.length > 0 ? sppgMatches[0] : null;

  // Check nutrition status
  const nutritionBesar = bestMatch ? checkMenuNutrition(bestMatch.menu.kandungan_gizi_porsi_besar, activeTargetBesar) : null;
  const nutritionKecil = bestMatch ? checkMenuNutrition(bestMatch.menu.kandungan_gizi_porsi_kecil, activeTargetKecil) : null;

  // Color helper
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "terpenuhi": return "text-green-600 bg-green-100";
      case "hampir": return "text-amber-600 bg-amber-100";
      case "kurang": return "text-red-600 bg-red-100";
      default: return "text-gray-500 bg-gray-100";
    }
  };

  const getDiffColor = (diff: number) => {
    const abs = Math.abs(diff);
    if (abs <= 10) return "text-green-600 bg-green-100";
    if (abs <= 25) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  // Tabs configuration
  const tabs = [
    { id: "summary" as TabType, label: "Ringkasan", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "sppg" as TabType, label: "Menu SPPG", icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: "comparison" as TabType, label: "Perbandingan", icon: <Table2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "sppg" && bestMatch && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                {bestMatch.matchPercentage}%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          {/* Quick Stats - 5 Column Grid */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Kalori", value: Math.round(totalNutrition.calories), unit: "kkal", bg: "bg-orange-50", text: "text-orange-700" },
              { label: "Protein", value: totalNutrition.protein.toFixed(1), unit: "g", bg: "bg-blue-50", text: "text-blue-700" },
              { label: "Karbo", value: totalNutrition.carbs.toFixed(1), unit: "g", bg: "bg-amber-50", text: "text-amber-700" },
              { label: "Lemak", value: totalNutrition.fat.toFixed(1), unit: "g", bg: "bg-red-50", text: "text-red-600" },
              { label: "Serat", value: totalNutrition.fiber.toFixed(1), unit: "g", bg: "bg-green-50", text: "text-green-700" },
            ].map((item) => (
              <div key={item.label} className={cn("card text-center", item.bg)}>
                <p className="text-xl font-semibold mb-0.5">{item.value}</p>
                <p className={cn("text-xs", item.text)}>{item.label} <span className="opacity-60">({item.unit})</span></p>
              </div>
            ))}
          </div>

          {/* Portion Calculator */}
          <div className="grid grid-cols-2 gap-4">
            {/* Porsi Besar */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Porsi Besar ({portionBesarPercent}%)
                </span>
                <input
                  type="range"
                  min="30"
                  max="35"
                  step="1"
                  value={portionBesarPercent}
                  onChange={(e) => setPortionBesarPercent(Number(e.target.value))}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {Math.round(portionSize * portionBesarPercent / 100)}g dari {portionSize}g total
              </p>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { v: Math.round(totalNutrition.calories * portionBesarPercent / 100), l: "Kal" },
                  { v: (totalNutrition.protein * portionBesarPercent / 100).toFixed(1), l: "Prot" },
                  { v: (totalNutrition.carbs * portionBesarPercent / 100).toFixed(1), l: "Karbo" },
                  { v: (totalNutrition.fat * portionBesarPercent / 100).toFixed(1), l: "Lemak" },
                  { v: (totalNutrition.fiber * portionBesarPercent / 100).toFixed(1), l: "Serat" },
                ].map((item) => (
                  <div key={item.l} className="bg-gray-100 rounded-lg py-2">
                    <p className="font-semibold text-gray-700">{item.v}</p>
                    <p className="text-[10px] text-gray-500">{item.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Porsi Kecil */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Porsi Kecil ({portionKecilPercent}%)
                </span>
                <input
                  type="range"
                  min="20"
                  max="25"
                  step="1"
                  value={portionKecilPercent}
                  onChange={(e) => setPortionKecilPercent(Number(e.target.value))}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {Math.round(portionSize * portionKecilPercent / 100)}g dari {portionSize}g total
              </p>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { v: Math.round(totalNutrition.calories * portionKecilPercent / 100), l: "Kal" },
                  { v: (totalNutrition.protein * portionKecilPercent / 100).toFixed(1), l: "Prot" },
                  { v: (totalNutrition.carbs * portionKecilPercent / 100).toFixed(1), l: "Karbo" },
                  { v: (totalNutrition.fat * portionKecilPercent / 100).toFixed(1), l: "Lemak" },
                  { v: (totalNutrition.fiber * portionKecilPercent / 100).toFixed(1), l: "Serat" },
                ].map((item) => (
                  <div key={item.l} className="bg-gray-100 rounded-lg py-2">
                    <p className="font-semibold text-gray-700">{item.v}</p>
                    <p className="text-[10px] text-gray-500">{item.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detected Foods Summary */}
          <div className="card">
            <h4 className="font-semibold text-gray-800 mb-3">Makanan Terdeteksi ({predictions.length})</h4>
            <div className="flex flex-wrap gap-2">
              {predictions.map((pred, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPrediction(pred);
                    setExpandedPredIndex(expandedPredIndex === idx ? null : idx);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                    selectedPrediction === pred
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white",
                    selectedPrediction === pred ? "bg-primary" : "bg-gray-400"
                  )}>
                    {idx + 1}
                  </span>
                  {pred.class}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Food Detail */}
          {selectedPrediction?.nutrition && (
            <div className="card">
              <h5 className="font-medium text-gray-700 mb-3">Detail: {selectedPrediction.class}</h5>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: "Kalori", value: Math.round(selectedPrediction.nutrition.calories), unit: "kkal" },
                  { label: "Protein", value: selectedPrediction.nutrition.protein.toFixed(1), unit: "g" },
                  { label: "Karbo", value: selectedPrediction.nutrition.carbs.toFixed(1), unit: "g" },
                  { label: "Lemak", value: selectedPrediction.nutrition.fat.toFixed(1), unit: "g" },
                  { label: "Serat", value: selectedPrediction.nutrition.fiber.toFixed(1), unit: "g" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-gray-800">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label} ({item.unit})</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SPPG Tab */}
      {activeTab === "sppg" && bestMatch && (
        <div className="space-y-4">
          {/* Match Header */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Menu #{bestMatch.menu.no} SPPG</h4>
                  <p className="text-sm text-gray-500">{bestMatch.matchPercentage}% kecocokan</p>
                </div>
              </div>
              {nutritionBesar && (
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getStatusColor(nutritionBesar.overallStatus))}>
                  {nutritionBesar.overallStatus === "terpenuhi" && <><CheckCircle className="w-4 h-4 inline mr-1" />Terpenuhi</>}
                  {nutritionBesar.overallStatus === "hampir" && <><AlertTriangle className="w-4 h-4 inline mr-1" />Hampir</>}
                  {nutritionBesar.overallStatus === "kurang" && <><XCircle className="w-4 h-4 inline mr-1" />Kurang</>}
                  {nutritionBesar.overallStatus === "berlebihan" && <><Minus className="w-4 h-4 inline mr-1" />Berlebihan</>}
                </span>
              )}
            </div>
          </div>

          {/* Daftar Menu */}
          <div className="card">
            <h4 className="font-medium text-gray-700 mb-3">Daftar Menu</h4>
            <div className="flex flex-wrap gap-2">
              {bestMatch.menu.daftar_menu.map((menuItem, idx) => {
                const isMatched = bestMatch.matchedItems.some(
                  (m) =>
                    m.toLowerCase() === menuItem.toLowerCase() ||
                    menuItem.toLowerCase().includes(m.toLowerCase()) ||
                    m.toLowerCase().includes(menuItem.toLowerCase())
                );
                return (
                  <span
                    key={idx}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border",
                      isMatched ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                    )}
                  >
                    {isMatched ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {menuItem}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Nutrition Status - Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Porsi Besar */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Porsi Besar
                </span>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(nutritionBesar?.overallStatus))}>
                  {nutritionBesar?.terpenuhiCount}/{nutritionBesar?.totalCount} nutrisi
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Energi", result: nutritionBesar?.energi, unit: "kkal" },
                  { label: "Protein", result: nutritionBesar?.protein, unit: "g" },
                  { label: "Karbo", result: nutritionBesar?.karbohidrat, unit: "g" },
                  { label: "Lemak", result: nutritionBesar?.lemak, unit: "g" },
                  { label: "Serat", result: nutritionBesar?.serat, unit: "g" },
                ].map((item) => (
                  <div key={item.label} className={cn("flex justify-between items-center p-2 rounded-lg", item.result ? getStatusColor(item.result.status) : "bg-gray-100")}>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-semibold">
                      {item.result ? `${item.result.actual} / ${item.result.target} ${item.unit}` : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Porsi Kecil */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Porsi Kecil
                </span>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(nutritionKecil?.overallStatus))}>
                  {nutritionKecil?.terpenuhiCount}/{nutritionKecil?.totalCount} nutrisi
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Energi", result: nutritionKecil?.energi, unit: "kkal" },
                  { label: "Protein", result: nutritionKecil?.protein, unit: "g" },
                  { label: "Karbo", result: nutritionKecil?.karbohidrat, unit: "g" },
                  { label: "Lemak", result: nutritionKecil?.lemak, unit: "g" },
                  { label: "Serat", result: nutritionKecil?.serat, unit: "g" },
                ].map((item) => (
                  <div key={item.label} className={cn("flex justify-between items-center p-2 rounded-lg", item.result ? getStatusColor(item.result.status) : "bg-gray-100")}>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-semibold">
                      {item.result ? `${item.result.actual} / ${item.result.target} ${item.unit}` : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Target Info */}
          {targetDate ? (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-xs text-gray-700">
                <strong>Target harian dari prediksi LSTM:</strong>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <strong>Porsi Besar:</strong>
                    </span>
                    <div className="ml-4 mt-1">
                      {activeTargetBesar.energi} kkal, {activeTargetBesar.protein}g protein, {activeTargetBesar.karbohidrat}g karbo, {activeTargetBesar.lemak}g lemak, {activeTargetBesar.serat}g serat
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <strong>Porsi Kecil:</strong>
                    </span>
                    <div className="ml-4 mt-1">
                      {activeTargetKecil.energi} kkal, {activeTargetKecil.protein}g protein, {activeTargetKecil.karbohidrat}g karbo, {activeTargetKecil.lemak}g lemak, {activeTargetKecil.serat}g serat
                    </div>
                  </div>
                </div>
                <div className="text-gray-500 mt-2">
                  {new Date(targetDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-100 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-xs text-gray-500">
                Target harian default. Prediksi LSTM belum tersedia.
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "sppg" && !bestMatch && (
        <div className="card text-center py-12">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada menu SPPG yang cocok</p>
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === "comparison" && bestMatch && (
        <div className="space-y-4">
          {/* Target Info */}
          {targetDate ? (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-xs text-gray-700">
                <strong>Target harian dari prediksi LSTM:</strong>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <strong>Porsi Besar:</strong>
                    </span>
                    <div className="ml-4 mt-1">
                      {activeTargetBesar.energi} kkal, {activeTargetBesar.protein}g protein, {activeTargetBesar.karbohidrat}g karbo, {activeTargetBesar.lemak}g lemak, {activeTargetBesar.serat}g serat
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <strong>Porsi Kecil:</strong>
                    </span>
                    <div className="ml-4 mt-1">
                      {activeTargetKecil.energi} kkal, {activeTargetKecil.protein}g protein, {activeTargetKecil.karbohidrat}g karbo, {activeTargetKecil.lemak}g lemak, {activeTargetKecil.serat}g serat
                    </div>
                  </div>
                </div>
                <div className="text-gray-500 mt-2">
                  {new Date(targetDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-100 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-xs text-gray-500">
                Target harian default. Prediksi LSTM belum tersedia.
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Nutrisi</th>
                    <th className="px-3 py-3 text-center font-semibold text-green-700">Target BG</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-500">Deteksi BG</th>
                    <th className="px-3 py-3 text-center font-semibold text-green-600">SPPG BG</th>
                    <th className="px-3 py-3 text-center font-semibold text-blue-700">Target KCL</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-500">Deteksi KCL</th>
                    <th className="px-3 py-3 text-center font-semibold text-blue-600">SPPG KCL</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Energi", key: "energi", unit: "kkal", det: totalNutrition.calories },
                    { label: "Protein", key: "protein", unit: "g", det: totalNutrition.protein },
                    { label: "Karbo", key: "karbohidrat", unit: "g", det: totalNutrition.carbs },
                    { label: "Lemak", key: "lemak", unit: "g", det: totalNutrition.fat },
                    { label: "Serat", key: "serat", unit: "g", det: totalNutrition.fiber },
                  ].map((item) => {
                    // Porsi Besar
                    const targetBG = activeTargetBesar[item.key as keyof typeof activeTargetBesar] as number;
                    const detBG = Math.round(item.det * portionBesarPercent / 100);
                    const diffBG = targetBG > 0 ? ((detBG - targetBG) / targetBG * 100) : 0;
                    const sppgBG = parseFloat(bestMatch.menu.kandungan_gizi_porsi_besar[item.key as keyof typeof bestMatch.menu.kandungan_gizi_porsi_besar] as string) || 0;

                    // Porsi Kecil
                    const targetKCL = activeTargetKecil[item.key as keyof typeof activeTargetKecil] as number;
                    const detKCL = Math.round(item.det * portionKecilPercent / 100);
                    const diffKCL = targetKCL > 0 ? ((detKCL - targetKCL) / targetKCL * 100) : 0;
                    const sppgKCL = parseFloat(bestMatch.menu.kandungan_gizi_porsi_kecil[item.key as keyof typeof bestMatch.menu.kandungan_gizi_porsi_kecil] as string) || 0;

                    return (
                      <tr key={item.key} className="border-b border-gray-100">
                        <td className="px-3 py-3 font-medium text-gray-700">
                          {item.label}
                          <span className="text-xs text-gray-400 ml-1">({item.unit})</span>
                        </td>
                        {/* Porsi Besar */}
                        <td className="px-3 py-3 text-center bg-green-50">
                          <span className="font-semibold text-green-700">{targetBG}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-semibold text-gray-700">{detBG}</span>
                          <span className={cn("ml-1 px-1 py-0.5 rounded text-xs font-medium", getDiffColor(diffBG))}>
                            {diffBG > 0 ? "+" : ""}{diffBG.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center bg-green-50/50 font-semibold text-green-600">{sppgBG}</td>
                        {/* Porsi Kecil */}
                        <td className="px-3 py-3 text-center bg-blue-50">
                          <span className="font-semibold text-blue-700">{targetKCL}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-semibold text-gray-700">{detKCL}</span>
                          <span className={cn("ml-1 px-1 py-0.5 rounded text-xs font-medium", getDiffColor(diffKCL))}>
                            {diffKCL > 0 ? "+" : ""}{diffKCL.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center bg-blue-50/50 font-semibold text-blue-600">{sppgKCL}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">±10%</span> Sesuai
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">±25%</span> Hampir
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">&gt;25%</span> Berbeda
            </span>
          </div>
        </div>
      )}

      {activeTab === "comparison" && !bestMatch && (
        <div className="card text-center py-12">
          <Table2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada data perbandingan</p>
        </div>
      )}
    </div>
  );
}
