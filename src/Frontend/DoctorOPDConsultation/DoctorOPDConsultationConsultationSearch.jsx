import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ClipboardCheck, ListFilter } from "lucide-react";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NextGenButton from "../../components/nextgen/NextGenButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiError, formatApiDate, statusBadgeClass } from "./dopdUtils";
import "./DoctorOPDConsultation.css";

const DoctorOPDConsultationConsultationSearch = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [centres, setCentres] = useState([]);
  const [data, setData] = useState([]);
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    EmployeeID: "",
    ConsultStatus: "Pending",
    PatientName: "",
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
        FromDate: formatApiDate(payload.FromDate),
        ToDate: formatApiDate(payload.ToDate),
        CentreID: Number(payload.CentreID || 0),
        EmployeeID: Number(payload.EmployeeID || 0),
        ConsultStatus: payload.ConsultStatus,
        PatientName: payload.PatientName,
      })
      .then((res) => setData((res?.data?.message || []).filter((x) => x.AppStatus !== "Cancelled")))
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const markDone = (row) => {
    if (saving || row.ConsultStatus === "Done") return;
    setSaving(true);
    axiosInstance
      .post("DoctorOPDConsultation/UpdateStatus", {
        AppointmentID: row.AppointmentID,
        ActionType: "Consult",
        ConsultStatus: "Done",
      })
      .then(() => search())
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setSaving(false));
  };

  return (
    <div className="dopd-shell">
      <Accordion name={t("Doctor OPD Consultation Search")} defaultValue={true} isBreadcrumb={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-icon">
              <ListFilter size={16} />
            </span>
            <div>
              <h3>{t("Find Consultations")}</h3>
              <span className="dopd-section-sub">{t("Filter by date, centre, doctor or status")}</span>
            </div>
          </div>
          <div className="dopd-grid">
            <DatePicker name="FromDate" lable="From Date" value={payload.FromDate} onChange={(date, name) => setPayload({ ...payload, [name]: date })} />
            <DatePicker name="ToDate" lable="To Date" value={payload.ToDate} onChange={(date, name) => setPayload({ ...payload, [name]: date })} />
            <ReactSelect dynamicOptions={centres} name="CentreID" lable={t("Centre")} id="ConsultCentreID" removeIsClearable={true} placeholderName={t("Centre")} value={payload.CentreID} onChange={(n, e) => setPayload({ ...payload, CentreID: e?.value ?? "", EmployeeID: "" })} />
            <ReactSelect dynamicOptions={doctors} name="EmployeeID" lable={t("Doctor")} id="ConsultEmployeeID" removeIsClearable={true} placeholderName={t("Doctor")} value={payload.EmployeeID} onChange={(n, e) => setPayload({ ...payload, EmployeeID: e?.value ?? "" })} />
            <ReactSelect
              dynamicOptions={[{ label: t("All"), value: "" }, { label: "Pending", value: "Pending" }, { label: "Done", value: "Done" }]}
              name="ConsultStatus"
              lable={t("Status")}
              id="ConsultStatus"
              removeIsClearable={true}
              placeholderName={t("Status")}
              value={payload.ConsultStatus}
              onChange={(n, e) => setPayload({ ...payload, ConsultStatus: e?.value ?? "" })}
            />
            <Input name="PatientName" lable="Patient" placeholder=" " value={payload.PatientName} onChange={(e) => setPayload({ ...payload, PatientName: e.target.value })} />
            <div className="dopd-field-actions">
              <NextGenButton text={loading ? t("Searching...") : t("Search")} variant="primary" size="sm" loading={loading} onClick={search} />
            </div>
          </div>
        </div>
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <Accordion title={t("Consultations")} defaultValue={true}>
          <div className="dopd-section">
            <div className="dopd-section-head">
              <span className="dopd-icon">
                <ClipboardCheck size={16} />
              </span>
              <div>
                <h3>{t("Consultations")}</h3>
                <span className="dopd-section-sub">{t("Mark a consultation complete once the doctor has seen the patient")}</span>
              </div>
              {data.length > 0 && (
                <div className="dopd-head-extra">
                  <span className="dopd-stat dopd-stat-primary">
                    <b>{data.length}</b>&nbsp;{t("records")}
                  </span>
                </div>
              )}
            </div>
            <div className="dopd-table-card">
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("Token")}</th>
                    <th>{t("Date")}</th>
                    <th>{t("Patient")}</th>
                    <th>{t("Doctor")}</th>
                    <th>{t("Consult")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && (
                    <tr className="dopd-empty-row">
                      <td colSpan={6}>{t("No consultations found.")}</td>
                    </tr>
                  )}
                  {data.map((ele) => (
                    <tr key={ele.AppointmentID}>
                      <td>{ele.TokenNo}</td>
                      <td>{ele.AppDate}</td>
                      <td>{ele.PatientName}</td>
                      <td>{ele.DoctorName}</td>
                      <td>
                        <span className={statusBadgeClass(ele.ConsultStatus)}>{ele.ConsultStatus}</span>
                      </td>
                      <td>
                        {ele.ConsultStatus !== "Done" && (
                          <NextGenButton text={t("Mark Done")} icon={<CheckCircle2 size={12} />} variant="success" size="sm" disabled={saving} onClick={() => markDone(ele)} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        </Accordion>
      )}
    </div>
  );
};

export default DoctorOPDConsultationConsultationSearch;
