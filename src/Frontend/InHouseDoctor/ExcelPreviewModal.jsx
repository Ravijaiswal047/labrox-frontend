  import React, { useState } from "react";
  import Modal from "../../components/formComponent/Modal";
  import Tables from "./index";
  import "./InHouseDoctor.css";
  import { Button } from "react-bootstrap";

  const ExcelPreviewModal = ({ excelJsonData, fileName = "" }) => {
    const [modalHandlerState, setModalHandlerState] = useState({
      header: null,
      show: false,
      size: null,
      component: null,
      footer: null,
    });

    // Function to check if cell is empty
    const isEmptyCell = (cell) => {
      return cell === null && cell === undefined && cell === "";
    };

    const handleModalState = () => {
      setModalHandlerState({
        show: true,
        header: fileName,
        size: "60vw",
        component: (
          <>
            <Tables
              thead={excelJsonData?.[0]}
              tbody={excelJsonData?.slice(1)?.map((row) =>
                row.map((cell) => {
                  if (isEmptyCell(cell)) {
                    return (
                      <span
                        style={{
                          border: "1px solid red",
                          display: "inline-block",
                          padding: "2px",
                        }}
                      >
                        {cell || ""}
                      </span>
                    );
                  }
                  return cell;
                })
              )}
            />
          </>
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
        <button onClick={handleModalState} className="btn p-0 btn_border_right">
          <i className="fa fa-eye text-white" aria-hidden="true"></i>
        </button>
      </>
    );
  };

  export default ExcelPreviewModal;
