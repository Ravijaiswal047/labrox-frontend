import { useEffect } from "react";

const ARROW_DELTAS = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

// Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) / Delete+Backspace / Arrow-nudge / Escape — ignores
// keystrokes while an input/textarea/contenteditable is focused, so e.g. Backspace inside
// the PropertyPanel's HTML textarea edits text instead of deleting the selected element.
export default function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onEscape,
  onNudge,
  nudgeStep = 1,
  nudgeStepLarge = 10,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable;
      if (isTyping) return;

      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo && onUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (key === "y" || (e.shiftKey && key === "z"))) {
        e.preventDefault();
        onRedo && onRedo();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && onDelete) {
        e.preventDefault();
        onDelete();
        return;
      }
      if (e.key === "Escape" && onEscape) {
        onEscape();
        return;
      }
      if (ARROW_DELTAS[e.key] && onNudge) {
        e.preventDefault();
        const [dx, dy] = ARROW_DELTAS[e.key];
        const step = e.shiftKey ? nudgeStepLarge : nudgeStep;
        onNudge(dx * step, dy * step);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onUndo, onRedo, onDelete, onEscape, onNudge, nudgeStep, nudgeStepLarge]);
}
