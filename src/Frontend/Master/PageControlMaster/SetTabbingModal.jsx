import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import './PageControlMaster.css'

// Preview Modal for Tabbing Order
const TabbingOrderPreviewModal = ({ show, onHide, selected, controllers, onUpdate }) => {
  const [previewOrder, setPreviewOrder] = useState(selected);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  console.log('controllers', controllers);

  useEffect(() => {
    setPreviewOrder(selected);
  }, [selected]);

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newOrder = Array.from(previewOrder);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setPreviewOrder(newOrder);
  };

  const handleMoveDown = (index) => {
    if (index === previewOrder.length - 1) return;
    const newOrder = Array.from(previewOrder);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setPreviewOrder(newOrder);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(previewOrder);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setPreviewOrder(reordered);
  };

  const handleUpdateOrder = () => {
    onUpdate(previewOrder);
    onHide();
  };

  const getItemName = (id) => {
    return controllers.find((c) => c.ControlDisplayID === id)?.ControlDisplayName || "Unknown";
  };

  const dialogFooter = (
    <div style={{gap:'4px'}} className="d-flex align-items-center justify-content-end gap-2">
      <Button variant="secondary" onClick={onHide} className="rounded">
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleUpdateOrder}
        disabled={previewOrder.length === 0}
        className="rounded"
      >
        Apply Order
      </Button>
    </div>
  );

  return (
    <Dialog
      visible={show}
      className={theme}
      header="Tabbing Order Preview & Update"
      onHide={onHide}
      style={{
        width: isMobile ? "90vw" : "80vw",
      }}
      footer={dialogFooter}
    >
      <div className="px-2">
        {previewOrder.length === 0 ? (
          <p className="text-muted mb-0">
            No items selected. Please select items to set tabbing order.
          </p>
        ) : (
          <div>
            <h6 className="mb-3" style={{ fontWeight: 600 }}>
              Drag & Drop or Use Buttons to Reorder:
            </h6>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="preview-tabbing">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      background: snapshot.isDraggingOver ? "#f5f5f5" : "#fff",
                      padding: "12px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      minHeight: "250px",
                      marginBottom: "20px",
                    }}
                  >
                    {previewOrder.map((id, idx) => {
                      const itemName = getItemName(id);
                      return (
                        <Draggable key={`${id}-${idx}`} draggableId={`${id}-${idx}`} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                padding: "12px 16px",
                                margin: "8px 0",
                                background: snapshot.isDragging ? "#e3f2fd" : "#f9f9f9",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                transition: "all 0.2s ease",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="d-flex align-items-center grow">
                                <span
                                  {...provided.dragHandleProps}
                                  style={{
                                    cursor: "grab",
                                    marginRight: "12px",
                                    fontWeight: "bold",
                                    color: "#007bff",
                                    fontSize: "16px",
                                  }}
                                >
                                  ⋮⋮
                                </span>
                                <span style={{ fontWeight: "500", fontSize: "14px" }}>
                                  {idx + 1}. {itemName}
                                </span>
                              </div>
                              <div style={{gap:'2px'}} className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-primary text-white"
                                  onClick={() => handleMoveUp(idx)}
                                  disabled={idx === 0}
                                  title="Move Up"
                                  className="rounded"
                                  style={{ padding: "4px 8px", minWidth: "32px" }}
                                >
                                  ↑
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-primary text-white"
                                  onClick={() => handleMoveDown(idx)}
                                  disabled={idx === previewOrder.length - 1}
                                  title="Move Down"
                                  className="rounded"
                                  style={{ padding: "4px 8px", minWidth: "32px" }}
                                >
                                  ↓
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Visual Flow Preview */}
            <div style={{ marginTop: "20px", padding: "16px", background: "#f0f7ff", borderRadius: "4px" }}>
              <h6 className="mb-3" style={{ fontWeight: 600 }}>
                Tabbing Flow Preview:
              </h6>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  padding: "12px",
                  background: "#fff",
                  borderRadius: "4px",
                  border: "1px solid #bfe7ff",
                  minHeight: "40px",
                }}
              >
                {previewOrder.map((id, idx) => (
                  <React.Fragment key={id}>
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "#007bff",
                        color: "#fff",
                        borderRadius: "4px",
                        fontWeight: "500",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getItemName(id)}
                    </div>
                    {idx < previewOrder.length - 1 && (
                      <span style={{ fontSize: "16px", color: "#007bff", fontWeight: "bold" }}>
                        →
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

// Main SetTabbingModal Component
const SetTabbingModal = ({ show, onHide, controllers, onSave }) => {
  const [selected, setSelected] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;


  console.log("controllers:::", controllers)
  
  useEffect(() => {
    setSelected(controllers.filter((c) => c.TabOrder > 0).map((c) => c.ControlDisplayID));
  }, [controllers]);
  
  const handleCheck = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePreviewUpdate = (updatedOrder) => {
    setSelected(updatedOrder);
  };

  const handleSave = () => {
    onSave(selected.map((id, idx) => ({ id, index: idx })));
    onHide();
  };

  const handleShowPreview = () => {
    if (selected.length === 0) {
      alert("Please select at least one item before setting tabbing order.");
      return;
    }
    setShowPreview(true);
  };

  const dialogFooter = (
    <div style={{gap:'2px'}} className="d-flex align-items-center justify-content-end gap-2">
      <Button variant="secondary" onClick={onHide} className="rounded">
        Cancel
      </Button>
      <Button
        variant="info"
        onClick={handleShowPreview}
        disabled={selected.length === 0}
        className="rounded"
      >
        Edit Order
      </Button>
      <Button 
        variant="primary" 
        onClick={handleSave} 
        disabled={selected.length === 0}
        className="rounded"
      >
        Save
      </Button>
    </div>
  );

  return (
    <>
      <Dialog
        visible={show}
        className={theme}
        header="Set Tabbing Order"
        onHide={onHide}
        style={{
          width: isMobile ? "90vw" : "60vw",
        }}
        footer={dialogFooter}
      >
        <div className="modal_overflow px-3">
          <h6 className="mb-3" style={{ fontWeight: 600 }}>
            Select Items to Include in Tabbing Order:
          </h6>
          <div>
            {controllers.map((item) => (
              <div 
                key={item.ControlDisplayID} 
                className="d-flex align-items-center mb-2"
                // style={{ padding: "8px 0" }}
              >
                <input
                  type="checkbox"
                  id={`checkbox-${item.ControlDisplayID}`}
                  checked={selected.includes(item.ControlDisplayID)}
                  onChange={() => handleCheck(item.ControlDisplayID)}
                  style={{ marginRight: "12px", cursor: "pointer", width: "18px", height: "18px" }}
                />
                <label 
                  htmlFor={`checkbox-${item.ControlDisplayID}`} 
                  style={{ marginBottom: 0, cursor: "pointer", fontSize: "14px" }}
                >
                  {item.ControlDisplayName}
                </label>
              </div>
            ))}
          </div>

          {selected.length > 0 && (
            <>
              <hr />
              <div>
                <h6 className="mb-3" style={{ fontWeight: 600 }}>
                  Current Selection ({selected.length} items):
                </h6>
                {console.log('controllers', controllers)}
                <div className="d-flex flex-wrap" style={{gap:'4px', padding: "12px", background: "#f9f9f9", borderRadius: "4px" }}>
                  {selected.map((id, idx) => {
                    const item = controllers.find((c) => c.ControlDisplayID === id);
                    return (
                      <div
                        key={id}
                        style={{
                          padding: "8px",
                          margin: "4px 0",
                          background: "#e9ecef",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          minWidth:'fit-content'
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            marginRight: "8px",
                            color: "#0056b3",
                            minWidth: "24px",
                          }}
                        >
                          {idx + 1}.
                        </span>
                        {item?.ControlDisplayName}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Preview Modal */}
      <TabbingOrderPreviewModal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        selected={selected}
        controllers={controllers}
        onUpdate={handlePreviewUpdate}
      />
    </>
  );
};

export default SetTabbingModal;
