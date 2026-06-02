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

    const foods = await prisma.food.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error("Get foods error:", error);
    return NextResponse.json(
      { error: "Failed to fetch foods" },
      { status: 500 }
    );
  }
}