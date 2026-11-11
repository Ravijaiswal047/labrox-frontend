import React, { createContext, useContext, useState } from "react";
import Palette from "./Palette";
import Canvas from "./Canvas";
import PropertyPanel from "./PropertyPanel";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { getPageDimensions } from "../constants/pageSizes";
import { makeElement, SINGLETON_TYPES } from "../constants/elementDefaults";

const DesignerContext = createContext(null);
export const useDesigner = () => useContext(DesignerContext);

// zoom/showGrid/snapEnabled/history are owned by ReportBuilderNew.jsx now (so the tab
// bar's inline undo/redo/snap/grid/zoom controls can read & drive the same state).
export default function DesignerTab({
  meta,
  onMetaChange,
  elements,
  onElementsChange,
  zoom,
  showGrid,
  snapEnabled,
  snapSize,
  history,
  fieldTokens,
  fieldTokensLoading,
  bodyColumns,
  settlementColumns,
  totals,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const addElement = (type, overrides = {}) => {
    if (SINGLETON_TYPES.includes(type) && elements.some((el) => el.type === type)) return;
    history.commit();
    const el = makeElement(type, { x: 80, y: 80, ...overrides });
    onElementsChange([...elements, el]);
    setSelectedId(el.id);
  };

  const updateElement = (id, patch) => {
    onElementsChange(elements.map((el) => (el.id === id ? { ...el, ...patch } : el)));
  };

  const deleteElement = (id) => {
    const el = elements.find((e) => e.id === id);
    if (!el || SINGLETON_TYPES.includes(el.type)) return;
    history.commit();
    onElementsChange(elements.filter((e) => e.id !== id));
    setSelectedId(null);
  };

  const duplicateElement = (id) => {
    const el = elements.find((e) => e.id === id);
    if (!el || SINGLETON_TYPES.includes(el.type)) return;
    history.commit();
    const copy = { ...el, id: crypto.randomUUID(), x: el.x + 12, y: el.y + 12, z: Date.now() };
    onElementsChange([...elements, copy]);
    setSelectedId(copy.id);
  };

  const reorder = (id, direction) => {
    const zs = elements.map((e) => e.z || 0);
    const target = direction === "front" ? Math.max(0, ...zs) + 1 : Math.min(0, ...zs) - 1;
    history.commit();
    updateElement(id, { z: target });
  };

  const reorderByIdList = (orderedIdsTopFirst) => {
    // LayersList shows front-most first; z ascending = back-to-front, so reverse it.
    const idsBackFirst = [...orderedIdsTopFirst].reverse();
    history.commit();
    onElementsChange(
      elements.map((el) => {
        const idx = idsBackFirst.indexOf(el.id);
        return idx === -1 ? el : { ...el, z: idx };
      })
    );
  };

  // Called at the START of a drag/resize gesture, so undo restores the pre-gesture
  // position/size in one step rather than the almost-final in-progress value.
  const commitBeforeGesture = () => history.commit();

  const nudgeSelected = (dx, dy) => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    history.commit();
    updateElement(selectedId, { x: el.x + dx, y: el.y + dy });
  };

  useKeyboardShortcuts({
    onUndo: history.undo,
    onRedo: history.redo,
    onDelete: selectedId ? () => deleteElement(selectedId) : undefined,
    onEscape: selectedId ? () => setSelectedId(null) : undefined,
    onNudge: selectedId ? nudgeSelected : undefined,
    nudgeStep: snapEnabled ? snapSize : 1,
    nudgeStepLarge: snapEnabled ? snapSize * 4 : 10,
  });

  const [pageW, pageH] = getPageDimensions(meta);

  const ctx = {
    elements,
    selectedId,
    setSelectedId,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    reorder,
    reorderByIdList,
    commitBeforeGesture,
    zoom,
    showGrid,
    snapEnabled,
    snapSize,
    pageW,
    pageH,
    meta,
    onMetaChange,
    fieldTokens,
    fieldTokensLoading,
    bodyColumns,
    settlementColumns,
    totals,
  };

  return (
    <DesignerContext.Provider value={ctx}>
      <div className="rbn-designer">
        <Palette />
        <Canvas />
        <PropertyPanel />
      </div>
    </DesignerContext.Provider>
  );
}
