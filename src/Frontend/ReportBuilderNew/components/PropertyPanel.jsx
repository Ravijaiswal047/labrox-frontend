import React from "react";
import Input from "@components/formComponent/Input";
import ReactSelect from "@components/formComponent/ReactSelect";
import { CustomButton, DeleteButton } from "@components/UI/CustomButton";
import RbnSection from "./RbnSection";
import LocalImagePicker from "./LocalImagePicker";
import TableBorderFields from "./TableBorderFields";
import { useDesigner } from "./DesignerTab";
import LayersList from "./LayersList";
import { SINGLETON_TYPES } from "../constants/elementDefaults";
import { DEFAULT_TABLE_BORDER } from "../utils/layoutJson";

// Which `template.meta` field each table anchor's border styling lives in — border config
// is per-table but stored on the template, not on the element itself (Page & Branding's
// three "... table borders" sections write to the same fields), so selecting the anchor
// here just needs to read/patch the right one.
const TABLE_BORDER_META_KEY = {
  bodytable: "tableBorder",
  settletable: "settlementTableBorder",
  totalsblock: "totalsTableBorder",
};

const ALIGN_OPTIONS = [
  { value: "left", label: "L" },
  { value: "center", label: "C" },
  { value: "right", label: "R" },
];

const BORDER_SIDES = [
  { key: "borderTop", label: "T" },
  { key: "borderRight", label: "R" },
  { key: "borderBottom", label: "B" },
  { key: "borderLeft", label: "L" },
];

const NUMERIC_FIELDS = ["x", "y", "w", "h"];

