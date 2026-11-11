import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import CustomModal from "../utils/CustomModal";
import Loading from "../../components/loader/Loading";
import PatientDetailModal from "../utils/PatientDetailModal";
import CustomDateModal from "../utils/CustomDateModal";

import Medical from ".././Images/Medical.png";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import {
  CheckDevice,
  dateConfig,
  downloadPdf,
  IndexHandle,
  parseAwsKeys,
  parseRemarks,
} from "../../utils/helpers";
import { FaEye, FaPlus } from "react-icons/fa";
import AddRemark from "../utils/AddRemark";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import { Tooltip as ReactTooltip } from "react-tooltip";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import moment from "moment";
import { Modal, Form } from "react-bootstrap";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

// ✅ DEFAULT_COLUMNS acts as columnConfig fallback (same as RETable's columnConfig)
//Added comment
const DEFAULT_COLUMNS = [
  { header: "S.No", visible: 1 },
  { header: "Reg. Date", visible: 1 },
  { header: "Incubation Date", visible: 1 },
  { header: "D.Recieve Date", visible: 1 },
  { header: "Collection Date Time", visible: 1 },
  { header: "Visit No.", visible: 1 },
  { header: "Barcode No", visible: 1 },
  { header: "UHID", visible: 1 },
  { header: "Patient Name", visible: 1 },
  { header: "Age/Gender", visible: 1 },
  { header: "RateTypeCode", visible: 1 },
  { header: "HLMPatientType", visible: 1 },
  { header: "RateTypeName", visible: 1 },
  { header: "Test", visible: 1 },
  { header: "Status", visible: 1 },
  { header: "Print", visible: 1 },
  { header: "Doctor", visible: 1 },
  { header: "Centre", visible: 1 },
  { header: "Remarks", visible: 1 },
  { header: "LastRemark", visible: 1 },
  { header: "M.H", visible: 1 },
  { header: "Detail", visible: 1 },
  { header: "View Doc.", visible: 1 },
  { header: "Customize Date", visible: 1 },
  { header: "TAT Status", visible: 1 },
];

