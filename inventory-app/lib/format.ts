export function fmt(v: number): string {
  return Math.round(v).toLocaleString("ko-KR");
}

export function fmtPct(v: number): string {
  return (v > 0 ? "+" : "") + v.toFixed(1) + "%";
}

export function fmtWon(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  return sign + Math.abs(Math.round(v)).toLocaleString("ko-KR") + "원";
}

export function fmtWonShort(v: number): string {
  const man = v / 10000;
  const sign = man > 0 ? "+" : man < 0 ? "-" : "";
  return sign + Math.round(Math.abs(man)) + "만";
}
