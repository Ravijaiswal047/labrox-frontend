import { useCallback, useRef } from "react";

// Generic undo/redo snapshot stack over the canvas `elements` array only (matches the
// reference prototype's scope — Page & Branding / Body Table / Settlement config edits
// are not part of this stack, keeping it small and predictable).
export default function useHistory(elements, setElements, max = 50) {
  const past = useRef([]);
  const future = useRef([]);

  // Call BEFORE applying a change, so the snapshot captures the pre-change state.
  const commit = useCallback(() => {
    past.current.push(JSON.stringify(elements));
    if (past.current.length > max) past.current.shift();
    future.current = [];
  }, [elements, max]);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    future.current.push(JSON.stringify(elements));
    const prev = past.current.pop();
    setElements(JSON.parse(prev));
  }, [elements, setElements]);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    past.current.push(JSON.stringify(elements));
    const next = future.current.pop();
    setElements(JSON.parse(next));
  }, [elements, setElements]);

  return {
    commit,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
