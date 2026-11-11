import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useSelector } from "react-redux";
import "./DispatchPatientDetailModal.css";
import TrackerColorLegend from "./TrackerColorLegend";
import { getTrackerStatusClass } from "../../utils/Constants";

const DispatchPatientDetailModal = ({ showPH, setShowPH, ResultData, Index }) => {
  const { t } = useTranslation();
  const [patientData, setPatientData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const { HideMacStatusFromDispatch, HideResultDoneStatusFromDispatch } =
    useLocalStorage("userData", "get") || {};

  const getPatientDetailData = () => {
    setLoad(true);
    const currentData =
      Index !== undefined && Index !== -1 ? ResultData[Index] : ResultData[0];

    if (!currentData?.LedgerTransactionNo) {
      toast.error("No valid data found");
      setLoad(false);
      return;
    }

    let testIds = [0];
    if (currentData?.TestID) {
      if (Array.isArray(currentData.TestID)) {
        testIds = currentData.TestID.map((item) => Number(item));
      } else if (typeof currentData.TestID === "string") {
        testIds = currentData.TestID.split(",").map((item) => Number(item.trim()));
      } else {
        testIds = [Number(currentData.TestID)];
      }
    }

    axiosInstance
      .post("RECulture/GetPatientDetail", {
        LedgerTransactionNo: currentData.LedgerTransactionNo,
        TestId: testIds,
      })
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          setPatientData(res?.data?.message);
          // After getting patient details, fetch audit trail
          getAuditTrail(currentData.LedgerTransactionNo, testIds[0]);
        } else {
          toast.error("No Data Found");
          setShowPH(false);
          setLoad(false);
        }
      })
      .catch((err) => {
        setLoad(false);
        setShowPH(false);
        toast.error("Something Went Wrong");
      });
  };

  const getAuditTrail = (visitNo, testId) => {
    axiosInstance
      .post("TestData/GetAuditTrailData", {
        visitNo: visitNo,
        itemId: testId,
        testID: testId,
      })
      .then((res) => {
        setLoad(false);
        if (res.data?.success && Array.isArray(res?.data?.message)) {
          setAuditData(res?.data?.message);
        }
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };

  useEffect(() => {
    if (showPH && ResultData && ResultData.length > 0) {
      getPatientDetailData();
    }
  }, [showPH]);

  const p = patientData[0] || {};

  return (
    <Dialog
      header={t("Sample Information")}
      visible={showPH}
      style={{ width: isMobile ? "95vw" : "90vw" }}
      className={`dispatch-patient-info-modal ${theme}`}
      onHide={() => setShowPH(false)}
      closable={true}
      dismissableMask={true}
    >
      {load ? (
        <Loading />
      ) : (
        <div className={`patient-info-container ${theme}`}>
          <div className="patient-details-grid p-2">
            <div className="info-row">
              <div className="info-item">
                <span className="info-label ">{t("VisitNo")} :</span>
                <span className="info-value">{p?.LedgerTransactionNo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("Patient Name ")} :</span>
                <span className="info-value">{p?.PName} </span>
              </div>
            </div>
            <div className="info-row">  
              <div className="info-item">
                <span className="info-label">{t("Refer Lab Name ")} :</span>
                <span className="info-value">{p?.ReferLabName} </span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("Patient Code ")} :</span>
                <span className="info-value">{p?.PatientCode} </span>
              </div>
              </div>

            <div className="info-row">
              <div className="info-item">
                <span className="info-label">{t("Age / Sex")} :</span>
                <span className="info-value">{p?.Age} / {p?.Gender}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("Refer Doctor")} :</span>
                <span className="info-value">{p?.ReferDoctor}</span>
              </div>

            </div>

            <div className="info-row">
              <div className="info-item">
                <span className="info-label">{t("Phone/Mobile")} :</span>
                <span className="info-value">{p?.Mobile}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("Rate Type")} :</span>
                <span className="info-value">
                  {p?.RateType}
                  <i
                    className="pi pi-eye"
                    style={{
                      cursor: "pointer",
                      marginLeft: "8px",
                      color: "#007bff",
                      fontSize: "1.1rem"
                    }}
                    onClick={() => setShowRateModal(true)}
                    title={t("View Rate Type Details")}
                  ></i>
                </span>
              </div>
            </div>

          </div>

          <div className="custom-border-box mt-4 grid-layout">
            {/* Headers Row */}
            <div className="header-cell">
              <div className="header-node">
                <span className="header-label">{t("Department")} :</span>
                <div className="header-value-box">{p?.DepartmentName || "-"}</div>
              </div>
            </div>
            <div className="header-cell">
              <div className="header-node">
                <span className="header-label">{t("Test Name")} :</span>
                <div 
                  className="header-value-box" 
                  title={p?.InvestigationName || p?.TestName || "-"}
                >
                  {p?.InvestigationName || p?.TestName || "-"}
                </div>
              </div>
            </div>
            <div className="header-cell">
              <div className="header-node">
                <span className="header-label">{t("Sample Type")} :</span>
                <div className="header-value-box">{p?.SampleTypeName || p?.SampleName || "-"}</div>
              </div>
            </div>
            <div className="header-cell">
              <div className="header-node">
                <span className="header-label">{t("Barcode No")} :</span>
                <div className="header-value-box">{p?.BarcodeNo || "-"}</div>
              </div>
            </div>

            {/* Flow Details spanning 2 columns each */}
            <div className="data-cell span-2">
              <div className="flow-details">
                <div className="info-item border-top border-left border-right">
                  <span className="info-label">{t("Reg Info")} :</span>
                  <span className="info-value">
                    {p?.RegDate || p?.RegTime || p?.RegisteredBy ?
                      `${p?.RegDate || ""} ${p?.RegTime || ""} ${p?.RegisteredBy ? `- ${p?.RegisteredBy}` : ""}` : "-"}
                  </span>
                </div>
                <div className="info-item border-top border-left border-right">
                  <span className="info-label">{t("Rec Info")} :</span>
                  <span className="info-value">
                    {p?.SampleReceiveDate || p?.SampleReceiveTime || p?.SampleReceivedBy ?
                      `${p?.SampleReceiveDate || ""} ${p?.SampleReceiveTime || ""} ${p?.SampleReceivedBy ? `- ${p?.SampleReceivedBy}` : ""}` : "-"}
                  </span>
                </div>
                <div className="info-item border">
                  <span className="info-label">{t("Tested Info")} :</span>
                  <span className="info-value">
                    {p?.ResultEnteredDate || p?.ResultEnteredTime || p?.ResultEnteredName ?
                      `${p?.ResultEnteredDate || ""} ${p?.ResultEnteredTime || ""} ${p?.ResultEnteredName ? `- ${p?.ResultEnteredName}` : ""}` : "-"}
                  </span>
                </div>
                <div className="info-item border">
                  <span className="info-label">{t("Report Printed info")} :</span>
                  <span className="info-value">
                    {p?.ReportPrintedDate || p?.ReportPrintedTime || p?.ReportPrintedByName ?
                      `${p?.ReportPrintedDate || ""} ${p?.ReportPrintedTime || ""} ${p?.ReportPrintedByName ? `- ${p?.ReportPrintedByName}` : ""}` : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="data-cell span-2">
              <div className="flow-details">
                <div className="info-item border-top border-left border-right">
                  <span className="info-label">{t("Collected Info")} :</span>
                  <span className="info-value">
                    {p?.SampleCollectionDate || p?.SampleCollectionTime || p?.SampleCollectionByName ?
                      `${p?.SampleCollectionDate || ""} ${p?.SampleCollectionTime || ""} ${p?.SampleCollectionByName ? `- ${p?.SampleCollectionByName}` : ""}` : "-"}
                  </span>
                </div>
                <div className="info-item border-top border-left border-right">
                  <span className="info-label">{t("Rejected Info")} :</span>
                  <span className="info-value">
                    {p?.RejectDate || p?.RejectTime || p?.RejectUser || p?.RejectionReason ?
                      `${p?.RejectDate || ""} ${p?.RejectTime || ""} ${p?.RejectUser ? `- ${p?.RejectUser}` : ""} ${p?.RejectionReason ? `(${p?.RejectionReason})` : ""}` : "-"}
                  </span>
                </div>
                <div className="info-item border">
                  <span className="info-label">{t("Approval Info")} :</span>
                  <span className="info-value">
                    {p?.ApprovedDate || p?.ApprovedTime || p?.ApprovedName ?
                      `${p?.ApprovedDate || ""} ${p?.ApprovedTime || ""} ${p?.ApprovedName ? `- ${p?.ApprovedName}` : ""}` : "-"}
                  </span>
                </div>
                <div className="info-item border">
                  <span className="info-label">{t("Mac Date")} :</span>
                  <span className="info-value">
                    {p?.MacDate || ""}
                  </span>
                </div>
                {/* <div className="info-item border">
                  <span className="info-label">{t("Report Printed By")} :</span>
                  <span className="info-value">
                    {p?.ReportPrintedByName} 
                  </span>
                </div> */}
              </div>
            </div>
          </div>

          <div className="audit-trail-section mt-3">
            <div className="audit-header text-left p-1 active-tab-menu">
              <strong>{t("Audit Trail Log")}</strong>
            </div>
            <TrackerColorLegend />
            <div className="table-responsive">
              <table className="table table-bordered table-sm audit-table">
                <thead>
                  <tr>
                    <th>{t("Status")}</th>
                    <th>{t("Created By")}</th>
                    <th>{t("Created Date")}</th>
                    <th>{t("Centre")}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.length > 0 ? (
                    auditData.map((item, index) => {
                      const statusClass = getTrackerStatusClass(
                        item?.ColorStatus,
                        HideMacStatusFromDispatch,
                        HideResultDoneStatusFromDispatch,
                      );
                      return (
                      <tr key={index} className={statusClass}>
                        <td className={statusClass} style={{
                          width: "50%"
                        }}>{item?.ItemName}</td>
                        <td className={statusClass} style={{
                          width: "15%"
                        }}>{item?.CreatedByName}</td>
                        <td className={statusClass} style={{
                          width: "15%"
                        }}>{item?.dtEntry}</td>
                        <td className={statusClass} style={{
                          width: "15%"
                        }}>{item?.Centre || "-"}</td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">{t("No Data Found")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rate Type Details Modal */}
          <Dialog
            header={t("Rate Type Details")}
            visible={showRateModal}
            style={{ width: isMobile ? "95vw" : "700px" }}
            onHide={() => setShowRateModal(false)}
            draggable={false}
            resizable={false}
            className={theme}
          >
            <div className="rate-type-details-grid">
              <div className="rate-row">
                <div className="rate-col">
                  <strong>{t("Name")}:</strong> {p?.RateTypeName || "-"}
                </div>
                <div className="rate-col">
                  <strong>{t("Address")}:</strong> {p?.RateTypeAddress || "-"}
                </div>
              </div>
              <div className="rate-row">
                <div className="rate-col">
                  <strong>{t("Sales Manager")}:</strong> {p?.SalesManagerName || "-"}
                </div>
                <div className="rate-col">
                  <strong>{t("Field Boy")}:</strong> {p?.FeildBoyName || "-"}
                </div>
              </div>
              <div className="rate-row">
                <div className="rate-col">
                  <strong>{t("Mobile No.")}:</strong> {p?.RateTypeMobileNo || "-"}
                </div>
                <div className="rate-col">
                  <strong>{t("Email")}:</strong> {p?.RateTypeEmailID || "-"}
                </div>
              </div>
            </div>
          </Dialog>
        </div>
      )}
    </Dialog>
  );
};

export default DispatchPatientDetailModal;
