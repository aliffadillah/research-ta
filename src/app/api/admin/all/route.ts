import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("[API /admin/all] Session:", session?.user?.id ? "logged in" : "not logged in");

    // Sequential queries instead of parallel to reduce connection pressure
    console.log("[API /admin/all] Fetching users...");
    const users = await prisma.user.findMany({
      include: {
        detections: { take: 5, orderBy: { detectedAt: "desc" } },
        dailyLogs: { take: 5, orderBy: { date: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("[API /admin/all] Users fetched:", users.length);

    console.log("[API /admin/all] Fetching foods...");
    const foods = await prisma.food.findMany({
      orderBy: { name: "asc" },
    });
    console.log("[API /admin/all] Foods fetched:", foods.length);

    console.log("[API /admin/all] Fetching detections...");
    const detections = await prisma.detection.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        food: { select: { id: true, name: true } },
      },
      orderBy: { detectedAt: "desc" },
      take: 100,
    });
    console.log("[API /admin/all] Detections fetched:", detections.length);

    console.log("[API /admin/all] Fetching dailyLogs...");
    const dailyLogs = await prisma.dailyLog.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        detections: { take: 10 },
      },
      orderBy: { date: "desc" },
      take: 50,
    });
    console.log("[API /admin/all] DailyLogs fetched:", dailyLogs.length);

    console.log("[API /admin/all] Fetching menuRecommendations...");
    const menuRecommendations = await prisma.menuRecommendation.findMany({
      orderBy: { tanggal: "asc" },
    });

    console.log("[API /admin/all] Fetching nutritionStandards...");
    const nutritionStandards = await prisma.nutritionStandard.findMany({
      orderBy: [{ gender: "asc" }, { ageGroup: "asc" }],
    });

    console.log("[API /admin/all] Returning response...");
    return NextResponse.json({
      users: {
        count: users.length,
        data: users,
      },
      foods: {
        count: foods.length,
        data: foods,
      },
      detections: {
        count: detections.length,
        data: detections,
      },
      dailyLogs: {
        count: dailyLogs.length,
        data: dailyLogs,
      },
      menuRecommendations: {
        count: menuRecommendations.length,
        data: menuRecommendations,
      },
      nutritionStandards: {
        count: nutritionStandards.length,
        data: nutritionStandards,
      },
      summary: {
        totalUsers: users.length,
        totalFoods: foods.length,
        totalDetections: detections.length,
        totalDailyLogs: dailyLogs.length,
        totalMenuRecommendations: menuRecommendations.length,
        totalNutritionStandards: nutritionStandards.length,
      },
    });
  } catch (error) {
    console.error("[API /admin/all] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
