import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function CustomCalender({
  currentDate,
  onMonthChange,

  rangeStart,
  rangeEnd,
  onRangeChange,

  holidays = {},
  sundayColors = {},

  height = "50vh",
  background = "white",
}) {

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const prevMonth = () => {
    const updated = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    onMonthChange(updated);
  };

  const nextMonth = () => {
    const updated = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    onMonthChange(updated);
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    let cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    return cells;
  };

  const handleSelect = (day) => {
    if (!day) return;

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // If start empty
    if (!rangeStart) {
      onRangeChange(date, null);
      return;
    }

    // If clicked earlier → reset start
    if (date < rangeStart) {
      onRangeChange(date, null);
      return;
    }

    // If end empty → set end
    if (!rangeEnd) {
      onRangeChange(rangeStart, date);
      return;
    }

    // If both selected → restart
    onRangeChange(date, null);
  };

  const isInRange = (day) => {
    if (!day || !rangeStart || !rangeEnd) return false;

    const check = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    return check >= rangeStart && check <= rangeEnd;
  };

  const cells = getCalendarDays();

  return (
    <div
      className="p-4 border rounded shadow"
      style={{ background, height }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button onClick={prevMonth} className="btn btn-success">
          <FaChevronLeft />
        </button>

        <h2 className="fw-bold mb-0 fs-2 card card_background px-4 py-1 border">
          {monthNames[currentDate.getMonth()]} - {currentDate.getFullYear()}
        </h2>

        <button onClick={nextMonth} className="btn btn-success">
          <FaChevronRight />
        </button>
      </div>

      {/* Week Day Names */}
      <div className="d-flex text-center fw-semibold">
        {days.map((d) => (
          <div key={d} className="custom_calendar-col card">
            <strong>{d}</strong>
          </div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="d-flex flex-wrap text-center">
        {cells.map((day, idx) => {
          const fullDate =
            day &&
            `${currentDate.getFullYear()}-${String(
              currentDate.getMonth() + 1
            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          let bgColor = "";

          // Holiday color
          if (day && holidays[fullDate]) {
            bgColor = holidays[fullDate];
          }

          // Sundays
          else if (
            day &&
            new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 0
          ) {
            bgColor = sundayColors[day] || "";
          }

          // Range Logic
          const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

          const isStart = rangeStart && thisDate.getTime() === rangeStart.getTime();
          const isEnd = rangeEnd && thisDate.getTime() === rangeEnd.getTime();

          if (isInRange(day)) bgColor = "#b3d9ff"; // in range
          if (isStart) bgColor = "#007bff";        // start
          if (isEnd) bgColor = "#004085";          // end

          return (
            <div key={idx} className="custom_calendar-col">
              <div
                onClick={() => handleSelect(day)}
                className="border rounded d-flex align-items-center justify-content-center"
                style={{
                  height: "40px",
                  cursor: day ? "pointer" : "default",
                  backgroundColor: bgColor,
                  color: bgColor ? "white" : "black",
                  fontWeight: bgColor ? "bold" : "normal",
                }}
              >
                {day || ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
