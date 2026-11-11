import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import DatePicker from "../../components/formComponent/DatePicker";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { number } from "../../utils/helpers";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const ChangePaymentMode = () => {
  const [mainReceipt, setMainReceipt] = useState("2");
  const [paymentMode, setPaymentMode] = useState([]);
  const [load, setLoad] = useState(false);
  const [BankName, setBankName] = useState([]);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const [tableData, setTableData] = useState({});
  const location = useLocation();
  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
  const [payload, setPayload] = useState({
    LabNo: "",
  });

  const { t } = useTranslation();
  // const UserData = useLocalStorage("userData", "get");
  // console.log("UserData",UserData);
  const fetch = (Labno=payload?.LabNo) => {
    console.log("Search",Labno);
    setLoad(true);
    axiosInstance
      .post("ChangePaymentMode/GetPaymentModeData", 
        {
          labNo : Labno || ""
        }
      )
      .then((res) => {
        if (res?.data?.success) {
          const { getData, getReceiptData } = res.data.message;
          const data = getReceiptData?.map((ele) => {
            return {
              ...ele,
              PatientID: getData[0]?.PatientId,
              CentreID: getData[0]?.CentreID,
              LedgerTransactionID: getData[0]?.LedgerTransactionId,
              VisitNo: getData[0]?.LedgerTransactionNo,
              NewPaymentMode: "",
              NewPaymentModeID: "",
              Bank: "",
              CardNo: "",
              CardDate: "",
              TypeToPerform: "",
              Naration: "",
              isChecked: false,
            };
          });

          setTableData({
            patientData: getData[0],
            tableData: data,
          });
        } else {
          toast.error(res?.data?.message);
        }

        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const dateSelect = (value, name) => {
    setTableData({
      ...tableData,
      [name]: value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleChangeMap = (e, i) => {
    const data = [...tableData?.tableData];
    const { name, value } = e.target;
    console.log(e.target);

    if (name === "NewAmount") {
      if (value > data[i]["DueAmount"]) {
        toast.error("please Enter Value Amount");
      } else {
        data[i][name] = value;
        setTableData({ ...tableData, tableData: data });
      }
    } else {
      if (name === "NewPaymentModeID") {
        const findOne = paymentMode.find((ele) => ele.value == value);
        data[i]["NewPaymentMode"] = findOne?.label;
        data[i]["BankName"] = "";
        data[i]["CardNo"] = "";
        data[i]["Naration"] = "";
        data[i]["TransactionNo"] = "";
        data[i]["CardDate"] = "";
      }

      data[i][name] = value;
      setTableData({ ...tableData, tableData: data });
    }
  };

  const handleChangeIndex = (e, index) => {
    const { name, value, type, checked } = e.target;
    const data = [...tableData?.tableData];
    if (mainReceipt === "2") {
      if (type === "checkbox") {
        if (checked) {
          const { disable, message } = validate(
            data[index]["Naration"],
            data[index]["NewPaymentMode"],
            index,
          );
          if (!disable) {
            data[index][name] = checked;
          } else {
            toast.error(message);
          }
        } else {
          data[index][name] = checked;
        }
      } else {
        data[index][name] = value;
      }
      setTableData({ ...tableData, tableData: data });
    }

    if (mainReceipt === "1") {
      if (type === "checkbox") {
        if (checked) {
          if (data[index]["Naration"] !== "") {
            data[index][name] = checked;
          } else {
            toast.error("Please Enter Naration");
          }
        } else {
          data[index][name] = checked;
        }
      } else {
        data[index][name] = value;
      }
      setTableData({ ...tableData, tableData: data });
    }
  };

  const validate = (condition1, condition, index) => {
    let disable = false;
    let message = "";

    if (condition === "") {
      disable = true;
      message = "Please Choose Payment Mode";
    } 
    // else if (["Paytm", "Online Payment"].includes(condition)) {
    //   if (tableData?.tableData[index]["TransactionNo"].length < 10) {
    //     disable = true;
    //     message = "Please Fill Correct Transaction Number";
    //   }
    // } 
    else if (["Debit Card", "Credit Card", "Cheque"].includes(condition)) {
      if (tableData?.tableData[index]["BankName"] === "") {
        disable = true;
        message = "Please Choose BankName";
      } else if (tableData?.tableData[index]["CardNo"].length < 15) {
        disable = true;
        message = `Please Enter Valid ${condition} Number`;
      }
    }
    if (condition1 === "") {
      disable = true;
      message = "Please Enter Naration";
    }

    return {
      disable: disable,
      message: message,
    };
  };

  const submit = () => {
    setLoadingSecond(true);
    const data = tableData?.tableData.filter((ele) => ele?.isChecked === true);
    console.log(data);
    const val = data?.map((ele) => {
      return {
        ...ele,
        TypeToPerform: mainReceipt,
        CardDate:
          ele?.CardDate == ""
            ? "0001-01-01 00:00:00"
            : moment(ele?.CardDate).format("DD-MMM-YYYY"),
      };
    });
    axiosInstance
      .post("ChangePaymentMode/SavePaymentModeData", {
        SavePaymentModeData: val,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        fetch(payload?.LabNo);
        setLoadingSecond(false);
      })
      .catch((err) => {
        toast.error(
          err?.data?.message ? err?.data?.message : "Something Went Wrong",
        );
        setLoadingSecond(false);
      });
  };

  const HideSave = () => {
    let show = false;
    for (let i = 0; i < tableData?.tableData?.length; i++) {
      if (tableData?.tableData[i]["isChecked"] === true) {
        show = true;
        break;
      }
    }
    return show;
  };

  useEffect(() => {
    getPaymentModes("PaymentMode", setPaymentMode);
    getPaymentModes("BankName", setBankName);
  }, []);

  useEffect(() => {
      if (reprintLabNo && location.pathname !== '/ChangePaymentMode') {
        setPayload((prev) => ({
          ...prev,             
          LabNo: reprintLabNo              
        }));
        fetch(reprintLabNo);
      }
    }, []);

  return (
    <>
      <Accordion
        name={t("Change Payment Mode")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-4">
            <div className="row">
              <div className="col-sm-9">
                <Input
                  name="LabNo"
                  placeholder=" "
                  lable="Visit No"
                  id="Visit No"
                  value={payload?.LabNo}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div className="col-sm-3">
                {load ? (
                  <Loading />
                ) : (
                  
                  <SearchButton
                      text={"Search"}
                      onClick={() => fetch(payload?.LabNo)}
                  />
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6">
                <input
                  type="radio"
                  name="mainReceipt"
                  checked={mainReceipt == 1}
                  onChange={(e) => {
                    setMainReceipt("1");
                    fetch(payload?.LabNo);
                  }}
                  disabled
                ></input>
                <label className="control-label ml-2" htmlFor="center">
                  {t("Main Booking")}
                </label>
              </div>

              <div className="col-sm-6">
                <input
                  type="radio"
                  name="mainReceipt"
                  checked={mainReceipt == 2}
                  onChange={(e) => {
                    setMainReceipt("2");
                    fetch(payload?.LabNo);
                  }}
                ></input>
                <label className="control-label ml-2" htmlFor="center">
                  {t("Receipt")}
                </label>
              </div>
            </div>
          </div>
          <div className="col-sm-8">
            <div className="row">
              <div className="col-sm-4">
                <label className="control-label" htmlFor="center">
                  {t("Patient ID")} :
                  <span
                    style={{ fontWeight: "600", marginLeft: "15px" }}
                    className="mx-3"
                  >
                    {tableData?.patientData?.PatientId}
                  </span>
                </label>
              </div>

              <div className="col-sm-4">
                <label className="control-label" htmlFor="center">
                  {t("Patient Name")}:
                  <span
                    style={{ fontWeight: "600", marginLeft: "15px" }}
                    className="mx-3"
                  >
                    {tableData?.patientData?.PName}
                  </span>
                </label>
              </div>

              <div className="col-sm-4">
                <label className="control-label" htmlFor="center">
                  {t("Age/Gender")}:
                  <span
                    id="lbl"
                    style={{ fontWeight: "600", marginLeft: "15px" }}
                    className="mx-3"
                  >
                    {tableData?.patientData?.Age}
                    {tableData?.patientData?.Gender ? " / " : ""}
                    {tableData?.patientData?.Gender}
                  </span>
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4">
                <label className="control-label" htmlFor="center">
                  {t("Amount Paid")}:
                </label>
                <span
                  style={{ fontWeight: "600", marginLeft: "15px" }}
                  className="mx-3"
                >
                  {tableData?.patientData?.Adjustment}
                </span>
              </div>

              <div className="col-sm-4">
                <label className="control-label" htmlFor="center">
                  {t("Doctor")}:
                  <span
                    style={{ fontWeight: "600", marginLeft: "15px" }}
                    className="mx-3"
                  >
                    {tableData?.patientData?.DoctorName}
                  </span>
                </label>
              </div>

              <div className="col-sm-4">
                <label className="control-label" htmlFor="center">
                  {t("Net Amount")}:
                  <span
                    style={{ fontWeight: "600", marginLeft: "15px" }}
                    className="mx-3"
                  >
                    {tableData?.patientData?.NetAmount}
                  </span>
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4">
                <label className="control-label" htmlFor="center">
                  {t("Visit No")}:
                  <span
                    style={{ fontWeight: "600", marginLeft: "15px" }}
                    className="mx-3"
                  >
                    {tableData?.patientData?.LedgerTransactionNo}
                  </span>
                </label>
              </div>
              <div className="col-sm-4">
                <label className="control-label" htmlFor="center">
                  {t("Due Amount")}:
                  <span
                    style={{ fontWeight: "600", marginLeft: "15px" }}
                    className="mx-3"
                  >
                    {tableData?.patientData?.DueAmount}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {tableData?.tableData?.length > 0 ? (
          <>
            <Tables>
              <thead className="cf">
                <tr>
                  {[
                    t("S.No"),
                    t("Receipt No."),
                    t("Amount"),
                    t("Payment Mode"),
                    t("Select"),
                  ].map((ele, index) => (
                    <th key={index}>{ele}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData?.tableData?.map((ele, index) => (
                  <>
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td data-title={t("Receipt No.")}>
                        {ele?.ReceiptNo}&nbsp;
                      </td>
                      <td data-title={t("Amount")}>{ele?.Amount}&nbsp;</td>
                      <td data-title={t("Payment Mode")}>
                        {ele?.PaymentMode}&nbsp;
                      </td>
                      <td data-title={t("Select")}>
                        <input
                          type="checkbox"
                          name="isChecked"
                          checked={ele?.isChecked}
                          onChange={(e) => handleChangeIndex(e, index)}
                        ></input>
                      </td>
                    </tr>
                    {mainReceipt === "2" ? (
                      <tr>
                        <td colSpan={12} data-title="NewPaymentModeID">
                          <div className="row mt-2 px-2">
                            <div className="col-sm-2">
                              <div>
                                <SelectBox
                                  name="NewPaymentModeID"
                                  placeholder={t("")}
                                  lable={"Payment Mode"}
                                  value={ele?.NewPaymentModeID}
                                  disabled={ele?.isChecked}
                                  onChange={(e) => {
                                    handleChangeMap(e, index);
                                  }}
                                  options={[
                                    { label: t("PaymentMode"), value: "" },
                                    ...paymentMode,
                                  ]}
                                ></SelectBox>
                              </div>
                            </div>

                            {["Cheque", "Credit Card", "Debit Card"].includes(
                              ele?.NewPaymentMode,
                            ) && (
                              <div className="col-sm-2">
                                <div>
                                  <SelectBox
                                    options={[
                                      { label: t("Bank Name"), value: "" },
                                      ...BankName,
                                    ]}
                                    name="BankName"
                                    value={ele?.BankName}
                                    
                                    placeholder={t("")}
                                    lable={"BankName"}
                                    disabled={ele?.isChecked}
                                    onChange={(e) => {
                                      handleChangeMap(e, index);
                                    }}
                                  ></SelectBox>
                                </div>
                              </div>
                            )}

                            {["Cheque"].includes(ele?.NewPaymentMode) && (
                              <div className="col-sm-2">
                                <div>
                                  <Input
                                    name="CardNo"
                                    type="text"
                                    disabled={ele?.isChecked}
                                    placeholder={t("")}
                                    lable={"Cheque No"}
                                    value={ele?.CardNo}
                                    onChange={(e) => {
                                      handleChangeMap(e, index);
                                    }}
                                    max={16}
                                  />
                                </div>
                              </div>
                            )}

                            {["Credit Card", "Debit Card"].includes(
                              ele?.NewPaymentMode,
                            ) && (
                              <div className="col-sm-2">
                                <div>
                                  <Input
                                    name="CardNo"
                                    disabled={ele?.isChecked}
                                    placeholder={t("")}
                                    lable={"Card No"}
                                    type="number"
                                    value={ele?.CardNo}
                                    onInput={(e) => number(e, 16)}
                                    onChange={(e) => {
                                      handleChangeMap(e, index);
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {["Online Payment", "Paytm"].includes(
                              ele?.NewPaymentMode,
                            ) && (
                              <div className="col-sm-2">
                                <div>
                                  <Input
                                    name="TransactionNo"
                                    disabled={ele?.isChecked}
                                    type="text"
                                    placeholder={t("")}
                                    lable="Transaction No"
                                    value={ele?.TransactionNo}
                                    onChange={(e) => {
                                      handleChangeMap(e, index);
                                    }}
                                    max={16}
                                  />
                                </div>
                              </div>
                            )}

                            {["Credit Card", "Debit Card", "Cheque"].includes(
                              ele?.NewPaymentMode,
                            ) && (
                              <div className="col-sm-2">
                                <div>
                                  <DatePicker
                                    className="custom-calendar"
                                    name="DATE"
                                    type="date"
                                    lable={t("Date")}
                                    value={tableData?.DATE}
                                    onChange={dateSelect}
                                    maxDate={new Date()}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="col-sm-2">
                              <div>
                                <Input
                                  name="Naration"
                                  // placeholder={t("Naration")}
                                  placeholder={t("")}
                                  lable="Naration"
                                  disabled={ele?.isChecked}
                                  type="text"
                                  value={ele?.Naration}
                                  onChange={(e) => {
                                    handleChangeMap(e, index);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={12} data-title={t("Mode")}>
                          <div className="mt-3">
                            <div className="col-sm-2">
                              <label>{t("Mode")}: </label>
                              <p>
                                <span className="text-danger font-weight-bold">
                                  {ele?.PaymentMode.toLowerCase() === "cash"
                                    ? t("Cash To Credit")
                                    : t("Credit To Cash")}
                                </span>
                              </p>
                            </div>

                            <div className="col-sm-2">
                              <label>{t("Naration")}:</label>
                              <Input
                                name="Naration"
                                placeholder={t("Naration")}
                                disabled={ele?.isChecked}
                                type="text"
                                value={ele?.Naration}
                                onChange={(e) => {
                                  handleChangeMap(e, index);
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </Tables>

            {HideSave() &&
              (loadingSecond ? (
                <Loading />
              ) : (
                <div className="row mt-2 mb-1 px-2">
                  <div className="col-sm-1">
                    <SaveButton
                        text={"Save"}
                        onClick={submit}
                    />
                  </div>
                </div>
              ))}
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default ChangePaymentMode;
