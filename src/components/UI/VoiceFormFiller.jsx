import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// VOCABULARY & CORRECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const VOCABULARY_FIXES = {
  "uet": "uat",
  "u eighty": "uat",
  "u a t": "uat",
  "u e t": "uat",
  "you at": "uat",
  "you ate": "uat",
  "rate tape": "rate type",
  "red type": "rate type",
  "redtype": "rate type",
  "pannel": "panel",
  "pennel": "panel",
  "kash": "cash",
  "cas": "cash",
  "first-name": "first name",
  "lastname": "last name",
  "uh id": "uhid",
  "you hid": "uhid",
  "mobile-number": "mobile number",
  "cell-phone": "cell phone",
  "blood-group": "blood group",
  "self-pay": "self pay",
  "discount-percent": "discount percent",
  // centre / center mis-recognitions
  "senter": "centre",
  "sentre": "centre",
  "canter": "centre",
  // client ref / other lab ref mis-recognitions
  "client reference": "client reference",
  "client ref": "client ref",
  "other lab reference": "other lab reference",
  "other lab ref": "other lab ref",
  "other lab": "other lab",
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL FIXES — spoken "at the rate" / "at sign" → "@"
// ─────────────────────────────────────────────────────────────────────────────
const EMAIL_REPLACEMENTS = [
  [/\bat the rate\b/gi, "@"],
  [/\bat rate\b/gi, "@"],
  [/\bat sign\b/gi, "@"],
  [/\bat symbol\b/gi, "@"],
  [/\bat the rate of\b/gi, "@"],
  [/\battherate\b/gi, "@"],
  [/\bat\b/gi, "@"],  // fallback for email context
  [/\bdot\b/gi, "."],
  [/\bcomma\b/gi, ","],
  [/\bunderscore\b/gi, "_"],
  [/\bhyphen\b/gi, "-"],
  [/\bdash\b/gi, "-"],
];

