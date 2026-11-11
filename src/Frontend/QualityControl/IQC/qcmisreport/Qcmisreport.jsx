import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import QCFrameMenu from "../QCFrameMenu";
import { ViewMenu } from "../../../../components/SvgIcons";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../../../utils/utils";
import { SelectBoxWithCheckbox } from "../../../../components/formComponent/MultiSelectBox";
import CustomTable from "../../../../components/Table/CustomTable";
import ExportFile from "../../../../components/formComponent/ExportFile";
import { formatStandardDate } from "../../../../utils/helpers";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import './Qcmisreport.css';
import '../QcCommonCss.css';
import { CustomButton } from "../../../../components/UI/CustomButton";

const ReportTypeOptions = [
  { value: "1", label: "Month Wise Single Lab Report" },
  { value: "2", label: "Month Wise All Lab Report	" },
  { value: "3", label: "Day Wise Single Lab Point Report" },
  { value: "4", label: "Day Wise All Lab Point Report" },
];
const Qcmisreport = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialPayload = {
    ReportType: "1",
    Centre: "",
    MultiCentre: [],
    FromMachine: "",
    Control: "",
    Parameter: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [payload, setPayload] = useState(initialPayload);
  const [showMore, setShowMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    machineList: [],
    controlList: [],
    parameterList: [],
  });
  const [columns, setColumns] = useState([
    { header: "S.no", field: "SNo" },
    { header: "Centre", field: "Centre" },
    { header: "Department", field: "Department" },
    { header: "Control Provider", field: "ControlProvider" },
    { header: "Machine", field: "MachineName" },
    { header: "Control Name", field: "ControlName" },
    { header: "Lot Number", field: "LotNumber" },
    { header: "Lot Expiry", field: "LotExpiry" },
    // { header: "Date", field: "Date" },
    { header: "Date Range", field: "daterang" },
    { header: "Parameter Name", field: "ParameterName" },
    { header: "Type", field: "Type" },
    { header: "Level 1", field: "Level1" },
    { header: "Level 2", field: "Level2" },
    { header: "Level 3", field: "Level3" },
  ]);
  const {ShowDefaultLoginCentre} = useLocalStorage("userData", "get");
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const handleReactChange = (name, e) => {
    if (!e) return;

    const value = e.value;

    if (name === "ReportType") {
      setTableData([]);
      setPayload(prev => ({
        ...initialPayload,      
        Centre: prev.Centre,    
        MultiCentre: prev.MultiCentre, 
      }));
      if (value === "1") {
        getMachineList(payload?.Centre);
      } else if (value === "3") {
        getControlList(payload?.Centre);
      }
      
    }
    setPayload((prev) => ({ ...prev, [name]: value }));

    if (name === "Centre") {
      if (payload.ReportType === "1") {
        // For Month Wise Single Lab Report: get machines first
        getMachineList(value);
      } else if (payload.ReportType === "3") {
        // For Day Wise Single Lab Point Report: call control directly
        getControlList(value); // pass centreId
      }
      return;
    }

    if (name === "FromMachine") {
      if (payload.ReportType === "1") {
        // After selecting machine, get control list for ReportType 1
        getControlList(payload.Centre);
      }
      return;
    }

    if (name === "Control") {
      getParameterList(value); // same for both types
      return;
    }
  };

  const dateSelect = (date, name) => {
    
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSelectMultiChange = ( name,value) => {
    console.log("multicentre",value);
    setPayload({ ...payload, [name]: value });
  };

  const handleShowData = async () => {
    dispatch(setLoading(true));

    try {
      let response;

      switch (payload.ReportType) {
        case "1": // Month Wise Single Lab Report
          response = await axiosInstance.post(apiUrls.monthlyreport, {
            centreId: payload.Centre.toString(),
            machineId: payload?.FromMachine?.split("#")[0].trim() || "",
            controlId: payload.Control,
            parameterId: payload.Parameter,
            levelId: "",
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
          });
          break;

        case "2": // Month Wise All Lab Report
          response = await axiosInstance.post(apiUrls.GetMonthlyReportMonthWise, {
            labIds: payload.MultiCentre.map((c) => String(c)) || [],
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
          });
          break;

        case "3": // Day Wise Single Lab Point Report
          response = await axiosInstance.post(apiUrls.GetMonthlyReportDayWise, {
            centreId: payload.Centre.toString(),
            controlId: payload.Control,
            parameterId: payload.Parameter,
            levelId: "",
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
          });
          break;

        case "4": // Day Wise All Lab Point Report
          response = await axiosInstance.post(apiUrls.GetMonthlyReportDayWiseAll, {
            centreId: payload.MultiCentre || [],
            FromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            ToDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
          });
          break;

        default:
          notify("Invalid Report Type", "error");
          return;
      }

      const rawData = response?.data?.message;
      console.log("rawData",rawData);

      if (!rawData?.length) {
        notify("No data available", "error");
        setTableData([]);
        return;
      }

      if (!Array.isArray(rawData)) {
        notify(rawData, "warn");
        return; 
      }

      const formattedData = [];
      if (payload.ReportType === "1" || payload.ReportType === "3") {
        // Single lab reports → one row per date
        rawData.forEach((item) => {
          Object.keys(item)
            .filter((k) => k.includes("<br/>Level1"))
            .forEach((dateKey) => {
              const date = dateKey.split("<br/>")[0];
              formattedData.push({
                SNo: formattedData.length + 1,
                Centre: item.Centre || "",
                Department: item.Department || "",
                ControlProvider: item.ControlProvider || "",
                MachineName: item.MachineName || "",
                ControlName: item.ControlName || "",
                LotNumber: item.LotNumber || "",
                LotExpiry: item.LotExpiry || "",
                Date: date,
                daterang: item.daterang,
                ParameterName: item.ParameterName || "",
                Type: item.Type || "",
                Level1: item[`${date}<br/>Level1`] || 0,
                Level2: item[`${date}<br/>Level2`] || 0,
                Level3: item[`${date}<br/>Level3`] || 0,
              });
            });
        });
      } else if (payload.ReportType === "2") {
        rawData.forEach((item, index) => {
          const type = item.Type;
          const dateRange = item.daterang;
          const parameter = item.ParameterName;

          Object.keys(item)
            .filter((key) => key.includes("<br/>Level"))
            .forEach((key) => {
              const parts = key.split("<br/>");
              if (parts.length < 3) return;

              const centreName = parts[0]; // e.g. "HEAD OFFICE"
              const month = parts[1]; // e.g. "Oct"
              const level = parts[2].replace("Level", ""); // "1", "2", "3"

              // Find or create a row
              let row = formattedData.find(
                (r) =>
                  r.Centre === centreName &&
                  r.ControlProvider === item.ControlProvider &&
                  r.Department === item.Department &&
                  r.MachineName === item.MachineName &&
                  r.ControlName === item.ControlName &&
                  r.ParameterName === parameter &&
                  r.Month === month &&
                  r.Type === type,
              );

              if (!row) {
                row = {
                  Centre: centreName,
                  Department: item.Department || "",
                  ControlProvider: item.ControlProvider || "",
                  MachineName: item.MachineName || "",
                  ControlName: item.ControlName || "",
                  LotNumber: item.LotNumber || "",
                  LotExpiry: item.LotExpiry || "",
                  Month: month,
                  daterang: dateRange,
                  ParameterName: parameter,
                  Type: type,
                  Level1: "",
                  Level2: "",
                  Level3: "",
                  _order: index, // keep original API order
                };
                formattedData.push(row);
              }

              row[`Level${level}`] = item[key] ?? "";
            });
        });

        // Sort: keep order of Type as in API, but group by key fields
        formattedData.sort((a, b) => {
          if (a.Centre !== b.Centre) return a.Centre.localeCompare(b.Centre);
          if (a.ControlProvider !== b.ControlProvider)
            return a.ControlProvider.localeCompare(b.ControlProvider);
          if (a.Department !== b.Department)
            return a.Department.localeCompare(b.Department);
          if (a.MachineName !== b.MachineName)
            return a.MachineName.localeCompare(b.MachineName);
          if (a.ControlName !== b.ControlName)
            return a.ControlName.localeCompare(b.ControlName);
          if (a.ParameterName !== b.ParameterName)
            return a.ParameterName.localeCompare(b.ParameterName);
          if (a.Month !== b.Month) return a.Month.localeCompare(b.Month);
          return a._order - b._order; // preserve API Type order
        });

        // Assign S.No only once per group
        const groupedData = [];
        let serial = 0;
        let currentGroup = "";

        formattedData?.forEach((row) => {
          const groupKey = `${row.Centre}-${row.ControlProvider}-${row.Department}-${row.MachineName}-${row.ControlName}-${row.Month}-${row.ParameterName}`;
          if (groupKey !== currentGroup) {
            serial++;
            currentGroup = groupKey;
            row.SNo = serial; // show S.No only for first row of group
            row._isGroupedChild = false;
          } else {
            row.SNo = ""; // blank for grouped rows
            row.Centre = "";
            row.ControlProvider = "";
            row.Department = "";
            row.MachineName = "";
            row.ControlName = "";
            row.LotNumber = "";
            row.LotExpiry = "";
            row.Month = "";
            row.daterang = "";
            row.ParameterName = "";
            row._isGroupedChild = true;
          }
          groupedData.push(row);
        });
      } 
      else if (payload.ReportType === "4") {
        rawData.forEach((item, index) => {
          const type = item?.Type;

          // find all keys like "Centre5757_01-Oct_Level1"
          Object.keys(item)
            .filter((k) => /^Centre\d+_\d{2}-[A-Za-z]{3}_Level\d$/.test(k))
            .forEach((k) => {
              console.log("item",k);
              const match = k.match(
                /^Centre(\d+)_(\d{2}-[A-Za-z]{3})_Level(\d)$/,
              );
              console.log("match",match);
              if (!match) return;

              const centreId = match[1];
              const date = match[2];
              const level = match[3];
              console.log("centreId",centreId,date,level);

              // Find or create grouped row for same date and type
              let row = formattedData?.find(
                (r) =>
                  r.CentreId === centreId &&
                  r.Department === item.Department &&
                  r.ControlProvider === item.ControlProvider &&
                  r.MachineName === item.MachineName &&
                  r.ControlName === item.ControlName &&
                  r.ParameterName === item.ParameterName &&
                  r.Date === date &&
                  r.Type === type,
              );

              console.log("row",!row,index);

              if (!row) {
                row = {
                  CentreId: centreId,
                  Centre: `Centre ${centreId}` || "",
                  // Centre:
                  //   payload.MultiCentre?.find(
                  //     (c) => c.code.toString() === centreId,
                  //   )?.name || `Centre ${centreId}`,
                  Department: item.Department || "",
                  ControlProvider: item.ControlProvider || "",
                  MachineName: item.MachineName || "",
                  ControlName: item.ControlName || "",
                  LotNumber: item.LotNumber || "",
                  LotExpiry: item.LotExpiry || "",
                  Date: date || "",
                  daterang: item.daterang || "",
                  ParameterName: item.ParameterName || "",
                  Type: type || "",
                  Level1: "",
                  Level2: "",
                  Level3: "",
                  _order: index, 
                };
                console.log("finalrow1",row);
                formattedData.push(row);
              }

              console.log("finalrow",row);

              // Assign level values
              row[`Level${level}`] = item[k] ?? "";
            });
        });

        // Sort for stable grouping
        formattedData.sort((a, b) => {
          if (a.Centre !== b.Centre) return a.Centre.localeCompare(b.Centre);
          if (a.ControlProvider !== b.ControlProvider)
            return a.ControlProvider.localeCompare(b.ControlProvider);
          if (a.Department !== b.Department)
            return a.Department.localeCompare(b.Department);
          if (a.MachineName !== b.MachineName)
            return a.MachineName.localeCompare(b.MachineName);
          if (a.ControlName !== b.ControlName)
            return a.ControlName.localeCompare(b.ControlName);
          if (a.ParameterName !== b.ParameterName)
            return a.ParameterName.localeCompare(b.ParameterName);
          if (a.Date !== b.Date) return a.Date.localeCompare(b.Date);
          return a._order - b._order;
        });

        // Assign S.No (only for first row of each grouped data)
        const groupedData = [];
        let serial = 0;
        let currentGroup = "";

        formattedData.forEach((row) => {
          const groupKey = `${row.Centre}-${row.ControlProvider}-${row.Department}-${row.MachineName}-${row.ControlName}-${row.ParameterName}-${row.Date}`;
          if (groupKey !== currentGroup) {
            serial++;
            currentGroup = groupKey;
            row.SNo = serial; // only first row of group
            row._isGroupedChild = false;
          } else {
            row.SNo = "";
            row.Centre = "";
            row.ControlProvider = "";
            row.Department = "";
            row.MachineName = "";
            row.ControlName = "";
            row.LotNumber = "";
            row.LotExpiry = "";
            row.ParameterName = "";
            row.Date = "";
            row.daterang = "";
            row._isGroupedChild = true;
          }
          groupedData.push(row);
        });
      }
      // setColumns(newColumns);
      setTableData(formattedData);
    } catch (error) {
      notify(error?.data?.message || "Something went wrong", "error");
    } finally {
      dispatch(setLoading(false));
    }
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
          setPayload((prev) => ({ ...prev, Centre: DefaultCentre ?? resList?.[0]?.value, MultiCentre: [DefaultCentre ?? resList?.[0]?.value] }));
          if (payload.ReportType === "1") {
            getMachineList(DefaultCentre ?? resList?.[0]?.value);
          } else if (payload.ReportType === "3") {
            getControlList(DefaultCentre ?? resList?.[0]?.value); 
          }
        }
        else{
          setPayload((prev) => ({ ...prev, Centre: resList?.[0]?.value, MultiCentre: [resList?.[0]?.value] }));
          if (payload.ReportType === "1") {
            getMachineList(resList?.[0]?.value);
          } else if (payload.ReportType === "3") {
            getControlList(resList?.[0]?.value); 
          }
        }
        // setPayload((prev) => ({ ...prev, Centre: resList?.[0]?.value }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getMachineList = async (centreId) => {
    setDropdownlist((prev) => ({ ...prev, machineList: [] }));
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindQCMISMachine, {
        centreId: centreId.toString(),
      })
      .then((res) => {
        console.log("res..........", res);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.MachineName,
          value: item?.MacID,
        }));
        setDropdownlist((prev) => ({ ...prev, machineList: resList }));
        // setPayload((prev) => ({ ...prev, FromMachine: resList?.[0]?.label }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getControlList = async (centreID) => {
    setDropdownlist((prev) => ({ ...prev, controlList: [] }));
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindQCMIScontrol, {
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

  const getParameterList = async (controlId) => {
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindQCMISParameter, {
        centreId: payload.Centre.toString(),
        controlId: controlId,
      })
      .then((res) => {
        console.log("res..........", res);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.labObservation_Name,
          value: item?.labObservation_ID,
        }));
        setDropdownlist((prev) => ({ ...prev, parameterList: resList }));
        // setPayload((prev) => ({ ...prev, Parameter: resList?.[0]?.label }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  useEffect(() => {
    getAllCentre();
  }, []);
  console.log("payload", payload);
  console.log("tableData", tableData);
  console.log("showdefault",ShowDefaultLoginCentre,DefaultCentre);

  return (
    <>
      {showMore && <QCFrameMenu />}
      <div className="card">
        <Heading
          name={"QC Monthly MIS Report"}
          isBreadcrumb={"true"}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <div className="row p-2 d-flex justify-content-left">
          <ReactSelect
            name="ReportType"
            id="ReportType"
            removeIsClearable={true}
            dynamicOptions={ReportTypeOptions}
            placeholderName="Report Type"
            value={payload?.ReportType}
            onChange={handleReactChange}
            respclass={"col-xl-3 col-xs- 6 col-sm-3 col-lg-3 col-12"}
            isShowBorder={true}
          />
        </div>
      </div>
      <div className="card">
        <div className="row p-2">
          {(payload?.ReportType === "1" || payload?.ReportType === "3") && (
            <ReactSelect
              name="Centre"
              id="Centre"
              removeIsClearable={true}
              dynamicOptions={dropdownlist.centreList}
              placeholderName="Centre"
              value={payload?.Centre}
              onChange={handleReactChange}
              respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 col-12"}
              isShowBorder={true}
            />
          )}
          {(payload?.ReportType === "2" || payload?.ReportType === "4") && (
            <div className="col-xl-2 col-sm-3 col-md-3 col-lg-2 col-12">
              <MultiSelectComp
                            name="MultiCentre"
                            className="required-fields"
                            placeholder=" "
                            label={t("Centre")}
                            onChange={handleSelectMultiChange}
                            options={dropdownlist.centreList}
                            value={payload?.MultiCentre}
                          />
              </div>
          )}
          {payload?.ReportType === "1" && (
            <ReactSelect
              name="FromMachine"
              id="FromMachine"
              removeIsClearable={true}
              dynamicOptions={dropdownlist.machineList}
              placeholderName="From Machine"
              value={payload?.FromMachine}
              onChange={handleReactChange}
              respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 col-12"}
              isShowBorder={true}
            />
          )}
          {(payload?.ReportType === "1" || payload?.ReportType === "3") && (
            <>
              <ReactSelect
                name="Control"
                id="Control"
                removeIsClearable={true}
                dynamicOptions={dropdownlist.controlList}
                placeholderName="Control/Lot Number"
                value={payload?.Control}
                onChange={handleReactChange}
                respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 col-12"}
                isShowBorder={true}
              />
              <ReactSelect
                name="Parameter"
                id="Parameter"
                removeIsClearable={true}
                dynamicOptions={dropdownlist.parameterList}
                placeholderName="Parameter"
                value={payload?.Parameter}
                onChange={handleReactChange}
                respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 col-12"}
                isShowBorder={true}
              />
            </>
          )}
          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 col-12"}
          />
          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            minDate={payload?.FromDate}
            maxDate={new Date()}
            placeholder=""
            lable={t("To Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 col-12"}
          />         
            <CustomButton text="Show Data" className="mx-2 mb-1" icon="eye" onClick={handleShowData} />         
            {tableData.length > 0 && (
              <ExportFile dataExcel={tableData} className="mx-2 mb-1"/>
            )}         
        </div>
          <Heading
          title={"MIS Report"}
        />
        <div className="row">
          <div className="col-sm-12">
            <CustomTable columns={columns} data={tableData} 
              rowClassName={(row) =>
                row._isGroupedChild ? "grouped-child-row" : "grouped-parent-row"
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Qcmisreport;
