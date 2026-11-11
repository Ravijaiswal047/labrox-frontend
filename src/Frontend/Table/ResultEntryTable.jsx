import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  CheckDevice,
  dateConfig,
  downloadPdf,
  IndexHandle,
  parseAwsKeys,
  parseRemarks,
} from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import CustomModal from "../utils/CustomModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import Tables from "../../components/UI/customTable";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import CustomDateModal from "../utils/CustomDateModal";
import CryptoJS from "crypto-js";
import Urgent from ".././Images/urgent.gif";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import Tooltip from "../../components/formComponent/Tooltip";
import UpdateRemark from "../utils/UpdateRemark";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import PatientDetailModal from "../utils/PatientDetailModal";
import { FaPlus } from "react-icons/fa";
import AddRemark from "../utils/AddRemark";
import { getAccurateAge } from "../../utils/Constants";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { notify } from "../../utils/utils";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import "./ResultEntryTable.css";
import "./ReceiptReprintTable.css";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
// default doctor removed
import UploadFile from "../utils/UploadFileModal/UploadFile";
import DispatchPatientDetailModal from "../utils/DispatchPatientDetailModal";
import DateTimeCell from "../../utils/DateTimeCell";
import { Modal, Form } from "react-bootstrap";
import { IoDocumentTextOutline } from "react-icons/io5";

