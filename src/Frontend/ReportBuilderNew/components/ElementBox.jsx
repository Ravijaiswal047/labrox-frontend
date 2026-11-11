import React, { useEffect, useRef } from "react";
import { useDesigner } from "./DesignerTab";
import useDraggable from "../hooks/useDraggable";
import useResizable from "../hooks/useResizable";
import useRotatable from "../hooks/useRotatable";
import ElementRenderer from "./ElementRenderer";
import { SINGLETON_TYPES } from "../constants/elementDefaults";

export default function ElementBox({ el }) {
  const {
    selectedId, setSelectedId, updateElement, zoom, snapEnabled, snapSize, commitBeforeGesture,
  } = useDesigner();
  const selected = selectedId === el.id;
  const boxRef = useRef(null);
  // Table anchors (bodytable/settletable/totalsblock) render their live table preview
  // through a separate path in Preview & Print that doesn't apply any rotation wrapper —
  // letting them rotate here on canvas but not there would silently diverge the two, so
  // rotation is disabled outright for these types rather than only hiding the Property
  // Panel control (which wouldn't stop a drag on the handle itself).
  const canRotate = !SINGLETON_TYPES.includes(el.type);

  // Selecting via the Layers list (or anything else) should bring an off-screen
  // element into view on the canvas, the same way selecting a row in a list app
  // scrolls its detail panel into view.
  useEffect(() => {
    if (selected) {
      boxRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [selected]);

  const draggable = useDraggable({
    x: el.x,
    y: el.y,
    zoom,
    snapEnabled,
    snapSize,
    onMove: (x, y) => updateElement(el.id, { x, y }),
    onDragStart: commitBeforeGesture,
  });

  const resizable = useResizable({
    w: el.w,
    h: el.h,
    zoom,
    // Once the whole box (not just its content) rotates, dragging the resize handle in a
    // straight line on screen no longer maps straight onto width/height — e.g. at 90deg,
    // dragging right on screen is really dragging along the box's own (rotated) height
    // axis. Rotating the raw mouse delta by -rotation before applying it to w/h corrects
    // for this, so resize still feels right regardless of the current angle.
    rotation: canRotate ? el.rotation : 0,
    snapEnabled,
    snapSize,
    onResize: (w, h) => updateElement(el.id, { w, h }),
    onResizeStart: commitBeforeGesture,
  });

  // Rotates the WHOLE element — box, content, and its own resize/rotate handles together
  // as one rigid unit, around its own center. (An earlier version rotated only the inner
  // content while keeping the box axis-aligned, to sidestep the resize-math complexity
  // above — but that meant a 90deg-rotated element's content visibly overflowed its own
  // still-horizontal box and got clipped in the report. Rotating the box itself avoids
  // that: content is always exactly the box's own size, so nothing to clip.)
  const rotatable = useRotatable({
    boxRef,
    disabled: !canRotate,
    onRotate: (rotation) => updateElement(el.id, { rotation }),
    onRotateStart: commitBeforeGesture,
  });

  return (
    <div
      ref={boxRef}
      className={`rbn-element-box ${selected ? "selected" : ""}`}
      style={{
        left: el.x,
        top: el.y,
        width: el.w,
        height: el.h,
        transform: canRotate && el.rotation ? `rotate(${el.rotation}deg)` : "none",
      }}
      onMouseDown={(e) => {
        setSelectedId(el.id);
        draggable.onMouseDown(e);
      }}
    >
      <ElementRenderer el={el} preview={false} />
      {selected && (
        <>
          <div className="rbn-resize-handle" onMouseDown={resizable.onMouseDown} />
          {canRotate && (
            <>
              <div className="rbn-rotate-handle-line" />
              <div
                className="rbn-rotate-handle"
                title="Drag to rotate (hold Shift to snap to 15°)"
                onMouseDown={rotatable.onMouseDown}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
