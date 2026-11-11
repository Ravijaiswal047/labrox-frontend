import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { ActiveDoctor, Record } from "../../utils/Constants";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { IndexHandle, number } from "../../utils/helpers";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import Pagination from "../../Pagination/Pagination";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import { MdDelete } from "react-icons/md";
import {
  EditButton,
  SearchButton,
  CustomButton,
} from "../../components/UI/CustomButton";
import * as XLSX from "xlsx";
import Form from "react-bootstrap/Form";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import Heading from "../../components/UI/Heading";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { Tooltip as ReactTooltip } from "react-tooltip";

const DoctorMaster = () => {
  const theme = useLocalStorage("theme", "get");

  const [details, setDetails] = useState({
    pagesize: 0,
    totalcount: 0,
  });

  // ── Backend pagination state ──
  const [PageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [Specialization, setSpecialization] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rateTypeList, setRateTypeList] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [secondDropdownOptions, setSecondDropdownOptions] = useState([]);
  const [centreData, setCentreData] = useState([]);
  const [getDoctorReferalData, setGetDoctorReferalData] = useState([]);
  const [errorModal, setErrorModal] = useState(false);
  const [errorData, setErrorData] = useState([]);
  const [importErrorMessage, setImportErrorMessage] = useState("");
  const [importSelectModal, setImportSelectModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [selectedImportCentre, setSelectedImportCentre] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [logData, setLogData] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReceiptData, setFilteredReceiptData] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [proMappingLoading, setProMappingLoading] = useState(false);

  // ── Active / Inactive counts from current page tableData ──
  const totalActive =
    tableData.filter((item) => item?.isActive === 1).length || 0;
  const totalInactive =
    tableData.filter((item) => item?.isActive === 0).length || 0;

  const PAGE_ID = "22";
  const [controllerDynamicList, setControllerDynamicList] = useState([]);

  // ── Local search filter on tableData (current page only) ──
  const filteredTableData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const val = searchTerm.toLowerCase();
    return tableData.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(val),
      ),
    );
  }, [tableData, searchTerm]);

  const handleChangeDataSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    if (!value.trim()) {
      setFilteredReceiptData(getDoctorReferalData);
      return;
    }
    const filtered = getDoctorReferalData?.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(value),
      ),
    );
    setFilteredReceiptData(filtered);
  };

  const isHideController = (cntrId = "") => {
    if (!controllerDynamicList?.length) return true;
    const isPresent = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (isPresent?.ControlDisplayID) {
      return !!controllerDynamicList?.find(
        (x) => x?.ControlDisplayID === cntrId,
      )?.IsShow;
    }
    return true;
  };

  const controllerDynamic = async () => {
    try {
      const { controllersData } = await getSearchController(PAGE_ID);
      if (Array.isArray(controllersData)) {
        setControllerDynamicList(controllersData);
      }
    } catch (err) {
      console.error("controllerDynamic error:", err);
    }
  };

  const columnsToRender = useMemo(() => {
    const activeCols = controllerDynamicList
      .filter((item) => item.TypeId == 2 && item.IsShow == 1)
      .map((item) => ({
        ...item,
        header: item.ControlDisplayID,
        icon:
          item.ControlDisplayID === "Tagging"
            ? "fa-tag"
            : item.ControlDisplayID === "Action"
              ? "fa-edit"
              : item.ControlDisplayID === "Log"
                ? "fa-search"
                : null,
      }));
    return activeCols;
  }, [controllerDynamicList]);

  const getHeaderLabel = (col) => {
    if (col?.header === "CreatedInfo") {
      return (
        <div className="d-flex align-items-center justify-content-center">
          {t("Created Info")}
          <i
            className="fa fa-info-circle ml-1 text-info"
            data-tooltip-id="created-info-tooltip"
            data-tooltip-html={`${t("1. Centre Name")}<br/>${t("2. Created By")}<br/>${t("3. Created Date")}`}
            style={{ cursor: "pointer" }}
          ></i>
          <ReactTooltip id="created-info-tooltip" />
        </div>
      );
    }
    if (col?.icon)
      return (
        <i
          className={`fa ${col.icon}`}
          aria-hidden="true"
          title={t(col?.header)}
        ></i>
      );
    if (col?.header === "Notification") {
      return t("Remark");
    }
    return t(col?.header || col?.ControlDisplayName || col?.ControlDisplayID);
  };

  const renderCell = (col, data, index) => {
    const colId = col?.header || col?.ControlDisplayID;
    switch (colId) {
      case "S.No":
        return index + 1 + IndexHandle(currentPage, PageSize);
      case "Name":
        return data?.Name || "-";
      case "Phone":
        return data?.Phone || "-";
      case "Specialization":
        return data?.Specialization || "-";
      case "Email":
        return data?.Email || "-";
      case "ClinicName":
        return data?.ClinicName || "-";
      case "Degree":
        return data?.Degree || "-";
      case "Address":
        return data?.Address || "-";
      case "Notification":
        return data?.Notification || "-";
      case "Mobile":
        return data?.Mobile || "-";
      case "CreatedInfo":
        return (
          <>
            {data?.CreatedByCentreName}
            <br />
            {data?.CreatedByName}
            <br />
            {data?.dtEntry?.split(" ").slice(0, 1).join(" ")}
            <br />
            {data?.dtEntry?.split(" ").slice(1).join(" ")}
          </>
        )
      case "Action":
        return (
          <Link
            to="/CreateDoctorReferal"
            state={{
              url: "DoctorReferal/GetSingleDoctorData",
              url1: "DoctorReferal/UpdateDoctorReferal",
              id: data?.DoctorReferalID,
            }}
          >
            <i className="bi bi-pencil-square text-primary cursor-pointer mt-1"></i>
          </Link>
        );
      case "Tagging":
        return (
          <i
            className="fa fa-tag text-primary cursor-pointer mt-1"
            size={20}
            onClick={() => handleOpenModal(data)}
            style={{ color: "#007bff" }}
            title="Tag Parameter"
          ></i>
        );
      case "Log":
        return (
          <i
            className="fa fa-search text-primary cursor-pointer mt-1"
            style={{ fontSize: "16px" }}
            onClick={() => getLog(data)}
            title={t("Log")}
          ></i>
        );
      default:
        return "";
    }
  };

  const [payload, setPayload] = useState({
    DoctorName: "",
    Centre: [],
    Mobile: "",
    Specialization: "All",
    isActive: ActiveDoctor[0]?.value,
    SecondReferDoctor: 0,
    FromDate: new Date(),
    ToDate: new Date(),
    status: "1"
  });

  const { t } = useTranslation();

  const handleSelectChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload((payload) => ({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      const data = res.data.message || [];
      const centreList = data.map((ele) => ({
        value: ele.CentreID,
        label: ele.Centre,
      }));
      setCentreData(centreList);
      setSecondDropdownOptions(centreList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getRateTypes = async (id) => {
    try {
      const res = await axiosInstance.post(apiUrls?.GetRateType, {
        CentreId: id ? [id] : [],
      });
      const list =
        res?.data?.message?.map((item) => ({
          label: item?.RateTypeName,
          value: item?.RateTypeID,
        })) || [];
      setRateTypeList(list);
      setSecondDropdownOptions(list);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getLog = (row) => {
    setSelectedDoctor({
      id: row?.DoctorReferalID,
      name: row?.Name,
      code: row?.DoctorCode,
    });
    setLogLoading(true);
    axiosInstance
      .post("CommonController/GetMasterUpdateLogs", {
        masterName: "doctor",
        masterId: row?.DoctorReferalID || 0,
        fromDate: "",
        fromTime: "",
        toDate: "",
        toTime: "",
        createdBy: 0,
        columnName: "",
      })
      .then((res) => {
        if (res.data.success) {
          setLogData(res?.data?.message || []);
          setShowLog(true);
        } else {
          setLogData([]);
          toast.error(res?.data?.message || t("No Log Found"));
        }
        setLogLoading(false);
      })
      .catch((err) => {
        toast.error(t("Error fetching logs"));
        setLogLoading(false);
      });
  };

  // ── UPDATED: getDoctorReferal now accepts doctorId and datatype as optional params ──
  const getDoctorReferal = (doctorId = null, datatype = null) => {
    const params = {};
    if (doctorId) params.doctorId = doctorId;
    if (datatype) params.datatype = datatype;

    axiosInstance
      .get("DoctorReferal/GetDoctorMappings", { params })
      .then((res) => {
        setGetDoctorReferalData(
          Array.isArray(res?.data?.message) ? res.data.message : [],
        );
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    // Initial load — no filters
    getDoctorReferal();
    getAccessCentres();
  }, []);

  useEffect(() => {
    setFilteredReceiptData(getDoctorReferalData);
  }, [getDoctorReferalData]);

  const removeTagging = (data) => {
    console.log("data:", data);
    axiosInstance
      .post("DoctorReferal/RemoveDoctor", {
        doctorID: String(data?.DoctorId),
        centreId: data?.CentreId,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Mapping removed successfully");
          // Refresh with current doctor and type filters
          getDoctorReferal(selectedDoctor?.id || null, selectedType || null);
        } else {
          toast.error(res?.data?.message || "Failed to remove mapping");
        }
      })
      .catch(() => {
        toast.error("Something went wrong while removing mapping");
      });
  };

  const InsertDocMapping = async () => {
    if (!payload?.datatype) {
      toast.error("Please select Data Type");
      return;
    }
    if (!selectedDoctor?.id) {
      toast.error("Doctor not selected");
      return;
    }
    if (!payload?.centres) {
      toast.error(
        `Please select ${selectedType === "Centre" ? "Centre" : "Rate Type"}`,
      );
      return;
    }

    // datatype ko correct string me convert karo
    const formattedDatatype =
      payload.datatype === "Rate Type" || payload.datatype === 2
        ? "RateType"
        : "Centre";

    try {
      const res = await axiosInstance.post(
        `DoctorReferal/InsertDoctorMapping`,
        {
          doctorId: selectedDoctor.id,
          centre: payload.centres, // centreId → centre
          datatype: formattedDatatype, // "Centre" | "RateType"
        },
      );

      if (res?.data?.success) {
        // ── Refresh list with current doctor + selected type filter ──
        getDoctorReferal(selectedDoctor.id, formattedDatatype);
        setPayload((prev) => ({ ...prev, datatype: "", centres: "" }));
        setSelectedType(null);
      } else {
        toast.error(res?.data?.message || "Failed to add mapping");
      }
    } catch (error) {
      toast.error("Something went wrong while adding mapping");
    }
  };

  const handleTypeChange = (name, option) => {
    if (name === "typeSelector") {
      const type = option?.value || null;
      setSelectedType(type);
      setPayload((prev) => ({
        ...prev,
        datatype: type === "Centre" ? 1 : type === "RateType" ? 2 : "",
        centres: "",
      }));

      // ── UPDATED: selectedType change hone par dynamic fetch with doctorId + datatype ──
      if (type && selectedDoctor?.id) {
        getDoctorReferal(selectedDoctor.id, type); // "Centre" ya "RateType" dynamically
      }
    } else if (name === "dynamicData") {
      setPayload((prev) => ({ ...prev, centres: option?.value || "" }));
    }
  };

  useEffect(() => {
    if (!selectedType) return;
    setLoading(true);
    if (selectedType === "Centre") {
      getAccessCentres();
    } else if (selectedType === "RateType") {
      getRateTypes();
    }
  }, [selectedType]);

  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        const data = res.data.message;
        const value = data.map((ele) => ({
          value: ele.FieldDisplay,
          label: ele.FieldDisplay,
        }));
        if (name === "Specialization") setSpecialization(value);
      })
      .catch((err) => console.log(err));
  };

  // ── UPDATED: handleOpenModal — sirf doctorId pass, datatype nahi (no static value) ──
  const handleOpenModal = (doctorData) => {
    setSelectedDoctor({
      id: doctorData?.DoctorReferalID,
      name: doctorData?.Name,
      code: doctorData?.DoctorCode,
    });
    // Fetch mappings for this doctor only — no datatype filter yet
    getDoctorReferal(doctorData?.DoctorReferalID);
    setShowModal(true);
  };

  const handleCancelParameter = () => {
    setShowModal(false);
    setSelectedDoctor(null);
    setSelectedType(null);
    setPayload((prev) => ({ ...prev, datatype: "", centres: "" }));
  };

  //   const handleImportExcel = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (evt) => {
  //       const bstr = evt.target.result;
  //       const wb = XLSX.read(bstr, { type: "binary" });
  //       const wsname = wb.SheetNames[0];
  //       const ws = wb.Sheets[wsname];

  //       // ✅ Manually define headers matching the actual column order
  //       const headers = [
  //         "DoctorReferalID", "Name", "Phone", "Mobile", "Email",
  //         "ClinicName", "Degree", "Address", "isActive", "SecondReferDoctor",
  //         "Department", "IsApproved", "dtApproved", "ApprovedName", "ProEmployee",
  //         "Specialization", "dtEntry", "CreatedByName", "CreatedByCentreName"
  //       ];

  //       // Skip first 4 rows (merged title + blanks + actual header row), use our own headers
  //       const data = XLSX.utils.sheet_to_json(ws, { range: 4, header: headers });

  //       if (data.length === 0) {
  //         toast.error("No data found in the uploaded file");
  //         return;
  //       }
  //       const doctorMaster = data.map((item) => ({
  //         name: item.Name || "",
  //         doctorCode: String(item.DoctorReferalID || ""),
  //         mobile: String(item.Mobile || ""),
  //         email: item.Email || "",
  //         specialization: item.Specialization || "",
  //         degree: item.Degree || "",
  //         clinicName: item.ClinicName || "",
  //         centreCode: item.CreatedByCentreName || "",
  //       }));

  //       setImportData(doctorMaster);
  //       setImportSelectModal(true);
  //     };
  //     reader.readAsBinaryString(file);
  //   }
  //   e.target.value = null;
  // };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Row 0 = headers, Row 1 onwards = data
        const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (allRows.length <= 1) {
          toast.error("No data found in the uploaded file");
          return;
        }

        // ✅ Row 0 skip karo (header hai), Row 1 se data lo
        const doctorMaster = allRows
          .slice(1) // header row skip
          .filter((row) =>
            row.some((val) => String(val || "").replace(/\s+/g, "").trim() !== "")
          )
          .map((row) => ({
            name: String(row[0] || ""),        // Name
            doctorCode: String(row[1] || ""),  // DoctorCode
            mobile: String(row[2] || ""),      // Mobile
            email: String(row[3] || ""),       // Email
            specialization: String(row[4] || ""), // Specialization
            degree: String(row[5] || ""),      // Degree
            clinicName: String(row[6] || ""),  // ClinicName
            centreCode: "",                    // Excel mein nahi hai
          }));

        if (doctorMaster.length === 0) {
          toast.error("No valid data found in the uploaded file");
          return;
        }

        setImportData(doctorMaster);
        setImportSelectModal(true);
      };
      reader.readAsBinaryString(file);
    }
    e.target.value = null;
  };

  const handleFinalImport = () => {
    if (!selectedImportCentre) {
      toast.error("Please select a centre first");
      return;
    }
    const uploadPayload = {
      centreId: Number(selectedImportCentre),
      doctorMaster: importData,
    };
    setLoading(true);
    axiosInstance
      .post("DoctorReferal/ImportDoctorMaster", uploadPayload)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "Data imported successfully");
          setImportSelectModal(false);
          setImportData([]);
          setSelectedImportCentre("");
          setImportErrorMessage("");
          fetch(true);
        } else {
          if (res.data.data && res.data.data.length > 0) {
            setErrorData(res.data.data);
            setImportErrorMessage(
              res.data.message ||
              "Found issues in uploaded file. Please fix and re-upload.",
            );
            setErrorModal(true);
            setImportSelectModal(false);
          } else {
            toast.error(res.data.message || "Import failed");
          }
        }
      })
      .catch((err) => {
        const errorRes = err?.response?.data;
        if (errorRes && errorRes.data && errorRes.data.length > 0) {
          setErrorData(errorRes.data);
          setImportErrorMessage(
            errorRes.message || "Error found during import",
          );
          setErrorModal(true);
          setImportSelectModal(false);
        } else {
          toast.error(errorRes?.message || "Import error occurred");
        }
      })
      .finally(() => setLoading(false));
  };

  const handleDownloadTemplate = () => {
    setLoading(true);
    axiosInstance
      .get("DoctorReferal/ImportDoctorMasterTemplate", {
        responseType: "blob",
      })
      .then((res) => {
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "DoctorMasterTemplate.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Template downloaded successfully");
      })
      .catch(() => toast.error("Failed to download template"))
      .finally(() => setLoading(false));
  };

  const handleExportDoctorMaster = async () => {
    const apiPayload = {
      centreId: payload.Centre || [],
      name: payload.DoctorName || "",
      isActive: payload.status || "",
      secondReferDoctor: payload.SecondReferDoctor,
      mobile: payload.Mobile,
      specialization: payload.Specialization
    }

    try {
      setExcelLoading(true)
      const res = await axiosReport.post("/DoctorReferal/GetDoctorReferal", apiPayload, {
        responseType: "blob",
      });

      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        toast.warning(json?.message || "No records found.");
        setExcelLoading(false)
        return;
      }

      if (!res.data || res.data.size === 0) {
        toast.warning("No data available to export.");
        setExcelLoading(false)
        return;
      }

      const url = window.URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Doctors_list.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Excel File Downloaded");
      setExcelLoading(false)
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || "Error while fetching report.");
          setExcelLoading(false)
        } catch {
          toast.error("Error while fetching report.");
          setExcelLoading(false)
        }
        return;
      }
      toast.error(err?.response?.data?.message || "Error while fetching report.");
      setExcelLoading(false)
    } finally {
      setExcelLoading(false)
    }

  };

  // Minimal export: just Doctor Name, Mobile and tagged ProEmployee - a
  // separate button from the full "Export" above, for anyone who just wants
  // the doctor-to-PRO mapping without the wider column set.
  const handleExportDoctorProMapping = async () => {
    const apiPayload = {
      centreId: payload.Centre || [],
      name: payload.DoctorName || "",
      isActive: payload.status || "",
      secondReferDoctor: payload.SecondReferDoctor,
      mobile: payload.Mobile,
      specialization: payload.Specialization
    }

    try {
      setProMappingLoading(true)
      const res = await axiosReport.post("/DoctorReferal/GetDoctorProMapping", apiPayload, {
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

      const url = window.URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Doctor_PRO_Mapping.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Excel File Downloaded");
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || "Error while fetching report.");
        } catch {
          toast.error("Error while fetching report.");
        }
        return;
      }
      toast.error(err?.response?.data?.message || "Error while fetching report.");
    } finally {
      setProMappingLoading(false)
    }
  };

  // ── Backend pagination wali fetch — PageNo aur PageSize server ko jaata hai ──
  const fetch = (flag) => {
    setLoading(true);
    axiosInstance
      .post("DoctorReferal/SearchDoctorData", {
        ...payload,
        Name: payload?.DoctorName,
        isActive: payload?.status,
        CentreId: payload?.Centre,
        // flag=true matlab new search, page 1 se shuru
        PageNo: flag ? 1 : currentPage,
        PageSize: PageSize,
      })
      .then((res) => {
        if (res?.data.success) {
          setTableData(res?.data?.message);
        } else {
          setTableData([]);
          toast.error(res?.data?.message);
        }
        // Server se aaya totalCount pagination ke liye
        setDetails((d) => ({
          ...d,
          totalcount: res?.data?.totalCount ?? 0,
        }));
        if (flag) setCurrentPage(1);
        setSearchTerm("");
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setLoading(false);
      });
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") fetch(true);
  };

  const handleSelectMultiChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));

  };
  const handleReactSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value?.value });
  };


  // ── Page ya PageSize badalne par server se naya data fetch ──
  useEffect(() => {
    fetch(false);
  }, [currentPage, PageSize]);

  useEffect(() => {
    controllerDynamic();
    getDropDownData("Specialization");
    getAccessCentres();
  }, []);

  return (
    <>
      {/* ===================== SEARCH FILTER ACCORDION ===================== */}
      <Accordion
        name={t("Doctor Master")}
        isBreadcrumb={true}
        defaultValue={true}
        seconTitle={
          <div className="ml-auto d-flex align-items-center">
            <Link to="/CreateDoctorReferal" className="mr-2">
              <CustomButton text={t("Create New Doctor")} icon={"forword"} />
            </Link>
            <PageControlGear pageId={PAGE_ID} />
          </div>
        }
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          {controllerDynamicList?.filter(
            (item) => item?.TypeId === 1 && item?.IsShow === 1,
          ).length > 0 ? (
            controllerDynamicList
              ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
              ?.map((item, index) => {
                if (
                  item?.ControlDisplayID === "DoctorName" &&
                  isHideController("DoctorName")
                ) {
                  return (
                    <div className="col-sm-2" key={index}>
                      <Input
                        lable="Doctor Name"
                        id="DoctorName"
                        placeholder=" "
                        name="DoctorName"
                        value={payload?.DoctorName}
                        type="text"
                        onKeyDown={handleKeyDown}
                        autoComplete={"off"}
                        onChange={handleSelectChange}
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "CentreName" &&
                  isHideController("CentreName")
                ) {
                  return (
                    <div className="col-sm-2" key={index}>
                      <MultiSelectComp
                        label="Centre"
                        options={centreData}
                        value={payload?.Centre}
                        name="Centre"
                        onChange={handleSelectMultiChange}
                        lable={t("Centre Name")}
                      />
                    </div>
                  )
                }
                if (
                  item?.ControlDisplayID === "Status" &&
                  isHideController("Status")
                ) {
                  return (
                    <div className="col-sm-1" key={index}>
                      <ReactSelect
                        dynamicOptions={[
                          { label: 'Active', value: '1' },
                          { label: 'In Active', value: '0' },
                          { label: 'Both', value: '2' }
                        ]}
                        name="status"
                        lable={t("Status")}
                        id="status"
                        removeIsClearable={true}
                        placeholderName={t("Status")}
                        value={payload?.status}
                        onChange={handleReactSelectChange}
                      />
                    </div>
                  )
                }
                if (
                  item?.ControlDisplayID === "Mobile" &&
                  isHideController("Mobile")
                ) {
                  return (
                    <div className="col-sm-2" key={index}>
                      <Input
                        lable="Mobile"
                        id="Mobile"
                        placeholder=" "
                        type="number"
                        name="Mobile"
                        onInput={(e) => number(e, 10)}
                        value={payload.Mobile}
                        onChange={handleSelectChange}
                        required
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "Specialization" &&
                  isHideController("Specialization")
                ) {
                  return (
                    <div className="col-sm-2" key={index}>
                      <SelectBox
                        options={[
                          { label: "Specialization", value: "" },
                          ...Specialization,
                        ]}
                        lable="Specialization"
                        id="Specialization"
                        value={payload?.Specialization}
                        name="Specialization"
                        onChange={handleSelectChange}
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "Active" &&
                  isHideController("Active")
                ) {
                  return (
                    <div className="col-sm-1" key={index}>
                      <SelectBox
                        options={ActiveDoctor}
                        value={payload?.isActive}
                        name="isActive"
                        lable="isActive"
                        id="isActive"
                        onChange={handleSelectChange}
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "SecondReferDoctor" &&
                  isHideController("SecondReferDoctor")
                ) {
                  return (
                    <div
                      className="col-sm-auto d-flex align-items-center"
                      key={index}
                    >
                      <Form.Check
                        type="switch"
                        id="SecondReferDoctor"
                        name="SecondReferDoctor"
                        checked={payload?.SecondReferDoctor}
                        onChange={handleSelectChange}
                        label={t("Second Refer Doctor")}
                      />
                    </div>
                  );
                }
                return null;
              })
          ) : (
            <>
              {isHideController("DoctorName") && (
                <div className="col-sm-2">
                  <Input
                    lable="Doctor Name"
                    id="DoctorName"
                    placeholder=" "
                    name="DoctorName"
                    value={payload?.DoctorName}
                    type="text"
                    onKeyDown={handleKeyDown}
                    autoComplete={"off"}
                    onChange={handleSelectChange}
                  />
                </div>
              )}
              {isHideController("Mobile") && (
                <div className="col-sm-2">
                  <Input
                    lable="Mobile"
                    id="Mobile"
                    placeholder=" "
                    type="number"
                    name="Mobile"
                    onInput={(e) => number(e, 10)}
                    value={payload.Mobile}
                    onChange={handleSelectChange}
                    required
                  />
                </div>
              )}
              {isHideController("Specialization") && (
                <div className="col-sm-2">
                  <SelectBox
                    options={[
                      { label: "Specialization", value: "" },
                      ...Specialization,
                    ]}
                    lable="Specialization"
                    id="Specialization"
                    value={payload?.Specialization}
                    name="Specialization"
                    onChange={handleSelectChange}
                  />
                </div>
              )}
              {isHideController("Active") && (
                <div className="col-sm-1">
                  <SelectBox
                    options={ActiveDoctor}
                    value={payload?.isActive}
                    name="isActive"
                    lable="isActive"
                    id="isActive"
                    onChange={handleSelectChange}
                  />
                </div>
              )}
              {isHideController("SecondReferDoctor") && (
                <div className="col-sm-auto d-flex align-items-center">
                  <Form.Check
                    type="switch"
                    id="SecondReferDoctor"
                    name="SecondReferDoctor"
                    checked={payload?.SecondReferDoctor}
                    onChange={handleSelectChange}
                    label={t("Second Refer Doctor")}
                  />
                </div>
              )}
            </>
          )}

          <div className="col-sm-auto d-flex">
            <SearchButton text={"Search"} onClick={() => fetch(true)} />
            <input
              type="file"
              id="importFile"
              style={{ display: "none" }}
              onChange={handleImportExcel}
              accept=".xlsx, .xls"
            />
            <CustomButton
              text={"Import"}
              variant="success"
              icon="upload"
              onClick={() => document.getElementById("importFile").click()}
              className="ml-2"
            />
            <CustomButton
              text={"Export"}
              icon="excel"
              onClick={handleExportDoctorMaster}
              className="ml-2"
            />
            <CustomButton
              text={"Doctor-PRO Mapping"}
              icon="excel"
              onClick={handleExportDoctorProMapping}
              className="ml-2"
            />
            <CustomButton
              text={"Sample Template"}
              variant="info"
              icon="excel"
              onClick={handleDownloadTemplate}
              className="ml-2"
            />
          </div>
        </div>
      </Accordion>

      {/* ===================== SEARCH DATA ACCORDION ===================== */}
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        seconTitle={
          <div
            className="d-none d-md-flex align-items-center"
            style={{ gap: "10px" }}
          >
            {/* Active / Inactive Color Badges with Count */}
            <ColorCodingSearch
              color="#90ee90"
              label={`Active (${totalActive})`}
            />
            <ColorCodingSearch
              color="#f5c6cb"
              label={`In Active (${totalInactive})`}
            />
            {/* Search Input */}
            <div>
              <Input
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleChangeDataSearch}
              />
            </div>
          </div>
        }
      >
        {loading ? (
          <Loading />
        ) : (
          <>
            {filteredTableData?.length > 0 ? (
              <>
                <div className="table-wrapper">
                  <Tables thead={columnsToRender} data={filteredTableData}>
                    <thead className="cf">
                      <tr>
                        {columnsToRender.map((col, idx) => (
                          <th
                            key={idx}
                            className={col?.icon ? "text-start" : ""}
                          >
                            {getHeaderLabel(col)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTableData.map((data, index) => {
                        const rowBackground =
                          data?.isActive === 1 ? "#90ee90" : "#f5c6cb";
                        return (
                          <tr
                            key={index}
                            style={{ backgroundColor: rowBackground }}
                          >
                            {columnsToRender.map((col, i) => (
                              <td key={i} data-title={t(col.header)}>
                                {renderCell(col, data, index)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tables>
                </div>

                {/* ── Backend Pagination — totalCount server se aata hai ── */}
                <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-2">
                  <div style={{ minWidth: "150px" }}>
                    <ReactSelect
                      value={PageSize}
                      dynamicOptions={[
                        { label: "25", value: 25 },
                        { label: "50", value: 50 },
                        { label: "100", value: 100 },
                        { label: "150", value: 150 },
                      ]}
                      name={"pageSize"}
                      label={t("pageSize")}
                      removeIsClearable={true}
                      onChange={(name, value) => {
                        setPageSize(value?.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    // ── Server ka totalCount use ho raha hai ──
                    totalCount={details?.totalcount}
                    pageSize={PageSize}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              </>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}
      </Accordion>

      {/* ===================== TAGGING MODAL ===================== */}
      {showModal && (
        <Dialog
          header={
            <span>
              {t("Tagging")}

              <span className="ml-4 " style={{ fontSize: "14px" }}>
                Name - {selectedDoctor.name} |
                <span className="ml-2" style={{ fontSize: "14px" }}>
                  Code - {selectedDoctor.id}
                </span>
              </span>
            </span>
          }
          onHide={handleCancelParameter}
          visible={showModal}
          className={theme}
          style={{ width: "70vw" }}
        >
          <div className="modal-body">
            <div className="row">
              <div className="col-sm-4">
                <ReactSelect
                  dynamicOptions={[
                    { label: "Select Data Type", value: "" },
                    { label: "Centre", value: "Centre" },
                    { label: "Rate Type", value: "RateType" },
                  ]}
                  removeIsClearable="true"
                  onChange={handleTypeChange}
                  placeholderName={
                    selectedType ? `${selectedType}` : "Select Data Type"
                  }
                  name={"typeSelector"}
                  id={"typeSelector"}
                />
              </div>
              <div className="col-sm-4">
                <ReactSelect
                  dynamicOptions={secondDropdownOptions}
                  placeholderName={
                    selectedType
                      ? `Select ${selectedType}`
                      : "Select Type first"
                  }
                  name={"dynamicData"}
                  id={"dynamicData"}
                  isDisabled={!selectedType}
                  onChange={handleTypeChange}
                  value={payload?.centres}
                />
              </div>
              <div className="col-sm-2">
                <CustomButton
                  text={"Add"}
                  icon={"add"}
                  variant="success"
                  className="btn btn-secondary mr-2"
                  onClick={InsertDocMapping}
                />
                <CustomButton
                  text={"Cancel"}
                  variant="secondary"
                  className="btn btn-secondary"
                  onClick={handleCancelParameter}
                />
              </div>
            </div>
          </div>
          <Accordion
            title={"Search Data"}
            seconTitle={
              <div>
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleChangeSearch}
                />
              </div>
            }
          />
          <Tables>
            <thead>
              <tr>
                <th>{t("S.No")}</th>
                <th>{t("Doctor Name")}</th>
                <th>{t("Center/RateType")}</th>
                <th>{t("Email")}</th>
                <th>{t("Specialization")}</th>
                <th>{t("Added By")}</th>
                <th>{t("Added On")}</th>
                <th>{t("Remove")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceiptData?.map((data, index) => (
                <tr key={index}>
                  <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                  <td data-title={t("Doctor Name")}>
                    {`${data?.Title}${data?.Name}`}&nbsp;
                  </td>
                  <td data-title={t("Centre/RateType")}>{data?.DataType}</td>
                  <td data-title={t("Email")}>{data?.Email}</td>
                  <td data-title={t("Specialization")}>
                    {data?.Specialization}
                  </td>
                  <td data-title={t("Added by")}>
                    {data?.CreatedByName}&nbsp;
                  </td>
                  <td data-title={t("Added on")}>{data?.AddedOn}&nbsp;</td>
                  <td
                    data-title={t("Remove")}
                    className="cursor-pointer text-center"
                    onClick={() => removeTagging(data)}
                  >
                    <MdDelete />
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </Dialog>
      )}

      {/* ===================== ERROR MODAL ===================== */}
      {errorModal && (
        <Dialog
          header={t("Import Errors")}
          visible={errorModal}
          onHide={() => setErrorModal(false)}
          style={{ width: "90vw" }}
          className={theme}
        >
          <div className="card">
            <div className="card-header text-danger">
              <h5 className="modal-title font-weight-bold">
                {importErrorMessage}
              </h5>
            </div>
            <div
              className="card-body p-0"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Error Message")}</th>
                    <th>{t("Doctor Name")}</th>
                    <th>{t("Doctor Code")}</th>
                    <th>{t("Mobile")}</th>
                    <th>{t("Email")}</th>
                    <th>{t("Specialization")}</th>
                    <th>{t("Degree")}</th>
                    <th>{t("Clinic Name")}</th>
                    <th>{t("Centre Code")}</th>
                  </tr>
                </thead>
                <tbody>
                  {errorData.map((item, index) => (
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}</td>
                      <td
                        data-title={t("Error Message")}
                        className="text-danger"
                        style={{ minWidth: "200px" }}
                      >
                        {item.errorMessage}
                      </td>
                      <td data-title={t("Doctor Name")}>{item.name || "-"}</td>
                      <td data-title={t("Doctor Code")}>
                        {item.doctorCode || "-"}
                      </td>
                      <td data-title={t("Mobile")}>{item.mobile || "-"}</td>
                      <td data-title={t("Email")}>{item.email || "-"}</td>
                      <td data-title={t("Specialization")}>
                        {item.specialization || "-"}
                      </td>
                      <td data-title={t("Degree")}>{item.degree || "-"}</td>
                      <td data-title={t("Clinic Name")}>
                        {item.clinicName || "-"}
                      </td>
                      <td data-title={t("Centre Code")}>
                        {item.centreCode || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setErrorModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ===================== LOG MODAL ===================== */}
      {showLog && (
        <Dialog
          header={
            <span>
              {t("Doctor Update Logs")}
              <span className="ml-4 " style={{ fontSize: "14px" }}>
                Name - {selectedDoctor.name} |
                <span className="ml-2" style={{ fontSize: "14px" }}>
                  Code - {selectedDoctor.id}
                </span>
              </span>
            </span>
          }
          visible={showLog}
          onHide={() => setShowLog(false)}
          style={{ width: "80vw" }}
          className={theme}
        >
          <div className="card">
            <div
              className="card-body p-0"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              {logLoading ? (
                <Loading />
              ) : (
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Doctor ID")}</th>
                      <th>{t("Doctor Name")}</th>
                      <th>{t("Column Name")}</th>
                      <th>{t("Old Value")}</th>
                      <th>{t("New Value")}</th>
                      <th>{t("Updated By")}</th>
                      <th>{t("Updated Date")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logData.length > 0 ? (
                      logData.map((log, index) => (
                        <tr key={index}>
                          <td data-title={t("S.No")}>{index + 1}</td>
                          <td data-title={t("Master ID")}>
                            {log.MasterID || "-"}
                          </td>
                          <td data-title={t("Master Name")}>
                            {log.MasterName || "-"}
                          </td>
                          <td data-title={t("Column Name")}>
                            {log.ColumnName || "-"}
                          </td>
                          <td data-title={t("Old Value")}>
                            {log.OldValue || "-"}
                          </td>
                          <td data-title={t("New Value")}>
                            {log.NewValue || "-"}
                          </td>
                          <td data-title={t("Updated By")}>
                            {log.UpdatedBy || "-"}
                          </td>
                          <td data-title={t("Updated Date")}>
                            {log.UpdatedOn || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          {t("No Records Found")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Tables>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* ===================== IMPORT SELECT MODAL ===================== */}
      {importSelectModal && (
        <Dialog
          header={t("Select Centre for Import")}
          visible={importSelectModal}
          onHide={() => setImportSelectModal(false)}
          style={{ width: "30vw" }}
          className={theme}
        >
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-sm-12">
                  <SelectBox
                    lable="Select Centre"
                    id="importCentre"
                    options={[
                      { label: "Select Centre", value: "" },
                      ...centreData,
                    ]}
                    value={selectedImportCentre}
                    onChange={(e) => setSelectedImportCentre(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-end">
              <button
                className="btn btn-secondary"
                onClick={() => setImportSelectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success ml-2"
                onClick={handleFinalImport}
              >
                Process Import
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default DoctorMaster;
