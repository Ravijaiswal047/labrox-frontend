import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPencilAlt } from "react-icons/fa";
import Heading from "@app/components/UI/Heading";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import CustomTable from "@app/components/Table/CustomTable";
import { CustomButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import KpiCard from "./shared/KpiCard";
import BarList from "./shared/BarList";
import NewContractModal from "./NewContractModal";
import LogVisitModal from "./LogVisitModal";
import {
  ALL_VALUE,
  findEquipment,
  formatCurrency,
  formatDisplayDate,
  isAllValue,
  formatApiDate,
} from "../equipmentConstants";
import {
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  DUMMY_CONTRACTS,
  compactValue,
  contractKpis,
  contractStatus,
  contractStatusClass,
  renewalLabel,
  vendorTotals,
} from "../amcConstants";
import { axiosInstance } from "../../../utils/axiosInstance";

const AmcCmcTab = () => {
  const { t } = useTranslation();

  // DUMMY: swap for the contracts API when it exists.
  // const [contracts, setContracts] = useState(DUMMY_CONTRACTS);
  const [visits, setVisits] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [kpis, setKpis] = useState({
    totalContracts: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    annualValue: 0,
  });

  const [filters, setFilters] = useState({
    Type: ALL_VALUE,
    Status: ALL_VALUE,
  });
  const [showContractModal, setShowContractModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [editContract, setEditContract] = useState(null);
  const [editVisit, setEditVisit] = useState(null);

  // Clearing with the x falls back to "All …" rather than a blank control.
  const handleFilterSelect = (name, selectedOption) => {
    setFilters((prev) => ({ ...prev, [name]: selectedOption?.value ?? ALL_VALUE }));
  };

  // const kpis = useMemo(() => contractKpis(contracts), [contracts]);

  const filteredContracts = useMemo(
    () =>
      contracts.filter((c) => {
        if (!isAllValue(filters.Type) && c.Type !== filters.Type) return false;
        if (
          !isAllValue(filters.Status) &&
          contractStatus(c.EndDate) !== filters.Status
        ) {
          return false;
        }
        return true;
      }),
    [contracts, filters],
  );

  // Equipment dropdown options with data attached
  const equipmentOptions = useMemo(
    () =>
      equipmentList.map((eq) => ({
        value: eq.EquipmentID,
        label: `${eq.EquipmentCode} — ${eq.EquipmentName}`,
        data: eq,
      })),
    [equipmentList]
  );

  const contractOptions = useMemo(
    () =>
      contracts.map((c) => ({
        value: c.ContractID,
        label: `${c.ContractCode || `CT-${c.ContractID}`} — ${c.EquipmentName} (${c.ContractType})`,
      })),
    [contracts],
  );

  // ─── Save handlers ───────────────────────────────────────────────────────
  const handleSaveContract = async (form) => {
    try {
      const payload = {
        EquipmentID: form.EquipmentID,
        ContractType: form.Type,
        Vendor: form.Vendor.trim(),
        StartDate: formatApiDate(form.StartDate),
        EndDate: formatApiDate(form.EndDate),
        Cost: Number(form.Cost) || 0,
        VisitsTotal: Number(form.VisitsTotal) || 0,
      };
      if (form.ContractID) {
        payload.ContractID = form.ContractID;
      }

      const response = await axiosInstance.post(
        "EquipmentManagement/SaveServiceContract",
        payload
      );

      if (!response?.data?.success) {
        notify(
          response?.data?.message || t("Unable to save contract"),
          "error"
        );
        return;
      }

      setShowContractModal(false);
      setEditContract(null);

      notify(
        response?.data?.message ||
          (form.ContractID ? t("Contract updated successfully") : t("Contract saved")),
        "success"
      );

      await loadContracts();
    } catch (error) {
      notify(t("Unable to save contract"), "error");
    }
  };

  const handleSaveVisit = async (form) => {
    try {
      const payload = {
        ContractID: Number(form.ContractID),
        VisitDate: formatApiDate(form.VisitDate),
        Engineer: form.Engineer.trim(),
        WorkDone: form.WorkDone?.trim() || "",
        NextVisit: form.NextVisit
          ? formatApiDate(form.NextVisit)
          : null,
      };
      if (form.VisitID) {
        payload.VisitID = form.VisitID;
      }

      const response = await axiosInstance.post(
        "EquipmentManagement/SaveEngineerVisit",
        payload
      );

      if (!response?.data?.success) {
        notify(
          response?.data?.message ||
            t("Unable to save engineer visit"),
          "error"
        );

        return;
      }

      setShowVisitModal(false);
      setEditVisit(null);

      notify(
        response?.data?.message ||
          (form.VisitID ? t("Engineer visit updated successfully") : t("Engineer visit logged")),
        "success"
      );

      await loadEngineerVisits();
      await loadContracts();
    } catch (error) {
      console.error("SaveEngineerVisit error:", error);

      notify(
        t("Unable to save engineer visit"),
        "error"
      );
    }
  };


  // ─── Contracts table ──────────────────────────────────────────────────────
  const contractColumns = [
    { header: t("ID"), field: "id", minWidth: "80px" },
    { header: t("Equipment"), field: "equipment", minWidth: "220px" },
    { header: t("Type"), field: "type", minWidth: "90px" },
    { header: t("Vendor"), field: "vendor", minWidth: "190px" },
    { header: t("Start"), field: "start", minWidth: "110px" },
    { header: t("End"), field: "end", minWidth: "110px" },
    { header: t("Cost"), field: "cost", minWidth: "110px" },
    { header: t("Visits"), field: "visits", minWidth: "80px" },
    { header: t("Renewal"), field: "renewal", minWidth: "140px" },
    { header: t("Action"), field: "actions", minWidth: "80px" },
  ];

  const contractRows = contracts.map((c) => ({
  rowColor:
    c.ContractStatus === "Expired"
      ? "#fef2f2"
      : c.ContractStatus === "Expiring Soon"
        ? "#fffbeb"
        : undefined,

  id: (
    <span className="em-detail-strong">
      {c.ContractCode}
    </span>
  ),

  equipment: (
    <div>
      <div className="em-eq-name">
        {c.EquipmentName}
      </div>

      <div className="em-eq-sub">
        {[
          c.EquipmentCode,
          c.CentreName,
        ]
          .filter(Boolean)
          .join(" · ")}
      </div>
    </div>
  ),

  type: (
    <span className="em-amc-type">
      {c.ContractType}
    </span>
  ),

  vendor: c.Vendor,

  start: formatDisplayDate(c.StartDate),

  end: formatDisplayDate(c.EndDate),

  cost:
    formatCurrency(c.Cost) || "₹0",

  visits:
    `${c.VisitsDone || 0} / ${c.VisitsTotal || 0}`,

  renewal: (
    <span
      className={contractStatusClass(
        c.ContractStatus
      )}
    >
      {c.Renewal}
    </span>
  ),

  actions: (
    <div className="em-actions">
      <button
        type="button"
        title={t("Edit")}
        className="em-icon-btn em-icon-edit"
        onClick={() => {
          setEditContract(c);
          setShowContractModal(true);
        }}
      >
        <FaPencilAlt />
      </button>
    </div>
  ),
}));


  // ─── Vendor chart ─────────────────────────────────────────────────────────
  // One measure across named vendors, so a single hue — colour carries no extra
  // meaning here and must not track rank.
  const vendorRows = useMemo(
    () =>
      vendorTotals(contracts).map((v) => ({
        label: v.vendor,
        value: v.total,
        // Bars read "310k"; the hover title carries the exact figure.
        display: v.total > 0 ? compactValue(v.total) : t("No contract value"),
      })),
    [contracts, t],
  );

  // ─── Visits table ─────────────────────────────────────────────────────────
  const visitColumns = [
    { header: t("Date"), field: "date", minWidth: "110px" },
    { header: t("Contract"), field: "contract", minWidth: "90px" },
    { header: t("Equipment"), field: "equipment", minWidth: "180px" },
    { header: t("Engineer"), field: "engineer", minWidth: "150px" },
    { header: t("Work Done"), field: "workDone", minWidth: "300px", wrapText: true },
    { header: t("Next Visit"), field: "nextVisit", minWidth: "120px" },
    { header: t("Action"), field: "actions", minWidth: "80px" },
  ];

  const visitRows = visits.map((v) => ({
  date: formatDisplayDate(v.VisitDate),

  contract: (
    <span className="em-detail-strong">
      {v.ContractCode || `CT-${v.ContractID}`}
    </span>
  ),

  equipment: (
    <div>
      <div className="em-eq-name">
        {v.EquipmentName}
      </div>

      <div className="em-eq-sub">
        {[
          v.EquipmentCode,
          v.CentreName,
        ]
          .filter(Boolean)
          .join(" · ")}
      </div>
    </div>
  ),

  engineer: v.Engineer,

  workDone: v.WorkDone,

  nextVisit: formatDisplayDate(v.NextVisit),

  actions: (
    <div className="em-actions">
      <button
        type="button"
        title={t("Edit")}
        className="em-icon-btn em-icon-edit"
        onClick={() => {
          setEditVisit(v);
          setShowVisitModal(true);
        }}
      >
        <FaPencilAlt />
      </button>
    </div>
  ),
}));


  const loadEquipment = async () => {
  try {
    const response = await axiosInstance.post(
      "EquipmentManagement/GetEquipment",
      {}
    );

    if (response?.data?.success) {
      const rows = response.data.message || [];

      setEquipmentList(rows);
    } else {
      setEquipmentList([]);
      notify(
        response?.data?.message || t("Unable to load equipment"),
        "error"
      );
    }
  } catch (error) {
    setEquipmentList([]);
    notify(t("Unable to load equipment"), "error");
  }
};


const loadContracts = async () => {
  try {
    const response = await axiosInstance.post(
      "EquipmentManagement/GetServiceContracts",
      {
        Type: filters.Type,
        Status: filters.Status,
      }
    );

    if (response?.data?.success) {
      const result = response.data.message || {};

      setContracts(result.contracts || []);
      setKpis(
        result.kpi || {
          totalContracts: 0,
          active: 0,
          expiring: 0,
          expired: 0,
          annualValue: 0,
        }
      );
    } else {
      setContracts([]);
      notify(
        response?.data?.message || t("Unable to load contracts"),
        "error"
      );
    }
  } catch (error) {
    setContracts([]);
    notify(t("Unable to load contracts"), "error");
  }
};

const loadEngineerVisits = async () => {
  try {
    const response = await axiosInstance.post(
      "EquipmentManagement/GetEngineerVisits",
      {}
    );

    if (response?.data?.success) {
      setVisits(response.data.message || []);
    } else {
      setVisits([]);

      notify(
        response?.data?.message || t("Unable to load engineer visits"),
        "error"
      );
    }
  } catch (error) {
    console.error("GetEngineerVisits error:", error);

    setVisits([]);

    notify(
      t("Unable to load engineer visits"),
      "error"
    );
  }
};

const loadVendors = async () => {
  try {
    const response = await axiosInstance.get("EquipmentManagement/GetVendors");
    if (response?.data?.success) {
      setVendorList(response.data.message || []);
    }
  } catch (error) {
    console.error("GetVendors error:", error);
  }
};

  useEffect(() => {
    loadEquipment();
    loadEngineerVisits();
    loadVendors();
  }, []);

  useEffect(() => {
    loadContracts();
  }, [filters.Type, filters.Status]);

  return (
    <div className="em-master">
      {/* KPI row */}
      <div className="em-kpi-row mt-2">
  <KpiCard
    tone="neutral"
    value={kpis.totalContracts}
    label={t("Total Contracts")}
  />

  <KpiCard
    tone="good"
    value={kpis.active}
    label={t("Active")}
  />

  <KpiCard
    tone="warning"
    value={kpis.expiring}
    label={t("Expiring ≤60d")}
  />

  <KpiCard
    tone="critical"
    value={kpis.expired}
    label={t("Expired")}
  />

  <KpiCard
    tone="info"
    value={formatCurrency(kpis.annualValue) || "₹0"}
    label={t("Annual Contract Value")}
  />
</div>


      {/* Contracts */}
      <Heading
        title={t("Service Contracts")}
        secondTitle={
          <div className="em-filter-bar">
            <div className="em-filter-field">
              <ReactSelect
                id="amcTypeFilter"
                name="Type"
                placeholderName="Type"
                value={filters.Type}
                dynamicOptions={CONTRACT_TYPE_OPTIONS}
                onChange={handleFilterSelect}
                respclass=""
              />
            </div>
            <div className="em-filter-field">
              <ReactSelect
                id="amcStatusFilter"
                name="Status"
                placeholderName="Status"
                value={filters.Status}
                dynamicOptions={CONTRACT_STATUS_OPTIONS}
                onChange={handleFilterSelect}
                respclass=""
              />
            </div>
            <CustomButton
              icon="add"
              variant="success"
              onClick={() => {
                setEditContract(null);
                setShowContractModal(true);
              }}
              title={t("New Contract")}
              aria-label={t("New Contract")}
            />
          </div>
        }
      />
      <div className="mt-1 table_ticket">
        <CustomTable
          columns={contractColumns}
          data={contractRows}
          disableTooltip={true}
        />
      </div>

      {/* Contract value by vendor */}
      <Heading title={t("Contract Value by Vendor (₹/yr)")} />
      <BarList rows={vendorRows} labelWidth={190} />

      {/* Engineer visits */}
      <Heading
        title={t("Recent Engineer Visits")}
        secondTitle={
          <div className="em-filter-bar">
            <CustomButton
              // text={t("Log Visit")}
              icon="add"
              variant="secondary"
              onClick={() => {
                setEditVisit(null);
                setShowVisitModal(true);
              }}
              title={t("Log Visit")}
            />
          </div>
        }
      />
      <div className="mt-1 table_ticket">
        <CustomTable
          columns={visitColumns}
          data={visitRows}
          disableTooltip={true}
        />
      </div>

      <NewContractModal
        visible={showContractModal}
        setVisible={(v) => {
          setShowContractModal(v);
          if (!v) setEditContract(null);
        }}
        onSave={handleSaveContract}
        equipmentOptions={equipmentOptions}
        equipmentList={equipmentList}
        vendorList={vendorList}
        editData={editContract}
      />

      <LogVisitModal
        visible={showVisitModal}
        setVisible={(v) => {
          setShowVisitModal(v);
          if (!v) setEditVisit(null);
        }}
        onSave={handleSaveVisit}
        contractOptions={contractOptions}
        editData={editVisit}
      />
    </div>
  );
};

export default AmcCmcTab;
