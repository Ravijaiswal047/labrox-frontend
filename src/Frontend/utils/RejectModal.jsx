import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getRejectCount } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import { validateRequiredFields } from "../../utils/helpers";

function RejectModal({ show, handleShow, data, TableData }) {
  const [dropDown, setDropDown] = useState([]);
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [payload, setPayload] = useState({
    Reason: "",
    CustomReason: "",
    informed: "",
  });

  const getDropDown = () => {
    axiosInstance
      .post("Global/getGlobalData", {
        Type: "RejectReason",
      })
      .then((res) => {
        let data = res.data.message;

        let selectdata = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        selectdata.unshift({ label: t("Other"), value: "other" });
        setDropDown(selectdata);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Error Occurred"),
        );
      });
  };

  const handleSelect = (event) => {
    const { name, value } = event?.target;
    if (value !== "other") {
      setPayload({ ...payload, [name]: value, CustomReason: value });
    } else {
      setPayload({ ...payload, [name]: value, CustomReason: "" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleReason = () => {
    return payload?.Reason === "other"
      ? payload?.CustomReason
        ? true
        : false
      : payload?.Reason;
  };

  const handleSubmit = () => {
    const requiredFields = [
      "informed",   
    ];
    const errors = validateRequiredFields(payload, requiredFields);
        if (Object.keys(errors).length > 0) {
          setErrors(errors);
          return;
        }

    if (handleReason()) {
      const rows = Array.isArray(data) ? data : [data];
      const alreadyRejected = rows.some(
        (item) =>
          Number(item?.Status) === 4 ||
          String(item?.IsSampleCollected || "").toUpperCase() === "R",
      );
      if (alreadyRejected) {
        toast.error(t("Sample is already rejected."));
        return;
      }

      const rejectionData = rows.map((item) => ({
        ...item,
        Reason: payload?.Reason,
        CustomReason: payload?.CustomReason,
        informTo: payload?.informed || "",
      }));

      axiosInstance
        .post("SC/SampleRejection", {
          data: rejectionData,
        })
        .then((res) => {
          if (!res.data?.success) {
            toast.error(res.data?.message || t("Error Occurred"));
            return;
          }
          handleShow();
          toast.success(res.data?.message);
          TableData("");
          getRejectCount();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : t("Error Occurred"),
          );
        });
    } else {
      toast.error(t("Please Choose Reason"));
    }
  };

  useEffect(() => {
    getDropDown();
  }, []);

  const theme = useLocalStorage("theme", "get");
  console.log("payload",payload);

  return (
    <Dialog
      visible={show}
      header={t("Select Reason to Reject Sample")}
      top={"10%"}
      onHide={handleShow}
      className={theme}
    >
      <div className="row">
        <div className="col-sm-12 mb-2">
          <SelectBox
            options={[{ label: t("Select"), value: "" }, ...dropDown]}
            name="Reason"
            selectedValue={payload?.Reason}
            onChange={handleSelect}
            lable={t("Select Reason")}
          />
        </div>
        
        {payload?.Reason === "other" && (
          <div className="col-sm-12 mb-2">
            <input
              className="form-control"
              name="CustomReason"
              placeholder={t("Enter your reason")}
              onChange={handleChange}
              value={payload?.CustomReason}
            />
          </div>
        )}
        <div className="col-sm-12">
          <Input
            className="select-input-box form-control input-sm"
            type="text"
            name="informed"
            lable={t("To Whom It was informed")}
            value={payload?.informed}
            onChange={handleChange}
          />
          {payload?.informed === "" && (
              <span className="error-message px-2">{errors?.informed}</span>
            )}
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-sm-6 p-1">
          <button
            type="button"
            className="btn btn-block btn-danger btn-sm"
            onClick={handleSubmit}
          >
            {t("Reject")}
          </button>
        </div>
        <div className="col-sm-6 p-1">
          <button
            type="button"
            className="btn btn-block btn-secondary btn-sm"
            onClick={handleShow}
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default RejectModal;
