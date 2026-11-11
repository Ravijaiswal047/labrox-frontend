import { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice.js";
import { axiosInstance } from "../../utils/axiosInstance.jsx";
import { useDispatch } from "react-redux";
import { notify } from "../../utils/utils.js";
import moment from "moment";
import { Button } from "react-bootstrap";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi.js";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import NoRecordFound from "../../components/formComponent/NoRecordFound.jsx";
import Tables from "../../components/UI/customTable/index.jsx";
import Pagination from "../../Pagination/Pagination.jsx";

const DoctorMisReport = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const [CentreData, setCentreData] = useState([]);
  const [rateType, setRateType] = useState([]);
  const [doctorShareData, setDoctorShareData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [payload, setPayload] = useState({
    toDate: new Date(),
    fromDate: new Date(),
    doctor: [],
    Centre: [],
    RateType: [],
    department: [],
    searchType: "1",
    reportType: "PatientWise",
    isChecked: 0,
  });

  const [dropdownlist, setDropdownList] = useState({
    doctorList: [],
    departmentList: [],
  });

  const paginatedData = tableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const reportList = [
    { label: "Patient Wise", value: "PatientWise" },
    { label: "Item Wise", value: "ItemWise" },
    { label: "Doctor Wise", value: "DoctorWise" },
    // { label: "Summary", value: "Summary" },
  ];

  const searchType = [
    // { label: "OnScreen", value: "0" },
    { label: "Pdf", value: "1" },
    { label: "Excel", value: "2" },
  ];
                                                          
  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };
                                      
  const handleCheckChange = (name, e) => {
    setPayload((prev) => ({
      ...prev,
      [name]: e.target.checked ? 1 : 0,
    }));
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
                                     
  const getSearchTableData = async () => {
    try {
      dispatch(setLoading(true));

      const getPayload = {
        FromDate: moment(payload.fromDate).format("YYYY-MM-DD"),
        ToDate: moment(payload.toDate).format("YYYY-MM-DD"),
        SearchType: payload?.searchType,
        DoctorIDs: payload?.doctor?.length ? [payload.doctor.join(",")] : [],
        DepartmentIDs: payload?.department?.length
          ? [payload.department.join(",")]
          : [],
        ReportType: payload?.reportType,
        CentreID: payload?.Centre?.length ? [payload?.Centre?.join(",")] : [],
        RateTypeID: payload?.RateType?.length
          ? [payload?.RateType?.join(",")]
          : [],
        OnlyShare: payload?.isChecked,
      };

      const res = await axiosInstance.post(
        "InHouseDoctor/GetDoctorMISReportData",
        getPayload
      );

      if (res?.data?.success) {
        setTableData(res?.data?.data || []);
        setSelectedRows([]); // reset selection
        setCurrentPage(1);
      } else {
        toast.error(res?.data?.message || "No Data Found");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      dispatch(setLoading(false));
    }
  };
                                            
  const getDepartmentById = async () => {
    try {
      dispatch(setLoading(true));
      const [doctorRes, departmentRes] = await Promise.all([
        axiosInstance.post("DoctorReferal/getDoctorDataBind"),
        axiosInstance.post("CommonController/Fetchprocedure", {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Department", "0"],
        }),
      ]);

      const doctorListRes =
        doctorRes?.data?.message?.map((item) => ({
          label: item?.DoctorName,
          value: item?.DoctorID,
        })) || [];

      const departmentListRes =
        departmentRes?.data?.data?.map((item) => ({
          label: item?.Department,
          value: item?.DepartmentID,
        })) || [];

      setDropdownList((prev) => ({
        ...prev,
        doctorList: doctorListRes,
        departmentList: departmentListRes,
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
                                               
  const getSearchData = async () => {
    const selectedDoctorIDs = selectedRows?.length
      ? selectedRows.map((i) => tableData[i]?.Doctor_ID)
      : [];

    const selectedTestIds = selectedRows?.length
      ? selectedRows.flatMap((i) => {
        const ids = tableData[i]?.TestIds;
        return ids ? ids.split(",").map(Number) : [];
      })
      : [];

    if (selectedRows?.length === 0) {
      toast.error("Please select at row");
      return;
    }
    try {
      dispatch(setLoading(true));
      const getPayload = {
        TestIds: selectedTestIds,
        FromDate: moment(payload.fromDate).format("YYYY-MM-DD"),
        ToDate: moment(payload.toDate).format("YYYY-MM-DD"),
        SearchType: payload?.searchType,
        DoctorIDs:
          // selectedDoctorIDs.length > 0
          // ? 
          [selectedDoctorIDs.join(",")],
        // : payload?.doctor?.length
        //   ? [payload.doctor.join(",")]
        //   : [],
        DepartmentIDs: payload?.department?.length
          ? [payload.department.join(",")]
          : [],
        ReportType: payload?.reportType,
        CentreID: payload?.Centre?.length ? [payload?.Centre?.join(",")] : [],
        RateTypeID: payload?.RateType?.length
          ? [payload?.RateType?.join(",")]
          : [],
        OnlyShare: payload?.isChecked,
      };
      const isFile = payload?.searchType === "1" || payload?.searchType === "2";
      const res = await axiosInstance.post(
        "InHouseDoctor/GetDoctorMISReport",
        getPayload,
        {
          responseType: isFile ? "arraybuffer" : "json",
        }
      );
      if (isFile) {
        const contentType = res?.headers["content-type"];

        if (contentType?.includes("application/json")) {
          const decoder = new TextDecoder("utf-8");
          const text = decoder.decode(res.data);
          const jsonData = JSON.parse(text);

          toast.error(jsonData?.message || "An error occurred while generating the report.");
          return;
        }
      }
      if (payload?.searchType === "0") {
        if (!Array.isArray(res?.data?.data)) {
          notify(res?.data?.message, "success");
          setDoctorShareData([]);
          return;
        }
        setDoctorShareData(res.data.data);
        return;
      }
      if (payload?.searchType === "1") {
        const blob = new Blob([res.data], {
          type: "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        return;
      }
      if (payload?.searchType === "2") {
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
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

  return (
    <>
      <Heading
        title={"Doctor MIS Report"}
        secondTitle={
          <label onClick={() => setShowMore((prev) => !prev)}>
            {/* <ViewMenu /> */}
          </label>
        }
      />
      <div className="card px-2 py-2">
        <div className="row">
          <div className="col-sm-3 col-md-2 mb-2">
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
          <div className="col-sm-3 col-md-2 mb-2">
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
          <div className="col-sm-3 col-md-2 mb-2">
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
          <div className="col-sm-3 col-md-2 mb-2">
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
          <div className="col-sm-3 col-md-2 mb-2">
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
          <div className="col-sm-3 col-md-2 mb-2">
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
          <div className="col-sm-3 col-md-2 mb-2">
            <ReactSelect
              dynamicOptions={searchType}
              isShowBorder={true}
              name="searchType"
              lable={t("Search Type")}
              id="searchType"
              removeIsClearable={false}
              placeholderName={t("Search Type")}
              value={payload?.searchType}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-2">
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
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="isChecked"
                id="isChecked"
                placeholder=""
                checked={payload?.isChecked}
                onChange={(e) => handleCheckChange("isChecked", e)}
              />
            </div>
            <label className="col-sm-10" htmlFor="isChecked">
              {t("Only Share")}
            </label>
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            <Button className="rounded btn-primary" onClick={getSearchTableData}>
              Search
            </Button>
            {tableData.length > 0 &&
              <Button className="rounded" onClick={getSearchData}>
                Report
              </Button>
            }
          </div>
        </div>
      </div>
      <Accordion title={t("Doctor MIS Details ")} defaultValue={true}>
        <div className="col-12">
          {tableData.length > 0 ? (
            <>
              <Tables>
                <thead>
                  <tr>
                    <th>S.no</th>
                    <th>Doctor Name</th>
                    <th>Patient Count</th>
                    <th>Gross Amt</th>
                    <th>Discount Amt</th>
                    <th>Net Amt</th>
                    <th>Balance Amt</th>
                    <th>Share Amt</th>
                    <th>Discount Share Amt</th>
                    <th>Mobile</th>
                    <th className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === tableData.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(tableData.map((_, i) => i));
                          } else {
                            setSelectedRows([]);
                          }
                        }}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (   // 👈 changed here
                    <tr key={index}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>  {/* 👈 S.no fix */}
                      <td>{item.DoctorName}</td>
                      <td>{item.PatientCount}</td>
                      <td>{item.DoctorGrossAmt}</td>
                      <td>{item.DoctorDiscountAmt}</td>
                      <td>{item.DoctorNetAmt}</td>
                      <td>{item.DoctorBalanceAmt}</td>
                      <td>{item.DoctorShareAmount}</td>
                      <td>{item.DoctorDiscountShareAmount}</td>
                      <td>{item.Mobile}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows((prev) => [...prev, index]);
                            } else {
                              setSelectedRows((prev) => prev.filter((i) => i !== index));
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>

              <Pagination
                currentPage={currentPage}
                totalCount={tableData.length}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          ) : (
            <Tables>
              <tbody>
                <tr>
                  <td colSpan={18} className="text-center">
                    <NoRecordFound />
                  </td>
                </tr>
              </tbody>
            </Tables>
          )}
        </div>
      </Accordion>
      {/* </div > */}
    </>
  );
};

export default DoctorMisReport;
