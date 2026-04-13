import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/net-devices/[id] - Get network device by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const device = await db.netDevice.findUnique({
      where: { id: parseInt(id) },
      include: {
        cablesFrom: {
          include: {
            toDevice: {
              select: {
                id: true,
                name: true,
                ip: true,
              },
            },
          },
        },
        cablesTo: {
          include: {
            fromDevice: {
              select: {
                id: true,
                name: true,
                ip: true,
              },
            },
          },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thiết bị mạng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: device,
    });
  } catch (error) {
    console.error("Error fetching network device:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải thiết bị mạng" },
      { status: 500 }
    );
  }
}

// PUT /api/net-devices/[id] - Update network device
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingDevice = await db.netDevice.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDevice) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thiết bị mạng" },
        { status: 404 }
      );
    }

    const updatedDevice = await db.netDevice.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        ip: body.ip,
        location: body.location,
        description: body.description,
        deviceType: body.deviceType,
        status: body.status,
        company: body.company,
        serialNumber: body.serialNumber,
        modelDetails: body.modelDetails,
        purchaseDate: body.purchaseDate,
        condition: body.condition,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDevice,
      message: "Thiết bị mạng đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Error updating network device:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật thiết bị mạng" },
      { status: 500 }
    );
  }
}

// DELETE /api/net-devices/[id] - Delete network device
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingDevice = await db.netDevice.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDevice) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thiết bị mạng" },
        { status: 404 }
      );
    }

    // Delete related cables first
    await db.netCable.deleteMany({
      where: {
        OR: [
          { fromDeviceId: parseInt(id) },
          { toDeviceId: parseInt(id) },
        ],
      },
    });

    await db.netDevice.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Thiết bị mạng đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting network device:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa thiết bị mạng" },
      { status: 500 }
    );
  }
}
