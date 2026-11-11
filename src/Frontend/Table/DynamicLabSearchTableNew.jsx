import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { dateConfig, CheckDevice, downloadPdf, IndexHandle } from "../../utils/helpers";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { FaPlus, FaSearch, FaEye } from "react-icons/fa";
import Medical from "../Images/Medical.png";
import file from "../Images/file.png";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import AddRemark from "../utils/AddRemark";
import CustomModal from "../utils/CustomModal";
import DispatchPatientDetailModal from "../utils/DispatchPatientDetailModal";
import { SampleStatus, getStatusColor } from "../../utils/Constants";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import "./CustomeColor.css";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import DateTimeCell from "../../utils/DateTimeCell";

const DynamicLabSearchTableNew = ({ dispatchData, show, show2, TableData, labNo }) => {
  const { t } = useTranslation();
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [TestId, setTestId] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    HideAuditTrailDispatch,
    SessionRateTypeID,
    RateTypeID,
  } = useLocalStorage("userData", "get");
  const effectiveRateTypeID = SessionRateTypeID ?? RateTypeID ?? 0;
  const isB2B = Number(effectiveRateTypeID) !== 0;

  //dynamic controller


  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);



  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedLedgerTransactionNo, setSelectedLedgerTransactionNo] = useState(null);
  const [selectedTestID, setSelectedTestID] = useState(null);

  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState({}); // key: flattenedIndex, value: boolean

  const [printLoading, setPrintLoading] = useState({
    With: false,
    Without: false,
    index: -1,
  });
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });

  const PAGE_ID = "626"; //PAGEID for Lab Search List

  const flattenedData = useMemo(() => {
    const flattened = [];
    let lastVisitNo = null;
    let patientCounter = 0;

    dispatchData.forEach((data, patientIndex) => {
      const pliList = data?.PliDataList || [];
      const rowCount = Math.max(pliList.length, 1);

      const isNewVisit = data.VisitNo !== lastVisitNo;
      if (isNewVisit) {
        patientCounter++;
        lastVisitNo = data.VisitNo;
      }

      for (let i = 0; i < rowCount; i++) {
        const pli = pliList[i] || {};
        flattened.push({
          ...data,
          _pli: pli,
          _isFirstOfPatient: isNewVisit && i === 0,
          _patientSerialNumber: patientCounter,
          _patientIndex: patientIndex,
          _testIndex: i,
          _totalInPatient: rowCount,
          _flattenedIndex: flattened.length,
        });
      }
    });
    return flattened;
  }, [dispatchData]);

  const ALL_STATUS_ITEMS = [
    ...SampleStatus,
    { label: "Full Refund",    value: "-1", status: true },
    { label: "Partial Refund", value: "-2", status: true },
  ];

  const statusCount = (key) => {
    if (key === "") return flattenedData.length;
    return flattenedData.filter(
      (item) => String(item._pli?.status ?? item._pli?.Status ?? "") === String(key)
    ).length;
  };

  const getFilterColor = (val) => {
    if (val === "-1") return "#dc3545";
    if (val === "-2") return "#fd7e14";
    return getStatusColor(val);
  };

  const filteredData = useMemo(() => {
    let data = flattenedData;

    if (statusFilter) {
      data = data.filter(item => String(item._pli?.status || item._pli?.Status) === String(statusFilter));
    }

    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((item) => {
      return (
        item.VisitNo?.toLowerCase().includes(lowerSearch) ||
        item.PatientName?.toLowerCase().includes(lowerSearch) ||
        item.Mobile?.toString().includes(lowerSearch) ||
        item._pli?.BarcodeNo?.toLowerCase().includes(lowerSearch) ||
        item._pli?.SinNo?.toLowerCase().includes(lowerSearch) ||
        item.BarcodeNo?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [flattenedData, searchTerm, statusFilter]);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setIsAllSelected(checked);
    const newSelected = {};
    if (checked) {
      filteredData.forEach((row) => {
        newSelected[row._flattenedIndex] = true;
      });
    }
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (e, index) => {
    const checked = e.target.checked;
    setSelectedRows(prev => {
      const next = { ...prev, [index]: checked };
      if (!checked) setIsAllSelected(false);
      return next;
    });
  };

  // const columnConfig = [
  //   { header: "S.No", visible: 1 },
  //   { header: "Reg Date", visible: 1 },
  //   { header: "Visit No", visible: 1 },
  //   { header: "Barcode No", visible: 1 },
  //   { header: "UHID", visible: 1 },
  //   { header: "Name", visible: 1 },
  //   { header: "Age/Gender", visible: 1 },
  //   { header: "Test", visible: 1 },
  //   { header: "Select", visible: 1, hasSelectAll: true },
  //   { header: "Print", visible: 1 },
  //   { header: "Remarks", visible: 1 },
  //   { header: "Doctor", visible: 1 },
  //   { header: "Centre", visible: 1 },
  //   { header: "View", visible: 1 },
  //   { header: "Audit Trail", visible: 1 },
  //   { header: "U.D", visible: 1, icon: "fa-file", tooltip: "Uploaded Document" },
  //   { header: "M.H", visible: 1, icon: "fa-h-square", tooltip: "Medical History" },
  //  ];


  // Add this map near your columnConfig — maps DB ControlDisplayID to your existing col properties
  const COLUMN_META = {
    "S.No": {},
    "Reg Date": {},
    "Visit No": {},
    "Barcode No": {},
    "UHID": {},
    "Name": {},
    "Mobile":{},
    "Age/Gender": {},
    "Test": {},
    "Select": { hasSelectAll: true },
    "Print": {},
    "Remarks": {},
    "Doctor": {},
    "Centre": {},
    "RateTypeName":{},
    "View": {},
    "Audit Trail": {},
    "U.D": { icon: "fa-file", tooltip: "Uploaded Document" },
    "M.H": { icon: "fa-h-square", tooltip: "Medical History" },
    "PrintBarcode": {},
  };

  const B2B_HIDDEN_COLS = new Set(["View", "Audit Trail"]);

  const columnConfig = useMemo(() => {
    let cols;
    // If list not loaded yet, fall back to showing all columns
    if (!controllerDynamicList?.length) {
      cols = Object.keys(COLUMN_META).map((header) => ({
        header,
        ...COLUMN_META[header],
      }));
    } else {
      cols = controllerDynamicList
        .filter((item) => item?.TypeId === 2 && item?.IsShow === 1)
        .sort((a, b) => (a.DisplayOrder ?? a.ID) - (b.DisplayOrder ?? b.ID))
        .map((item) => ({
          header: item.ControlDisplayName,
          ...(COLUMN_META[item.ControlDisplayName] ?? {}),
        }));
    }
    if (isB2B) {
      cols = cols.filter((col) => !B2B_HIDDEN_COLS.has(col.header));
    }
    return cols;
  }, [controllerDynamicList, isB2B]);


  const patientLevelColumns = useMemo(() => {
    const PATIENT_LEVEL = new Set([
      "S.No", "Reg Date", "Visit No", "UHID",
      "Name", "Mobile", "Age/Gender", "Doctor", "Centre","RateTypeName", "U.D", "M.H"
    ]);
    // Only include ones actually shown
    return columnConfig
      .map((c) => c.header)
      .filter((h) => PATIENT_LEVEL.has(h));
  }, [columnConfig]);

  const shouldShow = (colHeader, data, rowIndex) => {
    if (data._isFirstOfPatient) return true;

    const prev = filteredData[rowIndex - 1];
    if (!prev || prev.VisitNo !== data.VisitNo) return true;

    if (colHeader === "Barcode No" || colHeader === "Barcode") {
      const currentBC = data._pli?.BarcodeNo || data._pli?.SinNo || data?.BarcodeNo || data?.SinNo;
      const prevBC = prev._pli?.BarcodeNo || prev._pli?.SinNo || prev?.BarcodeNo || prev?.SinNo;
      return currentBC !== prevBC;
    }

    if (patientLevelColumns.includes(colHeader)) return false;

    return true;
  };

  const handleReport = (data, loader, index, PHead) => {
    let TestIDHash = [];
    const visitID = data.LedgerTransactionID;

    const selectedIndices = Object.keys(selectedRows).filter(key => selectedRows[key]);

    if (selectedIndices.length > 0) {
      flattenedData.forEach((row, idx) => {
        if (
          selectedRows[row._flattenedIndex] &&
          row.LedgerTransactionID === visitID
        ) {
          if (
            (row._pli?.Approved == 1 ||
              row._pli?.IsApproved == 1 ||
              row._pli?.isApprove == 1 ||
              row._pli?.IsApprove == 1) &&
            (row._pli?.TestIDHash || row._pli?.TestIdHash)
          ) {
            TestIDHash.push(row._pli.TestIDHash || row._pli.TestIdHash);
          }
        }
      });
    }

    if (TestIDHash.length === 0) {
      // If nothing selected, get all approved tests for this visit
      const allForThisVisit = flattenedData.filter(
        (row) =>
          row.LedgerTransactionID === visitID &&
          (row._pli?.Approved == 1 ||
            row._pli?.IsApproved == 1 ||
            row._pli?.isApprove == 1 ||
            row._pli?.IsApprove == 1)
      );
      if (allForThisVisit.length > 0) {
        TestIDHash = allForThisVisit
          .map((row) => row._pli?.TestIDHash || row._pli?.TestIdHash)
          .filter(Boolean);
      } else if (
        (data._pli?.Approved == 1 ||
          data._pli?.IsApproved == 1 ||
          data._pli?.isApprove == 1 ||
          data._pli?.IsApprove == 1) &&
        (data._pli?.TestIDHash || data._pli?.TestIdHash)
      ) {
        TestIDHash.push(data._pli.TestIDHash || data._pli.TestIdHash);
      } else {
        const pliList = data.PliDataList || [];
        pliList.forEach((item) => {
          if (
            (item.Approved == 1 ||
              item.IsApproved == 1 ||
              item.isApprove == 1 ||
              item.IsApprove == 1) &&
            (item.TestIdHash || item.TestIDHash)
          ) {
            TestIDHash.push(item.TestIdHash || item.TestIDHash);
          }
        });
      }
    }

    if (TestIDHash.length > 0) {
      APiReport(TestIDHash, loader, index, PHead);
    } else {
      toast.warn("No Approved Test found to print");
    }
  };

  const APiReport = (TestIDHash, loader, index, PHead) => {
    if (printLoading.index === -1) {
      setPrintLoading({
        ...printLoading,
        [loader]: true,
        index: index,
      });
      const requestOptions = {
        ...(CheckDevice() == 1 && { responseType: "blob" }),
      };
      axiosReport
        .post(
          `commonReports/GetLabReport`,
          {
            TestIDHash: [...new Set(TestIDHash)],
            PHead: PHead,
            PrintColour: "1",
            IsDownload: CheckDevice(),
          },
          requestOptions,
        )
        .then((res) => {
          if (CheckDevice() == 1) {
            downloadPdf(res.data);
          } else {
            if (res?.data?.success) {
              window.open(res?.data?.url, "_blank");
            } else {
              toast.error(res?.data?.message);
            }
          }
          setPrintLoading({ With: false, Without: false, index: -1 });
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || err?.data?.message || "Something went wrong");
          setPrintLoading({ With: false, Without: false, index: -1 });
        });
    } else {
      toast.warn("Please wait Generating Report");
    }
  };

  const handleCheck = (row) => {
    const status = row._pli?.status || row._pli?.Status;
    const isApproved =
      row._pli?.Approved == 1 ||
      row._pli?.IsApproved == 1 ||
      row._pli?.isApprove == 1 ||
      row._pli?.IsApprove == 1;

    if ((status == 5 || status == 6 || status == 15) && isApproved) return true;

    if (row._isFirstOfPatient && !status) {
      return (row.PliDataList || []).some((item) => {
        const s = item.status || item.Status;
        const app =
          item.Approved == 1 ||
          item.IsApproved == 1 ||
          item.isApprove == 1 ||
          item.IsApprove == 1;
        return (s == 5 || s == 6 || s == 15) && app;
      });
    }
    return false;
  };


  //api for dynamic controller
  useEffect(() => {
    controllerDynamic();
  }, [])



  const controllerDynamic = async () => {
    try {
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);

      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);

      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
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
        if (res?.data?.message != "") window.location.href = res.data.message;
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
        if (res?.data?.message != "") window.location.href = res.data.message;
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      });
  };

  const isHideController = (cntrId = "") => {
    if (!controllerDynamicList?.length) return true;
    const isPresent = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (isPresent?.ControlDisplayID) {
      return !!controllerDynamicList?.find(
        (x) => x?.ControlDisplayID === cntrId,
      )?.IsShow;
    }
    return true;
  };



  return (
    <>
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData("", labNo);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          visitKey="VisitNo"
          ledgerTransactionIDKey="LedgerTransactionID"
          patientNameKey="PatientName"
          ageGenderKey={["Age", "Gender"]}
        />
      )}

      {flattenedData?.length > 0 ? (
        <>
          <TableFilterDot
            slide={true}
            items={ALL_STATUS_ITEMS}
            getColor={getFilterColor}
            onSelect={(val) => setStatusFilter((prev) => prev === val ? "" : val)}
            statusCount={statusCount}
            label=""
            bgColor="#e9e2e1"
            className="mt-2 mb-2 px-2 py-1 bg-white"
          />

          <div style={{ fontFamily: "inherit" }}>
          <Tables>
              <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--primary, #0d6efd)", color: "#fff" }}>
                <tr>
                  {columnConfig.map((col, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: "8px 6px",
                        textAlign: "center",
                        fontSize: "13px",
                        whiteSpace: col.header === "Test" || col.header === "RateTypeName" ? "normal" : "nowrap",
                        fontWeight: "600",
                        fontFamily: "inherit",
                        minWidth: col.header === "Test" || col.header === "RateTypeName" ? "100px" : undefined,
                        maxWidth: col.header === "Test" || col.header === "RateTypeName" ? "150px" : undefined,
                        width: col.header === "Test" || col.header === "RateTypeName" ? "200px" : undefined,
                      }}
                    >
                      {col.hasSelectAll ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            style={{ cursor: "pointer", width: "15px", height: "15px" }}
                          />
                        </div>
                      ) : col.icon ? (
                        <i className={`fa ${col.icon}`} title={col.tooltip || col.header} />
                      ) : (
                        t(col.header)
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data, rowIndex) => {
                  const statusClass = data._pli?.status || data._pli?.Status || "transparent";
                  const isChecked = !!selectedRows[data._flattenedIndex];
                  const dueAmount = data?.DueAmount;
                  const isStrictZero = Number(dueAmount) !== 0;

                  return (
                    <tr
                      key={rowIndex}
                      className={`Status-${statusClass} ${data._isFirstOfPatient ? "patient-group-row" : ""}`}
                      style={data._isFirstOfPatient ? { borderTop: "2px solid #dee2e6" } : {}}
                    >
                      {columnConfig.map((col, colIdx) => {
                        const isVisible = shouldShow(col.header, data, rowIndex);
                        return (
                          <td
                            key={colIdx}
                            data-title={t(col.header)}
                            className={!isVisible ? "mobile-hide-column" : ""}
                            style={{
                              textAlign: "left",
                              fontSize: "12px",
                              verticalAlign: "middle",
                              padding: "5px 6px",
                              wordBreak: "break-word",
                              backgroundColor: (col.header === "DueAmount" && isStrictZero) ? "red" : "",
                            }}
                          >
                            {isVisible && (
                              <>
                                {col.header === "S.No" && (
                                  <span>{data._patientSerialNumber + IndexHandle(1, 0)}</span>
                                )}
                                {col.header === "Reg Date" && (
                                  // <>
                                  //   {data?.RegistrationDate?.split(" ").slice(0, 1).join(" ")}
                                  //   <br />
                                  //   {data?.RegistrationDate?.split(" ").slice(1).join(" ")}
                                  // </>
                                  <DateTimeCell dateString={data?.RegistrationDate} />
                                )}
                                {col.header === "Visit No" && data?.VisitNo}
                                {col.header === "Barcode No" && (
                                  <span style={{ fontWeight: 600 }}>{data._pli?.BarcodeNo || data._pli?.SinNo || ""}</span>
                                )}
                                {col.header === "UHID" && data?.PatientCode}
                                {col.header === "Name" && data?.PatientName}
                                {col.header === "Mobile" && data?.Mobile}
                                {col.header === "Age/Gender" && `${data?.Age}/${data?.Gender}`}
                                {col.header === "Test" && (
                                  <div style={{ fontSize: "inherit", minWidth: 200, maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word" }}>
                                    
                                      {data._pli?.TestName || data._pli?.Test || ""}
                                    
                                  </div>
                                )}
                                {col.header === "Select" && handleCheck(data) && (
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleSelectRow(e, data._flattenedIndex)}
                                    style={{ cursor: "pointer", width: "13px", height: "13px" }}
                                  />
                                )}
                                {col.header === "Print" && handleCheck(data) && (
                                  <div className="d-flex align-items-center justify-content-center" style={{ gap: "8px" }}>
                                    {printLoading.Without && printLoading.index === rowIndex ? (
                                      <SpinnerLoad />
                                    ) : (
                                      <i
                                        className="fa fa-print iconStyle ahddh_black"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleReport(data, "Without", rowIndex, 0)}
                                        title="Print without header"
                                      />
                                    )}
                                    {printLoading.With && printLoading.index === rowIndex ? (
                                      <SpinnerLoad />
                                    ) : (
                                      <i
                                        className="fa fa-print iconStyle sjhiweo_red"
                                        style={{ color: "red", cursor: "pointer" }}
                                        onClick={() => handleReport(data, "With", rowIndex, 1)}
                                        title="Print with header"
                                      />
                                    )}
                                  </div>
                                )}
                                {col.header === "Remarks" && (
                                  <>
                                    <div
                                      data-tooltip-id={`remark-tooltip-${rowIndex}`}
                                      onClick={() => {
                                        setShowAddRemark({
                                          modal: true,
                                          rowData: { ...data },
                                        });
                                      }}
                                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", justifyContent: "center" }}
                                    >
                                      <div
                                        style={{
                                          backgroundColor: "green",
                                          borderRadius: "50%",
                                          width: "18px",
                                          height: "18px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                        }}
                                      >
                                        <FaPlus color="white" size={8} />
                                      </div>
                                      {data.LabRemarkCount > 0 && (
                                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                                          ({data.LabRemarkCount})
                                        </span>
                                      )}
                                    </div>
                                    {data?.RemarksList?.length > 0 && (
                                      <ReactTooltip
                                        id={`remark-tooltip-${rowIndex}`}
                                        place="top"
                                        style={{ zIndex: 9999 }}
                                        clickable
                                        content={<RemarkTooltip remarks={data?.RemarksList} />}
                                      />
                                    )}
                                  </>
                                )}
                                {col.header === "PrintBarcode" && (
                                  <div className="d-flex align-items-center justify-content-center" style={{ gap: "8px" }}>
                                    <div
                                      onClick={() => {
                                        getBarcodeData(data._pli?.TestID || data._pli?.TestId, data?.VisitNo, [data._pli?.BarcodeNo || data._pli?.SinNo]);
                                      }}
                                    >
                                      <i className="fa fa-print " style={{ cursor: "pointer" }} title="TestWise"></i>
                                    </div>
                                    <div
                                      onClick={() => {
                                        getAllDepartmentBarcodeData(
                                          data?.VisitNo,
                                          data._pli?.DepartmentID,
                                          data._pli?.BarcodeNo || data._pli?.SinNo,
                                        );
                                      }}
                                    >
                                      <i
                                        className="fa fa-print "
                                        style={{ cursor: "pointer", color: "red", marginLeft: "10px" }}
                                        title="DepartmentWise"
                                      ></i>
                                    </div>
                                  </div>
                                )}
                                {col.header === "Doctor" && data?.DoctorName}
                                {col.header === "Centre" && data?.Centre}
                                {col.header === "RateTypeName" && (
                                  <div style={{ fontSize: "inherit", minWidth: 200, maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word" }}>
                                    {data?.RateTypeName}
                                  </div>
                                )}
                                {col.header === "View" && (
                                  <i className="fa fa-search pointer text-primary" onClick={() => {
                                    setModal(true);
                                    setVisitID(data?.VisitNo);
                                    setTestId(data._pli?.TestId || data?._pli?.TestID || data?.TestId);
                                  }} />
                                )}
                                {col.header === "Audit Trail" && (
                                  <FaEye
                                    style={{ fontSize: "18px", cursor: "pointer", color: "#007bff" }}
                                    onClick={() => {
                                      setShowPatientModal(true);
                                      setSelectedLedgerTransactionNo(data?.VisitNo);
                                      setSelectedTestID(data._pli?.TestId || data?._pli?.TestID || 0);
                                    }}
                                  />
                                )}
                                {col.header === "U.D" && (
                                  <div className="text-info" style={{ cursor: "pointer" }} onClick={() => show2({ modal: true, data: data?.PatientGuid, index: data._patientIndex })}>
                                    <img src={file} className="sizeicon" /> &nbsp; ({data?.UploadDocumentCount || 0})
                                  </div>
                                )}
                                {col.header === "M.H" && (
                                  <div className="text-info" style={{ cursor: "pointer" }} onClick={() => show({ modal: true, data: data?.PatientGuid, index: data._patientIndex })}>
                                    <img src={Medical} className="sizeicon" /> &nbsp; ({data?.MedicalHistoryCount || 0})
                                  </div>
                                )}
                                {col.header === "DueAmount" && (
                                  <div className={isStrictZero ? "DueAmount-color" : ""} style={{ cursor: "pointer", width: "100%", height: "100%" }}>
                                    {data?.DueAmount}
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Tables>
          </div>
        </>
      ) : (
        <NoRecordFound />
      )}

      {modal && <CustomModal show={modal} visitID={visitID} TestId={TestId} onHide={() => setModal(false)} />}

      <DispatchPatientDetailModal
        showPH={showPatientModal}
        setShowPH={setShowPatientModal}
        ResultData={[{ LedgerTransactionNo: selectedLedgerTransactionNo, TestID: selectedTestID }]}
        Index={0}
      />
    </>
  );
};

export default DynamicLabSearchTableNew;
