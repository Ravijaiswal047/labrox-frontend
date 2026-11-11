import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import NepaliDate from "nepali-date";

// ─── constants ────────────────────────────────────────────────────────────────

const BS_MONTHS_FULL = [
  "Baisakh", "Jestha", "Asar", "Shrawan",
  "Bhadra", "Aswin", "Kartik", "Mangsir",
  "Poush", "Magh", "Falgun", "Chaitra",
];
const BS_MONTHS_SHORT = [
  "Bai", "Jes", "Asa", "Shr",
  "Bha", "Asw", "Kar", "Man",
  "Pou", "Mag", "Fal", "Cha",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MIN_BS_YEAR = 2001;
const MAX_BS_YEAR = 2088;

// ─── helpers ──────────────────────────────────────────────────────────────────

function getDaysInBsMonth(bsYear, bsMonth) {
  for (let d = 32; d >= 28; d--) {
    try {
      const nd = new NepaliDate(bsYear, bsMonth, d);
      if (nd.getYear() === bsYear && nd.getMonth() === bsMonth) return d;
    } catch { /* year out of supported range */ }
  }
  return 30;
}

// AD → BS: uses the package timestamp path (reliable)
function adToBs(adDate) {
  try {
    const d = adDate instanceof Date ? adDate : new Date(adDate);
    if (isNaN(d.getTime())) return null;
    const bs = new NepaliDate(d);
    return { year: bs.getYear(), month: bs.getMonth(), day: bs.getDate() };
  } catch {
    return null;
  }
}

// BS → AD: the package's getEnglishDate() can land at ~23:00 local due to a
// historical EPOCH timezone offset. We verify with a round-trip and shift 1 day
// when needed, then reconstruct a clean local-noon Date.
function bsToAd(bsYear, bsMonth, bsDay) {
  try {
    let result = new NepaliDate(bsYear, bsMonth, bsDay).getEnglishDate();
    // Round-trip check
    const check = new NepaliDate(result);
    if (
      check.getYear() !== bsYear ||
      check.getMonth() !== bsMonth ||
      check.getDate() !== bsDay
    ) {
      result = new Date(result.getTime() + 86400000); // +1 day
    }
    // Return a clean local noon date
    return new Date(result.getFullYear(), result.getMonth(), result.getDate(), 12, 0, 0, 0);
  } catch {
    return null;
  }
}

// "01-Asa-2083"
function formatDisplay(year, month, day) {
  return `${String(day).padStart(2, "0")}-${BS_MONTHS_SHORT[month]}-${year}`;
}

// 6×7 grid of day numbers (null = empty cell)
function buildGrid(bsYear, bsMonth) {
  try {
    const firstAD = new NepaliDate(bsYear, bsMonth, 1).getEnglishDate();
    const startDow = firstAD.getDay(); // 0 = Sunday
    const total = getDaysInBsMonth(bsYear, bsMonth);
    const cells = Array(startDow).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  } catch {
    return [];
  }
}

// ─── component ────────────────────────────────────────────────────────────────

function NepaliDatePicker({
  name,
  value,       // AD Date | string | null — what the parent stores
  onChange,    // (adDate: Date, name: string) => void
  disabled,
  className,
  id,
  lable,
  tabIndex,
  maxDate,     // AD Date ceiling (defaults to today)
  onKeyDown,
  placeholder,
}) {
  const [t] = useTranslation();
  const containerRef = useRef(null);

  const [selected, setSelected] = useState(null);  // { year, month, day } BS
  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);
  const [open, setOpen] = useState(false);

  // today (or maxDate) in BS — ceiling for navigation
  const ceilBs = (() => {
    const d = maxDate instanceof Date ? maxDate : new Date();
    return adToBs(d) ?? { year: MAX_BS_YEAR, month: 11, day: 30 };
  })();

  // Sync selected state when parent changes value
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    const bs = adToBs(value);
    if (bs) setSelected(bs);
    else setSelected(null);
  }, [value]);

  // When the panel opens, jump view to the selected date (or today)
  useEffect(() => {
    if (!open) return;
    const target = selected ?? ceilBs;
    setViewYear(target.year);
    setViewMonth(target.month);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close panel on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── navigation ────────────────────────────────────────────────────────────

  const canPrev = !(viewYear <= MIN_BS_YEAR && viewMonth === 0);
  const canNext = !(viewYear >= ceilBs.year && viewMonth >= ceilBs.month);

  const prevMonth = () => {
    if (!canPrev) return;
    let m = viewMonth - 1, y = viewYear;
    if (m < 0) { m = 11; y--; }
    setViewYear(y); setViewMonth(m);
  };

  const nextMonth = () => {
    if (!canNext) return;
    let m = viewMonth + 1, y = viewYear;
    if (m > 11) { m = 0; y++; }
    setViewYear(y); setViewMonth(m);
  };

  // ── day selection ─────────────────────────────────────────────────────────

  const isFutureDay = (day) =>
    viewYear > ceilBs.year ||
    (viewYear === ceilBs.year && viewMonth > ceilBs.month) ||
    (viewYear === ceilBs.year && viewMonth === ceilBs.month && day > ceilBs.day);

  const selectDay = (day) => {
    if (!day || isFutureDay(day)) return;
    const bs = { year: viewYear, month: viewMonth, day };
    setSelected(bs);
    const ad = bsToAd(bs.year, bs.month, bs.day);
    if (ad) onChange(ad, name);
    setOpen(false);
  };

  // ── derived UI values ─────────────────────────────────────────────────────

  const displayValue = selected
    ? formatDisplay(selected.year, selected.month, selected.day)
    : "";

  const isMandatory = className?.includes("mandatory_field");
  const inputCls = [
    "p-inputtext p-component form-control select-focus",
    isMandatory ? "mandatory_field" : "",
  ].filter(Boolean).join(" ");

  const grid = viewYear != null && viewMonth != null ? buildGrid(viewYear, viewMonth) : [];

  const yearOptions = Array.from(
    { length: ceilBs.year - MIN_BS_YEAR + 1 },
    (_, i) => ceilBs.year - i
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Input row — same markup as PrimeReact Calendar */}
      <div
        className={`p-calendar p-component p-inputwrapper${open ? " p-inputwrapper-focus" : ""}`}
        style={{ width: "100%" }}
      >
        <input
          readOnly
          id={id}
          value={displayValue}
          placeholder={placeholder || "DD-MMM-YYYY (BS)"}
          className={inputCls}
          tabIndex={tabIndex ?? 0}
          disabled={disabled}
          onKeyDown={onKeyDown}
          onClick={() => !disabled && setOpen((v) => !v)}
          autoComplete="off"
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        />
        <button
          type="button"
          className="p-datepicker-trigger p-button p-component p-button-icon-only"
          onClick={() => !disabled && setOpen((v) => !v)}
          disabled={disabled}
          tabIndex={-1}
        >
          <span className="p-button-icon pi pi-calendar" />
        </button>
      </div>

      {/* Label — matches DatePicker */}
      {lable && (
        <label htmlFor={id} className="label lable truncate" style={{ fontSize: "5px !important" }}>
          {t(lable)} (BS)
        </label>
      )}

      {/* Calendar panel */}
      {open && viewYear != null && (
        <div
          className="p-datepicker p-component"
          style={{
            position: "absolute",
            zIndex: 9999,
            top: "calc(100% + 2px)",
            left: 0,
            background: "#fff",
            minWidth: "280px",
          }}
        >
          {/* Header */}
          <div className="p-datepicker-header">
            <button
              type="button"
              className="p-datepicker-prev p-link"
              onClick={prevMonth}
              disabled={!canPrev}
            >
              <span className="p-datepicker-prev-icon pi pi-chevron-left" />
            </button>

            <div className="p-datepicker-title">
              {/* Month select — styled as a PrimeReact link-button */}
              <button type="button" className="p-datepicker-month p-link">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    border: "none", background: "transparent",
                    fontWeight: 700, cursor: "pointer", fontSize: "inherit",
                    color: "inherit",
                  }}
                >
                  {BS_MONTHS_FULL.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </button>

              {/* Year select */}
              <button type="button" className="p-datepicker-year p-link">
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    border: "none", background: "transparent",
                    fontWeight: 700, cursor: "pointer", fontSize: "inherit",
                    color: "inherit",
                  }}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </button>
            </div>

            <button
              type="button"
              className="p-datepicker-next p-link"
              onClick={nextMonth}
              disabled={!canNext}
            >
              <span className="p-datepicker-next-icon pi pi-chevron-right" />
            </button>
          </div>

          {/* Day grid */}
          <div className="p-datepicker-calendar-container">
            <table className="p-datepicker-calendar">
              <thead>
                <tr>
                  {DAY_LABELS.map((d) => (
                    <th key={d} scope="col"><span>{d}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: grid.length / 7 }, (_, row) => (
                  <tr key={row}>
                    {grid.slice(row * 7, row * 7 + 7).map((day, col) => {
                      const isSelected =
                        day &&
                        selected?.year === viewYear &&
                        selected?.month === viewMonth &&
                        selected?.day === day;

                      const isToday =
                        day &&
                        ceilBs.year === viewYear &&
                        ceilBs.month === viewMonth &&
                        ceilBs.day === day;

                      const isFuture = day && isFutureDay(day);

                      return (
                        <td
                          key={col}
                          className={[
                            isSelected ? "p-datepicker-today" : "",
                            isFuture ? "p-disabled" : "",
                          ].filter(Boolean).join(" ")}
                        >
                          <span
                            className={[
                              "p-ripple",
                              isSelected ? "p-highlight" : "",
                              isToday && !isSelected ? "p-today" : "",
                            ].filter(Boolean).join(" ")}
                            onClick={() => selectDay(day)}
                            style={{ cursor: day && !isFuture ? "pointer" : "default" }}
                          >
                            {day ?? ""}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default NepaliDatePicker;
