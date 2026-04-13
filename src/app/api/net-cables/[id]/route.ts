import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE /api/net-cables/[id] - Delete network cable
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingCable = await db.netCable.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCable) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy cáp mạng" },
        { status: 404 }
      );
    }

    await db.netCable.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Cáp mạng đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting network cable:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa cáp mạng" },
      { status: 500 }
    );
  }
}
