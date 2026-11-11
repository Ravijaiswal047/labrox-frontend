import React, { useEffect, useRef, useState } from "react";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import { toast } from "react-toastify";
import moment from "moment";
import { useTranslation } from "react-i18next";
import TemplateMasterModal from "../utils/TemplateMasterModal";
import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import RECultureTable from "../Table/RECultureTable";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  getCollectionBoy,
  getPaymentModes,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import {
  CheckDevice,
  DyanmicStatusResponse,
  DyanmicStatusResponseCulture,
  ExportToExcel,
  Time,
  dateConfig,
  downloadPdf,
  getMaxToDate,
  parseAwsKeys,
  parseRemarks,
} from "../../utils/helpers";
import {
  parseMappedSignature,
  resolveApprovalDoctor,
  withMappedDoctorOption,
} from "../../utils/dutyRosterApprovalDoctor";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import {
  DateTypeSearch2,
  defaultOption,
  getStatusColor,
  ReportTypePreliminary,
  CultureSampleStatus as SampleStatus,
  SearchByCulture,
} from "../../utils/Constants";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { Link, useLocation } from "react-router-dom";
import Tables from "../../components/UI/customTable";
import PatientDetailModal from "../utils/PatientDetailModal";
import CloseButton from "../../components/formComponent/CloseButton";
import ResultEntryTableCustom from "./ResultEntryTableCustom";
import Tooltip from "../../components/formComponent/Tooltip";
import SampleRemark from "../utils/SampleRemark";
import Pagination from "../../Pagination/Pagination";
import MultiBackGroundReactSelect from "./MultiBackGroundReactSelect";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import "./ResultEntry.css";
import { usePageControls } from "../../utils/hooks/usePageControls";
import {
  CustomButton,
  SaveButton,
  SearchButton,
} from "../../components/UI/CustomButton";
import { notify, logoList } from "../../utils/utils";
import { Dialog } from "primereact/dialog";
import { AutoComplete } from "primereact/autocomplete";
import { FloatLabel } from "primereact/floatlabel";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomSelectBox } from "../../components/formComponent/CustomSelectBox";
import Urgent from ".././Images/urgent.gif";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import { Label } from "recharts";
import RejectModal from "../utils/RejectModal";
import Reason from "../utils/Reason";

