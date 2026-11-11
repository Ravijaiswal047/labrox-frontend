import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";

const DefaultDashboardNew = ({ filters, accessCentre }) => {
  const [combineDashboardData, setCombineDashboardData] = useState([]);
  const [load, setLoad] = useState(false);
  const [t] = useTranslation();

  const dashboardData = [
    {
      label: "TOTAL TESTS",
      value: combineDashboardData?.TotalTest,
      iconClass: "pi pi-money-bill",
      color: "rgba(75, 192, 192, 1)",
    },
    {
      label: "AMENDMENT REPORT",
      value: combineDashboardData?.AmendmendTest,
      iconClass: "fas fa-pause-circle",
      color: "rgba(255, 99, 132, 1)",
    },
    {
      label: "REPEATED TESTS",
      value: combineDashboardData?.RepeatedTest,
      iconClass: "pi pi-credit-card",
      color: "rgba(255, 159, 64, 1)",
    },
    {
      label: "REJECTED TEST",
      value: combineDashboardData?.RejectedTest,
      iconClass: "pi pi-wallet",
      color: "rgba(153, 102, 255, 1)",
    },
    {
      label: "ABNORMAL TEST",
      value: combineDashboardData?.AbnormalTest,
      iconClass: "fa fa-exclamation-triangle",
      color: "rgba(54, 162, 235, 1)",
    },
    {
      label: "CRITICAL REPORT",
      value: combineDashboardData?.CriticalReport,
      iconClass: "pi pi-globe",
      color: "rgba(255, 205, 86, 1)",
    },
    {
      label: "OUTSOURCE TEST",
      value: combineDashboardData?.OutsourceTest,
      iconClass: "pi pi-globe",
      color: "rgba(201, 203, 207, 1)",
    },
    {
      label: "INHOUSE TEST",
      value: combineDashboardData?.InhouseTest,
      iconClass: "pi pi-briefcase",
      color: "rgba(100, 181, 246, 1)",
    },
    {
      label: "ONHOLD TEST",
      value: combineDashboardData?.OnHoldTest,
      iconClass: "pi pi-user-plus",
      color: "rgba(255, 171, 145, 1)",
    },
    {
      label: "REG PATIENT",
      value: combineDashboardData?.RegPatient,
      iconClass: "pi pi-user-plus",
      color: "rgba(174, 213, 129, 1)",
    },
    {
      label: "NET SALE",
      value: combineDashboardData?.NetSale,
      iconClass: "pi pi-user-plus",
      color: "rgba(126, 87, 194, 1)",
    },
    {
      label: "PENDING TEST",
      value: combineDashboardData?.PendingTest,
      iconClass: "pi pi-user-plus",
      color: "rgba(255, 238, 88, 1)",
    },
    {
      label: "TESTED",
      value: combineDashboardData?.Tested,
      iconClass: "pi pi-user-plus",
      color: "rgba(129, 199, 132, 1)",
    },
  ];

  const fetchuserdata = () => {
    if (!filters?.CentreID) return;

    setLoad(true);
    axiosInstance
      .post("CommonController/GetDashBoardDataNew", {
        CentreIDList: Array.isArray(filters?.CentreID)
          ? filters?.CentreID.join(",")
          : String(filters?.CentreID),
        Date: moment(filters?.Date || new Date()).format("YYYY-MM-DD"),
      })
      .then((res) => {
        setLoad(false);
        setCombineDashboardData(res?.data?.message);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message || err?.data?.message || "Error fetching data"
        );
      });
  };

  useEffect(() => {
    if (filters?.CentreID && accessCentre?.length > 0) {
      fetchuserdata();
    }
  }, [filters, accessCentre]);

  return (
    <>
      {load && <Loading />}
      <div className="card-dashboard">
        <div className="row">
          <div className="col-sm-12 mt-1">
            <div className="mainDashboardwrp">
              <div className="mainBox1" id="sda">
                <div className="responsive-grid">
                  {dashboardData?.map((data, index) => (
                    <div
                      key={index}
                      className="custom-box mainBox"
                      style={{ border: `1px solid ${data?.color}` }}
                    >
                      <div
                        className="showIcon"
                        style={{ backgroundColor: data?.color }}
                      >
                        <i
                          className={data?.iconClass}
                          style={{ color: "#fff", fontSize: "18px" }}
                        ></i>
                      </div>

                      <div style={{ textAlign: "right" }}>
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
    </>
  );
};

export default DefaultDashboardNew;