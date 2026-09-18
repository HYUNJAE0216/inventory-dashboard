import type { CategoryTotal } from "@/lib/aggregate";
import { fmt } from "@/lib/format";
import type { TooltipHandler } from "./Tooltip";

interface Props {
  data: CategoryTotal[];
  onHover: TooltipHandler;
  onLeave: () => void;
}

const W = 600;
const H = 300;
const M_LEFT = 88;
const M_RIGHT = 58;
const M_TOP = 10;
const M_BOTTOM = 30;
const PLOT_W = W - M_LEFT - M_RIGHT;
const PLOT_H = H - M_TOP - M_BOTTOM;
const MAX_VAL = 45000;
const BAR_H = 15;
const GAP = 3;
const TICKS = [0, 15000, 30000, 45000];

function xScale(v: number) {
  return M_LEFT + (v / MAX_VAL) * PLOT_W;
}

export default function CategoryBarChart({ data, onHover, onLeave }: Props) {
  const bandH = PLOT_H / data.length;

  return (
    <svg className="chart" id="categoryChart" viewBox={`0 0 ${W} ${H}`}>
      {TICKS.map((t) => {
        const x = xScale(t);
        return (
          <g key={t}>
            <line className="grid-line" x1={x} x2={x} y1={M_TOP} y2={M_TOP + PLOT_H} />
            <text className="mono" x={x} y={M_TOP + PLOT_H + 18} fontSize={10.5} textAnchor="middle">
              {t / 1000}k
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const cy = M_TOP + i * bandH + bandH / 2;
        const y1 = cy - BAR_H - GAP / 2;
        const y2 = cy + GAP / 2;
        const diff = d.phy - d.sys;

        return (
          <g
            key={d.cat}
            className="hover-row"
            onMouseMove={(evt) =>
              onHover(evt, (
                <>
                  <b>{d.cat}</b>
                  <div className="tt-row"><span>전산재고</span><span>{fmt(d.sys)}</span></div>
                  <div className="tt-row"><span>실물재고</span><span>{fmt(d.phy)}</span></div>
                  <div className="tt-row"><span>차이</span><span>{diff >= 0 ? "+" : ""}{fmt(diff)}</span></div>
                </>
              ))
            }
            onMouseLeave={onLeave}
          >
            <rect className="hover-target" x={0} y={M_TOP + i * bandH} width={W} height={bandH} fill="transparent" />
            {d.isTotal && (
              <line x1={M_LEFT} x2={W - 10} y1={M_TOP + i * bandH} y2={M_TOP + i * bandH} stroke="var(--border)" strokeWidth={1} />
            )}
            <text x={M_LEFT - 10} y={cy + 4} textAnchor="end" fontSize={12.5} fontWeight={d.isTotal ? 700 : 600} fill="var(--ink)">
              {d.cat}
            </text>
            <rect x={M_LEFT} y={y1} width={Math.max(2, xScale(d.sys) - M_LEFT)} height={BAR_H} rx={4} fill="var(--accent-system)" />
            <rect x={M_LEFT} y={y2} width={Math.max(2, xScale(d.phy) - M_LEFT)} height={BAR_H} rx={4} fill="var(--accent-physical)" />
            <text className="mono val-label" x={xScale(d.sys) + 6} y={y1 + BAR_H - 3} fontSize={10.5}>
              {fmt(d.sys)}
            </text>
            <text className="mono val-label" x={xScale(d.phy) + 6} y={y2 + BAR_H - 3} fontSize={10.5}>
              {fmt(d.phy)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
