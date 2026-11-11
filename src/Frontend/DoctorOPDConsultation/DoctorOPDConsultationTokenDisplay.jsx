import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { DoorOpen, ListChecks, PhoneMissed, RotateCcw, Tv, UserCheck, Users2 } from "lucide-react";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import NextGenButton from "../../components/nextgen/NextGenButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiError, formatApiDate, queueStatus, statusBadgeClass } from "./dopdUtils";
import "./DoctorOPDConsultation.css";

const DoctorOPDConsultationTokenDisplay = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [centres, setCentres] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [data, setData] = useState([]);
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    EmployeeID: "",
  });

  useEffect(() => {
    axiosInstance.get("Centre/getAccessCentres").then((res) => {
      setCentres([{ label: t("Select Centre"), value: "" }, ...(res?.data?.message || []).map((ele) => ({ value: ele.CentreID, label: ele.Centre }))]);
    });
  }, []);

  useEffect(() => {
    axiosInstance
      .post("DoctorOPDConsultation/SearchDoctors", { CentreID: Number(payload.CentreID || 0) })
      .then((res) => setDoctors([{ label: t("Select Doctor"), value: "" }, ...(res?.data?.message || []).map((ele) => ({ value: ele.EmployeeID, label: ele.Name }))]));
  }, [payload.CentreID]);

  const search = () => {
    if (loading) return;
    if (!payload.CentreID || !payload.EmployeeID) {
      toast.error("Select centre and doctor.");
      return;
    }
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/SearchAppointments", {
        FromDate: formatApiDate(payload.FromDate),
        ToDate: formatApiDate(payload.ToDate),
        CentreID: Number(payload.CentreID || 0),
        EmployeeID: Number(payload.EmployeeID || 0),
      })
      .then((res) => setData((res?.data?.message || []).filter((x) => x.AppStatus !== "Cancelled")))
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const updateStatus = (row, action) => {
    if (saving) return;
    setSaving(true);
    axiosInstance
      .post("DoctorOPDConsultation/UpdateStatus", { AppointmentID: row.AppointmentID, ActionType: action })
      .then(() => search())
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setSaving(false));
  };

  const current = data.find((x) => x.IsCurrent == 1 && x.ConsultStatus !== "Done");
  const waitingCount = data.filter((x) => queueStatus(x) === "Waiting").length;
  const doneCount = data.filter((x) => queueStatus(x) === "Completed").length;

  return (
    <div className="dopd-shell">
      <Accordion name={t("Doctor OPD Token Display")} defaultValue={true} isBreadcrumb={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-icon">
              <Tv size={16} />
            </span>
            <div>
              <h3>{t("Live Token Board")}</h3>
              <span className="dopd-section-sub">{t("Pick a doctor to display their live queue")}</span>
            </div>
          </div>
          <div className="dopd-grid">
            <DatePicker name="FromDate" lable="Date" value={payload.FromDate} onChange={(date) => setPayload({ ...payload, FromDate: date, ToDate: date })} />
            <ReactSelect dynamicOptions={centres} name="CentreID" lable={t("Centre")} id="TokenCentreID" removeIsClearable={true} placeholderName={t("Centre")} value={payload.CentreID} onChange={(n, e) => setPayload({ ...payload, CentreID: e?.value ?? "" })} />
            <ReactSelect dynamicOptions={doctors} name="EmployeeID" lable={t("Doctor")} id="TokenEmployeeID" removeIsClearable={true} placeholderName={t("Doctor")} value={payload.EmployeeID} onChange={(n, e) => setPayload({ ...payload, EmployeeID: e?.value ?? "" })} />
            <div className="dopd-field-actions">
              <NextGenButton text={loading ? t("Searching...") : t("Search")} variant="primary" size="sm" loading={loading} onClick={search} />
            </div>
          </div>

          {data.length > 0 && (
            <div className="dopd-stat-row">
              <span className="dopd-stat dopd-stat-primary">
                <Users2 size={13} />
                <span>
                  <b>{data.length}</b> {t("total")}
                </span>
              </span>
              <span className="dopd-stat dopd-stat-warning">
                <ListChecks size={13} />
                <span>
                  <b>{waitingCount}</b> {t("waiting")}
                </span>
              </span>
              <span className="dopd-stat dopd-stat-success">
                <UserCheck size={13} />
                <span>
                  <b>{doneCount}</b> {t("done")}
                </span>
              </span>
            </div>
          )}
        </div>
      </Accordion>

      {loading ? (
        <Loading />
      ) : (
        <Accordion title={t("Queue")} defaultValue={true}>
          <div className="dopd-board">
            <div>
              {current ? (
                <div className="dopd-now-serving">
                  <span className="dopd-live-tag">
                    <span className="dopd-live-dot" />
                    {t("Now serving")}
                  </span>
                  <div className="dopd-token-number">#{current.TokenNo}</div>
                  <div className="dopd-token-patient">{current.PatientName}</div>
                  <div className="dopd-token-meta">
                    <span>
                      <DoorOpen />
                      {t("Room")} {current.RoomNo}
                    </span>
                    <span>{current.AppTime}</span>
                  </div>
                </div>
              ) : (
                <div className="dopd-now-serving">
                  <div className="dopd-now-idle">
                    <Tv />
                    <span>{t("No patient is currently being served.")}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="dopd-queue-list">
                {data.length === 0 && (
                  <div className="dopd-slot-empty" style={{ justifyContent: "center", padding: "30px 0" }}>
                    <Users2 size={16} />
                    <span>{t("No patients in queue.")}</span>
                  </div>
                )}
                {data.map((ele) => {
                  const status = queueStatus(ele);
                  return (
                    <div key={ele.AppointmentID} className={`dopd-queue-row ${ele.IsCurrent == 1 ? "dopd-current-row" : ""}`}>
                      <span className="dopd-queue-token">#{ele.TokenNo}</span>
                      <div className="dopd-queue-body">
                        <div className="dopd-queue-name">{ele.PatientName}</div>
                        <div className="dopd-queue-sub">
                          <span>
                            <DoorOpen size={12} style={{ display: "inline", marginRight: 3, verticalAlign: "text-top" }} />
                            {t("Room")} {ele.RoomNo}
                          </span>
                          <span>{ele.AppTime}</span>
                          <span className={statusBadgeClass(status)}>{status}</span>
                        </div>
                      </div>
                      <div className="dopd-queue-actions">
                        {status !== "Completed" && status !== "Cancelled" && (
                          <>
                            {status !== "Absent" && (
                              <>
                                <NextGenButton text={t("Current Call")} icon={<UserCheck size={12} />} variant="success" size="sm" disabled={saving} onClick={() => updateStatus(ele, "CurrentCall")} />
                                <NextGenButton text={t("Absent")} icon={<PhoneMissed size={12} />} variant="secondary" size="sm" disabled={saving} onClick={() => updateStatus(ele, "Absent")} />
                              </>
                            )}
                            {status === "Absent" && (
                              <NextGenButton text={t("Recall")} icon={<RotateCcw size={12} />} variant="warning" size="sm" disabled={saving} onClick={() => updateStatus(ele, "Recall")} />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Accordion>
      )}
    </div>
  );
};

export default DoctorOPDConsultationTokenDisplay;
