import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosReport, axiosInstance } from "../../utils/axiosInstance";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { formatStandardDate } from "../../utils/helpers";

const UnApprovedReport = () => {
    const { t } = useTranslation();
    const [CentreData, setCentreData] = useState([]);
    const [DepartmentData, setDepartmentData] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [formData, setFormData] = useState({
        Centre: [],
        Department: [],
        FromDate: new Date(),
        ToDate: new Date(),
    });

    const getDepartmentReports = () => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                const data = res.data.message;
                const DeptDataValue = data.map((ele) => ({
                    value: ele.DepartmentID,
                    label: ele.Department,
                }));
                setDepartmentData(DeptDataValue);
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        getAccessCentresReports(setCentreData);
        getDepartmentReports();
    }, []);

    const handleSelectMultiChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const dateSelect = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const handleDownload = async (endpoint, filePrefix, fileType) => {
        setLoadingSearch(true);

        const payload = {
            fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
            fromTime: "00:00:00",
            toTime: "23:59:59",
            centre: formData.Centre.length > 0
                ? formData.Centre.map(item => typeof item === "object" ? item.value : item)
                : [0],
            departmentId: formData.Department.length > 0 ? formData.Department : [],
        };

        try {
            const res = await axiosReport.post(endpoint, payload, { responseType: "blob" });
            const contentType = res.headers["content-type"] || "";

            if (contentType.includes("application/json") || contentType.includes("text/html") || contentType.includes("text/plain")) {
                toast.info(t("No Record Found"));
                return;
            }

            const fileUrl = window.URL.createObjectURL(new Blob([res.data]));

            if (fileType === "pdf") {
                window.open(fileUrl, "_blank");
            } else {
                const link = document.createElement("a");
                link.href = fileUrl;
                link.setAttribute("download", `${filePrefix}_${new Date().getTime()}.xlsx`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            window.URL.revokeObjectURL(fileUrl);
            toast.success(t("Report generated successfully"));

        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("Error processing request"));
                } catch {
                    toast.error(t("Error processing request"));
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || t("Error processing request"));
            }
        } finally {
            setLoadingSearch(false);
        }
    };

    return (
        <>
            <Accordion title={t("UnApproved Report")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={CentreData}
                            value={formData.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            label={t("Centre")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={DepartmentData}
                            value={formData.Department}
                            name="Department"
                            onChange={handleSelectMultiChange}
                            label={t("Department")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="FromDate"
                            value={formData.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("From Date")}
                            className="custom-calendar"
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="ToDate"
                            value={formData.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("To Date")}
                            className="custom-calendar"
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton
                            text={t("Excel")}
                            onClick={() => handleDownload("CombineLabReport/GetUnApproveReportExcel", "UnApprovedReport", "excel")}
                            loading={loadingSearch}
                            icon={"excel"}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default UnApprovedReport;