import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import RadioInput from "../../components/formComponent/DocShareRadioInput.jsx";
import { CustomButton } from "../../components/UI/CustomButton";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import SingleLineSummeryTable from "./SearchTable/SingleLineSummeryTable";
import DipartmentwiseTable from "./SearchTable/DipartmentwiseTable";
import DetailedTable from "./SearchTable/DetailedTable";
// import { ViewMenu } from "./SearchTable/index.jsx";
import InHouseMenuList from "./InHouseMenuList";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice.js";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance.jsx";
import { useDispatch } from "react-redux";
import { notify } from "../../utils/utils.js";
import moment from "moment";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi.js";
import { toast } from "react-toastify";

const InHouseDrExport = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [showMore, setShowMore] = useState(false);
  const [doctorShareData, setDoctorShareData] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [rateType, setRateType] = useState([]);
  const [payload, setPayload] = useState({
    dateType: "",
    toDate: new Date(),
    fromDate: new Date(),
    doctor: [],
    Centre: [],
    RateType: [],
    department: [],
    approvedBy: "1",
    approvedDate: new Date(),
    billingDate: new Date(),
    reportType: "Summary",
  });

  const [dropdownlist, setDropdownList] = useState({
    doctorList: [],
    departmentList: [],
  });

  const reportList = [
    { label: "Singleline", value: "Summary" },
    { label: "Departmentwise", value: "DepartmentWise" },
    { label: "Patient", value: "Patient" },
  ];

  const dateType = [
    { label: "Approval Date", value: "ApprovedDate" },
    { label: "Billing Date", value: "BillingDate" },
  ];

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };

  const handleSelectMultiChange = (select, name) => {
    const val = select.map((ele) => {
      return ele?.value;
    });
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  const getDepartmentById = async () => {
    try {
      dispatch(setLoading(true));
      const [doctorRes, departmentRes, testRes] = await Promise.all([
        axiosInstance.post("CommonController/Fetchprocedure", {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Doctor", "0"],
        }),
        axiosInstance.post("CommonController/Fetchprocedure", {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Department", "0"],
        }),
      ]);

      const doctorListRes =
        doctorRes?.data?.data?.map((item) => ({
          label: item?.EmployeeName,
          value: item?.EmployeeID,
        })) || [];

      const departmentListRes =
        departmentRes?.data?.data?.map((item) => ({
          label: item?.Department,
          value: item?.DepartmentID,
        })) || [];

      // const TesttListRes =
      //   testRes?.data?.message?.map((item) => ({
      //     ...item,
      //     label: item?.TestName,
      //     value: String(item?.InvestigationID),
      //   })) || [];

      setDropdownList((prev) => ({
        ...prev,
        doctorList: doctorListRes,
        departmentList: departmentListRes,
        // testList: TesttListRes,
      }));
    } catch (error) {
      console.error("Error fetching doctors/departments:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getAccessDataRateReport = (setState, centerID = []) => {
    return axiosInstance
      .post("Centre/GetRateType", {
        CentreID: Array.isArray(centerID) ? centerID : [],
      })
      .then((res) => {
        const data = res?.data?.message || [];
        const options = data.map((ele) => ({
          value: ele?.RateTypeID,
          label: ele?.RateTypeName,
        }));

        setState(options);
        return options;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  const getSearchData = async (searchType) => {
    try {
      dispatch(setLoading(true));
      const getPayload = {
        reportType:    payload?.reportType,
        reportFormat:  searchType === "1" ? "PDF" : "Excel",
        dateType:      payload?.dateType,
        searchType:    searchType,
        fromDate:      moment(payload.fromDate).format("YYYY-MM-DD"),
        toDate:        moment(payload.toDate).format("YYYY-MM-DD"),
        CentreID:      payload?.Centre?.length     ? payload.Centre.map(Number)     : [],
        RateTypeID:    payload?.RateType?.length   ? payload.RateType.map(Number)   : [],
        doctorIDs:     payload?.doctor?.length     ? payload.doctor.map(Number)     : [],
        departmentIDs: payload?.department?.length ? payload.department.map(Number) : [],
      };

      const res = await axiosReport.post(
        "DoctorLedgerReport/GetReport/GetReport",
        getPayload,
        { responseType: "arraybuffer" }
      );

      if (res?.headers["content-type"]?.includes("application/json")) {
        const decoder = new TextDecoder("utf-8");
        const jsonData = JSON.parse(decoder.decode(res.data));
        if (!jsonData.success) {
          toast.error(jsonData.message);
          return;
        }
      }

      if (searchType === "1") {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        window.open(url, "_blank");
        return;
      }

      if (searchType === "2") {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "DoctorLedgerReport.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.log(err);
      notify(err?.response?.data?.message, "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (payload.Centre) {
      getAccessDataRateReport(setRateType, payload?.Centre);
    }
  }, [payload.Centre]);

  useEffect(() => {
    getDepartmentById();
    getAccessCentresReports(setCentreData);
  }, []);

  useEffect(() => {
    setDoctorShareData([]);
  }, [payload?.reportType]);

  return (
    <>
      {showMore && <InHouseMenuList />}
      <Heading
        title={"MIS InHouse Doctor Share"}
        secondTitle={
          <label onClick={() => setShowMore((prev) => !prev)}>
            {/* <ViewMenu /> */}
          </label>
        }
      />
      <div className="card px-2 py-2">
        <div className="row">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              dynamicOptions={dateType}
              defaultValue={dateType?.[0]}
              isShowBorder={true}
              name="dateType"
              lable={t("Date Type")}
              id="dateType"
              removeIsClearable={false}
              placeholderName={t("Date Type")}
              value={payload?.dateType}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              name="fromDate"
              id="fromDate"
              value={payload?.fromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              placeholder=""
              lable={t("From Date")}
              className={"w-100"}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              name="toDate"
              id="toDate"
              value={payload?.toDate}
              onChange={dateSelect}
              maxDate={new Date()}
              placeholder=""
              lable={t("From Date")}
              className={"w-100"}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              className="required-fields"
              name="Centre"
              lable={t("Centre")}
              id="Centre"
              placeholderName={t("Centre")}
              onChange={handleSelectMultiChange}
              options={CentreData}
              value={payload?.Centre}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              className="required-fields"
              name="RateType"
              lable={t("RateType")}
              id="RateType"
              placeholderName={t("RateType")}
              onChange={handleSelectMultiChange}
              options={rateType}
              value={payload?.RateType}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              className="required-fields"
              name="doctor"
              lable={t("Doctor")}
              id="doctor"
              placeholderName={t("Doctor")}
              onChange={handleSelectMultiChange}
              options={dropdownlist?.doctorList}
              value={payload?.doctor}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              className="required-fields"
              placeholder=" "
              name="department"
              lable={t("Department")}
              id="department"
              onChange={handleSelectMultiChange}
              options={dropdownlist?.departmentList}
              value={payload?.department}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              dynamicOptions={reportList}
              isShowBorder={true}
              name="reportType"
              lable={t("Report Type")}
              id="reportType"
              removeIsClearable={false}
              placeholderName={t("Report Type")}
              value={payload?.reportType}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1 d-flex align-items-start mb-2" style={{ gap: "6px" }}>
            <CustomButton
              text={t("PDF")}
              icon="pdf"
              onClick={() => getSearchData("1")}
            />
            <CustomButton
              text={t("Excel")}
              icon="excel"
              onClick={() => getSearchData("2")}
            />
          </div>
        </div>
        {/* {payload?.reportType === "Summary" && (
          <SingleLineSummeryTable doctorShareData={doctorShareData} />
        )}
        {payload?.reportType === "DepartmentWise" && (
          <DipartmentwiseTable doctorShareData={doctorShareData} />
        )} */}
        {/* {payload?.reportType === "PatientItemWise" && (
            <DetailedTable doctorShareData={doctorShareData} />
          )} */}
      </div>
    </>
  );
};

export default InHouseDrExport;
