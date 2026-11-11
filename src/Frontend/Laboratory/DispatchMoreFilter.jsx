import React, { useState, useRef, useEffect } from "react";
import { PanelMenu } from "primereact/panelmenu";
import menu from "../../layouts/menu-sidebar/menu-bar.png";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const DispatchMoreFilter = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sidebarStyles = {
    position: "absolute",
    top: "0",
    right: "0",
    height: "66vh",
    width: isOpen ? "250px" : "0",
    boxShadow: "-9px 0 20px rgba(0,0,0,0.3)",
    overflowY: "auto",
    zIndex: 999,
    backgroundColor: "#343a40",
    color: "white",
    border: "1px solid white",
    borderRadius: "5px",
    marginTop: "-90px",
    transform: isOpen ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.3s ease-in-out",
  };

  return (
    <div>
      <div onClick={() => setIsOpen(!isOpen)}>
        <img src={menu} className="sizeicon mr-2" alt="menu icon" />
      </div>
      <div ref={sidebarRef} style={sidebarStyles}>
        <div
          style={{
            padding: "10px",
            borderBottom: "1px solid #4f5962",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          More Filter
        </div>
        <PanelMenu
          model={items}
          style={{
            padding: "5px",
            fontSize: "14px",
          }}
        />
      </div>
    </div>
  );
};

export default DispatchMoreFilter;
