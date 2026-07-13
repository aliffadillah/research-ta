"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Apple, Plus, Pencil, Trash2, X } from "lucide-react";

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

const emptyFood = {
  name: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  portionSize: 100,
  portionUnit: "g",
  category: "",
};

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyFood);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await fetch("/api/foods-crud");
      const data = await res.json();
      if (Array.isArray(data)) setFoods(data);
    } catch (err) {
      console.error("Failed to fetch foods:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = "/api/foods-crud";
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
        setForm(emptyFood);
        fetchFoods();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (food: Food) => {
    setEditingId(food.id);
    setForm({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      portionSize: food.portionSize,
      portionUnit: food.portionUnit,
      category: food.category || "",
    });
    setShowModal(true);
  };

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; name: string }>({
    open: false,
    id: null,
    name: "",
  });

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const res = await fetch(`/api/foods-crud?id=${deleteDialog.id}`, { method: "DELETE" });
      if (res.ok) fetchFoods();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteDialog({ open: false, id: null, name: "" });
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(emptyFood);
    setShowModal(true);
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans mb-1 md:mb-2">Daftar Makanan</h1>
          <p className="text-text-muted text-sm md:text-base">
            {foods.length} jenis makanan dengan kandungan gizi
          </p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Tambah</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Cari makanan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredFoods.map((food) => (
          <div key={food.id} className="card hover:shadow-card-hover transition-shadow p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Apple className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm md:text-base truncate">{food.name}</h3>
                    <p className="text-xs md:text-sm text-text-muted">
                      {food.portionSize}
                      {food.portionUnit}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(food)}
                      className="p-1.5 md:p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ open: true, id: food.id, name: food.name })}
                      className="p-1.5 md:p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
              <div className="grid grid-cols-5 gap-1 md:gap-2 text-center">
                <div>
                  <p className="nutrition-value text-primary text-sm md:text-base">{Math.round(food.calories)}</p>
                  <p className="text-xs text-text-muted">Kalori</p>
                </div>
                <div>
                  <p className="nutrition-value text-sm md:text-base">{food.protein.toFixed(1)}g</p>
                  <p className="text-xs text-text-muted">Protein</p>
                </div>
                <div>
                  <p className="nutrition-value text-sm md:text-base">{food.carbs.toFixed(1)}g</p>
                  <p className="text-xs text-text-muted">Karbo</p>
                </div>
                <div>
                  <p className="nutrition-value text-sm md:text-base">{food.fat.toFixed(1)}g</p>
                  <p className="text-xs text-text-muted">Lemak</p>
                </div>
                <div>
                  <p className="nutrition-value text-sm md:text-base">{food.fiber.toFixed(1)}g</p>
                  <p className="text-xs text-text-muted">Serat</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFoods.length === 0 && (
        <div className="text-center py-12">
          <Apple className="w-16 h-16 text-border mx-auto mb-4" />
          <p className="text-text-muted">
            {search ? "Makanan tidak ditemukan" : "Tidak ada data makanan"}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">
                {editingId ? "Edit Makanan" : "Tambah Makanan Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="label">Nama Makanan</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <label className="label">Kalori (kkal)</label>
                  <input
                    type="number"
                    value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
                    className="input-field"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Protein (g)</label>
                  <input
                    type="number"
                    value={form.protein}
                    onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
                    className="input-field"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Karbohidrat (g)</label>
                  <input
                    type="number"
                    value={form.carbs}
                    onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
                    className="input-field"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Lemak (g)</label>
                  <input
                    type="number"
                    value={form.fat}
                    onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })}
                    className="input-field"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Serat (g)</label>
                  <input
                    type="number"
                    value={form.fiber}
                    onChange={(e) => setForm({ ...form, fiber: Number(e.target.value) })}
                    className="input-field"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Porsi (g)</label>
                  <input
                    type="number"
                    value={form.portionSize}
                    onChange={(e) => setForm({ ...form, portionSize: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">Kategori</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                  placeholder="makanan pokok, lauk, sayur, buah, minuman"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
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
      )}
      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Hapus Makanan</h3>
            <p className="text-text-muted text-center mb-6">
              Apakah Anda yakin ingin menghapus <span className="font-medium text-text">{deleteDialog.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDialog({ open: false, id: null, name: "" })}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}