import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getStatusColor, DateTypeSearch, HistoCytoSampleStatus as SampleStatus, SearchBy } from "../../utils/Constants";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import Input from "../../components/formComponent/Input";
import {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  autocompleteOnBlur,
  dateConfig,
  ExportToExcel,
  getTrimmedData,
  number,
} from "../../utils/helpers";
import AutoComplete from "../../components/formComponent/AutoComplete";
import moment from "moment";
import RETable from "../Table/ResultEntryTable";
import DatePicker from "../../components/formComponent/DatePicker";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Accordion from "@app/components/UI/Accordion";
// import HistoCytoResultEntrySecondPage from "./HistoCytoResultEntrySecondPage";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  DepartmentWiseItemList,
  getDoctorSuggestion,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import HistoCytoResultEntrySecondPage from "./HistoCytoResultEntrySecondPage";

import { useTranslation } from "react-i18next";
import ReceiptReprintFilter from "./ReceiptReprintFilter";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import DynamicLabSearchTable from "../Table/DynamicLabSearchTable";
import HistoCytoTable from "../Table/HistoCytoTable";
import Urgent from ".././Images/urgent.gif";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SelectBox } from "../../components/formComponent/SelectBox";
import PageControlGear from "../../components/PageGearModel/PageControlGear";

function HistoCytoResultEntry() {
  const { t } = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [dropFalse, setDropFalse] = useState(true);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [redata, SetReData] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const [load, setLoad] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusValue, setStatusValue] = useState("");
  const [innerData, setinnerData] = useState({});
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [show6, setShow6] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const today = new Date();
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: "",
    RefundFilter: null,
    FromTime: new Date(today.setHours(0, 0, 0, 0)),
    ToTime: new Date(today.setHours(23, 59, 59, 999)),
    DoctorReferal: null,
    DepartmentID: "",
    DoctorName: "",
    TestName: "",
    SampleStatus: "3",
    DateTypeSearch: "Date",
    IsUrgent: "",
    MachineID: 0,
    IsTat: 0,
    Order: "DESC",
    Flag: "",
    moreFilter: 0,
    parameterId: [],
    valueCheck: "=",
    valueToSearch: "",
    valueRangeFrom: "",
    valueRangeTo: "",
  });

  // console.log({ redata })
  // console.log({ innerData })

  const [columnConfig, setColumnConfig] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const PAGE_ID = "817";
  const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;
  const fetchRateTypes = async (id) => {
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
      console.log(err);
    }
  };
  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name == "IsUrgent") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
    if (name == "CentreID") {
      setFormData({ ...formData, [name]: value, RateTypeID: "" });
      setRateTypes([]);
      if (value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value));
      } else {
        fetchRateTypes([value]);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleReactSelect = (name, e) => {
    const value = e?.value ?? "";
    if (name === "CentreID") {
      setFormData({ ...formData, [name]: value });
      setRateTypes([]);
      if (value === "") {
        fetchRateTypes(CentreData.map((ele) => ele.value));
      } else {
        fetchRateTypes([value]);
      }
    } else if (name === "SampleStatus") {
      setFormData({ ...formData, [name]: value });
      value !== "-1" && TableData(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const isVisible = (header) => {
    if (controllerDynamicList?.length) {
      const dynCtrl = controllerDynamicList.find(
        (x) => x?.ControlDisplayID === header && x?.TypeId === 1,
      );
      if (dynCtrl) {
        if (!dynCtrl.IsShow) return false;
      }
    }
    return true;
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

  const controllerDynamic = async () => {
    try {
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);

      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "ResultEntry",
        EmployeeId: EmployeeID?.toString(),
      })
      .then((res) => {
        let data = res?.data?.message;

        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };

  const handleListSearchNew = (data, name) => {
    switch (name) {
      case "DoctorName":
        setFormData({
          ...formData,
          [name]: data.Name,
          DoctorReferal: data.Name ? data.DoctorReferalID : "",
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;

      case "TestName":
        setFormData({
          ...formData,
          [name]: data.TestName,
        });
        setIndexMatch(0);
        setTestSuggestion([]);
        break;
      default:
        break;
    }
  };

  const GetResultEntry = (_, index) => {
    console.log({ index })
    setinnerData(redata[index]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        break;
      case "TestName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(TestSuggestion.length - 1);
            }
            break;
          case 40:
            if (TestSuggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            handleListSearchNew(TestSuggestion[indexMatch], name);
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
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
        fetchRateTypes(allValues);
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

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    if (formData?.DoctorName === "") {
      setDropFalse(true);
    }
  }, [formData?.DoctorName]);

  useEffect(() => {
    if (formData?.TestName.length > 2) {
      DepartmentWiseItemList(
        formData.DepartmentID,
        formData?.TestName,
        setTestSuggestion
      );
    }
  }, [formData?.TestName]);



  const dateSelect = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };
  const validation = () => {
    let error = "";
    // if (
    //   formData?.SelectTypes.trim() !== "" &&
    //   formData?.ItemValue.trim() === ""
    // ) {
    //   error = { ...error, ItemValue: "Please Choose Value" };
    // }
    // if (formData.SelectTypes === "Mobile") {
    //   if (formData?.SelectTypes !== "" && formData?.ItemValue === "") {
    //     error = { ...error, ItemValue: "This Field is Required" };
    //   } else if (formData.ItemValue.length !== 10) {
    //     error = { ...error, ItemValue: "Invalid Mobile Number" };
    //   }
    // }

    return error;
  };


  // Extract numeric status from Test HTML class e.g. "round Status-3" → 3
  const getNumericStatusFromTest = (testHtml) => {
    const match = testHtml?.match(/Status-(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const STATUS_STRING_TO_NUM = {
    "Not Collected": 1, "Collected": 2, "Receive": 3, "Rejected": 4,
    "Approved": 5, "Printed": 6, "In Transit": 7, "Tested": 10,
    "Result Done": 10, "Hold": 11, "MacData": 13, "Re-Run": 14,
    "Dispatched": 15, "Forwarded": 18, "Dual Authenticated": 20, "OutSource": 25,
  };

  const statusCount = (key) => {
    if (key === "") {
      return originalTableData?.length;
    }
    return originalTableData?.filter((item) => {
      if (item?.Status) {
        const num = STATUS_STRING_TO_NUM[item.Status];
        if (num !== undefined) return num == key;
      }
      return getNumericStatusFromTest(item?.Test) == key;
    })?.length;
  };

  const filterStatusWise = (sampStatus) => {
    setFormData({ ...formData, SampleStatus: sampStatus });
    TableData(sampStatus);
  };

  const TableData = (status) => {
    console.log({ status })

    const generatedError = validation();
    if (generatedError === "") {
      setLoading(true);
      const rateTypes = RateTypes.map((item) => {
        return item?.value;
      });
      axiosInstance
        .post(
          "HistoCyto/HistoPatientSearch",
          {
            CentreID:
              formData.CentreID !== "" ? [parseInt(formData.CentreID)] : [],
            MachineID: "0",
            SearchType: formData.SelectTypes,
            ItemValue: formData.ItemValue,
            RateTypeId:
              formData?.RateTypeID == null || formData?.RateTypeID == ""
                ? []
                : [parseInt(formData?.RateTypeID)],
            DoctorReferal: Number(formData.DoctorReferal) || 0,
            FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
            ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
            FromTime: Time(formData.FromTime),
            ToTime: Time(formData.ToTime),
            DepartmentId:
              formData.DepartmentID !== ""
                ? [parseInt(formData.DepartmentID)]
                : [],

            SampleStatus: status,
            TestName: formData?.TestName,
            DateTypeSearch: formData?.DateTypeSearch,
            IsUrgent: formData?.IsUrgent ? "1" : "0",
            PatientType: "",
            SearchValue: "",

          }
        )
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.message)) {
            SetReData(res?.data?.message);
            setOriginalTableData(res?.data?.message);
            setStatusValue(status === "" ? status : parseInt(status));
            setLoad(true);
          } else {
            SetReData([]);
            setOriginalTableData([]);
            setLoad(false);
          }
          setLoading(false);
        })
        .catch((err) => setLoading(false));
      setErrors(generatedError);
    } else {
      setErrors(generatedError);
    }
  };

  const handleExportExcel = () => {
    const ICON_COLS = new Set(["S.No", "Print", "View"]);
    // Same static fallback HistoCytoTable renders when no dynamic
    // controller columns are available yet.
    const FALLBACK_COLUMNS = [
      "Reg Date", "Visit No", "Histo No", "Barcode No", "UHID",
      "Name", "Age/Gender", "Test", "Doctor", "Centre",
    ];

    const hasDynamicFilter = controllerDynamicList.some((item) => item.TypeId == 2);

    const rawColumnsToRender = hasDynamicFilter
      ? controllerDynamicList
          .filter((item) => item.TypeId == 2 && item.IsShow == 1)
          .sort((a, b) => a.DisplayOrder - b.DisplayOrder)
          .map((item) => item.ControlDisplayID)
      : FALLBACK_COLUMNS;

    // Only keep columns that are actually visible right now (respects the
    // column show/hide gear-icon settings — same as what the table renders).
    const columnsToRender = rawColumnsToRender.filter((header) => {
      if (ICON_COLS.has(header)) return false;
      if (!columnConfig || columnConfig.length === 0) return true;
      const configItem = columnConfig.find(
        (c) => c.header?.toLowerCase() === header?.toLowerCase(),
      );
      if (configItem) return configItem.visible == 1 || configItem.visible === true;
      return true;
    });

    const extractTestNames = (testHtml) => {
      if (!testHtml) return "";
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = testHtml;
      const pTags = tempDiv.querySelectorAll("p");
      return Array.from(pTags)
        .map((p) => p.textContent?.trim())
        .filter(Boolean)
        .join(", ");
    };

    const getCellValue = (colId, item) => {
      switch (colId) {
        case "Reg Date":
          return item?.DATE ? dateConfig(item.DATE) : "";
        case "Visit No":
          return item?.LedgerTransactionNo ?? "";
        case "Histo No":
          return item?.HistoNo ?? "";
        case "Barcode No":
          return item?.BarcodeNo ?? "";
        case "UHID":
          return item?.PatientCode ?? "";
        case "Name":
          return item?.PName ?? "";
        case "Age/Gender":
          return `${item?.Age ?? ""} / ${item?.Gender === "Female" ? "F" : "M"}`;
        case "Test":
          return extractTestNames(item?.Test);
        case "Doctor":
          return item?.Doctor ?? "";
        case "Centre":
          return item?.Centre ?? "";
        default: {
          const field = item?.[colId];
          if (Array.isArray(field)) return field.join(", ");
          if (typeof field === "object" && field !== null) return JSON.stringify(field);
          return field ?? "";
        }
      }
    };

    const excelData = redata.map((item, index) => {
      const row = { "S.No": index + 1 };
      columnsToRender.forEach((colId) => {
        row[colId] = getCellValue(colId, item);
      });
      return row;
    });

    ExportToExcel(excelData, "HistoCytoResultEntry.xlsx");
  };

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    getFilterResultOption();
    controllerDynamic();
  }, []);
  const innerDataUpdate = (data, index) => {
    if (data?.HistoCytoStatus !== "SlideComplete") {
      toast.warning(t("Only Completed status cases can be opened for result entry"));
      return;
    }
    setinnerData(data);
    setSelectedRowIndex(index);
  }

  // Reset row highlight when user comes back to the main list
  useEffect(() => {
    if (Object.keys(innerData).length === 0) {
      setSelectedRowIndex(-1);
    }
  }, [innerData]);
  console.log("HERE NEED::", innerData)
  const { DefaultCurrencyName } = useLocalStorage("userData", "get") || {};
  return (
    <>
      {Object.keys(innerData)?.length === 0 ? (
        <>
          <Accordion
            title="Result Entry Details"
            defaultValue={true}
            seconTitle={
              <div className="mt-2">
                <PageControlGear pageId={PAGE_ID} />
              </div>
            }
          >
            <div>
              <div className="box-body">
                <div className="row px-2 mt-2 mb-1">
                  {controllerDynamicList
                    ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
                    ?.map((item, index) => {
                      if (
                        item?.ControlDisplayID === "SelectTypes" &&
                        isHideController("SelectTypes")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <div className="d-flex" style={{ display: "flex" }}>
                              <div style={{ width: "50%" }}>
                                <SelectBox
                                  options={SearchBy}
                                  id="SelectTypes"
                                  lable="SelectTypes"
                                  selectedValue={formData.SelectTypes}
                                  name="SelectTypes"
                                  onChange={handleSelectChange}
                                />
                              </div>
                              <div style={{ width: "50%" }}>
                                {formData?.SelectTypes === "Mobile" ? (
                                  <div style={{ width: "100%" }}>
                                    <Input
                                      type="number"
                                      name="ItemValue"
                                      max={10}
                                      value={formData.ItemValue}
                                      onChange={handleChange}
                                      onInput={(e) => number(e, 10)}
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
                                      type="text"
                                      name="ItemValue"
                                      max={20}
                                      value={formData.ItemValue}
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
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "CentreID" &&
                        isHideController("CentreID")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <ReactSelect
                              dynamicOptions={AddBlankData(
                                CentreData,
                                "All Centre",
                              )}
                              placeholderName="Centre"
                              id="CentreID"
                              name="CentreID"
                              value={formData?.CentreID}
                              onChange={handleReactSelect}
                            />
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "DepartmentID" &&
                        isHideController("DepartmentID")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <ReactSelect
                              dynamicOptions={AddBlankData(
                                DepartmentData,
                                "All Department",
                              )}
                              placeholderName={t("Department")}
                              id="Department"
                              value={formData.DepartmentID}
                              name="DepartmentID"
                              onChange={handleReactSelect}
                            />
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "RateTypeID" &&
                        isHideController("RateTypeID")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <ReactSelect
                              dynamicOptions={[
                                { label: "All RateType", value: "" },
                                ...RateTypes,
                              ]}
                              value={formData?.RateTypeID}
                              placeholderName={t("RateType")}
                              id="RateType"
                              name="RateTypeID"
                              onChange={handleReactSelect}
                            />
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "DoctorName" &&
                        isHideController("DoctorName")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <Input
                              type="text"
                              lable="Refer Doctor"
                              id="DoctorName"
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
                                    setFormData({
                                      ...formData,
                                      DoctorName: "",
                                    });
                                  }
                                }, 500);
                              }}
                              autoComplete="off"
                            />
                            {dropFalse && doctorSuggestion.length > 0 && (
                              <ul className="suggestion-data">
                                {doctorSuggestion.map((data, idx) => (
                                  <li
                                    onClick={() =>
                                      handleListSearchNew(data, "DoctorName")
                                    }
                                    className={`${
                                      idx === indexMatch && "matchIndex"
                                    }`}
                                    key={idx}
                                  >
                                    {data?.Name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "TestName" &&
                        isHideController("TestName")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <Input
                              type="text"
                              name="TestName"
                              lable="Search By Test Name"
                              id="TestName"
                              value={formData.TestName}
                              placeholder=" "
                              onChange={handleChange}
                              onKeyDown={(e) => handleIndexNew(e, "TestName")}
                            />
                            {TestSuggestion.length > 0 && (
                              <AutoComplete
                                test={TestSuggestion}
                                handleListSearch={handleListSearchNew}
                                indexMatch={indexMatch}
                              />
                            )}
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "DateTypeSearch" &&
                        isHideController("DateTypeSearch")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <ReactSelect
                              placeholderName={t("DateTypeSearch")}
                              dynamicOptions={[
                                { label: "Registration Date", value: "Date" },
                                
                                ...DateTypeSearch,
                              ]}
                              value={formData?.DateTypeSearch}
                              name="DateTypeSearch"
                              onChange={handleReactSelect}
                            />
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "FromDate" &&
                        isHideController("FromDate")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <DatePicker
                              className="custom-calendar"
                              name="FromDate"
                              value={formData?.FromDate}
                              onChange={dateSelect}
                              placeholder=" "
                              id="FromDate"
                              lable="FromDate"
                              maxDate={new Date(formData?.ToDate)}
                            />
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "FromTime" &&
                        isHideController("FromTime")
                      ) {
                        return (
                          <div className="col-sm-1" key={index}>
                            <CustomTimePicker
                              name="FromTime"
                              placeholder="FromTime"
                              value={formData?.FromTime}
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
                          <div className="col-sm-2" key={index}>
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
                            />
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "ToTime" &&
                        isHideController("ToTime")
                      ) {
                        return (
                          <div className="col-sm-1" key={index}>
                            <CustomTimePicker
                              name="ToTime"
                              placeholder="ToTime"
                              value={formData?.ToTime}
                              id="ToTime"
                              lable="ToTime"
                              onChange={handleTime}
                            />
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "SampleStatus" &&
                        isHideController("SampleStatus")
                      ) {
                        return (
                          <div className="col-sm-2" key={index}>
                            <ReactSelect
                              dynamicOptions={SampleStatus}
                              onChange={handleReactSelect}
                              name="SampleStatus"
                              placeholderName={t("SampleStatus")}
                              id="SampleStatus"
                              value={formData.SampleStatus}
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
                            <ReactSelect
                              dynamicOptions={[
                                { label: "TAT Report - All", value: 0 },
                                { label: "In TAT", value: 1 },
                                { label: "Out TAT", value: 2 },
                              ]}
                              value={formData?.IsTat}
                              placeholderName={t("IsTat")}
                              id="IsTat"
                              name="IsTat"
                              onChange={handleReactSelect}
                            />
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "IsUrgent" &&
                        isHideController("IsUrgent")
                      ) {
                        return (
                          <div className="col-sm-1 mt-1" key={index}>
                            <input
                              id="IsUrgent"
                              type="checkbox"
                              name="IsUrgent"
                              checked={formData?.IsUrgent}
                              onChange={handleSelectChange}
                            />
                            <label htmlFor="IsUrgent">
                              &nbsp;&nbsp;IsUrgent
                            </label>
                          </div>
                        );
                      }

                      if (
                        item?.ControlDisplayID === "SearchButton" &&
                        isHideController("SearchButton")
                      ) {
                        return (
                          <div className="col-sm-1" key={index}>
                            <SearchButton
                              text={t("Search")}
                              onClick={() => TableData(formData.SampleStatus)}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  {redata?.length > 0 && (
                    <div className="col-sm-auto">
                      <CustomButton
                        text={t("Excel")}
                        icon={"excel"}
                        onClick={handleExportExcel}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Accordion>
          <TableFilterDot
            slide={true}
            items={SampleStatus}
            getColor={getStatusColor}
            onSelect={filterStatusWise}
            statusCount={statusCount}
            label="Sample Status : "
            bgColor="#e9e2e1"
            className="mt-2 mb-3 px-2 py-1 bg-white"
          />
          <Accordion
            title={
              <div className="d-flex">
                <span className="mt-1">
                  {t("Search Result")}
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
            seconTitle={
              <div
                className="ml-auto d-flex align-items-center px-2 mt-1"
                style={{ gap: "12px" }}
              >
                {/* ICON LEGEND */}
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "10px", fontSize: "12px" }}
                >
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <i
                      className="fa bi-file-earmark-pdf text-primary"
                      style={{ fontSize: "14px" }}
                    />
                    <span>View Attachments</span>
                  </div>
                  {DefaultCurrencyName == "KES" && (
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "4px" }}
                    >
                      <i
                        className="fa fa-address-card text-danger"
                        style={{ fontSize: "14px" }}
                      />
                      <span>Reports Attached Document</span>
                    </div>
                  )}

                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <img src={Urgent} className="sizeicon" />
                    <span>Urgent</span>
                  </div>

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
                </div>
              </div>
            }
            notOpen={true}
            defaultValue={true}
          >
            {loading ? (
              <Loading />
            ) : load ? (
              <div className="">
                <>
                  <HistoCytoTable
                    dispatchData={redata}
                    innerDataUpdate={innerDataUpdate}
                    selectedRowIndex={selectedRowIndex}
                    filterData={controllerDynamicList}
                    showColumnModal={showColumnModal}
                    setShowColumnModal={setShowColumnModal}
                    columnConfig={columnConfig}
                    getFilterResultOption={getFilterResultOption}
                  />
                </>
              </div>
            ) : (
              <div className="">
                <NoRecordFound />
              </div>
            )}
          </Accordion>
        </>
      ) : (
        <Accordion title={t("Histo Patient Result Entry ")} defaultValue={true}>
          <HistoCytoResultEntrySecondPage
            innerData={innerData}
            setinnerData={setinnerData}
            statusValue={statusValue}
            setStatusValue={setStatusValue}
          />

        </Accordion>
      )}
    </>
  );
}

export default HistoCytoResultEntry;
