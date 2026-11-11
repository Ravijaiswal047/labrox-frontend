import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
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
import { FaDownload, FaEye, FaFemale, FaUser } from "react-icons/fa";
import DispatchPatientDetailModal from "../utils/DispatchPatientDetailModal";
import BulkEmailModal from "../Laboratory/BulkEmailModal";
import DispatchBulkEmailModal from "./DisptachBulkEmailModal";
import AddRemark from "../utils/AddRemark";
import { FaPlus } from "react-icons/fa";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { getAccurateAge } from "../../utils/Constants";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { notify } from "../../utils/utils";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import moment from "moment";

const DispatchTableNew = forwardRef(({
  TableData,
  dispatchData: dispatchDatas,
  show,
  show2,
  users,
  columnConfig,
  Status,
  patientLabResponse,
  originalTableData = [],
  pageSize = 0,
  currentPage = 0,
  filterData = [],
  searchTerm = "",
  isNABL = 0,
  onSelectionChange,
}, ref) => {
  // Remarks at second position
  const {
    SessionRateTypeID,
    SessionInvoiceTo,
    SessionDoctorId,
    SessionShowOnlineRemark,
    HideInTransitIconatDispatch,
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkLoading, setBulkLoading] = useState({
    With: false,
    Without: false,
  });

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRows.length);
    }
  }, [selectedRows, onSelectionChange]);
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

  const hasDynamicFilter = filterData.some(
    (item) => item.TypeId == 2 && item.IsShow == 1,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ NEW: filteredData — searchTerm parent se aata hai (Moved up to fix ReferenceError)
  // ─────────────────────────────────────────────────────────────────────────
  const searchableKeys = [
    "PatientName",
    "PatientCode",
    "Mobile",
    "VisitNo",
    "DoctorName",
    "ReferLabName",
    "Centre",
    "RateTypeName",
    "Test",
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

  const columnsToRender = useMemo(() => {
    if (hasDynamicFilter) {
      const dynamicCols = filterData
        .filter((item) => item.TypeId === 2 && item.IsShow === 1)
        .map((item) => ({
          header: item.ControlDisplayID,
          icon: iconMapping[item.ControlDisplayID] || null,
          tooltip: item.TooltipText || item.ControlDisplayID,
          style: { whiteSpace: "nowrap" },
        }));

      // Include "Select" if it exists in gearVisibleColumns, in its original relative order
      const hasSelect = dynamicCols.some((col) => col.header === "Select");
      const selectConfig = gearVisibleColumns.find(
        (col) => col.header === "Select",
      );

      if (selectConfig && !hasSelect) {
        return [selectConfig, ...dynamicCols];
      }

      return dynamicCols;
    } else {
      return gearVisibleColumns;
    }
  }, [filterData, gearVisibleColumns, hasDynamicFilter]);

  // Logic to unique identifier for a row
  const getRowKey = (row) => {
    return `${row.VisitNo}-${row._pli?.ItemId || row._pli?.InvestigationID || row._testIndex}`;
  };

  const flattenedData = useMemo(() => {
    const flattened = [];
    let lastVisitNo = null;
    let patientCounter = 0;

    filteredData.forEach((data, patientIndex) => {
      let pliList = [];
      try {
        pliList = JSON.parse(data?.PliDataList || "[]");
      } catch (e) {
        pliList = [];
      }

      const parsedContent = parse(data?.Test || "");
      const rawElements = Array.isArray(parsedContent)
        ? parsedContent
        : [parsedContent];

      const countInputs = (n) => {
        if (!n) return 0;
        if (n.type === "input") return 1;
        if (n.props?.children) {
          return React.Children.toArray(n.props.children).reduce((acc, c) => acc + countInputs(c), 0);
        }
        return 0;
      };

      const units = [];
      const splitRecursive = (nodes) => {
        nodes.forEach(node => {
          if (!node) return;
          const c = countInputs(node);
          if (c > 1) {
            if (node.props?.children) {
              splitRecursive(React.Children.toArray(node.props.children));
            } else {
              units.push(node);
            }
          } else {
            units.push(node);
          }
        });
      };

      splitRecursive(rawElements);

      // ✅ IMPROVED GROUPING: Group units by their corresponding checkbox/test
      const groupedUnits = [];
      let currentGroup = [];
      units.forEach((u) => {
        // Start a new group whenever we find a node that is/contains an input
        if (countInputs(u) > 0) {
          if (currentGroup.length > 0) {
            groupedUnits.push(currentGroup);
          }
          currentGroup = [u];
        } else {
          // Otherwise, append to current group (text, br, etc.)
          currentGroup.push(u);
        }
      });
      if (currentGroup.length > 0) groupedUnits.push(currentGroup);

      // Trust pliList as the source of truth for rows. 
      const rowCount = Math.max(pliList.length, 1);

      const isNewPatient = data.VisitNo !== lastVisitNo;
      if (isNewPatient) {
        patientCounter++;
        lastVisitNo = data.VisitNo;
      }

      for (let i = 0; i < rowCount; i++) {
        const pli = pliList[i] || {};
        // If we have a matching unit group, use it.
        let unitGroupForThisRow = groupedUnits[i] || [];

        flattened.push({
          ...data,
          _pli: pli,
          _testEl: unitGroupForThisRow,
          _isFirstOfPatient: isNewPatient && i === 0,
          _patientSerialNumber: patientCounter,
          _patientIndex: patientIndex,
          _testIndex: i,
          _totalInPatient: rowCount,
        });
      }
    });
    return flattened;
  }, [filteredData, currentPage, pageSize]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(
        flattenedData
          .filter((row) => row._pli?.IsApproved == 1)
          .map(getRowKey)
      );
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (rowKey) => {
    setSelectedRows(prev => {
      if (prev.includes(rowKey)) {
        return prev.filter(k => k !== rowKey);
      } else {
        return [...prev, rowKey];
      }
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
    console.log("dataxx", data);
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

  const handleBulkDownload = async (PHead) => {
    if (selectedRows.length < 1) return;
    const loader = PHead === 1 ? "With" : "Without";
    setBulkLoading((prev) => ({ ...prev, [loader]: true }));

    try {
      const selectedData = flattenedData.filter((d) =>
        selectedRows.includes(getRowKey(d)),
      );

      const groups = {};
      selectedData.forEach((d) => {
        const hash = d._pli?.TestIdHash;
        if (hash) {
          if (!groups[d.VisitNo]) groups[d.VisitNo] = [];
          groups[d.VisitNo].push(hash);
        }
      });

      const visitKeys = Object.keys(groups);
      const pdfUrlsResult = await Promise.all(
        visitKeys.map((visitNo) =>
          axiosReport.post(`commonReports/GetLabReport`, {
            TestIDHash: [...new Set(groups[visitNo])],
            PHead: PHead,
            signature: 0,
            IsDownload: 0,
            PrintColour: "1",
            WithoutnablLogo: isNABL == 1 ? -1 : 0,
          }),
        ),
      );

      const failedResponses = pdfUrlsResult.filter((res) => res.data?.success === false && res.data?.message);

      const pdfUrls = pdfUrlsResult
        .filter((res) => res.data?.success && res.data?.url)
        .map((res) => res.data.url.split("?")[0]);

      if (pdfUrls.length > 0) {
        const bulkRes = await axiosReport.post("commonReports/BulkDownload", {
          pdfUrls,
        });

        if (bulkRes.data?.url) {
          const finalUrl = bulkRes.data.url.includes(" ")
            ? bulkRes.data.url.split(" ").join("%20")
            : bulkRes.data.url;
          window.open(finalUrl, "_blank");
        } else {
          toast.error("Failed to generate bulk report");
        }
        
        if (failedResponses.length > 0) {
          toast.error(failedResponses[0].data.message);
        }
      } else {
        if (failedResponses.length > 0) {
          toast.error(failedResponses[0].data.message);
        } else {
          toast.error("No valid reports found for selected rows");
        }
      }
      setBulkLoading((prev) => ({ ...prev, [loader]: false }));
    } catch (error) {
      console.error("Bulk download error:", error);
      toast.error("Failed to generate bulk reports");
      setBulkLoading({ With: false, Without: false });
    }
  };

  useImperativeHandle(ref, () => ({
    handleBulkDownload,
    selectedRowsCount: selectedRows.length
  }));

  const navigate = useNavigate();

  const handleReport = async (data, loader, index, PHead) => {
    if (printLoading.index === -1) {
      setPrintLoading({ ...printLoading, index: index });
      let TestIDHash = [];

      // ✅ Refined grouping: Only print selected tests for this visit
      const visitNo = data?.VisitNo;
      const selectedForThisVisit = flattenedData.filter(
        (row) =>
          row.VisitNo === visitNo && selectedRows.includes(getRowKey(row)),
      );

      if (selectedForThisVisit.length > 0) {
        TestIDHash = selectedForThisVisit
          .map((row) => row._pli?.TestIdHash)
          .filter(Boolean);
      } else {
        // If nothing selected, just print current test
        if (data._pli?.TestIdHash) {
          TestIDHash.push(data._pli.TestIdHash);
        }
      }

      setPrintLoading({
        [loader]: true,
        index: index,
      });

      if (TestIDHash?.length === 0) {
        // Fallback to extraction if state fails (rare)
        const extractedValues = extractValuesFromHtml(data?.Test);
        TestIDHash.push(...extractedValues);
      }

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
            } catch { }
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

  const handleBulkMainSelect = (index, data) => {
    setBulkEmailModalState({
      modal: true,
      data: data,
      type: "EmailSend",
    });
  };

  console.log("dispatchData", dispatchData);
  console.log("columnConfig", columnConfig);
  console.log(" ", columnsToRender);

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
          defaultTestFromRow={true}
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
        <>
          <div className="dispatch-report-new-table">
            <Tables>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                <tr>
                  {/* ✅ columnsToRender use karo (gear + dynamic controller) */}
                  {columnsToRender.map((col, index) => (
                    <th
                      key={index}
                      style={{
                        padding: "10px 15px",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "1.2rem",
                        color: "#2c3e50",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                      className={
                        col.header === "Test" || col.header === "Package Name"
                          ? "dispatch-test-col"
                          : ""
                      }
                    >
                      {col.header === "Select" ? (
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            flattenedData.filter(row => row._pli?.IsApproved == 1).length > 0 &&
                            selectedRows.length === flattenedData.filter(row => row._pli?.IsApproved == 1).length
                          }
                        />
                      ) : col?.icon ? (
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

              <tbody>
                {flattenedData.map((data, rowIndex) => {
                  const patientLevelColumns = [
                    "S.No", "Reg Date", "Visit No", "Name", "Doctor", "Refer Lab",
                    "Mobile", "Age/Gender", "UHID", "Centre", "RateType", "RateTypeCode",
                    "S.ReceiveDate", "Uploaded Document", "Medical History", "Search"
                  ];

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

                  // Filter remarks for this specific test
                  const currentTestID = data._pli?.TestID || data._pli?.ItemId || data._pli?.InvestigationID;
                  const testSpecificRemarks = remarksList.filter(r => {
                    const remarkTestID = r.TestID || r.ItemID || r.ItemId || r.InvestigationID || r.TestId;

                    // Match specific test
                    if (currentTestID && remarkTestID && (String(remarkTestID) === String(currentTestID))) {
                      return true;
                    }

                    // Global remarks (no ID or zero ID) show on every row of the visit
                    if (!remarkTestID || String(remarkTestID) === "0") {
                      return true;
                    }

                    return false;
                  });

                  const visibleRemarks = shouldHideRemarkBtn
                    ? testSpecificRemarks?.filter((r) => r.ShowOnline === 1)
                    : testSpecificRemarks;

                  // Use backend count for the visit across all rows if available
                  const remarkCount = (shouldHideRemarkBtn ? data?.LabRemarkShowOnlineCount : data?.LabRemarkCount) || visibleRemarks.length;

                  // Grouping logic for columns
                  const shouldShow = (colHeader) => {
                    if (data._isFirstOfPatient) return true;

                    const prev = flattenedData[rowIndex - 1];
                    if (!prev || prev.VisitNo !== data.VisitNo) return true;

                    // For Barcode, hide if same as previous row in same patient
                    if (colHeader === "Barcode No") {
                      const currentBC = data._pli?.BarcodeNo || data._pli?.SinNo;
                      const prevBC = prev._pli?.BarcodeNo || prev._pli?.SinNo;
                      return currentBC !== prevBC;
                    }

                    // For Collection Date, hide if same as previous row in same patient
                    if (colHeader === "S.CollectionDate") {
                      const currentDT = data._pli?.SampleCollectionDate || data.SampleCollectionDate;
                      const prevDT = prev._pli?.SampleCollectionDate || prev.SampleCollectionDate;
                      return currentDT !== prevDT;
                    }

                    if (patientLevelColumns.includes(colHeader)) return false;

                    return true;
                  };

                  return (
                    // <tr key={rowIndex} className={`Status-${data._pli?.Status || "transparent"} ${data._isFirstOfPatient ? "patient-group-row" : ""}`}>
                    <tr key={rowIndex} className={`Status-${data._pli?.Status || "transparent"} ${data._isFirstOfPatient ? "patient-group-row" : ""}`}>
                      {/* ✅ columnsToRender use karo */}
                      {columnsToRender.map((col, index) => {
                        const isVisible = shouldShow(col.header);
                        return (
                          // <td
                          //   key={index}
                          //   data-title={t(col.header)}
                          //   className={`${
                          //     col.header === "Test" || col.header === "Package Name" ? "dispatch-test-col" : ""
                          //   } Status-${data._pli?.Status || "transparent"} ${!isVisible ? "mobile-hide-column" : ""}`}
                          //   style={col.header === "Status" ? { textAlign: "center", fontWeight: "500" } : {}}
                          // >
                          <td
                            key={index}
                            data-title={col.header}
                            className={`${col.header === "Test" || col.header === "Package Name" ? "dispatch-test-col" : ""
                              } Status-${data._pli?.Status || "transparent"} ${!isVisible ? "mobile-hide-column" : ""}`}
                            style={col.header === "Status" ? { textAlign: "center", fontWeight: "500" } : {}}
                          >
                            {col.header === "Select" ? (
                              data._pli?.IsApproved == 1 && (
                                <input
                                  type="checkbox"
                                  checked={selectedRows.includes(getRowKey(data))}
                                  onChange={() => handleSelectRow(getRowKey(data))}
                                />
                              )
                            ) : col.header === "S.No" ? (
                              <div className="d-flex" style={{ gap: "4px" }}>
                                {data._isFirstOfPatient ? (
                                  <>
                                    {data._patientSerialNumber + IndexHandle(currentPage, pageSize)}
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
                                        <img src={Urgent} className="sizeicon" title="Urgent"></img>
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
                                  </>
                                ) : null}
                              </div>
                            ) : (
                              shouldShow(col.header) && (
                                <>
                                  {col.header === "S.CollectionDate" &&
                                    (data._pli?.SampleCollectionDate || data?.SampleCollectionDate) && (
                                      <>
                                        <p className="mb-0">
                                          {(data._pli?.SampleCollectionDate || data?.SampleCollectionDate)?.split(" ")?.[0]}
                                        </p>
                                        <p className="mb-0">
                                          {(data._pli?.SampleCollectionDate || data?.SampleCollectionDate)?.split(" ")
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
                                      {data._pli?.BarcodeNo || data._pli?.SinNo ? (
                                        <p className="mt-1">{data._pli?.BarcodeNo || data._pli?.SinNo}</p>
                                      ) : (
                                        data._isFirstOfPatient && uniqueBarcodeArr.map((brCode, brcIndex) => {
                                          const tooltipId = `tooltip-${rowIndex}-${brcIndex}`;
                                          return (
                                            <React.Fragment key={tooltipId}>
                                              <p data-tooltip-id={tooltipId} className="mt-1">
                                                {brCode.code}
                                              </p>
                                              <ReactTooltip
                                                id={tooltipId}
                                                place="top"
                                                content={<div>{brCode.sampleType}</div>}
                                                style={{ zIndex: 9999 }}
                                              />
                                            </React.Fragment>
                                          );
                                        })
                                      )}
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
                                      <div className="printTest dispatchTestCell w-100">
                                        <div className={`px-1 rounded d-flex align-items-center gap-1`}>
                                          <span className="ms-1" style={{ fontWeight: "500" }}>
                                            {data._pli?.TestName || data._pli?.Test || (data._isFirstOfPatient ? parse(data?.Test) : "")}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {console.log("handleCheck(data)", data)}
                                  {col.header === "Print" && (
                                    <div>
                                      {data._pli?.IsApproved == 1 && (
                                        <div className="d-flex align-items-center justify-content-center flex-row px-1 mt-1">
                                          {printLoading.Without &&
                                            printLoading.index === rowIndex ? (
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
                                              onClick={() =>
                                                handleReport(data, "Without", rowIndex, 0)
                                              }
                                              title="Print without header"
                                            ></i>
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
                                                  TestID: data._pli?.TestID || data._pli?.ItemId || data._pli?.InvestigationID,
                                                  testOptions: allTests,
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
                                                  TestID: data._pli?.TestID || data._pli?.ItemId || data._pli?.InvestigationID,
                                                  testOptions: allTests,
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
                                    if (!visibleRemarks || visibleRemarks.length === 0) {
                                      return "";
                                    }

                                    const sortedRemarks = [...visibleRemarks].sort((a, b) => {
                                      const dateDiff =
                                        moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") -
                                        moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A");

                                      if (dateDiff !== 0) return dateDiff;

                                      // fallback for same timestamp
                                      return visibleRemarks.indexOf(b) - visibleRemarks.indexOf(a);
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
                                            handleBulkMainSelect(index, data)
                                          }
                                          title="Send email"
                                        ></i>
                                        <Link
                                          to={"/dispatch-patient-report"}
                                          state={data}
                                          style={{ width: "30px" }}
                                        >
                                          <i className="bi bi-envelope-arrow-up mb-0"></i>
                                        </Link>
                                      </div>
                                    </>
                                  )}
                                  {col.header === "UHID" && data?.PatientCode}
                                  {col?.header === "Dept.Category" && data?.Category}
                                  {col?.header === "VisitType" && data?.VisitType}
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
                                  {col.header === "Status" && (
                                    <div style={{ textTransform: "capitalize" }}>
                                      {data._pli?.Status == 5
                                        ? "Approved"
                                        : data._pli?.Status == 4
                                          ? "Rejected"
                                          : data._pli?.Status == 11
                                            ? "Hold"
                                            : data._pli?.Status == 2
                                              ? "Collected"
                                              : data._pli?.Status == 3
                                                ? "Received"
                                                : data._pli?.Status == 10
                                                  ? "Result Done"
                                                  : data._pli?.Status == 6
                                                    ? "Printed"
                                                    : data._pli?.Status == 1
                                                      ? "Not Collected"
                                                      : data._pli?.Status || ""}
                                    </div>
                                  )}
                                </>
                              )
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
          {selectedRows.length > 1 && (
            <div className="d-flex justify-content-end gap-2 mt-2 px-2">
              <button
                className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleBulkDownload(0)}
                style={{ height: "30px", fontSize: "12px", fontWeight: "600", minWidth: "150px" }}
                disabled={bulkLoading.Without}
              >
                {bulkLoading.Without ? <SpinnerLoad /> : <><FaDownload size={12} /> Bulk (Without LH)</>}
              </button>
              <button
                className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleBulkDownload(1)}
                style={{ height: "30px", fontSize: "12px", fontWeight: "600", minWidth: "150px" }}
                disabled={bulkLoading.With}
              >
                {bulkLoading.With ? <SpinnerLoad /> : <><FaDownload size={12} /> Bulk (With LH)</>}
              </button>
            </div>
          )}
        </>
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
    </>
  );
});

export default DispatchTableNew;