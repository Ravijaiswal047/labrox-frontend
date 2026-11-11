import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import Tables from "@components/UI/customTable";
import Input from "@components/formComponent/Input";
import Heading from "@components/UI/Heading";
import { SaveButton, CancelButton, EditButton, CustomButton } from "@components/UI/CustomButton";
import ColorCodingSearch from "@components/ModalComponent/ColorCodingSearch";
import { axiosInstance } from "@app/utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";

const RadioGroup = ({ label, name, value, onChange }) => (
  <div className="d-flex align-items-center flex-wrap" style={{ gap: "5px" }}>
    <label className="form-label fw-semibold mb-0" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
      {label}:
    </label>
    <div className="d-flex" style={{ gap: "12px" }}>
      {["LIS", "OWN"].map((opt) => (
        <div key={opt} className="form-check mb-0">
          <input
            className="form-check-input"
            type="radio"
            name={name}
            id={`${name}_${opt}`}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(name, opt)}
          />
          <label className="form-check-label" style={{ fontSize: 12 }} htmlFor={`${name}_${opt}`}>
            {opt}
          </label>
        </div>
      ))}
    </div>
  </div>
);

const lisLabel = (val) => (val === 1 ? "LIS" : "OWN");

const initialForm = {
  id: null,
  companyName: "",
  isActive: true,
  TestCode: "LIS",
  RateTypeCode: "LIS",
  CentreCode: "LIS",
};

