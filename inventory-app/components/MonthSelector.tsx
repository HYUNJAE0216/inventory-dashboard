import type { MonthOption } from "@/lib/types";

interface Props {
  months: MonthOption[];
  value: string;
  onChange: (month: string) => void;
}

export default function MonthSelector({ months, value, onChange }: Props) {
  return (
    <div className="controls">
      <label htmlFor="monthSelect">조사월</label>
      <select
        id="monthSelect"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {months.map((m) => {
          const [year, monthNum] = m.month.split("-");
          return (
            <option key={m.month} value={m.month}>
              {year}년 {Number(monthNum)}월
            </option>
          );
        })}
      </select>
    </div>
  );
}
