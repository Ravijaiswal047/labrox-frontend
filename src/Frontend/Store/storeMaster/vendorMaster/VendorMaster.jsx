import React, { useEffect, useRef, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import RadioInput from "../../../../components/formComponent/RadioInput";
import { State } from "oidc-client-ts";
import Tables from "../../../../components/UI/customTable";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";
import Heading from "../../../../components/UI/Heading";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import VendorMasterSearchTable from "./VendorMasterSearchTable";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { VendorMasterValidationSchema } from "../../../../utils/Schema";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import UploadFile from "../../../utils/UploadFileModal/UploadFile";
import { CustomButton, SaveButton } from "../../../../components/UI/CustomButton";
import DatePicker from "../../../../components/formComponent/DatePicker";
import moment from "moment/moment";
import * as XLSX from "xlsx";
import { Dialog } from "primereact/dialog";
import Loading from "../../../../components/loader/Loading";
const VendorMaster = () => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  console.log("userData", userData?.ST_AutoGenerateVendorCode);

  const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const theme = useLocalStorage("theme", "get");
  const [currencyOptions, setCurrencyOptions] = useState([]);

  const initialState = {
    SupplierName: "",
    SupplierCode: "",
    SupplierType: null,
    IsActive: "1",
    SupplierCategory: null,
    OrganizationType: null,
    HouseOfficeNo: "",
    Locality: "",
    Country: null,
    State: null,
    Pincode: "",
    Landline: "",
    FaxNo: "",
    Email: "",
    Website: "",
    PrimaryContactPerson: "",
    PrimaryDesignation: "",
    PrimaryMobileNo: "",
    PrimaryEmail: "",
    SecondaryContactPerson: "",
    SecondaryDesignation: "",
    SecondaryMobileNo: "",
    SecondaryEmail: "",
    TANNo: "",
    PFRegistartionNo: "",
    NameOnPANCard: "",
    Bank1AccountNo: "",
    PANCardNo: "",
    ROCNo: "",
    ESIRegistrationNo: "",
    ISOCertificationNo: "",
    ISOValidUpto: "",
    PCBCertificationNo: "",
    PCBValidUpto: "",
    MSMERegistration: "",
    IsMSMERegistration: "",
    MSMEValidUpto: "",
    Bank1: "",
    Bank1Branch: "",
    Bank1IFSCCode: "",
    Bank1Address: "",
    Bank1City: "",
    Bank1State: "",
    Bank2: "",
    Bank2Branch: "",
    Bank2AccountNo: "",
    Bank2IFSCCode: "",
    Bank2Address: "",
    Bank2City: "",
    Bank2State: "",
    AnnualTurnover: "",
    GSTState: null,
    GSTAddress: "",
    GSTNO: "",
    PaymentTerms: "",
    Taxes: "",
    DeliveryTerms: "",
    VendorToNotes: "",
    CreditLimit: "",
    IsLoginRequired: "",
    UserName: "",
    Password: "",
    ConfirmPassword: "",
    AutoClosePO: "0",
    ClosePOAfter: "",
    year: null,
    vendorid: "",
    Krapin: "",
    specifiedCurrency: ""
  };
  const [payload, setPayload] = useState(initialState);
  const [yearOptions, setYearOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErros] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [TemplateData, setTemplateData] = useState([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [duplicateRows, setDuplicateRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importSummary, setImportSummary] = useState(null);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "GSTNO") {
      const gstNo = value.toUpperCase();
      setPayload((prev) => ({
        ...prev,
        [name]: gstNo,
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
      }));
    }
  };
  // const getYearList = () => {
  //   let yearArr = [];
  //   for (let i = 2010; i <= 2025; i++) {
  //     let obj = { label: String(i), value: String(i) };
  //     yearArr.push(obj);
  //   }
  //   return yearArr;
  // };

  const getYearList = () => {
    axiosInstance
      .get("/VendorMaster/GetYears")
      .then((res) => {
        let data = res?.data?.message;
        const finalData = data.map((ele) => {
          return {
            value: ele.id,
            label: ele.name,
          };
        });
        setYearOptions(finalData);
      })
      .catch((err) => toast.error("No Data Found"));
  }

  const colorCodingData = [
    { color: "#90EE90", id: "8", labelKey: "Approved" },
    { color: "#FFC0CB", id: "7", labelKey: "Created	" },
    { color: "#E2680A", id: "15", labelKey: "Checked	" },
  ];
  const [supplier, setGetSupplier] = useState([]);
  const [supplierOrganizationType, setSupplierOrganizationType] = useState([]);
  const [country, setGetCountry] = useState([]);
  const [state, setGetState] = useState([]);
  const [stategstn, setGetstategstn] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState([]);
  const [supplierOrganizationTypesearch, setSupplierOrganizationTypesearch] =
    useState([]);
  const GetKeyData = (id) => {
    const requstBody = {
      searchType: "string",
      searchValue: "string",
      supplierCategory: String(id),
      organizationType: "string",
      status: "string",
      noOfRecord: "string",
    };
    axiosInstance
      .post("VendorMaster/SearchData", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setTableData(data);
      })
      .catch((err) => toast.error("No Data Found"));
  };
  const getSupplier = () => {
    axiosInstance
      .get("VendorMaster/GetSupplier")
      .then((res) => {
        const response = res?.data?.message;
        setGetSupplier(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const getSupplierOrganizationType = () => {
    axiosInstance
      .get("VendorMaster/GetSupplierOrganizationType")
      .then((res) => {
        const response = res?.data?.message;
        setSupplierOrganizationType(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const getCountry = () => {
    axiosInstance
      .get("VendorMaster/GetCountry")
      .then((res) => {
        const response = res?.data?.message;
        setGetCountry(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const getState = () => {
    axiosInstance
      .get("VendorMaster/GetState")
      .then((res) => {
        const response = res?.data?.message;
        setGetState(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const getstategstn = () => {
    axiosInstance
      .get("VendorMaster/GetState")
      .then((res) => {
        const response = res?.data?.message;
        setGetstategstn(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const getSupplierSearch = () => {
    axiosInstance
      .get("VendorMaster/GetSupplierSearch")
      .then((res) => {
        const response = res?.data?.message;
        setSupplierSearch(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const getSupplierOrganizationTypesearch = () => {
    axiosInstance
      .get("VendorMaster/GetSupplierOrganizationTypesearch")
      .then((res) => {
        const response = res?.data?.message;
        setSupplierOrganizationTypesearch(
          Array.isArray(response) ? response : []
        );
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const SaveData = () => {
    const generatedError = VendorMasterValidationSchema(payload);
    const requestBody = {
      vendormaster: {
        supplierName: String(payload?.SupplierName|| "" ) ,
        supplierCode: String(payload?.SupplierCode|| "" ) ,
        supplierType: String(payload?.SupplierType|| "" ) ,
        supplierCategory: String(payload?.SupplierCategory|| "" ) ,
        organizationType: String(payload?.OrganizationType|| "" ) ,
        houseNo: String(payload?.HouseOfficeNo|| "" ) ,
        street: String(payload?.Locality|| "" ) ,
        country: String(payload?.Country|| "" ) ,
        state: String(payload?.State|| "" ) ,
        pinCode: String(payload?.Pincode|| "" ) ,
        landline: String(payload?.Landline|| "" ) ,
        faxNo: String(payload?.FaxNo|| "" ) ,
        emailId: String(payload?.Email|| "" ) ,
        website: String(payload?.Website|| "" ) ,
        krapin: String(payload?.Krapin|| "" ) ,
        primaryContactPerson: String(payload?.PrimaryContactPerson|| "" ) ,
        primaryContactPersonDesignation:
          String(payload?.PrimaryDesignation|| "" ) ,
        primaryContactPersonMobileNo: String(payload?.PrimaryMobileNo|| "" ) ,
        primaryContactPersonEmailId: String(payload?.PrimaryEmail|| "" ) ,
        secondaryContactPerson: String(payload?.SecondaryContactPerson|| "" ) ,
        secondaryContactPersonDesignation:
          String(payload?.SecondaryDesignation|| "" ) ,
        secondaryContactPersonMobileNo:
          String(payload?.SecondaryMobileNo|| "" ) ,
        secondaryContactPersonEmailId: String(payload?.SecondaryEmail|| "" ) ,
        cinNo: String(payload?.TANNo|| "" ) ,
        pfRegistartionNo: String(payload?.PFRegistartionNo|| "" ) ,
        nameonPANCard: String(payload?.NameOnPANCard|| "" ) ,
        panCardNo: String(payload?.PANCardNo|| "" ) ,
        rocNo: String(payload?.ROCNo|| "" ) ,
        esiRegistrationNo: String(payload?.ESIRegistrationNo|| "" ) ,
        isoCertificationNo: String(payload?.ISOCertificationNo|| "" ) ,
        isoValidUpto: moment(payload?.ISOValidUpto, "YYYY-MM-DD HH:mm:ss").format(
          "YYYY-MM-DD"
        ) || "",
        pollutioncontrolBoardCertificationNo:
          String(payload?.PCBCertificationNo|| "" ) ,
        pollutionValidUpto: moment(payload?.PCBValidUpto, "YYYY-MM-DD HH:mm:ss").format(
          "YYYY-MM-DD"
        ) || "",
        bank1: String(payload?.Bank1|| "" ) ,
        bank1Branch: String(payload?.Bank1Branch|| "" ) ,
        bank1AccountsNo: String(payload?.Bank1AccountNo|| "" ) ,
        bank1IFSCCode: String(payload?.Bank1IFSCCode|| "" ) ,
        bank1Address1: String(payload?.Bank1Address|| "" ) ,
        bank1Address2: String(payload?.Bank2City|| "" ),
        bank1City: String(payload?.Bank1City|| "" ) ,
        bank1State: String(payload?.Bank1State|| "" ) ,
        bank2: String(payload?.Bank2|| "" ) ,
        bank2Branch: String(payload?.Bank2Branch|| "" ) ,
        bank2AccountsNo: String(payload?.Bank2AccountNo|| "" ) ,
        bank2IFSCCode: String(payload?.Bank2IFSCCode|| "" ) ,
        bank2Address1: String(payload?.Bank2Address|| "" ) ,
        bank2Address2: String(payload?.Bank2Address|| "" ) ,
        bank2City: String(payload?.Bank2City|| "" ) ,
        bank2State: String(payload?.Bank2State|| "" ) ,
        paymentTerms: String(payload?.PaymentTerms|| "" ) ,
        taxes: String(payload?.Taxes|| "" ) ,
        deliveryTerms: String(payload?.DeliveryTerms|| "" ) ,
        vendorToNotes: String(payload?.VendorToNotes|| "" ) ,
        creditLimit: String(payload?.CreditLimit|| "" ) ,
        isActive: String(payload?.IsActive|| "" ) ,
        isLoginRequired: String(payload?.IsLoginRequired|| "" ) || "0",
        loginUserName: String(payload?.UserName|| "" ) || "0",
        loginPassword: String(payload?.Password|| "" ) || "",
        isAutoRejectPO: String(payload?.AutoClosePO|| "" ) || "0",
        autoRejectPOAfterDays: String(payload?.ClosePOAfter|| "" ) || "0",
        isMSMERegistration: String(payload?.IsMSMERegistration|| "" ) || "",
        msmeRegistrationNo: String(payload?.MSMERegistration|| "" ) || "",
        msmeRegistrationValidDate: moment(payload?.MSMEValidUpto, "YYYY-MM-DD HH:mm:ss").format(
          "YYYY-MM-DD"
        ) || "",
        oracleVendorCode: "",
        oracleVendorSite: "",
        approvalStatus: 0,
        checkedDate: "2025-05-23T11:01:36.389Z",
        approvedDate: "2025-05-23T11:01:36.389Z",
        checkedBy: 0,
        approvedBy: 0,
        isOpenTextVendor: String(1),
        S_Currency: currencyOptions?.find(
          (item) => item.value === payload?.specifiedCurrency
        )?.label,
      },
      vendorfidetail: dataFinancialDetailsTable,
      vendorgstndetail: GSTDetailsTabel,
      Filename: PatientGuid,
    };
    if (generatedError !== "") {
      toast.error("Please Fill Required Fields");
      setErros(generatedError);
      setLoading(false);
      return;
    }
    if (GSTDetailsTabel?.length === 0) {
      toast.error(`Please add atleast one ${DefaultCurrencyName == "INR" ? "GST" : "Tax"} Detail`);
      return;
    }

    setLoading(true);

    axiosInstance
      .post("VendorMaster/SaveVendorMaster", requestBody)
      .then((res) => {
        setLoading(false);
        toast.success(res?.data?.message);
        setPayload(initialState);
        setErros({});
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message || "Something Went Wrong"
        );
      });
  };
  console.log("payload", payload)
  const UpdateData = () => {
    const generatedError = VendorMasterValidationSchema(payload);
    const requestBody = {
      vendormaster: {
        supplierID: String(payload?.vendorid || "") ,
        supplierName: String(payload?.SupplierName || "") ,
        supplierCode: String(payload?.SupplierCode || "") ,
        supplierType: String(payload?.SupplierType || "") ,
        supplierCategory: String(payload?.SupplierCategory || "") ,
        organizationType: String(payload?.OrganizationType || "") ,
        houseNo: String(payload?.HouseOfficeNo || "") ,
        street: String(payload?.Locality || "") ,
        country: String(payload?.Country || "") ,
        state: String(payload?.State || "") ,
        pinCode: String(payload?.Pincode || "") ,
        landline: String(payload?.Landline || "") ,
        faxNo: String(payload?.FaxNo || "") ,
        emailId: String(payload?.Email || "") ,
        website: String(payload?.Website || "") ,
        krapin: String(payload?.Krapin || "") ,
        primaryContactPerson: String(payload?.PrimaryContactPerson || "") ,
        primaryContactPersonDesignation:
          String(payload?.PrimaryDesignation || ""),
        primaryContactPersonMobileNo: String(payload?.PrimaryMobileNo || "") ,
        primaryContactPersonEmailId: String(payload?.PrimaryEmail || "") ,
        secondaryContactPerson: String(payload?.SecondaryContactPerson || "") ,
        secondaryContactPersonDesignation:
          String(payload?.SecondaryDesignation || ""),
        secondaryContactPersonMobileNo:
          String(payload?.SecondaryMobileNo || "") ,
        secondaryContactPersonEmailId: String(payload?.SecondaryEmail || "") ,
        cinNo: String(payload?.TANNo || "") ,
        pfRegistartionNo: String(payload?.PFRegistartionNo || "") ,
        nameonPANCard: String(payload?.NameOnPANCard || "") ,
        panCardNo: String(payload?.PANCardNo || "") ,
        rocNo: String(payload?.ROCNo || "") ,
        esiRegistrationNo: String(payload?.ESIRegistrationNo || "") ,
        isoCertificationNo: String(payload?.ISOCertificationNo || "") ,
        isoValidUpto: String(payload?.ISOValidUpto || "") ,
        pollutioncontrolBoardCertificationNo:
          String(payload?.PCBCertificationNo || ""),
        pollutionValidUpto: String(payload?.PCBValidUpto || ""),
        bank1: String(payload?.Bank1 || ""),
        bank1Branch: String(payload?.Bank1Branch || ""),
        bank1AccountsNo: String(payload?.Bank1AccountNo || ""),
        bank1IFSCCode: String(payload?.Bank1IFSCCode || ""),
        bank1Address1: String(payload?.Bank1Address || ""),
        bank1Address2: String(payload?.Bank2City),
        bank1City: String(payload?.Bank1City || ""),
        bank1State: String(payload?.Bank1State || ""),
        bank2: String(payload?.Bank2 || ""),
        bank2Branch: String(payload?.Bank2Branch || ""),
        bank2AccountsNo: String(payload?.Bank2AccountNo || ""),
        bank2IFSCCode: String(payload?.Bank2IFSCCode || ""),
        bank2Address1: String(payload?.Bank2Address || ""),
        bank2Address2: String(payload?.Bank2Address || ""),
        bank2City: String(payload?.Bank2City || ""),
        bank2State: String(payload?.Bank2State || ""),
        paymentTerms: String(payload?.PaymentTerms || ""),
        taxes: String(payload?.Taxes || ""),
        deliveryTerms: String(payload?.DeliveryTerms || ""),
        vendorToNotes: String(payload?.VendorToNotes || ""),
        creditLimit: String(payload?.CreditLimit || ""),
        isActive: String(payload?.IsActive || ""),
        isLoginRequired: String(payload?.IsLoginRequired || "0"),
        loginUserName: String(payload?.UserName || "0"),
        loginPassword: String(payload?.Password || ""),
        isAutoRejectPO: String(payload?.AutoClosePO || "0"),
        autoRejectPOAfterDays: String(payload?.ClosePOAfter || "0"),
        isMSMERegistration: String(payload?.IsMSMERegistration || ""),
        msmeRegistrationNo: "",
        msmeRegistrationValidDate: "",
        oracleVendorCode: "",
        oracleVendorSite: "",
        approvalStatus: 0,
        checkedDate: "2025-05-23T11:01:36.389Z",
        approvedDate: "2025-05-23T11:01:36.390Z",
        checkedBy: 0,
        approvedBy: 0,
        isOpenTextVendor: String(1),
        S_Currency: currencyOptions?.find(
          (item) => item.value === payload?.specifiedCurrency
        )?.label,

      },
      vendorfidetail: dataFinancialDetailsTable,
      vendorgstndetail: GSTDetailsTabel,
      Filename: PatientGuid,
    };
    if (generatedError !== "") {
      toast.error("Please Fill Required Fields");
      setErros(generatedError);
      setLoading(false);
      return;
    }
    setLoading(true);

    axiosInstance
      .post("VendorMaster/UpdateVendorMaster", requestBody)
      .then((res) => {
        setLoading(false);
        toast.success(res?.data?.message);
        handleReset();
        setErros({});
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message || "Something Went Wrong"
        );
      });
  };
  const handleReset = () => {
    setIsEditing(false);
    setPayload(initialState);
    setDataFinancialDetailsTable([]);
    setGSTDetailsTabel([]);
  };

  const [dataFinancialDetailsTable, setDataFinancialDetailsTable] = useState(
    []
  );

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const FinancialDetailsAdd = () => {
    const supplierName = payload?.SupplierName;
    const financialYear = String(payload?.year);
    const annualTurnover = payload?.AnnualTurnover;

    // if (!supplierName) {
    //   toast.error("Please Select Supplier Name");
    //   return;
    // }

    if (!financialYear) {
      toast.error("Please Select Financial Year");
      return;
    }

    if (!annualTurnover) {
      toast.error("Please Enter Annual Turnover");
      return;
    }
    setDataFinancialDetailsTable((prev) => [
      ...prev,
      {
        supplier: supplierName,
        financialyear: financialYear,
        annualTurnover: annualTurnover,
      },
    ]);

    setPayload((prev) => ({
      ...prev,
      year: null,
      AnnualTurnover: "",
    }));
  };
  const handleRemoveFinancialDetailsTabelRow = (indexToRemove) => {
    setDataFinancialDetailsTable((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const [GSTDetailsTabel, setGSTDetailsTabel] = useState([]);

  const GSTDetailsAdd = () => {
    const supplierName = payload?.SupplierName;
    const gstState = payload?.GSTState;
    const gstNo = payload?.GSTNO;
    const gstAddress = payload?.GSTAddress;

    // if (!supplierName) {
    //   toast.error("Please Select Supplier Name");
    //   return;
    // }

    if (!gstState) {
      toast.error("Please Select State");
      return;
    }

    if (!gstNo) {
      toast.error(`Please Enter ${DefaultCurrencyName == "INR" ? "GST" : "Tax"} Number`);
      return;
    }

    if (!gstAddress) {
      toast.error(`Please Enter ${DefaultCurrencyName == "INR" ? "GST" : "Tax"} Address`);
      return;
    }

    const isDuplicate = GSTDetailsTabel?.some(
      (item) =>
        item.gsT_No === gstNo &&
        item.stateID === String(gstState)
    );

    if (isDuplicate) {
      toast.error("GST Details Already Added For This State");
      return;
    }

    setGSTDetailsTabel((prev) => [
      ...prev,
      {
        supplier: String(supplierName),
        stateID: String(gstState),
        state: stategstn?.find((ele) => ele?.id === gstState)?.name,
        gsT_No: String(gstNo),
        address: String(gstAddress),
      },
    ]);

    setPayload((prev) => ({
      ...prev,
      GSTState: null,
      GSTNO: "",
      GSTAddress: "",
    }));
  };

  const handleRemoveGSTDetailsAddTabelRow = (indexToRemove) => {
    setGSTDetailsTabel((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };


  const GetDataFinancialDetailsAPI = (id) => {
    const requstBody = {
      vendorid: String(id),
    };
    axiosInstance
      .post("VendorMaster/BindFinData", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setDataFinancialDetailsTable(data);
      })
  };

  const GetDataGSTDetailsDetailsAPI = (id) => {
    const requstBody = {
      vendorid: String(id),
    };
    axiosInstance
      .post("VendorMaster/BindgstnData", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setGSTDetailsTabel(data);
      })
      .catch((err) => toast.error("No gstn data found"));
  };

  const tableDataEditRow = (val) => {
    setIsEditing(true);

    setPayload((prev) => ({
      ...prev,
      SupplierName: val?.SupplierName,
      SupplierCode: val?.SupplierCode,
      SupplierType: val?.SupplierType,
      IsActive: val?.IsActive,
      SupplierCategory: val?.SupplierCategory,
      OrganizationType: val?.OrganizationType,
      HouseOfficeNo: val?.HouseNo,
      Locality: val?.Street,
      Country: val?.Country,
      State: val?.State,
      Pincode: val?.PinCode,
      Landline: val?.Landline,
      FaxNo: val?.FaxNo,
      Email: val?.EmailId,
      Website: val?.Website,
      Krapin: val?.krapin,
      PrimaryContactPerson: val?.PrimaryContactPerson,
      PrimaryDesignation: val?.PrimaryContactPersonDesignation,
      PrimaryMobileNo: val?.PrimaryContactPersonMobileNo,
      PrimaryEmail: val?.PrimaryContactPersonEmailId,
      SecondaryContactPerson: val?.SecondaryContactPerson,
      SecondaryDesignation: val?.SecondaryContactPersonDesignation,
      SecondaryMobileNo: val?.SecondaryContactPersonMobileNo,
      SecondaryEmail: val?.SecondaryContactPersonEmailId,
      TANNo: val?.CINNo,
      PFRegistartionNo: val?.PFRegistartionNo,
      NameOnPANCard: val?.NameonPANCard,
      Bank1AccountNo: val?.Bank1AccountsNo,
      PANCardNo: val?.PANCardNo,
      ROCNo: val?.ROCNo,
      ESIRegistrationNo: val?.ESIRegistrationNo,
      ISOCertificationNo: val?.ISOCertificationNo,
      ISOValidUpto: new Date(val?.ISOValidUpto),
      PCBCertificationNo: val?.PollutioncontrolBoardCertificationNo,
      PCBValidUpto: new Date(val?.PollutionValidUpto),
      MSMERegistration: val?.MSMERegistrationNo,
      IsMSMERegistration: val?.IsMSMERegistration,
      MSMEValidUpto: new Date(val?.MSMERegistrationValidDate),
      Bank1: val?.Bank1,
      Bank1Branch: val?.Bank1Branch,
      Bank1IFSCCode: val?.Bank1IFSCCode,
      Bank1Address: val?.Bank1Address1,
      Bank1City: val?.Bank1City,
      Bank1State: val?.Bank1Address2,
      Bank2: val?.Bank2,
      Bank2Branch: val?.Bank2Branch,
      Bank2AccountNo: val?.Bank2AccountsNo,
      Bank2IFSCCode: val?.Bank2IFSCCode,
      Bank2Address: val?.Bank2Address1,
      Bank2City: val?.Bank2City,
      Bank2State: val?.Bank2Address2,
      AnnualTurnover: val?.AnnualTurnover,
      GSTState: val?.GSTState,
      GSTAddress: val?.GSTAddress,
      GSTNO: val?.GSTNO,
      PaymentTerms: val?.PaymentTerms,
      Taxes: val?.Taxes,
      DeliveryTerms: val?.DeliveryTerms,
      VendorToNotes: val?.VendorToNotes,
      CreditLimit: val?.CreditLimit,
      IsLoginRequired: val?.IsLoginRequired,
      UserName: val?.UserName,
      Password: val?.Password,
      ConfirmPassword: val?.ConfirmPassword,
      AutoClosePO: val?.AutoClosePO,
      ClosePOAfter: val?.ClosePOAfter,
      year: val?.year,
      vendorid: val?.SupplierID,
      specifiedCurrency: val?.S_Currency,
    }));
    GetDataFinancialDetailsAPI(val?.SupplierID);
    GetDataGSTDetailsDetailsAPI(val?.SupplierID);
    SetPatientGuid(
      val?.DocumentGuid && val?.DocumentGuid !== ""
        ? val?.DocumentGuid
        : PatientGuid,
    );
  };

  const [show2, setShow2] = useState(false);

  const handleClose2 = () => {
    setShow2(false);
  };
  const [LTData, setLTData] = useState("");
  const [Identity, setIdentity] = useState([]);
  const [PatientGuid, SetPatientGuid] = useState("");
  const [UploadDoumentType, setUploadDoumentType] = useState([""]);
  const [documentId, setDocumentID] = useState("");
  const handleUploadCount = (
    name,
    value,
    secondName,
    medicalName,
    medicalValue,
    MedicalSName
  ) => {
    setLTData({
      ...LTData,
      [name]: value,
      [secondName]: value === 0 ? 0 : 1,
      [medicalName]: medicalValue,
      [MedicalSName]: medicalValue === 0 ? 0 : 1,
    });
  };

  const getDocumentType = (data) => {
    setUploadDoumentType(data);
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
        return setIdentity(RequiredAttachment);
      })
      .catch((err) => console.log(err));
  };

  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  const guidNumber = () => {
    const guidNumber =
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4();
    return guidNumber;
  };
  const getCurrencies = async () => {
    try {
      const res = await axiosInstance.get("CurrencyMaster/GetVendorCurrencies");
      const data = res?.data?.message || [];
      const options = data.map((item) => ({
        value: item.id,
        label: item.currencyName,
        symbol: item.currencySymbol,
        isBaseCurrency: item.isBaseCurrency,
      }));
      setCurrencyOptions(options);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getSupplier();
    getSupplierOrganizationType();
    getCountry();
    getState();
    getstategstn();
    getSupplierSearch();
    getSupplierOrganizationTypesearch();
    getRequiredAttachment();
    const DocumentId = guidNumber();
    setDocumentID(DocumentId);
    const patientId = guidNumber();
    SetPatientGuid(patientId);
    getYearList();
    getCurrencies()
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
          const row = rawRows[i];
          const nonEmpty = row.filter((c) => c !== "" && c !== null && c !== undefined);
          if (nonEmpty.length >= 3) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = rawRows[headerRowIndex];
        let jsonData = rawRows
          .slice(headerRowIndex + 1)
          .filter((row) => row.some((c) => c !== "" && c !== null && c !== undefined))
          .map((row) => {
            const obj = {};
            headers.forEach((h, i) => {
              if (h !== "" && h !== null && h !== undefined) {
                const value = row[i] ?? "";
                obj[h] = typeof value === "number" ? Number(value.toFixed(2)) : value;
              }
            });
            return obj;
          });

        if (jsonData.length === 0) {
          toast.error("The uploaded file is empty.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        // Detect duplicates by SupplierCode (fallback SupplierName)
        const seen = new Map();
        const dupIndices = new Set();
        jsonData.forEach((row, i) => {
          const key = String(row.SupplierCode ?? row.supplierCode ?? row.SupplierName ?? row.supplierName ?? "").trim();
          if (key) {
            if (seen.has(key)) {
              dupIndices.add(seen.get(key));
              dupIndices.add(i);
            } else {
              seen.set(key, i);
            }
          }
        });
        setDuplicateRows([...dupIndices]);
        setTemplateData(jsonData);
        setShowImportDialog(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error(error);
        toast.error("Error reading file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImportSave = async () => {
    if (!TemplateData.length) return;
    setLoading(true);
    try {
      const vendors = TemplateData.map((row) => ({
        vendor: {
          supplierID:                          String(row.SupplierID                 ?? row.supplierID                 ?? ""),
          supplierName:                        String(row.SupplierName              ?? row.supplierName              ?? ""),
          supplierCode:                        String(row.SupplierCode              ?? row.supplierCode              ?? ""),
          supplierType:                        String(row.SupplierType              ?? row.supplierType              ?? ""),
          supplierCategory:                    String(row.SupplierCategory          ?? row.supplierCategory          ?? ""),
          organizationType:                    String(row.OrganizationType          ?? row.organizationType          ?? ""),
          houseNo:                             String(row.HouseOfficeNo             ?? row.houseNo                   ?? ""),
          street:                              String(row.Locality                  ?? row.street                    ?? ""),
          country:                             String(row.Country                   ?? row.country                   ?? ""),
          state:                               String(row.State                     ?? row.state                     ?? ""),
          pinCode:                             String(row.Pincode                   ?? row.pinCode                   ?? ""),
          landline:                            String(row.Landline                  ?? row.landline                  ?? ""),
          faxNo:                               String(row.FaxNo                      ?? row.faxNo                     ?? ""),
          emailId:                             String(row.Email                     ?? row.emailId                   ?? ""),
          website:                             String(row.Website                    ?? row.website                   ?? ""),
          krapin:                              String(row.Krapin                    ?? row.krapin                    ?? ""),
          primaryContactPerson:                String(row.PrimaryContactPerson      ?? row.primaryContactPerson      ?? ""),
          primaryContactPersonDesignation:     String(row.PrimaryDesignation        ?? row.primaryContactPersonDesignation ?? ""),
          primaryContactPersonMobileNo:        String(row.PrimaryMobileNo           ?? row.primaryContactPersonMobileNo ?? ""),
          primaryContactPersonEmailId:         String(row.PrimaryEmail              ?? row.primaryContactPersonEmailId ?? ""),
          secondaryContactPerson:              String(row.SecondaryContactPerson    ?? row.secondaryContactPerson     ?? ""),
          secondaryContactPersonDesignation:   String(row.SecondaryDesignation      ?? row.secondaryContactPersonDesignation ?? ""),
          secondaryContactPersonMobileNo:      String(row.SecondaryMobileNo         ?? row.secondaryContactPersonMobileNo ?? ""),
          secondaryContactPersonEmailId:       String(row.SecondaryEmail            ?? row.secondaryContactPersonEmailId ?? ""),
          cinNo:                               String(row.TANNo                     ?? row.cinNo                     ?? ""),
          pfRegistartionNo:                    String(row.PFRegistartionNo          ?? row.pfRegistartionNo          ?? ""),
          nameonPANCard:                       String(row.NameOnPANCard             ?? row.nameonPANCard             ?? ""),
          panCardNo:                           String(row.PANCardNo                 ?? row.panCardNo                 ?? ""),
          rocNo:                               String(row.ROCNo                      ?? row.rocNo                     ?? ""),
          esiRegistrationNo:                   String(row.ESIRegistrationNo         ?? row.esiRegistrationNo         ?? ""),
          isoCertificationNo:                  String(row.ISOCertificationNo        ?? row.isoCertificationNo        ?? ""),
          isoValidUpto:                        String(row.ISOValidUpto              ?? row.isoValidUpto              ?? ""),
          pollutioncontrolBoardCertificationNo: String(row.PCBCertificationNo        ?? row.pollutioncontrolBoardCertificationNo ?? ""),
          pollutionValidUpto:                  String(row.PCBValidUpto              ?? row.pollutionValidUpto        ?? ""),
          bank1:                               String(row.Bank1                      ?? row.bank1                     ?? ""),
          bank1Branch:                         String(row.Bank1Branch               ?? row.bank1Branch               ?? ""),
          bank1AccountsNo:                     String(row.Bank1AccountNo            ?? row.bank1AccountsNo           ?? ""),
          bank1IFSCCode:                       String(row.Bank1IFSCCode             ?? row.bank1IFSCCode             ?? ""),
          bank1Address1:                       String(row.Bank1Address              ?? row.bank1Address1             ?? ""),
          bank1Address2:                       String(row.Bank1Address2             ?? row.bank1Address2             ?? ""),
          bank1City:                           String(row.Bank1City                 ?? row.bank1City                 ?? ""),
          bank1State:                          String(row.Bank1State                ?? row.bank1State                ?? ""),
          bank2:                               String(row.Bank2                      ?? row.bank2                     ?? ""),
          bank2Branch:                         String(row.Bank2Branch               ?? row.bank2Branch               ?? ""),
          bank2AccountsNo:                     String(row.Bank2AccountNo            ?? row.bank2AccountsNo           ?? ""),
          bank2IFSCCode:                       String(row.Bank2IFSCCode             ?? row.bank2IFSCCode             ?? ""),
          bank2Address1:                       String(row.Bank2Address              ?? row.bank2Address1             ?? ""),
          bank2Address2:                       String(row.Bank2Address2             ?? row.bank2Address2             ?? ""),
          bank2City:                           String(row.Bank2City                 ?? row.bank2City                 ?? ""),
          bank2State:                          String(row.Bank2State                ?? row.bank2State                ?? ""),
          paymentTerms:                        String(row.PaymentTerms              ?? row.paymentTerms              ?? ""),
          taxes:                               String(row.Taxes                      ?? row.taxes                     ?? ""),
          deliveryTerms:                       String(row.DeliveryTerms             ?? row.deliveryTerms             ?? ""),
          vendorToNotes:                       String(row.VendorToNotes             ?? row.vendorToNotes             ?? ""),
          creditLimit:                         String(row.CreditLimit               ?? row.creditLimit               ?? ""),
          isActive:                            String(row.IsActive                   ?? row.isActive                  ?? ""),
          isLoginRequired:                     String(row.IsLoginRequired           ?? row.isLoginRequired           ?? "") || "0",
          loginUserName:                       String(row.UserName                   ?? row.loginUserName             ?? ""),
          loginPassword:                       String(row.Password                   ?? row.loginPassword             ?? ""),
          isAutoRejectPO:                      String(row.AutoClosePO               ?? row.isAutoRejectPO            ?? "") || "0",
          autoRejectPOAfterDays:               String(row.ClosePOAfter              ?? row.autoRejectPOAfterDays     ?? "") || "0",
          isMSMERegistration:                  String(row.IsMSMERegistration        ?? row.isMSMERegistration        ?? ""),
          msmeRegistrationNo:                  String(row.MSMERegistration          ?? row.msmeRegistrationNo        ?? ""),
          msmeRegistrationValidDate:           String(row.MSMEValidUpto             ?? row.msmeRegistrationValidDate ?? ""),
          oracleVendorCode:                    String(row.OracleVendorCode          ?? row.oracleVendorCode          ?? ""),
          oracleVendorSite:                    String(row.OracleVendorSite          ?? row.oracleVendorSite          ?? ""),
          approvalStatus: 0,
          checkedDate: new Date().toISOString(),
          approvedDate: new Date().toISOString(),
          checkedBy: 0,
          approvedBy: 0,
          isOpenTextVendor:                    String(1),
          address2:                            String(row.Address2                   ?? row.address2                  ?? ""),
          address3:                            String(row.Address3                   ?? row.address3                  ?? ""),
          s_Currency:                          String(row.specifiedCurrency         ?? row.s_Currency                ?? ""),
        },
        financialDetails: [
          {
            supplier:        String(row.SupplierName    ?? row.supplierName    ?? ""),
            financialYear:   String(row.Year            ?? row.year            ?? row.FinancialYear ?? ""),
            annualTurnover:  String(row.AnnualTurnover  ?? row.annualTurnover  ?? ""),
          },
        ],
        gstDetails: [
          {
            supplier:  String(row.SupplierName ?? row.supplierName ?? ""),
            stateID:   String(row.GSTStateID   ?? row.stateID      ?? ""),
            state:     String(row.GSTState     ?? row.gstState     ?? row.State ?? row.state ?? ""),
            gsT_No:    String(row.GSTNO        ?? row.gsT_No       ?? ""),
            address:   String(row.GSTAddress   ?? row.gstAddress   ?? ""),
          },
        ],
      }));

      const res = await axiosInstance.post(
        "VendorMaster/ImportVendorMaster",
        { vendors }
      );
      const { imported, failed, errors } = res.data?.data || {};
      const errorList = Array.isArray(errors) ? errors : [];

      if (errorList.length > 0) {
        setImportErrors(errorList);
        setImportSummary({ imported: imported ?? 0, failed: failed ?? 0 });
        toast.warning(res.data.message || `Imported: ${imported}, Failed: ${failed}`);
      } else {
        toast.success(res.data.message || "Data saved successfully");
        setShowImportDialog(false);
        setTemplateData([]);
        setImportErrors([]);
        setImportSummary(null);
      }
    } catch (err) {
      const errData = err?.response?.data;
      const { imported, failed, errors } = errData?.data || {};
      const errorList = Array.isArray(errors) ? errors : [];

      if (errorList.length > 0) {
        setImportErrors(errorList);
        setImportSummary({ imported: imported ?? 0, failed: failed ?? 0 });
        toast.warning(errData?.message || `Imported: ${imported ?? 0}, Failed: ${failed ?? 0}`);
      } else {
        toast.error(errData?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportVendorMaster = async () => {
    try {
      setExcelLoading(true);
      const res = await axiosReport.get("commonReports/ExportVendorMaster", {
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
      link.setAttribute("download", "VendorMaster_list.xlsx");
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
      setExcelLoading(false);
    }
  };

  return (
    <>
      {show2 && (
        <UploadFile
          // options={Identity}
          show={show2}
          handleClose={handleClose2}
          documentId={PatientGuid}
          pageName="VendorMaster"
        // handleUploadCount={handleUploadCount}
        // getDocumentType={getDocumentType}
        />
      )}
      <Accordion
        name={t("Supplier Detail")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="text"
              placeholder=" "
              lable="Supplier Name"
              id="SupplierName"
              name="SupplierName"
              className="required-fields"
              value={payload?.SupplierName}
              maxLength={50}
              onChange={handleChange}
              respclass={""}
            />
            {payload?.SupplierName === "" && (
              <span className="error-message">{errors?.SupplierName}</span>
            )}
          </div>

          <Input
            type="text"
            placeholder=" "
            lable="Supplier Code"
            id="SupplierCode"
            name="SupplierCode"
            value={payload?.SupplierCode}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            disabled={userData?.ST_AutoGenerateVendorCode == "1"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12 ">
            <div className="d-flex">

              <ReactSelect
                name="SupplierType"
                id="SupplierType"
                removeIsClearable={true}
                dynamicOptions={[
                  { label: "Capex", value: "Capex" },
                  { label: "Opex", value: "Opex" },
                  { label: "Both", value: "Both" },
                ]}
                placeholderName="Supplier Type"
                value={payload?.SupplierType}
                onChange={handleSelectChange}
                className="required-fields"
                respclass={"w-100"}
              />
            </div>
            {payload?.SupplierType === null && (
              <span className="error-message">{errors?.SupplierType}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              name="SupplierCategory"
              id="SupplierCategory"
              removeIsClearable={true}
              dynamicOptions={supplier?.map((ele) => ({
                label: ele?.name,
                value: ele?.id,
              }))}
              placeholderName="Supplier Category"
              value={payload?.SupplierCategory}
              onChange={handleSelectChange}
              className="required-fields"
              respclass={""}
            />
            {payload?.SupplierCategory === null && (
              <span className="error-message">{errors?.SupplierCategory}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              name="OrganizationType"
              id="OrganizationType"
              removeIsClearable={true}
              dynamicOptions={supplierOrganizationType?.map((ele) => ({
                label: ele?.name,
                value: ele?.id,
              }))}
              placeholderName="Organization Type"
              value={payload?.OrganizationType}
              onChange={handleSelectChange}
              className="required-fields"
              respclass={""}
            />
            {payload?.OrganizationType === null && (
              <span className="error-message">{errors?.OrganizationType}</span>
            )}
          </div>

          <Input
            type="text"
            placeholder=" "
            lable="House No/Office No"
            id="HouseOfficeNo"
            name="HouseOfficeNo"
            value={payload?.HouseOfficeNo}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Street/Building/Locality"
            id="Locality"
            name="Locality"
            value={payload?.Locality}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Country"
            id="Country"
            removeIsClearable={true}
            dynamicOptions={country?.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
            placeholderName="Country"
            value={payload?.Country}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="State"
            id="State"
            removeIsClearable={true}
            dynamicOptions={state?.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
            placeholderName="State"
            value={payload?.State}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="number"
            placeholder=" "
            max={6}
            lable="Pin Code"
            id="Pincode"
            name="Pincode"
            value={payload?.Pincode}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Landline"
            id="Landline"
            name="Landline"
            value={payload?.Landline}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="FaxNo"
            id="FaxNo"
            name="FaxNo"
            value={payload?.FaxNo}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Email"
            id="Email"
            name="Email"
            value={payload?.Email}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Website"
            id="Website"
            name="Website"
            value={payload?.Website}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="KRA Pin"
            id="Krapin"
            name="Krapin"
            value={payload?.Krapin}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            autoSelectFirst={true}
            dynamicOptions={currencyOptions.filter(
              (item) => item.value !== payload?.baseCurrency
            )}
            name="specifiedCurrency"
            placeholderName={"Specific Currency"}
            removeIsClearable={true}
            id="specifiedCurrency"
            label="Specified Currency"
            value={payload?.specifiedCurrency}
            className="required-fields"
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <label className="switch ml-1 mt-1">
            <input
              type="checkbox"
              checked={payload.IsActive == "1"}
              onChange={handleChange}
              name="IsActive"
            />
            <span className="slider"></span>
          </label>
          <strong className="ml-2 mb-2">{t("IsActive")}</strong>
        </div>
      </Accordion>
      <Accordion
        name={t("Concern Person Details")}
        defaultValue={false}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="text"
              placeholder=" "
              lable="Primary Contact Person"
              id="PrimaryContactPerson"
              name="PrimaryContactPerson"
              value={payload?.PrimaryContactPerson}
              onChange={handleChange}
              respclass={""}
              maxLength={50}
              className="required-fields"
            />
            {payload?.PrimaryContactPerson === "" && (
              <span className="error-message">
                {errors?.PrimaryContactPerson}
              </span>
            )}
          </div>

          <Input
            type="text"
            placeholder=" "
            lable="Primary Designation"
            id="PrimaryDesignation"
            name="PrimaryDesignation"
            value={payload?.PrimaryDesignation}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <Input
            type="number"
            placeholder=" "
            lable="Primary Mobile No"
            id="PrimaryMobileNo"
            name="PrimaryMobileNo"
            value={payload?.PrimaryMobileNo}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Primary Email Id"
            id="PrimaryEmail"
            name="PrimaryEmail"
            value={payload?.PrimaryEmail}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>

        <div className="row px-2 pt-2">

          <Input
            type="text"
            placeholder=" "
            lable="Secondary Contact Person"
            id="SecondaryContactPerson"
            name="SecondaryContactPerson"
            value={payload?.SecondaryContactPerson}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Secondary Designation"
            id="SecondaryDesignation"
            name="SecondaryDesignation"
            value={payload?.SecondaryDesignation}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="number"
            placeholder=" "
            lable="Secondary Mobile No"
            id="SecondaryMobileNo"
            name="SecondaryMobileNo"
            value={payload?.SecondaryMobileNo}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Secondary Email Id"
            id="SecondaryEmail"
            name="SecondaryEmail"
            value={payload?.SecondaryEmail}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
      </Accordion>
      <Accordion
        name={t("Statutory/MSME/PAN Registration Information")}
        defaultValue={false}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <Input
            type="text"
            placeholder=" "
            lable="TAN No"
            id="TANNo"
            name="TANNo"
            value={payload?.TANNo}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="PF Registartion No"
            id="PFRegistartionNo"
            name="PFRegistartionNo"
            value={payload?.PFRegistartionNo}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <Input
            type="text"
            placeholder=" "
            lable="Name On PAN Card"
            id="NameOnPANCard"
            name="NameOnPANCard"
            value={payload?.NameOnPANCard}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="PAN Card No"
            id="PANCardNo"
            name="PANCardNo"
            value={payload?.PANCardNo}
            onChange={handleChange}
            maxLength={10}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="ROC No"
            id="ROCNo"
            name="ROCNo"
            value={payload?.ROCNo}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="SESI Registration No"
            id="ESIRegistrationNo"
            name="ESIRegistrationNo"
            value={payload?.ESIRegistrationNo}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="ISO Certification No"
            id="ISOCertificationNo"
            name="ISOCertificationNo"
            value={payload?.ISOCertificationNo}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="ISOValidUpto"
            id="ISOValidUpto"
            value={payload?.ISOValidUpto}
            onChange={dateSelect}
            placeholder=""
            lable={t("Valid Upto")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Pollution control Board Certification No"
            id="PCBCertificationNo"
            name="PCBCertificationNo"
            value={payload?.PCBCertificationNo}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="PCBValidUpto"
            id="PCBValidUpto"
            value={payload?.PCBValidUpto}
            onChange={dateSelect}
            placeholder=""
            lable={t("Valid Upto")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12 d-flex">
            {/* <RadioInput
              inputType="checkbox"
              // label="Store Not Created"
              id="IsMSMERegistration"
              name="IsMSMERegistration"
              value={payload?.IsMSMERegistration}
              onChange={handleChange}
              respclass={""}
            /> */}
            <label className="switch mr-1 mt-1">
              <input
                type="checkbox"
                name="IsMSMERegistration"
                checked={payload?.IsMSMERegistration == "1"}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
            <Input
              type="text"
              placeholder=" "
              lable="MSME Registration"
              id="MSMERegistration"
              name="MSMERegistration"
              disabled={payload?.IsMSMERegistration != "1"}
              value={payload?.MSMERegistration}
              onChange={handleChange}
              maxLength={50}
              respclass={"w-100"}
            />
          </div>
          <DatePicker
            name="MSMEValidUpto"
            id="MSMEValidUpto"
            value={payload?.MSMEValidUpto}
            onChange={dateSelect}
            placeholder=""
            disabled={payload?.IsMSMERegistration != "1"}
            lable={t("Valid Upto")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
      </Accordion>
      <Accordion
        name={t("Bank Details")}
        defaultValue={false}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <Input
            type="text"
            placeholder=" "
            lable="Bank1"
            id="Bank1"
            name="Bank1"
            value={payload?.Bank1}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Branch"
            id="Bank1Branch"
            name="Bank1Branch"
            value={payload?.Bank1Branch}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12 d-flex">
            <Input
              type="number"
              placeholder=" "
              lable="Account No"
              id="Bank1AccountNo"
              name="Bank1AccountNo"
              value={payload?.Bank1AccountNo}
              onChange={handleChange}
              maxLength={50}
              respclass={"w-100"}
            />
            <Input
              type="text"
              placeholder=" "
              lable="	RTGS / IFSC Code"
              id="Bank1IFSCCode"
              name="Bank1IFSCCode"
              value={payload?.Bank1IFSCCode}
              onChange={handleChange}
              maxLength={11}
              respclass={"w-60 ml-1"}
            />
          </div>
          <Input
            type="text"
            placeholder=" "
            lable="Address"
            id="Bank1Address"
            name="Bank1Address"
            value={payload?.Bank1Address}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="City"
            id="Bank1City"
            name="Bank1City"
            value={payload?.Bank1City}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="State"
            id="Bank1State"
            name="Bank1State"
            value={payload?.Bank1State}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
        <div className="row px-2">
          <Input
            type="text"
            placeholder=" "
            lable="Bank 2"
            id="Bank2"
            name="Bank2"
            value={payload?.Bank2}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Branch"
            id="Bank2Branch"
            name="Bank2Branch"
            value={payload?.Bank2Branch}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12 d-flex">
            <Input
              type="number"
              placeholder=" "
              lable="Account No"
              id="Bank2AccountNo"
              name="Bank2AccountNo"
              value={payload?.Bank2AccountNo}
              onChange={handleChange}
              maxLength={50}
              respclass={"w-100"}
            />
            <Input
              type="text"
              placeholder=" "
              lable="	RTGS / IFSC Code"
              id="Bank2IFSCCode"
              name="Bank2IFSCCode"
              value={payload?.Bank2IFSCCode}
              onChange={handleChange}
              maxLength={11}
              respclass={"w-60 ml-1"}
            />
          </div>
          <Input
            type="text"
            placeholder=" "
            lable="Address"
            id="Bank2Address"
            name="Bank2Address"
            value={payload?.Bank2Address}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="City"
            id="Bank2City"
            name="Bank2City"
            maxLength={50}
            value={payload?.Bank2City}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="State"
            id="Bank2State"
            name="Bank2State"
            maxLength={50}
            value={payload?.Bank2State}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
      </Accordion>
      <Accordion
        name={t("Financial Details")}
        defaultValue={false}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <ReactSelect
            placeholderName={t("Year")}
            id="year"
            name="year"
            removeIsClearable={true}
            value={payload?.year}
            onChange={handleSelectChange}
            searchable={true}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            dynamicOptions={yearOptions}
          />
          <Input
            type="number"
            placeholder=" "
            lable="Annual Turnover in Lack"
            id="AnnualTurnover"
            name="AnnualTurnover"
            value={payload?.AnnualTurnover}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            {/* <button
              className="btn btn-sm btn-success"
              onClick={FinancialDetailsAdd}
            >
              Add
            </button> */}
            <CustomButton
              icon={"add"}
              text={"Add"}
              onClick={FinancialDetailsAdd}

            />
          </div>
          <div className="col-sm-7 mb-2">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr No.")}</th>
                  <th>{t("Financial Year")}</th>
                  <th>{t("Annual turnover in Lacs")}</th>
                  <th>{t("Remove")}</th>
                </tr>
              </thead>
              <tbody>
                {dataFinancialDetailsTable?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr No.">{index + 1}</td>
                    <td data-title="Financial Year">{row?.financialyear}</td>
                    <td data-title="Annual turnover in Lacs">
                      {row?.annualTurnover}
                    </td>
                    <td data-title="Remove">
                      <span
                        onClick={() =>
                          handleRemoveFinancialDetailsTabelRow(index)
                        }
                      >
                        ❌
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={(DefaultCurrencyName == "INR" ? "GST Details" : "Tax Details")}
        defaultValue={false}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <ReactSelect
            placeholderName={t("State")}
            id="GSTState"
            name="GSTState"
            removeIsClearable={true}
            value={payload?.GSTState}
            onChange={handleSelectChange}
            searchable={true}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            dynamicOptions={stategstn?.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
          />
          <Input
            type="text"
            placeholder=" "
            lable={(DefaultCurrencyName == "INR" ? "GST Address" : "Tax Address")}
            id="GSTAddress"
            name="GSTAddress"
            value={payload?.GSTAddress}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable={(DefaultCurrencyName == "INR" ? "GST No" : "Tax No")}
            id="GSTNO"
            name="GSTNO"
            maxLength={15}
            value={payload?.GSTNO}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-sm-1">
            <CustomButton
              icon={"add"}
              text={"Add"}
              onClick={GSTDetailsAdd}
            />
          </div>
          <div className="col-sm-5 mb-2">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr No.")}</th>
                  <th>{t("State")}</th>
                  <th>{t(DefaultCurrencyName == "INR" ? "GSTN No" : "Tax No")}</th>
                  <th>{t("Address")}</th>
                  <th>{t("Remove")}</th>
                </tr>
              </thead>
              <tbody>
                {GSTDetailsTabel?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr No.">{index + 1}</td>
                    <td data-title="State">{row?.state}</td>
                    <td data-title="GSTN No">{row?.gsT_No || row?.gst_no}</td>
                    <td data-title="Address">{row?.address}</td>
                    <td data-title="Remove">

                      <span
                        onClick={() => handleRemoveGSTDetailsAddTabelRow(index)}
                      >
                        ❌
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={t("Term & Conditions")}
        defaultValue={false}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <TextAreaInput
            name={"PaymentTerms"}
            id={"PaymentTerms"}
            lable={"Payment Terms"}
            value={payload?.PaymentTerms}
            rows={1}
            maxLength={200}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
          <TextAreaInput
            name={"Taxes"}
            id={"Taxes"}
            lable={"Taxes"}
            value={payload?.Taxes}
            rows={1}
            maxLength={200}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
          <TextAreaInput
            name={"DeliveryTerms"}
            id={"DeliveryTerms"}
            lable={"Delivery Terms"}
            value={payload?.DeliveryTerms}
            rows={1}
            maxLength={200}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
          <TextAreaInput
            name={"VendorToNotes"}
            id={"VendorToNotes"}
            lable={"Vendor To Notes"}
            value={payload?.VendorToNotes}
            rows={1}
            maxLength={200}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
          <TextAreaInput
            name={"CreditLimit"}
            id={"CreditLimit"}
            lable={"Credit Limit"}
            value={payload?.CreditLimit}
            rows={1}
            maxLength={200}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
        </div>
      </Accordion>
      {/* <Accordion
        name={t("Login and Auto PO Close Detail")}
        defaultValue={false}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <RadioInput
            inputType="checkbox"
            label="Is Login Required" 
            id="IsLoginRequired"
            name="IsLoginRequired"
            value={payload.IsLoginRequired == "1"}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="User Name"
            id="UserName"
            name="UserName"
            value={payload?.UserName}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="password"
            placeholder=" "
            lable="Password"
            id="Password"
            name="Password"
            value={payload?.Password}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Confirm Password"
            id="ConfirmPassword"
            name="ConfirmPassword"
            value={payload?.ConfirmPassword}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Close PO After (In Days)"
            id="ClosePOAfter"
            name="ClosePOAfter"
            value={payload?.ClosePOAfter}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <RadioInput
            inputType="checkbox"
            label="Auto Close PO"
            id="AutoClosePO"
            name="AutoClosePO"
            value={payload.AutoClosePO === "1"}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
      </Accordion> */}
      <Accordion
        name={t("Add Document")}
        defaultValue={false}
        isBreadcrumb={true}
      >
        <div className="row px-2 py-2">
          <div className="col-sm-1">
            {/* <button className="btn btn-sm btn-success" onClick={() => { setShow2(true); }}>Add Document</button> */}
            <CustomButton
              icon={"upload"}
              text={"Add Document"}
              onClick={() => { setShow2(true) }}
            />
          </div>
        </div>
      </Accordion>
      <div className="card my-2">
        <div className="row py-2">
          <div className="col-sm-12 d-flex justify-content-center" style={{ gap: "20px" }}>
            <div className="col-auto">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
              />
              <CustomButton
                text={"Import"}
                variant="success"
                icon="upload"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="ml-2"
              />
            </div>

            <CustomButton
              text={"Export"}
              icon="excel"
              onClick={handleExportVendorMaster}
              className="ml-2"
            />

            {isEditing ? (
              <CustomButton
                icon={"edit"}
                text={"Update"}
                onClick={UpdateData}
              />
            ) : (
              <SaveButton text="Save" onClick={SaveData} />
            )}

            <CustomButton
              icon={"refresh"}
              text={"Reset"}
              onClick={handleReset}
            />
          </div>
        </div>
      </div>
      <div className="card">
        <Heading
          name={t("Vendor Details")}
          defaultValue={true}
          isBreadcrumb={true}
          secondTitle={
            <>
              {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                //   onClick={() => handleCallViewMedReq(id)}
                />
              ))}
            </>
          }
        />
        <VendorMasterSearchTable
          supplierSearch={supplierSearch}
          supplierOrganizationTypesearch={supplierOrganizationTypesearch}
          tableData={tableData}
          tableDataEditRow={tableDataEditRow}
          parentsPayload={payload}
        />
      </div>

      {showImportDialog && (
        <Dialog
          visible={showImportDialog}
          className={theme}
          header={
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px" }}>Import Vendor Master</span>
              {duplicateRows.length > 0 && (
                <span style={{ fontSize: "12px", color: "#c0392b", background: "#fdecea", padding: "2px 10px", borderRadius: "4px", fontWeight: 500 }}>
                  {`${duplicateRows.length} duplicate row(s) — please remove before saving: `}
                  {[...new Set(duplicateRows.map((i) => {
                    const row = TemplateData[i];
                    return String(row?.SupplierCode ?? row?.supplierCode ?? row?.SupplierName ?? row?.supplierName ?? `Row ${i + 1}`);
                  }))].join(", ")}
                </span>
              )}
              {importSummary && (
                <>
                  <span style={{ fontSize: "12px", color: "#27ae60", background: "#eafaf1", padding: "2px 10px", borderRadius: "4px", fontWeight: 500 }}>
                    Imported: {importSummary.imported}
                  </span>
                  <span style={{ fontSize: "12px", color: "#c0392b", background: "#fdecea", padding: "2px 10px", borderRadius: "4px", fontWeight: 500 }}>
                    Failed: {importSummary.failed}
                  </span>
                </>
              )}
            </div>
          }
          onHide={() => { setShowImportDialog(false); setTemplateData([]); setDuplicateRows([]); setImportErrors([]); setImportSummary(null); }}
          style={{ width: "90vw" }}
        >
          <div className="card-body p-0">
            {TemplateData.length > 0 ? (
              <div className="row p-2">
                {(() => {
                  const errorByRow = Object.fromEntries(importErrors.map((e) => [e.rowNo, e]));
                  return (
                    <>
                      {importErrors.length > 0 && (
                        <div className="col-12 mb-2" style={{ maxHeight: "28vh", overflowY: "auto" }}>
                          <table className="table table-bordered table-sm mb-0" style={{ fontSize: "12px" }}>
                            <thead>
                              <tr style={{ background: "#c0392b", color: "#fff" }}>
                                <th style={{ color: "#fff", whiteSpace: "nowrap" }}>Row No</th>
                                <th style={{ color: "#fff", whiteSpace: "nowrap" }}>Vendor Name</th>
                                <th style={{ color: "#fff", whiteSpace: "nowrap" }}>Field</th>
                                <th style={{ color: "#fff", whiteSpace: "nowrap" }}>Field Value</th>
                                <th style={{ color: "#fff", whiteSpace: "nowrap" }}>Error Message</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importErrors.map((err, i) => (
                                <tr key={i} style={{ background: "#fdecea", color: "#c0392b" }}>
                                  <td>{err.rowNo}</td>
                                  <td>{err.vendorName}</td>
                                  <td>{err.fieldName}</td>
                                  <td>{err.fieldValue}</td>
                                  <td style={{ fontWeight: 600 }}>{err.message}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="col-12" style={{ maxHeight: "40vh", overflowY: "auto" }}>
                        <Tables>
                          <thead>
                            <tr>
                              {Object.keys(TemplateData[0]).map((key, index) => (
                                <th key={index}>{key}</th>
                              ))}
                              {importErrors.length > 0 && (
                                <th style={{ whiteSpace: "nowrap", color: "#c0392b" }}>Error</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {TemplateData.map((row, rowIndex) => {
                              const rowErr = errorByRow[rowIndex + 1];
                              const isDup = duplicateRows.includes(rowIndex);
                              const hasError = !!rowErr;
                              return (
                                <tr
                                  key={rowIndex}
                                  style={(isDup || hasError) ? { background: "#fdecea", color: "#c0392b" } : {}}
                                >
                                  {Object.keys(row).map((key, colIndex) => (
                                    <td key={colIndex}>{row[key]}</td>
                                  ))}
                                  {importErrors.length > 0 && (
                                    <td style={{ whiteSpace: "nowrap", fontWeight: hasError ? 600 : 400 }}>
                                      {hasError ? rowErr.message : ""}
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </Tables>
                      </div>
                    </>
                  );
                })()}
                <div className="col-12 mt-2 d-flex justify-content-end">
                  {loading ? (
                    <Loading />
                  ) : (
                    <SaveButton
                      text={t("Save Data")}
                      onClick={handleImportSave}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-3">No data found</div>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};

export default VendorMaster;
