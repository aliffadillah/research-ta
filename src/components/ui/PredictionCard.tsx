"use client";

import { TrendingUp, Flame, Drumstick, Wheat, Apple, Scale, Loader2, RefreshCw, Info } from "lucide-react";

interface PredictionCardProps {
  className?: string;
}

// MBG (Makro Bahagia) Standards
// Porsi Besar: 30-35% dari kebutuhan harian
// Porsi Kecil: 20-25% dari kebutuhan harian
const MBG_STANDARDS = {
  daily: {
    energi: 2100,      // 2100 kcal recommended daily
    protein: 60,       // 60g protein
    karbohidrat: 300,   // 300g carbs
    lemak: 70,         // 70g fat
    serat: 30,         // 30g fiber
  },
  porsiBesar: {
    min: 30,  // 30%
    max: 35,  // 35%
  },
  porsiKecil: {
    min: 20,  // 20%
    max: 25,  // 25%
  },
};

export default function PredictionCard({ className = "" }: PredictionCardProps) {
  // Format today's date
  const today = new Date();
  const formatDisplayDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  // Calculate MBG portions (30-35% for besar, 20-25% for kecil)
  const calculateRange = (value: number, minPercent: number, maxPercent: number) => {
    const min = Math.round((value * minPercent) / 100);
    const max = Math.round((value * maxPercent) / 100);
    return { min, max };
  };

  const energiBesar = calculateRange(MBG_STANDARDS.daily.energi, MBG_STANDARDS.porsiBesar.min, MBG_STANDARDS.porsiBesar.max);
  const proteinBesar = calculateRange(MBG_STANDARDS.daily.protein, MBG_STANDARDS.porsiBesar.min, MBG_STANDARDS.porsiBesar.max);
  const karboBesar = calculateRange(MBG_STANDARDS.daily.karbohidrat, MBG_STANDARDS.porsiBesar.min, MBG_STANDARDS.porsiBesar.max);
  const lemakBesar = calculateRange(MBG_STANDARDS.daily.lemak, MBG_STANDARDS.porsiBesar.min, MBG_STANDARDS.porsiBesar.max);
  const seratBesar = calculateRange(MBG_STANDARDS.daily.serat, MBG_STANDARDS.porsiBesar.min, MBG_STANDARDS.porsiBesar.max);

  const energiKecil = calculateRange(MBG_STANDARDS.daily.energi, MBG_STANDARDS.porsiKecil.min, MBG_STANDARDS.porsiKecil.max);
  const proteinKecil = calculateRange(MBG_STANDARDS.daily.protein, MBG_STANDARDS.porsiKecil.min, MBG_STANDARDS.porsiKecil.max);
  const karboKecil = calculateRange(MBG_STANDARDS.daily.karbohidrat, MBG_STANDARDS.porsiKecil.min, MBG_STANDARDS.porsiKecil.max);
  const lemakKecil = calculateRange(MBG_STANDARDS.daily.lemak, MBG_STANDARDS.porsiKecil.min, MBG_STANDARDS.porsiKecil.max);
  const seratKecil = calculateRange(MBG_STANDARDS.daily.serat, MBG_STANDARDS.porsiKecil.min, MBG_STANDARDS.porsiKecil.max);

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Kebutuhan Gizi Harian (MBG)</h3>
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

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Standar MBG (Makro Bahagia)</p>
          <p className="text-xs mt-1">
            <span className="text-green-700 font-medium">Porsi Besar:</span> {MBG_STANDARDS.porsiBesar.min}-{MBG_STANDARDS.porsiBesar.max}% dari kebutuhan harian •
            <span className="text-blue-700 font-medium ml-1">Porsi Kecil:</span> {MBG_STANDARDS.porsiKecil.min}-{MBG_STANDARDS.porsiKecil.max}% dari kebutuhan harian
          </p>
        </div>
      </div>

      {/* Daily Reference */}
      <div className="bg-bg rounded-lg p-3 mb-4">
        <p className="text-sm">
          <span className="text-text-muted">Kebutuhan Harian (AKG): </span>
          <span className="font-semibold">{MBG_STANDARDS.daily.energi} kkal</span>
        </p>
      </div>

      {/* Porsi Besar Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="font-semibold text-green-700">Porsi Besar ({MBG_STANDARDS.porsiBesar.min}-{MBG_STANDARDS.porsiBesar.max}%)</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
            <Flame className="w-4 h-4 text-orange-600 mx-auto mb-1" />
            <p className="nutrition-value text-sm text-green-700 font-semibold">
              {energiBesar.min}-{energiBesar.max}
            </p>
            <p className="text-[10px] text-text-muted">kkal</p>
          </div>
          <div className="text-center p-2 bg-primary/5 rounded-lg border border-primary/20">
            <Drumstick className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="nutrition-value text-sm text-primary font-semibold">
              {proteinBesar.min}-{proteinBesar.max}
            </p>
            <p className="text-[10px] text-text-muted">protein (g)</p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
            <Wheat className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <p className="nutrition-value text-sm text-amber-700 font-semibold">
              {karboBesar.min}-{karboBesar.max}
            </p>
            <p className="text-[10px] text-text-muted">karbo (g)</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg border border-red-100">
            <Apple className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <p className="nutrition-value text-sm text-red-700 font-semibold">
              {lemakBesar.min}-{lemakBesar.max}
            </p>
            <p className="text-[10px] text-text-muted">lemak (g)</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
            <Scale className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="nutrition-value text-sm text-green-700 font-semibold">
              {seratBesar.min}-{seratBesar.max}
            </p>
            <p className="text-[10px] text-text-muted">serat (g)</p>
          </div>
        </div>
      </div>

      {/* Porsi Kecil Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="font-semibold text-blue-700">Porsi Kecil ({MBG_STANDARDS.porsiKecil.min}-{MBG_STANDARDS.porsiKecil.max}%)</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Flame className="w-4 h-4 text-orange-600 mx-auto mb-1" />
            <p className="nutrition-value text-sm text-blue-700 font-semibold">
              {energiKecil.min}-{energiKecil.max}
            </p>
            <p className="text-[10px] text-text-muted">kkal</p>
          </div>
          <div className="text-center p-2 bg-primary/5 rounded-lg border border-primary/20">
            <Drumstick className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="nutrition-value text-sm text-primary font-semibold">
              {proteinKecil.min}-{proteinKecil.max}
            </p>
            <p className="text-[10px] text-text-muted">protein (g)</p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
            <Wheat className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <p className="nutrition-value text-sm text-amber-700 font-semibold">
              {karboKecil.min}-{karboKecil.max}
            </p>
            <p className="text-[10px] text-text-muted">karbo (g)</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg border border-red-100">
            <Apple className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <p className="nutrition-value text-sm text-red-700 font-semibold">
              {lemakKecil.min}-{lemakKecil.max}
            </p>
            <p className="text-[10px] text-text-muted">lemak (g)</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Scale className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="nutrition-value text-sm text-blue-700 font-semibold">
              {seratKecil.min}-{seratKecil.max}
            </p>
            <p className="text-[10px] text-text-muted">serat (g)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
