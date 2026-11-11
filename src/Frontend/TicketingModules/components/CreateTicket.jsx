import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import Accordion from "@components/UI/Accordion";
import Input from "@components/formComponent/Input";
import ReactSelect from "@components/formComponent/ReactSelect";
import TextAreaInput from "@components/formComponent/TextAreaInput";
import { SaveButton, CancelButton } from "@components/UI/CustomButton";

import { axiosInstance } from "@app/utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { TICKET_PRIORITIES, resolveIconClass } from "../ticketConstants";

// All known field names from FieldConfig — order matters for prefix matching
const KNOWN_FIELDS = [
  "PatientName", "BarcodeNo", "ClientCode", "SampleType",
  "VisitNo", "MobileNo", "TestCode", "Centre", "Doctor", "UHID", "Remarks",
];

// Parse which field the server error refers to
// e.g. "VisitNo is mandatory for this category." → "VisitNo"
const parseErrorField = (msg) => {
  if (!msg || typeof msg !== "string") return null;
  return KNOWN_FIELDS.find((f) => msg.toLowerCase().startsWith(f.toLowerCase())) ?? null;
};

const INITIAL_FORM = {
  CategoryID: "", SubcategoryID: "", PatientName: "",
  VisitNo: "", BarcodeNo: "", UHID: "", MobileNo: "",
  TestCode: "", ClientCode: "", DoctorName: "", SampleType: "",
  CentreID: "", Priority: "", AssignedToUserID: "", Description: "",
  PreManageQueryID: "",
};

// ── Styles ────────────────────────────────────────────────────────────
const errWrap = {
  borderRadius: 6,
  border: "1.5px solid #dc2626",
  backgroundColor: "#fff5f5",
};
const errMsg = {
  fontSize: 10, color: "#dc2626", marginTop: 2,
  display: "block", paddingLeft: 2,
};

// Defined OUTSIDE the component so React doesn't treat it as a new type on every render
const F = ({ fieldName, colClass, children, errors }) => (
  <div className={colClass}>
    <div style={errors[fieldName] ? errWrap : {}}>
      {children}
    </div>
    {errors[fieldName] && (
      <span style={errMsg}>⚠ {errors[fieldName]}</span>
    )}
  </div>
);

