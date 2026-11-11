import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { apiUrls } from "../../utils/apiUrls";
import RadioInput from "../../components/formComponent/RadioInput";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";


const CollectionReportPanel = () => {
    const [options, setOptions] = useState([]);
    const { t } = useTranslation();
    const [panel, setPanel] = useState([]);
    const [filters, setFilters] = useState({
        reportType: "Summary",
        panelPayMode: "Cash",
    });

    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: "",
        Panel: "",
    })

    const handleChangeMap = (selectedOptions, name) => {
        const values = selectedOptions.map((opt) => opt.value);
        setPayload((prev) => ({
            ...prev,
            [name]: values,
        }));
    };

    const handleRadioChange = (name, value) => {
        console.log(`${name}:`, value);
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearchSelectChange = (label, value) => {
        setPayload({ ...payload, [label]: value?.value });
    };

    const getAllCentre = async () => {

        await axiosInstance
            .get("centre/getGlobalCentres")
            .then((res) => {
                const resList = res?.data?.message?.map((item) => ({
                    ...item,
                    value: item.CentreID,
                    label: item.Centre,
                }));
                setOptions(resList);

            })
            .catch((err) => {
                toast.error(err?.data?.message || "Save failed! Please try again.");
            }).finally(() => {

            })

    };

    useEffect(() => {
        getAllCentre();
    }, []);

    console.log("payload", payload);

    return (
        <>
            <Accordion
                name="Panel Wise Collection Report"
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2">
                    <div className="col-sm-3 col-md-2 col-lg-2">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="FromDate"
                            lable={t("FromDate")}
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="col-sm-3 col-md-2 col-lg-2">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable={t("ToDate")}
                            maxDate={new Date()}
                            minDate={payload?.FromDate}
                        />
                    </div>
                    <div className="col-sm-3 col-md-2 col-lg-2">
                        <ReactSelect
                            dynamicOptions={options}
                            name="Centre"
                            lable={t("Centre")}
                            id="Centre"
                            removeIsClearable={true}
                            placeholderName={t("Centre")}
                            value={payload?.Centre}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-sm-3 col-md-2 col-lg-2">
                        <ReactSelect
                            dynamicOptions={panel}
                            name="Panel"
                            lable={t("Panel")}
                            id="Panel"
                            removeIsClearable={true}
                            placeholderName={t("Panel")}
                            value={payload?.Panel}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-sm-4 col-md-4 col-lg-4">
                        <div className="d-flex align-items-center flex-wrap mr-4">
                            <label className="fw-bold mr-3 mb-0">Report Type :</label>

                            <RadioInput
                                label="Summary"
                                name="reportType"
                                type="radio"
                                checked={filters.reportType === "Summary"}
                                onChange={() => handleRadioChange("reportType", "Summary")}

                                className="d-flex align-items-center"
                            />

                            <RadioInput
                                label="Detail"
                                name="reportType"
                                type="radio"
                                checked={filters.reportType === "Detail"}
                                onChange={() => handleRadioChange("reportType", "Detail")}

                                className="d-flex align-items-center"
                            />
                            <RadioInput
                                label="Month Wise Summary"
                                name="reportType"
                                type="radio"
                                checked={filters.reportType === "Month Wise Summary"}
                                onChange={() => handleRadioChange("reportType", "Month Wise Summary")}

                                className="d-flex align-items-center"
                            />
                        </div>
                    </div>
                    {/* <div className="col-sm-4 col-md-4 col-lg-3">  */}
                    <div className="d-flex align-items-center flex-wrap mr-2 ml-3">
                        <label className="fw-bold mr-3 mb-0">Panel Pay Mode :</label>

                        <RadioInput
                            label="Cash"
                            name="panelPayMode"
                            type="radio"
                            checked={filters.panelPayMode === "Cash"}
                            onChange={() => handleRadioChange("panelPayMode", "Cash")}
                            className="d-flex align-items-center"
                        />

                        <RadioInput
                            label="Credit"
                            name="panelPayMode"
                            type="radio"
                            checked={filters.panelPayMode === "Credit"}
                            onChange={() => handleRadioChange("panelPayMode", "Credit")}
                            className="d-flex align-items-center"
                        />

                        <RadioInput
                            label="Both"
                            name="panelPayMode"
                            type="radio"
                            checked={filters.panelPayMode === "Both"}
                            onChange={() => handleRadioChange("panelPayMode", "Both")}
                            className="d-flex align-items-center"
                        />
                    </div>


                    <CustomButton text="Get Report" icon="pdf"
                        className="mx-2 mb-1"
                    // onClick={getPanelReport} 
                    />


                    <CustomButton text="Excel Export" icon="excel"
                        className="mx-2 mb-1"
                    // onClick={handleExcelReport} 
                    />

                </div>
                <div className="row px-2 mt-2 mb-2">
                </div>
            </Accordion>
        </>
    );
};

export default CollectionReportPanel;
