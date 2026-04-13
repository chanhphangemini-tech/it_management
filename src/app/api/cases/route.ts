import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/cases - Get all cases with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

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

    const cases = await db.case.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        categoryRel: true,
        _count: {
          select: { worklogs: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: cases,
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
