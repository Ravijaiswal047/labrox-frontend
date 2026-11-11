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
import DatePicker from "../../../components/formComponent/DatePickerHis";
import {
  BindBackendData,
  BindMainCenter,
  bindVoucherBillingScreenControls,
  GetCOACurrentClosingBalance,
  GetCurrencyConversionFactors,
  GetSessionDate,
  SavePCDeptRequest,
  SearchPettyCashRequest,
  UpdateRequestStatus,
} from "../../../NetworkServices/Pettycash";
import moment from "moment";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import Tables from "../../../components/UI/customTable";
import { CancelSVG } from "../../../components/SvgIcons";
import {
  BindVoucherBillingScreenControls,
  FinanceBindBranchCentre,
} from "../../../NetworkServices/finance.js";
import { Tooltip } from "primereact/tooltip";
import HisTable from "../../../components/UI/customTable/HisTable";
function PettyCashAccessMaster() {
  const { VITE_DATE_FORMAT } = import.meta.env;

  const [t] = useTranslation();
  const [centerName, setBindCenter] = useState([]);
  const [bindata, setBindData] = useState([]);
  const [coa, setCoa] = useState([]);
  const [PettyCash, setPettyCash] = useState([]);
  const [conversionFactor, setConversionFactor] = useState([]);
  const [searchPettyCash, setSearchPettycah] = useState([]);

  const [dropDownState, setDropDownState] = useState({
    PettyCashAc: [],
    Department: [],
    Currency: [],
    BindCentres: [],
  });

  const [values, setValues] = useState({
    center: "",
    cashChart: "",
    RequestNo: "",
    remarks: "",
    requestAmount: "",
    currencyCode: "",
    conversionFactor: "",
    branchCenter: { value: "", label: "" },
    department: { value: "", label: "" },
    requestDate: new Date(),
    fromDate: new Date(),
    toDate: new Date(),
  });

  const handleSelect = (name, value) => {
    if (name === "pettyCashAc") {
      
      if (Number(value?.value) > 0) {
        const filteredData = dropDownState?.PettyCashAc?.filter(
          (val) => val?.ValueField === value?.value
        );
        setValues((val) => ({
          ...val,
          Currency: filteredData[0]?.CurrencyCode,
        }));
      } else {
        setValues((val) => ({
          ...val,
          Currency: dropDownState?.Currency[0].TypeCode,
        }));
      }
      const filteredData = dropDownState?.PettyCashAc?.filter(
        (val) => val?.ValueField === value?.value
      );
      setValues((val) => ({
        ...val,
        PettyCashAc: filteredData,
      }));
    }
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const displayBindBackendData = async () => {
    let payload = {
      filterType: 2,
      centreID: values?.center?.value,
      coaid: values?.pettyCashAc?.value,
    };
    let apiResp = await BindBackendData(payload);

    if (apiResp?.success) {
      setBindData(
        apiResp.data.map((item) => ({
          ...item,
          isVerify: 0,
          isAuth: 0,
        }))
      );
    } else {
    }
  };

  const handleGetCurrencyConversionFactor = async () => {
    try {
      const response = await GetCurrencyConversionFactors(
        values?.Currency,
        moment(new Date()).format("DD-MMM-YYYY")
      );

      if (response.success) {
        setConversionFactor(response.data);
      } else {
        console.error(
          "API returned success as false or invalid response:",
          response
        );
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };

  // const bindCenter = async () => {
  //   let apiResp = await FinanceBindBranchCentre();
  //   if (apiResp?.success) {
  //     setDropDownState((val) => ({
  //       ...val,
  //       BindCentres: handleReactSelectDropDownOptions(
  //         apiResp?.data,
  //         "CentreName",
  //         "CentreID"
  //       ),
  //     }));
  //   }
  // };

  const handleCOACurrentClosingBalance = async () => {
    try {
      const response = await GetCOACurrentClosingBalance(
        values?.pettyCashAc?.value
      );
      if (response.success) {
        setValues((val) => ({
          ...val,
          ClosingBalance: response.data[0]?.ClosingBal,
        }));
      } else {
        console.error(
          "API returned success as false or invalid response:",
          response
        );
        setValues((val) => ({
          ...val,
          ClosingBalance: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
      setValues((val) => ({
        ...val,
        ClosingBalance: "",
      }));
    }
  };

  const handleSavePCDeptRequest = async () => {
    if (!values?.pettyCashAc?.value) {
      notify("Please Select Petty Cash", "error");
      return;
    } else if (!values?.branchCenter?.value) {
      notify("Please Select Branch Center", "error");
      return;
    } else if (!values?.department?.value) {
      notify("Please Select Department", "error");
      return;
    } else if (!values?.requestDate) {
      notify("Please Select Request Date", "error");
      return;
    } else if (!values?.requestAmount) {
      notify("Please Enter Request Amount", "error");
      return;
    }
    let payload = {
      coaID: Number(values?.pettyCashAc?.value),
      deptCode: values?.department?.DeptCode,
      requestDate: moment(values?.requestDate).format("YYYY-MMM-DD"),
      specificAmount: values?.requestAmount,
      currencyCode: values?.Currency,
      transCurrFactor: conversionFactor,
      actualCurrFactor: conversionFactor,
      remarks: values?.remarks,
      branchcentreid: values?.branchCenter?.value,
    };

    try {
      const ReciveResp = await SavePCDeptRequest(payload);
      if (ReciveResp.success) {
        notify(`${ReciveResp?.message}`, "success");
        handleSearchPettyCashRequest();
        setValues({
          center: "",
          cashChart: "",
          RequestNo: "",
          remarks: "",
          requestAmount: "",
          currencyCode: "",
          conversionFactor: "",
          branchCenter: { value: "", label: "" },
          department: { value: "", label: "" },
          requestDate: new Date(),
          fromDate: new Date(),
          toDate: new Date(),
          pettyCashAc: { label: "", value: "" },
        });
      } else {
      }
    } catch (error) {
      notify("Some error occurred", "error");
    }
  };

  const handleSearchPettyCashRequest = async () => {
    let payload = {
      requestNo: values.RequestNo ? values?.RequestNo : "",
      fromDate: moment(values?.fromDate).format("YYYY-MMM-DD"),
      toDate: moment(values?.toDate).format("YYYY-MMM-DD"),
    };

    try {
      const ReciveResp = await SearchPettyCashRequest(payload);
      if (ReciveResp.success) {
        // notify(`${ReciveResp?.data?.length} data found`, "success");
        setSearchPettycah(ReciveResp?.data);
      } else {
        setSearchPettycah([]);
      }
    } catch (error) {
      notify("Some error occurred", "error");
    }
  };

  const handleUpdateRequestStatus = async (
    entryType,
    entryStatus,
    RequestID
  ) => {
    let payload = {
      entryType: entryType,
      entryStatus: entryStatus,
      requestID: RequestID,
    };

    try {
      
      const ReciveResp = await UpdateRequestStatus(payload);
      if (ReciveResp.success) {
        notify(ReciveResp?.message, "success");
        handleSearchPettyCashRequest();
      } else {
        notify(ReciveResp?.message, "error");
      }
    } catch (error) {
      notify(error, "error");
    }
  };

  useEffect(() => {
    // bindCenter();
    displayBindBackendData();
    handleSearchPettyCashRequest();
  }, []);

  useEffect(() => {
    if (values?.pettyCashAc?.value) {
      handleCOACurrentClosingBalance();
      handleGetCurrencyConversionFactor();
    }
  }, [values?.pettyCashAc]);

  const searchPettyCashThead = [
    { width: "5%", name: t("S.No.") },
    { width: "5%", name: t("Request No.") },
    { width: "5%", name: t("Request Date") },
    { width: "5%", name: t("Branch Center") },
    { width: "5%", name: t("Petty Cash A/C") },
    { width: "5%", name: t("Amount") },
    { width: "5%", name: t("Entry Date") },
    { width: "5%", name: t("Entry By") },
    { width: "5%", name: t("Verify Status") },
    { width: "5%", name: t("Auth Status") },
    { width: "6%", name: t("Action") },
  ];

  const bindListData = async () => {
    let apiResp = await BindVoucherBillingScreenControls(1);
    if (apiResp?.success) {
      const PettyCashAc = filterByTypes(
        apiResp?.data,
        [12],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      const department = filterByTypes(
        apiResp?.data,
        [2],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      const currency = filterByTypes(
        apiResp?.data,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
      const BindCentres = filterByTypes(
        apiResp?.data,
        [14],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
      setDropDownState((val) => ({
        ...val,
        PettyCashAc: PettyCashAc,
        Department: department,
        Currency: currency,
        BindCentres: BindCentres,
      }));
    } else {
      // setList([])
    }
  };

  useEffect(() => {
    bindListData();
  }, []);

  useEffect(() => {
    if (dropDownState?.Currency?.length > 0) {
      setValues((val) => ({
        ...val,
        Currency: dropDownState?.Currency[0].TypeCode,
      }));
    }
  }, [dropDownState?.Currency]);
  return (
    <>
      <div className="m-2 spatient_registration_card card">
        <Heading
          name={t("Department Request")}
          isBreadcrumb={true}
        />

        <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
          <ReactSelect
             className="required-fields"
            placeholderName={t("Petty Cash Chart of A/C")}
            id={"pettyCashAc"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            dynamicOptions={[...dropDownState?.PettyCashAc]}
            onChange={handleSelect}
            value={`${values?.pettyCashAc?.value}`}
            name={"pettyCashAc"}
          />

          {/* <Input
            type="text"
            className="form-control"
            id="currency"
            placeholder=" "
            name="currency"
            value={values?.currency || ""}
            onChange={handleChange}
            lable={t("Currency")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-12"
          /> */}

          <div className="col-xl-2 col-md-4 col-sm-4 col-12">
            <LabeledInput label="Currency" value={values?.Currency} />
          </div>
          <Input
            type="number"
            className="form-control"
            id="ClosingBalance"
            placeholder=" "
            disabled={true}
            name="ClosingBalance"
            value={values?.ClosingBalance ?? ""}
            onChange={handleChange}
            lable={t("Closing Balance")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <DatePicker
            className="custom-calendar required-fields"
            id="requestDate"
            name="requestDate"
            lable={t("Request Date")}
            value={
              values?.requestDate ? moment(values.requestDate).toDate() : null
            }
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-12"
            // respclass="col-xl-2 col-md-4 col-lg-4 col-12"
            maxDate={new Date()}
          />

          <ReactSelect
            placeholderName={t("Department")}
            className={"required-fields"}
            id={"department"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4  col-12"
            dynamicOptions={dropDownState?.Department}
            onChange={handleSelect}
            value={`${values?.department?.value}`}
            name={"department"}
          />

          <div className="col-xl-2 col-md-4 col-sm-4 col-12">
            <LabeledInput
              className={"my-sm-0 my-1"}
              name="conversionFactor"
              label={t("Conversion Factor")}
              value={conversionFactor}
            />
          </div>
          <div className="col-xl-2 col-md-4 col-sm-4 col-12">
            <LabeledInput
              className={"my-sm-0 my-1"}
              name="conversionFactor"
              label={t("Actual Conversion Factor")}
              value={conversionFactor}
            />
          </div>

          <Input
            type="number"
            className="form-control required-fields"
            id="requestAmount"
            placeholder=" "
            name="requestAmount"
            value={values?.requestAmount || ""}
            onChange={handleChange}
            lable={t("Request Amount")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />
          <ReactSelect
            placeholderName={t("Branch Center")}
            id={"branchCenter"}
            className={"required-fields"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            dynamicOptions={dropDownState?.BindCentres}
            onChange={handleSelect}
            value={`${values?.branchCenter?.value}`}
            name={"branchCenter"}
          />

          <Input
            type="text"
            className="form-control"
            id="remarks"
            placeholder=" "
            name="remarks"
            value={values?.remarks || ""}
            onChange={handleChange}
            lable={t("Remark")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <div className="col-sm-2 col-xl-1">
            <button
              className="btn btn-lg btn-success"
              type="button"
              onClick={handleSavePCDeptRequest}
            >
              {t("Save")}
            </button>
          </div>
        </div>

        <Heading name={t("Reuest List")} isBreadcrumb={true} />

        <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
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

          <DatePicker
            id="fromDate"
            className="custom-calendar"
            name="fromDate"
            lable={t("From Date")}
            value={
              values?.fromDate ? moment(values.fromDate).toDate() : new Date()
            }
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <DatePicker
            className="custom-calendar"
            id="toDate"
            name="toDate"
            value={values?.toDate ? moment(values.toDate).toDate() : new Date()}
            maxDate={new Date()}
            placeholder={VITE_DATE_FORMAT}
            showTime
            hourFormat="12"
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            // maxDate={new Date()}
          />

          <div className="col-sm-2 col-xl-1">
            <button
              className="btn btn-lg btn-success"
              type="button"
              onClick={handleSearchPettyCashRequest}
            >
              {t("Search")}
            </button>
          </div>
        </div>
        {searchPettyCash.length > 0 && (
          <div className="card">
            <HisTable
              thead={searchPettyCashThead}
              tbody={searchPettyCash?.map((val, index) => ({
                sno: index + 1,
                requestNo: val.RequestNo,
                requestDate: val.RequestDate,
                BranchCenter: val.BranchCentreID,
                pettyCash: val.AccountName,
                Amount: val.RequestAmount,
                EntryDate: val.EntryDate,
                EntryBy: val.EntryBy,
                VerifyStatus: val.IsVerify,
                AuthStatus: val.IsAuth,
                // Cancel:
                //   val.IsCancel === 1 ? (
                //     <span
                //       onClick={() =>
                //         handleUpdateRequestStatus(4, "Cancel", val?.RequestID)
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
                //           handleUpdateRequestStatus(
                //             2,
                //             val?.IsVerify,
                //             val?.RequestID
                //           )
                //         }
                //       >
                //         Verify
                //       </span>
                //     ) : (
                //       <span
                //         onClick={() =>
                //           handleUpdateRequestStatus(
                //             2,
                //             val?.IsVerify,
                //             val?.RequestID
                //           )
                //         }
                //       >
                //         Un-Verify
                //       </span>
                //     )
                //   ) : null,

                // auth:
                // val.IsAuthEdit === 1 ? (
                //   val.IsAuth === "No" ? (
                //     <span
                //       onClick={() =>
                //         handleUpdateRequestStatus(
                //           3,
                //           val?.IsAuth,
                //           val?.RequestID
                //         )
                //       }
                //     >
                //       Auth
                //     </span>
                //   ) : (
                //     <span
                //       onClick={() =>
                //         handleUpdateRequestStatus(
                //           3,
                //           val?.IsAuth,
                //           val?.RequestID
                //         )
                //       }
                //     >
                //       Un-Auth
                //     </span>
                //   )
                // ) : null,
                Action: (
                  <div>
                    {/* Cancel */}
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
                          id={`cancelBtn${index}`}
                          style={{ color: "red" }}
                          className="fa fa-trash"
                          onClick={() =>
                            handleUpdateRequestStatus(
                              4,
                              "Cancel",
                              val?.RequestID
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

                    {/* Verify */}
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
                            id={`check${index}`}
                            className="fa fa-check"
                            style={{ color: "green", marginLeft: "12px" }}
                            onClick={() =>
                              handleUpdateRequestStatus(
                                2,
                                val?.IsVerify,
                                val?.RequestID
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
                            style={{ color: "red", marginLeft: "12px" }}
                            id={`unBan${index}`}
                            className="fa fa-ban"
                            onClick={() =>
                              handleUpdateRequestStatus(
                                2,
                                val?.IsVerify,
                                val?.RequestID
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
                            style={{ color: "green", marginLeft: "12px" }}
                            id={`auth${index}`}
                            className="fa fa-lock"
                            onClick={() =>
                              handleUpdateRequestStatus(
                                3,
                                val?.IsAuth,
                                val?.RequestID
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
                              handleUpdateRequestStatus(
                                3,
                                val?.IsAuth,
                                val?.RequestID
                              )
                            }
                          ></span>
                        </>
                      )
                    ) : null}
                  </div>
                ),
              }))}
              tableHeight={"scrollView"}
              style={{ height: "60vh", padding: "2px" }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default PettyCashAccessMaster;
