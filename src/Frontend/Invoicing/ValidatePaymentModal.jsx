import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import moment from "moment";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";
import DatePicker from "../../components/formComponent/DatePicker";

import Loading from "../../components/loader/Loading";
import { number } from "../../utils/helpers";
function ValidatePaymentModal({ showValidateModal, handleClose }) {
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const { t } = useTranslation();
  const [BankName, setBankName] = useState([]);
  const [PaymentMode, setPaymentMode] = useState([]);
  const [load, setLoad] = useState(false);

  const [formData, setFormData] = useState({
    PaymentUpdateRemark: showValidateModal?.data?.remarks ?? "",
    PaymentMode: showValidateModal?.data?.PaymentMode ?? "",
    PaymentModeId: showValidateModal?.data?.PaymentMode ?? "",
    AdvAmount: showValidateModal?.data?.ReceivedAmt ?? "",
    CardNo: showValidateModal?.data?.CardNo ?? "",
    CardDate: showValidateModal?.data?.CardDate
      ? new Date(showValidateModal?.data?.CardDate)
      : new Date(),
    BankName: showValidateModal?.data?.BankName ?? "",
    Id: showValidateModal?.data?.ID ?? "",
  });

  const handleSelectChange = (event) => {
    const { name, value, selectedIndex } = event.target;
    if (name === "PaymentModeId") {
      setFormData({
        ...formData,
        [name]: value,
        PaymentMode: value,

        CardNo: "",
        CardDate: new Date(),
        BankName: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    const { disable, message } = validate(
      formData["PaymentUpdateRemark"],
      formData["PaymentMode"],
      formData.AdvAmount,
    );
    if (!disable) {
      setLoad(true);
      axiosInstance
        .post("Accounts/UpdateAdvPayment", {
          ...formData,
          CardDate: moment(formData?.CardDate).format("DD-MMM-YYYY"),
        })
        .then((res) => {
          toast.success(res?.data?.message);
          setLoad(false);

          handleClose();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
          setLoad(false);
        });
    } else {
      setLoad(false);
      toast.error(message);
    }
  };
  const validate = (condition1, condition, InvoiceAmt) => {
    let disable = false;
    let message = "";
    if (condition === "") {
      disable = true;
      message = "Please Choose Payment Mode";
    } else if (["Paytm", "Online Payment"].includes(condition)) {
    } else if (["Debit Card", "Credit Card"].includes(condition)) {
      if (formData["BankName"] === "") {
        disable = true;
        message = "Please Choose BankName";
      } else if (formData["CardNo"].length < 15) {
        disable = true;
        message = `Please Enter Valid ${condition} Number`;
      }
    } else if (["Cheque"].includes(condition)) {
      if (formData["BankName"] === "") {
        disable = true;
        message = "Please Choose BankName";
      } else if (formData["CardNo"].length < 15) {
        disable = true;
        message = `Please Enter Valid ${condition} Number`;
      }
    }

    if (condition) {
      if (InvoiceAmt === "" || InvoiceAmt == 0) {
        disable = true;
        message = "Please Enter InvoiceAmt";
      }
      if (condition1 === "") {
        disable = true;
        message = "Please Enter Remarks";
      }
    }
    return {
      disable: disable,
      message: message,
    };
  };

  const getPaymentMode = (name, state) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ["PaymentMode", "BankName"].includes(name)
              ? ele.FieldDisplay
              : ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        state(value);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  useEffect(() => {
    getPaymentMode("PaymentMode", setPaymentMode);
    getPaymentMode("BankName", setBankName);
  }, []);

  return (
    <Dialog
      onHide={handleClose}
      title=""
      visible={showValidateModal?.validateModal}
      className={theme}
    >
      <div className="row px-2 mt-2 mb-1">
        <div className="col-sm-3">
          <Input
            id="Client Name"
            lable="Client Name"
            placeholder=" "
            value={showValidateModal?.data?.centre}
            disabled={true}
          />
        </div>
        <div className="col-sm-3">
          <Input
            id="Paid Date"
            lable="Paid Date"
            placeholder=" "
            value={showValidateModal?.data?.EntryDate}
            disabled={true}
          />
        </div>
        <div className="col-sm-3">
          <SelectBox
            options={[
              { label: "Select Payment Mode", value: "" },
              ...PaymentMode,
            ]}
            onChange={handleSelectChange}
            name="PaymentModeId"
            lable="Select Payment Mode"
            id="Select Payment Mode"
            selectedValue={(PaymentMode, formData?.PaymentModeId)}
          />
        </div>
        <div className="col-sm-3">
          <Input
            type="text"
            id="Update Remarks"
            lable="Update Remarks"
            placeholder=" "
            name="PaymentUpdateRemark"
            value={formData?.PaymentUpdateRemark}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="row px-2 mt-1 mb-1">
        <div className="col-sm-2">
          <Input
            value="0"
            id="CUR.Round"
            lable="CUR.Round"
            placeholder=" "
            disabled={true}
          />
        </div>

        <div className="col-sm-2">
          <Input
            id="Invoice Number"
            lable="Invoice Number"
            placeholder=" "
            value={showValidateModal?.data?.invoiceNo}
            disabled={true}
          />
        </div>

        <div className="col-sm-2">
          <Input
            id="Invoice Amount"
            lable="Invoice Amount"
            placeholder=" "
            value={formData?.AdvAmount}
            disabled={true}
          />
        </div>
      </div>

      <div className="row mt-1">
        <Tables>
          <thead class="cf">
            <tr>
              {[
                t("Payment Mode"),
                t("Paid Amt."),
                t("Currency"),
                t("Base"),
                ["Cheque", "Credit Card", "Debit Card"].includes(
                  formData?.PaymentMode,
                )
                  ? t("Cheque/Card No.")
                  : "",
                ["Cheque", "Credit Card", "Debit Card"].includes(
                  formData?.PaymentMode,
                )
                  ? "Cheque/Card Date"
                  : "",
                ["Cheque", "Credit Card", "Debit Card"].includes(
                  formData?.PaymentMode,
                )
                  ? t("Bank Name")
                  : "",
              ].map((ele, index) => ele !== "" && <th key={index}>{ele}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-title={t("PaymentMode")}>
                {formData?.PaymentMode == ""
                  ? "Select Payment Mode"
                  : formData?.PaymentMode}
                &nbsp;
              </td>
              <td data-title={t("Paid Amt.")}>
                <Input
                  className="w-100"
                  type="number"
                  name="AdvAmount"
                  onInput={(e) => number(e, 7)}
                  value={formData?.AdvAmount}
                  onChange={handleChange}
                />
              </td>
              <td data-title={t("Currency")}>INR</td>
              <td data-title={t("Base")}>0</td>
              {["Cheque"].includes(formData?.PaymentMode) && (
                <td data-title={t("Cheque No")}>
                  <Input
                    type="number"
                    onInput={(e) => number(e, 16)}
                    name="CardNo"
                    value={formData?.CardNo}
                    onChange={handleChange}
                  />
                </td>
              )}

              {["Credit Card", "Debit Card"].includes(
                formData?.PaymentMode,
              ) && (
                <td data-title={t("CardNo")}>
                  <Input
                    className="select-input-box form-control input-sm"
                    type="number"
                    onInput={(e) => number(e, 16)}
                    name="CardNo"
                    value={formData?.CardNo}
                    onChange={handleChange}
                  />
                </td>
              )}
              {["Cheque", "Credit Card", "Debit Card"].includes(
                formData?.PaymentMode,
              ) && (
                <td data-title={t("CardDate")}>
                  <DatePicker
                    name="CardDate"
                    className="custom-calendar"
                    value={formData?.CardDate}
                    onChange={dateSelect}
                  />
                </td>
              )}
              {["Cheque", "Credit Card", "Debit Card"].includes(
                formData?.PaymentMode,
              ) && (
                <td data-title={t("BankName")}>
                  <SelectBox
                    options={[{ label: "Select Bank", value: "" }, ...BankName]}
                    name="BankName"
                    selectedValue={formData?.BankName}
                    onChange={handleChange}
                  ></SelectBox>
                </td>
              )}
            </tr>
          </tbody>
        </Tables>
      </div>
      <div className="row px-1 mt-2 mb-1">
        {load ? (
          <Loading />
        ) : (
          <>
            <div className="col-sm-2">
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={() => handleSave()}
              >
                {t("Update")}
              </button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}

export default ValidatePaymentModal;
