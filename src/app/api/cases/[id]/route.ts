import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/cases/[id] - Get case by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const caseItem = await db.case.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoryRel: true,
        worklogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!caseItem) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy case" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: caseItem,
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải case" },
      { status: 500 }
    );
  }
}

// PUT /api/cases/[id] - Update case
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingCase = await db.case.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy case" },
        { status: 404 }
      );
    }

    const updatedCase = await db.case.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        category: body.category,
        description: body.description,
        symptoms: body.symptoms,
        rootCause: body.rootCause,
        solution: body.solution,
        prevention: body.prevention,
        status: body.status,
      },
      include: {
        categoryRel: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCase,
      message: "Case đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật case" },
      { status: 500 }
    );
  }
}

// DELETE /api/cases/[id] - Delete case
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingCase = await db.case.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy case" },
        { status: 404 }
      );
    }

    // Delete related worklogs first
    await db.worklog.deleteMany({
      where: { caseId: parseInt(id) },
    });

    await db.case.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Case đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa case" },
      { status: 500 }
    );
  }
}
