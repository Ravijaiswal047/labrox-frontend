import React, { useEffect, useState } from 'react'
import Accordion from '../../../../components/UI/Accordion'
import { CustomButton } from '../../../../components/UI/CustomButton';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Input from '../../../../components/formComponent/Input';
import DatePicker from '../../../../components/formComponent/DatePicker';
import ReactSelect from '../../../../components/formComponent/ReactSelect';
import CustomTable from '../../../../components/Table/CustomTable';
import NoRecordFound from '../../../../components/formComponent/NoRecordFound';
import Heading from '../../../../components/UI/Heading';
import { autocompleteOnBlur, formatStandardDate } from "../../../../utils/helpers";
import { setLoading } from '../../../../store/reducers/loadingSlice/loadingSlice';
import { axiosInstance, axiosReport } from '../../../../utils/axiosInstance';
import { notify } from '../../../../utils/utils';
import { toast } from 'react-toastify';
import "../../../SalesFunnel/index.css";

const InterLabTechnicalQc = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [navData, setNavData] = useState({
        histoProcessNo: "",
    });
    const [filterList, setFilterList] = useState([]);
    const [dropFalse, setDropFalse] = useState(false);
    const [indexMatch, setIndexMatch] = useState(0);
    const [histoProcessList, setHistoProcessList] = useState([]);
    const [searched, setSearched] = useState(false);
    const [lockProcessNo, setLockProcessNo] = useState(false);

    // header + footer fields from the reference layout
    const [formData, setFormData] = useState({
        week: "",
        dateSend: new Date(),
        sendBy: "",
        sendTo: "",
        qcPerformedBy: "",
        qcOfficer: "",
        qcDate: new Date(),
        acknowledgeBy: "",
        acknowledgeDate: new Date(),
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormDate = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    // table rows returned by the search
    const [tableData, setTableData] = useState([]);

    // Adequate / Inadequate / Conformance -> THICKNESS, ORIENTATION
    const adequacyOptions = [
        { label: "Adequate", value: "Adequate" },
        { label: "Inadequate", value: "Inadequate" },
        { label: "Conformance", value: "Conformance" },
    ];

    // Yes / No / None -> all other quality columns
    const yesNoNoneOptions = [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
        { label: "None", value: "None" },
    ];

    // update an editable react-select cell for a single row
    const handleRowSelect = (name, selected, rowIndex) => {
        setTableData((prev) =>
            prev.map((row, i) =>
                i === rowIndex ? { ...row, [name]: selected?.value ?? "" } : row,
            ),
        );
    };

    // update an editable text cell for a single row
    const handleRowChange = (e, rowIndex) => {
        const { name, value } = e.target;
        setTableData((prev) =>
            prev.map((row, i) => (i === rowIndex ? { ...row, [name]: value } : row)),
        );
    };

    const renderSelectCell = (row, index, field, options) => (
        <ReactSelect
            placeholderName={t("select")}
            id={`${field}_${index}`}
            name={field}
            searchable={true}
            dynamicOptions={options}
            value={row[field] || ""}
            onChange={(name, selected) => handleRowSelect(name, selected, index)}
            removeIsClearable={true}
            className="required-fields"
        />
    );

    const renderInputCell = (row, index, field) => (
        <input
            type="text"

            name={field}
            value={row[field] || ""}
            onChange={(e) => handleRowChange(e, index)}
            className="required-fields form-control"
        />
    );

    const columns = [
        { header: "Case No", field: "Hno" },
        { header: "Thickness", field: "thickness", width: "9%" },
        { header: "Folds", field: "folds", width: "8%" },
        { header: "Scores", field: "scores", width: "8%" },
        { header: "Squamous Cells", field: "squamousCells", width: "8%" },
        { header: "Moth-Eaten", field: "mothEaten", width: "8%" },
        { header: "Air Bubbles", field: "airBubbles", width: "8%" },
        { header: "Debris", field: "debris", width: "8%" },
        { header: "Floater", field: "floater", width: "8%" },
        { header: "Orientation", field: "orientation", width: "9%" },
        { header: "Chatters", field: "chatters", width: "8%" },
        { header: "Microtomist", field: "microtomist" },
        { header: "Acknowledgement by tech", field: "acknowledgementByTech" },
    ];

    const formattedData = tableData.map((row, index) => ({
        ...row,
        thickness: renderSelectCell(row, index, "thickness", adequacyOptions),
        folds: renderSelectCell(row, index, "folds", yesNoNoneOptions),
        scores: renderSelectCell(row, index, "scores", yesNoNoneOptions),
        squamousCells: renderSelectCell(row, index, "squamousCells", yesNoNoneOptions),
        mothEaten: renderSelectCell(row, index, "mothEaten", yesNoNoneOptions),
        airBubbles: renderSelectCell(row, index, "airBubbles", yesNoNoneOptions),
        debris: renderSelectCell(row, index, "debris", yesNoNoneOptions),
        floater: renderSelectCell(row, index, "floater", yesNoNoneOptions),
        orientation: renderSelectCell(row, index, "orientation", adequacyOptions),
        chatters: renderSelectCell(row, index, "chatters", yesNoNoneOptions),
        microtomist: renderInputCell(row, index, "microtomist"),
        acknowledgementByTech: renderInputCell(row, index, "acknowledgementByTech"),
    }));

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

    const handleListSelect = (data) => {
        setNavData((prev) => ({ ...prev, histoProcessNo: data?.value }));
        setFilterList([]);
        setDropFalse(false);
    };

    const handleSearch = async () => {
        if (!navData.histoProcessNo) {
            toast.error("Please select Histo Process No");
            return;
        }

        dispatch(setLoading(true));
        await axiosInstance
            .post("QCHistoInterlab/GetQualitativeProcessHisto", {
                histoProcessNo: navData.histoProcessNo,
            })
            .then((res) => {
                console.log("InterLab Technical QC - GetQualitativeProcessHisto response:", res?.data);
                // lock the Histo Process No once the search succeeds
                setLockProcessNo(!!res?.data?.success);
                const items = res?.data?.message?.items;
                if (Array.isArray(items) && res?.data?.success) {
                    setTableData(items);
                    setSearched(true);
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

    // row cells that must be filled before saving
    const rowFields = [
        { key: "thickness", label: "Thickness" },
        { key: "folds", label: "Folds" },
        { key: "scores", label: "Scores" },
        { key: "squamousCells", label: "Squamous Cells" },
        { key: "mothEaten", label: "Moth-Eaten" },
        { key: "airBubbles", label: "Air Bubbles" },
        { key: "debris", label: "Debris" },
        { key: "floater", label: "Floater" },
        { key: "orientation", label: "Orientation" },
        { key: "chatters", label: "Chatters" },
        { key: "microtomist", label: "Microtomist" },
        { key: "acknowledgementByTech", label: "Acknowledgement by tech" },
    ];

    // every header and row field is mandatory
    const validateBeforeSave = () => {
        if (tableData.length === 0) {
            toast.error("Please search records before saving");
            return false;
        }

        // header fields
        if (!String(formData.week || "").trim()) {
            toast.error("Please enter Week");
            return false;
        }
        if (!formData.dateSend) {
            toast.error("Please select Date Send");
            return false;
        }
        if (!String(formData.sendBy || "").trim()) {
            toast.error("Please enter Send By");
            return false;
        }
        if (!String(formData.sendTo || "").trim()) {
            toast.error("Please enter Send To (QC Lab)");
            return false;
        }
        if (!String(formData.qcPerformedBy || "").trim()) {
            toast.error("Please enter QC Performed By");
            return false;
        }
        if (!String(formData.qcOfficer || "").trim()) {
            toast.error("Please enter QC Officer");
            return false;
        }
        if (!formData.qcDate) {
            toast.error("Please select Date");
            return false;
        }
        if (!String(formData.acknowledgeBy || "").trim()) {
            toast.error("Please enter Acknowledged By");
            return false;
        }
        if (!formData.acknowledgeDate) {
            toast.error("Please select Acknowledged Date");
            return false;
        }

        // row fields
        for (let i = 0; i < tableData.length; i++) {
            const row = tableData[i];
            for (const f of rowFields) {
                if (!String(row[f.key] || "").trim()) {
                    toast.error(`Please fill ${f.label}`);
                    return false;
                }
            }
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
        setFormData({
            week: "",
            dateSend: new Date(),
            sendBy: "",
            sendTo: "",
            qcPerformedBy: "",
            qcOfficer: "",
            qcDate: new Date(),
            acknowledgeBy: "",
            acknowledgeDate: new Date(),
        });
    };

    const handleSave = async () => {
        if (!navData.histoProcessNo) {
            toast.error("Please select Histo Process No");
            return;
        }
        if (!validateBeforeSave()) return;

        const savePayload = {
            qcRequestNo: navData.histoProcessNo,
            header: {
                weekNo: formData.week || "",
                dateSent: formatStandardDate(formData.dateSend),
                sentToLab: formData.sendTo || "",
                qcPerformedBy: formData.qcPerformedBy || "",
                qcOfficer: formData.qcOfficer || "",
                qcOfficerDate: formatStandardDate(formData.qcDate),
                acknowledgedBy: formData.acknowledgeBy || "",
                acknowledgedDate: formatStandardDate(formData.acknowledgeDate),
            },
            items: tableData.map((row) => ({
                id: Number(row.ProcessHistoId) || 0,
                hNo: row.Hno || "",
                thickness: row.thickness || "",
                folds: row.folds || "",
                scores: row.scores || "",
                squamousCells: row.squamousCells || "",
                mothEaten: row.mothEaten || "",
                airBubbles: row.airBubbles || "",
                debris: row.debris || "",
                floater: row.floater || "",
                orientation: row.orientation || "",
                chatters: row.chatters || "",
                microtomistName: row.microtomist || "",
                acknowledgementbytech: row.acknowledgementByTech || "",
            })),
        };

        dispatch(setLoading(true));
        await axiosInstance
            .post("QCHistoInterlab/SaveQCHistoInterlab", savePayload)
            .then(async (res) => {
                if (res?.data?.success) {
                    notify(res?.data?.message || "Saved successfully.", "success");
                    // QC Request No returned by save -> open the report, then reset the form
                    const savedQcRequestNo = res?.data?.data || navData.histoProcessNo;
                    await getInterlabReport(savedQcRequestNo);
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

    // Open the QC Histo Inter-Lab report (PDF) for the given QC request no
    const getInterlabReport = async (qcRequestNo) => {
        dispatch(setLoading(true));
        await axiosReport
            .post(
                "commonReports/QCHistoInterlabReport",
                { qcRequestNo },
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

    return (
        <>
            <Accordion title={"InterLab Technical Qc"} breadcrumb={true} defaultValue={true}>
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


                        {/* Technical QC grid */}
                        <div className="row">
                            <div className="col-sm-12">
                                <Heading title="Technical QC" />
                                <CustomTable columns={columns} data={formattedData} hideNoRecord disableTooltip />
                                {tableData.length === 0 && <NoRecordFound />}
                            </div>
                        </div>

                        {/* Footer fields */}
                        <div className="row p-2 d-flex justify-content-left align-items-end">
                            <Input
                                type="text"
                                name="week"
                                id="week"
                                value={formData.week}
                                onChange={handleFormChange}
                                lable={t("Week")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                                className="required-fields"
                            />
                            <DatePicker
                                name="dateSend"
                                id="dateSend"
                                value={formData.dateSend}
                                onChange={handleFormDate}
                                lable={t("Date Send")}
                                className="custom-calendar"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <Input
                                type="text"
                                name="sendBy"
                                id="sendBy"
                                value={formData.sendBy}
                                onChange={handleFormChange}
                                lable={t("Send By")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                                className="required-fields"
                            />
                            <Input
                                type="text"
                                name="sendTo"
                                id="sendTo"
                                value={formData.sendTo}
                                onChange={handleFormChange}
                                lable={t("Send To (QC Lab)")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                                className="required-fields"
                            />
                            <Input
                                type="text"
                                name="qcPerformedBy"
                                id="qcPerformedBy"
                                value={formData.qcPerformedBy}
                                onChange={handleFormChange}
                                lable={t("QC Performed By")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                                className="required-fields"
                            />
                            <Input
                                type="text"
                                name="qcOfficer"
                                id="qcOfficer"
                                value={formData.qcOfficer}
                                onChange={handleFormChange}
                                lable={t("QC Officer")}
                                className="required-fields"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                            <DatePicker
                                name="qcDate"
                                id="qcDate"
                                value={formData.qcDate}
                                onChange={handleFormDate}
                                lable={t("Date")}
                                className="custom-calendar"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                                className="required-fields"
                            />
                            <Input
                                type="text"
                                name="acknowledgeBy"
                                id="acknowledgeBy"
                                value={formData.acknowledgeBy}
                                onChange={handleFormChange}
                                lable={t("Acknowledged By")}
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                                className="required-fields"
                            />
                            <DatePicker
                                name="acknowledgeDate"
                                id="acknowledgeDate"
                                value={formData.acknowledgeDate}
                                onChange={handleFormDate}
                                lable={t("Acknowledged By Date")}
                                className="custom-calendar"
                                respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                            />
                        </div>

                        {tableData.length > 0 && (
                            <div className="row p-2 d-flex  align-items-center">
                                <div className="d-flex align-items-center">
                                    <CustomButton
                                        text="Save"
                                        onClick={handleSave}
                                        icon="save"
                                        className="mx-2"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Accordion>
        </>
    )
}

export default InterLabTechnicalQc