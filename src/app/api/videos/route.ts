import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const platformFilter = searchParams.get("platform");
    const statusFilter = searchParams.get("status");

    const where: Record<string, unknown> = { userId };
    if (platformFilter && platformFilter !== "all") {
      where.platform = platformFilter;
    }
    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter;
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: { generation: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    return NextResponse.json({
      videos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Videos list error:", error);
    return NextResponse.json({ error: "Error al obtener videos" }, { status: 500 });
  }
}
