import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import { SaveButton, CustomButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import RazorPay from "../Payment/RazorPay";
import { axiosInstance } from "../../utils/axiosInstance";
import { guidNumber } from "../../utils/generateGuid";
import PlaceholderImage from "../Laboratory/PlaceholderImage.jpg";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import CameraModal from "../utils/CameraModal";
import {
  bindCentresForRadiology,
  saveMacRadiologyAppointment,
  searchPatientForRadiology,
  printAppointmentReceipt,
  confirmMacRadiologyAppointment,
  getTestSlotDurations,
} from "./api";

const PATIENT_TYPES = [
  { value: "Normal", label: "Normal" },
  { value: "VIP", label: "VIP" },
  { value: "VVIP", label: "VVIP" },
  { value: "Staff", label: "Staff" },
  { value: "BPL", label: "BPL" },
];

// Same Title → Gender mapping as PatientRegistration.jsx's findGender()
const TITLE_GENDER_MAP = {
  mr: "Male", baba: "Male", "dr(mr)": "Male", master: "Male",
  miss: "Female", mrs: "Female", baby: "Female", "dr(miss)": "Female",
  "dr(mrs)": "Female", ms: "Female", smt: "Female",
};
const genderForTitle = (title) => {
  const key = (title || "").toLowerCase().replace(/[.\s]/g, "");
  return TITLE_GENDER_MAP[key] || "";
};

const EMPTY_FORM = {
  CentreId: "",
  CentreName: "",
  RateTypeId: "",
  RateTypeName: "",
  Title: "Mr.",
  MobileNo: "",
  PatientName: "",
  DOB: null,
  AgeYear: "",
  AgeMonth: "",
  AgeDays: "",
  Gender: "Male",
  Address: "",
  Locality: "",
  RefDoctor: "SELF",
  RefDoctorId: "",
  Comment: "",
  PatientTypeId: "",
  BookingId: "",
};

const InfoChip = ({ label, value }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "rgba(255,255,255,0.65)",
      border: "1px solid #86efac",
      borderRadius: 999,
      padding: "4px 12px",
      fontSize: 12,
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ color: "#15803d", fontWeight: 700 }}>{label}</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{value}</span>
  </span>
);

const SuggestBox = ({ visible, items, getLabel, onSelect, anchorRef, highlightIndex = -1 }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });

  useEffect(() => {
    if (visible && anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 2, left: r.left, width: r.width });
    }
  }, [visible]);

  if (!visible || items.length === 0) return null;

  return createPortal(
    <div style={{
      position: "fixed", zIndex: 999999, background: "#fff",
      border: "1px solid #93c5fd", borderRadius: "6px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      top: pos.top, left: pos.left, width: pos.width,
      maxHeight: "200px", overflowY: "auto",
    }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            padding: "7px 12px", cursor: "pointer", fontSize: "12px",
            borderBottom: "1px solid #f1f5f9",
            background: idx === highlightIndex ? "#2563eb" : "transparent",
            color: idx === highlightIndex ? "#fff" : "#1e293b",
            fontWeight: idx === highlightIndex ? 600 : 400,
          }}
          onMouseDown={() => onSelect(item)}
          onMouseEnter={(e) => {
            if (idx !== highlightIndex) {
              e.currentTarget.style.background = "#dbeafe";
              e.currentTarget.style.color = "#1e40af";
            }
          }}
          onMouseLeave={(e) => {
            if (idx !== highlightIndex) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#1e293b";
            }
          }}
        >
          {getLabel(item)}
        </div>
      ))}
    </div>,
    document.body
  );
};

const BookSlotModal = ({ visible, slotInfo, onClose, onSuccess }) => {
  const theme = useLocalStorage("theme", "get");
  const navigate = useNavigate();

  // ── dropdown options ──────────────────────────────────────────────────────
  const [titles, setTitles] = useState([]);
  const [genders, setGenders] = useState([]);
  const [centres, setCentres] = useState([]);
  const [rateTypes, setRateTypes] = useState([]);
  const [addedInvestigations, setAddedInvestigations] = useState([]);
  // Test Slot Duration Master lookup — fetched once per modal open, then
  // matched by InvestigationId as tests get added. See
  // backend-docs/backend-radiology-test-slot-duration.md.
  const [testDurations, setTestDurations] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [bankNames, setBankNames] = useState([]);

  // ── billing: discount + payment capture ───────────────────────────────────
  // Multi-row split payment, mirroring PatientRegistration.jsx's RcData shape
  // (PaymentMode/PaymentModeID/Amount/BankName/CardNo/CardDate) — see
  // backend-radiology-split-payment.md for the backend support this needs.
  const [discountAmt, setDiscountAmt] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const emptyPaymentRow = () => ({
    PaymentMode: "Cash", PaymentModeID: "", Amount: "", BankName: "", CardNo: "", CardDate: "",
  });
  const [payments, setPayments] = useState([emptyPaymentRow()]);
  // "unpaid" = book the slot now, complete registration/payment later (the
  // existing appointments grid shows a "Registration" button for these).
  // "pay"    = collect payment now (manual entry above, or Razorpay below);
  //            once paid, the backend is expected to auto-register the
  //            patient so the "Registration" button no longer shows.
  const [bookingMode, setBookingMode] = useState("unpaid");
  const [isRazorPayOpen, setIsRazorPayOpen] = useState(false);
  const [razorPayKeyInfo, setRazorPayKeyInfo] = useState({ receipt: "", key_id: "", key_secret: "" });
  const [payingViaRazorpay, setPayingViaRazorpay] = useState(false);
  const [razorpayBasePayload, setRazorpayBasePayload] = useState(null);
  const [razorpayAmount, setRazorpayAmount] = useState(0);

  // ── autocomplete suggestion lists ─────────────────────────────────────────
  const [patientSugg, setPatientSugg] = useState([]);
  const [doctorSugg, setDoctorSugg] = useState([]);
  const [invSugg, setInvSugg] = useState([]);
  const [showPatient, setShowPatient] = useState(false);
  const [showDoctor, setShowDoctor] = useState(false);
  const [showInvSugg, setShowInvSugg] = useState(false);
  const [invSearchText, setInvSearchText] = useState("");

  const [invHighlightIdx, setInvHighlightIdx] = useState(-1);

  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null); // appointmentId being confirmed
  const [form, setForm] = useState(EMPTY_FORM);
  const [pickedSlots, setPickedSlots] = useState([]);

  // ── Patient photo + document upload — same UI/components/flow as
  // PatientRegistration.jsx's photoAndDocsField (CameraModal for the photo,
  // UploadFile for documents), both keyed off a client-side GUID generated
  // before the patient/appointment is actually saved (guidNumber() is a pure
  // client-side generator, no backend call — same as PatientRegistration.jsx's
  // PatientGuid). See backend-docs/backend-radiology-slot-book-documents.md
  // for what's unconfirmed about linking these to the saved appointment.
  const [patientImg, setPatientImg] = useState({ img: PlaceholderImage, show: false });
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [requiredAttachment, setRequiredAttachment] = useState([]);
  const [documentGuid, setDocumentGuid] = useState("");

  const tPatient = useRef(null);
  const tInv = useRef(null);
  const patientContainerRef = useRef(null);
  const doctorContainerRef = useRef(null);
  const invContainerRef = useRef(null);

  // appointments that already existed when the modal was opened (from parent grid data)
  const existingAppointments = slotInfo?.initialAppointments || [];

  // ── multi-slot booking: parent hands us the maximal run of consecutive,
  // free/unblocked slots starting at the clicked one ───────────────────────
  const upcomingSlots = slotInfo?.upcomingSlots?.length
    ? slotInfo.upcomingSlots
    : (slotInfo?.TimeSlot ? [slotInfo.TimeSlot] : []);
  const allowMultiSlot = slotInfo?.allowMultiSlot !== false && upcomingSlots.length > 1;
  // capped at upcomingSlots.length, so a booked/blocked slot further down the
  // grid (e.g. 10:30 already taken) makes it impossible to pick past it
  const slotCountOptions = Array.from({ length: upcomingSlots.length }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));
  // keep chronological order regardless of the order slots were checked in
  const selectedSlots  = upcomingSlots.filter((s) => pickedSlots.includes(s));

  // ── load dropdowns when modal opens ──────────────────────────────────────
  useEffect(() => { if (visible) loadDropdowns(); }, [visible]);

  // Fresh GUID per booking attempt — same generator/pattern
  // PatientRegistration.jsx uses for PatientGuid, just this modal's own copy
  // rather than importing a component-scoped one from that file.
  useEffect(() => {
    if (visible) setDocumentGuid(guidNumber());
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    getTestSlotDurations()
      .then((res) => setTestDurations(res?.data?.message || []))
      .catch(() => setTestDurations([])); // not configured yet — every test just falls back to 1 slot
  }, [visible]);

  const getTestDurationMinutes = (investigationId) => {
    const match = testDurations.find(
      (d) => String(d.investigationId ?? d.InvestigationId) === String(investigationId)
    );
    return match ? Number(match.durationMinutes ?? match.DurationMinutes) || null : null;
  };

  // Minutes between this machine's own consecutive slots, derived from the
  // already-machine-filtered upcomingSlots list itself (openBook() in
  // RadiologyAppointment.jsx only ever puts this machine's own valid times
  // in there) — falls back to 15 when there's nothing to compare yet.
  const machineIntervalMinutes = (() => {
    if (upcomingSlots.length < 2) return 15;
    const toMinutes = (s) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m;
    };
    return toMinutes(upcomingSlots[1]) - toMinutes(upcomingSlots[0]) || 15;
  })();

  // default-select just the clicked slot whenever a different slot/machine is opened
  useEffect(() => {
    if (visible) setPickedSlots(slotInfo?.TimeSlot ? [slotInfo.TimeSlot] : []);
  }, [visible, slotInfo?.MachineId, slotInfo?.TimeSlot]);

  // Track picked slots to the tests added — each test needs
  // ceil(DurationMinutes / machineIntervalMinutes) consecutive slots (1 when
  // it has no configured duration, same as the old "1 slot per test"
  // behaviour), summed across every added test so back-to-back tests each
  // get their own full block instead of all cramming into one slot.
  // Capped at however many consecutive free slots are actually available;
  // warns once when there isn't room for every added test's full duration.
  useEffect(() => {
    if (!visible || !allowMultiSlot) return;
    const wanted = addedInvestigations.reduce((sum, inv) => {
      const needed = inv.DurationMinutes
        ? Math.ceil(inv.DurationMinutes / machineIntervalMinutes)
        : 1;
      return sum + Math.max(1, needed);
    }, 0) || 1;
    const capped = Math.min(wanted, upcomingSlots.length);
    setPickedSlots((prev) =>
      prev.length === capped ? prev : upcomingSlots.slice(0, capped),
    );
    if (wanted > upcomingSlots.length) {
      toast.warn(
        `Only ${upcomingSlots.length} consecutive slot(s) available here, but the added test(s) need ${wanted} — some tests will share/lose slots.`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addedInvestigations, visible, slotInfo?.MachineId, slotInfo?.TimeSlot, machineIntervalMinutes]);

  // the grid this modal was opened from is already scoped to one centre —
  // pre-fill it here so the Centre dropdown can lock to it
  useEffect(() => {
    if (visible) {
      const c = centres.find((c) => String(c.value) === String(slotInfo?.CentreId));
      setForm((p) => ({ ...p, CentreId: slotInfo?.CentreId || "", CentreName: c?.label || p.CentreName }));
    }
  }, [visible, slotInfo?.CentreId, centres]);

  // Rate types are centre-specific — refetch whenever the chosen centre
  // changes. Uses Centre/BindRateTypeWorkOrder — same endpoint/payload shape
  // PatientRegistration.jsx's rate-type binding calls (see
  // commonApi.js's getAccessDataRate) — instead of the old Centre/GetRateType,
  // since this response also carries DefaultRateTypeID: the centre's actual
  // configured default rate type, not just whichever happens to be first.
  useEffect(() => {
    if (!form.CentreId) { setRateTypes([]); return; }
    axiosInstance.post("Centre/BindRateTypeWorkOrder", {
      centreID: form.CentreId,
      rateTypeID: 0,
      AllowEstimate: 0,
      CentreType: "",
      AllowHomeCollection: 0,
      AllowMembershipCard: 0,
    })
      .then((res) => {
        const data = res?.data?.message || [];
        const list = data.map((r) => ({
          value: r.RateTypeID,
          label: r.RateTypeName,
        }));
        setRateTypes(list);
        setForm((p) => {
          const stillValid = list.find((rt) => String(rt.value) === String(p.RateTypeId));
          if (stillValid) return p;
          // Auto-select the centre's configured default rate type
          // (DefaultRateTypeID, same on every row of the response) — same
          // "default select rate type" behaviour Registration gets from this
          // endpoint — falling back to the first option if that id isn't
          // actually present in the list for some reason.
          const def =
            list.find((rt) => String(rt.value) === String(data[0]?.DefaultRateTypeID)) ??
            list[0] ??
            null;
          return { ...p, RateTypeId: def?.value ?? "", RateTypeName: def?.label ?? "" };
        });
      })
      .catch(() => setRateTypes([]));
  }, [form.CentreId]);

  const loadDropdowns = async () => {
    const [centreRes, titleRes, genderRes, docRes, payModeRes, bankRes, attachRes] = await Promise.allSettled([
      bindCentresForRadiology(),
      axiosInstance.post("Global/getGlobalData", { Type: "Title" }),
      axiosInstance.post("Global/getGlobalData", { Type: "Gender" }),
      axiosInstance.post("DoctorReferal/getDoctorDataBind"),
      axiosInstance.post("Global/getGlobalData", { Type: "PaymentMode" }),
      axiosInstance.post("Global/getGlobalData", { Type: "BankName" }),
      // Same generic call PatientRegistration.jsx's getUploadFileIdentity()
      // uses — not Patient-Registration-specific, so no backend change
      // needed to reuse it here for the document-type dropdown.
      axiosInstance.post("Global/GetGlobalData", { Type: "RequiredAttachment" }),
    ]);

    if (attachRes.status === "fulfilled")
      setRequiredAttachment((attachRes.value?.data?.message || []).map((a) => ({
        value: a.FieldDisplay,
        label: a.FieldDisplay,
      })));

    if (payModeRes.status === "fulfilled")
      setPaymentModes((payModeRes.value?.data?.message || []).map((p) => ({
        value: p.FieldID,
        label: p.FieldDisplay,
      })));
    else
      setPaymentModes([{ value: "", label: "Cash" }]);

    if (bankRes.status === "fulfilled")
      setBankNames((bankRes.value?.data?.message || []).map((b) => ({
        value: b.FieldDisplay,
        label: b.FieldDisplay,
      })));

    if (docRes.status === "fulfilled")
      setAllDoctors((docRes.value?.data?.message || []).map((d) => ({
        value: d.DoctorID ?? d.Id,
        label: d.DoctorName ?? d.Name,
      })));

    if (centreRes.status === "fulfilled")
      setCentres((centreRes.value?.data?.message || []).map((c) => ({
        value: c.CentreId ?? c.CentreID ?? c.Id,
        label: c.Centre ?? c.CentreName ?? c.Name,
      })));

    // Title — FieldDisplay as value (matches registration)
    if (titleRes.status === "fulfilled") {
      const raw = titleRes.value?.data?.message || [];
      setTitles(raw.map((t) => ({ value: t.FieldDisplay, label: t.FieldDisplay })));
    } else {
      setTitles([
        { value: "Mr.", label: "Mr." },
        { value: "Mrs.", label: "Mrs." },
        { value: "Ms.", label: "Ms." },
        { value: "Dr.", label: "Dr." },
        { value: "Master.", label: "Master." },
        { value: "Baby.", label: "Baby." },
        { value: "Miss.", label: "Miss." },
      ]);
    }

    // Gender — FieldDisplay as value (matches registration)
    if (genderRes.status === "fulfilled") {
      const raw = (genderRes.value?.data?.message || [])
        .filter((g) => g.FieldDisplay !== "Both");
      setGenders(raw.map((g) => ({ value: g.FieldDisplay, label: g.FieldDisplay })));
    } else {
      setGenders([
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ]);
    }
  };

  // ── generic input handler ─────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "MobileNo" && value.length > 10) return;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSelect = (name, option) => {
    if (name === "CentreId") {
      setForm((p) => ({ ...p, CentreId: option?.value || "", CentreName: option?.label || "" }));
    } else if (name === "RateTypeId") {
      setForm((p) => ({ ...p, RateTypeId: option?.value || "", RateTypeName: option?.label || "" }));
    } else if (name === "Title") {
      const g = genderForTitle(option?.value);
      setForm((p) => ({ ...p, Title: option?.value || "", Gender: g || p.Gender }));
    } else {
      setForm((p) => ({ ...p, [name]: option?.value || "" }));
    }
  };

  // ── DOB ↔ Age sync (same logic as PatientRegistration) ───────────────────
  const handleDOBChange = (date) => {
    if (!date) { setForm((p) => ({ ...p, DOB: null, AgeYear: "", AgeMonth: "", AgeDays: "" })); return; }
    const a = moment(moment().format("YYYY-MM-DD"));
    const b = moment(moment(date).format("YYYY-MM-DD"));
    const years = a.diff(b, "years");
    b.add(years, "years");
    const months = a.diff(b, "months");
    b.add(months, "months");
    let days = a.diff(b, "days");
    if (years === 0 && months === 0 && days === 0) days = 1;
    setForm((p) => ({ ...p, DOB: date, AgeYear: years, AgeMonth: months, AgeDays: days }));
  };

  const handleAgeChange = (e) => {
    const { name, value } = e.target;
    const years = name === "AgeYear" ? value : form.AgeYear || 0;
    const months = name === "AgeMonth" ? value : form.AgeMonth || 0;
    const days = name === "AgeDays" ? value : form.AgeDays || 0;
    const dob = moment().subtract(years, "years").subtract(months, "months").subtract(days, "days").toDate();
    setForm((p) => ({ ...p, [name]: value, DOB: dob }));
  };

  // ── patient autocomplete ──────────────────────────────────────────────────
  const handlePatientInput = (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, PatientName: val }));
    clearTimeout(tPatient.current);
    if (val.length >= 3) {
      tPatient.current = setTimeout(async () => {
        try {
          const res = await searchPatientForRadiology({ SearchTerm: val });
          setPatientSugg(res?.data?.message || []);
          setShowPatient(true);
        } catch { setPatientSugg([]); }
      }, 300);
    } else { setPatientSugg([]); setShowPatient(false); }
  };

  const handleSelectPatient = (p) => {
    setForm((prev) => ({
      ...prev,
      PatientName: p.PatientName,
      MobileNo: p.MobileNo || prev.MobileNo,
      Address: p.Address || prev.Address,
      AgeYear: p.AgeYear ?? prev.AgeYear,
      AgeMonth: p.AgeMonth ?? prev.AgeMonth,
      AgeDays: p.AgeDays ?? prev.AgeDays,
      Gender: p.Gender || prev.Gender,
      DOB: p.DOB ? new Date(p.DOB) : prev.DOB,
    }));
    setShowPatient(false); setPatientSugg([]);
  };

  // ── Ref Doctor typeahead (client-side filter like registration) ──────────
  const handleDoctorInput = (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, RefDoctor: val, RefDoctorId: "" }));
    if (val.trim().length >= 1) {
      const filtered = allDoctors.filter((d) =>
        d.label.toLowerCase().includes(val.toLowerCase())
      );
      setDoctorSugg(filtered.slice(0, 30));
      setShowDoctor(true);
    } else {
      setDoctorSugg([]); setShowDoctor(false);
    }
  };

  const handleSelectDoctor = (d) => {
    setForm((p) => ({ ...p, RefDoctor: d.label, RefDoctorId: d.value }));
    setDoctorSugg([]); setShowDoctor(false);
  };

  // ── investigation typeahead ───────────────────────────────────────────────
  // Mirrors PatientRegistration.jsx's test search: BindBillingTestData powers
  // the live suggestion list as the user types, then BindSingleTestData is
  // called on selection to fetch the centre/rate-accurate Rate for that test.
  const handleInvInput = (e) => {
    const val = e.target.value;
    setInvSearchText(val);
    setInvHighlightIdx(-1);
    clearTimeout(tInv.current);
    if (!form.RateTypeId) {
      if (val.trim().length >= 2) toast.warn("Please select a Rate Type first.");
      setInvSugg([]); setShowInvSugg(false);
      return;
    }
    if (val.trim().length >= 2) {
      tInv.current = setTimeout(async () => {
        try {
          const res = await axiosInstance.post("TestData/BindBillingTestData", {
            TestName: val,
            CentreID: form.RateTypeId,
            SearchBy: "TestName",
            ActualRateTypeID: form.RateTypeId,
            AllowZeroRateBooking: 0,
            // Harmless if BindBillingTestData ignores this — but if it does
            // filter on it, this narrows results server-side instead of
            // relying on the client-side filter below at all.
            DepartmentID: slotInfo?.DepartmentId ?? slotInfo?.DepartmentID ?? "",
          });
          const rawList = res?.data?.success ? (res.data.message || []) : [];
          // This slot belongs to one machine, and that machine belongs to
          // one department (slotInfo.DepartmentName/DepartmentId) — an
          // investigation from a different department has no business being
          // bookable onto it. BindBillingTestData's suggestion items don't
          // reliably carry DepartmentName (unlike BindSingleTestData, which
          // always does — see the safety-net check in handleSelectInvAndAdd
          // below), so this tries every casing/ID variant seen elsewhere in
          // this codebase before giving up and letting it through. Permissive
          // only when NONE of those fields are present at all, so real
          // mismatches never slip through just because of a naming guess.
          const list = rawList.filter((inv) => {
            const invDeptName = inv.DepartmentName ?? inv.departmentName ?? inv.Department ?? inv.department;
            const invDeptId = inv.DepartmentID ?? inv.DepartmentId ?? inv.departmentId ?? inv.departmentID;
            const slotDeptId = slotInfo?.DepartmentId ?? slotInfo?.DepartmentID;
            if (invDeptId != null && slotDeptId != null) {
              return String(invDeptId) === String(slotDeptId);
            }
            if (invDeptName && slotInfo?.DepartmentName) {
              return String(invDeptName).trim().toLowerCase() === String(slotInfo.DepartmentName).trim().toLowerCase();
            }
            return true; // neither side has anything to compare — don't hide a legitimate result over absent data
          });
          setInvSugg(list);
          setShowInvSugg(true);
          setInvHighlightIdx(list.length > 0 ? 0 : -1);
        } catch {
          setInvSugg([]); setShowInvSugg(false);
        }
      }, 300);
    } else {
      setInvSugg([]); setShowInvSugg(false);
    }
  };

  const handleSelectInvAndAdd = async (inv) => {
    const investigationId = inv.InvestigationID ?? inv.InvestigationId ?? inv.Id ?? inv.id;
    if (!investigationId) { toast.warn("Invalid test selected."); return; }

    setInvSearchText(""); setInvSugg([]); setShowInvSugg(false); setInvHighlightIdx(-1);

    if (addedInvestigations.find((i) => String(i.InvestigationId) === String(investigationId))) {
      toast.warn("Investigation already added.");
      return;
    }

    try {
      const res = await axiosInstance.post("TestData/BindSingleTestData", {
        InvestigationID: investigationId,
        CentreID: inv.CentreID ?? form.RateTypeId,
        CentreIdNew: form.CentreId,
        CopaymentRatetype: form.RateTypeId,
        ActualRateTypeID: form.RateTypeId,
        ReferenceRate: inv.ReferenceRate || 0,
        AllowZeroRateBooking: 0,
        IsPromotional: 0,
        PromotionalID: 0,
      });
      const testData = res?.data?.message?.[0] || res?.data?.invDetails;
      if (!res?.data?.success || !testData) {
        toast.error(res?.data?.message || "Failed to fetch test rate.");
        return;
      }

      // Safety net for the case the live suggestion list didn't carry a
      // DepartmentName to filter on — the full test detail always does.
      const testDeptName = testData.DepartmentName || inv.DepartmentName || "";
      if (
        slotInfo?.DepartmentName &&
        testDeptName &&
        String(testDeptName).trim().toLowerCase() !== String(slotInfo.DepartmentName).trim().toLowerCase()
      ) {
        toast.error(
          `"${testData.TestName || inv.TestName}" belongs to ${testDeptName}, not ${slotInfo.DepartmentName} — this machine only accepts ${slotInfo.DepartmentName} investigations.`
        );
        return;
      }

      setAddedInvestigations((p) => [...p, {
        InvestigationId: investigationId,
        InvestigationName: testData.TestName || inv.TestName,
        DepartmentName: testData.DepartmentName || inv.DepartmentName || "",
        Rate: Number(testData.Rate) || 0,
        // null when not configured in Test Slot Duration Master — treated
        // as "needs 1 slot" everywhere this is read, same as before this
        // feature existed.
        DurationMinutes: getTestDurationMinutes(investigationId),
      }]);
    } catch {
      toast.error("Failed to fetch test rate.");
    }
  };

  const handleInvKeyDown = (e) => {
    if (!showInvSugg || invSugg.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setInvHighlightIdx((prev) => Math.min(prev + 1, invSugg.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setInvHighlightIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (invHighlightIdx >= 0) handleSelectInvAndAdd(invSugg[invHighlightIdx]);
    } else if (e.key === "Escape") {
      setInvSugg([]); setShowInvSugg(false); setInvHighlightIdx(-1);
    }
  };

  const handleRemoveInvestigation = (idx) =>
    setAddedInvestigations((p) => p.filter((_, i) => i !== idx));

  const totalAmount = addedInvestigations.reduce((s, i) => s + (Number(i.Rate) || 0), 0);

  // ── billing: discount + payment capture ───────────────────────────────────
  // Multi-row split payment (see backend-radiology-split-payment.md for the
  // backend support this needs — today's SaveMacRadiologyAppointment only
  // accepts one payment mode and requires full payment).
  const grossAmount = totalAmount;
  const discountAmount = discountAmt !== ""
    ? Number(discountAmt) || 0
    : discountPercentage !== ""
      ? (grossAmount * (Number(discountPercentage) || 0)) / 100
      : 0;
  const netAmount = Math.max(grossAmount - discountAmount, 0);
  const paidAmount = payments.reduce((s, p) => s + (Number(p.Amount) || 0), 0);
  const dueAmount = netAmount - paidAmount;

  const handleDiscountAmtChange = (e) => {
    const val = e.target.value;
    if (discountPercentage !== "") { toast.warn("Remove Discount Percentage first."); return; }
    if (Number(val) > grossAmount) { toast.warn("Discount cannot exceed Gross Amount."); return; }
    setDiscountAmt(val);
  };

  const handleDiscountPercentChange = (e) => {
    const val = e.target.value;
    if (discountAmt !== "") { toast.warn("Remove Discount Amount first."); return; }
    if (Number(val) > 100) { toast.warn("Discount % cannot exceed 100."); return; }
    setDiscountPercentage(val);
  };

  const handlePaymentRowField = (idx, field, value) =>
    setPayments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });

  const handlePaymentModeChange = (idx, option) =>
    setPayments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], PaymentMode: option?.label || "", PaymentModeID: option?.value || "" };
      return next;
    });

  const handleAddPaymentRow = () => setPayments((prev) => [...prev, emptyPaymentRow()]);

  const handleRemovePaymentRow = (idx) =>
    setPayments((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const NON_BANK_MODES = ["cash", "online payment", "upi", "paytm"];

  // ── confirm appointment ───────────────────────────────────────────────────
  const handleConfirm = async (appt) => {
    const id = appt.appointmentId ?? appt.AppointmentId;
    if (!id) { toast.warn("Appointment ID not found."); return; }
    setConfirming(id);
    try {
      const res = await confirmMacRadiologyAppointment({ appointmentId: id });
      if (res?.data?.success) {
        toast.success("Appointment confirmed.");
        onSuccess?.();
      } else {
        toast.error(res?.data?.message || "Failed to confirm appointment.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setConfirming(null);
    }
  };

  // ── go to registration (pre-fill patient details) ─────────────────────────
  const handleGoToRegistration = (appt) => {
    const mobile = appt.mobileNo ?? appt.MobileNo ?? "";
    const name = appt.patientName ?? appt.PatientName ?? "";
    navigate("/patientregister", {
      state: {
        fromRadiology: true,
        Mobile: mobile,
        PatientName: name,
        appointmentId: appt.appointmentId ?? appt.AppointmentId,
      },
    });
    handleClose();
  };

  // ── shared pre-save validation (used by the plain Save button, the
  // Razorpay "pay & book" flow, and the "Book Without Payment" button) ──────
  // Takes an explicit modeOverride rather than always reading `bookingMode`
  // state — "Book Without Payment" calls setBookingMode("unpaid") and saves
  // in the same click, and that state update hasn't landed yet by the time
  // this runs (same render), so it passes "unpaid" straight through instead
  // of racing the setState.
  const validateBeforeSave = (modeOverride) => {
    const mode = modeOverride ?? bookingMode;
    if (slotInfo?.Date && moment(slotInfo.Date).startOf("day").isBefore(moment().startOf("day"))) {
      toast.error("Cannot book appointment for a past date."); return false;
    }
    if (!form.CentreId) { toast.warn("Please select a Centre."); return false; }
    if (!form.RateTypeId) { toast.warn("Please select a Rate Type."); return false; }
    if (!form.Title) { toast.warn("Please select a Title."); return false; }
    if (!form.MobileNo) { toast.warn("Mobile No is required."); return false; }
    if (!form.PatientName) { toast.warn("Patient Name (First Name) is required."); return false; }
    if (!form.Address) { toast.warn("Address is required."); return false; }
    if (!form.Locality) { toast.warn("Locality is required."); return false; }
    if (addedInvestigations.length === 0) {
      toast.warn("Please add at least one investigation."); return false;
    }
    if (allowMultiSlot && selectedSlots.length === 0) {
      toast.warn("Please select at least one time slot."); return false;
    }
    if (mode === "pay" && paidAmount > netAmount) {
      toast.warn("Total paid amount cannot exceed the Net Amount."); return false;
    }
    return true;
  };

  // Base booking fields, no payment info — used as-is for the Razorpay
  // "payload" field (the backend fills in isPaid/paymentGateway/etc. itself
  // after verifying the signature, see backend-radiology-razorpay-payment.md).
  const buildBaseBookingPayload = (slotsToBook, groupBookingId) => {
    return {
      appointmentId: 0,
      title: form.Title,
      mobileNo: form.MobileNo,
      patientName: form.PatientName,
      dob: form.DOB ? moment(form.DOB).format("DD/MMM/YYYY") : "",
      ageYear: form.AgeYear || 0,
      ageMonth: form.AgeMonth || 0,
      ageDays: form.AgeDays || 0,
      age: `${form.AgeYear || 0} Y ${form.AgeMonth || 0} M ${form.AgeDays || 0} D`,
      gender: form.Gender,
      // Email/Country/State/City/PinCode fields were removed from this
      // modal's form — kept as empty defaults here in case the backend
      // still expects these keys present in the payload.
      emailId: "",
      address: form.Address,
      locality: form.Locality || "",
      country: "",
      state: "",
      stateId: "0",
      city: "",
      pinCode: "",
      refDoctor: form.RefDoctor,
      refDoctorId: form.RefDoctorId || 0,
      panelId: form.RateTypeId || 0,
      panelName: form.RateTypeName || "",
      comment: form.Comment || "",
      patientType: form.PatientTypeId || "",
      bookingId: groupBookingId,
      appointmentDate: moment(slotInfo?.Date).format("DD/MMM/YYYY"),
      timeSlots: slotsToBook,
      departmentId: slotInfo?.DepartmentId || 0,
      departmentName: slotInfo?.DepartmentName || "",
      machineId: String(slotInfo?.MachineId) || "",
      machineName: slotInfo?.MachineName || "",
      centreId: form.CentreId || slotInfo?.CentreId || 0,
      investigations: addedInvestigations.map((i) => ({
        investigationId: i.InvestigationId || 0,
        investigationName: i.InvestigationName || "",
        rate: i.Rate || 0,
      })),
      totalAmount,
      discount: discountAmount,
      // Any photo/documents uploaded from this modal (CameraModal/UploadFile
      // above) were tagged with this GUID before the appointment/patient
      // even existed — sent here on the chance the backend uses it to link
      // them to the saved record. UNCONFIRMED — see
      // backend-docs/backend-radiology-slot-book-documents.md.
      documentGuid,
    };
  };

  // Registration only auto-completes once the booking is paid in FULL (across
  // however many payment-mode rows it took to get there) — see
  // backend-radiology-split-payment.md. Used for the manual Save path only —
  // the Razorpay path sends buildBaseBookingPayload() instead and lets the
  // backend fill in payment fields itself after verifying the signature.
  const buildBookingPayload = (slotsToBook, groupBookingId, modeOverride) => {
    const mode = modeOverride ?? bookingMode;
    const isPaid = mode === "pay" && dueAmount <= 0;
    return {
      ...buildBaseBookingPayload(slotsToBook, groupBookingId),
      isPaid,
      paidAmount: mode === "pay" ? paidAmount : 0,
      dueAmount: mode === "pay" ? Math.max(dueAmount, 0) : netAmount,
      payments: mode === "pay"
        ? payments
          .filter((p) => Number(p.Amount) > 0)
          .map((p) => ({
            PaymentMode: p.PaymentMode,
            PaymentModeID: p.PaymentModeID || 0,
            Amount: Number(p.Amount) || 0,
            BankName: p.BankName || "",
            CardNo: p.CardNo || "",
            CardDate: p.CardDate || "",
          }))
        : [],
    };
  };

  // A save response's `message` is: an array of new-appointment IDs (plain
  // numbers, unpaid path — unchanged from before), an array of
  // { appointmentId, isRegistered, registrationId, registrationNo,
  // registrationMessage } (paid path), a single int (edit path, not used
  // here since appointmentId is always 0 for a new booking) — OR, seen in
  // practice, a bare success-message STRING like
  // "Appointment(s) booked successfully." instead of any id info at all.
  // That last case used to get treated as if the whole string WAS an
  // appointmentId, which then got forwarded straight into
  // printAppointmentReceipt()'s request body and 400'd
  // ("AppointmentID must be a number or an array of numbers.") — only a
  // genuinely numeric item is accepted as an id now; anything else is
  // dropped rather than passed through as garbage.
  const parseSaveResponseMessage = (msg) => {
    const arr = Array.isArray(msg) ? msg : [msg];
    return arr
      .map((item) => {
        if (item && typeof item === "object") return item;
        const num = Number(item);
        return String(item ?? "").trim() !== "" && Number.isFinite(num)
          ? { appointmentId: num }
          : null;
      })
      .filter(Boolean);
  };

  const finishBooking = (results) => {
    const firstAppointmentId = results[0]?.appointmentId;
    toast.success(
      results.length > 0
        ? `Booked ${results.length} slot${results.length > 1 ? "s" : ""} successfully.`
        : "Booked successfully."
    );
    const unregistered = results.find((r) => r.isRegistered === false);
    if (unregistered) {
      toast.warn(
        `Payment captured, but registration couldn't be completed automatically${unregistered.registrationMessage ? `: ${unregistered.registrationMessage}` : "."} Use the Registration button to finish it manually.`
      );
    }
    onSuccess?.();
    handleClose();
    if (firstAppointmentId) {
      printAppointmentReceipt(firstAppointmentId, {
        date: slotInfo?.Date,
        centreId: slotInfo?.CentreId,
        departmentId: slotInfo?.DepartmentId,
        // Save response doesn't document a ledgertransactionIDHash yet (see
        // parseSaveResponseMessage shape above) — falls back to the
        // appointment-slip PDF below until the backend adds it here too.
        isRegistered: results[0]?.isRegistered,
        ledgerTransactionIDHash:
          results[0]?.ledgertransactionIDHash ?? results[0]?.ledgerTransactionIDHash,
      }).catch(() => {
        // appointment saved — receipt open failed silently
      });
    }
  };

  // Payment-mode rows using one of these route through Razorpay when Save is
  // clicked — same idea as PatientRegistration.jsx's IsOnlinePayment(): the
  // mode picked in the row decides how the amount actually gets collected,
  // there's no separate always-on "pay online" button.
  const ONLINE_MODES = ["online payment", "upi", "paytm"];

  // ── pay a row online via Razorpay, then finalize the whole booking ────────
  // Mirrors the existing pattern in Invoicing/AdvancePayment.jsx: check
  // whether online payment capture is enabled, fetch the Razorpay key/receipt,
  // open the shared <RazorPay> checkout for just that row's amount. Per the
  // backend contract, payment verification itself creates the appointment(s)
  // + registration — the full booking payload (including any other payment
  // rows already entered, e.g. part-cash) is sent as a JSON string in the
  // Razorpay `payload` field, so there's no separate save call after success.
  const payOnlineRowThenSave = async (onlineRow, slotsToBook, groupBookingId) => {
    try {
      const res = await axiosInstance.get("RazorPay/Otherpayment");
      // success:false means the check itself failed (e.g. Razorpay isn't
      // configured for this company) — surface the error and stop. Do NOT
      // fall back to saving the appointment; the booking only goes through
      // once the online payment actually succeeds.
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Failed to start online payment.");
        return;
      }
      if (res?.data?.message?.payment_capture != 1) {
        toast.error("Online payment is not enabled for this centre. Choose Cash/Card/Cheque instead.");
        return;
      }

      setRazorPayKeyInfo({
        receipt: res?.data?.message?.receipt,
        key_id: res?.data?.message?.key_id,
        key_secret: res?.data?.message?.key_secret,
      });
      const otherPayments = payments
        .filter((p) => p !== onlineRow && Number(p.Amount) > 0)
        .map((p) => ({
          PaymentMode: p.PaymentMode,
          PaymentModeID: p.PaymentModeID || 0,
          Amount: Number(p.Amount) || 0,
          BankName: p.BankName || "",
          CardNo: p.CardNo || "",
          CardDate: p.CardDate || "",
        }));
      setRazorpayBasePayload({
        ...buildBaseBookingPayload(slotsToBook, groupBookingId),
        payments: otherPayments,
      });
      setRazorpayAmount(Number(onlineRow.Amount) || 0);
      setPayingViaRazorpay(true);
      setIsRazorPayOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start online payment.");
    }
  };

  const handleRazorpaySuccess = (result) => {
    setIsRazorPayOpen(false);
    setPayingViaRazorpay(false);
    if (!result?.data?.success) {
      toast.error(result?.data?.message || "Payment verification failed.");
      return;
    }
    finishBooking(parseSaveResponseMessage(result.data.message));
  };

  // ── save (Cash/Card/Cheque rows, or unpaid) ────────────────────────────────
  const saveDirectly = async (slotsToBook, groupBookingId, modeOverride) => {
    setSaving(true);
    try {
      const payload = buildBookingPayload(slotsToBook, groupBookingId, modeOverride);
      const res = await saveMacRadiologyAppointment(payload);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Failed to book slot(s).");
        return;
      }
      finishBooking(parseSaveResponseMessage(res.data.message));
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Same "which slots, which booking id" logic the Save button and "Book
  // Without Payment" both need before calling the save API.
  const getSlotsAndGroupId = () => {
    const slotsToBook = selectedSlots.length > 0 ? selectedSlots : [slotInfo?.TimeSlot];
    // tag every slot in a multi-slot booking with the same id so the grid can
    // recognise them as one contiguous block and render them as a single box
    const groupBookingId = slotsToBook.length > 1
      ? (form.BookingId?.trim() || `BK${Date.now()}`)
      : (form.BookingId || "");
    return { slotsToBook, groupBookingId };
  };

  // ── save (single entry point for the Save Data button) ────────────────────
  // Picks the route based on what's in the payment table: a row set to an
  // online mode (Online Payment/UPI/Paytm) goes through Razorpay for that
  // row's amount; everything else (unpaid, or Cash/Card/Cheque only) saves
  // directly — mirrors PatientRegistration.jsx's IsOnlinePayment() check.
  // Used for both the "Pay Now" flow's Save Data click and the "Pay & Book"
  // Razorpay row — unchanged.
  const handleSave = async () => {
    if (!validateBeforeSave()) return;
    const { slotsToBook, groupBookingId } = getSlotsAndGroupId();

    const onlineRow = bookingMode === "pay"
      ? payments.find((p) => ONLINE_MODES.includes((p.PaymentMode || "").toLowerCase()) && Number(p.Amount) > 0)
      : null;

    if (onlineRow) {
      await payOnlineRowThenSave(onlineRow, slotsToBook, groupBookingId);
    } else {
      await saveDirectly(slotsToBook, groupBookingId);
    }
  };

  // ── "Book Without Payment" — a direct action, not just a mode toggle:
  // clicking it books the slot right away via the same
  // saveMacRadiologyAppointment call Save Data uses, with no payment info,
  // instead of just switching tabs and making the user hit Save Data too. ──
  const handleBookWithoutPayment = async () => {
    setBookingMode("unpaid");
    if (!validateBeforeSave("unpaid")) return;
    const { slotsToBook, groupBookingId } = getSlotsAndGroupId();
    await saveDirectly(slotsToBook, groupBookingId, "unpaid");
  };

  // ── close / reset ─────────────────────────────────────────────────────────
  const handleClose = () => {
    setForm(EMPTY_FORM);
    setAddedInvestigations([]);
    setPatientSugg([]); setDoctorSugg([]); setInvSugg([]);
    setShowPatient(false); setShowDoctor(false); setShowInvSugg(false);
    setInvSearchText(""); setInvHighlightIdx(-1);
    setPickedSlots([]);
    setDiscountAmt(""); setDiscountPercentage("");
    setPayments([emptyPaymentRow()]);
    setBookingMode("unpaid");
    setIsRazorPayOpen(false); setPayingViaRazorpay(false);
    setRazorPayKeyInfo({ receipt: "", key_id: "", key_secret: "" });
    setRazorpayBasePayload(null);
    setRazorpayAmount(0);
    setPatientImg({ img: PlaceholderImage, show: false });
    setShowUploadFile(false);
    setDocumentGuid("");
    onClose?.();
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      header={slotInfo ? `Book Slot — ${slotInfo.DepartmentName} || ${slotInfo.MachineName}` : "Book Slot"}
      visible={visible}
      onHide={handleClose}
      className={theme}
      draggable={false}
      style={{ width: "60vw", maxWidth: "96vw" }}
    >
      <div className="row g-2 mx-0">

        {/* ── Slot info banner ─────────────────────────────────────────── */}
        <div className="col-12">
          <div
            className="p-2 rounded"
            style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #86efac", fontSize: "13px" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
              <InfoChip
                label="Slot"
                value={
                  selectedSlots.length > 1
                    ? `${selectedSlots[0]} → ${selectedSlots[selectedSlots.length - 1]}`
                    : slotInfo?.TimeSlot
                }
              />
              <InfoChip label="Date" value={slotInfo?.Date ? moment(slotInfo.Date).format("DD-MMM-YYYY") : ""} />
              <InfoChip label="Machine" value={slotInfo?.MachineName} />
            </div>

            {allowMultiSlot && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px dashed #86efac",
                }}
              >
                <strong style={{ whiteSpace: "nowrap", color: "#15803d" }}>Number of Slots:</strong>
                <div style={{ minWidth: 100, flex: "0 0 auto" }}>
                  <ReactSelect
                    id="BookSlotCount"
                    name="SlotCount"
                    placeholderName="Slots"
                    dynamicOptions={slotCountOptions}
                    value={selectedSlots.length || 1}
                    removeIsClearable
                    onChange={(_, opt) => {
                      const n = Number(opt?.value) || 1;
                      setPickedSlots(upcomingSlots.slice(0, n));
                    }}
                  />
                </div>
                {selectedSlots.length > 0 && (
                  <span style={{ color: "#0f766e", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {selectedSlots.length > 1
                      ? `${selectedSlots.length} slots: ${selectedSlots[0]} → ${selectedSlots[selectedSlots.length - 1]}`
                      : `${selectedSlots.length} slot selected`}
                  </span>
                )}
              </div>
            )}
            {!allowMultiSlot && slotInfo?.allowMultiSlot !== false && (
              <div style={{ color: "#92400e", fontSize: "12px", marginTop: "8px" }}>
                Next slot is booked/blocked — only this slot is available.
              </div>
            )}
          </div>
        </div>

        {/* ── Patient details panel ─────────────────────────────────────── */}
        <div className="col-12">
          <div className="p-2 rounded" style={{ background: "#fff", border: "1px solid #e2e8f0", position: "relative" }}>
            <strong style={{ fontSize: "13px", color: "#1e293b", display: "block", marginBottom: "8px" }}>
              Patient Details
            </strong>

            {/* ── Patient photo + Upload Document — floats in its own
                corner independent of the field grid below (same idea as
                PatientRegistration.jsx's photoAndDocsField sitting off to
                the side of its own field grid), so it can't collide with
                or shove around any input. Keyed off documentGuid (a
                client-side GUID, see its declaration above). Double-click
                the photo box to open the camera. ─────────────────────── */}
            <div style={{ position: "absolute", top: "35px", right: "8px", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
              <div
                title="Double-click to capture patient photo"
                style={{ border: "1px solid #cbd5e1", borderRadius: 6, width: 52, height: 52, overflow: "hidden", cursor: "pointer" }}
                onDoubleClick={() => setPatientImg((p) => ({ ...p, show: true }))}
              >
                <img src={patientImg.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Patient" />
              </div>
              <button
                type="button"
                title="Upload Document"
                className="btn btn-sm btn-primary mt-1 p-1"
                style={{ width: 32, height: 26 }}
                onClick={() => setShowUploadFile(true)}
              >
                <i className="fa fa-file" aria-hidden="true"></i>
              </button>
            </div>

            <div className="row g-2" style={{ paddingRight: "70px" }}>

              {/* ── Row 1: Centre | Rate Type | Gender | Mobile ──────────── */}
              <div className="col-md-3">
                <ReactSelect id="BookCentre" name="CentreId" placeholderName="Centre *"
                  dynamicOptions={centres} value={form.CentreId} removeIsClearable
                  isDisabled={!!slotInfo?.CentreId} onChange={handleSelect} />
              </div>
              <div className="col-md-3">
                <ReactSelect id="BookRateType" name="RateTypeId" placeholderName="Rate Type *"
                  dynamicOptions={rateTypes} value={form.RateTypeId} removeIsClearable
                  isDisabled={rateTypes.length === 1} onChange={handleSelect} />
              </div>
              <div className="col-md-3">
                <Input type="number" name="MobileNo" id="BookMobileNo" lable="Mobile No *"
                  value={form.MobileNo} maxLength={10} onChange={handleInput} />
              </div>
              
              

              {/* ── Row 2: Title + Patient Name (joined, like Registration) ─ */}
              <div className="col-md-3">
                <div className="d-flex">
                  <div style={{ flex: "0 0 50px" }}>
                    <ReactSelect id="BookTitle" name="Title" placeholderName="Title *"
                      dynamicOptions={titles} value={form.Title} removeIsClearable onChange={handleSelect} />
                  </div>
                  <div style={{ flex: "1 1 auto", position: "relative" }} ref={patientContainerRef}>
                    <Input type="text" name="PatientName" id="BookPatientName" lable="Patient Name *"
                      value={form.PatientName} onChange={handlePatientInput} autoComplete="off" />
                    <SuggestBox visible={showPatient} items={patientSugg}
                      getLabel={(p) => `${p.PatientName} | ${p.MobileNo} | ${p.Age}Y ${p.Gender}`}
                      onSelect={handleSelectPatient} anchorRef={patientContainerRef} />
                  </div>
                </div>
              </div>
              

              {/* ── Row 3: DOB | AgeYear | AgeMonth | AgeDays ─────────────── */}
              <div className="col-md-3">
                <DatePicker name="DOB" id="BookDOB" lable="DOB"
                  value={form.DOB} maxDate={new Date()}
                  onChange={handleDOBChange}
                  className="custom-calendar"
                   />
              </div>
              <div className="col-md-1">
                <Input type="number" name="AgeYear" id="BookAgeYear" lable="Yrs"
                  value={form.AgeYear} onChange={handleAgeChange} min={0} max={150} />
              </div>
              <div className="col-md-1">
                <Input type="number" name="AgeMonth" id="BookAgeMonth" lable="Mos"
                  value={form.AgeMonth} onChange={handleAgeChange} min={0} max={11} />
              </div>
              <div className="col-md-1">
                <Input type="number" name="AgeDays" id="BookAgeDays" lable="Days"
                  value={form.AgeDays} onChange={handleAgeChange} min={0} max={30} />
              </div>
              <div className="col-md-3">
                <ReactSelect id="BookGender" name="Gender" placeholderName="Gender"
                  dynamicOptions={genders} value={form.Gender} removeIsClearable onChange={handleSelect} />
              </div>

              {/* ── Row 4: Address | Ref Doctor (typeahead) ───────────────── */}
             
              <div className="col-md-3 position-relative" ref={doctorContainerRef}>
                <Input type="text" name="RefDoctor" id="BookRefDoctor" lable="Ref Doctor"
                  value={form.RefDoctor} onChange={handleDoctorInput} autoComplete="off" />
                <SuggestBox visible={showDoctor} items={doctorSugg}
                  getLabel={(d) => d.label}
                  onSelect={handleSelectDoctor} anchorRef={doctorContainerRef} />
              </div>
               <div className="col-md-3">
                <Input type="text" name="Address" id="BookAddress" lable="Address *"
                  value={form.Address} onChange={handleInput} />
              </div>
              <div className="col-md-3">
                <Input type="text" name="Locality" id="BookLocality" lable="Locality *"
                  value={form.Locality} onChange={handleInput} />
              </div>
              <div className="col-md-3">
                <Input type="text" name="BookingId" id="BookingId" lable="Booking ID"
                  value={form.BookingId} onChange={handleInput} />
              </div>

              {/* ── Row 5: Comment | Patient Type | Booking ID ────────────── */}
              <div className="col-md-3">
                <Input type="text" name="Comment" id="BookComment" lable="Remark"
                  value={form.Comment} onChange={handleInput} />
              </div>
              <div className="col-md-3">
                <ReactSelect id="BookPatientType" name="PatientTypeId" placeholderName="Patient Type"
                  dynamicOptions={PATIENT_TYPES} value={form.PatientTypeId} removeIsClearable onChange={handleSelect} />
              </div>
              
            </div>
          </div>
        </div>

        {/* ── Investigation section ────────────────────────────────────── */}
        <div className="col-12">
          <div className="p-2 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="row g-2 align-items-end">
              <div className="col-md-9 position-relative" ref={invContainerRef}>
                <Input
                  type="text"
                  name="TestName"
                  id="BookInvestigation"
                  lable={form.RateTypeId ? "Type Test Name to Search  (↑↓ navigate · Enter to add)" : "Select Rate Type first"}
                  value={invSearchText}
                  onChange={handleInvInput}
                  onKeyDown={handleInvKeyDown}
                  autoComplete="off"
                  disabled={!form.RateTypeId}
                />
                <SuggestBox
                  visible={showInvSugg}
                  items={invSugg}
                  getLabel={(inv) => inv.TestName}
                  onSelect={handleSelectInvAndAdd}
                  anchorRef={invContainerRef}
                  highlightIndex={invHighlightIdx}
                />
              </div>
              <div className="col-md-3 text-end" style={{ fontSize: "12px" }}>
                <div className="text-muted">Total Amount</div>
                <strong style={{ color: "#0f766e", fontSize: "14px" }}>₹{totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            {addedInvestigations.length > 0 && (
              <div className="mt-2">
                <Tables>
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th>Department</th>
                      <th>Investigation</th>
                      <th style={{ width: "90px" }}>Duration</th>
                      <th style={{ width: "100px" }}>Rate (₹)</th>
                      <th style={{ width: "60px", textAlign: "center" }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addedInvestigations.map((inv, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{inv.DepartmentName || "—"}</td>
                        <td>{inv.InvestigationName}</td>
                        <td>{inv.DurationMinutes ? `${inv.DurationMinutes} min` : "—"}</td>
                        <td>{Number(inv.Rate).toFixed(2)}</td>
                        <td className="text-center">
                          <button className="btn btn-xs btn-outline-danger"
                            style={{ padding: "1px 6px", fontSize: "11px" }}
                            onClick={() => handleRemoveInvestigation(idx)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            )}
          </div>
        </div>

        {/* ── Billing: discount + payment capture ─────────────────────────── */}
        {addedInvestigations.length > 0 && (
          <div className="col-12">
            <div className="p-2 rounded" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <strong style={{ fontSize: "13px", color: "#1e293b", display: "block", marginBottom: "8px" }}>
                Billing
              </strong>

              {/* ── Book without payment (direct action) vs Pay Now (reveals
                  the payment fields below; Save Data at the bottom of the
                  modal finishes that flow) ──────────────────────────────── */}
              <div className="d-flex gap-2 mb-2">
                <CustomButton
                  text={saving && bookingMode === "unpaid" ? "Booking..." : "Book Without Payment"}
                  icon="check"
                  variant="success"
                  onClick={handleBookWithoutPayment}
                  disabled={saving || payingViaRazorpay}
                  loading={saving && bookingMode === "unpaid"}
                />
                <CustomButton
                  text="Pay Now"
                  icon="forword"
                  variant="secondary"
                  onClick={() => setBookingMode("pay")}
                  disabled={saving || payingViaRazorpay}
                  // "outline" variant rendered with unreadable low-contrast
                  // text in this app's theme — force explicit, guaranteed-
                  // visible colors for both states instead of trusting it.
                  style={
                    bookingMode === "pay"
                      ? { background: "#0f766e", color: "#fff", borderColor: "#0f766e" }
                      : { background: "#f1f5f9", color: "#334155", borderColor: "#cbd5e1" }
                  }
                />
              </div>

              {bookingMode === "unpaid" ? (
                <div style={{ fontSize: "12px", color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 10px" }}>
                  Booking without payment — a <strong>Registration</strong> option will appear on this
                  slot afterwards so the visit/payment can be completed later.
                </div>
              ) : (
              <>
              <div className="row g-2">
                <div className="col-md-3">
                  <Input type="text" name="GrossAmount" id="BookGrossAmount" lable="Gross Amount"
                    value={grossAmount.toFixed(2)} disabled readOnly />
                </div>
                <div className="col-md-3">
                  <Input type="number" name="DiscountAmt" id="BookDiscountAmt" lable="Discount Amount"
                    value={discountAmt} onChange={handleDiscountAmtChange} disabled={discountPercentage !== ""} />
                </div>
                <div className="col-md-3">
                  <Input type="number" name="DiscountPercentage" id="BookDiscountPercentage" lable="Discount %"
                    value={discountPercentage} onChange={handleDiscountPercentChange} disabled={discountAmt !== ""} />
                </div>
                <div className="col-md-3">
                  <Input type="text" name="NetAmount" id="BookNetAmount" lable="Net Amount"
                    value={netAmount.toFixed(2)} disabled readOnly />
                </div>
              </div>

              <div style={{ fontSize: "11px", color: "#64748b", margin: "10px 0 6px" }}>
                Pick a mode per row below — choosing <strong>Online Payment / UPI / Paytm</strong> for a
                row will open Razorpay for that row's amount when you click Save Data.
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                  <thead>
                    <tr style={{ fontSize: "11px", color: "#64748b", textAlign: "left" }}>
                      <th style={{ minWidth: "150px", fontWeight: 600, padding: "0 6px" }}>Mode</th>
                      <th style={{ width: "110px", fontWeight: 600, padding: "0 6px" }}>Paid Amount</th>
                      <th style={{ minWidth: "150px", fontWeight: 600, padding: "0 6px" }}>Bank Name</th>
                      <th style={{ minWidth: "130px", fontWeight: 600, padding: "0 6px" }}>Cheque/Card No.</th>
                      <th style={{ minWidth: "130px", fontWeight: 600, padding: "0 6px" }}>Cheque Date/Trans No</th>
                      <th style={{ width: "32px" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, idx) => {
                      const needsBank = !NON_BANK_MODES.includes((p.PaymentMode || "").toLowerCase());
                      // box-shadow/border-radius on <tr> renders inconsistently across
                      // browsers with table layout, so each cell carries its own
                      // top/bottom border, with the outer edges closing off the row
                      // into what reads as one bordered, rounded card.
                      const cellBorder = { borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", background: "#fff", verticalAlign: "top" };
                      const firstCell = { ...cellBorder, borderLeft: "1px solid #e2e8f0", borderRadius: "6px 0 0 6px" };
                      const lastCell = { ...cellBorder, borderRight: "1px solid #e2e8f0", borderRadius: "0 6px 6px 0" };
                      return (
                        <tr key={idx}>
                          <td style={{ ...firstCell, padding: "6px" }}>
                            <ReactSelect id={`PayMode_${idx}`} name="PaymentMode" placeholderName="Mode"
                              dynamicOptions={paymentModes.length ? paymentModes : [{ value: "", label: "Cash" }]}
                              value={p.PaymentModeID}
                              removeIsClearable
                              onChange={(_, opt) => handlePaymentModeChange(idx, opt)} />
                          </td>
                          <td style={{ ...cellBorder, padding: "6px" }}>
                            <Input type="number" name="Amount" id={`PayAmt_${idx}`}
                              value={p.Amount} onChange={(e) => handlePaymentRowField(idx, "Amount", e.target.value)} />
                          </td>
                          <td style={{ ...cellBorder, padding: "6px" }}>
                            <ReactSelect id={`PayBank_${idx}`} name="BankName" placeholderName="Bank"
                              dynamicOptions={bankNames} value={p.BankName} removeIsClearable isDisabled={!needsBank}
                              onChange={(_, opt) => handlePaymentRowField(idx, "BankName", opt?.value || "")} />
                          </td>
                          <td style={{ ...cellBorder, padding: "6px" }}>
                            <Input type="text" name="CardNo" id={`PayCardNo_${idx}`} disabled={!needsBank}
                              value={p.CardNo} onChange={(e) => handlePaymentRowField(idx, "CardNo", e.target.value)} />
                          </td>
                          <td style={{ ...cellBorder, padding: "6px" }}>
                            <Input type="text" name="CardDate" id={`PayCardDate_${idx}`} disabled={!needsBank}
                              value={p.CardDate} onChange={(e) => handlePaymentRowField(idx, "CardDate", e.target.value)} />
                          </td>
                          <td style={{ ...lastCell, textAlign: "center", paddingTop: "16px" }}>
                            {payments.length > 1 && (
                              <span
                                onClick={() => handleRemovePaymentRow(idx)}
                                title="Remove"
                                style={{ cursor: "pointer", color: "#cbd5e1", fontSize: "16px", lineHeight: 1 }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#cbd5e1"; }}
                              >
                                ✕
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="d-flex align-items-center justify-content-between mt-1">
                <span
                  onClick={handleAddPaymentRow}
                  style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}
                >
                  + Add another payment mode
                </span>
                <div className="d-flex gap-3" style={{ fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>
                    Discount: <strong style={{ color: "#334155" }}>₹{discountAmount.toFixed(2)}</strong>
                  </span>
                  <span
                    style={{
                      padding: "3px 10px", borderRadius: "999px", fontWeight: 700,
                      background: dueAmount > 0 ? "#fee2e2" : "#dcfce7",
                      color: dueAmount > 0 ? "#dc2626" : "#15803d",
                    }}
                  >
                    {dueAmount > 0 ? `Due ₹${dueAmount.toFixed(2)}` : `Paid in full`}
                  </span>
                </div>
              </div>
              </>
              )}
            </div>
          </div>
        )}

        {patientImg.show && (
          <CameraModal
            visible={patientImg.show}
            guid={documentGuid}
            pageName={"patientImage"}
            defaultImage={patientImg.img}
            handleClose={(guidNo, newUrl) => {
              setPatientImg({ show: false, img: newUrl || PlaceholderImage });
            }}
          />
        )}

        {showUploadFile && (
          <UploadFile
            options={requiredAttachment}
            show={showUploadFile}
            handleClose={() => setShowUploadFile(false)}
            documentId={documentGuid}
            pageName="Radiology Booking"
            LedgerTransactionIDHash={documentGuid}
          />
        )}

        {isRazorPayOpen && (
          <RazorPay
            AnotherPageCommonFunction={handleRazorpaySuccess}
            IsOpen={isRazorPayOpen}
            payload={{
              amount: razorpayAmount,
              currency: "INR",
              tnx_type: "RadiologyAppointment",
              receipt: razorPayKeyInfo?.receipt,
              key_id: razorPayKeyInfo?.key_id,
              key_secret: razorPayKeyInfo?.key_secret,
              RateTypeID: form.RateTypeId,
              // full booking payload as a JSON string — paymentVerification
              // creates the appointment(s) + registration from this after
              // verifying the signature (backend-radiology-razorpay-payment.md)
              payload: JSON.stringify(razorpayBasePayload),
            }}
            setIsRazorPayOpen={(v) => { setIsRazorPayOpen(v); if (!v) setPayingViaRazorpay(false); }}
          />
        )}

        {/* ── Existing appointments — only shown when slot had bookings ── */}
        {existingAppointments.length > 0 && (
          <div className="col-12">
            <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "8px" }}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <strong style={{ fontSize: "13px", color: "#1e293b" }}>
                  Booked Appointments — {slotInfo?.TimeSlot}
                </strong>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  {existingAppointments.length} record(s)
                </span>
              </div>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                <table className="table table-sm mb-0" style={{ fontSize: "12px", minWidth: "700px" }}>
                  <thead style={{ background: "linear-gradient(180deg,#1e3a5f,#2d5a8e)", color: "#fff", position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: "5px 8px", width: "36px" }}>#</th>
                      <th style={{ padding: "5px 8px", width: "60px" }}>Appt#</th>
                      <th style={{ padding: "5px 8px" }}>Patient Name</th>
                      <th style={{ padding: "5px 8px", width: "100px" }}>Mobile</th>
                      <th style={{ padding: "5px 8px" }}>Test</th>
                      <th style={{ padding: "5px 8px", width: "70px" }}>Amt (₹)</th>
                      <th style={{ padding: "5px 8px", width: "80px" }}>Comment</th>
                      <th style={{ padding: "5px 8px", width: "70px" }}>Status</th>
                      <th style={{ padding: "5px 8px", width: "80px" }}>Reg. By</th>
                      <th style={{ padding: "5px 8px", width: "90px", textAlign: "center" }}>Print</th>
                      <th style={{ padding: "5px 8px", width: "80px", textAlign: "center" }}>Confirm</th>
                      <th style={{ padding: "5px 8px", width: "90px", textAlign: "center" }}>Registration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingAppointments.map((a, idx) => {
                      const id = a.appointmentId ?? a.AppointmentId;
                      const name = a.patientName ?? a.PatientName ?? "—";
                      const mob = a.mobileNo ?? a.MobileNo ?? "—";
                      const test = a.testName ?? a.TestName ?? a.investigations ?? "—";
                      const amt = a.totalAmount ?? a.TotalAmount ?? 0;
                      const cmt = a.comment ?? a.Comment ?? "";
                      const sta = a.status ?? a.Status ?? "";
                      const by = a.registrationBy ?? a.RegistrationBy ?? a.createdBy ?? "";
                      // Paid bookings are expected to be auto-registered by the
                      // backend — hide the manual Registration button for them.
                      // Defaults to shown when the backend hasn't sent either
                      // flag yet, matching today's behaviour.
                      const alreadyRegistered = !!(a.isRegistered ?? a.IsRegistered ?? a.isPaid ?? a.IsPaid);
                      return (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                          <td style={{ padding: "4px 8px", color: "#64748b" }}>{idx + 1}</td>
                          <td style={{ padding: "4px 8px", color: "#3b82f6", fontWeight: 600 }}>{id}</td>
                          <td style={{ padding: "4px 8px", fontWeight: 500 }}>{name}</td>
                          <td style={{ padding: "4px 8px" }}>{mob}</td>
                          <td style={{ padding: "4px 8px", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={typeof test === "string" ? test : ""}>
                            {typeof test === "string" ? test
                              : Array.isArray(test) ? test.map((t) => t.investigationName ?? t.TestName).join(", ")
                                : "—"}
                          </td>
                          <td style={{ padding: "4px 8px" }}>{Number(amt).toFixed(2)}</td>
                          <td style={{ padding: "4px 8px", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cmt}</td>
                          <td style={{ padding: "4px 8px" }}>
                            {sta && (
                              <span style={{
                                padding: "1px 6px", borderRadius: "10px", fontSize: "10px", fontWeight: 600,
                                background: sta === "Confirmed" ? "#dcfce7" : sta === "Cancelled" ? "#fee2e2" : "#fef9c3",
                                color: sta === "Confirmed" ? "#15803d" : sta === "Cancelled" ? "#dc2626" : "#92400e",
                              }}>{sta}</span>
                            )}
                          </td>
                          <td style={{ padding: "4px 8px", color: "#475569" }}>{by}</td>
                          <td style={{ padding: "4px 8px", textAlign: "center" }}>
                            {id && (
                              <button
                                onClick={() =>
                                  printAppointmentReceipt(id, {
                                    date: slotInfo?.Date,
                                    centreId: slotInfo?.CentreId,
                                    departmentId: slotInfo?.DepartmentId,
                                  }).catch(() => toast.error("Failed to print receipt."))
                                }
                                style={{ padding: "1px 7px", fontSize: "11px", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "4px", cursor: "pointer" }}
                              >
                                Print
                              </button>
                            )}
                          </td>
                          {/* ── Confirm ── */}
                          <td style={{ padding: "4px 8px", textAlign: "center" }}>
                            {id && sta?.toLowerCase() !== "confirmed" && !sta?.toLowerCase().includes("confirm") ? (
                              <button
                                onClick={() => handleConfirm(a)}
                                disabled={confirming === id}
                                style={{
                                  padding: "1px 7px", fontSize: "11px",
                                  background: confirming === id ? "#e5e7eb" : "#dcfce7",
                                  color: confirming === id ? "#9ca3af" : "#15803d",
                                  border: "1px solid #86efac", borderRadius: "4px",
                                  cursor: confirming === id ? "wait" : "pointer", fontWeight: 600,
                                }}
                              >
                                {confirming === id ? "..." : "Confirm"}
                              </button>
                            ) : (
                              <span style={{ fontSize: "10px", color: "#15803d", fontWeight: 600 }}>✓ Done</span>
                            )}
                          </td>
                          {/* ── Registration ── */}
                          <td style={{ padding: "4px 8px", textAlign: "center" }}>
                            {alreadyRegistered ? (
                              <span style={{ fontSize: "10px", color: "#15803d", fontWeight: 600 }}>✓ Registered</span>
                            ) : (
                              <button
                                onClick={() => handleGoToRegistration(a)}
                                style={{
                                  padding: "1px 7px", fontSize: "11px",
                                  background: "#fef9c3", color: "#854d0e",
                                  border: "1px solid #fde047", borderRadius: "4px",
                                  cursor: "pointer", fontWeight: 600,
                                }}
                              >
                                Registration
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────── */}
        {/* "Book Without Payment" above already saves directly on click —
            Save Data here is only needed to finish the "Pay Now" flow
            (enter payment rows, then save/collect payment), so it's hidden
            in the unpaid tab instead of sitting there as a redundant,
            confusing second save action. */}
        {bookingMode === "pay" && (
          <div className="col-12 d-flex justify-content-end gap-2 mt-2 pb-1">
            {/* <button className="btn btn-sm btn-outline-secondary" onClick={handleClose} disabled={saving}>
              Close
            </button> */}
            <SaveButton
              onClick={() => handleSave()}
              disabled={saving || payingViaRazorpay}
              loading={saving || payingViaRazorpay}
              text={
                payingViaRazorpay ? "Opening Razorpay…"
                  : saving ? "Saving..."
                  : payments.some((p) => ONLINE_MODES.includes((p.PaymentMode || "").toLowerCase()) && Number(p.Amount) > 0)
                    ? "Pay & Book"
                    : "Save Data"
              }
            />
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default BookSlotModal;
