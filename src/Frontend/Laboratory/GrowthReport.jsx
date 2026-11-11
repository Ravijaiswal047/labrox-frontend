import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import Accordion from "../../components/UI/Accordion";
import { useEffect, useState } from "react";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { Form } from 'react-bootstrap';
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosReport } from '../../utils/axiosInstance';
import { formatStandardDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../store/reducers/loadingSlice/loadingSlice';
import { getAccessCentresReports } from '../../utils/NetworkApi/commonApi';



const GrowthReport = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [CentreData, setCentreData] = useState([]);

     const dateTypeOptions = [
        { label: "RateType ", value: 0 },
        { label: "Doctor", value: 1 },
    ];

    const [payload, setPayload] = useState({
        Centre: [],
        FromDate: new Date(),
        ToDate: new Date(),
        dateType: 0,
    });



    useEffect(() => {
        getAccessCentresReports(setCentreData);

    }, []);



     const dateSelect = (date, name) => {
        setPayload((prev) => ({ ...prev, [name]: date }));
    };

    const handleSelectMultiChange = (name, value) => {
        setPayload((prev) => ({ ...prev, [name]: value }));
    };



      const handleDownload = async (reportFormat) => {
            dispatch(setLoading(true));
            try {
                const res = await axiosReport.post(
                    "CombineBussinessReport/BusinessGrowthReport",
                    {
                        preFromDate: "2025-01-01",
                        preToDate: "2025-01-31",
                        curFromDate:    formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
                        curToDate:      formatStandardDate(payload.ToDate,   "YYYY-MM-DD"),
                        dataType:    payload.dateType ?? 0,
                        centreIds: payload.Centre,
                        reportFormat,
                    },
                    { responseType: "blob" }
                );
    
                const contentType = res?.headers?.["content-type"] || "";
                if (contentType.includes("application/json")) {
                    const text = await res.data.text();
                    const json = JSON.parse(text);
                    toast.warning(json?.message || "No records found.");
                    return;
                }
    
                if (reportFormat === "Excel") {
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "GrowthReport.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    toast.success("Excel file downloaded");
                } else {
                    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                    window.open(url, "_blank");
                }
            } catch (error) {
                if (error?.response?.data instanceof Blob) {
                    const text = await error.response.data.text();
                    try {
                        const json = JSON.parse(text);
                        toast.error(json?.message || "Error downloading report");
                    } catch {
                        toast.error("Error downloading report");
                    }
                } else {
                    toast.error(error?.response?.data?.message || "Error downloading report");
                }
            } finally {
                dispatch(setLoading(false));
            }
        };
    
        const handleExcelReport = () => handleDownload("Excel");
        const handlePdfReport   = () => handleDownload("Pdf");


























    return (
        <Accordion
            name={t("Growth Report")}
            defaultValue={true}
            isBreadcrumb={true}
        >
            <div className="row px-2 py-2">
                <div className="col-sm-3 col-md-3 col-lg-2">
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

                <div className="col-sm-3 col-md-3 col-lg-2">
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

                <div className="col-sm-2">
                    <MultiSelectComp
                        label="All Centre"
                        options={CentreData}
                        value={payload?.Centre}
                        name="Centre"
                        onChange={handleSelectMultiChange}
                        lable={t("Select Centre")}
                    />
                </div>

                <div className="col-sm-auto d-flex align-items-center gap-3">
                    <label className="mb-0 mr-2"><strong>{t("Date Type")}:</strong></label>
                    {dateTypeOptions.map((opt) => (
                        <Form.Check
                            key={opt.value}
                            type="switch"
                            id={`dateType-${opt.value}`}
                            label={t(opt.label)}
                            checked={payload.dateType === opt.value}
                            onChange={() => setPayload((prev) => ({ ...prev, dateType: opt.value }))}
                            className="ml-3"
                        />
                    ))}
                </div>

                <div className="col-sm-3">
                    <div className="d-flex gap-2">
                        <CustomButton text={"PDF"} icon={"pdf"} onClick={handlePdfReport} className="mr-2" />
                        <CustomButton text={"Excel"} icon={"excel"} onClick={handleExcelReport} />
                    </div>
                </div>
            </div>
        </Accordion>
    );
};

export default GrowthReport;