import React, { useEffect, useState } from "react";
import "./Indent.css";
import Tables from "../../../../components/UI/customTable";
import Modal from "../../../../components/ModalComponent/Modal";

const ExcelPreviewModal = ({ excelJsonData, fileName = "" }) => {
  const [modalHandlerState, setModalHandlerState] = useState({
    header: null,
    show: false,
    size: null,
    component: null,
    footer: null,
  });

  const handleEmptyCell = (cell) => {
    return !!cell;
  };

  const handleModalState = () => {
    const tableHeader = excelJsonData?.[0] || [];
    const tableBody = excelJsonData?.slice(1) || [];

    setModalHandlerState({
      show: true,
      header: fileName,
      size: "60vw",
      component: (
        <Tables>
          <thead>
            <tr>
              {tableHeader.map((header, index) => (
                <th key={index} className="text-center">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableBody.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const headerName = tableHeader[cellIndex]?.toLowerCase();

                  // Validation for "Indent Qty"
                  if (
                    headerName === "indent qty" &&
                    (!cell || parseInt(cell) <= 0)
                  ) {
                    return (
                      <td key={cellIndex} className="text-left">
                        <span style={{ color: "red", fontWeight: 600 }}>
                          {cell || "Invalid"}
                        </span>
                      </td>
                    );
                  }

                  // Empty cell check
                  if (!handleEmptyCell(cell)) {
                    return (
                      <td key={cellIndex} className="text-left">
                        <span
                          style={{
                            borderBottom: "1px solid red",
                            padding: "2px",
                          }}
                        >
                          {cell || "Empty"}
                        </span>
                      </td>
                    );
                  }

                  // Normal cell
                  return <td key={cellIndex} className="text-center">{cell}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </Tables>
      ),
      footer: "",
    });
  };

  return (
    <>
      {modalHandlerState?.show && (
        <Modal
          visible={modalHandlerState?.show}
          setVisible={() =>
            setModalHandlerState({
              show: false,
              component: null,
              size: null,
            })
          }
          modalWidth={modalHandlerState?.size}
          Header={modalHandlerState?.header}
          footer={modalHandlerState?.footer}
        >
          {modalHandlerState?.component}
        </Modal>
      )}

      <button onClick={handleModalState} className="btn btn_border_right">
        <i className="fa fa-eye text-white" aria-hidden="true"></i>
      </button>
    </>
  );
};

export default ExcelPreviewModal;
