import { getDb } from "../lib/db";

const CATEGORIES = ["원료", "부재료", "재공품", "제품"];

const LATEST_MONTH = "2026-09";

const ITEMS: {
  code: string;
  name: string;
  cat: string;
  unit: string;
  sys: number;
  phy: number;
  price: number;
}[] = [
  { code: "RM-101", name: "이산화티타늄(안료)", cat: "원료", unit: "kg", sys: 4820, phy: 4790, price: 4500 },
  { code: "RM-102", name: "아크릴 에멀젼 수지", cat: "원료", unit: "kg", sys: 12600, phy: 12040, price: 2800 },
  { code: "RM-103", name: "조색 안료(블랙)", cat: "원료", unit: "kg", sys: 380, phy: 372, price: 9000 },
  { code: "RM-104", name: "소포제", cat: "원료", unit: "kg", sys: 210, phy: 213, price: 6500 },
  { code: "RM-105", name: "방부제", cat: "원료", unit: "kg", sys: 96, phy: 95, price: 18000 },
  { code: "SM-201", name: "PP 교반봉", cat: "부재료", unit: "EA", sys: 3200, phy: 3200, price: 350 },
  { code: "SM-202", name: "라벨 스티커", cat: "부재료", unit: "EA", sys: 540, phy: 505, price: 120 },
  { code: "SM-203", name: "뚜껑(20L)", cat: "부재료", unit: "EA", sys: 2150, phy: 2148, price: 850 },
  { code: "SM-204", name: "손잡이", cat: "부재료", unit: "EA", sys: 1980, phy: 1965, price: 450 },
  { code: "SF-301", name: "백색 베이스 반제품", cat: "재공품", unit: "kg", sys: 5400, phy: 5390, price: 3200 },
  { code: "SF-302", name: "조색 베이스(그레이)", cat: "재공품", unit: "kg", sys: 2200, phy: 2251, price: 3400 },
  { code: "SF-303", name: "저광택 베이스", cat: "재공품", unit: "kg", sys: 1750, phy: 1742, price: 3100 },
  { code: "SF-304", name: "방청 프라이머 반제품", cat: "재공품", unit: "kg", sys: 1320, phy: 1318, price: 3600 },
  { code: "FG-401", name: "수성 외벽용 페인트 18L", cat: "제품", unit: "EA", sys: 860, phy: 812, price: 68000 },
  { code: "FG-402", name: "수성 내벽용 페인트 18L", cat: "제품", unit: "EA", sys: 1240, phy: 1235, price: 62000 },
  { code: "FG-403", name: "수성 방수페인트 4L", cat: "제품", unit: "EA", sys: 2100, phy: 2150, price: 24000 },
  { code: "FG-404", name: "수성 우레탄 바닥재 20kg", cat: "제품", unit: "EA", sys: 430, phy: 429, price: 95000 },
  { code: "FG-405", name: "수성 스테인 4L", cat: "제품", unit: "EA", sys: 610, phy: 604, price: 21000 },
  { code: "FG-406", name: "수성 방청도료 18L", cat: "제품", unit: "EA", sys: 505, phy: 470, price: 72000 },
];

const ACCURACY: { month: string; label: string; rate: number }[] = [
  { month: "2026-04", label: "4월", rate: 71.0 },
  { month: "2026-05", label: "5월", rate: 68.0 },
  { month: "2026-06", label: "6월", rate: 75.0 },
  { month: "2026-07", label: "7월", rate: 64.0 },
  { month: "2026-08", label: "8월", rate: 70.0 },
  { month: "2026-09", label: "9월", rate: 62.5 },
];

function seed() {
  const db = getDb();

  db.exec(`
    DELETE FROM monthly_records;
    DELETE FROM monthly_accuracy;
    DELETE FROM items;
    DELETE FROM categories;
  `);

  const insertCategory = db.prepare(
    "INSERT INTO categories (name, sort_order) VALUES (?, ?)"
  );
  const categoryIds = new Map<string, number>();
  CATEGORIES.forEach((name, i) => {
    const result = insertCategory.run(name, i + 1);
    categoryIds.set(name, Number(result.lastInsertRowid));
  });

  const insertItem = db.prepare(
    "INSERT INTO items (code, name, category_id, unit, price) VALUES (?, ?, ?, ?, ?)"
  );
  const insertRecord = db.prepare(
    "INSERT INTO monthly_records (month, item_id, system_qty, physical_qty) VALUES (?, ?, ?, ?)"
  );

  for (const item of ITEMS) {
    const categoryId = categoryIds.get(item.cat);
    if (!categoryId) throw new Error(`Unknown category: ${item.cat}`);
    const result = insertItem.run(item.code, item.name, categoryId, item.unit, item.price);
    const itemId = Number(result.lastInsertRowid);
    insertRecord.run(LATEST_MONTH, itemId, item.sys, item.phy);
  }

  const insertAccuracy = db.prepare(
    "INSERT INTO monthly_accuracy (month, label, accuracy_pct) VALUES (?, ?, ?)"
  );
  for (const row of ACCURACY) {
    insertAccuracy.run(row.month, row.label, row.rate);
  }

  console.log(`Seeded ${CATEGORIES.length} categories, ${ITEMS.length} items, ${ACCURACY.length} months of accuracy data.`);
}

seed();
