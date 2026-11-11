import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { axiosReport } from "../../utils/axiosInstance";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const AgingPatientModal = ({ show, onHide, payload }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const theme = useLocalStorage("theme", "get",);

    const modalTotalDue = useMemo(() => {
        return tableData.reduce((acc, row) => acc + Number(row.dueAmount || 0), 0);
    }, [tableData]);

    const columns = [
        { header: t("S.No"), field: "sNo" },
        { header: t("Visit Date"), field: "visitDate" },
        { header: t("Visit No"), field: "visitNo" },
        { header: t("Age"), field: "age" },
        { header: t("Gender"), field: "gender" },
        { header: t("Rate Type Name"), field: "rateTypeName" },
        { header: t("Gross Amt"), field: "grossAmount" },
        { header: t("Disc Amt"), field: "discountAmount" },
        { header: t("Net Amt"), field: "netAmount" },
        { header: t("Received Amt"), field: "receivedAmount" },
        { header: t("Due Amt"), field: "dueAmount" },
    ];

    const fetchPatientDetails = async () => {
        setLoading(true);
        try {
            const res = await axiosReport.post("NPLReport/PatientDetailBYAgingReport", payload);
            if (res?.data?.message && Array.isArray(res.data.message)) {
                const dataWithSNo = res.data.message.map((item, index) => ({
                    ...item,
                    sNo: index + 1,
                }));
                setTableData(dataWithSNo);
            } else {
                setTableData([]);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to fetch details");
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && payload?.RateTypeID) {
            fetchPatientDetails();
        }
    }, [show, payload]);

    return (
        <Dialog
            header={`${t("Patient Details")} - ${payload?.AgeingType} (${modalTotalDue.toLocaleString()})`}
            visible={show}
            onHide={onHide}
            style={{ width: "80vw" }}
            breakpoints={{ "960px": "95vw" }}
            className={theme}
        >
            {loading ? (
                <Loading />
            ) : (
                <div className="mt-2">
                    <Tables>
                        <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <th key={index}>{col.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length > 0 ? (
                                tableData.map((row, index) => (
                                    <tr key={index}>
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex} data-title={col.header}>
                                                {row[col.field]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center">
                                        {t("No Record Found")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Tables>
                </div>
            )}
        </Dialog>
    );
};

export default AgingPatientModal;
