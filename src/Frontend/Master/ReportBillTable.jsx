import React, { useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Loading from "../../components/loader/Loading";
function ReportBillTable({
  children,
  style,
  tableHeight,
  scrollView,
  zoom,
  
  setZoom,
  handleSubmitHeaderSetup,
  load,
}) {
  const tableRef = useRef(null);

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      <div
        id="no-more-tables"
        style={{
          ...style,
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "thin",
          scrollbarColor: "#a1c6db white",
          borderRadius: "5px",
        }}
        className={`${tableHeight} ${scrollView} custom-scrollbar TabScroll`}
        ref={tableRef}
      >
        <div className="row">
          <div className="col-12">
            <Table
              className="mainTable pt-2 pl-2 pr-2 pb-2 reportClass"
              bordered
            >
              {children}
            </Table>
          </div>
        </div>
      </div>
      <Dialog
        header="Header Setup"
        visible={zoom}
        onHide={() => setZoom(false)}
        className={theme}
        style={{
          width: isMobile ? "130vw" : "90vw",
        }}
      >
        <Table className="mainTable  pt-2 pl-2 pr-2 pb-2 reportClass" bordered>
          {children}
        </Table>
        <div className="row mt-2">
          <div className="col-sm-2">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-danger btn-sm"
                onClick={handleSubmitHeaderSetup}
              >
                {"Update"}
              </button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default ReportBillTable;
