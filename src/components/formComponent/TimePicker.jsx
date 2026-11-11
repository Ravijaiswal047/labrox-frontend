import React, { useEffect, useState } from "react";
import { Tooltip } from "primereact/tooltip";
import moment from "moment";
import { useTranslation } from "react-i18next";

const TimePicker = (props) => {
  const {
    respclass,
    placeholder,
    value,
    onChange,
    name,
    lable,
    id,
    disabled,
    toolTipText = "",
    onKeyDown,
    tabIndex,
  } = props;

  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState("00:00:00");

  useEffect(() => {
    if (value) {
      // Handle both Date and string inputs
      const formatted = moment(value, ["HH:mm:ss", "hh:mm:ss A", moment.ISO_8601], true);
      if (formatted.isValid()) {
        setInternalValue(formatted.format("HH:mm:ss"));
      } else if (value instanceof Date && !isNaN(value)) {
        setInternalValue(moment(value).format("HH:mm:ss"));
      }
    } else {
      // If no value, default to 00:00:00 instead of now
      setInternalValue("00:00:00");
      onChange("00:00:00", name);
    }
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;

    if (!val) {
      setInternalValue("00:00:00");
      onChange("00:00:00", name);
      return;
    }

    setInternalValue(val);
    const formatted = moment(val, "HH:mm:ss").format("HH:mm:ss");
    onChange(formatted, name);
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      setInternalValue("00:00:00");
      onChange("00:00:00", name);
    }
  };

  return (
    <>
      <Tooltip target={`#${id}`} position="top" content={t(toolTipText || lable)} />
      <div className={respclass}>
        <input
          type="time"
          step="1" // enables seconds input
          id={id}
          name={name}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          tabIndex={tabIndex}
          disabled={disabled}
          placeholder={placeholder || t(lable)}
          className="form-control select-focus"
          style={{ width: "100%" }}
        />
        {lable && (
          <label htmlFor={id} className="label lable truncate time_Lable customeFont">
            {t(lable)}
          </label>
        )}
      </div>
    </>
  );
};

export default TimePicker;

// import React, { useEffect, useState, useRef } from "react";
// import ReactDOM from "react-dom";
// import { Tooltip } from "primereact/tooltip";
// import moment from "moment";
// import { useTranslation } from "react-i18next";

// const TimePicker = (props) => {
//   const { respclass, value, onChange, name, lable, id, disabled, toolTipText = "" } = props;
//   const { t } = useTranslation();
//   const [showPicker, setShowPicker] = useState(false);
//   const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
//   const containerRef = useRef(null);

//   const m = moment(value || "00:00:00", "HH:mm:ss");
//   const hours = m.format("hh");
//   const minutes = m.format("mm");
//   const seconds = m.format("ss");
//   const ampm = m.format("A");

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         const portal = document.getElementById("tp-portal-" + id);
//         if (portal && portal.contains(event.target)) return;
//         setShowPicker(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [id]);

//   // Recalculate position on scroll/resize while open
//   useEffect(() => {
//     if (!showPicker) return;
//     const update = () => {
//       if (!containerRef.current) return;
//       const rect = containerRef.current.getBoundingClientRect();
//       setDropdownPos({
//         top: rect.bottom + window.scrollY + 4,
//         left: rect.left + window.scrollX,
//         width: rect.width,
//       });
//     };
//     update();
//     window.addEventListener("scroll", update, true);
//     window.addEventListener("resize", update);
//     return () => {
//       window.removeEventListener("scroll", update, true);
//       window.removeEventListener("resize", update);
//     };
//   }, [showPicker]);

//   const handleOpen = () => {
//     if (disabled) return;
//     const rect = containerRef.current.getBoundingClientRect();
//     setDropdownPos({
//       top: rect.bottom + window.scrollY + 4,
//       left: rect.left + window.scrollX,
//       width: rect.width,
//     });
//     setShowPicker((prev) => !prev);
//   };

//   const updateTime = (unit, newVal) => {
//     let newM = moment(value || "00:00:00", "HH:mm:ss");
//     if (unit === "h") newM.hour(ampm === "PM" && newVal !== "12" ? parseInt(newVal) + 12 : (ampm === "AM" && newVal === "12" ? 0 : parseInt(newVal)));
//     if (unit === "m") newM.minute(parseInt(newVal));
//     if (unit === "s") newM.second(parseInt(newVal));
//     if (unit === "p") {
//       const h24 = newM.hour();
//       if (newVal === "PM" && h24 < 12) newM.add(12, "hours");
//       if (newVal === "AM" && h24 >= 12) newM.subtract(12, "hours");
//     }
//     onChange(newM.format("HH:mm:ss"), name);
//   };

//   const generateOptions = (max, start = 0) =>
//     Array.from({ length: max }, (_, i) => (i + start).toString().padStart(2, "0"));

