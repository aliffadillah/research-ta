import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's log
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      include: {
        detections: {
          include: {
            food: true,
          },
        },
      },
    });

    if (!dailyLog) {
      return NextResponse.json({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        mealCount: 0,
      });
    }

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    dailyLog.detections.forEach((detection) => {
      const mlPrediction = detection.mlPrediction as { nutrition?: { calories: number; protein: number; carbs: number; fat: number; fiber: number } } | null;
      const nutrition = mlPrediction?.nutrition;
      if (nutrition) {
        const multiplier = detection.portionSize / 100;
        totalCalories += nutrition.calories * multiplier;
        totalProtein += nutrition.protein * multiplier;
        totalCarbs += nutrition.carbs * multiplier;
        totalFat += nutrition.fat * multiplier;
        totalFiber += nutrition.fiber * multiplier;
      } else if (detection.food) {
        const multiplier = detection.portionSize / detection.food.portionSize;
        totalCalories += detection.food.calories * multiplier;
        totalProtein += detection.food.protein * multiplier;
        totalCarbs += detection.food.carbs * multiplier;
        totalFat += detection.food.fat * multiplier;
        totalFiber += detection.food.fiber * multiplier;
      }
    });

    return NextResponse.json({
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalFiber: Math.round(totalFiber * 10) / 10,
      mealCount: dailyLog.detections.length,
    });
  } catch (error) {
    console.error("Daily summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily summary" },
      { status: 500 }
    );
  }
}