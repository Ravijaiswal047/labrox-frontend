import React, { useEffect, useState, useCallback } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { axiosInstance } from "../../utils/axiosInstance";
import Heading from "../../components/UI/Heading";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import DatePicker from "../../components/formComponent/DatePicker";

// ─── Status color map ────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Completed: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
  Pending: { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  Cancelled: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  default: { bg: "#e0f2fe", text: "#075985", dot: "#0ea5e9" },
};

const getStatusStyle = (status) =>
  STATUS_COLORS[status] || STATUS_COLORS.default;

// ─── Booking chip ─────────────────────────────────────────────────────────────
const BookingChip = ({ booking, onClick }) => {
  const s = getStatusStyle(booking.CStatus);
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(booking);
      }}
      style={{
        background: s.bg,
        color: s.text,
        borderRadius: 6,
        padding: "2px 6px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        marginBottom: 2,
        display: "flex",
        alignItems: "center",
        gap: 4,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        maxWidth: "100%",
      }}
      title={booking.PatientName}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {booking.PatientName}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const HomeCollectionCalender = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const [viewType, setViewType] = useState("month");
  const [currentDate, setCurrentDate] = useState(moment());
  const [tableData, setTableData] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultTheme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const dateOptions = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  // ── Date range helpers ────────────────────────────────────────────────────
  const getRange = useCallback((date, view) => {
    if (view === "day")
      return {
        from: date.clone().startOf("day"),
        to: date.clone().endOf("day"),
      };
    if (view === "week")
      return {
        from: date.clone().startOf("week"),
        to: date.clone().endOf("week"),
      };
    return {
      from: date.clone().startOf("month"),
      to: date.clone().endOf("month"),
    };
  }, []);

  const rangeLabel = useCallback(
    (date, view) => {
      if (view === "day") return date.format("dddd, D MMMM YYYY");
      if (view === "week") {
        const { from, to } = getRange(date, view);
        return `${from.format("D MMM")} – ${to.format("D MMM YYYY")}`;
      }
      return date.format("MMMM YYYY");
    },
    [getRange],
  );

  //  const handleDateChange = (value, name) => {
  //   setPayload((prev) => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (date, view) => {
      const { from, to } = getRange(date, view);
      setLoading(true);
      try {
        const res = await axiosInstance.post("HomeCollectionSearch/GetData", {
          date: view,
          FromDate: from.format("DD/MMM/YYYY"),
          ToDate: to.format("DD/MMM/YYYY"),
          FromTime: "00:00:00",
          ToTime: "23:59:59",
          DateOption: "hc.AppID",
        });
        const data = res.data?.message;
        if (Array.isArray(data)) setTableData(data);
        else {
          setTableData([]);
          toast.error(data || "No record found");
        }
      } catch (err) {
        console.error(err);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    },
    [getRange],
  );

  useEffect(() => {
    fetchData(currentDate, viewType);
  }, [currentDate, viewType]);

  // ── Group bookings by date ────────────────────────────────────────────────
  const bookingsByDate = {};
  tableData.forEach((b) => {
    const d = moment(b.AppDate, "DD-MMM-YYYY hh:mm A");
    if (d.isValid()) {
      const key = d.format("YYYY-MM-DD");
      if (!bookingsByDate[key]) bookingsByDate[key] = [];
      bookingsByDate[key].push(b);
    }
  });

  // ── Navigation ────────────────────────────────────────────────────────────
  const prev = () => setCurrentDate((d) => d.clone().subtract(1, viewType));
  const next = () => setCurrentDate((d) => d.clone().add(1, viewType));
  const goToday = () => setCurrentDate(moment());

  // ── Build calendar days ───────────────────────────────────────────────────
  const buildDays = () => {
    if (viewType === "day") return [currentDate.clone()];
    if (viewType === "week") {
      const start = currentDate.clone().startOf("week");
      return Array.from({ length: 7 }, (_, i) => start.clone().add(i, "days"));
    }
    const start = currentDate.clone().startOf("month").startOf("week");
    const end = currentDate.clone().endOf("month").endOf("week");
    const days = [];
    let cur = start.clone();
    while (cur.isSameOrBefore(end, "day")) {
      days.push(cur.clone());
      cur.add(1, "day");
    }
    return days;
  };

  const days = buildDays();
  const isMonth = viewType === "month";
  const isDay = viewType === "day";
  const weeks = isMonth ? Math.ceil(days.length / 7) : 1;
  const CHIP_LIMIT = 2;
  const gridCols = isDay ? 1 : 7;

  return (
    <>
      <Heading
        title={t("Home Collection Calendar")}
        isBreadcrumb={false}
        secondTitle={
          <div
            className="d-none d-md-flex align-items-center"
            style={{ gap: 8 }}
          >
            <div style={{ width: 110, marginTop: "5px" }}>
              <ReactSelect
                dynamicOptions={dateOptions}
                name="date"
                lable={t("")}
                id="date"
                removeIsClearable={true}
                placeholderName={t("")}
                value={viewType}
                onChange={(name, val) => {
                  if (val?.value) setViewType(val.value);
                }}
              />
            </div>
          </div>
        }
      />

      {/* Calendar container */}
      <div style={{ padding: "12px 16px", fontFamily: "inherit" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={goToday} style={todayBtn}>
              Today
            </button>
            <button onClick={prev} style={navBtn}>
              &#8249;
            </button>
            <button onClick={next} style={navBtn}>
              &#8250;
            </button>
            {/* <div className="col-sm-2">
              <DatePicker
                name="date"
                id="FromDate"
                lable={t("FromDate")}
                value={}
                onChange={handleDateChange}
              />
            </div>
            <div className="col-sm-2">
              <DatePicker
                name="date"
                id="ToDate"
                lable={t("ToDate")}
                value={}
                onChange={handleDateChange}
              />
            </div> */}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
            {rangeLabel(currentDate, viewType)}
          </div>
          {loading && (
            <span style={{ fontSize: 12, color: "#6b7280" }}>Loading…</span>
          )}
        </div>

        {/* Day headers */}
        {!isDay && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              marginBottom: 4,
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  paddingBottom: 4,
                }}
              >
                {d}
              </div>
            ))}
          </div>
        )}

        {/* Calendar grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: isDay
              ? "1fr"
              : `repeat(${weeks}, minmax(${isMonth ? 100 : 140}px, auto))`,
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            overflow: "hidden",
            background: "#f8fafc",
          }}
        >
          {days.map((day, idx) => {
            const key = day.format("YYYY-MM-DD");
            const bookings = bookingsByDate[key] || [];
            const isToday = day.isSame(moment(), "day");
            const isOtherMonth = isMonth && !day.isSame(currentDate, "month");
            const visible = bookings.slice(0, CHIP_LIMIT);
            const more = bookings.length - CHIP_LIMIT;

            return (
              <div
                key={key}
                style={{
                  background: isOtherMonth ? "#f1f5f9" : "#fff",
                  borderRight:
                    (idx + 1) % gridCols === 0 ? "none" : "1px solid #e2e8f0",
                  borderBottom:
                    idx >= days.length - gridCols
                      ? "none"
                      : "1px solid #e2e8f0",
                  padding: "6px",
                  minHeight: isDay ? 320 : isMonth ? 100 : 140,
                  position: "relative",
                }}
              >
                {/* Day number */}
                <div
                  style={{
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isDay ? "flex-start" : "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontSize: isDay ? 13 : 12,
                      fontWeight: isToday ? 800 : 500,
                      color: isToday
                        ? "#fff"
                        : isOtherMonth
                          ? "#cbd5e1"
                          : "#374151",
                      background: isToday ? "#3b82f6" : "transparent",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* {console.log("is day date", day.format('D'))} */}
                    {day.format("D")}
                  </span>
                </div>

                {/* Booking chips */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {visible.map((b, i) => (
                    <BookingChip
                      key={b.PreBookingId || i}
                      booking={b}
                      onClick={setSelectedBooking}
                    />
                  ))}
                  {more > 0 && (
                    <div
                      onClick={() =>
                        navigate("/homeCollectionSearch", {
                          state: {
                            FromDate: day.format("DD/MMM/YYYY"),
                            ToDate: day.format("DD/MMM/YYYY"),
                          },
                        })
                      }
                      style={{
                        fontSize: 11,
                        color: "#3b82f6",
                        fontWeight: 700,
                        cursor: "pointer",
                        paddingLeft: 2,
                        marginTop: 1,
                      }}
                    >
                      +{more} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        visible={!!selectedBooking}
        className={defaultTheme}
        header={t("Booking Detail")}
        onHide={() => setSelectedBooking(null)}
        style={{ width: isMobile ? "90vw" : "50vw" }}
        draggable={false}
        resizable={false}
      >
        {selectedBooking &&
          (() => {
            const s = getStatusStyle(selectedBooking.CStatus);
            return (
              <div style={{ padding: "4px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      background: s.bg,
                      color: s.text,
                      borderRadius: 20,
                      padding: "2px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {selectedBooking.CStatus}
                  </span>
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>
                    #{selectedBooking.PreBookingId}
                  </span>
                </div>

                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {selectedBooking.PatientName}
                </div>
                <div
                  style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}
                >
                  {selectedBooking.Age} · {selectedBooking.Gender} ·{" "}
                  {selectedBooking.Mobile}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px 20px",
                    fontSize: 13,
                  }}
                >
                  {[
                    ["Appointment", selectedBooking.AppDate],
                    ["Phlebo", selectedBooking.PhleboName],
                    ["Route", selectedBooking.RouteName],
                    ["Centre", selectedBooking.Centre],
                    ["Payment", selectedBooking.PaymentMode],
                    [
                      "Source",
                      selectedBooking.SourceofCollection === "1"
                        ? "Lab"
                        : selectedBooking.SourceofCollection,
                    ],
                    ["Address", selectedBooking.House_No],
                    ["Doctor", selectedBooking.Doctor],
                  ].map(([label, val]) =>
                    val ? (
                      <div key={label}>
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            marginBottom: 2,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ fontWeight: 500 }}>{val}</div>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            );
          })()}
      </Dialog>
    </>
  );
};

// ── Button styles ─────────────────────────────────────────────────────────────
const navBtn = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 6,
  width: 30,
  height: 30,
  cursor: "pointer",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#374151",
  lineHeight: 1,
};
const todayBtn = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 6,
  padding: "4px 12px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
};

export default HomeCollectionCalender;
