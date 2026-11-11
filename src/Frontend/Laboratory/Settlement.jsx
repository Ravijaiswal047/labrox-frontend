import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  getPaymentModes,
  getBindDiscApproval,
  getBindDiscReason,
} from "../../utils/NetworkApi/commonApi";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import { PayBy } from "../../utils/Constants";
import DatePicker from "../../components/formComponent/DatePicker";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { dateConfig, number } from "../../utils/helpers";

import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import MpesaModal from "../../components/MpesaModal/MpesaModal";

function SettlementPatient({ visitNo, onSuccess }) {

  const { DefaultCurrencyName } = useLocalStorage("userData", "get");
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState([]);
  const [BindDiscApproval, setBindDiscApproval] = useState([]);
  const [BindDiscReason, setBindDiscReason] = useState([]);
  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
  const accessRight = useLocalStorage("accessRight", "get")?.split(",");
  const [BankName, setBankName] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [Load, setLoad] = useState(false);
  const [LabNo, setLabNo] = useState("");

  const [payload, setPayload] = useState({
    PayBy: "0",
    PaymentMode: "Cash",
    Amount: "",
    DueAmount: "",
    S_Currency: "INR",
    S_Notation: "INR",
    C_Factor: 1,
    PaymentModeID: "134",
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
    isRefund: 0,
    DiscountApprovedBy: "",
    DiscountReason: "",
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
        TransactionNo: "",
        isMpesaAuto: false,
        DiscountApprovedBy: "",
        DiscountReason: "",
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };
  const fetch = (labNo = "") => {
    const requested = (typeof labNo === "string" ? labNo : "").trim() || LabNo?.trim() || "";
    if (
      visitNo &&
      requested &&
      requested.toUpperCase() !== String(visitNo).trim().toUpperCase()
    ) {
      toast.error(
        "This settlement is only for the selected visit. Another patient's Lab No cannot be loaded.",
      );
      setLabNo(visitNo);
      return;
    }
    axiosInstance
      .post("Settlement/GetDataToSettlement", {
        LedgerTransactionNo: requested,
      })
      .then((res) => {
        const rows = Array.isArray(res?.data?.message) ? res.data.message : [];
        setHasSearched(true);
        if (res?.data?.success && rows.length > 0) {
          setTableData(rows);
          return;
        }
        setTableData([]);
        const msg =
          typeof res?.data?.message === "string" && res.data.message.trim()
            ? res.data.message
            : "No record found";
        toast.error(msg);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  console.log("tableData", tableData);
  const isCopaymentApplicable =Number(tableData[0]?.isCopaymentApplicalble) === 1;
  useEffect(() => {
    setPayload({
      ...payload,
      LedgerTransactionIDHash: tableData[0]?.LedgertransactionIDHash,
      LedgerTransactionID: tableData[0]?.LedgerTransactionID,

      Amount: isCopaymentApplicable && tableData[0]?.PayByPatientDue !== undefined && tableData[0]?.PayByPatientDue !== null
        ? Math.abs(tableData[0]?.PayByPatientDue)
        : tableData[0]?.DueAmount !== undefined && tableData[0]?.DueAmount !== null ? Math.abs(tableData[0]?.DueAmount) : "",
      isRefund:
        tableData[0]?.DueAmount < 0 ? 1 : 0,
      // isRefund:
      //   tableData[0]?.DueAmount < 0 || accessRight?.includes("12") ? 1 : 0,
    });
  }, [tableData]);
  console.log("payload", payload);

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
        message = `Please Enter Valid ${condition} Number Of Length 16`;
      }
    } else if (/^write\s*off$/i.test(String(condition || "").trim())) {
      const approver = String(payload?.DiscountApprovedBy || "").trim();
      const reason = String(payload?.DiscountReason || "").trim();
      if (!approver || approver === "0" || !reason) {
        disable = true;
        message = "Please Choose Discount Approval and Reason";
      }
    }

    return {
      disable: disable,
      message: message,
    };
  };

  const getReceipt = (id) => {
    axiosReport
      .post(
        "getReceipt",
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
      return;
    }
    const amountNum = Number(payload?.Amount);
    if (!amountNum) {
      toast.error("Settlement amount cannot be zero.");
      return;
    }
    const isRefund = payload.isRefund === 1 || amountNum < 0 ? 1 : 0;
    if (
      DefaultCurrencyName === "KES" &&
      (payload?.PaymentModeID) == 1008 &&
      (!payload?.CardNo || payload?.CardNo.trim() === "")
    ) {
      toast.error("Please provide the M-pesa reference number");
      return;
    } else {
      setLoad(true);
      axiosInstance
        .post("Settlement/SettlementData", {
          ...payload,
          Amount: Math.abs(amountNum),
          isRefund,
          ...(isCopaymentApplicable ? { PayByPatientDue: Math.abs(amountNum) } : {}),
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
              isRefund: 0,
              DiscountApprovedBy: "",
              DiscountReason: "",
            });
            setLoad(false);
            if (tableData[0]?.HideReceipt != 1)
              getReceipt(tableData[0]?.LedgertransactionIDHash);

            setLabNo("");
            setTableData([]);
            if (onSuccess) onSuccess();
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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   setPayload({
  //     ...payload,
  //     [name]: name === "Amount" ? (checkDueAmount(value) ? value : "") : value,
  //   });

  //   if (name === "Amount" && !checkDueAmount(value)) {
  //     toast.error("Please Enter Correct Amount");
  //   }
  // };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "Amount") {
      const raw = String(value ?? "");
      const isNegative = raw.trim().startsWith("-") || Number(raw) < 0;

      if (raw === "-" || raw === "-.") {
        setPayload((prev) => ({
          ...prev,
          Amount: raw,
          isRefund: 1,
        }));
        return;
      }

      if (isNegative && Number(raw) < 0) {
        const absValue = Math.abs(Number(raw)).toString();
        if (Number(absValue) > Number(tableData[0]?.PaidAmount || 0)) {
          toast.error("Amount cannot be more than Paid Amount");
          return;
        }
        toast.warn(
          "Negative amount is treated as a refund. IsRefund has been turned on.",
        );
        setPayload((prev) => ({
          ...prev,
          Amount: raw,
          isRefund: 1,
        }));
        return;
      }

      if (!checkAmount(value)) {
        toast.error(
          payload.isRefund === 1
            ? "Amount cannot be more than Paid Amount"
            : isCopaymentApplicable
              ? "Amount cannot be more than Pay by Patient Due"
              : "Amount cannot be more than Due Amount"
        );
        return;
      }
    }

    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkAmount = (value) => {

    const numValue = Number(value);

    if (payload.isRefund === 1) {
      // Refund case → PaidAmount
      return numValue <= tableData[0]?.PaidAmount;
    } else if (isCopaymentApplicable) {
      return numValue <= Math.abs(Number(tableData[0]?.PayByPatientDue || 0));
    } else {
      // Normal case → DueAmount
      return numValue <= tableData[0]?.DueAmount;
    }
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;

    setPayload((prev) => ({
      ...prev,
      isRefund: checked ? 1 : 0,
      Amount: "",
    }));
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
    getBindDiscApproval(setBindDiscApproval);
    getBindDiscReason(setBindDiscReason);
  }, []);

  const { t } = useTranslation();
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      e.preventDefault();
      fetch((e.target?.value || LabNo || "").trim());
    }
  };

  useEffect(() => {
    const targetLabNo = visitNo || location?.state?.VisitNo || location?.state?.data || reprintLabNo;
    if (targetLabNo) {
      setLabNo(targetLabNo);
      fetch(targetLabNo);
    }
  }, [reprintLabNo, visitNo, location?.state?.VisitNo, location?.state?.data]);


  const handleMakePayment = () => { }

  const [showMpesa, setShowMpesa] = useState(false)

  return (
    <>
      {showMpesa && (
        <MpesaModal
          show={showMpesa}
          onHide={() => setShowMpesa(false)}
          amount={payload?.Amount}
          // amount={tableData[0]?.DueAmount}
          Id={tableData[0]?.LedgertransactionIDHash}
          centerId={tableData[0]?.centreid}
          centername={tableData[0]?.Centre}
          mobile={tableData[0]?.Mobile}
          onPaymentSuccess={(checkoutId) => {
            setPayload((prev) => ({
              ...prev,
              CardNo: checkoutId,
              isMpesaAuto: true  //  set here
            }));
            setShowMpesa(false); // optional close
          }}
        />
      )}

      <Accordion
        name={t("Amount Settlement")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {location?.state?.data?.backHistory === "/Settlement" && (
          <span
            onClick={() => navigate(-1)}
            style={{ fontWeight: 600, gap: "2px", height: "fit-content" }}
            className="d-flex align-items-center fw-bold px-2 pointer-cursor"
          >
            <i
              style={{ fontWeight: 600, gap: "2px", height: "fit-content" }}
              className="bi bi-arrow-left mb-0"
            ></i>
            Back
          </span>
        )}
        <div className="row  px-2 mt-2">
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Lab No."
              id="Lab No"
              placeholder=" "
              value={LabNo}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setLabNo(e?.target?.value);
              }}
            />
          </div>{" "}
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => fetch("")}
              disabled={LabNo.length == 0}
            />
          </div>
        </div>
        {hasSearched && tableData.length === 0 && (
          <div className="px-2 pb-2 text-danger" style={{ fontWeight: 600 }}>
            {t("No record found")}
          </div>
        )}
      </Accordion>


      {tableData.length > 0 && (
        <>
          {" "}
          <Accordion
            title={`Settlement Details`}
            defaultValue={true}
            seconTitle={
              <div className="col-sm-12 d-flex justify-content-end gap-custom p-0 link-title-container">
                <span
                  style={{
                    color: "#051c68",
                    fontWeight: "600",
                    marginRight: "20px"
                  }}
                >
                  {t("Test Name")} : {ComaSeparter()}
                </span>
                <span className="text-danger" style={{ fontWeight: "700" }}>Due Amount: {tableData[0]?.DueAmount !== undefined && tableData[0]?.DueAmount !== null ? tableData[0]?.DueAmount : ""}</span>
              </div>
            }
          >
            <div className="row p-2">
              <div className="col-12">
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
                        ...(isCopaymentApplicable
                          ? [
                            t("Pay by Panel"),
                            t("Pay by Patient"),
                            t("Pay by Patient Due"),
                          ]
                          : [t("#")]),
                      ].map((ele, index) => (
                        <th key={index}>{ele}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((ele, index) => {
                      const rowColor =
                        ele?.isCopaymentApplicalble == 1 && ele?.PayByPatientDue == 0
                          ? "#8ff58fff"
                          : ele?.DueAmount == 0
                            ? "#8ff58fff"
                            : "#FFB6C1";

                      return (
                        <tr key={index} style={{ backgroundColor: rowColor }}>
                          <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                          <td data-title={t("RegDate")} style={{ fontWeight: "800" }}>
                            {dateConfig(ele?.RegDate)}&nbsp;
                          </td>
                          <td data-title={t("Visit No")} style={{ fontWeight: "800" }}>
                            {ele?.LedgerTransactionNo}&nbsp;
                          </td>
                          <td data-title={t("PName")} style={{ fontWeight: "800" }}>{ele?.PName}&nbsp;</td>
                          <td data-title={t("Centre")}>{ele?.Centre}&nbsp;</td>
                          <td data-title={t("RateType")}>
                            {ele?.RateType}&nbsp;
                          </td>
                          <td data-title={t("Rate")} className="amount">
                            {Number(ele?.Rate).toFixed(2)}&nbsp;
                          </td>
                          <td data-title={t("DiscAmt")} className="amount">
                            {Number(ele?.DiscAmt).toFixed(2)}&nbsp;
                          </td>
                          <td data-title={t("Amount")} className="amount">
                            {Number(ele?.Amount).toFixed(2)}&nbsp;
                          </td>
                          <td data-title={t("PaidAmount")} className="amount">
                            {ele?.PaidAmount}&nbsp;
                          </td>
                          <td data-title={t("DueAmount")} className="amount">
                            {ele?.DueAmount !== undefined && ele?.DueAmount !== null ? ele?.DueAmount : ""}&nbsp;
                          </td>
                          {isCopaymentApplicable && (
                            <>
                              <td data-title={t("Pay by Panel")} className="amount">
                                {Number(ele?.PayByPanel || 0).toFixed(2)}&nbsp;
                              </td>

                              <td data-title={t("Pay by Patient")} className="amount">
                                {Number(ele?.PayByPatient || 0).toFixed(2)}&nbsp;
                              </td>

                              <td data-title={t("Pay by Patient Due")} className="amount">
                                {ele?.PayByPatientDue !== undefined && ele?.PayByPatientDue !== null
                                  ? Math.abs(Number(ele?.PayByPatientDue)).toFixed(2)
                                  : ""}
                                &nbsp;
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </Tables>
              </div>{" "}
            </div>
            {/* <div className="row px-2 mt-2">
              <p className="col-sm-12">
                <strong>{t("Test Name")}</strong> : &nbsp;
                <span style={{ fontSize: "14px", color: "grey" }}>
                  {ComaSeparter()}
                </span>
              </p>
            </div> */}
            <div className="row px-2 mt-2">
              {/* <div className="col-sm-1 d-flex align-items-center ">
                {tableData?.map((ele, index) => (
                  <div key={index} className="row px-2">
                    <input
                      type="checkbox"
                      // className={`${
                      //   payload.isRefund === 1 ? "cursor-not-allowed" : ""
                      // }`}
                      name="Refund"
                      checked={payload.isRefund === 1}
                      onChange={handleCheckboxChange}
                      disabled={!(ele?.PaidAmount > 0)}
                    />
                  </div>
                ))}
                <label htmlFor="isRefund" className="ml-2 mt-2">
                  {t("IsRefund")}
                </label>
              </div> */}
              <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                gap: "5px"
              }}>
                {tableData?.map((ele, index) => (
                  <label class="switch mb-0">
                    <input
                      type="checkbox"
                      checked={payload.isRefund === 1}
                      onChange={handleCheckboxChange}
                    />
                    <span class="slider"></span>
                  </label>
                ))}
                <strong>
                  <span>{t("IsRefund")}</span>
                </strong>
              </div>
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
                    onInput={(e) => {
                      if (/^-/.test(e.target.value)) return;
                      number(e, 10);
                    }}
                    value={payload?.Amount}
                    onChange={handleChange}
                    disabled={payload.isRefund === 1 && tableData[0]?.PaidAmount <= 0}
                  />
                </div>
              </div>
              <div className="col-sm-1">
                <div>
                  <SelectBox
                    options={paymentMode.filter(
                      (ele) => ele.label !== "Credit",
                    )}
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
                        options={[{ label: "Select", value: "" }, ...BankName]}
                        name="BankName"
                        selectedValue={payload?.BankName}
                        onChange={handleChange}
                      ></SelectBox>
                    </div>
                  </div>
                )}
              {["Cheque", "M-Pesa"].includes(payload?.PaymentMode) && (
                <div className="col-sm-2">
                  <div>
                    <Input
                      placeholder={t("ReferenceNo")}
                      name="CardNo"
                      type="text"
                      //onInput={(e) => number(e, 16)}
                      value={payload?.CardNo}
                      onChange={handleChange}
                      readOnly={
                        payload?.PaymentMode === "M-Pesa" &&
                        // payload?.CardNo?.trim()
                        payload?.isMpesaAuto
                      }
                      maxLength={16}
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
                      placeholder={t("CardNo")}
                      name="CardNo"
                      type="text"
                      value={payload?.CardNo}
                      maxLength={16}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {["Online Payment", "Paytm", "ESEWA", "ESewa", "eSewa", "Card", "UPI"].includes(payload?.PaymentMode) && (
                <div className="col-sm-2">
                  <div>
                    <Input
                      name="TransactionNo"
                      placeholder={t("TransactionNo")}
                      type="text"
                      value={payload?.TransactionNo}
                      onChange={handleChange}
                      max={16}
                    />
                  </div>
                </div>
              )}
              {/^write\s*off$/i.test(String(payload?.PaymentMode || "").trim()) && (
                <>
                  <div className="col-sm-2">
                    <SelectBox
                      options={BindDiscApproval}
                      onChange={handleSelectChange}
                      name="DiscountApprovedBy"
                      id="DiscountApprovedBy"
                      lable={t("Discount By")}
                      selectedValue={payload?.DiscountApprovedBy}
                    />
                  </div>
                  <div className="col-sm-2">
                    <SelectBox
                      options={BindDiscReason}
                      lable={t("Discount Reason")}
                      id="DiscountReason"
                      onChange={handleSelectChange}
                      selectedValue={payload?.DiscountReason}
                      name="DiscountReason"
                    />
                  </div>
                </>
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
              <div className="col-sm-12 d-flex align-items-center justify-content-center my-2">
                {/* {(isMpesaSelected || isHavingMpesa) && ( */}
                {payload?.PaymentModeID == "1008" &&
                  !payload?.CardNo?.trim() && (
                    <SaveButton
                      text={"Make Payment"}
                      className="text-white btn-success mr-2"
                      type="submit"
                      onClick={() => setShowMpesa(true)}
                    />
                  )}


                {/* )} */}
                {Load ? (
                  <Loading />
                ) : tableData[0]?.InvoiceNo == "" ? (
                  <SaveButton
                    text={"Save"}
                    onClick={handleSubmit}
                    className="text-white btn-success mr-2"
                    // disabled={payload?.Amount == 0 ? true : false}
                    disabled={
                      !(accessRight?.includes("14"))
                    }
                  />
                ) : (
                  <span className="text-danger col-sm-8">
                    Settlement Not Possible : Invoice Already Generated
                  </span>
                )}
              </div>
            </div>{" "}
          </Accordion>
        </>
      )}
    </>
  );
}
export default SettlementPatient;
