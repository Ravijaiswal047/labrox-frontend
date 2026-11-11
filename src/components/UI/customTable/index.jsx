// import React, { useRef, useState, useEffect } from "react";
// import Table from "react-bootstrap/Table";
// function Tables({
//   children,
//   style,
//   tableHeight,
//   scrollView,
//   removeScrollOverFlow = false,
// }) {
//   const tableRef = useRef(null);
//   const [isScrolling, setIsScrolling] = useState(false);
//   const [scrollStartX, setScrollStartX] = useState(0);
//   const [scrollLeft, setScrollLeft] = useState(0);

//   useEffect(() => {
//     const handleMouseUp = () => setIsScrolling(false);

//     document.addEventListener("mouseup", handleMouseUp);
//     return () => {
//       document.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, []);

//   const handleMouseDown = (e) => {
//     if (e.button !== 0) return; // Only allow left mouse button
//     setIsScrolling(true);
//     setScrollStartX(e.pageX - tableRef.current.offsetLeft);
//     setScrollLeft(tableRef.current.scrollLeft);
//   };

//   const handleMouseMove = (e) => {
//     if (!isScrolling) return;
//     const x = e.pageX - tableRef.current.offsetLeft;
//     const walk = x - scrollStartX;
//     tableRef.current.scrollLeft = scrollLeft - walk;
//   };

//   return (
//     <div
//       id="no-more-tables"
//       style={{
//         ...style,
//         overflowX: removeScrollOverFlow ? "visible" : "auto",
//         cursor: isScrolling ? "grabbing" : "grab",
//         // userSelect: "none",
//         whiteSpace: "nowrap",
//         scrollbarWidth: "thin",
//         scrollbarColor: "#a1c6db white",
//         borderRadius: "5px",
//       }}
//       // style={style}
//       className={`${tableHeight} ${scrollView} ${removeScrollOverFlow ? "" : "custom-scrollbar"} TabScroll`}
//       ref={tableRef}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//     >
//       <div className="row mx-0">
//         <div className="col-12 px-0">
//           <Table
//             style={{ padding: "0px 0px 2px 6px" }}
//             className="mainTable pt-2 pl-2 pr-2 pb-2"
//             bordered
//           >
//             {children}
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Tables;

import React, { useRef, useState, useEffect } from "react";
import Table from "react-bootstrap/Table";

function Tables({
  children,
  style,
  tableHeight,
  scrollView,
  removeScrollOverFlow = false,
  onScroll,
}) {
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
    if (e.button !== 0) return;
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

  return (
    /*
      ✅ KEY FIX for sticky thead:
      "position: sticky" on thead only works when the DIRECT scroll
      parent has overflow set. Here #no-more-tables div IS the scroll
      parent, so sticky thead will work correctly.
      
      removeScrollOverFlow = true  → responsive card mode, no overflow
      removeScrollOverFlow = false → normal table mode, overflow: auto
    */
    <div
      id="no-more-tables"
      ref={tableRef}
      style={{
        ...style,
        overflowX: removeScrollOverFlow ? "visible" : "auto",
        overflowY: removeScrollOverFlow ? "visible" : "auto",
        maxHeight: removeScrollOverFlow ? "none" : "500px",
        cursor: isScrolling ? "grabbing" : "grab",
        whiteSpace: "nowrap",
        scrollbarWidth: "thin",
        scrollbarColor: "#a1c6db white",
        borderRadius: "5px",
        position: "relative",
      }}
      className={`${tableHeight || ""} ${scrollView || ""} ${
        removeScrollOverFlow ? "" : "custom-scrollbar"
      } TabScroll`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onScroll={onScroll}
    >
      <div className="row mx-0">
        <div className="col-12 px-0">
          <Table
            style={{ padding: "0px 0px 2px 6px" }}
            className="mainTable pt-2 pl-2 pr-2 pb-2"
            bordered
          >
            {children}
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Tables;
