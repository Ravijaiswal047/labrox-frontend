import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { ExportToExcel } from "../../utils/helpers";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import "./ImportExcelModal.css";

const ImportExcelCentreShareModal = ({
  open,
  onClose,
  CentreData,
  CentreID,
  setTemplateData,
  templateData = [],
}) => {
  const fileInputRef = useRef(null);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const { t } = useTranslation();

  const [load, setLoad] = useState({ download: false, upload: false, save: false });
  const [excelPayload, setExcelPayload] = useState({ centreID: CentreID || 0 });

  useEffect(() => {
    setExcelPayload((prev) => ({ ...prev, centreID: CentreID || 0 }));
  }, [CentreID, open]);

  const handleSelect = (name, value) => {
    setExcelPayload((prev) => ({ ...prev, [name]: value.value }));
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const downloadExcel = () => {
    if (!excelPayload.centreID || excelPayload.centreID === 0) {
      toast.warning("Please select a Centre before downloading the template.");
      return;
    }
    setLoad((prev) => ({ ...prev, download: true }));
    axiosInstance
      .get(`CentreShare/GetCentreShareDownload?CentreID=${excelPayload.centreID}`)
      .then((res) => {
        const data = res.data.message;
        const formattedData = data.map((item, index) => {
          const newItem = { "Sr.No": index + 1 };
          Object.keys(item).forEach((key) => {
            newItem[key.charAt(0).toUpperCase() + key.slice(1)] = item[key];
          });
          return newItem;
        });

        const selectedCentre =
          CentreData?.find((c) => c.value === excelPayload.centreID)?.label || "Centre";
        let fileName = selectedCentre.substring(0, 15).replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").replace(/-+/g, "-");
        ExportToExcel(formattedData, `${fileName}_CentreShare.xlsx`);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoad((prev) => ({ ...prev, download: false })));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoad((prev) => ({ ...prev, upload: true }));
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        jsonData = jsonData.map((row) => {
          const updatedRow = {};
          Object.keys(row).forEach((key) => {
            const value = row[key];
            updatedRow[key] = typeof value === "number" ? Number(value.toFixed(2)) : value;
          });
          return updatedRow;
        });

        if (jsonData.length === 0) {
          toast.error("The uploaded file is empty.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        setTemplateData(jsonData);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error(error);
        toast.error("Error reading file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setLoad((prev) => ({ ...prev, upload: false }));
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImportSave = () => {
    if (templateData.length === 0) return;
    if (!excelPayload.centreID || excelPayload.centreID === 0) {
      toast.warning("Please select a Centre before saving.");
      return;
    }

    const payload = templateData.map((item) => ({
      centreID: Number(excelPayload.centreID || 0),
      testName: item["TestName"] || "",
      testCode: item["TestCode"] || "",
      shareAmount: Number(item["ShareAmount"] || 0),
      sharePer: Number(item["SharePer"] || 0),
    }));

    setLoad((prev) => ({ ...prev, save: true }));
    axiosInstance
      .post("CentreShare/ImportCentreShare", payload)
      .then((res) => {
        if (res?.data?.isSuccess || res?.data?.success) {
          toast.success(res?.data?.message || "Saved successfully.");
          onClose();
        } else {
          toast.error(res?.data?.message || "Failed.");
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Something went wrong."))
      .finally(() => setLoad((prev) => ({ ...prev, save: false })));
  };

  return (
    <Dialog
      header={t("Import Centre Share Excel")}
      visible={open}
      onHide={onClose}
      className={theme}
      style={{ width: isMobile ? "90vw" : "60vw" }}
      breakpoints={{ "98%": "59vw" }}
    >
      <div className="row col-12 pt-2 pl-2 pr-2 mb-2">
        <div className="col-12 col-sm-3 col-md-3">
          <ReactSelect
            label={t("Centre")}
            placeholderName={t("Centre")}
            name="centreID"
            value={excelPayload.centreID}
            onChange={handleSelect}
            dynamicOptions={CentreData}
            removeIsClearable={true}
          />
        </div>

        <div className="col-auto">
          <CustomButton
            text={t("Download Template")}
            icon="download"
            onClick={downloadExcel}
            loading={load.download}
            disabled={load.download}
          />
        </div>

        <div className="col-auto">
          <CustomButton
            text={t("Upload Excel")}
            icon="excel"
            onClick={handleUploadClick}
            loading={load.upload}
            disabled={load.upload}
          />
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {templateData.length > 0 && (
        <div className="row p-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  {Object.keys(templateData[0]).map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templateData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.keys(row).map((key, colIndex) => (
                      <td
                        data-title={key}
                        key={colIndex}
                        className={key === "TestName" ? "test-name-cell" : ""}
                      >
                        {key === "TestName" ? (
                          <span
                            className="truncate-text"
                            onMouseEnter={(e) => {
                              const el = e.target;
                              el.title = el.scrollWidth > el.clientWidth ? row[key] : "";
                            }}
                          >
                            {row[key]}
                          </span>
                        ) : (
                          row[key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
          <div className="col-12 mt-2 d-flex justify-content-end">
            {load.save ? (
              <Loading />
            ) : (
              <SaveButton
                text={t("Save Data")}
                onClick={handleImportSave}
                disabled={load.download || load.upload}
              />
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default ImportExcelCentreShareModal;