function RETable({
  redata,
  TableData,
  Status,
  SetReData,
  GetResultEntry,
  show,
  show2,
  handleInnerChecked,
  columnConfig,
  getFilterResultOption,
  showColumnModal,
  setShowColumnModal,
  selectedRowIndex,
  setSelectedRowIndex,
  doctorAdmin,
  machine,
  setReturnFromResultTableWithStatus,
  filterData = [],
  onPreview,
  currentPage,
  pageSize,
  setSelectedData,
  setIncludeDepartment,
  selectedDepartment,
  onEyeClick,
  setExpansionAnchor,
  expandedRowIndex,
  onCloseExpansion,
  viewMode = "table",
}) {

  const {
    DefaultCurrencyName,
    EmployeeID,
  } = useLocalStorage("userData", "get");

  const [modal, setModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState({});
  const [selectedLedgerTransactionNo, setSelectedLedgerTransactionNo] =
    useState(null);
  const [selectedTestID, setSelectedTestID] = useState(null);
  const [datemodal, showDatemodal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [TestID, setTestID] = useState();
  const [loading, setLoading] = useState(false);
  const [Index, setIndex] = useState(-1);
  const [prevPageSize, setPreviousPageSize] = useState();
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" && window.innerWidth <= 767,
  );

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [printLoading, setPrintLoading] = useState({
    With: false,
    Without: false,
    index: -1,
  });

  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });

  const [showUpdateRemark, setShowUpdateRemark] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    data: null,
  });

  const [showFileModal, setShowFileModal] = useState({
    modal: false,
    data: "",
    ledgerTransactionId: null,
  });

  const [portalTestID, setPortalTestID] = useState(null);

  const dynamicAllowedSet = new Set(
    filterData
      .filter((item) => item.TypeId == 2 && item.IsShow == 1)
      .map((item) => item.ControlDisplayID),
  );

  const iconMapping = {
    "Uploaded Document": "fa-file",
    "Medical History": "fa-h-square",
    "Customize Date": "fa-edit"
  };

  const rawColumnsToRender = useMemo(() => {
    return filterData
      .filter(
        (item) =>
          item.TypeId == 2 &&
          item.IsShow == 1 &&
          !(isMobileView && item.IsMobile == 1),
      )
      .map((item) => {
        const headerName = item.ControlDisplayID;
        return {
          header: headerName,
          icon: iconMapping[headerName] || null,
          tooltip: item.TooltipText || headerName,
          style: { whiteSpace: "nowrap" },
          bold: item.Bold == 1,
          fontSize: Number(item.FontSize) > 0 ? Number(item.FontSize) : null,
          colWidth: Number(item.Width) > 0 ? Number(item.Width) : null,
        };
      });
  }, [filterData, isMobileView]);

  // The gear icon's Show/Hide Columns modal (below) toggles this — was
  // previously a no-op since columnsToRender ignored columnConfig entirely.
  const columnsToRender = useMemo(() => {
    if (!columnConfig || columnConfig.length === 0) return rawColumnsToRender;
    return rawColumnsToRender.filter((col) => {
      const configItem = columnConfig.find(
        (c) => c.header?.toLowerCase() === col.header?.toLowerCase()
      );
      if (configItem) return configItem.visible == 1 || configItem.visible === true;
      return true;
    });
  }, [rawColumnsToRender, columnConfig]);

  const allTableFields = useMemo(
    () => rawColumnsToRender.map((c) => c.header),
    [rawColumnsToRender]
  );

  const configList = useMemo(() => {
    return allTableFields.map((field) => {
      const configItem = columnConfig?.find(
        (c) => c.header?.toLowerCase() === field?.toLowerCase()
      );
      return {
        header: field,
        visible: configItem ? (configItem.visible == 1 || configItem.visible === true) : true,
      };
    });
  }, [allTableFields, columnConfig]);

  const handleColumnToggle = (index) => {
    const updatedColumn = configList.map((ele, i) =>
      i === index ? { ...ele, visible: !ele.visible } : ele
    );

    axiosInstance
      .post("Lab/SaveFilterTableReprintData", {
        SaveData: updatedColumn,
        saveData: updatedColumn,
        PageName: "ResultEntry",
        pageName: "ResultEntry",
        EmployeeId: EmployeeID?.toString() || "",
        employeeId: EmployeeID?.toString() || "",
        EmployeeID: EmployeeID?.toString() || "",
      })
      .then(() => {
        if (typeof getFilterResultOption === "function") {
          getFilterResultOption();
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update column configuration");
      });
  };

  const handleOpenPreview = (keys) => {
    const parsedKeys = parseAwsKeys(keys);
    if (!parsedKeys) return;
    setPreviewConfig({
      visible: true,
      url: parsedKeys,
    });
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return redata.slice(startIndex, startIndex + pageSize);
  }, [redata, currentPage, pageSize]);

  const tdRefs = useRef([]);
  const testRowRefs = useRef({});
  const [testRowHeights, setTestRowHeights] = useState({});

  useLayoutEffect(() => {
    const next = {};
    Object.entries(testRowRefs.current).forEach(([key, el]) => {
      if (el) next[key] = el.offsetHeight;
    });
    setTestRowHeights((prev) => {
      const keys = Object.keys(next);
      const unchanged =
        keys.length === Object.keys(prev).length &&
        keys.every((key) => prev[key] === next[key]);
      return unchanged ? prev : next;
    });
  }, [paginatedData]);

  useEffect(() => {
    if (tdRefs?.current[selectedRowIndex]) {
      tdRefs?.current[selectedRowIndex]?.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest",
      });
    }
  }, [selectedRowIndex]);

  useEffect(() => {
    if (expandedRowIndex === null) {
      setPortalTestID(null);
    }
  }, [expandedRowIndex]);

  const { t } = useTranslation();

  const [medicalHistoryTooltipData, setMedicalHistoryTooltipData] = useState({
    data: [],
    loadingIndex: -1,
  });

  const fetchMedicalHistoryTooltipData = (medicalHistoryList, index) => {
    try {
      if (medicalHistoryList) {
        const medicalHistory =
          typeof medicalHistoryList === "string"
            ? JSON.parse(medicalHistoryList)
            : medicalHistoryList;
        setMedicalHistoryTooltipData({
          data: medicalHistory,
          loadingIndex: -1,
        });
      }
    } catch (error) {
      console.error("Error parsing medical history:", error);
      setMedicalHistoryTooltipData({
        data: [],
        loadingIndex: -1,
      });
    }
  };

  function CreateCheckbox({ item, ledgerId }) {
    if (item.Status == 5 || item.Status == 6) {
      return (
        <input
          type="checkbox"
          onClick={(e) => e.stopPropagation()}
          onChange={() => handleCheck(item, ledgerId)}
          checked={selectedTests[ledgerId]?.includes(item.TestIdhash) || false}
          value={item.TestIdhash}
          id={item.LedgerTransactionID}
          className={`${item.LedgerTransactionID}`}
        />
      );
    }
    return "";
  }

  const handleCheck = (item, ledgerId) => {
    setSelectedTests((prev) => {
      const prevList = prev[ledgerId] || [];
      const updatedList = prevList.includes(item.TestIdhash)
        ? prevList.filter((id) => id !== item.TestIdhash)
        : [...prevList, item.TestIdhash];
      return { ...prev, [ledgerId]: updatedList };
    });
  };

  const getPrintableTestHashes = (data) => {
    return data.TestDetails.filter((t) => t.Status === 5 || t.Status === 6).map(
      (t) => t.TestIdhash,
    );
  };

  const hasPrintableTests = (data) => {
    console.log("data approved", data?.TestDetails)
    return data?.TestDetails?.some(
      (item) => item.IsApproved == 1,
    );
  };

  const handleReport = (data, loader, index, PHead) => {
    console.log("dataxx",data);
    if (printLoading.index !== -1) {
      toast.warn("Please wait Generating Report");
      return;
    }

    const ledgerId = data.LedgerTransactionID;
    let TestIDHash = selectedTests[ledgerId] || [];

    if (TestIDHash.length === 0) {
      TestIDHash = data.TestDetails.filter(
        (test) => test.Status == 5 || test.Status == 6,
      ).map((test) => test.TestIdhash);
    }

    if (TestIDHash.length === 0) {
      toast.warn("No printable report found");
      return;
    }
    const printedTestHashes = [...new Set(TestIDHash)];

    setPrintLoading({ [loader]: true, index });

    axiosReport
      .post(
        "commonReports/GetLabReport",
        {
          TestIDHash: [...new Set(TestIDHash)],
          PHead,
          PrintColour: "1",
          IsDownload: 1,
        },
        { responseType: "blob" },
      )
      .then(async (res) => {
        const blob = res.data;
        const isJson =
          blob.type === "application/json" ||
          blob.type === "text/json" ||
          blob.type === "text/plain";

        if (isJson) {
          const text = await blob.text();
          let json = {};
          try {
            json = JSON.parse(text);
            if (!json.success) {
              notify(json?.message, "error");
              setPrintLoading({ [loader]: false, index: -1 });
              return;
            }
            notify(json?.message || "Something went wrong", "error");
          } catch { }
          setPrintLoading({ [loader]: false, index: -1 });
          return;
        }

        const pdfUrl = window.URL.createObjectURL(blob);
        window.open(pdfUrl, "_blank");
        if (window.innerWidth <= 765) {
          downloadPdf(res.data);
        }
        SetReData((prev) =>
          prev.map((row) => {
            if (row.VisitNo === data?.VisitNo) {
              return {
                ...row,
                TestDetails: row?.TestDetails?.map((test) =>
                  printedTestHashes.includes(test.TestIdhash)
                    ? {
                      ...test,
                      Status: "6",
                    }
                    : test
                ),
              };
            }
            return row;
          })
        );
        setPrintLoading({ [loader]: false, index: -1 });
        setSelectedTests({});
        setSelectedTestID(null);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Print failed");
        setPrintLoading({ [loader]: false, index: -1 });
        setSelectedTestID(null);
      });
  };

  const copyToClipboard = (phone) => {
    navigator.clipboard.writeText(phone);
  };

  useEffect(() => {
    if (currentPage > 1) {
      setPreviousPageSize(
        Number(window?.sessionStorage.getItem(`REprevPZ-${currentPage - 1}`)),
      );
    } else {
      setPreviousPageSize(0);
    }
  }, [redata]);

  const handleClickResultEntry = (data, index) => {
    setReturnFromResultTableWithStatus(data?.Status);
    setIndex(index);
    setSelectedRowIndex(index);
    setSelectedData(data);
    setIncludeDepartment(true);
    GetResultEntry(
      {
        TestID: data?.TestID,
        LedgerTransactionID: data?.LedgerTransactionID || 0,
        DepartmentID: data?.DepartmentIDs ? data.DepartmentIDs : [],
        DepartmentCode: data?.DepartmentCodes ? data.DepartmentCodes : [],
        symbol: "",
        Mobile: data?.Mobile,
        VisitNo: data?.VisitNo,
        PEmail: data?.PEmail,
        MacID:  "",
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
        isOutSource: data?.isOutSource,
        index: index,
        ApprovedBy: "",
        from: "resultClick",
        SelectedDepartmentId: selectedDepartment || [0],
        isEyeModal: true,
      },
      index,
      setLoading,
    );
  };

  const handleVisitNoClick = (data, index) => {
    setReturnFromResultTableWithStatus(data?.Status);
    setIndex(index);
    setSelectedRowIndex(index);
    setSelectedData(data);
    setIncludeDepartment(true);
    GetResultEntry(
      {
        TestID: data?.TestID,
        LedgerTransactionID: data?.LedgerTransactionID || 0,
        DepartmentID: data?.DepartmentIDs ? data.DepartmentIDs : [],
        DepartmentCode: data?.DepartmentCodes ? data.DepartmentCodes : [],
        symbol: "",
        Mobile: data?.Mobile,
        VisitNo: data?.VisitNo,
        PEmail: data?.PEmail,
        MacID: "",
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
        isOutSource: data?.isOutSource,
        index: index,
        ApprovedBy: "",
        from: "resultClick",
        SelectedDepartmentId: selectedDepartment || [0],
      },
      index,
      setLoading,
    );
  };

  const encryptData = (data, index) => {
    const secretKey = "resultentry";
    const filteredData = {
      TestID: data?.TestID,
      Mobile: data?.Mobile,
      VisitNo: data?.VisitNo,
      PEmail: data?.PEmail,
      LedgertransactionIDHash: data?.LedgertransactionIDHash,
      isOutSource: data?.isOutSource,
      index: index,
      ApprovedBy: "",
      MacID: data?.MacID || machine[0]?.value || "",
    };
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(filteredData),
      secretKey,
    ).toString();
    return encodeURIComponent(encrypted);
  };

  const extractValuesFromHtml = (htmlString) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    const inputElements = tempDiv.querySelectorAll('input[type="checkbox"]');
    return Array.from(inputElements).map((input) => input.value);
  };

  const handleAllAprovedChecked = (e, data) => {
    const { checked } = e.target;
    let documentlength = document.getElementsByClassName(
      data?.LedgerTransactionID,
    );
    const extractedValues = extractValuesFromHtml(data?.Test);
    for (let i = 0; i < documentlength.length; i++) {
      const checkboxValue = documentlength[i].value;
      if (extractedValues.includes(checkboxValue)) {
        documentlength[i].checked = checked;
      }
    }
  };

  const handleTestClick = (testID, data, index, rowIndex) => {
    setIndex(index);
    setSelectedRowIndex(rowIndex);
    setSelectedData(data);
    setIncludeDepartment(false);
    GetResultEntry(
      {
        TestID: testID?.toString(),
        LedgerTransactionID: data?.LedgerTransactionID || 0,
        DepartmentID: [],
        DepartmentCode: [],
        symbol: "",
        Mobile: data?.Mobile,
        VisitNo: data?.VisitNo,
        PEmail: data?.PEmail,
        MacID: data?.MacID || "",
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
        isOutSource: data?.isOutSource,
        index: index,
        ApprovedBy: "",
        from: "testClick",
        SelectedDepartmentId: selectedDepartment || [0],
      },
      rowIndex,
      setLoading,
    );
  };

  const renderTestLine = (test, testIndex, data, index) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
      <i
        className={`bi ${expandedRowIndex === index && portalTestID === test.TestID?.toString() ? "bi-caret-up-fill" : "bi-caret-down-fill"} cursor-pointer`}
        style={{ fontSize: "16px", color: "#274C77", marginTop: "2px" }}
        onClick={(e) => {
          e.stopPropagation();
          if (expandedRowIndex === index && portalTestID === test.TestID?.toString()) {
            onCloseExpansion && onCloseExpansion();
            setPortalTestID(null);
          } else {
            setPortalTestID(test.TestID?.toString());
            setReturnFromResultTableWithStatus(data?.Status);
            setIndex(index);
            setSelectedRowIndex(index);
            setSelectedData(data);
            setIncludeDepartment(false);
            GetResultEntry(
              {
                TestID: test.TestID?.toString(),
                LedgerTransactionID: data?.LedgerTransactionID || 0,
                DepartmentID: [],
                DepartmentCode: [],
                symbol: "",
                Mobile: data?.Mobile,
                VisitNo: data?.VisitNo,
                PEmail: data?.PEmail,
                MacID: "",
                LedgertransactionIDHash: data?.LedgertransactionIDHash,
                isOutSource: data?.isOutSource,
                index: index,
                ApprovedBy: "",
                from: "testClick",
                SelectedDepartmentId: selectedDepartment || [0],
                isEyeModal: true,
              },
              index,
              setLoading,
            );
          }
        }}
      ></i>

      <div className="flex-column w-100">
        <div
          className={`round Status-${test.Status} ${Number(test.Status) === 10 && Number(test.IsPartialResult) === 1 && Number(test.IsApproved) !== 1 ? "partial-result-badge" : ""}`}
          onClick={() => handleTestClick(test.TestID, data, testIndex, index)}
          style={{
            color: test.Status === 11 ? "black" : "",
            flex: 1,
            minWidth: 0,
          }}
          title={Number(test.Status) === 10 && Number(test.IsPartialResult) === 1 && Number(test.IsApproved) !== 1 ? "Partial Result" : ""}
        >
          {(() => {
            const rawTestName = String(test?.TestName || test?.ItemName || test?.testName || "");
            const parts = rawTestName.split("<br>");
            const displayParts = parts.length > 1 ? parts.slice(1) : parts;
            return (
              <>
                {displayParts[0] && (
                  <p className="mb-0">
                    <span className="mr-1">
                      <CreateCheckbox item={test} ledgerId={data.LedgerTransactionID} />
                    </span>
                    {displayParts[0]}
                    {Number(test.Status) === 10 && Number(test.IsPartialResult) === 1 && Number(test.IsApproved) !== 1 && (
                      <span className="badge partial-result-badge ml-1">
                        Partial
                      </span>
                    )}
                  </p>
                )}
                {displayParts.slice(1).map((line, lineIndex) => (
                  <p key={lineIndex} className="mb-0">
                    {line}
                  </p>
                ))}
              </>
            );
          })()}
        </div>
      </div>
      <i
        className="fa fa-edit text-primary"
        style={{ cursor: "pointer", flexShrink: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          if (onEyeClick) {
            onEyeClick({ ...data, TestID: test.TestID?.toString() }, testIndex, index);
          }
        }}
      />
    </div>
  );

  // ✅ Helper to render cell content based on column header
  const renderCell = (col, data, index) => {
    switch (col.header) {
      case "S.No":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <div> {index + 1 + IndexHandle(currentPage, pageSize)}</div>
            &nbsp;
            {data.StatSample == 1 && (
              <div>
                <span
                  className="fa fa-cog fa-spin"
                  data-toggle="tooltip"
                  data-placement="top"
                  title="STATSample"
                />
              </div>
            )}
            &nbsp;

            <div>
              <i
                className="fa fa-search"
                onClick={() => {
                  setModal(true);
                  setVisitID(data?.VisitNo);
                }}
                style={{ cursor: "pointer" }}
              />
            </div>

            {data?.IsPatientDocAvail > 0 && (
              <div>
                {/* <i
                  className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                  style={{ fontSize: "16px" }}
                  onClick={() => handleOpenPreview(data?.awsKeys)}
                  title="View Attachments"
                /> */}
                <IoDocumentTextOutline
                  color="#0080ff"
                  style={{ fontSize: "18px" }}
                  onClick={() => handleOpenPreview(data?.awsKeys)}
                  title="View Attachments"
                />
              </div>
            )}
            {DefaultCurrencyName == "KES" && data?.Department === "HISTOPATHOLOGY" && (
              <div>
                <i
                  className="fa fa-address-card text-danger cursor-pointer"
                  style={{ fontSize: "16px" }}
                  onClick={() =>
                    setShowFileModal((prev) => ({
                      ...prev,
                      modal: true,
                      data: data?.ReportAwsKeys,
                    }))
                  }
                  title="Attach Report Documents"
                />
              </div>
            )}
            {data?.isUrgent == 1 && (
              <div>
                <img src={Urgent} className="sizeicon" title="Urgent" />
              </div>
            )}
            {data?.IsVip === 1 && (
              <div>
                <i
                  className="bi bi-shield-fill-check mr-1 vip-font-size"
                  style={{ color: "#FFC107", display: "inline", width: "5%" }}
                  title="VIP Patient"
                />
              </div>
            )}
          </div>
        );

      case "TAT Status":
        let bgColor = "";
        let text = "";
        let textColor = "white";

        if (data?.TATDelay == 1) {
          bgColor = "red";
          text = "Outside TAT";
          textColor = "white";
        } else if (data?.TATIntimate == 1) {
          bgColor = "yellow";
          text = "Near TAT";
          textColor = "black";
        } else {
          bgColor = "green";
          text = "Within TAT";
          textColor = "white";
        }

        return (
          <span
            style={{
              backgroundColor: bgColor,
              color: textColor,
              fontWeight: "bold",
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "3px",
              display: "inline-block",
            }}
          >
            {text}
          </span>
        );

      case "S.CollectionDate":
        return (
          // <div className="">
          //   <p className="mb-0">
          //     {data?.SampleCollectionDate
          //       ? moment(data.SampleCollectionDate).format("DD/MMM/YYYY")
          //       : "N/A"}
          //   </p>
          //   <p className="mb-0">
          //     {data?.SampleCollectionDate
          //       ? moment(data.SampleCollectionDate).format("hh:mm A")
          //       : ""}
          //   </p>
          // </div>
          <DateTimeCell dateString={data.SampleCollectionDate} />
        );

      case "Reg Date":
        return (
          // <div className="mr-2">
          //   <p className="mb-0">
          //     {data?.Date
          //       ? moment(data.Date).format("DD/MMM/YYYY")
          //       : "N/A"}
          //   </p>
          //   <p className="mb-0">
          //     {data?.Date
          //       ? moment(data.Date).format("hh:mm A")
          //       : ""}
          //   </p>
          // </div>
          <DateTimeCell dateString={data.Date} />
        );

      case "Dep. Receive Time":
        return (
          // <div className="">
          //   <p className="mb-0">
          //     {data?.SampleReceiveDate
          //       ? moment(data.SampleReceiveDate).format("DD/MMM/YYYY")
          //       : "N/A"}
          //   </p>
          //   <p className="mb-0">
          //     {data?.SampleReceiveDate
          //       ? moment(data.SampleReceiveDate).format("hh:mm A")
          //       : ""}
          //   </p>
          // </div>
          <DateTimeCell dateString={data.SampleReceiveDate} />
        );

      case "Visit No":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <div
              className="text-primary"
              
              style={{ cursor: "pointer", fontWeight: "bold" }}
              onClick={() => handleVisitNoClick(data, index)}
            >
              {loading && index === Index ? <Loading /> : data?.VisitNo}
            </div>
            <Link
              to={{
                pathname: "/ResultEntry",
                search: `?id=${encryptData(data, index)}`,
              }}
              target="_blank"
            >
              <i
                className="ml-1 bi bi-box-arrow-in-up-right text-icon-size-arrow"
                style={{ color: "#1FA4E3" }}
              />
            </Link>
          </div>
        );

      case "Ward No":
        return data?.BedNo;

      case "hmis_patCrNo":
        return data?.hmis_patCrNo;

      case "HLMPatientType":
        return data?.HLMPatientType;

      case "HLMOPDIPDNo":
        return data?.HLMOPDIPDNo || data?.OPDIPD || data?.OPDIPDNo;

      case "Barcode No":
        return (
          <b>
            {(data?.SinNo || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((sinNo, i) => (
                <div key={i}>{sinNo}</div>
              ))}
          </b>
        );

      case "UHID":
        return data?.PatientCode;
      case "HNo":
        return data?.HNo;

      case "Name":
        return (
          <div
            style={{ width: "150px", wordWrap: "break-word", whiteSpace: "normal" }}
          >
            {data?.PatientName}
          </div>
        );

      case "Mobile":
        return data?.Mobile;

      case "Age/Gender":
         return <b>{`${getAccurateAge(data?.Age)}/${data?.Gender}`}</b>;

      case "Test":
        return (
          <div className="printTest dispatchTestCell">
            {data?.TestDetails.map((test, testIndex) => (
              <div key={testIndex} style={{ marginBottom: "4px" }}>
                {renderTestLine(test, testIndex, data, index)}
              </div>
            ))}
          </div>
        );

      case "Print":
        return hasPrintableTests(data) ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {printLoading.Without && printLoading.index === index ? (
              <SpinnerLoad />
            ) : (
              <i
                className="fa fa-print iconStyle"
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => handleReport(data, "Without", index, 0)}
                title="Print without header"
              />
            )}
            &nbsp;&nbsp;&nbsp;&nbsp;
            {printLoading.With && printLoading.index === index ? (
              <SpinnerLoad />
            ) : (
              <i
                className="fa fa-print iconStyle"
                style={{ color: "red", cursor: "pointer", textAlign: "center" }}
                onClick={() => handleReport(data, "With", index, 1)}
                title="Print with header"
              />
            )}
          </div>
        ) : null;

      case "Doctor":
        return data?.DoctorName;

      case "Dept.Category":
        return data?.Category;

      case "VisitType":
        return data?.VisitType;

      case "Centre":
        return data?.Centre;

      case "RateType":
        return data?.RateTypeName;

      case "RateTypeCode":
        return data?.RateTypeCode;

      case "Remarks":
        return (
          <div
            style={{ gap: "4px" }}
            className="d-flex align-items-start justify-content-start"
          >
            <div
              style={
                viewMode === "card"
                  ? { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "6px" }
                  : { display: "flex", flexDirection: "column", gap: "4px" }
              }
            >
              {(data?.TestDetails?.length > 0 ? data.TestDetails : [data]).map(
                (test, testIndex) => (
                  <div
                    key={testIndex}
                    className="d-flex align-items-center justify-content-start"
                    style={{
                      gap: "4px",
                      minHeight:
                        viewMode === "card"
                          ? undefined
                          : testRowHeights[`${index}-${testIndex}`]
                            ? `${testRowHeights[`${index}-${testIndex}`]}px`
                            : "18px",
                    }}
                  >
                    <div
                      data-tooltip-id={`remark-tooltip-${index}-${testIndex}`}
                      onClick={() =>
                        setShowAddRemark({
                          modal: true,
                          rowData: { ...data, TestID: test.TestID?.toString() },
                        })
                      }
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
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
                          flexShrink: 0,
                        }}
                      >
                        <FaPlus color="white" size={8} />
                      </div>
                      {test.LabRemarkCount > 0 && (
                        <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: "18px" }}>
                          ({test.LabRemarkCount})
                        </span>
                      )}
                    </div>
                    {Array.isArray(test?.RemarksList) &&
                      test?.RemarksList?.length > 0 && (
                        <ReactTooltip
                          id={`remark-tooltip-${index}-${testIndex}`}
                          place="top"
                          positionStrategy="fixed"
                          style={{ zIndex: 9999 }}
                          clickable
                          content={<RemarkTooltip remarks={test.RemarksList} />}
                        />
                      )}
                  </div>
                )
              )}
            </div>
            <FaEye
              style={{
                marginLeft: "10px",
                fontSize: "18px",
                cursor: "pointer",
                color: "#007bff",
                flexShrink: 0,
              }}
              onClick={() => {
                setShowPatientModal(true);
                setSelectedLedgerTransactionNo(data?.VisitNo);
                setSelectedTestID(data?.TestID || 0);
              }}
            />
          </div>
        );

      case "Uploaded Document":
        return (
          <img
            src={file}
            className="sizeicon"
            style={{
              cursor: "pointer",
              color: data?.UploadDocumentCount > 0 ? "#4ea30c" : "",
            }}
            onClick={() =>
              show2({ modal: true, data: data?.PatientGuid, index })
            }
          />
        );

      case "Medical History":
        return (
          <>
            <img
              src={Medical}
              className="sizeicon"
              style={{
                cursor: "pointer",
                color: data?.MedicalHistoryCount > 0 ? "#4ea30c" : "",
              }}
              onClick={() =>
                show({
                  modal: true,
                  data: data?.PatientGuid,
                  index,
                  ID: data?.LedgerTransactionID,
                })
              }
              onMouseEnter={() => {
                if (data?.MedicalHistoryCount > 0) {
                  fetchMedicalHistoryTooltipData(
                    data?.MedicalHistoryList,
                    index,
                  );
                }
              }}
              data-tooltip-id={`medical-history-tooltip-${index}`}
            />
            <span>
              {data?.MedicalHistoryCount > 0 &&
                `(${data?.MedicalHistoryCount})`}
            </span>
            {data?.MedicalHistoryCount > 0 && (
              <ReactTooltip
                id={`medical-history-tooltip-${index}`}
                place="top"
                style={{
                  zIndex: 99999,
                  backgroundColor: "#fff",
                  color: "#000",
                  padding: "8px",
                }}
                clickable
                content={
                  medicalHistoryTooltipData?.data?.length > 0 ? (
                    <div
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        width: "400px",
                        background: "rgba(143, 142, 142, 0.9)",
                      }}
                    >
                      <table className="table table-sm table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Medical History</th>
                            <th>Created Date</th>
                            <th>Created By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicalHistoryTooltipData.data.map((item, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>{item.MedicalHistory}</td>
                              <td>{dateConfig(item.CreatedDate)}</td>
                              <td>{item.CreatedBy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    "No medical history found"
                  )
                }
              />
            )}
          </>
        );

      case "Customize Date":
        return (
          <i
            className="fa fa-edit"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setTestID(data.TestID);
              showDatemodal(true);
            }}
          />
        );

      case "LastRemark":
        if (!data?.RemarksList || data?.RemarksList?.length === 0) {
          return "";
        }

        const sortedRemarks = [...data.RemarksList].sort((a, b) => {
          const dateDiff =
            moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") -
            moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A");

          if (dateDiff !== 0) return dateDiff;

          return data.RemarksList.indexOf(b) - data.RemarksList.indexOf(a);
        });

        console.log("sortedRemarks", sortedRemarks);

        return (
          <div
            style={{
              maxWidth: "200px",
            }}
          >
            <ul style={{ paddingLeft: "2px", margin: 0, listStyleType: "none" }}>
              {sortedRemarks?.map((item, index) => {
                const remarkText = item?.LabRemarks || "";

                return (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "4px",
                      fontWeight: "bold",
                      marginBottom: "4px",
                      cursor: "pointer",
                    }}
                  >
                    <span>•</span>
                    <span
                      className="remark-item"
                      data-tooltip-id="remark-tooltip"
                      data-tooltip-content={remarkText}>{remarkText}</span>
                  </li>
                );
              })}
            </ul>

            <ReactTooltip
              id="remark-tooltip"
              positionStrategy="fixed"
              style={{
                backgroundColor: "#2d3748",
                color: "#fff",
                fontSize: "12px",
                borderRadius: "4px",
                padding: "6px 10px",
                maxWidth: "250px",
                whiteSpace: "normal",
                wordBreak: "break-word",
                zIndex: 9999
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  console.log("redata", redata);
  console.log("filterData", filterData);
  console.log("columnConfig", columnConfig)

  return (
    <>
      {showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => {
            setShowFileModal({
              modal: false,
              data: "",
              ledgerTransactionId: null,
            });
          }}
          documentId={showFileModal?.data}
          pageName="HistoImage"
          toView={true}
        />
      )}
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          visitKey="VisitNo"
          testIDsKey="TestID"
          testNamesKey="TestName"
          ledgerTransactionIDKey="LedgerTransactionID"
          patientNameKey="PatientName"
          ageGenderKey={["Age", "Gender"]}
          defaultTestFromRow={true}
          filterTestID={showAddRemark.rowData?.TestID}
        />
      )}

      {redata.length > 0 ? (
        viewMode === "card" ? (
          <div className="rr-card-grid">
            {paginatedData.map((data, index) => {
              // Same admin-configured column visibility the table uses —
              // card layout itself is fixed (not reorderable), only
              // show/hide is respected, matching Dispatch Report's card view.
              const has = (id) => !!columnsToRender.find((c) => c.header === id);
              const SPECIAL_HEADERS = [
                "S.No",
                "Visit No",
                "Barcode No",
                "Name",
                "Age/Gender",
                "Doctor",
                "Test",
                "Print",
                "Remarks",
                "Uploaded Document",
                "Medical History",
              ];

              return (
                <div key={index} className="rr-card">
                  <div className="rr-card__header">
                    <div className="rr-card__ids">
                      {isMobileView ? (
                        <div className="rr-card__visitno rr-card__visitno-row">
                          {has("S.No") && (
                            <span className="rr-card__sno-inline">
                              {renderCell({ header: "S.No" }, data, index)}
                            </span>
                          )}
                          {has("Visit No") &&
                            renderCell({ header: "Visit No" }, data, index)}
                        </div>
                      ) : (
                        has("Visit No") && (
                          <span className="rr-card__visitno">
                            {renderCell({ header: "Visit No" }, data, index)}
                          </span>
                        )
                      )}
                      {has("Barcode No") && (
                        <span className="rr-card__barcode">
                          {renderCell({ header: "Barcode No" }, data, index)}
                        </span>
                      )}
                    </div>
                    {!isMobileView && has("S.No") && (
                      <div>{renderCell({ header: "S.No" }, data, index)}</div>
                    )}
                  </div>

                  <div className="rr-card__identity">
                    {has("Name") && (
                      <div className="rr-card__patient">
                        {renderCell({ header: "Name" }, data, index)}
                      </div>
                    )}
                    {(has("Age/Gender") || has("Doctor")) && (
                      <div className="rr-card__meta">
                        {has("Age/Gender") && (
                          <span>{renderCell({ header: "Age/Gender" }, data, index)}</span>
                        )}
                        {has("Age/Gender") && has("Doctor") && (
                          <span className="rr-card__dot">•</span>
                        )}
                        {has("Doctor") && (
                          <span>{renderCell({ header: "Doctor" }, data, index)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rr-card__divider" />

                  {(() => {
                    const DATE_ROW_HEADERS = [
                      "S.CollectionDate",
                      "Reg Date",
                      "Dep. Receive Time",
                    ];
                    const bodyCols = columnsToRender.filter(
                      (col) => !SPECIAL_HEADERS.includes(col.header),
                    );
                    const dateCols = isMobileView
                      ? bodyCols.filter((col) => DATE_ROW_HEADERS.includes(col.header))
                      : [];
                    const restCols = isMobileView
                      ? bodyCols.filter((col) => !DATE_ROW_HEADERS.includes(col.header))
                      : bodyCols;

                    return (
                      <>
                        {dateCols.length > 0 && (
                          <div className="rr-card__dates-row">
                            {dateCols.map((col, colIdx) => {
                              const content = renderCell(col, data, index);
                              if (content === null || content === undefined || content === "")
                                return null;
                              return (
                                <div className="rr-card__field" key={colIdx}>
                                  <span className="rr-card__field-label">{t(col.header)}</span>
                                  <span className="rr-card__field-value">{content}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="rr-card__body">
                          {restCols.map((col, colIdx) => {
                            const content = renderCell(col, data, index);
                            if (content === null || content === undefined || content === "")
                              return null;
                            return (
                              <div className="rr-card__field" key={colIdx}>
                                <span className="rr-card__field-label">{t(col.header)}</span>
                                <span className="rr-card__field-value">{content}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}

                  {has("Test") && (
                    <>
                      <div className="rr-card__divider" />
                      <div className="rr-card__tests-scroll">
                        {(data?.TestDetails || []).map((test, testIdx) => (
                          <div className="rr-card__test-line" key={testIdx}>
                            {renderTestLine(test, testIdx, data, index)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {(has("Print") || has("Remarks") || has("Uploaded Document") || has("Medical History")) && (
                    <div
                      className={`rr-card__footer d-flex align-items-center justify-content-end`}
                      style={{
                        marginTop: "4px",
                        borderTop: "1px solid var(--ng-border, #eef0f3)",
                        gap: "10px",
                      }}
                    >
                      {has("Uploaded Document") && renderCell({ header: "Uploaded Document" }, data, index)}
                      {has("Medical History") && renderCell({ header: "Medical History" }, data, index)}
                      {has("Remarks") && renderCell({ header: "Remarks" }, data, index)}
                      {has("Print") && renderCell({ header: "Print" }, data, index)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
        <div className="px-1">
          <Tables style={{ height: "600px", maxHeight: "600px", overflowY: "auto" }}>
            <div>
              <thead style={{ position: "sticky", top: 0 }}>
                <tr>
                  {columnsToRender.map((col, index) => (
                    <th
                      key={index}
                      style={
                        col.colWidth
                          ? {
                              width: `${col.colWidth}px`,
                              minWidth: `${col.colWidth}px`,
                              maxWidth: `${col.colWidth}px`,
                            }
                          : undefined
                      }
                    >
                      {col?.icon ? (
                        <i
                          className={`fa ${col?.icon}`}
                          data-toggle="tooltip"
                          title={col?.tooltip || col?.header}
                          style={col?.style}
                        />
                      ) : (
                        t(col?.header)
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody
                style={{
                  backgroundColor:
                    printLoading?.With || printLoading?.Without
                      ? "rgba(181, 209, 218, 0.5)"
                      : "",
                }}
              >
                {paginatedData.map((data, index) => {
                  const testList = data?.TestDetails || [];
                  const rowBg = data?.isOutSource == 1 ? "pink" : "";
                  const cellBg = (col) =>
                    col.header === "TAT Status"
                      ? data?.TATDelay == 1
                        ? "red"
                        : data?.TATIntimate == 1
                          ? "yellow"
                          : "green"
                      : selectedRowIndex === index
                        ? "#edea9f"
                        : rowBg;

                  if (testList.length === 0) {
                    return (
                      <tr
                        key={index}
                        style={{ backgroundColor: rowBg }}
                        ref={(el) => (tdRefs.current[index] = el)}
                      >
                        {columnsToRender.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            style={{ backgroundColor: cellBg(col) }}
                            data-title={t(col.header)}
                            className={
                              col.header === "Test" ? "dispatch-test-col" : ""
                            }
                          >
                            {renderCell(col, data, index)}
                          </td>
                        ))}
                      </tr>
                    );
                  }

                  // Patient-level columns (S.No, Name, Print, Doctor, etc.) are
                  // rowSpan'd across a *run* of test rows. A detail row is a
                  // real full-width <tr>, so it breaks the run: the rowSpan
                  // can't cover it (that column space is used by the detail
                  // cell itself), so a new run/rowSpan starts right after it.
                  const segmentStarts = {};
                  let segStart = 0;
                  testList.forEach((test, i) => {
                    if (expandedRowIndex === index && portalTestID === test.TestID?.toString()) {
                      segmentStarts[segStart] = i - segStart + 1;
                      segStart = i + 1;
                    }
                  });
                  if (segStart <= testList.length - 1) {
                    segmentStarts[segStart] = testList.length - segStart;
                  }

                  return (
                    <React.Fragment key={index}>
                      {testList.map((test, testIdx) => {
                        const segmentLength = segmentStarts[testIdx];
                        return (
                          <React.Fragment key={testIdx}>
                            <tr
                              style={{ backgroundColor: rowBg }}
                              ref={
                                testIdx === 0
                                  ? (el) => (tdRefs.current[index] = el)
                                  : undefined
                              }
                            >
                              {segmentLength ? (
                                columnsToRender.map((col, colIndex) =>
                                  col.header === "Test" ? (
                                    <td
                                      key={colIndex}
                                      style={{ backgroundColor: cellBg(col) }}
                                      data-title={t(col.header)}
                                      className="dispatch-test-col"
                                    >
                                      {renderTestLine(test, testIdx, data, index)}
                                    </td>
                                  ) : (
                                    <td
                                      key={colIndex}
                                      rowSpan={segmentLength}
                                      style={{ backgroundColor: cellBg(col) }}
                                      data-title={t(col.header)}
                                    >
                                      {renderCell(col, data, index)}
                                    </td>
                                  ),
                                )
                              ) : (
                                <td
                                  style={{ backgroundColor: cellBg({ header: "Test" }) }}
                                  data-title={t("Test")}
                                  className="dispatch-test-col"
                                >
                                  {renderTestLine(test, testIdx, data, index)}
                                </td>
                              )}
                            </tr>
                            {expandedRowIndex === index && portalTestID === test.TestID?.toString() && (
                              <tr>
                                <td colSpan={columnsToRender.length} style={{ padding: 0, border: 0 }}>
                                  <div ref={setExpansionAnchor} style={{ width: "100%" }} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </div>
          </Tables>
        </div>
        )
      ) : (
        <div>
          <NoRecordFound />
        </div>
      )}

      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}
      {datemodal && (
        <CustomDateModal
          Status={Status}
          SearchFunction={TableData}
          show={datemodal}
          data={TestID}
          onHide={() => showDatemodal(false)}
        />
      )}
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />
      <DispatchPatientDetailModal
        showPH={showPatientModal}
        setShowPH={setShowPatientModal}
        ResultData={[
          {
            LedgerTransactionNo: selectedLedgerTransactionNo,
            TestID: selectedTestID,
          },
        ]}
        Index={0}
      />
      <Modal
        show={showColumnModal}
        onHide={() => setShowColumnModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("Show/Hide Table Columns")}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div className="row">
            {configList.map((item, idx) => (
              <div className="col-sm-6 mb-2" key={idx}>
                <Form.Check
                  type="switch"
                  id={`re-col-toggle-${idx}`}
                  label={t(item.header)}
                  checked={!!item.visible}
                  onChange={() => handleColumnToggle(idx)}
                  className="m-0"
                />
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default RETable;