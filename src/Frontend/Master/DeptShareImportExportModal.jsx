import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Modal from "@components/formComponent/Modal";
import Tables from "@components/UI/customTable";
import { CustomButton, SaveButton } from "@components/UI/CustomButton";
import ReactSelect from "@components/formComponent/ReactSelect";
import { axiosInstance } from "@app/utils/axiosInstance";
import { ExportToExcel } from "@app/utils/helpers";

const DeptShareImportExportModal = ({ visible, onClose, RateData = [], DoctorData = [] }) => {
  const { t } = useTranslation();

  const fileInputRef = useRef(null);
  const [filter, setFilter] = useState({ RateTypeID: "", DoctorID: "" });
  const [importedRows, setImportedRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (name, option) => {
    setFilter((prev) => ({ ...prev, [name]: option?.value ?? "" }));
  };

  const handleExport = () => {
    if (!filter.RateTypeID) { toast.warning(t("Please select Rate Type")); return; }
    setIsExporting(true);
    axiosInstance
      .post("DocShareMaster/getDepartmentDocData", {
        searchType: "1",
        DoctorID: String(filter.DoctorID) || "0",
        RateTypeID: String(filter.RateTypeID),
      })
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        if (!data.length) { toast.info(t("No data to export")); return; }
        ExportToExcel(data, "DeptShare.xlsx");
        toast.success(t("Exported successfully"));
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Export failed")))
      .finally(() => setIsExporting(false));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setImportedRows(rows);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleSave = () => {
    if (!importedRows.length) { toast.warning(t("No data to save")); return; }
    if (!filter.RateTypeID) { toast.warning(t("Please select Rate Type")); return; }
    setIsSaving(true);
    const payload = importedRows.map((r) => ({
      rateTypeID: String(filter.RateTypeID),
      doctorID: String(filter.DoctorID || "0"),
      departmentID: Number(r.DepartmentID ?? r.departmentID ?? 0),
      department: String(r.Department ?? r.department ?? ""),
      docSharePer: Number(r.DocSharePer ?? r.docSharePer ?? 0),
    }));
    axiosInstance
      .post("DocShareMaster/ImportDefaultDeptShareAsync", payload)
      .then((res) => {
        toast.success(res?.data?.message || t("Saved successfully"));
        setImportedRows([]);
        onClose();
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setIsSaving(false));
  };

  const handleClose = () => {
    setImportedRows([]);
    setFilter({ RateTypeID: "", DoctorID: "" });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      setVisible={handleClose}
      Header={t("Import / Export Department Share")}
      modalWidth="860px"
    >
      {/* Filters + Export + Import trigger */}
      <div className="row align-items-start mb-3 g-2 mt-3">
        <div className="col-md-3 col-6">
          <ReactSelect
            id="deptModalRateType"
            name="RateTypeID"
            placeholderName="Rate Type"
            dynamicOptions={RateData}
            value={filter.RateTypeID}
            onChange={handleFilterChange}
            respclass=""
          />
        </div>
        <div className="col-md-3 col-6">
          <ReactSelect
            id="deptModalDoctor"
            name="DoctorID"
            placeholderName="Doctor"
            dynamicOptions={DoctorData}
            value={filter.DoctorID}
            onChange={handleFilterChange}
            respclass=""
          />
        </div>
        <div className="col-auto">
          <CustomButton
            text={isExporting ? t("Exporting...") : t("Export")}
            icon="excel"
            onClick={handleExport}
            disabled={isExporting}
          />
        </div>
        <div className="col-auto">
          <CustomButton
            text={t("Import File")}
            icon="upload"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Preview table after file import */}
      {importedRows.length > 0 && (
        <>
          <p className="mb-2" style={{ fontSize: 12, color: "#6b7280" }}>
            {t("Rate Type ID")} & {t("Doctor ID")} {t("will be applied from the selected dropdowns to all rows on save.")}
          </p>
          <Tables>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("Department ID")}</th>
                <th>{t("Department")}</th>
                <th>{t("Doc Share %")}</th>
              </tr>
            </thead>
            <tbody>
              {importedRows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.DepartmentID ?? r.departmentID}</td>
                  <td>{r.Department ?? r.department}</td>
                  <td>{r.DocSharePer ?? r.docSharePer}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
          <div className="mt-3 d-flex justify-content-end">
            <SaveButton text="Save" onClick={handleSave} disabled={isSaving} />
          </div>
        </>
      )}
    </Modal>
  );
};

export default DeptShareImportExportModal;
