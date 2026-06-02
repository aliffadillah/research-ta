import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const menus = await prisma.menuRecommendation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(menus);
  } catch (error) {
    console.error("Get menus error:", error);
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      tanggal,
      caloriesBesar,
      proteinBesar,
      carbsBesar,
      fatBesar,
      fiberBesar,
      caloriesKecil,
      proteinKecil,
      carbsKecil,
      fatKecil,
      fiberKecil,
    } = body;

    const menu = await prisma.menuRecommendation.create({
      data: {
        name,
        description,
        tanggal: tanggal || "",
        caloriesBesar: caloriesBesar || 0,
        proteinBesar: proteinBesar || 0,
        carbsBesar: carbsBesar || 0,
        fatBesar: fatBesar || 0,
        fiberBesar: fiberBesar || 0,
        caloriesKecil: caloriesKecil || 0,
        proteinKecil: proteinKecil || 0,
        carbsKecil: carbsKecil || 0,
        fatKecil: fatKecil || 0,
        fiberKecil: fiberKecil || 0,
        isActive: true,
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error("Create menu error:", error);
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const menu = await prisma.menuRecommendation.update({
      where: { id },
      data,
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Update menu error:", error);
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.menuRecommendation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete menu error:", error);
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 });
  }
}