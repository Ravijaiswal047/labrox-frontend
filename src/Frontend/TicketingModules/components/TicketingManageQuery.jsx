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
import TextAreaInput from "@components/formComponent/TextAreaInput";
import ReactSelect from "@components/formComponent/ReactSelect";
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

const INITIAL_FORM = { categoryID: "", query: "", detail: "", id: 0, isActive: 1 };

const TicketingManageQuery = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [form, setForm] = useState(INITIAL_FORM);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [queries, setQueries] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [activeFilter, setActiveFilter] = useState(null); // null=all, 1=active, 0=inactive

  const handleColorFilter = (statusValue) => {
    setActiveFilter((prev) => (prev === statusValue ? null : statusValue));
  };

  const filtered = queries.filter((r) => {
    const isActive = (r.IsActive === 1 || r.IsActive === true || r.IsActive === "true") ? 1 : 0;
    const matchesStatus = activeFilter === null || isActive === activeFilter;
    const matchesText = [r.CategoryName, r.SUBJECT, r.Detail, r.CreatedByName]
      .some((v) => String(v ?? "").toLowerCase().includes(filterText.toLowerCase()));
    return matchesStatus && matchesText;
  });

  // ── Load categories + query list ─────────────────────────────
  useEffect(() => {
    loadCategories();
    loadQueries();
  }, []);

  const loadCategories = () => {
    axiosInstance
      .post("Ticketing/GetDataMaster", { type: "Category", categoryId: 0, queryID: 0, responseID: 0, priorityID: 0, ticketID: 0 })
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        setCategories(data.map((c) => ({ label: c.CategoryName, value: String(c.ID) })));
      })
      .catch(() => { });
  };

  const loadQueries = () => {
    setIsLoading(true);
    axiosInstance
      .post("Ticketing/GetDataMaster", { type: "QueryList", categoryId: 0, queryID: 0, responseID: 0, priorityID: 0, ticketID: 0 })
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        setQueries(data);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to load queries")))
      .finally(() => setIsLoading(false));
  };

  // ── Save / Update / Delete ───────────────────────────────────
  const handleSave = () => {
    if (!form.categoryID) { toast.warning(t("Category is required")); return; }
    if (!form.query.trim()) { toast.warning(t("Query is required")); return; }
    if (!form.detail.trim()) { toast.warning(t("Detail is required")); return; }

    axiosInstance
      .post("Ticketing/SaveQuery", {
        transactionType: isEditMode ? "Update" : "Save",
        type: "Query",
        id: isEditMode ? form.id : 0,
        categoryID: Number(form.categoryID),
        subject: form.query,
        detail: form.detail,
        mainHead: "",
        isActive: form.isActive,
      })
      .then((res) => {
        toast.success(res?.data?.message || t("Saved successfully"));
        handleClear();
        loadQueries();
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Save failed")));
  };

  // const handleDelete = (row) => {
  //   axiosInstance
  //     .post("Ticketing/SaveQuery", {
  //       transactionType: "Delete",
  //       type: "Query",
  //       id: row.Id,
  //       categoryID: 0,
  //       subject: "",
  //       detail: "",
  //       mainHead: "",
  //       isActive: null,
  //     })
  //     .then((res) => {
  //       toast.success(res?.data?.message || t("Deleted successfully"));
  //       loadQueries();
  //     })
  //     .catch((err) => toast.error(err?.response?.data?.message || t("Delete failed")));
  // };

  const handleEdit = (row) => {
    const isActive = (row.IsActive === 1 || row.IsActive === true || row.IsActive === "true") ? 1 : 0;
    setForm({ categoryID: String(row.CategoryID), query: row.SUBJECT, detail: row.Detail, id: row.Id, isActive });
    setIsEditMode(true);
  };

  const handleClear = () => { setForm(INITIAL_FORM); setIsEditMode(false); };

  return (
    <div className={`${theme}`}>
      {/* Form */}
      <Accordion title={isEditMode ? "Edit Query" : "Add Query"} defaultValue={true}>
        <div className="row align-items-centre">
          <div className="col-12 col-sm-6 col-md-2 my-1">
              <ReactSelect
            id="category" name="categoryID"
            placeholderName="Category *"
            value={form.categoryID}
            dynamicOptions={categories}
            onChange={(_, opt) => setForm((p) => ({ ...p, categoryID: opt?.value ?? "" }))}
           
          />
          </div>
           <div className="col-12 col-sm-6 col-md-2 my-1">
             <Input
            type="text" id="query" name="query"
            lable="Query *"
            value={form.query}
            onChange={(e) => setForm((p) => ({ ...p, query: e.target.value }))}
            
          />
           </div>
         
          <div className="col-md-auto col-6 d-flex align-items-centre pb-1">
            <Form.Check
              type="switch"
              id="query-isActive"
              label={form.isActive ? t("Active") : t("Inactive")}
              checked={form.isActive === 1}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked ? 1 : 0 }))}
            />
          </div>
          <TextAreaInput
            id="detail" name="detail"
            lable="Detail *"
            value={form.detail}
            rows={2}
            onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))}
            respclass="col-md-4 col-12"
          />

          <div className="col-12 col-sm-6 col-md-2 my-1 d-flex gap-1 align-items-centre pb-1">
            <SaveButton text={isEditMode ? t("Update") : t("Save")} onClick={handleSave} />
            <CancelButton text={t("Clear")} onClick={handleClear} className="ml-2" />
          </div>
        </div>
      </Accordion>

      {/* Query List */}
      <Accordion
        title="Query List"
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
                  <th>{t("Category")}</th>
                  <th>{t("Query")}</th>
                  <th>{t("Detail")}</th>
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
                    <td>{row.CategoryName}</td>
                    <td>{row.SUBJECT}</td>
                    <td style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.Detail}
                    </td>
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
                  <tr><td colSpan={9} className="text-center text-muted py-3">{t("No records found")}</td></tr>
                )}
              </tbody>
            </Tables>
          )}
        </div>
      </Accordion>
    </div>
  );
};

export default TicketingManageQuery;