//   const dropdown = showPicker
//     ? ReactDOM.createPortal(
//         <div
//           id={"tp-portal-" + id}
//           className="shadow-lg border rounded p-2"
//           style={{
//             position: "absolute",
//             zIndex: 99999,
//             background: "white",
//             top: dropdownPos.top,
//             left: dropdownPos.left,
//             minWidth: dropdownPos.width || 220,
//           }}
//         >
//           <div className="d-flex text-center" style={{ height: "200px", overflow: "hidden" }}>
//             <ScrollColumn selected={hours} options={generateOptions(12, 1)} onSelect={(v) => updateTime("h", v)} label="Hrs" />
//             <ScrollColumn selected={minutes} options={generateOptions(60)} onSelect={(v) => updateTime("m", v)} label="Min" />
//             <ScrollColumn selected={seconds} options={generateOptions(60)} onSelect={(v) => updateTime("s", v)} label="Sec" />
//             <ScrollColumn selected={ampm} options={["AM", "PM"]} onSelect={(v) => updateTime("p", v)} label="AM/PM" />
//           </div>
//           <button className="btn btn-primary btn-sm w-100 mt-2" onClick={() => setShowPicker(false)}>Done</button>
//         </div>,
//         document.body
//       )
//     : null;

//   return (
//     <>
//       <Tooltip target={`#${id}`} position="top" content={t(toolTipText || lable)} />
//       <div className={`${respclass} position-relative`} ref={containerRef}>
//         <div
//           className="form-control select-focus d-flex align-items-center justify-content-between"
//           onClick={handleOpen}
//           style={{ cursor: disabled ? "not-allowed" : "pointer", background: "#fff" }}
//         >
//           <span style={{ fontSize: "12px" }}>{`${hours}:${minutes}:${seconds} ${ampm}`}</span>
//           <i className="pi pi-clock" style={{ fontSize: "0.8rem", opacity: 0.6 }}></i>
//         </div>

//         {lable && (
//           <label htmlFor={id} className="label lable truncate time_Lable customeFont">
//             {t(lable)}
//           </label>
//         )}
//       </div>

//       {dropdown}
//     </>
//   );
// };

// const ScrollColumn = ({ options, selected, onSelect, label }) => (
//   <div className="flex-fill d-flex flex-column border-right">
//     <small className="text-muted border-bottom mb-1">{label}</small>
//     <div className="overflow-auto custom-scroll" style={{ scrollbarWidth: "none" }}>
//       {options.map((opt) => (
//         <div
//           key={opt}
//           onClick={() => onSelect(opt)}
//           className={`py-1 cursor-pointer ${selected === opt ? "bg-primary text-white rounded" : ""}`}
//           style={{ fontSize: "1.2rem", padding: "0 15px" }}
//         >
//           {opt}
//         </div>
//       ))}
//     </div>
//   </div>
// );

// export default TimePicker;

// import React, { useEffect, useState, useRef } from "react";
// import ReactDOM from "react-dom";
// import { Tooltip } from "primereact/tooltip";
// import moment from "moment";
// import { useTranslation } from "react-i18next";
// import { fontSize } from "../../utils/Constants";

// const TimePicker = (props) => {
//   const { respclass, value, onChange, name, lable, id, disabled, toolTipText = "", tabIndex } = props;
//   const { t } = useTranslation();
//   const [showPicker, setShowPicker] = useState(false);
//   const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
//   const [activeSegment, setActiveSegment] = useState(null); // 'h' | 'm' | 's' | 'a'
//   const containerRef = useRef(null);
//   const displayRef = useRef(null);
//   const buf = useRef("");

//   const m = moment(value || "00:00:00", "HH:mm:ss");
//   const hours = m.format("hh");
//   const minutes = m.format("mm");
//   const seconds = m.format("ss");
//   const ampm = m.format("A");

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         const portal = document.getElementById("tp-portal-" + id);
//         if (portal && portal.contains(event.target)) return;
//         setShowPicker(false);
//         setActiveSegment(null);
//         buf.current = "";
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [id]);

//   useEffect(() => {
//     if (!showPicker) return;
//     const update = () => {
//       if (!containerRef.current) return;
//       const rect = containerRef.current.getBoundingClientRect();
//       setDropdownPos({
//         top: rect.bottom + window.scrollY + 4,
//         left: rect.left + window.scrollX,
//         width: rect.width,
//       });
//     };
//     update();
//     window.addEventListener("scroll", update, true);
//     window.addEventListener("resize", update);
//     return () => {
//       window.removeEventListener("scroll", update, true);
//       window.removeEventListener("resize", update);
//     };
//   }, [showPicker]);

