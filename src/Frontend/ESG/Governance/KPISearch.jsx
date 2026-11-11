import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import DatePicker from "../../../components/formComponent/DatePicker";
import { SearchButton } from "../../../components/UI/CustomButton";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import Accordion from "../../../components/UI/Accordion";
import Tables from "../../../components/UI/customTable";
import { GetGlobalData } from "../../../utils/NetworkApi/commonApi";

const KPISearch = ({ onEdit }) => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([]);
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState([]);
    const [tableData, setTableData] = useState([])
    const [payload, setPayload] = useState({
        centreId: [],
        status: "",
        fromDate: new Date(),
        toDate: new Date(),
    });

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message;
            const CentreDataValue = data.map((ele) => ({
                value: ele.CentreID,
                label: ele.Centre,
            }));
            setCentre(CentreDataValue);
        } catch (error) {
            console.error("Error fetching centres", error);
        }
    };

    useEffect(() => {
        getAccessCentres();
        GetGlobalData(setStatus, "KPIStatus")
        
    }, []);

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

    const handleSearch = async () => {
        setLoading(true);

        const finalPayload = {
            centreId: payload.centreId,
            status: payload.status,
            fromDate: payload.fromDate,
            toDate: payload.toDate
        };

        try {
            const res = await axiosInstance.post("ESG/GetKPIList", finalPayload);
            if (res.data?.success) {
                setTableData(res.data.message || []);
            } else {
                setTableData([]);
                toast.info(res.data?.message || t("No records found"));
            }
        } catch (error) {
            console.error("Search Error", error);
            toast.error(t("Something went wrong while fetching audit data"));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (name, value) => {
        setPayload(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (value, name) => {
        setPayload(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label={t("Select Centres")}
                        options={centre}
                        value={payload.centreId}
                        name="centreId"
                        onChange={handleSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={status}
                        name="status"
                        lable={t("Status")}
                        placeholderName={t("Select Status")}
                        removeIsClearable={true}
                        value={payload.status}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="fromDate"
                        lable={t("From Date")}
                        className="custom-calendar"
                        value={payload.fromDate}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="toDate"
                        lable={t("To Date")}
                        className="custom-calendar"
                        value={payload.toDate}
                        onChange={handleDateChange}
                        minDate={payload.fromDate}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <SearchButton
                        text={t("Search")}
                        onClick={handleSearch}
                    />
                </div>
            </div>

            <Accordion title={t("KPI Performance Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Centre")}</th>
                                        <th>{t("KPI Name")}</th>
                                        <th>{t("Target")}</th>
                                        <th>{t("Progress Notes")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Created On")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData && tableData.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Centre")}>{data?.CentreName}</td>
                                            <td data-title={t("KPI Name")}>
                                                <span className="fw-bold text-primary">
                                                    {data?.KPIName}
                                                </span>
                                            </td>
                                            <td data-title={t("Target")}>
                                                    {data?.Target}
                                            </td>
                                            <td data-title={t("Progress Notes")}>
                                                <div
                                                    style={{
                                                        maxWidth: "250px",
                                                        whiteSpace: "normal",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    {data?.ProgressNotes || "-"}
                                                </div>
                                            </td>
                                            <td data-title={t("Status")}>
                                                {data?.Status}
                                            </td>
                                            <td data-title={t("Created On")}>
                                                {data?.CreatedOn || "-"}
                                            </td>
                                            <td data-title={t("Action")}>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => onEdit(data)}
                                                    title={t("Edit KPI")}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    </div>
                ) : (
                    <NoRecordFound />
                )}
            </Accordion>
        </>
    );
};

export default KPISearch;