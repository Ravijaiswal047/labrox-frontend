import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import Heading from "../../../../components/UI/Heading";
import DatePicker from "../../../../components/formComponent/DatePicker";
import Input from "../../../../components/formComponent/Input";
import CustomTable from "../../../../components/Table/CustomTable";
import NoRecordFound from "../../../../components/formComponent/NoRecordFound";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { formatStandardDate } from "../../../../utils/helpers";
import { notify } from "../../../../utils/utils";
import { toast } from "react-toastify";
import moment from "moment";

const QcProcessHistocyto = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const initialState = {
        fromDate: new Date(),
        toDate: new Date(),
        limit: "",
        requestedBy: "",
        printedBy: "",
        requestedDate: new Date(),
    };
    const [payload, setPayload] = useState(initialState);
    const [tableData, setTableData] = useState([]);
    console.log(tableData, "tableData")
    const dateSelect = (date, name) => {
        setPayload((prev) => ({ ...prev, [name]: date }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // allow digits only for number of tests
        setPayload((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, "") }));
    };

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    // Toggle a single row checkbox
    const handleRowCheck = (rowIndex) => {
        setTableData((prev) =>
            prev.map((row, i) =>
                i === rowIndex ? { ...row, isTechnicalQc: !row.isTechnicalQc } : row,
            ),
        );
    };

    // Select / unselect all rows
    const handleSelectAll = (checked) => {
        setTableData((prev) => prev.map((row) => ({ ...row, isTechnicalQc: checked })));
    };

    const allSelected =
        tableData.length > 0 && tableData.every((row) => row.isTechnicalQc);

    const columns = [
        { header: "Sr. No", field: "srNo", width: "5%" },
        // { header: "Test Id", field: "TestId" },
        // { header: "Ledger Transaction ID", field: "LedgerTransactionID" },
        { header: "Ledger Transaction No", field: "LedgerTransactionNo" },
        { header: "Spec No. ", field: "Hno" },
        { header: "No. of Slides", field: "SlideNumber" },
        { header: "Macro Description ", field: "MICROSCOPY" },
        { header: "Reporting Pathologist’s Diagnosis ", field: "Diagnosis" },
        {
            header: (
                <span className="d-inline-flex align-items-center" style={{ gap: "4px" }}>
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    {t("isTechnicalQc")}
                </span>
            ),
            field: "isTechnicalQc",
            width: "8%",
        },
    ];

    const formattedData = tableData.map((row, index) => ({
        ...row,
        srNo: index + 1,
        isTechnicalQc: (
            <input
                type="checkbox"
                checked={!!row.isTechnicalQc}
                onChange={() => handleRowCheck(index)}
            />
        ),
    }));

    const handleSearch = async () => {
        if (!payload.limit) {
            toast.error("Please enter Number of Tests");
            return;
        }

        const searchPayload = {
            fromDate: moment(payload.fromDate).format("DD/MMM/YYYY"),
            toDate: moment(payload.toDate).format("DD/MMM/YYYY"),
            limit: Number(payload.limit),
        };

        dispatch(setLoading(true));
        await axiosInstance
            .post("QualitativeQCProcess/GetQualitativeQCProcess", searchPayload)
            .then((res) => {
                if (Array.isArray(res?.data?.message) && res?.data?.success) {
                    const mappedData = res.data.message.map((item) => ({
                        ...item,
                        isTechnicalQc: false,
                    }));
                    setTableData(mappedData);
                    if (!mappedData.length) notify("No records found.", "warn");
                } else {
                    notify(res?.data?.message || "No records found.", "warn");
                    setTableData([]);
                }
            })
            .catch((err) => {
                notify(err?.data?.message || "Something went wrong", "error");
                setTableData([]);
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    const handleReset = () => {
        setPayload(initialState);

    };

    const handleSave = async () => {
        if (!tableData.length) {
            toast.error("Please search records before saving");
            return;
        }
        if (Number(payload.limit) !== tableData.length) {
            toast.error("No. of Tests and no. of rows should be same");
            return;
        }
        if (!payload.requestedBy?.trim()) {
            toast.error("Please enter Requested By");
            return;
        }
        // if (!payload.printedBy?.trim()) {
        //     toast.error("Please enter Printed By");
        //     return;
        // }
        if (!payload.requestedDate) {
            toast.error("Please select Requested Date");
            return;
        }

        const savePayload = {
            items: tableData.map((row) => ({
                ledgerTransactionID: Number(row.LedgerTransactionID) || 0,
                ledgerTransactionNo: row.LedgerTransactionNo || "",
                hno: row.Hno || "",
                slideNumber: row.SlideNumber || "",
                microscopy: row.MICROSCOPY || "",
                diagnosis: row.Diagnosis || "",
                isTechnicalQC: row.isTechnicalQc ? 1 : 0,
                requestedBy: payload.requestedBy.trim(),
                printedBy: payload.printedBy.trim(),
                requestedDate: formatStandardDate(payload.requestedDate),
                remark: row.COMMENT || "",
            })),
        };

        dispatch(setLoading(true));
        await axiosInstance
            .post("QualitativeQCProcess/SaveQCProcessHisto", savePayload)
            .then((res) => {
                if (res?.data?.success) {
                    notify(res?.data?.message || "Saved successfully.", "success");
                    const histoProcessNo = res?.data?.data;
                    const requestedDate = formatStandardDate(payload.requestedDate);
                    setTableData([]);
                    setPayload(initialState);
                    if (histoProcessNo) getHistoReport(histoProcessNo, requestedDate);
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

    const getHistoReport = async (histoProcessNo, monthLabel = "") => {
        dispatch(setLoading(true));
        await axiosReport
            .post(
                "commonReports/QCRequestHistoReport",
                { histoProcessNo, monthLabel },
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

    return (
        <>
            <div className="card">
                <Heading name={"Qc Request Histo/Cyto"} isBreadcrumb={"true"} />

                <div className="row p-2 d-flex justify-content-left">
                    <DatePicker
                        name="fromDate"
                        id="fromDate"
                        value={payload.fromDate}
                        onChange={dateSelect}
                        maxDate={payload.toDate || new Date()}
                        lable={t("From Date")}
                        className="custom-calendar"
                        respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                    />
                    <DatePicker
                        name="toDate"
                        id="toDate"
                        value={payload.toDate}
                        onChange={dateSelect}
                        minDate={payload.fromDate}
                        maxDate={new Date()}
                        lable={t("To Date")}
                        className="custom-calendar"
                        respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                    />
                    <Input
                        type="text"
                        name="limit"
                        id="limit"
                        value={payload.limit}
                        onChange={handleInputChange}
                        lable={t("No. of Tests")}

                        required
                        respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                    />
                    <div className="d-flex align-items-center">
                        <CustomButton
                            text="Search"
                            onClick={handleSearch}
                            icon="search"
                            className="mx-2"
                        />
                        <CustomButton
                            text="Reset"
                            onClick={handleReset}
                            icon="refresh"
                            className="mx-2"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12">
                        <Heading name={"Search Data"} isBreadcrumb={"true"} />
                        <CustomTable columns={columns} data={formattedData} hideNoRecord />
                        {tableData.length === 0 && <NoRecordFound />}
                    </div>
                </div>

                {tableData.length > 0 && (
                    <div className="row p-2 d-flex justify-content-start align-items-end">
                        <Input
                            type="text"
                            name="requestedBy"
                            id="requestedBy"
                            value={payload.requestedBy}
                            onChange={handleTextChange}
                            lable={t("Requested By")}
                            required
                            respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                        />
                        {/* <Input
                            type="text"
                            name="printedBy"
                            id="printedBy"
                            value={payload.printedBy}
                            onChange={handleTextChange}
                            lable={t("Printed By")}
                            required
                            respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                        /> */}
                        <DatePicker
                            name="requestedDate"
                            id="requestedDate"
                            value={payload.requestedDate || new Date()}
                            onChange={dateSelect}
                            lable={t("Requested Date")}
                            className="custom-calendar"
                            required
                            respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
                        />
                        <div className="pb-2">
                            <CustomButton
                                text="Save"
                                onClick={handleSave}
                                icon="save"

                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default QcProcessHistocyto;
