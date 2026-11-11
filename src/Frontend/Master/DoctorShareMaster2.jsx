import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import CustomTabs from "../../components/UI/CustomTabs";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Modal from "@app/components/formComponent/Modal";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { number } from "../../utils/helpers";
import { Record } from "../../utils/Constants";
import Pagination from "../../Pagination/Pagination";
import DoctorShareTransferModal2 from "../utils/DoctorShareTransferModal2";
import DoctorShareImportExportModal2 from "./DoctorShareImportExportModal2";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";

const emptyConfig = {
  AllowNegativeShare: 0,
  BlockCreditPatientShare: 0,
  AllowSharing: 1,
  AllowRateTypeWiseShare: 0,
  AllowCentreWiseDoctor: 0,
  DiscountBearBy: "Both",
  ShareCalculateOn: "Gross",
  RateTypeID: "0",
  RateTypeName: "STANDARD",
};

const apiVal = (obj, ...keys) => {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
};

const reportNum = (row, ...keys) => Number(apiVal(row, ...keys) || 0);

const fmtQty = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const fmtAmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const parseAmtPer = (raw) => {
  const s = String(raw ?? "");
  const amt = s.match(/Amt:(-?\d+(?:\.\d+)?)/i);
  const per = s.match(/Per:(-?\d+(?:\.\d+)?)/i);
  if (amt || per) {
    return { amt: amt ? amt[1] : "", per: per ? per[1] : "" };
  }
  return { amt: "", per: "" };
};

const auditShareCells = (item) => {
  const oldParsed = parseAmtPer(apiVal(item, "oldValue", "OldValue"));
  const newParsed = parseAmtPer(apiVal(item, "newValue", "NewValue"));
  const prevAmt = apiVal(item, "oldShareAmt", "OldShareAmt", "prevAmount", "PrevAmount");
  const currAmt = apiVal(item, "newShareAmt", "NewShareAmt", "currentAmount", "CurrentAmount");
  const prevPer = apiVal(item, "oldSharePer", "OldSharePer", "prevPer", "PrevPer");
  const currPer = apiVal(item, "newSharePer", "NewSharePer", "currentPer", "CurrentPer");
  return {
    prevAmt: prevAmt ?? oldParsed.amt,
    currAmt: currAmt ?? newParsed.amt,
    prevPer: prevPer ?? oldParsed.per,
    currPer: currPer ?? newParsed.per,
  };
};

const fmtAuditNum = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const n = Number(value);
  return Number.isNaN(n) ? String(value) : fmtAmt(n);
};

