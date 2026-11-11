import React from "react";
import RbnSection from "./RbnSection";
import Input from "@components/formComponent/Input";
import ReactSelect from "@components/formComponent/ReactSelect";
import LocalImagePicker from "./LocalImagePicker";
import RbnHtmlEditor from "./RbnHtmlEditor";
import TableBorderFields from "./TableBorderFields";
import InfoTooltip from "./InfoTooltip";
import { PAGE_SIZE_OPTIONS, ORIENTATION_OPTIONS, getPageDimensions } from "../constants/pageSizes";
import { REPORT_TYPE_OPTIONS } from "../constants/reportTypes";
import {
  DEFAULT_TABLE_BORDER,
  DEFAULT_FIELD_LABEL_WIDTH,
  DEFAULT_PAGE_MARGIN,
  DEFAULT_PAGE_BORDER,
  DEFAULT_LETTERHEAD_IMAGE_SIZE,
} from "../utils/layoutJson";

// Most consumer/office printers have a hardware-level unprintable strip around every
// physical page (paper feed rollers/print head can't reach the very edge) — typically
// ~3-5mm. 16px @ 96dpi (~4.2mm) is a reasonable safe-minimum to warn below; a border drawn
// closer than this to the true page edge can render correctly in a screen/PDF preview and
// still get silently clipped on an actual paper printout. Doesn't apply to PDF-only output.
const UNPRINTABLE_EDGE_PX = 16;

const PAGE_MARGIN_SIDES = [
  { key: "top", label: "Top" },
  { key: "right", label: "Right" },
  { key: "bottom", label: "Bottom" },
  { key: "left", label: "Left" },
];

const PAGE_BORDER_SIDES = [
  { key: "top", label: "Top border" },
  { key: "right", label: "Right border" },
  { key: "bottom", label: "Bottom border" },
  { key: "left", label: "Left border" },
];

const FONT_OPTIONS = ["Arial", "Verdana", "Times New Roman", "Georgia", "Courier New", "Tahoma"].map((f) => ({ label: f, value: f }));

// "Image : Static" was previously a single letterhead image *uploaded through this
// module* (network upload, guid-tagged) — that version was retired in favor of just adding
// regular Image elements from the Designer palette (base64, no upload endpoint, any
// number, independently positioned). It's back under the same key with a different
// meaning: a single company-wide header image that's *not* managed here at all — it comes
// from an existing backend table/setting, resolved entirely server-side at real print
// time, same "not this module's job to upload" reasoning as "Image : Centre Wise" below.
// All Page & Branding configures for it is the size it should render at.
const LETTERHEAD_TYPE_OPTIONS = [
  { value: "none", label: "None — just Image/HTML elements on canvas" },
  { value: "html_static", label: "HTML Header : Static" },
  { value: "html_centrewise", label: "HTML Header : Centre Wise" },
  { value: "image_static", label: "Image : Static (from backend)" },
  { value: "image_centrewise", label: "Image : Centre Wise" },
];

const SETTINGS_ROWS = [
  { key: "LOCK_CREDIT_PANEL", label: "Lock for Credit Panel" },
  { key: "LOCK_RATETYPE", label: "Lock for specific RateType" },
  { key: "ONLY_ACTIVE_ITEM", label: "Only Active Item" },
];

