import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import DatePicker from "../components/formComponent/DatePicker";
import { axiosInstance } from "../utils/axiosInstance";
import Loading from "../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../components/formComponent/ReactSelect";

const DashboardNew = () => {
  const [combineDashboardData, setCombineDashboardData] = useState([]);
  const [accessCentre, setAccessCentre] = useState([]);
  const [payload, setPayload] = useState({
    CentreID: "",
    Date: new Date(),
  });
  const [load, setLoad] = useState(false);

  const generateRandomColor = (numColors) => {
    const r = Math.floor(Math.random() * 225);
    const g = Math.floor(Math.random() * 225);
    const b = Math.floor(Math.random() * 225);
    return `rgba(${r}, ${g}, ${b}, 1.1)`;
  };
  // const dashboardData = [
  //   {
  //     label: "TOTAL TESTS",
  //     value: combineDashboardData?.TotalTest,
  //     iconClass: "pi pi-money-bill",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "AMENDMENT REPORT",
  //     value: combineDashboardData?.AmendmendTest,
  //     iconClass: "fas fa-pause-circle",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "REPEATED TESTS",
  //     value: combineDashboardData?.RepeatedTest,
  //     iconClass: "pi pi-credit-card",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "REJECTED TEST",
  //     value: combineDashboardData?.RejectedTest,
  //     iconClass: "pi pi-wallet",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "ABNORMAL TEST",
  //     value: combineDashboardData?.AbnormalTest,
  //     iconClass: "fa fa-exclamation-triangle",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "CRITICAL REPORT",
  //     value: combineDashboardData?.CriticalReport,
  //     iconClass: "pi pi-globe",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "OUTSOURCE TEST",
  //     value: combineDashboardData?.OutsourceTest,
  //     iconClass: "pi pi-globe",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "INHOUSE TEST",
  //     value: combineDashboardData?.InhouseTest,
  //     iconClass: "pi pi-briefcase",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "ONHOLD TEST",
  //     value: combineDashboardData?.OnHoldTest,
  //     iconClass: "pi pi-user-plus",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "REG PATIENT",
  //     value: combineDashboardData?.RegPatient,
  //     iconClass: "pi pi-user-plus",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "NET SALE",
  //     value: combineDashboardData?.NetSale,
  //     iconClass: "pi pi-user-plus",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "PENDING TEST",
  //     value: combineDashboardData?.PendingTest,
  //     iconClass: "pi pi-user-plus",
  //     color: generateRandomColor(),
  //   },
  //   {
  //     label: "TESTED",
  //     value: combineDashboardData?.Tested,
  //     iconClass: "pi pi-user-plus",
  //     color: generateRandomColor(),
  //   },
  // ];

  const dashboardData = [
    {
      label: "TOTAL TESTS",
      value: combineDashboardData?.TotalTest,
      iconClass: "pi pi-money-bill",
      color: "rgba(75, 192, 192, 1)", // Teal
    },
    {
      label: "AMENDMENT REPORT",
      value: combineDashboardData?.AmendmendTest,
      iconClass: "fas fa-pause-circle",
      color: "rgba(255, 99, 132, 1)", // Red
    },
    {
      label: "REPEATED TESTS",
      value: combineDashboardData?.RepeatedTest,
      iconClass: "pi pi-credit-card",
      color: "rgba(255, 159, 64, 1)", // Orange
    },
    {
      label: "REJECTED TEST",
      value: combineDashboardData?.RejectedTest,
      iconClass: "pi pi-wallet",
      color: "rgba(153, 102, 255, 1)", // Purple
    },
    {
      label: "ABNORMAL TEST",
      value: combineDashboardData?.AbnormalTest,
      iconClass: "fa fa-exclamation-triangle",
      color: "rgba(54, 162, 235, 1)", // Blue
    },
    {
      label: "CRITICAL REPORT",
      value: combineDashboardData?.CriticalReport,
      iconClass: "pi pi-globe",
      color: "rgba(255, 205, 86, 1)", // Yellow
    },
    {
      label: "OUTSOURCE TEST",
      value: combineDashboardData?.OutsourceTest,
      iconClass: "pi pi-globe",
      color: "rgba(201, 203, 207, 1)", // Light Grey
    },
    {
      label: "INHOUSE TEST",
      value: combineDashboardData?.InhouseTest,
      iconClass: "pi pi-briefcase",
      color: "rgba(100, 181, 246, 1)", // Light Blue
    },
    {
      label: "ONHOLD TEST",
      value: combineDashboardData?.OnHoldTest,
      iconClass: "pi pi-user-plus",
      color: "rgba(255, 171, 145, 1)", // Soft Orange
    },
    {
      label: "REG PATIENT",
      value: combineDashboardData?.RegPatient,
      iconClass: "pi pi-user-plus",
      color: "rgba(174, 213, 129, 1)", // Light Green
    },
    {
      label: "NET SALE",
      value: combineDashboardData?.NetSale,
      iconClass: "pi pi-user-plus",
      color: "rgba(126, 87, 194, 1)", // Deep Purple
    },
    {
      label: "PENDING TEST",
      value: combineDashboardData?.PendingTest,
      iconClass: "pi pi-user-plus",
      color: "rgba(255, 238, 88, 1)", // Bright Yellow
    },
    {
      label: "TESTED",
      value: combineDashboardData?.Tested,
      iconClass: "pi pi-user-plus",
      color: "rgba(129, 199, 132, 1)", // Mint Green
    },
  ];

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
            };
          });
          callbackFun(
            "CentreID",
            CentreDataValue?.map((ele) => ele?.value),
          );
          state(CentreDataValue);
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((err) => {
        console.log("API call failed:", err);
      });
  };

  const [t] = useTranslation();

  const fetchuserdata = (payload, value, type) => {
    setLoad(true);
    axiosInstance
      .post("CommonController/GetDashBoardDataNew", {
        CentreIDList:
          type === "CentreID"
            ? Array.isArray(value)
              ? value.join(",")
              : String(value)
            : Array.isArray(payload?.CentreID)
              ? payload?.CentreID.join(",")
              : String(payload?.CentreID),
        // CentreIDList: Array.isArray(payload?.CentreID)
        //       ? payload?.CentreID.join(",")
        //       : String(payload?.CentreID),
        Date: moment(payload?.Date).format("YYYY-MM-DD"),
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
            : err?.data?.message,
        );
      });
  };

  console.log({ combineDashboardData });

  useEffect(() => {
    getDashboardAccessCentres({
      state: setAccessCentre,
      callbackFun: (type, values) => {
        let data = { ...payload };
        data.CentreID = values;
        fetchuserdata(data, values, type);
      },
    });
  }, []);

  const getOutput = (name, value) => {
    const data = { ...payload };
    if (Array.isArray(payload.CentreID) || payload.CentreID == "") {
      data.CentreID = accessCentre?.map((ele) => ele?.value);
    }
    data[name] =
      name == "CentreID" && value == 0
        ? accessCentre?.map((ele) => ele?.value)
        : value;
    fetchuserdata(data, value, name);
  };
  const getDate = (key) => {
    return combineDashboardData?.dashboardSummary?.[key] ?? 0;
  };

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

  const hardcodedData = [
    {
      centre: "ONCQUEST BANGALORE",
      totalTests: 330,
      amendmentReport: "2.42%",
      repeatedTests: "1.82%",
      rejectedTests: "0.00%",
      abnormalTest: "9.39%",
      criticalReport: "30.30%",
      autoValidateReport: "0.00%",
      sraToApprove3hr: "63.94%",
      sraToApproveMore3hr: "3.03%",
    },
    {
      centre: "ONCQUEST HYDERABAD",
      totalTests: 173,
      amendmentReport: "0.00%",
      repeatedTests: "0.58%",
      rejectedTests: "0.58%",
      abnormalTest: "6.94%",
      criticalReport: "6.36%",
      autoValidateReport: "0.00%",
      sraToApprove3hr: "37.57%",
      sraToApproveMore3hr: "0.58%",
    },
    {
      centre: "ONCQUEST HYDERABAD",
      totalTests: 173,
      amendmentReport: "0.00%",
      repeatedTests: "0.58%",
      rejectedTests: "0.58%",
      abnormalTest: "6.94%",
      criticalReport: "6.36%",
      autoValidateReport: "0.00%",
      sraToApprove3hr: "37.57%",
      sraToApproveMore3hr: "0.58%",
    },
    {
      centre: "ONCQUEST HYDERABAD",
      totalTests: 173,
      amendmentReport: "0.00%",
      repeatedTests: "0.58%",
      rejectedTests: "0.58%",
      abnormalTest: "6.94%",
      criticalReport: "6.36%",
      autoValidateReport: "0.00%",
      sraToApprove3hr: "37.57%",
      sraToApproveMore3hr: "0.58%",
    },
    {
      centre: "ONCQUEST HYDERABAD",
      totalTests: 173,
      amendmentReport: "0.00%",
      repeatedTests: "0.58%",
      rejectedTests: "0.58%",
      abnormalTest: "6.94%",
      criticalReport: "6.36%",
      autoValidateReport: "0.00%",
      sraToApprove3hr: "37.57%",
      sraToApproveMore3hr: "0.58%",
    },
    {
      centre: "ONCQUEST HYDERABAD",
      totalTests: 173,
      amendmentReport: "0.00%",
      repeatedTests: "0.58%",
      rejectedTests: "0.58%",
      abnormalTest: "6.94%",
      criticalReport: "6.36%",
      autoValidateReport: "0.00%",
      sraToApprove3hr: "37.57%",
      sraToApproveMore3hr: "0.58%",
    },
  ];

  const columns = [
    "CENTRE",
    "TOTAL TESTS",
    "AMENDMENT REPORT %",
    "REPEATED TESTS %",
    "REJECTED TESTS %",
    "ABNORMAL TEST %",
    "CRITICAL REPORT %",
    "AUTO VALIDATE REPORT",
    "SRA TO APPROVE (Within 3Hr)",
    "SRA TO APPROVE (More than 3Hr)",
  ];

  return (
    <>
      {load && <Loading />}
      <div className="card-dashboard">
        <div className="row mt-2">
          <span className={"col-sm-6 col-6 header-dashboard"}>
            {t("DashBoard")}
          </span>
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
              name="Date"
              placeholder=" "
              value={new Date(payload.Date)}
              id="Date"
              lable="Date"
              onChange={(value, name) => {
                setPayload((ele) => ({ ...ele, [name]: value }));
                getOutput(name, value);
              }}
            />
          </div>
          {/* <div className="col-sm-2">
              <button
                type="submit"
                className="btn btn-block btn-info btn-sm"
                onClick={()=>fetchuserdata(payload, payload?.CentreID, "CentreID")}
              >
                {t("Search")}
              </button>
            </div> */}
        </div>
      </div>
      <div className="card-dashboard">
        <div className="row">
          <div className="col-sm-12 mt-1">
            <div className="mainDashboardwrp">
              <div className="mainBox1" id="sda">
                {/* <div className="mainHeader">
                  <h4>{t("Booking Trends")}</h4>
                </div> */}
                <div className="responsive-grid">
                  {dashboardData?.map((data, index) => (
                    <div
                      className="custom-box mainBox"
                      style={{ border: `1px solid ${data?.color}` }}
                    >
                      {/* Floating Icon */}
                      <div
                        className="showIcon"
                        style={{ backgroundColor: data?.color }}
                      >
                        <i
                          className={data?.iconClass}
                          style={{ color: "#fff", fontSize: "18px" }}
                        ></i>
                      </div>

                      {/* Content Below */}
                      <div
                        style={{
                          top: "10px",
                          right: "10px",
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#2e6db5",
                          }}
                        >
                          {data?.label}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#666",
                          }}
                        >
                          {t("COUNT :")} {data?.value ? data?.value : 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="mainDashboardwrp">
        <div className="mainBox1">
          <table style={{ width: "100%" }}>
            <tr className="">
              {columns.map((col, idx) => (
                <th key={idx} className="p-2">
                  {col}
                </th>
              ))}
            </tr>
          
            {hardcodedData.map((row, rowIndex) => (
          <tr key={rowIndex} className="text-sm">
            {[
              row.centre,
              row.totalTests,
              row.amendmentReport,
              row.repeatedTests,
              row.rejectedTests,
              row.abnormalTest,
              row.criticalReport,
              row.autoValidateReport,
              row.sraToApprove3hr,
              row.sraToApproveMore3hr,
            ].map((data, colIndex) => (
              <td
                key={colIndex}
                className="p-2"
                 style={{
                  width: colIndex === 0 ? "20%" : "auto",
                }}
              >
                <div
                style={{
                    fontWeight: "bold",
                    color: "white",
                    borderRadius:"5px",
                    textAlign:"center",
                  backgroundColor: columnColors[colIndex],
                }}
                >

                {data}
                </div>
              </td>
            )
            )}
          </tr>
        ))}
          </table>
        </div>
      </div> */}
    </>
  );
};

export default DashboardNew;
