import React from "react";

/**
 * Part-to-whole donut with a hero total in the middle.
 *
 * `segments` is [{ label, value, color }]. Every segment is also named and
 * counted in the legend, so the split never rests on colour alone — which is
 * what makes the palettes below legal at their CVD separation.
 */
const Donut = ({ segments = [], caption = "" }) => {
  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const total = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
  const drawn = segments.filter((s) => s.value > 0);
  // A 2px gap between neighbouring arcs keeps the boundary readable.
  const GAP = drawn.length > 1 ? 2 : 0;

  let offset = 0;

  return (
    <div className="em-donut-wrap">
      <div className="em-donut">
        <svg viewBox="0 0 140 140" role="img" aria-label={caption}>
          <g transform="rotate(-90 70 70)">
            <circle cx="70" cy="70" r={R} fill="none" stroke="#eef2f5" strokeWidth="18" />
            {drawn.map((s) => {
              const len = (s.value / total) * CIRC;
              const dash = Math.max(len - GAP, 0.5);
              const arc = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="18"
                  strokeDasharray={`${dash} ${CIRC - dash}`}
                  strokeDashoffset={-offset}
                >
                  <title>{`${s.label}: ${s.value}`}</title>
                </circle>
              );
              offset += len;
              return arc;
            })}
          </g>
        </svg>
        <div className="em-donut-center">
          <div className="em-donut-total">{total}</div>
          <div className="em-donut-caption">{caption}</div>
        </div>
      </div>

      <div className="em-donut-legend">
        {segments.map((s) => (
          <span className="em-legend-item" key={s.label}>
            <i className="em-legend-swatch" style={{ background: s.color }} />
            {s.label} ({s.value})
          </span>
        ))}
      </div>
    </div>
  );
};

export default Donut;
