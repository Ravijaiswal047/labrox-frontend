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

const ImportExcelModal = ({
  open,
  onClose,
  RateTypeData,
  RateTypeID,
  setTemplateData,
  templateData=[],
}) => {
  const fileInputRef = useRef(null);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const [load, setLoad] = useState({
    download: false,
    upload: false,
    save: false,
  });
  
  const { t } = useTranslation();

  const [excelPayload, setExcelPayload] = useState({
    rateID: RateTypeID || 0,
  });

  useEffect(() => {
    setExcelPayload((prev) => ({ ...prev, rateID: RateTypeID || 0 }));
  }, [RateTypeID, open]);

  const handleSelect = (name, value) => {
    setExcelPayload((prev) => ({ ...prev, [name]: value.value }));
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const downloadExcel = () => {
    if (excelPayload.rateID === 0) {
      toast.warning(
        "Please select a Rate Type before downloading the template.",
      );
      return;
    }
    setLoad((prev) => ({ ...prev, download: true }));
    axiosInstance
      .post("RateTypeShare/GetRateTypeDownloadTemplete", {
        rateTypeID: excelPayload.rateID || 0,
      })
      .then((res) => {
        let data = res.data.message;
        const formattedData = data.map((item, index) => {
          let newItem = {};

          newItem["Sr.No"] = index + 1;

          // Convert keys with first letter capital
          Object.keys(item).forEach((key) => {
            const capitalizedKey =
              key.charAt(0).toUpperCase() + key.slice(1);

            newItem[capitalizedKey] = item[key];
          });

          return newItem;
        });
        const selectedRate = RateTypeData?.find(
          (r) => r.value === excelPayload.rateID
        )?.label || "RateType";

        // 👉 Take first 15 chars
        let fileName = selectedRate.substring(0, 15);

        // Replace spaces with dash
        fileName = fileName.replace(/\s+/g, "-");

        // Remove special characters (except dash)
        fileName = fileName.replace(/[^a-zA-Z0-9-]/g, "");

        // Remove multiple dashes
        fileName = fileName.replace(/-+/g, "-");

        fileName = `${fileName}.xlsx`;
        ExportToExcel(formattedData, fileName);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoad((prev) => ({ ...prev, download: false }));
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoad((prev) => ({ ...prev, upload: true }));
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target.result;

        const workbook = XLSX.read(new Uint8Array(data), {
          type: "array",
        });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        let jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

      // Fix floating point precision issue
        jsonData = jsonData.map((row) => {
          const updatedRow = {};

          Object.keys(row).forEach((key) => {
            const value = row[key];

            if (typeof value === "number") {
              updatedRow[key] = Number(value.toFixed(2));
            } else {
              updatedRow[key] = value;
            }
          });

          return updatedRow;
        });

        if (jsonData.length === 0) {
          toast.error("The uploaded file is empty.");

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          return;
        }

        setTemplateData(jsonData);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error(error);

        toast.error("Error reading file.");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } finally {
        setLoad((prev) => ({ ...prev, upload: false }));
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImportSave = () => {
    if (templateData.length === 0) return;
    if (excelPayload.rateID === 0) {
      toast.warning("Please select a Rate Type before saving the template.");
      return;
    }

    const payload = templateData?.map((item) => ({
      rateTypeID: Number(excelPayload?.rateID || 0),

      testName: item["TestName"] || "",
      testCode: item["TestCode"] || "",

      shareAmount: Number(item["ShareAmount"] || 0),
      sharePer: Number(item["SharePer"] || 0),
    }));

    setLoad((prev) => ({ ...prev, save: true }));
    axiosInstance
      .post("RateTypeShare/ImportRateTypeShare", payload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Saved successfully.");
          onClose();
        } else {
          toast.error(res?.data?.message || "failed.");
        }
      })
      .catch((err) => {
        toast.error(
          err?.data?.message || "Something went wrong."
        );
      })
      .finally(() => {
        setLoad((prev) => ({ ...prev, save: false }));
      });
  };


 
  return (
    <Dialog
      header={t("Import Excel to Upload")}
      visible={open}
      onHide={onClose}
      className={theme}
      style={{ width: isMobile ? "90vw" : "60vw" }}
      breakpoints={{ "98%": "59vw" }}
    >
      <div className="row col-12 pt-2 pl-2 pr-2 mb-2">
        
        <div className="col-12 col-sm-3 col-md-3">
          <ReactSelect
            label={t("Rate Type")}
            placeholderName={t("Rate Type")}
            name="rateID"
            value={excelPayload?.rateID}
            onChange={handleSelect}
            dynamicOptions={RateTypeData}
            removeIsClearable={true}
          />
        </div> 

        <div className="col-auto">
          <CustomButton
            text={t("Download Test")}
            icon={"download"}
            onClick={downloadExcel}
            loading={load.download}
            disabled={load.download}
          />
        </div>

        <div className="col-auto">
          <CustomButton
            text={t("Upload Test")}
            icon={"excel"}
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
                      <td data-title={key} key={colIndex} className={key === "TestName" ? "test-name-cell" : ""}>
                        {key === "TestName" ? (
                          <span
                            className="truncate-text"
                            onMouseEnter={(e) => {
                              const el = e.target;
                              if (el.scrollWidth > el.clientWidth) {
                                el.title = row[key];
                              } else {
                                el.title = "";
                              }
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

export default ImportExcelModal;