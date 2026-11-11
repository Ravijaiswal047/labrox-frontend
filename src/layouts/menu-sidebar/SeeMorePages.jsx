import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import menu from "../menu-sidebar/menu-bar.png";

import { useTranslation } from "react-i18next";
const SeeMorePages = ({ pages }) => {
  const [show, setShow] = useState(false);
  const [filterData, setFilterData] = useState(pages);
  const [isOpenFromBottom, setIsOpenFromBottom] = useState(true);

  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const { t } = useTranslation();
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
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    if (spaceBelow > 250) {
      setIsOpenFromBottom(true);
    } else if (spaceAbove > 200) {
      setIsOpenFromBottom(false);
    }

    setShow(!show);
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    const filterResponse = pages.filter((page) =>
      page?.label?.toLowerCase().includes(value?.toLowerCase()),
    );
    setFilterData(filterResponse);
  };

  useEffect(() => {
    if (show) {
      inputRef.current?.focus();
    }
  }, [show]);
  const navigate = useNavigate();
  useEffect(() => {
    setFilterData(pages);
  }, [pages, navigate]);

  const renderCard = () => {
    if (!show) return null;

    const buttonRect = buttonRef.current.getBoundingClientRect();

    let horizontalPosition;
    if (buttonRect.left > 150)
      horizontalPosition = `${buttonRect.left - 150 + buttonRect.width / 2}px`;
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
          minWidth: "auto",
          maxWidth: "500px",
          maxHeight: "60%",
          overflow: "auto",
          border: "1px solid grey",
          left: horizontalPosition,
          top: isOpenFromBottom ? `${buttonRect.bottom + 5}px` : "auto",
          bottom: isOpenFromBottom
            ? "auto"
            : `${window.innerHeight - buttonRect.top + 5}px`,
          transition: "top 0.3s ease, bottom 0.3s ease, left 0.3s ease",
        }}
      >
        <div
          style={{ position: "sticky", top: 0, backgroundColor: "white" }}
          className="p-1"
        >
          <input
            type="text"
            placeholder="Search..."
            ref={inputRef}
            onChange={handleSearch}
            className="form-control"
          />
        </div>

        <div
          className="p-1"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr", // Create three columns
            gap: "4px", // Add spacing between items
          }}
        >
          {filterData.map((page, index) => (
            <div
              key={index}
              style={{
                color: "black",
                padding: "1px",
                cursor: "pointer",
                margin: "0px",
                maxWidth: "fit-content",
              }}
              onClick={() => {
                setShow(false);
                navigate(page.PageUrl); // Navigate to the page URL
              }}
            >
              <i className="fas fa-tachometer-alt nav-icon mr-2" />
              {t(page?.PageName)}
            </div>
          ))}
        </div>
      </div>,
      document.body,
    );
  };

  return (
    <div ref={buttonRef}>
      <div
        className="header p-1"
        style={{ cursor: "pointer" }}
        onClick={handleToggleCard}
      >
        <img src={menu} className="sizeicon mr-2"></img>
      </div>

      {renderCard()}
    </div>
  );
};

export default SeeMorePages;
