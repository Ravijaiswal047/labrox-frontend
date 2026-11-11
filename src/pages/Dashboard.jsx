import React, { useEffect, useState } from "react";
import Welcome from "../components/WelComeCard/Welcome";
import moment from "moment";
import { toast } from "react-toastify";
import { SelectBox } from "../components/formComponent/SelectBox";
import { ChartData, getChart } from "./utitlity";
import DatePicker from "../components/formComponent/DatePicker";
import { axiosInstance } from "../utils/axiosInstance";
import Marque from "../components/UI/Marque";
import { Bar, Pie } from "react-chartjs-2";
import MultiAxisLineChart from "./MultiAxisLineChart";
import RazorPay from "../Frontend/Payment/RazorPay";
import { BirthDaySVGIcon } from "../components/SvgIcons";
import Loading from "../components/loader/Loading";
import PlaceholderImage from "./PlaceholderImage.png";
import LineChartPayment from "./modules/LineChartPayment";
import QrCodeDropdown from "../layouts/header/qrcode-dropdown/QrCodeDropdown";

import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import { Tooltip } from "primereact/tooltip";
import { festivals } from "../utils/Constants";
import ReactSelect from "../components/formComponent/ReactSelect";
import { useLocation, useNavigate } from "react-router-dom";
import ForceChangePasswordModal from "../modules/login/ForceChangePasswordModal";
import ClientExpiryModal from "../modules/login/ClientExpiryModal";
import { logOut } from "../utils/axiosInstance";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const [showForceChangePassword, setShowForceChangePassword] = useState(
    searchParams.get("forceChangePassword") === "true"
  );

  const handleForceChangeSuccess = () => {
    setShowForceChangePassword(false);
    logOut();
  };

  const handleForceChangeCancel = () => {
    setShowForceChangePassword(false);
    navigate("/dashboard", { replace: true });
  };

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryData,      setExpiryData]      = useState([]);
  const [expiryMessage,   setExpiryMessage]   = useState('');

  const dashboardUserData = useLocalStorage("userData", "get");
  useEffect(() => {
    if (dashboardUserData?.ShowClientNearToExpiry == 1) {
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

  const [combineDashboardData, setCombineDashboardData] = useState([]);
  const [accessCentre, setAccessCentre] = useState([]);
  const [payload, setPayload] = useState({
    CentreID: 0,
    FromDate: new Date(),
    FromTime: "00:00:00",
    ToDate: new Date(),
    ToTime: "23:59:59",
  });
  const [load, setLoad] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // console.log({ accessCentre });

  const [newsLetter, setNewsLetter] = useState([]);
  const [bottom, setBottom] = useState(20);
  const [prevScroll, setPrevScroll] = useState(window.scrollY);
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > prevScroll) {
        // Scrolling down, keep it at 20px from the bottom
        setBottom(20);
      } else {
        // Scrolling up, move the button upwards
        setBottom(50 + currentScroll * 0.2);
      }
      setPrevScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScroll]);
  useEffect(() => {
    const todayDate = moment(new Date()).format("YYYY-MM-DD");
    const todayFestivals = festivals?.filter((item) => item.date == todayDate);
    const upcomingFestivals = festivals
      .filter((item) => item.date > todayDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    setNewsLetter([...todayFestivals, ...upcomingFestivals]);
  }, []);

  const getDashboardAccessCentres = ({ state, callbackFun }) => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        if (Array.isArray(data)) {
          let CentreDataValue = data.map((ele) => {
            return {
              value: ele.CentreID,
              label: ele.Centre,
              B2B: ele.BTB,
              SUBPCC: ele.SUBPCC, // added for subpcc
              Image: ele.awsKey || ele.awsKeySubpcc || "",
            };
          });

          state(CentreDataValue);
          callbackFun(
            "CentreID",
            CentreDataValue?.map((ele) => ele?.value)
          );
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((err) => {
        console.log("API call failed:", err);
      });
  };

  const [t] = useTranslation();
  
  const centreId = useLocalStorage("DefaultCentre", "get");
  const showQRIcon = accessCentre.find((ele) => ele?.value === centreId);
  
  const DesignationName = useLocalStorage("userData", "get")?.DesignationName;
  const HideBirthday = useLocalStorage("userData", "get")?.HideBirthday;
  
  const handleHeightOfBirthDaycard = () => {
    let welcome_wrp = document
      .getElementById("welcome_wrp")
      ?.getBoundingClientRect().height;
    let birthdayHead = document
      .getElementById("birthdayHead")
      ?.getBoundingClientRect().height;
    return welcome_wrp - (birthdayHead ? birthdayHead : 27.66);
  };

  const generateRandomColor = (numColors) => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  };
  const fetchuserdata = (payload, value, type, state) => {
    setLoad(true);
    axiosInstance
      .post("CommonController/GetDashboard_Data", {
        CentreId:
          type === "CentreID"
            ? Array.isArray(value)
              ? 0
              : Number(value) || 0
            : Array.isArray(payload?.CentreID)
              ? 0
              : Number(payload?.CentreID) || 0,
        FromDate:
          type === "FromDate"
            ? moment(value).format("YYYY-MM-DD")
            : moment(payload?.FromDate).format("YYYY-MM-DD"),
        ToDate:
          type === "ToDate"
            ? moment(value).format("YYYY-MM-DD")
            : moment(payload?.ToDate).format("YYYY-MM-DD"),
        FromTime: type === "FromTime" ? value : payload?.FromTime,
        ToTime: type === "ToTime" ? value : payload?.ToTime,
      })
      .then((res) => {
        setLoad(false);
        state(res?.data?.message);
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

  useEffect(() => {
    getDashboardAccessCentres({
      state: setAccessCentre,
      callbackFun: (type, values) => {
        let data = { ...payload };
        data.CentreID = values;
        fetchuserdata(data, values, type, setCombineDashboardData);
      },
    });
  }, []);

  const returnTotalCount = (type) => {
    return combineDashboardData?.smsCount?.length > 0
      ? combineDashboardData?.smsCount?.reduce(
          (acc, item) => acc + Number(item[type]),
          0
        )
      : 0;
  };
  const getOutput = (name, value) => {
    const data = { ...payload };
    if (Array.isArray(payload.CentreID) || payload.CentreID == "") {
      data.CentreID = accessCentre?.map((ele) => ele?.value);
    }
    data[name] =
      name == "CentreID" && value == 0
        ? accessCentre?.map((ele) => ele?.value)
        : value;
    fetchuserdata(data, value, name, setCombineDashboardData);
  };
  const getDate = (key) => {
    return combineDashboardData?.dashboardSummary?.[key] ?? 0;
  };

  // console.log({ combineDashboardData });

  const handleSearchSelectChange = (label, value) => {
    console.log({ label, value });
    let selectedvalue = String(value?.value);
    console.log({ selectedvalue });
    if (selectedvalue == 0 || selectedvalue == "") {
      selectedvalue = accessCentre?.map((ele) => ele?.value);
    }
    setPayload({ ...payload, CentreID: selectedvalue });
    getOutput(label, selectedvalue);
  };

  const getLastThreeMonths = () => {
    const date = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentMonthIndex = date.getMonth();
    const previousMonthIndex =
      currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
    const twoMonthsAgoIndex =
      currentMonthIndex <= 1
        ? 11 - (1 - currentMonthIndex)
        : currentMonthIndex - 2;
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
      case "Default":
        return "#ada9fc";
      case "light Green":
        return "lightgreen";
      case "Peach":
        return "#ffdab9";
      case "Pale Pink":
        return "#fc9de4";
      case "Red":
        return "#FFCCCB";
      case "SkyBlue":
        return "#6dd2e3";
      case "Grey":
        return "lightgrey";
      default:
        return "white";
    }
  };

  const summary = combineDashboardData?.dashboardSummary || {};
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
    datasets: [
      {
        label: "Sales Status",
        data: [
          summary?.twoMonthsAgoCollection || 0.1, // Replace 0 with small value for placeholder
          summary?.lastMonthCollection || 0.1,
          summary?.currentMonthRevenue || 0.1,
        ],
        backgroundColor: [
          summary.twoMonthsAgoCollection > 0
            ? summary.twoMonthsAgoCollection >= summary.lastMonthCollection
              ? "#e6f9f0"
              : "#ffe6e6"
            : "#cccccc", // Placeholder color for zero data
          summary.lastMonthCollection > 0
            ? summary.lastMonthCollection >= summary.twoMonthsAgoCollection
              ? "#e6f9f0"
              : "#ffe6e6"
            : "#cccccc",
          summary?.currentMonthRevenue > 0 ? "#fffff2" : "#cccccc",
        ],
        borderColor: [
          summary.twoMonthsAgoCollection > 0
            ? summary.twoMonthsAgoCollection >= summary.lastMonthCollection
              ? "#007f00"
              : "#9b0000"
            : "#999999", // Border color for zero data placeholder
          summary.lastMonthCollection > 0
            ? summary.lastMonthCollection >= summary.twoMonthsAgoCollection
              ? "#007f00"
              : "#9b0000"
            : "#999999",
          summary?.currentMonthRevenue > 0 ? "#b3a300" : "#999999",
        ],
        borderWidth: 2,
      },
    ],
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
      <ForceChangePasswordModal
        show={showForceChangePassword}
        onSuccess={handleForceChangeSuccess}
        onCancel={handleForceChangeCancel}
      />
      {showExpiryModal && (
        <ClientExpiryModal
          data={expiryData}
          message={expiryMessage}
          onClose={() => setShowExpiryModal(false)}
        />
      )}
      <RazorPay />
      {load && <Loading />}
      <div className="card-dashboard">
        <div className="row mt-2">
          {
            <span
              className={`${
                (showQRIcon?.B2B == "1" || showQRIcon?.SUBPCC == "1") &&
                showQRIcon?.Image != "" &&
                (DesignationName == "B2B" || DesignationName == "SUB PCC")
                  ? "col-sm-1 col-6"
                  : "col-sm-2 col-6"
              } header-dashboard`}
            >
              {t("DashBoard")}
            </span>
          }
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
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.2)")
                    } // Zoom in on hover
                    onMouseLeave={(e) =>
                      (e.target.style.transform = "scale(1)")
                    }
                  ></i>
                  <span className="black chat-count">
                    {combineDashboardData?.smsCount?.[0]?.UsedWhatsAppCount ??
                      0}
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
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.2)")
                    } // Zoom in on hover
                    onMouseLeave={(e) =>
                      (e.target.style.transform = "scale(1)")
                    }
                  ></i>
                  <span className="black chat-count">
                    {combineDashboardData?.smsCount?.[0]?.UsedSmsCount ?? 0}/
                    {returnTotalCount("SmsCount")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div
            className={`${
              combineDashboardData?.smsCount?.length > 0
                ? "col-sm-2 col-6"
                : "col-sm-3 col-6"
            }`}
          >
            <ReactSelect
              dynamicOptions={[
                { label: "All Centre", value: [0] },
                ...accessCentre,
              ]}
              value={payload?.CentreID}
              name="CentreID"
              label={t("Centre")}
              removeIsClearable={true}
              placeholderName={t("All Centre")}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-3">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              placeholder=" "
              value={new Date(payload.FromDate)}
              id="From Date"
              maxDate={new Date(payload?.ToDate)}
              lable="FromDate"
              onChange={(value, name) => {
                setPayload((ele) => ({ ...ele, [name]: value }));
                getOutput(name, value);
              }}
            />
          </div>
          <div className="col-sm-3">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              placeholder=" "
              value={new Date(payload.ToDate)}
              id="To Date"
              lable="ToDate"
              maxDate={new Date()}
              minDate={new Date(payload?.FromDate)}
              onChange={(value, name) => {
                setPayload((ele) => ({ ...ele, [name]: value }));
                getOutput(name, value);
              }}
            />
          </div>
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
      </div>
      <div className="card-dashboard">
        <div className="row">
          <div className="col-sm-6">
            <Welcome />
            <SampleCollection
              userWiseDashBoard={combineDashboardData?.dashboardSummary}
            />
            <PaymentMode
              userWiseDashBoard={combineDashboardData?.paymentSummary}
            />
          </div>

          <div className="col-sm-6 mt-1">
            <div className="row">
              {HideBirthday != 1 && (
                <div className="col-md">
                  <div className="birthDay-Box">
                    <div
                      className="birthdayHead d-flex justify-content-between"
                      id="birthdayHead"
                    >
                      <span style={{ fontWeight: 700, color: "#fb5353" }}>
                        {t("Upcoming BirthDay")}{" "}
                      </span>
                      {/* ({moment().format("dddd, MMMM Do YYYY")}) */}
                    </div>
                    <div
                      style={{
                        padding: "2px",
                      }}
                    >
                      <Marque height={handleHeightOfBirthDaycard()}>
                        {combineDashboardData?.upcomingBirthDays?.map(
                          (item, index) => (
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
                                    <img
                                      src={item?.imagePath}
                                      className="img-holder"
                                    />
                                  ) : (
                                    <img
                                      src={PlaceholderImage}
                                      alt=""
                                      className="img-holder"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </Marque>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-md">
                <div className="birthDay-Box">
                  <div
                    className="birthdayHead d-flex justify-content-between"
                    id="birthdayHead"
                  >
                    <span style={{ fontWeight: 700, color: "blue" }}>
                      {t("Upcoming Holidays")}
                    </span>
                    {/* ({moment(payloadData?.fromDate).format("DD-MMM-YYYY")} -{" "}
                    {moment(payloadData?.toDate).format("DD-MMM-YYYY")} ) */}
                  </div>
                  <div
                    style={{
                      padding: "2px",
                    }}
                  >
                    <Marque height={handleHeightOfBirthDaycard()}>
                      {newsLetter?.map((item, index) => {
                        // console.log("marque",{ item });
                        return (
                          <div
                            className="birthdayBody mt-2"
                            key={index}
                            // onClick={() => handleNewsModal(item)}
                          >
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
                                <svg
                                  width="24"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13h-1v6h6v-1h-5z"
                                    fill="currentColor"
                                  />
                                </svg>
                                {item?.date}
                              </div>
                              <div style={{ color: "green" }}>
                                <svg
                                  width="20"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="12"
                                    cy="8"
                                    r="4"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                  />
                                  <path
                                    d="M4 20C4 15.5817 7.58172 12 12 12C16.4183 12 20 15.5817 20 20"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                  />
                                </svg>{" "}
                                {t(item?.description)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </Marque>
                  </div>
                </div>
              </div>
            </div>
            <div className="mainDashboardwrp">
              <div className="mainBox1" id="sda">
                <div className="mainHeader">
                  <h4>{t("Booking Trends")}</h4>
                </div>
                <div className="mainBoxes">
                  <div
                    className="box1 box2d"
                    style={{ backgroundColor: "rgba(37, 76, 123, 0.2)" }}
                  >
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {t("Today's Registration")}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i
                          className="pi pi-user-plus"
                          style={{
                            color: "red",
                            backgroundColor: "rgb(255, 245, 245)",
                            margin: "0px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        ></i>

                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {getDate("todayRegistration") ?? 0}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div
                    className="box1 box2d"
                    style={{ backgroundColor: "rgba(53, 234, 132, 0.2)" }}
                  >
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {t("Today's Revenue")}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i
                          className="pi pi-money-bill"
                          style={{
                            color: "red",
                            backgroundColor: "rgb(255, 245, 245)",
                            margin: "0px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        ></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {getDate("todayRevenue") ?? 0}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div
                    className="box1 box2d"
                    style={{ backgroundColor: "rgba(11, 9, 110, 0.2)" }}
                  >
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {t(currentMonth)} {t("Registrations")}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i
                          className="pi pi-calendar"
                          style={{
                            color: "red",
                            backgroundColor: "rgb(255, 245, 245)",
                            margin: "0px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        ></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {summary?.currentMonthRegistrationCount}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div
                    className="box1 box2d"
                    style={{ backgroundColor: "rgba(25, 60, 173, 0.2)" }}
                  >
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {t(twoMonthsAgo)} {t("Revenue")}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i
                          className="pi pi-money-bill"
                          style={{
                            color: "red",
                            backgroundColor: "rgb(255, 245, 245)",
                            margin: "0px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        ></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {summary?.twoMonthsAgoCollection}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div
                    className="box1 box2d"
                    style={{ backgroundColor: "rgba(53, 1, 98, 0.2)" }}
                  >
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {t(previousMonth)} {t("Revenue")}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i
                          className="pi pi-money-bill"
                          style={{
                            color: "red",
                            backgroundColor: "rgb(255, 245, 245)",
                            margin: "0px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        ></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {summary?.lastMonthCollection}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div
                    className="box1 box2d"
                    style={{ backgroundColor: "rgba(153, 175, 54, 0.2)" }}
                  >
                    <div className="d-flex align-items-center justify-content-between pt-2">
                      <h4 style={{ color: "rgb(0, 0, 0)" }}>
                        {t(currentMonth)} {t("Revenue")}
                      </h4>
                    </div>
                    <div>
                      <div className="nameIcon d-flex align-items-center justify-content-between pt-2">
                        <i
                          className="pi pi-money-bill"
                          style={{
                            color: "red",
                            backgroundColor: "rgb(255, 245, 245)",
                            margin: "0px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        ></i>
                        <h4 style={{ color: "rgb(0, 0, 0)" }}>
                          {summary?.currentMonthRevenue}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mainDashboardwrp">
              <div className="mainBox1">
                <div className="box1 box2d">
                  <div
                    className="dashCard-2"
                    style={{ borderColor: getColor(), height: "232px" }}
                  >
                    <MultiAxisLineChart
                      data1={combineDashboardData?.weeklyTransactionSummary}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

function SampleCollection({ userWiseDashBoard }) {
  const [t] = useTranslation();
  // console.log({ userWiseDashBoard });
  const [state, setState] = useState("Bar Chart");

  function getPosition() {
    if (state === "Pie Chart") {
      return { top: "10px", left: "25px" };
    } else {
      return { top: "10px", left: "60%" };
    }
  }

  return (
    <>
      <div className="mainDashboardwrp">
        <div className="mainBox1" style={{ width: "100%", height: "280px" }}>
          <div className="d-flex flex-wrap mainHeader">
            {" "}
            <h4>{t("Sample Collection Status")}</h4>
            <div style={{ ...getPosition() }}>
              <SelectBox
                name="state"
                options={ChartData}
                value={t(state)}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="chart-container">
              {" "}
              {getChart(state, userWiseDashBoard)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PaymentMode({ userWiseDashBoard }) {
  const [t] = useTranslation();
  return (
    <>
      <div className="mainDashboardwrp">
        <div className="mainBox1" style={{ width: "100%", height: "244px" }}>
          <div className="d-flex flex-wrap mainHeader">
            {" "}
            <h4>{t("Payment Mode Chart")}</h4>
            <div className="chart-container">
              {" "}
              <LineChartPayment state={userWiseDashBoard} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
