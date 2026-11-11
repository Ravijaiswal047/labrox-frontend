import React, { useEffect, useRef, useState } from "react";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import { SampleStatus, SearchBy } from "../../utils/Constants";
import { toast } from "react-toastify";
import moment from "moment";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import "./BulkActivity.css";
import downloadPdfFromUrl, {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  autocompleteOnBlur,
  isChecked,
  IndexHandle,
  number,
  shouldIncludeAIIMSID,
  CheckDevice,
  downloadPdf,
  parseRemarks,
  parseAwsKeys,
} from "../../utils/helpers";
import Tables from "../../components/UI/customTable";

import CustomModal from "../utils/CustomModal";
import CustomDateModal from "../utils/CustomDateModal";

import BulkDownloadType from "../utils/BulkDownloadType";
import Pagination from "../../Pagination/Pagination";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import BulkEmailModal from "./BulkEmailModal";
import ResultModal from "../utils/ResultModal";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { getCollectionBoy } from "../../utils/NetworkApi/commonApi";
import { FaPlus } from "react-icons/fa";
import AddRemark from "../utils/AddRemark";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import { Tooltip as ReactTooltip } from "react-tooltip";
import AutoComplete from "../../components/formComponent/AutoComplete";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Tooltip from "../../components/formComponent/Tooltip";
import Urgent from ".././Images/urgent.gif";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import LastRemarkCell from "./LastRemarkCell";

