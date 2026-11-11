import React, { use, useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { workSheetSampleStatus } from "../../utils/Constants";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import {
  BindApprovalDoctorReports,
  BindEmployeeReports,
  BindProEmployee,
  getAccessCentresReports,
  getAccessDataRate,
  getAccessDataRateReport,
  GetGlobalData,
  getPaymentModes,
  getVisitType,
} from "../../utils/NetworkApi/commonApi";

import Heading from "../../components/UI/Heading";
import { commonDataState, Time } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import axios from "axios";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Type } from "lucide-react";
const DocumentType = [
  {
    label: "Select Document Type",
    value: 0,
  },
  {
    label: "PDF",
    value: 2,
  },
  {
    label: "Excel",
    value: 1,
  },
];

const SearchByDate = [
  {
    label: "Select Document Type",
    value: "",
  },
  {
    label: "Registeration Date",
    value: "RegisterationDate",
  },
  {
    label: "Sample Collection Date",
    value: "SampleCollectionDate",
  },
  {
    label: "Sample Receiving Date ",
    value: "SampleReceivingDate",
  },
  {
    label: "Approved Date",
    value: "ApprovedDate",
  },
  {
    label: "Sample Rejection Date",
    value: "SampleRejectionDate",
  },
];
const SampleOriginArea = [
  {
    label: "OPD",
    value: "OPD",
  },
  {
    label: "IPD",
    value: "IPD",
  },
  {
    label: "ICU",
    value: "ICU",
  },
]

const FilterDate = [
  {
    label: "GRN Date",
    value: "0",
  },
  {
    label: "POST Date",
    value: "1",
  },
]

const AppTypeOption = [
  {
    label: "All",
    value: "0",
  },
  {
    label: "Direct GRN",
    value: "1",
  },
  {
    label: "GRN From PO",
    value: "2",
  },
]

const StatusOptions = [
  {
    label: "All",
    value: "All",
  },
  {
    label: "Is Payment",
    value: "Payment",
  },
  {
    label: "Is Forwarded",
    value: "Forwarded",
  },
  {
    label: "Is POD Accept",
    value: "PODAccept",
  },
  {
    label: "Is POD Transfer",
    value: "PODTransfer",
  },
]

const AntibioticSensitivity = [
  // {
  //   label: "SENSITIVE(++++)",
  //   value: "SENSITIVE(++++)",
  // },
  {
    label: "Sensitive",
    value: "Sensitive",
  },
  {
    label: "Resistant",
    value: "Resistant",
  },
  {
    label: "Intermediate",
    value: "Intermediate",
  },
]

