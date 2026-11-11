import React, { useEffect, useState } from "react";
import "./AdvanceRollingLedger.css";
import Heading from "../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import CustomTable from "../../components/Table/CustomTable";
import { formatIndianNumber, notify } from "../../utils/utils";
import Accordion from "../../components/UI/Accordion";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import excelIcon from "../../assets/image/excelIcon.png";
import pdfIcon from "../../assets/image/pdf.png";
import moment from "moment";
import { ExportToExcel } from "../../utils/helpers";
import { SearchButton } from "../../components/UI/CustomButton";

const AdvanceRollingLedger = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const headerCentreId = useLocalStorage("DefaultCentre", "get");
  const [advanceRollingLedger, setAdvanceRollignLedger] = useState([]);
  const [titleName,setTitlename]=useState("")
  const [dropdownList, setDropdownList] = useState({
    rateTypeList: [],
  });
  const [payload, setPayload] = useState({
    rateType: "",
    fromDate: new Date(),
    toDate: new Date(),
    PatientInfoGrouping:1
  });

  const handleReactSelectChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
    if(name==="rateType"){
    setTitlename(e?.label||"")
    }
  };


  const dateSelect = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const tableHeaders = [
    { header: "S.No", field: "SrNo", width: "3%" },
    { header: "Visit No.", field: "VisitNo", width: "10%" },
    { header: "Date", field: "TransactionDate", width: "10%" },
    { header: "Patient Info", field: "PatientInfo", width: "20%" },
    { header: "Test", field: "Investigation", width: "20%" },
    { header: "Description", field: "Description", width: "20%" },
    { header: "Opening Balance", field: "OpeningBalance", width: "20%" },
    { header: "Test Charge", field: "Charges", width: "20%" },
    { header: "Received Amount.", field: "Deposite", width: "20%" },
    { header: "Net Balance", field: "netBalance", width: "20%" },
  ];


  // Calculate total row dynamically
  const totalRow = {
    SrNo: "Total",
    VisitNo: "",
    date: "",
    PatientInfo: "",
    ItemName: "",
    description: "",
    openingBalance: advanceRollingLedger.reduce(
      (sum, row) => sum + (row.OpeningBalance || 0),
      0
    ),
    testChange: advanceRollingLedger.reduce(
      (sum, row) => sum + (row.TestCharges  || 0),
      0
    ),
    ReceivedAmount: advanceRollingLedger.reduce(
      (sum, row) => sum + (row.ReceivedAmount  || 0),
      0
    ),
    netBalance: advanceRollingLedger.reduce((sum, row) => sum + (row?.OpeningBalance + row?.TestCharges  - row?.ReceivedAmount  || 0), 0),
  };

  const getRateType = async () => {
    const rateTypePayload = {
      CentreID: Number(headerCentreId),
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls?.getRateTypeWithCentre, rateTypePayload)
      .then((res) => {
        let resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.RateTypeName,
          value: String(item?.RateTypeID),
        }));
        setDropdownList((prev) => ({ ...prev, rateTypeList: resList }));
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

