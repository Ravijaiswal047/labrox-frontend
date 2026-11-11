// 1. React and hooks
import React, { useEffect, useState } from "react";

// 2. External libraries
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Form } from "react-bootstrap";

// 3. Shared components
import Accordion from "@components/UI/Accordion";
import Tables from "@components/UI/customTable";
import Input from "@components/formComponent/Input";
import ReactSelect from "@components/formComponent/ReactSelect";
import MultiSelectComp from "@components/formComponent/MultiSelectComp";
import Modal from "@components/formComponent/Modal";
import {
  SaveButton,
  CancelButton,
  EditButton,
  DeleteButton,
  CustomButton,
} from "@components/UI/CustomButton";

// 4. Utils
import { axiosInstance } from "@app/utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";

// 5. Local constants
import { TICKET_PRIORITIES, resolveIconClass } from "../ticketConstants";
import "../ticketing.css";

const INITIAL_FORM = {
  CategoryName: "",
  Priority: "",
  TAT: "",
  Icon: "",
  IsActive: true,
};


const ESC_LEVEL_OPTIONS = [
  { label: "L1", value: "L1" },
  { label: "L2", value: "L2" },
  { label: "L3", value: "L3" },
];

const FIELD_NAMES = [
  "VisitNo", "BarcodeNo", "UHID", "PatientName", "MobileNo",
  "TestCode", "ClientCode", "Centre", "Doctor", "SampleType", "Remarks",
];

const FIELD_RULE_OPTIONS = [
  { label: "Mandatory", value: "Mandatory" },
  { label: "Optional", value: "Optional" },
  { label: "Hidden", value: "Hidden" },
];

const BLANK_ESC_LEVEL = {
  EscalationConfigID: 0,
  EscalationLevel: "L1",
  AssignedUserIDs: [],
  TAT_Minutes: "",
  NotifyEmail: true,
  NotifySMS: false,
  NotifyApp: true,
  IsActive: true,
};

