"use client";

import type { RulerSpan, ViewDef } from "@/lib/camperiada/configurator";
import { useDemoLocale } from "./use-demo-locale";

const MINOR = 100; // mm
const MAJOR = 500; // mm

function ticks(span: RulerSpan) {
  const out: { pos: number; mm: number; major: boolean }[] = [];
  for (let mm = 0; mm <= span.mm; mm += MINOR) {
    const t = mm / span.mm;
    const pos = span.reverse ? span.to - t * (span.to - span.from) : span.from + t * (span.to - span.from);
    out.push({ pos, mm, major: mm % MAJOR === 0 });
  }
  return out;
}

/**
 * Millimetre rulers along the top and left edges of the canvas, drawn in the
 * same 800 × 400 coordinate space as the blueprint layers so they line up.
 */
export function CanvasRulers({ view }: { view: ViewDef }) {
  const { t: text } = useDemoLocale();
  const { x, y } = view.rulers;
  const xEnd = x.reverse ? x.from : x.to;

  return (
    <svg
      viewBox="0 0 800 400"
      className="pointer-events-none absolute inset-0 z-[60] h-full w-full select-none"
      aria-hidden
    >
      {/* CSS variables only resolve in `style`, not in SVG presentation attributes. */}
      <g style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }} fontSize="7.5">
        {/* top ruler (length) */}
        <path d={`M${x.from} 4 H${x.to}`} stroke="rgb(113 113 122 / 0.7)" strokeWidth="1" />
        {ticks(x).map((t) => (
          <g key={`x${t.mm}`}>
            <path
              d={`M${t.pos} 4 V${t.major ? 12 : 8}`}
              stroke={t.major ? "rgb(161 161 170 / 0.9)" : "rgb(113 113 122 / 0.6)"}
              strokeWidth="1"
            />
            {t.major ? (
              <text x={t.pos} y="20" textAnchor="middle" fill="rgb(161 161 170)" className="max-sm:hidden">
                {t.mm}
              </text>
            ) : null}
          </g>
        ))}
        <path d={`M${xEnd} 2 V14`} stroke="rgb(52 211 153)" strokeWidth="1.5" />
        <text
          x={xEnd + (x.reverse ? -4 : 4)}
          y="11"
          textAnchor={x.reverse ? "end" : "start"}
          fill="rgb(110 231 183)"
          fontWeight="600"
          className="max-sm:hidden"
        >
          {x.mm} mm {text.rulers[x.label]}
        </text>

        {/* left ruler (width / height) */}
        <path d={`M4 ${y.from} V${y.to}`} stroke="rgb(113 113 122 / 0.7)" strokeWidth="1" />
        {ticks(y).map((t) => (
          <g key={`y${t.mm}`}>
            <path
              d={`M4 ${t.pos} H${t.major ? 12 : 8}`}
              stroke={t.major ? "rgb(161 161 170 / 0.9)" : "rgb(113 113 122 / 0.6)"}
              strokeWidth="1"
            />
            {t.major && t.mm > 0 ? (
              <text x="14" y={t.pos + 2.5} fill="rgb(161 161 170)" className="max-sm:hidden">
                {t.mm}
              </text>
            ) : null}
          </g>
        ))}
        <path d={`M2 ${y.to} H14`} stroke="rgb(52 211 153)" strokeWidth="1.5" />
        <text x="16" y={y.to + 10} fill="rgb(110 231 183)" fontWeight="600" className="max-sm:hidden">
          {y.mm} mm {text.rulers[y.label]}
        </text>
      </g>
    </svg>
  );
}
