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
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Pagination from "../../Pagination/Pagination";

const InvestigationMaster = () => {
    //InvestigationMaster
    const [t] = useTranslation();
    const [file, setFile] = useState(null);
    const [department, setDepartment] = useState([])
    const [sampleData, setsampleData] = useState([])
    const [isDragging, setIsDragging] = useState(false);

    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authUserId, setAuthUserId] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);


    const [data, setData] = useState([]);

    const dataTypeOptions = [
        { label: "Test", value: "Test" },
        { label: "Profile", value: "Profile" },
        { label: "Package", value: "Package" },
    ];

    const outSourceOptions = [
        { label: "No", value: 0 },
        { label: "Yes", value: 1 },
    ];

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const getDepartments = () => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                const data = res.data.message;
                const DeptDataValue = data.map((ele) => {
                    return {
                        value: ele?.Department,
                        label: ele?.Department,
                    };
                });
                setDepartment(DeptDataValue);
                console.log("departemnet", DeptDataValue)
            })
            .catch((err) => console.log(err));
    };


    const getSampleType = () => {
        axiosInstance
            .get("SampleType/getSampleTypeByInvestigation")
            .then((res) => {
                let data = res.data.message;

                let SampleType = data.map((ele) => {
                    return {
                        value: ele.SampleName,
                        label: ele.SampleName,
                        sampleTypeId: ele.id
                    };
                });
                return setsampleData(SampleType);

            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        getDepartments();
        getSampleType();
    }, [])

    const handleTableSelectChange = (name, value, rowData) => {
        console.log(name, value, rowData);

        const uniqueId = rowData.InvestigationID;

        setData((prevData) => {
            const rowIndexToUpdate = prevData.findIndex(
                (item) => item.InvestigationID === uniqueId
            );
            if (rowIndexToUpdate === -1) {
                console.error("Could not find row with TestIDHash:", uniqueId);
                return prevData;
            }
            const newData = [...prevData];
            newData[rowIndexToUpdate] = {
                ...newData[rowIndexToUpdate],
                [name]: value?.value,
            };

            return newData;
        });
    };

    const handleTableMultiSelectChange = (name, value, rowData) => {
        console.log(name, value, rowData);

        const uniqueId = rowData.InvestigationID;

        setData((prevData) => {
            const rowIndexToUpdate = prevData.findIndex(
                (item) => item.InvestigationID === uniqueId
            );
            if (rowIndexToUpdate === -1) {
                console.error("Could not find row with TestIDHash:", uniqueId);
                return prevData;
            }
            const newData = [...prevData];
            newData[rowIndexToUpdate] = {
                ...newData[rowIndexToUpdate],
                [name]: value,
            };

            return newData;
        });
    };


    const handleSaveId = async () => {
        if (!data || data.length === 0) {
            toast.error("No data to save!");
            return;
        }

        if (invalidDataTypeIndexes.length > 0 || invalidDepartment.length > 0) {
            toast.error("First fix the Incorrect Fields!");
            return;
        }

        const oldArray = [];
        const newArray = [];
        const sampleTypeArray = [];
        const invalidArray = [];

        data.forEach((row) => {
            const rawId = row?.InvestigationID;
            const id = String(rawId).trim();
            const testCode = row?.TestCode || "";
            const firstSample =
                Array.isArray(row?.SampleType) && row.SampleType.length > 0
                    ? row.SampleType[0]
                    : null;

            const firstSampleValue =
                typeof firstSample === "object" ? firstSample.value : firstSample;

            const firstSampleObj = sampleData.find(
                e => e.value === firstSampleValue
            );

            const baseRow = {
                testCode: testCode,
                testName: row?.TestName || "",
                departmentName: row?.Department || "",
                mrp: row?.MRP || 0,
                sampleType: firstSampleObj?.label || "",
                sampleTypeId: firstSampleObj?.sampleTypeId || 0,
                departmentId: row?.DepartmentId || 0
            };


            if (id.toLowerCase() === "new") {
                newArray.push(baseRow);
            }
            else if (!isNaN(id) && id !== "") {
                oldArray.push({
                    ...baseRow,
                    investigationID: Number(id)
                });
            }
            else {
                invalidArray.push(row);
                return;
            }


            if (Array.isArray(row?.SampleType) && row.SampleType.length > 1) {
                row.SampleType.forEach(st => {
                    const value = typeof st === "object" ? st.value : st;
                    const obj = sampleData.find(e => e.value === value);

                    if (obj) {
                        sampleTypeArray.push({
                            sampleTypeId: obj.sampleTypeId,
                            sampleType: obj.label,
                            investigationId: id.toLowerCase() === "new" ? 0 : Number(id),
                            testCode: testCode
                        });
                    }
                });
            }
        });

        if (invalidArray.length > 0) {
            toast.error("Invalid InvestigationID found!");
            return;
        }

        const payload = {
            oldArray,
            newArray,
            sampleTypeArray
        };
        setLoading(true)
        try {
            const res = await axiosInstance.post("Investigations/DOSUploadMaster", payload);
            const data = res?.data;
            if (data?.success) {
                toast.success("Record saved successfully.")
            } else {
                toast.success("Error while saving record.")

            }
        } catch (error) {
            console.log("Error while saving", error)
        } finally {
            setLoading(false)
        }
    };


    const handleImport = () => {
        if (!file) {
            toast.error("Please select file first!");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            const cleanedData = jsonData.map((row) => {
                const cleanedRow = {};

                Object.keys(row).forEach((key) => {
                    let value = row[key];


                    let cleanedKey = key;

                    if (key === "Sample Type") {
                        cleanedKey = "SampleType";
                    } else if (key === "Final Price") {
                        cleanedKey = "MRP";
                    }

                    if (cleanedKey === "SampleType" && typeof value === "string") {
                        cleanedRow[cleanedKey] = value
                            .split(",")
                            .map(item => item.trim());
                    } else if (cleanedKey === "SampleType" && !value) {
                        cleanedRow[cleanedKey] = [];
                    } else {
                        cleanedRow[cleanedKey] = value;
                    }
                });

                return cleanedRow;
            });

            setData(cleanedData);
            setTotalCount(cleanedData.length);
            setCurrentPage(1);
        };

        reader.readAsBinaryString(file);
    };

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        return data.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, pageSize, data]);


    const validDataTypes = dataTypeOptions.map(
        opt => opt.value.toLowerCase()
    );

    const invalidDataTypeIndexes = data
        .map((item, index) => {
            const value = item?.DataType?.toLowerCase()?.trim();

            if (value && !validDataTypes.includes(value)) {
                return {
                    serialNo: index + 1,
                    dataType: item?.DataType
                };
            }
            return null;
        })
        .filter(Boolean);

    const validDepartments = department.map(
        opt => opt.value.toLowerCase()
    );

    const invalidDepartment = data
        .map((item, index) => {
            const value = item?.Department?.toLowerCase()?.trim();

            if (value && !validDepartments.includes(value)) {
                return {
                    serialNo: index + 1,
                    department: item?.Department
                };
            }
            return null;
        })
        .filter(Boolean);


    const validSampleTypes = sampleData.map(
        opt => opt.value.toLowerCase()
    );

    const invalidSampleType = data
        .map((item, index) => {
            const sampleTypes = item?.SampleType;

            if (!Array.isArray(sampleTypes) || sampleTypes.length === 0) {
                return {
                    serialNo: index + 1,
                    SampleName: "Empty"
                };
            }

            const values = sampleTypes.map(st =>
                typeof st === "string"
                    ? st.toLowerCase().trim()
                    : st?.value?.toLowerCase().trim()
            );

            const invalidValues = values.filter(
                val => !validSampleTypes.includes(val)
            );

            if (invalidValues.length > 0) {
                return {
                    serialNo: index + 1,
                    SampleName: invalidValues.join(", ")
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

    const hasError =
        invalidDataTypeIndexes.length > 0 ||
        invalidDepartment.length > 0 ||
        invalidSampleType.length > 0;

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
            // const res = await axiosInstance.post("Auth/AuthorizeUser", {
            //     userId: authUserId,
            //     password: authPassword
            // });

            if (res?.data?.success) {
                toast.success("Authorization successful");

                setShowAuthModal(false);
                setAuthUserId("");
                setAuthPassword("");

                
                handleSaveId();
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
            <Heading title={"Investigation Master"} />
            <div className="p-2 d-flex align-items-center gap-4 row ">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-dotted cursor-pointer rounded p-3 text-center ${isDragging ? "border-primary bg-light" : "border-secondary"
                        }`}
                    style={{ cursor: "pointer", minWidth: "280px", border: "dotted" }}
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
                    className=" mx-2"
                    text="Import"
                    icon="excel"
                    onClick={handleImport}
                />

                <SaveButton
                    className=" mx-2"
                    text="Save"
                    onClick={() => setShowAuthModal(true)}
                    disabled={loading}
                />

            </div>

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
                        <div className="text-danger fw-bold text-bold mt-3">Errors</div>
                        <table className="table table-bordered table-sm ">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "100px" }}>Name</th>
                                    <th style={{ width: "100px" }}>Value</th>
                                    <th style={{ width: "100px" }}>S. No</th>
                                </tr>
                            </thead>

                            <tbody>
                                {invalidDataTypeIndexes.length > 0 && (
                                    <tr>
                                        <td className="fw-bold">Data Type</td>
                                        <td className="text-danger">
                                            {[...new Set(invalidDataTypeIndexes.map(item => item.dataType))].join(", ")}
                                        </td>
                                        <td className="text-danger fw-bold">
                                            {invalidDataTypeIndexes.map(item => item.serialNo).join(", ")}
                                        </td>
                                    </tr>
                                )}

                                {invalidDepartment.length > 0 && (
                                    <tr>
                                        <td className="fw-bold">Department</td>
                                        <td className="text-danger">
                                            {[...new Set(invalidDepartment.map(item => item.department))].join(", ")}
                                        </td>
                                        <td className="text-danger fw-bold">
                                            {invalidDepartment.map(item => item.serialNo).join(", ")}
                                        </td>
                                    </tr>
                                )}

                                {invalidSampleType.length > 0 && (
                                    <tr>
                                        <td className="fw-bold">Sample Type</td>
                                        <td className="text-danger">
                                            {[...new Set(invalidSampleType.map(item => item.SampleName))].join(", ")}
                                        </td>
                                        <td className="text-danger fw-bold">
                                            {invalidSampleType.map(item => item.serialNo).join(", ")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <CustomButton
                        className="my-2"
                        onClick={() => {
                            const fullHeight = containerRef.current.scrollHeight;

                            if (currentHeight >= fullHeight) {
                                setCurrentHeight(COLLAPSED_HEIGHT);
                            } else {
                                setCurrentHeight(prev =>
                                    Math.min(prev + STEP_HEIGHT, fullHeight)
                                );
                            }
                        }}
                        text={currentHeight >= containerRef.current?.scrollHeight
                            ? "Show Less"
                            : "Show More"
                        }
                    />

                </>
            )}

            <Accordion title={"Search Data"} defaultValue={true}>
                {data.length > 0 && (
                    <Tables
                        className="table table-bordered text-center"
                        style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                        }}
                    >
                        <thead
                            style={{
                                marginTop: "300px"
                            }}
                        >
                            <tr>
                                <th>S.No</th>
                                {Object.keys(data[0]).map((key) => (
                                    <th key={key}
                                        style={{
                                            // textAlign: "center"
                                        }}
                                    >{key}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>

                            {currentTableData.map((row, index) => {

                                const serialNumber = (currentPage - 1) * pageSize + index + 1;

                                const dataType = row?.DataType?.toLowerCase()?.trim() || "";
                                const departmentValue = row?.Department?.trim() || "";
                                const SampleTypeArray = Array.isArray(row?.SampleType) ? row.SampleType : [];

                                const validDataTypes = dataTypeOptions.map(opt => opt.value.toLowerCase());
                                const validDepartments = department.map(opt => opt.value);
                                const validSampleTypes = sampleData.map(opt => opt.value);

                                const isDataTypeValid = dataType && validDataTypes.includes(dataType);
                                const isDepartmentValid = departmentValue && validDepartments.includes(departmentValue);

                                const isSampleDataValid = SampleTypeArray.length > 0 &&
                                    SampleTypeArray.every(item => {
                                        const val = typeof item === "string" ? item : item?.value;
                                        return validSampleTypes.includes(val);
                                    });

                                const isRowValid = isDataTypeValid && isDepartmentValid && isSampleDataValid;

                                return (
                                    <tr
                                        key={index}
                                        style={{
                                            backgroundColor: isRowValid ? "transparent" : "#ffcccc",
                                        }}
                                    >

                                        <td>{serialNumber}</td>

                                        {Object.keys(row).map((key) => (
                                            <td key={key} className="align-middle">
                                                {key === "DataType" ? (
                                                    <ReactSelect
                                                        dynamicOptions={dataTypeOptions}
                                                        name="DataType"
                                                        id={`DataType-${index}`}
                                                        removeIsClearable
                                                        value={row?.DataType}
                                                        onChange={(name, value) =>
                                                            handleTableSelectChange(name, value, row)
                                                        }
                                                    />
                                                ) : key === "Department" ? (
                                                    <ReactSelect
                                                        dynamicOptions={department}
                                                        name="Department"
                                                        id={`Department-${index}`}
                                                        removeIsClearable
                                                        value={row?.Department}
                                                        onChange={(name, value) =>
                                                            handleTableSelectChange(name, value, row)
                                                        }
                                                    />
                                                ) : key === "SampleType" ? (
                                                    <MultiSelectComp
                                                        options={sampleData}
                                                        value={row?.SampleType}
                                                        name="SampleType"
                                                        id={`SampleType-${index}`}
                                                        onChange={(name, value) =>
                                                            handleTableMultiSelectChange(name, value, row)
                                                        }
                                                    />
                                                ) : key === "OutSource" ? (
                                                    <ReactSelect
                                                        dynamicOptions={outSourceOptions}
                                                        name="OutSource"
                                                        id={`OutSource-${index}`}
                                                        removeIsClearable
                                                        value={row?.OutSource ? row?.OutSource : 0}
                                                        onChange={(name, value) =>
                                                            handleTableSelectChange(name, value, row)
                                                        }
                                                    />
                                                ) : (
                                                    row[key]
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Tables>
                )}
            </Accordion>

            {data.length > 0 && (
                <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
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
                </div>
            )}

            {showAuthModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-sm modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Authorization Required</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAuthModal(false)}
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
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={authPassword}
                                        onChange={(e) => setAuthPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowAuthModal(false)}
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

export default InvestigationMaster;
