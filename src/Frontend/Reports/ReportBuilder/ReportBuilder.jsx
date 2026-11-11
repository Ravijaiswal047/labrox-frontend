import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import { toast } from "react-toastify";
import CustomTabs from "../../../components/UI/CustomTabs";
import { CustomButton, SaveButton, CancelButton } from "../../../components/UI/CustomButton";
import Modal from "../../../components/formComponent/Modal";
import Input from "../../../components/formComponent/Input";
import ReportExplorer from "./components/ReportExplorer";
import ReportMasterTab from "./tabs/ReportMasterTab";
import DataSourceTab from "./tabs/DataSourceTab";
import ColumnsTab from "./tabs/ColumnsTab";
import FiltersTab from "./tabs/FiltersTab";
import PrintSetupTab from "./tabs/PrintSetupTab";
import SecurityTab from "./tabs/SecurityTab";
import PreviewTab from "./tabs/PreviewTab";
import reportBuilderApi, { mapReportTree, mapColumns } from "./reportBuilderApi";
import { getReportBuilderThemeStyle } from "./reportBuilderTheme";
import {
  initialColumnRows,
  initialFilterRows,
  initialSecurityRoles,
  previewRecords,
} from "./reportBuilderData";
import "./ReportBuilder.css";

let paramSeq = 100;
let columnSeq = 100;
let filterSeq = 100;

const defaultPrintSetup = {
  allowedFormats: ["PDF", "Excel", "CSV", "Print"],
  orientation: "Portrait",
  paperSize: "A4",
  headerHeight: 90,
  footerHeight: 40,
  font: "Segoe UI",
  fontSize: 9,
  currencySymbol: "₹",
  decimalPrecision: 2,
  watermark: "",
  headerBgColor: "#0d1b3e",
  csvDelimiter: "Comma",
  encoding: "UTF-8",
  elements: {
    companyLogo: true, companyName: true, address: true, gst: true, phoneEmail: true,
    website: false, selectionCriteria: true, printedBy: true, printDateTime: true, pageXY: true,
    grandTotal: true, pageTotal: false, altRowColor: true, pageBorder: false, confidentialFooter: true,
  },
  excel: {
    freezeHeader: true, freezeFirstColumn: true, autoFilter: true, autoWidth: true, wrapText: false,
    currencyFormat: true, conditionalFormatting: true, formulaSupport: false, pivotCompatible: true,
  },
};

const defaultSchedule = {
  enabled: false,
  frequency: "Daily",
  time: "08:00 AM",
  format: "PDF + Excel",
  recipients: "",
};

const blankMaster = (reportHeadOptions) => ({
  reportName: "",
  reportCode: "",
  reportHeadId: reportHeadOptions[0]?.value ?? null,
  reportType: [],
  displaySequence: 0,
  description: "",
  icon: "chart",
  active: true,
});

