import React from "react";
import RbnSection from "./RbnSection";
import ColumnConfigTable from "./ColumnConfigTable";
import { INCLUSION_STYLE_OPTIONS } from "../constants/bodyColumnsDefault";

export default function BodyTableTab({ bodyColumns, onBodyColumnsChange, inclusionStyle, onInclusionStyleChange, loading }) {
  return (
    <div className="rbn-body-table-tab">
      <RbnSection title={`Body table columns · ${bodyColumns.length} available`}>
        <ColumnConfigTable columns={bodyColumns} onChange={onBodyColumnsChange} loading={loading} />
      </RbnSection>

      <RbnSection title="Package inclusion style" last={true}>
        <div className="rbn-radio-group">
          {INCLUSION_STYLE_OPTIONS.map((opt) => (
            <label key={opt.value} className="rbn-radio-option">
              <input
                type="radio"
                name="inclusionStyle"
                checked={inclusionStyle === opt.value}
                onChange={() => onInclusionStyleChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="rbn-hint-text mt-1">
          Changes reflect live in Preview &amp; Print. The Inclusions column controls whether package contents print at all.
        </div>
      </RbnSection>
    </div>
  );
}
