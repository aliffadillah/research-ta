"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Camera, UtensilsCrossed, TrendingUp, Sparkles, Shield, ArrowRight, Check, Play, Users, Heart, Leaf, Zap } from "lucide-react";
import Link from "next/link";

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

// Magnetic Button Component
function MagneticButton({ children, href, variant = "primary" }: { children: React.ReactNode; href: string; variant?: "primary" | "secondary" }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-medium transition-all duration-300 ${
          variant === "primary"
            ? "bg-primary text-white hover:bg-primary-light shadow-lift"
            : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white"
        }`}
      >
        {children}
      </Link>
    </motion.div>
  );
}

// Floating Food Particles
function FloatingFoods() {
  const foods = ["🍚", "🥗", "🍗", "🍎", "🥛", "🍌", "🥩", "🥬", "🌽", "🍠"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {foods.map((food, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-15"
          initial={{ y: "100vh", x: `${10 + (i * 10)}%` }}
          animate={{ y: "-100px", rotate: [0, 360] }}
          transition={{
            duration: 8 + (i % 4),
            repeat: Infinity,
            delay: i * 0.8,
            ease: "linear",
          }}
        >
          {food}
        </motion.div>
      ))}
    </div>
  );
}

// Animated Gradient Blob
function AnimatedBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px]"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 40, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[20%] w-[700px] h-[700px] rounded-full bg-green-500/10 blur-[150px]"
        animate={{
          x: [0, 30, -50, 0],
          y: [0, -20, 40, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}

// Feature Card with hover animation
function FeatureCard({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, boxShadow: "0 20px 40px -20px rgba(45, 90, 39, 0.2)" }}
      className="group p-8 rounded-3xl bg-white border border-border/50 hover:border-primary/30 transition-all duration-500 cursor-pointer"
    >
      <motion.div
        className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors"
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="w-8 h-8 text-primary" />
      </motion.div>
      <h3 className="font-display text-xl mb-3">{title}</h3>
      <p className="text-text-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Step Card with connecting line
function StepCard({ number, title, description, index }: { number: string; title: string; description: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="relative"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: index * 0.2 + 0.3 }}
        viewport={{ once: true }}
        className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-mono text-2xl font-bold mb-6 shadow-lg"
      >
        {number}
      </motion.div>
      {index < 2 && (
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
          viewport={{ once: true }}
          className="hidden md:block absolute top-8 -right-8 w-16 h-0.5 bg-gradient-to-r from-primary to-transparent"
        />
      )}
      <h3 className="font-display text-2xl mb-4">{title}</h3>
      <p className="text-text-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Stats counter
function StatCounter({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-8 rounded-3xl border border-border/50 ${color}`}
    >
      <motion.p
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        viewport={{ once: true }}
        className="font-mono text-5xl font-bold mb-2"
      >
        {value}
      </motion.p>
      <p className="text-text-muted">{label}</p>
    </motion.div>
  );
}