function fixEmailSpoken(text) {
  let result = text;
  for (const [pattern, replacement] of EMAIL_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  // Remove spaces around @ and .
  result = result.replace(/\s*@\s*/g, "@").replace(/\s*\.\s*/g, ".");
  return result.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD MAP
// ─────────────────────────────────────────────────────────────────────────────
const FIELD_MAP = [
  // ── Lookup inputs (triggerEnter fires onKeyDown handlers) ──
  { id: "Mobile",         type: "input", triggerEnter: true,  keywords: ["mobile", "mobile number", "contact", "contact number", "phone"] },
  { id: "SecondaryMobile",type: "input", triggerEnter: false, keywords: ["secondary mobile", "secondary phone", "secondary contact", "second mobile", "alternate mobile", "secondary number", "second phone", "second number", "alternate phone", "alternate number", "other mobile", "other phone", "other number"] },
  { id: "PatientCode",    type: "input", triggerEnter: true,  keywords: ["patient code", "uhid", "patient id", "patient number", "uhid number"] },
  { id: "BarcodeNo",      type: "input", triggerEnter: true,  keywords: ["barcode", "bar code", "barcode number"] },
  { id: "PreBookingNo",   type: "input", triggerEnter: true,  keywords: ["pre booking", "prebooking", "booking number", "booking no"] },
  { id: "MembershipNo",   type: "input", triggerEnter: true,  keywords: ["membership", "membership number", "membership no", "member number"] },
  { id: "CouponCode",     type: "input", triggerEnter: false, keywords: ["coupon", "coupon code"] },

  // ── Personal inputs ──
  { id: "FirstName",  type: "input", keywords: ["first name", "firstname", "first", "given name"] },
  { id: "MiddleName", type: "input", keywords: ["middle name", "middlename", "middle"] },
  { id: "LastName",   type: "input", keywords: ["last name", "lastname", "last", "surname", "family name"] },
  { id: "AgeYear",    type: "ageInput", ageName: "AgeYear",  keywords: ["age", "age year", "years old", "year old", "age years"] },
  { id: "AgeMonth",   type: "ageInput", ageName: "AgeMonth", keywords: ["age month", "months old", "month old", "age months"] },
  { id: "AgeDays",    type: "ageInput", ageName: "AgeDays",  keywords: ["age days", "days old", "day old", "age day"] },
  { id: "Email",      type: "emailInput", keywords: ["email", "e-mail", "mail", "email address", "email id"] },
  { id: "Weight",     type: "input", keywords: ["weight", "body weight"] },
  { id: "Height",     type: "input", keywords: ["height", "body height"] },
  { id: "BMI",        type: "input", keywords: ["bmi", "body mass index"] },

  // ── Address inputs ──
  { id: "HouseNo",          type: "input", keywords: ["house", "house number", "house no", "plot number", "flat number", "address"] },
  { id: "StreetName",       type: "input", keywords: ["street", "street name", "road", "road name", "street number"] },
  { id: "Locality",         type: "input", keywords: ["locality", "area", "locality area", "local area"] },
  { id: "PinCode",          type: "input", keywords: ["pincode", "pin code", "zip", "zip code", "postal code"] },
  { id: "PatientIDProofNo", type: "ltInput", keywords: ["id proof number", "id number", "proof number", "id no", "aadhar", "aadhaar", "pan number", "id proof no"] },

  // ── LT Data fields (ClientRefNumber, OtherLabRef) ──
  { id: "ClientRefNumber",            type: "ltInput", keywords: ["client reference number", "client ref number", "client reference", "client ref", "client number"] },
  { id: "OtherLabReferenceLabNumber", type: "ltInput", keywords: ["other lab reference number", "other lab ref number", "other lab number", "other lab reference", "other lab", "lab reference number"] },
  { id: "fuhid",                      type: "fuhid",   triggerEnter: true, keywords: ["employee id", "employee id", "employeeid", "emp id", "empid"] },

  // ── City / State / Country — PrimeReact AutoComplete ──
  { id: "countryAutoComplete", type: "autocomplete", acField: "Country", keywords: ["country", "country name", "nation"] },
  { id: "stateAutoComplete",   type: "autocomplete", acField: "State",   keywords: ["state", "province", "state name"] },
  { id: "cityAutoComplete",    type: "autocomplete", acField: "City",    keywords: ["city", "city name", "town"] },

  // ── DOB / Registration Date ──
  { id: "DOB",              type: "dob", dobName: "DOB",              keywords: ["date of birth", "dob", "birth date", "birthday", "born"] },
  { id: "RegistrationDate", type: "dob", dobName: "RegistrationDate", keywords: ["registration date", "reg date", "visit date"] },

  // ── FIX 3: Title uses selectTitle type → calls onTitleChange ──
  {
    id: "Title", name: "Title", type: "selectTitle",
    keywords: ["title", "salutation", "prefix"],
    aliases: {
      mr: "Mr.", mister: "Mr.", "m r": "Mr.",
      mrs: "Mrs.", missus: "Mrs.",
      ms: "Ms.", miss: "Miss.",
      dr: "Dr.", doctor: "Dr.",
      prof: "Prof.", professor: "Prof.",
    },
  },

  // ── Gender uses selectMain ──
  {
    id: "Gender", name: "Gender", type: "selectMain",
    keywords: ["gender", "sex"],
    aliases: { male: "Male", female: "Female", other: "Other", transgender: "Other" },
  },

  // ── SelectBox → handleSelectChange ──
  { id: "IdType", name: "PatientIDProof", type: "selectLT", keywords: ["id type", "id proof", "identity", "identification", "id card", "identity proof", "proof type"] },

  // ── ReactSelect / UltraFastSelect → handleSearchSelectChange ──
  // FIX 1: CentreID — type is "selectSearch", auto-selects after getOptions resolves
  { id: "CentreID",        name: "CentreID",        type: "selectSearch", keywords: ["centre", "center", "branch", "lab centre", "lab center"] },
  { id: "VisitType",       name: "VisitType",        type: "selectSearch", keywords: ["visit type", "visit", "centre type", "opd", "ipd", "walkin", "walk in", "outpatient", "inpatient"] },
  {
    id: "RateID", name: "RateID", type: "selectSearch",
    keywords: ["rate type", "ratetype", "rate tape", "red type", "redtype", "rate tip",
      "panel", "rate", "panel type", "rate id", "cash", "credit", "self pay", "selfpay",
      "insurance", "corporate", "government", "govt", "general"],
  },
  { id: "SampleBy",        name: "SampleBy",         type: "selectSearch", keywords: ["sample by", "sample collected by", "phlebotomist", "technician", "collected by", "phlebo"] },
  { id: "CollectionBoyId", name: "CollectionBoyId",  type: "selectSearch", keywords: ["collection boy", "pickup boy", "home collection boy", "field boy", "collection agent"] },
  { id: "Category",        name: "Category",         type: "selectSearch", keywords: ["category", "patient category", "patient type"] },

  // ── Typeahead — type value → suggestions → auto-selects first ──
  { id: "DoctorName",        name: "DoctorName",        type: "typeahead", keywords: ["doctor", "referred doctor", "doctor name", "physician", "referring doctor", "consultant", "refer doctor", "referral doctor", "referred by", "referred doctor"] },
  { id: "SecondReferDoctor", name: "SecondReferDoctor", type: "typeahead", keywords: ["second doctor", "secondary referred doctor", "secondary doctor", "co doctor", "second refer", "second referring doctor", "second referral"] },
  { id: "ReferLabId", name: "SecondReferDoctor", type: "typeahead", keywords: ["referred lab", "ref lab", "ref"] },

  // ── Test search ──
  { id: "testSearch", type: "testSearch", keywords: ["add test", "test", "investigation", "test name", "add investigation", "search test", "add"] },

  // ── Booking / payment fields ──
  { id: "DiscountPer",    type: "input", keywords: ["discount percentage", "discount percent", "discount per", "discount %", "dis percent"] },
  { id: "DiscountAmount", type: "input", name: "disAmt", keywords: ["discount amount", "total discount", "discount rupees", "discount value"] },
  { id: "CashRendering",  type: "input", keywords: ["cash rendering", "cash given", "cash tendered", "cash handed", "cash received"] },
  { id: "CardNo",         type: "input", keywords: ["card number", "card no", "cheque number", "cheque no", "check number", "check no", "reference number", "ref no", "transaction number", "utr", "trans no"] },
  { id: "trfNo",          type: "input", keywords: ["trf number", "trf no", "trf", "transfer number", "lab number", "lab trf"] },
  { id: "PaidAmount",     type: "input", name: "Amount", keywords: ["paid amount", "payment amount", "total paid", "amount paid", "paid amount in table", "paid"] },

  // ── Select from open suggestion list ──
  {
    id: "__selectItem__", type: "selectItem",
    keywords: [
      "select", "choose", "pick", "add this",
      "select first", "select second", "select third", "select fourth", "select fifth",
      "select 1", "select 2", "select 3", "select 4", "select 5",
      "choose first", "choose second", "choose third",
      "pick first", "pick second", "pick third",
    ],
  },

  // ── Modal confirmation (yes/no for submit popups) ──
  { id: "__confirmYes__", type: "modalConfirm", answer: true,  keywords: ["yes", "confirm yes", "ok yes", "yeah", "proceed", "confirm it", "confirm", "ok", "okay", "sure", "go ahead"] },
  { id: "__confirmNo__",  type: "modalConfirm", answer: false, keywords: ["no", "cancel it", "no don't", "reject", "deny", "cancel", "close", "stop", "nope"] },

  // ── Actions ──
  { id: "__save__",  type: "action", keywords: ["save", "submit", "register", "save form", "submit form", "register patient", "done"] },
  { id: "__clear__", type: "action", keywords: ["clear", "clear field", "clear input", "empty", "erase"] },
  { id: "__reset__", type: "action", keywords: ["reset", "new patient", "cancel form", "full reset"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function normalize(text = "") {
  let n = String(text).toLowerCase().replace(/[^\w\s@.]/g, " ").replace(/\s+/g, " ").trim();
  for (const [misheard, correct] of Object.entries(VOCABULARY_FIXES)) {
    const regex = new RegExp(`\\b${misheard}\\b`, "g");
    n = n.replace(regex, correct);
  }
  return n;
}

function findFieldByKeyword(spoken) {
  const lower = normalize(spoken);
  let best = null, bestLen = 0;

  for (const field of FIELD_MAP) {
    const sorted = [...field.keywords].sort((a, b) => b.length - a.length);
    for (const kw of sorted) {
      const nkw = normalize(kw);
      if (lower.includes(nkw) && nkw.length > bestLen) {
        best = field;
        bestLen = nkw.length;
      }
    }
  }

  if (!best) {
    for (const field of FIELD_MAP) {
      for (const kw of field.keywords) {
        const nkw = normalize(kw);
        if (lower.length > 2 && nkw.length > 2) {
          const dist = levenshtein(lower, nkw);
          const ratio = dist / Math.max(lower.length, nkw.length);
          if (ratio < 0.25) return field;
        }
      }
    }
  }

  return best;
}

function stripFieldKeyword(spoken, field) {
  let result = normalize(spoken);
  const sorted = [...field.keywords].sort((a, b) => b.length - a.length);
  for (const kw of sorted) {
    const nkw = normalize(kw);
    if (result.includes(nkw)) {
      result = result.replace(nkw, "").replace(/\b(is|are|was|has|set|to|the|my|a)\b/g, "").trim();
      break;
    }
  }
  return result;
}

function resolveAlias(value, field) {
  if (!field?.aliases) return value;
  const n = normalize(value);
  for (const [alias, canonical] of Object.entries(field.aliases)) {
    if (normalize(alias) === n) return canonical;
  }
  return value;
}

function focusAndHighlight(id, name) {
  let el = document.getElementById(id);
  if (!el && name) el = document.querySelector(`[name="${name}"]`);
  if (!el) return null;
  el.focus?.();
  el.scrollIntoView?.({ behavior: "smooth", block: "center" });
  const prev = el.style.boxShadow;
  el.style.transition = "box-shadow 0.3s";
  el.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.6)";
  setTimeout(() => { el.style.boxShadow = prev; }, 2500);
  return el;
}

function setNativeInputValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  desc?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function simulateEnter(el) {
  if (!el) return;
  const opt = { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true };
  el.dispatchEvent(new KeyboardEvent("keydown", opt));
  el.dispatchEvent(new KeyboardEvent("keypress", opt));
  el.dispatchEvent(new KeyboardEvent("keyup", opt));
}

function simulateArrowDown(el) {
  if (!el) return;
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", code: "ArrowDown", keyCode: 40, which: 40, bubbles: true }));
}

function simulateTab(el) {
  if (!el) return;
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", code: "Tab", keyCode: 9, which: 9, bubbles: true }));
}

function simulateEscape(el) {
  if (!el) return;
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true }));
}

function parseSpokenDate(text) {
  const months = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
    august: 7, aug: 7, september: 8, sep: 8, october: 9, oct: 9,
    november: 10, nov: 10, december: 11, dec: 11,
  };
  const n = normalize(text);
  const mPat = Object.keys(months).join("|");

  let m = n.match(new RegExp(`(\\d{1,2})\\s+(${mPat})\\s+(\\d{4})`));
  if (m) { const d = new Date(+m[3], months[m[2]], +m[1]); if (!isNaN(d)) return d; }

  m = n.match(new RegExp(`(${mPat})\\s+(\\d{1,2})\\s+(\\d{4})`));
  if (m) { const d = new Date(+m[3], months[m[1]], +m[2]); if (!isNaN(d)) return d; }

  m = n.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) { const d = new Date(+m[3], +m[2] - 1, +m[1]); if (!isNaN(d)) return d; }

  return null;
}

