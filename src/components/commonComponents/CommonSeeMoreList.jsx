import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const CommonSeeMoreList = ({
  name,
  icon,
  items = [],
  triggerStyle = {},
  listStyle = {},
}) => {
  const [show, setShow] = useState(false);
  const [isOpenFromBottom, setIsOpenFromBottom] = useState(true);
  const [horizontalAlignment, setHorizontalAlignment] = useState("left");
  const cardRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleCard = () => {
    if (!buttonRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const spaceBelow = windowHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const spaceLeft = buttonRect.left;
    const spaceRight = windowWidth - buttonRect.right;

    if (spaceBelow > 250) {
      setIsOpenFromBottom(true);
    } else if (spaceAbove > 200) {
      setIsOpenFromBottom(false);
    }
    if (spaceRight > 300) {
      setHorizontalAlignment("left");
    } else if (spaceLeft > 300) {
      setHorizontalAlignment("right");
    } else {
      setHorizontalAlignment("center");
    }

    setShow(!show);
  };

  const renderCard = () => {
    if (!show || !buttonRef.current) return null;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    let horizontalPosition;

    if (buttonRect.left > 150)
      horizontalPosition = `${buttonRect.left - 110 + buttonRect.width / 2}px`;
    else horizontalPosition = `${buttonRect.left}px`;

    return ReactDOM.createPortal(
      <div
        ref={cardRef}
        className="children-data"
        style={{
          position: "absolute",
          backgroundColor: "white",
          borderRadius: "5px",
          zIndex: 999,
          minWidth: "200px",
          maxWidth: "500px",
          maxHeight: "90%",
          overflow: "auto",
          border: "1px solid grey",
          left: horizontalPosition,
          top: isOpenFromBottom ? `${buttonRect.bottom + 5}px` : "auto",        
          bottom: isOpenFromBottom
            ? "auto"
            : `${window.innerHeight - buttonRect.top + 5}px`,
          transition: "top 0.3s ease, bottom 0.3s ease, left 0.3s ease",
          ...listStyle,
        }}
      >
        {/* Card content */}
        <div className="d-flex flex-wrap p-1">
          <div className="mx-2">
            {items?.map((item, index) => {
              return (
                <div
                  key={index}
                  style={{
                    color: "black",
                    padding: "1px",
                    cursor: "pointer",
                    margin: "1px",
                    maxWidth: "fit-content",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    setShow(false);
                    if (item?.onClick) {
                        item.onClick(item);
                    }
                  }}
                >
                  {item?.icon}
                  <span className="ml-3">{item?.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div ref={buttonRef}>
      <div
        className="header p-1"
        style={{ cursor: "pointer", display: "flex", alignItems: "center", ...triggerStyle }}
        onClick={handleToggleCard}
      >
        {name}
        {icon}
      </div>

      {renderCard()}
    </div>
  );
};

export default CommonSeeMoreList;
