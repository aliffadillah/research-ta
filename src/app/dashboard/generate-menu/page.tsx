"use client";

import { useState } from "react";
import {
  Calendar,
  Loader2,
  AlertCircle,
  Utensils,
  Sparkles,
  Save,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import MenuCombinationCard from "@/components/ui/MenuCombinationCard";
import NutritionSummaryBox from "@/components/ui/NutritionSummaryBox";

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

interface MenuCombination {
  components: MenuComponent[];
  totalNutrition: NutritionValues;
  score: number;
}

interface GenerateMenuResponse {
  success: boolean;
  date: string;
  dailyNeeds: {
    besar: NutritionValues;
    kecil: NutritionValues;
  };
  recommendations: {
    besar: MenuCombination[];
    kecil: MenuCombination[];
  };
}

// Week mode types
interface DayMenu {
  date: string;
  dateFormatted: string;
  hasData: boolean;
  error?: string;
  dailyNeeds?: {
    besar: NutritionValues;
  };
  recommendations?: {
    besar: MenuCombination[];
  };
}

interface GenerateWeekResponse {
  success: boolean;
  startDate: string;
  days: number;
  hasMissingData: boolean;
  missingDates?: string[];
  weekMenus: DayMenu[];
}

type GenerateMode = "1-hari" | "7-hari";

export default function GenerateMenuPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split("T")[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<GenerateMode>("1-hari");
  const [data, setData] = useState<GenerateMenuResponse | null>(null);
  const [weekData, setWeekData] = useState<GenerateWeekResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Week mode state
  const [selectedComboIndices, setSelectedComboIndices] = useState<Record<number, number>>({});
  const [savingAll, setSavingAll] = useState<boolean>(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [selectedCombo, setSelectedCombo] = useState<MenuCombination | null>(null);
  const [menuName, setMenuName] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSelectedComboIndices({});

    try {
      if (mode === "7-hari") {
        const res = await fetch(`/api/generate-menu-week?startDate=${selectedDate}&days=7`);
        const result = await res.json();

        if (res.ok && result.success) {
          setWeekData(result);
          // Set first combo as default for each day
          const defaults: Record<number, number> = {};
          result.weekMenus.forEach((day: DayMenu, idx: number) => {
            if (day.hasData) {
              defaults[idx] = 0;
            }
          });
          setSelectedComboIndices(defaults);
        } else {
          setError(result.error || "Gagal memuat rekomendasi menu");
        }
      } else {
        const res = await fetch(`/api/generate-menu?date=${selectedDate}`);
        const result = await res.json();

        console.log("API Response:", res.status, result);

        if (res.ok && result.success) {
          setData(result);
        } else {
          setError(result.error || `Gagal memuat rekomendasi menu (${res.status})`);
        }
      }
    } catch (err) {
      console.error("Generate menu error:", err);
      setError("Gagal memuat rekomendasi menu. Cek console untuk detail.");
    } finally {
      setLoading(false);
    }
  };

  // Open save modal for a specific combo
  const handleOpenSaveModal = (combo: MenuCombination) => {
    setSelectedCombo(combo);
    setMenuName("");
    setSaveSuccess(null);
    setShowSaveModal(true);
  };

  // Calculate small portion nutrition (50% of besar)
  const calculateSmallPortion = (besarValue: number, ratio: number = 0.5) => {
    return besarValue * ratio;
  };

  // Save the selected menu
  const handleSaveMenu = async () => {
    if (!selectedCombo || !menuName.trim()) return;

    setSaving(true);
    setSaveSuccess(null);

    try {
      // Extract food names from the selected combo
      const daftarMenu = selectedCombo.components.map((c) => c.food.name);

      // Calculate nutrition for small portion (50% of besar)
      const ratio = 0.5;

      const payload = {
        name: menuName.trim(),
        description: `Menu rekomendasi untuk tanggal ${selectedDate}`,
        tanggal: selectedDate,
        daftarMenu,
        caloriesBesar: Math.round(selectedCombo.totalNutrition.energi),
        proteinBesar: Number(selectedCombo.totalNutrition.protein.toFixed(1)),
        carbsBesar: Number(selectedCombo.totalNutrition.karbohidrat.toFixed(1)),
        fatBesar: Number(selectedCombo.totalNutrition.lemak.toFixed(1)),
        fiberBesar: Number(selectedCombo.totalNutrition.serat.toFixed(1)),
        caloriesKecil: Math.round(selectedCombo.totalNutrition.energi * ratio),
        proteinKecil: Number((selectedCombo.totalNutrition.protein * ratio).toFixed(1)),
        carbsKecil: Number((selectedCombo.totalNutrition.karbohidrat * ratio).toFixed(1)),
        fatKecil: Number((selectedCombo.totalNutrition.lemak * ratio).toFixed(1)),
        fiberKecil: Number((selectedCombo.totalNutrition.serat * ratio).toFixed(1)),
      };

      const res = await fetch("/api/menu-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess("Menu berhasil disimpan!");
        setTimeout(() => {
          setShowSaveModal(false);
          setSelectedCombo(null);
          setMenuName("");
          setSaveSuccess(null);
        }, 1500);
      } else {
        const result = await res.json();
        setError(result.error || "Gagal menyimpan menu");
      }
    } catch (err) {
      console.error("Save menu error:", err);
      setError("Gagal menyimpan menu");
    } finally {
      setSaving(false);
    }
  };

  // Open save modal for 7-day mode
  const handleOpenSaveModal7Hari = (day: DayMenu, comboIndex: number) => {
    if (!day.hasData || !day.recommendations?.besar[comboIndex]) return;

    const combo = day.recommendations!.besar[comboIndex];
    setSelectedCombo(combo);
    setMenuName(`Menu ${day.dateFormatted.split(',')[0]}`);
    setSaveSuccess(null);
    setShowSaveModal(true);
  };

  // Save all selected menus (7-day mode)
  const handleSaveAll = async () => {
    if (!weekData) return;

    setSavingAll(true);
    setSavedCount(0);
    setError(null);

    let saved = 0;
    const daysToSave = weekData.weekMenus.filter((day) => day.hasData && selectedComboIndices[weekData.weekMenus.indexOf(day)] !== undefined);

    for (const day of daysToSave) {
      const dayIndex = weekData.weekMenus.indexOf(day);
      const comboIndex = selectedComboIndices[dayIndex];

      if (day.recommendations?.besar[comboIndex]) {
        const combo = day.recommendations.besar[comboIndex];
        const daftarMenu = combo.components.map((c) => c.food.name);
        const ratio = day.dailyNeeds?.besar ? 0.5 : 0.5;

        const payload = {
          name: `Menu ${day.dateFormatted.split(',')[0]} - Rekomendasi ${comboIndex + 1}`,
          description: `Menu rekomendasi untuk ${day.dateFormatted}`,
          tanggal: day.date,
          daftarMenu,
          caloriesBesar: Math.round(combo.totalNutrition.energi),
          proteinBesar: Number(combo.totalNutrition.protein.toFixed(1)),
          carbsBesar: Number(combo.totalNutrition.karbohidrat.toFixed(1)),
          fatBesar: Number(combo.totalNutrition.lemak.toFixed(1)),
          fiberBesar: Number(combo.totalNutrition.serat.toFixed(1)),
          caloriesKecil: Math.round(combo.totalNutrition.energi * ratio),
          proteinKecil: Number((combo.totalNutrition.protein * ratio).toFixed(1)),
          carbsKecil: Number((combo.totalNutrition.karbohidrat * ratio).toFixed(1)),
          fatKecil: Number((combo.totalNutrition.lemak * ratio).toFixed(1)),
          fiberKecil: Number((combo.totalNutrition.serat * ratio).toFixed(1)),
        };

        try {
          const res = await fetch("/api/menu-recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            saved++;
            setSavedCount(saved);
          }
        } catch (err) {
          console.error(`Error saving menu for ${day.date}:`, err);
        }
      }
    }

    setSavingAll(false);
    if (saved > 0) {
      setTimeout(() => setSavedCount(0), 3000);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-sans">Generate Menu Rekomendasi</h1>
            <p className="text-text-muted text-sm">
              Hasilkan kombinasi menu makanan yang sesuai kebutuhan gizi harian
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-bg rounded-xl self-start lg:self-auto">
          <button
            onClick={() => {
              setMode("1-hari");
              setData(null);
              setWeekData(null);
              setError(null);
            }}
            className={cn(
              "px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              mode === "1-hari"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">1 Hari</span>
          </button>
          <button
            onClick={() => {
              setMode("7-hari");
              setData(null);
              setWeekData(null);
              setError(null);
            }}
            className={cn(
              "px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              mode === "7-hari"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">7 Hari</span>
          </button>
        </div>
      </div>

      {/* Date Picker Section */}
      <div className="card">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Week Navigation (only for 7-day mode) */}
          {mode === "7-hari" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() - 7);
                  setSelectedDate(date.toISOString().split("T")[0]);
                }}
                className="p-2 hover:bg-bg rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedDate(today.toISOString().split("T")[0])}
                className="px-3 py-1.5 text-sm hover:bg-bg rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Minggu Ini
              </button>
              <button
                onClick={() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() + 7);
                  setSelectedDate(date.toISOString().split("T")[0]);
                }}
                className="p-2 hover:bg-bg rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Date Display */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <label className="text-sm font-medium text-text-muted">
              {mode === "7-hari" ? "Mulai:" : "Tanggal Target:"}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={cn(
              "px-6 py-2 bg-primary text-white rounded-lg font-medium transition-all",
              "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Menu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Error</p>
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Save All Message */}
      {savedCount > 0 && (
        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-800">
              {savedCount} menu berhasil disimpan!
            </p>
          </div>
        </div>
      )}

      {/* Missing Data Warning (7-day mode) */}
      {weekData?.hasMissingData && (
        <div className="card bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Data Tidak Lengkap</p>
              <p className="text-sm text-amber-700 mb-2">
                Beberapa tanggal tidak memiliki data nutrisi harian:
              </p>
              <ul className="text-sm text-amber-700 list-disc list-inside">
                {weekData.missingDates?.map((date, idx) => (
                  <li key={idx}>{date}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Results Section - 1 Hari */}
      {data && mode === "1-hari" && (
        <div className="space-y-6">
          {/* Porsi Besar Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold">Porsi Besar</h2>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Target: {Math.round(data.dailyNeeds.besar.energi)} kkal
              </span>
            </div>

            <NutritionSummaryBox target={data.dailyNeeds.besar} portionType="besar" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recommendations.besar.map((combo, idx) => (
                <div key={idx} className="flex flex-col">
                  <MenuCombinationCard
                    combination={combo.components}
                    index={idx}
                    isBest={idx === 0}
                    totalNutrition={combo.totalNutrition}
                    matchScore={combo.score}
                  />
                  <button
                    onClick={() => handleOpenSaveModal(combo)}
                    className={cn(
                      "mt-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      "bg-green-600 text-white hover:bg-green-700",
                      "flex items-center justify-center gap-2 shadow-md"
                    )}
                  >
                    <Save className="w-4 h-4" />
                    Simpan Menu
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Section - 7 Hari */}
      {weekData && mode === "7-hari" && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Menu Minggu {weekData.startDate}
              </h2>
              <p className="text-sm text-text-muted">
                {weekData.weekMenus.filter((d) => d.hasData).length} dari {weekData.days} hari memiliki data
              </p>
            </div>
            {weekData.weekMenus.some((d) => d.hasData) && (
              <button
                onClick={handleSaveAll}
                disabled={savingAll}
                className={cn(
                  "btn-primary flex items-center gap-2",
                  savingAll && "opacity-50 cursor-not-allowed"
                )}
              >
                {savingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan... ({savedCount}/{weekData.weekMenus.filter((d) => d.hasData).length})</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Semua</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {weekData.weekMenus.map((day, dayIndex) => (
              <WeekDayCard
                key={day.date}
                day={day}
                dayIndex={dayIndex}
                selectedComboIndex={selectedComboIndices[dayIndex]}
                onSelectCombo={(idx) =>
                  setSelectedComboIndices((prev) => ({ ...prev, [dayIndex]: idx }))
                }
                onSave={() => {
                  const combo = day.recommendations?.besar[selectedComboIndices[dayIndex] || 0];
                  if (combo) handleOpenSaveModal7Hari(day, selectedComboIndices[dayIndex] || 0);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !weekData && !error && !loading && (
        <div className="text-center py-12">
          <Utensils className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-muted">Pilih tanggal dan klik Generate Menu</p>
          <p className="text-sm text-text-muted mt-1">
            untuk melihat kombinasi menu rekomendasi
          </p>
        </div>
      )}

      {/* Save Menu Modal */}
      {showSaveModal && selectedCombo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Save className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Simpan Menu Rekomendasi</h2>
                  <p className="text-sm text-text-muted">Menu akan disimpan ke daftar Menu Harian</p>
                </div>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-bg rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-text-muted" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Menu Name Input */}
              <div>
                <label className="label text-base">Nama Menu</label>
                <input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Contoh: Menu MBG Senin"
                  className="input-field text-base py-3"
                  autoFocus
                />
              </div>

              {/* Date Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-text-muted" />
                <span className="text-sm text-text-muted">Tanggal:</span>
                <span className="font-semibold text-lg">{selectedDate}</span>
              </div>

              {/* Food List Preview */}
              <div>
                <label className="label text-base font-semibold mb-3 block">Daftar Menu</label>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-5 gap-3">
                    {selectedCombo.components.map((component, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 text-center shadow-sm">
                        <span className="text-xs text-text-muted block mb-1">{component.categoryLabel}</span>
                        <p className="font-semibold text-sm mb-1 line-clamp-2">{component.food.name}</p>
                        <span className="text-xs text-text-muted">
                          {component.food.portionSize}{component.food.portionUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutrition Preview */}
              <div className="grid grid-cols-2 gap-4">
                {/* Porsi Besar */}
                <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-700 mb-4 text-base">Porsi Besar</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Energi:</span>
                      <span className="font-bold text-green-700">{Math.round(selectedCombo.totalNutrition.energi)} kkal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Protein:</span>
                      <span className="font-medium">{selectedCombo.totalNutrition.protein.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Karbo:</span>
                      <span className="font-medium">{selectedCombo.totalNutrition.karbohidrat.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Lemak:</span>
                      <span className="font-medium">{selectedCombo.totalNutrition.lemak.toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Serat:</span>
                      <span className="font-medium">{selectedCombo.totalNutrition.serat.toFixed(1)}g</span>
                    </div>
                  </div>
                </div>

                {/* Porsi Kecil */}
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-700 mb-4 text-base">Porsi Kecil (50%)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Energi:</span>
                      <span className="font-bold text-blue-700">{Math.round(selectedCombo.totalNutrition.energi * 0.5)} kkal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Protein:</span>
                      <span className="font-medium">{(selectedCombo.totalNutrition.protein * 0.5).toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Karbo:</span>
                      <span className="font-medium">{(selectedCombo.totalNutrition.karbohidrat * 0.5).toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Lemak:</span>
                      <span className="font-medium">{(selectedCombo.totalNutrition.lemak * 0.5).toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Serat:</span>
                      <span className="font-medium">{(selectedCombo.totalNutrition.serat * 0.5).toFixed(1)}g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {saveSuccess && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700 border border-green-200">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">{saveSuccess}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white p-6 border-t border-border flex justify-end gap-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="btn-secondary px-6 py-3"
                disabled={saving}
              >
                Batal
              </button>
              <button
                onClick={handleSaveMenu}
                disabled={saving || !menuName.trim()}
                className={cn(
                  "px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2",
                  "bg-green-600 text-white hover:bg-green-700",
                  saving && "opacity-50 cursor-not-allowed",
                  !menuName.trim() && "opacity-50 cursor-not-allowed"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Simpan Menu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Week Day Card Component
interface WeekDayCardProps {
  day: DayMenu;
  dayIndex: number;
  selectedComboIndex?: number;
  onSelectCombo: (idx: number) => void;
  onSave: () => void;
}

function WeekDayCard({ day, dayIndex, selectedComboIndex, onSelectCombo, onSave }: WeekDayCardProps) {
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
  };

  const getDateNumber = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const getMonthShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return months[date.getMonth()];
  };

  if (!day.hasData) {
    return (
      <div className="card bg-gray-50 border-dashed border-2 border-gray-300 opacity-75">
        <div className="flex items-start gap-4">
          {/* Date Badge */}
          <div className="w-14 h-14 bg-gray-200 rounded-xl flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 font-medium">
              {getDayName(day.date).substring(0, 3)}
            </span>
            <span className="text-xl font-bold text-gray-500">
              {getDateNumber(day.date)}
            </span>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-400">{getDayName(day.date)}</h3>
            <p className="text-xs text-gray-400">
              {getDateNumber(day.date)} {getMonthShort(day.date)}
            </p>
            <div className="mt-2 p-2 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-600">⚠️ {day.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const combos = day.recommendations?.besar || [];
  const currentCombo = combos[selectedComboIndex || 0];

  return (
    <div className="card">
      {/* Date Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Date Badge */}
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex flex-col items-center justify-center",
            dayIndex === 0 ? "bg-primary text-white" : "bg-green-100 text-green-700"
          )}
        >
          <span className="text-xs font-medium opacity-80">
            {getDayName(day.date).substring(0, 3)}
          </span>
          <span className="text-xl font-bold">{getDateNumber(day.date)}</span>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">{getDayName(day.date)}</h3>
          <p className="text-xs text-text-muted">
            {getDateNumber(day.date)} {getMonthShort(day.date)}
          </p>
          {day.dailyNeeds?.besar && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
              Target: {Math.round(day.dailyNeeds.besar.energi)} kkal
            </span>
          )}
        </div>
      </div>

      {/* Combo Selector */}
      {combos.length > 1 && (
        <div className="mb-3">
          <label className="text-xs text-text-muted mb-1 block">Pilih Kombinasi:</label>
          <div className="flex gap-1">
            {combos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelectCombo(idx)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                  selectedComboIndex === idx
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      {currentCombo && (
        <div className="space-y-2 mb-4">
          {currentCombo.components.map((component, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 bg-bg rounded-lg"
            >
              <div>
                <span className="text-xs text-text-muted">{component.categoryLabel}</span>
                <p className="font-medium text-sm">{component.food.name}</p>
              </div>
              <span className="text-xs text-text-muted">
                {component.food.portionSize}
                {component.food.portionUnit}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Nutrition Summary */}
      {currentCombo && (
        <div className="grid grid-cols-5 gap-2 p-3 bg-bg rounded-xl mb-4">
          <div className="text-center">
            <p className="text-xs font-bold text-orange-600">
              {Math.round(currentCombo.totalNutrition.energi)}
            </p>
            <p className="text-xs text-text-muted">kkal</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold">
              {currentCombo.totalNutrition.protein.toFixed(0)}g
            </p>
            <p className="text-xs text-text-muted">Prot</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-amber-600">
              {currentCombo.totalNutrition.karbohidrat.toFixed(0)}g
            </p>
            <p className="text-xs text-text-muted">Karbo</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-red-600">
              {currentCombo.totalNutrition.lemak.toFixed(0)}g
            </p>
            <p className="text-xs text-text-muted">Lemak</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-green-600">
              {currentCombo.totalNutrition.serat.toFixed(0)}g
            </p>
            <p className="text-xs text-text-muted">Serat</p>
          </div>
        </div>
      )}

      {/* Score & Save */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        {currentCombo && (
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              currentCombo.score >= 85
                ? "bg-green-500 text-white"
                : currentCombo.score >= 70
                ? "bg-amber-500 text-white"
                : "bg-orange-500 text-white"
            )}
          >
            {currentCombo.score}% Match
          </span>
        )}
        <button
          onClick={onSave}
          disabled={!currentCombo}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            "bg-green-600 text-white hover:bg-green-700",
            !currentCombo && "opacity-50 cursor-not-allowed"
          )}
        >
          <Save className="w-4 h-4" />
          Simpan
        </button>
      </div>
    </div>
  );
}