import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import {
  autocompleteOnBlur,
  downloadExcelBlob,
  formatStandardDate,
  getTrimmedData,
  number,
  PreventSpecialCharacter,
} from "../../utils/helpers";
import DatePicker from "../../components/formComponent/DatePicker";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import {
  InvestigationsMasterSchema,
  PackageInvestigationsMasterSchema,
  ProfileInvestigationsMasterSchema,
} from "../../utils/Schema";
import Accordion from "@app/components/UI/Accordion";
import { DocumentSearchSVG } from "../../components/SvgIcons";
import SampleRemark from "../utils/SampleRemark";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import {
  DataType,
  HistoSeries,
  ReportTypeNew,
  ReportTypePreliminary,
  roundOffOptions,
  SampleOption,
} from "../../utils/Constants";
import {
  getDepartment,
  GetGlobalData,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { LuGrip } from "react-icons/lu";
import Tables from "../../components/UI/customTable";
import "./Investigations.css";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import InvestigationsList from "./InvestigationsList";
import { Button, Form } from "react-bootstrap";
import { FaRedo } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "react-multi-select-component";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { Tooltip } from "primereact/tooltip";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import InvestigationsHelpMenuDialog from "./InvestigationsHelpMenuDialog";
import Heading from "../../components/UI/Heading";

function AddSampleTypeField({
  sampleTypeOptions,
  selectedSamples,
  formData,
  onSelectSample,
  onRemoveSample,
}) {
  const [sampleSearch, setSampleSearch] = useState("");
  const [filterSample, setFilterSample] = useState([]);
  const [dropSample, setDropSample] = useState(false);
  const [indexSample, setIndexSample] = useState(0);
  const selectingRef = useRef(false);

  const handleSampleSearch = (e) => {
    const { value } = e.target;
    setSampleSearch(value);
    setFilterSample(
      (sampleTypeOptions || []).filter((item) =>
        String(item.label || "")
          .toLowerCase()
          .includes(String(value).toLowerCase()),
      ),
    );
    setDropSample(true);
    setIndexSample(0);
  };

  const handleSampleSelect = (data) => {
    onSelectSample(data);
    setSampleSearch("");
    setFilterSample([]);
    setDropSample(false);
  };

  const pickSample = (e, data) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectingRef.current) return;
    selectingRef.current = true;
    handleSampleSelect(data);
  };

  const handleSampleKeyDown = (e) => {
    switch (e.which) {
      case 38:
        setIndexSample(
          indexSample === 0 ? filterSample.length - 1 : indexSample - 1,
        );
        break;
      case 40:
        setIndexSample(
          indexSample === filterSample.length - 1 ? 0 : indexSample + 1,
        );
        break;
      case 13:
        if (filterSample[indexSample]) {
          handleSampleSelect(filterSample[indexSample]);
          setIndexSample(0);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="inv-sample-type-ac flex-grow-1 mb-2">
      <div className="d-flex align-items-start">
        <Input
          autoComplete="off"
          placeholder=" "
          lable="Select Multi Sample Type"
          id="SearchSampleType"
          name="sampleSearch"
          type="text"
          hideTooltip
          disabled={
            formData?.DataType === "Package" ||
            formData?.SampleOption === "Sample Not Required"
          }
          value={sampleSearch}
          respclass={"flex-grow-1"}
          onChange={handleSampleSearch}
          onKeyDown={handleSampleKeyDown}
          autocomplete="off"
          onBlur={() => {
            setTimeout(() => {
              if (!selectingRef.current) {
                setDropSample(false);
              }
              selectingRef.current = false;
            }, 400);
          }}
        />
        {(formData?.SampleOption === "Sample Required" ||
          formData?.SampleTypeId?.length > 0) &&
          formData?.DataType !== "Package" && (
            <span className="d-flex align-items-center counticon">
              {selectedSamples?.length > 0 ? selectedSamples?.length : 0}
              <i
                className="bi bi-info-circle-fill infoIcon_cls"
                data-tooltip-id="sample-types-tooltip"
              ></i>
              <ReactTooltip
                id="sample-types-tooltip"
                place="top"
                clickable={true}
                content={
                  <div>
                    <h2 className="mb-1 border-bottom">
                      Sample Types ({selectedSamples.length})
                    </h2>
                    <ul className="mb-0 pl-3">
                      {selectedSamples?.map((sample, idx) => (
                        <li
                          key={sample.value}
                          className="mb-2 d-flex justify-content-between align-items-center"
                        >
                          <span>
                            {idx + 1}. {sample.label}
                          </span>
                          <i
                            className="fa fa-times ml-2"
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() => onRemoveSample(sample.value)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                style={{ zIndex: 9999 }}
              />
            </span>
          )}
      </div>
      {dropSample && filterSample.length > 0 && (
        <ul className="suggestion-data inv-sample-type-suggestions">
          {filterSample.map((data, index) => (
            <li
              key={data.value ?? index}
              className={`${index === indexSample ? "matchIndex" : ""}`}
              onTouchStart={(e) => pickSample(e, data)}
              onPointerDown={(e) => pickSample(e, data)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {data.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Investigations = () => {
  const location = useLocation();
  const { state } = location;
  const [dataForUpdate, setDataForUpdate] = useState({
    url1: null,
    url: null,
  });
  const [MapTest, setMapTest] = useState([]);
  const [searchStatus, setSearchStatus] = useState(1);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importDialogDataType, setImportDialogDataType] = useState("");
  const [templateData, setTemplateData] = useState([]);
  const [importSaveLoading, setImportSaveLoading] = useState(false);
  const [testDetailListModal, setTestDetailListModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [profileListModal, setProfileListModal] = useState(false);
  const [SampleType, setSampleType] = useState([]);
  const [LogisticTemp, setLogisticTemp] = useState([]);
  const [SampleTypeID, setSampleTypeID] = useState([]);
  const [ProfileDetailList, setProfileDetailList] = useState([]);
  const [profileListLoading, setProfileListLoading] = useState(false);
  const [RequiredAttachment, setRequiredAttachment] = useState([]);
  const [ConcentForm, setConcentForm] = useState([]);
  const [PNDT, setPNDT] = useState([]);
  const [SampleContainer, setSampleContainer] = useState([]);
  const [BillingCategory, setBillingCategory] = useState([]);
  const [MapTestTableData, setMapTestTableData] = useState([]);
  const [draggedRowIndex, setDraggedRowIndex] = useState(null);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const localUserData = useLocalStorage("userData", "get");
  const [testDetialsModalShow, setTestDetialsModalShow] = useState(false);
  const PAGE_ID = "14";
  const [navData, setNavData] = useState({
    InvName: null,
    InvId: null,
    DataType: null,
  });
  const [saved, setSaved] = useState(true);
  const [Gender, setGender] = useState([]);

  const handleOpenImportDialog = () => {
    setImportDialogDataType(formData?.DataType || "");
    setShowImportDialog(true);
  };

  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setImportDialogDataType("");
    setTemplateData([]);
    setImportFileName("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const [importFileName, setImportFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleImportDialogDataTypeChange = (event) => {
    const { name, value } = event?.target;
    if (name === "importDataType") {
      setImportDialogDataType(value);
    }
  };

  const handleDownloadTemplateExcel = async () => {
    try {
      const response = await axiosInstance.get(
        "Investigations/ExportPackageTestTemplate",
        {
          responseType: "blob",
          params: importDialogDataType
            ? { dataType: importDialogDataType }
            : undefined,
        },
      );

      const blob = response?.data;
      if (!blob) {
        toast.error("No template data received");
        return;
      }

      const contentType =
        response?.headers?.["content-type"] ||
        response?.headers?.["Content-Type"] ||
        "";

      if (contentType.includes("application/json")) {
        const text = await blob.text();
        const parsed = JSON.parse(text);
        toast.error(parsed?.message || "No template available");
        return;
      }

      downloadExcelBlob(blob, `investigation-template-${importDialogDataType || "all"}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download excel",
      );
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const normalizeImportRows = (rows) => {
    const guidanceTexts = new Set([
      "Required - existing Package/Profile code",
      "For reference only",
      "Required - existing Test code",
    ]);

    return rows
      .map((row) => {
        const typeValue =
          row.PackageCode?.toString().trim() || row.Type?.toString().trim() || "";
        const nameValue =
          row.PackageName?.toString().trim() ||
          row.Name?.toString().trim() ||
          row.TestName?.toString().trim() ||
          "";
        const codeValue =
          row.TestCode?.toString().trim() || row.Code?.toString().trim() || "";

        return {
          ...row,
          Type: typeValue,
          Name: nameValue,
          Code: codeValue,
        };
      })
      .filter((row) => {
        const type = row.Type?.toString().trim();
        const name = row.Name?.toString().trim();
        const code = row.Code?.toString().trim();

        if (!type && !name && !code) return false;
        if (
          guidanceTexts.has(type) ||
          guidanceTexts.has(name) ||
          guidanceTexts.has(code)
        ) {
          return false;
        }

        return true;
      });
  };

  const handleFileUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        const normalizedData = normalizeImportRows(jsonData).map((row) => ({
          ...row,
          DataType: importDialogDataType,
        }));

        const seenTestCodes = new Set();
        const seenTestNames = new Set();
        const duplicates = new Set();

        normalizedData.forEach((row) => {
          const testCodeKey = row.TestCode?.toString().trim().toLowerCase();
          const testNameKey = row.TestName?.toString().trim().toLowerCase();

          if (testCodeKey && seenTestCodes.has(testCodeKey)) {
            duplicates.add(row.TestCode);
          }
          if (testNameKey && seenTestNames.has(testNameKey)) {
            duplicates.add(row.TestName);
          }
          if (testCodeKey) seenTestCodes.add(testCodeKey);
          if (testNameKey) seenTestNames.add(testNameKey);
        });

        if (duplicates.size > 0) {
          toast.warning(
            `Duplicate TestCode/TestName found: ${Array.from(duplicates).join(", ")}. Please remove duplicates and re-upload.`
          );
          if (fileInputRef.current) fileInputRef.current.value = null;
          return;
        }

        setTemplateData(normalizedData);
      } catch (err) {
        toast.error("Failed to parse Excel file");
      }
    };
    reader.onerror = () => {
      toast.error("Unable to read file");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportSave = () => {
    const importPayload = {
      type: templateData[0]?.DataType || importDialogDataType,
      data: templateData.map((row) => ({
        packageCode: row.PackageCode || "",
        packageName: row.PackageName || "",
        testCode: row.TestCode || "",
        testName: row.TestName || "",
      })),
    };

    setImportSaveLoading(true);
    axiosInstance
      .post("Investigations/ImportPackageTest", importPayload)
      .then((res) => {
        toast.success(res?.data?.message || "Data imported successfully");
        setTemplateData([]);
        setImportFileName("");
        if (fileInputRef.current) fileInputRef.current.value = null;
        handleCloseImportDialog();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Import failed");
      })
      .finally(() => setImportSaveLoading(false));
  };

  // ── Investigation ↔ Sample Type import/export — separate feature from
  // the Package import above (its own single modal, one button opens it,
  // export + upload + preview + save all live inside). Unlike
  // ImportPackageTest above, ImportInvestigationSampleType takes the raw
  // Excel file itself (multipart/form-data) — the backend parses it
  // server-side. The file is still parsed client-side too, purely to show
  // the preview table before committing; only the original File object is
  // actually uploaded.
  const sampleTypeFileInputRef = useRef(null);
  const [showSampleTypeDialog, setShowSampleTypeDialog] = useState(false);
  const [sampleTypeFileName, setSampleTypeFileName] = useState("");
  const [sampleTypeFile, setSampleTypeFile] = useState(null);
  const [sampleTypeTemplateData, setSampleTypeTemplateData] = useState([]);
  const [sampleTypeExportLoading, setSampleTypeExportLoading] = useState(false);
  const [sampleTypeImportLoading, setSampleTypeImportLoading] = useState(false);

  const handleOpenSampleTypeDialog = () => {
    setShowSampleTypeDialog(true);
  };

  const handleCloseSampleTypeDialog = () => {
    setShowSampleTypeDialog(false);
    setSampleTypeTemplateData([]);
    setSampleTypeFileName("");
    setSampleTypeFile(null);
    if (sampleTypeFileInputRef.current) sampleTypeFileInputRef.current.value = null;
  };

  const handleDownloadSampleTypeExcel = async () => {
    setSampleTypeExportLoading(true);
    try {
      const response = await axiosInstance.get(
        "SampleType/DownloadInvestigationSampleType",
        { responseType: "blob" }
      );
      const blob = response?.data;
      if (!blob) {
        toast.error("No data received");
        return;
      }

      const contentType =
        response?.headers?.["content-type"] ||
        response?.headers?.["Content-Type"] ||
        "";

      if (contentType.includes("application/json")) {
        const text = await blob.text();
        const parsed = JSON.parse(text);
        toast.error(parsed?.message || "No data available to export");
        return;
      }

      downloadExcelBlob(blob, "InvestigationSampleType");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download excel",
      );
    } finally {
      setSampleTypeExportLoading(false);
    }
  };

  const handleSampleTypeUploadClick = () => {
    sampleTypeFileInputRef.current?.click();
  };

  const handleSampleTypeFileUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    setSampleTypeFileName(file.name);
    setSampleTypeFile(file);

    // Parsed purely for the on-screen preview table — the upload itself
    // sends the raw file, not this parsed data.
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const rows = jsonData
          .map((row) => ({
            investigationID: Number(
              row.investigationID ?? row.InvestigationID ?? row.InvestigationId ?? 0
            ),
            testName: (row.testName ?? row.TestName ?? "").toString().trim(),
            sampleType: (row.sampleType ?? row.SampleType ?? "").toString().trim(),
          }))
          .filter((row) => row.investigationID && row.testName);

        if (rows.length === 0) {
          toast.error("No valid rows found in the selected file");
          if (sampleTypeFileInputRef.current) sampleTypeFileInputRef.current.value = null;
          setSampleTypeFileName("");
          setSampleTypeFile(null);
          return;
        }

        setSampleTypeTemplateData(rows);
      } catch (err) {
        toast.error("Failed to parse Excel file");
        if (sampleTypeFileInputRef.current) sampleTypeFileInputRef.current.value = null;
        setSampleTypeFileName("");
        setSampleTypeFile(null);
      }
    };
    reader.onerror = () => {
      toast.error("Unable to read file");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSampleTypeImportSave = () => {
    if (!sampleTypeFile) {
      toast.warn("Please choose a file first.");
      return;
    }
    setSampleTypeImportLoading(true);

    // Backend takes { "file": "<base64>" } as a JSON body, not multipart —
    // readAsDataURL gives "data:<mime>;base64,<payload>", strip everything
    // before the comma to get just the base64 payload it expects.
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result).split(",")[1] || "";
      axiosInstance
        .post("SampleType/ImportInvestigationSampleType", { file: base64 })
        .then((res) => {
          toast.success(res?.data?.message || "Sample type data imported successfully");
          handleCloseSampleTypeDialog();
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Import failed");
        })
        .finally(() => setSampleTypeImportLoading(false));
    };
    reader.onerror = () => {
      toast.error("Unable to read file");
      setSampleTypeImportLoading(false);
    };
    reader.readAsDataURL(sampleTypeFile);
  };

  const [selectedSamples, setSelectedSamples] = useState([]);
  const [formData, setFormData] = useState({
    InvestigationID: "",
    ConcentForm: "",
    HistoSeries: "",
    PrintName: "",
    DataType: "Test",
    TestName: "",
    DepartmentID: "",
    subDepartmentID: "",
    subDepartmentName: "",
    TestCode: "",
    BarcodeGroup: "",
    ReportType: "",
    ReportFormat: [],
    isActive: "1",
    FromAge: "0",
    ToAge: "99999",
    SampleOption: "Sample Not Required",
    SampleQty: "",
    SampleRemarks: "",
    BaseRate: "",
    MaxRate: "",
    MicroReportType: "",
    DefaultSampleType: "",
    DefaultSampleTypeId: "",
    Gender: "",
    BillingCategory: "1",
    AutoConsume: "",
    SampleContainer: "",
    LogisticTemp: "",
    IsMultipleDoctor: "",
    PrintCumulative: "",
    Reporting: "",
    PrintSampleName: "",
    Booking: "",
    showPatientReport: "",
    ShowAnalysisReport: "",
    OnlineReport: "",
    AutoSave: "",
    PrintSeparate: "",
    Urgent: "",
    IsOrganism: "",
    IsCultureReport: "",
    IsMic: "",
    IsOutSource: "",
    IsRateTypeSpecific: 0,
    IsCulture: "",
    IsAllergy: 0,
    IsDLCcheck: "",
    SampleDefined: "",
    SampleTypeId: "",
    RequiredAttachment: [],
    isMandatory: "",
    MethodName: "",
    ShortName: "",
    IsCovid: "",
    PNDT: "",
    StatSample: "",
    IsHisto: 0,
    PricksNotRequired: "",
    DualAuthentication: 0,
    Suffix: "",
    FullCultureReport: 0,
    ShowInWebSite: 0,
    HideSourceofSample: 0,
    AllowAutoApprovalWithoutrange: 0,
    RoundOff: "",
    Attachement: "",
    AttachementName: "",
    TestRefund: "",
    allowSmartReport: 0,
    HabitsMaping: [],
    HealthConditionMapping: [],
    SpecialityMapping: [],
    OrganMapping: [],
    DiseaseMapping: [],
    TestRepeatAlert: "",
    allowDuplicateBooking: 0,
    Allowquantity: 0,
    MacReadingOnly: 0,
    IsMarkerTest: 0,
    MarkerFromDays: 0,
    MarkerToDays: 0,
    MinReadingCategory: 0,
    MaxReadingCategory: 0,
    DisplayReading: 0,
    UnitReading: 0,
    MethodMandatory: 0,
    AllowEditCalculation: 0,
    OverView: "",
    IsFasting: 0,
    RequiredFields: [],
    ICDCode: "",
    TATIntimate: 0,
    TestFor: "0",
    IsAllowHomeCollection: 1,
    IsInfectionControl: 0,
    AllowHistoricalGraph: 0,
    IsEditableOtherTestRate: 0,
  });
  const [showRemark, setShowRemark] = useState(false);
  const [dropFalse, setDropFalse] = useState(false);
  const [filterInv, setFilterInv] = useState([]);
  const [profileDetail, setProfileDetail] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [invDetails, setInvDetails] = useState({});
  const [lastCreatedInfo, setLastCreatedInfo] = useState(null);
  const [specializationList, setSpecializationList] = useState([]);
  const [mouseHover, setMouseHover] = useState({
    index: -1,
    data: [],
  });

  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [addTestFormData, setAddTestFormData] = useState({
    TestName: "",
    TestCode: "",
    Gender: "Both",
    Booking: 0,
    Reporting: 0,
    RestrictionForHomeCollection: 0,
  });

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHelpMenuDialog, setShowHelpMenuDialog] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState("");
  const [tempSelectedTests, setTempSelectedTests] = useState([]);
  const [selectedProfileTests, setSelectedProfileTests] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedProfileName, setSelectedProfileName] = useState("");

  const RequiredFieldsOptions = [
    { label: "MobileNo", value: "MobileNo" },
    { label: "Address", value: "Address" },
    { label: "Email", value: "Email" },
    { label: "Height", value: "Height" },
    { label: "Weight", value: "Weight" },
    { label: "IdProof", value: "IdProof" },
  ];

  const TestForOptions = [
    { label: "Test for Human", value: "0" },
    { label: "Test for Vet Canine", value: "1" },
  ];

  const [showList, setShowList] = useState(false);
  const [indexMatch, setIndexMatch] = useState(0);
  const [checkField, setCheckField] = useState({
    department: false,
    billingCategory: false,
  });
  const [moreErrors, setMoreErrors] = useState({});
  const navigate = useNavigate();

  const handleRemoveSample = (value) => {
    const updated = selectedSamples.filter((s) => s.value !== value);
    setSelectedSamples(updated);
    const ids = updated.map((s) => s.value).join(",");
    setFormData({
      ...formData,
      SampleTypeId: ids,
      DefaultSampleTypeId: updated.length > 0 ? updated[0].value : "",
      DefaultSampleType: updated.length > 0 ? updated[0].label : "",
    });
  };

  const handleSelectSampleType = (data) => {
    setSelectedSamples((prev) => {
      if (prev.find((s) => s.value === data.value)) return prev;
      const next = [...prev, data];
      setFormData((fd) => ({
        ...fd,
        SampleTypeId: next.map((s) => s.value).join(","),
        DefaultSampleTypeId:
          prev.length === 0 ? data.value : fd.DefaultSampleTypeId,
        DefaultSampleType:
          prev.length === 0 ? data.label : fd.DefaultSampleType,
      }));
      return next;
    });
  };

  const [HabitsMaping, setHabitsMaping] = useState([]);
  const [HealthConditionMapping, setHealthConditionMapping] = useState([]);
  const [SpecialityMapping, setSpecialityMapping] = useState([]);
  const [OrganMapping, setOrganMapping] = useState([]);
  const [DiseaseMapping, setDiseaseMapping] = useState([]);

  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [auditAllDate, setAuditAllDate] = useState(false);
  const [auditFromDate, setAuditFromDate] = useState(new Date());
  const [auditToDate, setAuditToDate] = useState(new Date());
  const [auditLoading, setAuditLoading] = useState(false);

  const handleAuditDateChange = (date, name) => {
    if (name === "auditFromDate") setAuditFromDate(date);
    if (name === "auditToDate") setAuditToDate(date);
  };

  const handleAuditLogExport = async (reportFormat) => {
    const payload = {
      fromDate: auditAllDate ? "" : formatStandardDate(auditFromDate, "YYYY-MM-DD"),
      toDate: auditAllDate ? "" : formatStandardDate(auditToDate, "YYYY-MM-DD"),
      isAllDate: auditAllDate,
      investigationId: formData?.InvestigationID || 0,
      reportFormat: reportFormat,
    };

    try {
      setAuditLoading(true);
      const res = await axiosReport.post("AuditTrail/AuditLogReportInvestigation", payload, {
        responseType: "blob",
      });

      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        toast.warning(json?.message || "No records found.");
        return;
      }

      if (!res.data || res.data.size === 0) {
        toast.warning("No data available to export.");
        return;
      }

      if (reportFormat === "Pdf") {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" }),
        );
        window.open(url, "_blank");
      } else {
        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "AuditLog.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      setShowAuditLogModal(false);
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || "Error while fetching report.");
        } catch {
          toast.error("Error while fetching report.");
        }
      } else {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      }
    } finally {
      setAuditLoading(false);
    }
  };

  const getFieldValue = (controlId) => {
    const fieldMap = {
      DataType: formData?.DataType,
      TestCode: formData?.TestCode,
      TestName: formData?.TestName,
      ShortName: formData?.ShortName,
      PrintName: formData?.PrintName,
      FromAge: formData?.FromAge,
      ToAge: formData?.ToAge,
      SampleQty: formData?.SampleQty,
      BaseRate: formData?.BaseRate,
      MaxRate: formData?.MaxRate,
      MethodName: formData?.MethodName,
      Suffix: formData?.Suffix,
      DepartmentID: formData?.DepartmentID,
      ReportType: formData?.ReportType,
      ReportFormat: formData?.ReportFormat,
      SampleContainer: formData?.SampleContainer,
      Gender: formData?.Gender,
      BillingCategory: formData?.BillingCategory,
      SampleOption: formData?.SampleOption,
      LogisticTemp: formData?.LogisticTemp,
      DefaultSampleTypeId: formData?.DefaultSampleTypeId,
      ConcentForm: formData?.ConcentForm,
      RequiredAttachment: formData?.requiredAttachment,
      PNDT: formData?.PNDT,
      RoundOff: formData?.RoundOff,
      SampleTypeId: formData?.SampleTypeId,
      Reporting: formData?.Reporting,
      Booking: formData?.Booking,
      showPatientReport: formData?.showPatientReport,
      OnlineReport: formData?.OnlineReport,
      IsEditableOtherTestRate: formData?.IsEditableOtherTestRate,
      AutoSave: formData?.AutoSave,
      PrintSeparate: formData?.PrintSeparate,
      isMandatory: formData?.isMandatory,
      PrintSampleName: formData?.PrintSampleName,
      IsOutSource: formData?.IsOutSource,
      IsRateTypeSpecific: formData?.IsRateTypeSpecific,
      IsDLCcheck: formData?.IsDLCcheck,
      IsCovid: formData?.IsCovid,
      PricksNotRequired: formData?.PricksNotRequired,
      DualAuthentication: formData?.DualAuthentication,
      AllowAutoApprovalWithoutrange: formData?.AllowAutoApprovalWithoutrange,
      ShowInWebSite: formData?.ShowInWebSite,
      isActive: formData?.isActive,
      HideSourceOfSample: formData?.HideSourceofSample,
      attachmentRequired: formData?.Attachement,
      AttachementName: formData?.AttachementName,
      TestRefund: formData?.TestRefund,
      allowSmartReport: formData?.allowSmartReport,
      allowDuplicateBooking: formData?.allowDuplicateBooking,
      Allowquantity: formData?.Allowquantity,
      allowQuantity: formData?.Allowquantity,
      AllowQuantity: formData?.Allowquantity,
      allowquantity: formData?.Allowquantity,
      MacReadingOnly: formData?.MacReadingOnly,
      IsMarkerTest: formData?.IsMarkerTest,
      MarkerFromDays: formData?.MarkerFromDays,
      MarkerToDays: formData?.MarkerToDays,
      MinReadingCategory: formData?.MinReadingCategory,
      MaxReadingCategory: formData?.MaxReadingCategory,
      DisplayReading: formData?.DisplayReading,
      UnitReading: formData?.UnitReading,
      MethodMandatory: formData?.MethodMandatory,
      AllowEditCalculation: formData?.AllowEditCalculation,
      AllowHistoricalGraph: formData?.AllowHistoricalGraph,
      OverView: formData?.OverView,
      ICDCode: formData?.ICDCode,
      BarcodeGroup: formData?.BarcodeGroup,
      TATIntimate: formData?.TATIntimate,
      TestFor: String(formData?.TestFor),
    };
    return fieldMap[controlId] || formData[controlId] || "";
  };

  const TestRepeat = [
    { value: "1 Week", label: "1 Week" },
    { value: "2 Week", label: "2 Week" },
    { value: "3 Week", label: "3 Week" },
    { value: "4 Week", label: "4 Week" },
    { value: "1 Month", label: "1 Month" },
    { value: "2 Month", label: "2 Month" },
    { value: "3 Month", label: "3 Month" },
    { value: "4 Month", label: "4 Month" },
    { value: "5 Month", label: "5 Month" },
    { value: "6 Month", label: "6 Month" },
  ];
  console.log("formData?.ShortName", formData);

  const ignoreValidation = (controlId) => {
    let ignoreList = [
      "InvestigationsInterpretion",
      "ReferenceRange",
      "RateTypeMapping",
      "InvestigationsComment",
      "AllergyGroupMapping",
    ];
    if (formData?.DataType == "Package") {
      ignoreList = [
        ...ignoreList,
        "ReportType",
        "RoundOff",
        "DefaultSampleTypeId",
        "SampleTypeId",
        "SampleContainer",
        "SampleOption",
        "LogisticTemp",
        "ConcentForm",
      ];
    }
    if (
      (formData?.DataType == "Test" && formData?.ReportType !== "1") ||
      formData?.DataType == "Profile"
    ) {
      ignoreList = [...ignoreList, "RoundOff"];
    }
    const sampleOption = formData?.SampleOption
      ? String(formData.SampleOption).trim()
      : "";
    if (sampleOption === "Sample Not Required") {
      ignoreList = [
        ...ignoreList,
        "DefaultSampleTypeId",
        "SampleTypeId",
        "SampleType",
        "SampleContainer",
        "LogisticTemp",
        "ConcentForm",
      ];
    }
    console.log("ignoreList", ignoreList);
    return ignoreList.includes(controlId);
  };

  //changes

  const Attachement = [
    { label: "Select", value: "" },
    { label: "Registration", value: 1 },
    { label: "DepartementRecieve", value: 2 },
  ];
  const validateMandatoryFields = () => {
    const errors = {};
    console.log("controllerDynamicList length:", controllerDynamicList.length);

    if (!controllerDynamicList || controllerDynamicList.length === 0) {
      console.log("controllerDynamicList not loaded yet");
      return errors;
    }

    controllerDynamicList.forEach((item) => {
      console.log(
        "Checking item:",
        item.ControlDisplayID,
        "IsMandatory:",
        item.IsMandatory,
      );
      if (item.IsMandatory == 1 && !ignoreValidation(item.ControlDisplayID)) {
        const fieldValue = getFieldValue(item.ControlDisplayID);
        console.log("Field:", item.ControlDisplayID, "Value:", fieldValue);
        if (!fieldValue || fieldValue.toString().trim() === "") {
          errors[item.ControlDisplayID] =
            `${item?.ControlDisplayName} Field is required`;
        }
      }
    });
    console.log("Validation errors:", errors);
    return errors;
  };

  const clearValidationError = (fieldName) => {
    // Direct mapping for most fields
    if (moreErrors[fieldName]) {
      setMoreErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
      return;
    }

    // Find by ControlDisplayID in dynamic list
    const controllerItem = controllerDynamicList.find(
      (item) => item.ControlDisplayID === fieldName,
    );

    if (controllerItem && moreErrors[controllerItem.ControlDisplayID]) {
      setMoreErrors((prev) => ({
        ...prev,
        [controllerItem.ControlDisplayID]: "",
      }));
    }
  };

  const fetch = (id) => {
    axiosInstance
      .post("PatientRegistration/GetTestInfo", {
        InvestigationId: id,
      })
      .then((res) => {
        setProfileDetail(res?.data?.message);
      })
      .catch((err) => {
        // console.log(err);
        setProfileDetail([]);
      });
  };
  const fetchProfileList = () => {
    setProfileListLoading(true);
    axiosInstance
      .post("Investigations/ViewParentItemList", {
        labId: invDetails?.InvestigationID,
      })
      .then((res) => {
        if (res?.data?.success && Array.isArray(res?.data?.data)) {
          setProfileDetailList(res?.data?.data);
          setProfileListLoading(false);
        } else {
          setProfileDetailList([]);
          toast.error(res?.data?.message);
          setProfileListLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setProfileDetailList([]);
        setProfileListLoading(false);
      });
  };

  const GetSubDepartments = (DepartmentID) => {
    axiosInstance
      .post("Investigations/GetSubDepartments", { departmentId: DepartmentID })
      .then((res) => {
        if (res?.data?.success && Array.isArray(res?.data?.message)) {
          const subDepartments = res?.data?.message?.map((item) => ({
            label: item?.SubDepartmentName,
            value: item?.Id,
          }));
          setSubDepartments(subDepartments);
        } else {
          setSubDepartments([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setSubDepartments([]);
      });
  };

  const { t } = useTranslation();

  const getMappedObjects = (ids = [], master = []) => {
    return ids
      .map((id) => master.find((item) => Number(item.value) === Number(id)))
      .filter(Boolean)
      .map((item) => ({
        label: item.label,
        value: item.value,
      }));
  };

  const handleSubmitAPI = (values) => {
    const validationErrors = validateMandatoryFields();
    console.log("validationErrors", validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setMoreErrors(validationErrors);
      return;
    }

    console.log("values", values);

    setLoad(true);
    handleCheckDuplicate().then((res) => {
      if (res === "TestCode Already Exists.") {
        setLoad(false);
      } else {
        axiosInstance
          .post(
            dataForUpdate?.url
              ? dataForUpdate.url
              : state?.url && saved
                ? state.url
                : "Investigations/CreateInvestigation",
            getTrimmedData({
              Observation: MapTestTableData,
              Investigation: [values]?.map((ele, _) => {
                const selectedConcentForm = ele?.ConcentForm || [];
                const {
                  RequiredFields,
                  RequiredFeildList,
                  requiredFeilds,
                  allowQuantity,
                  AllowQuantity,
                  allowquantity,
                  Allowquantity: _discardAllowquantity,
                  ...rest
                } = ele;

                return {
                  ...rest,
                  subDepartmentID: Number(ele?.subDepartmentID) || 0,
                  SubDepartmentName: ele?.subDepartmentName,
                  // attachmentRequired: {
                  //   requiredAttachment: ele?.AttachementName,
                  //   attachmentID: Number(ele?.Attachement),
                  // },
                  attachmentRequired: {
                    requiredAttachment: ele?.AttachementName || "",
                    attachmentID: ele?.Attachement ? Number(ele.Attachement) : 0,
                  },
                  SampleTypeId: ele?.SampleTypeId,
                  RoundOff:
                    formData?.DataType === "Test" && formData?.ReportType === "1"
                      ? Number(ele?.RoundOff) || 0
                      : -1,
                  [dataForUpdate?.url || (state?.url && saved)
                    ? "mappingListData"
                    : "mappingList"]: [
                      ...(formData?.HabitsMaping || []).map((id) => ({
                        Id:
                          specializationList.find(
                            (s) =>
                              s.DataType === "HabitsMapping" &&
                              s.SepcializationID == id
                          )?.Id || 0,
                        dataType: "HabitsMapping",
                        sepcializationID: id,
                        specializationName:
                          HabitsMaping.find((h) => h.value == id)?.label || "",
                      })),

                      ...(formData?.HealthConditionMapping || []).map((id) => ({
                        Id:
                          specializationList.find(
                            (s) =>
                              s.DataType === "HealthConditionMapping" &&
                              s.SepcializationID == id
                          )?.Id || 0,
                        dataType: "HealthConditionMapping",
                        sepcializationID: id,
                        specializationName:
                          HealthConditionMapping.find((h) => h.value == id)
                            ?.label || "",
                      })),

                      ...(formData?.SpecialityMapping || []).map((id) => ({
                        Id:
                          specializationList.find(
                            (s) =>
                              s.DataType === "SpecialthMapping" &&
                              s.SepcializationID == id
                          )?.Id || 0,
                        dataType: "SpecialthMapping",
                        sepcializationID: id,
                        specializationName:
                          SpecialityMapping.find((h) => h.value == id)?.label ||
                          "",
                      })),

                      ...(formData?.OrganMapping || []).map((id) => ({
                        Id:
                          specializationList.find(
                            (s) =>
                              s.DataType === "OrganMapping" &&
                              s.SepcializationID == id
                          )?.Id || 0,
                        dataType: "OrganMapping",
                        sepcializationID: id,
                        specializationName:
                          OrganMapping.find((o) => o.value == id)?.label || "",
                      })),

                      ...(formData?.DiseaseMapping || []).map((id) => ({
                        Id:
                          specializationList.find(
                            (s) =>
                              s.DataType === "DiseaseMapping" &&
                              s.SepcializationID == id
                          )?.Id || 0,
                        dataType: "DiseaseMapping",
                        sepcializationID: id,
                        specializationName:
                          DiseaseMapping.find((d) => d.value == id)?.label || "",
                      })),
                    ],
                  requiredFeilds: (ele?.RequiredFields || []).map((field) => {
                    const originalFields = [];
                    try {
                      if (ele.RequiredFeildList) {
                        const parsed = JSON.parse(ele.RequiredFeildList);
                        if (Array.isArray(parsed)) originalFields.push(...parsed);
                      }
                    } catch (e) { }
                    const match = originalFields.find(
                      (f) => f.RequiredFeildName === field
                    );

                    return {
                      RequiredFeildName: field,
                      RequiredFeildID: match ? match.RequiredFeildID : 0,
                    };
                  }),
                  cultreReport: (ele?.ReportFormat || [])?.map((item) => ({
                    reportTypeId: item,
                    reportTypeName: item,
                  })),
                  ConcentForm: "",
                  concentFormdata: selectedConcentForm.map((id) => { // ← use captured value
                    const match = ConcentForm.find((c) => String(c.value) === String(id));
                    return {
                      id: Number(id),
                      name: match ? match.label : "",
                    };
                  }),
                  tatIntimate: Number(formData?.TATIntimate || 0),
                  urgent: String(formData?.Urgent) || "0",
                  TestFor: String(formData?.TestFor) || "0",
                  allowEditCalculationValue: formData?.AllowEditCalculation || 0,
                  Allowquantity: (formData?.Allowquantity ?? formData?.AllowQuantity ?? formData?.allowQuantity ?? formData?.allowquantity) ? 1 : 0,
                };
              }),
            })
          )
          .then((res) => {
            if (res.data.success) {
              setLoad(false);
              setDataForUpdate({
                url1: null,
                url: null,
              });
              setInvDetails({});
              setFormData({
                ShowInWebSite: 0,
                HideSourceofSample: 0,
                InvestigationID: "",
                ConcentForm: [],
                HistoSeries: "",
                PrintName: "",
                DataType: "Test",
                TestName: "",
                DepartmentID: "",
                TestCode: "",
                BarcodeGroup:"",
                ReportType: "",
                ReportFormat: [],
                isActive: "1",
                FromAge: "0",
                ToAge: "99999",
                MethodName: "",
                SampleOption: "Sample Not Required",
                SampleQty: "",
                SampleRemarks: "",
                BaseRate: "",
                MaxRate: "",
                MicroReportType: "",
                DefaultSampleType: "",
                DefaultSampleTypeId: "",
                Gender: "",
                BillingCategory: "1",
                AutoConsume: "",
                SampleContainer: "",
                LogisticTemp: "",
                IsMultipleDoctor: "",
                PrintCumulative: "",
                Reporting: "",
                PrintSampleName: "",
                Booking: "",
                showPatientReport: "",
                ShowAnalysisReport: "",
                OnlineReport: "",
                IsEditableOtherTestRate: 0,
                AutoSave: "",
                PrintSeparate: "",
                Urgent: "",
                IsOrganism: "",
                IsCultureReport: "",
                IsMic: "",
                IsOutSource: "",
                IsRateTypeSpecific: 0,
                IsCulture: "",
                IsAllergy: 0,
                IsDLCcheck: "",
                SampleDefined: "",
                SampleTypeId: "",
                requiredAttachment: [],
                isMandatory: "",
                ShortName: "",
                IsCovid: "",
                PNDT: "",
                StatSample: "",
                IsHisto: 0,
                PricksNotRequired: "",
                DualAuthentication: 0,
                Suffix: "",
                FullCultureReport: 0,
                AllowAutoApprovalWithoutrange: 0,
                subDepartmentID: "",
                subDepartmentName: "",
                allowDuplicateBooking: 0,
                Allowquantity: 0,
                MacReadingOnly: 0,
                IsMarkerTest: 0,
                MarkerFromDays: 0,
                MarkerToDays: 0,
                MinReadingCategory: 0,
                MaxReadingCategory: 0,
                DisplayReading: 0,
                UnitReading: 0,
                MethodMandatory: 0,
                AllowEditCalculation: 0,
                OverView: "",
                IsFasting: 0,
                RequiredFields: [],
                ICDCode: "",
                TATIntimate: 0,
                TestFor: "0",
                IsInfectionControl: 0,
              });
              setSubDepartments([]);
              setMapTestTableData([]);
              setNavData({
                InvName: null,
                InvId: null,
                DataType: null,
              });
              setSaved(false);
              getInvestigationList(searchStatus);
              toast.success(res.data.message);
              setMoreErrors({});
            } else {
              toast.error(res?.data?.message);
              setLoad(false);
            }
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured",
            );
            setLoad(false);
          });
      }
    });
  };

  const handleStatusChange = (statusValue) => {
    setSearchStatus(statusValue);
    getInvestigationList(statusValue);
  };

  const { handleSubmit } = useFormik({
    initialValues: formData,
    enableReinitialize: dataForUpdate?.url ? true : state?.url ? true : true,
    validationSchema: null,
    onSubmit: (values) => {
      if (["Profile", "Package"].includes(formData?.DataType)) {
        if (MapTestTableData.length > 0) {
          handleSubmitAPI(formData);
        } else {
          toast.error("Please Choose Test");
        }
      } else {
        handleSubmitAPI(formData);
      }
    },
  });

  const checkEmpty = (id, state) => {
    const isAvailable = state?.find((ele, _) => {
      return ele?.value == id;
    });

    return isAvailable ? id : "";
  };

  useEffect(() => {
    if (checkField?.department && checkField?.billingCategory) Fetch();
  }, [checkField]);

  const Fetch = (url1) => {
    if (url1 || state?.url1) {
      setEditLoading(true);
      axiosInstance
        .get(url1 ? url1 : state?.url1)
        .then((res) => {
          const data = res.data;
          let parsedSpec = [];
          if (data?.invDetails?.Specialization_List) {
            try {
              parsedSpec = JSON.parse(data?.invDetails?.Specialization_List);
            } catch (e) {
              console.error(e);
            }
          }
          setSpecializationList(parsedSpec);

          const getSpecIDs = (type) =>
            parsedSpec
              .filter((i) => i.DataType === type)
              .map((i) => i.SepcializationID);

          // Resolve AttachmentList string to matching Attachement option
          const attachmentOptions = [
            { label: "Select", value: "" },
            { label: "Registration", value: 1 },
            { label: "DepartementRecieve", value: 2 },
          ];
          let resolvedAttachementValue = "";
          let resolvedAttachementName = "";
          let reportFormatValues = [];
          if (data?.invDetails?.AttachmentList) {
            const matchedOption = attachmentOptions.find(
              (opt) =>
                opt.label.toLowerCase() ===
                String(data.invDetails.AttachmentList).trim().toLowerCase(),
            );
            if (matchedOption) {
              resolvedAttachementValue = matchedOption.value;
              resolvedAttachementName = matchedOption.label;
            }
          }

          let concentFormValues = [];
          if (data?.invDetails?.ConcentFormdata_List) {
            try {
              const parsedList = JSON.parse(
                data?.invDetails?.ConcentFormdata_List,
              );
              concentFormValues = parsedList.map((item) => item.id);
            } catch (e) {
              concentFormValues = [];
            }
          } else if (data?.invDetails?.ConsentFormIDs || data?.invDetails?.ConcentFormIDs) {
            const idsStr = data?.invDetails?.ConsentFormIDs || data?.invDetails?.ConcentFormIDs;
            concentFormValues = String(idsStr)
              .split(",")
              .filter((id) => id.trim() !== "")
              .map((id) => Number(id.trim()));
          }

          if (data?.invDetails?.CulterReport_List) {
            try {
              const parsedList = JSON.parse(
                data?.invDetails?.CulterReport_List,
              );

              reportFormatValues = parsedList.map(
                (item) => item.ReportTypeName,
              );
            } catch (e) {
              reportFormatValues = [];
            }
          }

          setInvDetails({ ...data?.invDetails });
          setFormData({
            ...data?.invDetails,
            ConcentForm: concentFormValues || [],
            HabitsMaping: getSpecIDs("HabitsMapping"),
            HealthConditionMapping: getSpecIDs("HealthConditionMapping"),
            SpecialityMapping: getSpecIDs("SpecialthMapping"),
            OrganMapping: getSpecIDs("OrganMapping"),
            DiseaseMapping: getSpecIDs("DiseaseMapping"),
            DepartmentID: checkEmpty(
              data?.invDetails?.DepartmentID,
              DepartmentData,
            ),
            BillingCategory: checkEmpty(
              data?.invDetails?.BillingCategory,
              BillingCategory,
            ),
            IsHisto:
              data?.invDetails?.IsHisto == null ? 0 : data?.invDetails?.IsHisto,
            IsInfectionControl:
              data?.invDetails?.IsInfectionControl == null ? 0 : data?.invDetails?.IsInfectionControl,
            RequiredAttachment: data?.invDetails?.RequiredAttachment
              ? (() => {
                try {
                  const parsed = JSON.parse(
                    data?.invDetails?.RequiredAttachment,
                  );
                  return (
                    Array.isArray(parsed)
                      ? parsed
                      : data?.invDetails?.RequiredAttachment.split(",")
                  ).filter((item) => item && item !== "null");
                } catch (e) {
                  return data?.invDetails?.RequiredAttachment.split(
                    ",",
                  ).filter((item) => item && item !== "null");
                }
              })()
              : [],
            // Attachement:
            //   resolvedAttachementValue !== ""
            //     ? resolvedAttachementValue
            //     : data?.invDetails?.Attachement || "",
            Attachement:
              resolvedAttachementValue !== ""
                ? resolvedAttachementValue
                : data?.invDetails?.AttachementID ||
                data?.invDetails?.Attachement || "",
            AttachementName:
              resolvedAttachementName !== ""
                ? resolvedAttachementName
                : data?.invDetails?.AttachementName || "",
            attachmentRequired: {
              requiredAttachment:
                resolvedAttachementName !== ""
                  ? resolvedAttachementName
                  : data?.invDetails?.Attachement,
              attachmentID:
                resolvedAttachementValue !== ""
                  ? resolvedAttachementValue
                  : data?.invDetails?.AttachementID || 0,
            },
            FullCultureReport: data?.invDetails?.FullCultureReport || 0,
            subDepartmentID:
              data?.invDetails?.SubDepartmentID ||
              data?.invDetails?.subDepartmentID ||
              "",
            subDepartmentName:
              data?.invDetails?.SubDepartmentName ||
              data?.invDetails?.subDepartmentName ||
              "",
            // Handle field name mismatch: API returns AllowDuplicateBooking but form might use allowDuplicateBooking
            allowDuplicateBooking:
              data?.invDetails?.AllowDuplicateBooking ||
              data?.invDetails?.allowDuplicateBooking ||
              0,
            // Ensure all boolean/numeric fields have proper defaults
            IsMarkerTest:
              data?.invDetails?.IsMarkerTest == null
                ? 0
                : data?.invDetails?.IsMarkerTest,
            MarkerFromDays: data?.invDetails?.MarkerFromDays || 0,
            MarkerToDays: data?.invDetails?.MarkerToDays || 0,
            MinReadingCategory: data?.invDetails?.MinReadingMandatory == null ? 0 : data?.invDetails?.MinReadingMandatory,
            MaxReadingCategory: data?.invDetails?.MaxReadingMandatory == null ? 0 : data?.invDetails?.MaxReadingMandatory,
            UnitReading: data?.invDetails?.UnitManadatory == null ? 0 : data?.invDetails?.UnitManadatory,
            DisplayReading: data?.invDetails?.DisplayReadingMandatory == null ? 0 : data?.invDetails?.DisplayReadingMandatory,
            MethodMandatory: data?.invDetails?.MethodMandatory || 0,
            AllowEditCalculation: data?.invDetails?.AllowEditCalculationValue == null ? 0 : data?.invDetails?.AllowEditCalculationValue,
            MacReadingOnly: data?.invDetails?.MacReadingOnly || 0,
            allowSmartReport: data?.invDetails?.AllowSmartReport || 0,
            Allowquantity:
              data?.invDetails?.Allowquantity != null
                ? (Number(data?.invDetails?.Allowquantity) ? 1 : 0)
                : data?.invDetails?.AllowQuantity != null
                ? (Number(data?.invDetails?.AllowQuantity) ? 1 : 0)
                : data?.invDetails?.allowQuantity != null
                ? (Number(data?.invDetails?.allowQuantity) ? 1 : 0)
                : data?.invDetails?.allowquantity != null
                ? (Number(data?.invDetails?.allowquantity) ? 1 : 0)
                : 0,
            TestFor: String(data?.invDetails?.TestFor || "0"),
            ShowInWebSite: data?.invDetails?.ShowInWebSite || 0,
            AllowAutoApprovalWithoutrange:
              data?.invDetails?.AllowAutoApprovalWithoutrange || 0,
            DualAuthentication: data?.invDetails?.DualAuthentication || 0,
            // Ensure text fields are not null
            Overview: data?.invDetails?.Overview || "",
            LabAlert: data?.invDetails?.LabAlert || "",
            Formula: data?.invDetails?.Formula || "",
            TestAutoRefundInDays: data?.invDetails?.TestAutoRefundInDays || 0,
            IsFasting: data?.invDetails?.IsFasting || 0,
            RequiredFields: data?.invDetails?.RequiredFeildList
              ? (() => {
                try {
                  const parsed = JSON.parse(
                    data?.invDetails?.RequiredFeildList,
                  );
                  return Array.isArray(parsed)
                    ? parsed.map((item) => item.RequiredFeildName)
                    : [];
                } catch (e) {
                  console.error("Error parsing RequiredFeildList:", e);
                  return [];
                }
              })()
              : [],
            ReportFormat: reportFormatValues || [],
            TATIntimate: data?.invDetails?.TATIntimation || 0,
          });
          if (data?.invDetails?.SampleTypeId) {
            const ids = String(data.invDetails.SampleTypeId).split(",").filter(Boolean);
            const preSelected = ids.map((id) => {
              const match = SampleType.find((s) => String(s.value) === String(id));
              return match ? match : { value: id, label: id };
            });
            setSelectedSamples(preSelected);
          }

          if (data?.invDetails?.DepartmentID) {
            GetSubDepartments(data?.invDetails?.DepartmentID);
          }

          setMapTestTableData(
            data?.observationData === "" ? [] : data?.observationData,
          );
          setEditLoading(false);
        })
        .catch((err) => {
          setEditLoading(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    }
  };

  // const handleSearchChangeInv = (e) => {
  //   const { value } = e?.target;
  //   setNavData({
  //     ...navData,
  //     InvName: value,
  //   });
  //   setFilterInv(
  //     MapTest.filter((item) =>
  //       item.label.toLowerCase().includes(value.toLowerCase()),
  //     ),
  //   );
  //   setDropFalse(true);
  // };

  const handleSearchChangeInv = (e) => {
    const { value } = e?.target;
    const searchTerm = value.toLowerCase();

    setNavData({
      ...navData,
      InvName: value,
    });

    const filtered = MapTest.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm),
      ),
    );

    setFilterInv(filtered);
    setDropFalse(true);
  };

  const handleEdit = (rowData) => {
    navigate("/InvestigationRange", {
      state: {
        InvestigationID: rowData?.TestId, // send the Test ID
        data: rowData?.TestName, // send the Test Name
        flag: true,
        url1: dataForUpdate?.url1,
      },
    });
  };

  const handleListSearch = (data) => {
    if ((navData?.InvName || data) && filterInv?.length > 0) {
      setNavData({
        ...navData,
        InvName: "",
        InvId: "",
        DataType: "",
      });
      setIndexMatch(0);
      setFilterInv([]);
      setDropFalse(false);
      setDataForUpdate({
        ...dataForUpdate,
        url1: `Investigations/EditInvestigation?id=${data?.value}&DataType=${data?.DataType}`,
        url: "Investigations/UpdateInvestigation",
      });
      Fetch(
        `Investigations/EditInvestigation?id=${data?.value}&DataType=${data?.DataType}`,
      );
      setSaved(true);
    } else {
      toast.error("Select Any Investigation");
    }
  };
  const handleIndex = (e) => {
    switch (e.which) {
      case 38:
        if (indexMatch !== 0) {
          setIndexMatch(indexMatch - 1);
        } else {
          setIndexMatch(filterInv.length - 1);
        }
        break;
      case 40:
        if (filterInv.length - 1 === indexMatch) {
          setIndexMatch(0);
        } else {
          setIndexMatch(indexMatch + 1);
        }
        break;
      case 13:
        handleListSearch(filterInv[indexMatch]);
        setIndexMatch(0);
        break;
      default:
        break;
    }
  };

  const fetchLastCreatedInvestigation = (dataType, departmentId) => {
    if (dataType && departmentId) {
      axiosInstance
        .post("Investigations/GetLastCreatedInvestigation", {
          departmentId,
          dataType,
        })
        .then((res) => {
          const data = res?.data;
          if (data?.success === false) {
            setLastCreatedInfo(null);
          } else {
            setLastCreatedInfo(data?.message || data || null);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setLastCreatedInfo(null);
    }
  };

  const handleMultiSelect = (select, name) => {
    setSampleTypeID(select);
    let val = "";
    for (let i = 0; i < select.length; i++) {
      val = val === "" ? `${select[i].value}` : `${val},${select[i].value}`;
    }
    setFormData({
      ...formData,
      [name]: val,
      DefaultSampleTypeId: select[0]?.value,
      DefaultSampleType: select[0]?.label,
    });
  };
  const handleSelectChange = (event) => {
    const { name, value, selectedIndex } = event?.target;
    const label = event?.target?.children[selectedIndex].text;

    // Clear validation errors dynamically
    clearValidationError(name);

    if (name == "DataType") {
      const isPackage = value === "Package";
      setFormData({
        ...formData,
        DataType: value,
        SampleQty: isPackage ? "" : formData?.SampleQty,
        SampleTypeId: isPackage ? "" : formData?.SampleTypeId,
        DefaultSampleTypeId: isPackage ? "" : formData?.DefaultSampleTypeId,
        DefaultSampleType: isPackage ? "" : formData?.DefaultSampleType,
        SampleOption: isPackage
          ? "Sample Not Required"
          : formData?.SampleOption,
        TATIntimate: 0,
      });
      if (isPackage) setSelectedSamples([]);
      setMapTestTableData([]);
      fetchLastCreatedInvestigation(value, formData?.DepartmentID);
    } else if (name === "ReportType") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ReportFormat: [],
        IsHisto: 0, // reset when report type changes
      }));
    } else {
      if (name == "Gender") {
        setFormData({ ...formData, [name]: value, PNDT: "" });
      }
      if (name === "DefaultSampleTypeId") {
        setFormData({ ...formData, [name]: value, DefaultSampleType: label });
      }
      if (name === "SampleOption") {
        const isNotRequired = value === "Sample Not Required";
        setFormData({
          ...formData,
          [name]: value,
          DefaultSampleType: isNotRequired ? "" : formData?.DefaultSampleType,
          DefaultSampleTypeId: isNotRequired
            ? ""
            : formData?.DefaultSampleTypeId,
          SampleTypeId: isNotRequired ? "" : formData?.SampleTypeId,
          SampleQty: isNotRequired ? "" : formData?.SampleQty,
        });
        if (isNotRequired) setSelectedSamples([]);
      } else if (name === "subDepartmentID") {
        setFormData({ ...formData, [name]: value, subDepartmentName: label });
      } else if (name === "Attachement") {
        setFormData({ ...formData, [name]: value, AttachementName: label });
      } else if (name == "DepartmentID") {
        setFormData({ ...formData, [name]: value, DepartmentName: label });
        GetSubDepartments(value);
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };
  const handleMultiSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileChange = (value, label) => {
    if (value !== undefined) {
      setMapTestTableData((prev) => {
        const ItemIndex = prev?.findIndex((e) => e?.TestId == value);
        if (ItemIndex === -1) {
          const lastItem = prev?.[prev.length - 1];
          const nextSeq = lastItem ? Number(lastItem.PrintSequence) + 1 : 1;
          return [
            ...prev,
            {
              TestId: value,
              TestName: label,
              TestPrefix: "",
              Header: 0,
              Critical: 0,
              AMR: "",
              Reflex: "",
              Comment: 0,
              Bold: 0,
              Underline: 0,
              PrintSeprate: 0,
              HelpValue: 0,
              dlcCheck: 0,
              ShortName: "",
              PrintSequence: nextSeq,
            },
          ];
        } else {
          toast.error("Duplicate Test Found");
          return prev;
        }
      });
    }
  };

  const handleReactSelect = (name, e) => {
    // Clear validation errors dynamically
    clearValidationError(name);
    if (name == "DepartmentID") {
      setFormData({ ...formData, [name]: e?.value, DepartmentName: e?.label });
      GetSubDepartments(e?.value);
      fetchLastCreatedInvestigation(formData?.DataType, e?.value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: e?.value }));
    }
  };

  const handleChanges = (e) => {
    const { name, value, checked, type } = e.target;
    console.log(name, value, checked, type);

    // Clear validation errors dynamically
    clearValidationError(name);

    if (name === "TestCode") {
      setFormData({
        ...formData,
        [name]: !/[^a-zA-Z0-9 \*\-]/.test(value)
          ? value.trim().toUpperCase()
          : formData[name],
      });
    } else if (name === "TATIntimate") {
      if (value?.length > 5) {
        return;
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else if (name === "IsDLCcheck") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      });

      const datas = MapTestTableData?.map((ele) => {
        return {
          ...ele,
          dlcCheck: 0,
        };
      });

      setMapTestTableData(datas);
    } else {
      const val = type === "checkbox" ? (checked ? 1 : 0) : value;
      setFormData({
        ...formData,
        [name]: val,
        ...(name?.toLowerCase() === "allowquantity"
          ? {
              Allowquantity: val,
            }
          : {}),
      });
    }
  };

  const getInvestigationEditState = (item) => ({
    other: {
      button: "Update",
      pageName: "Edit",
      showButton: true,
    },
    url1: `Investigations/EditInvestigation?id=${item?.InvestigationID}&DataType=${item?.DataType}`,
    url: "Investigations/UpdateInvestigation",
  });

  const openInvestigationFromList = (item) => {
    const editState = getInvestigationEditState(item);
    setShowList(false);
    setDataForUpdate({
      url1: editState.url1,
      url: editState.url,
    });
    navigate("/Investigations", {
      replace: true,
      state: editState,
    });
    Fetch(editState.url1);
  };

  const handleCreateNew = (event) => {
    event?.stopPropagation?.();
    setShowList(false);
    navigate(`/Investigations`, {
      state: {
        url: "Investigations/CreateInvestigation",
      },
    });
    setNavData({
      ...navData,
      InvName: "",
      InvId: "",
      DataType: "",
    });
    setDataForUpdate({
      url1: null,
      url: null,
    });
    setInvDetails({});
    setSpecializationList([]);
    setFormData({
      InvestigationID: "",
      ConcentForm: "",
      HistoSeries: "",
      PrintName: "",
      DataType: "Test",
      TestName: "",
      DepartmentID: "",
      TestCode: "",
      BarcodeGroup:"",
      ReportType: "",
      ReportFormat: [],
      isActive: "1",
      FromAge: "0",
      ToAge: "99999",
      SampleOption: "Sample Not Required",
      SampleQty: "",
      SampleRemarks: "",
      BaseRate: "",
      MaxRate: "",
      MicroReportType: "",
      DefaultSampleType: "",
      DefaultSampleTypeId: "",
      Gender: "",
      BillingCategory: "1",
      AutoConsume: "",
      SampleContainer: "",
      LogisticTemp: "",
      IsMultipleDoctor: "",
      PrintCumulative: "",
      Reporting: "",
      PrintSampleName: "",
      Booking: "",
      showPatientReport: "",
      ShowAnalysisReport: "",
      OnlineReport: "",
      IsEditableOtherTestRate: 0,
      AutoSave: "",
      PrintSeparate: "",
      Urgent: "",
      IsOrganism: "",
      IsCultureReport: "",
      IsMic: "",
      IsOutSource: "",
      IsRateTypeSpecific: 0,
      IsCulture: "",
      IsAllergy: 0,
      IsDLCcheck: "",
      SampleDefined: "",
      SampleTypeId: "",
      RequiredAttachment: [],
      isMandatory: "",
      MethodName: "",
      ShortName: "",
      IsCovid: "",
      PNDT: "",
      StatSample: "",
      IsHisto: 0,
      PricksNotRequired: "",
      DualAuthentication: 0,
      Suffix: "",
      FullCultureReport: 0,
      ShowInWebSite: 0,
      HideSourceofSample: 0,
      AllowAutoApprovalWithoutrange: 0,
      RoundOff: "",
      RequiredFields: [],
      ICDCode: "",
      TATIntimate: 0,
      TestFor: "0",
      IsInfectionControl: 0,
      Allowquantity: 0,
    });
  };

  const getInvestigationList = (isActive = 1) => {
    axiosInstance
      .get(`Investigations/BindInvestigationList?isActive=${isActive}`)
      .then((res) => {
        let data = res.data.message;
        setLoading(false);

        let MapTest = data.map((ele) => {
          return {  
            value: ele.InvestigationID,
            // label: ele.TestName,
            label: `${ele?.TestCode} - ${ele?.TestName}`,
            DataType: ele?.DataType,
            fullName: `${ele?.TestName}, TestCode :${ele?.TestCode}, InvestigationID : ${ele?.InvestigationID}, DataType : ${ele?.DataType}`,
            // fullName: `${ele?.TestName}-${ele?.TestCode}-${ele?.InvestigationID}-${ele?.DataType}`
          };
        });

        setMapTest(MapTest);
      })
      .catch((err) => console.log(err));
  };

  const getLogisticTemp = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "LogisticTemperature",
      })
      .then((res) => {
        let data = res.data.message;
        let LogisticTemp = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        return setLogisticTemp(LogisticTemp);
      })
      .catch((err) => console.log(err));
  };
  const getRequiredAttachment = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "RequiredAttachment",
      })
      .then((res) => {
        let data = res.data.message;
        let RequiredAttachment = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        return setRequiredAttachment(RequiredAttachment);
      })
      .catch((err) => console.log(err));
  };
  const getConcentForm = () => {
    axiosInstance
      .get("Investigations/BindConcentForm")
      .then((res) => {
        let data = res.data.message;
        let ConcentForm = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.ConcentFormName,
          };
        });
        return setConcentForm(ConcentForm);
      })
      .catch((err) => console.log(err));
  };
  const getPNDT = () => {
    axiosInstance
      .get("Investigations/BindPNDT")
      .then((res) => {
        let data = res.data.message;
        let ConcentForm = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele?.Pndtname,
          };
        });
        return setPNDT(ConcentForm);
      })
      .catch((err) => console.log(err));
  };

  const getSampleContainer = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "SampleContainer",
      })
      .then((res) => {
        let data = res.data.message;
        let SampleContainer = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        return setSampleContainer(SampleContainer);
      })
      .catch((err) => console.log(err));
  };
  const getSampleType = () => {
    axiosInstance
      .get("SampleType/getSampleTypeByInvestigation")
      .then((res) => {
        let data = res.data.message;
        console.log("SampleType data:", data);
        let SampleType = data.map((ele) => {
          return {
            value: ele.id,
            label: ele.SampleName,
          };
        });
        return setSampleType(SampleType);
      })
      .catch((err) => console.log(err));
  };

  const getBillingCategory = () => {
    if (state?.url1) setEditLoading(true);
    axiosInstance
      .get("Investigations/BindBillingCategory")
      .then((res) => {
        let data = res.data.message;
        let BillingCategory = data.map((ele) => {
          return {
            value: ele.BillingCategoryId,
            label: ele.BillingCategoryName,
          };
        });
        getDepartment(
          setDepartmentData,
          "getDepartmentEmployeeMaster",
          false,
          setCheckField,
        );
        return setBillingCategory(BillingCategory);
      })
      .catch((err) => {
        getDepartment(
          setDepartmentData,
          "getDepartmentEmployeeMaster",
          false,
          setCheckField,
        );
        console.log(err);
      });
  };

  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });

        switch (name) {
          case "Gender":
            const extractedGenders = value
              ?.filter((option) => option?.value != "Other")
              .map((option) => {
                return {
                  value: option?.value,
                  label: option?.label,
                };
              });

            setGender(extractedGenders);
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  const handleAddTestChange = (e) => {
    const { name, value, checked, type } = e.target;
    setAddTestFormData({
      ...addTestFormData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSaveNewTest = () => {
    if (!addTestFormData.TestName) {
      toast.error("Please Enter Test Name");
      return;
    }
    if (!addTestFormData.Gender) {
      toast.error("Please Select Gender");
      return;
    }

    setLoad(true);
    const payload = getTrimmedData({
      Observation: [],
      Investigation: [
        (() => {
          const {
            allowQuantity,
            AllowQuantity,
            allowquantity,
            Allowquantity: _discard,
            ...cleanFormData
          } = formData;
          return {
            ...cleanFormData,
            InvestigationID: String(formData?.InvestigationID) || "",
            ConcentForm: String(formData?.ConcentForm),
            TestName: addTestFormData.TestName,
            TestCode: addTestFormData.TestCode,
            Gender: addTestFormData.Gender,
            Booking: addTestFormData.Booking,
            Reporting: addTestFormData.Reporting,
            isActive: String(formData?.isActive),
            PrintCumulative: String(formData?.PrintCumulative),
            SampleDefined: String(formData?.SampleDefined),
            PNDT: String(formData?.PNDT),
            RoundOff: Number(formData?.RoundOff),
            DataType: "Test",
            IsMultipleDoctor: String(formData?.IsMultipleDoctor),
            ReportType: formData?.ReportType,
            SampleTypeId: formData?.SampleTypeId,
            subDepartmentID: Number(formData?.subDepartmentID) || 0,
            SubDepartmentName: formData?.subDepartmentName,
            attachmentRequired: {
              requiredAttachment: formData?.AttachementName,
              attachmentID: Number(formData?.Attachement) || 0,
            },
            TestFor: String(formData?.TestFor || "0"),
            Allowquantity: (formData?.Allowquantity ?? formData?.AllowQuantity ?? formData?.allowQuantity ?? formData?.allowquantity) ? 1 : 0,
          };
        })(),
      ],
    });

    axiosInstance
      .post("Investigations/CreateInvestigation", payload)
      .then((res) => {
        setLoad(false);
        if (res.data.success) {
          toast.success(res.data.message);
          const newTestId =
            res.data.investigationID ||
            res.data.id ||
            res.data.message?.split(":")?.[1]?.trim();
          setShowAddTestModal(false);
          const addedTestName = addTestFormData.TestName;
          setAddTestFormData({
            TestName: "",
            TestCode: "",
            Gender: "",
            Booking: 1,
            Reporting: 1,
          });
          getInvestigationList(searchStatus);
          if (newTestId) {
            handleProfileChange(newTestId, addedTestName);
          }
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleToggleSearchModal = () => {
    setShowSearchModal(!showSearchModal);
    setSearchModalQuery("");
    setTempSelectedTests([]);
  };

  const fetchTestsByParent = (parentId, parentName, parentType) => {
    setProfileLoading(true);
    setSelectedProfileName(parentName);
    setSelectedProfileTests([]); // Clear previous results before new fetch
    axiosInstance
      .get(
        `Investigations/EditInvestigation?id=${parentId}&DataType=${parentType}`,
      )
      .then((res) => {
        const data =
          res.data?.observationData === "" ? [] : res.data?.observationData;
        const formattedTests = data.map((test) => ({
          value: test.TestId,
          label: `${test.TestCode ? test.TestCode + " - " : ""}${test.TestName}`,
          TestCode: test.TestCode,
          TestName: test.TestName,
          DataType: "Test",
          fullName: `${test.TestName}, TestCode :${test.TestCode}, InvestigationID : ${test.TestId}, DataType : Test`,
        }));
        setSelectedProfileTests(formattedTests);
        setShowSearchModal(true);
        setProfileLoading(false);
      })
      .catch((err) => {
        setProfileLoading(false);
        toast.error(`Error fetching ${parentType.toLowerCase()} tests`);
      });
  };

  const handleModalCheckboxChange = (test) => {
    setTempSelectedTests((prev) => {
      const isSelected = prev.find((item) => item.value === test.value);
      if (isSelected) {
        return prev.filter((item) => item.value !== test.value);
      } else {
        return [...prev, test];
      }
    });
  };

  const handleSelectAll = (checked) => {
    const filteredTests = selectedProfileTests.filter(
      (test) =>
        test.DataType === "Test" &&
        (test.label.toLowerCase().includes(searchModalQuery.toLowerCase()) ||
          test.fullName.toLowerCase().includes(searchModalQuery.toLowerCase())),
    );

    if (checked) {
      setTempSelectedTests((prev) => {
        const newSelection = [...prev];
        filteredTests.forEach((test) => {
          if (!newSelection.find((item) => item.value === test.value)) {
            newSelection.push(test);
          }
        });
        return newSelection;
      });
    } else {
      const filteredTestValues = new Set(filteredTests.map((t) => t.value));
      setTempSelectedTests((prev) =>
        prev.filter((item) => !filteredTestValues.has(item.value)),
      );
    }
  };

  const addSelectedTestsFromModal = () => {
    if (tempSelectedTests.length === 0) {
      handleToggleSearchModal();
      return;
    }

    setMapTestTableData((prev) => {
      let currentData = [...prev];
      let hasDuplicates = false;

      tempSelectedTests.forEach((test) => {
        const value = test.value;
        const itemName = test.label.split(" - ")[1] || test.label;
        const exists = currentData.some((e) => e.TestId == value);
        if (!exists) {
          const lastItem = currentData[currentData.length - 1];
          const nextSeq = lastItem ? Number(lastItem.PrintSequence) + 1 : 1;
          currentData.push({
            TestId: value,
            TestName: itemName,
            TestPrefix: "",
            Header: 0,
            Critical: 0,
            AMR: "",
            Reflex: "",
            Comment: 0,
            Bold: 0,
            Underline: 0,
            PrintSeprate: 0,
            HelpValue: 0,
            dlcCheck: 0,
            ShortName: "",
            PrintSequence: nextSeq,
          });
        } else {
          hasDuplicates = true;
        }
      });

      if (hasDuplicates) {
        toast.error("Some selected tests were duplicates and were skipped");
      }
      return currentData;
    });

    handleToggleSearchModal();
  };

  const handleCheckDuplicate = () => {
    return new Promise((resolve, reject) => {
      axiosInstance
        .post("Investigations/checkDuplicateTestCode", {
          TestCode: formData?.TestCode,
          InvestigationID: formData?.InvestigationID
            ? formData?.InvestigationID
            : "",
        })
        .then((res) => {
          if (res?.data?.message === "TestCode Already Exists.") {
            toast.error(res?.data?.message);
            setFormData({ ...formData, TestCode: "" });
          }
          resolve(res?.data?.message);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setFormData({ ...formData, TestCode: "" });
          resolve(err?.response?.data?.message);
        });
    });
  };

  const handleMapTestChange = (e, index) => {
    const { name, value, checked, type } = e.target;
    const data = [...MapTestTableData];
    data[index][name] = type === "checkbox" ? (checked ? 1 : 0) : value;
    setMapTestTableData(data);
  };

  const handleFilter = (index) => {
    const data = MapTestTableData.filter((ele, i) => index !== i);
    setMapTestTableData(data);
    toast?.success("Removed Successfully");
  };

  const handlePrintSequenceValidtion = (e, index, TestId) => {
    const { value, name } = e.target;
    const data = MapTestTableData.filter((ele) => ele?.TestId !== TestId).map(
      (ele) => ele[name],
    );
    if (data.includes(parseInt(value))) {
      const val = [...MapTestTableData];
      val[index][name] = "";
      setMapTestTableData(val);
      toast.error("Value Already Exists");
    }
  };
  const fetchDid = () => {
    for (let i of DepartmentData) {
      if (
        i.label.toLowerCase() === "packeges" ||
        i.label.toLowerCase() === "packages"
      ) {
        return i.value;
      }
    }
  };

  const getMappingGlobalData = (state, name) => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: name,
      })
      .then((res) => {
        let data = res.data.message;
        let SampleContainer = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        return state(SampleContainer);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getDropDownData("Gender");
    getSampleType();
    getLogisticTemp();
    getRequiredAttachment();
    getConcentForm();
    getPNDT();
    getSampleContainer();
    getBillingCategory();
    getInvestigationList(searchStatus);
    getMappingGlobalData(setHabitsMaping, "Habits Mapping");
    getMappingGlobalData(
      setHealthConditionMapping,
      "Health Conditions Mapping",
    );
    getMappingGlobalData(setSpecialityMapping, "Specialty Mapping");
    getMappingGlobalData(setOrganMapping, "Organ Mapping");
    getMappingGlobalData(setDiseaseMapping, "Disease Mapping");
  }, []);

  console.log("sethabbit mapping", HabitsMaping);

  const handleNavSearch = () => {
    if (navData?.InvName == null) {
      toast.error("Firstly Select Any Investigation");
    } else {
      setDataForUpdate({
        ...dataForUpdate,
        url1: `Investigations/EditInvestigation?id=${navData?.InvId}&DataType=${navData?.DataType}`,
        url: "Investigations/UpdateInvestigation",
      });
      Fetch(
        `Investigations/EditInvestigation?id=${navData?.InvId}&DataType=${navData?.DataType}`,
      );
    }
  };
  const handleShowRemark = () => {
    setShowRemark(false);
  };
  const handleSaveremark = (payload) => {
    setFormData({ ...formData, SampleRemarks: payload });
    handleShowRemark();
  };

  const handleDragStart = (e, index) => {
    setDraggedRowIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedRowIndex === null) return;
    let updatedData = [...MapTestTableData];
    const [movedRow] = updatedData.splice(draggedRowIndex, 1); // remove dragged row
    updatedData.splice(dropIndex, 0, movedRow); // insert at new position

    setMapTestTableData(updatedData);
    setDraggedRowIndex(null);
  };

  const controllerDynamic = async () => {
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(PAGE_ID);
    setTabbingOrder(controllerTabbingOrder);
    const hasAllowQuantity = controllersData?.some(
      (c) => c?.ControlDisplayID?.toLowerCase() === "allowquantity"
    );
    if (!hasAllowQuantity && controllersData?.length > 0) {
      controllersData.push({
        ControlDisplayID: "Allowquantity",
        ControlDisplayName: "Allow Quantity",
        IsShow: 1,
        IsMandatory: 0,
        DisplayOrder: 999,
      });
    }
    setControllerDynamicList(controllersData);
  };

  // HideController
  const isHideController = (cntrId = "") => {
    if (showAlways(cntrId)) return true;
    if (!controllerDynamicList?.length) return true;
    const isPresent = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID?.toLowerCase() === cntrId?.toLowerCase(),
    );
    if (isPresent?.ControlDisplayID) {
      return !!isPresent?.IsShow;
    }
    return true;
  };

  const colorCodingData = [
    { color: "#FFFFFF", id: "1", labelKey: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "In Active" },
  ];
  // controller must be show
  const showAlways = (controlId) => {
    const showAlwaysList = [
      // "Centre Type",
    ];
    return showAlwaysList.includes(controlId);
  };

  useEffect(() => {
    controllerDynamic();
  }, []);

  const showTestDetails = (testData) => {
    setTestDetialsModalShow(true);

    fetch(testData?.TestId);
    // onMouseEnter={() => {
    //                           setProfileDetail([]);
    //                           setMouseHover({
    //                             index: index,
    //                             data: [],
    //                           });
    //                         }}
    //                         onMouseLeave={() => {
    //                           setMouseHover({
    //                             index: -1,
    //                             data: [],
    //                           });
    //                         }}
  };

  const showTestDetailList = () => {
    fetchProfileList();
    setTestDetailListModal(true);
  };

  const TestDetailsModal = () => {
    return (
      <>
        <Dialog
          visible={testDetialsModalShow}
          header={t("Test Details")}
          className={theme}
          style={{
            width: isMobile ? "80vw" : "55vw",
          }}
          onHide={() => setTestDetialsModalShow(false)}
        >
          {profileDetail.length > 0 ? (
            <div className="resultEntryCssTable w-100">
              <Tables
                className="table table-bordered table-hover table-striped"
                id="tbRecordTest"
                cellPadding="0"
                cellSpacing="0"
              >
                <thead className="cf">
                  <tr>
                    <th>Department</th>
                    <th>Test/Profile</th>
                    <th>Test Name</th>
                  </tr>
                </thead>
                <tbody>
                  {profileDetail.map((data, idx) => (
                    <tr key={idx}>
                      <td>{data?.Department}</td>
                      <td>{data?.TestName}</td>
                      <td>{data?.DataType}</td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          ) : (
            <p className="text-center text-muted">{t("No data available")}</p>
          )}
        </Dialog>
      </>
    );
  };

  const TestDetailListModal = () => {
    return (
      <>
        <Dialog
          visible={testDetailListModal}
          header={`View List`}
          className={theme}
          style={{
            width: isMobile ? "80vw" : "55vw",
            overflowY: "auto",
          }}
          onHide={() => setTestDetailListModal(false)}
        >
          <Accordion
            name={"Table Data"}
            defaultValue={true}
            notOpen={true}
            isBreadcrumb={true}
            linkTo={"#"}
            linkTitle={
              <>
                {colorCodingData.map(({ color, labelKey, id }) => (
                  <ColorCodingSearch
                    key={id}
                    color={color}
                    label={t(labelKey)}
                  />
                ))}
                <div className="d-flex justify-content-between align-items-center ml-4">
                  <strong>Number of Lists - {ProfileDetailList.length}</strong>
                </div>
              </>
            }
          >
            {ProfileDetailList.length > 0 ? (
              <div className="resultEntryCssTable w-100">
                <Tables
                  className="table table-bordered table-hover table-striped"
                  id="tbRecordTest"
                  cellPadding="0"
                  cellSpacing="0"
                >
                  <thead className="cf">
                    <tr>
                      <th>S.No</th>
                      <th>DataType</th>
                      <th>Department</th>
                      <th>InvestigationID</th>
                      <th>Test Code</th>
                      <th>Test Name</th>
                      <th>Sample Qty</th>
                      <th>Sample Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ProfileDetailList.map((data, idx) => (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor:
                            data?.isActive === 1 ? "#FFFFFF" : "#f5c6cb",
                        }}
                      >
                        <td>{idx + 1}</td>
                        <td>{data?.DataType}</td>
                        <td>{data?.Department}</td>
                        <td>{data?.InvestigationID}</td>
                        <td>{data?.TestCode}</td>
                        <td>{data?.TestName}</td>
                        <td>{data?.SampleQty == 0 ? " " : data?.SampleQty}</td>
                        <td>{data?.SampleRemark || " "}</td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            ) : (
              <p className="text-center text-muted">{t("No data available")}</p>
            )}
          </Accordion>
        </Dialog>
      </>
    );
  };

  if (showList) {
    return (
      <InvestigationsList
        embedded
        onCreateNew={handleCreateNew}
        onEdit={openInvestigationFromList}
      />
    );
  }

  return (
    <>
      {testDetialsModalShow && <TestDetailsModal />}
      {profileListLoading ? (
        <Loading />
      ) : (
        testDetailListModal && <TestDetailListModal />
      )}

      {showRemark && (
        <SampleRemark
          show={showRemark}
          handleShow={handleShowRemark}
          state={formData}
          PageName={formData?.SampleRemarks}
          handleSave={handleSaveremark}
          title={"Sample Remarks"}
        />
      )}
      <>
        <Accordion
          name={t("Investigations")}
          defaultValue={true}
          isBreadcrumb={true}
          notOpen={true}
          seconTitle={
            <>
              <div className="d-flex align-items-center flex-wrap">
                <CustomButton
                  text={t("PackageImport")}
                  icon="excel"
                  className="mx-2"
                  onClick={handleOpenImportDialog}
                />
                <CustomButton
                  text={t("Sample Type Import/Export")}
                  icon="excel"
                  className="mx-2"
                  onClick={handleOpenSampleTypeDialog}
                />
              </div>
              <div>
                <PageControlGear pageId={PAGE_ID} />
              </div>
              {invDetails?.InvestigationID && (
                <div
                  style={{ marginRight: "auto" }}
                  id="pr_id_11"
                  className="link-title-container d-none d-md-flex mx-3"
                >
                  <p className="mb-0">
                    <strong>Name</strong>: {invDetails?.TestName}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>TestCode</strong>: {invDetails?.TestCode}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>ID</strong> : {invDetails?.InvestigationID}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>DataType</strong> : {invDetails?.DataType}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>Created By</strong> : {invDetails?.CreatedByName}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>Created on</strong> : {invDetails?.dtEntry}
                  </p>
                </div>

              )}
            </>
          }
        // seconTitle={
        //   <div style={{ marginLeft: "auto" }}>

        //   </div>
        // }
        >
          <div className="row pt-2 pl-2 pr-2 mb-1">
            <div className="col-sm-6">
              <Input
                autoComplete="off"
                placeholder=" "
                lable="Search Any Test For Update"
                id="Search Any Test For Update"
                name="InvName"
                type="text"
                value={navData?.InvName}
                onChange={handleSearchChangeInv}
                onKeyDown={handleIndex}
                onBlur={(e) => {
                  autocompleteOnBlur(setFilterInv);
                  setTimeout(() => {
                    const data = filterInv.filter(
                      (ele) => ele?.label === e.target.value,
                    );
                    if (data.length === 0) {
                      setNavData({
                        ...navData,
                        InvName: "",
                        InvId: "",
                        DataType: "",
                      });
                    }
                  }, 500);
                }}
              />
              {dropFalse && filterInv.length > 0 && (
                <ul className="suggestion-data" style={{ zIndex: 99 }}>
                  {filterInv.map((data, index) => (
                    <li
                      onClick={() => handleListSearch(data)}
                      className={`${index === indexMatch && "matchIndex"}`}
                      key={index}
                    >
                      {data?.fullName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-auto d-flex align-items-center" style={{ gap: "16px" }}>
              <label className="m-0" style={{ fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>{t("Status")} :</label>
              <Form.Check
                type="switch"
                id="statusA e"
                label={t("Active")}
                className="m-0"
                checked={searchStatus === 1}
                onChange={() => handleStatusChange(1)}
              />
              <Form.Check
                type="switch"
                id="statusInactive"
                label={t("InActive")}
                className="m-0"
                checked={searchStatus === 0}
                onChange={() => handleStatusChange(0)}
              />
              <Form.Check
                type="switch"
                id="statusBoth"
                label={t("Both")}
                className="m-0"
                checked={searchStatus === 2}
                onChange={() => handleStatusChange(2)}
              />
            </div>
          
             
             

          </div>
          {console.log("controllerDynamicList", controllerDynamicList)}
          <div className="row pt-1 pl-2 pr-2">
            {controllerDynamicList
              ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
              .map((item) => {
                if (
                  item?.ControlDisplayID === "DataType" &&
                  isHideController("DataType")
                ) {
                  return (
                    <div className="col-sm-2 mb-1">
                      <SelectBox
                        onChange={handleSelectChange}
                        selectedValue={formData?.DataType}
                        options={DataType.filter((ele) => ele.value !== "")}
                        id="DataType"
                        lable="DataType"
                        name="DataType"
                        isDisabled={
                          localUserData?.SuperAdmin !== 1 && state?.url1
                        }
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "TestCode" &&
                  isHideController("TestCode")
                ) {
                  return (
                    <div className="col-sm-2 mb-1">
                      <Input
                        className="required-fields"
                        placeholder=" "
                        lable="Test Code"
                        id="TestCode"
                        value={formData?.TestCode}
                        type="text"
                        onChange={handleChanges}
                        name="TestCode"
                        onBlur={handleCheckDuplicate}
                        maxLength={10}
                        required
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "TestName" &&
                  isHideController("TestName")
                ) {
                  return (
                    <div className="col-sm-2 mb-1">
                      <Input
                        className="required-fields"
                        placeholder=" "
                        lable="Test Name"
                        id="TestName"
                        value={formData?.TestName}
                        onChange={handleChanges}
                        name="TestName"
                        type="text"
                        max={100}
                        required
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "BarcodeGroup" &&
                  isHideController("BarcodeGroup") &&
                  formData.DataType !== "Package"
                ) {
                  return (
                    <div className="col-sm-2 mb-1">
                      <Input
                        className="required-fields"
                        placeholder=" "
                        lable="Barcode Group"
                        id="BarcodeGroup"
                        value={formData?.BarcodeGroup}
                        onChange={handleChanges}
                        name="BarcodeGroup"
                        type="text"
                        maxLength={5}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "ICDCode" &&
                  isHideController("ICDCode")
                ) {
                  return (
                    <>
                      <Tooltip
                        target="#ICDCode"
                        content="International Classification of Diseases"
                        position="top"
                      />
                      <div className="col-sm-2 mb-1">
                        <Input
                          className="required-fields"
                          placeholder=" "
                          lable="ICD Code"
                          id="ICDCode"
                          value={formData?.ICDCode}
                          type="text"
                          onChange={handleChanges}
                          name="ICDCode"
                          maxLength={10}
                          required
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "ShortName" &&
                  isHideController("ShortName")
                ) {
                  return (
                    <div className="col-sm-2 mb-1">
                      <Input
                        placeholder=" "
                        lable="ShortName"
                        id="ShortName"
                        value={formData?.ShortName}
                        onChange={handleChanges}
                        name="ShortName"
                        type="text"
                        max={100}
                        required
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  (formData?.DataType === "Profile" ||
                    formData?.DataType === "Test") &&
                  item?.ControlDisplayID === "TATIntimate" &&
                  isHideController("TATIntimate")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        className="required-fields"
                        lable="TAT Intimate (mins)"
                        id="TATIntimate"
                        placeholder=" "
                        onChange={handleChanges}
                        value={formData?.TATIntimate}
                        name="TATIntimate"
                        type="number"
                        required
                        maxLength={5}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "PrintName" &&
                  isHideController("PrintName")
                ) {
                  return (
                    <div className="col-sm-2 mb-1">
                      <Input
                        lable="Lab Report"
                        id="Lab Report"
                        placeholder=" "
                        value={formData?.PrintName}
                        onChange={handleChanges}
                        name="PrintName"
                        type="text"
                        max={100}
                        required
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "DepartmentID" &&
                  isHideController("DepartmentID")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ flex: 1 }}>
                          <ReactSelect
                            className="required-fields"
                            dynamicOptions={[
                              { label: "Select Department", value: "" },
                              ...DepartmentData,
                            ]}
                            removeIsClearable={true}
                            id="DepartmentID"
                            placeholderName="Department"
                            value={formData?.DepartmentID}
                            onChange={handleReactSelect}
                            name="DepartmentID"
                          />
                        </div>
                        {lastCreatedInfo && (
                          <span
                            style={{ cursor: "pointer", color: "#2563eb", fontSize: 15, marginTop: 2, flexShrink: 0 }}
                            title={`Code: ${lastCreatedInfo.Code}\nID: ${lastCreatedInfo.InvestigationID}\nName: ${lastCreatedInfo.TestName}\nCreated By: ${lastCreatedInfo.CreatedByName}\nCreated Date: ${lastCreatedInfo.CreatedDate}`}
                          >
                            <DocumentSearchSVG />
                          </span>
                        )}
                      </div>
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "ReportType" &&
                  isHideController("ReportType")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        className="required-fields"
                        options={ReportTypeNew}
                        selectedValue={formData?.ReportType}
                        name="ReportType"
                        id="ReportType"
                        lable="Report Type"
                        isDisabled={
                          formData?.DataType === "Package" ? true : false
                        }
                        onChange={handleSelectChange}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "ReportFormat" &&
                  isHideController("ReportFormat") &&
                  formData?.ReportType === "21"
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      {/* { (formData?.ReportType === "21") &&  */}
                      <MultiSelectComp
                        options={ReportTypePreliminary}
                        label="Report Format"
                        id="ReportFormat"
                        value={formData?.ReportFormat}
                        name="ReportFormat"
                        onChange={handleMultiSelectChange}
                      />
                      {/* }             */}
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "SubDepartment" &&
                  isHideController("SubDepartment")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        className="required-fields"
                        options={[
                          { label: "Select Sub Department", value: "" },
                          ...subDepartments,
                        ]}
                        selectedValue={formData?.subDepartmentID}
                        name="subDepartmentID"
                        id="subDepartmentID"
                        lable="Sub Department"
                        onChange={handleSelectChange}
                        isDisabled={subDepartments.length === 0}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "SampleContainer" &&
                  isHideController("SampleContainer")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        className="required-fields"
                        options={[
                          { label: "Select...", value: "" },
                          ...SampleContainer,
                        ]}
                        selectedValue={formData?.SampleContainer}
                        name="SampleContainer"
                        id="SampleContainer"
                        lable="Sample Container"
                        isDisabled={
                          formData?.DataType === "Package" ? true : false
                        }
                        onChange={handleSelectChange}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "Gender" &&
                  isHideController("Gender")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        className="required-fields"
                        options={[{ label: "Gender...", value: "" }, ...Gender]}
                        id="Gender"
                        lable="Gender"
                        selectedValue={formData?.Gender}
                        onChange={handleSelectChange}
                        name="Gender"
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "FromAge" &&
                  isHideController("FromAge")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        lable="From Age(Days)"
                        id="From Age"
                        placeholder=" "
                        onChange={handleChanges}
                        value={formData?.FromAge}
                        name="FromAge"
                        onInput={(e) => number(e, 5)}
                        type="number"
                        required
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "ToAge" &&
                  isHideController("ToAge")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        lable="ToAge(Days)"
                        id="ToAge"
                        placeholder=" "
                        onChange={handleChanges}
                        value={formData?.ToAge}
                        name="ToAge"
                        onInput={(e) => number(e, 5)}
                        type="number"
                        required
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "BillingCategory" &&
                  isHideController("BillingCategory")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        id="BillingCategory"
                        lable="BillingCategory"
                        options={BillingCategory}
                        name="BillingCategory"
                        selectedValue={formData?.BillingCategory}
                        onChange={handleSelectChange}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "SampleOption" &&
                  isHideController("SampleOption")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        selectedValue={formData?.SampleOption}
                        options={SampleOption}
                        name="SampleOption"
                        id="SampleOption"
                        lable="SampleOption"
                        isDisabled={
                          formData?.DataType === "Package" ? true : false
                        }
                        onChange={handleSelectChange}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "SampleQty" &&
                  isHideController("SampleQty")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        lable="SampleQty"
                        type={"text"}
                        id="SampleQty"
                        placeholder=" "
                        onChange={handleChanges}
                        value={formData?.SampleQty}
                        name="SampleQty"
                        required
                        disabled={
                          formData?.DataType === "Package" ||
                            formData?.SampleOption === "Sample Not Required"
                            ? true
                            : false
                        }
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "LogisticTemp" &&
                  isHideController("LogisticTemp")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        options={[
                          { label: "Select", value: "" },
                          ...LogisticTemp,
                        ]}
                        selectedValue={formData?.LogisticTemp}
                        onChange={handleSelectChange}
                        name="LogisticTemp"
                        id="LogisticTemp"
                        lable="LogisticTemp"
                        isDisabled={
                          formData?.DataType === "Package" ? true : false
                        }
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "SampleTypeId" &&
                  isHideController("SampleTypeId")
                ) {
                  return (
                    <>
                      <div className="col-sm-2 mb-2 inv-sample-type-col">
                        <AddSampleTypeField
                          sampleTypeOptions={SampleType}
                          selectedSamples={selectedSamples}
                          formData={formData}
                          onSelectSample={handleSelectSampleType}
                          onRemoveSample={handleRemoveSample}
                        />
                        {item.IsMandatory === 1 &&
                          moreErrors?.[item?.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item?.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "DefaultSampleTypeId" &&
                  isHideController("DefaultSampleTypeId")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        selectedValue={formData?.DefaultSampleTypeId}
                        options={[
                          { label: "Select", value: "" },
                          ...selectedSamples,
                        ]}
                        id="DefaultSampleType"
                        lable="DefaultSampleType"
                        onChange={handleSelectChange}
                        name="DefaultSampleTypeId"
                        isDisabled={
                          formData?.DataType === "Package" ||
                            formData?.SampleOption === "Sample Not Required"
                            ? true
                            : false
                        }
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "ConcentForm" &&
                  isHideController("ConcentForm")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      {/* <SelectBox
                        options={[
                          { label: "Select", value: "" },
                          ...ConcentForm,
                        ]}
                        id="ConcentForm"
                        lable="ConcentForm"
                        selectedValue={formData?.ConcentForm}
                        onChange={handleSelectChange}
                        isDisabled={
                          formData?.DataType === "Package" ? true : false
                        }
                        name="ConcentForm"
                      /> */}
                      <MultiSelectComp
                        label="ConcentForm"
                        options={ConcentForm}
                        value={formData?.ConcentForm}
                        name="ConcentForm"
                        id="ConcentForm"
                        onChange={handleMultiSelectChange}
                        lable={t("Select ConcentForm")}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "BaseRate" &&
                  isHideController("BaseRate")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        className="required-fields"
                        lable="Base Rate"
                        id="BaseRate"
                        placeholder=" "
                        onChange={handleChanges}
                        value={formData?.BaseRate}
                        name="BaseRate"
                        type="number"
                        required
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "MaxRate" &&
                  isHideController("MaxRate")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        className="required-fields"
                        lable="Max Rate"
                        id="MaxRate"
                        placeholder=" "
                        onChange={handleChanges}
                        value={formData?.MaxRate}
                        name="MaxRate"
                        type="number"
                        required
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "RequiredAttachment" &&
                  isHideController("RequiredAttachment")
                ) {
                  return (
                    <>
                      {formData?.DataType !== "Package" && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <MultiSelectComp
                              options={RequiredAttachment}
                              label="RequiredAttachment"
                              id="RequiredAttachment"
                              value={formData?.RequiredAttachment}
                              name="RequiredAttachment"
                              onChange={handleMultiSelectChange}
                            />
                            {item?.IsMandatory === 1 &&
                              moreErrors?.[item.ControlDisplayID] && (
                                <div className="error-message">
                                  {moreErrors[item.ControlDisplayID]}
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "MethodName" &&
                  isHideController("MethodName")
                ) {
                  return (
                    <>
                      {formData?.DataType !== "Profile" && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <Input
                              className="required-fields"
                              lable="Method Name"
                              id="MethodName"
                              placeholder=" "
                              onChange={handleChanges}
                              value={formData?.MethodName}
                              name="MethodName"
                              required
                            />
                            {item?.IsMandatory === 1 &&
                              moreErrors?.[item.ControlDisplayID] && (
                                <div className="error-message">
                                  {moreErrors[item.ControlDisplayID]}
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "Attachement" &&
                  isHideController("Attachement")
                ) {
                  return (
                    <>
                      {formData?.DataType !== "Package" && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <SelectBox
                              options={Attachement}
                              id="Attachement"
                              lable="Select Attachment"
                              selectedValue={formData?.Attachement}
                              onChange={handleSelectChange}
                              name="Attachement"
                            />
                            {item?.IsMandatory === 1 &&
                              moreErrors?.[item.ControlDisplayID] && (
                                <div className="error-message">
                                  {moreErrors[item.ControlDisplayID]}
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "TestRefund" &&
                  isHideController("TestRefund")
                ) {
                  return (
                    <>
                      {formData?.DataType !== "Package" && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <Input
                              className="required-fields"
                              lable="Auto Refund Credit Period (Days)"
                              type={"number"}
                              id="TestRefund"
                              onChange={handleChanges}
                              value={formData?.TestRefund}
                              name="TestRefund"
                              onInput={(e) => number(e, 2)}
                              required
                            />
                            {item?.IsMandatory === 1 &&
                              moreErrors?.[item.ControlDisplayID] && (
                                <div className="error-message">
                                  {moreErrors[item.ControlDisplayID]}
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "TestRepeatAlert" &&
                  isHideController("TestRepeatAlert")
                ) {
                  return (
                    <>
                      {formData?.DataType !== "Package" && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <ReactSelect
                              dynamicOptions={TestRepeat}
                              id="TestRepeatAlert"
                              label="Test Repeat Alert"
                              value={formData?.TestRepeatAlert}
                              onChange={handleReactSelect}
                              name="TestRepeatAlert"
                              placeholderName={"Test Repeat Alert"}
                            />
                            {item?.IsMandatory === 1 &&
                              moreErrors?.[item.ControlDisplayID] && (
                                <div className="error-message">
                                  {moreErrors[item.ControlDisplayID]}
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "TestFor" &&
                  isHideController("TestFor")
                ) {
                  return (
                    <>
                      {/* {formData?.DataType !== "Package" && (
                          <> */}
                      <div className="col-sm-2 mb-2">
                        <ReactSelect
                          dynamicOptions={TestForOptions}
                          id="TestFor"
                          label="Test For"
                          value={formData?.TestFor}
                          onChange={handleReactSelect}
                          name="TestFor"
                          placeholderName={"Test For"}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    </>
                    //   )}
                    // </>
                  );
                }
                if (
                  item?.ControlDisplayID === "Suffix" &&
                  isHideController("Suffix")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <Input
                              type="text"
                              lable="Suffix"
                              id="Suffix"
                              placeholder=" "
                              onChange={handleChanges}
                              value={formData?.Suffix}
                              name="Suffix"
                              maxLength={2}
                            // onInput={(e) => number(e, 2)}
                            />
                            {item?.IsMandatory === 1 &&
                              moreErrors?.[item.ControlDisplayID] && (
                                <div className="error-message">
                                  {moreErrors[item.ControlDisplayID]}
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </>
                  );
                }

                if (
                  item?.ControlDisplayID === "RequiredFields" &&
                  isHideController("RequiredFields")
                ) {
                  return (
                    <>
                      {formData?.DataType !== "Package" && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <MultiSelectComp
                              options={RequiredFieldsOptions}
                              label="RequiredFields"
                              id="RequiredFields"
                              value={formData?.RequiredFields}
                              name="RequiredFields"
                              onChange={handleMultiSelectChange}
                            />
                            {item?.IsMandatory === 1 &&
                              moreErrors?.[item.ControlDisplayID] && (
                                <div className="error-message">
                                  {moreErrors[item.ControlDisplayID]}
                                </div>
                              )}
                          </div>
                        </>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "OverView" &&
                  isHideController("OverView")
                ) {
                  return (
                    <>
                      <div className="col-sm-12 mb-2">
                        <Input
                          type="text"
                          lable="OverView"
                          id="OverView"
                          placeholder=" "
                          onChange={handleChanges}
                          value={formData?.OverView}
                          name="OverView"
                        // onInput={(e) => number(e, 2)}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "RoundOff" &&
                  isHideController("RoundOff")
                ) {
                  return (
                    <>
                      {["Test"]?.includes(formData?.DataType) &&
                        ["1"]?.includes(formData?.ReportType) && (
                          <div className="col-sm-2 mb-2">
                            <ReactSelect
                              dynamicOptions={roundOffOptions}
                              name={"RoundOff"}
                              id={"RoundOff"}
                              placeholderName={t("RoundOff")}
                              value={String(formData?.RoundOff)}
                              onChange={handleReactSelect}
                            />
                            {item?.IsMandatory === 1 &&
                              moreErrors?.[item.ControlDisplayID] && (
                                <div className="error-message">
                                  {moreErrors[item.ControlDisplayID]}
                                </div>
                              )}
                          </div>
                        )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "PNDT" &&
                  isHideController("PNDT")
                ) {
                  return (
                    <>
                      {(formData?.Gender == "Female" ||
                        formData?.Gender == "Both") && (
                          <>
                            <div className="col-sm-2 mb-2">
                              <SelectBox
                                options={[
                                  { label: "Select", value: "" },
                                  ...PNDT,
                                ]}
                                lable="PNDT"
                                id="PNDT"
                                selectedValue={formData?.PNDT}
                                onChange={handleSelectChange}
                                isDisabled={
                                  formData?.DataType === "Package" ? true : false
                                }
                                name="PNDT"
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          </>
                        )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "Reporting" &&
                  isHideController("Reporting")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="Reporting"
                        name="Reporting"
                        label={t("Reporting")}
                        checked={formData?.Reporting}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "Booking" &&
                  isHideController("Booking")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="Booking"
                        name="Booking"
                        label={t("Booking")}
                        checked={formData?.Booking}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "showPatientReport" &&
                  isHideController("showPatientReport")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="showPatientReport"
                        name="showPatientReport"
                        label={t("ShowPatientReport")}
                        checked={formData?.showPatientReport}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "OnlineReport" &&
                  isHideController("OnlineReport")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="OnlineReport"
                        name="OnlineReport"
                        label={t("OnlineReport")}
                        checked={formData?.OnlineReport}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "IsEditableOtherTestRate" &&
                  isHideController("IsEditableOtherTestRate")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="IsEditableOtherTestRate"
                        name="IsEditableOtherTestRate"
                        label={t("IsEditableOtherTestRate")}
                        checked={formData?.IsEditableOtherTestRate}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "AutoSave" &&
                  isHideController("AutoSave")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="AutoSave"
                        name="AutoSave"
                        label={t("AutoSave")}
                        checked={formData?.AutoSave}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "PrintSeparate" &&
                  isHideController("PrintSeparate")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="PrintSeparate"
                        name="PrintSeparate"
                        label={t("PrintSeparate")}
                        checked={formData?.PrintSeparate}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "isMandatory" &&
                  isHideController("isMandatory")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="isMandatory"
                        name="isMandatory"
                        label={t("IsMandatory")}
                        checked={formData?.isMandatory}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "IsAllowHomeCollection" &&
                  isHideController("IsAllowHomeCollection")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="IsAllowHomeCollection"
                        name="IsAllowHomeCollection"
                        label={t("IsAllowHomeCollection")}
                        checked={formData?.IsAllowHomeCollection}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "PrintSampleName" &&
                  isHideController("PrintSampleName")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="PrintSampleName"
                        name="PrintSampleName"
                        label={t("Print Sample Name")}
                        checked={formData?.PrintSampleName}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "IsOutSource" &&
                  isHideController("IsOutSource")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="IsOutSource"
                        name="IsOutSource"
                        label={t("IsOutSource")}
                        checked={formData?.IsOutSource}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "IsRateTypeSpecific" &&
                  isHideController("IsRateTypeSpecific")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="IsRateTypeSpecific"
                        name="IsRateTypeSpecific"
                        label={t("IsRateTypeSpecific")}
                        checked={formData?.IsRateTypeSpecific}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "IsDLCcheck" &&
                  isHideController("IsDLCcheck")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="IsDLCcheck"
                        name="IsDLCcheck"
                        label={t("IsDLCcheck")}
                        checked={formData?.IsDLCcheck}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "IsCovid" &&
                  isHideController("IsCovid")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="IsCovid"
                        name="IsCovid"
                        label={t("IsCovid")}
                        checked={formData?.IsCovid}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "PricksNotRequired" &&
                  isHideController("PricksNotRequired")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="PricksNotRequired"
                        name="PricksNotRequired"
                        label={t("PricksNotRequired")}
                        checked={formData?.PricksNotRequired}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "DualAuthentication" &&
                  isHideController("DualAuthentication")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="DualAuthentication"
                        name="DualAuthentication"
                        label={t("DualAuthentication")}
                        checked={formData?.DualAuthentication}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "AllowAutoApprovalWithoutrange" &&
                  isHideController("AllowAutoApprovalWithoutrange")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="AllowAutoApprovalWithoutrange"
                        name="AllowAutoApprovalWithoutrange"
                        label={t("AutoApproval W/O Range")}
                        checked={formData?.AllowAutoApprovalWithoutrange}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "ShowInWebSite" &&
                  isHideController("ShowInWebSite")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="ShowInWebSite"
                        name="ShowInWebSite"
                        label={t("ShowInWebSite")}
                        checked={formData?.ShowInWebSite}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "HideSourceOfSample" &&
                  isHideController("HideSourceOfSample")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="HideSourceofSample"
                        name="HideSourceofSample"
                        label={t("HideSourceofSample")}
                        checked={formData?.HideSourceofSample}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "allowSmartReport" &&
                  isHideController("allowSmartReport")
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="allowSmartReport"
                        name="allowSmartReport"
                        label={t("Allow Smart Report")}
                        checked={formData?.allowSmartReport}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "allowDuplicateBooking" &&
                  isHideController("allowDuplicateBooking")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="allowDuplicateBooking"
                            name="allowDuplicateBooking"
                            label={t("Allow Duplicate Booking")}
                            checked={formData?.allowDuplicateBooking}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "macReadingOnly" &&
                  isHideController("macReadingOnly")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="MacReadingOnly"
                            name="MacReadingOnly"
                            label={t("Mac Reading Only")}
                            checked={formData?.MacReadingOnly}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "IsMarkTest" &&
                  isHideController("IsMarkTest")
                ) {
                  return (
                    <>
                      {(formData?.DataType !== "Package" ||
                        formData?.Gender == "Female") && (
                          <div
                            style={{ minWidth: "fit-content" }}
                            className="col-sm-2 mb-1 d-flex align-items-center"
                          >
                            <Form.Check
                              type="switch"
                              id="IsMarkerTest"
                              name="IsMarkerTest"
                              label={t("Is Marker Test")}
                              checked={formData?.IsMarkerTest}
                              onChange={(e) => handleChanges(e)}
                              className="m-0"
                            />
                          </div>
                        )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "MarkerFromDays" &&
                  isHideController("MarkerFromDays") &&
                  formData?.IsMarkerTest
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        type="text"
                        lable="MarkerFromDays"
                        id="MarkerFromDays"
                        placeholder=" "
                        onChange={handleChanges}
                        value={formData?.MarkerFromDays}
                        name="MarkerFromDays"
                      // maxLength={2}
                      // onInput={(e) => number(e, 2)}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "MarkerToDays" &&
                  isHideController("MarkerToDays") &&
                  formData?.IsMarkerTest
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        type="text"
                        lable="MarkerToDays"
                        id="MarkerToDays"
                        placeholder=" "
                        onChange={handleChanges}
                        value={formData?.MarkerToDays}
                        name="MarkerToDays"
                      // maxLength={2}
                      // onInput={(e) => number(e, 2)}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "MinReadingCategory" &&
                  isHideController("MinReadingCategory")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="MinReadingCategory"
                            name="MinReadingCategory"
                            label={t("Min Reading Mandatory")}
                            checked={formData?.MinReadingCategory}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "MaxReadingCategory" &&
                  isHideController("MaxReadingCategory")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="MaxReadingCategory"
                            name="MaxReadingCategory"
                            label={t("Max Reading Mandatory")}
                            checked={formData?.MaxReadingCategory}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "DisplayReading" &&
                  isHideController("DisplayReading")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="DisplayReading"
                            name="DisplayReading"
                            label={t("Display Mandatory")}
                            checked={formData?.DisplayReading}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "UnitReading" &&
                  isHideController("UnitReading")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="UnitReading"
                            name="UnitReading"
                            label={t("Unit Mandatory")}
                            checked={formData?.UnitReading}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "MethodMandatory" &&
                  isHideController("MethodMandatory")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="MethodMandatory"
                            name="MethodMandatory"
                            label={t("Method Mandatory")}
                            checked={formData?.MethodMandatory}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "AllowEditCalculation" &&
                  isHideController("AllowEditCalculation")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="AllowEditCalculation"
                            name="AllowEditCalculation"
                            label={t("Allow Edit Calculation")}
                            checked={formData?.AllowEditCalculation}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }
                if (
                  (item?.ControlDisplayID?.toLowerCase() === "allowquantity" ||
                    item?.ControlDisplayID === "Allowquantity") &&
                  isHideController(item?.ControlDisplayID)
                ) {
                  return (
                    <div
                      style={{ minWidth: "fit-content" }}
                      className="col-sm-2 mb-1 d-flex align-items-center"
                    >
                      <Form.Check
                        type="switch"
                        id="Allowquantity"
                        name="Allowquantity"
                        label={t("Allow Quantity")}
                        checked={Boolean(formData?.Allowquantity)}
                        onChange={(e) => handleChanges(e)}
                        className="m-0"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "ViewProfileList" &&
                  isHideController("ViewProfileList")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Test" &&
                        invDetails?.InvestigationID && (
                          <div
                            style={{ minWidth: "fit-content" }}
                            className="col-sm-auto mb-1 d-flex align-items-center"
                          >
                            <CustomButton
                              text={t("View Profile List")}
                              onClick={showTestDetailList}
                            />
                          </div>
                        )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "ViewPackageList" &&
                  isHideController("ViewPackageList")
                ) {
                  return (
                    <>
                      {formData?.DataType == "Profile" &&
                        invDetails?.InvestigationID && (
                          <div
                            style={{ minWidth: "fit-content" }}
                            className="col-sm-auto mb-1 d-flex align-items-center"
                          >
                            <CustomButton
                              text={t("View Package List")}
                              onClick={showTestDetailList}
                            />
                          </div>
                        )}
                    </>
                  );
                }

                if (
                  item?.ControlDisplayID === "IsFasting" &&
                  isHideController("IsFasting")
                ) {
                  return (
                    <>
                      <div
                        style={{ minWidth: "fit-content" }}
                        className="col-sm-2 mb-1 d-flex align-items-center"
                      >
                        <Form.Check
                          type="switch"
                          id="IsFasting"
                          name="IsFasting"
                          label={t("IsFasting")}
                          checked={formData?.IsFasting}
                          onChange={(e) => handleChanges(e)}
                          className="m-0"
                        />
                      </div>
                    </>
                  );
                }

                if (
                  item?.ControlDisplayID === "Urgent" &&
                  isHideController("Urgent")
                ) {
                  return (
                    <>
                      <div
                        style={{ minWidth: "fit-content" }}
                        className="col-sm-2 mb-1 d-flex align-items-center"
                      >
                        <Form.Check
                          type="switch"
                          id="Urgent"
                          name="Urgent"
                          label={t("Is Urgent")}
                          checked={formData?.Urgent}
                          onChange={(e) => handleChanges(e)}
                          className="m-0"
                        />
                      </div>
                    </>
                  );
                }

                if (
                  item?.ControlDisplayID === "IsHisto" &&
                  isHideController("IsHisto")
                ) {
                  return (
                    <>
                      <div
                        style={{ minWidth: "fit-content" }}
                        className="col-sm-2 mb-1 d-flex align-items-center"
                      >
                        <Form.Check
                          type="switch"
                          id="IsHisto"
                          name="IsHisto"
                          label={t("Allow Histo Grossing")}
                          checked={formData?.IsHisto}
                          onChange={(e) => handleChanges(e)}
                          className="m-0"
                        />
                      </div>
                      {formData?.DataType === "Test" && (
                        <div
                          style={{ minWidth: "fit-content" }}
                          className="col-sm-2 mb-1 d-flex align-items-center"
                        >
                          <Form.Check
                            type="switch"
                            id="AllowHistoricalGraph"
                            name="AllowHistoricalGraph"
                            label={t("Allow Historical Graph")}
                            checked={formData?.AllowHistoricalGraph}
                            onChange={(e) => handleChanges(e)}
                            className="m-0"
                          />
                        </div>
                      )}
                    </>
                  );
                }

                if (
                  item?.ControlDisplayID === "IsInfectionControl" &&
                  isHideController("IsInfectionControl") &&
                  ["Test", "Profile"].includes(formData?.DataType)
                ) {
                  return (
                    <>
                      <div
                        style={{ minWidth: "fit-content" }}
                        className="col-sm-2 mb-1 d-flex align-items-center"
                      >
                        <Form.Check
                          type="switch"
                          id="IsInfectionControl"
                          name="IsInfectionControl"
                          label={t("Is Infection Control")}
                          checked={!!formData?.IsInfectionControl}
                          onChange={(e) => handleChanges(e)}
                          className="m-0"
                        />
                      </div>
                    </>
                  );
                }

                if (
                  item?.ControlDisplayID === "InvestigationsInterpretion" &&
                  isHideController("InvestigationsInterpretion")
                ) {
                  return (
                    <>
                      {((state?.other?.showButton && saved) ||
                        dataForUpdate?.url) &&
                        (formData?.DataType === "Profile" ||
                          formData?.DataType === "Test") && (
                          <div className="col-sm-auto mb-1">
                            <Link
                              to="/InvestigationsInterpretion"
                              state={{
                                InvestigationID: formData?.InvestigationID,
                                flag: dataForUpdate?.url1 ? true : false,
                                url1: dataForUpdate?.url1,
                                url: "Investigations/SearchRangeInterpreation",
                                data: formData?.TestName,
                              }}
                            >
                              <CustomButton text={t("Test Interpretation")} />
                            </Link>
                          </div>
                        )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "ReferenceRange" &&
                  isHideController("ReferenceRange")
                ) {
                  return (
                    <>
                      {((state?.other?.showButton && saved) ||
                        dataForUpdate?.url) &&
                        formData?.DataType === "Test" && (
                          <>
                            <div
                              id="ReferenceRange"
                              className="col-sm-auto mb-1"
                            >
                              <Link
                                to="/InvestigationRange"
                                state={{
                                  InvestigationID: formData?.InvestigationID,
                                  flag: dataForUpdate?.url1 ? true : false,
                                  url1: dataForUpdate?.url1,
                                  data: formData?.TestName,
                                }}
                              >
                                <CustomButton text={t("Reference Range")} />
                              </Link>
                            </div>

                            <div className="col-sm-auto mb-1">
                              <Link
                                to="/RequiredFields"
                                state={{
                                  url: "Investigations/RequiredFields",
                                  url1: dataForUpdate?.url1,
                                  flag: dataForUpdate?.url1 ? true : false,
                                  data: formData?.InvestigationID,
                                  TestName: formData?.TestName,
                                }}
                              >
                                <CustomButton text={t("Required Field")} />
                              </Link>
                            </div>

                            <div className="col-sm-auto mb-1">
                              <CustomButton
                                text={t("Help Menu")}
                                onClick={() => setShowHelpMenuDialog(true)}
                              />
                            </div>
                          </>
                        )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "RateTypeMapping" &&
                  isHideController("RateTypeMapping")
                ) {
                  return (
                    <>
                      {((state?.other?.showButton && saved) ||
                        dataForUpdate?.url) &&
                        formData?.IsRateTypeSpecific === 1 && (
                          <div
                            id="RateTypeMapping"
                            className="col-sm-auto mb-1"
                          >
                            <Link
                              to="/RateTypeMapping"
                              state={{
                                InvestigationID: formData?.InvestigationID,
                                data: formData?.TestName,
                                dataType: formData?.DataType,
                                RateTypeSpecific: formData?.IsRateTypeSpecific,
                                flag: dataForUpdate?.url1 ? true : false,
                              }}
                            >
                              <CustomButton text={t("Rate Type Mapping")} />
                            </Link>
                          </div>
                        )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "InvestigationsComment" &&
                  isHideController("InvestigationsComment")
                ) {
                  return (
                    <>
                      {((state?.other?.showButton && saved) ||
                        dataForUpdate?.url) &&
                        (formData?.DataType === "Profile" ||
                          formData?.DataType === "Test") && (
                          <div
                            id="InvestigationsComment"
                            className="col-sm-auto mb-1"
                          >
                            <Link
                              to="/InvestigationsComment"
                              state={{
                                InvestigationID: formData?.InvestigationID,
                                flag: dataForUpdate?.url1 ? true : false,
                                url1: dataForUpdate?.url1,
                                url: "Investigations/SearchRangeInterpreation",
                                data: formData?.TestName,
                              }}
                            >
                              <CustomButton text={t("InvestigationsComment")} />
                            </Link>
                          </div>
                        )}
                    </>
                  );
                }
                if (
                  item?.ControlDisplayID === "AllergyGroupMapping" &&
                  isHideController("AllergyGroupMapping")
                ) {
                  return (
                    <>
                      {((state?.other?.showButton && saved) ||
                        dataForUpdate?.url) &&
                        formData?.ReportType === "22" && (
                          <div
                            id="AllergyGroupMapping"
                            className="col-sm-auto mb-1"
                          >
                            <Link
                              to="/AllergyGroup"
                              state={{
                                InvestigationID: formData?.InvestigationID,
                                TestCode: formData?.TestCode,
                                flag: dataForUpdate?.url1 ? true : false,
                                url1: dataForUpdate?.url1,
                                dataType: formData?.DataType,
                                // url: "Investigations/SearchRangeInterpreation",
                                data: formData?.TestName,
                              }}
                            >
                              <CustomButton text={t("Allergy Group Mapping")} />
                            </Link>
                          </div>
                        )}
                    </>
                  );
                }
              })}
          </div>
          {["Profile", "Package"].includes(formData?.DataType) && (
            <>
              <div className="row pt-1 pl-2 pr-2">
                <div className="col-sm-5 mb-1">
                  <ReactSelect
                    dynamicOptions={MapTest}
                    value={null}
                    name="TestName"
                    placeholderName="Map Test"
                    onChange={(_, e) => {
                      if (
                        e?.DataType === "Package" ||
                        (e?.DataType === "Profile" &&
                          formData?.DataType === "Profile")
                      ) {
                        fetchTestsByParent(e?.value, e?.label, e?.DataType);
                      } else {
                        handleProfileChange(e?.value, e?.label);
                      }
                    }}
                  />
                </div>
                <i
                  className="bi bi-plus-circle-fill text-primary"
                  style={{ fontSize: "20px", cursor: "pointer" }}
                  onClick={() => setShowAddTestModal(true)}
                  title="Quick Add Test"
                ></i>
              </div>
              <div className="ml-2 mr-2 mt-1 mb-1">
                {loading ? (
                  <Loading />
                ) : (
                  <Tables>
                    <thead className="cf">
                      <tr>
                        <th>
                          <i className="bi bi-hand-index-thumb mb-0 px-2"></i>
                        </th>
                        <th>{t("Action")}</th>
                        <th>{t("S.No")}</th>
                        <th>{t("TestID")}</th>
                        <th>{t("TestCode")}</th>
                        <th>{t("Test Name")}</th>
                        <th>{t("Prefix")}</th>
                        {/*<th>{t("P.S")}</th>*/}
                        <th>{t("Header")}</th>
                        <th>{t("Critical")}</th>
                        <th>{t("Comment")}</th>
                        <th>{t("Bold")}</th>
                        <th>{t("UnderLine")}</th>
                        <th>{t("PrintSeprate")}</th>
                        <th>{t("HelpValueOnly")}</th>
                        <th>{t("Edit")}</th>
                        {formData?.IsDLCcheck === 1 && (
                          <th>{t("DLC Check")}</th>
                        )}
                        {formData?.DataType === "Package" && (
                          <>
                            <th>{t("Set Range")}</th>
                            <th>{t("InterPretation")}</th>
                          </>
                        )}
                        <th>{t("View")}</th>
                      </tr>
                    </thead>
                    {MapTestTableData.length > 0 && (
                      <tbody>
                        {MapTestTableData.map((ele, index) => (
                          <tr
                            key={index}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                          >
                            <td style={{ width: "2%" }}>
                              <div
                                title="Pick and move position"
                                className="grip_icon py-1 px-1"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                style={{ cursor: "grab" }}
                              >
                                {/* <i className="bi bi-grip-vertical mb-0"></i> */}
                                <LuGrip />
                              </div>
                            </td>
                            <td data-title={t("Action")}>
                              <button
                                className="btn btn-danger"
                                name="disableData"
                                onClick={() => handleFilter(index)}
                              >
                                X
                              </button>
                            </td>
                            <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                            <td data-title={t("TestID")}>
                              {ele?.TestId}&nbsp;
                            </td>
                            <td data-title={t("TestCode")}>
                              {ele?.TestCode}&nbsp;
                            </td>
                            <td data-title={t("Test Name")}>
                              {ele?.TestName}&nbsp;
                            </td>
                            <td className="TestPrefix" data-title={t("Prefix")}>
                              <Input
                                type="text"
                                value={ele?.TestPrefix}
                                name="TestPrefix"
                                onChange={(e) => handleMapTestChange(e, index)}
                              />
                            </td>
                            <td className="Header" data-title={t("Header")}>
                              <Form.Check
                                type="switch"
                                id={`Header-${index}`}
                                name="Header"
                                className="chk_header m-0"
                                checked={ele?.Header}
                                onChange={(e) => handleMapTestChange(e, index)}
                              />
                            </td>
                            <td className="Critical" data-title={t("Critical")}>
                              <Form.Check
                                type="switch"
                                id={`Critical-${index}`}
                                name="Critical"
                                className="chk_Critical m-0"
                                checked={ele?.Critical}
                                onChange={(e) => handleMapTestChange(e, index)}
                              />
                            </td>
                            <td className="Comment" data-title={t("Comment")}>
                              <Form.Check
                                type="switch"
                                id={`Comment-${index}`}
                                name="Comment"
                                className="chk_Comment m-0"
                                checked={ele?.Comment}
                                onChange={(e) => handleMapTestChange(e, index)}
                              />
                            </td>
                            <td className="Bold" data-title={t("Bold")}>
                              <Form.Check
                                type="switch"
                                id={`Bold-${index}`}
                                name="Bold"
                                className="chk_Bold m-0"
                                checked={ele?.Bold}
                                onChange={(e) => handleMapTestChange(e, index)}
                              />
                            </td>
                            <td
                              className="UnderLine"
                              data-title={t("UnderLine")}
                            >
                              <Form.Check
                                type="switch"
                                id={`Underline-${index}`}
                                name="Underline"
                                className="chk_Underline m-0"
                                checked={ele?.Underline}
                                onChange={(e) => handleMapTestChange(e, index)}
                              />
                            </td>
                            <td
                              className="PrintSeprate"
                              data-title={t("PrintSeprate")}
                            >
                              <Form.Check
                                type="switch"
                                id={`PrintSeprate-${index}`}
                                name="PrintSeprate"
                                className="chk_printSeprate m-0"
                                checked={ele?.Underline}
                                onChange={(e) => handleMapTestChange(e, index)}
                              />
                            </td>
                            <td
                              className="HelpValue"
                              data-title={t("Help Value Only")}
                            >
                              <Form.Check
                                type="switch"
                                id={`HelpValue-${index}`}
                                name="HelpValue"
                                className="chk_HelpValue m-0"
                                checked={ele?.HelpValue}
                                onChange={(e) => handleMapTestChange(e, index)}
                              />
                            </td>
                            <td data-title={t("Edit")}>
                              <i
                                className="fa fa-edit"
                                style={{ cursor: "pointer", color: "#21218b" }}
                                onClick={() => handleEdit(ele, index)}
                              />
                            </td>
                            {formData?.IsDLCcheck == 1 && (
                              <td className="dlcCheck" data-title={"DLC Check"}>
                                <Form.Check
                                  type="switch"
                                  id={`dlcCheck-${index}`}
                                  name="dlcCheck"
                                  className="check_DLC m-0"
                                  checked={ele?.dlcCheck}
                                  onChange={(e) =>
                                    handleMapTestChange(e, index)
                                  }
                                />
                              </td>
                            )}
                            {formData?.DataType === "Package" && (
                              <>
                                <td
                                  className="setRange"
                                  data-title={t("Set Range")}
                                >
                                  {(state?.url ==
                                    "Investigations/UpdateInvestigation" &&
                                    saved) ||
                                    dataForUpdate?.url1 != null ? (
                                    <Link
                                      to="/InvestigationRange"
                                      state={{
                                        InvestigationID: ele?.TestId,
                                        data: ele?.TestName,
                                        flag: dataForUpdate?.url1
                                          ? true
                                          : false,
                                        url1: dataForUpdate?.url1,
                                      }}
                                      style={{
                                        cursor: "pointer",
                                      }}
                                    >
                                      {t("SetRange")}
                                    </Link>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  className="inter"
                                  data-title={t("InterPretation")}
                                >
                                  {(state?.url ==
                                    "Investigations/UpdateInvestigation" &&
                                    saved) ||
                                    dataForUpdate?.url1 != null ? (
                                    <Link
                                      to="/InvestigationsInterpretion"
                                      state={{
                                        InvestigationID: ele?.TestId,
                                        flag: dataForUpdate?.url1
                                          ? true
                                          : false,
                                        url1: dataForUpdate?.url1,
                                        url: "Investigations/SearchRangeInterpreation",
                                        data: ele?.TestName,
                                      }}
                                    >
                                      {t("Test Interpretation")}
                                    </Link>
                                  ) : (
                                    ""
                                  )}
                                </td>
                              </>
                            )}
                            <td style={{ width: "3%" }}>
                              <div
                                onClick={() => showTestDetails(ele)}
                                className="d-flex justify-content-center align-items-center w-100 h-100 py-2"
                                title="View Details"
                                style={{ cursor: "pointer" }}
                              >
                                <i className="bi bi-eye mb-0"></i>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </Tables>
                )}
              </div>
            </>
          )}
        </Accordion>
        <Accordion title={t("Sample Type Options")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2 mb-1">
            <div className="col-sm-2">
              <MultiSelectComp
                options={HabitsMaping}
                value={formData?.HabitsMaping}
                onChange={handleMultiSelectChange}
                name="HabitsMaping"
                label={t("Habits Maping")}
              />
            </div>
            <div className="col-sm-2">
              <MultiSelectComp
                options={HealthConditionMapping}
                value={formData?.HealthConditionMapping}
                onChange={handleMultiSelectChange}
                name="HealthConditionMapping"
                label={t("Health Condition Mapping")}
              />
            </div>
            <div className="col-sm-2">
              <MultiSelectComp
                options={SpecialityMapping}
                value={formData?.SpecialityMapping}
                onChange={handleMultiSelectChange}
                name="SpecialityMapping"
                label={t("Speciality Mapping")}
              />
            </div>
            <div className="col-sm-2">
              <MultiSelectComp
                options={OrganMapping}
                value={formData?.OrganMapping}
                onChange={handleMultiSelectChange}
                name="OrganMapping"
                label={t("Organ Mapping")}
              />
            </div>
            <div className="col-sm-2">
              <MultiSelectComp
                options={DiseaseMapping}
                value={formData?.DiseaseMapping}
                onChange={handleMultiSelectChange}
                name="DiseaseMapping"
                label={t("Disease Mapping")}
              />
            </div>
          </div>
        </Accordion>

        <Accordion title={t("Actions")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2 pb-2">
            <div className="col-sm-2 d-flex col-6 mt-2">
              <Form.Check
                type="switch"
                id="isActive"
                name="isActive"
                label={t("Active")}
                onChange={handleChanges}
                checked={formData?.isActive}
              />
            </div>
            <div className="col-sm-2">
              <CustomButton
                className="btn btn-primary btn-block btn-sm"
                type="button"
                onClick={() => {
                  setShowRemark(true);
                }}
                text={t("Sample Remarks")}
                icon={"paperclip"}
              />
            </div>
           
            <div className="col-sm-1">
              {load || editLoading ? (
                <Loading />
              ) : (
                <SaveButton
                  className="btn btn-block btn-success btn-sm"
                  type="button"
                  onClick={handleSubmit}
                  text={
                    state?.other?.button && saved
                      ? t(state?.other?.button)
                      : dataForUpdate?.url
                        ? t("Update")
                        : t("Save")
                  }
                  loading={load || editLoading}
                />
              )}
            </div>
            <div>
              <button
                type="button"
                className="btn btn-success mr-2"
                title="Refresh"
                onClick={handleCreateNew}
              >
                <FaRedo />
              </button>
            </div>
            <div className="col-sm-2">
              <button
                type="button"
                className="btn btn-link p-0"
                style={{ fontSize: "13px" }}
                onClick={() => setShowList(true)}
              >
                {t("Back to List")}
              </button>
            </div>
            <div className="col-sm-2">
              <CustomButton
                id="btnAuditLog"
                icon="history"
                text={t("Audit Log")}
                onClick={() => setShowAuditLogModal(true)}
                className="mx-2 mb-1"
              />
            </div>
          </div>
        </Accordion>

        {/* Audit Log Dialog */}
        <Dialog
          header={t("Audit Log")}
          className={theme}
          visible={showAuditLogModal}
          style={{ width: isMobile ? "90vw" : "35vw" }}
          onHide={() => setShowAuditLogModal(false)}
          dismissableMask
        >
          <div className="row px-2 py-2">
            <div className="col-auto mb-3">
              <Form.Check
                type="switch"
                id="auditAllDate"
                name="auditAllDate"
                label={t("All Date")}
                checked={auditAllDate}
                onChange={(e) => setAuditAllDate(e.target.checked)}
              />
            </div>
            <div
              className="col-sm-3 mb-3"
              style={auditAllDate ? { cursor: "not-allowed" } : undefined}
            >
              <DatePicker
                className="custom-calendar audit-log-datepicker"
                name="auditFromDate"
                value={auditFromDate}
                onChange={handleAuditDateChange}
                placeholder=" "
                id="auditFromDate"
                lable="From Date"
                disabled={auditAllDate}
              />
            </div>
            <div
              className="col-sm-3 mb-3"
              style={auditAllDate ? { cursor: "not-allowed" } : undefined}
            >
              <DatePicker
                className="custom-calendar audit-log-datepicker"
                name="auditToDate"
                value={auditToDate}
                onChange={handleAuditDateChange}
                placeholder=" "
                id="auditToDate"
                lable="To Date"
                disabled={auditAllDate}
                minDate={auditFromDate}
              />
            </div>
            <div className="col-auto d-flex justify-content-start">
              {auditLoading ? (
                <Loading />
              ) : (
                <>
                  <CustomButton
                    id="btnAuditPdf"
                    icon="pdf"
                    text={t("PDF")}
                    onClick={() => handleAuditLogExport("Pdf")}
                    className="mx-2"
                  />
                  <CustomButton
                    id="btnAuditExcel"
                    icon="excel"
                    text={t("Excel")}
                    onClick={() => handleAuditLogExport("Excel")}
                    className="mx-2"
                  />
                </>
              )}
            </div>
          </div>
        </Dialog>

        <Dialog
          visible={showAddTestModal}
          header={t("Quick Add Test")}
          className={theme}
          style={{ width: "400px" }}
          onHide={() => setShowAddTestModal(false)}
        >
          <div className="row mt-2">
            <div className="col-sm-12 mb-2">
              <Input
                lable="Test Name"
                placeholder=" "
                id="QuickTestName"
                name="TestName"
                value={addTestFormData.TestName}
                onChange={handleAddTestChange}
                required
              />
            </div>
            <div className="col-sm-12 mb-2">
              <Input
                lable="Test Code"
                placeholder=" "
                id="QuickTestCode"
                name="TestCode"
                value={addTestFormData.TestCode}
                onChange={handleAddTestChange}
                required
              />
            </div>
            <div className="col-sm-12 mb-3">
              <SelectBox
                options={[{ label: "Select Gender", value: "" }, ...Gender]}
                lable="Gender"
                id="QuickGender"
                name="Gender"
                selectedValue={addTestFormData.Gender}
                onChange={handleAddTestChange}
                required
              />
            </div>
            <div className="col-sm-auto mb-2">
              <Form.Check
                type="switch"
                id="QuickBooking"
                name="Booking"
                label={t("Booking")}
                checked={addTestFormData.Booking}
                onChange={handleAddTestChange}
              />
            </div>
            <div className="col-sm-auto mb-2">
              <Form.Check
                type="switch"
                id="RestrictionForHomeCollection"
                name="RestrictionForHomeCollection"
                label={t("Restriction for Home Collection")}
                checked={addTestFormData.RestrictionForHomeCollection}
                onChange={handleAddTestChange}
              />
            </div>
            <div className="col-sm-auto mb-2">
              <Form.Check
                type="switch"
                id="QuickReporting"
                name="Reporting"
                label={t("Reporting")}
                checked={addTestFormData.Reporting}
                onChange={handleAddTestChange}
              />
            </div>
            <div className="col-sm-12 mt-3 d-flex justify-content-end">
              <CustomButton
                variant="primary"
                onClick={handleSaveNewTest}
                size="sm"
                className="mr-2"
                text={t("Save")}
              />
              <CustomButton
                variant="secondary"
                onClick={() => setShowAddTestModal(false)}
                size="sm"
                text={t("Cancel")}
              />
            </div>
          </div>
        </Dialog>

        <Dialog
          visible={showSearchModal}
          header={`${t("Search and Select Tests")} ${selectedProfileName ? "(" + selectedProfileName + ")" : ""}`}
          className={theme}
          style={{ width: "800px" }}
          onHide={handleToggleSearchModal}
        >
          {profileLoading ? (
            <Loading />
          ) : (
            <div className="row mt-2">
              <div className="col-sm-12 mb-2">
                <Input
                  placeholder="Search Test Name or Code..."
                  value={searchModalQuery}
                  onChange={(e) => setSearchModalQuery(e.target.value)}
                />
              </div>
              <div
                className="col-sm-12"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {(() => {
                  const filteredTests = selectedProfileTests.filter(
                    (test) =>
                      test.DataType === "Test" &&
                      (test.label
                        .toLowerCase()
                        .includes(searchModalQuery.toLowerCase()) ||
                        test.fullName
                          .toLowerCase()
                          .includes(searchModalQuery.toLowerCase())),
                  );
                  return (
                    <Tables>
                      <thead>
                        <tr>
                          <th>
                            <Form.Check
                              type="checkbox"
                              checked={
                                filteredTests.length > 0 &&
                                filteredTests.every((test) =>
                                  tempSelectedTests.some(
                                    (item) => item.value === test.value,
                                  ),
                                )
                              }
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                          </th>
                          <th>Test Code</th>
                          <th>Test Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTests.map((test) => (
                          <tr key={test.value}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={
                                  !!tempSelectedTests.find(
                                    (item) => item.value === test.value,
                                  )
                                }
                                onChange={() => handleModalCheckboxChange(test)}
                              />
                            </td>
                            <td>{test.label.split(" - ")[0]}</td>
                            <td>{test.label.split(" - ")[1] || test.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Tables>
                  );
                })()}
              </div>
            </div>
          )}
          <div className="col-sm-12 mt-3 d-flex justify-content-end">
            <CustomButton
              variant="primary"
              onClick={addSelectedTestsFromModal}
              size="sm"
              className="mr-2"
              text={`${t("Add Selected")} (${tempSelectedTests.length})`}
            />
            <CustomButton
              variant="secondary"
              onClick={handleToggleSearchModal}
              size="sm"
              text={t("Close")}
            />
          </div>
        </Dialog>
         {/* { import or export excel} */}
              <Dialog
                header={" Import Excel to Upload"}
                visible={showImportDialog}
                onHide={handleCloseImportDialog}
                style={{ width: "60vw" }}
                className={theme}
                modal
              >
                <>
                  <div className="row align-items-center">
                    <div className="col-12 col-sm-4 col-md-3 my-1">
                      <SelectBox
                        name="importDataType"
                        options={DataType.filter((ele) => ele.value !== "")}
                        lable="DataType"
                        id="importDataType"
                        selectedValue={importDialogDataType}
                        onChange={handleImportDialogDataTypeChange}
                      />
                    </div>
                    <div className="col-auto my-1">
                      <CustomButton
                        text={t("Download Excel")}
                        icon={"excel"}
                        className="mx-2"
                        onClick={handleDownloadTemplateExcel}
                      />
                    </div>
        
                    <div className="col-auto my-1">
                      <CustomButton
                        text={t("Upload Excel")}
                        icon={"excel"}
                        onClick={handleUploadClick}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                   {templateData.length > 0 && (
                          <div className="row p-2">
                            <div className="col-12">
                        <Heading
                          title={t("Investigation Master Data")}
                          secondTitle={
                            <div style={{ fontWeight: "700" }}>
                              {t("Total Records")} : {templateData.length}
                            </div>
                          }
                        />
        
                              <Tables>
                                <thead>
                                  <tr>
                                    <th>{t("S.No")}</th>
                                    {/* <th>{t("Type")}</th> */}
                                    <th>{t("PackageCode")}</th>
                                    <th>{t("PackageName")}</th>
                                    <th>{t("TestCode")}</th>
                                    <th>{t("TestName")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {templateData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      <td>{rowIndex + 1}</td>
                                      {/* <td>{row.DataType}</td> */}
                                      <td>{row.PackageCode}</td>
                                      <td>{row.PackageName}</td>
                                      <td>{row.TestCode}</td>
                                      <td>{row.TestName}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Tables>
                            </div>
                            <div className="col-12 mt-2 d-flex justify-content-end">
                              <SaveButton
                                text={t("Save Data")}
                                onClick={handleImportSave}
                                loading={importSaveLoading}
                                disabled={importSaveLoading}
                              />
                            </div>
                          </div>
                        )}
                </>
              </Dialog>

              {/* { Investigation Sample Type import / export } */}
              <Dialog
                header={t("Investigation Sample Type Import / Export")}
                visible={showSampleTypeDialog}
                onHide={handleCloseSampleTypeDialog}
                style={{ width: "60vw" }}
                className={theme}
                modal
              >
                <>
                  <div className="row align-items-center">
                    <div className="col-auto my-1">
                      <CustomButton
                        text={t("Download Excel")}
                        icon={"download"}
                        variant="success"
                        className="mx-2"
                        loading={sampleTypeExportLoading}
                        onClick={handleDownloadSampleTypeExcel}
                      />
                    </div>

                    <div className="col-auto my-1">
                      <CustomButton
                        text={t("Upload Excel")}
                        icon={"upload"}
                        onClick={handleSampleTypeUploadClick}
                      />
                      <input
                        ref={sampleTypeFileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        style={{ display: "none" }}
                        onChange={handleSampleTypeFileUpload}
                      />
                      {sampleTypeFileName && (
                        <span className="ms-2">{sampleTypeFileName}</span>
                      )}
                    </div>
                  </div>
                  {sampleTypeTemplateData.length > 0 && (
                    <div className="row p-2">
                      <div className="col-12">
                        <Heading
                          title={t("Investigation Sample Type Data")}
                          secondTitle={
                            <div style={{ fontWeight: "700" }}>
                              {t("Total Records")} : {sampleTypeTemplateData.length}
                            </div>
                          }
                        />

                        <Tables>
                          <thead>
                            <tr>
                              <th>{t("S.No")}</th>
                              <th>{t("InvestigationID")}</th>
                              <th>{t("TestName")}</th>
                              <th>{t("SampleType")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sampleTypeTemplateData.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                <td>{rowIndex + 1}</td>
                                <td>{row.investigationID}</td>
                                <td>{row.testName}</td>
                                <td>{row.sampleType}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Tables>
                      </div>
                      <div className="col-12 mt-2 d-flex justify-content-end">
                        <SaveButton
                          text={t("Save Data")}
                          onClick={handleSampleTypeImportSave}
                          loading={sampleTypeImportLoading}
                          disabled={sampleTypeImportLoading}
                        />
                      </div>
                    </div>
                  )}
                </>
              </Dialog>

        <InvestigationsHelpMenuDialog
          visible={showHelpMenuDialog}
          onHide={() => setShowHelpMenuDialog(false)}
          investigationData={formData}
        />
      </>
    </>
  );
};

export default Investigations;
