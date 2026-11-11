import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import Heading from "../../../../components/UI/Heading";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import CustomTable from "../../../../components/Table/CustomTable";
import NoRecordFound from "../../../../components/formComponent/NoRecordFound";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { formatStandardDate } from "../../../../utils/helpers";
import { notify } from "../../../../utils/utils";
import { toast } from "react-toastify";
import moment from "moment";

// Page Search dropdown -> searchType sent to the API
const searchTypeOptions = [
    { label: "QcRequestHistocyto", value: 1 },
    { label: "QcHistocyto", value: 2 },
    { label: "InterLabTechnicalQc", value: 3 },
];

const MicroHistoReports = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const initialState = {
        fromDate: new Date(),
        toDate: new Date(),
        searchType: "",
    };
    const [payload, setPayload] = useState(initialState);
    const [tableData, setTableData] = useState([]);

    const dateSelect = (date, name) => {
        setPayload((prev) => ({ ...prev, [name]: date }));
    };

    const handleSelect = (name, selected) => {
        setPayload((prev) => ({ ...prev, [name]: selected?.value ?? "" }));
    };

    const handleSearch = async () => {
        if (!payload.searchType) {
            toast.error("Please select Page Search");
            return;
        }

        const searchPayload = {
            fromDate: moment(payload.fromDate).format("DD/MMM/YYYY"),
            toDate: moment(payload.toDate).format("DD/MMM/YYYY"),
            searchType: Number(payload.searchType),
        };

        dispatch(setLoading(true));
        await axiosInstance
            .post("QualitativeQCProcess/GetHistoProcessNoSearchData", searchPayload)
            .then((res) => {
                if (Array.isArray(res?.data?.message) && res?.data?.success) {
                    setTableData(res.data.message);
                    if (!res.data.message.length) notify("No records found.", "warn");
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
                console.log("tgest")
            });
    };

    const handleReset = () => {
        setPayload(initialState);
        setTableData([]);
    };

    // searchType 1 -> QC Request Histo report
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
                console.log("test")
            });
    };

    // searchType 2 -> QC Qualitative Histo report
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

    // searchType 3 -> QC Histo Inter-Lab report
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

    // Open the right report for a row based on its search type
    const handlePrint = (row) => {
        const searchType = Number(row?.SearchType) || Number(payload.searchType);
        const processNo = row?.HistoProcessNo;
        if (!processNo) {
            notify("No report available for this record", "warn");
            return;
        }
        switch (searchType) {
            case 1:
                getHistoReport(processNo, row?.RequestedDate || "");
                break;
            case 2:
                getQualitativeReport(processNo);
                break;
            case 3:
                getInterlabReport(processNo);
                break;
            default:
                notify("No report available for this record", "warn");
        }
    };

    const columns = [
        { header: "Sr. No", field: "srNo", width: "6%" },
        { header: "Histo Process No", field: "HistoProcessNo" },
        { header: "Requested By", field: "RequestedBy" },
        { header: "Requested Date", field: "RequestedDate" },
        { header: "Print", field: "print", width: "8%" },
    ];

    const formattedData = tableData.map((row, index) => ({
        ...row,
        srNo: index + 1,
        print: (
            <CustomButton
                icon="print"
                variant="info"
                onClick={() => handlePrint(row)}
            />
        ),
    }));

    return (
        <>
            <div className="card">
                <Heading name={"Micro Histo Reports"} isBreadcrumb={"true"} />

                <div className="row p-2 d-flex justify-content-left align-items-center">
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
                    <ReactSelect
                        placeholderName={t("Page Search")}
                        id="searchType"
                        name="searchType"
                        searchable={true}
                        dynamicOptions={searchTypeOptions}
                        value={payload.searchType}
                        onChange={handleSelect}
                        removeIsClearable={true}
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
            </div>
        </>
    );
};

export default MicroHistoReports;
