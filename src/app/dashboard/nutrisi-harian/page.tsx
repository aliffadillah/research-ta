"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Flame,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

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
  createdAt: string;
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

export default function NutrisiHarianPage() {
  const [nutritions, setNutritions] = useState<DailyNutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNutritions();
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

  const handleImportJSON = async () => {
    if (!confirm("Import data dari file JSON? Data yang sudah ada akan diupdate.")) {
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/daily-nutritions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "import" }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(result.message);
        fetchNutritions();
      } else {
        alert("Gagal import data");
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Gagal import data");
    } finally {
      setImporting(false);
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
      if (res.ok) fetchNutritions();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
        ? `${formatDate(nutritions[0].date)} - ${formatDate(nutritions[nutritions.length - 1].date)}`
        : "-",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Nutrisi Harian</h1>
          <p className="text-text-muted">
            Data nutrisi harian MBG untuk prediksi LSTM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleImportJSON}
            disabled={importing}
            className="btn-secondary flex items-center gap-2"
          >
            {importing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            Import JSON
          </button>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Tambah Manual
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="text-text-muted text-sm">Total Data</span>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <span className="text-text-muted text-sm">Rata-rata Energi BG</span>
              <p className="text-2xl font-semibold">{stats.avgEnergyBesar} kkal</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-text-muted text-sm">Rata-rata Energi KCL</span>
              <p className="text-2xl font-semibold">{stats.avgEnergyKecil} kkal</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <span className="text-text-muted text-sm">Rentang Tanggal</span>
              <p className="text-sm font-medium truncate">{stats.dateRange}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-static overflow-x-auto">
        <h3 className="text-lg font-semibold mb-6">Daftar Data Nutrisi Harian ({nutritions.length})</h3>

        {nutritions.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-muted">Tidak ada data. Import dari JSON atau tambah manual.</p>
          </div>
        ) : (
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">No</th>
                <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">Tanggal</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-green-600">Karbo BG</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-green-600">Protein BG</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-green-600">Lemak BG</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-green-600">Serat BG</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-green-600">Energi BG</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-blue-600">Karbo KCL</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-blue-600">Protein KCL</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-blue-600">Lemak KCL</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-blue-600">Serat KCL</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-blue-600">Energi KCL</th>
                <th className="text-center py-3 px-3 text-sm font-semibold text-text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {nutritions.map((nutrition, index) => (
                <tr key={nutrition.id} className="border-b border-border hover:bg-bg">
                  <td className="py-3 px-3 text-sm text-text-muted">{index + 1}</td>
                  <td className="py-3 px-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      {formatDate(nutrition.date)}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-green-700">
                    {nutrition.carbsBesar.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-green-700">
                    {nutrition.proteinBesar.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-green-700">
                    {nutrition.fatBesar.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-green-700">
                    {nutrition.fiberBesar.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-green-700">
                    {nutrition.energyBesar.toFixed(0)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-blue-700">
                    {nutrition.carbsKecil.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-blue-700">
                    {nutrition.proteinKecil.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-blue-700">
                    {nutrition.fatKecil.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-blue-700">
                    {nutrition.fiberKecil.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-blue-700">
                    {nutrition.energyKecil.toFixed(0)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(nutrition)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(nutrition.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        style={{ display: showModal ? "flex" : "none" }}
      >
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Data Nutrisi" : "Tambah Data Nutrisi"}
            </h2>
            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            <div className="grid grid-cols-2 gap-6">
              {/* Porsi Besar */}
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-700 mb-4">Porsi Besar</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Karbohidrat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.carbsBesar}
                      onChange={(e) => setForm({ ...form, carbsBesar: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.proteinBesar}
                      onChange={(e) => setForm({ ...form, proteinBesar: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Lemak (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fatBesar}
                      onChange={(e) => setForm({ ...form, fatBesar: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Serat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fiberBesar}
                      onChange={(e) => setForm({ ...form, fiberBesar: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">Energi (kkal)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.energyBesar}
                      onChange={(e) => setForm({ ...form, energyBesar: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Porsi Kecil */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-700 mb-4">Porsi Kecil</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Karbohidrat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.carbsKecil}
                      onChange={(e) => setForm({ ...form, carbsKecil: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.proteinKecil}
                      onChange={(e) => setForm({ ...form, proteinKecil: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Lemak (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fatKecil}
                      onChange={(e) => setForm({ ...form, fatKecil: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Serat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fiberKecil}
                      onChange={(e) => setForm({ ...form, fiberKecil: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">Energi (kkal)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.energyKecil}
                      onChange={(e) => setForm({ ...form, energyKecil: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Batal
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
