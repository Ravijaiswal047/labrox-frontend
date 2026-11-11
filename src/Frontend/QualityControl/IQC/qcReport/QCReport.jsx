import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import Heading from "../../../../components/UI/Heading";
import { PlusIcon, ViewMenu } from "../../../../components/SvgIcons";
import { FaPlus, FaTimes } from "react-icons/fa";
import QCFrameMenu from "../QCFrameMenu";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import AddReading from "./AddReading";
import Modal from "../../../../components/ModalComponent/Modal";
import QCModalForm from "./QCModalForm";
import ActionModal from "./ActionModel";
import AddRemark from "./AddRemark";
import AddChecklist from "./AddChecklist";
import ExportFile from "../../../../components/formComponent/ExportFile";
import { ExportToExcel, formatStandardDate, number } from "../../../../utils/helpers";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../../../components/UI/CustomButton";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import QCLjChart from "./QCLjChart";
// import '../QcCommonCss.css';

const QCReport = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialState = {
    Centre: "",
    Machine: "",
    Control: "",
    Parameter: "",
    Level: "",
    FromDate: new Date(),
    ToDate: new Date(),
    ControlName: "",
    ParameterName: "",
    LotNumber: "",
    Sinno: "",
    LevelName: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [excelData, setExcelData] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [rawTableData, setRawTableData] = useState([]);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rowToApprove, setRowToApprove] = useState(null);
  const [showLJChart,setShowLJChart] = useState(false);
  const [showTableData, setShowTableData] = useState(false);
  const [LJChartData, setLJChartData] = useState({
    readings: "",
    mean: "",
    sd: "",
  })
  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    machineList: [],
    controlList: [],
    parameterList: [],
    levelList: [],
  });
  const [handleModelData, setHandleModelData] = useState({});
  const [actionType, setActionType] = useState(null); // RCA | Corrective | Preventive
  const [showActionModal, setShowActionModal] = useState(false);
  const [nextStep, setNextStep] = useState(false); // for "continue"
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [secondModal, setSecondModal] = useState("");
  const { ShowDefaultLoginCentre } = useLocalStorage("userData", "get");
  // console.log("AccessRight",AccessRight);
  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = accessRightStr ? accessRightStr?.split(",").filter(Boolean) : [];

  const hasAccess18 = accessRight?.includes("31");
  const hasAccessToAddReading = accessRight?.includes("34");
  console.log("hasAccessToAddReading",hasAccessToAddReading)
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const colorsCodingData = [
    { color: "#ffe58f", id: "7", labelKey: "Not Approved" },
    { color: "#90EE90", id: "8", labelKey: "Approved" },
  ];

  const handleDeleteRecord = async (reason) => {
    const payload = {
      id: rowToDelete.id.toString(),
      reason,
      status: rowToDelete.ShowInQC.toString(),
    };

    try {
      dispatch(setLoading(true));
      const res = await axiosInstance.post(apiUrls.RemoveFromQc, payload);

      if (res?.data?.success) {
        notify("Record deleted successfully!", "success");
        setTableData((prev) => prev.filter((row) => row.id !== rowToDelete.id));
        setRowToDelete(null);
      } else {
        notify(res?.data?.message || "Failed to delete", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error deleting record", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleApproveRecord = async (comment) => {

    const payload = {
      id: rowToApprove.id.toString(),
      approvalRemark: comment,
    };

    try {
      dispatch(setLoading(true));
      const res = await axiosInstance.post(apiUrls?.ApproveReading, payload);

      if (res?.data?.success) {
        notify(res?.data?.message, "success");
        setTableData((prev) =>
          prev.map((row) =>
            row.id === rowToApprove.id
              ? { ...row, approved: res?.data?.data?.approvedBy || "" }
              : row,
          ),
        );
        setRowToApprove(null);
        handleShowReading();
      } else {
        notify(res?.data?.message || "Approval failed", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error approving record", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleModel = (label, width, type, isOpen, Component, extrabutton) => {
    setHandleModelData({
      label,
      width,
      type,
      isOpen,
      Component,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
  };

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };

  const handleSelectChange = (name, e) => {
    if (!e) return;

    const value = e.value;
    setPayload((prev) => ({ ...prev, [name]: value }));

    if (name === "Centre") {
      getMachineList(value);
      getControlList(value);
      return;
    } else if (name === "Control") {
      setPayload((prev) => ({ ...prev, ControlName: (e?.label)?.split('#')?.[0].trim(), LotNumber: (e?.label)?.split('#')?.[1].trim() }));
      getParameterList(value);
      return;
    } else if (name === "Parameter") {
      setPayload((prev) => ({ ...prev, ParameterName: e?.label }));
      getLevelList(value);
      return;
    }
    else if (name === "Level") {
      setPayload((prev) => ({ ...prev, LevelName: (e?.label)?.split('#')?.[0].trim(), Sinno: (e?.label)?.split('#')?.[1].trim() }));
    }
  };
  const dateSelect = (date, name) => {

    setPayload((prev) => ({
      ...prev,
      [name]: date,

    }));

  };
  const handleAdd = (type, item) => {
    setActionType(type);
    setSelectedItemId(item.id);

    // Determine the value of the type field for this row
    const fieldValue =
      type === "RCA"
        ? item.RCAType
        : type === "CorrectiveAction"
          ? item.CAType
          : item.PAType;

    setSecondModal(fieldValue);

    let modalComponent = null;

    if (fieldValue === "CheckList") {
      // Open AddChecklist modal
      console.log("Opening AddChecklist", fieldValue);
      modalComponent = (
        <AddChecklist
          type={type}
          itemId={item.id}
          onClose={() => {
            setNextStep(false);
            handleShowReading(); // ✅ refresh table
          }}
        />
      );
    } else if (fieldValue === "Comment") {
      // Open AddRemark modal with existing remark
      console.log("Opening AddRemark", fieldValue);
      const existingRemark = rawTableData.find((row) => row.id === item.id)?.[
        type === "RCA"
          ? "RCA"
          : type === "CorrectiveAction"
            ? "CorrectiveAction"
            : "PreventiveAction"
      ];

      modalComponent = (
        <AddRemark
          type={type}
          itemId={item.id}
          existingRemark={existingRemark}
          onClose={() => setNextStep(null)}
        />
      );
    } else if (fieldValue === "" && fieldValue === "") {
      // No existing action — open ActionModal for new remark
      console.log("Opening ActionModal for new remark");
      setShowActionModal(true);
      return;
    }

    // Open the modal if determined
    if (modalComponent) {
      console.log("modalComponent", modalComponent);
      setNextStep(modalComponent);
    }
  };

  const handleReset = () => {
    setPayload((prev) => ({ ...initialState, Centre: prev.Centre }));
    setDropdownlist((prev) => ({ ...prev, parameterList: [], levelList: [] }))

    // setDropdownlist({
    //   centreList: [],
    //   machineList: [],
    //   controlList: [],
    //   parameterList: [],
    //   levelList: [],
    // });
    setTableData([]);
    // setShowMore(false);
  };

  const buildApiPayload = (payload) => {
    return {
      machineId: payload?.Machine || "",
      centreId: payload?.Centre?.toString() || "",
      controlId: payload?.Control || "",
      parameterId: payload?.Parameter || "",
      levelId: payload?.Level?.toString() || "",
      fromDate: formatStandardDate(payload?.FromDate, "YYYY-MM-DD"),
      toDate: formatStandardDate(payload?.ToDate, "YYYY-MM-DD"),
    };
  };

  const handleShowReading = async () => {
    dispatch(setLoading(true));

    const searchPayload = buildApiPayload(payload);

    try {
      const res = await axiosInstance.post(apiUrls.ShowReading, searchPayload);

      if (res?.data?.success) {
        const data = res?.data?.data || [];
        setRawTableData(data);
        const formattedData = data.map((item, index) => ({
          id: item.id,
          sno: index + 1,
          "#": (
            <FaTimes
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => setRowToDelete(item)}
            />
          ),
          centreName: item.Centre || "",
          machineName: item.Machine_Id || "",
          controlDateTime: item.EntryDateTime || "",
          controlName: item.ControlName || "",
          lotNumber: item.LotNumber || "",
          slnNo: item.sinno || "",
          parameterName: item.LabObservation_Name || "",
          level: item.Level || "",

          reading: item.Reading || "",
          minValue: item.Minvalue || "",
          maxValue: item.Maxvalue || "",
          lowValue: item.LowValue || "",
          highValue: item.HighValue || "",
          labMeanValue: item.LabMeanvalue || "",
          labSDValue: item.LabSDvalue || "",
          labCV: item.LabCVPercentage || "",
          unit: item.Unit || "",
          temperature: item.Temperature || "",
          method: item.Method || "",
          rowColor: item.ApprovedByName ? "#90EE90" : "#ffe58f",
          rca: (

            <div className="remark-btn" onClick={() => handleAdd("RCA", item)}
              style={{
                backgroundColor: item.RCAType ? "green" : "darkred",
                // color: item.RCAType ? "white" : "",
                color: "white",
              }}
            >
              <FaPlus color="white" size={8} />
            </div>
          ),
          correctiveAction: (

            <div className="remark-btn" onClick={() => handleAdd("CorrectiveAction", item)}
              style={{
                backgroundColor: item.CAType ? "green" : "darkred",
                // color: item.CAType ? "white" : "",
                color: "white",
              }}
            >
              <FaPlus color="white" size={8} />
            </div>
          ),
          preventiveAction: (

            <div className="remark-btn" onClick={() => handleAdd("PreventiveAction", item)}
              style={{
                backgroundColor: item.PAType ? "green" : "darkred",
                // color: item.PAType ? "white" : "",
                color: "white",
              }}
            >
              <FaPlus color="white" size={8} />
            </div>
          ),
          approved: item.ApprovedByName ? (
            item.ApprovedByName
          ) : (
            <Button
              className="rounded py-0"
              variant="success"
              onClick={() => setRowToApprove(item)}
            >
              Approve
            </Button>
          ),
        }));

        setTableData(formattedData);
        // setShowTableData(true);
        
        // notify(res?.data?.message, "success");
      } else {
        setTableData([]);
        notify(res?.data?.message || "Failed to fetch reading data", "warn");
      }
    } catch (error) {
      console.error(error);
      notify("Error fetching reading data", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExportToExcel = async () => {
    try {
      dispatch(setLoading(true));

      const searchPayload = buildApiPayload(payload);

      const res = await axiosInstance.post(apiUrls.ShowReadingExcel, searchPayload);

      if (res?.data?.success) {
        const dataWithSrNo = res?.data?.data?.map((item, index) => ({
          SrNo: index + 1,
          ...item,
        }));
        setExcelData(dataWithSrNo);
        ExportToExcel(dataWithSrNo)
        notify(res?.data?.message, "success");
        // handleReset();
      } else {
        notify(res?.data?.message || "Failed to fetch Excel data", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Error exporting Excel", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeleteAll = async () => {
    const deletePayload = buildApiPayload(payload);

    try {
      dispatch(setLoading(true));
      const res = await axiosInstance.post(apiUrls.DeleteByCentreWise, deletePayload);

      if (res?.data?.success) {
        notify("Records deleted successfully!", "success");
        setTableData([]);
      } else {
        notify(res?.data?.message || "Failed to delete", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error deleting records", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const columns = [
    { header: "Sr.No", field: "sno" },
    { header: "Remove", field: "#" },
    { header: "Centre Name", field: "centreName" },
    { header: "Machine Name", field: "machineName" },
    { header: "ControlRun DateTime", field: "controlDateTime" },
    { header: "Control Name", field: "controlName" },
    { header: "Lot Number", field: "lotNumber" },
    { header: "SIN No", field: "slnNo" },
    { header: "Parameter Name", field: "parameterName" },
    { header: "Level", field: "level" },
    { header: "Reading", field: "reading", width: "10%" },
    { header: "Min value", field: "minValue" },
    { header: "Max value", field: "maxValue" },
    { header: "Low Value", field: "lowValue" },
    { header: "High Value", field: "highValue" },
    { header: "Lab Mean Value", field: "labMeanValue" },
    { header: "Lab SD Value", field: "labSDValue" },
    { header: "Lab CV (%)", field: "labCV" },
    { header: "Unit", field: "unit" },
    { header: "Temperature", field: "temperature" },
    { header: "Method", field: "method" },
    { header: "RCA", field: "rca" },
    { header: "Corrective Action", field: "correctiveAction" },
    { header: "Preventive Action", field: "preventiveAction" },
    { header: "Approved", field: "approved" },
  ];

  const getLabReport = async (type, isLabMean) => {
    const apiPayload = {
      machineId: payload?.Machine || "",
      labId: payload?.Centre?.toString() || "",
      controlId: payload?.Control || "",
      parameterId: payload?.Parameter || "",
      levelId: payload?.Level?.toString() || "",
      fromDate: formatStandardDate(payload?.FromDate, "YYYY-MM-DD"),
      toDate: formatStandardDate(payload?.ToDate, "YYYY-MM-DD"),
      type: type || "0",
      isLabMean: isLabMean || "0",
    }
    dispatch(setLoading(true));
    await axiosReport
      .post(apiUrls.GenerateReport,
        apiPayload,
        {
          responseType: "blob",
        }
      )
      .then(async (res) => {
        console.log("base mean report res", res);

        const blob = res?.data;

        // ✅ CASE 1: PDF exists
        if (blob?.type === "application/pdf") {
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
          return;
        }

        // ✅ CASE 2: No data (JSON response)
        if (blob?.type === "application/json") {
          const text = await blob.text();
          const data = JSON.parse(text);

          if (data?.success === false) {
            notify(data?.message, "success");
          } else {
            notify(data?.message, "success");
          }
        }

      })
      .catch((err) => {
        console.log(err?.data?.message, "error");
        // notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getAllCentre = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetCentreById)
      .then((res) => {
        console.log("res", res?.data);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.centre,
          value: item?.centreid,
        }));
        setDropdownlist((prev) => ({ ...prev, centreList: resList }));
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, Centre: DefaultCentre ?? resList?.[0]?.value }));
          getMachineList(DefaultCentre || resList?.[0]?.value || "");
          getControlList(DefaultCentre || resList?.[0]?.value || "");
        }
        else {
          setPayload((prev) => ({ ...prev, Centre: resList?.[0]?.value }));
          getMachineList(resList?.[0]?.value);
          getControlList(resList?.[0]?.value);
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getMachineList = async (centreId) => {
    // console.log("centerid..............",centreId);
    setDropdownlist((prev) => ({ ...prev, machineList: [] }));
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindReportMachine, {
        centreId: centreId.toString(),
      })
      .then((res) => {
        console.log("res..........", res);
        if (res?.data?.success) {
          const resList = res?.data?.data?.map((item) => ({
            ...item,
            label: item?.MACHINEID,
            value: item?.MACHINEID,
          }));
          setDropdownlist((prev) => ({ ...prev, machineList: resList }));
          // setPayload((prev) => ({ ...prev, Machine: resList?.[0]?.label }));
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getControlList = async (centreID) => {
    // console.log("centerid..............",centreId);
    setDropdownlist((prev) => ({ ...prev, controlList: [] }));
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindReportcontrol, {
        centreId: centreID.toString(),
      })
      .then((res) => {
        console.log("res..........", res);
        const resList = res?.data?.data?.map((item) => ({
          ...item,
          label: item?.controlname,
          value: item?.controlid,
        }));
        setDropdownlist((prev) => ({ ...prev, controlList: resList }));
        // setPayload((prev) => ({ ...prev, Control: resList?.[0]?.value }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };
  // added apiUrls.QCReportBindParameter
  const getParameterList = async (ControlId) => {
    // setDropdownlist((prev) => ({ ...prev, controlList: [] }));
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.QCReportBindParameter, {
        centreId: payload.Centre.toString() || "",
        controlId: ControlId || "",
        machineId: payload?.Machine?.toString() || "",
      })
      .then((res) => {
        console.log("res..........", res);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.LabObservation_Name,
          value: item?.LabObservation_ID,
        }));
        setDropdownlist((prev) => ({ ...prev, parameterList: resList }));
        // setPayload((prev) => ({ ...prev, Parameter: resList?.[0]?.value }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getLevelList = async (ParameterId) => {
    // console.log("centerid..............",centreId);
    // setDropdownlist((prev) => ({ ...prev, controlList: [] }));
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindLevel, {
        centreId: payload.Centre.toString(),
        controlId: payload.Control.toString(),
        labObservationId: ParameterId,
        machineId: payload.Machine,
      })
      .then((res) => {
        console.log("res..........", res);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.LEVEL,
          value: item?.levelid,
        }));
        setDropdownlist((prev) => ({ ...prev, levelList: resList }));
        // setPayload((prev) => ({ ...prev, Level : resList?.[0]?.label }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const chartData = tableData?.map((item, index) => ({
    run: index + 1,
    value: Number(item.reading),
    mean: LJChartData.mean,
    plus1SD: (LJChartData.mean + LJChartData.sd).toFixed(2),
    minus1SD: (LJChartData.mean - LJChartData.sd).toFixed(2),
    plus2SD: (LJChartData.mean + 2 * LJChartData.sd).toFixed(2),
    minus2SD: (LJChartData.mean - 2 * LJChartData.sd).toFixed(2),
    plus3SD: (LJChartData.mean + 3 * LJChartData.sd).toFixed(2),
    minus3SD: (LJChartData.mean - 3 * LJChartData.sd).toFixed(2),
  }));

  const handleLJChart = () => {
    setShowLJChart(true);
    setShowTableData(false);
    handleShowReading();
  }

  useEffect(() => {
    getAllCentre();
  }, []);

  useEffect(()=>{
    const readings = tableData?.map(item => Number(item.reading));
    const mean =
      readings.reduce((sum, v) => sum + v, 0) / readings.length;

    const sd = Math.sqrt(
      readings.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      (readings.length - 1)
    );
    setLJChartData((prev) => ({...prev, readings, mean, sd }))
  },[tableData]);

  console.log("payload", payload);
  console.log("tableData", tableData);
  console.log("rowToDelete", rowToDelete);
  console.log("selectedOption", selectedOption);
  console.log("nextStep", nextStep);
  console.log("LJChart", LJChartData);

  return (
    <>
      {showMore && <QCFrameMenu />}
      <Heading
        name={"QC Report"}
        isBreadcrumb={"true"}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      />
      <div className="row p-2 white-background">
        <ReactSelect
          name="Centre"
          id="Centre"
          removeIsClearable={true}
          dynamicOptions={dropdownlist.centreList}
          placeholderName="Centre"
          value={payload?.Centre}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
          isShowBorder={true}
        />

        <ReactSelect
          name="Machine"
          id="Machine"
          removeIsClearable={true}
          dynamicOptions={dropdownlist.machineList}
          placeholderName="Machine"
          value={payload?.Machine}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
          isShowBorder={true}
        />
        <ReactSelect
          name="Control"
          id="Control"
          removeIsClearable={true}
          dynamicOptions={dropdownlist.controlList}
          placeholderName="Control/Lot Number"
          value={payload?.Control}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
          isShowBorder={true}
        />
        <ReactSelect
          name="Parameter"
          id="Parameter"
          removeIsClearable={true}
          dynamicOptions={dropdownlist.parameterList}
          placeholderName="Parameter"
          value={payload?.Parameter}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
          isShowBorder={true}
        />
        <ReactSelect
          name="Level"
          id="Level"
          removeIsClearable={true}
          dynamicOptions={dropdownlist.levelList}
          placeholderName="Level"
          value={payload?.Level}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
          isShowBorder={true}
        />
        <DatePicker
          name="FromDate"
          id="FromDate"
          value={payload?.FromDate}
          onChange={dateSelect}
          maxDate={new Date()}
          placeholder=""
          lable={t("From Date")}
          className="custom-calendar"
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
        />
        <DatePicker
          name="ToDate"
          id="ToDate"
          value={payload?.ToDate}
          onChange={dateSelect}
          maxDate={new Date()}
          minDate={payload?.FromDate}
          placeholder=""
          lable={t("To Date")}
          className="custom-calendar"
          respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
        />
        {/* <div className="col-sm-10"> */}
        {/* <Button className="rounded py-0 mx-2 mb-1" onClick={() => getLabReport("0","0")}>Base Mean Report</Button>
            <Button className="rounded py-0 mx-2 mb-1" onClick={() => getLabReport("1","0")}>Record Mean Report</Button> 
            <Button className="rounded py-0 mx-2 mb-1" onClick={() => getLabReport("0","1")}>Lab Mean Report</Button> */}
        <CustomButton text="Base Mean Report" className="mx-2 mb-1" icon="pdf"
          onClick={() => getLabReport("0", "0")} />
        <CustomButton text="Record Mean Report" className="mx-2 mb-1" icon="pdf"
          onClick={() => getLabReport("1", "0")} />
        <CustomButton text="Lab Mean Report" className="mx-2 mb-1" icon="pdf"
          onClick={() => getLabReport("0", "1")} />

        <CustomButton text="Show Reading" className="mx-2 mb-1" icon="eye"
          onClick={() => {
            setShowTableData(true);
            setShowLJChart(false);
            handleShowReading()
          }} />
        {hasAccessToAddReading &&
          <CustomButton text="Add Reading" className="mx-2 mb-1" icon="add"
            onClick={() =>
              handleModel(
                "Add Reading",
                "50vw",
                "AddReading",
                true,
                <AddReading
                  payloadData={payload}
                  tableData={tableData}
                  onSave={(res) => {
                    setIsOpen(false);
                    handleShowReading();
                  }}
                  onCancel={() => setIsOpen(false)}
                />,
              )
            }
          />
        }

        <CustomButton text="Excel" className="mx-2 mb-1" icon="excel"
          onClick={handleExportToExcel} />
        {hasAccess18 &&
          <CustomButton text="Delete" className="mx-2 mb-1" icon="delete"
            onClick={handleDeleteAll} />
        }

        <CustomButton text="LJ Chart" className="mx-2 mb-1" 
          onClick={handleLJChart}
           />

        <CustomButton text="Reset" className="mx-2 mb-1" icon="refresh"
          onClick={handleReset} />
      </div>
      {/* </div> */}
      {/* </Accordion> */}
      <div className="card mt-2">
        <Heading
          title={t("QC Report Detail")}
          // isBreadcrumb={true}
          secondTitle={
            <>
              {colorsCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
              ))}
            </>
          }
        />
        {
        (showLJChart && tableData?.length > 0) && 
        <QCLjChart data={chartData} mean={LJChartData.mean} sd={LJChartData.sd} />
      }
      {
        showTableData &&
          <CustomTable
              columns={columns}
              data={tableData}
            //   onEdit={handleEdit}
            />
      }
        {/* <div className="row">
          <div className="col-sm-12">
            
          </div>
        </div> */}
      </div>

      

      {handleModelData?.isOpen && (
        <Modal
          visible={handleModelData?.isOpen}
          setVisible={setIsOpen}
          modalWidth={handleModelData?.width}
          Header={t(handleModelData?.label)}
          buttons={handleModelData?.extrabutton}
          modalData={handleModelData?.modalData}
          setModalData={setHandleModelData}
        >
          {handleModelData?.Component}
        </Modal>
      )}

      {rowToDelete && (
        <Modal
          visible={true}
          setVisible={() => setRowToDelete(null)}
          modalWidth="40vw"
          Header="Delete Record"
        >
          <QCModalForm
            labelText="Reason"
            confirmText="Remove from QC"
            icon="delete"
            onCancel={() => setRowToDelete(null)}
            onConfirm={handleDeleteRecord}
          />
        </Modal>
      )}

      {rowToApprove && (
        <Modal
          visible={true}
          setVisible={() => setRowToApprove(null)}
          modalWidth="40vw"
          Header="QC Approval"
        >
          <QCModalForm
            headerText="QC Approval"
            labelText="Comment"
            confirmText="Save"
            icon="save"
            onCancel={() => setRowToApprove(null)}
            onConfirm={handleApproveRecord}
          />
        </Modal>
      )}
      {showActionModal && (
        <ActionModal
          type={actionType}
          onClose={() => setShowActionModal(false)}
          onContinue={(selectedOption) => {
            setShowActionModal(false);
            setNextStep(true); // opens second popup
            setSelectedOption(selectedOption);
          }}
        />
      )}

      {nextStep && (
        <Modal
          visible={true}
          setVisible={() => setNextStep(false)}
          modalWidth="50vw"
          Header={`${actionType} - Details`}
        >
          {selectedOption === "comment" || secondModal === "Comment" ? (
            <AddRemark
              type={actionType}
              itemId={selectedItemId}
              existingRemark={
                rawTableData.find((row) => row.id === selectedItemId)?.[
                actionType === "RCA"
                  ? "RCA"
                  : actionType === "CorrectiveAction"
                    ? "CorrectiveAction"
                    : "PreventiveAction"
                ]
              }
              onClose={() => {
                handleShowReading();
                setNextStep(false);
              }}
            />
          ) : (
            <AddChecklist
              type={actionType}
              itemId={selectedItemId}
              // existingData={
              //   rawTableData.find((row) => row.id === selectedItemId)?.ChecklistType
              // }
              onClose={() => {
                handleShowReading();
                setNextStep(false);
              }}
            />
          )}
        </Modal>
      )}
    </>
  );
};

export default QCReport;
