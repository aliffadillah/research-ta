/**
 * Next.js API Route: /api/predict
 * Returns nutrition standards (no external service required)
 */

import { NextResponse } from "next/server";
import { getNutritionStandards, getRecommendedPortion } from "@/lib/nutrition-standards";

export const dynamic = "force-dynamic";

/**
 * GET /api/predict
 * Returns Indonesian nutrition standards based on AKG
 *
 * Response includes daily standards and recommended portion
 */
export async function GET(request: Request) {
  try {
    const standards = getNutritionStandards();
    const recommendedPortion = getRecommendedPortion(standards.daily.energi);
    const portion = recommendedPortion === "besar" ? standards.portion.besar : standards.portion.kecil;

    // Get optional date parameter for future flexibility
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    return NextResponse.json({
      success: true,
      data: {
        prediction_date: date || new Date().toISOString().split("T")[0],
        data_until_date: new Date().toISOString().split("T")[0],
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
        history_days: 0,
        recommended_portion: recommendedPortion,
        confidence: 1.0,
        message: "Based on Indonesian Nutrition Standards (AKG)",
      },
      standards: {
        daily: standards.daily,
        portion: portion,
      },
    });
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}