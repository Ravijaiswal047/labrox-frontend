import React, { useEffect, useState } from 'react'
import { useLocalStorage } from '../utils/hooks/useLocalStorage'
import { axiosInstance } from '../utils/axiosInstance';
import Loading from '../components/loader/Loading';
import { CustomButton } from '../components/UI/CustomButton';
import DatePicker from '../components/formComponent/DatePicker';
import ReactSelect from '../components/formComponent/ReactSelect';
import { toast } from 'react-toastify';
import DefaultDashboard from './Dashboards/DefaultDashboard';
import ESGDashboard from './Dashboards/ESGDashboard';
import "./mainDashboard.css"
import DefaultDashboardNew from './Dashboards/DefaultDashboardNew';
import LogisticDashboard from './Dashboards/LogisticDashboard';
import LabBusinessDashboard from './Dashboards/LabBusinessDashboard';
import DoctorDashboard from './Dashboards/DocotorDashboard';
import SampleStorageDashboard from '../Frontend/SampleStorage/sampleStorageDashboad/SampleStorageDashboard';
import ItemToBeExpiredModal from './ItemToBeExpiredModal';
import StoreDashboard from './StoreDashboard';
import { useNavigate } from 'react-router-dom';
import TicketDashboard from '../Frontend/TicketingModules/components/TicketDashboard';
import CentreBalance from '../Frontend/PettyCash/components/CentreBalance';
import ItemToBeReorderModal from './ItemToBeReorderModal';
import ClientExpiryModal from '../modules/login/ClientExpiryModal';
import CampAnalysisDashboard from '../Frontend/Camp/CampAnalysisDashboard';
import CampMonthlySummaryDashboard from '../Frontend/Camp/CampMonthlySummaryDashboard';
import DirectorDashboard from '../Frontend/DirectorDashboard/DirectorDashboard';
import FrontofficeDashboard from '../Frontend/FrontofficeDashboard/FrontofficeDashboard';

