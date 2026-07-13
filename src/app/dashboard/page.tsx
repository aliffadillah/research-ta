"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, ChevronRight, Flame, Drumstick, Wheat, Apple, Users, Utensils, ClipboardList, BookOpen, Brain, ChefHat, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/nutrition";
import PredictionCard from "@/components/ui/PredictionCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyNutrition {
  id: string;
  date: string;
  carbsBesar: number;
  proteinBesar: number;
  fatBesar: number;
  fiberBesar: number;
  energyBesar: number;
  carbsKecil: number;
  proteinKecil: number;
  fatKecil: number;
  fiberKecil: number;
  energyKecil: number;
}

interface LstmNutritionData {
  date: string;
  isToday: boolean;
  source: string;
  besar: {
    energi: number;
    protein: number;
    karbohidrat: number;
    lemak: number;
    serat: number;
  };
  kecil: {
    energi: number;
    protein: number;
    karbohidrat: number;
    lemak: number;
    serat: number;
  };
}

interface AllData {
  summary: {
    totalUsers: number;
    totalFoods: number;
    totalDetections: number;
    totalDailyLogs: number;
    totalMenuRecommendations: number;
    totalNutritionStandards: number;
  };
  users: { data: unknown[] };
  foods: { data: unknown[] };
  detections: { data: unknown[] };
  dailyLogs: { data: unknown[] };
  menuRecommendations: { data: unknown[] };
  nutritionStandards: { data: unknown[] };
}

interface Detection {
  id: string;
  imageUrl: string;
  confidence: number;
  predictedClass: string | null;
  detectedAt: string;
  user: { id: string; name: string | null; email: string };
}

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string | null;
}

