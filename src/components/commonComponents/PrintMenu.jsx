import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

let currentlyOpenMenu = null;

const PrintMenu = ({ options = [] }) => {
  const validOptions = options.filter(
    (opt) => opt && typeof opt === "object" && opt.label
  );

  if (validOptions.length === 0) return null;

  const [open, setOpen] = useState(false);
  const iconRef = useRef(null);
  const menuRef = useRef(null);
  const idRef = useRef(Symbol("print-menu"));

  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (currentlyOpenMenu && currentlyOpenMenu !== setOpen) {
        currentlyOpenMenu(false);
      }
      currentlyOpenMenu = setOpen;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        !menuRef.current?.contains(e.target) &&
        !iconRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      <span
        ref={iconRef}
        className="fa fa-print print-icon"
        onClick={() => setOpen((p) => !p)}
      />

      {open &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className="print-menu"
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              zIndex: 9999999,
            }}
          >
            {validOptions.map((item, index) => (
              <div
                key={index}
                className="print-menu-item"
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
              >
                <span className="fa fa-print menu-icon" />
                {item.label}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default PrintMenu;
