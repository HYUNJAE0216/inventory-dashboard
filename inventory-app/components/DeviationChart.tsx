import type { CategoryDeviation } from "@/lib/aggregate";
import { fmtWon, fmtWonShort } from "@/lib/format";
import type { TooltipHandler } from "./Tooltip";

interface Props {
  data: CategoryDeviation[];
  onHover: TooltipHandler;
  onLeave: () => void;
}

const W = 600;
const H = 300;
const M_LEFT = 96;
const M_RIGHT = 60;
const M_TOP = 10;
const M_BOTTOM = 26;
const PLOT_W = W - M_LEFT - M_RIGHT;
const PLOT_H = H - M_TOP - M_BOTTOM;
const BOUND = 10_000_000;
const CENTER_X = M_LEFT + PLOT_W / 2;
const BAR_H = 20;
const TICKS = [-10_000_000, -5_000_000, 0, 5_000_000, 10_000_000];

function xScale(v: number) {
  return CENTER_X + (v / BOUND) * (PLOT_W / 2);
}

export default function DeviationChart({ data, onHover, onLeave }: Props) {
  const bandH = PLOT_H / data.length;

  return (
    <svg className="chart" id="deviationChart" viewBox={`0 0 ${W} ${H}`}>
      {TICKS.map((t) => {
        const x = xScale(t);
        return (
          <g key={t}>
            <line className={t === 0 ? "zero-line" : "grid-line"} x1={x} x2={x} y1={M_TOP} y2={M_TOP + PLOT_H} />
            <text className="mono" x={x} y={M_TOP + PLOT_H + 18} fontSize={10.5} textAnchor="middle">
              {t === 0 ? "0" : `${fmtWonShort(t)}원`}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const cy = M_TOP + i * bandH + bandH / 2;
        const x0 = xScale(0);
        const x1 = xScale(d.value);
        const color = d.value < 0 ? "var(--critical)" : "var(--warning)";

        return (
          <g
            key={d.cat}
            className="hover-row"
            onMouseMove={(evt) =>
              onHover(evt, (
                <>
                  <b>{d.cat}</b>
                  <div className="tt-row"><span>재고편차 금액</span><span>{fmtWon(d.value)}</span></div>
                  <div className="tt-row"><span>부족 품목</span><span>{d.shortCount}건</span></div>
                  <div className="tt-row"><span>과잉 품목</span><span>{d.overCount}건</span></div>
                  <div className="tt-row"><span>전체 품목</span><span>{d.itemCount}종</span></div>
                </>
              ))
            }
            onMouseLeave={onLeave}
          >
            <rect className="hover-target" x={0} y={M_TOP + i * bandH} width={W} height={bandH} fill="transparent" />
            {d.isTotal && (
              <line x1={10} x2={W - 10} y1={M_TOP + i * bandH} y2={M_TOP + i * bandH} stroke="var(--border)" strokeWidth={1} />
            )}
            <text x={M_LEFT - 10} y={cy + 4} textAnchor="end" fontSize={12.5} fontWeight={d.isTotal ? 700 : 600} fill="var(--ink)">
              {d.cat}
            </text>
            <rect
              x={Math.min(x0, x1)}
              y={cy - BAR_H / 2}
              width={Math.max(2, Math.abs(x1 - x0))}
              height={BAR_H}
              rx={4}
              fill={color}
            />
            <text
              className="mono val-label"
              y={cy + 4}
              fontSize={11}
              x={d.value < 0 ? x1 - 6 : x1 + 6}
              textAnchor={d.value < 0 ? "end" : "start"}
            >
              {fmtWonShort(d.value)}원
            </text>
          </g>
        );
      })}
    </svg>
  );
}
