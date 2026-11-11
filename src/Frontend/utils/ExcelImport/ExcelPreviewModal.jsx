import React, { useState } from "react";
// import Modal from "../../components/ModalComponent/Modal";
import Tables from "./ExcelViewTable";
import { Button } from "react-bootstrap";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import "./ExcelImport.css";

const ExcelPreviewModal = ({ excelJsonData, fileName = "" }) => {
  const theme = useLocalStorage("theme", "get");

  // Function to check if cell is empty
  const isEmptyCell = (cell) => {
    return cell === null && cell === undefined && cell === "";
  };

  console.log("excelJsonData", excelJsonData);

  const handleModalState = () => {
    setShowModal(true);
  };

  const [showModal, setShowModal] = useState(false);
  const onHideModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Dialog
        header={`${fileName} - Preview`}
        visible={showModal}
        onHide={onHideModal}
        className={`${theme}`}
        style={{ width: "90vw", maxHeight: "90vh" }}
        contentStyle={{ overflow: "auto" }}
        breakpoints={{ "98%": "95vw" }}
        footer={
          <div className="flex justify-end p-2 border-t bg-white sticky bottom-0">
            <Button variant="secondary" className="px-4" onClick={onHideModal}>
              Close
            </Button>
          </div>
        }
      >
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
              return String(cell);
            }),
          )}
        />
      </Dialog>
      <button onClick={handleModalState} className="btn p-0 btn_border_right">
        <i className="fa fa-eye text-white" aria-hidden="true"></i>
      </button>
    </>
  );
};

export default ExcelPreviewModal;
