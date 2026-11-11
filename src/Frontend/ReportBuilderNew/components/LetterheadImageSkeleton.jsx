import React from "react";
import useDraggable from "../hooks/useDraggable";
import useResizable from "../hooks/useResizable";
import { DEFAULT_LETTERHEAD_IMAGE_SIZE } from "../utils/layoutJson";

// Only for `letterheadType: "image_static"` — that mode has no real image to show (it's
// resolved entirely server-side, see API-CONTRACT.md Section 12), so `LetterheadPreview`
// just renders a size-accurate placeholder box. On the Designer canvas specifically, that
// box is fully draggable/resizable — its own corner handle for size, and dragging the box
// itself for position — writing straight back to `meta.letterheadImageSize`, same
// interaction as any regular element's ElementBox, just without an id/type to select via
// the Layers list (there's exactly one of these, tied to the Letterhead config, not a
// member of `elements[]`).
export default function LetterheadImageSkeleton({ meta, zoom, snapEnabled, snapSize, onMetaChange, commitBeforeGesture }) {
  const size = { ...DEFAULT_LETTERHEAD_IMAGE_SIZE, ...meta.letterheadImageSize };

  const draggable = useDraggable({
    x: size.x,
    y: size.y,
    zoom,
    snapEnabled,
    snapSize,
    onMove: (x, y) => onMetaChange({ letterheadImageSize: { ...size, x, y } }),
    onDragStart: commitBeforeGesture,
  });

  const resizable = useResizable({
    w: size.width,
    h: size.height,
    zoom,
    snapEnabled,
    snapSize,
    minW: 40,
    minH: 20,
    onResize: (width, height) => onMetaChange({ letterheadImageSize: { ...size, width, height } }),
    onResizeStart: commitBeforeGesture,
  });

  return (
    <div
      className="rbn-letterhead-block rbn-letterhead-placeholder rbn-letterhead-skeleton"
      style={{ left: size.x, top: size.y, width: size.width, height: size.height }}
      onMouseDown={draggable.onMouseDown}
    >
      Static header image ({Math.round(size.width)}×{Math.round(size.height)}px)
      <div className="rbn-resize-handle" onMouseDown={resizable.onMouseDown} />
    </div>
  );
}
