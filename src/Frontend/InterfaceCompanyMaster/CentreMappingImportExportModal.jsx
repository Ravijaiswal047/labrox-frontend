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

const CentreMappingImportExportModal = ({ visible, onClose, interfaceOptions, centreOptions }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    InterfaceCompanyID: "",
    Interface_companyName: "",
    CentreID: "",
  });

  const [importedRows, setImportedRows] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInterfaceSelect = (name, option) => {
    setForm((prev) => ({
      ...prev,
      InterfaceCompanyID: option?.value ?? "",
      Interface_companyName: option?.label ?? "",
    }));
  };

  const handleCentreSelect = (name, option) => {
    setForm((prev) => ({ ...prev, CentreID: option?.value ?? "" }));
  };

  const handleExport = () => {
    if (!form.InterfaceCompanyID) {
      toast.warning(t("Please select an Interface Company"));
      return;
    }
    setIsExporting(true);
    axiosInstance
      .post("ItemMasterInterface/ExportCentreMappingAsync", {
        interfaceCompanyID: Number(form.InterfaceCompanyID) || 0,
        interfaceCompanyName: form.Interface_companyName || "",
        centreId: Number(form.CentreID) || 0,
      })
      .then((res) => {
        const data = res?.data?.message ?? [];
        if (!data.length) {
          toast.info(t("No data to export"));
          return;
        }
        const rows = data.map((item, i) => ({
          "Sr.No": i + 1,
          CentreID: item.CentreID ?? "",
          CentreName: item.CentreName ?? "",
          Interface_companyID: item.Interface_companyID ?? "",
          Interface_companyName: item.Interface_companyName ?? "",
          CentreID_interface: item.CentreID_interface ?? "",
          Interface_CentreName: item.Interface_CentreName ?? "",
        }));
        const fileName = `CentreMapping_${(form.Interface_companyName || "Export").replace(/[^a-zA-Z0-9-]/g, "_")}.xlsx`;
        exportToExcel(rows, fileName);
        toast.success(t("File downloaded successfully"));
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Export failed")))
      .finally(() => setIsExporting(false));
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!rows.length) { toast.info(t("No data found in file")); return; }
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

    setIsSaving(true);
    axiosInstance
      .post("ItemMasterInterface/ImportCentreMasterInterface", {
        interfaceCompanyID: Number(form.InterfaceCompanyID) || 0,
        interfaceCompanyName: form.Interface_companyName || "",
        centreID: Number(form.CentreID) || 0,
        centreData: importedRows.map((r) => ({
          centreIDInterface: Number(r.CentreID_interface) || 0,
          centreID: Number(r.CentreID) || 0,
          interfaceCentreName: r.Interface_CentreName ?? "",
        })),
      })
      .then((res) => {
        if (res?.data?.success) {
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
    setForm({ InterfaceCompanyID: "", Interface_companyName: "", CentreID: "" });
    setImportedRows([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      setVisible={handleClose}
      Header={t("Centre Mapping — Import / Export")}
      modalWidth="80vw"
      buttons={
        <div className="d-flex" style={{ gap: "6px" }}>
          <SaveButton text="Save" onClick={handleSave} disabled={isSaving || !importedRows.length} />
          <CancelButton text="Close" onClick={handleClose} />
        </div>
      }
    >
      <div className="p-2">
        <div className="row mb-3">
          <ReactSelect
            id="cmIEInterfaceCompany"
            name="InterfaceCompany"
            placeholderName="Interface Company"
            dynamicOptions={interfaceOptions}
            value={form.InterfaceCompanyID}
            onChange={handleInterfaceSelect}
            respclass="col-md-3 col-6"
          />
          <ReactSelect
            id="cmIECentre"
            name="CentreID"
            placeholderName="Centre"
            dynamicOptions={centreOptions}
            value={form.CentreID}
            onChange={handleCentreSelect}
            respclass="col-md-3 col-6"
          />
          <div className="col-md-5 col-12 d-flex align-items-start" style={{ gap: "5px" }}>
            <CustomButton text="Export" icon="excel" onClick={handleExport} disabled={isExporting} />
            <CustomButton text="Import Excel" icon="upload" onClick={handleImportClick} />
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {importedRows.length > 0 && (
          <>
            <h6 className="mb-2">{t("Import Preview")} ({importedRows.length} {t("rows")})</h6>
            <Tables>
              <thead>
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Centre ID")}</th>
                  <th>{t("Centre Name")}</th>
                  <th>{t("Interface Company ID")}</th>
                  <th>{t("Interface Company Name")}</th>
                  <th>{t("Centre ID Interface")}</th>
                  <th>{t("Interface Centre Name")}</th>
                </tr>
              </thead>
              <tbody>
                {importedRows.map((row, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{row.CentreID ?? ""}</td>
                    <td>{row.CentreName ?? ""}</td>
                    <td>{row.Interface_companyID ?? ""}</td>
                    <td>{row.Interface_companyName ?? ""}</td>
                    <td>{row.CentreID_interface ?? ""}</td>
                    <td>{row.Interface_CentreName ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CentreMappingImportExportModal;
