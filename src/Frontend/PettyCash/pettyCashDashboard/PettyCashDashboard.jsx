import React, { useEffect, useState } from "react";
import "../PettyCash.css";
import Heading from "../../../components/UI/Heading";
import DatePicker from "../../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import BarChart from "./BarChart";
import PieChartExample from "../../SampleStorage/sampleStorageDashboad/PieChartExample";
import CustomTable from "../../../components/Table/CustomTable";
import { ViewMenu } from "../../../components/SvgIcons";
import PettyCashTransfer from "../pettyCashTransfer/PettyCashTransfer";
import PettyCashLedgerReport from "../pettyCashLedger/PettyCashLedgerReport";
import ExpenseTypeMaster from "../expenseTypeMaster/ExpenseTypeMaster";
import CenterExpensesEntry from "../centerExpensesEntry/CenterExpensesEntry";
import SeeMore from "../../SampleStorage/frameMenu/SeeMore";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../utils/axiosInstance";
import moment from "moment";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";

const PettyCashDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [centredata, setcentredata] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [cardData, setCardData] = useState([]);
  const [barData, setbarData] = useState({
    category: [],
    series: [],
  });
  const [pieData, setPieData] = useState({
    series: [],
    category: [],
  });
  const [payload, setPayload] = useState({
    fromDate: startOfMonth,
    toDate: new Date(),
    centre: "",
  });
  const dateSelect = (value, name) => {
    setPayload({ ...payload, [name]: value });
  };
  const handleselectChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };
  const fetchAllCenter = async () => {
    await axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: String(ele.CentreID),
          label: ele.Centre,
          CentreCode: ele?.CentreCode,
        }));
        setcentredata(val || []);
        setPayload((prev) => ({ ...prev, centre: val?.[0]?.value }));
        fetchDashboardData(val?.[0]?.value);
        fetchDashboardTable(val?.[0]?.value);
        fetchDashboardBarChart(val?.[0]?.value);
        fetchDashboardPie(val?.[0]?.value);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    fetchAllCenter();
  }, []);

  //  useEffect(() => {
  //     fetchAllCenter();
  // }, []);

  const seeMoreData = [
    {
      name: "Petty Cash Dashboard",
      component: <PettyCashDashboard setShowMore={setShowMore} />,
      url: "/dashboard#pettycash",
    },
    {
      name: "Petty Cash Transfer",
      component: <PettyCashTransfer setShowMore={setShowMore} />,
      url: "/pettycash/petty-cash-transfer",
    },
    {
      name: "Petty Cash Ledger Report",
      component: <PettyCashLedgerReport setShowMore={setShowMore} />,
      url: "/pettycashledger/petty-cash-ledger-report",
    },
    {
      name: "Expense Type Master",
      component: <ExpenseTypeMaster setShowMore={setShowMore} />,
      url: "/pettycashledger/expense-type-master",
    },
    {
      name: " Centre Expense",
      component: <CenterExpensesEntry setShowMore={setShowMore} />,
      url: "/centerexpenseentry/center-expense-entry",
    },
  ];
  // const cardData = [
  //     {
  //         titleKey: "Total Transfer Amount",
  //         value: 301000,
  //         bgColor: "rgba(37, 76, 123, 0.2)",
  //         iconClass: " bi bi-cash",

  //         iconColor: "red",
  //     },
  //     {
  //         titleKey: "Total Received Amount",
  //         value: 280000,
  //         bgColor: "rgba(53, 234, 132, 0.2)",
  //         iconClass: "pi pi-money-bill",
  //         iconColor: "red",
  //     },
  //     {
  //         titleKey: "Total Pending Amount",
  //         value: 6000,
  //         bgColor: "rgba(11, 9, 110, 0.2)",
  //         iconClass: "fa fa-exclamation-triangle",
  //         iconColor: "red",
  //     },
  //     {
  //         titleKey: "Total Rejected Amount",
  //         value: 15000,
  //         bgColor: "rgba(11, 9, 110, 0.2)",
  //         iconClass: "fa fa-exclamation-triangle",
  //         iconColor: "red",
  //     },
  //     {
  //         titleKey: "Total Expense Amount",
  //         value: 28081,
  //         bgColor: "rgba(11, 9, 110, 0.2)",
  //         iconClass: "bi bi-cash",
  //         iconColor: "red",
  //     },
  //     {
  //         titleKey: "Total In-Hand Amount",
  //         value: 251918,
  //         bgColor: "rgba(11, 9, 110, 0.2)",
  //         iconClass: "pi pi-user-plus",
  //         iconColor: "red",
  //     },
  // ];
  const tableHeader = [
    { header: "Centre", field: "centre" },
    { header: "Amount", field: "amount" },
    { header: "Date", field: "date" },
  ];
  // const tableData = [
  //     { centre: "Centre A", amount: "₹100,000", date: "2023-10-01" },
  //     { centre: "Centre B", amount: "₹50,000", date: "2023-10-02" },
  //     { centre: "Centre C", amount: "₹30,000", date: "2023-10-03" },
  //     { centre: "Centre D", amount: "₹20,000", date: "2023-10-04" },
  // ];
  const fetchDashboardData = async (centreId = "") => {
    const fromDateStr = moment(payload?.fromDate).format("YYYY-MM-DD");
    const toDateStr = moment(payload?.toDate).format("YYYY-MM-DD");
    await axiosInstance
      .post("CommonController/Fetchprocedure", {
        typeName: "pettycash_dashboard",
        params: [
          `${fromDateStr}T00:00:00`,
          `${toDateStr}T23:59:59`,
          `${[centreId]?.join(',') || payload?.centre?.join(',')}`,
          "1",
        ],
      })
      .then((res) => {
        const data = res?.data?.data || [];
        console.log("Fetched table data: ", data);
        setCardData(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const fetchDashboardTable = async (centreId = "") => {
    const fromDateStr = moment(payload?.fromDate).format("YYYY-MM-DD");
    const toDateStr = moment(payload?.toDate).format("YYYY-MM-DD");
    dispatch(setLoading(true));
    await axiosInstance
      .post("CommonController/Fetchprocedure", {
        typeName: "pettycash_dashboard",
        params: [
          `${fromDateStr}T00:00:00`,
          `${toDateStr}T23:59:59`,
          `${[centreId]?.join(',') || payload?.centre?.join(',')}`,
          "4",
        ],
      })
      .then((res) => {
        const data = res?.data?.data || [];
        console.log("Fetched table data: ", data);
        setTableData(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
  const fetchDashboardBarChart = async (centreId = "") => {
    const fromDateStr = moment(payload?.fromDate).format("YYYY-MM-DD");
    const toDateStr = moment(payload?.toDate).format("YYYY-MM-DD");
    dispatch(setLoading(true));
    await axiosInstance
      .post("CommonController/Fetchprocedure", {
        typeName: "pettycash_dashboard",
        params: [
          `${fromDateStr}T00:00:00`,
          `${toDateStr}T23:59:59`,
          `${[centreId]?.join(',') || payload?.centre?.join(',')}`,
          "2",
        ],
      })
      .then((res) => {
        const data = res?.data?.data || [];
        console.log("Fetched table data: ", data);
        let allIssue = [];
        let allExpense = [];
        let allCategoryCentre = [];
        const allcategoryName = data?.map((item, idx) => {
          allIssue?.push(Math.abs(item.TotalIssue));
          allExpense.push(Math.abs(item?.TotalExpense));
          allCategoryCentre.push(item?.centre);
          return item;
        });
        setbarData((prev) => ({
          ...prev,
          series: [
            {
              name: "Issue",
              data: allIssue || [],
            },
            {
              name: "Consumption",
              data: allExpense || [],
            },
          ],
          category: allCategoryCentre || [],
        }));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
  const fetchDashboardPie = async (centreId = "") => {
    const fromDateStr = moment(payload?.fromDate).format("YYYY-MM-DD");
    const toDateStr = moment(payload?.toDate).format("YYYY-MM-DD");
    dispatch(setLoading(true));
    await axiosInstance
      .post("CommonController/Fetchprocedure", {
        typeName: "pettycash_dashboard",
        params: [
          `${fromDateStr}T00:00:00`,
          `${toDateStr}T23:59:59`,
          `${[centreId]?.join(',') || payload?.centre?.join(',')}`,
          "3",
        ],
      })
      .then((res) => {
        const data = res?.data?.data || [];
        console.log("Fetched table data: ", data);

        const allExpense = data.map((item) =>
          Math.abs(item?.TotalExpense ?? 0)
        );
        const allCategoryCentre = data.map((item) => item?.centre ?? "");

        setPieData((prev) => ({
          ...prev,
          series: allExpense,
          category: allCategoryCentre,
        }));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  console.log("barData:::", barData);
  console.log("piedata:::", pieData);

  const handleSearch = () => {
    fetchDashboardData();
    fetchDashboardTable();
    fetchDashboardBarChart();
    fetchDashboardPie();
  };

  const handleSelectMultiChange = (select, name) => {
    console.log('multiSelc', select, '---', name);
    const val = select.map((ele) => {
      return ele?.value;
    });
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <>
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
      <Heading
        name={"Petty Cash Dashboard"}
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
              <div className="col-sm-4">
                <span className={"header-dashboard"}>{t("DashBoard")}</span>
              </div>
              {/* <ReactSelect
                name="centre"
                id="centre"
                removeIsClearable={true}
                isShowBorder={true}
                dynamicOptions={centredata}
                placeholderName="Centre"
                value={payload?.centre}
                onChange={handleselectChange}
                respclass={"col-sm-2"}
              /> */}
              <div className="col-sm-3 col-md-2">
                <SelectBoxWithCheckbox
                  name="centre"
                  className="required-fields"
                  placeholder=" "
                  lable="Centre"
                  id="centre"
                  onChange={handleSelectMultiChange}
                  options={centredata || []}
                  value={payload?.centre}
                />
              </div>
              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  name="fromDate"
                  placeholder=" "
                  value={payload?.fromDate}
                  onChange={dateSelect}
                  lable="From Date"
                  id="From Date"
                />
              </div>
              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  name="toDate"
                  placeholder=" "
                  lable="To Date"
                  id="toDate"
                  value={payload?.toDate}
                  onChange={dateSelect}
                />
              </div>

              <div className="col-sm-2 d-flex align-items-center gap-5">
                <div className="w-100">
                  <button
                    onClick={handleSearch}
                    className="btn btn-sm btn block btn-success px-5"
                    type="submit"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3 ">
        {cardData.map((card, index) => (
          <>
            <div className="col-md-2 ">
              <div className="w-100 h-100 pb-lg-0 pb-3">
                <div
                  key={index}
                  className="dashboard-card h-100"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <h4 className="dashboard-card-title">{t(card.Metric)}</h4>
                  <div className="dashboard-card-content">
                    <i
                      className={card.iconClass}
                      style={{ color: card.iconColor }}
                    ></i>
                    <h4
                      className="dashboard-card-value"
                      style={{ color: card.valueColor || "#000" }}
                    >
                      {card.Amount}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </>
        ))}
      </div>
      <div className="row mt-2">
        <div className="col-md-4 col-12 ">
          <div className="w-100 h-100">
            <BarChart categories={barData?.category} series={barData?.series} />
          </div>
        </div>
        <div className="col-md-4 col-12">
          <div className="w-100  h-100">
            <PieChartExample
              series={pieData?.series}
              category={pieData?.category}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-2 mt-3 ">
            <label>Centre Wise Transfer</label>
            <p className="overview-text">
              An overview of recent transfers to various centers.
            </p>
            <CustomTable
              columns={tableHeader}
              data={tableData?.map((itm) => ({
                ...itm,
                centre: itm?.Centre,
                amount: itm?.TransferAmount,
                date: itm?.TransferDate,
              }))}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PettyCashDashboard;
