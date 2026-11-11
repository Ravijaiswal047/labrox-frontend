import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";

const SuggestionModal = ({ children, view }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(view);
  const [fadeIn, setFadeIn] = useState(false);

  const modalRef = useRef(null);
  const pos = useRef({ x: 0, y: 0, left: 0, top: 0 });

  useEffect(() => {
    if (show) setFadeIn(true);
  }, [show]);

  // Handle Mouse Events
  const onMouseDown = (e) => {
    const modal = modalRef.current;
    pos.current = {
      x: e.clientX,
      y: e.clientY,
      left: modal.offsetLeft,
      top: modal.offsetTop,
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    const dx = e.clientX - pos.current.x;
    const dy = e.clientY - pos.current.y;
    const modal = modalRef.current;
    modal.style.left = `${pos.current.left + dx}px`;
    modal.style.top = `${pos.current.top + dy}px`;
    modal.style.right = "auto"; // Disable fixed right so dragging works
    modal.style.bottom = "auto"; // Disable fixed bottom so dragging works
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={modalRef}
      className={`box box-success form-horizontal ${fadeIn ? "fade-in" : "fade-out"}`}
      style={{
        position: "fixed",
        right: "10px",
        bottom: "0px",
        zIndex: "999",
        width: "90%",
        maxWidth: "450px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "start",
        padding: "3px",
        margin: "5px",
        background: "#f0f4ff",
        border: "1px solid #ced4da",
        borderRadius: "5px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        transition: "opacity 2s",
        opacity: fadeIn ? 1 : 0,
        cursor: "move", // Optional for user feedback
      }}
    >
      {/* Draggable Header */}
      <div
        style={{
          width: "100%",
          cursor: "grab",
          backgroundColor: "#dee2f0",
          padding: "5px",
          borderRadius: "3px 3px 0 0",
        }}
        onMouseDown={onMouseDown}
      >
        <div>
          <Heading isBreadcrumb={true} name={t("Test Suggestions")} />
        </div>
      </div>

      {/* Content */}
      {show && (
        <div style={{ maxHeight: "80vh", overflowY: "auto", width: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default SuggestionModal;