export default function PropertyPanel() {
  const { elements, selectedId, updateElement, deleteElement, duplicateElement, reorder, fieldTokens, meta, onMetaChange } = useDesigner();
  const el = elements.find((e) => e.id === selectedId);
  const tokenOptions = [...(fieldTokens?.headerFields || []), ...(fieldTokens?.footerFields || [])].map((f) => ({
    label: `${f.token} — ${f.label}`,
    value: f.token,
  }));

  if (!el) {
    return (
      <div className="rbn-property-panel">
        <div className="rbn-panel-title">Layers</div>
        <LayersList />
      </div>
    );
  }

  const isSingleton = SINGLETON_TYPES.includes(el.type);
  const tableBorderMetaKey = TABLE_BORDER_META_KEY[el.type];
  const tableBorderValue = tableBorderMetaKey ? { ...DEFAULT_TABLE_BORDER, ...meta?.[tableBorderMetaKey] } : null;
  const setTableBorderValue = (patch) => onMetaChange({ [tableBorderMetaKey]: { ...tableBorderValue, ...patch } });
  const hasFontStyle = !["line", "rect", "bodytable", "settletable", "totalsblock", "image", "stamp"].includes(el.type);
  const hasTypeContent =
    el.type === "field" ||
    el.type === "label" ||
    el.type === "html" ||
    el.type === "barcode" ||
    el.type === "qrcode" ||
    el.type === "image" ||
    el.type === "stamp";

  return (
    <div className="rbn-property-panel">
      <div className="rbn-panel-title">Properties · {el.type}</div>

      {/* Single continuous panel — categories are separated by a divider + small
          caption label, not by separate boxed/collapsible sections. */}
      <RbnSection title="Position, size & style">
        <div className="rbn-field-grid">
          {NUMERIC_FIELDS.map((key) => (
            <Input
              key={key}
              type="number"
              id={`rbn-${key}`}
              name={key}
              lable={key.toUpperCase()}
              placeholder=" "
              value={Math.round(el[key] ?? 0)}
              onChange={(e) => updateElement(el.id, { [key]: Number(e.target.value) })}
            />
          ))}
        </div>

        {hasFontStyle && (
          <>
            <div className="rbn-field-grid mt-2">
              <Input
                type="number"
                id="rbn-fontsize"
                name="fontSize"
                lable="Font size"
                placeholder=" "
                value={el.fontSize || 9}
                onChange={(e) => updateElement(el.id, { fontSize: Number(e.target.value) })}
              />
            </div>
            <div className="rbn-inline-toggle mt-2">
              {/* For `field` elements, "bold" is ambiguous (key vs. value) — that type gets
                  its own dedicated "Bold key"/"Bold value" toggles below instead. */}
              {el.type !== "field" && (
                <CustomButton text="B" variant={el.bold ? "primary" : "outline"} onClick={() => updateElement(el.id, { bold: !el.bold })} />
              )}
              <CustomButton text="I" variant={el.italic ? "primary" : "outline"} onClick={() => updateElement(el.id, { italic: !el.italic })} />
              <span className="rbn-toggle-sep" />
              {ALIGN_OPTIONS.map((opt) => (
                <CustomButton
                  key={opt.value}
                  text={opt.label}
                  variant={el.align === opt.value ? "primary" : "outline"}
                  onClick={() => updateElement(el.id, { align: opt.value })}
                />
              ))}
            </div>
            <label className="rbn-color-label mt-2">
              Colour
              <input type="color" value={el.color || "#20242B"} onChange={(e) => updateElement(el.id, { color: e.target.value })} />
            </label>
          </>
        )}

        <div className="rbn-opacity-row mt-2">
          <span>Opacity</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={el.opacity ?? 1}
            onChange={(e) => updateElement(el.id, { opacity: Number(e.target.value) })}
          />
        </div>

        {/* Every element type can rotate, not just barcode/qrcode (which used to be the
            only two with this control) — same field either way, just typed here or dragged
            via the small handle above the selected element on canvas. Excluded for table
            anchors: their own live-table preview components don't render through a
            rotation wrapper (rotating a whole data table isn't a meaningful thing to
            support), so the control would just silently do nothing there. */}
        {!isSingleton && (
          <div className="rbn-field-grid mt-2">
            <Input
              type="number"
              id="rbn-rotation"
              name="rotation"
              lable="Rotation°"
              placeholder=" "
              value={el.rotation || 0}
              onChange={(e) => updateElement(el.id, { rotation: Number(e.target.value) })}
            />
          </div>
        )}
      </RbnSection>

      {hasTypeContent && (
        <RbnSection
          title={
            el.type === "html"
              ? "HTML content"
              : el.type === "label"
                ? "Text content"
                : el.type === "field"
                  ? "Token binding"
                  : el.type === "image" || el.type === "stamp"
                    ? "Picture"
                    : "Source & rotation"
          }
        >
          {el.type === "field" && (
            <>
              <ReactSelect
                id="rbn-token"
                name="token"
                placeholderName="Field token"
                dynamicOptions={tokenOptions}
                value={el.token}
                onChange={(_, opt) => updateElement(el.id, { token: opt?.value || "" })}
              />
              <div className="mt-2">
                <Input
                  id="rbn-label"
                  name="label"
                  lable="Printed label"
                  placeholder=" "
                  value={el.label || ""}
                  onChange={(e) => updateElement(el.id, { label: e.target.value })}
                />
              </div>
              <div className="mt-2 rbn-inline-toggle">
                <span className="rbn-toggle-caption">Show label</span>
                <CustomButton
                  text={el.showLabel ? "On" : "Off"}
                  variant={el.showLabel ? "primary" : "outline"}
                  onClick={() => updateElement(el.id, { showLabel: !el.showLabel })}
                />
              </div>
              <div className="mt-2 rbn-inline-toggle">
                <span className="rbn-toggle-caption">Bold key</span>
                <CustomButton
                  text={el.boldLabel ? "On" : "Off"}
                  variant={el.boldLabel ? "primary" : "outline"}
                  onClick={() => updateElement(el.id, { boldLabel: !el.boldLabel })}
                />
                <span className="rbn-toggle-sep" />
                <span className="rbn-toggle-caption">Bold value</span>
                <CustomButton
                  text={el.boldValue ? "On" : "Off"}
                  variant={el.boldValue ? "primary" : "outline"}
                  onClick={() => updateElement(el.id, { boldValue: !el.boldValue })}
                />
              </div>
              <div className="mt-2">
                <Input
                  type="number"
                  id="rbn-labelwidth"
                  name="labelWidth"
                  lable="Label width override (px)"
                  value={el.labelWidth ?? ""}
                  onChange={(e) => updateElement(el.id, { labelWidth: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value) || 0) })}
                />
                <div className="rbn-hint-text mt-1">Leave blank to use the template-wide label width (Page &amp; Branding).</div>
              </div>
            </>
          )}

          {(el.type === "label" || el.type === "html") && (
            <>
              <textarea
                className="rbn-textarea"
                rows={4}
                value={el.type === "html" ? el.html : el.text}
                onChange={(e) => updateElement(el.id, el.type === "html" ? { html: e.target.value } : { text: e.target.value })}
              />
              <div className="mt-2">
                <div className="rbn-toggle-caption mb-1">Border sides</div>
                <div className="rbn-inline-toggle">
                  {BORDER_SIDES.map((side) => (
                    <CustomButton
                      key={side.key}
                      text={side.label}
                      variant={el[side.key] ? "primary" : "outline"}
                      onClick={() => updateElement(el.id, { [side.key]: !el[side.key] })}
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <Input
                    type="number"
                    id="rbn-borderwidth"
                    name="borderWidth"
                    lable="Border width (px)"
                    placeholder=" "
                    value={el.borderWidth ?? 1}
                    onChange={(e) => updateElement(el.id, { borderWidth: Math.max(0, Number(e.target.value) || 0) })}
                  />
                </div>
                <label className="rbn-color-label mt-2">
                  Border colour
                  <input
                    type="color"
                    value={el.borderColor || "#1B2E5E"}
                    onChange={(e) => updateElement(el.id, { borderColor: e.target.value })}
                  />
                </label>
              </div>
            </>
          )}

          {(el.type === "image" || el.type === "stamp") && (
            <LocalImagePicker
              value={el.previewSrc}
              onChange={(v) => updateElement(el.id, { previewSrc: v })}
              label={el.type === "stamp" ? "Upload stamp" : "Upload image"}
            />
          )}

          {(el.type === "barcode" || el.type === "qrcode") && (
            // Rotation for these two now lives in "Position, size & style" above, same as
            // every other element type — not duplicated here.
            <ReactSelect
              id="rbn-src-token"
              name="token"
              placeholderName="Source token"
              dynamicOptions={tokenOptions}
              value={el.token}
              onChange={(_, opt) => updateElement(el.id, { token: opt?.value || "" })}
            />
          )}
        </RbnSection>
      )}

      {tableBorderMetaKey && (
        <RbnSection title="Table borders">
          <div className="rbn-hint-text mb-1">
            Applies only to this table — edit Settlement or Totals borders by selecting that anchor instead
            (also available in Page &amp; Branding under "{el.type === "bodytable" ? "Body" : el.type === "settletable" ? "Settlement" : "Totals"} table borders").
          </div>
          <TableBorderFields value={tableBorderValue} onChange={setTableBorderValue} compact />
        </RbnSection>
      )}

      <RbnSection title="Arrange" last={true}>
        <div className="rbn-arrange-row">
          <CustomButton text="Front" variant="outline" onClick={() => reorder(el.id, "front")} />
          <CustomButton text="Back" variant="outline" onClick={() => reorder(el.id, "back")} />
          {!isSingleton && <CustomButton text="Duplicate" variant="outline" onClick={() => duplicateElement(el.id)} />}
          <DeleteButton text="Delete" disabled={isSingleton} onClick={() => deleteElement(el.id)} />
        </div>
        {isSingleton && <div className="rbn-hint-text mt-1">Table anchors can be moved/resized but not deleted.</div>}
      </RbnSection>
    </div>
  );
}
