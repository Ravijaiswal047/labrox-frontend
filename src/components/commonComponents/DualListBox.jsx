import React, { useState } from "react";
import Heading from "../UI/Heading";
import { Tooltip } from "primereact/tooltip";
import { notify } from "../../utils/ustil2";
import { useTranslation } from "react-i18next";

const DualListBox = ({
  LeftTitle,
  RightTitle,
  leftData = [],
  rightData = [],
  onMoveRight,
  onMoveLeft,
  onReorderLeft,
  enableReorder = false,
}) => {
  const [t] = useTranslation();
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);

  const moveRight = () => {
    if (selectedAvailable.length === 0) {
      notify("Please Select Items", "error");
      return;
    }

    onMoveRight(selectedAvailable);
    setSelectedAvailable([]);
  };

  const moveLeft = () => {
    if (selectedRight.length === 0) {
      notify("Please Select Items", "error");
      return;
    }
    onMoveLeft(selectedRight);
    setSelectedRight([]);
  };

  const moveUp = () => {

    if (selectedAvailable.length === 0) {
      notify("Please Select Items", "error");
      return;
    }

    if (selectedAvailable.length > 1) {
      notify("Please Select Only One Item to Reorder", "error");
      return;
    }

    const selectedId = selectedAvailable[0];
    const currentIndex = leftData.findIndex(
      (item) => item.ItemID === Number(selectedId)
    );

    if (currentIndex <= 0) {
      notify("Item is Already at the Top", "info");
      return;
    }

    // Create new array with swapped items
    const newOrder = [...leftData];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [
      newOrder[currentIndex],
      newOrder[currentIndex - 1],
    ];

    if (onReorderLeft) {
      onReorderLeft(newOrder);
    }
  };

  // NEW: Move selected items down in the order
  const moveDown = () => {
    if (selectedAvailable.length === 0) {
      notify("Please Select Items", "error");
      return;
    }

    if (selectedAvailable.length > 1) {
      notify("Please Select Only One Item to Reorder", "error");
      return;
    }

    const selectedId = selectedAvailable[0];
    const currentIndex = leftData.findIndex(
      (item) => item.ItemID === Number(selectedId)
    );

    if (currentIndex === -1 || currentIndex >= leftData.length - 1) {
      notify("Item is Already at the Bottom", "info");
      return;
    }

    // Create new array with swapped items
    const newOrder = [...leftData];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
      newOrder[currentIndex + 1],
      newOrder[currentIndex],
    ];

    if (onReorderLeft) {
      onReorderLeft(newOrder);
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px", width: "100%" }}>


      <div className="w-50">
        <Heading title={t(LeftTitle)} />
        <select
          multiple
          size={10}
          value={selectedAvailable}
          style={{ width: "100%" }}
          onChange={(e) => {
            return setSelectedAvailable(
              Array.from(e.target.selectedOptions, (option) => option.value)
            );
          }}
        >
          {leftData.map((item) => (
            <option key={item?.ItemID} value={item?.ItemID}>
              {item?.TypeName}
            </option>
          ))}
        </select>
      </div>
      {/* NEW: Up/Down arrows for reordering left side - only shown when enabled */}
      {enableReorder && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            justifyContent: "center",
          }}
        >
          <div
            className="arrowButton moveUp"
            onClick={moveUp}
            style={{ cursor: "pointer" }}
          >
            <Tooltip
              target=".moveUp"
              content={t("Move Item Up")}
              position="right"
            />
            <svg width="40" height="40" viewBox="0 0 512 512">
              <circle cx="256" cy="256" r="256" fill="#2196F3" />
              <path
                d="M256 176l96 96-96 96"
                fill="none"
                stroke="white"
                strokeWidth="48"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="rotate(-90 256 256)"
              />
            </svg>
          </div>

          <div
            className="arrowButton moveDown"
            onClick={moveDown}
            style={{ cursor: "pointer" }}
          >
            <Tooltip
              target=".moveDown"
              content={t("Move Item Down")}
              position="right"
            />
            <svg width="40" height="40" viewBox="0 0 512 512">
              <circle cx="256" cy="256" r="256" fill="#2196F3" />
              <path
                d="M256 176l96 96-96 96"
                fill="none"
                stroke="white"
                strokeWidth="48"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="rotate(90 256 256)"
              />
            </svg>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          justifyContent: "center",
        }}
      >
        <div
          className="arrowButton moveRight"
          onClick={moveRight}
          style={{ cursor: "pointer" }}
        >
          <Tooltip
            target=".moveRight"
            content={t("Click to Remove Mapping")}
            position="left"
          />
          <svg width="40" height="40" viewBox="0 0 512 512">
            <circle cx="256" cy="256" r="256" fill="green" />
            <path
              d="M288 160l96 96-96 96M384 256H128"
              fill="none"
              stroke="white"
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          className="arrowButton moveLeft"
          onClick={moveLeft}
          style={{ cursor: "pointer" }}
        >
          <Tooltip target=".moveLeft" content={t("Click to Map the Item")} />
          <svg width="40" height="40" viewBox="0 0 512 512">
            <circle cx="256" cy="256" r="256" fill="green" />
            <path
              d="M224 352l-96-96 96-96M128 256h256"
              fill="none"
              stroke="white"
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="w-50">
        <Heading title={t(RightTitle)} />
        <select
          multiple
          size={10}
          value={selectedRight}
          style={{ width: "100%" }}
          onChange={(e) => {
            return setSelectedRight(
              Array.from(e.target.selectedOptions, (option) => option?.value)
            );
          }}
        >
          {rightData.map((item) => (
            <option key={item?.ItemID} value={item?.ItemID}>
              {item?.TypeName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DualListBox;