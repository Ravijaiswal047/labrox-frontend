import React from "react";

/**
 * Ranked horizontal bars for a single measure.
 *
 * `rows` is [{ label, value, display?, danger? }]. One hue throughout —
 * there is only one measure here, so colour encodes nothing and must not
 * track rank. Length alone carries the magnitude. `danger` flips a bar to the
 * critical hue where the row is a genuine exception, not just the largest.
 */
const BarList = ({ rows = [], labelWidth = 190, emptyText = "Nothing to show." }) => {
  const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);

  if (!rows.length) return <div className="em-detail-empty">{emptyText}</div>;

  return (
    <div className="em-chart">
      {rows.map((r) => {
        const value = Number(r.value) || 0;
        const pct = Math.round((value / max) * 100);
        const text = r.display ?? value;
        return (
          <div className="em-bar-row" key={r.label}>
            <div className="em-bar-label" style={{ flexBasis: labelWidth }}>
              {r.label}
            </div>
            <div className="em-bar-track" title={`${r.label}: ${text}`}>
              {value > 0 ? (
                <div
                  className={`em-bar-fill ${r.danger ? "em-bar-fill-danger" : ""}`}
                  style={{ width: `${pct}%` }}
                >
                  <span className="em-bar-value">{text}</span>
                </div>
              ) : (
                /* No fill at zero — a visible bar would overstate the value. */
                <span className="em-bar-zero">{text}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarList;
