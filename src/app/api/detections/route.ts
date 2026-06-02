import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      imageUrl,
      predictedClass,
      confidence,
      portionSize,
      mlPrediction,
      foodId,
    } = body;

    // Get or create today's log
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (!dailyLog) {
      dailyLog = await prisma.dailyLog.create({
        data: {
          userId: session.user.id,
          date: today,
        },
      });
    }

    let resolvedFoodId: string | null = foodId || null;

    if (!resolvedFoodId && predictedClass) {
      const exactMatch = await prisma.food.findFirst({
        where: { name: { equals: predictedClass, mode: "insensitive" } },
      });

      if (exactMatch) {
        resolvedFoodId = exactMatch.id;
      } else {
        const containsMatch = await prisma.food.findFirst({
          where: { name: { contains: predictedClass, mode: "insensitive" } },
        });
        resolvedFoodId = containsMatch?.id || null;
      }
    }

    // Create detection
    const detection = await prisma.detection.create({
      data: {
        imageUrl,
        predictedClass,
        confidence,
        portionSize: portionSize || 100,
        mlPrediction,
        foodId: resolvedFoodId,
        userId: session.user.id,
        dailyLogId: dailyLog.id,
      },
    });

    return NextResponse.json({ detection }, { status: 201 });
  } catch (error) {
    console.error("Create detection error:", error);
    return NextResponse.json(
      { error: "Failed to save detection" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const date = searchParams.get("date");

    const where: Record<string, unknown> = { userId: session.user.id };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.dailyLog = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const detections = await prisma.detection.findMany({
      where,
      include: {
        food: true,
        dailyLog: true,
      },
      orderBy: { detectedAt: "desc" },
      take: limit,
    });

    return NextResponse.json(detections);
  } catch (error) {
    console.error("Get detections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch detections" },
      { status: 500 }
    );
  }
}