function RECultureTable({
  redata,
  GetResultEntryCulture,
  setShowMH,
  setShowUD,
  TableData,
  SampleStatus,
  currentPage,
  pageSize,
  filterData = [], // ✅ Same as RETable: dynamic controller list from parent
  showColumnModal,
  setShowColumnModal,
  columnConfig,
  getFilterResultOption,
}) {
  const { EmployeeID } = useLocalStorage("userData", "get");
  const [modal, setModal] = useState({ show: false, visitId: "" });
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });
  const [loading, setLoading] = useState(false);
  const [Index, setIndex] = useState(-1);
  const [datemodal, showDatemodal] = useState(false);
  const [showPH, setShowPH] = useState(false);
  const [TestID, setTestID] = useState("");
  const [printLoading, setPrintLoading] = useState({
    With: false,
    Without: false,
    index: -1,
  });
  const [medicalHistoryTooltipData, setMedicalHistoryTooltipData] = useState({
    data: [],
    loadingIndex: -1,
  });
  const [previewConfig, setPreviewConfig] = useState({
        visible: false,
        url: null,
      });
  const { t } = useTranslation();

  // ✅ EXACT SAME LOGIC AS RETable:
  // Step 1: From filterData, pick TypeId==2 & IsShow==1 items (these are table column controllers)
  const gearVisibleColumns = DEFAULT_COLUMNS.filter((col) => col.visible == 1);
  const hasDynamicFilter = filterData.some((item) => item.TypeId == 2);

  // Step 2: columnsToRender - if dynamic filter exists, map those; else fallback to all DEFAULT_COLUMNS
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
    : DEFAULT_COLUMNS.filter((col) => col.visible == 1);

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
        PageName: "ResultCulture",
        pageName: "ResultCulture",
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

  // ─── helpers ──────────────────────────────────────────────────────────────

  const getdata = (data, index) => {
    GetResultEntryCulture(
      {
        LedgerTransactionID: data?.LedgertransactionId,
        TestID: Number(data?.TestID),
        DepartmentID: Number(data?.DepartmentId),
        VisitNo: data?.LedgerTransactionNo,
        BarcodeNo: data?.BarcodeNo,
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
      },
      index,
      setLoading,
      data?.reportnumber || "Preliminary 1",
    );
    setIndex(index);
  };

  const handleReport = (data, loader, index, PHead) => {
    if (printLoading.index === -1) {
      setPrintLoading({ [loader]: true, index: index });
      axiosReport
        .post(
          `commonReports/GetLabReport`,
          {
            TestIDHash: [data?.TestIdHash],
            PHead: PHead,
            PrintColour: "1",
            IsDownload: CheckDevice(),
          },
          { responseType: "blob" },
        )
        .then((res) => {
          const contentType = res?.headers?.["content-type"] || "";

          if (contentType.includes("application/json")) {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const json = JSON.parse(reader.result);
                if (json?.success) window.open(json?.url, "_blank");
                else toast.error(json?.message);
              } catch {
                toast.error("Unexpected response from server.");
              }
              setPrintLoading({ [loader]: false, index: -1 });
            };
            reader.readAsText(res.data);
            return;
          }

          if (CheckDevice() == 1) {
            downloadPdf(res.data);
          } else {
            const blob = new Blob([res.data], { type: "application/pdf" });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, "_blank");
          }
          setPrintLoading({ [loader]: false, index: -1 });
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message ?? err?.data?.message);
          setPrintLoading({ [loader]: false, index: -1 });
        });
    } else {
      toast.warn("Please wait Generating Report");
    }
  };

  const getMedicalHistoryData = (medicalHistoryList) => {
    try {
      if (!medicalHistoryList) return [];
      const mh =
        typeof medicalHistoryList === "string"
          ? JSON.parse(medicalHistoryList)
          : medicalHistoryList;
      return Array.isArray(mh) ? mh : [];
    } catch {
      return [];
    }
  };

  React.useEffect(() => {
    setMedicalHistoryTooltipData({ data: [], loadingIndex: -1 });
  }, [redata]);

  const getResultFlag = (data) => {
    const rd =
      typeof data?.ResultDetailsList === "string"
        ? JSON.parse(data?.ResultDetailsList)
        : data?.ResultDetailsList;
    return Array.isArray(rd) ? rd[0]?.Result_flag : rd?.Result_flag;
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

  // ✅ renderCell - SAME PATTERN AS RETable's renderCell

  const renderCell = (col, data, index) => {
    switch (col.header) {
      case "S.No":
        return (
          <div style={{ display: "flex", gap: "4px" }}>
             <span>
            {index + 1 + IndexHandle(currentPage, pageSize)}&nbsp;
            <i
              className="fa fa-search"
              style={{ cursor: "pointer" }}
              onClick={() =>
                setModal({ show: true, visitId: data?.LedgerTransactionNo })
              }
            />
          </span>
           {data?.IsPatientDocAvail > 0 && (
              <div>
                <i
                  // className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                  className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                  style={{ fontSize: "16px"}}
                  onClick={() => handleOpenPreview(data?.awsKeys)}
                  title="View Attachments"
                />
              </div>
            )}
            {data?.isUrgent === "Y" && (
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
                  style={{ color: "#FFC107", display: "inline", width: "5%" }}
                  title="VIP Patient"
                />
              </div>

            )}
            {getResultFlag(data) === 0 && (
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "red",
                  marginTop: "5px",
                }}
              >
                P
              </div>
            )}

          </div>
         
        );

      case "TAT Status":
        
        let text = "";
        let textColor = "white";

        if (data?.TATDelay == 1) {
          
          text = "Outside TAT";
          textColor = "white";
        } else if (data?.TATIntimate == 1) {
          
          text = "Near TAT";
          textColor = "black";
        } else {
          
          text = "Within TAT";
          textColor = "white";
        }

        return (
          <span
            style={{
             
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

      case "Reg. Date":
        return <>{data?.DATE}&nbsp;</>;

      case "Incubation Date":
        return <>{data?.incubationdate}&nbsp;</>;

      case "D.Recieve Date":
        return (
          <>
            {data?.SampleReceiveDate}&nbsp;
            <span>{data?.SampleReceiveTime}</span>
          </>
        );

      case "Collection Date Time":
        return <>{data?.PreSampleCollectionDate}&nbsp;</>;

      case "Visit No.":
        return (
          <div
            onClick={() => getdata(data, index)}
            style={{ cursor: "pointer" }}
          >
            <div className="text-primary">
              {loading && index === Index ? (
                <Loading />
              ) : (
                data?.LedgerTransactionNo
              )}
              &nbsp;
            </div>
          </div>
        );

      case "Barcode No":
        return <>{data?.BarcodeNo}&nbsp;</>;

      case "UHID":
        return <>{data?.PatientCode}&nbsp;</>;

      case "Patient Name":
        return <>{data?.PName}&nbsp;</>;

      case "Age/Gender":
        return <>{data?.Age_Gender}&nbsp;</>;

      case "RateTypeCode":
        return <>{data?.RateTypeCode}&nbsp;</>;

      //Added comment

      case "HLMPatientType":
        return <>{data?.HLMPatientType}&nbsp;</>;

      case "RateTypeName":
        return (
          <div style={{ width: "250px", maxWidth: "250px", whiteSpace: "normal", wordBreak: "break-word" }}>
            {data?.RateTypeName}&nbsp;
          </div>
        );

      case "Test":
        return (
          <>
            <p
              className={`round Status-${data?.Status}`}
              onClick={() => getdata(data, index)}
              style={{ cursor: "pointer" }}
            >
              {data?.Test}
            </p>
            &nbsp;
          </>
        );

      case "Status":
        return <>{data?.SampleStatus}&nbsp;</>;

      case "Print":
        return (data?.Approved == 1) ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              padding: "5px",
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
            <br />
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
        return <>{data?.Doctor}&nbsp;</>;

      case "Centre":
        return <>{data?.Centre}&nbsp;</>;

      case "Remarks":
        return (
          <div
            style={{
              gap: "4px",
              display: "flex",
              alignItems: "center",
            }}
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
                  ({data.LabRemarkCount})
                </span>
              )}
            </div>
            {Array.isArray(parseRemarks(data?.RemarksList)) &&
              parseRemarks(data?.RemarksList)?.length > 0 && (
                <ReactTooltip
                  id={`remark-tooltip-${index}`}
                  place="top"
                  style={{ zIndex: 9999 }}
                  clickable
                  content={
                    <RemarkTooltip remarks={parseRemarks(data?.RemarksList)} />
                  }
                />
              )}
          </div>
        );

      case "M.H":
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
                setShowMH({
                  modal: true,
                  data: data?.PatientGuid,
                  index: index,
                  ID: data?.LedgertransactionId,
                })
              }
              onMouseEnter={() => {
                if (data?.MedicalHistoryCount > 0)
                  setMedicalHistoryTooltipData({
                    data: getMedicalHistoryData(data?.MedicalHistoryList),
                    loadingIndex: -1,
                  });
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

      case "Detail":
        return (
          <FaEye
            style={{
              marginLeft: "10px",
              fontSize: "18px",
              cursor: "pointer",
              color: "#007bff",
            }}
            onClick={() => {
              setShowPH(true);
              setIndex(index);
            }}
          />
        );

      case "View Doc.":
        return (
          <div
            className="text-info d-flex align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() =>
              setShowUD({
                modal: true,
                data: data?.PatientGuid,
                index: index,
                LedgertransactionIDHash: data?.LedgertransactionIDHash,
              })
            }
          >
            <i
              className="fa fa-file iconStyle"
              style={{
                color: data?.UploadDocumentCount > 0 ? "#4ea30c" : "",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: data?.UploadDocumentCount > 0 ? "#4ea30c" : "",
              }}
            >
              ({data?.UploadDocumentCount})
            </span>
          </div>
        );

      case "Customize Date":
        return (
          <div
            className="text-info text-centre"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setTestID(data.TestID.toString());
              showDatemodal(true);
            }}
          >
            <i className="fa fa-edit" />
          </div>
        );

      case "LastRemark" :    
              if (!parseRemarks(data?.RemarksList) || parseRemarks(data?.RemarksList?.length) === 0) {
                return "";
              }
        
              const RemarksList = parseRemarks(data?.RemarksList);
              // console.log("remarkList",RemarksList);
        
              const sortedRemarks = [...RemarksList].sort((a, b) => {
                const dateDiff =
                  moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") -
                  moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A");

                if (dateDiff !== 0) return dateDiff;

                // fallback for same timestamp
                return RemarksList.indexOf(b) - RemarksList.indexOf(a);
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
                      maxWidth: "250px",   // ✅ FIXED WIDTH     
                      whiteSpace: "normal", // ✅ allow wrapping
                      wordBreak: "break-word",// ✅ break long words
                      zIndex: 9999
                    }}
                  />
                </div>
              );
           

      default:
        return null;
    }
  };

  // ✅ renderHeader - same icon/tooltip pattern as RETable
  const renderHeader = (col, idx) => {
    if (col.header === "View Doc.")
      return (
        <th key={idx} className="text-center" style={{ whiteSpace: "nowrap" }}>
          <i className="fa fa-file" />
        </th>
      );
    if (col.header === "Customize Date")
      return (
        <th
          key={idx}
          data-toggle="tooltip"
          data-placement="top"
          title="Customize Date"
          style={{ whiteSpace: "nowrap" }}
        >
          <i
            className="fa fa-calendar text-centre"
            style={{ margin: "2px 8px" }}
          />
        </th>
      );
    return (
      <th
        key={idx}
        style={{ whiteSpace: col.header !== "S.No" ? "nowrap" : "normal" }}
      >
        {t(col.header)}
      </th>
    );
  };

  console.log("columnsTorender",columnsToRender);

  return (
    <>
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData(SampleStatus);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          defaultTestFromRow={true}
          filterTestID={showAddRemark.rowData?.TestID}
          visitKey="LedgerTransactionNo"
          testIDsKey="TestID"
          testNamesKey="Test"
          ledgerTransactionIDKey="LedgertransactionId"
          patientNameKey="PName"
          ageGenderKey="Age_Gender"
        />
      )}
      {showPH && (
        <PatientDetailModal
          showPH={showPH}
          setShowPH={setShowPH}
          ResultData={redata}
          Index={Index}
        />
      )}
      {modal?.show && (
        <CustomModal
          show={modal?.show}
          visitID={modal?.visitId}
          onHide={() => setModal({ show: false, visitId: "" })}
        />
      )}
      {datemodal && (
        <CustomDateModal
          show={datemodal}
          data={TestID}
          onHide={() => showDatemodal(false)}
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

      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />

      <div className="p-2">
        {redata.length > 0 ? (
          <Tables>
            <>
              {/* ✅ thead uses columnsToRender - same as RETable */}
              <thead className="cf" style={{ position: "sticky", top: 0 }}>
                <tr>
                  {columnsToRender.map((col, idx) => renderHeader(col, idx))}
                </tr>
              </thead>

              {/* ✅ tbody uses columnsToRender - same as RETable */}
              <tbody>
                {redata.map((data, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor:
                        getResultFlag(data) === 0 ? "#fd5151" : "inherit",
                    }}
                  >
                    {columnsToRender.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        data-title={t(col.header)}
                        className={
                          col.header === "Test" ? "result-entry-test" : ""
                        }
                        style={{
                          backgroundColor:
                            col.header === "TAT Status"
                              ? (data?.TATDelay == 1
                                ? "red"
                                : data?.TATIntimate == 1
                                  ? "yellow"
                                  : "green")
                              : undefined,
                          ...(col.header !== "S.No" && col.header !== "Test" && {
                            whiteSpace: "nowrap",
                          }),
                          ...(col.header === "Test" && {
                            minWidth: "250px",
                            maxWidth: "400px",
                            whiteSpace: "normal",
                            wordBreak: "break-word"
                          })
                        }}
                      >
                        {renderCell(col, data, index)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </>
          </Tables>
        ) : (
          <NoRecordFound />
        )}
      </div>
    </>
  );
}

export default RECultureTable;