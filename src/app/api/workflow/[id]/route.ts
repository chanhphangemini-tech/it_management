import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT /api/workflow/[id] - Update column and replace its items
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, description, color, target, items } = body;

    const existing = await db.workflowColumn.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy cột" },
        { status: 404 }
      );
    }

    // Delete all existing items (they will be recreated/replaced)
    await db.workflowItem.deleteMany({
      where: { columnId: parseInt(id) },
    });

    // Update the column and create new items
    const updated = await db.workflowColumn.update({
      where: { id: parseInt(id) },
      data: {
        title: title ?? existing.title,
        subtitle: subtitle ?? existing.subtitle,
        description: description !== undefined ? description : existing.description,
        color: color ?? existing.color,
        target: target !== undefined ? target : existing.target,
        items: items
          ? {
              create: items.map(
                (
                  item: {
                    id?: number;
                    title: string;
                    description?: string;
                    timeEstimate?: string;
                    sortOrder?: number;
                  },
                  index: number
                ) => ({
                  title: item.title,
                  description: item.description || null,
                  timeEstimate: item.timeEstimate || null,
                  sortOrder: item.sortOrder ?? index,
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
      data: updated,
      message: "Cột đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Error updating workflow column:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật cột" },
      { status: 500 }
    );
  }
}

// DELETE /api/workflow/[id] - Delete column and all its items
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.workflowColumn.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy cột" },
        { status: 404 }
      );
    }

    // Items will be cascade deleted due to onDelete: Cascade
    await db.workflowColumn.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Cột đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting workflow column:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa cột" },
      { status: 500 }
    );
  }
}
