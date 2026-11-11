import React, { useEffect, useState } from "react";
import "./speedDrawer.css";

const SpeedDialWithDrawer = ({ actions=[], children, title, initialShow }) => {
  const [openDial, setOpenDial] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleActionClick = () => {
    setOpenDial(false);
    setOpenDrawer(true);
  };

  console.log('initialShow', initialShow);

  useEffect(()=>{
    if(initialShow){
        setOpenDrawer(true)
        setOpenDial(true);
    }
  },[])

  return (
    <>
      {/* Overlay */}
      {(openDial || openDrawer) && (
        <div
          className="overlay"
          onClick={() => {
            setOpenDial(false);
            setOpenDrawer(false);
          }}
        />
      )}

      {/* Drawer */}
      <div className={`drawer ${openDrawer ? "drawer-open" : ""}`}>
        <div className="drawer-header">
          <span>{title}</span>
          <span
            className="drawer-close"
            onClick={() => {
                setOpenDrawer(false)
            }}
          >
            ✕
          </span>
        </div>

        <div className="drawer-body">{children}</div>
      </div>

      {/* Speed Dial */}
      <div className="speed-dial-container">
        {openDial &&
          actions.map((action, index) => (
            <button
              key={index}
              className="speed-dial-action"
              style={{ bottom: `${70 + index * 52}px` }}
              onClick={handleActionClick}
              title={action.label}
            >
              {action.icon}
            </button>
          ))}

        <button
          className={`speed-dial-main ${openDial ? "rotate" : ""}`}
          onClick={() => {
            setOpenDial(!openDial)
            if(actions?.length == 0){
                handleActionClick()
            }
            if(openDrawer){
                setOpenDrawer(prev=>!prev)
            }
        }}
        >
          +
        </button>
      </div>
    </>
  );
};

export default SpeedDialWithDrawer;
