import type { ReactNode, MouseEvent } from "react";

export type TooltipHandler = (evt: MouseEvent, content: ReactNode) => void;

export interface TooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

interface Props {
  state: TooltipState | null;
}

export default function Tooltip({ state }: Props) {
  return (
    <div
      id="chartTooltip"
      role="tooltip"
      className={state ? "show" : ""}
      style={state ? { left: state.x, top: state.y } : undefined}
    >
      {state?.content}
    </div>
  );
}