// Animated UI Mockup
function UIMockup() {
  const [detectedFood, setDetectedFood] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDetectedFood(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] p-8 border border-border/50 overflow-hidden">
        <motion.div
          className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center space-y-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Camera className="w-12 h-12 text-primary" />
              </motion.div>
              <p className="text-text-muted">Arahkan kamera ke makanan</p>
            </motion.div>
          </div>

          {/* Scan line animation */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Detection Result */}
          <AnimatePresence mode="wait">
            {detectedFood && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 border border-white/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"
                >
                  <Check className="w-6 h-6 text-green-600" />
                </motion.div>
                <div className="flex-1">
                  <p className="font-medium text-text">Nasi Goreng Kampung</p>
                  <p className="text-sm text-text-muted">542 kkal | 18g protein | 72g karbo</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { value: "2,100", label: "kkal/hari", color: "text-primary" },
            { value: "68%", label: "terpenuhi", color: "text-accent" },
            { value: "672", label: "sisa kkal", color: "text-text" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="p-4 bg-bg rounded-xl text-center"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <p className={`font-mono text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Cards */}
      <motion.div
        className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-border/50"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-medium text-sm">Rekomendasi Menu</p>
            <p className="text-xs text-text-muted">Sesuai AKG</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-border/50"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Tren Membaik</p>
            <p className="text-xs text-green-600">+12% minggu ini</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const features = [
    { icon: Camera, title: "Deteksi Cerdas", description: "Pindai makanan dengan kamera dan AI akan mengenali serta menghitung nutrisi secara otomatis" },
    { icon: UtensilsCrossed, title: "Pantau Gizi Harian", description: "Lacak asupan harian dengan visualisasi real-time sesuai standar AKG Indonesia" },
    { icon: TrendingUp, title: "Analisis Tren", description: "Pantau perkembangan nutrisi dari waktu ke waktu dengan grafik interaktif" },
    { icon: Sparkles, title: "Rekomendasi Menu", description: "Dapatkan saran menu harian yang sesuai dengan kebutuhan gizi Anda" },
  ];

  const benefits = [
    { icon: Check, text: "Standar AKG Indonesia yang akurat" },
    { icon: Check, text: "AI deteksi makanan real-time" },
    { icon: Check, text: "Riwayat nutrisi lengkap" },
    { icon: Check, text: "Gratis untuk program Makan Bergizi Gratis" },
  ];

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      <AnimatedBlobs />
      <FloatingFoods />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl">Makan Bergizi</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            {["Fitur", "Tentang", "Cara Pakai"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-text-muted hover:text-primary transition-colors"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <Link href="/login" className="text-text-muted hover:text-primary transition-colors font-medium">
              Masuk
            </Link>
            <MagneticButton href="/register" variant="primary">
              Daftar Gratis
            </MagneticButton>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 min-h-[100dvh] flex items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              Program Makan Bergizi Gratis
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1]"
            >
              Deteksi Nutrisi
              <motion.span
                className="text-primary block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Makanan Instan
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-text-muted leading-relaxed max-w-lg"
            >
              Sistem pelacakan nutrisi berbasis AI untuk mendukung program Makan Bergizi Gratis.
              Pindai, hitung, dan pantau asupan gizi harian Anda dengan mudah.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton href="/register" variant="primary">
                <>
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5" />
                </>
              </MagneticButton>
              <motion.a
                href="#cara-pakai"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-medium border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-4 h-4" />
                Lihat Demo
              </motion.a>
            </motion.div>
          </div>

          <UIMockup />
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-4">Fitur Unggulan</h2>
            <p className="text-text-muted text-lg">
              Teknologi AI untuk membantu Anda memantau dan mengoptimalkan asupan gizi harian
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-pakai" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-4">Cara Kerja</h2>
            <p className="text-text-muted text-lg">
              Tiga langkah mudah untuk mulai memantau nutrisi Anda
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <StepCard number="01" title="Daftar & Login" description="Buat akun gratis dan masuk ke dashboard untuk mulai memantau nutrisi Anda" index={0} />
            <StepCard number="02" title="Pindai Makanan" description="Gunakan kamera atau upload foto makanan, AI akan mengenali dan menghitung nutrisi" index={1} />
            <StepCard number="03" title="Pantau & Analisis" description="Lihat progress harian, analisis tren nutrisi, dan dapatkan rekomendasi menu" index={2} />
          </div>
        </div>
      </section>

      {/* Benefits & Stats */}
      <section id="tentang" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-4">
                  Dirancang untuk<br />
                  <span className="text-primary">Kebutuhan Indonesia</span>
                </h2>
                <p className="text-text-muted text-lg leading-relaxed">
                  Sistem kami menggunakan standar Angka Kecukupan Gizi (AKG) Indonesia
                  untuk memberikan rekomendasi yang akurat dan relevan.
                </p>
              </motion.div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      viewport={{ once: true }}
                      className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-5 h-5 text-green-600" />
                    </motion.div>
                    <span className="font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                <MagneticButton href="/register" variant="primary">
                  <>
                    Mulai Perjalanan Gizi Anda
                    <ArrowRight className="w-5 h-5" />
                  </>
                </MagneticButton>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <StatCounter value="2,100" label="kkal target harian" color="bg-primary/5" />
              <StatCounter value="60g" label="protein harian" color="bg-accent/5" />
              <StatCounter value="300g" label="karbohidrat harian" color="bg-bg" />
              <StatCounter value="70g" label="lemak harian" color="bg-primary/5" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-12 md:p-16 text-white relative overflow-hidden"
          >
            {/* Decorative elements */}
            <motion.div
              className="absolute top-0 left-0 w-80 h-80 bg-white rounded-full opacity-10"
              animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full opacity-10"
              animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
              transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            />

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-8"
              >
                <UtensilsCrossed className="w-10 h-10" />
              </motion.div>

              <h2 className="font-display text-4xl md:text-5xl mb-6">
                Siap Mulai?
                <motion.span
                  className="block text-accent"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Bergerak Menuju Gizi Lebih Baik
                </motion.span>
              </h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="text-white/80 text-lg mb-8 max-w-xl mx-auto"
              >
                Bergabung dengan ratusan pengguna yang sudah mulai memantau dan meningkatkan
                kualitas gizi mereka setiap hari.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center gap-4"
              >
                <MagneticButton href="/register" variant="primary">
                  <>
                    Daftar Gratis Sekarang
                    <ArrowRight className="w-5 h-5" />
                  </>
                </MagneticButton>
                <motion.a
                  href="/login"
                  className="inline-flex items-center gap-2 bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-2xl font-medium hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sudah punya akun?
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl">Makan Bergizi</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-6"
            >
              {["Kebijakan Privasi", "Syarat & Ketentuan", "Kontak"].map((link) => (
                <a key={link} href="#" className="text-text-muted hover:text-primary transition-colors">
                  {link}
                </a>
              ))}
            </motion.div>

            <p className="text-text-muted text-sm">
              Program Makan Bergizi Gratis 2026
            </p>
          </div>
        </div>
      </footer>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}