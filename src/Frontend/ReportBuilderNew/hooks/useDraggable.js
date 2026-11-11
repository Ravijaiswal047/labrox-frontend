import { useCallback, useEffect, useRef, useState } from "react";
import { snapToGrid } from "../utils/snap";

// Mouse-based move interaction. Window listeners are attached ONLY while a drag gesture
// is active, and always cleaned up on mouseup/unmount — avoids leaking listeners, which
// is the main risk with a naive "addEventListener on mount" port of this kind of canvas.
// Callbacks are read from a ref (updated every render) so the active mousemove/mouseup
// listeners never close over stale values without needing to resubscribe mid-gesture.
export default function useDraggable({ x, y, zoom, disabled, snapEnabled, snapSize = 8, onMove, onDragStart, onDragEnd }) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef(null);
  const callbacksRef = useRef({});
  callbacksRef.current = { onMove, onDragStart, onDragEnd };

  const onMouseDown = useCallback((e) => {
    if (disabled || e.button !== 0) return;
    e.stopPropagation();
    startRef.current = { clientX: e.clientX, clientY: e.clientY, x, y };
    setDragging(true);
    callbacksRef.current.onDragStart && callbacksRef.current.onDragStart();
  }, [disabled, x, y]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      const start = startRef.current;
      if (!start) return;
      let nx = start.x + (e.clientX - start.clientX) / zoom;
      let ny = start.y + (e.clientY - start.clientY) / zoom;
      if (snapEnabled) {
        nx = snapToGrid(nx, snapSize);
        ny = snapToGrid(ny, snapSize);
      }
      // Unbounded in every direction, matching the page's own edges being purely visual —
      // rightward/downward drags already went past them freely, leftward/upward were
      // clamped at 0 for no good reason. Elements are meant to be draggable off-page on
      // any side (e.g. letterhead art that bleeds past the edge).
      callbacksRef.current.onMove(nx, ny);
    };

    const handleMouseUp = () => {
      startRef.current = null;
      setDragging(false);
      callbacksRef.current.onDragEnd && callbacksRef.current.onDragEnd();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, zoom, snapEnabled, snapSize]);

  return { onMouseDown, dragging };
}
