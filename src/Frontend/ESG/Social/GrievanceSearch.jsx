
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
import { getAccessCentresReports, GetGlobalData } from "../../../utils/NetworkApi/commonApi"
import moment from "moment"

const GrievanceSearch = ({ onEdit }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [status, setStatus] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [payload, setPayload] = useState({
        centreId: [],
        employeeId: "",
        status: "",
        fromDate: new Date(),
        toDate: new Date(),
    })

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
        GetGlobalData(setStatus, "GrievanceStatus")
    }, [])

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
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

    const handleSearch = async () => {
        setLoading(true);
        const finalPayload = {
            centreId: payload?.centreId,
            employeeId: Number(payload.employeeId),
            status: payload?.status,
            fromDate: payload.fromDate,
            toDate: payload.toDate
        };
        try {
            const res = await axiosInstance.post("ESG/GetGrievances", finalPayload);
            if (res?.data?.success) {
                setTableData(res?.data?.message || [])
            } else {
                toast.error(res?.data?.message || t("Error while fetching data"));
                setTableData([])
            }
        } catch (error) {
            console.error("search Error:", error);
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
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={employees}
                        name="employeeId"
                        lable={t("Employee")}
                        id="employeeId"
                        removeIsClearable={true}
                        placeholderName={t("Select Employee")}
                        value={payload.employeeId}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={status}
                        name="status"
                        lable={t("Status")}
                        id="status"
                        removeIsClearable={true}
                        placeholderName={t("Select status")}
                        value={payload.status}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="fromDate"
                        id="fromDate"
                        className="custom-calendar"
                        lable={t("FromDate")}
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

            <Accordion title={t("Grievance Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Employee")}</th>
                                        <th>{t("Centre")}</th>
                                        <th>{t("Type/Method")}</th>
                                        <th>{t("Details")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Remarks")}</th>
                                        <th>{t("Date of Registration")}</th>
                                        <th>{t("Resolved Date")}</th>
                                        <th>{t("Created On")}</th>
                                        <th>{t("Updated By")}</th>
                                        <th>{t("Updated On")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData && tableData.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Employee")}>
                                                <div>{data?.EmployeeName}</div>
                                                <small className="text-muted">{data?.EmployeeCode || data?.EmployeeId}</small>
                                            </td>
                                            <td data-title={t("Centre")}>{data?.Centre}</td>
                                            <td data-title={t("Type/Method")}>
                                                <div><strong>{data?.IdentificationType}</strong></div>
                                                <small className="text-info">{data?.Method}</small>
                                            </td>
                                            <td data-title={t("Details")}>
                                                <div className="text-truncate" style={{ maxWidth: "150px" }} title={data?.Details}>
                                                    {data?.Details}
                                                </div>
                                            </td>
                                            <td data-title={t("Status")}>
                                                {data.Status}
                                            </td>
                                            <td data-title={t("Resolution")}>
                                                {data?.ResolutionRemarks || ""}
                                            </td>
                                            <td data-title={t("Date of Registration")}>
                                                {data?.RegistrationDate?.split(" ")[0]  || ""}
                                            </td>
                                            <td data-title={t("Resolved Date")}>
                                                {data?.ResolvedDate || ""}
                                            </td>
                                            <td data-title={t("Created On")}>
                                                {data?.dtEntry || ""}
                                            </td>
                                            <td data-title={t("Updated By")}>
                                                {data?.UpdatedByName || ""}
                                            </td>
                                            <td data-title={t("Updated On")}>
                                                {data?.dtUpdate || ""}
                                            </td>
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

export default GrievanceSearch;