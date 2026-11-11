
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import { SearchButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"
import Accordion from "../../../components/UI/Accordion"
import Tables from "../../../components/UI/customTable"
import NoRecordFound from "../../../components/formComponent/NoRecordFound"
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi"

const HealthSafetyTrainingSearch = ({ onEdit }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [payload, setPayload] = useState({
        centreId: [],
        employeeId: [],
        trainingName: "",
        fromDate: new Date(),
        toDate: new Date(),
    })
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])

    const getEmployees = async () => {
        try {
            const res = await axiosInstance.post("Employee/getEmployee", {
                employeeID: 0,
                employeeName: ""
            });
            const data = res.data.message;
            const employeesDataValue = data.map((ele) => {
                return {
                    value: ele.EmployeeID,
                    label: ele.EmployeeName,
                };
            });
            setEmployees(employeesDataValue);
        } catch (error) {
            console.log("Error while fetching employees");
        }
    };

    useEffect(() => {
         getAccessCentresReports(setCentre)
        getEmployees();
    }, [])

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

    const truncateList = (items, max = 1) => {
        if (!items || items.length === 0) return "-";
        const shown = items.slice(0, max).join(", ");
        return items.length > max ? `${shown} +${items.length - max} more` : shown;
    };

    const handleSearch = async () => {
        setLoading(true);
        const finalPayload = {
            centreId: payload?.centreId,
            employeeId: payload.employeeId,
            trainingName: payload?.trainingName,
            fromDate: payload.fromDate,
            toDate: payload.toDate
        };
        try {
            const res = await axiosInstance.post("ESG/GetTrainingList", finalPayload);
            const data = res?.data;
            if (data?.success) {
                setTableData(data?.message || [])
            } else {
                toast.error(res?.data?.message || t("Error while saving data"));
                setTableData([])
            }
        } catch (error) {
            console.error("Save Error:", error);
            toast.error(t("Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="row px-2 py-2">
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
                {/* asdlfkfdlkl;sfk;ljlk */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="Employee"
                        options={employees}
                        value={payload.employeeId}
                        name="employeeId"
                        id="employeeId"
                        onChange={handleMultiSelectChange}
                        lable={t("Select Employee")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="trainingName"
                        id="trainingName"
                        lable={"Training Name"}
                        value={payload?.trainingName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="fromDate"
                        id="fromDate"
                        lable={t("FromDate")}
                        className="custom-calendar"
                        value={payload?.fromDate}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="toDate"
                        id="toDate"
                        className="custom-calendar"
                        lable={t("ToDate")}
                        value={payload?.toDate}
                        onChange={handleDateChange}
                        minDate={payload?.fromDate}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <SearchButton
                        text={"Search"}
                        onClick={handleSearch}
                        disabled={loading}
                    />
                </div>
            </div>

            <Accordion title={t("Training Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        
                                        <th>{t("Centre")}</th>
                                        <th>{t("Employee")}</th>
                                        <th>{t("Training Name")}</th>                           
                                        <th>{t("Trainer")}</th>
                                        <th>{t("Training Mode")}</th>
                                        <th>{t("Completion Date")}</th>
                                        <th>{t("Created On")}</th>
                                        <th>{t("Created By")}</th>
                                        {/* <th>{t("Updated On")}</th>
                                        <th>{t("Updated By")}</th> */}
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData && tableData.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td
                                                data-title={t("Centre")}
                                                title={data?.centres?.join("\n")}
                                                style={{ cursor: "default" }}
                                            >
                                                {truncateList(data?.centres)}
                                            </td>
                                            <td
                                                data-title={t("Employee")}
                                                title={data?.employeeNames?.join("\n")}
                                                style={{ cursor: "default" }}
                                            >
                                                {truncateList(data?.employeeNames)}
                                            </td>
                                            <td data-title={t("Training Name")}>
                                                {data?.trainingName}
                                            </td>
                                            <td data-title={t("Trainer")}>
                                                {data?.trainerType || ""}
                                            </td>
                                            <td data-title={t("Training Mode")}>
                                                {data?.trainingMode || ""}
                                            </td>
                                            <td data-title={t("Completion Date")}>
                                                {data?.completionDate?.split(" ")[0]}
                                            </td>
                                            <td data-title={t("Created On")}>
                                                {data?.dtEntry}
                                            </td>
                                            <td data-title={t("Created By")}>
                                                {data?.createdByName || ""}
                                            </td>
                                            {/* <td data-title={t("Updated On")}>
                                                {data?.dtUpdate || ""}
                                            </td>
                                            <td data-title={t("Updated By")}>
                                                {data?.updatedByName || ""}
                                            </td> */}
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

export default HealthSafetyTrainingSearch;