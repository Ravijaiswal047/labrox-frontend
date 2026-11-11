import { useEffect, useState } from "react"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { useTranslation } from "react-i18next"
import DatePicker from "../../../components/formComponent/DatePicker"
import Input from "../../../components/formComponent/Input"
import { SearchButton } from "../../../components/UI/CustomButton"
import { axiosInstance } from "../../../utils/axiosInstance"
import moment from "moment"
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"
import Accordion from "../../../components/UI/Accordion"
import Tables from "../../../components/UI/customTable"
import NoRecordFound from "../../../components/formComponent/NoRecordFound"

const ConsumptionSearch = ({onEdit}) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [payload, setPayload] = useState({
        CentreId: [],
        ConsumptionType: "",
        ConsumptionMonth: "",
        FromDate: new Date(),
        ToDate: new Date(),
    })
    const [tableData, setTableData] = useState([])
    const [loading, setLoading] = useState(false)

    const consumptionTypeOptions = [
        { label: "Select", value: "" },
        { label: "Electricity", value: "ELECTRICITY" },
        { label: "Water", value: "WATER" }
    ]

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message;
            const CentreDataValue = data.map((ele) => {
                return {
                    value: ele.CentreID,
                    label: ele.Centre,
                };
            });
            let allValues = CentreDataValue.map((ele) => ele.value);
            setCentre(CentreDataValue);
        } catch (error) {
            console.log("Error while fetching centres");
        }
    };

    useEffect(() => {
        getAccessCentres()
    }, [])

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }
    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }))
    }
    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
    };

    const handleSearch = async () => {
        setLoading(true)
        const finalPayload = {
            centreId: payload.CentreId,
            fromDate: payload.FromDate,
            toDate: payload.ToDate,
            consumptionType: payload.ConsumptionType,
        }
        try {
            const res = await axiosInstance.post("ESG/GetUtilityConsumption", finalPayload);
            const data = res?.data;
            if (data?.success) {
                setTableData(data?.message || []);
            }
        } catch (error) {
            console.log("Error while fetching data", error)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    console.log("payload", payload)

    return (
        <>
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={consumptionTypeOptions}
                        name="ConsumptionType"
                        lable={t("Consumption Type")}
                        id="ConsumptionType"
                        removeIsClearable={true}
                        placeholderName={t("Consumption Type")}
                        value={payload.ConsumptionType}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="All Centre"
                        options={centre}
                        value={payload?.CentreId}
                        name="CentreId"
                        id="CentreId"
                        onChange={handleMultiSelectChange}
                        lable={t("Select Centre")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="FromDate"
                        id="FromDate"
                        lable={t("FromDate")}
                        value={payload.FromDate}
                        onChange={handleDateChange}
                        maxDate={payload?.ToDate}
                        className="custom-calendar"
                    />
                </div>
                <div className="col-sm-2">
                    <DatePicker
                        name="ToDate"
                        id="ToDate"
                        lable={t("ToDate")}
                        className="custom-calendar"
                        value={payload.ToDate}
                        onChange={handleDateChange}
                        minDate={payload.FromDate}
                        maxDate={new Date()}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <SearchButton
                        text={"Search"}
                        onClick={handleSearch}
                    />
                </div>
            </div>
            <Accordion title={t("Search Data")} defaultValue={true}>
                {tableData.length > 0 ? (
                <div className="row px-1">
                    <div className="col-12">
                        <Tables>
                            <thead className="cf">
                                <tr>
                                    <th>{t("S.No")}</th>
                                    <th>{t("Centre")}</th>
                                    <th>{t("Consumption Type")}</th>
                                    <th>{t("ConsumptionMonth")}</th>
                                    <th>{t("Units")}</th>
                                    <th>{t("Created At")}</th>
                                    <th>{t("Updated At")}</th>
                                    <th>{t("Updated By")}</th>
                                    <th>{t("Action")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData && tableData.map((data, index) => (
                                    <tr key={index}>
                                       <td data-title={t("S.No")}>{index + 1}</td>
                                       <td data-title={t("Centre")}>{data?.CentreName}</td>
                                       <td data-title={t("Consumption Type")}>{data?.ConsumptionType}</td>
                                       <td data-title={t("Consumption Month")}>
                                         {moment(data?.ConsumptionMonth, "DD-MMM-YY hh:mm A").format("MMM YYYY")}
                                        </td>
                                        <td data-title={t("Units")}>{data?.Units + " " + (
                                            data?.UnitType === "OTHER"
                                                ? data?.OtherUnitType
                                                : data?.UnitType
                                        )}</td>
                                       <td data-title={t("Created At")}>{data?.dtEntry}</td>
                                       <td data-title={t("Updated At")}>{data?.dtUpdate}</td>
                                       <td data-title={t("Updated By")}>{data?.UpdatedByName}</td>
                                       <td data-title={t("Action")}>
                                            <button 
                                                className="btn btn-xs btn-primary" 
                                                onClick={() => onEdit(data)}
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
    )
}

export default ConsumptionSearch