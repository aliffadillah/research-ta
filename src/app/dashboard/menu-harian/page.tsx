"use client";

import { useEffect, useState } from "react";
import { Utensils, Flame, Calendar, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface MenuRecommendation {
  id: string;
  name: string;
  description: string | null;
  tanggal: string;
  caloriesBesar: number;
  proteinBesar: number;
  carbsBesar: number;
  fatBesar: number;
  fiberBesar: number;
  caloriesKecil: number;
  proteinKecil: number;
  carbsKecil: number;
  fatKecil: number;
  fiberKecil: number;
  isActive: boolean;
}

const emptyMenu = {
  name: "",
  description: "",
  tanggal: "",
  caloriesBesar: 0,
  proteinBesar: 0,
  carbsBesar: 0,
  fatBesar: 0,
  fiberBesar: 0,
  caloriesKecil: 0,
  proteinKecil: 0,
  carbsKecil: 0,
  fatKecil: 0,
  fiberKecil: 0,
};

export default function MenuHarianPage() {
  const [menus, setMenus] = useState<MenuRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyMenu);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menu-recommendations");
      if (res.ok) {
        const data = await res.json();
        setMenus(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId ? "/api/menu-recommendations" : "/api/menu-recommendations";
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
        setForm(emptyMenu);
        fetchMenus();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (menu: MenuRecommendation) => {
    setEditingId(menu.id);
    setForm({
      name: menu.name,
      description: menu.description || "",
      tanggal: menu.tanggal || "",
      caloriesBesar: menu.caloriesBesar,
      proteinBesar: menu.proteinBesar,
      carbsBesar: menu.carbsBesar,
      fatBesar: menu.fatBesar,
      fiberBesar: menu.fiberBesar,
      caloriesKecil: menu.caloriesKecil,
      proteinKecil: menu.proteinKecil,
      carbsKecil: menu.carbsKecil,
      fatKecil: menu.fatKecil,
      fiberKecil: menu.fiberKecil,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus menu ini?")) return;

    try {
      const res = await fetch(`/api/menu-recommendations?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchMenus();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(emptyMenu);
    setShowModal(true);
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
          <h1 className="text-3xl font-sans mb-2">Menu Harian MBG</h1>
          <p className="text-text-muted">
            Kelola menu Makan Bergizi Gratis dengan nilai gizi
          </p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tambah Menu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Utensils className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-text-muted text-sm">Total Menu</span>
              <p className="text-2xl font-semibold">{menus.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <span className="text-text-muted text-sm">Rata-rata Kalori Porsi Besar</span>
              <p className="text-2xl font-semibold">
                {menus.length > 0
                  ? Math.round(menus.reduce((sum, m) => sum + (m.caloriesBesar || 0), 0) / menus.length)
                  : 0} kkal
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <span className="text-text-muted text-sm">Rata-rata Kalori Porsi Kecil</span>
              <p className="text-2xl font-semibold">
                {menus.length > 0
                  ? Math.round(menus.reduce((sum, m) => sum + (m.caloriesKecil || 0), 0) / menus.length)
                  : 0} kkal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-static overflow-x-auto">
        <h3 className="text-lg font-semibold mb-6">Daftar Menu ({menus.length})</h3>

        {menus.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-muted">Tidak ada menu yang ditemukan</p>
          </div>
        ) : (
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">No</th>
                <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">Tanggal</th>
                <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">Menu</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-green-600">Kkal B</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-blue-600">Kkal K</th>
                <th className="text-center py-3 px-3 text-sm font-semibold text-text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu, index) => (
                <tr key={menu.id} className="border-b border-border hover:bg-bg">
                  <td className="py-3 px-3 text-sm text-text-muted">{index + 1}</td>
                  <td className="py-3 px-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      {menu.tanggal || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm font-medium">
                    {menu.name}
                    {menu.description && (
                      <p className="text-xs text-text-muted">{menu.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-green-700">
                    {menu.caloriesBesar}
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-blue-700">
                    {menu.caloriesKecil}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(menu)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
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
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Menu</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Tanggal</label>
                  <input
                    type="text"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="input-field"
                    placeholder="2024-01-15"
                  />
                </div>
              </div>

              <div>
                <label className="label">Deskripsi</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Porsi Besar */}
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-green-700 mb-4">Porsi Besar</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Kalori (kkal)</label>
                      <input
                        type="number"
                        value={form.caloriesBesar}
                        onChange={(e) => setForm({ ...form, caloriesBesar: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Protein (g)</label>
                      <input
                        type="number"
                        value={form.proteinBesar}
                        onChange={(e) => setForm({ ...form, proteinBesar: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Karbohidrat (g)</label>
                      <input
                        type="number"
                        value={form.carbsBesar}
                        onChange={(e) => setForm({ ...form, carbsBesar: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Lemak (g)</label>
                      <input
                        type="number"
                        value={form.fatBesar}
                        onChange={(e) => setForm({ ...form, fatBesar: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs">Serat (g)</label>
                      <input
                        type="number"
                        value={form.fiberBesar}
                        onChange={(e) => setForm({ ...form, fiberBesar: Number(e.target.value) })}
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
                      <label className="label text-xs">Kalori (kkal)</label>
                      <input
                        type="number"
                        value={form.caloriesKecil}
                        onChange={(e) => setForm({ ...form, caloriesKecil: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Protein (g)</label>
                      <input
                        type="number"
                        value={form.proteinKecil}
                        onChange={(e) => setForm({ ...form, proteinKecil: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Karbohidrat (g)</label>
                      <input
                        type="number"
                        value={form.carbsKecil}
                        onChange={(e) => setForm({ ...form, carbsKecil: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Lemak (g)</label>
                      <input
                        type="number"
                        value={form.fatKecil}
                        onChange={(e) => setForm({ ...form, fatKecil: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs">Serat (g)</label>
                      <input
                        type="number"
                        value={form.fiberKecil}
                        onChange={(e) => setForm({ ...form, fiberKecil: Number(e.target.value) })}
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
      )}
    </div>
  );
}