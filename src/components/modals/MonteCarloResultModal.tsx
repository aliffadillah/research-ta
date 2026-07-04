"use client";

import { Brain, TrendingUp, TrendingDown, Minimize2, Maximize2, BarChart3 } from "lucide-react";

interface MonteCarloResult {
  success: boolean;
  date: string;
  basePrediction: Record<string, number>;
  metrics: {
    RMSE: number;
    MAPE: number;
  };
  iterations: number;
  statistics: Record<string, {
    mean: number;
    median: number;
    min: number;
    max: number;
    std: number;
    ci95: { lower: number; upper: number };
  }>;
  samples: Record<string, number[]>;
  hasExistingData: boolean;
  existingData: Record<string, number> | null;
}

interface MonteCarloResultProps {
  result: MonteCarloResult;
  onClose: () => void;
}

const NUTRITION_LABELS: Record<string, { label: string; unit: string; category: "energi" | "makro" }> = {
  energyBesar: { label: "Energi BG", unit: "kkal", category: "energi" },
  energyKecil: { label: "Energi KCL", unit: "kkal", category: "energi" },
  carbsBesar: { label: "Karbo BG", unit: "g", category: "makro" },
  carbsKecil: { label: "Karbo KCL", unit: "g", category: "makro" },
  proteinBesar: { label: "Protein BG", unit: "g", category: "makro" },
  proteinKecil: { label: "Protein KCL", unit: "g", category: "makro" },
  fatBesar: { label: "Lemak BG", unit: "g", category: "makro" },
  fatKecil: { label: "Lemak KCL", unit: "g", category: "makro" },
};

const categoryColors = {
  energi: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", accent: "bg-rose-500" },
  makro: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", accent: "bg-teal-500" },
};

export default function MonteCarloResult({ result, onClose }: MonteCarloResultProps) {
  const { statistics, basePrediction, metrics, iterations } = result;

  // Filter to show key nutrients
  const displayKeys = ["energyBesar", "energyKecil", "carbsBesar", "carbsKecil", "proteinBesar", "proteinKecil", "fatBesar", "fatKecil"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-t-4 border-primary">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Simulasi Monte Carlo</h2>
                <p className="text-sm text-text-muted">
                  {result.date} - {iterations} simulasi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg rounded-lg transition-colors"
            >
              <Minimize2 className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 mt-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Model Error Metrics:</p>
                <p className="text-amber-700">
                  RMSE: <span className="font-semibold">{metrics.RMSE}</span> kkal |
                  MAPE: <span className="font-semibold">{metrics.MAPE}%</span>
                </p>
                <p className="text-amber-600 mt-1">
                  Prediksi ditampilkan dengan rentang variasi berdasarkan error model
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayKeys.map((key) => {
              const stats = statistics[key];
              const label = NUTRITION_LABELS[key];
              if (!stats || !label) return null;

              const colors = categoryColors[label.category];
              const range = stats.max - stats.min;
              const baseValue = basePrediction[key];

              // Calculate bar width relative to mean
              const maxRange = Math.max(...displayKeys.map(k => statistics[k]?.max || 0));
              const minValue = Math.min(...displayKeys.map(k => statistics[k]?.min || 0));
              const totalRange = maxRange - minValue || 1;

              const barStartPercent = ((stats.min - minValue) / totalRange) * 100;
              const barWidthPercent = (range / totalRange) * 100;
              const meanPositionPercent = ((stats.mean - minValue) / totalRange) * 100;

              return (
                <div key={key} className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-semibold ${colors.text}`}>{label.label}</span>
                    <span className="text-xs text-text-muted">{label.unit}</span>
                  </div>

                  {/* Distribution Bar */}
                  <div className="relative h-8 bg-white/50 rounded-lg overflow-hidden mb-3">
                    {/* Min-Max Range Bar */}
                    <div
                      className={`absolute h-full ${colors.accent} opacity-20`}
                      style={{
                        left: `${barStartPercent}%`,
                        width: `${barWidthPercent}%`,
                      }}
                    />
                    {/* CI 95% Bar */}
                    <div
                      className={`absolute h-full ${colors.accent} opacity-40`}
                      style={{
                        left: `${((stats.ci95.lower - minValue) / totalRange) * 100}%`,
                        width: `${((stats.ci95.upper - stats.ci95.lower) / totalRange) * 100}%`,
                      }}
                    />
                    {/* Mean Line */}
                    <div
                      className={`absolute top-0 bottom-0 w-0.5 ${colors.accent}`}
                      style={{ left: `${meanPositionPercent}%` }}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <TrendingDown className="w-3 h-3" />
                        <span className="font-medium">{stats.min}</span>
                      </div>
                      <span className="text-text-muted">Min</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <span className="font-bold">{stats.mean}</span>
                      </div>
                      <span className="text-text-muted">Rata-rata</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600">
                        <span className="font-medium">{stats.median}</span>
                      </div>
                      <span className="text-text-muted">Median</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-red-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">{stats.max}</span>
                      </div>
                      <span className="text-text-muted">Max</span>
                    </div>
                  </div>

                  {/* CI 95% */}
                  <div className="mt-2 text-xs text-center text-text-muted">
                    CI 95%: [{stats.ci95.lower} - {stats.ci95.upper}]
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold mb-3">Legenda</h4>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 bg-rose-100 rounded" />
                <span>Rentangan Min-Max (keseluruhan)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 bg-rose-200 rounded" />
                <span>Confidence Interval 95%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-rose-500" />
                <span>Rata-rata (Mean)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
