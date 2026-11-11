import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import CustomTabs from "@app/components/UI/CustomTabs";
import CustomTable from "@app/components/Table/CustomTable";
import { CancelButton, CustomButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import { axiosInstance } from "@app/utils/axiosInstance";
import { apiUrls } from "@app/utils/apiUrls";
import {
  criticalityClass,
  formatCurrency,
  formatDisplayDate,
  isExpired,
  statusBadgeClass,
} from "../equipmentConstants";

/** One label/value pair in the General grid. */
const Field = ({ label, children }) => (
  <div className="em-detail-field">
    <div className="em-detail-label">{label}</div>
    <div className="em-detail-value">{children || "—"}</div>
  </div>
);

const EmptyNote = ({ text }) => <div className="em-detail-empty">{text}</div>;

const ViewEquipmentModal = ({ visible, setVisible, item }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("General");
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  const eqId =
    item?.row?.EquipmentID ||
    item?.row?.equipmentID ||
    item?.id ||
    item?.equipmentID ||
    item?.EquipmentID;

  // Always reset tab and fetch real-time detail when modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab("General");
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !eqId) {
      setDetailData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    axiosInstance
      .get(`${apiUrls.GetEquipmentDetailView}?equipmentId=${eqId}`)
      .then((res) => {
        if (isMounted) {
          if (res?.data?.success && res?.data?.message) {
            setDetailData(res.data.message);
          } else {
            setDetailData(null);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading equipment detail view:", err);
        if (isMounted) setDetailData(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visible, eqId]);

  if (!item) return null;

  const row = item.row || {};
  const general = detailData?.general || row;
  const contracts = detailData?.contracts || [];
  const calibrations = detailData?.calibrations || [];
  const pmSchedules = detailData?.pmSchedules || [];
  const breakdowns = detailData?.breakdowns || [];
  const transfers = detailData?.transfers || [];
  const documents = detailData?.documents || [];

  const warranty = general?.WarrantyExpiry || row?.WarrantyExpiry;
  const eqCode = general?.EquipmentCode || item.code || "";
  const eqName = general?.EquipmentName || item.name || "";
  const makeModel = [
    general?.Make || general?.Manufacturer || row?.Make,
    general?.ModelNo || general?.ModelNumber || row?.ModelNo,
  ]
    .filter(Boolean)
    .join(" ");

  // ─── General ──────────────────────────────────────────────────────────────
  const generalTab = (
    <div className="em-detail-grid">
      <Field label={t("Category")}>
        {general?.CategoryName || item.category}
      </Field>
      <Field label={t("Make / Model")}>
        {makeModel || item.machine || "—"}
      </Field>
      <Field label={t("Serial No.")}>
        {general?.SerialNumber || item.serial || "—"}
      </Field>
      <Field label={t("Vendor")}>
        {general?.SupplierVendor || general?.Vendor || row?.SupplierVendor || "—"}
      </Field>
      <Field label={t("Purchase Date")}>
        {formatDisplayDate(general?.PurchaseDate || row?.PurchaseDate)}
      </Field>
      <Field label={t("Installation")}>
        {formatDisplayDate(general?.InstallationDate || row?.InstallationDate)}
      </Field>
      <Field label={t("Warranty Expiry")}>
        {warranty ? (
          <>
            {formatDisplayDate(warranty)}
            {isExpired(warranty) && (
              <span className="em-detail-expired"> ({t("expired")})</span>
            )}
          </>
        ) : (
          "—"
        )}
      </Field>
      <Field label={t("Cost")}>
        {formatCurrency(general?.Cost || row?.Cost)}
      </Field>
      <Field label={t("Department")}>
        {general?.DepartmentName || item.department || "—"}
      </Field>
      <Field label={t("Centre")}>
        {general?.CentreName || item.centre || "—"}
      </Field>
      <Field label={t("Criticality")}>
        <span
          className={criticalityClass(
            general?.Criticality || item.criticality,
          )}
        >
          {general?.Criticality || item.criticality || "Medium"}
        </span>
      </Field>
      <Field label={t("Status")}>
        <span
          className={statusBadgeClass(
            general?.Status || item.status || "Active",
          )}
        >
          {t(general?.Status || item.status || "Active")}
        </span>
      </Field>
    </div>
  );

  // ─── AMC / CMC ────────────────────────────────────────────────────────────
  const amcTab = contracts.length ? (
    <CustomTable
      disableTooltip={true}
      columns={[
        { header: t("ID"), field: "id" },
        { header: t("Type"), field: "type" },
        { header: t("Vendor"), field: "vendor", minWidth: "180px" },
        { header: t("Period"), field: "period", minWidth: "220px" },
        { header: t("Cost"), field: "cost" },
        { header: t("Visits"), field: "visits" },
        { header: t("Status"), field: "status" },
      ]}
      data={contracts.map((c) => {
        const isExp =
          c.Status === "Expired" || (c.DaysLeft !== null && c.DaysLeft < 0);
        const isSoon =
          c.Status === "Expiring Soon" ||
          (c.DaysLeft !== null && c.DaysLeft >= 0 && c.DaysLeft <= 60);
        const badgeClass = isExp
          ? "em-badge em-badge-outofservice"
          : isSoon
          ? "em-badge em-badge-maintenance"
          : "em-badge em-badge-active";
        const statusText = isExp
          ? t("Expired")
          : `${c.DaysLeft ?? 0} ${t("d left")}`;

        return {
          id: (
            <span className="em-detail-strong">
              {c.ContractCode || `CT-${c.ContractID}`}
            </span>
          ),
          type: c.ContractType || "—",
          vendor: c.Vendor || "—",
          period: `${formatDisplayDate(c.StartDate)} → ${formatDisplayDate(c.EndDate)}`,
          cost: formatCurrency(c.Cost),
          visits: `${c.VisitsDone || 0}/${c.VisitsTotal || 0}`,
          status: <span className={badgeClass}>{statusText}</span>,
        };
      })}
    />
  ) : (
    <EmptyNote text={t("No contract recorded.")} />
  );

  // ─── Calibration ──────────────────────────────────────────────────────────
  const calibrationTab = calibrations.length ? (
    <CustomTable
      disableTooltip={true}
      columns={[
        { header: t("Last Done"), field: "lastDone" },
        { header: t("Frequency"), field: "frequency" },
        { header: t("Next Due"), field: "nextDue" },
        { header: t("By"), field: "by", minWidth: "150px" },
        { header: t("Certificate"), field: "certificate", minWidth: "150px" },
        { header: t("Result"), field: "result" },
      ]}
      data={calibrations.map((c) => ({
        lastDone: formatDisplayDate(c.CalibrationDate),
        frequency: c.Frequency || "—",
        nextDue: formatDisplayDate(c.NextDueDate),
        by: c.PerformedBy || "—",
        certificate: c.CertificateNo || "—",
        result: (
          <span
            className={`em-badge ${
              String(c.Result).toLowerCase() === "pass"
                ? "em-badge-active"
                : "em-badge-outofservice"
            }`}
          >
            {c.Result || "—"}
          </span>
        ),
      }))}
    />
  ) : (
    <EmptyNote text={t("No calibration recorded.")} />
  );

  // ─── Maintenance ──────────────────────────────────────────────────────────
  const maintenanceTab = (
    <>
      <div className="em-detail-subhead">{t("Preventive schedule")}</div>
      {pmSchedules.length ? (
        <CustomTable
          disableTooltip={true}
          columns={[
            { header: t("Frequency"), field: "frequency" },
            { header: t("Last Done"), field: "lastDone" },
            { header: t("Next PM"), field: "nextPm" },
            { header: t("Engineer"), field: "engineer", minWidth: "180px" },
            { header: t("Status"), field: "status" },
          ]}
          data={pmSchedules.map((m) => ({
            frequency: m.Frequency || "—",
            lastDone: formatDisplayDate(m.LastDone),
            nextPm: formatDisplayDate(m.NextPM),
            engineer: m.Engineer || "—",
            status: (
              <span className={statusBadgeClass(m.Status)}>
                {t(m.Status || "Scheduled")}
              </span>
            ),
          }))}
        />
      ) : (
        <EmptyNote text={t("No preventive schedule.")} />
      )}

      <div className="em-detail-subhead mt-3">{t("Breakdown history")}</div>
      {breakdowns.length ? (
        <CustomTable
          disableTooltip={true}
          columns={[
            { header: t("Ticket"), field: "ticket" },
            { header: t("Issue"), field: "issue", minWidth: "180px" },
            { header: t("Priority"), field: "priority" },
            { header: t("Status"), field: "status" },
            { header: t("Downtime"), field: "downtime" },
            { header: t("Cost"), field: "cost" },
          ]}
          data={breakdowns.map((b) => ({
            ticket: (
              <span className="em-detail-strong">
                {b.TicketNo || `TK-${b.TicketID}`}
              </span>
            ),
            issue: b.Description || "—",
            priority: (
              <span className={criticalityClass(b.Priority)}>
                {b.Priority || "—"}
              </span>
            ),
            status: (
              <span className={statusBadgeClass(b.Status)}>
                {t(b.Status || "—")}
              </span>
            ),
            downtime: b.Downtime || "—",
            cost: formatCurrency(b.Cost),
          }))}
        />
      ) : (
        <EmptyNote text={t("No breakdown history.")} />
      )}
    </>
  );

  // ─── Transfer History ─────────────────────────────────────────────────────
  const transferTab = transfers.length ? (
    <CustomTable
      disableTooltip={true}
      columns={[
        { header: t("Request / Code"), field: "code" },
        { header: t("Date"), field: "date" },
        { header: t("From"), field: "from", minWidth: "160px" },
        { header: t("To"), field: "to", minWidth: "160px" },
        { header: t("Status"), field: "status" },
        { header: t("Reason"), field: "reason", minWidth: "160px" },
      ]}
      data={transfers.map((tr) => ({
        code: (
          <span className="em-detail-strong">
            {tr.TransferCode || `TR-${tr.TransferID}`}
          </span>
        ),
        date: formatDisplayDate(tr.TransferDate),
        from: tr.FromCentreName || "—",
        to: tr.ToCentreName || "—",
        status: (
          <span className={statusBadgeClass(tr.Status)}>
            {t(tr.Status || "—")}
          </span>
        ),
        reason: tr.Reason || "—",
      }))}
    />
  ) : (
    <EmptyNote text={t("Never transferred.")} />
  );

  // ─── Documents ────────────────────────────────────────────────────────────
  const documentsTab = (
    <>
      {documents.length ? (
        <CustomTable
          disableTooltip={true}
          columns={[
            { header: t("Document"), field: "name", minWidth: "260px" },
            { header: t("Type"), field: "type" },
            { header: t("Uploaded"), field: "uploaded" },
            { header: "", field: "actions" },
          ]}
          data={documents.map((doc) => ({
            name: <span className="em-detail-link">{doc.Name}</span>,
            type: doc.Type || "Document",
            uploaded: formatDisplayDate(doc.UploadedOn),
            actions: doc.FileUrl ? (
              <a
                href={doc.FileUrl}
                target="_blank"
                rel="noreferrer"
                className="em-icon-btn em-detail-link"
                style={{ textDecoration: "none" }}
              >
                {t("View")}
              </a>
            ) : (
              <button
                type="button"
                className="em-icon-btn em-detail-link"
                onClick={() => notify(t("No document file attached"), "info")}
              >
                {t("View")}
              </button>
            ),
          }))}
        />
      ) : (
        <EmptyNote text={t("No documents uploaded.")} />
      )}
      <div className="mt-2">
        <CustomButton
          text={t("Upload Document")}
          icon="upload"
          variant="secondary"
          onClick={() =>
            notify(t("Document upload is not wired up yet"), "warn")
          }
        />
      </div>
    </>
  );

  const tabs = [
    { id: "General", label: t("General"), content: generalTab },
    { id: "AmcCmc", label: t("AMC / CMC"), content: amcTab },
    { id: "Calibration", label: t("Calibration"), content: calibrationTab },
    { id: "Maintenance", label: t("Maintenance"), content: maintenanceTab },
    { id: "Transfer", label: t("Transfer History"), content: transferTab },
    // { id: "Documents", label: t("Documents"), content: documentsTab },
  ];

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={`${eqCode} — ${eqName}`}
      modalWidth="1000px"
      buttons={
        <CancelButton text={t("Close")} onClick={() => setVisible(false)} />
      }
    >
      {loading && (
        <div
          style={{
            fontSize: "12px",
            color: "#0f766e",
            fontWeight: 600,
            padding: "4px 8px",
            marginBottom: "8px",
            background: "#f0fdfa",
            borderRadius: "4px",
            border: "1px solid #ccfbf1",
          }}
        >
          {t("Syncing latest live equipment information...")}
        </div>
      )}
      <div className="em-detail em-subtabs">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onSelect={(key) => setActiveTab(key)}
        />
      </div>
    </Modal>
  );
};

export default ViewEquipmentModal;
