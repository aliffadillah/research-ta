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

    // Handle batch import
    if (Array.isArray(body)) {
      const menus = body.map((item: any) => ({
        name: item.name || `Menu ${item.no || Math.random()}`,
        description: item.description || null,
        tanggal: item.tanggal || "",
        daftarMenu: item.daftarMenu || [],
        caloriesBesar: parseFloat(String(item.caloriesBesar || item.kandungan_gizi_porsi_besar?.energi || 0).replace(/[^\d.]/g, "")),
        proteinBesar: parseFloat(String(item.proteinBesar || item.kandungan_gizi_porsi_besar?.protein || 0).replace(/[^\d.]/g, "")),
        carbsBesar: parseFloat(String(item.carbsBesar || item.kandungan_gizi_porsi_besar?.karbohidrat || 0).replace(/[^\d.]/g, "")),
        fatBesar: parseFloat(String(item.fatBesar || item.kandungan_gizi_porsi_besar?.lemak || 0).replace(/[^\d.]/g, "")),
        fiberBesar: parseFloat(String(item.fiberBesar || item.kandungan_gizi_porsi_besar?.serat || 0).replace(/[^\d.]/g, "")),
        caloriesKecil: parseFloat(String(item.caloriesKecil || item.kandungan_gizi_porsi_kecil?.energi || 0).replace(/[^\d.]/g, "")),
        proteinKecil: parseFloat(String(item.proteinKecil || item.kandungan_gizi_porsi_kecil?.protein || 0).replace(/[^\d.]/g, "")),
        carbsKecil: parseFloat(String(item.carbsKecil || item.kandungan_gizi_porsi_kecil?.karbohidrat || 0).replace(/[^\d.]/g, "")),
        fatKecil: parseFloat(String(item.fatKecil || item.kandungan_gizi_porsi_kecil?.lemak || 0).replace(/[^\d.]/g, "")),
        fiberKecil: parseFloat(String(item.fiberKecil || item.kandungan_gizi_porsi_kecil?.serat || 0).replace(/[^\d.]/g, "")),
        isActive: true,
      }));

      await prisma.menuRecommendation.deleteMany({});
      const created = await prisma.menuRecommendation.createMany({ data: menus });

      return NextResponse.json({
        success: true,
        message: `Berhasil menambahkan ${created.count} menu`,
        count: created.count,
      }, { status: 201 });
    }

    // Single menu creation
    const {
      name,
      description,
      tanggal,
      daftarMenu,
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
        daftarMenu: daftarMenu || [],
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