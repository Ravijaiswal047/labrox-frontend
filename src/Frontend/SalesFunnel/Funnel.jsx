import { useEffect, useMemo, useRef, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";

import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import SpecializationModal from "./FunnelModal/SpecializationModal";
import TagDoctorModal from "./FunnelModal/TagDoctorModal";
import moment from "moment";
import Loading from "../../components/loader/Loading";
import "../Sales/TableOverflow.css";
import "./index.css";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { ExcelDownloadIcon, ExcelIconSVG } from "../../components/SvgIcons";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import * as XLSX from "xlsx";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const normalizeKey = (key) => String(key).toLowerCase().replace(/[^a-z0-9]/g, "");

const getApiErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.Message) return data.Message;
  if (data?.error) return data.error;
  if (data?.title) return data.title;
  if (data?.errors) {
    const firstError = Object.values(data.errors)?.[0];
    const firstMessage = Array.isArray(firstError) ? firstError[0] : firstError;
    if (firstMessage) return firstMessage;
  }
  if (error?.message) return error.message;
  return "Something went wrong while saving.";
};

const FUNNEL_FIELDS = [
  "funnelId", "type1Id", "type1", "centreId", "centreName", "businessProfessionId", "businessProfessionName",
  "businessOwnershipId", "businessOwnershipName", "prospectTypeId", "prospectTypeName", "organizationName",
  "landlineNo", "contactPersonName", "designation", "mobileNumber", "emailId", "website", "address", "locality",
  "localityId", "cityId", "cityname", "pincode", "stateId", "stateName", "countryId", "countryName",
  "proposedAssociationId", "proposedAssociationName", "interestLevelId", "interestLevelName", "noOfExpectedCalls",
  "expectedBusinessForecast", "expectedCategoryId", "expectedCategoryName", "doctorName", "specializationId",
  "specialization", "id", "expectedSubCategoryName", "leadType", "isPrimaryDoctor", "taggedDoctor", "isPrimaryHosp",
  "taggedHosp", "uinno", "doctorBday", "doctorAnni",
];

const FUNNEL_DETAIL_FIELDS = [
  "funnelDetailId", "opD_DoctorName", "opD_Specialization", "opD_ClinicName", "opD_OPDDays", "opD_Shift",
  "opD_StartTime", "opD_EndTime", "opD_AvgPatient", "opD_Fees", "meetingStartTime", "meetingEndTime", "meetingDays",
  "laB_NoOfprocessingLabs", "laB_SampleCollectionCenters", "laB_AvgNoOfPatient", "laB_AvgNoOfTest", "laB_IsOutsource",
  "laB_AvgNoOfOutsourceSample", "laB_PreferredOutsourceTests", "laB_CurrentlyOutsourcingTo", "laB_AvgOutsourceBusinessPerMon",
  "hosP_Specialization", "hosP_Built", "hosP_NoOfBed", "hosP_NoOfDoctorsInOPD", "hosP_AvgOPDPerDay", "hosP_AvgIPDPerDay",
  "hosP_Lab", "hosP_Outsource", "hosP_OutsourcingTo", "hosP_AvgOutsourceBusinessPerMon", "phaR_CurrentlyAssociatedWithAnyLab",
  "phaR_AvgNumberOfSampleCollected", "phaR_NearByApartment", "phaR_LabName", "phaR_AvgExistingBusiness",
  "phaR_AvgPopulationNearby", "phaR_WeeklyOff", "phaR_NoOfDrClinicNearby", "phaR_NoOfOtherPharmacyNearby",
  "otH_Others", "otH_PreferredStartTime", "otH_PreferredEndTime", "otH_PreferredDays",
];

const FUNNEL_FIELD_SET = new Set(FUNNEL_FIELDS.map(normalizeKey));
const FUNNEL_DETAIL_FIELD_SET = new Set(FUNNEL_DETAIL_FIELDS.map(normalizeKey));

// Fields that are numbers in the BulkImport payload schema; everything else is a string.
const FUNNEL_NUMBER_FIELDS = new Set([
  "funnelId", "type1Id", "centreId", "businessProfessionId", "businessOwnershipId", "prospectTypeId",
  "cityId", "stateId", "countryId", "proposedAssociationId", "interestLevelId", "noOfExpectedCalls",
  "expectedCategoryId", "isPrimaryDoctor", "taggedDoctor", "isPrimaryHosp", "taggedHosp",
]);
const FUNNEL_DETAIL_NUMBER_FIELDS = new Set(["funnelDetailId", "funnelId"]);

const buildNormalizedValueMap = (row) => {
  const map = {};
  Object.keys(row).forEach((col) => {
    map[normalizeKey(col)] = row[col];
  });
  return map;
};

const mapRowToFunnelPayload = (row) => {
  const valueMap = buildNormalizedValueMap(row);
  const obj = {};
  FUNNEL_FIELDS.forEach((field) => {
    const raw = valueMap[normalizeKey(field)];
    obj[field] = FUNNEL_NUMBER_FIELDS.has(field)
      ? Number(raw) || 0
      : String(raw ?? "");
  });
  return obj;
};

const mapRowToFunnelDetailPayload = (row) => {
  const valueMap = buildNormalizedValueMap(row);
  const obj = { funnelId: Number(valueMap[normalizeKey("funnelId")]) || 0 };
  FUNNEL_DETAIL_FIELDS.forEach((field) => {
    const raw = valueMap[normalizeKey(field)];
    obj[field] = FUNNEL_DETAIL_NUMBER_FIELDS.has(field)
      ? Number(raw) || 0
      : String(raw ?? "");
  });
  return obj;
};

