import { Dialog } from "primereact/dialog";
import React from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

const HoldReasonModal = ({ show, handleShow, title, tableDataReject }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {tableDataReject.length > 0 ? (
        <Dialog
          header={title}
          visible={show}
          top={"25%"}
          className={theme}
          onHide={handleShow}
          style={{
            width: isMobile ? "40vw" : "20vw",
          }}
        >
          <div className="modal-card">
            <div className="col-12">
              {/* <div className="col-12"> */}
              <textarea
                style={{ width: "100%", height: "20vh" }}
                className="form-control-txtarea p-2"
                name="HoldReason"
                disabled
                value={tableDataReject.map((data) =>
                  data?.Hold_Reason ? data?.Hold_Reason : "",
                )}
              />
              {/* </div> */}
            </div>
            <div className="col-12">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={handleShow}
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      ) : null}
    </>
  );
};

export default HoldReasonModal;
