import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import { PayBy } from "../../utils/Constants";
import DatePicker from "../../components/formComponent/DatePicker";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { dateConfig, number } from "../../utils/helpers";
import { toast } from "react-toastify";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";

function SettlementPatient() {
  const [paymentMode, setPaymentMode] = useState([]);
  const [BankName, setBankName] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [Load, setLoad] = useState(false);
  const [LabNo, setLabNo] = useState([]);

  const [payload, setPayload] = useState({
    PayBy: "0",
    PaymentMode: "Paytm",
    Amount: "",
    DueAmount: "",
    S_Currency: "INR",
    S_Notation: "INR",
    C_Factor: 1,
    PaymentModeID: "123",
    S_CountryID: 1,
    S_Amount: "10",
    LedgerTransactionID: "",
    UpdateRemarks: "",
    BankName: "",
    NewAmount: "",
    CardNo: "",
    CardDate: "",
    TransactionNo: "",
    FromDate: new Date(),
  });

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    if (name === "PaymentModeID") {
      const data = paymentMode?.find((ele) => ele?.value == value);
      setPayload({
        ...payload,
        [name]: data?.value,
        PaymentMode: data?.label,
        BankName: "",
        CardNo: "",
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };
  const fetch = () => {
    axiosInstance
      .post("Settlement/GetDataToSettlement", {
        LedgerTransactionNo: LabNo.trim(),
      })
      .then((res) => {
        if (res?.data?.message.length == 0) {
          toast.error("No record found");
        }
        setTableData(res?.data?.message);
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
    setPayload({
      ...payload,
      LedgerTransactionIDHash: tableData[0]?.LedgertransactionIDHash,
      LedgerTransactionID: tableData[0]?.LedgerTransactionID,

      Amount: tableData[0]?.DueAmount,
    });
  }, [tableData]);

  const validate = (condition) => {
    let disable = false;
    let message = "";
    if (condition === "") {
      disable = true;
      message = "Please Choose Payment Mode";
    } else if (["Paytm", "Online Payment", "ESEWA", "ESewa", "eSewa"].includes(condition)) {
      if ((payload["TransactionNo"] || "").length <= 10) {
        disable = true;
        message =
          "Please Fill Correct Transaction Number Of Length Greater than 10";
      }
    } else if (/^(card|upi)$/i.test(condition || "")) {
      if (!(payload["TransactionNo"] || "").trim()) {
        disable = true;
        message = "Please Fill Transaction Number";
      }
    } else if (["Debit Card", "Credit Card", "Cheque"].includes(condition)) {
      const bankName = (payload["BankName"] || "").trim();
      if (!bankName || bankName === "BankName" || bankName === "Select") {
        disable = true;
        message = "Please Choose BankName";
      } else if ((payload["CardNo"] || "").length < 16) {
        disable = true;
        message = `Please Enter Valid ${condition} Number`;
      }
    }

    return {
      disable: disable,
      message: message,
    };
  };

  const getReceipt = (id) => {
    axiosInstance
      .post(
        "/reports/v1/getReceipt",
        { LedgerTransactionIDHash: id },
        { responseType: "blob" },
      )
      .then((res) => {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch((err) => {
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occured",
        );
      });
  };

  const handleSubmit = () => {
    const { disable, message } = validate(payload?.PaymentMode);
    if (disable) {
      toast.error(message);
    } else {
      setLoad(true);
      axiosInstance
        .post("Settlement/SettlementData", {
          ...payload,
          DebitTransactionNo: payload?.TransactionNo,
          PaytmTransactionNo: payload?.TransactionNo,
          CreditTransactionNo: payload?.TransactionNo,
        })
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setPayload({
              PayBy: "0",
              PaymentMode: "Paytm",
              Amount: "",
              DueAmount: "",
              S_Currency: "INR",
              S_Notation: "INR",
              C_Factor: 1,
              PaymentModeID: "123",
              S_CountryID: 1,
              S_Amount: "10",
              LedgerTransactionID: "",
              UpdateRemarks: "",
              BankName: "",
              NewAmount: "",
              CardNo: "",
              CardDate: "",
              TransactionNo: "",
            });
            setLoad(false);
            if (tableData[0]?.HideReceipt != 1)
              getReceipt(tableData[0]?.LedgertransactionIDHash);

            setLabNo("");
            setTableData([]);
          } else {
            setLoad(false);
            toast.error(res?.data?.message);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
          setLoad(false);
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: name === "Amount" ? (checkDueAmount(value) ? value : "") : value,
    });

    if (name === "Amount" && !checkDueAmount(value)) {
      toast.error("Please Enter Correct Amount");
    }
  };

  const checkDueAmount = (value) => {
    let check = true;
    return (check = value > tableData[0]?.DueAmount ? false : true);
  };

  const ComaSeparter = () => {
    let val = "";
    for (let i = 0; i < tableData.length; i++) {
      val =
        val === ""
          ? tableData[i].ItemName
          : `${val + " , " + tableData[i].ItemName}`;
    }
    return val;
  };

  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  useEffect(() => {
    getPaymentModes("PaymentMode", setPaymentMode);
    getPaymentModes("BankName", setBankName);
  }, []);

  const { t } = useTranslation();

  return (
    <>
      <Accordion
        name={t("Settlement Details")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row  px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Lab No."
              id="LabNo"
              placeholder=" "
              value={LabNo}
              onChange={(e) => {
                setLabNo(e?.target?.value);
              }}
            />
          </div>{" "}
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={fetch}
              disabled={LabNo.length == 0}
            />
          </div>
        </div>
      </Accordion>
      {tableData.length > 0 && (
        <Accordion title={t("Search Detail")} defaultValue={true}>
          <Tables>
            <thead>
              <tr>
                {[
                  t("S.no"),
                  t("Reg Date"),
                  t("Visit No"),
                  t("Patient Name"),
                  t("Centre"),
                  t("Rate Type"),
                  t("Gross Amount"),
                  t("Discount Amount"),
                  t("Net Amount"),
                  t("Paid Amount"),
                  t("Due Amount"),
                ].map((ele, index) => (
                  <th key={index}>{ele}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData?.map((ele, index) => (
                <tr key={index}>
                  <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                  <td data-title={t("RegDate")}>
                    {dateConfig(ele?.RegDate)}&nbsp;
                  </td>
                  <td data-title={t("Visit No")}>
                    {ele?.LedgerTransactionNo}&nbsp;
                  </td>
                  <td data-title={t("PName")}>{ele?.PName}&nbsp;</td>
                  <td data-title={t("Centre")}>{ele?.Centre}&nbsp;</td>
                  <td data-title={t("RateType")}>{ele?.RateType}&nbsp;</td>
                  <td data-title={t("Rate")}>
                    {Number(ele?.Rate).toFixed(2)}&nbsp;
                  </td>
                  <td data-title={t("DiscAmt")}>
                    {Number(ele?.DiscAmt).toFixed(2)}&nbsp;
                  </td>
                  <td data-title={t("Amount")}>
                    {Number(ele?.Amount).toFixed(2)}&nbsp;
                  </td>
                  <td data-title={t("PaidAmount")}>{ele?.PaidAmount}&nbsp;</td>
                  <td data-title={t("DueAmount")}>{ele?.DueAmount}&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </Tables>
          <div className="row mt-4 px-2">
            <p className="col-sm-12">
              <strong>{t("Test Name")}</strong> : &nbsp;
              <span style={{ fontSize: "14px", color: "grey" }}>
                {ComaSeparter()}
              </span>
            </p>
          </div>
          <div className="row px-2">
            <div className="col-sm-1">
              <div>
                <SelectBox
                  name="PayBy"
                  options={PayBy}
                  selectedValue={payload?.PayBy}
                  onChange={handleSelectChange}
                />
              </div>
            </div>
            <div className="col-sm-1">
              <div>
                <Input
                  placeholder={"Amount"}
                  name="Amount"
                  type="number"
                  onInput={(e) => number(e, 10)}
                  value={payload?.Amount}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-sm-1">
              <div>
                <SelectBox
                  options={paymentMode.filter((ele) => ele.label !== "Credit")}
                  name="PaymentModeID"
                  selectedValue={payload?.PaymentModeID}
                  onChange={handleSelectChange}
                />
              </div>
            </div>
            {["Cheque", "Credit Card", "Debit Card"].includes(
              payload?.PaymentMode,
            ) && (
              <div className="col-sm-2">
                <div>
                  <SelectBox
                    options={[{ label: t("Select"), value: "" }, ...BankName]}
                    name="BankName"
                    selectedValue={payload?.BankName}
                    onChange={handleChange}
                  ></SelectBox>
                </div>
              </div>
            )}
            {["Cheque"].includes(payload?.PaymentMode) && (
              <div className="col-sm-2">
                <div>
                  <Input
                    placeholder={t("CardNo")}
                    name="CardNo"
                    type="number"
                    onInput={(e) => number(e, 16)}
                    value={payload?.CardNo}
                    onChange={handleChange}
                    max={16}
                  />
                </div>
              </div>
            )}

            {["Cheque"].includes(payload?.PaymentMode) && (
              <div className="col-sm-2">
                <div>
                  <DatePicker
                    name="FromDate"
                    value={payload?.FromDate}
                    onChange={dateSelect}
                    maxDate={new Date()}
                  />
                </div>
              </div>
            )}

            {["Credit Card", "Debit Card"].includes(payload?.PaymentMode) && (
              <div className="col-sm-2">
                <div>
                  <Input
                    name="CardNo"
                    placeholder={t("CardNo")}
                    type="text"
                    value={payload?.CardNo}
                    max={16}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {["Online Payment", "ESEWA", "Paytm", "ESewa", "eSewa", "Card", "UPI"].includes(payload?.PaymentMode) && (
              <div className="col-sm-2">
                <div>
                  <Input
                    name="TransactionNo"
                    placeholder={t("TransactionNo")}
                    type="text"
                    value={payload?.TransactionNo}
                    onChange={handleChange}
                    maxLength={16}
                  />
                </div>
              </div>
            )}
            <div className="col-sm-2">
              <div>
                <Input
                  placeholder={t("UpdateRemark")}
                  name="UpdateRemarks"
                  type="text"
                  value={payload?.UpdateRemarks}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-sm-1">
              {Load ? (
                <Loading />
              ) : (
                <SaveButton
                    text={'Save'}
                    onClick={handleSubmit}
                  disabled={payload?.Amount == 0 ? true : false}
                />
              )}
            </div>
          </div>
        </Accordion>
      )}
    </>
  );
}
export default SettlementPatient;
