import type { ReactNode } from "react";

/** Keep real, selectable heading text while each line has its own reveal mask. */
export default function MotionLines({ lines }: { lines: ReactNode[] }) {
  return <>{lines.map((line, index) => (
    <span className="motion-line-mask" key={index}>
      <span className="motion-line" data-motion-title>{line}</span>
    </span>
  ))}</>;
}
