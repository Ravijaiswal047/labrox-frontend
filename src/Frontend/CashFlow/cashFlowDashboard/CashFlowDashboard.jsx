import React, { useEffect, useState } from "react";
import Heading from "../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
// import DashboardMenuList from "../../../pages/DashboardFrame/DashboardMenuList";
import { ViewMenu } from "../../../components/SvgIcons";
import InHandCashChart from "./InHandCashChart";
import DailyCashMovementChart from "./DailyCashMovementChart";
import CustomTable from "../../../components/Table/CustomTable";
import "./CashFlowDashboard.css";
// import { SelectBox } from "../../../components/formComponent/SelectBox";
import DatePicker from "../../../components/formComponent/DatePicker";
// import CashFlowFrameMenu from "../CashFlowFrameMenu";
import SeeMore from "../../SampleStorage/frameMenu/SeeMore";
import CashTransferMaster from "../cashTransferMaster/CashTransferMaster";
import CashTransfer from "../cashTransfer/CashTransfer";
import CashReceive from "../cashReceive/CashReceive";
import CashBalanceReportDateWise from "../cashBalanceReportDateWise/CashBalanceReportDateWise";
import { useNavigate } from "react-router-dom";
import { apiUrls } from "../../../utils/apiEndpoints";
import { axiosInstance } from "../../../utils/axiosInstance";
import moment from "moment";
import { notify } from "../../../utils/utils";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";

const CashFlowDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const [tableData, setTableData] = useState([]);
  const [centreID, setCentreID] = useState([]);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const [showMore, setShowMore] = useState(false);
  const [payload, setPayload] = useState({
    fromDate: startOfMonth,
    toDate: new Date(),
    centre: "",
  });
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
    fetchdashboardApi("", "", value?.value);
  };
  const dateSelect = (value, name) => {
    if (name === "fromDate") {
      setPayload({
        ...payload,
        [name]: value,
      });
      fetchdashboardApi(value, "", payload?.centre);
    } else if (name === "toDate") {
      setPayload({
        ...payload,
        [name]: value,
      });
      fetchdashboardApi("", value, payload?.centre);
    }
  };
  const TopCashHandlerColumns = [
    { header: "User", field: "user" },
    { header: "Total Volume", field: "totalVolume" },
    { header: "Total Sent", field: "totalSent" },
    { header: "Total Received", field: "totalReceived" },
  ];

  const topCashHandlerData = tableData?.topUsers?.map((ele, index) => ({
    user: ele?.userName || "N/A",
    totalVolume: `₹${ele?.totalVolume?.toLocaleString() || 0}`,
    totalSent: `₹${ele?.totalSent?.toLocaleString() || 0}`,
    totalReceived: `₹${ele?.totalReceived?.toLocaleString() || 0}`,
  }));

  const seeMoreData = [
    {
      name: "Cash Transfer Master",
      component: <CashTransferMaster setShowMore={setShowMore} />,
      url: "/CashTransferMaster",
    },
    {
      name: "Cash Transfer",
      component: <CashTransfer setShowMore={setShowMore} />,
      url: "/CashTransfer",
    },
    {
      name: "Cash Receive",
      component: <CashReceive setShowMore={setShowMore} />,
      url: "/CashReceive",
    },
    {
      name: "Cash Balance Report Date Wise",
      component: <CashBalanceReportDateWise setShowMore={setShowMore} />,
      url: "/CashBalanceReportDateWise",
    },
  ];

  const fetchdashboardApi = async (fromDate, toData, centre) => {
    const fromDateStr = moment(fromDate ? fromDate : payload?.fromDate).format(
      "YYYY-MM-DD"
    );
    const toDateStr = moment(toData ? toData : payload?.toDate).format(
      "YYYY-MM-DD"
    );
    const reqbody = {
      centerID: centre ? Number(centre) : Number(payload?.centre) || 0,
      fromDate: `${fromDateStr}T00:00:00`,
      toDate: `${toDateStr}T23:59:59`,
    };
    await axiosInstance
      .post(apiUrls?.CashFlowDashboard, reqbody)
      .then((res) => {
        setTableData(res?.data?.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const cardData = [
    {
      titleKey: "Total Inhand Cash",
      value: tableData?.summary?.totalInHandCash ?? 0,
      bgColor: "rgba(37, 76, 123, 0.2)",
      iconClass: "pi pi-user-plus",
      iconColor: "red",
    },
    {
      titleKey: "Total Bank Deposits",
      value: tableData?.summary?.totalBankDeposit ?? 0,
      bgColor: "rgba(53, 234, 132, 0.2)",
      iconClass: "pi pi-money-bill",
      iconColor: "red",
    },
    {
      titleKey: "Pending Transfer",
      value: tableData?.summary?.pendingTransfer ?? 0,
      bgColor: "rgba(11, 9, 110, 0.2)",
      iconClass: "fa fa-exclamation-triangle",
      iconColor: "red",
    },
  ];
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
        const data = res?.data?.data?.map((ele) => ({
          label: ele?.Centre,
          value: ele?.CentreID,
        }));
        setCentreID(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchAllCenter("");
    fetchdashboardApi();
  }, []);
  console.log(centreID);
  return (
    <>
      {/* {showMore && <CashFlowFrameMenu />} */}
      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}
      {/* <div className="card"> */}
      <Heading
        name={"Cash Flow Dashboard"}
        isBreadcrumb={true}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      />
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="row py-4 px-2">
              <div className="col-sm-3">
                <span className={"header-dashboard"}>{t("DashBoard")}</span>
              </div>
              <div className="col-sm-3">
                <DatePicker
                  className="custom-calendar"
                  name="fromDate"
                  placeholder=" "
                  lable="From Date"
                  id="fromDate"
                  value={payload?.fromDate}
                  maxDate={new Date(payload?.fromDate)}
                  onChange={dateSelect}
                  // onChange={(date) =>
                  //   setPayload((prev) => ({ ...prev, fromDate: date }))
                  // }
                />
              </div>
              <div className="col-sm-3">
                <DatePicker
                  className="custom-calendar"
                  name="toDate"
                  placeholder=" "
                  lable="To Date"
                  id="toDate"
                  value={payload?.toDate}
                  maxDate={new Date(payload?.toDate)}
                  onChange={dateSelect}
                  // onChange={(date) =>
                  //   setPayload((prev) => ({ ...prev, toDate: date }))
                  // }
                />
              </div>
              <ReactSelect
                name="centre"
                id="centre"
                removeIsClearable={true}
                dynamicOptions={centreID}
                placeholderName="centre"
                value={payload?.centre}
                onChange={handleSelectChange}
                respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
                className={"required-fields"}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-sm-12">
          <div className="dashboard-wrapper">
            <div className="dashboard-section">
              <div className="dashboard-cards">
                {cardData.map((card, index) => (
                  <div
                    key={index}
                    className="dashboard-card"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <h4 className="dashboard-card-title">{t(card.titleKey)}</h4>
                    <div className="dashboard-card-content">
                      <i
                        className={card.iconClass}
                        style={{ color: card.iconColor }}
                      ></i>
                      <h4
                        className="dashboard-card-value"
                        style={{ color: card.valueColor || "#000" }}
                      >
                        {card.value}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}

      <div className="row mt-2">
        <div className="col-sm-4">
          <div className="card p-2">
            <label>In-Hand Cash per User</label>
            <p style={{ color: "#666" }}>Current cash balance for each user.</p>
            <div style={{ width: "100%", height: 200 }}>
              <InHandCashChart data={tableData?.userInHand} />
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-2">
            <label>Daily Cash Moment</label>
            <p style={{ color: "#666" }}>Total Amount Transferred Per Day.</p>
            <div style={{ width: "100%", height: 200 }}>
              <DailyCashMovementChart data={tableData?.dailyFlow} />
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-2">
            <label>Top Cash Handler</label>
            <p style={{ color: "#666" }}>
              Users managing the highest volume of cash (sent + received).
            </p>
            <CustomTable
              columns={TopCashHandlerColumns}
              data={topCashHandlerData}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CashFlowDashboard;
