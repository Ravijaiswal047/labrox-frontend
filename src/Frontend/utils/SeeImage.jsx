import React from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const SeeImage = ({ show, handleShow, data }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t("See Image")}
        visible={show}
        onHide={() => {
          handleShow();
        }}
        draggable={false}
        className={theme}
        style={{ width: "500px" }}
      >
        <div className="row">
          <div className="col-sm-12">
            <img src={data} className="img-fluid" />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-2">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={handleShow}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default SeeImage;
