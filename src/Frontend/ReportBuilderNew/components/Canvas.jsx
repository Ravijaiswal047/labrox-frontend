import React from "react";
import { useDesigner } from "./DesignerTab";
import ElementBox from "./ElementBox";
import { getPageFrameStyle } from "../utils/pageFrame";
import LetterheadPreview from "./LetterheadPreview";
import LetterheadImageSkeleton from "./LetterheadImageSkeleton";

const SECTION_GUIDES = [
  { label: "LETTERHEAD ▾", pct: 0 },
  { label: "HEADER FIELDS ▾", pct: 0.12 },
  { label: "BODY ▾", pct: 0.22 },
  { label: "FOOTER ▾", pct: 0.88 },
];

export default function Canvas() {
  const { elements, zoom, showGrid, snapEnabled, snapSize, pageW, pageH, setSelectedId, meta, onMetaChange, commitBeforeGesture } = useDesigner();

  // When Settlement is turned off (Page & Branding), its anchor shouldn't render on canvas
  // at all — not just show empty, since ElementBox itself (selection outline, resize
  // handle) would still draw around nothing otherwise. The element stays in state either
  // way (still a singleton, still there instantly if Settlement is turned back on) — this
  // only skips rendering it while it's off.
  const visibleElements = elements.filter((el) => el.type !== "settletable" || meta.showSettlement !== false);
  const sorted = [...visibleElements].sort((a, b) => (a.z || 0) - (b.z || 0));

  return (
    <div className="rbn-canvas-scroll">
      {/* Fixed at exactly pageW*zoom x pageH*zoom — the page's own physical size never
          changes for margin/border (see pageFrame.js); the border overlay below is drawn
          INSET from these true edges, not added on top of them. */}
      <div className="rbn-page-frame" style={{ width: pageW * zoom, height: pageH * zoom }}>
        <div className="rbn-canvas-outer" style={{ width: pageW * zoom, height: pageH * zoom }}>
          <div
            className="rbn-canvas-page"
            style={{
              width: pageW,
              height: pageH,
              transform: `scale(${zoom})`,
              backgroundImage: showGrid
                ? "linear-gradient(rgba(30,60,120,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(30,60,120,0.10) 1px, transparent 1px)"
                : "none",
              backgroundSize: `${snapSize}px ${snapSize}px`,
            }}
            onMouseDown={() => setSelectedId(null)}
          >
            {/* Shows what the Page & Branding "Letterhead" section is currently configured
                to — purely a background preview, not an element (can't be selected/dragged;
                add a real image/html element on top if it needs to be repositioned).
                Exception: "image_static" has no real image to preview at all (resolved
                server-side), so its placeholder box IS interactive — fully draggable and
                resizable, instead of only typing x/y/width/height. */}
            {meta.letterheadType === "image_static" ? (
              <LetterheadImageSkeleton
                meta={meta}
                zoom={zoom}
                snapEnabled={snapEnabled}
                snapSize={snapSize}
                onMetaChange={onMetaChange}
                commitBeforeGesture={commitBeforeGesture}
              />
            ) : (
              <div style={{ position: "absolute", left: 0, top: 0, width: pageW, pointerEvents: "none" }}>
                <LetterheadPreview meta={meta} pageW={pageW} />
              </div>
            )}
            {SECTION_GUIDES.map((g) => (
              <div key={g.label} className="rbn-section-guide" style={{ top: pageH * g.pct }}>
                <span>{g.label}</span>
              </div>
            ))}
            {sorted.map((el) => (
              <ElementBox key={el.id} el={el} />
            ))}
          </div>
        </div>
        <div style={getPageFrameStyle(meta, zoom)} />
      </div>
    </div>
  );
}
