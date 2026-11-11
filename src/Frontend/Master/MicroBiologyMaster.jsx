import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { MicroBioMasterSchema } from "../../utils/Schema";
import { dateConfig, getTrimmedData, number } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { MicroBioMaster } from "../../utils/Constants";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import Heading from "../../components/UI/Heading";


const MicroBiologyMaster = () => {
  const [TableData, setTableData] = useState([]);
  const [showDialog, setShowDialog] = useState(false)
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogData, setDialogData] = useState([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importTypeID, setImportTypeID] = useState("2");
  const [excelLoading, setExcelLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [importSaveLoading, setImportSaveLoading] = useState(false);
  const [templateData, setTemplateData] = useState([]);
  const fileInputRef = useRef(null);
    const [dialogAntibioticId, setDialogAntibioticId] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef(null);
  
  const [loading, setLoading] = useState({
    save: false,
    search: false,
  });
  const [payload, setPayload] = useState({
    Name: "",
    TypeID: "2",
    TypeName: "Organism",
    Code: "",
    IsActive: "1",
  });
  const [err, setErr] = useState({});
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", 'get')

  // ── Tagging modal state ────────────────────────────────────
  const [tagModal, setTagModal] = useState({ open: false, item: null });
  const [tagMapItem, setTagMapItem] = useState([]);
  const [tagUnMapItem, setTagUnMapItem] = useState([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagPayloadMapped, setTagPayloadMapped] = useState([]);
  const [tagPayloadUnMapped, setTagPayloadUnMapped] = useState([]);






  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    });
  };


  const handleRowClick = (item, e) => {
    if (item.typename == "Organism" || item.typename == "Antibiotic Group") {
      setShowDialog(false);
      return;
    }
    const isClickable = e.target.closest("a") || e.target.closest("button") || e.target.closest("[data-skip='true']");
    if (isClickable) return;

    fetchDialogData(item.id);
    setShowDialog(true);
  };



  const handleDialogSave = () => {
    const updatedRows = dialogData.filter((row) => row.checked);
    const payload = updatedRows.map((row) => ({
      id: row.Id || 0,
      organismId: row.OrganismId || 0,
      organismName: row.OrganismName || "",
      antibioticId: row.AntibioticId || 0,
      antibioticName: row.AntibioticName || "",
      sensitive: row.Sensitive || "",
      intermediate: row.Intermediate || "",
      resistant: row.Resistant || "",
    }));

    setDialogLoading(true)

    axiosInstance
      .post("MapMicroMaster/SaveOrganisms", payload)
      .then((res) => {
        toast.success(res?.data?.message || "Saved successfully");
        setShowDialog(false);
        setDialogLoading(false)
        setDialogData([]);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Save failed");
      });
  };



  const fetchDialogData = (antibioticId) => {
    setDialogAntibioticId(antibioticId);
    setDialogLoading(true);
    axiosInstance
      .get(`MapMicroMaster/OrganismsByAntibiotic/${antibioticId}`)
      .then((res) => {
        const data = res?.data?.message || [];
        setDialogData(data.map((row) => ({ ...row, checked: false })));
        setDialogLoading(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong.");
        setDialogLoading(false);
        setDialogData([]);
      });
  };

  const handleExportOrganisms = () => {
    if (!dialogAntibioticId) return;
    setExportLoading(true);
    axiosInstance
      .get(`MapMicroMaster/ExportOrganismsByAntibiotic/${dialogAntibioticId}`, {
        responseType: "blob",
      })
      .then((res) => {
        if (!res?.data || res.data.size === 0) {
          toast.warn("No data available to export");
          return;
        }
        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `${dialogData[0]?.AntibioticName || "OrganismsByAntibiotic"}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error("Failed to export."))
      .finally(() => setExportLoading(false));
  };

  const handleImportFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const uploadForm = new FormData();
    uploadForm.append("file", file);

    setImportLoading(true);
    axiosInstance
      .post("MapMicroMaster/ImportOrganismsSensitivity", uploadForm)
      .then((res) => {
        toast.success(res?.data?.message || "Imported successfully");
        if (dialogAntibioticId) fetchDialogData(dialogAntibioticId);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Import failed");
      })
      .finally(() => setImportLoading(false));
  };


  const handleCheckbox = (OrganismId) => {
    setDialogData((prev) =>
      prev.map((row) =>
        row.OrganismId === OrganismId ? { ...row, checked: !row.checked } : row
      )
    );
  };

  const handleCellChange = (OrganismId, field, value) => {
    setDialogData((prev) =>
      prev.map((row) =>
        row.OrganismId === OrganismId ? { ...row, [field]: value } : row
      )
    );
  };

  const getActionBy = (row) => row.UpdatedByName || row.CreatedByName || "—";

  const getActionOn = (row) => {
    const date = row.DtUpdate || row.DtEntry;
    if (!date?.value) return "—";
    return new Date(date.value).toLocaleString();
  };

  // ── Tagging modal handlers ─────────────────────────────────
  const handleOpenTagging = (item) => {
    setTagModal({ open: true, item });
    setTagPayloadMapped([]);
    setTagPayloadUnMapped([]);
    setTagLoading(true);
    // SearchType must match MicroBioMaster values: Organism="2", AntibioticGroup="3", Antibiotic="4"
    const typeIdMap = { 2: "2", 3: "3", 4: "4" };
    const searchType = typeIdMap[Number(item.typeid)] || String(item.typeid);
    const body = { SearchType: searchType, MasterID: item.id };
    Promise.all([
      axiosInstance.post("MapMicroMaster/getsaveddata", body),
      axiosInstance.post("MapMicroMaster/getunmappeddata", body),
    ])
      .then(([mapRes, unMapRes]) => {
        setTagMapItem(
          (mapRes?.data?.message || []).map((e) => ({ ...e, MapTypeID: "4" }))
        );
        setTagUnMapItem(
          (unMapRes?.data?.message || []).map((e) => ({ ...e, MasterID: item.id }))
        );
      })
      .catch(() => { })
      .finally(() => setTagLoading(false));
  };

  const refreshTagData = (item) => {
    const typeIdMap = { 2: "2", 3: "3", 4: "4" };
    const searchType = typeIdMap[Number(item.typeid)] || String(item.typeid);
    const body = { SearchType: searchType, MasterID: item.id };
    axiosInstance.post("MapMicroMaster/getsaveddata", body).then((res) =>
      setTagMapItem((res?.data?.message || []).map((e) => ({ ...e, MapTypeID: "4" })))
    );
    axiosInstance.post("MapMicroMaster/getunmappeddata", body).then((res) =>
      setTagUnMapItem((res?.data?.message || []).map((e) => ({ ...e, MasterID: item.id })))
    );
  };

  const handleTagSelectUnMapped = (e) => {
    const vals = Array.from(e.target.options)
      .filter((o) => o.selected)
      .map((o) => Number(o.value));
    setTagPayloadUnMapped(
      tagUnMapItem
        .filter((ele) => vals.includes(ele?.MapMasterID))
        .map((ele) => ({
          TypeID: String(tagModal.item?.typeid),
          MasterID: ele?.MasterID,
          MapTypeID: ele?.MapTypeID,
          MapMasterID: ele?.MapMasterID,
          BreakPoint: ele?.Name,
        }))
    );
  };

  const handleTagSelectMapped = (e) => {
    const vals = Array.from(e.target.options)
      .filter((o) => o.selected)
      .map((o) => Number(o.value));
    setTagPayloadMapped(tagMapItem.filter((ele) => vals.includes(ele?.MapID)));
  };

  const handleTagSave = () => {
    axiosInstance
      .post("MapMicroMaster/savemapping", { MappingData: tagPayloadUnMapped })
      .then((res) => {
        toast.success(res?.data?.message);
        setTagPayloadUnMapped([]);
        refreshTagData(tagModal.item);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Error"));
  };

  const handleTagDelete = () => {
    axiosInstance
      .post("MapMicroMaster/deletemapping", {
        MappingData: tagPayloadMapped.map((ele) => ({ ...ele, masterId: tagModal.item?.id })),
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setTagPayloadMapped([]);
        refreshTagData(tagModal.item);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Error"));
  };

  const tagTypeLabel = (typeid) => {
    const map = { "2": t("Organism Master"), "3": t("Antibiotic Group"), "4": t("Antibiotic") };
    return map[String(typeid)] || "";
  };



  const handleTestSearch = (id) => {
    setLoading({
      ...loading,
      search: true,
    });
    axiosInstance
      .post("MicroMaster/getmasterdata", {
        TypeID: id,
      })
      .then((res) => {
        setLoading({
          ...loading,
          search: false,
        });
        setTableData(res?.data?.message);
        setErr({});
      })
      .catch((err) => {
        setLoading({
          ...loading,
          search: false,
        });
        setTableData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong.",
        );
      });
  };

  const handleSelect = (event) => {
    const { name, value, selectedIndex } = event?.target;
    const label = event?.target?.children[selectedIndex].text;
    setPayload({ ...payload, [name]: value, TypeName: label });
    handleTestSearch(value);
  };

  const handleImportTypeSelect = (event) => {
    setImportTypeID(event?.target?.value);
  };

  const handleEdit = (data) => {
    setPayload({
      Name: data?.Name,
      TypeID: data?.typeid,
      TypeName: data?.typename,
      Code: data?.Code,
      IsActive: data?.isactive,
      ID: data?.id,
    });
    window.scrollTo(0, 0);
  };

  const handleSave = (url) => {
    const generatedError = MicroBioMasterSchema(payload);

    if (generatedError === "") {
      setLoading({
        ...loading,
        save: true,
      });
      axiosInstance
        .post(url, getTrimmedData(payload))
        .then((res) => {
          toast.success(res?.data?.message);
          setLoading({
            ...loading,
            save: false,
          });
          setErr({});
          setPayload({
            Name: "",
            TypeID: "2",
            IsActive: "1",
            TypeName: "Organism",
            Code: "",
          });
          handleTestSearch("2");
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoading({
            ...loading,
            save: false,
          });
        });
    } else setErr(generatedError);
  };
  useEffect(() => {
    handleTestSearch("2");
  }, []);
  // ── Import / Export Excel handlers ─────────────────────────
  const handleShow = () => {
    setExcelLoading(true);
    axiosInstance
      .get("MicroMaster/ExportMicroMaster", {
        params: { TypeID: importTypeID },
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "MicroBiologyMaster.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Excel file downloaded successfully");
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to download excel");
      })
      .finally(() => setExcelLoading(false));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportSave = () => {
    const typeName = MicroBioMaster.find((o) => o.value === importTypeID)?.label || "";
    const importPayload = {
      typeID: importTypeID,
      typeName,
      microMaster: templateData.map((row) => ({
        name: row.Name,
        code: row.Code,
      })),
    };

    setImportSaveLoading(true);
    axiosInstance
      .post("MicroMaster/ImportMicroMaster", importPayload)
      .then((res) => {
        toast.success(res?.data?.message || "Data imported successfully");
        handleCloseImportDialog();
        handleTestSearch(payload?.TypeID);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Import failed");
      })
      .finally(() => setImportSaveLoading(false));
  };

  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setImportTypeID("2");
    setTemplateData([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      const typeName = MicroBioMaster.find((o) => o.value === importTypeID)?.label || "";

      // Row 0 = column headers, Row 1 = instructions, Row 2 onwards = actual data
      const rows = allRows
        .slice(2)
        .filter((row) => row.some((val) => String(val || "").trim() !== ""))
        .map((row) => ({
          Type: typeName,
          Name: String(row[0] || "").trim(),
          Code: String(row[1] || "").trim(),
        }))
        .filter((row) => row.Name);

      if (rows.length === 0) {
        toast.error("No valid data found in the uploaded file");
        setUploadLoading(false);
        return;
      }

      const seenNames = new Set();
      const seenCodes = new Set();
      const duplicateNames = new Set();

      rows.forEach((row) => {
        const nameKey = row.Name.toLowerCase();
        const codeKey = row.Code.toLowerCase();

        if (seenNames.has(nameKey) || (codeKey && seenCodes.has(codeKey))) {
          duplicateNames.add(row.Name);
        }
        seenNames.add(nameKey);
        if (codeKey) seenCodes.add(codeKey);
      });

      if (duplicateNames.size > 0) {
        toast.warning(
          `Duplicate row(s) found for: ${Array.from(duplicateNames).join(", ")}. Please remove duplicates and re-upload.`
        );
        setUploadLoading(false);
        return;
      }

      setTemplateData(rows);
      setUploadLoading(false);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };
  return (
    <>
      <Accordion
        name={t("Micro Biology Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              options={MicroBioMaster}
              name="TypeID"
              lable="Type"
              id="Organism"
              onChange={handleSelect}
              selectedValue={payload?.TypeID}
            />
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              id="Name"
              lable="Name"
              placeholder=" "
              type="text"
              name="Name"
              value={payload?.Name}
              onChange={handleChange}
            />

            {payload?.Name?.trim() === "" && (
              <span className="error-message">{err?.Name}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              id="Code"
              className="required-fields"
              lable="Code"
              placeholder=" "
              type="text"
              // onInput={(e) => number(e, 20)}
              name="Code"
              value={payload?.Code}
              onChange={handleChange}
            />
            {payload?.Code?.trim() === "" && (
              <span className="error-message">{err?.Code}</span>
            )}
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsActive"
                checked={payload?.IsActive == "1" ? true : false}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <label className="ml-2" htmlFor="IsActive">
              {t("Active")}
            </label>
          </div>
          <div className="col-sm-1">
            {loading?.save ? (
              <Loading />
            ) : payload?.ID ? (
              <button
                className="btn btn-success btn-sm btn-block"
                onClick={() =>
                  handleSave("MicroMaster/updatemasterdata", "Update")
                }
              >
                {t("Update")}
              </button>
            ) : (
              <button
                className="btn btn-success btn-sm btn-block"
                onClick={() => handleSave("MicroMaster/savemasterdata", "Save")}
              >
                {t("Save")}
              </button>
            )}
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-success btn-sm btn-block"
              onClick={() => {
                setErr({});
                setPayload({
                  Name: "",
                  TypeID: "2",
                  IsActive: "1",
                  TypeName: "Organism",
                  Code: "",
                });
              }}
            >
              {t("Reset")}
            </button>
          </div>
          <div>
            <CustomButton text="Import / Export" icon="excel"
              className="mx-2"
              onClick={() => setShowImportDialog(true)}
            />

          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading?.search ? (
          <Loading />
        ) : (
          TableData?.length > 0 && (
            <Tables>
              <thead>
                <tr>
                  {[
                    t("S.No"),
                    t("Code"),
                    t("Name"),
                    t("Type"),
                    t("Status"),
                    t("Insert By"),
                    t("Insert Date"),
                    t("Last Update By"),
                    t("Last Update Date"),
                    t("Edit"),
                    t("Tagging"),
                  ].map((ele, index) => (
                    <th key={index}>{ele}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading?.search ? (
                  <Loading />
                ) : (
                  TableData.map((item, index) => (
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td data-title={t("Code")}>{item?.Code}&nbsp;</td>
                      <td onClick={(e) => handleRowClick(item, e)} style={{ color: item.typename === "Antibiotic" ? "blue" : "black" }} data-title={t("Name")}>{item?.Name}&nbsp;</td>
                      <td data-title={t("Type")}>{item?.typename}&nbsp;</td>
                      <td data-title={t("Status")}>{item?.STATUS}&nbsp;</td>
                      <td data-title={t("Insert By")}>
                        {item?.InsertByname}&nbsp;
                      </td>
                      <td data-title={t("Insert Date")}>
                        {dateConfig(item?.entrydate)}&nbsp;
                      </td>
                      <td data-title={t("Last Update By")}>
                        {item?.UpdateByname}&nbsp;
                      </td>
                      <td data-title={t("Last Update Date")}>
                        {dateConfig(item?.updatedate)}&nbsp;
                      </td>
                      <td data-title={t("Edit")}>
                        <div
                          className="text-primary"
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={(e) => {
                            // e.stopPropagation();   
                            handleEdit(item);
                          }}
                        >
                          {t("Edit")}
                        </div>
                      </td>
                      <td data-title={t("Tagging")}>
                        {(item?.typeid == "2" || item?.typeid == "3") && (
                          <span
                            className="text-primary"
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                            onClick={(e) => { e.stopPropagation(); handleOpenTagging(item); }}
                          >
                            {t("Tagging")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Tables>
          )
        )}
      </Accordion>
      {showDialog && (
        <Dialog
          header={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingRight: "24px",
              }}
            >
              <span>{dialogData[0]?.AntibioticName || t("Antidote Report")}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="file"
                  ref={importFileRef}
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={handleImportFileSelected}
                />
                <CustomButton
                  text="Import"
                  icon="upload"
                  loading={importLoading}
                  onClick={() => importFileRef.current?.click()}
                />
                <CustomButton
                  text="Export"
                  icon="excel"
                  loading={exportLoading}
                  disabled={!dialogAntibioticId}
                  onClick={handleExportOrganisms}
                />
              </div>
            </div>
          }
          visible={showDialog}
          onHide={() => setShowDialog(false)}
          style={{ width: "90vw" }}
          className={theme}
          modal
        >
          {dialogLoading ? (
            <Loading />
          ) : (
            <>
              <Tables className="table table-bordered table-hover"

              >
                <thead>
                  <tr>

                    <th>{t("S.No")}</th>
                    <th>{t("Organism Name")}</th>
                    <th>{t("Sensitive")}</th>
                    <th>{t("Intermediate")}</th>
                    <th>{t("Resistant")}</th>
                    <th>{t("Action by ")}</th>
                    <th>{t("Action on ")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dialogData.length > 0 ? (
                    dialogData.map((row, i) => (

                      <tr
                        key={row.OrganismId}
                        style={{ backgroundColor: row.checked ? "#f0fff0" : "inherit" }}

                      >
                        <td style={{ width: "40px", textAlign: "left" }}>
                          {i + 1}
                        </td>
                        {/* Organism - always read only */}
                        <td>{row.OrganismName}</td>

                        {/* Sensitive */}
                        <td>
                          {row.checked ? (
                            <input
                              type="text"
                              value={row.Sensitive}
                              onChange={(e) => handleCellChange(row.OrganismId, "Sensitive", e.target.value)}
                              style={{ width: "100%", border: "1px solid #ccc", borderRadius: "4px" }}
                            />
                          ) : (
                            row.Sensitive
                          )}
                        </td>

                        {/* Intermediate */}
                        <td>
                          {row.checked ? (
                            <input
                              type="text"
                              value={row.Intermediate}
                              onChange={(e) => handleCellChange(row.OrganismId, "Intermediate", e.target.value)}
                              style={{ width: "100%", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 6px" }}
                            />
                          ) : (
                            row.Intermediate
                          )}
                        </td>

                        {/* Resistant */}
                        <td>
                          {row.checked ? (
                            <input
                              type="text"
                              value={row.Resistant}
                              onChange={(e) => handleCellChange(row.OrganismId, "Resistant", e.target.value)}
                              style={{ width: "100%", border: "1px solid #ccc", borderRadius: "4px", padding: "2px 6px" }}
                            />
                          ) : (
                            row.Resistant
                          )}
                        </td>

                        {/* Action By */}
                        <td>{getActionBy(row)}</td>

                        {/* Action On */}
                        <td>{getActionOn(row)}</td>

                        {/* Checkbox - right end ✅ */}
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={row.checked || false}
                            onChange={() => handleCheckbox(row.OrganismId)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        <NoRecordFound />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Tables>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>


                <div className="col-sm-1 col-md-1 mb-2">
                  <SaveButton
                    text={"Save"}
                    className="m-0 w-100"
                    onClick={handleDialogSave}
                    disabled={!dialogData.some((row) => row.checked)}
                  />
                </div>




                {/* <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowDialog(false)}
          >
            {t("Close")}
          </button> */}
              </div>
            </>
          )}
        </Dialog>
      )}


      {/* Tagging Modal */}
      {tagModal.open && (
        <Dialog
          header={`${tagTypeLabel(tagModal.item?.typeid)} - ${tagModal.item?.Name}`}
          visible={tagModal.open}
          onHide={() => {
            setTagModal({ open: false, item: null });
            setTagMapItem([]);
            setTagUnMapItem([]);
            setTagPayloadMapped([]);
            setTagPayloadUnMapped([]);
          }}
          style={{ width: "85vw" }}
          className={theme}
          modal
        >
          <div className="row pt-2 pl-2 pr-2 mb-3">
            <div className="col-sm-4">
              <span style={{ fontWeight: "bold" }}>
                {tagTypeLabel(tagModal.item?.typeid)}:&nbsp;
              </span>
              <span>{tagModal.item?.Name}</span>
            </div>
            <div className="col-sm-3">
              <span style={{ fontWeight: "bold" }}>{t("Code")}:&nbsp;</span>
              <span>{tagModal.item?.Code}</span>
            </div>
          </div>
          {tagLoading ? (
            <Loading />
          ) : (
            <div className="row pt-2">
              <div className="col-md-5">
                <Accordion title={t("Mapped Item")} defaultValue={true}>
                  <select
                    multiple
                    className="form-control mapping-tag"
                    onChange={handleTagSelectMapped}
                    style={{ border: "none", minHeight: "200px" }}
                  >
                    {tagMapItem.map((ele, index) => (
                      <option key={index} value={ele?.MapID} className="p-2">
                        {ele?.Name}
                      </option>
                    ))}
                  </select>
                </Accordion>
              </div>
              <div
                className="col-sm-2 col-md-2"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "60px",
                }}
              >
                <button
                  className="btn btn-info btn-sm btn-block"
                  style={{ width: "100px" }}
                  onClick={handleTagSave}
                  disabled={tagPayloadUnMapped?.length === 0}
                >
                  {t("Left")}
                </button>
                <button
                  className="btn btn-info btn-sm btn-block"
                  style={{ width: "100px" }}
                  onClick={handleTagDelete}
                  disabled={tagPayloadMapped?.length === 0}
                >
                  {t("Right")}
                </button>
              </div>
              <div className="col-md-5">
                <Accordion title={t("UnMapped Item")} defaultValue={true}>
                  <select
                    multiple
                    className="form-control mapping-tag"
                    onChange={handleTagSelectUnMapped}
                    style={{ border: "none", minHeight: "200px" }}
                  >
                    {tagUnMapItem.map((ele, index) => (
                      <option key={index} value={ele?.MapMasterID} className="p-2">
                        {ele?.Name}
                      </option>
                    ))}
                  </select>
                </Accordion>
              </div>
            </div>
          )}
        </Dialog>
      )}

      {/* { import or export excel} */}
      <Dialog
        header={" Import Excel to Upload"}
        visible={showImportDialog}
        onHide={handleCloseImportDialog}
        style={{ width: "60vw" }}
        className={theme}
        modal
      >
        <>
          <div className="row align-items-center">
           
            <div className="col-12 col-sm-4 col-md-3 my-1">
              <SelectBox
                options={MicroBioMaster}
                name="TypeID"
                lable="Type"
                id="ImportType"
                onChange={handleImportTypeSelect}
                selectedValue={importTypeID}
              />
            </div>
            <div className="col-auto my-1">
              <CustomButton text={t("Download Excel")}
                icon={"excel"}
                className="mx-2"
                onClick={handleShow}
                loading={excelLoading}
                disabled={excelLoading}
              />
            </div>

            <div className="col-auto my-1">
              <CustomButton
                text={t("Upload Excel")}
                icon={"excel"}
                onClick={handleUploadClick}
                loading={uploadLoading}
                disabled={uploadLoading}
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
                <Heading
                  title={t("Micro Biology ")}
                  secondTitle={
                    <div style={{ fontWeight: "700" }}>
                      {t("Total Records")} : {templateData.length}
                    </div>
                  }
                />

                      <Tables>
                        <thead>
                          <tr> 
                            <th>{t("S.No")}</th>
                            <th>{t("Type")}</th>
                            <th>{t("Name")}</th>
                            <th>{t("Code")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {templateData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td>{rowIndex + 1}</td>
                              <td>{row.Type}</td>
                              <td>{row.Name}</td>
                              <td>{row.Code}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Tables>
                    </div>
                    <div className="col-12 mt-2 d-flex justify-content-end">
                      <SaveButton
                        text={t("Save Data")}
                        onClick={handleImportSave}
                        loading={importSaveLoading}
                        disabled={importSaveLoading}
                      />
                    </div>
                  </div>
                )}
        </>
      </Dialog>
    </>
  );
};

export default MicroBiologyMaster;
