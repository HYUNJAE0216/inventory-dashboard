import type { ItemRow } from "./types";

export const CATEGORY_ORDER = ["원료", "부재료", "재공품", "제품"];

export interface CategoryTotal {
  cat: string;
  sys: number;
  phy: number;
  isTotal?: boolean;
}

export function categoryTotals(items: ItemRow[]): CategoryTotal[] {
  const rows: CategoryTotal[] = CATEGORY_ORDER.map((cat) => {
    const inCat = items.filter((d) => d.cat === cat);
    return {
      cat,
      sys: inCat.reduce((a, d) => a + d.sys, 0),
      phy: inCat.reduce((a, d) => a + d.phy, 0),
    };
  });
  rows.push({
    cat: "전체",
    sys: rows.reduce((a, d) => a + d.sys, 0),
    phy: rows.reduce((a, d) => a + d.phy, 0),
    isTotal: true,
  });
  return rows;
}

export interface CategoryDeviation {
  cat: string;
  value: number;
  shortCount: number;
  overCount: number;
  itemCount: number;
  isTotal?: boolean;
}

export function categoryDeviations(items: ItemRow[]): CategoryDeviation[] {
  const rows: CategoryDeviation[] = CATEGORY_ORDER.map((cat) => {
    const inCat = items.filter((d) => d.cat === cat);
    return {
      cat,
      value: inCat.reduce((a, d) => a + d.value, 0),
      shortCount: inCat.filter((d) => d.status === "부족").length,
      overCount: inCat.filter((d) => d.status === "과잉").length,
      itemCount: inCat.length,
    };
  });
  rows.push({
    cat: "전체",
    value: rows.reduce((a, d) => a + d.value, 0),
    shortCount: rows.reduce((a, d) => a + d.shortCount, 0),
    overCount: rows.reduce((a, d) => a + d.overCount, 0),
    itemCount: rows.reduce((a, d) => a + d.itemCount, 0),
    isTotal: true,
  });
  return rows;
}
