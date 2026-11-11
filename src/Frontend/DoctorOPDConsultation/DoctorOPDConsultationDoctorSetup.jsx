import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { CalendarClock, CalendarOff, Settings2, Users } from "lucide-react";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NextGenButton from "../../components/nextgen/NextGenButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { DOPD_WEEK_DAYS, apiError, emptyScheduleRow, formatApiDate } from "./dopdUtils";
import DopdItemSearch, { itemLabel } from "./DopdItemSearch";
import "./DoctorOPDConsultation.css";

const DoctorOPDConsultationDoctorSetup = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [centres, setCentres] = useState([]);
  const [employeeID, setEmployeeID] = useState("");
  const [centreID, setCentreID] = useState("");
  const [schedule, setSchedule] = useState(DOPD_WEEK_DAYS.map((d) => emptyScheduleRow(d.value)));
  const [headerApply, setHeaderApply] = useState({
    StartTime: "",
    EndTime: "",
    DurationMinutes: "",
    RoomNo: "",
    MaxPatients: "",
    InvestigationID: 0,
    InvestigationName: "",
  });
  const [leave, setLeave] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    LeaveType: "Leave",
    Reason: "",
    IsActive: 1,
    LeaveID: 0,
  });
  const [leaves, setLeaves] = useState([]);
  const [config, setConfig] = useState({ DoctorOPDPayRule: 0, DoctorOPDConsultation: 1 });

  const loadCentres = () => {
    axiosInstance.get("Centre/getAccessCentres").then((res) => {
      const data = (res?.data?.message || []).map((ele) => ({
        value: ele.CentreID,
        label: ele.Centre,
      }));
      setCentres([{ label: t("Select Centre"), value: "" }, ...data]);
    });
  };

  const loadDoctors = () => {
    axiosInstance
      .post("DoctorOPDConsultation/SearchDoctors", {
        Name: "",
        CentreID: Number(centreID || 0),
      })
      .then((res) => {
        const data = (res?.data?.message || []).map((ele) => ({
          value: ele.EmployeeID,
          label: ele.Name,
        }));
        setDoctors([{ label: t("Select Doctor"), value: "" }, ...data]);
      });
  };

  const loadSetup = (emp, centre) => {
    if (!emp) return;
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/GetDoctorSetup", {
        EmployeeID: Number(emp),
        CentreID: Number(centre || 0),
      })
      .then((res) => {
        const rows = res?.data?.message || [];
        setSchedule(
          DOPD_WEEK_DAYS.map((d) => {
            const found = rows.find((r) => Number(r.WeekDay) === d.value && (!centre || Number(r.CentreID) === Number(centre)));
            return found
              ? {
                  ScheduleID: found.ScheduleID,
                  WeekDay: d.value,
                  StartTime: found.StartTime,
                  EndTime: found.EndTime,
                  DurationMinutes: found.DurationMinutes,
                  RoomNo: found.RoomNo || "",
                  MaxPatients: found.MaxPatients,
                  InvestigationID: found.InvestigationID,
                  InvestigationName: itemLabel(found),
                  // API returns IsActive from a tinyint(1) column, which comes back as a
                  // bool (true/false). Coerce to 1/0 so SaveSchedule sends an int (the
                  // backend model is int and rejects true/false with a 400).
                  IsActive: Number(found.IsActive) ? 1 : 0,
                }
              : emptyScheduleRow(d.value);
          }),
        );
      })
      .finally(() => setLoading(false));

    axiosInstance
      .post("DoctorOPDConsultation/GetLeaves", { EmployeeID: Number(emp) })
      .then((res) => setLeaves(res?.data?.message || []));
  };

  useEffect(() => {
    loadCentres();
    loadDoctors();
    axiosInstance.get("DoctorOPDConsultation/GetConfig").then((res) => {
      if (res?.data?.success) setConfig(res.data.message);
    });
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [centreID]);

  useEffect(() => {
    loadSetup(employeeID, centreID);
  }, [employeeID, centreID]);

  const handleScheduleChange = (index, name, value) => {
    const next = [...schedule];
    next[index] = {
      ...next[index],
      [name]: name === "IsActive" ? (value ? 1 : 0) : value,
    };
    setSchedule(next);
  };

  const applyHeaderToAll = (name, value, extra = {}) => {
    setHeaderApply((prev) => ({ ...prev, [name]: value, ...extra }));
    setSchedule((prev) => prev.map((row) => ({ ...row, [name]: value, ...extra })));
  };

  const toggleAllDays = (checked) => {
    setSchedule((prev) => prev.map((row) => ({ ...row, IsActive: checked ? 1 : 0 })));
  };

  const saveSchedule = () => {
    if (loading) return;
    if (!employeeID || !centreID) {
      toast.error("Select doctor and centre");
      return;
    }
    const active = schedule.filter((r) => r.IsActive == 1);
    if (active.length === 0) {
      toast.error("Enable at least one OPD day.");
      return;
    }
    const invalid = active.find((r) => !r.StartTime || !r.EndTime || r.StartTime >= r.EndTime);
    if (invalid) {
      toast.error("Start time must be before end time for every active day.");
      return;
    }
    if (active.some((r) => Number(r.DurationMinutes) < 1 || Number(r.MaxPatients) < 1)) {
      toast.error("Duration and Max Patients must be greater than 0.");
      return;
    }
    if (active.some((r) => !r.InvestigationID)) {
      toast.error("Select a consultation item for each active day.");
      return;
    }
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/SaveSchedule", {
        EmployeeID: Number(employeeID),
        CentreID: Number(centreID),
        Schedule: schedule,
      })
      .then((res) => {
        toast.success(res?.data?.message || "Saved");
        loadSetup(employeeID, centreID);
      })
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const saveLeave = () => {
    if (loading) return;
    if (!employeeID) {
      toast.error("Select doctor");
      return;
    }
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/SaveLeave", {
        ...leave,
        EmployeeID: Number(employeeID),
        FromDate: formatApiDate(leave.FromDate),
        ToDate: formatApiDate(leave.ToDate),
      })
      .then((res) => {
        toast.success(res?.data?.message || "Saved");
        setLeave({ ...leave, LeaveID: 0, Reason: "" });
        loadSetup(employeeID, centreID);
      })
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const toggleLeave = (row) => {
    const nextActive = row.IsActive == 1 ? 0 : 1;
    axiosInstance
      .post("DoctorOPDConsultation/SaveLeave", {
        LeaveID: row.LeaveID,
        EmployeeID: Number(employeeID),
        FromDate: row.FromDate,
        ToDate: row.ToDate,
        LeaveType: row.LeaveType,
        Reason: row.Reason,
        IsActive: nextActive,
      })
      .then((res) => {
        toast.success(res?.data?.message || (nextActive ? "Leave activated" : "Leave inactivated"));
        loadSetup(employeeID, centreID);
      })
      .catch((err) => toast.error(apiError(err)));
  };

  const saveConfig = () => {
    if (loading) return;
    setLoading(true);
    axiosInstance
      .post("DoctorOPDConsultation/SaveConfig", config)
      .then((res) => toast.success(res?.data?.message || "Saved"))
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
  };

  const allActive = schedule.length > 0 && schedule.every((r) => r.IsActive == 1);
  const activeDayCount = schedule.filter((r) => r.IsActive == 1).length;

  return (
    <div className="dopd-shell">
      <Accordion name={t("Doctor OPD Doctor Setup")} defaultValue={true} isBreadcrumb={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-icon">
              <Settings2 size={16} />
            </span>
            <div>
              <h3>{t("General Setup")}</h3>
              <span className="dopd-section-sub">{t("Choose a doctor to configure their OPD schedule")}</span>
            </div>
          </div>
          <div className="dopd-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <ReactSelect
              dynamicOptions={centres}
              name="CentreID"
              lable={t("Centre")}
              id="CentreID"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={centreID}
              onChange={(name, e) => {
                setCentreID(e?.value ?? "");
                setEmployeeID("");
              }}
            />
            <ReactSelect
              dynamicOptions={doctors}
              name="EmployeeID"
              lable={t("OPD Doctor")}
              id="EmployeeID"
              removeIsClearable={true}
              placeholderName={t("OPD Doctor")}
              value={employeeID}
              onChange={(name, e) => setEmployeeID(e?.value ?? "")}
            />
            <ReactSelect
              dynamicOptions={[
                { label: "Allow unpaid", value: 0 },
                { label: "Partial required", value: 1 },
                { label: "Full payment required", value: 2 },
              ]}
              name="DoctorOPDPayRule"
              lable={t("Pay Rule")}
              id="DoctorOPDPayRule"
              removeIsClearable={true}
              placeholderName={t("Pay Rule")}
              value={config.DoctorOPDPayRule}
              onChange={(n, e) => setConfig({ ...config, DoctorOPDPayRule: Number(e?.value ?? 0) })}
            />
            <div className="dopd-field-actions">
              <NextGenButton text={loading ? t("Saving...") : t("Save Config")} variant="primary" size="sm" loading={loading} onClick={saveConfig} />
            </div>
          </div>
        </div>
      </Accordion>

      {loading && <Loading />}

      <Accordion title={t("OPD Days / Timing / Room")} defaultValue={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-icon">
              <CalendarClock size={16} />
            </span>
            <div>
              <h3>{t("Weekly Schedule")}</h3>
              <span className="dopd-section-sub">{t("Set timing, room and consultation item per weekday")}</span>
            </div>
            <div className="dopd-head-extra">
              <span className="dopd-stat dopd-stat-primary">
                <Users size={13} />
                <span>
                  <b>{activeDayCount}</b> {t("of")} {schedule.length} {t("days active")}
                </span>
              </span>
            </div>
          </div>

          <fieldset className="dopd-fieldset">
            <legend>{t("Quick fill — apply to every day")}</legend>
            <div className="dopd-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginBottom: 10 }}>
              <div>
                <label className="dopd-hint">{t("Start")}</label>
                <input
                  type="time"
                  className="form-control form-control-sm"
                  value={headerApply.StartTime}
                  onChange={(e) => applyHeaderToAll("StartTime", e.target.value)}
                />
              </div>
              <div>
                <label className="dopd-hint">{t("End")}</label>
                <input
                  type="time"
                  className="form-control form-control-sm"
                  value={headerApply.EndTime}
                  onChange={(e) => applyHeaderToAll("EndTime", e.target.value)}
                />
              </div>
              <div>
                <label className="dopd-hint">{t("Duration (min)")}</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={headerApply.DurationMinutes}
                  onChange={(e) => applyHeaderToAll("DurationMinutes", Number(e.target.value || 0))}
                />
              </div>
              <div>
                <label className="dopd-hint">{t("Room")}</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={headerApply.RoomNo}
                  onChange={(e) => applyHeaderToAll("RoomNo", e.target.value)}
                />
              </div>
              <div>
                <label className="dopd-hint">{t("Max Patients")}</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={headerApply.MaxPatients}
                  onChange={(e) => applyHeaderToAll("MaxPatients", Number(e.target.value || 0))}
                />
              </div>
              <div className="dopd-item-select">
                <label className="dopd-hint">{t("Consultation Item")}</label>
                <DopdItemSearch
                  value={headerApply.InvestigationID}
                  label={headerApply.InvestigationName}
                  placeholder={t("Apply Item to all")}
                  onSelect={(item) =>
                    applyHeaderToAll("InvestigationID", item.InvestigationID, {
                      InvestigationName: itemLabel(item),
                    })
                  }
                />
              </div>
            </div>
          </fieldset>

          <div className="dopd-table-card">
            <Tables>
              <thead className="cf">
                <tr>
                  <th>
                    <Form.Check
                      type="switch"
                      id="AllDays"
                      checked={allActive}
                      onChange={(e) => toggleAllDays(e.target.checked)}
                      label={t("All")}
                      className="fw-bold"
                    />
                  </th>
                  <th>{t("Day")}</th>
                  <th>{t("Start")}</th>
                  <th>{t("End")}</th>
                  <th>{t("Duration (min)")}</th>
                  <th>{t("Room")}</th>
                  <th>{t("Max Patients")}</th>
                  <th className="dopd-item-select">{t("Consultation Item")}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, i) => (
                  <tr key={row.WeekDay}>
                    <td>
                      <Form.Check
                        type="switch"
                        id={`DayActive_${row.WeekDay}`}
                        checked={row.IsActive == 1}
                        onChange={(e) => handleScheduleChange(i, "IsActive", e.target.checked)}
                      />
                    </td>
                    <td>{DOPD_WEEK_DAYS[i].label}</td>
                    <td>
                      <input
                        type="time"
                        className="form-control"
                        value={row.StartTime}
                        onChange={(e) => handleScheduleChange(i, "StartTime", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-control"
                        value={row.EndTime}
                        onChange={(e) => handleScheduleChange(i, "EndTime", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={row.DurationMinutes}
                        onChange={(e) => handleScheduleChange(i, "DurationMinutes", Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={row.RoomNo}
                        onChange={(e) => handleScheduleChange(i, "RoomNo", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={row.MaxPatients}
                        onChange={(e) => handleScheduleChange(i, "MaxPatients", Number(e.target.value))}
                      />
                    </td>
                    <td className="dopd-item-select">
                      <DopdItemSearch
                        value={row.InvestigationID}
                        label={row.InvestigationName}
                        placeholder={t("Consultation Item")}
                        onSelect={(item) => {
                          const next = [...schedule];
                          next[i] = {
                            ...next[i],
                            InvestigationID: item.InvestigationID,
                            InvestigationName: itemLabel(item),
                          };
                          setSchedule(next);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
          <div className="mt-3">
            <NextGenButton text={loading ? t("Saving...") : t("Save Schedule")} variant="success" size="sm" loading={loading} onClick={saveSchedule} />
          </div>
        </div>
      </Accordion>

      <Accordion title={t("Leave / Week Off")} defaultValue={true}>
        <div className="dopd-section">
          <div className="dopd-section-head">
            <span className="dopd-icon">
              <CalendarOff size={16} />
            </span>
            <div>
              <h3>{t("Leave / Week Off")}</h3>
              <span className="dopd-section-sub">{t("Block out dates the doctor is unavailable for OPD")}</span>
            </div>
          </div>
          <div className="dopd-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
            <DatePicker
              name="FromDate"
              lable="From Date"
              value={leave.FromDate}
              onChange={(date, name) => setLeave({ ...leave, [name]: date })}
            />
            <DatePicker
              name="ToDate"
              lable="To Date"
              value={leave.ToDate}
              onChange={(date, name) => setLeave({ ...leave, [name]: date })}
            />
            <ReactSelect
              dynamicOptions={[
                { label: "Leave", value: "Leave" },
                { label: "WeekOff", value: "WeekOff" },
              ]}
              name="LeaveType"
              lable={t("Type")}
              id="LeaveType"
              removeIsClearable={true}
              placeholderName={t("Type")}
              value={leave.LeaveType}
              onChange={(n, e) => setLeave({ ...leave, LeaveType: e?.value || "Leave" })}
            />
            <Input
              name="Reason"
              lable="Reason"
              placeholder=" "
              value={leave.Reason}
              onChange={(e) => setLeave({ ...leave, Reason: e.target.value })}
            />
            <div className="dopd-field-actions">
              <NextGenButton text={loading ? t("Saving...") : t("Save Leave")} variant="success" size="sm" loading={loading} onClick={saveLeave} />
            </div>
          </div>

          <div className="d-flex align-items-center" style={{ gap: "8px", margin: "14px 0 10px" }}>
            <span className="dopd-leave-legend dopd-leave-active">{t("Active")}</span>
            <span className="dopd-leave-legend dopd-leave-inactive">{t("InActive")}</span>
          </div>

          <div className="dopd-table-card">
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("From")}</th>
                  <th>{t("To")}</th>
                  <th>{t("Type")}</th>
                  <th>{t("Reason")}</th>
                  <th>{t("Active")}</th>
                  <th>{t("Leave Entry By")}</th>
                  <th>{t("Leave Entry Date")}</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 && (
                  <tr className="dopd-empty-row">
                    <td colSpan={7}>{t("No leave records yet.")}</td>
                  </tr>
                )}
                {leaves.map((ele) => (
                  <tr key={ele.LeaveID} className={ele.IsActive == 1 ? "dopd-leave-active" : "dopd-leave-inactive"}>
                    <td>{ele.FromDate}</td>
                    <td>{ele.ToDate}</td>
                    <td>{ele.LeaveType}</td>
                    <td>{ele.Reason}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        id={`LeaveActive_${ele.LeaveID}`}
                        checked={ele.IsActive == 1}
                        onChange={() => toggleLeave(ele)}
                        label={ele.IsActive == 1 ? t("Active") : t("InActive")}
                      />
                    </td>
                    <td>{ele.LeaveEntryBy}</td>
                    <td>{ele.LeaveEntryDate}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default DoctorOPDConsultationDoctorSetup;