const CategoryMaster = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Shared dropdowns
  const [assignableUsers, setAssignableUsers] = useState([]);

  // Subcategory modal
  const [showSubcatModal, setShowSubcatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [subcats, setSubcats] = useState([]);
  const [newSubcat, setNewSubcat] = useState("");
  const [isSubcatLoading, setIsSubcatLoading] = useState(false);

  // Escalation modal
  const [showEscModal, setShowEscModal] = useState(false);
  const [escCat, setEscCat] = useState(null);
  const [escLevels, setEscLevels] = useState([]);
  const [isEscLoading, setIsEscLoading] = useState(false);
  const [centres, setCentres] = useState([]);
  const [escUsers, setEscUsers] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState([]);

  // Field config modal
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [fieldCat, setFieldCat] = useState(null);
  const [fieldConfig, setFieldConfig] = useState([]);
  const [isFieldLoading, setIsFieldLoading] = useState(false);

  const priorityOptions = TICKET_PRIORITIES.map((p) => ({ label: p, value: p }));

  useEffect(() => {
    loadCategories();
    axiosInstance
      .post("Ticketing/GetAssignableUsers", { CategoryID: 0, CentreID: 0 })
      .then((res) => setAssignableUsers(res?.data?.message || []))
      .catch(() => { });
  }, []);

  // ─── Category CRUD ───────────────────────────────────────────────
  const loadCategories = () => {
    axiosInstance
      .post("Ticketing/GetAllCategories", { IsActive: null })
      .then((res) => {
        const data = res?.data?.message;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Failed to load categories"))
      );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({ ...prev, [name]: option?.value ?? "" }));
  };

  const handleSave = () => {
    if (!formData.CategoryName || !formData.Priority || !formData.TAT) {
      toast.warning(t("Please fill all required fields"));
      return;
    }
    setIsLoading(true);
    axiosInstance
      .post("Ticketing/SaveCategory", {
        CategoryID: editId || 0,
        CategoryCode: "",
        CategoryName: formData.CategoryName,
        DefaultPriority: formData.Priority,
        TAT_Minutes: Number(formData.TAT),
        IconClass: formData.Icon || "bi bi-tag-fill",
        ColorHex: "",
        BgColorHex: "",
        IsActive: formData.IsActive,
      })
      .then((res) => {
        toast.success(res?.data?.message?.Message || t("Category saved successfully"));
        handleClear();
        loadCategories();
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Save failed")))
      .finally(() => setIsLoading(false));
  };

  const handleEdit = (cat) => {
    axiosInstance
      .post("Ticketing/GetCategoryByID", { CategoryID: cat.CategoryID })
      .then((res) => {
        const c = res?.data?.message?.Category || res?.data?.message?.category;
        if (!c) return;
        setFormData({
          CategoryName: c.CategoryName,
          Priority: c.DefaultPriority,
          TAT: String(c.TAT_Minutes),
          Icon: c.IconClass || "",
          IsActive: c.IsActive,
        });
        setEditId(c.CategoryID);
        setIsEditMode(true);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to load category")));
  };

  // const handleDelete = (cat) => {
  //   axiosInstance
  //     .post("Ticketing/DeleteCategory", { CategoryID: cat.CategoryID })
  //     .then(() => {
  //       toast.success(t("Category deleted"));
  //       loadCategories();
  //     })
  //     .catch((err) => toast.error(err?.response?.data?.message || t("Delete failed")));
  // };

  const handleClear = () => {
    setFormData(INITIAL_FORM);
    setIsEditMode(false);
    setEditId(null);
  };

  // ─── Subcategory modal ───────────────────────────────────────────
  const handleOpenSubcats = (cat) => {
    setSelectedCat(cat);
    setNewSubcat("");
    setShowSubcatModal(true);
    loadSubcats(cat.CategoryID);
  };

  const loadSubcats = (categoryId) => {
    setIsSubcatLoading(true);
    axiosInstance
      .post("Ticketing/GetSubcategoriesByCategoryID", { CategoryID: categoryId })
      .then((res) => setSubcats(res?.data?.message || []))
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Failed to load subcategories"))
      )
      .finally(() => setIsSubcatLoading(false));
  };

  const handleAddSubcat = () => {
    if (!newSubcat.trim()) return;
    setIsSubcatLoading(true);
    axiosInstance
      .post("Ticketing/SaveSubcategory", {
        SubcategoryID: 0,
        CategoryID: selectedCat.CategoryID,
        SubcategoryName: newSubcat.trim(),
        IsActive: true,
      })
      .then(() => {
        toast.success(t("Subcategory added"));
        setNewSubcat("");
        loadSubcats(selectedCat.CategoryID);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to save subcategory")))
      .finally(() => setIsSubcatLoading(false));
  };

  const handleRemoveSubcat = (sub) => {
    setIsSubcatLoading(true);
    axiosInstance
      .post("Ticketing/DeleteSubcategory", { SubcategoryID: sub.SubcategoryID })
      .then(() => {
        toast.success(t("Subcategory removed"));
        loadSubcats(selectedCat.CategoryID);
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Failed to delete subcategory"))
      )
      .finally(() => setIsSubcatLoading(false));
  };

  // ─── Escalation modal ────────────────────────────────────────────
  const handleOpenEscalation = (cat) => {
    setEscCat(cat);
    setShowEscModal(true);
    setIsEscLoading(true);
    setSelectedCentre([]);

    axiosInstance.get("Centre/getAccessCentres")
      .then((res) => setCentres(
        (res?.data?.message || []).map((c) => ({ label: c.Centre, value: String(c.CentreID) }))
      ))
      .catch(() => { });

    axiosInstance
      .post("Ticketing/GetAssignableUsers", { CategoryID: cat.CategoryID, CentreID: 0 })
      .then((res) => {
        const users = Array.isArray(res?.data?.message) ? res.data.message : [];
        setEscUsers(users.map((u) => ({ label: u.UserName ?? u.Name ?? u.label, value: String(u.UserID ?? u.id ?? u.value) })));
      })
      .catch(() => { });

    axiosInstance
      .post("Ticketing/GetCategoryByID", { CategoryID: cat.CategoryID })
      .then((res) => {
        const esc = res?.data?.message?.EscalationConfig || res?.data?.message?.escalationConfig || [];
        const normalized = esc.map((e) => ({
          EscalationConfigID: e.escalationConfigID ?? e.EscalationConfigID,
          EscalationLevel: e.escalationLevel ?? e.EscalationLevel,
          AssignedUserIDs: Array.isArray(e.assignedUserIDs ?? e.AssignedUserIDs)
            ? (e.assignedUserIDs ?? e.AssignedUserIDs).map(String)
            : [],
          TAT_Minutes: e.taT_Minutes ?? e.TAT_Minutes,
          NotifyEmail: !!(e.notifyEmail ?? e.NotifyEmail),
          NotifySMS: !!(e.notifySMS ?? e.NotifySMS),
          NotifyApp: !!(e.notifyApp ?? e.NotifyApp),
          IsActive: !!(e.isActive ?? e.IsActive),
          SortOrder: e.sortOrder ?? e.SortOrder,
        }));
        setEscLevels(normalized.length > 0 ? normalized : [{ ...BLANK_ESC_LEVEL }]);
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Failed to load escalation config"))
      )
      .finally(() => setIsEscLoading(false));
  };

  const handleEscLevelChange = (index, field, value) => {
    setEscLevels((prev) =>
      prev.map((lvl, i) => (i === index ? { ...lvl, [field]: value } : lvl))
    );
  };

  const handleCentreChange = (_, selectedValues) => {
    setSelectedCentre(selectedValues || []);
    const centreIds = (selectedValues || []).map(Number);
    axiosInstance
      .post("Ticketing/GetAssignableUsers", { CategoryID: escCat.CategoryID, CentreIDs: centreIds })
      .then((res) => {
        const users = Array.isArray(res?.data?.message) ? res.data.message : [];
        setEscUsers(users.map((u) => ({ label: u.UserName ?? u.Name ?? u.label, value: String(u.UserID ?? u.id ?? u.value) })));
      })
      .catch(() => { });
  };

  const handleAddEscLevel = () => {
    if (escLevels.length >= 3) {
      toast.warning(t("Maximum 3 escalation levels allowed"));
      return;
    }
    const levelIndex = escLevels.length;
    const nextLevel = ["L1", "L2", "L3"][levelIndex] || "L3";
    setEscLevels((prev) => [
      ...prev,
      { ...BLANK_ESC_LEVEL, EscalationLevel: nextLevel, TAT_Minutes: "", SortOrder: prev.length + 1 },
    ]);
  };

  const handleSaveEscalation = () => {
    if (escLevels.length === 0) {
      toast.warning(t("At least one escalation level is required"));
      return;
    }
    setIsEscLoading(true);
    axiosInstance
      .post("Ticketing/SaveEscalationConfig", {
        CategoryID: escCat.CategoryID,
        EscalationLevels: escLevels.map((e, i) => ({
          EscalationConfigID: e.EscalationConfigID || 0,
          EscalationLevel: e.EscalationLevel,
          AssignedUserIDs: e.AssignedUserIDs || [],
          TAT_Minutes: Number(e.TAT_Minutes) || 0,
          NotifyEmail: !!e.NotifyEmail,
          NotifySMS: !!e.NotifySMS,
          NotifyApp: !!e.NotifyApp,
          IsActive: !!e.IsActive,
          SortOrder: i + 1,
        })),
      })
      .then(() => {
        toast.success(t("Escalation config saved"));
        setShowEscModal(false);
        loadCategories();
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Save failed")))
      .finally(() => setIsEscLoading(false));
  };

  // ─── Field config modal ──────────────────────────────────────────
  const handleOpenFieldConfig = (cat) => {
    setFieldCat(cat);
    setShowFieldModal(true);
    setIsFieldLoading(true);
    axiosInstance
      .post("Ticketing/GetCategoryByID", { CategoryID: cat.CategoryID })
      .then((res) => {
        const fc = res?.data?.message?.FieldConfig || res?.data?.message?.fieldConfig || [];
        const ruleMap = Object.fromEntries(fc.map((f) => [f.FieldName, f.FieldRule]));
        setFieldConfig(
          FIELD_NAMES.map((fn) => ({ FieldName: fn, FieldRule: ruleMap[fn] || "Optional" }))
        );
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Failed to load field config"))
      )
      .finally(() => setIsFieldLoading(false));
  };

  const handleFieldRuleChange = (fieldName, option) => {
    setFieldConfig((prev) =>
      prev.map((f) => (f.FieldName === fieldName ? { ...f, FieldRule: option?.value ?? "Optional" } : f))
    );
  };

  const handleSaveFieldConfig = () => {
    setIsFieldLoading(true);
    axiosInstance
      .post("Ticketing/SaveCategoryFieldConfig", {
        CategoryID: fieldCat.CategoryID,
        FieldConfig: fieldConfig,
      })
      .then(() => {
        toast.success(t("Field config saved"));
        setShowFieldModal(false);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Save failed")))
      .finally(() => setIsFieldLoading(false));
  };

  // ─── Escalation row colors ────────────────────────────────────────
  const escRowCls = ["tk-esc-row-l1", "tk-esc-row-l2", "tk-esc-row-l3"];
  const escBadgeBg = ["#065f46", "#92400e", "#991b1b"];

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className={`${theme}`}>
      {/* Form */}
      <Accordion
        title={isEditMode ? "Edit Category" : "Add Category"}
        defaultValue={true}
      >
        <div
        // className="card-body" style={{ paddingTop: 10, paddingBottom: 10 }}
        >
          <div className="row align-items-end gx-2">
            <div  className="col-12 col-sm-6 col-md-2 my-1">
               <Input
              type="text"
              name="CategoryName"
              id="categoryName"
              lable="Category Name"
              value={formData.CategoryName}
              onChange={handleChange}
              required={true}
            />
            </div>
           <div className="col-12 col-sm-6 col-md-2 my-1">
             <ReactSelect
              id="priority"
              name="Priority"
              placeholderName="Default Priority"
              value={formData.Priority}
              dynamicOptions={priorityOptions}
              onChange={handleSelectChange}
              
            />
           </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <Input
              type="number"
              name="TAT"
              id="tat"
              lable="TAT (Minutes)"
              value={formData.TAT}
              onChange={handleChange}
              
              required={true}
              display="right"
            />
            </div>
            
            <div className="col-6 col-sm-6 col-md-auto my-1 d-flex align-items-center">
              <Form.Check
                type="switch"
                id="isActive-switch"
                label={formData.IsActive ? t("Active") : t("Inactive")}
                name="IsActive"
                checked={formData.IsActive}
                onChange={handleChange}
              />
            </div>
            <div className="col-6 col-sm-6 col-md-auto my-1 d-flex gap-1 align-items-center justify-content-end">
              <SaveButton
                text={isEditMode ? t("Update") : t("Save")}
                onClick={handleSave}
                disabled={isLoading}
              />
              <CancelButton text={t("Cancel")} onClick={handleClear} className="ml-2" />
            </div>
          </div>
        </div>
      </Accordion>

      {/* Category list */}
      <Accordion title="Category List" defaultValue={true}>
        <div
        // className="card-body" style={{ paddingTop: 8, paddingBottom: 8 }}
        >
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr No")}</th>
                <th>{t("Category Name")}</th>
                <th>{t("Default Priority")}</th>
                <th>{t("TAT (Min)")}</th>
                <th>{t("Subcategories")}</th>
                <th>{t("Escalation")}</th>
                <th>{t("Field Config")}</th>
                <th>{t("Status")}</th>
                <th>{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr
                  key={cat.CategoryID}
                  style={{ background: cat.IsActive ? "#d4edda" : "#f8d7da" }}
                >
                  <td>{idx + 1}</td>
                  <td>{cat.CategoryName}</td>
                  <td>
                    <span
                      className={`badge ${cat.DefaultPriority === "Critical"
                        ? "bg-danger"
                        : cat.DefaultPriority === "High"
                          ? "bg-warning text-dark"
                          : cat.DefaultPriority === "Medium"
                            ? "bg-primary"
                            : "bg-success"
                        }`}
                    >
                      {t(cat.DefaultPriority)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{cat.TAT_Minutes}m</td>
                  <td>
                    <CustomButton
                      text={`${cat.SubcategoryCount ?? 0} ${t("Subcats")}`}
                      icon="list"
                      onClick={() => handleOpenSubcats(cat)}
                    />
                  </td>
                  <td>
                    <CustomButton
                      text={`${cat.EscalationLevelCount ?? 0} ${t("Levels")}`}
                      icon="flag"
                      onClick={() => handleOpenEscalation(cat)}
                    />
                  </td>
                  <td>
                    <CustomButton
                      text={t("Fields")}
                      icon="adjustments"
                      onClick={() => handleOpenFieldConfig(cat)}
                    />
                  </td>
                  <td>
                    <span className={`badge ${cat.IsActive ? "bg-success" : "bg-danger"}`}>
                      {cat.IsActive ? t("Active") : t("Inactive")}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <EditButton onClick={() => handleEdit(cat)} />
                      {/* <DeleteButton onClick={() => handleDelete(cat)} className="ml-2" /> */}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-3">
                    {t("No categories found")}
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
        </div>
      </Accordion>

      {/* Subcategory Modal */}
      {selectedCat && (
        <Modal
          visible={showSubcatModal}
          setVisible={setShowSubcatModal}
          Header={`${t("Subcategories")} — ${selectedCat.CategoryName}`}
          modalWidth="450px"
          buttons={<CancelButton text={t("Close")} onClick={() => setShowSubcatModal(false)} />}
        >
          <div className="d-flex gap-2 mb-3">
            <input
              className="form-control form-control-sm"
              placeholder={t("Add new subcategory")}
              value={newSubcat}
              onChange={(e) => setNewSubcat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubcat()}
              disabled={isSubcatLoading}
            />
            <SaveButton text={t("Add")} onClick={handleAddSubcat} disabled={isSubcatLoading} />
          </div>
          {isSubcatLoading ? (
            <div className="text-center py-2">
              <span className="spinner-border spinner-border-sm" />
            </div>
          ) : (
            <div>
              {subcats.map((sub) => (
                <div key={sub.SubcategoryID} className="tk-subcat-item">
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <i className="bi bi-dot" style={{ fontSize: 10, color: "#4a6fa5" }} />
                    {sub.SubcategoryName}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    style={{ fontSize: 11, padding: "1px 8px", borderRadius: 6 }}
                    onClick={() => handleRemoveSubcat(sub)}
                  >
                    {t("Remove")}
                  </button>
                </div>
              ))}
              {subcats.length === 0 && (
                <div className="text-muted text-center" style={{ fontSize: 12 }}>
                  {t("No subcategories added")}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Escalation Modal */}
      {escCat && (
        <Modal
          visible={showEscModal}
          setVisible={setShowEscModal}
          Header={`${t("Escalation Config")} — ${escCat.CategoryName}`}
          modalWidth="720px"
          buttons={
            <>
              <SaveButton
                text={t("Save Escalation")}
                onClick={handleSaveEscalation}
                disabled={isEscLoading}
              />
              <CancelButton text={t("Close")} onClick={() => setShowEscModal(false)} />
            </>
          }
        >
          {isEscLoading ? (
            <div className="text-center py-3">
              <span className="spinner-border spinner-border-sm" />
            </div>
          ) : (
            <div>
              {/* Global centre filter */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <label className="mb-0 text-nowrap" style={{ fontSize: 13 }}>{t("Filter by Centre")}:</label>
                <div style={{ minWidth: 220 }}>
                  <MultiSelectComp
                    id="esc-centre"
                    name="esc-centre"
                    label={t("All Centres")}
                    options={centres}
                    value={selectedCentre}
                    onChange={handleCentreChange}
                  />
                </div>
              </div>

              {escLevels.map((esc, i) => (
                <div key={i} className={`tk-esc-row ${escRowCls[i] || "tk-esc-row-l3"} mb-2`}>
                  <div
                    className="tk-esc-badge"
                    style={{ background: escBadgeBg[i] || "#991b1b", flexShrink: 0 }}
                  >
                    {esc.EscalationLevel}
                  </div>
                  <div className="row g-2 flex-fill align-items-center">
                    {/* Level selector */}
                    <div className="col-md-2 col-6">
                      <select
                        className="form-select form-select-sm"
                        value={esc.EscalationLevel}
                        onChange={(e) => handleEscLevelChange(i, "EscalationLevel", e.target.value)}
                      >
                        {ESC_LEVEL_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Multi-select users */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                      <MultiSelectComp
                        id={`esc-user-${i}`}
                        name={`esc-user-${i}`}
                        label={t("Select Users")}
                        options={escUsers}
                        value={esc.AssignedUserIDs || []}
                        onChange={(_, vals) => handleEscLevelChange(i, "AssignedUserIDs", vals)}
                      />
                    </div>
                    {/* TAT minutes */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder={t("TAT (min)")}
                        value={esc.TAT_Minutes}
                        onChange={(e) => handleEscLevelChange(i, "TAT_Minutes", e.target.value)}
                      />
                    </div>
                    {/* Notify checkboxes + Active toggle */}
                    <div className="col-12 d-flex align-items-center flex-wrap" style={{ fontSize: 12, gap: "12px" }}>
                      <label className="d-flex align-items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!esc.NotifyEmail}
                          onChange={(e) => handleEscLevelChange(i, "NotifyEmail", e.target.checked)}
                        />
                        {t("Email")}
                      </label>
                      <label className="d-flex align-items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!esc.NotifySMS}
                          onChange={(e) => handleEscLevelChange(i, "NotifySMS", e.target.checked)}
                        />
                        {t("SMS")}
                      </label>
                      <label className="d-flex align-items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!esc.NotifyApp}
                          onChange={(e) => handleEscLevelChange(i, "NotifyApp", e.target.checked)}
                        />
                        {t("App")}
                      </label>
                      <span style={{ borderLeft: "1px solid #ccc", height: 16, margin: "0 4px" }} />
                      <Form.Check
                        type="switch"
                        id={`esc-active-${i}`}
                        checked={!!esc.IsActive}
                        label={esc.IsActive ? t("Active") : t("Inactive")}
                        onChange={(e) => handleEscLevelChange(i, "IsActive", e.target.checked)}
                        style={{ fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {escLevels.length < 3 && (
                <button
                  className="btn btn-sm mt-2"
                  style={{ fontSize: 12 }}
                  onClick={handleAddEscLevel}
                >
                  <i className="bi bi-plus-lg" />
                  {t("Add Level")}
                </button>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Field Config Modal */}
      {fieldCat && (
        <Modal
          visible={showFieldModal}
          setVisible={setShowFieldModal}
          Header={`${t("Field Config")} — ${fieldCat.CategoryName}`}
          modalWidth="460px"
          buttons={
            <>
              <SaveButton
                text={t("Save Config")}
                onClick={handleSaveFieldConfig}
                disabled={isFieldLoading}
              />
              <CancelButton text={t("Close")} onClick={() => setShowFieldModal(false)} />
            </>
          }
        >
          {isFieldLoading ? (
            <div className="text-center py-3">
              <span className="spinner-border spinner-border-sm" />
            </div>
          ) : (
            <table className="table table-sm table-bordered" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>{t("Field")}</th>
                  <th>{t("Rule")}</th>
                </tr>
              </thead>
              <tbody>
                {fieldConfig.map((fc) => (
                  <tr key={fc.FieldName}>
                    <td style={{ verticalAlign: "middle" }}>{fc.FieldName}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={fc.FieldRule}
                        onChange={(e) =>
                          handleFieldRuleChange(fc.FieldName, { value: e.target.value })
                        }
                      >
                        {FIELD_RULE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CategoryMaster;
