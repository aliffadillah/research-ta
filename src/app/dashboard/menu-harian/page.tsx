"use client";

import { useEffect, useState } from "react";
import { Utensils, Flame, Plus, Pencil, Trash2, X, Loader2, ChevronLeft, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface MenuRecommendation {
  id: string;
  name: string;
  description: string | null;
  tanggal: string;
  daftarMenu?: string[];
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
  daftarMenu: [] as string[],
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      daftarMenu: menu.daftarMenu || [],
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

  const avgCaloriesBesar = menus.length > 0
    ? Math.round(menus.reduce((sum, m) => sum + (m.caloriesBesar || 0), 0) / menus.length)
    : 0;

  const avgCaloriesKecil = menus.length > 0
    ? Math.round(menus.reduce((sum, m) => sum + (m.caloriesKecil || 0), 0) / menus.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold mb-1">Menu Harian MBG</h1>
          <p className="text-text-muted text-xs sm:text-sm">
            Kelola menu Makan Bergizi Gratis
          </p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 sm:py-2.5">
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        <div className="card p-3 sm:p-4 md:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-text-muted">Total</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{menus.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-4 md:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-text-muted">Rata BG</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{avgCaloriesBesar}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-4 md:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-text-muted">Rata KCL</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{avgCaloriesKecil}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold">Daftar Menu ({menus.length})</h2>
        </div>

        {menus.length === 0 ? (
          <div className="card p-6 sm:p-8 md:p-12 text-center">
            <Utensils className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-base sm:text-lg font-medium text-text-muted mb-2">Belum ada menu</p>
            <p className="text-text-muted text-xs sm:text-sm mb-4">Tambahkan menu baru untuk memulai</p>
            <button onClick={openNewModal} className="btn-primary mx-auto">
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {menus.map((menu, index) => {
              const isExpanded = expandedId === menu.id;

              return (
                <div
                  key={menu.id}
                  className={cn(
                    "card transition-all duration-300 overflow-hidden",
                    isExpanded && "ring-2 ring-primary"
                  )}
                >
                  {/* SUMMARY VIEW */}
                  {!isExpanded ? (
                    <div className="p-3 sm:p-4 md:p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-xs sm:text-sm">{index + 1}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{menu.name}</h3>
                            {menu.tanggal && (
                              <p className="text-[10px] sm:text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {new Date(menu.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(menu)}
                            className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(menu.id)}
                            className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Nutrition Preview */}
                      <div className="flex gap-1.5 sm:gap-2 mb-3">
                        <div className="flex-1 bg-green-50 rounded-lg p-2 sm:p-3 text-center">
                          <p className="text-[10px] sm:text-xs text-green-600 font-medium">BG</p>
                          <p className="text-base sm:text-xl font-bold text-green-700 leading-tight">{menu.caloriesBesar}</p>
                          <p className="text-[9px] sm:text-[10px] text-green-600">kkal</p>
                        </div>
                        <div className="flex-1 bg-blue-50 rounded-lg p-2 sm:p-3 text-center">
                          <p className="text-[10px] sm:text-xs text-blue-600 font-medium">KCL</p>
                          <p className="text-base sm:text-xl font-bold text-blue-700 leading-tight">{menu.caloriesKecil}</p>
                          <p className="text-[9px] sm:text-[10px] text-blue-600">kkal</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                          <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Menu</p>
                          <p className="text-base sm:text-xl font-bold text-gray-700 leading-tight">{menu.daftarMenu?.length || 0}</p>
                          <p className="text-[9px] sm:text-[10px] text-gray-500">item</p>
                        </div>
                      </div>

                      {/* Daftar Menu Tags */}
                      {menu.daftarMenu && menu.daftarMenu.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] sm:text-xs text-text-muted mb-1.5 sm:mb-2">Daftar Menu:</p>
                          <div className="flex flex-wrap gap-1">
                            {menu.daftarMenu.map((item, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 rounded-full text-[10px] sm:text-xs text-gray-700">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detail Button */}
                      <button
                        onClick={() => setExpandedId(menu.id)}
                        className="w-full py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  ) : (
                    /* DETAIL VIEW */
                    <div className="p-3 sm:p-4 md:p-5">
                      {/* Header with Back Button */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => setExpandedId(null)}
                          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-text-muted hover:text-primary transition-colors"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Kembali</span>
                        </button>
                        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(menu)}
                            className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(menu.id)}
                            className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Menu Title */}
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 truncate">{menu.name}</h3>
                      {menu.tanggal && (
                        <p className="text-[10px] sm:text-xs text-text-muted flex items-center gap-1 mb-3 sm:mb-4">
                          <Calendar className="w-3 h-3" />
                          {new Date(menu.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}

                      {/* Porsi Besar */}
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></span>
                          <h4 className="font-semibold text-green-700 text-xs sm:text-sm">Porsi Besar</h4>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-100">
                          <div className="grid grid-cols-5 gap-1 sm:gap-2">
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-green-600 font-medium">Kkal</p>
                              <p className="text-xs sm:text-sm font-bold text-green-700 leading-tight">{menu.caloriesBesar}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-green-600 font-medium">Prot</p>
                              <p className="text-xs sm:text-sm font-bold text-green-700 leading-tight">{menu.proteinBesar}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-green-600 font-medium">Karbo</p>
                              <p className="text-xs sm:text-sm font-bold text-green-700 leading-tight">{menu.carbsBesar}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-green-600 font-medium">Lemak</p>
                              <p className="text-xs sm:text-sm font-bold text-green-700 leading-tight">{menu.fatBesar}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-green-600 font-medium">Serat</p>
                              <p className="text-xs sm:text-sm font-bold text-green-700 leading-tight">{menu.fiberBesar}g</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Porsi Kecil */}
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></span>
                          <h4 className="font-semibold text-blue-700 text-xs sm:text-sm">Porsi Kecil</h4>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
                          <div className="grid grid-cols-5 gap-1 sm:gap-2">
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-blue-600 font-medium">Kkal</p>
                              <p className="text-xs sm:text-sm font-bold text-blue-700 leading-tight">{menu.caloriesKecil}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-blue-600 font-medium">Prot</p>
                              <p className="text-xs sm:text-sm font-bold text-blue-700 leading-tight">{menu.proteinKecil}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-blue-600 font-medium">Karbo</p>
                              <p className="text-xs sm:text-sm font-bold text-blue-700 leading-tight">{menu.carbsKecil}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-blue-600 font-medium">Lemak</p>
                              <p className="text-xs sm:text-sm font-bold text-blue-700 leading-tight">{menu.fatKecil}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] sm:text-[10px] text-blue-600 font-medium">Serat</p>
                              <p className="text-xs sm:text-sm font-bold text-blue-700 leading-tight">{menu.fiberKecil}g</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* All Menu Items */}
                      {menu.daftarMenu && menu.daftarMenu.length > 0 && (
                        <div className="mb-3 sm:mb-4">
                          <p className="text-[10px] sm:text-xs text-text-muted mb-1.5 sm:mb-2">Daftar Menu:</p>
                          <div className="flex flex-wrap gap-1">
                            {menu.daftarMenu.map((item, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white border border-gray-200 rounded-full text-[10px] sm:text-xs text-gray-700">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {menu.description && (
                        <div className="text-[10px] sm:text-xs text-text-muted bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-100">
                          <span className="font-medium text-gray-700">Deskripsi:</span> {menu.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-border flex items-center justify-between gap-3 z-10">
              <h2 className="text-lg md:text-xl font-semibold">
                {editingId ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg rounded-lg flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5">
              {/* Nama Menu */}
              <div>
                <label className="label text-sm font-medium mb-1.5 block">Nama Menu *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Contoh: Menu MBG Senin"
                  required
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="label text-sm font-medium mb-1.5 block">Tanggal</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              {/* Daftar Menu */}
              <div>
                <label className="label text-sm font-medium mb-1.5 block">Daftar Menu (pisahkan dengan koma)</label>
                <textarea
                  value={form.daftarMenu?.join(", ") || ""}
                  onChange={(e) => setForm({ ...form, daftarMenu: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  className="input-field min-h-[80px] text-sm"
                  placeholder="Apel, Tempe Goreng, Ayam Goreng, Gudeg, Nasi"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="label text-sm font-medium mb-1.5 block">Deskripsi</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Deskripsi singkat menu"
                />
              </div>

              {/* Nutrition Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 pt-2">
                {/* Porsi Besar */}
                <div className="p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                  <h4 className="font-semibold text-green-700 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></span>
                    Porsi Besar
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="label text-xs">Kalori</label>
                      <input
                        type="number"
                        value={form.caloriesBesar}
                        onChange={(e) => setForm({ ...form, caloriesBesar: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Protein</label>
                      <input
                        type="number"
                        value={form.proteinBesar}
                        onChange={(e) => setForm({ ...form, proteinBesar: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Karbo</label>
                      <input
                        type="number"
                        value={form.carbsBesar}
                        onChange={(e) => setForm({ ...form, carbsBesar: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Lemak</label>
                      <input
                        type="number"
                        value={form.fatBesar}
                        onChange={(e) => setForm({ ...form, fatBesar: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs">Serat</label>
                      <input
                        type="number"
                        value={form.fiberBesar}
                        onChange={(e) => setForm({ ...form, fiberBesar: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Porsi Kecil */}
                <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-blue-700 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></span>
                    Porsi Kecil
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="label text-xs">Kalori</label>
                      <input
                        type="number"
                        value={form.caloriesKecil}
                        onChange={(e) => setForm({ ...form, caloriesKecil: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Protein</label>
                      <input
                        type="number"
                        value={form.proteinKecil}
                        onChange={(e) => setForm({ ...form, proteinKecil: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Karbo</label>
                      <input
                        type="number"
                        value={form.carbsKecil}
                        onChange={(e) => setForm({ ...form, carbsKecil: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Lemak</label>
                      <input
                        type="number"
                        value={form.fatKecil}
                        onChange={(e) => setForm({ ...form, fatKecil: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs">Serat</label>
                      <input
                        type="number"
                        value={form.fiberKecil}
                        onChange={(e) => setForm({ ...form, fiberKecil: Number(e.target.value) })}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary w-full sm:w-auto py-2.5">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto py-2.5 flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Simpan Menu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
