import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SampleStorageDashboard.css";
import StatsCards from "./StatsCards";
import Heading from "../../../components/UI/Heading";
import DatePicker from "../../../components/formComponent/DatePicker";
import { SelectBox } from "../../../components/formComponent/SelectBox";
import PieChartExample from "./PieChartExample";
import BarChart from "./BarChart";
import { ViewMenu } from "../../../components/SvgIcons";
import DailySampleLifecycleTrend from "./DailySampleLifecycleTrend";
import CustomTable from "../../../components/Table/CustomTable";
import { useNavigate } from "react-router-dom";
import SeeMore from "../frameMenu/SeeMore";
import TrayMaster from "../sampleStorageMaster/TrayMaster";
import TrackMaster from "../sampleStorageMaster/TrackMaster";
import DeviceMaster from "../sampleStorageMaster/DeviceMaster";
import Storage from "../sampleStorage/Storage";
import Issue from "../sampleStorage/Issue";
import Discard from "../sampleStorage/Discard";
import SampleDiscardReport from "../sampleStorage/SampleDiscardReport";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import moment from "moment";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";

const SampleStorageDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [dashboard, setDashboard] = useState([])
  const [payload, setPayload] = useState({
    fromDate: new Date(),
    toDate: new Date(),
    Centre: [],
  });
  const [dropDownList, setDropDownList] = useState({
    centrelist: [],
  });

  const BranchStatsColumns = [
    { header: "Branch", field: "centreName" },
    { header: "Storage Count", field: "Samplestoredcount" },
    { header: "Discard Count", field: "SampleDiscardcount" },
    { header: "Issued Count", field: "SampleIssuecount" },
    { header: "Expired, Not Discarded", field: "SampleExpiredbutnotdiscard" },
    { header: "Approve", field: "ApprovedSamplecount" },
    { header: "Discard %", field: "DiscardPer" },
  ];


  const seeMoreData = [
    {
      name: "Sample Storage Tray Master",
      component: <TrayMaster setShowMore={setShowMore} />,
      url: "/SampleStorageTrayMaster",
    },
    {
      name: "Sample Storage Type Master",
      component: <TrackMaster setShowMore={setShowMore} />,
      url: "/SampleStorageTypeMaster",
    },
    {
      name: "Sample Storage Device Master",
      component: <DeviceMaster setShowMore={setShowMore} />,
      url: "/SampleStorageDeviceMaster",
    },
    {
      name: "Sample Storage",
      component: <Storage setShowMore={setShowMore} />,
      url: "/SampleStorage",
    },
    {
      name: "Sample Issue",
      component: <Issue setShowMore={setShowMore} />,
      url: "/SampleIssue",
    },
    {
      name: "Sample Discard",
      component: <Discard setShowMore={setShowMore} />,
      url: "/Samplediscard",
    },
    {
      name: "Sample Storage Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleStorageReport",
    },
  ];

  const getSampleStorageData = async () => {
    try {
      dispatch(setLoading(true))
      const requests = Array.from({ length: 6 }, (_, i) =>
        axiosInstance.post(apiUrls.Fetchprocedure, {
          typeName: "ss_SampleDashboard",
          params: [
            `${moment(payload?.fromDate).format("yy-MM-DD")}`,
            `${moment(payload?.toDate).format("yy-MM-DD")}`,
            `${payload?.Centre?.join(",")}`,
            (i + 1).toString(), // send 1,2,3,4,5,6
          ],
        })
      );

      const responses = await Promise.all(requests);
      const dashboardData = responses.map((res) => {
        return res?.data?.data
      });
      const dashboardState = dashboardData.reduce((acc, item, idx) => {
        acc[`dashboardBox${idx + 1}`] = item;
        return acc;
      }, {});

      setDashboard(dashboardState);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }finally{
      dispatch(setLoading(false))
    }
  };

  const fetchAllCenter = () => {
    axiosInstance
      .get(apiUrls?.GetAllCentres)
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setDropDownList((prev) => ({ ...prev, centrelist: val }));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchAllCenter();
    getSampleStorageData()
  }, []);

  const dateSelect = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMultiChange = (select, name) => {
    const val = select.map((ele) => {
      return ele?.value;
    });
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <>
      {/* {showMore && <DashboardMenuList />} */}
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
        name={"Sample Storage Dashboard"}
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
              <div className="col-sm">
                <span className={"header-dashboard"}>{t("DashBoard")}</span>
              </div>
              <div className="col-sm-3 col-md-2">
                <DatePicker
                  className="custom-calendar"
                  name="fromDate"
                  placeholder=" "
                  lable="From Date"
                  id="fromDate"
                  value={payload.fromDate}
                  // maxDate={new Date(payload?.ToDate)}
                  onChange={dateSelect}
                />
              </div>
              <div className="col-sm-3 col-md-2">
                <DatePicker
                  className="custom-calendar"
                  name="toDate"
                  placeholder=" "
                  lable="To Date"
                  id="toDate"
                  value={payload?.toDate}
                  maxDate={new Date()}
                  onChange={dateSelect}
                />
              </div>
              <div className="col-sm-3 col-md-2">
                <SelectBoxWithCheckbox
                  name="Centre"
                  className="required-fields"
                  placeholder=" "
                  lable="Centre"
                  id="Centre"
                  onChange={handleSelectMultiChange}
                  options={dropDownList?.centrelist || []}
                  value={payload?.Centre}
                />
              </div>
            <Button onClick={getSampleStorageData} className="px-4 rounded mx-2">Search</Button>
            </div>
          </div>
          <StatsCards cardsData={dashboard?.dashboardBox1} />
        </div>

        {/* <div className="col-md">
          <BarChart graphData={dashboard?.dashboardBox2} />
        </div> */}
        {/* <div className="col-sm-4">
          <PieChartExample />
        </div> */}
        {/* <div className="col-md">
          <DailySampleLifecycleTrend graphData={dashboard?.dashboardBox3} />
        </div> */}
      </div>
      <div className="row mt-3">
        <div className="col-sm-8">
          <div className="card p-2">
            <label>Branch Summary</label>
            <p style={{ color: "#666" }}>
              Detailed Counts and percentages by branch
            </p>
            <CustomTable columns={BranchStatsColumns} data={dashboard?.dashboardBox4} />
          </div>
        </div>
        <div className="col-sm-4">
          {/* <div className="card p-2"> */}
          <div className="card p-3 mb-3">
            <h6>Branches Needing Attention</h6>
            <small>Highest count of expired, non-discarded samples.</small>
            <ul className="mt-2 list-unstyled">
              {dashboard?.dashboardBox5?.map((b, i) => (
                <li
                  key={i}
                  className="d-flex justify-content-between"
                  style={{ color: "red" }}
                >
                  <span>↘ {b?.centreName}</span>
                  <span>{b?.SampleExpiredbutnotdiscard} samples</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Non-Storage Branches */}
          <div className="card p-3">
            <h6>Non-Storage Branches</h6>
            <small>Branches with no sample storage activity.</small>
{            <ul className="mt-2 list-unstyled">
              {dashboard?.dashboardBox6?.length > 0 && dashboard?.dashboardBox6?.map((b, i) => (
                <li
                  key={i}
                  className="d-flex justify-content-between"
                  style={{ color: "green" }}
                >
                  <span>↗ {b?.Centre}</span>
                  <span style={{ color: "black", fontWeight: "bold" }}>
                    0 samples
                  </span>
                </li>
              ))}
            </ul>}
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default SampleStorageDashboard;
