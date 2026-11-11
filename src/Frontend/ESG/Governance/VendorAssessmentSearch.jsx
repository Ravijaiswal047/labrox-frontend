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
import Input from "../../../components/formComponent/Input";

const VendorAssessmentSearch = ({ onEdit }) => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([]);
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [payload, setPayload] = useState({
        centreId: [],
        vendorName: "",
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
            vendorName: payload.vendorName,
            fromDate: payload.fromDate,
            toDate: payload.toDate
        };

        try {
            const res = await axiosInstance.post("ESG/GetVendorAssessmentList", finalPayload);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
    };

    return (
        <>
            <div className="row px-2 py-2">
                <div className="col-sm-2">
                    <MultiSelectComp
                        label={t("Select Centres")}
                        options={centre}
                        value={payload.centreId}
                        name="centreId"
                        onChange={handleSelectChange}
                    />
                </div>
                <div className="col-sm-2">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="vendorName"
                        id="vendorName"
                        lable={"Vendor Name"}
                        value={payload?.vendorName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-sm-2">
                    <DatePicker
                        name="fromDate"
                        lable={t("From Date")}
                        value={payload.fromDate}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="col-sm-2">
                    <DatePicker
                        name="toDate"
                        lable={t("To Date")}
                        value={payload.toDate}
                        onChange={handleDateChange}
                        minDate={payload.fromDate}
                    />
                </div>
                <div className="col-auto">
                    <SearchButton
                        text={t("Search")}
                        onClick={handleSearch}
                    />
                </div>
            </div>

            <Accordion title={t("Vendor Assessment Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Centre")}</th>
                                        <th>{t("Vendor Name")}</th>
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
                                            <td data-title={t("Vendor Name")}>
                                                <span className="fw-bold text-primary">
                                                    {data?.VendorName}
                                                </span>
                                            </td>
                                            <td data-title={t("Status")}>
                                                <span className={`badge ${data?.Status == 0 ? "bg-warning text-dark" :
                                                    data?.Status == 1 ? "bg-info text-dark" :
                                                        data?.Status == 2 ? "bg-success" :
                                                            "bg-secondary"
                                                    }`}>
                                                    {
                                                        // data?.Status == 0 ? t("Open") :
                                                        //     data?.Status == 1 ? t("In Progress") :
                                                        //         data?.Status == 2 ? t("Closed") :
                                                        //             t("Unknown")
                                                        data?.Status || ""
                                                    }
                                                </span>
                                            </td>
                                            <td data-title={t("Created On")}>
                                                {data?.dtEntry || "-"}
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

export default VendorAssessmentSearch;