import { useRef, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance } from "../../utils/axiosInstance";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import SRARejectModal from "../utils/SRARejectModal";
import { formatStandardDate } from "../../utils/helpers";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CancelButton, CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Heading from "../../components/UI/Heading";

const today = new Date();

const SRA = () => {
  const [searchPayload, setSearchPayload] = useState({
    barcodeNo: "",
    temperature : ""
  });
  const [payload, setPayload] = useState({
    refresh: null,
    FromDate: new Date(),
    ToDate: new Date(),
    SortBy: "t.LastDate",
    SortOrder: "desc",
    Type: "1",
    timeBucket: null,
  });
  const [loading, setLoading] = useState(false);
  const [receivedData, setReceivedData] = useState([]);
  const [segregationData, setSegregationData] = useState([]);
  const [apiResult, setApiResult] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [t] = useTranslation();
  const userLocalData = useLocalStorage("userData", "get");

  const handleSearch = async () => {
    const trimmedBarcode = (searchPayload.barcodeNo || "").trim();
    if (!trimmedBarcode) {
      toast.warn("Please enter barcode No.");
      return;
    }

    const isAlreadyInUi = receivedData.some(
      (item) => (item.BarcodeNo || item.SINNo || "").trim().toLowerCase() === trimmedBarcode.toLowerCase()
    ) || segregationData.some(
      (item) => (item.BarcodeNo || item.SINNo || "").trim().toLowerCase() === trimmedBarcode.toLowerCase()
    );

    if (isAlreadyInUi) {
      toast.error("This Barcode already sort");
      setSearchPayload((prev) => ({
        ...prev,
        barcodeNo: "",
        temperature: ""
      }));
      return;
    }

    const payload = [
      {
        barcodeNo: trimmedBarcode,
        inhouse: 1,
        SRATemperature: Number(searchPayload.temperature),
      },
    ];

    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/SampleSearch", payload);
      if (res?.data?.success && Array.isArray(res?.data?.message)) {
        const data = res?.data?.message || [];
        const received = data.filter((item) => Number(item.Segregation) == 0);
        const segregated = data.filter((item) => Number(item.Segregation) == 1 || Number(item.Segregation) == 2);

        setReceivedData((prev) => [...prev, ...received]);
        setSegregationData((prev) => [...prev, ...segregated]);

        if (segregated.length > 0) {
          toast.success("Sample transferred successfully.");
        } else if (received.length > 0) {
          toast.success("Received successfully.");
        }

        setSearchPayload((prev) => ({
          ...prev,
          barcodeNo: "",
          temperature: ""
        }));
        sendPayload();
      } else {
        toast.error(res?.data?.message || "This Barcode already sort");
        setSearchPayload((prev) => ({
          ...prev,
          barcodeNo: "",
          temperature: ""
        }));
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const updatePayload = (updater) => {
    setPayload((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  };

  const handleSelectChange = (name, option) => {
    setPayload((prev) => ({
      ...prev,
      [name]: option?.value ?? null
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchPayload({ ...searchPayload, [name]: value });
  };

  const toggleType = (selectedType) => {
    setPayload((prev) => ({
      ...prev,
      Type: selectedType
    }));
  };

  const handleDateChange = (value, name) => {
    updatePayload((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const selectTimeBucket = (bucket) => {
    updatePayload((prev) => ({
      ...prev,
      timeBucket: prev.timeBucket === bucket ? null : bucket,
    }));
  };

  const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const toSraApiDate = (value) => {
    if (!value) return value;
    if (typeof value === "string" && /^\d{2}\/[A-Za-z]{3}\/\d{4}$/.test(value.trim())) {
      return value.trim();
    }
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}/${MONTHS_SHORT[d.getMonth()]}/${d.getFullYear()}`;
  };

  const sendPayload = async () => {
    try {
      const res = await axiosInstance.post("SRA/SearchPendingData", {
        ...payload,
        Type: String(payload.Type ?? "1"),
        FromDate: toSraApiDate(payload.FromDate),
        ToDate: toSraApiDate(payload.ToDate),
      });
      const ok = res?.data?.success ?? res?.data?.Success;
      const rows = res?.data?.message ?? res?.data?.Message;
      if (ok && Array.isArray(rows)) {
        setApiResult(rows);
      } else {
        setApiResult([]);
      }
    } catch (err) {
      console.error("API error", err);
      setApiResult([]);
    }
  };

  const rowValue = (row, ...keys) => {
    for (const key of keys) {
      const value = row?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return "";
  };

  const summaryData = useMemo(() => {
    const pendingRows = Array.isArray(apiResult) ? apiResult : [];
    const received = Array.isArray(receivedData) ? receivedData.length : 0;
    const rejected = pendingRows.filter((row) => {
      const status = String(row?.IsSampleCollected ?? row?.isSampleCollected ?? "").toUpperCase();
      return status === "R";
    }).length;
    const pending = pendingRows.length;
    return {
      total: pending + received,
      received,
      rejected,
      pending,
    };
  }, [apiResult, receivedData]);

  useEffect(() => {
    sendPayload();

    const interval = setInterval(() => {
      sendPayload();
    }, 30000);

    return () => clearInterval(interval);
  }, [payload]);

  const refreshOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "Stop", value: "stop" },
    { label: "Refresh", value: "refresh" },
  ];

  const sortByOptions = [
    { label: "Last Status Date", value: "t.LastDate" },
    { label: "Booking Location", value: "t.Centre" },
    { label: "Time Difference", value: "t.TimeDiffe1" },
  ];

  const sortOrderOptions = [
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" },
  ];

  const statusBtnClass = (isActive) =>
    `btn btn-sm ${isActive ? "bg-info text-white" : "border border-info"}`;

  const timeBucketClass = (bucket, activeBucket) => {
    const active = bucket === activeBucket;
    switch (bucket) {
      case "<15":
        return `btn btn-sm ${active
            ? "bg-secondary text-white"
            : "border border-secondary text-secondary bg-transparent"
          }`;
      case "15-30":
        return `btn btn-sm ${active
            ? "bg-danger text-white"
            : "border border-danger text-danger bg-transparent"
          }`;
      case ">30":
        return `btn btn-sm ${active
            ? "bg-success text-white"
            : "border border-success text-success bg-transparent"
          }`;
      default:
        return `btn btn-sm ${active
            ? "bg-primary text-white"
            : "border border-primary text-primary bg-transparent"
          }`;
    }
  };

  const getBarcodeData = (testId, VisitNo, SINNo) => {
      const arr = [testId];
      axiosInstance
        .post("SC/getBarcode", {
          LedgerTransactionNo: VisitNo,
          BarcodeNo: SINNo,
          TestID: arr,
          barcodeNoDepartmentID: 0,
        })
        .then((res) => {
          const msg = res?.data?.message;
          const isUrl = typeof msg === "string" && (
            msg.startsWith("http://") ||
            msg.startsWith("https://") ||
            msg.startsWith("blob:") ||
            msg.startsWith("/")
          );
          if (isUrl) window.location.href = msg;
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Something went wrong");
        });
    };

     const getAllDepartmentBarcodeData = (
        LedgerTransactionID,
        DepartmentID,
        barcodeNo,
      ) => {
        axiosInstance
          .post("SC/getBarcode", {
            LedgerTransactionNo: String(LedgerTransactionID),
            BarcodeNo: [barcodeNo],
            TestID: [],
            barcodeNoDepartmentID: Number(DepartmentID),
          })
          .then((res) => {
            const msg = res?.data?.message;
          const isUrl = typeof msg === "string" && (
            msg.startsWith("http://") ||
            msg.startsWith("https://") ||
            msg.startsWith("blob:") ||
            msg.startsWith("/")
          );
          if (isUrl) window.location.href = msg;
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message || "Something went wrong");
          });
      };

  const SampleTable = ({ title, data, showCentre = false, onClear }) => {
    const isSeg = title.toLowerCase().includes("segregation");
    const themeColor = isSeg ? "#007bff" : "#28a745";
    const themeBg = isSeg ? "#e3f2fd" : "#e8f5e9";
    const badgeClass = isSeg ? "badge bg-primary" : "badge bg-success";
    const badgeLabel = isSeg ? "Segregation (Outsource)" : "In-House (Ready)";
    const textColor = isSeg ? "#0d47a1" : "#1b5e20";

    return (
      <div className="col-12 col-md-6">
        <Heading
          title={
            <span>
              {t(title)}{" "}
              <span className={`${badgeClass} ms-2`} style={{ fontSize: "11px", fontWeight: "600" }}>
                {badgeLabel}
              </span>
            </span>
          }
          defaultValue={true}
          secondTitle={
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (typeof onClear === "function") onClear();
              }}
            >
              <i className="bi bi-x-circle mb-0 m-1" title="Clear"></i>
            </div>
          }
        />
        <div className="card shadow-sm" style={{ borderLeft: `5px solid ${themeColor}` }}>
          <div className="card-body p-2" style={{ backgroundColor: themeBg }}>
            <div className="table-responsive" style={{ height: "130px" }}>
              <Tables className="table table-sm mb-0" data={data}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Barcode No</th>
                    {userLocalData?.DefaultCurrencyName === "KES" && (
                      <th>Temperature(°C)</th>
                    )}
                    <th>Patient Name</th>
                    <th>Sample Type</th>
                    <th>Test</th>
                    <th>Department</th>
                    <th>Status</th>
                    {showCentre && <th>Centre Name</th>}
                    <th>Print Barcode</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} style={{ backgroundColor: isSeg ? "#f0f7ff" : "#f4fbf5", color: textColor }}>
                      <td data-title={t("#")}>{idx + 1}</td>
                      <td data-title={t("Barcode No")} style={{ fontWeight: "600" }}>{t(row?.BarcodeNo)}</td>
                      {userLocalData?.DefaultCurrencyName === "KES" && (
                        <td data-title={t("Temperature(°C)")}>{t(row?.SRATemperature)}</td>
                      )}
                      <td data-title={t("Patient Name")}>{t(row?.PName)}</td>
                      <td data-title={t("Sample Type")}>{t(row?.SampleTypeName)}</td>
                      <td data-title={t("Test")}>{t(row?.InvestigationName)}</td>
                      <td data-title={t("Department")}>{t(row?.Department)}</td>
                      <td data-title={t("Status")}>
                        <span className={badgeClass} style={{ fontSize: "10px" }}>
                          {isSeg ? "Segregated" : "Ready for Dept Receive"}
                        </span>
                      </td>
                      {showCentre && (
                        <td data-title={t("Centre Name")}>
                          {t(row?.TestCentre) || t(row?.OutsourceCentre)}
                        </td>
                      )}
                      <td data-title={t("Print Barcode")}>
                        <div className="d-flex" style={{ gap: "8px" }}>
                          <div
                            onClick={() => {
                              getBarcodeData(row?.TestID, row?.LedgerTransactionNo, [row?.BarcodeNo]);
                            }}
                          >
                            <i className="fa fa-print" style={{ cursor: "pointer" }} title="TestWise"></i>
                          </div>
                          <div
                            onClick={() => {
                              getAllDepartmentBarcodeData(
                                row?.LedgerTransactionNo,
                                row?.DepartmentID,
                                row?.BarcodeNo,
                              );
                            }}
                          >
                            <i
                              className="fa fa-print"
                              style={{ cursor: "pointer", color: "red", marginLeft: "10px" }}
                              title="DepartmentWise"
                            ></i>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Accordion
        name={t("Sample Receive Area (SRA)")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo={"#"}
        linkTitle={
            <div
              className="link-title-container mt-2 d-none d-md-flex align-items-center"
              id="pr_id_11"
              style={{ flexWrap: "nowrap", overflow: "hidden", fontSize: "12px" }}
            >
             <label
                style={{
                  whiteSpace: "nowrap",
                  marginBottom: 0,
                }}
              >
                {t("Total")} :
                <span className="text-danger" style={{ marginLeft: "6px" }}>
                  {summaryData?.total ?? 0}
                </span>
              </label>
              |
              <label
                style={{
                  whiteSpace: "nowrap",
                  marginBottom: 0,
                }}
              >
                {t("Received")} :
                <span className="text-warning" style={{ marginLeft: "6px" }}>
                  {summaryData?.received ?? 0}
                </span>
              </label>
              |
              <label
                style={{
                  whiteSpace: "nowrap",
                  marginBottom: 0,
                }}
              >
                {t("Rejected")} :
                <span className="text-success" style={{ marginLeft: "6px" }}>
                  {summaryData?.rejected ?? 0}
                </span>
              </label>
              |
              <label
                style={{
                  whiteSpace: "nowrap",
                  marginBottom: 0,
                }}
              >
                {t("Pending")} :
                <span className="text-danger" style={{ marginLeft: "6px" }}>
                  {summaryData?.pending ?? 0}
                </span>
              </label>
          </div>
        }
      >
        <div className="row pt-2 px-2">
          { userLocalData?.DefaultCurrencyName === "KES" && (
         <div className="col-sm-2">
          <Input
              type="text"
              placeholder=""
              lable={t("Temperature(°C)")}
              id="temperature"
              name="temperature"
              value={searchPayload?.temperature}
              onChange={handleChange}
              maxLength={4}
            />
            </div>
          )}
          <div className="col-sm-2">
            <Input
              id="barcodeNo"
              className="select-input-box form-control form-control-sm"
              type="text"
              name="barcodeNo"
              maxLength={20}
              lable="Barcode No"
              autocomplete="off"
              value={searchPayload.barcodeNo}
              onChange={(e) =>
                setSearchPayload((prev) => ({
                  ...prev,
                  barcodeNo: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <div className="col-auto">
            {loading ? (
              <Loading />
            ) : (
              <SearchButton
                text={"Search"}
                onClick={handleSearch}
              />
            )}
          </div>

          <div className="col-auto">
            {loading ? (
              <Loading />
            ) : (
              <CancelButton
                text={"Reject Sample"}
                onClick={() => setShowRejectModal(true)}
              />
            )}
          </div>
        </div>
      </Accordion>
        <div className="my-2">
          <div className="row gx-3 gy-3">
            <SampleTable
              title={t("In-House Sample")}
              data={receivedData}
              onClear={() => setReceivedData([])}
            />

            <SampleTable
              title={t("Segregation")}
              data={segregationData}
              showCentre={true}
              onClear={() => setSegregationData([])}
            />
          </div>
        </div>
      <Accordion defaultValue={true} title={t("")}>
        <div className="row pt-2 pl-2 pr-2 g-2">
          <div className="col-12 col-sm-2">
            <ReactSelect
              dynamicOptions={refreshOptions}
              name="refresh"
              lable={t("Refresh")}
              id="refresh"
              removeIsClearable={true}
              placeholderName={t("Refresh")}
              value={payload.refresh}
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-12 col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              placeholder=" "
              id="FromDate"
              lable="From Date"
              value={payload.FromDate ? new Date(payload.FromDate) : null}
              onChange={handleDateChange}
            />
          </div>

          <div className="col-12 col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              placeholder=" "
              id="ToDate"
              lable="To Date"
              value={payload.ToDate ? new Date(payload.ToDate) : null}
              maxDate={new Date()}
              onChange={handleDateChange}
            />
          </div>

          <div className="col-12 col-sm-2">
            <ReactSelect
              dynamicOptions={sortByOptions}
              name="SortBy"
              lable={t("Sort By")}
              id="SortBy"
              removeIsClearable={true}
              placeholderName={t("Sort By")}
              value={payload.SortBy}
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-12 col-sm-2">
            <ReactSelect
              dynamicOptions={sortOrderOptions}
              name="SortOrder"
              lable={t("Sort Order")}
              id="SortOrder"
              removeIsClearable={true}
              placeholderName={t("Sort Order")}
              value={payload.SortOrder}
              onChange={handleSelectChange}
            />
          </div>
        </div>
        <div className="row py-1 px-2">
          <div className="col-12">
            <div
              className="d-flex align-items-center"
              style={{
                gap: "8px",
                overflowX: "auto",
                flexWrap: "nowrap",
                paddingBottom: "4px", 
              }}
            >
              <div className="flex-shrink-0 p-1">
                <CustomButton
                  text={"Logistic Pending"}
                  aria-pressed={payload.Type === "0"}
                  className={`w-100 ${statusBtnClass(payload.Type === "0")}`}
                  onClick={() => toggleType("0")}
                />
              </div>

              <div className="flex-shrink-0 p-1">
                <CustomButton
                  text={"SRA Pending All"}
                  aria-pressed={payload.Type === "1"}
                  className={`w-100 ${statusBtnClass(payload.Type === "1")}`}
                  onClick={() => toggleType("1")}
                />
              </div>

              <div className="flex-shrink-0 p-1">
                <CustomButton
                  text={"Dept Receive Pending"}
                  aria-pressed={payload.Type === "2"}
                  className={`w-100 ${statusBtnClass(payload.Type === "2")}`}
                  onClick={() => toggleType("2")}
                />
              </div>

              {/* <div className="flex-shrink-0 p-1">
                 <CustomButton
                  text={"SRA Pending Insta"}
                  aria-pressed={payload.Type === "3"}
                  className={`w-100 ${statusBtnClass(payload.Type === "3")}`}
                  onClick={() => toggleType("3")}
                />
              </div> */}

              <div className="flex-shrink-0 p-1">
                <CustomButton
                  text={"< 15"}
                  className={`w-100 ${timeBucketClass("<15", payload.timeBucket)}`}
                  onClick={() => selectTimeBucket("<15")}
                />
              </div>

              <div className="flex-shrink-0 p-1">
                <CustomButton
                  text={">15<30"}
                  className={`w-100 ${timeBucketClass("15-30", payload.timeBucket)}`}
                  onClick={() => selectTimeBucket("15-30")}
                />
              </div>

              <div className="flex-shrink-0 p-1">
                <CustomButton
                  text={"> 30"}
                  className={`w-100 ${timeBucketClass(">30", payload.timeBucket)}`}
                  onClick={() => selectTimeBucket(">30")}
                />
              </div>

              <div className="flex-shrink-0 p-1 ms-auto">
                <CustomButton
                  text={"Reset"}
                  icon={"refresh"}
                  onClick={() =>
                    setPayload({
                      refresh: null,
                      FromDate: new Date(),
                      ToDate: new Date(),
                      SortBy: "t.LastDate",
                      SortOrder: "desc",
                      Type: "1",
                      timeBucket: null,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion defaultValue={true} title={t("")}>
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div
                className="d-flex flex-wrap align-items-center justify-content-between p-2 mb-2 rounded border"
                style={{ backgroundColor: "#f8f9fa", fontSize: "12px" }}
              >
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span style={{ fontWeight: 600, color: "#495057" }}>SRA Workflow & Sort Color Legend:</span>
                  <span className="badge bg-success" style={{ padding: "5px 9px", fontSize: "11px" }}>
                    ● In-House Sorted (Green / Ready for Dept Receive)
                  </span>
                  <span className="badge bg-primary" style={{ padding: "5px 9px", fontSize: "11px" }}>
                    ● Segregation / Outsource (Blue / External Lab)
                  </span>
                  <span className="badge bg-warning text-dark" style={{ padding: "5px 9px", fontSize: "11px" }}>
                    ● SRA Pending (Amber / Awaiting Barcode Scan)
                  </span>
                  <span className="badge bg-danger" style={{ padding: "5px 9px", fontSize: "11px" }}>
                    ● Rejected / Hold (Red / Exception)
                  </span>
                </div>
                <div style={{ color: "#6c757d", fontSize: "11px" }}>
                  <span>WCAG 2.1 AA Compliant Display</span>
                </div>
              </div>
              <div className="table-responsive" style={{ width: "100%" }}>
                {apiResult.length > 0 ? (
                  <Tables
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <thead>
                      <tr>
                        <th scope="col">{t("Booking Location")}</th>
                        <th scope="col">{t("Last Status Date")}</th>
                        <th scope="col">{t("SRA Status")}</th>
                        <th scope="col">{t("SIN No.")}</th>
                        <th scope="col">{t("Barcode No.")}</th>
                        <th scope="col">{t("Dispatch No.")}</th>
                        <th scope="col">{t("Visit No.")}</th>
                        <th scope="col">{t("UHID")}</th>
                        <th scope="col">{t("PName")}</th>
                        <th scope="col">{t("Sample Type")}</th>
                        <th scope="col">{t("Department")}</th>
                        <th scope="col" style={{ width: "350px", maxWidth: "350px", whiteSpace: "normal", wordBreak: "break-word" }}>{t("Test Name")}</th>
                        <th scope="col">{t("Print Barcode")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiResult && apiResult.length > 0 ? (
                        apiResult.map((row, idx) => {
                          const isSraDone = row.is_sra === 1 || row.sra_status === "SRA_COMPLETED" || Number(row.Status) >= 3;
                          const isSegregation = Number(row.Segregation) === 1 || Number(row.Segregation) === 2 || row.sra_category === "Segregation";
                          const isRejected = Number(row.Status) === 4 || row.isReject === 1;

                          let rowBg = "#fff8e1"; // SRA Pending (Amber)
                          let rowBorderColor = "#ffc107";
                          let textColor = "#333333";
                          let badgeClass = "badge bg-warning text-dark";
                          let badgeText = "SRA Pending";

                          if (isRejected) {
                            rowBg = "#ffebee";
                            rowBorderColor = "#dc3545";
                            textColor = "#b71c1c";
                            badgeClass = "badge bg-danger";
                            badgeText = "Rejected";
                          } else if (isSraDone && isSegregation) {
                            rowBg = "#e3f2fd";
                            rowBorderColor = "#007bff";
                            textColor = "#0d47a1";
                            badgeClass = "badge bg-primary";
                            badgeText = "Segregation";
                          } else if (isSraDone) {
                            rowBg = "#e8f5e9";
                            rowBorderColor = "#28a745";
                            textColor = "#1b5e20";
                            badgeClass = "badge bg-success";
                            badgeText = "In-House";
                          }

                          // SIN visibility rule (Defect 3):
                          // Before SRA completion: SIN is displayed.
                          // After SRA completion: SIN is hidden ("-").
                          const sinDisplay = isSraDone ? "-" : rowValue(row, "SINNo", "sinNo", "sINNo", "BarcodeNo", "barcodeNo");
                          const barcodeDisplay = rowValue(row, "BarcodeNo", "barcodeNo", "SINNo", "sinNo");

                          return (
                            <tr
                              key={idx}
                              style={{
                                backgroundColor: rowBg,
                                borderLeft: `5px solid ${rowBorderColor}`,
                                color: textColor,
                              }}
                            >
                              <td data-title={t("Booking Location")}>
                                {rowValue(row, "Centre", "centre")}
                              </td>
                              <td data-title={t("Last Status Date")}>
                                {rowValue(row, "LastStatusDate", "lastStatusDate")}
                              </td>
                              <td data-title={t("SRA Status")}>
                                <span className={badgeClass} style={{ fontSize: "11px", fontWeight: "600", padding: "4px 8px" }}>
                                  {badgeText}
                                </span>
                              </td>
                              <td data-title={t("SIN No.")} style={{ fontWeight: isSraDone ? "normal" : "600", color: isSraDone ? "#6c757d" : textColor }}>
                                {sinDisplay}
                              </td>
                              <td data-title={t("Barcode No.")} style={{ fontWeight: "600" }}>
                                {barcodeDisplay}
                              </td>
                              <td data-title={t("Dispatch No.")}>
                                {rowValue(row, "DispatchCode", "dispatchCode")}
                              </td>
                              <td data-title={t("Visit No.")}>
                                {rowValue(row, "VisitID", "visitID", "visitId", "VisitId")}
                              </td>
                              <td data-title={t("UHID")}>
                                {rowValue(row, "patientid", "PatientID", "patientId")}
                              </td>
                              <td data-title={t("PName")}>
                                {rowValue(row, "PName", "pName")}
                              </td>
                              <td data-title={t("Sample Type")}>
                                {rowValue(row, "SampleTypeName", "sampleTypeName")}
                              </td>
                              <td data-title={t("Department")}>
                                {rowValue(row, "Department", "department")}
                              </td>
                              <td data-title={t("Test Name")} style={{ width: "350px", maxWidth: "350px", whiteSpace: "normal", wordBreak: "break-word" }}>
                                {rowValue(row, "TestName", "testName")}
                              </td>
                              <td data-title={t("Print Barcode")}>
                                <div className="d-flex" style={{ gap: "8px" }}>
                                  <div
                                    onClick={() => {
                                      getBarcodeData(
                                        rowValue(row, "testid", "TestID", "testId"),
                                        rowValue(row, "VisitID", "visitID", "visitId"),
                                        [rowValue(row, "SINNo", "sinNo", "sINNo", "BarcodeNo", "barcodeNo")],
                                      );
                                    }}
                                  >
                                    <i className="fa fa-print" style={{ cursor: "pointer" }} title="TestWise"></i>
                                  </div>
                                  <div
                                    onClick={() => {
                                      getAllDepartmentBarcodeData(
                                        rowValue(row, "VisitID", "visitID", "visitId"),
                                        rowValue(row, "DepartmentID", "departmentID", "departmentId"),
                                        rowValue(row, "SINNo", "sinNo", "sINNo", "BarcodeNo", "barcodeNo"),
                                      );
                                    }}
                                  >
                                    <i
                                      className="fa fa-print"
                                      style={{ cursor: "pointer", color: "red", marginLeft: "10px" }}
                                      title="DepartmentWise"
                                    ></i>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="13"
                            style={{
                              textAlign: "center",
                              color: "#555",
                              height: "130px",
                              verticalAlign: "middle",
                            }}
                          >
                            No data found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Tables>
                ) : (
                  <NoRecordFound />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>
      {showUpload && (
        <UploadFile
          show={showUpload}
          handleClose={() => setShowUpload(false)}
          documentId={selectedRow?.attachment}
          pageName="SRA"
          ChangeApi={true}
          CompanyId={selectedRow?.CompanyId}
        />
      )}

      <SRARejectModal
        show={showRejectModal}
        handleClose={() => setShowRejectModal(false)}
      />
    </>
  );
};

export default SRA;
