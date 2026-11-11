import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { axiosInstance } from "../../utils/axiosInstance";
import { ExportToExcel } from "../../utils/helpers";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import axios from "axios";

const OutSourceRateImportModal = ({ open, onClose, outSourceLabOptions,templateType, centreOptions }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const fileInputRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  const [form, setForm] = useState({ outSourceLabID: "", bookingCentreID: "" });
  const [templateData, setTemplateData] = useState([]);
  const [template3Meta, setTemplate3Meta] = useState(null); // { fixedHeaders, groups }
  const [load, setLoad] = useState({ download: false, upload: false, save: false });

  const isMultiLabSelect = templateType === "template2" || templateType === "template3";

  const handleSelect = (name, opt) => {
    setForm((prev) => ({ ...prev, [name]: opt?.value || "" }));
  };

  const handleMultiSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const downloadExcel = () => {
  //   if (!form.outSourceLabID) { toast.warning(t("Please select OutSource Lab")); return; }
  //   if (!form.bookingCentreID) { toast.warning(t("Please select Centre")); return; }
  //   setLoad((p) => ({ ...p, download: true }));
  //   axiosInstance
  //     .post("OutSourceLabRateListMaster/ExportRateListTable", {
  //       outSourceLabID: String(form.outSourceLabID),
  //       bookingCentreID: String(form.bookingCentreID),
  //     })
  //     .then((res) => {
  //       const data = res?.data?.message || [];
  //       if (!data.length) { toast.warning(t("No data to export")); return; }
  //       const formatted = data.map((item, i) => ({ "Sr.No": i + 1, ...item }));
  //       ExportToExcel(formatted, "OutSourceRateList.xlsx");
  //     })
  //     .catch((err) => toast.error(err?.response?.data?.message || t("Export failed")))
  //     .finally(() => setLoad((p) => ({ ...p, download: false })));
  // };

  const downloadExcel = () => {
  if (!form.outSourceLabID || (Array.isArray(form.outSourceLabID) && !form.outSourceLabID.length)) {
    toast.warning(t("Please select OutSource Lab"));
    return;
  }

  if (!form.bookingCentreID) {
    toast.warning(t("Please select Centre"));
    return;
  }

  setLoad((p) => ({ ...p, download: true }));

  const payload = {
    outSourceLabID: String(form.outSourceLabID),
    bookingCentreID: String(form.bookingCentreID),
  };

  const downloadBlob = (res, fileName = "OutSourceRateList.xlsx") => {
    const url = window.URL.createObjectURL(
      new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (templateType === "template1") {
    axios
      .post("/reports/v1/OutSource/ExportRateListExcel", payload, { responseType: "blob" })
      .then((res) => downloadBlob(res))
      .catch((err) => toast.error(err?.response?.data?.message || t("Export failed")))
      .finally(() => setLoad((p) => ({ ...p, download: false })));
    return;
  }

  if (templateType === "template2") {
    const template2Payload = {
      bookingCentreID: form.bookingCentreID?.toString(),
      outSourceLabIDs: Array.isArray(form.outSourceLabID)
        ? form.outSourceLabID.map(Number)
        : [Number(form.outSourceLabID)],
    };
    axios
      .post("/reports/v1/OutSource/ExportRateListOne", template2Payload, { responseType: "blob" })
      .then((res) => downloadBlob(res))
      .catch((err) => toast.error(err?.response?.data?.message || t("Export failed")))
      .finally(() => setLoad((p) => ({ ...p, download: false })));
    return;
  }

  if (templateType === "template3") {
    const template3Payload = {
      bookingCentreID: form.bookingCentreID?.toString(),
      outSourceLabIDs: Array.isArray(form.outSourceLabID)
        ? form.outSourceLabID.map(Number)
        : [Number(form.outSourceLabID)],
    };
    axios
      .post("/reports/v1/OutSource/ExportRateListTwo", template3Payload, { responseType: "blob" })
      .then((res) => downloadBlob(res))
      .catch((err) => toast.error(err?.response?.data?.message || t("Export failed")))
      .finally(() => setLoad((p) => ({ ...p, download: false })));
    return;
  }

  // TEMPLATE 1 DEFAULT EXPORT
  // axiosInstance
  //   .post(
  //     "OutSourceLabRateListMaster/ExportRateListTable",
  //     payload
  //   )
  //   .then((res) => {
  //     const data = res?.data?.message || [];

  //     if (!data.length) {
  //       toast.warning(t("No data to export"));
  //       return;
  //     }

  //     const formatted = data.map((item, i) => ({
  //       "Sr.No": i + 1,
  //       ...item,
  //     }));

  //     ExportToExcel(formatted, "OutSourceRateList.xlsx");
  //   })
  //   .catch((err) => {
  //     toast.error(
  //       err?.response?.data?.message || t("Export failed")
  //     );
  //   })
  //   .finally(() => {
  //     setLoad((p) => ({ ...p, download: false }));
  //   });
};

 const parseTemplate3 = (ws) => {
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    // row 3 (idx) = group row: Sr.No, Dept Name, Test Code, Test Name, P1, "", "", "", P2, "", …
    // row 4 (idx) = sub-header: "", "", "", "", OutSrc Lab Name, Rate, Test Code, Test Name, …
    // row 5+ = data
    const groupRow = raw[3] || [];
    const subRow   = raw[4] || [];

    const fixedHeaders = [];
    const groups = [];
    let currentGroup = null;

    groupRow.forEach((g, i) => {
      const sub = subRow[i];
      if (!sub) {
        fixedHeaders.push({ label: g || `Col${i + 1}`, idx: i });
      } else {
        if (g && (!currentGroup || currentGroup.name !== g)) {
          currentGroup = { name: g, subCols: [] };
          groups.push(currentGroup);
        }
        if (currentGroup) {
          currentGroup.subCols.push({ label: sub, idx: i });
        }
      }
    });

    const rows = raw.slice(5)
      .filter((row) => row.some((cell) => cell !== ""))
      .map((row) => {
        const obj = {};
        fixedHeaders.forEach((h) => {
          const val = row[h.idx] ?? "";
          obj[h.label] = typeof val === "number" ? Number(val.toFixed(2)) : val;
        });
        groups.forEach((group) => {
          group.subCols.forEach((col) => {
            const key = `${group.name}__${col.label}`;
            const val = row[col.idx] ?? "";
            obj[key] = typeof val === "number" ? Number(val.toFixed(2)) : val;
          });
        });
        return obj;
      });

    return { fixedHeaders, groups, rows };
  };

  const handleFileUpload = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setLoad((p) => ({ ...p, upload: true }));

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const workbook = XLSX.read(
        new Uint8Array(event.target.result),
        { type: "array" }
      );

      const ws = workbook.Sheets[workbook.SheetNames[0]];

      let rows;

      if (templateType === "template3") {
        const parsed = parseTemplate3(ws);
        setTemplate3Meta({ fixedHeaders: parsed.fixedHeaders, groups: parsed.groups });
        rows = parsed.rows;
      } else {
        // Row index 3 (row 4) contains actual column headers for template1/2
        rows = XLSX.utils.sheet_to_json(ws, { range: 3, defval: "" });
        rows = rows.map((row) => {
          const out = {};
          Object.keys(row).forEach((key) => {
            out[key] = typeof row[key] === "number" ? Number(row[key].toFixed(2)) : row[key];
          });
          return out;
        });
      }

      if (!rows.length) {
        toast.error(t("Uploaded file is empty"));
        return;
      }

      setTemplateData(rows);
    } catch (error) {
      console.error(error);
      toast.error(t("Error reading file"));
    } finally {
      setLoad((p) => ({ ...p, upload: false }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  reader.readAsArrayBuffer(file);
};

  const handleImportSave = () => {
    if (!templateData.length) return;
    if (!form.outSourceLabID || (Array.isArray(form.outSourceLabID) && !form.outSourceLabID.length)) { toast.warning(t("Please select OutSource Lab")); return; }
    if (!form.bookingCentreID) { toast.warning(t("Please select Centre")); return; }

    setLoad((p) => ({ ...p, save: true }));

    if (templateType === "template2") {
      axiosInstance
        .post("OutSourceLabRateListMaster/ImportRateListSave", {
          bookingCentreID: Number(form.bookingCentreID),
          outSourceData: templateData,
        })
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message || t("Saved successfully"));
            setTemplateData([]);
            handleClose();
          } else {
            toast.error(res?.data?.message || t("Failed to save"));
          }
        })
        .catch((err) => toast.error(err?.response?.data?.message || t("Something went wrong")))
        .finally(() => setLoad((p) => ({ ...p, save: false })));
      return;
    }

    if (templateType === "template3" && template3Meta) {
      const rows = templateData.map((item) => ({
        testCode: item["Test Code"] || item["testCode"] || "",
        labs: template3Meta.groups.map((group) => ({
          labName: item[`${group.name}__OutSrc Lab Name`] || "",
          rate: Number(item[`${group.name}__Rate`] || 0),
          outSourceTestCode: item[`${group.name}__Test Code`] || "",
          outSourceTestName: item[`${group.name}__Test Name`] || "",
        })),
      }));

      axiosInstance
        .post("OutSourceLabRateListMaster/ImportRateListTwoSave", {
          bookingCentreID: Number(form.bookingCentreID),
          rows,
        })
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message || t("Saved successfully"));
            setTemplateData([]);
            setTemplate3Meta(null);
            handleClose();
          } else {
            toast.error(res?.data?.message || t("Failed to save"));
          }
        })
        .catch((err) => toast.error(err?.response?.data?.message || t("Something went wrong")))
        .finally(() => setLoad((p) => ({ ...p, save: false })));
      return;
    }

    const outSourceData = templateData.map((item) => ({
      testCode: item["TestCode"] || item["testCode"] || "",
      outSourceRate: Number(item["OutSourceRate"] || item["outSourceRate"] || 0),
      outSourceTestCode: item["OutSourceTestCode"] || item["outSourceTestCode"] || "",
      bookingCentreID: String(form.bookingCentreID),
      outSourceTestName: item["OutSourceTestName"] || item["outSourceTestName"] || "",
    }));

    axiosInstance
      .post("OutSourceLabRateListMaster/ImportRateList", {
        bookingCentreID: Number(form.bookingCentreID),
        outSourceLabID: Number(form.outSourceLabID),
        outSourceData,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || t("Saved successfully"));
          setTemplateData([]);
          handleClose();
        } else {
          toast.error(res?.data?.message || t("Failed to save"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Something went wrong")))
      .finally(() => setLoad((p) => ({ ...p, save: false })));
  };

  const handleClose = () => {
    setTemplateData([]);
    setTemplate3Meta(null);
    setForm({ outSourceLabID: "", bookingCentreID: "" });
    onClose();
  };

  return (
    <Dialog
      header={t("Import / Export Rate List")}
      visible={open}
      onHide={handleClose}
      className={theme}
      style={{ width: isMobile ? "95vw" : "70vw" }}
    >
      <div className="row g-2 pt-2 mb-3 align-items-start">
        <div className="col-12 col-md-3">
          {isMultiLabSelect ? (
            <MultiSelectComp
              id="outSourceLabID"
              name="outSourceLabID"
              // label={t("OutSource Lab")}
              placeholder={t("OutSource Lab")}
              value={form.outSourceLabID || []}
              options={outSourceLabOptions}
              onChange={handleMultiSelectChange}
              className="w-100"
            />
          ) : (
            <ReactSelect
              name="outSourceLabID"
              placeholderName="OutSource Lab"
              value={form.outSourceLabID}
              dynamicOptions={outSourceLabOptions}
              onChange={handleSelect}
            />
          )}
        </div>
        <div className="col-12 col-md-3">
          <ReactSelect
            name="bookingCentreID"
            placeholderName="Centre"
            value={form.bookingCentreID}
            dynamicOptions={centreOptions}
            onChange={handleSelect}
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
            onClick={() => fileInputRef.current?.click()}
            loading={load.upload}
            disabled={load.upload}
          />
          <input
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {templateData.length > 0 && (
        <div className="row">
          <div className="col-12">
            <Tables>
              {templateType === "template3" && template3Meta ? (
                <>
                  <thead>
                    <tr>
                      {template3Meta.fixedHeaders.map((h) => (
                        <th key={h.label} rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                          {h.label}
                        </th>
                      ))}
                      {template3Meta.groups.map((g) => (
                        <th key={g.name} colSpan={g.subCols.length} style={{ textAlign: "center" }}>
                          {g.name}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {template3Meta.groups.flatMap((g) =>
                        g.subCols.map((c) => (
                          <th key={`${g.name}__${c.label}`}>{c.label}</th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {templateData.map((row, ri) => (
                      <tr key={ri}>
                        {template3Meta.fixedHeaders.map((h) => (
                          <td key={h.label} data-title={h.label}>{row[h.label]}</td>
                        ))}
                        {template3Meta.groups.flatMap((g) =>
                          g.subCols.map((c) => (
                            <td key={`${g.name}__${c.label}`} data-title={c.label}>
                              {row[`${g.name}__${c.label}`]}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr>
                      {Object.keys(templateData[0]).map((key, i) => (
                        <th key={i}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {templateData.map((row, ri) => (
                      <tr key={ri}>
                        {Object.keys(row).map((key, ci) => (
                          <td key={ci} data-title={key}>{row[key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
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

export default OutSourceRateImportModal;
