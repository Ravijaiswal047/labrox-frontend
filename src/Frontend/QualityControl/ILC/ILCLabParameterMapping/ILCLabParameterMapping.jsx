import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import { ViewMenu } from "../../../../components/SvgIcons";
import ILCFrameMenu from "../ILCFrameMenu";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../../components/Table/CustomTable";
import { CustomButton, SaveButton } from "../../../../components/UI/CustomButton";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import { SelectBoxWithCheckbox } from "../../../../components/formComponent/MultiSelectBox";
import { apiUrls } from "../../../../utils/apiUrls";
import FilterInput from "../../../../components/Filter/FilterInput";
import useGlobalSearch from "../../../../utils/CustomHooks/useGlobalSearch";
import { validateRequiredFields } from "../../../../utils/helpers";
import { months } from "../../../../utils/Constants";

const ILCLabParameterMapping = () => {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [department, setDepartment] = useState([]);
    const [centreData, setCentreData] = useState([]);
    const [deptTest, setDeptTest] = useState([]);
    const [parameters, setParameters] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [LabOptions, setLabOptions] = useState([]);
    const [isHeaderLocked, setIsHeaderLocked] = useState(false);
    const [errors, setErrors] = useState({});

    const searchableKeys = [
        "ILCLab",
        "ILCLabType",
        "ProcessingLab",
        "ParameterID",
        "ParameterName",
    ];

    const [headerValues, setHeaderValues] = useState({
        Acceptability: "",
        Rate: "",
        StartFrom: "",
        Frequency: "",
    });
    

    const columns = [
        { header: "Sr No.", field: "srNo", width: "5%" },
        { header: "Processing Lab", field: "ProcessingLab" },
        { header: "ILC Lab Type", field: "ILCLabType" },
        { header: "ILC Lab", field: "ILCLab" },
        { header: "Test Type", field: "TestType" },
        { header: "Parameter ID", field: "ParameterID" },
        { header: "Parameter Name", field: "ParameterName" },

        {
            header: (
                <div className="d-flex flex-column">
                    <span className="fw-semibold mb-1">
                        Acceptability (%)
                    </span>

                    <input
                        type="number"
                        className="form-control "
                        placeholder="Enter %"
                        value={headerValues.Acceptability}
                        onChange={(e) =>
                            applyHeaderValueToAllRows("Acceptability", e.target.value)
                        }
                    />
                </div>
            ),
            field: "Acceptability",
            mobileLabel: "Acceptability (%)"

        },

        {
            header: (
                <div className="d-flex flex-column">
                    <span className="fw-semibold mb-1 mr-4">
                        Rate
                    </span>

                    <input
                        type="number"
                        className="form-control "
                        placeholder="Rate"
                        value={headerValues.Rate}
                        onChange={(e) =>
                            applyHeaderValueToAllRows("Rate", e.target.value)
                        }
                    />
                </div>
            ),
            field: "Rate",
            // width: "10%",
            mobileLabel: "Rate"
        },

        {
            header: (
                <div className="d-flex flex-column">
                    <span className="fw-semibold mb-1">
                        Start From
                    </span>

                    <select
                        className="form-select form-select-sm"
                        value={headerValues.StartFrom}
                        onChange={(e) =>
                            applyHeaderValueToAllRows("StartFrom", e.target.value)
                        }
                    >
                        <option value="">Select</option>
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>
            ),
            field: "StartFrom",
            mobileLabel: "Start From"
        },

        {
            header: (
                <div className="d-flex flex-column">
                    <span className="fw-semibold mb-1">
                        Freq (Month)
                    </span>

                    <input
                        type="number"
                        className="form-control "
                        placeholder="Frequency"
                        value={headerValues.Frequency}
                        onChange={(e) =>
                            applyHeaderValueToAllRows("Frequency", e.target.value)
                        }
                    />
                </div>
            ),
            field: "Frequency",
            mobileLabel: "Frequency"
        },
        { header: "Remove", field: "delete" },
    ];

    const {
        searchTerm,
        setSearchTerm,
        filteredData
    } = useGlobalSearch(tableData, searchableKeys);


    const [formData, setFormData] = useState({
        ProcessingLab: "1",
        CentreId: [],
        LabType: "",
        Department: "",
        Test: [],
        Parameter: [],
        ScheduleType: "ILC_REG",
    });

    const colorCodingData = [
        { color: "#7ee77b", id: "1", labelKey: "New Data" },
        { color: "#ffe58f", id: "2", labelKey: "Saved Data" },
    ];

    const applyHeaderValueToAllRows = (field, value) => {
        setHeaderValues((prev) => ({ ...prev, [field]: value }));

        setTableData((prev) =>
            prev.map((row) => ({
                ...row,
                [field]: value,
            }))
        );
    };

    const handleRowChange = (rowIndex, field, value) => {
        setTableData((prev) =>
            prev.map((row, index) =>
                index === rowIndex ? { ...row, [field]: value } : row
            )
        );
    };

    /* ---------- API CALLS ---------- */
    const getDepartments = async () => {
        try {
            const res = await axiosInstance.get("Department/getDepartment");
            setDepartment(
                res?.data?.message?.map((d) => ({
                    value: d.DepartmentID,
                    label: d.Department,
                }))
            );
        } catch {
            toast.error("Failed to load departments");
        }
    };

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("CommonController/GetAccessProcessingLab");
            if (res?.data?.success && Array.isArray(res?.data?.message)) {
                setCentreData(
                    res?.data?.message?.map((c) => ({
                        value: c.centreid,
                        label: c.centre,
                    }))
                )
            }
            else {
                setCentreData([]);
                toast.error("Failed to load centres");
            }

        } catch {
            toast.error("Failed to load centres");
        }
    };

    const getILCLab = async (CentreId, lab = "") => {
        console.log("Centre", CentreId);
        const apiPayload = {
            department: lab || formData?.ProcessingLab || "",
            processingCentre: CentreId?.join(",") || "",
            all: "0",
        }
        axiosInstance
            .post(apiUrls?.BindILC, apiPayload)
            .then((res) => {
                console.log("Bind ILC", res);
                if (res?.data?.success) {
                    const val = res?.data?.message?.map((c) => ({
                        value: c.centreid,
                        label: c.centre,
                    }))
                    setLabOptions(val);
                }
                else {
                    setLabOptions([]);
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message
                        ? err?.data?.message
                        : "Error Occured",
                );
            })
            .finally(() => {

            });
    }

    const getBindTest = async (department) => {

        axiosInstance
            .post(apiUrls?.BindTest, {
                departmentId: department?.toString() || ""
            })
            .then((res) => {
                if (res?.data?.success) {
                    const val = res?.data?.message?.map((item) => ({
                        value: item.InvestigationID,
                        label: item.TestName,
                    }))
                    setDeptTest(val);
                }
                else {
                    setDeptTest([]);
                    toast.warning(res?.data?.message);
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message
                        ? err.data.message
                        : "Error Occurred"
                );
            });
    };

    const getBindParameters = async (parameter) => {

        axiosInstance
            .post(apiUrls?.BindParameter, {
                testId: parameter?.join(",") || ""
            })
            .then((res) => {
                console.log("BindParameter Response", res);
                if (res?.data?.success) {
                    const val = res?.data?.message?.map((item) => ({
                        value: item.InvestigationID,
                        label: item.NAME,
                    }))
                    setParameters(val);
                }
                else {
                    setParameters([]);
                }

            })
            .catch((err) => {
                toast.error(
                    err?.data?.message
                        ? err.data.message
                        : "Error Occurred"
                );
            });
    };

    const getAllData = async (Centre = "") => {

        axiosInstance
            .post(apiUrls?.GetAllData, {
                processsingLabId: Centre?.join(",") || ""

            })
            .then((res) => {
                console.log("getAllData Response", res);
                if (res?.data?.success && res?.data?.message?.length > 0) {
                    const mappedData = res.data.message.map((item, index) => ({
                        id: item.id,
                        ProcessingLab: item.ProcessingLabName,
                        ProcessingLabID: item.ProcessingLabID,
                        ILCLabType: item.ILCLabType,
                        ILCLabTypeID: item.ILCLabTypeID,
                        ILCLab: item.ILCLabName,
                        ILCLabID: item.ILCLabID,
                        TestType: item.TestType,

                        ParameterID: item.TestID,
                        ParameterName: item.TestName,

                        // editable fields
                        Acceptability: item.AcceptablePer || "",
                        Rate: item.Rate || "",
                        StartFrom: item.StartMonth || "",
                        Frequency: item.Fequency || "",
                    }));

                    setTableData(mappedData);
                }
                else {
                    setTableData([]);
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message
                        ? err?.data?.message
                        : "Error Occurred"
                );
            })
            .finally(() => {

            })
    };

    const handleSelectMultiChange = (select, name) => {
        const val = select?.map((ele) => ele?.value) || [];
        const labels = select?.map((ele) => ele?.label) || [];

        // setFormData({ ...formData, [name]: val });

        if (name === "CentreId") {
            getILCLab(val);
            getAllData(val);
            setFormData({ ...formData, [name]: val, CentreLabels: name === "CentreId" ? labels : prev.CentreLabels, });
        }
        else if (name === "Test") {
            getBindParameters(val);
            setFormData({ ...formData, [name]: val, TestLabels: name === "Test" ? labels : prev.TestLabels, });
        }
        else if (name === "Parameter") {
            setFormData({ ...formData, [name]: val, parameterLabels: name === "Parameter" ? labels : prev.parameterLabels, });
        }
    };

    const handleSelectChange = (name, value) => {

        setFormData((prev) => ({
            ...prev,
            [name]: value?.value,
            [`${name}Label`]: value?.label,
        }));

        if (name === "ProcessingLab") {
            getILCLab(formData?.CentreId, value?.value)
        }
        else if (name === "Department") {
            getBindTest(value?.value);
        }

    };

    const handleReset = () => {
        setFormData({
            ProcessingLab: "",
            CentreId: "",
            LabType: "",
            Department: "",
            Test: "",
            Parameter: "",
            ScheduleType: "ILC_REG",
        });
        setTableData([]);
        setSearchTerm("");
        setErrors({});
        setIsHeaderLocked(false);
        setHeaderValues({
            Acceptability: "",
            Rate: "",
            StartFrom: "",
            Frequency: "",
        });
    };

    const handleAdd = () => {
        const requiredFields = [
            "ProcessingLab",
            "CentreId",
            "LabType",
            "Department",
            "Test",
            "Parameter",
        ];
        const errors = validateRequiredFields(formData, requiredFields);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        const timeStamp = Date.now();
        let counter = 0;

        const newRows = [];

        // helper inside same file
        // const isDuplicate = (newRow, existingRows) =>
        //     existingRows.some(
        //         (r) =>
        //             r.ProcessingLab === newRow.ProcessingLab &&
        //             r.ParameterID === newRow.ParameterID
        //     );

        const isDuplicate = (newRow, existingRows) =>
            existingRows.some(
                (r) =>
                    String(r.ProcessingLabID) === String(newRow.ProcessingLabID) &&
                    String(r.ParameterID) === String(newRow.ParameterID)
            );

        formData.CentreLabels.forEach((centreLabel, centreIndex) => {
            const centreId = formData.CentreId[centreIndex]; // ✅ DEFINED HERE

            formData.parameterLabels.forEach((testLabel, testIndex) => {
                const paramLabel = formData.parameterLabels[testIndex];
                if (!paramLabel) return;

                const [parameterName, testType] = paramLabel.split("#");

                const newRow = {
                    rowId: `ui_${timeStamp}_${counter}`,
                    source: "ui",

                    ProcessingLab: centreLabel,
                    ProcessingLabID: centreId, // ✅ WORKS

                    ILCLabType: formData.ProcessingLabLabel,
                    ILCLabTypeID: Number(formData.ProcessingLab),

                    ILCLab: formData.LabTypeLabel,
                    ILCLabID: formData.LabType,

                    TestType: testType || "Observation",

                    ParameterID: String(formData.Parameter[testIndex]),
                    ParameterName: parameterName,

                    Acceptability: "",
                    Rate: "",
                    StartFrom: "",
                    Frequency: "",
                };

                console.log("new", newRow);
                if (!isDuplicate(newRow, tableData)) {
                    newRows.push(newRow);
                    counter++;
                }
                else {
                    toast.warning("Parameter already added");
                }
                setErrors({});
            });
        });

        setTableData((prev) => [...prev, ...newRows]);
        setIsHeaderLocked(true);
        setFormData((prev) => ({
            ...prev,
            Test: [],
            Parameter: [],
            TestLabels: [],
            parameterLabels: [],
        }));
    }

    const handleDeleteRow = async (row) => {
        // UI-added row → local delete
        if (row.source === "ui") {
            setTableData((prev) =>
                prev.filter((r) => r.rowId !== row.rowId)
            );
            setFormData((prev) => ({
                ...prev,
                Test: [],
                Parameter: [],
                TestLabels: [],
                parameterLabels: [],
            }));
            // setHeaderValues({
            //     Acceptability: "",
            //     Rate: "",
            //     StartFrom: "",
            //     Frequency: "",
            // });
            return;
        }

        console.log("delete by api");

        // API row → backend delete
        try {
            await axiosInstance.post(apiUrls?.ILCDeleteData, {
                id: row?.id?.toString() || "",
            });

            toast.success("Deleted successfully");
            getAllData(formData?.CentreId);
            // handleReset();
            // setTableData((prev) =>
            //     prev.filter((r) => r.id !== row.id)
            // );
        } catch {
            toast.error("Delete failed");
        }
    };

    const getMonthName = (monthValue) => {
        const month = months.find((m) => String(m.value) === String(monthValue));
        return month ? month.label : "";
    };

    const handleSave = async () => {

        const invalidRow = tableData.find(
            (row) =>
                row.Acceptability === "" ||
                row.Rate === "" ||
                row.StartFrom === "" ||
                row.Frequency === ""
        );

        if (invalidRow) {
            toast.error(
                "Please fill Acceptability, Rate, Start Month and Frequency for all rows"
            );
            return;
        }

        const payload = tableData?.map((row) => ({
            // ✅ saved ID logic
            savedID: row.id ? String(row.id) : "",

            // Processing lab
            processingLabID: row.ProcessingLabID
                ? String(row.ProcessingLabID)
                : "",
            processingLabName: row.ProcessingLab || "",

            // ILC Lab Type
            ilcLabTypeID: row.ILCLabTypeID
                ? String(row.ILCLabTypeID)
                : "",
            ilcLabType: row.ILCLabType || "",

            // ILC Lab
            ilcLabID: row.ILCLabID
                ? String(row.ILCLabID)
                : "",
            ilcLabName: row.ILCLab || "",

            // Test & Parameter
            testType: row.TestType || "",
            testID: row.ParameterID || "",
            testName: row.ParameterName || "",

            // Editable fields
            rate: row.Rate ? String(row.Rate) : "",
            acceptablePer: row.Acceptability ? String(row.Acceptability) : "",
            startMonth: row.StartFrom ? String(row.StartFrom) : "",
            startMonthName: getMonthName(row.StartFrom),
            fequency: row.Frequency ? String(row.Frequency) : "",
        }));

        try {
            await axiosInstance.post(
                apiUrls.ILCSaveLabParameterMapping,
                payload
            );

            toast.success("Data saved successfully");

            // Refresh table from backend
            getAllData(formData?.CentreId);
            // handleReset();
        } catch (error) {
            toast.error("Save failed");
        }
    };

    /* ---------- EFFECT ---------- */
    useEffect(() => {
        getDepartments();
        getAccessCentres();
    }, []);

    console.log("FormData", formData);
    console.log("error", errors);
    console.log("filteredData", filteredData);
    console.log("tableData", tableData);

    return (
        <>
            {showMore && <ILCFrameMenu />}

            <div className="card">
                <Heading
                    name="ILC Lab Parameter Mapping"
                    isBreadcrumb
                    secondTitle={
                        <label onClick={() => setShowMore((p) => !p)}>
                            <ViewMenu />
                        </label>
                    }
                />

                <div className="row p-2">
                    <div className="col-sm-2">
                        <SelectBoxWithCheckbox
                            name="CentreId"
                            id="CentreId"
                            className="required-fields"
                            label={t("Select Processing Lab")}
                            onChange={handleSelectMultiChange}
                            options={centreData}
                            value={formData.CentreId}
                            isDisabled={isHeaderLocked}
                        />
                        {(formData?.CentreId?.length === 0) && (
                            <span className="error-message">{errors?.CentreId}</span>
                        )}
                    </div>
                    <div className="col-xl-2 col-sm-2 ">
                        <ReactSelect
                            lable="ILC Lab"
                            dynamicOptions={[
                                { label: "OutHouse Lab", value: "1" },
                                { label: "OutSourceILC Lab", value: "2" },
                            ]}
                            name="ProcessingLab"
                            value={formData.ProcessingLab}
                            placeholderName="Select ILC Lab"
                            onChange={handleSelectChange}
                            isDisabled={isHeaderLocked}
                        />
                        {formData?.ProcessingLab === "" && (
                            <span className="error-message">{errors?.ProcessingLab}</span>
                        )}
                    </div>
                    <div className="col-xl-2 col-sm-2">
                        <ReactSelect
                            // respclass="col-xl-2"
                            name="LabType"
                            dynamicOptions={LabOptions}
                            value={formData.LabType}
                            placeholderName="Lab Type"
                            onChange={handleSelectChange}
                            removeIsClearable
                            isDisabled={isHeaderLocked}
                        />
                        {formData?.LabType === "" && (
                            <span className="error-message">{errors?.LabType}</span>
                        )}
                    </div>
                    <div className="col-xl-2 col-sm-2">
                        <ReactSelect
                            // respclass="col-xl-2"
                            name="Department"
                            dynamicOptions={department}
                            value={formData.Department}
                            placeholderName="Department"
                            onChange={handleSelectChange}
                            removeIsClearable
                        />
                        {formData?.Department === "" && (
                            <span className="error-message">{errors?.Department}</span>
                        )}
                    </div>

                    <div className="col-xl-2 col-sm-2">
                        <SelectBoxWithCheckbox
                            name="Test"
                            id="Test"
                            className="required-fields"
                            label={t("Select Test")}
                            onChange={handleSelectMultiChange}
                            options={deptTest}
                            value={formData.Test}
                        // placeholderName="Test"
                        />
                        {(formData?.Test?.length === 0) && (
                            <span className="error-message">{errors?.Test}</span>
                        )}
                    </div>

                    <div className="col-xl-2 col-sm-2">
                        <SelectBoxWithCheckbox
                            name="Parameter"
                            id="Parameter"
                            className="required-fields"
                            label={t("Select Parameter")}
                            onChange={handleSelectMultiChange}
                            options={parameters}
                            value={formData.Parameter}
                        // placeholderName="Test"
                        />
                        {(formData?.Parameter?.length === 0) && (
                            <span className="error-message">{errors?.Parameter}</span>
                        )}

                    </div>

                    <div className="">
                        {
                            tableData?.length > 0 &&
                            <SaveButton text="Save" className="ml-2" onClick={handleSave} />
                        }
                        <SaveButton text="Add" className="ml-2" onClick={handleAdd} />

                        <CustomButton
                            text="Reset"
                            icon="refresh"
                            onClick={handleReset}
                            className="ml-2"
                        />
                    </div>
                </div>
            </div>

            <Heading
                title={t("Data List")}
                secondTitle={
                    // <div className=" d-flex">
                    <>
                        {colorCodingData?.map(({ color, labelKey, id }) => (
                            <ColorCodingSearch
                                key={id}
                                color={color}
                                label={t(labelKey)}
                            />
                        ))}


                        <FilterInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter Table"
                            inputClass="transparent-background"
                        />


                    </>

                    // </div>
                }
            />

            <CustomTable
                loading={loading}
                columns={columns}
                data={filteredData?.map((row, i) => ({
                    srNo: i + 1,
                    rowColor: (row.source === "ui")
                        ? "#ffe58f"
                        : "#7ee77b",
                    ...row,

                    Acceptability: (
                        <input
                            className="form-control"
                            value={row.Acceptability}
                            onChange={(e) =>
                                handleRowChange(i, "Acceptability", e.target.value)
                            }
                        />
                    ),

                    Rate: (row.ILCLabTypeID == 1) ? row.Rate : (
                        <input
                            className="form-control"
                            value={row.Rate}
                            onChange={(e) =>
                                handleRowChange(i, "Rate", e.target.value)
                            }
                        />
                    ),

                    StartFrom: (
                        <select
                            className="form-select form-select-sm"
                            value={row.StartFrom}
                            onChange={(e) =>
                                handleRowChange(i, "StartFrom", e.target.value)
                            }
                        >
                            <option value="">Select</option>
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    ),

                    Frequency: (
                        <input
                            className="form-control"
                            value={row.Frequency}
                            onChange={(e) =>
                                handleRowChange(i, "Frequency", e.target.value)
                            }
                        />
                    ),
                    delete: (
                        <span
                            style={{
                                color: "red",
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRow(row);   // ✅ HERE
                            }}
                        >
                            ✕
                        </span>
                    ),
                }))}
            />
        </>
    );
};

export default ILCLabParameterMapping;
