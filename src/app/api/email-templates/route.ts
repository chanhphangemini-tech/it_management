import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/email-templates - Get all email templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    const templates = await db.emailTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải mẫu email" },
      { status: 500 }
    );
  }
}

// POST /api/email-templates - Create a new email template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, content, category, tags, createdBy } = body;

    if (!name || !subject || !content) {
      return NextResponse.json(
        { success: false, error: "Tên, tiêu đề và nội dung là bắt buộc" },
        { status: 400 }
      );
    }

    const template = await db.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        category: category || "general",
        tags: tags || null,
        createdBy: createdBy ? parseInt(createdBy) : null,
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
      data: template,
      message: "Mẫu email đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo mẫu email" },
      { status: 500 }
    );
  }
}
