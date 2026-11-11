import React, { useEffect, useRef, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
import { PurchaGetBindAllCenter } from "../../../../NetworkServices/Purchase.js";
import ReportDatePicker from "../../../../components/ReportCommonComponents/ReportDatePicker";
import CustomDateRangePicker from "../../../../components/commonComponents/DateRangePicker";
// D:\Users\admin\Downloads\code\src\components\ReportCommonComponents\ReportDatePicker.jsx
import {
  BindVoucherBillingScreenControls,
  ChartOfGroupExcel,
  SearchVoucher,
} from "../../../../NetworkServices/finance.js";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePickerHis";
import Input from "../../../../components/formComponent/Input";
import moment from "moment";
import {
  BankReconciliationURL,
  BindReconciliationDetails,
  GetBankReconciliationExcel,
  UpdateReconciliation,
} from "../../../../NetworkServices/finance.js";
import BankReconciliationTable from "./BankReconciliationTable";
import LabeledInput from "../../../../components/formComponent/LabeledInput";
import Tables from "../../../../components/UI/customTable";
import ColorCodingSearch from "../../../../components/commonComponents/ColorCodingSearch";
import { exportToExcel } from "../../../../utils/exportLibrary";
import { transformDataInTranslate } from "../../../../components/WrapTranslate";
import { ExcelIconSVG } from "../../../../components/SvgIcons";
import ExcelUploader from "../../../../components/Finance/ExcelUploader";
import { useCallback } from "react";
import { Tooltip } from "primereact/tooltip";
import { filterByTypes, handleReactSelectDropDownOptions, notify } from "../../../utils/Utils";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../../components/UI/customTable/HisTable";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage.js";

const BankReconciliation = () => {
  const [t] = useTranslation();
  const { VITE_DATE_FORMAT } = import.meta.env;
  const isMobile = window.innerWidth <= 800;
const userData = useLocalStorage("userData", "get");
  const intialState = {
    Centre: [userData.MainCentreID],
    fromDate: new Date(),
    toDate: new Date(),
    Currency: {
      value: "",
      label: "",
    },
    ChequeDate: "",
    Cheque_no: "",
    Voucher_no: "",
    Clear: {
      value: "0",
      label: "No",
    },
    realization: "",
  };

  const [dropDonwState, setDropDownState] = useState({
    GetBindAllCenter: [],
    BankName: [],
  });
  const [excelData, setExcelData] = useState([]);
  const [list, setList] = useState([]);

  const [tableData, setTableData] = useState([]);

  const [payload, setPayload] = useState({
    ...intialState,
  });
  console.log("pyalo", payload);

  const [values, setValues] = useState({ ...intialState });

  const [modalState, setModalState] = useState({
    show: false,
    name: null,
    component: null,
    size: null,
    footer: null,
  });

  const [clearStatus, setClearStatus] = useState({});

  // STATE INITIALIZATION END

  // USE-EFFECT FUNCTION INITIALIZATION START
console.log("GetBindAllCenter",dropDonwState)
  const bindListData = async () => {
    let apiResp = await BindVoucherBillingScreenControls(1);
    
  
    if (apiResp?.success) {
      const currency = filterByTypes(
        apiResp?.data,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
      const BankCOA = filterByTypes(
        apiResp?.data,
        [5],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
      const GetBindAllCenter = filterByTypes(
        apiResp?.data,
        [14],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
    
setDropDownState((val) => ({
  ...val,
  GetBindAllCenter: handleReactSelectDropDownOptions(
    GetBindAllCenter,
    "TextField",
    "ValueField"
  ),
  BankCOA: handleReactSelectDropDownOptions(
    BankCOA,
    "TextField",
    "ValueField"
  ),

currency: handleReactSelectDropDownOptions(
    currency,
    "TextField",
    "ValueField"
  ),

  
}))
      // console.log("Bank", Bank);
      if (currency?.length > 0) {
        setValues((val) => ({
          ...val,
          Currency: { value: currency[0]["extraColomn"] },
        }));
      }
      setList(apiResp?.data);
    }
  };

  const BindBanks = async () => {
    try {
      const response = await BankReconciliationURL();
      if (response?.success) {
        setDropDownState((val) => ({
          ...val,
          BankName: handleReactSelectDropDownOptions(
            response?.data,
            "TextField",
            "ValueField"
          ),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };


  const handleMultiSelectChange = (name, selectedOptions) => {
    setPayload({ ...payload, [name]: selectedOptions });
  };

  const handleCurrencyChange = (e, name) => {
    setPayload((val) => {
      return {
        ...val,
        [e]: name,
      };
    });

  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const handleSelectAll = (e) => {
    let data = tableData.map((val, i) => {
      if (!val?.isDisabled) {
        val.isChecked = e?.target?.checked;
      }
      return val;
    });
    setTableData(data);
  };

  const handleSearch = async (type) => {
    const fromDate = new Date(payload?.fromDate);
    const toDate = new Date(payload?.toDate);
    const diffInDays = (toDate - fromDate) / (1000 * 3600 * 24);
    debugger
    if (
      !payload?.BankName ||
      !payload?.fromDate ||
      !payload?.toDate ||
      !payload?.Clear?.value
    ) {
      notify("Please fill all required fields", "error");
      return;
    } else if (!payload?.Centre) {
      notify("Please Select Centre");
    }

    const payloadGoing = {
      fromDate: moment(payload?.fromDate).format("DD-MMM-YYYY"),
      toDate: moment(payload?.toDate).format("DD-MMM-YYYY"),
      bankCoaID: String(payload?.BankName?.value||0),
      checkDate: payload?.ChequeDate
        ? moment(payload?.ChequeDate).format("DD-MMM-YYYY")
        : "",
      checkNo: String(payload?.Cheque_no),
      voucherNo: String(payload?.Voucher_no),
      clearStatus: String(payload?.Clear?.value),
      branchCentreID: String(payload?.Centre?.map((item) => item)),
      IsExcelDownload: type ? String(type) : "0",
    };

    console.log("Payload before saving ", payloadGoing);
    const response = await BindReconciliationDetails(payloadGoing);

    if (response?.success) {
      // notify("Record Found", "success");
      // debugger
      if (String(type) === "1") {
        exportToExcel(
          transformDataInTranslate(response?.data, t),
          "Bank Reconciliation"
        );
        return;
      } else {
        setTableData(response?.data);
        // setBindMapping(
        //   response?.data.map((newItem) => ({
        //     ...newItem,
        //     realization: "",
        //   }))
        // );
        return response?.data;
      }

      // setPayload([]);

      // ✅ Functional update to avoid infinite re-renders
      // setPayload((prev) => ({
      //   ...prev,
      //   Cheque_no: "",
      //   Voucher_no: "",
      //   realization: "",
      // }));
    } else {
      notify(response?.message, "error");
    }
  };

  const handleRowSelect = (index, e) => {
    let tblData = [...tableData];
    tblData[index]["isChecked"] = e?.target?.checked;
    setTableData(tblData);
  };

  const thead = [
    t("S.No."),
    t("Ref/Cheque No"),
    t("Cheque Date"),
    t("Cheque Amount"),
    t("Status"),
    t("Voucher No"),
    t("Voucher Date"),
    t("RC Cheque No."),
    t("RC Cheque Amount"),
    {
      name: isMobile ? (
        t("check")
      ) : (
        <input
          type="checkbox"
          className="table-checkbox"
          style={{ marginRight: "20px" }}
          // name="isAssetActive"
          // id="isAssetActive"
          // onChange={handleChange}
          // checked={bindMapping?.isChecked}
          // ref={selectAllRef}
          // checked={areAllSelected}
          onChange={handleSelectAll}
        />
      ),
      width: "1%",
    },
    t("Realization"),
    t("Action"),
  ];

  const handleTableDetails = async (ele, i) => {
    console.log("ele", ele);
    try {
      let payalod = {
        filterType: 2,
        voucherNo: ele?.VoucherNo ? ele?.VoucherNo : "",
        fromDate: "",
        toDate: "",
      };
      let apiResmodel = await SearchVoucher(payalod);
      if (apiResmodel.success) {
        handleModalState(
          true,
          "Details",
          <>
            <BankReconciliationTable data={apiResmodel?.data} />
          </>,
          "80vw",
          <></>
        );
      }
    } catch (error) {
      console.log(error, "Something went wrong");
    }
  };

  const handleModalState = (show, name, component, size, footer) => {
    setModalState({
      show: show,
      name: name,
      component: component,
      size: size,
      footer: footer,
    });
  };

  const handleInputChange = (e, index) => {
    // console.log(e.target.value);
    let newData = [...tableData];
    newData[index]["realization"] = e?.target?.value;
    setTableData(newData);
  };

  const handleUpload = () => { };

  const handleDownload = async () => {
    // debugger;
    const response = await GetBankReconciliationExcel();
    if (response?.success) {
      console.log("Response", response);
    }
  };

  const handleSave = async () => {
    const filterData = tableData?.filter((val) => val?.isChecked);
    const IsExcelUploaded = tableData?.find((val) => val?.IsExcelUploaded);
    if (filterData?.length === 0) {
      notify("Kindly Select At Least One Cheque", "error");
      return;
    }

    const payloadtobe = {
      reconciliation: filterData.map((item) => ({
        chequeNo: String(item?.ChequeNo|| ""),
        status: String(item?.cheque_status || ""),
        voucherNo: String(item?.VoucherNo || ""),
        bankCoaID: String(item?.BankCoaID||""),
        remark: item?.realization ? String(item?.realization) : "",
        entryDetailsID: String( item?.EntryDetailID || ""),
        chequeEntryID: String(item?.chequeentryId || ""),
        transacionType: String(item?.TransacionType || ""),
        chequeAmount: Number(item?.SpecificAmount || 0),
      })),
      clearStatus: payload?.Clear?.value,
      IsExcelUploaded: IsExcelUploaded ? "1" : "0",
    };
    // IsReonciliation
    // cheque_status
    const saveResponse = await UpdateReconciliation(payloadtobe);

    if (saveResponse?.success) {
      notify(saveResponse?.message, "success");
      handleSearch("0");
      // setPayload([]);
      // setBindMapping([]);
      // setTableData([]);
      // setClearStatus({ value: "", label: "" });
    } else {
      notify(saveResponse?.message, "error");
    }
  };

  const handleExportExcel = async () => {
    let apiResp = await GetBankReconciliationExcel();
    if (apiResp?.success) {
      exportToExcel(transformDataInTranslate(apiResp?.data, t));
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const handleDataExtracted = async (data) => {
    let apiRespData = await handleSearch("0");
    console.log("Uploaded Excel Data:", apiRespData);
    setExcelData(data); // Store the uploaded data

    const updatedTable = apiRespData?.map((row) => {
      const matchedEntry = data?.find((entry) => {
        // debugger;
        return (
          String(entry["__EMPTY"])?.trim() === String(row?.VoucherNo)?.trim() &&
          String(entry["__EMPTY_3"])?.trim() === "1"
        );
      });
      // debugger;
      if (matchedEntry) {
        return {
          ...row,
          isChecked: true,
          isDisabled: true,
          IsExcelUploaded: true,
        };
      } else {
        return {
          ...row,
          isChecked: false,
          isDisabled: true,
          IsExcelUploaded: true,
        };
      }

      return { ...row, matched: false, amountMatched: false };
    });
    setTableData(updatedTable);

    // ✅ Automatically select rows that are matched and amountMatched
    const matchedRows = updatedTable
      .map((row, index) => (row.matched && row.amountMatched ? index : null))
      .filter((index) => index !== null);

    console.log("Matched Rows:", matchedRows);
    // setSelectedRows(matchedRows);
  };

  useEffect(() => {
    bindListData();
    BindBanks();
  }, []);

  const handleDateRangeChange = (e) => {
    const { startDate, endDate } = e.target.value;
    setPayload((val) => ({
      ...val,
      fromDate: startDate,
      toDate: endDate,
    }));
  };

  return (
    <div className="mt-2 card border">
      <Heading name={t("Bank Reconciliation")} isBreadcrumb={true} />
      <div className="row p-2">
        <MultiSelectComp
          className="col-xl-2 col-md-4 col-sm-6 col-12"
          name="Centre"
          searchable={true}
          id="Centre"
          // placeholder={t("Branch Centre")}
          label={t("Branch Centre")}
          options={dropDonwState?.GetBindAllCenter}
          onChange={handleMultiSelectChange}
          value={payload?.Centre}
          requiredClassName={"required-fields"}
        />
        <CustomDateRangePicker
          name="dateRange"
          id="dateRange"
          labelKey="dateRange"
          label={t("Select Date Range")}
          startDate={payload?.fromDate || null}
          endDate={payload?.toDate || null}
          onChange={handleDateRangeChange}
          respClass="col-xl-2 col-md-4 col-sm-4 col-12"
        />

        <ReactSelect
          placeholderName={t("Bank Name")}
          id="BankName"
          name="BankName"
          value={payload?.BankName?.value}
          removeIsClearable={true}
          onChange={(name, e) => handleCurrencyChange(name, e)}
          dynamicOptions={dropDonwState?.BankName}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />

        <ReactSelect
          placeholderName={t("Currency")}
          id="Currency"
          // className={"required-fields"}
          name="Currency"
          // value={payload?.Currency?.value}
          value={payload?.BankName?.CurrencyCode}
          isDisabled={true}
          removeIsClearable={true}
          onChange={(name, e) => handleCurrencyChange(name, e)}
          dynamicOptions={filterByTypes(
            list,
            [4],
            ["TypeID"],
            "TextField",
            "ValueField",
            "STD_CODE"
          )}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <DatePicker
          className="custom-calendar"
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          id="ChequeDate"
          name="ChequeDate"
          value={payload?.ChequeDate}
          handleChange={handleChange}
          lable={t("Ref/Cheque Date")}
          placeholder={VITE_DATE_FORMAT}
          maxDate={new Date()}
        />

        <Input
          type="text"
          className="form-control"
          id="Cheque_no"
          name="Cheque_no"
          value={payload?.Cheque_no ? payload?.Cheque_no : ""}
          onChange={handleChange}
          lable={t("Ref/Cheque No")}
          placeholder=" "
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <Input
          type="text"
          className="form-control"
          id="Voucher_no"
          name="Voucher_no"
          value={payload?.Voucher_no ? payload?.Voucher_no : ""}
          onChange={handleChange}
          lable={t("Voucher No.")}
          placeholder=" "
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <ReactSelect
          placeholderName={t("Clear")}
          id="Clear"
          name="Clear"
          value={payload?.Clear?.value}
          removeIsClearable={true}
          onChange={(name, e) => handleCurrencyChange(name, e)}
          dynamicOptions={[
            { label: "Yes", value: "1" },
            { label: "No", value: "0" },
          ]}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          className={"required-fields"}
        />
        <div className="box-inner d-flex ">
          <button
            className="btn btn-sm btn-primary ml-2 mr-2"
            type="button"
            onClick={() => {
              handleSearch("0");
            }}
          >
            {t("Search")}
          </button>
          <ExcelUploader
            onDataExtracted={handleDataExtracted}
            title={t("Upload Excel")}
          />
          <span
            onClick={() => {
              handleSearch(1);
            }}
            className="ml-2"
          >
            <ExcelIconSVG />{" "}
          </span>
        </div>
      </div>

      {tableData?.length > 0 && (
        <>
          <div className="patient_registration">
            <Heading
              title={
                <>
                  {t("Selected Branch:")}{" "}
                  <strong className="ml-2">
                    {payload?.Centre?.map((item) => {
                      return item?.name;
                    }).join("  ,  ")}
                  </strong>
                </>
              }
            // secondTitle={
            //   <>

            //   </>
            // }
            />
            {/* {payload?.Centre?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                  marginTop: "5px",
                }}
              >
                <h1
                  style={{
                    marginRight: "10px",
                    fontWeight: "bolder",
                    marginTop: "5px",
                  }}
                >
                  {t("Selected Branch")}:{" "}
                </h1>
                <div className="col-4">
                  <div className="doctorBind">
                    <div className="doctorsName">
                      {payload?.Centre?.map((item) => {
                        return item?.name;
                      }).join("  ,  ")}
                    </div>
                  </div>
                </div>
                <div className="row ml-2">
                  <ColorCodingSearch
                    color={"rgba(24, 189, 79, 0.41)"}
                    label={t("Matched")}
                  />
                  <ColorCodingSearch
                    color={"#FFBDBD"}
                    label={t("Not Matched")}
                  />
                </div>
              </div>
            )} */}
            <div className=" spatient_registration_card">
              <HisTable
                style={{ maxHeight: "40vh" }}
                thead={thead}
                tbody={tableData?.map((ele, index) => ({
                  "S.No.": index + 1,
                  "Cheque No.": ele?.ChequeNo,
                  "Cheque Date": ele?.ChequeDate,
                  "Cheque Amount": ele?.SpecificAmount,
                  Status: ele?.cheque_status,
                  "Voucher No": ele?.VoucherNo,
                  "Voucher Date": ele?.VoucherDate,
                  "RC Cheque No.": ele?.RCChequeNo,
                  "RC Cheque Amount": ele?.RCChequeAmount,
                  checkbox: (
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={ele?.isChecked ? true : false}
                      onChange={(e) => handleRowSelect(index, e)}
                      disabled={ele?.isDisabled}
                    />
                  ),
                  Realization: (
                    <Input
                      className="table-input"
                      name="realization"
                      type="text" // ✅ Change type to "text" to allow letters
                      // display="right"
                      value={ele?.realization}
                      removeFormGroupClass={true}
                      onChange={(e) => handleInputChange(e, index)}
                    />
                  ),
                  Action: (
                    <>
                      <Tooltip
                        target={`#eye${index}`}
                        position="top"
                        content={t("View Details")}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <i
                        className="fa fa-eye"
                        id={`eye${index}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleTableDetails(ele, index)}
                      >
                        {/* {t("Details")} */}
                      </i>
                    </>
                  ),
                  colorcode:
                    excelData.length === 0
                      ? "white" // Before upload, keep white
                      : ele.matched && ele.amountMatched
                        ? "rgba(24, 189, 79, 0.41)" // Green for match
                        : ele.matched
                          ? "white"
                          : "rgba(212, 35, 16, 0.52)",
                }))}
              />
              <div className="row mt-2 p-2">
                <ReactSelect
                  placeholderName={t("Reconcile Bank")}
                  id="BankName"
                  name="BankName"
                  value={payload?.BankName?.value}
                  removeIsClearable={true}
                  handleChange={(name, e) => handleCurrencyChange(name, e)}
                  dynamicOptions={dropDonwState?.BankName}
                  searchable={true}
                  // className={"required-fields"}
                  isDisabled={true}
                  respclass="col-xl-2 col-md-4 col-sm-6 col-12"
                />
                <div className="col-xl-2 col-md-4 col-sm-6 col-12">
                  <LabeledInput
                    label={t("Reconciliation Amount")}
                    value={tableData
                      ?.filter((val) => val?.isChecked)
                      ?.reduce(
                        (acc, item) => acc + Number(item?.SpecificAmount || 0),
                        0
                      )}
                  />
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 col-12">
                  <LabeledInput
                    label={t("Un-Reconciliation")}
                    value={tableData
                      ?.filter((val) => !val?.isChecked)
                      ?.reduce(
                        (acc, item) => acc + Number(item?.SpecificAmount || 0),
                        0
                      )}
                  />
                </div>

                {tableData?.length > 0 && (
                  <div className="col-xl-2 col-md-4 col-sm-6 col-12">
                    <LabeledInput
                      label={t("Opening Balance")}
                      value={tableData[0]?.Opening}
                    />
                  </div>
                )}
                <div className="box-inner row">
                  {/* <button
                    className="btn btn-sm btn-primary ml-2"
                    type="upload"
                    onClick={handleUpload}
                  >
                    {t("Upload")}
                  </button> */}

                  <button
                    style={{ cursor: "pointer" }}
                    className="btn btn-sm btn-primary ml-2"
                    type="Download"
                    onClick={handleSave}
                  >
                    {t("Save")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <FinanceModal
        Header={modalState?.name}
        modalWidth={modalState?.size}
        visible={modalState?.show}
        setVisible={() => {
          handleModalState(false, null, null, null, <></>);
        }}
        footer={modalState?.footer}
      >
        {modalState?.component}
      </FinanceModal>
    </div>
  );
};

export default BankReconciliation;
