import React, { useEffect, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { toast } from "react-toastify";
// import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../utils/apiUrls";
import { axiosInstance } from "../../utils/axiosInstance";
import { notify } from "../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { ExportToExcel, formatStandardDate, PreventSpecialCharacter, validateRequiredFields } from "../../utils/helpers";
import { CustomButton } from "../../components/UI/CustomButton";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";

const FeedbackReport = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [errors, setErrors] = useState({});
    const [masterTableData, setMasterTableData] = useState([]);
    const [centreList, setCentreList] = useState([]);
    const initialPayload = {

        FromDate: new Date(),
        ToDate: new Date(),
        CentreLabel: [],
        Centre: [],

    };

    const [payload, setPayload] = useState(initialPayload);

    const dateSelect = (date, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: date,
        }));
    };

    const handleSelectMultiChange = (select, name) => {
        console.log("select", select, name);

        const ids = select?.map((ele) => ele.value);

        setPayload((prev) => ({
            ...prev,
            [name]: ids,
            CentreLabel: select   // save full object
        }));
    };

    const getAccessCentres = async () => {
        axiosInstance
            .get("centre/getGlobalCentres")
            .then((res) => {
                let data = res.data.message;
                let CentreDataValue = data.map((ele) => {
                    return {
                        value: ele.CentreID,
                        label: ele.Centre,
                    };
                });
                setCentreList(CentreDataValue);
            })
            .catch((err) => {
                console.log("err", err);
            });
    };

    const handleExport = async () => {

        axiosInstance
            .post(apiUrls.SearchPatientFeedback,{
                fromDate: formatStandardDate(payload?.FromDate,"YYYY-MM-DD"),
                toDate: formatStandardDate(payload?.ToDate,"YYYY-MM-DD"),
                centreId: payload?.Centre || [],
            })
            .then((res) => {
                console.log("res",res); 
                const data = res?.data?.data || [];

                if (!data.length) {
                    notify("No data found");
                    return;
                }

                const excelData = data.map((item, index) => ({
                    "S.No": index + 1,
                    "Registration Date": item.RegistrationDate,
                    "Feedback Date": item.FeedbackReqDate,
                    "Visit No": item.VisitNo,
                    "Centre Name": item.CentreName,
                    "PName": item.PName,
                    "Age/Gender": `${item.Age} / ${item.Gender}`,
                    "Feedback Pts.": item.FeedbackPoints,
                    "Feedback Remarks": item.FeedbackRemarks,
                }));

                ExportToExcel(excelData, "Feedback_Report.xlsx");
            
            })
            .catch((err) => {
                console.log("err", err);
            });

    }

    useEffect(() => {
        getAccessCentres();
    }, []);

    console.log("Payload", payload);
    return (
        <>
            <Accordion
                name={t("Feedback Report")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row p-2">
                    <div className="col-xl-2 col-sm-4 col-md-2 col-12">
                        <DatePicker
                            name="FromDate"
                            id="FromDate"
                            value={payload?.FromDate}
                            onChange={date => dateSelect(date, "FromDate")}
                            maxDate={new Date(payload?.ToDate)}
                            placeholder=""
                            lable={t("From Date")}
                            className="custom-calendar"
                        />
                    </div>
                    <div className="col-xl-2 col-sm-4 col-md-2 col-12">
                        <DatePicker
                            name="ToDate"
                            id="ToDate"
                            value={payload?.ToDate}
                            onChange={date => dateSelect(date, "ToDate")}
                            maxDate={new Date()}
                            minDate={new Date(payload?.FromDate)}
                            placeholder=""
                            lable={t("To Date")}
                            className="custom-calendar"
                        />
                    </div>
                    <div className="col-xl-2 col-sm-4 col-md-2 col-12">
                        <SelectBoxWithCheckbox
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            options={centreList}
                            placeholder=" "
                            lable={t("Centre")}
                            className="required-fields"
                            id="Centre"
                            value={payload?.Centre}
                        />
                        {payload?.Centre?.length === 0 && (
                            <span className="error-message">{errors?.Centre}</span>
                        )}
                    </div>
                    <div className="col-xs-2 col-sm-2 col-md-2 d-flex">
                        <CustomButton text="Excel Export" icon="excel" onClick={handleExport} />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default FeedbackReport;
