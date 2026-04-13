import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/worklogs/stats - Get worklog statistics
export async function GET() {
  try {
    const [total, byCategory, byStatus, byPriority, byWorkStatus, byMonth] = await Promise.all([
      db.worklog.count(),
      db.worklog.groupBy({
        by: ["category"],
        _count: true,
        where: { category: { not: null } },
        orderBy: { _count: { id: "desc" } },
      }),
      db.worklog.groupBy({
        by: ["status"],
        _count: true,
      }),
      db.worklog.groupBy({
        by: ["priority"],
        _count: true,
      }),
      db.worklog.groupBy({
        by: ["workStatus"],
        _count: true,
      }),
      db.$queryRaw<Array<{ month: string; count: bigint }>>`
        SELECT 
          substr(date, 1, 7) as month,
          COUNT(*) as count
        FROM worklogs
        WHERE date IS NOT NULL AND date != ''
        GROUP BY substr(date, 1, 7)
        ORDER BY month DESC
        LIMIT 6
      `,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        byCategory,
        byStatus,
        byPriority,
        byWorkStatus,
        byMonth: byMonth.map((m) => ({
          month: m.month,
          count: Number(m.count),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching worklog stats:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải thống kê" },
      { status: 500 }
    );
  }
}
