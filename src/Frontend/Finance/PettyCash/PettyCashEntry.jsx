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
  SavePCEntry,
  searchPettyCashEntry,
  SearchPettyCashRequest,
  updatePettyCashEntryStatus,
  UpdateRequestStatus,
} from "../../../NetworkServices/Pettycash";
import moment from "moment";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import Tables from "../../../components/UI/customTable";
import { CancelSVG } from "../../../components/SvgIcons";
import { Tooltip } from "primereact/tooltip";
import { FinanceVoucherPrint } from "../../../NetworkServices/finance.js";
import FinanceModal from "../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../components/UI/customTable/HisTable";
function PettyCashEntry() {
  const [t] = useTranslation();
  const [centerName, setBindCenter] = useState([]);
  const [pettyName, setPettyName] = useState([]);
  const [bindata, setBindData] = useState([]);
  const [coid, setCoid] = useState([]);
  const [PettyCash, setPettyCash] = useState([]);
  const [conversionFactor, setConversionFactor] = useState([]);
  const [searchPettyCash, setSearchPettycah] = useState([]);
  const [modalData, setModalData] = useState({ visible: false });

  const initialValues = {
    documentDate: new Date(),
    center: {
      label: "",
      value: "",
    },
    branchCenter: { label: "", value: "" },
    currency: "",
    cashInHand: "",
    department: {
      label: "",
      value: "",
    },
    conversionFactor: "",
    actual: "",
    documentno: "",
    entryDate: new Date(),
    expenceType: { label: "", value: "" },
    requestAmount: "",
    approveAmount: "",
    Remark: "",
    EntryNo: "",
    Currency: {
      value: "INR",
    },
    ClosingBalance: 0,
  };

  const [values, setValues] = useState({ ...initialValues });

  console.log("values", values);
  const handleSelect = (name, value) => {
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBindBackendData = async () => {
    let payload = {
      filterType: 1,
      centreID: values?.center?.value,
      coaid: 0,
    };
    let apiResp = await BindBackendData(payload);

    if (apiResp?.success) {
      setCoid(apiResp.data[0].ValueField);
      setPettyName(apiResp.data);
    } else {
      // notify(apiResp?.message, "error");
    }
  };

  const displayBindBackendData = async () => {
    let payload = {
      filterType: 2,
      centreID: values?.center?.value,
      coaid: coid,
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
      // notify(apiResp?.message, "error");
    }
  };

  const handleGetCurrencyConversionFactosr = async () => {
    try {
      const response = await GetCurrencyConversionFactors(
        "INR",
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

  const handleGetSessionDate = async (data) => {
    try {
      const response = await GetSessionDate(
        moment(new Date()).format("DD-MMM-YYYY")
      );

      if (response.success) {
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

  const handleBindMainCenter = async () => {
    try {
      const response = await BindMainCenter();
      if (response.success) {
        setBindCenter(response.data);
      } else {
        setBindCenter([]);
      }
    } catch (error) {
      setBindCenter([]);
    }
  };

  const handlebindVoucherBillingScreenControls = async (data) => {
    try {
      const response = await bindVoucherBillingScreenControls(data);

      // var responseData = PageChache.filter(function (i) { return i.TypeID == 13 && i.TypeCode == 'ET' });
      if (response.success) {
        const country = filterByTypes(
          response?.data,
          [4],
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
        setPettyCash(response.data);
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

  const handleCOACurrentClosingBalance = async (coaId) => {
    try {
      const response = await GetCOACurrentClosingBalance(values?.center?.value);
      if (response.success) {
        setValues((val) => ({
          ...val,
          ClosingBalance: response?.data[0]?.ClosingBal,
        }));
      } else {
        console.error(
          "API returned success as false or invalid response:",
          response
        );
        setValues((val) => ({
          ...val,
          ClosingBalance: 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
      setPettyCash([]);
    }
  };

  console.log("Currency", values?.Currency);
  const handleSave = async () => {
    let RecPayload = {
      pccoaid: coid,
      empMappingList: bindata
        .filter((val) => val.isChecked)
        .map((val) => ({
          pccoaid: coid,
          employeeID: val.EmployeeID,
          isVerify: val.isVerify,
          isAuth: val.isAuth,
        })),
    };

    try {
      const ReciveResp = await AccessMasterSaveMapping(RecPayload);
      if (ReciveResp.success) {
        notify(`${ReciveResp?.message}`, "success");
        handleBindMainCenter();
        // handleBindBackendData();
        // displayBindBackendData();
      } else {
        notify("No records found", "error");
      }
    } catch (error) {
      notify("Some error occurred", "error");
    }
  };

  console.log(values?.center?.value, "the center data is ");

  // Save API

  // SavePCDeptRequest

  const handleSavePettyEntry = async () => {
    if (!values?.entryDate) {
      notify("Please Select Entry Date", "error");
      return;
    } else if (!values?.department?.value) {
      notify("Please Select Department", "error");
      return;
    } else if (!values?.documentno) {
      notify("Please Enter Document No", "error");
      return;
    } else if (!values?.documentDate) {
      notify("Please Select Document Date", "error");
      return;
    } else if (!values?.expenceType?.value) {
      notify("Please Select Expense Type", "error");
      return;
    } else if (!values?.requestAmount) {
      notify("Please Enter Request Amount", "error");
      return;
    } else if (!values?.approveAmount) {
      notify("Please Enter Approved Amount", "error");
      return;
    } else if (!values?.center?.value) {
      notify("Please Select Petty Cash A/C", "error");
      return;
    } else if (!values?.branchCenter) {
      notify("Please Select Branch Center", "error");
      return;
    }
    
    let payload = {
      entryDate: moment(values.entryDate).format("DD-MMM-YYYY"),
      deptCode: values.department.value,
      coaID: values.center.value,
      documentNo: values.documentno,
      documentDate: moment(values.documentDate).format("DD-MMM-YYYY"),
      expenseTypeCode: values.expenceType.value,
      requestAmount: values.requestAmount,
      approvedAmount: values.approveAmount,
      currencyCode: values.Currency.value,
      transCurrFactor: conversionFactor,
      actualCurrFactor: conversionFactor,
      remarks: values.Remark,
      isUpdate: values.isUpdate ? 1 : 0,
      entryID: values.entryID || 0,
      entryNo: values.EntryNo || "",
      branchCentreID: values.branchCenter?.value || 0,
    };

    try {
      const ReciveResp = await SavePCEntry(payload);
      
      if (ReciveResp.success) {
        values?.isUpdate === 1
          ? notify(ReciveResp?.message, "success")
          : setModalData({
              visible: true,
              width: "20vw",
              label: t("Alert !"),
              buttonName: t(""),
              CallAPI: "",
              modalData: "",
              // footer: (<></>),
              Component: (
                <>
                  <h1
                    style={{
                      textAlign: "center",
                      fontSize: "14px !important",
                      fontWeight: "600",
                    }}
                  >
                    Petty Cash Entry Approved Successfully
                  </h1>
                  <h1
                    style={{
                      fontSize: "16px !important",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Approval No. :{" "}
                    <span style={{ color: "red" }}>{ReciveResp?.data}</span>
                  </h1>
                </>
              ),
            });
        handleSearchPettyCashRequest();
        setValues(initialValues);
      } else {
        notify("No records found", "error");
      }
    } catch (error) {
      notify("Some error occurred", "error");
    }
  };

  // SearchPettyCashRequest

  const handleSearchPettyCashRequest = async () => {
    let payload = {
      entryNo: values.EntryNo,
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MMM-YYYY"),
    };

    try {
      const ReciveResp = await searchPettyCashEntry(payload);
      if (ReciveResp.success) {
        // notify(`${ReciveResp?.data?.length} data found`, "success");
        setSearchPettycah(ReciveResp?.data);
      } else {
        setSearchPettycah([]);
        notify("No records found", "error");
      }
    } catch (error) {
      notify("Some error occurred", "error");
    }
  };

  const handleUpdateRequestStatus = async (entryType, entryStatus, entryID) => {
    
    let payload = {
      entryType: entryType,
      entryStatus: entryStatus,
      entryID: entryID,
    };

    try {
      const ReciveResp = await updatePettyCashEntryStatus(payload);
      if (ReciveResp.success) {
        notify(ReciveResp?.message, "success");
        handleSearchPettyCashRequest();
      } else {
        notify(ReciveResp?.message, "error");
      }
    } catch (error) {
      notify("Some error occurred", "error");
    }
  };

  console.log("the searchPettyCash is", searchPettyCash);

  useEffect(() => {
    handleSearchPettyCashRequest();
    handleBindMainCenter();
    // handleBindBackendData();
    // displayBindBackendData();
    handleGetCurrencyConversionFactosr();
    handleGetSessionDate();
    handlebindVoucherBillingScreenControls(1);
  }, []);

  useEffect(() => {
    if (values?.center?.value) {
      handleCOACurrentClosingBalance();
    }
  }, [values?.center?.value]);

  const searchPettyCashThead = [
    { width: "5%", name: t("SNo") },
    { width: "5%", name: t("Request No") },
    { width: "5%", name: t("Request Date") },
    { width: "5%", name: t("Branch Centre") },
    { width: "5%", name: t("Petty Cash A/C") },
    { width: "5%", name: t("Request Amount ") },
    { width: "5%", name: t("Approved Amount") },
    { width: "5%", name: t("Document No") },
    { width: "5%", name: t("Expense Type") },
    { width: "5%", name: t("Entry By") },
    { width: "5%", name: t("Verify/Auth. Status") },
    { width: "5%", name: t("Action") },
    // { width: "5%", name: t("Cancel") },
    // { width: "5%", name: t("Verify") },
    // { width: "5%", name: t("Auth") },
  ];

  // const handlePrint = async (value, index) => {
  //   const payload = {
  //     voucherNo: value?.VoucherNo,
  //   };

  //   const response = await FinanceVoucherPrint(payload);
  //   if (response?.success) {
  //     RedirectURL(response?.data?.pdfUrl);
  //     notify(response?.message, "success");
  //   } else {
  //     notify(response?.message, "error");
  //   }
  // };

  const handleEdit = (val) => {
    console.log("Edit row data:", val);

    setValues({
      center: {
        label: val.AccountName,
        value: val.COAID,
      },

      Currency: {
        value: val.CurrencyCode,
      },

      cashInHand: values?.cashInHand || 0,

      department: {
        label: val.DepartmentName,
        value: val.DepartmentCode,
      },

      documentno: val.DocumentNo || "",

      entryDate: val.EntryDate
        ? moment(val.EntryDate, "DD-MMM-YYYY").toDate()
        : new Date(),

      documentDate: val.DocumentDate
        ? moment(val.DocumentDate, "DD-MMM-YYYY").toDate()
        : new Date(),

      expenceType: {
        label: val.ExpenseType,
        value: val.ExpenseTypeCode,
      },

      requestAmount: val.RequestAmount,
      approveAmount: val.ApprovedAmount,

      branchCenter: val.BranchCentre
        ? {
            label: val.BranchCentre,
            value: val.BranchCentreID,
          }
        : "",

      Remark: val.Remarks || "",

      // EntryNo: val.PCEntryNo,
      entryID: val.PCEntryID,
      isUpdate: 1,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="m-2 spatient_registration_card card">
        <Heading
          name={t("Cash Entry")}
          isBreadcrumb={true}
        />

        <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
          <ReactSelect
            placeholderName={t("Petty Cash Chart of A/C")}
            id={"center"}
            className={"required-fields"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            dynamicOptions={[
              ...filterByTypes(
                PettyCash,
                [12],
                ["TypeID"],
                "TextField",
                "ValueField",
                "STD_CODE"
              ),
            ]}
            onChange={handleSelect}
            value={`${values?.center?.value}`}
            name={"center"}
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
            <LabeledInput
              name="currency"
              id="currency"
              label={t("Currency")}
              value={values?.Currency?.value}
            />
          </div>

          <Input
            type="number"
            disabled={true}
            className="form-control"
            id="cashInHand"
            placeholder=" "
            name="cashInHand"
            value={values?.ClosingBalance || 0}
            onChange={handleChange}
            lable={t("Cash In Hand")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <DatePicker
            className={`custom-calendar required-fields`}
            id="entryDate"
            name="entryDate"
            lable={t("Entry Date")}
            value={values?.entryDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-12"
          />

          {/* return i.TypeID == 2 && i.TypeCode == 'D' */}

          <ReactSelect
            className={"required-fields"}
            placeholderName={t("Department")}
            id={"department"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            dynamicOptions={filterByTypes(
              PettyCash,
              [2, "D"],
              ["TypeID", "TypeCode"],
              "TextField",
              "ValueField"
            )}
            onChange={handleSelect}
            value={`${values?.department?.value}`}
            name={"department"}
          />

          <div className="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12">
            <LabeledInput
              label={t("Conversion Factor")}
              value={conversionFactor}
            />
          </div>

          {/* <Input
            type="text"
            className="form-control"
            id="ClosingBalance"
            placeholder=" "
            name="ClosingBalance"
            value={values?.currency || ""}
            onChange={handleChange}
            lable={t("Request Amount")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-12"
          /> */}

          <div className="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12">
            <LabeledInput
              label={t("Actual")}
              name="actual"
              id="actual"
              value={conversionFactor}
            />
          </div>

          <Input
            type="text"
            className="form-control required-fields"
            id="documentno"
            placeholder=" "
            name="documentno"
            value={values?.documentno || ""}
            onChange={handleChange}
            lable={t("Document No.")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <DatePicker
            id="documentDate"
            className={`custom-calendar required-fields`}
            name="documentDate"
            lable={t("Document Date")}
            value={values?.documentDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            // maxDate={values?.toDate}
          />

          <ReactSelect
            className={"required-fields"}
            placeholderName={t("Expense Type")}
            id={"expenceType"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            // dynamicOptions={handleReactSelectDropDownOptions(
            //   centerName,
            //   "CentreName",
            //   "MainCentreID"
            // )}

            dynamicOptions={[
              ...filterByTypes(
                PettyCash,
                [13],
                ["TypeID"],
                "TextField",
                "ValueField",
                "STD_CODE"
              ),
            ]}
            onChange={handleSelect}
            value={`${values?.expenceType?.value}`}
            name={"expenceType"}
          />

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

          <Input
            type="number"
            className="form-control required-fields"
            id="approveAmount"
            placeholder=" "
            name="approveAmount"
            value={values?.approveAmount || ""}
            onChange={handleChange}
            lable={t("Approved Amount")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <ReactSelect
            className={"required-fields"}
            placeholderName={t("Branch Center")}
            id={"branchCenter"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            dynamicOptions={[
              ...filterByTypes(
                PettyCash,
                [14],
                ["TypeID"],
                "TextField",
                "ValueField",
                "STD_CODE"
              ),
            ]}
            onChange={handleSelect}
            value={`${values?.branchCenter?.value}`}
            name={"branchCenter"}
          />

          <Input
            type="text"
            className="form-control"
            id="Remark"
            placeholder=" "
            name="Remark"
            value={values?.Remark || ""}
            onChange={handleChange}
            lable={t("Remark")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <div
            className="col-sm-2 col-xl-1"
            style={{ display: "flex", alignItems: "center" }}
          >
            <button
              className="btn btn-sm btn-primary"
              type="button"
              onClick={handleSavePettyEntry}
            >
              {values?.isUpdate === 1 ? t("Update") : t("Save")}
            </button>
            <button
              className="btn btn-sm btn-primary ml-2"
              type="button"
              onClick={() => {
                setValues(initialValues);
              }}
            >
              {t("Reset")}
            </button>
          </div>
        </div>

        <Heading title={t("Reuest List")} isBreadcrumb={false} />

        <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
          <Input
            type="text"
            className="form-control"
            id="EntryNo"
            placeholder=" "
            name="EntryNo"
            value={values?.EntryNo || ""}
            onChange={handleChange}
            lable={t("Entry No.")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <DatePicker
            id="fromDate"
            className="custom-calendar"
            name="fromDate"
            lable={t("From Date")}
            value={values?.fromDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />

          <DatePicker
            id="toDate"
            className="custom-calendar"
            name="toDate"
            lable={t("To Date")}
            value={values?.toDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            maxDate={new Date()}
          />

          <div className="col-sm-2 col-xl-1">
            <button
              className="btn btn-sm btn-primary"
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
                requestNo: val.PCEntryNo,
                requestDate: val.PCEntryDate,
                BranchCenter: val.BranchCentre,
                pettyCash: val.AccountName,
                Amount: val.RequestAmount,
                ApprovalAmount: val.ApprovedAmount,
                DocumentNo: val.DocumentNo,
                ExpenseType: val.ExpenseType,
                EntryBy: val.EntryBy,
                VerifyStatus: `${val.IsVerify} / ${val.IsAuth}`,
                Action: (
                  <>
                    {/* cancel */}
                    {val.IsCancelEdit === 1 ? (
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
                            handleUpdateRequestStatus(
                              4,
                              "Cancel",
                              val?.PCEntryID
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
                            id={`check${index}`}
                            className="fa fa-check"
                            style={{ color: "green", marginLeft: "12px" }}
                            onClick={() =>
                              handleUpdateRequestStatus(
                                2,
                                val?.IsVerify,
                                val?.PCEntryID
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
                            className="fa fa-ban"
                            style={{ color: "red", marginLeft: "12px" }}
                            id={`unBan${index}`}
                            onClick={() =>
                              handleUpdateRequestStatus(
                                2,
                                val?.IsVerify,
                                val?.PCEntryID
                              )
                            }
                          ></span>
                        </>
                      )
                    ) : null}

                    {/* auth */}
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
                                val?.PCEntryID
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
                            className="fa fa-lock-open"
                            id={`unauth${index}`}
                            onClick={() =>
                              handleUpdateRequestStatus(
                                3,
                                val?.IsAuth,
                                val?.PCEntryID
                              )
                            }
                          ></span>
                        </>
                      )
                    ) : null}

                    {/* Edit */}
                    {val.IsVerifyEdit === 1 ? (
                      val.IsVerify === "No" ? (
                        <>
                          <Tooltip
                            target={`#print${index}`}
                            position="top"
                            content={t("Edit")}
                            event="hover"
                            className="ToolTipCustom"
                          />
                          <i
                            id={`print${index}`}
                            style={{ marginLeft: "12px", color: "black" }}
                            className="fa fa-edit"
                            onClick={() => {
                              handleEdit(val, index);
                            }}
                          ></i>
                        </>
                      ) : (
                        <>
                          <Tooltip
                            target={`#print${index}`}
                            position="top"
                            content={t("Edit")}
                            event="hover"
                            className="ToolTipCustom"
                          />
                          <i
                            id={`print${index}`}
                            style={{
                              marginLeft: "12px",
                              color: "grey",
                              cursor: "not-allowed",
                            }}
                            className="fa fa-edit"
                            // onClick={() => {
                            //   handleEdit(val, index);
                            // }}
                          ></i>
                        </>
                      )
                    ) : null}
                    {/* <>
                      <Tooltip
                        target={`#print${index}`}
                        position="top"
                        content={t("Edit")}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <i
                        id={`print${index}`}
                        style={{ marginLeft: "12px", color: "black" }}
                        className="fa fa-edit"
                        onClick={() => {
                          handleEdit(val, index);
                        }}
                      ></i>
                    </> */}
                  </>
                ),
                // Cancel:
                //   val.IsCancelEdit === 1 ? (
                //     <span
                //       onClick={() =>
                //         handleUpdateRequestStatus(4, "Cancel", val?.PCEntryID)
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
                //             val?.PCEntryID
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
                //             val?.PCEntryID
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
                //           handleUpdateRequestStatus(
                //             3,
                //             val?.IsAuth,
                //             val?.RequestID
                //           )
                //         }
                //       >
                //         Auth
                //       </span>
                //     ) : (
                //       <span
                //         onClick={() =>
                //           handleUpdateRequestStatus(
                //             3,
                //             val?.IsAuth,
                //             val?.RequestID
                //           )
                //         }
                //       >
                //         Un-Auth
                //       </span>
                //     )
                //   ) : null,
              }))}
              tableHeight={"scrollView"}
              style={{ height: "60vh", padding: "2px" }}
            />
          </div>
        )}
        {modalData?.visible && (
          <FinanceModal
            visible={modalData?.visible}
            setVisible={() => {
              setModalData({ visible: false });
            }}
            modalData={modalData?.modalData}
            modalWidth={modalData?.width}
            Header={modalData?.label}
            buttonType="button"
            buttonName={modalData?.buttonName}
            footer={<></>}
            handleAPI={modalData?.CallAPI}
          >
            {modalData?.Component}
          </FinanceModal>
        )}
      </div>
    </>
  );
}

export default PettyCashEntry;
