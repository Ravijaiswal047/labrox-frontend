import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BindReportControlsAPI,
  GetBankReconciliationReport,
  GetStatementReport,
} from "../../../NetworkServices/finance.js";
import { useSelector } from "react-redux";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import {
  filterByTypes,
  handleReactSelectDropDownOptions,
  notify,
} from "../../utils/Utils";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import moment from "moment";
import Tables from "../../../components/UI/customTable";
import PayableTablePDF from "./PayableTablePDF";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";
import {
  exportHtmlToPDFNoPrint,
  exportToExcel,
} from "../../../utils/exportLibrary";
import { transformDataInTranslate } from "../../../components/WrapTranslate";
import ChartOfAccount from "./ChartOfAccount";
import {
  matchBaseCentreWithCentre,
  SelectedBranchCentre,
} from "../../../utils/constant";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import BankReconciliationReportTable from "./BankReconciliationReportTable";

const BankReconciliationReport = ({ dropDownlist, values }) => {
  const [t] = useTranslation();
    const newSession = useLocalStorage("newSession", "get");

  const [payloadData, setPayloadData] = useState({
    IsOnlyUnpaid: 0,
    IsOnlyPaid: 0,
    AsAt: newSession ? new Date(newSession) : new Date()
  });
  const [bankAc, setBankAc] = useState([]);
  const [reportControlList, setReportControlList] = useState([]);
  // const { GetEmployeeWiseCenter } = useSelector((state) => state.CommonSlice);
  const { VITE_DATE_FORMAT } = import.meta.env;
  const [tableData, setTableData] = useState([]);
  const userData = useLocalStorage("userData", "get");

  useEffect(() => {
    setPayloadData((val) => ({
      ...val,
      BranchCentre: [userData.MainCentreID],
    }));
  }, [values?.Centre?.length]);

  const getBindReportControls = async () => {
    let apiResp = await BindReportControlsAPI();
    if (apiResp?.success) {
      setReportControlList(apiResp?.data);
      console.log("the apiresponse is", apiResp?.data);
      const bankdata = apiResp?.data?.filter((val) => {
        return val?.TypeID == 4 && val?.GroupCode == "1002004";
      });
      setBankAc(bankdata);
      console.log("the bank data in state is", bankdata);
    } else {
      setReportControlList([]);
    }
  };
  useEffect(() => {
    getBindReportControls();
  }, []);
  const handleMultiSelectChange = (name, selectedOptions) => {
    setPayloadData({
      ...payloadData,
      [name]: selectedOptions,
    });
  };
  const handleChange = (e) => {
    setPayloadData((val) => ({ ...val, [e.target.name]: e.target.value }));
  };
  

  const handleSearchBankReconciliation = async () => {
    if(values?.Centre?.length == 0){
      notify("Please select centre", "error");
      return;
    }else if(payloadData?.BranchCentre?.length===0){
      notify("Please select branch centre", "error");
      return;
    }else if(!payloadData?.coa_cog_wise?.ValueField){
      notify("Please select chart of account", "error");
      return;
    }
    let BranchCentre = payloadData?.BranchCentre?.map((val) => val).join(
      ","
    );
    let centreID = values?.Centre?.map((val) => val).join(",");
    const payload = {
      type: Number(values?.Type?.value || 0),
      centreID: centreID || "",
      branchCentreID: BranchCentre || "",
      coaID: Number(payloadData?.coa_cog_wise?.ValueField || ""),
      asOnDate: moment(payloadData?.AsAt).format("DD-MMM-YYYY") || "",
    };

    try {
      const apiResp = await GetBankReconciliationReport(payload);
      if (apiResp.success) {
        setTableData(apiResp?.data);
      } else {
        notify("No records found", "error");
      }
    } catch (error) {
      console.error("Error while fetching data:", error);
      notify("An error occurred while fetching data", "error");
    }
  };

  const handleExportExcel = async (tableData) => {
    // let apiResp = await GetBankChargesUploadExcel();
    if (tableData) {
      exportToExcel(
        transformDataInTranslate(tableData, t),
        "Purchase Bill Due"
      );
    } else {
      notify("no Data Found", "error");
    }
  };

  const handleExportPDF = () => {
    exportHtmlToPDFNoPrint("printSection", "Bank Reconciliation Report");
  };

  const thead = [
    { width: "5%", name: t("Date") },
    { width: "2%", name: t("Voucher No") },
    { width: "2%", name: t("Description") },
    { width: "2%", name: t("Ref No") },
    { width: "2%", name: t("INR") },
  ];

  return (
    <>
      <MultiSelectComp
        className="col-xl-2 col-md-4 col-sm-6 col-12"
        name="BranchCentre"
        id="BranchCentre"
        // placeholderName={t("Branch Centre")}
        label={t("Branch Centre")}
        options={matchBaseCentreWithCentre(
          dropDownlist?.BranchCentre,
          values?.Centre
        )}
        // dynamicOptions={dropDownlist?.BranchCentre}
        onChange={handleMultiSelectChange}
        value={payloadData?.BranchCentre}
        requiredClassName={`required-fields`}
      />

      <ChartOfAccount
        label={"Bank A/C"}
        dropDownlist={dropDownlist}
        VoucherType={"B"}
        setOldPayloadData={setPayloadData}
        Currency={payloadData?.Currency?.value}
        required={true}
      />

      <DatePicker
        className="custom-calendar"
        placeholder={VITE_DATE_FORMAT}
        lable={t("As At")}
        respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
        name="AsAt"
        id="AsAt"
        maxDate={new Date()}
        value={
          payloadData?.AsAt
        }
        showTime
        hourFormat="12"
        handleChange={(date) => handleChange(date, "AsAt")}
      />

      <div className="col-xl-1 col-md-1 col-sm-2 col-4  mb-2">
        <button
          className="btn btn-sm btn-primary  w-100   "
          onClick={handleSearchBankReconciliation}
          type="button"
        >
          {t("Search")}
        </button>
      </div>

      {tableData.length > 0 && (
        <div id="printSection" className="w-100">
          {/* <Heading
            title={t("Bank Reconciliation Report")}
          
          /> */}
          <div className="card">
           <BankReconciliationReportTable bodyData={tableData} values={values} payloadData={payloadData}/>

            {/* <Tables
              thead={thead}
              tbody={tableData?.map((val) => ({
                Date: val?.VoucherDate || "",
                VoucherNo: val.VoucherNo || "",
                Description: val.Remarks || "",
                RefNo: val?.RefNo || "",
                INR: val?.Amount||"0.00",
              }))}
              tableHeight={"scrollView"}
              style={{ height: "60vh", padding: "2px" }}
            /> */}
          </div>
        </div>
      )}
    </>
  );
};

export default BankReconciliationReport;
