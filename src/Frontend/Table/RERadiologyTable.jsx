import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { Modal, Form } from "react-bootstrap";
import { IndexHandle, parseAwsKeys } from "../../utils/helpers";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Urgent from "../Images/urgent.gif";
import moment from "moment";
import { IoDocumentTextOutline } from "react-icons/io5";
import CustomModal from "../utils/CustomModal";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import PdfViewer from "../Components/PdfViewer";

const isMobileDevice = () =>
  window.innerWidth <= 768 ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const PAGE_NAME = "ResultEntryRadiology";

const RADIOLOGY_STATUS_CLASS = {
  Save: "Status-10",
  Approved: "Status-5",
  Hold: "Status-11",
  Unapproved: "Status-20",
};

const DEFAULT_COLUMNS = [
  { header: "S.No", visible: 1 },
  // { header: "TAT Status", visible: 1 },
  // { header: "Time Diff", visible: 1 },
  { header: "Reg Date", visible: 1 },
  { header: "Dept Rec. Date", visible: 1 },
  { header: "UHID No.", visible: 1 },
  { header: "Patient Name", visible: 1 },
  { header: "Visit No.", visible: 1 },
  { header: "SIN No.", visible: 1 },
  { header: "Tests", visible: 1 },
  { header: "Print", visible: 1 },
  { header: "StradusDocument", visible: 1 },  
  { header: "StradusImage", visible: 1 },  
  { header: "Doctor", visible: 1 },
  { header: "Approved By", visible: 1 },
  { header: "PCC/Client Name", visible: 1 },
];

const HIDDEN_HEADERS = ["Age/Sex", "Age/Gender"];

const getGenderMeta = (data) => {
  const fromAge = String(data?.Age_Gender || "").split("/");
  const age = fromAge[0] || "";
  const gender = String(data?.Gender || fromAge[1] || "").trim();
  const key = gender.toLowerCase();
  const isMale = key === "male" || key === "m";
  const isFemale = key === "female" || key === "f";
  return {
    age,
    gender,
    icon: isMale ? "fa fa-male" : isFemale ? "fa fa-female" : "fa fa-user",
    color: isMale ? "#1e88e5" : isFemale ? "#e91e63" : "#6c757d",
  };
};

