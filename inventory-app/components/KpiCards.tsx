import type { ItemRow } from "@/lib/types";
import { fmtPct } from "@/lib/format";

interface Props {
  items: ItemRow[];
}

export default function KpiCards({ items }: Props) {
  const total = items.length;
  const mismatched = items.filter((d) => d.status !== "정상");
  const normalPct = total === 0 ? 0 : ((total - mismatched.length) / total) * 100;
  const worst = items.slice().sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))[0];

  const tiles = [
    { label: "전체 조사 품목", value: `${total}종`, sub: <>5개 카테고리 기준</> },
    {
      label: "차이 발생 품목",
      value: `${mismatched.length}건`,
      sub: (
        <>
          전체의 <b>{total === 0 ? "0.0" : ((mismatched.length / total) * 100).toFixed(1)}%</b>
        </>
      ),
    },
    { label: "정상 품목 비율", value: `${normalPct.toFixed(1)}%`, sub: <>차이율 ±2% 이내 기준</> },
    {
      label: "최대 차이 품목",
      value: worst ? fmtPct(worst.pct) : "-",
      sub: worst ? <b>{worst.name}</b> : null,
    },
  ];

  return (
    <div className="kpi-grid" id="kpiGrid">
      {tiles.map((t) => (
        <div className="kpi-tile" key={t.label}>
          <div className="kpi-label">{t.label}</div>
          <div className="kpi-value mono">{t.value}</div>
          <div className="kpi-sub">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
