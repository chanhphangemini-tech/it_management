import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/assets/[id] - Get asset by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const asset = await db.asset.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        assignments: {
          orderBy: { assignedAt: "desc" },
          take: 10,
        },
        transactions: {
          orderBy: { processedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tài sản" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải tài sản" },
      { status: 500 }
    );
  }
}

// PUT /api/assets/[id] - Update asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingAsset = await db.asset.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAsset) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tài sản" },
        { status: 404 }
      );
    }

    const updatedAsset = await db.asset.update({
      where: { id: parseInt(id) },
      data: {
        assetCode: body.assetCode,
        name: body.name,
        categoryId: body.categoryId !== undefined ? (body.categoryId ? parseInt(body.categoryId) : null) : undefined,
        description: body.description,
        serialNumber: body.serialNumber,
        model: body.model,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        status: body.status,
        location: body.location,
        notes: body.notes,
        createdBy: body.createdBy !== undefined ? (body.createdBy ? parseInt(body.createdBy) : null) : undefined,
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
      data: updatedAsset,
      message: "Tài sản đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật tài sản" },
      { status: 500 }
    );
  }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingAsset = await db.asset.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAsset) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tài sản" },
        { status: 404 }
      );
    }

    // Delete related records first
    await db.assetAssignment.deleteMany({
      where: { assetId: parseInt(id) },
    });

    await db.assetTransaction.deleteMany({
      where: { assetId: parseInt(id) },
    });

    await db.asset.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Tài sản đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa tài sản" },
      { status: 500 }
    );
  }
}
