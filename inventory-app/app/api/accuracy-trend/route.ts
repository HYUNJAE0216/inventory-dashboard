import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { AccuracyPoint } from "@/lib/types";

export const TARGET_ACCURACY_PCT = 90;

export async function GET() {
  const db = getDb();
  const data = db
    .prepare(
      "SELECT month, label, accuracy_pct AS rate FROM monthly_accuracy ORDER BY month ASC"
    )
    .all() as AccuracyPoint[];

  return NextResponse.json({ target: TARGET_ACCURACY_PCT, data });
}
