import React, { useEffect, useState } from "react";
import { ViewMenu } from "../../../components/SvgIcons";
import CashFlowFrameMenu from "../CashFlowFrameMenu";
import Heading from "../../../components/UI/Heading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import DatePicker from "../../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiEndpoints";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import moment from "moment";
// import { exportToExcel } from "../../../utils/helpers";
import { ExportToExcel } from '../../../utils/helpers';
import { toast } from "react-toastify";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";

const CashBalanceReportDateWise = () => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const [showMore, setShowMore] = React.useState(false);
  const initialState = {
    ReportType: "1",
    Type: [],
    Centre: [],
    Employee: [],
    FromDate: new Date(),
    ToDate: new Date(),
    EmployeeStatus: "1",
    ReceiveCashFrom: "1",
  };
  const [payload, setPayload] = React.useState(initialState);
  const [tableData, setTableData] = useState([]);
  const [dropdownlist, setDropdownlist] = useState({
    centretypelist: [],
    centrelist: [],
    employeelist: [],
  });
  const handleSelectChange = (name, value) => {
    if (name === "ReportType") {
      setPayload((prev) => ({
        ...initialState,
        [name]: value?.value,
      }));
      fetchAllCenter("");
      getEmployee("");
    } else {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    }
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const EmployeeStatusZoneOption = [
    { label: "Both", value: "0" },
    { label: "Active", value: "1" },
    { label: "Inactive", value: "2" },
  ];
  const ReportTypeOption = [
    { label: "Cash Balance Report Date Wise", value: "1" },
    { label: "Cash InHand Report", value: "2" },
    { label: "Cash Transfer Pending Detail Report", value: "3" },
  ];
  const ReceiveCashFromOption = [
    { label: "User", value: "1" },
    { label: "Field Boy", value: "2" },
    { label: "Bank", value: "3" },
  ];
  const GetCashReports = async (type) => {
    if (!payload?.ReceiveCashFrom) {
      toast.error("ReceiveCashFrom Type is Required");
      return;
    }
    if (payload?.Centre?.length < 1) {
      toast.error("Centre is Required");
      return;
    }
    if (payload?.Employee?.length < 1) {
      toast.error("Employee is Required");
      return;
    }
 const toIdCsv = (arr) =>
  Array.isArray(arr)
    ? arr.join(",")
    : "";

    const fromDateStr = moment(payload?.FromDate).format("YYYY-MM-DD");
    const toDateStr = moment(payload?.ToDate).format("YYYY-MM-DD");
    await axiosInstance
      .post(apiUrls?.Fetchprocedure, {
        typeName: "CashFlow_SearchReport",
        params: [
          String(type),
          payload?.ReportType === "2" || payload?.ReportType === "3"
            ? String(payload?.ReceiveCashFrom)
            : toIdCsv(payload?.Type) || "0",
          toIdCsv(payload?.Employee) || "0",
          toIdCsv(payload?.Centre) || "0",
          `${fromDateStr}T00:00:00`,
          `${toDateStr}T23:59:59`,
        ],
      })
      .then((res) => {
        if (!Array.isArray(res?.data?.data)) {
          notify("Internal error occured", "error");
          return;
        }
        setTableData(res?.data?.data);
        handleExcelDownload(res?.data?.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleExcelDownload = (tableData) => {
    ExportToExcel(tableData, "Search Item Master Details");
  };
  const GetCashtransferToList = async (type) => {
    await axiosInstance
      .post(apiUrls?.Fetchprocedure, {
        typeName: "global_CentreTypeMaster",
        params: ["CentreTypeMasterSearch"],
      })
      .then((res) => {
        if (!Array.isArray(res?.data?.data)) {
          notify("Internal error occured", "error");
          return;
        }
        setDropdownlist((prev) => ({
          ...prev,
          centretypelist: res?.data?.data?.map((roleList) => ({
            label: roleList?.CentreTypeName,
            value: String(roleList?.CentreTypeID),
          })),
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchAllCenter = async (type) => {
    await axiosInstance
      .post(apiUrls?.Fetchprocedure, {
        typeName: "global_CentreMaster",
        params: ["CentreMasterDropdown", String(userData?.DefaultCentre), type],
      })
      .then((res) => {
        if (!Array.isArray(res?.data?.data)) {
          notify("Internal error occured", "error");
          return;
        }
        setDropdownlist((prev) => ({
          ...prev,
          centrelist: res?.data?.data?.map((ele) => ({
            label: ele?.Centre,
            value: ele?.CentreID,
          })),
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getEmployee = async (type) => {
    await axiosInstance
      .post(apiUrls?.Fetchprocedure, {
        typeName: "CashFlow_BindEmployee",
        params: [String(type)],
      })
      .then((res) => {
        if (!Array.isArray(res?.data?.data)) {
          notify("Internal error occured", "error");
          return;
        }
        setDropdownlist((prev) => ({
          ...prev,
          employeelist: res?.data?.data?.map((ele) => ({
            label: ele?.Name,
            value: ele?.EmployeeID,
          })),
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    GetCashtransferToList();
  }, []);
  const toIdCsv = (arr) =>
    Array.isArray(arr)
      ? arr
          .map((o) => o?.code)
          .filter(Boolean)
          .join(",")
      : "";

  const handleSelectMultiChange = (name, selectedArray) => {
    if (name === "Type") {
      setPayload((prev) => ({ ...prev, [name]: selectedArray }));
      const zoneCsv = toIdCsv(selectedArray);
      fetchAllCenter(zoneCsv);
      return;
    } else  if (name === "Centre") {
    console.log("Selected Centre IDs Array:", selectedArray);

    const centreID = selectedArray.join(",");
    console.log("Selected Centre CSV:", centreID);

    setPayload(prev => ({
      ...prev,
      Centre: selectedArray,
      Employee: [] 
    }));

    getEmployee(centreID);
  } else if (name === "Employee") {
      const empCsv = toIdCsv(selectedArray || []);
      setPayload((prev) => ({ ...prev, [name]: selectedArray }));
      //  fetchAllCenter(empCsv);
    }
  };

  useEffect(() => {
    fetchAllCenter("");
  }, []);
  return (
    <>
      {showMore && <CashFlowFrameMenu />}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          GetCashReports(payload?.ReportType);
        }}
      >
        <div className="card">
          <Heading
            name={"Cash Balance Report Date Wise"}
            isBreadcrumb={true}
            secondTitle={
              <>
                <label onClick={() => setShowMore((prev) => !prev)}>
                  <ViewMenu />
                </label>
              </>
            }
          />
          <div className="row px-2 pt-2">
            <ReactSelect
              name="ReportType"
              id="ReportType"
              removeIsClearable={true}
              dynamicOptions={ReportTypeOption}
              placeholderName="Report Type"
              value={payload?.ReportType}
              onChange={handleSelectChange}
              respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
            />
          </div>
          <div className="row px-2 pt-1">
            {(payload?.ReportType === "2" || payload?.ReportType === "3") && (
              <ReactSelect
                name="ReceiveCashFrom"
                id="ReceiveCashFrom"
                removeIsClearable={true}
                dynamicOptions={ReceiveCashFromOption}
                placeholderName="Receive Cash From"
                value={payload?.ReceiveCashFrom}
                onChange={handleSelectChange}
                className={"required-fields"}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
            )}
            {payload?.ReportType === "1" && (
              <>
                {/* <ReactSelect
                name="BusinessZone"
                id="BusinessZone"
                removeIsClearable={true}
                // dynamicOptions={BusinessZoneOption}
                placeholderName="Business Zone"
                value={payload?.BusinessZone}
                onChange={handleSelectChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <ReactSelect
                name="State"
                id="State"
                removeIsClearable={true}
                // dynamicOptions={StateZoneOption}
                placeholderName="State"
                value={payload?.State}
                onChange={handleSelectChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              /> */}
             {/* <div className="col-sm-3 col-md-2">
              <MultiSelectComp
                placeholderName="Field Boy"
                name="Type"
                value={payload?.Type} // expects values.FieldBoy to be an ARRAY
                 label="Type"
                // setValues={setPayload}
                // labelKey="label"
                // valueKey="value"
                options={dropdownlist?.centretypelist}
                // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                onChange={handleSelectMultiChange}
                // requiredClassName={"required-fields"}
              />
              </div> */}
                {/* <MultiSelctItems
                  placeholderName="Type"
                  name="Type"
                  values={payload}
                  setValues={setPayload}
                  dynamicOptions={dropdownlist?.centretypelist}
                  labelKey="label"
                  valueKey="value"
                  requiredClassName={"required-fields"}
                  respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                  handleChange={handleSelectMultiChange}
                /> */}
              </>
            )}
      <div className="col-sm-3 col-md-2">
              <MultiSelectComp
                placeholderName="Centre"
                name="Centre"
                value={payload?.Centre} // expects values.FieldBoy to be an ARRAY
                 label="Centre"
                // setValues={setPayload}
                // labelKey="label"
                // valueKey="value"
                options={dropdownlist?.centrelist}
                // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                onChange={handleSelectMultiChange}
                // requiredClassName={"required-fields"}
              />
              </div>

            {/* <MultiSelctItems
              placeholderName="Centre"
              name="Centre"
              values={payload}
              setValues={setPayload}
              dynamicOptions={dropdownlist?.centrelist}
              labelKey="label"
              valueKey="value"
              respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              handleChange={handleSelectMultiChange}
              requiredClassName={"required-fields"}
            /> */}


                  <div className="col-sm-3 col-md-2">
              <MultiSelectComp
                placeholderName="Employee"
                name="Employee"
                value={payload?.Employee} // expects values.FieldBoy to be an ARRAY
                 label="Employee"
                // setValues={setPayload}
                // labelKey="label"
                // valueKey="value"
                options={dropdownlist?.employeelist}
                // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                onChange={handleSelectMultiChange}
                // requiredClassName={"required-fields"}
              />
              </div>
            {/* <MultiSelctItems
              placeholderName="Employee"
              name="Employee"
              values={payload}
              setValues={setPayload}
              dynamicOptions={dropdownlist?.employeelist}
              labelKey="label"
              valueKey="value"
              respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              handleChange={handleSelectMultiChange}
              requiredClassName={"required-fields"}
            /> */}
            {payload?.ReportType === "1" && (
              <>
                <DatePicker
                  name="FromDate"
                  id="FromDate"
                  value={payload?.FromDate}
                  onChange={dateSelect}
                  maxDate={new Date()}
                  placeholder=""
                  lable={t("From Date")}
                  className="custom-calendar"
                  respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                />
                <DatePicker
                  name="ToDate"
                  id="ToDate"
                  value={payload?.ToDate}
                  onChange={dateSelect}
                  maxDate={new Date()}
                  placeholder=""
                  lable={t("To Date")}
                  className="custom-calendar"
                  respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                />
                {/* <ReactSelect
                  name="EmployeeStatus"
                  id="EmployeeStatus"
                  removeIsClearable={true}
                  dynamicOptions={EmployeeStatusZoneOption}
                  placeholderName="EmployeeStatus"
                  value={payload?.EmployeeStatus}
                  onChange={handleSelectChange}
                  respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                /> */}
              </>
            )}
            <div className="col-sm-1 mb-2">
              <Button
                classNamse="rounded py-0"
                // className={`rounded py-0 ml-2 ${
                //   tableData?.length > 0
                //     ? "bg-green hover:bg-green"
                //     : "bg-red cursor-not-allowed disButton"
                // }`}
                type="submit"
                // disabled={tableData?.length > 0 ? false : true}
              >
                Report
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default CashBalanceReportDateWise;
