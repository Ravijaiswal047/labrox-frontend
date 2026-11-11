import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPencilAlt } from "react-icons/fa";
import Heading from "@app/components/UI/Heading";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import CustomTable from "@app/components/Table/CustomTable";
import { CustomButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import KpiCard from "./shared/KpiCard";
import Donut from "./shared/Donut";
import RecordCalibrationModal from "./RecordCalibrationModal";
import PdfPreviewModal from "../../utils/PdfPreviewModal";
import { parseAwsKeys } from "../../../utils/helpers";
import { axiosInstance } from "../../../utils/axiosInstance";
import {
  ALL_VALUE,
  formatApiDate,
  formatDisplayDate,
  isAllValue,
} from "../equipmentConstants";
import {
  CALIBRATION_STATUS_OPTIONS,
  COMPLIANCE_COLORS,
  UPCOMING_WINDOW_DAYS,
  calibrationStatus,
  calibrationStatusClass,
  daysUntilDue,
  dueLabel,
} from "../calibrationConstants";

const CalibrationTab = () => {
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);
  const [kpis, setKpis] = useState({
    total: 0,
    upToDate: 0,
    due: 0,
    overdue: 0,
  });
  const [upcoming, setUpcoming] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
  const [showModal, setShowModal] = useState(false);
  const [editCalibration, setEditCalibration] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });

  const loadEquipment = async () => {
    try {
      const response = await axiosInstance.post(
        "EquipmentManagement/GetEquipment",
        {}
      );
      if (response?.data?.success) {
        setEquipmentList(response.data.message || []);
      } else {
        setEquipmentList([]);
      }
    } catch (error) {
      setEquipmentList([]);
    }
  };

  const loadCalibrations = async (status = statusFilter) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "EquipmentManagement/GetCalibrations",
        {
          Status: isAllValue(status) ? undefined : status,
        }
      );
      if (response?.data?.success) {
        const data = response.data.message || {};
        const calibrations = data.calibrations || data.Calibrations || [];
        const kpi = data.kpi || data.KPI || {};
        const upcomingList = data.upcoming || data.Upcoming || [];

        setRows(calibrations);
        setKpis({
          total: Number(kpi.total ?? kpi.Total ?? 0),
          upToDate: Number(kpi.upToDate ?? kpi.UpToDate ?? 0),
          due: Number(kpi.due ?? kpi.Due ?? 0),
          overdue: Number(kpi.overdue ?? kpi.Overdue ?? 0),
        });
        setUpcoming(upcomingList);
      } else {
        setRows([]);
        notify(
          response?.data?.message || t("Unable to load calibrations"),
          "error"
        );
      }
    } catch (error) {
      setRows([]);
      notify(t("Unable to load calibrations"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
    loadCalibrations(ALL_VALUE);
  }, []);

  const equipmentOptions = useMemo(
    () =>
      equipmentList.map((eq) => ({
        value: eq.EquipmentID,
        label: `${eq.EquipmentCode} — ${eq.EquipmentName}`,
      })),
    [equipmentList]
  );

  const segments = [
    {
      label: t("Up to Date"),
      value: kpis.upToDate,
      color: COMPLIANCE_COLORS["Up to Date"],
    },
    {
      label: t("Due ≤30d"),
      value: kpis.due,
      color: COMPLIANCE_COLORS["Due ≤30d"],
    },
    {
      label: t("Overdue"),
      value: kpis.overdue,
      color: COMPLIANCE_COLORS.Overdue,
    },
  ];

  // ─── Document Preview ──────────────────────────────────────────────────────
  const handleOpenPreview = (keys) => {
    const parsedKeys = parseAwsKeys(keys);
    if (!parsedKeys) return;
    setPreviewConfig({ visible: true, url: parsedKeys });
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      const payload = {
        EquipmentID: Number(form.EquipmentID),
        CalibrationDate: formatApiDate(form.CalibrationDate),
        Frequency: form.Frequency,
        PerformedBy: form.PerformedBy,
        CertificateNo: form.CertificateNo?.trim() || "",
        CertificateFile: form.CertificateFile || "",
        Result: form.Result,
        Traceability: form.Traceability,
      };
      if (form.CalibrationID) {
        payload.CalibrationID = form.CalibrationID;
      }

      const response = await axiosInstance.post(
        "EquipmentManagement/SaveCalibration",
        payload
      );

      if (response?.data?.success) {
        setShowModal(false);
        setEditCalibration(null);
        notify(
          response?.data?.message ||
            (form.CalibrationID
              ? t("Calibration updated successfully")
              : t("Calibration recorded successfully")),
          "success"
        );
        loadCalibrations(statusFilter);
      } else {
        notify(
          response?.data?.message || t("Failed to save calibration"),
          "error"
        );
      }
    } catch (error) {
      notify(t("Something went wrong while saving calibration"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusFilterChange = (name, option) => {
    const val = option?.value ?? ALL_VALUE;
    setStatusFilter(val);
    loadCalibrations(val);
  };

  // ─── Schedule table ───────────────────────────────────────────────────────
  const columns = [
    { header: t("Equipment"), field: "equipment", minWidth: "200px" },
    { header: t("Centre"), field: "centre", minWidth: "160px" },
    { header: t("Last Calibration"), field: "last", minWidth: "125px" },
    { header: t("Frequency"), field: "frequency", minWidth: "105px" },
    { header: t("Next Due"), field: "nextDue", minWidth: "115px" },
    { header: t("Performed By"), field: "performedBy", minWidth: "125px" },
    { header: t("Certificate No."), field: "certificateNo", minWidth: "125px" },
    { header: t("Certificate"), field: "certificateDoc", minWidth: "100px" },
    { header: t("Traceability"), field: "traceability", minWidth: "210px" },
    { header: t("Result"), field: "result", minWidth: "80px" },
    { header: t("Status"), field: "status", minWidth: "95px" },
    { header: t("Action"), field: "actions", minWidth: "80px" },
  ];

  const tableRows = rows.map((r) => {
    const status = r.Status || r.status || calibrationStatus(r.NextDueDate || r.nextDueDate);
    const equipmentName = r.EquipmentName || r.equipmentName || "—";
    const equipmentCode = r.EquipmentCode || r.equipmentCode || "";
    const centreName = r.CentreName || r.centreName || r.Centre || r.centre || "—";
    const calDate = r.CalibrationDate || r.calibrationDate;
    const freq = r.Frequency || r.frequency;
    const nextDue = r.NextDueDate || r.nextDueDate;
    const performedBy = r.PerformedBy || r.performedBy;
    const certNo = r.CertificateNo || r.certificateNo;
    const certFiles = r.CertificateFiles || r.certificateFiles;
    const certCount = Number(r.CertificateFileCount ?? r.certificateFileCount ?? 0);
    const traceability = r.Traceability || r.traceability;
    const result = r.Result || r.result;

    return {
      rowColor:
        status === "Overdue"
          ? "#fef2f2"
          : status === "Due"
            ? "#fffbeb"
            : undefined,
      equipment: (
        <div>
          <div className="em-eq-name">{equipmentName}</div>
          {equipmentCode && <div className="em-eq-sub">{equipmentCode}</div>}
        </div>
      ),
      centre: centreName,
      last: formatDisplayDate(calDate),
      frequency: freq,
      nextDue: formatDisplayDate(nextDue),
      performedBy: performedBy,
      certificateNo: (
        <span className="em-detail-strong">{certNo || "—"}</span>
      ),
      certificateDoc:
        certCount > 0 ? (
          <i
            className="fa fa-file-text text-primary cursor-pointer fs-5"
            onClick={() => handleOpenPreview(certFiles)}
            title={t("View Certificate")}
          />
        ) : (
          <span className="text-muted">{t("Not Uploaded")}</span>
        ),
      traceability: (
        <span
          className={
            traceability === "Not established" ? "em-cal-overdue" : undefined
          }
        >
          {traceability || "—"}
        </span>
      ),
      result: (
        <span
          className={`em-badge ${
            result === "Pass" ? "em-badge-active" : "em-badge-outofservice"
          }`}
        >
          {t(result || "—")}
        </span>
      ),
      status: <span className={calibrationStatusClass(status)}>{t(status)}</span>,
      actions: (
        <div className="em-actions">
          <button
            type="button"
            title={t("Edit")}
            className="em-icon-btn em-icon-edit"
            onClick={() => {
              setEditCalibration(r);
              setShowModal(true);
            }}
          >
            <FaPencilAlt />
          </button>
        </div>
      ),
    };
  });

  return (
    <div className="em-master">
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />

      <div className="em-kpi-row mt-2">
        <KpiCard
          tone="neutral"
          value={kpis.total}
          label={t("Scheduled Instruments")}
        />
        <KpiCard tone="good" value={kpis.upToDate} label={t("Up to Date")} />
        <KpiCard tone="warning" value={kpis.due} label={t("Due ≤30d")} />
        <KpiCard tone="critical" value={kpis.overdue} label={t("Overdue")} />
      </div>

      {/* Compliance + upcoming, side by side */}
      <div className="em-split">
        <div className="mainDashboardwrp em-panel">
          <div className="mainBox1">
            <div className="d-flex flex-wrap mainHeader">
              <h4>{t("Calibration Compliance")}</h4>
            </div>
            <Donut segments={segments} caption={t("instruments")} />
          </div>
        </div>

        <div className="mainDashboardwrp em-panel">
          <div className="mainBox1">
            <div className="d-flex flex-wrap mainHeader">
              <h4>{`${t("Due in Next")} ${UPCOMING_WINDOW_DAYS} ${t("Days")}`}</h4>
            </div>
            <div className="em-due-list">
              {upcoming.length ? (
                upcoming.map((r) => {
                  const days = r.DaysLeft ?? r.daysLeft;
                  const nextDueDate = r.NextDueDate || r.nextDueDate;
                  const overdue =
                    (days !== undefined
                      ? days
                      : daysUntilDue(nextDueDate)) < 0;
                  const eqName = r.EquipmentName || r.equipmentName;
                  const centre = r.CentreName || r.centreName || "—";
                  const freq = r.Frequency || r.frequency;
                  const keyId = r.CalibrationID || r.calibrationID || r.EquipmentCode || r.equipmentCode;

                  return (
                    <div
                      className="em-due-row"
                      key={keyId}
                    >
                      <span
                        className={`em-freq-pill ${
                          overdue ? "em-freq-pill-late" : ""
                        }`}
                      >
                        {freq}
                      </span>
                      <span className="em-due-name">
                        {eqName} · {centre}
                      </span>
                      <span
                        className={overdue ? "em-cal-overdue" : "em-due-date"}
                      >
                        {t(dueLabel(nextDueDate))}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="em-detail-empty">{t("Nothing due.")}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <Heading
        title={t("Calibration Schedule")}
        secondTitle={
          <div className="em-filter-bar">
            <div className="em-filter-field">
              <ReactSelect
                id="calStatusFilter"
                name="Status"
                placeholderName="Status"
                value={statusFilter}
                dynamicOptions={CALIBRATION_STATUS_OPTIONS}
                onChange={handleStatusFilterChange}
                respclass=""
              />
            </div>
            <CustomButton
              icon="add"
              variant="success"
              onClick={() => {
                setEditCalibration(null);
                setShowModal(true);
              }}
              title={t("Record Calibration")}
              aria-label={t("Record Calibration")}
            />
          </div>
        }
      />
      <div className="mt-1 table_ticket">
        <CustomTable
          columns={columns}
          data={tableRows}
          disableTooltip={true}
          loading={loading}
        />
      </div>

      <RecordCalibrationModal
        visible={showModal}
        setVisible={(v) => {
          setShowModal(v);
          if (!v) setEditCalibration(null);
        }}
        onSave={handleSave}
        equipmentOptions={equipmentOptions}
        editData={editCalibration}
        isSaving={isSaving}
      />
    </div>
  );
};

export default CalibrationTab;
