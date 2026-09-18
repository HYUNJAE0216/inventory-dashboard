export type ItemStatus = "정상" | "과잉" | "부족";

export const ACCURACY_THRESHOLD_PCT = 2;

export interface ItemMetrics {
  diff: number;
  pct: number;
  status: ItemStatus;
  value: number;
}

export function computeItemMetrics(
  systemQty: number,
  physicalQty: number,
  price: number
): ItemMetrics {
  const diff = physicalQty - systemQty;
  const pct = systemQty === 0 ? 0 : (diff / systemQty) * 100;
  const status: ItemStatus =
    Math.abs(pct) <= ACCURACY_THRESHOLD_PCT ? "정상" : pct > 0 ? "과잉" : "부족";
  const value = diff * price;
  return { diff, pct, status, value };
}