const CreateTicket = ({ onSuccess, onCancel, compact = false }) => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [isLoading,   setIsLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});   // { VisitNo: "VisitNo is mandatory..." }

  const [categoryOptions,   setCategoryOptions]   = useState([]);
  const [subcatOptions,     setSubcatOptions]     = useState([]);
  const [assignableUsers,   setAssignableUsers]   = useState([]);
  const [centreOptions,     setCentreOptions]     = useState([]);
  const [selectedCat,       setSelectedCat]       = useState(null);
  const [fieldConfigMap,    setFieldConfigMap]    = useState({});
  const [escalationLevels,  setEscalationLevels]  = useState([]);
  const [preQueries,        setPreQueries]        = useState([]);

  const priorityOptions = TICKET_PRIORITIES.map((p) => ({ label: p, value: p }));
  const userNameMap     = Object.fromEntries(assignableUsers.map((u) => [u.value, u.label]));

  useEffect(() => {
    axiosInstance.get("Ticketing/GetCategoryDropdown")
      .then((res) => setCategoryOptions(res?.data?.message || [])).catch(() => {});
    axiosInstance.get("Centre/getAccessCentres")
      .then((res) => setCentreOptions(
        (res?.data?.message || []).map((c) => ({
          label: c.Centre, value: c.CentreID,
        }))
      )).catch(() => {});
  }, []);

  useEffect(() => {
    if (!formData.CategoryID) { setAssignableUsers([]); return; }
    axiosInstance.post("Ticketing/GetAssignableUsers", {
      CategoryID: formData.CategoryID || 0, CentreID: formData.CentreID || 0,
    }).then((res) => setAssignableUsers(Array.isArray(res?.data?.message) ? res?.data?.message : [])).catch(() => {});
  }, [formData.CategoryID, formData.CentreID]);

  useEffect(() => {
    if (!formData.CategoryID) {
      setSubcatOptions([]); setFieldConfigMap({}); setSelectedCat(null); setEscalationLevels([]);
      setPreQueries([]);
      setFormData((prev) => ({ ...prev, SubcategoryID: "", Priority: "", PreManageQueryID: "" }));
      return;
    }
    Promise.all([
      axiosInstance.post("Ticketing/GetSubcategoryDropdown", { CategoryID: formData.CategoryID }),
      axiosInstance.post("Ticketing/GetCategoryByID",        { CategoryID: formData.CategoryID }),
      axiosInstance.post("Ticketing/GetDataMaster",          { type: "QueryList", categoryId: Number(formData.CategoryID), queryID: 0, responseID: 0, priorityID: 0, ticketID: 0 }),
    ]).then(([subcatRes, catRes, queryRes]) => {
      setSubcatOptions(subcatRes?.data?.message || []);
      const catData = catRes?.data?.message || {};
      const cat = catData.Category    || catData.category    || null;
      const fc  = catData.FieldConfig || catData.fieldConfig || [];
      const esc = catData.EscalationConfig || catData.escalationConfig || [];
      setFieldConfigMap(Object.fromEntries(fc.map((f) => [f.FieldName, f.FieldRule])));
      setEscalationLevels(esc);
      setSelectedCat(cat);
      const allQueries = Array.isArray(queryRes?.data?.message) ? queryRes.data.message : [];
      setPreQueries(allQueries.filter((q) =>
        String(q.CategoryID) === String(formData.CategoryID) &&
        (q.IsActive === "true" || q.IsActive === 1 || q.IsActive === true)
      ));
      if (cat?.DefaultPriority) {
        setFormData((prev) => ({ ...prev, SubcategoryID: "", Priority: cat.DefaultPriority, PreManageQueryID: "" }));
      }
    }).catch(() => {});
  }, [formData.CategoryID]);

  // ── Helpers ────────────────────────────────────────────────────────
  const isFieldVisible  = (fn) => { if (!selectedCat) return false; const r = fieldConfigMap[fn]; return !!r && r !== "Hidden"; };
  const isFieldRequired = (fn) => fieldConfigMap[fn] === "Mandatory";

  // Clear a field's error when user edits it
  const clearErr = (name) => {
    if (fieldErrors[name]) setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    clearErr(name);
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSelectChange = (name, option) => {
    clearErr(name);
    setFormData((prev) => ({ ...prev, [name]: option?.value ?? "" }));
  };

  const handlePreQuerySelect = (_, option) => {
    if (!option) { setFormData((prev) => ({ ...prev, PreManageQueryID: "" })); return; }
    const q = preQueries.find((r) => r.Id === option.value);
    setFormData((prev) => ({
      ...prev,
      PreManageQueryID: option.value,
      Description: q?.Detail ?? prev.Description,
    }));
    clearErr("Description");
  };

  // ── Save ───────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!formData.CategoryID || !formData.PatientName || !formData.Description) {
      toast.warning(t("Category, Patient Name and Description are required"));
      return;
    }
    setIsLoading(true);
    setFieldErrors({});

    axiosInstance.post("Ticketing/CreateTicket", {
      CategoryID:       formData.CategoryID,
      SubcategoryID:    formData.SubcategoryID    || null,
      CentreID:         formData.CentreID         || 0,
      Priority:         formData.Priority,
      PatientName:      formData.PatientName,
      VisitNo:          formData.VisitNo           || "",
      BarcodeNo:        formData.BarcodeNo         || "",
      UHID:             formData.UHID              || "",
      MobileNo:         formData.MobileNo          || "",
      TestCode:         formData.TestCode          || "",
      ClientCode:       formData.ClientCode        || "",
      DoctorName:       formData.DoctorName        || "",
      SampleType:       formData.SampleType        || "",
      Description:      formData.Description,
      AssignedToUserID: formData.AssignedToUserID  || null,
      QueryID:          formData.PreManageQueryID  || null,
    })
    .then((res) => {
      const isSuccess = res?.data?.isSuccess;
      const msg       = res?.data?.message;

      // Server returned HTTP 200 but isSuccess=false (validation error)
      if (!isSuccess) {
        const errText  = typeof msg === "string" ? msg : t("Failed to create ticket");
        const errField = parseErrorField(errText);
        if (errField) setFieldErrors({ [errField]: errText });
        toast.error(errText);
        return;   // ← form stays open
      }

      toast.success(msg?.Message || t("Ticket created successfully"));
      handleClear();
      if (onSuccess) onSuccess(msg?.TicketID);
    })
    .catch((err) => {
      const errText  = err?.response?.data?.message || t("Failed to create ticket");
      const errField = parseErrorField(typeof errText === "string" ? errText : "");
      if (errField) setFieldErrors({ [errField]: errText });
      toast.error(errText);
    })
    .finally(() => setIsLoading(false));
  };

  const handleClear = () => {
    setFormData(INITIAL_FORM);
    setSelectedCat(null); setSubcatOptions([]);
    setFieldConfigMap({}); setEscalationLevels([]);
    setPreQueries([]);
    setFieldErrors({});
  };

  const sectionLabel = (text) => (
    <div className="col-12 mb-0 mt-1">
      <span style={{ fontSize: 10, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {text}
      </span>
      <hr style={{ margin: "1px 0 3px", borderColor: "#e2e8f0" }} />
    </div>
  );

  // ── Form body ──────────────────────────────────────────────────────
  const formBody = (
    <div style={{ padding: "8px 14px" }}>
      {/* Category Details */}
      <div className="row align-items-end">
        {sectionLabel(t("Category Details"))}
        <F errors={fieldErrors} fieldName="CategoryID" colClass="col-md-4 col-6">
          <ReactSelect id="categoryID" name="CategoryID" placeholderName="Category *"
            value={formData.CategoryID} dynamicOptions={categoryOptions}
            onChange={handleSelectChange} />
        </F>
        {preQueries.length > 0 && (
          <F errors={fieldErrors} fieldName="PreManageQueryID" colClass="col-md-4 col-6">
            <ReactSelect id="preManageQueryID" name="PreManageQueryID" placeholderName="Pre-Manage Query"
              value={formData.PreManageQueryID}
              dynamicOptions={preQueries.map((q) => ({ label: q.SUBJECT, value: q.Id }))}
              onChange={handlePreQuerySelect} />
          </F>
        )}
        {subcatOptions.length > 0 && (
          <F errors={fieldErrors} fieldName="SubcategoryID" colClass="col-md-3 col-6">
            <ReactSelect id="subcategoryID" name="SubcategoryID" placeholderName="Subcategory"
              value={formData.SubcategoryID} dynamicOptions={subcatOptions}
              onChange={handleSelectChange} />
          </F>
        )}
        <F errors={fieldErrors} fieldName="Priority" colClass="col-md-2 col-6">
          <ReactSelect id="priority" name="Priority" placeholderName="Priority"
            value={formData.Priority} dynamicOptions={priorityOptions}
            onChange={handleSelectChange} />
        </F>
        {isFieldVisible("Centre") && (
          <F errors={fieldErrors} fieldName="Centre" colClass="col-md-3 col-6">
            <ReactSelect id="centreID" name="CentreID" placeholderName="Centre"
              value={formData.CentreID} dynamicOptions={centreOptions}
              onChange={handleSelectChange} />
          </F>
        )}
      </div>

      {/* Category info banner */}
      {selectedCat && (
        <div className="d-flex align-items-center gap-2 mb-1 mt-1 px-2 py-1 rounded"
          style={{ background: selectedCat.BgColorHex || "#dbeafe", border: `1px solid ${selectedCat.ColorHex || "#1d4ed8"}33` }}>
          <i className={`${resolveIconClass(selectedCat.IconClass)} fs-6`} style={{ color: selectedCat.ColorHex || "#1d4ed8" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: selectedCat.ColorHex || "#1d4ed8" }}>{selectedCat.CategoryName}</span>
          <span style={{ fontSize: 11, color: "#4a5f75" }}>— {selectedCat.Department}</span>
          <span className="ms-auto" style={{ fontSize: 11, color: "#4a5f75" }}>
            TAT: <strong>{selectedCat.TAT_Minutes}m</strong>
            &nbsp;·&nbsp; Priority: <strong>{t(selectedCat.DefaultPriority)}</strong>
          </span>
        </div>
      )}

      {/* Patient Details */}
      <div className="row align-items-end">
        {sectionLabel(t("Patient Details"))}
        <F errors={fieldErrors} fieldName="PatientName" colClass="col-md-3 col-6">
          <Input type="text" name="PatientName" id="patientName" lable="Patient Name *"
            value={formData.PatientName} onChange={handleChange} required={true} />
        </F>
        {isFieldVisible("VisitNo") && (
          <F errors={fieldErrors} fieldName="VisitNo" colClass="col-md-2 col-6">
            <Input type="text" name="VisitNo" id="visitNo" lable="Visit No"
              value={formData.VisitNo} onChange={handleChange}
              required={isFieldRequired("VisitNo")} />
          </F>
        )}
        {isFieldVisible("UHID") && (
          <F errors={fieldErrors} fieldName="UHID" colClass="col-md-2 col-6">
            <Input type="text" name="UHID" id="uhid" lable="UHID"
              value={formData.UHID} onChange={handleChange}
              required={isFieldRequired("UHID")} />
          </F>
        )}
        {isFieldVisible("MobileNo") && (
          <F errors={fieldErrors} fieldName="MobileNo" colClass="col-md-2 col-6">
            <Input type="text" name="MobileNo" id="mobileNo" lable="Mobile No"
              value={formData.MobileNo} onChange={handleChange}
              required={isFieldRequired("MobileNo")} maxLength={10} />
          </F>
        )}
        {isFieldVisible("BarcodeNo") && (
          <F errors={fieldErrors} fieldName="BarcodeNo" colClass="col-md-2 col-6">
            <Input type="text" name="BarcodeNo" id="barcodeNo" lable="Barcode No"
              value={formData.BarcodeNo} onChange={handleChange}
              required={isFieldRequired("BarcodeNo")} />
          </F>
        )}
      </div>

      {/* Clinical Details */}
      {(isFieldVisible("TestCode") || isFieldVisible("ClientCode") || isFieldVisible("Doctor") || isFieldVisible("SampleType")) && (
        <div className="row align-items-end">
          {sectionLabel(t("Clinical Details"))}
          {isFieldVisible("TestCode") && (
            <F errors={fieldErrors} fieldName="TestCode" colClass="col-md-2 col-6">
              <Input type="text" name="TestCode" id="testCode" lable="Test Code"
                value={formData.TestCode} onChange={handleChange}
                required={isFieldRequired("TestCode")} />
            </F>
          )}
          {isFieldVisible("ClientCode") && (
            <F errors={fieldErrors} fieldName="ClientCode" colClass="col-md-2 col-6">
              <Input type="text" name="ClientCode" id="clientCode" lable="Client Code"
                value={formData.ClientCode} onChange={handleChange}
                required={isFieldRequired("ClientCode")} />
            </F>
          )}
          {isFieldVisible("Doctor") && (
            <F errors={fieldErrors} fieldName="Doctor" colClass="col-md-3 col-6">
              <Input type="text" name="DoctorName" id="doctorName" lable="Doctor"
                value={formData.DoctorName} onChange={handleChange}
                required={isFieldRequired("Doctor")} />
            </F>
          )}
          {isFieldVisible("SampleType") && (
            <F errors={fieldErrors} fieldName="SampleType" colClass="col-md-2 col-6">
              <Input type="text" name="SampleType" id="sampleType" lable="Sample Type"
                value={formData.SampleType} onChange={handleChange}
                required={isFieldRequired("SampleType")} />
            </F>
          )}
        </div>
      )}

      {/* Assignment & Description */}
      <div className="row align-items-top">
        {sectionLabel(t("Assignment & Description"))}
        <F errors={fieldErrors} fieldName="AssignedToUserID" colClass="col-md-3 col-6">
          <ReactSelect id="assignedToUserID" name="AssignedToUserID" placeholderName="Assign To"
            value={formData.AssignedToUserID} dynamicOptions={assignableUsers}
            onChange={handleSelectChange} />
        </F>
        
        <F errors={fieldErrors} fieldName="Description" colClass={preQueries.length > 0 ? "col-md-5 col-12" : "col-md-9 col-12"}>
          <TextAreaInput name="Description" id="description" lable="Description *"
            value={formData.Description} onChange={handleChange} rows={2} required={true} />
        </F>
      </div>

      {/* Escalation preview */}
      {escalationLevels.length > 0 && (
        <div className="tk-esc-strip d-flex align-items-center flex-wrap gap-2 mt-1">
          <strong style={{ color: "#3d5a8a", fontSize: 11 }}>{t("Escalation")}:</strong>
          {escalationLevels.map((e, i) => {
            const level   = e.escalationLevel  ?? e.EscalationLevel;
            const tatMin  = e.taT_Minutes       ?? e.TAT_Minutes;
            const userIDs = e.assignedUserIDs   ?? e.AssignedUserIDs ?? [];
            const names   = userIDs.map((id) => userNameMap[id] || `#${id}`).join(", ");
            const bgColor = i === 0 ? "#065f46" : i === 1 ? "#92400e" : "#991b1b";
            return (
              <span key={i} className="d-inline-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                <span className="tk-esc-badge" style={{ width: 22, height: 22, fontSize: 10, background: bgColor }}>
                  {level}
                </span>
                <span style={{ color: "#374151" }}>{names || "—"}</span>
                <span style={{ color: "#9ca3af" }}>({tatMin}m)</span>
                {i < escalationLevels.length - 1 && <i className="bi bi-arrow-right" style={{ fontSize: 12, color: "#9ca3af" }} />}
              </span>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="row mt-1">
        <div className="col-12 d-flex gap-1">
          <SaveButton text={t("Submit Ticket")} onClick={handleSave} disabled={isLoading} />
          <CancelButton className="ml-2" text={t("Clear")} onClick={() => { handleClear(); if (onCancel) onCancel(); }} />
        </div>
      </div>
    </div>
  );

  if (compact) return formBody;

  return (
    <div className={`container-fluid ${theme}`}>
      <Accordion title="Create New Ticket" defaultValue={true} isBreadcrumb={true}>
        {formBody}
      </Accordion>
    </div>
  );
};

export default CreateTicket;
