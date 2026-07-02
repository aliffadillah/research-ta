"use client";

import { Loader2, Upload, X, Check, AlertCircle, Eye, Calendar, FileSpreadsheet, Info } from "lucide-react";

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

interface ImportModalProps {
  show: boolean;
  onClose: () => void;
  previewResult: FilePreviewResult | null;
  selectedFileType: "json" | "csv";
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  onReset: () => void;
  previewing: boolean;
  importing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function ImportModal({
  show,
  onClose,
  previewResult,
  selectedFileType,
  onFileSelect,
  onImport,
  onReset,
  previewing,
  importing,
  fileInputRef,
}: ImportModalProps) {
  if (!show) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Import Data Nutrisi</h2>
              <p className="text-sm text-text-muted">Upload file JSON atau CSV</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* File Upload Section */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={onFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">Klik untuk pilih file</p>
                    <p className="text-sm text-text-muted mt-1">
                      Format yang didukung: JSON, CSV
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Format Guide */}
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Panduan Format File
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-600">JSON Format:</p>
                  <pre className="bg-white/50 rounded-lg p-2 mt-1 text-xs overflow-x-auto">
{`[
  {
    "Tanggal": "2024-01-01",
    "Karbohidrat Besar": 120,
    "Protein Besar": 30,
    "Lemak Besar": 15,
    "Serat Besar": 8,
    "Energi Besar": 750,
    "Karbohidrat Kecil": 60,
    "Protein Kecil": 15,
    "Lemak Kecil": 7,
    "Serat Kecil": 4,
    "Energi Kecil": 375
  }
]`}
                  </pre>
                </div>
                <div>
                  <p className="font-medium text-blue-600">CSV Format:</p>
                  <pre className="bg-white/50 rounded-lg p-2 mt-1 text-xs overflow-x-auto">
Tanggal,Karbo BG,Protein BG,Lemak BG,Serat BG,Energi BG,Karbo KCL,Protein KCL,Lemak KCL,Serat KCL,Energi KCL
2024-01-01,120,30,15,8,750,60,15,7,4,375
2024-01-02,115,28,14,7,720,58,14,6,3,360
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {previewing && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-text-muted">Memproses file...</span>
            </div>
          )}

          {previewResult && !previewing && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card bg-gradient-to-br from-green-50 to-green-100/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Valid</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{previewResult.validRows}</p>
                </div>
                <div className="card bg-gradient-to-br from-red-50 to-red-100/50">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Invalid</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{previewResult.invalidRows}</p>
                </div>
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">Total Baris</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{previewResult.totalRows}</p>
                </div>
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600 font-medium">Tanggal</span>
                  </div>
                  <p className="text-sm font-bold text-purple-700">
                    {previewResult.dateRange
                      ? `${formatDate(previewResult.dateRange.start)} - ${formatDate(previewResult.dateRange.end)}`
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="p-4 bg-bg border-b border-border flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview Data (10 data pertama)
                  </h4>
                  <span className="text-sm text-text-muted">
                    {selectedFileType.toUpperCase()} File
                  </span>
                </div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-bg sticky top-0">
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted">Status</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted">Tanggal</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-green-600">Karbo BG</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-green-600">Protein BG</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-green-600">Lemak BG</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-green-600">Serat BG</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-green-600">Energi BG</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-blue-600">Karbo KCL</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-blue-600">Protein KCL</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-blue-600">Lemak KCL</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-blue-600">Serat KCL</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-blue-600">Energi KCL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewResult.preview.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-b border-border ${
                            !row.isValid ? "bg-red-50/50" : "hover:bg-bg"
                          }`}
                        >
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-xs text-red-500">{row.error}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-sm font-medium">{row.date}</td>
                          <td className="py-2 px-2 text-center text-sm text-green-700">
                            {row.carbsBesar.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-green-700">
                            {row.proteinBesar.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-green-700">
                            {row.fatBesar.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-green-700">
                            {row.fiberBesar.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-green-700">
                            {row.energyBesar.toFixed(0)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-blue-700">
                            {row.carbsKecil.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-blue-700">
                            {row.proteinKecil.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-blue-700">
                            {row.fatKecil.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-blue-700">
                            {row.fiberKecil.toFixed(1)}
                          </td>
                          <td className="py-2 px-2 text-center text-sm text-blue-700">
                            {row.energyKecil.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <button
            onClick={onReset}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button
              onClick={onImport}
              disabled={!previewResult || previewing || importing || previewResult.validRows === 0}
              className="btn-primary flex items-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengimport...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Import {previewResult?.validRows || 0} Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
