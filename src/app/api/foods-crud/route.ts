import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const foods = await prisma.food.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(foods);
  } catch (error) {
    console.error("Get foods error:", error);
    return NextResponse.json({ error: "Failed to fetch foods" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, calories, protein, carbs, fat, fiber, portionSize, portionUnit, category } = body;

    const food = await prisma.food.create({
      data: {
        name,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        fiber: fiber || 0,
        portionSize: portionSize || 100,
        portionUnit: portionUnit || "g",
        category,
      },
    });

    return NextResponse.json(food, { status: 201 });
  } catch (error) {
    console.error("Create food error:", error);
    return NextResponse.json({ error: "Failed to create food" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const food = await prisma.food.update({
      where: { id },
      data,
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error("Update food error:", error);
    return NextResponse.json({ error: "Failed to update food" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.food.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete food error:", error);
    return NextResponse.json({ error: "Failed to delete food" }, { status: 500 });
  }
}