import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Accordion from "../../../components/UI/Accordion";
import DatePicker from "../../../components/formComponent/DatePicker";
import CustomTable from "../../../components/Table/CustomTable";
import Tooltip from "../../../components/formComponent/Tooltip";
import { ExportToExcel } from "../../../utils/helpers";
import excelicon from "../../Images/excelicon.png";
import FilterInput from "../../../components/Filter/FilterInput";
import { useNavigate } from "react-router-dom";
import SeeMore from "../../SampleStorage/frameMenu/SeeMore";
import PettyCashDashboard from "../pettyCashDashboard/PettyCashDashboard";
import PettyCashTransfer from "../pettyCashTransfer/PettyCashTransfer";
import ExpenseTypeMaster from "../expenseTypeMaster/ExpenseTypeMaster";
import CenterExpensesEntry from "../centerExpensesEntry/CenterExpensesEntry";
import Heading from "../../../components/UI/Heading";
import { ViewMenu } from "../../../components/SvgIcons";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiEndpoints";
import { notify } from "../../../utils/utils";
import moment from "moment";

const PettyCashLedgerReport = () => {
  const ledgerviewlist = [
    { value: "LedgerSummaryTransaction", label: "LedgerSummaryTransaction" },
    { value: "LedgerSummaryDaily", label: "LedgerSummaryDaily" },
    { value: "LedgerSummaryMonthly", label: "LedgerSummaryMonthly" },
    { value: "LedgerSummaryCentre", label: "LedgerSummaryCentre" },
  ];

  const headers = [
    { header: "S.No.",          field: "sNo",            width: "5%" },
    { header: "Centre Name",    field: "CentreName" },
    { header: "Date",           field: "Date" },
    { header: "Txn Type",       field: "TxnType" },
    { header: "Description",    field: "Description" },
    { header: "Amt Received",   field: "AmountReceived" },
    { header: "Amt Paid",       field: "AmountPaid" },
    { header: "Balance",        field: "RunningBalance" },
  ];

  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filterTableData, setFilterTableData] = useState([]);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [centredata, setCentredata] = useState([]);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  const seeMoreData = [
    {
      name: "Petty Cash Dashboard",
      component: <PettyCashDashboard setShowMore={setShowMore} />,
      url: "/dashboard#pettycash",
    },
    {
      name: "Petty Cash Transfer",
      component: <PettyCashTransfer setShowMore={setShowMore} />,
      url: "/pettycash/petty-cash-transfer",
    },
    {
      name: "Petty Cash Ledger Report",
      component: <PettyCashLedgerReport setShowMore={setShowMore} />,
      url: "/pettycashledger/petty-cash-ledger-report",
    },
    {
      name: "Expense Type Master",
      component: <ExpenseTypeMaster setShowMore={setShowMore} />,
      url: "/pettycashledger/expense-type-master",
    },
    {
      name: "Centre Expense",
      component: <CenterExpensesEntry setShowMore={setShowMore} />,
      url: "/centerexpenseentry/center-expense-entry",
    },
  ];

  const [formData, setFormData] = useState({
    centreID: "",
    fromDate: new Date(),
    toDate: new Date(),
    reportType: ledgerviewlist?.[0]?.value,
  });

  const fetchAllCenter = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setCentredata(val);
      })
      .catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fromDateStr = moment(formData?.fromDate)?.format("YYYY-MM-DD");
    const toDateStr = moment(formData?.toDate)?.format("YYYY-MM-DD");

    const requestData = {
      centreID: formData?.centreID || 0,
      fromDate: `${fromDateStr}T00:00:00`,
      toDate: `${toDateStr}T23:59:59`,
      reportType: formData?.reportType,
      expenseID: 0,
    };

    await axiosInstance
      .post("Pettycash/GetLedgerEntries", requestData)
      .then((res) => {
        if (res.data.isSuccess === true) {
          const entries = res?.data?.message?.entries || [];
          setSummary(res?.data?.message?.summary || null);
          setTableData(entries);
          setFilterTableData(entries);
        } else {
          notify(res?.data?.message, "error");
          setTableData([]);
          setFilterTableData([]);
          setSummary(null);
        }
      })
      .catch((err) => {
        console.log(err);
        notify(err?.response?.data?.message || "Failed to load ledger", "error");
      });
  };

  const handleFilterInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilterInputValue(value);

    const filtered = tableData.filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key] ?? "").toLowerCase().includes(value)
      )
    );
    setFilterTableData(filtered);
  };

  useEffect(() => { fetchAllCenter(); }, []);
  useEffect(() => { setFilterTableData(tableData); }, [tableData]);

  const handleSelectChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e.value }));
  };

  const dateSelect = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };

  const renderTable = () => (
    <CustomTable
      columns={headers}
      data={filterTableData.map((item, index) => ({
        sNo:            index + 1,
        CentreName:     item?.CentreName   || "-",
        Date:           item?.Date ? moment(item.Date).format("DD-MM-YYYY") : "-",
        TxnType:        item?.TxnType      || "-",
        Description:    item?.Description  || "-",
        AmountReceived: item?.AmountReceived ?? "-",
        AmountPaid:     item?.AmountPaid    ?? "-",
        RunningBalance: item?.RunningBalance ?? "-",
      }))}
    />
  );

  return (
    <>
      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}
      <div className="card">
        <Heading
          name={"Petty Cash Ledger Report"}
          isBreadcrumb={true}
          secondTitle={
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          }
        />

        {/* Search Form */}
        <form onSubmit={handleSubmit}>
          <div className="row p-2 d-flex align-items-center">
            <ReactSelect
              name="reportType"
              id="reportType"
              removeIsClearable={true}
              isShowBorder={true}
              dynamicOptions={ledgerviewlist}
              placeholderName="Ledger View"
              value={formData?.reportType}
              onChange={handleSelectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <ReactSelect
              name="centreID"
              id="centreID"
              removeIsClearable={true}
              isShowBorder={true}
              dynamicOptions={centredata}
              placeholderName="Center"
              value={formData?.centreID}
              onChange={handleSelectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <DatePicker
              className="custom-calendar"
              name="fromDate"
              value={formData?.fromDate}
              id="fromDate"
              lable="FromDate"
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              onChange={dateSelect}
            />
            <DatePicker
              className="custom-calendar"
              name="toDate"
              value={formData?.toDate}
              id="toDate"
              lable="ToDate"
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              onChange={dateSelect}
            />
            <div className="col-sm-2 d-flex align-items-center gap-5">
              <button
                type="submit"
                className="btn btn-sm btn block btn-success px-5"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Export + Filter */}
        <div
          style={{ gap: "4px" }}
          className="d-flex align-items-end flex-grow-1 justify-content-end my-2 px-2"
        >
          <div style={{ gap: "4px" }} className="excel_exp d-flex">
            <Tooltip position="top" target=".excel-icon" />
            <img
              onClick={() => ExportToExcel(filterTableData)}
              src={excelicon}
              alt="Export to Excel"
              className="excel-icon"
              data-pr-tooltip="Export Active Data"
              style={{ width: "26px", height: "26px", cursor: "pointer" }}
            />
          </div>
          <FilterInput
            value={filterInputValue}
            onChange={handleFilterInputChange}
            placeholder="Filter Table"
          />
        </div>

        <Accordion
          defaultValue={true}
          title={t("Petty Cash Ledger Report Details")}
        />

        {/* Table */}
        <div className="mt-1 table_ticket">{renderTable()}</div>

        {/* Totals */}
        {summary && (
          <div className="px-4 py-2">
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <span className="text-success" style={{ fontWeight: 600 }}>
                Total Credits : ₹{summary?.totalCredits ?? 0}
              </span>
              <span className="text-danger" style={{ fontWeight: 600 }}>
                Total Debits : ₹{summary?.totalDebits ?? 0}
              </span>
              <span style={{ fontWeight: 600, color: (summary?.netBalance ?? 0) < 0 ? "#dc2626" : "#16a34a" }}>
                Net Balance : ₹{summary?.netBalance ?? 0}
              </span>
              <span className="text-secondary" style={{ fontWeight: 600 }}>
                Total Entries : {summary?.totalEntries ?? 0}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PettyCashLedgerReport;
