import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { validationForSampleType } from "../../utils/Schema";
import { getTrimmedData, downloadExcelBlob } from "../../utils/helpers";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import Pagination from "../../Pagination/Pagination";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Heading from "../../components/UI/Heading";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const SampleTypeCreate = () => {
  const [data, setData] = useState([]);
  const [Color, setColor] = useState([]);
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState({});
  const [formData, setFormData] = useState({
    SampleName: "",
    ColorName: "#000000",
    isActive: 1,
    RetentionDays: "",
  });
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [templateData, setTemplateData] = useState([]);
  const [importSaveLoading, setImportSaveLoading] = useState(false);

  const { t } = useTranslation();

  const colorCodingData = [
    { color: "#FFFFFF", id: "1", labelKey: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "In Active" },
  ];

  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
   const fileInputRef = useRef(null);
  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });

        switch (name) {
          case "Color":
            setColor(value);
            break;
        }
      })
      .catch((err) => console.log(err));
  };
  const handleSearch = () => {
    setLoad(true);
    axiosInstance
      .get("SampleType/getSampleType")
      .then((res) => {
        setData(res.data.message);
        setTotalCount(res?.data?.message.length || 0)
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };
  const postData = (url) => {
    let generatedError = validationForSampleType(formData);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(url, getTrimmedData({ ...formData, RetentionDays: Number(formData?.RetentionDays) ?? 0, id: formData?.id ?? "" }))
        .then((res) => {
          setFormData({
            SampleName: "",
            ColorName: "#000000",
            isActive: 0,
            RetentionDays: "",
          });
          toast.success(res?.data?.message);
          handleSearch();
          setErr({});
          setLoad(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad(false);
        });
    } else {
      setErr(generatedError);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(type);
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  useEffect(() => {
    handleSearch();
    getDropDownData("Color");
  }, []);

  const handleEdit = (data) => {
    setFormData({
      SampleName: data?.SampleName,
      ColorName: data?.ColorName,
      isActive: data?.isActive,
      id: data?.id,
      RetentionDays: data?.RetentionDays ?? "",
    });
  };
  // import or export excel file
  const handleOpenImportDialog = () => {
    setShowImportDialog(true);
  };
 const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setTemplateData([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  }

  const handleDownloadTemplateExcel = async () => {
    try {
      const response = await axiosInstance.get(
        "SampleType/ExportSampleTypeTemplate",
        { responseType: "blob" }
      );

      const blob = response?.data;
      if (!blob) {
        toast.error("No template data received");
        return;
      }

      const contentType =
        response?.headers?.["content-type"] ||
        response?.headers?.["Content-Type"] ||
        "";

      if (contentType.includes("application/json")) {
        const text = await blob.text();
        const parsed = JSON.parse(text);
        toast.error(parsed?.message || "No template available");
        return;
      }

      downloadExcelBlob(blob, "sample-type-template");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download excel"
      );
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      // Row 0 = column headers, Row 1 = instructions, Row 2 onwards = actual data
      const rows = allRows
        .slice(2)
        .filter((row) => row.some((val) => String(val || "").trim() !== ""))
        .map((row) => ({
          SampleName: String(row[0] || "").trim(),
          ColorName: String(row[1] || "").trim(),
          ReferenceMasterID: String(row[2] || "").trim(),
        }))
        .filter((row) => row.SampleName);

      if (rows.length === 0) {
        toast.error("No valid data found in the uploaded file");
        e.target.value = null;
        return;
      }

      const seenNames = new Set();
      const duplicateNames = new Set();
      rows.forEach((row) => {
        const nameKey = row.SampleName.toLowerCase();
        if (seenNames.has(nameKey)) {
          duplicateNames.add(row.SampleName);
        }
        seenNames.add(nameKey);
      });

      if (duplicateNames.size > 0) {
        toast.warning(
          `Duplicate SampleName found: ${Array.from(duplicateNames).join(", ")}. Please remove duplicates and re-upload.`
        );
        e.target.value = null;
        return;
      }

      setTemplateData(rows);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handleImportSave = () => {
    const importPayload = templateData.map((row) => ({
      sampleName: row.SampleName || "",
      colorName: row.ColorName || "",
      referenceMasterID: Number(row.ReferenceMasterID) || 0,
    }));

    setImportSaveLoading(true);
    axiosInstance
      .post("SampleType/ImportSampleType", importPayload)
      .then((res) => {
        toast.success(res?.data?.message || "Data imported successfully");
        handleCloseImportDialog();
        handleSearch();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Import failed");
      })
      .finally(() => setImportSaveLoading(false));
  };

  const getContrastColor = (hexColor) => {
    if (!hexColor || hexColor.charAt(0) !== '#') return 'black';

    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // YIQ formula: brightness = (R*299 + G*587 + B*114) / 1000
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // If brightness is > 128, color is light, so use black text. Else use white.
    return brightness > 128 ? 'black' : 'white';
  };

  const filteredData = data?.filter((item) => {
    return (
      item?.SampleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.ColorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastRecord = currentPage * pageSize;
  const indexOfFirstRecord = indexOfLastRecord - pageSize;
  const currentTableData = filteredData?.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalActive = data?.filter((item) => item?.isActive === 1)?.length || 0;
  const totalInactive = data?.filter((item) => item?.isActive === 0)?.length || 0;

  return (
    <>
      <Accordion
        name={t("Sample Type Create")}
        defaultValue={true}
        isBreadcrumb={true}
            notOpen={true}
         linkTo={"#"}
        linkTitle={
                    <CustomButton
                      text={t("Sample Import")}
                      icon="excel"
                      className="mx-2"
                      onClick={handleOpenImportDialog}
                    />
                  }
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable="Sample Name"
              id="SampleName"
              name="SampleName"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.SampleName}
            />
            {formData?.SampleName?.trim() === "" && (
              <span className="error-message">{err?.SampleName}</span>
            )}
          </div>
          {/* <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              lable="Container"
              id="Container"
              name="Container"
              placeholder=" "
              max={15}
              onChange={handleChange}
              value={formData?.Container}
            />
            {formData?.Container?.trim() === "" && (
              <span className="error-message">{err?.Container}</span>
            )}
          </div> */}
          <div className="col-sm-2">
            <Input
              type="number"
              lable="Retention Days"
              id="RetentionDays"
              name="RetentionDays"
              onChange={handleChange}
              value={formData?.RetentionDays}
            />
          </div>
          <div className="col-auto">
            <input
              className="required-fields"
              type="color"
              lable="Color Name"
              id="ColorName"
              name="ColorName"
              placeholder=" "
              value={formData?.ColorName || "#000000"}
              onChange={handleChange}
              style={{ height: '26px', cursor: 'pointer', padding: '2px' }}
            />
          </div>
          <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
          gap: "5px"
        }}>
          <label class="switch mb-0">
            <input
              type="checkbox"
              checked={formData?.isActive === 1}
              onChange={() => handleToggle("isActive")}
            />
            <span class="slider"></span>
          </label>
          <strong>
            <span>{t("IsActive")}</span>
          </strong>
        </div>
          <div className="col-sm-1">
            {/* <button
              type="button"
              className={`btn ${
                formData?.id ? "btn-warning" : "btn-success"
              } btn-sm w-100`}
              onClick={() =>
                postData(
                  formData?.id
                    ? "SampleType/UpdateSampleType"
                    : "SampleType/SaveSampleType",
                )
              }
            >
              {formData?.id ? t("Update") : t("Save")}
            </button> */}

            <CustomButton
              text={formData?.id ? t("Update") : t("Save")}
              icon={formData?.id ? t("edit") : t("save")}
              className={`btn ${formData?.id ? "btn-warning" : "btn-success"
                } btn-sm w-100 text-white`}
              onClick={() =>
                postData(
                  formData?.id
                    ? "SampleType/UpdateSampleType"
                    : "SampleType/SaveSampleType",
                )
              }
            />
          </div>
          <div className="col-sm-1">
            <CustomButton
              text={"Reset"}
              icon={"refresh"}
              id="Reset"
              title="Reset"
              onClick={() => {
                setFormData({
                  SampleName: "",
                  ColorName: "#000000",
                  isActive: 0,
                  RetentionDays: "",
                });
                setErr({});
              }}
            />
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div
            className="d-none d-md-flex align-items-center justify-content-between"
            id="pr_id_11"
            style={{
              gap: "5px"
            }}
          >
            {colorCodingData.map(({ color, labelKey, id }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={labelKey === "Active" ? `Active(${totalActive})` : `In Active(${totalInactive})`}
              />
            ))}
            <div className="mt-2">
              <Input
                className=""
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        }
      >
        {load ? (
          <Loading />
        ) : (
          <div className="row p-2">
            <div className="col-12">
              <Tables
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                }}
              >
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("SampleName")}</th>
                    <th>{t("ColorName")}</th>
                    <th>{t("Retention Days")}</th>
                    <th>{t("Created By")}</th>
                    <th>{t("Created At")}</th>
                    <th>{t("Updated By")}</th>
                    <th>{t("Updated At")}</th>
                    <th className="">
                      <i class="fa fa-edit"></i>
                    </th>
                  </tr>
                </thead>
                {currentTableData.map((data, i) => {
                  const inActiveBackgroundRow = data?.isActive == 1 ? "" : "#f5c6cb";
                  return (
                    <tbody>
                      {" "}
                      <tr style={{ backgroundColor: inActiveBackgroundRow }}>
                        <td data-title={t("S.No")} className="">
                          {(currentPage - 1) * pageSize + i + 1}&nbsp;
                        </td>
                        <td data-title={t("SampleName")} className="">
                          {data?.SampleName}&nbsp;
                        </td>
                        <td
                          data-title={t("ColorName")}
                          className=""
                          style={{
                            backgroundColor: data?.ColorName || 'transparent',
                            color: getContrastColor(data?.ColorName),
                            fontWeight: '600',
                            padding: '8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {data?.ColorName}&nbsp;
                        </td>
                        <td data-title={t("Retention Days")} className="">
                          {data?.RetentionDays ?? ""}&nbsp;
                        </td>
                        <td data-title={t("Created By")} className="">
                          {data?.CreatedByName}&nbsp;
                        </td>
                        <td data-title={t("Created At")} className="">
                          {data?.dtEntry}&nbsp;
                        </td>
                        <td data-title={t("Updated By")} className="">
                          {data?.UpdatedByName}&nbsp;
                        </td>
                        <td data-title={t("Updated At")} className="">
                          {data?.dtUpdate}&nbsp;
                        </td>
                        <td data-title="Select" className="">
                          <button
                            className="btn btn-primary btn-sm btn-class"
                            onClick={() => {
                              handleEdit(data);
                            }}
                          >
                            <i class="fa fa-edit"></i>
                          </button>
                        </td>
                      </tr>{" "}
                    </tbody>
                  )
                })}
              </Tables>
              <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
                {totalCount > 25 && (
                  <>
                    <div style={{ minWidth: '150px' }}>
                      <ReactSelect
                        value={pageSize}
                        dynamicOptions={[
                          { label: '25', value: 25 },
                          { label: '50', value: 50 },
                          { label: '100', value: 100 },
                          { label: '150', value: 150 },
                        ]}
                        name={'pageSize'}
                        label={t("pageSize")}
                        removeIsClearable={true}
                        onChange={(name, value) => {
                          setPageSize(value?.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    <Pagination
                      className="pagination-bar"
                      currentPage={currentPage}
                      totalCount={totalCount}
                      pageSize={pageSize}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Accordion>

       {/* Import Dialog */}
        {/* { import or export excel} */}
              <Dialog
                header={" Import Excel to Upload"}
                visible={showImportDialog}
                onHide={handleCloseImportDialog}
                style={{ width: "40vw" }}
                className={theme}
                modal
              >
                <>
                  <div className="row align-items-center">
                   
                    <div className="col-auto my-1">
                      <CustomButton
                        text={t("Download Excel")}
                        icon={"excel"}
                        className="mx-2"
                        onClick={handleDownloadTemplateExcel}
                      />
                    </div>
        
                    <div className="col-auto my-1">
                      <CustomButton
                        text={t("Upload Excel")}
                        icon={"excel"}
                        onClick={handleUploadClick}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                   {templateData.length > 0 && (
                          <div className="row p-2">
                            <div className="col-12">
                        <Heading
                          title={t("Sample Master Data")}
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
                                    <th>{t("SampleName")}</th>
                                    <th>{t("ColorName")}</th>
                                    <th>{t("ReferenceMasterID")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {templateData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      <td>{rowIndex + 1}</td>
                                      <td>{row.SampleName}</td>
                                      <td>{row.ColorName}</td>
                                      <td>{row.ReferenceMasterID}</td>
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

export default SampleTypeCreate;
