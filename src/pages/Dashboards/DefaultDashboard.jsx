import React, { useEffect, useState } from "react";
import Welcome from "../../components/WelComeCard/Welcome";
import moment from "moment";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Marque from "../../components/UI/Marque";
import { Bar } from "react-chartjs-2";
import MultiAxisLineChart from "../MultiAxisLineChart";
import RazorPay from "../../Frontend/Payment/RazorPay";
import { BirthDaySVGIcon } from "../../components/SvgIcons";
import Loading from "../../components/loader/Loading";
import PlaceholderImage from "../PlaceholderImage.png";
import LineChartPayment from "../modules/LineChartPayment";
import QrCodeDropdown from "../../layouts/header/qrcode-dropdown/QrCodeDropdown";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Tooltip } from "primereact/tooltip";
import { festivals } from "../../utils/Constants";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { ChartData, getChart } from "../utitlity";

// Dashboard now receives filters and accessCentre as props
const DefaultDashboard = ({ filters, accessCentre, hideCharts = false, externalDashboardData }) => {
  const [combineDashboardData, setCombineDashboardData] = useState([]);
  const [load, setLoad] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newsLetter, setNewsLetter] = useState([]);
  const [bottom, setBottom] = useState(20);
  const [prevScroll, setPrevScroll] = useState(window.scrollY);
  const [t] = useTranslation();
  
  const centreId = useLocalStorage("DefaultCentre", "get");
  const showQRIcon = accessCentre.find((ele) => ele?.value === centreId);
  const DesignationName = useLocalStorage("userData", "get")?.DesignationName;
  const HideBirthday = useLocalStorage("userData", "get")?.HideBirthday;
  console.log("HideBirthday",HideBirthday);

  const isStoreDashboard = !!externalDashboardData?.storeDashboardSummary;
  const dashboardData = isStoreDashboard ? externalDashboardData : combineDashboardData;
  const storeSummary = dashboardData?.storeDashboardSummary || {};

  const storeApprovalChartLabels = [
    "Item Approval",
    "PO Approval",
    "GRN Approval",
    "Indent Approval",
  ];

  const storeApprovalSummary = {
    sampleCollectionCount: storeSummary?.todayItemApproval ?? 0,
    notCollectedCount: storeSummary?.todayPOApproval ?? 0,
    departmentReceiveCount: storeSummary?.todayGRNApproval ?? 0,
    rejectedCount: storeSummary?.todayIndentApproval ?? 0,
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > prevScroll) {
        setBottom(20);
      } else {
        setBottom(50 + currentScroll * 0.2);
      }
      setPrevScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScroll]);

  // Festivals effect
  useEffect(() => {
    const todayDate = moment(new Date()).format("YYYY-MM-DD");
    const todayFestivals = festivals?.filter((item) => item.date == todayDate);
    const upcomingFestivals = festivals
      .filter((item) => item.date > todayDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    setNewsLetter([...todayFestivals, ...upcomingFestivals]);
  }, []);

  // Fetch dashboard data when filters change
  const fetchDashboardData = () => {
    setLoad(true);
    axiosInstance
      .post("CommonController/GetDashboard_Data", {
        CentreId: Array.isArray(filters?.CentreID)
          ? 0
          : Number(filters?.CentreID) || 0,
        FromDate: moment(filters?.FromDate).format("YYYY-MM-DD"),
        ToDate: moment(filters?.ToDate).format("YYYY-MM-DD"),
        FromTime: filters?.FromTime,
        ToTime: filters?.ToTime,
      })
      .then((res) => {
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

  // Trigger API call when filters change
  useEffect(() => {
    if (filters?.CentreID && accessCentre.length > 0) {
      fetchDashboardData();
    }
  }, [filters, accessCentre]);

  const handleHeightOfBirthDaycard = () => {
    let welcome_wrp = document
      .getElementById("welcome_wrp")
      ?.getBoundingClientRect().height;
    let birthdayHead = document
      .getElementById("birthdayHead")
      ?.getBoundingClientRect().height;
    return welcome_wrp - (birthdayHead ? birthdayHead : 27.66);
  };

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  };

  const returnTotalCount = (type) => {
    return combineDashboardData?.smsCount?.length > 0
      ? combineDashboardData?.smsCount?.reduce(
          (acc, item) => acc + Number(item[type]),
          0
        )
      : 0;
  };

  const getDate = (key) => {
    return dashboardData?.dashboardSummary?.[key] ?? 0;
  };

  const getLastThreeMonths = () => {
    const date = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const currentMonthIndex = date.getMonth();
    const previousMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
    const twoMonthsAgoIndex = currentMonthIndex <= 1 ? 11 - (1 - currentMonthIndex) : currentMonthIndex - 2;
    return [
      monthNames[currentMonthIndex],
      monthNames[previousMonthIndex],
      monthNames[twoMonthsAgoIndex],
    ];
  };

  const [currentMonth, previousMonth, twoMonthsAgo] = getLastThreeMonths();

  const getColor = () => {
    const theme = localStorage?.getItem("Theme");
    switch (theme) {
      case "Default": return "#ada9fc";
      case "light Green": return "lightgreen";
      case "Peach": return "#ffdab9";
      case "Pale Pink": return "#fc9de4";
      case "Red": return "#FFCCCB";
      case "SkyBlue": return "#6dd2e3";
      case "Grey": return "lightgrey";
      default: return "white";
    }
  };

  const summary = dashboardData?.dashboardSummary || {};
  
  const SalesCollection = {
    labels: [twoMonthsAgo, previousMonth, currentMonth].map((label, idx) => {
      return summary?.twoMonthsAgoCollection === 0 && idx === 0
        ? "No Data"
        : summary?.lastMonthCollection === 0 && idx === 1
          ? "No Data"
          : summary?.currentMonthRevenue === 0 && idx === 2
            ? "No Data"
            : label;
    }),
    datasets: [{
      label: "Sales Status",
      data: [
        summary?.twoMonthsAgoCollection || 0.1,
        summary?.lastMonthCollection || 0.1,
        summary?.currentMonthRevenue || 0.1,
      ],
      backgroundColor: [
        summary.twoMonthsAgoCollection > 0
          ? summary.twoMonthsAgoCollection >= summary.lastMonthCollection ? "#e6f9f0" : "#ffe6e6"
          : "#cccccc",
        summary.lastMonthCollection > 0
          ? summary.lastMonthCollection >= summary.twoMonthsAgoCollection ? "#e6f9f0" : "#ffe6e6"
          : "#cccccc",
        summary?.currentMonthRevenue > 0 ? "#fffff2" : "#cccccc",
      ],
      borderColor: [
        summary.twoMonthsAgoCollection > 0
          ? summary.twoMonthsAgoCollection >= summary.lastMonthCollection ? "#007f00" : "#9b0000"
          : "#999999",
        summary.lastMonthCollection > 0
          ? summary.lastMonthCollection >= summary.twoMonthsAgoCollection ? "#007f00" : "#9b0000"
          : "#999999",
        summary?.currentMonthRevenue > 0 ? "#b3a300" : "#999999",
      ],
      borderWidth: 2,
    }],
  };

    <Bar
      data={SalesCollection}
      options={{
        maintainAspectRatio: false,
        responsive: true,
      }}
      style={{ fontSize: "5px" }}
    />;

  return (
    <>
      <RazorPay />
      {load && <Loading />}
      {/* <div className="card-dashboard">
        <div className="row mt-2">
          <span className="col-sm-2 col-6 header-dashboard">
            {t("DashBoard")}
          </span>
          
          {combineDashboardData?.smsCount?.length > 0 && (
            <div className="col-sm-2 col-6">
              <div className="chat-status">
                <div className="status-item">
                  <Tooltip target=".bi-whatsapp" />
                  <i
                    className="bi bi-whatsapp chat-icon green"
                    aria-hidden="true"
                    data-pr-tooltip={t("Whatsapp Count")}
                    data-pr-position="top"
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  ></i>
                  <span className="black chat-count">
                    {combineDashboardData?.smsCount?.[0]?.UsedWhatsAppCount ?? 0}
                    /{returnTotalCount("Whatsappcount")}
                  </span>
                </div>

                <div className="status-item">
                  <Tooltip target=".bi-chat-left-text" />
                  <i
                    className="bi bi-chat-left-text chat-icon blue"
                    aria-hidden="true"
                    data-pr-tooltip={t("SMS Count")}
                    data-pr-position="top"
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  ></i>
                  <span className="black chat-count">
                    {combineDashboardData?.smsCount?.[0]?.UsedSmsCount ?? 0}/
                    {returnTotalCount("SmsCount")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="col-sm-1" style={{ textAlign: "end" }}>
            <QrCodeDropdown
              setDropdownOpen={setDropdownOpen}
              dropdownOpen={dropdownOpen}
              accessCentre={accessCentre}
              showQRIcon={showQRIcon}
              DesignationName={DesignationName}
            />
          </div>
        </div>
      </div> */}

      <div className="card-dashboard">
        <div className="row">
          <div className="col-sm-6">
            <Welcome />
            <SampleCollection
              userWiseDashBoard={isStoreDashboard ? storeApprovalSummary : dashboardData?.dashboardSummary}
              chartLabels={isStoreDashboard ? storeApprovalChartLabels : undefined}
              title={isStoreDashboard ? "Today Approval Status" : "Sample Collection Status"}
            />
            {!hideCharts && (
              <PaymentMode userWiseDashBoard={dashboardData?.paymentSummary} />
            )}
          </div>

          <div className="col-sm-6 mt-1">
            <div className="row">
              {HideBirthday !== "1" && (
                <div className="col-md">
                  <div className="birthDay-Box">
                    <div className="birthdayHead d-flex justify-content-between" id="birthdayHead">
                      <span style={{ fontWeight: 700, color: "#fb5353" }}>
                        {t("Upcoming BirthDay")}
                      </span>
                    </div>
                    <div style={{ padding: "2px" }}>
                      <Marque height={handleHeightOfBirthDaycard()}>
                        {dashboardData?.upcomingBirthDays?.map((item, index) => (
                          <div className="birthdayBody mt-2" key={index}>
                            <div
                              className="thread"
                              style={{
                                backgroundColor: generateRandomColor(),
                                fontSize: "10px",
                                padding: "2px 5px",
                                borderRadius: "0px 5px 5px 0px",
                                display: "inline",
                                color: "black",
                                fontWeight: "600",
                              }}
                            >
                              {item?.designation}
                            </div>
                            <div className="d-flex justify-content-between p-2">
                              <div className="deatils">
                                <div style={{ fontWeight: 800 }}>
                                  {item?.name} {t("(")} {item?.dob} {t(")")}
                                </div>
                                <div>
                                  {item?.age} {t("Birthday")}
                                  <BirthDaySVGIcon />
                                </div>
                              </div>
                              <div>
                                {item?.imagePath ? (
                                  <img src={item?.imagePath} className="img-holder" />
                                ) : (
                                  <img src={PlaceholderImage} alt="" className="img-holder" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </Marque>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-md">
                <div className="birthDay-Box">
                  <div className="birthdayHead d-flex justify-content-between">
                    <span style={{ fontWeight: 700, color: "blue" }}>
                      {t("Upcoming Holidays")}
                    </span>
                  </div>
                  <div style={{ padding: "2px" }}>
                    <Marque height={handleHeightOfBirthDaycard()}>
                      {newsLetter?.map((item, index) => (
                        <div className="birthdayBody mt-2" key={index}>
                          <div
                            className="thread"
                            style={{
                              backgroundColor: generateRandomColor(),
                              fontSize: "10px",
                              padding: "2px 5px",
                              borderRadius: "0px 5px 5px 0px",
                              display: "inline",
                              color: "black",
                              fontWeight: "600",
                            }}
                          >
                            {t(item?.name)}
                          </div>
                          <div className="p-2 deatils">
                            <div style={{ fontWeight: 800 }}>
                              <svg width="24" height="15" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13h-1v6h6v-1h-5z" fill="currentColor"/>
                              </svg>
                              {item?.date}
                            </div>
                            <div style={{ color: "green" }}>
                              <svg width="20" height="15" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <path d="M4 20C4 15.5817 7.58172 12 12 12C16.4183 12 20 15.5817 20 20" stroke="currentColor" strokeWidth="2" fill="none"/>
                              </svg>
                              {t(item?.description)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </Marque>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Trends and other sections */}
            <div className="mainDashboardwrp">
              <div className="mainBox1">
                <div className="mainHeader">
                  <h4>{isStoreDashboard ? t("Store Trends") : t("Booking Trends")}</h4>
                </div>
                <div className="mainBoxes">
                  {/* today registration */}
                  <div className="box1 box2d" style={{ backgroundColor: "rgba(37, 76, 123, 0.2)" }}>
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {isStoreDashboard ? "Today Item Created" : t("Today's Registration")}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i className="pi pi-user-plus" style={{ color: "red", backgroundColor: "rgb(255, 245, 245)", margin: "0px", display: "flex", alignItems: "center" }}></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {isStoreDashboard ? storeSummary?.todayItemCreated ?? 0 : getDate("todayRegistration") ?? 0}
                        </h4>
                      </div>
                    </div>
                  </div>
                  {/* Today Revenue */}
                  <div className="box1 box2d" style={{ backgroundColor: "rgba(53, 234, 132, 0.2)" }}>
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {isStoreDashboard ? "Today PO Created" : t("Today's Revenue")}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i className="pi pi-money-bill" style={{ color: "red", backgroundColor: "rgb(255, 245, 245)", margin: "0px", display: "flex", alignItems: "center" }}></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {isStoreDashboard ? storeSummary?.todayPOCreated ?? 0 : getDate("todayRevenue") ?? 0}
                        </h4>
                      </div>
                    </div>
                  </div>
                  {/* Registrations */}
                  <div className="box1 box2d" style={{ backgroundColor: "rgba(11, 9, 110, 0.2)" }}>
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {isStoreDashboard ? "Pending PO" : `${t(currentMonth)} ${t("Registrations")}`}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i className="pi pi-calendar" style={{ color: "red", backgroundColor: "rgb(255, 245, 245)", margin: "0px", display: "flex", alignItems: "center" }}></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {isStoreDashboard ? storeSummary?.pendingPO ?? 0 : summary?.currentMonthRegistrationCount}
                        </h4>
                      </div>
                    </div>
                  </div>
                {/* Revenue */}
                  <div className="box1 box2d" style={{ backgroundColor: "rgba(37, 76, 123, 0.2)" }}>
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {isStoreDashboard ? "Today GRN Created" : `${t(twoMonthsAgo)} ${t("Revenue")}`}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i className="pi pi-money-bill" style={{ color: "red", backgroundColor: "rgb(255, 245, 245)", margin: "0px", display: "flex", alignItems: "center" }}></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {isStoreDashboard ? storeSummary?.todayGRNCreated ?? 0 : summary?.twoMonthsAgoCollection}
                        </h4>
                      </div>
                    </div>
                  </div>
                    {/* Previous Month */}
                  <div className="box1 box2d" style={{ backgroundColor: "rgba(53, 1, 98, 0.2)" }}>
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {isStoreDashboard ? "Pending GRN" : `${t(previousMonth)} ${t("Revenue")}`}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i className="pi pi-money-bill" style={{ color: "red", backgroundColor: "rgb(255, 245, 245)", margin: "0px", display: "flex", alignItems: "center" }}></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {isStoreDashboard ? storeSummary?.pendingGRN ?? 0 : summary?.lastMonthCollection}
                        </h4>
                      </div>
                    </div>
                  </div>
                  {/* Current Month revenue */}
                  <div className="box1 box2d" style={{ backgroundColor: "rgba(153, 175, 54, 0.2)" }}>
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {isStoreDashboard ? "Today Indent Created" : `${t(currentMonth)} ${t("Revenue")}`}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i className="pi pi-money-bill" style={{ color: "red", backgroundColor: "rgb(255, 245, 245)", margin: "0px", display: "flex", alignItems: "center" }}></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {isStoreDashboard ? storeSummary?.todayIndentCreated ?? 0 : summary?.currentMonthRevenue}
                        </h4>
                      </div>
                    </div>
                  </div>
                  {isStoreDashboard && (
                    <div className="box1 box2d" style={{ backgroundColor: "rgba(37, 76, 123, 0.2)" }}>
                      <div className="d-flex align-items-center justify-content-between pt-2">
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>Pending Indent</h4>
                      </div>
                      <div>
                        <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                          <i className="pi pi-calendar" style={{ color: "red", backgroundColor: "rgb(255, 245, 245)", margin: "0px", display: "flex", alignItems: "center" }}></i>
                          <h4 style={{ color: "rgb(0, 0, 0)" }}>{storeSummary?.pendingIndent ?? 0}</h4>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!hideCharts && (
              <div className="mainDashboardwrp">
                <div className="mainBox1">
                  <div className="box1 box2d">
                    <div className="dashCard-2" style={{ borderColor: getColor(), height: "232px" }}>
                      <MultiAxisLineChart data1={dashboardData?.weeklyTransactionSummary} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DefaultDashboard;

// Helper components remain the same
function SampleCollection({ userWiseDashBoard, chartLabels, title = "Sample Collection Status" }) {
  const [t] = useTranslation();
  const [state, setState] = useState("Bar Chart");

  function getPosition() {
    if (state === "Pie Chart") {
      return { top: "10px", left: "25px" };
    } else {
      return { top: "10px", left: "60%" };
    }
  }

  return (
    <div className="mainDashboardwrp">
      <div className="mainBox1" style={{ width: "100%", height: "280px" }}>
        <div className="d-flex flex-wrap mainHeader">
          <h4>{t(title)}</h4>
          <div style={{ ...getPosition() }}>
            <SelectBox
              name="state"
              options={ChartData}
              value={t(state)}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="chart-container">
            {getChart(state, userWiseDashBoard, chartLabels)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMode({ userWiseDashBoard }) {
  const [t] = useTranslation();
  return (
    <div className="mainDashboardwrp">
      <div className="mainBox1" style={{ width: "100%", height: "244px" }}>
        <div className="d-flex flex-wrap mainHeader">
          <h4>{t("Payment Mode Chart")}</h4>
          <div className="chart-container">
            <LineChartPayment state={userWiseDashBoard} />
          </div>
        </div>
      </div>
    </div>
  );
}
