import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Modal from "@components/formComponent/Modal";
import ReactSelect from "@components/formComponent/ReactSelect";
import Tables from "@components/UI/customTable";
import { CustomButton, SaveButton, CancelButton } from "@components/UI/CustomButton";
import { axiosInstance } from "@app/utils/axiosInstance";

const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};

const ImportExportModal = ({ visible, onClose, interfaceOptions, departmentOptions }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    InterfaceCompanyID: "",
    Interface_companyName: "",
    DepartmentId: 0,
  });

  const [importedRows, setImportedRows] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleInterfaceSelect = (name, option) => {
    setForm((prev) => ({
      ...prev,
      InterfaceCompanyID: option?.value ?? "",
      Interface_companyName: option?.label ?? "",
    }));
  };

  const handleDeptSelect = (name, option) => {
    setForm((prev) => ({ ...prev, DepartmentId: option?.value ?? 0 }));
  };

  const handleExport = () => {
    if (!form.InterfaceCompanyID) {
      toast.warning(t("Please select an Interface Company"));
      return;
    }
    setIsExporting(true);
    axiosInstance
      .post("ItemMasterInterface/ExportItemMappingInterface", {
        InterfaceCompanyID: form.InterfaceCompanyID || 0,
        Interface_companyName: form.Interface_companyName || "",
        DepartmentId: form.DepartmentId || 0,
      })
      .then((res) => {
        const data = res?.data?.message ?? [];
        if (!data.length) {
          toast.info(t("No data to export"));
          return;
        }
        const rows = data.map((item, i) => {
          const row = { "Sr.No": i + 1 };
          Object.keys(item).forEach((key) => {
            row[key.charAt(0).toUpperCase() + key.slice(1)] = item[key];
          });
          return row;
        });
        const fileName = `ItemMapping_${(form.Interface_companyName || "Export").replace(/[^a-zA-Z0-9-]/g, "_")}.xlsx`;
        exportToExcel(rows, fileName);
        toast.success(t("File downloaded successfully"));
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Export failed")))
      .finally(() => setIsExporting(false));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!rows.length) {
          toast.info(t("No data found in file"));
          return;
        }

        setImportedRows(rows);
        toast.success(`${rows.length} ${t("rows loaded — review and click Save")}`);
      } catch {
        toast.error(t("Failed to read file"));
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleSave = () => {
    if (!importedRows.length) {
      toast.warning(t("No data to save. Import a file first."));
      return;
    }
    const firstRow = importedRows[0];
    const payload = {
        interface_companyID: form.InterfaceCompanyID || firstRow?.Interface_companyID || 0,
        interface_companyName: form.Interface_companyName || firstRow?.Interface_companyName || "",
        itemdata: importedRows.map((r) => ({
          itemID: Number(r.ItemID) || 0,
          testCode: r.TestCode ?? "",
          itemID_interface: r.ItemID_interface !== "" && r.ItemID_interface != null ? Number(r.ItemID_interface) : null,
          itemName_interface: r.ItemName_interface ?? "",
        })),
    };
    setIsSaving(true);
    axiosInstance
      .post("ItemMasterInterface/ImportItemMasterInterface", payload)
      .then((res) => {
        if(res?.data?.success){
          toast.success(res?.data?.message);
          setImportedRows([]);
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setIsSaving(false));
  };

  const handleClose = () => {
    setForm({ InterfaceCompanyID: "", Interface_companyName: "", DepartmentId: 0 });
    setImportedRows([]);
    onClose();
  };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      setVisible={handleClose}
      Header={t("Import / Export")}
      modalWidth="80vw"
      buttons={
        <div className="d-flex" style={{ gap: "6px" }}>
          <SaveButton text="Save" onClick={handleSave} disabled={isSaving || !importedRows.length} />
          <CancelButton text="Close" onClick={handleClose} />
        </div>
      }
    >
      <div className="p-2">
        {/* ── Filters + action buttons ── */}
        <div className="row mb-3">
          <ReactSelect
            id="impExpInterfaceCompany"
            name="InterfaceCompany"
            placeholderName="Interface Company"
            dynamicOptions={interfaceOptions}
            value={form.InterfaceCompanyID}
            onChange={handleInterfaceSelect}
            respclass="col-md-3 col-6"
          />
          <ReactSelect
            id="impExpDepartment"
            name="DepartmentId"
            placeholderName="Department"
            dynamicOptions={[{label: "All Department", value: 0}, ...departmentOptions]}
            value={form.DepartmentId}
            onChange={handleDeptSelect}
            respclass="col-md-3 col-6"
          />
          <div className="col-md-5 col-12 d-flex align-items-start" style={{ gap: "5px" }}>
            <CustomButton
              text="Export"
              icon="excel"
              onClick={handleExport}
              disabled={isExporting}
            />
            <CustomButton
              text="Import Excel"
              icon="upload"
              onClick={handleImportClick}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* ── Import preview table ── */}
        {importedRows.length > 0 && (() => {
          const cols = Object.keys(importedRows[0]).filter((c) => c !== "Sr.No");
          return (
            <>
              <h6 className="mb-2">{t("Import Preview")} ({importedRows.length} {t("rows")})</h6>
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    {cols.map((c) => (
                      <th key={c} style={c === "TestName" ? { minWidth: 200 } : undefined}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importedRows.map((row, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      {cols.map((c) => (
                        <td
                          key={c}
                          style={c === "TestName" ? { minWidth: 200, whiteSpace: "normal", wordBreak: "break-word" } : undefined}
                        >
                          {row[c] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </>
          );
        })()}
      </div>
    </Modal>
  );
};

export default ImportExportModal;
