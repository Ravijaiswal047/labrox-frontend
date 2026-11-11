import React from "react";
import ReactDOM from "react-dom";

const CustomTooltip = ({ testNames, position, rowIndex, totalRows }) => {
  if (!position || !testNames.length) return null;

  const isMobile = window.innerWidth < 768;
  const isGrouped = testNames.some((t) => t.type);
  const maxWidth = isMobile
    ? window.innerWidth * 0.9
    : isGrouped
      ? Math.min(560, window.innerWidth * 0.48)
      : Math.min(500, window.innerWidth * 0.4);

  const testCount = testNames.filter((t) => t.type === "test" || !t.type).length;
  const headerCount = testNames.filter((t) => t.type === "package-header" || t.type === "no-package-header").length;
  const tooltipHeight = testCount * 26 + headerCount * 30 + 12;

  const rowTop = position.rowTop ?? position.y ?? 0;
  const rowBottom = position.rowBottom ?? (position.y ? position.y + 20 : 20);

  const rowsToFlip = 8;
  const shouldFlipVertically =
    totalRows - rowIndex <= rowsToFlip ||
    rowBottom + tooltipHeight + 4 > window.innerHeight;

  let topPosition = shouldFlipVertically ? rowTop - tooltipHeight - 2 : rowBottom + 2;

  // On mobile, clamp so popup never goes above the visible area
  // (getBoundingClientRect gives rect.bottom so it's below the card,
  // but if the card is near the bottom, flip it upward).
  if (isMobile) {
    if (topPosition + tooltipHeight > window.innerHeight - 10)
      topPosition = position.y - tooltipHeight - 8;
    topPosition = Math.max(8, topPosition);
  }

  const leftPosition = isMobile
    ? Math.max(8, Math.min(position.x, window.innerWidth - maxWidth - 8))
    : position.x + maxWidth + 10 > window.innerWidth
      ? window.innerWidth - maxWidth - 10
      : position.x + 5;

  // Per-group counts for correct isLastOdd per section
  const groupCounts = {};
  const groupCounters = {};
  if (isGrouped) {
    testNames.filter((t) => t.type === "test").forEach((t) => {
      const key = t.groupKey || "__individual__";
      groupCounts[key] = (groupCounts[key] || 0) + 1;
    });
  }
  const totalTests = isGrouped ? testNames.filter((t) => t.type === "test").length : 0;
  let testCounter = 0;


  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: topPosition,
        left: leftPosition,
        width: maxWidth,
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: "8px",
        zIndex: 9999,
        boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
        fontSize: isMobile ? "12px" : "11px",
        overflow: "hidden",
        pointerEvents: "none",
        maxHeight: "60vh",
        overflowY: "auto",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      }}
    >
      {isGrouped ? (
        testNames.map((item, idx) => {
          if (item.type === "package-header") {
            return (
              <div
                key={idx}
                style={{
                  gridColumn: "1 / -1",
                  background: "#4f46e5",
                  color: "#fff",
                  fontWeight: "600",
                  padding: "5px 10px",
                  fontSize: isMobile ? "12px" : "11px",
                  letterSpacing: "0.3px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  borderTop: idx !== 0 ? "1px solid rgba(255,255,255,0.2)" : "none",
                }}
              >
                Package Name - {item.packageName}
              </div>
            );
          }

          if (item.type === "no-package-header") {
            return (
              <div
                key={idx}
                style={{
                  gridColumn: "1 / -1",
                  background: "#4f46e5",
                  color: "#fff",
                  fontWeight: "600",
                  padding: "5px 10px",
                  fontSize: isMobile ? "12px" : "11px",
                  letterSpacing: "0.3px",
                  display: "flex",
                  alignItems: "center",
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Individual Tests
              </div>
            );
          }

          if (item.type === "test") {
            const key = item.groupKey || "__individual__";
            groupCounters[key] = (groupCounters[key] || 0) + 1;
            const posInGroup = groupCounters[key] - 1;
            const groupTotal = groupCounts[key] || 1;
            const isLastOdd = groupTotal % 2 !== 0 && posInGroup === groupTotal - 1;
            testCounter++;
            // "10" = Result Done (Save) / "5" = Approved (Constants.jsx's
            // SampleStatus) - the only two states that actually carry a
            // by-whom/when on patient_labinvestigation_opd (ResultEntered*
            // for Save, Approved* for Approved), so this line is skipped for
            // every other status instead of showing a blank "by / on".
            const actionByName =
              item.statusValue === "5"
                ? item.approvedName
                : item.statusValue === "10"
                  ? item.resultEnteredName
                  : "";
            const actionDate =
              item.statusValue === "5" ? item.approvedDate : item.resultEnteredDate;
            return (
              <div
                key={idx}
                className={`Status-${item.statusValue}`}
                style={{
                  borderRight: "0.5px solid rgba(0,0,0,0.15)",
                  borderBottom: "0.5px solid rgba(0,0,0,0.15)",
                  color: "#222",
                  textAlign: "left",
                  padding: "4px 6px",
                  backgroundColor: "#fafafa",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  gridColumn: isLastOdd ? "1 / -1" : "auto",
                }}
              >
                {item.text} - {item.status}
                {actionByName && (
                  <div style={{ color: "#666", fontStyle: "italic", marginTop: "1px" }}>
                    {item.statusValue === "5" ? "Approved by" : "Saved by"} {actionByName}
                    {actionDate ? ` on ${actionDate}` : ""}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })
      ) : (
        testNames.map((t, idx) => {
          const isLastOdd = testNames.length % 2 !== 0 && idx === testNames.length - 1;
          return (
            <div
              key={idx}
              className={`Status-${t.statusValue}`}
              style={{
                borderRight: "0.5px solid rgba(0,0,0,0.15)",
                borderBottom: "0.5px solid rgba(0,0,0,0.15)",
                color: "#222",
                textAlign: "left",
                padding: "4px 6px",
                backgroundColor: "#fafafa",
                wordWrap: "break-word",
                whiteSpace: "normal",
                gridColumn: isLastOdd ? "1 / -1" : "auto",
              }}
            >
              {t.text}
            </div>
          );
        })
      )}
    </div>,
    document.body
  );
};

export default CustomTooltip;
