import { useCallback, useEffect, useRef, useState } from "react";
import { snapToGrid } from "../utils/snap";

// Structurally identical to useDraggable, tracking w/h from a resize-handle child
// instead of the element body. Same "ref-held callbacks, listeners only while active"
// lifecycle discipline.
export default function useResizable({
  w,
  h,
  zoom,
  disabled,
  snapEnabled,
  snapSize = 8,
  minW = 10,
  minH = 10,
  rotation = 0,
  onResize,
  onResizeStart,
  onResizeEnd,
}) {
  const [resizing, setResizing] = useState(false);
  const startRef = useRef(null);
  const callbacksRef = useRef({});
  callbacksRef.current = { onResize, onResizeStart, onResizeEnd };

  const onMouseDown = useCallback((e) => {
    if (disabled) return;
    e.stopPropagation();
    e.preventDefault();
    startRef.current = { clientX: e.clientX, clientY: e.clientY, w, h };
    setResizing(true);
    callbacksRef.current.onResizeStart && callbacksRef.current.onResizeStart();
  }, [disabled, w, h]);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const start = startRef.current;
      if (!start) return;
      let dx = e.clientX - start.clientX;
      let dy = e.clientY - start.clientY;
      if (rotation) {
        // Rotate the screen-space mouse delta by -rotation to project it back onto the
        // box's own (unrotated) local axes — without this, dragging "right" on a
        // 90deg-rotated box would actually change its height, not its width.
        const rad = (-rotation * Math.PI) / 180;
        const localDx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const localDy = dx * Math.sin(rad) + dy * Math.cos(rad);
        dx = localDx;
        dy = localDy;
      }
      let nw = start.w + dx / zoom;
      let nh = start.h + dy / zoom;
      if (snapEnabled) {
        nw = snapToGrid(nw, snapSize);
        nh = snapToGrid(nh, snapSize);
      }
      callbacksRef.current.onResize(Math.max(minW, nw), Math.max(minH, nh));
    };

    const handleMouseUp = () => {
      startRef.current = null;
      setResizing(false);
      callbacksRef.current.onResizeEnd && callbacksRef.current.onResizeEnd();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, zoom, snapEnabled, snapSize, minW, minH, rotation]);

  return { onMouseDown, resizing };
}
