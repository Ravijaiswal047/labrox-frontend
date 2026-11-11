import React, { useRef, useState, useEffect } from "react";
import "./newTable.css";

function Tables({ children, style, tableHeight, scrollView }) {
  const tableRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollStartX, setScrollStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const handleMouseUp = () => setIsScrolling(false);

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only allow left mouse button
    setIsScrolling(true);
    setScrollStartX(e.pageX - tableRef.current.offsetLeft);
    setScrollLeft(tableRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isScrolling) return;
    const x = e.pageX - tableRef.current.offsetLeft;
    const walk = x - scrollStartX;
    tableRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleKeyDown = (e) => {
    if (!tableRef.current) return;
    
    const scrollAmount = 50;
    switch(e.key) {
      case 'ArrowLeft':
        tableRef.current.scrollLeft -= scrollAmount;
        e.preventDefault();
        break;
      case 'ArrowRight':
        tableRef.current.scrollLeft += scrollAmount;
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  // Extract headers and rows from children
  const extractTableData = () => {
    let headers = [];
    let rows = [];

    React.Children.forEach(children, (child) => {
      if (child && child.type === 'thead') {
        React.Children.forEach(child.props.children, (tr) => {
          if (tr && tr.props && tr.props.children) {
            React.Children.forEach(tr.props.children, (th) => {
              if (th && th.props) {
                headers.push(th.props.children);
              }
            });
          }
        });
      }
      if (child && child.type === 'tbody') {
        React.Children.forEach(child.props.children, (tr, index) => {
          if (tr && tr.props && tr.props.children) {
            const rowData = [];
            React.Children.forEach(tr.props.children, (td) => {
              if (td && td.props) {
                rowData.push(td.props.children);
              }
            });
            rows.push({ id: index, data: rowData });
          }
        });
      }
    });

    return { headers, rows };
  };

  const { headers, rows } = extractTableData();

  return (
    <>
      {/* Desktop Table View */}
      <div
        id="no-more-tables"
        className={`table-scroll-container desktop-view ${tableHeight} ${scrollView} custom-scrollbar TabScroll`}
        style={{
          ...style,
          overflowX: "auto",
          cursor: isScrolling ? "grabbing" : "grab",
        }}
        ref={tableRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="Scrollable table"
        tabIndex={0}
      >
        <div className="table-inner-wrapper">
          <table className="clean-table mainTable">
            {children}
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-container" role="list" aria-label="Table data as cards">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="mobile-card" role="listitem">
            {row.data.map((cell, cellIndex) => (
              <div key={cellIndex} className="mobile-card-row">
                <div className="mobile-card-label">{headers[cellIndex]}</div>
                <div className="mobile-card-value">{cell}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default Tables;