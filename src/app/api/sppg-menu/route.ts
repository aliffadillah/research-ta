import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SPPG_MENUS } from "@/data/sppg-menus";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      menus: SPPG_MENUS,
      total: SPPG_MENUS.length,
    });
  } catch (error) {
    console.error("[SPPG Menu API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch SPPG menus" },
      { status: 500 }
    );
  }
}
