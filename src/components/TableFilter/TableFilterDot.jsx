import React, { useRef } from "react";

const TableFilterDot = ({
  // slide mode props
  slide,
  items,
  getColor,
  onSelect,
  statusCount,
  label,
  showArrows = true,
  // single dot props
  color,
  bgColor,
  textColor,
  onClick,
  title,
  className,
}) => {
  const scrollRef = useRef(null);

  const scrollBy = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -150 : 150,
      behavior: "smooth",
    });
  };

  if (items) {
    return (
      <div
        className={`d-flex align-items-center ${className || ""}`}
        style={{ gap: "6px", minWidth: 0 }}
      >
        {label && (
          <strong style={{ minWidth: "105px", flexShrink: 0 }}>{label}</strong>
        )}
        {slide && showArrows && (
          <button
            type="button"
            style={{
              flexShrink: 0,
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
            onClick={() => scrollBy("left")}
          >
            <i className="fa fa-chevron-left" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="d-flex align-items-center"
          style={{
            overflowX: showArrows ? "auto" : "visible",
            flexWrap: showArrows ? "nowrap" : "wrap",
            gap: "6px",
            whiteSpace: showArrows ? "nowrap" : "normal",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            flex: 1,
            minWidth: 0,
          }}
        >
          {items.map((sItem, idx) => (
            <div key={idx} style={{ flexShrink: 0 }}>
              <div
                onClick={() => onSelect?.(sItem?.value)}
                style={{ gap: "0px", minWidth: "fit-content" }}
                className="d-flex rounded justify-content-end pointer-cursor"
              >
                <div
                  style={{ backgroundColor: bgColor, gap: "2px" }}
                  className="tf-dot-chip d-flex align-items-center rounded px-1"
                >
                  <div
                    style={{
                      backgroundColor: getColor?.(sItem?.value) || "#ebebebbf",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      border: "1px solid rgba(0, 0, 0, 0.25)",
                    }}
                  />
                  <span className="tf-dot-label">
                    {sItem?.label}
                    {statusCount ? ` (${statusCount(sItem?.value)})` : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {slide && showArrows && (
          <button
            type="button"
            style={{
              flexShrink: 0,
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
            onClick={() => scrollBy("right")}
          >
            <i className="fa fa-chevron-right" />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        onClick={onClick}
        style={{ gap: "0px", minWidth: "fit-content" }}
        className={`${className} d-flex rounded justify-content-end pointer-cursor`}
      >
        <div
          style={{ backgroundColor: bgColor, gap: "2px" }}
          className="tf-dot-chip d-flex align-items-center rounded px-1"
        >
          <div
            style={{
              backgroundColor: color || "#ebebebbf",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "1px solid rgba(0, 0, 0, 0.25)",
            }}
          />
          <span className="tf-dot-label" style={{ color: textColor }}>
            {title}
          </span>
        </div>
      </div>
    </>
  );
};

export default TableFilterDot;
