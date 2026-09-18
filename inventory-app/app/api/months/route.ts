import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { MonthOption } from "@/lib/types";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         a.month AS month,
         a.label AS label,
         EXISTS(SELECT 1 FROM monthly_records r WHERE r.month = a.month) AS hasDetail
       FROM monthly_accuracy a
       ORDER BY a.month ASC`
    )
    .all() as { month: string; label: string; hasDetail: number }[];

  const months: MonthOption[] = rows.map((r) => ({
    month: r.month,
    label: r.label,
    hasDetail: r.hasDetail === 1,
  }));

  return NextResponse.json(months);
}
