import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/workflow - Get all columns with items, ordered by sortOrder
export async function GET() {
  try {
    const columns = await db.workflowColumn.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: columns,
    });
  } catch (error) {
    console.error("Error fetching workflow columns:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải quy trình làm việc" },
      { status: 500 }
    );
  }
}

// POST /api/workflow - Create a new column with optional items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, description, color, target, items } = body;

    if (!title || !subtitle) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề và tên phụ là bắt buộc" },
        { status: 400 }
      );
    }

    // Get max sortOrder to append at end
    const maxSort = await db.workflowColumn.aggregate({
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    const newColumn = await db.workflowColumn.create({
      data: {
        title,
        subtitle,
        description: description || null,
        color: color || "slate",
        target: target || null,
        sortOrder: nextSort,
        items: items
          ? {
              create: items.map(
                (item: { title: string; description?: string; timeEstimate?: string }, index: number) => ({
                  title: item.title,
                  description: item.description || null,
                  timeEstimate: item.timeEstimate || null,
                  sortOrder: index,
                })
              ),
            }
          : undefined,
      },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: newColumn,
      message: "Cột đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating workflow column:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo cột" },
      { status: 500 }
    );
  }
}