//   const handleOpen = () => {
//     if (disabled) return;
//     const rect = containerRef.current.getBoundingClientRect();
//     setDropdownPos({
//       top: rect.bottom + window.scrollY + 4,
//       left: rect.left + window.scrollX,
//       width: rect.width,
//     });
//     setShowPicker((prev) => !prev);
//   };

//   const updateTime = (unit, newVal) => {
//     let newM = moment(value || "00:00:00", "HH:mm:ss");
//     if (unit === "h") {
//       const h = parseInt(newVal);
//       newM.hour(ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h);
//     }
//     if (unit === "m") newM.minute(parseInt(newVal));
//     if (unit === "s") newM.second(parseInt(newVal));
//     if (unit === "p") {
//       const h24 = newM.hour();
//       if (newVal === "PM" && h24 < 12) newM.add(12, "hours");
//       if (newVal === "AM" && h24 >= 12) newM.subtract(12, "hours");
//     }
//     onChange(newM.format("HH:mm:ss"), name);
//   };

//   const spinSegment = (seg, dir) => {
//     if (seg === "h") {
//       const next = ((parseInt(hours) - 1 + dir + 12) % 12) + 1;
//       updateTime("h", String(next).padStart(2, "0"));
//     } else if (seg === "m") {
//       const next = (parseInt(minutes) + dir + 60) % 60;
//       updateTime("m", String(next).padStart(2, "0"));
//     } else if (seg === "s") {
//       const next = (parseInt(seconds) + dir + 60) % 60;
//       updateTime("s", String(next).padStart(2, "0"));
//     } else if (seg === "a") {
//       updateTime("p", ampm === "AM" ? "PM" : "AM");
//     }
//   };

//   const segOrder = ["h", "m", "s", "a"];
//   const nextSeg = (cur) => {
//     const i = segOrder.indexOf(cur);
//     if (i < segOrder.length - 1) { buf.current = ""; setActiveSegment(segOrder[i + 1]); }
//   };
//   const prevSeg = (cur) => {
//     const i = segOrder.indexOf(cur);
//     if (i > 0) { buf.current = ""; setActiveSegment(segOrder[i - 1]); }
//   };

//   const handleKeyDown = (e) => {
//     if (disabled || !activeSegment) return;

//     if (e.key === "ArrowUp") { e.preventDefault(); spinSegment(activeSegment, 1); }
//     else if (e.key === "ArrowDown") { e.preventDefault(); spinSegment(activeSegment, -1); }
//     else if (e.key === "ArrowRight") { e.preventDefault(); nextSeg(activeSegment); }
//     else if (e.key === "ArrowLeft") { e.preventDefault(); prevSeg(activeSegment); }
//     else if (e.key === "Tab") { e.preventDefault(); e.shiftKey ? prevSeg(activeSegment) : nextSeg(activeSegment); }
//     else if (activeSegment === "a") {
//       if (e.key === "a" || e.key === "A") { updateTime("p", "AM"); }
//       if (e.key === "p" || e.key === "P") { updateTime("p", "PM"); }
//     } else if (/^\d$/.test(e.key)) {
//       e.preventDefault();
//       buf.current += e.key;
//       const n = parseInt(buf.current);

//       if (activeSegment === "h") {
//         const clamped = Math.min(Math.max(n, 1), 12);
//         updateTime("h", String(clamped).padStart(2, "0"));
//         if (buf.current.length === 1 && n >= 2) { buf.current = ""; nextSeg("h"); }
//         else if (buf.current.length === 2) { buf.current = ""; nextSeg("h"); }
//       } else if (activeSegment === "m") {
//         const clamped = Math.min(n, 59);
//         updateTime("m", String(clamped).padStart(2, "0"));
//         if (buf.current.length === 1 && n >= 6) { buf.current = ""; nextSeg("m"); }
//         else if (buf.current.length === 2) { buf.current = ""; nextSeg("m"); }
//       } else if (activeSegment === "s") {
//         const clamped = Math.min(n, 59);
//         updateTime("s", String(clamped).padStart(2, "0"));
//         if (buf.current.length === 1 && n >= 6) { buf.current = ""; nextSeg("s"); }
//         else if (buf.current.length === 2) { buf.current = ""; nextSeg("s"); }
//       }
//     }
//   };

//   const openDropdown = (e) => {
//   e.stopPropagation();
//   e.preventDefault(); // prevents blur firing on displayRef
//   if (disabled) return;
//   const rect = containerRef.current.getBoundingClientRect();
//   setDropdownPos({
//     top: rect.bottom + window.scrollY + 4,
//     left: rect.left + window.scrollX,
//     width: rect.width,
//   });
//   setShowPicker((prev) => !prev);
// };

// const handleSegClick = (seg) => (e) => {
//   e.stopPropagation();
//   if (disabled) return;
//   buf.current = "";
//   setActiveSegment(seg);
//   displayRef.current?.focus();
// };

