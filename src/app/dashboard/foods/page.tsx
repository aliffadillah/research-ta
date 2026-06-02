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

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus makanan ini?")) return;

    try {
      const res = await fetch(`/api/foods-crud?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchFoods();
    } catch (err) {
      console.error("Delete error:", err);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Daftar Makanan</h1>
          <p className="text-text-muted">
            {foods.length} jenis makanan dengan kandungan gizi
          </p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tambah Makanan
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map((food) => (
          <div key={food.id} className="card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Apple className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{food.name}</h3>
                    <p className="text-sm text-text-muted">
                      {food.portionSize}
                      {food.portionUnit}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(food)}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(food.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <p className="nutrition-value text-primary">{Math.round(food.calories)}</p>
                  <p className="text-xs text-text-muted">Kalori</p>
                </div>
                <div>
                  <p className="nutrition-value">{food.protein.toFixed(1)}g</p>
                  <p className="text-xs text-text-muted">Protein</p>
                </div>
                <div>
                  <p className="nutrition-value">{food.carbs.toFixed(1)}g</p>
                  <p className="text-xs text-text-muted">Karbo</p>
                </div>
                <div>
                  <p className="nutrition-value">{food.fat.toFixed(1)}g</p>
                  <p className="text-xs text-text-muted">Lemak</p>
                </div>
                <div>
                  <p className="nutrition-value">{food.fiber.toFixed(1)}g</p>
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
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Makanan" : "Tambah Makanan Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex justify-end gap-3 pt-4">
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