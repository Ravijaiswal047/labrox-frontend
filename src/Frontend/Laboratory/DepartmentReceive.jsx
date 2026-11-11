import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  autocompleteOnBlur,
  getTrimmedData,
  number,
  shouldIncludeAIIMSID,
  isChecked,
} from "../../utils/helpers";
import {
  DepartmentWiseItemList,
  getCollectionBoy,
  getDoctorSuggestion,
  getPaymentModes,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import {
  defaultSearchTypes,
  SearchBy,
  stateIniti,
} from "../../utils/Constants";
import { axiosInstance } from "../../utils/axiosInstance";

import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import moment from "moment";
import MedicialModal from "../utils/MedicialModal";
import Heading from "../../components/UI/Heading";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import CustomModal from "../utils/CustomModal";
import Tooltip from "../../components/formComponent/Tooltip";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DepartmentReceiveTable from "../Table/DepartmentReceiveTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { usePageControls } from "../../utils/hooks/usePageControls";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import Pagination from "../../Pagination/Pagination";
import "./PatientRegistration.css";
import Urgent from ".././Images/urgent.gif";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import RejectModal from "../utils/RejectModal";

const DepartmentReceive = () => {
  const [t] = useTranslation();
  const pathname = useLocation()?.pathname;
  const { isActive } = usePageControls(pathname);
    const [rateTypeLoading, setRateTypeLoading] = useState(false);
  

  const [CentreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [toggleDate, setToggleDate] = useState({
    FromDate: false,
    ToDate: false,
  });
  const [drdata, setDrData] = useState([]);
  const [searchstatus, setSearchStatus] = useState(2);
  const [saveTestId, setSaveTestId] = useState([]);
  const [load, setLoad] = useState(false);
  const [Identity, setIdentity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [moreErrors, setMoreErrors] = useState({});
  const [state, setState] = useState(stateIniti);
  const [collecteddataexist, SetCollectedDataExist] = useState([]);
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
    ID: 0,
  });

  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [organ, setOrgan] = useState([]);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [dropFalse, setDropFalse] = useState(true);
  const [pageType, setpageType] = useState("");
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const today = new Date();
  const CompanyCode = useLocalStorage("userData", "get")?.CompanyCode;
  const [collectionBoy, setCollectionBoy] = useState();
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [selects, setSelects] = useState(false);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [defaultCentrePrefix, setDefaultCentrePrefix] = useState("");
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: defaultSearchTypes || "",
    RefundFilter: null,
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    DoctorReferal: "",
    DepartmentID: "",
    DoctorName: "",
    SampleStatus: 2,
    TestName: "",
    InvestigationID: 0,
  });

  const [accessNavLink, setAccessNavLink] = useState([]);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { ShowDefaultLoginCentre, AllowSRAModule, DefaultCurrencyName, IsPaginationOnTop } = useLocalStorage("userData", "get");
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const [uniqueTestCount, setUniqueTestCount] = useState(0);
  const [totalPatient, setTotalPatient] = useState(0);
  const [rejectPayload, setRejectPayload] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const PAGE_ID = "4";
  const handleListSearchNew = (data, name) => {
    switch (name) {
      case "TestName":
        setFormData({
          ...formData,
          [name]: data.TestName,
          InvestigationID: data?.InvestigationID,
          Package: "",
        });
        setSelects(false);
        // setTestIndex(0);
        setIndexMatch(0);
        setTestSuggestion([]);
        break;

      default:
        break;
    }
  };
   const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
  const handleIndex = (e) => {
    switch (e.which) {
      case 38:
        if (doctorSuggestion.length > 0) {
          if (indexMatch !== 0) {
            setIndexMatch(indexMatch - 1);
          } else {
            setIndexMatch(doctorSuggestion.length - 1);
          }
          setTimeout(() => {
            const el = document.querySelector(".matchIndex");
            if (el) el.scrollIntoView({ block: "nearest" });
          }, 0);
        }
        break;

      case 40:
        if (doctorSuggestion.length > 0) {
          if (doctorSuggestion.length - 1 === indexMatch) {
            setIndexMatch(0);
          } else {
            setIndexMatch(indexMatch + 1);
          }
          setTimeout(() => {
            const el = document.querySelector(".matchIndex");
            if (el) el.scrollIntoView({ block: "nearest" });
          }, 0);
        }
        break;

      case 13:
        if (doctorSuggestion.length > 0 && doctorSuggestion[indexMatch]) {
          handleListSearch(doctorSuggestion[indexMatch], "DoctorName");
        }
        setIndexMatch(-1);
        break;

      default:
        break;
    }
  };

  const handleTestIndex = (e, index) => {
    const { name } = e.target;
    switch (name) {
      case "TestName":
        switch (e.which) {
          case 38:
            if (TestSuggestion.length > 0) {
              if (indexMatch !== 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(TestSuggestion.length - 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 40:
            if (TestSuggestion.length > 0) {
              if (TestSuggestion.length - 1 === indexMatch) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 13:
            if (TestSuggestion.length > 0 && TestSuggestion[indexMatch]) {
              handleListSearchNew(TestSuggestion[indexMatch], name);
            }
            setIndexMatch(-1);
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  };

  // const totalPatient = () => {
  //   const visitNos = drdata?.map((item) => item?.VisitNo);
  //   const uniqueVisitNos = new Set(visitNos);
  //   return uniqueVisitNos?.size;
  // };

  const handleListSearch = (data, name) => {
    switch (name) {
      case "DoctorName":
        setFormData({
          ...formData,
          [name]: data?.Name,
          DoctorReferal: data?.Name ? data?.DoctorReferalID : "",
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;
      default:
        break;
    }
  };

  const handleRejectPayload = (e, index, data) => {
    const { checked } = e.target;
    if (checked) {
      if (data) {
        setDrData((prev) => {
          const val = [...prev];
          val[index]["isReject"] = true;
          return val;
        });
        setRejectPayload((prev) => {
          const exists = prev.some((ele) => ele.TestID === data.TestID);
          if (exists) return prev;
          return [...prev, data];
        });
      } else {
        const val = drdata.map((ele) => {
          if (ele.Approved === 0 && ele.Status !== 4 && ele.Status !== 5) {
            return {
              ...ele,
              isReject: true,
            };
          }
          return ele;
        });
        setDrData(val);
        const rejectable = val.filter(
          (ele) =>
            ele.isReject &&
            ele.Approved === 0 &&
            ele.Status !== 4 &&
            ele.Status !== 5,
        );
        setRejectPayload(rejectable);
      }
    } else {
      if (data) {
        setDrData((prev) => {
          const val = [...prev];
          val[index]["isReject"] = false;
          return val;
        });
        setRejectPayload((prev) =>
          prev.filter((ele) => ele.TestID !== data.TestID),
        );
      } else {
        const val = drdata.map((ele) => {
          return {
            ...ele,
            isReject: false,
          };
        });
        setDrData(val);
        setRejectPayload([]);
      }
    }
  };

  const validation = () => {
    let error = "";
    if (
      formData?.SelectTypes.trim() !== "" &&
      formData?.ItemValue.trim() === ""
    ) {
      error = { ...error, ItemValue: t("Please Choose Value") };
    }
    if (formData.SelectTypes === "Mobile") {
      if (formData?.SelectTypes !== "" && formData?.ItemValue === "") {
        error = { ...error, ItemValue: t("This Field is Required") };
      } else if (formData.ItemValue.length !== 10) {
        error = { ...error, ItemValue: t("Invalid Mobile Number") };
      }
    }

    return error;
  };

  const handleToggle = (name) => {
    setToggleDate({ ...toggleDate, [name]: !toggleDate[name] });
  };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSearchSelectChange = (label, value, id) => {
    if (label === "CentreID") {
      setFormData({ ...formData, [label]: value?.value, RateTypeID: "" });
      setRateTypes([]);
      if (value?.value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value), true);
      } else {
        fetchRateTypes([value?.value], true);
      }
    } else {
      setFormData({ ...formData, [label]: value?.value });
    }
    setTimeout(() => focusNextById(id), 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "SelectTypes") {
      setFormData({
        ...formData,
        [name]: value,
        ItemValue: value === "PatientCode" ? defaultCentrePrefix : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTestChange = (e) => {
    const { name, value } = e.target;

    console.log("e.target", e.target, value);

    if (name === "TestName") {
      if (value === "") {
        setSelects(false);
        setTestSuggestion([]);
        setFormData({ ...formData, TestName: "", InvestigationID: 0 });
      } else {
        setSelects(true);
        setTestSuggestion((prev) =>
          prev.filter((ele) =>
            ele.TestName?.toLowerCase().includes(value.toLowerCase()),
          ),
        );
        setFormData({
          ...formData,
          TestName: value,
          InvestigationID: 0,
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBarcodeReceive = (e) => {
    const keypress = [9, 13];
    if (keypress.includes(e.which)) {
      DirectReceivedByBarcode();
    }
  };

  const handleBarcodeNo = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
    if (value?.trim()) {
      setFormData((prev) => ({
        ...prev,
        SelectTypes: "BarcodeNo",
        ItemValue: value.trim(),
      }));
    } else if (formData?.SelectTypes === "BarcodeNo") {
      setFormData((prev) => ({
        ...prev,
        ItemValue: "",
      }));
    }
  };

  const DirectReceivedByBarcode = () => {
    const trimmedBarcode = (state.BarcodeNo || "").trim();
    if (trimmedBarcode.length > 0) {
      const isAlreadyReceivedInUi = drdata.some(
        (ele) => (ele.BarcodeNo === trimmedBarcode || ele.SinNo === trimmedBarcode) && Number(ele.Status) >= 3
      );
      if (isAlreadyReceivedInUi) {
        toast.error("This Barcode already receive");
        setState({ ...state, BarcodeNo: "" });
        return;
      }

      setLoading(true);
      axiosInstance
        .post("DepartmentReceive/SampleReceiveBarcode", {
          BarcodeNo: trimmedBarcode,
          FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
          FromTime: formData.FromTime,
          ToTime: formData.ToTime,
        })
        .then((res) => {
          if (res?.data?.success && Array.isArray(res?.data?.data)) {
            setDrData(res?.data?.data);
            setState({ ...state, BarcodeNo: "" });
            setLoad(true);
            toast.success("Barcode Received Successfully", "success");
          } else {
            setState({ ...state, BarcodeNo: "" });
            setLoad(false);
            toast.error(res?.data?.message || "This Barcode already receive");
          }
        })
        .catch((err) => console.log(err))
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };

  const handleResetFilters = () => {
    const selectedCentre = (ShowDefaultLoginCentre === "1" || DefaultCentre) ? DefaultCentre || "" : "";
    setFormData({
      FromDate: new Date(),
      ToDate: new Date(),
      CentreID: selectedCentre,
      ItemValue: "",
      RateTypeID: "",
      SelectTypes: defaultSearchTypes || "",
      RefundFilter: null,
      FromTime: "00:00:00",
      ToTime: "23:59:59",
      DoctorReferal: "",
      DepartmentID: "",
      DoctorName: "",
      SampleStatus: 2,
      TestName: "",
      InvestigationID: 0,
    });
    setState(stateIniti);
    setCollectionBoy();
    setCurrentPage(1);
    setDrData([]);
    setTotalCount(0);
    setUniqueTestCount(0);
    setTotalPatient(0);
    setLoad(false);
    setErrors({});
    if (selectedCentre) {
      fetchRateTypes([selectedCentre], true);
    } else {
      fetchRateTypes(CentreData.map((ele) => ele.value), true);
    }
  };

  const getDepartment = () => {
    axiosInstance
      .get("/Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        setDepartmentData(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  const SaveSampleReceiveDepartment = () => {
    if (isSubmitting) return;

    const UpdateData = drdata?.filter((ele) =>
      ele?.IsChecked == 1 ? true : false,
    );
    const SaveData = UpdateData.map((item) => ({
      ...item,
      HistoCytoSampleDetail: `${item?.Container}^${item?.Slide}^${item?.Block}^`,
    }));
    if (UpdateData?.length > 0) {
      const allAlreadyReceived = UpdateData.every(
        (item) => Number(item?.Status) >= 3
      );
      if (allAlreadyReceived) {
        toast.error("This Barcode already receive");
        return;
      }

      setIsSubmitting(true);
      axiosInstance
        .post("/DepartmentReceive/SampleReceiveDepartment", {
          data: SaveData,
        })
        .then((res) => {
          if (res.data?.success) {
            toast.success(res.data.message);
            TableData("2");
            setFormData({ ...formData, ItemValue: "" });
          } else {
            toast.error(res.data?.message || "This Barcode already receive");
          }
        })
        .catch((err) => {
          if (err.response?.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response?.status === 401) {
            toast.error(err.response.data.message);
          }
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      toast.error("Please select atlease one item to continue");
    }
  };

  const SaveSampleTransferDepartment = () => {
    const UpdateData = drdata?.filter((ele) =>
      ele?.IsChecked == 1 ? true : false,
    );

    const saveData = {
      TestID: UpdateData?.map((item) => String(item?.TestID)),
    };

    if (UpdateData?.length > 0) {
      axiosInstance
        .post("/DepartmentReceive/SaveTransferData", saveData.TestID)
        .then((res) => {
          toast.success(res.data.message);
          TableData("2");
        })
        .catch((err) => {
          if (err.response.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response.status === 401) {
            toast.error(err.response.data.message);
          }
        });
    } else {
      toast.error("Please select atlease one item to continue");
    }
  };

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    if (formData?.DoctorName === "") {
      setDropFalse(true);
    }
  }, [formData?.DoctorName]);

  useEffect(() => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        const centres = res?.data?.message || [];
        // use whichever centre is currently selected globally (top-nav
        // centre switcher), not a centre flagged as the org-wide default
        const selectedCentre = centres.find(
          (c) => String(c?.CentreID) === String(DefaultCentre),
        );
        setDefaultCentrePrefix(selectedCentre?.Prefix || "");
      })
      .catch((err) => console.log(err));
  }, [DefaultCentre]);

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData(2);
    }
  };

  const TableData = (status, page = "", size = pageSize) => {
    setpageType(status);
    setSearchStatus(status);
    setLoading(true);

    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });

    // UHID search auto-fills ItemValue with just the centre's prefix (e.g. "APC") so
    // the user can type the rest of the code. If they search without typing anything
    // past that prefix, don't send it as a filter — it isn't a real UHID.
    const isUhidPrefixOnly =
      formData?.SelectTypes === "PatientCode" &&
      formData?.ItemValue?.trim() === defaultCentrePrefix?.trim();

    const effectiveBarcode = state?.BarcodeNo?.trim();
    let effectiveSelectTypes = isUhidPrefixOnly ? "" : formData.SelectTypes;
    let effectiveItemValue = isUhidPrefixOnly ? "" : formData.ItemValue?.trim() || "";

    if (!effectiveItemValue && effectiveBarcode) {
      effectiveSelectTypes = "BarcodeNo";
      effectiveItemValue = effectiveBarcode;
    }

    axiosInstance
      .post(
        "/DepartmentReceive/DepartmentReceive",
        getTrimmedData({
          CentreID: formData.CentreID ? [Number(formData.CentreID)] : [],
          SelectTypes: effectiveSelectTypes,
          ItemValue: effectiveItemValue,
          RateTypeID: formData?.RateTypeID
            ? [Number(formData?.RateTypeID)]
            : [],
          CollectionBoyID: Number(collectionBoy || 0),
          DoctorReferal: formData.DoctorReferal,
          FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
          FromTime: formData.FromTime,
          ToTime: formData.ToTime,
          DepartmentID: formData.DepartmentID
            ? [Number(formData.DepartmentID)]
            : [],
          SampleStatus: status,
          pageNumber: page || 1,
          pageSize: Number(size),
          testId: Number(formData?.InvestigationID) || 0,
        }),
      )
      .then((res) => {
        if (Array?.isArray(res?.data?.message)) {
          const responseData = res.data.message;
          setUniqueTestCount(responseData.length);
          setTotalPatient(res?.data?.data?.patientCount || 0);

          const data = responseData?.map((ele) => {
            return {
              ...ele,
              IsChecked: 0,
              Container:
                ele?.HistoCytoSampleDetail == ""
                  ? "0"
                  : ele?.HistoCytoSampleDetail?.split("^")?.[0],
              Slide:
                ele?.HistoCytoSampleDetail == ""
                  ? "0"
                  : ele?.HistoCytoSampleDetail?.split("^")?.[1],
              Block:
                ele?.HistoCytoSampleDetail == ""
                  ? "0"
                  : ele?.HistoCytoSampleDetail?.split("^")?.[2],
            };
          });
          setDrData(data);
          SetCollectedDataExist(res?.data?.message.some((v) => v.Status === 2));
          setTotalCount(res?.data?.data?.totalRecords || 0);
        } else {
          setDrData([]);
          SetCollectedDataExist(false);
        }
        setLoad(true);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  // const SaveSampleReceiveDepartment = () => {
  //   const UpdateData = drdata?.filter((ele) =>
  //     ele?.IsChecked == 1 ? true : false
  //   );
  //   const SaveData = UpdateData.map((item) => ({
  //     ...item,
  //     HistoCytoSampleDetail: `${item?.Container}^${item?.Slide}^${item?.Block}^`,
  //   }));
  //   if (UpdateData?.length > 0) {
  //     axiosInstance
  //       .post("/DepartmentReceive/SampleReceiveDepartment", {
  //         data: SaveData,
  //       })
  //       .then((res) => {
  //         toast.success(res.data.message);
  //         TableData("2");
  //       })
  //       .catch((err) => {
  //         if (err.response.status === 504) {
  //           toast.error(t("Something Went Wrong"));
  //         }
  //         if (err.response.status === 401) {
  //           toast.error(err.response.data.message);
  //         }
  //       });
  //   } else {
  //     toast.error("Please select atlease one item to continue");
  //   }
  // };

  const handleUploadCount = (name, value, secondName) => {
    let data = [...drdata];
    if (name === "UploadDocumentCount") {
      data[show?.index][name] = value;
      data[show?.index][secondName] = value === 0 ? 0 : 1;
      setDrData(data);
    } else {
      data[show4?.index][name] = value;
      data[show4?.index][secondName] = value === 0 ? 0 : 1;
      setDrData(data);
    }
  };

  const handleReactSelectChange = (name, option, id) => {
    setCollectionBoy(option?.value);
    setTimeout(() => focusNextById(id), 0);
  };

  // ============= API CALLS =============
  const getAccessCentres = () => {
    axiosInstance
      .post("Centre/BindCentreWorkOrder", {
        centreID: 0,
        rateTypeID: 0,
      })
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.value,
            label: ele.label,
          };
        });
        let allValues = CentreDataValue.map((ele) => ele.value);
        setCentreData(CentreDataValue);
        if (ShowDefaultLoginCentre === "1" || DefaultCentre) {
          const selectedCentre = DefaultCentre || data?.[0]?.DefaultCentreId;
          setFormData((prev) => ({ ...prev, CentreID: selectedCentre }));
          fetchRateTypes(selectedCentre ? [selectedCentre] : allValues, true);
        } else {
          fetchRateTypes(allValues, true);
        }
      })
      .catch((err) => console.log(err));
  };

  // const getDepartment = () => {
  //   axiosInstance
  //     .get("/Department/getDepartment")
  //     .then((res) => {
  //       let data = res.data.message;
  //       let DeptDataValue = data.map((ele) => {
  //         return {
  //           value: ele.DepartmentID,
  //           label: ele.Department,
  //         };
  //       });
  //       setDepartmentData(DeptDataValue);
  //     })
  //     .catch((err) => console.log(err));
  // };

  const getOrgan = () => {
    axiosInstance
      .get("HistoCyto/BindStain")
      .then((res) => {
        let data = res?.data?.message;
        const Organ = data?.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.OrganName,
          };
        });
        Organ.unshift({ label: "Select Organ", value: "" });
        setOrgan(Organ);
      })
      .catch((err) => {
        setOrgan([]);
      });
  };

  const BindApprovalDoctor = () => {
    axiosInstance
      .get("CommonController/BindApprovalDoctor")
      .then((res) => {
        let data = res.data.message;
        let doctorData = data.map((ele) => {
          return {
            value: ele?.employeeid,
            label: ele?.name,
          };
        });
        doctorData.unshift({ label: "Select Doctor", value: "" });
        setDoctorAdmin(doctorData);
      })
      .catch((err) => console.log(err));
  };

  const fetchRateTypes = async (id, showLoader = false) => {
    if (showLoader) setRateTypeLoading(true);
    try {
      const res = await axiosInstance.post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: id.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      });
      const list = res?.data?.message.map((item) => {
        let label = item?.RateTypeName?.replace(/\r?\n/g, " ")?.trim() || "";
        label = label.replace(/^~+\s*/, "").trim();
        return {
          label: label,
          value: item?.RateTypeID,
        };
      });
      setRateTypes(list);
    } catch (err) {
      if (showLoader) setRateTypeLoading(false);
      console.log(err);
    } finally {
      if (showLoader) setRateTypeLoading(false);
    }
  };

  // ============= EFFECTS =============
  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    if (formData?.DoctorName === "") {
      setDropFalse(true);
    }
  }, [formData?.DoctorName]);

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    BindApprovalDoctor();
    getOrgan();
    getPaymentModes("RequiredAttachment", setIdentity);
    getCollectionBoy(setCollectionBoyList, true);
    controllerDynamic();
  }, []);
  // -------------------------------------

  const controllerDynamic = async () => {
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(PAGE_ID);
    setTabbingOrder(controllerTabbingOrder);
    setControllerDynamicList(controllersData);
    setTimeout(() => {
      try {
        const firstTabOrderField = Array.isArray(controllerTabbingOrder)
          ? controllerTabbingOrder.find((f) => f?.TabOrder === 1)
          : null;
        const targetId = firstTabOrderField?.ControlDisplayID || "Title";
        // const refKey = refMap[targetId];
        // if (refKey && refs[refKey]?.current) {
        //   refs[refKey].current.focus();
        // } else {
        // }
        const firstElement = document.getElementById(targetId);
        if (firstElement) {
          const input = firstElement.querySelector(
            "input, select, textarea, button",
          );
          if (input) input.focus();
          else firstElement.focus();
        }
      } catch (err) {
        console.error("autofocus error:", err);
      }
    }, 120);
  };

  const showAlways = (controlId) => {
    const showAlwaysList = [
      // "Centre Type",
    ];
    return showAlwaysList.includes(controlId);
  };

  const isHideController = (cntrId = "") => {
    if (showAlways(cntrId)) return true;
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

  const getFieldValue = (controlId) => {
    const fieldMap = {
      SelectTypes: formData.SelectTypes,
      ItemValue: formData.ItemValue,
      CentreID: formData.CentreID,
      RateTypeID: formData.RateTypeID,
      DepartmentID: formData.DepartmentID,
      DoctorName: formData.DoctorName,
      CollectionBoy: collectionBoy,
      BarcodeNo: state.BarcodeNo,
      FromDate: formData.FromDate,
      ToDate: formData.ToDate,
      FromTime: formData.FromTime,
      ToTime: formData.ToTime,
    };
    return fieldMap[controlId];
  };

  const ignoreValidation = (controlId) => {
    const ignoreList = ["FromTime", "ToTime", "DoctorName", "CollectionBoy"];
    return ignoreList.includes(controlId);
  };

  const validateMandatoryFields = () => {
    const errors = {};

    if (!controllerDynamicList || controllerDynamicList.length === 0) {
      return errors;
    }

    controllerDynamicList.forEach((item) => {
      if (item.IsMandatory == 1 && !ignoreValidation(item.ControlDisplayID)) {
        const fieldValue = getFieldValue(item.ControlDisplayID);
        if (!fieldValue || fieldValue.toString().trim() === "") {
          errors[item.ControlDisplayID] =
            `${item?.ControlDisplayName} is required`;
        }
      }
    });

    return errors;
  };

  const getTabbingOrderIds = Array.isArray(tabbingOrder)
    ? tabbingOrder.map((ele) => ele?.ControlDisplayID).filter(Boolean)
    : [];

  // focusOrder (static fields) — keep any existing tabbing ids first
  const baseFocusOrder = [...getTabbingOrderIds];

  // const getFocusOrder = () => {
  //   const barcodeIds = (
  //     Array.isArray(uniqueSampleTypesName) ? uniqueSampleTypesName : []
  //   )
  //     .filter((item) => item && String(item).toLowerCase().trim() !== "na")
  //     .map((_, idx) => `barcode-${ idx }`);

  //   const focusOrderWithBarcodes = insertBarcodeIds(baseFocusOrder, barcodeIds);
  //   const finalOrder = [...new Set(focusOrderWithBarcodes.filter(Boolean))];
  //   return [...finalOrder, "btnSave"];
  // };

  const getFocusOrder = () => {
    return [...baseFocusOrder, "btnSearch", "btnReset"];
  };

  const getTabIndex = (id) => {
    const focusOrder = getFocusOrder();
    const index = focusOrder.indexOf(id);
    return index !== -1 ? index + 1 : 0;
  };

  const focusNextById = (currentId, isReverse = false) => {
    const focusOrder = getFocusOrder();
    const currentIndex = focusOrder.indexOf(currentId);
    if (currentIndex === -1) return;

    const nextIndex = isReverse ? currentIndex - 1 : currentIndex + 1;
    const nextId = focusOrder[nextIndex];
    if (!nextId) return;

    const nextElement = document.getElementById(nextId);
    if (!nextElement) return;

    const input = nextElement.querySelector("input, select, textarea, button");

    (input || nextElement).focus();
  };

  const handleKeyDownTabbing = (e, currentId) => {
    if (e.key !== "Tab") return;

    e.preventDefault();
    focusNextById(currentId, e.shiftKey);
  };

  useEffect(() => {
    if (formData?.TestName.length > 2) {
      DepartmentWiseItemList(
        formData.DepartmentID,
        formData?.TestName,
        setTestSuggestion,
        true,
        "Investigation",
      );
    }
  }, [formData?.TestName]);

  return (
    <>
      <Accordion
        name={t("Department Receive")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo={"#"}
        seconTitle={
          <div className="link-title-container" id="pr_id_11">
            <div className="link-title-item">
              {t(`Total Patient: ${totalPatient}`)}
            </div>
            <div className="link-title-item">
              {t(`Total Test Count: ${uniqueTestCount}`)}
            </div>
            <div className="mt-1">
              <PageControlGear pageId={PAGE_ID} />
            </div>
          </div>
        }
      >
        <Accordion
          defaultValue={true}
          title={t("Department Receive Details")}
        />
        <div className="row pt-2 pl-2 pr-2">
          {
            controllerDynamicList
              ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
              .map((item) => {

                if (
                  item?.ControlDisplayID === "SelectTypes"
                  &&
                  isHideController("SelectTypes")
                  // && isActive("SelectTypes")
                ) {
                  return (
                    <div className="col-sm-2" key={item.ControlDisplayID}>
                      <div className="d-flex">

                        <div style={{ width: "50%" }}>
                          <SelectBox
                            options={[
                              ...SearchBy,
                              ...(shouldIncludeAIIMSID()
                                ? [{ label: "AIIMSID", value: "AIIMSID" }]
                                : []),
                            ]}
                            id="SelectTypes"
                            lable="SelectTypes"
                            selectedValue={formData.SelectTypes}
                            name="SelectTypes"
                            onChange={handleChange}
                            onKeyDown={(e) =>
                              handleKeyDownTabbing(e, "SelectTypes")
                            }
                            tabIndex={getTabIndex("SelectTypes")}
                          />
                        </div>

                        {/* <div style={{ width: "50%" }}>
                          {formData?.SelectTypes === "Mobile" ? (
                            <div style={{ width: "100%" }}>
                              <Input
                                type="number"
                                name="ItemValue"
                                max={10}
                                id="ItemValue"
                                value={formData.ItemValue}
                                onChange={handleChange}
                                onInput={(e) =>
                                number(e, DefaultCurrencyName == "KES" ? 14 : 10)
                                }
                                onKeyDown={(e) => {
                                  handleKeyDown(e);
                                  handleKeyDownTabbing(e, "ItemValue");
                                }}
                              />
                              {errors?.ItemValue && (
                                <div className="error-message">
                                  {errors.ItemValue}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ width: "100%" }}>
                              <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="ItemValue"
                                id="ItemValue"
                                max={20}
                                value={formData.ItemValue}
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                  handleKeyDown(e);
                                  handleKeyDownTabbing(e, "ItemValue");
                                }}
                                tabIndex={getTabIndex("ItemValue")}
                              />
                              {errors?.ItemValue && (
                                <div className="error-message">
                                  {errors.ItemValue}
                                </div>
                              )}
                            </div>
                          )}
                        </div> */}

                        <div style={{ width: "50%" }}>
                          {formData?.SelectTypes === "Mobile" ? (
                            <div style={{ width: "100%" }}>
                              <Input
                                type="number"
                                name="ItemValue"
                                max={10}
                                id="ItemValue"
                                value={formData.ItemValue}
                                onChange={handleChange}
                                onInput={(e) => number(e, 10)}
                                onKeyDown={(e) => {
                                  handleKeyDown(e);
                                  handleKeyDownTabbing(e, "ItemValue");
                                }}
                              />
                              {errors?.ItemValue && (
                                <div className="error-message">
                                  {errors.ItemValue}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ width: "100%" }}>
                              <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="ItemValue"
                                id="ItemValue"
                                max={20}
                                value={formData.ItemValue}
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                  handleKeyDown(e);
                                  handleKeyDownTabbing(e, "ItemValue");
                                }}
                                tabIndex={getTabIndex("ItemValue")}
                              />
                              {errors?.ItemValue && (
                                <div className="error-message">
                                  {errors.ItemValue}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
                  item?.ControlDisplayID === "CentreID" &&
                  isHideController("CentreID")
                  // && isActive("SelectTypes")
                ) {
                  return (
                    <div className="col-sm-2">
                      <ReactSelect
                        dynamicOptions={AddBlankData(CentreData, "All Centre")}
                        name="CentreID"
                        lable={t("Centre")}
                        id="Centre"
                        removeIsClearable={true}
                        placeholderName={t("Centre")}
                        value={formData?.CentreID}
                        onChange={(label, value) =>
                          handleSearchSelectChange(label, value, "Centre")
                        }
                        tabIndex={getTabIndex("Centre")}
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
                  item?.ControlDisplayID === "RateTypeID" &&
                  isHideController("RateTypeID")
                  // && isActive("SelectTypes")
                ) {
                  return (
                    <div className="col-sm-2">
                      <ReactSelect
                        dynamicOptions={AddBlankData(RateTypes, "All RateType")}
                        name="RateTypeID"
                        lable={t("RateType")}
                        id="RateType"
                        removeIsClearable={true}
                        placeholderName={t("RateType")}
                        isLoading={rateTypeLoading}
                        value={formData?.RateTypeID}
                        onChange={(label, value) =>
                          handleSearchSelectChange(label, value, "RateType")
                        }
                        tabIndex={getTabIndex("RateType")}
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
                  // && isActive("SelectTypes")
                ) {
                  return (
                    <div className="col-sm-2 ">
                      <ReactSelect
                        dynamicOptions={AddBlankData(
                          DepartmentData,
                          "All Department",
                        )}
                        name="DepartmentID"
                        lable={t("Department")}
                        id="Department"
                        removeIsClearable={true}
                        placeholderName={t("Department")}
                        value={formData?.DepartmentID}
                        onChange={(label, value) =>
                          handleSearchSelectChange(label, value, "Department")
                        }
                        tabIndex={getTabIndex("Department")}
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
                  item?.ControlDisplayID === "DoctorName" &&
                  isHideController("DoctorName")
                  // && isActive("SelectTypes")
                ) {
                  return (
                    <div className="col-sm-2  ">
                      <Input
                        lable="DoctorName"
                        id="DoctorName"
                        type="text"
                        name="DoctorName"
                        value={formData.DoctorName}
                        onChange={handleChange}
                        placeholder=" "
                        onBlur={(e) => {
                          autocompleteOnBlur(setDoctorSuggestion);
                          setTimeout(() => {
                            const data = doctorSuggestion.filter(
                              (ele) => ele?.Name === e.target.value,
                            );
                            if (data.length === 0) {
                              setFormData({ ...formData, DoctorName: "" });
                            }
                          }, 500);
                        }}
                        autoComplete="off"
                        onKeyDown={(e) => {
                          handleIndex(e);
                          handleKeyDownTabbing(e, "DoctorName");
                        }}
                      />
                      {dropFalse &&
                        doctorSuggestion.length > 0 &&
                        formData.DoctorName && (
                          <ul
                            className="suggestion-data"
                            style={{ top: "26px", right: "0px" }}
                          >
                            {doctorSuggestion.map((data, index) => (
                              <li
                                onClick={() =>
                                  handleListSearch(data, "DoctorName")
                                }
                                className={`${index === indexMatch && "matchIndex"}`}
                                key={index}
                              >
                                {data?.Name}
                              </li>
                            ))}
                          </ul>
                        )}
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
                  item?.ControlDisplayID === "CollectionBoy" &&
                  isHideController("CollectionBoy")
                  // && isActive("SelectTypes")
                ) {
                  return (
                    <div className="col-sm-2">
                      <ReactSelect
                        name="collectionBoy"
                        dynamicOptions={[
                          { label: t("Select Collection Boy"), value: "" },
                          ...collectionBoyList,
                        ]}
                        placeholderName={t("Collection Boy")}
                        // isDisabled={true}
                        id={"CollectionBoy"}
                        value={collectionBoy}
                        onChange={(name, option) =>
                          handleReactSelectChange(name, option, "CollectionBoy")
                        }
                        tabIndex={getTabIndex("CollectionBoy")}
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
              })}
        </div>
        <div className="row pt-1 pl-2 pr-2">
          {controllerDynamicList
            ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
            .map((item) => {
              if (
                item?.ControlDisplayID === "BarcodeNo"
                // &&
                // isHideController("BarcodeNo")
                // && isActive("SelectTypes")
              ) {
                return (
                  <div className="col-sm-2">
                    <Input
                      lable={t("Scan Barcode to Receive")}
                      id="BarcodeNo"
                      name="BarcodeNo"
                      placeholder=""
                      value={state.BarcodeNo}
                      onChange={handleBarcodeNo}
                      onKeyDown={(e) => {
                        handleBarcodeReceive(e);
                        handleKeyDownTabbing(e, "BarcodeNo");
                      }}
                      tabIndex={getTabIndex("BarcodeNo")}
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
                item?.ControlDisplayID === "FromDate" &&
                isHideController("FromDate")
                // && isActive("SelectTypes")
              ) {
                return (
                  <div className="col-sm-2">
                    <DatePicker
                      className="custom-calendar"
                      name="FromDate"
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      value={formData?.FromDate}
                      onChange={dateSelect}
                      maxDate={new Date(formData?.ToDate)}
                      onKeyDown={(e) => handleKeyDownTabbing(e, "FromDate")}
                      tabIndex={getTabIndex("FromDate")}
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
                item?.ControlDisplayID === "FromTime" &&
                isHideController("FromTime")
                // && isActive("SelectTypes")
              ) {
                return (
                  <div className="col-sm-1">
                    <CustomTimePicker
                      name="FromTime"
                      placeholder="FromTime"
                      value={formData?.FromTime}
                      id="FromTime"
                      lable="FromTime"
                      onChange={handleTime}
                      onKeyDown={(e) => handleKeyDownTabbing(e, "FromTime")}
                      tabIndex={getTabIndex("FromTime")}
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
                item?.ControlDisplayID === "ToDate" &&
                isHideController("ToDate")
                // && isActive("SelectTypes")
              ) {
                return (
                  <div className="col-sm-2 ">
                    <DatePicker
                      className="custom-calendar"
                      name="ToDate"
                      value={formData?.ToDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      maxDate={new Date()}
                      minDate={new Date(formData?.FromDate)}
                      onKeyDown={(e) => handleKeyDownTabbing(e, "ToDate")}
                      tabIndex={getTabIndex("ToDate")}
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
                item?.ControlDisplayID === "ToTime" &&
                isHideController("ToTime")
                // && isActive("SelectTypes")
              ) {
                return (
                  <div className="col-sm-1">
                    <CustomTimePicker
                      name="ToTime"
                      placeholder="ToTime"
                      value={formData?.ToTime}
                      id="ToTime"
                      lable="ToTime"
                      onChange={handleTime}
                      onKeyDown={(e) => handleKeyDownTabbing(e, "ToTime")}
                      tabIndex={getTabIndex("ToTime")}
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
                  <div className="col-sm-2  ">
                    <Input
                      autocomplete="off"
                      type="text"
                      name="TestName"
                      lable="Search By Test Name"
                      id="TestName"
                      value={formData.TestName}
                      placeholder=" "
                      // onChange={handleChange}
                      onChange={handleTestChange}
                      onKeyDown={(e) => handleTestIndex(e, "TestName")}
                      onBlur={(e) => {
                        autocompleteOnBlur(setTestSuggestion);
                      }}
                    />
                    {selects &&
                      TestSuggestion.length > 0 &&
                      formData.TestName && (
                        <ul className="suggestion-data">
                          {TestSuggestion.map((data, index) => (
                            <li
                              onClick={() =>
                                handleListSearchNew(data, "TestName")
                              }
                              className={`${index === indexMatch && "matchIndex"}`}
                              key={index}
                            >
                              {data.TestName}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                );
              }
            })}
          <div className="col-sm-auto">
            <SearchButton
              id={"btnSearch"}
              text={"Search"}
              onClick={() => TableData(2)}
              tabIndex={getTabIndex("btnSearch")}
            />
          </div>
          <div className="col-sm-auto">
            <CustomButton
              id={"btnReset"}
              text={"Reset"}
              icon={"refresh"}
              onClick={handleResetFilters}
              tabIndex={getTabIndex("btnReset")}
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2 justify-content-center">
          <div className="col-sm-auto">
            <CustomButton
              id={"btnReceived"}
              text={"Received"}
              onClick={() => TableData(3)}
              onKeyDown={(e) => handleKeyDownTabbing(e, "btnReceived")}
            />
          </div>
          <div className="col-sm-auto mb-1">
            <CustomButton text={"Rejected"} onClick={() => TableData(4)} />
          </div>
          <div className="col-sm-auto mb-1">
            <CustomButton text={"Hold"} onClick={() => TableData(16)} />
          </div>
        </div>
        
      </Accordion>
      {show4?.modal && (
        <MedicialModal
          show={show4.modal}
          handleClose={() => {
            setShow4({
              modal: false,
              data: "",
              index: -1,
            });
          }}
          MedicalId={show4?.data}
          ID={show4.ID}
          handleUploadCount={handleUploadCount}
        />
      )}

      {show?.modal && (
        <UploadFile
          show={show?.modal}
          handleClose={() => {
            setShow({ modal: false, data: "", index: -1 });
          }}
          options={Identity}
          documentId={show?.data}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
        />
      )}

      {/* SEARCH DATA TABLE */}
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        seconTitle={
          <div
            className="d-flex align-items-center px-2"
            style={{ gap: "10px", fontSize: "12px" }}
          >
            <div className="d-flex align-items-center" style={{ gap: "4px" }}>
              <i
                className="fa bi-file-earmark-pdf text-primary"
                style={{ fontSize: "14px" }}
              />
              <span>View Attachments</span>
            </div>

            <div className="d-flex align-items-center" style={{ gap: "4px" }}>
              <img src={Urgent} className="sizeicon" />
              <span>Urgent</span>
            </div>

            <div className="d-flex align-items-center" style={{ gap: "4px" }}>
              <i
                className="bi bi-shield-fill-check vip-font-size mb-0"
                style={{ color: "#FFC107" }}
              />
              <span>VIP Patient</span>
            </div>
          </div>
        }
      >
        {loading ? (
          <Loading />
        ) : load ? (
          <>
            {(() => {
              const paginationBlock = (
                <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
                  {totalCount > 25 && (
                    <>
                      <div style={{ minWidth: "150px" }}>
                        <ReactSelect
                          value={pageSize}
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
                            TableData(searchstatus, 1, value?.value);
                          }}
                        />
                      </div>

                      {totalCount > pageSize && (
                        <Pagination
                          className="pagination-bar"
                          currentPage={currentPage}
                          totalCount={totalCount}
                          pageSize={pageSize}
                          onPageChange={(page) => {
                            setCurrentPage(page);
                            TableData(searchstatus, page, pageSize);
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              );
              return (
                <>
                  {(IsPaginationOnTop == "1" || CompanyID == "1003") && paginationBlock}
                  {drdata.length > 0 &&
                    (searchstatus == "2" || searchstatus == 2 || collecteddataexist) && (
                      <div className="d-flex justify-content-end align-items-center gap-2 my-2 px-2">
                        {AllowSRAModule && (
                          <CustomButton
                            text={"Transfer"}
                            className="bg-blue"
                            onClick={() => SaveSampleTransferDepartment()}
                          />
                        )}
                        <CustomButton
                          text={"Receive"}
                          onClick={() => SaveSampleReceiveDepartment()}
                          disabled={isSubmitting}
                          loading={isSubmitting}
                        />
                        {rejectPayload.length > 0 && (
                          <CustomButton
                            text={"Reject"}
                            className="btn btn-danger btn-sm"
                            onClick={() => setShowRejectModal(true)}
                          />
                        )}
                      </div>
                    )}
                  <DepartmentReceiveTable
                    drdata={drdata}
                    setSaveTestId={setSaveTestId}
                    saveTestId={saveTestId}
                    show={setShow4}
                    show2={setShow}
                    TableData={TableData}
                    setDrData={setDrData}
                    pageType={pageType}
                    organ={organ}
                    doctorAdmin={doctorAdmin}
                    formData={formData}
                    searchstatus={searchstatus}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    rejectPayload={rejectPayload}
                    handleRejectPayload={handleRejectPayload}
                  />
                  <div className="d-flex justify-content-end align-items-center gap-2 row mt-3 mb-2 px-3">
                    {drdata.length > 0 &&
                      (searchstatus == "2" || searchstatus == 2 || collecteddataexist) && (
                        <div className="col-12 d-flex justify-content-end align-items-center gap-2">
                          {AllowSRAModule && (
                            <CustomButton
                              text={"Transfer"}
                              className="bg-blue"
                              onClick={() => SaveSampleTransferDepartment()}
                            />
                          )}
                          <CustomButton
                            text={"Receive"}
                            onClick={() => SaveSampleReceiveDepartment()}
                            disabled={isSubmitting}
                            loading={isSubmitting}
                          />
                          {rejectPayload.length > 0 && (
                            <CustomButton
                              text={"Reject"}
                              className="btn btn-danger btn-sm"
                              onClick={() => setShowRejectModal(true)}
                            />
                          )}
                        </div>
                      )}
                  </div>
                  {CompanyID != "1003" && paginationBlock}
                </>
              );
            })()}
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
      {showRejectModal && (
        <RejectModal
          show={showRejectModal}
          handleShow={() => setShowRejectModal(false)}
          data={rejectPayload}
          TableData={() => {
            TableData(searchstatus, currentPage, pageSize);
            setRejectPayload([]);
          }}
        />
      )}
    </>
  );
};

export default DepartmentReceive;
