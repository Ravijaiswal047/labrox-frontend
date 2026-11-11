import React, { useEffect, useState } from "react";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import moment from "moment";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { GoArrowUpLeft } from "react-icons/go";
import { formatIndianNumber, notify } from "../../utils/utils";
import { Button } from "react-bootstrap";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { apiUrls } from "../../utils/apiUrls";
import ExcelActiveIcon from "../../assets/image/excelIcon.png";
import redExcel from "../../assets/image/redExcel.png";
import { ExportToExcel, formatCurrency } from "../../utils/helpers";
import { useDispatch } from "react-redux";
import CustomTable from "../../components/Table/CustomTable";
import { getAccurateAge } from "../../utils/Constants";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocation, useNavigate } from "react-router-dom";

const LedgerTransaction = () => {
  const theme = useLocalStorage("theme", "get");
  const location = useLocation();
  const navigate = useNavigate();
  const { SessionRateTypeID } = useLocalStorage("userData", "get");
  const dispatch = useDispatch();
  const [data, setData] = useState({
    rateTypeOption: [],
    rateTypeId: "",
    fromDate: new Date(),
    toDate: new Date(),
    searchResult: "",
    isPrint: false,
    RateTypeID: "",
    OpeningAmount: "",
    BillAmount: "",
    ClosingAmount: "",
    AmountDeposit: "",
    panelname: "",
    creditlimit: "",
    clientName: "",
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [tnxDeails, setTnxDetails] = useState([]);
  const { t } = useTranslation();
  const isMobile = window.innerWidth >= 760;
  const DefaultCurrencyName = useLocalStorage(
    "userData",
    "get",
  )?.DefaultCurrencyName;

  console.log("data hello", data);
  const getAccessRateType = () => {
    axiosInstance
      .post("Accounts/GetRateTypeByGlobalCentre", {
        TypeId: "",
      })
      .then((res) => {
        let data = res.data.message;
        let response = data.map((ele) => {
          return {
            value: ele.RateTypeID,
            label: ele.RateTypeName,
          };
        });
        if (response?.length == 1) {
          setData((prev) => ({ ...prev, RateTypeID: response[0]?.value }));
        }
        setData((data) => ({ ...data, rateTypeOption: response }));
      })
      .catch((err) => console.log(err));
  };

  const getBindPupDataReport = async () => {
    if (!data?.RateTypeID) {
      notify("Kindly select Client Name.", "warn");
      return;
    }
    setLoading(true);
    await axiosReport
      .post(
        "/commonReports/BindPupDataReport",
        {
          rateTypeId: String(data?.RateTypeID),
          FromDate: moment(data?.fromDate).format("DD-MMM-YYYY"),
          ToDate: moment(data?.toDate).format("DD-MMM-YYYY"),
          documentType: 0,
          data: tableData,
        },
        { responseType: "blob" },
      )
      .then((res) => {
        const fileURL = window.URL.createObjectURL(res.data);
        window.open(fileURL, "_blank");
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", `${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoading(false);
      });
  };

  // useEffect(()=>{
  //   if(location?.state?.id){
  //     setData(prev=>({...prev,
  //       RateTypeID: String(location?.state?.id),
  //     }))
  //     handleSearch(String(location?.state?.id))
  //   }
  // },[location?.state?.id])

  useEffect(() => {
    if (location?.state?.id) {
      setData((prev) => ({
        ...prev,
        RateTypeID: String(location.state.id),
      }));
    }
  }, [location?.state?.id]);

  useEffect(() => {
    if (data.RateTypeID) {
      handleSearch(data.RateTypeID);
    }
  }, [data.RateTypeID]);

  useEffect(() => {
    getAccessRateType();
  }, []);

  const dateSelect = (date, name, value) => {
    if (name === "fromDate") {
      const updateDate = new Date(data?.toDate) - date < 0 ? date : data.toDate;
      setData({ ...data, [name]: date, toDate: updateDate });
    } else {
      setData({ ...data, [name]: date });
    }
  };

  const handleSearch = (RateTypeParam = "") => {
    const RateTypeId = RateTypeParam || data.RateTypeID;
    if (RateTypeId) {
      setLoading(true);

      axiosInstance
        .post("Accounts/BindPUPData", {
          RateTypeId: String(data?.RateTypeID) || String(RateTypeParam),
          FromDate: moment(data?.fromDate).format("DD-MMM-YYYY"),
          ToDate: moment(data?.toDate).format("DD-MMM-YYYY"),
        })
        .then((res) => {
          const responseData = res.data.message;

          setData((prev) => ({
            ...prev,
            creditlimit: responseData?.creditlimit ?? 0,
            OpeningAmount: responseData.openingAmount,
            BillAmount: responseData.billAmount,
            ClosingAmount: responseData.closingAmount,
            AmountDeposit: responseData.amountDeposit,
            panelname: responseData?.panelname,
            clientName: responseData?.clientName,
          }));

          setTableData(responseData.data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setData({
        ...data,
        creditlimit: "",
        OpeningAmount: "",
        BillAmount: "",
        ClosingAmount: "",
        AmountDeposit: "",
        panelname: "",
      });
      setTableData([]);
      toast.error("Please Select any Rate type");
    }
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "RateTypeID") {
      setData({ ...data, [label]: String(value?.value) });
    }
    //navigate(`/LedgerTransaction/${value?.value}`, {state:{id:value?.value}})
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((data) => ({
      ...data,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const getBindPupData_UnBilledDetail = async (...args) => {
    setLoading(true);
    await axiosInstance
      .post(apiUrls?.BindPupData_UnBilledDetail, {
        rateTypeId: data?.RateTypeID?.toString(),
        fromDate: data?.fromDate,
        toDate: data?.toDate,
      })
      .then((res) => {
        console.log("res>>>", res);
        setTnxDetails(
          Array.isArray(res?.data?.message) ? res?.data?.message : [],
        );
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (show) {
      getBindPupData_UnBilledDetail();
    }
  }, [show]);

  const columns = [
    { header: "Sr. No", field: "SrNo", width: "5%" },
    { header: "Registration Date", field: "RegDate", width: "12%" },
    { header: "VisitNo", field: "VisitNo", width: "12%" },
    { header: "Patient Name", field: "PName", width: "20%" },
    { header: "Age", field: "Age", width: "10%" },
    { header: "Gender", field: "Gender", width: "10%" },
    { header: "BarcodeNo", field: "BarcodeNo", width: "12%" },
    { header: "Test Code", field: "TestCode", width: "10%" },
    { header: "Item Name", field: "ItemName", width: "25%" },
    { header: "Net Amount", field: "NetAmt", width: "8%" },
    { header: "Charged Amount", field: "BillAmt", width: "8%" },
  ];

  // const renderData = tnxDeails.map((row, index) => ({
  //   SrNo: index + 1,
  //   ...row,
  //   Age: getAccurateAge(row?.Age),
  //   BillAmt: row.BillAmt,
  // }));

  const grouped = (Array.isArray(tnxDeails) ? tnxDeails : []).reduce(
    (acc, row) => {
      const key = `${row.RegDate}_${row.VisitNo}_${row.PName}_${row.Age}_${row.Gender}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    },
    {},
  );

  let sr = 1;
  const renderData = Object.values(grouped).flatMap((group) =>
    group.map((row, index) => ({
      SrNo: index === 0 ? sr++ : ",,",

      RegDate: index === 0 ? row.RegDate : ",,",
      VisitNo: index === 0 ? row.VisitNo : ",,",
      PName: index === 0 ? row.PName : ",,",
      Age: index === 0 ? getAccurateAge(row.Age) : ",,",
      Gender: index === 0 ? row.Gender : ",,",

      // Always show these
      BarcodeNo: row.BarcodeNo || "-",
      TestCode: row.TestCode || "-",
      ItemName: row.ItemName || "-",
      NetAmt: formatCurrency(row.NetAmt || "-"),
      BillAmt: formatCurrency(row.BillAmt || "-"),
    })),
  );

  const handleOpenModal = () => {
    setShow(true);
  };

  const netPayable = (...args) => {
    return args.reduce((sum, val) => sum + Number(val || 0), 0);
  };

  console.log("data?.fromDate:::", data?.fromDate);

  return (
    <>
      <Accordion
        name={t("Credit Ledger")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2 ">
            <ReactSelect
              dynamicOptions={data?.rateTypeOption ?? []}
              name="RateTypeID"
              lable={t("RateType")}
              id="RateTypeID"
              removeIsClearable={true}
              placeholderName={t("RateType")}
              c
              value={data?.RateTypeID}
              onChange={handleSearchSelectChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-2 ">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="fromDate"
              lable="FromDate"
              name="fromDate"
              value={new Date(data?.fromDate)}
              onChange={dateSelect}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              name="toDate"
              value={new Date(data?.toDate)}
              className="custom-calendar"
              placeholder=" "
              id="ToDate"
              lable="ToDate"
              onChange={dateSelect}
              minDate={new Date(data?.fromDate)}
            />
          </div>

          <div className="col-sm-2 d-flex" style={{ gap: "8px" }}>
            <SearchButton text={"Search"} onClick={() => handleSearch("")} />
            <CustomButton
              text={"Print"}
              icon={"pdf"}
              onClick={getBindPupDataReport}
            />
          </div>
        </div>
      </Accordion>
      <>
        <div className="card">
          <div className="px-2 pt-2 pb-1">
            <div
              style={{
                background: "#fff8e1",
                border: "1px solid #ffcc80",
                borderRadius: "8px",
                padding: "10px 14px",
              }}
            >
              <p
                style={{
                  fontWeight: "700",
                  color: "#e65100",
                  marginBottom: "3px",
                  fontSize: "14px",
                }}
              >
                {t("Note")} :-
                <div
                  className="d-flex flex-column flex-md-row"
                  style={{
                    marginBottom: 0,
                    fontSize: "13px",
                    color: "#555",
                    gap: "2px 24px",
                  }}
                >
                  <span>
                    <strong>1. {t("Advance (Negative Balance):")}</strong>{" "}
                    {t("Means Client has already paid more than required.")}
                  </span>
                  <span>
                    <strong>2. {t("Balance (Positive Balance)")}:</strong>{" "}
                    {t("Means the client still has to pay")}
                  </span>
                </div>
              </p>

            </div>
          </div>
          <div
            className="d-flex flex-wrap px-2 py-2"
            style={{
              gap: "6px 24px",
              background: "#f0f4ff",
              borderTop: "1px solid #dce3f5",
              borderBottom: "1px solid #dce3f5",
              margin: "6px 0",
            }}
          >
            <span
              style={{ fontWeight: "700", fontSize: "13px", color: "#c62828" }}
            >
              {t("Total Debit")} ={" "}
              {formatCurrency(
                (Array.isArray(tableData) ? tableData : []).reduce(
                  (acc, current) => acc + current.debit,
                  0,
                ),
              )}
            </span>
            <span
              style={{ fontWeight: "700", fontSize: "13px", color: "#2e7d32" }}
            >
              {t("Total Credit")} ={" "}
              {formatCurrency(
                (Array.isArray(tableData) ? tableData : []).reduce(
                  (acc, current) => acc + current.credit,
                  0,
                ),
              )}
            </span>
          </div>
          <>
            <div
              className={theme}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                border: "1px solid #e0e7ff",
                marginTop: "10px",
              }}
            >
              {/* Header */}
              <div
                className="bg-color-container"
                style={{
                  padding: "6px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {t("Client")}
                </span>
                <span
                  style={{ color: "#fff", fontSize: "14px", fontWeight: "700" }}
                >
                  {tableData[0]?.panelname || data?.clientName || "—"}
                </span>
              </div>

              {/* Info rows */}
              <div style={{ background: "#fff", padding: "4px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "400",
                    }}
                  >
                    {t("CLOSING BALANCE")}
                  </span>
                  <span
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: data?.ClosingAmount > 0 ? "#dc2626" : "#16a34a",
                    }}
                  >
                    {data?.ClosingAmount
                      ? formatCurrency(
                        Number(data.ClosingAmount).toLocaleString("en-IN"),
                      )
                      : 0}
                  </span>
                </div>

                {SessionRateTypeID > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        fontWeight: "400",
                      }}
                    >
                      {t("CREDIT LIMIT")}
                    </span>
                    <span
                      style={{
                        fontWeight: "500",
                        fontSize: "13px",
                        color: "#1e3a8a",
                      }}
                    >
                      {data?.creditlimit
                        ? Number(data.creditlimit).toLocaleString("en-IN")
                        : 0}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderBottom: "1px solid #f1f5f9",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "400",
                    }}
                  >
                    {t("TESTING CHARGES AFTER LAST CREDIT BILL")}
                  </span>
                  <span
                    style={{
                      fontWeight: "500",
                      fontSize: "13px",
                      color: "#1e3a8a",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {data?.BillAmount
                      ? formatCurrency(
                        Number(data.BillAmount).toLocaleString("en-IN"),
                      )
                      : 0}
                    {data?.BillAmount != 0 && (
                      <Button
                        onClick={handleOpenModal}
                        className="rounded py-0 px-2"
                        style={{ fontSize: "11px", lineHeight: "1.4" }}
                      >
                        <GoArrowUpLeft fontSize={14} />
                      </Button>
                    )}
                  </span>
                </div>

                {/* Net Payable — highlighted */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 10px",
                    background:
                      "linear-gradient(90deg, #f0f4ff 0%, #e8f5e9 100%)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1e3a8a",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {t("NET PAYABLE")}
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color:
                        netPayable(data?.ClosingAmount, data?.BillAmount) > 0
                          ? "#dc2626"
                          : "#16a34a",
                    }}
                  >
                    {formatCurrency(
                      new Intl.NumberFormat("en-IN").format(
                        netPayable(data?.ClosingAmount, data?.BillAmount),
                      ),
                    )}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <Loading />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="d-none d-md-block">
                  <Tables
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: "0",
                    }}
                  >
                    <thead className="text-center cf" style={{ zIndex: 99 }}>
                      <tr>
                        <th style={{ width: "4%", whiteSpace: "nowrap", padding: "10px 15px" }}>
                          {t("S.No")}
                        </th>
                        <th style={{ width: "9%", whiteSpace: "nowrap", padding: "10px 15px" }}>
                          {t("Bill Date")}
                        </th>
                        <th style={{ width: "12%", whiteSpace: "nowrap", padding: "10px 15px" }}>
                          {t("InvoiceNo./ReceiptNo.")}
                        </th>
                        <th style={{ width: "12%", whiteSpace: "nowrap", padding: "10px 15px" }}>
                          {t("TransactionID")}
                        </th>
                        <th style={{ width: "120px", whiteSpace: "nowrap", padding: "10px 15px" }}>{t("RrNo")}</th>
                        <th style={{ textAlign: "left", padding: "10px 15px" }}>
                          {t("Particulars")} <br /> {t("Opening Balance")}
                        </th>
                        <th style={{ width: "11%", whiteSpace: "nowrap", padding: "10px 15px" }}>
                          {t("Debit Amount")} <br />
                          {data.ClosingAmount < 0
                            ? formatCurrency(new Intl.NumberFormat("en-IN").format(data.ClosingAmount))
                            : ""}
                        </th>
                        <th style={{ width: "11%", whiteSpace: "nowrap", padding: "10px 15px" }}>
                          {t("Credit Amount")} <br />
                          {data.OpeningAmount > 0
                            ? formatCurrency(new Intl.NumberFormat("en-IN").format(data.OpeningAmount))
                            : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((ele, index) => (
                        <tr key={index}>
                          <td data-title="S.No" style={{ width: "4%", whiteSpace: "nowrap", textAlign: "center" }}>
                            {index + 1}
                          </td>
                          <td data-title="Bill Date" style={{ width: "9%", whiteSpace: "nowrap" }}>
                            {ele?.BillDate || "-"}
                          </td>
                          <td data-title="InvoiceNo./ReceiptNo." style={{ width: "12%", whiteSpace: "nowrap" }}>
                            {ele?.invoiceno || "-"}
                          </td>
                          <td data-title="TransactionID" style={{ width: "12%", wordBreak: "break-word" }}>
                            {ele?.TransactionID || "-"}
                          </td>
                          <td data-title="RrNo"
                            style={{
                              width: "120px",
                              maxWidth: "120px",
                              wordBreak: "break-word",
                              whiteSpace: "normal"
                            }}
                          >{ele?.RrnNo || "-"}</td>
                          <td data-title="Particulars" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                            {ele?.period || " "}
                          </td>
                          <td data-title="Debit Amount" className="px-2" style={{ width: "11%", textAlign: "left" }}>
                            {formatCurrency(new Intl.NumberFormat("en-IN").format(ele?.debit || "0"))}
                          </td>
                          <td data-title="Credit Amount" className="px-2" style={{ width: "11%", textAlign: "left" }}>
                            {formatCurrency(new Intl.NumberFormat("en-IN").format(ele?.credit || "0"))}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ color: "red" }}>
                        <td colSpan={5}></td>
                        <td style={{ fontWeight: "bold" }}>Total</td>
                        <td className="px-2" style={{ fontWeight: "bold" }}>
                          {formatCurrency(
                            new Intl.NumberFormat("en-IN").format(
                              (Array.isArray(tableData) ? tableData : []).reduce(
                                (acc, current) => acc + Number(current.debit || 0), 0,
                              ),
                            ),
                          )}
                        </td>
                        <td className="px-2" style={{ fontWeight: "bold" }}>
                          {new Intl.NumberFormat("en-IN").format(
                            (Array.isArray(tableData) ? tableData : []).reduce(
                              (acc, current) => acc + Number(current.credit || 0), 0,
                            ),
                          )}
                        </td>
                      </tr>
                      <tr style={{ color: "red" }}>
                        <td colSpan={6}></td>
                        <td colSpan={2}>
                          <span style={{ fontSize: "15px", fontWeight: "bold", marginLeft: "30px" }}>
                            {t("ClosingAmount")} :{" "}
                          </span>
                          <span
                            className={`${data?.ClosingAmount < 0 ? "text-green" : "text-red"}`}
                            style={{ fontSize: "15px", fontWeight: "bold" }}
                          >
                            {DefaultCurrencyName !== "KES" ? "" : ""}
                            {formatCurrency(new Intl.NumberFormat("en-IN").format(data?.ClosingAmount))}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </Tables>
                </div>

                {/* Mobile Card View */}
                <div className="d-md-none" style={{ padding: "8px" }}>
                  {tableData.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#999", fontSize: "13px" }}>
                      No records found
                    </div>
                  ) : (
                    <>
                      {tableData.map((ele, index) => (
                        <div
                          key={index}
                          style={{
                            background: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                            marginBottom: "10px",
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              padding: "7px 12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ color: "#fff", fontWeight: "700", fontSize: "12px" }}>
                              #{index + 1}
                            </span>
                            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px" }}>
                              {ele?.BillDate || "-"}
                            </span>
                          </div>
                          <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                              <span style={{ color: "#64748b", fontSize: "11px", fontWeight: "600" }}>
                                {t("InvoiceNo./ReceiptNo.")}
                              </span>
                              <span style={{ fontSize: "12px", fontWeight: "500" }}>
                                {ele?.invoiceno || "-"}
                              </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#64748b", fontSize: "11px", fontWeight: "600" }}>
                                {t("TransactionID")}
                              </span>
                              <span style={{ fontSize: "12px", fontWeight: "500", wordBreak: "break-all", maxWidth: "60%", textAlign: "right" }}>
                                {ele?.TransactionID || "-"}
                              </span>
                            </div>
                          </div>
                          {ele?.period && (
                            <div style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "600", marginBottom: "2px" }}>
                                {t("Particulars")}
                              </div>
                              <div style={{ fontSize: "12px", fontWeight: "500" }}>
                                {ele.period}
                              </div>
                            </div>
                          )}
                          <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "600" }}>
                                {t("Debit Amount")}
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626" }}>
                                {formatCurrency(new Intl.NumberFormat("en-IN").format(ele?.debit || "0"))}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "600" }}>
                                {t("Credit Amount")}
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>
                                {formatCurrency(new Intl.NumberFormat("en-IN").format(ele?.credit || "0"))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Mobile Total + Closing */}
                      <div
                        style={{
                          background: "#fff8e1",
                          border: "1px solid #ffcc80",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          marginBottom: "10px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontWeight: "700", color: "#c62828", fontSize: "13px" }}>
                            {t("Total Debit")}
                          </span>
                          <span style={{ fontWeight: "700", color: "#c62828", fontSize: "13px" }}>
                            {formatCurrency(
                              new Intl.NumberFormat("en-IN").format(
                                (Array.isArray(tableData) ? tableData : []).reduce(
                                  (acc, c) => acc + Number(c.debit || 0), 0,
                                ),
                              ),
                            )}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: "700", color: "#2e7d32", fontSize: "13px" }}>
                            {t("Total Credit")}
                          </span>
                          <span style={{ fontWeight: "700", color: "#2e7d32", fontSize: "13px" }}>
                            {new Intl.NumberFormat("en-IN").format(
                              (Array.isArray(tableData) ? tableData : []).reduce(
                                (acc, c) => acc + Number(c.credit || 0), 0,
                              ),
                            )}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: "linear-gradient(90deg, #f0f4ff 0%, #e8f5e9 100%)",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: "700", fontSize: "13px", color: "#1e3a8a" }}>
                          {t("ClosingAmount")}
                        </span>
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "15px",
                            color: data?.ClosingAmount < 0 ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {DefaultCurrencyName !== "KES" ? "" : ""}
                          {formatCurrency(new Intl.NumberFormat("en-IN").format(data?.ClosingAmount))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        </div>
      </>
      <Dialog
        visible={show}
        className={theme}
        header={t("Transaction Details")}
        onHide={() => {
          setShow();
        }}
        style={{
          width: isMobile ? "75vw" : "95vw",
        }}
      >
        <div className="px-2">
          <p className="mb-0">
            <strong>Client Name:</strong>
            <span className="mx-2">
              {tableData[0]?.panelname || data?.clientName}
            </span>
          </p>
        </div>
        <div
          style={{ gap: "1rem", fontWeight: 700 }}
          className="d-flex align-items-center justify-content-between px-2"
        >
          <div style={{ gap: "8px" }} className="d-flex">
            <h1 style={{ fontWeight: 700 }}>
              Click To Export Transaction Details:
            </h1>
            <img
              className="pointer-cursor"
              title="Download Transaction Details"
              width={18}
              height={18}
              onClick={() => ExportToExcel(tnxDeails)}
              src={ExcelActiveIcon}
              alt=""
            />
          </div>
          <p className="mb-0">
            <span>Total BillAmount: </span>
            {formatCurrency(
              formatIndianNumber(
                (Array.isArray(tnxDeails) ? tnxDeails : []).reduce(
                  (acc, current) => acc + current.BillAmt,
                  0,
                ),
              ),
            )}
          </p>
        </div>
        <CustomTable
          columns={columns}
          data={renderData}
          theadStyle={{ zIndex: 1 }}
          scrollView="scroll"
          tableHeight="table-responsive"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        />
        <div className="my-2 d-flex align-items-center justify-content-end px-3">
          <Button onClick={() => setShow(false)} className="rounded">
            Close
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default LedgerTransaction;
