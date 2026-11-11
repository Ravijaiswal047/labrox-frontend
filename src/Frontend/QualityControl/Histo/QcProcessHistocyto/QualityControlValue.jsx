import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import CustomTable from "../../../../components/Table/CustomTable";
import NoRecordFound from "../../../../components/formComponent/NoRecordFound";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../../../utils/utils";
import { autocompleteOnBlur, formatStandardDate } from "../../../../utils/helpers";
import { toast } from "react-toastify";
import Accordion from "../../../../components/UI/Accordion";
import "../../../SalesFunnel/index.css";

const QualityControlValue = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    // full dropdown list from API: [{ value, text }]
    const [histoProcessList, setHistoProcessList] = useState([]);
    // filtered suggestions shown under the input
    const [filterList, setFilterList] = useState([]);
    const [dropFalse, setDropFalse] = useState(false);
    const [indexMatch, setIndexMatch] = useState(0);

    const [navData, setNavData] = useState({
        histoProcessNo: "",
    });

    // Yes / No options for the react-select header fields
    const yesNoOptions = [
        { label: "Yes", value: 1 },
        { label: "No", value: 0 },
    ];

    // Discordant / Concordant options for the row react-select
    const discordantOptions = [
        { label: "Discordant", value: "Discordant" },
        { label: "Concordant", value: "Concordant" },
    ];

    // Parse a "dd-MM-yyyy" backend date string into a Date for the DatePicker
    const parseDdMmYyyy = (str) => {
        if (!str) return new Date();
        const [d, m, y] = String(str).split("-").map(Number);
        if (!d || !m || !y) return new Date();
        return new Date(y, m - 1, d);
    };

    // header section of the save payload
    const [header, setHeader] = useState({
        qcPathologist: "",
        qcDate: new Date(),
        correctiveAction: null,
        amendedreport: null,
        completedby: "",
        completedDate: new Date(),
        qcWeek: "",
        dateDispatched: new Date(),
        dispatchedby: "",
        dispatchedTo: "",
        qualitativeRemark: "",
    });

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeader((prev) => ({ ...prev, [name]: value }));
    };

    const handleHeaderDate = (date, name) => {
        setHeader((prev) => ({ ...prev, [name]: date }));
    };

    const handleHeaderSelect = (name, selected) => {
        setHeader((prev) => ({ ...prev, [name]: selected }));
    };

    // table rows returned by the search
    const [tableData, setTableData] = useState([]);
    const [searched, setSearched] = useState(false);
    const [lockProcessNo, setLockProcessNo] = useState(false);

    // update an editable text cell (DiagnosisReviewing) for a single row
    const handleRowChange = (e, rowIndex) => {
        const { name, value } = e.target;
        setTableData((prev) =>
            prev.map((row, i) => (i === rowIndex ? { ...row, [name]: value } : row)),
        );
    };

    // update an editable react-select cell (Discordant) for a single row
    const handleRowSelect = (name, selected, rowIndex) => {
        setTableData((prev) =>
            prev.map((row, i) =>
                i === rowIndex ? { ...row, [name]: selected?.value ?? "" } : row,
            ),
        );
    };

    const columns = [
        { header: "Sr. No", field: "srNo", width: "5%" },
        { header: "Spec Number", field: "Hno" },
        { header: "Number of Slides", field: "SlideNumber" },
        { header: "Macro Description", field: "MICROSCOPY" },
        { header: "Reporting Pathologist's Diagnosis", field: "Diagnosis" },
        {
            header: "Reviewing Pathologist's Diagnosis",
            field: "DiagnosisReviewing",
        },
        { header: "Discordant/Concordant", field: "Discordant", width: "15%" },
    ];

    const formattedData = tableData.map((row, index) => ({
        ...row,
        srNo: index + 1,
        DiagnosisReviewing: (
            <input
                type="text"
                className="form-control required-fields"
                name="DiagnosisReviewing"
                value={row.DiagnosisReviewing || ""}
                onChange={(e) => handleRowChange(e, index)}

            />
        ),
        Discordant: (
            <ReactSelect
                placeholderName={t("select")}
                id={`Discordant_${index}`}
                name="Discordant"
                searchable={true}
                dynamicOptions={discordantOptions}
                value={row.Discordant || ""}
                onChange={(name, selected) => handleRowSelect(name, selected, index)}
                className="required-fields"
                removeIsClearable={true}
            />
        ),
    }));

    const handleSearch = async () => {
        if (!navData.histoProcessNo) {
            toast.error("Please select Histo Process No");
            return;
        }

        dispatch(setLoading(true));
        await axiosInstance
            .post("QualitativeQCProcess/GetQualitativeProcessHisto", {
                histoProcessNo: navData.histoProcessNo,
            })
            .then((res) => {
                // lock the Histo Process No once the search succeeds
                setLockProcessNo(!!res?.data?.success);
                const items = res?.data?.message?.items;
                const h = res?.data?.message?.header;
                if (Array.isArray(items) && res?.data?.success) {
                    setTableData(items);
                    setSearched(true);
                    if (h) {
                        setHeader({
                            qcPathologist: h.QCPathologist || "",
                            qcDate: parseDdMmYyyy(h.QcDate),
                            correctiveAction:
                                yesNoOptions.find((o) => o.value === h.CorrectiveAction) || null,
                            amendedreport:
                                yesNoOptions.find((o) => o.value === h.Amendedreport) || null,
                            completedby: h.Completedby || "",
                            completedDate: parseDdMmYyyy(h.CompletedDate),
                            qcWeek: h.QCWeek || "",
                            dateDispatched: parseDdMmYyyy(h.DateDispatched),
                            dispatchedby: h.Dispatchedby || "",
                            dispatchedTo: h.DispatchedTo || "",
                            qualitativeRemark: h.QualitativeRemark || "",
                        });
                    }
                    if (!items.length) notify("No records found.", "warn");
                } else {
                    notify(res?.data?.message || "No records found.", "warn");
                    setTableData([]);
                    setSearched(true);
                }
            })
            .catch((err) => {
                notify(err?.data?.message || "Something went wrong", "error");
                setTableData([]);
                setSearched(false);
                setLockProcessNo(false);
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    // Build the header section of the save payload
    const buildHeaderPayload = () => ({
        qcPathologist: header.qcPathologist || "",
        qcDate: formatStandardDate(header.qcDate),
        correctiveAction: header.correctiveAction?.value ?? 0,
        amendedreport: header.amendedreport?.value ?? 0,
        completedby: header.completedby || "",
        completedDate: formatStandardDate(header.completedDate),
        qcWeek: header.qcWeek || "",
        dateDispatched: formatStandardDate(header.dateDispatched),
        dispatchedby: header.dispatchedby || "",
        dispatchedTo: header.dispatchedTo || "",
        qualitativeRemark: header.qualitativeRemark || "",
    });

    // Validate row-level and header mandatory fields before saving
    const validateBeforeSave = () => {
        if (tableData.length === 0) {
            toast.error("Please search records before saving");
            return false;
        }

        // Row-level mandatory fields
        for (let i = 0; i < tableData.length; i++) {
            const row = tableData[i];
            if (!String(row.DiagnosisReviewing || "").trim()) {
                toast.error(
                    `Please enter Diagnosis Reviewing Pathologist's Diagnosis`,
                );
                return false;
            }
            if (!String(row.Discordant || "").trim()) {
                toast.error(`Please select Discordant/Concordant`);
                return false;
            }
        }

        // Header mandatory fields
        if (!String(header.qcPathologist || "").trim()) {
            toast.error("Please enter QC Pathologist");
            return false;
        }
        if (!header.correctiveAction) {
            toast.error("Please select Corrective Action");
            return false;
        }
        if (!header.amendedreport) {
            toast.error("Please select Amended Report");
            return false;
        }
        if (!String(header.completedby || "").trim()) {
            toast.error("Please enter Completed By");
            return false;
        }
        if (!String(header.qcWeek || "").trim()) {
            toast.error("Please enter QC Week");
            return false;
        }
        if (!String(header.dispatchedby || "").trim()) {
            toast.error("Please enter Dispatched By");
            return false;
        }
        if (!String(header.dispatchedTo || "").trim()) {
            toast.error("Please enter Dispatched To");
            return false;
        }
        if (!String(header.qualitativeRemark || "").trim()) {
            toast.error("Please enter Qualitative Remark");
            return false;
        }

        return true;
    };

    // Reset the whole screen back to its initial state
    const resetForm = () => {
        setNavData({ histoProcessNo: "" });
        setTableData([]);
        setSearched(false);
        setLockProcessNo(false);
        setFilterList([]);
        setDropFalse(false);
        setIndexMatch(0);
        setHeader({
            qcPathologist: "",
            qcDate: new Date(),
            correctiveAction: null,
            amendedreport: null,
            completedby: "",
            completedDate: new Date(),
            qcWeek: "",
            dateDispatched: new Date(),
            dispatchedby: "",
            dispatchedTo: "",
            qualitativeRemark: "",
        });
    };

    // Save all rows in a single request
    const handleSaveAll = async () => {
        if (!navData.histoProcessNo) {
            toast.error("Please select Histo Process No");
            return;
        }
        if (!validateBeforeSave()) return;

        const savePayload = {
            histoProcessNo: navData.histoProcessNo,
            items: tableData.map((row) => ({
                processHistoId: Number(row.ProcessHistoId) || 0,
                ledgerTransactionID: Number(row.LedgerTransactionID) || 0,
                ledgerTransactionNo: row.LedgerTransactionNo || "",
                hno: row.Hno || "",
                slideNumber: row.SlideNumber || "",
                microscopy: row.MICROSCOPY || "",
                diagnosis: row.Diagnosis || "",
                isTechnicalQC: row.IsTechnicalQC ? 1 : 0,
                requestedBy: row.RequestedBy || "",
                printedBy: row.PrintedBy || "",
                requestedDate: row.RequestedDate || "",
                remark: row.Remark || "",
                qualitativeId: Number(row.QualitativeId) || 0,
                diagnosisReviewing: row.DiagnosisReviewing || "",
                discordant: row.Discordant || "",
            })),
            header: buildHeaderPayload(),
        };

        dispatch(setLoading(true));
        await axiosInstance
            .post("QualitativeQCProcess/SaveQualitativeProcessHisto", savePayload)
            .then((res) => {
                if (res?.data?.success) {
                    notify(res?.data?.message || "Saved successfully.", "success");
                    // process no returned by save -> open the report, then reset the form
                    const savedProcessNo = res?.data?.data || navData.histoProcessNo;
                    getQualitativeReport(savedProcessNo);
                    resetForm();
                } else {
                    notify(res?.data?.message || "Something went wrong", "error");
                }
            })
            .catch((err) => {
                notify(err?.data?.message || "Something went wrong", "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    // Open the Qualitative QC Process report (PDF) for the given process no
    const getQualitativeReport = async (histoProcessNo) => {
        dispatch(setLoading(true));
        await axiosReport
            .post(
                "commonReports/QCQualitativeHistoReport",
                { histoProcessNo },
                { responseType: "blob" },
            )
            .then((res) => {
                if (res?.data?.type === "application/json") {
                    res.data.text().then((text) => {
                        const errorData = JSON.parse(text);
                        notify(errorData?.message || "No Report Found", "warning");
                    });
                    return;
                }
                const pdfBlob = new Blob([res.data], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, "_blank");
            })
            .catch((err) => {
                notify(err?.data?.message || "No Report Found", "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    // Load the Histo Process No dropdown on mount
    const getHistoProcessNoDropdown = async () => {
        dispatch(setLoading(true));
        await axiosInstance
            .get("QualitativeQCProcess/GetHistoProcessNoDropdown")
            .then((res) => {
                if (Array.isArray(res?.data?.message) && res?.data?.success) {
                    setHistoProcessList(res.data.message);
                } else {
                    setHistoProcessList([]);
                }
            })
            .catch((err) => {
                notify(err?.data?.message || "Something went wrong", "error");
                setHistoProcessList([]);
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    useEffect(() => {
        getHistoProcessNoDropdown();
    }, []);

    const handleSearchChange = (e) => {
        const { value } = e?.target;
        const searchTerm = value.toLowerCase();

        setNavData((prev) => ({ ...prev, histoProcessNo: value }));

        const filtered = histoProcessList.filter((item) =>
            String(item?.text).toLowerCase().includes(searchTerm),
        );
        setFilterList(filtered);
        setIndexMatch(0);
        setDropFalse(true);
    };

    const handleListSelect = (data) => {
        setNavData((prev) => ({ ...prev, histoProcessNo: data?.value }));
        setFilterList([]);
        setDropFalse(false);
    };

    const handleIndex = (e) => {
        switch (e.which) {
            case 38: // ArrowUp
                setIndexMatch(indexMatch !== 0 ? indexMatch - 1 : filterList.length - 1);
                break;
            case 40: // ArrowDown
                setIndexMatch(filterList.length - 1 === indexMatch ? 0 : indexMatch + 1);
                break;
            case 13: // Enter
                if (filterList[indexMatch]) handleListSelect(filterList[indexMatch]);
                break;
            default:
                break;
        }
    };

    return (
        <>
            <Accordion title={"Quality Control Value"} breadcrumb={true} defaultValue={true}>
                <div className="row p-2 d-flex justify-content-left align-items-center">
                    <div className="col-xl-3 col-sm-4 col-md-4 col-lg-3 co-12 position-relative">
                        <Input
                            autoComplete="off"
                            placeholder=" "
                            type="text"
                            name="histoProcessNo"
                            id="histoProcessNo"
                            disabled={lockProcessNo}
                            value={navData?.histoProcessNo}
                            onChange={handleSearchChange}
                            onKeyDown={handleIndex}
                            onBlur={(e) => {
                                autocompleteOnBlur(setFilterList);
                                setTimeout(() => {
                                    const match = histoProcessList.filter(
                                        (ele) => ele?.value === e.target.value,
                                    );
                                    if (match.length === 0) {
                                        setNavData((prev) => ({ ...prev, histoProcessNo: "" }));
                                    }
                                }, 500);
                            }}
                            lable={t("Histo Process No")}
                        />
                        {dropFalse && filterList.length > 0 && (
                            <ul className="suggestion-data" style={{ zIndex: 99 }}>
                                {filterList.map((data, index) => (
                                    <li
                                        onClick={() => handleListSelect(data)}
                                        className={`${index === indexMatch ? "matchIndex" : ""}`}
                                        key={index}
                                    >
                                        {data?.text}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="d-flex align-items-center">
                        <CustomButton
                            text="Search"
                            onClick={handleSearch}
                            icon="search"
                            className="mx-2"
                        />
                    </div>
                </div>

                {searched && (
                    <>

                        <div className="row">
                            <div className="col-sm-12">
                                <Heading title="Search Data" />
                                <CustomTable columns={columns} data={formattedData} hideNoRecord />
                                {tableData.length === 0 && <NoRecordFound />}
                            </div>
                        </div>
                        {/* <Heading title="Search Data" /> */}
                        <div className="row p-2 d-flex justify-content-left align-items-end">
                            <Input
                                type="text"
                                name="qcPathologist"
                                id="qcPathologist"
                                className="required-fields"
                                value={header.qcPathologist}
                                onChange={handleHeaderChange}
                                lable={t("QC Pathologist")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <DatePicker
                                name="qcDate"
                                id="qcDate"
                                value={header.qcDate}
                                onChange={handleHeaderDate}
                                lable={t("QC Date")}
                                className="custom-calendar"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <ReactSelect
                                placeholderName={t("Corrective Action")}
                                id="correctiveAction"
                                name="correctiveAction"
                                searchable={true}
                                dynamicOptions={yesNoOptions}
                                value={`${header.correctiveAction?.value}`}
                                onChange={handleHeaderSelect}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12" className="required-fields"
                                removeIsClearable={true}
                            />
                            <ReactSelect
                                placeholderName={t("Amended Report")}
                                id="amendedreport"
                                name="amendedreport"
                                searchable={true}
                                dynamicOptions={yesNoOptions}
                                value={`${header.amendedreport?.value}`}
                                onChange={handleHeaderSelect}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12 "
                                removeIsClearable={true}
                                className="required-fields"
                            />
                            <Input
                                type="text"
                                name="completedby"
                                id="completedby"
                                value={header.completedby}
                                onChange={handleHeaderChange}
                                lable={t("Completed By")}
                                className="required-fields"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <DatePicker
                                name="completedDate"
                                id="completedDate"
                                value={header.completedDate}
                                onChange={handleHeaderDate}
                                lable={t("Completed Date")}
                                className="custom-calendar"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <Input
                                type="text"
                                name="qcWeek"
                                id="qcWeek"
                                value={header.qcWeek}
                                onChange={handleHeaderChange}
                                lable={t("QC Week")}
                                className="required-fields"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <DatePicker
                                name="dateDispatched"
                                id="dateDispatched"
                                value={header.dateDispatched}
                                onChange={handleHeaderDate}
                                lable={t("Date Dispatched")}
                                className="custom-calendar"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <Input
                                type="text"
                                name="dispatchedby"
                                className="required-fields"
                                id="dispatchedby"
                                value={header.dispatchedby}
                                onChange={handleHeaderChange}
                                lable={t("Dispatched By")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <Input
                                type="text"
                                name="dispatchedTo"
                                id="dispatchedTo"
                                className="required-fields"
                                value={header.dispatchedTo}
                                onChange={handleHeaderChange}
                                lable={t("Dispatched To")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <Input
                                type="text"
                                className="required-fields"
                                name="qualitativeRemark"
                                id="qualitativeRemark"
                                value={header.qualitativeRemark}
                                onChange={handleHeaderChange}
                                lable={t("Qualitative Remark")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                        </div>
                        {tableData.length > 0 && (
                            <div className="row p-2 d-flex  align-items-center">
                                <div className="d-flex align-items-center">
                                    <CustomButton
                                        text="Save"
                                        onClick={handleSaveAll}
                                        icon="save"
                                        className="mx-2"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Accordion >
        </>
    );
};

export default QualityControlValue;

