import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { CalendarClock, Phone, Search, Stethoscope, UserRound, Users2 } from "lucide-react";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import NextGenButton from "../../components/nextgen/NextGenButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { getDepartment } from "../../utils/NetworkApi/commonApi";
import { apiError } from "./dopdUtils";
import "./DoctorOPDConsultation.css";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "DR";

const DoctorOPDConsultationSearchDoctor = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [centres, setCentres] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState([]);
  const [searched, setSearched] = useState(false);
  const [payload, setPayload] = useState({ Name: "", CentreID: "", DepartmentID: "" });

  useEffect(() => {
    axiosInstance.get("Centre/getAccessCentres").then((res) => {
      setCentres([
        { label: t("All Centre"), value: "" },
        ...(res?.data?.message || []).map((ele) => ({ value: ele.CentreID, label: ele.Centre })),
      ]);
    });
    getDepartment(setDepartments, "getDepartmentEmployeeMaster");
  }, []);

  const search = () => {
    if (loading) return;
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/SearchDoctors", {
        Name: payload.Name,
        CentreID: Number(payload.CentreID || 0),
        DepartmentID: Number(payload.DepartmentID || 0),
      })
      .then((res) => {
        setData(res?.data?.message || []);
        setSearched(true);
      })
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  return (
    <div className="dopd-shell">
      <Accordion name={t("Doctor OPD Search Doctor")} defaultValue={true} isBreadcrumb={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-icon">
              <Search size={16} />
            </span>
            <div>
              <h3>{t("Find an OPD Doctor")}</h3>
              <span className="dopd-section-sub">{t("Search by name, centre or department")}</span>
            </div>
          </div>
          <div className="dopd-grid">
            <Input
              name="Name"
              lable="Doctor Name"
              placeholder=" "
              value={payload.Name}
              onChange={(e) => setPayload({ ...payload, Name: e.target.value })}
            />
            <ReactSelect
              dynamicOptions={centres}
              name="CentreID"
              lable={t("Centre")}
              id="SearchDoctorCentreID"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={payload.CentreID}
              onChange={(name, e) => setPayload({ ...payload, CentreID: e?.value ?? "" })}
            />
            <ReactSelect
              dynamicOptions={[{ label: t("All Department"), value: "" }, ...departments]}
              name="DepartmentID"
              lable={t("Department")}
              id="SearchDoctorDepartmentID"
              removeIsClearable={true}
              placeholderName={t("Department")}
              value={payload.DepartmentID}
              onChange={(name, e) => setPayload({ ...payload, DepartmentID: e?.value ?? "" })}
            />
            <div className="dopd-field-actions">
              <NextGenButton
                text={loading ? t("Searching...") : t("Search")}
                icon={<Search size={13} />}
                variant="primary"
                size="sm"
                loading={loading}
                onClick={search}
              />
            </div>
          </div>
        </div>
      </Accordion>

      {loading ? (
        <Loading />
      ) : (
        <Accordion title={t("Search Data")} defaultValue={true}>
          <div className="dopd-section">
            <div className="dopd-section-head">
              <span className="dopd-icon">
                <Users2 size={16} />
              </span>
              <div>
                <h3>{t("OPD Consultants")}</h3>
                <span className="dopd-section-sub">{t("Doctors matching your filters")}</span>
              </div>
              {data.length > 0 && (
                <div className="dopd-head-extra">
                  <span className="dopd-stat dopd-stat-primary">
                    <UserRound size={13} />
                    <span>
                      <b>{data.length}</b> {t("found")}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {data.length === 0 && (
              <div className="dopd-slot-empty" style={{ justifyContent: "center", padding: "36px 0" }}>
                <Search size={16} />
                <span>{searched ? t("No OPD consultant found.") : t("Run a search to see OPD consultants here.")}</span>
              </div>
            )}

            {data.length > 0 && (
              <div className="dopd-doc-grid">
                {data.map((ele) => (
                  <div className="dopd-doc-card" key={ele.EmployeeID}>
                    <div className="dopd-doc-top">
                      <span className="dopd-avatar">{initials(ele.Name)}</span>
                      <div>
                        <div className="dopd-doc-name">{ele.Name}</div>
                        {ele.Designation && <div className="dopd-doc-designation">{ele.Designation}</div>}
                      </div>
                    </div>
                    <div className="dopd-doc-meta">
                      {ele.Mobile && (
                        <span className="dopd-meta-row">
                          <Phone />
                          {ele.Mobile}
                        </span>
                      )}
                      {ele.Centre && (
                        <span className="dopd-meta-row">
                          <Stethoscope />
                          {ele.Centre}
                        </span>
                      )}
                    </div>
                    {ele.ScheduleSummary && (
                      <div className="dopd-doc-schedule">
                        <CalendarClock />
                        <span>{ele.ScheduleSummary}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Accordion>
      )}
    </div>
  );
};

export default DoctorOPDConsultationSearchDoctor;
