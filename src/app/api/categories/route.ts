import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { cases: true, workLogs: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải danh mục" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, icon, description, color } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Mã và tên là bắt buộc" },
        { status: 400 }
      );
    }

    // Check if category with this code already exists
    const existingCategory = await db.category.findUnique({
      where: { code },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Danh mục với mã này đã tồn tại" },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        code,
        name,
        icon: icon || null,
        description: description || null,
        color: color || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Danh mục đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo danh mục" },
      { status: 500 }
    );
  }
}