function RERadiologyTable({
  redata,
  openVisit,
  currentPage,
  pageSize,
  filterData = [],
  showColumnModal,
  setShowColumnModal,
  columnConfig,
  getFilterResultOption,
}) {
  const { t } = useTranslation();
  const { EmployeeID } = useLocalStorage("userData", "get");
  const theme = useLocalStorage("theme", "get");
  const [printingHash, setPrintingHash] = useState(null);
  const [auditModal, setAuditModal] = useState(false);
  const [visitID, setVisitID] = useState(null);
  const [previewConfig, setPreviewConfig] = useState({ visible: false, url: null });
  const [reportPreview, setReportPreview] = useState({ show: false, url: "" });

  const handleOpenPreview = (keys) => {
    const parsedKeys = parseAwsKeys(keys);
    if (!parsedKeys) return;
    setPreviewConfig({ visible: true, url: parsedKeys });
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  const handlePrintReport = (testIdHash, phead = 0) => {
    if (!testIdHash || printingHash) return;
    setPrintingHash(`${testIdHash}_${phead}`);

    // Radiology reports are rendered on demand (a fresh headless-browser PDF
    // render per click), unlike the plain Result Entry report which mostly
    // serves an already-generated PDF. By the time that render finishes and
    // resolves below, the click that triggered it is no longer "recent"
    // enough for Chrome to treat a new window.open() as user-initiated - it
    // still opens the tab, but silently drops the PDF viewer's print/download
    // toolbar, which is what looked like a "preview-only" mode. Opening the
    // tab synchronously here (still inside the click handler) and only
    // pointing it at the PDF once it's ready keeps it tied to the real
    // click, so the toolbar renders normally, same as Result Entry.
    const reportWindow = window.open("", "_blank");

    axiosReport
      .post(
        "RediologyResultEntry/PrintRadiologyReport",
        {
          testIdHash,
          pHead: phead
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
          try {
            const json = JSON.parse(text);
            toast.error(json?.message || t("Something Went Wrong"));
          } catch {
            toast.error(t("Something Went Wrong"));
          }
          reportWindow?.close();
          return;
        }

        const pdfUrl = window.URL.createObjectURL(blob);
        if (reportWindow) {
          reportWindow.location.href = pdfUrl;
        } else {
          // Pop-up was blocked outright (no window handle to reuse) - fall
          // back to the old behaviour rather than losing the report.
          window.open(pdfUrl, "_blank");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Print failed"));
        reportWindow?.close();
      })
      .finally(() => setPrintingHash(null));
  };

  // redata comes back flat - one row per test - so the same visit repeats its whole
  // header (Patient Name, Visit No., Reg Date, ...) once per test. Group by visit so
  // each visit renders as a single row with its tests stacked as lines inside the
  // "Tests" cell, matching how the plain (non-radiology) Result Entry table groups
  // TestDetails under one row instead of duplicating the row per test.
  const groupedRedata = useMemo(() => {
    const groups = [];
    const indexByKey = new Map();
    (redata || []).forEach((test) => {
      const key = test?.LedgertransactionId ?? test?.LedgerTransactionNo;
      if (indexByKey.has(key)) {
        groups[indexByKey.get(key)].Tests.push(test);
      } else {
        indexByKey.set(key, groups.length);
        groups.push({ ...test, Tests: [test] });
      }
    });
    // Urgent/VIP/StatSample are per-test flags in the flat data - surface them on the
    // grouped row if ANY test in the visit has them set, instead of only reflecting
    // whichever test happened to be first.
    return groups.map((group) => ({
      ...group,
      Urgent: group.Tests.some((t) => t?.Urgent === "Y") ? "Y" : "N",
      IsVip: group.Tests.some((t) => Number(t?.IsVip) === 1) ? 1 : 0,
      StatSample: group.Tests.some((t) => Number(t?.StatSample) === 1) ? 1 : 0,
    }));
  }, [redata]);

  const gearVisibleColumns = DEFAULT_COLUMNS.filter((col) => col.visible == 1);
  const hasDynamicFilter = filterData.some((item) => item.TypeId == 2);

  const rawColumnsToRender = hasDynamicFilter
    ? filterData
      .filter((item) => item.TypeId == 2 && item.IsShow == 1)
      .map((dynItem) =>
        gearVisibleColumns.find(
          (col) =>
            col.header === dynItem.ControlDisplayID ||
            col.header === dynItem.ControlDisplayName,
        ),
      )
      .filter(Boolean)
      .filter((col) => !HIDDEN_HEADERS.includes(col.header))
    : DEFAULT_COLUMNS.filter((col) => col.visible == 1 && !HIDDEN_HEADERS.includes(col.header));

  const columnsToRender = useMemo(() => {
    if (!columnConfig || columnConfig.length === 0) {
      return rawColumnsToRender;
    }
    return rawColumnsToRender.filter((col) => {
      if (HIDDEN_HEADERS.includes(col.header)) return false;
      const configItem = columnConfig.find(
        (c) => c.header?.toLowerCase() === col.header?.toLowerCase(),
      );
      if (configItem) {
        return configItem.visible == 1 || configItem.visible === true;
      }
      return true;
    });
  }, [rawColumnsToRender, columnConfig]);

  const configList = useMemo(() => {
    if (columnConfig && columnConfig.length > 0) {
      return columnConfig.filter((c) => !HIDDEN_HEADERS.includes(c.header));
    }
    return rawColumnsToRender
      .filter((c) => !HIDDEN_HEADERS.includes(c.header))
      .map((c) => ({ header: c.header, visible: true }));
  }, [columnConfig, rawColumnsToRender]);

  const handleColumnToggle = (column, index) => {
    const updatedColumn = configList.map((ele, i) =>
      i === index ? { ...ele, visible: !ele.visible } : ele,
    );

    axiosInstance
      .post("Lab/SaveFilterTableReprintData", {
        SaveData: updatedColumn,
        saveData: updatedColumn,
        PageName: PAGE_NAME,
        pageName: PAGE_NAME,
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

  const renderCell = (col, data, index) => {
    switch (col.header) {
      case "S.No":
        return (
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <span>{index + 1 + IndexHandle(currentPage, pageSize)}&nbsp;</span>
            {data?.StatSample == 1 && (
              <span
                className="fa fa-cog fa-spin"
                title={t("STATSample")}
              />
            )}
            <i
              className="fa fa-search"
              onClick={() => {
                setAuditModal(true);
                setVisitID(data?.LedgerTransactionNo);
              }}
              style={{ cursor: "pointer" }}
              title={t("Audit Trail")}
            />
            {data?.IsPatientDocAvail > 0 && (
              <IoDocumentTextOutline
                color="#0080ff"
                style={{ fontSize: "18px", cursor: "pointer" }}
                onClick={() => handleOpenPreview(data?.awsKeys)}
                title={t("View Attachments")}
              />
            )}
            {data?.Urgent === "Y" && (
              <img src={Urgent} className="sizeicon" title={t("Urgent")} />
            )}
            {data?.IsVip === 1 && (
              <i
                className="bi bi-shield-fill-check vip-font-size"
                style={{ color: "#FFC107" }}
                title={t("VIP Patient")}
              />
            )}
          </div>
        );

      case "TAT Status": {
        const text =
          data?.TATDelay == 1
            ? "Outside TAT"
            : data?.TATIntimate == 1
              ? "Near TAT"
              : "Within TAT";
        const backgroundColor =
          data?.TATDelay == 1 ? "red" : data?.TATIntimate == 1 ? "yellow" : "green";
        const color = data?.TATIntimate == 1 ? "black" : "white";
        return (
          <span
            style={{
              backgroundColor,
              color,
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
      }

      case "Time Diff":
        return <>{data?.TIMEDIFF}</>;

      case "Reg Date":
         return (
                  <div className="mr-2">
                    <p className="mb-0">
                      {data?.DATE
                        ? moment(data.DATE).format("DD/MMM/YYYY")
                        : "N/A"}
                    </p>
                    <p className="mb-0">
                      {data?.DATE
                        ? moment(data.DATE).format("hh:mm A")
                        : ""}
                    </p>
                  </div>
                );
        // return <>{data?.DATE}</>;

      case "Dept Rec. Date":
        return (
          <>
            {data?.SampleReceiveDate}&nbsp;
            <span>{data?.SampleReceiveTime}</span>
          </>
        );

      case "UHID No.":
        return <>{data?.PatientCode}</>;

      case "Patient Name": {
        const { age, gender, icon, color } = getGenderMeta(data);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <i
              className={icon}
              title={gender || t("Gender")}
              style={{ color, fontSize: "14px", minWidth: "14px" }}
            />
            <span>{data?.PName}</span>
            {age ? (
              <span style={{ color: "#6c757d", fontSize: "11px" }}>({age})</span>
            ) : null}
          </div>
        );
      }

      case "Visit No.":
        return (
          <div onClick={() => openVisit(data, index)} style={{ cursor: "pointer" }}>
            <span className="text-primary">{data?.LedgerTransactionNo}</span>
          </div>
        );

      case "SIN No.":
        return <>{data?.BarcodeNo}</>;

      case "Tests": {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data?.Tests?.map((test, testIndex) => {
              // Printed only ever happens after the report is Approved, so once a
              // sample has actually been printed that's the more current/specific
              // state — it should win over the plain "Approved" (Status-5, green)
              // colouring instead of being stuck showing an earlier stage forever.
              const statusClass =
                test?.SampleStatus === "Printed"
                  ? "Status-6"
                  : RADIOLOGY_STATUS_CLASS[test?.RadiologyResultStatus] || `Status-${test?.Status}`;
              return (
                <div key={testIndex} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <p
                    className={`round ${statusClass}`}
                    onClick={() => openVisit(test, index)}
                    style={{ cursor: "pointer", margin: 0, flex: 1 }}
                    title={t(test?.SampleStatus === "Printed" ? "Printed" : test?.RadiologyResultStatus || "")}
                  >
                    {test?.Test}
                  </p>
                </div>
              );
            })}
          </div>
        );
      }

      case "Print": {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data?.Tests?.map((test, testIndex) => {
              const canPrint =
                test?.RadiologyResultStatus === "Save" || test?.RadiologyResultStatus === "Approved";
              const isRowPrinting = !!printingHash && printingHash.startsWith(`${test?.TestIdHash}_`);
              const isPrintingWithHead = printingHash === `${test?.TestIdHash}_1`;
              const isPrintingNoHead = printingHash === `${test?.TestIdHash}_0`;
              return (
                <div key={testIndex} style={{ minHeight: "18px" }}>
                  {canPrint && (
                    <>
                      <i
                        className={`fa ${isPrintingWithHead ? "fa-spinner fa-spin" : "fa-print"} text-primary mr-2`}
                        title={t("Print Report")}
                        style={{ cursor: isRowPrinting ? "default" : "pointer", fontSize: "14px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isRowPrinting) handlePrintReport(test?.TestIdHash, 1);
                        }}
                      />
                      <i
                        className={`fa ${isPrintingNoHead ? "fa-spinner fa-spin" : "fa-print"} text-danger`}
                        title={t("Print Report")}
                        style={{ cursor: isRowPrinting ? "default" : "pointer", fontSize: "14px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isRowPrinting) handlePrintReport(test?.TestIdHash, 0);
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case "StradusDocument":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data?.Tests?.map((test, testIndex) => (
              <div key={testIndex} style={{ minHeight: "18px" }}>
                {test?.StradusReportKey && (
                  <i
                    className="fa fa-eye text-primary"
                    title={t("Preview Report")}
                    style={{ cursor: "pointer", fontSize: "14px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPreview(test?.StradusReportKey);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        );
      case "StradusImage":
        return (
          data?.StradusImageURL && (
            <i
              className="fa fa-images text-primary"
              title={t("Preview Image")}
              style={{ cursor: "pointer", fontSize: "14px" }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(data?.StradusImageURL, "_blank");
              }}
            />
          )
        );

      case "Doctor":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data?.Tests?.map((test, testIndex) => (
              <div key={testIndex} style={{ minHeight: "18px" }}>
                {test?.Doctor}
              </div>
            ))}
          </div>
        );

      // Approver's name only shows once a test is actually Approved - a
      // pending/Save/Hold test has no ApprovedByName yet (backend only
      // resolves it in patient_labinvestigation_opd.ApprovedName at the
      // point of approval), so an empty cell here means "not approved" and
      // is expected, not a missing-data bug.
      case "Approved By":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data?.Tests?.map((test, testIndex) => (
              <div key={testIndex} style={{ minHeight: "18px" }}>
                {test?.RadiologyResultStatus === "Approved" ? test?.ApprovedByName : ""}
              </div>
            ))}
          </div>
        );

      case "Doc.":
        return (
          data?.IsPatientDocAvail > 0 && (
            <i className="fa bi-file-earmark-pdf text-primary" title={t("Attachment")} />
          )
        );

      case "PCC/Client Name":
        return <>{data?.Centre}</>;

      default:
        return null;
    }
  };

  const renderHeader = (col, idx) => (
    <th key={idx} style={{ whiteSpace: col.header !== "S.No" ? "nowrap" : "normal" }}>
      {t(col.header)}
    </th>
  );

  return (
    <>
      <Modal show={showColumnModal} onHide={() => setShowColumnModal(false)} centered>
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

      {groupedRedata?.length > 0 ? (
        <div className="px-1">
          <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
            <div>
              <thead style={{ position: "sticky", top: 0 }}>
                <tr>{columnsToRender.map((col, idx) => renderHeader(col, idx))}</tr>
              </thead>
              <tbody>
                {groupedRedata.map((data, index) => (
                  <tr key={index}>
                    {columnsToRender.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        data-title={t(col.header)}
                        className={col.header === "Tests" ? "result-entry-test" : ""}
                        style={{
                          ...(col.header !== "S.No" &&
                            col.header !== "Tests" && { whiteSpace: "nowrap" }),
                          ...(col.header === "Tests" && {
                            minWidth: "250px",
                            maxWidth: "400px",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }),
                        }}
                      >
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

      {auditModal && (
        <CustomModal
          show={auditModal}
          visitID={visitID}
          onHide={() => setAuditModal(false)}
        />
      )}

      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />

      {reportPreview.show && (
        <Dialog
          header={t("Report Preview")}
          visible={reportPreview.show}
          style={{ height: "100vh", width: isMobileDevice() ? "95vw" : "60vw" }}
          contentStyle={{ padding: 0, overflow: "hidden" }}
          onHide={() => {
            if (reportPreview.url) window.URL.revokeObjectURL(reportPreview.url);
            setReportPreview({ show: false, url: "" });
          }}
          className={theme}
        >
          <div style={{ width: "100%", height: "85vh" }}>
            {isMobileDevice() ? (
              <PdfViewer pdfUrl={reportPreview.url} />
            ) : (
              <iframe
                src={`${reportPreview.url}#toolbar=0`}
                title="Report Preview"
                style={{ width: "100%", height: "100%", border: "none" }}
              ></iframe>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}

export default RERadiologyTable;