function getMatchedOption(spokenValue, options = [], field = null) {
  const searches = new Set([normalize(spokenValue)]);
  if (field?.aliases) {
    for (const [alias, canonical] of Object.entries(field.aliases)) {
      if (normalize(alias) === normalize(spokenValue)) searches.add(normalize(canonical));
    }
  }
  const getTexts = (opt) =>
    [opt?.label, opt?.TextField, opt?.name, opt?.value, opt?.ValueField,
      opt?.CentreName, opt?.DoctorName, opt?.Name]
      .filter(Boolean).map(normalize);

  for (const search of searches) {
    const exact = options.find(o => getTexts(o).some(t => t === search));
    if (exact) return exact;
  }
  for (const search of searches) {
    const starts = options.find(o => getTexts(o).some(t => t.startsWith(search) || search.startsWith(t)));
    if (starts) return starts;
  }
  for (const search of searches) {
    const incl = options.find(o => getTexts(o).some(t => t.includes(search) || search.includes(t)));
    if (incl) return incl;
  }
  return null;
}

function extractSelectIndex(spoken) {
  const n = normalize(spoken);
  const numMatch = n.match(/(?:select|choose|pick|confirm|add)\s+(\d+)/);
  if (numMatch) return parseInt(numMatch[1]) - 1;
  const ORDINALS = { first: 0, second: 1, third: 2, fourth: 3, fifth: 4, sixth: 5 };
  const ordMatch = n.match(/(?:select|choose|pick|confirm|add)\s+(first|second|third|fourth|fifth|sixth)/);
  if (ordMatch) return ORDINALS[ordMatch[1]] ?? 0;
  return 0;
}

function clickModalConfirm(answer) {
  // Try visible modals/dialogs first
  const modalContainers = document.querySelectorAll(
    ".modal.show, .p-dialog, .swal2-container, .swal-overlay--show-modal, [role='dialog'], .p-confirm-dialog"
  );
  
  const yesTexts = ["yes", "confirm", "ok", "okay", "proceed", "register", "save", "submit", "continue", "accept", "agree"];
  const noTexts = ["no", "cancel", "close", "reject", "deny", "decline", "dismiss", "back"];
  const targetTexts = answer ? yesTexts : noTexts;
  
  // Search inside modal containers first
  for (const modal of modalContainers) {
    const buttons = Array.from(modal.querySelectorAll("button, .btn, a.btn, [role='button']"));
    const matched = buttons.find(btn => {
      const t = btn.innerText?.trim().toLowerCase();
      return targetTexts.some(txt => t === txt || t.includes(txt));
    });
    if (matched && matched.offsetParent !== null) { matched.click(); return true; }
  }
  
  // Fallback: search all visible buttons
  const allButtons = Array.from(document.querySelectorAll("button, .btn, a.btn, [role='button']"));
  const textMatch = allButtons.find(btn => {
    const t = btn.innerText?.trim().toLowerCase();
    return targetTexts.some(txt => t === txt || t.includes(txt));
  });
  if (textMatch && textMatch.offsetParent !== null) { textMatch.click(); return true; }

  const selectors = answer
    ? ["button.btn-primary", "button.btn-success", ".modal .btn-primary", ".swal-button--confirm", ".swal2-confirm", ".p-confirm-dialog-accept", ".p-dialog-footer .p-button-primary"]
    : ["button.btn-secondary", "button.btn-danger", ".modal .btn-secondary", ".swal-button--cancel", ".swal2-cancel", ".p-confirm-dialog-reject", ".p-dialog-footer .p-button-secondary"];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.offsetParent !== null) { el.click(); return true; }
  }
  return false;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function getFuzzyMatch(spokenValue, options = []) {
  const sv = normalize(spokenValue);
  const getTexts = (opt) =>
    [opt?.label, opt?.TextField, opt?.name, opt?.value].filter(Boolean).map(normalize);

  let bestOpt = null, bestScore = Infinity;
  for (const opt of options) {
    for (const t of getTexts(opt)) {
      const dist = levenshtein(sv, t);
      const ratio = dist / Math.max(sv.length, t.length);
      if (ratio < 0.4 && dist < bestScore) { bestScore = dist; bestOpt = opt; }
    }
  }
  return bestOpt;
}