function GetReport(props) {
  const { secondTitle } = props;
  const { t } = useTranslation();
  const location = useLocation();
  console.log(location, "location");
  const { id: paramId } = useParams();
  const id = props?.id || paramId;
  const [load, setLoad] = useState(true);
  const [CentreData, setCentreData] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [VisitType, setVisitType] = useState([]);
  const [DoctorName, setDoctorAdmin] = useState([]);
  const [EmployeeName, setEmployeeName] = useState([]);
  const [mapTest, setMapTest] = useState([]);
  const [ObservationData, setObservationData] = useState([]);
  const [rateType, setRateType] = useState([]);
  const [reportType, setReportType] = useState("0");
  const [FieldShow, setFieldShow] = useState({});
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [proEmployee, setProEmployee] = useState([]);
  const [PatientSource, setPatientSource] = useState([]);
  const [htmlData, setHtmlData] = useState([]);
  const [cultureTest, setCultureTest] = useState([]);
  const [pdfType, setPdfType] = useState(null);
  const [PaymentMode, setPaymentMode] = useState([])
  const [CenterType, setCenterType] = useState([]);
  const [getLocations, setGetLocations] = useState([]);
  const [Supplier, setSupplier] = useState([]);
  const [Items, setItems] = useState([]);
  const [MarketerData, setMarketerData] = useState([]);

  const localData = useLocalStorage("userData", "get");
  const handleRadioChange = (e) => {
    setReportType(e.target.value);
  };
  const currentPathname = window.location.pathname;
  const today = new Date();
  const allowedExcelOnlyPaths = [
    "/getreport/departmentwisetestreport",
    "/getreport/referedbytestreport",
    "/getreport/valuewisemisreport",
    "/getreport/departmentwisevisittypetestreport",
    "/getreport/tatreportdetails",
    "/getreport/amendmentreport",
    "/getreport/tatantibioticreport",
    "/getreport/courierreport",
    "/getreport/getpatientinforeport",
    "/getreport/patientsamplesourcereport",
    "/getreport/patientfeedbackreport",
    "/getreport/diagnosticstestreport",
    "/getreport/invoicetrackingreport",
    "/getreport/patientdetailreport",
    "/getreport/patientbiodatareport",
    "/getreport/histocytodelayedreport",
    "/getreport/kenyaregionforecastingreport"
  ];

  const [formData, setFormData] = useState({
    Centre: [],
    CenterType: [],

    // rateType: "",
    FromDate: new Date(),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    ToDate: new Date(),
    DocumentType: allowedExcelOnlyPaths.includes(
      location.pathname?.toLowerCase().trim(),
    )
      ? 1
      : 2,
    Test: [],
    User: [],
    RateType: "",
    MultipleRateType: [],
    Department: "",
    MultipleDepartment: [],
    VisitType: "",
    TestId: [],
    FromRange: "",
    ToRange: "",
    ObservationId: [],
    InvestigationId: [],
    PatientType: "",
    Doctor: [],
    DateType: "",
    Urgent: "",
    Status: "",
    PatientName: "",
    VisitNo: "",
    DiscountApprovalUser: [],
    Barcodeno: "",
    ChkisUrgent: 0,
    chkTATDelay: 0,
    SearchByDate: "",
    ProEmployee: "",
    LabNo: "",
    ProReportType: "Summary",
    Source: "",
    ReportType: "Summary",
    UHIDNo: "",
    OnlyDue: 0,
    Antibiotic: "",
    cultureTestid: "",
    SampleOriginArea: "",
   // FeedBackType: "PatientPortal",
    CombineReportType: "All",
    PaymentMode: "",
    vendorIds: "",
    LocationIds: "",
    DateFilter: "0",
    GRNStatus: "All",
    AppType: "0",
    itemIds: "",
    Marketer: "",
  });

  const getFilteredDocumentType = () => {
    const cleanPath = location.pathname?.toLowerCase().trim();
    return allowedExcelOnlyPaths.includes(cleanPath)
      ? DocumentType.filter((doc) => doc.label === "Excel")
      : DocumentType;
  };

  const handleSelectChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (name === "Department") {
      setFormData({ ...formData, [name]: Number(value) });
    } else if (name === "Centre") {
      setFormData({ ...formData, [name]: Number(value) });
      getAccessDataRateReport(setRateType, value);
    } else {
      setFormData({
        ...formData,
        [name]: value === "" ? [] : value,
      });
    }
  };


  const handleReactSelectChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "PatientType") {
      setFormData({
        ...formData,
        ["PatientType"]: value?.value?.toString(),
      });
    }
    if (label === "VisitType") {
      setFormData({
        ...formData,
        ["VisitType"]: value?.value?.toString(),
      });
    }
    if (label === "TestId") {
      const selected = Array.isArray(value?.value)
        ? value?.value
        : [value?.value];
      setFormData((prev) => ({
        ...prev,
        TestId: selected,
        ObservationId: [],
      }));
      if (value?.value) {
        getObservationList(value.value);
      }
    }
    if (label === "ObservationId") {
      const selected = Array.isArray(value?.value)
        ? value?.value
        : [value?.value];

      setFormData((prev) => ({
        ...prev,
        ObservationId: selected,
      }));
    }
    if (label === "Department") {
      setFormData((prev) => ({
        ...prev, Department: value?.value,
        TestId: [],
      }))
      if ((FieldShow?.MultipleTest || FieldShow?.Test) && value?.value) {
        getDepartmentWiseTest(value?.value)
      }
    }
  };

  const dateSelect = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };
  const getDepartmentReports = (state) => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        if (!Array.isArray(res.data.message)) {
          state([])
          return
        }
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        state(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };
  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res.data.message;

        let filteredData = FieldShow?.TestId
          ? data.filter(
            (ele) => ele.DataType === "Profile" || ele.DataType === "Test",
          )
          : data;
        let MapTest = filteredData.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });
        setMapTest(MapTest);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getInvestigationList();
  }, []);
  const getObservationList = (id) => {
    axiosInstance
      .post("Investigations/BindLabObservationList", {
        InvestigationID: id,
      })
      .then((res) => {
        let data = res.data.message;
        let Observation = data.map((ele) => {
          return {
            value: ele.labObservationID,
            label: ele.TestName,
          };
        });
        setObservationData(Observation);
      })
      .catch((err) => console.log(err));
  };

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      OnlyDue: prev.OnlyDue === 1 ? 0 : 1,
    }));
  };

  const getDepartmentWiseTest = (id) => {
    axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: String(id),
        TestName: "",
      })
      .then((res) => {
        let data = res.data.message;
        let TestData = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });
        setMapTest(TestData);
      })
      .catch((err) => console.log(err));
  };

  const GetInvestigationTest = (setCultureTest) => {
    axiosInstance
      .get("Investigations/GetInvestigationTest")
      .then((res) => {
        let data = res.data.message;
        console.log(data, "here is tje data")
        let MapTest = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });
        setCultureTest(MapTest);
      })
      .catch((err) => console.log(err));
  }

  const getMarketer = (setMarketerData) => {
    axiosInstance
      .get("SalesFunnel/BindCreatedFor", { params: { bindfor: "Report" } })
      .then((res) => {
        let data = res.data.message;
        let MapTest = data.map((ele) => {
          return {
            value: ele.CreatedFor,
            label: ele.CreatedForName,
          };
        });
        setMarketerData(MapTest);
      })
      .catch((err) => console.log(err));
  }

  const summarybyall = [
    { label: "Summary", value: "Summary" },
    { label: "Summary2", value: "Summary2" },
    { label: "Summary with Ref Lab", value: "SummaryWithReferLab" },
    { label: "Detail", value: "Detail" },
  ]

  const summarybyPkl = [
    { label: "Summary", value: "Summary" },
    { label: "Detail", value: "Detail" },
  ]

  // useEffect(() => {
  //   GetInvestigationTest()
  // }, [])

  // const getPatientInfoReport = () => {
  //   setLoadingSearch(true);
  //   axios
  //     .post(
  //       `/reports/v1/commonReports/${id}`,
  //       {
  //         ...formData,
  //         ToDate: moment(formData?.ToDate).format("DD-MMM-YYYY"),
  //         FromDate: moment(formData?.FromDate).format("DD-MMM-YYYY"),
  //         FromTime: Time(formData.FromTime),
  //         ToTime: Time(formData.ToTime),
  //         DocumentType: Number(formData?.DocumentType),
  //         ReportType: reportType?.toString(),
  //         ledgertransactionid: "",
  //         Centre:
  //           formData?.Centre?.length > 0
  //             ? formData?.Centre
  //             : commonDataState(CentreData),
  //         Test:
  //           formData?.Test?.length > 0
  //             ? formData?.Test
  //             : commonDataState(mapTest),
  //         User:
  //           formData?.User?.length > 0
  //             ? formData?.User
  //             : commonDataState(EmployeeName),
  //         RateType:
  //           formData?.RateType?.length > 0
  //             ? formData?.RateType
  //             : commonDataState(rateType),
  //         Department:
  //           formData?.Department?.length > 0
  //             ? Array.isArray(formData?.Department)
  //               ? formData?.Department
  //               : Array(formData?.Department)
  //             : commonDataState(Department),
  //         TestId:
  //           formData?.TestId?.length > 0
  //             ? formData?.TestId
  //             : commonDataState(mapTest),
  //         ObservationId:
  //           formData?.ObservationId?.length > 0
  //             ? formData?.ObservationId
  //             : commonDataState(ObservationData),
  //         InvestigationId:
  //           formData?.InvestigationId?.length > 0
  //             ? formData?.InvestigationId
  //             : commonDataState(mapTest),
  //         Doctor:
  //           formData?.Doctor?.length > 0
  //             ? formData.Doctor
  //             : [...commonDataState(DoctorName), 1],
  //         DiscountApprovalUser:
  //           formData?.DiscountApprovalUser?.length > 0
  //             ? formData?.DiscountApprovalUser
  //             : commonDataState(EmployeeName),
  //       },
  //       formData?.DocumentType == 1 && { method: "GET", responseType: "blob" }
  //     )
  //     .then((res) => {
  //       setLoadingSearch(false);

  //       if (formData?.DocumentType == 1) {
  //         console.log(res);
  //         const url = window.URL.createObjectURL(new Blob([res.data]));
  //         const link = document.createElement("a");
  //         link.href = url;
  //         link.setAttribute("download", `${id}.xlsx`);
  //         document.body.appendChild(link);
  //         link.click();
  //       }
  //       if (formData?.DocumentType == 2) {
  //         window.open(res?.data?.url, "_blank");
  //       }
  //       if (formData?.DocumentType == 3) {
  //         setHtmlData(res?.data?.message);
  //       }
  //     })
  //     .catch((err) => {
  //       setLoadingSearch(false);
  //       toast.error(
  //         err?.response?.data?.message
  //           ? err?.response?.data?.message
  //           : err?.data?.message
  //       );
  //     });
  // };

  const getPatientInfoReport = () => {
    setLoadingSearch(true);
    axios.post(
      `/reports/v1/commonReports/${id}`,
      {
        ...formData,
        PatientID: formData?.UHIDNo,
        ChkisUrgent: formData?.ChkisUrgent?.toString(),
        chkTATDelay: formData?.chkTATDelay?.toString(),
        ToDate: moment(formData?.ToDate).format("DD-MMM-YYYY"),
        FromDate: moment(formData?.FromDate).format("DD-MMM-YYYY"),
        FromTime: formData.FromTime,
        ToTime: formData.ToTime,
        DocumentType: Number(formData?.DocumentType),
        ReportType: String(formData.ReportType || ""),
        ledgertransactionid: "",
        // Centre: formData?.Centre ? [Number(formData?.Centre)] : [],
        Centre: formData?.Centre?.length > 0 ? formData?.Centre : [],
        // Test: formData?.Test ? [Number(formData?.Test)] : [],
        Test: formData?.Test?.length > 0 ? formData?.Test : [],
        User: formData?.User?.length > 0 ? formData?.User : [],
        // RateType: String(formData?.RateType)?.length > 0 ? [formData?.RateType] : [],
        RateType: formData?.RateType?.length > 0 ? formData.RateType : [],
        // Department: formData?.Department?.length > 0 ? formData?.Department : [],
        Department: formData?.Department,
        TestId: formData?.TestId?.length > 0 ? formData?.TestId : [],
        ObservationId: formData?.ObservationId ? [Number(formData?.ObservationId)] : [],
        InvestigationId: formData?.InvestigationId ? [Number(formData?.InvestigationId)] : [],
        // Doctor: formData?.Doctor ? [Number(formData?.Doctor)] : [],
        Doctor: formData?.Doctor?.length > 0 ? formData?.Doctor : [],
        DiscountApprovalUser: formData?.DiscountApprovalUser ? [Number(formData?.DiscountApprovalUser)] : [],
        Antibiotic: formData?.Antibiotic,
        cultureTestid: formData?.cultureTestid,
        SampleOriginArea: formData?.SampleOriginArea,
        //FeedBackType: formData?.FeedBackType,
        CombineReportType: formData?.CombineReportType,
        PaymentMode: formData?.PaymentMode,
        LocationIds: formData?.LocationIds?.length > 0 ? formData.LocationIds : [],
        AppType: formData?.AppType,
        DateFilter: formData?.DateFilter,
        GRNStatus: formData?.GRNStatus,
        vendorIds: formData?.vendorIds?.length > 0 ? formData.vendorIds : [],
        itemIds: formData?.itemIds?.length > 0 ? formData.itemIds : [],
        Marketer: String(formData?.Marketer || ""),
      },
      (formData?.DocumentType == 1 || formData?.DocumentType == 2) && {
        responseType: "blob",
      },
    )
      .then(async (res) => {
        setLoadingSearch(false);

        // if (formData?.DocumentType == 1) {
        //   const contentType = res.headers?.["content-type"] || "";
        //   if (contentType.includes("application/json")) {
        //     const text = await res.data.text();
        //     const json = JSON.parse(text);
        //     toast.warning(json?.message || "No records found.");
        //     return;
        //   }
        //   if (!res.data || res.data.size === 0) {
        //     toast.warning("No data available to export.");
        //     return;
        //   }
        //   downloadExcelBlob(res.data, id);
        //   toast.success("Excel File Downloaded");
        // }
        if (formData?.DocumentType == 1) {
          // if(res?.data?.success) {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${id}.xlsx`);
          document.body.appendChild(link);
          link.click();
          // } else {
          //   toast.error("No Excel Data Found");
          // }
        }
        if (formData?.DocumentType == 2) {
          // window.open(res?.data?.url, "_blank");
          const url = window.URL.createObjectURL(
            new Blob([res.data], { type: "application/pdf" }),
          );
          window.open(url, "_blank");
        }
        if (formData?.DocumentType == 3) {
          setHtmlData(res?.data?.message);
        }
      })
      .catch(async (err) => {
        setLoadingSearch(false);
        try {
          // If backend returned blob with JSON error
          if (err?.response?.data instanceof Blob) {
            const text = await err.response.data.text(); // or use blobToText
            const json = JSON.parse(text);
            toast.error(json?.message || "No data available.");
          } else {
            // Normal JSON error
            toast.error(
              err?.response?.data?.message ||
              err?.message ||
              "No data available.",
            );
          }
        } catch (e) {
          toast.error("Something went wrong while fetching the report");
        }
      });
  };
  const getPatientInfoField = (id) => {
    setLoad(true);
    axiosReport
      .get(`commonReports/getFields/${id}`)
      .then((res) => {
        setLoad(false);
        bindApiResponseAccording(res?.data?.message);
        setFieldShow({
          ...res?.data?.message,
          AsOnNowOutstanding: id == "OutStandingReport" ? true : false,
          DateWiseOutstanding: id == "OutStandingReport" ? true : false,
        });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  // const getBindCentreType = (state) => {
  //   axiosInstance
  //     .get("InventryManageApprovalStore/BindCentreType")
  //     .then((res) => {
  //       let data = res.data.message;
  //       let responce = data.map((ele) => {
  //         return {
  //           value: ele.id,
  //           label: ele.type,
  //         };
  //       });
  //       setCenterType(responce);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       setCenterType([]);
  //       toast.error(
  //         err?.response?.data?.message
  //           ? err?.response?.data?.message
  //           : "Something Wents Wrong!",
  //       );
  //     });
  // };

  const getGrnLocation = (setGetLocations) => {
    axiosInstance
      .get("DirectGRN/GetLocationWithpanel")
      .then((res) => {
        let data = res.data.message;
        let responce = data.map((ele) => {
          return {
            value: ele.LocationID,
            label: ele.Location,
          };
        });
        setGetLocations(responce);
      })
      .catch((err) => console.log(err));
  };

  const getSupplierApi = async (setSupplier) => {
    await axiosInstance
      .get("VendorQuotation/bindsupplier")
      .then((res) => {
        const response = res?.data?.message;
        const supplierData = response.map((ele) => ({
          value: Number(ele.id),
          label: ele.name,
        }));
        setSupplier(supplierData);
      })

      .catch((err) => console.log(err));
  };

  const getSearchItem = (setItems) => {
    axiosInstance.post("InventryManageApprovalStore/AllStoreItem")
      .then((res) => {
        const data = res.data.data;
        const itemData = data.map((ele) => ({
          value: ele.itemID,
          label: ele.itemName,
        }));
        setItems(itemData);
      })
      .catch((err) => console.log(err));
  }
  console.log({ Items })
  const getClientWiseBussinessReport = async () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write("<html><head><title>Loading Report...</title></head><body><div style='text-align:center; margin-top: 50px;'>Please wait while the report is being generated...</div></body></html>");
    }

    try {
      const payload = {
        ...formData,
        ToDate: moment(formData?.ToDate).format("DD-MMM-YYYY"),
        FromDate: moment(formData?.FromDate).format("DD-MMM-YYYY"),
        FromTime: formData.FromTime,
        ToTime: formData.ToTime,
        DocumentType: Number(formData?.DocumentType),
        ReportType: String(formData.ReportType || ""),
        ledgertransactionid: "",
        Centre: !!Number(formData?.Centre) ? [Number(formData?.Centre)] : [],
        Test: !!Number(formData?.Test) ? [Number(formData?.Test)] : [],
        User: formData?.User?.length > 0 ? formData?.User : [],
        RateType: (Array.isArray(formData?.MultipleRateType) && formData.MultipleRateType.length > 0
          ? formData.MultipleRateType
          : (formData?.RateType ? [formData.RateType] : [])).flat().filter(item => item !== ""),
        Department: (Array.isArray(formData?.MultipleDepartment) && formData.MultipleDepartment.length > 0
          ? formData.MultipleDepartment
          : (formData?.Department ? [formData.Department] : [])).flat().filter(item => item !== ""),
        TestId: formData?.TestId?.length > 0 ? formData?.TestId : [],
        ObservationId: !!Number(formData?.ObservationId) ? [Number(formData?.ObservationId)] : [],
        InvestigationId: !!Number(formData?.InvestigationId) ? [Number(formData?.InvestigationId)] : [],
        Doctor: !!Number(formData?.Doctor) ? [Number(formData?.Doctor)] : [],
        DiscountApprovalUser: !!Number(formData?.DiscountApprovalUser) ? [Number(formData?.DiscountApprovalUser)] : [],
        Antibiotic: formData?.Antibiotic || "",
        cultureTestid: formData?.cultureTestid || "",
        SampleOriginArea: formData?.SampleOriginArea || "",
        // FeedBackType: formData?.FeedBackType || "",
        LocationIds: formData?.LocationIds ? [Number(formData?.LocationIds)] : [],
        AppType: formData?.AppType || "",
        DateFilter: formData?.DateFilter || "0",
        GRNStatus: formData?.GRNStatus || "All",
        vendorIds: (formData?.vendorIds) ? [Number(formData?.vendorIds)] : [],
        itemIds: formData?.itemIds ? [Number(formData?.itemIds)] : [],
        Marketer: String(formData?.MarketerId || ""),
      };

      const res = await axiosReport.post(
        "commonReports/ClientWiseBusinessReportHTMLPDF",
        payload,
        {
          responseType: "text",
        }
      );

      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(res.data);
        newWindow.document.close();
      }
    } catch (error) {
      if (newWindow) {
        newWindow.close();
      }
      console.error("Error opening Client Wise Business Report", error);
      toast.error("Error opening Client Wise Business Report");
    }
  };

  const bindApiResponseAccording = (data) => {
    const {
      Centre,
      User,
      RateType,
      Department,
      DiscountApproval,
      DiscountApprovalUser,
      ReportType,
      Test,
      PatientType,
      Doctor,
      DateType,
      Urgent,
      Status,
      MultipleCentre,
      MultipleRateType,
      MultipleDepartment,
      MultipleUser,
      MultipleReportType,
      MultipleDoctor,
      MultipleStatus,
      MultiplePatientType,
      MultipleDateType,
      MultipleTest,
      Barcodeno,
      ChkisUrgent,
      chkTATDelay,
      SearchByDate,
      AsOnNowOutstanding,
      DateWiseOutstanding,
      ProEmployee,
      Source,
      VisitType,
      Observation,
      ObservationId,
      CultureTestId,
      PaymentMode,
      locationid,
      SupplierID,
      ItemID,
      Marketer,
    } = data;
    if (Centre || MultipleCentre) {
      getAccessCentresReports(setCentreData);
    }
    if (Department || MultipleDepartment) {
      getDepartmentReports(setDepartment);
    }
    if (User || MultipleUser || DiscountApprovalUser) {
      BindEmployeeReports(setEmployeeName);
    }
    if (Doctor || MultipleDoctor) {
      BindApprovalDoctorReports(setDoctorAdmin);
    }
    if (RateType || MultipleRateType) {
      getAccessDataRateReport(setRateType, formData?.Centre.toString()).then(
        (res) => {
          console.log(res);
        },
      );
    }
    if (ProEmployee) {
      BindProEmployee(setProEmployee);
    }
    if (Source) {
      getPaymentModes("Source", setPatientSource);
    }
    if (VisitType) {
      getVisitType(setVisitType);
    }
    if (PatientType) {
      getVisitType(setVisitType);
    }
    if (CultureTestId) {
      GetInvestigationTest(setCultureTest);
    }
    if (PaymentMode) {
      GetGlobalData(setPaymentMode, "PaymentMode")
    }
    if (locationid) {
      getGrnLocation(setGetLocations)
    }
    if (SupplierID) {
      getSupplierApi(setSupplier)
    }
    if (ItemID) {
      getSearchItem(setItems)
    }
     if (Marketer) {
      getMarketer(setMarketerData)
    }

  };

  useEffect(() => {
    if (CentreData?.length == 1) {
      setFormData(prev => ({ ...prev, Centre: [CentreData?.[0]?.value] }))
    }
    // if (rateType?.length == 1) {
    //   setFormData(prev => ({ ...prev, RateType: rateType?.[0]?.value }))
    // }
    if (rateType?.length == 1) {
      setFormData(prev => ({ ...prev, RateType: [rateType?.[0]?.value] }))
    }
  }, [CentreData, rateType])

  const handleSelectMultiChange = (name, value) => {
    // const val = select?.map((ele) => ele?.value);
    setFormData({ ...formData, [name]: value });
    if (name === "Department") {
      setFormData({ ...formData, [name]: value });
      if (value) {
        getDepartmentWiseTest(value);
      }
    }
    // if (name === "Centre") getAccessDataRate(setRateType, value.toString());
    if (name === "Centre") {
      setFormData((prev) => ({
        ...prev,
        Centre: value,
        MultipleRateType: [],

      }));
      getAccessDataRate(setRateType, value.toString());
    }
  };

  const handleSelectchangeCheck = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setFormData({
      Centre: [],
      FromDate: new Date(),
      FromTime: "00:00:00",
      ToTime: "23:59:59",
      ToDate: new Date(),
      DocumentType: allowedExcelOnlyPaths.includes(
        location.pathname?.toLowerCase().trim(),
      )
        ? 1
        : 2,
      User: [],
      RateType: [],
      Department: [],
      VisitType: "",
      ReportType: "Summary",
      PatientType: "",
      Doctor: [],
      DateType: "",
      Urgent: "",
      Status: "",
      PatientName: "",
      VisitNo: "",
      Test: [],
      InvestigationId: [],
      TestId: [],
      FromRange: "",
      ToRange: "",
      ObservationId: [],
      DiscountApprovalUser: [],
      Barcodeno: "",
      ChkisUrgent: 0,
      chkTATDelay: 0,
      SearchByDate: "",
      ProEmployee: "",
      ProReportType: "Summary",
      LabNo: "",
      Source: "",
      UHIDNo: "",
      //FeedBackType: "PatientPortal",
      CombineReportType: "All",
      PaymentMode: "",
      vendorIds: "",
      LocationIds: "",
      DateFilter: "0",
      GRNStatus: "All",
      AppType: "0",
      itemIds: "",

    });
    getPatientInfoField(id);
  }, [location?.pathname, id]);

  let pathNameTitle = (props?.id || location.pathname?.split("/")?.slice(-1)[0])
    ?.replace(/([a-z])([A-Z])/g, "$1 $2");

  const excludedPaths = [
    "/getReport/AmendmentReport",
    "/getReport/tatantibioticreport",
    "/getReport/PatientFeedbackReport",
    "/getReport/CollectionReportCombine",
    "/getReport/DiagnosticsTestReport",

  ];

  const shouldShowSingleRateType = !excludedPaths.includes(location.pathname) && FieldShow?.SingleRateType;

  return (
    <>
      {load ? (
        <Loading />
      ) : (
        <>
          <Accordion
            name={`${t("Get Reports For")}  ${t(pathNameTitle)}`}
            defaultValue={true}
            isBreadcrumb={true}
            seconTitle={secondTitle}
          >
            <div className="row px-2 mt-2 p-1">
              {FieldShow?.Centre && (
                <div className="col-sm-2">
                  <SelectBox
                    className="required-fields"
                    lable="Select Centre"
                    options={[
                      { label: "All Centre", value: [] },
                      ...CentreData,
                    ]}
                    selectedValue={formData?.Centre}
                    name="Centre"
                    onChange={handleSelectChange}
                  />
                </div>
              )}
              {console.log(CentreData)}
              {FieldShow?.MultipleCentre && (
                <div className="col-sm-2">
                  <MultiSelectComp
                    label="All Centre"
                    options={CentreData}
                    value={formData?.Centre}
                    name="Centre"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Centre")}
                  />
                </div>
              )}
              {/* remove for /getReport/AmendmentReport this link */}
              {shouldShowSingleRateType && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={[{ label: "All Rate Type", value: "" }, ...rateType]}
                    placeholderName="All Rate Type"
                    value={formData?.RateType}
                    name="RateType"
                    label="Select RateType"
                    onChange={handleReactSelectChange}
                    className="required-fields"
                    removeIsClearable={true}
                  />
                </div>)}
              {console.log(formData?.MultipleRateType, "formData?.MultipleRateType")}
              {FieldShow?.MultipleRateType && (
                <div className="col-sm-2">
                  <MultiSelectComp
                    label="All RateType"
                    options={rateType}
                    value={formData?.MultipleRateType}
                    name="MultipleRateType"
                    onChange={handleSelectMultiChange}
                    lable={t("Select RateType")}
                  />
                </div>)}

              {/* {FieldShow?.MultipleRateType && (
                <div className="col-sm-2">
                  <SelectBoxWithCheckbox
                    label="All RateType"
                    options={rateType}
                    value={formData?.RateType}
                    name="RateType"
                    onChange={handleSelectMultiChange}
                    lable={t("Select RateType")}
                  />
                </div>
              )} */}

              {FieldShow?.Department && (
                <div className="col-sm-2 ">
                  <ReactSelect
                    className="required-fields"
                    dynamicOptions={[
                      { label: "All Department", value: [] },
                      ...Department,
                    ]}
                    value={formData.Department}
                    name="Department"
                    onChange={handleSearchSelectChange}
                    label={t("Select Department")}
                    removeIsClearable={true}
                  />
                </div>
              )}

              {FieldShow?.MultipleDepartment && (
                <div className="col-sm-2">
                  <MultiSelectComp
                    label="All Department"
                    options={[...Department]}
                    value={formData?.Department}
                    name="Department"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Department")}
                  />
                </div>
              )}

              {FieldShow?.Source && (
                <div className="col-sm-2 ">
                  <ReactSelect
                    className="required-fields"
                    options={[
                      { label: "Select Source", value: "" },
                      ...PatientSource,
                    ]}
                    value={formData.Source}
                    name="Source"
                    onChange={handleSelectChange}
                    label={t("Select Source")}
                    removeIsClearable={true}
                  />
                </div>
              )}


              {FieldShow?.VisitType && (
                <div className="col-sm-2 ">
                  <ReactSelect
                    name="VisitType"
                    id="VisitType"
                    removeIsClearable={true}
                    dynamicOptions={VisitType}
                    placeholderName="VisitType"
                    value={formData?.VisitType}
                    onChange={handleSearchSelectChange}
                  />
                </div>
              )}
              {FieldShow?.PatientType && (
                <div className="col-sm-2 ">
                  <ReactSelect
                    name="PatientType"
                    id="PatientType"
                    removeIsClearable={true}
                    dynamicOptions={VisitType}
                    placeholderName="PatientType"
                    value={formData?.PatientType}
                    onChange={handleSearchSelectChange}
                  />
                </div>
              )}
              {FieldShow?.TestId && (
                <div className="col-sm-3">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "All Test", value: [] },
                      ...mapTest,
                    ]}
                    removeIsClearable={true}
                    value={formData?.TestId}
                    name="TestId"
                    placeholderName="Test"
                    onChange={handleSearchSelectChange}
                  />
                </div>
              )}
              {FieldShow?.ObservationId && (
                <div className="col-sm-3">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "Select Observations", value: [] },
                      ...ObservationData,
                    ]}
                    removeIsClearable={true}
                    value={formData?.ObservationId}
                    name="ObservationId"
                    placeholderName="Observation"
                    onChange={handleSearchSelectChange}
                  />
                </div>
              )}
              {FieldShow?.FromRange && (
                <div className="col-sm-2">
                  <Input
                    lable="FromRange"
                    id="FromRange"
                    name="FromRange"
                    onChange={handleSelectChange}
                    value={formData?.FromRange}
                    placeholder=" "
                  />
                </div>
              )}
              {FieldShow?.ToRange && (
                <div className="col-sm-2">
                  <Input
                    lable="ToRange"
                    id="ToRange"
                    name="ToRange"
                    onChange={handleSelectChange}
                    value={formData?.ToRange}
                    placeholder=" "
                  />
                </div>
              )}

              {FieldShow?.SearchByDate && (
                <div className="col-sm-2 ">
                  <ReactSelect
                    className="required-fields"
                    dynamicOptions={SearchByDate}
                    value={formData.SearchByDate}
                    name="SearchByDate"
                    onChange={handleReactSelectChange}
                    label={t("Search By Date")}
                    removeIsClearable={true}
                    placeholderName={"SearchByDate"}
                  />
                </div>
              )}

              {FieldShow?.FromDate && (
                <div className="col-sm-2">
                  <DatePicker
                    className="custom-calendar"
                    name="FromDate"
                    value={formData?.FromDate}
                    onChange={dateSelect}
                    onChangeTime={handleTime}
                    secondName={FieldShow?.FromTime && "FromTime"}
                    maxDate={new Date()}
                    lable={t("FromDate")}
                  />
                </div>
              )}
              {FieldShow?.FromTime && (
                <div className="col-sm-1 mt-1">
                  <CustomTimePicker
                    value={formData?.FromTime}
                    onChange={handleTime}
                    id="FromTime"
                    lable="FromTime"
                    name="FromTime"
                    placeholder="FromTime"
                  />
                </div>
              )}
              {FieldShow?.ToDate && (
                <div className="col-sm-2 ">
                  <DatePicker
                    className="custom-calendar"
                    name="ToDate"
                    value={formData?.ToDate}
                    onChange={dateSelect}
                    onChangeTime={handleTime}
                    secondName={FieldShow?.ToTime && "ToTime"}
                    maxDate={new Date()}
                    minDate={new Date(formData.FromDate)}
                    lable={t("ToDate")}
                  />
                </div>
              )}
              {FieldShow?.ToTime && (
                <div className="col-sm-1 ">
                  <CustomTimePicker
                    value={formData?.ToTime}
                    onChange={handleTime}
                    id="ToTime"
                    lable="ToTime"
                    name="ToTime"
                    placeholder="ToTime"
                  />
                </div>
              )}

              {FieldShow?.DataType && (
                <div className="col-sm-2 ">
                  <ReactSelect
                    className="required-fields"
                    dynamicOptions={[
                      { label: "DateType", value: "" },
                      ...DateTypeSearch,
                    ]}
                    formdata={formData?.DateType}
                    name="DateType"
                    onChange={handleReactSelectChange}
                    label={t("select DateType")}
                    removeIsClearable={true}
                  />
                </div>
              )}

              {FieldShow?.User && (
                <div className="col-sm-2 ">
                  <ReactSelect
                    className="required-fields"
                    options={[
                      { label: "All Employee", value: [] },
                      ...EmployeeName,
                    ]}
                    formdata={formData?.User}
                    name="User"
                    onChange={handleReactSelectChange}
                    label={t("Select Employee")}
                  />
                </div>
              )}

              {FieldShow?.PatientName && (
                <div className="col-sm-2 ">
                  <Input
                    lable="PatientName"
                    id="PatientName"
                    name="PatientName"
                    onChange={handleSelectChange}
                    value={formData?.PatientName}
                    placeholder=" "
                  />
                </div>
              )}
              {FieldShow?.UHIDNo && (
                <div className="col-sm-2 ">
                  <Input
                    lable="UHIDNo"
                    id="UHIDNo"
                    name="UHIDNo"
                    onChange={handleSelectChange}
                    value={formData?.UHIDNo}
                    placeholder=" "
                  />
                </div>
              )}
              {FieldShow?.VisitNo && (
                <div className="col-sm-2 ">
                  <Input
                    lable="VisitNo"
                    id="VisitNo"
                    placeholder=" "
                    name="VisitNo"
                    onChange={handleSelectChange}
                    value={formData?.VisitNo}
                    label={t("Visit No")}
                  />
                </div>
              )}
              {FieldShow?.MultipleUser && (
                <div className="col-sm-2 ">
                  <MultiSelectComp
                    label="All Employee"
                    options={EmployeeName}
                    value={formData?.User}
                    name="User"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Employee")}
                  />
                </div>
              )}
              {/* GRN Report */}
              {/* <div className="col-sm-2 ">
                    <MultiSelectComp
                      label="Center Type"
                      options={CenterType}
                      value={formData?.CenterType}
                      name="CenterType"
                      onChange={handleSelectMultiChange}
                      lable={t("Select Center Type")}
                    />
                  </div> */}
              {FieldShow?.locationid && (
                <div className="col-sm-2 ">
                  <MultiSelectComp
                    label="Location"
                    options={getLocations}
                    value={formData?.LocationIds}
                    name="LocationIds"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Location")}
                  />
                </div>
              )}
              {FieldShow?.SupplierID && (
                <div className="col-sm-2 ">
                  <MultiSelectComp
                    label="Supplier"
                    options={Supplier}
                    value={formData?.vendorIds}
                    name="vendorIds"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Supplier")}
                  />
                </div>
              )}
              {FieldShow?.ItemID && (
                <div className="col-sm-2 ">
                  <MultiSelectComp
                    label="Item"
                    options={Items}
                    value={formData?.itemIds}
                    name="itemIds"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Item")}
                  />
                </div>
              )}
              {FieldShow?.DateFilter && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={FilterDate}
                    name="DateFilter"
                    lable={t("")}
                    id="DateFilter"
                    removeIsClearable={true}
                    placeholderName={t("Date Filter")}
                    value={formData?.DateFilter}
                    onChange={handleReactSelectChange}
                    className="required-fields"
                  />
                </div>
              )}
              {FieldShow?.GRNStatus && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={StatusOptions}
                    name="GRNStatus"
                    lable={t("")}
                    id="GRNStatus"
                    removeIsClearable={true}
                    placeholderName={t("GRN Status")}
                    value={formData?.GRNStatus}
                    onChange={handleReactSelectChange}
                    className="required-fields"
                  />
                </div>
              )}
              {FieldShow?.apptype && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={AppTypeOption}
                    name="AppType"
                    lable={t("")}
                    id="AppType"
                    removeIsClearable={true}
                    placeholderName={t("GRN Type")}
                    value={formData?.AppType}
                    onChange={handleReactSelectChange}
                    className="required-fields"
                  />
                </div>
              )}

              {/* Antibiotic */}
              {location.pathname === "/getReport/tatantibioticreport" && (
                <>
                  <div className="col-sm-2">
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select", value: "" },
                        ...AntibioticSensitivity,
                      ]}
                      value={formData?.Antibiotic}
                      removeIsClearable={true}
                      name="Antibiotic"
                      id="Antibiotic"
                      placeholderName="Antibiotic Sensitivity"
                      onChange={handleReactSelectChange}
                      label="Antibiotic Sensitivity"
                    />
                  </div>

                  <div className="col-sm-2">
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select", value: "" },
                        ...SampleOriginArea,
                      ]}
                      value={formData?.SampleOriginArea}
                      removeIsClearable={true}
                      name="SampleOriginArea"
                      id="SampleOriginArea"
                      onChange={handleReactSelectChange}
                      placeholderName="Sample Origin Area"
                      label="Sample Origin Area"
                    />
                  </div>

                  <div className="col-sm-2">
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select", value: "" },
                        ...cultureTest,
                      ]}
                      value={formData?.cultureTestid}
                      removeIsClearable={true}
                      name="cultureTestid"
                      id="cultureTestid"
                      placeholderName="Culture Test Name"
                      onChange={handleReactSelectChange}
                      label="Culture Test Name:"
                    />
                  </div>
                </>
              )}

              {FieldShow?.Doctor && (
                <div className="col-sm-2 ">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "All Doctor", value: [] },
                      ...DoctorName,
                    ]}
                    formdata={formData?.Doctor}
                    name="Doctor"
                    onChange={handleReactSelectChange}
                    label={t("Select Doctor")}
                    removeIsClearable={true}
                  />
                </div>
              )}

              {FieldShow?.MultipleDoctor && (
                <div className="col-sm-2 ">
                  <MultiSelectComp
                    label={t("All Doctor")}
                    options={[{ label: "Self", value: 1 }, ...DoctorName]}
                    value={formData?.Doctor}
                    name="Doctor"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Doctor")}
                  />
                </div>
              )}

              {FieldShow?.MultipleTest && (
                <div className="col-sm-2">
                  <MultiSelectComp
                    label={t("All Test")}
                    options={mapTest}
                    value={formData?.Test}
                    name="Test"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Test")}
                  />
                </div>
              )}
              {FieldShow?.Test && (
                <div className="col-sm-2">
                  <MultiSelectComp
                    label={t("All Test")}
                    options={mapTest}
                    value={formData?.InvestigationId}
                    name="InvestigationId"
                    onChange={handleSelectMultiChange}
                    lable={t("Select Test")}
                  />
                </div>
              )}
              {FieldShow?.Status && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={workSheetSampleStatus}
                    value={formData.Status}
                    name="Status"
                    placeholderName="Select Status"
                    onChange={handleReactSelectChange}
                    label={t("Status")}

                  />
                </div>
              )}
              {/* type for patient feeback form  */}
              {/* {FieldShow?.FeedBackType && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "PatientPortal", value: "PatientPortal" },
                      { label: "Sample Collection", value: "Sample Collection" },
                    ]}
                    value={formData.FeedBackType}
                    name="FeedBackType"
                    onChange={handleReactSelectChange}
                    label={t("Type")}

                  />
                </div>
              )} */}
              {/* combine report type */}
              {FieldShow?.CombineReportType && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "All", value: "All" },
                      { label: "ClientWise", value: "ClientWise" },
                      { label: "PaymentWise", value: "PaymentWise" },
                      { label: "UserWise", value: "UserWise" },
                    ]}
                    value={formData.CombineReportType}
                    placeholderName={"CombineReportType"}
                    name="CombineReportType"
                    onChange={handleReactSelectChange}
                    label={t("CombineReportType")}
                    removeIsClearable={true}

                  />
                </div>
              )}
              {/* payment mode */}
              {FieldShow?.PaymentMode && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={PaymentMode}
                    value={formData.PaymentMode}
                    placeholderName={"PaymentMode"}
                    name="PaymentMode"
                    onChange={handleReactSelectChange}
                    label={t("PaymentMode")}
                    removeIsClearable={true}

                  />
                </div>
              )}

              {FieldShow?.Marketer && (
                <div className="col-sm-2">
                  <ReactSelect
                    dynamicOptions={MarketerData}
                    value={formData.Marketer}
                    placeholderName={"Marketer"}
                    name="Marketer"
                    onChange={handleReactSelectChange}
                    label={t("Marketer")}
                    removeIsClearable={true}

                  />
                </div>
              )}

              {FieldShow?.DiscountApprovalUser && (
                <div className="col-sm-2">
                  <MultiSelectComp
                    label={t("All DiscountApprovalUser")}
                    options={[...EmployeeName]}
                    value={formData.DiscountApprovalUser}
                    name="DiscountApprovalUser"
                    onChange={handleSelectMultiChange}
                    lable={t("DiscountApprovalUser")}
                  />
                </div>
              )}

              {FieldShow?.Barcodeno && (
                <div className="col-sm-2 ">
                  <Input
                    className="form-control required-fields"
                    name="Barcodeno"
                    onChange={handleSelectChange}
                    value={formData?.Barcodeno}
                    lable={t("Barcode No")}
                    placeholder=" "
                  />
                </div>
              )}
              {FieldShow?.LabNo && (
                <div className="col-sm-2 ">
                  <Input
                    className="form-control required-fields"
                    name="LabNo"
                    onChange={handleSelectChange}
                    value={formData?.LabNo}
                    lable={t("Lab No")}
                    placeholder=" "
                  />
                </div>
              )}
              {FieldShow?.ProEmployee && (
                <div className="col-sm-2">
                  <MultiSelectComp
                    label={t("All ProEmployee")}
                    options={proEmployee}
                    value={formData?.ProEmployee}
                    name="ProEmployee"
                    onChange={handleSelectMultiChange}
                    lable={t("Select ProEmployee")}
                  />
                </div>
              )}
              {(location.pathname !== "/getReport/CollectionReportCombine"
                && location.pathname !== "/getReport/MachineReport"
                //  && location.pathname !== "/getReport/HIstoCytoDelayedReport"
              ) &&
                <div className="col-sm-2 ">
                  <SelectBox
                    className="required-fields"
                    options={getFilteredDocumentType()}
                    selectedValue={formData.DocumentType}
                    name="DocumentType"
                    onChange={handleSelectChange}
                    lable={t("Select DocumentType")}
                  />
                </div>}

              {(formData?.DocumentType == 2 &&
                location.pathname !== "/getReport/MachineReport" &&
                location.pathname !== "/getReport/CollectionReportCombine") &&
                location.pathname !== "/getReport/grnreport" &&
                location.pathname !== "/getReport/department" &&
                location.pathname !== "/getReport/DesignationReport" &&
                location.pathname !== "/getReport/DoctorReport" &&
                location.pathname !== "/getReport/department" &&
                location.pathname !== "/getReport/EmailReport" &&
                location.pathname !== "/getReport/GlobalTypeReport" &&
                location.pathname !== "/getReport/IDReport" &&
                location.pathname !== "/getReport/FieldBoyReport" &&
                location.pathname !== "/getReport/RateTypeWiseItemLockReport" &&
                //location.pathname !== "/getReport/DoctorAccountReport"&&
                location.pathname !== "/getReport/OutsourceLabReport" &&
                location.pathname !== "/getReport/HIstoCytoDelayedReport" &&
                location.pathname !== "/getReport/SampleIssueReport" &&
                (
                  <div className="col-sm-2 ">
                    <SelectBox
                      className="required-fields"
                      options={[
                        { label: "Centre Wise", value: 1 },
                        { label: "User Wise", value: 2 },
                      ]}
                      selectedValue={pdfType}
                      name="DocumentType"
                      onChange={(e) => setPdfType(e.target.value)}
                      lable={t("Select DocumentType")}
                    />
                  </div>
                )}
              {/* remove for AmendmentReport and anitibiotic this link */}
              {(location.pathname !== "/getReport/AmendmentReport" &&
                location.pathname !== "/getReport/InvoiceTrackingReport" &&
                location.pathname !== "/getReport/tatantibioticreport" &&
                location.pathname !== "/getReport/PatientFeedbackReport" &&
                location.pathname !== "/getReport/CollectionReportCombine" &&
                location.pathname !== "/getReport/DiagnosticsTestReport" &&
                location.pathname !== "/getReport/PatientDetailReport" &&
                location.pathname !== "/getReport/MachineReport" &&
                location.pathname !== "/getReport/department" &&
                location.pathname !== "/getReport/DesignationReport" &&
                location.pathname !== "/getReport/DoctorReport" &&
                location.pathname !== "/getReport/department" &&
                location.pathname !== "/getReport/EmailReport" &&
                location.pathname !== "/getReport/GlobalTypeReport" &&
                location.pathname !== "/getReport/IDReport" &&
                location.pathname !== "/getReport/FieldBoyReport" &&
                location.pathname !== "/getReport/RateTypeWiseItemLockReport" &&
                location.pathname !== "/getReport/PatientBiodataReport" &&
                location.pathname !== "/getReport/OutsourceLabReport" &&
                location.pathname !== "/getReport/HIstoCytoDelayedReport"&&
                location.pathname !== "/getReport/SampleIssueReport"&&
                location.pathname !== "/getReport/KenyaRegionForecastingReport"
              ) &&
                (
                  <div className="col-sm-2">
                    <ReactSelect
                      dynamicOptions={
                        (localData.CompanyCode === "PKL" || location.pathname === "/getReport/grnreport")
                          ? summarybyPkl
                          : summarybyall
                      }
                      name="ReportType"
                      lable={t("")}
                      id="DateTypeSearch"
                      removeIsClearable={true}
                      placeholderName={t("ReportType")}
                      value={formData?.ReportType}
                      onChange={handleReactSelectChange}
                      className="required-fields"
                    />
                  </div>)}
              {/* <div className="col-sm-2 ">
            <MultiSelectComp
              // options={center}
              name="rateType"
              // placeholder={t("Rate Type")}
              label={t("Rate Type")}
              id="rateType"
              value={formData?.rateType}
              onChange={handleSelectchangeCheck}
            />
          </div> */}

              {FieldShow?.Urgent && (
                <div
                  className="col-sm-2 d-flex"
                  style={{
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  <label>
                    <small>{t("Urgent")}</small>
                  </label>
                  <input
                    type="checkbox"
                    name="Urgent"
                    value={formData?.Urgent}
                    onChange={handleSelectChange}
                  />
                </div>
              )}
              {FieldShow?.ChkisUrgent && (
                <div
                  className="col-sm-1 d-flex"
                  style={{
                    justifyContent: "space-around",
                    alignItems: "center",
                    alignContent: "center",
                  }}
                >
                  <label>
                    <small>{t("Check Is Urgent")}</small>
                  </label>
                  <input
                    type="checkbox"
                    name="ChkisUrgent"
                    value={formData?.ChkisUrgent}
                    onChange={handleSelectChange}
                  />
                </div>
              )}
              {FieldShow?.chkTATDelay && (
                <div
                  className="col-sm-2 d-flex"
                  style={{
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  <label>
                    <small>{t("Check TAT Delay")}</small>
                  </label>
                  <input
                    type="checkbox"
                    name="chkTATDelay"
                    value={formData?.chkTATDelay}
                    onChange={handleSelectChange}
                  />
                </div>
              )}

              {FieldShow?.ProReporttype && (
                <div className="col-sm-3">
                  <label>
                    <small>{t("Report type")}&nbsp;</small>
                  </label>
                  <div
                    className="d-flex"
                    style={{
                      alignItems: "center",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <label>
                      <small>{t("Summary")}&nbsp;</small>
                    </label>
                    <input
                      type="radio"
                      value="Summary"
                      checked={formData.ProReportType === "Summary"}
                      name="ProReportType"
                      onChange={handleSelectChange}
                    />
                    <label>
                      <small>{t("Detail")}&nbsp;</small>
                    </label>
                    <input
                      type="radio"
                      value="Detail"
                      checked={formData.ProReportType === "Detail"}
                      name="ProReportType"
                      onChange={handleSelectChange}
                    />
                    <label>
                      <small>{t("Test Count")}&nbsp;</small>
                    </label>
                    <input
                      type="radio"
                      value="TestCount"
                      checked={formData.ProReportType === "TestCount"}
                      name="ProReportType"
                      onChange={handleSelectChange}
                    />
                  </div>
                </div>
              )}
              {FieldShow?.OnlyDue && (
                <div className="col-sm-auto d-flex align-items-center">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formData.OnlyDue === 1}
                      onChange={handleToggle}
                    />
                    <span className="slider"></span>
                  </label>
                  <strong className="ml-2 mb-2">{t("Due Amount")}</strong>
                </div>
              )}
            </div>
            <div className="row px-2 mb-2">
              {id === "ClientWiseBusinessReport" ? (
                <div className="col-sm-2">
                  {loadingSearch ? (
                    <Loading />
                  ) : Number(formData?.DocumentType) === 1 ? (
                    <CustomButton
                      text={"Get Report"}
                      icon={"excel"}
                      onClick={getPatientInfoReport}
                    />
                  ) : (
                    <CustomButton
                      text={"Get report"}
                      icon={"excel"}
                      onClick={getClientWiseBussinessReport}
                    />
                  )}
                </div>
              ) : (
                <div className="col-sm-2">
                  {loadingSearch ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      text={"Get Report"}
                      icon={"excel"}
                      onClick={getPatientInfoReport}
                    />
                  )}
                </div>
              )}


              <div className="col-sm-2">
                {FieldShow?.AsOnNowOutstanding && (
                  <>
                    <input
                      type="radio"
                      name="AsOnNowOutstanding"
                      value="0"
                      checked={reportType == "0" ? true : false}
                      onChange={handleRadioChange}
                    />
                    <label style={{ marginLeft: "10px" }}>
                      {t("As On Now Outstanding")}
                    </label>
                  </>
                )}
              </div>
              <div className="col-sm-2">
                {FieldShow?.DateWiseOutstanding && (
                  <>
                    <input
                      type="radio"
                      name="DateWiseOutstanding"
                      value="1"
                      onChange={handleRadioChange}
                      checked={reportType == "1" ? true : false}
                    />
                    <label style={{ marginLeft: "10px" }}>
                      {t("Datewise Outstanding")}
                    </label>
                  </>
                )}
              </div>
            </div>
          </Accordion>
          {htmlData?.length > 0 && (
            <Accordion title={t("HTML Data")} defaultValue={true}>
              <Tables>
                <thead>
                  <tr>
                    {Object.keys(htmlData[0])?.map((ele, index) => (
                      <th key={index}>{ele}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {htmlData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.keys(htmlData[0]).map((header, colIndex) => (
                        <td key={colIndex}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </Accordion>
          )}
        </>
      )}
    </>
  );
}

export default GetReport;
