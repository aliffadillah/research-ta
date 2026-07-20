"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, X, Check, Loader2, AlertCircle, Image, Box, SearchX, Sparkles } from "lucide-react";
import { cn, validateImageFile, fileToBase64 } from "@/lib/utils/helpers";
import DetectionResult from "@/components/food/DetectionResult";
import { SppgMenu, NutritionTarget } from "@/data/sppg-menus";

type DetectionState = "idle" | "preview" | "detecting" | "success" | "error";

const DETECTING_MESSAGES = [
  "Menganalisis Makanan...",
  "Mendeteksi Semua Objek...",
  "Menghitung Kandungan Nutrisi...",
  "Proses Dilakukan...",
  "Tunggu Sebentar...",
  "Sedang Memproses...",
  "Menganalisis Gambar...",
  "Mendeteksi Nutrisi...",
];

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Prediction {
  class: string;
  confidence: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  source?: string;
  foodId?: string | null;
  bbox?: BoundingBox | number[];
  originalClass?: string;
}

interface DebugInfo {
  responseTime: string;
  stage: string;
  hasOmprengan: boolean;
  totalDetections: number;
  predictions: Prediction[];
  rawResponse?: unknown;
}

const getDetectionColor = (index: number) => {
  const colors = [
    "bg-primary",
    "bg-blue-600",
    "bg-green-600",
    "bg-amber-600",
    "bg-purple-600",
    "bg-red-600",
    "bg-cyan-600",
    "bg-orange-600",
  ];
  return colors[index % colors.length];
};

