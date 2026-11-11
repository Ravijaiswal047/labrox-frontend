import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { CustomButton } from "../../components/UI/CustomButton";
import Loading from "../../components/loader/Loading";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Tables from "../../components/UI/customTable";
import AgingPatientModal from "./AgingPatientModal";
import Heading from "../../components/UI/Heading";

const AgingReport = () => {
    const { t } = useTranslation();
    const [centreOptions, setCentreOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [payload, setPayload] = useState({
        CentreID: [],
    });

    const [modalShow, setModalShow] = useState(false);
    const [selectedPayload, setSelectedPayload] = useState(null);

    const totals = useMemo(() => {
        return tableData.reduce((acc, row) => {
            acc.current += Number(row.current || 0);
            acc.days1To30 += Number(row.days1To30 || 0);
            acc.days31To60 += Number(row.days31To60 || 0);
            acc.days61To90 += Number(row.days61To90 || 0);
            acc.days90Plus += Number(row.days90Plus || 0);
            acc.totalDue += Number(row.totalDue || 0);
            return acc;
        }, {
            current: 0,
            days1To30: 0,
            days31To60: 0,
            days61To90: 0,
            days90Plus: 0,
            totalDue: 0
        });
    }, [tableData]);

    const columns = [
        { header: t("S.No"), field: "sNo" },
        { header: t("Centre Name"), field: "centreName" },
        { header: t("Rate Type Name"), field: "rateTypeName" },
        { header: `${t("Current")} (${totals.current.toLocaleString()})`, field: "current" },
        { header: `${t("1-30 Days")} (${totals.days1To30.toLocaleString()})`, field: "days1To30" },
        { header: `${t("31-60 Days")} (${totals.days31To60.toLocaleString()})`, field: "days31To60" },
        { header: `${t("61-90 Days")} (${totals.days61To90.toLocaleString()})`, field: "days61To90" },
        { header: `${t("90+ Days")} (${totals.days90Plus.toLocaleString()})`, field: "days90Plus" },
        { header: `${t("Total Due")} (${totals.totalDue.toLocaleString()})`, field: "totalDue" },
    ];

    const clickableColumns = ["days1To30", "days31To60", "days61To90", "days90Plus"];

    const getAgeingType = (field) => {
        switch (field) {
            case "days1To30": return "1-30";
            case "days31To60": return "31-60";
            case "days61To90": return "61-90";
            case "days90Plus": return "90+";
            default: return "";
        }
    };

    const handleCellClick = (row, field) => {
        if (clickableColumns.includes(field)) {
            const ageingType = getAgeingType(field);
            if (ageingType && row[field] !== 0) {
                setSelectedPayload({
                    AgeingType: ageingType,
                    RateTypeID: row.rateTypeID,
                    totalValue: row[field]
                });
                setModalShow(true);
            }
        }
    };

    const getAllCentre = async () => {
        try {
            const res = await axiosInstance.get("centre/getGlobalCentres");
            const resList = res?.data?.message?.map((item) => ({
                label: item?.Centre,
                value: item?.CentreID,
            }));
            setCentreOptions(resList || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to fetch centres");
        }
    };

    const handleSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const fetchAgingReport = async () => {
        setLoading(true);
        try {
            const res = await axiosReport.post("NPLReport/AgingReport", payload);
            if (res?.data?.message && Array.isArray(res.data.message)) {
                const dataWithSNo = res.data.message.map((item, index) => ({
                    ...item,
                    sNo: index + 1,
                }));
                setTableData(dataWithSNo);
                if (dataWithSNo.length === 0) {
                    toast.info("No record found");
                }
            } else {
                setTableData([]);
                toast.info("No record found");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllCentre();
    }, []);

    return (
        <div className="px-2">
            <Accordion
                name={t("Cash Aging Report")}
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2 align-items-end">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={centreOptions}
                            name="CentreID"
                            value={payload?.CentreID}
                            onChange={handleSelectChange}
                            label={t("Centre")}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton
                            text={t("Search")}
                            icon="search"
                            onClick={fetchAgingReport}
                            disabled={loading}
                        />
                    </div>
                </div>
            </Accordion>
            {tableData?.length > 0 && <Heading title={"Search Data"} />}

            {loading ? (
                <Loading />
            ) : (
                tableData.length > 0 && (
                    <div className="mt-1">
                        <Tables>
                            <thead>
                                <tr>
                                    {columns.map((col, index) => (
                                        <th key={index}>{col.header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, index) => (
                                    <tr key={index}>
                                        {columns.map((col, colIndex) => (
                                            <td 
                                                key={colIndex} 
                                                data-title={col.header}
                                                onClick={() => handleCellClick(row, col.field)}
                                                style={{ 
                                                    cursor: clickableColumns.includes(col.field) && row[col.field] !== 0 ? "pointer" : "default",
                                                    color: clickableColumns.includes(col.field) && row[col.field] !== 0 ? "#007bff" : "inherit",
                                                    textDecoration: clickableColumns.includes(col.field) && row[col.field] !== 0 ? "underline" : "none"
                                                }}
                                            >
                                                {row[col.field]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    </div>
                )
            )}

            {modalShow && (
                <AgingPatientModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    payload={selectedPayload}
                />
            )}
        </div>
    );
};

export default AgingReport;


