import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { getAccessCentresReports, GetRateTypeByGlobalCentre, BindEmployeeReports } from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { autocompleteOnBlur, formatStandardDate } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import AutoComplete from "../../components/formComponent/AutoComplete";
import UniversalChart from "../../components/GraphCharts/UniversalChart";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { Form } from "react-bootstrap";
import "./SampleRejectionReport.css";

const SampleRejectionReport = () => {
    const { t } = useTranslation();
    const [CentreData, setCentreData] = useState([]);
    const [testCentreData, setTestCentreData] = useState([]);
    const [DepartmentData, setDepartmentData] = useState([]);
    const [ReasonData, setReasonData] = useState([]);
    const [RateTypeData, setRateTypeData] = useState([]);
    const [TestData, setTestData] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState({
        0: false,
        1: false,
        2: false,
    });
    const [viewType, setViewType] = useState("Table View");
    const [rejectionAfterDept, setRejectionAfterDept] = useState(false);
    const [indexMatch, setIndexMatch] = useState(0);
    const [TestSuggestion, setTestSuggestion] = useState([]);
    const [selects, setSelects] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [tableSearchText, setTableSearchText] = useState("");

    const [rateTypeSuggestions, setRateTypeSuggestions] = useState([]);
    const [rateTypeIndex, setRateTypeIndex] = useState(0);
    const [selectRateType, setSelectRateType] = useState(false);

    const [userList, setUserList] = useState([]);
    const [userLabel, setUserLabel] = useState("");
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [userIndex, setUserIndex] = useState(0);
    const [selectUser, setSelectUser] = useState(false);

    const [formData, setFormData] = useState({
        DateType: "RegDate",
        Centre: [],
        TestCentre: [],
        Department: [],
        RateType: [],
        RateTypeID: 0,
        RateTypeLabel: "",
        Test: [],
        Reason: "",
        FromDate: new Date(),
        ToDate: new Date(),
        UserID: 0,
    });

    useEffect(() => {
        getAccessCentresReports(setCentreData);
        getTestCentreData();
        getDepartmentReports();
        getReasonData(0);
        getInvestigationList();
        GetRateTypeByGlobalCentre(setRateTypeData);
        BindEmployeeReports(setUserList);
    }, []);

    const getTestCentreData = () => {
        axiosInstance
            .get("Centre/CentreProcessingLab")
            .then((res) => {
                if (!Array.isArray(res.data.message)) return;
                setTestCentreData(res.data.message.map((ele) => ({
                    value: ele.ProcessingLabID,
                    label: ele.ProcessingLab,
                })));
            })
            .catch((err) => console.log(err));
    };

    // useEffect(() => {
    //     if (formData.Centre.length > 0) {
    //         getAccessDataRateReport(setRateTypeData, formData.Centre);
    //     } else {
    //         setRateTypeData([]);
    //     }
    // }, [formData.Centre]);

    const getInvestigationList = () => {
        axiosInstance
            .get("Investigations/BindInvestigationList")
            .then((res) => {
                let data = res.data.message;
                let MapTest = data.map((ele) => {
                    return {
                        value: ele.InvestigationID,
                        label: ele.TestName,
                    };
                });
                setTestData(MapTest);
                setTestSuggestion(MapTest);
            })
            .catch((err) => console.log(err));
    };

    const handleModalCheckboxChange = (test) => {
        setFormData((prev) => {
            const isSelected = prev.Test.find((item) => item.value === test.value);
            const newTests = isSelected
                ? prev.Test.filter((item) => item.value !== test.value)
                : [...prev.Test, test];
            return { ...prev, Test: newTests };
        });
    };



    const getDepartmentReports = () => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                const data = res.data.message;
                const DeptDataValue = data.map((ele) => ({
                    value: ele.DepartmentID,
                    label: ele.Department,
                }));
                setDepartmentData(DeptDataValue);
            })
            .catch((err) => console.log(err));
    };

    const getReasonData = (testId) => {
        axiosInstance
            .post("SC/GetRejectReason", { testId: Number(testId) })
            .then((res) => {
                const data = res.data.message;
                const finalData = Array.isArray(data) ? data.map((ele) => ({
                    label: ele.Reason,
                    value: ele.Reason,
                })) : [];
                setReasonData([{ label: "Select Reason", value: "" }, ...finalData]);
            })
            .catch((err) => {
                console.log(err);
                setReasonData([{ label: "Select Reason", value: "" }]);
            });
    };

    const handleCheck = (e, index) => {
        // ... handled elsewhere for reports
    };

    const handleIndexNew = (e, name) => {
        switch (name) {
            case "TestName":
                switch (e.which) {
                    case 38: // up
                        if (TestSuggestion.length > 0) {
                            setIndexMatch((prev) =>
                                prev > 0 ? prev - 1 : TestSuggestion.length - 1
                            );
                        }
                        break;
                    case 40: // down
                        if (TestSuggestion.length > 0) {
                            setIndexMatch((prev) =>
                                prev < TestSuggestion.length - 1 ? prev + 1 : 0
                            );
                        }
                        break;
                    case 13: // enter
                        if (TestSuggestion[indexMatch]) {
                            handleListSearchNew(TestSuggestion[indexMatch], name);
                        }
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    };

    const handleListSearchNew = (data, name) => {
        switch (name) {
            case "TestName":
                setFormData({
                    ...formData,
                    TestName: data?.label,
                    Test: [data], // Storing as array for consistency with previous multi-select if needed
                    Reason: "", // Clear reason when test changes
                });
                setSelects(false);
                setTestSuggestion([]);
                setIndexMatch(0);
                getReasonData(data.value);
                break;
            default:
                break;
        }
    };

    const handleRateTypeChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, RateTypeLabel: value }));
        if (value.trim() === "") {
            setSelectRateType(false);
            setRateTypeSuggestions([]);
            setFormData((prev) => ({ ...prev, RateTypeID: 0, RateTypeLabel: "" }));
        } else {
            const filtered = RateTypeData.filter((item) =>
                item.label.toLowerCase().includes(value.toLowerCase())
            );
            setRateTypeSuggestions(filtered);
            setSelectRateType(true);
        }
    };

    const handleRateTypeKeyDown = (e) => {
        if (rateTypeSuggestions.length === 0) return;
        if (e.which === 38) { // Up
            setRateTypeIndex((prev) =>
                prev > 0 ? prev - 1 : rateTypeSuggestions.length - 1
            );
        } else if (e.which === 40) { // Down
            setRateTypeIndex((prev) =>
                prev === rateTypeSuggestions.length - 1 ? 0 : prev + 1
            );
        } else if (e.which === 13) { // Enter
            handleRateTypeSelect(rateTypeSuggestions[rateTypeIndex]);
            setRateTypeIndex(0);
        }
    };

    const handleRateTypeSelect = (data) => {
        setFormData((prev) => ({
            ...prev,
            RateTypeLabel: data?.label,
            RateTypeID: data?.value,
            RateType: [data?.value], // keeping array for backend consistency if needed
        }));
        setSelectRateType(false);
        setRateTypeSuggestions([]);
    };

    const handleUserChange = (e) => {
        const value = e.target.value;
        setUserLabel(value);
        if (value.trim() === "") {
            setSelectUser(false);
            setUserSuggestions([]);
            setFormData((prev) => ({ ...prev, UserID: 0 }));
        } else {
            const filtered = userList.filter((item) =>
                item.label.toLowerCase().includes(value.toLowerCase())
            );
            setUserSuggestions(filtered);
            setSelectUser(true);
        }
    };

    const handleUserKeyDown = (e) => {
        if (userSuggestions.length === 0) return;
        if (e.which === 38) {
            setUserIndex((prev) => prev > 0 ? prev - 1 : userSuggestions.length - 1);
        } else if (e.which === 40) {
            setUserIndex((prev) => prev === userSuggestions.length - 1 ? 0 : prev + 1);
        } else if (e.which === 13) {
            handleUserSelect(userSuggestions[userIndex]);
            setUserIndex(0);
        }
    };

    const handleUserSelect = (data) => {
        setUserLabel(data?.label || "");
        setFormData((prev) => ({ ...prev, UserID: data?.value || 0 }));
        setSelectUser(false);
        setUserSuggestions([]);
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        if (name === "TestName") {
            setFormData({ ...formData, [name]: value });
            if (value === "") {
                setSelects(false);
                setTestSuggestion([]);
                setIndexMatch(0);
                getReasonData(0);
                return;
            }
            const filtered = TestData?.filter((ele) =>
                ele?.label?.toLowerCase().includes(value.toLowerCase())
            );
            setTestSuggestion(filtered);
            setSelects(true);
            setIndexMatch(0);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectMultiChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const dateSelect = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const handleAction = async (docType) => {
        setLoadingSearch((prev) => ({ ...prev, [docType]: true }));

        let payload = {
            dateType: formData.DateType === "Registration" ? "RegDate" : "Rejection",
            fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
            fromTime: "00:00:00",
            toTime: "23:59:59",
            centre: formData.Centre.length > 0 ? formData.Centre : [0],
            testCentreId: formData.TestCentre.length > 0 ? formData.TestCentre : [],
            department: formData.Department.length > 0 ? formData.Department : [],
            test: formData.TestName || "",
            rateTypeId: Number(formData.RateTypeID) || 0,
            userId: Number(formData.UserID) || 0,
            isRejectionAfterDeptReceive: rejectionAfterDept || 0,
            allowPostSampleCollection: rejectionAfterDept ? "Y" : "",
            documentType: docType
        };

        payload = {
            ...payload,
            reason: formData.Reason || "",
            pageNumber: 1,
            pageSize: 50,
            reportsView: viewType,
        };

        const url = docType === 0
            ? "commonReports/FilterSampleRejectionReport"
            : docType === 2
            ? "commonReports/SampleRejectionReport"
            : "commonReports/NewSampleRejectionReport";

        const config = docType !== 0 ? { responseType: 'blob' } : {};

        try {
            const res = await axiosReport.post(url, payload, config);
            if (docType === 0) {
                if (res?.data?.success) {
                    setTableData(res?.data?.data || []);
                    toast.success(t("Data fetched successfully"));
                } else {
                    setTableData([]);
                    toast.error(res?.data?.message || t("No data found"));
                }
            } else {
                const contentType = res.headers?.["content-type"] || "";
                if (contentType.includes("application/json")) {
                    const text = await res.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("No data found"));
                    return;
                }
                if (res?.data) {
                    if (docType === 2) {
                        const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                        window.open(blobUrl, "_blank");
                        toast.success(t("Report generated successfully"));
                    } else {
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", `SampleRejectionReport_${new Date().getTime()}.xlsx`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        toast.success(t("Report generated successfully"));
                    }
                }
            }
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("Error processing request"));
                } catch {
                    toast.error(t("Error processing request"));
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || t("Error processing request"));
            }
            setTableData([]);
        } finally {
            setLoadingSearch((prev) => ({ ...prev, [docType]: false }));
        }
    };

    const getAggregatedData = (data, key) => {
        if (!Array.isArray(data) || data.length === 0) return { categories: [], values: [] };

        // If data is already aggregated by the backend (label/value format)
        if (data[0] && 'label' in data[0] && 'value' in data[0]) {
            return {
                categories: data.map((item) => item.label || "Unknown"),
                values: data.map((item) => Number(item.value) || 0),
            };
        }

        // Local aggregation for table raw data
        const counts = data.reduce((acc, curr) => {
            let label = curr[key] || "Unknown";
            if (key === 'rejectionDate') {
                label = label.split(' ')[0]; // Extract date from "17-Mar-2026 01:22 PM"
            }
            acc[label] = (acc[label] || 0) + 1;
            return acc;
        }, {});

        return {
            categories: Object.keys(counts),
            values: Object.values(counts),
        };
    };

    const reasonChartData = getAggregatedData(tableData, 'rejectionReason');
    const userChartData = getAggregatedData(tableData, 'rejectionByName');
    const dateChartData = getAggregatedData(tableData, 'rejectionDate');

    const filteredTableData = useMemo(() => {
        if (!tableSearchText) return tableData;
        const search = tableSearchText.toLowerCase();
        return tableData.filter(
            (item) =>
                item?.labNo?.toLowerCase().includes(search) ||
                item?.patientName?.toLowerCase().includes(search) ||
                item?.doctorName?.toLowerCase().includes(search) ||
                item?.department?.toLowerCase().includes(search) ||
                item?.itemName?.toLowerCase().includes(search) ||
                item?.rejectionReason?.toLowerCase().includes(search) ||
                item?.rejectionByName?.toLowerCase().includes(search) ||
                item?.rejectionDate?.toLowerCase().includes(search) ||
                item?.informTo?.toLowerCase().includes(search)
        );
    }, [tableData, tableSearchText]);

    // useEffect(() => {
    //     handleSearch();
    // }, [viewType]);

    const handleSearch = () => handleAction(0);
    const handlePDF = () => handleAction(2);
    const handleExcel = () => handleAction(1);

    console.log("formData",formData);

    return (
        <>
            <Accordion
                title={t("Sample Rejection Report")}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 p-1">
                    <div className="col-sm-2 mb-1">
                        <SelectBox
                            options={[
                                { label: t("Reg Date"), value: "Registration" },
                                { label: t("Rejection Date"), value: "Rejection" }
                            ]}
                            name="DateType"
                            lable={t("Date Type")}
                            selectedValue={formData.DateType}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2 mb-1">
                        <MultiSelectComp
                            // placeholder={t("Select Centre")}
                            options={CentreData}
                            value={formData.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            label={t("Centre")}
                        />
                    </div>
                    <div className="col-sm-2 mb-1">
                        <MultiSelectComp
                            options={testCentreData}
                            value={formData.TestCentre}
                            name="TestCentre"
                            onChange={handleSelectMultiChange}
                            label={t("Test Centre")}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="RateTypeID"
                            lable={t("Rate Type")}
                            value={formData.RateTypeLabel || ""}
                            placeholder=" "
                            onChange={handleRateTypeChange}
                            onKeyDown={handleRateTypeKeyDown}
                            onBlur={(e) => {
                                const snapshot = [...rateTypeSuggestions];
                                autocompleteOnBlur(setRateTypeSuggestions);

                                setTimeout(() => {
                                    setFormData((prev) => {
                                        const typed = (e.target.value || "").trim();
                                        if (!typed) {
                                            return { ...prev, RateTypeID: 0, RateTypeLabel: "", RateType: [] };
                                        }
                                        if (prev.RateTypeID && prev.RateTypeLabel &&
                                            prev.RateTypeLabel.toLowerCase() === typed.toLowerCase()) {
                                            return prev;
                                        }
                                        const match = snapshot.find(
                                            (ele) => ele.label.toLowerCase() === typed.toLowerCase()
                                        );
                                        if (match) {
                                            return {
                                                ...prev,
                                                RateTypeLabel: match.label,
                                                RateTypeID: Number(match.value),
                                                RateType: [Number(match.value)]
                                            };
                                        }
                                        const fullMatch = RateTypeData.find(
                                            (ele) => ele.label.toLowerCase() === typed.toLowerCase()
                                        );
                                        if (fullMatch) {
                                            return {
                                                ...prev,
                                                RateTypeLabel: fullMatch.label,
                                                RateTypeID: Number(fullMatch.value),
                                                RateType: [Number(fullMatch.value)]
                                            };
                                        }
                                        return { ...prev, RateTypeID: 0, RateType: [] };
                                    });
                                }, 200);
                            }}
                        />
                        {selectRateType && rateTypeSuggestions.length > 0 && (
                            <AutoComplete
                                selects={selectRateType}
                                test={rateTypeSuggestions.map((item) => ({
                                    TestName: item.label,
                                }))}
                                handleListSearch={(selected) =>
                                    handleRateTypeSelect(
                                        rateTypeSuggestions.find(
                                            (item) => item.label === selected.TestName
                                        )
                                    )
                                }
                                indexMatch={rateTypeIndex}
                            />
                        )}
                    </div>
                    <div className="col-sm-2 mb-1">
                        <MultiSelectComp
                            options={DepartmentData}
                            value={formData.Department}
                            name="Department"
                            onChange={handleSelectMultiChange}
                            label={t("Department")}
                        />
                    </div>
                    <div className="col-sm-2 mb-1">
                        <Input
                            type="text"
                            name="TestName"
                            lable={t("Search By Test Name")}
                            id="TestName"
                            value={formData.TestName}
                            placeholder=" "
                            onChange={handleSelectChange}
                            onKeyDown={(e) => handleIndexNew(e, "TestName")}
                            onBlur={(e) => {
                                autocompleteOnBlur(setTestSuggestion);
                            }}
                        />
                        {selects &&
                            TestSuggestion.length > 0 &&
                            formData.TestName && (
                                <ul className="suggestion-data" style={{ zIndex: 99 }}>
                                    {TestSuggestion.map((data, index) => (
                                        <li
                                            onClick={() => handleListSearchNew(data, "TestName")}
                                            className={`${index === indexMatch && "matchIndex"}`}
                                            key={index}
                                        >
                                            {data?.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                    </div>
                    <div className="col-sm-2 mb-1">
                        <SelectBox
                            options={ReasonData}
                            name="Reason"
                            lable={t("Reason")}
                            selectedValue={formData.Reason}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2 mb-1" style={{ position: "relative" }}>
                        <Input
                            type="text"
                            name="User"
                            lable={t("Rejected By")}
                            id="User"
                            value={userLabel}
                            placeholder=" "
                            onChange={handleUserChange}
                            onKeyDown={handleUserKeyDown}
                            onBlur={(e) => {
                                autocompleteOnBlur(setUserSuggestions);
                                setTimeout(() => {
                                    setSelectUser(false);
                                    const typed = (e.target.value || "").trim();
                                    if (!typed) {
                                        setUserLabel("");
                                        setFormData((prev) => ({ ...prev, UserID: 0 }));
                                    }
                                }, 600);
                            }}
                        />
                        {selectUser && userSuggestions.length > 0 && (
                            <AutoComplete
                                selects={selectUser}
                                test={userSuggestions.map((item) => ({ TestName: item.label }))}
                                handleListSearch={(selected) =>
                                    handleUserSelect(
                                        userSuggestions.find((item) => item.label === selected.TestName)
                                    )
                                }
                                indexMatch={userIndex}
                            />
                        )}
                    </div>
                    <div className="col-sm-2 mb-1">
                        <DatePicker
                            name="FromDate"
                            value={formData.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("From Date")}
                            className="custom-calendar"
                        />
                    </div>
                    <div className="col-sm-2 mb-1">
                        <DatePicker
                            name="ToDate"
                            value={formData.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("To Date")}
                            className="custom-calendar"

                        />
                    </div>
                    <div className="col-sm-2">
                        <SelectBox
                            options={[
                                { label: t("Table View"), value: "Table View" },
                                { label: t("Userwise Bar Chart"), value: "Userwise Bar Chart" },
                                { label: t("Reasonwise Bar Chart"), value: "Reasonwise Bar Chart" },
                                { label: t("Datewise Trend"), value: "Datewise Trend" },
                            ]}
                            name="viewType"
                            lable={t("Report View")}
                            selectedValue={viewType}
                            onChange={(e) => setViewType(e.target.value)}
                        />
                    </div>

                    {/* Add checkbox */}
                    <div className="col-sm-auto d-flex align-items-center">
                        <Form.Check
                            type="switch"
                            id="rejectionAfterDept"
                            label={t("Rejection After Department Receive")}
                            checked={rejectionAfterDept}
                            onChange={(e) => setRejectionAfterDept(e.target.checked)}
                            className="m-0"
                            style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                        />
                    </div>
                     {/* Add checkbox */}
                    <div className="col-sm-auto">
                        <CustomButton
                            text={t("Search")}
                            onClick={handleSearch}
                            loading={loadingSearch[0]}
                            icon={"search"}
                        />
                    </div>
                    <div className="col-auto mt-2">
                        <CustomButton
                            text={t("PDF")}
                            onClick={handlePDF}
                            loading={loadingSearch[2]}
                            icon={"pdf"}
                        />
                    </div>
                    <div className="col-auto mt-2">
                        <CustomButton
                            text={t("Excel")}
                            onClick={handleExcel}
                            loading={loadingSearch[1]}
                            icon={"excel"}
                        />
                    </div>
                </div>
            </Accordion>
            <Accordion
                title={t("Search Data")}
                defaultValue={true}
                notOpen={true}
                linkTo="#"
                className="srr-search-accordion"
                linkTitle={
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Input
                            type="text"
                            placeholder="Search table..."
                            value={tableSearchText}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setTableSearchText(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                }
            >

                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            {viewType === "Table View" && (
                                <Tables style={{ tableLayout: "fixed", width: "100%" }}>
                                    <colgroup>
                                        <col style={{ width: "45px" }} />
                                        <col style={{ width: "90px" }} />
                                        <col style={{ width: "130px" }} />
                                        <col style={{ width: "130px" }} />
                                        <col style={{ width: "80px" }} />
                                        <col style={{ width: "110px" }} />
                                        <col style={{ width: "130px" }} />
                                        <col style={{ width: "140px" }} />
                                        <col style={{ width: "110px" }} />
                                        <col style={{ width: "120px" }} />
                                        <col style={{ width: "100px" }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("S.No")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Lab No")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Patient Name")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Doctor Name")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Age/Gender")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Department")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Test Name")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Rejection Reason")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Rejection By")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Rejection Date")}</th>
                                            <th style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{t("Inform To")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTableData.length === 0 ? (
                                            <tr>
                                                <td colSpan="11" className="text-center text-danger">No data found</td>
                                            </tr>
                                        ) : (
                                            filteredTableData.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("S.No")}>{index + 1}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Lab No")}>{item?.labNo || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Patient Name")}>{item?.patientName || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Doctor Name")}>{item?.doctorName || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Age/Gender")}>{item?.age || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Department")}>{item?.department || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Item Name")}>{item?.itemName || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Rejection Reason")}>{item?.rejectionReason || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Rejection By")}>{item?.rejectionByName || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Rejection Date")}>{item?.rejectionDate || "-"}</td>
                                                    <td style={{ wordBreak: "break-word", whiteSpace: "normal" }} data-title={t("Inform To")}>{item?.informTo || "-"}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Tables>
                            )}

                            {viewType === "Userwise Bar Chart" && (
                                <div className="card shadow-sm border-0 mt-3 p-3">
                                    <div className="row">
                                        <div className="col-md-6 col-12 border-end">
                                            <UniversalChart
                                                title={t("Userwise Rejection Analysis")}
                                                description={t("Total rejections per user")}
                                                type="bar"
                                                height={400}
                                                categories={userChartData.categories}
                                                series={[{ name: t("Rejections"), data: userChartData.values }]}
                                                colors={["#4F46E5"]}
                                                dataLabels={true}
                                                legend={false}
                                            />
                                        </div>
                                        <div className="col-md-6 col-12">
                                            <UniversalChart
                                                title={t("Userwise Analysis (Horizontal)")}
                                                description={t("Horizontal view for better comparison")}
                                                type="bar"
                                                height={400}
                                                horizontal={true}
                                                categories={userChartData.categories}
                                                series={[{ name: t("Rejections"), data: userChartData.values }]}
                                                colors={["#10B981"]}
                                                dataLabels={true}
                                                legend={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewType === "Reasonwise Bar Chart" && (
                                <div className="card shadow-sm border-0 mt-3 p-3">
                                    <UniversalChart
                                        title={t("Reasonwise Rejection Analysis")}
                                        description={t("Total rejections per reason")}
                                        type="bar"
                                        height={400}
                                        categories={reasonChartData.categories}
                                        series={[{ name: t("Rejections"), data: reasonChartData.values }]}
                                        colors={["#F43F5E"]}
                                        dataLabels={true}
                                        legend={false}
                                    />
                                </div>
                            )}

                            {viewType === "Datewise Trend" && (
                                <div className="card shadow-sm border-0 mt-3 p-3">
                                    <div className="row">
                                        <div className="col-md-6 col-12 border-end">
                                            <UniversalChart
                                                title={t("Datewise Rejection Counts")}
                                                description={t("Daily frequency of sample rejections")}
                                                type="bar"
                                                height={350}
                                                categories={dateChartData.categories}
                                                series={[{ name: t("Count"), data: dateChartData.values }]}
                                                colors={["#775DD0"]}
                                                dataLabels={true}
                                                legend={false}
                                            />
                                        </div>
                                        <div className="col-md-6 col-12">
                                            <UniversalChart
                                                title={t("Rejection Trend Line")}
                                                description={t("Growth analysis over the month")}
                                                type="area"
                                                height={350}
                                                categories={dateChartData.categories}
                                                series={[{ name: t("Trends"), data: dateChartData.values }]}
                                                colors={["#00E396"]}
                                                legend={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="row px-1">
                        <div className="col-12">
                            <NoRecordFound />
                        </div>
                    </div>
                )}
            </Accordion>
        </>
    );
};

export default SampleRejectionReport;
