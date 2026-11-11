import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import ReactApexChart from "react-apexcharts";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import { GetTopVisitorPatients,GetPatientCenterWiseYearly } from "../../NetworkServices/FrontOfficeDashboard";
import { apiUrls } from "../../utils/apiUrls";
import { axiosInstance } from "../../utils/axiosInstance";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
  "linear-gradient(135deg, #0f4c5c 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #7c3503 0%, #f59e0b 100%)",
  "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
];

const BAR_COLORS = [
  "#1d3557","#2563eb","#3b82f6","#60a5fa","#93c5fd",
  "#06b6d4","#0891b2","#0e7490","#155e75","#164e63",
];

const StatCard = ({ icon, label, value, gradient }) => (
  <div className="col-xl-3 col-md-6 mb-2">
    <div style={{
      background: gradient,
      borderRadius: 12,
      padding: "14px 16px 12px",
      color: "#fff",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      position: "relative",
      overflow: "hidden",
      minHeight: 70,
    }}>
      <div style={{ position:"absolute", right:-18, bottom:-18, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
      <div style={{ position:"absolute", right:14, top:-20, width:56, height:56, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:24, fontWeight:700, lineHeight:1, letterSpacing:"-0.5px", marginBottom:4, fontVariantNumeric:"tabular-nums" }}>
            {value}
          </div>
          <div style={{ fontSize:11, opacity:0.88, fontWeight:500, letterSpacing:"0.02em" }}>{label}</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:10, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <i className={icon} style={{ fontSize:14, color:"#fff" }} />
        </div>
      </div>
    </div>
  </div>
);

const PANEL_HEADER = {
  padding: "6px 12px",
  background: "linear-gradient(90deg, #1e3a5f 0%, #2563eb 100%)",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const PANEL_CARD = {
  borderRadius: 12,
  boxShadow: "0 2px 14px rgba(15,23,42,0.08)",
  border: "1px solid #e8eef4",
  background: "#fff",
  overflow: "hidden",
};

const FrontOfficeDashboard = () => {
  const { t } = useTranslation();

  const [payload, setPayload] = useState({ fromDate: new Date(), toDate: new Date(), Centre: [] });
  const [dropDownList, setDropDownList] = useState({ centrelist: [] });
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [centreYearlyData, setCentreYearlyData] = useState([]);
  const [centreYearlyLoading, setCentreYearlyLoading] = useState(false);

  const dateSelect = (value, name) => setPayload((p) => ({ ...p, [name]: value }));
  const handleSelectMultiChange = (select, name) =>
    setPayload((p) => ({ ...p, [name]: select.map((e) => e?.value) }));

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await GetTopVisitorPatients(
        moment(payload.fromDate).format("YYYY-MM-DD"),
        moment(payload.toDate).format("YYYY-MM-DD"),
      );
      setApiData(res?.success && res?.message?.length > 0 ? res.message : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }

    setCentreYearlyLoading(true);
    try {
      const res = await GetPatientCenterWiseYearly(
        payload?.Centre || [],
        moment(payload.fromDate).format("YYYY-MM-DDT00:00:00"),
        moment(payload.toDate).format("YYYY-MM-DDT23:59:59"),
      );
      setCentreYearlyData(res?.success && res?.message?.length > 0 ? res.message : []);
    } catch (e) { console.error(e); }
    finally { setCentreYearlyLoading(false); }
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

  useEffect(() => { handleSearch(); }, []);

  useEffect(() => {
    fetchAllCenter();
  }, []);

  const chartNames  = apiData.map((r) => r.PatientName);
  const chartVisits = apiData.map((r) => r.VisitCount);
  const maxVisit    = Math.max(...chartVisits, 1);
  const totalVisits = chartVisits.reduce((a, b) => a + b, 0);

  const chartOptions = {
    chart: { type:"bar", toolbar:{ show:false }, background:"transparent",
      animations:{ enabled:true, speed:700, animateGradually:{ enabled:true, delay:60 } } },
    plotOptions: { bar:{ horizontal:true, barHeight:"45%", borderRadius:3, distributed:true, dataLabels:{ position:"bottom" } } },
    fill: {
      type: "gradient",
      gradient: { type:"horizontal", shadeIntensity:0.3, gradientToColors: BAR_COLORS.map((c) => c+"bb"), opacityFrom:1, opacityTo:0.85 },
    },
    colors: BAR_COLORS,
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
      textAnchor: "start",
      offsetX: 8,
      style: { fontSize:"10px", fontWeight:700, colors:["#fff"] },
      dropShadow: { enabled:true, top:0, left:0, blur:3, color:"#000", opacity:0.45 },
    },
    xaxis: {
      categories: chartNames,
      labels: { style:{ fontSize:"10px", colors:"#94a3b8", fontFamily:"inherit" }, formatter:(v)=>`${v}` },
      title: { text:"Number of Visits", style:{ fontSize:"10px", color:"#94a3b8", fontWeight:500 } },
      axisBorder: { color:"#e2e8f0" }, axisTicks: { color:"#e2e8f0" },
    },
    yaxis: { labels:{ style:{ fontSize:"10px", fontWeight:600, colors:"#475569", fontFamily:"inherit" }, maxWidth:110, trim:false } },
    tooltip: {
      fixed: { enabled: true, position: "topRight", offsetX: -10, offsetY: 10 },
      custom: ({ dataPointIndex }) => {
        const row = apiData[dataPointIndex];
        const pct = Math.round((row.VisitCount / maxVisit) * 100);
        const rank = dataPointIndex + 1;
        const medal = rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":`#${rank}`;
        return `<div style="padding:12px 16px;font-size:12px;min-width:200px;font-family:inherit;border-radius:8px;background:#fff;box-shadow:0 4px 18px rgba(15,23,42,0.18)">
          <div style="font-weight:700;font-size:13px;color:#1e293b;margin-bottom:8px">${medal} ${row.PatientName}</div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:8px">
            <span style="color:#64748b">Total Visits</span><b style="color:#2563eb">${row.VisitCount}</b>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:4px">
            <span style="color:#64748b">vs #1 Patient</span><b style="color:#0891b2">${pct}%</b>
          </div>
        </div>`;
      },
    },
    legend: { show:false },
    grid: { borderColor:"#f1f5f9", xaxis:{ lines:{ show:true } }, yaxis:{ lines:{ show:false } }, padding:{ left:0, right:8, top:0, bottom:0 } },
  };

  const chartSeries = [{ name:"Visits", data:chartVisits }];

  const centreTotals = Object.values(
    centreYearlyData.reduce((acc, r) => {
      if (!acc[r.CentreName]) acc[r.CentreName] = { CentreName: r.CentreName, VisitCount: 0 };
      acc[r.CentreName].VisitCount += r.VisitCount;
      return acc;
    }, {})
  ).sort((a, b) => b.VisitCount - a.VisitCount);

  const centreNames  = centreTotals.map((r) => r.CentreName);
  const centreVisits = centreTotals.map((r) => r.VisitCount);

  const centreChartOptions = {
    chart: { type:"bar", toolbar:{ show:false }, background:"transparent",
      animations:{ enabled:true, speed:700, animateGradually:{ enabled:true, delay:60 } } },
    plotOptions: { bar:{ horizontal:false, columnWidth:"45%", borderRadius:4, distributed:true, dataLabels:{ position:"top" } } },
    fill: {
      type: "gradient",
      gradient: { type:"vertical", shadeIntensity:0.3, gradientToColors: BAR_COLORS.map((c) => c+"bb"), opacityFrom:1, opacityTo:0.85 },
    },
    colors: BAR_COLORS,
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
      offsetY: -18,
      style: { fontSize:"10px", fontWeight:700, colors:["#475569"] },
    },
    xaxis: {
      categories: centreNames,
      labels: { style:{ fontSize:"10px", colors:"#94a3b8", fontFamily:"inherit" }, rotate:-12, trim:true, hideOverlappingLabels:true },
      axisBorder: { color:"#e2e8f0" }, axisTicks: { color:"#e2e8f0" },
    },
    yaxis: { title:{ text:"Total Visits (Yearly)", style:{ fontSize:"10px", color:"#94a3b8", fontWeight:500 } },
      labels:{ style:{ fontSize:"10px", fontWeight:600, colors:"#475569", fontFamily:"inherit" } } },
    tooltip: {
      fixed: { enabled: true, position: "topRight", offsetX: -10, offsetY: 10 },
      custom: ({ dataPointIndex }) => {
        const row = centreTotals[dataPointIndex];
        return `<div style="padding:12px 16px;font-size:12px;min-width:180px;font-family:inherit;border-radius:8px;background:#fff;box-shadow:0 4px 18px rgba(15,23,42,0.18)">
          <div style="font-weight:700;font-size:13px;color:#1e293b;margin-bottom:8px">${row.CentreName}</div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#64748b">Total Visits</span><b style="color:#2563eb">${row.VisitCount}</b>
          </div>
        </div>`;
      },
    },
    legend: { show:false },
    grid: { borderColor:"#f1f5f9", xaxis:{ lines:{ show:false } }, yaxis:{ lines:{ show:true } }, padding:{ left:0, right:8, top:0, bottom:0 } },
  };

  const centreChartSeries = [{ name:"Visits", data:centreVisits }];

  const EmptyState = ({ height = 200 }) => (
    <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8" }}>
      <div style={{ textAlign:"center" }}>
        <i className="pi pi-inbox" style={{ fontSize:40, display:"block", marginBottom:8, color:"#cbd5e1" }} />
        No data found for selected date range
      </div>
    </div>
  );

  return (
    <div className="row">

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="col-12 mb-2">
        <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 2px 12px rgba(15,23,42,0.07)", padding:"8px 14px" }}>
          <div className="row align-items-end g-2">
            <div className="col-sm">
              <div style={{ fontSize:14, fontWeight:700, color:"#1e293b", lineHeight:1.2 }}>
                <i className="pi pi-chart-bar me-2" style={{ color:"#2563eb" }} />
                {t("Front Office Dashboard")}
              </div>
              <div style={{ fontSize:11.5, color:"#94a3b8", marginTop:3 }}>Top 10 Visitor Patients · Centre Wise</div>
            </div>
            <div className="col-sm-3 col-md-2">
              <DatePicker className="custom-calendar" name="fromDate" placeholder=" " lable="From Date" id="fromDate" value={payload.fromDate} onChange={dateSelect} />
            </div>
            <div className="col-sm-3 col-md-2">
              <DatePicker className="custom-calendar" name="toDate" placeholder=" " lable="To Date" id="toDate" value={payload.toDate} maxDate={new Date()} onChange={dateSelect} />
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
            <div className="col-auto">
              <button
                style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb)", color:"#fff", border:"none", borderRadius:10, padding:"7px 22px", fontWeight:600, fontSize:13, boxShadow:"0 3px 10px rgba(37,99,235,0.3)", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading
                  ? <span className="spinner-border spinner-border-sm" />
                  : <i className="pi pi-search" style={{ fontSize:12 }} />}
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────── */}
      {apiData.length > 0 && (
        <>
          <StatCard icon="pi pi-users"     label="Total Unique Patients" value={apiData.length}                             gradient={CARD_GRADIENTS[0]} />
          <StatCard icon="pi pi-calendar"  label="Total Visits"          value={totalVisits}                                gradient={CARD_GRADIENTS[1]} />
          <StatCard icon="pi pi-star-fill" label="Top Visitor"           value={`${apiData[0]?.VisitCount} visits`}         gradient={CARD_GRADIENTS[2]} />
          <StatCard icon="pi pi-chart-bar" label="Avg Visits / Patient"  value={(totalVisits/apiData.length).toFixed(1)}    gradient={CARD_GRADIENTS[3]} />
        </>
      )}

      {/* ── Chart row: both graphs side by side ─────────────────── */}
      <div className="col-12 mt-1">
      <div className="row g-2 align-items-stretch">

      {/* ── Top Visitor Patients chart ──────────────────────────── */}
      <div className="col-lg-6 col-12">
        <div style={{ ...PANEL_CARD, display:"flex", flexDirection:"column", height:"100%" }}>
          <div style={PANEL_HEADER}>
            <i className="pi pi-chart-bar" style={{ color:"#93c5fd", fontSize:12 }} />
            <span style={{ color:"#fff", fontWeight:700, fontSize:12, flex:1 }}>Top 10 Visitor Patients</span>
            <span style={{ background:"rgba(255,255,255,0.18)", color:"#dbeafe", borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:500 }}>
              {moment(payload.fromDate).format("DD MMM")} — {moment(payload.toDate).format("DD MMM YYYY")}
            </span>
          </div>
          <div style={{ padding:"2px 4px 2px", flex:1, overflow:"hidden" }}>
            {loading ? (
              <div style={{ height:280, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <div className="spinner-border text-primary mb-2" style={{ width:36, height:36 }} />
                  <div className="text-muted small">Fetching data…</div>
                </div>
              </div>
            ) : apiData.length > 0 ? (
              <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={280} />
            ) : (
              <EmptyState height={280} />
            )}
          </div>
        </div>
      </div>

      {/* ── Patient Retention Chart - Yearly ────────────────────── */}
      <div className="col-lg-6 col-12">
        <div style={{ ...PANEL_CARD, display:"flex", flexDirection:"column", height:"100%" }}>
          <div style={PANEL_HEADER}>
            <i className="pi pi-building" style={{ color:"#93c5fd", fontSize:12 }} />
            <span style={{ color:"#fff", fontWeight:700, fontSize:12, flex:1 }}>Patient Retention Chart - Yearly</span>
            <span style={{ background:"rgba(255,255,255,0.18)", color:"#dbeafe", borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:500 }}>
              Centre Wise · Total Visits
            </span>
          </div>
          <div style={{ padding:"2px 4px 2px", flex:1, overflow:"hidden" }}>
            {centreYearlyLoading ? (
              <div style={{ height:280, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <div className="spinner-border text-primary mb-2" style={{ width:36, height:36 }} />
                  <div className="text-muted small">Fetching data…</div>
                </div>
              </div>
            ) : centreTotals.length > 0 ? (
              <ReactApexChart options={centreChartOptions} series={centreChartSeries} type="bar" height={280} />
            ) : (
              <EmptyState height={280} />
            )}
          </div>
        </div>
      </div>

      </div>{/* end row g-2 */}
      </div>{/* end col-12 wrapper */}

    </div>
  );
};

export default FrontOfficeDashboard;
