import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";

import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const HoldReason = ({ showHold, setShowHold, handleHold }) => {
  const { t } = useTranslation();

  const theme = useLocalStorage("theme", "get");

  return (
    <Dialog
      visible={showHold.show}
      header={t(`Enter Hold Reason for ( ${showHold?.data?.VisitNo} )`)}
      onHide={setShowHold}
      className={theme}
    >
      <div className="row">
        <div className="col-sm-12 mt-2">
          <Input
            className="select-input-box form-control input-sm"
            lable="Hold Reason"
            placeholder=" "
            id="HoldReason"
            type="text"
            value={showHold?.data?.HoldReason}
            onChange={(e) => {
              setShowHold({
                ...showHold,
                data: { ...showHold?.data, HoldReason: e.target.value },
              });
            }}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-sm-6">
          <button
            type="button"
            className="btn btn-block btn-primary"
            onClick={() => {
              if (
                showHold?.data?.HoldReason?.trim() == "" ||
                !showHold?.data?.HoldReason
              )
                toast.error("Please Enter Hold Reason");
              else handleHold(showHold?.data, showHold?.index);
            }}
          >
            {t("Hold")}
          </button>
        </div>
        <div className="col-sm-6">
          <button
            type="button"
            className="btn btn-block btn-secondary"
            onClick={() => setShowHold({ data: "", show: false, index: -1 })}
          >
            {t("Cancel")}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default HoldReason;
