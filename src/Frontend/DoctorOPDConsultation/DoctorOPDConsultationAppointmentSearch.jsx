import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FileText, ListFilter, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NextGenButton from "../../components/nextgen/NextGenButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiError, formatApiDate, paymentClass } from "./dopdUtils";
import "./DoctorOPDConsultation.css";

const DoctorOPDConsultationAppointmentSearch = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [centres, setCentres] = useState([]);
  const [data, setData] = useState([]);
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    EmployeeID: "",
    PaymentStatus: "",
    PatientName: "",
    Mobile: "",
    UHID: "",
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
        PaymentStatus: payload.PaymentStatus,
        PatientName: payload.PatientName,
        Mobile: payload.Mobile,
        UHID: payload.UHID,
      })
      .then((res) => setData(res?.data?.message || []))
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const totalCollected = data.reduce((sum, ele) => sum + Number(ele.Adjustment || 0), 0);

  return (
    <div className="dopd-shell">
      <Accordion name={t("Doctor OPD Appointment Search")} defaultValue={true} isBreadcrumb={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-icon">
              <ListFilter size={16} />
            </span>
            <div>
              <h3>{t("Find Appointments")}</h3>
              <span className="dopd-section-sub">{t("Search visits, payments, receipts and settlements")}</span>
            </div>
          </div>
          <div className="dopd-grid" style={{ marginBottom: 12 }}>
            <DatePicker name="FromDate" lable="From Date" value={payload.FromDate} onChange={(date, name) => setPayload({ ...payload, [name]: date })} />
            <DatePicker name="ToDate" lable="To Date" value={payload.ToDate} onChange={(date, name) => setPayload({ ...payload, [name]: date })} />
            <ReactSelect dynamicOptions={centres} name="CentreID" lable={t("Centre")} id="ApptCentreID" removeIsClearable={true} placeholderName={t("Centre")} value={payload.CentreID} onChange={(n, e) => setPayload({ ...payload, CentreID: e?.value ?? "", EmployeeID: "" })} />
            <ReactSelect dynamicOptions={doctors} name="EmployeeID" lable={t("Doctor")} id="ApptEmployeeID" removeIsClearable={true} placeholderName={t("Doctor")} value={payload.EmployeeID} onChange={(n, e) => setPayload({ ...payload, EmployeeID: e?.value ?? "" })} />
            <ReactSelect
              dynamicOptions={[
                { label: t("All"), value: "" },
                { label: "Full Paid", value: "Full Paid" },
                { label: "Partial Paid", value: "Partial Paid" },
                { label: "UnPaid", value: "UnPaid" },
              ]}
              name="PaymentStatus"
              lable={t("Payment")}
              id="ApptPaymentStatus"
              removeIsClearable={true}
              placeholderName={t("Payment")}
              value={payload.PaymentStatus}
              onChange={(n, e) => setPayload({ ...payload, PaymentStatus: e?.value ?? "" })}
            />
            <Input name="PatientName" lable="Patient" placeholder=" " value={payload.PatientName} onChange={(e) => setPayload({ ...payload, PatientName: e.target.value })} />
            <div className="dopd-field-actions">
              <NextGenButton text={loading ? t("Searching...") : t("Search")} variant="primary" size="sm" loading={loading} onClick={search} />
            </div>
          </div>
          <div className="dopd-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 220px))" }}>
            <Input name="Mobile" lable="Mobile" placeholder=" " value={payload.Mobile} onChange={(e) => setPayload({ ...payload, Mobile: e.target.value })} />
            <Input name="UHID" lable="UHID" placeholder=" " value={payload.UHID} onChange={(e) => setPayload({ ...payload, UHID: e.target.value })} />
          </div>
        </div>
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <Accordion title={t("Appointments")} defaultValue={true}>
          <div className="dopd-section">
            <div className="dopd-section-head">
              <span className="dopd-icon">
                <FileText size={16} />
              </span>
              <div>
                <h3>{t("Appointments")}</h3>
                <span className="dopd-section-sub">{t("Visit-level details with receipt and settlement links")}</span>
              </div>
              {data.length > 0 && (
                <div className="dopd-head-extra">
                  <span className="dopd-stat dopd-stat-primary">
                    <b>{data.length}</b>&nbsp;{t("visits")}
                  </span>
                  <span className="dopd-stat dopd-stat-success">
                    <Wallet size={13} />
                    <span>
                      <b>₹{totalCollected}</b>&nbsp;{t("collected")}
                    </span>
                  </span>
                </div>
              )}
            </div>
            <div className="dopd-table-card">
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("Visit No")}</th>
                    <th>{t("UHID")}</th>
                    <th>{t("Patient")}</th>
                    <th>{t("Doctor")}</th>
                    <th>{t("Date")}</th>
                    <th>{t("Token")}</th>
                    <th>{t("Payment")}</th>
                    <th>{t("Net")}</th>
                    <th>{t("Paid")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && (
                    <tr className="dopd-empty-row">
                      <td colSpan={10}>{t("No appointments found.")}</td>
                    </tr>
                  )}
                  {data.map((ele) => (
                    <tr key={ele.AppointmentID}>
                      <td>{ele.LedgerTransactionNo}</td>
                      <td>{ele.PatientCode}</td>
                      <td>{ele.PatientName}</td>
                      <td>{ele.DoctorName}</td>
                      <td>{ele.AppDate}</td>
                      <td>{ele.TokenNo}</td>
                      <td>
                        <span className={paymentClass(ele.PaymentStatus)}>{ele.PaymentStatus}</span>
                      </td>
                      <td>{ele.NetAmount}</td>
                      <td>{ele.Adjustment}</td>
                      <td>
                        {ele.LedgerTransactionNo && (
                          <div className="dopd-action-cell">
                            <Link className="dopd-link-pill" to="/ReceiptReprint" state={{ data: ele.LedgerTransactionNo, VisitNo: ele.LedgerTransactionNo }}>
                              <Receipt />
                              {t("Receipt")}
                            </Link>
                            <Link className="dopd-link-pill" to="/Settlement" state={{ data: ele.LedgerTransactionNo, VisitNo: ele.LedgerTransactionNo }}>
                              <Wallet />
                              {t("Settlement")}
                            </Link>
                          </div>
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

export default DoctorOPDConsultationAppointmentSearch;
