import { Dialog } from "primereact/dialog";
import React from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

const SeeFormImage = ({ show, handleShow, data, pageName }) => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      <Dialog
        header={pageName ?? t("Image Preview")}
        visible={show}
        onHide={() => {
          handleShow();
        }}
        draggable={false}
        className={theme}
        style={{ width: "300px" }}
      >
        <div className="row">
          <div>
            <img style={{ width: "100%" }} src={data} className="img-fluid" />
          </div>
        </div>
        <div className="row pt-2">
          <div className="col-sm-3">
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
    </>
  );
};

export default SeeFormImage;
