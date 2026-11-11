import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
const REAlertModal = ({
  show,
  data,
  handleClose,
  handleValueAlert,
  message
}) => {
  const [payload, setPayload] = useState(data);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const {t} = useTranslation();
  return (
    <>
      <Dialog
        header={t("Alert")}
        visible={show}
        top={"25%"}
        className={theme}
        onHide={handleClose}
        style={{
          width: isMobile ? "34vw" : "21vw",
        }}
      >
        <div className="modal-card">
          <div className="row d-flex justify-content-centre">
            <div className="col-sm-12 m-2" style={{fontWeight:"bold"}}>{message || "Value differs from the previous one. Do you want to continue?"}</div>
            <div className="col-sm-6">
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                onClick={handleValueAlert}
              >
                {t("Ok")}
              </button>
            </div>
            <div className="col-sm-6">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={handleClose}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default REAlertModal;
