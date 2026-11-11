import React from "react";
import Input from "@components/formComponent/Input";

const TABLE_BORDER_OPTIONS = [
  { key: "headerTopBorder", label: "Header top border" },
  { key: "headerBottomBorder", label: "Header bottom border (underline)" },
  { key: "outerBorder", label: "Full table border (outer box)" },
  { key: "cellBorder", label: "Cell border (all sides, every row)" },
];

// Shared by every place a table's border/header styling can be edited — Page & Branding's
// three "... table borders" sections (wide tab, `compact` off — 4-across grid), and the
// Property Panel when a table anchor (bodytable/settletable/totalsblock) is selected
// directly on the canvas/Layers list (narrow sidebar, `compact` on — one field per row;
// the wide-grid layout wrapped/overlapped badly at sidebar width).
export default function TableBorderFields({ value, onChange, compact = false }) {
  const colourFields = [
    { key: "borderColor", label: "Border colour" },
    ...(value.headerFill ? [{ key: "headerBg", label: "Header background" }, { key: "headerColor", label: "Header text colour" }] : []),
  ];

  return (
    <>
      <div className="rbn-checkbox-group">
        {TABLE_BORDER_OPTIONS.map((opt) => (
          <label key={opt.key} className="rbn-checkbox-option">
            <input type="checkbox" checked={!!value[opt.key]} onChange={(e) => onChange({ [opt.key]: e.target.checked })} />
            {opt.label}
          </label>
        ))}
        <label className="rbn-checkbox-option">
          <input type="checkbox" checked={!!value.headerFill} onChange={(e) => onChange({ headerFill: e.target.checked })} />
          Header row background fill
        </label>
        <label className="rbn-checkbox-option">
          <input
            type="checkbox"
            checked={value.headerUppercase !== false}
            onChange={(e) => onChange({ headerUppercase: e.target.checked })}
          />
          Uppercase header labels
        </label>
      </div>
      <div className="rbn-hint-text mt-1">
        Uncheck "Header row background fill" for a plain white header (just whatever border
        lines are checked above) instead of a solid coloured band — matches a plain
        black-and-white receipt style.
      </div>

      {compact ? (
        <div className="mt-2">
          <div className="mb-2">
            <Input
              type="number"
              name="borderWidth"
              lable="Border width (px)"
              placeholder=" "
              value={value.borderWidth}
              onChange={(e) => onChange({ borderWidth: Math.max(0, Number(e.target.value) || 0) })}
            />
          </div>
          {colourFields.map((f) => (
            <label key={f.key} className="rbn-color-label mb-2">
              {f.label}
              <input type="color" value={value[f.key]} onChange={(e) => onChange({ [f.key]: e.target.value })} />
            </label>
          ))}
        </div>
      ) : (
        <div className="row rbn-prop-row mt-2">
          <div className="col-sm-3 mb-2">
            <Input
              type="number"
              name="borderWidth"
              lable="Border width (px)"
              placeholder=" "
              value={value.borderWidth}
              onChange={(e) => onChange({ borderWidth: Math.max(0, Number(e.target.value) || 0) })}
            />
          </div>
          {colourFields.map((f) => (
            <div key={f.key} className="col-sm-3 mb-2 rbn-color-field">
              <label className="rbn-color-label">
                {f.label}
                <input type="color" value={value[f.key]} onChange={(e) => onChange({ [f.key]: e.target.value })} />
              </label>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
