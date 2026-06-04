"use client";

import React, { useState } from "react";
import { Check, Database, Cpu, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface RawDetection {
  bbox?: BoundingBox;
  box?: BoundingBox;
  coordinates?: BoundingBox;
  xyxy?: number[];
  bounds?: number[];
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
}

const sourceConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  database: { icon: <Database className="w-3 h-3" />, label: "Database", color: "bg-green-100 text-green-700" },
  database_random: { icon: <Database className="w-3 h-3" />, label: "DB Random", color: "bg-green-50 text-green-600" },
  ml_client: { icon: <Cpu className="w-3 h-3" />, label: "ML Client", color: "bg-blue-100 text-blue-700" },
  ml_client_fallback: { icon: <Cpu className="w-3 h-3" />, label: "ML Fallback", color: "bg-blue-50 text-blue-600" },
  default: { icon: <HelpCircle className="w-3 h-3" />, label: "Default", color: "bg-gray-100 text-gray-600" },
};

// Extract bounding box from various formats
const extractBbox = (pred: Prediction): BoundingBox | null => {
  const raw = pred.bbox;
  if (!raw) return null;

  if (Array.isArray(raw) && raw.length === 4) {
    return { x1: raw[0], y1: raw[1], x2: raw[2], y2: raw[3] };
  }
  if (typeof raw === "object" && "x1" in raw) {
    return raw as BoundingBox;
  }
  return null;
};

// Get color for each detection
const getDetectionColor = (index: number) => {
  const colors = [
    "bg-red-500 border-red-500",    // 0
    "bg-blue-500 border-blue-500",  // 1
    "bg-green-500 border-green-500", // 2
    "bg-yellow-500 border-yellow-500", // 3
    "bg-purple-500 border-purple-500", // 4
    "bg-pink-500 border-pink-500",  // 5
    "bg-cyan-500 border-cyan-500",  // 6
    "bg-orange-500 border-orange-500", // 7
  ];
  return colors[index % colors.length];
};

