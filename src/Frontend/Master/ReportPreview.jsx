import React, { useState } from "react";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
function ReportPreview({ show, handleClose }) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [load, setLoad] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const handlePreview = () => {
    if (value?.trim() == "") {
      toast.error("Please Enter Any Lab Number");
    } else {
      setLoad(true);
      axiosInstance
        .post("ReportMaster/GetLedgerTransactionIDHash", {
          LabNo: value?.trim(),
        })
        .then((res) => {
          if (
            res?.data?.success &&
            (res?.data?.message.Status == 5 ||
              res?.data?.message.Status == 6 ||
              res?.data?.message.Status == 10)
          ) {
            window.open(
              `${window.location.origin}/reports/v1/commonReports/GetLabReportQRDemo?LabNo=${res?.data?.message?.LedgerTransactionIDHash}`,
              "_blank",
            );
          } else {
            toast.error("Not Able To Generate Report");
          }
          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          console.log(err);
        });
    }
  };
  const handlePreview2 = () => {
    setLoad(true);
    axiosInstance
      .post("ReportMaster/GetLedgerTransactionIDHash", {
        LabNo: value?.trim(),
      })
      .then((res) => {
        window.open(
          `${window.location.origin}/reports/v1/commonReports/GetLabReportQRDemo?LabNo=${res?.data?.message?.LedgerTransactionIDHash}`,
          "_blank",
        );
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };
  return (
    <Dialog
      visible={show}
      className={theme}
      header={t("Preview Report")}
      onHide={handleClose}
      style={{
        width: isMobile ? "80vw" : "30vw",
      }}
    >
      <>
        <div className="row">
          <div className="col-sm-12 col-12">
            <Input
              type="text"
              placeholder="Lab Number"
              onChange={(e) => setValue(e.target.value)}
              name="value"
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-sm-5">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={handlePreview}
              >
                {t("Preview By Lab Number")}
              </button>
            )}
          </div>
          {/* <div className="col-sm-4">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={handlePreview2}
              >
                {t("Dummy Preview")}
              </button>
            )}
          </div> */}
          <div className="col-sm-3">
            <button
              className="btn btn-block btn-success btn-sm"
              onClick={handleClose}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </>
    </Dialog>
  );
}

export default ReportPreview;
