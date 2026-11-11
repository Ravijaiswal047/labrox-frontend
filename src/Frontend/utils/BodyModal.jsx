import React from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const BodyModal = ({ show, handleClose, body }) => {
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  return (
    <Dialog
      header="Email Body"
      visible={show}
      onHide={handleClose}
      className={theme}
      top="25%"
      style={{ width: isMobile ? "95vw" : "50vw" }}
    >
      <div style={{ whiteSpace: "pre-wrap" }} className="p-2">
        {body || "No body available"}
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-danger btn-sm" onClick={handleClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
};

export default BodyModal;
