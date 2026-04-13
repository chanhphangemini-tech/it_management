import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/assets - Get all assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { assetCode: { contains: search } },
        { serialNumber: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const assets = await db.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
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
      data: assets,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải tài sản" },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create a new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      assetCode,
      name,
      categoryId,
      description,
      serialNumber,
      model,
      purchaseDate,
      purchasePrice,
      status,
      location,
      notes,
      createdBy,
    } = body;

    if (!assetCode || !name) {
      return NextResponse.json(
        { success: false, error: "Mã tài sản và tên là bắt buộc" },
        { status: 400 }
      );
    }

    // Check if asset with this code already exists
    const existingAsset = await db.asset.findUnique({
      where: { assetCode },
    });

    if (existingAsset) {
      return NextResponse.json(
        { success: false, error: "Tài sản với mã này đã tồn tại" },
        { status: 400 }
      );
    }

    const asset = await db.asset.create({
      data: {
        assetCode,
        name,
        categoryId: categoryId ? parseInt(categoryId) : null,
        description: description || null,
        serialNumber: serialNumber || null,
        model: model || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        status: status || "available",
        location: location || null,
        notes: notes || null,
        createdBy: createdBy ? parseInt(createdBy) : null,
      },
      include: {
        category: true,
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
      data: asset,
      message: "Tài sản đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo tài sản" },
      { status: 500 }
    );
  }
}
