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

const MembershipCardImportExportModal = ({
    open,
    onClose,
    membershipOptions,
    membershipId,
}) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const fileInputRef = useRef(null);
    const isMobile = window.innerWidth <= 768;

    const [selectedMembershipId, setSelectedMembershipId] = useState(membershipId || "");
    const [previewData, setPreviewData] = useState([]);
    const [load, setLoad] = useState({ download: false, upload: false, save: false });

    useEffect(() => {
        setSelectedMembershipId(membershipId || "");
    }, [membershipId, open]);

    useEffect(() => {
        if (!open) {
            setPreviewData([]);
        }
    }, [open]);

    const handleDownload = () => {
        if (!selectedMembershipId) {
            toast.warning(t("Please select a Membership Card before downloading."));
            return;
        }
        setLoad(prev => ({ ...prev, download: true }));
        axiosInstance
            .post("MembershipCardMaster/GetMembershipCardTestsExport", {
                membershipCardId: selectedMembershipId,
            })
            .then((res) => {
                if (res.data?.success && Array.isArray(res.data?.message) && res.data.message.length > 0) {
                    const label =
                        membershipOptions?.find(m => String(m.value) === String(selectedMembershipId))?.label || "Membership";
                    const fileName = `MembershipMapping_${label.replace(/\s+/g, "_").substring(0, 20)}.xlsx`;
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

    console.log({previewData})

    const handleSave = () => {
        if (previewData.length === 0) return;
        setLoad(prev => ({ ...prev, save: true }));

        axiosInstance
            .post("MembershipCardMaster/ImportMembershipCardTests", previewData)
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

    const wrapColsConfig = {
        testname: { width: "350px" },
        itemname: { width: "200px" },
        testcode: { width: "120px" },
        subcategoryname: { width: "180px" },
        departmentname: { width: "180px" },
    };

    const getColWidth = (key) => {
        return wrapColsConfig[key.toLowerCase()]?.width || "100px";
    };

    const isWrapCol = (key) => {
        return !!wrapColsConfig[key.toLowerCase()];
    };

    const getColStyle = (key) => {
        if (isWrapCol(key)) {
            return {
                width: getColWidth(key),
                minWidth: getColWidth(key),
                maxWidth: getColWidth(key),
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
            };
        }
        return {
            width: "100px",
            minWidth: "80px",
            maxWidth: "130px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        };
    };

    const getHeaderStyle = (key) => ({
        ...getColStyle(key),
        position: "sticky",
        top: 0,
        zIndex: 1,
        backgroundColor: "var(--bs-table-bg, #fff)",
    });

    return (
        <Dialog
            header={t("Export / Import Membership Mapping")}
            visible={open}
            onHide={onClose}
            className={theme}
            style={{ width: isMobile ? "95vw" : "75vw" }}
        >
            <div className="row pt-2 pl-2 pr-2 mb-3">
                <div className="col-12 col-sm-4 col-md-3">
                    <ReactSelect
                        dynamicOptions={membershipOptions}
                        name="membershipId"
                        lable={t("Membership Card")}
                        id="importExportMembershipId"
                        removeIsClearable={true}
                        placeholderName={t("Membership Card")}
                        value={selectedMembershipId}
                        onChange={(_name, option) => setSelectedMembershipId(option?.value ?? "")}
                    />
                </div>
                <div className="col-auto">
                    <CustomButton
                        text={load.download ? t("Downloading...") : t("Export (Download)")}
                        icon="download"
                        onClick={handleDownload}
                        disabled={load.download}
                    />
                </div>
                <div className="col-auto">
                    <CustomButton
                        text={load.upload ? t("Reading...") : t("Import (Upload Excel)")}
                        icon="excel"
                        onClick={handleUploadClick}
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
                    <div className="col-12" style={{ overflowX: "auto" }}>
                        <Tables>
                            <colgroup>
                                {Object.keys(previewData[0]).map((key, i) => (
                                    <col key={i} style={{ width: getColWidth(key) }} />
                                ))}
                            </colgroup>
                            <thead>
                                <tr>
                                    {Object.keys(previewData[0]).map((key, i) => (
                                        <th key={i} style={getHeaderStyle(key)}>
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {Object.keys(row).map((key, colIndex) => (
                                            <td key={colIndex} style={getColStyle(key)}>
                                                {row[key]}
                                            </td>
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
                            disabled={load.save || load.download || load.upload}
                        />
                    </div>
                </div>
            )}
        </Dialog>
    );
};

export default MembershipCardImportExportModal;