export default function PageBrandingTab({ meta, settings, onMetaChange, onSettingsChange, reportType, onReportTypeChange, reportTypeLocked }) {
  // Body/Settlement/Totals each get their own independent border+header styling —
  // `tableBorder` is the Body table's (the original, only-ever field before this became
  // per-table); `settlementTableBorder`/`totalsTableBorder` are separate objects so turning
  // off a border on one table doesn't silently turn it off everywhere.
  const tableBorder = { ...DEFAULT_TABLE_BORDER, ...meta.tableBorder };
  const setTableBorder = (patch) => onMetaChange({ tableBorder: { ...tableBorder, ...patch } });

  const settlementTableBorder = { ...DEFAULT_TABLE_BORDER, ...meta.settlementTableBorder };
  const setSettlementTableBorder = (patch) => onMetaChange({ settlementTableBorder: { ...settlementTableBorder, ...patch } });

  const totalsTableBorder = { ...DEFAULT_TABLE_BORDER, ...meta.totalsTableBorder };
  const setTotalsTableBorder = (patch) => onMetaChange({ totalsTableBorder: { ...totalsTableBorder, ...patch } });

  const pageMargin = { ...DEFAULT_PAGE_MARGIN, ...meta.pageMargin };
  const setPageMargin = (patch) => onMetaChange({ pageMargin: { ...pageMargin, ...patch } });

  const pageBorder = { ...DEFAULT_PAGE_BORDER, ...meta.pageBorder };
  const setPageBorder = (patch) => onMetaChange({ pageBorder: { ...pageBorder, ...patch } });

  const letterheadImageSize = { ...DEFAULT_LETTERHEAD_IMAGE_SIZE, ...meta.letterheadImageSize };
  const setLetterheadImageSize = (patch) => onMetaChange({ letterheadImageSize: { ...letterheadImageSize, ...patch } });

  return (
    <div className="rbn-page-branding">
      <RbnSection title="Template info">
        <div className="row rbn-prop-row">
          <div className="col-sm-4 mb-2">
            <Input id="rbn-code" name="code" lable="Template code" placeholder=" " value={meta.code} onChange={(e) => onMetaChange({ code: e.target.value })} />
          </div>
          <div className="col-sm-4 mb-2">
            <Input id="rbn-name" name="name" lable="Template name" placeholder=" " value={meta.name} onChange={(e) => onMetaChange({ name: e.target.value })} />
          </div>
          <div className="col-sm-4 mb-2">
            <ReactSelect
              id="rbn-reporttype"
              name="reportType"
              placeholderName="Report type"
              dynamicOptions={REPORT_TYPE_OPTIONS}
              value={reportType}
              isDisabled={reportTypeLocked}
              onChange={(_, opt) => opt?.value && onReportTypeChange(opt.value)}
            />
          </div>
        </div>
        {reportTypeLocked && (
          <div className="rbn-hint-text mt-1">
            Report type is locked once a template is saved/loaded — start a "+ New template" to pick a different one.
          </div>
        )}
      </RbnSection>

      <RbnSection title="Page setup">
        <div className="row rbn-prop-row">
          <div className="col-sm-3 mb-2">
            <ReactSelect
              id="rbn-pagesize"
              name="pageSize"
              placeholderName="Page size"
              dynamicOptions={PAGE_SIZE_OPTIONS}
              value={meta.pageSize}
              onChange={(_, opt) => {
                if (!opt?.value) return;
                if (opt.value === "Custom") {
                  // Seed the Custom fields from whatever's on screen right now (the
                  // current preset, orientation-resolved) rather than jumping straight to
                  // the A4 default — switching TO Custom shouldn't visibly resize the page.
                  const [w, h] = getPageDimensions(meta);
                  onMetaChange({ pageSize: "Custom", pageWidth: w, pageHeight: h });
                } else {
                  onMetaChange({ pageSize: opt.value });
                }
              }}
            />
          </div>
          {meta.pageSize === "Custom" ? (
            <>
              <div className="col-sm-3 mb-2">
                <Input
                  type="number"
                  id="rbn-pagewidth"
                  name="pageWidth"
                  lable="Width (px)"
                  placeholder=" "
                  value={meta.pageWidth}
                  onChange={(e) => onMetaChange({ pageWidth: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="col-sm-3 mb-2">
                <Input
                  type="number"
                  id="rbn-pageheight"
                  name="pageHeight"
                  lable="Height (px)"
                  placeholder=" "
                  value={meta.pageHeight}
                  onChange={(e) => onMetaChange({ pageHeight: Number(e.target.value) || 0 })}
                />
              </div>
            </>
          ) : (
            <div className="col-sm-3 mb-2">
              <ReactSelect
                id="rbn-orientation"
                name="orientation"
                placeholderName="Orientation"
                dynamicOptions={ORIENTATION_OPTIONS}
                value={meta.orientation}
                onChange={(_, opt) => onMetaChange({ orientation: opt?.value })}
              />
            </div>
          )}
        </div>
        {meta.pageSize === "Custom" && (
          <div className="rbn-hint-text mt-1">
            Exact page size in CSS px @ 96dpi (matches what's sent to the backend as
            <code> pageWidth</code>/<code>pageHeight</code>) — Designer and Preview both resize to this immediately.
          </div>
        )}
      </RbnSection>

      <RbnSection
        title={
          <>
            Page margin &amp; border
            <InfoTooltip
              text={[
                "A print-safe margin — the page's own size never changes; the border draws INSET from the true page edges by this amount, on any combination of sides.",
                "Doesn't move or resize your elements. Keep them clear of this frame yourself, same as any other layout guide.",
                "Most printers can't print within ~4mm of the paper edge — keep margin above that on any side with a border, or it may not show up on an actual printout.",
              ]}
            />
          </>
        }
      >
        <div className="row rbn-prop-row">
          {PAGE_MARGIN_SIDES.map((side) => (
            <div key={side.key} className="col-sm-3 mb-2">
              <Input
                type="number"
                id={`rbn-pagemargin-${side.key}`}
                name={side.key}
                lable={`Margin ${side.label} (px)`}
                placeholder=" "
                value={pageMargin[side.key]}
                onChange={(e) => setPageMargin({ [side.key]: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>
          ))}
        </div>
        {PAGE_BORDER_SIDES.some((side) => pageBorder[side.key] && pageMargin[side.key] < UNPRINTABLE_EDGE_PX) && (
          <div className="rbn-hint-text rbn-hint-warn mb-1">
            Most printers physically can't print within ~4mm ({UNPRINTABLE_EDGE_PX}px) of the paper edge — a border
            drawn closer than that may look fine on screen/PDF but not show up on an actual paper printout. Bump the
            margin on that side to at least {UNPRINTABLE_EDGE_PX}px if this is going to a physical printer (not an
            issue for PDF-only output).
          </div>
        )}
        <div className="rbn-checkbox-group mt-1">
          {PAGE_BORDER_SIDES.map((side) => (
            <label key={side.key} className="rbn-checkbox-option">
              <input
                type="checkbox"
                checked={!!pageBorder[side.key]}
                onChange={(e) => setPageBorder({ [side.key]: e.target.checked })}
              />
              {side.label}
            </label>
          ))}
        </div>
        <div className="row rbn-prop-row mt-2">
          <div className="col-sm-3 mb-2">
            <Input
              type="number"
              id="rbn-pageborderwidth"
              name="pageBorderWidth"
              lable="Border width (px)"
              placeholder=" "
              value={pageBorder.borderWidth}
              onChange={(e) => setPageBorder({ borderWidth: Math.max(0, Number(e.target.value) || 0) })}
            />
          </div>
          <div className="col-sm-3 mb-2 rbn-color-field">
            <label className="rbn-color-label">
              Border colour
              <input
                type="color"
                value={pageBorder.borderColor}
                onChange={(e) => setPageBorder({ borderColor: e.target.value })}
              />
            </label>
          </div>
        </div>
      </RbnSection>

      <RbnSection title="Font & background">
        <div className="row rbn-prop-row">
          <div className="col-sm-3 mb-2">
            <ReactSelect
              id="rbn-font"
              name="font"
              placeholderName="Font family"
              dynamicOptions={FONT_OPTIONS}
              value={meta.font}
              onChange={(_, opt) => onMetaChange({ font: opt?.value })}
            />
          </div>
          <div className="col-sm-3 mb-2">
            <Input
              type="number"
              id="rbn-basefontsize"
              name="fontSize"
              lable="Base font size"
              placeholder=" "
              value={meta.fontSize}
              onChange={(e) => onMetaChange({ fontSize: Number(e.target.value) })}
            />
          </div>
          <div className="col-sm-3 mb-2 rbn-color-field">
            <label className="rbn-color-label">
              Background colour
              <input type="color" value={meta.bg} onChange={(e) => onMetaChange({ bg: e.target.value })} />
            </label>
          </div>
        </div>
      </RbnSection>

      <RbnSection
        title={
          <>
            Field label alignment
            <InfoTooltip
              text={[
                "Every field's label (Patient Name:, Age:, Mobile:, ...) reserves this much width before the value starts.",
                "Set one value so a column of fields with different-length labels still lines their values up.",
                "Override per field from its Property Panel if one needs to break from this.",
              ]}
            />
          </>
        }
      >
        <div className="row rbn-prop-row">
          <div className="col-sm-3 mb-2">
            <Input
              type="number"
              id="rbn-fieldlabelwidth"
              name="fieldLabelWidth"
              lable="Label width (px)"
              placeholder=" "
              value={meta.fieldLabelWidth ?? DEFAULT_FIELD_LABEL_WIDTH}
              onChange={(e) => onMetaChange({ fieldLabelWidth: Math.max(0, Number(e.target.value) || 0) })}
            />
          </div>
        </div>
      </RbnSection>

      <RbnSection
        title={
          <>
            Body table borders
            <InfoTooltip text="Body table only — Settlement and Totals below are configured separately." />
          </>
        }
      >
        <TableBorderFields value={tableBorder} onChange={setTableBorder} />
      </RbnSection>

      <RbnSection
        title={
          <>
            Settlement table borders
            <InfoTooltip text="Settlement table only — Body and Totals are configured separately." />
          </>
        }
      >
        <TableBorderFields value={settlementTableBorder} onChange={setSettlementTableBorder} />
      </RbnSection>

      <RbnSection
        title={
          <>
            Totals block borders
            <InfoTooltip text="Totals block only — Body and Settlement are configured separately." />
          </>
        }
      >
        <TableBorderFields value={totalsTableBorder} onChange={setTotalsTableBorder} />
      </RbnSection>

      <RbnSection
        title={
          <>
            Letterhead
            <InfoTooltip
              text={[
                "Need a logo or header image? Add an Image element from the Designer's palette instead of setting one here.",
                'Add as many as you like (e.g. one left, one right), position/resize each freely — they render together with whatever\'s chosen below, not instead of it.',
                'Only want Image (and/or plain "html"/"label") elements? Pick None below — it renders nothing extra at the top of the page.',
              ]}
            />
          </>
        }
      >
        <div className="rbn-radio-group">
          {LETTERHEAD_TYPE_OPTIONS.map((opt) => (
            <label key={opt.value} className="rbn-radio-option">
              <input
                type="radio"
                name="letterheadType"
                checked={meta.letterheadType === opt.value}
                onChange={() => onMetaChange({ letterheadType: opt.value })}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {meta.letterheadType === "image_static" && (
          <div className="mt-2">
            <div className="rbn-hint-text mb-1">
              Not uploaded here — the image itself comes from the backend (a single, company-wide header image,
              already stored elsewhere), resolved automatically at print time. All this configures is where it sits
              and how big it renders — drag/resize its placeholder box directly on the Designer canvas, or type
              exact values here.
            </div>
            <div className="row rbn-prop-row">
              <div className="col-sm-3 mb-2">
                <Input
                  type="number"
                  id="rbn-letterhead-img-x"
                  name="letterheadImageX"
                  lable="X (px)"
                  placeholder=" "
                  value={letterheadImageSize.x}
                  onChange={(e) => setLetterheadImageSize({ x: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="col-sm-3 mb-2">
                <Input
                  type="number"
                  id="rbn-letterhead-img-y"
                  name="letterheadImageY"
                  lable="Y (px)"
                  placeholder=" "
                  value={letterheadImageSize.y}
                  onChange={(e) => setLetterheadImageSize({ y: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="col-sm-3 mb-2">
                <Input
                  type="number"
                  id="rbn-letterhead-img-w"
                  name="letterheadImageWidth"
                  lable="Width (px)"
                  placeholder=" "
                  value={letterheadImageSize.width}
                  onChange={(e) => setLetterheadImageSize({ width: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
              <div className="col-sm-3 mb-2">
                <Input
                  type="number"
                  id="rbn-letterhead-img-h"
                  name="letterheadImageHeight"
                  lable="Height (px)"
                  placeholder=" "
                  value={letterheadImageSize.height}
                  onChange={(e) => setLetterheadImageSize({ height: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
            </div>
          </div>
        )}

        {meta.letterheadType === "image_centrewise" && (
          <div className="mt-2">
            <div className="rbn-hint-text">
              Centre-wise header images aren't uploaded here — they're already managed per centre in Centre Master
              (Attachment Header), and print automatically for that centre's receipts.
            </div>
          </div>
        )}

        {(meta.letterheadType === "html_static" || meta.letterheadType === "html_centrewise") && (
          <div className="mt-2">
            <div className="rbn-hint-text mb-1">
              {meta.letterheadType === "html_static" ? "HTML letterhead (all centres)" : "HTML letterhead — default; per-centre overrides are a future enhancement"}
            </div>
            <RbnHtmlEditor value={meta.staticHtml} onChange={(html) => onMetaChange({ staticHtml: html })} />
          </div>
        )}
      </RbnSection>

      <RbnSection title="Stamp image (footer)">
        <LocalImagePicker value={meta.stampImage} onChange={(v) => onMetaChange({ stampImage: v })} label="Upload stamp" />
      </RbnSection>

      <RbnSection title="Other configuration" last={true}>
        <div className="rbn-checkbox-group">
          {SETTINGS_ROWS.map((row) => (
            <label key={row.key} className="rbn-checkbox-option">
              <input
                type="checkbox"
                checked={!!settings[row.key]}
                onChange={(e) => onSettingsChange({ [row.key]: e.target.checked })}
              />
              {row.label}
            </label>
          ))}
          <label className="rbn-checkbox-option">
            <input
              type="checkbox"
              checked={!!meta.showSettlement}
              onChange={(e) => onMetaChange({ showSettlement: e.target.checked })}
            />
            Show settlement table
          </label>
        </div>
      </RbnSection>
    </div>
  );
}
