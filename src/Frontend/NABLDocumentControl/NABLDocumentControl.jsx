import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import { NABLFilterContext } from "./context/NABLFilterContext";
import Dashboard from "./pages/Dashboard";
import PlaceholderTab from "./pages/PlaceholderTab";
import {
  FALLBACK_DASHBOARD,
  FALLBACK_FILTERS,
  NABL_TABS,
  getNablDashboard,
  getNablFilters,
} from "./services/nablApi";
import "./NABLDocumentControl.css";

const STORAGE_KEY = "nablDocumentControlFilters";

const readStoredFilters = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const NABLDocumentControl = () => {
  const { t } = useTranslation();
  const stored = readStoredFilters();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterOptions, setFilterOptions] = useState(FALLBACK_FILTERS);
  const [filters, setFilters] = useState({
    centreId: stored?.centreId ?? 0,
    auditYearId: stored?.auditYearId ?? 3,
    departmentId: stored?.departmentId ?? 0,
  });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadFilters = useCallback(async () => {
    try {
      const data = await getNablFilters();
      setFilterOptions(data);
      setFilters((prev) => ({
        centreId: prev.centreId || 0,
        auditYearId: prev.auditYearId || data.defaultAuditYearId,
        departmentId: prev.departmentId || 0,
      }));
    } catch (error) {
      toast.error(error?.message || t("Unable to load NABL filters"));
      setFilterOptions(FALLBACK_FILTERS);
    }
  }, [t]);

  const loadDashboard = useCallback(
    async (nextFilters) => {
      setLoading(true);
      try {
        const data = await getNablDashboard({
          CentreId: nextFilters.centreId,
          AuditYearId: nextFilters.auditYearId,
          DepartmentId: nextFilters.departmentId,
        });
        setDashboard(data);
        if (data?.tabBadges) {
          setFilterOptions((prev) => ({ ...prev, tabBadges: data.tabBadges }));
        }
      } catch (error) {
        toast.error(error?.message || t("Unable to load NABL dashboard"));
        setDashboard(FALLBACK_DASHBOARD);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    loadDashboard(filters);
  }, [filters, loadDashboard]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: Number(value ?? 0) }));
  };

  const handleReactChange = (name, option) => {
    updateFilter(name, option?.value ?? 0);
  };

  const contextValue = useMemo(
    () => ({
      filters,
      filterOptions,
      setFilters,
      updateFilter,
      activeTab,
      setActiveTab,
      dashboard,
      loading,
    }),
    [filters, filterOptions, activeTab, dashboard, loading]
  );

  const badges = filterOptions.tabBadges || dashboard?.tabBadges || {};

  const tabLabel = (tab) => {
    const count = tab.badgeKey ? badges[tab.badgeKey] : null;
    return (
      <>
        {t(tab.label)}
        {count ? <span className="badge bg-secondary ml-1">{count}</span> : null}
      </>
    );
  };

  const tabs = NABL_TABS.map((tab) => ({
    id: tab.id,
    label: tabLabel(tab),
    content:
      tab.id === "dashboard" ? (
        <Dashboard />
      ) : (
        <PlaceholderTab title={tab.label} />
      ),
  }));

  return (
    <NABLFilterContext.Provider value={contextValue}>
      <div className="card shadow mb-4">
        <Heading isBreadcrumb={true} name={t("NABL Document Control & Compliance")} />

        <div className="row px-2 mt-2 mb-1">
          <div className="col-6 col-md-3 col-lg-2 my-1">
            <ReactSelect
              name="centreId"
              id="nablCentre"
              respclass=""
              removeIsClearable={true}
              dynamicOptions={filterOptions.centres}
              placeholderName={t("Centre")}
              value={filters.centreId}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-6 col-md-3 col-lg-2 my-1">
            <ReactSelect
              name="auditYearId"
              id="nablAuditYear"
              respclass=""
              removeIsClearable={true}
              dynamicOptions={filterOptions.auditYears}
              placeholderName={t("Audit Year")}
              value={filters.auditYearId}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-6 col-md-3 col-lg-2 my-1">
            <ReactSelect
              name="departmentId"
              id="nablDepartment"
              respclass=""
              removeIsClearable={true}
              dynamicOptions={filterOptions.departments}
              placeholderName={t("Department")}
              value={filters.departmentId}
              onChange={handleReactChange}
            />
          </div>
        </div>

        {loading && !dashboard ? (
          <Loading />
        ) : (
          <CustomTabs
            tabs={tabs}
            activeTab={activeTab}
            onSelect={(key) => key && setActiveTab(key)}
          />
        )}
      </div>
    </NABLFilterContext.Provider>
  );
};

export default NABLDocumentControl;
