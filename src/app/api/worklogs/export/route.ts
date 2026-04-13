import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/worklogs/export - Export all worklogs as CSV
export async function GET() {
  try {
    const worklogs = await db.worklog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true, fullName: true },
        },
      },
    });

    const headers = [
      "ID",
      "Tiêu đề",
      "Danh mục",
      "Khách hàng",
      "Mô tả vấn đề",
      "Giải pháp áp dụng",
      "Thời gian xử lý",
      "Độ ưu tiên",
      "Trạng thái công việc",
      "Kết quả",
      "Người thực hiện",
      "Ngày",
      "Ngày tạo",
    ];

    const categoryLabels: Record<string, string> = {
      database: "Cơ sở dữ liệu",
      application: "Ứng dụng",
      "user-support": "Hỗ trợ người dùng",
      hardware: "Phần cứng",
      other: "Khác",
      network: "Mạng",
      server: "Máy chủ",
      printer: "Máy in",
      storage: "Lưu trữ",
      virtualization: "Ảo hóa",
      system: "Hệ thống",
      security: "Bảo mật",
    };

    const priorityLabels: Record<string, string> = {
      Low: "Thấp",
      Medium: "Trung bình",
      High: "Cao",
      Critical: "Khẩn cấp",
    };

    const workStatusLabels: Record<string, string> = {
      completed: "Hoàn thành",
      in_progress: "Đang xử lý",
      pending: "Chờ xử lý",
      failed: "Thất bại",
    };

    const resultLabels: Record<string, string> = {
      Resolved: "Đã giải quyết",
      "Partially Resolved": "Giải quyết một phần",
      Escalated: "Đã chuyển lên",
      Pending: "Chờ xử lý",
    };

    const escapeCSV = (val: string | null | undefined) => {
      if (!val) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = worklogs.map((w) =>
      [
        w.id,
        escapeCSV(w.title),
        escapeCSV(w.category ? categoryLabels[w.category] || w.category : ""),
        escapeCSV(w.clientName),
        escapeCSV(w.issueDescription),
        escapeCSV(w.solutionApplied),
        escapeCSV(w.timeSpent),
        escapeCSV(priorityLabels[w.priority] || w.priority),
        escapeCSV(workStatusLabels[w.workStatus] || w.workStatus),
        escapeCSV(resultLabels[w.result] || w.result || ""),
        escapeCSV(w.user?.fullName || w.user?.username || ""),
        w.date ? new Date(w.date).toLocaleDateString("vi-VN") : "",
        new Date(w.createdAt).toLocaleDateString("vi-VN"),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="worklogs_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting worklogs:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xuất dữ liệu" },
      { status: 500 }
    );
  }
}
