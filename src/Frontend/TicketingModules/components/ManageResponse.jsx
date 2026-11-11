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
import {
  SaveButton,
  CancelButton,
  EditButton,
  DeleteButton,
} from "@components/UI/CustomButton";

// 4. Utils
import { axiosInstance } from "@app/utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import ColorCodingSearch from "@components/formComponent/ColorCodingSearch";
import "../ticketing.css";

const colorCodingData = [
  { id: 1, color: "#d4edda", labelKey: "Active" },
  { id: 2, color: "#f8d7da", labelKey: "Inactive" },
];

const INITIAL_FORM = { response: "", id: 0, isActive: 1 };

const ManageResponse = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [form, setForm] = useState(INITIAL_FORM);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [activeFilter, setActiveFilter] = useState(null); // null=all, 1=active, 0=inactive

  const handleColorFilter = (statusValue) => {
    setActiveFilter((prev) => (prev === statusValue ? null : statusValue));
  };

  const filtered = responses.filter((r) => {
    const isActive = (r.IsActive === 1 || r.IsActive === true || r.IsActive === "true") ? 1 : 0;
    const matchesStatus = activeFilter === null || isActive === activeFilter;
    const matchesText = [r.SUBJECT, r.CreatedByName]
      .some((v) => String(v ?? "").toLowerCase().includes(filterText.toLowerCase()));
    return matchesStatus && matchesText;
  });

  // ── Load response list ───────────────────────────────────────
  useEffect(() => { loadResponses(); }, []);

  const loadResponses = () => {
    setIsLoading(true);
    axiosInstance
      .post("Ticketing/GetDataMaster", { type: "ResponseList", categoryId: 0, queryID: 0, responseID: 0, priorityID: 0, ticketID: 0 })
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        setResponses(data);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to load responses")))
      .finally(() => setIsLoading(false));
  };

  // ── Save / Update / Delete ───────────────────────────────────
  const handleSave = () => {
    if (!form.response.trim()) { toast.warning(t("Response is required")); return; }

    axiosInstance
      .post("Ticketing/SaveQuery", {
        transactionType: isEditMode ? "Update" : "Save",
        type: "Response",
        id: isEditMode ? form.id : 0,
        categoryID: 0,
        subject: form.response,
        detail: "",
        mainHead: "",
        isActive: form.isActive,
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Saved successfully"));
        handleClear();
        loadResponses();
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Save failed")));
  };

  const handleDelete = (row) => {
    axiosInstance
      .post("Ticketing/SaveQuery", {
        transactionType: "Delete",
        type: "Response",
        id: row.Id,
        categoryID: 0,
        subject: "",
        detail: "",
        mainHead: "",
        isActive: null,
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Deleted successfully"));
        loadResponses();
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Delete failed")));
  };

  const handleEdit = (row) => {
    const isActive = (row.IsActive === 1 || row.IsActive === true || row.IsActive === "true") ? 1 : 0;
    setForm({ response: row.SUBJECT, id: row.Id, isActive });
    setIsEditMode(true);
  };

  const handleClear = () => { setForm(INITIAL_FORM); setIsEditMode(false); };

  return (
    <div className={`${theme}`}>
      {/* Form */}
      <Accordion title={isEditMode ? "Edit Response" : "Add Response"} defaultValue={true}>
        <div className="row align-items-end p-2">
          <Input
            type="text" id="response" name="response"
            lable="Response *"
            value={form.response}
            onChange={(e) => setForm((p) => ({ ...p, response: e.target.value }))}
            respclass="col-md-6 col-12"
          />
          <div className="col-6 col-sm-6 col-md-auto my-1 d-flex align-items-center">
            <Form.Check
              type="switch"
              id="response-isActive"
              label={form.isActive ? t("Active") : t("Inactive")}
              checked={form.isActive === 1}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked ? 1 : 0 }))}
            />
          </div>
          <div className="col-6 col-sm-6 col-md-auto my-1 d-flex gap-1 align-items-center justify-content-end">
            <SaveButton text={isEditMode ? t("Update") : t("Save")} onClick={handleSave} />
            <CancelButton text={t("Clear")} onClick={handleClear} className="ml-1" />
          </div>
        </div>
      </Accordion>

      {/* Response List */}
      <Accordion
        title="Response List"
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div className="d-flex align-items-center" style={{ gap: "8px" }}>
            {colorCodingData.map(({ id, color, labelKey }) => {
              const statusValue = id === 1 ? 1 : 0;
              const isSelected = activeFilter === statusValue;
              return (
                <div
                  key={id}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleColorFilter(statusValue); }}
                  style={{
                    cursor: "pointer",
                    opacity: activeFilter !== null && !isSelected ? 0.4 : 1,
                    outline: isSelected ? `2px solid ${color}` : "none",
                    outlineOffset: "2px",
                    borderRadius: "4px",
                    padding: "0 2px",
                    transition: "opacity 0.2s, outline 0.2s",
                  }}
                >
                  <ColorCodingSearch color={color} label={t(labelKey)} cursor="pointer" />
                </div>
              );
            })}
            <input
              className="form-control form-control-sm"
              style={{ maxWidth: 180, height: 28 }}
              placeholder={t("Search...")}
              value={filterText}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        }
      >
        <div>
          {isLoading ? (
            <div className="text-center py-3"><span className="spinner-border spinner-border-sm" /></div>
          ) : (
            <Tables>
              <thead>
                <tr>
                  <th style={{ width: "4%" }}>{t("S.No")}</th>
                  <th>{t("Response")}</th>
                  <th>{t("Created By")}</th>
                  <th>{t("Created On")}</th>
                  <th>{t("Updated By")}</th>
                  <th>{t("Updated On")}</th>
                  <th style={{ width: "8%" }}>{t("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.Id} style={{ background: (row.IsActive === 1 || row.IsActive === true || row.IsActive === "true") ? "#d4edda" : "#f8d7da" }}>
                    <td>{i + 1}</td>
                    <td>{row.SUBJECT}</td>
                    <td>{row.CreatedByName}</td>
                    <td>{row.dtEntry}</td>
                    <td>{row.UpdatedByName}</td>
                    <td>{row.dtUpdate}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <EditButton onClick={() => handleEdit(row)} />
                        {/* <DeleteButton onClick={() => handleDelete(row)} className="ml-2" /> */}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-3">{t("No records found")}</td></tr>
                )}
              </tbody>
            </Tables>
          )}
        </div>
      </Accordion>
    </div>
  );
};

export default ManageResponse;
