import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Heading from "@app/components/UI/Heading";
import CustomTable from "@app/components/Table/CustomTable";
import { CustomButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import KpiCard from "./shared/KpiCard";
import Donut from "./shared/Donut";
import BarList from "./shared/BarList";
import SendToSupplierModal from "./SendToSupplierModal";
import { axiosInstance } from "../../../utils/axiosInstance";
import {
  formatApiDate,
  formatCurrency,
  formatDisplayDate,
} from "../equipmentConstants";
import {
  RETURN_FLOW,
  RETURN_STATUS_COLORS,
  daysOut,
  isReturnOpen,
  isReturnOverdue,
  returnBadgeClass,
  returnKpis,
} from "../supplierReturnConstants";

const SupplierReturnTab = () => {
  const { t } = useTranslation();

  const [returns, setReturns] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Load Live Returns ───────────────────────────────────────────────────
  const loadReturns = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("EquipmentManagement/GetSupplierReturns", {});
      if (response?.data?.success) {
        const data = response.data.message || {};
        setReturns(data.Returns || data.returns || []);
        if (data.Kpis || data.kpis) {
          setKpis(data.Kpis || data.kpis);
        }
      } else {
        setReturns([]);
      }
    } catch (err) {
      console.error("Failed to load supplier returns", err);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Load Equipments & Vendors ──────────────────────────────────────────
  const loadEquipment = async () => {
    try {
      const response = await axiosInstance.post("EquipmentManagement/GetEquipment", {});
      if (response?.data?.success) {
        setEquipmentList(response.data.message || []);
      }
    } catch (err) {
      console.error("Failed to load equipment list", err);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await axiosInstance.get("EquipmentManagement/GetVendors");
      if (response?.data?.success) {
        setVendorList(response.data.message || []);
      }
    } catch (err) {
      console.error("Failed to load vendors", err);
    }
  };

  useEffect(() => {
    loadReturns();
    loadEquipment();
    loadVendors();
  }, []);

  const computedKpis = useMemo(() => {
    if (kpis && (kpis.total !== undefined || kpis.Total !== undefined)) {
      return {
        total: kpis.total ?? kpis.Total ?? 0,
        atVendor: kpis.atVendor ?? kpis.AtVendor ?? 0,
        overdue: kpis.overdue ?? kpis.Overdue ?? 0,
        returned: kpis.returned ?? kpis.Returned ?? 0,
        cost: kpis.cost ?? kpis.Cost ?? 0,
      };
    }
    return returnKpis(returns);
  }, [kpis, returns]);

  const statusSegments = RETURN_FLOW.map((stage) => ({
    label: t(stage),
    value: returns.filter((r) => r.Status === stage).length,
    color: RETURN_STATUS_COLORS[stage],
  }));

  // Only open items age — a returned unit's clock has stopped.
  const agingRows = useMemo(
    () =>
      returns
        .filter((r) => !r.ActualReturn && !r.ActualReturnDate)
        .map((r) => {
          const days = r.DaysOut !== undefined ? Number(r.DaysOut) : daysOut(r);
          const overdue = r.IsOverdue !== undefined ? !!r.IsOverdue : isReturnOverdue(r);
          return {
            label: r.EquipmentName || r.EquipmentCode,
            value: days,
            display: `${days}d`,
            danger: overdue,
          };
        })
        .sort((a, b) => b.value - a.value),
    [returns],
  );

  // ─── Advance through the pipeline ─────────────────────────────────────────
  const handleAdvance = async (returnId) => {
    try {
      const response = await axiosInstance.post("EquipmentManagement/AdvanceSupplierReturn", {
        ReturnID: Number(returnId),
      });
      if (response?.data?.success) {
        notify(response.data.message || t("Status updated"), "success");
        await loadReturns();
        loadEquipment();
      } else {
        notify(response?.data?.message || t("Failed to update status"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || err?.message || t("Error advancing status"), "error");
    }
  };

  // ─── Create Supplier Return ──────────────────────────────────────────────
  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      const payload = {
        EquipmentID: Number(form.EquipmentID),
        EquipmentCode: form.EquipmentCode,
        VendorID: form.VendorID ? Number(form.VendorID) : null,
        Vendor: form.Vendor.trim(),
        Challan: form.Challan.trim() || "—",
        SentDate: formatApiDate(form.Sent) || moment().format("YYYY-MM-DD"),
        ExpectedDate: formatApiDate(form.Expected) || null,
        Cost: Number(form.Cost) || 0,
        Reason: form.Reason.trim(),
        Decontaminated: !!form.Decontaminated,
      };

      const response = await axiosInstance.post("EquipmentManagement/CreateSupplierReturn", payload);
      if (response?.data?.success) {
        notify(response.data.message || t("Gate pass generated"), "success");
        setShowModal(false);
        await loadReturns();
        loadEquipment();
      } else {
        notify(response?.data?.message || t("Failed to dispatch equipment"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || err?.message || t("Error dispatching equipment"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Table Rows ───────────────────────────────────────────────────────────
  const rows = returns.map((r) => {
    const overdue = r.IsOverdue !== undefined ? !!r.IsOverdue : isReturnOverdue(r);
    const days = r.DaysOut !== undefined ? Number(r.DaysOut) : daysOut(r);
    const next = RETURN_FLOW[RETURN_FLOW.indexOf(r.Status) + 1];
    return {
      rowColor: overdue ? "#fef2f2" : undefined,
      id: (
        <div>
          <div className="em-detail-strong">{r.ReturnCode || r.ReturnID}</div>
          <div className="em-eq-sub">{r.GatePass}</div>
        </div>
      ),
      equipment: (
        <div>
          <div className="em-eq-name">{r.EquipmentName || r.EquipmentCode}</div>
          <div className="em-eq-sub">
            {[r.EquipmentCode, r.CentreName].filter(Boolean).join(" · ")}
          </div>
        </div>
      ),
      vendor: (
        <div>
          <div>{r.Vendor}</div>
          <div className="em-eq-sub">{r.Challan}</div>
          <span
            className={`em-badge ${
              r.Decontaminated ? "em-badge-active" : "em-badge-maintenance"
            }`}
          >
            {r.Decontaminated ? t("Decontaminated") : t("Decon pending")}
          </span>
        </div>
      ),
      sent: formatDisplayDate(r.Sent || r.SentDate),
      expected: (
        <span className={overdue ? "em-cal-overdue" : undefined}>
          {formatDisplayDate(r.Expected || r.ExpectedDate)}
          {overdue ? ` (${t("overdue")})` : ""}
        </span>
      ),
      actual: formatDisplayDate(r.ActualReturn || r.ActualReturnDate) || "—",
      daysOut: `${days}d`,
      reason: r.Reason || "—",
      cost: formatCurrency(r.Cost) || "₹0",
      status: <span className={returnBadgeClass(r.Status)}>{t(r.Status)}</span>,
      actions: next ? (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary em-row-btn py-0 px-2"
          onClick={() => handleAdvance(r.ReturnID)}
        >
          → {t(next)}
        </button>
      ) : (
        <span className="text-success font-weight-bold">✓ {t("Installed")}</span>
      ),
    };
  });

  return (
    <div className="em-master">
      <div className="em-kpi-row mt-2 ">
        <KpiCard tone="neutral" value={computedKpis.total} label={t("Total Sent (YTD)")} />
        <KpiCard tone="info" value={computedKpis.atVendor} label={t("Currently at Vendor")} />
        <KpiCard tone="critical" value={computedKpis.overdue} label={t("Return Overdue")} />
        <KpiCard tone="good" value={computedKpis.returned} label={t("Returned & Installed")} />
        <KpiCard
          tone="warning"
          value={formatCurrency(computedKpis.cost) || "₹0"}
          label={t("Repair Cost (YTD)")}
        />
      </div>

      <div className="em-split">
        <div className="mainDashboardwrp em-panel">
          <div className="mainBox1">
            <div className="d-flex flex-wrap mainHeader">
              <h4>{t("Return Status Distribution")}</h4>
            </div>
            <Donut segments={statusSegments} caption={t("items")} />
          </div>
        </div>

        <div className="mainDashboardwrp em-panel">
          <div className="mainBox1">
            <div className="d-flex flex-wrap mainHeader">
              <h4>{t("Days at Vendor — Open Items")}</h4>
            </div>
            <BarList
              rows={agingRows}
              labelWidth={180}
              emptyText={t("Nothing is at a vendor right now.")}
            />
          </div>
        </div>
      </div>

      <Heading
        title={t("Equipment Sent to Supplier — Repair / Service")}
        secondTitle={
          <div className="em-filter-bar">
            <CustomButton
              text={t("Send to Supplier")}
              icon="add"
              variant="success"
              onClick={() => setShowModal(true)}
            />
          </div>
        }
      />
      <div className="mt-1 table_ticket">
        <CustomTable
          disableTooltip={true}
          columns={[
            { header: t("ID / Gate Pass"), field: "id", minWidth: "140px" },
            { header: t("Equipment"), field: "equipment", minWidth: "200px" },
            { header: t("Vendor"), field: "vendor", minWidth: "200px" },
            { header: t("Sent"), field: "sent", minWidth: "110px" },
            { header: t("Expected"), field: "expected", minWidth: "140px" },
            { header: t("Actual Return"), field: "actual", minWidth: "120px" },
            { header: t("Days Out"), field: "daysOut", minWidth: "85px" },
            { header: t("Reason"), field: "reason", minWidth: "220px", wrapText: true },
            { header: t("Cost"), field: "cost", minWidth: "110px" },
            { header: t("Status"), field: "status", minWidth: "150px" },
            { header: t("Action"), field: "actions", minWidth: "170px" },
          ]}
          data={rows}
        />
      </div>

      <p className="em-detail-empty">
        {t(
          "Workflow: Sent → Under Repair at Vendor → Dispatched Back → Received & Installed. Confirming installation puts the equipment back to Active.",
        )}
      </p>

      <SendToSupplierModal
        visible={showModal}
        setVisible={setShowModal}
        onSave={handleSave}
        equipmentList={equipmentList}
        vendorList={vendorList}
        isSaving={isSaving}
      />
    </div>
  );
};

export default SupplierReturnTab;
