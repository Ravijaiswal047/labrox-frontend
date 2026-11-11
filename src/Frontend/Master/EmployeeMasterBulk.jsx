import { useEffect, useMemo, useRef, useState } from "react";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import Heading from "../../components/UI/Heading";
import Accordion from "../../components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import Pagination from "../../Pagination/Pagination";

const EmployeeMasterBulk = () => {
    const [t] = useTranslation();
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authUserId, setAuthUserId] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [centre, setCentre] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [data, setData] = useState([]);

    // Separate state for header filters
    const [headerFilters, setHeaderFilters] = useState({
        Centre: "",
        Designation: "",
    });

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message;

            const allCentreIDs = data.map(ele => ele.CentreID).join(',');

            const CentreDataValue = data.map((ele) => ({
                value: ele.CentreID,
                label: ele.Centre,
            }));

            setCentre(CentreDataValue);
        } catch (error) {
            console.log("Error while fetching centres", error);
        }
    };

    const getDesignationData = async () => {
        try {
            const res = await axiosInstance.get("Designation/getDesignation");
            const data = res.data.message;
            console.log("Data designaion", data)
            const DesignationData = data.map((ele) => ({
                value: ele?.DesignationID,
                label: ele?.DesignationName,
            }));
            setDesignation(DesignationData);
        } catch (err) {
            console.log("Error while fetching designations", err);
        }
    };

    useEffect(() => {
        getDesignationData();
        getAccessCentres();
    }, []);

    // Handle File Change
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
            toast.error("Only Excel files are allowed");
            return;
        }

        setFile(selectedFile);
    };

    // Handle Header Filter Change - applies to ALL rows
    const handleHeaderFilterChange = (name, value) => {
        const filterValue = value?.value !== undefined ? value.value : value;

        setHeaderFilters(prev => ({
            ...prev,
            [name]: filterValue
        }));

        // Apply to all rows
        setData((prevData) =>
            prevData.map((row) => ({
                ...row,
                [name]: filterValue,
            }))
        );
    };


    const handleTableSelectChange = (name, value, rowIndex) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIndex] = {
                ...newData[rowIndex],
                [name]: value?.value !== undefined ? value.value : value,
            };
            return newData;
        });
    };

    const handleSaveId = async () => {
        if (!data || data.length === 0) {
            toast.error("No data to save!");
            return;
        }

        if (invalidDesignation.length > 0 || invalidCentre.length > 0) {
            toast.error("First fix the Incorrect Fields!");
            return;
        }

        setLoading(true);
        const finalData = currentTableData.map((ele) => ({
            ...ele,
            EmployeeCode: ele?.EmployeeCode ? String(ele.EmployeeCode) : "",
            CentreID: String(ele?.Centre),
            Mobile: ele?.Mobile ? String(ele.Mobile) : "",
            isActive: 1,
        }));

        const lastPayload = {
            employeeMaster: finalData,
            userData: [
                {
                    designationId: "1,3",
                    username: "Rohit",
                    password: "Rohit123",
                    allowEditRanges: 1
                }
            ]
        }

        try {
            const res = await axiosInstance.post("Employee/SaveNewEmployeeRecord", lastPayload);

            if (res?.data?.success) {
                toast.success("Records saved successfully!");
                setData([]);
                setFile(null);
                setTotalCount(0);
                setCurrentPage(1);
                setHeaderFilters({
                    Centre: "",
                    Designation: ""
                });
            } else {
                toast.error(res?.data?.message || "Error while saving records");
            }
        } catch (error) {
            console.log("Error while saving", error);
            toast.error("Error while saving records");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to find matching option from dropdown
    const findMatchingOption = (options, value) => {
        if (!value) return null;

        const stringValue = String(value).trim();

        // Try exact match on value
        const exactMatch = options.find(opt => String(opt.value) === stringValue);
        if (exactMatch) return exactMatch.value;

        // Try exact match on label (case-insensitive)
        const labelMatch = options.find(opt =>
            opt.label.toLowerCase() === stringValue.toLowerCase()
        );
        if (labelMatch) return labelMatch.value;

        return null;
    };

    const handleImport = () => {
        if (!file) {
            toast.error("Please select a file first!");
            return;
        }

        setData([]);
        setFile(null);
        setTotalCount(0);
        setCurrentPage(1);
        setHeaderFilters({
            Centre: "",
            Designation: "",
            isSalesPerson: "",
            isFieldBoy: ""
        });


        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const binaryStr = e.target.result;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                const cleanedData = jsonData.map((row) => {
                    const cleanedRow = {};

                    Object.keys(row).forEach((key) => {
                        let value = row[key];
                        let cleanedKey = key.trim();

                        if (cleanedKey === "Sample Type") {
                            cleanedKey = "SampleType";
                        } else if (cleanedKey === "Final Price") {
                            cleanedKey = "MRP";
                        }

                        if (cleanedKey === "SampleType" && typeof value === "string") {
                            cleanedRow[cleanedKey] = value
                                .split(",")
                                .map(item => item.trim())
                                .filter(Boolean);
                        } else if (cleanedKey === "SampleType" && !value) {
                            cleanedRow[cleanedKey] = [];
                        } else {
                            cleanedRow[cleanedKey] = value;
                        }
                    });

                    // Auto-match Centre
                    if (cleanedRow.Centre) {
                        const matchedCentre = findMatchingOption(centre, cleanedRow.Centre);
                        if (matchedCentre !== null) {
                            cleanedRow.Centre = matchedCentre;
                        }
                    }

                    // Auto-match Designation
                    if (cleanedRow.Designation) {
                        const matchedDesignation = findMatchingOption(designation, cleanedRow.Designation);
                        if (matchedDesignation !== null) {
                            cleanedRow.Designation = matchedDesignation;
                        }
                    }

                    // Auto-match isSalesPerson
                    if (cleanedRow.isSalesPerson !== undefined && cleanedRow.isSalesPerson !== "") {
                        const stringValue = String(cleanedRow.isSalesPerson).toLowerCase().trim();
                        if (stringValue === "yes" || stringValue === "1" || stringValue === "true") {
                            cleanedRow.isSalesPerson = 1;
                        } else if (stringValue === "no" || stringValue === "0" || stringValue === "false") {
                            cleanedRow.isSalesPerson = 0;
                        }
                    }

                    // Auto-match isFieldBoy
                    if (cleanedRow.isFieldBoy !== undefined && cleanedRow.isFieldBoy !== "") {
                        const stringValue = String(cleanedRow.isFieldBoy).toLowerCase().trim();
                        if (stringValue === "yes" || stringValue === "1" || stringValue === "true") {
                            cleanedRow.isFieldBoy = 1;
                        } else if (stringValue === "no" || stringValue === "0" || stringValue === "false") {
                            cleanedRow.isFieldBoy = 0;
                        }
                    }

                    return cleanedRow;
                });

                setData(cleanedData);
                setTotalCount(cleanedData.length);
                setCurrentPage(1);

                // Reset header filters on new import
                setHeaderFilters({
                    Centre: "",
                    Designation: "",
                });

                toast.success(`Imported ${cleanedData.length} records successfully!`);
            } catch (error) {
                console.error("Error importing file:", error);
                toast.error("Error importing file. Please check the format.");
            }
        };

        reader.readAsBinaryString(file);
    };

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        return data.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, pageSize, data]);

    const validDesignations = designation.map(opt => String(opt.value));

    const invalidDesignation = data
        .map((item, index) => {
            const value = String(item?.Designation || "").trim();

            if (value && !validDesignations.includes(value)) {
                return {
                    serialNo: index + 1,
                    designation: item?.Designation
                };
            }
            return null;
        })
        .filter(Boolean);

    const validCentres = centre
        .filter(c => c.label !== "All")
        .map(opt => String(opt.value));

    const invalidCentre = data
        .map((item, index) => {
            const value = String(item?.Centre || "").trim();
            if (value && !validCentres.includes(value)) {
                return {
                    serialNo: index + 1,
                    centre: item?.Centre
                };
            }
            return null;
        })
        .filter(Boolean);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (!droppedFile) return;

        if (!droppedFile.name.match(/\.(xlsx|xls)$/)) {
            toast.error("Only Excel files are allowed");
            return;
        }

        setFile(droppedFile);
    };

    const hasError = invalidDesignation.length > 0 || invalidCentre.length > 0;

    const COLLAPSED_HEIGHT = 100;
    const STEP_HEIGHT = 120;
    const [currentHeight, setCurrentHeight] = useState(COLLAPSED_HEIGHT);
    const containerRef = useRef(null);

    const handleAuthorizeAndSave = async () => {
        if (!authUserId || !authPassword) {
            toast.error("User ID and Password are required");
            return;
        }

        setAuthLoading(true);

        try {
            const res = await axiosInstance.post("Auth/AuthorizeUser", {
                userId: authUserId,
                password: authPassword
            });

            if (res?.data?.success) {
                toast.success("Authorization successful");
                setShowAuthModal(false);
                setAuthUserId("");
                setAuthPassword("");
                await handleSaveId();
            } else {
                toast.error(res?.data?.message || "Authorization failed");
            }
        } catch (error) {
            console.error("Authorization error", error);
            toast.error("Invalid credentials");
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <>
            <Heading title={"Employee Master Bulk"} />

            <div className="p-2 d-flex align-items-center gap-4 row">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-dotted cursor-pointer rounded my-2 text-center ${isDragging ? "border-primary bg-light" : "border-secondary"
                        }`}
                    style={{
                        cursor: "pointer",
                        minWidth: "280px",
                        border: "2px dotted"
                    }}
                >
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="d-none"
                        id="excelUpload"
                    />

                    <label htmlFor="excelUpload" className="w-100 m-0 cursor-pointer">
                        {file ? (
                            <strong>{file.name}</strong>
                        ) : (
                            <span>Drag & drop Excel file here or click to upload</span>
                        )}
                    </label>
                </div>

                <CustomButton
                    className="mx-2"
                    text="Import"
                    icon="excel"
                    onClick={handleImport}
                    disabled={!file}
                />

                <SaveButton
                    className="mx-2"
                    text="Save"
                    onClick={handleSaveId}
                    disabled={loading || data.length === 0}
                />
            </div>

            {/* Error Display Section */}
            {hasError && (
                <>
                    <div
                        ref={containerRef}
                        style={{
                            maxHeight: `${currentHeight}px`,
                            overflow: "hidden",
                            transition: "max-height 0.3s ease"
                        }}
                    >
                        <div className="text-danger fw-bold mt-3">Errors Found</div>
                        <table className="table table-bordered table-sm">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "150px" }}>Field Name</th>
                                    <th style={{ width: "200px" }}>Invalid Values</th>
                                    <th style={{ width: "150px" }}>Row Numbers</th>
                                </tr>
                            </thead>

                            <tbody>
                                {invalidDesignation.length > 0 && (
                                    <tr>
                                        <td className="fw-bold">Designation</td>
                                        <td className="text-danger">
                                            {[...new Set(invalidDesignation.map(item => item.designation))].join(", ")}
                                        </td>
                                        <td className="text-danger fw-bold">
                                            {invalidDesignation.map(item => item.serialNo).join(", ")}
                                        </td>
                                    </tr>
                                )}

                                {invalidCentre.length > 0 && (
                                    <tr>
                                        <td className="fw-bold">Centre</td>
                                        <td className="text-danger">
                                            {[...new Set(invalidCentre.map(item => item.centre))].join(", ")}
                                        </td>
                                        <td className="text-danger fw-bold">
                                            {invalidCentre.map(item => item.serialNo).join(", ")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <CustomButton
                        className="my-2"
                        onClick={() => {
                            const fullHeight = containerRef.current?.scrollHeight || 0;
                            if (currentHeight >= fullHeight) {
                                setCurrentHeight(COLLAPSED_HEIGHT);
                            } else {
                                setCurrentHeight(prev =>
                                    Math.min(prev + STEP_HEIGHT, fullHeight)
                                );
                            }
                        }}
                        text={
                            currentHeight >= (containerRef.current?.scrollHeight || 0)
                                ? "Show Less"
                                : "Show More"
                        }
                    />
                </>
            )}

            {/* Data Table */}
            <Accordion title={"Imported Data"} defaultValue={true}>
                {data.length > 0 ? (
                    <Tables
                        className="table table-bordered text-center"
                        style={{
                            maxHeight: "500px",
                            overflowY: "auto",
                        }}
                    >
                        <thead className="table-light sticky-top">
                            <tr>
                                <th style={{ minWidth: "60px" }}>S.No</th>
                                {Object.keys(data[0]).map((key) => (
                                    <th key={key} style={{ minWidth: "150px" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            <span>
                                                {key === "Centre" || key === "Designation" || key === "isSalesPerson" || key === "isFieldBoy" ? "" : key}
                                            </span>

                                            {key === "Centre" && (
                                                <ReactSelect
                                                    dynamicOptions={centre}
                                                    name="Centre"
                                                    placeholderName="Centre"
                                                    removeIsClearable
                                                    value={headerFilters.Centre}
                                                    onChange={handleHeaderFilterChange}
                                                />
                                            )}

                                            {key === "Designation" && (
                                                <ReactSelect
                                                    dynamicOptions={designation}
                                                    placeholderName="Designation"
                                                    name={"Designation"}
                                                    label="Designation"
                                                    removeIsClearable
                                                    value={headerFilters.Designation}
                                                    onChange={handleHeaderFilterChange}
                                                />
                                            )}

                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {console.log("Current Table Data", currentTableData)}

                        <tbody>
                            {currentTableData.map((row, index) => {
                                const serialNumber = (currentPage - 1) * pageSize + index + 1;
                                const actualIndex = (currentPage - 1) * pageSize + index;

                                const designationValue = String(row?.Designation || "").trim();
                                const centreValue = String(row?.Centre || "").trim();

                                const isDesignationValid = !designationValue || validDesignations.includes(designationValue);
                                const isCentreValid = !centreValue || validCentres.includes(centreValue);
                                const isRowValid = isDesignationValid && isCentreValid;

                                return (
                                    <tr
                                        key={actualIndex}
                                        style={{
                                            backgroundColor: isRowValid ? "transparent" : "#ffcccc",
                                        }}
                                    >
                                        <td>{serialNumber}</td>

                                        {Object.keys(row).map((key) => {
                                            if (key === "Designation") {
                                                return (
                                                    <td key={key} className="align-middle">
                                                        <ReactSelect
                                                            dynamicOptions={designation}
                                                            name="Designation"
                                                            id={`Designation-${actualIndex}`}
                                                            label={"Designation"}
                                                            removeIsClearable
                                                            value={row.Designation || ""}
                                                            onChange={(name, value) =>
                                                                handleTableSelectChange(name, value, actualIndex)
                                                            }
                                                        />
                                                    </td>
                                                );
                                            } else if (key === "Centre") {
                                                return (
                                                    <td key={key} className="align-middle">
                                                        <ReactSelect
                                                            dynamicOptions={centre}
                                                            name="Centre"
                                                            id={`Centre-${actualIndex}`}
                                                            label={"Centre"}
                                                            removeIsClearable
                                                            value={row.Centre || ""}
                                                            onChange={(name, value) =>
                                                                handleTableSelectChange(name, value, actualIndex)
                                                            }
                                                        />
                                                    </td>
                                                );
                                            }
                                            else {
                                                return (
                                                    <td key={key} className="align-middle">
                                                        <span title={row[key]}>
                                                            {row[key] || "N/A"}
                                                        </span>
                                                    </td>
                                                );
                                            }
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Tables>
                ) : (
                    <div className="text-center p-4">
                        <p>No data imported yet. Please upload an Excel file.</p>
                    </div>
                )}
            </Accordion>

            {data.length > 25 && (
                <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-3">
                    <div style={{ minWidth: '150px' }}>
                        <ReactSelect
                            value={pageSize}
                            dynamicOptions={[
                                { label: '25', value: 25 },
                                { label: '50', value: 50 },
                                { label: '100', value: 100 },
                                { label: '150', value: 150 },
                            ]}
                            name="pageSize"
                            label={t("Page Size")}
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
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}

            {/* Authorization Modal */}
            {showAuthModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-sm modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Authorization Required</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowAuthModal(false);
                                        setAuthUserId("");
                                        setAuthPassword("");
                                    }}
                                    disabled={authLoading}
                                />
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">User ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={authUserId}
                                        onChange={(e) => setAuthUserId(e.target.value)}
                                        autoFocus
                                        disabled={authLoading}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={authPassword}
                                        onChange={(e) => setAuthPassword(e.target.value)}
                                        disabled={authLoading}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAuthorizeAndSave();
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowAuthModal(false);
                                        setAuthUserId("");
                                        setAuthPassword("");
                                    }}
                                    disabled={authLoading}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleAuthorizeAndSave}
                                    disabled={authLoading}
                                >
                                    {authLoading ? "Authorizing..." : "Authorize & Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployeeMasterBulk;