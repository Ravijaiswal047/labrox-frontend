import React, { useEffect, useState, useCallback } from "react";
import { Settings, X } from "lucide-react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import PageControlMaster from "../../Frontend/Master/PageControlMaster/PageControlMaster";

const PageControlGear = ({ pageId }) => {
  const userData = useLocalStorage("userData", "get");
  const theme = useLocalStorage("theme", "get");
  const isSuperAdmin = userData?.SuperAdmin == 1;

  const [showGear, setShowGear] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F2") {
        e.preventDefault();
        e.stopPropagation();
        setShowGear((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!showDialog) return;
    const onEsc = (e) => {
      if (e.key === "Escape") setShowDialog(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showDialog]);

  useEffect(() => {
    document.body.style.overflow = showDialog ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDialog]);

  // ── useCallback — stable reference, unnecessary re-renders nahi hote ──
  const handleClose = useCallback((e) => {
    e.stopPropagation(); // Accordion toggle rokta hai
    setShowDialog(false);
  }, []);

  if (!isSuperAdmin || !showGear) return null;

  // ── X button — PageControlMaster ki Heading ke secondTitle mein jayega ──
  const closeButton = (
    <button
      onClick={handleClose}
      title="Close (ESC)"
      style={{
        background: "none",
        border: "1px solid #d1d5db",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "26px",
        height: "26px",
        borderRadius: "6px",
        color: "#374151",
        marginLeft: "8px",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#fee2e2";
        e.currentTarget.style.borderColor = "#ef4444";
        e.currentTarget.style.color = "#ef4444";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.borderColor = "#d1d5db";
        e.currentTarget.style.color = "#374151";
      }}
    >
      <X size={14} />
    </button>
  );

  return (
    <>
      {/* Gear icon — Accordion ke secondTitle mein render hoga */}
      <button
        title="Page Control Master (Ctrl+Shift+F2)"
        onClick={(e) => {
          e.stopPropagation();
          setShowDialog(true);
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 6px",
          borderRadius: "4px",
          display: "inline-flex",
          alignItems: "center",
          color: "#6b7280",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#2563eb";
          e.currentTarget.querySelector("svg").style.transform =
            "rotate(60deg)";
          e.currentTarget.querySelector("svg").style.transition =
            "transform 0.3s";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#6b7280";
          e.currentTarget.querySelector("svg").style.transform = "rotate(0deg)";
        }}
      >
        <Settings size={16} />
      </button>

      {showDialog && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1040,
            }}
          />

          {/* Full-screen panel */}
          <div
            className={theme}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1041,
              overflowY: "auto",
              background: "var(--surface-ground, #f8f9fa)",
            }}
          >
            <PageControlMaster
              embeddedPageId={pageId}
              closeButton={closeButton}
            />
          </div>
        </>
      )}
    </>
  );
};

export default PageControlGear;
