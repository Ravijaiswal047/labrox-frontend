import React, { useRef, useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
function ResultEntryTableCustom({ children }) {
  return (
    <div id="no-more-tables">
      <div className="row">
        <div className="col-12">
          <Table
            className="mainTable pt-2 pl-2 pr-2 pb-2"
            bordered
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            {children}
          </Table>
        </div>
      </div>
    </div>
  );
}

export default ResultEntryTableCustom;
