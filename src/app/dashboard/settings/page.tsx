"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  User,
  Target,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  dailyGoal: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  } | null;
}

interface FormState {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface GoalsState {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface NotificationState {
  mealReminder: boolean;
  targetAchieved: boolean;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

const DEFAULT_GOALS: GoalsState = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
  fiber: 25,
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });

  // Form states
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [goals, setGoals] = useState<GoalsState>(DEFAULT_GOALS);
  const [notifications, setNotifications] = useState<NotificationState>({
    mealReminder: false,
    targetAchieved: true,
  });

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password section toggle
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const user = data.user as UserProfile;

          setForm((prev) => ({
            ...prev,
            name: user.name || "",
            email: user.email,
          }));

          if (user.dailyGoal) {
            setGoals(user.dailyGoal);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        showToast("Gagal memuat data profil", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Show toast notification
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Password validation (only if changing password)
    if (form.newPassword) {
      if (!form.currentPassword) {
        newErrors.currentPassword = "Password saat ini wajib diisi";
      }
      if (form.newPassword.length < 8) {
        newErrors.newPassword = "Password minimal 8 karakter";
      }
      if (form.newPassword !== form.confirmPassword) {
        newErrors.confirmPassword = "Konfirmasi password tidak cocok";
      }
    }

    // Goals validation
    if (goals.calories < 500 || goals.calories > 10000) {
      newErrors.calories = "Kalori harus antara 500 - 10000";
    }
    if (goals.protein < 0 || goals.protein > 500) {
      newErrors.protein = "Protein harus antara 0 - 500 gram";
    }
    if (goals.carbs < 0 || goals.carbs > 1000) {
      newErrors.carbs = "Karbohidrat harus antara 0 - 1000 gram";
    }
    if (goals.fat < 0 || goals.fat > 500) {
      newErrors.fat = "Lemak harus antara 0 - 500 gram";
    }
    if (goals.fiber < 0 || goals.fiber > 200) {
      newErrors.fiber = "Serat harus antara 0 - 200 gram";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      showToast("Mohon perbaiki kesalahan pada form", "error");
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
          dailyGoal: goals,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Gagal menyimpan perubahan", "error");
        return;
      }

      // Reset password fields on success
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setShowPasswordSection(false);

      showToast("Pengaturan berhasil disimpan!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle goals change
  const handleGoalsChange = (field: keyof GoalsState, value: string) => {
    const numValue = parseFloat(value) || 0;
    setGoals((prev) => ({ ...prev, [field]: numValue }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-border rounded-lg" />
          <div className="h-48 bg-border/50 rounded-2xl" />
          <div className="h-64 bg-border/50 rounded-2xl" />
          <div className="h-48 bg-border/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
            toast.type === "success"
              ? "bg-primary text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          Pengaturan
        </h1>
        <p className="text-text-muted text-sm sm:text-base">
          Atur profil dan target nutrisi harian kamu
        </p>
      </div>

      {/* Profile Section */}
      <section className="card-static">
        <button
          onClick={() => {}}
          className="w-full flex items-center gap-3 mb-6 group"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-text">Profil</h2>
        </button>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">Nama</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`input-field ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
              placeholder="Nama lengkap"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`input-field ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Change Section */}
          <div className="pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="w-full flex items-center justify-between py-2 text-primary font-medium hover:bg-primary/5 rounded-lg px-2 -mx-2 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Ubah Password
              </span>
              {showPasswordSection ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {showPasswordSection && (
              <div className="mt-4 space-y-4 animate-fade-in">
                {/* Current Password */}
                <div>
                  <label className="label">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={form.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      className={`input-field pr-10 ${errors.currentPassword ? "border-red-500" : ""}`}
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="label">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={form.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      className={`input-field pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="label">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`input-field pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      placeholder="Masukkan ulang password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Daily Goals Section */}
      <section className="card-static">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-semibold">Target Nutrisi Harian</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Calories */}
          <div>
            <label className="label">Kalori (kcal)</label>
            <input
              type="number"
              value={goals.calories}
              onChange={(e) => handleGoalsChange("calories", e.target.value)}
              className={`input-field ${errors.calories ? "border-red-500" : ""}`}
              min="500"
              max="10000"
            />
            {errors.calories && (
              <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
            )}
          </div>

          {/* Protein */}
          <div>
            <label className="label">Protein (g)</label>
            <input
              type="number"
              value={goals.protein}
              onChange={(e) => handleGoalsChange("protein", e.target.value)}
              className={`input-field ${errors.protein ? "border-red-500" : ""}`}
              min="0"
              max="500"
            />
            {errors.protein && (
              <p className="text-red-500 text-sm mt-1">{errors.protein}</p>
            )}
          </div>

          {/* Carbs */}
          <div>
            <label className="label">Karbohidrat (g)</label>
            <input
              type="number"
              value={goals.carbs}
              onChange={(e) => handleGoalsChange("carbs", e.target.value)}
              className={`input-field ${errors.carbs ? "border-red-500" : ""}`}
              min="0"
              max="1000"
            />
            {errors.carbs && (
              <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>
            )}
          </div>

          {/* Fat */}
          <div>
            <label className="label">Lemak (g)</label>
            <input
              type="number"
              value={goals.fat}
              onChange={(e) => handleGoalsChange("fat", e.target.value)}
              className={`input-field ${errors.fat ? "border-red-500" : ""}`}
              min="0"
              max="500"
            />
            {errors.fat && (
              <p className="text-red-500 text-sm mt-1">{errors.fat}</p>
            )}
          </div>

          {/* Fiber */}
          <div className="sm:col-span-2">
            <label className="label">Serat (g)</label>
            <input
              type="number"
              value={goals.fiber}
              onChange={(e) => handleGoalsChange("fiber", e.target.value)}
              className={`input-field ${errors.fiber ? "border-red-500" : ""}`}
              min="0"
              max="200"
            />
            {errors.fiber && (
              <p className="text-red-500 text-sm mt-1">{errors.fiber}</p>
            )}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="card-static">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Notifikasi</h2>
        </div>

        <div className="space-y-4">
          {/* Meal Reminder */}
          <label className="flex items-start justify-between gap-4 cursor-pointer group">
            <div className="flex-1">
              <p className="font-medium text-text group-hover:text-primary transition-colors">
                Pengingat Makan
              </p>
              <p className="text-sm text-text-muted">
                Aktifkan notifikasi untuk mengingatkan waktu makan
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.mealReminder}
              onChange={(e) =>
                setNotifications((prev) => ({
                  ...prev,
                  mealReminder: e.target.checked,
                }))
              }
              className="toggle toggle-primary mt-1"
            />
          </label>

          {/* Target Achieved */}
          <label className="flex items-start justify-between gap-4 cursor-pointer group">
            <div className="flex-1">
              <p className="font-medium text-text group-hover:text-primary transition-colors">
                Target Tercapai
              </p>
              <p className="text-sm text-text-muted">
                Notifikasi saat target harian tercapai
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.targetAchieved}
              onChange={(e) =>
                setNotifications((prev) => ({
                  ...prev,
                  targetAchieved: e.target.checked,
                }))
              }
              className="toggle toggle-primary mt-1"
            />
          </label>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full sm:w-auto sm:px-8 flex items-center justify-center gap-2 py-3"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Simpan Pengaturan
          </>
        )}
      </button>

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  );
}