export default function DetectionResult({
  predictions,
  selectedPrediction,
  onSelectPrediction,
  imageWidth = 640,
  imageHeight = 640,
  portionSize = 100,
}: DetectionResultProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [portionBesarPercent, setPortionBesarPercent] = useState(32);
  const [portionKecilPercent, setPortionKecilPercent] = useState(22);

  if (predictions.length === 0) {
    return null;
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Calculate total nutrition from all detections
  const totalNutrition = predictions.reduce((acc, p) => ({
    calories: acc.calories + (p.nutrition?.calories || 0),
    protein: acc.protein + (p.nutrition?.protein || 0),
    carbs: acc.carbs + (p.nutrition?.carbs || 0),
    fat: acc.fat + (p.nutrition?.fat || 0),
    fiber: acc.fiber + (p.nutrition?.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return (
    <div className="space-y-4">
      {/* Summary Stats - Ringkasan Nutrisi */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Ringkasan Nutrisi Terdeteksi</h4>
          <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            {portionSize}g
          </span>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center">
            <div className="h-8 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-medium">Kalori</span>
            </div>
          </div>
          <div className="text-center">
            <div className="h-8 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-medium">Protein</span>
            </div>
          </div>
          <div className="text-center">
            <div className="h-8 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-medium">Karbo</span>
            </div>
          </div>
          <div className="text-center">
            <div className="h-8 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-medium">Lemak</span>
            </div>
          </div>
        </div>

        {/* Per 100g */}
        <div className="mb-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-center text-xs text-gray-500 mb-2 font-medium">per 100g</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="text-xl font-bold text-gray-700">{Math.round(totalNutrition.calories)}</div>
              <div className="text-xl font-bold text-gray-700">{totalNutrition.protein.toFixed(1)}g</div>
              <div className="text-xl font-bold text-gray-700">{totalNutrition.carbs.toFixed(1)}g</div>
              <div className="text-xl font-bold text-gray-700">{totalNutrition.fat.toFixed(1)}g</div>
            </div>
          </div>
        </div>

        {/* Porsi Besar & Kecil side by side with adjustable percentage */}
        <div className="grid grid-cols-2 gap-3">
          {/* Porsi Besar - adjustable 30-35% */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-green-800">Porsi Besar</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="30"
                  max="35"
                  step="1"
                  value={portionBesarPercent}
                  onChange={(e) => setPortionBesarPercent(Number(e.target.value))}
                  className="w-20 h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full font-medium w-12 text-center">{portionBesarPercent}%</span>
              </div>
            </div>
            <div className="text-xs text-green-600 mb-2">{Math.round(portionSize * portionBesarPercent / 100)}g dari {portionSize}g</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="text-lg font-bold text-green-700">{Math.round(totalNutrition.calories * portionBesarPercent / 100)}</div>
              <div className="text-lg font-bold text-green-700">{(totalNutrition.protein * portionBesarPercent / 100).toFixed(1)}g</div>
              <div className="text-lg font-bold text-green-700">{(totalNutrition.carbs * portionBesarPercent / 100).toFixed(1)}g</div>
              <div className="text-lg font-bold text-green-700">{(totalNutrition.fat * portionBesarPercent / 100).toFixed(1)}g</div>
            </div>
          </div>

          {/* Porsi Kecil - adjustable 20-25% */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-blue-800">Porsi Kecil</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="20"
                  max="25"
                  step="1"
                  value={portionKecilPercent}
                  onChange={(e) => setPortionKecilPercent(Number(e.target.value))}
                  className="w-20 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium w-12 text-center">{portionKecilPercent}%</span>
              </div>
            </div>
            <div className="text-xs text-blue-600 mb-2">{Math.round(portionSize * portionKecilPercent / 100)}g dari {portionSize}g</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="text-lg font-bold text-blue-700">{Math.round(totalNutrition.calories * portionKecilPercent / 100)}</div>
              <div className="text-lg font-bold text-blue-700">{(totalNutrition.protein * portionKecilPercent / 100).toFixed(1)}g</div>
              <div className="text-lg font-bold text-blue-700">{(totalNutrition.carbs * portionKecilPercent / 100).toFixed(1)}g</div>
              <div className="text-lg font-bold text-blue-700">{(totalNutrition.fat * portionKecilPercent / 100).toFixed(1)}g</div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="card-static">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Deteksi Teridentifikasi</h3>
            <p className="text-sm text-text-muted">
              {predictions.length} objek makanan terdeteksi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-primary/10 rounded-lg">
              <span className="text-primary font-semibold">{predictions.length}</span>
              <span className="text-text-muted text-sm ml-1">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Detections List */}
      <div className="space-y-3">
        {predictions.map((prediction, index) => {
          const bbox = extractBbox(prediction);
          const color = getDetectionColor(index);
          const isSelected = selectedPrediction === prediction;
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className={cn(
                "card-static transition-all cursor-pointer",
                isSelected ? "ring-2 ring-primary" : "hover:shadow-card-hover"
              )}
              onClick={() => {
                onSelectPrediction(prediction);
                toggleExpand(index);
              }}
            >
              {/* Header Row */}
              <div className="flex items-start gap-4">
                {/* Number Badge with Bounding Box Preview */}
                <div className="relative">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
                    color.split(" ")[0]
                  )}>
                    {index + 1}
                  </div>
                  {bbox && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                      <div className={cn("w-3 h-3 rounded-sm", color.split(" ")[0])} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{prediction.class}</h4>
                    {prediction.originalClass && prediction.originalClass !== prediction.class && (
                      <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded">
                        ML: {prediction.originalClass}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-sm font-bold",
                      prediction.confidence >= 80 ? "bg-green-100 text-green-700" :
                      prediction.confidence >= 60 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {prediction.confidence.toFixed(1)}%
                    </span>

                    {prediction.source && (
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                        sourceConfig[prediction.source]?.color || "bg-gray-100 text-gray-600"
                      )}>
                        {sourceConfig[prediction.source]?.icon}
                        {sourceConfig[prediction.source]?.label}
                      </span>
                    )}

                    {prediction.foodId && (
                      <span className="text-xs text-text-muted bg-gray-100 px-2 py-1 rounded">
                        ID: {String(prediction.foodId).substring(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand/Collapse */}
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && prediction.nutrition && (
                <div className="mt-4 pt-4 border-t border-border">
                  {/* Nutrition Grid */}
                  <div className="bg-bg rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Kandungan Nutrisi (per 100g)</h5>
                      <span className="text-xs text-text-muted">per {prediction.nutrition.calories} kkal</span>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      {/* Kalori */}
                      <div className="text-center p-3 bg-primary/10 rounded-xl">
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(prediction.nutrition.calories)}
                        </p>
                        <p className="text-xs text-text-muted mt-1">Kalori (kkal)</p>
                      </div>

                      {/* Protein */}
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">
                          {prediction.nutrition.protein.toFixed(1)}
                        </p>
                        <p className="text-xs text-text-muted mt-1">Protein (g)</p>
                      </div>

                      {/* Karbo */}
                      <div className="text-center p-3 bg-amber-50 rounded-xl">
                        <p className="text-2xl font-bold text-amber-600">
                          {prediction.nutrition.carbs.toFixed(1)}
                        </p>
                        <p className="text-xs text-text-muted mt-1">Karbo (g)</p>
                      </div>

                      {/* Lemak */}
                      <div className="text-center p-3 bg-red-50 rounded-xl">
                        <p className="text-2xl font-bold text-red-500">
                          {prediction.nutrition.fat.toFixed(1)}
                        </p>
                        <p className="text-xs text-text-muted mt-1">Lemak (g)</p>
                      </div>

                      {/* Serat */}
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">
                          {prediction.nutrition.fiber.toFixed(1)}
                        </p>
                        <p className="text-xs text-text-muted mt-1">Serat (g)</p>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted w-16">Kalori</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(prediction.nutrition.calories / 4, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{Math.round(prediction.nutrition.calories)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted w-16">Protein</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(prediction.nutrition.protein * 5, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{prediction.nutrition.protein.toFixed(1)}g</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted w-16">Karbo</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(prediction.nutrition.carbs / 4, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{prediction.nutrition.carbs.toFixed(1)}g</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted w-16">Lemak</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: `${Math.min(prediction.nutrition.fat * 5, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{prediction.nutrition.fat.toFixed(1)}g</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted w-16">Serat</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.min(prediction.nutrition.fiber * 10, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{prediction.nutrition.fiber.toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Bounding Box Info */}
                  {bbox && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-text-muted mb-2">Bounding Box:</p>
                      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                        <div className="bg-white p-2 rounded">x1: {bbox.x1.toFixed(0)}</div>
                        <div className="bg-white p-2 rounded">y1: {bbox.y1.toFixed(0)}</div>
                        <div className="bg-white p-2 rounded">x2: {bbox.x2.toFixed(0)}</div>
                        <div className="bg-white p-2 rounded">y2: {bbox.y2.toFixed(0)}</div>
                      </div>
                    </div>
                  )}

                  {/* Raw Data */}
                  <details className="mt-3">
                    <summary className="text-xs text-text-muted cursor-pointer hover:text-text">
                      Data mentah JSON
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs overflow-x-auto max-h-40">
                      {JSON.stringify(prediction, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}