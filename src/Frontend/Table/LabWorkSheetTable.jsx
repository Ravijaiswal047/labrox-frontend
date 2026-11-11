import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { axiosReport } from "../../utils/axiosInstance";
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
import "./LabWorkSheetTable.css";
import { OverlayTrigger, Tooltip as ReactBootstrapTooltip } from "react-bootstrap";


function LabWorksheetTable({
  redata,
  GetResultEntry,
  show,
  show2,
  columnConfig,
  TableData,
  Status,
  selectedRowIndex,
  setSelectedRowIndex,
  doctorAdmin,
  machine,
  currentPage,
  setReturnFromResultTableWithStatus,
  pageSize,
  filterData = [], // ✅ FIX 1: Added filterData prop with default empty array
  onGetSelectedIDs
}) {
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
    url: null,
  });

  const [printCheckedRows, setPrintCheckedRows] = useState({});
  const [printCheckbox, setPrintCheckbox] = useState({});

  // ✅ FIX 2: Compute dynamic column filtering properly
  // const dynamicAllowedSet = new Set(
  //   filterData
  //     .filter((item) => item.TypeId == 2 && item.IsShow == 1)
  //     .map((item) => item.ControlDisplayID),
  // );

  // const gearVisibleColumns = columnConfig
  //   .filter((col) =>  col.header !== "Doctor")
  //   .filter((col) => col.visible == 1);

  // const hasDynamicFilter = filterData.some((item) => item.TypeId == 2);

  const iconMapping = {
    "Uploaded Document": "fa-file",
    "Medical History": "fa-h-square",
    "Customize Date": "fa-edit"
  };

  // ✅ FIX 3: columnsToRender is now properly used in the table (see thead/tbody below)
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
  //    : columnConfig.filter((col) => col.visible == 1); // ✅ Use all visible columns when no dynamic filter

  // const columnsToRender = useMemo(() => {
  //   return filterData
  //     .filter((item) => item.TypeId == 2 && item.IsShow == 1)
  //     .map((item) => {
  //       const headerName = item.ControlDisplayID;
  //       return {
  //         header: headerName,
  //         // Match icon from map, otherwise null
  //         icon: iconMapping[headerName] || null,
  //         tooltip: item.TooltipText || headerName,
  //         style: { whiteSpace: "nowrap" }
  //       };
  //     });
  // }, [filterData]);

  const columnsToRender = [
  {
    header: "S.No",
    icon: null,
    tooltip: "S.No",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "S.CollectionDate",
    icon: null,
    tooltip: "S.CollectionDate",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "Reg Date",
    icon: null,
    tooltip: "Reg Date",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "Visit No",
    icon: null,
    tooltip: "Visit No",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "Barcode No",
    icon: null,
    tooltip: "Barcode No",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "UHID",
    icon: null,
    tooltip: "UHID",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "Name",
    icon: null,
    tooltip: "Name",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "Age/Gender",
    icon: null,
    tooltip: "Age/Gender",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "Test",
    icon: null,
    tooltip: "Test",
    style: {
      whiteSpace: "nowrap",
    },
  },
  {
    header: "Print",
    icon: null,
    tooltip: "Print",
    style: {
      whiteSpace: "nowrap",
    },
  },
];

  const GetLabReport = () => {
    const selectedTestIDs = Object.keys(printCheckbox)
      .filter(id => printCheckbox[id]);

    if (!selectedTestIDs.length) return;
    setLoading(true);
    axiosInstance
      .post("commonReports/PatientLabWorksheet", {
        testIDHash: selectedTestIDs || [],
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);

      })
      .finally(() => {
        setLoading(false);
      });
  };


  // const handleOpenPreview = (guid) => {
  //   if (guid) {
  //     setPreviewConfig({ visible: true, url: guid });
  //   } else {
  //     toast.error("No attachment found for this record");
  //   }
  // };

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

  const tdRefs = useRef([]);

  useEffect(() => {
    if (tdRefs?.current[selectedRowIndex]) {
      tdRefs?.current[selectedRowIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [selectedRowIndex]);

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

  const handlePrintCheckboxChange = (checked, data, index) => {
    console.log("xxdata", data);
    setPrintCheckedRows((prev) => ({
      ...prev,
      [data.TestIdhash]: checked,
    }));
    // 👉 Your custom logic here
    console.log("Checked:", checked, "Row:", data);
  };

  const handleCheckboxChange = (id) => {
    const updatedCheckbox = {
      ...printCheckbox,
      [id]: !printCheckbox[id]
    };

    setPrintCheckbox(updatedCheckbox);

    // 👉 SEND selected IDs to parent
    onGetSelectedIDs(
      Object.keys(updatedCheckbox).filter(id => updatedCheckbox[id])
    );
  };

  const allPrintIds = redata.map((d) => d.TestIdhash).filter(Boolean);
  const isAllPrintChecked =
    allPrintIds.length > 0 && allPrintIds.every((id) => printCheckbox[id]);
  const isSomePrintChecked =
    !isAllPrintChecked && allPrintIds.some((id) => printCheckbox[id]);

  const handleSelectAllPrint = () => {
    const newChecked = !isAllPrintChecked;
    const updatedCheckbox = { ...printCheckbox };
    allPrintIds.forEach((id) => { updatedCheckbox[id] = newChecked; });
    setPrintCheckbox(updatedCheckbox);
    onGetSelectedIDs(Object.keys(updatedCheckbox).filter((id) => updatedCheckbox[id]));
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
    return data?.TestDetails?.some(
      (item) => item.Status == 5 || item.Status == 6,
    );
  };

  const handleReport = (data, loader, index, PHead) => {
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
    GetResultEntry(
      {
        TestID: data?.TestID,
        LedgerTransactionID: "",
        DepartmentID: "",
        symbol: "",
        Mobile: data?.Mobile,
        VisitNo: data?.VisitNo,
        PEmail: data?.PEmail,
        MacID: machine[0]?.value ?? "",
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
        isOutSource: data?.isOutSource,
        index: index,
        ApprovedBy:
          doctorAdmin?.length == 1 ? doctorAdmin[0]?.value?.toString() : "0",
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
      ApprovedBy:
        doctorAdmin?.length == 1 ? doctorAdmin[0]?.value?.toString() : "0",
      MacID: machine[0]?.value ?? "",
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

  const handleTestClick = (testID, data, index) => {
    setIndex(index);
    setSelectedRowIndex(index);
    GetResultEntry(
      {
        TestID: testID?.toString(),
        LedgerTransactionID: "",
        DepartmentID: "",
        symbol: "",
        Mobile: data?.Mobile,
        VisitNo: data?.VisitNo,
        PEmail: data?.PEmail,
        MacID: machine[0]?.value ?? "",
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
        isOutSource: data?.isOutSource,
        index: index,
        ApprovedBy:
          doctorAdmin?.length == 1 ? doctorAdmin[0]?.value?.toString() : "0",
      },
      index,
      setLoading,
    );
  };

  // ✅ Helper to render cell content based on column header
  const renderCell = (col, data, index) => {
    switch (col.header) {
      case "S.No":
        const parsedLastPrinted = JSON.parse(data.LastPrintedData || "[]");
        const isPrinted = parsedLastPrinted.length > 0;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <div
              style={{
                width: "20px",          // 🔥 key fix
                // textAlign: "right",    // keeps numbers aligned nicely
                flexShrink: 0,
                padding: "0px 2px",
              }}
            >{prevPageSize + index + 1}</div>
            {isPrinted && (
              <>
                <i
                  className="bi bi-check text-success mb-0"

                  data-tooltip-id={`tooltip-${index}`}
                  data-tooltip-html={`
              <table style="border-collapse: collapse; width:300px;">
                <thead>
                  <tr>
                    <th style="border:1px solid #ccc;padding:4px; width: 40px;">S.No</th>
                    <th style="border:1px solid #ccc;padding:4px;">Printed By</th>
                    <th style="border:1px solid #ccc;padding:4px;">Last Printed Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${parsedLastPrinted
                      .map(
                        (item, index) => `
                    <tr>
                      <td style="border:1px solid #ccc;padding:4px; word-break: break-word; width: 40px;">${index + 1 || "-"}</td>
                      <td style="border:1px solid #ccc;padding:4px; word-break: break-word;">${item.LastPrintedBy || "-"}</td>
                      <td style="border:1px solid #ccc;padding:4px;word-break: break-word;">${item.LastPrintedDate || "-"}</td>
                    </tr>`
                      )
                      .join("")}
                </tbody>
              </table>
            `}
                  style={{ cursor: "pointer", fontSize: "2rem" }}
                />
                <ReactTooltip
                  id={`tooltip-${index}`}
                  place="top"
                  style={{
                    backgroundColor: "white",
                    boxShadow: "none",
                    padding: "4px",
                    zIndex: 9999,
                    // maxWidth: "260px",
                    // maxHeight: "200px",     
                    // overflowY: "auto", 
                    // opacity: 0.3,
                  }}
                />
              </>
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
          data.isFirstRow ?
            <div className="">
              <p className="mb-0">
                {data?.PreSampleCollectionDate
                  ? moment(data.PreSampleCollectionDate || "-").format("DD/MMM/YYYY")
                  : "N/A"}
              </p>
              <p className="mb-0">
                {data?.PreSampleCollectionDate
                  ? moment(data.PreSampleCollectionDate).format("hh:mm A")
                  : ""}
              </p>
            </div>
            : "-"

        );

      case "Reg Date":
        return (
          data.isFirstRow ?
            <div className="mr-2">
              <p className="mb-0">
                {moment(data.Date).format("DD/MMM/YYYY") || "-"}
              </p>
              <p className="mb-0">
                {moment(data.Date).format("hh:mm A") || "-"}
              </p>
            </div>
            : "-"

        )

      // dateConfig(data?.Date);

      case "Dep. Receive Time":
        return (
          <div className="">
            <p className="mb-0">
              {data?.SampleReceiveDate
                ? moment(data.SampleReceiveDate).format("DD/MMM/YYYY")
                : "-"}
            </p>
            <p className="mb-0">
              {data?.SampleReceiveDate
                ? moment(data.SampleReceiveDate || "-").format("hh:mm A")
                : "-"}
            </p>
          </div>
        )
      // return data?.SampleReceiveDate
      //   ? moment(data?.SampleReceiveDate).format("DD/MMM/YYYY hh:mm:ss A")
      //   : null;

      case "Visit No":
        return data.isFirstRow ? data?.VisitNo : "-";

      case "Ward No":
        return data?.BedNo || "-";

      case "hmis_patCrNo":
        return data?.hmis_patCrNo || "-";

      case "Barcode No":
        return data.isFirstRow ? data?.SinNo : "-";

      case "UHID":
        return data.isFirstRow ? data?.PatientCode : "-";

      case "Name":
        return (
          data.isFirstRow ?
            <div
              // className="nameWidth" 
              style={{ width: "150px", wordWrap: "break-word", whiteSpace: "normal" }}
            >

              {data?.PatientName || "-"}
            </div>
            : "-"

        );

      case "Mobile":
        return data.isFirstRow ? data?.Mobile : "-";

      case "Age/Gender":
        return data.isFirstRow ? `${getAccurateAge(data?.Age || "-")}/${data?.Gender || "-"}` : "-";

      case "Test":
        return (
          <div className="printTest dispatchTestCell">
            {data?.TestDetails.map((test, testIndex) => (
              <div key={testIndex}>
                <div
                  className={`round Status-${test.Status}`}
                //   onClick={() => handleTestClick(test.TestID, data, testIndex)}
                >
                  {test.TestName.split("<br>")[0] && (
                    <p className="mb-0">
                      <span className="mr-1">
                        <CreateCheckbox
                          item={test}
                          ledgerId={data.LedgerTransactionID || "-"}
                        />
                      </span>
                      {test.TestName.split("<br>")[0]}
                    </p>
                  )}
                  {test.TestName.split("<br>")
                    .slice(1)
                    .map((line, lineIndex) => (
                      <p key={lineIndex} className="mb-0">
                        {line}
                      </p>
                    ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "Print":
        // return hasPrintableTests(data) ? (
        return <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={(e) => e.stopPropagation()} // prevent row click
        >
          <input
            type="checkbox"

            checked={printCheckbox[data.TestIdhash] || false}
            onChange={() => handleCheckboxChange(data.TestIdhash)}
          />
        </div>
      // ) : null;

      case "Doctor":
        return data.isFirstRow ? data?.DoctorName : "-";

      case "Dept.Category":
        return data.isFirstRow ? data?.Category : "-";

      case "VisitType":
        return data.isFirstRow ? data?.VisitType : "-";

      case "Centre":
        return data.isFirstRow ? data?.Centre : "-";

      case "RateType":
        return data.isFirstRow ? data?.RateTypeName : "-";

      case "RateTypeCode":
        return data.isFirstRow ? data?.RateTypeCode : "-";

      case "Remarks":
        return (
          <div
            style={{ gap: "4px" }}
            className="d-flex align-items-center justify-content-center"
          >
            <div
              data-tooltip-id={`remark-tooltip-${index}`}
              onClick={() =>
                setShowAddRemark({ modal: true, rowData: { ...data } })
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
                }}
              >
                <FaPlus color="white" size={8} />
              </div>
              {data.LabRemarkCount > 0 && (
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                  ({data.LabRemarkCount || "-"})
                </span>
              )}
            </div>
            {Array.isArray(data?.RemarksList) &&
              data?.RemarksList?.length > 0 && (
                <ReactTooltip
                  id={`remark-tooltip-${index}`}
                  place="top"
                  style={{ zIndex: 9999 }}
                  clickable
                  content={<RemarkTooltip remarks={data.RemarksList} />}
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

      default:
        return null;
    }
  };

  console.log("print", printCheckedRows);
  console.log("config", columnsToRender);

  return (
    <>
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData(Status);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          visitKey="VisitNo"
          testIDsKey="TestID"
          testNamesKey="TestName"
          ledgerTransactionIDKey="LedgerTransactionID"
          patientNameKey="PatientName"
          ageGenderKey={["Age", "Gender"]}
        />
      )}

      {redata.length > 0 ? (
        <div className="px-1">
          {loading && <Loading />}
          <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
            <div>
              {/* ✅ FIX 4: thead now uses columnsToRender instead of columnConfig */}
              <thead style={{ position: "sticky", top: 0 }}>
                <tr>
                  {columnsToRender.map((col, index) => (
                    <th key={index}>
                      {col?.header === "Print" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <input
                            type="checkbox"
                            checked={isAllPrintChecked}
                            ref={(el) => {
                              if (el) el.indeterminate = isSomePrintChecked;
                            }}
                            onChange={handleSelectAllPrint}
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: "pointer" }}
                            title="Select / Deselect All"
                          />
                          {t("Print")}
                        </div>
                      ) : col?.icon ? (
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

              {/* ✅ FIX 5: tbody now uses columnsToRender instead of columnConfig */}
              <tbody
                style={{
                  backgroundColor:
                    printLoading?.With || printLoading?.Without
                      ? "rgba(181, 209, 218, 0.5)"
                      : "",
                }}
              >
                {redata.map((data, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: data?.isOutSource == 1 ? "#ebb17d" : "",
                    }}
                    ref={(el) => (tdRefs.current[index] = el)}
                  >
                    {columnsToRender.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        // style={{
                        //   backgroundColor:
                        //     data?.isOutSource == 1
                        //       ? "pink"
                        //       : selectedRowIndex === index
                        //         ? "#FCFACA"
                        //         : "",
                        // }}
                        style={{
                          backgroundColor:
                            col.header === "TAT Status"
                              ? data?.TATDelay == 1
                                ? "red"
                                : data?.TATIntimate == 1
                                  ? "yellow"
                                  : "green"
                              : data?.isOutSource == 1
                                ? "#ebb17d"
                                : selectedRowIndex === index
                                  ? "#FCFACA"
                                  : "",
                        }}
                        data-title={t(col.header)}
                        className={
                          col.header === "Test" ? "dispatch-test-col" : ""
                        }
                      >
                        {/* ✅ FIX 6: Use renderCell helper instead of duplicated inline conditions */}
                        {renderCell(col, data, index)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </div>
          </Tables>
        </div>
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
    </>
  );
}

export default LabWorksheetTable;