const MainDashboard = () => {
  const userData = useLocalStorage("userData", "get");
  console.log(userData, "userData")
  const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
  const navigate = useNavigate();
  const [dashboardAccess, setDashboardAccess] = useState({
    ShowDashboard: userData?.ShowDashboard,
    IsStoreDashboard: userData?.IsStoreDashboard,
  });
  const canShowDashboard = dashboardAccess?.ShowDashboard == 1;
  const canShowStoreDashboard = dashboardAccess?.IsStoreDashboard == 1;
  const defaultDashboard = canShowDashboard ? "" : canShowStoreDashboard ? "Store" : "";
  // const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  // console.log("DefaultCentre",DefaultCentre);
  const isNewCompany = CompanyID === 306 || CompanyID === "306";

  const [loading, setLoading] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [accessCentre, setAccessCentre] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const [reorderItems, setReorderItems] = useState([]);
  const [showReorderModal, setShowReorderModal] = useState(false);

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryData,      setExpiryData]      = useState([]);
  const [expiryMessage,   setExpiryMessage]   = useState('');

  useEffect(() => {
    if (userData?.ShowClientNearToExpiry == 1) {
      axiosInstance.get('CommonController/GetClientContractDays')
        .then((res) => {
          const list = res?.data?.data;
          if (res?.data?.success && Array.isArray(list) && list.length > 0) {
            setExpiryData(list);
            setExpiryMessage(res.data.message || '');
            setShowExpiryModal(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  const [filters, setFilters] = useState({
    CentreID: 0,
    FromDate: new Date(),
    FromTime: "00:00:00",
    ToDate: new Date(),
    ToTime: "23:59:59",
  });

  const [activeDashboard, setActiveDashboard] = useState(defaultDashboard);

  const syncDashboardAccess = async () => {
    if (!userData?.EmployeeID) return;

    try {
      const res = await axiosInstance.post("Employee/getEmployeeDetailsByID", {
        EmployeeID: userData?.EmployeeID,
      });
      const employeeData = res?.data?.message?.[0];
      if (!employeeData) return;

      const nextAccess = {
        ShowDashboard: Number(employeeData?.ShowDashboard ?? userData?.ShowDashboard ?? 0),
        IsStoreDashboard: Number(employeeData?.IsStoreDashboard ?? userData?.IsStoreDashboard ?? 0),
      };

      setDashboardAccess(nextAccess);
      useLocalStorage("userData", "set", {
        ...userData,
        ...nextAccess,
      });

      if (nextAccess.ShowDashboard != 1 && nextAccess.IsStoreDashboard != 1) {
        navigate("/Welcome");
      }
    } catch (error) {
      console.log("Error syncing dashboard rights", error);
      if (userData?.ShowDashboard != 1 && userData?.IsStoreDashboard != 1) {
        navigate("/Welcome");
      }
    }
  };

  const getStoreDataToReorder = async () => {
    try {
      const res = await axiosInstance.get(
        "CommonController/GetStockItemToReorderLevel"
      );

      if (res?.data?.success) {
        setReorderItems(res?.data?.message);
      } else {
        setReorderItems([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

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

  const getDashboardAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        if (Array.isArray(data)) {
          let CentreDataValue = data.map((ele) => ({
            value: ele.CentreID,
            label: ele.Centre,
            B2B: ele.BTB,
            SUBPCC: ele.SUBPCC,
            Image: ele.awsKey || ele.awsKeySubpcc || "",
          }));

          setAccessCentre(CentreDataValue);

          const allCentreIds = CentreDataValue.map((ele) => ele.value);
          setFilters(prev => ({ ...prev, CentreID: allCentreIds }));
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((err) => {
        console.log("API call failed:", err);
        toast.error("Failed to fetch centres");
      });
  };

  const handleSearchSelectChange = (label, value) => {
    const selectedValue = value?.value !== undefined ? value.value : 0;

    // if (selectedvalue === "0" || selectedvalue === "") {
    //   selectedvalue = accessCentre?.map((ele) => ele?.value);
    // }

    setFilters(prev => ({ ...prev, CentreID: selectedValue }));
  };

  const handleDateChange = (value, name) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStoreDataToExpire = async () => {
    try {
      const res = await axiosInstance.get(
        "CommonController/GetStoreDataToExpire"
      );

      if (res?.data?.success) {
        setExpiredItems(res?.data?.message);
      } else {
        setExpiredItems([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    syncDashboardAccess();
  }, []);

  useEffect(() => {
    if (canShowDashboard) {
      fetchDashboardAccess();
      getDashboardAccessCentres();
      getStoreDataToExpire()
      getStoreDataToReorder();
    }
  }, [canShowDashboard]);

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (canShowDashboard && hash) {
      setActiveDashboard(hash);
    } else {
      setActiveDashboard(defaultDashboard);
    }
  }, [window.location.hash, canShowDashboard, defaultDashboard]);

  const filteredDashboards = dashboards.filter(item =>
    item.DashboardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDashboardClick = (name) => {
    if (name === "Store") {
      if (!canShowStoreDashboard) return;
      setActiveDashboard("Store");
      return;
    }

    if (!canShowDashboard) return;
    if (name === "") {
      setActiveDashboard("");
      return;
    }

    window.location.hash = name;
    setActiveDashboard(name);
  };

  const renderDashboard = () => {
    if (activeDashboard === "Store") {
      return canShowStoreDashboard ? <StoreDashboard embedded={true} /> : null;
    }

    if (!canShowDashboard) return null;

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
      case "Ticketing":
        return (
          <TicketDashboard />
        );
        case "Technical":``
        return (
          <TechnicalDashboard filters={filters} />
        );
      case "PettyCash":
        return (
          <CentreBalance />
        );
        case "Front Office":
        return (
          <FrontofficeDashboard filters={filters} />
        );
      case "Director":
        return (
          <DirectorDashboard filters={filters} />
        );
         case "CampAnalysisMonthly":
        return (
          <CampMonthlySummaryDashboard
          filters={filters}
            accessCentre={accessCentre}
           />
        );
      case "CampAnalysisPatient":
        return (
          <CampAnalysisDashboard
            filters={filters}
            accessCentre={accessCentre}
          />
        );
      case "LabBusiness":
      default:
        return isNewCompany ? (
          <DefaultDashboardNew
            filters={filters}
            accessCentre={accessCentre}
          />

        ) : (
          <DefaultDashboard
            filters={filters}
            accessCentre={accessCentre}
          />
          // <DoctorDashboard
          //   filters={filters}
          //   accessCentre={accessCentre}
          // />
          // <CampAnalysisDashboard
          //   filters={filters}
          //   accessCentre={accessCentre}
          // />
          // <CampMonthlySummaryDashboard
          //   filters={filters}
          //   accessCentre={accessCentre}
          // />

        )
      // return(
      //     <LabBusinessDashboard/>
      //   )
    }
  };

  return (
    <>
      {showExpiredModal &&
        <ItemToBeExpiredModal
          show={showExpiredModal}
          onHide={setShowExpiredModal}
          Data={expiredItems}
        />
      }
      {showReorderModal &&
        <ItemToBeReorderModal
          show={showReorderModal}
          onHide={setShowReorderModal}
          Data={reorderItems}
        />
      }
      {showExpiryModal && userData?.DesignationName === "Accounts" && (
        <ClientExpiryModal
          data={expiryData}
          message={expiryMessage}
          onClose={() => setShowExpiryModal(false)}
        />
      )}
      <div className="container-fluid py-1">
        {loading && <Loading />}

        {/* Dashboard Navigation */}
        <div className="dashboard-header-container border-bottom">
          <div className="tabs-wrapper">
            <ul className="dashboard-tabs">
              {canShowDashboard && (
                <li
                  className={`tab-item ${activeDashboard === "" ? "active" : ""}`}
                  onClick={() => handleDashboardClick("")}
                >
                  Dashboard
                </li>
              )}

              {canShowStoreDashboard && (
                <li
                  className={`tab-item ${activeDashboard === "Store" ? "active" : ""}`}
                  onClick={() => handleDashboardClick("Store")}
                >
                  Store dashboard
                </li>
              )}

              {canShowDashboard && filteredDashboards.map((item) => (
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

          {canShowDashboard && (
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
          )}
        </div>

        {/* Centralized Filters Section */}
        {canShowDashboard && activeDashboard !== "Store" && (
          <div className="">
            <div className="row mt-2">
              <div className="col-sm-3">
                <ReactSelect
                  dynamicOptions={[
                    { label: "All Centre", value: "0" },
                    ...accessCentre,
                  ]}
                  value={filters?.CentreID}
                  name="CentreID"
                  label="Centre"
                  removeIsClearable={true}
                  placeholderName="All Centre"
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
              {
                expiredItems?.length > 0 &&
                <CustomButton
                  title="Item To Expire"
                  text={`${expiredItems?.length} Items To be Expire`}
                  onClick={() => setShowExpiredModal(true)}
                />
              }
              {
                reorderItems?.length > 0 &&
                <CustomButton
                  title="Item To Reorder"
                  className="mx-2"
                  text={`${reorderItems?.length} Items To be Reordered`}
                  onClick={() => setShowReorderModal(true)}
                />
              }

            </div>
          </div>
        )}

        {/* Render Active Dashboard */}
        <div className="row mt-2">
          <div className="col-12">
            {renderDashboard()}
          </div>
        </div>
      </div>
    </>
  );
};

export default MainDashboard;