//   const segStyle = (seg) => ({
//     padding: "0 0px",
//     borderRadius: "2px",
//     background: activeSegment === seg ? "#0078d7" : "transparent",
//     color: activeSegment === seg ? "#fff" : "inherit",
//     cursor: "default",
//     userSelect: "none",
//     minWidth: seg === "a" ? "14px" : "10px",
//     textAlign: "center",
//     display: "inline-block",
//     fontSize: "12px"
//   });

//   const generateOptions = (max, start = 0) =>
//     Array.from({ length: max }, (_, i) => (i + start).toString().padStart(2, "0"));

//   const dropdown = showPicker
//     ? ReactDOM.createPortal(
//         <div
//           id={"tp-portal-" + id}
//           className="shadow-lg border rounded p-2"
//           style={{
//             position: "absolute",
//             zIndex: 99999,
//             background: "white",
//             top: dropdownPos.top,
//             left: dropdownPos.left,
//             minWidth: dropdownPos.width || 220,
//           }}
//         >
//           <div className="d-flex text-center" style={{ height: "200px", overflow: "hidden" }}>
//             <ScrollColumn selected={hours} options={generateOptions(12, 1)} onSelect={(v) => updateTime("h", v)} label="Hrs" />
//             <ScrollColumn selected={minutes} options={generateOptions(60)} onSelect={(v) => updateTime("m", v)} label="Min" />
//             <ScrollColumn selected={seconds} options={generateOptions(60)} onSelect={(v) => updateTime("s", v)} label="Sec" />
//             <ScrollColumn selected={ampm} options={["AM", "PM"]} onSelect={(v) => updateTime("p", v)} label="AM/PM" />
//           </div>
//           <button className="btn btn-primary btn-sm w-100 mt-2" onClick={() => setShowPicker(false)}>Done</button>
//         </div>,
//         document.body
//       )
//     : null;

//   return (
//     <>
//       <Tooltip target={`#${id}`} position="top" content={t(toolTipText || lable)} />
//       <div className={`${respclass} position-relative`} ref={containerRef}>
//         {/* Keyboard-focusable wrapper */}
//         <div
//           ref={displayRef}
//           tabIndex={disabled ? -1 : (tabIndex ?? 0)}
//           onKeyDown={handleKeyDown}
//           onFocus={() => { if (!activeSegment) setActiveSegment("h"); }}
//           onBlur={(e) => {
//             if (!containerRef.current?.contains(e.relatedTarget)) {
//               setActiveSegment(null);
//               buf.current = "";
//             }
//           }}
//           className="form-control select-focus d-flex align-items-center justify-content-between"
//           // onClick={handleOpen}
//           style={{
//             cursor: disabled ? "not-allowed" : "pointer",
//             background: "transparent",
//             outline: "none",
//             fontFamily: "monospace",
//           }}
//         >
//           <span style={{ fontSize: "10px", display: "flex", alignItems: "center", gap: 0 }}>
//             <span style={segStyle("h")} onMouseDown={handleSegClick("h")}>{hours}</span>
//             <span style={{ userSelect: "none" }}>:</span>
//             <span style={segStyle("m")} onMouseDown={handleSegClick("m")}>{minutes}</span>
//             <span style={{ userSelect: "none" }}>:</span>
//             <span style={segStyle("s")} onMouseDown={handleSegClick("s")}>{seconds}</span>
//             <span style={{ userSelect: "none", marginLeft: 3 }}></span>
//             <span style={segStyle("a")} onMouseDown={handleSegClick("a")}>{ampm}</span>
//           </span>
//           <i className="pi pi-clock" onClick={openDropdown} style={{ fontSize: "0.8rem", opacity: 0.6, marginLeft: "3px" }}></i>
//         </div>

//         {lable && (
//           <label htmlFor={id} className="label lable truncate time_Lable customeFont">
//             {t(lable)}
//           </label>
//         )}
//       </div>

//       {dropdown}
//     </>
//   );
// };

// const ScrollColumn = ({ options, selected, onSelect, label }) => (
//   <div className="flex-fill d-flex flex-column border-right">
//     <small className="text-muted border-bottom mb-1">{label}</small>
//     <div className="overflow-auto custom-scroll" style={{ scrollbarWidth: "none" }}>
//       {options.map((opt) => (
//         <div
//           key={opt}
//           onClick={() => onSelect(opt)}
//           className={`py-1 cursor-pointer ${selected === opt ? "bg-primary text-white rounded" : ""}`}
//           style={{ fontSize: "1rem", padding: "0 15px" }}
//         >
//           {opt}
//         </div>
//       ))}
//     </div>
//   </div>
// );

// export default TimePicker;