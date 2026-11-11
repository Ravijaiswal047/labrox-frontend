import React from "react";
import Input from "@components/formComponent/Input";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const ALIGN_OPTIONS = ["left", "center", "right"];

// Shared column-config table used by both Body Table and Settlement tabs — same
// show/caption/width/align/reorder shape, just a different set of rows.
export default function ColumnConfigTable({ columns, onChange, loading }) {
  if (!columns.length) {
    return <div className="rbn-empty-text">{loading ? "Loading columns…" : "No columns found"}</div>;
  }

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= columns.length) return;
    const next = [...columns];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const patch = (index, patchObj) => {
    onChange(columns.map((c, i) => (i === index ? { ...c, ...patchObj } : c)));
  };

  return (
    <div className="rbn-column-table-wrap">
      <table className="rbn-column-table">
        <thead>
          <tr>
            <th>Show</th>
            <th>Column</th>
            <th>Printed caption</th>
            <th>Width %</th>
            <th>Align</th>
            <th>Order</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col, index) => (
            <tr key={col.key} className={col.visible ? "" : "rbn-row-dim"}>
              <td>
                <input type="checkbox" checked={col.visible} onChange={(e) => patch(index, { visible: e.target.checked })} />
              </td>
              <td className="rbn-mono">{col.key}</td>
              <td>
                <Input id={`rbn-col-${col.key}`} name="label" placeholder=" " value={col.label} onChange={(e) => patch(index, { label: e.target.value })} />
              </td>
              <td>
                <Input type="number" id={`rbn-w-${col.key}`} name="w" placeholder=" " value={col.w} onChange={(e) => patch(index, { w: Number(e.target.value) })} />
              </td>
              <td>
                <div className="rbn-inline-toggle">
                  {ALIGN_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`rbn-align-btn ${col.align === a ? "active" : ""}`}
                      onClick={() => patch(index, { align: a })}
                    >
                      {a[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </td>
              <td>
                <div className="rbn-inline-toggle">
                  <button type="button" className="rbn-order-btn" disabled={index === 0} onClick={() => move(index, -1)}>
                    <FaChevronUp size={11} />
                  </button>
                  <button type="button" className="rbn-order-btn" disabled={index === columns.length - 1} onClick={() => move(index, 1)}>
                    <FaChevronDown size={11} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
