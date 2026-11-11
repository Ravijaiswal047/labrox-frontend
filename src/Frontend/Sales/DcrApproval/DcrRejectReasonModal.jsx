import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
const DcrRejectReasonModal = ({
  show,
  handleClose,
  state,
  PageName,
  title,
  TableData,
}) => {
  console.log({PageName})
  const [payload, setPayload] = useState();
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  const handleDcrRejectReason = (payload) => {
    const filterData = PageName?.filter((ele)=>ele?.Print===1)

    const requstBody = filterData.map((row) => ({
      ids: row.DCRId,
      RejectReason: payload
    }));
    axiosInstance
      .post("/SalesFunnel/DcrReject", requstBody)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleClose();
          TableData();
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t(title)}
        visible={show}
        top={"25%"}
        className={theme}
        onHide={handleClose}
        style={{
          width: isMobile ? "30vw" : "17vw",
        }}
      >
        <div className="modal-card">
            <textarea
              style={{ width: "100%", height: "20vh" }}
              className="form-control-txtarea p-2"
              name="CustomReason"
              onChange={(e) => {
                setPayload(e?.target?.value);
              }}
              value={payload}
            ></textarea>
          <div className="d-flex justify-content-centre">
            <div className="col-sm-6">
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                onClick={() => {
                  handleDcrRejectReason(payload);
                }}
              >
                {t("Save")}
              </button>
            </div>
            <div className="col-sm-6">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={handleClose}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DcrRejectReasonModal;
