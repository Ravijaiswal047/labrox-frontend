import React, { useEffect, useMemo, useRef, useState } from "react";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { dateConfig, IndexHandle, openPdfBlob, parseAwsKeys, parseRemarks } from "../../utils/helpers";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import CustomModal from "../utils/CustomModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tooltip from "../../components/formComponent/Tooltip";
import Loading from "../../components/loader/Loading";
import SendEmailModalReprint from "../utils/SendEmailModalReprint";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import email from ".././Images/email.png";
import SeeMoreIconInTable from "./SeeMoreIconInTable";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import UpdateRemark from "../utils/UpdateRemark";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import SettlementPatient from "../Laboratory/Settlement";
import { Modal, Form } from "react-bootstrap";
import {
  setReprintLabNo,
  setReprintRowData,
} from "../../store/reducers/loadingSlice/loadingSlice";
import { useDispatch } from "react-redux";
import "./ReceiptReprintTable.css";
import { SampleStatus } from "../../utils/Constants";
import CustomTooltip from "../../components/formComponent/CustomTooltip";
import {
  FaCreditCard,
  FaDollarSign,
  FaDownload,
  FaEye,
  FaFemale,
  FaList,
  FaTruck,
  FaUser,
} from "react-icons/fa";
import PatientDetailModal from "../utils/PatientDetailModal";
import AddRemark from "../utils/AddRemark";
import BillingRemarkModal from "../utils/BillingRemarkModal";
import { FaPlus } from "react-icons/fa";
import DispatchBulkEmailModal from "./DisptachBulkEmailModal";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import { Tooltip as ReactTooltip } from "react-tooltip";
import PatientTestDetailModal from "../utils/PatientTestDetailModal";
import Urgent from ".././Images/urgent.gif";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import { IoDocumentTextOutline } from "react-icons/io5";

