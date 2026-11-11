import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";

import Tables from "../../components/UI/customTable";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import parse from "html-react-parser";
import { CheckDevice, dateConfig, downloadPdf, parseRemarks } from "../../utils/helpers";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import CustomModal from "../utils/CustomModal";
import AddRemark from "../utils/AddRemark";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import { FaPlus, FaEye } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Tooltip from "../../components/formComponent/Tooltip";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import DispatchPatientDetailModal from "../utils/DispatchPatientDetailModal";

const PAGE_ID = "626"; // ← apna sahi PAGE_ID yahan set karo

// ─── Column meta: header name → extra props ──────────────────────────────────
const COLUMN_META = {
  "S.No":        {},
  "Reg Date":    {},
  "Visit No":    {},
  "Barcode No":  {},
  "UHID":        {},
  "Name":        {},
  "Age/Gender":  {},
  "Mobile":      {},
  "Test":        {},
  "Select":      {},
  "Print":       {},
  "Remarks":     {},
  "Doctor":      {},
  "Centre":      {},
  "RateTypeName":{},
  "View":        {},
  "Audit Trail": {},
  "PrintBarcode":{},
  "DueAmount":   {},
  "U.D":         { icon: "fa-file",     tooltip: "Uploaded Document" },
  "M.H":         { icon: "fa-h-square", tooltip: "Medical History"   },
};

function DynamicLabSearchTable({ dispatchData, show, show2, TableData, labNo }) {
  const { t } = useTranslation();

  const [modal, setModal]     = useState(false);
  const [visitID, setVisitID] = useState();
  const [TestId, setTestId]   = useState();

  const [printLoading, setPrintLoading] = useState({
    With: false,
    Without: false,
    index: -1,
  });

  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedLedgerTransactionNo, setSelectedLedgerTransactionNo] = useState(null);
  const [selectedTestID, setSelectedTestID] = useState(null);

  // ─── Dynamic controller state ─────────────────────────────────────────────
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterData,   setFilterData]   = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);

  // ─── Fetch controller on mount ────────────────────────────────────────────
  useEffect(() => {
    controllerDynamic();
  }, []);

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

  // ─── isHideController: true = show, false = hide ─────────────────────────
  const isHideController = (cntrId = "") => {
    if (!controllerDynamicList?.length) return true; // show by default
    const found = controllerDynamicList.find(
      (x) => x?.ControlDisplayID === cntrId
    );
    if (found?.ControlDisplayID) {
      return !!found?.IsShow;
    }
    return true; // not in list → show
  };

  // ─── Dynamic column config (TypeId === 2) ─────────────────────────────────
  // DynamicLabSearchTable — fix columnConfig to match RateList sorting
