import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import ReactSelect from "../../components/formComponent/ReactSelect";

const BillingRemarkModal = ({ show, handleShow, rowData, TableData }) => {
  const [payload, setPayload] = useState("");
  const [data, setData] = useState({ BillingRemarks: "" });
  const [remarkData, setRemarkData] = useState([]);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();

  const handleSearch = () => {
    axiosInstance
      .post("/Global/GetGlobalData", { Type: "BillingRemarks" })
      .then((res) => {
        if (res?.data?.success && Array.isArray(res?.data?.message)) {
          const selectedData = res?.data?.message?.map((item) => ({
            label: item?.FieldDisplay,
            value: item?.FieldID,
          }));
          setRemarkData([...selectedData, { label: "Others", value: 1 }]);
        } else {
          setRemarkData([{ label: "Others", value: 1 }]);
        }
      })
      .catch(() => {
        setRemarkData([{ label: "Others", value: 1 }]);
      });
  };

  useEffect(() => {
    if (show) handleSearch();
  }, [show]);

  const handleSearchSelectChange = (label, value) => {
    setData((prev) => ({ ...prev, [label]: value?.value }));
    setPayload(value?.value != 1 ? value?.label : "");
  };

  useEffect(() => {
    if (!show) return;
    if (rowData?.Remarks && remarkData?.length > 0) {
      const selectedOption = remarkData?.find(
        (ele) => ele?.label === rowData?.Remarks,
      );
      if (selectedOption) {
        setData({ BillingRemarks: selectedOption?.value });
        setPayload(selectedOption?.value !== 1 ? selectedOption?.label : "");
      } else {
        setData({ BillingRemarks: 1 });
        setPayload(rowData?.Remarks);
      }
    } else {
      setData({ BillingRemarks: "" });
      setPayload("");
    }
  }, [show, rowData, remarkData]);

  const handleSave = () => {
    if (!payload || !payload.trim()) {
      toast.error(t("Remark Can't Be Saved Blank"));
      return;
    }
    axiosInstance
      .post("PatientRegistration/UpdatetRemarksData", {
        remarks: payload,
        ledgertransactionIDHash: rowData?.LedgertransactionIDHash,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || t("Remark Saved Successfully"));
          handleShow();
          if (typeof TableData === "function") TableData("All");
        } else {
          toast.error(res?.data?.message || t("Error Occured"));
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Error Occured"),
        );
      });
  };

  return (
    <Dialog
      header={t("Billing Remarks")}
      visible={show}
      top={"25%"}
      className={theme}
      onHide={handleShow}
      style={{
        width: isMobile ? "70vw" : "17vw",
      }}
    >
      <div className="modal-card">
        <ReactSelect
          dynamicOptions={remarkData}
          name="BillingRemarks"
          lable={t("BillingRemarks")}
          id="BillingRemarks"
          removeIsClearable={true}
          placeholderName={t("BillingRemarks")}
          value={data?.BillingRemarks}
          onChange={handleSearchSelectChange}
        />
        {data?.BillingRemarks == 1 && (
          <textarea
            style={{ width: "100%", height: "20vh" }}
            className="form-control-txtarea p-2"
            name="CustomReason"
            onChange={(e) => {
              setPayload(e?.target?.value);
            }}
            value={payload}
          ></textarea>
        )}

        <div className="d-flex justify-content-centre">
          <div className="col-sm-6">
            <button
              type="button"
              className="btn btn-block btn-success btn-sm"
              onClick={handleSave}
            >
              {t("Save")}
            </button>
          </div>
          <div className="col-sm-6">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={handleShow}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default BillingRemarkModal;
