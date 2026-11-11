import React, { useEffect, useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../components/formComponent/DatePicker";
import CustomTimePicker from "../../../components/formComponent/TimePicker";
import Heading from "../../../components/UI/Heading";
import { Button } from "react-bootstrap";
import CustomTable from "../../../components/Table/CustomTable";
import "./CentreAuditWork.css";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiUrls";
import { notify } from "../../../utils/utils";
import moment from "moment";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";

const CentreAuditWork = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [centreData, setCentreData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    CentreID: "",
    fromDate: new Date(),
    fromTime: "",
    toDate: new Date(),
    toTime: "",
  });
  const selectCentre = centreData?.find(
    (item) => item?.value == payload?.CentreID,
  );
  const handleReactSelect = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const dateSelect = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleTime = (time, name) => {
    setPayload((prev) => ({ ...prev, [name]: time }));
  };

  const tableHeaders = [
    { header: "Sr No.", field: "srNo" },
    { header: "Centre Name", field: "Centre" },
    { header: "Date", field: "dtHide" },
    { header: "Time", field: "time" },
    { header: "Createby", field: "CreatedByName" },
    { header: "createdOn", field: "dtEntry" },
    { header: "UpdatedBy", field: "UpdatedByName" },
    { header: "UpdatedOn", field: "dtUpdate" },
    { header: "Remove Option", field: "SampleRemove" },
  ];

  const centreAuditWorkingTimings = [
    {
      srNo: 1,
      centreName: "Sunrise Diagnostic Centre",
      fromDate: "2025-10-01",
      time: "08:00 AM - 04:00 PM",
      ceatedBy: "Dr. Mehta",
      createdOn: "2025-09-25",
      SampleRemove: "0",
    },
    {
      srNo: 2,
      centreName: "Health First Labs",
      fromDate: "2025-10-03",
      time: "09:00 AM - 05:00 PM",
      ceatedBy: "Nurse Priya",
      createdOn: "2025-09-26",
      SampleRemove: "1",
    },
    {
      srNo: 3,
      centreName: "CareWell Diagnostics",
      fromDate: "2025-10-05",
      time: "07:30 AM - 03:30 PM",
      ceatedBy: "Admin Raj",
      createdOn: "2025-09-27",
      SampleRemove: "0",
    },
    {
      srNo: 4,
      centreName: "Lifeline Medical Centre",
      fromDate: "2025-10-07",
      time: "08:30 AM - 04:30 PM",
      ceatedBy: "Dr. Sharma",
      createdOn: "2025-09-28",
      SampleRemove: "0",
    },
    {
      srNo: 5,
      centreName: "City Health Diagnostics",
      fromDate: "2025-10-09",
      time: "09:00 AM - 05:00 PM",
      ceatedBy: "Admin Riya",
      createdOn: "2025-09-29",
      SampleRemove: "1",
    },
  ];

  const getAccessCentres = () => {
    dispatch(setLoading(true));
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
        setCentreData(CentreDataValue);
        setPayload((prev) => ({
          ...prev,
          CentreID: CentreDataValue?.[0]?.value,
        }));
      })
      .catch((err) => console.log(err))
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const customeData = centreAuditWorkingTimings?.map((items, index) => {
    return {
      ...items,
      srNo: index + 1,
      SampleRemove: <i className="bi bi-x-octagon mb-0 py-0 text-red"></i>,
    };
  });

  const getCentreData = async () => {
    await axiosInstance
      .get(apiUrls?.GetCenterHideData)
      .then((res) => {
        setTableData(res?.data?.message || []);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("xxxx");
      });
  };

  console.log("tableData:::", payload?.CentreID);

  const InsertCentreHideData = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.InsertCentreHideData, {
        centreID: String(payload?.CentreID?.value),
        dtHide: payload?.fromDate,
        // "dtHide": moment(payload?.fromDate).format('YYYY/MM/DD'),
        fromTime: payload?.fromTime,
        toTime: payload?.toTime,
      })
      .then((res) => {
        console.log("res::InsertCentreHideData", res);
        notify(res?.data?.message, "error");
        getCentreData();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("xxxx");
        dispatch(setLoading(false));
      });
  };

  const handleRemove = async (rowData, index) => {
    dispatch(setLoading(true));
    axiosInstance
      .post(apiUrls?.UpdateCentreHideData, { id: String(rowData?.ID) })
      .then((res) => {
        getCentreData();
      })
      .catch((err) => console.log(err))
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const renderTableData = tableData?.map((iData, idx) => ({
    ...iData,
    srNo: idx + 1,
    dtHide: iData?.dtHide ? moment(iData?.dtHide).format("DD-MMM-YYYY") : "-",
    time: (
      <span>
        {iData?.FromTime} - {iData?.ToTime}
      </span>
    ),
    SampleRemove: (
      <i
        onClick={() => handleRemove(iData, idx)}
        className="bi bi-x-octagon mb-0 py-0 text-red"
      ></i>
    ),
  }));

  useEffect(() => {
    getAccessCentres();
    getCentreData();
  }, []);

  return (
    <>
      <div className="card">
        <Heading title={"Centre Audit Workig Time"} />
        <div className="row px-2 py-2">
          <div className="col-sm-2  ">
            <ReactSelect
              dynamicOptions={[
                { value: "", label: "All Centre" },
                ...centreData,
              ]}
              name="CentreID"
              lable={t("Centre")}
              id="Centre"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={payload?.CentreID}
              onChange={handleReactSelect}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="fromDate"
              value={payload?.fromDate}
              onChange={dateSelect}
              placeholder=" "
              id="fromDate"
              lable={t("Date")}
              maxDate={new Date(payload?.toDate)}
            />
          </div>
          <div className="col-sm-1">
            <CustomTimePicker
              name="fromTime"
              placeholder="fromTime"
              value={payload?.fromTime}
              id="fromTime"
              lable="FromTime"
              onChange={handleTime}
            />
          </div>
          {/* <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="toDate"
              value={payload?.toDate}
              onChange={dateSelect}
              placeholder=" "
              id="toDate"
              lable="ToDate"
            />
          </div> */}
          <div className="col-sm-1">
            <CustomTimePicker
              name="toTime"
              placeholder="ToTime"
              value={payload?.toTime}
              id="toTime"
              lable="ToTime"
              onChange={handleTime}
            />
          </div>
          <Button
            onClick={getCentreData}
            className="px-4 rounded mx-2 d-flex align-items-center justify-content-center"
          >
            Search
            <i className="bi bi-search mb-0 mx-2"></i>
          </Button>
          <Button
            onClick={InsertCentreHideData}
            className="px-4 rounded mx-2 d-flex align-items-center justify-content-center"
          >
            Add
            <i className="bi bi-plus-circle mb-0 mx-2"></i>
          </Button>
        </div>
        <div className="timg_Work_audit px-2 pb-2">
          <CustomTable
            columns={tableHeaders}
            data={renderTableData}
            // rowStyle={(rowData) => ({
            //   backgroundColor: rowData.rowColor,
            //   color: statusColors[rowData.status]?.text || "#000000",
            // })}
          />
        </div>
      </div>
    </>
  );
};

export default CentreAuditWork;
