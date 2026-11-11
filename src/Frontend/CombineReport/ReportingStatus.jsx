import { t } from "i18next";
import { useState, useEffect } from "react";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import { CustomButton } from "../../components/UI/CustomButton";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { downloadExcelBlob } from "../../utils/helpers";

export default function ReportingStatus() {
    const [payload, setPayload] = useState({
        formDate: new Date(),
        ToDate: new Date(),
        Centre: "",
        TestCentre: "",
    });

    const [Center, setCenter] = useState([]);
    const [load, setLoad] = useState(false);

    useEffect(() => {
        axiosInstance
            .get("IQCControlCentreMapping/GetCentreById")
            .then((res) => {
                const list = (res?.data?.message || []).map((ele) => ({
                    value: ele.centreid,
                    label: ele.centre,
                }));
                setCenter(list);
            })
            .catch((err) => {
                console.log(err);
                toast.error("Something went wrong");
            });
    }, []);

    const handleDate = (value, name) => {
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelect = (name, option) => {
        setPayload((prev) => ({ ...prev, [name]: option?.value }));
    };

    const formatToDDMMYYYY = (date) => {
        const d = new Date(date);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleExcelDownload = async () => {
        // if (!payload?.formDate || !payload?.ToDate || !payload?.Centre) {
        //     toast.warn("Please select all required fields.");
        //     return;
        // }
        console.log("Payload for Excel Download:", payload);

        setLoad(true);
        try {
            const res = await axiosReport.post(
                "CombineLabReport/ReportingStatusReport/ReportingStatusReport",
                {
                    fromDate: formatToDDMMYYYY(payload?.formDate),
                    toDate: formatToDDMMYYYY(payload?.ToDate),
                    centreID: payload?.Centre || 0,
                    reportFormat: "Excel",
                    testCentreID: payload?.TestCentre || 0,
                },
                { responseType: "blob" }
            );

            const contentType = res.headers?.["content-type"] || "";

            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.warning(json?.message || "No records found.");
                return;
            }

            downloadExcelBlob(res.data, `ReprtingStatus`);
            toast.success(t("Excel downloaded successfully"));
        } catch (error) {
            if (error?.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Download Failed");
                } catch {
                    toast.error("Download Failed");
                }
            } else {
                toast.error(error?.response?.data?.message || error?.message || "Download Failed");
            }
        } finally {
            setLoad(false);
        }
    };

    return (
        <>
            <Accordion title={"Reporting Status"} defaultValue={true}>
                <div className="row pt-2 pl-2 pr-2">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            maxDate={new Date()}
                            value={payload?.formDate}
                            name="formDate"
                            id="formDate"
                            lable={t("From Date")}
                            onChange={handleDate}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            maxDate={new Date()}
                            value={payload?.ToDate}
                            minDate={payload?.formDate}
                            name="ToDate"
                            id="ToDate"
                            lable={t("To Date")}
                            onChange={handleDate}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            placeholderName={t("Select Booking Centre")}
                            id="Centre"
                            name="Centre"
                            onChange={handleSelect}
                            value={payload?.Centre}
                            dynamicOptions={[{ label: "Select Centre", value: "" }, ...Center]}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            id="TestCentre"
                            name="TestCentre"
                            placeholderName={t("Select Test Centre")}
                            onChange={handleSelect}
                            value={payload?.TestCentre}
                            dynamicOptions={[{ label: "Select Test Centre", value: "" }, ...Center]}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton
                            text={"Excel"}
                            icon={"excel"}
                            className="ml-2 btn rounded"
                            onClick={handleExcelDownload}
                            loading={load}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    );
}