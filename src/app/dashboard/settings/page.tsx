"use client";

import { useState } from "react";
import { Save, User, Target, Bell, Moon } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
    fiber: 25,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display mb-2">Pengaturan</h1>
        <p className="text-text-muted">
          Atur profil dan target nutrisi harian kamu
        </p>
      </div>

      {/* Profile Section */}
      <div className="card-static">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Profil</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Nama</label>
            <input type="text" className="input-field" placeholder="Nama lengkap" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" placeholder="email@example.com" disabled />
          </div>
        </div>
      </div>

      {/* Daily Goals Section */}
      <div className="card-static">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-semibold">Target Nutrisi Harian</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Kalori (kcal)</label>
            <input
              type="number"
              value={goals.calories}
              onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Protein (g)</label>
            <input
              type="number"
              value={goals.protein}
              onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Karbohidrat (g)</label>
            <input
              type="number"
              value={goals.carbs}
              onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Lemak (g)</label>
            <input
              type="number"
              value={goals.fat}
              onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Serat (g)</label>
            <input
              type="number"
              value={goals.fiber}
              onChange={(e) => setGoals({ ...goals, fiber: Number(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card-static">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Notifikasi</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Pengingat Makan</p>
              <p className="text-sm text-text-muted">Aktifkan notifikasi untuk mengingatkan waktu makan</p>
            </div>
            <input type="checkbox" className="toggle toggle-primary" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Target Tercapai</p>
              <p className="text-sm text-text-muted">Notifikasi saat target harian tercapai</p>
            </div>
            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : saved ? (
          "Tersimpan!"
        ) : (
          <>
            <Save className="w-5 h-5" />
            Simpan Pengaturan
          </>
        )}
      </button>
    </div>
  );
}