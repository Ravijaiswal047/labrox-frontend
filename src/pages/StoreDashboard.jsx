import React, { useEffect, useState } from 'react'
import { useLocalStorage } from '../utils/hooks/useLocalStorage'
import { axiosInstance } from '../utils/axiosInstance';
import Loading from '../components/loader/Loading';
import DatePicker from '../components/formComponent/DatePicker';
import ReactSelect from '../components/formComponent/ReactSelect';
import moment from 'moment';
import { toast } from 'react-toastify';
import DefaultDashboard from './Dashboards/DefaultDashboard';
import ESGDashboard from './Dashboards/ESGDashboard';
import "./mainDashboard.css"
import DefaultDashboardNew from './Dashboards/DefaultDashboardNew';
import LogisticDashboard from './Dashboards/LogisticDashboard';
import LabBusinessDashboard from './Dashboards/LabBusinessDashboard';
import DoctorDashboard from './Dashboards/DocotorDashboard';
import SampleStorageDashboard from '../Frontend/SampleStorage/sampleStorageDashboad/SampleStorageDashboard';

const StoreDashboard = ({ embedded = false }) => {
  const userData = useLocalStorage("userData", "get");
  console.log(userData,"usedata")
  const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
  const canLoadDashboard = true;
  // const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  // console.log("DefaultCentre",DefaultCentre);
  const isNewCompany = CompanyID === 306 || CompanyID === "306";

  const [loading, setLoading] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [accessCentre, setAccessCentre] = useState([]);
  const [locationList, setLocationList] = useState([]);

  const [getLocations, setGetLocations] = useState([]);

  const [combineDashboardData, setCombineDashboardData] = useState([]);
  const [load, setLoad] = useState(false);


  const [filters, setFilters] = useState({
    // CentreID: 0,
    LocationId: 0,
    FromDate: new Date(),
    FromTime: "00:00:00",
    ToDate: new Date(),
    ToTime: "23:59:59",
  });

  // console.log("access centre -> ", accessCentre)

  const [activeDashboard, setActiveDashboard] = useState("");

  const fetchDashboardAccess = async () => {
    if (!userData?.EmployeeID) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `Employee/GetEmployeeDashboardAccess?EmployeeId=${userData?.EmployeeID}`
      );
      if (res?.data?.success) {
        setDashboards(res?.data?.message || []);
      }
    } catch (error) {
      console.log("Error fetching dashboard access", error);
    } finally {
      setLoading(false);
    }
  };

  // const getDashboardAccessCentres = () => {
  //   axiosInstance
  //     .get("Centre/getAccessCentres")
  //     .then((res) => {
  //       console.log("res ->", res)
  //       let data = res.data.message;
  //       if (Array.isArray(data)) {
  //         let CentreDataValue = data.map((ele) => ({
  //           value: ele.CentreID,
  //           label: ele.Centre,
  //           B2B: ele.BTB,
  //           SUBPCC: ele.SUBPCC,
  //           Image: ele.awsKey || ele.awsKeySubpcc || "",
  //         }));

  //         setAccessCentre(CentreDataValue);

  //         const allCentreIds = CentreDataValue.map((ele) => ele.value);
  //         setFilters(prev => ({ ...prev, CentreID: allCentreIds }));
  //       } else {
  //         console.error("Unexpected data format:", data);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log("API call failed:", err);
  //       toast.error("Failed to fetch centres");
  //     });
  // };


    // Fetch dashboard data when filters change 
    const fetchDashboardData = () => {
      setLoad(true);
      axiosInstance
        .post("CommonController/GetStoreDashboard_Data", {
          LocationId: Array.isArray(filters?.LocationId)
            ? 0
            : filters?.LocationId,
          FromDate: moment(filters?.FromDate).format("YYYY-MM-DD"),
          ToDate: moment(filters?.ToDate).format("YYYY-MM-DD"),
          FromTime: filters?.FromTime,
          ToTime: filters?.ToTime,
        })
        .then((res) => {
          console.log("StoreDashboard",res)
          setLoad(false);
          setCombineDashboardData(res?.data?.message);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : err?.data?.message
          );
        });
    };

  const handleSearchSelectChange = (label, value) => {
    const selectedValue = value?.value !== undefined ? value.value : 0;

    // if (selectedvalue === "0" || selectedvalue === "") {
    //   selectedvalue = accessCentre?.map((ele) => ele?.value);
    // }

    // setFilters(prev => ({ ...prev, CentreID: selectedValue }));
    setFilters(prev => ({ ...prev, LocationId: selectedValue }));
  };

  const handleDateChange = (value, name) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (canLoadDashboard && !embedded) {
      fetchDashboardAccess();
    }
    // getDashboardAccessCentres();
  }, [canLoadDashboard, embedded]);

  useEffect(() => {
    if (
      canLoadDashboard &&
      filters?.LocationId !== undefined &&
      filters?.LocationId !== null
    ) {
      fetchDashboardData();
    }
  }, [
    canLoadDashboard,
    filters?.LocationId,
    filters?.FromDate,
    filters?.ToDate
  ]);

    useEffect(() => {
      if (!canLoadDashboard) return;

      axiosInstance
        .get("DirectGRN/GetLocationWithpanel")
        .then((res) => {
          const respons = res?.data?.message;
          const status = res?.data?.success;
          if (status) {
            const locations = Array.isArray(respons) ? respons : [];
            setGetLocations(locations);
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("Failed to load locations");
        });
    }, [canLoadDashboard]);

  const filteredDashboards = dashboards.filter(item =>
    item.DashboardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDashboardClick = (name) => {
    setActiveDashboard(name);
  };

  const renderDashboard = () => {
    switch (activeDashboard) {

      case "ESG":
        return (
          // <ESGDashboard
          //   filters={filters}
          //   accessCentre={accessCentre}
          // />
          <DoctorDashboard
            filters={filters}
            accessCentre={accessCentre}
          />
        );
      case "Logistic":
        return (
          <LogisticDashboard
            filters={filters}
            accessCentre={accessCentre}
          />
        );
      case "Sample Storage":
        return (
          <SampleStorageDashboard />
        );
        // case "LabBusiness":

      case "LabBusiness":
      default:
        return isNewCompany ? (
          <DefaultDashboardNew
            filters={filters}
            accessCentre={accessCentre}
            locationList={locationList}
            hideCharts={true}
            externalDashboardData={combineDashboardData}
          />

        ) : (
          <DefaultDashboard
            filters={filters}
            accessCentre={accessCentre}
            locationList={locationList}
            hideCharts={true}
            externalDashboardData={combineDashboardData}
          />

        )
        // return(
        //     <LabBusinessDashboard/>
        //   )
    }
  };

  const dashboardContent = (
    <>
      {/* Centralized Filters Section */}
      <div className="">
        <div className="row mt-2">

{/* 
           <div className="col-sm-3">
            <ReactSelect
              dynamicOptions={[
                { label: "All Location", value: "0" },
                ...locationList,
              ]}
              value={filters?.LocationId}
              name="LocationId"
              label="Location"
              removeIsClearable={true}
              placeholderName="All Location"
              onChange={handleSearchSelectChange}
            />
          </div> */}

            <div className="col-sm-3">
            <ReactSelect
            name="Location"
            id="Location"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "All Location", value: 0 },
              ...getLocations?.map((ele) => ({
                label: ele?.Location,
                value: ele?.LocationID,
              })),
            ]}
            placeholderName="All Location"
            value={filters?.LocationId}
            // onChange={handleSelectChange}
            onChange={handleSearchSelectChange}
          />
          </div>


          <div className="col-sm-3">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              placeholder=" "
              value={new Date(filters.FromDate)}
              id="From Date"
              maxDate={new Date(filters?.ToDate)}
              lable="FromDate"
              onChange={handleDateChange}
            />
          </div>
          <div className="col-sm-3">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              placeholder=" "
              value={new Date(filters.ToDate)}
              id="To Date"
              lable="ToDate"
              maxDate={new Date()}
              minDate={new Date(filters?.FromDate)}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {/* Render Active Dashboard */}
      <div className="row mt-2">
        <div className="col-12">
          {renderDashboard()}
        </div>
      </div>
    </>
  );

  if (embedded) {
    return dashboardContent;
  }

  return (
    <div className="container-fluid py-1">
      {loading && <Loading />}

      {/* Dashboard Navigation */}
      <div className="dashboard-header-container border-bottom">
        <div className="tabs-wrapper">
          <ul className="dashboard-tabs">
            <li
              className={`tab-item ${activeDashboard === "" ? "active" : ""}`}
              onClick={() => handleDashboardClick("")}
            >
              Store Dashboard 
            </li>

            {filteredDashboards.map((item) => (
              <li
                key={item.ID}
                className={`tab-item ${activeDashboard === item.DashboardName ? "active" : ""}`}
                onClick={() => handleDashboardClick(item.DashboardName)}
              >
                {item.DashboardName}
              </li>
            ))}
          </ul>
        </div>

        <div className="das-search-wrapper">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-end-0">
              <i className="fa fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 bg-light"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {dashboardContent}
    </div>
  );
};

export default StoreDashboard;
