"use client";

import { useEffect, useState, useRef } from "react";
import {
  Brain,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import ImportModal from "@/components/modals/ImportModal";
import SyncProgressModal from "@/components/modals/SyncProgressModal";
import { parseDateUTC, formatDateDisplay } from "@/lib/utils/date-utils";

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
  isPredicted?: boolean;
  syncedAt?: string;
  createdAt: string;
}

interface NormalizedNutritionRow {
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
  isValid: boolean;
  error?: string;
}

interface FilePreviewResult {
  success: boolean;
  preview: NormalizedNutritionRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  dateRange: { start: string; end: string } | null;
}

interface SyncStatus {
  lastDataDate: string | null;
  lastDate: string | null;
  nextPredictDate: string;
  today: string;
  daysToSync: number;
  needsSync: boolean;
  totalRecords: number;
  actualDataCount: number;
  predictedDataCount: number;
  canPredict: boolean;
  hasEnoughData: boolean;
  message: string;
}

interface SyncProgressEvent {
  type: "start" | "progress" | "synced" | "error_day" | "complete" | "error";
  message?: string;
  current?: number;
  total?: number;
  date?: string;
  energy?: number;
  percentage?: number;
  synced?: number;
  errors?: number;
  results?: { date: string; status: string; energy?: number }[];
}

interface SyncProgress {
  status: "idle" | "syncing" | "complete" | "error";
  message: string;
  current: number;
  total: number;
  date: string;
  percentage: number;
  synced: number;
  errors: number;
  results: { date: string; status: string; energy?: number }[];
}

interface PopupMessage {
  show: boolean;
  type: "success" | "error" | "info" | "confirm" | "predict";
  message: string;
  onConfirm?: () => void;
  onPredictNext?: () => void;
  onSyncAll?: () => void;
  predictNextDate?: string;
  syncDaysCount?: number;
}

const emptyForm = {
  date: "",
  carbsBesar: 0,
  proteinBesar: 0,
  fatBesar: 0,
  fiberBesar: 0,
  energyBesar: 0,
  carbsKecil: 0,
  proteinKecil: 0,
  fatKecil: 0,
  fiberKecil: 0,
  energyKecil: 0,
};

