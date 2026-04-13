import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

// Parse CSV with BOM handling
function parseCSV(text: string): string[][] {
  // Remove BOM if present
  let cleaned = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        current.push(field.trim());
        field = "";
      } else if (char === "\r" && next === "\n") {
        current.push(field.trim());
        rows.push(current);
        current = [];
        field = "";
        i++; // skip \n
      } else if (char === "\n") {
        current.push(field.trim());
        rows.push(current);
        current = [];
        field = "";
      } else {
        field += char;
      }
    }
  }

  // Last field
  if (field || current.length > 0) {
    current.push(field.trim());
    rows.push(current);
  }

  return rows;
}

function normalizeIP(ip: string): string | null {
  if (!ip || ip === "-" || ip === "" || ip === "*" || ip.includes("x")) return null;
  return ip.trim();
}

function normalizeStatus(status: string): string {
  const s = status.toLowerCase().trim();
  if (s === "active") return "active";
  return "inactive";
}

async function ensureAssetCategory(code: string, name: string, icon: string, color: string) {
  const existing = await db.assetCategory.findUnique({ where: { code } });
  if (existing) return existing.id;
  const created = await db.assetCategory.create({
    data: { code, name, icon, color, description: `Imported: ${name}` },
  });
  return created.id;
}

async function importServers(rows: string[][]) {
  // rows[0] = header, rows[1..] = data
  // Header: STT, Công ty / Sở hữu, Phân loại, Khu vực, Tên Định Danh, Ghi chú, Serial Number, Model Chi Tiết, IP, Ngày mua, Tình trạng
  const categoryId = await ensureAssetCategory("server", "Server", "HardDrive", "sky");

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 5 || !row[4]) continue; // Need at least Tên Định Danh

    const assetCode = row[4]; // Tên Định Danh
    const notes = row[1] || null; // Công ty / Sở hữu
    const description = row[5] || null; // Ghi chú
    const serialNumber = row[6] || null; // Serial Number
    const model = row[7] || null; // Model Chi Tiết
    const location = row[3] || null; // Khu vực
    const purchaseDate = row[9] || null; // Ngày mua

    // Check if exists
    const existing = await db.asset.findUnique({ where: { assetCode } });
    if (existing) {
      skipped++;
      continue;
    }

    await db.asset.create({
      data: {
        assetCode,
        name: assetCode,
        categoryId,
        description,
        serialNumber,
        model,
        location,
        notes,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        status: "available",
      },
    });
    imported++;
  }

  return { imported, skipped };
}

async function importVMs(rows: string[][]) {
  // Header: STT, Công ty / Sở hữu, Server Vật Lý Chứa, Tên Định Danh, IP, Tình trạng
  const categoryId = await ensureAssetCategory("vm", "Máy ảo (VM)", "Monitor", "violet");

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4 || !row[3]) continue;

    const assetCode = row[3]; // Tên Định Danh
    const notes = row[1] || null; // Công ty / Sở hữu
    const description = row[2] ? `Server: ${row[2]}` : null; // Server Vật Lý Chứa
    const status = row[5] === "Disable" ? "maintenance" : "available";

    const existing = await db.asset.findUnique({ where: { assetCode } });
    if (existing) {
      skipped++;
      continue;
    }

    await db.asset.create({
      data: {
        assetCode,
        name: assetCode,
        categoryId,
        description,
        notes,
        status,
      },
    });
    imported++;
  }

  return { imported, skipped };
}

async function importNetwork(rows: string[][]) {
  // Header: STT, Mã Nhãn, Phân loại, Địa chỉ IP, Vị trí, Mô tả
  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2 || !row[1]) continue;

    const name = row[1]; // Mã Nhãn
    const deviceType = row[2] || null; // Phân loại
    const ip = normalizeIP(row[3]); // Địa chỉ IP
    const location = row[4] || null; // Vị trí
    const description = row[5] || null; // Mô tả

    // Check if exists by name
    const existing = await db.netDevice.findFirst({ where: { name } });
    if (existing) {
      skipped++;
      continue;
    }

    await db.netDevice.create({
      data: {
        name,
        deviceType,
        ip,
        location,
        description,
        status: "active",
      },
    });
    imported++;
  }

  return { imported, skipped };
}

async function importCamera(rows: string[][]) {
  // Header: STT, Mã Nhãn, Phân loại, Địa chỉ IP, Vị trí, Mô tả
  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2 || !row[1]) continue;

    const name = row[1]; // Mã Nhãn
    const deviceType = row[2] || "camera"; // Phân loại
    const ip = normalizeIP(row[3]); // Địa chỉ IP
    const location = row[4] || null; // Vị trí
    const description = row[5] || null; // Mô tả

    const existing = await db.netDevice.findFirst({ where: { name } });
    if (existing) {
      skipped++;
      continue;
    }

    await db.netDevice.create({
      data: {
        name,
        deviceType,
        ip,
        location,
        description,
        status: "active",
      },
    });
    imported++;
  }

  return { imported, skipped };
}

async function importCables(rows: string[][]) {
  // Header: STT, Mã Nhãn Dây, Loại Cáp, Điểm Nguồn (A), Điểm Đích (B), Mô tả
  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2 || !row[1]) continue;

    const label = row[1]; // Mã Nhãn Dây
    const cableType = row[2] || null; // Loại Cáp
    const fromDeviceName = row[3] || null; // Điểm Nguồn (A)
    const toDeviceName = row[4] || null; // Điểm Đích (B)
    const description = row[5] || null; // Mô tả

    const existing = await db.netCable.findFirst({ where: { label } });
    if (existing) {
      skipped++;
      continue;
    }

    await db.netCable.create({
      data: {
        label,
        cableType,
        fromDeviceName,
        toDeviceName,
        description,
      },
    });
    imported++;
  }

  return { imported, skipped };
}

// POST /api/import/csv - Import CSV file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Vui lòng chọn file CSV" },
        { status: 400 }
      );
    }

    const validTypes = ["servers", "vms", "network", "camera", "cables"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Loại import không hợp lệ. Chọn: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return NextResponse.json(
        { success: false, error: "File CSV trống hoặc không có dữ liệu" },
        { status: 400 }
      );
    }

    let result: { imported: number; skipped: number };

    switch (type) {
      case "servers":
        result = await importServers(rows);
        break;
      case "vms":
        result = await importVMs(rows);
        break;
      case "network":
        result = await importNetwork(rows);
        break;
      case "camera":
        result = await importCamera(rows);
        break;
      case "cables":
        result = await importCables(rows);
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Loại không được hỗ trợ" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Import thành công: ${result.imported} bản ghi mới, ${result.skipped} bản ghi bị trùng (bỏ qua)`,
      data: result,
    });
  } catch (error) {
    console.error("Error importing CSV:", error);
    return NextResponse.json(
      { success: false, error: "Không thể import CSV: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