const DoctorShareMaster2 = () => {
  const { t } = useTranslation();
  const [activeScreen, setActiveScreen] = useState("share");
  const [shareTab, setShareTab] = useState("Department");
  const [shareMode, setShareMode] = useState("master");
  const [config, setConfig] = useState(emptyConfig);
  const [configDraft, setConfigDraft] = useState(emptyConfig);
  const [rateTypes, setRateTypes] = useState([]);
  const [doctorData, setDoctorData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [centreData, setCentreData] = useState([]);
  const [doctorID, setDoctorID] = useState("0");
  const [departmentID, setDepartmentID] = useState("");
  // Rate Type / Centre pickers on the Set Doctor Share tab: only rendered when the
  // matching configuration key is enabled, otherwise the screen keeps working exactly
  // as before (configured rate type, full doctor list).
  const [shareRateTypeID, setShareRateTypeID] = useState("");
  const [shareCentreID, setShareCentreID] = useState("");
  const [shareCentreDoctors, setShareCentreDoctors] = useState([]);
  const [reportCentreDoctors, setReportCentreDoctors] = useState([]);
  const [deptTable, setDeptTable] = useState([]);
  const [itemTable, setItemTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [auditRows, setAuditRows] = useState([]);
  const [auditFilter, setAuditFilter] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRows, setReportRows] = useState([]);
  const [reportFilter, setReportFilter] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    DoctorID: "",
    DepartmentID: "",
    CentreID: [],
    ReportView: "Doctor",
  });

  const allowNegative = Number(config.AllowNegativeShare) === 1;
  const allowRateTypeWise = Number(config.AllowRateTypeWiseShare) === 1;
  const allowCentreWiseDoctor = Number(config.AllowCentreWiseDoctor) === 1;
  const effectiveDoctorID = shareMode === "doctor" ? doctorID : "0";
  // Every read/write on the Set Doctor Share tab is scoped to this rate type. With the
  // flag off it is always the configured one, so behaviour is unchanged.
  const effectiveRateTypeID = allowRateTypeWise
    ? shareRateTypeID || config.RateTypeID || "0"
    : config.RateTypeID || "0";
  const rateTypeNameOf = (id) =>
    rateTypes.find((r) => String(r.value) === String(id))?.label || "";
  const rateTypeLabel =
    rateTypeNameOf(config.RateTypeID) || config?.RateTypeName || "STANDARD";
  const effectiveRateTypeLabel =
    rateTypeNameOf(effectiveRateTypeID) || rateTypeLabel;
  const rateBadge = `Rate Type: ${rateTypeLabel}`;
  const shareDoctorOptions = allowCentreWiseDoctor
    ? [{ label: t("Select Doctor"), value: "" }, ...shareCentreDoctors]
    : doctorData;
  const reportDoctorOptions = [
    { label: t("All Doctors"), value: "" },
    ...(allowCentreWiseDoctor
      ? reportCentreDoctors
      : doctorData.filter((d) => d.value)),
  ];

  const mapRateTypes = (list) =>
    (list || [])
      .map((ele) => ({
        value: String(
          apiVal(ele, "rateTypeID", "RateTypeID", "centreID", "CentreID", "value") ?? "",
        ),
        label:
          apiVal(
            ele,
            "rateTypeName",
            "RateTypeName",
            "centre",
            "Centre",
            "rate",
            "Rate",
            "label",
          ) || "",
      }))
      .filter((ele) => ele.value);

  const applyRateTypeName = (cfg, options = rateTypes) => {
    const match = options.find(
      (r) => String(r.value) === String(cfg.RateTypeID),
    );
    return {
      ...cfg,
      RateTypeName: match?.label || cfg.RateTypeName || "STANDARD",
    };
  };

  const loadRateTypes = () => {
    axiosInstance
      .post("Accounts/GetRateTypeByGlobalCentre", { TypeId: "" })
      .then((res) => {
        let options = mapRateTypes(res?.data?.message);
        if (options.length) {
          setRateTypes(options);
          return;
        }
        return axiosInstance.get("Centre/getRateList").then((rateRes) => {
          options = mapRateTypes(rateRes?.data?.message);
          setRateTypes(options);
        });
      })
      .catch(() => {
        axiosInstance
          .get("Centre/getRateList")
          .then((res) => setRateTypes(mapRateTypes(res?.data?.message)))
          .catch(() => setRateTypes([]));
      });
  };

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return itemTable.slice(start, start + pageSize);
  }, [itemTable, currentPage, pageSize]);

  const loadConfig = () => {
    axiosInstance
      .post("DoctorShareMaster2/GetConfig")
      .then((res) => {
        const data = res?.data?.message || emptyConfig;
        const next = {
          AllowNegativeShare: Number(apiVal(data, "allowNegativeShare", "AllowNegativeShare")) || 0,
          BlockCreditPatientShare:
            Number(apiVal(data, "blockCreditPatientShare", "BlockCreditPatientShare")) || 0,
          AllowSharing:
            Number(apiVal(data, "allowSharing", "AllowSharing") ?? 1) === 0 ? 0 : 1,
          AllowRateTypeWiseShare:
            Number(
              apiVal(data, "allowRateTypeWiseShare", "AllowRateTypeWiseShare"),
            ) || 0,
          AllowCentreWiseDoctor:
            Number(
              apiVal(data, "allowCentreWiseDoctor", "AllowCentreWiseDoctor"),
            ) || 0,
          DiscountBearBy: apiVal(data, "discountBearBy", "DiscountBearBy") || "Both",
          ShareCalculateOn: apiVal(data, "shareCalculateOn", "ShareCalculateOn") || "Gross",
          RateTypeID: String(apiVal(data, "rateTypeID", "RateTypeID") ?? "0"),
          RateTypeName: apiVal(data, "rateTypeName", "RateTypeName") || "STANDARD",
        };
        const named = applyRateTypeName(next);
        setConfig(named);
        setConfigDraft(named);
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Unable to load configuration")),
      );
  };

  const bindDoctors = () => {
    axiosInstance
      .post("DoctorReferal/getDoctorDataBind?centreId=0")
      .then((res) => {
        const val = res?.data?.message?.map((ele) => ({
          label: `${ele?.DoctorID} - ${ele?.DoctorName}`,
          value: String(ele?.DoctorID),
        })) || [];
        val.unshift({ label: t("Select Doctor"), value: "" });
        setDoctorData(val);
      })
      .catch(() => setDoctorData([]));
  };

  // Doctors tagged to a centre (doctorreferalaccesscentre). Used only when
  // AllowCentreWiseDoctor is enabled.
  const fetchCentreDoctors = (centreId) =>
    axiosInstance
      .get("DoctorReferal/GetDoctorMappings", {
        params: { datatype: "Centre", centreId },
      })
      .then((res) => (Array.isArray(res?.data?.message) ? res.data.message : []))
      .catch(() => []);

  const toDoctorOptions = (rows) => {
    const seen = new Set();
    const options = [];
    (rows || []).forEach((ele) => {
      const id = String(apiVal(ele, "DoctorId", "doctorId", "DoctorID") ?? "");
      if (!id || seen.has(id)) return;
      seen.add(id);
      const name = apiVal(ele, "Name", "name", "DoctorName") || "";
      options.push({ label: `${id} - ${name}`, value: id });
    });
    return options.sort((a, b) => a.label.localeCompare(b.label));
  };

  const getDepartments = () => {
    axiosInstance
      .get("Department/getDepartmentData")
      .then((res) => {
        setDepartmentData(
          (res.data.message || []).map((ele) => ({
            value: String(ele.DepartmentID),
            label: ele.Department,
          })),
        );
      })
      .catch(() => setDepartmentData([]));
  };

  const handleDepartmentSearch = (silent = false) => {
    if (shareMode === "doctor" && !doctorID) {
      if (!silent) toast.warning(t("Please select Doctor"));
      return;
    }
    setLoading(true);
    axiosInstance
      .post("DoctorShareMaster2/GetDepartmentShare", {
        searchType: "1",
        DoctorID: shareMode === "doctor" ? doctorID || "0" : "0",
        RateTypeID: effectiveRateTypeID,
        CentreID: "0",
        DepartmentID: "0",
      })
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        setDeptTable(
          data.map((ele) => ({
            ...ele,
            DepartmentID: apiVal(ele, "departmentID", "DepartmentID"),
            Department: apiVal(ele, "department", "Department"),
            DocSharePer: apiVal(ele, "docSharePer", "DocSharePer") ?? 0,
          })),
        );
      })
      .catch((err) => {
        if (!silent) {
          toast.error(err?.response?.data?.message || t("Error Occured"));
        }
        setDeptTable([]);
      })
      .finally(() => setLoading(false));
  };

  const handleItemSearch = () => {
    if (shareMode === "doctor" && !doctorID) {
      toast.warning(t("Please select Doctor"));
      return;
    }
    if (!departmentID) {
      toast.warning(t("Please select Department"));
      return;
    }
    setLoading(true);
    axiosInstance
      .post("DoctorShareMaster2/GetItemShare", {
        DoctorID: effectiveDoctorID || "0",
        DepartmentID: departmentID,
        RateTypeID: effectiveRateTypeID,
        CentreID: "0",
        ItemID: "0",
        BillingCategoryID: "0",
      })
      .then((res) => {
        const data = res?.data?.message || [];
        if (!data.length) toast.info(t("no data found"));
        setItemTable(
          data.map((ele) => ({
            ...ele,
            InvestigationID: apiVal(ele, "investigationID", "InvestigationID"),
            TestCode: apiVal(ele, "testCode", "TestCode"),
            InvestigationName: apiVal(
              ele,
              "investigationName",
              "InvestigationName",
              "testName",
              "TestName",
            ),
            Rate: apiVal(ele, "rate", "Rate") ?? 0,
            isChecked: false,
            DocShareAmt: apiVal(ele, "docShareAmt", "DocShareAmt") ?? 0,
            DocSharePer: apiVal(ele, "docSharePer", "DocSharePer") ?? 0,
          })),
        );
        setCurrentPage(1);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Error Occured"));
        setItemTable([]);
      })
      .finally(() => setLoading(false));
  };

  const saveDepartment = () => {
    if (shareMode === "doctor" && !doctorID) {
      toast.warning(t("Please select Doctor"));
      return;
    }
    if (
      !allowNegative &&
      deptTable.some((ele) => Number(ele.DocSharePer) < 0)
    ) {
      toast.error(t("Negative share is not allowed"));
      return;
    }
    setSaving(true);
    axiosInstance
      .post("DoctorShareMaster2/SaveDepartmentShare", {
        RateTypeID: effectiveRateTypeID,
        DoctorID: effectiveDoctorID || "0",
        Data: deptTable.map((ele) => ({
          DepartmentID: ele.DepartmentID,
          Department: ele.Department,
          DocSharePer: Number(ele?.DocSharePer) || 0,
        })),
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Record Saved Successfully"));
        handleDepartmentSearch();
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Something went wrong")),
      )
      .finally(() => setSaving(false));
  };

  const saveItems = () => {
    const selected = itemTable.filter((ele) => ele.isChecked);
    if (!selected.length) {
      toast.warning(t("Please select at least one item"));
      return;
    }
    if (
      !allowNegative &&
      selected.some(
        (ele) => Number(ele.DocSharePer) < 0 || Number(ele.DocShareAmt) < 0,
      )
    ) {
      toast.error(t("Negative share is not allowed"));
      return;
    }
    setSaving(true);
    axiosInstance
      .post("DoctorShareMaster2/SaveItemShare", {
        RateTypeID: effectiveRateTypeID,
        CentreID: "0",
        DoctorID: effectiveDoctorID || "0",
        DepartmentID: departmentID,
        IsInclude: 1,
        Data: selected.map((ele) => ({
          InvestigationID: ele.InvestigationID,
          InvestigationName: ele.InvestigationName,
          TestCode: ele.TestCode,
          Rate: ele.Rate || 0,
          DocShareAmt: ele?.DocShareAmt || "0",
          DocSharePer: ele?.DocSharePer || "0",
          isChecked: true,
        })),
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Record Saved Successfully"));
        handleItemSearch();
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Something went wrong")),
      )
      .finally(() => setSaving(false));
  };

  const saveConfig = () => {
    if (
      configDraft.RateTypeID === "" ||
      configDraft.RateTypeID == null ||
      !rateTypes.some((r) => String(r.value) === String(configDraft.RateTypeID))
    ) {
      toast.warning(t("Please select Rate Type"));
      return;
    }
    const named = applyRateTypeName(configDraft);
    setConfigSaving(true);
    axiosInstance
      .post("DoctorShareMaster2/SaveConfig", {
        AllowNegativeShare: Number(named.AllowNegativeShare) || 0,
        BlockCreditPatientShare: Number(named.BlockCreditPatientShare) || 0,
        // AllowSharing is controlled from Doctor Master, not configuration.
        // AllowSharing: Number(named.AllowSharing) === 0 ? 0 : 1,
        AllowSharing: 1,
        AllowRateTypeWiseShare: Number(named.AllowRateTypeWiseShare) || 0,
        AllowCentreWiseDoctor: Number(named.AllowCentreWiseDoctor) || 0,
        DiscountBearBy: named.DiscountBearBy,
        ShareCalculateOn: named.ShareCalculateOn,
        RateTypeID: String(named.RateTypeID),
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Configuration Saved"));
        setConfig(named);
        setConfigDraft(named);
        loadConfig();
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Unable to save configuration")),
      )
      .finally(() => setConfigSaving(false));
  };

  const reportPayload = (reportFormat) => {
    const selectedCentres = Array.isArray(reportFilter.CentreID)
      ? reportFilter.CentreID.map((c) => (typeof c === "object" ? c?.value : c)).filter(Boolean)
      : reportFilter.CentreID
        ? [reportFilter.CentreID]
        : [];
    const centreCsv = selectedCentres.length > 0 ? selectedCentres.join(",") : "0";

    return {
      fromDate: moment(reportFilter.FromDate).format("YYYY-MM-DD"),
      toDate: moment(reportFilter.ToDate).format("YYYY-MM-DD"),
      doctorID: reportFilter.DoctorID || "0",
      departmentID: reportFilter.DepartmentID || "0",
      centreID: centreCsv,
      centreIDs: selectedCentres,
      CentreID: centreCsv,
      CentreIds: selectedCentres,
      rateTypeID: config.RateTypeID || "0",
      reportType: reportFilter.ReportView || "Doctor",
      reportFormat,
      shareType: "",
    };
  };

  const searchReport = () => {
    setReportLoading(true);
    axiosReport
      .post("DoctorShareMaster2Report/GetReport", reportPayload("search"))
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        if (!data.length) toast.info(t("No Record Found"));
        setReportRows(data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("No Record Found"));
        setReportRows([]);
      })
      .finally(() => setReportLoading(false));
  };

  const readBlobError = async (data) => {
    try {
      const text = data instanceof Blob ? await data.text() : String(data || "");
      if (!text) return "";
      try {
        const json = JSON.parse(text);
        return json?.message || json?.title || "";
      } catch {
        return text.slice(0, 180);
      }
    } catch {
      return "";
    }
  };

  const openReportFile = async (reportFormat, fileName) => {
    setReportLoading(true);
    try {
      const res = await axiosReport.post(
        "DoctorShareMaster2Report/GetReport",
        reportPayload(reportFormat),
        { responseType: "blob" },
      );
      const fileType = res.headers["content-type"] || "";
      const blob = new Blob([res.data], { type: fileType || "application/octet-stream" });
      if (
        fileType.includes("application/json") ||
        fileType.includes("text/json") ||
        fileType.includes("text/plain") ||
        fileType.includes("text/html")
      ) {
        toast.error((await readBlobError(blob)) || t("No Record Found"));
        return;
      }
      const url = window.URL.createObjectURL(blob);
      if (reportFormat === "pdf") {
        window.open(url, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      toast.success(t("Report generated successfully"));
    } catch (err) {
      const blobMessage = await readBlobError(err?.response?.data);
      toast.error(blobMessage || err?.response?.data?.message || t("Failed to generate report"));
    } finally {
      setReportLoading(false);
    }
  };

  const exportReportExcel = () =>
    openReportFile(
      "excel",
      `DoctorShareMaster2_${reportFilter.ReportView}_${moment().format("YYYYMMDD")}.xlsx`,
    );

  const exportReportPdf = () =>
    openReportFile(
      "pdf",
      `DoctorShareMaster2_${reportFilter.ReportView}_${moment().format("YYYYMMDD")}.pdf`,
    );

  const reportView = reportFilter.ReportView || "Doctor";
  const isItemReport = reportView === "Item";
  const isPatientReport = reportView === "Patient";
  const isDeptReport = reportView === "Department";
  const reportTotals = useMemo(() => {
    return reportRows.reduce(
      (acc, row) => {
        acc.patient += reportNum(row, "patientCount", "PatientCount");
        acc.item += reportNum(row, "itemCount", "ItemCount");
        acc.gross += reportNum(row, "gross", "grossAmount", "Gross", "GrossAmount", "Rate", "rate");
        acc.discount += reportNum(row, "discount", "discountAmount", "Discount", "DiscountAmount");
        acc.net += reportNum(row, "net", "netAmount", "Net", "NetAmount", "Amount", "amount");
        acc.received += reportNum(row, "received", "Received");
        acc.balance += reportNum(row, "balanceAmount", "BalanceAmount");
        acc.share += reportNum(row, "shareAmount", "ShareAmount");
        acc.pctWeight +=
          reportNum(row, "sharePercentage", "sharePercent", "SharePercentage", "SharePercent") *
          reportNum(row, "gross", "grossAmount", "Gross", "GrossAmount", "rate", "Rate", "net", "netAmount", "Net", "NetAmount");
        return acc;
      },
      { patient: 0, item: 0, gross: 0, discount: 0, net: 0, received: 0, balance: 0, share: 0, pctWeight: 0 },
    );
  }, [reportRows]);
  const reportSharePct =
    reportTotals.gross === 0 ? 0 : reportTotals.pctWeight / reportTotals.gross;

  const openAudit = () => {
    setAuditLoading(true);
    axiosInstance
      .post("DoctorShareMaster2/GetAuditLog", {
        Screen: auditFilter,
        DoctorID: effectiveDoctorID || "0",
        RateTypeID: effectiveRateTypeID,
        DepartmentID: departmentID || "0",
        ItemID: "0",
      })
      .then((res) => {
        setAuditRows(Array.isArray(res?.data?.message) ? res.data.message : []);
        setShowAudit(true);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("No audit entries yet."));
        setAuditRows([]);
        setShowAudit(true);
      })
      .finally(() => setAuditLoading(false));
  };

  const applyAllDept = (value) => {
    const next = value > 100 ? "" : allowNegative || value >= 0 ? value : "";
    setDeptTable((prev) =>
      prev.map((ele) => ({ ...ele, DocSharePer: next })),
    );
  };

  const handleDeptRow = (e, index) => {
    const { value } = e.target;
    setDeptTable((prev) => {
      const data = [...prev];
      data[index] = {
        ...data[index],
        DocSharePer: value > 100 ? "" : value,
      };
      return data;
    });
  };

  const handleItemHeader = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setItemTable((prev) => prev.map((ele) => ({ ...ele, [name]: checked })));
      return;
    }
    setItemTable((prev) =>
      prev.map((ele) => ({
        ...ele,
        DocShareAmt: name === "DocSharePer" ? "" : value,
        DocSharePer:
          name === "DocShareAmt" ? "" : value > 100 ? "" : value,
        isChecked: ["", 0, "0"].includes(value) ? false : ele.isChecked,
      })),
    );
  };

  const handleItemRow = (e, pageIndex) => {
    const { name, value, checked, type } = e.target;
    const globalIndex = (currentPage - 1) * pageSize + pageIndex;
    setItemTable((prev) => {
      const val = [...prev];
      if (type === "checkbox") {
        val[globalIndex][name] = checked;
      } else {
        val[globalIndex][name] = name === "DocSharePer" && value > 100 ? "" : value;
        if (name === "DocShareAmt") val[globalIndex].DocSharePer = "";
        if (name === "DocSharePer") val[globalIndex].DocShareAmt = "";
        val[globalIndex].isChecked = ["", 0, "0"].includes(value)
          ? false
          : val[globalIndex].isChecked;
      }
      return val;
    });
  };

  useEffect(() => {
    loadConfig();
    bindDoctors();
    getDepartments();
    loadRateTypes();
    getAccessCentresReports((data) => {
      setCentreData(
        (data || []).map((ele) => ({
          ...ele,
          value: String(ele?.value ?? ""),
        })),
      );
    });
  }, []);

  useEffect(() => {
    if (shareMode === "master") {
      setDoctorID("0");
      if (shareTab === "Department") {
        handleDepartmentSearch(true);
      }
    }
  }, [shareMode, shareTab, effectiveRateTypeID]);

  // Default the share Rate Type picker to the configured one so an untouched screen
  // behaves identically to the flag-off path.
  useEffect(() => {
    if (!allowRateTypeWise) {
      setShareRateTypeID("");
      return;
    }
    setShareRateTypeID((prev) => prev || String(config.RateTypeID || "0"));
  }, [allowRateTypeWise, config.RateTypeID]);

  useEffect(() => {
    if (!allowCentreWiseDoctor) {
      setShareCentreID("");
      setShareCentreDoctors([]);
      return;
    }
    if (!shareCentreID) {
      setShareCentreDoctors([]);
      return;
    }
    let cancelled = false;
    fetchCentreDoctors(shareCentreID).then((rows) => {
      if (!cancelled) setShareCentreDoctors(toDoctorOptions(rows));
    });
    return () => {
      cancelled = true;
    };
  }, [allowCentreWiseDoctor, shareCentreID]);

  // Report tab reuses its existing Centre multi-select to scope the Doctor list.
  // No centre picked means "all centres", so the full doctor list stays available.
  useEffect(() => {
    if (!allowCentreWiseDoctor) {
      setReportCentreDoctors([]);
      return;
    }
    const centres = (reportFilter.CentreID || [])
      .map((c) => (typeof c === "object" ? c?.value : c))
      .filter(Boolean);
    if (!centres.length) {
      setReportCentreDoctors(doctorData.filter((d) => d.value));
      return;
    }
    let cancelled = false;
    Promise.all(centres.map((id) => fetchCentreDoctors(id))).then((results) => {
      if (cancelled) return;
      const options = toDoctorOptions(results.flat());
      setReportCentreDoctors(options);
      // Drop a doctor that the new centre selection no longer covers.
      setReportFilter((prev) =>
        prev.DoctorID && !options.some((o) => o.value === prev.DoctorID)
          ? { ...prev, DoctorID: "" }
          : prev,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [allowCentreWiseDoctor, reportFilter.CentreID, doctorData]);

  useEffect(() => {
    if (!rateTypes.length) return;
    setConfig((prev) => applyRateTypeName(prev, rateTypes));
    setConfigDraft((prev) => applyRateTypeName(prev, rateTypes));
  }, [rateTypes]);

  const renderRateBadge = (label) => (
    <span
      className="badge"
      style={{
        background: "#0B5E8F",
        color: "#fff",
        borderRadius: 12,
        padding: "7px 14px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      {`Rate Type: ${label}`}
    </span>
  );

  const rateTypeBadge = renderRateBadge(rateTypeLabel);
  // On the Set Doctor Share tab the badge tracks the picked rate type when rate type
  // wise share is enabled; otherwise it is the configured one, same as before.
  const shareRateTypeBadge = renderRateBadge(effectiveRateTypeLabel);

  const renderShareRateTypePicker = (idSuffix) =>
    allowRateTypeWise ? (
      <div className="col-sm-3">
        <ReactSelect
          dynamicOptions={rateTypes}
          name="ShareRateTypeID"
          lable={t("Rate Type")}
          id={`ShareRateTypeID${idSuffix}`}
          removeIsClearable={true}
          placeholderName={t("Rate Type")}
          value={shareRateTypeID}
          onChange={(_, e) => {
            setShareRateTypeID(String(e?.value ?? ""));
            setDeptTable([]);
            setItemTable([]);
          }}
        />
      </div>
    ) : null;

  const renderShareCentrePicker = (idSuffix) =>
    allowCentreWiseDoctor ? (
      <div className="col-sm-3">
        <ReactSelect
          dynamicOptions={[
            { label: t("Select Centre"), value: "" },
            ...centreData,
          ]}
          name="ShareCentreID"
          lable={t("Centre")}
          id={`ShareCentreID${idSuffix}`}
          removeIsClearable={true}
          placeholderName={t("Centre")}
          value={shareCentreID}
          onChange={(_, e) => {
            setShareCentreID(String(e?.value ?? ""));
            setDoctorID("");
            setDeptTable([]);
            setItemTable([]);
          }}
        />
      </div>
    ) : null;

  const shareToolbar = (
    <div className="row align-items-center pt-2 pl-2 pr-2 pb-1">
      <div className="col-auto d-flex align-items-center flex-wrap" style={{ gap: 16 }}>
        <label className="mb-0 d-flex align-items-center" style={{ gap: 6, fontWeight: 600 }}>
          <input
            type="radio"
            name="shareMode2"
            checked={shareMode === "master"}
            onChange={() => {
              setShareMode("master");
              setItemTable([]);
            }}
          />
          {t("Master")}
        </label>
        <label className="mb-0 d-flex align-items-center" style={{ gap: 6, fontWeight: 600 }}>
          <input
            type="radio"
            name="shareMode2"
            checked={shareMode === "doctor"}
            onChange={() => {
              setShareMode("doctor");
              setDoctorID("");
              setDeptTable([]);
              setItemTable([]);
            }}
          />
          {t("Doctor")}
        </label>
        {shareRateTypeBadge}
      </div>
      <div className="col d-flex justify-content-end flex-wrap" style={{ gap: 6 }}>
        <CustomButton
          icon="excel"
          text={t("Export Excel")}
          onClick={() => setShowImportExport(true)}
        />
        <CustomButton
          icon="upload"
          text={t("Import Excel")}
          onClick={() => setShowImportExport(true)}
        />
        <CustomButton
          icon="history"
          text={t("View Audit")}
          onClick={openAudit}
          disabled={auditLoading}
        />
        <CustomButton
          icon="share"
          text={t("Transfer Doctor Share")}
          onClick={() => setShowTransfer(true)}
        />
      </div>
    </div>
  );

  const departmentContent = (
    <div className="pt-2">
      <div className="row pl-2 pr-2 mt-2 align-items-center">
        {renderShareRateTypePicker("Dept")}
        {shareMode === "doctor" && (
          <>
            {renderShareCentrePicker("Dept")}
            <div className="col-sm-3">
              <ReactSelect
                dynamicOptions={shareDoctorOptions}
                name="DoctorID"
                lable={t("Doctor")}
                id="DoctorID"
                removeIsClearable={true}
                placeholderName={t("Doctor")}
                value={doctorID}
                onChange={(_, e) => {
                  setDoctorID(String(e?.value ?? ""));
                  setDeptTable([]);
                }}
              />
            </div>
            <div className="col-auto d-flex align-items-start pb-1">
              <SearchButton
                text={t("Search")}
                onClick={() => handleDepartmentSearch(false)}
                disabled={loading}
              />
            </div>
          </>
        )}
      </div>
      {loading ? (
        <Loading />
      ) : (
        deptTable.length > 0 && (
          <>
            <div className="row p-2">
              <div className="col-12">
                <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Department ID")}</th>
                      <th>{t("Department")}</th>
                      <th>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ paddingRight: 10 }}>{t("Percentage %")}</span>
                          <Input
                            type="number"
                            id="DeptShareAll"
                            name="DocSharePer"
                            placeholder={t("All")}
                            onChange={(e) => applyAllDept(e.target.value)}
                            style={{ width: 120 }}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptTable.map((ele, index) => (
                      <tr key={ele.DepartmentID || index}>
                        <td>{index + 1}</td>
                        <td>{ele?.DepartmentID}</td>
                        <td>{ele?.Department}</td>
                        <td>
                          <Input
                            type="number"
                            name="DocSharePer"
                            value={ele?.DocSharePer}
                            onChange={(e) => handleDeptRow(e, index)}
                            onInput={(e) => number(e, 5)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
            <div className="row pl-2 pr-2 pb-2">
              <div className="col-auto">
                <CustomButton
                  icon="save"
                  text={t("Save")}
                  onClick={saveDepartment}
                  loading={saving}
                />
              </div>
            </div>
          </>
        )
      )}
    </div>
  );

  const itemContent = (
    <div className="pt-2">
      <div className="row pl-2 pr-2 mt-2 align-items-start">
        {renderShareRateTypePicker("Item")}
        {shareMode === "doctor" && renderShareCentrePicker("Item")}
        {shareMode === "doctor" && (
          <div className="col-sm-3">
            <ReactSelect
              dynamicOptions={shareDoctorOptions}
              name="ItemDoctorID"
              lable={t("Doctor")}
              id="ItemDoctorID"
              removeIsClearable={true}
              placeholderName={t("Doctor")}
              value={doctorID}
              onChange={(_, e) => setDoctorID(String(e?.value ?? ""))}
            />
          </div>
        )}
        <div className="col-sm-3">
          <ReactSelect
            dynamicOptions={[
              { label: t("Select Department"), value: "" },
              ...departmentData,
            ]}
            name="DepartmentID"
            lable={t("Department")}
            id="DepartmentID"
            removeIsClearable={true}
            placeholderName={t("Department")}
            value={departmentID}
            onChange={(_, e) => {
              setDepartmentID(String(e?.value ?? ""));
              setItemTable([]);
            }}
          />
        </div>
        <div className="col-auto d-flex align-items-center pb-1">
          {shareRateTypeBadge}
        </div>
        <div className="col-auto d-flex align-items-start pb-1">
          <SearchButton
            text={t("Search")}
            onClick={handleItemSearch}
            disabled={loading}
          />
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : (
        itemTable.length > 0 && (
          <>
            <div className="row p-2">
              <div className="col-12">
                <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Item ID")}</th>
                      <th>{t("Test Code")}</th>
                      <th>{t("Item")}</th>
                      <th>{t("Rate")}</th>
                      <th>
                        {t("Amount(Rs.)")}
                        <Input
                          type="number"
                          name="DocShareAmt"
                          id="ItemAmtAll"
                          placeholder={t("All")}
                          onChange={handleItemHeader}
                        />
                      </th>
                      <th>
                        {t("Percentage %")}
                        <Input
                          type="number"
                          name="DocSharePer"
                          id="ItemPerAll"
                          placeholder={t("All")}
                          onChange={handleItemHeader}
                        />
                      </th>
                      <th>
                        <input
                          type="checkbox"
                          name="isChecked"
                          onChange={handleItemHeader}
                          checked={
                            itemTable.length > 0 &&
                            itemTable.every((ele) => ele.isChecked)
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((ele, pageIndex) => (
                      <tr key={ele.InvestigationID || pageIndex}>
                        <td>{(currentPage - 1) * pageSize + pageIndex + 1}</td>
                        <td>{ele?.InvestigationID}</td>
                        <td>{ele?.TestCode}</td>
                        <td>{ele?.InvestigationName}</td>
                        <td>{ele?.Rate}</td>
                        <td>
                          <Input
                            type="number"
                            name="DocShareAmt"
                            value={ele?.DocShareAmt}
                            onChange={(e) => handleItemRow(e, pageIndex)}
                            onInput={(e) => number(e, 8)}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name="DocSharePer"
                            value={ele?.DocSharePer}
                            onChange={(e) => handleItemRow(e, pageIndex)}
                            onInput={(e) => number(e, 5)}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            name="isChecked"
                            checked={ele?.isChecked}
                            onChange={(e) => handleItemRow(e, pageIndex)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
            <div className="row pl-2 pr-2 pb-2">
              <div className="col-auto">
                <CustomButton
                  icon="save"
                  text={t("Save")}
                  onClick={saveItems}
                  loading={saving}
                />
              </div>
            </div>
            <div className="d-flex flex-wrap justify-content-end align-items-center">
              <label className="mt-4 mx-2">{t("No Of Record/Page")}</label>
              <SelectBox
                className="mt-3 p-1 RecordSize mr-2"
                selectedValue={pageSize}
                options={Record}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              />
              <Pagination
                className="pagination-bar"
                currentPage={currentPage}
                totalCount={itemTable.length}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </>
        )
      )}
    </div>
  );

  const shareContent = (
    <>
      {shareToolbar}
      <div className="card-body pt-0">
        <CustomTabs
          id="doctor-share-dept-item-tabs"
          tabs={[
            { id: "Department", label: t("Department"), content: departmentContent },
            { id: "Item", label: t("Item"), content: itemContent },
          ]}
          activeTab={shareTab}
          onSelect={(k) => setShareTab(k)}
        />
      </div>
    </>
  );

  const configContent = (
    <div className="p-3">
      <div
        className="border"
        style={{ maxWidth: 860, background: "#fff", borderRadius: 4, overflow: "hidden" }}
      >
        <div
          className="px-3 py-2"
          style={{ background: "#1E9FF2", color: "#fff", fontWeight: 600 }}
        >
          {t("Share Calculation & Business Rules")}
        </div>
        {/* Allow Sharing is controlled from Doctor Master (ReferMasterShare), default 1. Not from configuration.
        <div className="d-flex align-items-center px-3 py-2 border-bottom">
          <div style={{ width: 280, fontWeight: 600 }}>{t("Allow Sharing")}</div>
          <label className="mb-0 d-flex align-items-center" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={Number(configDraft.AllowSharing) !== 0}
              onChange={(e) =>
                setConfigDraft((prev) => ({
                  ...prev,
                  AllowSharing: e.target.checked ? 1 : 0,
                }))
              }
            />
            {t("On (if off, no doctor share on registration)")}
          </label>
        </div>
        */}
        <div className="d-flex align-items-center px-3 py-2 border-bottom">
          <div style={{ width: 280, fontWeight: 600 }}>{t("Allow Negative Share")}</div>
          <label className="mb-0 d-flex align-items-center" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={Number(configDraft.AllowNegativeShare) === 1}
              onChange={(e) =>
                setConfigDraft((prev) => ({
                  ...prev,
                  AllowNegativeShare: e.target.checked ? 1 : 0,
                }))
              }
            />
            {t("Enable (DS-CFG-01 / BR-01)")}
          </label>
        </div>
        <div className="d-flex align-items-center px-3 py-2 border-bottom">
          <div style={{ width: 280, fontWeight: 600 }}>
            {t("Block Credit Patient Share")}
          </div>
          <label className="mb-0 d-flex align-items-center" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={Number(configDraft.BlockCreditPatientShare) === 1}
              onChange={(e) =>
                setConfigDraft((prev) => ({
                  ...prev,
                  BlockCreditPatientShare: e.target.checked ? 1 : 0,
                }))
              }
            />
            {t("Enable (DS-CFG-02 / BR-02)")}
          </label>
        </div>
        <div className="d-flex align-items-center px-3 py-2 border-bottom">
          <div style={{ width: 280, fontWeight: 600 }}>
            {t("Allow Rate Type Wise Share")}
          </div>
          <label className="mb-0 d-flex align-items-center" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={Number(configDraft.AllowRateTypeWiseShare) === 1}
              onChange={(e) =>
                setConfigDraft((prev) => ({
                  ...prev,
                  AllowRateTypeWiseShare: e.target.checked ? 1 : 0,
                }))
              }
            />
            {t(
              "Enable (Rate Type dropdown on Doctor Share tab; share is stored per rate type)",
            )}
          </label>
        </div>
        <div className="d-flex align-items-center px-3 py-2 border-bottom">
          <div style={{ width: 280, fontWeight: 600 }}>
            {t("Allow Centre Wise Doctor")}
          </div>
          <label className="mb-0 d-flex align-items-center" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={Number(configDraft.AllowCentreWiseDoctor) === 1}
              onChange={(e) =>
                setConfigDraft((prev) => ({
                  ...prev,
                  AllowCentreWiseDoctor: e.target.checked ? 1 : 0,
                }))
              }
            />
            {t("Enable (select Centre first, then only that centre's doctors)")}
          </label>
        </div>
        <div className="d-flex align-items-center px-3 py-2 border-bottom">
          <div style={{ width: 280, fontWeight: 600 }}>{t("Discount Bear By")}</div>
          {["Both", "Doctor", "Lab"].map((opt) => (
            <label
              key={opt}
              className="mb-0 d-flex align-items-center mr-3"
              style={{ gap: 6 }}
            >
              <input
                type="radio"
                name="discountBearBy"
                checked={configDraft.DiscountBearBy === opt}
                onChange={() =>
                  setConfigDraft((prev) => ({ ...prev, DiscountBearBy: opt }))
                }
              />
              {t(opt)}
            </label>
          ))}
        </div>
        <div className="d-flex align-items-center px-3 py-2 border-bottom">
          <div style={{ width: 280, fontWeight: 600 }}>{t("Share Calculate On")}</div>
          <label className="mb-0 d-flex align-items-center mr-3" style={{ gap: 6 }}>
            <input
              type="radio"
              name="shareCalculateOn"
              checked={configDraft.ShareCalculateOn === "Gross"}
              onChange={() =>
                setConfigDraft((prev) => ({ ...prev, ShareCalculateOn: "Gross" }))
              }
            />
            {t("Gross Amount")}
          </label>
          <label className="mb-0 d-flex align-items-center" style={{ gap: 6 }}>
            <input
              type="radio"
              name="shareCalculateOn"
              checked={configDraft.ShareCalculateOn === "Net"}
              onChange={() =>
                setConfigDraft((prev) => ({ ...prev, ShareCalculateOn: "Net" }))
              }
            />
            {t("Net Amount")}
          </label>
        </div>
        <div className="d-flex align-items-center px-3 py-2 border-bottom flex-wrap">
          <div style={{ width: 280, fontWeight: 600 }}>{t("Rate Type")}</div>
          <div style={{ minWidth: 260, flex: "0 0 260px" }}>
            <ReactSelect
              dynamicOptions={rateTypes}
              name="RateTypeID"
              id="ConfigRateTypeID"
              removeIsClearable={true}
              placeholderName={t("Select Rate Type")}
              value={configDraft.RateTypeID}
              onChange={(_, e) =>
                setConfigDraft((prev) => ({
                  ...prev,
                  RateTypeID: String(e?.value ?? ""),
                  RateTypeName: e?.label || "",
                }))
              }
            />
          </div>
          <span className="ml-2" style={{ fontSize: 11, color: "#555" }}>
            {t("(Rate column in Item grid will follow this rate type)")}
          </span>
        </div>
        <div className="px-3 py-2 d-flex" style={{ gap: 8 }}>
          <CustomButton
            icon="save"
            text={t("Save Configuration")}
            onClick={saveConfig}
            loading={configSaving}
          />
          <CustomButton
            icon="history"
            text={t("View Audit")}
            onClick={openAudit}
          />
        </div>
      </div>
    </div>
  );

  const reportContent = (
    <div className="pt-2">
      <div className="row pl-2 pr-2 mt-2 align-items-start">
        <div className="col-sm-2 col-md-2 mb-2">
          <DatePicker
            className="custom-calendar"
            name="FromDate"
            id="FromDate"
            lable={t("From Date")}
            placeholder=" "
            value={reportFilter.FromDate}
            onChange={(value) =>
              setReportFilter((prev) => ({ ...prev, FromDate: value }))
            }
          />
        </div>
        <div className="col-sm-2 col-md-2 mb-2">
          <DatePicker
            className="custom-calendar"
            name="ToDate"
            id="ToDate"
            lable={t("To Date")}
            placeholder=" "
            value={reportFilter.ToDate}
            onChange={(value) =>
              setReportFilter((prev) => ({ ...prev, ToDate: value }))
            }
          />
        </div>
        <div className="col-sm-2 col-md-2 mb-2">
          <MultiSelectComp
            options={centreData}
            name="CentreID"
            id="ReportCentreID"
            label={t("Centre")}
            placeholder=""
            value={reportFilter.CentreID}
            onChange={(name, val) =>
              setReportFilter((prev) => ({
                ...prev,
                [name]: val ?? [],
              }))
            }
          />
        </div>
        <div className="col-sm-2 col-md-2 mb-2">
          <ReactSelect
            dynamicOptions={reportDoctorOptions}
            name="ReportDoctorID"
            lable={t("Doctor")}
            id="ReportDoctorID"
            removeIsClearable={true}
            placeholderName={t("Doctor")}
            value={reportFilter.DoctorID}
            onChange={(_, e) =>
              setReportFilter((prev) => ({
                ...prev,
                DoctorID: String(e?.value ?? ""),
              }))
            }
          />
        </div>
        <div className="col-sm-2 col-md-2 mb-2">
          <ReactSelect
            dynamicOptions={[
              { label: t("All Departments"), value: "" },
              ...departmentData,
            ]}
            name="ReportDepartmentID"
            lable={t("Department")}
            id="ReportDepartmentID"
            removeIsClearable={true}
            placeholderName={t("Department")}
            value={reportFilter.DepartmentID}
            onChange={(_, e) =>
              setReportFilter((prev) => ({
                ...prev,
                DepartmentID: String(e?.value ?? ""),
              }))
            }
          />
        </div>
        <div className="col-sm-2 col-md-2 mb-2">
          <ReactSelect
            dynamicOptions={[
              { label: t("Doctor Wise"), value: "Doctor" },
              { label: t("Patient Wise"), value: "Patient" },
              { label: t("Item Wise"), value: "Item" },
              { label: t("Department Wise"), value: "Department" },
            ]}
            name="ReportView"
            lable={t("Report Type")}
            id="ReportView"
            removeIsClearable={true}
            placeholderName={t("Report Type")}
            value={reportFilter.ReportView}
            onChange={(_, e) =>
              setReportFilter((prev) => ({
                ...prev,
                ReportView: e?.value || "Doctor",
              }))
            }
          />
        </div>
        <div className="col-12 mb-2" style={{ fontSize: 12, color: "#555" }}>
          {t("Share is locked at registration. Changing Master later does not change old bills.")}
        </div>
        <div className="col-auto d-flex align-items-center pb-2 flex-wrap" style={{ gap: 6 }}>
          {rateTypeBadge}
          <SearchButton
            text={t("Search")}
            onClick={searchReport}
            disabled={reportLoading}
          />
          <CustomButton
            icon="excel"
            text={t("Excel")}
            onClick={exportReportExcel}
            disabled={reportLoading}
          />
          <CustomButton
            icon="pdf"
            text={t("PDF")}
            onClick={exportReportPdf}
            disabled={reportLoading}
          />
        </div>
      </div>

      {reportLoading ? (
        <Loading />
      ) : reportRows.length > 0 ? (
        <div className="row p-2">
          <div className="col-12">
            <Tables style={{ maxHeight: "420px", overflowY: "auto" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr>
                  <th>{t("S.No")}</th>
                  {isItemReport ? (
                    <>
                      <th>{t("Doctor Name")}</th>
                      <th>{t("Centre")}</th>
                      <th>{t("Rate Type")}</th>
                      <th>{t("Visit Date")}</th>
                      <th>{t("Visit No")}</th>
                      <th>{t("Patient Name")}</th>
                      <th>{t("Department")}</th>
                      <th>{t("Test Code")}</th>
                      <th>{t("Test Name")}</th>
                      <th className="text-end">{t("Rate")}</th>
                      <th className="text-end">{t("Discount")}</th>
                      <th className="text-end">{t("Amount")}</th>
                    </>
                  ) : isPatientReport ? (
                    <>
                      <th>{t("Doctor Name")}</th>
                      <th>{t("Centre")}</th>
                      <th>{t("Rate Type")}</th>
                      <th>{t("Visit Date")}</th>
                      <th>{t("Visit No")}</th>
                      <th>{t("Patient Name")}</th>
                      <th>{t("Department")}</th>
                      <th>{t("Test Code")}</th>
                      <th>{t("Test Name")}</th>
                      <th className="text-end">{t("Gross")}</th>
                      <th className="text-end">{t("Discount")}</th>
                      <th className="text-end">{t("Net")}</th>
                      <th className="text-end">{t("Received")}</th>
                      <th className="text-end">{t("Balance")}</th>
                    </>
                  ) : isDeptReport ? (
                    <>
                      <th>{t("Department")}</th>
                      <th className="text-end">{t("Patient Count")}</th>
                      <th className="text-end">{t("Item Count")}</th>
                      <th className="text-end">{t("Gross Amount")}</th>
                      <th className="text-end">{t("Discount Amount")}</th>
                      <th className="text-end">{t("Net Amount")}</th>
                    </>
                  ) : (
                    <>
                      <th>{t("Doctor Name")}</th>
                      <th>{t("Centre")}</th>
                      <th className="text-end">{t("Gross")}</th>
                      <th className="text-end">{t("Discount")}</th>
                      <th className="text-end">{t("Net")}</th>
                      <th className="text-end">{t("Received")}</th>
                      <th className="text-end">{t("Balance Amount")}</th>
                    </>
                  )}
                  <th className="text-end">{t("Share Amount")}</th>
                  <th className="text-end">{t("Share %")}</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    {isItemReport ? (
                      <>
                        <td>{apiVal(row, "doctorName", "DoctorName")}</td>
                        <td>{apiVal(row, "centre", "Centre")}</td>
                        <td>{apiVal(row, "rateTypeName", "RateTypeName")}</td>
                        <td>{apiVal(row, "visitDate", "VisitDate")}</td>
                        <td>{apiVal(row, "visitNo", "VisitNo")}</td>
                        <td>{apiVal(row, "pName", "PName")}</td>
                        <td>{apiVal(row, "department", "Department")}</td>
                        <td>{apiVal(row, "testCode", "TestCode")}</td>
                        <td>{apiVal(row, "testName", "TestName", "itemName", "ItemName")}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "rate", "Rate"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "discount", "Discount", "discountAmount", "DiscountAmount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "amount", "Amount", "netAmount", "NetAmount"))}</td>
                      </>
                    ) : isPatientReport ? (
                      <>
                        <td>{apiVal(row, "doctorName", "DoctorName")}</td>
                        <td>{apiVal(row, "centre", "Centre")}</td>
                        <td>{apiVal(row, "rateTypeName", "RateTypeName")}</td>
                        <td>{apiVal(row, "visitDate", "VisitDate")}</td>
                        <td>{apiVal(row, "visitNo", "VisitNo")}</td>
                        <td>{apiVal(row, "pName", "PName")}</td>
                        <td>{apiVal(row, "department", "Department")}</td>
                        <td>{apiVal(row, "testCode", "TestCode")}</td>
                        <td>{apiVal(row, "testName", "TestName", "itemName", "ItemName")}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "gross", "Gross", "grossAmount", "GrossAmount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "discount", "Discount", "discountAmount", "DiscountAmount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "net", "Net", "netAmount", "NetAmount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "received", "Received"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "balanceAmount", "BalanceAmount"))}</td>
                      </>
                    ) : isDeptReport ? (
                      <>
                        <td>{apiVal(row, "department", "Department")}</td>
                        <td className="text-end">{fmtQty(reportNum(row, "patientCount", "PatientCount"))}</td>
                        <td className="text-end">{fmtQty(reportNum(row, "itemCount", "ItemCount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "grossAmount", "GrossAmount", "gross", "Gross"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "discountAmount", "DiscountAmount", "discount", "Discount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "netAmount", "NetAmount", "net", "Net"))}</td>
                      </>
                    ) : (
                      <>
                        <td>{apiVal(row, "doctorName", "DoctorName")}</td>
                        <td>{apiVal(row, "centre", "Centre")}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "gross", "Gross", "grossAmount", "GrossAmount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "discount", "Discount", "discountAmount", "DiscountAmount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "net", "Net", "netAmount", "NetAmount"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "received", "Received"))}</td>
                        <td className="text-end">{fmtAmt(reportNum(row, "balanceAmount", "BalanceAmount"))}</td>
                      </>
                    )}
                    <td className="text-end">
                      {fmtAmt(reportNum(row, "shareAmount", "ShareAmount"))}
                    </td>
                    <td className="text-end">
                      {fmtAmt(reportNum(row, "sharePercentage", "SharePercentage", "sharePercent", "SharePercent"))}
                    </td>
                  </tr>
                ))}
                <tr className="fw-bold">
                  {isItemReport ? (
                    <>
                      <td colSpan={10}>{t("Grand Total")}</td>
                      <td className="text-end">{fmtAmt(reportTotals.gross)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.discount)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.net)}</td>
                    </>
                  ) : isPatientReport ? (
                    <>
                      <td colSpan={10}>{t("Grand Total")}</td>
                      <td className="text-end">{fmtAmt(reportTotals.gross)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.discount)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.net)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.received)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.balance)}</td>
                    </>
                  ) : isDeptReport ? (
                    <>
                      <td colSpan={2}>{t("Grand Total")}</td>
                      <td className="text-end">{fmtQty(reportTotals.item)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.gross)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.discount)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.net)}</td>
                    </>
                  ) : (
                    <>
                      <td colSpan={3}>{t("Grand Total")}</td>
                      <td className="text-end">{fmtAmt(reportTotals.gross)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.discount)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.net)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.received)}</td>
                      <td className="text-end">{fmtAmt(reportTotals.balance)}</td>
                    </>
                  )}
                  <td className="text-end">{fmtAmt(reportTotals.share)}</td>
                  <td className="text-end">{fmtAmt(reportSharePct)}</td>
                </tr>
              </tbody>
            </Tables>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted py-4">{t("Search to view doctor share report")}</div>
      )}
    </div>
  );

  return (
    <>
      <Accordion
        title={t("Doctor Share Master 2")}
        name={t("Doctor Share Master 2")}
        defaultValue={true}
        isBreadcrumb={true}
        notOpen={true}
      >
        <div className="card-body pt-0">
          <CustomTabs
            id="doctor-share-master2-tabs"
            tabs={[
              { id: "share", label: t("Set Doctor Share"), content: shareContent },
              {
                id: "config",
                label: t("Doctor Share Configuration"),
                content: configContent,
              },
              {
                id: "report",
                label: t("Doctor Share Report"),
                content: reportContent,
              },
            ]}
            activeTab={activeScreen}
            onSelect={(k) => setActiveScreen(k)}
          />
        </div>
      </Accordion>

      <DoctorShareTransferModal2
        show={showTransfer}
        handleClose={() => setShowTransfer(false)}
        rateTypeID={effectiveRateTypeID}
        doctorData={
          allowCentreWiseDoctor && shareCentreID
            ? shareCentreDoctors
            : doctorData.filter((d) => d.value)
        }
      />

      <DoctorShareImportExportModal2
        visible={showImportExport}
        onClose={() => setShowImportExport(false)}
        tab={shareTab}
        shareMode={shareMode}
        doctorID={effectiveDoctorID}
        departmentID={departmentID}
        rateTypeID={effectiveRateTypeID}
        rateTypeName={effectiveRateTypeLabel}
        onSaved={() => {
          if (shareTab === "Department") handleDepartmentSearch();
          else handleItemSearch();
        }}
      />

      <Modal
        visible={showAudit}
        setVisible={setShowAudit}
        Header={t("Doctor Share - Audit Log")}
        modalWidth="1200px"
      >
        <div className="row mb-2 mt-2">
          <div className="col-sm-3">
            <ReactSelect
              dynamicOptions={[
                { label: t("All"), value: "" },
                { label: t("Set Doctor Share"), value: "Set Doctor Share" },
                { label: t("Configuration"), value: "Configuration" },
                { label: t("Transfer"), value: "Transfer" },
              ]}
              name="auditFilter"
              lable={t("Screen")}
              id="auditFilter"
              removeIsClearable={true}
              placeholderName={t("Screen")}
              value={auditFilter}
              onChange={(_, e) => setAuditFilter(e?.value ?? "")}
            />
          </div>
          <div className="col-auto">
            <SearchButton text={t("Search")} onClick={openAudit} />
          </div>
        </div>
        <Tables style={{ maxHeight: "420px", overflowY: "auto" }}>
          <thead>
            <tr>
              <th>{t("#")}</th>
              <th>{t("Date Time")}</th>
              <th>{t("User")}</th>
              <th>{t("Screen")}</th>
              <th>{t("Record")}</th>
              <th>{t("Field")}</th>
              <th>{t("Prev Amount")}</th>
              <th>{t("Current Amount")}</th>
              <th>{t("Prev Per")}</th>
              <th>{t("Current Per")}</th>
              <th>{t("Previous Updated By")}</th>
              <th>{t("Updated By")}</th>
            </tr>
          </thead>
          <tbody>
            {auditRows.length > 0 ? (
              auditRows.map((item, index) => {
                const share = auditShareCells(item);
                return (
                <tr key={apiVal(item, "id", "ID") || index}>
                  <td>{index + 1}</td>
                  <td>{apiVal(item, "dateTime", "DateTime")}</td>
                  <td>{apiVal(item, "userName", "UserName")}</td>
                  <td>{apiVal(item, "screen", "Screen")}</td>
                  <td>{apiVal(item, "recordName", "RecordName")}</td>
                  <td>{apiVal(item, "fieldName", "FieldName")}</td>
                  <td className="text-end">{fmtAuditNum(share.prevAmt)}</td>
                  <td className="text-end">{fmtAuditNum(share.currAmt)}</td>
                  <td className="text-end">{fmtAuditNum(share.prevPer)}</td>
                  <td className="text-end">{fmtAuditNum(share.currPer)}</td>
                  <td>{apiVal(item, "previousUpdatedBy", "PreviousUpdatedBy")}</td>
                  <td>{apiVal(item, "updatedBy", "UpdatedBy")}</td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={12} className="text-center">
                  {t("No audit entries yet.")}
                </td>
              </tr>
            )}
          </tbody>
        </Tables>
      </Modal>
    </>
  );
};

export default DoctorShareMaster2;