const Funnel = () => {
   const fileInputRef  = useRef(null);
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = location;
  const Data = state?.data;
  const navigate = useNavigate();

  const [tagMode, setTagMode] = useState(null);
  const [load, setLoad] = useState(false);
  const [editData, setEditData] = useState([]);
  const [BindPincode, setBindPincode] = useState("");
  const [Countries, setCountries] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedExcelData, setImportedExcelData] = useState([]);
  const [bulkImportSaving, setBulkImportSaving] = useState(false);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const initialPayload = {
    Funnel: [
      {
        FunnelId: "",
        Type1Id: "",
        Type1: "",
        CentreId: "",
        CentreName: "",
        BusinessProfessionId: "",
        BusinessProfessionName: "",

        BusinessOwnershipId: "",
        BusinessOwnershipName: "",

        ProspectTypeId: "",
        ProspectTypeName: "",
        OrganizationName: "",
        LandlineNo: "",
        ContactPersonName: "",
        Designation: "",
        MobileNumber: "",
        EmailId: "",
        Website: "",
        Address: "",

        Locality: "",
        LocalityId: "",

        CityId: "",
        Cityname: "",
        Pincode: "",

        StateId: "",
        StateName: "",

        CountryId: "",
        CountryName: "",

        ProposedAssociationId: "",
        ProposedAssociationName: "",

        InterestLevelId: "",
        InterestLevelName: "",

        NoOfExpectedCalls: "",
        ExpectedBusinessForecast: "",

        ExpectedCategoryId: "",
        ExpectedCategoryName: "",

        DoctorName: "",
        SpecializationId: "",
        Specialization: "",

        Id: "",
        ExpectedSubCategoryName: "",
        LeadType: "",

        IsPrimaryDoctor: "",
        TaggedDoctor: "",

        IsPrimaryHosp: "",
        TaggedHosp: "",

        UINNO: "",
        DoctorBday: new Date(),
        DoctorAnni: new Date(),
      },
    ],

    FunnelDetail: [
      {
        FunnelDetailId: "",
        FunnelId: "",
        OPD_DoctorName: "",
        OPD_Specialization: "",
        OPD_ClinicName: "",
        OPD_OPDDays: "",
        OPD_Shift: "",
        OPD_StartTime: "",
        OPD_EndTime: "",
        OPD_AvgPatient: "",
        OPD_Fees: "",

        MeetingStartTime: "",
        MeetingEndTime: "",
        MeetingDays: "",

        LAB_NoOfprocessingLabs: "",
        LAB_SampleCollectionCenters: "",
        LAB_AvgNoOfPatient: "",
        LAB_AvgNoOfTest: "",
        LAB_IsOutsource: "",
        LAB_AvgNoOfOutsourceSample: "",
        LAB_PreferredOutsourceTests: "",
        LAB_CurrentlyOutsourcingTo: "",
        LAB_AvgOutsourceBusinessPerMon: "",

        HOSP_Specialization: "",
        HOSP_Built: "",
        HOSP_NoOfBed: "",
        HOSP_NoOfDoctorsInOPD: "",
        HOSP_AvgOPDPerDay: "",
        HOSP_AvgIPDPerDay: "",
        HOSP_Lab: "",
        HOSP_Outsource: "",
        HOSP_OutsourcingTo: "",
        HOSP_AvgOutsourceBusinessPerMon: "",

        PHAR_CurrentlyAssociatedWithAnyLab: "",
        PHAR_AvgNumberOfSampleCollected: "",
        PHAR_NearByApartment: "",
        PHAR_LabName: "",
        PHAR_AvgExistingBusiness: "",
        PHAR_AvgPopulationNearby: "",
        PHAR_WeeklyOff: "",
        PHAR_NoOfDrClinicNearby: "",
        PHAR_NoOfOtherPharmacyNearby: "",

        OTH_Others: "",
        OTH_PreferredStartTime: "",
        OTH_PreferredEndTime: "",
        OTH_PreferredDays: "",
      },
    ],

    SaveLatLong: "1",
    Latitude: "",
    Longitude: "",
    CallFor: "",
    CreatedFor: "",
    CreatedForName: "",
  };

  const [FormData, setFormData] = useState(initialPayload);
  console.log(FormData.FunnelDetail);

  const [errors, setErros] = useState({});
  console.log({ errors });

  const [CentreData, setCentreData] = useState([]);
  const [TaggedWith, setTaggedWith] = useState([]);
  const [BusinessProfession, setBusinessProfession] = useState([]);
  const [BusinessOwnership, setBusinessOwnership] = useState([]);
  const [ProspectType, setProspectType] = useState([]);
  const [Cities, setCities] = useState([]);
  const [States, setStates] = useState([]);
  const [Specialization, setSpecialization] = useState([]);
  const [ProposedAssociation, setProposedAssociation] = useState([]);
  const [InterestLevel, setInterestLevel] = useState([]);
  const [OpdDays, setOpdDays] = useState([]);
  const [ExpectedCalls, setExpectedCalls] = useState([]);
  const [SubExpectedCalls, setSubExpectedCalls] = useState([]);
  const [BindFor, setBindFor] = useState([]);

  const [isDoctorTagged, setIsDoctorTagged] = useState(false);
  const [isHospitalTagged, setIsHospitalTagged] = useState(false);

  const [Locality, setLocality] = useState([]);

  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  const [detailsExcelLoading, setDetailsExcelLoading] = useState(false);

  const timeOptions = [
    { label: "06:00 AM", value: "06:00 AM" },
    { label: "06:30 AM", value: "06:30 AM" },
    { label: "07:00 AM", value: "07:00 AM" },
    { label: "07:30 AM", value: "07:30 AM" },
    { label: "08:00 AM", value: "08:00 AM" },
    { label: "08:30 AM", value: "08:30 AM" },
    { label: "09:00 AM", value: "09:00 AM" },
    { label: "09:30 AM", value: "09:30 AM" },
    { label: "10:00 AM", value: "10:00 AM" },
    { label: "10:30 AM", value: "10:30 AM" },
    { label: "11:00 AM", value: "11:00 AM" },
    { label: "11:30 AM", value: "11:30 AM" },
    { label: "12:00 PM", value: "12:00 PM" },
    { label: "12:30 PM", value: "12:30 PM" },
    { label: "01:00 PM", value: "01:00 PM" },
    { label: "01:30 PM", value: "01:30 PM" },
    { label: "02:00 PM", value: "02:00 PM" },
    { label: "02:30 PM", value: "02:30 PM" },
    { label: "03:00 PM", value: "03:00 PM" },
    { label: "03:30 PM", value: "03:30 PM" },
    { label: "04:00 PM", value: "04:00 PM" },
    { label: "04:30 PM", value: "04:30 PM" },
    { label: "05:00 PM", value: "05:00 PM" },
    { label: "05:30 PM", value: "05:30 PM" },
    { label: "06:00 PM", value: "06:00 PM" },
    { label: "06:30 PM", value: "06:30 PM" },
    { label: "07:00 PM", value: "07:00 PM" },
    { label: "07:30 PM", value: "07:30 PM" },
    { label: "08:00 PM", value: "08:00 PM" },
    { label: "08:30 PM", value: "08:30 PM" },
    { label: "09:00 PM", value: "09:00 PM" },
    { label: "09:30 PM", value: "09:30 PM" },
    { label: "10:00 PM", value: "10:00 PM" },
    { label: "10:30 PM", value: "10:30 PM" },
    { label: "11:00 PM", value: "11:00 PM" },
    { label: "11:30 PM", value: "11:30 PM" },
    { label: "12:00 AM", value: "12:00 AM" },
  ];

  // for disabling past time in time dropdown
  const convertToMinutes = (time) => {
    if (!time) return 0;

    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  //

  const dayOptions = [
    { label: "Mon", value: "Mon" },
    { label: "Tue", value: "Tue" },
    { label: "Wed", value: "Wed" },
    { label: "Thu", value: "Thu" },
    { label: "Fri", value: "Fri" },
    { label: "Sat", value: "Sat" },
    { label: "Sun", value: "Sun" },
  ];

  const leadTypeOptions = [
    { label: "Lead", value: "1" },
    { label: "Other", value: "2" },
  ];

  const expectedCallOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
  ];

  const handleSelectChange = (name, option) => {
    setFormData((prev) => {
      const updated = { ...prev.Funnel[0] };

      if (name === "Type1") {
        updated.Type1Id = option?.value || "";
        updated.Type1 = option?.label || "";
      }

      if (name === "CentreName") {
        updated.CentreId = option?.value || "";
        updated.CentreName = option?.label || "";
      }

      if (name === "BusinessProfessionName") {
        updated.BusinessProfessionId = option?.value || "";
        updated.BusinessProfessionName = option?.label || "";
      }
      if (name === "BusinessOwnershipName") {
        updated.BusinessOwnershipId = option?.value || "";
        updated.BusinessOwnershipName = option?.label || "";
      }
      if (name === "ProspectTypeName") {
        updated.ProspectTypeId = option?.value || "";
        updated.ProspectTypeName = option?.label || "";

        // validation while selecting
        setErros((prev) => {
          const newErrors = { ...prev };

          // remove old error
          delete newErrors.ProspectTypeName;
          delete newErrors.DoctorName;

          // Prospect Type required
          if (!option?.value) {
            newErrors.ProspectTypeName = "This field is required";
          }

          // Doctor validation
          if (option?.value !== 2 && !FormData?.Funnel?.[0]?.DoctorName) {
            newErrors.DoctorName = "Doctor is required";
          }

          return newErrors;
        });
      }
      if (name === "CountryName") {
        updated.CountryId = option?.value ?? "";
        updated.CountryName = option?.label ?? "";

        updated.StateId = "";
        updated.StateName = "";
        updated.CityId = "";
        updated.Cityname = "";
        updated.LocalityId = "";
        updated.Locality = "";
        updated.Pincode = "";
        setBindPincode("");
      }

      if (name === "StateName") {
        updated.StateId = option?.value ?? "";
        updated.StateName = option?.label ?? "";

        updated.CityId = "";
        updated.Cityname = "";
        updated.LocalityId = "";
        updated.Locality = "";
        updated.Pincode = "";
        setBindPincode("");
      }

      if (name === "Cityname") {
        updated.CityId = option?.value ?? "";
        updated.Cityname = option?.label ?? "";

        updated.LocalityId = "";
        updated.Locality = "";
        updated.Pincode = "";
        setBindPincode("");
      }
      if (name === "Locality") {
        updated.LocalityId = option?.value ?? "";
        updated.Locality = option?.label ?? "";
        updated.Pincode = "";
        setBindPincode("");

        if (option?.value) {
          getBindPincode(option.value);
        }
      }
      if (name === "Specialization") {
        updated.SpecializationId = option?.value || "";
        updated.Specialization = option?.label || "";
      }
      if (name === "ProposedAssociationName") {
        updated.ProposedAssociationId = option?.value || "";
        updated.ProposedAssociationName = option?.label || "";
      }
      if (name === "InterestLevelName") {
        updated.InterestLevelId = option?.value || "";
        updated.InterestLevelName = option?.label || "";
      }
      if (name === "ExpectedCategoryName") {
        updated.ExpectedCategoryId = option?.value || "";
        updated.ExpectedCategoryName = option?.label || "";
      }
      if (name === "NoOfExpectedCalls") {
        updated.NoOfExpectedCalls = option?.value || "";
      }
      if (name === "ExpectedSubCategoryName") {
        updated.ExpectedSubCategoryName = option?.value || "";
      }
      if (name === "LeadType") {
        updated.LeadType = option?.value || "";
      }

      // add more if needed

      return {
        ...prev,
        Funnel: [updated],
      };
    });
  };

  const handleRemoveDoctor = () => {
    setFormData((prev) => {
      const updated = { ...prev.Funnel[0] };

      updated.DoctorName = "";
      updated.TaggedDoctor = 0;

      return {
        ...prev,
        Funnel: [updated],
      };
    });

    setIsDoctorTagged(false);
  };

  const handleDoctorSelect = (doctor) => {
    setFormData((prev) => {
      const updated = { ...prev.Funnel[0] };

      updated.DoctorName = doctor.DoctorName || "";
      updated.TaggedDoctor = doctor.FunnelId || 0;

      return {
        ...prev,
        Funnel: [updated],
      };
    });

    setIsDoctorTagged(true);
    setShow2(false);
  };

  const handleRemoveHospital = () => {
    setFormData((prev) => {
      const professionId = prev?.Funnel?.[0]?.BusinessProfessionId;

      const shouldSyncClinicName =
        professionId === "" || professionId == 1 || professionId == 2;

      const updatedFunnel = {
        ...prev.Funnel[0],
        OrganizationName: "",
        ContactPersonName: "",
        TaggedHosp: 0,
      };

      const updatedFunnelDetail = shouldSyncClinicName
        ? prev.FunnelDetail.map((row) => ({
          ...row,
          OPD_ClinicName: "",
        }))
        : prev.FunnelDetail;

      return {
        ...prev,
        Funnel: [updatedFunnel],
        FunnelDetail: updatedFunnelDetail,
      };
    });

    setIsHospitalTagged(false);
  };

  const handleHospitalSelect = (hospital) => {
    setFormData((prev) => {
      const professionId = prev?.Funnel?.[0]?.BusinessProfessionId;

      const shouldSyncClinicName =
        professionId === "" || professionId == 1 || professionId == 2;

      const updatedFunnel = {
        ...prev.Funnel[0],
        OrganizationName: hospital.OrganizationName || "",
        ContactPersonName: hospital.OrganizationName || "",
        TaggedHosp: hospital.FunnelId || 0,
      };

      const updatedFunnelDetail = shouldSyncClinicName
        ? prev.FunnelDetail.map((row) => ({
          ...row,
          OPD_ClinicName: hospital.OrganizationName || "",
        }))
        : prev.FunnelDetail;

      return {
        ...prev,
        Funnel: [updatedFunnel],
        FunnelDetail: updatedFunnelDetail,
      };
    });

    setIsHospitalTagged(true);
    setShow2(false);
  };

  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...FormData,
      [name]: value,
    });
  };

  const handleSelectChange2 = (name, option) => {
    setFormData((prev) => ({
      ...prev,
      CreatedFor: option?.value || "",
      CreatedForName: option?.label || "",
    }));
  };

  const dateSelect = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      Funnel: [
        {
          ...prev.Funnel[0],
          [name]: value,
        },
      ],
    }));
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     Funnel: [
  //       {
  //         ...prev.Funnel[0],
  //         [name]: value,
  //         ...(name === "OrganizationName" && {
  //           ContactPersonName: value,
  //         }),
  //       },
  //     ],
  //   }));
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const professionId = prev?.Funnel?.[0]?.BusinessProfessionId;

      const shouldSyncClinicName =
        professionId === "" || professionId == 1 || professionId == 2;

      const updatedFunnel = {
        ...prev.Funnel[0],
        [name]: value,
        ...(name === "OrganizationName" && {
          ContactPersonName: value,
        }),
      };

      const updatedFunnelDetail =
        name === "OrganizationName" && shouldSyncClinicName
          ? prev.FunnelDetail.map((row) => ({
            ...row,
            OPD_ClinicName: value,
          }))
          : prev.FunnelDetail;

      return {
        ...prev,
        Funnel: [updatedFunnel],
        FunnelDetail: updatedFunnelDetail,
      };
    });
  };

  const getCentreType1 = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("SalesFunnel/CentreType1");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.type,
          value: item?.Id,
        })) || [];
      setTaggedWith(resList || []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getBusinessProfession = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("SalesFunnel/BusinessProfession");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.BusinessProfessionName,
          value: item?.BusinessProfessionId,
        })) || [];
      setBusinessProfession(resList || []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };
  const getBusinessOwnership = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("SalesFunnel/BusinessOwnership");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.BusinessOwnershipName,
          value: item?.BusinessOwnershipId,
        })) || [];
      setBusinessOwnership(resList || []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getProspectType = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("SalesFunnel/ProspectType");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.ProspectTypeName,
          value: item?.ProspectTypeId,
        })) || [];
      setProspectType(resList || []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getSpecializationType = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.post("SalesFunnel/BindSpecialization");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.Specialization,
          value: item?.SpecializationId,
        })) || [];
      setSpecialization(resList);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getBindPincode = async (Id) => {
    try {
      setLoad(true);
      const res = await axiosInstance.post("SalesFunnel/BindPincode", {
        LocalityID: Id,
      });
      setBindPincode(res?.data?.message);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getCityDropDown = (value) => {
    axiosInstance
      .post("SalesFunnel/BindCity", {
        StateId: value,
      })
      .then((res) => {
        const data = res?.data?.message;
        const cities = data?.map((ele) => {
          return {
            value: ele?.Id,
            label: ele?.City,
          };
        });
        setCities(cities);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  console.log({ Cities });
  const getLocationDropDown = (value) => {
    axiosInstance
      .post("SalesFunnel/BindLocality", {
        CityId: value,
      })
      .then((res) => {
        const data = res?.data?.message;
        const cities = data?.map((ele) => {
          return {
            value: ele?.Id,
            label: ele?.Name,
          };
        });
        setLocality(cities);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  //   const getStateDropDown = () => {
  //   axiosInstance
  //     .get("SalesFunnel/States")
  //     .then((res) => {
  //       const data = res?.data?.message;
  //       const States = data?.map((ele) => {
  //         return {
  //           value: ele?.Id,
  //           label: ele?.State,
  //         };
  //       });
  //       setStates(States);
  //     })
  //     .catch((err) => {
  //       toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
  //     });
  // };
  const getProposedAssociationDropDown = () => {
    axiosInstance
      .get("SalesFunnel/ProposedAssociation")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.ProposedAssociationId,
            label: ele?.ProposedAssociationName,
          };
        });
        setProposedAssociation(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getInterestLevelDropDown = () => {
    axiosInstance
      .get("SalesFunnel/InterestLevel")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.InterestLevelId,
            label: ele?.InterestLevelName,
          };
        });
        setInterestLevel(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getOpdDaysDropDown = () => {
    axiosInstance
      .get("SalesFunnel/Shift")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.ShiftId,
            label: ele?.ShiftName,
          };
        });
        setOpdDays(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getExpectedCategoryDropDown = () => {
    axiosInstance
      .get("SalesFunnel/ExpectedCategory")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.ExpectedCategoryId,
            label: ele?.ExpectedCategoryName,
          };
        });
        setExpectedCalls(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getExpectedSubCategoryDropDown = () => {
    axiosInstance
      .get("SalesFunnel/ExpectedSubCategory")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.Id,
            label: ele?.ExpectedSubCategoryName,
          };
        });
        setSubExpectedCalls(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getBindCreatedForDropDown = () => {
    axiosInstance
      .get("SalesFunnel/BindCreatedFor")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.CreatedFor,
            label: ele?.CreatedForName,
          };
        });
        setBindFor(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      FunnelDetail: [
        ...prev.FunnelDetail,
        {
          FunnelDetailId: "",
          FunnelId: "",
          OPD_DoctorName: "",
          OPD_Specialization: "",
          // OPD_ClinicName: "",
          OPD_ClinicName: prev.Funnel?.[0]?.OrganizationName || "",
          OPD_OPDDays: "",
          OPD_Shift: "",
          OPD_StartTime: "",
          OPD_EndTime: "",
          OPD_AvgPatient: "",
          OPD_Fees: "",
          MeetingStartTime: "",
          MeetingEndTime: "",
          MeetingDays: "",
        },
      ],
    }));
  };

  const deleteRow = (index) => {
    if (FormData.FunnelDetail.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      FunnelDetail: prev.FunnelDetail.filter((_, i) => i !== index),
    }));
  };

  const handleChangeRow = (index, e) => {
    const { name, value } = e.target;

    const updated = [...FormData.FunnelDetail];
    updated[index][name] = value;

    setFormData({ ...FormData, FunnelDetail: updated });
  };

  // const handleSelectChangeRow = (index, name, selectedOption) => {
  //   const updated = [...FormData.FunnelDetail];

  //   updated[index] = {
  //     ...updated[index],
  //     [name]: selectedOption?.value || "",
  //     ...(name === "OPD_StartTime" && {
  //       MeetingStartTime: selectedOption?.value || "",
  //     }),
  //     ...(name === "OPD_EndTime" && {
  //       MeetingEndTime: selectedOption?.value || "",
  //     }),
  //   };

  //   setFormData((prev) => ({
  //     ...prev,
  //     FunnelDetail: updated,
  //   }));
  // };

  //

  const handleSelectChangeRow = (index, name, selectedOption) => {
    const value = selectedOption?.value || "";

    const updated = [...FormData.FunnelDetail];
    const row = { ...updated[index], [name]: value };

    if (name === "OPD_StartTime") {
      row.MeetingStartTime = value;

      if (
        row.OPD_EndTime &&
        convertToMinutes(row.OPD_EndTime) <= convertToMinutes(value)
      ) {
        row.OPD_EndTime = "";
      }

      if (
        row.MeetingEndTime &&
        convertToMinutes(row.MeetingEndTime) <= convertToMinutes(value)
      ) {
        row.MeetingEndTime = "";
      }
    }

    if (name === "OPD_EndTime") {
      if (
        row.OPD_StartTime &&
        convertToMinutes(value) <= convertToMinutes(row.OPD_StartTime)
      ) {
        row.OPD_EndTime = "";
      } else {
        row.MeetingEndTime = value;
      }
    }

    if (name === "MeetingStartTime") {
      if (
        row.MeetingEndTime &&
        convertToMinutes(row.MeetingEndTime) <= convertToMinutes(value)
      ) {
        row.MeetingEndTime = "";
      }
    }

    if (name === "OTH_PreferredStartTime") {
      if (
        row.OTH_PreferredEndTime &&
        convertToMinutes(row.OTH_PreferredEndTime) <=
        convertToMinutes(value)
      ) {
        row.OTH_PreferredEndTime = "";
      }
    }

    updated[index] = row;

    setFormData((prev) => ({
      ...prev,
      FunnelDetail: updated,
    }));
  };


  const handleSelectMultiChange = (index, selectedOptions, name) => {
    console.log({ selectedOptions, index, name });
    const updated = [...FormData.FunnelDetail];

    const values = Array.isArray(selectedOptions)
      ? selectedOptions.map((ele) => ele)
      : [];

    updated[index] = {
      ...updated[index],
      [name]: values,

      // similar
      ...(name === "OPD_OPDDays" && {
        MeetingDays: values,
      }),
    };

    setFormData((prev) => ({
      ...prev,
      FunnelDetail: updated,
    }));
  };

  const savePayload = {
    SaveLatLong: Number(FormData.SaveLatLong),
    Latitude: FormData.Latitude || "",
    Longitude: FormData.Longitude || "",
    CallFor: FormData.CallFor || "",
    CreatedFor: String(FormData.CreatedFor) || "",
    CreatedForName: FormData.CreatedForName || "",

    Funnel: FormData.Funnel.map((f) => ({
      FunnelId: f.FunnelId || 0,
      Type1Id: f.Type1Id || 0,
      Type1: f.Type1 || "",
      CentreId: f.CentreId || "",
      CentreName: f.CentreName || "",

      BusinessProfessionId: f.BusinessProfessionId || "",
      BusinessProfessionName: f.BusinessProfessionName || "",

      BusinessOwnershipId: f.BusinessOwnershipId || "",
      BusinessOwnershipName: f.BusinessOwnershipName || "",

      ProspectTypeId: f.ProspectTypeId || "",
      ProspectTypeName: f.ProspectTypeName || "",

      OrganizationName: f.OrganizationName || "",
      LandlineNo: f.LandlineNo || "",
      ContactPersonName: f.ContactPersonName || "",
      Designation: f.Designation || "",
      MobileNumber: f.MobileNumber || "",
      EmailId: f.EmailId || "",
      Website: f.Website || "",
      Address: f.Address || "",

      Locality: f.Locality || "",
      LocalityId: String(f.LocalityId) || "",

      CityId: f.CityId || "",
      Cityname: f.Cityname || "",
      Pincode: f.Pincode || "",

      StateId: f.StateId || "",
      StateName: f.StateName || "",

      CountryId: f.CountryId || "",
      CountryName: f.CountryName || "",

      ProposedAssociationId: f.ProposedAssociationId || "",
      ProposedAssociationName: f.ProposedAssociationName || "",

      InterestLevelId: f.InterestLevelId || "",
      InterestLevelName: f.InterestLevelName || "",

      NoOfExpectedCalls: f.NoOfExpectedCalls || "",
      ExpectedBusinessForecast: String(f.ExpectedBusinessForecast) || "",

      ExpectedCategoryId: f.ExpectedCategoryId || "",
      ExpectedCategoryName: f.ExpectedCategoryName || "",

      DoctorName: f.DoctorName || "",
      SpecializationId: String(f.SpecializationId) || "",
      Specialization: f.Specialization || "",

      Id: String(f.Id) || "0",
      ExpectedSubCategoryName: String(f.ExpectedSubCategoryName) || "",
      LeadType: f.LeadType || "",

      IsPrimaryDoctor: f.IsPrimaryDoctor || 0,
      TaggedDoctor: f.TaggedDoctor || 0,

      IsPrimaryHosp: f.IsPrimaryHosp || 0,
      TaggedHosp: f.TaggedHosp || 0,

      UINNO: f.UINNO || "",

      DoctorBday: moment(f.DoctorBday).format("YYYY-MM-DD"),

      DoctorAnni: moment(f.DoctorAnni).format("YYYY-MM-DD"),
    })),

    FunnelDetail: FormData.FunnelDetail.map((d) => ({
      FunnelDetailId: d.FunnelDetailId || 0,
      FunnelId: d.FunnelId || 0,

      OPD_DoctorName: d.OPD_DoctorName || "",
      OPD_Specialization: d.OPD_Specialization || "",
      OPD_ClinicName: d.OPD_ClinicName || "",

      OPD_OPDDays: Array.isArray(d.OPD_OPDDays)
        ? d.OPD_OPDDays.join(",")
        : d.OPD_OPDDays || "",

      OPD_Shift: String(d.OPD_Shift) || "",
      OPD_StartTime: d.OPD_StartTime || "",
      OPD_EndTime: d.OPD_EndTime || "",
      OPD_AvgPatient: String(d.OPD_AvgPatient) || "",
      OPD_Fees: String(d.OPD_Fees) || "",

      MeetingStartTime: d.MeetingStartTime || "",
      MeetingEndTime: d.MeetingEndTime || "",
      MeetingDays: Array.isArray(d.MeetingDays)
        ? d.MeetingDays.join(",")
        : d.MeetingDays || "",

      LAB_NoOfprocessingLabs: String(d.LAB_NoOfprocessingLabs) || "",
      LAB_SampleCollectionCenters: String(d.LAB_SampleCollectionCenters) || "",
      LAB_AvgNoOfPatient: String(d.LAB_AvgNoOfPatient) || "",
      LAB_AvgNoOfTest: String(d.LAB_AvgNoOfTest) || "",
      LAB_IsOutsource: String(d.LAB_IsOutsource) || "",
      LAB_AvgNoOfOutsourceSample: String(d.LAB_AvgNoOfOutsourceSample) || "",
      LAB_PreferredOutsourceTests: d.LAB_PreferredOutsourceTests || "",
      LAB_CurrentlyOutsourcingTo: d.LAB_CurrentlyOutsourcingTo || "",
      LAB_AvgOutsourceBusinessPerMon: String(d.LAB_AvgOutsourceBusinessPerMon) || "",

      HOSP_Specialization: d.HOSP_Specialization || "",
      HOSP_Built: d.HOSP_Built || "",
      HOSP_NoOfBed: String(d.HOSP_NoOfBed) || "",
      HOSP_NoOfDoctorsInOPD: String(d.HOSP_NoOfDoctorsInOPD) || "",
      HOSP_AvgOPDPerDay: String(d.HOSP_AvgOPDPerDay) || "",
      HOSP_AvgIPDPerDay: String(d.HOSP_AvgIPDPerDay) || "",
      HOSP_Lab: String(d.HOSP_Lab) || "",
      HOSP_Outsource: String(d.HOSP_Outsource) || "",
      HOSP_OutsourcingTo: d.HOSP_OutsourcingTo || "",
      HOSP_AvgOutsourceBusinessPerMon: d.HOSP_AvgOutsourceBusinessPerMon || "",

      PHAR_CurrentlyAssociatedWithAnyLab:
        String(d.PHAR_CurrentlyAssociatedWithAnyLab) || "",
      PHAR_AvgNumberOfSampleCollected: String(d.PHAR_AvgNumberOfSampleCollected) || "",
      PHAR_NearByApartment: d.PHAR_NearByApartment || "",
      PHAR_LabName: d.PHAR_LabName || "",
      PHAR_AvgExistingBusiness: String(d.PHAR_AvgExistingBusiness) || "",
      PHAR_AvgPopulationNearby: d.PHAR_AvgPopulationNearby || "",
      PHAR_WeeklyOff: Array.isArray(d.PHAR_WeeklyOff)
        ? d.PHAR_WeeklyOff.join(",")
        : d.PHAR_WeeklyOff || "",
      PHAR_NoOfDrClinicNearby: d.PHAR_NoOfDrClinicNearby || "",
      PHAR_NoOfOtherPharmacyNearby: d.PHAR_NoOfOtherPharmacyNearby || "",

      OTH_Others: d.OTH_Others || "",
      OTH_PreferredStartTime: d.OTH_PreferredStartTime || "",
      OTH_PreferredEndTime: d.OTH_PreferredEndTime || "",
      OTH_PreferredDays: Array.isArray(d.OTH_PreferredDays)
        ? d.OTH_PreferredDays.join(",")
        : d.OTH_PreferredDays || "",
    })),
  };

  const validateForm = () => {
    let newErrors = {};

    const professionId = FormData?.Funnel?.[0]?.BusinessProfessionId;

    const shouldValidateOPD =
      professionId == "" || professionId == 1 || professionId == 2;

    if (!FormData?.Funnel[0]?.ProspectTypeId) {
      newErrors.ProspectTypeName = "This field is required";
    }
    const prospectTypeId = FormData?.Funnel?.[0]?.ProspectTypeId;

    if (prospectTypeId !== 2) {
      if (!FormData?.Funnel?.[0]?.DoctorName) {
        newErrors.DoctorName = "Doctor is required";
      }
    }
    if (!FormData?.Funnel[0]?.OrganizationName) {
      newErrors.OrganizationName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.CentreId) {
      newErrors.CentreName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.Address) {
      newErrors.Address = "This field is required";
    }
    if (!FormData?.Funnel[0]?.StateName) {
      newErrors.StateName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.Cityname) {
      newErrors.Cityname = "This field is required";
    }
    if (!FormData?.Funnel[0]?.Locality) {
      newErrors.Locality = "This field is required";
    }
    if (!FormData?.Funnel[0]?.Pincode) {
      newErrors.Pincode = "This field is required";
    }
    if (!FormData?.Funnel[0]?.Specialization) {
      newErrors.Specialization = "This field is required";
    }
    if (!FormData?.Funnel[0]?.ProposedAssociationName) {
      newErrors.ProposedAssociationName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.InterestLevelName) {
      newErrors.InterestLevelName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.NoOfExpectedCalls) {
      newErrors.NoOfExpectedCalls = "This field is required";
    }
    if (!FormData?.Funnel[0]?.ExpectedBusinessForecast) {
      newErrors.ExpectedBusinessForecast = "This field is required";
    }
    if (!FormData?.Funnel[0]?.ExpectedSubCategoryName) {
      newErrors.ExpectedSubCategoryName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.LeadType) {
      newErrors.LeadType = "This field is required";
    }
    if (!FormData?.CreatedFor) {
      newErrors.CreatedFor = "This field is required";
    }
    if (!FormData?.Funnel[0]?.Type1) {
      newErrors.Type1 = "This field is required";
    }
    if (!FormData?.Funnel[0]?.BusinessProfessionName) {
      newErrors.BusinessProfessionName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.BusinessOwnershipName) {
      newErrors.BusinessOwnershipName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.CountryName) {
      newErrors.CountryName = "This field is required";
    }
    if (!FormData?.Funnel[0]?.ExpectedCategoryId) {
      newErrors.ExpectedCategoryName = "This field is required";
    }

    // business details
    if (FormData?.FunnelDetail?.length > 0) {

      FormData.FunnelDetail.forEach((row) => {
        // if (!row.OPD_ClinicName) {
        //   newErrors.OPD_ClinicName = "Clinic Name is required";
        // }

        // if (!row.OPD_OPDDays || row.OPD_OPDDays.length === 0) {
        //   newErrors.OPD_OPDDays = "OPDDays required";
        // }

        if (shouldValidateOPD && FormData?.FunnelDetail?.length > 0) {
          FormData.FunnelDetail.forEach((row, index) => {
            if (!row.OPD_OPDDays || row.OPD_OPDDays.length === 0) {
              newErrors[`OPD_OPDDays_${index}`] = "OPDDays required";
            }

            if (!row.OPD_StartTime) {
              newErrors[`OPD_StartTime_${index}`] = "StartTime required";
            }

            if (!row.OPD_EndTime) {
              newErrors[`OPD_EndTime_${index}`] = "EndTime required";
            }
          });
        }

        // if (!row.OPD_Shift) {
        //   newErrors.OPD_Shift = "Shift is required";
        // }

        // if (!row.OPD_StartTime) {
        //   newErrors.OPD_StartTime = "StartTime required";
        // }

        // if (!row.OPD_EndTime) {
        //   newErrors.OPD_EndTime = "EndTime required";
        // }

        // if (!row.OPD_AvgPatient) {
        //   newErrors.OPD_AvgPatient = "Avg Patients is required";
        // }

        // if (!row.OPD_Fees) {
        //   newErrors.OPD_Fees = "OPD Fees is required";
        // }

        // if (!row.MeetingStartTime) {
        //   newErrors.MeetingStartTime = "Meeting Start Time is required";
        // }

        // if (!row.MeetingEndTime) {
        //   newErrors.MeetingEndTime = "Meeting End Time is required";
        // }

        // if (!row.MeetingDays || row.MeetingDays.length === 0) {
        //   newErrors.MeetingDays = "Meeting Days is required";
        // }
      });
    }

    setErros(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const HandleSaveFunnelData = () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoad(true);
    axiosInstance
      .post("SalesFunnel/Save", savePayload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          navigate("/funnel-list");
          setLoad(false);
        } else {
          toast.error(res?.data?.message);
          setLoad(false);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(getApiErrorMessage(error));
      })
      .finally(() => {
        setLoad(false);
      });
  };

  const handleDetailsExcel = async () => {
    try {
      setDetailsExcelLoading(true);
      const res = await axiosReport.get("commonReports/SalesFunnelImportTemplate", {
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
      link.setAttribute("download", "SalesFunnel_list.xlsx");
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
      setDetailsExcelLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Report-style exports often have a title/timestamp row above the
        // real column headers, so scan the first few rows and pick the one
        // that actually matches known Funnel/FunnelDetail field names.
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        const ALL_FIELD_SET = new Set([
          ...FUNNEL_FIELD_SET,
          ...FUNNEL_DETAIL_FIELD_SET,
        ]);

        let headerRowIndex = 0;
        let bestMatchCount = 0;
        const rowsToScan = Math.min(rawRows.length, 10);
        for (let i = 0; i < rowsToScan; i++) {
          const row = rawRows[i] || [];
          const matchCount = row.filter((cell) =>
            ALL_FIELD_SET.has(normalizeKey(cell))
          ).length;
          if (matchCount > bestMatchCount) {
            bestMatchCount = matchCount;
            headerRowIndex = i;
          }
        }

        const headerRow = rawRows[headerRowIndex] || [];
        const jsonData = rawRows
          .slice(headerRowIndex + 1)
          .filter((row) =>
            row.some((cell) => cell !== "" && cell !== undefined && cell !== null)
          )
          .map((row) => {
            const obj = {};
            headerRow.forEach((key, idx) => {
              if (!key) return;
              obj[key] = row[idx] !== undefined ? row[idx] : "";
            });
            return obj;
          });

        if (jsonData.length === 0) {
          toast.error("The uploaded file is empty.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        setImportedExcelData(jsonData);
        setShowImportModal(true);
        toast.success("Excel Imported Successfully");
      } catch (error) {
        console.error(error);
        toast.error("Error reading file.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleBulkImportSave = async () => {
    if (importedExcelData.length === 0) return;

    const payload = {
      funnel: importedExcelData.map(mapRowToFunnelPayload),
      funnelDetail: importedExcelData.map(mapRowToFunnelDetailPayload),
      saveLatLong: Number(FormData?.SaveLatLong ?? 1),
      latitude: FormData?.Latitude || "",
      longitude: FormData?.Longitude || "",
      callFor: FormData?.CallFor || "New Lead",
      createdFor: String(FormData?.CreatedFor || ""),
      createdForName: FormData?.CreatedForName || "",
    };

    try {
      setBulkImportSaving(true);
      const res = await axiosInstance.post("SalesFunnel/SalesFunnelImportExcel", payload);
      if (res?.data?.success) {
        toast.success(res?.data?.message || "Imported data saved successfully.");
        setShowImportModal(false);
        setImportedExcelData([]);
      } else {
        toast.error(res?.data?.message || "Failed to save imported data.");
      }
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error));
    } finally {
      setBulkImportSaving(false);
    }
  };

  useEffect(() => {
    getAccessCentresReports(setCentreData);
    getExpectedCategoryDropDown();
    getExpectedSubCategoryDropDown();
    // getStateDropDown();
    getCentreType1();
    getProposedAssociationDropDown();
    getBusinessProfession();
    getBusinessOwnership();
    getInterestLevelDropDown();
    getProspectType();
    getSpecializationType();
    getOpdDaysDropDown();
    getBindCreatedForDropDown();
  }, []);

  useEffect(() => {
    const fetchEditData = async () => {
      try {
        setLoad(true);

        const res = await axiosInstance.post("SalesFunnel/BindData", {
          funnelId: String(Data),
        });
        setEditData(res?.data?.success ? res.data.message : []);
        setLoad(false);
      } catch (err) {
        console.log(err);
        setEditData([]);
      } finally {
        setLoad(false);
      }
    };

    if (Data) {
      fetchEditData();
    }
  }, [Data]);

  useEffect(() => {
    if (!editData || editData.length === 0) return;
    const header = editData[0];
    const details = editData;

    console.log("Funnel details", details)

    setFormData((prev) => ({
      ...prev,
      Longitude: header.Longitude || "",
      Latitude: header.Latitude || "",
      CreatedFor: header.CreatedFor || "",
      CreatedForName: header.CreatedForName || "",
      SaveLatLong: String(header.SaveLatLong),
      Funnel: [
        {
          ...prev.Funnel[0],

          FunnelId: header.FunnelId || "",
          Type1Id: header.Type1Id || "",
          Type1: header.Type1 || "",

          CentreId: header.CentreId || "",
          CentreName: header.CentreName || "",

          BusinessProfessionId: header.BusinessProfessionId || "",
          BusinessProfessionName: header.BusinessProfessionName || "",

          BusinessOwnershipId: header.BusinessOwnershipId || "",
          BusinessOwnershipName: header.BusinessOwnershipName || "",

          ProspectTypeId: header.ProspectTypeId || "",
          ProspectTypeName: header.ProspectTypeName || "",

          OrganizationName: header.OrganizationName || "",
          LandlineNo: header.LandlineNo || "",
          ContactPersonName: header.ContactPersonName || "",
          Designation: header.Designation || "",
          MobileNumber: header.MobileNumber || "",
          EmailId: header.EmailId || "",
          Website: header.Website || "",
          Address: header.Address || "",

          Locality: header.Locality || "",
          LocalityId: header.LocalityID || "",

          Pincode: header.Pincode || "",

          StateId: header.StateId || "",
          StateName: header.StateName || "",

          CountryId: header.CountryId || "",
          CountryName: header.CountryName || "",

          ProposedAssociationId: header.ProposedAssociationId || "",
          ProposedAssociationName: header.ProposedAssociationName || "",
          CityId: header.CityId || "",
          Cityname: header.Cityname || "",

          InterestLevelId: header.InterestLevelId || "",
          InterestLevelName: header.InterestLevelName || "",

          NoOfExpectedCalls: header.NoOfExpectedCalls || "",
          ExpectedBusinessForecast: header.ExpectedBusinessForecast || "",

          ExpectedCategoryId: header.ExpectedCategoryId || "",

          DoctorName: header.DoctorName || "",
          SpecializationId: header.SpecializationId || "",
          Specialization: header.Specialization || "",

          TaggedDoctor: header.TaggedDoctor || "",
          IsPrimaryHosp: header.IsPrimaryHosp || "",
          TaggedHosp: header.TaggedHosp || "",
          ExpectedSubCategoryName: header.ExpectedSubCategoryName || "",
          LeadType: header.LeadType || "",
          DoctorBday: new Date(header.DoctorBirthDay),

          DoctorAnni: new Date(header.DoctorAnniversary),
        },
      ],

      FunnelDetail: details.map((row) => ({
        FunnelDetailId: row.FunnelDetailId || "",
        FunnelId: row.FunnelId || "",
        OPD_DoctorName: row.OPD_DoctorName || "",
        OPD_Specialization: row.OPD_Specialization || "",
        OPD_ClinicName: row.OPD_ClinicName || "",
        OPD_OPDDays: row.OPD_OPDDays
          ?.split(",")
          .map(day => day.trim())
          .filter(Boolean) || [],
        OPD_Shift: row.OPD_Shift || "",
        OPD_StartTime: row.OPD_StartTime || "",
        OPD_EndTime: row.OPD_EndTime || "",
        OPD_AvgPatient: row.OPD_AvgPatient || 0,
        OPD_Fees: row.OPD_Fees || 0,
        MeetingStartTime: row.MeetingStartTime || "",
        MeetingEndTime: row.MeetingEndTime || "",
        MeetingDays: row.MeetingDays
          ? row.MeetingDays
            .split(",")
            .map(day => day.trim())
            .filter(Boolean)
          : [],

        LAB_NoOfprocessingLabs: row.LAB_NoOfprocessingLabs || "",
        LAB_SampleCollectionCenters: row.LAB_SampleCollectionCenters || "",
        LAB_AvgNoOfPatient: row.LAB_AvgNoOfPatient || "",
        LAB_AvgNoOfTest: row.LAB_AvgNoOfTest || "",
        LAB_IsOutsource: row.LAB_IsOutsource ?? "",
        LAB_AvgNoOfOutsourceSample: row.LAB_AvgNoOfOutsourceSample || "",
        LAB_PreferredOutsourceTests: row.LAB_PreferredOutsourceTests || "",
        LAB_CurrentlyOutsourcingTo: row.LAB_CurrentlyOutsourcingTo || "",
        LAB_AvgOutsourceBusinessPerMon: row.LAB_AvgOutsourceBusinessPerMon || "",

        HOSP_Specialization: row.HOSP_Specialization || "",
        HOSP_Built: row.HOSP_Built || "",
        HOSP_NoOfBed: row.HOSP_NoOfBed || "",
        HOSP_NoOfDoctorsInOPD: row.HOSP_NoOfDoctorsInOPD || "",
        HOSP_AvgOPDPerDay: row.HOSP_AvgOPDPerDay || "",
        HOSP_AvgIPDPerDay: row.HOSP_AvgIPDPerDay || "",
        HOSP_Lab: row.HOSP_Lab ?? "",
        HOSP_Outsource: row.HOSP_Outsource ?? "",
        HOSP_OutsourcingTo: row.HOSP_OutsourcingTo || "",
        HOSP_AvgOutsourceBusinessPerMon: String(row.HOSP_AvgOutsourceBusinessPerMon) || "",

        PHAR_CurrentlyAssociatedWithAnyLab: row.PHAR_CurrentlyAssociatedWithAnyLab ?? "",
        PHAR_AvgNumberOfSampleCollected: row.PHAR_AvgNumberOfSampleCollected || "",
        PHAR_NearByApartment: row.PHAR_NearByApartment || "",
        PHAR_LabName: row.PHAR_LabName || "",
        PHAR_AvgExistingBusiness: row.PHAR_AvgExistingBusiness || "",
        PHAR_AvgPopulationNearby: row.PHAR_AvgPopulationNearby || "",
        PHAR_WeeklyOff: row.PHAR_WeeklyOff
          ?.split(",")
          .map(day => day.trim())
          .filter(Boolean) || [],
        PHAR_NoOfDrClinicNearby: row.PHAR_NoOfDrClinicNearby || "",
        PHAR_NoOfOtherPharmacyNearby: row.PHAR_NoOfOtherPharmacyNearby || "",

        OTH_Others: row.OTH_Others || "",
        OTH_PreferredStartTime: row.OTH_PreferredStartTime || "",
        OTH_PreferredEndTime: row.OTH_PreferredEndTime || "",
        OTH_PreferredDays: row.OTH_PreferredDays
          ?.split(",")
          .map(day => day.trim())
          .filter(Boolean) || [],
      })),
    }));
  }, [editData]);

  useEffect(() => {
    if (FormData?.Funnel?.[0]?.StateId)
      getCityDropDown(String(FormData?.Funnel?.[0]?.StateId));
  }, [FormData?.Funnel?.[0]?.StateId]);

  useEffect(() => {
    if (FormData?.Funnel[0]?.CityId)
      getLocationDropDown(String(FormData?.Funnel[0]?.CityId));
  }, [FormData?.Funnel[0]?.CityId]);

  useEffect(() => {
    if (FormData?.Funnel[0]?.LocalityId)
      getBindPincode(String(FormData?.Funnel[0]?.LocalityId));
  }, [FormData?.Funnel[0]?.LocalityId]);

  useEffect(() => {
    setErros({});
    if (editData && editData.length > 0) return;
    setFormData((prev) => ({
      ...prev,
      FunnelDetail: initialPayload.FunnelDetail.map(item => ({ ...item }))
    }));
  }, [FormData?.Funnel[0]?.BusinessProfessionId]);

  const getCountries = () => {
    axiosInstance.get("CommonHc/GetCountryData").then((res) => {
      if (res?.data?.success) {
        setCountries([
          { label: "Select", value: "" },
          ...res.data.message.map((item) => ({
            label: item.CountryName,
            value: item.CountryID,
          }))
        ]);
      }
    }).catch((err) => console.log(err));
  };

  const getStates = (countryId) => {
    if (!countryId) {
      setStates([]);
      return;
    }
    axiosInstance.post("SalesFunnel/States", { CountryId: countryId }).then((res) => {
      if (res?.data?.success) {
        setStates([
          ...res.data.message.map((item) => ({
            label: item.State,
            value: item.Id,
          }))
        ]);
      }
    }).catch((err) => console.log(err));
  };

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (FormData?.Funnel?.[0]?.CountryId) {
      getStates(String(FormData?.Funnel?.[0]?.CountryId));
    } else {
      setStates([]);
    }
  }, [FormData?.Funnel?.[0]?.CountryId]);

  useEffect(() => {
    if (BindPincode) {
      setFormData((prev) => ({
        ...prev,
        Funnel: [
          {
            ...prev.Funnel[0],
            Pincode: String(BindPincode),
          },
        ],
      }));

      setErros((prev) => {
        const updated = { ...prev };
        delete updated.Pincode;
        return updated;
      });
    }
  }, [BindPincode]);

  useEffect(() => {
    const professionId = FormData?.Funnel?.[0]?.BusinessProfessionId;
    const organizationName = FormData?.Funnel?.[0]?.OrganizationName;

    const shouldSyncClinicName =
      professionId === "" || professionId == 1 || professionId == 2;

    if (!shouldSyncClinicName || !organizationName) return;

    setFormData((prev) => ({
      ...prev,
      FunnelDetail: prev.FunnelDetail.map((row) => ({
        ...row,
        OPD_ClinicName: organizationName,
      })),
    }));
  }, [FormData?.Funnel?.[0]?.BusinessProfessionId]);



  return (
    <>
      {show && (
        <SpecializationModal
          show={show}
          onHide={() => setShow(false)}
          refresh={getSpecializationType}
        />
      )}

      {show2 && tagMode && (
        <TagDoctorModal
          show={show2}
          onHide={() => {
            setShow2(false);
            setTagMode(null);
          }}
          Cities={Cities}
          States={States}
          mode={tagMode}
          onDoctorSelect={
            tagMode === "hospital"
              ? handleHospitalSelect
              : handleDoctorSelect
          }
        />
      )}

      <Accordion
        name={t("Funnel Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <Accordion 
          defaultValue={true} 
          title={t("Basic Demographic Details")}
          seconTitle={
            <div className="d-flex align-items-center" style={{ gap: "15px", paddingRight: "10px" }}>
              <Tooltip target=".excel-tooltip" position="top" />
              <span
                className="excel-tooltip"
                data-pr-tooltip={t("Download Excel")}
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                onClick={(e) => { e.stopPropagation(); if (!detailsExcelLoading) handleDetailsExcel(); }}
              >
                {detailsExcelLoading ? (
                  <span className="spinner-border spinner-border-sm text-primary" />
                ) : (
                  <ExcelDownloadIcon width={26} height={26} style={{ pointerEvents: "none" }} />
                )}
              </span>
              

              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => { e.stopPropagation(); handleFileUpload(e); }}
              />
              <span
                className="excel-tooltip"
                data-pr-tooltip={t("Import Excel")}
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
              >
                <ExcelIconSVG width={26} height={26} style={{ pointerEvents: "none" }} />
              </span>
            </div>
          }
        >
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-2">
              <ReactSelect
                removeIsClearable={true}
                className="required-fields"
                dynamicOptions={TaggedWith}
                name="Type1"
                placeholderName={"Tagged With"}
                id="Type1"
                lable={t("TaggedWith")}
                value={FormData?.Funnel[0]?.Type1Id}
                onChange={handleSelectChange}
                required
              />
              {FormData?.Funnel[0]?.Type1 === "" && (
                <span className="error-message">{errors?.Type1}</span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                removeIsClearable={true}
                dynamicOptions={CentreData}
                className="required-fields"
                name="CentreName"
                placeholderName={"Center"}
                id="CentreName"
                lable={t("Center")}
                value={FormData?.Funnel[0]?.CentreId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.CentreId === "" && (
                <span className="error-message">{errors?.CentreName}</span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                removeIsClearable={true}
                className="required-fields"
                dynamicOptions={BusinessProfession}
                name="BusinessProfessionName"
                placeholderName={"Business Profession"}
                id="BusinessProfessionName"
                lable={t("BusinessProfession")}
                value={FormData?.Funnel[0]?.BusinessProfessionId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.BusinessProfessionName === "" && (
                <span className="error-message">
                  {errors?.BusinessProfessionName}
                </span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={BusinessOwnership}
                name="BusinessOwnershipName"
                placeholderName={"Business Ownership"}
                id="BusinessOwnershipName"
                lable={t("BusinessOwnership")}
                className="required-fields"
                value={FormData?.Funnel[0]?.BusinessOwnershipId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.BusinessOwnershipName === "" && (
                <span className="error-message">
                  {errors?.BusinessOwnershipName}
                </span>
              )}
            </div>

            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={ProspectType}
                removeIsClearable={true}
                className="required-fields"
                name="ProspectTypeName"
                placeholderName={"Prospect Type"}
                id="ProspectTypeName"
                lable={t("Prospect Type")}
                value={FormData?.Funnel[0]?.ProspectTypeId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.ProspectTypeId === "" && (
                <span className="error-message">
                  {errors?.ProspectTypeName}
                </span>
              )}
            </div>
            {/* Organization Name */}
            {FormData?.Funnel[0]?.BusinessProfessionId == 5 ? (
              /* ===== Hospital Flow ===== */
              <div className="col-sm-2 col-6 d-flex">
                <div style={{ width: "65%" }}>
                  <Input
                    type="text"
                    name="OrganizationName"
                    id="OrganizationName"
                    lable={t("OrganizationName")}
                    placeholder=""
                    className="required-fields"
                    onChange={handleChange}
                    value={FormData?.Funnel[0]?.OrganizationName}
                  />

                  {FormData?.Funnel[0]?.OrganizationName === "" && (
                    <span className="error-message">
                      {errors?.OrganizationName}
                    </span>
                  )}
                </div>

                <div style={{ width: "35%" }} className="ps-1">
                  {!isHospitalTagged ? (
                    <button
                      type="button"
                      title="Tag Existing Hospital"
                      className="btn btn-sm btn-primary w-100"
                      onClick={() => {
                        setTagMode("hospital");
                        setShow2(true);
                      }}
                    >
                      Tag Exist. Hospital
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger w-100"
                      onClick={handleRemoveHospital}
                    >
                      Remove Exist. Hospital
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ===== Normal Flow ===== */
              <div className="col-sm-2">
                <Input
                  type="text"
                  name="OrganizationName"
                  id="OrganizationName"
                  lable={t("OrganizationName")}
                  placeholder=""
                  className="required-fields"
                  onChange={handleChange}
                  value={FormData?.Funnel[0]?.OrganizationName}
                />

                {FormData?.Funnel[0]?.OrganizationName === "" && (
                  <span className="error-message">
                    {errors?.OrganizationName}
                  </span>
                )}
              </div>
            )}
            <div className="col-sm-2">
              <Input
                type="number"
                name="LandlineNo"
                id="LandlineNo"
                lable={t("LandlineNo")}
                placeholder=""
                onChange={handleChange}
                value={FormData?.Funnel[0]?.LandlineNo}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="text"
                name="ContactPersonName"
                id="ContactPersonName"
                lable={t("ContactPersonName")}
                placeholder=""
                onChange={handleChange}
                value={FormData?.Funnel[0]?.ContactPersonName}
              />
            </div>

            <div className="col-sm-2">
              <Input
                type="text"
                name="Designation"
                id="Designation"
                lable={t("Designation")}
                placeholder=" "
                onChange={handleChange}
                value={FormData?.Funnel[0]?.Designation}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="number"
                name="MobileNumber"
                id="MobileNumber"
                lable={t("Mobile No.")}
                placeholder=" "
                onChange={handleChange}
                value={FormData?.Funnel[0]?.MobileNumber}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="email"
                name="EmailId"
                id="EmailId"
                lable={t("Email")}
                placeholder=" "
                onChange={handleChange}
                value={FormData?.Funnel[0]?.EmailId}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="text"
                name="Website"
                id="Website"
                lable={t("Website")}
                placeholder=" "
                onChange={handleChange}
                value={FormData?.Funnel[0]?.Website}
              />
            </div>
            <div className="col-sm-2">
              <Input
                className="required-fields"
                type="text"
                name="Address"
                id="Address"
                lable={t("Address")}
                placeholder=" "
                onChange={handleChange}
                value={FormData?.Funnel[0]?.Address}
              />
              {FormData?.Funnel[0]?.Address === "" && (
                <span className="error-message">{errors?.Address}</span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={Countries}
                name="CountryName"
                placeholderName={"Country"}
                id="CountryName"
                lable={t("Country")}
                className="required-fields"
                value={FormData?.Funnel[0]?.CountryId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.CountryName === "" && (
                <span className="error-message">{errors?.CountryName}</span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={[{ label: "Select", value: "" }, ...States]}
                name="StateName"
                placeholderName={FormData?.Funnel[0]?.CountryName === "Kenya" ? "County" : "State"}
                id="StateName"
                lable={t(FormData?.Funnel[0]?.CountryName === "Kenya" ? "County" : "State")}
                value={FormData?.Funnel[0]?.StateId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.StateName === "" && (
                <span className="error-message">{errors?.StateName}</span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={[{ label: "Select", value: "" }, ...Cities]}
                name="Cityname"
                placeholderName={"City"}
                id="Cityname"
                lable={t("City")}
                value={FormData?.Funnel[0]?.CityId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.Cityname === "" && (
                <span className="error-message">{errors?.Cityname}</span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={[{ label: "Select", value: "" }, ...Locality]}
                name="Locality"
                placeholderName={"Locality"}
                id="Locality"
                lable={t("Locality")}
                value={FormData?.Funnel[0]?.LocalityId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.Locality === "" && (
                <span className="error-message">{errors?.Locality}</span>
              )}
            </div>
            <div className="col-sm-2">
              <Input
                className="required-fields"
                type="number"
                name="Pincode"
                id="Pincode"
                lable={t("Pincode")}
                placeholder=" "
                onChange={handleChange}
                value={FormData?.Funnel[0]?.Pincode}
                maxLength={8}
                disabled={!!BindPincode}
              />
              {!BindPincode && FormData?.Funnel[0]?.Pincode === "" && (
                <span className="error-message">{errors?.Pincode}</span>
              )}
            </div>

            <div className="col-sm-2 col-6 d-flex">
              <div style={{ width: "65%" }}>
                <Input
                  name="DoctorName"
                  placeholderName={"Doctor"}
                  id="DoctorName"
                  lable={t("Doctor")}
                  onChange={handleChange}
                  value={FormData?.Funnel[0]?.DoctorName}
                  className={`${FormData?.Funnel?.[0]?.ProspectTypeId === 1 ? "required-fields" : ""}`}
                />
                {FormData?.Funnel[0]?.DoctorName === "" && (
                  <span className="error-message">{errors?.DoctorName}</span>
                )}
              </div>
              <div style={{ width: "35%" }}>
                {!isDoctorTagged ? (
                  <button
                    title="Tag Existing Doctor"
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setTagMode("doctor");
                      setShow2(true);
                    }}
                  >
                    TagExist. Doctor
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={handleRemoveDoctor}
                  >
                    Remove Exist. Doctor
                  </button>
                )}
              </div>
            </div>
            <div className="col-sm-2 col-6 d-flex">
              <div style={{ width: "87%" }}>
                <ReactSelect
                  className="required-fields"
                  dynamicOptions={Specialization}
                  name="Specialization"
                  placeholderName={"Specialization"}
                  id="Specialization"
                  lable={t("Specialization")}
                  value={FormData?.Funnel[0]?.SpecializationId}
                  onChange={handleSelectChange}
                />
                {FormData?.Funnel[0]?.Specialization === "" && (
                  <span className="error-message">
                    {errors?.Specialization}
                  </span>
                )}
              </div>
              <div style={{ width: "10%" }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setShow(true)}
                >
                  <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                </button>
              </div>
            </div>
            <div className="col-sm-2">
              <DatePicker
                placeholder=" "
                id="DoctorBday"
                lable="Doctor DOB"
                name="DoctorBday"
                className="custom-calendar"
                onChange={dateSelect}
                value={FormData?.Funnel[0]?.DoctorBday}
                maxDate={new Date()}
              />
            </div>
            <div className="col-sm-2">
              <DatePicker
                placeholder=" "
                id="DoctorAnni"
                lable="Doctor Anniversary"
                name="DoctorAnni"
                className="custom-calendar"
                value={FormData?.Funnel[0]?.DoctorAnni}
                onChange={dateSelect}
              />
            </div>
          </div>
        </Accordion>
        <Accordion defaultValue={true} title={t("Business Details")}>
          <Tables removeScrollOverFlow={false}>
            <thead>
              <tr>
                <th >{t("Sr.No.")}</th>
                {/* Doctor and polyclinic starts */}
                {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                    <th >{t("Clinic Name")}</th>
                  )}
                {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                    <th >{t("OPD days")}</th>
                  )}
                {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                    <th >{t("Shift")}</th>
                  )}
                {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                    <th >{t("Start Time")}</th>
                  )}
                {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                    <th >{t("End Time")}</th>
                  )}
                {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                    <th >{t("Avg. Patients")}</th>
                  )}
                {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                    <th >{t("OPD Fees")}</th>
                  )}
                {/* Doctor and polyclinic ends */}
                {/* pharmacy starts */}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >{t("Curr.Associated lab")}</th>
                )}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >{t("Name of Lab")}</th>
                )}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >{t("Avg No of sample coll.")}</th>
                )}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >{t("Avg Exist. Bussiness")}</th>
                )}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >{t("Near by Apart. /House")}</th>
                )}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >{t("Avg Population Nearby")}</th>
                )}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >
                    {t("No of Doctor clinic nearby")}
                  </th>
                )}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >
                    {t("No of other phar. nearby")}
                  </th>
                )}
                {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                  <th >{t("Weekly off")}</th>
                )}
                {/* pharmacy ends */}

                {/* nursing home & hospital starts  */}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("Specialization")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("Built")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("No of Bed")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("No of Doc. in OPD")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("Avg Opd Pat./Day")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("Avg Ipd Pat./Day")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("Laboratory Services")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("Outsource")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("Currently Outsourcing to")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                    <th >{t("Avg Outsource Buss/Mon.")}</th>
                  )}
                {/* nursing home & hospital ends  */}

                {/* diagnostic   and sample collections  starts */}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Processing Labs No.")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Sample Coll. centers")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Avg.Patient/Day")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Avg.Test/Day")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Outsourcing")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Out.Sample/Day")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Preferred Out. Tests")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Curr. Outsourcing To")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                    <th >{t("Avg Outsourcing Buss/Mon")}</th>
                  )}
                {/* diagnostic   and sample collections  ends */}

                {/* professional   and consultant  Starts */}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 9) && (
                    <th >{t("Others")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 9) && (
                    <th >{t("Preferred Start time")}</th>
                  )}

                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 9) && (
                    <th >{t("Preferred End time")}</th>
                  )}
                {(
                  FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 9) && (
                    <th >{t("Preferred Days")}</th>
                  )}
                {/* professional   and consultant  ends */}

                {/* commons */}
                {!(
                  FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                  FormData?.Funnel[0]?.BusinessProfessionId == 9
                ) && (
                    <>
                      <th >{t("Meet.Start Time")}</th>
                      <th >{t("Meet.End Time")}</th>
                      <th >{t("Meet.Days")}</th>

                    </>
                  )}
                <th >{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {FormData.FunnelDetail.map((row, index) => {
                const endTimeOptions = timeOptions.map((opt) => ({
                  ...opt,
                  isDisabled:
                    row.OPD_StartTime &&
                    convertToMinutes(opt.value) <=
                    convertToMinutes(row.OPD_StartTime),
                }));

                const meetingEndTimeOptions = timeOptions.map((opt) => ({
                  ...opt,
                  isDisabled:
                    row.MeetingStartTime &&
                    convertToMinutes(opt.value) <=
                    convertToMinutes(row.MeetingStartTime),
                }));

                const meetingStartOptions = timeOptions.map((opt) => ({
                  ...opt,
                  isDisabled:
                    row.OPD_StartTime &&
                    convertToMinutes(opt.value) <
                    convertToMinutes(row.OPD_StartTime),
                }));

                const preferredEndTimeOptions = timeOptions.map((opt) => ({
                  ...opt,
                  isDisabled:
                    row.OTH_PreferredStartTime &&
                    convertToMinutes(opt.value) <=
                    convertToMinutes(row.OTH_PreferredStartTime),
                }));
                return (
                  <tr key={index}>
                    <td data-title={t("S.No")} className="text-center">
                      {index + 1}&nbsp;
                    </td>
                    {/* doctor and policlinic starts */}
                    {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                        <td td data-title={t("Clinic Name")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="text"
                              name="OPD_ClinicName"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.OPD_ClinicName}
                              placeholder="Clinic Name "
                            />
                            {/* {row.OPD_ClinicName === "" && (
                              <span className="error-message">
                                {errors?.OPD_ClinicName}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                        <td data-title={t("OPD days")}>
                          <div className=" w-100">
                            {/* <SelectBoxWithCheckbox
                              className="required-fields"
                              options={dayOptions}
                              name="OPD_OPDDays"
                              placeholderName="OPD days"
                              value={row.OPD_OPDDays}
                              onChange={(selected, name) =>
                                handleSelectMultiChange(index, selected, name)
                              }
                            /> */}
                            {console.log("row", row?.OPD_OPDDays)}
                            <MultiSelectComp
                              options={dayOptions}
                              name="OPD_OPDDays"
                              value={row.OPD_OPDDays}
                              label="OPD days"
                              onChange={(name, selected) =>
                                handleSelectMultiChange(index, selected, name)
                              }
                            />
                            {(!row.OPD_OPDDays || row.OPD_OPDDays.length === 0) &&
                              errors?.[`OPD_OPDDays_${index}`] && (
                                <span className="error-message">
                                  {errors[`OPD_OPDDays_${index}`]}
                                </span>
                              )}
                          </div>
                        </td>
                      )}
                    {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                        <td data-title={t("Shift")}>
                          <div className="w-100">
                            <ReactSelect
                              className=""
                              name="OPD_Shift"
                              label={t("Shift")}
                              dynamicOptions={OpdDays}
                              placeholderName="Shift"
                              value={row.OPD_Shift}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {/* {row.OPD_Shift === "" && (
                              <span className="error-message">
                                {errors?.OPD_Shift}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                        <td data-title={t("Start Time")}>
                          <div className="w-100">
                            <ReactSelect
                              className="required-fields"
                              dynamicOptions={timeOptions}
                              name="OPD_StartTime"
                              label={t("Start Time")}
                              placeholderName={"Start Time"}
                              value={row.OPD_StartTime}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {row.OPD_StartTime === "" && errors?.[`OPD_StartTime_${index}`] && (
                              <span className="error-message">
                                {errors[`OPD_StartTime_${index}`]}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                        <td data-title={t("End Time")}>
                          <div className="w-100">
                            <ReactSelect
                              className="required-fields"
                              dynamicOptions={endTimeOptions}
                              name="OPD_EndTime"
                              label={t("End Time")}
                              value={row.OPD_EndTime}
                              placeholderName={"End Time"}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {row.OPD_EndTime === "" && errors?.[`OPD_EndTime_${index}`] && (
                              <span className="error-message">
                                {errors[`OPD_EndTime_${index}`]}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                        <td data-title={t("Avg. Patients")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="OPD_AvgPatient"
                              placeholder="Avg. Patients"
                              value={row.OPD_AvgPatient}
                              onChange={(e) => handleChangeRow(index, e)}
                            />
                            {/* {row.OPD_AvgPatient === "" && (
                              <span className="error-message">
                                {errors?.OPD_AvgPatient}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(FormData?.Funnel[0]?.BusinessProfessionId === "" ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 1 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 2) && (
                        <td data-title={t("OPD Fees")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="OPD_Fees"
                              value={row.OPD_Fees}
                              onChange={(e) => handleChangeRow(index, e)}
                              placeholder={"OPD Fees"}
                            />
                            {/* {row.OPD_Fees === "" && (
                              <span className="error-message">
                                {errors?.OPD_Fees}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {/* doctor and policlinic ends */}
                    {/* pharmacy starts */}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("Curr.Associated lab")}>
                        <div className="w-100">
                          <ReactSelect
                            className=""
                            dynamicOptions={[
                              { value: "1", label: "Yes" },
                              { value: "0", label: "No" },
                            ]}
                            name="PHAR_CurrentlyAssociatedWithAnyLab"
                            placeholderName={""}
                            label={t("Curr.Associated lab")}
                            value={row.PHAR_CurrentlyAssociatedWithAnyLab}
                            onChange={(name, selected) =>
                              handleSelectChangeRow(index, name, selected)
                            }
                          />
                          {/* {row.PHAR_CurrentlyAssociatedWithAnyLab === "" && (
                            <span className="error-message">
                              {errors?.PHAR_CurrentlyAssociatedWithAnyLab}
                            </span>
                          )} */}
                        </div>
                      </td>
                    )}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("Name of Lab")}>
                        <div className="w-100">
                          <Input
                            className=""
                            type="text"
                            name="PHAR_LabName"
                            onChange={(e) => handleChangeRow(index, e)}
                            value={row.PHAR_LabName}
                            placeholder={t("Name of Lab")}
                            disabled={
                              row.PHAR_CurrentlyAssociatedWithAnyLab == "0"
                            }
                          />
                          {/* {row.OPD_ClinicName === "" && (
                            <span className="error-message">
                              {errors?.OPD_ClinicName}
                            </span>
                          )} */}
                        </div>
                      </td>
                    )}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("Avg. No. of Samples Collected")}>
                        <div className="w-100">
                          <Input
                            className=""
                            type="number"
                            name="PHAR_AvgNumberOfSampleCollected"
                            onChange={(e) => handleChangeRow(index, e)}
                            value={row.PHAR_AvgNumberOfSampleCollected}
                            placeholder={t("Avg. No. of Samples Collected")}
                            disabled={
                              row.PHAR_CurrentlyAssociatedWithAnyLab == "0"
                            }
                          />
                          {/* {row.PHAR_AvgNumberOfSampleCollected === "" && (
                            <span className="error-message">
                              {errors?.PHAR_AvgNumberOfSampleCollected}
                            </span>
                          )} */}
                        </div>
                      </td>
                    )}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("Avg. No. of Existing Business")}>
                        <div className="w-100">
                          <Input
                            className=""
                            type="number"
                            name="PHAR_AvgExistingBusiness"
                            onChange={(e) => handleChangeRow(index, e)}
                            value={row.PHAR_AvgExistingBusiness}
                            placeholder={t("Avg. No. of Existing Business")}
                            disabled={
                              row.PHAR_CurrentlyAssociatedWithAnyLab == "0"
                            }
                          />
                          {/* {row.PHAR_AvgExistingBusiness === "" && (
                            <span className="error-message">
                              {errors?.PHAR_AvgExistingBusiness}
                            </span>
                          )} */}
                        </div>
                      </td>
                    )}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("Nearby Apartment")}>
                        <div className="w-100">
                          <Input
                            className=""
                            type="text"
                            name="PHAR_NearByApartment"
                            onChange={(e) => handleChangeRow(index, e)}
                            value={row.PHAR_NearByApartment}
                            placeholder={t("Nearby Apartment")}
                          />
                          {/* {row.PHAR_NearByApartment === "" && (
                            <span className="error-message">
                              {errors?.PHAR_NearByApartment}
                            </span>
                          )} */}
                        </div>
                      </td>
                    )}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("Avg. Population Nearby")}>
                        <div className="w-100">
                          <Input
                            className=""
                            type="text"
                            name="PHAR_AvgPopulationNearby"
                            onChange={(e) => handleChangeRow(index, e)}
                            value={row.PHAR_AvgPopulationNearby}
                            placeholder={t("Avg. Population Nearby")}
                          />
                          {/* {row.PHAR_AvgPopulationNearby === "" && (
                            <span className="error-message">
                              {errors?.PHAR_AvgPopulationNearby}
                            </span>
                          )} */}
                        </div>
                      </td>
                    )}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("No of Doctor clinic nearby")}>
                        <div className="w-100">
                          <Input
                            className=""
                            type="number"
                            name="PHAR_NoOfDrClinicNearby"
                            onChange={(e) => handleChangeRow(index, e)}
                            value={row.PHAR_NoOfDrClinicNearby}
                            placeholder={t("No of Doctor clinic nearby")}
                          />
                          {/* {row.PHAR_NoOfDrClinicNearby === "" && (
                            <span className="error-message">
                              {errors?.PHAR_NoOfDrClinicNearby}
                            </span>
                          )} */}
                        </div>
                      </td>
                    )}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("No of other phar. nearby")}>
                        <div className="w-100">
                          <Input
                            className=""
                            type="number"
                            name="PHAR_NoOfOtherPharmacyNearby"
                            onChange={(e) => handleChangeRow(index, e)}
                            value={row.PHAR_NoOfOtherPharmacyNearby}
                            placeholder={t("No of other phar. nearby")}
                          />
                          {/* {row.PHAR_NoOfOtherPharmacyNearby === "" && (
                            <span className="error-message">
                              {errors?.PHAR_NoOfOtherPharmacyNearby}
                            </span>
                          )} */}
                        </div>
                      </td>
                    )}
                    {FormData?.Funnel[0]?.BusinessProfessionId == 3 && (
                      <td td data-title={t("Weekly off")}>
                        <div className=" w-100">
                          {/* <SelectBoxWithCheckbox
                            className=""
                            options={dayOptions}
                            name="PHAR_WeeklyOff"
                            placeholderName=""
                            value={row.PHAR_WeeklyOff}
                            onChange={(selected, name) =>
                              handleSelectMultiChange(index, selected, name)
                            }
                          /> */}
                          <MultiSelectComp
                            options={dayOptions}
                            name="PHAR_WeeklyOff"
                            label={t("Weekly off")}
                            value={row.PHAR_WeeklyOff}
                            // label="Weekly Off "
                            onChange={(name, selected) =>
                              handleSelectMultiChange(index, selected, name)
                            }
                          />
                          {/* {(!row.PHAR_WeeklyOff ||
                            row.PHAR_WeeklyOff.length === 0) && (
                              <span className="error-message">
                                {errors?.PHAR_WeeklyOff}
                              </span>
                            )} */}
                        </div>
                      </td>
                    )}
                    {/* pharmcy Ends here */}

                    {/* nursing home and hospital starts */}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Specialization")}>
                          <div className="w-100">
                            <ReactSelect
                              className=""
                              dynamicOptions={[
                                { value: "", label: "Select" },
                                { value: "Day Care", label: "Day Care" },
                                { value: "Super Speciality", label: "Super Speciality" },
                                { value: "Multi Speciality", label: "Multi Speciality" },
                              ]}
                              name="HOSP_Specialization"
                              placeholderName={t("Specialization")}
                              value={row.HOSP_Specialization}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {/* {row.HOSP_Specialization === "" && (
                            <span className="error-message">
                              {errors?.HOSP_Specialization}
                            </span>
                          )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Built")}>
                          <div className="w-100">
                            <ReactSelect
                              className=""
                              dynamicOptions={[
                                { value: "", label: "Select" },
                                { value: "Under-Construction", label: "Under-Construction" },
                                { value: "Running", label: "Running" },
                                { value: "New", label: "New" },
                              ]}
                              name="HOSP_Built"
                              placeholderName={t("Built")}
                              value={row.HOSP_Built}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {/* {row.HOSP_Built === "" && (
                            <span className="error-message">
                              {errors?.HOSP_Built}
                            </span>
                          )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("No of Bed")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="HOSP_NoOfBed"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.HOSP_NoOfBed}
                              placeholder={t("No of Bed")}
                            />
                            {/* {row.HOSP_NoOfBed === "" && (
                              <span className="error-message">
                                {errors?.HOSP_NoOfBed}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Doctors in OPD")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="HOSP_NoOfDoctorsInOPD"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.HOSP_NoOfDoctorsInOPD}
                              placeholder={t("Doctors in OPD")}
                            />
                            {/* {row.HOSP_NoOfDoctorsInOPD === "" && (
                              <span className="error-message">
                                {errors?.HOSP_NoOfDoctorsInOPD}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Avg Opd Pat./Day")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="HOSP_AvgOPDPerDay"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.HOSP_AvgOPDPerDay}
                              placeholder={t("Avg Opd Pat./Day")}
                            />
                            {/* {row.HOSP_AvgOPDPerDay === "" && (
                              <span className="error-message">
                                {errors?.HOSP_AvgOPDPerDay}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Avg Ipd Pat./Day")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="HOSP_AvgIPDPerDay"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.HOSP_AvgIPDPerDay}
                              placeholder={t("Avg Ipd Pat./Day")}
                            />
                            {/* {row.HOSP_AvgIPDPerDay === "" && (
                              <span className="error-message">
                                {errors?.HOSP_AvgIPDPerDay}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Laboratory Services")}>
                          <div className="w-100">
                            <ReactSelect
                              className=""
                              dynamicOptions={[
                                { value: "-1", label: "Select" },
                                { value: "0", label: "Third Party" },
                                { value: "1", label: "Inhouse" },

                              ]}
                              name="HOSP_Lab"
                              placeholderName={t("Laboratory Services")}
                              value={row.HOSP_Lab}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {/* {row.HOSP_Lab === "" && (
                            <span className="error-message">
                              {errors?.HOSP_Lab}
                            </span>
                          )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Outsource")}>
                          <div className="w-100">
                            <ReactSelect
                              className=""
                              dynamicOptions={[
                                { value: "0", label: "No" },
                                { value: "1", label: "Yes" },
                              ]}
                              name="HOSP_Outsource"
                              placeholderName={t("Outsource")}
                              value={row.HOSP_Outsource}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {/* {row.HOSP_Outsource === "" && (
                            <span className="error-message">
                              {errors?.HOSP_Outsource}
                            </span>
                          )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Currently Outsourcing to")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="text"
                              name="HOSP_OutsourcingTo"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.HOSP_OutsourcingTo}
                              placeholder={t("Currently Outsourcing to")}
                              disabled={row.HOSP_Outsource == "0"}
                            />
                            {/* {row.HOSP_OutsourcingTo === "" && (
                              <span className="error-message">
                                {errors?.HOSP_OutsourcingTo}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 4 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 5) && (
                        <td td data-title={t("Avg Outsource Buss/Mon.")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="HOSP_AvgOutsourceBusinessPerMon"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.HOSP_AvgOutsourceBusinessPerMon}
                              placeholder={t("Avg Outsource Buss/Mon.")}
                              disabled={row.HOSP_Outsource == "0"}
                            />
                            {row.HOSP_AvgOutsourceBusinessPerMon === "" && (
                              <span className="error-message">
                                {errors?.HOSP_AvgOutsourceBusinessPerMon}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    {/* nursing home and hospital ends */}

                    {/* diagnostic   and sample collections  Starts */}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Processing Labs No.")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="LAB_NoOfprocessingLabs"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.LAB_NoOfprocessingLabs}
                              placeholder={t("Processing Labs No.")}
                              disabled={FormData?.Funnel[0]?.BusinessProfessionId == 7}
                            />
                            {/* {row.LAB_NoOfprocessingLabs === "" && (
                              <span className="error-message">
                                {errors?.LAB_NoOfprocessingLabs}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Sample Coll. centers")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="LAB_SampleCollectionCenters"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.LAB_SampleCollectionCenters}
                              placeholder={t("Sample Coll. centers")}
                            />
                            {/* {row.LAB_SampleCollectionCenters === "" && (
                              <span className="error-message">
                                {errors?.LAB_SampleCollectionCenters}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Avg.Patient/Day")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="LAB_AvgNoOfPatient"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.LAB_AvgNoOfPatient}
                              placeholder={t("Avg.Patient/Day")}
                            />
                            {/* {row.LAB_AvgNoOfPatient === "" && (
                              <span className="error-message">
                                {errors?.LAB_AvgNoOfPatient}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Avg.Test/Day")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="LAB_AvgNoOfTest"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.LAB_AvgNoOfTest}
                              placeholder={t("Avg.Test/Day")}
                            />
                            {/* {row.LAB_AvgNoOfTest === "" && (
                              <span className="error-message">
                                {errors?.LAB_AvgNoOfTest}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Outsourcing")}>
                          <div className="w-100">
                            <ReactSelect
                              className=""
                              dynamicOptions={[
                                { value: "-1", label: "Select" },
                                { value: "0", label: "No" },
                                { value: "1", label: "Yes" },
                              ]}
                              name="LAB_IsOutsource"
                              placeholderName={t("Outsourcing")}
                              value={row.LAB_IsOutsource}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {/* {row.LAB_IsOutsource === "" && (
                              <span className="error-message">
                                {errors?.LAB_IsOutsource}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Out.Sample/Day")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="number"
                              name="LAB_AvgNoOfOutsourceSample"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.LAB_AvgNoOfOutsourceSample}
                              placeholder={t("Out.Sample/Day")}
                              disabled={row.LAB_IsOutsource == "0"}
                            />
                            {/* {row.LAB_AvgNoOfOutsourceSample === "" && (
                              <span className="error-message">
                                {errors?.LAB_AvgNoOfOutsourceSample}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Preferred Out. Tests")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="text"
                              name="LAB_PreferredOutsourceTests"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.LAB_PreferredOutsourceTests}
                              placeholder={t("Preferred Out. Tests")}
                              disabled={row.LAB_IsOutsource == "0"}
                            />
                            {/* {row.LAB_PreferredOutsourceTests === "" && (
                              <span className="error-message">
                                {errors?.LAB_PreferredOutsourceTests}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Curr. Outsourcing To")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="text"
                              name="LAB_CurrentlyOutsourcingTo"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.LAB_CurrentlyOutsourcingTo}
                              placeholder={t("Curr. Outsourcing To")}
                              disabled={row.LAB_IsOutsource == "0"}

                            />
                            {/* {row.LAB_CurrentlyOutsourcingTo === "" && (
                              <span className="error-message">
                                {errors?.LAB_CurrentlyOutsourcingTo}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 6 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 7) && (
                        <td td data-title={t("Avg Outsourcing Buss/Mon")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="text"
                              name="LAB_AvgOutsourceBusinessPerMon"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.LAB_AvgOutsourceBusinessPerMon}
                              placeholder={t("Avg Outsourcing Buss/Mon")}
                              disabled={row.LAB_IsOutsource == "0"}
                            />
                            {/* {row.LAB_AvgOutsourceBusinessPerMon === "" && (
                              <span className="error-message">
                                {errors?.LAB_AvgOutsourceBusinessPerMon}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {/* diagnostic   and sample collections  ends */}

                    {/* professional   and consultant  starts */}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 9) && (
                        <td td data-title={t("Others")}>
                          <div className="w-100">
                            <Input
                              className=""
                              type="text"
                              name="OTH_Others"
                              onChange={(e) => handleChangeRow(index, e)}
                              value={row.OTH_Others}
                              placeholder={t("Others")}

                            />
                            {/* {row.OTH_Others === "" && (
                              <span className="error-message">
                                {errors?.OTH_Others}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 9) && (
                        <td data-title={t("Preferred Start time")}>
                          <div className="w-100">
                            <ReactSelect
                              className=""
                              dynamicOptions={timeOptions}
                              name="OTH_PreferredStartTime"
                              value={row.OTH_PreferredStartTime}
                              placeholderName={t("Preferred Start time")}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {/* {row.OTH_PreferredStartTime === "" && (
                              <span className="error-message">
                                {errors?.OTH_PreferredStartTime}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 9) && (
                        <td data-title={t("Preferred End time")}>
                          <div className="w-100">
                            <ReactSelect
                              className=""
                              dynamicOptions={preferredEndTimeOptions}
                              name="OTH_PreferredEndTime"
                              value={row.OTH_PreferredEndTime}
                              placeholderName={t("Preferred End time")}
                              onChange={(name, selected) =>
                                handleSelectChangeRow(index, name, selected)
                              }
                            />
                            {/* {row.OTH_PreferredEndTime === "" && (
                              <span className="error-message">
                                {errors?.OTH_PreferredEndTime}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {(
                      FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 9) && (
                        <td data-title={t("Preferred Days")}>
                          <div className="w-100">
                            {/* <SelectBoxWithCheckbox
                              className=""
                              options={dayOptions}
                              name="OTH_PreferredDays"
                              value={row.OTH_PreferredDays}
                              placeholderName={""}
                              onChange={(selected, name) =>
                                handleSelectMultiChange(index, selected, name)
                              }
                            /> */}
                            <MultiSelectComp
                              options={dayOptions}
                              name="OTH_PreferredDays"
                              value={row.OTH_PreferredDays}
                              // label="Weekly Off "
                              label={t("Preferred Days")}
                              onChange={(name, selected) =>
                                handleSelectMultiChange(index, selected, name)
                              }
                            />
                            {/* {(!row.OTH_PreferredDays || row.OTH_PreferredDays.length === 0) && (
                              <span className="error-message">
                                {errors?.OTH_PreferredDays}
                              </span>
                            )} */}
                          </div>
                        </td>
                      )}
                    {/* professional   and consultant  ends */}

                    {/* commons  starts*/}
                    {!(
                      FormData?.Funnel[0]?.BusinessProfessionId == 8 ||
                      FormData?.Funnel[0]?.BusinessProfessionId == 9
                    ) && (
                        <>
                          <td data-title={t("Meet.Start Time")}>
                            <div className="w-100">
                              <ReactSelect
                                className=""
                                dynamicOptions={meetingStartOptions}
                                placeholder={t("Meet.Start Time")}
                                name="MeetingStartTime"
                                value={row.MeetingStartTime}
                                placeholderName={"Meet.Start Time"}
                                onChange={(name, selected) =>
                                  handleSelectChangeRow(index, name, selected)
                                }
                              />
                              {/* {row.MeetingStartTime === "" && (
                                <span className="error-message">
                                  {errors?.MeetingStartTime}
                                </span>
                              )} */}
                            </div>
                          </td>
                          <td data-title={t("Meet.End Time")}>
                            <div className="w-100">
                              <ReactSelect
                                className=""
                                dynamicOptions={meetingEndTimeOptions}
                                name="MeetingEndTime"
                                value={row.MeetingEndTime}
                                placeholderName={t("Meet.End Time")}
                                onChange={(name, selected) =>
                                  handleSelectChangeRow(index, name, selected)
                                }
                              />
                              {/* {row.MeetingEndTime === "" && (
                                <span className="error-message">
                                  {errors?.MeetingEndTime}
                                </span>
                              )} */}
                            </div>
                          </td>
                          <td data-title={t("Meet.Days")}>
                            <div className="w-100">
                              {/* <SelectBoxWithCheckbox
                                className=""
                                options={dayOptions}
                                name="MeetingDays"
                                value={row.MeetingDays}
                                placeholderName={"Meet.Days"}
                                onChange={(selected, name) =>
                                  handleSelectMultiChange(index, selected, name)
                                }
                              /> */}
                              <MultiSelectComp
                                options={dayOptions}
                                name="MeetingDays"
                                value={row.MeetingDays}
                                label={t("Meet.Days")}
                                onChange={(name, selected) =>
                                  handleSelectMultiChange(index, selected, name)
                                }
                              />
                              {/* {(!row.MeetingDays || row.MeetingDays.length === 0) && (
                                <span className="error-message">
                                  {errors?.MeetingDays}
                                </span>
                              )} */}
                            </div>
                          </td>
                        </>
                      )}

                    <td className="text-center" data-title={t("Action")}>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={addRow}
                      >
                        +
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        disabled={FormData.FunnelDetail.length === 1}
                        onClick={() => deleteRow(index)}
                      >
                        −
                      </button>
                    </td>
                    {/* commons  ends*/}
                  </tr>
                );
              })}
            </tbody>
          </Tables>
        </Accordion>
        <Accordion
          defaultValue={true}
          title={t("Sales Excecutive Observations")}
        >
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={ProposedAssociation}
                name="ProposedAssociationName"
                placeholderName={"Processed Type of association with medanta"}
                id="ProposedAssociationName"
                lable={t("Processed Type")}
                value={FormData?.Funnel[0]?.ProposedAssociationId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.ProposedAssociationName === "" && (
                <span className="error-message">
                  {errors?.ProposedAssociationName}
                </span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={InterestLevel}
                name="InterestLevelName"
                placeholderName={"Expected Interest Level"}
                id="InterestLevelName"
                lable={t("Interest Level")}
                value={FormData?.Funnel[0]?.InterestLevelId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.InterestLevelName === "" && (
                <span className="error-message">
                  {errors?.InterestLevelName}
                </span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={expectedCallOptions}
                name="NoOfExpectedCalls"
                id="NoOfExpectedCalls"
                placeholderName={"No. of expected calls/Mon"}
                lable={t("No. of expected calls/Mon")}
                value={FormData?.Funnel[0]?.NoOfExpectedCalls}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.NoOfExpectedCalls === "" && (
                <span className="error-message">
                  {errors?.NoOfExpectedCalls}
                </span>
              )}
            </div>
            <div className="col-sm-2">
              <Input
                className="required-fields"
                type="number"
                name="ExpectedBusinessForecast"
                id="ExpectedBusinessForecast"
                lable={t("Expected Business forcast")}
                placeholder=" "
                onChange={handleChange}
                value={FormData?.Funnel[0]?.ExpectedBusinessForecast}
              />
              {FormData?.Funnel[0]?.ExpectedBusinessForecast === "" && (
                <span className="error-message">
                  {errors?.ExpectedBusinessForecast}
                </span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={ExpectedCalls}
                name="ExpectedCategoryName"
                placeholderName={"Expected category"}
                id="ExpectedCategoryName"
                lable={t("Expected Category")}
                value={FormData?.Funnel[0]?.ExpectedCategoryId}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.ExpectedCategoryId === "" && (
                <span className="error-message">
                  {errors?.ExpectedCategoryName}
                </span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={SubExpectedCalls}
                name="ExpectedSubCategoryName"
                placeholderName={"Expected sub-category"}
                id="ExpectedSubCategoryName"
                lable={t("Expected Sub Category")}
                value={FormData?.Funnel[0]?.ExpectedSubCategoryName}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.ExpectedSubCategoryName === "" && (
                <span className="error-message">
                  {errors?.ExpectedSubCategoryName}
                </span>
              )}
            </div>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={leadTypeOptions}
                name="LeadType"
                placeholderName={"lead type"}
                id="LeadType"
                lable={t("Lead Type")}
                value={FormData?.Funnel[0]?.LeadType}
                onChange={handleSelectChange}
              />
              {FormData?.Funnel[0]?.LeadType === "" && (
                <span className="error-message">{errors?.LeadType}</span>
              )}
            </div>
            <div className="col-sm-2">
              <Input
                type="text"
                name="Latitude"
                id="Latitude"
                lable={t("Longitude")}
                placeholder=" "
                onChange={handleChange2}
                value={FormData?.Latitude}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="text"
                name="Longitude"
                id="Longitude"
                lable={t("Latitude")}
                placeholder=" "
                onChange={handleChange2}
                value={FormData?.Longitude}
              />
            </div>
            <div className="col-sm-2">
              <ReactSelect
                autoSelectFirst={true}
                className="required-fields"
                dynamicOptions={BindFor}
                name="CreatedForName"
                placeholderName={"Created for"}
                id="CreatedForName"
                lable={t("Created for")}
                value={FormData?.CreatedFor}
                onChange={handleSelectChange2}
              />
              {FormData?.CreatedFor === "" && (
                <span className="error-message">{errors?.CreatedFor}</span>
              )}
            </div>

            <div className="col-sm-2 mt-1 d-flex">
              <div className="mt-1">
                <input
                  type="radio"
                  name="SaveLatLong"
                  id="SaveLatLong_Client"
                  value="1"
                  checked={FormData.SaveLatLong === "1"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      SaveLatLong: e.target.value,
                    }))
                  }
                />
              </div>
              <label htmlFor="SaveLatLong_Client" className="col-sm-10 ml-2">
                {t("Client location")}
              </label>
            </div>

            <div className="col-sm-2 mt-1 d-flex">
              <div className="mt-1">
                <input
                  type="radio"
                  name="SaveLatLong"
                  id="SaveLatLong_Other"
                  value="0"
                  checked={FormData.SaveLatLong === "0"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      SaveLatLong: e.target.value,
                    }))
                  }
                />
              </div>
              <label htmlFor="SaveLatLong_Other" className="col-sm-10 ml-2">
                {t("Other location")}
              </label>
            </div>
          </div>
          <div className="row p-2">
            <div className="col-sm-1">
              {load ? (
                <Loading />
              ) : (
                // <button
                //   className="btn btn-success btn-sm btn-block"
                //   onClick={HandleSaveFunnelData}
                // >
                //   {state?.other?.button ? t(state?.other?.button) : t("Save")}
                // </button>
                <SaveButton
                  text={t(state?.other?.button ? state?.other?.button : "Save")}
                  onClick={HandleSaveFunnelData}
                />
              )}
            </div>
            <div className="col-sm-2">
              <Link
                to="/funnel-list"
                style={{ fontSize: "13px", marginLeft: "10px" }}
              >
                {t("Back to List")}
              </Link>
            </div>
          </div>
        </Accordion>
      </Accordion>
      {/* import excel modal */}
      <Dialog
        header={
    <div className="d-flex align-items-center" style={{ gap: "12px" }}>
      <span>{t("Imported Excel Data")}</span>

      {bulkImportSaving ? (
        <span className="spinner-border spinner-border-sm" style={{ color: "#0dfd8d" }} />
      ) : (
         <SaveButton
                  text={t("Save")}
                  onClick={handleBulkImportSave}
                  className="mr-3"
                  style={{
                    background: "#0d6efd",
                    borderColor: "#0d6efd",
                    color: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                />
      )}
    </div>
  }
        className={theme}
        visible={showImportModal}
        style={{ width: isMobile ? "95vw" : "85vw" }}
        onHide={() => {
          setShowImportModal(false);
          setImportedExcelData([]);
        }}
        
        modal
      >
        {(() => {
          const excelColumns =
            importedExcelData.length > 0 ? Object.keys(importedExcelData[0]) : [];

          // Filter out ID columns (like TypeId, CentreId) for display, except EmailId
          const filteredExcelColumns = excelColumns.filter((col) => {
            const normalized = normalizeKey(col);
            return !((normalized.endsWith('id') && normalized !== 'emailid') || normalized === 'id');
          });

          // Anything recognized as a Business Detail field goes in that table;
          // everything else (matched Funnel fields + any unrecognized column)
          // falls back into the Funnel table so no imported column is ever dropped.
          const funnelDetailColumns = filteredExcelColumns.filter((col) =>
            FUNNEL_DETAIL_FIELD_SET.has(normalizeKey(col))
          );
          const funnelColumns = filteredExcelColumns.filter(
            (col) => !FUNNEL_DETAIL_FIELD_SET.has(normalizeKey(col))
          );

          return (
            <div>
              {funnelColumns.length > 0 && (
                <div className="mb-3">
                
                  <Tables className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th className="text-nowrap px-3">{t("Sr.No.")}</th>
                        {funnelColumns.map((col, index) => (
                          <th key={index} className="text-nowrap px-3">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importedExcelData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="text-nowrap px-3">{rowIndex + 1}</td>
                          {funnelColumns.map((col, colIndex) => {
                            const val = row[col];
                            const normalized = normalizeKey(col);
                            const isDateColumn = normalized.includes("birthday") || normalized.includes("anniversary");
                            const displayVal = (isDateColumn && val && moment(val).isValid()) 
                                               ? moment(val).format("DD-MMM-YYYY") 
                                               : val;
                            return (
                              <td key={colIndex} data-title={col} className="text-nowrap px-3">
                                {displayVal}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              )}

              {/* {funnelDetailColumns.length > 0 && (
                <div>
                  <h6>{t("Business Details")}</h6>
                  <Tables className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th>{t("Sr.No.")}</th>
                        {funnelDetailColumns.map((col, index) => (
                          <th key={index}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importedExcelData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td>{rowIndex + 1}</td>
                          {funnelDetailColumns.map((col, colIndex) => (
                            <td key={colIndex} data-title={col}>
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              )} */}
            </div>
          );
        })()}
      </Dialog>
    </>
  );
};

export default Funnel;
