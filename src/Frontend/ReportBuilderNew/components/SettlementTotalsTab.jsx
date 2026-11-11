import React from "react";
import RbnSection from "./RbnSection";
import Input from "@components/formComponent/Input";
import ColumnConfigTable from "./ColumnConfigTable";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { computeSampleTotals, formatMoney } from "../utils/computeTotals";

export default function SettlementTotalsTab({
  settlementColumns,
  onSettlementColumnsChange,
  totals,
  onTotalsChange,
  showSettlement,
  onShowSettlementChange,
  loading,
}) {
  const sampleTotals = computeSampleTotals();

  const patchTotal = (index, patch) => {
    onTotalsChange(totals.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  // Same up/down swap used by ColumnConfigTable (Body/Settlement column order) — the
  // Totals block prints in this array order, gross-to-due by default, but a template may
  // want e.g. "Amount Paid" before "Discount".
  const moveTotal = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= totals.length) return;
    const next = [...totals];
    [next[index], next[target]] = [next[target], next[index]];
    onTotalsChange(next);
  };

  return (
    <div className="rbn-settlement-tab">
      <RbnSection title="Settlement table">
        <label className="rbn-checkbox-option">
          <input type="checkbox" checked={showSettlement} onChange={(e) => onShowSettlementChange(e.target.checked)} />
          Print payment breakup (settlement table) on the receipt
        </label>
        {showSettlement && (
          <div className="mt-2">
            <ColumnConfigTable columns={settlementColumns} onChange={onSettlementColumnsChange} loading={loading} />
          </div>
        )}
      </RbnSection>

      <RbnSection title="Totals block" last={true}>
        {!totals.length ? (
          <div className="rbn-empty-text">{loading ? "Loading totals…" : "No data found"}</div>
        ) : (
          <div className="rbn-column-table-wrap">
            <table className="rbn-column-table">
              <thead>
                <tr>
                  <th>Show</th>
                  <th>Total</th>
                  <th>Printed caption</th>
                  <th>Bold key</th>
                  <th>Bold value</th>
                  <th>Sample value</th>
                  <th>Order</th>
                </tr>
              </thead>
              <tbody>
                {totals.map((row, index) => (
                  <tr key={row.key} className={row.visible ? "" : "rbn-row-dim"}>
                    <td>
                      <input type="checkbox" checked={row.visible} onChange={(e) => patchTotal(index, { visible: e.target.checked })} />
                    </td>
                    <td className="rbn-mono">{row.key}</td>
                    <td>
                      <Input id={`rbn-total-${row.key}`} name="label" placeholder=" " value={row.label} onChange={(e) => patchTotal(index, { label: e.target.value })} />
                    </td>
                    <td>
                      {/* Falls back to the older shared `bold` flag so a row that never
                          touched these two new toggles keeps showing its current state,
                          same fallback TotalsBlockPreview uses at render time. */}
                      <input
                        type="checkbox"
                        checked={row.boldLabel ?? !!row.bold}
                        onChange={(e) => patchTotal(index, { boldLabel: e.target.checked })}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.boldValue ?? !!row.bold}
                        onChange={(e) => patchTotal(index, { boldValue: e.target.checked })}
                      />
                    </td>
                    <td>{formatMoney(sampleTotals[row.key])}</td>
                    <td>
                      <div className="rbn-inline-toggle">
                        <button type="button" className="rbn-order-btn" disabled={index === 0} onClick={() => moveTotal(index, -1)}>
                          <FaChevronUp size={11} />
                        </button>
                        <button
                          type="button"
                          className="rbn-order-btn"
                          disabled={index === totals.length - 1}
                          onClick={() => moveTotal(index, 1)}
                        >
                          <FaChevronDown size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </RbnSection>
    </div>
  );
}
