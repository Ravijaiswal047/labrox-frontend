import React, { useCallback, useEffect } from "react";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Loading from "../../components/loader/Loading";
import axios from "axios";
import { toast } from "react-toastify";
import PhelboImage from "./../HomeCollection/PlaceholderImage.jpg";
import Reload from "./../HomeCollection//Reload.jpg";
import { Image } from "react-bootstrap";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import moment from "moment";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Accordion from "@app/components/UI/Accordion";
import { PhelbotomistValidationSchema } from "../../utils/Schema";
import { InputText } from "primereact/inputtext";
import {
  PhelboSearchTypes,
  Phelboweekoff,
  Phelborecordoptions,
  PhelboSources,
  PhelbosearchDefault,
} from "../../utils/Constants";

import {
  number,
  AllowCharactersNumbersAndSpecialChars,
  PreventSpecialCharacterandNumber,
  PreventSpecialCharacter,
  PreventNumber,
  PreventCharacter,
} from "../../utils/helpers";
import { Link } from "react-router-dom";
import { BindEmployeeReports } from "../../utils/NetworkApi/commonApi";
import ReactSelect from "../../components/formComponent/ReactSelect";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../components/Filter/FilterInput";
import { CustomButton, EditButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { Form, Modal } from "react-bootstrap";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import PheleboUploadedImgModal from "./PheleboUploadedImgModal";

const PhelebotomistRegisteration = () => {
  const [errors, setErros] = useState({});
  const localData = useLocalStorage("userData", "get");
  const [showViewModal, setShowViewModal] = useState({
    show: false,
    id: null,
  });

  const { t } = useTranslation();
  const [employeeList, setEmployeeList] = useState([]);
  const [formData, setFormData] = useState({
    Name: "",
    IsActive: true,
    Age: new Date(2000, 0, 1),
    Gender: "",
    Mobile: "",
    Other_Contact: "",
    Email: "",
    FatherName: "",
    MotherName: "",
    P_Address: "",
    BloodGroup: "",
    Qualification: "",
    Vehicle_Num: "",
    DrivingLicence: "",
    PanNo: "",
    DocumentType: "",
    DocumentNo: "",
    JoiningDate: new Date(),
    DeviceID: "",
    UserName: "",
    Password: "",
    PhelboSource: "",
    WeakOff: "",
    LoginTime: "08:00",
    LogoutTime: "18:00",
    BusinessZoneId: "",
    StateId: "",
    CityId: "",
    P_Pincode: "",
    P_City: "",
    EmployeeID: "",
    IsPassword: true,
  });
  const [PhelboCharges, setPhelboCHarges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [DocumentType, setDocumentType] = useState([]);
  const [searchData, setSearchData] = useState(PhelbosearchDefault);
  const [regions, setRegions] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState([]);
  const [BloodType, setBloodType] = useState([]);
  const [phlebochargedata, setphlebochargedata] = useState([]);
  const [selectCharge, setSelectcharge] = useState({
    ChargeName: "",
    ChargeId: "",
    ChargeAmount: "",
    Fromdate: new Date(),
    Todate: new Date(new Date().getTime() + 86400000),
  });
  const [PhleboTable, setPhleboTable] = useState([]);
  const [masterTable, setMasterTable] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const isEditMode = !!formData?.PhelebotomistId;
  const isPasswordEnabled = !isEditMode || formData?.IsPassword;

  const colorsCodingData = [
    { color: "#90EE90", id: "8", labelKey: "Active" },
    { color: "#ffe58f", id: "7", labelKey: "Inactive" },
  ];
  const PhlebotomistID = PhleboTable?.find(
    (item) => item.PhlebotomistID
  );
  console.log("PhlebotomistID", PhlebotomistID)

  // const DocumentTypes=[{
  //     label:'Pan Card',value:'Pan Card'
  //     },{label:'Aadhaar Card',value:'Aadhaar Card'},{label:'Voter Id',value:'Voter Id'}]

  console.log(DocumentType);
  useEffect(() => {
    BindEmployeeReports(setEmployeeList);
    getRegions();
  }, []);

  const getRegions = () => {
    axiosInstance
      .get("LocationMaster/GetZone")
      .then((res) => {
        const regions = res.data.message.map((region) => ({
          label: region.BusinessZoneName,
          value: region.BusinessZoneID,
        }));

        setRegions(regions);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };

  const fetchCities = (id) => {
    const postdata = {
      StateId: Array.isArray(id) ? id : [Number(id)],
    };

    axios
      .post("api/v1/CommonHC/GetCityData", postdata)
      .then((res) => {
        let data = res.data.message;

        let value = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.City,
          };
        });

        setCities(value);
      })
      .catch((err) => {
        toast.error("Something Went wrong");
      });
  };
  const fetchStates = (BusinesszoneId) => {
    axios
      .post("api/v1/CommonHC/GetStateData", {
        BusinessZoneID: BusinesszoneId,
      })
      .then((res) => {
        let data = res.data.message;

        let value = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.State,
          };
        });
        setStates(value);
      })
      .catch((err) => {
        toast.error("Something went wrong");
      });
  };

  const dateSelect = (date, name, value) => {
    if (name === "Fromdate" || name === "Todate") {
      if (name === "Fromdate") {
        setSelectcharge({
          ...selectCharge,
          [name]: date,
          Todate: new Date(date.getTime() + 86400000),
        });
      } else {
        setSelectcharge({ ...selectCharge, [name]: date });
      }
    } else {
      setFormData({
        ...formData,
        [name]: date,
      });
    }
  };
  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;

    if (
      name === "Name" ||
      name === "FatherName" ||
      name === "MotherName" ||
      name === "P_City"
    ) {
      setFormData({
        ...formData,
        [name]: PreventSpecialCharacterandNumber(value)
          ? value
          : formData[name],
      });
    } else if (name == "Mobile" || name == "Other_Contact") {
      setFormData({ ...formData, [name]: `${value}` });
    } else if (name == "P_Pincode") {
      if (value.length <= 6) {
        setFormData({ ...formData, [name]: `${value}` });
      }
    } else if (name === "PanNo" || name === "DocumentNo") {
      if (name === "DocumentNo") {
        if (formData?.DocumentType == "56") {
          if (value.length <= 10) {
            setFormData({
              ...formData,
              [name]: PreventSpecialCharacter(value) ? value : formData[name],
            });
          }
        } else if (formData?.DocumentType == "90") {
          if (value.length <= 12) {
            setFormData({
              ...formData,
              [name]: PreventCharacter(value) ? value : formData[name],
            });
          }
        } else {
          setFormData({
            ...formData,
            [name]: PreventSpecialCharacter(value) ? value : formData[name],
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: PreventSpecialCharacter(value) ? value : formData[name],
        });
      }
    } else if (name === "LogoutTime") {
      if (value > formData?.LoginTime) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === "UserName") {
      setFormData({
        ...formData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : formData[name],
      });
    } else if (name === "LoginTime") {
      if (value < formData?.LogoutTime) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === "Vehicle_Num") {
      setFormData({
        ...formData,
        [name]: PreventSpecialCharacter(value) ? value : formData[name],
      });
    } else if (name === "DocumentType") {
      if (value != "") {
        setFormData({
          ...formData,
          [name]: value,
          DocumentNo: "",
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
          DocumentNo: "",
        });
      }
    } else if (name === "Qualification") {
      setFormData({
        ...formData,
        [name]: PreventSpecialCharacter(value) ? value : formData[name],
      });
    } else if (name === "DrivingLicence") {
      setFormData({
        ...formData,
        [name]: PreventSpecialCharacter(value) ? value : formData[name],
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setPhleboTable(masterTable);
      return;
    }

    const searchableKeys = [
      "PhlebotomistID",
      "NAME",
      "UserName",
      "Age",
      "Gender",
      "Mobile",
      "Email",
      "Qualification",
      "DeviceID",
      "PhelboSource",
    ];

    const filtered = masterTable?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setPhleboTable(filtered);
  };

  const handleReactSelectChange = (name, event) => {
    const { value, label } = event;

    if (name === "DocumentType") {
      if (value != "") {
        setFormData({
          ...formData,
          [name]: value?.toString(),
          DocumentNo: "",
        });
      } else {
        setFormData({
          ...formData,
          [name]: value?.toString(),
          DocumentNo: "",
        });
      }
    } else if (name === "BusinessZoneId") {
      setFormData({
        ...formData,
        [name]: value,
      });
      fetchStates(value);

    }
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const getGenderFromTitle = (title) => {
    const t = title?.toLowerCase();
    if (t.includes("mr") && !t.includes("mrs")) return "Male";
    if (t.includes("mrs") || t.includes("ms") || t.includes("miss")) return "Female";
    if (t.includes("dr.(mr)")) return "Male";
    if (t.includes("dr.(mrs)") || t.includes("dr.(miss)")) return "Female";
    if (t.includes("Other") || t.includes("Baby") || t.includes("Canine")) return "Other";
    return "";
  };
  useEffect(() => {
    if (formData?.EmployeeID && !formData?.PhelebotomistId) {
      getAutoselectData();
    }
  }, [formData?.EmployeeID, formData?.PhelebotomistId]);

  // useEffect(() => {

  //   getAutoselectData();

  // }, []);

  const getAutoselectData = () => {
    const payload = {
      EmployeeID: formData?.EmployeeID,
    };

    axiosInstance
      .post("Employee/getEmployeeDetailsByID", payload)
      .then((res) => {
        if (res.status === 200 && res?.data?.message?.length > 0) {
          const data = res.data.message[0];

          setFormData((prev) => ({
            ...prev,
            Name: data?.Name || "",
            IsActive: data?.isActive === 1,
            Age: data?.DOB
              ? moment(data.DOB, "DD-MM-YYYY").toDate()
              : prev.Age,
            Gender: getGenderFromTitle(data?.Title),
            Mobile: data?.Mobile || "",
            Other_Contact: "",
            Email: data?.Email || "",
            FatherName: "",
            MotherName: "",
            P_Address: "",
            P_City: data?.PCity || data?.City || "",
            P_Pincode: data?.PPincode || "",
            BloodGroup: "",
            Qualification: "",
            Vehicle_Num: "",
            DrivingLicence: "",
            PanNo: "",
            DocumentType: "",
            DocumentNo: "",
            JoiningDate: new Date(),
            DeviceID: "",
            UserName: "",
            // Password: data?.Password || "",
            PhelboSource: "",
            WeakOff: "",
            BusinessZoneId: data?.CentreID || "",
            StateId: "",
            CityId: "",
            EmployeeID: data?.EmployeeID || prev.EmployeeID,
            IsPassword: false,
          }));
        }
      })
      .catch((err) => { });
  };

  const handleInputSearchChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name === "SearchValue") {
      if (searchData?.SearchType == "Mobile") {
        if (value.length <= 10) {
          setSearchData({
            ...searchData,
            [name]: PreventCharacter(value) ? value : searchData[name],
          });
        }
      } else if (searchData?.SearchType == "Name") {
        setSearchData({
          ...searchData,
          [name]: PreventSpecialCharacterandNumber(value)
            ? value
            : searchData[name],
        });
      } else if (searchData?.SearchType == "PanNo.") {
        if (value.length <= 10) {
          setSearchData({
            ...searchData,
            [name]: PreventSpecialCharacter(value) ? value : searchData[name],
          });
        }
      } else {
        setSearchData({ ...searchData, [name]: value });
      }
    }

  }

  const handleSearchChange = (name, event) => {
    const { value } = event;
    if (name === "SearchState") {
      fetchCities(value);
      setSearchData({ ...searchData, [name]: value?.toString(), SearchCity: "" });
    } else {
      if (name === "NoOfRecord") {
        searchDataHandler(value);
        setSearchData({ ...searchData, [name]: Number(value) });
      }
      else if (name === "SearchType") {
        setSearchData({ ...searchData, [name]: value, SearchValue: "" });
        setPhleboTable([]);
        setMasterTable([]);
      }
      else if (name === "SearchGender") {
        setSearchData({ ...searchData, [name]: value?.toString() });
      } else if (name === "SearchBusinessZone") {
        setSearchData({ ...searchData, [name]: value?.toString() });
        fetchStates(value);
      } else if (name === "SearchState") {
        setSearchData({ ...searchData, [name]: value?.toString() });
        fetchCities(value);
      }
      else {
        setSearchData({ ...searchData, [name]: value });
      }
    }
  };

  const formdataSaveHandler = () => {
    const generatedError = PhelbotomistValidationSchema(formData);
    console.log(generatedError);
    if (generatedError === "") {
      setLoading(true);

      const businessZoneName = regions.find((item) => item.value === formData?.BusinessZoneId)?.label;

      const updatedFormData = {
        ...formData,
        IsActive: formData?.IsActive ? 1 : 0,
        JoiningDate: moment(formData?.JoiningDate).format("DD-MMM-YYYY"),
        Age: moment(formData?.Age).format("DD-MMM-YYYY"),
        NAME: formData?.Name.trim(),
        P_Address: formData?.P_Address ? formData?.P_Address.trim() : "",
        P_City: formData?.P_City ? formData?.P_City.trim() : "",
        Email: formData?.Email.trim(),
        FatherName: formData?.FatherName ? formData?.FatherName.trim() : "",
        MotherName: formData?.MotherName ? formData?.MotherName.trim() : "",
        Qualification: formData?.Qualification.trim(),
        Vehicle_Num: formData?.Vehicle_Num ? formData?.Vehicle_Num.trim() : "",
        DrivingLicence: formData?.DrivingLicence.trim(),
        PanNo: formData?.PanNo ? formData?.PanNo.trim() : "",
        DucumentNo: formData?.DocumentNo ? formData?.DocumentNo.trim() : "",
        DucumentType: formData?.DocumentType ? formData?.DocumentType?.toString() : "",
        UserName: formData?.UserName.trim(),
        Password: formData?.Password.trim(),
        EmployeeID: formData?.EmployeeID ? Number(formData.EmployeeID) : null,
        businessZoneId: formData?.BusinessZoneId,
        BusinessZoneName: businessZoneName,
      };
      delete updatedFormData["DocumentNo"];
      delete updatedFormData["DocumentType"];

      // phlebochargedata.forEach(object => {
      //     delete object['ChargeName'];
      // })

      const fullData = {
        obj: updatedFormData,
        phlebochargedata: [],
      };

      axiosInstance
        .post("PhelebotomistMaster/SavePhelebotomist", fullData)
        .then((res) => {
          if (res.data.success) {
            setLoading(false);

            setFormData({
              Name: "",
              IsActive: true,
              Age: new Date(2000, 0, 1),
              Gender: "",
              Mobile: "",
              Other_Contact: "",
              Email: "",
              FatherName: "",
              MotherName: "",
              P_Address: "",
              BloodGroup: "",
              Qualification: "",
              Vehicle_Num: "",
              DrivingLicence: "",
              PanNo: "",
              DocumentType: "",
              DocumentNo: "",
              JoiningDate: new Date(),
              DeviceID: "",
              UserName: "",
              Password: "",
              IsPassword: true,
              PhelboSource: "",
              WeakOff: "",
              LoginTime: "08:00",
              LogoutTime: "18:00",
              StateId: "",
              CityId: "",
              P_City: "",
              P_Pincode: "",
            });
            setphlebochargedata([]);
            setPhleboTable([]);
            setMasterTable([]);
            toast.success("Saved successfully");
            searchDataHandler(searchData?.NoOfRecord);
          } else {
            toast.error(res?.data?.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          toast.error(
            err?.response?.data.message
              ? err?.response?.data.message
              : "Something Went wrong",
          );
        });

      setLoading(false);
    }
    setLoading(false);
    setErros(generatedError);
  };
  const searchDataHandler = (value) => {
    if (searchData?.SearchType && searchData?.SearchValue) {
      axiosInstance
        .post("PhelebotomistMaster/SearchPhlebotomist", {
          ...searchData,
          BusinessZoneId: searchData?.SearchBusinessZone || 0,
          NoOfRecord: Number(value),
        })
        .then((res) => {
          if (res?.data?.success && Array.isArray(res.data.message)) {
            setPhleboTable(res.data.message);
            setMasterTable(res.data.message);
          } else {
            setPhleboTable([]);
            setMasterTable([]);
            toast.error(res?.data?.message || "No record found");
          }
        })
        .catch((err) => {
          toast.error(
            err?.data?.message ? err?.data?.message : "Something Went wrong",
          );
        });
    } else if (searchData?.SearchType != "" && searchData?.SearchValue == "") {
      toast.error("Enter Search Value");
    } else if (searchData?.SearchValue != "" && searchData?.SearchType == "") {
      toast.error("Select Search Type");
    } else {
      axiosInstance
        .post("PhelebotomistMaster/SearchPhlebotomist", {
          ...searchData,
          NoOfRecord: Number(value),
        })
        .then((res) => {
          if (res?.data?.success && Array.isArray(res.data.message)) {
            setPhleboTable(res.data.message);
            setMasterTable(res.data.message);
          } else {
            toast.error(res?.data?.message || "No record found");
            setPhleboTable([]);
            setMasterTable([]);
          }
        })
        .catch((err) => {
          toast.error(
            err?.data?.message ? err?.data?.message : "Something Went wrong",
          );
          setPhleboTable([]);
          setMasterTable([]);
        });
    }
  };

  const genderOptions = [
    { value: "", label: "Gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

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
        const extractedGenders = value
          ?.filter((option) => option?.label != "Both")
          .map((option) => {
            return {
              value: option?.value,
              label: option?.label,
            };
          });

        extractedGenders.unshift({ label: "Gender", value: "" });

        setGender(extractedGenders);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went wrong");
      });
  };

  const getRequiredAttachment = () => {
    axios
      .post("/api/v1/Global/GetGlobalData", {
        Type: "RequiredAttachment",
      })
      .then((res) => {
        let data = res.data.message;

        let RequiredAttachment = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        setDocumentType(RequiredAttachment);
      })
      .catch((err) => console.log(err));
  };
  const getBloodType = () => {
    axios
      .get("api/v1/CommonHC/GetBloodGroupData")
      .then((res) => {
        let data = res.data.message;

        let value = data.map((ele) => {
          return {
            value: ele.BloodGroupName,
            label: ele.BloodGroupName,
          };
        });

        setBloodType(value);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };
  const getAmount = (str) => {
    const newStr = str.replaceAll(" ", "");
    let parts = newStr.split("@");
    return parts[1];
  };
  const getPhleboChargeData = () => {
    axios
      .get("/api/v1/PhelebotomistMaster/GetChargeData")
      .then((res) => {
        let data = res.data.message;

        let value = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.Charge,
            amount: getAmount(ele.Charge),
          };
        });
        setPhelboCHarges(value);
      })
      .catch((err) => {
        toast.error("Something went wrong");
      });
  };
  // const chargeChangeHandler = (event) => {

  //     const { name, value } = event?.target

  //     if (name === 'ChargeName') {
  //         if (value) {

  //             const { Name, Amount } = getNameAmountofCharge(value);
  //             setSelectcharge({
  //                 ...selectCharge,
  //                 ChargeId: `${value}`,
  //                 ChargeName: Name,
  //                 ChargeAmount: Amount
  //             })
  //         }

  //     }
  // }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const getNameAmountofCharge = (id) => {
    if (id) {
      const ele = PhelboCharges.filter((item) => {
        return item.value == id;
      });

      let parts = ele[0].label.split("@");

      return { Name: parts[0], Amount: ele[0].amount };
    }
  };
  const handleSelectMultiChange = (select, name) => {
    if (name === "StateId") {
      console.log(select);
      const val = select.map((ele) => {
        return ele?.value;
      });
      console.log(val);
      setFormData({ ...formData, [name]: val, CityId: "" });
      if (val.length > 0) {
        fetchCities(val);
      } else {
        setFormData({ ...formData, StateId: "", CityId: "" });
        setCities([]);
      }
    } else if (name === "CityId") {
      const val = select?.map((ele) => ele?.value);
      if (val.length > 0) {
        setFormData({ ...formData, [name]: val });
      } else {
        setFormData({ ...formData, CityId: "" });
      }
    }
  };
  const addPhelboChargeHandler = () => {
    if (
      selectCharge?.ChargeId &&
      selectCharge?.ChargeAmount &&
      selectCharge?.ChargeName &&
      selectCharge?.Fromdate &&
      selectCharge?.Todate
    ) {
      const chargeData = {
        ChargeID: `${selectCharge?.ChargeId.toString()}`,
        ChargeAmount: selectCharge?.ChargeAmount,
        ChargeName: selectCharge?.ChargeName,
        FromDate: selectCharge?.Fromdate
          ? moment(selectCharge?.Fromdate).format("DD-MMM-YYYY")
          : new Date(),
        ToDate: selectCharge?.Todate
          ? moment(selectCharge?.Todate).format("DD-MMM-YYYY")
          : new Date(),
      };
      const id = chargeData?.ChargeID;
      if (phlebochargedata.length > 0) {
        let isobjectExist = phlebochargedata.some((obj) => {
          if (obj?.ChargeID == id) {
            return true;
          }
          return false;
        });
        if (isobjectExist) {
          toast.warn("Charge Already Added");
        } else {
          setphlebochargedata([...phlebochargedata, chargeData]);
        }
      } else {
        setphlebochargedata([...phlebochargedata, chargeData]);
      }
      setSelectcharge({
        ChargeName: "",
        ChargeId: "",
        ChargeAmount: "",
        Fromdate: new Date(),
        Todate: new Date(new Date().getTime() + 86400000),
      });
    }
  };
  const removeCharge = (id) => {
    const updateList = phlebochargedata.filter((item) => {
      return item.ChargeID !== id;
    });

    setphlebochargedata(updateList);
  };

  const getStatecity = (name, details) => {
    if (name == "state") {
      let states = [];
      for (let i of details) {
        if (!states.includes(i.StateId)) {
          states.push(`${i.StateId}`);
        }
      }
      return states;
    } else {
      let cities = [];
      for (let i of details) {
        if (!cities.includes(i.CityId)) {
          cities.push(i.CityId);
        }
      }
      return cities;
    }
  };
  useEffect(() => {
    if (formData?.BusinessZoneId) {
      fetchStates(formData.BusinessZoneId);
    }
  }, [formData?.BusinessZoneId]);

  useEffect(() => {
    if (formData?.StateId?.length > 0) {
      fetchCities(formData.StateId);
    }
  }, [formData?.StateId]);

  const editDetailsHandler = (rowData) => {
    console.log(rowData, "rowData");
    axiosInstance
      .post("PhelebotomistMaster/EditPhlebotomist", {
        Phlebotomist: rowData?.PhlebotomistID,
      })
      .then((res) => {
        console.log("Res", res);
        const details = res?.data?.message;
        console.log(details);
        const details2 = {
          PhelebotomistId: details[0]?.PhlebotomistID || "",
          Name: details[0]?.NAME || "",
          IsActive: details[0]?.IsActive === 1 ? true : false,
          Age: details[0]?.Age
            ? new Date(details[0]?.Age)
            : new Date(2000, 0, 1),

          Gender: details[0]?.Gender || "",
          Mobile: details[0]?.Mobile || "",

          Other_Contact: details[0]?.Other_Contact || "",
          Email: details[0]?.Email || "",
          FatherName: details[0]?.FatherName || "",
          MotherName: details[0]?.MotherName || "",
          P_Pincode: details[0]?.P_Pincode ? details[0]?.P_Pincode : "",
          P_City: details[0]?.P_City ? details[0]?.P_City : "",
          P_Address: details[0]?.P_Address || "",
          BloodGroup: details[0]?.BloodGroup || "",
          Qualification: details[0]?.Qualification || "",
          Vehicle_Num: details[0]?.Vehicle_Num || "",
          DrivingLicence: details[0]?.DrivingLicence || "",
          PanNo: details[0]?.PanNo || "",
          DocumentType: details[0]?.DocumentType || "",
          DocumentNo: details[0]?.DocumentNo || "",
          JoiningDate: details[0]?.JoiningDate
            ? new Date(details[0]?.JoiningDate)
            : new Date(),

          DeviceID: details[0].DeviceID || "",
          UserName: details[0].UserName || "",
          Password: details[0].PASSWORD || "",
          PhelboSource: details[0]?.PhelboSource || "",
          WeakOff: details[0]?.WeakOff || "",
          LoginTime: details[0]?.LoginTime,
          LogoutTime: details[0]?.LogoutTime,
          StateId: getStatecity("state", details) || [],
          CityId: getStatecity("city", details) || [],
          BusinessZoneId: rowData?.BusinesszoneId || "",
          EmployeeID: details[0]?.EmployeeId || "",
          //BusinessZoneId: rowData?.BusinesszoneId || "",
        };
        console.log("details2", details2);
        setFormData(details2);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went wrong");
      });
    axiosInstance
      .post("PhelebotomistMaster/BindChData", { PhlebotomistID: rowData?.PhlebotomistID })
      .then((res) => {
        console.log("Res", res);
        const details = res.data.message;

        const PhleboChargedetails = details.map((ele) => {
          return {
            ChargeName: ele.ChargeName,
            ChargeID: ele.ChargeID.toString(),
            ChargeAmount: ele.ChargeAmount,
            FromDate: ele.fromdate,
            ToDate: ele.todate,
          };
        });

        setphlebochargedata(PhleboChargedetails);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went wrong");
      });

    window.scroll(0, 0);
  };

  const formdataUpdateHandler = () => {
    // const generatedError = PhelbotomistValidationSchema(formData);
    const generatedError = "";
    console.log(generatedError);
    if (generatedError === "") {
      setLoading(true);

      const businessZoneName = regions.find((item) => item.value == formData?.BusinessZoneId)?.label;

      const updatedFormData = {
        ...formData,

        IsActive: formData?.IsActive ? 1 : 0,
        JoiningDate: moment(formData?.JoiningDate).format("DD-MMM-YYYY"),
        Age: moment(formData?.Age).format("DD-MMM-YYYY"),
        NAME: formData?.Name.trim(),
        DucumentType: formData?.DocumentType?.toString(),
        DucumentNo: formData?.DocumentNo ? formData?.DocumentNo : "",
        P_Address: formData?.P_Address ? formData?.P_Address.trim() : "",
        P_City: formData?.P_City ? formData?.P_City.trim() : "",
        Email: formData?.Email.trim(),
        FatherName: formData?.FatherName ? formData?.FatherName.trim() : "",
        MotherName: formData?.MotherName ? formData?.MotherName.trim() : "",
        Qualification: formData?.Qualification.trim(),
        Vehicle_Num: formData?.Vehicle_Num ? formData?.Vehicle_Num.trim() : "",
        DrivingLicence: formData?.DrivingLicence.trim(),
        PanNo: formData?.PanNo ? formData?.PanNo.trim() : "",
        UserName: formData?.UserName.trim(),
        //Password: formData?.Password.trim(),
        BusinessZoneId: formData?.BusinessZoneId || 0,
        BusinessZoneName: businessZoneName,
        isPassword: formData?.IsPassword,
      };
      delete updatedFormData["DocumentNo"];
      delete updatedFormData["DocumentType"];
      const fullData = {
        obj: updatedFormData,
        phlebochargedata: [],
      };

      axiosInstance
        .post("PhelebotomistMaster/UpdatePhlebotomist", fullData)
        .then((res) => {
          if (res.data.message) {
            setLoading(false);

            setFormData({
              Name: "",
              IsActive: true,
              Age: new Date(2000, 0, 1),
              Gender: "",
              Mobile: "",
              Other_Contact: "",
              Email: "",
              FatherName: "",
              MotherName: "",
              P_Address: "",
              BloodGroup: "",
              Qualification: "",
              Vehicle_Num: "",
              DrivingLicence: "",
              PanNo: "",
              DocumentType: "",
              DocumentNo: "",
              JoiningDate: new Date(),
              DeviceID: "",
              UserName: "",
              Password: "",
              IsPassword: true,
              PhelboSource: "",
              WeakOff: "",
              LoginTime: "08:00",
              LogoutTime: "18:00",
              StateId: "",
              CityId: "",
              P_City: "",
              P_Pincode: "",
            });
            setphlebochargedata([]);
            setPhleboTable([]);
            setMasterTable([]);

            toast.success("Updated successfully");
            searchDataHandler(searchData?.NoOfRecord);
          }
        })
        .catch((err) => {
          console.log(err, "error");
          setLoading(false);
          toast.error(
            err?.response?.data.message
              ? err?.response?.data.message
              : "Something Went wrong",
          );
        });
    }

    setLoading(false);
    setErros(generatedError);
  };

  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const statusCounts = PhleboTable?.reduce(
    (acc, curr) => {
      if (String(curr.IsActive) === "1") {
        acc.active += 1;
      } else {
        acc.deactive += 1;
      }
      return acc;
    },
    { active: 0, deactive: 0 }
  );

  useEffect(() => {
    getDropDownData("Gender");
    getRequiredAttachment();
    getBloodType();
    // fetchStates();
    getPhleboChargeData();
  }, []);

  console.log("PhleboTable", PhleboTable);
  console.log("formData", formData);

  const hideModal = () => {
    setShowViewModal({ show: false, id: null });
  }

  return (
    <>
      <PheleboUploadedImgModal
        show={showViewModal.show}
        id={showViewModal.id}
        onHide={hideModal} />

      <Accordion
        name={t("Phlebotomist Registeration")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-md-11">
            <div className="row">
              <div className="col-sm-2">
                <Input
                  lable="Name"
                  id="Name"
                  placeholder=" "
                  className="required-fields"
                  name="Name"
                  onChange={handleSelectChange}
                  value={formData?.Name}
                  max={30}
                />
                {formData?.Name.trim() === "" && (
                  <span className="error-message">{errors?.Name}</span>
                )}
                {formData?.Name.trim().length > 0 &&
                  formData?.Name.trim().length < 3 && (
                    <span className="error-message">{errors?.NameLength}</span>
                  )}
              </div>

              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar required-fields"
                  name="Age"
                  placeholder=" "
                  id="Age"
                  lable="Date Of Birth"
                  onChange={dateSelect}
                  value={formData?.Age}
                  maxDate={new Date()}
                />
                {formData?.Age === "" && (
                  <span className="error-message">{errors?.Age}</span>
                )}
              </div>

              <div className="col-sm-1">

                {/* <SelectBox
                  name="Gender"
                  className="required-fields"
                  id="Gender"
                  lable="Gender"
                  options={gender}
                  onChange={handleSelectChange}
                  selectedValue={formData?.Gender}
                /> */}

                <ReactSelect
                  dynamicOptions={genderOptions}
                  name="Gender"
                  id="Gender"
                  lable="Gender"
                  removeIsClearable={true}
                  placeholderName={t("Gender")}
                  value={formData?.Gender}
                  onChange={handleReactSelectChange}
                />
                {formData?.Gender === "" && (
                  <span className="error-message">{errors?.Gender}</span>
                )}
              </div>
              {/* <div className="col-sm-1 mt-2">
                <input
                  type="checkbox"
                  name="IsActive"
                  checked={formData.IsActive}
                  onChange={handleSelectChange}
                />
                &nbsp;&nbsp;
                <label className="control-label">IsActive</label>
              </div> */}

              <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                gap: "5px"
              }}>
                <label class="switch mb-0">
                  <input
                    type="checkbox"
                    checked={formData.IsActive}
                    onChange={() => handleToggle("IsActive")}
                  />
                  <span class="slider"></span>
                </label>
                <strong>
                  <span>{t("IsActive")}</span>
                </strong>
              </div>

              <div className="col-sm-2">
                <Input
                  id="Address"
                  lable="Address"
                  name="P_Address"
                  placeholder=" "
                  onChange={handleSelectChange}
                  value={formData?.P_Address}
                  max={30}
                />
                {formData?.P_Address.trim().length > 0 &&
                  formData?.P_Address?.trim().length < 3 && (
                    <span className="error-message">
                      {errors?.P_Addresslength}
                    </span>
                  )}
              </div>
              <div className="col-sm-2">
                <Input
                  placeholder=" "
                  id="City"
                  lable="City"
                  name="P_City"
                  onChange={handleSelectChange}
                  value={formData?.P_City}
                  max={15}
                />
                {formData?.P_City.trim().length > 0 &&
                  formData?.P_City?.length < 3 && (
                    <span className="error-message">
                      {errors?.P_Citylength}
                    </span>
                  )}
              </div>

              <div className="col-sm-2">
                <Input
                  type="number"
                  name="P_Pincode"
                  onInput={(e) => number(e, 6)}
                  placeholder=" "
                  id="Pincode"
                  lable="Pincode"
                  onChange={handleSelectChange}
                  value={formData?.P_Pincode}
                />
                {formData?.P_Pincode.length > 0 &&
                  formData?.P_Pincode?.length != 6 && (
                    <span className="error-message">
                      {errors?.PincodeLength}
                    </span>
                  )}
              </div>
            </div>

            <div className="row">
              <div className="col-sm-2">
                <Input
                  placeholder=" "
                  id="Mobile"
                  lable="Mobile"
                  className="required-fields
                  "
                  name="Mobile"
                  type="number"
                  onInput={(e) => number(e, 10)}
                  onChange={handleSelectChange}
                  value={formData?.Mobile}
                />
                {formData?.Mobile === "" && (
                  <span className="error-message">{errors?.Mobileempty}</span>
                )}
                {formData?.Mobile.length > 0 &&
                  formData?.Mobile.length !== 10 && (
                    <span className="error-message">
                      {errors?.Mobileinvalid}
                    </span>
                  )}
              </div>

              <div className="col-sm-2">
                <Input
                  name="Other_Contact"
                  placeholder=" "
                  id="Phone No"
                  lable="Phone No"
                  type="number"
                  onInput={(e) => number(e, 10)}
                  onChange={handleSelectChange}
                  value={formData?.Other_Contact}
                />
                {formData?.Other_Contact.length > 0 &&
                  formData?.Other_Contact.length !== 10 && (
                    <span className="error-message">
                      {errors?.OtherContact}
                    </span>
                  )}
              </div>
              <div className="col-sm-2">
                <Input
                  name="Email"
                  placeholder=" "
                  id="Email"
                  lable="Email"
                  type="email"
                  max={30}
                  className="required-fields"
                  onChange={handleSelectChange}
                  value={formData?.Email}
                />
                {formData?.Email.trim() === "" && (
                  <span className="error-message">{errors?.Emailempty}</span>
                )}
                {!emailRegex.test(formData?.Email) &&
                  formData?.Email.trim().length > 0 && (
                    <span className="error-message">{errors?.Emailvalid}</span>
                  )}
              </div>
              <div className="col-sm-2">
                {/* <SelectBox
                  name="BloodGroup"
                  placeholder=" "
                  id="BloodGroup"
                  lable="BloodGroup"
                  onChange={handleSelectChange}
                  selectedValue={formData?.BloodGroup}
                  options={[
                    { label: "Choose Blood Group", value: "" },
                    ...BloodType,
                  ]}
                /> */}

                <ReactSelect
                  dynamicOptions={[
                    { label: "Choose Blood Group", value: "" },
                    ...BloodType,
                  ]}
                  name="BloodGroup"
                  id="BloodGroup"
                  lable="BloodGroup"
                  removeIsClearable={true}
                  placeholderName={t("BloodGroup")}
                  value={formData?.BloodGroup}
                  onChange={handleReactSelectChange}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  placeholder=" "
                  id="FatherName"
                  lable="FatherName"
                  name="FatherName"
                  onChange={handleSelectChange}
                  value={formData?.FatherName}
                  max={30}
                />
                {formData?.FatherName.trim().length > 0 &&
                  formData?.FatherName?.trim().length < 3 && (
                    <span className="error-message">
                      {errors?.FatherNameLength}
                    </span>
                  )}
              </div>
              <div className="col-sm-2">
                <Input
                  name="MotherName"
                  placeholder=" "
                  id="MotherName"
                  lable="MotherName"
                  onChange={handleSelectChange}
                  value={formData?.MotherName}
                  max={30}
                />
                {formData?.MotherName.trim().length > 0 &&
                  formData?.MotherName?.trim().length < 3 && (
                    <span className="error-message">
                      {errors?.MotherNameLength}
                    </span>
                  )}
              </div>
            </div>
            <div className="row">
              <div className="col-sm-2">
                <Input
                  placeholder=" "
                  id="Qualification"
                  lable="Qualification"
                  name="Qualification"
                  onChange={handleSelectChange}
                  value={formData?.Qualification}
                  type="text"
                  max={30}
                />

                {formData?.Qualification.trim().length > 0 &&
                  formData?.Qualification?.trim().length < 2 && (
                    <span className="error-message">
                      {errors?.QualificationLength}
                    </span>
                  )}
              </div>
              <div className="col-sm-2">
                <Input
                  placeholder=" "
                  id="VehicleNum"
                  lable="Vehicle Number"
                  name="Vehicle_Num"
                  onChange={handleSelectChange}
                  value={formData?.Vehicle_Num}
                  type="text"
                  max={12}
                />
                {formData?.Vehicle_Num.trim().length > 0 &&
                  formData?.Vehicle_Num.trim().length < 5 && (
                    <span className="error-message">
                      {errors?.Vehicle_NumLength}
                    </span>
                  )}
              </div>
              <div className="col-sm-2">
                <Input
                  name="DrivingLicence"
                  placeholder=" "
                  id="DrivingLicence"
                  lable="DrivingLicence"
                  onChange={handleSelectChange}
                  value={formData?.DrivingLicence}
                  type="text"
                  max={16}
                />
                {/* Must stay in step with PhelbotomistValidationSchema, which
                    flags anything under 10. When this said 11 and the schema
                    said 11 but the message said 10, a 10-character licence was
                    rejected by both; if only one of the two is relaxed, this
                    renders an empty error span instead. */}
                {formData?.DrivingLicence.trim().length > 0 &&
                  formData?.DrivingLicence.trim().length < 10 && (
                    <span className="error-message">
                      {errors?.DrivingLicence_NumLength}
                    </span>
                  )}
              </div>
              <div className="col-sm-2">
                <Input
                  placeholder=" "
                  id="PanNo"
                  lable="PanNo"
                  name="PanNo"
                  /* No numeric filter here. A PAN is five letters, four digits
                     and a letter (ABCDE1234F), but number() strips everything
                     that is not a digit, so every letter was silently discarded
                     as it was typed. A real PAN came out as its four digits and
                     could never satisfy the "must be of 10 length" rule, and a
                     letters-only entry left the field empty, which is why no
                     validation message appeared at all. DocumentNo, which holds
                     a PAN when Document Type is PAN, is plain text for the same
                     reason. */
                  onChange={handleSelectChange}
                  value={formData?.PanNo}
                  max={10}
                />
                {formData?.PanNo.trim() != "" &&
                  formData?.PanNo?.trim().length != 10 && (
                    <span className="error-message">{errors?.PanLength}</span>
                  )}
              </div>
              <div className="col-sm-2">
                {/* <SelectBox
                  placeholder=" "
                  id="DocumentType"
                  className="required-fields"
                  lable="DocumentType"
                  name="DocumentType"
                  onChange={handleSelectChange}
                  options={[{ label: "Choose ID", value: "" }, ...DocumentType]}
                  selectedValue={formData?.DocumentType}
                /> */}

                <ReactSelect
                  dynamicOptions={[{ label: "Choose ID", value: "" }, ...DocumentType]}
                  id="DocumentType"
                  className="required-fields"
                  lable="DocumentType"
                  name="DocumentType"
                  removeIsClearable={true}
                  placeholderName={t("DocumentType")}
                  value={formData?.DocumentType}
                  onChange={handleReactSelectChange}
                />
                {formData?.DocumentType === "" && (
                  <span className="error-message">{errors?.DocumentType}</span>
                )}
              </div>
              <div className="col-sm-2">
                <Input
                  type="text"
                  name="DocumentNo"
                  placeholder=" "
                  id="DocumentNo"
                  lable="DocumentNo"
                  className="required-fields"
                  onChange={handleSelectChange}
                  value={formData?.DocumentNo}
                  max={20}
                />
                {formData?.DocumentNo.trim() === "" && (
                  <span className="error-message">{errors?.DocumentNo}</span>
                )}
                {/* Mirrors PhelbotomistValidationSchema: the generic minimum only
                    applies to document types that have no length of their own. */}
                {formData?.DocumentType != "90" &&
                  formData?.DocumentType != "56" &&
                  formData?.DocumentNo.trim().length > 0 &&
                  formData?.DocumentNo.trim().length <= 6 && (
                    <span className="error-message">
                      {errors?.DocumentNolength}
                    </span>
                  )}
                {/* The "> 6" gate that used to sit here is gone. It meant a short
                    Aadhaar or PAN produced its message in the schema but never
                    displayed it, so the user was told only that the document must be
                    "greater than 6" - a number that will be rejected again. */}
                {formData?.DocumentType == "90" &&
                  formData?.DocumentNo.trim().length > 0 &&
                  formData?.DocumentNo.trim().length != 12 && (
                    <span className="error-message">
                      {errors?.Aadharlength}
                    </span>
                  )}
                {formData?.DocumentType == "56" &&
                  formData?.DocumentNo.trim().length > 0 &&
                  formData?.DocumentNo.trim().length != 10 && (
                    <span className="error-message">{errors?.PanLength}</span>
                  )}
              </div>
            </div>
          </div>
          <div className="col-md-1">
            <div
              style={{
                border: "1px solid grey",
                borderRadius: "5px",
                textAlign: "center",
                width: "74%",
                height: "94%",

                marginLeft: "10px",
              }}
              className="p-1"
            >
              <img height={75} src={PhelboImage} style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion title="Work Area Detail" defaultValue={true}>
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar required-fields"
              name="JoiningDate"
              id="JoiningDate"
              lable="JoiningDate"
              placeholder=" "
              value={formData?.JoiningDate}
              // minDate={new Date()}
              onChange={dateSelect}
              maxDate={new Date()}
            // maxDate={
            //   new Date(
            //     formData?.JoiningDate.getFullYear(),
            //     formData?.JoiningDate.getMonth(),
            //     getLastDayOfMonth(
            //       formData?.JoiningDate.getFullYear(),
            //       formData?.JoiningDate.getMonth(),
            //     ),
            //   )
            // }
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Select Region", value: "" },
                ...regions,
              ]}
              name="BusinessZoneId"
              id="BusinessZoneId"
              lable="BusinessZone"
              removeIsClearable={true}
              placeholderName={t("BusinessZone")}
              value={formData?.BusinessZoneId}
              onChange={handleReactSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              name="StateId"
              onChange={handleSelectMultiChange}
              options={states}
              placeholder=" "
              lable="Select State"
              className="required-fields"
              id="StateId"
              value={formData?.StateId}
            />
            {formData?.StateId === "" && (
              <span className="error-message">{errors?.State}</span>
            )}
          </div>
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              name="CityId"
              placeholder=" "
              lable="Select City"
              id="City"
              className="required-fields"
              onChange={handleSelectMultiChange}
              value={formData?.CityId}
              options={cities}
            />
            {formData?.CityId === "" && (
              <span className="error-message">{errors?.City}</span>
            )}
          </div>

          <div className="col-sm-2">
            <InputText
              placeholder="Username"
              lable="UserName"
              id="UserName"
              className="required-fields"
              name="UserName"
              autoComplete="new-password"
              onChange={handleSelectChange}
              value={formData?.UserName}
              max={20}
            />
            {formData?.UserName.trim() === "" && (
              <span className="error-message">{errors?.UserName}</span>
            )}
            {formData?.UserName.trim().length > 0 &&
              formData?.UserName.trim().length <= 3 && (
                <span className="error-message">{errors?.UserNameL}</span>
              )}
          </div>

          <div className="col-sm-2">
            <div style={{ position: "relative" }}>
              <InputText
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="required-fields"
                name="Password"
                max={20}
                onChange={handleSelectChange}
                value={formData?.Password}
                placeholder="Password"
                lable="Password"
                id="Password"
                disabled={!isPasswordEnabled}
              />

              <button
                type="button"
                onClick={() => {
                  if (isPasswordEnabled) {
                    setShowPassword(!showPassword);
                  }
                }}
                disabled={!isPasswordEnabled}
                style={{
                  position: "absolute",
                  right: "0px",
                  top: "2px",
                  background: "none",
                  border: "none",
                  cursor: isPasswordEnabled ? "pointer" : "not-allowed",
                  color: "#6c757d",
                  zIndex: 10
                }}
              >
                <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
              </button>
            </div>

            {/* Validation */}
            {isPasswordEnabled && formData?.Password.trim() === "" && (
              <span className="error-message">{errors?.Password}</span>
            )}

            {isPasswordEnabled &&
              formData?.Password.trim().length > 0 &&
              !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(
                formData?.Password
              ) && (
                <span className="error-message">{errors?.Passwordl}</span>
              )}
          </div>

          {/* Toggle only in edit mode */}
          {formData?.PhelebotomistId && (
            <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
              gap: "5px"
            }}>
              <label class="switch mb-0">
                <input
                  type="checkbox"
                  checked={formData.IsPassword}
                  onChange={() => handleToggle("IsPassword")}
                />
                <span class="slider"></span>
              </label>
              <strong>
                <span>{t("ChangePassword")}</span>
              </strong>
            </div>
          )}
          <div className="col-sm-2">
            {/* <SelectBox
              placeholder=" "
              lable="PhelboSource"
              id="PhelboSource"
              className="required-fields"
              name="PhelboSource"
              onChange={handleSelectChange}
              options={[
                { label: "Select Phelbo", value: "" },
                ...PhelboSources,
              ]}
              selectedValue={formData?.PhelboSource}
            /> */}
            <ReactSelect
              dynamicOptions={[
                { label: "Select Phelbo", value: "" },
                ...PhelboSources,
              ]}
              lable="PhelboSource"
              id="PhelboSource"
              className="required-fields"
              name="PhelboSource"
              removeIsClearable={true}
              placeholderName={t("PhelboSource")}
              value={formData?.PhelboSource}
              onChange={handleReactSelectChange}
            />
            {formData?.PhelboSource === "" && (
              <span className="error-message">{errors?.PhelboSource}</span>
            )}
          </div>
          {/* </div>
        <div className="row px-2 mt-1 mb-1"> */}
          <div className="col-sm-2">
            {/* <SelectBox
              placeholder=" "
              lable="WeakOff"
              id="WeakOff"
              options={[
                { label: "Select Week off", value: "" },

                ...Phelboweekoff,
              ]}
              selectedValue={formData?.WeakOff}
              name="WeakOff"
              onChange={handleSelectChange}
            /> */}
            <ReactSelect
              dynamicOptions={[
                { label: "Select Week off", value: "" },

                ...Phelboweekoff,
              ]}
              lable="WeakOff"
              id="WeakOff"
              name="WeakOff"
              removeIsClearable={true}
              placeholderName={t("WeakOff")}
              value={formData?.WeakOff}
              onChange={handleReactSelectChange}
            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              lable="Employee Master"
              id="EmployeeID"
              name="EmployeeID"
              selectedValue={formData?.EmployeeID}
              options={[{ label: "Select", value: "" }, ...employeeList]}
              onChange={handleSelectChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select", value: "" }, ...employeeList]}
              lable="Employee Master"
              id="EmployeeID"
              name="EmployeeID"
              removeIsClearable={true}
              placeholderName={t("Employee Master")}
              isDisabled={formData?.PhelebotomistId}
              value={formData?.EmployeeID}
              onChange={handleReactSelectChange}
            />
          </div>
          <div className="col-sm-1">
            <Input
              type="time"
              name="LoginTime"
              placeholder=" "
              lable="LoginTime"
              id="LoginTime"
              className="required-fields"
              onChange={handleSelectChange}
              value={formData?.LoginTime}
            />
            {formData?.LoginTime === "" && (
              <span className="error-message">{errors?.LoginTime}</span>
            )}
          </div>
          <div className="col-sm-1">
            <Input
              className="required-fields"
              type="time"
              name="LogoutTime"
              placeholder=" "
              lable="LogoutTime"
              id="LogoutTime"
              onChange={handleSelectChange}
              value={formData?.LogoutTime}
              min="08:00"
            />
            {formData?.LogoutTime === "" && (
              <span className="error-message">{errors?.LogoutTime}</span>
            )}
          </div>
          <div className="col-sm-1">
            <Input
              placeholder=" "
              lable="DeviceID"
              id="DeviceID"
              name="DeviceID"
              onChange={handleSelectChange}
              value={formData?.DeviceID}
            // disabled={true}
            />
          </div>

        </div>
        <div className="row p-2">
          <div className="col-sm-auto">
            <Image src={Reload} />
          </div>
          {loading ? (
            <div className="col-sm-1">
              <Loading />
            </div>
          ) : (
            <div className="col-sm-auto col-xs-12">
              {formData?.PhelebotomistId ? (
                // <button
                //   type="button"
                //   className="btn btn-block btn-success btn-sm"

                //   onClick={formdataUpdateHandler}
                // >
                //   {t("Update")}
                // </button>
                <EditButton
                  text={t("Update")}
                  onClick={formdataUpdateHandler}
                />
              ) : (
                // <button
                //   type="button"
                //   className="btn btn-block btn-success btn-sm"
                //   onClick={formdataSaveHandler}
                // >
                //   {t("Save")}
                // </button>
                <SaveButton
                  text={t("Save")}
                  onClick={formdataSaveHandler}
                />
              )}
            </div>
          )}
          <div className="col-sm-1">
            <CustomButton
              text={"Reset"}
              icon={"refresh"}
              onClick={() => {
                setFormData({
                  Name: "",
                  IsActive: true,
                  Age: new Date(2000, 0, 1),
                  Gender: "",
                  Mobile: "",
                  Other_Contact: "",
                  Email: "",
                  FatherName: "",
                  MotherName: "",
                  P_Address: "",
                  BloodGroup: "",
                  Qualification: "",
                  Vehicle_Num: "",
                  DrivingLicence: "",
                  PanNo: "",
                  DocumentType: "",
                  DocumentNo: "",
                  JoiningDate: new Date(),
                  DeviceID: "",
                  UserName: "",
                  Password: "",
                  IsPassword: true,
                  PhelboSource: "",
                  WeakOff: "",
                  LoginTime: "08:00",
                  LogoutTime: "18:00",
                  StateId: "",
                  CityId: "",
                  P_Pincode: "",
                  P_City: "",
                  EmployeeID: ""
                });
                setErros({});
              }}
            />
          </div>
        </div>
      </Accordion>
      <Accordion
        title="Search Detail"
        defaultValue={true}
        notOpen={true}
        seconTitle={
          <>
            {colorsCodingData.map(({ color, labelKey, id }) => {
              const count =
                labelKey === "Active"
                  ? statusCounts?.active
                  : statusCounts?.deactive;

              return (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={`${t(labelKey)}: ${count}`}
                />
              );
            })}
            <div className="mt-2">
              <Input
                className=""
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleChangeSearch}
              />
            </div>
          </>
        }
      >
        {/* <div className="col-sm-12 d-flex justify-content-end gap-custom p-0 mt-2">
          <FilterInput
            value={searchTerm}
            onChange={handleChangeSearch}
            placeholder="Filter Table"
            inputClass="transparent-background"
          />
        </div> */}
        <div className="row pt-2 pl-2 pr-2 ">
          <div className="col-sm-2">
            {/* <SelectBox
              lable="No.Of Records"
              id="Records"
              options={Phelborecordoptions}
              name="NoOfRecord"
              selectedValue={searchData?.NoOfRecord}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={Phelborecordoptions}
              lable="No.Of Records"
              id="Records"
              name="NoOfRecord"
              removeIsClearable={true}
              placeholderName={t("No.Of Records")}
              value={searchData?.NoOfRecord}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Select Region", value: "" },
                ...regions,
              ]}
              name="SearchBusinessZone"
              id="SearchBusinessZone"
              lable="BusinessZone"
              removeIsClearable={true}
              placeholderName={t("BusinessZone")}
              value={searchData?.SearchBusinessZone}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              lable="Select State"
              id="Select State"
              name="SearchState"
              value={searchData?.SearchState}
              onChange={handleSearchChange}
              options={[{ label: "State", value: "" }, ...states]}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "State", value: "" }, ...states]}
              lable="Select State"
              id="Select State"
              name="SearchState"
              removeIsClearable={true}
              placeholderName={t("Select State")}
              value={searchData?.SearchState}
              onChange={handleSearchChange}
            />
          </div>

          <div className="col-sm-2">
            {/* <SelectBox
              lable="Select City"
              id="Select City"
              name="SearchCity"
              selectedValue={searchData?.SearchCity}
              options={[{ label: "City", value: "" }, ...cities]}
              onChange={handleSearchChange}
            /> */}

            <ReactSelect
              dynamicOptions={[{ label: "City", value: "" }, ...cities]}
              lable="Select City"
              id="Select City"
              name="SearchCity"
              removeIsClearable={true}
              placeholderName={t("Select City")}
              value={searchData?.SearchCity}
              onChange={handleSearchChange}
            />
          </div>

          <div className="col-sm-1">
            {/* <SelectBox
              lable="Select Gender"
              id="Select Gender"
              name="SearchGender"
              selectedValue={searchData?.SearchGender}
              onChange={handleSearchChange}
              options={[...gender]}
            /> */}
            <ReactSelect
              dynamicOptions={[...gender]}
              lable="Gender"
              id="Select Gender"
              name="SearchGender"
              removeIsClearable={true}
              placeholderName={t("Gender")}
              value={searchData?.SearchGender}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-sm-2">

            {/* <SelectBox
              name="SearchType"
              lable="SearchType"
              id="SearchType"
              onChange={handleSearchChange}
              options={[
                { label: "Select type", value: "" },
                ...PhelboSearchTypes,
              ]}
              selectedValue={searchData?.SearchType}
            /> */}

            <ReactSelect
              dynamicOptions={[
                { label: "Select type", value: "" },
                ...PhelboSearchTypes,
              ]}
              name="SearchType"
              lable="SearchType"
              id="SearchType"
              removeIsClearable={true}
              placeholderName={t("SearchType")}
              value={searchData?.SearchType}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              // options={}
              name="SearchValue"
              placeholder=" "
              id="SearchValue"
              lable="SearchValue"
              onChange={handleInputSearchChange}
              value={searchData.SearchValue}
              max={15}
            />
          </div>
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => {
                searchDataHandler(searchData?.NoOfRecord);
              }}
            />
          </div>
        </div>
        {PhleboTable.length > 0 && (
          <Tables>
            <thead className="cf text-center" style={{ zIndex: 99 }}>
              <tr>
                <th className="text-center" >{t("#")}</th>
                <th className="text-center" >{t("Select")}</th>
                <th className="text-center">{t("Phelebo Code")}</th>
                <th className="text-center">{t("Phelebo Name")}</th>
                <th className="text-center">{t("Username")}</th>
                <th className="text-center">{t("DOB")}</th>
                <th className="text-center">{t("Gender")}</th>
                <th className="text-center">{t("Mobile")}</th>
                <th className="text-center">{t("Email")}</th>
                <th className="text-center">{t("Qualification")}</th>
                <th className="text-center">{t("Device Id")}</th>
                <th className="text-center">{t("Phelebo Source")}</th>
                <th className="text-center" style={{ width: "4%" }}>{t("View Uploads")}</th>
                {/* <th className="text-center">{t("Active")}</th> */}
              </tr>
            </thead>

            <tbody>
              {PhleboTable.map((ele, index) => {

                const statusColor = colorsCodingData.find(
                  ({ labelKey }) => labelKey === (ele.IsActive == "1" ? "Active" : "Deactive")
                )?.color;

                return (
                  <>
                    <tr key={index}
                      style={{
                        backgroundColor: statusColor || "transparent", backgroundImage: 'none',
                      }}
                    >
                      <td data-title="#" className="text-center">
                        {index + 1} &nbsp;
                      </td>
                      <td data-title="Select" className="text-center" >
                        <Link
                          // className="bg-primary"
                          onClick={async () => {
                            editDetailsHandler(ele);
                          }}

                        >
                          Edit
                        </Link>
                        &nbsp;
                      </td>
                      <td data-title="Phlebo Code" className="text-center">
                        {ele.PhlebotomistID} &nbsp;
                      </td>
                      <td data-title="Phelebo Name" className="text-center">
                        {ele.NAME} &nbsp;
                      </td>
                      <td data-title="Username" className="text-center">
                        {ele.UserName} &nbsp;
                      </td>
                      <td data-title="DOB" className="text-center">
                        {ele.Age} &nbsp;
                      </td>
                      <td data-title="Gender" className="text-center">
                        {ele.Gender}&nbsp;
                      </td>
                      <td data-title="Mobile" className="text-center">
                        {ele.Mobile}&nbsp;
                      </td>
                      <td data-title="Email" className="text-center">
                        {ele.Email}&nbsp;
                      </td>
                      <td data-title="Qualification" className="text-center">
                        {ele.Qualification}&nbsp;
                      </td>
                      <td data-title="Device Id" className="text-center">
                        {ele.DeviceID}&nbsp;
                      </td>
                      <td data-title="Phelbo Source" className="text-center">
                        {ele.PhelboSource}&nbsp;
                      </td>
                      <td className="text-center">
                        <i className="btnAdd" onClick={() => setShowViewModal({
                          show: true,
                          id: ele.PhlebotomistID
                        })}
                        >
                          <i className="fa fa-search" aria-hidden="true"></i>
                        </i>
                      </td>
                    </tr>
                  </>
                )
              }
              )}
            </tbody>
          </Tables>
        )}
      </Accordion>
    </>
  );
};

export default PhelebotomistRegisteration;
