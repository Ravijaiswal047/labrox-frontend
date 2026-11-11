import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { axiosInstance } from "../../utils/axiosInstance";
import { guidNumber } from "../util/Commonservices";
import "./CompanyMaster.css";
import {
  getChangedFlagRecords,
  getTrimmedData,
  handleFlagToggle,
  normalizeFlagValues,
  number,
  PreventSpecialCharacter,
} from "../../utils/helpers";
import { CompanyMasterValidation } from "../../utils/Schema";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { CompanyBillingCycle } from "../../utils/Constants";
import CustomTable from "../../components/Table/CustomTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import AutoComplete from "../../components/formComponent/AutoComplete";
import FilterInput from "../../components/Filter/FilterInput";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { Button, Modal, Nav, Tab } from "react-bootstrap";
import PaymentGatwayKitModal from "./PaymentGatwayKitModal";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import FlagPageMappingModal from "./FlagPageMappingModal";
import FlagsModal from "./FlagsModal";
import Configuration from "./ConfigurationModal";

const CompanyMaster = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const { CompanyID } = useLocalStorage("userData", "get");
  const [BillingType, setBillingType] = useState([]);
  const [pageOptions, setPageOptions] = useState([]);
  const [GraceType, setGraceType] = useState([]);
  const [loading, setLoading] = useState(false);
   const [showPdf2, setShowPdf2] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    CompanyId: "",
    CompanyCode: "",
    CompanyName: "",
    Country: "",
    State: "",
    City: "",
    Email: "",
    PhoneNo: "",
    Phone2: "",
    Address1: "",
    Address2: "",
    Address3: "",
    isPrefixRequired: 0,
    companyGUID: guidNumber(),
    SelectType: "1",
    GraceDays: 0,
    Mobile1: "",
    Mobile2: "",
    BillingType: "Monthly",
    IsShareRequired: 0,
    IsSmsRequired: 0,
    IsEmailRequired: 0,
    IsWhatsappRequired: 0,
    SkipMicLabEntry: 0,
    ModifiedRegDate: 0,
    SampleCollectionAndDepartmentRecieve: 0,
    DirectB2B: 0,
    CompanyLogo: guidNumber(),
    CompanyIsoLogo: guidNumber(),
    pincode: "",
    isRolewise: 0,
    IsPatientWiseReporting: 0,
    IsAcknowledgementSlipRequired: 0,
    AfterApprovedDiscountReq: 0,
    CompanyIDHash: state?.data?.CompanyIDHash
              ? state?.data?.CompanyIDHash
              : guidNumber(),
    // PaymentOptions: "",
  });

  const [filter, setFilter] = useState("");
  const [copyTableData, setCopyTableData] = useState([]);
  const [showMobile2, setShowMobile2] = useState(false);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoHashId, setLogoHashId] = useState("");
  const [logoError, setLogoError] = useState("");
  const [logoLoading, setLogoLoading] = useState(false);
  const [CompanyISOLogoModal, setCompanyISOLogoModal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [activeTab, setActiveTab] = useState("flags");

  const [openAddModal, setOpenAddModal] = useState(false)
  const [openConfiguration, setOpenConfiguration] = useState(false)
  const [modalType, setModalType] = useState("company");
  const [editData, setEditData] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewModalData, setViewModalData] = useState(null);

  const [centreFlagData, setCentreFlagData] = useState([]);
  const [rateTypeFlagData, setRateTypeFlagData] = useState([]);
  const [copyCentreData, setCopyCentreData] = useState([]);
  const [copyRateTypeData, setCopyRateTypeData] = useState([]);

  const [machineBarcodeData, setMachineBarcodeData] = useState([]);
  const [copyMachineBarcodeData, setCopyMachineBarcodeData] = useState([]);
  const [configrationData, setConfigrationData] = useState([]);
  const [copyConfigrationData, setCopyConfigrationData] = useState([]);

  const columns = [
    { header: "Sr. No", field: "SrNo", width: "4%" },
    { header: "FlagName", field: "FlagName", width: "16%" },
    { header: "Value", field: "Value", width: "16%" },
    { header: "Page Mapping", field: "PageID", width: "16%" },
    { header: "Created By", field: "CreatedBy", width: "16%" },
    { header: "Created On", field: "CreatedOn", width: "16%" },
    { header: "Last Updated By", field: "LastUpdatedBy", width: "16%" },
    { header: "Last Updated On", field: "LastUpdatedOn", width: "16%" },
  ];

  const machineBarcodeColumns = [
    { header: "S.No", field: "SrNo", width: "5%" },
    { header: "Barcode Type", field: "BarcodeType", width: "15%" },
    { header: "Parameter Name", field: "ParameterName", width: "15%" },
    { header: "Parameter Heading", field: "ParameterHeadingDisplay", width: "15%" },
    { header: "Parameter Value", field: "ParameterValue", width: "15%" },
    { header: "Allow Print", field: "IsPrintDisplay", width: "10%" },
    { header: "Print Sequence", field: "PrintSequenceDisplay", width: "10%" },
    { header: "Created At", field: "dtEntry", width: "15%" },
  ];

  const ConfigurationColumns = [
    { header: "S.No", field: "SrNo", width: "5%" },
    { header: "DataType", field: "dataType", width: "15%" },
    { header: "LabReportUrl", field: "labReportUrl", width: "15%" },
    { header: "ApiName", field: "apiName", width: "15%" },
    { header: "ApiUrl", field: "apiUrl", width: "15%" },
    { header: "HttpMethod", field: "httpMethod", width: "10%" },
    { header: "PayloadTemplate", field: "payloadTemplate", width: "10%" },
    { header: "VerifyWalletCount", field: "verifyWalletCount", width: "15%" },
    { header: "ResponseValue", field: "responseValue", width: "10%" },
    { header: "ResponseKey", field: "responseKey", width: "15%" },
    { header: "Headers", field: "headers", width: "15%" },
    { header: "Action", field: "Action", width: "5%" },
  ];

  const handleMachineBarcodeChange = (id, name, value) => {
    const updateRow = (item) => {
      if (item.ID === id) {
        return { ...item, [name]: value, isChanged: true };
      }
      return item;
    };

    setMachineBarcodeData((prev) => prev.map(updateRow));
    setCopyMachineBarcodeData((prev) => prev.map(updateRow));
  };


  const handleConfigrationChange = (id, name, value) => {
    const updateRow = (item) => {
      if (item.ID === id) {
        return { ...item, [name]: value, isChanged: true };
      }
      return item;
    };

    setConfigrationData((prev) => prev.map(updateRow));
    setCopyConfigrationData((prev) => prev.map(updateRow));
  };

  const PaymentOptionsList = [
    { label: "HDFC Pay", value: "1" },
    { label: "Razorpay", value: "2" },
  ];

  const [searchCompanyPayload, setSearchCompanyPayload] = useState({
    label: "",
    value: null,
  });
  const [companyList, setCompanyList] = useState([]);
  const [searchCompanySuggestions, setSearchCompanySuggestions] = useState([]);
  const [selectSearchCompany, setSelectSearchCompany] = useState(false);
  const [searchCompanyIndex, setSearchCompanyIndex] = useState(0);

  const getCompanyDetails = () => {
    const apiPayload = {
      CompanyId: "",
      CompanyCode: "",
      CompanyName: "",
      Country: "",
      State: "",
      City: "",
      Email: "",
      Phone: "",
      Address1: "",
      Address2: "",
      Address3: "",
      isPrefixRequired: 0,
      IsWhatsappRequired: 0,
      SelectType: "",
      GraceDays: 0,
      Mobile1: "",
      Mobile2: "",
      BillingType: "",
      CompanyIsoLogo: "",
      CompanyIDHash: payload?.CompanyIDHash,
    };
    axiosInstance
      .post("CompanyMaster/GetCompanyMaster", apiPayload)
      .then((res) => {
        const data = res?.data?.message || [];
        if (res?.data?.success && Array.isArray(data)) {
          let companyList = data.map((ele) => {
            return {
              value: ele.CompanyID,
              label: ele.CompanyName,
            };
          });
          setCompanyList(companyList);
          setSearchCompanySuggestions(companyList);
        }
      })
      .catch((err) => console.log(err));
  };

  const fetchPages = async () => {
    try {
      const res = await axiosInstance.get("Menu/MainMenuPageData");
      if (res?.data?.success && Array.isArray(res?.data?.message?.pageData)) {
        const data = res?.data?.message?.pageData;
        const formatted = data.map(page => ({
          label: page.PageName,
          value: page.PageID
        }));
        setPageOptions(formatted);
      }
    } catch (err) {
      console.error("Failed to load pages", err);
    }
  };

  const renderControl = (row) => {
    const getCurrentSetData = () => {
      if (activeTab === "flags") return setTableData;
      if (activeTab === "centre") return setCentreFlagData;
      if (activeTab === "ratetype") return setRateTypeFlagData;
      if (activeTab === "machinebarcode") return setMachineBarcodeData;
      if (activeTab === "configuration") return setConfigrationData;

    };

    const updateFlagValue = (row, value) => {
      const setData = getCurrentSetData();

      setData((prev) =>
        prev.map((r) =>
          r.FlagName === row.FlagName
            ? {
              ...r,
              FlagValue: value,
              isChanged: value !== r.originalFlagValue,
            }
            : r
        )
      );
    };

    switch (row.ControlType) {
      case "Checkbox":
        const isChecked = row.FlagValue === "1" || row.FlagValue === 1;
        return (
          <label
            className="switch"
            style={{ display: "flex", alignItems: "center", marginBottom: "0" }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleFlagToggle(getCurrentSetData(), row, e)}
            />
            <span className="slider round2"></span>
          </label>
        );

      case "TextBox":
        return (
          // <input
          //   type="text"
          //   value={row.FlagValue || ""}
          //   onChange={(e) => {
          //     const value = e.target.value;
          //     setTableData((prev) =>
          //       prev.map((r) =>
          //         r.FlagName === row.FlagName ? { ...r, FlagValue: value } : r
          //       )
          //     );
          //   }}
          // />
          <Input
            onChange={(e) => {
              const value = e.target.value;
              updateFlagValue(row, value);
            }}
            value={row.FlagValue || ""}
            name="FlagValue"
            // className="required-fields"
            type="text"
            placeholder=""
            lable={t("Flag Value")}
            id="Visit No"
          />
        );

      case "Calendar":
        return (
          // <input
          //   type="date"
          //   value={row.FlagValue || ""}
          //   onChange={(e) => {
          //     const value = e.target.value;
          //     setTableData((prev) =>
          //       prev.map((r) =>
          //         r.FlagName === row.FlagName ? { ...r, FlagValue: value } : r
          //       )
          //     );
          //   }}
          // />
          <DatePicker
            className="custom-calendar"
            name="Date"
            value={row.FlagValue || ""}
            onChange={(e) => {
              const value = e.target.value;
              updateFlagValue(row, value);
            }}
            placeholder=" "
            lable="Date"
            maxDate={new Date(row.FlagValue)}
          />
        );

      case "Dropdown":
        return (
          // <select
          //   value={row.FlagValue || ""}
          //   onChange={(e) => {
          //     const value = e.target.value;
          //     setTableData((prev) =>
          //       prev.map((r) =>
          //         r.FlagName === row.FlagName ? { ...r, FlagValue: value } : r
          //       )
          //     );
          //   }}
          // >
          //   {row.Options?.map((opt) => (
          //     <option key={opt.value} value={opt.value}>
          //       {opt.label}
          //     </option>
          //   ))}
          // </select>
          <ReactSelect
            dynamicOptions={row?.Options}
            name="Dropdown"
            lable={t("Select Flag")}
            removeIsClearable={true}
            placeholderName={t("Select Flag")}
            value={row.FlagValue || ""}
            onChange={(name, selectedOption) => {
              const value = selectedOption?.value || "";
              updateFlagValue(row, value);
            }}
          />
        );

      default:
        return row.FlagValue || "";
    }
  };

  const handleSavePageMapping = (selectedPageIds) => {
    if (!currentRow) return;

    const updateData = (prevData) => {
      const rowIndexToUpdate = prevData.findIndex(
        (item) => item.FlagID === currentRow.FlagID
      );

      if (rowIndexToUpdate === -1) {
        console.error("Could not find row with FlagID:", currentRow.FlagID);
        return prevData;
      }

      const newData = [...prevData];
      newData[rowIndexToUpdate] = {
        ...newData[rowIndexToUpdate],
        PageID: selectedPageIds,
        isChanged: true,
      };

      return newData;
    }

    if (activeTab === "flags") {
      setTableData(updateData);
    } else if (activeTab === "centre") {
      setCentreFlagData(updateData);
    } else if (activeTab === "ratetype") {
      setRateTypeFlagData(updateData);
    }

    setShowModal(false);
    setCurrentRow(null);
  };

  const handleOpenPageMapping = (row) => {
    setCurrentRow(row);
    setShowModal(true);
  };

  const renderPageMappingControl = (row) => {
    const selectedCount = Array.isArray(row?.PageID) ? row.PageID.length : 0;

    return (
      <CustomButton
        text={`Pages${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
        icon={"pdf"}
        className="btn btn-sm btn-primary"
        onClick={() => handleOpenPageMapping(row)}
      />
    )
  }

  const handleSearchCompanyChange = (e) => {
    const value = e.target.value;
    setSearchCompanyPayload({ label: value, value: null });

    if (!value.trim()) {
      // When input is empty, reset to full list
      setSelectSearchCompany(false);
      setSearchCompanySuggestions(companyList);
    } else {
      // Filter companyList by label
      const filtered = companyList.filter((c) =>
        c.label.toLowerCase().includes(value.toLowerCase())
      );
      setSearchCompanySuggestions(filtered);
      setSelectSearchCompany(true);
      setSearchCompanyIndex(0);
    }
  };

  const handleSearchCompanyKeyDown = (e) => {
    if (!selectSearchCompany || searchCompanySuggestions.length === 0) return;

    if (e.key === "ArrowUp") {
      setSearchCompanyIndex((prev) =>
        prev > 0 ? prev - 1 : searchCompanySuggestions.length - 1
      );
    } else if (e.key === "ArrowDown") {
      setSearchCompanyIndex((prev) =>
        prev === searchCompanySuggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "Enter") {
      handleSearchCompanySelect(searchCompanySuggestions[searchCompanyIndex]);
      setSearchCompanyIndex(0);
    }
  };

  const handleSearchCompanySelect = (selected) => {
    // if (!selected) return;

    setSearchCompanyPayload(selected);
    setSelectSearchCompany(false);

    axiosInstance
      .post("CompanyMaster/GetCompanySearch", {
        companyId: selected?.value || 0,
      })
      .then((res) => {
        if (res.data.success && res.data?.data?.companyDetails?.length > 0) {
          const companyDetails = res.data.data.companyDetails[0];
          const flagDetails = res.data.data.flagDetails || [];
          const centreFlagDetails = res?.data?.data?.centreDetails || []
          const rateTypeFlagDetails = res?.data?.data?.rateTypeDetails || []
          const barcodePrintOutConfig = res?.data?.data?.barcodePrintOutConfig || []
          // const guid = res?.data?.guId[0]?.GuId || "";
          setPayload((prev) => ({
            ...prev,
            ...companyDetails,
            CompanyIsoLogo: companyDetails?.IsoLogoKey || guidNumber(),
            // companyGUID: guid,
            // FirstLastPage: companyDetails?.FirstLastPage ?? 0,
            // CompanyLogo:
            //   companyDetails?.CompanyLogo && companyDetails?.CompanyLogo !== ""
            //     ? companyDetails?.CompanyLogo
            //     : guidNumber(),
            pincode: "",
          }));
          if (Array.isArray(flagDetails) && flagDetails.length > 0) {
            setTableData(normalizeFlagValues(flagDetails));
            setCopyTableData(normalizeFlagValues(flagDetails));
          } else {
            setTableData([]);
            setCopyTableData([]);
          }

          if (Array.isArray(centreFlagDetails) && centreFlagDetails.length > 0) {
            setCentreFlagData(normalizeFlagValues(centreFlagDetails))
            setCopyCentreData(normalizeFlagValues(centreFlagDetails))
          }
          //  else {
          //   setCentreFlagData([])
          //   setCopyCentreData([])
          // }

          if (Array.isArray(rateTypeFlagDetails) && rateTypeFlagDetails.length > 0) {
            setRateTypeFlagData(normalizeFlagValues(rateTypeFlagDetails))
            setCopyRateTypeData(normalizeFlagValues(rateTypeFlagDetails))
          }
          if (Array.isArray(barcodePrintOutConfig) && barcodePrintOutConfig.length > 0) {
            setMachineBarcodeData(barcodePrintOutConfig)
            setCopyMachineBarcodeData(barcodePrintOutConfig)
          }
          // else {
          //   setRateTypeFlagData([])
          //   setCopyRateTypeData([])
          // }
          getConfigrationData(selected?.value || 0);
          navigate("/CompanyMaster", {
            state: {
              other: { button: "Update", pageName: "Edit" },
              url: "CompanyMaster/UpdateCompanyMaster",
              data: selected?.value || 0,
            },
          });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch company details");
      });
  };

  const handleMobileFun = (type) => {
    if (type === "ADD") {
      setShowMobile2(true);
    } else {
      setShowMobile2(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (["CompanyCode"].includes(name)) {
      setPayload({
        ...payload,
        [name]: value.trim().toUpperCase(),
      });
    } else if (name === "Country" || name === "City") {
      setPayload({
        ...payload,
        [name]: PreventSpecialCharacter(value)
          ? value.trimStart()
          : payload[name],
      });
    } else if (["CompanyName"].includes(name)) {
      setPayload({
        ...payload,
        [name]: PreventSpecialCharacter(value)
          ? value.trimStart().toUpperCase()
          : payload[name],
      });
    } else if (["Email"].includes(name)) {
      setPayload({
        ...payload,
        [name]: value.trim(),
      });
    } else {
      setPayload({
        ...payload,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      });
    }
  };

  const renderData = tableData.map((row, index) => ({
    ...row,
    Value: renderControl(row),
  }));

  //   const renderData = useMemo(() => {
  //   return tableData.map((row) => ({
  //     ...row,
  //     Value: renderControl(row),
  //   }));
  // }, [tableData]);

  const BindBillingDropDown = (value) => {
    if (value === "PostPaid") {
      getGlobalData("BillingType");
    } else if (value === "PrePaid") {
      setBillingType([]);
    }
  };
  const getBilling = (value) => {
    const values = CompanyBillingCycle?.filter((ele) => ele?.value == value);
    return values[0]?.label;
  };
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    if (name == "SelectType") {
      setPayload({ ...payload, [name]: value, BillingType: getBilling(value) });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };
  console.log(payload);

  const getGlobalData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res?.data?.message;
        if (res?.data?.success && Array.isArray(data)) {
          let value = data?.map((ele) => {
            return {
              value: ele?.FieldDisplay,
              label: ele?.FieldDisplay,
            };
          });
        }
        switch (name) {
          case "BillingType":
            setBillingType(value);
            break;
          case "GraceType":
            setGraceType(value);
            break;
          default:
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  const loadCompanyLogoPreview = async () => {
    if (!payload?.CompanyId || !payload?.CompanyLogo) {
      setLogoPreview("");
      setLogoHashId("");
      return;
    }

    setLogoLoading(true);
    setLogoError("");
    try {
      const res = await axiosInstance.post("CommonController/GetCompanyLogo", {
        Page: "CompanyLogo",
        Guid: payload.CompanyLogo,
        CompanyId: String(payload.CompanyId),
      });
      const docs = res?.data?.message;
      if (Array.isArray(docs) && docs.length > 0) {
        setLogoHashId(docs[0].ID_Hash || "");
        setLogoPreview(docs[0].fileUrl || "");
      } else {
        setLogoHashId("");
        setLogoPreview("");
      }
    } catch (err) {
      setLogoHashId("");
      setLogoPreview("");
      setLogoError(
        err?.response?.data?.message || t("Unable to load company logo")
      );
    } finally {
      setLogoLoading(false);
    }
  };

  const handleRemoveCompanyLogo = () => {
    if (!logoHashId || !payload?.CompanyId) {
      toast.error(t("No company logo found to remove."));
      return;
    }
    if (!window.confirm(t("Do you want to remove the company logo?"))) {
      return;
    }

    setLogoLoading(true);
    axiosInstance
      .post("CommonController/InActiveCompanyDocument", {
        Hash_Id: logoHashId,
        CompanyId: String(payload.CompanyId),
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || t("Company logo removed"));
          setLogoPreview("");
          setLogoHashId("");
          window.dispatchEvent(new Event("company-logo-updated"));
        } else {
          toast.error(res?.data?.message || t("Unable to remove company logo"));
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || t("Unable to remove company logo")
        );
      })
      .finally(() => setLogoLoading(false));
  };

  const openLogoUpload = () => {
    if (!payload?.CompanyId) {
      toast.error(t("Please save the company first, then upload the logo."));
      return;
    }
    setShow2(true);
  };

  console.log("State url", state)

  const fetch = (id) => {
    setLoading(true);
    axiosInstance
      .post(state?.url, {
        CompanyId: id,
      })
      .then((res) => {
        setLoading(false);
        if (res?.data?.success) {
          const data = res?.data?.message[0];
          const guid = res?.data?.guId[0]?.GuId || "";
          setPayload({
            ...data,
            companyGUID: guid,
            FirstLastPage: data?.FirstLastPage ?? 0,
            CompanyLogo:
              data?.CompanyLogo && data?.CompanyLogo !== ""
                ? data?.CompanyLogo
                : guidNumber(),
            CompanyIsoLogo:
              data?.CompanyIsoLogo && data?.CompanyIsoLogo !== ""
                ? data?.CompanyIsoLogo
                : guidNumber(),
            pincode: "",
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
      });
  };

  const getCompanyData = async () => {
    setLoading(true);
    axiosInstance
      .post("CompanyMaster/GetCompanyConfig", {
        companyId: state?.data || 0,
      })
      .then((res) => {
        if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
          // console.log("company res", res);
          setTableData(normalizeFlagValues(res.data.message));
          setCopyTableData(normalizeFlagValues(res.data.message));
        } else {
          setTableData([]);
          setCopyTableData([]);
          toast.info("No data found");
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured."
        );
        setLoading(false);
      });
  };

  const getCentreFlagData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("CompanyMaster/GetCentreOrRateTypeFlagMaster", {
        centreId: 0,
        dataType: "centre"
      });

      if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
        const normalizedData = normalizeFlagValues(res.data.message);
        setCentreFlagData(normalizedData);
        setCopyCentreData(normalizedData);
      } else {
        setCentreFlagData([]);
        setCopyCentreData([]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching centre flags");
      setCentreFlagData([]);
      setCopyCentreData([]);
    } finally {
      setLoading(false);
    }
  };

  const getRateTypeFlagData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("CompanyMaster/GetCentreOrRateTypeFlagMaster", {
        centreId: 0,
        dataType: "RateType"
      });

      if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
        const normalizedData = normalizeFlagValues(res.data.message);
        setRateTypeFlagData(normalizedData);
        setCopyRateTypeData(normalizedData);
      } else {
        setRateTypeFlagData([]);
        setCopyRateTypeData([]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching ratetype flags");
      setRateTypeFlagData([]);
      setCopyRateTypeData([]);
    } finally {
      setLoading(false);
    }
  };

  const getMachineBarcodeData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("CommonController/GetBarcodePrintOutConfig", {});

      if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
        // const normalizedData = normalizeFlagValues(res.data.message);
        const normalizedData = res.data.message.map((item, index) => ({
          ...item,
          SrNo: index + 1,
          isChanged: false,
        }));
        setMachineBarcodeData(normalizedData);
        setCopyMachineBarcodeData(normalizedData);
      } else {
        setMachineBarcodeData([]);
        setCopyMachineBarcodeData([]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching machine barcode configurations");
      setMachineBarcodeData([]);
      setCopyMachineBarcodeData([]);
    } finally {
      setLoading(false);
    }
  };

  const getConfigrationData = async (companyId = 0) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`CommonController/GetApiConfiguration?CompanyId=${companyId}`);

      if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
        const normalizedData = res.data.message.map((item, index) => ({
          ...item,
          SrNo: index + 1,
          isChanged: false,
        }));
        setConfigrationData(normalizedData);
        setCopyConfigrationData(normalizedData);
      } else {
        setConfigrationData([]);
        setCopyConfigrationData([]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching API configuration");
      setConfigrationData([]);
      setCopyConfigrationData([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (activeTab === "flags") {
  //   } else if (activeTab === "centre") {
  //     getCentreFlagData();
  //   } else if (activeTab === "ratetype") {
  //     getRateTypeFlagData();
  //   }
  //   setFilter("");
  // }, [activeTab]);

  useEffect(() => {
    if (state?.data) {
      fetch(state?.data);
    }
  }, []);

  useEffect(() => {
    getCompanyData();
    getCentreFlagData();
    getRateTypeFlagData()
    getMachineBarcodeData()
    // getConfigrationData(state?.data || 0)
    getCompanyDetails();
    fetchPages()
  }, []);

  useEffect(() => {
    if (!show2) {
      loadCompanyLogoPreview();
    }
  }, [payload?.CompanyId, payload?.CompanyLogo, show2]);

  const { values, errors, handleBlur, touched, handleSubmit } = useFormik({
    initialValues: { ...payload },
    enableReinitialize: true,
    validationSchema: CompanyMasterValidation,
    onSubmit: (values) => {
      setLoading(true);

      const updatePayload = {
        ...getTrimmedData(payload),
        flagRecords: getChangedFlagRecords(tableData),
        centreFlagRecords: getChangedFlagRecords(centreFlagData),
        rateTypeFlagRecords: getChangedFlagRecords(rateTypeFlagData),
        barcodePrintOutConfig: copyMachineBarcodeData.filter((item) => item.isChanged),
      };
      axiosInstance
        .post(
          state?.url
            ? "CompanyMaster/UpdateCompanyMaster"
            : "CompanyMaster/SaveCompanyMaster",
          updatePayload
        )
        .then((res) => {
          if (res?.data?.success) {
            navigate(`/CompanyMasterList`);
            toast.success(res?.data?.message);
          } else {
            toast.error(res?.data?.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Wents Wrong."
          );
          setLoading(false);
        });
    },
  });

  useEffect(() => {
    getGlobalData("GraceType");
  }, []);

  useEffect(() => {

  }, [tableData]);

  const handleRadioChange = (event) => {
    const { name, value } = event?.target;
    setPayload({ ...payload, [name]: Number(value) });
  };

  // const handleFilterChange = (e) => {
  //   const value = e?.target?.value || "";
  //   setFilter(value);

  //   if (!value.trim()) {
  //     setTableData(copyTableData);
  //     return;
  //   }

  //   const filtered = copyTableData?.filter((item) =>
  //     item?.FlagName?.toLowerCase().includes(value.toLowerCase())
  //   );

  //   setTableData(filtered);
  // };

  const handleFilterChange = (e) => {
    const value = e?.target?.value || "";
    setFilter(value);

    let copyData = [];
    let setData = null;

    if (activeTab === "flags") {
      copyData = copyTableData;
      setData = setTableData;
    } else if (activeTab === "centre") {
      copyData = copyCentreData;
      setData = setCentreFlagData;
    } else if (activeTab === "ratetype") {
      copyData = copyRateTypeData;
      setData = setRateTypeFlagData;
    } else if (activeTab === "machinebarcode") {
      copyData = copyMachineBarcodeData;
      setData = setMachineBarcodeData;
    } else if (activeTab === "configuration") {
      copyData = copyConfigrationData;
      setData = setConfigrationData;
    }

    if (!value.trim()) {
      setData(copyData);
      return;
    }

    const filtered = copyData?.filter((item) => {
      if (activeTab === "machinebarcode") {
        return (
          item?.ParameterName?.toLowerCase().includes(value.toLowerCase()) ||
          item?.BarcodeType?.toLowerCase().includes(value.toLowerCase())
        );
      }
      return item?.FlagName?.toLowerCase().includes(value.toLowerCase());
    });

    setData(filtered);
  };

  const handleChanges = (select, name) => {
    const val = select?.map((ele) => ele?.value);
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  const handleAddFlag = (type) => {
    setModalType(type);
    setEditData(null);
    setOpenAddModal(true);
  };

  const handleConfigure = (type) => {
    setModalType(type);
    setEditData(null);
    setOpenConfiguration(true);
  };

  const handleEditFlag = (row, type) => {
    setModalType(type);
    setEditData(row);
    setOpenAddModal(true);
  };

  const handleSaveCallback = () => {
    // Refresh your table data here
    if (modalType === "company") {
      getCompanyData();
    } else if (modalType === "centre") {
      getCentreFlagData();
    } else if (modalType === "ratetype") {
      getRateTypeFlagData()
    } else if (modalType === "machinebarcode") {
      getMachineBarcodeData()
    } else if (modalType === "configuration") {
      getConfigrationData()
    }
  };

  const getCurrentTableData = () => {
    if (activeTab === "flags") return tableData;
    if (activeTab === "centre") return centreFlagData;
    if (activeTab === "ratetype") return rateTypeFlagData;
    if (activeTab === "machinebarcode") return machineBarcodeData;
    if (activeTab === "configuration") return configrationData;
    return [];
  }

  const renderTable = () => {
    const currentTableData = getCurrentTableData();

    if (loading) {
      return (
        <div className="text-center py-5">
          <Loading />
        </div>
      );
    }

    if (!currentTableData || currentTableData.length === 0) {
      return (
        <div className="text-center py-5 text-muted">
          <i className="fa fa-inbox fa-3x mb-3"></i>
          <p>{t("No flag data available")}</p>
        </div>
      );
    }

    if (activeTab === "machinebarcode") {
      return (
        <CustomTable
          columns={machineBarcodeColumns}
          data={currentTableData.map((row, index) => ({
            ...row,
            //  BarcodeTypeDisplay: (
            //     <div style={{minWidth: "150px"}}>
            //       <ReactSelect
            //          dynamicOptions={[{label: "machinebarcode", value: "machinebarcode"}, {label: "machinebarcode1", value: "machinebarcode1"}]}
            //          value={row.BarcodeType}
            //          onChange={(name, e) => handleMachineBarcodeChange(row.ID, "BarcodeType", e.value)}
            //          placeholderName="Select"
            //          removeIsClearable={true}
            //      />
            //     </div>
            //  ),
            ParameterHeadingDisplay: (
              <Input
                type="text"
                value={row.ParameterHeading}
                onChange={(e) => handleMachineBarcodeChange(row.ID, "ParameterHeading", e.target.value)}
                className="form-control input-sm"
              />
            ),
            IsPrintDisplay: (
              <label className="switch" style={{ display: "flex", alignItems: "center", marginBottom: "0" }}>
                <input
                  type="checkbox"
                  checked={row.IsPrint === 1}
                  onChange={(e) => handleMachineBarcodeChange(row.ID, "IsPrint", e.target.checked ? 1 : 0)}
                />
                <span className="slider round2"></span>
              </label>
            ),
            PrintSequenceDisplay: (
              <Input
                type="number"
                value={row.PrintSequence}
                onChange={(e) => handleMachineBarcodeChange(row.ID, "PrintSequence", e.target.value)}
                className="form-control input-sm"
              />
            )
          }))}
          theadStyle={{ zIndex: 1 }}
          scrollView="scroll"
          tableHeight="table-responsive"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        />
      )
    }

    if (activeTab === "configuration") {
      return (
        <CustomTable
          columns={ConfigurationColumns}
          data={currentTableData.map((row, index) => ({
            ...row,
            SrNo: index + 1,
            payloadTemplate: typeof row.payloadTemplate === "object" ? JSON.stringify(row.payloadTemplate) : row.payloadTemplate,
            headers: (
              <div
                onClick={() => {
                  setViewModalData(row);
                  setShowViewModal(true);
                }}
                className="text-info cursor-pointer text-center"
              >
                <i className="fa fa-eye"></i>
              </div>
            ),
            verifyWalletCount: typeof row.verifyWalletCount === "object" ? JSON.stringify(row.verifyWalletCount) : row.verifyWalletCount,
            Action: (
              <div
                onClick={() => {
                  setModalType("configuration");
                  setEditData(row);
                  setOpenConfiguration(true);
                }}
                className="text-primary cursor-pointer"
              >
                <i className="fa fa-edit"></i>
              </div>
            )
          }))}
          theadStyle={{ zIndex: 1 }}
          scrollView="scroll"
          tableHeight="table-responsive"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        />
      )
    }

    return (
      <CustomTable
        columns={columns}
        data={currentTableData.map((row) => ({
          ...row,
          Value: renderControl(row),
          PageID: renderPageMappingControl(row)
        }))}
        theadStyle={{ zIndex: 1 }}
        scrollView="scroll"
        tableHeight="table-responsive"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      />
    );
  }

  return (
    <>
      <>
        {show && (
          <UploadFile
            show={show}
            handleClose={() => setShow(false)}
            documentId={payload?.companyGUID}
            pageName="CompanyMaster"
          />
        )}
      </>
      <>
        {show2 && (
          <UploadFile
            show={show2}
            handleClose={() => {
              setShow2(false);
              loadCompanyLogoPreview();
            }}
            documentId={payload?.CompanyLogo}
            pageName="CompanyLogo"
            ChangeApi={true}
            CompanyId={payload?.CompanyId}
          />
        )}
      </>
      <>
        {CompanyISOLogoModal && (
          <UploadFile
            options={[{ label: "isologo", value: "isologo" }]}
            show={CompanyISOLogoModal}
            handleClose={() => setCompanyISOLogoModal(false)}
            documentId={payload?.CompanyIsoLogo}
            pageName="CompanyIsoLogo"
            CompanyId={payload?.CompanyId}
            LedgerTransactionIDHash={payload?.CompanyId}
          />
        )}
      </>
      <>
        <FlagsModal
          show={openAddModal}
          onHandleClose={() => {
            setOpenAddModal(false);
          }}
          flagType={modalType}
          editData={editData}
          onSave={handleSaveCallback}
        />
      </>
      <>
        <Configuration
          show={openConfiguration}
          onHandleClose={() => {
            setOpenConfiguration(false);
          }}
          flagType={modalType}
          editData={editData}
          onSave={handleSaveCallback}
          companyId={payload?.CompanyId || state?.data || 0}
        />
      </>
      <>
        <FlagPageMappingModal
          show={showModal}
          onHandleClose={() => {
            setShowModal(false);
            setCurrentRow(null);
          }}
          onSave={handleSavePageMapping}
          selectedPageIds={currentRow?.PageID || []}
        />
      </>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("Full Configuration Data")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-2" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="table table-bordered table-striped table-sm">
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {viewModalData && Object.entries(viewModalData).map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>{key}</td>
                    <td style={{ wordBreak: 'break-all' }}>
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            {t("Close")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Accordion
        name={t("Company Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-sm-4">
            <Input
              type="text"
              name="SearchCompany"
              lable="Search Any Company For Update"
              value={searchCompanyPayload.label || ""}
              placeholder=" "
              onChange={handleSearchCompanyChange}
              onKeyDown={handleSearchCompanyKeyDown}
              onBlur={() =>
                setTimeout(() => setSelectSearchCompany(false), 200)
              }
            />

            {selectSearchCompany && searchCompanySuggestions.length > 0 && (
              <AutoComplete
                selects={selectSearchCompany}
                test={searchCompanySuggestions.map((item) => ({
                  TestName: item.label,
                }))}
                handleListSearch={(selected) =>
                  handleSearchCompanySelect(
                    searchCompanySuggestions.find(
                      (item) => item.label === selected.TestName
                    )
                  )
                }
                indexMatch={searchCompanyIndex}
              />
            )}
          </div>
        </div>
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2 col-md-2">
            <Input
              disabled={state?.other?.button ? true : false}
              lable="CompanyCode"
              placeholder=" "
              id="CompanyCode"
              className="required-fields"
              type="text"
              name="CompanyCode"
              value={payload?.CompanyCode}
              onChange={handleChange}
              onBlur={handleBlur}
              max={10}
              onInput={(e) => number(e, 10)}
            />
            {errors?.CompanyCode && touched?.CompanyCode && (
              <span className="error-message">{errors?.CompanyCode}</span>
            )}
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Company Name"
              placeholder=" "
              id="Company Name"
              type="text"
              className="required-fields"
              name="CompanyName"
              value={payload?.CompanyName}
              onBlur={handleBlur}
              onChange={handleChange}
              max={60}
            />
            {errors?.CompanyName && touched?.CompanyName && (
              <span className="error-message">{errors?.CompanyName}</span>
            )}
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Country"
              placeholder=" "
              id="Country"
              onChange={handleChange}
              value={payload?.Country}
              name="Country"
              type="text"
              max={25}
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="State"
              placeholder=" "
              id="State"
              onChange={handleChange}
              value={payload?.State}
              name="State"
              type="text"
              max={25}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="City"
              placeholder=" "
              id="City"
              onChange={handleChange}
              value={payload?.City}
              name="City"
              type="text"
              max={25}
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Email"
              placeholder=" "
              id="Email"
              onChange={handleChange}
              value={payload?.Email}
              name="Email"
              type="email"
              max={50}
              onBlur={handleBlur}
              required
            />
            {errors?.Email && touched?.Email && (
              <span className="error-message">{errors?.Email}</span>
            )}
          </div>
        </div>
        <div className="row px-2  mb-1">
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Phone No"
              placeholder=" "
              id="Phone No"
              onInput={(e) => number(e, 10)}
              type="number"
              name="PhoneNo"
              value={payload?.PhoneNo}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Land Line No."
              placeholder=" "
              id="Landline"
              name="Phone2"
              value={payload?.Phone2}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <div className="d-flex">
              <div style={{ width: "88%" }}>
                <Input
                  onInput={(e) => number(e, 10)}
                  lable="Mobile No"
                  placeholder=" "
                  className="required-fields"
                  id="Mobile No"
                  type="number"
                  name="Mobile1"
                  value={payload?.Mobile1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>{" "}
              <div style={{ width: "10%" }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleMobileFun("ADD")}
                >
                  {" "}
                  <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                </button>{" "}
              </div>
            </div>
            {errors?.Mobile1 && touched?.Mobile1 && (
              <span className="error-message">{errors?.Mobile1}</span>
            )}
            {showMobile2 && (
              <div className="d-flex">
                <div style={{ width: "88%" }}>
                  <Input
                    onInput={(e) => number(e, 10)}
                    className="select-input-box form-control input-sm"
                    id="Mobile2"
                    lable="Mobile2"
                    placeholder=" "
                    type="number"
                    name="Mobile2"
                    value={payload?.Mobile2}
                    onChange={handleChange}
                  />
                </div>{" "}
                <div style={{ width: "10%" }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleMobileFun("DELETE")}
                  >
                    {" "}
                    <i className="fa fa-minus fa-sm new_record_pluse"></i>
                  </button>{" "}
                </div>
              </div>
            )}
            <div>
              {errors?.Mobile2 && touched?.Mobile2 && (
                <span className="error-message">{errors?.Mobile2}</span>
              )}
            </div>
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Address1"
              placeholder=" "
              id="Address1"
              onChange={handleChange}
              value={payload?.Address1}
              name="Address1"
              type="text"
              max={50}
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Address2"
              placeholder=" "
              id="Address2"
              onChange={handleChange}
              value={payload?.Address2}
              name="Address2"
              type="text"
              max={50}
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Address3"
              placeholder=" "
              id="Address3"
              onChange={handleChange}
              value={payload?.Address3}
              name="Address3"
              type="text"
              max={50}
            />
          </div>
        </div>

        <div className="px-2 mb-1 d-flex justify-content-between">
          <div className="row flex-grow-1">
            <div className="col-sm-2 col-md-2 ">
              <SelectBox
                options={CompanyBillingCycle}
                name="SelectType"
                id="SelectType"
                lable="BillingType"
                selectedValue={payload?.SelectType}
                onChange={handleSelectChange}
              />
            </div>
            {/* <div className="col-sm-2 col-md-2 ">
              <SelectBoxWithCheckbox
                lable="Payment Options"
                className="required-fields"
                id="PaymentOptions"
                placeholder=""
                name="PaymentOptions"
                options={PaymentOptionsList}
                value={payload?.PaymentOptions}
                onChange={handleChanges}
              />
            </div> */}
            <PaymentGatwayKitModal />
            <div className="col-12 col-md-6">
              <div className="company-logo-section">
                <div className="company-logo-preview-box">
                  {logoLoading ? (
                    <span className="company-logo-placeholder">{t("Loading...")}</span>
                  ) : logoPreview ? (
                    <img
                      src={logoPreview}
                      alt={t("Company Logo")}
                      className="company-logo-preview-img"
                    />
                  ) : (
                    <span className="company-logo-placeholder">
                      {t("No logo uploaded")}
                    </span>
                  )}
                </div>
                <div className="company-logo-actions">
                  <label className="company-logo-label">{t("Company Logo")}</label>
                  <div className="company-logo-hint">
                    {t("Recommended: 200×60 px. Max 1024×1024 px, 1 MB. JPG, PNG or WEBP only.")}
                  </div>
                  {logoError ? (
                    <div className="error-message">{logoError}</div>
                  ) : null}
                  <div className="d-flex" style={{ gap: "8px", flexWrap: "wrap" }}>
                    <CustomButton
                      text={logoPreview ? t("Change Logo") : t("Upload Logo")}
                      onClick={openLogoUpload}
                    />
                    {logoPreview ? (
                      <CustomButton
                        text={t("Remove Logo")}
                        onClick={handleRemoveCompanyLogo}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <CustomButton
                text={"CompanyIsoLogo"}
                onClick={() => setCompanyISOLogoModal(true)}
              />
            </div>

            {showPdf2 && (
                    <UploadFile
                      show={showPdf2}
                      handleClose={() => setShowPdf2(false)}
                      documentId={payload?.CompanyIDHash}
                      // pageName={
                      //   name === t("center") ? t("CentreMaster") : t("RateTypeMaster")
                      // }
                      pageName={"SamartReportFirstCoverPage"}
                      LedgerTransactionIDHash={payload?.CompanyId}
                    />
                  )}
            <div
              className={`col-auto mb-1`}
            >
              <CustomButton
                type="button"
                className="btn btn-info btn-sm btn-block"
                id="Advd.FirstPage"
                onClick={() => setShowPdf2(true)}
                text={t("Advd. First Page")}
              />
             
              
            </div>

          </div>
          {/* <div className="px-3">
            <FilterInput value={filter} onChange={handleFilterChange} />
          </div> */}
        </div>

        <div className="row px-2 mb-1 remove_element">
          <div className="col-sm-1  ">
            <div className="mt-1">
              <input
                type="checkbox"
                name="isPrefixRequired"
                onChange={handleChange}
                checked={payload?.isPrefixRequired ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("isPrefixReq.")}</label>
          </div>
          <div className="col-sm-1 d-flex ">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsShareRequired"
                onChange={handleChange}
                checked={payload?.IsShareRequired ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("IsShareReq.")}</label>
          </div>
          <div className="col-sm-1 d-flex ">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsSmsRequired"
                onChange={handleChange}
                checked={payload?.IsSmsRequired ? true : false}
              />
            </div>

            <label>{t("IsSmsReq.")}</label>
          </div>
          <div className="col-sm-1 d-flex ">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsEmailRequired"
                onChange={handleChange}
                checked={payload?.IsEmailRequired ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("IsEmailReq.")}</label>
          </div>{" "}
          <div className="col-sm-1 d-flex ">
            <div className="mt-1">
              <input
                type="checkbox"
                name="SkipMicLabEntry"
                onChange={handleChange}
                checked={payload?.SkipMicLabEntry ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("SkipMicrolab.")}</label>
          </div>
          <div className="col-sm-1 d-flex ">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsWhatsappRequired"
                onChange={handleChange}
                checked={payload?.IsWhatsappRequired ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("WhatsappReq.")}</label>
          </div>
          <div className=" col-sm-2 d-flex ">
            <div className="mt-1">
              <input
                type="checkbox"
                name="ModifiedRegDate"
                onChange={handleChange}
                checked={payload?.ModifiedRegDate ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("IsModifyPatientRegisterationDate")}</label>
          </div>
          <div className="col-sm-2 d-flex ">
            <div className="mt-1">
              <input
                type="checkbox"
                name="AllowMultipleBooking"
                onChange={handleChange}
                checked={payload?.AllowMultipleBooking ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("AllowMultipleBooking")}</label>
          </div>
        </div>
        <div className="row px-2 mb-1 remove_element">
          <div className="col-sm-4 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="SampleCollectionAndDepartmentRecieve"
                onChange={handleChange}
                checked={
                  payload?.SampleCollectionAndDepartmentRecieve ? true : false
                }
              />
            </div>
            &nbsp;
            <label>
              {t("SkipSampleCollection&Dept.Recieve for CultureTest")}
            </label>
          </div>
          <div className="col-sm-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="DirectB2B"
                onChange={handleChange}
                checked={payload?.DirectB2B ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("DirectB2B")}</label>
          </div>
          <div className="col-sm-2 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsPatientWiseReporting"
                onChange={handleChange}
                checked={payload?.IsPatientWiseReporting ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("IsPatientWiseReporting")}</label>
          </div>
          <div className="col-sm-2 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsAcknowledgementSlipRequired"
                onChange={handleChange}
                checked={payload?.IsAcknowledgementSlipRequired ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("Isacknowledgement Slip Required")}</label>
          </div>
          <div className="col-sm-2 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="AfterApprovedDiscountReq"
                onChange={handleChange}
                checked={payload?.AfterApprovedDiscountReq ? true : false}
              />
            </div>
            &nbsp;
            <label>{t("AfterApprovedDiscountRequired")}</label>
          </div>
          {/* <div className="col-sm-4 d-flex">
            <label className="mr-4">{t("IsMenuRole")}</label>
            <div className="mr-3">
              <input
                type="radio"
                name="isRolewise"
                value={"0"}
                checked={payload?.isRolewise === 0}
                onChange={handleRadioChange}
              ></input>
              <label className="ml-2">{t("DesignationWise")}</label>
            </div>
            <div className="">
              <input
                type="radio"
                name="isRolewise"
                value={"1"}
                checked={payload?.isRolewise === 1}
                onChange={handleRadioChange}
              ></input>
              <label className="ml-2">{t("RoleWise")}</label>
            </div>
          </div> */}
        </div>

        <div className="row px-2 mt-3">
          <div className="col-12">
            <Tab.Container
              activeKey={activeTab}
              onSelect={(k) => {
                setActiveTab(k);
                if (k === "configuration") {
                  getConfigrationData(payload?.CompanyId || state?.data || 0);
                }
              }}
            >
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="flags">
                    <i className="fa fa-flag me-2"></i>
                    {t("Company Flags")}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="centre">
                    <i className="fa fa-building me-2"></i>
                    {t("Centre Flags")}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="ratetype">
                    <i className="bi bi-currency me-2"></i>
                    {t("RateType Flags")}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="machinebarcode">
                    <i className="bi bi-currency me-2"></i>
                    {t("Machine Barcode")}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="configuration">
                    <i className="bi bi-currency me-2"></i>
                    {t("Configuration")}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey="flags">
                  <div className="d-flex justify-content-end mb-2" style={{ gap: "5px" }}>
                    <FilterInput value={filter} onChange={handleFilterChange} />
                    {/* <CustomButton
                      icon={"add"}
                      text={t("Add company Flag")}
                    // onClick={() => handleAddFlag("centre")}
                    /> */}
                  </div>
                  <div className="row">
                    <div className="col-12">
                      {renderTable()}
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="centre">
                  <div className="d-flex justify-content-end mb-2" style={{ gap: "5px" }}>
                    <FilterInput value={filter} onChange={handleFilterChange} />
                    <CustomButton
                      icon={"add"}
                      text={t("Add Centre Flag")}
                      onClick={() => handleAddFlag("centre")}
                    />
                  </div>
                  <div className="row">
                    <div className="col-12">
                      {renderTable()}
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="ratetype">
                  <div className="d-flex justify-content-end mb-2" style={{ gap: "5px" }}>
                    <FilterInput value={filter} onChange={handleFilterChange} />
                    <CustomButton
                      icon={"add"}
                      text={t("Add RateType Flag")}
                      onClick={() => handleAddFlag("ratetype")}
                    />
                  </div>
                  <div className="row">
                    <div className="col-12">
                      {renderTable()}
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="machinebarcode">
                  <div className="d-flex justify-content-end mb-2" style={{ gap: "5px" }}>
                    <FilterInput value={filter} onChange={handleFilterChange} />
                  </div>
                  <div className="row">
                    <div className="col-12">
                      {renderTable()}
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="configuration">
                  <div className="d-flex justify-content-end mb-2" style={{ gap: "5px" }}>
                    <FilterInput value={filter} onChange={handleFilterChange} />
                    <CustomButton
                      icon={"add"}
                      text={t("Add Configuration")}
                      onClick={() => handleConfigure("configuration")}
                    />
                  </div>
                  <div className="row">
                    <div className="col-12">
                      {renderTable()}
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>

        {/* <div className="row pt-2 pl-2 pr-2">
          {loading ? (
            <Loading />
          ) : tableData && tableData.length > 0 ? (
            <CustomTable
              columns={columns}
              // data={renderData}
              data={tableData.map((row) => ({
                ...row, 
                Value: renderControl(row),
                PageID: renderPageMappingControl(row)
              }))}
              theadStyle={{ zIndex: 1 }}
              scrollView="scroll"
              tableHeight="table-responsive"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            />
          ) : null}
        </div> */}
        <div className="row px-2 mb-2 mt-2">
          {/* <div className="col-sm-2">
            <CustomButton
              text={"Upload Company Logo"}
              onClick={() => setShow2(true)}
            />
          </div> */}
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <>
                <SaveButton
                  text={
                    state?.other?.button ? t(state?.other?.button) : t("Save")
                  }
                  onClick={handleSubmit}
                  type="submit"
                />
              </>
            )}
          </div>
          <div className="col-sm-2">
            <Link to={`/CompanyMasterList`} style={{ fontSize: "13px" }}>
              {t("Back to List")}
            </Link>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default CompanyMaster;
