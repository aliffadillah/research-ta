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

    const detections = await prisma.detection.findMany({
      where: { userId: session.user.id },
      include: {
        food: true,
      },
      orderBy: { detectedAt: "desc" },
      take: 10,
    });

    return NextResponse.json(detections);
  } catch (error) {
    console.error("Recent detections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent detections" },
      { status: 500 }
    );
  }
}