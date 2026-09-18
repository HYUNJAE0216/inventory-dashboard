import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { computeItemMetrics } from "@/lib/status";
import type { ItemRow } from "@/lib/types";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  if (!month) {
    return NextResponse.json({ error: "month query param is required" }, { status: 400 });
  }

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         i.code AS code,
         i.name AS name,
         c.name AS cat,
         i.unit AS unit,
         i.price AS price,
         r.system_qty AS sys,
         r.physical_qty AS phy
       FROM monthly_records r
       JOIN items i ON i.id = r.item_id
       JOIN categories c ON c.id = i.category_id
       WHERE r.month = ?
       ORDER BY c.sort_order ASC, i.code ASC`
    )
    .all(month) as {
    code: string;
    name: string;
    cat: string;
    unit: string;
    price: number;
    sys: number;
    phy: number;
  }[];

  if (rows.length === 0) {
    return NextResponse.json({ hasDetail: false, items: [] });
  }

  const items: ItemRow[] = rows.map((row) => {
    const metrics = computeItemMetrics(row.sys, row.phy, row.price);
    return { ...row, ...metrics };
  });

  return NextResponse.json({ hasDetail: true, items });
}
