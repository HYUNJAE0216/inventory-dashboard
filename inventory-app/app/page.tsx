"use client";

import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import LoginGate from "@/components/LoginGate";
import MonthSelector from "@/components/MonthSelector";
import KpiCards from "@/components/KpiCards";
import CategoryBarChart from "@/components/CategoryBarChart";
import DeviationChart from "@/components/DeviationChart";
import TrendChart from "@/components/TrendChart";
import ItemTable from "@/components/ItemTable";
import Tooltip, { type TooltipState } from "@/components/Tooltip";
import { categoryTotals, categoryDeviations } from "@/lib/aggregate";
import type { AccuracyPoint, ItemRow, MonthOption } from "@/lib/types";

export default function Page() {
  const [authenticated, setAuthenticated] = useState(false);
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [trend, setTrend] = useState<{ target: number; data: AccuracyPoint[] }>({ target: 90, data: [] });
  const [items, setItems] = useState<ItemRow[]>([]);
  const [hasDetail, setHasDetail] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    if (!authenticated) return;
    Promise.all([
      fetch("/api/months").then((r) => r.json()) as Promise<MonthOption[]>,
      fetch("/api/accuracy-trend").then((r) => r.json()) as Promise<{ target: number; data: AccuracyPoint[] }>,
    ]).then(([monthsRes, trendRes]) => {
      setMonths(monthsRes);
      setTrend(trendRes);
      const latest = monthsRes[monthsRes.length - 1];
      if (latest) setSelectedMonth(latest.month);
    });
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !selectedMonth) return;
    fetch(`/api/inventory?month=${selectedMonth}`)
      .then((r) => r.json())
      .then((res: { hasDetail: boolean; items: ItemRow[] }) => {
        setHasDetail(res.hasDetail);
        setItems(res.items);
      });
  }, [authenticated, selectedMonth]);

  const catTotals = useMemo(() => categoryTotals(items), [items]);
  const catDeviations = useMemo(() => categoryDeviations(items), [items]);

  function handleHover(evt: MouseEvent, content: React.ReactNode) {
    setTooltip({ x: evt.clientX, y: evt.clientY, content });
  }
  function handleLeave() {
    setTooltip(null);
  }

  if (!authenticated) {
    return <LoginGate onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="wrap">
      <div className="topbar">
        <div className="title-block">
          <h1>
            재고 대사 현황<span className="badge-sample">예시 데이터</span>
          </h1>
          <p>매월 실시하는 실물재고 조사 결과를 전산재고와 대조합니다. 품목별 수치 비교와 차트 비교를 한 화면에서 확인하세요.</p>
        </div>
        <div>
          <MonthSelector
            months={months}
            value={selectedMonth}
            onChange={(month) => {
              setTooltip(null);
              setSelectedMonth(month);
            }}
          />
          <div className="sync-note" id="syncNote">
            {hasDetail ? "최근 실사 기준" : "품목 상세 미연동"}
          </div>
        </div>
      </div>

      {hasDetail && (
        <section id="kpiSection">
          <p className="eyebrow">핵심 지표</p>
          <KpiCards items={items} />
        </section>
      )}

      <section id="chartSection">
        <p className="eyebrow">차트 비교</p>
        {hasDetail && (
          <div className="chart-row">
            <div className="card">
              <h3>카테고리별 전산재고 vs 실물재고</h3>
              <p className="card-sub">카테고리 내 품목 수량 합계 기준</p>
              <div className="legend">
                <span><i style={{ background: "var(--accent-system)" }}></i>전산재고</span>
                <span><i style={{ background: "var(--accent-physical)" }}></i>실물재고</span>
              </div>
              <CategoryBarChart data={catTotals} onHover={handleHover} onLeave={handleLeave} />
            </div>
            <div className="card">
              <h3>카테고리별 재고 금액 편차</h3>
              <p className="card-sub">재고단가 기준 전산 대비 실물재고 차이 금액 합계</p>
              <div className="legend">
                <span><i style={{ background: "var(--critical)" }}></i>부족 금액(실물 &lt; 전산)</span>
                <span><i style={{ background: "var(--warning)" }}></i>과잉 금액(실물 &gt; 전산)</span>
              </div>
              <DeviationChart data={catDeviations} onHover={handleHover} onLeave={handleLeave} />
            </div>
          </div>
        )}
        <div className="card">
          <h3>최근 6개월 재고 정확도 추이</h3>
          <p className="card-sub">차이율 ±2% 이내 품목 비율(%) · 점선은 목표치</p>
          <TrendChart data={trend.data} target={trend.target} selectedMonth={selectedMonth} onHover={handleHover} onLeave={handleLeave} />
        </div>
      </section>

      {hasDetail ? (
        <section id="tableSection">
          <p className="eyebrow">품목별 상세 비교</p>
          <ItemTable items={items} />
        </section>
      ) : (
        selectedMonth && (
          <div id="placeholderSection" className="placeholder">
            <div className="ph-icon">🗂️</div>
            <h3>준비중</h3>
            <p>선택하신 조사월의 품목별 상세 데이터는 아직 연동되지 않았습니다. 실물재고·전산재고 원본 데이터가 확인되면 동일한 화면 구조로 채워질 예정입니다.</p>
          </div>
        )
      )}

      <footer className="note">
        ※ 현재 화면의 수치는 전산재고·실물재고 시스템 연동 전 확인용 예시 데이터입니다. 실제 데이터 연동 시 동일한 구조로 교체됩니다.
      </footer>

      <Tooltip state={tooltip} />
    </div>
  );
}
