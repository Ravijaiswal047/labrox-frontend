import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import moment from "moment";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { SampleStatus } from "../../utils/Constants";
import { getAccessRateType } from "../../utils/NetworkApi/commonApi";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Accordion from "@app/components/UI/Accordion";
import { CustomButton } from "../../components/UI/CustomButton";

// ─────────────────────────────────────────────────────────────────────────────
// Old-software "Pending List" report, rebuilt here with the app's standard
// MultiSelectComp (PrimeReact MultiSelect) for Status / Department / Centre /
// Panel, same component every other Reports page (CollectionReportUserwise,
// IssueReport, StockLedgerReport, ...) already uses for this exact job.
//
// Report endpoint: commonReports/PendingTestByCategoryReport (via axiosReport,
// baseURL "/reports/v1/"). Its payload only has Centre/Department/RateType —
// no status field — so the Status filter below is UI-only for now and isn't
// sent; the report's own "pending" scope apparently covers that already.
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = SampleStatus.filter((s) => s.value !== "");

const EMPTY_FILTERS = {
  StatusID: [],
  DepartmentID: [],
  CentreID: [],
  PanelID: [],
};

const PendingListReport = () => {
  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [centreOptions, setCentreOptions] = useState([]);
  const [panelOptions, setPanelOptions] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const data = res.data.message;
        if (Array.isArray(data)) {
          setDepartmentOptions(
            data.map((ele) => ({ value: String(ele.DepartmentID), label: ele.Department }))
          );
        }
      })
      .catch(() => {});

    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const data = res.data.message;
        if (Array.isArray(data)) {
          setCentreOptions(data.map((ele) => ({ value: String(ele.CentreID), label: ele.Centre })));
        }
      })
      .catch(() => {});

    getAccessRateType((list) =>
      setPanelOptions((list || []).map((o) => ({ value: String(o.value), label: o.label })))
    );
  }, []);

  const handleMultiSelectChange = (name, value) =>
    setFilters((prev) => ({ ...prev, [name]: value || [] }));

  const buildPayload = () => ({
    FromDate: moment(fromDate).format("DD/MMM/YYYY"),
    FromTime: "00:00:00",
    ToDate: moment(toDate).format("DD/MMM/YYYY"),
    ToTime: "23:59:59",
    Centre: filters.CentreID.map(Number),
    Department: filters.DepartmentID.map(Number),
    RateType: filters.PanelID.map(Number),
    DocumentType: 0,
  });

  const handleReport = () => {
    if (!fromDate || !toDate) {
      toast.warn(t("Please select From Date and To Date"));
      return;
    }
    setLoading(true);
    axiosReport
      .post("commonReports/PendingTestByCategoryReport", buildPayload(), {
        responseType: "blob",
      })
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      })
      .catch((err) => {
        console.log("PendingListReport error", err);
        toast.error(t("No Report Found"));
      })
      .finally(() => setLoading(false));
  };

  return (
    <Accordion name={t("Pending List")} isBreadcrumb={true} defaultValue={true}>
      <div className="row px-2 mt-2 p-1 align-items-end">
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            className="custom-calendar"
            name="FromDate"
            value={fromDate}
            onChange={(v) => setFromDate(v)}
            placeholder=" "
            id="PendingListFromDate"
            lable={t("From Date")}
            maxDate={toDate}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <DatePicker
            className="custom-calendar"
            name="ToDate"
            value={toDate}
            onChange={(v) => setToDate(v)}
            placeholder=" "
            id="PendingListToDate"
            lable={t("To Date")}
            maxDate={new Date()}
            minDate={fromDate}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <MultiSelectComp
            label={t("All Status")}
            options={STATUS_OPTIONS}
            value={filters.StatusID}
            name="StatusID"
            id="PendingListStatus"
            onChange={handleMultiSelectChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <MultiSelectComp
            label={t("All Department")}
            options={departmentOptions}
            value={filters.DepartmentID}
            name="DepartmentID"
            id="PendingListDepartment"
            onChange={handleMultiSelectChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <MultiSelectComp
            label={t("All Centre")}
            options={centreOptions}
            value={filters.CentreID}
            name="CentreID"
            id="PendingListCentre"
            onChange={handleMultiSelectChange}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2 my-1">
          <MultiSelectComp
            label={t("All Panel")}
            options={panelOptions}
            value={filters.PanelID}
            name="PanelID"
            id="PendingListPanel"
            onChange={handleMultiSelectChange}
          />
        </div>

        <div className="col-12 my-2">
          <CustomButton
            text={loading ? t("Generating...") : t("Report")}
            onClick={handleReport}
            disabled={loading}
            loading={loading}
          />
        </div>
      </div>
    </Accordion>
  );
};

export default PendingListReport;
