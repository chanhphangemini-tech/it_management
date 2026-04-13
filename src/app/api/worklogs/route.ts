import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/worklogs - Get worklogs with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const caseId = searchParams.get("caseId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = parseInt(userId);
    }

    if (caseId) {
      where.caseId = parseInt(caseId);
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { clientName: { contains: search } },
      ];
    }

    const [worklogs, total] = await Promise.all([
      db.worklog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      db.worklog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: worklogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching worklogs:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải worklog" },
      { status: 500 }
    );
  }
}

// POST /api/worklogs - Create a new worklog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      caseId,
      title,
      description,
      timeSpent,
      status,
      success,
      category,
      tags,
      clientName,
      caseTitle,
      issueDescription,
      solutionApplied,
      result,
      priority,
      workStatus,
      date,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề là bắt buộc" },
        { status: 400 }
      );
    }

    const worklog = await db.worklog.create({
      data: {
        userId: userId ? parseInt(userId) : null,
        caseId: caseId ? parseInt(caseId) : null,
        title,
        description: description || null,
        timeSpent: timeSpent || null,
        status: status || "in_progress",
        success: success ?? false,
        category: category || null,
        tags: tags || "[]",
        clientName: clientName || null,
        caseTitle: caseTitle || null,
        issueDescription: issueDescription || null,
        solutionApplied: solutionApplied || null,
        result: result || null,
        priority: priority || "Medium",
        workStatus: workStatus || "completed",
        date: date ? new Date(date) : null,
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
      data: worklog,
      message: "Worklog đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating worklog:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo worklog" },
      { status: 500 }
    );
  }
}
