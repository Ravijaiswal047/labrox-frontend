import React, { useState, useEffect } from "react";
import Heading from "../../../components/UI/Heading";
// import {ReactSelect} from "../../../components/formComponent/ReactSelect";
import {
  filterByTypes,
  handleReactSelectDropDownOptions,
  notify,
} from "../../utils/Utils";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
// import DatePicker from "../../../components/formComponent/DatePickerHis";
import {
  BindBackendData,
  bindVoucherBillingScreenControls,
  searchPendingPettyCashApproval,
  updatePettyCashApprovalStatus,
  UpdateRequestStatus,
} from "../../../NetworkServices/Pettycash";
import moment from "moment";
import Tables from "../../../components/UI/customTable";
import { CancelSVG } from "../../../components/SvgIcons";
import { Tooltip } from "primereact/tooltip";
import {
  FinancePrintSearchVoucher,
  FinanceVoucherPrint,
} from "../../../NetworkServices/finance.js";
import { RedirectURL } from "../../../NetworkServices/PDFURL";
import HisTable from "../../../components/UI/customTable/HisTable";
import DatPickerHis from "../../../components/formComponent/DatePickerHis.jsx";
function PettyCashDeptApprovalVerification() {
  const [t] = useTranslation();
  const [PettyCash, setPettyCash] = useState([]);
  const [tbodyPatientDetail, setTbodyPatientDetail] = useState([]);
  const [pettyName, setPettyName] = useState([]);
  const [values, setValues] = useState({
    cashChart: "",
    currency: "",
    RequestNo: "",
    approvalno: "",
    fromDate: moment(new Date()).toDate(),
    toDate: moment(new Date()).toDate(),
    center: {
      label: "All",
      value: "0",
    },
  });

  console.log("values", values);

  const handleSelect = (name, value) => {
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const theadPatientDetail = [
    { width: "5%", name: t("SNo") },
    { width: "15%", name: t("Approval No.") },
    { width: "15%", name: t("Request No.") },
    { width: "10%", name: t("Request Date") },

    { width: "15%", name: t("Branch Center") },
    { width: "15%", name: t("Petty Cash A/C") },
    { width: "10%", name: t("Bank/Cash  A/C ") },

    { width: "15%", name: t("Appr. Amt.") },
    { width: "15%", name: t("Voucher No.") },
    { width: "10%", name: t("Verify Status") },

    { width: "15%", name: t("Auth Status") },
    { width: "15%", name: t("Action") },
    // { width: "15%", name: t("Cancel") },
    // { width: "10%", name: t("Verify") },
    // { width: "10%", name: t("Auth") },
  ];

  const handlebindVoucherBillingScreenControls = async (data) => {
    try {
      const response = await bindVoucherBillingScreenControls(data);
      if (response.success) {
        const country = filterByTypes(
          response?.data,
          [4],
          ["TypeID"],
          "TextField",
          "ValueField"
        );

        const pettyCash = filterByTypes(
          response?.data,
          [12],
          ["TypeID"],
          "TextField",
          "ValueField"
        );
        if (country?.length > 0) {
          setValues((val) => ({
            ...val,
            Currency: { value: country[0]["value"] },
          }));
        }
        setPettyCash(pettyCash);
      } else {
        console.error(
          "API returned success as false or invalid response:",
          response
        );
        setPettyCash([]);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
      setPettyCash([]);
    }
  };

  const handleBindBackendData = async () => {
    let payload = {
      filterType: 1,
      centreID: values?.center?.value,
      coaid: 0,
    };
    let apiResp = await BindBackendData(payload);

    if (apiResp?.success) {
      setPettyName(apiResp.data);
    } else {
      // notify(apiResp?.message, "error");
    }
  };

  //  searchPendingPettyCashApproval

  const handleSearchPendingPettyCashApproval = async (isTost = true) => {
    const payload = {
      coaID: values?.center?.value,
      requestNo: values?.RequestNo,
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MMM-YYYY"),
      approvalNo: values?.approvalno,
    };
    try {
      const apiResp = await searchPendingPettyCashApproval(payload);
      if (apiResp.success) {
        console.log(apiResp);
        notify(`${apiResp?.data?.length} records found `, "success");

        setTbodyPatientDetail(apiResp?.data);
      } else {
        setTbodyPatientDetail([]);
      }
      3;
    } catch (error) {
      console.error("Error while fetching data:", error);
      setTbodyPatientDetail([]);
    }
  };

  const ip = localStorage.getItem("ip");
  const { pathname } = location;

  const handleUpdateCashApprovalRequestStatus = async (
    entryType,
    entryStatus,
    PCApprovalID
  ) => {
    let payload = {
      entryType: entryType,
      entryStatus: entryStatus,
      approvalID: PCApprovalID,
      ipAddress: ip,
      macAddress: ip,
      pageURL: String(pathname),
    };
    
    try {
      const ReciveResp = await updatePettyCashApprovalStatus(payload);
      if (ReciveResp.success) {
        notify(ReciveResp.message, "success");
        handleSearchPendingPettyCashApproval();
      } else {
        notify(ReciveResp.message, "error");
      }
    } catch (error) {
      notify("Some error occurred", "error");
    }
  };

  useEffect(() => {
    handlebindVoucherBillingScreenControls(1);
    handleBindBackendData();
  }, []);

  const handlePrint = async (value, index) => {
    
    const payload = {
      voucherNo: value?.VoucherNo,
    };

    const response = await FinanceVoucherPrint(payload);
    if (response?.success) {
      RedirectURL(response?.data?.pdfUrl);
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };

  return (
    <>
      <div className="m-2 spatient_registration_card card">
        <Heading
          name={t("Apprval Verification")}
          isBreadcrumb={true}
        />

        <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
          {console.log("first", PettyCash)}
          <ReactSelect
            placeholderName={t("Petty Cash A/C")}
            id={"center"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            // dynamicOptions={filterByTypes(
            //   PettyCash,
            //   ["TypeID"],
            //   "TextField",
            //   "ValueField",
            //   "STD_CODE"
            // )}
            dynamicOptions={[{ label: "All", value: "0" }, ...PettyCash]}
            onChange={handleSelect}
            value={`${values?.center?.value}`}
            name={"center"}
          />
          <Input
            type="text"
            className="form-control"
            id="RequestNo"
            placeholder=" "
            name="RequestNo"
            value={values?.RequestNo || ""}
            onChange={handleChange}
            lable={t("Request No.")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <Input
            type="text"
            className="form-control"
            id="approvalno"
            placeholder=" "
            name="approvalno"
            value={values?.approvalno || ""}
            onChange={handleChange}
            lable={t("Approval No.")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <DatPickerHis
            id="fromDate"
            name="fromDate"
            className="custom-calendar required-fields"
            lable={t("Request From Date")}
            value={values?.fromDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <DatPickerHis
            id="toDate"
            className="custom-calendar required-fields"
            name="toDate"
            lable={t("Request To Date")}
            value={values?.toDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            maxDate={new Date()}
          />

          <div className="col-sm-2 col-xl-1">
            <button
              className="btn btn-lg btn-success"
              type="button"
              onClick={handleSearchPendingPettyCashApproval}
            >
              {t("Search")}
            </button>
          </div>
        </div>

        {tbodyPatientDetail.length > 0 && (
          <div className="card">
            <HisTable
              thead={theadPatientDetail}
              tbody={tbodyPatientDetail?.map((val, index) => ({
                sno: index + 1,
                ApprovalNo: val?.PCApprovalNo,
                RequestNo: val?.RequestNo,
                RequestDate: val?.EntryDate,
                BranchCenter: val?.BranchCentre,
                PettyCash: val?.AccountName,
                BankCashAc: val?.BankCashCOA,
                ApprAmt: val?.ApprovalAmount,
                VoucherNo: val?.VoucherNo,
                verifyStatus: val?.IsVerify,
                AuthStatus: val?.IsAuth,
                Action: !val?.VoucherNo ? (
                  <div>
                    {/* cancel */}
                    {val.IsCancel === 1 ? (
                      <>
                        <Tooltip
                          target={`#cancelBtn${index}`}
                          position="top"
                          content={t("Cancel")}
                          event="hover"
                          className="ToolTipCustom"
                        />
                        <span
                          style={{ color: "red" }}
                          className="fa fa-trash"
                          id={`cancelBtn${index}`}
                          onClick={() =>
                            handleUpdateCashApprovalRequestStatus(
                              4,
                              "Cancel",
                              val?.PCApprovalID
                            )
                          }
                        ></span>
                      </>
                    ) : (
                      <>
                        <Tooltip
                          target={`#cancelBtn${index}`}
                          position="top"
                          content={t("Cancel")}
                          event="hover"
                          className="ToolTipCustom"
                        />
                        <span
                          id={`cancelBtn${index}`}
                          style={{ color: "grey", cursor: "not-allowed" }}
                          className="fa fa-trash"
                        ></span>
                      </>
                    )}

                    {/* verify */}
                    {val.IsVerifyEdit === 1 ? (
                      val.IsVerify === "No" ? (
                        <>
                          <Tooltip
                            target={`#check${index}`}
                            position="top"
                            content={t("Verify")}
                            event="hover"
                            className="ToolTipCustom"
                          />
                          <span
                            className="fa fa-check"
                            style={{ color: "green", marginLeft: "12px" }}
                            id={`check${index}`}
                            onClick={() =>
                              handleUpdateCashApprovalRequestStatus(
                                2,
                                val?.IsVerify,
                                val?.PCApprovalID
                              )
                            }
                          ></span>
                        </>
                      ) : (
                        <>
                          <Tooltip
                            target={`#unBan${index}`}
                            position="top"
                            content={t("Un-Verify")}
                            event="hover"
                            className="ToolTipCustom"
                          />
                          <span
                            id={`unBan${index}`}
                            style={{ color: "red", marginLeft: "12px" }}
                            className="fa fa-ban"
                            onClick={() =>
                              handleUpdateCashApprovalRequestStatus(
                                2,
                                val?.IsVerify,
                                val?.PCApprovalID
                              )
                            }
                          ></span>
                        </>
                      )
                    ) : null}

                    {/* Auth */}
                    {val.IsAuthEdit === 1 ? (
                      val.IsAuth === "No" ? (
                        <>
                          <Tooltip
                            target={`#auth${index}`}
                            position="top"
                            content={t("Authorize")}
                            event="hover"
                            className="ToolTipCustom"
                          />
                          <span
                            className="fa fa-lock"
                            style={{ color: "green", marginLeft: "12px" }}
                            id={`auth${index}`}
                            onClick={() =>
                              handleUpdateCashApprovalRequestStatus(
                                3,
                                val?.IsAuth,
                                val?.PCApprovalID
                              )
                            }
                          ></span>
                        </>
                      ) : (
                        <>
                          <Tooltip
                            target={`#unauth${index}`}
                            position="top"
                            content={t("Un-Authorize")}
                            event="hover"
                            className="ToolTipCustom"
                          />
                          <span
                            style={{ color: "red", marginLeft: "12px" }}
                            id={`unauth${index}`}
                            className="fa fa-lock-open"
                            onClick={() =>
                              handleUpdateCashApprovalRequestStatus(
                                3,
                                val?.IsAuth,
                                val?.PCApprovalID
                              )
                            }
                          ></span>
                        </>
                      )
                    ) : null}
                  </div>
                ) : (
                  <>
                    <Tooltip
                      target={`#print${index}`}
                      position="top"
                      content={t("Print")}
                      event="hover"
                      className="ToolTipCustom"
                    />
                    <i
                      id={`print${index}`}
                      style={{ marginLeft: "12px", color: "black" }}
                      className="pi pi-print"
                      onClick={() => {
                        handlePrint(val, index);
                      }}
                    ></i>
                  </>
                ),
                // Cancel:
                //   val.IsCancel === 1 ? (
                //     <span
                //       onClick={() =>
                //         handleUpdateCashApprovalRequestStatus(
                //           4,
                //           "Cancel",
                //           val?.PCApprovalID
                //         )
                //       }
                //     >
                //       <CancelSVG />
                //     </span>
                //   ) : (
                //     ""
                //   ),
                // verify:
                //   val.IsVerifyEdit === 1 ? (
                //     val.IsVerify === "No" ? (
                //       <span
                //         onClick={() =>
                //           handleUpdateCashApprovalRequestStatus(
                //             2,
                //             val?.IsVerify,
                //             val?.PCApprovalID
                //           )
                //         }
                //       >
                //         Verify
                //       </span>
                //     ) : (
                //       <span
                //         onClick={() =>
                //           handleUpdateCashApprovalRequestStatus(
                //             2,
                //             val?.IsVerify,
                //             val?.PCApprovalID
                //           )
                //         }
                //       >
                //         Un-Verify
                //       </span>
                //     )
                //   ) : null,

                // auth:
                //   val.IsAuthEdit === 1 ? (
                //     val.IsAuth === "No" ? (
                //       <span
                //         onClick={() =>
                //           handleUpdateCashApprovalRequestStatus(
                //             3,
                //             val?.IsAuth,
                //             val?.PCApprovalID
                //           )
                //         }
                //       >
                //         Auth
                //       </span>
                //     ) : (
                //       <span
                //         onClick={() =>
                //           handleUpdateCashApprovalRequestStatus(
                //             3,
                //             val?.IsAuth,
                //             val?.PCApprovalID
                //           )
                //         }
                //       >
                //         Un-Auth
                //       </span>
                //     )
                //   ) : null,
              }))}
              tableHeight={"scrollView"}
              style={{ maxHeight: "100vh" }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default PettyCashDeptApprovalVerification;
