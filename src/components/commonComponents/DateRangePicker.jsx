import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
  isSameMonth,
  startOfDay,
  startOfWeek,
  subDays,
  addDays,
  addYears,
  subYears,
} from "date-fns";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { notify } from "../../utils/ustil2";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

export default function CustomDateRangePicker({
  startDate: propStart = null,
  endDate: propEnd = null,
  months = 2,
  dateFormat = "dd/MMM/yyyy",
  placeholder = "",
  label = "Date Range",
  disableField = false,
  disableRange = false,
  minDate = startOfDay(new Date(1947, 0, 1)),
  maxDate = new Date(),
  open: controlledOpen,
  currentMonth: controlledMonth,
  onChange,
  onOpenChange,
  labelKey,
  presets = [],
  name = "",
  id,
  respClass,
  isShowFullDate = false,
  ...rest
}) {
  const [openState, setOpenState] = useState(false);
  const appFontSize = useLocalStorage("appFontSize", "get");
  const open = controlledOpen !== undefined ? controlledOpen : openState;

  const [monthState, setMonthState] = useState(
    startOfMonth(propStart || new Date())
  );
  const currentMonth =
    controlledMonth !== undefined ? controlledMonth : monthState;

  const [view, setView] = useState("day"); // 'day','month','year'
  const [isMobile, setIsMobile] = useState(false);

  // Portal needs document.body, which only exists on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const inputRef = useRef(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [inputValue, setInputValue] = useState("");
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!propStart) {
      setInputValue("");
      return;
    }
    const startStr = format(propStart, dateFormat);
    setInputValue(propEnd ? `${startStr} to ${format(propEnd, dateFormat)}` : startStr);
  }, [propStart, propEnd, dateFormat]);

  useEffect(() => {
    const handler = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        if (controlledOpen === undefined) setOpenState(false);
        onOpenChange?.(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, controlledOpen, onOpenChange]);

  const toggleOpen = useCallback(() => {
    if (disableField) return;
    const newOpen = !open;
    if (controlledOpen === undefined) setOpenState(newOpen);
    onOpenChange?.(newOpen);
  }, [open, disableField, controlledOpen, onOpenChange]);


  const handleDayClick = useCallback(
    (day) => {
      if (disableField || disableRange || day < minDate || day > maxDate) return;

      let newStart = propStart;
      let newEnd = propEnd;

      if (!propStart) {
        newStart = day;
        newEnd = null;
      } else if (propStart && propEnd) {
        newStart = day;
        newEnd = null;
      } else if (propStart && !propEnd) {
        if (isSameDay(day, propStart)) {
          newStart = null;
          newEnd = null;
        } else {
          newStart = day < propStart ? day : propStart;
          newEnd = day < propStart ? propStart : day;
        }
      }

      const fakeEvent = {
        target: {
          name: name || labelKey || id,
          value: { startDate: newStart, endDate: newEnd ?? undefined },
        },
      };
      onChange?.(fakeEvent);

      if (newEnd) {
        if (controlledOpen === undefined) setOpenState(false);
        onOpenChange?.(false);
      }
    },
    [
      propStart,
      propEnd,
      disableField,
      disableRange,
      minDate,
      maxDate,
      onChange,
      name,
      labelKey,
      id,
      controlledOpen,
      onOpenChange,
    ]
  );

  const getPreviewEnd = () => (propStart && !propEnd ? hoverDate : null);
  const isInRange = (day) => {
    const start = propStart;
    const end = propEnd ?? getPreviewEnd();
    if (!start || !end) return false;
    const [s, e] = start < end ? [start, end] : [end, start];
    return isWithinInterval(day, { start: s, end: e }) && !isSameDay(day, s) && !isSameDay(day, e);
  };
  const isStart = (day) => propStart && isSameDay(day, propStart);
  const isEnd = (day) => propEnd && isSameDay(day, propEnd);


  const effectiveMonths = view === "day" ? (isMobile ? 1 : months) : 1;
  const monthArray = Array.from({ length: effectiveMonths }, (_, i) =>
    addMonths(currentMonth, i)
  );

  const handleMonthChange = useCallback(
    (e, direction) => {
      e.preventDefault();
      const next = direction === "next";
      let newMonth;
      if (view === "day") newMonth = (next ? addMonths : subMonths)(currentMonth, 1);
      else if (view === "month") newMonth = (next ? addYears : subYears)(currentMonth, 1);
      else newMonth = (next ? addYears : subYears)(currentMonth, 10);
      if (controlledMonth === undefined) setMonthState(newMonth);
    },
    [view, currentMonth, controlledMonth]
  );

  const handleHeaderClick = useCallback(() => {
    if (view === "day") setView("month");
    else if (view === "month") setView("year");
  }, [view]);

  const getTitle = (monthDate, view) => {
    if (view === "day") return format(monthDate, "MMMM yyyy");
    if (view === "month") return format(monthDate, "yyyy");
    const y = monthDate.getFullYear();
    const decade = Math.floor(y / 10) * 10;
    return `${decade} - ${decade + 9}`;
  };


  const today = startOfDay(new Date());
  const defaultPresets = [
    { label: "Week to date", getRange: () => ({ start: startOfWeek(today, { weekStartsOn: 0 }), end: today }) },
    { label: "Month to date", getRange: () => ({ start: startOfMonth(today), end: today }) },
    { label: "Last 7 days", getRange: () => ({ start: subDays(today, 6), end: today }) },
    { label: "Last 14 days", getRange: () => ({ start: subDays(today, 13), end: today }) },
    { label: "Last 30 days", getRange: () => ({ start: subDays(today, 29), end: today }) },
  ];

  const activePresets = presets.length ? presets : defaultPresets;
  const showPresetPanel = activePresets.length > 0;

  const isDateAllowed = (date) => date >= minDate && date <= maxDate;

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getRange(propStart);
    if ((start && !isDateAllowed(start)) || (end && !isDateAllowed(end))) {
      notify("Can't Select preset contains disabled dates", "warn")
      return;
    }

    const fakeEvent = {
      target: { name: name || labelKey || id, value: { startDate: start, endDate: end } },
    };
    onChange?.(fakeEvent);
    if (controlledOpen === undefined) setOpenState(false);
    onOpenChange?.(false);
  };

  const isPresetActive = (preset) => {
    if (!propStart || !propEnd) return false;
    const { start: s, end: e } = preset.getRange(propStart);
    return isSameDay(propStart, s) && isSameDay(propEnd, e);
  };

  const updatePopupPosition = useCallback(() => {
    if (!open || !containerRef.current || !popupRef.current) return;
    const container = containerRef.current;
    const popup = popupRef.current;
    const rect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    popup.style.left = "";
    popup.style.right = "";
    popup.style.top = "";
    popup.style.bottom = "";
    popup.style.transform = "";

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const popupHeight = popup.offsetHeight;
    const popupWidth = popup.offsetWidth;

    // Vertical: prefer below the input, flip above only when there isn't room.
    if (spaceBelow >= popupHeight + 10) {
      popup.style.top = `${rect.bottom + 4}px`;
    } else if (spaceAbove >= popupHeight + 10) {
      popup.style.bottom = `${viewportHeight - rect.top + 4}px`;
    } else {
      popup.style.top = `${rect.bottom + 4}px`;
    }

    // Horizontal: align to the input's left edge, clamp inside the viewport.
    if (isMobile) {
      popup.style.left = "8px";
      popup.style.right = "8px";
      popup.style.maxWidth = "calc(100vw - 16px)";
    } else {
      const left = rect.left;
      if (left + popupWidth > viewportWidth) {
        popup.style.right = `${Math.max(8, viewportWidth - rect.right)}px`;
      } else {
        popup.style.left = `${Math.max(8, left)}px`;
      }
    }

    // Reveal only after we've positioned it, so it never flashes at (0,0).
    popup.style.visibility = "visible";
  }, [open, isMobile]);

  useEffect(() => {
    if (!open) return;
    // Position after layout settles (portal mount / view change / month change)
    // so offset measurements are accurate.
    const raf = requestAnimationFrame(updatePopupPosition);
    const onResize = () => updatePopupPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, view, currentMonth, isMobile, updatePopupPosition]);

  return (
    <div className={`cds-date-picker-container ${respClass}`} ref={containerRef}>
      <style>{`
        .cds-date-picker-container { position: relative; width: 100%; }
        .cds-input-wrapper { display: flex; flex-direction: column; gap: 4px; }
        .cds-input-field {
          position: relative; display: flex; align-items: center; background:#fff;
          border:1px solid #ced4da; border-radius:4px; padding:0 0 0 12px;
          cursor:pointer; transition:all .2s; box-shadow:0 1px 3px rgba(0,0,0,.05);
        }
        .cds-input-field:hover { box-shadow:0 2px 8px rgba(0,102,204,.15); }
        .cds-input-field.cds-disabled { cursor:not-allowed; opacity:.6; background:#f9f9f9; }
        .cds-label {
          position:absolute; left:12px; top:50%; transform:translateY(-50%);
          font-size:1.17rem; color:#000; pointer-events:none; transition:all .2s;
          font-weight:500 !important; background:transparent;
        }
        .cds-label-active {
          top:0.17rem; left:10px; font-size:10px; background:#fff; color:#212529;
          padding:0 4px; font-weight:600!important; border-radius:8px;font-size:0.75rem !important;
        }
        .cds-input-value {
          flex:1; font-size:1rem; font-weight:500; color:#333;
          border:none; outline:none; background:transparent;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          pointer-events:none;
          height:2.1rem;
        }
        .cds-calendar-trigger {
           align-items:center; justify-content:center;
           position:absolute; right:0;
          width:30px; height:2rem; background:#e6f7ff; border-radius:0 2px 2px 0;
          color:#0066cc; font-size:1.17rem; margin-left:8px; transition:background .2s;
        }
        .cds-input-field:hover .cds-calendar-trigger,
        .cds-input-field.cds-focused .cds-calendar-trigger { background:#bae7ff; }
        .cds-input-field.cds-disabled .cds-calendar-trigger { background:#f0f0f0; color:#999; }

        /* POPUP – portaled to <body>, fixed to viewport, hidden until positioned */
        .cds-calendar-popup {
          position:fixed; z-index:10000; background:#fff;
          border:1px solid #ced4da; border-radius:12px;
          box-shadow:0 8px 24px rgba(0,0,0,.12);
          padding:12px; max-height:90vh; overflow-y:auto;
          visibility:hidden;
        }

        /* Mobile – presets on top */
        @media (max-width:768px) {
          .cds-preset-panel-mobile {
            display:flex; gap:8px; overflow-x:auto; margin-bottom:12px;
            padding-bottom:4px; scrollbar-width:thin;
          }
          .cds-preset-item-mobile {
            white-space:nowrap; padding:6px 12px; font-size:13px;
            border-radius:6px; cursor:pointer; transition:all .2s;
          }
          .cds-preset-item-mobile:hover { background:#f0f0f0; }
          .cds-preset-item-mobile.active { background:#e6f3ff; color:#0066cc; font-weight:600; }
        }

        /* Desktop – presets on left */
        @media (min-width:769px) {
          .cds-calendar-popup { display:flex; gap:16px; min-width:735px; }
          .cds-preset-panel { width:140px; }
          .cds-calendar-container { flex:1; display:flex; gap:24px; }
        }

        .cds-preset-item { margin-bottom:4px; padding:6px 8px; border-radius:6px;
          font-size:13px; cursor:pointer; transition:all .2s; }
        .cds-preset-item:hover { background:#f0f0f0; }
        .cds-preset-item.active { background:#e6f3ff; color:#0066cc; font-weight:600; }

        .cds-calendar-month { flex:1; min-width:260px; }
        .cds-month-header { display:flex; align-items:center; justify-content:space-between;
          margin-bottom:12px; padding:0 4px; }
        .cds-month-title {
          font-size:1.17rem; font-weight:600; color:#333; text-align:center; flex:1;
          background:none; border:none; cursor:pointer; display:flex;
          align-items:center; justify-content:center; border-radius:6px;
          padding:4px 8px; transition:all .2s;
        }
        .cds-nav-btn {
          background:none; border:none; width:32px; height:32px;
          display:flex; align-items:center; justify-content:center;
          border-radius:6px; cursor:pointer; color:#000; font-size:12px;
          transition:all .2s;
        }
        .cds-nav-btn:hover:not(:disabled) { background:#f0f0f0; color:#333; }
        .cds-nav-btn:disabled { opacity:.3; cursor:not-allowed; }

        .cds-weekdays { display:grid; grid-template-columns:repeat(7,1fr); gap:2px;
          margin-bottom:8px; font-size:11px; font-weight:600; color:#999; text-align:center; }
        .cds-weekday { padding:4px 0; }
        .cds-days-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
        .cds-day { height:32px; display:flex; align-items:center; justify-content:center; }
        .cds-day-btn {
          width:32px; height:32px; border:none; border-radius:50%; background:transparent;
          color:#000; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s;
          display:flex; align-items:center; justify-content:center;
        }
        .cds-day-btn:hover:not(.cds-disabled):not(.cds-selected) { background:#e6f3ff; color:#0066cc; }
        .cds-day-btn.cds-other-month { opacity:.3; color:#ccc; }
        .cds-day-btn.cds-disabled { opacity:.3; cursor:not-allowed; }
        .cds-day-btn.cds-selected { background:#0066cc; color:#fff; font-weight:600; border-radius:50%; }
        .cds-day-btn.cds-in-range { background:#f0f8ff !important; color:#0066cc !important; }
        .cds-day-btn.cds-preview-range { background:#e6f3ff !important; color:#0066cc !important; }

        .cds-months-list,.cds-years-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
        .cds-month-item,.cds-year-item {
          padding:4px 12px; border:none; background:transparent; cursor:pointer;
          border-radius:6px; font-size:1.17rem; transition:all .2s; margin:auto;
        }
        .cds-month-item:hover:not(.cds-disabled),
        .cds-year-item:hover:not(.cds-disabled) { background:#f0f0f0; }
        .cds-month-item.active,.cds-year-item.active { background:#e6f3ff; color:#0066cc; font-weight:600; }
        .cds-month-item.cds-disabled,.cds-year-item.cds-disabled { opacity:.3; cursor:not-allowed; }
      `}</style>

      {/* INPUT */}
      <div className="cds-input-wrapper mb-2">
        <div
          className={`cds-input-field ${disableField ? "cds-disabled" : ""} ${open ? "cds-focused" : ""}`}
          onClick={toggleOpen}
        >
          <label
            htmlFor={labelKey || id}
            className={`cds-label truncate ${open || inputValue ? "cds-label-active" : ""}`}
          >
            {label}
          </label>

          <input
            ref={inputRef}
            id={labelKey || id}
            name={name}
            type="text"
            className="cds-input-value"
            value={isShowFullDate ? inputValue : inputValue.slice(0, 20) + "..."}
            placeholder={placeholder}
            disabled={disableField}
            readOnly
            onClick={(e) => {
              e.stopPropagation();
              toggleOpen();
            }}
            {...rest}
          />
          <div className="cds-calendar-trigger background-theme-color theme-color" onClick={toggleOpen}>
            <i className="fa fa-calendar ml-2" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      {/* POPUP – rendered into <body> via portal so it escapes any transformed /
          overflow-hidden ancestor and `position: fixed` stays viewport-relative. */}
      {mounted && open && !disableField &&
        createPortal(
          <div className="cds-calendar-popup" ref={popupRef}>
            {isMobile && showPresetPanel && (
              <div className="cds-preset-panel-mobile">
                {activePresets.map((p, i) => (
                  <div
                    key={i}
                    className={`cds-preset-item-mobile ${isPresetActive(p) ? "background-theme-color theme-color active" : ""}`}
                    onClick={() => handlePresetClick(p)}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            )}

            {!isMobile && showPresetPanel && (
              <div className="cds-preset-panel">
                {activePresets.map((p, i) => (
                  <div
                    key={i}
                    className={`cds-preset-item border-bottom ${isPresetActive(p) ? "background-theme-color theme-color active" : ""}`}
                    onClick={() => handlePresetClick(p)}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            )}

            <div className={isMobile ? "" : "cds-calendar-container"}>
              {monthArray.map((month, idx) => {
                const days = eachDayOfInterval({
                  start: startOfMonth(month),
                  end: endOfMonth(month),
                });
                const blanks = Array(days[0].getDay()).fill(null);
                const year = month.getFullYear();
                const decade = Math.floor(year / 10) * 10;

                return (
                  <div className="cds-calendar-month" key={idx}>
                    <div className="cds-month-header">
                      <button
                        className="cds-nav-btn background-theme-color theme-color"
                        onClick={(e) => handleMonthChange(e, "prev")}
                        style={{ display: idx !== 0 ? "none" : "inline-flex" }}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <span
                        className="cds-month-title"
                        onClick={handleHeaderClick}
                        style={{ cursor: view === "year" ? "default" : "pointer" }}
                      >
                        {getTitle(month, view)}
                        {view !== "year" && <ChevronDown size={16} style={{ marginLeft: 4 }} />}
                      </span>

                      <button
                        className="cds-nav-btn background-theme-color theme-color"
                        onClick={(e) => handleMonthChange(e, "next")}
                        style={{ display: idx !== monthArray.length - 1 ? "none" : "inline-flex" }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {view === "day" ? (
                      <>
                        <div className="cds-weekdays">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d} className="cds-weekday">{d}</div>
                          ))}
                        </div>

                        <div className="cds-days-grid">
                          {blanks.map((_, i) => (
                            <div key={`blank-${i}`} className="cds-day cds-empty" />
                          ))}
                          {days.map((day) => {
                            const disabled = day < minDate || day > maxDate;
                            const otherMonth = !isSameMonth(day, month);
                            const selected = isStart(day) || isEnd(day);
                            const inRange = isInRange(day);
                            const preview = !propEnd && propStart && hoverDate && isInRange(day);

                            return (
                              <div key={day.toISOString()} className="cds-day">
                                <span
                                  className={`
                                    cds-day-btn
                                    ${selected ? "cds-selected background-theme-color" : ""}
                                    ${inRange ? "cds-in-range" : ""}
                                    ${preview ? "cds-preview-range" : ""}
                                    ${disabled ? "cds-disabled" : ""}
                                    ${otherMonth ? "cds-other-month" : ""}
                                  `}
                                  onClick={() => handleDayClick(day)}
                                  onMouseEnter={() => setHoverDate(day)}
                                  onMouseLeave={() => setHoverDate(null)}
                                >
                                  {format(day, "d")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : view === "month" ? (
                      <div className="cds-months-list">
                        {Array.from({ length: 12 }, (_, m) => {
                          const md = new Date(year, m, 1);
                          const name = format(md, "MMMM");
                          const cur = m === currentMonth.getMonth();
                          const disabled = endOfMonth(md) < minDate || md > maxDate;
                          return (
                            <span
                              key={m}
                              className={`cds-month-item ${cur ? "active" : ""} ${disabled ? "cds-disabled" : ""}`}
                              onClick={() => {
                                if (!disabled) {
                                  setMonthState(startOfMonth(md));
                                  setView("day");
                                }
                              }}
                            >
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="cds-years-grid">
                        {Array.from({ length: 10 }, (_, i) => {
                          const y = decade + i;
                          const yd = new Date(y, 0, 1);
                          const cur = y === year;
                          const disabled = new Date(y, 11, 31) < minDate || yd > maxDate;
                          return (
                            <span
                              key={y}
                              className={`cds-year-item ${cur ? "active" : ""} ${disabled ? "cds-disabled" : ""}`}
                              onClick={() => {
                                if (!disabled) {
                                  setMonthState(new Date(y, currentMonth.getMonth(), 1));
                                  setView("month");
                                }
                              }}
                            >
                              {y}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}