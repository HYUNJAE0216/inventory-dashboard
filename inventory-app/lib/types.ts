import type { ItemStatus } from "./status";

export interface ItemRow {
  code: string;
  name: string;
  cat: string;
  unit: string;
  price: number;
  sys: number;
  phy: number;
  diff: number;
  pct: number;
  status: ItemStatus;
  value: number;
}

export interface MonthOption {
  month: string;
  label: string;
  hasDetail: boolean;
}

export interface AccuracyPoint {
  month: string;
  label: string;
  rate: number;
}