const ReceiptReprintTable = ({
  receiptData,
  TableData,
  show,
  show2,
  currentPage,
  pageSize,
  columnConfig,
  handleOpenSchedule,
  Status,
  reprintResponse,
  filterData = [],
  showColumnModal,
  setShowColumnModal,
  getFilterResultOption,
  viewMode = "table",
}) => {
  // Ensure receiptData is always an array
  const safeReceiptData = Array.isArray(receiptData) ? receiptData : [];
  // console.log("receiptData in Table:", safeReceiptData);
  // Both of these ran on every single render of this component (not once) —
  // logging the full, possibly 200+ row receiptData array on every render
  // (including the ones triggered by opening/closing the test tooltip) is
  // real console overhead, and is very likely why clicking/hovering felt
  // like it took multiple seconds to respond. Commented out, not removed.

  const { ShowUserFilterAtReprint, SkipRemarksOnReceiptPrint,DefaultCurrencyName,RateCentreType, CompanyID } =
    useLocalStorage("userData", "get");
  // Collection Charges is not a concept company 1007 uses at all - hidden
  // here (not just zeroed) so it never shows as a column, matching the
  // backend's LabRepository.getReceiptReprintData, which now returns 0 for
  // it (and never folds it into Gross/Net/Due Amt) for this company.
  const isCompany1007 = String(CompanyID) === "1007";
  // console.log("SkipRemarksOnReceiptPrint", DefaultCurrencyName,RateCentreType)

  const iconMapping = {
    "View Details": "fa-info-circle",
    "Send Email": "fa-envelope-open",
    "UploadDocument": "fa-file",
    "Medical History": "fa-h-square",
  };

  const rawColumnsToRender = useMemo(() => {
    const cols = filterData
      .filter((item) => item.TypeId == 2 && item.IsShow == 1)
      .map((item) => {
        const headerName = item.ControlDisplayID;
        return {
          header: headerName,
          // Match icon from map, otherwise null
          icon: iconMapping[headerName] || null,
          tooltip: item.TooltipText || headerName,
          style: { whiteSpace: "nowrap" }
        };
      });
    const hasLog = cols.some((c) => c.header === "Demographic Log PDF");
    const hiddenByPage = filterData.some(
      (item) => item.ControlDisplayID === "Demographic Log PDF" && item.IsShow != 1
    );
    if (!hasLog && !hiddenByPage) {
      cols.push({
        header: "Demographic Log PDF",
        icon: null,
        tooltip: "Demographic Log PDF",
        style: { whiteSpace: "nowrap" },
      });
    }
    return isCompany1007
      ? cols.filter((c) => c.header !== "Collection Charges")
      : cols;
  }, [filterData, isCompany1007]);

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
  // Card view reuses the exact same columnsToRender/renderCell pipeline as
  // the table — it only rearranges where each already-rendered cell lands
  // (identity+actions up top, print/attachment/trf icons in a footer row,
  // everything else as label:value pairs in the body) so admin-configured
  // column show/hide and every column's existing click behaviour keep
  // working unchanged.
  const CARD_FOOTER_IDS = useMemo(
    () =>
      new Set([
        "Cash Receipt",
        "Cash receipt with Header",
        "FullyPaid",
        "TRF",
        "trf",
        "ConsentPrint",
        "View Details",
        "Send Email",
        "UploadDocument",
        "Medical History",
        "Edit Info",
        "Rec Edit",
        "Demographic Log PDF",
      ]),
    []
  );

  const findCol = (id) =>
    columnsToRender.find((c) => (c.header || c.ControlDisplayID) === id);

  // Mobile-only card resequence: Centre/Doctor/ReferenceNumber/Username/
  // MobileNo move out of the generic body grid and into a dedicated
  // top identity block (left: Centre, Patient, Age/Gender+Doctor, Barcode,
  // Visit No — right: action icons, Reference No, Username, Mobile No),
  // per the hand-drawn layout. Desktop card view (reachable via the
  // Table/Card toggle) is untouched — these five stay out of
  // cardHeaderCols there, so they render in the body grid exactly as
  // before.
  const isMobileCardView = typeof window !== "undefined" && window.innerWidth < 768;

  const cardHeaderCols = useMemo(() => {
    return {
      action: findCol("Action") || findCol("S.No"),
      visitNo: findCol("Visit No"),
      barcode: findCol("Barcode"),
      patient: findCol("Patient Name"),
      age: findCol("Age/Gender"),
      rateType: findCol("RateType"),
      ...(isMobileCardView
        ? {
            centre: findCol("Centre"),
            doctor: findCol("RefferDoctor"),
            referenceNumber: findCol("ReferenceNumber"),
            username: findCol("User") || findCol("UserName"),
            mobileNo: findCol("Mobile No"),
            uhid: findCol("UHID"),
          }
        : {}),
    };
  }, [columnsToRender, isMobileCardView]);

  const cardFooterCols = useMemo(
    () =>
      columnsToRender.filter((c) =>
        CARD_FOOTER_IDS.has(c.header || c.ControlDisplayID)
      ),
    [columnsToRender, CARD_FOOTER_IDS]
  );

  const cardBodyCols = useMemo(() => {
    const headerIds = new Set(
      Object.values(cardHeaderCols)
        .filter(Boolean)
        .map((c) => c.header || c.ControlDisplayID)
    );
    return columnsToRender.filter((c) => {
      const id = c.header || c.ControlDisplayID;
      return !headerIds.has(id) && !CARD_FOOTER_IDS.has(id);
    });
  }, [columnsToRender, cardHeaderCols, CARD_FOOTER_IDS]);

  // Card view, 3rd section: mirrors DispatchReportTableNew.jsx's card,
  // which splits its middle body into its own dividered groups instead of
  // one flat grid — here that means the 5 amount fields get pulled out of
  // cardBodyCols into their own group, rendered as a separate
  // divider-separated section after the other body fields.
  const CARD_AMOUNT_IDS = useMemo(
    () => new Set(["Gross Amt", "Dis Amt", "Net Amt", "Due Amt", "Paid Amt"]),
    []
  );

  const cardAmountCols = useMemo(
    () =>
      cardBodyCols.filter((c) =>
        CARD_AMOUNT_IDS.has(c.header || c.ControlDisplayID)
      ),
    [cardBodyCols, CARD_AMOUNT_IDS]
  );

  const cardOtherBodyCols = useMemo(
    () =>
      cardBodyCols.filter(
        (c) => !CARD_AMOUNT_IDS.has(c.header || c.ControlDisplayID)
      ),
    [cardBodyCols, CARD_AMOUNT_IDS]
  );

  // Anchoring to the hover-zone's own rect (instead of the cursor) fixed
  // the "tooltip covers the buttons I'm trying to click" bug, but the
  // tooltip is now trying to render at the CARD's position (rect.top) —
  // in a scrolled grid that reads as "the tooltip shows up where the card
  // starts" rather than near the mouse. Since the trigger is already
  // scoped to just the identity/body hover-zone (not the header/footer
  // buttons — see the wiring below), cursor-based positioning is safe
  // again: it can't land on top of a button because those aren't inside
  // this hover-zone at all. Passing only `y` (no rowTop/rowBottom) lets
  // CustomTooltip's own fallback (`rowBottom = position.y + 20`) place it
  // exactly 20px below the cursor.
  const handleCardMouseEnter = (e, index, testList) => {
    if (window.innerWidth < 768) return;
    if (tooltipSuppressedRef.current) return;
    setTooltipData({
      testNames: testList,
      position: { x: e.clientX, y: e.clientY },
      rowIndex: index,
    });
  };

  const handleCardMouseLeave = () => {
    if (window.innerWidth < 768) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTooltipData({ testNames: [], position: null });
  };

  // Replaces the hover-triggered tooltip (commented out below, both on the
  // table row and the card's hover-zone) with an explicit click on a
  // dedicated "View Test" icon in the Action column/card header — hover was
  // firing setTooltipData on every mousemove across ~200 rows/cards, which
  // is real perf cost even after testListByIndex was memoized (see above).
  // Works the same on desktop and mobile since it's an explicit click, not
  // gated behind window.innerWidth like the old hover/tap handlers were.
  const handleTestIconClick = (e, index, testList) => {
    e.stopPropagation();
    if (tooltipSuppressedRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipData((prev) =>
      prev.rowIndex === index && prev.position
        ? { testNames: [], position: null }
        : {
            testNames: testList,
            position: { x: rect.left, y: rect.bottom + 4 },
            rowIndex: index,
          }
    );
  };

  const handleCardClick = (e, index, testList) => {
    if (window.innerWidth >= 768) return;
    // Stops this toggle-open click from also reaching the document-level
    // "close tooltip on any other click" listener below - without this, opening
    // the tooltip and the listener closing it back down would happen in the same
    // click, and it would never actually open.
    e.stopPropagation();
    if (tooltipSuppressedRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Functional update (reads live state via `prev`, not the `tooltipData`
    // closed over at render time) — needed now that the card list below is
    // memoized: a memoized card's onClick can be a "stale" closure from an
    // earlier render, so reading `tooltipData` directly here would check
    // against whatever it was back when that closure was created instead
    // of the actual current value.
    setTooltipData((prev) =>
      prev.rowIndex === index && prev.position
        ? { testNames: [], position: null }
        : {
            testNames: testList,
            position: { x: rect.left + 8, y: rect.bottom + 4 },
            rowIndex: index,
          }
    );
  };

  const configList = useMemo(() => {
    if (columnConfig && columnConfig.length > 0) {
      return columnConfig;
    }
    return rawColumnsToRender.map((c) => ({
      header: c.header,
      visible: true,
    }));
  }, [columnConfig, rawColumnsToRender]);

  const handleColumnToggle = (column, index) => {
    const updatedColumn = configList.map((ele, i) =>
      i === index ? { ...ele, visible: !ele.visible } : ele
    );

    axiosInstance
      .post("Lab/SaveFilterTableReprintData", {
        SaveData: updatedColumn,
        saveData: updatedColumn,
        PageName: "Reprint",
        pageName: "Reprint",
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
        toast.error(t("Failed to update column configuration"));
      });
  };



  const [modal, setModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientProfile, setPatientProfile] = useState(false);
  const [patientData, setPatientData] = useState([]);
  const [selectedLedgerTransactionNo, setSelectedLedgerTransactionNo] =
    useState(null);
  const [selectedTestID, setSelectedTestID] = useState(null);
  const [tooltipData, setTooltipData] = useState({
    testNames: [],
    position: null,
  });

  // Closes the "Individual Tests" tooltip whenever the user clicks anything else -
  // opening the Edit/Settlement modal (or any other row action) is a plain click on
  // a different element, not a second click on the same "View Test" icon and not a
  // mouseleave, so without this the tooltip's own state was never cleared and it
  // kept rendering (via CustomTooltip's document.body portal, zIndex 9999) on top of
  // whatever the user opened next. CustomTooltip has pointerEvents:"none", so this
  // listener never blocks the click from reaching its real target; handleTestIconClick
  // and handleCardClick both stopPropagation() on their own toggle click, so this
  // doesn't fight with opening the tooltip in the first place.
  useEffect(() => {
    if (!tooltipData.position) return;
    const closeTooltip = () => setTooltipData({ testNames: [], position: null });
    document.addEventListener("click", closeTooltip);
    return () => document.removeEventListener("click", closeTooltip);
  }, [tooltipData.position]);

  // Belt-and-suspenders for the listener above: SeeMoreIconInTable's menu
  // items (Edit Patient Details, Settlement, etc.) close their own dropdown
  // in the same click that opens their modal, which can remove that
  // dropdown from the DOM before the click finishes bubbling to `document`
  // - so the listener above sometimes never fires. Worse, that dropdown
  // closing reflows the row underneath it back into the cursor's path,
  // which can re-fire the row's own onMouseEnter/onMouseMove (this hover
  // tooltip) AFTER a one-shot "close" already ran, possibly more than once
  // before the modal (a real blocking overlay) actually finishes mounting -
  // so a single close-on-open event kept losing that race. This tracks a
  // persistent SUPPRESS flag instead of just closing once: SeeMoreIconInTable
  // sets it the instant it starts opening any modal and clears it only once
  // that modal is actually gone (onHideModal), so nothing can re-open this
  // tooltip in between no matter how many stray hover events fire.
  const tooltipSuppressedRef = useRef(false);
  useEffect(() => {
    const handleSuppress = (e) => {
      tooltipSuppressedRef.current = !!e?.detail?.suppress;
      if (tooltipSuppressedRef.current) {
        setTooltipData({ testNames: [], position: null });
      }
    };
    window.addEventListener("app:hoverTooltipSuppress", handleSuppress);
    return () => window.removeEventListener("app:hoverTooltipSuppress", handleSuppress);
  }, []);

  const rafRef = useRef(null);
  const dispatch = useDispatch();
  const { DesignationName, HideRePrintColorCode, CompanyCode, EmployeeID,AllowDesktopView   } =
    useLocalStorage("userData", "get");
  const [visitID, setVisitID] = useState();
  const theme = useLocalStorage("theme", "get");

  const [BulkEmailModalState, setBulkEmailModalState] = useState({
    modal: false,
    data: [],
    type: "",
  });

  const handleBulkMainSelect = (index, data) => {
    setBulkEmailModalState({ modal: true, data: data, type: "EmailSend" });
  };
// console.log("AllowDesktopView", AllowDesktopView)
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showEmail, setShowEmail] = useState({ modal: false, patientData: {} });
  const [printLoadingCash, setPrintLoadingCash] = useState({
    loading: false,
    index: -1,
  });
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });
  const [showBillingRemark, setShowBillingRemark] = useState({
    modal: false,
    rowData: null,
  });
  const [showUpdateRemark, setShowUpdateRemark] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const hideRate = useLocalStorage("userData", "get")?.HideRate;
  const [t] = useTranslation();
  const [printLoadingFP, setPrintLoadingFP] = useState({
    loading: false,
    index: -1,
  });
  const [printLoadingPH, setPrintLoadingPH] = useState({
    loading: false,
    index: -1,
  });
  const [printLoadingTRF, setPrintLoadingTRF] = useState({
    loading: false,
    index: -1,
  });
  const [printLoadingConsent, setPrintLoadingConsent] = useState({
    loading: false,
    index: -1,
  });
  const [printLoadingDemoLog, setPrintLoadingDemoLog] = useState({
    loading: false,
    index: -1,
  });
  const [showPatientImage, setShowPatientImage] = useState({
    show: false,
    data: "",
    index: -1,
    loading: false,
  });
  const [medicalHistoryTooltipData, setMedicalHistoryTooltipData] = useState({
    data: [],
    loadingIndex: -1,
  });

  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });

  const onHideModal = () => setShowSettlementModal(false);
  const handlePatientDetailClose = () => setPatientProfile(false);
  const openPatientDetailModal = (data) => {
    setPatientData(data);
    setPatientProfile(true);
  };

  const parseTestNames = (testNameStr) => {
    if (!testNameStr) return [];
    const fixedStr = testNameStr.replace(/([a-zA-Z0-9])"([a-zA-Z])/g, '$1", "$2');

    let parsed;
    try {
      parsed = JSON.parse(fixedStr);
    } catch (error) {
      // TestName can arrive truncated (e.g. a fixed-length DB column cutting
      // off long package JSON mid-object). Salvage whichever whole test
      // objects are still intact instead of dropping the tooltip entirely.
      const objectRegex = /\{[^{}]*\}/g;
      const objectMatches = [];
      let match;
      let trailingStart = 0;
      while ((match = objectRegex.exec(fixedStr)) !== null) {
        objectMatches.push(match[0]);
        trailingStart = match.index + match[0].length;
      }
      parsed = objectMatches
        .map((objStr) => {
          try {
            return JSON.parse(objStr);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      const trailing = fixedStr.slice(trailingStart);
      const trailingTestMatch = trailing.match(/"Test"\s*:\s*"([^"]+)"/);
      if (trailingTestMatch) {
        const statusMatch = trailing.match(/"Status"\s*:\s*"?(\d+)"?/);
        parsed.push({
          Test: trailingTestMatch[1],
          Status: statusMatch ? statusMatch[1] : undefined,
          PackageName: parsed.length ? parsed[parsed.length - 1].PackageName || "" : "",
        });
      }

      if (parsed.length === 0) {
        console.error("Failed to parse TestName:", error);
        return [];
      }
    }

    try {
      const packageMap = new Map();
      const individualTests = [];

      parsed.forEach((t) => {
        const pkg = t.PackageName || "";
        if (pkg) {
          if (!packageMap.has(pkg)) packageMap.set(pkg, []);
          packageMap.get(pkg).push(t);
        } else {
          individualTests.push(t);
        }
      });

      const result = [];
      let num = 1;

      packageMap.forEach((tests, packageName) => {
        result.push({ type: "package-header", packageName });
        tests.forEach((t) => {
          const statusObj = SampleStatus.find((s) => s.value === t.Status);
          result.push({
            type: "test",
            text: `${num++}) ${t.Test}`,
            status: statusObj ? statusObj.label : t.Status,
            statusValue: t.Status || "0",
            groupKey: packageName,
            resultEnteredName: t.ResultEnteredName || "",
            resultEnteredDate: t.ResultEnteredDate || "",
            approvedName: t.ApprovedName || "",
            approvedDate: t.ApprovedDate || "",
          });
        });
      });

      if (individualTests.length > 0) {
        result.push({ type: "no-package-header" });
        individualTests.forEach((t) => {
          const sObj = SampleStatus.find((s) => s.value === t.Status);
          result.push({
            type: "test",
            text: `${num++}) ${t.Test}`,
            status: sObj ? sObj.label : t.Status,
            statusValue: t.Status || "0",
            groupKey: "__individual__",
            resultEnteredName: t.ResultEnteredName || "",
            resultEnteredDate: t.ResultEnteredDate || "",
            approvedName: t.ApprovedName || "",
            approvedDate: t.ApprovedDate || "",
          });
        });
      }

      return result;
    } catch (error) {
      console.error("Failed to parse TestName:", error);
      return [];
    }
  };

  // parseTestNames does a JSON.parse (with a regex-fallback salvage path)
  // plus a Map-based grouping pass per row — real work, not free. It used
  // to run inline inside the row/card .map() on every render, including
  // renders triggered by hover (tooltipData is state on this component, so
  // updating it re-renders the whole thing, re-running that .map() for
  // every row again). With a default page size of 200, that meant ~200
  // JSON.parse+regex passes on every single hover. Caching it here means
  // it only recomputes when the actual result set changes (new search/
  // page), not when the user just moves the mouse.
  const testListByIndex = useMemo(
    () => safeReceiptData.map((d) => parseTestNames(d.TestName)),
    [safeReceiptData]
  );

  const resolveVisitHash = (dataOrHash) => {
    if (typeof dataOrHash === "string") return dataOrHash.trim();
    return (
      dataOrHash?.LedgertransactionIDHash ||
      dataOrHash?.LedgerTransactionIDHash ||
      ""
    )
      .toString()
      .trim();
  };

  const openReceiptPdfResponse = async (res, fallbackMessage) => {
    const raw = res?.data;
    const contentType = (res?.headers?.["content-type"] || "").toLowerCase();
    if (
      contentType.includes("application/json") ||
      contentType.includes("text/plain") ||
      contentType.includes("text/html")
    ) {
      const text = raw instanceof Blob ? await raw.text() : String(raw ?? "");
      try {
        const json = JSON.parse(text);
        toast.error(json?.message || json?.Message || fallbackMessage);
      } catch {
        toast.error(fallbackMessage);
      }
      return false;
    }
    if (!raw || (raw instanceof Blob && raw.size === 0) || raw?.size === 0) {
      toast.error(fallbackMessage);
      return false;
    }
    // Reject tiny / non-PDF payloads that PDF viewers show as blank tabs.
    if (raw instanceof Blob && raw.size < 80) {
      toast.error(fallbackMessage);
      return false;
    }
    const head =
      raw instanceof Blob
        ? await raw.slice(0, 5).text()
        : String(raw).slice(0, 5);
    if (head && !head.startsWith("%PDF")) {
      // Server returned 200 with an error body typed as a blob.
      try {
        const text = raw instanceof Blob ? await raw.text() : String(raw);
        const json = JSON.parse(text);
        toast.error(json?.message || json?.Message || fallbackMessage);
      } catch {
        toast.error(fallbackMessage);
      }
      return false;
    }
    openPdfBlob(new Blob([raw], { type: "application/pdf" }), true);
    return true;
  };

  const getReceipt = (id, index, PHead) => {
    const isPHead = PHead === 1;
    const loadingState = isPHead ? printLoadingPH : printLoadingCash;
    const setLoading = isPHead ? setPrintLoadingPH : setPrintLoadingCash;
    const hash = resolveVisitHash(id);

    if (!hash) {
      toast.error("Visit reference is missing for Cash Receipt.");
      return;
    }

    if (loadingState.index === -1) {
      setLoading({ loading: true, index: index });
      axiosReport
        .post(
          "getReceipt",
          {
            LedgerTransactionIDHash: hash,
            PHead: PHead === 1 ? 1 : 0,
          },
          {
            responseType: "blob",
          }
        )
        .then(async (res) => {
          await openReceiptPdfResponse(
            res,
            "Cash Receipt could not be generated for this visit."
          );
          setLoading({ loading: false, index: -1 });
        })
        .catch(async (err) => {
          setLoading({ loading: false, index: -1 });
          if (err?.response?.data instanceof Blob) {
            try {
              const json = JSON.parse(await err.response.data.text());
              toast.error(
                json?.message || json?.Message || "Error Occured"
              );
              return;
            } catch {
              /* fall through */
            }
          }
          toast.error(err?.response?.data?.message || "Error Occured");
        });
    } else {
      toast.warn("Please wait Generating Receipt");
    }
  };

  const downloadConsentReport = async (data, index) => {
    try {
      setPrintLoadingConsent({ loading: true, index: index });
      const res = await axiosInstance.post(
        "ConcentFormMaster/generateConcentForm",
        { LedgerTransactionIDHash: data?.LedgertransactionIDHash },
        { responseType: "blob" }
      );
      const contentType = res?.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        toast.warning(json?.message || "No consent form found.");
        return;
      }
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      window.open(url, "_blank");
    } catch (error) {
      if (error?.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || "Error generating consent form");
        } catch {
          toast.error("Error generating consent form");
        }
      } else {
        toast.error(error?.response?.data?.message || "Error generating consent form");
      }
    } finally {
      setPrintLoadingConsent({ loading: false, index: -1 });
    }
  };




  const downloadDemographicLogPdf = async (data, index) => {
    const hash = data?.LedgertransactionIDHash || data?.LedgerTransactionIDHash;
    if (!hash) {
      toast.error("Visit reference is missing.");
      return;
    }
    if (printLoadingDemoLog.index !== -1) {
      toast.warn("Please wait generating Demographic Log");
      return;
    }
    try {
      setPrintLoadingDemoLog({ loading: true, index });
      const res = await axiosReport.post(
        "DemographicChange/GetDemographicChangeReport/GetDemographicChangeReport",
        {
          ledgerTransactionIDHash: hash,
          ledgerTransactionID: 0,
          reportFormat: "Pdf",
          fromDate: "",
          toDate: "",
          bookingCentreIds: [],
          changeCentreIds: [],
          searchType: "All",
          searchValue: "",
        },
        { responseType: "blob" }
      );
      const contentType = res?.headers?.["content-type"] || "";
      if (contentType.includes("application/json") || contentType.includes("text/plain")) {
        const text = await res.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || json?.Message || "No demographic log found.");
        } catch {
          toast.warning("No demographic log found for this visit.");
        }
        return;
      }
      if (!res.data || res.data.size === 0) {
        toast.warning("No demographic log found for this visit.");
        return;
      }
      openPdfBlob(new Blob([res.data], { type: "application/pdf" }), true);
    } catch (error) {
      if (error?.response?.data instanceof Blob) {
        try {
          const json = JSON.parse(await error.response.data.text());
          toast.error(json?.message || json?.Message || "Error generating Demographic Log");
        } catch {
          toast.error("Error generating Demographic Log");
        }
      } else {
        toast.error(error?.response?.data?.message || "Error generating Demographic Log");
      }
    } finally {
      setPrintLoadingDemoLog({ loading: false, index: -1 });
    }
  };

  const downloadTRFReport = async (data, index) => {
    try {
      setPrintLoadingTRF({ loading: true, index: index });
      const res = await axiosReport.post("getTRF",
        {
          LedgerTransactionIDHash: data?.LedgertransactionIDHash,
          companyId: 0
        },
        { responseType: "blob" });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      window.open(url, "_blank");
    } catch (error) {
      console.log("Error", error)
    } finally {
      setPrintLoadingTRF({ loading: false, index: -1 });
    }
  }

  const getColor = (status) => {
    if (status) {
      switch (status) {
        case "fullpaid":
          return "#00FA9A";
        case "partialpaid":
          return "#F6A9D1";
        case "fullyunpaid":
          return "#FF457C";
        case "credit":
          return "#b3cdb3";
        case "fullrefund":
          return "#CEE1FF";
        case "All":
          return "white";
        default:
          break;
      }
    }
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

  const handleClose = () =>
    setShowEmail({ ...showEmail, modal: false, patientData: {} });

  const getBarcodeData = (testId, VisitNo, SINNo) => {
    axiosInstance
      .post("SC/getBarcode", {
        LedgerTransactionNo: VisitNo,
        BarcodeNo: SINNo,
        TestID: testId?.split(","),
        barcodeNoDepartmentID: 0,
      })
      .then((res) => toast.success(res.data.message))
      .catch((err) => {
        if (err.response.status === 504) toast.error(t("Something Went Wrong"));
        if (err.response.status === 401) toast.error(err.response.data.message);
      });
  };

  const getReceiptFullyPaid = (id, index) => {
    const hash = resolveVisitHash(id);
    if (!hash) {
      toast.error("Visit reference is missing for Cash Receipt.");
      return;
    }
    if (printLoadingFP.index === -1) {
      setPrintLoadingFP({ loading: true, index: index });
      axiosReport
        .post(
          "getReceiptFullyPaid",
          { LedgerTransactionIDHash: hash },
          { responseType: "blob" },
        )
        .then(async (res) => {
          setPrintLoadingFP({ loading: false, index: -1 });
          await openReceiptPdfResponse(
            res,
            "Cash Receipt could not be generated for this visit."
          );
        })
        .catch(async (err) => {
          setPrintLoadingFP({ loading: false, index: -1 });
          if (err?.response?.data instanceof Blob) {
            try {
              const json = JSON.parse(await err.response.data.text());
              toast.error(
                json?.message || json?.Message || "Error Occured"
              );
              return;
            } catch {
              /* fall through */
            }
          }
          toast.error(
            err?.response?.data?.message ||
              err?.data?.response?.message ||
              "Error Occured"
          );
        });
    } else {
      toast.warn("Please wait Generating Receipt");
    }
  };
  // const getPrintWithHeader = (id, index) => {
  //   if (printLoadingPH.index === -1) {
  //     setPrintLoadingPH({ loading: true, index: index });
  //     axiosReport
  //       .post(
  //         "getPrintWithHeader",
  //         { LedgerTransactionIDHash: id },
  //         { responseType: "blob" },
  //       )
  //       .then((res) => {
  //         setPrintLoadingPH({ loading: false, index: -1 });
  //         const blob = new Blob([res.data], { type: "application/pdf" });
  //         window.open(window.URL.createObjectURL(blob), "_blank");
  //       })
  //       .catch((err) => {
  //         setPrintLoadingPH({ loading: false, index: -1 });
  //         toast.error(
  //           err?.data?.response?.message
  //             ? err?.data?.response?.message
  //             : "Error Occured",
  //         );
  //       });
  //   } else {
  //     toast.warn("Please wait Generating Receipt");
  //   }
  // };

  const Fetch = async (guidNumber, pageName) => {
    const response = await axiosInstance.post("CommonController/GetDocument", {
      Page: pageName,
      Guid: guidNumber,
    });
    return response?.data?.message;
  };

  const getS3url = async (id) => {
    const response = await axiosInstance.post("CommonController/GetFileUrl", {
      Key: id,
    });
    return response?.data?.message;
  };

  const handlePreviewImage = async (guidNumber) => {
    const response = await Fetch(guidNumber, "patientImage");
    if (response.length > 0) {
      const imgURL = await getS3url(response[0]?.awsKey);
      setShowPatientImage({
        show: true,
        data: imgURL,
        index: -1,
        loading: false,
      });
    } else {
      toast.error("No Patient Image Found");
      setShowPatientImage({ show: false, data: "", index: -1, loading: false });
    }
  };

  const handlePatientImage = async (guid, index) => {
    if (!guid) {
      toast.error("No Image found");
    } else {
      setShowPatientImage({
        show: false,
        data: "",
        index: index,
        loading: true,
      });
      await handlePreviewImage(guid);
    }
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
      setMedicalHistoryTooltipData({ data: [], loadingIndex: -1 });
    }
  };

  const handleClick = (data) => {
    dispatch(setReprintLabNo(data?.LedgerTransactionNo));
    dispatch(setReprintRowData(data));
  };

  const getColStyle = (col) => {
    const colId = col?.header || col?.ControlDisplayID;
    if (colId === "Item Name") {
      return {
        minWidth: "200px",
        maxWidth: "200px",
        width: "200px",
        whiteSpace: "normal",
        wordBreak: "break-word",
      };
    }
    if (
      colId === "RateType" ||
      colId === "Rate Type" ||
      colId === "RefferDoctor" ||
      colId === "Patient Name"
    ) {
      return {
        minWidth: "120px",
        whiteSpace: "normal",
        wordBreak: "normal",
      };
    }
    return {};
  };

  const renderCell = (col, data, index ) => {
    const colId = col?.header || col?.ControlDisplayID;

    if (colId === "Action" || colId === "S.No") {
      // Computed once instead of three separate parseRemarks(...) calls
      // (each a fresh JSON.parse) a few lines below.
      const remarksList = parseRemarks(data?.RemarksList);
      // All-dispatched check reuses the same parsed test list the "View
      // Test" tooltip already builds (testListByIndex) — no extra parsing.
      // statusValue "15" is SampleStatus's Dispatched code (Constants.jsx).
      const testEntries = (testListByIndex[index] || []).filter(
        (t) => t.type === "test" || !t.type
      );
      const allDispatched =
        testEntries.length > 0 && testEntries.every((t) => t.statusValue === "15");
      return (
        <div
          className="d-flex align-items-center"
          style={{ gap: "2px" }}
        >
          <span style={{ display: "inline-block", width: "15px" }}>
            {index + 1 + IndexHandle(currentPage, pageSize)}
          </span>
          {allDispatched && (
            <span title="All tests dispatched" style={{ color: "#0f766e", display: "inline-flex" }}>
              <FaTruck size={12} />
            </span>
          )}

          <span onClick={() => handleClick(data)} title="More Actions">
            <SeeMoreIconInTable
              receiptData={data}
              index={index}
              getReceipt={getReceipt}
              getReceiptFullyPaid={getReceiptFullyPaid}
              setVisitID={setVisitID}
              setModal={setModal}
              setShowEmail={setShowEmail}
              show2={show2}
              show3={show}
              DesignationName={DesignationName}
              // Lets the Edit Patient Info modal re-run the search after it saves.
              // Without it the grid kept the pre-edit row, so the patient header
              // still showed the old name until the user searched again.
              refreshData={TableData}
            // printWithHeader={getPrintWithHeader}
            />
          </span>
          {data?.IsPatientDocAvail > 0 && (
            <div>
              {/* <i
                className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                // className="bi bi-paperclip cursor-pointer"
                style={{ fontSize: "16px" }}
                onClick={() => handleOpenPreview(data?.awsKeys)}
                title="View Attachments"
              /> */}
              <IoDocumentTextOutline
                color="#0080ff"
                style={{ fontSize: "20px" }}
                onClick={() => handleOpenPreview(data?.awsKeys)}
                title="View Attachments"
              />

            </div>
          )}
          {data?.IsVip === 1 && (
            <div>
              <i
                className="bi bi-shield-fill-check mr-1 vip-font-size"
                style={{ color: "#ff0707", display: "inline", width: "5%" }}
                title="VIP Patient"
              />
            </div>

          )}
          {data?.isUrgent === 1 && (
            <div>
              <img
                src={Urgent}
                className="sizeicon"
                title="Urgent"
              ></img>
            </div>
          )}

          <div
            data-tooltip-id={`remark-tooltip-${index}`}
            onClick={() => setShowAddRemark({ modal: true, rowData: data })}
            style={{
              cursor: "pointer",
              display: "flex",
              // alignItems: "center",
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
                justifyContent: "center",
                alignItems: "center",
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
          <span
            onClick={() => openPatientDetailModal(data || "")}
            style={{
              cursor: "pointer",
              display: "flex",
              // alignItems: "center",
              gap: "3px",
              marginLeft: "2px",
            }}
            title="Download"
          >
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
            >
              <FaDownload color="white" size={8} />
            </div>
          </span>
          {Array.isArray(remarksList) && remarksList?.length > 0 && (
              <ReactTooltip
                id={`remark-tooltip-${index}`}
                place="top"
                style={{ zIndex: 99999 }}
                clickable
                content={<RemarkTooltip remarks={remarksList} />}
              />
            )}

          <div
            data-tooltip-id={`billing-remark-tooltip-${index}`}
            onClick={() => setShowBillingRemark({ modal: true, rowData: data })}
            style={{
              cursor: "pointer",
              display: "flex",
              gap: "3px",
              marginLeft: "2px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ff9800",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              <FaPlus color="white" size={8} />
            </div>
          </div>
          <ReactTooltip
            id={`billing-remark-tooltip-${index}`}
            place="top"
            style={{ zIndex: 99999 }}
            clickable
            content={
              <div>
                <div>
                  {t("Billing Remark")}: {data?.Remarks || "-"}
                </div>
                <div>
                  {t("Created By")}: {data?.CreatedByName || "-"}
                </div>
                <div>
                  {t("Created Date")}:{" "}
                  {data?.Date ? dateConfig(data.Date) : "-"}
                </div>
              </div>
            }
          />
          <i
            className="fa fa-flask"
            style={{ color: "#6c5ce7", cursor: "pointer", fontSize: "15px" }}
            onClick={(e) => handleTestIconClick(e, index, testListByIndex[index])}
            title="View Test"
          />
        </div>
      );
    }

    if (colId === "Reg Date")
      return <div>{data.Date && dateConfig(data.Date)}</div>;
    if (colId === "Visit No") return data?.LedgerTransactionNo;
    // NEW — Lab/getReceiptReprint doesn't return this field yet, and this
    // column only actually shows once the backend's Page Controller config
    // for PAGE_ID "7" has a ControlDisplayID: "Visit Type" (TypeId 2) row —
    // see backend-docs/backend-reprint-visit-type-filter.md.
    if (colId === "Visit Type") return data?.VisitType;
    if (colId === "UHID") return data?.PatientCode;
    if (colId === "Barcode") return data?.BarcodeNo;
    if (colId === "Test ID") return data?.TestID;
    if (colId === "Patient ID") return data?.PatientID;
    if (colId === "Item Name") return data?.ItemName;
    if (colId === "Centre Type") return data?.CentreType;
    if (colId === "Department") return data?.Department;
    if (colId === "Report Status") return data?.reportStatus;
    if (colId === "Cash Amount") return data?.CashAmt;
    if (colId === "Patient Name") {
      const fullName = data?.PatientName ||
        [data?.Title, data?.FirstName, data?.MiddleName, data?.LastName]
          .filter((v) => v != null && v !== "" && v !== "undefined" && v !== "null")
          .join(" ");
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
          {showPatientImage.loading && index === showPatientImage.index ? (
            <Loading />
          ) : (
            <span onClick={() => handlePatientImage(data?.PatientGuid, index)} style={{ cursor: "pointer" }}>
              {data?.Gender === "Female" ? <FaFemale /> : <FaUser />}
            </span>
          )}
          <span>{fullName}</span>
        </div>
      );
    }
    if (colId === "Age/Gender")
      return `${data?.Age}/${data?.Gender == "Female" ? "F" : "M"}`;
    if (colId === "Mobile No") return data?.Mobile;
    if (colId === "Gross Amt")
      return (
        <div className="amount">{hideRate == 0 ? data?.GrossAmount : ""}</div>
      );
    if (colId === "Dis Amt")
      return <div className="amount">{data?.DiscountOnTotal?.toFixed(2)}</div>;
    if (colId === "Net Amt")
      return (
        <div className="amount">{hideRate == 0 ? data?.NetAmount : ""}</div>
      );
    if (colId === "Due Amt")
      return (
        <div className="amount">{hideRate == 0 ? data?.DueAmount : ""}</div>
      );
        if (colId === "Mrp Amt")
      return (
        <div className="amount">{hideRate == 0 ? data?.MRPAmount : ""}</div>
      );
    if (colId === "Paid Amt")
      return <div className="amount">{data?.Adjustment}</div>;
    if (colId === "Collection Charges")
      return <div className="amount">{data?.CollectionCharges}</div>;
    if (colId === "Centre") return data?.Centre;
    if (colId === "RateType") return data?.RateTypeName || data?.RateType;
    if (colId === "RateTypeCode") return data?.RateTypeCode;
    if (colId === "RefferLabName") return data?.RefferLabName || "-";
    if (colId === "RefferDoctor") return data?.DoctorName;
    if (colId === "CashCollection") return <div>{data.CashCollection}</div>;
    if (colId === "OtherCollection") return <div>{data.OtherCollection}</div>;
     if (colId === "ReferenceNumber") return <div>{data.TRFNo}</div>;
    if (colId === "CollectionBoyName")
      return <div>{data.CollectionBoyName}</div>;
    if (colId === "User" || colId === "UserName")
      return Number(ShowUserFilterAtReprint) ? data?.CreatedByName : null;

    if (colId === "Edit Info") {
      return (data?.CentreType == "B2B" || data?.CentreType == "SUB PCC") &&
        (DesignationName == "B2B" || DesignationName == "SUB PCC") ? (
        ""
      ) : (
        <Link
          to={`/EditPatientInfo`}
          state={{ data: data?.LedgerTransactionNo }}
        >
          <i className="fa fa-edit" aria-hidden="true"></i>
        </Link>
      );
    }

    if (colId === "Rec Edit") {
      return (
        <Link
          to={`/EditPatientDetails`}
          state={{ data: data?.LedgerTransactionNo }}
        >
          {t("Rec Edit")}
        </Link>
      );
    }

    if (colId === "Demographic Log PDF") {
      return (
        <>
          {printLoadingDemoLog.loading && printLoadingDemoLog.index === index ? (
            <SpinnerLoad />
          ) : (
            <span
              title={t("Demographic Log PDF")}
              style={{ cursor: "pointer", color: "#0F2B4C" }}
              onClick={() => downloadDemographicLogPdf(data, index)}
            >
              <IoDocumentTextOutline size={16} />
            </span>
          )}
        </>
      );
    }

    if (colId === "ConsentPrint") {
      return (
        <>
          {printLoadingConsent.loading && printLoadingConsent.index === index ? (
            <SpinnerLoad />
          ) : (
            <span
              style={{
                cursor:
                  Number(data?.MannualReceipt) === 1
                    ? "pointer"
                    : "not-allowed",
                opacity: Number(data?.MannualReceipt) === 1 ? 1 : 0.5,
                pointerEvents:
                  Number(data?.MannualReceipt) === 1 ? "auto" : "none",
              }}
              onClick={() => {
                if (Number(data?.MannualReceipt) !== 1) return;
                downloadConsentReport(data, index);

                
                
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </span>
          )}
        </>
      );
    }
    if (colId === "Cash Receipt" && data?.HideReceipt !== 2) {
      return (
        <>
          {printLoadingCash.loading && printLoadingCash.index === index ? (
            <SpinnerLoad />
          ) : (
            <span
              style={{
                cursor:
                  Number(data?.MannualReceipt) === 1
                    ? "pointer"
                    : "not-allowed",
                opacity: Number(data?.MannualReceipt) === 1 ? 1 : 0.5,
                pointerEvents:
                  Number(data?.MannualReceipt) === 1 ? "auto" : "none",
              }}
              onClick={() => {
                if (Number(data?.MannualReceipt) !== 1) return;

                if (SkipRemarksOnReceiptPrint == 1) {
                  getReceipt(resolveVisitHash(data), index, 0);
                } else {
                  handleOpenSchedule(data, index, "normal", 0);
                }
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </span>
          )}
        </>
      );
    }
    if (colId === "Cash receipt with Header") {
      return (
        <>
          {printLoadingPH.loading && printLoadingPH.index === index ? (
            <SpinnerLoad />
          ) : (
            <span
              style={{
                color:"red",
                cursor:
                  Number(data?.MannualReceipt) === 1
                    ? "pointer"
                    : "not-allowed",
                opacity: Number(data?.MannualReceipt) === 1 ? 1 : 0.5,
                pointerEvents:
                  Number(data?.MannualReceipt) === 1 ? "auto" : "none",
              }}
              onClick={() => {
                if (Number(data?.MannualReceipt) !== 1) return;

                if (SkipRemarksOnReceiptPrint == 1) {
                  getReceipt(resolveVisitHash(data), index, 1);
                } else {
                  handleOpenSchedule(data, index, "normal", 1);
                }
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </span>
          )}
        </>
      );
    }

    if (colId === "FullyPaid" && data?.HideReceipt !== 2) {
      return (
        <>
          {printLoadingFP.loading && printLoadingFP.index === index ? (
            <SpinnerLoad />
          ) : (
            <span
              style={{
                cursor:
                  Number(data?.MannualMRPReceipt) === 1
                    ? "pointer"
                    : "not-allowed",
                opacity: Number(data?.MannualMRPReceipt) === 1 ? 1 : 0.5,
                pointerEvents:
                  Number(data?.MannualMRPReceipt) === 1 ? "auto" : "none",
              }}
              onClick={() => {
                if (Number(data?.MannualMRPReceipt) !== 1) return;
                if (SkipRemarksOnReceiptPrint == 1) {
                  getReceiptFullyPaid(resolveVisitHash(data), index);
                } else {
                  handleOpenSchedule(data, index, "fullyPaid");
                }
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </span>
          )}
        </>
      );
    }


    if (colId === "TRF" || colId === "trf") {
      return (
        <>
          {printLoadingTRF.loading && printLoadingTRF.index === index ? (
            <SpinnerLoad />
          ) : (
            <span
              style={{
                cursor:
                  Number(data?.MannualTRF) == 1
                    ? "pointer"
                    : "not-allowed",
                opacity: Number(data?.MannualTRF) === 1 ? 1 : 0.5,
                pointerEvents:
                  Number(data?.MannualTRF) === 1 ? "auto" : "none",
              }}
              onClick={() => {
                if (Number(data?.MannualTRF) !== 1) return;
                downloadTRFReport(data, index);
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </span>
          )}
        </>
      );
    }

    if (colId === "View Details") {
      return (
        <>
        {!(DefaultCurrencyName === "KES" && RateCentreType === "B2B")&&(
          <i
            className="fa fa-search"
            onClick={() => {
              setModal(true);
              setVisitID(data?.LedgerTransactionNo);
            }}
          />
        )}
          <FaEye
            style={{
              marginLeft: "10px",
              fontSize: "18px",
              cursor: "pointer",
              color: "#007bff",
            }}
            onClick={() => {
              setShowPatientModal(true);
              setSelectedLedgerTransactionNo(data?.LedgerTransactionNo);
              setSelectedTestID(data?.TestIDDetail || 0);
            }}
          />
        </>
      );
    }

    if (colId === "Send Email")
      return (
        <img
          src={email}
          className="sizeicon"
          onClick={() => handleBulkMainSelect(index, data)}
        />
      );

    if (colId === "UploadDocument") {
      return (
        <div
          className="text-primary"
          style={{
            cursor: "pointer",
            color: data?.UploadDocumentCount > 0 ? "#4ea30c" : "",
          }}
          onClick={() =>
            show2({ modal: true, data: data?.PatientGuid, index: index })
          }
        >
          <img src={file} className="sizeicon" />
          &nbsp;{data?.UploadDocumentCount}
        </div>
      );
    }

    if (colId === "Medical History") {
      return (
        <>
          <div
            className="text-primary"
            style={{
              cursor: "pointer",
              color: data?.MedicalHistoryCount > 0 ? "#4ea30c" : "",
            }}
            onClick={() =>
              show({
                modal: true,
                data: data?.PatientGuid,
                ID: data?.LedgerTransactionID,
                index: index,
              })
            }
            onMouseEnter={() => {
              if (data?.MedicalHistoryCount > 0)
                fetchMedicalHistoryTooltipData(data?.MedicalHistoryList, index);
            }}
            data-tooltip-id={`medical-history-tooltip-${index}`}
          >
            <img src={Medical} className="sizeicon" />
            &nbsp;{data?.MedicalHistoryCount}
          </div>
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
                medicalHistoryTooltipData?.data &&
                  medicalHistoryTooltipData.data.length > 0 ? (
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
    }

    if (colId === "Remarks") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {/* Falls back to RadiologyRemarks when Remarks is null/empty —
              e.g. a radiology-only booking with no lab remarks entered but
              a remark left specifically on the radiology side. */}
          {/* pre-line — a browser <span> collapses \n into a plain space by
              default, so a multi-line remark showed as one run-on line;
              this keeps the actual line breaks while still word-wrapping
              normally. */}
          <span style={{ whiteSpace: "pre-line" }}>
            {data?.Remarks || data?.RadiologyRemarks || "-"}
          </span>
          <i
            className="fa fa-edit text-primary"
            style={{ cursor: "pointer" }}
            title={t("Edit Remark")}
            onClick={() => setShowBillingRemark({ modal: true, rowData: data })}
          ></i>
        </div>
      );
    }

    return null;
  };

  const getHeaderLabel = (col) => {
    if (col?.icon)
      return <i className={`fa ${col.icon}`} aria-hidden="true"></i>;
    return t(col?.header || col?.ControlDisplayName || col?.ControlDisplayID);
  };

  useEffect(() => {
    if (reprintResponse?.success) {
      if (reprintResponse.type === "normal") {
        getReceipt(
          reprintResponse.LedgertransactionIDHash,
          reprintResponse.index,
          reprintResponse.PHead === 1 ? 1 : 0
        );
      } else if (reprintResponse.type === "fullyPaid") {
        getReceiptFullyPaid(
          reprintResponse.LedgertransactionIDHash,
          reprintResponse.index,
        );
      }
    }
  }, [reprintResponse]);

  return (
    <>
      {showAddRemark.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData("All");
          }}
          rowData={showAddRemark.rowData}
          visitKey="LedgerTransactionNo"
          bindTestFromRow={true}
          testIDsKey="TestIDDetail"
          testNamesKey="TestName"
          ledgerTransactionIDKey="LedgerTransactionID"
        />
      )}

      {showBillingRemark.modal && (
        <BillingRemarkModal
          show={showBillingRemark.modal}
          handleShow={() =>
            setShowBillingRemark({ modal: false, rowData: null })
          }
          rowData={showBillingRemark.rowData}
          TableData={TableData}
        />
      )}

      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />

      {safeReceiptData?.length > 0 ? (
        <>
          {showEmail?.modal && (
            <SendEmailModalReprint
              show={showEmail?.modal}
              data={showEmail?.patientData}
              handleClose={handleClose}
            />
          )}
          {patientProfile && (
            <PatientTestDetailModal
              patientData={patientData}
              patientProfile={patientProfile}
              handlePatientDetailClose={handlePatientDetailClose}
            />
          )}
          <div className="">
            {viewMode === "card" ? (
              <div className="rr-card-grid">
                {safeReceiptData.map((data, index) => {
                  const testList = testListByIndex[index];
                  const rowBg =
                    HideRePrintColorCode == 1 ? "#cbd5e1" : getColor(data?.reportStatus);
                  const {
                    action,
                    visitNo,
                    barcode,
                    patient,
                    age,
                    rateType,
                    centre,
                    doctor,
                    referenceNumber,
                    username,
                    mobileNo,
                    uhid,
                  } = cardHeaderCols;
                  return (
                    <div
                      key={index}
                      className="rr-card"
                      style={{ "--card-status": rowBg }}
                    >
                      <div className="rr-card__header">
                        {isMobileCardView ? (
                          centre && (
                            <div className="rr-card__centre">
                              {renderCell(centre, data, index)}
                            </div>
                          )
                        ) : (
                          <div className="rr-card__ids">
                            {visitNo && (
                              <span className="rr-card__visitno">
                                {renderCell(visitNo, data, index)}
                              </span>
                            )}
                            {barcode && (
                              <span className="rr-card__barcode">
                                {renderCell(barcode, data, index)}
                              </span>
                            )}
                          </div>
                        )}
                        {action && (
                          <div className="rr-card__actions">
                            {renderCell(action, data, index)}
                          </div>
                        )}
                      </div>

                      {/* Test-name-tooltip tap is scoped to just this
                          identity+body zone — not the header (action icons,
                          which now include the "View Test" flask icon) or
                          footer (print/attachment buttons) below — so it
                          never renders on top of something clickable.
                          onMouseEnter/onMouseLeave (hover-triggered tooltip)
                          commented out, not removed — replaced by the
                          flask icon's onClick (handleTestIconClick) in the
                          card header, same reasoning as the table row. */}
                      <div
                        className="rr-card__hover-zone"
                        onClick={(e) => handleCardClick(e, index, testList)}
                        // onMouseEnter={(e) => handleCardMouseEnter(e, index, testList)}
                        // onMouseLeave={handleCardMouseLeave}
                      >
                        {isMobileCardView ? (
                          (patient || age || doctor || barcode || visitNo || referenceNumber || username || mobileNo || uhid) && (
                            <div className="rr-card__identity rr-card__identity--mobile">
                              <div className="rr-card__identity-col rr-card__identity-col--left">
                                {patient && (
                                  <div className="rr-card__patient">
                                    <span className="rr-card__srno">
                                      {index + 1 + IndexHandle(currentPage, pageSize)}.
                                    </span>
                                    {renderCell(patient, data, index)}
                                  </div>
                                )}
                                {(age || doctor) && (
                                  <div className="rr-card__meta">
                                    {age && <span>{renderCell(age, data, index)}</span>}
                                    {age && doctor && (
                                      <span className="rr-card__dot">•</span>
                                    )}
                                    {doctor && <span>{renderCell(doctor, data, index)}</span>}
                                  </div>
                                )}
                                {(barcode || visitNo) && (
                                  <div className="rr-card__ids">
                                    {barcode && (
                                      <span className="rr-card__barcode">
                                        {renderCell(barcode, data, index)}
                                      </span>
                                    )}
                                    {visitNo && (
                                      <span className="rr-card__visitno">
                                        {renderCell(visitNo, data, index)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {(referenceNumber || username || mobileNo || uhid) && (
                                <div className="rr-card__identity-col rr-card__identity-col--right">
                                  {referenceNumber && (
                                    <div className="rr-card__mini-field">
                                      <span className="rr-card__field-label rr-card__field-label--bold">
                                        {t("Ref")}-
                                      </span>
                                      <span className="rr-card__field-value">
                                        {renderCell(referenceNumber, data, index)}
                                      </span>
                                    </div>
                                  )}
                                  {username && (
                                    <div className="rr-card__mini-field">
                                      <span className="rr-card__field-label rr-card__field-label--bold">
                                        {t("User")}-
                                      </span>
                                      <span className="rr-card__field-value">
                                        {renderCell(username, data, index)}
                                      </span>
                                    </div>
                                  )}
                                  {mobileNo && (
                                    <div className="rr-card__mini-field">
                                      <FaPhoneAlt className="rr-card__mini-field-icon" />
                                      <span className="rr-card__field-value">
                                        {renderCell(mobileNo, data, index)}
                                      </span>
                                    </div>
                                  )}
                                  {uhid && (
                                    <div className="rr-card__mini-field">
                                      <span className="rr-card__field-label rr-card__field-label--bold">
                                        {t("UHID")}-
                                      </span>
                                      <span className="rr-card__field-value">
                                        {renderCell(uhid, data, index)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        ) : (
                          (patient || age || rateType) && (
                            <div className="rr-card__identity">
                              {patient && (
                                <div className="rr-card__patient">
                                  {renderCell(patient, data, index)}
                                </div>
                              )}
                              {(age || rateType) && (
                                <div className="rr-card__meta">
                                  {age && <span>{renderCell(age, data, index)}</span>}
                                  {age && rateType && (
                                    <span className="rr-card__dot">•</span>
                                  )}
                                  {rateType && (
                                    <span>{renderCell(rateType, data, index)}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        )}

                        <div className="rr-card__divider" />

                        <div className="rr-card__body">
                          {cardOtherBodyCols.map((col, colIdx) => {
                            const value = renderCell(col, data, index);
                            if (value === null || value === undefined || value === "")
                              return null;
                            return (
                              <div
                                className="rr-card__field"
                                data-field={col?.header || col?.ControlDisplayID}
                                key={colIdx}
                              >
                                <span className="rr-card__field-label">
                                  {t(col?.header || col?.ControlDisplayID)}
                                </span>
                                <span className="rr-card__field-value">{value}</span>
                              </div>
                            );
                          })}
                        </div>

                        {isMobileCardView && testList?.length > 0 && (
                          <>
                            <div className="rr-card__divider" />
                            <div className="rr-card__tests">
                              {testList.map((item, tIdx) => {
                                if (item.type === "package-header") {
                                  return (
                                    <div key={tIdx} className="rr-card__tests-header">
                                      {t("Package Name")} - {item.packageName}
                                    </div>
                                  );
                                }
                                if (item.type === "no-package-header") {
                                  return (
                                    <div key={tIdx} className="rr-card__tests-header">
                                      {t("Individual Tests")}
                                    </div>
                                  );
                                }
                                if (item.type === "test") {
                                  // Package tests: the package-header line
                                  // above already names the package — don't
                                  // also enumerate its individual
                                  // tests/parameters here. Standalone tests
                                  // (groupKey "__individual__", under the
                                  // "Individual Tests" header) have no
                                  // package name to summarize them by, so
                                  // those still list each test.
                                  if (item.groupKey !== "__individual__") return null;
                                  return (
                                    <div
                                      key={tIdx}
                                      className={`rr-card__tests-row Status-${item.statusValue}`}
                                    >
                                      {item.text} - {item.status}
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </>
                        )}

                        {cardAmountCols.length > 0 && (
                          <>
                            <div className="rr-card__divider" />
                            <div className="rr-card__body rr-card__body--amounts">
                              {cardAmountCols.map((col, colIdx) => {
                                const value = renderCell(col, data, index);
                                if (value === null || value === undefined || value === "")
                                  return null;
                                return (
                                  <div
                                    className="rr-card__field"
                                    data-field={col?.header || col?.ControlDisplayID}
                                    key={colIdx}
                                  >
                                    <span className="rr-card__field-label">
                                      {t(col?.header || col?.ControlDisplayID)}
                                    </span>
                                    <span className="rr-card__field-value">{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {cardFooterCols.length > 0 && (
                        <>
                          <div className="rr-card__divider" />
                          <div className="rr-card__footer">
                            {cardFooterCols.map((col, colIdx) => (
                              <div
                                className="rr-card__footer-action"
                                key={colIdx}
                                title={t(col?.header || col?.ControlDisplayID)}
                              >
                                {renderCell(col, data, index)}
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
            <div id="tableContainer" className="table-wrapper">
              <Tables
                style={{
                  minHeight: "300px",
                  maxHeight: "400px",
                  overflowY: "scroll",
                }}
                scrollView={Number(AllowDesktopView) === 1 ? "force-desktop-table" : ""}
              >
                <thead className="cf">
                  <tr>
                    {columnsToRender.map((col, idx) => (
                       <th
                        key={idx}
                        className={col?.icon ? "text-center" : ""}
                        style={getColStyle(col)}
                      >
                        {getHeaderLabel(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeReceiptData.map((data, index) => {
                    const testList = testListByIndex[index];
                    const rowBg =
                      HideRePrintColorCode == 1
                        ? "#fff"
                        : getColor(data?.reportStatus);
                    return (
                      <tr
                        key={index}
                        className="receipt-reprint-row"
                        style={{
                          background: rowBg,
                          "--row-bg": rowBg,
                          // getColor()'s palette (and the #fff fallback) are
                          // all light/pastel regardless of NextGen light or
                          // dark mode, so the text sitting on them needs to
                          // stay dark either way — shell.css's generic
                          // .mainTable text-color rule defaults to
                          // var(--ng-text), which is near-white in dark
                          // mode and would be unreadable on these rows.
                          "--row-text": "#1e293b",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          if (window.innerWidth >= 768) return;
                          // Mobile: onClick fires on the exact tapped card,
                          // unlike onMouseEnter which fires on wrong rows.
                          // Tap same card again → close; tap new card → show.
                          if (tooltipData.rowIndex === index && tooltipData.position) {
                            setTooltipData({ testNames: [], position: null });
                            return;
                          }
                          if (tooltipSuppressedRef.current) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipData({
                            testNames: testList,
                            position: { x: rect.left + 8, y: rect.bottom + 4 },
                            rowIndex: index,
                          });
                        }}
                        // Hover-triggered tooltip, restored across the whole
                        // row (not just the Action column's "View Test"
                        // icon) per explicit request. RAF-throttled position
                        // updates on mousemove keep this cheap even across
                        // ~200 rows — only one rAF is ever pending at a time
                        // (cancelled/replaced on each move), so it can't pile
                        // up work the way an un-throttled setState per pixel
                        // of mouse movement would. Desktop-only; mobile keeps
                        // using the tap handler in onClick above.
                        onMouseEnter={(e) => {
                          if (window.innerWidth < 768) return;
                          if (tooltipSuppressedRef.current) return;
                          setTooltipData({
                            testNames: testList,
                            position: { x: e.clientX, y: e.clientY },
                            rowIndex: index,
                          });
                        }}
                        onMouseMove={(e) => {
                          if (window.innerWidth < 768) return;
                          if (tooltipSuppressedRef.current) return;
                          const x = e.clientX;
                          const y = e.clientY;
                          if (rafRef.current) cancelAnimationFrame(rafRef.current);
                          rafRef.current = requestAnimationFrame(() => {
                            setTooltipData((prev) => ({
                              ...prev,
                              position: { x, y },
                            }));
                            rafRef.current = null;
                          });
                        }}
                        onMouseLeave={() => {
                          if (window.innerWidth < 768) return;
                          if (rafRef.current) {
                            cancelAnimationFrame(rafRef.current);
                            rafRef.current = null;
                          }
                          setTooltipData({ testNames: [], position: null });
                        }}
                      >
                        {columnsToRender.map((col, colIdx) => (
                          <td
                            className="py-1"
                            key={colIdx}
                            data-title={t(
                              col?.header || col?.ControlDisplayName,
                            )}
                            style={getColStyle(col)}
                          >
                            {renderCell(col, data, index)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </Tables>
            </div>
            )}
            {tooltipData.position && tooltipData.testNames.length > 0 && (
              <CustomTooltip
                testNames={tooltipData.testNames}
                position={tooltipData.position}
                // CustomTooltip flips the tooltip upward when within the
                // last `rowsToFlip` (8) of `totalRows` — a reasonable
                // heuristic for a table, where row index tracks vertical
                // position 1:1, but wrong for the card grid: cards wrap
                // into multiple columns, so an index near the end of the
                // array can just as easily be in the top row on screen.
                // That mismatch was forcing the tooltip to flip above the
                // cursor for any of the last 8 cards regardless of where
                // they'd actually scrolled to. Omitting both props in card
                // view leaves totalRows-rowIndex as NaN (always false),
                // so only the real viewport-overflow check still flips it.
                rowIndex={viewMode === "card" ? undefined : tooltipData.rowIndex}
                totalRows={viewMode === "card" ? undefined : safeReceiptData?.length || 0}
              />
            )}
          </div>

          {modal && (
            <CustomModal
              show={modal}
              visitID={visitID}
              onHide={() => setModal(false)}
            />
          )}
        </>
      ) : (
        <NoRecordFound />
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
            setBulkEmailModalState({ modal: false, data: [], type: "" })
          }
        />
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
            {configList && configList.length > 0 ? (
              configList.map((col, idx) => (
                <div className="col-sm-6 mb-2" key={idx}>
                  <Form.Check
                    type="switch"
                    id={`col-toggle-${idx}`}
                    label={t(col.header)}
                    checked={col.visible == 1 || col.visible === true}
                    onChange={() => handleColumnToggle(col, idx)}
                    className="m-0"
                  />
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted">
                {t("Loading column configuration...")}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ReceiptReprintTable;