// ─────────────────────────────────────────────────────────────────────────────
// SR FACTORY
// ─────────────────────────────────────────────────────────────────────────────
const SR_CLASS = window.SpeechRecognition || window.webkitSpeechRecognition;

function createSR() {
  if (!SR_CLASS) return null;
  const rec = new SR_CLASS();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-IN";
  rec.maxAlternatives = 10;
  return rec;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function VoiceFormFiller({
  onTextFieldChange,
  onSelectChange,
  onAction,
  onTestSearch,
  getOptions,

  onDobChange,
  onSelectMainChange,
  onSelectLTChange,
  onTitleChange,        // ← FIX 3: new prop — calls handleTitleChange in parent
  onTypeaheadChange,
  onTypeaheadSelect,
  onTestSelect,
  onAutoCompleteChange,
  onAutoCompleteSelect,
  getSampleTypes,
  onBarcodeChange,
  onAgeChange,          // ← NEW: calls handleDOBCalculation in parent
  onLTDataChange,       // ← NEW: calls setLTData for ClientRefNumber, OtherLabRefNo, PatientIDProofNo
  onFuhidChange,        // ← NEW: calls setFuhid for Employee ID
}) {
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [status, setStatus] = useState("Click mic to start");
  const [transcript, setTranscript] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [pulse, setPulse] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const recRef = useRef(null);
  const activeRef = useRef(null);
  const bufRef = useRef("");
  const toastTimer = useRef(null);
  const listeningRef = useRef(false);
  const startedRef = useRef(false);
  const watchdogTimer = useRef(null);
  const typeaheadTimer = useRef(null);
  const handleSpokenRef = useRef(null);

  // FIX 2: heartbeat — tracks last time onresult fired; restarts SR if silent > 8s
  const lastResultTime = useRef(Date.now());
  const heartbeatInterval = useRef(null);

  activeRef.current = activeField;

  const pushToast = useCallback((msg, ms = 2800) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), ms);
  }, []);

  // ── Value processor ──────────────────────────────────────────────────────
  const processValue = useCallback((field, value) => {

    if (field.type === "input") {
      bufRef.current += (bufRef.current ? " " : "") + value;
      const el = document.getElementById(field.id) || (field.name ? document.querySelector(`[name="${field.name}"]`) : null);
      if (el) {
        setNativeInputValue(el, bufRef.current);
        if (field.triggerEnter) simulateEnter(el);
      }
      onTextFieldChange?.(field.id, bufRef.current);
      setStatus(`✏️ ${field.id}: ${bufRef.current}`);
    }

    // ── Age input — triggers DOB recalculation via onAgeChange ──
    else if (field.type === "ageInput") {
      // Extract numeric value from spoken text
      const numMatch = value.match(/\d+/);
      const numValue = numMatch ? numMatch[0] : value;
      const el = document.getElementById(field.id);
      if (el) {
        setNativeInputValue(el, numValue);
      }
      // Call parent's handleDOBCalculation with proper event shape
      onAgeChange?.({ target: { name: field.ageName || field.id, value: numValue } });
      setStatus(`✏️ ${field.id}: ${numValue}`);
      pushToast(`✅ ${field.ageName}: ${numValue}`);
    }

    // ── Email input — fixes spoken "at the rate" → "@" ──
    else if (field.type === "emailInput") {
      const fixedValue = fixEmailSpoken(value);
      bufRef.current += (bufRef.current ? " " : "") + fixedValue;
      // Clean up the full buffer for email (remove extra spaces)
      const emailValue = bufRef.current.replace(/\s+/g, "").trim();
      const el = document.getElementById(field.id);
      if (el) {
        setNativeInputValue(el, emailValue);
      }
      onTextFieldChange?.(field.id, emailValue);
      setStatus(`✏️ ${field.id}: ${emailValue}`);
    }

    // ── LT Data input — uses onLTDataChange for PatientIDProofNo, ClientRefNumber etc ──
    else if (field.type === "ltInput") {
      bufRef.current += (bufRef.current ? " " : "") + value;
      const el = document.getElementById(field.id);
      if (el) {
        setNativeInputValue(el, bufRef.current);
      }
      onLTDataChange?.(field.id, bufRef.current);
      setStatus(`✏️ ${field.id}: ${bufRef.current}`);
      pushToast(`✅ ${field.id}: ${bufRef.current}`);
    }

    // ── Fuhid (Employee ID) input ──
    else if (field.type === "fuhid") {
      bufRef.current += (bufRef.current ? " " : "") + value;
      const el = document.getElementById(field.id);
      if (el) {
        setNativeInputValue(el, bufRef.current);
        if (field.triggerEnter) simulateEnter(el);
      }
      onFuhidChange?.(bufRef.current);
      setStatus(`✏️ Employee ID: ${bufRef.current}`);
      pushToast(`✅ Employee ID: ${bufRef.current}`);
    }

    // ── FIX 3: Title — synthetic event matching handleTitleChange signature ──
    else if (field.type === "selectTitle") {
      const resolved = resolveAlias(value, field);
      const options = getOptions?.(field.name || field.id) || [];
      const match = getMatchedOption(resolved, options, field) || getFuzzyMatch(resolved, options);
      const optValue = match ? (match.value ?? match.ValueField ?? match.label ?? resolved) : resolved;

      // handleTitleChange expects e.target = { name, value }
      onTitleChange?.({ target: { name: "Title", value: optValue } });

      setTimeout(() => simulateTab(document.getElementById(field.id)), 150);
      setStatus(`✅ Title: ${optValue}`);
      pushToast(`✅ ${optValue}`);
    }

    else if (field.type === "selectMain") {
      const resolved = resolveAlias(value, field);
      const options = getOptions?.(field.name || field.id) || [];
      const match = getMatchedOption(resolved, options, field) || getFuzzyMatch(resolved, options);
      const optValue = match ? (match.value ?? match.ValueField ?? match.label ?? resolved) : resolved;
      onSelectMainChange?.(field.name || field.id, optValue);
      setTimeout(() => simulateTab(document.getElementById(field.id)), 150);
      setStatus(`✅ ${field.id}: ${optValue}`);
      pushToast(`✅ ${optValue}`);
    }

    else if (field.type === "selectLT") {
      const resolved = resolveAlias(value, field);
      const options = getOptions?.(field.name || field.id) || [];
      const match = getMatchedOption(resolved, options, field) || getFuzzyMatch(resolved, options);
      if (match) {
        const optValue = match.value ?? match.ValueField ?? match.label ?? resolved;
        onSelectLTChange?.(field.name || field.id, optValue);
        setTimeout(() => simulateTab(document.getElementById(field.id)), 150);
        setStatus(`✅ ${field.id}: ${match.label || match.value || resolved}`);
        pushToast(`✅ ${match.label || match.value || resolved}`);
      } else {
        setStatus(`⚠️ No match: "${value}"`);
        pushToast(`⚠️ No match: "${value}"`);
      }
    }

    // ── FIX 1: selectSearch — retry with fresh options if first attempt misses ──
    else if (field.type === "selectSearch") {
      const resolved = resolveAlias(value, field);

      const trySelect = (attempt = 0) => {
        const options = getOptions?.(field.name || field.id) || [];
        // NEVER auto-select on speech for searchable dropdowns. 
        // Just let it type and filter. The user must say "select" to pick.
        if (attempt < 2) {
          setTimeout(() => trySelect(attempt + 1), 400 * (attempt + 1));
          setStatus(`🔍 Filtering "${value}"... (${attempt + 1})`);
        } else {
          setStatus(`🔦 Filtered for "${value}" — say "select" to pick first`);
          pushToast(`🔦 Filtered for "${value}"`);
        }
      };

      // Focus the ReactSelect and type the value to trigger its internal search
      const el = document.getElementById(field.id);
      if (el) {
        el.focus();
        const input = el.querySelector("input");
        if (input) setNativeInputValue(input, value);
      }

      // Give ReactSelect time to filter its options list, then match
      setTimeout(() => trySelect(0), 350);
    }

    else if (field.type === "typeahead") {
      const el = document.getElementById(field.id);
      if (el) { setNativeInputValue(el, value); el.focus(); }
      onTypeaheadChange?.(field.name || field.id, value);
      setStatus(`🔍 ${field.id}: "${value}" — auto-selecting...`);
      pushToast(`🔍 "${value}" — searching...`);
      clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(() => {
        const options = getOptions?.(field.name || field.id) || [];
        if (options.length > 0) {
          onTypeaheadSelect?.(field.name || field.id, 0);
          const label = options[0]?.label || options[0]?.DoctorName || options[0]?.name || value;
          setStatus(`✅ ${field.id}: ${label}`);
          pushToast(`✅ ${label}`);
        } else {
          if (el) { simulateArrowDown(el); setTimeout(() => simulateEnter(el), 120); }
          setStatus(`⚠️ No suggestions for "${value}"`);
          pushToast(`⚠️ No match for "${value}"`);
        }
      }, 1200);
    }

    else if (field.type === "testSearch") {
      const el = document.getElementById("testSearch");
      if (el) { setNativeInputValue(el, value); el.focus(); }
      onTestSearch?.(value);
      setStatus(`🔬 Searching: ${value}`);
      pushToast(`🔬 "${value}" — say "select" or "select 2"`);
    }

    else if (field.type === "dob") {
      const parsed = parseSpokenDate(value);
      if (parsed && !isNaN(parsed)) {
        onDobChange?.(parsed, field.dobName || "DOB");
        setStatus(`📅 ${field.dobName}: ${parsed.toDateString()}`);
        pushToast(`📅 ${parsed.toLocaleDateString("en-IN")}`);
        setTimeout(() => {
          const el = document.getElementById(field.id);
          if (el) { simulateEscape(el); el.blur?.(); }
          document.body.click();
        }, 200);
      } else {
        setStatus(`⚠️ Can't parse: "${value}"`);
        pushToast(`⚠️ Can't parse date: "${value}"`);
      }
    }

    else if (field.type === "autocomplete") {
      onAutoCompleteChange?.(field.acField, value);
      setStatus(`🌍 ${field.acField}: "${value}" — searching...`);
      pushToast(`🌍 Searching "${value}"...`);
      setTimeout(() => {
        const options = getOptions?.(field.acField) || [];
        if (options.length > 0) {
          onAutoCompleteSelect?.(field.acField, options[0]);
          const label = options[0]?.CountryName || options[0]?.State || options[0]?.City || value;
          setStatus(`✅ ${field.acField}: ${label}`);
          pushToast(`✅ ${label}`);
        } else {
          pushToast(`⚠️ No match for "${value}"`);
        }
      }, 800);
    }
  }, [onTextFieldChange, onSelectChange, onTestSearch, onSelectMainChange,
    onSelectLTChange, onTitleChange, onTypeaheadChange, onTypeaheadSelect, onDobChange,
    onAutoCompleteChange, onAutoCompleteSelect, getOptions, pushToast, onAgeChange, onLTDataChange]);

  // ── Core speech handler ──────────────────────────────────────────────────
  const handleSpoken = useCallback((spoken) => {
    if (!spoken.trim()) return;
    const lower = normalize(spoken);

    // ── BARCODE INTERCEPT ────────────────────────────────────────────────
    if (lower.startsWith("barcode")) {
      const m = lower.match(/^barcode\s+(.+?)\s+([\w\-]+)$/);
      if (m) {
        const identifier = m[1].trim();
        const barcodeVal = m[2].trim();
        const sampleTypes = getSampleTypes?.() || [];
        let matchedIndex = -1;
        const numericMatch = identifier.match(/^(\d+)$/);
        if (numericMatch) {
          matchedIndex = parseInt(numericMatch[1]) - 1;
        } else {
          matchedIndex = sampleTypes.findIndex(s =>
            normalize(s).includes(normalize(identifier)) || normalize(identifier).includes(normalize(s))
          );
        }
        if (matchedIndex >= 0 && sampleTypes[matchedIndex]) {
          const matchedName = sampleTypes[matchedIndex];
          const el = document.getElementById(`barcode-${matchedIndex}`);
          if (el) { setNativeInputValue(el, barcodeVal); el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); simulateEnter(el); }
          onBarcodeChange?.(matchedName, barcodeVal);
          setActiveField(`barcode-${matchedIndex}`); activeRef.current = `barcode-${matchedIndex}`;
          setStatus(`✅ Barcode [${matchedName}]: ${barcodeVal}`);
          pushToast(`✅ ${matchedName} → ${barcodeVal}`);
        } else {
          setStatus(`⚠️ No sample: "${identifier}"`);
          pushToast(`⚠️ Say: "barcode serum 12345"`);
        }
        return;
      }
      const sampleTypes = getSampleTypes?.() || [];
      if (sampleTypes.length > 0) {
        const el = document.getElementById("barcode-0");
        if (el) { el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
        setActiveField("barcode-0"); activeRef.current = "barcode-0";
        setStatus(`🎯 barcode-0 (${sampleTypes[0]}) — say value`);
        pushToast(`🎯 ${sampleTypes[0]} — say barcode value`);
      }
      return;
    }

    const currentId = activeRef.current;
    const detectedField = findFieldByKeyword(lower);

    // Flush buffered text before switching fields
    if (detectedField && currentId && bufRef.current.trim()) {
      const prevField = FIELD_MAP.find(f => f.id === currentId);
      if (prevField?.type === "input") {
        const el = document.getElementById(currentId);
        if (el) { setNativeInputValue(el, bufRef.current.trim()); if (prevField.triggerEnter) simulateEnter(el); }
        onTextFieldChange?.(currentId, bufRef.current.trim());
      } else if (prevField?.type === "emailInput") {
        const emailValue = bufRef.current.replace(/\s+/g, "").trim();
        const el = document.getElementById(currentId);
        if (el) { setNativeInputValue(el, emailValue); }
        onTextFieldChange?.(currentId, emailValue);
      } else if (prevField?.type === "ltInput") {
        const el = document.getElementById(currentId);
        if (el) { setNativeInputValue(el, bufRef.current.trim()); }
        onLTDataChange?.(currentId, bufRef.current.trim());
      }
      bufRef.current = "";
    }

    if (detectedField) {

      if (detectedField.type === "modalConfirm") {
        const clicked = clickModalConfirm(detectedField.answer);
        if (clicked) {
          const label = detectedField.answer ? "✅ Confirmed!" : "❌ Cancelled";
          setStatus(label); pushToast(label);
        } else {
          setStatus("⚠️ No modal found"); pushToast("⚠️ No modal open");
        }
        return;
      }

      if (detectedField.id === "__clear__") {
        if (currentId) {
          const el = document.getElementById(currentId) || (detectedField.name ? document.querySelector(`[name="${detectedField.name}"]`) : null);
          if (el) { setNativeInputValue(el, ""); }
          bufRef.current = "";
          const f = FIELD_MAP.find(x => x.id === currentId);
          if (f?.type === "input" || f?.type === "emailInput") onTextFieldChange?.(currentId, "");
          if (f?.type === "ltInput") onLTDataChange?.(currentId, "");
          if (f?.type === "fuhid") onFuhidChange?.("");
          setStatus(`🧹 Cleared ${currentId}`); pushToast(`🧹 Cleared ${currentId}`);
        } else {
          setStatus("⚠️ No active field to clear");
        }
        return;
      }

      if (detectedField.type === "action") {
        onAction?.(detectedField.id);
        const label = detectedField.id === "__save__" ? "💾 Saving..." : "🔄 Resetting...";
        setStatus(label); pushToast(label); return;
      }

      if (detectedField.type === "selectItem") {
        const idx = extractSelectIndex(lower);
        const currentField = FIELD_MAP.find(f => f.id === currentId);

        if (currentField?.type === "typeahead") {
          onTypeaheadSelect?.(currentField.name, idx);
          setStatus(`✅ Suggestion #${idx + 1} selected`);
          pushToast(`✅ Suggestion #${idx + 1}`);
          return;
        }
        if (currentField?.id === "testSearch") {
          const el = document.getElementById("testSearch");
          if (el) {
            el.focus();
            for (let i = 0; i < idx; i++) setTimeout(() => simulateArrowDown(el), i * 30);
            setTimeout(() => simulateEnter(el), idx * 30 + 100);
          } else {
            onTestSelect?.(idx);
          }
          setStatus(`✅ Test #${idx + 1} selected`);
          pushToast(`✅ Test #${idx + 1}`);
          return;
        }
        if (currentField?.type === "selectSearch") {
          const options = getOptions?.(currentField.name || currentField.id) || [];
          
          // Filter options based on what's currently in the search input
          const el = document.getElementById(currentField.id);
          const input = el?.querySelector("input");
          const filter = input?.value?.toLowerCase().trim() || "";
          
          let targetOptions = options;
          if (filter) {
            targetOptions = options.filter(opt => {
              const label = (opt.label || opt.TextField || opt.CentreName || opt.name || opt.value || "").toString().toLowerCase();
              return label.includes(filter);
            });
          }

          if (targetOptions[idx]) {
            // Explicitly clear the search input so the UI reflects the selection
            const el = document.getElementById(currentField.id);
            const input = el?.querySelector("input");
            if (input) setNativeInputValue(input, "");
            
            // Close the menu before selecting so focus move is clean
            simulateEscape(el);
            simulateEscape(input);

            onSelectChange?.(currentField.name || currentField.id, targetOptions[idx]);
            const label = targetOptions[idx].label || targetOptions[idx].TextField || targetOptions[idx].CentreName || targetOptions[idx].value || "Item";
            setStatus(`✅ ${currentField.id}: ${label}`);
            pushToast(`✅ ${label}`);
            // NO simulateTab here! Parent handles focus.
          } else {
            setStatus(`⚠️ No ${filter ? "filtered " : ""}option at index ${idx + 1}`);
          }
          return;
        }
        onTestSelect?.(idx);
        setStatus(`✅ Item #${idx + 1} selected`);
        pushToast(`✅ Item #${idx + 1}`);
        return;
      }

      setActiveField(detectedField.id);
      activeRef.current = detectedField.id;
      const el = document.getElementById(detectedField.id) || (detectedField.name ? document.querySelector(`[name="${detectedField.name}"]`) : null);
      bufRef.current = (el && detectedField.type === "input") ? (el.value || "") : "";
      focusAndHighlight(detectedField.id, detectedField.name);
      setStatus(`Active: ${detectedField.id}`);
      pushToast(`🎯 ${detectedField.id}`);
      const inlineValue = stripFieldKeyword(lower, detectedField);
      if (inlineValue) processValue(detectedField, inlineValue);
      return;
    }

    if (!currentId) { setStatus("Say a field name first"); pushToast("Say a field name first"); return; }
    const currentField = FIELD_MAP.find(f => f.id === currentId);
    if (!currentField) return;
    processValue(currentField, spoken.trim());

  }, [onTextFieldChange, onSelectChange, onAction, onTestSearch, onTestSelect,
    onSelectMainChange, onSelectLTChange, onTitleChange, onTypeaheadChange, onTypeaheadSelect,
    onDobChange, getOptions, getSampleTypes, onBarcodeChange, pushToast, processValue, onLTDataChange, onFuhidChange]);

  useEffect(() => { handleSpokenRef.current = handleSpoken; }, [handleSpoken]);

  // ── Attach handlers ──────────────────────────────────────────────────────
  const attachHandlers = useCallback((rec) => {
    const lastFinalIdx = { current: -1 };
    let interimTimer = null;

    rec.onstart = () => {
      startedRef.current = true;
      clearTimeout(watchdogTimer.current);
      setPulse(true);
      setIsListening(true);
      setStatus("Listening...");
    };

    rec.onend = () => {
      setPulse(false);
      clearTimeout(interimTimer);
      if (listeningRef.current && recRef.current === rec) {
        setTimeout(() => {
          if (listeningRef.current && recRef.current === rec) {
            try { rec.start(); } catch (_) { }
          }
        }, 250);
      } else if (!listeningRef.current) {
        setIsListening(false);
      }
    };

    rec.onerror = (e) => {
      if (["no-speech", "aborted"].includes(e.error)) return;
      console.error("SR Error:", e.error, e);
      if (e.error === "not-allowed") {
        setStatus("🚫 Mic permission denied");
        listeningRef.current = false;
        setIsListening(false);
        setPulse(false);
      }
    };

    rec.onresult = (e) => {
      // FIX 2: update heartbeat timestamp on every result
      lastResultTime.current = Date.now();

      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          if (i > lastFinalIdx.current) { final += t + " "; lastFinalIdx.current = i; }
        } else {
          interim += t;
        }
      }

      setTranscript(interim || final.trim());

      if (interim) {
        clearTimeout(interimTimer);
        interimTimer = setTimeout(() => {
          const iField = findFieldByKeyword(normalize(interim));
          if (iField && iField.type !== "action" && iField.type !== "selectItem" && iField.type !== "modalConfirm") {
            const iEl = document.getElementById(iField.id);
            if (iEl) {
              iEl.scrollIntoView?.({ behavior: "smooth", block: "center" });
              iEl.style.transition = "box-shadow 0.2s";
              iEl.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.4)";
              setStatus(`➡️ ${iField.id}`);
            }
          }
        }, 120);
      }

      if (final.trim()) handleSpokenRef.current?.(final.trim());
    };
  }, []);

  // ── FIX 2: heartbeat restarter ───────────────────────────────────────────
  // Polls every 2s; if no result for 5s while we should be listening → restart SR
  const startHeartbeat = useCallback(() => {
    clearInterval(heartbeatInterval.current);
    heartbeatInterval.current = setInterval(() => {
      if (!listeningRef.current) return;
      const silent = Date.now() - lastResultTime.current;
      if (silent > 5000) {
        console.warn(`SR heartbeat: silent for ${silent}ms — restarting`);
        setStatus("🔄 Auto-restarting...");
        lastResultTime.current = Date.now(); // reset so we don't loop immediately
        try { recRef.current?.abort(); } catch (_) { }
        const rec2 = createSR();
        if (!rec2) return;
        attachHandlers(rec2);
        recRef.current = rec2;
        setTimeout(() => {
          if (listeningRef.current) {
            try { rec2.start(); setPulse(true); } catch (_) { }
          }
        }, 100);
      }
    }, 2000);
  }, [attachHandlers, pushToast]);

  // ── Toggle ───────────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    if (!SR_CLASS) { setStatus("Use Chrome — Speech API not supported"); return; }

    // Always cleanup previous SR first
    if (recRef.current) {
      try { recRef.current.abort(); } catch (_) { }
      recRef.current = null;
    }
    clearTimeout(watchdogTimer.current);
    clearInterval(heartbeatInterval.current);

    if (!listeningRef.current) {
      listeningRef.current = true;
      startedRef.current = false;
      bufRef.current = "";
      setActiveField(null); activeRef.current = null;
      setTranscript("");
      setStatus("Starting...");
      setIsListening(true);
      setPulse(true);
      pushToast("🎙 Voice assistant active");
      lastResultTime.current = Date.now(); // reset heartbeat clock

      const rec = createSR();
      if (!rec) { setStatus("Speech not supported"); listeningRef.current = false; setIsListening(false); setPulse(false); return; }
      attachHandlers(rec);
      recRef.current = rec;

      // Start immediately — no delay
      try {
        rec.start();
      } catch (e) {
        console.warn("SR start error:", e);
        // Retry once after a brief pause
        setTimeout(() => {
          if (!listeningRef.current) return;
          try {
            const rec2 = createSR();
            if (!rec2) { setStatus("Speech not supported"); return; }
            attachHandlers(rec2);
            recRef.current = rec2;
            rec2.start();
          } catch (e2) {
            console.warn("SR retry failed:", e2);
            setStatus("Mic error — try again");
            listeningRef.current = false;
            setIsListening(false);
            setPulse(false);
          }
        }, 200);
      }

      // Watchdog: if SR never fires onstart within 2s, force restart
      watchdogTimer.current = setTimeout(() => {
        if (!startedRef.current && listeningRef.current) {
          console.warn("SR silent failure — retrying");
          setStatus("Retrying...");
          try { recRef.current?.abort(); } catch (_) { }
          const rec2 = createSR();
          if (!rec2) return;
          attachHandlers(rec2);
          recRef.current = rec2;
          setTimeout(() => {
            if (listeningRef.current) {
              try { rec2.start(); } catch (_) { }
            }
          }, 100);
        }
      }, 2000);

      startHeartbeat(); // ← FIX 2: start heartbeat watchdog

    } else {
      listeningRef.current = false;
      setIsListening(false);
      setPulse(false);
      setActiveField(null); activeRef.current = null;
      setTranscript("");
      setStatus("Stopped");
      pushToast("🔇 Voice stopped");
    }
  }, [attachHandlers, pushToast, startHeartbeat]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      clearTimeout(watchdogTimer.current);
      clearInterval(heartbeatInterval.current);
      if (recRef.current) { try { recRef.current.abort(); } catch (_) { } }
    };
  }, []);

  // ─── UI ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={S.fabWrap}>
        {pulse && (
          <>
            <span style={{ ...S.ring, animationDelay: "0s" }} />
            <span style={{ ...S.ring, animationDelay: "0.45s" }} />
            <span style={{ ...S.ring, animationDelay: "0.9s" }} />
          </>
        )}
        {showTip && (
          <div style={S.tooltip}>{isListening ? "Stop voice input" : "Start voice input"}</div>
        )}
        <button
          type="button" onClick={toggle}
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          style={{
            ...S.fab, 
            background: isListening
              ? "linear-gradient(135deg,#ef4444,#991b1b)"
              : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
            boxShadow: isListening
              ? "0 4px 24px rgba(239,68,68,0.6)"
              : "0 4px 24px rgba(59,130,246,0.55)",
          }}
        >
          {isListening
            ? <svg viewBox="0 0 24 24" style={S.icon}><rect x="6" y="6" width="12" height="12" rx="2" fill="white" /></svg>
            : <svg viewBox="0 0 24 24" style={S.icon}><path fill="white" d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21H9v2h6v-2h-2v-2.07A8.001 8.001 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 6.93z" /></svg>
          }
        </button>
      </div>

      {isListening && (
        <div style={S.hud}>
          <div style={S.hudStatus}>{status}</div>
          {transcript && (
            <div style={S.hudRow}>
              <span style={S.hudLabel}>Hearing: </span>
              <span style={S.hudText}>{transcript}</span>
            </div>
          )}
          {activeField && (
            <div style={S.hudRow}>
              <span style={S.hudLabel}>Active: </span>
              <span style={S.hudField}>{activeField.replace(/_/g, " ")}</span>
            </div>
          )}
          <div style={S.hudHint}>
            Inputs: "mobile 9876543210" · "first name John"<br />
            Centre: "centre Apollo" → auto-selects<br />
            Title: "title Mr" · "title Doctor"<br />
            Rate: "rate type cash" · "panel corporate"<br />
            Doctor: "doctor sharma" → auto-selects first<br />
            DOB: "dob 15 jan 1990" · "born 1/1/2000"<br />
            Tests: "add test CBC" → "select" or "select 2"<br />
            Popups: "yes" or "no" · Actions: "save" · "reset"
          </div>
        </div>
      )}

      {toastMsg && <div key={toastMsg} style={S.toast}>{toastMsg}</div>}

      <style>{`
        @keyframes vff-ring  { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(2.5);opacity:0} }
        @keyframes vff-in    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vff-toast { 0%{opacity:0;transform:translateX(-50%) translateY(8px)} 12%{opacity:1;transform:translateX(-50%) translateY(0)} 80%{opacity:1} 100%{opacity:0} }
      `}</style>
    </>
  );
}

const S = {
  fabWrap: { position: "fixed", bottom: "32px", right: "32px", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" },
  fab: { width: "60px", height: "60px", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s,box-shadow 0.3s", outline: "none", position: "relative", zIndex: 2 },
  icon: { width: "26px", height: "26px" },
  ring: { position: "absolute", width: "60px", height: "60px", borderRadius: "50%", background: "rgba(59,130,246,0.3)", animation: "vff-ring 1.5s ease-out infinite", zIndex: 1 },
  tooltip: { position: "absolute", bottom: "68px", right: 0, background: "#111827", color: "#f3f4f6", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,.3)", animation: "vff-in 0.2s ease", zIndex: 3 },
  hud: { position: "fixed", bottom: "106px", right: "22px", background: "rgba(15,23,42,.93)", backdropFilter: "blur(10px)", color: "#f8fafc", borderRadius: "14px", padding: "14px 18px", minWidth: "270px", maxWidth: "360px", boxShadow: "0 8px 32px rgba(0,0,0,.5)", zIndex: 99998, animation: "vff-in 0.25s ease", fontFamily: "system-ui,-apple-system,sans-serif", fontSize: "13px" },
  hudStatus: { fontWeight: "700", fontSize: "14px", marginBottom: "6px", color: "#93c5fd" },
  hudRow: { background: "rgba(255,255,255,.07)", borderRadius: "8px", padding: "5px 10px", marginTop: "5px", wordBreak: "break-word" },
  hudLabel: { color: "#94a3b8", fontSize: "11px", marginRight: "4px" },
  hudText: { color: "#fef9c3", fontStyle: "italic" },
  hudField: { color: "#4ade80", fontWeight: "700", textTransform: "capitalize" },
  hudHint: { marginTop: "8px", color: "#64748b", fontSize: "11px", fontStyle: "italic", lineHeight: "1.7" },
  toast: { position: "fixed", bottom: "106px", left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#f1f5f9", padding: "9px 20px", borderRadius: "999px", fontSize: "13px", fontWeight: "600", boxShadow: "0 4px 20px rgba(0,0,0,.35)", zIndex: 99999, animation: "vff-toast 2.8s ease forwards", whiteSpace: "nowrap", fontFamily: "system-ui,sans-serif" },
};
