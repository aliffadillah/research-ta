"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Camera,
  TrendingUp,
  Flame,
  Loader2,
  RefreshCw,
  ArrowUpDown,
  Beef,
  Wheat,
  Apple,
  Scale,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { id } from "date-fns/locale";
import { formatDate } from "@/lib/utils/nutrition";
import { getNutritionStandards, getRecommendedPortion } from "@/lib/nutrition-standards";
import { cn } from "@/lib/utils/helpers";

interface DayData {
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealCount: number;
  hasData: boolean;
}

interface PredictionData {
  predicted_needs: {
    karbohidrat_besar: number;
    protein_besar: number;
    lemak_besar: number;
    serat_besar: number;
    energi_besar: number;
    karbohidrat_kecil: number;
    protein_kecil: number;
    lemak_kecil: number;
    serat_kecil: number;
    energi_kecil: number;
  };
  recommended_portion: "besar" | "kecil";
  confidence: number;
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthData, setMonthData] = useState<Record<string, DayData>>({});
  const [selectedDayData, setSelectedDayData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [standardsAvailable, setStandardsAvailable] = useState(false);

  const userId = session?.user?.id || session?.user?.email;

  useEffect(() => {
    fetchMonthData();
    fetchPrediction();
  }, [currentMonth]);

  useEffect(() => {
    fetchDayData();
  }, [selectedDate]);

  const fetchMonthData = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await fetch(
        `/api/history?start=${start.toISOString()}&end=${end.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        const dataMap: Record<string, DayData> = {};

        data.forEach((day: { date: string; totalCalories: number; totalProtein?: number; totalCarbs?: number; totalFat?: number; totalFiber?: number; mealCount: number }) => {
          const dateKey = day.date.split("T")[0];
          dataMap[dateKey] = {
            date: new Date(day.date),
            calories: day.totalCalories || 0,
            protein: day.totalProtein || 0,
            carbs: day.totalCarbs || 0,
            fat: day.totalFat || 0,
            fiber: day.totalFiber || 0,
            mealCount: day.mealCount || 0,
            hasData: true,
          };
        });

        setMonthData(dataMap);
      }
    } catch (error) {
      console.error("Failed to fetch month data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayData = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/detections?date=${dateStr}`);

      if (response.ok) {
        const data = await response.json();
        setSelectedDayData(data);
      }
    } catch (error) {
      console.error("Failed to fetch day data:", error);
    }
  };

  const fetchPrediction = async () => {
    setPredictionLoading(true);

    try {
      const response = await fetch("/api/predict");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPrediction(data.data);
          setStandardsAvailable(true);
        }
      } else {
        setStandardsAvailable(false);
      }
    } catch (error) {
      console.error("Failed to fetch prediction:", error);
      setStandardsAvailable(false);
    } finally {
      setPredictionLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const getDayData = (date: Date): DayData => {
    const dateKey = format(date, "yyyy-MM-dd");
    const data = monthData[dateKey];
    return data || {
      date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      mealCount: 0,
      hasData: false,
    };
  };

  const selectedDayInfo = getDayData(selectedDate);

  const getNeedsForPortion = (needs: PredictionData["predicted_needs"], portion: "besar" | "kecil") => ({
    energi: portion === "besar" ? needs.energi_besar : needs.energi_kecil,
    protein: portion === "besar" ? needs.protein_besar : needs.protein_kecil,
    karbohidrat: portion === "besar" ? needs.karbohidrat_besar : needs.karbohidrat_kecil,
    lemak: portion === "besar" ? needs.lemak_besar : needs.lemak_kecil,
    serat: portion === "besar" ? needs.serat_besar : needs.serat_kecil,
  });

  const predictedNeeds = prediction
    ? getNeedsForPortion(prediction.predicted_needs, prediction.recommended_portion)
    : null;
  const predictedEnergy = predictedNeeds && predictedNeeds.energi > 0 ? predictedNeeds.energi : null;
  const safePredictedEnergy = predictedEnergy || 1;

  // Calculate comparison between prediction and actual intake
  const getComparison = () => {
    if (!prediction) return null;

    const actual = selectedDayInfo.calories;
    const predicted = predictedEnergy;
    if (!predicted) return null;
    const diff = actual - predicted;
    const percentage = ((diff / predicted) * 100).toFixed(1);

    return {
      actual,
      predicted,
      diff,
      percentage: parseFloat(percentage),
      status: diff > 0 ? "over" : diff < 0 ? "under" : "exact",
    };
  };

  const comparison = getComparison();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans mb-2">Riwayat Nutrisi</h1>
        <p className="text-text-muted">
          Lacak asupan harian dan lihat tren nutrisi kamu
        </p>
      </div>

      {/* Nutrition Standards Summary */}
      {predictionLoading ? (
        <div className="card">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-text-muted">Memuat standar gizi...</span>
          </div>
        </div>
      ) : standardsAvailable && prediction ? (
        <div className="card bg-gradient-to-r from-primary/5 to-accent/10 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Standar Kebutuhan Harian</h3>
                <p className="text-xs text-text-muted">
                  Based on Indonesian Nutrition Standards (AKG)
                </p>
              </div>
            </div>
            <button
              onClick={fetchPrediction}
              className="p-2 hover:bg-bg rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Predicted Values */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Flame className="w-4 h-4 text-orange-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-orange-600">
                {Math.round(predictedNeeds?.energi || 0)}
              </p>
              <p className="text-xs text-text-muted">kkal</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Beef className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">
                {predictedNeeds ? predictedNeeds.protein.toFixed(1) : "0.0"}g
              </p>
              <p className="text-xs text-text-muted">Protein</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Wheat className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-600">
                {predictedNeeds ? predictedNeeds.karbohidrat.toFixed(1) : "0.0"}g
              </p>
              <p className="text-xs text-text-muted">Karbo</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Apple className="w-4 h-4 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-600">
                {predictedNeeds ? predictedNeeds.lemak.toFixed(1) : "0.0"}g
              </p>
              <p className="text-xs text-text-muted">Lemak</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Scale className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-600">
                {predictedNeeds ? predictedNeeds.serat.toFixed(1) : "0.0"}g
              </p>
              <p className="text-xs text-text-muted">Serat</p>
            </div>
          </div>

          {/* Recommended Portion */}
          <div className={cn(
            "p-3 rounded-xl flex items-center justify-between",
            prediction.recommended_portion === "besar"
              ? "bg-green-100 border border-green-200"
              : "bg-blue-100 border border-blue-200"
          )}>
            <div className="flex items-center gap-2">
              <TrendingUp className={cn(
                "w-5 h-5",
                prediction.recommended_portion === "besar" ? "text-green-600" : "text-blue-600"
              )} />
              <span className={cn(
                "font-semibold",
                prediction.recommended_portion === "besar" ? "text-green-700" : "text-blue-700"
              )}>
                {prediction.recommended_portion === "besar" ? "Porsi Besar Direkomendasikan" : "Porsi Kecil Direkomendasikan"}
              </span>
            </div>
            <span className={cn(
              "text-sm font-medium",
              prediction.recommended_portion === "besar" ? "text-green-700" : "text-blue-700"
            )}>
              {prediction.recommended_portion === "besar" ? ">1700 kkal" : "≤1700 kkal"}
            </span>
          </div>
        </div>
      ) : null}

      {/* Month Navigation */}
      <div className="card-static">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-bg rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: id })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-bg rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm text-text-muted py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayData = getDayData(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            // Calculate if day is over/under predicted need
            const dayDiff = predictedEnergy !== null
              ? dayData.calories - predictedEnergy
              : null;

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                disabled={!isCurrentMonth || loading}
                className={cn(
                  "relative aspect-square p-1 rounded-xl transition-all",
                  !isCurrentMonth ? "opacity-30" : "",
                  isSelected ? "bg-primary text-white" : "hover:bg-bg",
                  isToday && !isSelected ? "ring-2 ring-primary ring-inset" : ""
                )}
              >
                <span className="block text-sm font-medium">{format(day, "d")}</span>
                {dayData.hasData && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-white" :
                        dayDiff !== null && dayDiff > 0 ? "bg-red-400" :
                        dayDiff !== null && dayDiff < -100 ? "bg-blue-400" :
                        "bg-accent"
                      )}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span>Sesuai target</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span>Melebihi target</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Kurang dari target</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day Summary */}
        <div className="card-static">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{formatDate(selectedDate)}</h3>
              <p className="text-sm text-text-muted">
                {selectedDayInfo.mealCount} kali makan
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Calories Summary */}
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Total Kalori</span>
              <span className="nutrition-value text-xl">
                {selectedDayInfo.calories}
                <span className="text-sm text-text-muted ml-1">kkal</span>
              </span>
            </div>

            {/* Progress Bar */}
            {prediction && (
              <div className="space-y-2">
                <div className="progress-bar h-4">
                  <div
                    className={cn(
                      "progress-fill",
                      selectedDayInfo.calories > (predictedEnergy || 0)
                        ? "bg-red-500"
                        : "bg-primary"
                    )}
                    style={{
                      width: `${Math.min((selectedDayInfo.calories / safePredictedEnergy) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">0</span>
                  <span className="text-primary font-medium">
                    Target: {Math.round(predictedEnergy || 0)} kkal
                  </span>
                  <span className="text-text-muted">
                    {Math.round((predictedEnergy || 0) * 1.5)} kkal
                  </span>
                </div>
              </div>
            )}

            {/* Comparison with Prediction */}
            {comparison && (
              <div className={cn(
                "p-3 rounded-xl text-sm",
                comparison.status === "over" ? "bg-red-50 border border-red-200" :
                comparison.status === "under" ? "bg-blue-50 border border-blue-200" :
                "bg-green-50 border border-green-200"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  {comparison.status === "over" ? (
                    <ArrowUpDown className="w-4 h-4 text-red-600 rotate-180" />
                  ) : comparison.status === "under" ? (
                    <ArrowUpDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  )}
                  <span className={cn(
                    "font-medium",
                    comparison.status === "over" ? "text-red-700" :
                    comparison.status === "under" ? "text-blue-700" :
                    "text-green-700"
                  )}>
                    {comparison.status === "over" ? "Melebihi target" :
                     comparison.status === "under" ? "Kurang dari target" :
                     "Sesuai target"}
                  </span>
                </div>
                <p className="text-text-muted">
                  {comparison.diff > 0 ? "+" : ""}{comparison.diff.toFixed(0)} kkal ({comparison.percentage > 0 ? "+" : ""}{comparison.percentage}%)
                </p>
              </div>
            )}

            {/* Nutrition Details */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-text-muted">Protein</p>
                <p className="nutrition-value">{selectedDayInfo.protein.toFixed(1)}g</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Karbo</p>
                <p className="nutrition-value text-amber-600">{selectedDayInfo.carbs.toFixed(1)}g</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Lemak</p>
                <p className="nutrition-value text-red-600">{selectedDayInfo.fat.toFixed(1)}g</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Serat</p>
                <p className="nutrition-value text-green-600">{selectedDayInfo.fiber.toFixed(1)}g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portion Comparison */}
        <div className="card-static">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Beef className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Perbandingan Porsi</h3>
              <p className="text-sm text-text-muted">Besar vs Kecil</p>
            </div>
          </div>

          {prediction ? (
            <div className="space-y-4">
              {/* Recommendation Badge */}
              <div className={cn(
                "p-3 rounded-xl text-center",
                prediction.recommended_portion === "besar"
                  ? "bg-green-100 border-2 border-green-300"
                  : "bg-blue-100 border-2 border-blue-300"
              )}>
                <p className="text-sm text-text-muted mb-1">Disarankan untuk hari ini</p>
                <p className={cn(
                  "text-lg font-bold",
                  prediction.recommended_portion === "besar" ? "text-green-700" : "text-blue-700"
                )}>
                  {prediction.recommended_portion === "besar" ? "Porsi Besar" : "Porsi Kecil"}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Based on {(predictedEnergy || 0).toFixed(0)} kkal kebutuhan
                </p>
              </div>

              {/* Calories Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 font-medium mb-1">Porsi Besar</p>
                  <p className="text-xl font-bold text-green-700">
                    ~700 kkal
                  </p>
                  <p className="text-xs text-text-muted mt-1">per menu</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Porsi Kecil</p>
                  <p className="text-xl font-bold text-blue-700">
                    ~450 kkal
                  </p>
                  <p className="text-xs text-text-muted mt-1">per menu</p>
                </div>
              </div>

              {/* Recommendation for Today */}
              <div className="p-3 bg-bg rounded-xl">
                <p className="text-xs text-text-muted mb-2">Rekomendasi jumlah menu:</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    prediction.recommended_portion === "besar"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  )}>
                    {prediction.recommended_portion === "besar" ? "~2 menu" : "~3-4 menu"}
                  </span>
                  <span className="text-xs text-text-muted">
                    untuk capai {(predictedEnergy || 0).toFixed(0)} kkal
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-text-muted">
              <p>Standar gizi tidak tersedia</p>
              <p className="text-xs mt-1">Muat halaman untuk melihat rekomendasi porsi</p>
            </div>
          )}
        </div>

        {/* Detections List */}
        <div className="lg:col-span-1 card-static">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Detail Makanan</h3>
            <Camera className="w-5 h-5 text-text-muted" />
          </div>

          {selectedDayData.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-text-muted">Tidak ada data untuk hari ini</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDayData.map((detection: unknown) => (
                <div
                  key={(detection as { id: string }).id}
                  className="flex items-center gap-4 p-3 bg-bg rounded-xl"
                >
                  {(detection as { imageUrl: string }).imageUrl && (
                    <img
                      src={(detection as { imageUrl: string }).imageUrl}
                      alt="Food"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {(detection as { predictedClass?: string }).predictedClass || "Makanan"}
                    </p>
                    <p className="text-sm text-text-muted">
                      {(detection as { portionSize: number }).portionSize}g •{" "}
                      {((detection as { confidence: number }).confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                  <div className="text-right">
                    <Flame className="w-4 h-4 text-accent mx-auto mb-1" />
                    <span className="nutrition-value text-sm">
                      {(detection as { mlPrediction?: { nutrition?: { calories: number } } }).mlPrediction?.nutrition?.calories || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}