import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: Record<string, unknown> = { userId: session.user.id };

    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const logs = await prisma.dailyLog.findMany({
      where,
      include: {
        detections: {
          include: {
            food: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Transform to summary format
    const summary = logs.map((log) => {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;

      log.detections.forEach((detection) => {
        const mlPrediction = detection.mlPrediction as { nutrition?: { calories: number; protein: number; carbs: number; fat: number; fiber: number } } | null;
        const nutrition = mlPrediction?.nutrition;
        if (nutrition) {
          const multiplier = detection.portionSize / 100;
          totalCalories += nutrition.calories * multiplier;
          totalProtein += nutrition.protein * multiplier;
          totalCarbs += nutrition.carbs * multiplier;
          totalFat += nutrition.fat * multiplier;
          totalFiber += nutrition.fiber * multiplier;
        }
      });

      return {
        date: log.date,
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        totalFiber: Math.round(totalFiber * 10) / 10,
        mealCount: log.detections.length,
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}