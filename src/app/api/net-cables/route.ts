import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/net-cables - Get all network cables
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cableType = searchParams.get("cableType");
    const fromDeviceId = searchParams.get("fromDeviceId");
    const toDeviceId = searchParams.get("toDeviceId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (cableType) {
      where.cableType = cableType;
    }

    if (fromDeviceId) {
      where.fromDeviceId = parseInt(fromDeviceId);
    }

    if (toDeviceId) {
      where.toDeviceId = parseInt(toDeviceId);
    }

    if (search) {
      where.OR = [
        { label: { contains: search } },
        { fromDeviceName: { contains: search } },
        { toDeviceName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const cables = await db.netCable.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        fromDevice: {
          select: {
            id: true,
            name: true,
            ip: true,
            deviceType: true,
          },
        },
        toDevice: {
          select: {
            id: true,
            name: true,
            ip: true,
            deviceType: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: cables,
    });
  } catch (error) {
    console.error("Error fetching network cables:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải cáp mạng" },
      { status: 500 }
    );
  }
}

// POST /api/net-cables - Create a new network cable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      label,
      cableType,
      fromDeviceId,
      toDeviceId,
      fromDeviceName,
      toDeviceName,
      description,
    } = body;

    if (!label) {
      return NextResponse.json(
        { success: false, error: "Nhãn là bắt buộc" },
        { status: 400 }
      );
    }

    const cable = await db.netCable.create({
      data: {
        label,
        cableType: cableType || null,
        fromDeviceId: fromDeviceId ? parseInt(fromDeviceId) : null,
        toDeviceId: toDeviceId ? parseInt(toDeviceId) : null,
        fromDeviceName: fromDeviceName || null,
        toDeviceName: toDeviceName || null,
        description: description || null,
      },
      include: {
        fromDevice: {
          select: {
            id: true,
            name: true,
            ip: true,
          },
        },
        toDevice: {
          select: {
            id: true,
            name: true,
            ip: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: cable,
      message: "Cáp mạng đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating network cable:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo cáp mạng" },
      { status: 500 }
    );
  }
}
