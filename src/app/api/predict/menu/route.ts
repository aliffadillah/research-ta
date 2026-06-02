/**
 * Next.js API Route: /api/predict/menu
 *
 * Endpoint untuk mendapatkan rekomendasi menu berdasarkan standar gizi Indonesia
 * Uses static nutrition standards (no external service required)
 */

import { NextResponse } from "next/server";
import { getNutritionStandards, getRecommendedPortion } from "@/lib/nutrition-standards";

export const dynamic = "force-dynamic";

interface PredictedNeeds {
  karbohidrat_besar: number;
  protein_besar: number;
  lemak_besar: number;
  serat_besar: number;
  energi_besar: number;
  karbohidrat_kecil: number;
  protein_kecil: number;
  lemak_kecil: number;
  serat_kecil: number;
  energi_kecil: number;
}

interface MenuRecommendation {
  menu_id: string;
  menu_name: string;
  match_score: number;
  portion: string;
  nutrition: {
    energi: number;
    protein: number;
    karbohidrat: number;
    lemak: number;
    serat: number;
  };
  reason: string;
}

/**
 * GET /api/predict/menu
 * Get nutrition standards and portion recommendations
 *
 * Query params:
 * - portion: preferred portion "besar" or "kecil" (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const portion = searchParams.get("portion") as "besar" | "kecil" | null;

    const standards = getNutritionStandards();
    const recommendedPortion = portion || getRecommendedPortion(standards.daily.energi);
    const portionData = recommendedPortion === "besar" ? standards.portion.besar : standards.portion.kecil;

    return NextResponse.json({
      success: true,
      data: {
        predicted_needs: {
          karbohidrat_besar: standards.portion.besar.karbohidrat,
          protein_besar: standards.portion.besar.protein,
          lemak_besar: standards.portion.besar.lemak,
          serat_besar: standards.portion.besar.serat,
          energi_besar: standards.portion.besar.energi,
          karbohidrat_kecil: standards.portion.kecil.karbohidrat,
          protein_kecil: standards.portion.kecil.protein,
          lemak_kecil: standards.portion.kecil.lemak,
          serat_kecil: standards.portion.kecil.serat,
          energi_kecil: standards.portion.kecil.energi,
        },
        recommended_portion: recommendedPortion,
        confidence: 1.0,
        history_days: 0,
        recommendations: [],
      },
    });
  } catch (error) {
    console.error("Menu prediction API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/predict/menu
 * Direct menu recommendation with provided predicted needs
 *
 * Body:
 * {
 *   "predicted_needs": { karbohidrat_besar, protein_besar, ..., energi_kecil },
 *   "portion": "besar" | "kecil" (optional)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { predicted_needs, portion } = body as {
      predicted_needs: PredictedNeeds;
      portion?: "besar" | "kecil";
    };

    if (!predicted_needs) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "predicted_needs is required",
        },
        { status: 400 }
      );
    }

    const standards = getNutritionStandards();
    const recommendedPortion = portion || getRecommendedPortion(standards.daily.energi);

    return NextResponse.json({
      success: true,
      data: {
        predicted_needs,
        recommended_portion: recommendedPortion,
        recommendations: [],
      },
    });
  } catch (error) {
    console.error("Menu POST prediction error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}