export default function DetectPage() {
  const [state, setState] = useState<DetectionState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [portionSize, setPortionSize] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showAllDetections, setShowAllDetections] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [detectingMessage, setDetectingMessage] = useState(DETECTING_MESSAGES[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [sppgMenus, setSppgMenus] = useState<SppgMenu[]>([]);
  const [lstmNutritionTargetBesar, setLstmNutritionTargetBesar] = useState<NutritionTarget | null>(null);
  const [lstmNutritionTargetKecil, setLstmNutritionTargetKecil] = useState<NutritionTarget | null>(null);
  const [lstmDate, setLstmDate] = useState<string | null>(null);

  // Cycling text effect during detection
  useEffect(() => {
    if (state !== "detecting") return;

    let messageIndex = 0;

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % DETECTING_MESSAGES.length;
      setDetectingMessage(DETECTING_MESSAGES[messageIndex]);
    }, 1500);

    return () => {
      clearInterval(messageInterval);
    };
  }, [state]);

  // Fetch SPPG menus on mount
  useEffect(() => {
    const fetchSppgMenus = async () => {
      try {
        const response = await fetch("/api/sppg-menu");
        if (response.ok) {
          const data = await response.json();
          setSppgMenus(data.menus || []);
        }
      } catch (err) {
        console.error("Failed to fetch SPPG menus:", err);
      }
    };

    fetchSppgMenus();
  }, []);

  // Fetch LSTM daily nutrition on mount
  useEffect(() => {
    const fetchLstmNutrition = async () => {
      try {
        const response = await fetch("/api/lstm-daily-nutrition");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const besar = data.data.besar || {};
            const kecil = data.data.kecil || {};

            // Porsi Besar full daily target
            const besarTarget: NutritionTarget = {
              energi: Math.round(besar.energi || 0),
              protein: Math.round((besar.protein || 0) * 10) / 10,
              karbohidrat: Math.round((besar.karbohidrat || 0) * 10) / 10,
              lemak: Math.round((besar.lemak || 0) * 10) / 10,
              serat: Math.round((besar.serat || 0) * 10) / 10,
            };

            // Porsi Kecil full daily target
            const kecilTarget: NutritionTarget = {
              energi: Math.round(kecil.energi || 0),
              protein: Math.round((kecil.protein || 0) * 10) / 10,
              karbohidrat: Math.round((kecil.karbohidrat || 0) * 10) / 10,
              lemak: Math.round((kecil.lemak || 0) * 10) / 10,
              serat: Math.round((kecil.serat || 0) * 10) / 10,
            };

            setLstmNutritionTargetBesar(besarTarget);
            setLstmNutritionTargetKecil(kecilTarget);
            setLstmDate(data.data.date);
          }
        }
      } catch (err) {
        console.error("Failed to fetch LSTM nutrition:", err);
      }
    };

    fetchLstmNutrition();
  }, []);

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "File tidak valid");
      setState("error");
      return;
    }

    setError(null);
    setDebugInfo(null);
    setPredictions([]);
    setSelectedPrediction(null);
    setSelectedIndex(0);
    setImageDimensions({ width: 0, height: 0 });

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      setImagePreview(e.target?.result as string);
      setState("preview");

      // Convert to base64
      try {
        const base64 = await fileToBase64(file);
        setImageBase64(base64);
      } catch (err) {
        setError("Gagal memproses gambar");
        setState("error");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const detectFood = async (imageBase64: string) => {
    setState("detecting");

    try {
      const startTime = Date.now();
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;

      // Handle API-level errors
      if (!response.ok) {
        throw new Error(data.error || "Deteksi gagal");
      }

      // Ensure predictions is always an array
      const newPredictions = Array.isArray(data.predictions) ? data.predictions : [];

      // Store debug info
      setDebugInfo({
        responseTime: `${elapsed}ms`,
        stage: data.apiSource || "unknown",
        hasOmprengan: false,
        totalDetections: newPredictions.length,
        predictions: newPredictions,
        rawResponse: data,
      });

      setPredictions(newPredictions);
      setSelectedPrediction(newPredictions[0] || null);
      
      if (data.error && newPredictions.length === 0) {
        throw new Error(data.error);
      }

      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setState("error");
    }
  };

  const captureFromCamera = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setImagePreview(imageDataUrl);
    setShowCamera(false);

    // Convert data URL to base64
    const base64 = imageDataUrl.split(",")[1];
    setImageBase64(base64);
    setState("preview");
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      setError("Tidak dapat mengakses kamera");
      setState("error");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleSave = async () => {
    if (!selectedPrediction || !imagePreview) return;

    setSaving(true);

    try {
      const response = await fetch("/api/detections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imagePreview,
          predictedClass: selectedPrediction.class,
          confidence: selectedPrediction.confidence,
          portionSize,
          mlPrediction: selectedPrediction,
          foodId: selectedPrediction.foodId,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setState("idle");
    setImagePreview(null);
    setImageBase64(null);
    setPredictions([]);
    setSelectedPrediction(null);
    setPortionSize(100);
    setError(null);
    setDebugInfo(null);
    setSaved(false);
    setSelectedIndex(0);
  };

  const handleStartDetect = async () => {
    if (!imageBase64) return;
    await detectFood(imageBase64);
  };

  // Extract bbox from prediction
  const extractBbox = (pred: Prediction): BoundingBox | null => {
    const raw = pred.bbox;
    if (!raw) return null;
    if (Array.isArray(raw) && raw.length === 4) {
      return { x1: raw[0], y1: raw[1], x2: raw[2], y2: raw[3] };
    }
    if (typeof raw === "object" && "x1" in raw) {
      return raw as BoundingBox;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-sans mb-2">Deteksi Makanan</h1>
        <p className="text-text-muted text-sm md:text-base">
          Upload atau pindai foto makanan untuk mengetahui kandungan nutrisinya
        </p>
      </div>

      {/* Upload Area */}
      {(state === "idle" || state === "error") && (
        <div
          className={cn(
            "card border-2 border-dashed transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : state === "error"
              ? "border-red-300"
              : "border-border hover:border-primary"
          )}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !showCamera && fileInputRef.current?.click()}
        >
          {state === "error" && error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="text-center py-8 md:py-12">
            <div className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-all",
              isDragging ? "bg-primary/20 scale-110" : "bg-primary/10"
            )}>
              {isDragging ? (
                <Upload className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              ) : (
                <Camera className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              )}
            </div>

            <h2 className="text-lg md:text-xl font-semibold mb-2">
              {showCamera ? "Ambil Foto" : isDragging ? "Lepaskan file di sini" : "Unggah Foto Makanan"}
            </h2>
            <p className="text-text-muted mb-6 text-sm md:text-base">
              {showCamera ? "Arahkan kamera ke makanan" : "Drag & drop atau pilih dari galeri (Maks. 5MB)"}
            </p>

            {showCamera ? (
              <div className="relative max-w-md mx-auto mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-xl"
                />
              </div>
            ) : (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {showCamera ? (
                <>
                  <button onClick={captureFromCamera} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Camera className="w-5 h-5" />
                    Ambil Foto
                  </button>
                  <button onClick={stopCamera} className="btn-secondary w-full sm:w-auto">
                    Batal
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Upload className="w-5 h-5" />
                    Pilih File
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); startCamera(); }}
                    className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Camera className="w-5 h-5" />
                    Buka Kamera
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview State */}
      {state === "preview" && (
        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-semibold mb-2">Pratinjau Gambar</h2>
            <p className="text-text-muted text-sm">Pastikan gambar sudah benar sebelum mendeteksi</p>
          </div>

          <div className="relative max-w-md mx-auto mb-6 rounded-2xl overflow-hidden bg-gray-100">
            {imagePreview && (
              <img
                ref={imageRef}
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto"
                onLoad={handleImageLoad}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={reset} className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
              <X className="w-5 h-5" />
              Batal
            </button>
            <button
              onClick={handleStartDetect}
              disabled={!imageBase64}
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5" />
              Deteksi Makanan
            </button>
          </div>
        </div>
      )}

      {/* Detecting State */}
      {state === "detecting" && (
        <div className="card text-center py-12 md:py-16">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 relative">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Food"
                className="w-full h-full object-cover rounded-xl"
              />
            )}
            <div className="absolute inset-0 bg-primary/40 rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-base md:text-lg font-medium mb-2 text-gray-700">
            {detectingMessage}
          </h2>
          <p className="text-sm text-gray-500">Mohon tunggu...</p>
        </div>
      )}

      {/* Success State - No Detections */}
      {(state === "success" || saved) && predictions.length === 0 && (
        <div className="card text-center py-12 md:py-16">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
            <SearchX className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">Tidak Ada yang Terdeteksi</h2>
          <p className="text-text-muted mb-6 text-sm md:text-base px-2">
            Tidak ada objek makanan yang terdeteksi dalam gambar ini. Coba gunakan gambar lain dengan makanan yang lebih jelas.
          </p>
          <button onClick={reset} className="btn-primary">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Success State - Has Detections */}
      {(state === "success" || saved) && predictions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left: Image with Bounding Boxes */}
          <div className="space-y-4">
            <div className="card-static">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h3 className="font-semibold text-sm md:text-base">Gambar dengan Bounding Box</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="px-2 md:px-3 py-1 bg-primary text-white rounded-lg text-xs md:text-sm font-medium">
                    {predictions.length} deteksi
                  </span>
                  <button onClick={reset} className="btn-secondary text-xs md:text-sm py-1.5 px-2 md:px-3 flex-shrink-0">
                    Reset
                  </button>
                </div>
              </div>

              {/* Image with Bounding Boxes Overlay */}
              <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 touch-none">
                {imagePreview && (
                  <img
                    ref={imageRef}
                    src={imagePreview}
                    alt="Detected"
                    className="w-full h-auto"
                    onLoad={handleImageLoad}
                  />
                )}

                {/* Bounding Boxes with food name labels */}
                {predictions.map((pred, index) => {
                  const bbox = extractBbox(pred);
                  if (!bbox || imageDimensions.width === 0) return null;

                  // Normalize coordinates to percentage
                  const left = (bbox.x1 / imageDimensions.width) * 100;
                  const top = (bbox.y1 / imageDimensions.height) * 100;
                  const width = ((bbox.x2 - bbox.x1) / imageDimensions.width) * 100;
                  const height = ((bbox.y2 - bbox.y1) / imageDimensions.height) * 100;

                  return (
                    <div
                      key={index}
                      className={cn(
                        "absolute border-2 transition-all cursor-pointer",
                        selectedIndex === index ? "opacity-100" : "opacity-70"
                      )}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        borderColor: selectedIndex === index ? getDetectionColor(index) : "#6b7280",
                        backgroundColor: `${selectedIndex === index ? getDetectionColor(index) : "#6b7280"}15`,
                      }}
                      onClick={() => {
                        setSelectedIndex(index);
                        setSelectedPrediction(pred);
                      }}
                    >
                      {/* Food name label */}
                      <div
                        className={cn(
                          "absolute left-0 px-2 py-1 text-xs font-medium text-white rounded-br shadow",
                          getDetectionColor(index)
                        )}
                        style={{ maxWidth: "100%" }}
                      >
                        <span className="block whitespace-normal break-words">{pred.class}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Full Detection Results */}
          <div className="space-y-4">
            <DetectionResult
              predictions={predictions}
              selectedPrediction={selectedPrediction}
              onSelectPrediction={(pred) => {
                setSelectedPrediction(pred);
                const idx = predictions.indexOf(pred);
                if (idx !== -1) setSelectedIndex(idx);
              }}
              imageWidth={imageDimensions.width}
              imageHeight={imageDimensions.height}
              portionSize={portionSize}
              sppgMenus={sppgMenus}
              nutritionTargetBesar={lstmNutritionTargetBesar}
              nutritionTargetKecil={lstmNutritionTargetKecil}
              targetDate={lstmDate}
            />
          </div>
        </div>
      )}
    </div>
  );
}