const ResultEntryCulture = () => {
  const [ResultTestData, setResultTestData] = useState([]);
  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const {
    ShowDefaultLoginCentre,
    MaxDateRangeatResultEntry,
    AllowZoneDiameterMicroResutlEntry,
    AllowBreakPointMicroResutlEntry,
    DefaultAllStatusResultEntry,
    DefaultDateTypeResultEntry,
    HideResultEntryPreview,
    AllowOrganismNameEditableAtResultEntry
  } = useLocalStorage("userData", "get");
  console.log(
    "AllowZoneDiameterMicroResutlEntry, AllowBreakPointMicroResutlEntry",
    AllowZoneDiameterMicroResutlEntry,
    AllowBreakPointMicroResutlEntry,
  );
  const maxRange = Number(MaxDateRangeatResultEntry) || 15;
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const [ResultData, setResultData] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [department, setDepartment] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Identity, setIdentity] = useState([]);
  const [reData, SetReData] = useState([]);
  const [bindOrganism, setBindOrganism] = useState([]);
  const [entry, setEntry] = useState([]);
  const [entryShow, setEntryShow] = useState(false);
  const [indexMatch, setIndexMatch] = useState(0);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [labObservationID, setlabObservationID] = useState(null);

  const today = new Date();
  const PAGE_ID = "860";
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    ItemValue: "",
    testCentreID: "0",
    SelectTypes: defaultOption?.value || "",
    DepartmentID: "",
    TestName: "",
    CentreID: "",
    SampleStatus: DefaultAllStatusResultEntry === "1" ? "" : "3",
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    IsTat: 0,
    Remarks: "",
    RemarkID: 0,
    DateTypeSearch: DefaultDateTypeResultEntry || "Date",
  });

  console.log("result-data", ResultData);




  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);

  const [showdetails, setshowDetails] = useState(true);
  const [statusValue, setStatusValue] = useState("");
  const [Sensitivity, setSensitivity] = useState([]);
  const [proEmployee, setProEmployee] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterData, setFilterData] = useState([]); // ✅ NEW: for table column controllers
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [remarkOptions, setRemarkOptions] = useState([]);
  const [reportFormatList, setReportFormatList] = useState([]);

  const [state, setState] = useState({
    ProEmployee: "",
  });
  const [entryPayload, setEntryPayload] = useState({
    ReportNumber: "Preliminary 1",
    HistoReportType: "0",
    organism: "",
    IncubationDate: new Date(),
    IncubationTime: "00:00:00",
    ApprovedBy: "",
    ApprovalName: "",
  });
  console.log("entryPayload", entryPayload);
  const [show5, setShow5] = useState({
    modal: false,
    data: "",
  });

  const [HiddenDropDownHelpMenu, setHiddenDropDownHelpMenu] = useState(false);
  const [showUD, setShowUD] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const myRefs = useRef([]);
  const [showMH, setShowMH] = useState({
    modal: false,
    data: "",
    index: -1,
    ID: 0,
  });
  const [PrintReportLoading, setPrintReportLoading] = useState(false);
  const [buttonsData, setButtonsData] = useState([]);
  const [helpmenu, setHelpMenu] = useState([]);
  const [transferCentres, setTransferCentres] = useState([]);
  const [defaultCentrePrefix, setDefaultCentrePrefix] = useState("");

  const [show3, setShow3] = useState({
    modal: false,
    data: {},
  });
  const [showReject, setShowReject] = useState({
    show: false,
    data: {},
  });
  const handleShowReject = () => {
    setShowReject({
      show: false,
      data: {},
    });
  };
  const handleCloseReject = () => {
    setResultData([]);
  };
  const [showFilter, setshowFilter] = useState(true);
  const [show2, setShow2] = useState({
    moadal: false,
    data: {},
  });
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const [showPH, setShowPH] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnConfig, setColumnConfig] = useState([]);
  const [reason, setReason] = useState({
    HoldShow: false,
    Hdata: "",
    type: "",
  });

  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "ResultCulture",
        pageName: "ResultCulture",
        EmployeeId: localData?.EmployeeID?.toString() || "",
        employeeId: localData?.EmployeeID?.toString() || "",
        EmployeeID: localData?.EmployeeID?.toString() || "",
      })
      .then((res) => {
        let data = res?.data?.message;
        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };

  const { t } = useTranslation();
  const pathname = useLocation()?.pathname;
  const { isActive } = usePageControls(pathname);
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });
  const [showReportModal, setShowReportModal] = useState({
    show: false,
    url: "",
  });
  const [vitekModal, setVitekModal] = useState({
    show: false,
    loading: false,
    data: [],
  });
  const theme = useLocalStorage("theme", "get");
  const localData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = localData?.DefaultCurrencyName;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        showReportModal.show &&
        (e.ctrlKey || e.metaKey) &&
        (e.key === "p" || e.key === "P")
      ) {
        e.preventDefault();
      }
    };
    if (showReportModal.show) {
      document.addEventListener("keydown", handleKeyDown, { capture: true });
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [showReportModal.show]);

  const BindApprovalDoctor = () => {
    axiosInstance
      .get("CommonController/BindApprovalDoctor")
      .then((res) => {
        // console.log(res)
        let data = res.data.message;
        let doctorData = data.map((ele) => {
          return {
            value: ele?.employeeid,
            label: ele?.name,
          };
        });
        setDoctorAdmin(doctorData);
      })
      .catch((err) => console.log(err));
  };

  const fetchTransferCentres = async (id) => {
    try {
      const res = await axiosInstance.get(
        "CommonController/BindTestCentreList",
      );
      const data = res.data;
      const list = data?.message.map((item) => ({
        label: item?.Centre,
        value: item?.CentreID,
      }));
      setTransferCentres(list);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTransferCentres();
  }, []);

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

  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;

    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        let allValues = CentreDataValue.map((ele) => ele.value);
        setCentreData(CentreDataValue);
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, CentreID: DefaultCentre }));
          fetchRateTypes([DefaultCentre], true);
        } else {
          fetchRateTypes(allValues, true);
        }
      })
      .catch((err) => console.log(err));
  };
  // console.log(entryShow);
  const getOrganimseName = (data, val, ReportNumber) => {
    if (!data) return;
    setEntryShow(true);
    let id = data.split(",").map(Number);
    console.log(val);
    let filteredId = bindOrganism.filter((item) => id.includes(item.value));

    console.log(filteredId);
    filteredId.forEach((entry) => {
      getEntryData(
        entry.value,
        entry.label,
        val?.TestID,
        val?.BarcodeNo,
        ReportNumber,
        false,
      );
    });
  };

  const getEntryData = (id, name, Testid, BarcodeNo, ReportNumber, key) => {
    console.log(entry, id);
    if (id) {
      const isPresent = entry?.some((innerArray) =>
        innerArray?.some((obj) => obj?.obid == id),
      );
      console.log(isPresent, key);
      if (!isPresent || !key) {
        axiosInstance
          .post("RECulture/BindObsAntibiotic", {
            TestId: Testid?.toString() ?? reData[ResultData[0]?.currentIndex]?.TestID?.toString(),
            BarcodeNo:
              BarcodeNo ?? reData[ResultData[0]?.currentIndex]?.BarcodeNo,
            ObsId: id,
            ObsName: name,
            ReportNumber: ReportNumber ?? entryPayload?.ReportNumber,
          })
          .then((res) => {
            let data = res.data.message;
            data = data.map((item, index) => {
              return {
                ...item,
                index: index,
                AntiBioticInterpreatation: item?.VALUE,
                isInput: false,
                Sensitive: item.Sensitive,
                Intermediate: item.Intermediate,
                Resistant: item.Resistant,

              };
            });
            setEntry((prevData) => [...prevData, data]);
          })
          .catch((err) =>
            toast.error(err?.response?.data?.message ?? "Something Went Wrong"),
          );
      } else {
        toast.error("Entry already added");
      }
    }
  };
  console.log("testid", reData[ResultData[0]?.currentIndex]?.TestID);
  // console.log(entry);
  function addItemAtIndex(outerIndex) {
    const newEntry = [...entry];
    const newItem = {
      ...newEntry[outerIndex][0],
      name: "",
      index: newEntry[outerIndex]?.length + 1,
      id: "0",
      isInput: true,
      AntiBioticInterpreatation: "",
      mic: "",
    };
    newEntry[outerIndex] = [...newEntry[outerIndex], newItem];
    setEntry(newEntry);
  }
  const handleFilterOrg = (outerIndex, innerIndex) => {
    const updatedEntry = [...entry];
    updatedEntry[outerIndex] = [...updatedEntry[outerIndex]];
    updatedEntry[outerIndex].splice(innerIndex, 1);
    setEntry(updatedEntry);
  };

  const removeArrayAtIndex = (index) => {
    const newData = [...entry];
    newData.splice(index, 1);
    setEntry(newData);
  };
  const handleSensitivity = (value, outerIndex, innerIndex, name) => {
    const newEntry = [...entry];
    newEntry[outerIndex][innerIndex][name] = value;
    setEntry(newEntry);
  };
  function setValuesForOuterIndex(outerIndex, name, value) {
    const newEntry = [...entry];
    newEntry[outerIndex] = newEntry[outerIndex].map((item) => {
      return {
        ...item,
        [name]: value,
      };
    });
    setEntry(newEntry);
  }
  const handleDoctorName = (e) => {
    if (entryPayload?.IsDutyRosterLocked) return;
    const { name, value, selectedIndex } = e.target;
    const label = e?.target?.children[selectedIndex].text;
    setEntryPayload({
      ...entryPayload,
      [name]: value,
      ApprovalName: label,
    });
  };
  const getBindOrganism = () => {
    axiosInstance
      .get("RECulture/BindOrganism")
      .then((res) => {
        let data = res?.data?.message;

        let organism = data?.map((ele) => {
          return {
            value: ele?.Id,
            label: ele?.NAME,
          };
        });

        setBindOrganism(organism);
      })
      .catch((err) => {
        console.log(err?.response?.data?.message);
      });
  };

  const getSensitivity = () => {
    axiosInstance
      .post("Global/getGlobalData", { Type: "Sensitivity" })
      .then((res) => {
        let data = res.data.message;
        // console.log(data);
        let value = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        setSensitivity(value);
      })
      .catch((err) => console.log(err));
  };

  const getRemarks = async () => {
    axiosInstance
      .post("Global/getGlobalData", {
        type: "LabRemarks",
      })
      .then((res) => {
        const message = res?.data?.message || [];

        if (!Array.isArray(message)) {
          setRemarkOptions([]);
          return;
        }

        const formattedRemarks = message.map((item) => ({
          label: item.FieldDisplay,
          value: item.FieldID,
        }));
        setRemarkOptions([
          { label: "Select Lab Remark", value: "" },
          { label: "Others", value: "others" },
          ...formattedRemarks,
        ]);
      })
      .catch((err) => console.log(err));
  };
  const getDepartment = () => {
    const searchPayload = {
      reportType: 21,
    };
    axiosInstance
      .post("Department/getDepartmentReportType", searchPayload)
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });

        setDepartment(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  const handleReactSelectChangeBoy = (name, option) => {
    setCollectionBoy(option?.value);
  };

  useEffect(() => {
    getDepartment();
    getAccessCentres();
    getPaymentModes("Identity", setIdentity);
    getBindOrganism();
    BindApprovalDoctor();
    getButtondata();
    getSensitivity();
    getCollectionBoy(setCollectionBoyList, true);
    controllerDynamic();
    getRemarks();
    getFilterResultOption();
  }, []);
  const fetchRateTypes = async (id, showLoader = false) => {
    if (showLoader) {
      setRateTypeLoading(true);
    }

    try {
      const res = await axiosInstance.post("Centre/BindRateTypeDropdown", {
        centreID: id.toString() || 0,
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
    } catch (err) {
      if (showLoader) {
        setRateTypeLoading(false);
      }
      console.log(err);
    }
    finally {
      if (showLoader) {
        setRateTypeLoading(false);
      }
    }
  };

  const totalPatient = () => {
    const visitNos = reData.map((item) => item?.LedgerTransactionNo);
    const uniqueVisitNos = new Set(visitNos);
    return uniqueVisitNos?.size;
  };

  const getHelpMenuData = (e, labObservationId) => {

    if (e?.which !== 13) {
      debugger;
      setHiddenDropDownHelpMenu(true);
      axiosInstance
        .post("RE/getHelpMenuInvestigationWise", {
          InvestigationID: labObservationId,
        })
        .then((res) => {
          setHelpMenu(res.data?.message);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };



  // Simplified function - no longer needed as dropdown shows automatically
  // const getHelpMenuData = (e, labObservationId) => {
  //   // Dropdown is now handled by ReactSelect component
  //   // This function is kept for backward compatibility
  // };


  const DepartmentWiseItemList = async (id, testName = "") => {
    await axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: id?.toString() || "",
        TestName: testName,
        reportType: 21,
      })
      .then((res) => {
        console.log("res", res);
        const data = res?.data?.message;
        if (!Array.isArray(res?.data?.message)) {
          setTestSuggestion([]);
          setItems([]);
          return;
        }
        const val = data.map((ele) => {
          return {
            label: ele?.TestName,
            value: ele?.InvestigationID,
          };
        });
        setTestSuggestion(val);

        const formatted = data.map((item) => ({
          label: item.TestName,
          value: item.InvestigationID,
          code: item.TestCode,
          dept: item.DepartmentID,
        }));
        setItems(formatted);
      })
      .catch((err) => {
        console.log(err);
        // toast.error(
        //   err?.response?.data?.message
        //     ? err?.response?.data?.message
        //     : "Error Occured"
        // );
      });
  };

  const setArrangeMentOfData = (data, subData) => {
    let mainData = [];
    subData.map((ele, _) => {
      data.map((eleInner, _) => {
        if (ele?.TestID === eleInner?.TestID) {
          mainData = [...mainData, eleInner];
        }
      });
    });
    setResultData(mainData);
  };
  const handleShowMapMenu = (labObservationID) => {
    if (!labObservationID) return;

    axiosInstance
      .post("Investigations/ShowMapMenu", {
        InvestigationID: labObservationID,
      })
      .then((res) => {
        const helpMenuString = res?.data?.message[0]?.HelpMenu || "";

        const helpMenuList = helpMenuString
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => ({
            label: item,
            value: item,
            Value: labObservationID,
          }));

        setHelpMenu(helpMenuList);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occured");
      });
  };






  const GetResultEntryCulture = (payload, index, loading, ReportNumber) => {
    if (loading) {
      loading(true);
    }
    setEntry([]);
    axiosInstance
      .post("RECulture/LabObservationSearch", {
        ...payload,
        ReportNumber: ReportNumber,
      })
      .then((res) => {
        console.log("Culture Res", res);
        const data = res?.data?.message?.message;

        const helpMenuRow = data?.find((row) => row?.IsHelpMenu > 0);
        if (helpMenuRow) {
          handleShowMapMenu(helpMenuRow?.labObservationID); // ← 315
        }



        // const reportFormatList = res?.data?.message?.cultureReportList;
        const reportFormatList = res?.data?.message?.cultureReportList?.map(
          (ele) => {
            return {
              label: ele?.ReportTypeName,
              value: ele?.ReportTypeId,
            };
          },
        );
        if (reportFormatList?.length > 0) {
          setReportFormatList(reportFormatList);
        }
        const val = data?.map((ele) => {
          return {
            ...ele,
            currentIndex: index,
            IsChecked: 1,
            SaveRangeStatus: 0,
          };
        });
        if (val && val.length > 1) {
          const lastElementCopy = { ...val[0] };
          lastElementCopy.LabObservationName = "Comments";
          lastElementCopy.TestName = "Comments";
          lastElementCopy.COMMENT = val[0]?.TestComment ?? "";
          lastElementCopy.InvestigationID = "";
          lastElementCopy.labObservationID = val[0]?.InvestigationID;
          lastElementCopy.Value = "";
          val.push(lastElementCopy);
        }
        const dataTestHeader = res?.data?.message?.testHeader;
        const valTestHeader = dataTestHeader?.map((ele) => {
          return {
            ...ele,
            IsChecked: 1,
            outSource: 1,
            isDocumentUpload: 0,
            TestCenterId: val[0]?.TestCentreID,
            LedgertransactionIDHash: payload?.LedgertransactionIDHash,
          };
        });
        val[0]?.OrgId &&
          getOrganimseName(val[0]?.OrgId, payload, ReportNumber);

        setResultTestData(valTestHeader);
        console.log("valTestHeader", valTestHeader);
        setArrangeMentOfData(val, valTestHeader);
        if (loading) {
          loading(false);
        }
        !val[0]?.OrgId && setEntryShow(false);
        // console.log(val[0]);
        setEntryPayload({
          ...entryPayload,
          ...(() => {
            const rosterDoctor = resolveApprovalDoctor({
              defaultSignatureID: val[0]?.DefaultSignatureID,
              currentApprovedBy: "",
              doctorAdmin,
              emptyValue: "",
            });
            return {
              ApprovedBy: rosterDoctor.approvedBy,
              ApprovalName: rosterDoctor.approvalName,
              IsDutyRosterLocked: rosterDoctor.locked,
            };
          })(),
          // ReportNumber: ReportNumber,
          ReportNumber: data[0]?.reporttype || ReportNumber,
          organism: "",
          IncubationDate: new Date(val[0]?.IncubationDate),
          IncubationTime: val[0]?.IncubationTime,
        });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        if (loading) {
          loading(false);
        }
        setEntryShow(false);
        setEntry([]);
      });
  };

  const handleGetVitekData = () => {
    const barcodeNo = ResultData[0]?.SINNo;
    if (!barcodeNo) {
      toast.error("Barcode No. not found");
      return;
    }
    setVitekModal({ show: true, loading: true, data: [] });
    axiosInstance
      .get("RECulture/GetVitekMachineData", { params: { barcodeNo } })
      .then((res) => {
        if (res?.data?.success) {
          setVitekModal({
            show: true,
            loading: false,
            data: res?.data?.data ?? [],
          });
        } else {
          setVitekModal({ show: true, loading: false, data: [] });
          toast.error(res?.data?.message || "No Vitek Data Found");
        }
      })
      .catch((err) => {
        setVitekModal({ show: false, loading: false, data: [] });
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleCloseVitekModal = () => {
    setVitekModal({ show: false, loading: false, data: [] });
  };

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

  const handleNotApproveRemark = (e, data) => {
    const { name, value } = e.target;
    const TestHeader = [...ResultTestData];
    const index = ResultTestData.indexOf(data);
    if (index >= 0) {
      TestHeader[index][name] = value;
      if (name === "HoldReason") TestHeader[index]["IsHold"] = 1;
      setResultTestData(TestHeader);
    }
    // Also update reason.Hdata so Reason modal reflects the typed value
    setReason((prev) => ({
      ...prev,
      Hdata: prev?.Hdata ? { ...prev.Hdata, [name]: value } : prev.Hdata,
    }));
  };

  const getFormattedDate = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const TableData = (SampleStatus, page = "", size = pageSize) => {
    setLoading(true);
    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });

    const CenterDatas = CentreData.map((item) => {
      return item?.value;
    });

    // UHID search auto-fills ItemValue with just the centre's prefix (e.g. "APC") so
    // the user can type the rest of the code. If they search without typing anything
    // past that prefix, don't send it as a filter — it isn't a real UHID.
    const isUhidPrefixOnly =
      payload?.SelectTypes === "lt.PatientCode" &&
      payload?.ItemValue?.trim() === defaultCentrePrefix?.trim();

    axiosInstance
      .post("RECulture/PatientSearch", {
        FromDate: getFormattedDate(payload?.FromDate),
        ToDate: getFormattedDate(payload?.ToDate),
        testCentreId: payload?.testCentreID ? Number(payload.testCentreID) : 0,
        DepartmentId: payload.DepartmentID,
        CollectionBoyID: Number(collectionBoy || 0),
        CentreId: payload?.CentreID ? [payload?.CentreID] : [],
        RateTypeID: payload?.RateTypeID ? [Number(payload?.RateTypeID)] : [],
        InvestigationId: payload?.TestName?.value?.toString() || "",
        SearchType: isUhidPrefixOnly ? "" : payload?.SelectTypes,
        SearchValue: isUhidPrefixOnly ? "" : payload?.ItemValue?.trim(),
        SampleStatus: SampleStatus,
        FromTime: payload?.FromTime,
        ToTime: payload?.ToTime,
        ProEmployeeID: Number(state?.ProEmployee || 0),
        pageNumber: Number(page),
        pageSize: Number(size),
        IsTat: Number(payload?.IsTat),
        remarks: payload?.Remarks || "",
        RemarkID:
          payload?.RemarkID === "others" ? 0 : Number(payload?.RemarkID) || 0,
        DateTypeSearch: payload?.DateTypeSearch || "Date",
        HistoReportType: String(entryPayload?.HistoReportType || "")
      })
      .then((res) => {
        SetReData(res?.data?.message);
        setOriginalTableData(res?.data?.message);
        setLoading(false);
        setStatusValue(
          SampleStatus === "" ? SampleStatus : parseInt(SampleStatus),
        );
        setTotalCount(res?.data?.data?.totalRecords || 0);
      })
      .catch((err) => {
        SetReData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setLoading(false);
        setTotalCount(0);
      });
  };
  const handleReactSelectChange = (name, option) => {
    setPayload((prev) => ({
      ...prev,
      [name]: String(option?.value ?? ""),
    }));
    if (name == "DepartmentID") {
      // DepartmentWiseItemList(option?.value, (testName = ""));
      DepartmentWiseItemList(option?.value, "");
    }
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setPayload({ ...payload, [label]: value?.value, RateTypeID: "" });
      setRateTypes([]);
      if (value?.value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value), true);
      } else {
        fetchRateTypes([value?.value], true);
      }
    } else if (label === "LabRemarks") {
      if (value?.value === "others") {
        setPayload({ ...payload, Remarks: "", RemarkID: "others" });
      } else {
        setPayload({
          ...payload,
          Remarks: value.value == "" ? "" : value?.label || "",
          RemarkID: value?.value == "" ? 0 : value?.value || 0,
        });
      }
    } else {
      setPayload({ ...payload, [label]: value?.value });
    }
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "DepartmentID") {
      setPayload({ ...payload, [name]: value, TestName: "" });
      DepartmentWiseItemList(value);
    } else if (name === "SelectTypes") {
      setPayload({
        ...payload,
        [name]: value,
        ItemValue: value === "lt.PatientCode" ? defaultCentrePrefix : "",
      });
    } else setPayload({ ...payload, [name]: value });
  };
  const dateSelect = (value, name) => {
    if (name === "FromDate") {
      const newFrom = new Date(value);

      const maxAllowedTo = new Date(newFrom);
      maxAllowedTo.setDate(maxAllowedTo.getDate() + maxRange);

      const today = new Date();
      const finalMaxTo = maxAllowedTo > today ? today : maxAllowedTo;

      let updatedToDate = payload.ToDate;

      // Case 1: ToDate < FromDate
      if (new Date(updatedToDate) < newFrom) {
        updatedToDate = finalMaxTo;
      }

      // Case 2: ToDate > allowed range
      if (new Date(updatedToDate) > finalMaxTo) {
        updatedToDate = finalMaxTo;
      }

      setPayload((prev) => ({
        ...prev,
        FromDate: value,
        ToDate: updatedToDate,
      }));

      return;
    }
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  const handleTime = (time, name) => {
    setPayload({ ...payload, [name]: time });
  };

  const handleSearchChange = (name, event) => {
    // const { name, value } = event.target;
    setPayload({ ...payload, [name]: event?.value });
    event?.value != -1 && TableData(event?.value);
  };
  const handleUploadCount = (name, value, secondName) => {
    let data = [...reData];
    if (name === "UploadDocumentCount") {
      data[showUD?.index][name] = value;
      data[showUD?.index][secondName] = value === 0 ? 0 : 1;
      SetReData(data);
    } else {
      data[showMH?.index][name] = value;
      data[showMH?.index][secondName] = value === 0 ? 0 : 1;
      SetReData(data);
    }
  };
  const dateSelect2 = (value, name) => {
    setEntryPayload({
      ...entryPayload,
      [name]: value,
    });
  };
  const handleTime2 = (time, secondName) => {
    let TimeStamp = "";
    TimeStamp = time?.Hour + ":" + time?.Minute + ":" + time?.second;
    setEntryPayload({ ...entryPayload, [secondName]: TimeStamp });
  };
  const handleCheckbox = (e, index, testid) => {
    const data = [...ResultData];

    const dataTestHeader = [...ResultTestData];
    const { value, checked, type, name } = e.target;
    if (index >= 0) {
      if (name === "Value") {
        data[index][name] = value;
      }

      if (type === "checkbox") {
        data[index][name] = checked;
      }
      setResultData(data);
    } else {
      const val = data.map((ele) => {
        if (testid === ele?.TestID) {
          return {
            ...ele,
            [name]: checked,
          };
        } else {
          return ele;
        }
      });

      const valTestHeader = dataTestHeader?.map((ele) => {
        if (testid === ele?.TestID) {
          return {
            ...ele,
            IsChecked: checked ? 1 : 0,
          };
        } else {
          return ele;
        }
      });
      setResultTestData(valTestHeader);
      setResultData(val);
    }
  };

  const handleResultSubmit = (field, headData) => {
    const errorToast = `This Test is ${DyanmicStatusResponseCulture(ResultTestData)}`;
    // console.log(field, errorToast);
    if (field === "Approved") {
      // console.log("first");
      const data = ResultData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 5 ||
            ele?.Status == 6 ||
            ele?.Status == 20) &&
          ele?.IsChecked === 1,
      );
      const val = ResultTestData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 5 ||
            ele?.Status == 6 ||
            ele?.Status == 20) &&
          ele?.IsChecked === 1,
      );
      validateData(field, data, errorToast, val);
    } else if (field === "Save") {
      const data = ResultData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 20 ||
            ele?.Status == 5 ||
            ele?.Status == 6) &&
          ele?.IsChecked === 1,
      );
      const val = ResultTestData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 20 ||
            ele?.Status == 5 ||
            ele?.Status == 6) &&
          ele?.IsChecked === 1,
      );
      validateData(field, data, errorToast, val);
    } else if (field === "Dual Authentication") {
      const data = ResultData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 20 ||
            ele?.Status == 5 ||
            ele?.Status == 6) &&
          ele?.IsChecked === 1,
      );
      const val = ResultTestData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 20 ||
            ele?.Status == 5 ||
            ele?.Status == 6) &&
          ele?.IsChecked === 1,
      );
      validateData(field, data, errorToast, val);
    } else if (field === "Not Approved") {
      const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
      const val = ResultTestData.filter(
        (ele) => ele?.TestID === headData.TestID,
      );
      validateData(field, data, "This test is Not Approved", val);
    } else if (field === "Hold") {
      const payload = ResultData.filter(
        (ele) => ele.Status !== 5 && ele.IsChecked === 1,
      );
      const val = ResultTestData.filter(
        (ele) => ele.Status !== 5 && ele.IsChecked === 1,
      );
      validateData(field, payload, errorToast, val);
    } else if (field === "Unhold") {
      const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
      const val = ResultTestData.filter(
        (ele) => ele?.TestID === headData.TestID,
      );
      validateData(field, data, t("This Test is not Hold"), val);
    } else {
      const payload = ResultData.filter((ele) => ele.IsChecked === 1);
      validateData(field, payload);
    }
  };
  const validateData = (field, payload, message, headerData) => {
    // console.log(payload, "3");
    if (payload?.length > 0) {
      if (
        [
          "Save",
          "Hold",
          "Unhold",
          "Not Approved",
          "Dual Authentication",
        ].includes(field)
      ) {
        fetchApi(field, payload, headerData);
      } else {
        if (checkDual(headerData)) {
          toast.error(checkDual(headerData));
        } else if (
          !entryPayload?.ApprovedBy &&
          !parseMappedSignature(payload?.[0]?.DefaultSignatureID).id
        ) {
          toast.error("Kindly Select Doctor");
        } else fetchApi(field, payload, headerData);
      }
    } else {
      toast.error(message);
    }
  };
  const checkDual = (headerData) => {
    console.log(headerData);
    for (let i = 0; i < headerData.length; i++) {
      if (
        headerData[i]["DualAuthentication"] == 1 &&
        headerData[i]["DualAuthenticatedcount"] != 2
      ) {
        return `Can't Be Approved. For ${headerData[i]?.PackageName} Dual Authentication Is Required`;
      }
    }
    return false;
  };

  const prop = () => {
    const visitNos = reData.map((item) => item?.TestID);
    const uniqueVisitNos = new Set(visitNos);
    return uniqueVisitNos?.size;
  };
  const getButtondata = () => {
    axiosInstance
      .get("RE/EmployeeAccessDetails")
      .then((res) => {
        setButtonsData(res.data.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Something Went Wrong"),
        );
      });
  };

  const printHeader = (isPrint, guid) => {
    let newResultTestData = [...ResultTestData].map((ele) => {
      return {
        ...ele,
        Printwithhead:
          ele?.TestIDHash === guid ? (isPrint ?? 0) : ele?.Printwithhead,
      };
    });
    setResultTestData(newResultTestData);
    let newResultData = [...ResultData].map((ele) => {
      return {
        ...ele,
        Printwithhead:
          ele?.TestIDHash === guid ? (isPrint ?? 0) : ele?.Printwithhead,
      };
    });
    setResultData(newResultData);
  };

  const handleReport = (key, headerData) => {
    // console.log("key");
    const data = ResultTestData.filter((ele) => ele?.IsChecked === 1);
    let TestIDHash = data.map((ele) => {
      return ele?.TestIDHash;
    });
    setPrintReportLoading(true);
    axiosReport
      .post(
        `commonReports/GetLabReport`,
        {
          ReportNumber: entryPayload?.ReportNumber,
          TestIDHash: TestIDHash,
          PrintColour: "0",
          PHead: 0,

          IsDownload: CheckDevice(),
        },
        {
          responseType: "blob",
        },
      )
      .then((res) => {
        const contentType = res?.headers?.["content-type"] || "";

        // Server returned JSON (success/error message) instead of a PDF
        if (contentType.includes("application/json")) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const json = JSON.parse(reader.result);
              if (json?.success) {
                if (key == "Yes") {
                  handleApproveReport(json?.url, headerData);
                } else {
                  setShowReportModal({ show: true, url: json?.url });
                }
              } else {
                key == "no" && toast.error(json?.message);
              }
            } catch {
              toast.error("Unexpected response from server.");
            }
            setPrintReportLoading(false);
          };
          reader.readAsText(res.data);
          return;
        }

        if (CheckDevice() == 1) {
          downloadPdf(res.data);
          setPrintReportLoading(false);
          return;
        }

        const blob = new Blob([res.data], { type: "application/pdf" });
        if (key == "Yes") {
          const reader = new FileReader();
          reader.onloadend = () => {
            handleApproveReport(reader.result, headerData);
            setPrintReportLoading(false);
          };
          reader.readAsDataURL(blob);
        } else {
          const blobUrl = URL.createObjectURL(blob);
          setShowReportModal({ show: true, url: blobUrl });
          setPrintReportLoading(false);
        }
      })
      .catch((err) => {
        // toast.error(
        //   err?.response?.data?.message
        //     ? err?.response?.data?.message
        //     : err?.data?.message
        // );
        setPrintReportLoading(false);
      });
  };
  const handleApproveReport = (Url, headerData) => {
    // console.log(Url, headerData);
    axiosInstance
      .post("RE/SendReport", {
        LedgerTransactionNo: headerData[0]?.LedgerTransactionNo,
        PatientName: headerData[0]?.PatientName,
        MobileNo: headerData[0]?.Mobile,
        PEmail: headerData[0]?.PEmail,
        URL: Url,
      })
      .then((res) => toast.success(res?.data?.message))
      .catch((err) => {
        console.log(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  console.log("payload:xx::", payload);
  console.log(entryPayload);

  const fetchApi = (field, payload, headerData) => {
    setLoading(true);
    const singleArrayOfObjects = entry?.reduce(
      (acc, arr) => acc.concat(arr),
      [],
    );
    const organismData = singleArrayOfObjects?.map((ele) => {
      return {
        ...ele,
        OrganismId: ele?.obid,
        MIC: ele?.mic,
        OrganismName: ele?.obname,
        AntiBioticGroupId: ele?.AntibioticGroupID,
        AntiBioticId: ele?.id,
        AntiBioticName: ele?.name,
        EnzymeName: ele?.obname,
        TestId: payload[0]?.TestID,
        OrganismGroupId: ele?.colonycount,
        OrganismGroupName: ele?.colonycountcomment,
      };
    });

    const flatEntry = Array.isArray(entry[0]) ? entry.flat() : entry;

    const savePayload = payload?.map((ele) => {
      const match = flatEntry.find(
        (item) => item.obid == ele.labObservationID
      );

      const obj = {
        ...ele,
        InvestigationId: ele?.InvestigationID,
        LabInvestigationId: ele?.InvestigationID,
        TestId: ele?.TestID,
        Inv: "",
        LabNo: ele?.LedgerTransactionNo,
        BarcodeNo: ele?.SINNo,
        LabObservationId: ele?.labObservationID,
        Description: ele?.COMMENT,
        Sensitive: match?.Sensitive || "",
        Intermediate: match?.Intermediate || "",
        Resistant: match?.Resistant || "",
      };

      delete obj.IsNablInvestigation;
      return obj;
    });

    console.log(
      "IisNablInvestigation: payload?.[0]?.IsNablInvestigation",
      payload,
    );
    if (field == "Approved") {
      const details = {
        Data: savePayload,
        ResultStatus: field,
        IsCritical: 0,
        HeaderInfo: headerData?.map((item, _) => {
          return {
            ...item,
            ApprovedBy: parseMappedSignature(payload?.[0]?.DefaultSignatureID).id || item?.ApprovedBy,
            IisNablInvestigation: payload?.[0]?.IsNablInvestigation,
          };
        }),
        AntiBioticData: organismData,
        ReportNumber: entryPayload?.ReportNumber,
        LedgertransactionId: savePayload[0]?.LedgerTransactionID,
        ApprovedBy:
          parseMappedSignature(payload?.[0]?.DefaultSignatureID).id || entryPayload?.ApprovedBy,
        ApprovalName: entryPayload?.ApprovalName,
      };

      axiosInstance
        .post("RECulture/SaveCultureData", details)
        .then((res) => {
          setLoading(false);
          // console.log(doctorAdmin);

          handleReport("Yes", headerData);
          // setResultData([]);
          setEntry([]);
          toast.success(res?.data?.message);

          setEntryPayload({
            ReportNumber: "Preliminary 1",
            organism: "",
            IncubationDate: new Date(),
            IncubationTime: "00:00:00",
            ApprovedBy: "",
            ApprovalName: "",
          });
          GetResultEntryCulture(
            {
              LedgerTransactionID: payload[0]?.LedgerTransactionID,
              TestID: payload[0]?.TestID,
              DepartmentID: payload[0]?.DepartmentID,
              VisitNo: payload[0]?.LedgerTransactionNo,
              BarcodeNo: payload[0]?.SINNo,
            },
            payload[0]?.currentIndex,
            setLoading,
            entryPayload?.ReportNumber,
          );
        })
        .catch((err) => {
          if (err.response.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response.status === 401) {
            toast.error(err.response.data.message);
          }
          if (err.response.status === 400) {
            toast.error(err.response.data.message);
          }
          setLoading(false);
        });
    } else {
      axiosInstance
        .post("RECulture/SaveCultureData", {
          Data: savePayload,
          ResultStatus: field,
          HeaderInfo: headerData?.map((item, _) => {
            return {
              ...item,
              ApprovedBy: parseMappedSignature(payload?.[0]?.DefaultSignatureID).id || item?.ApprovedBy,
              IisNablInvestigation: payload?.[0]?.IsNablInvestigation,
            };
          }),
          AntiBioticData: organismData,
          ReportNumber: entryPayload?.ReportNumber,
          LedgertransactionId: savePayload[0]?.LedgerTransactionID,
          NotApprovalComment: headerData[0]?.NotApproveRemark ?? "",
        })
        .then((res) => {
          setLoading(false);
          if (!res?.data?.success) {
            toast.error(res.data.message);
            return;
          }
          toast.success(res.data.message);
          // setResultData([]);
          GetResultEntryCulture(
            {
              LedgerTransactionID: payload[0]?.LedgerTransactionID,
              TestID: payload[0]?.TestID,
              DepartmentID: payload[0]?.DepartmentID,
              VisitNo: payload[0]?.LedgerTransactionNo,
              BarcodeNo: payload[0]?.SINNo,
            },
            payload[0]?.currentIndex,
            setLoading,
            entryPayload?.ReportNumber,
          );
          if (field == "Not Approved") {
            // setResultData([]);
            setEntry([]);
            setEntryPayload({
              ReportNumber: "Preliminary 1",
              organism: "",
              IncubationDate: new Date(),
              IncubationTime: "00:00:00",
              ApprovedBy: "",
              ApprovalName: "",
            });
          }
        })
        .catch((err) => {
          if (err.response.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response.status === 401) {
            toast.error(err.response.data.message);
          }
          setLoading(false);
        });
    }
  };
  const handleKeyUp = (e, targetElem) => {
    if (e.key === "Enter" && targetElem) {
      targetElem.focus();
    }
  };
  const checkDualAuthentication =
    ResultTestData?.length > 0
      ? ResultTestData?.some((ele) => ele?.DualAuthentication == 1)
      : false;

  const handleIndex = (e, index) => {
    // No longer used - dropdown navigation is handled by ReactSelect component
  };

  const handleListSearch = (data, name, index) => {
    const val = [...ResultData];
    val[index][name] = data?.label;
    setResultData(val);
    setHelpMenu([]);
    setHiddenDropDownHelpMenu(false);
  };
  const handleSave = (data, modal) => {
    if (modal === "AddComment") {
      if (data?.pageName === "Single") {
        let val = ResultData.map((ele) => {
          if (ele.labObservationID == data?.labObservationID) {
            return {
              ...ele,
              COMMENT: data?.COMMENT,
              SaveRangeStatus: 1,
            };
          } else {
            return ele;
          }
        });
        setResultData(val);
        setShow3({ modal: false, data: {} });
        setShow2({ moadal: false, data: {} });
      } else {
        let val = ResultTestData.map((ele) => {
          if (ele.TestID == data?.TestID) {
            return {
              ...ele,
              COMMENT: data?.COMMENT,
              SaveRangeStatus: 1,
              labObservationID: -1,
            };
          } else {
            return ele;
          }
        });
        setResultTestData(val);
        setShow3({ modal: false, data: {} });
        setShow2({ moadal: false, data: {} });
      }
    }

    if (modal === "TemplateMaster") {
      console.log(data);
      let val = ResultData.map((ele) => {
        if (ele.labObservationID == data?.labObservationID) {
          return {
            ...ele,
            COMMENT: data?.COMMENT,
            CommentID: data?.CommentID,
          };
        } else {
          return ele;
        }
      });
      setResultData(val);
      setShow3({ modal: false, data: {} });
      setShow2({ moadal: false, data: {} });
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("");
    }
  };

  const handleProEmployeeChange = (name, e) => {
    setState((prev) => ({ ...prev, [name]: e?.value }));
  };

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        let data = res?.data?.message;
        let proData = data?.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.EmployeeName,
          };
        });
        setProEmployee(proData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const statusCount = (key) => {
    if (key == "") {
      return originalTableData?.length;
    }
    return originalTableData?.filter((item) => item?.Status == key)?.length;
  };

  const filterStatusWise = (sampStatus) => {
    setPayload({ ...payload, ["SampleStatus"]: sampStatus });
    TableData(sampStatus);
  };

  const search = (event) => {
    DepartmentWiseItemList("", event.query);
  };

  useEffect(() => {
    getProEmployee();
  }, []);

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
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);

      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);

      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value.trim()) {
      // Reset: original data wapas laao with correct indexes
      const withIndex = originalTableData.map((ele, index) => ({
        ...ele,
        index: index,
        currentIndex: index,
      }));
      SetReData(withIndex);
      return;
    }

    const searchableKeys = [
      "PatientName",
      "PName",
      "LedgerTransactionNo",
      "Mobile",
      "PatientCode",
      "BarcodeNo",
      "Test",
      "Doctor",
      "Centre",
    ];

    const filtered = originalTableData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    // currentIndex: original position preserve karo (navigation ke liye)
    const withIndex = filtered.map((ele, index) => ({
      ...ele,
      index: index,
      currentIndex: originalTableData.findIndex(
        (orig) =>
          orig.LedgertransactionId === ele.LedgertransactionId &&
          orig.TestID === ele.TestID,
      ),
    }));

    SetReData(withIndex);
  };

  const handleExportExcel = () => {
    const ICON_COLS = new Set([
      "S.No", "Print", "Detail", "View Doc.", "Customize Date", "Remarks", "M.H",
    ]);
    const FALLBACK_COLUMNS = [
      "Reg. Date", "Incubation Date", "D.Recieve Date", "Collection Date Time",
      "Visit No.", "Barcode No", "UHID", "Patient Name", "Age/Gender",
      "RateTypeCode", "Test", "Status", "Doctor", "Centre", "LastRemark", "TAT Status",
    ];

    const hasDynamicFilter = filterData.some((item) => item.TypeId == 2);

    const rawTableCols = hasDynamicFilter
      ? filterData.filter(
          (item) =>
            item.TypeId == 2 &&
            item.IsShow == 1 &&
            !ICON_COLS.has(item.ControlDisplayID),
        )
      : FALLBACK_COLUMNS.map((header) => ({ ControlDisplayID: header }));

    // Only keep columns that are actually visible right now (respects the
    // column show/hide (gear icon) settings — same as what the table renders).
    const tableCols = rawTableCols.filter((col) => {
      if (!columnConfig || columnConfig.length === 0) return true;
      const header = col.ControlDisplayName || col.ControlDisplayID;
      const configItem = columnConfig.find(
        (c) => c.header?.toLowerCase() === header?.toLowerCase(),
      );
      if (configItem) return configItem.visible == 1 || configItem.visible === true;
      return true;
    });

    const getCellValue = (col, item) => {
      const colId = col?.ControlDisplayID;
      switch (colId) {
        case "Reg. Date":
          return item?.DATE ?? "";
        case "Incubation Date":
          return item?.incubationdate ?? "";
        case "D.Recieve Date":
          return [item?.SampleReceiveDate, item?.SampleReceiveTime]
            .filter(Boolean)
            .join(" ");
        case "Collection Date Time":
          return item?.PreSampleCollectionDate ?? "";
        case "Visit No.":
          return item?.LedgerTransactionNo ?? "";
        case "Barcode No":
          return item?.BarcodeNo ?? "";
        case "UHID":
          return item?.PatientCode ?? "";
        case "Patient Name":
          return item?.PName ?? "";
        case "Age/Gender":
          return item?.Age_Gender ?? "";
        case "RateTypeCode":
          return item?.RateTypeCode ?? "";
        case "Test":
          return item?.Test ?? "";
        case "Status":
          return item?.SampleStatus ?? "";
        case "Doctor":
          return item?.Doctor ?? "";
        case "Centre":
          return item?.Centre ?? "";
        case "TAT Status":
          if (item?.TATDelay == 1) return "Outside TAT";
          if (item?.TATIntimate == 1) return "Near TAT";
          return "Within TAT";
        case "LastRemark": {
          const remarks = parseRemarks(item?.RemarksList);
          if (!Array.isArray(remarks) || remarks.length === 0) return "";
          const sorted = [...remarks].sort(
            (a, b) =>
              moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") -
              moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A"),
          );
          return sorted[0]?.LabRemarks ?? "";
        }
        default: {
          const field = item?.[col?.ApiFieldName] ?? item?.[colId];
          if (Array.isArray(field)) return field.join(", ");
          if (typeof field === "object" && field !== null) return JSON.stringify(field);
          return field ?? "";
        }
      }
    };

    const excelData = reData.map((item, index) => {
      const row = { "S.No": index + 1 };
      tableCols.forEach((col) => {
        row[col.ControlDisplayName || col.ControlDisplayID] = getCellValue(
          col,
          item,
        );
      });
      return row;
    });

    ExportToExcel(excelData, "ResultCulture.xlsx");
  };

  return (
    <>
      {ResultData.length === 0 ? (
        <>
          {" "}
          {showMH?.modal && (
            <MedicialModal
              show={showMH.modal}
              handleClose={() => {
                setShowMH({
                  modal: false,
                  data: "",
                  index: -1,
                  ID: 0,
                });
              }}
              MedicalId={showMH?.data}
              ID={showMH?.ID}
              handleUploadCount={handleUploadCount}
            />
          )}
          {showUD?.modal && (
            <UploadFile
              show={showUD?.modal}
              handleClose={() => {
                setShowUD({ modal: false, data: "", index: -1 });
              }}
              options={Identity}
              documentId={showUD?.data}
              pageName="Patient Registration"
              handleUploadCount={handleUploadCount}
              formData={payload}
              LedgerTransactionIDHash={showUD?.LedgertransactionIDHash}
            />
          )}
          <Accordion
            name={t("Result Entry Culture")}
            defaultValue={true}
            linkTo="/resultculture"
            isBreadcrumb={true}
            seconTitle={
              <>
                <div className="link-title-container" id="pr_id_11">
                  <div className="link-title-item">
                    {t("Total Patient") + " : " + totalPatient()}
                  </div>
                  <div className="link-title-item">
                    {t("Total Test Count") + " : " + prop()}
                  </div>
                </div>
                <div className="">
                  <PageControlGear pageId={PAGE_ID} />
                </div>
              </>
            }
          >
            <div className="row px-2 mt-2 mb-1">
              {controllerDynamicList
                ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
                ?.map((item, index) => {
                  if (
                    item?.ControlDisplayID === "LabRemarks" &&
                    isHideController("LabRemarks")
                  ) {
                    return (
                      <>
                        <div className="col-sm-2" key={index}>
                          <ReactSelect
                            dynamicOptions={remarkOptions}
                            name="LabRemarks"
                            lable={t("Lab Remarks")}
                            id="LabRemarks"
                            removeIsClearable={true}
                            placeholderName={t("Lab Remarks")}
                            value={payload?.RemarkID}
                            onChange={handleSearchSelectChange}
                          />
                        </div>
                        {payload?.RemarkID === "others" && (
                          <div className="col-sm-2">
                            <Input
                              name="Remarks"
                              label={t("Enter Remark")}
                              value={payload?.Remarks}
                              onChange={handleSelectChange}
                            />
                          </div>
                        )}
                      </>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "SelectTypes" &&
                    isHideController("SelectTypes")
                  ) {
                    return (
                      <div className="col-sm-2">
                        <div className="d-flex">
                          <div style={{ width: "60%" }}>
                            <SelectBox
                              options={SearchByCulture}
                              id="SelectTypes"
                              lable="SelectTypes"
                              name="SelectTypes"
                              selectedValue={payload?.SelectTypes}
                              onChange={handleChange}
                            />
                          </div>
                          <div>
                            <div style={{ width: "100%" }}>
                              <Input
                                type="text"
                                name="ItemValue"
                                onKeyDown={handleKeyDown}
                                value={payload?.ItemValue}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "CentreID" &&
                    isHideController("CentreID")
                  ) {
                    return (
                      <div className="col-sm-2 ">
                        <div>
                          <ReactSelect
                            dynamicOptions={[
                              { label: "All Centre", value: "" },
                              ...CentreData,
                            ]}
                            name="CentreID"
                            lable={t("Centre")}
                            id="Centre"
                            removeIsClearable={true}
                            placeholderName={t("Centre")}
                            value={payload?.CentreID}
                            onChange={handleSearchSelectChange}
                          />
                          {/* <SelectBox
                      options={[
                        { label: "All Centre", value: "" },
                        ...CentreData,
                      ]}
                      selectedValue={payload?.CentreID}
                      name="CentreID"
                      lable="Centre"
                      id="Centre"
                      onChange={handleChange}
                    /> */}
                        </div>
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "testCentreID" &&
                    isHideController("testCentreID")
                  ) {
                    return (
                      <div className="col-sm-2">
                        <ReactSelect
                          dynamicOptions={[
                            { label: "All", value: "0" },
                            ...transferCentres,
                          ]}
                          name="testCentreID"
                          lable={t("Test Centre")}
                          id="testCentreID"
                          removeIsClearable={true}
                          placeholderName={t("Test Centre")}
                          value={payload?.testCentreID}
                          onChange={handleSearchSelectChange}
                        />
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "RateTypeID" &&
                    isHideController("RateTypeID")
                  ) {
                    return (
                      <div className="col-sm-2">
                        <ReactSelect
                          dynamicOptions={[
                            { label: "All RateType", value: "" },
                            ...RateTypes,
                          ]}
                          name="RateTypeID"
                          lable={t("RateType")}
                          id="RateType"
                          removeIsClearable={true}
                          placeholderName={t("RateType")}
                          value={payload?.RateTypeID}
                          onChange={handleSearchSelectChange}
                          isLoading={rateTypeLoading}


                        />
                        {/* <SelectBox
                    options={[{ label: "All RateType", value: "" }, ...RateTypes]}
                    name="RateTypeID"
                    lable="RateType"
                    id="RateType"
                    onChange={handleChange}
                    selectedValue={payload?.RateTypeID}
                  /> */}
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "DepartmentID" &&
                    isHideController("DepartmentID")
                  ) {
                    return (
                      <div className="col-sm-2 ">
                        <ReactSelect
                          placeholderName="Department"
                          searchable={true}
                          removeIsClearable={true}
                          id="Department"
                          name="DepartmentID"
                          onChange={handleReactSelectChange}
                          value={payload?.DepartmentID}
                          dynamicOptions={[
                            { label: "Select Department", value: "" },
                            ...department,
                          ]}
                        />
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "TestName" &&
                    isHideController("TestName")
                  ) {
                    return (
                      <div className="col-sm-2">
                        <FloatLabel>
                          <AutoComplete
                            value={value}
                            suggestions={items}
                            completeMethod={search}
                            // showClear={true}
                            field="label"
                            name="TestName"
                            itemTemplate={(item) => (
                              <div
                                className="border-bottom"
                                style={{ whiteSpace: "normal" }}
                              >
                                {item.label}
                              </div>
                            )}
                            onChange={(e) => {
                              setValue(e.value);
                              setPayload((prev) => ({
                                ...prev,
                                ["TestName"]: e?.value ?? "",
                              }));
                            }}
                            placeholder="Search Test..."
                            className="w-100"
                          />
                          {value && (
                            <span
                              onClick={() => {
                                setValue("");
                                setPayload((prev) => ({
                                  ...prev,
                                  TestName: "",
                                }));
                                const el = document.getElementById("testName");
                                if (el) el.classList.remove("p-filled");
                              }}
                              className="pi pi-times"
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#777",
                                fontSize: "1rem",
                                zIndex: 10,
                                background: "white",
                                padding: "2px",
                              }}
                            ></span>
                          )}
                          <label htmlFor="testName">Test Name</label>
                        </FloatLabel>
                        {/* <div>
                    <ReactSelect
                      dynamicOptions={TestSuggestion}
                      value={payload?.TestName}
                      name="TestName"
                      placeholderName="Select Test"
                      onChange={(name, option) => {
                        DepartmentWiseItemList("", option?.value);
                        setPayload((prev) => ({
                          ...prev,
                          [name]: option?.value ?? "",
                        }));
                      }}
                    />
                  </div> */}
                      </div>
                    );
                  }
                  {
                    /* <div className="col-sm-2">
                <SelectBox
                  options={SampleStatus}
                  onChange={handleSearchChange}
                  id="SampleStatus"
                  name="SampleStatus"
                  lable="SampleStatus"
                  selectedValue={payload?.SampleStatus}
                />
              </div> */
                  }
                  if (
                    item?.ControlDisplayID === "SampleStatus" &&
                    isHideController("SampleStatus")
                  ) {
                    return (
                      <div className="col-sm-2 mt-1">
                        <MultiBackGroundReactSelect
                          placeholderName="Sample Status"
                          dynamicOptions={SampleStatus}
                          value={payload?.SampleStatus}
                          onChange={handleSearchChange}
                          name="SampleStatus"
                          id="SampleStatus"
                          bgColor={true} // enable colored background
                        />
                      </div>
                    );
                  }

                  if (
                    item?.ControlDisplayID === "IsTat" &&
                    isHideController("IsTat")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
                        <CustomSelectBox
                          options={[
                            { label: "All", value: 0 },
                            {
                              label: "Within TAT",
                              value: 1,
                              style: {
                                backgroundColor: "green",
                                color: "white",
                              },
                            },
                            {
                              label: "Near TAT",
                              value: 2,
                              style: { backgroundColor: "yellow" },
                            },
                            {
                              label: "Outside TAT",
                              value: 3,
                              style: { backgroundColor: "red", color: "white" },
                            },
                          ]}
                          selectedValue={payload?.IsTat}
                          label="IsTat"
                          id="IsTat"
                          name="IsTat"
                          onChange={handleSelectChange}
                        />
                      </div>
                    );
                  }

                  if (
                    item?.ControlDisplayID === "collectionBoy" &&
                    isHideController("collectionBoy")
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
                          onChange={handleReactSelectChangeBoy}
                        />
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "ProEmployee" &&
                    isHideController("ProEmployee")
                  ) {
                    return (
                      <div className="col-sm-2 col-6">
                        <ReactSelect
                          dynamicOptions={[
                            { label: "Select", value: "" },
                            ...proEmployee,
                          ]}
                          name={"ProEmployee"}
                          id={"ProEmployee"}
                          label="ProEmployee"
                          value={state?.ProEmployee}
                          onChange={handleProEmployeeChange}
                          placeholderName={"ProEmployee"}
                          respclass={""}
                        />
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "DateTypeSearch" &&
                    isHideController("DateTypeSearch")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
                        <SelectBox
                          lable="DateTypeSearch"
                          options={DateTypeSearch2}
                          selectedValue={payload?.DateTypeSearch}
                          name="DateTypeSearch"
                          onChange={handleSelectChange}
                        />
                      </div>
                    );
                  }

                  if (
                    item?.ControlDisplayID === "FromDate" &&
                    isHideController("FromDate")
                  ) {
                    return (
                      <div className="col-sm-2 ">
                        <DatePicker
                          name="FromDate"
                          id="FromDate"
                          className="custom-calendar"
                          lable="FromDate"
                          value={payload?.FromDate}
                          onChange={dateSelect}
                          maxDate={new Date()}
                        />
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "FromTime" &&
                    isHideController("FromTime")
                  ) {
                    return (
                      <div className="col-sm-1">
                        <CustomTimePicker
                          name="FromTime"
                          placeholder="FromTime"
                          value={payload?.FromTime}
                          id="FromTime"
                          lable="FromTime"
                          onChange={handleTime}
                        />
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "ToDate" &&
                    isHideController("ToDate")
                  ) {
                    return (
                      <div className="col-sm-2 ">
                        <div>
                          <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable="ToDate"
                            // maxDate={new Date()}
                            minDate={new Date(payload?.FromDate)}
                            maxDate={getMaxToDate(payload?.FromDate, maxRange)}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "ToTime" &&
                    isHideController("ToTime")
                  ) {
                    return (
                      <div className="col-sm-1">
                        <CustomTimePicker
                          name="ToTime"
                          placeholder="ToTime"
                          value={payload?.ToTime}
                          id="ToTime"
                          lable="ToTime"
                          onChange={handleTime}
                        />
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "HistoReportType" &&
                    isHideController("HistoReportType")
                  ) {
                    return (
                      <div className="col-sm-2">
                        <SelectBox
                          className="form-control input-sm"
                          options={
                            // reportFormatList?.length > 0
                            //   ? reportFormatList
                            //   :
                               [{ label: "All", value: "0" }, ...ReportTypePreliminary]
                          }
                          selectedValue={entryPayload?.HistoReportType}
                          onChange={(e) => {
                            setEntryPayload({
                              ...entryPayload,
                              HistoReportType: e?.target?.value,
                            });
                          }}
                        />
                      </div>
                    );
                  }
                })}
              <div className="col-auto">
                <SearchButton
                  text={"Search"}
                  href="javascript:void(0)"
                  onClick={() => TableData(payload?.SampleStatus)}
                />
              </div>
              {reData?.length > 0 && (
                <div className="col-sm-auto">
                  <CustomButton
                    text={t("Excel")}
                    icon={"excel"}
                    onClick={handleExportExcel}
                  />
                </div>
              )}
            </div>
          </Accordion>
          <div className="mt-2 mb-3 px-2 py-1 bg-white d-flex sampleStatusClass">
            <strong style={{ minWidth: "100px" }}>Sample Status : </strong>
            {SampleStatus?.map((sItem, idx) => (
              <TableFilterDot
                color={`${getStatusColor(sItem?.value)}`}
                // color={"#f1a098"}
                title={`${sItem?.label} (${statusCount(sItem?.value)})`}
                onClick={() => filterStatusWise(sItem?.value)}
                bgColor={`#e9e2e1`}
              />
            ))}
          </div>
          <Accordion
            title={
              <div className="d-flex">
                <span className="mt-1">
                  {t("Search Data")}
                </span>
                <i
                  className="fa fa-cog ml-2 mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColumnModal(true);
                  }}
                  title="Settings"
                  style={{ fontSize: "16px", cursor: "pointer" }}
                />
              </div>
            }
            defaultValue={true}
            seconTitle={
              <div className="ml-auto d-flex align-items-center px-2 mt-1">
                <div className="d-flex align-items-center mr-2" style={{ gap: "4px" }}>
                  <i
                    className="fa bi-file-earmark-pdf text-primary"
                    style={{ fontSize: "14px" }}
                  />
                  <span>View Attachments</span>
                </div>

                <div className="d-flex align-items-center mr-2" style={{ gap: "4px" }}>
                  <img src={Urgent} className="sizeicon" />
                  <span>Urgent</span>
                </div>

                <div className="d-flex align-items-center mr-2" style={{ gap: "4px" }}>
                  <i
                    className="bi bi-shield-fill-check vip-font-size mb-0"
                    style={{ color: "#FFC107" }}
                  />
                  <span>VIP Patient</span>
                </div>
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search Entry Culture..."
                  value={searchTerm}
                  onChange={handleChangeSearch}
                />
              </div>
            }
          >
            {loading ? (
              <Loading />
            ) : (
              <>
                <RECultureTable
                  redata={reData}
                  GetResultEntryCulture={GetResultEntryCulture}
                  setShowMH={setShowMH}
                  setShowUD={setShowUD}
                  TableData={TableData}
                  SampleStatus={payload.SampleStatus}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  filterData={filterData}
                  showColumnModal={showColumnModal}
                  setShowColumnModal={setShowColumnModal}
                  columnConfig={columnConfig}
                  getFilterResultOption={getFilterResultOption}
                />
                <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 w-full">
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
                            TableData(
                              String(payload.SampleStatus),
                              1,
                              value?.value,
                            );
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
                            TableData(
                              String(payload.SampleStatus),
                              page,
                              pageSize,
                            );
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </Accordion>
        </>
      ) : (
        <>
          {show5?.modal && (
            <UploadFile
              show={show5?.modal}
              handleClose={(data) => {
                setShow5({
                  modal: false,
                  data: "",
                  pageName: "",
                  blockUpload: "",
                });
                printHeader(data, show5.data);
              }}
              documentId={show5.data}
              pageName={show5?.pageName}
              formData={payload}
              isPrintHeader={show5?.Printwithhead}
              blockUpload={show5.blockUpload}
              LedgerTransactionIDHash={
                ResultTestData[0]?.LedgertransactionIDHash
              }
              ResultTestData={ResultTestData?.[0]}
            />
          )}
          {show2.moadal && (
            <TemplateMasterModal
              show={show2}
              handleClose={() => {
                setShow2({ moadal: false, data: {} });
              }}
              handleSave={handleSave}
            />
          )}

          {show3?.modal && (
            <TemplateMasterModal
              show={show3}
              handleClose={() => {
                setShow3({ modal: false, data: {} });
              }}
              handleSave={handleSave}
            />
          )}
          {showReject?.show && (
            <RejectModal
              show={showReject?.show}
              handleShow={handleShowReject}
              data={showReject?.data}
              TableData={handleCloseReject}
            />
          )}
          {showPH && (
            <PatientDetailModal
              showPH={showPH}
              setShowPH={(data) => {
                setShowPH(false);
                // console.log("object");
              }}
              ResultData={ResultData}
            />
          )}
          <>
            {console.log("ResultData::", ResultData[0])}
            <>
              <Accordion
                name={t("Patient Culture Entry")}
                defaultValue={true}
                isBreadcrumb={true}
              >
                <div
                  className={`p-dialog-header custom-box-body  mt-3`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignContent: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  <div className="custom-row wrap-fix">
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-folder custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.LedgerTransactionNo}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-user-md custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.PName}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-book custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.PatientCode}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-calendar custom-text">&nbsp;</span>
                      <span> {ResultData[0]?.Age}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-book custom-text">&nbsp;</span>
                      <span> {ResultData[0]?.Gender}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-h-square custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.Centre}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-user-md custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.ReferDoctor}</span>
                    </div>
                    <div
                      className="custom-col custom-col-visit"
                    // style={{ width: "300px" }}
                    >
                      <span
                        className="fa fa-calendar custom-text"
                      // style={{ width: "150px" }}
                      >
                        &nbsp;
                      </span>
                      <span>{dateConfig(ResultData[0]?.RegDate)}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-plus-square custom-text">
                        &nbsp;
                      </span>
                      <span>{ResultData[0]?.RateType}</span>
                    </div>
                    {/* <div className="custom-col custom-col-visit">
                      <span className="fa fa-code custom-text">
                        &nbsp; &nbsp; {"   "}
                      </span>
                      <span>{ResultData[0]?.SINNo}</span>
                    </div> */}
                  </div>
                  <div className="custom-row">
                    <div
                      className="d-flex my"
                      style={{ margin: 0, padding: 0 }}
                    >
                      {ResultTestData?.map((data, index) => (
                        <div
                          key={index}
                          className={`round font-weight-bold my-2 px-3 py-2 Status-${data.Status}`}
                        >
                          <span> {data?.PackageName}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center ml-4 ">
                      <i class="fa-solid fa-barcode"></i>
                      <span className="ml-2 text-lg">
                        {ResultData[0]?.SINNo}
                      </span>
                    </div>
                    {ResultData?.some((item) => item.isUrgent == 1) && (
                      <div
                        className="d-flex align-items-center"
                        style={{ gap: "4px" }}
                      >
                        <img src={Urgent} className="sizeicon" />
                        <span>Urgent</span>
                      </div>
                    )}

                    {/* ✅ VIP Icon */}
                    {ResultData?.some((item) => item.IsVip == 1) && (
                      <div
                        className="d-flex align-items-center"
                        style={{ gap: "4px" }}
                      >
                        <i
                          className="bi bi-shield-fill-check vip-font-size mb-0"
                          style={{ color: "#FFC107" }}
                        />
                        <span>VIP Patient</span>
                      </div>
                    )}
                    {(() => {
                      const docItem = ResultData?.find(
                        (item) => item.IsPatientDocAvail > 0,
                      );

                      return (
                        docItem && (
                          <div className="d-flex align-items-center">
                            <i
                              className="fa bi-file-earmark-pdf cursor-pointer"
                              style={{
                                fontSize: "16px",
                                color: "blue",
                                display: "flex",
                                justifyContent: "center",
                              }}
                              onClick={() =>
                                handleOpenPreview(docItem?.awsKeys)
                              }
                              title="View Attachments"
                            />
                            <span>View Attachments</span>
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-5 col-12">
                    <div className="row  px-2 mt-1 mb-1s">
                      <label
                        className="box-title col-md-3"
                        htmlFor="Report Type"
                      >
                        {t("Report Type")} :
                      </label>
                      <div className="col-md-3">
                        <SelectBox
                          className="form-control input-sm"
                          options={
                            reportFormatList?.length > 0
                              ? reportFormatList
                              : ReportTypePreliminary
                          }
                          selectedValue={entryPayload?.ReportNumber}
                          onChange={(e) => {
                            GetResultEntryCulture(
                              {
                                LedgerTransactionID:
                                  reData[ResultData[0]?.currentIndex]
                                    ?.LedgertransactionId,
                                TestID:
                                  reData[ResultData[0]?.currentIndex]?.TestID,

                                DepartmentID:
                                  reData[ResultData[0]?.currentIndex]
                                    ?.DepartmentId,
                                VisitNo:
                                  reData[ResultData[0]?.currentIndex]
                                    ?.LedgerTransactionNo,
                                BarcodeNo:
                                  reData[ResultData[0]?.currentIndex]
                                    ?.BarcodeNo,
                              },

                              ResultData[0]?.currentIndex,
                              false,
                              e?.target?.value,
                            );

                            setEntryShow(false);
                            setEntry([]);
                          }}
                        />
                      </div>

                    </div>
                    <div className="p-2">
                      <ResultEntryTableCustom>
                        <thead className="cf">
                          <tr>
                            <th style={{ width: "250px" }}>{t("Test Name")}</th>
                            <th>
                              {t("Value")}
                              <span style={{ marginLeft: "20px" }}>
                                {/* Add Report */}
                                <div
                                  style={{
                                    display: "inline-block",
                                    marginRight: "10px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    const Hdata = ResultTestData?.[0];
                                    setShow5({
                                      modal: true,
                                      data: Hdata?.TestIDHash,
                                      pageName: "Add Report",
                                      Printwithhead: Hdata?.Printwithhead,
                                      blockUpload:
                                        Hdata?.Status === 5 ||
                                          Hdata?.Status === 6
                                          ? true
                                          : false,
                                    });
                                  }}
                                >
                                  <Tooltip label="Add Report">
                                    <i
                                      className="bi bi-file-earmark-pdf m-0 text-icon-size"
                                      style={{ color: "red", fontSize: "18px" }}
                                    ></i>
                                  </Tooltip>
                                </div>

                                {/* Add Attachment */}
                                <div
                                  style={{
                                    display: "inline-block",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    const Hdata = ResultTestData?.[0];
                                    setShow5({
                                      modal: true,
                                      data: Hdata?.TestIDHash,
                                      pageName: "Add Attachment",
                                      blockUpload:
                                        Hdata?.Status === 5 ||
                                          Hdata?.Status === 6
                                          ? true
                                          : false,
                                    });
                                  }}
                                >
                                  <Tooltip label="Add Attachment">
                                    <i
                                      className="bi bi-file-earmark-image m-0 text-icon-size"
                                      style={{
                                        color: "#07b023",
                                        fontSize: "18px",
                                      }}
                                    ></i>
                                  </Tooltip>
                                </div>
                                <div
                                  style={{
                                    display: "inline-block",
                                    cursor: "pointer",
                                    paddingLeft: "10px"
                                  }}
                                  onClick={() => {
                                    const Hdata = ResultTestData?.[0];
                                    const data = ResultData?.[0];
                                    console.log("Hdata", data);
                                    setShowReject({
                                      show: true,
                                      data: {
                                        TestID: Hdata?.TestID,
                                        LedgerTransactionID:
                                          Hdata?.LedgerTransactionID,
                                        VisitNo: Hdata?.LedgerTransactionNo,
                                        Test: Hdata?.PackageName,
                                        CentreID: ResultData[0]?.TestCenterId,
                                        SINNo: Hdata?.SINNO,
                                        PatientID: ResultData[0]?.PatientID,
                                      },
                                    });
                                  }}

                                >
                                  <Tooltip label={"Reject"}>
                                    <i
                                      className="bi bi-ban m-0 text-icon-size mr-2"
                                      style={{ color: "red" }}
                                    ></i>
                                  </Tooltip>
                                </div>
                              </span>
                            </th>
                            <th>{t("Comment")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ResultTestData?.map((Hdata, Hindex) => (
                            <>
                              <tr
                                key={Hindex}
                                style={{ backgroundColor: "lightgrey" }}
                              >
                                <td
                                  data-title={t("Test Name")}
                                  style={{ width: "250px" }}
                                >
                                  <span
                                    className="invName"
                                    style={{ fontWeight: "bold" }}
                                  >
                                    {Hdata?.PackageName}
                                  </span>
                                </td>
                                {(Hdata?.Status === 3 ||
                                  Hdata?.Status === 10 ||
                                  Hdata?.Status === 14) && (
                                    <td>
                                      <div className="d-flex justify-content-end">
                                        {/* Add Report */}
                                        <div
                                          className="m-0 p-0"
                                          onClick={() => {
                                            setShow5({
                                              modal: true,
                                              data: Hdata?.TestIDHash,
                                              pageName: "Add Report",
                                              Printwithhead: Hdata?.Printwithhead,
                                              blockUpload:
                                                Hdata?.Status === 5 ||
                                                  Hdata?.Status === 6
                                                  ? true
                                                  : false,
                                            });
                                          }}
                                        >
                                          {/* <Tooltip label="Add Report">
                                            <i
                                              className="bi bi-file-earmark-pdf m-0 text-icon-size ml-1 mr-1"
                                              style={{ color: "red" }}
                                              disabled={!Hdata?.isChecked}
                                            ></i>
                                          </Tooltip> */}
                                        </div>

                                        {/* Add Attachment */}
                                        <div
                                          className="m-0 p-0"
                                          onClick={() => {
                                            setShow5({
                                              modal: true,
                                              data: Hdata?.TestIDHash,
                                              pageName: "Add Attachment",
                                              blockUpload:
                                                Hdata?.Status === 5 ||
                                                  Hdata?.Status === 6
                                                  ? true
                                                  : false,
                                            });
                                          }}
                                        >
                                          {/* <Tooltip label="Add Attachment">
                                            <i
                                              className="bi bi-file-earmark-image m-0 text-icon-size ml-1 mr-1"
                                              style={{ color: "#07b023" }}
                                              disabled={!Hdata?.isChecked}
                                            ></i>
                                          </Tooltip> */}
                                        </div>
                                      </div>
                                    </td>
                                  )}
                                {(Hdata?.Status === 5 || Hdata?.Status === 6) &&
                                  buttonsData?.map(
                                    (ele, index) =>
                                      ele?.AccessBy === "Not Approved" && (
                                        <>
                                          <td colSpan={1}>
                                            <div className=" d-flex">
                                              <div
                                                className="m-0 p-0"
                                                onClick={() => {
                                                  setShow5({
                                                    modal: true,
                                                    data: Hdata?.TestIDHash,
                                                    pageName: "Add Report",
                                                    Printwithhead:
                                                      Hdata?.Printwithhead,
                                                    blockUpload:
                                                      Hdata?.Status == 5 ||
                                                        Hdata?.Status == 6
                                                        ? true
                                                        : false,
                                                  });
                                                }}
                                              >
                                                {/* <Tooltip
                                                  label={
                                                    Hdata?.Status == 5 ||
                                                      Hdata?.Status == 6
                                                      ? t("Show Report")
                                                      : t("Add Report")
                                                  }
                                                >
                                                  <i
                                                    className="bi bi-file-earmark-pdf m-0 text-icon-size ml-1 mr-1"
                                                    style={{ color: "red" }}
                                                    disabled={!Hdata?.isChecked}
                                                  ></i>{" "}
                                                </Tooltip> */}
                                              </div>
                                              <div
                                                className="m-0 p-0"
                                                onClick={() => {
                                                  setShow5({
                                                    modal: true,
                                                    data: Hdata?.TestIDHash,
                                                    pageName: "Add Attachment",
                                                    blockUpload:
                                                      Hdata?.Status == 5 ||
                                                        Hdata?.Status == 6
                                                        ? true
                                                        : false,
                                                  });
                                                }}
                                              >
                                                {" "}
                                                {/* <Tooltip
                                                  label={
                                                    Hdata?.Status == 5 ||
                                                      Hdata?.Status == 6
                                                      ? t("Show Attachment")
                                                      : t("Add Attachment")
                                                  }
                                                >
                                                  <i
                                                    className="bi bi-file-earmark-image m-0 text-icon-size ml-1 mr-1"
                                                    style={{ color: "#07b023" }}
                                                    disabled={!Hdata?.isChecked}
                                                  ></i>{" "}
                                                </Tooltip> */}
                                              </div>

                                              {/* <div>
                                                <Input
                                                  className="required form-control input-sm mr-3"
                                                  placeholder={
                                                    "Not Approved Remark"
                                                  }
                                                  value={
                                                    Hdata?.NotApproveRemark ??
                                                    ""
                                                  }
                                                  name="NotApproveRemark"
                                                  id="NotApproveRemark"
                                                  onChange={(e) =>
                                                    handleNotApproveRemark(
                                                      e,
                                                      Hdata,
                                                    )
                                                  }
                                                />{" "}
                                              </div>
                                              <div
                                                className="ml-3"
                                                onClick={() => {
                                                  if (Hdata?.NotApproveRemark) {
                                                    handleResultSubmit(
                                                      ele?.AccessBy,
                                                      Hdata,
                                                    );
                                                  } else {
                                                    toast.error(
                                                      "Not Approve Remark is Required",
                                                    );
                                                  }
                                                }}
                                              >
                                                {" "}
                                                <Tooltip label={ele?.AccessBy}>
                                                  <i
                                                    className="bi bi-x-octagon text-icon-size m-0 ml-2"
                                                    style={{ color: "#b06605" }}
                                                    key={index}
                                                  ></i>
                                                </Tooltip>
                                              </div> */}
                                            </div>
                                          </td>
                                        </>
                                      ),
                                  )}
                                {Hdata?.Status === 5 || Hdata?.Status === 6 ? (
                                  (() => {
                                    const status = Hdata?.Status;

                                    const showUnapprove =
                                      (status === 5 &&
                                        buttonsData?.some(
                                          ({ AccessBy }) => AccessBy === "Not Approved"
                                        )) ||
                                      (status === 6 &&
                                        buttonsData?.some(
                                          ({ AccessBy }) =>
                                            AccessBy === "Not Approved" ||
                                            AccessBy === "Not Approved - After Print"
                                        ));

                                    return showUnapprove ? (
                                      <td colSpan={1}>
                                        <div className="d-flex">
                                          <div>
                                            <Input
                                              className="required form-control input-sm mr-3"
                                              placeholder={"Not Approved Remark"}
                                              value={Hdata?.NotApproveRemark ?? ""}
                                              name="NotApproveRemark"
                                              id="NotApproveRemark"
                                              onChange={(e) =>
                                                handleNotApproveRemark(e, Hdata)
                                              }
                                            />
                                          </div>

                                          <div
                                            onClick={() => {
                                              if (Hdata?.NotApproveRemark) {
                                                handleResultSubmit("Not Approved", Hdata);
                                              } else {
                                                toast.error("Not Approve Remark is Required");
                                              }
                                            }}
                                          >
                                            <Tooltip label={"UnApprove"}>
                                              <i
                                                className="bi bi-x-octagon text-icon-size m-0 ml-2"
                                                style={{ color: "#b06605" }}
                                              ></i>
                                            </Tooltip>
                                          </div>
                                        </div>
                                      </td>
                                    ) : (
                                      <td colSpan={1}>&nbsp;</td>
                                    );
                                  })()
                                ) : (
                                  <td colSpan={1}>&nbsp;</td>
                                )}
                              </tr>
                              {ResultData?.map((datanew, index) => (

                                <>

                                  {Hdata.TestID === datanew.TestID && (
                                    <tr key={index}>
                                      <td
                                        data-title={t("Test Name")}
                                      //   className={`Status-${datanew?.Status}`}
                                      >
                                        <span
                                          style={{
                                            cursor: "pointer",
                                            // //   color:
                                            //     datanew?.Status != 5
                                            //       ? "black"
                                            //       : "white",
                                          }}
                                          data-toggle="tooltip"
                                          data-placement="top"
                                        >
                                          {datanew?.TestName}
                                        </span>
                                      </td>
                                      {datanew?.Header === 0 &&
                                        (datanew?.TestName).toLowerCase() !=
                                        "organism" &&
                                        datanew?.TestName != "Comments" ? (
                                        <>
                                          {["2", "3"].includes(
                                            datanew?.ReportType,
                                          ) ? (
                                            <td
                                              style={{
                                                fontSize: "15px",
                                                cursor: "pointer",
                                              }}
                                              onClick={() =>
                                                setShow3({
                                                  modal: true,
                                                  data: datanew,
                                                })
                                              }
                                              data-title={t("Action")}
                                            >
                                              <i
                                                className="fa fa-plus-circle"
                                                aria-hidden="true"
                                                style={{ color: "#605ca8" }}
                                              ></i>
                                            </td>
                                          ) : datanew?.dlcCheck === 1 ? (
                                            datanew?.IsHelpMenu === 0 ? (
                                              <td data-title={t("Value")}>
                                                <input
                                                  type="text"
                                                  className="form-control input-sm"
                                                  name="Value"
                                                  autoComplete="off"
                                                  value={datanew?.Value}
                                                  onChange={(e) => handleCheckbox(e, index, datanew?.TestID)}
                                                  ref={(el) => (myRefs.current[index] = el)}
                                                />
                                              </td>
                                            ) : (
                                              <td data-title={t("Value")}>
                                                <input
                                                  type="text"
                                                  className="form-control input-sm "
                                                  name="Value"
                                                  value={datanew?.Value}
                                                  onChange={(e) =>
                                                    handleCheckbox(
                                                      e,
                                                      index,
                                                      datanew?.TestID,
                                                    )
                                                  }
                                                  onKeyUp={(e) =>
                                                    handleKeyUp(
                                                      e,
                                                      myRefs.current[
                                                      index ===
                                                        ResultData.length - 1
                                                        ? 0
                                                        : index + 1
                                                      ],
                                                      index,
                                                    )
                                                  }
                                                  autoComplete="off"
                                                  ref={(el) =>
                                                    (myRefs.current[index] = el)
                                                  }
                                                />
                                              </td>
                                            )
                                          ) : datanew?.IsHelpMenu === 0 ? (
                                            <td data-title={t("Value")}>
                                              <input
                                                type="text"
                                                className="form-control input-sm "
                                                name="Value"
                                                value={datanew?.Value}
                                                onChange={(e) =>
                                                  handleCheckbox(
                                                    e,
                                                    index,
                                                    datanew?.TestID,
                                                  )
                                                }
                                                onKeyUp={(e) =>
                                                  handleKeyUp(
                                                    e,
                                                    myRefs.current[
                                                    index ===
                                                      ResultData.length - 1
                                                      ? 0
                                                      : index + 1
                                                    ],
                                                    index,
                                                  )
                                                }
                                                autoComplete="off"
                                                ref={(el) =>
                                                  (myRefs.current[index] = el)
                                                }
                                              />
                                            </td>
                                          ) : (

                                            <td data-title={t("Value")}>
                                              <div style={{ position: "relative" }}>
                                                {helpmenu.length > 0 &&
                                                  helpmenu.some((h) => h?.Value == datanew?.labObservationID) &&
                                                  DefaultCurrencyName !== "KES" ? (
                                                  <>
                                                    <textarea
                                                      className="form-control"
                                                      name="Value"
                                                      value={datanew?.Value ?? ""}
                                                      rows={2}
                                                      style={{
                                                        fontSize: "12px",
                                                        resize: "vertical",
                                                        minHeight: "52px",
                                                        maxHeight: "120px",
                                                        overflowY: "auto",
                                                        lineHeight: "1.5",
                                                        padding: "4px 6px",
                                                      }}
                                                      onChange={(e) => {
                                                        const val = [...ResultData];
                                                        val[index]["Value"] = e.target.value;
                                                        setResultData(val);
                                                      }}
                                                      onFocus={() => setHiddenDropDownHelpMenu(true)}
                                                      onBlur={() => setTimeout(() => setHiddenDropDownHelpMenu(false), 200)}
                                                      ref={(el) => (myRefs.current[index] = el)}
                                                    />
                                                    {HiddenDropDownHelpMenu && (
                                                      <ul
                                                        style={{
                                                          position: "absolute",
                                                          zIndex: 9999,
                                                          backgroundColor: "white",
                                                          border: "1px solid #b3d4ff",
                                                          borderRadius: "4px",
                                                          minWidth: "100%",
                                                          maxHeight: "200px",
                                                          overflowY: "auto",
                                                          overflowX: "hidden",
                                                          listStyle: "none",
                                                          margin: 0,
                                                          padding: 0,
                                                          top: "100%",
                                                          left: 0,
                                                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                                        }}
                                                      >
                                                        {helpmenu
                                                          .filter((h) => h?.Value == datanew?.labObservationID)
                                                          .map((opt, optIdx) => (
                                                            <li
                                                              key={optIdx}
                                                              style={{
                                                                padding: "6px 8px",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                                whiteSpace: "normal",
                                                                wordBreak: "break-word",
                                                                lineHeight: "1.5",
                                                                borderBottom: "1px solid #eee",
                                                                backgroundColor: "white",
                                                              }}
                                                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#deebff"; }}
                                                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
                                                              onMouseDown={(e) => e.preventDefault()}
                                                              onClick={() => {
                                                                const val = [...ResultData];
                                                                val[index]["Value"] = opt?.label;
                                                                setResultData(val);
                                                                setHiddenDropDownHelpMenu(false);
                                                                const el = myRefs.current[index];
                                                                if (el) {
                                                                  setTimeout(() => {
                                                                    el.style.height = "auto";
                                                                    el.style.height = el.scrollHeight + "px";
                                                                  }, 0);
                                                                }
                                                              }}
                                                            >
                                                              {opt?.label}
                                                            </li>
                                                          ))}
                                                      </ul>
                                                    )}
                                                  </>
                                                ) : (
                                                  <input
                                                    type="text"
                                                    className="form-control input-sm"
                                                    name="Value"
                                                    autoComplete="off"
                                                    value={datanew?.Value}
                                                    onChange={(e) =>
                                                      handleCheckbox(e, index, datanew?.TestID)
                                                    }
                                                    onKeyDown={(e) => {
                                                      getHelpMenuData(e, datanew?.labObservationID);
                                                      handleIndex(e, index);
                                                    }}
                                                    onKeyUp={(e) =>
                                                      handleKeyUp(
                                                        e,
                                                        myRefs.current[
                                                        index === ResultData.length - 1 ? 0 : index + 1
                                                        ],
                                                        index
                                                      )
                                                    }
                                                    ref={(el) => (myRefs.current[index] = el)}
                                                    onBlur={() =>
                                                      setTimeout(() => {
                                                        setHiddenDropDownHelpMenu(false);
                                                      }, 1000)
                                                    }
                                                  />
                                                )}

                                                {helpmenu.length > 0 &&
                                                  helpmenu[0]?.Value == datanew?.labObservationID &&
                                                  HiddenDropDownHelpMenu &&
                                                  (() => {
                                                    const fullValue = datanew?.Value || "";
                                                    const parts = fullValue.split(",");
                                                    const lastPart = parts[parts.length - 1].trim();

                                                    const selectedValues = parts
                                                      .slice(0, -1)
                                                      .map((p) => p.trim().toLowerCase());

                                                    return (
                                                      <ul
                                                        className="suggestion-data"
                                                        style={{
                                                          width: "100%",
                                                          right: "0px",
                                                          border: "1px solid #dddfeb",
                                                        }}
                                                      >
                                                        {helpmenu
                                                          .filter(
                                                            (data) =>
                                                              lastPart &&
                                                              data?.label
                                                                ?.toLowerCase()
                                                                .includes(lastPart.toLowerCase()) &&
                                                              data?.label?.toLowerCase() !==
                                                              lastPart.toLowerCase() &&
                                                              !selectedValues.includes(
                                                                data?.label?.toLowerCase()
                                                              )
                                                          )
                                                          .map((data, helpmenuindex) => (
                                                            <li
                                                              key={helpmenuindex}
                                                              className={`${helpmenuindex === indexMatch &&
                                                                "matchIndex"
                                                                }`}
                                                              onClick={() => {
                                                                const currentValue =
                                                                  datanew?.Value || "";

                                                                const existingParts = currentValue
                                                                  .split(",")
                                                                  .map((p) => p.trim())
                                                                  .filter(Boolean);

                                                                existingParts.pop();
                                                                existingParts.push(data?.label);

                                                                const newValue =
                                                                  existingParts.join(", ") + ", ";

                                                                handleListSearch(
                                                                  {
                                                                    ...data,
                                                                    label: newValue,
                                                                  },
                                                                  "Value",
                                                                  index
                                                                );
                                                              }}
                                                            >
                                                              {data?.label}
                                                            </li>
                                                          ))}
                                                      </ul>
                                                    );
                                                  })()}
                                              </div>
                                            </td>
                                          )}
                                          {["2", "3"].includes(
                                            datanew?.ReportType,
                                          ) ? (
                                            <td></td>
                                          ) : (
                                            <td
                                              style={{
                                                position: "relative",
                                              }}
                                              data-title={t("Action")}
                                            >
                                              <div className="d-flex align-items-center">
                                                <div
                                                  className="mx-2"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() =>
                                                    setShow2({
                                                      moadal: true,
                                                      data: {
                                                        ...datanew,
                                                        pageName: "Single",
                                                      },
                                                    })
                                                  }
                                                >
                                                  <i
                                                    className="fa fa-plus-circle"
                                                    aria-hidden="true"
                                                    style={{
                                                      color: "#605ca8",
                                                    }}
                                                  ></i>
                                                </div>
                                              </div>
                                            </td>
                                          )}
                                        </>
                                      ) : (datanew?.TestName).toLowerCase() ==
                                        "organism" ? (
                                        <>
                                          <td data-title="Organism">
                                            <Link
                                              onClick={() => {
                                                window.scroll(0, 0);
                                              }}
                                            >
                                              <i
                                                className="mx-2 fa fa-edit"
                                                style={{
                                                  color: "#605ca8",
                                                  cursor: "pointer",
                                                  fontSize: "17px",
                                                }}
                                                title="Click to add organism"
                                                onClick={() =>
                                                  setEntryShow(true)
                                                }
                                              ></i>
                                            </Link>
                                          </td>
                                          <td>
                                            <div className="d-flex align-items-center">
                                              <div
                                                className="mx-2"
                                                style={{
                                                  cursor: "pointer",
                                                  fontSize: "15px",
                                                }}
                                                onClick={() =>
                                                  setShow2({
                                                    moadal: true,
                                                    data: {
                                                      ...datanew,
                                                      pageName: "Single",
                                                    },
                                                  })
                                                }
                                              >
                                                <i
                                                  className="fa fa-plus-circle"
                                                  aria-hidden="true"
                                                  style={{
                                                    color: "#605ca8",
                                                  }}
                                                ></i>
                                              </div>
                                            </div>
                                          </td>
                                        </>
                                      ) : datanew?.TestName == "Comments" ? (
                                        <tr>
                                          <td data-title={t("Comments")}></td>
                                          <td colSpan="1">
                                            <CustomButton
                                              text={"Add Comment"}
                                              onClick={() =>
                                                setShow2({
                                                  moadal: true,
                                                  data: {
                                                    ...datanew,
                                                    pageName: "Single",
                                                  },
                                                })
                                              }
                                            />
                                          </td>
                                        </tr>
                                      ) : (
                                        <tr></tr>
                                      )}
                                    </tr>
                                  )}
                                </>
                              ))}
                            </>
                          ))}
                        </tbody>
                      </ResultEntryTableCustom>
                    </div>
                  </div>
                  { }

                  {entryShow && (
                    <div className="col-md-7 col-12">
                      {
                        <div className="p-2">
                          <div className="box-header with-border d-flex">
                            <div className="col-sm-8">
                              <label className="box-title">
                                {t("Antibiotic Entry")}
                              </label>
                            </div>
                          </div>

                          <>
                            <div
                              className=""
                              style={{
                                maxHeight: "400px",
                                overflowY: "auto",
                                overflowX:
                                  window.innerWidth > 1200 ? "hidden" : "auto",
                              }}
                            >
                              <Tables
                                scrollView="" // removes TabScroll class
                                tableHeight=""
                                removeScrollOverFlow={true}
                              // style={{
                              //    ...style,
                              //   overflowX: window.innerWidth > 1200 ? "hidden" : "auto",
                              //   overflowY: "auto",
                              // }}
                              //                              style={{
                              //   overflowX: window.innerWidth > 1200 ? "hidden" : "auto",
                              // }}
                              >
                                <thead
                                  className="cf"
                                  style={{
                                    position: "sticky",
                                    zIndex: 99,
                                    top: 0,
                                  }}
                                >
                                  <tr>
                                    {[
                                      "#",
                                      "Antibiotic Entry",
                                      "Interpretation",
                                      "MIC",
                                      ...(Number(
                                        AllowZoneDiameterMicroResutlEntry,
                                      )
                                        ? ["Zone Diameter"]
                                        : []),
                                      ...(Number(
                                        AllowBreakPointMicroResutlEntry,
                                      )
                                        ? ["Break Point"]
                                        : []),
                                    ].map((ele, index) => (
                                      <th
                                        key={index}
                                        style={{
                                          ...(ele === "Zone Diameter" ||
                                            ele === "Break Point"
                                            ? {
                                              whiteSpace: "normal",
                                              maxWidth: "40px",
                                            }
                                            : {}),
                                          ...(ele === "MIC"
                                            ? { maxWidth: "60px" }
                                            : {}),
                                          ...(ele === "Antibiotic Entry"
                                            ? {
                                              maxWidth:
                                                window.innerWidth > 1200
                                                  ? "100px"
                                                  : null,
                                            }
                                            : {}),
                                        }}

                                      // style={{...(ele === "Zone Diameter" || ele === "Break Point" ? { whiteSpace: "normal", maxWidth: "60px" } : {}), ...(ele === "MIC" ? {maxWidth: "60px"}:{})}}
                                      >
                                        {t(ele)}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody>
                                  {
                                    <>
                                      {entry.map((subArray, outerIndex) => (
                                        <>
                                          <tr
                                            style={{
                                              background: "#fafa99",
                                            }}
                                          >
                                            <td
                                              colSpan={
                                                4 +
                                                (Number(
                                                  AllowZoneDiameterMicroResutlEntry,
                                                )
                                                  ? 1
                                                  : 0) +
                                                (Number(
                                                  AllowBreakPointMicroResutlEntry,
                                                )
                                                  ? 1
                                                  : 0)
                                              }
                                            >
                                              <div className="row p-1">
                                                <label className="col-sm-6">
                                                  {
                                                    subArray[0]
                                                      ?.OrganismNameDisplayname
                                                  }
                                                </label>
                                                {/* <div className="col-sm-2"> */}
                                                {/* <button
                                                    className="mx-2  btn btn-danger btn-sm"
                                                    
                                                  >
                                                    {t("Remove Organism")}
                                                  </button> */}
                                                <CustomButton
                                                  text="Remove Organism"
                                                  onClick={() =>
                                                    removeArrayAtIndex(
                                                      outerIndex,
                                                    )
                                                  }
                                                  className="mx-2 rounded-15"
                                                  icon="delete"
                                                />
                                                {/* </div> */}
                                              </div>
                                              <div className="row">
                                                <label className="col-sm-3">
                                                  {t("Organism Display Name")} :
                                                </label>
                                                <div className="col-sm-9">
                                                  <Input
                                                    className="select-input-box form-control input-sm"
                                                    type="text"
                                                    value={
                                                      subArray[0]
                                                        ?.OrganismNameDisplayname
                                                    }
                                                    onChange={(e) =>
                                                      setValuesForOuterIndex(
                                                        outerIndex,
                                                        "OrganismNameDisplayname",
                                                        e?.target?.value,
                                                      )
                                                    }
                                                    disabled={Number(AllowOrganismNameEditableAtResultEntry) !== 1}
                                                  />
                                                </div>
                                              </div>
                                              <div className="row">
                                                <div className="col-sm-4">
                                                  <Input
                                                    className="select-input-box form-control input-sm"
                                                    value={
                                                      entry[outerIndex][0]
                                                        ?.colonycount
                                                    }
                                                    onChange={(e) =>
                                                      setValuesForOuterIndex(
                                                        outerIndex,
                                                        "colonycount",
                                                        e?.target?.value,
                                                      )
                                                    }
                                                    type="text"
                                                    placeholder="Colony Count"
                                                  />
                                                </div>
                                                <div className="col-sm-8">
                                                  <Input
                                                    className="select-input-box form-control input-sm"
                                                    onChange={(e) =>
                                                      setValuesForOuterIndex(
                                                        outerIndex,
                                                        "colonycountcomment",
                                                        e?.target?.value,
                                                      )
                                                    }
                                                    value={
                                                      entry[outerIndex][0]
                                                        ?.colonycountcomment
                                                    }
                                                    type="text"
                                                    placeholder="Comment"
                                                  />
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                          {subArray.map((item, innerIndex) => (
                                            <>
                                              <tr>
                                                <td
                                                  className="text-center"
                                                  style={{ width: "30px" }}
                                                >
                                                  {innerIndex + 1}
                                                  &nbsp;&nbsp;&nbsp;
                                                  {item?.isInput && (
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-danger"
                                                      onClick={() =>
                                                        handleFilterOrg(
                                                          outerIndex,
                                                          innerIndex,
                                                        )
                                                      }
                                                      style={{
                                                        backgroundColor: "red",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "2px 7px",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                        borderRadius: "4px",
                                                      }}
                                                    >
                                                      X
                                                    </button>
                                                  )}
                                                </td>
                                                <td
                                                  style={{
                                                    minWidth:
                                                      window.innerWidth > 1200
                                                        ? "100px"
                                                        : null,
                                                    maxWidth:
                                                      window.innerWidth > 1200
                                                        ? "100px"
                                                        : null,
                                                  }}
                                                >
                                                  {item?.isInput ? (
                                                    <Input
                                                      className="select-input-box form-control input-sm"
                                                      value={item?.name}
                                                      onChange={(e) =>
                                                        handleSensitivity(
                                                          e?.target?.value,
                                                          outerIndex,
                                                          innerIndex,
                                                          "name",
                                                        )
                                                      }
                                                    />
                                                  ) : (
                                                    item?.name
                                                  )}
                                                </td>

                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    <div className="flex-grow-1">
                                                      <div
                                                        className="p-1"
                                                        style={{
                                                          display: "flex",
                                                          flexWrap:
                                                            window.innerWidth >
                                                              1200
                                                              ? "wrap"
                                                              : "nowrap",
                                                          alignItems: "center",
                                                          width: "max-content"
                                                        }}
                                                      >
                                                        {Sensitivity.map(
                                                          (option, index) => (
                                                            <label
                                                              key={index}
                                                              style={{
                                                                display: "inline-flex",
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                margin: 0,
                                                                cursor: "pointer",
                                                                gap: "8px",
                                                                whiteSpace: "nowrap"
                                                              }}
                                                            >
                                                              <input
                                                                type="checkbox"
                                                                name={`sensitivity-${outerIndex}-${innerIndex}`}
                                                                value={option.value}
                                                                checked={
                                                                  entry[outerIndex][innerIndex]["AntiBioticInterpreatation"]?.toLowerCase() ===
                                                                  option.value?.toLowerCase()
                                                                }
                                                                onChange={(e) => {
                                                                  handleSensitivity(
                                                                    e?.target
                                                                      ?.checked
                                                                      ? e.target
                                                                        ?.value
                                                                      : "",
                                                                    outerIndex,
                                                                    innerIndex,
                                                                    "AntiBioticInterpreatation"
                                                                  );
                                                                }}
                                                                style={{
                                                                  appearance: "none",
                                                                  WebkitAppearance: "none",
                                                                  MozAppearance: "none",
                                                                  outline: "none",
                                                                  border: "1px solid #ccc",
                                                                  backgroundColor:
                                                                    entry[outerIndex][innerIndex]["AntiBioticInterpreatation"]?.toLowerCase() ===
                                                                      option.value?.toLowerCase()
                                                                      ? "#007bff"
                                                                      : "#fff",
                                                                  color:
                                                                    entry[outerIndex][innerIndex]["AntiBioticInterpreatation"]?.toLowerCase() ===
                                                                      option.value?.toLowerCase()
                                                                      ? "#fff"
                                                                      : "#000",
                                                                  padding:
                                                                    "6px 12px",
                                                                  cursor:
                                                                    "pointer",
                                                                  borderRadius:
                                                                    "5px",
                                                                  marginRight:
                                                                    "5px",
                                                                }}
                                                              />
                                                              <span
                                                                style={{
                                                                  fontSize: "12px",
                                                                  whiteSpace: "nowrap",
                                                                  color: entry[outerIndex][innerIndex]["AntiBioticInterpreatation"]?.toLowerCase() === option.value?.toLowerCase() ? "#007bff" : "#333",
                                                                  fontWeight: entry[outerIndex][innerIndex]["AntiBioticInterpreatation"]?.toLowerCase() === option.value?.toLowerCase() ? "bold" : "normal"
                                                                }}
                                                              >
                                                                {option.label}
                                                              </span>
                                                            </label>
                                                          ),
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </td>
                                                <td
                                                  style={{
                                                    minWidth: "60px",
                                                    maxWidth: "60px",
                                                  }}
                                                >
                                                  <div
                                                    // style={{
                                                    //   // minWidth: "80px",
                                                    //   maxWidth: "100px"
                                                    // }}
                                                    className="px-2"
                                                  >
                                                    <input
                                                      onChange={(e) =>
                                                        handleSensitivity(
                                                          e?.target?.value,
                                                          outerIndex,
                                                          innerIndex,
                                                          "mic",
                                                        )
                                                      }
                                                      value={item?.mic}
                                                      className="select-input-box form-control input-sm"
                                                    />
                                                  </div>
                                                </td>

                                                {AllowZoneDiameterMicroResutlEntry ===
                                                  "1" && (
                                                    <td
                                                      style={{
                                                        minWidth: "40px",
                                                        maxWidth: "40px",
                                                      }}
                                                    >
                                                      <input
                                                        onChange={(e) =>
                                                          handleSensitivity(
                                                            e?.target?.value,
                                                            outerIndex,
                                                            innerIndex,
                                                            "ZoneDiameter",
                                                          )
                                                        }
                                                        value={item?.ZoneDiameter}
                                                        className="select-input-box form-control input-sm"
                                                      />
                                                    </td>
                                                  )}

                                                {AllowBreakPointMicroResutlEntry ===
                                                  "1" && (
                                                    <td
                                                      style={{
                                                        minWidth: "40px",
                                                        maxWidth: "40px",
                                                      }}
                                                    >
                                                      <input
                                                        onChange={(e) =>
                                                          handleSensitivity(
                                                            e?.target?.value,
                                                            outerIndex,
                                                            innerIndex,
                                                            "breakpoint",
                                                          )
                                                        }
                                                        value={item?.breakpoint}
                                                        className="select-input-box form-control input-sm"
                                                      />
                                                    </td>
                                                  )}
                                              </tr>
                                            </>
                                          ))}
                                          <tr>
                                            {/* <td colspan={1}
                                              style={{
                                                border: "none",
                                                padding: "0",
                                                background: "transparent"
                                              }}
                                            > */}
                                            <div className="" title="Add Row">
                                              <CustomButton
                                                // text="Add Row"
                                                onClick={() =>
                                                  addItemAtIndex(outerIndex)
                                                }
                                                className="mt-1 mx-2"
                                                icon="Add"
                                              />
                                            </div>
                                            {/* </td> */}
                                          </tr>
                                        </>
                                      ))}
                                    </>
                                  }
                                </tbody>
                              </Tables>
                            </div>
                            <div
                              className="row mt-2"
                              style={{
                                background: "lightblue",
                                border: "1px solid lightblue",
                              }}
                            >
                              <h5
                                style={{ fontWeight: "bold" }}
                                className="col-sm-4"
                              >
                                {t("Select Organism")} :
                              </h5>
                              <div
                                className="col-sm-8"
                                style={{
                                  marginTop: "0px",
                                  backgroundColor: "white",
                                }}
                              >
                                <ReactSelect
                                  dynamicOptions={bindOrganism}
                                  value={null}
                                  placeholderName="Select Organism"
                                  menuPosition={"fixed"}
                                  maxMenuHeight={250}
                                  onChange={(_, e) =>
                                    getEntryData(
                                      e.value,
                                      e.label,
                                      null,
                                      null,
                                      null,
                                      true,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </>
                        </div>
                      }
                    </div>
                  )}
                </div>
                {loading ? (
                  <Loading />
                ) : (
                  <div className="row  px-2 mt-1 mb-1">
                    <div className="col-sm-2">
                      <DatePicker
                        className="custom-calendar"
                        name="IncubationDate"
                        id="IncubationDate"
                        lable="Incubation Date"
                        minDate={new Date()}
                        value={entryPayload?.IncubationDate}
                        onChange={dateSelect2}
                      />
                    </div>
                    <div className="col-sm-1">
                      <button
                        className={`next roundarrow  mx-2 my-1 ${ResultData[0]?.currentIndex === 0
                          ? "btn-secondary"
                          : "btn-success"
                          }`}
                        onClick={() => {
                          ResultData?.length > 0 &&
                            GetResultEntryCulture(
                              {
                                LedgerTransactionID:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.LedgertransactionId,
                                TestID:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.TestID,

                                DepartmentID:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.DepartmentId,
                                VisitNo:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.LedgerTransactionNo,
                                BarcodeNo:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.BarcodeNo,
                              },

                              ResultData[0]?.currentIndex - 1,
                              false,
                              "Preliminary 1",
                            );
                        }}
                        disabled={
                          ResultData[0]?.currentIndex === 0 ? true : false
                        }
                      >
                        {t("<")}
                      </button>

                      <button
                        className={`next roundarrow  mx-2 my-1 ${ResultData[0]?.currentIndex === reData?.length - 1
                          ? "btn-secondary"
                          : "btn-success"
                          }`}
                        onClick={() => {
                          ResultData?.length > 0 &&
                            GetResultEntryCulture(
                              {
                                LedgerTransactionID:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.LedgertransactionId,
                                TestID:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.TestID,

                                DepartmentID:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.DepartmentId,
                                VisitNo:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.LedgerTransactionNo,
                                BarcodeNo:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.BarcodeNo,
                              },

                              ResultData[0]?.currentIndex + 1,
                              false,
                              "Preliminary 1",
                            );
                        }}
                        disabled={
                          ResultData[0]?.currentIndex === reData?.length - 1
                            ? true
                            : false
                        }
                      >
                        {t(">")}
                      </button>
                    </div>
                    {/* {["", 3, 10, 11, 13, 14, 15, 20, 5, 6, 18].includes(
                      statusValue,
                    ) && ( */}
                    <div className="col-sm-1 ">
                      <SaveButton
                        text={"Save"}
                        onClick={() => handleResultSubmit("Save")}
                      />
                    </div>
                    {/* )} */}
                    {buttonsData?.some(
                      (ele) => ele?.AccessBy === "Dual Authentication",
                    ) &&
                      checkDualAuthentication && (
                        <div className="col-sm-1 mr-3">
                          {buttonsData
                            ?.filter(
                              (ele) => ele?.AccessBy === "Dual Authentication",
                            )
                            .map((ele, index) => (
                              <button
                                key={index}
                                style={{
                                  color: "white",
                                }}
                                className="btn btn-sm"
                                onClick={() =>
                                  handleResultSubmit(ele?.AccessBy)
                                }
                              >
                                {t("Dual Authentication")}
                              </button>
                            ))}
                        </div>
                      )}

                    {/* Hold button */}
                    {buttonsData?.some((ele) => ele?.AccessBy === "Hold") &&
                      !([11, 5, 6].includes(ResultTestData[0]?.Status)) && (
                        <div className="col-sm-1">
                          <button
                            className="btn btn-sm btn-block"
                            style={{ backgroundColor: "#FFFF00", color: "black" }}
                            type="button"
                            onClick={() => {
                              setReason({
                                ...reason,
                                HoldShow: true,
                                Hdata: ResultTestData[0],
                                type: "Hold",
                              });
                            }}
                          >
                            {t("Hold")}
                          </button>
                        </div>
                      )}

                    {/* Unhold button */}
                    {ResultTestData[0]?.Status === 11 &&
                      buttonsData?.some((ele) => ele?.AccessBy === "Unhold") && (
                        <div className="col-sm-1">
                          <button
                            className="btn btn-sm btn-block"
                            style={{ backgroundColor: "green", color: "white" }}
                            type="button"
                            onClick={() =>
                              handleResultSubmit("Unhold", ResultTestData[0])
                            }
                          >
                            {t("Unhold")}
                          </button>
                        </div>
                      )}

                    <div className="col-sm-1 ">
                      <button
                        className="btn btn-primary btn-sm  btn-block"
                        onClick={() => {
                          setResultData([]);
                          setResultTestData([]);
                          setEntryShow(false);
                          setEntry([]);
                          setEntryPayload({
                            ...entryPayload,
                            ReportNumber: "Preliminary 1",
                            organism: "",
                            ApprovedBy: "",
                            ApprovalName: "",
                          });
                        }}
                      >
                        {t("Main List")}
                      </button>{" "}
                    </div>{" "}
                    <div className="col-sm-2">
                      <SelectBox
                        options={[
                          { label: "Select Doctor", value: "" },
                          ...withMappedDoctorOption(
                            doctorAdmin,
                            parseMappedSignature(ResultData[0]?.DefaultSignatureID)
                          ),
                        ]}
                        id="ApprovedBy"
                        name="ApprovedBy"
                        selectedValue={entryPayload?.ApprovedBy}
                        onChange={handleDoctorName}
                        isDisabled={!!entryPayload?.IsDutyRosterLocked}
                      ></SelectBox>
                    </div>
                    {HideResultEntryPreview == 0 && (
                      PrintReportLoading ? (
                        <Loading />
                      ) : (
                        <div className="col-sm-1 ">
                          <button
                            className="btn btn-success btn-sm  btn-block"
                            type="button"
                            id="btnMainList"
                            onClick={() => handleReport("no", "")}
                          >
                            {t("Preview")}
                          </button>{" "}
                        </div>
                      )
                    )}
                    {buttonsData?.map(
                      (ele, index) =>
                        ele?.AccessBy !== "Not Approved" &&
                        ele?.AccessBy !== "Unhold" &&
                        ele?.AccessBy !== "Discount Approval" &&
                        ele?.AccessBy !== "Hold" &&
                        ele?.AccessBy !== "Allow Customize Date" &&
                        ele?.AccessBy !== "Dual Authentication" &&
                        ele?.AccessBy !== "Not Approved - After Print" && (
                          <div className="col-sm-1 ">
                            <button
                              className="btn btn-success btn-sm  btn-block"
                              style={
                                ele?.AccessBy === "Approved"
                                  ? { backgroundColor: "green",borderColor: "green", }
                                  : undefined
                              }
                              type="button"
                              id="btnMainList"
                              key={index}
                              onClick={() => handleResultSubmit(ele?.AccessBy)}
                            >
                              {ele?.AccessBy === "Approved"
                                ? t("Approve")
                                : ele?.AccessBy}
                            </button>{" "}
                          </div>
                        ),
                    )}
                    {(
                      (ResultData?.[0]?.Status === 5 &&
                        buttonsData?.some(({ AccessBy }) => AccessBy === "Not Approved")) ||

                      (ResultData?.[0]?.Status === 6 &&
                        buttonsData?.some(({ AccessBy }) =>
                          AccessBy === "Not Approved" ||
                          AccessBy === "Not Approved - After Print"
                        ))
                    ) && (
                        <div className="col-sm-1">
                          <button
                            className="btn btn-success btn-sm btn-block"
                            type="button"
                            onClick={() => {
                              if (ResultTestData[0]?.NotApproveRemark) {
                                handleResultSubmit("Not Approved", ResultTestData[0]);
                              } else {
                                toast.error("Not Approve Remark is Required");
                              }
                            }}
                            disabled={
                              ResultData?.[0]?.Status !== 5 &&
                              ResultData?.[0]?.Status !== 6
                            }
                          >
                            {t("Unapprove")}
                          </button>
                        </div>
                      )}
                    <CustomButton
                      text={"Patient Detail"}
                      onClick={() => {
                        setShowPH(true);
                      }}
                    />
                    <CustomButton
                      text={"VitekData"}
                      icon="machine"
                      onClick={handleGetVitekData}
                      loading={vitekModal.loading}
                      className="ml-2"
                    />
                  </div>
                )}
              </Accordion>
              {showReportModal.show && (
                <Dialog
                  header={t("Report Preview")}
                  visible={showReportModal.show}
                  style={{ height: "100vh", width: "50vw" }}
                  onHide={() => setShowReportModal({ show: false, url: "" })}
                  className={theme}
                >
                  <div
                    style={{ position: "relative", width: "100%", height: "85vh" }}
                    onKeyDown={(e) => {
                      if (
                        (e.ctrlKey || e.metaKey) &&
                        (e.key === "p" || e.key === "P")
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    tabIndex="0"
                  >
                    <iframe
                      src={`${showReportModal.url}#toolbar=0`}
                      title="Report Preview"
                      style={{ width: "100%", height: "100%", border: "none" }}
                    ></iframe>
                    {/* Watermark Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "100px",
                          fontWeight: "bold",
                          color: "gray",
                          opacity: 0.5,
                          transform: "rotate(-45deg)",
                          userSelect: "none",
                        }}
                      >
                        <img
                          src={
                            logoList[localData.CompanyID] ||
                            `https://elabassets.s3.ap-south-1.amazonaws.com/${localData.ImageLogo}`
                          }
                          alt={localData.CompanyCode}
                          className="img-fluid"
                          style={{
                            // height: "100px",
                            width: "200px",
                            transition: "transform 0.3s ease",
                            borderBottomRightRadius: "15px !important",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Dialog>
              )}
              {vitekModal.show && (
                <Dialog
                  header={t("Vitek Machine Data")}
                  visible={vitekModal.show}
                  style={{ width: "70vw" }}
                  onHide={handleCloseVitekModal}
                  className={theme}
                >
                  {vitekModal.loading ? (
                    <Loading />
                  ) : vitekModal.data?.length > 0 ? (
                    <Tables>
                      <thead>
                        <tr>
                          <th>{t("Antibiotic")}</th>
                          <th>{t("Reading")}</th>
                          <th>{t("Interpretation")}</th>
                          <th>{t("Org Code")}</th>
                          <th>{t("Entry Date")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vitekModal.data.map((ele, index) => (
                          <tr key={index}>
                            <td>{ele?.AbName}</td>
                            <td>{ele?.Reading}</td>
                            <td
                              style={{
                                color:
                                  ele?.Interpretation === "R"
                                    ? "red"
                                    : ele?.Interpretation === "S"
                                      ? "green"
                                      : ele?.Interpretation === "I"
                                        ? "#b8860b"
                                        : undefined,
                                fontWeight: "bold",
                              }}
                            >
                              {ele?.Interpretation}
                            </td>
                            <td>{ele?.OrgCode}</td>
                            <td>{ele?.dtEntry}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Tables>
                  ) : (
                    <div className="text-center py-4">
                      {t("No Vitek Data Found")}
                    </div>
                  )}
                </Dialog>
              )}
              {reason?.HoldShow && (
                <Reason
                  show={reason?.HoldShow}
                  reason={reason}
                  setReason={setReason}
                  handleNotApproveRemark={handleNotApproveRemark}
                  handleResultSubmit={handleResultSubmit}
                />
              )}
              <PdfPreviewModal
                visible={previewConfig.visible}
                url={previewConfig.url}
                onClose={handleClosePreview}
              />
            </>
          </>
        </>
      )}
    </>
  );
};

export default ResultEntryCulture;
