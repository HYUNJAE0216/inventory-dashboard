import type { AccuracyPoint } from "@/lib/types";
import type { TooltipHandler } from "./Tooltip";

interface Props {
  data: AccuracyPoint[];
  target: number;
  selectedMonth: string;
  onHover: TooltipHandler;
  onLeave: () => void;
}

const W = 900;
const H = 220;
const M_LEFT = 46;
const M_RIGHT = 70;
const M_TOP = 16;
const M_BOTTOM = 32;
const PLOT_W = W - M_LEFT - M_RIGHT;
const PLOT_H = H - M_TOP - M_BOTTOM;
const Y_MIN = 50;
const Y_MAX = 100;
const Y_TICKS = [50, 60, 70, 80, 90, 100];

function yScale(v: number) {
  return M_TOP + PLOT_H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;
}

export default function TrendChart({ data, target, selectedMonth, onHover, onLeave }: Props) {
  if (data.length === 0) return <svg className="chart" id="trendChart" viewBox={`0 0 ${W} ${H}`} />;

  const xScale = (i: number) => M_LEFT + (i / (data.length - 1)) * PLOT_W;
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.rate)}`).join(" ");
  const ty = yScale(target);

  return (
    <svg className="chart" id="trendChart" viewBox={`0 0 ${W} ${H}`}>
      {Y_TICKS.map((t) => {
        const y = yScale(t);
        return (
          <g key={t}>
            <line className="grid-line" x1={M_LEFT} x2={M_LEFT + PLOT_W} y1={y} y2={y} />
            <text className="mono" x={M_LEFT - 10} y={y + 4} fontSize={10.5} textAnchor="end">
              {t}%
            </text>
          </g>
        );
      })}

      <line x1={M_LEFT} x2={M_LEFT + PLOT_W} y1={ty} y2={ty} stroke="var(--ink-faint)" strokeWidth={1.5} strokeDasharray="5,4" />
      <text className="mono" x={M_LEFT + PLOT_W + 8} y={ty + 4} fontSize={11} fill="var(--ink-muted)">
        목표 {target}%
      </text>

      <path d={pathD} fill="none" stroke="var(--accent-system)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {data.map((d, i) => {
        const x = xScale(i);
        const y = yScale(d.rate);
        const isSelected = d.month === selectedMonth;
        const r = isSelected ? 6 : 4.5;
        const showLabel = i === 0 || i === data.length - 1 || isSelected;

        return (
          <g key={d.month}>
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={isSelected ? "var(--accent-physical)" : "var(--accent-system)"}
              stroke={isSelected ? "var(--surface)" : undefined}
              strokeWidth={isSelected ? 2 : undefined}
            />
            {showLabel && (
              <text className="mono val-label" x={x} y={y - 12} fontSize={11.5} textAnchor="middle" fontWeight={600}>
                {d.rate.toFixed(1)}%
              </text>
            )}
            <text className="mono" x={x} y={M_TOP + PLOT_H + 20} fontSize={11} textAnchor="middle">
              {d.label}
            </text>
            <rect
              x={x - PLOT_W / (data.length * 2)}
              y={M_TOP}
              width={PLOT_W / data.length}
              height={PLOT_H}
              fill="transparent"
              onMouseMove={(evt) =>
                onHover(evt, (
                  <>
                    <b>{d.month}</b>
                    <div className="tt-row"><span>정상 품목 비율</span><span>{d.rate.toFixed(1)}%</span></div>
                  </>
                ))
              }
              onMouseLeave={onLeave}
            />
          </g>
        );
      })}
    </svg>
  );
}