// Popup Component
function Popup({ popup, onClose }: { popup: PopupMessage; onClose: () => void }) {
  if (!popup.show) return null;

  const icons = {
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    error: <AlertCircle className="w-12 h-12 text-red-500" />,
    info: <Info className="w-12 h-12 text-blue-500" />,
    confirm: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    predict: <Brain className="w-12 h-12 text-primary" />,
  };

  const borderColors = {
    success: "border-green-500",
    error: "border-red-500",
    info: "border-blue-500",
    confirm: "border-yellow-500",
    predict: "border-primary",
  };

  // Predict type - show options
  if (popup.type === "predict") {
    // Calculate tomorrow's date in WIB for display
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDateStr = tomorrow.toISOString().split("T")[0];
    const displayDate = popup.predictNextDate || defaultDateStr;

    // Format date for display
    const formattedDate = new Date(displayDate).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
        <div className={`bg-white rounded-2xl p-6 w-full max-w-md mx-4 border-t-4 ${borderColors[popup.type]}`}>
          <div className="flex flex-col items-center text-center">
            {icons[popup.type]}
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              Prediksi Nutrisi
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Pilih jenis prediksi yang ingin dilakukan:
            </p>

            <div className="w-full mt-6 space-y-3">
              {/* Prediksi Besok Option */}
              <button
                onClick={() => {
                  popup.onPredictNext?.();
                  onClose();
                }}
                className="w-full p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-teal-800">Prediksi Besok</p>
                    <p className="text-sm text-teal-600">
                      {popup.predictNextDate
                        ? `Prediksi nutrisi untuk ${formattedDate}`
                        : "Tidak ada data historis untuk diprediksi"}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-teal-600" />
                </div>
              </button>

              {/* Sync Semua Option */}
              <button
                onClick={() => {
                  popup.onSyncAll?.();
                  onClose();
                }}
                className="w-full p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-orange-800">Sync Semua</p>
                    <p className="text-sm text-orange-600">
                      Prediksi {popup.syncDaysCount || 0} hari yang belum ada datanya
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-600" />
                </div>
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className={`bg-white rounded-2xl p-6 w-full max-w-lg mx-4 border-t-4 ${borderColors[popup.type]} max-h-[80vh] flex flex-col`}>
        <div className="flex flex-col items-center text-center flex-shrink-0">
          {icons[popup.type]}
          <p className="mt-4 text-lg font-medium text-gray-800 whitespace-pre-line">
            {popup.message}
          </p>
        </div>

        <div className="flex gap-3 mt-6 flex-shrink-0">
          {popup.type === "confirm" ? (
            <>
              <button
                onClick={() => {
                  popup.onConfirm?.();
                  onClose();
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Ya, Lanjutkan
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Batal
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NutrisiHarianPage() {
  const [nutritions, setNutritions] = useState<DailyNutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<PopupMessage>({ show: false, type: "info", message: "" });
  const [currentTime, setCurrentTime] = useState<string>("");
  const [previewResult, setPreviewResult] = useState<FilePreviewResult | null>(null);
  const [rawFileData, setRawFileData] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<"json" | "csv">("json");
  const [previewing, setPreviewing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: "idle",
    message: "",
    current: 0,
    total: 0,
    date: "",
    percentage: 0,
    synced: 0,
    errors: 0,
    results: [],
  });
  const [predicting, setPredicting] = useState(false);
  const [nextPredictDate, setNextPredictDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtered data
  const filteredNutritions = nutritions.filter((n) => {
    // Filter by date range
    const dateStr = n.date.split("T")[0];
    if (filterDateFrom && dateStr < filterDateFrom) return false;
    if (filterDateTo && dateStr > filterDateTo) return false;

    return true;
  });

  // Filtered stats
  const filteredStats = {
    total: filteredNutritions.length,
    predicted: filteredNutritions.filter(n => n.isPredicted).length,
    avgEnergyBesar: filteredNutritions.length > 0
      ? Math.round(filteredNutritions.reduce((sum, n) => sum + (n.energyBesar || 0), 0) / filteredNutritions.length)
      : 0,
    avgEnergyKecil: filteredNutritions.length > 0
      ? Math.round(filteredNutritions.reduce((sum, n) => sum + (n.energyKecil || 0), 0) / filteredNutritions.length)
      : 0,
  };

  const resetFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasActiveFilters = filterDateFrom || filterDateTo;

  // Open prediction options popup
  const openPredictPopup = () => {
    setPopup({
      show: true,
      type: "predict",
      message: "Pilih jenis prediksi:",
      predictNextDate: nextPredictDate || undefined,
      syncDaysCount: syncStatus?.daysToSync || 0,
      onPredictNext: handlePredictNext,
      onSyncAll: handleSync,
    });
  };

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      // Dapatkan tanggal hari ini berdasarkan UTC
      const now = new Date();
      // Hitung offset UTC ke WIB (7 jam)
      const utcHours = now.getUTCHours();
      const wibHours = utcHours + 7;

      // Jika melewati tengah hari WIB (>= 24), kurangi 24 dan tambah tanggal
      const wibDate = new Date(now);
      if (wibHours >= 24) {
        wibDate.setUTCDate(wibDate.getUTCDate() + 1);
        wibDate.setUTCHours(wibHours - 24);
      } else {
        wibDate.setUTCHours(wibHours);
      }

      // Format manual
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                     "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

      const weekday = days[wibDate.getUTCDay()];
      const day = wibDate.getUTCDate();
      const month = months[wibDate.getUTCMonth()];
      const year = wibDate.getUTCFullYear();
      const hours = String(wibDate.getUTCHours()).padStart(2, "0");
      const minutes = String(wibDate.getUTCMinutes()).padStart(2, "0");
      const seconds = String(wibDate.getUTCSeconds()).padStart(2, "0");

      setCurrentTime(`${weekday}, ${day} ${month} ${year} pukul ${hours}.${minutes}.${seconds} (WIB)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchNutritions();
    fetchSyncStatus();
    fetchNextPredictDate();
  }, []);

  const fetchNutritions = async () => {
    try {
      const res = await fetch("/api/daily-nutritions");
      if (res.ok) {
        const data = await res.json();
        setNutritions(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch("/api/lstm-sync/status");
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch sync status:", error);
    }
  };

  const fetchNextPredictDate = async () => {
    try {
      // Try lstm-predict first
      const res = await fetch("/api/lstm-predict");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.nextPredictDate) {
          setNextPredictDate(data.nextPredictDate);
          return;
        }
      }

      // Fallback to lstm-sync/status
      const statusRes = await fetch("/api/lstm-sync/status");
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.nextPredictDate) {
          setNextPredictDate(statusData.nextPredictDate);
        }
      }
    } catch (error) {
      console.error("Failed to fetch next predict date:", error);
    }
  };

  const handlePredictNext = async () => {
    setPredicting(true);

    // Get the date to predict - try multiple sources
    let targetDate = nextPredictDate;

    // If no date, try to fetch from sync status
    if (!targetDate && syncStatus?.nextPredictDate) {
      targetDate = syncStatus.nextPredictDate;
    }

    // If still no date, fetch fresh from API
    if (!targetDate) {
      try {
        const statusRes = await fetch("/api/lstm-sync/status");
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.nextPredictDate) {
            targetDate = statusData.nextPredictDate;
            setNextPredictDate(targetDate);
          }
        }
      } catch (e) {
        console.error("Failed to fetch next predict date:", e);
      }
    }

    // If still no date, show error
    if (!targetDate) {
      setPredicting(false);
      setPopup({
        show: true,
        type: "error",
        message: "Tidak dapat menentukan tanggal prediksi. Pastikan sudah ada data nutrisi historis.",
      });
      return;
    }

    try {
      const res = await fetch("/api/lstm-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: targetDate }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Check if data already existed or was newly predicted
        const nutritionData = data.prediction || data.existingData;
        const isExisting = !!data.existingData && !data.prediction;

        setPopup({
          show: true,
          type: "success",
          message: isExisting
            ? `Data untuk ${data.date} sudah ada sebelumnya:\n\nEnergi BG: ${nutritionData?.energyBesar?.toFixed(0) || "-"} kkal\nProtein BG: ${nutritionData?.proteinBesar?.toFixed(1) || "-"} g\nKarbo BG: ${nutritionData?.carbsBesar?.toFixed(1) || "-"} g\nLemak BG: ${nutritionData?.fatBesar?.toFixed(1) || "-"} g`
            : `Berhasil memprediksi nutrisi untuk ${data.date}:\n\nEnergi BG: ${nutritionData?.energyBesar?.toFixed(0) || "-"} kkal\nProtein BG: ${nutritionData?.proteinBesar?.toFixed(1) || "-"} g\nKarbo BG: ${nutritionData?.carbsBesar?.toFixed(1) || "-"} g\nLemak BG: ${nutritionData?.fatBesar?.toFixed(1) || "-"} g`,
        });
        // Refresh data
        fetchNutritions();
        fetchSyncStatus();
        fetchNextPredictDate();
      } else {
        // Check if it's a "data already exists" case
        if (data.message?.includes("sudah ada")) {
          setPopup({
            show: true,
            type: "success",
            message: `Data untuk ${data.date || targetDate} sudah ada sebelumnya:\n\nEnergi BG: ${data.existingData?.energyBesar?.toFixed(0) || "-"} kkal\nProtein BG: ${data.existingData?.proteinBesar?.toFixed(1) || "-"} g\nKarbo BG: ${data.existingData?.carbsBesar?.toFixed(1) || "-"} g\nLemak BG: ${data.existingData?.fatBesar?.toFixed(1) || "-"} g`,
          });
          fetchNutritions();
          fetchSyncStatus();
          fetchNextPredictDate();
        } else {
          setPopup({
            show: true,
            type: "error",
            message: data.message || data.error || "Gagal memprediksi nutrisi. Pastikan server Flask sedang berjalan.",
          });
        }
      }
    } catch (error) {
      console.error("Predict error:", error);
      setPopup({
        show: true,
        type: "error",
        message: "Gagal memprediksi nutrisi. Pastikan server Flask sedang berjalan.",
      });
    } finally {
      setPredicting(false);
    }
  };

  const handleSync = () => {
    // Check how many days need syncing
    if (syncStatus && (syncStatus.daysToSync || 0) === 0) {
      setPopup({
        show: true,
        type: "info",
        message: "Data sudah up-to-date!",
      });
      return;
    }

    // Open sync progress modal
    setSyncProgress({
      status: "syncing",
      message: "Memulai sinkronisasi...",
      current: 0,
      total: 0,
      date: "",
      percentage: 0,
      synced: 0,
      errors: 0,
      results: [],
    });
    setShowSyncModal(true);
    setSyncing(true);

    // Start SSE connection
    const eventSource = new EventSource("/api/lstm-sync");

    eventSource.onmessage = (event) => {
      try {
        const data: SyncProgressEvent = JSON.parse(event.data);

        switch (data.type) {
          case "start":
            setSyncProgress((prev) => ({
              ...prev,
              status: "syncing",
              message: data.message || "Memulai...",
              total: data.total || 0,
              current: 0,
              percentage: 0,
            }));
            break;

          case "progress":
            setSyncProgress((prev) => ({
              ...prev,
              status: "syncing",
              message: data.message || `Memproses...`,
              current: data.current || 0,
              total: data.total || 0,
              date: data.date || "",
              percentage: data.percentage || 0,
            }));
            break;

          case "synced":
            setSyncProgress((prev) => ({
              ...prev,
              status: "syncing",
              current: data.current || 0,
              total: data.total || 0,
              date: data.date || "",
              percentage: data.percentage || 0,
              synced: prev.synced + 1,
              results: [
                ...prev.results.slice(-9), // Keep last 10
                { date: data.date || "", status: "success", energy: data.energy },
              ],
            }));
            break;

          case "error_day":
            setSyncProgress((prev) => ({
              ...prev,
              status: "syncing",
              current: data.current || 0,
              total: data.total || 0,
              date: data.date || "",
              errors: prev.errors + 1,
              results: [
                ...prev.results.slice(-9),
                { date: data.date || "", status: "error" },
              ],
            }));
            break;

          case "complete":
            setSyncProgress((prev) => ({
              ...prev,
              status: "complete",
              message: data.message || "Sinkronisasi selesai!",
              synced: data.synced || prev.synced,
              errors: data.errors || prev.errors,
              percentage: 100,
              results: data.results || prev.results,
            }));
            eventSource.close();
            setSyncing(false);
            // Refresh data
            fetchNutritions();
            fetchSyncStatus();
            break;

          case "error":
            setSyncProgress((prev) => ({
              ...prev,
              status: "error",
              message: data.message || "Terjadi kesalahan",
            }));
            eventSource.close();
            setSyncing(false);
            break;
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      setSyncProgress((prev) => ({
        ...prev,
        status: "error",
        message: "Koneksi terputus. Silakan coba lagi.",
      }));
      eventSource.close();
      setSyncing(false);
    };
  };

  const closeSyncModal = () => {
    if (!syncing) {
      setShowSyncModal(false);
      setSyncProgress({
        status: "idle",
        message: "",
        current: 0,
        total: 0,
        date: "",
        percentage: 0,
        synced: 0,
        errors: 0,
        results: [],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = "/api/daily-nutritions";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setForm(emptyForm);
        fetchNutritions();
        fetchSyncStatus();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (nutrition: DailyNutrition) => {
    setEditingId(nutrition.id);
    setForm({
      date: nutrition.date.split("T")[0],
      carbsBesar: nutrition.carbsBesar,
      proteinBesar: nutrition.proteinBesar,
      fatBesar: nutrition.fatBesar,
      fiberBesar: nutrition.fiberBesar,
      energyBesar: nutrition.energyBesar,
      carbsKecil: nutrition.carbsKecil,
      proteinKecil: nutrition.proteinKecil,
      fatKecil: nutrition.fatKecil,
      fiberKecil: nutrition.fiberKecil,
      energyKecil: nutrition.energyKecil,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;

    try {
      const res = await fetch(`/api/daily-nutritions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNutritions();
        fetchSyncStatus();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isJson = file.name.endsWith(".json");
    const isCsv = file.name.endsWith(".csv");

    if (!isJson && !isCsv) {
      setPopup({
        show: true,
        type: "error",
        message: "Hanya file JSON atau CSV yang diizinkan!",
      });
      return;
    }

    const fileType = isJson ? "json" : "csv";
    setSelectedFileType(fileType);

    try {
      const content = await file.text();
      setRawFileData(content);

      // Auto preview
      setPreviewing(true);
      const res = await fetch("/api/daily-nutritions-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          data: content,
          fileType,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (!result.success) {
          // Column validation error
          setPopup({
            show: true,
            type: "error",
            message: result.message || result.error || "Format file tidak sesuai",
          });
          setPreviewResult(null);
        } else {
          setPreviewResult(result);
        }
      } else {
        const error = await res.json();
        setPopup({
          show: true,
          type: "error",
          message: error.message || error.error || "Gagal membaca file",
        });
      }
    } catch (error) {
      console.error("File read error:", error);
      setPopup({
        show: true,
        type: "error",
        message: "Gagal membaca file",
      });
    } finally {
      setPreviewing(false);
    }
  };

  const handleImportFromPreview = () => {
    if (!previewResult || !rawFileData) return;

    if (previewResult.invalidRows > 0 && previewResult.validRows === 0) {
      setPopup({
        show: true,
        type: "error",
        message: "Tidak ada data valid untuk diimport! Periksa format tanggal.",
      });
      return;
    }

    const warningMsg = previewResult.invalidRows > 0
      ? `\n\n⚠️ Perhatian: ${previewResult.invalidRows} baris memiliki format tidak valid dan akan dilewati.`
      : "";

    setPopup({
      show: true,
      type: "confirm",
      message: `Import ${previewResult.validRows} data nutrisi?\n\nRentang tanggal: ${previewResult.dateRange?.start} - ${previewResult.dateRange?.end}${warningMsg}`,
      onConfirm: async () => {
        setImporting(true);
        try {
          const res = await fetch("/api/daily-nutritions-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "import",
              data: rawFileData,
              fileType: selectedFileType,
            }),
          });

          if (res.ok) {
            const result = await res.json();
            setPopup({
              show: true,
              type: "success",
              message: result.message || "Data berhasil diimport!",
            });
            setShowImportModal(false);
            resetImportState();
            fetchNutritions();
            fetchSyncStatus();
          } else {
            const error = await res.json();
            setPopup({
              show: true,
              type: "error",
              message: error.error || "Gagal import data",
            });
          }
        } catch (error) {
          console.error("Import error:", error);
          setPopup({
            show: true,
            type: "error",
            message: "Gagal import data",
          });
        } finally {
          setImporting(false);
        }
      },
    });
  };

  const resetImportState = () => {
    setPreviewResult(null);
    setRawFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openImportModal = () => {
    resetImportState();
    setShowImportModal(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const formatDate = (dateStr: string) => {
    // Parse date string as UTC to avoid timezone shifts
    const date = parseDateUTC(dateStr.split("T")[0]);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };

  const formatDateShort = (dateStr: string) => {
    // Parse date string as UTC to avoid timezone shifts
    const dateStrOnly = dateStr.split("T")[0];
    const date = parseDateUTC(dateStrOnly);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };

  // Statistics
  const stats = {
    total: nutritions.length,
    avgEnergyBesar:
      nutritions.length > 0
        ? Math.round(nutritions.reduce((sum, n) => sum + (n.energyBesar || 0), 0) / nutritions.length)
        : 0,
    avgEnergyKecil:
      nutritions.length > 0
        ? Math.round(nutritions.reduce((sum, n) => sum + (n.energyKecil || 0), 0) / nutritions.length)
        : 0,
    dateRange:
      nutritions.length > 0
        ? `${formatDateShort(nutritions[0].date)} - ${formatDateShort(nutritions[nutritions.length - 1].date)}`
        : "-",
    lastSync: syncStatus?.lastDataDate
      ? formatDateShort(syncStatus.lastDataDate)
      : "Belum ada data",
    predicted: syncStatus?.predictedDataCount || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans mb-1 md:mb-2">Nutrisi Harian</h1>
          <div className="flex items-center gap-2 text-xs md:text-sm text-text-muted">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            <span className="truncate">{currentTime} (WIB)</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openImportModal}
            disabled={importing}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-3"
          >
            {importing ? (
              <Loader2 className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Import File</span>
          </button>
          <button
            onClick={openPredictPopup}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-3"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Prediksi</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={openNewModal} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <span className="text-text-muted text-xs md:text-sm block truncate">Total Data</span>
              <p className="text-lg md:text-2xl font-semibold">{filteredStats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <span className="text-text-muted text-xs md:text-sm block truncate">Rata-rata BG</span>
              <p className="text-lg md:text-2xl font-semibold">{filteredStats.avgEnergyBesar} kkal</p>
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <span className="text-text-muted text-xs md:text-sm block truncate">Rata-rata KCL</span>
              <p className="text-lg md:text-2xl font-semibold">{filteredStats.avgEnergyKecil} kkal</p>
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <span className="text-text-muted text-xs md:text-sm block truncate">Rentang</span>
              <p className="text-sm font-medium truncate max-w-[120px] md:max-w-[180px]">{stats.dateRange}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {syncStatus?.needsSync ? (
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
              ) : (
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-text-muted text-xs md:text-sm block truncate">Terakhir</span>
              <p className="text-sm font-medium truncate max-w-[120px] md:max-w-[180px]">{stats.lastSync}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-static overflow-x-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base md:text-lg font-semibold">
            Daftar Data Nutrisi
            {hasActiveFilters && (
              <span className="ml-2 text-sm font-normal text-text-muted">
                ({filteredNutritions.length} dari {nutritions.length})
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center ${
              showFilters || hasActiveFilters
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {(filterDateFrom ? 1 : 0) + (filterDateTo ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-4 p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-end">
              {/* Filter by Date Range */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Dari Tanggal</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Sampai Tanggal</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Stats badge for filtered predicted count */}
        {filteredStats.predicted > 0 && (
          <div className="mb-4">
            <span className="text-xs md:text-sm text-text-muted bg-cyan-50 px-3 py-1 rounded-full">
              {filteredStats.predicted} data hasil prediksi LSTM
            </span>
          </div>
        )}

        {filteredNutritions.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <Brain className="w-10 h-10 md:w-12 md:h-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-muted text-sm md:text-base">
              {hasActiveFilters ? "Tidak ada data yang sesuai filter." : "Tidak ada data. Import dari JSON atau tambah manual."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="w-full min-w-[900px] md:min-w-[1200px] text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold text-text-muted">No</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold text-text-muted">Tanggal</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-green-600">Karbo BG</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-green-600">Protein BG</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-green-600 hidden sm:table-cell">Lemak BG</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-green-600 hidden md:table-cell">Serat BG</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-green-600">Energi BG</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-blue-600 hidden sm:table-cell">Karbo KCL</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-blue-600 hidden sm:table-cell">Protein KCL</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-blue-600 hidden lg:table-cell">Lemak KCL</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-blue-600 hidden lg:table-cell">Serat KCL</th>
                  <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-blue-600 hidden md:table-cell">Energi KCL</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-3 font-semibold text-text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredNutritions.map((nutrition, index) => (
                  <tr key={nutrition.id} className="border-b border-border hover:bg-bg">
                    <td className="py-2 md:py-3 px-2 md:px-3 text-text-muted">{index + 1}</td>
                    <td className="py-2 md:py-3 px-2 md:px-3">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 text-text-muted flex-shrink-0" />
                        <span className="text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{formatDate(nutrition.date)}</span>
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-green-700">
                      {nutrition.carbsBesar.toFixed(1)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-green-700">
                      {nutrition.proteinBesar.toFixed(1)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-green-700 hidden sm:table-cell">
                      {nutrition.fatBesar.toFixed(1)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-green-700 hidden md:table-cell">
                      {nutrition.fiberBesar.toFixed(1)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-green-700 font-semibold">
                      {nutrition.energyBesar.toFixed(0)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-blue-700 hidden sm:table-cell">
                      {nutrition.carbsKecil.toFixed(1)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-blue-700 hidden sm:table-cell">
                      {nutrition.proteinKecil.toFixed(1)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-blue-700 hidden lg:table-cell">
                      {nutrition.fatKecil.toFixed(1)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-blue-700 hidden lg:table-cell">
                      {nutrition.fiberKecil.toFixed(1)}
                    </td>
                    <td className="py-2 md:py-3 px-1 text-center font-medium text-blue-700 hidden md:table-cell font-semibold">
                      {nutrition.energyKecil.toFixed(0)}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-3">
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <button
                          onClick={() => handleEdit(nutrition)}
                          className="p-1.5 md:p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDelete(nutrition.id)}
                          className="p-1.5 md:p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
        style={{ display: showModal ? "flex" : "none" }}
      >
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold">
              {editingId ? "Edit Data Nutrisi" : "Tambah Data Nutrisi"}
            </h2>
            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div>
              <label className="label">Tanggal</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Porsi Besar */}
              <div className="p-3 md:p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-700 mb-3 md:mb-4">Porsi Besar</h4>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div>
                    <label className="label text-xs">Karbohidrat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.carbsBesar}
                      onChange={(e) => setForm({ ...form, carbsBesar: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.proteinBesar}
                      onChange={(e) => setForm({ ...form, proteinBesar: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Lemak (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fatBesar}
                      onChange={(e) => setForm({ ...form, fatBesar: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Serat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fiberBesar}
                      onChange={(e) => setForm({ ...form, fiberBesar: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">Energi (kkal)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.energyBesar}
                      onChange={(e) => setForm({ ...form, energyBesar: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Porsi Kecil */}
              <div className="p-3 md:p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-700 mb-3 md:mb-4">Porsi Kecil</h4>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div>
                    <label className="label text-xs">Karbohidrat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.carbsKecil}
                      onChange={(e) => setForm({ ...form, carbsKecil: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.proteinKecil}
                      onChange={(e) => setForm({ ...form, proteinKecil: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Lemak (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fatKecil}
                      onChange={(e) => setForm({ ...form, fatKecil: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Serat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fiberKecil}
                      onChange={(e) => setForm({ ...form, fiberKecil: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">Energi (kkal)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.energyKecil}
                      onChange={(e) => setForm({ ...form, energyKecil: Number(e.target.value) })}
                      className="input-field text-sm py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary order-2 sm:order-1">
                Batal
              </button>
              <button type="submit" disabled={saving} className="btn-primary order-1 sm:order-2">
                {saving ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        previewResult={previewResult}
        selectedFileType={selectedFileType}
        onFileSelect={handleFileUpload}
        onImport={handleImportFromPreview}
        onReset={resetImportState}
        previewing={previewing}
        importing={importing}
        fileInputRef={fileInputRef}
      />

      <SyncProgressModal
        show={showSyncModal}
        syncProgress={syncProgress}
        syncing={syncing}
        onClose={closeSyncModal}
      />

      {/* Popup Messages */}
      <Popup popup={popup} onClose={() => setPopup({ ...popup, show: false })} />
    </div>
  );
}
