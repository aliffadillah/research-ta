import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_OMPRENGAN = process.env.API_OMPRENGAN || "";
const API_KEY_OMPRENGAN = process.env.API_KEY_OMPRENGAN || "";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { foodClass } = body;

    if (!foodClass) {
      return NextResponse.json({ error: "Food class required" }, { status: 400 });
    }

    // Call external nutrition API
    if (!API_OMPRENGAN) {
      return NextResponse.json({ error: "Nutrition service not configured" }, { status: 500 });
    }

    const response = await fetch(API_OMPRENGAN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY_OMPRENGAN,
      },
      body: JSON.stringify({
        class_name: foodClass,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nutrition API Error:", response.status, errorText);
      return NextResponse.json(
        { error: "Nutrition service error" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      foodClass,
      nutrition: {
        calories: data.calories || 100,
        protein: data.protein || 3,
        carbs: data.carbs || 15,
        fat: data.fat || 3,
        fiber: data.fiber || 1,
      },
    });

  } catch (error) {
    console.error("Nutrition fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition data" },
      { status: 500 }
    );
  }
}