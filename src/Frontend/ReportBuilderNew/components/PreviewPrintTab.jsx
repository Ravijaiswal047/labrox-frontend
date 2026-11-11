import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactSelect from "@components/formComponent/ReactSelect";
import { CustomButton } from "@components/UI/CustomButton";
import ElementRenderer from "./ElementRenderer";
import { BodyTablePreview, SettlementTablePreview, TotalsBlockPreview } from "./TablePreviews";
import { getPageDimensions } from "../constants/pageSizes";
import { fetchAccessCentres } from "../utils/centres";
import { getPageFrameStyle } from "../utils/pageFrame";
import LetterheadPreview from "./LetterheadPreview";

const PRINT_TYPE_OPTIONS = [
  { label: "Original", value: "Original" },
  { label: "Duplicate", value: "Duplicate" },
];

export default function PreviewPrintTab({ meta, elements, bodyColumns, settlementColumns, totals }) {
  const [centres, setCentres] = useState([]);
  const [centreId, setCentreId] = useState(null);
  const [printType, setPrintType] = useState("Original");
  const centre = centres.find((c) => c.id === centreId);
  const centreOptions = centres.map((c) => ({ label: c.name, value: c.id }));

  // Real centre list (id/name only — Centre/getAccessCentres doesn't expose
  // address/mobile/code, so {CentreAddress}/{CentreMobile}/{CentreCode} still render as
  // unresolved placeholders in this sample-data preview until a richer endpoint exists).
  useEffect(() => {
    let cancelled = false;
    fetchAccessCentres().then((rows) => {
      if (cancelled) return;
      setCentres(rows);
      if (rows.length) setCentreId((prev) => prev ?? rows[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [pageW, pageH] = getPageDimensions(meta);
  const scale = 0.84;

  const bodyTableEl = elements.find((e) => e.type === "bodytable");
  const settleTableEl = elements.find((e) => e.type === "settletable");
  const totalsEl = elements.find((e) => e.type === "totalsblock");

  // The body table's designed height is just a placeholder box for editing on the
  // canvas — with real (usually shorter) sample data it renders shorter, so Settlement
  // & Totals below it would otherwise leave a big gap at their fixed designed Y. Measure
  // the actual rendered height and position them right after it instead, like a real
  // print flow would.
  const bodyTableRef = useRef(null);
  const [bodyTableHeight, setBodyTableHeight] = useState(0);
  const BELOW_GAP = 20;

  useLayoutEffect(() => {
    const node = bodyTableRef.current;
    if (!node) return;
    const measure = () => setBodyTableHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [bodyColumns, meta.inclusionStyle]);

  const belowBodyY = bodyTableEl ? bodyTableEl.y + bodyTableHeight + BELOW_GAP : 0;

  // Settlement/Totals just moved from their designed Y to belowBodyY. Content in between
  // that row and the page footer (signature/stamp, "Received with thanks", "For Online
  // Report:", ...) should flow with it — shift it by the same delta so it stays right
  // after Settlement/Totals instead of leaving a gap (or overlapping, if real content is
  // taller than designed). The actual page FOOTER (Created By / Printed On / Page No, and
  // anything else designed to live at the very bottom of the page) should instead stay
  // pinned there regardless of how much dynamic content is above it — real receipts don't
  // have their footer creep up the page just because there were fewer line items.
  const anchorDesignY = [settleTableEl?.y, totalsEl?.y].filter((v) => v !== undefined);
  const anchorOriginalY = anchorDesignY.length ? Math.min(...anchorDesignY) : null;
  const belowShiftY = anchorOriginalY !== null ? belowBodyY - anchorOriginalY : 0;
  const FOOTER_ZONE_HEIGHT = 150;
  const footerZoneY = pageH - FOOTER_ZONE_HEIGHT;

  return (
    <div className="rbn-preview-tab">
      <div className="rbn-preview-toolbar">
        <ReactSelect
          id="rbn-preview-centre"
          name="centre"
          placeholderName="Centre"
          dynamicOptions={centreOptions}
          value={centreId}
          onChange={(_, opt) => setCentreId(opt?.value)}
        />
        <ReactSelect
          id="rbn-preview-printtype"
          name="printType"
          placeholderName="Print type"
          dynamicOptions={PRINT_TYPE_OPTIONS}
          value={printType}
          onChange={(_, opt) => setPrintType(opt?.value)}
        />
        <CustomButton text="Print" icon="print" variant="primary" onClick={() => window.print()} />
      </div>

      <div className="rbn-preview-scroll">
        {/* Fixed at exactly pageW*scale x pageH*scale — the page's own physical size never
            changes for margin/border; the overlay border below draws INSET from these true
            edges instead. */}
        <div className="rbn-page-frame" style={{ width: pageW * scale, height: pageH * scale }}>
          <div
            className="rbn-print-area"
            style={{ width: pageW * scale, height: pageH * scale, background: meta.bg, fontFamily: meta.font }}
          >
            {printType === "Duplicate" && <div className="rbn-watermark">DUPLICATE</div>}
            <div className="rbn-print-inner" style={{ width: pageW, height: pageH, transform: `scale(${scale})` }}>
              {/* "image_static" positions/sizes its own placeholder (meta.letterheadImageSize
                  x/y/width/height) — every other letterhead type is pinned to the page's
                  own 0,0, full width. */}
              {meta.letterheadType === "image_static" ? (
                <LetterheadPreview meta={meta} pageW={pageW} />
              ) : (
                <div style={{ position: "absolute", left: 0, top: 0, width: pageW }}>
                  <LetterheadPreview meta={meta} pageW={pageW} />
                </div>
              )}
              {elements
                .filter((el) => !["bodytable", "settletable", "totalsblock"].includes(el.type))
                .map((el) => {
                  const inFlowZone = anchorOriginalY !== null && el.y >= anchorOriginalY && el.y < footerZoneY;
                  const top = inFlowZone ? el.y + belowShiftY : el.y;
                  // Rotation applies to the whole box here too (position + size + content
                  // together), matching the Designer canvas (ElementBox.jsx) exactly — so
                  // content never overflows/gets clipped by a still-unrotated box, and the
                  // two never visually disagree about how a rotated element looks.
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: "absolute",
                        left: el.x,
                        top,
                        width: el.w,
                        height: el.h,
                        transform: el.rotation ? `rotate(${el.rotation}deg)` : "none",
                      }}
                    >
                      <ElementRenderer el={el} preview={true} centre={centre} fieldLabelWidth={meta.fieldLabelWidth} />
                    </div>
                  );
                })}

              {bodyTableEl && (
                <div ref={bodyTableRef} style={{ position: "absolute", left: bodyTableEl.x, top: bodyTableEl.y, width: bodyTableEl.w }}>
                  <BodyTablePreview bodyColumns={bodyColumns} inclusionStyle={meta.inclusionStyle} tableBorder={meta.tableBorder} />
                </div>
              )}
              {meta.showSettlement && settleTableEl && (
                <div style={{ position: "absolute", left: settleTableEl.x, top: belowBodyY, width: settleTableEl.w }}>
                  <SettlementTablePreview settlementColumns={settlementColumns} tableBorder={meta.settlementTableBorder} />
                </div>
              )}
              {totalsEl && (
                <div style={{ position: "absolute", left: totalsEl.x, top: belowBodyY, width: totalsEl.w }}>
                  <TotalsBlockPreview totals={totals} tableBorder={meta.totalsTableBorder} />
                </div>
              )}
            </div>
          </div>
          <div style={getPageFrameStyle(meta, scale)} />
        </div>
      </div>
    </div>
  );
}