const CompanyMasterTab = ({ companyList, fetchCompanies }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get") || "";

  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [keyModal, setKeyModal] = useState({ show: false, interfaceCompanyID: null, companyName: "" });
  const [keyForm, setKeyForm] = useState({ username: "", password: "" });
  const [keyResult, setKeyResult] = useState(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const openKeyModal = (item) => {
    setKeyModal({ show: true, interfaceCompanyID: item.ID, companyName: item.CompanyName ?? "" });
    setKeyForm({ username: "", password: "" });
    setKeyResult(null);
    setShowPassword(false);
  };

  const closeKeyModal = () => {
    setKeyModal({ show: false, interfaceCompanyID: null, companyName: "" });
    setKeyForm({ username: "", password: "" });
    setKeyResult(null);
    setShowPassword(false);
  };

  const handleViewKey = () => {
    if (!keyForm.username.trim()) { toast.warning(t("Enter username")); return; }
    if (!keyForm.password.trim()) { toast.warning(t("Enter password")); return; }
    setKeyLoading(true);
    setKeyResult(null);
    axiosInstance
      .post("ItemMasterInterface/GetInterfaceSecretKey", {
        interfaceCompanyID: keyModal.interfaceCompanyID,
        username: keyForm.username,
        password: keyForm.password,
      })
      .then((res) => {
        const data = res?.data?.message?.[0];
        if (data) {
          setKeyResult(data);
        } else {
          toast.error(res?.data?.message || t("No key found"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Invalid credentials")))
      .finally(() => setKeyLoading(false));
  };

  // ── derived ──────────────────────────────────────────────────────────────
  const counts = {
    active:   companyList.filter((i) => i.IsActive === 1).length,
    inactive: companyList.filter((i) => i.IsActive !== 1).length,
  };

  const filteredList = companyList.filter((i) => {
    if (statusFilter === "active")   return i.IsActive === 1;
    if (statusFilter === "inactive") return i.IsActive !== 1;
    return true;
  });

  const colorCoding = [
    { color: "#8ef58e66",             id: "active",   label: `Active (${counts.active})`     },
    { color: "rgba(255,182,193,0.6)", id: "inactive", label: `Inactive (${counts.inactive})` },
  ];

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadio = (name, val) => {
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleToggle = () => {
    setForm((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleEdit = (item) => {
    setForm({
      id: item.ID,
      companyName: item.CompanyName ?? "",
      isActive: item.IsActive === 1,
      TestCode:     item.IsLISTestCode    === 1 ? "LIS" : "OWN",
      RateTypeCode: item.IsLISRateTypeCode === 1 ? "LIS" : "OWN",
      CentreCode:   item.IsLISCentreCode  === 1 ? "LIS" : "OWN",
    });
  };

  const handleClear = () => setForm(initialForm);

  const handleSave = () => {
    if (!form.companyName.trim()) {
      toast.warning(t("Company name is required"));
      return;
    }
    const isEdit = form.id != null;
    const payload = {
      ...(isEdit && { id: form.id }),
      companyName:      form.companyName.trim(),
      isActive:         form.isActive ? 1 : 0,
      isLISTestCode:    form.TestCode    === "LIS" ? 1 : 0,
      isLISCentreCode:  form.CentreCode  === "LIS" ? 1 : 0,
      isLISRateTypeCode: form.RateTypeCode === "LIS" ? 1 : 0,
    };
    const endpoint = isEdit
      ? "ItemMasterInterface/UpdateInterfacemaster"
      : "ItemMasterInterface/SaveInterfaceMaster";

    setIsSaving(true);
    axiosInstance
      .post(endpoint, payload)
      .then((res) => {
        toast.success(res?.data?.message);
        fetchCompanies();
        handleClear();
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setIsSaving(false));
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-2">
      {/* ── Form ── */}
      <Heading title="Interface Company Master" />
      <div className="row px-2 py-2 align-items-center g-2">
        <div className="col-12 col-sm-6 col-md-2">
          <Input
            type="text"
            name="companyName"
            id="companyName"
            lable="Company Name"
            value={form.companyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-6 col-sm-4 col-md-auto d-flex align-items-center">
          <Form.Check
            type="switch"
            id="companyIsActive"
            label={t("Active")}
            checked={form.isActive}
            onChange={handleToggle}
          />
        </div>
        <div className="col-6 col-sm-4 col-md-auto">
          <RadioGroup label={t("Test Code")}      name="TestCode"     value={form.TestCode}     onChange={handleRadio} />
        </div>
        <div className="col-6 col-sm-4 col-md-auto">
          <RadioGroup label={t("Rate Type Code")} name="RateTypeCode" value={form.RateTypeCode} onChange={handleRadio} />
        </div>
        <div className="col-6 col-sm-4 col-md-auto">
          <RadioGroup label={t("Centre Code")}    name="CentreCode"   value={form.CentreCode}   onChange={handleRadio} />
        </div>
        <div className="col-12 col-sm-4 col-md-auto d-flex align-items-center" style={{ gap: "6px" }}>
          <SaveButton text={form.id ? "Update" : "Save"} onClick={handleSave} disabled={isSaving} />
          {form.id && <CancelButton text="Cancel" onClick={handleClear} />}
        </div>
      </div>

      {/* ── Table ── */}
      <Heading
        title="Search Data"
        secondTitle={
          <div className="d-flex align-items-center" style={{ gap: "12px" }}>
            {colorCoding.map(({ color, id, label }) => (
              <div
                key={id}
                className="cursor-pointer"
                onClick={() => setStatusFilter((prev) => (prev === id ? "all" : id))}
                style={{ opacity: statusFilter !== "all" && statusFilter !== id ? 0.45 : 1 }}
              >
                <ColorCodingSearch color={color} label={label} cursor="pointer" marginRight="5px" />
              </div>
            ))}
            <span
              className="cursor-pointer fw-semibold"
              style={{ fontSize: 12, color: "#051c68" }}
              onClick={() => setStatusFilter("all")}
            >
              {t("Total")} : {companyList.length}
            </span>
          </div>
        }
      />
      <Tables>
        <thead>
          <tr>
            <th>{t("S.No")}</th>
            <th>{t("Company Name")}</th>
            <th>{t("Test Code")}</th>
            <th>{t("Rate Type Code")}</th>
            <th>{t("Centre Code")}</th>
            <th>{t("Created By")}</th>
            <th>{t("Entry Date")}</th>
            <th>{t("Updated By")}</th>
            <th>{t("Update Date")}</th>
            <th>{t("Action")}</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-3 text-muted">{t("No Record Found")}</td>
            </tr>
          ) : (
            filteredList.map((item, idx) => (
              <tr
                key={item.ID ?? idx}
                style={{
                  backgroundColor: item.IsActive === 1
                    ? "#8ef58e66"
                    : "rgba(255,182,193,0.4)",
                }}
              >
                <td>{idx + 1}</td>
                <td>{item.CompanyName ?? ""}</td>
                <td>{lisLabel(item.IsLISTestCode)}</td>
                <td>{lisLabel(item.IsLISRateTypeCode)}</td>
                <td>{lisLabel(item.IsLISCentreCode)}</td>
                <td>{item.CreatedByName ?? ""}</td>
                <td>{item.dtEntry ?? ""}</td>
                <td>{item.UpdatedByName ?? ""}</td>
                <td>{item.dtUpdate ?? ""}</td>
                <td>
                  <EditButton text="Edit" onClick={() => handleEdit(item)} />
                  &nbsp;
                  <CustomButton icon="eye" text={t("View Key")} onClick={() => openKeyModal(item)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Tables>
      {keyModal.show && createPortal(
        <div
          onClick={closeKeyModal}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "kmFadeIn 0.18s ease",
          }}
        >
          <style>{`
            @keyframes kmFadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes kmSlideUp { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
            .km-input-wrap { position: relative; margin-bottom: 18px; }
            .km-input {
              width: 100%; border: none; border-bottom: 2px solid rgba(0,0,0,0.15);
              background: transparent; outline: none; font-size: 14px;
              padding: 10px 36px 6px 0; color: inherit;
              transition: border-color 0.2s;
            }
            .km-input:focus { border-bottom-color: var(--km-c, #6366f1); }
            .km-input::placeholder { color: transparent; }
            .km-label {
              position: absolute; left: 0; top: 10px;
              font-size: 13px; color: #9ca3af; pointer-events: none;
              transition: all 0.18s ease;
            }
            .km-input:focus ~ .km-label,
            .km-input:not(:placeholder-shown) ~ .km-label {
              top: -6px; font-size: 10px; color: var(--km-c, #6366f1); font-weight: 600; letter-spacing: 0.5px;
            }
            .km-eye { position:absolute; right:0; top:50%; transform:translateY(-50%); cursor:pointer; color:#9ca3af; font-size:16px; user-select:none; line-height:1; }
            .km-eye:hover { color: var(--km-c, #6366f1); }
            .km-btn-primary {
              width: 100%; padding: 10px 0; border-radius: 10px;
              background: var(--km-c, #6366f1);
              color: #fff; border: none; font-weight: 600;
              font-size: 13px; cursor: pointer; letter-spacing: 0.4px;
              transition: opacity 0.2s;
              display: flex; align-items: center; justify-content: center; gap: 8px;
            }
            .km-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
            .km-btn-primary:not(:disabled):hover { opacity: 0.88; }
            .km-btn-primary i { font-size: 14px; line-height: 1; display: inline-flex; align-items: center; }
            .km-header { background: var(--km-c, #6366f1); padding: 20px 24px 18px; position: relative; }
            .km-key-card { margin-top: 20px; border-radius: 12px; padding: 14px 16px; background: var(--km-c, #6366f1); border: 1px solid rgba(255,255,255,0.2); animation: kmSlideUp 0.2s ease; }
            .km-key-label { font-size: 10px; font-weight: 700; letter-spacing: 1.6px; color: rgba(255,255,255,0.8); text-transform: uppercase; }
            .km-copy-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 6px; color: #fff; font-size: 11px; padding: 2px 10px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
            .km-copy-btn:hover { background: rgba(255,255,255,0.32); }
            .km-key-value { font-family: monospace; font-size: 14px; font-weight: 700; color: #fff; letter-spacing: 0.8px; word-break: break-all; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.2); }
            .km-key-meta { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 16px; }
            .km-key-meta span { font-size: 11px; color: rgba(255,255,255,0.85); display: flex; align-items: center; gap: 4px; }
          `}</style>

          <div
            className={theme}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 460,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
              animation: "kmSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              background: "var(--bs-body-bg, #fff)",
            }}
          >
            {/* ── Header ── */}
            <div className="km-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>🔐</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                    {t("View Interface Secret Key")}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>
                    {keyModal.companyName}
                  </div>
                </div>
              </div>
              <button
                onClick={closeKeyModal}
                style={{
                  position: "absolute", top: 14, right: 16,
                  background: "rgba(255,255,255,0.15)", border: "none",
                  borderRadius: 8, width: 28, height: 28,
                  color: "#fff", fontSize: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: "24px 28px 20px" }}>

              {/* Username */}
              <div className="km-input-wrap">
                <input
                  className="km-input"
                  type="text"
                  placeholder=" "
                  value={keyForm.username}
                  onChange={(e) => setKeyForm((p) => ({ ...p, username: e.target.value }))}
                  autoComplete="new-password"
                />
                <label className="km-label">{t("Username")}</label>
              </div>

              {/* Password */}
              <div className="km-input-wrap">
                <input
                  className="km-input"
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={keyForm.password}
                  onChange={(e) => setKeyForm((p) => ({ ...p, password: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleViewKey(); }}
                  autoComplete="new-password"
                  style={{ paddingRight: 36 }}
                />
                <label className="km-label">{t("Password")}</label>
                <span className="km-eye" onClick={() => setShowPassword((p) => !p)}>
                  {showPassword
                    ? <i className="bi bi-eye-slash-fill mb-0" />
                    : <i className="bi bi-eye-fill mb-0" />
                  }
                </span>
              </div>

              {/* View Key button */}
              <button
                className="km-btn-primary"
                onClick={handleViewKey}
                disabled={keyLoading}
              >
                {keyLoading
                  ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} />{t("Verifying...")}</>
                  : <><i className="bi bi-key-fill mb-0" />{t("View Secret Key")}</>
                }
              </button>

              {/* Result card */}
              {keyResult && (
                <div className="km-key-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span className="km-key-label">🔑 {t("Secret Key")}</span>
                    <button
                      className="km-copy-btn"
                      onClick={() => {
                        navigator.clipboard?.writeText(keyResult.InterfaceSecretKey);
                        toast.success(t("Copied to clipboard"));
                      }}
                    >
                      <i className="bi bi-clipboard2-check mb-0" /> {t("Copy")}
                    </button>
                  </div>
                  <div className="km-key-value">{keyResult.InterfaceSecretKey}</div>
                  <div className="km-key-meta">
                    <span><i className="bi bi-calendar3 mb-0" /> {keyResult.dtEntry}</span>
                    <span><i className="bi bi-person-fill mb-0" /> {keyResult.CreatedByName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div style={{
              padding: "12px 28px 18px",
              display: "flex", justifyContent: "flex-end",
            }}>
              <button
                onClick={closeKeyModal}
                style={{
                  padding: "7px 20px", borderRadius: 8,
                  border: "1.5px solid #e5e7eb",
                  background: "transparent", color: "inherit",
                  fontSize: 13, cursor: "pointer", fontWeight: 500,
                }}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CompanyMasterTab;
