import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { CalendarClock, CreditCard, Phone, Ticket, UserRound, UserSearch } from "lucide-react";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import NextGenButton from "../../components/nextgen/NextGenButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import MobileDataModal from "../utils/MobileDataModal";
import { apiError, formatApiDate } from "./dopdUtils";
import DopdItemSearch, { itemLabel } from "./DopdItemSearch";
import "./DoctorOPDConsultation.css";

const emptyPatient = {
  Title: "Mr.",
  FirstName: "",
  MiddleName: "",
  LastName: "",
  Mobile: "",
  Gender: "Male",
  AgeYear: "",
  AgeMonth: "0",
  AgeDays: "0",
  PatientCode: "",
  PatientID: 0,
  Email: "",
};

const DoctorOPDConsultationBooking = () => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const [loading, setLoading] = useState(false);
  const [centres, setCentres] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [mobileRows, setMobileRows] = useState([]);
  const [slotMeta, setSlotMeta] = useState({ RoomNo: "", InvestigationID: 0, InvestigationName: "", NextToken: 1 });
  const [rateInfo, setRateInfo] = useState({ RateTypeId: 0, RateTypeName: "" });
  const [patient, setPatient] = useState(emptyPatient);
  const [booking, setBooking] = useState({
    CentreID: userData?.CentreID || "",
    EmployeeID: "",
    AppDate: new Date(),
    AppTime: "",
    TokenNo: 0,
    Rate: 0,
    Discount: 0,
    PaidAmount: 0,
    PaymentMode: "Cash",
    PaymentModeID: 134,
    VisitType: "New",
    InvestigationID: 0,
  });

  useEffect(() => {
    axiosInstance.get("Centre/getAccessCentres").then((res) => {
      setCentres([
        { label: t("Select Centre"), value: "" },
        ...(res?.data?.message || []).map((ele) => ({ value: ele.CentreID, label: ele.Centre })),
      ]);
    });
    getPaymentModes("PaymentMode", setPaymentModes);
    axiosInstance.get("DoctorOPDConsultation/GetConfig").then((res) => {
      if (res?.data?.success) {
        setRateInfo({
          RateTypeId: res.data.message?.OPDConsultationRateTypeID || 0,
          RateTypeName: res.data.message?.OPDConsultationRateName || "",
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!booking.CentreID) return;
    axiosInstance
      .post("DoctorOPDConsultation/SearchDoctors", { CentreID: Number(booking.CentreID) })
      .then((res) => {
        setDoctors([
          { label: t("Select Doctor"), value: "" },
          ...(res?.data?.message || []).map((ele) => ({ value: ele.EmployeeID, label: ele.Name })),
        ]);
      });
  }, [booking.CentreID]);

  const loadRate = (investigationId) => {
    if (!investigationId) return;
    axiosInstance
      .post("DoctorOPDConsultation/GetConsultationRate", {
        InvestigationID: Number(investigationId),
        RateTypeId: Number(rateInfo.RateTypeId || 0),
      })
      .then((res) => {
        if (!res?.data?.success) return;
        const msg = res.data.message;
        const rate = Number(msg?.Rate || 0);
        setRateInfo((prev) => ({
          RateTypeId: msg?.RateTypeId || prev.RateTypeId,
          RateTypeName: msg?.RateTypeName || prev.RateTypeName,
        }));
        setBooking((prev) => ({
          ...prev,
          Rate: rate,
          PaidAmount: rate,
          InvestigationID: investigationId,
        }));
      });
  };

  const loadSlots = () => {
    if (!booking.EmployeeID || !booking.CentreID) return;
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/GetSlots", {
        EmployeeID: Number(booking.EmployeeID),
        CentreID: Number(booking.CentreID),
        AppDate: formatApiDate(booking.AppDate),
      })
      .then((res) => {
        if (!res?.data?.success) {
          setSlots([]);
          toast.error(res?.data?.message || "No slots");
          return;
        }
        const msg = res.data.message;
        setSlotMeta({
          RoomNo: msg.RoomNo,
          InvestigationID: msg.InvestigationID,
          InvestigationName: msg.InvestigationName || "",
          NextToken: msg.NextToken,
        });
        setSlots(msg.Slots || []);
        const firstFree = (msg.Slots || []).find((s) => s.IsBooked != 1);
        if (firstFree) {
          setBooking((prev) => ({
            ...prev,
            AppTime: firstFree.AppTime,
            TokenNo: firstFree.TokenNo,
            InvestigationID: msg.InvestigationID || prev.InvestigationID,
          }));
        }
        if (msg.InvestigationID) loadRate(msg.InvestigationID);
      })
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSlots();
  }, [booking.EmployeeID, booking.CentreID, booking.AppDate]);

  const searchPatientByMobile = (type = "Mobile") => {
    const mobile = patient.Mobile?.trim();
    const uhid = patient.PatientCode?.trim();
    if (type === "Mobile") {
      if (!mobile || mobile.length < 10) {
        toast.error("Mobile Number min Length Must Be 10");
        return;
      }
    } else if (!uhid || uhid.length < 3) {
      toast.error("Enter UHID");
      return;
    }
    setLoading(true);
    axiosInstance
      .post("Booking/getDataByMobileNo", {
        Mobile: type === "Mobile" ? mobile : "",
        PatientCode: type === "UHID" ? uhid : "",
      })
      .then((res) => {
        const users = res?.data?.message?.user || [];
        if (!res?.data?.success || users.length === 0) {
          setMobileRows([]);
          toast.error(res?.data?.message || "No Patient Record Found");
          return;
        }
        setMobileRows(users);
        setShowPatientModal(true);
      })
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const searchPatientByName = () => {
    const name = `${patient.FirstName || ""} ${patient.LastName || ""}`.trim();
    if (name.length < 3) {
      toast.error("Enter at least 3 characters of the patient name.");
      return;
    }
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/SearchPatients", { PatientName: name })
      .then((res) => {
        const users = res?.data?.message || [];
        if (!res?.data?.success || users.length === 0) {
          setMobileRows([]);
          toast.error(res?.data?.message || "No Patient Record Found");
          return;
        }
        setMobileRows(users);
        setShowPatientModal(true);
      })
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const handleSelectPatient = (data) => {
    setPatient({
      Title: data?.Title || "Mr.",
      FirstName: (data?.FirstName || "").trim(),
      MiddleName: data?.MiddleName || "",
      LastName: data?.LastName || "",
      Mobile: data?.Mobile || patient.Mobile,
      Gender: data?.Gender || "Male",
      AgeYear: String(data?.AgeYear || ""),
      AgeMonth: String(data?.AgeMonth || "0"),
      AgeDays: String(data?.AgeDays || "0"),
      PatientCode: data?.PatientCode || "",
      PatientID: data?.PatientID || data?.Patient_ID || 0,
      Email: data?.Email || "",
    });
    setShowPatientModal(false);
  };

  const save = () => {
    if (loading) return;
    if (!booking.CentreID || !booking.EmployeeID) {
      toast.error("Select centre and doctor.");
      return;
    }
    if (!patient.FirstName || !patient.Mobile) {
      toast.error("Patient name and mobile are required.");
      return;
    }
    if (!booking.AppTime || !booking.TokenNo) {
      toast.error("Select an available slot.");
      return;
    }
    const investigationId = Number(booking.InvestigationID || slotMeta.InvestigationID || 0);
    if (!investigationId) {
      toast.error("Select a consultation item. Map it on Doctor Setup or search it here.");
      return;
    }
    if (Number(booking.Discount || 0) > Number(booking.Rate || 0)) {
      toast.error("Discount cannot be more than rate.");
      return;
    }
    setLoading(true);
    const centre = centres.find((c) => String(c.value) === String(booking.CentreID));
    axiosInstance
      .post("DoctorOPDConsultation/BookVisit", {
        ...patient,
        EmployeeID: Number(booking.EmployeeID),
        CentreID: Number(booking.CentreID),
        RateTypeId: Number(rateInfo.RateTypeId || userData?.OPDConsultationRateTypeID || userData?.RateTypeID || 0),
        RateTypeName: rateInfo.RateTypeName || "",
        CentreName: centre?.label,
        AppDate: formatApiDate(booking.AppDate),
        AppTime: booking.AppTime,
        TokenNo: Number(booking.TokenNo),
        RoomNo: slotMeta.RoomNo,
        VisitType: booking.VisitType,
        InvestigationID: investigationId,
        Rate: Number(booking.Rate || 0),
        Discount: Number(booking.Discount || 0),
        PaidAmount: Number(booking.PaidAmount || 0),
        PaymentMode: booking.PaymentMode,
        PaymentModeID: Number(booking.PaymentModeID),
        DoctorName: "SELF",
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(`Booked. Visit ${res.data.message?.VisitNo || ""} Token ${res.data.message?.Appointment?.TokenNo || booking.TokenNo}`);
          setPatient(emptyPatient);
          setBooking((prev) => ({ ...prev, Discount: 0, PaidAmount: 0, TokenNo: 0, AppTime: "" }));
          loadSlots();
        } else {
          toast.error(res?.data?.message || "Booking failed");
        }
      })
      .catch((err) => toast.error(apiError(err, "Unable to save appointment. Please try again.")))
      .finally(() => setLoading(false));
  };

  const netAmount = Math.max(0, Number(booking.Rate || 0) - Number(booking.Discount || 0));

  return (
    <div className="dopd-shell">
      {showPatientModal && (
        <MobileDataModal
          show={showPatientModal}
          mobleData={mobileRows}
          handleSelctData={handleSelectPatient}
          handleClose4={() => setShowPatientModal(false)}
          handleCreateNewPatient={() => setShowPatientModal(false)}
          state={patient}
        />
      )}

      <Accordion name={t("Doctor OPD Consultation Booking")} defaultValue={true} isBreadcrumb={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-step">1</span>
            <div>
              <h3>{t("Patient")}</h3>
              <span className="dopd-section-sub">{t("Look up an existing patient or enter details for a new one")}</span>
            </div>
          </div>

          {patient.FirstName && (
            <div className="dopd-patient-banner">
              <UserRound />
              <span>
                {patient.Title} {patient.FirstName} {patient.LastName}
                {patient.PatientCode ? ` · UHID ${patient.PatientCode}` : " · New patient"}
              </span>
            </div>
          )}

          <div className="dopd-grid" style={{ marginBottom: 12 }}>
            <Input
              name="Mobile"
              lable="Mobile"
              placeholder=" "
              type="number"
              value={patient.Mobile}
              onChange={(e) => setPatient({ ...patient, Mobile: e.target.value })}
              onBlur={() => {
                if ((patient.Mobile || "").length >= 10) searchPatientByMobile("Mobile");
              }}
            />
            <Input
              name="PatientCode"
              lable="UHID"
              placeholder=" "
              value={patient.PatientCode}
              onChange={(e) => setPatient({ ...patient, PatientCode: e.target.value })}
              onBlur={() => {
                if ((patient.PatientCode || "").length >= 3) searchPatientByMobile("UHID");
              }}
            />
            <div className="dopd-field-actions">
              <NextGenButton
                text={t("Search Patient")}
                icon={<Phone size={13} />}
                variant="secondary"
                size="sm"
                disabled={loading}
                onClick={() => searchPatientByMobile("Mobile")}
              />
              <NextGenButton
                text={t("Search by Name")}
                icon={<UserSearch size={13} />}
                variant="secondary"
                size="sm"
                disabled={loading}
                onClick={searchPatientByName}
              />
            </div>
          </div>
          <div className="dopd-grid">
            <ReactSelect
              dynamicOptions={[{ label: "Mr.", value: "Mr." }, { label: "Mrs.", value: "Mrs." }, { label: "Miss", value: "Miss" }, { label: "Master", value: "Master" }]}
              name="Title"
              lable={t("Title")}
              id="Title"
              removeIsClearable={true}
              placeholderName={t("Title")}
              value={patient.Title}
              onChange={(n, e) => setPatient({ ...patient, Title: e?.value || "Mr." })}
            />
            <Input name="FirstName" lable="First Name" placeholder=" " value={patient.FirstName} onChange={(e) => setPatient({ ...patient, FirstName: e.target.value })} />
            <Input name="LastName" lable="Last Name" placeholder=" " value={patient.LastName} onChange={(e) => setPatient({ ...patient, LastName: e.target.value })} />
            <ReactSelect
              dynamicOptions={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]}
              name="Gender"
              lable={t("Gender")}
              id="Gender"
              removeIsClearable={true}
              placeholderName={t("Gender")}
              value={patient.Gender}
              onChange={(n, e) => setPatient({ ...patient, Gender: e?.value || "Male" })}
            />
            <Input name="AgeYear" lable="Age Y" placeholder=" " value={patient.AgeYear} onChange={(e) => setPatient({ ...patient, AgeYear: e.target.value })} />
          </div>
        </div>

        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-step">2</span>
            <div>
              <h3>{t("Doctor & Schedule")}</h3>
              <span className="dopd-section-sub">{t("Pick the centre, doctor and appointment date")}</span>
            </div>
          </div>
          <div className="dopd-grid">
            <ReactSelect
              dynamicOptions={centres}
              name="CentreID"
              lable={t("Centre")}
              id="BookingCentreID"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={booking.CentreID}
              onChange={(name, e) => setBooking({ ...booking, CentreID: e?.value ?? "", EmployeeID: "" })}
            />
            <ReactSelect
              dynamicOptions={doctors}
              name="EmployeeID"
              lable={t("Doctor")}
              id="BookingEmployeeID"
              removeIsClearable={true}
              placeholderName={t("Doctor")}
              value={booking.EmployeeID}
              onChange={(name, e) => setBooking({ ...booking, EmployeeID: e?.value ?? "" })}
            />
            <DatePicker name="AppDate" lable="Appointment Date" value={booking.AppDate} onChange={(date, name) => setBooking({ ...booking, [name]: date })} />
            <ReactSelect
              dynamicOptions={[{ label: "New", value: "New" }, { label: "Follow Up", value: "FollowUp" }]}
              name="VisitType"
              lable={t("Visit Type")}
              id="VisitType"
              removeIsClearable={true}
              placeholderName={t("Visit Type")}
              value={booking.VisitType}
              onChange={(n, e) => setBooking({ ...booking, VisitType: e?.value || "New" })}
            />
          </div>
        </div>
      </Accordion>

      {loading && <Loading />}

      <Accordion title={t("Token / Slot")} defaultValue={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-step">3</span>
            <div>
              <h3>{t("Slot & Payment")}</h3>
              <span className="dopd-section-sub">{t("Choose an open token, then confirm the consultation charge")}</span>
            </div>
            {slotMeta.RoomNo && (
              <div className="dopd-head-extra">
                <span className="dopd-stat dopd-stat-primary">
                  <Ticket size={13} />
                  <span>{t("Room")} {slotMeta.RoomNo}</span>
                </span>
              </div>
            )}
          </div>

          <div className="dopd-slot-panel">
            <div className="dopd-slot-legend">
              <span>
                <i className="dopd-dot-free" /> {t("Available")}
              </span>
              <span>
                <i className="dopd-dot-selected" /> {t("Selected")}
              </span>
              <span>
                <i className="dopd-dot-booked" /> {t("Booked")}
              </span>
            </div>
            {slots.length === 0 && (
              <div className="dopd-slot-empty">
                <CalendarClock size={16} />
                <span>{t("No slots available. Select doctor, centre and a scheduled date.")}</span>
              </div>
            )}
            {slots.length > 0 && (
              <div className="dopd-slot-wrap">
                {slots.map((slot) => (
                  <button
                    key={slot.TokenNo}
                    type="button"
                    className={`dopd-slot ${booking.TokenNo == slot.TokenNo ? "dopd-slot--selected" : ""}`}
                    disabled={slot.IsBooked == 1}
                    onClick={() => setBooking({ ...booking, TokenNo: slot.TokenNo, AppTime: slot.AppTime })}
                  >
                    <span className="dopd-slot-token">#{slot.TokenNo}</span>
                    <span>{slot.AppTime}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="dopd-pay-card">
            <div className="dopd-pay-grid">
              <div className="dopd-item-select">
                <DopdItemSearch
                  value={booking.InvestigationID || slotMeta.InvestigationID}
                  label={slotMeta.InvestigationName}
                  placeholder={t("Consultation Item")}
                  onSelect={(item) => {
                    setSlotMeta((prev) => ({
                      ...prev,
                      InvestigationID: item.InvestigationID,
                      InvestigationName: itemLabel(item),
                    }));
                    setBooking((prev) => ({ ...prev, InvestigationID: item.InvestigationID }));
                    loadRate(item.InvestigationID);
                  }}
                />
              </div>
              <Input name="RateTypeName" lable="Rate Type" placeholder=" " value={rateInfo.RateTypeName} disabled />
              <Input name="Rate" lable="Rate" placeholder=" " type="number" value={booking.Rate} disabled />
              <Input name="Discount" lable="Discount" placeholder=" " type="number" value={booking.Discount} onChange={(e) => setBooking({ ...booking, Discount: e.target.value })} />
              <div className="dopd-pay-net">
                <span>{t("Net Amount")}</span>
                <b>₹{netAmount}</b>
              </div>
              <Input name="PaidAmount" lable="Paid Amount" placeholder=" " type="number" value={booking.PaidAmount} onChange={(e) => setBooking({ ...booking, PaidAmount: e.target.value })} />
            </div>
            <div className="dopd-grid" style={{ marginTop: 12, gridTemplateColumns: "minmax(180px,260px) auto" }}>
              <ReactSelect
                dynamicOptions={paymentModes.length ? paymentModes : [{ label: "Cash", value: 134 }]}
                name="PaymentModeID"
                lable={t("Payment Mode")}
                id="PaymentModeID"
                removeIsClearable={true}
                placeholderName={t("Payment Mode")}
                value={booking.PaymentModeID}
                onChange={(name, e) =>
                  setBooking({
                    ...booking,
                    PaymentModeID: e?.value || 134,
                    PaymentMode: e?.label || "Cash",
                  })
                }
              />
              <div className="dopd-field-actions">
                <NextGenButton
                  text={loading ? t("Saving...") : t("Save")}
                  icon={<CreditCard size={13} />}
                  variant="success"
                  size="sm"
                  loading={loading}
                  onClick={save}
                />
              </div>
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default DoctorOPDConsultationBooking;
