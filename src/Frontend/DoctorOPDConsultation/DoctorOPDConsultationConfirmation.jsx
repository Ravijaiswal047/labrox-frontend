import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Ban, CalendarClock, CheckCircle2, ClipboardList, History, ListFilter } from "lucide-react";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NextGenButton from "../../components/nextgen/NextGenButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiError, formatApiDate, paymentClass, statusBadgeClass } from "./dopdUtils";
import "./DoctorOPDConsultation.css";

const DoctorOPDConsultationConfirmation = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [centres, setCentres] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [data, setData] = useState([]);
  const [reason, setReason] = useState("");
  const [logs, setLogs] = useState([]);
  const [logFor, setLogFor] = useState(0);
  const [reschedule, setReschedule] = useState({ AppDate: new Date(), AppTime: "", TokenNo: 0 });
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    EmployeeID: "",
    PatientName: "",
    Mobile: "",
    UHID: "",
    AppStatus: "",
  });

  useEffect(() => {
    axiosInstance.get("Centre/getAccessCentres").then((res) => {
      setCentres([{ label: t("All"), value: "" }, ...(res?.data?.message || []).map((ele) => ({ value: ele.CentreID, label: ele.Centre }))]);
    });
  }, []);

  useEffect(() => {
    axiosInstance
      .post("DoctorOPDConsultation/SearchDoctors", { CentreID: Number(payload.CentreID || 0) })
      .then((res) => setDoctors([{ label: t("All"), value: "" }, ...(res?.data?.message || []).map((ele) => ({ value: ele.EmployeeID, label: ele.Name }))]));
  }, [payload.CentreID]);

  const search = () => {
    if (loading) return;
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/SearchAppointments", {
        ...payload,
        FromDate: formatApiDate(payload.FromDate),
        ToDate: formatApiDate(payload.ToDate),
        CentreID: Number(payload.CentreID || 0),
        EmployeeID: Number(payload.EmployeeID || 0),
      })
      .then((res) => setData(res?.data?.message || []))
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const updateStatus = (row, action, extra = {}) => {
    if (saving) return;
    if (action === "Cancel" && !reason.trim()) {
      toast.error("Cancellation reason is required.");
      return;
    }
    if (action === "Reschedule") {
      if (!reason.trim()) {
        toast.error("Reschedule reason is required.");
        return;
      }
      if (!reschedule.AppTime) {
        toast.error("Enter new time to reschedule.");
        return;
      }
    }
    setSaving(true);
    axiosInstance
      .post("DoctorOPDConsultation/UpdateStatus", {
        AppointmentID: row.AppointmentID,
        ActionType: action,
        Reason: reason,
        ...(action === "Reschedule"
          ? {
              AppDate: formatApiDate(reschedule.AppDate),
              AppTime: reschedule.AppTime,
              TokenNo: Number(reschedule.TokenNo || row.TokenNo),
            }
          : extra),
      })
      .then((res) => {
        toast.success(res?.data?.message || "Updated");
        search();
      })
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setSaving(false));
  };

  const loadLog = (row) => {
    axiosInstance
      .post("DoctorOPDConsultation/GetAppointmentLog", { AppointmentID: row.AppointmentID })
      .then((res) => {
        setLogFor(row.AppointmentID);
        setLogs(res?.data?.message || []);
      })
      .catch((err) => toast.error(apiError(err)));
  };

  return (
    <div className="dopd-shell">
      <Accordion name={t("Doctor OPD Appointment Confirmation")} defaultValue={true} isBreadcrumb={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-icon">
              <ListFilter size={16} />
            </span>
            <div>
              <h3>{t("Find Appointments")}</h3>
              <span className="dopd-section-sub">{t("Filter by date, centre, doctor or patient")}</span>
            </div>
          </div>
          <div className="dopd-grid" style={{ marginBottom: 12 }}>
            <DatePicker name="FromDate" lable="From Date" value={payload.FromDate} onChange={(date, name) => setPayload({ ...payload, [name]: date })} />
            <DatePicker name="ToDate" lable="To Date" value={payload.ToDate} onChange={(date, name) => setPayload({ ...payload, [name]: date })} />
            <ReactSelect dynamicOptions={centres} name="CentreID" lable={t("Centre")} id="ConfCentreID" removeIsClearable={true} placeholderName={t("Centre")} value={payload.CentreID} onChange={(n, e) => setPayload({ ...payload, CentreID: e?.value ?? "" })} />
            <ReactSelect dynamicOptions={doctors} name="EmployeeID" lable={t("Doctor")} id="ConfEmployeeID" removeIsClearable={true} placeholderName={t("Doctor")} value={payload.EmployeeID} onChange={(n, e) => setPayload({ ...payload, EmployeeID: e?.value ?? "" })} />
            <Input name="PatientName" lable="Patient" placeholder=" " value={payload.PatientName} onChange={(e) => setPayload({ ...payload, PatientName: e.target.value })} />
            <div className="dopd-field-actions">
              <NextGenButton text={loading ? t("Searching...") : t("Search")} variant="primary" size="sm" loading={loading} onClick={search} />
            </div>
          </div>

          <fieldset className="dopd-fieldset">
            <legend>{t("More filters & reschedule / cancel reason")}</legend>
            <div className="dopd-grid" style={{ marginBottom: 10 }}>
              <Input name="Mobile" lable="Mobile" placeholder=" " value={payload.Mobile} onChange={(e) => setPayload({ ...payload, Mobile: e.target.value })} />
              <Input name="UHID" lable="UHID" placeholder=" " value={payload.UHID} onChange={(e) => setPayload({ ...payload, UHID: e.target.value })} />
              <ReactSelect
                dynamicOptions={[{ label: t("All"), value: "" }, { label: "Booked", value: "Booked" }, { label: "Confirmed", value: "Confirmed" }, { label: "Rescheduled", value: "Rescheduled" }, { label: "Cancelled", value: "Cancelled" }]}
                name="AppStatus"
                lable={t("Status")}
                id="ConfAppStatus"
                removeIsClearable={true}
                placeholderName={t("Status")}
                value={payload.AppStatus}
                onChange={(n, e) => setPayload({ ...payload, AppStatus: e?.value ?? "" })}
              />
              <Input name="Reason" lable="Cancel / Reschedule Reason" placeholder=" " value={reason} onChange={(e) => setReason(e.target.value)} />
              <DatePicker name="AppDate" lable="New Date" value={reschedule.AppDate} onChange={(date) => setReschedule({ ...reschedule, AppDate: date })} />
              <Input name="AppTime" lable="New Time" placeholder=" " type="time" value={reschedule.AppTime} onChange={(e) => setReschedule({ ...reschedule, AppTime: e.target.value })} />
            </div>
          </fieldset>
        </div>
      </Accordion>

      {loading ? (
        <Loading />
      ) : (
        <Accordion title={t("Appointments")} defaultValue={true}>
          <div className="dopd-section">
            <div className="dopd-section-head">
              <span className="dopd-icon">
                <ClipboardList size={16} />
              </span>
              <div>
                <h3>{t("Appointments")}</h3>
                <span className="dopd-section-sub">{t("Confirm, reschedule or cancel a booking")}</span>
              </div>
              {data.length > 0 && (
                <div className="dopd-head-extra">
                  <span className="dopd-stat dopd-stat-primary">
                    <b>{data.length}</b>&nbsp;{t("appointments")}
                  </span>
                </div>
              )}
            </div>

            <div className="dopd-table-card">
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("Token")}</th>
                    <th>{t("Time")}</th>
                    <th>{t("Patient")}</th>
                    <th>{t("UHID")}</th>
                    <th>{t("Doctor")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Payment")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && (
                    <tr className="dopd-empty-row">
                      <td colSpan={8}>{t("No appointments found.")}</td>
                    </tr>
                  )}
                  {data.map((ele) => (
                    <tr key={ele.AppointmentID}>
                      <td>{ele.TokenNo}</td>
                      <td>{ele.AppTime}</td>
                      <td>{ele.PatientName}</td>
                      <td>{ele.PatientCode}</td>
                      <td>{ele.DoctorName}</td>
                      <td>
                        <span className={statusBadgeClass(ele.AppStatus)}>{ele.AppStatus}</span>
                      </td>
                      <td>
                        <span className={paymentClass(ele.PaymentStatus)}>{ele.PaymentStatus}</span>
                      </td>
                      <td>
                        <div className="dopd-action-cell">
                          {ele.AppStatus !== "Cancelled" && (
                            <>
                              <NextGenButton text={t("Confirm")} icon={<CheckCircle2 size={12} />} variant="success" size="sm" disabled={saving} onClick={() => updateStatus(ele, "Confirm")} />
                              <NextGenButton text={t("Reschedule")} icon={<CalendarClock size={12} />} variant="primary" size="sm" disabled={saving} onClick={() => updateStatus(ele, "Reschedule")} />
                              <NextGenButton text={t("Cancel")} icon={<Ban size={12} />} variant="danger" size="sm" disabled={saving} onClick={() => updateStatus(ele, "Cancel")} />
                            </>
                          )}
                          <NextGenButton text={t("Log")} icon={<History size={12} />} variant="secondary" size="sm" onClick={() => loadLog(ele)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>

            {logFor > 0 && (
              <div className="dopd-log-panel">
                <div className="dopd-log-title">
                  <History size={15} />
                  {t("Audit Log")}
                </div>
                <div className="dopd-table-card">
                  <Tables>
                    <thead className="cf">
                      <tr>
                        <th>{t("Action")}</th>
                        <th>{t("Old")}</th>
                        <th>{t("New")}</th>
                        <th>{t("Reason")}</th>
                        <th>{t("User")}</th>
                        <th>{t("Date")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 && (
                        <tr className="dopd-empty-row">
                          <td colSpan={6}>{t("No audit history.")}</td>
                        </tr>
                      )}
                      {logs.map((ele) => (
                        <tr key={ele.LogID}>
                          <td>{ele.ActionType}</td>
                          <td>
                            {ele.OldDate} {ele.OldTime}
                          </td>
                          <td>
                            {ele.NewDate} {ele.NewTime}
                          </td>
                          <td>{ele.Reason}</td>
                          <td>{ele.CreatedByName}</td>
                          <td>{ele.CreatedDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              </div>
            )}
          </div>
        </Accordion>
      )}
    </div>
  );
};

export default DoctorOPDConsultationConfirmation;