export default function DashboardPage() {
  const [allData, setAllData] = useState<AllData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lstmNutrition, setLstmNutrition] = useState<LstmNutritionData | null>(null);
  const [nutritionHistory, setNutritionHistory] = useState<DailyNutrition[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/all");
        if (res.ok) {
          const data = await res.json();
          console.log("[Dashboard] API Response:", data);
          setAllData(data);
        } else {
          console.error("[Dashboard] API Error:", res.status);
        }
      } catch (error) {
        console.error("[Dashboard] Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

  // Fetch LSTM nutrition data
  async function fetchLstmNutritionData() {
    try {
      const res = await fetch("/api/lstm-daily-nutrition");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setLstmNutrition(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch LSTM nutrition data");
    }
  }

  // Fetch nutrition history for charts
  async function fetchNutritionHistory() {
    try {
      const res = await fetch("/api/daily-nutritions");
      if (res.ok) {
        const data: DailyNutrition[] = await res.json();
        setNutritionHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch nutrition data");
    }
  }

    fetchData();
    fetchLstmNutritionData();
    fetchNutritionHistory();
  }, []);

  // Prepare chart data - last 7 days
  const chartData = nutritionHistory.slice(-14).map((n) => {
    const date = new Date(n.date);
    return {
      date: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      energiBG: n.energyBesar,
      energiKCL: n.energyKecil,
      karboBG: n.carbsBesar,
      proteinBG: n.proteinBesar,
      lemakBG: n.fatBesar,
    };
  });

  // Helper to get formatted date
  const getFormattedDate = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const wibHours = utcHours + 7;
    let wibDate = new Date(now);
    if (wibHours >= 24) {
      wibDate.setUTCDate(wibDate.getUTCDate() + 1);
    }
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${days[wibDate.getUTCDay()]}, ${wibDate.getUTCDate()} ${months[wibDate.getUTCMonth()]} ${wibDate.getUTCFullYear()}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-border rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-border rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const summary = allData?.summary;
  const detections = allData?.detections?.data || [];
  const users = allData?.users?.data || [];
  const foods = allData?.foods?.data || [];
  const dailyLogs = allData?.dailyLogs?.data || [];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-sans mb-2">Dashboard</h1>
        <p className="text-text-muted text-sm md:text-base">{formatDate(new Date())}</p>
      </div>

      {/* Quick Action */}
      <Link
        href="/dashboard/detect"
        className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            <Camera className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Deteksi Makanan</h2>
            <p className="text-text-muted text-sm">Pindai atau upload foto makanan</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-text-muted group-hover:translate-x-2 group-hover:text-primary transition-all flex-shrink-0" />
      </Link>

      {/* Quick Action - Rekomendasi Makanan */}
      <Link
        href="/dashboard/rekomendasi-nutrisi"
        className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-accent"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Rekomendasi Makanan</h2>
            <p className="text-text-muted text-sm">Lihat saran makanan sesuai kebutuhan gizi</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-text-muted group-hover:translate-x-2 group-hover:text-accent transition-all flex-shrink-0" />
      </Link>

      {/* Today's Nutrition Data */}
      <div className="card-static">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Target Nutrisi Harian
            {!lstmNutrition?.isToday && lstmNutrition && (
              <span className="text-xs font-normal px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                {new Date(lstmNutrition.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </h3>
          <Link href="/dashboard/nutrisi-harian" className="text-primary text-sm font-medium hover:underline">
            Lihat Detail
          </Link>
        </div>

        {lstmNutrition ? (
          <div className="space-y-4">
            {!lstmNutrition.isToday && (
              <div className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                <strong>Catatan:</strong> Menggunakan data prediksi LSTM dari{" "}
                <strong>{new Date(lstmNutrition.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong>
                {" "}karena belum ada data untuk hari ini.
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {/* Porsi Besar */}
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  Porsi Besar
                </div>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-xs text-green-600 mb-1">Karbohidrat</div>
                    <div className="text-lg md:text-xl font-bold text-green-800">{lstmNutrition.besar.karbohidrat.toFixed(1)}<span className="text-sm font-normal ml-1">g</span></div>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-600 mb-1">Protein</div>
                    <div className="text-lg md:text-xl font-bold text-blue-800">{lstmNutrition.besar.protein.toFixed(1)}<span className="text-sm font-normal ml-1">g</span></div>
                  </div>
                  <div className="p-2 md:p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="text-xs text-orange-600 mb-1">Lemak</div>
                    <div className="text-lg md:text-xl font-bold text-orange-800">{lstmNutrition.besar.lemak.toFixed(1)}<span className="text-sm font-normal ml-1">g</span></div>
                  </div>
                  <div className="p-2 md:p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <div className="text-xs text-rose-600 mb-1">Energi</div>
                    <div className="text-lg md:text-xl font-bold text-rose-800">{lstmNutrition.besar.energi.toFixed(0)}<span className="text-sm font-normal ml-1">kkal</span></div>
                  </div>
                  <div className="p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-100 col-span-2">
                    <div className="text-xs text-purple-600 mb-1">Serat</div>
                    <div className="text-lg md:text-xl font-bold text-purple-800">{lstmNutrition.besar.serat.toFixed(1)}<span className="text-sm font-normal ml-1">g</span></div>
                  </div>
                </div>
              </div>

              {/* Porsi Kecil */}
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  Porsi Kecil
                </div>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-xs text-green-600 mb-1">Karbohidrat</div>
                    <div className="text-lg md:text-xl font-bold text-green-800">{lstmNutrition.kecil.karbohidrat.toFixed(1)}<span className="text-sm font-normal ml-1">g</span></div>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-600 mb-1">Protein</div>
                    <div className="text-lg md:text-xl font-bold text-blue-800">{lstmNutrition.kecil.protein.toFixed(1)}<span className="text-sm font-normal ml-1">g</span></div>
                  </div>
                  <div className="p-2 md:p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="text-xs text-orange-600 mb-1">Lemak</div>
                    <div className="text-lg md:text-xl font-bold text-orange-800">{lstmNutrition.kecil.lemak.toFixed(1)}<span className="text-sm font-normal ml-1">g</span></div>
                  </div>
                  <div className="p-2 md:p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <div className="text-xs text-rose-600 mb-1">Energi</div>
                    <div className="text-lg md:text-xl font-bold text-rose-800">{lstmNutrition.kecil.energi.toFixed(0)}<span className="text-sm font-normal ml-1">kkal</span></div>
                  </div>
                  <div className="p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-100 col-span-2">
                    <div className="text-xs text-purple-600 mb-1">Serat</div>
                    <div className="text-lg md:text-xl font-bold text-purple-800">{lstmNutrition.kecil.serat.toFixed(1)}<span className="text-sm font-normal ml-1">g</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-amber-50 rounded-lg border border-amber-200">
            <Brain className="w-12 h-12 text-amber-300 mx-auto mb-3" />
            <p className="text-amber-700 font-medium">Belum ada data nutrisi harian</p>
            <p className="text-text-muted text-sm mt-1 mb-4">
              Silakan prediksi kebutuhan nutrisi harian terlebih dahulu
            </p>
            <Link href="/dashboard/nutrisi-harian" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
              <Plus className="w-4 h-4" />
              Prediksi / Tambah Data
            </Link>
          </div>
        )}
      </div>

      {/* Nutrition Standards Summary */}
      <PredictionCard />

      {/* Nutrition Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Line Chart - Energi Trend */}
          <div className="card-static">
            <h3 className="text-lg font-semibold mb-4">Tren Energi 14 Hari Terakhir</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(value: number) => [`${value.toFixed(0)} kkal`]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="energiBG" stroke="#22c55e" strokeWidth={2} name="Energi BG" dot={{ fill: "#22c55e", r: 3 }} />
                <Line type="monotone" dataKey="energiKCL" stroke="#3b82f6" strokeWidth={2} name="Energi KCL" dot={{ fill: "#3b82f6", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Makro Nutrients */}
          <div className="card-static">
            <h3 className="text-lg font-semibold mb-4">Makro Nutrients Porsi Besar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(value: number) => [`${value.toFixed(1)} g`]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="karboBG" fill="#22c55e" name="Karbo" radius={[2, 2, 0, 0]} />
                <Bar dataKey="proteinBG" fill="#3b82f6" name="Protein" radius={[2, 2, 0, 0]} />
                <Bar dataKey="lemakBG" fill="#f59e0b" name="Lemak" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Database Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <span className="text-text-muted text-xs md:text-sm hidden sm:block">Users</span>
          </div>
          <p className="text-xl md:text-2xl font-semibold">{summary?.totalUsers || 0}</p>
        </div>

        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Utensils className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <span className="text-text-muted text-xs md:text-sm hidden sm:block">Foods</span>
          </div>
          <p className="text-xl md:text-2xl font-semibold">{summary?.totalFoods || 0}</p>
        </div>

        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Camera className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <span className="text-text-muted text-xs md:text-sm hidden sm:block">Detections</span>
          </div>
          <p className="text-xl md:text-2xl font-semibold">{summary?.totalDetections || 0}</p>
        </div>

        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            </div>
            <span className="text-text-muted text-xs md:text-sm hidden sm:block">Daily Logs</span>
          </div>
          <p className="text-xl md:text-2xl font-semibold">{summary?.totalDailyLogs || 0}</p>
        </div>

        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-rose-600" />
            </div>
            <span className="text-text-muted text-xs md:text-sm hidden sm:block">Menus</span>
          </div>
          <p className="text-xl md:text-2xl font-semibold">{summary?.totalMenuRecommendations || 0}</p>
        </div>

        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-teal-600" />
            </div>
            <span className="text-text-muted text-xs md:text-sm hidden sm:block">Standards</span>
          </div>
          <p className="text-xl md:text-2xl font-semibold">{summary?.totalNutritionStandards || 0}</p>
        </div>
      </div>

      {/* Recent Activity & Data Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Detections */}
        <div className="card-static">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold">Detections Terbaru</h3>
            <Link href="/dashboard/history" className="text-primary text-sm font-medium hover:underline">
              Lihat semua ({summary?.totalDetections || 0})
            </Link>
          </div>

          {detections.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <Camera className="w-10 h-10 md:w-12 md:h-12 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-text-muted">Belum ada deteksi</p>
              <Link href="/dashboard/detect" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                Mulai deteksi sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {(detections as Detection[]).slice(0, 5).map((detection) => (
                <div
                  key={detection.id}
                  className="flex items-center justify-between p-2 md:p-3 bg-bg rounded-xl"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {detection.imageUrl ? (
                        <img src={detection.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {detection.predictedClass || "Unknown Food"}
                      </p>
                      <p className="text-xs text-text-muted hidden sm:block">
                        {detection.user?.name || detection.user?.email || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="nutrition-value text-sm">
                      {detection.confidence ? `${(detection.confidence * 100).toFixed(0)}%` : "-"}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(detection.detectedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="card-static">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold">Users</h3>
            <span className="text-primary text-sm font-medium">
              Total: {summary?.totalUsers || 0}
            </span>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <Users className="w-10 h-10 md:w-12 md:h-12 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-text-muted">Belum ada user</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {(users as User[]).slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 md:p-3 bg-bg rounded-xl"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.name || "No Name"}
                      </p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted flex-shrink-0 ml-2">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Foods Preview */}
      <div className="card-static">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Database Foods</h3>
          <span className="text-primary text-sm font-medium">
            Total: {summary?.totalFoods || 0} items
          </span>
        </div>

        {foods.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-muted">Belum ada data makanan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {(foods as Food[]).slice(0, 8).map((food) => (
              <div key={food.id} className="p-4 bg-bg rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{food.name}</p>
                    <p className="text-xs text-text-muted">{food.category || "Uncategorized"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span>{food.calories} kcal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Drumstick className="w-3 h-3 text-primary" />
                    <span>{food.protein}g</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wheat className="w-3 h-3 text-amber-600" />
                    <span>{food.carbs}g</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Apple className="w-3 h-3 text-red-500" />
                    <span>{food.fat}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Logs Preview */}
      <div className="card-static">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Daily Logs</h3>
          <span className="text-primary text-sm font-medium">
            Total: {summary?.totalDailyLogs || 0} records
          </span>
        </div>

        {dailyLogs.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-muted">Belum ada log harian</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Detections</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Created</th>
                </tr>
              </thead>
              <tbody>
                {(dailyLogs as { id: string; date: string; user: { name: string | null; email: string }; detections: unknown[]; createdAt: string }[]).slice(0, 10).map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-bg">
                    <td className="py-3 px-4 text-sm">
                      {new Date(log.date).toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.user?.name || log.user?.email || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {log.detections?.length || 0} detections
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-muted">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}