const downloadPdf = () => {
  if (!payload?.rateType) {
    notify("kindly select RateType", "warn");
    return;
  }
  const payloadPdf = {
    rateTypeID: Number(payload?.rateType),
    fromDate: moment(payload?.fromDate).format("YYYY-MM-DD"),
    toDate: moment(payload?.toDate).format("YYYY-MM-DD"),
    grouping: Number(payload?.PatientInfoGrouping),
  };

  dispatch(setLoading(true));

  axiosReport
    .post("InvoiceRollingAdvanceLedger/GetReport/GetReport", payloadPdf, { responseType: "blob" })
    .then((res) => {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "AdvanceRollingLedger.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch((err) => {
      console.error("Error downloading PDF:", err);
      notify("Error downloading PDF. Please try again later.", "error");
    })
    .finally(() => {
      dispatch(setLoading(false));
    });
};



  const getAdvanceRollingLedger = async () => {
    if (!payload?.rateType) {
      notify("kindly select RateType", "warn");
      return;
    }
    const ledgerPayload = {
      typeName: "Invoice_RollingAdvanceLedger",
      params: [
        `${payload?.rateType}`,
        `${moment(payload?.fromDate)?.format("yyyy-MM-DD")}`,
        `${moment(payload?.toDate)?.format("yyyy-MM-DD")}`,
      ],
      Grouping:String(payload?.PatientInfoGrouping)
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls?.Fetchprocedure, ledgerPayload)
      .then((res) => {
        setAdvanceRollignLedger(res?.data?.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const formattedTableData = advanceRollingLedger?.map((item, idx) => {
    let netBalance = item?.OpeningBalance + item?.Charges - item?.Deposite;

    return {
      SrNo: idx + 1,
      VisitNo: item?.VisitNo || "",
      TransactionDate: item?.TransactionDate || "",
      PatientInfo: item?.PatientInfo || "",
      Investigation: item?.Investigation || "",
      Description: item?.DESCRIPTION || "",

      OpeningBalance: item?.OpeningBalance || "0",
      Charges: item?.TestCharges || "0",
      Deposite: item?.ReceivedAmount || "0",
      netBalance: (
        <span className={`${item?.netBalance < 0 ? "text-red" : item?.netBalance> 0 ?"text-green": "0"}`}>
          {item?.netBalance || "0"}
        </span>
      ),
    };
  });

  useEffect(() => {
    getRateType();
  }, []);

  console.log("efjwieofw", advanceRollingLedger);

  return (
    <>
      <div className="card ledger_rolling">
        <Heading title={t("Advance Rolling Report")} />

        {/* Filters */}
        <div className="row px-2 py-2">
          <div className="col-md-2 col-sm-3 col-12">
            <ReactSelect
              dynamicOptions={dropdownList?.rateTypeList}
              name="rateType"
              lable={t("Rate Type")}
              id="rateType"
              removeIsClearable={true}
              placeholderName={t("Rate Type")}
              value={payload?.rateType}
              onChange={handleReactSelectChange}
            />
          </div>
          <div className="col-md-2 col-sm-3 col-12">
            <DatePicker
              className="custom-calendar"
              name="fromDate"
              id="fromDate"
              placeholder="From Date"
              lable={t("From Date")}
              type="date"
              value={payload.fromDate}
              onChange={dateSelect}
              maxDate={new Date()}
            />
          </div>
          <div className="col-md-2 col-sm-3 col-12">
            <DatePicker
              className="custom-calendar"
              name="toDate"
              id="toDate"
              placeholder="To Date"
              lable={t("To Date")}
              type="date"
              value={payload.toDate}
              onChange={dateSelect}
              maxDate={new Date()}
            />
          </div>
                <div className="col-sm-2">
                    <ReactSelect
                        dynamicOptions={[{label:"Test",value:1},{label:"LabNo",value:2},{label:"Date",value:3}]}
                        value={payload?.PatientInfoGrouping}
                        onChange={handleReactSelectChange}
                        placeholderName={'Patient Info Grouping'}
                        name={'PatientInfoGrouping'}
                        id={'PatientInfoGrouping'}
                    />
                </div>
          <SearchButton
            text={"Search"}
            onClick={getAdvanceRollingLedger}
          />
        </div>

        {/* Notes */}
        <div style={{gap:'4px'}} className="d-flex align-items-end justify-content-between flex-wrap">
        <div className="px-2">
          <h2 style={{ fontWeight: "600" }} className="fw-bold text-red mb-0">
            {t("Note")}:-
          </h2>
          <div className="d-flex flex-column flex-md-row" style={{ gap: "2px 24px" }}>
            <span>
              <strong>1. {t("Advance (Negative Balance):")}</strong> {t("Means Client has already paid more than required.")}
            </span>
            <span>
              <strong>2. {t("Balance (Positive Balance)")}:</strong> {t("Means the client still has to pay")}
            </span>
          </div>
        </div>
        <div style={{gap:'6px'}} className="d-flex align-items-center justify-content-end px-2 mb-2">
              <div className="icon_wrapper">
                <img
                  onClick={downloadPdf}
                  width={24}
                  height={24}
                  title="click to export pdf"
                  src={pdfIcon}
                  alt="pdf_icon"
                />
              </div>
              <div className="icon_wrapper">
                <img
                  onClick={()=>ExportToExcel(formattedTableData)}
                  width={24}
                  height={24}
                  title="click to export excel"
                  src={excelIcon}
                  alt="excel_icon"
                />
              </div>
            </div>
        </div>
        <div className="px-1">
          <div className="mb-3">
            {/* <div style={{gap:'6px'}} className="d-flex align-items-center justify-content-end px-2 mb-2">
              <div className="icon_wrapper">
                <img
                  onClick={()=>ExportToExcel(formattedTableData)}
                  width={24}
                  height={24}
                  title="click to export pdf"
                  src={pdfIcon}
                  alt="excel_icon"
                />
              </div>
              <div className="icon_wrapper">
                <img
                  onClick={()=>ExportToExcel(formattedTableData)}
                  width={24}
                  height={24}
                  title="click to export excel"
                  src={excelIcon}
                  alt="excel_icon"
                />
              </div>
            </div> */}
            <Accordion
              name={t(titleName)}
              defaultValue={true}
              isBreadcrumb={true}
              linkTo="#"
              linkTitle={
                <div
                  className="link-title-container mt-2 d-none d-md-flex"
                  id="pr_id_11"
                >
                  <label>
                    {t("Opening Balance")} 
                    <span
                      className="text-danger"
                      style={{ marginLeft: "10px" }}
                    >
                      {formatIndianNumber(totalRow.openingBalance)}
                    </span>
                  </label>
                  |
                  <label>
                    {t("Test Charge")} :
                    <span
                      className="text-danger"
                      style={{ marginLeft: "10px" }}
                    >
                      {formatIndianNumber(totalRow.testChange)}
                    </span>
                  </label>
                  |
                  <label>
                    {t("Received Amount")} :
                    <span
                      className="text-danger"
                      style={{ marginLeft: "10px" }}
                    >
                      {formatIndianNumber(totalRow.ReceivedAmount)}
                    </span>
                  </label>
                  |
                  <label>
                    {t("Net Balance")} :
                    <span
                      className="text-danger"
                      style={{ marginLeft: "10px" }}
                    >
                      {formatIndianNumber(totalRow.netBalance)}
                    </span>
                  </label>
                </div>
              }
            >
              {/* table goes here */}
            </Accordion>
            <CustomTable columns={tableHeaders} data={formattedTableData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvanceRollingLedger;