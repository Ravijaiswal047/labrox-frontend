import React, { useEffect, useMemo, useState } from "react";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import { axiosReport, axiosInstance } from "../../utils/axiosInstance";
import {
  CheckDevice,
  dateConfig,
  downloadPdf,
  IndexHandle,
  parseAwsKeys,
  parseRemarks,
} from "../../utils/helpers";
import CustomModal from "../utils/CustomModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../components/loader/Loading";
import Urgent from ".././Images/urgent.gif";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import { useTranslation } from "react-i18next";
import axios from "axios";
import UpdateRemark from "../utils/UpdateRemark";
import "./CustomeColor.css";
// Reuses the .rr-card* classes built for ReceiptReprintTable's card view —
// generic/page-agnostic despite the "rr" prefix, so no need to duplicate
// the same flat/clean-themed card CSS for this table too.
import "./ReceiptReprintTable.css";
import { FaDownload, FaEye, FaFemale, FaUser, FaWhatsapp } from "react-icons/fa";
import PatientDetailModal from "../utils/PatientDetailModal";
import BulkEmailModal from "../Laboratory/BulkEmailModal";
import DispatchBulkEmailModal from "./DisptachBulkEmailModal";
import AddRemark from "../utils/AddRemark";
import { FaPlus } from "react-icons/fa";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { getAccurateAge, SampleStatus, getStatusColor } from "../../utils/Constants";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { notify } from "../../utils/utils";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import moment from "moment";
import { Modal, Form } from "react-bootstrap";

function DispatchTable({
  TableData,
  dispatchData: dispatchDatas,
  show,
  show2,
  users,
  columnConfig,
  getFilterResultOption,
  Status,
  patientLabResponse,
  originalTableData = [],
  pageSize = 0,
  currentPage = 0,
  filterData = [],
  searchTerm = "",
  isNABL = 0,
  showColumnModal,
  setShowColumnModal,
  viewMode = "table",
}) {
  // Column visibility is database-backed via columnConfig

  // Remarks at second position
  const {
    SessionRateTypeID,
    SessionInvoiceTo,
    SessionDoctorId,
    SessionShowOnlineRemark,
    HideInTransitIconatDispatch,
    DesignationName,
    EmployeeID,
  } = useLocalStorage("userData", "get");

  // let shouldHideRemarkBtn = SessionRateTypeID + SessionInvoiceTo + SessionDoctorId > 0 && SessionShowOnlineRemark == 0;
  let shouldHideRemarkBtn =
    SessionRateTypeID + SessionInvoiceTo + SessionDoctorId > 0;
  const shouldHideActionColumns = SessionRateTypeID > 0;

  console.log(
    "xskfhuhfe",
    SessionRateTypeID,
    SessionInvoiceTo,
    SessionDoctorId,
    SessionShowOnlineRemark,
    shouldHideRemarkBtn,
  );

  const [dispatchData, setDispatchData] = useState(dispatchDatas);
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedLedgerTransactionNo, setSelectedLedgerTransactionNo] =
    useState(null);
  const [selectedTestID, setSelectedTestID] = useState(null);
  const [prevPageSize, setPreviousPageSize] = useState();
  const [printLoading, setPrintLoading] = useState({
    With: false,
    Without: false,
    index: -1,
  });

  const [previewConfig, setPreviewConfig] = useState({
          visible: false,
          url: null,
        });

  const { t } = useTranslation();
  const [showUpdateRemark, setShowUpdateRemark] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [BulkEmailModalState, setBulkEmailModalState] = useState({
    modal: false,
    data: [],
    type: "",
  });
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });
  const [medicalHistoryTooltipData, setMedicalHistoryTooltipData] = useState({
    data: [],
    loadingIndex: -1,
  });

  const [formData, setFormData] = useState(dispatchData);
  const handleSelectChange = (event, ind) => {
    const { name, value } = event?.target;
    const updatedData = formData.map((ele, index) => {
      return {
        ...ele,
        [name]: value ? value : "",
      };
    });
    setFormData(updatedData);
  };

  const getAllTestsForVisit = (visitNo) => {
    console.log("visit No", visitNo);
    console.log("patientLabResponse", patientLabResponse);
    return patientLabResponse
      .filter((item) => item.VisitNo === visitNo)
      .map((item) => ({ TestID: item.TestID, TestName: item.TestName }));
  };

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

  const handleCourierSave = () => {
    const CourierData = formData
      .filter((ele, ind) => ele?.IsCourier == 1 && ele?.DocketNo !== "")
      .map((ele, ind) => {
        return {
          DocketNo: ele?.DocketNo,
          LedgertransactionId: ele?.LedgerTransactionID,
        };
      });

    axiosInstance
      .post("Dispatch/SaveDocketNo", { CourierDetail: CourierData })
      .then((res) => {
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        console(err);
      });
  };

  const checkCulture = (data) => {
    const culture = data?.IsCulture?.split("#");
    console.log(culture);
    if (culture.includes("1")) return false;
    else return true;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ NEW: columnsToRender — gear + dynamic controller dono se filter
  //    1. Gear se visible=1 wale (gearVisibleColumns)
  //    2. Agar filterData mein TypeId=2 entries hain → unse order + IsShow=1 filter
  //    3. shouldHideActionColumns → restricted columns hide
  // ─────────────────────────────────────────────────────────────────────────
  const restrictedColumns = [
    "Dispatch",
    "Uploaded Document",
    "Medical History",
    "Search",
  ];

  const iconMapping = {
  "Uploaded Document": "fa-file",
  "Medical History": "fa-h-square",
  "Search": "fa-search"
};

  const gearVisibleColumns = columnConfig.filter((col) => {
    if (col.visible != 1) return false;
    if (shouldHideActionColumns && restrictedColumns.includes(col.header))
      return false;
    return true;
  });

  const hasDynamicFilter = filterData.some((item) => item.TypeId == 2);

  // const columnsToRender = hasDynamicFilter
  //   ? filterData
  //       .filter((item) => item.TypeId == 2 && item.IsShow == 1)
  //       .map((dynItem) =>
  //         gearVisibleColumns.find(
  //           (col) =>
  //             col.header === dynItem.ControlDisplayID ||
  //             col.ControlDisplayID === dynItem.ControlDisplayID,
  //         ),
  //       )
  //       .filter(Boolean)
  //   : gearVisibleColumns;
  
  const rawColumnsToRender = useMemo(() => {
    return filterData
      .filter((item) => {
        // Only TypeId == 2 and IsShow
        if (item.TypeId !== 2 || item.IsShow !== 1) return false;

        // Hide restricted columns if required
        // if (shouldHideActionColumns && restrictedColumns.includes(item.ControlDisplayID))
        //   return false;

        return true;
      })
      .sort((a, b) => {
        const orderA = (a.DisplayOrder !== "" && a.DisplayOrder !== null && a.DisplayOrder !== undefined) ? Number(a.DisplayOrder) : (a.SortOrder !== "" && a.SortOrder !== null && a.SortOrder !== undefined) ? Number(a.SortOrder) : Number(a.ID) + 1000;
        const orderB = (b.DisplayOrder !== "" && b.DisplayOrder !== null && b.DisplayOrder !== undefined) ? Number(b.DisplayOrder) : (b.SortOrder !== "" && b.SortOrder !== null && b.SortOrder !== undefined) ? Number(b.SortOrder) : Number(b.ID) + 1000;
        return orderA - orderB;
      })
      .map((item) => ({
        header: item.ControlDisplayID,
        icon: iconMapping[item.ControlDisplayID] || null,
        tooltip: item.TooltipText || item.ControlDisplayID,
        style: { whiteSpace: "nowrap" },
      }));
  }, [filterData]);

  const columnsToRender = useMemo(() => {
    if (!columnConfig || columnConfig.length === 0) {
      return rawColumnsToRender;
    }
    return rawColumnsToRender.filter((col) => {
      const configItem = columnConfig.find(
        (c) => c.header?.toLowerCase() === col.header?.toLowerCase()
      );
      if (configItem) {
        return configItem.visible == 1 || configItem.visible === true;
      }
      return true;
    });
  }, [rawColumnsToRender, columnConfig]);

  // ── Card view field grouping ────────────────────────────────────────────
  // Card layout position is fixed (per explicit instruction: reordering
  // columns doesn't need to carry over to the card, only show/hide does)
  // — so unlike the table, this doesn't need to track each column's
  // DisplayOrder, just whether it survived the columnsToRender filter
  // above (same admin-configured visibility either view).
  const findCol = (id) => columnsToRender.find((c) => c.header === id);

  const CARD_HEADER_IDS = [
    "S.No",
    "Visit No",
    "Barcode No",
    "Name",
    "Age/Gender",
    "Doctor",
  ];

  const CARD_FOOTER_IDS = new Set([
    "Print",
    "Remarks",
    "LastRemark",
    "Dispatch",
    "Uploaded Document",
    "Medical History",
    "Search",
  ]);

  const cardHeaderCols = useMemo(
    () => CARD_HEADER_IDS.map(findCol).filter(Boolean),
    [columnsToRender]
  );

  const cardFooterCols = useMemo(
    () => columnsToRender.filter((c) => CARD_FOOTER_IDS.has(c.header)),
    [columnsToRender]
  );

  const cardBodyCols = useMemo(() => {
    const headerIds = new Set(CARD_HEADER_IDS);
    return columnsToRender.filter(
      (c) => !headerIds.has(c.header) && !CARD_FOOTER_IDS.has(c.header)
    );
  }, [columnsToRender]);

  const allTableFields = useMemo(() => {
    return rawColumnsToRender.map((c) => c.header);
  }, [rawColumnsToRender]);

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

  const handleColumnToggle = (columnName, index) => {
    const updatedColumn = configList.map((ele, i) =>
      i === index ? { ...ele, visible: !ele.visible } : ele
    );

    axiosInstance
      .post("Lab/SaveFilterTableReprintData", {
        SaveData: updatedColumn,
        saveData: updatedColumn,
        PageName: "DispatchReport",
        pageName: "DispatchReport",
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

  // ✅ OLD: updatedColumnConfig — purana logic bhi rakha (ab use nahi hota but remove nahi kiya)
  // const updatedColumnConfig = columnConfig.map((col) => {
  //   if (restrictedColumns.includes(col.header)) {
  //     return {
  //       ...col,
  //       visible: !shouldHideActionColumns,
  //     };
  //   }
  //   return col;
  // });

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ NEW: filteredData — searchTerm parent se aata hai
  // ─────────────────────────────────────────────────────────────────────────
  const searchableKeys = [
    "PatientName",
    "PName",
    "PatientCode",
    "BarcodeNo",
    "SinNo",
    "Mobile",
    "VisitNo",
    "DoctorName",
    "ReferLabName",
    "Centre",
    "RateTypeName",
    "Test",
    "HLMOPDIPDNo",
    "HLMPatientType",
  ];

  const filteredData = searchTerm?.trim()
    ? dispatchDatas.filter((row) =>
        searchableKeys.some((key) =>
          String(row[key] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        ),
      )
    : dispatchDatas;

  // Card view: filteredData can contain more than one raw record for the
  // same visit — in the table that just means a repeated block scrolled
  // below the fold, but in the card grid every duplicate becomes its own
  // fully-rendered card sitting right next to the original. Keep one card
  // per VisitNo.
  const uniqueCardData = useMemo(() => {
    const seen = new Set();
    return filteredData.filter((d) => {
      if (seen.has(d.VisitNo)) return false;
      seen.add(d.VisitNo);
      return true;
    });
  }, [filteredData]);

  const getAwsDocs = async (ids) => {

      await axiosInstance
        .post(
          `RE/DocLockData`,
          {
            TestIDHash: ids || [],
          },       
        )
        .then((res) => {
          const awsKeysArray = (res?.data?.data || [])
            .map(item => item?.awsKey)
            .filter(Boolean);

          // ✅ Optional: remove duplicates
          // const uniqueAwsKeys = [...new Set(awsKeysArray)];

          console.log("AWS Keys:", awsKeysArray);

          // ✅ Use it (example)
          setPreviewConfig({
            visible: true,
            url: awsKeysArray,
          });
          
        })
        .catch((err) => {
          toast.error(
            err?.data?.message ||
              err?.data?.message ||
              "Something went wrong",
          );
        });
  };

  const handleOpenPreview = (data) => {
    console.log("dataxx",data);
    let testIdHashArray = [];

    try {
      const pliData = JSON.parse(data?.PliDataList || "[]");

      testIdHashArray = pliData.map(item => item?.TestIdHash).filter(Boolean);
    } catch (err) {
      console.error("Error parsing PliDataList:", err);
    }

    console.log("TestIdHash Array:", testIdHashArray);

    getAwsDocs(testIdHashArray);
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  useEffect(() => {
    if (currentPage > 1) {
      setPreviousPageSize(
        window?.sessionStorage.getItem(`prevPZ-${currentPage - 1}`),
      );
    } else {
      setPreviousPageSize(0);
    }
  }, [dispatchDatas]);

  const navigate = useNavigate();

  const handleReport = async (data, loader, index, PHead, explicitTestIdHash) => {
    if (printLoading.index === -1) {
      setPrintLoading({ ...printLoading, index: index });
      let TestIDHash = [];

      // Card view's per-test print icon passes the exact TestIdHash for
      // just that one test, skipping the checkbox scan below entirely —
      // that scan only makes sense against the raw HTML checkboxes the
      // table/card body renders, not a single explicit test.
      if (Array.isArray(explicitTestIdHash) && explicitTestIdHash.length > 0) {
        TestIDHash = explicitTestIdHash;
      } else {
        let documentlength = document.getElementsByClassName(
          data?.LedgerTransactionID,
        );

        const extractedValues = extractValuesFromHtml(data?.Test);
        for (let i = 0; documentlength.length > i; i++) {
          const checkboxValue = documentlength[i].value;
          if (
            documentlength[i].checked &&
            extractedValues.includes(checkboxValue)
          ) {
            TestIDHash.push(
              document.getElementsByClassName(data?.LedgerTransactionID)[i]
                .value,
            );
          }
        }

        if (TestIDHash?.length === 0) {
          TestIDHash.push(...extractedValues);
        }
      }

      setPrintLoading({
        [loader]: true,
        index: index,
      });

      const requestOptions = {
        ...(CheckDevice() == 1 && { responseType: "blob" }),
      };

      await axiosReport
        .post(
          `commonReports/GetLabReport`,
          {
            TestIDHash: [...new Set(TestIDHash)],
            PHead,
            PrintColour: "1",
            IsDownload: 1,
            WithoutnablLogo: isNABL == 1 ? -1 : 0
          },
          { responseType: "blob" },
        )
        .then(async (res) => {
          const blob = res.data;
          console.log("res.data", res.data);

          const isJson =
            blob.type === "application/json" ||
            blob.type === "text/json" ||
            blob.type === "text/plain";

          if (isJson) {
            const text = await blob.text();
            let json = {};
            try {
              json = JSON.parse(text);
            } catch {}
            notify(json?.message || "Something went wrong", "error");
            setPrintLoading({ [loader]: false, index: -1 });
            return;
          }

          const pdfUrl = window.URL.createObjectURL(blob);
          window.open(pdfUrl, "_blank");

          if (window.innerWidth <= 765) {
            downloadPdf(res.data);
          }

          setPrintLoading({ [loader]: false, index: -1 });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message ||
              err?.data?.message ||
              "Something went wrong",
          );
          setPrintLoading({ [loader]: false, index: -1 });
        });
    } else {
      toast.warn("Please wait Generating Report");
    }
  };

  const hideButton = () => {
    const val = dispatchData?.filter((ele) => ele?.IsCourier == 1);
    return val.length > 0 ? true : false;
  };

  // const handleCheck = (data) => {
  //   let check = true;
  //   const datas = parse(data?.Test);
  //   console.log('datas::', datas);
  //   if (datas.length > 0) {
  //     const val = datas?.map((ele) => {
  //       return ele?.props?.className;
  //     });
  //     if (val.includes("round Status-6") || val.includes("Status-5")) {
  //       return (check = true);
  //     } else {
  //       return (check = false);
  //     }
  //   } else {
  //     return (check =
  //       datas?.props?.className.includes("Status-5") ||
  //       datas?.props?.className.includes("round Status-6"));
  //   }
  // };

  // const handleCheck = (data) => {
  //   const datas = parse(data?.Test);
  //   const arr = Array.isArray(datas) ? datas : [datas];
  //   console.log("arr hello", arr);
  //   const val = arr.map((ele) => ele?.props?.className || "");
  //   console.log("eoiruo32iwuexioiq", val);
  //   const hasValidStatus = val.some(
  //     (cls) =>
  //       cls.includes("Status-5")
  //       // cls.includes("round Status-6") ||
  //       // cls.includes("Status-6"),
  //   );
  //   return hasValidStatus;
  // };

  const handleCheck = (data) => {
  const parsedContent = parse(data?.Test);
  const elements = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
  
  console.log("Parsed content", elements)
  const hasApprovedTest = elements.some((ele) => {
    const isApproved = ele?.props?.["data-approved"];
    
    return String(isApproved) == 1;
  });

  return hasApprovedTest;
};

  // Workflow order (least-complete/most-urgent first) — SampleStatus is
  // already listed in this exact progression (Not Collected → Collected →
  // ... → Dispatched), so its array index doubles as a priority rank.
  // "Rejected" is spliced to the very front since it needs attention
  // regardless of where a test otherwise sits in the pipeline.
  const STATUS_PRIORITY = useMemo(() => {
    const order = SampleStatus.filter((s) => s.value !== "").map((s) => s.value);
    const rejectedIdx = order.indexOf("4");
    if (rejectedIdx > 0) {
      order.splice(rejectedIdx, 1);
      order.unshift("4");
    }
    return order;
  }, []);

  // Picks whichever readable text color contrasts better against a given
  // background — getStatusColor()'s palette spans everything from pale
  // yellow to dark teal/red, so a single fixed text color (unlike Receipt
  // Reprint's narrower, uniformly-light palette) can't stay readable
  // across all of them.
  const getContrastText = (hex) => {
    const clean = (hex || "").replace("#", "");
    if (clean.length < 6) return "#1e293b";
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#1e293b" : "#f8fafc";
  };

  // A dispatch row can bundle several tests, each independently at its own
  // stage (data.Test's parsed HTML carries each test's status as a
  // `Status-N` class per user's earlier request) — the row as a whole
  // shows whichever test is furthest from done, since that's the one
  // actually needing attention.
  const getRowStatusColor = (testHtml) => {
    if (!testHtml) return null;
    try {
      const parsedContent = parse(testHtml);
      const elements = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
      let bestRank = Infinity;
      let bestStatus = null;
      elements.forEach((ele) => {
        const cls = ele?.props?.className || "";
        const match = String(cls).match(/Status-(\d+)/);
        if (!match) return;
        const statusValue = match[1];
        const rank = STATUS_PRIORITY.indexOf(statusValue);
        const effectiveRank = rank === -1 ? STATUS_PRIORITY.length : rank;
        if (effectiveRank < bestRank) {
          bestRank = effectiveRank;
          bestStatus = statusValue;
        }
      });
      return bestStatus ? getStatusColor(bestStatus) : null;
    } catch {
      return null;
    }
  };

  // Extracted verbatim from the table's per-column <td> rendering (moved,
  // not rewritten) so both the table AND the card view below can share
  // one source of truth per column instead of maintaining two copies of
  // ~15 columns' worth of logic. rowCtx bundles the per-row values
  // (barcode list, remarks) that used to be computed once per row and
  // read by several columns.
  const renderCell = (col, colIndex, data, rowIndex, rowCtx) => {
    const { uniqueBarcodeArr, remarksList, visibleRemarks, remarkCount } = rowCtx;
    return (
      <>
        {col.header === "S.No" && (
          <div>
            <div className="d-flex" style={{ gap: "4px" }}>
              {/* {Number(prevPageSize) + rowIndex + 1} &nbsp; */}
              {rowIndex + 1 + IndexHandle(currentPage, pageSize)}
              &nbsp;
              {data?.IsPatientDocAvail > 0 && (
                <div
                  style={{
                    backgroundColor: "#007bff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                  onClick={() => handleOpenPreview(data)}
                  title="View Attachments"
                >
                  <FaDownload color="white" size={8} />
                </div>
              )}
              {data?.IsUrgent == 1 && (
                <div>
                  <img
                    src={Urgent}
                    className="sizeicon"
                    title="Urgent"
                  ></img>
                </div>
              )}
              {data?.IsVip === 1 && (
                <div>
                  <i
                    className="bi bi-shield-fill-check mr-1 vip-font-size"
                    style={{
                      color: "#FFC107",
                      display: "inline",
                      width: "5%",
                    }}
                    title="VIP Patient"
                  />
                </div>
              )}
            </div>
            {String(data?.IsWhatsappSent || "").split("#")?.[0] === "1" && (
              <div
                className="d-flex flex-column ml-2 mt-1"
                title="WhatsApp Sent"
                style={{ width: "fit-content" }}
              >
                <FaWhatsapp color="#25D366" size={16} />
                <span
                  style={{ fontSize: "10px", color: "black" }}
                >
                  {String(data?.IsWhatsappSent || "").split("#")?.[1]}
                </span>
              </div>
            )}
          </div>
        )}
        {col.header === "S.CollectionDate" &&
          data?.SampleCollectionDate && (
            <>
              <p className="mb-0">
                {data?.SampleCollectionDate?.split(" ")?.[0]}
              </p>
              <p className="mb-0">
                {data?.SampleCollectionDate?.split(" ")
                  ?.slice(1)
                  .join(" ")}
              </p>
            </>
          )}
        {col.header === "Reg Date" && dateConfig(data?.Date)}
        {col.header === "Visit No" && (
          <p className="mb-0 px-1">{data?.VisitNo}</p>
        )}
        {col.header === "Barcode No" && (
          <>
            {uniqueBarcodeArr.map((brCode, brcIndex) => {
              const tooltipId = `tooltip-${rowIndex}-${brcIndex}`;
              return (
                <React.Fragment key={tooltipId}>
                  <p
                    data-tooltip-id={tooltipId}
                    className="mt-1"
                  >
                    {brCode.code}
                  </p>
                  <ReactTooltip
                    id={tooltipId}
                    place="top"
                    content={
                      <div>{brCode.sampleType}</div>
                    }
                    style={{ zIndex: 9999 }}
                  />
                </React.Fragment>
              );
            })}
          </>
        )}
        {col.header === "Name" && (
          <>
            <p
              style={{
                minWidth: "120px",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
              className="mb-1 px-1"
            >
              {data?.Gender === "Female" ? (
                <FaFemale />
              ) : (
                <FaUser />
              )}{" "}
              {data?.PatientName}
            </p>
          </>
        )}
        {col.header === "Doctor" && (
          <p
            title={data?.DoctorName}
            style={{
              minWidth: "120px",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
            className="mb-1 px-1"
          >
            {data?.DoctorName}
          </p>
        )}
        {col.header === "Refer Lab" && (
          <p
            style={{
              minWidth: "120px",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
            className="mb-1 px-1"
          >
            {data?.ReferLabName || "__"}
          </p>
        )}
        {col.header === "Mobile" && data?.Mobile}
        {col.header === "Age/Gender" &&
          `${getAccurateAge(data?.Age)}/${data?.Gender == "Female" ? "F" : "M"}`}
        {col.header === "Test" && (
          <div className="d-flex justify-content-start">
            {!!getParseData(data?.PliDataList)
              ?.SampleInTransit == 1 &&
              HideInTransitIconatDispatch === "1" && (
                <i className="bi bi-bus-front-fill text-red"></i>
              )}
            <div className="printTest dispatchTestCell">
              {parse(data?.Test)}
            </div>
          </div>
        )}
        {col.header === "Print" && (
          <div>
            {handleCheck(data) && (
              <div className="d-flex align-items-center justify-content-center flex-row px-1 mt-1">
                 {DesignationName !== "Customer Portal" && (
                  printLoading.Without && printLoading.index === rowIndex ? (
                    <div>
                      <SpinnerLoad />
                    </div>
                  ) : (
                    <i
                      className="fa fa-print iconStyle ahddh_black"
                      style={{
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                      onClick={() => handleReport(data, "Without", rowIndex, 0)}
                      title="Print without header"
                    ></i>
                  )
                )}

                &nbsp;&nbsp;
                {printLoading.With &&
                printLoading.index === rowIndex ? (
                  <div>
                    <SpinnerLoad />
                  </div>
                ) : (
                  <i
                    className="fa fa-print iconStyle sjhiweo_red"
                    style={{
                      color: "red",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                    onClick={() =>
                      handleReport(data, "With", rowIndex, 1)
                    }
                    title="Print with header"
                  ></i>
                )}
              </div>
            )}
          </div>
        )}
        {col.header === "Remarks" && (
          <>
            {shouldHideRemarkBtn && remarkCount > 0 && (
              <>
                <div
                  data-tooltip-id={`remark-tooltip-${rowIndex}`}
                  onClick={() => {
                    const allTests = getAllTestsForVisit(
                      data?.VisitNo,
                    );
                    setShowAddRemark({
                      modal: true,
                      rowData: {
                        ...data,
                        testOptions: allTests,
                        filterTestID: getPliTestIDs(data?.PliDataList),
                      },
                    });
                  }}
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
                    }}
                  >
                    <FaPlus color="white" size={8} />{" "}
                  </div>
                  {remarkCount > 0 && (
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ({remarkCount})
                    </span>
                  )}
                </div>
                {visibleRemarks?.length > 0 && (
                  <ReactTooltip
                    id={`remark-tooltip-${rowIndex}`}
                    place="top"
                    positionStrategy="fixed"
                    style={{ zIndex: 9999 }}
                    clickable
                    content={
                      <RemarkTooltip remarks={visibleRemarks} />
                    }
                  />
                )}
              </>
            )}
            {!shouldHideRemarkBtn && (
              <>
                <div
                  data-tooltip-id={`remark-tooltip-${rowIndex}`}
                  onClick={() => {
                    const allTests = getAllTestsForVisit(
                      data?.VisitNo,
                    );
                    setShowAddRemark({
                      modal: true,
                      rowData: {
                        ...data,
                        testOptions: allTests,
                        filterTestID: getPliTestIDs(data?.PliDataList),
                      },
                    });
                  }}
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
                    }}
                  >
                    <FaPlus color="white" size={8} />{" "}
                  </div>
                  {remarkCount > 0 && (
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ({remarkCount})
                    </span>
                  )}
                </div>
                {visibleRemarks?.length > 0 && (
                  <ReactTooltip
                    id={`remark-tooltip-${rowIndex}`}
                    positionStrategy="fixed"
                    place="top"
                    style={{ zIndex: 9999 }}
                    clickable
                    content={
                      <RemarkTooltip remarks={visibleRemarks} />
                    }
                  />
                )}
              </>
            )}
          </>
        )}
        {col.header === "LastRemark" ? (() => {
          if (!data?.RemarksList || data?.RemarksList.length === 0) {
            return "";
          }

          const sortedRemarks = [...data.RemarksList].sort((a, b) => {
            const dateDiff =
              moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") -
              moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A");

            if (dateDiff !== 0) return dateDiff;

            // fallback for same timestamp
            return data.RemarksList.indexOf(b) - data.RemarksList.indexOf(a);
          });

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
                        fontWeight: index === 0 ? "bold" : "normal",
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
                id={`remark-tooltip`}
                positionStrategy="fixed"
                style={{
                  backgroundColor: "#2d3748",
                  color: "#fff",
                  fontSize: "12px",
                  borderRadius: "4px",
                  padding: "6px 10px",
                  maxWidth: "250px",     // fixed width
                  whiteSpace: "normal",  // allow wrapping
                  wordBreak: "break-word",
                  zIndex: 9999
                }}
              />
            </div>
          );
        })() : null}
        {col.header === "Dispatch" && (
          <>
            <div className="d-flex align-items-center justify-content-center">
              <i
                className="fa fa-comment-alt iconStyle mr-2"
                style={{
                  cursor: "pointer",
                  textAlign: "center",
                  color: "#007bff",
                }}
                onClick={() =>
                  handleBulkMainSelect(colIndex, data)
                }
                title="Send email"
              ></i>
              <Link
                to={"/dispatch-patient-report"}
                state={data}
                style={{ width: "30px" }}
              >

                <i className="bi bi-person-badge-fill mb-0"></i>
              </Link>
            </div>
          </>
        )}
        {col.header === "UHID" && data?.PatientCode}
        {col?.header === "Dept.Category" && data?.Category}
        {col?.header === "HNo" && data?.HNo}
        {col?.header === "VisitType" && data?.VisitType}
        {col.header === "HLMPatientType" && data?.HLMPatientType}
        {col.header === "HLMOPDIPDNo" && (data?.HLMOPDIPDNo || data?.OPDIPD || data?.OPDIPDNo)}
        {col.header === "Centre" && data?.Centre}
        {col.header === "RateType" && data?.RateTypeName}
        {col.header === "RateTypeCode" && data?.RateTypeCode}
        {col.header === "S.ReceiveDate" &&
          data?.SampleReceiveDate && (
            <>
              <p className="mb-0">
                {data?.SampleReceiveDate?.split(" ")?.[0]}
              </p>
              <p className="mb-0">
                {data?.SampleReceiveDate?.split(" ")
                  ?.slice(1)
                  ?.join(" ")}
              </p>
            </>
          )}
        {col.header === "Uploaded Document" && (
          <div
            className="text-primary"
            style={{ cursor: "pointer" }}
            onClick={() =>
              show2({
                modal: true,
                data: data?.PatientGuid,
                index: rowIndex,
              })
            }
          >
            <img src={file} className="sizeicon mx-1" />
            &nbsp;
            {!!data?.UploadDocumentCount &&
              data?.UploadDocumentCount}
          </div>
        )}
        {col.header === "Medical History" && (
          <>
            <div
              className="text-primary d-flex align-items-center h-100"
              style={{ cursor: "pointer" }}
              onClick={() =>
                show({
                  modal: true,
                  data: data?.PatientGuid,
                  index: rowIndex,
                  ID: data?.LedgerTransactionID,
                })
              }
              onMouseEnter={() => {
                if (data?.MedicalHistoryCount > 0) {
                  fetchMedicalHistoryTooltipData(
                    data?.MedicalHistoryList,
                    rowIndex,
                  );
                }
              }}
              data-tooltip-id={`medical-history-tooltip-${rowIndex}`}
            >
              <img src={Medical} className="sizeicon mx-1" />
              &nbsp;
              {!!data?.MedicalHistoryCount &&
                data?.MedicalHistoryCount}
              {/* Medical History icon */}
            </div>
            {data?.MedicalHistoryCount > 0 && (
              <ReactTooltip
                id={`medical-history-tooltip-${rowIndex}`}
                place="top"
                style={{
                  zIndex: 99999,
                  backgroundColor: "#fff",
                  color: "#000",
                  padding: "8px",
                }}
                clickable
                content={
                  medicalHistoryTooltipData?.data &&
                  medicalHistoryTooltipData.data.length >
                    0 ? (
                    <div
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        width: "400px",
                        position: "relative",
                        background:
                          "rgba(143, 142, 142, 0.9)",
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
                          {medicalHistoryTooltipData.data.map(
                            (item, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{item.MedicalHistory}</td>
                                <td>
                                  {dateConfig(
                                    item.CreatedDate,
                                  )}
                                </td>
                                <td>{item.CreatedBy}</td>
                              </tr>
                            ),
                          )}
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
        )}
        {col.header === "Search" && (
          <div className="d-flex align-items-center justify-content-center mt-1 mx-1">
            <i
              className="fa fa-search pointer text-primary"
              onClick={() => {
                setModal(true);
                setVisitID(data?.VisitNo);
              }}
            />
            <FaEye
              style={{
                marginLeft: "10px",
                fontSize: "18px",
                cursor: "pointer",
                color: "#007bff",
              }}
              className=""
              onClick={() => {
                setShowPatientModal(true);
                setSelectedLedgerTransactionNo(data?.VisitNo);
                setSelectedTestID(data?.TestID || 0);
              }}
            />
          </div>
        )}
      </>
    );
  };

  const handleAllAprovedChecked = (e, data) => {
    const { checked } = e.target;
    let documentlength = document.getElementsByClassName(
      data?.LedgerTransactionID,
    );
    for (let i = 0; documentlength.length > i; i++) {
      if (documentlength[i].id == data?.LedgerTransactionID) {
        documentlength[i].checked = checked;
      }
    }
  };

  const extractValuesFromHtml = (htmlString) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    const inputElements = tempDiv.querySelectorAll('input[type="checkbox"]');
    const extractedValues = Array.from(inputElements).map(
      (input) => input.value,
    );
    return extractedValues;
  };

  // const column = [
  //   { header: "S.No", visible: true },
  //   { header: "Reg Date", visible: true },
  //   { header: "Visit No", visible: true },
  //   { header: "Barcode No", visible: true },
  //   { header: "Doctor", visible: true },
  //   { header: "Name", visible: true },
  //   { header: "Mobile", visible: true },
  //   { header: "Remarks", visible: true },
  //   { header: "Age/Gender", visible: true },
  //   { header: "Test", visible: true },
  //   { header: "Print", visible: true },
  //   { header: "UHID", visible: true },
  //   { header: "Centre", visible: true },
  //   { header: "RateType", visible: true },
  //   // {
  //   //   header: "SaveCourier",
  //   //   visible: true,
  //   //   type: "button",
  //   //   buttonProps: {
  //   //     className: "btn btn-success btn-sm btn-block",
  //   //     onClick: handleCourierSave,
  //   //   },
  //   // },
  //   {
  //     header: "Uploaded Document",
  //     visible: true,
  //     icon: "fa-file",
  //     tooltip: "Uploaded Document",
  //     style: { margin: "2px 8px" },
  //   },
  //   {
  //     header: "Medical History",
  //     visible: true,
  //     icon: "fa-calendar",
  //     tooltip: "Medical History",
  //     style: { margin: "2px 8px" },
  //   },
  //   {
  //     header: "Search",
  //     visible: true,
  //     icon: "fa-search",
  //   },
  // ];

  const getParseData = (PliDataList = []) => {
    const PliDataListArray = JSON.parse(PliDataList);
    return PliDataListArray?.[0];
  };

  const getPliTestIDs = (PliDataList = "") => {
    try {
      const arr = JSON.parse(PliDataList || "[]");
      return arr.map((t) => t.TestID).filter(Boolean).join(",");
    } catch {
      return "";
    }
  };

  const handleBulkMainSelect = (index, data) => {
    setBulkEmailModalState({
      modal: true,
      data: data,
      type: "EmailSend",
    });
  };

  console.log("dispatchData", dispatchData);
  console.log("columnConfig", columnConfig);
  console.log(" ",columnsToRender);

  return (
    <>
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData(document.getElementById("SampleStatus").value);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          defaultTestFromRow={true}
          filterTestID={showAddRemark.rowData?.filterTestID}
          visitKey="VisitNo"
          testIDsKey="TestID"
          testNamesKey="InvestigationNames"
          ledgerTransactionIDKey="LedgerTransactionID"
          patientNameKey="PatientName"
          ageGenderKey={["Age", "Gender"]}
          shouldHideRemarkBtn={shouldHideRemarkBtn}
        />
      )}
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />

      {/* ✅ filteredData use karo (search + original dono handle hota hai) */}
      {filteredData.length > 0 ? (
        viewMode === "card" ? (
          <div className="rr-card-grid dispatch-card-grid">
            {uniqueCardData.map((data, rowIndex) => {
              const uniqueBarcodeArr = (data.barcodeArr || [])
                .filter((item) => item.code)
                .filter(
                  (item, index, self) =>
                    index === self.findIndex((t) => t.code === item.code),
                );

              const remarksList = Array.isArray(data?.RemarksList)
                ? data?.RemarksList
                : data?.RemarksList
                  ? JSON.parse(data?.RemarksList)
                  : [];

              const visibleRemarks = shouldHideRemarkBtn
                ? remarksList?.filter((r) => r.ShowOnline === 1)
                : remarksList;

              const remarkCount = shouldHideRemarkBtn
                ? data?.LabRemarkShowOnlineCount
                : data?.LabRemarkCount;

              const rowCtx = { uniqueBarcodeArr, remarksList, visibleRemarks, remarkCount };
              const rowBg = getRowStatusColor(data?.Test);
              const rowText = rowBg ? getContrastText(rowBg) : undefined;

              const cell = (col) =>
                col ? renderCell(col, columnsToRender.indexOf(col), data, rowIndex, rowCtx) : null;

              const sNoCol = findCol("S.No");
              const visitNoCol = findCol("Visit No");
              const barcodeCol = findCol("Barcode No");
              const nameCol = findCol("Name");
              const ageCol = findCol("Age/Gender");
              const doctorCol = findCol("Doctor");

              return (
                <div
                  key={rowIndex}
                  className="rr-card"
                  style={{ "--card-status": rowBg || "#cbd5e1", color: rowText }}
                >
                  <div className="rr-card__header">
                    <div className="rr-card__ids">
                      {visitNoCol && (
                        <span className="rr-card__visitno">{cell(visitNoCol)}</span>
                      )}
                      {barcodeCol && (
                        <span className="rr-card__barcode">{cell(barcodeCol)}</span>
                      )}
                    </div>
                    {/* S.No's cell bundles the serial number + doc/urgent/VIP
                        icons + WhatsApp-sent status all in one — treated as
                        fixed "basic info" for the card (like Dispatch's own
                        card header), so it always shows here regardless of
                        whether the admin's column gear has "S.No" toggled
                        off for the table. */}
                    <div className="rr-card__actions">{cell({ header: "S.No" })}</div>
                  </div>

                  {(nameCol || ageCol || doctorCol) && (
                    <div className="rr-card__identity">
                      {nameCol && (
                        <div className="rr-card__patient">{cell(nameCol)}</div>
                      )}
                      {(ageCol || doctorCol) && (
                        <div className="rr-card__meta">
                          {ageCol && <span>{cell(ageCol)}</span>}
                          {ageCol && doctorCol && <span className="rr-card__dot">•</span>}
                          {doctorCol && <span>{cell(doctorCol)}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rr-card__divider" />

                  <div className="rr-card__body">
                    {(() => {
                      // Reg Date / Sample Collection / Sample Receive read as one
                      // connected timeline, so they sit on a single row instead of
                      // each getting its own stacked label:value block. Forced
                      // in directly (like S.No above) rather than sourced from
                      // cardBodyCols — Collection/Receive date are admin
                      // column-gear toggles for the TABLE view, but the card
                      // should always show the timeline when the data exists.
                      const DATE_ROW_HEADERS = ["Reg Date", "S.CollectionDate", "S.ReceiveDate"];
                      const dateCols = [
                        { header: "Reg Date", hasData: !!dateConfig(data?.Date) },
                        { header: "S.CollectionDate", hasData: !!data?.SampleCollectionDate },
                        { header: "S.ReceiveDate", hasData: !!data?.SampleReceiveDate },
                      ].filter((c) => c.hasData);
                      const otherCols = cardBodyCols.filter((c) => !DATE_ROW_HEADERS.includes(c.header));
                      return (
                        <>
                          {dateCols.length > 0 && (
                            <div
                              className="rr-card__field"
                              style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "14px" }}
                            >
                              {dateCols.map((col, colIdx) => (
                                <div key={colIdx} style={{ minWidth: 0 }}>
                                  <span className="rr-card__field-label d-block">{col.header}</span>
                                  <span className="rr-card__field-value">{cell(col)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {otherCols
                            .filter((col) => col.header !== "Test")
                            .map((col, colIdx) => (
                              <div className="rr-card__field" key={colIdx}>
                                <span className="rr-card__field-label">{col.header}</span>
                                <span className="rr-card__field-value">{cell(col)}</span>
                              </div>
                            ))}

                          {findCol("Test") && (() => {
                            // Structured per-test list (checkbox, name, print
                            // icon per test) — PliDataList is the same JSON
                            // source DispatchReportTableNew.jsx's flattenedData
                            // reads _pli fields from (TestID/TestIdHash/
                            // TestName/Status/IsApproved), so field names here
                            // are proven, not guessed.
                            let pliList = [];
                            try {
                              pliList = JSON.parse(data?.PliDataList || "[]");
                            } catch (e) {
                              pliList = [];
                            }
                            if (pliList.length === 0) return null;

                            return (
                              <div
                                className="rr-card__field"
                                style={{ gridColumn: "1 / -1" }}
                              >
                                <span className="rr-card__field-label">{t("Test")}</span>
                                <div
                                  className="rr-card__tests-scroll"
                                  style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}
                                >
                                  {pliList.map((pli, pliIdx) => (
                                    <div
                                      key={pliIdx}
                                      className="d-flex align-items-center justify-content-between"
                                      style={{ gap: "8px" }}
                                    >
                                      <div className="d-flex align-items-center" style={{ gap: "6px", minWidth: 0 }}>
                                        <input type="checkbox" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: "12.5px", wordBreak: "break-word" }}>
                                          {pli?.TestName || pli?.ItemName || pli?.Test || "Investigation"}
                                        </span>
                                      </div>
                                      {pli?.TestIdHash && (
                                        <div className="d-flex align-items-center" style={{ gap: "8px", flexShrink: 0 }}>
                                          {printLoading.Without && printLoading.index === rowIndex ? (
                                            <SpinnerLoad />
                                          ) : (
                                            <i
                                              className="fa fa-print iconStyle ahddh_black"
                                              style={{ cursor: "pointer" }}
                                              onClick={() =>
                                                handleReport(data, "Without", rowIndex, 0, [pli.TestIdHash])
                                              }
                                              title="Print without header"
                                            />
                                          )}
                                          {printLoading.With && printLoading.index === rowIndex ? (
                                            <SpinnerLoad />
                                          ) : (
                                            <i
                                              className="fa fa-print iconStyle sjhiweo_red"
                                              style={{ color: "red", cursor: "pointer" }}
                                              onClick={() =>
                                                handleReport(data, "With", rowIndex, 1, [pli.TestIdHash])
                                              }
                                              title="Print with header"
                                            />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </div>

                  {cardFooterCols.length > 0 && (
                    <>
                      <div className="rr-card__divider" />
                      <div className="rr-card__footer">
                        {cardFooterCols.map((col, colIdx) => (
                          <div
                            className="rr-card__footer-action"
                            key={colIdx}
                            title={col.header}
                          >
                            {cell(col)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
        <div className="">
          <Tables>
            <div>
              <thead>
                <tr>
                  {/* ✅ columnsToRender use karo (gear + dynamic controller) */}
                  {columnsToRender.map((col, index) => (
                    <th
                      key={index}
                      className={
                        col.header === "Test" ? "dispatch-test-col" : ""
                      }
                    >
                      {col?.icon ? (
                        <>
                          <i
                            className={`fa ${col?.icon}`}
                            data-toggle="tooltip"
                            title={col?.tooltip || col?.header}
                            style={col?.style}
                          />
                        </>
                      ) : (
                        col?.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              {console.log("dispatchData", dispatchData)}

              <tbody>
                {filteredData.map((data, rowIndex) => {
                  const uniqueBarcodeArr = (data.barcodeArr || [])
                    .filter((item) => item.code)
                    .filter(
                      (item, index, self) =>
                        index === self.findIndex((t) => t.code === item.code),
                    );

                  const remarksList = Array.isArray(data?.RemarksList)
                    ? data?.RemarksList
                    : data?.RemarksList
                      ? JSON.parse(data?.RemarksList)
                      : [];

                  const visibleRemarks = shouldHideRemarkBtn
                    ? remarksList?.filter((r) => r.ShowOnline === 1)
                    : remarksList;

                  const remarkCount = shouldHideRemarkBtn
                    ? data?.LabRemarkShowOnlineCount
                    : data?.LabRemarkCount;

                  const rowBg = getRowStatusColor(data?.Test);
                  const rowText = rowBg ? getContrastText(rowBg) : undefined;

                  return (
                    <tr
                      key={rowIndex}
                      style={
                        rowBg
                          ? {
                              background: rowBg,
                              "--row-bg": rowBg,
                              "--row-text": rowText,
                            }
                          : undefined
                      }
                    >
                      {/* ✅ columnsToRender use karo */}
                      {columnsToRender.map((col, index) => (
                        <td
                          key={index}
                          data-title={col.header}
                          className={
                            col.header === "Test" ? "dispatch-test-col" : ""
                          }
                        >
                          {renderCell(col, index, data, rowIndex, {
                            uniqueBarcodeArr,
                            remarksList,
                            visibleRemarks,
                            remarkCount,
                          })}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </div>
          </Tables>
        </div>
        )
      ) : (
        <NoRecordFound />
      )}

      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}

      <PatientDetailModal
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

      {BulkEmailModalState?.modal && (
        <DispatchBulkEmailModal
          componentName="DispatchReport"
          data={BulkEmailModalState}
          onHide={() =>
            setBulkEmailModalState({
              modal: false,
              data: [],
              type: "",
            })
          }
        />
        // <BulkEmailModal
        //   componentName="DispatchReport"
        //   data={BulkEmailModalState}
        //   onHide={() =>
        //     setBulkEmailModalState({
        //       modal: false,
        //       data: [],
        //       type: "",
        //     })
        //   }
        // />
      )}

      {/* Column Settings Modal */}
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
                  id={`col-toggle-${idx}`}
                  label={t(item.header)}
                  checked={!!item.visible}
                  onChange={() => handleColumnToggle(item.header, idx)}
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

export default DispatchTable;