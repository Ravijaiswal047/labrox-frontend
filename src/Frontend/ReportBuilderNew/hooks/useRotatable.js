import { useCallback, useEffect, useRef, useState } from "react";

// Drag a small handle above the element to freely rotate it around its own center — same
// "ref-held callbacks, listeners only while active" lifecycle discipline as
// useDraggable/useResizable. Unlike those two, this needs the element's actual on-screen
// center (not just zoom-independent x/y/w/h), since the rotation angle is computed against
// the mouse's real screen position — so it takes a ref to the box's DOM node instead of
// numeric coordinates, read once via getBoundingClientRect() when the drag starts.
export default function useRotatable({ boxRef, disabled, onRotate, onRotateStart, onRotateEnd }) {
  const [rotating, setRotating] = useState(false);
  const centerRef = useRef(null);
  const callbacksRef = useRef({});
  callbacksRef.current = { onRotate, onRotateStart, onRotateEnd };

  const onMouseDown = useCallback(
    (e) => {
      if (disabled || !boxRef.current) return;
      e.stopPropagation();
      e.preventDefault();
      const rect = boxRef.current.getBoundingClientRect();
      centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      setRotating(true);
      callbacksRef.current.onRotateStart && callbacksRef.current.onRotateStart();
    },
    [disabled, boxRef]
  );

  useEffect(() => {
    if (!rotating) return;

    const handleMouseMove = (e) => {
      const center = centerRef.current;
      if (!center) return;
      // atan2(dy, dx): 0deg points right, 90deg points down. The handle sits above the
      // element (pointing "up" = dx 0, dy negative = atan2 result -90deg) and that should
      // read as rotation 0 — hence the +90 to re-zero it there.
      const raw = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI) + 90;
      let deg = Math.round(raw);
      // Hold Shift for exact 15deg increments (0/15/30/.../345) — freehand mouse rotation
      // makes landing on a clean angle like 90deg or 180deg fiddly otherwise.
      if (e.shiftKey) deg = Math.round(deg / 15) * 15;
      callbacksRef.current.onRotate(deg);
    };

    const handleMouseUp = () => {
      centerRef.current = null;
      setRotating(false);
      callbacksRef.current.onRotateEnd && callbacksRef.current.onRotateEnd();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [rotating]);

  return { onMouseDown, rotating };
}
