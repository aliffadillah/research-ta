"use client";

import { CheckCircle, AlertCircle, X, Loader2, Calendar, Check, RefreshCw, Brain } from "lucide-react";

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

interface SyncProgressModalProps {
  show: boolean;
  syncProgress: SyncProgress;
  syncing: boolean;
  onClose: () => void;
}

export default function SyncProgressModal({ show, syncProgress, syncing, onClose }: SyncProgressModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              syncProgress.status === "complete"
                ? "bg-green-100"
                : syncProgress.status === "error"
                ? "bg-red-100"
                : "bg-orange-100"
            }`}>
              {syncProgress.status === "complete" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : syncProgress.status === "error" ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <RefreshCw className={`w-5 h-5 text-orange-600 ${syncing ? "animate-spin" : ""}`} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">Sinkronisasi LSTM</h2>
              <p className="text-sm text-text-muted">
                {syncProgress.status === "complete"
                  ? "Selesai"
                  : syncProgress.status === "error"
                  ? "Gagal"
                  : "Sedang berjalan..."}
              </p>
            </div>
          </div>
          {!syncing && (
            <button onClick={onClose} className="p-2 hover:bg-bg rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {syncProgress.status === "syncing" && syncProgress.total > 0
                  ? `Memproses hari ke-${syncProgress.current} dari ${syncProgress.total}`
                  : syncProgress.message}
              </span>
              <span className="text-sm font-semibold text-primary">
                {syncProgress.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  syncProgress.status === "complete"
                    ? "bg-green-500"
                    : syncProgress.status === "error"
                    ? "bg-red-500"
                    : "bg-primary"
                }`}
                style={{ width: `${syncProgress.percentage}%` }}
              />
            </div>
          </div>

          {/* Current Date */}
          {syncProgress.status === "syncing" && syncProgress.date && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-700">
                  Sedang memprediksi: {syncProgress.date}
                </span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card bg-gradient-to-br from-green-50 to-green-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Berhasil</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{syncProgress.synced}</p>
            </div>
            <div className="card bg-gradient-to-br from-red-50 to-red-100/50">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600 font-medium">Error</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{syncProgress.errors}</p>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Progress</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {syncProgress.current}/{syncProgress.total}
              </p>
            </div>
          </div>

          {/* Recent Results */}
          {syncProgress.results.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="p-4 bg-bg border-b border-border">
                <h4 className="font-medium text-sm">Riwayat Prediksi Terakhir</h4>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-bg sticky top-0">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted">Tanggal</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-text-muted">Status</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-green-600">Energi BG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncProgress.results.map((result, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-2 px-3 text-sm">{result.date}</td>
                        <td className="py-2 px-3 text-center">
                          {result.status === "success" ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              Berhasil
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              Error
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-sm text-green-700">
                          {result.energy?.toFixed(0) || "-"} kkal
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            disabled={syncing}
            className="btn-secondary"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Menunggu...
              </>
            ) : (
              "Tutup"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
