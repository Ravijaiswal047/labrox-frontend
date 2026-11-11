import React from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDesigner } from "./DesignerTab";
import { TYPE_ICONS } from "../constants/typeIcons";

function LayerRow({ el, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: el.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const summary = (el.label || el.token || el.text || el.type || "").toString().slice(0, 24);
  const Icon = TYPE_ICONS[el.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rbn-layer-row ${selected ? "selected" : ""}`}
      onClick={() => onSelect(el.id)}
    >
      <span className="rbn-layer-icon">{Icon && <Icon size={12} />}</span>
      <span className="rbn-layer-type">{el.type}</span>
      <span className="rbn-layer-label">{summary}</span>
    </div>
  );
}

// z-order list, front-most first; drag to reorder via the already-installed
// @dnd-kit/sortable (same lib used elsewhere in the app for list-reorder).
export default function LayersList() {
  const { elements, selectedId, setSelectedId, reorderByIdList } = useDesigner();
  const topFirst = [...elements].sort((a, b) => (b.z || 0) - (a.z || 0));
  const ids = topFirst.map((el) => el.id);

  // Without an activation constraint, dnd-kit's default PointerSensor treats every
  // mousedown as a potential drag start from pixel zero — on a row that's also plain-
  // clickable (to select it), this regularly swallows the click event outright, which is
  // why selecting a layer took several attempts. Requiring 4px of movement before a drag
  // "activates" leaves a plain click alone (fires normally, no movement happened) while a
  // deliberate drag-to-reorder still works exactly as before.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    reorderByIdList(arrayMove(ids, oldIndex, newIndex));
  };

  if (!elements.length) {
    return <div className="rbn-empty-hint">Click a component or field token in the palette to add it to the canvas.</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="rbn-layers-list">
          {topFirst.map((el) => (
            <LayerRow key={el.id} el={el} selected={selectedId === el.id} onSelect={setSelectedId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
