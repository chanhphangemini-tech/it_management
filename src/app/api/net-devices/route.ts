import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/net-devices - Get all network devices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceType = searchParams.get("deviceType");
    const status = searchParams.get("status");
    const location = searchParams.get("location");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (deviceType) {
      where.deviceType = deviceType;
    }

    if (status) {
      where.status = status;
    }

    if (location) {
      where.location = { contains: location };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { ip: { contains: search } },
        { location: { contains: search } },
        { serialNumber: { contains: search } },
      ];
    }

    const devices = await db.netDevice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            cablesFrom: true,
            cablesTo: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error("Error fetching network devices:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải thiết bị mạng" },
      { status: 500 }
    );
  }
}

// POST /api/net-devices - Create a new network device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      ip,
      location,
      description,
      deviceType,
      status,
      company,
      serialNumber,
      modelDetails,
      purchaseDate,
      condition,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Tên là bắt buộc" },
        { status: 400 }
      );
    }

    const device = await db.netDevice.create({
      data: {
        name,
        ip: ip || null,
        location: location || null,
        description: description || null,
        deviceType: deviceType || null,
        status: status || "active",
        company: company || null,
        serialNumber: serialNumber || null,
        modelDetails: modelDetails || null,
        purchaseDate: purchaseDate || null,
        condition: condition || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: device,
      message: "Thiết bị mạng đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating network device:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo thiết bị mạng" },
      { status: 500 }
    );
  }
}