const columnConfig = useMemo(() => {
  if (!controllerDynamicList?.length) {
    return Object.keys(COLUMN_META).map((header) => ({
      header,
      ...COLUMN_META[header],
    }));
  }
  return controllerDynamicList
    .filter((item) => item?.TypeId === 2 && item?.IsShow === 1)
    .sort((a, b) => {
      // ✅ same logic as RateList — use DisplayOrder, fallback to ID+1000
      const orderA =
        a.DisplayOrder !== "" && a.DisplayOrder !== null && a.DisplayOrder !== undefined
          ? Number(a.DisplayOrder)
          : Number(a.ID) + 1000;
      const orderB =
        b.DisplayOrder !== "" && b.DisplayOrder !== null && b.DisplayOrder !== undefined
          ? Number(b.DisplayOrder)
          : Number(b.ID) + 1000;
      return orderA - orderB;
    })
    .map((item) => ({
      header: item.ControlDisplayName,
      ...(COLUMN_META[item.ControlDisplayName] ?? {}),
    }));
}, [controllerDynamicList]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const checkCulture = (data) => {
    const culture = data?.IsCulture?.split("#");
    if (culture.includes("1")) return false;
    return true;
  };

  const APiReport = (TestIDHash, loader, index, PHead) => {
    if (printLoading.index === -1) {
      setPrintLoading({ [loader]: true, index });
      const requestOptions = {
        ...(CheckDevice() == 1 && { responseType: "blob" }),
      };
      axiosReport
        .post(
          `commonReports/GetLabReport`,
          {
            TestIDHash: [...new Set(TestIDHash)],
            PHead,
            PrintColour: "1",
            IsDownload: CheckDevice(),
          },
          ...(CheckDevice() == 1 ? [{ responseType: "arraybuffer" }] : [])
        )
        .then((res) => {
          if (CheckDevice() == 1) {
            downloadPdf(res.data);
          } else {
            if (res?.data?.success) {
              window.open(res.data.url, "_blank");
            } else {
              toast.error(res?.data?.message);
            }
          }
          setPrintLoading({ [loader]: false, index: -1 });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : err?.data?.message
          );
          setPrintLoading({ [loader]: false, index: -1 });
        });
    } else {
      toast.warn("Please wait Generating Report");
    }
  };

  const getBarcodeData = (testId, VisitNo, SINNo) => {
    axiosInstance
      .post("SC/getBarcode", {
        LedgerTransactionNo: VisitNo,
        BarcodeNo: SINNo,
        TestID: [testId],
        barcodeNoDepartmentID: 0,
      })
      .then((res) => {
        if (res?.data?.message != "") window.location.href = res.data.message;
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      });
  };

  const getAllDepartmentBarcodeData = (LedgerTransactionID, DepartmentID, barcodeNo) => {
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

  const handleAllAprovedChecked = (e, data) => {
    const { checked } = e.target;
    let documentlength = document.getElementsByClassName(data?.LedgerTransactionID);
    for (let i = 0; i < documentlength.length; i++) {
      if (documentlength[i].id == data?.LedgerTransactionID) {
        documentlength[i].checked = checked;
      }
    }
  };

  const extractValuesFromHtml = (htmlString) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    const inputElements = tempDiv.querySelectorAll('input[type="checkbox"]');
    return Array.from(inputElements).map((input) => input.value);
  };

  const handleReport = (data, loader, index, PHead) => {
    let TestIDHash = [];
    let documentlength = document.getElementsByClassName(data?.LedgerTransactionID);
    const extractedValues = extractValuesFromHtml(data?.Test);

    for (let i = 0; i < documentlength.length; i++) {
      if (
        documentlength[i].checked &&
        documentlength[i].id == data?.LedgerTransactionID
      ) {
        TestIDHash.push(
          document.getElementsByClassName(data?.LedgerTransactionID)[i].value
        );
      }
    }
    if (TestIDHash.length === 0) {
      TestIDHash.push(...extractedValues);
    }
    APiReport(TestIDHash, loader, index, PHead);
  };

  const handleCheck = (data) => {
    const datas = parse(data?.Test);
    if (datas.length > 0) {
      const val = datas.map((ele) => ele?.props?.className);
      return val.includes("round Status-5") || val.includes("round Status-6");
    }
    return (
      datas?.props?.className?.includes("round Status-5") ||
      datas?.props?.className?.includes("round Status-6")
    );
  };

  // ─── Render each cell by column header ───────────────────────────────────
  const renderCell = (col, data, index) => {
    switch (col.header) {

      case "S.No":
        return <>{index + 1}</>;

      case "Reg Date":
        return <div>{dateConfig(data?.RegistrationDate)}&nbsp;</div>;

      case "Visit No":
        return <>{data?.VisitNo}&nbsp;</>;

      case "Barcode No":
        return data?.PliDataList?.length > 0 ? (
          data.PliDataList.map((item, idx) => (
            <Tooltip key={idx} label={item.SampleName} className="d-flex justify-content-start">
              <p
                className="fw-bold mb-0"
                id={`barcode-${idx}`}
                style={{ padding: "3px 5px" }}
              >
                {item.BarcodeNo}
              </p>
            </Tooltip>
          ))
        ) : (
          <p className="mb-0">{"-"}</p>
        );

      case "UHID":
        return <>{data?.PatientCode === "" ? "" : data?.PatientCode}&nbsp;</>;

      case "Name":
        return <>{data?.PatientName}&nbsp;</>;

      case "Age/Gender":
        return <div>{data?.Age}/{data?.Gender}&nbsp;</div>;

      case "Test":
        return (
          <div className="printTest">
            {parse(data?.FinalTest)}
          </div>
        );

      case "Select":
        return handleCheck(data) ? (
          <input
            type="checkbox"
            onChange={(e) => handleAllAprovedChecked(e, data)}
            style={{ cursor: "pointer", width: "13px", height: "13px" }}
          />
        ) : (
          <>&nbsp;</>
        );

      case "Print":
        return handleCheck(data) ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              marginTop: "2px",
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
        ) : (
          <>&nbsp;</>
        );

      case "Remarks":
        return (
          <>
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
            {Array.isArray(data?.RemarksList) && data?.RemarksList?.length > 0 && (
              <ReactTooltip
                id={`remark-tooltip-${index}`}
                place="top"
                style={{ zIndex: 9999 }}
                clickable
                content={<RemarkTooltip remarks={data?.RemarksList} />}
              />
            )}
          </>
        );

      case "Doctor":
        return <>{data?.DoctorName}&nbsp;</>;

      case "Centre":
        return <>{data?.Centre}&nbsp;</>;

      case "Mobile":
        return <>{data?.Mobile}&nbsp;</>;

      case "RateTypeName":
        return <>{data?.RateTypeName}&nbsp;</>;

      case "View":
        return (
          <div
            onClick={() => {
              setModal(true);
              setVisitID(data?.VisitNo);
              setTestId(data?.TestId);
            }}
          >
            <i className="fa fa-search" />
          </div>
        );

      case "Audit Trail":
        return (
          <FaEye
            style={{ fontSize: "18px", cursor: "pointer", color: "#007bff" }}
            onClick={() => {
              setShowPatientModal(true);
              setSelectedLedgerTransactionNo(data?.VisitNo);
              setSelectedTestID(data?.TestId);
            }}
          />
        );

      case "PrintBarcode":
        return (
          <div className="d-flex align-items-center justify-content-center" style={{ gap: "8px" }}>
            <div
              onClick={() => {
                getBarcodeData(data?.TestId, data?.VisitNo, [data?.SinNo]);
              }}
            >
              <i className="fa fa-print" style={{ cursor: "pointer" }} title="TestWise"></i>
            </div>
            <div
              onClick={() => {
                getAllDepartmentBarcodeData(data?.VisitNo, data?.DepartmentID, data?.SinNo);
              }}
            >
              <i
                className="fa fa-print"
                style={{ cursor: "pointer", color: "red", marginLeft: "10px" }}
                title="DepartmentWise"
              ></i>
            </div>
          </div>
        );

      case "DueAmount":
        return <div style={{ cursor: "pointer" }}>{data?.DueAmount}&nbsp;</div>;

      case "U.D":
        return (
          <div
            className="text-info"
            style={{ cursor: "pointer" }}
            onClick={() => show2({ modal: true, data: data?.PatientGuid, index })}
          >
            <img src={file} className="sizeicon" alt="Upload" />
            &nbsp; ({data?.UploadDocumentCount})&nbsp;
          </div>
        );

      case "M.H":
        return (
          <div
            className="text-info"
            style={{ cursor: "pointer" }}
            onClick={() => show({ modal: true, data: data?.PatientGuid, index })}
          >
            <img src={Medical} className="sizeicon" alt="Medical History" />
            &nbsp; ({data?.MedicalHistoryCount})&nbsp;
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Render TH for each column ────────────────────────────────────────────
  const renderHeader = (col) => {
    if (col.icon) {
      return <i className={`fa ${col.icon}`} title={col.tooltip || col.header} />;
    }
    return t(col.header);
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────
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

      <div>
        {dispatchData?.length > 0 ? (
          <div className="row">
            <div className="col-12">
              <Tables>
                {/* ── Dynamic THead ── */}
                <thead className="cf">
                  <tr>
                    {columnConfig.map((col, idx) => (
                      <th key={idx}>{renderHeader(col)}</th>
                    ))}
                  </tr>
                </thead>

                {/* ── Dynamic TBody ── */}
                <tbody>
                  {dispatchData.map((data, rowIndex) => (
                    <tr key={rowIndex}>
                      {columnConfig.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          data-title={t(col.header)}
                          className={col.header === "Test" ? "result-entry-test" : ""}
                        >
                          {renderCell(col, data, rowIndex)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        ) : (
          <NoRecordFound />
        )}

        {modal && (
          <CustomModal
            show={modal}
            visitID={visitID}
            TestId={TestId}
            onHide={() => setModal(false)}
          />
        )}

        <DispatchPatientDetailModal
          showPH={showPatientModal}
          setShowPH={setShowPatientModal}
          ResultData={[{ LedgerTransactionNo: selectedLedgerTransactionNo, TestID: selectedTestID }]}
          Index={0}
        />
      </div>
    </>
  );
}

export default DynamicLabSearchTable;