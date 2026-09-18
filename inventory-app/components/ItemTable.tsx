"use client";

import { useMemo, useState } from "react";
import type { ItemRow } from "@/lib/types";
import type { ItemStatus } from "@/lib/status";
import { fmt, fmtPct, fmtWon } from "@/lib/format";

interface Props {
  items: ItemRow[];
}

type ColumnKey = "code" | "name" | "cat" | "sys" | "phy" | "diff" | "pct" | "price" | "value" | "status";

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "code", label: "코드" },
  { key: "name", label: "품목명" },
  { key: "cat", label: "카테고리" },
  { key: "sys", label: "전산재고" },
  { key: "phy", label: "실물재고" },
  { key: "diff", label: "차이수량" },
  { key: "pct", label: "차이율" },
  { key: "price", label: "재고단가" },
  { key: "value", label: "차이금액" },
  { key: "status", label: "상태" },
];

const NUMERIC_KEYS: ColumnKey[] = ["sys", "phy", "diff", "pct", "price", "value"];
const STATUS_FILTERS: (ItemStatus | "전체")[] = ["전체", "정상", "과잉", "부족"];

export default function ItemTable({ items }: Props) {
  const [sortKey, setSortKey] = useState<ColumnKey>("pct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeStatus, setActiveStatus] = useState<ItemStatus | "전체">("전체");
  const [searchTerm, setSearchTerm] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { 전체: items.length, 정상: 0, 과잉: 0, 부족: 0 };
    items.forEach((d) => { c[d.status] += 1; });
    return c;
  }, [items]);

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = items.filter((d) => {
      const statusOk = activeStatus === "전체" || d.status === activeStatus;
      const searchOk = !term || d.name.toLowerCase().includes(term) || d.code.toLowerCase().includes(term);
      return statusOk && searchOk;
    });
    filtered.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === "string" && typeof bv === "string") {
        cmp = av.toLowerCase() < bv.toLowerCase() ? -1 : av.toLowerCase() > bv.toLowerCase() ? 1 : 0;
      } else {
        cmp = av < bv ? -1 : av > bv ? 1 : 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return filtered;
  }, [items, activeStatus, searchTerm, sortKey, sortDir]);

  function handleSort(key: ColumnKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(NUMERIC_KEYS.includes(key) ? "desc" : "asc");
    }
  }

  return (
    <>
      <div className="table-toolbar">
        <div className="chips" id="statusChips" role="group" aria-label="상태 필터">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              aria-pressed={s === activeStatus}
              onClick={() => setActiveStatus(s)}
            >
              {s} {counts[s]}
            </button>
          ))}
        </div>
        <div className="search-box">
          <input
            type="text"
            id="searchInput"
            placeholder="품목명 또는 코드 검색"
            aria-label="품목 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="table-scroll">
        <table id="itemTable">
          <thead>
            <tr id="tableHeadRow">
              {COLUMNS.map((col) => {
                const isActive = sortKey === col.key;
                const arrow = isActive ? (sortDir === "asc" ? "▲" : "▼") : "↕";
                return (
                  <th key={col.key} data-active={isActive ? "true" : "false"}>
                    <button type="button" onClick={() => handleSort(col.key)}>
                      {col.label} <span className="arrow">{arrow}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody id="tableBody">
            {rows.length === 0 && (
              <tr className="empty-row">
                <td colSpan={COLUMNS.length}>조건에 맞는 품목이 없습니다.</td>
              </tr>
            )}
            {rows.map((d) => {
              const diffClass = d.diff > 0 ? "diff-pos" : d.diff < 0 ? "diff-neg" : "diff-zero";
              return (
                <tr key={d.code}>
                  <td className="code-cell mono">{d.code}</td>
                  <td className="name-cell">{d.name}</td>
                  <td>{d.cat}</td>
                  <td className="mono">{fmt(d.sys)} {d.unit}</td>
                  <td className="mono">{fmt(d.phy)} {d.unit}</td>
                  <td className={`mono ${diffClass}`}>{d.diff > 0 ? "+" : ""}{fmt(d.diff)}</td>
                  <td className={`mono ${diffClass}`}>{fmtPct(d.pct)}</td>
                  <td className="mono">{fmt(d.price)}원</td>
                  <td className={`mono ${diffClass}`}>{fmtWon(d.value)}</td>
                  <td>
                    <span className={`status-pill status-${d.status}`}>
                      <span className="dot"></span>{d.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
