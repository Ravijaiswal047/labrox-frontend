import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { defaultSearchTypes, SearchBy } from "../../utils/Constants";
import { number, shouldIncludeAIIMSID } from "../../utils/helpers";
import { Tooltip } from "primereact/tooltip";
import { Form } from "react-bootstrap";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { IoAddCircle } from "react-icons/io5";
import { FaDownload, FaEye } from "react-icons/fa";
import { CustomButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import OutSourceRateImportModal from "./OutSourceRateImportModal";
import OutSourceTransferModal from "./OutSourceTransferModal";
import DispatchPatientDetailModal from "../utils/DispatchPatientDetailModal";
import PdfPreviewModal from "../utils/PdfPreviewModal";

const OutSourceTestToOtherLab = () => {
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { ShowAllCheckBarcodeOption } = useLocalStorage("userData", "get");
  let isTrueCheckBarcodeOption =
    ShowAllCheckBarcodeOption == 1 && defaultSearchTypes == "BarcodeNo";
  const [checkBarcodeOption, setCheckBarcodeOption] = useState(
    isTrueCheckBarcodeOption,
  );
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);

  const DateBy = [
    { value: "RegDate", label: t("Registration Date") },
    { value: "sampledate", label: t("Sample Collection Date") },
    { value: "receivedate", label: t("Sample Recieve Date") },
  ];

  const colorCodingData = [
    { color: "#FFB6C1", id: "7", labelKey: "Pending" },
    { color: "#8ef58e66", id: "8", labelKey: "Outsource" },
  ];

   const [previewConfig, setPreviewConfig] = useState({
      visible: false,
      url: null,
    });

  const [errors, setErrors] = useState({});
  const [CentreData, setCentreData] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [OutSourceLabData, setOutSourceLabData] = useState([]);
  const [RejectLoading, setRejectLoading] = useState(-1);
  const [tableData, setTableData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  console.log(tableData, "tabledata");
  const [FilterData, setFilterData] = useState([]);

  const [show5, setShow5] = useState({
    modal: false,
    data: "",
    testID: null,
    ledgerTransactionID: null,
    ledgerTransactionNo: null,
    pageName: "",
    SINNO: ""
  });

  const [payload, setPayload] = useState({
    SelectTypes: defaultSearchTypes || "",
    dateTypeSearch: "sampledate",
    ItemValue: "",
    FromDate: new Date(),
    ToDate: new Date(),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    DepartmentID: "",
    CentreID: "",
    OutSourceLabID: "",
    BarcodeNo: "",
    status: "all",
  });
  const [remark, setRemarks] = useState('')
  const [dispatchReceivedBy, setDispatchReceivedBy] = useState('')
  const [excelLoading, setExcelLoading] = useState(false);
  const [saveExcelLoading, setSaveExcelLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPatientDetailModal, setShowPatientDetailModal] = useState(false);
  const [patientDetailData, setPatientDetailData] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);

  const [headWithApiFields, setHeadWithApiFields] = useState({
    "S.No": "S.No",
    "From Centre": "centre",
    "Visit No.": "LedgerTransactionNo",
    "Barcode No.": "BarcodeNo",
    "Patient Name": "PName",
    Department: "DepartmentName",
    "Test Name": "itemname",
    "OutSource Lab": "OutSourceLabID",
    OutSourceTestCode: "LabOutSrcTestCode",
    OutSourceRate: "LabOutSrcRate",
    "Add Report": "TestIDHash",
    Select: "isChecked",
  });

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      handleSearch();
    }
  };

  const handleTime = (time, secondName) => {
    let TimeStamp = "";
    TimeStamp = time?.Hour + ":" + time?.Minute + ":" + time?.second;
    setPayload({ ...payload, [secondName]: TimeStamp });
  };

  const handleSelectChange = (event) => {
    const { name, value, selectedIndex } = event?.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const handleReactSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value?.toString() }));
  };

  // const handlechangeOutsource = (e, index) => {
  //   const { value } = e?.target;
  //   const data = [...tableData];
  //   const datas = handleDropdown(data[index]["OutsourceName"]);
  //   const values = datas.filter((ele) => ele?.value == value);
  //   data[index]["OutSourceLabID"] = values[0]?.value;
  //   data[index]["OutSourceLabName"] = values[0]?.label;
  //   data[index]["OutSourceRate"] = values[0]?.rate;
  //   data[index]["OutSourceTestCode"] = values[0]?.code;
  //   setTableData(data);
  // };

  const handlechangeOutsource = (selectedOption, index) => {
    console.log("selectedOption", selectedOption);
    const data = [...tableData];
    data[index]["OutSourceLabID"] = selectedOption?.value;
    data[index]["OutSourceLabName"] = selectedOption?.label;
    data[index]["OutSourceRate"] = selectedOption?.rate;
    data[index]["OutSourceTestCode"] = selectedOption?.code;

    setTableData(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
    if (name == "SelectTypes" && value !== "BarcodeNo") {
      setCheckBarcodeOption(false);
    }
    if (
      name == "SelectTypes" &&
      value === "BarcodeNo" &&
      ShowAllCheckBarcodeOption == 1
    ) {
      setCheckBarcodeOption(true);
    }
  };

  const controllerDynamic = async () => {
    try {
      let pageID = 176;
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(pageID);

      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);
      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);

        const dynamicMappings = { ...headWithApiFields };
        controllersData.forEach((column) => {
          if (!dynamicMappings[column.ControlDisplayID]) {
            dynamicMappings[column.ControlDisplayID] =
              column.ApiFieldName || column.ControlDisplayID;
          }
        });
        setHeadWithApiFields(dynamicMappings);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  const getOutSourceLabData = () => {
    axiosInstance
      .get("OutSourceLabMaster/getOutSourceLabData")
      .then((res) => {
        let data = res.data.message;
        let OutSourceLabData = data.map((ele) => {
          return {
            value: ele.OutSourceLabID,
            label: ele.LabName,
          };
        });
        OutSourceLabData.unshift({ label: "Select", value: "" });
        setOutSourceLabData(OutSourceLabData);
      })
      .catch((err) => console.error(err));
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let Department = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        Department.unshift({ label: "Select", value: "" });
        setDepartment(Department);
      })
      .catch((err) => console.error(err));
  };

  const handleCheckbox = (e, index) => {
    const { name, checked } = e.target;
    if (index >= 0) {
      const val = [...tableData];
      val[index][name] = checked ? "1" : "0";
      setTableData(val);
    } else {
      const data = tableData.map((ele) => {
        return {
          ...ele,
          [name]: checked ? "1" : "0",
        };
      });
      setTableData(data);
    }
  };
  const handleSelectAll = (e) => {
    const { checked } = e.target;

    const updatedData = tableData.map((item) => {
      if (filteredData.includes(item) && item?.STATUS !== "OutSourced") {
        return {
          ...item,
          isChecked: checked ? "1" : "0",
        };
      }

      return item;
    });

    setTableData(updatedData);
  };
  const removeDuplicates = (data) => {
    if (data?.length > 0) {
      const seen = new Set();
      return data?.filter((item) => {
        const key = `${item?.label}-${item?.value}`;
        if (seen?.has(key)) {
          return false;
        } else {
          seen?.add(key);
          return true;
        }
      });
    } else {
      return [];
    }
  };

  // const handleDropdown = (outSourceName) => {
  //   const data = outSourceName.split("#");
  //   const val = data.map((ele) => {
  //     const newVal = ele.split("|");
  //     return {
  //       label: newVal[0],
  //       value: newVal[1],
  //       code: newVal[2],
  //       rate: Number(newVal[3])?.toFixed(2),
  //     };
  //   });
  //   return removeDuplicates(val);
  // };

  // const handleDropdown = (outSourceName) => {
  //   if (!outSourceName || outSourceName === "|0||0.000000") return [];

  //   return outSourceName.split("#").map((ele) => {
  //     const newVal = ele.split("|");

  //     return {
  //       label: newVal[0] || "",
  //       value: newVal[1] || "",
  //       code: newVal[2] || "",
  //       rate: Number(newVal[3])?.toFixed(2),
  //     };
  //   });
  // };
  const handleDropdown = (outSourceName) => {
    if (!outSourceName || outSourceName === "|0||0.000000") return [];

    return outSourceName.split("#").map((ele) => {
      const [name, id, code, rate] = ele.split("|");

      return {
        label: name || "",
        value: id || "",
        code: code || "",
        rate: Number(rate || 0).toFixed(2),
      };
    });
  };
  const handleSearch = (forceTransfer = 0) => {
    setStatusFilter("all");
    setPayload((prev) => ({ ...prev, status: "all" }));
    setLoading(true);
    axiosInstance
      .post("OutSourceTestToOtherLab/binddata", {
        ...payload,
        status: "all",
        FromDate: moment(payload?.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(payload?.ToDate).format("DD/MMM/YYYY"),
        selectTypes: payload?.SelectTypes || "",
        IsForcellyTransfer: forceTransfer,
      })
      .then((res) => {
        let data = res?.data?.message;
        const val = data?.map((ele) => {
          const opts = ele?.OutsourceName == null ? [] : handleDropdown(ele?.OutsourceName);
          const defaultOpt = opts.find(opt => String(opt.value) === String(ele?.DefaultLabID)) || opts[0];
          return {
            ...ele,
            OutSourceLabID: defaultOpt?.value ?? "",
            OutSourceLabName: defaultOpt?.label ?? "",
            OutSourceTestCode: defaultOpt?.code ?? "",
            OutSourceRate: defaultOpt?.rate ?? "",
          };
        });
        setTableData(val);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
        setTableData([]);
        setLoading(false);
      });
  };

  // const handleSave = () => {
  //   const data = tableData.filter((ele) => ele?.isChecked == "1");

  //   for (let i = 0; i < data.length; i++) {
  //     if (!data[i].OutSourceLabID || data[i].OutSourceLabID === "") {
  //       const rowIndex = tableData.findIndex((row) => row === data[i]);
  //       toast.error(`Please Select Outsource Lab on Row No. ${rowIndex + 1}`);
  //       return;
  //     }
  //   }

  //   setLoading(true);

  //   if (DefaultCurrencyName == "KES" && !dispatchReceivedBy) {
  //     toast.error("Please enter  Dispatch Received By.");
  //     setLoading(false);
  //     return;
  //   }
  //   if (DefaultCurrencyName == "KES" && !remark) {
  //     toast.error("Please enter a remark.");
  //     setLoading(false);
  //     return;
  //   }

  //   const newPayload = data.map((ele) => {
  //     return {
  //       ...ele,
  //       OutSourceLabRate: ele?.OutSourceRate,
  //       LabOutSrcRate: ele?.OutSourceRate ?? 0,
  //       OutSourceLabID: ele?.OutSourceLabID.toString(),
  //     };
  //   });
  //   // debugger
  //   axiosInstance
  //     .post("OutSourceTestToOtherLab/savedata", {
  //       OutSourceData: newPayload,
  //       Remark: remark,
  //       DispatchReceivedBy: dispatchReceivedBy,
  //     })
  //     .then((res) => {
  //       toast.success(res?.data?.message);
  //       setLoading(false);
  //       handleSearch();
  //       setRemarks("");
  //       setDispatchReceivedBy("");
  //     })
  //     .catch((err) => {
  //       console.log(err,"jndjvdv");
  //       toast.error(
  //         err?.data?.message ? err?.data?.message : "Something Went Wrong",
  //       );
  //       setLoading(false);
  //     });
  // };
  const handleSave = () => {
    const data = tableData.filter((ele) => ele?.isChecked == "1");

    for (let i = 0; i < data.length; i++) {
      if (!data[i].OutSourceLabID || data[i].OutSourceLabID === "") {
        const rowIndex = tableData.findIndex((row) => row === data[i]);
        toast.error(`Please Select Outsource Lab on Row No. ${rowIndex + 1}`);
        return;
      }
    }

    setLoading(true);

    if (DefaultCurrencyName == "KES" && !dispatchReceivedBy) {
      toast.error("Please enter  Dispatch Received By.");
      setLoading(false);
      return;
    }
    if (DefaultCurrencyName == "KES" && !remark) {
      toast.error("Please enter a remark.");
      setLoading(false);
      return;
    }

    const newPayload = data.map((ele) => {
      return {
        ...ele,
        OutSourceLabRate: ele?.OutSourceRate,
        LabOutSrcRate: ele?.OutSourceRate ?? 0,
        OutSourceLabID: ele?.OutSourceLabID.toString(),
      };
    });
    // debugger
    axiosInstance
      .post("OutSourceTestToOtherLab/savedata", {
        OutSourceData: newPayload,
        Remark: remark,
        DispatchReceivedBy: dispatchReceivedBy,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setLoading(false);
          setTableData([]);
          setRemarks("");
          setDispatchReceivedBy("");
        } else {
          toast.error(res?.data?.message || "Something Went Wrong");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err,"jndjvdv");
        toast.error(
          err?.data?.message ? err?.data?.message : "Something Went Wrong",
        );
        setLoading(false);
      });
  };

  const handleSaveWithExcel = async () => {
    const data = tableData.filter((ele) => ele?.isChecked == "1");

    for (let i = 0; i < data.length; i++) {
      if (!data[i].OutSourceLabID || data[i].OutSourceLabID === "") {
        const rowIndex = tableData.findIndex((row) => row === data[i]);
        toast.error(`Please Select Outsource Lab on Row No. ${rowIndex + 1}`);
        return;
      }
    }

    const selectedTestIDs = data.map((ele) => Number(ele?.TestID)).filter(Boolean);
    const newPayload = data.map((ele) => ({
      ...ele,
      OutSourceLabRate: ele?.OutSourceRate,
      LabOutSrcRate: ele?.OutSourceRate ?? 0,
      OutSourceLabID: ele?.OutSourceLabID.toString(),
    }));

    setSaveExcelLoading(true);
    try {
      const saveRes = await axiosInstance.post("OutSourceTestToOtherLab/savedata", { OutSourceData: newPayload });
      toast.success(saveRes?.data?.message);

      const excelPayload = {
        centre: [],
        rateType: [],
        testIDs: selectedTestIDs,
        documentType: 1,
        department: [],
        fromDate: "",
        toDate: "",
      };
      const excelRes = await axiosReport.post("OutSource/OutsourceLabReport", excelPayload, { responseType: "blob" });
      const contentType = excelRes.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await excelRes.data.text();
        try { toast.error(JSON.parse(text)?.message || "Record Not Found."); } catch { toast.error("Record Not Found."); }
      } else if (!excelRes.data || excelRes.data.size === 0) {
        toast.error("No data for Excel.");
      } else {
        const url = window.URL.createObjectURL(new Blob([excelRes.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "OutsourceMIS.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      setTableData([]);
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try { toast.error(JSON.parse(text)?.message || "Something went wrong."); } catch { toast.error("Something went wrong."); }
      } else {
        toast.error(err?.data?.message || err?.response?.data?.message || "Something Went Wrong");
      }
    } finally {
      setSaveExcelLoading(false);
    }
  };

  const rejectData = (data, index) => {
    setRejectLoading(index);
    axiosInstance
      .post("OutSourceTestToOtherLab/Rejectdata", {
        OutSourceData: [data],
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setRejectLoading(-1);
          handleSearch();
        }
      })
      .catch((err) => {
        toast.error(
          err?.data?.message ? err?.data?.message : "Something went Wrong",
        );
        setRejectLoading(-1);
      });
  };

   const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  const getAwsDocs = async (ids) => {
  
      await axiosInstance
        .post(
          `RE/DocLockData`,
          {
            TestIDHash: ids || [],
          },
        )
        .then((res) => {
          const awsKeysArray = (res?.data?.data || [])
            .map(item => item?.awsKey)
            .filter(Boolean);
  
          // ✅ Optional: remove duplicates
          // const uniqueAwsKeys = [...new Set(awsKeysArray)];
  
          console.log("AWS Keys:", awsKeysArray);
  
          // ✅ Use it (example)
          setPreviewConfig({
            visible: true,
            url: awsKeysArray,
          });
  
        })
        .catch((err) => {
          toast.error(
            err?.data?.message ||
            err?.data?.message ||
            "Something went wrong",
          );
        });
    };
  





















   const handleOpenPreview = (data) => {
     
      let testIdHashArray = [];
  
      try {
        const pliData = JSON.parse(data?.PliDataList || "[]");
  
        testIdHashArray = pliData.map(item => item?.TestIdHash).filter(Boolean);
      } catch (err) {
        console.error("Error parsing PliDataList:", err);
      }
  
      console.log("TestIdHash Array:", testIdHashArray);
  
      getAwsDocs(testIdHashArray);
    };



















  const handleViewDetails = (data) => {
    if (!data.LedgerTransactionNo) {
      toast.error("No valid data found");
      return;
    }

    const resultData = [{
      LedgerTransactionNo: data.LedgerTransactionNo,
      TestID: data.TestID
    }];
    
    setPatientDetailData(resultData);
    setSelectedRowIndex(0);
    setShowPatientDetailModal(true);
  };

  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        CentreDataValue.unshift({ label: "Select", value: "" });
        setCentreData(CentreDataValue);
      })
      .catch((err) => console.error(err));
  };

  const showBtn = () => {
    const val = tableData.filter((ele) => ele?.isChecked == "1");
    return val.length > 0 ? true : false;
  };

  const handleToggleChange = (e) => {
    const { checked } = e.target;
    setCheckBarcodeOption(checked);
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

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    getOutSourceLabData();
    controllerDynamic();
  }, []);
  const counts = {
    Pending: tableData?.filter((ele) => ele?.STATUS !== "OutSourced").length || 0,
    Outsource: tableData?.filter((ele) => ele?.STATUS === "OutSourced").length || 0,
  };

  const handleCaptureUploadedFile = async () => {
    const payloads = {
      testIDHash: show5?.data,
      testID: show5?.testID,
      ledgerTransactionID: show5?.ledgerTransactionID,
      ledgerTransactionNo: show5?.ledgerTransactionNo,
      PackageName: "",
      SINNO: show5?.SINNO,
    };
    try {
      const res = await axiosInstance.post(
        "RE/UpdateOutSourceStatus",
        payloads
      );
      if (res?.data?.success) {
        toast.success("Document Saved Successfully");
        setShow5({
          modal: false,
          data: "",
          testID: null,
          ledgerTransactionID: null,
          ledgerTransactionNo: null,
          pageName: "",
          SINNO: "",
        });
      }
    } catch (error) {
      toast.error("Error saving document");
    }
  };

  const handleExcel = async () => {
    const testIDs = tableData.map((ele) => Number(ele?.TestID)).filter(Boolean);
    const excelPayload = {
      centre: [],
      rateType: [],
      testIDs,
      documentType: 1,
      department: [],
      fromDate: "",
      toDate: "",
    };
    try {
      setExcelLoading(true)
      const res = await axiosReport.post("OutSource/OutsourceLabReport", excelPayload, { responseType: "blob" });
      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        try { toast.error(JSON.parse(text)?.message || "Record Not Found."); } catch { toast.error("Record Not Found."); }
        return;
      }
      if (!res.data || res.data.size === 0) { toast.error("Record Not Found."); return; }
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "OutsourceMIS.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setExcelLoading(false)
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try { toast.error(JSON.parse(text)?.message || "Record Not Found."); } catch { toast.error("Record Not Found."); }
        setExcelLoading(false)
        return;
      }
      toast.error(err?.response?.data?.message || "Something went wrong.");
    }
  };

  const filteredData = tableData.filter((item) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "0") return item.STATUS !== "OutSourced";
    if (statusFilter === "1") return item.STATUS === "OutSourced";
    return true;
  });

  const outSourceLabOpts = OutSourceLabData.filter((o) => o.value !== "");
  const centreOpts = CentreData.filter((o) => o.value !== "");
  const selectableData = filteredData?.filter(
    (item) => item?.STATUS !== "OutSourced"
  );

  const isAllSelected =
    selectableData?.length > 0 &&
    selectableData?.every((item) => item?.isChecked === "1");
  return (
    <>
      {/* <OutSourceRateImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        outSourceLabOptions={outSourceLabOpts}
        centreOptions={centreOpts}
      /> 
      <OutSourceTransferModal
        visible={showTransferModal}
        setVisible={setShowTransferModal}
        outSourceLabOptions={outSourceLabOpts}
        centreOptions={centreOpts}
      /> */}
      {show5?.modal && (
        <UploadFile
          show={show5?.modal}
          handleClose={(data) => {
            handleCaptureUploadedFile();
            setShow5((prev) => ({
              ...prev,
              modal: false,
            }));
          }}
          documentId={show5.data}
          pageName={show5?.pageName}
          formData={payload}
          showHeader={false}
        />
      )}
      <Accordion
        name={t("Out Source Test To Other Lab")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          {controllerDynamicList
            ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
            ?.map((item, index) => {
              if (
                item?.ControlDisplayID == "SelectTypes" &&
                isHideController("SelectTypes")
              ) {
                return (
                  <div className="col-md-2" key={index}>
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
                          selectedValue={payload.SelectTypes}
                          name="SelectTypes"
                          onChange={handleChange}
                        />
                      </div>
                      {ShowAllCheckBarcodeOption == 1 &&
                        payload?.SelectTypes == "BarcodeNo" && (
                          <>
                            <Tooltip
                              target="#ShowAllCheckBarcodeOption"
                              content={t("ShowAllCheckBarcodeOption")}
                              position="top"
                            />
                            <Form.Check
                              type="checkbox"
                              label=""
                              id="ShowAllCheckBarcodeOption"
                              checked={!!checkBarcodeOption}
                              onChange={handleToggleChange}
                              className="cursor-pointer"
                            />
                          </>
                        )}
                      <div style={{ width: "50%" }}>
                        {payload?.SelectTypes === "Mobile" ? (
                          <div style={{ width: "100%" }}>
                            <Input
                              type="number"
                              name="ItemValue"
                              max={10}
                              onKeyDown={handleKeyDown}
                              value={payload.ItemValue}
                              onChange={handleChange}
                              onInput={(e) => number(e, 10)}
                            />
                          </div>
                        ) : (
                          <div style={{ width: "100%" }}>
                            <Input
                              type="text"
                              name="ItemValue"
                              max={20}
                              onKeyDown={handleKeyDown}
                              value={payload.ItemValue}
                              onChange={handleChange}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              if (
                item?.ControlDisplayID == "dateTypeSearch" &&
                isHideController("dateTypeSearch")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      name="dateTypeSearch"
                      id="dateTypeSearch"
                      removeIsClearable={true}
                      dynamicOptions={DateBy}
                      placeholderName="DateType"
                      value={payload?.dateTypeSearch}
                      onChange={handleReactSelectChange}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID == "FromDate" &&
                isHideController("FromDate")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      name="FromDate"
                      id="FromDate"
                      lable="From Date"
                      className="custom-calendar"
                      placeholder=" "
                      value={payload?.FromDate}
                      onChange={dateSelect}
                      onChangeTime={handleTime}
                      secondName="FromTime"
                      maxDate={new Date()}
                    />
                    {errors?.FromDate && (
                      <div className="error-message">{errors?.FromDate}</div>
                    )}
                  </div>
                );
              }
              if (
                item?.ControlDisplayID == "ToDate" &&
                isHideController("ToDate")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      name="ToDate"
                      id="ToDate"
                      className="custom-calendar"
                      lable="To Date"
                      placeholder=" "
                      value={payload?.ToDate}
                      onChange={dateSelect}
                      onChangeTime={handleTime}
                      secondName="ToTime"
                      maxDate={new Date()}
                      minDate={new Date(payload.FromDate)}
                    />
                    {errors?.ToDate && (
                      <div className="error-message">{errors?.ToDate}</div>
                    )}
                  </div>
                );
              }
              if (
                item?.ControlDisplayID == "CentreID" &&
                isHideController("CentreID")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      name="CentreID"
                      removeIsClearable={true}
                      dynamicOptions={CentreData}
                      placeholderName="Centre"
                      value={payload?.CentreID}
                      onChange={handleReactSelectChange}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID == "DepartmentID" &&
                isHideController("DepartmentID")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      name="DepartmentID"
                      removeIsClearable={true}
                      dynamicOptions={Department}
                      onChange={handleReactSelectChange}
                      value={payload?.DepartmentID}
                      placeholderName="Department"
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID == "OutSourceLabID" &&
                isHideController("OutSourceLabID")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      name="OutSourceLabID"
                      dynamicOptions={OutSourceLabData}
                      onChange={handleReactSelectChange}
                      value={payload?.OutSourceLabID}
                      placeholderName="OutSource Lab"
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID == "status" &&
                isHideController("status")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      name="status"
                      dynamicOptions={[
                        {
                          label: "All",
                          value: "all",
                        },
                        {
                          label: "Pending",
                          value: "0",
                        },
                        {
                          label: "Outsource",
                          value: "1",
                        },
                      ]}
                      onChange={(name, value) => {
                        handleReactSelectChange(name, value);
                        setStatusFilter(value?.value);
                      }}
                      value={payload?.status}
                      placeholderName="Status"
                    />
                  </div>
                );
              }
              return null;
            })}

          <div className="col-sm-auto">
            <SearchButton text={"Search"} onClick={() => handleSearch()} />
          </div>
          <div className="col-sm-auto">
            <SearchButton
              text={"Force Search"}
              onClick={() => handleSearch(1)}
            />
          </div>
          {tableData.length > 0 && (
            <div className="col-sm-auto">
              <CustomButton
                text={excelLoading ? "Loading..." : t("Excel")}
                icon={"excel"}
                onClick={handleExcel}
                loading={excelLoading}
              />
            </div>
          )}
          {/* <div className="col-sm-auto">
            <CustomButton
              text={t("Import / Export")}
              icon="excel"
              onClick={() => setShowImportModal(true)}
            />
          </div> */}
          {/* <div className="col-sm-auto">
            <CustomButton
              text={t("Transfer")}
              icon="forword"
              onClick={() => setShowTransferModal(true)}
            />
          </div> */}
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        seconTitle={
          <>
            <div className="col-sm-12 d-flex justify-content-end gap-custom p-0 link-title-container">
              {colorCodingData.map(({ color, labelKey, id }) => (
                <div
                  key={id}
                  className="cursor-pointer"
                  onClick={() => {
                    const status = labelKey === "Pending" ? "0" : "1";
                    setStatusFilter(status);
                  }}
                >
                  <ColorCodingSearch
                    color={color}
                    label={
                      labelKey === "Pending"
                        ? `${labelKey} (${counts.Pending})`
                        : `${labelKey} (${counts.Outsource})`
                    }
                  />
                </div>
              ))}
              <h6 className="box-title pt-2">
                <span
                  className="cursor-pointer"
                  style={{
                    color: "#051c68",
                    marginLeft: "15px",
                    fontWeight: "600",
                  }}
                  onClick={() => setStatusFilter("all")}
                >
                  {t("Total Test")} : {tableData?.length || 0}
                </span>
              </h6>
            </div>
          </>
        }
      >
        {filteredData?.length > 0 && (
          <>
            <div className="row">
              <div className="col-12">
                <Tables
                  paginate={"true"}
                  data={filteredData}
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      {FilterData?.filter(
                        (item) => item.IsShow == 1 && item.TypeId == 2,
                      )?.map((header, idx) => {
                        const columnWidths = {
                          "S.No": "10px",
                          "From Centre": "100px",
                          "Visit No.": "100px",
                          "Barcode No.": "100px",
                          "Patient Name": "100px",
                          "Age": "100px",
                          "Department": "110px",
                          "SampleCollectionDate": "80px",
                          "DoctorName": "120px",
                          "Test Name": "200px",
                          "OutSource Lab": "110px",
                          "OutSourceTestCode": "120px",
                          "OutSourceRate": "80px",
                          "Add Report": "60px",
                          "Status": "70px",
                          "Select": "40px",
                        };
                        const width = columnWidths[header.ControlDisplayID] || "100px";

                        return (
                          <th
                            key={idx}

                            style={{
                              minWidth: width,
                              width: width,
                              fontWeight: "600",
                              fontSize: "13px",
                            }}
                          >
                            {header.ControlDisplayID === "Select" ? (
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                              />
                            ) : header.ControlDisplayID === "S.No" ? (
                              t("S.No")
                            ) : header.ControlDisplayID === "SampleCollectionDate" ? (
                              t("Collection Date")
                            ) : (
                              t(header.ControlDisplayName || header.ControlDisplayID)
                            )}
                          </th>
                        );
                      })}
                      
                      <th
                      
                        style={{
                             
                              fontWeight: "600",
                              fontSize: "13px",
                        }}
                      >
                        <i className="fa fa-search" style={{ fontSize: "16px" }}></i>
                      </th>
                    </tr>
                  </thead>
{/* comment */}
                  <tbody>

                    {filteredData.map((data) => {
                      const rowIndex = tableData.indexOf(data);
                      return (
                        <tr
                          key={rowIndex}
                          style={{
                            backgroundColor:
                              data?.STATUS === "OutSourced"
                                ? "#8ef58e66"
                                : "rgba(255, 182, 193, 0.4)",
                          }}
                        >
                          {FilterData?.filter(
                            (item) => item.IsShow == 1 && item.TypeId == 2,
                          )?.map((column, colIndex) => {
                            const columnWidths = {
                              "S.No": "10px",
                              "From Centre": "100px",
                              "Visit No.": "100px",
                              "Barcode No.": "100px",
                              "Patient Name": "100px",
                              "Age": "100px",
                              "Department": "110px",
                              "SampleCollectionDate": "80px",
                              "DoctorName": "120px",
                              "Test Name": "100px",
                              "OutSource Lab": "110px",
                              "OutSourceTestCode": "120px",
                              "OutSourceRate": "80px",
                              "Add Report": "60px",
                              "Status": "70px",
                              "Select": "40px",
                            };
                            const width = columnWidths[column.ControlDisplayID] || "100px";
                            const cellStyle = {
                              minWidth: width,
                              maxWidth: width,
                              width: width,
                              fontSize: "12px",
                              wordBreak: "break-word",
                              whiteSpace: "normal",
                            };

                            if (column.ControlDisplayID === "S.No") {
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    {filteredData.indexOf(data) + 1}
                                    <div className="d-flex" style={{ gap: "4px" }}>
                                      {data._isFirstOfPatient ? (
                                        <>
                                          {data._patientSerialNumber + Number(prevPageSize)}
                                          &nbsp;
                                          {data?.IsPatientDocAvail > 0 && (
                                            <div
                                              style={{
                                                backgroundColor: "#007bff",
                                                borderRadius: "50%",
                                                width: "18px",
                                                height: "18px",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                              }}
                                              onClick={() => handleOpenPreview(data)}
                                              title="View Attachments"
                                            >
                                              <FaDownload color="white" size={8} />
                                            </div>
                                          )}
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "From Centre") {
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  {data?.centre}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Visit No.") {
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  {data?.LedgerTransactionNo}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Barcode No.") {
                              return (
                                <td key={colIndex} style={{ ...cellStyle, fontWeight: "600" }}>
                                  {data?.BarcodeNo}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Patient Name") {
                              return (
                                <td key={colIndex} style={{ ...cellStyle, textAlign: "left", fontWeight: "500" }}>
                                  {data?.PName}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Age") {
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  {data?.Age}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Department") {
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  {data?.DepartmentName}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "SampleCollectionDate") {
                              const dateParts = (data?.SampleCollectionDate || "")?.split(" ");
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  <p className="mb-0" style={{ fontWeight: "500" }}>{dateParts[0]}</p>
                                  <p className="mb-0 text-muted" style={{ fontSize: "11px" }}>{dateParts.slice(1).join(" ")}</p>
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "DoctorName") {
                              return (
                                <td key={colIndex} style={{ ...cellStyle, textAlign: "left" }}>
                                  {data?.DoctorName}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Test Name") {
                              return (
                                <td key={colIndex} style={{ ...cellStyle, textAlign: "left", fontWeight: "500" }}>
                                  {data?.itemname}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "OutSource Lab") {
                              const options = data?.OutsourceName
                                ? handleDropdown(data?.OutsourceName)
                                : OutSourceLabData;

                              return (
                                <td key={colIndex} style={cellStyle}>
                                  <div style={{ width: "100%" }}>
                                    <ReactSelect
                                      name="OutSourceLabID"
                                      dynamicOptions={options}
                                      removeIsClearable={true}
                                      value={data?.OutSourceLabID}
                                      onChange={(name, value) => handlechangeOutsource(value, rowIndex)}
                                    />
                                  </div>
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "OutSourceTestCode") {
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  {data?.OutSourceTestCode}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "OutSourceRate") {
                              return (
                                <td key={colIndex} style={{ ...cellStyle, fontWeight: "600" }}>
                                  {Number(data?.LabOutSrcRate || 0).toFixed(2)}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Add Report") {
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  {data?.STATUS === "OutSourced" && data?.Approved === 0 && (
                                    <CustomButton
                                      icon="add"
                                      text={data?.UploadDocumentCount > 0 ? `(${data?.UploadDocumentCount})` : ""}
                                      onClick={() => {
                                        setShow5({
                                          modal: true,
                                          data: data?.TestIDHash,
                                          pageName: "Add Report",
                                          testID: data?.TestID,
                                          ledgerTransactionID: data?.LedgerTransactionID,
                                          ledgerTransactionNo: data?.LedgerTransactionNo,
                                          SINNO: data?.BarcodeNo,
                                        });
                                      }}
                                    />
                                  )}
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Status") {
                              const isOutsourced = data?.STATUS === "OutSourced";
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  <span
                                    className={`badge ${isOutsourced ? "bg-success" : "bg-warning text-dark"}`}
                                    style={{ padding: "5px 10px", borderRadius: "12px", fontSize: "10px" }}
                                  >
                                    {isOutsourced ? t("OutSourced") : t("Pending")}
                                  </span>
                                </td>
                              );
                            }

                            if (column.ControlDisplayID === "Select") {
                              return (
                                <td key={colIndex} style={cellStyle}>
                                  {data?.STATUS !== "OutSourced" ? (
                                    <input
                                      type="checkbox"
                                      name="isChecked"
                                      checked={data?.isChecked === "1"}
                                      onChange={(e) => handleCheckbox(e, rowIndex)}
                                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                    />
                                  ) : RejectLoading === rowIndex ? (
                                    <Loading />
                                  ) : (
                                    data?.Approved !== 1 && (
                                      <CustomButton
                                        icon="delete"
                                        onClick={() => rejectData(data, rowIndex)}
                                      />
                                    )
                                  )}
                                </td>
                              );
                            }

                            return <td key={colIndex} style={cellStyle}></td>;
                            
                          })}
                          {/* Eye icon column - shows for every row */}
                          <td style={{ minWidth: "50px", width: "50px", textAlign: "center" }}>
                            <div className="d-flex align-items-center justify-content-center mt-1 mx-1">
                              <FaEye
                                style={{
                                  fontSize: "18px",
                                  cursor: "pointer",
                                  color: "#007bff",
                                }}
                                onClick={() => handleViewDetails(data)}
                                title="View Details"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Tables>

                {loading ? (
                  <Loading />
                ) : (
                  showBtn() && (
                    <div className="box-footer pt-2">
                      <div className="row">
                        {DefaultCurrencyName == "KES" &&
                          <>
                            <div className="col-sm-2">
                              <Input
                                type="text"
                                placeholder=""
                                className="form-control input-sm required-fields"
                                name="dispatchReceivedBy"
                                id="dispatchReceivedBy"
                                value={dispatchReceivedBy}
                                max={50}
                                onChange={(e) => setDispatchReceivedBy(e.target.value)}
                                lable={t("Dispatch Received By")}
                              />
                            </div>
                            <div className="col-sm-2">
                              <Input
                                type="text"
                                placeholder=""
                                className="form-control input-sm required-fields"
                                name="remark"
                                id="remark"
                                value={remark}
                                max={100}
                                onChange={(e) => setRemarks(e.target.value)}
                                lable={t("Remark")}
                              />
                            </div>
                          </>
                        }

                        <div className="col-sm-auto">
                          <SaveButton
                            text={"Save"}
                            onClick={handleSave}
                          />
                        </div>
                        <div className="col-sm-auto">
                          <CustomButton
                            text={saveExcelLoading ? t("Please wait...") : t("Save with Excel")}
                            icon="excel"
                            onClick={handleSaveWithExcel}
                            disabled={saveExcelLoading}
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </Accordion>
      
      {/* Patient Detail Modal */}
      <DispatchPatientDetailModal
        showPH={showPatientDetailModal}
        setShowPH={setShowPatientDetailModal}
        ResultData={patientDetailData}
        Index={selectedRowIndex}
      />


       <PdfPreviewModal
          visible={previewConfig.visible}
          url={previewConfig.url}
          onClose={handleClosePreview}
            />
    </>
  );
};

export default OutSourceTestToOtherLab;
