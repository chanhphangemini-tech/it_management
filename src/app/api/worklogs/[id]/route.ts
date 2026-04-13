import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/worklogs/[id] - Get worklog by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const worklog = await db.worklog.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
        caseRel: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    if (!worklog) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy worklog" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: worklog,
    });
  } catch (error) {
    console.error("Error fetching worklog:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải worklog" },
      { status: 500 }
    );
  }
}

// PUT /api/worklogs/[id] - Update worklog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingWorklog = await db.worklog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingWorklog) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy worklog" },
        { status: 404 }
      );
    }

    const updatedWorklog = await db.worklog.update({
      where: { id: parseInt(id) },
      data: {
        userId: body.userId !== undefined ? (body.userId ? parseInt(body.userId) : null) : undefined,
        caseId: body.caseId !== undefined ? (body.caseId ? parseInt(body.caseId) : null) : undefined,
        title: body.title,
        description: body.description,
        timeSpent: body.timeSpent,
        status: body.status,
        success: body.success,
        category: body.category,
        tags: body.tags,
        clientName: body.clientName,
        caseTitle: body.caseTitle,
        issueDescription: body.issueDescription,
        solutionApplied: body.solutionApplied,
        result: body.result,
        priority: body.priority,
        workStatus: body.workStatus,
        date: body.date ? new Date(body.date) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        caseRel: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWorklog,
      message: "Worklog đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Error updating worklog:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật worklog" },
      { status: 500 }
    );
  }
}

// DELETE /api/worklogs/[id] - Delete worklog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingWorklog = await db.worklog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingWorklog) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy worklog" },
        { status: 404 }
      );
    }

    await db.worklog.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Worklog đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting worklog:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa worklog" },
      { status: 500 }
    );
  }
}
