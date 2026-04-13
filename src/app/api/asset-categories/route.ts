import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/asset-categories - Get all asset categories
export async function GET() {
  try {
    const categories = await db.assetCategory.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching asset categories:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải danh mục tài sản" },
      { status: 500 }
    );
  }
}

// POST /api/asset-categories - Create a new asset category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, icon, color } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Mã và tên là bắt buộc" },
        { status: 400 }
      );
    }

    // Check if category with this code already exists
    const existingCategory = await db.assetCategory.findUnique({
      where: { code },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Danh mục tài sản với mã này đã tồn tại" },
        { status: 400 }
      );
    }

    const category = await db.assetCategory.create({
      data: {
        code,
        name,
        description: description || null,
        icon: icon || null,
        color: color || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Danh mục tài sản đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating asset category:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo danh mục tài sản" },
      { status: 500 }
    );
  }
}
