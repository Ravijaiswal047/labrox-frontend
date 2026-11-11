import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";
import { ReportEmailValidation } from "../../utils/Schema";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import axios from "axios";
import { CheckDevice } from "../../utils/helpers";
const SendEmailModalReprint = ({ data, handleClose, show }) => {
  let RADIO_BUTTON;

  if (data?.Status === 5 || data?.Status === 6) {
    RADIO_BUTTON = [
      { label: "Bill Receipt", value: "1" },
      { label: "Lab Report", value: "2" },
    ];
  } else {
    RADIO_BUTTON = [{ label: "Bill Receipt", value: "1" }];
  }

  const [formdata, setFormdata] = useState({
    To: "",
    CC: "",
    BCC: "",
    URL: "",
  });
  const [err, setErr] = useState({});
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [radio, setRadio] = useState("Bill Receipt");

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });
  };

  const handleChangeRadio = (e) => {
    const { value } = e.target;
    if (value === "2") {
      getReport();
    } else if (value === "1") {
      getReceipt();
    }
    setRadio(value === "1" ? "Bill Receipt" : "Lab Report");
  };

  const getReport = () => {
    axiosReport
      .post("commonReports/GetLabReport", {
        PHead: 1,
        TestIDHash: data?.TestIdHash,
        PrintColour: "1",
        IsDownload: CheckDevice(),
      })
      .then((res) => {
        setFormdata({ ...formdata, URL: res?.data?.url });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const sendEmail = () => {
    const generatedError = ReportEmailValidation(formdata);
    if (generatedError === "") {
      const payload = {
        ReportType: radio === "Bill Receipt" ? 1 : 2,
        Url: formdata?.URL,
        Email: formdata?.To,
        EmailCC: formdata?.CC,
        EmailBCC: formdata?.BCC,
        LedgerTransactionId: data?.LedgerTransactionID,
      };
      axiosInstance
        .post("Lab/SendEmail", payload)
        .then((res) => {
          toast.success(res?.data?.message);
          handleClose();
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    } else {
      setErr(generatedError);
    }
  };

  const getReceipt = () => {
    axios
      .post(
        "/reports/v1/getReceipt",
        { LedgerTransactionIDHash: data?.LedgertransactionIDHash },
        { responseType: "blob" },
      )
      .then((res) => {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setFormdata({ ...formdata, URL: url });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getReceipt();
  }, []);

  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      header="Send Email"
      visible={show}
      onHide={handleClose}
      draggable={false}
      className={theme}
    >
      <div className="">
        <div className="row">
          {RADIO_BUTTON.map((ele) => (
            <div key={ele.value} className="card-body d-flex flex-1">
              <div className="flex">
                <input
                  type="radio"
                  id={ele.label}
                  name="type"
                  checked={radio === ele.label}
                  onChange={handleChangeRadio}
                  value={ele.value}
                />
                <label htmlFor={ele.label} className="ml-2">
                  {ele.label}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          <label className="col-sm-4">To :</label>
          <div className="col-sm-8">
            <Input
              className="select-input-box form-control input-sm"
              name="To"
              value={formdata.To}
              type="text"
              onChange={handleChangeForm}
            />
            {!emailRegex.test(formdata.To) && (
              <span className="error-message">{err?.To}</span>
            )}
          </div>
        </div>

        <div className="row">
          <label className="col-sm-4">CC :</label>
          <div className="col-sm-8">
            <Input
              className="select-input-box form-control input-sm"
              type="text"
              name="CC"
              value={formdata.CC}
              onChange={handleChangeForm}
            />
            {formdata.CC.trim().length > 0 && !emailRegex.test(formdata.CC) && (
              <span className="error-message">{err?.CC}</span>
            )}
          </div>
        </div>

        <div className="row">
          <label className="col-sm-4">BCC :</label>
          <div className="col-sm-8">
            <Input
              className="select-input-box form-control input-sm"
              name="BCC"
              type="text"
              value={formdata.BCC}
              onChange={handleChangeForm}
            />
            {formdata.BCC.trim().length > 0 &&
              !emailRegex.test(formdata.BCC) && (
                <span className="error-message">{err?.BCC}</span>
              )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6">
          <button
            type="button"
            className="btn btn-block btn-danger btn-sm"
            onClick={handleClose}
          >
            Close
          </button>
        </div>

        <div className="col-sm-6">
          <button
            type="button"
            className="btn btn-block btn-success btn-sm"
            disabled={!formdata.URL}
            onClick={sendEmail}
          >
            Send Email
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default SendEmailModalReprint;
