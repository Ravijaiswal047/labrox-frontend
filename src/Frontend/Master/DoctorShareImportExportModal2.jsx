import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Modal from "@components/formComponent/Modal";
import Tables from "@components/UI/customTable";
import { CustomButton, SaveButton } from "@components/UI/CustomButton";
import { axiosInstance } from "@app/utils/axiosInstance";
import { ExportToExcel } from "@app/utils/helpers";

const DoctorShareImportExportModal2 = ({
  visible,
  onClose,
  tab = "Department",
  shareMode = "master",
  doctorID = "0",
  departmentID = "0",
  rateTypeID = "0",
  rateTypeName = "STANDARD",
  onSaved,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [importedRows, setImportedRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isItemTab = tab === "Item";

  const handleExport = () => {
    if (!rateTypeID || rateTypeID === "0") {
      toast.warning(t("Please save Rate Type in Configuration first"));
      return;
    }
    if (shareMode === "doctor" && (!doctorID || doctorID === "0")) {
      toast.warning(t("Please select Doctor"));
      return;
    }
    if (isItemTab && (!departmentID || departmentID === "0")) {
      toast.warning(t("Please select Department"));
      return;
    }

    setIsExporting(true);
    const request = isItemTab
      ? axiosInstance.post("DoctorShareMaster2/GetItemShare", {
          DoctorID: String(doctorID || "0"),
          DepartmentID: String(departmentID || "0"),
          RateTypeID: String(rateTypeID || "0"),
          CentreID: "0",
          ItemID: "0",
          BillingCategoryID: "0",
        })
      : axiosInstance.post("DoctorShareMaster2/GetDepartmentShare", {
          searchType: "1",
          DoctorID: String(doctorID || "0"),
          RateTypeID: String(rateTypeID || "0"),
          CentreID: "0",
          DepartmentID: "0",
        });

    request
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        if (!data.length) {
          toast.info(t("No data to export"));
          return;
        }
        const exportRows = isItemTab
          ? data.map((r, i) => ({
              SNo: i + 1,
              InvestigationID: r.investigationID ?? r.InvestigationID,
              TestCode: r.testCode ?? r.TestCode,
              Item: r.investigationName ?? r.InvestigationName,
              Rate: r.rate ?? r.Rate,
              Amount: r.docShareAmt ?? r.DocShareAmt,
              Percentage: r.docSharePer ?? r.DocSharePer,
              DepartmentID: r.departmentID ?? r.DepartmentID,
            }))
          : data.map((r, i) => ({
              SNo: i + 1,
              DepartmentID: r.departmentID ?? r.DepartmentID,
              Department: r.department ?? r.Department,
              Percentage: r.docSharePer ?? r.DocSharePer,
            }));
        const fileName = isItemTab
          ? `DoctorShare_Item_${rateTypeName}.xlsx`
          : `DoctorShare_Department_${rateTypeName}.xlsx`;
        ExportToExcel(exportRows, fileName);
        toast.success(t("Exported successfully"));
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Export failed")),
      )
      .finally(() => setIsExporting(false));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(new Uint8Array(evt.target.result), {
        type: "array",
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setImportedRows(rows);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleSave = () => {
    if (!importedRows.length) {
      toast.warning(t("No data to save"));
      return;
    }
    if (!rateTypeID || rateTypeID === "0") {
      toast.warning(t("Please save Rate Type in Configuration first"));
      return;
    }
    setIsSaving(true);

    const request = isItemTab
      ? axiosInstance.post(
          "DoctorShareMaster2/ImportItemShare",
          importedRows.map((r) => ({
            investigationID: Number(
              r.InvestigationID ?? r.investigationID ?? 0,
            ),
            testCode: String(r.TestCode ?? r.testCode ?? ""),
            investigationName: String(r.Item ?? r.InvestigationName ?? ""),
            rate: Number(r.Rate ?? r.rate ?? 0),
            docShareAmt: Number(r.Amount ?? r.DocShareAmt ?? r.docShareAmt ?? 0),
            docSharePer: Number(
              r.Percentage ?? r.DocSharePer ?? r.docSharePer ?? 0,
            ),
            doctorID: String(doctorID || "0"),
            departmentID: String(
              r.DepartmentID ?? r.departmentID ?? departmentID ?? "0",
            ),
            rateTypeID: String(rateTypeID || "0"),
            centreID: "0",
          })),
        )
      : axiosInstance.post("DoctorShareMaster2/ImportDepartmentShare", {
          doctorID: String(doctorID || "0"),
          rateTypeID: String(rateTypeID || "0"),
          data: importedRows.map((r) => ({
            departmentID: Number(r.DepartmentID ?? r.departmentID ?? 0),
            department: String(r.Department ?? r.department ?? ""),
            docSharePer: Number(
              r.Percentage ?? r.DocSharePer ?? r.docSharePer ?? 0,
            ),
          })),
        });

    request
      .then((res) => {
        toast.success(res?.data?.message || t("Saved successfully"));
        setImportedRows([]);
        onSaved?.();
        onClose();
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setIsSaving(false));
  };

  const handleClose = () => {
    setImportedRows([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      setVisible={handleClose}
      Header={
        isItemTab
          ? t("Import / Export Item Share")
          : t("Import / Export Department Share")
      }
      modalWidth="900px"
    >
      <div className="row align-items-start mb-3 g-2 mt-3">
        <div className="col-auto">
          <CustomButton
            text={isExporting ? t("Exporting...") : t("Export Excel")}
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

      {importedRows.length > 0 && (
        <>
          <p className="mb-2" style={{ fontSize: 12, color: "#6b7280" }}>
            {importedRows.length} {t("rows loaded. Review and click Save.")}
          </p>
          <Tables style={{ maxHeight: "360px", overflowY: "auto" }}>
            <thead>
              <tr>
                <th>#</th>
                {isItemTab ? (
                  <>
                    <th>{t("Test Code")}</th>
                    <th>{t("Item")}</th>
                    <th>{t("Rate")}</th>
                    <th>{t("Amount")}</th>
                    <th>{t("Percentage %")}</th>
                  </>
                ) : (
                  <>
                    <th>{t("Department ID")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Percentage %")}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {importedRows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  {isItemTab ? (
                    <>
                      <td>{r.TestCode ?? r.testCode}</td>
                      <td>{r.Item ?? r.InvestigationName}</td>
                      <td>{r.Rate ?? r.rate}</td>
                      <td>{r.Amount ?? r.DocShareAmt ?? r.docShareAmt}</td>
                      <td>
                        {r.Percentage ?? r.DocSharePer ?? r.docSharePer}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{r.DepartmentID ?? r.departmentID}</td>
                      <td>{r.Department ?? r.department}</td>
                      <td>
                        {r.Percentage ?? r.DocSharePer ?? r.docSharePer}
                      </td>
                    </>
                  )}
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

export default DoctorShareImportExportModal2;
