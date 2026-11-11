import React, { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import moment from "moment";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {
  checkDuplicateBarcode,
  getCollectionBoy,
  getDoctorSuggestion,
  getPaymentModes,
  getRejectCount,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";

import {
  AddBlankData,
  AllDataDropDownPayload,
  IndexHandle,
  Time,
  autocompleteOnBlur,
  dateConfig,
  formatStandardDate,
  getTrimmedData,
  isChecked,
  number,
  parseAwsKeys,
  shouldIncludeAIIMSID,
} from "../../utils/helpers";
import {
  defaultSearchTypes,
  getAccurateAge,
  SampleStatusSearch,
  SearchBy,
} from "../../utils/Constants";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import MedicialModal from "../utils/MedicialModal";
import SampleRemark from "../utils/SampleRemark";
import { axiosInstance } from "../../utils/axiosInstance";
import Heading from "../../components/UI/Heading";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import CustomModal from "../utils/CustomModal";
import Tooltip from "../../components/formComponent/Tooltip";
import SampleCollectionTable from "../Table/SampleCollectionTable";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import Remark from ".././Images/Remark.png";
import Prick from ".././Images/Prick.png";
import Urgent from ".././Images/urgent.gif";
import UpdateRemark from "../utils/UpdateRemark";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { Tooltip as PrimeTooltip } from "primereact/tooltip";
import { Form } from "react-bootstrap";
import { notify } from "../../utils/utils";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import Pagination from "../../Pagination/Pagination";
import "./Results.css";
import { FaPlus } from "react-icons/fa";
import AddRemark from "../utils/AddRemark";
// import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import RejectModal from "../utils/RejectModal";
import DateTimeCell from "../../utils/DateTimeCell";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";

const SampleCollection = () => {
  const [CentreData, setCentreData] = useState([]);
  const [toggleTable, setToggleTable] = useState(true);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [payload, setPayload] = useState([]);
  const [Identity, setIdentity] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [scdata, setScData] = useState([]);
  const [searchInvdata, setSearchInvdata] = useState([]);
  const [isCreditVisit, setIsCreditVisit] = useState(0);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [moreErrors, setMoreErrors] = useState({});
  const [newdata, setNewData] = useState([]);
  const [snr, setSnr] = useState([]);
  const [skipBarcodeLogic, setSkipBarcodeLogic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [searchstatus, setSearchStatus] = useState(2);
  const [indexMatch, setIndexMatch] = useState(0);
  const [dropFalse, setDropFalse] = useState(true);
  const BarocdeNoMaxLength = useLocalStorage("BarocdeNoMaxLength", "get");
  const { ShowDefaultLoginCentre, DefaultCurrencyName, RateCentreType, HideOutSourceColor, ShowAllCheckBarcodeOption } = useLocalStorage("userData", "get");
  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = accessRightStr
    ? accessRightStr?.split(",").filter(Boolean)
    : [];
  console.log("accessRight", accessRight);
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const [medicalHistoryTooltipData, setMedicalHistoryTooltipData] = useState({
    data: [],
    loadingIndex: -1,
  });
  const [sampleCollectionDateTime, setSampleCollectionDateTime] = useState(
    () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return {
        data: now,
        time: `${hours}:${minutes}:00`,
      };
    },
  );

  
  const isB2B = searchInvdata?.some(
    (item) => item?.CentreType === "B2B"
  );
  const isKESB2B =
  DefaultCurrencyName === "KES" && isB2B;

useEffect(() => {
  if (DefaultCurrencyName === "KES" && isB2B) {
    setSampleCollectionDateTime({
      data: null,
      time: "00:00:00",
    });
  }
}, [DefaultCurrencyName, isB2B]);


  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    ID: 0,
    index: -1,
  });
  const [saveLoad, setSaveLoad] = useState(false);
  const [barcodePrintError, setBarcodePrintError] = useState("");
  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [showLog, setShowLog] = useState({
    modal: false,
    visitId: "",
  });

  let isTrueCheckBarcodeOption =
    ShowAllCheckBarcodeOption == 1 && defaultSearchTypes == "BarcodeNo";
  const [checkBarcodeOption, setCheckBarcodeOption] = useState(
    isTrueCheckBarcodeOption,
  );

  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });
  const today = new Date();
  const PAGE_ID = "607";
  const [defaultCentrePrefix, setDefaultCentrePrefix] = useState("");
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateID: "",
    SelectTypes: "BarcodeNo" || defaultSearchTypes || "",
    RefundFilter: null,
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    DoctorReferal: "",
    DepartmentID: "",
    DoctorName: "",
    SampleStatus: "1",
    HLMPatientType: "ALL",
  });
  const [dropdownList, setDropdownList] = useState({
    collectionBoyList: [],
  });
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const location = useLocation();
  const { state } = location;
  const [local, setLocal] = useState(state?.other);
  const [showRemark, setShowRemark] = useState(false);
  const [showUpdateRemark, setShowUpdateRemark] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [showPrickRemark, setShowPrickRemark] = useState(false);

  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [removeBarcodePayload, setRemoveBarcodePayload] = useState([]);
  const [rejectPayload, setRejectPayload] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });

  const navigate = useNavigate();

  const handleRejectPayload = (e, index, data) => {
    const { checked } = e.target;
    if (checked) {
      if (data) {
        setSearchInvdata((prev) => {
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
        const val = searchInvdata.map((ele) => {
          if (ele.Approved === 0 && ele.Status !== 4) {
            return {
              ...ele,
              isReject: true,
            };
          }
          return ele;
        });
        setSearchInvdata(val);
        const rejectable = val.filter(
          (ele) => ele.isReject && ele.Approved === 0 && ele.Status !== 4,
        );
        setRejectPayload(rejectable);
      }
    } else {
      if (data) {
        setSearchInvdata((prev) => {
          const val = [...prev];
          val[index]["isReject"] = false;
          return val;
        });
        setRejectPayload((prev) =>
          prev.filter((ele) => ele.TestID !== data.TestID),
        );
      } else {
        const val = searchInvdata.map((ele) => {
          return {
            ...ele,
            isReject: false,
          };
        });
        setSearchInvdata(val);
        setRejectPayload([]);
      }
    }
  };

  const handleRemoveBarcodePayload = (e, data) => {
    const { checked } = e.target;
    if (checked) {
      if (data) {
        setRemoveBarcodePayload([
          ...removeBarcodePayload,
          data?.TestIDHash || data?.TestIdhash,
        ]);
      } else {
        const removeable = searchInvdata
          .filter(
            (ele) =>
              (ele?.SINNo || ele?.BarcodeNo) &&
              ele?.ResultFlag === 0 &&
              ele?.MacDataCount === 0
          )
          .map((ele) => ele?.TestIDHash || ele?.TestIdhash);
        setRemoveBarcodePayload(removeable);
      }
    } else {
      if (data) {
        setRemoveBarcodePayload(
          removeBarcodePayload.filter(
            (item) => item !== (data?.TestIDHash || data?.TestIdhash)
          )
        );
      } else {
        setRemoveBarcodePayload([]);
      }
    }
  };

  const colorCodingData = [
    { color: "#c389fc", id: "1", labelKey: "SampleNotCollected" },
    { color: "#ffa500", id: "2", labelKey: "Collected" },
    { color: "#ffffff", id: "1", labelKey: "Received" },
    { color: "#B0C4DE", id: "2", labelKey: "Rejected" },
  ];

  // const handleOpenPreview = (guid) => {
  //   if (guid) {
  //     setPreviewConfig({ visible: true, url: guid });
  //   } else {
  //     toast.error("No attachment found for this record");
  //   }
  // };

  const handleOpenPreview = (keys) => {
    const parsedKeys = parseAwsKeys(keys);

    if (!parsedKeys) return;

    setPreviewConfig({
      visible: true,
      url: parsedKeys,
    });
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  function modifyArray(
    dataArray
  ) {
    let modifiedArray = [];

    dataArray?.forEach((visit) => {
      const pliList = typeof visit?.PliDataList === "string" ? JSON.parse(visit.PliDataList) : (Array.isArray(visit?.PliDataList) ? visit.PliDataList : []);
      const isUrgent = pliList?.some((test) => Number(test?.IsUrgent) === 1) ? 1 : 0;

      let testHTML = "";

      pliList?.forEach((test) => {
        testHTML += `
        <p class="rounded d-flex align-items-center round
        PrintOrderStatus-${test?.PrintOrderStatus == 99 ? 99 : "00"} Status-${test?.Status}
       ">
          ${test?.TestName}
        </p>
      `;
      });

      modifiedArray.push({
        ...visit,
        Test: testHTML,
        isUrgent: isUrgent,
      });
    });

    return modifiedArray;
  }
  const handleIndex = (e) => {
    const suggestions = doctorSuggestion || [];

    switch (e.which) {
      case 38:
        if (indexMatch !== 0) {
          setIndexMatch(indexMatch - 1);
        } else {
          setIndexMatch(suggestions.length - 1);
        }
        setTimeout(() => {
          const el = document.querySelector(".matchIndex");
          if (el) el.scrollIntoView({ block: "nearest" });
        }, 0);
        break;
      case 40:
        if (suggestions.length - 1 === indexMatch) {
          setIndexMatch(0);
        } else {
          setIndexMatch(indexMatch + 1);
        }
        setTimeout(() => {
          const el = document.querySelector(".matchIndex");
          if (el) el.scrollIntoView({ block: "nearest" });
        }, 0);
        break;
      case 13:
        if (suggestions[indexMatch]) {
          handleListSearch(suggestions[indexMatch], "DoctorName");
        }
        setIndexMatch(-1);
        break;
      default:
        break;
    }
  };

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

  const fetchMedicalHistoryTooltipData = (medicalHistoryList) => {
    try {
      if (medicalHistoryList) {
        const medicalHistory =
          typeof medicalHistoryList === "string"
            ? JSON.parse(medicalHistoryList)
            : medicalHistoryList;
        setMedicalHistoryTooltipData({
          data: medicalHistory,
          loadingIndex: -1,
        });
      }
    } catch (error) {
      console.error("Error parsing medical history:", error);
      setMedicalHistoryTooltipData({
        data: [],
        loadingIndex: -1,
      });
    }
  };

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

  const controllerDynamic = async () => {
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(PAGE_ID);
    setTabbingOrder(controllerTabbingOrder);
    setControllerDynamicList(controllersData);
    console.log("controllersDataInvs::", controllersData);
    console.log("controllerTabbingOrder::", controllerTabbingOrder);
  };

  console.log("controller", controllerDynamic);
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

  const clearValidationError = (fieldName) => {
    // Direct mapping for most fields
    if (moreErrors[fieldName]) {
      setMoreErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
      return;
    }
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
  const showAlways = (controlId) => {
    const showAlwaysList = [
      // "Centre Type",
    ];
    return showAlwaysList.includes(controlId);
  };

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (newdata) {
          SaveSampleCollection();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    newdata,
    payload,
    searchInvdata,
    skipBarcodeLogic,
    sampleCollectionDateTime,
  ]);

  useEffect(() => {
    controllerDynamic();
  }, []);

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
    return [...baseFocusOrder, "btnSearch"];
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
    controllerDynamic();
  }, []);
  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    if (formData?.DoctorName === "") {
      setDropFalse(true);
    }
  }, [formData?.DoctorName]);

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

  const utcDate = () => {
    const d = new Date(sampleCollectionDateTime.data);
    const [hh, mm] = sampleCollectionDateTime.time.split(":");

    return new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0),
    );
  };

  console.log("utcDate", utcDate());

  // const handleToggle = (name) => {
  //   setToggleDate({ ...toggleDate, [name]: !toggleDate[name] });
  // };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setFormData({ ...formData, [label]: value?.value, RateTypeID: "" });
      fetchRateTypes(
        value?.value == ""
          ? CentreData?.map((ele) => ele?.value)
          : [value?.value],
        DepartmentData?.map((ele) => ele?.value), true
      );
    } else {
      setFormData({ ...formData, [label]: value?.value });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name == "DoctorName") {
      if (value == "") {
        setDoctorSuggestion([]);
      } else {
        setDoctorSuggestion((prev) =>
          prev.filter((ele) =>
            ele.Name?.toLowerCase().includes(value.toLowerCase()),
          ),
        );
      }
      setFormData({ ...formData, [name]: value });
    } else {
      if (name === "SelectTypes") {
        setCheckBarcodeOption(value === "BarcodeNo");
        setFormData({
          ...formData,
          [name]: value,
          ItemValue: value === "PatientCode" ? defaultCentrePrefix : "",
        });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
    // setFormData({ ...formData, [name]: value });
  };

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
        const Centre = CentreDataValue?.map((ele) => ele?.value);
        setCentreData(CentreDataValue);
        if (ShowDefaultLoginCentre === "1") {
          const selectedCentre = DefaultCentre || data?.[0]?.DefaultCentreId;
          setFormData((prev) => ({
            ...prev,
            CentreID: selectedCentre || "",
          }));
          getDepartment(selectedCentre ? [selectedCentre] : Centre);
        } else {
          getDepartment(Centre);
        }
      })
      .catch((err) => {
        getDepartment([]);
      });
  };

  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };

  const getDepartment = (Centre) => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        const Dept = DeptDataValue?.map((ele) => ele?.value);
        setDepartmentData(DeptDataValue);
        fetchRateTypes(Centre, Dept, true);
      })
      .catch((err) => { });
  };

  const filterPayload = (filterData) => {
    console.log("filterData", filterData);
    const data = filterData.filter(
      (ele) =>
        ele.Status === 1 ||
        (ele.Status === 4 && ele?.isSampleReCollection == 1),
    );
    console.log("modifieddata", data);
    return data;
  };
  const filterPayload2 = (filterData) => {
    const data = filterData.filter(
      (ele) =>
        ele.Status == 1 ||
        (ele.Status == 4 && ele?.isSampleReCollection == 1) ||
        ele.Status == 2,
    );
    return data;
  };
  const handleCheckboxCondition = useCallback(
    (data) => {
      let status = false;
      for (let i = 0; i < data?.length; i++) {
        if ([1, 4, 2].includes(data[i]["Status"])) {
          status = true;
          break;
        }
      }
      return status;
    },
    [searchInvdata],
  );

  const showBarcodePrintError = (message) => {
    const text =
      (typeof message === "string" && message.trim()) ||
      "Barcode label could not be printed";
    setBarcodePrintError(text);
    toast.error(text, { autoClose: false });
  };

  const getBarcodeData = (arr, VisitNo, SINNo) => {
    let testIDList = [];
    if (Array?.isArray(arr)) {
      testIDList = arr;
    } else {
      testIDList = [arr];
    }

    axiosInstance
      .post("SC/getBarcode", {
        LedgerTransactionNo: VisitNo,
        BarcodeNo: SINNo,
        TestID: testIDList,
        barcodeNoDepartmentID: 0,
      })
      .then((res) => {
        const success = res?.data?.success;
        const message = res?.data?.message ?? res?.data?.Message;
        const isUrl = typeof message === "string" && (
          message.startsWith("http://") ||
          message.startsWith("https://") ||
          message.startsWith("blob:") ||
          message.startsWith("/")
        );
        if (success && message && isUrl) {
          setBarcodePrintError("");
          window.location.href = message;
          return;
        }
        // success:false (e.g. "No printable fields found in
        // BarcodePrintOutConfig for the given BarcodeType and CompanyId")
        // is an expected/unconfigured state for companies that don't print
        // barcodes here, not a failure worth interrupting the user with a
        // toast + red banner on every save - stay silent, just clear any
        // stale error banner from a previous attempt.
        console.warn("[getBarcodeData] SC/getBarcode returned success:false:", message);
        setBarcodePrintError("");
      })
      .catch((err) => {
        showBarcodePrintError(
          err?.response?.data?.message ?? err?.response?.data?.Message,
        );
      });
  };

  const checkSampleTypeIdCheck = (payload) => {
    const hasInvalidSampleType = payload.some(
      (ele) => ele.SampleTypeID === 0 || ele.SampleTypeID === "",
    );

    return !hasInvalidSampleType;
  };

  console.log("searchInvdata::", searchInvdata);

  const checkBarcodeNumberValidAndDublicate = () => {
    let isValidBarcode = true;
    searchInvdata?.map((item, idx) => {
      if (item?.SINNo?.length > BarocdeNoMaxLength) {
        isValidBarcode = false;
      }
    });
    if (!isValidBarcode) {
      notify(`Barcode cannot be greater then ${BarocdeNoMaxLength}`, "warn");
    }
    return isValidBarcode;
  };

  const SaveSampleCollection = () => {
    if (!checkBarcodeNumberValidAndDublicate()) {
      return;
    }

    const allAlreadyCollected = searchInvdata.length > 0 && searchInvdata.every(
      (ele) => Number(ele.Status) >= 2 && ele?.isSampleReCollection != 1
    );
    if (allAlreadyCollected) {
      toast.error("This Barcode already collect");
      return;
    }

      if (!sampleCollectionDateTime?.data || 
        !sampleCollectionDateTime?.time || 
        sampleCollectionDateTime?.time === "00:00:00") {

      toast.error(
        !sampleCollectionDateTime?.data
          ? "Please select sample collection date"
          : "Please select sample collection time"
      );

      return;
    }

    const collectRows = filterPayload(searchInvdata).filter(
      (item) => item?.SINNo && String(item.SINNo).length >= 3,
    );

    const invalidPricksRow = collectRows?.find(
      (item) =>
        Number(item?.NoOfPricks) > 1 &&
        (!item?.PricksRemarks || item?.PricksRemarks.trim() === ""),
    );

    console.log("invalidPricksRow", invalidPricksRow);

    if (invalidPricksRow) {
      toast.error(
        "Pricks Remarks is mandatory when No Of Pricks is greater than 1",
      );
      return;
    }

    if (DefaultCurrencyName === "KES") {
      const invalidSINRow = collectRows?.find(
        (item) => item?.SINNo && item.SINNo.length < 9
      );

      if (invalidSINRow) {
        toast.error(
          `Barcode Should Contain at least 9 characters}`
        );
        return;
      }
    }

    // console.log("filtered", collectRows);
    const getBarcodeDate = getTrimmedData(collectRows);
    const testidArray =
      getBarcodeDate &&
      getBarcodeDate.map((ele) => {
        return ele?.TestID;
      });
    const barcodeArray =
      getBarcodeDate &&
      Array.from(
        new Set(getBarcodeDate.map((ele) => ele?.SINNo).filter(Boolean)),
      );
    // return
    console.log("collectRows::", collectRows);
    if (collectRows?.length > 0) {
      setSaveLoad(true);
      axiosInstance
        .post("SC/SampleCollection", {
          data: getTrimmedData(
            collectRows.map((item) => ({
              ...item,
              HistoCytoSampleDetail: `${item?.Container}^${item?.Slide}^${item?.Block}^`,
              preSampleCollectionDate: utcDate().toISOString(),
              NoOfPricks: item.NoOfPricks === 0 ? 1 : item.NoOfPricks,
              isCreditVisit: isCreditVisit,
              SampleRemarks: "",
            })),
          ),
        })
        .then((res) => {
          setSaveLoad(false);
          if (res.data.success) {
            setBarcodePrintError("");
            getRejectCount();
            setPayload([]);
            setSampleCollectionDateTime(() => {
              const now = new Date();
              const hours = String(now.getHours()).padStart(2, "0");
              const minutes = String(now.getMinutes()).padStart(2, "0");
              return {
                data: now,
                time: `${hours}:${minutes}:00`,
              };
            });

            toast.success(res?.data?.message || t("Specimen collected successfully for Work Order."));
            TableData("", undefined, undefined, undefined, "", pageSize, true);
            getBarcodeData(testidArray, getBarcodeDate[0]?.VisitNo, barcodeArray);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {
          setSaveLoad(false);
          if (err.response.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response.status === 401) {
            toast.error(err.response.data.message);
          }
        });
    } else {
      toast.error(
        "Please Select Atlease One Test Or For Collect Rejected test contact to admin",
      );
    }
  };
  const RemoveBarcode = () => {
    if (removeBarcodePayload.length === 0) {
      toast.warn("Please select at least one test to remove barcode");
      return;
    }

    setSaveLoad(true);
    axiosInstance
      .post("SC/SampleCollectionRemoveBarcode", {
        testIDHash: removeBarcodePayload,
      })
      .then((res) => {
        if (res.data?.success) {
          toast.success(res.data.message);
          setRemoveBarcodePayload([]);
          SearchInvestigationData(searchInvdata[0]?.LedgerTransactionID, isCreditVisit);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      })
      .finally(() => {
        setSaveLoad(false);
      });
  };

  const SaveSNR = () => {
    const getBarcodeDate = getTrimmedData(filterPayload2(payload));
    const testidArray =
      getBarcodeDate &&
      getBarcodeDate.map((ele) => {
        return ele?.TestID;
      });
    const barcodeArray =
      getBarcodeDate &&
      Array.from(
        new Set(getBarcodeDate.map((ele) => ele?.SINNo).filter(Boolean)),
      );
    if (filterPayload2(payload)?.length > 0) {
      setSaveLoad(true);
      axiosInstance
        .post("SC/SampleSNR", {
          data: getTrimmedData(
            filterPayload2(payload).map((item) => ({
              ...item,
              HistoCytoSampleDetail: `${item?.Container}^${item?.Slide}^${item?.Block}^`,
            })),
          ),
        })
        .then((res) => {
          setSaveLoad(false);
          toast.success(res.data.message);
          getBarcodeData(testidArray, getBarcodeDate[0]?.VisitNo, barcodeArray);
          getRejectCount();
          setPayload([]);
          if (payload.length === searchInvdata.length) {
            TableData("");
          } else {
            // SearchInvestigationData(payload[0]?.LedgerTransactionID);
            TableData(document.getElementById("SampleStatusSearch").value);
          }
        })
        .catch((err) => {
          setSaveLoad(false);
          if (err.response.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response.status === 401) {
            toast.error(err.response.data.message);
          }
        });
    } else {
      toast.error("Please Select atlease One Test to Continue");
    }
  };
  const TableData = (status, centre, Dep, Rate, page = "", size = pageSize, silent = false) => {
    console.log("size table datahello", size);
    // UHID search auto-fills ItemValue with just the centre's prefix (e.g. "APC") so
    // the user can type the rest of the code. If they search without typing anything
    // past that prefix, don't send it as a filter — it isn't a real UHID.
    const isUhidPrefixOnly =
      formData?.SelectTypes === "PatientCode" &&
      formData?.ItemValue?.trim() === defaultCentrePrefix?.trim();
    axiosInstance
      .post(
        "SC/GetSampleCollection",
        getTrimmedData({
          CentreID: AllDataDropDownPayload(
            formData?.CentreID,
            CentreData,
            "value",
          ),
          SelectTypes: isUhidPrefixOnly ? "" : formData.SelectTypes,
          ItemValue: isUhidPrefixOnly ? "" : formData.ItemValue.trim(),
          RateTypeID: formData?.RateTypeID
            ? [Number(formData?.RateTypeID)]
            : [],
          DoctorReferal: formData.DoctorReferal,
          FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
          FromTime: formData.FromTime,
          ToTime: formData.ToTime,
          CollectionBoyID: Number(collectionBoy || 0),
          ShowAllCheckBarcodeOption:
            formData.SelectTypes === "BarcodeNo" && checkBarcodeOption ? 1 : 0,
          DepartmentID: formData?.DepartmentID
            ? [Number(formData?.DepartmentID)]
            : [],
          SampleStatus: status,
          pageNumber: page || 1,
          pageSize: Number(size),
          HLMPatientType: formData?.HLMPatientType || "ALL",
        }),
      )
      .then((res) => {
        if (res?.data?.success) {
          const modified = modifyArray(res?.data?.message);

          setScData(modified);
          setTotalCount(res?.data?.data?.totalRecords || 0);
          setToggleTable(true);
          setSearchStatus(status);
        } else {
          setScData([]);
          setToggleTable(true);
          setTotalCount(0);
          setSearchInvdata([]);
          if (!silent) toast.error("No Record Found");
        }

        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };
  const [t] = useTranslation();

  const SearchInvestigationData = (LedgerTransactionID, CreditVisit = 0) => {
    setIsCreditVisit(CreditVisit);
    axiosInstance
      .post("SC/SearchInvestigation", {
        LedgerTransactionID: LedgerTransactionID,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele, index) => {
          return {
            ...ele,
            index: index,
            isSelected:
              (ele?.Status == 1 ||
                (ele?.Status == 4 && ele?.isSampleReCollection == 1)) &&
                ele?.SINNo?.length >= 3
                ? true
                : false,
            valQty: 1,

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
        setSearchInvdata(val);
        setPayload(val.filter((item) => item.isSelected));
        setNewData(
          res?.data?.message.some((x) => x.Status == "1" || x.Status == "4"),
        );
        setSnr(
          res?.data?.message.some(
            (x) => x.Status == "1" || x.Status == "4" || x.Status == "2",
          ),
        );
        setToggleTable(false);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  const handlePayload = (e) => {
    const { checked } = e.target;
    let flag = 1;
    for (let i = 0; i < searchInvdata.length; i++) {
      if (
        ["", null].includes(searchInvdata[i].SINNo) ||
        searchInvdata[i]?.SINNo?.length < 3
      ) {
        flag = 0;
        break;
      }
    }
    if (checked) {
      if (flag) {
        const data = searchInvdata.map((ele) => ({
          ...ele,
          isSelected: true,
        }));
        setSearchInvdata(data);
        setPayload(data);
      } else {
        const data = searchInvdata.map((ele) => {
          const isValid =
            ele?.Status == 1 && ele.SINNo && ele.SINNo.length >= 3;
          return {
            ...ele,
            isSelected: isValid,
          };
        });
        setSearchInvdata(data);
        // console.log({searchInvdata})
        setPayload(data.filter((item) => item.isSelected));
        const validCount = searchInvdata.filter(
          (ele) => ele?.Status == 1 && ele.SINNo && ele.SINNo.length >= 3,
        );

        if (validCount?.length === 0) {
          toast.error(t("Barcode is missing or less than 3 characters"));
        }
      }
    } else {
      const data = searchInvdata.map((ele) => {
        return {
          ...ele,
          isSelected: false,
        };
      });
      setSearchInvdata(data);
      setPayload([]);
    }
  };

  const handleCloseBarcodeModal = (
    value,
    LedgerTransactionID,
    barcodeLogic,
    sampletypeId,
  ) => {
    // When "Skip Barcode Logic" is checked, skip duplicate barcode validation entirely
    if (skipBarcodeLogic) return;

    checkDuplicateBarcode(value, LedgerTransactionID).then((res) => {
      if (res === " " || res === "") {
      } else {
        if (barcodeLogic === 3) {
          const data = searchInvdata.map((ele) => {
            return {
              ...ele,
              SINNo: "",
            };
          });
          setSearchInvdata(data);
          toast.error(res);
        }

        if (barcodeLogic === 4) {
          const data = searchInvdata.map((ele) => {
            if (ele?.SampleTypeID === sampletypeId) {
              return {
                ...ele,
                SINNo: "",
              };
            } else {
              return ele;
            }
          });
          setSearchInvdata(data);
          toast.error(res);
        }
      }
    });
  };

  const handleBarcode = (e, barcodeLogic, sampletypeId, index) => {
    const { value } = e.target;
    if (value?.length > BarocdeNoMaxLength) {
      return;
    }

    if (value && value.trim().length >= 3) {
      const alreadyCollected = searchInvdata.some(
        (ele, i) => i !== index && (ele.BarcodeNo === value.trim() || ele.SINNo === value.trim()) && Number(ele.Status) >= 2
      );
      if (alreadyCollected) {
        toast.error("This Barcode already collect");
        return;
      }
    }

    const logic = Number(barcodeLogic);
    const sampleType = Number(sampletypeId);

    console.log({ DefaultCurrencyName })
    if (logic === 4 || (DefaultCurrencyName === "KES" && logic === 3)) {
      // When "Skip Barcode Logic" is checked, bypass duplicate check and allow any barcode
      let flag = skipBarcodeLogic
        ? true
        : (() => {
          let f = true;
          for (let i = 0; i < searchInvdata.length; i++) {
            if (
              Number(searchInvdata[i]?.SampleTypeID) !== sampleType &&
              value !== "" &&
              value === searchInvdata[i]?.SINNo
            ) {
              f = false;
              break;
            }
          }
          return f;
        })();

      if (flag) {
        const data = searchInvdata.map((ele) => {
          if (Number(ele?.SampleTypeID) === sampleType) {
            console.log({ ele })
            return {
              ...ele,
              SINNo: value,
              isSelected:
                (ele.Status == 1 ||
                  (ele.Status == 4 && ele?.isSampleReCollection == 1)) &&
                  value.length >= 3
                  ? true
                  : false,
            };
          } else {
            return ele;
          }
        });
        setSearchInvdata(data);
        setPayload(data.filter((item) => item.isSelected));
      } else {
        toast.error(t("This BarCode is Already Given"));
      }
    } else if (logic === 3) {
      const data = searchInvdata.map((ele, i) => {
        if (i !== index) return ele;
        return {
          ...ele,
          SINNo: value,
          isSelected:
            (ele.Status == 1 ||
              (ele.Status == 4 && ele?.isSampleReCollection == 1)) &&
              value.length >= 3
              ? true
              : false,
        };
      });
      setSearchInvdata(data);
      setPayload(data.filter((item) => item.isSelected));
    }

    else {
      // Default: Handle Barcode Logic 1, 2, or any other logic (updating specific row)
      let flag = skipBarcodeLogic
        ? true
        : (() => {
          let f = true;
          for (let i = 0; i < searchInvdata.length; i++) {
            if (
              i !== index &&
              value !== "" &&
              value === searchInvdata[i]?.SINNo
            ) {
              f = false;
              break;
            }
          }
          return f;
        })();

      if (flag) {
        const data = searchInvdata.map((ele, idx) => {
          if (idx === index) {
            return {
              ...ele,
              SINNo: value,
              isSelected:
                (ele.Status == 1 ||
                  (ele.Status == 4 && ele?.isSampleReCollection == 1)) &&
                  value.length >= 3
                  ? true
                  : false,
            };
          }
          return ele;
        });
        setSearchInvdata(data);
        setPayload(data.filter((item) => item.isSelected));
      } else {
        toast.error(t("This BarCode is Already Given"));
      }
    }
  };

  // When "Skip Barcode Logic" is turned OFF, re-validate for duplicates:
  // keep only the FIRST occurrence of each SINNo; clear and error on subsequent duplicates.
  const handleSkipBarcodeToggle = (checked) => {
    setSkipBarcodeLogic(checked);

    if (!checked) {
      let foundDuplicate = false;

      const validated = searchInvdata.map((ele, index) => {
        const barcode = ele?.SINNo?.trim();
        if (!barcode || barcode.length < 3) return ele;

        // Check if this barcode conflicts with any of the rows ABOVE it
        const isDuplicate = searchInvdata.slice(0, index).some((prev) => {
          if (prev.SINNo?.trim() !== barcode) return false;

          // RULE: If it's the same investigation/test, don't clear (Allowed)
          if (prev.InvestigationID === ele.InvestigationID) return false;

          // RULE: Respect system BarcodeLogic
          if (ele.BarcodeLogic === 3) return false; // Shared within visit
          if (ele.BarcodeLogic === 4 && prev.SampleTypeID === ele.SampleTypeID)
            return false; // Shared by Sample Type

          return true; // Otherwise, it's a conflict
        });

        if (isDuplicate) {
          foundDuplicate = true;
          return { ...ele, SINNo: "", isSelected: false };
        }
        return ele;
      });

      // if (foundDuplicate) {
      //   setSearchInvdata(validated);
      //   setPayload(validated.filter((item) => item.isSelected));
      //   toast.error(
      //     t("Duplicate barcodes found. Duplicate entries have been cleared."),
      //   );
      // }
    }
  };
  const handleUploadCount = (name, value, secondName) => {
    const data = searchInvdata?.map((ele) => {
      return {
        ...ele,
        [name]: value,
        [secondName]: value === 0 ? 0 : 1,
      };
    });
    setSearchInvdata(data);
  };

  const handleResetFilters = () => {
    setFormData({
      FromDate: new Date(),
      ToDate: new Date(),
      CentreID: ShowDefaultLoginCentre === "1" ? DefaultCentre || "" : "",
      ItemValue: "",
      RateID: "",
      SelectTypes: "BarcodeNo" || defaultSearchTypes || "",
      RefundFilter: null,
      FromTime: "00:00:00",
      ToTime: "23:59:59",
      DoctorReferal: "",
      DepartmentID: "",
      DoctorName: "",
      SampleStatus: "1",
      HLMPatientType: "ALL",
      RateTypeID: "",
    });
    setCollectionBoy();
    setCheckBarcodeOption(isTrueCheckBarcodeOption);
    setCurrentPage(1);
    setScData([]);
    setTotalCount(0);
    setSearchInvdata([]);
    setPayload([]);
    setErrors({});
  };

  const handleSearchByDropDown = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      ["SampleStatus"]: value,
    });
    TableData(value);
  };

  const fetchRateTypes = async (Center, Dept, showLoader = false) => {
    if (showLoader) setRateTypeLoading(true);
    try {
      const res = await axiosInstance.post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: Center.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName.replace(/\r?\n/g, " ").trim(),
        value: item?.RateTypeID,
      }));

      setRateTypes(list);
      const Rate = list?.map((ele) => ele?.value);
      if (local) {
        TableData("4", Center, Dept, Rate);
        setFormData({
          ...formData,
          ["SampleStatus"]: "4",
        });
        setLocal(false);
      }
    } catch (err) {
      if (showLoader) setRateTypeLoading(false);
      if (local) {
        TableData("4", Center, Dept, []);
        setFormData({
          ...formData,
          ["SampleStatus"]: "4",
        });
      }
      console.log(err);
    } finally {
      if (showLoader) setRateTypeLoading(false);
    }
  };

  useEffect(() => {
    getAccessCentres();
    getPaymentModes("RequiredAttachment", setIdentity);
    getCollectionBoy(setCollectionBoyList, true);
  }, []);

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("1");
    }
  };

  const handleShowRemark = () => {
    setShowRemark(false);
  };
  const handleShowPrickRemarks = () => {
    setShowPrickRemark(false);
  };

  const handleReactSelectChange = (name, option) => {
    setCollectionBoy(option?.value);
  };

  const handleToggleChange = (e) => {
    const { checked } = e.target;
    setCheckBarcodeOption(checked);
  };

  const handleDateTime = (time, name) => {
    setSampleCollectionDateTime((prev) => ({ ...prev, [name]: time }));
  };

  const handleValQty = (type, sinNo, active) => {
    const data = searchInvdata.map((ele) => {
      if (sinNo === ele?.SINNo) {
        if (type === "add") {
          return { ...ele, valQty: ele.valQty + 1 };
        } else if (type === "sub" && ele?.valQty > 0) {
          return { ...ele, valQty: ele.valQty - 1 };
        } else {
          return ele;
        }
      } else {
        return ele;
      }
    });
    setSearchInvdata(data);
    setPayload((prev) =>
      prev.map((p) => {
        if (p.SINNo === sinNo) {
          const updated = data.find((ele) => ele.SINNo === sinNo);
          return updated ? { ...p, valQty: updated.valQty } : p;
        }
        return p;
      })
    );
  };

  const [FilterData, setFilterData] = useState([]);

  //Table Dynamic

  const headWithApiFieldsxx = {
    // "S.No": "",
    "Barcode No": "SinNo",
    "Reg Date": "Date",
    VisitNo: "VisitNo",
    Name: "PName",
    RateTypeCode: "RateTypeCode",
    TestCode: "SampleName",
    TestName: "Department",
    "Collection Time": "PreSampleCollectionDate",
    Remarks: "PreSampleCollectionDate",
  };

  const headWithApiFields = {
    // "S.No": "index",
    "Barcode No": "SinNo",
    "Reg Date": "Date",
    VisitNo: "VisitNo",
    Name: "PName",
    RateTypeName: "RateTypeName",
    RateTypeCode: "RateTypeCode",
    RateTypeNameWithCode: "RateTypeNameWithCode",
    TestCode: "TestCode",
    TestName: "ItemName",
    "Collection Time": "PreSampleCollectionDate",
    "Collection Boy": "FeildBoyName",
    Remarks: "Remarks",
    HLMOPDIPDNo: "HLMOPDIPDNo",
    HLMPatientType: "HLMPatientType",
  };

  const getFilterHeaderForMerge = (headerName = "") => {
    const controller = controllerDynamicList?.find((item) => {
      const splitID = item?.ControlDisplayID?.toLowerCase()?.split("/") || [];

      return splitID[0] === headerName.toLowerCase();
    });
    return controller?.ControlDisplayID?.split("/") || [];
  };

  const isHeaderKeyPresentInResObj = (headerName, tableRow) => {
    return Object.keys(tableRow)?.some(
      (item) =>
        item?.toLowerCase() == headerName?.split("/")?.[0]?.toLowerCase(),
    );
  };

  return (
    <>
      {showLog?.modal && (
        <CustomModal
          show={showLog?.modal}
          visitID={showLog?.visitId}
          onHide={() =>
            setShowLog({
              modal: false,
              visitId: "",
            })
          }
        />
      )}
      {show?.modal && (
        <UploadFile
          handleClose={() => {
            setShow({ modal: false, data: "", index: -1 });
          }}
          show={show?.modal}
          options={Identity}
          documentId={show?.data}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
          LedgerTransactionIDHash={show?.LedgerTransactionIDHash}
          
        />
      )}
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData(searchstatus);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          visitKey="VisitNo"
          testIDsKey="TestID"
          testNamesKey="Test"
          ledgerTransactionIDKey="LedgerTransactionID"
          patientNameKey={["FirstName", "MiddleName", "LastName"]}
          ageGenderKey={["Age", "Gender"]}
        />
      )}
      {showUpdateRemark?.modal && (
        <UpdateRemark
          show={showUpdateRemark?.modal}
          handleShow={() =>
            setShowUpdateRemark({ modal: false, data: "", index: -1 })
          }
          state={showUpdateRemark?.data}
          PageName={showUpdateRemark?.data?.Remarks}
          status={formData?.SampleStatus}
          title={"Remarks"}
          TableData={TableData}
        />
      )}
      {showRejectModal && (
        <RejectModal
          show={showRejectModal}
          handleShow={() => setShowRejectModal(false)}
          data={rejectPayload}
          TableData={TableData}
        />
      )}
      {/* <Heading isBreadcrumb={true} name="SampleCollection" /> */}
      <Accordion
        name={t("Sample Collection Details")}
        defaultValue={true}
        isBreadcrumb={true}
        seconTitle={
          <div style={{ marginLeft: "auto" }}>
            <PageControlGear pageId={PAGE_ID} />
          </div>
        }
      >
        <div className="row pt-2 pl-2 pr-2">
          {controllerDynamicList
            ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
            .map((item) => {
              if (
                item?.ControlDisplayID === "SelectTypes" &&
                isHideController("SelectTypes")
                // && isActive("SelectTypes")
              ) {
                return (
                  <div className="col-sm-2">
                    <div className="d-flex" style={{ display: "flex" }}>
                      <div style={{ width: "40%" }}>
                        <SelectBox
                          options={[
                            ...SearchBy,
                            ...(shouldIncludeAIIMSID()
                              ? [{ label: "AIIMSID", value: "AIIMSID" }]
                              : []),
                          ]}
                          selectedValue={formData?.SelectTypes}
                          name="SelectTypes"
                          id="SelectTypes"
                          lable="SelectTypes"
                          onChange={handleChange}
                        />
                      </div>
                      {ShowAllCheckBarcodeOption == 1 &&
                        formData.SelectTypes === "BarcodeNo" && (
                          <>
                            <PrimeTooltip
                              target="#ShowAllCheckBarcodeOption"
                              content={t("ShowAllCheckBarcodeOption")}
                              position="top"
                            />
                            <Form.Check
                              type="checkbox"
                              id="ShowAllCheckBarcodeOption"
                              checked={!!checkBarcodeOption}
                              onChange={handleToggleChange}
                              className="cursor-pointer"
                            />
                          </>
                        )}
                      <div style={{ width: "50%" }}>
                        {formData?.SelectTypes === "Mobile" ? (
                          <div style={{ width: "100%" }}>
                            <Input
                              className="select-input-box form-control input-sm"
                              type="number"
                              name="ItemValue"
                              max={10}
                              onKeyDown={handleKeyDown}
                              value={formData?.ItemValue}
                              onChange={handleChange}
                              // onInput={(e) => number(e, 10)}
                              onInput={(e) =>
                                number(e, DefaultCurrencyName == "KES" ? 14 : 10)
                              }
                            />
                            {errors?.ItemValue && (
                              <div className="error-message">
                                {errors?.ItemValue}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ width: "100%" }}>
                            <Input
                              className="select-input-box form-control input-sm"
                              type="text"
                              name="ItemValue"
                              max={20}
                              onKeyDown={handleKeyDown}
                              value={formData?.ItemValue}
                              onChange={handleChange}
                            />
                            {errors?.ItemValue && (
                              <div className="error-message">
                                {errors?.ItemValue}
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
                      onChange={handleSearchSelectChange}
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
                      value={formData?.RateTypeID}
                      onChange={handleSearchSelectChange}
                      isLoading={rateTypeLoading}

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
                  <div className="col-sm-2  ">
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
                      onChange={handleSearchSelectChange}
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
                  <div className="col-sm-2 ">
                    <Input
                      type="text"
                      name="DoctorName"
                      lable="DoctorName"
                      id="DoctorName"
                      value={formData?.DoctorName}
                      onChange={handleChange}
                      onKeyDown={handleIndex}
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
                    />
                    {dropFalse &&
                      doctorSuggestion.length > 0 &&
                      formData.DoctorName && (
                        <ul className="suggestion-data">
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
                item?.ControlDisplayID === "collectionBoy" &&
                isHideController("collectionBoy")
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
                      value={collectionBoy}
                      onChange={handleReactSelectChange}
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
                item?.ControlDisplayID === "SampleStatusSearch" &&
                isHideController("SampleStatusSearch")
                // && isActive("SelectTypes")
              ) {
                return (
                  <div className="col-sm-2">
                    <SelectBox
                      options={SampleStatusSearch}
                      className="input-sm"
                      lable="SampleStatusSearch"
                      name="SelectTypes"
                      id="SampleStatusSearch"
                      selectedValue={formData?.SampleStatus}
                      onChange={handleSearchByDropDown}
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
                      value={formData?.FromDate}
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      onChange={dateSelect}
                      maxDate={new Date(formData.ToDate)}
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
                item?.ControlDisplayID === "HLMPatientTypes" &&
                isHideController("HLMPatientTypes")
                // && isActive("SelectTypes")
              ) {
                return (
                  <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: t("ALL"), value: "ALL" },
                { label: t("IP"), value: "IP" },
                { label: t("OP"), value: "OP" },
                { label: t("OPD"), value: "OPD" },
              ]}
              name="HLMPatientType"
              lable={t("Patient Type")}
              id="HLMPatientType"
              removeIsClearable={true}
              placeholderName={t("Patient Type")}
              value={formData?.HLMPatientType}
              onChange={handleSearchSelectChange}
            />
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
                  <div className="col-sm-2">
                    <DatePicker
                      className="custom-calendar"
                      name="ToDate"
                      value={formData?.ToDate}
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      onChange={dateSelect}
                      maxDate={new Date()}
                      minDate={new Date(formData.FromDate)}
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
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <SearchButton
                text={"Search"}
                onClick={() =>
                  TableData(document.getElementById("SampleStatusSearch").value)
                }
              />
            )}
          </div>
          <div className="col-sm-1">
            <CustomButton
              text={"Reset"}
              icon={"refresh"}
              onClick={handleResetFilters}
            />
          </div>{" "}
          {/* <div className="col-sm-2">
            <Input
              type="text"
              placeholder=""
            />
          </div> */}
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={

          <div className=" d-flex" style={{ gap: "5px" }}>
            <div className="d-flex align-items-center" style={{ gap: "10px", fontSize: "12px" }}>

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
            {colorCodingData.map(({ color, labelKey, id }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={t(labelKey)}
              />
            ))}
          </div>
        }
      >
        <>
          {barcodePrintError && (
            <div className="alert alert-danger mx-2 mt-2 mb-0" role="alert">
              {barcodePrintError}
            </div>
          )}
          <div className="row px-2 mt-2 mb-2">
            <div className="col-12">
              {loading ? (
                <Loading />
              ) : toggleTable ? (
                <>
                  {scdata.length > 0 ? (
                    <>
                      <Tables
                        style={{
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        <thead className="cf" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                          <tr>
                            {controllerDynamicList?.filter(item => {
                              if (item?.IsShow == 1 && item?.TypeId == 2) return item
                            })?.map((theader, idx) => {
                              if (theader?.TypeName !== "Table" || theader?.IsShow !== 1) return null;
                              switch (theader?.ControlDisplayID) {
                                case 'S.No':
                                  return <th key={idx}>{t("S.No")}</th>;
                                case 'Barcode No':
                                  return <th key={idx}>{t("Barcode No")}</th>;
                                case 'Reg Date':
                                  return <th key={idx}>{t("Reg Date")}</th>;
                                case 'VisitNo':
                                  return <th key={idx}>{t("VisitNo")}</th>;
                                case 'Name':
                                  return <th key={idx}>{t("Name")}</th>;
                                case 'RateTypeName':
                                  return <th key={idx}>{t("RateTypeName")}</th>;
                                case 'RateTypeCode':
                                  return <th key={idx}>{t("RateTypeCode")}</th>;
                                case 'RateTypeNameWithCode':
                                  return <th 
                                    style={{ minWidth: "150px", minWidth: "150px", width: "150px", whiteSpace: "normal", wordBreak: "break-word" }}
                                  key={idx}>{t("RateTypeNameWithCode")}</th>;
                                case 'TestCode':
                                  return <th key={idx}>{t("TestCode")}</th>;
                                case 'TestName':
                                  return <th 
                                    style={{ minWidth: "200px", minWidth: "200px", width: "200px", whiteSpace: "normal", wordBreak: "break-word" }}
                                  key={idx}>{t("TestName")}</th>;
                                case 'Collection Time':
                                  return <th key={idx}>{t("Collection Time")}</th>;
                                case '"Collection Boy':
                                  return <th key={idx}>{t("Collection Boy")}</th>;
                                case 'Remarks':
                                  return <th key={idx}>{t("Remarks")}</th>;
                                case 'HLMPatientType':
                                  return <th key={idx} className="text-center">
                                    {t("HLMPatientType")}
                                  </th>;
                                  case 'HLMOPDIPDNo':
                                  return <th key={idx} className="text-center">
                                    {t("HLMOPDIPDNo")}
                                  </th>;
                                  case 'Barcode':
                                  return <th key={idx} className="text-center">
                                    <i title={t("Barcode")} className="fa fa-barcode"></i>
                                  </th>;
                                case 'VisitID':
                                  return <th key={idx}></th>;
                                default:
                                  return (
                                    <th className="text-center" key={idx} data-title={t(theader.ControlDisplayName)}>
                                      {theader.ControlDisplayID || ''}
                                    </th>
                                  );
                              }
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {scdata &&
                            scdata?.map((data, index) => (
                              <tr key={index}>
                                {controllerDynamicList
                                  ?.filter((item) => {
                                    if (item?.IsShow == 1 && item?.TypeId == 2)
                                      return item;
                                  })
                                  ?.map((column, colIndex) => {
                                    if (column?.ControlDisplayID == "S.No") {
                                      return (
                                        <td data-title={t("S.No")}>
                                          <div
                                            style={{
                                              display: "flex",
                                              margin: "0",
                                              gap: "4px",
                                            }}
                                          >
                                            {index + 1 + IndexHandle(currentPage, pageSize)}
                                            {data?.IsPatientDocAvail > 0 && (
                                              <div>
                                                <i
                                                  className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                                                  // className="bi bi-paperclip cursor-pointer"
                                                  style={{ fontSize: "16px" }}
                                                  onClick={() => handleOpenPreview(data?.awsKeys)}
                                                  title="View Attachments"
                                                />
                                              </div>
                                            )}
                                            {data?.isUrgent === 1 && (
                                              <div>
                                                <img
                                                  src={Urgent}
                                                  className="sizeicon"
                                                  title="Urgent"
                                                ></img>
                                              </div>
                                            )}
                                            {data?.IsVip === 1 && (
                                              <div>
                                                <i
                                                  className="bi bi-shield-fill-check mr-1 vip-font-size"
                                                  style={{ color: "#FFC107", display: "inline", width: "5%" }}
                                                  title="VIP Patient"
                                                />
                                              </div>

                                            )}
                                          </div>
                                        </td>
                                      );
                                    }

                                    if (
                                      column?.ControlDisplayID === "Barcode No"
                                    ) {
                                      const list = (() => {
                                        try {
                                          return (
                                            (typeof data?.PliDataList === "string" ? JSON.parse(data.PliDataList) : (Array.isArray(data?.PliDataList) ? data.PliDataList : []))
                                          );
                                        } catch {
                                          return [];
                                        }
                                      })();

                                      const uniqueBarcodes = list.filter(
                                        (pliItem, idx, self) =>
                                          pliItem?.BarcodeNo &&
                                          idx ===
                                          self.findIndex(
                                            (t) =>
                                              t.BarcodeNo === pliItem.BarcodeNo,
                                          ),
                                      );

                                      return (
                                        <td
                                          data-title={t("Barcode No")}
                                          key={colIndex}
                                        >
                                          {uniqueBarcodes.length > 0 ? (
                                            uniqueBarcodes.map((pliItem, idx) => (
                                              <Tooltip
                                                key={idx}
                                                label={pliItem.SampleName}
                                                className="d-flex justify-content-start"
                                              >
                                                <p
                                                  className="fw-bold mb-0 sc-barcode-no"
                                                  style={{ padding: "3px 5px" }}
                                                >
                                                  {pliItem.BarcodeNo}
                                                </p>
                                              </Tooltip>
                                            ))
                                          ) : (
                                            <p className="mb-0 sc-barcode-no">
                                              {data?.BarcodeNo || "-"}
                                            </p>
                                          )}
                                        </td>
                                      );
                                    }

                                    if (column?.ControlDisplayID == "Reg Date") {
                                      return (
                                        <td data-title={t("Date")}>
                                          {getFilterHeaderForMerge(
                                            "Reg Date",
                                          )?.map((item, idx) => (
                                            // <p className="mb-0">
                                            //   {headWithApiFields[item] ==
                                            //     "Date" ? (
                                            //     <div>
                                            //       <p className="mb-0">
                                            //         {
                                            //           data?.[
                                            //             headWithApiFields[item]
                                            //           ]?.split(" ")?.[0]
                                            //         }
                                            //       </p>
                                            //       <p className="mb-0">
                                            //         {data?.[
                                            //           headWithApiFields[item]
                                            //         ]
                                            //           ?.split(" ")
                                            //           .slice(1)
                                            //           .join(" ")}
                                            //       </p>
                                            //     </div>
                                            //   ) : (
                                            //     data?.[headWithApiFields[item]]
                                            //   )}
                                            // </p>
                                            <DateTimeCell dateString={data?.[headWithApiFields[item]]} />
                                          ))}
                                        </td>
                                      );
                                    }
                                    if (column?.ControlDisplayID == "VisitNo") {
                                      return (
                                        <td
                                          className={`Status-${data.Status} `}
                                          onClick={() =>
                                            SearchInvestigationData(
                                              data.LedgerTransactionID,
                                              data.isCreditVisit
                                            )
                                          }
                                          data-title={"Status"}
                                          style={{
                                            cursor: "pointer",

                                          }}
                                        >
                                          {getFilterHeaderForMerge(
                                            "VisitNo",
                                          )?.map((item, idx) => (
                                            <p className="mb-0">
                                              {data?.[headWithApiFields[item]]}
                                            </p>
                                          ))}
                                          {/* {data?.VisitNo}&nbsp; */}
                                        </td>
                                      );
                                    }
                                    if (column?.ControlDisplayID == "Name") {
                                      return (
                                        <td data-title={t("PName")}>
                                          {getFilterHeaderForMerge("Name")?.map(
                                            (item, idx) => (
                                              <p className="mb-1">
                                                {data?.[headWithApiFields[item]]}
                                              </p>
                                            ),
                                          )}
                                          <p className="mb-0">
                                            {getAccurateAge(data?.Age)} /{" "}
                                            {data?.Gender}
                                          </p>
                                        </td>
                                      );
                                    }

                                    if (
                                      column?.ControlDisplayID == "RateTypeName"
                                    ) {
                                      return (
                                        <td data-title={t("RateTypeName")}>
                                          {getFilterHeaderForMerge(
                                            "RateTypeName",
                                          )?.map((item, idx) => (
                                            <p className="mb-0">
                                              {data?.[headWithApiFields[item]]}
                                            </p>
                                          ))}
                                        </td>
                                      );
                                    }
                                    if (
                                      column?.ControlDisplayID == "RateTypeCode"
                                    ) {
                                      return (
                                        <td data-title={t("RateTypeCode")}>
                                          {getFilterHeaderForMerge(
                                            "RateTypeCode",
                                          )?.map((item, idx) => (
                                            <p className="mb-0">
                                              {data?.[headWithApiFields[item]]}
                                            </p>
                                          ))}
                                        </td>
                                      );
                                    }
                                    if (
                                      column?.ControlDisplayID ==
                                      "RateTypeNameWithCode"
                                    ) {
                                      return (
                                        <td
                                          data-title={t("RateTypeNameWithCode")}
                                          style={{ minWidth: "150px", minWidth: "150px", width: "150px", whiteSpace: "normal", wordBreak: "break-word" }}
                                        >
                                          {getFilterHeaderForMerge(
                                            "RateTypeNameWithCode",
                                          )?.map((item, idx) => (
                                            <p className="mb-0">
                                              {data?.[headWithApiFields[item]]}
                                            </p>
                                          ))}
                                        </td>
                                      );
                                    }
                                    if (column?.ControlDisplayID == "TestCode") {
                                      return (
                                        <td data-title={t("TestCode")}>
                                          {getFilterHeaderForMerge(
                                            "TestCode",
                                          )?.map((item, idx) => (
                                            <p className="mb-0">
                                              {data?.[headWithApiFields[item]]}
                                            </p>
                                          ))}
                                        </td>
                                      );
                                    }
                                    if (column?.ControlDisplayID == "TestName") {
                                      return (
                                        <td 
                                          data-title={t("TestName")}
                                          style={{ minWidth: "200px", minWidth: "200px", width: "200px", whiteSpace: "normal", wordBreak: "break-word" }}
                                          >
                                          {parse(data?.Test)}
                                        </td>
                                      );
                                    }
                                    if (
                                      column?.ControlDisplayID ==
                                      "Collection Time"
                                    ) {
                                      return (
                                        <td data-title={t("Collection Time")}>
                                          {getFilterHeaderForMerge(
                                            "Collection Time",
                                          )?.map((item, idx) => (
                                            // <p className="mb-0">
                                            //   {`${data?.[headWithApiFields[item]]?.split(" ")?.[0] || ""} 
                                            //    ${data?.[headWithApiFields[item]]?.split(" ")?.[1] || ""}`}
                                            // </p>
                                            <DateTimeCell dateString={data?.[headWithApiFields[item]]} />
                                          ))}
                                        </td>
                                      );
                                    }
                                    if (
                                      column?.ControlDisplayID == "Collection Boy"
                                    ) {
                                      return (
                                        <td data-title={t("Collection Boy")}>
                                          {getFilterHeaderForMerge(
                                            "Collection Boy",
                                          )?.map((item, idx) => (
                                            <p className="mb-0">
                                              {data?.[headWithApiFields[item]]}
                                            </p>
                                          ))}
                                        </td>
                                      );
                                    }
                                    if (column?.ControlDisplayID == "Remarks") {
                                      return (
                                        <td data-title={t("Remarks")}>
                                          <div key={index}>
                                            {/* Existing remarks text */}
                                            {getFilterHeaderForMerge(
                                              "Remarks",
                                            )?.map((item, idx) => (
                                              <p key={idx} className="mb-0">
                                                {data?.[headWithApiFields[item]]}
                                              </p>
                                            ))}
                                          </div>

                                          {/* Add / View Remarks section */}
                                          <div
                                            style={{ gap: "4px" }}
                                            className="d-flex align-items-center justify-content-center"
                                          >
                                            <div
                                              data-tooltip-id={`remark-tooltip-${index + 1}`}
                                              onClick={() => {
                                                setShowAddRemark({
                                                  modal: true,
                                                  rowData: { ...data },
                                                });
                                              }}
                                              style={{
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "3px",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  backgroundColor: "green",
                                                  borderRadius: "50%",
                                                  width: "18px",
                                                  height: "18px",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  boxShadow:
                                                    "0 1px 3px rgba(0,0,0,0.15)",
                                                }}
                                              >
                                                <FaPlus color="white" size={8} />
                                              </div>

                                              {data?.LabRemarkCount > 0 && (
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                  }}
                                                >
                                                  ({data.LabRemarkCount})
                                                </span>
                                              )}
                                            </div>

                                            {!!data?.RemarksList &&
                                              Array.isArray(
                                                JSON.parse(
                                                  data?.RemarksList || "[]",
                                                ),
                                              ) &&
                                              JSON.parse(
                                                data?.RemarksList || "[]",
                                              ).length > 0 && (
                                                <ReactTooltip
                                                  id={`remark-tooltip-${index + 1}`}
                                                  place="top"
                                                  style={{ zIndex: 9999 }}
                                                  clickable
                                                  content={
                                                    <RemarkTooltip
                                                      remarks={JSON.parse(
                                                        data?.RemarksList || "[]",
                                                      )}
                                                    />
                                                  }
                                                />
                                              )}
                                          </div>
                                        </td>
                                      );
                                    }
                                    if (column?.ControlDisplayID == "Barcode") {
                                      return (
                                        <td
                                          data-title={t("Barcode Print")}
                                          className="text-center"
                                        >
                                          <span
                                            // className="text"
                                            style={{ cursor: "pointer" }}
                                          >
                                            {(data?.Status == 2 ||
                                              data?.Status == 3) &&
                                              !(data?.BarcodeLogicID == 3) ? (
                                              <i
                                                className="fa fa-print"
                                                onClick={() => {
                                                  getBarcodeData(
                                                    // data?.TestID,
                                                    [], //sending testID Blank Array instead of single one
                                                    data?.VisitNo,
                                                    [data?.SinNo],
                                                  );
                                                }}
                                              ></i>
                                            ) : null}
                                          </span>
                                          &nbsp;
                                        </td>
                                      );
                                    }
                                    if (column?.ControlDisplayID == "VisitID") {
                                      return (
                                        
                                        <td className="text-center">
                                          {!(DefaultCurrencyName === "KES" && RateCentreType === "B2B") && (
                                          <i
                                            className="fa fa-search mt-2 mb-1"
                                            style={{
                                              cursor: "pointer",
                                              color: "red",
                                            }}
                                            onClick={() => {
                                              setShowLog({
                                                modal: true,
                                                visitId: data?.VisitNo,
                                              });
                                            }}
                                          />
                                          )}
                                        </td>
                                      );
                                    }

                                    const handledColumns = [
                                      "S.No",
                                      "Barcode No",
                                      "Reg Date",
                                      "VisitNo",
                                      "Name",
                                      "RateTypeName",
                                      "RateTypeCode",
                                      "RateTypeNameWithCode",
                                      "TestCode",
                                      "TestName",
                                      "Collection Time",
                                      "Remarks",
                                      "Barcode",
                                      "UHID"
                                    ];
                                    if (
                                      !handledColumns.includes(
                                        column?.ControlDisplayID?.split("/")?.[0],
                                      ) &&
                                      column?.TypeId === 2 &&
                                      column?.IsShow === 1 &&
                                      isHeaderKeyPresentInResObj(
                                        column?.ControlDisplayID?.split("/")?.[0],
                                        data,
                                      )
                                    ) {
                                      return (
                                        <td
                                          key={colIndex}
                                          className="px-2"
                                          data-title={column?.ControlDisplayID}
                                        >
                                          <div className="text-wrap-width">
                                            {getFilterHeaderForMerge(
                                              column?.ControlDisplayID?.split(
                                                "/",
                                              )?.[0],
                                            )?.map((item, idx) => (
                                              <p key={idx} className="mb-0">
                                                {data[headWithApiFields[item]] ||
                                                  data[item]}
                                              </p>
                                            ))}
                                          </div>
                                        </td>
                                      );
                                    }
                                  })}
                              </tr>
                            ))}
                        </tbody>
                      </Tables>
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
                                  console.log("Value .value hello", value.value);
                                  TableData(
                                    document.getElementById("SampleStatusSearch")
                                      .value,
                                    "",
                                    "",
                                    "",
                                    1,
                                    value?.value,
                                  );
                                }}
                              />
                            </div>
                            <Pagination
                              className="pagination-bar"
                              currentPage={currentPage}
                              totalCount={totalCount}
                              pageSize={pageSize}
                              onPageChange={(page) => {
                                setCurrentPage(page);
                                TableData(
                                  document.getElementById("SampleStatusSearch")
                                    .value,
                                  "",
                                  "",
                                  "",
                                  page,
                                  pageSize,
                                );
                              }}
                            />
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <NoRecordFound />
                  )}
                </>
              ) : (
                <>
                  {show4?.modal && (
                    <MedicialModal
                      show={show4.modal}
                      handleClose={() => {
                        setShow4({
                          modal: false,
                          data: "",
                          index: -1,
                          ID: 0,
                        });
                      }}
                      MedicalId={show4?.data}
                      ID={show4?.ID}
                      handleUploadCount={handleUploadCount}
                    />
                  )}
                  {showRemark && (
                    <SampleRemark
                      show={showRemark}
                      handleShow={handleShowRemark}
                      state={handleShowRemark}
                      PageName={searchInvdata[0]?.Remarks}
                      handleSave={handleShowRemark}
                      title={"Remarks"}
                    />
                  )}
                  {showPrickRemark && (
                    <SampleRemark
                      show={showPrickRemark}
                      handleShow={handleShowPrickRemarks}
                      state={handleShowPrickRemarks}
                      PageName={searchInvdata[0]?.PricksRemarks}
                      handleSave={handleShowRemark}
                      title={"PricksRemarks"}
                    />
                  )}
                  {/* changes  */}
                  <div className="p-dialog-header custom-box-body mb-3">
                    <div className="custom-row wrap-fix">
                      <div className="custom-col custom-col-visit">
                        <span className="fa fa-folder custom-text">&nbsp;</span>
                        <span> {searchInvdata[0]?.VisitNo}</span>
                        {searchInvdata.filter((item) => item.StatSample == 1)
                          .length > 0 ? (
                          <span
                            className="fa fa-cog fa-spin"
                            data-toggle="tooltip"
                            data-placement="top"
                            title="STATSample"
                            style={{ marginLeft: "4px" }}
                          ></span>
                        ) : (
                          <></>
                        )}
                      </div>

                      <div className="custom-col">
                        <span className="fa fa-user custom-text">&nbsp;</span>
                        <span>{searchInvdata[0]?.PName}</span>
                      </div>

                      <div className="custom-col">
                        <span className="fa fa-book custom-text">&nbsp;</span>
                        <span>{searchInvdata[0]?.PatientCode}</span>
                      </div>

                      <div className="custom-col custom-col-age-gender">
                        <span className="fa fa-calendar custom-text">&nbsp;</span>
                        <span> {searchInvdata[0]?.Age}</span>
                        <span className="fa fa-street-view custom-text">
                          &nbsp;
                        </span>
                        <span> {searchInvdata[0]?.Gender}</span>
                      </div>

                      <div className="custom-col justify-content-center">
                        <span className="fa fa-h-square custom-text">&nbsp;</span>
                        <span>{searchInvdata[0]?.Centre}</span>
                      </div>

                      <div className="custom-col">
                        <span className="fa fa-user-md custom-text">&nbsp;</span>
                        <span> {searchInvdata[0]?.ReferDoctor}</span>
                      </div>

                      <div className="custom-col">
                        <span className="fa fa-plus-square custom-text">
                          &nbsp;
                        </span>
                        <span> {searchInvdata[0]?.RateType} </span>
                      </div>

                      <div className="custom-col custom-col-regdate">
                        <span className="fa fa-calendar custom-text">
                          &nbsp;{" "}
                        </span>
                        <span> {dateConfig(searchInvdata[0]?.RegDate)}</span>
                      </div>

                      <div className="custom-col custom-end">
                        <Tooltip label={"Uploaded Document"} className={"d-flex"}>
                          <img
                            src={file}
                            className="sizeicon"
                            onClick={() => {
                              setShow({
                                modal: true,
                                data: searchInvdata[0]?.PatientGuid,
                                LedgerTransactionIDHash: searchInvdata[0]?.LedgertransactionIDHash,
                              });
                            }}
                            style={{
                              color:
                                searchInvdata[0]?.UploadDocumentCount > 0
                                  ? "#4ea30c"
                                  : "black !important",
                              marginRight: "1px",
                              cursor: "pointer",
                            }}
                          ></img>
                          &nbsp;
                          <span className="mr-2">
                            {searchInvdata[0]?.UploadDocumentCount}
                          </span>
                        </Tooltip>
                        {/* <Tooltip label={"Medical History"} className={"d-flex"}> */}
                        <img
                          src={Medical}
                          className="sizeicon"
                          onClick={() => {
                            setShow4({
                              modal: true,
                              data: searchInvdata[0]?.PatientGuid,
                              ID: searchInvdata[0]?.LedgerTransactionID,
                            });
                          }}
                          style={{
                            color:
                              searchInvdata[0]?.MedicalHistoryCount > 0
                                ? "#4ea30c"
                                : "black !important",
                            marginRight: "1px",
                            cursor: "pointer",
                          }}
                          onMouseEnter={() => {
                            if (searchInvdata[0]?.MedicalHistoryCount > 0) {
                              fetchMedicalHistoryTooltipData(
                                searchInvdata[0]?.MedicalHistoryList,
                              );
                            }
                          }}
                          data-tooltip-id={`medical-history-tooltip-${searchInvdata[0]?.LedgerTransactionID}`}
                        ></img>
                        &nbsp;
                        <span className="mr-2">
                          {searchInvdata[0]?.MedicalHistoryCount > 0
                            ? searchInvdata[0]?.MedicalHistoryCount
                            : ""}
                        </span>
                        {searchInvdata[0]?.MedicalHistoryCount > 0 && (
                          <ReactTooltip
                            id={`medical-history-tooltip-${searchInvdata[0]?.LedgerTransactionID}`}
                            place="top"
                            style={{
                              zIndex: 99999,
                              backgroundColor: "#fff",
                              color: "#000",
                              padding: "5px",
                            }}
                            clickable
                            content={
                              medicalHistoryTooltipData?.data &&
                                medicalHistoryTooltipData.data.length > 0 ? (
                                <div
                                  style={{
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                    width: "400px",
                                    position: "relative",
                                  }}
                                >
                                  <table className="table table-sm table-bordered mb-0">
                                    <thead className="p-dialog-header">
                                      <tr>
                                        <th>S.No</th>
                                        <th>Medical History</th>
                                        <th>Created Date</th>
                                        <th>Created By</th>
                                      </tr>
                                    </thead>
                                    <tbody style={{ fontWeight: "500" }}>
                                      {medicalHistoryTooltipData.data.map(
                                        (item, idx) => (
                                          <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.MedicalHistory}</td>
                                            <td>
                                              {dateConfig(item.CreatedDate)}
                                            </td>
                                            <td>{item.CreatedBy}</td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                "No medical history found"
                              )
                            }
                          />
                        )}
                        {/* </Tooltip> */}
                        <Tooltip label={"Remark"}>
                          <img
                            src={Remark}
                            className="sizeicon"
                            onClick={() => setShowRemark(true)}
                            style={{ marginRight: "2px" }}
                          ></img>
                        </Tooltip>
                        <Tooltip label={"Pricks Remark"}>
                          <img
                            src={Prick}
                            className="sizeicon"
                            onClick={() => setShowPrickRemark(true)}
                          ></img>{" "}
                        </Tooltip>
                        {searchInvdata[0]?.IsVip === 1 && (
                          <div className="">
                            <span className="mx-2">
                              <i
                                className="bi bi-shield-fill-check vip-font-size"
                                style={{ color: "#FFC107", display: "inline", width: "5%" }}
                                title="VIP Patient"
                              />
                            </span>
                            {/* <span>VIP Patient</span> */}

                          </div>
                        )}
                        {searchInvdata[0]?.IsPatientDocAvail > 0 && (
                          <div>
                            <i
                              className="fa bi-file-earmark-pdf cursor-pointer"
                              // className="bi bi-paperclip cursor-pointer"
                              style={{ fontSize: "16px", color: "black", display: "flex", justifyContent: "center" }}
                              onClick={() => handleOpenPreview(searchInvdata[0]?.awsKeys)}
                              title="View Attachments"
                            />
                          </div>
                        )}
                      </div>



                    </div>
                  </div>
                  <div>
                    {searchInvdata.length > 0 ? (
                      <div
                        className="box-body divResult boottable table-responsive"
                        id="no-more-tables"
                      >
                        <Tables
                          style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                          }}
                        >
                          <thead>
                            <tr>
                              <th>{t("S.No")}</th>
                              <th>{t("Test Name")}</th>
                              <th>
                                <div>{t("Barcode Number")}</div>
                                {/* Skip Barcode Logic toggle */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    marginTop: "4px",
                                    justifyContent: "center",
                                  }}
                                >
                                  <label
                                    style={{
                                      position: "relative",
                                      display: "inline-block",
                                      width: "24px",
                                      height: "12px",
                                      margin: 0,
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={skipBarcodeLogic}
                                      onChange={(e) =>
                                        handleSkipBarcodeToggle(e.target.checked)
                                      }
                                      style={{
                                        opacity: 0,
                                        width: 0,
                                        height: 0,
                                        position: "absolute",
                                      }}
                                    />
                                    <span
                                      style={{
                                        position: "absolute",
                                        cursor: "pointer",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: skipBarcodeLogic
                                          ? "#28a745"
                                          : "#ccc",
                                        borderRadius: "12px",
                                        transition: "background-color 0.2s",
                                      }}
                                    >
                                      <span
                                        style={{
                                          position: "absolute",
                                          content: "",
                                          height: "8px",
                                          width: "8px",
                                          left: skipBarcodeLogic ? "14px" : "2px",
                                          bottom: "2px",
                                          backgroundColor: "white",
                                          borderRadius: "50%",
                                          transition: "left 0.2s",
                                        }}
                                      />
                                    </span>
                                  </label>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "600",
                                      whiteSpace: "nowrap",
                                      color: skipBarcodeLogic
                                        ? "#28a745"
                                        : "#666",
                                    }}
                                  >
                                    {t("Skip Barcode Logic")}
                                  </span>
                                </div>
                              </th>
                              <th>{t("Barcode Print")}</th>
                              <th>{t("Source")}</th>
                              <th>{t("DOS")}</th>
                              <th>{t("Vial Qty")}</th>
                              <th>{t("No Of Pricks")}</th>
                              <th>{t("Prick Remarks")}</th>
                              <th>{t("SampleTypeName")}</th>
                              <th>
                                <div className="d-flex align-items-center">
                                  <label
                                    className="switch mb-0"
                                    style={{
                                      position: "relative",
                                      display: "inline-block",
                                      width: "24px",
                                      height: "12px",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      onChange={(e) => handleRejectPayload(e)}
                                      checked={
                                        searchInvdata.length > 0 &&
                                        searchInvdata
                                          .filter(
                                            (ele) =>
                                              ele.Approved === 0 &&
                                              ele.Status !== 4,
                                          )
                                          .every((ele) => ele.isReject) &&
                                        searchInvdata.filter(
                                          (ele) =>
                                            ele.Approved === 0 &&
                                            ele.Status !== 4,
                                        ).length > 0
                                      }
                                      style={{
                                        opacity: 0,
                                        width: 0,
                                        height: 0,
                                        position: "absolute",
                                      }}
                                    />
                                    <span
                                      style={{
                                        position: "absolute",
                                        cursor: "pointer",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor:
                                          searchInvdata.length > 0 &&
                                            searchInvdata
                                              .filter(
                                                (ele) =>
                                                  ele.Approved === 0 &&
                                                  ele.Status !== 4,
                                              )
                                              .every((ele) => ele.isReject) &&
                                            searchInvdata.filter(
                                              (ele) =>
                                                ele.Approved === 0 &&
                                                ele.Status !== 4,
                                            ).length > 0
                                            ? "#28a745"
                                            : "#ccc",
                                        borderRadius: "12px",
                                        transition: "background-color 0.2s",
                                      }}
                                    >
                                      <span
                                        style={{
                                          position: "absolute",
                                          content: "",
                                          height: "8px",
                                          width: "8px",
                                          left:
                                            searchInvdata.length > 0 &&
                                              searchInvdata
                                                .filter(
                                                  (ele) =>
                                                    ele.Approved === 0 &&
                                                    ele.Status !== 4,
                                                )
                                                .every((ele) => ele.isReject) &&
                                              searchInvdata.filter(
                                                (ele) =>
                                                  ele.Approved === 0 &&
                                                  ele.Status !== 4,
                                              ).length > 0
                                              ? "14px"
                                              : "2px",
                                          bottom: "2px",
                                          backgroundColor: "white",
                                          borderRadius: "50%",
                                          transition: "left 0.2s",
                                        }}
                                      />
                                    </span>
                                  </label>
                                  <span className="ml-2">{t("Reject")}</span>
                                </div>
                              </th>

                              <th className="text-center">
                                {handleCheckboxCondition(searchInvdata) && (
                                  <input
                                    type="checkbox"
                                    onChange={(e) => {
                                      setTimeout(handlePayload(e), 500);
                                    }}
                                    className="mt-1"
                                    checked={
                                      searchInvdata.length > 0
                                        ? (() => {
                                          const validRows =
                                            searchInvdata.filter(
                                              (ele) =>
                                                ele.SINNo &&
                                                ele.SINNo.length >= 3,
                                            );
                                          console.log({ validRows })
                                          const returnData =
                                            validRows.length > 0
                                            &&
                                            validRows.every(
                                              (ele) => ele.isSelected,
                                            );
                                          console.log({ returnData });
                                          return returnData;
                                        })()
                                        : false
                                    }
                                  />
                                )}
                              </th>
                              {accessRight.includes("29") && (
                                <th>
                                  <div className="d-flex align-items-center">
                                    <label
                                      className="switch mb-0"
                                      style={{
                                        position: "relative",
                                        display: "inline-block",
                                        width: "24px",
                                        height: "12px",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        onChange={(e) =>
                                          handleRemoveBarcodePayload(e)
                                        }
                                        checked={
                                          searchInvdata.length > 0 &&
                                          searchInvdata
                                            .filter(
                                              (ele) =>
                                                (ele?.SINNo ||
                                                  ele?.BarcodeNo) &&
                                                ele?.ResultFlag === 0 &&
                                                ele?.MacDataCount === 0
                                            )
                                            .every((ele) =>
                                              removeBarcodePayload.includes(
                                                ele?.TestIDHash ||
                                                ele?.TestIdhash
                                              )
                                            ) &&
                                          searchInvdata.filter(
                                            (ele) =>
                                              (ele?.SINNo ||
                                                ele?.BarcodeNo) &&
                                              ele?.ResultFlag === 0 &&
                                              ele?.MacDataCount === 0
                                          ).length > 0
                                        }
                                        style={{
                                          opacity: 0,
                                          width: 0,
                                          height: 0,
                                          position: "absolute",
                                        }}
                                      />
                                      <span
                                        style={{
                                          position: "absolute",
                                          cursor: "pointer",
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          backgroundColor:
                                            searchInvdata.length > 0 &&
                                              searchInvdata
                                                .filter(
                                                  (ele) =>
                                                    (ele?.SINNo ||
                                                      ele?.BarcodeNo) &&
                                                    ele?.ResultFlag === 0 &&
                                                    ele?.MacDataCount === 0
                                                )
                                                .every((ele) =>
                                                  removeBarcodePayload.includes(
                                                    ele?.TestIDHash ||
                                                    ele?.TestIdhash
                                                  )
                                                ) &&
                                              searchInvdata.filter(
                                                (ele) =>
                                                  (ele?.SINNo ||
                                                    ele?.BarcodeNo) &&
                                                  ele?.ResultFlag === 0 &&
                                                  ele?.MacDataCount === 0
                                              ).length > 0
                                              ? "#28a745"
                                              : "#ccc",
                                          borderRadius: "12px",
                                          transition: "background-color 0.2s",
                                        }}
                                      >
                                        <span
                                          style={{
                                            position: "absolute",
                                            content: "",
                                            height: "8px",
                                            width: "8px",
                                            left:
                                              searchInvdata.length > 0 &&
                                                searchInvdata
                                                  .filter(
                                                    (ele) =>
                                                      (ele?.SINNo ||
                                                        ele?.BarcodeNo) &&
                                                      ele?.ResultFlag === 0 &&
                                                      ele?.MacDataCount === 0
                                                  )
                                                  .every((ele) =>
                                                    removeBarcodePayload.includes(
                                                      ele?.TestIDHash ||
                                                      ele?.TestIdhash
                                                    )
                                                  ) &&
                                                searchInvdata.filter(
                                                  (ele) =>
                                                    (ele?.SINNo ||
                                                      ele?.BarcodeNo) &&
                                                    ele?.ResultFlag === 0 &&
                                                    ele?.MacDataCount === 0
                                                ).length > 0
                                                ? "14px"
                                                : "2px",
                                            bottom: "2px",
                                            backgroundColor: "white",
                                            borderRadius: "50%",
                                            transition: "left 0.2s",
                                          }}
                                        />
                                      </span>
                                    </label>
                                    <span className="ml-2">
                                      {t("Remove Barcode")}
                                    </span>
                                  </div>
                                </th>
                              )}
                              <th>{t("Urgent")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchInvdata?.map((data, index) => (
                              <tr
                                key={index}
                                style={{
                                  backgroundColor:
                                    HideOutSourceColor != 1 ? data?.isOutSource == 1 ? "pink" : "" : "",
                                }}
                              >
                                {console.log("data", data)}
                                <SampleCollectionTable
                                  data={data}
                                  index={index}
                                  payload={payload}
                                  setPayload={setPayload}
                                  rejectPayload={rejectPayload}
                                  handleRejectPayload={handleRejectPayload}
                                  setSearchInvdata={setSearchInvdata}
                                  searchInvdata={searchInvdata}
                                  TableData={TableData}
                                  handleBarcode={handleBarcode}
                                  handleCloseBarcodeModal={
                                    handleCloseBarcodeModal
                                  }
                                  handleValQty={handleValQty}
                                  snr={snr}
                                  accessRight={accessRight}
                                  removeBarcodePayload={removeBarcodePayload}
                                  setRemoveBarcodePayload={setRemoveBarcodePayload}
                                  handleRemoveBarcodePayload={handleRemoveBarcodePayload}
                                />
                              </tr>
                            ))}
                          </tbody>
                        </Tables>
                      </div>
                    ) : (
                      "No Data Found"
                    )}
                    {saveLoad ? (
                      <Loading />
                    ) : (
                      <div className="row mt-3 mb-2">
                        <div className="d-flex col-md-12 ms-auto justify-content-end align-items-center">
                          <div className="col-sm-2 col-6">
                            <DatePicker
                              showOnFocus={false}
                              value={sampleCollectionDateTime?.data}
                              className="custom-calendar grow"
                              name="data"
                              placeholder={t("SampleCollectionDate")}
                              id="data"
                              lable={t("SampleCollectionDate")}
                              maxDate={new Date()}
                              onChange={handleDateTime}
                              onKeyDown={(e) => handleKeyDown(e, "data")}
                            />
                          </div>
                          <div
                            style={{ minWidth: "110px" }}
                            className="col-md-1 col-sm-3 col-4"
                          >
                            {/* <CustomTimePicker
                              name="time"
                              toolTipText={t("SampleCollectionTime")}
                              value={sampleCollectionDateTime?.time}
                              id="time"
                              lable={t("Samp.Time")}
                              onChange={handleDateTime}
                              onKeyDown={(e) => handleKeyDown(e, "time")}
                            /> */}
                            {isKESB2B ? (
                              <>
                                  <input
                                    type="time"
                                    label={t("Samp.Time")}
                                    step="1"
                                    value={
                                      isKESB2B &&
                                      sampleCollectionDateTime?.time === "00:00:00"
                                        ? ""
                                        : sampleCollectionDateTime?.time || ""
                                    }
                                    onChange={(e) =>
                                      handleDateTime(e.target.value, "time")
                                    }
                                    className="form-control"
                                  />
                                   <label
                                    htmlFor="time"
                                    className="label lable truncate time_Lable customeFont"
                                  >
                                    {t("Samp.Time")}
                                  </label>
                                  </>
                                ) : (
                                  <CustomTimePicker
                                    name="time"
                                    value={sampleCollectionDateTime?.time}
                                    id="time"
                                    lable={t("Samp.Time")}
                                    onChange={handleDateTime}
                                    onKeyDown={(e) => handleKeyDown(e, "time")}
                                  />
                                )}
                          </div>
                          <CustomButton
                            text={"Main List"}
                            icon={"list"}
                            onClick={() => {
                              setToggleTable(true);
                              setPayload([]);
                              setSampleCollectionDateTime(() => {
                                const now = new Date();
                                const hours = String(now.getHours()).padStart(
                                  2,
                                  "0",
                                );
                                const minutes = String(now.getMinutes()).padStart(
                                  2,
                                  "0",
                                );
                                return {
                                  data: now,
                                  time: `${hours}:${minutes}:00`,
                                };
                              });
                            }}
                          />
                          &nbsp;
                          {newdata && (
                            <CustomButton
                              text={"Collect"}
                              onClick={() => {
                                SaveSampleCollection();
                              }}
                            />
                          )}
                          &nbsp;
                          {accessRight.includes("29") && (
                            <CustomButton
                              text={"Remove Barcode"}
                              className="btn btn-danger btn-sm"
                              onClick={RemoveBarcode}
                            />
                          )}
                          &nbsp;
                          {rejectPayload.length > 0 && (
                            <CustomButton
                              text={"Reject"}
                              className="btn btn-danger btn-sm"
                              onClick={() => setShowRejectModal(true)}
                            />
                          )}
                          &nbsp;
                          {snr && (
                            <CustomButton
                              text={"SNR"}
                              onClick={() => {
                                SaveSNR();
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>{" "}
          </div>{" "}
          <PdfPreviewModal
            visible={previewConfig.visible}
            url={previewConfig.url}
            onClose={handleClosePreview}
          />
        </>
      </Accordion>
    </>
  );
};

export default SampleCollection;