const ReportBuilder = () => {
  const navigate = useNavigate();
  const currentTheme = useSelector((state) => state.loadingSlice.currentTheme);
  const themeStyle = useMemo(() => getReportBuilderThemeStyle(currentTheme), [currentTheme]);
  const [treeData, setTreeData] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [activeTab, setActiveTab] = useState("master");
  const [saving, setSaving] = useState(false);

  const [reportHeadOptions, setReportHeadOptions] = useState([]);
  const [reportTypeOptions, setReportTypeOptions] = useState([]);

  const [master, setMaster] = useState(blankMaster([]));
  const setMasterField = (name, value) => setMaster((prev) => ({ ...prev, [name]: value }));

  const suggestDisplaySequence = async (reportHeadId) => {
    if (!reportHeadId) return;
    const res = await reportBuilderApi.getNextDisplaySequence(reportHeadId);
    if (res.success && res.data != null) {
      setMasterField("displaySequence", res.data);
    }
  };

  const handleReportHeadChange = (reportHeadId) => {
    setMasterField("reportHeadId", reportHeadId);
    if (!selectedReportId) suggestDisplaySequence(reportHeadId);
  };

  // Shared by both "Report Head" (single-select) and "Report Type" (multi-select)
  // — both are small named-catalog entities edited the same way: a "✎" to rename
  // the currently-selected one, a "＋" to create a new one, same modal either way.
  const [entityModal, setEntityModal] = useState({ visible: false, kind: "head", mode: "create", id: null, value: "" });
  const [savingEntity, setSavingEntity] = useState(false);
  const openAddReportHead = () => setEntityModal({ visible: true, kind: "head", mode: "create", id: null, value: "" });
  const openEditReportHead = (id, label) => setEntityModal({ visible: true, kind: "head", mode: "edit", id, value: label === "—" ? "" : label });
  const openAddReportType = () => setEntityModal({ visible: true, kind: "type", mode: "create", id: null, value: "" });
  const openEditReportType = (id, label) => setEntityModal({ visible: true, kind: "type", mode: "edit", id, value: label === "—" ? "" : label });
  const setEntityModalValue = (value) => setEntityModal((prev) => ({ ...prev, value }));

  const handleCreateReportType = async (label) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const res = await reportBuilderApi.createReportType(trimmed);
    if (!res.success || !res.data) {
      toast.error(res.message || "Failed to create report type");
      return;
    }
    const newOption = { value: res.data.reportTypeID, label: res.data.typeName };
    setReportTypeOptions((prev) => (prev.some((o) => o.value === newOption.value) ? prev : [...prev, newOption]));
    setMaster((prev) => ({
      ...prev,
      reportType: prev.reportType.includes(newOption.value) ? prev.reportType : [...prev.reportType, newOption.value],
    }));
    toast.success(
      res.message === "Already Exists" ? `"${trimmed}" already exists — added to this report` : `Added "${trimmed}" as a report type`
    );
  };

  const handleSaveEntityModal = async () => {
    const trimmed = entityModal.value.trim();
    if (!trimmed) {
      toast.error(`Please enter a Report ${entityModal.kind === "head" ? "Head" : "Type"} name.`);
      return;
    }
    setSavingEntity(true);
    try {
      if (entityModal.kind === "type") {
        if (entityModal.mode === "edit") {
          const res = await reportBuilderApi.updateReportType(entityModal.id, trimmed);
          if (!res.success) {
            toast.error(res.message || "Failed to update Report Type");
            return;
          }
          setReportTypeOptions((prev) => prev.map((o) => (o.value === entityModal.id ? { ...o, label: trimmed } : o)));
          toast.success("Report Type updated");
        } else {
          await handleCreateReportType(trimmed);
        }
        setEntityModal({ visible: false, kind: "type", mode: "create", id: null, value: "" });
        return;
      }

      const res =
        entityModal.mode === "edit"
          ? await reportBuilderApi.updateReportHead(entityModal.id, trimmed)
          : await reportBuilderApi.createReportHead(trimmed);

      if (!res.success) {
        toast.error(res.message || "Failed to save Report Head");
        return;
      }

      if (entityModal.mode === "edit") {
        setReportHeadOptions((prev) => prev.map((o) => (o.value === entityModal.id ? { ...o, label: trimmed } : o)));
        toast.success("Report Head updated");
      } else {
        const newId = res.data?.reportHeadID;
        const newOption = { value: newId, label: res.data?.headName || trimmed };
        setReportHeadOptions((prev) => (prev.some((o) => o.value === newId) ? prev : [...prev, newOption]));
        setMasterField("reportHeadId", newId);
        toast.success(`Added "${trimmed}" as a Report Head`);
      }
      setEntityModal({ visible: false, kind: "head", mode: "create", id: null, value: "" });
      refreshTree();
    } finally {
      setSavingEntity(false);
    }
  };

  const [dataSource, setDataSource] = useState({ type: "Stored Procedure", sourceName: "", connection: "default" });
  const setDataSourceField = (name, value) => setDataSource((prev) => ({ ...prev, [name]: value }));

  const [paramRows, setParamRows] = useState([]);
  const onAddParam = () => {
    paramSeq += 1;
    setParamRows((prev) => [...prev, { id: `p-new-${paramSeq}`, spParameter: "@NewParam", bindFilter: "— Not Bound —", dataType: "Text", defaultValue: "" }]);
  };
  const onRemoveParam = (id) => setParamRows((prev) => prev.filter((r) => r.id !== id));
  const onUpdateParam = (id, field, value) => setParamRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const [introspecting, setIntrospecting] = useState(false);
  const onFetchParams = async () => {
    if (!dataSource.sourceName.trim()) {
      toast.error("Enter a Source Name first.");
      return;
    }
    setIntrospecting(true);
    try {
      const res = await reportBuilderApi.introspectDataSource({
        sourceType: dataSource.type,
        sourceName: dataSource.sourceName,
        connectionName: dataSource.connection,
      });
      if (!res.success) {
        toast.error(res.message || "Failed to introspect data source");
        return;
      }
      const params = (res.data?.parameters || []).map((p, idx) => {
        paramSeq += 1;
        return { id: `p-new-${paramSeq}`, spParameter: p.name, bindFilter: "— Not Bound —", dataType: p.dataType || "Text", defaultValue: "" };
      });
      const cols = (res.data?.columns || []).map((c, idx) => {
        columnSeq += 1;
        return {
          id: `c-new-${columnSeq}`, dbColumn: c.dbColumn, alias: c.dbColumn, displayName: c.dbColumn,
          visible: true, width: 120, align: "Left", dataType: c.dataType || "Text", dec: 0,
          group: false, sort: false, search: false, exportable: true, freeze: false, isFormula: false,
          formulaExpression: null, aggregateType: null, conditionalFormat: null,
        };
      });
      setParamRows(params);
      setColumnRows(cols);
      toast.success(`Found ${params.length} parameter(s) and ${cols.length} column(s) from ${dataSource.sourceName}`);
    } finally {
      setIntrospecting(false);
    }
  };

  const [columnRows, setColumnRows] = useState([]);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const onAddFormulaColumn = () => {
    columnSeq += 1;
    const id = `c-new-${columnSeq}`;
    setColumnRows((prev) => [...prev, { id, dbColumn: null, alias: "NewCol", displayName: "New Column", visible: true, width: 100, align: "Left", dataType: "Currency", dec: 2, group: false, sort: false, search: false, exportable: true, freeze: false, isFormula: true, formulaExpression: "", aggregateType: "Sum", conditionalFormat: "" }]);
    setSelectedColumnId(id);
  };
  const onRemoveColumn = (id) => setColumnRows((prev) => prev.filter((r) => r.id !== id));
  const onUpdateColumn = (id, field, value) => setColumnRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // Dropdown Source config (type/value/valueField/displayField) lives directly on
  // each filter row, not in one shared "currently being edited" state — otherwise
  // saving after editing one filter's source silently wipes every other filter's
  // source config (only the last-edited row would ever get written).
  const [filterRows, setFilterRows] = useState([]);
  const [selectedFilterId, setSelectedFilterId] = useState(null);
  const onAddFilter = () => {
    filterSeq += 1;
    setFilterRows((prev) => [
      ...prev,
      {
        id: `f-new-${filterSeq}`, seq: prev.length + 1, name: "New Filter", controlType: "Textbox",
        defaultSelection: "All", validation: "Optional", width: 150,
        dropdownSourceType: null, dropdownSourceValue: "", valueField: "", displayField: "",
      },
    ]);
  };
  const onRemoveFilter = (id) => setFilterRows((prev) => prev.filter((r) => r.id !== id));
  const onUpdateFilter = (id, field, value) => setFilterRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const [previewFilters, setPreviewFilters] = useState({
    fromDate: new Date(),
    toDate: new Date(),
    centre: "noida-ho",
    department: "all",
    paymentMode: "all",
  });
  const setPreviewFilterField = (name, value) => setPreviewFilters((prev) => ({ ...prev, [name]: value }));
  const previewFiltersWithLabels = useMemo(
    () => ({
      ...previewFilters,
      fromDateLabel: previewFilters.fromDate ? moment(previewFilters.fromDate).format("DD-MMM-YYYY") : "",
      toDateLabel: previewFilters.toDate ? moment(previewFilters.toDate).format("DD-MMM-YYYY") : "",
    }),
    [previewFilters]
  );

  const [printSetup, setPrintSetup] = useState(defaultPrintSetup);
  const setPrintRootField = (name, value) => setPrintSetup((prev) => ({ ...prev, [name]: value }));
  const toggleElement = (key) => setPrintSetup((prev) => ({ ...prev, elements: { ...prev.elements, [key]: !prev.elements[key] } }));
  const toggleExcel = (key) => setPrintSetup((prev) => ({ ...prev, excel: { ...prev.excel, [key]: !prev.excel[key] } }));
  const toggleAllowedFormat = (key) =>
    setPrintSetup((prev) => ({
      ...prev,
      allowedFormats: prev.allowedFormats.includes(key)
        ? prev.allowedFormats.filter((f) => f !== key)
        : [...prev.allowedFormats, key],
    }));

  const [securityRoles, setSecurityRoles] = useState(initialSecurityRoles);
  const [activeScope, setActiveScope] = useState("role");
  const onToggleRoleField = (id, field) =>
    setSecurityRoles((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: !r[field] } : r)));

  const [schedule, setSchedule] = useState(defaultSchedule);
  const setScheduleField = (name, value) => setSchedule((prev) => ({ ...prev, [name]: value }));

  const [version, setVersion] = useState(1);
  const [publishStatus, setPublishStatus] = useState("Draft");
  const [lastSavedLabel, setLastSavedLabel] = useState("—");
  const [modifiedOn, setModifiedOn] = useState("—");
  const [auditEntries, setAuditEntries] = useState([]);
  const [auditVisible, setAuditVisible] = useState(false);

  // ---------- API-backed data loading ----------

  const loadLookups = async () => {
    const [headsRes, typesRes] = await Promise.all([
      reportBuilderApi.getReportHeads(),
      reportBuilderApi.getReportTypes(),
    ]);
    if (headsRes.success) {
      setReportHeadOptions((headsRes.data || []).map((h) => ({ value: h.reportHeadID ?? h.ReportHeadID, label: h.headName ?? h.HeadName })));
    } else {
      toast.error(headsRes.message || "Failed to load report heads");
    }
    if (typesRes.success) {
      setReportTypeOptions((typesRes.data || []).map((t) => ({ value: t.reportTypeID ?? t.ReportTypeID, label: t.typeName ?? t.TypeName })));
    }
  };

  const refreshTree = async () => {
    const treeRes = await reportBuilderApi.getReportTree();
    if (!treeRes.success) {
      toast.error(treeRes.message || "Failed to load report list");
      return [];
    }
    const mappedTree = mapReportTree(treeRes.data);
    setTreeData(mappedTree);
    return mappedTree;
  };

  const handleSelectLeaf = async (leaf) => {
    setSelectedReportId(leaf.id);
    setActiveTab("master");

    const res = await reportBuilderApi.getReportDetail(leaf.id);
    if (!res.success || !res.data) {
      toast.error(res.message || "Failed to load report");
      return;
    }
    const d = res.data;
    const m = d.master || {};

    setMaster({
      reportName: m.reportName || "",
      reportCode: m.reportCode || "",
      reportHeadId: m.reportHeadID ?? null,
      reportType: m.reportTypeIDs || d.reportTypeIDs || [],
      displaySequence: m.displaySequence ?? 0,
      description: m.description || "",
      icon: m.icon || "chart",
      active: m.isActive ?? true,
    });
    setVersion(m.version || 1);
    setPublishStatus(m.status || "Draft");

    const ds = d.dataSource || {};
    setDataSource({
      type: ds.sourceType || "Stored Procedure",
      sourceName: ds.sourceName || "",
      connection: ds.connectionName || "default",
    });

    setParamRows(
      (d.parameters || []).map((p, idx) => ({
        id: p.parameterMappingID || `p-new-${idx}`,
        spParameter: p.spParameter || "",
        bindFilter: p.bindFilterName || "— Not Bound —",
        dataType: p.dataType || "Text",
        defaultValue: p.defaultValue || "",
      }))
    );

    const cols = mapColumns(d.columns);
    setColumnRows(cols.length ? cols : initialColumnRows);
    setSelectedColumnId(cols.find((c) => c.isFormula)?.id || null);

    const filters = (d.filters || []).map((f, idx) => ({
      id: f.filterID || `f-new-${idx}`,
      seq: f.seq ?? idx + 1,
      name: f.filterName || "",
      controlType: f.controlType || "Textbox",
      dropdownSourceType: f.dropdownSourceType || null,
      dropdownSourceValue: f.dropdownSourceValue || "",
      valueField: f.valueField || "",
      displayField: f.displayField || "",
      defaultSelection: f.defaultSelection || "All",
      validation: f.validation || "Optional",
      width: f.width ?? 150,
    }));
    setFilterRows(filters.length ? filters : initialFilterRows);
    setSelectedFilterId(filters[0]?.id || null);

    const ps = d.printSetup;
    setPrintSetup(
      ps
        ? {
            allowedFormats: ps.allowedFormats?.length ? ps.allowedFormats : ["PDF", "Excel", "CSV", "Print"],
            orientation: ps.orientation,
            paperSize: ps.paperSize,
            headerHeight: ps.headerHeight,
            footerHeight: ps.footerHeight,
            font: ps.font,
            fontSize: ps.fontSize,
            currencySymbol: ps.currencySymbol,
            decimalPrecision: ps.decimalPrecision,
            watermark: ps.watermark || "",
            headerBgColor: ps.headerBgColor,
            csvDelimiter: ps.csvDelimiter,
            encoding: ps.encoding,
            elements: {
              companyLogo: !!ps.showCompanyLogo, companyName: !!ps.showCompanyName, address: !!ps.showAddress, gst: !!ps.showGST,
              phoneEmail: !!ps.showPhoneEmail, website: !!ps.showWebsite, selectionCriteria: !!ps.showSelectionCriteria,
              printedBy: !!ps.showPrintedBy, printDateTime: !!ps.showPrintDateTime, pageXY: !!ps.showPageXY,
              grandTotal: !!ps.showGrandTotal, pageTotal: !!ps.showPageTotal, altRowColor: !!ps.showAltRowColor,
              pageBorder: !!ps.showPageBorder, confidentialFooter: !!ps.showConfidentialFooter,
            },
            excel: {
              freezeHeader: !!ps.excelFreezeHeader, freezeFirstColumn: !!ps.excelFreezeFirstColumn, autoFilter: !!ps.excelAutoFilter,
              autoWidth: !!ps.excelAutoWidth, wrapText: !!ps.excelWrapText, currencyFormat: !!ps.excelCurrencyFormat,
              conditionalFormatting: !!ps.excelConditionalFormatting, formulaSupport: !!ps.excelFormulaSupport, pivotCompatible: !!ps.excelPivotCompatible,
            },
          }
        : defaultPrintSetup
    );

    const roles = (d.securityRoles || []).map((r) => ({
      id: r.securityRoleID,
      role: r.roleName,
      allow: !!r.allowAccess,
      view: !!r.canView,
      export: !!r.canExport,
      schedule: !!r.canSchedule,
      drillDown: !!r.canDrillDown,
    }));
    setSecurityRoles(roles.length ? roles : initialSecurityRoles);

    const sch = d.schedule;
    setSchedule(
      sch
        ? { enabled: !!sch.isEnabled, frequency: sch.frequency, time: sch.scheduleTime || "", format: sch.exportFormat, recipients: sch.recipients || "" }
        : defaultSchedule
    );
  };

  useEffect(() => {
    (async () => {
      await loadLookups();
      const mappedTree = await refreshTree();
      const firstLeaf = mappedTree.flatMap((g) => g.items)[0];
      if (firstLeaf) {
        handleSelectLeaf(firstLeaf);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Actions ----------

  const handleAddNewReport = () => {
    setSelectedReportId(null);
    setMaster(blankMaster(reportHeadOptions));
    setDataSource({ type: "Stored Procedure", sourceName: "", connection: "default" });
    setParamRows([]);
    setColumnRows([]);
    setSelectedColumnId(null);
    setFilterRows([]);
    setSelectedFilterId(null);
    setPrintSetup(defaultPrintSetup);
    setSecurityRoles(initialSecurityRoles.map((r) => ({ ...r, allow: false, view: false, export: false, schedule: false, drillDown: false })));
    setSchedule(defaultSchedule);
    setVersion(1);
    setPublishStatus("Draft");
    setActiveTab("master");
    toast.info("Fill in the details below and Save to create a new report.");
    suggestDisplaySequence(reportHeadOptions[0]?.value ?? null);
  };

  const handleSave = async () => {
    if (!master.reportName.trim() || !master.reportCode.trim()) {
      toast.error("Report Name and Report Code are required.");
      return;
    }
    if (!master.reportHeadId) {
      toast.error("Please select a Report Head.");
      return;
    }

    setSaving(true);
    try {
      const masterRes = await reportBuilderApi.saveReportMaster({
        reportID: selectedReportId || 0,
        reportName: master.reportName,
        reportCode: master.reportCode,
        reportHeadID: master.reportHeadId,
        reportTypeIDs: master.reportType,
        displaySequence: Number(master.displaySequence) || 0,
        description: master.description,
        icon: master.icon,
        isActive: master.active,
      });

      if (!masterRes.success) {
        toast.error(masterRes.message || "Failed to save report");
        return;
      }

      const reportId = masterRes.data?.reportID ?? selectedReportId;
      setSelectedReportId(reportId);
      setVersion(masterRes.data?.version || version);

      await Promise.all([
        reportBuilderApi.saveDataSource({
          reportID: reportId,
          sourceType: dataSource.type,
          sourceName: dataSource.sourceName,
          connectionName: dataSource.connection,
        }),
        reportBuilderApi.saveParameterMapping(
          reportId,
          paramRows.map((p) => ({
            spParameter: p.spParameter,
            bindFilterName: p.bindFilter === "— Not Bound —" ? null : p.bindFilter,
            dataType: p.dataType,
            defaultValue: p.defaultValue,
          }))
        ),
        reportBuilderApi.saveColumns(
          reportId,
          columnRows.map((c) => ({
            dbColumn: c.isFormula ? null : c.dbColumn,
            alias: c.alias,
            displayName: c.displayName,
            isVisible: c.visible,
            width: Number(c.width) || 0,
            align: c.align,
            dataType: c.dataType,
            decimalPlaces: Number(c.dec) || 0,
            isGroup: c.group,
            isSort: c.sort,
            isSearch: c.search,
            isExport: c.exportable,
            isFreeze: c.freeze,
            isFormula: c.isFormula,
            formulaExpression: c.isFormula ? c.formulaExpression : null,
            aggregateType: c.isFormula ? c.aggregateType : null,
            conditionalFormat: c.isFormula ? c.conditionalFormat : null,
          }))
        ),
        reportBuilderApi.saveFilters(
          reportId,
          filterRows.map((f) => ({
            seq: Number(f.seq) || 0,
            filterName: f.name,
            controlType: f.controlType,
            dropdownSourceType: f.dropdownSourceType || null,
            dropdownSourceValue: f.dropdownSourceValue || "",
            valueField: f.valueField || null,
            displayField: f.displayField || null,
            defaultSelection: f.defaultSelection,
            validation: f.validation,
            width: Number(f.width) || 0,
          }))
        ),
        reportBuilderApi.savePrintSetup({
          reportID: reportId,
          allowedFormats: printSetup.allowedFormats,
          orientation: printSetup.orientation,
          paperSize: printSetup.paperSize,
          headerHeight: Number(printSetup.headerHeight) || 0,
          footerHeight: Number(printSetup.footerHeight) || 0,
          font: printSetup.font,
          fontSize: Number(printSetup.fontSize) || 0,
          currencySymbol: printSetup.currencySymbol,
          decimalPrecision: Number(printSetup.decimalPrecision) || 0,
          watermark: printSetup.watermark,
          headerBgColor: printSetup.headerBgColor,
          showCompanyLogo: printSetup.elements.companyLogo,
          showCompanyName: printSetup.elements.companyName,
          showAddress: printSetup.elements.address,
          showGST: printSetup.elements.gst,
          showPhoneEmail: printSetup.elements.phoneEmail,
          showWebsite: printSetup.elements.website,
          showSelectionCriteria: printSetup.elements.selectionCriteria,
          showPrintedBy: printSetup.elements.printedBy,
          showPrintDateTime: printSetup.elements.printDateTime,
          showPageXY: printSetup.elements.pageXY,
          showGrandTotal: printSetup.elements.grandTotal,
          showPageTotal: printSetup.elements.pageTotal,
          showAltRowColor: printSetup.elements.altRowColor,
          showPageBorder: printSetup.elements.pageBorder,
          showConfidentialFooter: printSetup.elements.confidentialFooter,
          excelFreezeHeader: printSetup.excel.freezeHeader,
          excelFreezeFirstColumn: printSetup.excel.freezeFirstColumn,
          excelAutoFilter: printSetup.excel.autoFilter,
          excelAutoWidth: printSetup.excel.autoWidth,
          excelWrapText: printSetup.excel.wrapText,
          excelCurrencyFormat: printSetup.excel.currencyFormat,
          excelConditionalFormatting: printSetup.excel.conditionalFormatting,
          excelFormulaSupport: printSetup.excel.formulaSupport,
          excelPivotCompatible: printSetup.excel.pivotCompatible,
          csvDelimiter: printSetup.csvDelimiter,
          encoding: printSetup.encoding,
        }),
        reportBuilderApi.saveSecurityRoles(
          reportId,
          securityRoles.map((r) => ({
            roleID: null,
            roleName: r.role,
            allowAccess: r.allow,
            canView: r.view,
            canExport: r.export,
            canSchedule: r.schedule,
            canDrillDown: r.drillDown,
          }))
        ),
        reportBuilderApi.saveSchedule({
          reportID: reportId,
          isEnabled: schedule.enabled,
          frequency: schedule.frequency,
          scheduleTime: schedule.time,
          exportFormat: schedule.format,
          recipients: schedule.recipients,
        }),
      ]);

      setLastSavedLabel("just now");
      setModifiedOn(moment().format("DD-MMM-YYYY HH:mm"));
      toast.success("Report saved successfully");

      await refreshTree();
    } finally {
      setSaving(false);
    }
  };

  const handleClone = async () => {
    if (!selectedReportId) {
      toast.error("Save the report before cloning.");
      return;
    }
    const res = await reportBuilderApi.cloneReport(selectedReportId);
    if (!res.success) {
      toast.error(res.message || "Failed to clone report");
      return;
    }
    toast.success("Report cloned as a new draft");
    const mappedTree = await refreshTree();
    const newLeaf = mappedTree.flatMap((g) => g.items).find((it) => it.id === res.data?.reportID);
    if (newLeaf) handleSelectLeaf(newLeaf);
  };

  const handlePublishToggle = async () => {
    if (!selectedReportId) {
      toast.error("Save the report first.");
      return;
    }
    const res =
      publishStatus === "Published"
        ? await reportBuilderApi.unpublishReport(selectedReportId)
        : await reportBuilderApi.publishReport(selectedReportId);

    if (!res.success) {
      toast.error(res.message || "Failed to update status");
      return;
    }
    setPublishStatus((prev) => (prev === "Published" ? "Draft" : "Published"));
    toast.success(res.message);
    refreshTree();
  };

  const handleOpenAuditTrail = async () => {
    if (!selectedReportId) {
      setAuditEntries([]);
      setAuditVisible(true);
      return;
    }
    const res = await reportBuilderApi.getAuditTrail(selectedReportId);
    setAuditEntries(
      res.success
        ? (res.data || []).map((e) => {
            const version = e.version ?? e.Version ?? "";
            const modifiedByName = e.modifiedByName ?? e.ModifiedByName;
            const modifiedBy = modifiedByName ?? (e.modifiedBy ?? e.ModifiedBy ? `User #${e.modifiedBy ?? e.ModifiedBy}` : "");
            const rawDate = e.modifiedDate?.value ?? e.ModifiedDate?.value ?? e.modifiedDate ?? e.ModifiedDate ?? null;
            const date = rawDate ? moment(rawDate).format("DD-MMM-YYYY HH:mm") : "";
            const change = e.changeSummary ?? e.ChangeSummary ?? "";
            return { version: `v${version}`, modifiedBy, date, change };
          })
        : []
    );
    setAuditVisible(true);
  };

  const tabs = [
    { id: "master", label: <><span className="rb-tab-n">1</span> Report Master</>, content: (
        <ReportMasterTab
          master={master}
          setField={setMasterField}
          reportHeadOptions={reportHeadOptions}
          reportTypeOptions={reportTypeOptions}
          onReportHeadChange={handleReportHeadChange}
          onAddReportHead={openAddReportHead}
          onEditReportHead={openEditReportHead}
          onAddReportType={openAddReportType}
          onEditReportType={openEditReportType}
        />
      ) },
    { id: "datasource", label: <><span className="rb-tab-n">2</span> Data Source</>, content: (
        <DataSourceTab
          dataSource={dataSource}
          setDataSourceField={setDataSourceField}
          paramRows={paramRows}
          onAddParam={onAddParam}
          onRemoveParam={onRemoveParam}
          onUpdateParam={onUpdateParam}
          onFetchParams={onFetchParams}
          fetchingParams={introspecting}
        />
      ) },
    { id: "columns", label: <><span className="rb-tab-n">3</span> Columns</>, content: (
        <ColumnsTab
          columnRows={columnRows}
          onAddFormulaColumn={onAddFormulaColumn}
          onRemoveColumn={onRemoveColumn}
          onUpdateColumn={onUpdateColumn}
          selectedColumnId={selectedColumnId}
          onSelectColumnRow={setSelectedColumnId}
        />
      ) },
    { id: "filters", label: <><span className="rb-tab-n">4</span> Filters</>, content: (
        <FiltersTab
          reportId={selectedReportId}
          filterRows={filterRows}
          onAddFilter={onAddFilter}
          onRemoveFilter={onRemoveFilter}
          onUpdateFilter={onUpdateFilter}
          selectedFilterId={selectedFilterId}
          onSelectFilterRow={setSelectedFilterId}
          onViewReport={() => setActiveTab("preview")}
        />
      ) },
    { id: "print", label: <><span className="rb-tab-n">5</span> Print Setup</>, content: (
        <PrintSetupTab
          printSetup={printSetup}
          setPrintRootField={setPrintRootField}
          toggleElement={toggleElement}
          toggleExcel={toggleExcel}
          toggleAllowedFormat={toggleAllowedFormat}
          master={master}
          previewFilters={previewFiltersWithLabels}
          previewRecords={previewRecords}
        />
      ) },
    { id: "security", label: <><span className="rb-tab-n">6</span> Security</>, content: (
        <SecurityTab
          securityRoles={securityRoles}
          onToggleRoleField={onToggleRoleField}
          activeScope={activeScope}
          setActiveScope={setActiveScope}
          schedule={schedule}
          setScheduleField={setScheduleField}
        />
      ) },
    { id: "preview", label: <><span className="rb-tab-n">7</span> Preview</>, content: (
        <PreviewTab
          reportId={selectedReportId}
          reportName={master.reportName}
          filterRows={filterRows}
          columnRows={columnRows}
          printSetup={printSetup}
        />
      ) },
  ];

  return (
    <div className="rb-scope" style={themeStyle}>
      <div className="rb-wrap">
        <ReportExplorer
          treeData={treeData}
          setTreeData={setTreeData}
          selectedId={selectedReportId}
          onSelectLeaf={handleSelectLeaf}
          onAddNew={handleAddNewReport}
        />

        <div className="rb-main">
          <div className="rb-strip">
            <h2>{master.reportName || "Untitled Report"}</h2>
            {master.reportCode && <span className="rb-code">{master.reportCode}</span>}
            <span className={`rb-badge${publishStatus === "Published" ? " live" : ""}`}>{publishStatus} · v{version}</span>
            <span className="rb-mode-badge dev">⚙ Developer Mode</span>
            <div className="rb-acts">
              <CustomButton text="User Mode" icon="user" variant="secondary" onClick={() => navigate("/ReportViewer")} />
              <CustomButton text="Clone" icon="copy" variant="secondary" onClick={handleClone} />
              <CustomButton text="Audit Trail" icon="history" variant="secondary" onClick={handleOpenAuditTrail} />
              <CustomButton text="Preview" icon="eye" variant="secondary" className="rb-navy" onClick={() => setActiveTab("preview")} />
              <CustomButton
                text={publishStatus === "Published" ? "Unpublish" : "Publish"}
                icon={publishStatus === "Published" ? "back" : "check"}
                variant={publishStatus === "Published" ? "warning" : "success"}
                onClick={handlePublishToggle}
              />
              <SaveButton text="Save" onClick={handleSave} disabled={saving} loading={saving} />
            </div>
          </div>

          <CustomTabs tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} className="rb-body" />

          <div className="rb-footbar">
            <span className="rb-ok">● Auto-saved {lastSavedLabel}</span>
            <span>Version {version} · Modified {modifiedOn}</span>
            <span className="rb-right">LabRox LIMS 9.0 · Powered By LabRox</span>
          </div>
        </div>
      </div>

      <Modal
        visible={auditVisible}
        setVisible={setAuditVisible}
        Header={`Audit Trail — ${master.reportName}`}
        modalWidth="640px"
      >
        <div className="rb-audit-grid">
          <div className="rb-audit-row rb-audit-head-row">
            <div>Version</div><div>Modified By</div><div>Date</div><div>Change Summary</div>
          </div>
          {auditEntries.length === 0 && (
            <div className="rb-audit-row"><div style={{ gridColumn: "1 / -1" }}>No audit history yet.</div></div>
          )}
          {auditEntries.map((e, idx) => (
            <div className="rb-audit-row" key={idx}>
              <div>{e.version}</div><div>{e.modifiedBy}</div><div>{e.date}</div><div>{e.change}</div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        visible={entityModal.visible}
        setVisible={(v) => setEntityModal((prev) => ({ ...prev, visible: v }))}
        Header={`${entityModal.mode === "edit" ? "Edit" : "Create"} Report ${entityModal.kind === "head" ? "Head" : "Type"}`}
        modalWidth="420px"
        buttons={
          <>
            <CancelButton text="Cancel" onClick={() => setEntityModal((prev) => ({ ...prev, visible: false }))} disabled={savingEntity} />
            <SaveButton text={entityModal.mode === "edit" ? "Update" : "Create"} onClick={handleSaveEntityModal} loading={savingEntity} disabled={savingEntity} />
          </>
        }
      >
        <div className="rb-head-modal-fg">
          <label>Report {entityModal.kind === "head" ? "Head" : "Type"} Name <span className="rb-req">*</span></label>
          <Input
            id="rbEntityModalName"
            name="entityName"
            type="text"
            value={entityModal.value}
            onChange={(e) => setEntityModalValue(e.target.value)}
            removeFormGroupClass
          />
        </div>
      </Modal>
    </div>
  );
};

export default ReportBuilder;