const BulkActivity = () => {
  const { t } = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [machineId, setMachineId] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [errors, setErrors] = useState({});
  const [tableData, setTableData] = useState([]);
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const [load, setLoad] = useState(false);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [allTests, setAllTests] = useState([]);
  const [selects, setSelects] = useState(false);
  // const [indexMatch, setIndexMatch] = useState(-1);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [observationData, setObservationData] = useState([]);
  const [ApprovedBy, setApprovedBy] = useState("");
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [dropFalse, setDropFalse] = useState(true);
  const [resdata, setresdata] = useState([]);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [rateType, setRateType] = useState("");
  const [rateTypeList, setRateTypeList] = useState([]);
  const [actionLoading, setActionLoading] = useState({
    type: "",
    load: false,
    index: -1,
  });
  const [bulkDownloadtypeState, setBulkDownloadtypeState] = useState(false);
  const [customizeDateModal, setCustomizeDateModal] = useState({
    show: false,
    TestId: "",
  });
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });
  const rowRefs = useRef([]);
  const [downloadLoading, setDownloadLoading] = useState({});
  const [BulkEmailModalState, setBulkEmailModalState] = useState({
    modal: false,
    data: [],
    type: "",
  });
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });
  let PageSize = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const [currentTableTestData, setCurrentTableTestData] = useState([]);
  const { ShowDefaultLoginCentre, DefaultCentre, DefaultCurrencyName, HideAuditTrailDispatch } = useLocalStorage("userData", "get");
  console.log("HideAuditTrailDispatch",HideAuditTrailDispatch)
  useEffect(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    const data = tableData?.map((ele) => {
      return {
        ...ele,
        isChecked: false,
      };
    });
    setCurrentTableTestData(data.slice(firstPageIndex, lastPageIndex));
  }, [currentPage, tableData]);
  const today = new Date();
  const [payload, setPayload] = useState({
    ItemValue: "",
    SelectTypes: "",
    CentreID: "",
    DepartmentID: "",
    TestId: "",
    FromDate: new Date(),
    ToDate: new Date(),
    TestName: "",
    VIP: "",
    Urgent: "",
    DoctorName: "",
    InvestigationId: 0,
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    MachineID: "ALL",
    SampleStatus: "5",
    IsCulture: 0,
  });
  const [downloadLoad, setDownloadLoad] = useState(false);
  const [show, setshow] = useState(false);
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
        setCentreData(CentreDataValue);
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, CentreID: DefaultCentre }))
          fetchRateTypes(DefaultCentre, true);
        }
        else {
          fetchRateTypes(allValues, true);
        }
        if (CentreDataValue?.length == 1) {
          fetchRateTypes(CentreDataValue?.[0]?.value, true);
          setPayload(prev => ({ ...prev, CentreID: CentreDataValue?.[0]?.value }))
        }
      })
      .catch((err) => console.log(err));
  };

  const getDepartment = () => {
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
        setDepartmentData(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  const BindMachineName = () => {
    axiosInstance
      .get("MachineGroup/BindMachineName")
      .then((res) => {
        let data = res?.data?.message;
        let val = data?.map((ele) => {
          return {
            value: ele?.MachineId,
            label: ele?.MachineName,
          };
        });
        setMachineId(val);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occur",
        );
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
        setDoctorAdmin(doctorData);
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name === "CentreID") {
      fetchRateTypes(value, true);
    }
    if (name == "SampleStatus") {
      setPayload({
        ...payload,
        [name]: value,
      });
      TableData(value);
    }
    if (name === "TestName") {
      setPayload({
        ...payload,
        [name]: value,
      });

      if (value === "") {
        console.log("entered", value + "x");
        setSelects(false);
        setTestSuggestion([]);
        setIndexMatch(0);
        // setPayload((prev) => ({...prev, InvestigationId : 0 }))
        return;
      }

      const filtered = allTests?.filter((ele) =>
        ele?.label?.toLowerCase().includes(value.toLowerCase())
      );

      setTestSuggestion(filtered);
      setSelects(true);
      setIndexMatch(0);
    }
    else {
      setPayload({
        ...payload,
        [name]: type == "checkbox" ? checked : value,
      });
    }
  };

  const handleToggle = (field) => {
    setPayload((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  const handleTime = (time, name) => {
    setPayload({ ...payload, [name]: time });
  };
  const handleIndexNew = (e, name) => {
    switch (name) {
      case "DoctorName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(doctorSuggestion.length - 1);
            }
            break;
          case 40:
            if (doctorSuggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            handleListSearchNew(doctorSuggestion[indexMatch], name);
            setIndexMatch(0);
            break;
          default:
            break;
        }

      case "TestName":
        switch (e.which) {
          case 38:
            if (TestSuggestion.length > 0) {
              setIndexMatch((prev) =>
                prev > 0 ? prev - 1 : TestSuggestion.length - 1
              );
            }
            break;
          case 40:
            if (TestSuggestion.length > 0) {
              setIndexMatch((prev) =>
                prev < TestSuggestion.length - 1 ? prev + 1 : 0
              );
            }
            break;
          case 13:
            if (TestSuggestion[indexMatch]) {
              handleListSearchNew(TestSuggestion[indexMatch], name);
            }
            break;

          default:
            break;
        }


      default:
        break;
    }
  };
  const handleSelectMultiChange = (name, value) => {
    // const val = select?.map((ele) => ele?.value);
    setPayload({ ...payload, [name]: value });
  };

  const handleListSearchNew = (data, name) => {
    console.log("data", data);
    switch (name) {
      case "DoctorName":
        setPayload({
          ...payload,
          [name]: data.Name,
          DoctorReferal: data.Name ? data.DoctorReferalID : "",
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;
      case "TestName":
        setPayload({
          ...payload,
          TestName: data?.label,
          InvestigationId: data?.value,
        });

        setSelects(false);
        setTestSuggestion([]);
        setIndexMatch(0);
        break;
    }
  };

  const handleCheck = (e, index) => {
    const { checked, name } = e.target;
    if (index >= 0) {
      const data = [...currentTableTestData];
      data[index][name] = checked;
      setCurrentTableTestData(data);
    } else {
      const data = currentTableTestData?.map((ele) => {
        return {
          ...ele,
          [name]: checked,
        };
      });
      setCurrentTableTestData(data);
    }
  };
  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res.data.message;

        let MapTest = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });
        setAllTests(MapTest);
        setTestSuggestion(MapTest);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getInvestigationList();
    getCollectionBoy(setCollectionBoyList, true);
  }, []);

  const validation = () => {
    let error = "";
    if (payload?.SelectTypes !== "" && payload?.ItemValue === "") {
      error = { ...error, ItemValue: t("Please Choose Value") };
    }
    if (payload.SelectTypes === "Mobile") {
      if (payload?.SelectTypes !== "" && payload?.ItemValue === "") {
        error = { ...error, ItemValue: t("This Field is Required") };
      } else if (payload.ItemValue.length !== 10) {
        error = { ...error, ItemValue: t("Invalid Mobile Number") };
      }
    }
    if (payload.FromDate === moment(new Date()).format("DD/MMM/YYYY")) {
      if (payload.FromTime > moment(new Date()).format("hh:mm:ss ")) {
        error = { ...error, FromTime: t("Time is Invalid") };
      }
    }
    if (payload.ToDate === moment(new Date()).format("DD/MMM/YYYY")) {
      if (payload.ToTime < payload.FromTime) {
        error = { ...error, ToTime: t("Time Must be Less than From Time") };
      }
    }
    return error;
  };

  const TableData = (SampleStatus) => {
    setDownloadLoading({});
    const generatedError = validation();
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post("RE/PatientSearch", {
          CollectionBoyID: Number(collectionBoy || 0),
          RateTypeID: rateType ? [rateType] : [],
          SelectTypes: payload?.SelectTypes,
          ItemValue: payload?.ItemValue,
          FromDate: moment(payload.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(payload.ToDate).format("DD/MMM/YYYY"),
          CentreID: payload?.CentreID ? [Number(payload?.CentreID)] : [],
          SampleStatus: SampleStatus,
          DepartmentID: payload?.DepartmentID
            ? [Number(payload?.DepartmentID)]
            : [],
          MachineID: payload?.MachineID,
          FromTime: payload.FromTime,
          ToTime: payload.ToTime,
          isUrgent: payload?.Urgent ? 1 : 0,
          IsCulture: payload?.IsCulture ? 1 : 0,
          VIP: payload?.VIP ? 1 : 0,
          TestName: payload?.TestName ? [payload?.InvestigationId] : [],
        })
        .then((res) => {
          if (res?.data?.message.length > 0) {
            const data = res?.data?.message.map((ele) => {
              return {
                ...ele,
                isChecked: false,
              };
            });
            setTableData(data);
          } else {
            toast.error("No Data Found");
            setTableData([]);
          }

          setLoad(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong.",
          );
          setLoad(false);
          setErrors(generatedError);
        });
    } else {
      setErrors(generatedError);
    }
  };

  const showResult = (InvestigationID, PatientCode, index, TestID) => {
    setActionLoading({
      type: "showResult",
      load: true,
      index: index,
    });
    axiosInstance
      .post("RE/PatientObservationDetails", {
        InvestigationID,
        PatientCode,
        TestID,
      })
      .then((res) => {
        const data = res?.data?.message;
        if (res?.data?.success) {
          setresdata(data);
          // const finalData = data.reduce((acc, current) => {
          //   if (acc[current.LabObservationID]) {
          //     acc[current.LabObservationID] = {
          //       ...acc[current.LabObservationID],
          //       renderData: [
          //         ...acc[current.LabObservationID].renderData,
          //         { date: current?.AD, value: current?.Value },
          //       ],
          //     };
          //   } else {
          //     acc[current.LabObservationID] = {
          //       ...current,
          //       renderData: [{ date: current?.AD, value: current?.Value }],
          //     };
          //   }
          //   return acc;
          // }, {});
          // console.log({finalData})
          // setObservationData(Object.values(finalData));
          setActionLoading({
            type: "",
            load: false,
            index: -1,
          });
        } else {
          toast?.error("No Record Found");
          setActionLoading({
            type: "",
            load: false,
            index: -1,
          });
        }
      })
      .catch((err) => {
        setActionLoading({
          type: "",
          load: false,
          index: -1,
        });
        toast.error(err);
      });
  };

  const filterOutChecked = (data, type) => {
    const finalData = data.reduce((acc, current) => {
      if (current.isChecked) {
        acc.push(current[type]);
      }
      return acc;
    }, []);
    return finalData;
  };

  const ApproveAllTest = async () => {
    const payload = filterOutChecked(currentTableTestData, "TestID");

    if (payload.length > 0 && ApprovedBy) {
      setLoad(true);
      axiosInstance
        .post("RE/ApproveAllTest", {
          TestID: payload,
          IsCulture: 0,
          ApprovedBy: ApprovedBy,
        })
        .then((res) => {
          setLoad(false);
          toast.success(res?.data?.message);

          TableData();
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err?.response?.data?.message);
        });
    } else {
      toast.error("Please choose Test ToApprove or Doctor");
    }
  };

  const sampleStatusOptions = () => {
    return SampleStatus.reduce((acc, current) => {
      if (["", "5", "6"].includes(current?.value)) {
        acc.push(current);
      }
      return acc;
    }, []);
  };

  const handleReport = (TestIDHash, PHead, type, index) => {
    if (actionLoading.index === -1) {
      setActionLoading({
        load: true,
        type: type,
        index: index,
      });
      const requestOptions = {
        ...(CheckDevice() == 1 && { responseType: "blob" }),
      };
      axiosReport
        .post(
          `commonReports/GetLabReport`,
          {
            TestIDHash: Array?.isArray(TestIDHash) ? TestIDHash : [TestIDHash],
            PHead: PHead,

            IsDownload: 1,
            // IsDownload: CheckDevice(),
            PrintColour: "1",
          },
          // requestOptions
          { responseType: "blob" },
        )
        .then((res) => {
          // if (CheckDevice() == 1) {
          //   downloadPdf(res.data);
          // } else {
          //   if (res?.data?.success) {
          //     window.open(res?.data?.url, "_blank");
          //   } else {
          //     toast.error(res?.data?.message);
          //   }
          // }
          const blob = new Blob([res.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
          if (window.innerWidth <= 765) {
            downloadPdf(res.data);
          }
          setActionLoading({
            load: false,
            type: "",
            index: -1,
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : err?.data?.message,
          );
          setActionLoading({
            load: false,
            type: "",
            index: -1,
          });
        });
    } else {
      toast.warn("Please wait Generating Report");
    }
  };

  const getPatientInfoReport = () => {
    console.log(
      filterOutChecked(currentTableTestData, "ledgertransactionid").toString(),
    );
    axiosReport
      .post(`commonReports/LabWorksheet`, {
        FromDate: moment(payload.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(payload.ToDate).format("DD/MMM/YYYY"),
        CentreID: AllDataDropDownPayload(
          payload?.CentreID,
          CentreData,
          "value",
        ),
        DepartmentID: AllDataDropDownPayload(
          payload?.DepartmentID,
          DepartmentData,
          "value",
        ),
        FromTime: new Date(today.setHours(0, 0, 0, 0)),
        ToTime: new Date(today.setHours(23, 59, 59, 999)),
        ReportType: Number(2),
        ledgertransactionid: filterOutChecked(
          currentTableTestData,
          "ledgertransactionid",
        ).toString(),
      })
      .then((res) => {
        window.open(res?.data?.url, "_blank");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
      });
  };

  let statusOfDownload = {};

  const downloadFile = async (
    TestIDHash,
    PHead,
    signature,
    payload,
    BulkUrl,
  ) => {
    for (let i = 0; i <= TestIDHash.length; i++) {
      statusOfDownload = {
        ...statusOfDownload,
        [TestIDHash[i]]: {
          TestIDHash: TestIDHash[i],
          display: "Downloading...",
          className: "text-warning",
          icons: <SpinnerLoad />,
          backgroundColor: "",
        },
      };
    }

    setDownloadLoading({
      ...statusOfDownload,
    });

    await axiosReport
      .post(`commonReports/GetLabReport`, {
        TestIDHash: TestIDHash,
        PHead: PHead,
        signature: signature,

        IsDownload: 0, // CheckDevice(),
        PrintColour: "1",
      })
      .then((res) => {
        if (res?.data?.success) {
          for (let i = 0; i <= TestIDHash.length; i++) {
            statusOfDownload = {
              ...statusOfDownload,
              [TestIDHash[i]]: {
                TestIDHash: TestIDHash[i],
                display: "",
                className: "text-success",
                icons: (
                  <i
                    class="fa fa-check"
                    aria-hidden="true"
                    style={{
                      padding: "2px",
                      backgroundColor: "green",
                      borderRadius: "25px",
                      color: "white",
                      fontSize: "10px",
                    }}
                  ></i>
                ),
              },
            };
          }

          setDownloadLoading({
            ...statusOfDownload,
          });

          payload.status = 1;
          BulkUrl.push(res?.data?.url?.split("?")[0]);
        } else {
          for (let i = 0; i <= TestIDHash.length; i++) {
            statusOfDownload = {
              ...statusOfDownload,
              [TestIDHash[i]]: {
                TestIDHash: TestIDHash[i],
                display: res?.data?.message,
                className: "text-danger",
                icons: <i class="fa fa-times" aria-hidden="true"></i>,
                backgroundColor: "#ffd6d6",
              },
            };
          }

          setDownloadLoading({
            ...statusOfDownload,
          });

          payload.status = 0;
        }
      })
      .catch((err) => {
        for (let i = 0; i <= TestIDHash.length; i++) {
          statusOfDownload = {
            ...statusOfDownload,
            [TestIDHash[i]]: {
              TestIDHash: TestIDHash[i],
              display: "Failed...",
              className: "text-danger",
              icons: <i class="fa fa-times" aria-hidden="true"></i>,
              backgroundColor: "#ffd6d6",
            },
          };
        }

        setDownloadLoading({
          ...statusOfDownload,
        });

        payload.status = 0;
      });
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

  const handleBulkDownload = async (reportType) => {
    const { letterHead, Signature } = reportType;
    setBulkDownloadtypeState(false);
    setDownloadLoad(true);
    let payload = currentTableTestData?.reduce((acc, current) => {
      const index = acc.findIndex(
        (ele) => ele.ledgertransactionid === current?.ledgertransactionid,
      );
      if (current.isChecked) {
        if (index >= 0) {
          acc[index].TestIDHash = [
            ...acc[index].TestIDHash,
            current?.TestIDHash,
          ];
        } else {
          acc.push({
            ledgertransactionid: current?.ledgertransactionid,
            LedgerTransactionNo: current?.LedgerTransactionNo,
            TestIDHash: [current?.TestIDHash],
            status: 1,
          });
        }
      }
      return acc;
    }, []);

    let BulkUrl = [];

    for (let i = 0; i < payload.length; i++) {
      await downloadFile(
        payload[i].TestIDHash,
        letterHead,
        Signature,
        payload[i],
        BulkUrl,
      );
    }

    axiosReport
      .post("commonReports/BulkDownload", {
        pdfUrls: BulkUrl,
      })
      .then(async (res) => {
        // setDownloadLoad(false);
        // downloadPdf(res?.data?.url)
        // window.open(res?.data?.url, "_blank");

        setDownloadLoad(false);
        const s3Url = res?.data?.url;

        window.open(encodeURI(s3Url), "_blank");

        // window.open(encodeURI(res?.data?.url), "_blank");
        // await downloadPdfFromUrl(res?.data?.url);     
      })
      .catch((err) => {
        setDownloadLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
      });
  };

  const handleReactSelectChange = (name, option) => {
    if (name === "rateType") {
      setRateType(option?.value);
      return;
    }
    setCollectionBoy(option?.value);
  };

  const handleSelectChange = (name, value) => {
    if (name === "CentreID") {
      fetchRateTypes(value?.value, true);

      setPayload((prev) => ({
        ...prev,
        [name]: value?.value
      }))
    }
    setPayload((prev) => ({
      ...prev,
      [name]: value?.value
    }))
  }

  const handleDoctorName = (e) => {
    setApprovedBy(e.target.value);
  };

  const fetchRateTypes = async (id, showLoader = false) => {
    if (showLoader) setRateTypeLoading(true);
    try {
      const res = await axiosInstance.post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: id?.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      });

      const list = (res?.data?.message || []).map((item) => ({
        label: item?.RateTypeName
          ?.replace(/\r?\n/g, " ")
          .trim(),
        value: item?.RateTypeID,
      }));

      setRateTypeList(list);

      if (list.length === 1) {
        setRateType(list[0].value);
      } else {
        setRateType("");
      }
    } catch (err) {
      if (showLoader) setRateTypeLoading(false);
      console.log(err);
      setRateTypeList([]);
      setRateType("");
    } finally {
      if (showLoader) setRateTypeLoading(false);
    }
  };

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    BindMachineName();
    BindApprovalDoctor();
  }, []);

  useEffect(() => {
    if (payload?.TestName === "") {
      setPayload((prev) => ({ ...prev, InvestigationId: 0 }));
    }
  }, [payload?.TestName]);

  console.log("currentTableTestData", currentTableTestData);

  return (
    <>
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null }); // close modal
            TableData(payload?.SampleStatus);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          visitKey="LedgerTransactionNo"
          testIDsKey="TestID"
          testNamesKey="InvestigationName"
          ledgerTransactionIDKey="ledgertransactionid"
          patientNameKey="PatientName"
          ageGenderKey="AgeGender"
        />
      )}
      <Accordion
        name={t("Bulk Activity")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row  px-2 mt-2">
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
                  id="SelectTypes"
                  lable="SelectTypes"
                  selectedValue={payload?.SelectTypes}
                  name="SelectTypes"
                  onChange={handleChange}
                />
              </div>
              <div style={{ width: "60%" }}>
                {payload?.SelectTypes === "Mobile" ? (
                  <div style={{ width: "100%" }}>
                    <Input
                      type="number"
                      name="ItemValue"
                      max={10}
                      value={payload?.ItemValue}
                      onInput={(e) => number(e, DefaultCurrencyName == "KES" ? 14 : 10)}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <div style={{ width: "100%" }}>
                    <Input
                      type="text"
                      name="ItemValue"
                      max={20}
                      value={payload?.ItemValue}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-sm-2">
            {/* <SelectBox
              options={[{ label: "Select Centre", value: "" }, ...CentreData]}
              selectedValue={payload?.CentreID}
              name="CentreID"
              lable="Centre"
              id="Centre"
              onChange={handleChange}
            /> */}

            <ReactSelect
              dynamicOptions={[
                { label: "Select Centre", value: "" },
                ...CentreData,
              ]}
              name="CentreID"
              lable={t("Centre")}
              id="Centre"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={payload.CentreID}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              options={AddBlankData(DepartmentData, "All Department")}
              lable="Department"
              id="Department"
              selectedValue={payload.DepartmentID}
              name="DepartmentID"
              onChange={handleChange}
            /> */}

            <ReactSelect
              dynamicOptions={[
                { label: "All Department", value: "" },
                ...DepartmentData,
              ]}
              name="DepartmentID"
              lable={t("Department")}
              id="Department"
              removeIsClearable={true}
              placeholderName={t("Department")}
              value={payload.DepartmentID}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2 ">
            <ReactSelect
              dynamicOptions={[
                { label: "All RateType", value: "" },
                ...rateTypeList,
              ]}
              name="rateType"
              lable={t("rateType")}
              id="rateType"
              removeIsClearable={true}
              placeholderName={t("RateType")}
              value={rateType}
              onChange={handleReactSelectChange}
              isLoading={rateTypeLoading}
            />
          </div>
          <div className="col-sm-2 mb-1">
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
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              placeholder=" "
              lable="Refer Doctor"
              id="DoctorName"
              name="DoctorName"
              value={payload?.DoctorName}
              onKeyDown={(e) => handleIndexNew(e, "DoctorName")}
              onBlur={(e) => {
                autocompleteOnBlur(setDoctorSuggestion);
                setTimeout(() => {
                  const data = doctorSuggestion?.filter(
                    (ele) => ele?.Name === e.target.value,
                  );
                  if (data?.length === 0) {
                    setPayload({ ...payload, DoctorName: "" });
                  }
                }, 500);
              }}
              autoComplete="off"
              onChange={handleChange}
            />
            {dropFalse && doctorSuggestion?.length > 0 && (
              <ul
                className="suggestion-data"
                style={{ top: "26px", right: "0px" }}
              >
                {doctorSuggestion?.map((data, index) => (
                  <li
                    onClick={() => handleListSearchNew(data, "DoctorName")}
                    className={`${index === indexMatch && "matchIndex"}`}
                    key={index}
                  >
                    {data?.Name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="row  px-2 mb-1">
          {/* <div className="col-sm-2  ">
            <MultiSelectComp
              options={TestSuggestion}
              value={payload?.TestName}
              name="TestName"
              placeholder=" "
              label={t("TestName")}
              id="TestName"
              onChange={handleSelectMultiChange}
            />
          </div> */}
          <div className="col-sm-2  ">
            <Input
              type="text"
              name="TestName"
              lable="Search By Test Name"
              id="TestName"
              value={payload?.TestName}
              placeholder=" "
              onChange={handleChange}
              onKeyDown={(e) => handleIndexNew(e, "TestName")}

              onBlur={(e) => {
                autocompleteOnBlur(setTestSuggestion);
              }}
            />
            {selects &&
              TestSuggestion.length > 0 &&
              payload?.TestName && (
                <ul className="suggestion-data">
                  {TestSuggestion.map((data, index) => (
                    <li
                      onClick={() => handleListSearchNew(data, "TestName")}
                      className={`${index === indexMatch && "matchIndex"}`}
                      key={index}
                    >
                      {data?.label}
                    </li>
                  ))}
                </ul>
              )}
          </div>
          {/* <div className="col-sm-2">
            <SelectBox
              options={[{ label: "All Machine", value: "ALL" }, ...machineId]}
              onChange={handleChange}
              name="MachineID"
              lable="MachineID"
              id="MachineID"
              selectedValue={payload?.MachineID}
            />
          </div> */}
          <div className="col-sm-2 ">
            <DatePicker
              name="FromDate"
              className="custom-calendar"
              id="FromDate"
              lable="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              maxDate={new Date(payload?.ToDate)}
            />
          </div>
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
                maxDate={new Date()}
                minDate={new Date(payload?.FromDate)}
              />
            </div>
          </div>
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

          <div className="col-sm-2">
            <SelectBox
              options={sampleStatusOptions()}
              onChange={handleChange}
              id="SampleStatus"
              lable="SampleStatus"
              name="SampleStatus"
              selectedValue={payload?.SampleStatus}
            />
          </div>

          {/* <div className="col-sm-1">
            <input
              type="checkbox"
              name="Urgent"
              value={payload?.Urgent}
              checked={payload?.Urgent}
              onChange={handleChange}
            />
            <label className="ml-2">{t("IsUrgent")}</label>
          </div> */}
          <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
            gap: "5px"
          }}>
            <label class="switch mb-0">
              <input
                type="checkbox"
                checked={payload.Urgent === 1}
                onChange={() => handleToggle("Urgent")}
              />
              <span class="slider"></span>
            </label>
            <strong>
              <span>{t("IsUrgent")}</span>
            </strong>
          </div>

          {/* <div className="col-sm-1">
            <input
              type="checkbox"
              name="IsCulture"
              value={payload?.IsCulture}
              checked={payload?.IsCulture}
              onChange={handleChange}
            />
            <label className="ml-2">{t("IsCulture")}</label>
          </div> */}

          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => TableData(payload?.SampleStatus)}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}
        seconTitle={
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
        }
      >
        {load ? (
          <Loading />
        ) : (
          <>
            {currentTableTestData?.length > 0 ? (
              <div>
                <div className="row p-2">
                  <div className="col-12">
                    <div
                      style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                      }}
                    >
                      <div className="d-md-none d-block">
                        <div className="w-100 d-flex align-items-center justify-content-end px-3">
                          <div className="d-flex align-items-center justify-content-start">
                            <input
                              style={{ marginRight: "10px" }}
                              type="checkbox"
                              id="checkAllRow"
                              name="isChecked"
                              onChange={(e) => {
                                handleCheck(e);
                              }}
                              checked={
                                currentTableTestData.length > 0
                                  ? isChecked(
                                    "isChecked",
                                    currentTableTestData,
                                    true,
                                  ).includes(false)
                                    ? false
                                    : true
                                  : false
                              }
                            />
                            <label htmlFor="checkAllRow" className="mb-0">
                              Select All
                            </label>
                          </div>
                        </div>
                      </div>
                      <Tables>
                        <thead
                          className="cf awpoqw"
                          style={{
                            position: "sticky",
                            // zIndex: 99,
                            top: 0,
                          }}
                        >
                          <tr>
                            <th>{t("S.No")}</th>
                            <th>
                              <input
                                style={{ marginRight: "10px" }}
                                type="checkbox"
                                name="isChecked"
                                onChange={(e) => {
                                  handleCheck(e);
                                }}
                                checked={
                                  currentTableTestData.length > 0
                                    ? isChecked(
                                      "isChecked",
                                      currentTableTestData,
                                      true,
                                    ).includes(false)
                                      ? false
                                      : true
                                    : false
                                }
                              />
                            </th>
                            <th>{t("Barcode No.")}</th>
                            <th>{t("TestName")}</th>
                            <th>{t("Lab Ref No.")}</th>
                            <th>{t("RateTypeName.")}</th>
                            <th>{t("Delay")}</th>
                            {/* <th>{t("Result/Value")}</th> */}
                            {/* <th>{t("Reference Range")}</th> */}
                            <th>{t("Remarks")}</th>
                            <th>{t("Last Remark")}</th>
                            {Number(HideAuditTrailDispatch) === 0 && (
                              <th>{t("Details")}</th>
                            )}
                            <th>{t("Print")}</th>
                            {/* <th>{t("Customize Date")}</th> */}
                          </tr>
                        </thead>
                        <tbody className="skweoi">
                          {currentTableTestData?.map((ele, index) => (
                            <>
                              <tr key={index}>
                                <td
                                  colSpan={2}
                                  className={`Status-${ele?.Status}`}
                                ></td>
                                <td colSpan={Number(HideAuditTrailDispatch) === 0 ? 9 : 8} className="bulk-info-patient-td">
                                  <strong>LabNo: </strong>{ele?.LedgerTransactionNo},
                                  {" "}
                                  {/* UHID: {ele?.PatientCode},  */}
                                  <strong>Patient Name: </strong> {ele?.PatientName},
                                  {" "}
                                  <strong>Age/Gender: </strong> {ele?.AgeGender},
                                  {" "}
                                  <strong>SIN No: </strong> {ele?.BarcodeNo},
                                  {" "}
                                  <strong>Registration Date: </strong> {ele?.orderDAte || " "},
                                  {" "}
                                  {/* IPNo: {ele?.IPNo ?? "-"},
                                  Source: {ele?.Source ?? "-"},  */}
                                  <strong>RefBy: </strong>{ele?.RefBy}
                                </td>
                              </tr>
                              <tr
                                style={{
                                  backgroundColor: `${ele?.Isculture && "#e8fdb4"}`,
                                }}
                              >
                                <td data-title={t("S.No")}>
                                  <div className="d-flex">
                                    {index +
                                      1 +
                                      IndexHandle(currentPage, PageSize)}
                                    &nbsp;
                                    {ele?.IsPatientDocAvail > 0 && (
                                      <div>
                                        <i
                                          className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                                          // className="bi bi-paperclip cursor-pointer"
                                          style={{ fontSize: "16px" }}
                                          onClick={() => handleOpenPreview(ele?.awsKeys)}
                                          title="View Attachments"
                                        />
                                      </div>
                                    )}

                                    {ele?.isUrgent === 1 && (
                                      <span>
                                        <img
                                          src={Urgent}
                                          className="sizeicon ml-2"
                                          title="Urgent"
                                        ></img>
                                      </span>
                                    )}
                                    &nbsp;
                                    {ele?.IsVip === 1 && (
                                      <span>
                                        <i
                                          className="bi bi-shield-fill-check mr-1 vip-font-size"
                                          style={{ color: "#FFC107", display: "inline", width: "5%" }}
                                          title="VIP Patient"
                                        />
                                      </span>

                                    )}
                                  </div>

                                </td>
                                <td data-title={t("Select")}>
                                  {
                                    <input
                                      type="checkbox"
                                      name="isChecked"
                                      onChange={(e) => {
                                        handleCheck(e, index);
                                      }}
                                      checked={ele?.isChecked}
                                    ></input>
                                  }
                                  &nbsp;
                                </td>
                                <td
                                  data-title={t("Barcode No.")}
                                  ref={(el) => {
                                    if (
                                      el &&
                                      downloadLoading?.[ele?.TestIDHash]
                                        ?.icons &&
                                      downloadLoading?.[ele?.TestIDHash]
                                        ?.TestIDHash === ele?.TestIDHash
                                    ) {
                                      el.scrollIntoView({
                                        behavior: "smooth",
                                        block: "nearest",
                                      });
                                    }
                                  }}
                                >
                                  {ele?.BarcodeNo}&nbsp;
                                  {downloadLoading?.[ele?.TestIDHash]
                                    ?.TestIDHash === ele?.TestIDHash && (
                                      <div
                                        className="box-title"
                                        style={{
                                          padding: "1px",
                                          borderRadius: "3px",
                                          backgroundColor:
                                            downloadLoading?.[ele?.TestIDHash]
                                              ?.backgroundColor,
                                        }}
                                      >
                                        <strong
                                          className={
                                            downloadLoading?.[ele?.TestIDHash]
                                              ?.className
                                          }
                                        >
                                          {t(
                                            downloadLoading?.[ele?.TestIDHash]
                                              ?.display,
                                          )}
                                          {
                                            downloadLoading?.[ele?.TestIDHash]
                                              ?.icons
                                          }
                                        </strong>
                                      </div>
                                    )}
                                </td>
                                <td data-title={t("Investigation")}>
                                  <p
                                    title={ele?.InvestigationName}
                                    className="mb-0"
                                  >
                                    {ele?.InvestigationName?.length > 30
                                      ? ele?.InvestigationName?.slice(0, 30) +
                                      "..."
                                      : ele?.InvestigationName}
                                  </p>
                                  &nbsp;
                                </td>
                                <td data-title={t("Lab Ref No.")}>
                                  {ele?.LedgerTransactionNo}&nbsp;
                                </td>
                                <td data-title={t("RateTypeName")}>
                                  {ele?.RateTypeName}&nbsp;
                                </td>
                                <td data-title={t("Delay")}>{"-"}&nbsp;</td>
                                {/* {ele?.Isculture === 0 ? (
                                  <td data-title={t("Result/Value")}>
                                    {ele?.Parametercount === 1 ? (
                                      ele?.VALUE
                                    ) : actionLoading?.load &&
                                      actionLoading?.type === "showResult" &&
                                      actionLoading?.index === index ? (
                                      <SpinnerLoad />
                                    ) : (
                                      <div
                                        className="text-primary"
                                        style={{
                                          textDecoration: "underline",
                                          cursor: "pointer",
                                        }}
                                        onClick={() => {
                                          showResult(
                                            Number(ele?.Investigationid),
                                            ele?.PatientCode,
                                            index,
                                            ele?.TestID,
                                          ),
                                            setshow(true);
                                        }}
                                      >
                                        {t("Result")}
                                      </div>
                                    )}
                                    &nbsp;
                                  </td>
                                ) : (
                                  <td data-title={t("Result/Value")}></td>
                                )} */}
                                {/* <td data-title={t("Reference Range")}>
                                  {ele?.ReferenceRange}&nbsp;
                                </td> */}
                                <td data-title={t("Remarks")}>
                                  <div
                                    data-tooltip-id={`remark-tooltip-${index}`}
                                    onClick={() => {
                                      setShowAddRemark({
                                        modal: true,
                                        rowData: {
                                          ...ele,
                                        },
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
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                      }}
                                    >
                                      <FaPlus color="white" size={8} />
                                    </div>
                                    {ele.LabRemarkCount > 0 && (
                                      <span
                                        style={{
                                          fontSize: "12px",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        ({ele.LabRemarkCount})
                                      </span>
                                    )}
                                  </div>
                                  {(Array.isArray(parseRemarks(ele?.RemarksList))) && parseRemarks(ele?.RemarksList)?.length > 0 && (
                                    <ReactTooltip
                                      id={`remark-tooltip-${index}`}
                                      place="top"
                                      style={{ zIndex: 9999 }}
                                      clickable
                                      content={<RemarkTooltip remarks={parseRemarks(ele.RemarksList)} />}
                                    />
                                  )}
                                </td>
                                <td data-title={t("LastRemark")}>
                                  <LastRemarkCell remarks={ele?.RemarksList || "-"} />
                                </td>
                                {Number(HideAuditTrailDispatch) === 0 && (
                                  <td
                                    data-title={t("Details")}
                                    onClick={() => {
                                      setModal(true);
                                      setVisitID(ele?.LedgerTransactionNo);
                                    }}
                                  >
                                    <i className="fa fa-search" />
                                  </td>
                                )}
                                {[6, 5].includes(ele?.Status) ? (
                                  <td data-title={t("Print")}>
                                    {actionLoading?.load &&
                                      actionLoading?.type ===
                                      "Printwithoutheader" &&
                                      actionLoading?.index === index ? (
                                      <Loading />
                                    ) : (
                                      <i
                                        className="fa fa-print"
                                        style={{
                                          cursor: "pointer",
                                          textAlign: "center",
                                        }}
                                        onClick={() =>
                                          handleReport(
                                            ele?.TestIDHash,
                                            0,
                                            "Printwithoutheader",
                                            index,
                                          )
                                        }
                                        title="Print without header"
                                      ></i>
                                    )}
                                    &nbsp;
                                    {/* <br></br>
                                    <br></br> */}
                                    {actionLoading?.load &&
                                      actionLoading?.type === "Printwithheader" &&
                                      actionLoading?.index === index ? (
                                      <Loading />
                                    ) : (
                                      <i
                                        className="fa fa-print"
                                        style={{
                                          color: "red",
                                          cursor: "pointer",
                                          textAlign: "center",
                                        }}
                                        onClick={() =>
                                          handleReport(
                                            ele?.TestIDHash,
                                            1,
                                            "Printwithheader",
                                            index,
                                          )
                                        }
                                        title="Print with header"
                                      ></i>
                                    )}
                                  </td>
                                ) : (
                                  <td></td>
                                )}

                                {/* <td data-title={t("Customize Date")}>
                                  <div
                                    className="text-info"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setCustomizeDateModal({
                                        TestId: ele?.TestID.toString(),
                                        show: true,
                                      });
                                    }}
                                  >
                                    <i className="fa fa-edit"></i>
                                  </div>
                                  &nbsp;
                                </td> */}
                              </tr>
                            </>
                          ))}
                        </tbody>
                      </Tables>
                    </div>
                  </div>
                </div>
                <div className="row justify-content-between px-3">
                  <>
                    {[3, 10].includes(parseInt(payload?.SampleStatus)) && (
                      <>
                        <div className="col-sm-2">
                          <SelectBox
                            selectedValue={ApprovedBy}
                            id="ApprovedBy"
                            lable="ApprovedBy"
                            options={doctorAdmin}
                            name="ApprovedBy"
                            onChange={handleDoctorName}
                          ></SelectBox>
                        </div>{" "}
                        <div className="col-sm-2">
                          <CustomButton
                            text={"Approve"}
                            onClick={ApproveAllTest}
                            className="btn-success"
                          />
                        </div>
                      </>
                    )}

                    {[5, 6].includes(parseInt(payload?.SampleStatus)) && (
                      <div className="d-block d-md-flex"
                        style={{
                          gap: "5px",
                        }}
                      >
                        <CustomButton
                          text={"Bulk Download (Without LetterHead)"}
                          icon={"download"}
                          className="w-100 w-md-auto mb-1 mb-md-0"
                          disabled={
                            filterOutChecked(currentTableTestData, "TestID")
                              .length > 0
                              ? false
                              : true
                          }
                          onClick={() => {
                            if (downloadLoad) {
                              toast.warn("Please wait Generating Report");
                            } else {
                              // setBulkDownloadtypeState(true)
                              handleBulkDownload({ letterHead: 0, Signature: 0 });
                            };
                          }}
                        />
                        <CustomButton
                          text={"Bulk Download (LetterHead)"}
                          icon={"download"}
                          className="w-100 w-md-auto mb-1 mb-md-0"
                          disabled={
                            filterOutChecked(currentTableTestData, "TestID")
                              .length > 0
                              ? false
                              : true
                          }
                          onClick={() => {
                            if (downloadLoad) {
                              toast.warn("Please wait Generating Report");
                            } else {
                              // setBulkDownloadtypeState(true)
                              handleBulkDownload({ letterHead: 1, Signature: 0 });
                            };
                          }}
                        />
                        <CustomButton
                          text={"Bulk Email"}
                          icon={"mail"}
                          className="w-100 w-md-auto mb-1 mb-md-0"
                          disabled={
                            filterOutChecked(currentTableTestData, "TestID")
                              .length > 0
                              ? false
                              : true
                          }
                          onClick={() =>
                            setBulkEmailModalState({
                              modal: true,
                              data: currentTableTestData,
                              type: "EmailSend",
                            })
                          }
                        />
                      </div>
                    )}
                    {/* {[5, 6].includes(parseInt(payload?.SampleStatus)) && (
                      <CustomButton
                          text={"Bulk Email"}
                          icon={"mail"}
                           disabled={
                          filterOutChecked(currentTableTestData, "TestID")
                            .length > 0
                            ? false
                            : true
                        }
                        onClick={() =>
                          setBulkEmailModalState({
                            modal: true,
                            data: currentTableTestData,
                            type: "EmailSend",
                          })
                        }
                      />
                    )} */}
                    <div className="col-sm-6 mb-1" style={{ textAlign: "end" }}>
                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={tableData?.length}
                        pageSize={PageSize}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  </>
                </div>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}
      </Accordion>
      {/* {observationData.length > 0 && (
        <BulkApprovalModal
          show={true}
          onHide={() => setObservationData([])}
          data={observationData}
        />
      )} */}

      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}

      {customizeDateModal?.show && (
        <CustomDateModal
          show={customizeDateModal?.show}
          data={customizeDateModal?.TestId}
          onHide={() =>
            setCustomizeDateModal({
              show: false,
              TestId: "",
            })
          }
        />
      )}

      {bulkDownloadtypeState && (
        <BulkDownloadType
          show={bulkDownloadtypeState}
          onHide={() => setBulkDownloadtypeState(false)}
          onSubmit={handleBulkDownload}
        />
      )}

      {BulkEmailModalState?.modal && (
        <BulkEmailModal
          data={BulkEmailModalState}
          onHide={() =>
            setBulkEmailModalState({
              modal: false,
              data: [],
              type: "",
            })
          }
        />
      )}
      {show && (
        <ResultModal show={show} setshow={setshow} observationData={resdata} />
      )}
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />
    </>
  );
};

export default BulkActivity;
