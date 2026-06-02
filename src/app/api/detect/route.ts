import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const API_MENU = process.env.API_MENU || "";
const API_KEY_ULTRALYTICS = process.env.API_KEY_ULTRALYTICS || "";

type NormalizedDetection = {
  class: string;
  confidence: number;
  bbox?: { x1: number; y1: number; x2: number; y2: number };
};

// Parse Ultralytics Platform API response
// Format: {"images": [{"shape": [...], "results": [...]}]}
function parseUltralyticsResponse(data: unknown): NormalizedDetection[] {
  const detections: NormalizedDetection[] = [];

  if (!data || typeof data !== "object") return detections;

  const payload = data as Record<string, unknown>;

  // Handle images array (Ultralytics format)
  const images = payload.images;
  if (Array.isArray(images) && images.length > 0) {
    for (const img of images) {
      if (!img || typeof img !== "object") continue;
      const imageData = img as Record<string, unknown>;
      const results = imageData.results;

      if (Array.isArray(results)) {
        for (const result of results) {
          if (!result || typeof result !== "object") continue;
          const r = result as Record<string, unknown>;

          // Get class name
          const className = (r.name as string) || String(r.class ?? "");
          const confidence = Number(r.confidence ?? r.conf ?? r.score ?? 0);

          // Get bounding box
          let bbox: { x1: number; y1: number; x2: number; y2: number } | undefined;
          const box = r.box;
          if (box && typeof box === "object") {
            const boxObj = box as Record<string, unknown>;
            if (typeof boxObj.x1 === "number" && typeof boxObj.y1 === "number" &&
                typeof boxObj.x2 === "number" && typeof boxObj.y2 === "number") {
              bbox = {
                x1: boxObj.x1 as number,
                y1: boxObj.y1 as number,
                x2: boxObj.x2 as number,
                y2: boxObj.y2 as number,
              };
            }
          }

          if (className) {
            detections.push({ class: className, confidence, bbox });
          }
        }
      }
    }
  }

  return detections;
}

const toPercent = (value: number) => {
  if (Number.isNaN(value)) return 0;
  return value > 1 ? value : value * 100;
};

const buildPredictUrl = (baseUrl: string) => {
  if (!baseUrl) return "";
  if (baseUrl.endsWith("/predict")) return baseUrl;
  return `${baseUrl.replace(/\/$/, "")}/predict`;
};

// Convert base64 to Blob for file upload
function base64ToBlob(base64: string, mimeType: string = "image/jpeg"): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Match detected food name with database foods
async function matchFoodFromDB(foodName: string) {
  const foods = await prisma.food.findMany();
  const normalized = foodName.toLowerCase().trim();

  // 1. Exact match
  let match = foods.find((f) => f.name.toLowerCase() === normalized);

  // 2. Contains match
  if (!match) {
    match = foods.find(
      (f) =>
        normalized.includes(f.name.toLowerCase()) ||
        f.name.toLowerCase().includes(normalized)
    );
  }

  // 3. Partial word match
  if (!match) {
    const words = normalized.split(/\s+/);
    match = foods.find((f) => {
      const foodNameLower = f.name.toLowerCase();
      return words.some(
        (word) => word.length > 2 && foodNameLower.includes(word)
      );
    });
  }

  if (!match) {
    return {
      dbFood: null,
      nutrition: null,
      source: "unmatched" as const,
    };
  }

  return {
    dbFood: match,
    nutrition: {
      calories: match.calories,
      protein: match.protein,
      carbs: match.carbs,
      fat: match.fat,
      fiber: match.fiber,
    },
    source: "database" as const,
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    if (!API_MENU || !API_KEY_ULTRALYTICS) {
      return NextResponse.json(
        { error: "Menu API not configured" },
        { status: 500 }
      );
    }

    const hasDataPrefix = image.startsWith("data:");
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");

    if (cleanBase64.length < 100) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    // Use clean base64 (without data URL prefix)
    const imageData = hasDataPrefix ? cleanBase64 : image;

    console.log("[Menu API] Calling...", API_MENU);

    // Call Menu API
    const form = new FormData();
    const imageBlob = base64ToBlob(imageData);
    form.append("file", imageBlob, "image.jpg");
    form.append("conf", "0.25");
    form.append("iou", "0.7");
    form.append("imgsz", "640");

    const response = await fetch(buildPredictUrl(API_MENU), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY_ULTRALYTICS}`,
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[Menu API] Error:", response.status, errorText);
      return NextResponse.json(
        { error: "Menu API error", details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log("[Menu API] Raw response:", JSON.stringify(data).slice(0, 1000));

    const rawDetections = parseUltralyticsResponse(data);
    console.log("[Menu API] Parsed detections:", rawDetections.length);

    // Build predictions with database nutrition
    let predictions: {
      class: string;
      confidence: number;
      nutrition?: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
      source: string;
      foodId: string | null;
      bbox?: { x1: number; y1: number; x2: number; y2: number };
    }[] = [];

    for (const det of rawDetections) {
      const confidencePercent = parseFloat(toPercent(det.confidence).toFixed(2));
      const matched = await matchFoodFromDB(det.class);
      predictions.push({
        class: det.class,
        confidence: confidencePercent,
        nutrition: matched.nutrition || undefined,
        source: matched.source,
        foodId: matched.dbFood?.id || null,
        bbox: det.bbox,
      });
    }

    console.log("[Detect] Final predictions:", predictions.length, predictions);

    return NextResponse.json({
      success: true,
      predictions,
      apiSource: "menu_api",
      totalDetections: predictions.length,
    });

  } catch (error) {
    console.error("Detection error:", error);
    return NextResponse.json({ error: "Detection failed" }, { status: 500 });
  }
}