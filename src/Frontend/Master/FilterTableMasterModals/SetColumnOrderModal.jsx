import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import '../../Master/PageControlMaster/PageControlMaster.css'

const SetColumnOrderModal = ({ show, onHide, controllers, onSave }) => {
  const [items, setItems] = useState();

  console.log('controllers::order::', controllers);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setItems(reordered);
  };

  const handleSave = () => {
    onSave(items.map((item, idx) => ({ id: item.header, DisplayOrder: idx + 1 })));
    setTimeout(() => onHide(), 0);
  };

  useEffect(()=>{
    let orderControllers = controllers.sort((a, b) => a.ColumnOrder - b.ColumnOrder);
    setItems(orderControllers)
  },[controllers])

  return (
    <Modal show={show} onHide={onHide} size="md">
      <Modal.Header closeButton>
        <Modal.Title className="py-0">
            <h1 className="title_header mb-0">Set Controller Order</h1>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-1">
        <div className="modal_height">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="controllers">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {items?.map((item, idx) => (
                  <Draggable key={item.header} draggableId={item.header} index={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: 8,
                          margin: "4px 0",
                          background: "#f8f9fa",
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          ...provided.draggableProps.style,
                        }}
                      >
                        {item?.header}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button className="rounded bg-gray border-0" onClick={onHide}>Cancel</Button>
        <Button className="rounded" onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SetColumnOrderModal;
