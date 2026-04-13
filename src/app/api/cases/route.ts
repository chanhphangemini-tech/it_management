import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/cases - Get cases with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

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
        { symptoms: { contains: search } },
        { solution: { contains: search } },
      ];
    }

    const [cases, total] = await Promise.all([
      db.case.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          categoryRel: true,
          _count: {
            select: { worklogs: true },
          },
        },
      }),
      db.case.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải case" },
      { status: 500 }
    );
  }
}

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      description,
      symptoms,
      rootCause,
      solution,
      prevention,
      status,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề là bắt buộc" },
        { status: 400 }
      );
    }

    const newCase = await db.case.create({
      data: {
        title,
        category: category || null,
        description: description || null,
        symptoms: symptoms || null,
        rootCause: rootCause || null,
        solution: solution || null,
        prevention: prevention || null,
        status: status || "Active",
      },
      include: {
        categoryRel: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newCase,
      message: "Case đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo case" },
      { status: 500 }
    );
  }
}
