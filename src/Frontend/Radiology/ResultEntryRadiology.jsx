import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { AutoComplete } from "primereact/autocomplete";
import { FloatLabel } from "primereact/floatlabel";
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { CustomSelectBox } from "../../components/formComponent/CustomSelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import Pagination from "../../Pagination/Pagination";
import { SearchButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { getSearchController, getCollectionBoy } from "../../utils/NetworkApi/commonApi";
import { getMaxToDate } from "../../utils/helpers";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import {
  SampleStatus,
  getStatusColor,
  SearchByCulture,
  DateTypeSearch2,
  ReportTypePreliminary,
} from "../../utils/Constants";
import MultiBackGroundReactSelect from "../Laboratory/MultiBackGroundReactSelect";
import RERadiologyTable from "../Table/RERadiologyTable";
import ResultEntryRadiologyDetail from "./ResultEntryRadiologyDetail";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import Urgent from "../Images/urgent.gif";
import "../Laboratory/ResultEntry.css";

const ExtraLegend = [
  { label: "New Test Added", color: "#e91e8c" },
  { label: "Repeat Patient", color: "#8e44ec" },
];

// Once a report reaches Save/Hold/Approved/Unapproved, the row's numeric
// Status field stops updating and RadiologyResultStatus becomes the source
// of truth, so status counts must fall back to this mapping.
const RADIOLOGY_RESULT_STATUS_TO_SAMPLE_STATUS = {
  Save: "10",
  Approved: "5",
  Hold: "11",
  Unapproved: "20",
};

const ResultEntryRadiology = () => {
  const { t } = useTranslation();
  const PAGE_ID = "1133"; // TODO: confirm real PAGE_ID for this page
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const { ShowDefaultLoginCentre, EmployeeID } = useLocalStorage("userData", "get");

  const [loading, setLoading] = useState(false);
  const [reData, setReData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnConfig, setColumnConfig] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [CentreData, setCentreData] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [MachineData, setMachineData] = useState([]);
  const [proEmployee, setProEmployee] = useState([]);

  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);

  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [filterData, setFilterData] = useState([]);

  const [remarkOptions, setRemarkOptions] = useState([]);
  const [transferCentres, setTransferCentres] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [rateTypeLoading, setRateTypeLoading] = useState(false);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [state, setState] = useState({ ProEmployee: "" });
  const [entryPayload, setEntryPayload] = useState({ HistoReportType: "0" });
  const maxRange = 15;

  const [payload, setPayload] = useState({
    SinNo: "",
    CentreID: "",
    PanelID: "",
    DepartmentID: "",
    PatientID: "",
    MachineID: "",
    ResultStatus: "",
    TestName: "",
    AddOn: false,
    FromDate: new Date(),
    ToDate: new Date(),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    IsUrgent: false,
    ProEmployeeID: "",
    Camp: false,
    IsTat: 0,
    ShowHeader: true,
    CaseAssignMent: false,
  });

  const getAccessCentres = () => {
    axiosInstance
      .post("Centre/BindCentreWorkOrder", { centreID: 0, rateTypeID: 0 })
      .then((res) => {
        const list = (res?.data?.message || []).map((ele) => ({
          value: ele.value,
          label: ele.label,
        }));
        setCentreData(list);
        if (ShowDefaultLoginCentre === "1" && DefaultCentre) {
          setPayload((prev) => ({ ...prev, CentreID: DefaultCentre }));
          getRateTypeDropdown(DefaultCentre);
        }
      })
      .catch((err) => console.log(err));
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const list = (res?.data?.message || []).map((ele) => ({
          value: ele.DepartmentID,
          label: ele.Department,
        }));
        setDepartmentData(list);
      })
      .catch((err) => console.log(err));
  };

  const getMachines = () => {
    axiosInstance
      .get("RE/BindMachineGroup?ResultEntry=1")
      .then((res) => {
        const list = (res?.data?.message || []).map((ele) => ({
          value: ele?.MachineId,
          label: ele?.MachineName,
        }));
        setMachineData(list);
      })
      .catch((err) => console.log(err));
  };

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        const list = (res?.data?.message || []).map((ele) => ({
          value: ele?.EmployeeID,
          label: ele?.EmployeeName,
        }));
        setProEmployee(list);
      })
      .catch((err) => console.log(err));
  };

  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "ResultEntryRadiology",
        pageName: "ResultEntryRadiology",
        EmployeeId: EmployeeID?.toString() || "",
        employeeId: EmployeeID?.toString() || "",
        EmployeeID: EmployeeID?.toString() || "",
      })
      .then((res) => {
        setColumnConfig(res?.data?.message || []);
      })
      .catch(() => setColumnConfig([]));
  };

  const fetchTransferCentres = async () => {
    try {
      const res = await axiosInstance.get("CommonController/BindTestCentreList");
      const list = (res?.data?.message || []).map((item) => ({
        label: item?.Centre,
        value: item?.CentreID,
      }));
      setTransferCentres(list);
    } catch (err) {
      console.log(err);
    }
  };

  const getRateTypeDropdown = (centreID = 0) => {
    setRateTypeLoading(true);
    axiosInstance
      .post(apiUrls.BindRateTypeDropdown, {
        centreID: centreID || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
      })
      .then((res) => {
        const list = (res?.data?.message || []).map((ele) => ({
          value: ele?.RateTypeID,
          label: ele?.RateTypeName,
        }));
        setRateTypes(list);
      })
      .catch((err) => console.log(err))
      .finally(() => setRateTypeLoading(false));
  };

  const getRemarks = () => {
    axiosInstance
      .post("Global/getGlobalData", { type: "LabRemarks" })
      .then((res) => {
        const message = res?.data?.message || [];
        if (!Array.isArray(message)) {
          setRemarkOptions([]);
          return;
        }
        setRemarkOptions([
          { label: "Select Lab Remark", value: "" },
          { label: "Others", value: "others" },
          ...message.map((item) => ({
            label: item.FieldDisplay,
            value: item.FieldID,
          })),
        ]);
      })
      .catch((err) => console.log(err));
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("");
    }
  };

  const handleReactSelectChangeBoy = (name, option) => {
    setCollectionBoy(option?.value);
  };

  const handleProEmployeeChange = (name, option) => {
    setState((prev) => ({ ...prev, [name]: option?.value }));
  };

  const filterStatusWise = (sampStatus) => {
    setPayload((prev) => ({ ...prev, SampleStatus: sampStatus }));
    TableData(sampStatus);
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

      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    getMachines();
    getProEmployee();
    getRateTypeDropdown();
    controllerDynamic();
    fetchTransferCentres();
    getRemarks();
    getCollectionBoy(setCollectionBoyList);
    getFilterResultOption();
  }, []);

  const DepartmentWiseItemList = (id, testName = "") => {
    axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: id?.toString() || "",
        TestName: testName,
      })
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        setItems(
          data.map((item) => ({
            label: item.TestName,
            value: item.InvestigationID,
          })),
        );
      })
      .catch((err) => console.log(err));
  };

  const searchTest = (event) => {
    DepartmentWiseItemList(payload?.DepartmentID, event.query);
  };

  const getFormattedDate = (d) => moment(d).format("MM/DD/YYYY");

  const TableData = (status = payload?.SampleStatus, page = 1, size = pageSize) => {
    setLoading(true);
    axiosInstance
      .post("RediologyResultEntry/PatientSearch", {
        FromDate: getFormattedDate(payload?.FromDate),
        ToDate: getFormattedDate(payload?.ToDate),
        testCentreId: 0,
        // DepartmentData's options come from Department/getDepartment, where DepartmentID is a raw
        // numeric DB column - Dapper returns it as a number, so payload.DepartmentID ends up numeric
        // once a department is selected. The backend's PatientSearchRequest.DepartmentId is typed
        // string?, and System.Text.Json rejects a bare JSON number for a string field (400: "The JSON
        // value could not be converted to System.String"), so this must always be sent as a string.
        DepartmentId:
          payload?.DepartmentID !== undefined && payload?.DepartmentID !== null
            ? String(payload.DepartmentID)
            : "",
        CentreId: payload?.CentreID ? [payload?.CentreID] : [],
        RateTypeID: [],
        InvestigationId: payload?.TestName?.value?.toString() || "",
        SearchType: payload?.SelectTypes || "",
        SearchValue: payload?.ItemValue?.trim() || "",
        SampleStatus: status,
        FromTime: payload?.FromTime,
        ToTime: payload?.ToTime,
        ProEmployeeID: Number(payload?.ProEmployeeID || 0),
        pageNumber: Number(page),
        pageSize: Number(size),
        IsTat: Number(payload?.IsTat),
        IsUrgent: payload?.IsUrgent ? 1 : 0,
        DateTypeSearch: "Date",
      })
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        const withIndex = data.map((ele, index) => ({
          ...ele,
          currentIndex: index,
        }));
        setReData(withIndex);
        setTotalCount(res?.data?.data?.totalRecords || data.length || 0);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((err) => {
        setReData([]);
        setTotalCount(0);
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleChange = (e) => {
    const { name, value: val, checked, type } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : val,
    }));
  };

  const dateSelect = (val, name) => {
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  const handleTime = (time, name) => {
    setPayload((prev) => ({ ...prev, [name]: time }));
  };

  const handleReactSelectChange = (name, option) => {
    if (name === "CentreID") {
      setPayload((prev) => ({ ...prev, CentreID: option?.value ?? "", RateTypeID: "" }));
      getRateTypeDropdown(option?.value);
      return;
    }
    if (name === "DepartmentID") {
      // TestName options (and the InvestigationId behind them) are scoped to a department
      // (see DepartmentWiseItemList/searchTest). Without clearing it here, switching the
      // department while a test from the previously selected department is still chosen keeps
      // sending that stale InvestigationId, which never matches the newly selected department -
      // so results silently come back empty and the department filter looks broken.
      setValue("");
      setPayload((prev) => ({ ...prev, DepartmentID: option?.value ?? "", TestName: "" }));
      return;
    }
    setPayload((prev) => ({ ...prev, [name]: option?.value ?? "" }));
  };

  const handleStatusChange = (name, option) => {
    setPayload((prev) => ({ ...prev, [name]: option?.value }));
    if (option?.value != -1) TableData(option?.value, 1);
  };

  const totalPatient = () => {
    const visitNos = reData.map((item) => item?.LedgerTransactionNo);
    return new Set(visitNos)?.size;
  };

  const statusCount = (key) => {
    if (key === "") return reData?.length || 0;
    return (
      reData?.filter((item) => {
        const mappedStatus =
          RADIOLOGY_RESULT_STATUS_TO_SAMPLE_STATUS[item?.RadiologyResultStatus];
        return (
          String(item?.Status) === String(key) ||
          (mappedStatus && String(mappedStatus) === String(key))
        );
      })?.length || 0
    );
  };

  const openVisit = (data, index) => {
    setSelectedVisit({ ...data, currentIndex: index });
  };

  // Patches the just-saved/approved/held/unapproved test's status straight into
  // reData so the list badge color is correct on "Back to List" without having
  // to re-run the search — matches how Laboratory/ResultEntry.jsx patches its
  // own list state (SetReData) right after a successful save.
  const updateRowStatus = ({ testID, resultStatus }) => {
    if (testID == null) return;
    setReData((prev) =>
      prev.map((row) =>
        String(row?.TestID) === String(testID)
          ? { ...row, RadiologyResultStatus: resultStatus }
          : row,
      ),
    );
  };

  const filteredReData = useMemo(() => {
    if (!searchText?.trim()) return reData;
    const s = searchText.trim().toLowerCase();
    return reData.filter((row) =>
      Object.values(row || {}).some((v) => String(v ?? "").toLowerCase().includes(s)),
    );
  }, [reData, searchText]);

  if (selectedVisit) {
    return (
      <ResultEntryRadiologyDetail
        data={selectedVisit}
        rows={filteredReData}
        onBack={() => setSelectedVisit(null)}
        onNavigate={(row) => setSelectedVisit(row)}
        onStatusUpdated={updateRowStatus}
      />
    );
  }

  return (
    <>
      <Accordion
                  name={t("Result Entry Radiology")}
                  defaultValue={true}
                  linkTo="/ResultEntryRadiology"
                  isBreadcrumb={true}
                  seconTitle={
                    <>
                      <div className="link-title-container" id="pr_id_11">
                        <div className="link-title-item">
                          {t("Total Patient") + " : " + totalPatient()}
                        </div>
                        <div className="link-title-item">
                          {t("Total Test Count") + " : " + (reData?.length || 0)}
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
                                  onChange={handleReactSelectChange}
                                />
                              </div>
                              {payload?.RemarkID === "others" && (
                                <div className="col-sm-2">
                                  <Input
                                    name="Remarks"
                                    label={t("Enter Remark")}
                                    value={payload?.Remarks}
                                    onChange={handleChange}
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
                                  onChange={handleReactSelectChange}
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
                                onChange={handleReactSelectChange}
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
                                onChange={handleReactSelectChange}
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
                                  ...DepartmentData,
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
                                  completeMethod={searchTest}
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
                        onChange={handleStatusChange}
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
                                onChange={handleStatusChange}
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
                                onChange={handleChange}
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
                                onChange={handleChange}
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
                    <div className="col-sm-1">
                      <SearchButton
                        text={"Search"}
                        href="javascript:void(0)"
                        onClick={() => TableData(payload?.SampleStatus)}
                      />
                    </div>
                  </div>
                </Accordion>

      <div className="mt-2 mb-3 px-2 py-1 bg-white d-flex align-items-center sampleStatusClass" style={{ gap: "8px" }}>
            <TableFilterDot
              slide={true}
              items={SampleStatus}
              getColor={getStatusColor}
              onSelect={(val) => filterStatusWise(val)}
              statusCount={statusCount}
              label={t("Sample Status") + " : "}
              bgColor="#e9e2e1"
              className="flex-grow-1"
            />
          </div>

      <Accordion
        title={
          <div className="d-flex">
            <span className="mt-1">{t("Search Result")}</span>
            <i
              className="fa fa-cog ml-2 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowColumnModal(true);
              }}
              title={t("Settings")}
              style={{ fontSize: "16px", cursor: "pointer" }}
            />
          </div>
        }
        seconTitle={
          <div className="ml-auto d-flex align-items-center px-2 mt-1" style={{ gap: "12px" }}>
            <div className="d-flex align-items-center" style={{ gap: "10px", fontSize: "12px" }}>
              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <i className="fa fa-male" style={{ color: "#1e88e5", fontSize: "14px" }} />
                <span>{t("Male")}</span>
              </div>
              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <i className="fa fa-female" style={{ color: "#e91e63", fontSize: "14px" }} />
                <span>{t("Female")}</span>
              </div>
              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <i className="fa bi-file-earmark-pdf text-primary" style={{ fontSize: "14px" }} />
                <span>{t("View Attachments")}</span>
              </div>
              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <img src={Urgent} className="sizeicon" />
                <span>{t("Urgent")}</span>
              </div>
              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <i className="bi bi-shield-fill-check vip-font-size mb-0" style={{ color: "#FFC107" }} />
                <span>{t("VIP Patient")}</span>
              </div>
            </div>

            <Input
              type="text"
              name="search"
              id="radiologySearch"
              placeholder={t("Search Result Entry Details...")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        }
        notOpen={true}
        defaultValue={true}
      >
        {loading ? (
          <Loading />
        ) : (
          <>
            <RERadiologyTable
              redata={filteredReData}
              openVisit={openVisit}
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
                      onChange={(name, option) => {
                        setPageSize(option?.value);
                        setCurrentPage(1);
                        TableData(payload?.SampleStatus, 1, option?.value);
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
                        TableData(payload?.SampleStatus, page, pageSize);
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
  );
};

export default ResultEntryRadiology;
