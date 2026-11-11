import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import DatePicker from "../../../components/formComponent/DatePicker";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { CustomButton, SearchButton } from "../../../components/UI/CustomButton";
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi";
import Accordion from "../../../components/UI/Accordion";
import { axiosReport } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

const ESGReports = () => {
    const [t] = useTranslation();

    const [centre, setCentre] = useState([]);

    const [payload, setPayload] = useState({
        centreId: [],
        fromDate: new Date(),
        toDate: new Date(),
        reportType: "EnvironmentDataManagement",
    });

    useEffect(() => {
        getAccessCentresReports(setCentre);
    }, []);

    const reportOptions = [
        {
            label: "EnvironmentDataManagement",
            value: "EnvironmentDataManagement",
        },
        {
            label: "Social & GoverenceDataManagement",
            value: "SocialDataManagement",
        },
        {
            label: "RiskReport",
            value: "RiskReport",
        },
    ];

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value || "",
        }));
    };

    const handleGetReport = async () => {
        if (!payload?.reportType) {
            toast.error("Please select report type");
            return;
        }

        const apiPayload = {
            fromDate: payload?.fromDate,
            toDate: payload?.toDate,
            centreIds: payload?.centreId || [],
        };

        let apiURL = "";

        if (payload?.reportType === "EnvironmentDataManagement") {
            apiURL = "ESGModule/EnvironmentalReport";
        } else if (payload?.reportType === "SocialDataManagement") {
            apiURL = "ESGModule/SocialReport";
        } else if (payload?.reportType === "RiskReport") {
            apiURL = "ESGModule/RiskReport";
        }
        // else if (payload?.reportType === "GoverenceDataManagement") {
        //     apiURL = "ESGModule/GovernanceReport";
        // }
      
        await axiosReport
            .post(apiURL, apiPayload)
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(res?.data?.message);

                    if (res?.data?.url) {
                        window.open(res?.data?.url, "_blank");
                    }
                } else {
                    toast.error(res?.data?.message || "Failed to generate report");
                }
            })
            .catch((error) => {
                console.error(error);
                toast.error("Something went wrong");
            });
    };

    console.log("payload:",payload);

    return (
        <> 
        <Accordion name={t("ESG Reports")} isBreadcrumb={true} defaultValue={true}>
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={reportOptions}
                        name="reportType"
                        lable={t("Report Type")}
                        id="reportType"
                        removeIsClearable={true}
                        placeholderName={t("Select Report")}
                        value={payload?.reportType}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="All Centre"
                        options={centre}
                        value={payload?.centreId}
                        name="centreId"
                        id="centreId"
                        onChange={handleMultiSelectChange}
                        lable={t("Select Centre")}
                    />
                </div>

                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="fromDate"
                        id="fromDate"
                        className="custom-calendar"
                        lable={t("From Date")}
                        value={payload?.fromDate}
                        onChange={handleDateChange}
                        maxDate={payload?.toDate}
                    />
                </div>

                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="toDate"
                        id="toDate"
                        className="custom-calendar"
                        lable={t("To Date")}
                        value={payload?.toDate}
                        onChange={handleDateChange}
                        minDate={payload?.fromDate}
                        maxDate={new Date()}
                    />
                </div>

                

                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <CustomButton
                        text={"Get Report"}
                        icon="pdf"
                        onClick={handleGetReport}
                    />
                </div>
            </div>
        </Accordion>
        </>
    );
};

export default ESGReports;