import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/email-templates/[id] - Get email template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await db.emailTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy mẫu email" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching email template:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải mẫu email" },
      { status: 500 }
    );
  }
}

// PUT /api/email-templates/[id] - Update email template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingTemplate = await db.emailTemplate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy mẫu email" },
        { status: 404 }
      );
    }

    const updatedTemplate = await db.emailTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        subject: body.subject,
        content: body.content,
        category: body.category,
        tags: body.tags,
        createdBy: body.createdBy !== undefined ? (body.createdBy ? parseInt(body.createdBy) : null) : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: "Mẫu email đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật mẫu email" },
      { status: 500 }
    );
  }
}

// DELETE /api/email-templates/[id] - Delete email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingTemplate = await db.emailTemplate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy mẫu email" },
        { status: 404 }
      );
    }

    await db.emailTemplate.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Mẫu email đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa mẫu email" },
      { status: 500 }
    );
  }
}
