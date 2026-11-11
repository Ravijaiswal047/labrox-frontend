import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { axiosInstance } from "../../utils/axiosInstance";
import { ExportToExcel } from "../../utils/helpers";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";

const FamilyDiscountImportExportModal = ({
    open,
    onClose,
    policyOptions,
    policyId,
}) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const fileInputRef = useRef(null);
    const isMobile = window.innerWidth <= 768;

    const [selectedPolicyId, setSelectedPolicyId] = useState(policyId || "");
    const [previewData, setPreviewData] = useState([]);
    const [load, setLoad] = useState({ download: false, upload: false, save: false });

    useEffect(() => {
        setSelectedPolicyId(policyId || "");
    }, [policyId, open]);

    useEffect(() => {
        if (!open) {
            setPreviewData([]);
        }
    }, [open]);

    const handlePolicyChange = (name, option) => {
        setSelectedPolicyId(option?.value ?? "");
    };

    const handleDownload = () => {
        if (!selectedPolicyId) {
            toast.warning(t("Please select a Policy before downloading."));
            return;
        }
        setLoad(prev => ({ ...prev, download: true }));
        axiosInstance
            .post("Employee/GetInvestigationWithPolicyTemplate", {
                policyID: selectedPolicyId,
            })
            .then((res) => {
                if (res.data?.success && Array.isArray(res.data?.message)) {
                    const policyLabel =
                        policyOptions?.find(p => String(p.value) === String(selectedPolicyId))?.label || "Policy";
                    const fileName = `FamilyDiscount_${policyLabel.replace(/\s+/g, "_").substring(0, 20)}.xlsx`;
                    ExportToExcel(res.data.message, fileName);
                } else {
                    toast.error(res?.data?.message || t("No data found"));
                }
            })
            .catch(() => toast.error(t("Error downloading data")))
            .finally(() => setLoad(prev => ({ ...prev, download: false })));
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoad(prev => ({ ...prev, upload: true }));
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                let jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                jsonData = jsonData.map(row => {
                    const updated = {};
                    Object.keys(row).forEach(key => {
                        updated[key] = typeof row[key] === "number" ? Number(row[key].toFixed(2)) : row[key];
                    });
                    return updated;
                });
                if (jsonData.length === 0) {
                    toast.error(t("The uploaded file is empty."));
                } else {
                    setPreviewData(jsonData);
                }
            } catch {
                toast.error(t("Error reading file."));
            } finally {
                setLoad(prev => ({ ...prev, upload: false }));
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSave = () => {
        if (previewData.length === 0) return;
        if (!selectedPolicyId) {
            toast.warning(t("Please select a Policy before saving."));
            return;
        }
        setLoad(prev => ({ ...prev, save: true }));
        axiosInstance
            .post("Employee/ImportFamilyDiscountPolicyItems", previewData)
            .then((res) => {
                if (res.data?.success) {
                    toast.success(res.data.message);
                    setPreviewData([]);
                    onClose();
                } else {
                    toast.error(res.data?.message || t("Something went wrong"));
                }
            })
            .catch(() => toast.error(t("Error while saving data")))
            .finally(() => setLoad(prev => ({ ...prev, save: false })));
    };

    const colWidths = {
        PolicyID: "80px",
        DepartmentName: "100px",
        PolicyName: "150px",
        TestName: "300px",
    };
    const getColStyle = (key) => {
        const width = colWidths[key];
        if (width) {
            return { minWidth: width, maxWidth: width, whiteSpace: "normal", wordBreak: "break-word" };
        }
        return { whiteSpace: "nowrap" };
    };

    return (
        <Dialog
            header={t("Export / Import Family Discount")}
            visible={open}
            onHide={onClose}
            className={theme}
            style={{ width: isMobile ? "95vw" : "70vw" }}
            breakpoints={{ "98%": "69vw" }}
        >
            <div className="row col-12 pt-2 pl-2 pr-2 mb-3 align-items-end">
                <div className="col-12 col-sm-4 col-md-3">
                    <ReactSelect
                        dynamicOptions={policyOptions}
                        name="policyId"
                        lable={t("Policy")}
                        id="importExportPolicyId"
                        removeIsClearable={true}
                        placeholderName={t("Policy")}
                        value={selectedPolicyId}
                        onChange={handlePolicyChange}
                    />
                </div>

                <div className="col-auto">
                    <CustomButton
                        text={t("Export (Download)")}
                        icon="download"
                        onClick={handleDownload}
                        loading={load.download}
                        disabled={load.download}
                    />
                </div>

                <div className="col-auto">
                    <CustomButton
                        text={t("Import (Upload Excel)")}
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

            {previewData.length > 0 && (
                <div className="row p-2">
                    <div className="col-12">
                        <Tables style={{ maxHeight: "340px", overflowY: "auto" }}>
                            <thead>
                                <tr>
                                    {Object.keys(previewData[0]).map((key, i) => (
                                        <th key={i} style={getColStyle(key)}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {Object.keys(row).map((key, colIndex) => (
                                            <td key={colIndex} style={getColStyle(key)}>{row[key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    </div>
                    <div className="col-12 mt-2 d-flex justify-content-end">
                        <SaveButton
                            text={t("Save Data")}
                            onClick={handleSave}
                            loading={load.save}
                            disabled={load.save || load.download || load.upload}
                        />
                    </div>
                </div>
            )}
        </Dialog>
    );
};

export default FamilyDiscountImportExportModal;
